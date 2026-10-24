import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GRADES, FLAGS, formatValue, claims, assumptions, sources, defaultInputs, defaultAssumptions,
} from '../site/js/data.js';
import { compute } from '../site/js/calc.js';

const entries = [...Object.values(claims), ...Object.values(assumptions)];

test('map keys equal entry ids and claims/assumptions are disjoint', () => {
  for (const [k, v] of Object.entries(claims)) assert.equal(v.id, k);
  for (const [k, v] of Object.entries(assumptions)) assert.equal(v.id, k);
  for (const k of Object.keys(claims)) assert.ok(!(k in assumptions), `${k} collides`);
});

test('grades and flags are valid', () => {
  for (const e of entries) {
    assert.ok(GRADES.includes(e.grade), `${e.id}: bad grade`);
    assert.ok(e.flag === null || FLAGS.includes(e.flag), `${e.id}: bad flag`);
    if (e.grade === 'Benchmark') assert.equal(e.flag, null, `${e.id}: flagged Benchmark`);
  }
});

test('refs resolve; Benchmark claims cite an https source with an accessed date', () => {
  for (const c of Object.values(claims)) {
    if (c.ref.startsWith('src-')) {
      const s = sources[c.ref.slice(4)];
      assert.ok(s, `${c.id}: missing source ${c.ref}`);
      if (c.grade === 'Benchmark') {
        assert.match(s.url, /^https:\/\//);
        assert.match(s.accessed, /^\d{4}-\d{2}-\d{2}$/);
      }
    } else {
      assert.ok(assumptions[c.ref], `${c.id}: missing assumption ${c.ref}`);
      assert.notEqual(c.grade, 'Benchmark', `${c.id}: Benchmark must cite a source`);
    }
  }
});

test('derived claims equal compute() output on default inputs', () => {
  const r = compute(defaultInputs(), defaultAssumptions());
  assert.equal(r.ok, true);
  for (const c of Object.values(claims)) {
    if (!c.derived) continue;
    const v = c.derived.split('.').reduce((o, k) => o[k], r);
    assert.equal(Number(v.toFixed(c.decimals ?? 0)), c.value, `${c.id} drifted`);
  }
});

test('formatValue formats int and x1', () => {
  assert.equal(formatValue(1189.2, 'int'), '1,189');
  assert.equal(formatValue(1.626, 'x1'), '1.6x');
});

test('derived claims carry a format and display === formatValue(value, format)', () => {
  for (const c of Object.values(claims)) {
    if (!c.derived) continue;
    assert.ok(c.format, `${c.id}: no format`);
    assert.equal(c.display, formatValue(c.value, c.format), `${c.id} display`);
  }
});

test('six lever evidence entries exist, ungraded Benchmark never, no company names', () => {
  for (let n = 1; n <= 6; n++) {
    const e = assumptions[`asm-lever-0${n}-evidence`];
    assert.ok(e, `lever ${n}`);
    assert.equal(e.kind, 'evidence');
    assert.notEqual(e.grade, 'Benchmark');
    assert.notEqual(e.display, e.basis, `lever ${n}: Value repeats Basis`);
    assert.ok(e.display.split(' ').length <= 6, `lever ${n}: Value is not short`);
    assert.ok(!/gradial|airops|profound|optimizely|klarna|unilever/i.test(e.display + e.basis));
  }
});

// gartner-share-2026 grade is Benchmark: 01-02-SUMMARY.md records gartner_2026_grade: Benchmark
// (user confirmed the primary Gartner newsroom page on 2026-10-24).
test('gartner-share-2026 grade matches the 01-02 browser check', () => {
  assert.equal(claims['gartner-share-2026'].grade, 'Benchmark');
  assert.equal(claims['gartner-share-2026'].flag, null);
  assert.ok(sources['gartner-2026-cmo-spend']);
});

test('s02 derived claims carry the expected displays', () => {
  const want = {
    'cpa-base': '$64.71', 'cpa-scaled': '$41.18', 'cpa-change': '\u221236%',
    'total-cost-base': '$2.59M', 'total-cost-scaled': '$3.29M',
    'budget-share-base': '3.3%', 'budget-share-scaled': '4.2%',
    'ai-spend-base': '$38,421', 'ai-spend-scaled': '$340,421', 'ai-spend-ratio': '8.9x',
    'break-even-auto-approval': '41%',
  };
  for (const [id, d] of Object.entries(want)) assert.equal(claims[id].display, d, id);
});

test('new format kinds', () => {
  assert.equal(formatValue(38421.4, 'usd0'), '$38,421');
  assert.equal(formatValue(64.714, 'usd2'), '$64.71');
  assert.equal(formatValue(2590000, 'usdm2'), '$2.59M');
  assert.equal(formatValue(0.41, 'pct0'), '41%');
  assert.equal(formatValue(0.033, 'pct1'), '3.3%');
  assert.equal(formatValue(-0.36, 'pctchg0'), '\u221236%');
  assert.equal(formatValue(0.2, 'pctchg0'), '+20%');
});

test('every model assumption is Modelled', () => {
  for (const e of Object.values(assumptions)) if (e.kind === 'model') assert.equal(e.grade, 'Modelled', e.id);
});

test('negative values put a true minus sign before the currency symbol', () => {
  assert.equal(formatValue(-1, 'usd2'), '\u2212$1.00');
  assert.equal(formatValue(-38421.4, 'usd0'), '\u2212$38,421');
  assert.equal(formatValue(-710000, 'usdm2'), '\u2212$0.71M');
  assert.equal(formatValue(-0.033, 'pct1'), '\u22123.3%');
  assert.equal(formatValue(-1189.2, 'int'), '\u22121,189');
  assert.equal(formatValue(-0.001, 'usd2'), '$0.00');
  assert.equal(formatValue(-0, 'int'), '0');
});
