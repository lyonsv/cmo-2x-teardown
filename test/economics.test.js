import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute, erlangC, waitMMc, waitMM1, chainSuccess } from '../site/js/calc.js';

const near = (actual, expected, tol = 1e-6) => assert.ok(Math.abs(actual - expected) <= tol, `expected ${actual} to be within ${tol} of ${expected}`);

const inputs = (over = {}) => ({
  multiplier: 2, marketing_budget: 78000000, marketing_fte: 120, campaigns_per_year: 40, concepts_per_campaign: 25,
  markets_per_campaign: 5, formats_per_market: 8, reviewer_fte: 12, ...over,
});
const BASE = {
  campaign_growth_share: 0.5,
  tier_mix: { baseline: [0.4, 0.35, 0.2, 0.05], scaled: [0.55, 0.3, 0.12, 0.03] },
  approval_yield: 0.95,
  auto_approval_share: { baseline: 0.2, scaled: 0.6 },
  sampling_rate: 0.05,
  escalation_rate: 0.05,
  review_minutes_per_variant: 12,
  rework_rate: 0.15,
  reviewer_hours_per_fte_year: 1200,
  reviewer_rate_per_hour: 100,
  master_concept_cost: 1200,
  variant_cost: { baseline: 4, scaled: 0.8 },
  rights_cost_per_concept: 250,
  storage_cost_per_variant: 0.02,
  tooling_cost_annual: { baseline: 150000, scaled: 600000 },
  ai_share_of_variant_cost: { baseline: 0.05, scaled: 0.6 },
  ai_share_of_tooling: { baseline: 0.2, scaled: 0.5 },
  build_days: { baseline: 8, scaled: 3 },
  review_service_days: 1.5,
  target_utilisation: 0.85,
};
const CORRECTED = { ...BASE, reviewer_rate_per_hour: 125, concept_internal_hours: 35.2, marketer_rate_per_hour: 93.75 };

test('legacy identity: absent new fields leave v1 numbers unchanged', () => {
  const r = compute(inputs(), BASE);
  assert.equal(r.ok, true);
  assert.equal(Math.round(r.baseline.cost.total), 2588589);
  assert.equal(Math.round(r.scenario.cost.total), 3620631);
});

test('corrected fixture goldens', () => {
  const r = compute(inputs(), CORRECTED);
  near(r.baseline.cost.total, 6087115.79, 0.01);
  near(r.scenario.cost.total, 8510272.32, 0.01);
  near(r.baseline.cost_per_asset, 152.1779, 1e-4);
  near(r.scenario.cost_per_asset, 106.3784, 1e-4);
  near(r.ratios.cost_per_asset_change, -0.30096, 1e-5);
  near(r.baseline.cost_per_campaign_market, 30435.58, 0.01);
});

test('cash view goldens and independence from labour pricing (INV-2)', () => {
  const r = compute(inputs(), CORRECTED);
  const c = r.baseline.cost_cash;
  near(c.concept_fee, 1200000, 0.01);
  near(c.variants, 193684.21, 0.01);
  near(c.tooling, 150000, 0.01);
  near(c.rights, 250000, 0.01);
  near(c.storage, 800, 0.01);
  near(c.total, 1794484.21, 0.01);
  near(r.scenario.cost_cash.total, 2729683.35, 0.01);
  near(r.scenario.cost_cash.total - r.baseline.cost_cash.total, 935199.14, 0.01);
  const r2 = compute(inputs(), { ...CORRECTED, reviewer_rate_per_hour: 300, concept_internal_hours: 99 });
  near(r2.baseline.cost_cash.total, c.total, 1e-9);
  near(r2.scenario.cost_cash.total, r.scenario.cost_cash.total, 1e-9);
  for (const k of Object.keys(c)) assert.ok(!/review|labour|hours/.test(k), k);
  near(r.baseline.cost_internal.total, 4292631.58, 0.01);
});

test('cash + internal = activity total, both fixtures, both sides', () => {
  for (const A of [BASE, CORRECTED]) {
    const r = compute(inputs(), A);
    for (const s of [r.baseline, r.scenario]) near(s.cost_cash.total + s.cost_internal.total, s.cost.total, 1e-6);
  }
});

test('reviewer_fte_required per side', () => {
  const r = compute(inputs(), CORRECTED);
  near(r.baseline.reviewer_fte_required, 7.785346);
  near(r.scenario.reviewer_fte_required, 8.734778);
});

test('capacity bridge goldens (ECON-03)', () => {
  const b = compute(inputs(), CORRECTED).capacity_bridge;
  const want = {
    fte: 12, required_baseline: 7.785346, slack_baseline: 4.214654, required_programme_same_output: 4.367389,
    removable_same_output: 3.417957, required_programme: 8.734778, programme_added_load: 0.949432,
    required_without_programme: 15.570691, work_avoided: 6.835913, avoided_hires: 3.570691, unused: 3.265222,
    max_multiple_at_target: 2.747637, max_multiple_at_full: 3.232514, max_multiple_without_programme: 1.541357,
  };
  for (const [k, v] of Object.entries(want)) near(b[k], v, 1e-6);
});

test('INV-4: removable reviewers are not fte minus programme requirement', () => {
  const b = compute(inputs(), CORRECTED).capacity_bridge;
  near(b.removable_same_output, 3.417957);
  assert.ok(Math.abs(b.removable_same_output - (b.fte - b.required_programme_same_output)) > 4);
});

test('INV-1: reviewer pool conservation', () => {
  const b = compute(inputs(), CORRECTED).capacity_bridge;
  near(b.slack_baseline + b.removable_same_output, (b.required_programme - b.required_programme_same_output) + b.unused, 1e-9);
  near(b.work_avoided, b.avoided_hires + b.unused, 1e-9);
});

test('validation of the new optional fields', () => {
  for (const f of ['concept_internal_hours', 'marketer_rate_per_hour']) {
    for (const bad of [-1, NaN, Infinity]) {
      const r = compute(inputs(), { ...CORRECTED, [f]: bad });
      assert.equal(r.ok, false);
      assert.equal(r.errors[0].field, f);
      const r2 = compute(inputs(), { ...CORRECTED, [f]: { baseline: 1, scaled: bad } });
      assert.equal(r2.ok, false);
      assert.equal(r2.errors[0].field, f);
    }
  }
});

test('INV-11: multiplier 1 with equal sides is the identity', () => {
  const same = { ...CORRECTED };
  for (const k of Object.keys(same)) {
    const v = same[k];
    if (v && typeof v === 'object' && 'baseline' in v) same[k] = { baseline: v.baseline, scaled: v.baseline };
  }
  const r = compute(inputs({ multiplier: 1 }), same);
  assert.equal(r.ok, true);
  near(r.deltas.total_cost, 0, 1e-6);
  near(r.effects.total_cost.scale_effect, 0, 1e-6);
  near(r.effects.total_cost.programme_effect, 0, 1e-6);
  const b = r.capacity_bridge;
  near(b.required_programme, b.required_baseline, 1e-9);
  near(b.removable_same_output, 0, 1e-9);
  near(b.programme_added_load, 0, 1e-9);
});

test('INV-9: scale vs programme effects close (corrected fixture)', () => {
  const r = compute(inputs(), CORRECTED);
  const t = r.effects.total_cost;
  near(t.baseline, 6087115.79, 0.01);
  near(t.scale_only, 9241746.0, 0.01);
  near(t.with_programme, 8510272.32, 0.01);
  near(t.scale_effect, 3154630.21, 0.01);
  near(t.programme_effect, -731473.68, 0.01);
  for (const k of ['total_cost', 'cost_per_asset', 'cost_per_campaign_market']) {
    const e = r.effects[k];
    near(e.scale_effect + e.programme_effect, e.with_programme - e.baseline, 1e-6);
  }
  near(r.effects.cost_per_asset.scale_share, 0.80036, 1e-5);
});

test('INV-9: legacy fixture cost per asset scale share ties to 0.642', () => {
  near(compute(inputs(), BASE).effects.cost_per_asset.scale_share, 0.642, 1e-3);
});

test('brief-to-live scale effect is null with reason over_capacity', () => {
  const e = compute(inputs(), CORRECTED).effects.brief_to_live_days;
  assert.equal(e.scale_only, null);
  assert.equal(e.scale_effect, null);
  assert.equal(e.programme_effect, null);
  assert.equal(e.reason, 'over_capacity');
  near(e.baseline, 11.845828);
  near(e.with_programme, 7.524156);
});

test('erlangC, waitMMc, waitMM1 hand checks', () => {
  near(erlangC(2, 0.5), 1 / 3, 1e-12);
  near(erlangC(1, 0.7), 0.7, 1e-12);
  near(waitMM1(0.5515, 1.5), (1.5 * 0.5515) / 0.4485, 1e-12);
  near(waitMMc(1, 0.7, 1.5), waitMM1(0.7, 1.5), 1e-12);
});

test('pooled brief-to-live lower bound', () => {
  const r = compute(inputs(), CORRECTED);
  near(r.baseline.brief_to_live_days_pooled, 9.738979);
  near(r.scenario.brief_to_live_days_pooled, 4.758976);
  near(r.baseline.brief_to_live_days, 11.845828);
  near(r.scenario.brief_to_live_days, 7.524156);
  const over = compute(inputs({ reviewer_fte: 1 }), CORRECTED);
  assert.equal(over.scenario.brief_to_live_days_pooled, null);
  const frac = compute(inputs({ reviewer_fte: 0.5 }), CORRECTED);
  assert.equal(frac.baseline.brief_to_live_days_pooled, null);
});

test('chainSuccess goldens', () => {
  near(chainSuccess(0.95, 8, 8, 0), 0.66342, 1e-5);
  near(chainSuccess(0.95, 8, 4, 1), 0.93237, 1e-5);
  near(chainSuccess(0.98, 8, 8, 0), 0.85076, 1e-5);
});
