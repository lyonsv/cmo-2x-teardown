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
  for (const [panel, id] of [[a, 'output_per_head'], [b, 'cost_per_asset']]) {
    const max = Math.max(row(id).base.value, row(id).scaled.value);
    panel.bars.forEach((bar, i) => assert.equal(bar.width, Math.round(((i ? row(id).scaled.value : row(id).base.value) / max) * 192 / 4) * 4));
  }
  assert.deepEqual(a.bars.map((x) => [x.series, x.cls]), [['Baseline', 'bar-base'], ['2x', 'bar-scaled']]);
  assert.equal(u.refLine.x, Math.round(192 / 1.2 / 4) * 4);
  assert.equal(u.refLine.label, '100% capacity');
  assert.ok(u.bars.every((x) => x.lines.length === 1));
});

test('chartSpec: every coordinate is a multiple of 4 and the first bar of a panel starts at x 0', () => {
  for (const v of [{}, { reviewers: 4 }, { locales: 13, campaigns: 777 }]) {
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

test('chartSpec: every label line fits between x=200 and the viewBox edge', () => {
  for (const v of [{}, { reviewers: 4 }, { campaigns: 1e6 }, { campaigns: 1e9, concepts: 1e6, marketers: 0.001 }]) {
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
