import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const strip = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

// Figure number -> section. 02-03 adds 4: 's05', 02-05 adds 5: 's06' and 6: 's07', 02-06 adds 7: 's08'.
const EXPECTED_FIGURES = { 2: 's03', 3: 's03' };

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
}

function figures() {
  const out = [];
  for (const m of html.matchAll(/<figure>[\s\S]*?<\/figure>/g)) {
    if (!m[0].includes('<svg class="fig-d"')) continue;
    const svg = m[0].match(/<svg class="fig-d"[\s\S]*?<\/svg>/)[0];
    const n = Number(svg.match(/<title id="fd(\d+)-t"/)[1]);
    const before = html.slice(0, m.index);
    const sec = [...before.matchAll(/<section id="(s\d\d)"/g)].pop()[1];
    out.push({ html: m[0], svg, n, sec, index: m.index });
  }
  return out;
}

test('expected diagrams present, numbered in page order, in the right section', () => {
  const figs = figures();
  assert.deepEqual(figs.map((f) => f.n), Object.keys(EXPECTED_FIGURES).map(Number));
  for (const f of figs) {
    assert.equal(f.sec, EXPECTED_FIGURES[f.n], `Figure ${f.n} section`);
    assert.ok(f.html.includes(`<figcaption><b>Figure ${f.n}</b>`), `Figure ${f.n} caption`);
  }
});

test('every id on the page is unique', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) {
    assert.ok(!seen.has(id), `duplicate id ${id}`);
    seen.add(id);
  }
});

test('svg attributes', () => {
  for (const f of figures()) {
    const open = f.svg.match(/<svg[^>]*>/)[0];
    assert.equal(attr(open, 'role'), 'img');
    assert.equal(attr(open, 'aria-labelledby'), `fd${f.n}-t fd${f.n}-d`);
    const vb = attr(open, 'viewBox').match(/^0 0 300 (\d+)$/);
    assert.ok(vb, `Figure ${f.n} viewBox`);
    const h = Number(vb[1]);
    assert.equal(h % 4, 0, 'viewBox height multiple of 4');
    assert.ok(h >= 240 && h <= 560, `viewBox height ${h}`);
    const title = f.svg.match(new RegExp(`<title id="fd${f.n}-t">([^<]+)</title>`));
    const desc = f.svg.match(new RegExp(`<desc id="fd${f.n}-d">([^<]+)</desc>`));
    assert.ok(title && title[1].trim(), 'title');
    assert.ok(desc && desc[1].trim(), 'desc');
    const markers = [...f.svg.matchAll(/<marker[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    for (const id of markers) assert.ok([`fd${f.n}-arrow`, `fd${f.n}-arrow-review`].includes(id), `marker id ${id}`);
  }
});

test('svg hygiene', () => {
  for (const f of figures()) {
    for (const bad of [' style=', 'font-size', 'font-family', 'transform', '<script', 'href=', 'xlink:href', 'foreignObject', 'fill="var(', '<image', 'data:']) {
      assert.ok(!f.svg.includes(bad), `Figure ${f.n} contains ${bad}`);
    }
  }
});

function nodes(svg) {
  return [...svg.matchAll(/<g class="(node(?: node-review)?)">([\s\S]*?)<\/g>/g)].map((m) => ({ cls: m[1], html: m[2] }));
}

test('nodes fit', () => {
  for (const f of figures()) {
    const ns = nodes(f.svg);
    assert.ok(ns.length >= 4, `Figure ${f.n} has nodes`);
    for (const n of ns) {
      const rects = n.html.match(/<rect\b[^>]*>/g) || [];
      assert.equal(rects.length, 1, 'one rect per node');
      const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((a) => Number(attr(rects[0], a)));
      assert.ok((w === 240 && x === 30) || (w === 112 && (x === 30 || x === 158)), `Figure ${f.n} node geometry x=${x} w=${w}`);
      for (const v of [y, w, h]) assert.equal(v % 4, 0, `Figure ${f.n} coordinate ${v}`);
      const tspans = [...n.html.matchAll(/<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/g)];
      const L = tspans.length;
      assert.ok(L === 2 || L === 3, `Figure ${f.n} node lines ${L}`);
      assert.equal(h, L * 16 + 8, `Figure ${f.n} node height for ${L} lines`);
      const max = w === 240 ? 28 : 12;
      for (const [i, t] of tspans.entries()) {
        const text = decode(t[2]);
        assert.ok(text.length <= max, `Figure ${f.n} line too long (${text.length}>${max}): ${text}`);
        if (i === 0) assert.ok((attr(`<x ${t[1]}>`, 'class') || '').split(' ').includes('node-t'), 'first tspan node-t');
      }
    }
  }
});

test('accent discipline', () => {
  for (const f of figures()) {
    const els = [...f.svg.matchAll(/<(line|path|rect|g)\b[^>]*>/g)].map((m) => m[0]);
    const reviewMarker = `url(#fd${f.n}-arrow-review)`;
    const plainMarker = `url(#fd${f.n}-arrow)`;
    for (const e of els) {
      const cls = (attr(e, 'class') || '').split(/\s+/);
      const me = attr(e, 'marker-end');
      if (me === reviewMarker) assert.ok(cls.includes('edge-review'), `review marker without edge-review: ${e}`);
      if (cls.includes('edge-review')) assert.ok(me === null || me === reviewMarker, `edge-review with wrong marker: ${e}`);
      if (me === plainMarker) assert.ok(!cls.includes('edge-review'), `plain marker on review edge: ${e}`);
    }
    const reviewNodes = nodes(f.svg).filter((n) => n.cls.includes('node-review'));
    assert.ok(reviewNodes.length >= 1, `Figure ${f.n} needs a node-review`);
    for (const n of reviewNodes) assert.match(strip(n.html), /review|gate/i);
    // the review marker is referenced only by edge-review elements
    const refs = (f.svg.match(/marker-end="url\(#fd\d+-arrow-review\)"/g) || []).length;
    const reviewEdges = els.filter((e) => (attr(e, 'class') || '').includes('edge-review') && attr(e, 'marker-end') === reviewMarker).length;
    assert.equal(refs, reviewEdges);
  }
});

test('visible text equivalent', () => {
  for (const f of figures()) {
    assert.ok(f.html.includes('<h3 class="steps-h">Steps in this figure</h3>'), `Figure ${f.n} steps heading`);
    const ol = f.html.match(/<ol class="fig-steps">([\s\S]*?)<\/ol>/);
    if (f.n === 6) {
      assert.ok(/see the table/i.test(strip(f.html.match(/<figcaption>[\s\S]*?<\/figcaption>/)[0])));
      const sec = html.slice(f.index, html.indexOf('</section>', f.index));
      assert.ok(sec.includes('<table>'), 'Figure 6 section has a table');
      continue;
    }
    assert.ok(ol, `Figure ${f.n} ol.fig-steps`);
    const items = ol[1].match(/<li>/g) || [];
    assert.ok(items.length >= 3, 'at least 3 steps');
    const list = strip(ol[1]).toLowerCase();
    for (const n of nodes(f.svg)) {
      const t = strip(n.html.match(/<tspan[^>]*class="node-t"[^>]*>([\s\S]*?)<\/tspan>/)[1]).toLowerCase();
      assert.ok(list.includes(t), `Figure ${f.n} step list omits "${t}"`);
    }
  }
});

test('steps and captions carry no digits', () => {
  for (const f of figures()) {
    const ol = (f.html.match(/<ol class="fig-steps">[\s\S]*?<\/ol>/) || [''])[0];
    const cap = f.html.match(/<figcaption>[\s\S]*?<\/figcaption>/)[0].replace(`<b>Figure ${f.n}</b>`, '');
    assert.ok(!/\d/.test(strip(ol)), `Figure ${f.n} steps contain digits`);
    assert.ok(!/\d/.test(strip(cap)), `Figure ${f.n} caption contains digits`);
  }
});
