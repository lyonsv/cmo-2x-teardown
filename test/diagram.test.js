import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const strip = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

// Figure number -> section. 02-03 adds 4: 's05', 02-05 adds 5: 's06' and 6: 's07', 02-06 adds 7: 's08'.
const EXPECTED_FIGURES = { 2: 's03', 3: 's03', 4: 's05', 5: 's06', 6: 's07', 7: 's08' };

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
}

// Code review IN-05: a figure belongs to the v1 block whose element actually contains
// it, so a figure added after a block closes is not credited to that block.
const V1_SPANS = Array.from({ length: 15 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`).map((id) => {
  const el = elementById(html, id);
  const at = html.indexOf(el);
  return { id, start: at, end: at + el.length };
});
const containingV1 = (pos) => (V1_SPANS.filter((x) => pos >= x.start && pos < x.end).sort((a, b) => b.start - a.start)[0] || { id: null }).id;

function figures() {
  const out = [];
  for (const m of html.matchAll(/<figure>[\s\S]*?<\/figure>/g)) {
    if (!m[0].includes('<svg class="fig-d"')) continue;
    const svg = m[0].match(/<svg class="fig-d"[\s\S]*?<\/svg>/)[0];
    const n = Number(svg.match(/<title id="fd(\d+)-t"/)[1]);
    const sec = containingV1(m.index);
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

// Code review WR-08: Figure 6's text equivalent is the tier table directly after
// it, so the table must carry every node's tier, example and approver, and the
// "auto above, human below" divider must agree with the Who approves column.
function figure6MatchesTierTable(f) {
  const after = html.slice(f.index + f.html.length);
  const m = after.match(/^\s*<div class="table-scroll"[^>]*>\s*<table>\s*<caption>Approval tiers \(illustrative\)<\/caption>[\s\S]*?<\/table>/);
  assert.ok(m, 'the tier table must be the next element after Figure 6');
  const rows = m[0].match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g);
  const divider = Number(attr(f.svg.match(/<line class="edge edge-soft"[^>]*>/)[0], 'y1'));
  const stems = (t) => (t.toLowerCase().match(/[a-z]+/g) || []).filter((w) => w.length >= 4 && w !== 'gate').map((w) => w.slice(0, 5));
  const ns = nodes(f.svg);
  assert.equal(ns.length, rows.length);
  ns.forEach((n, i) => {
    const [title, sub] = [...n.html.matchAll(/<tspan\b[^>]*>([\s\S]*?)<\/tspan>/g)].map((x) => decode(x[1]));
    const tier = title.match(/^(T[0-3]) · (.+)$/);
    assert.ok(tier, `node ${i} title ${title}`);
    const row = rows.find((r) => r.includes(`<th scope="row" class="tier">${tier[1]}</th>`));
    assert.ok(row, `${tier[1]} row`);
    const [examples, who] = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((x) => strip(x[1]).toLowerCase());
    for (const w of stems(tier[2])) assert.ok(examples.includes(w), `${tier[1]}: node says "${tier[2]}" but the table examples lack "${w}"`);
    for (const w of stems(sub)) assert.ok(who.includes(w), `${tier[1]}: node says "${sub}" but Who approves lacks "${w}"`);
    const y = Number(attr(n.html.match(/<rect\b[^>]*>/)[0], 'y'));
    if (i < 2) {
      assert.ok(y < divider, `${tier[1]} sits above the auto/human divider`);
      assert.ok(/sample/.test(who), `${tier[1]} clears on a sampled auto path`);
    } else {
      assert.ok(y > divider, `${tier[1]} sits below the auto/human divider`);
      assert.ok(/human/.test(who) && !/sample/.test(who), `${tier[1]} always reaches a person`);
    }
  });
}

const STEPS_LEVEL = { 2: 4, 3: 4, 4: 3, 5: 3, 7: 3 };

test('visible text equivalent', () => {
  for (const f of figures()) {
    const ol = f.html.match(/<ol class="fig-steps">([\s\S]*?)<\/ol>/);
    if (f.n === 6) {
      assert.ok(/see the table/i.test(strip(f.html.match(/<figcaption>[\s\S]*?<\/figcaption>/)[0])));
      figure6MatchesTierTable(f);
      continue;
    }
    // IN-03: headings name their figure so a screen-reader heading list can tell them apart.
    // Code review WR-04: steps headings sit one level below their block heading:
    // h4 inside a hosted body block, h3 directly under an appendix h2.
    const lvl = STEPS_LEVEL[f.n];
    assert.ok(f.html.includes(`<h${lvl} class="steps-h">Steps in Figure ${f.n}</h${lvl}>`), `Figure ${f.n} steps heading`);
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

// IN-06: the page's numeric gate strips every <svg>, so diagram text (labels,
// <title>, <desc>) is checked here: tier names aside, it carries no numerals.
test('diagram text, titles and descriptions carry no digits', () => {
  for (const f of figures()) {
    const texts = [...f.svg.matchAll(/<(text|title|desc)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => strip(m[2]));
    assert.ok(texts.length > 0, `Figure ${f.n} has text`);
    for (const t of texts) assert.ok(!/\d/.test(t.replace(/\bT[0-3]\b/g, ' ')), `Figure ${f.n} text contains digits: ${t}`);
  }
});

test('Figure 4 has a two-way fork', () => {
  const f = figures().find((x) => x.n === 4);
  assert.ok(f, 'Figure 4 present');
  const forks = nodes(f.svg).filter((n) => /width="112"/.test(n.html));
  assert.equal(forks.length, 2);
  const pos = forks.map((n) => {
    const r = n.html.match(/<rect\b[^>]*>/)[0];
    return { x: Number(attr(r, 'x')), y: Number(attr(r, 'y')), text: strip(n.html) };
  });
  const left = pos.find((p) => p.x === 30);
  const right = pos.find((p) => p.x === 158);
  assert.ok(left && right, 'forks at x 30 and 158');
  assert.equal(left.y, right.y);
  assert.match(left.text, /auto/i);
  assert.match(right.text, /human/i);
  assert.ok(/<line class="edge edge-review"[^>]*x2="86"/.test(f.svg) || /<(line|path) class="edge edge-review"[^>]*(x2="86"|L86|86 )/.test(f.svg), 'auto branch edge is edge-review');
});

test('Figure 5 loop', () => {
  const f = figures().find((x) => x.n === 5);
  assert.ok(f, 'Figure 5 present');
  assert.ok(f.svg.includes('<path class="edge edge-review'), 'review loop path');
  const d = f.svg.match(/<path class="edge edge-review[^>]*\sd="([^"]+)"/)[1];
  assert.ok((d.match(/[ML]/g) || []).length >= 3, 'loop path has two or more segments');
  assert.ok(strip(f.svg).includes('never lower'));
  // IN-10: "could not check" escalates straight from the agent, not only via Fix.
  const direct = [...f.svg.matchAll(/<path class="edge edge-review"[^>]*\sd="M30 (\d+) [^"]* L28 (\d+)"/g)];
  assert.ok(direct.some(([, y1, y2]) => Number(y1) > 72 && Number(y1) < 112 && Number(y2) > 200 && Number(y2) < 256), 'edge from the review agent to Escalate');
});

test('Figure 6 ladder', () => {
  const f = figures().find((x) => x.n === 6);
  assert.ok(f, 'Figure 6 present');
  const ns = nodes(f.svg);
  assert.equal(ns.length, 4);
  const ys = [];
  ns.forEach((n, i) => {
    const r = n.html.match(/<rect\b[^>]*>/)[0];
    assert.equal(Number(attr(r, 'width')), 240);
    ys.push(Number(attr(r, 'y')));
    const t = strip(n.html.match(/<tspan[^>]*class="node-t"[^>]*>([\s\S]*?)<\/tspan>/)[1]);
    assert.ok(t.startsWith(`T${i}`), `node ${i} is ${t}`);
  });
  assert.deepEqual(ys, [...ys].sort((a, b) => a - b));
  assert.ok(/see the table/i.test(strip(f.html.match(/<figcaption>[\s\S]*?<\/figcaption>/)[0])));
});

test('all six diagrams present', () => {
  assert.deepEqual(figures().map((f) => f.n), [2, 3, 4, 5, 6, 7]);
});

test('Figure 7 is a loop', () => {
  const f = figures().find((x) => x.n === 7);
  assert.ok(f, 'Figure 7 present');
  assert.ok(/<path class="edge edge-(soft|review)/.test(f.svg), 'return path');
  const titles = nodes(f.svg).map((n) => strip(n.html.match(/<tspan[^>]*class="node-t"[^>]*>([\s\S]*?)<\/tspan>/)[1]).toLowerCase());
  assert.ok(titles.some((t) => t.includes('ground truth')), 'Ground truth node');
  assert.ok(titles.some((t) => t.includes('change gate')), 'Change gate node');
});
