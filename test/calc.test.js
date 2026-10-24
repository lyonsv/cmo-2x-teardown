import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute } from '../site/js/calc.js';

function close(a, b, tol = 1e-9) {
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} to be within ${tol} of ${b}`);
}

const inputs = (over = {}) => ({
  campaigns_per_year: 40,
  concepts_per_campaign: 25,
  variants_per_concept: 40,
  marketing_fte: 120,
  reviewer_fte: 12,
  multiplier: 2,
  ...over,
});
const assumptions = { concept_growth_exponent: 0.25 };

test('multiplier 1 gives scenario equal to baseline', () => {
  const r = compute(inputs({ multiplier: 1 }), assumptions);
  assert.equal(r.ok, true);
  for (const k of Object.keys(r.baseline)) close(r.scenario[k], r.baseline[k]);
});

test('default inputs give a 2x output per head ratio', () => {
  const r = compute(inputs(), assumptions);
  assert.equal(r.ok, true);
  close(r.ratios.output_per_head, 2);
});

test('marketing_fte 0 returns a validation error, not NaN', () => {
  const r = compute(inputs({ marketing_fte: 0 }), assumptions);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.field === 'marketing_fte'));
});
