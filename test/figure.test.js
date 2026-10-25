import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { claims } from '../site/js/data.js';
import { elementById } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const s02 = elementById(html, 's02');
const svg = (s02.match(/<svg[\s\S]*?<\/svg>/) || [''])[0];
const COMPONENTS = ['generation', 'review', 'rework', 'tooling', 'rights', 'storage'];
const X0 = 240;
const W = 600;

const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}="([^"]*)"`)) || [])[1];

test('s02 has exactly one accessible svg with title and desc', () => {
  assert.equal((s02.match(/<svg\b/g) || []).length, 1);
  assert.match(svg, /<svg role="img" aria-labelledby="f2-t f2-d" viewBox="0 0 960 \d+" class="fig">/);
  assert.match(svg, /<title id="f2-t">[^<]+<\/title>/);
  assert.match(svg, /<desc id="f2-d">[^<]+<\/desc>/);
});

test('four panels in order output, cost, cpcm, ai', () => {
  const panels = [...svg.matchAll(/<g data-panel="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(panels, ['output', 'cost', 'cpcm', 'ai']);
});

function panelMax(panel) {
  if (panel === 'output') return claims['cm-scaled'].value;
  if (panel === 'cost') return claims['cpa-base'].value;
  if (panel === 'cpcm') return claims['cpcm-base'].value;
  return claims['ai-spend-scaled'].value;
}

function panelBlocks() {
  const parts = svg.split(/<g data-panel="/).slice(1);
  return parts.map((p) => ({ panel: p.slice(0, p.indexOf('"')), body: p }));
}

test('every bar names a claim and its width is value / panel max * 600', () => {
  let n = 0;
  for (const { panel, body } of panelBlocks()) {
    const rects = [...body.matchAll(/<rect [^>]*data-bar="[^"]+"[^>]*\/>/g)].map((m) => m[0]);
    const cursor = {};
    for (const r of rects) {
      n += 1;
      const id = attr(r, 'data-bar');
      const c = claims[id];
      assert.ok(c, `unknown claim ${id}`);
      const w = Number(attr(r, 'width'));
      assert.ok(Math.abs(w - (c.value / panelMax(panel)) * W) <= 0.5, `${id} width ${w}`);
      assert.equal(attr(r, 'height'), '24');
      const side = id.endsWith('-base') ? 'base' : 'scaled';
      const x = Number(attr(r, 'x'));
      if (panel === 'cost') {
        cursor[side] = cursor[side] ?? X0;
        assert.ok(Math.abs(x - cursor[side]) <= 0.5, `${id} x ${x} expected ${cursor[side]}`);
        cursor[side] += w;
      } else {
        assert.equal(x, X0, `${id} x`);
      }
    }
  }
  assert.equal(n, 18);
});

test('cost segments appear in component order for each side', () => {
  const cost = panelBlocks().find((p) => p.panel === 'cost').body;
  for (const side of ['base', 'scaled']) {
    const ids = [...cost.matchAll(/data-bar="(cpa-[a-z]+-(?:base|scaled))"/g)].map((m) => m[1]).filter((i) => i.endsWith(side));
    assert.deepEqual(ids, COMPONENTS.map((c) => `cpa-${c}-${side}`));
  }
});

test('value labels equal the claim display', () => {
  const labels = [...svg.matchAll(/<text [^>]*data-fig="([^"]+)"[^>]*>([^<]*)<\/text>/g)];
  assert.ok(labels.length >= 6);
  for (const [, id, text] of labels) assert.equal(text, claims[id].display, id);
});

test('component claims sum to cost per asset', () => {
  for (const side of ['base', 'scaled']) {
    const sum = COMPONENTS.reduce((a, c) => a + claims[`cpa-${c}-${side}`].value, 0);
    assert.ok(Math.abs(sum - claims[`cpa-${side}`].value) <= 0.03, side);
  }
});

test('figcaption follows the svg and states per-panel scales', () => {
  assert.match(s02, /<figcaption><b>Figure 1<\/b>[\s\S]*Each panel has its own scale[\s\S]*<\/figcaption>/);
});

test('always-visible data table with all 20 figure ids and one governing chip per row', () => {
  const after = s02.slice(s02.indexOf('</figure>'));
  const table = (after.match(/<table[\s\S]*?<\/table>/) || [''])[0];
  assert.ok(table, 'no table after the figure');
  assert.ok(!/<details/.test(s02));
  assert.match(table, /<caption>[^<]+<\/caption>/);
  const head = table.match(/<thead>([\s\S]*?)<\/thead>/)[1];
  const cols = [...head.matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.equal(cols.length, 4);
  assert.equal(cols[3], 'Grade');
  const rows = [...table.slice(table.indexOf('<tbody>')).matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  assert.equal(rows.length, 10);
  const all = [];
  for (const row of rows) {
    assert.match(row, /<th scope="row"/);
    const figs = [...row.matchAll(/<span data-fig="([^"]+)">([^<]*)<\/span>/g)];
    assert.equal(figs.length, 2);
    const chips = [...row.matchAll(/<a class="chip c-m" href="#([^"]+)">Modelled<\/a>/g)];
    assert.equal(chips.length, 1, 'one chip per row');
    assert.equal((row.match(/class="chip /g) || []).length, 1);
    const lastTd = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].pop()[1];
    assert.ok(lastTd.includes('class="chip '), 'chip is in the last cell');
    for (const m of row.matchAll(/<td class="num">([\s\S]*?)<\/td>/g)) assert.ok(!m[1].includes('class="chip'), 'no chip in td.num');
    for (const [, id, text] of figs) {
      assert.equal(text, claims[id].display, id);
      assert.equal(claims[id].ref, chips[0][1], `${id}: row chip ref`);
      all.push(id);
    }
  }
  assert.equal(all.length, 20);
  const wanted = ['cm', 'cpa', 'cpcm', 'ai-spend', ...COMPONENTS.map((c) => `cpa-${c}`)];
  for (const w of wanted) for (const side of ['base', 'scaled']) {
    assert.ok(table.includes(`data-fig="${w}-${side}"`), `${w}-${side}`);
  }
});

test('storage is too small to draw and is pointed at the table; the caption flags sideways scroll', () => {
  assert.match(svg, /<text [^>]*>[^<]*too small to draw; see table[^<]*<\/text>/);
  assert.match(s02, /<figcaption>[\s\S]*Scroll sideways on small screens\.[\s\S]*<\/figcaption>/);
});

test('svg has no style attributes, var() fills, scripts or external hrefs', () => {
  assert.ok(!/ style=/.test(svg));
  assert.ok(!/fill="var\(/.test(svg));
  assert.ok(!/<script|foreignObject|href=/.test(svg));
});

// Code review WR-05: the <desc> is what screen readers announce, so its numbers
// must come from data.js like the bars and labels do.
test('svg desc numbers equal the panel claim displays and nothing else', () => {
  const desc = svg.match(/<desc id="f2-d">([^<]+)<\/desc>/)[1];
  const ids = ['cm-base', 'cm-scaled', 'cpa-base', 'cpa-scaled', 'cpcm-base', 'cpcm-scaled', 'ai-spend-base', 'ai-spend-scaled'];
  const displays = ids.map((id) => claims[id].display);
  for (const [i, d] of displays.entries()) assert.ok(desc.includes(d), `desc missing ${ids[i]} (${d})`);
  const tokens = desc.match(/\$?\d[\d,]*(?:\.\d+)?/g) || [];
  assert.equal(tokens.length, ids.length, `desc numerals: ${tokens.join(' ')}`);
  for (const t of tokens) assert.ok(displays.includes(t), `desc numeral ${t} is not a panel claim display`);
});

// Code review WR-09: neighbouring cost segments differ by texture, not grey shade alone.
test('alternate cost segments and their legend swatches are hatched, the others solid', () => {
  const segs = [...svg.matchAll(/<rect class="seg seg-(\d)"([^>]*)\/>/g)];
  assert.equal(segs.length, 17, '12 bar segments plus 5 legend swatches (no storage swatch)');
  assert.ok(!/<rect class="seg seg-6"(?![^>]*data-bar)[^>]*\/>/.test(svg), 'storage legend swatch is back');
  for (const [, n, rest] of segs) {
    if (Number(n) % 2 === 0) {
      assert.ok(rest.includes(`fill="url(#hatch-${n})"`), `seg-${n} not hatched`);
      assert.match(svg, new RegExp(`<pattern id="hatch-${n}"[^>]*>\\s*<rect class="hatch-bg-${n}"`));
    } else {
      assert.ok(!/fill=/.test(rest), `seg-${n} should be solid`);
    }
  }
});
