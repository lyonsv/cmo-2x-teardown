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
  const flat = (o, out = {}, path = '') => {
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === 'object') flat(v, out, `${path}${k}.`);
      else out[`${path}${k}`] = v;
    }
    return out;
  };
  const fb = flat(r.baseline);
  const fs = flat(r.scenario);
  for (const k of Object.keys(fb)) {
    if (fb[k] === null) assert.equal(fs[k], null, k);
    else close(fs[k], fb[k]);
  }
});

test('monotonicity: more volume gives more variants and more total cost on both sides', () => {
  for (const f of ['variants_per_concept', 'concepts_per_campaign', 'campaigns_per_year']) {
    let prev = -Infinity;
    let prevCost = { baseline: -Infinity, scenario: -Infinity };
    for (const v of [1, 2, 5, 10, 50]) {
      const r = compute(inputs({ [f]: v }), assumptions);
      assert.equal(r.ok, true, `${f}=${v}`);
      assert.ok(r.scenario.variants_per_year > prev, `${f}=${v} variants`);
      prev = r.scenario.variants_per_year;
      for (const which of ['baseline', 'scenario']) {
        assert.ok(r[which].cost.total > prevCost[which], `${f}=${v} ${which} cost`);
        prevCost = { ...prevCost, [which]: r[which].cost.total };
      }
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

// ---- Code review CR-01: zero-denominator ratios are null, not an error ----

test('no AI spend today: ok, ai_spend ratio is null and flagged, other outputs intact', () => {
  const r = compute(inputs(), {
    ...assumptions,
    ai_share_of_variant_cost: { baseline: 0, scaled: 0.6 },
    ai_share_of_tooling: { baseline: 0, scaled: 0.5 },
  });
  assert.equal(r.ok, true);
  assert.equal(r.baseline.ai_spend, 0);
  assert.equal(r.ratios.ai_spend, null);
  assert.deepEqual(r.undefined_ratios, ['ai_spend']);
  assert.ok(Number.isFinite(r.ratios.cost_per_asset));
  assert.ok(Number.isFinite(r.scenario.cost_per_asset));
  walkNumbers(r, (v, path) => assert.ok(Number.isFinite(v), path));
});

test('zero-cost baseline: cost ratios and their change are null, not NaN', () => {
  const zero = {
    ...GOLDEN_ASSUMPTIONS,
    review_minutes_per_variant: 0, master_concept_cost: 0, rights_cost_per_concept: 0, storage_cost_per_variant: 0,
    variant_cost: { baseline: 0, scaled: 1 }, tooling_cost_annual: { baseline: 0, scaled: 30000 },
  };
  const r = compute(goldenInputs(), zero);
  assert.equal(r.ok, true);
  assert.equal(r.baseline.cost.total, 0);
  for (const k of ['cost_per_asset', 'cost_per_asset_change', 'total_cost', 'total_cost_change', 'ai_spend']) assert.equal(r.ratios[k], null, k);
  assert.deepEqual([...r.undefined_ratios].sort(), ['ai_spend', 'cost_per_asset', 'total_cost']);
  walkNumbers(r, (v, path) => assert.ok(Number.isFinite(v), path));
});

test('defaults have no undefined ratios', () => {
  assert.deepEqual(compute(inputs(), assumptions).undefined_ratios, []);
});

test('overflow fallback blames no single field', () => {
  const r = compute(inputs({ campaigns_per_year: 1e200, concepts_per_campaign: 1e200 }), assumptions);
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 1);
  assert.equal(r.errors[0].field, null);
});

// ---- Code review WR-01: every assumption may be { baseline, scaled } ----

test('per-side values for every cost-half assumption are honoured, not read as scalars', () => {
  const perSide = ['sampling_rate', 'escalation_rate', 'rework_rate', 'review_minutes_per_variant', 'reviewer_rate_per_hour',
    'master_concept_cost', 'rights_cost_per_concept', 'storage_cost_per_variant', 'review_service_days'];
  // Same value on both sides must reproduce the scalar golden case exactly.
  const wrapped = { ...GOLDEN_ASSUMPTIONS };
  for (const f of perSide) wrapped[f] = { baseline: GOLDEN_ASSUMPTIONS[f], scaled: GOLDEN_ASSUMPTIONS[f] };
  const plain = compute(goldenInputs(), GOLDEN_ASSUMPTIONS);
  const r = compute(goldenInputs(), wrapped);
  assert.equal(r.ok, true);
  close(r.baseline.cost.total, plain.baseline.cost.total);
  close(r.scenario.cost.total, plain.scenario.cost.total);
  close(r.scenario.cycle_days, plain.scenario.cycle_days);
  // A lower rework rate at 2x changes only the scaled side.
  const lower = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, rework_rate: { baseline: 0.1, scaled: 0.05 } });
  assert.equal(lower.ok, true);
  close(lower.baseline.cost.rework, plain.baseline.cost.rework);
  assert.ok(lower.scenario.cost.rework < plain.scenario.cost.rework);
  walkNumbers(lower, (v, path) => assert.ok(Number.isFinite(v), path));
});

test('sampling + escalation over 1 is caught per side, including object values', () => {
  for (const which of ['baseline', 'scaled']) {
    const over = { baseline: 0.05, scaled: 0.05, [which]: 0.6 };
    const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, sampling_rate: over, escalation_rate: over });
    assert.equal(r.ok, false, which);
    assert.ok(r.errors.some((e) => e.field === 'sampling_rate'), which);
  }
});

// ---- Code review WR-02: break-even respects the T0 + T1 cap ----

test('break-even between the T0+T1 cap and 1 is infeasible, not ok', () => {
  const r = compute(inputs({ reviewer_fte: 3 }), assumptions);
  assert.equal(r.ok, true);
  const mix = assumptions.tier_mix.scaled;
  const cap = mix[0] + mix[1];
  const be = r.break_even_auto_approval;
  assert.ok(be.value > cap && be.value <= 1, `value ${be.value} should sit between cap ${cap} and 1`);
  assert.equal(be.status, 'infeasible');
  close(be.cap, cap);
});

test('break-even below the cap stays ok at the defaults', () => {
  const be = compute(inputs(), assumptions).break_even_auto_approval;
  assert.equal(be.status, 'ok');
  assert.ok(be.value <= be.cap);
});

test('break-even with sampling + escalation = 1 is finite and infeasible when reviewers are short', () => {
  const r = compute(goldenInputs({ reviewer_fte: 0.05 }), { ...GOLDEN_ASSUMPTIONS, sampling_rate: 0.5, escalation_rate: 0.5 });
  assert.equal(r.ok, true);
  assert.equal(r.break_even_auto_approval.status, 'infeasible');
  walkNumbers(r, (v, path) => assert.ok(Number.isFinite(v), path));
});

test('deltas: production cost rise and budget-share points equal scenario minus baseline', () => {
  const r = compute(inputs(), assumptions);
  close(r.deltas.total_cost, r.scenario.cost.total - r.baseline.cost.total);
  close(r.deltas.production_share_of_budget, r.deltas.total_cost / 78000000);
  close(r.ratios.total_cost_change, r.ratios.total_cost - 1);
  assert.ok(r.deltas.total_cost > 0, 'at the defaults production cost rises, so the flat-budget claim needs a funded offset');
});

test('capacity auto-approval: utilisation is exactly 1 there and below the target break-even', () => {
  const r = compute(inputs(), assumptions);
  const capShare = r.capacity_auto_approval.value;
  assert.equal(r.capacity_auto_approval.status, 'ok');
  assert.ok(capShare < r.break_even_auto_approval.value);
  const at = (share) => compute(inputs(), { ...assumptions, auto_approval_share: { baseline: 0.2, scaled: share } });
  close(at(capShare).scenario.utilisation, 1, 1e-9);
  close(at(r.break_even_auto_approval.value).scenario.utilisation, assumptions.target_utilisation, 1e-9);
  assert.equal(at(capShare - 0.01).scenario.review_capacity_exceeded, true);
  assert.equal(at(capShare + 0.01).scenario.review_capacity_exceeded, false);
});
