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
  marketing_budget: 78000000,
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
  marketing_budget: 1000000,
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
  const same = Object.fromEntries(Object.entries(a).map(([k, v]) => [
    k, v && typeof v === 'object' && 'baseline' in v ? { baseline: v.baseline, scaled: v.baseline } : v,
  ]));
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

// ---- Plan 01-05: cost model, review capacity, AI spend, break-even ----

test('golden cost case at approval yield 0.8 (G = V / yield)', () => {
  const r = compute(goldenInputs(), GOLDEN_ASSUMPTIONS);
  assert.equal(r.ok, true);
  const b = r.baseline;
  const s = r.scenario;
  close(b.generated_variants_per_year, 1250);
  close(b.review_hours, 205);
  close(b.utilisation, 0.11275);
  close(b.cost.generation, 106250);
  close(b.cost.review, 20500);
  close(b.cost.rework, 2675);
  close(b.cost.tooling, 10000);
  close(b.cost.rights, 10000);
  close(b.cost.storage, 100);
  close(b.cost.total, 149525);
  close(b.cost_per_asset, 149.525);
  close(s.review_hours, 275);
  close(s.utilisation, 0.15125);
  close(s.cost.generation, 102500);
  close(s.cost.review, 27500);
  close(s.cost.rework, 3000);
  close(s.cost.tooling, 30000);
  close(s.cost.rights, 10000);
  close(s.cost.storage, 200);
  close(s.cost.total, 173200);
  close(s.cost_per_asset, 86.6);
  close(r.ratios.cost_per_asset, 0.57917, 1e-4);
  close(b.production_share_of_budget, 0.149525);
  close(b.cost_per_asset_by_component.generation, 106.25);
  assert.equal(b.review_capacity_exceeded, false);
});

test('golden cost case at approval yield 1 reproduces the research case', () => {
  const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, approval_yield: 1 });
  assert.equal(r.ok, true);
  close(r.baseline.cost.total, 143640);
  close(r.scenario.cost.total, 166600);
  close(r.baseline.cost_per_asset, 143.64);
  close(r.scenario.cost_per_asset, 83.3);
  close(r.ratios.cost_per_asset, 0.5799, 1e-4);
  close(r.ratios.cost_per_asset_change, r.ratios.cost_per_asset - 1);
});

test('cost per asset strictly decreases as the multiplier rises', () => {
  let prev = Infinity;
  for (const multiplier of [1, 1.5, 2, 3]) {
    const r = compute(inputs({ multiplier }), assumptions);
    assert.equal(r.ok, true);
    assert.ok(r.scenario.cost_per_asset < prev, `multiplier ${multiplier}`);
    prev = r.scenario.cost_per_asset;
  }
});

test('2x at baseline auto-approval exceeds review capacity and has no cycle time', () => {
  const r = compute(inputs(), { ...assumptions, auto_approval_share: { baseline: 0.2, scaled: 0.2 } });
  assert.equal(r.ok, true);
  assert.equal(r.scenario.review_capacity_exceeded, true);
  assert.equal(r.scenario.cycle_days, null);
});

test('defaults: cheaper per asset, under capacity, AI spend rises, break-even feasible', () => {
  const r = compute(inputs(), assumptions);
  assert.equal(r.ok, true);
  assert.ok(r.scenario.cost_per_asset < r.baseline.cost_per_asset);
  assert.ok(r.scenario.utilisation < 1);
  assert.ok(r.scenario.ai_spend > r.baseline.ai_spend);
  assert.equal(r.break_even_auto_approval.status, 'ok');
  assert.ok(r.scenario.cycle_days > 0);
});

test('cost-half validation names the field', () => {
  const badA = (over, field) => {
    const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, ...over });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => e.field === field), field);
  };
  badA({ sampling_rate: 1.5 }, 'sampling_rate');
  badA({ sampling_rate: 0.6, escalation_rate: 0.5 }, 'sampling_rate');
  badA({ target_utilisation: 0 }, 'target_utilisation');
  badA({ reviewer_hours_per_fte_year: 0 }, 'reviewer_hours_per_fte_year');
  badA({ master_concept_cost: -1 }, 'master_concept_cost');
  badA({
    auto_approval_share: { baseline: 0.2, scaled: 0.9 },
    tier_mix: { baseline: [0.5, 0.5, 0, 0], scaled: [0.5, 0.35, 0.1, 0.05] },
  }, 'auto_approval_share');
  const r = compute(goldenInputs({ marketing_budget: 0 }), GOLDEN_ASSUMPTIONS);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.field === 'marketing_budget'));
});

test('tiny reviewer headcount is a result, not an error, and every leaf is finite or null', () => {
  const r = compute(inputs({ reviewer_fte: 0.1 }), assumptions);
  assert.equal(r.ok, true);
  assert.equal(r.scenario.review_capacity_exceeded, true);
  walkNumbers(r, (v) => assert.ok(Number.isFinite(v)));
  assert.equal(r.scenario.cycle_days, null);
});

test('break-even auto-approval at flat reviewers (golden, yield 0.8)', () => {
  const r = compute(goldenInputs(), GOLDEN_ASSUMPTIONS);
  // h* = 0.85 * 2000 / (2500 * 1.1 * 0.2) = 3.0909 -> a* <= 0
  assert.equal(r.break_even_auto_approval.status, 'not_needed');
  assert.equal(r.break_even_auto_approval.value, 0);
  const tight = compute(goldenInputs({ reviewer_fte: 0.05 }), GOLDEN_ASSUMPTIONS);
  assert.equal(tight.break_even_auto_approval.status, 'infeasible');
  assert.equal(tight.break_even_auto_approval.value, 1);
});
