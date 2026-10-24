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
    assert.ok(!/gradial|airops|profound|optimizely|klarna|unilever/i.test(e.display + e.basis));
  }
});
