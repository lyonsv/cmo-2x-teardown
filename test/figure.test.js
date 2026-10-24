import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { claims } from '../site/js/data.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const s02 = html.match(/<section id="s02"[\s\S]*?<\/section>/)[0];
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

test('three panels in order output, cost, ai', () => {
  const panels = [...svg.matchAll(/<g data-panel="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(panels, ['output', 'cost', 'ai']);
});

function panelMax(panel) {
  if (panel === 'output') return claims['output-per-head-scaled'].value;
  if (panel === 'cost') return claims['cpa-base'].value;
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
  assert.equal(n, 16);
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

test('always-visible data table with all 18 figure ids, each with a chip', () => {
  const after = s02.slice(s02.indexOf('</figure>'));
  const table = (after.match(/<table[\s\S]*?<\/table>/) || [''])[0];
  assert.ok(table, 'no table after the figure');
  assert.ok(!/<details/.test(s02));
  assert.match(table, /<caption>[^<]+<\/caption>/);
  assert.match(table, /<th scope="col"/);
  assert.match(table, /<th scope="row"/);
  const ids = [...table.matchAll(/<span data-fig="([^"]+)">([^<]*)<\/span>(\s*<a class="chip c-m" href="#[^"]+">Modelled<\/a>)?/g)];
  assert.equal(ids.length, 18);
  for (const [, id, text, chip] of ids) {
    assert.equal(text, claims[id].display, id);
    assert.ok(chip, `${id} chip`);
  }
  const wanted = ['output-per-head', 'cpa', 'ai-spend', ...COMPONENTS.map((c) => `cpa-${c}`)];
  for (const w of wanted) for (const side of ['base', 'scaled']) {
    assert.ok(table.includes(`data-fig="${w}-${side}"`), `${w}-${side}`);
  }
});

test('svg has no style attributes, var() fills, scripts or external hrefs', () => {
  assert.ok(!/ style=/.test(svg));
  assert.ok(!/fill="var\(/.test(svg));
  assert.ok(!/<script|foreignObject|href=/.test(svg));
});
