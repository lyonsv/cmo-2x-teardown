import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GRADES, FLAGS, claims, assumptions, sources, defaultInputs, defaultAssumptions,
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
