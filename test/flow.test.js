// The content supply chain diagram (Figure 3, plan 07-04): two inline SVG variants switched by CSS,
// one visible text equivalent. Mirrors the hygiene rules of test/diagram.test.js for the fig-flow class.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { strip, decode } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../site/assets/style.css', import.meta.url), 'utf8');

const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`)); return m ? m[1] : null; };

const figs = [...html.matchAll(/<figure>[\s\S]*?<\/figure>/g)].map((m) => m[0]).filter((f) => f.includes('class="fig-flow'));
assert.equal(figs.length, 1, 'exactly one figure holds the flow diagram');
const fig = figs[0];
const wide = fig.match(/<svg class="fig-flow flow-wide"[\s\S]*?<\/svg>/)[0];
const narrow = fig.match(/<svg class="fig-flow flow-narrow"[\s\S]*?<\/svg>/)[0];
const ol = fig.match(/<ol class="fig-steps"[^>]*>[\s\S]*?<\/ol>/)[0];
const caption = fig.match(/<figcaption>[\s\S]*?<\/figcaption>/)[0];

const STAGES = ['Objective', 'Research and plan', 'Brief', 'Source assets', 'Adapt and localise', 'Review and approve', 'Publish and activate', 'Measure', 'Optimise and refresh'];

function groups(svg, cls) {
  return [...svg.matchAll(new RegExp(`<g class="${cls}">([\\s\\S]*?)</g>`, 'g'))].map((m) => m[1]);
}
const lines = (g) => [...g.matchAll(/<tspan\b[^>]*>([\s\S]*?)<\/tspan>/g)].map((m) => decode(m[1]));

test('one wide and one narrow variant, steps list inside the same figure and after both', () => {
  assert.equal((html.match(/class="fig-flow flow-wide"/g) || []).length, 1);
  assert.equal((html.match(/class="fig-flow flow-narrow"/g) || []).length, 1);
  assert.ok(attr(wide.match(/<svg[^>]*>/)[0], 'viewBox') === '0 0 720 500');
  const vb = attr(narrow.match(/<svg[^>]*>/)[0], 'viewBox').match(/^0 0 300 (\d+)$/);
  assert.ok(vb, 'narrow viewBox is 300 wide');
  const h = Number(vb[1]);
  assert.ok(h % 4 === 0 && h >= 840 && h <= 1000, `narrow height ${h}`);
  assert.ok(fig.indexOf(ol) > fig.indexOf(narrow) && fig.indexOf(narrow) > fig.indexOf(wide), 'order wide, narrow, steps');
  assert.ok(!/class="fig-flow[^"]*fig-d|class="fig-d[^"]*fig-flow/.test(html), 'no fig-d class on the flow svgs');
});

test('each svg is an image with its own title and description, ids unique page-wide', () => {
  for (const [svg, k] of [[wide, 'w'], [narrow, 'n']]) {
    const open = svg.match(/<svg[^>]*>/)[0];
    assert.equal(attr(open, 'role'), 'img');
    assert.equal(attr(open, 'aria-labelledby'), `ff1${k}-t ff1${k}-d`);
    assert.ok(new RegExp(`<title id="ff1${k}-t">[^<]+</title>`).test(svg));
    assert.ok(new RegExp(`<desc id="ff1${k}-d">[^<]+</desc>`).test(svg));
    const markers = [...svg.matchAll(/<marker[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(markers.sort(), [`ff1${k}-arrow`, `ff1${k}-arrow-review`]);
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate id');
});

test('hygiene: no inline styles, font sizes, transforms, links, images or data URIs', () => {
  for (const svg of [wide, narrow]) {
    for (const bad of [' style=', 'font-size', 'font-family', 'transform', '<script', 'href=', 'xlink:href', 'foreignObject', 'fill="var(', '<image', 'data:']) {
      assert.ok(!svg.includes(bad), `svg contains ${bad}`);
    }
  }
});

test('no digits in diagram text, titles, descriptions, steps or caption (the figure number aside)', () => {
  for (const svg of [wide, narrow]) {
    const texts = [...svg.matchAll(/<(text|title|desc)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => strip(m[2]));
    assert.ok(texts.length > 10);
    for (const t of texts) assert.ok(!/\d/.test(t.replace(/\bT[0-3]\b/g, ' ')), `digit in: ${t}`);
  }
  assert.ok(!/\d/.test(strip(ol).replace(/\bT[0-3]\b/g, ' ')), 'steps');
  assert.ok(caption.startsWith('<figcaption><b>Figure 3</b>'));
  assert.ok(!/\d/.test(strip(caption.replace('<b>Figure 3</b>', ''))), 'caption');
});

test('wide: nine stage labels in order, four lanes, two run brackets, one boundary', () => {
  const labels = [...wide.matchAll(/<text class="stage-lbl"[^>]*>([\s\S]*?)<\/text>/g)].map((m) => lines(m[1]).join(' ').replace(/\s+/g, ' ').trim());
  assert.equal(labels.length, 9);
  const want = ['Objective', 'Research and plan', 'Brief', 'Source assets', 'Adapt and localise', 'Review and approve', 'Publish, activate', 'Measure', 'Optimise, refresh'];
  assert.deepEqual(labels, want);
  const lane = [...wide.matchAll(/<text class="lane-lbl"[^>]*>([\s\S]*?)<\/text>/g)].map((m) => strip(m[1]));
  for (const l of ['PEOPLE', 'AGENTS', 'SHARED PLATFORM', 'YOUR EXISTING SYSTEMS']) assert.ok(lane.some((x) => x.startsWith(l)), `lane ${l}`);
  assert.equal(groups(wide, 'run').length, 2);
  assert.equal((wide.match(/<line class="boundary"/g) || []).length, 1);
  assert.equal(groups(wide, 'platform').length, 8);
  assert.equal(groups(wide, 'system').length, 9);
  assert.ok(/class="edge edge-soft"/.test(wide), 'feedback path');
  assert.ok((wide.match(/class="edge edge-review"/g) || []).length >= 5, 'boundary crossings');
});

test('wide: every node has one rect, text lines fit, nodes sit on the column grid, no overlaps', () => {
  const boxes = [];
  for (const cls of ['node', 'node node-human', 'node node-human node-fades', 'node node-review', 'platform', 'system']) {
    for (const g of groups(wide, cls)) {
      const rects = g.match(/<rect\b[^>]*>/g) || [];
      assert.equal(rects.length, 1, 'one rect per node');
      const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((a) => Number(attr(rects[0], a)));
      const ls = lines(g);
      const max = cls === 'platform' || cls === 'system' ? 11 : 10;
      for (const l of ls) assert.ok(l.length <= max, `line "${l}" over ${max}`);
      if (cls === 'platform') { assert.equal(w, 84); assert.equal(h, 40); assert.equal((x - 10) % 88, 0); }
      else if (cls === 'system') { assert.equal(w, 68); assert.equal(h, 24); assert.equal((x - 14) % 78, 0); }
      else { assert.equal(w, 68); assert.equal((x - 14) % 78, 0, `node x ${x} on the grid`); assert.equal(h, ls.length * 16 + 8, `height for ${ls.length} lines`); }
      assert.ok(x >= 0 && x + w <= 720 && y >= 0 && y + h <= 500, 'inside the viewBox');
      boxes.push({ x, y, w, h });
    }
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i]; const b = boxes[j];
    assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y, `boxes overlap: ${JSON.stringify(a)} ${JSON.stringify(b)}`);
  }
  assert.equal(groups(wide, 'node').length + groups(wide, 'node node-human').length + groups(wide, 'node node-human node-fades').length + groups(wide, 'node node-review').length, 15);
});

test('narrow: nine stage nodes in order, each with an Agent and a People line, on the 240 wide column', () => {
  const ns = [];
  for (const m of narrow.matchAll(/<g class="(node[^"]*)">([\s\S]*?)<\/g>/g)) ns.push({ cls: m[1], html: m[2] });
  const stages = ns.slice(0, 9);
  assert.equal(stages.length, 9);
  stages.forEach((n, i) => {
    const ls = lines(n.html);
    assert.equal(ls[0], STAGES[i]);
    assert.ok(ls[1].startsWith('Agent:'), `${ls[0]} agent line`);
    assert.ok(ls[2].startsWith('People:'), `${ls[0]} people line`);
    const r = n.html.match(/<rect\b[^>]*>/)[0];
    assert.equal(attr(r, 'x'), '30');
    assert.equal(attr(r, 'width'), '240');
    assert.equal(Number(attr(r, 'y')), 40 + 72 * i);
    assert.equal(Number(attr(r, 'height')), 56);
    for (const l of ls) assert.ok(l.length <= 28, `line too long (${l.length}): ${l}`);
  });
  for (const n of ns) for (const l of lines(n.html)) assert.ok(l.length <= 28, l);
  assert.equal(groups(narrow, 'run').length, 2, 'two run brackets');
  assert.ok(/class="edge edge-soft"/.test(narrow), 'feedback path');
  assert.ok(groups(narrow, 'platform').length >= 2 && groups(narrow, 'system').length >= 1);
});

test('human steps are marked by stroke, not colour alone', () => {
  assert.ok(/\.fig-flow \.node-human rect[^{]*\{[^}]*stroke-width:\s*2\.5/.test(css));
  assert.ok(/\.fig-flow \.node-fades rect[^{]*\{[^}]*stroke-dasharray/.test(css));
  assert.ok(wide.includes('PEOPLE') && wide.includes('AGENTS'), 'lane labels name who acts');
  assert.ok(narrow.includes('Agent:') && narrow.includes('People:'));
});

test('text equivalent: visible steps name every stage and expand the abbreviations', () => {
  assert.ok(fig.includes('<p class="steps-h" id="ff1-steps-h">Steps in Figure 3</p>'));
  assert.ok(/<ol class="fig-steps" aria-labelledby="ff1-steps-h">/.test(ol));
  const list = strip(ol).toLowerCase();
  for (const s of STAGES) assert.ok(list.includes(s.toLowerCase()), `steps omit ${s}`);
  for (const a of ['digital asset manager', 'content management system', 'product information manager', 'translation management system', 'marketing automation platform', 'dam', 'cms', 'pim', 'tms', 'map']) {
    assert.ok(list.includes(a), `steps omit ${a}`);
  }
  assert.ok((ol.match(/<li>/g) || []).length >= 10);
});

test('responsive switch is CSS only: wide by default off, shown from 760px and in print; narrow the reverse', () => {
  assert.ok(/\.flow-wide\s*\{[^}]*display:\s*none/.test(css), 'wide hidden by default');
  assert.ok(/@media \(min-width: 760px\)\s*\{[^}]*\.flow-wide\s*\{\s*display:\s*block;?\s*\}[^}]*\.flow-narrow\s*\{\s*display:\s*none;?\s*\}/.test(css), 'min-width switch');
  const print = css.slice(css.lastIndexOf('@media print'));
  assert.ok(/\.flow-wide\s*\{[^}]*display:\s*block/.test(print) && /\.flow-narrow\s*\{[^}]*display:\s*none/.test(print), 'print shows wide');
  assert.ok(!/ style="/.test(html), 'no inline style attributes');
});

test('mutation: a digit in a wide label would be caught', () => {
  const bad = wide.replace('>Brief<', '>Brief 2<');
  assert.notEqual(bad, wide);
  const texts = [...bad.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((m) => strip(m[1]));
  assert.ok(texts.some((t) => /\d/.test(t)));
});
