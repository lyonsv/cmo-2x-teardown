import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute } from '../site/js/calc.js';
import { defaultAssumptions } from '../site/js/data.js';

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
const assumptions = defaultAssumptions();

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

// ---- Plan 01-04: output half of the model ----

const GOLDEN_ASSUMPTIONS = {
  concept_growth_exponent: 0,
  approval_yield: 0.8,
  tier_mix: { baseline: [0.5, 0.5, 0, 0], scaled: [0.5, 0.5, 0, 0] },
  tier_weights: [1, 2, 4, 8],
  auto_approval_share: { baseline: 0.2, scaled: 0.5 },
  sampling_rate: 0.05,
  escalation_rate: 0.05,
  review_minutes_per_variant: 12,
  rework_rate: 0.1,
  reviewer_hours_per_fte_year: 1000,
  reviewer_rate_per_hour: 100,
  master_concept_cost: 1000,
  variant_cost: { baseline: 5, scaled: 1 },
  rights_cost_per_concept: 100,
  storage_cost_per_variant: 0.1,
  tooling_cost_annual: { baseline: 10000, scaled: 30000 },
  ai_share_of_variant_cost: { baseline: 0.05, scaled: 0.6 },
  ai_share_of_tooling: { baseline: 0.2, scaled: 0.5 },
  build_days: { baseline: 8, scaled: 3 },
  review_service_days: 1.5,
  target_utilisation: 0.85,
};
const goldenInputs = (over = {}) => ({
  campaigns_per_year: 10,
  concepts_per_campaign: 10,
  variants_per_concept: 10,
  marketing_fte: 10,
  reviewer_fte: 2,
  multiplier: 2,
  ...over,
});

function walkNumbers(obj, fn, path = '') {
  if (typeof obj === 'number') return fn(obj, path);
  if (Array.isArray(obj)) return obj.forEach((v, i) => walkNumbers(v, fn, `${path}[${i}]`));
  if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) walkNumbers(v, fn, `${path}.${k}`);
}

test('golden case: hand-calculated output half', () => {
  const r = compute(goldenInputs(), GOLDEN_ASSUMPTIONS);
  assert.equal(r.ok, true);
  close(r.baseline.concepts, 100);
  close(r.baseline.variants_per_year, 1000);
  close(r.baseline.generated_variants_per_year, 1250);
  close(r.baseline.output_per_head_per_quarter, 25);
  close(r.baseline.weighted_output_per_head_per_quarter, 37.5);
  close(r.scenario.concepts, 100);
  close(r.scenario.variants_per_year, 2000);
  close(r.scenario.generated_variants_per_year, 2500);
  close(r.scenario.output_per_head_per_quarter, 50);
  close(r.scenario.weighted_output_per_head_per_quarter, 75);
  close(r.ratios.weighted_output_per_head, 2);
});

test('exponent golden: multiplier 4, exponent 0.5 splits growth evenly', () => {
  const r = compute(goldenInputs({ multiplier: 4 }), { ...GOLDEN_ASSUMPTIONS, concept_growth_exponent: 0.5 });
  assert.equal(r.ok, true);
  close(r.scenario.concepts, 2 * r.baseline.concepts);
  close(r.scenario.variants_per_concept, 2 * r.baseline.variants_per_concept);
});

test('identity: multiplier 1 with scaled values copied from baseline', () => {
  const a = defaultAssumptions();
  const same = { ...a, tier_mix: { baseline: a.tier_mix.baseline, scaled: a.tier_mix.baseline } };
  const r = compute(inputs({ multiplier: 1 }), same);
  assert.equal(r.ok, true);
  for (const k of Object.keys(r.baseline)) close(r.scenario[k], r.baseline[k]);
});

test('monotonicity of variants_per_year', () => {
  for (const f of ['variants_per_concept', 'concepts_per_campaign', 'campaigns_per_year']) {
    let prev = -Infinity;
    for (const v of [1, 2, 5, 10, 50]) {
      const r = compute(inputs({ [f]: v }), assumptions);
      assert.ok(r.scenario.variants_per_year >= prev, f);
      prev = r.scenario.variants_per_year;
    }
  }
});

test('validation of tier and yield assumptions', () => {
  const bad = (over, field) => {
    const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, ...over });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => e.field === field), field);
  };
  bad({ tier_mix: { baseline: [0.5, 0.4, 0, 0], scaled: [0.5, 0.5, 0, 0] } }, 'tier_mix');
  bad({ tier_mix: { baseline: [0.5, 0.5, 0, 0], scaled: [0.5, 0.5, 0] } }, 'tier_mix');
  bad({ tier_weights: [1, 0, 4, 8] }, 'tier_weights');
  bad({ approval_yield: 0 }, 'approval_yield');
  bad({ approval_yield: 1.2 }, 'approval_yield');
});

test('bad inputs name the field and never produce NaN', () => {
  for (const bad of ['5', NaN, -1, '', undefined, Infinity]) {
    for (const f of ['campaigns_per_year', 'concepts_per_campaign', 'variants_per_concept', 'marketing_fte', 'reviewer_fte', 'multiplier']) {
      const r = compute(goldenInputs({ [f]: bad }), GOLDEN_ASSUMPTIONS);
      assert.equal(r.ok, false);
      assert.ok(r.errors.some((e) => e.field === f), f);
    }
  }
});

test('every numeric leaf of a valid output is finite', () => {
  const r = compute(inputs(), assumptions);
  assert.equal(r.ok, true);
  let n = 0;
  walkNumbers(r, (v) => { n++; assert.ok(Number.isFinite(v)); });
  assert.ok(n > 10);
});

test('default weighted ratio is a sensitivity below 2x', () => {
  const r = compute(inputs(), assumptions);
  assert.ok(r.ratios.weighted_output_per_head < r.ratios.output_per_head);
});
