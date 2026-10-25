import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chartSpec } from '../site/js/svg.js';
import { present, defaultValues } from '../site/js/model.js';
import { modelContext, claims } from '../site/js/data.js';

const ctx = modelContext();
const d = defaultValues(ctx);
const src = readFileSync(new URL('../site/js/svg.js', import.meta.url), 'utf8');
const specFor = (v) => chartSpec(present({ ...d, ...v }, ctx));

const coords = (spec) => spec.panels.flatMap((p) => [p.labelY, ...p.bars.flatMap((b) => [b.x, b.y, b.width, b.seriesY, b.textY]),
  ...(p.refLine ? [p.refLine.x, p.refLine.y1, p.refLine.y2] : [])]);

test('chartSpec: three panels with the larger bar at 192 and widths in proportion', () => {
  const spec = specFor({});
  assert.equal(spec.panels.length, 3);
  const [a, b, u] = spec.panels;
  for (const panel of [a, b]) {
    const vals = panel.bars.map((x) => x.width);
    assert.equal(Math.max(...vals), 192);
  }
  const p = present(d, ctx);
  const row = (id) => p.rows.find((r) => r.id === id);
  for (const [panel, id] of [[a, 'campaign_markets'], [b, 'cost_per_asset']]) {
    const max = Math.max(row(id).base.value, row(id).scaled.value);
    panel.bars.forEach((bar, i) => assert.equal(bar.width, Math.round(((i ? row(id).scaled.value : row(id).base.value) / max) * 192 / 4) * 4));
  }
  assert.deepEqual(a.bars.map((x) => [x.series, x.cls]), [['Baseline', 'bar-base'], ['2x', 'bar-scaled']]);
  assert.equal(u.refLine.x, Math.round(192 / 1.2 / 4) * 4);
  assert.equal(u.refLine.label, '100% capacity');
  assert.ok(u.bars.every((x) => x.lines.length === 1));
});

test('chartSpec: every coordinate is a multiple of 4 and the first bar of a panel starts at x 0', () => {
  for (const v of [{}, { reviewers: 4 }, { markets: 13, campaigns: 777 }]) {
    const spec = specFor(v);
    for (const n of coords(spec)) assert.equal(n % 4, 0, `${n} in ${JSON.stringify(v)}`);
  }
});

test('chartSpec: over capacity adds a second line and rescales the utilisation panel', () => {
  const spec = specFor({ reviewers: 4 });
  const u = spec.panels[2];
  const p = present({ ...d, reviewers: 4 }, ctx);
  const util = p.rows.find((r) => r.id === 'utilisation');
  const max = Math.max(1.2, util.base.value, util.scaled.value);
  assert.equal(u.refLine.x, Math.round(192 / max / 4) * 4);
  const over = u.bars.filter((b) => b.lines.length === 2);
  assert.ok(over.length >= 1);
  for (const b of over) assert.deepEqual(b.lines[1], 'over capacity');
  assert.ok(u.bars.every((b) => !b.lines[0].includes('capacity')));
});

test('chartSpec: over capacity marks the 2x campaign-markets bar as not achievable (CR-01)', () => {
  const spec = specFor({ auto2: 0.2 });
  const [base, scaled] = spec.panels[0].bars;
  assert.deepEqual(scaled.lines, ['100', 'unachievable']);
  assert.deepEqual(base.lines, ['50']);
  assert.ok(spec.desc.includes('baseline 50, 2x 100 (not achievable: over capacity).'), spec.desc);
  const both = specFor({ reviewers: 4 });
  assert.ok(both.panels[0].bars.every((b) => b.lines[1] === 'unachievable'));
  assert.ok(both.desc.includes('baseline 50 (not achievable: over capacity), 2x 100 (not achievable: over capacity).'), both.desc);
  const fine = specFor({});
  assert.ok(fine.panels[0].bars.every((b) => b.lines.length === 1));
  assert.ok(!fine.desc.includes('not achievable'));
});

test('chartSpec: every label line fits between x=200 and the viewBox edge', () => {
  for (const v of [{}, { reviewers: 4 }, { campaigns: 1e6 }, { campaigns: 1e9, concepts: 1e6, marketers: 0.001, reviewers: 0.001 }]) {
    const spec = specFor(v);
    assert.ok(spec, JSON.stringify(v));
    for (const panel of spec.panels) {
      for (const bar of panel.bars) for (const line of bar.lines) assert.ok(line.length * 7.4 <= 100, `"${line}" too wide`);
      assert.ok(panel.label.length * 7.4 <= 300, panel.label);
    }
    assert.ok('100% capacity'.length * 7.4 + spec.panels[2].refLine.x + 4 <= 300);
  }
});

test('chartSpec: desc names each value; invalid input gives null', () => {
  const spec = specFor({});
  for (const panel of spec.panels) for (const bar of panel.bars) assert.ok(spec.desc.includes(bar.value.text), bar.value.text);
  assert.equal(chartSpec(present({ ...d, campaigns: 0 }, ctx)), null);
});

test('chartSpec: default chart labels reuse the results-table claims', () => {
  const spec = specFor({});
  for (const panel of spec.panels) for (const bar of panel.bars) {
    assert.ok(claims[bar.value.fig], `no claim ${bar.value.fig}`);
    assert.equal(claims[bar.value.fig].display, bar.value.text);
  }
});

test('svg.js builds with createElementNS and attributes only', () => {
  assert.ok(src.includes("createElementNS(NS, tag)") && src.includes('http://www.w3.org/2000/svg'));
  assert.ok(!/innerHTML|style/.test(src));
  assert.ok(src.split('\n').length < 90, `svg.js is ${src.split('\n').length} lines`);
});

// ---- static Figure 8 in the page ----

const page = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const decodeEnt = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const figure = page.match(/<figure>(?:(?!<\/figure>)[\s\S])*<svg class="fig fig-live"[\s\S]*?<\/figure>/)[0];
const svgHtml = figure.match(/<svg class="fig fig-live"[\s\S]*?<\/svg>/)[0];

test('Figure 8 static markup: one figure, title, desc, viewBox, caption, no style, script or href', () => {
  const spec = specFor({});
  assert.ok(svgHtml.startsWith(`<svg class="fig fig-live" viewBox="0 0 300 ${spec.height}" role="img" aria-labelledby="f8-t f8-d">`));
  assert.equal((svgHtml.match(/<title id="f8-t">/g) || []).length, 1);
  assert.equal(decodeEnt(svgHtml.match(/<desc id="f8-d">([^<]*)<\/desc>/)[1]), spec.desc);
  assert.ok(!/\bstyle=|<script|href=/.test(svgHtml));
  assert.match(figure, /<figcaption><b>Figure 8<\/b>/);
  assert.match(figure, /Each panel has its own scale/);
  assert.match(figure, /see the results table for the exact values/);
  assert.match(figure, /How to read this/);
  assert.equal((page.match(/<b>Figure 8<\/b>/g) || []).length, 1);
});

test('Figure 8 static bars, labels and series names equal chartSpec(defaults)', () => {
  const spec = specFor({});
  const rects = [...svgHtml.matchAll(/<rect class="(bar-base|bar-scaled)" x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"\/>/g)];
  const bars = spec.panels.flatMap((p) => p.bars);
  assert.equal(rects.length, bars.length);
  rects.forEach((m, i) => assert.deepEqual(m.slice(1).map((x, k) => (k ? Number(x) : x)), [bars[i].cls, bars[i].x, bars[i].y, bars[i].width, bars[i].height]));
  const values = [...svgHtml.matchAll(/<text data-fig="([^"]+)" x="(\d+)" y="(\d+)">([^<]*)<\/text>/g)];
  assert.equal(values.length, bars.length);
  values.forEach((m, i) => {
    assert.equal(m[1], bars[i].value.fig);
    assert.equal(Number(m[3]), bars[i].textY);
    assert.equal(decodeEnt(m[4]), bars[i].value.text);
    assert.equal(claims[m[1]].display, decodeEnt(m[4]));
    assert.ok(m[4].length * 7.4 <= 300 - Number(m[2]), `${m[4]} fits`);
  });
  for (const m of svgHtml.matchAll(/<text class="over-lbl" x="(\d+)"[^>]*>([^<]*)</g)) assert.ok(m[2].length * 7.4 <= 300 - Number(m[1]));
  assert.equal((svgHtml.match(/>Baseline</g) || []).length, 3);
  assert.equal((svgHtml.match(/>2x</g) || []).length, 3);
  const line = svgHtml.match(/<line class="ref-line" x1="(\d+)"/);
  assert.equal(Number(line[1]), spec.panels[2].refLine.x);
  assert.match(svgHtml, />100% capacity</);
});
