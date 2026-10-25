// Goldens for the portfolio engine (06-RESEARCH "Hand-calculated goldens"). The
// engine context is built inline from the 06-02 contract, like calc.test.js, so
// these tests do not depend on data.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { economics as economicsViaCalc, compute } from '../site/js/calc.js';
import { economics, validateEngine, workflowState, WORKFLOW_IDS } from '../site/js/workflows.js';

const near = (actual, expected, tol = 1e-6) => assert.ok(Math.abs(actual - expected) <= tol, `expected ${actual} to be within ${tol} of ${expected}`);

const ASM = {
  campaign_growth_share: 0.5,
  tier_mix: { baseline: [0.4, 0.35, 0.2, 0.05], scaled: [0.55, 0.3, 0.12, 0.03] },
  approval_yield: 0.95,
  auto_approval_share: { baseline: 0.2, scaled: 0.6 },
  sampling_rate: 0.05,
  escalation_rate: 0.05,
  review_minutes_per_variant: 12,
  rework_rate: 0.15,
  reviewer_hours_per_fte_year: 1200,
  reviewer_rate_per_hour: 125,
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
  concept_internal_hours: 35.2,
  marketer_rate_per_hour: 93.75,
};

const ROWS = [
  ['W1', 'Research and insight', 5, 160, 50, 1500000, 0.4, 0.25, 0.55, 2, 0.4, 15, 8, null, [30, 30000, 2000, 'frontier', 0.25, 3]],
  ['W2', 'Planning, briefing and ops', 12, 200, 96, 500000, 0.5, 0.3, 0.65, 3, 0, 10, 5, null, [25, 25000, 1500, 'frontier', 0.2, 2]],
  ['W3', 'Creative production (masters)', 22, 1000, 35.2, 6000000, 0.35, 0.2, 0.5, 2, 0, 12, 9, null, [12, 15000, 2000, 'frontier', 0.3, 2]],
  ['W4', 'Adaptation and localisation', 10, 200, 80, 2000000, 0.55, 0.4, 0.7, 3, 0.4, 15, 5, 'review_gate', [60, 20000, 2000, 'small', 0.15, 8]],
  ['W6', 'Publishing and activation', 9, 12000, 1.2, 1500000, 0.6, 0.4, 0.75, 3, 0.4, 3, 0.5, 'review_gate', [8, 8000, 500, 'small', 0.1, 1]],
  ['W7', 'SEO and answer-engine content', 4, 1600, 4, 1500000, 0.4, 0.25, 0.55, 2, 0.4, 14, 6, null, [10, 20000, 2000, 'frontier', 0.25, 1]],
  ['W8', 'Experimentation', 4, 80, 80, 500000, 0.3, 0.2, 0.45, 2, 0, 21, 18, 'traffic', [30, 30000, 3000, 'frontier', 0.25, 3]],
  ['W9', 'Measurement and reporting', 6, 600, 16, 1000000, 0.5, 0.35, 0.65, 3, 0.4, 5, 1, null, [15, 25000, 2000, 'frontier', 0.2, 2]],
  ['W10', 'Monitoring and optimisation', 8, 1600, 8, 1500000, 0.4, 0.25, 0.55, 3, 0.4, 7, 2, null, [6, 10000, 800, 'small', 0.1, 1]],
].map(([id, name, fte, units, h, agency, r, lo, hi, level, s, cycle_now, cycle_agent, constraint, p]) => ({
  id, name, fte, units, h, agency, cycle_now, constraint, r, lo, hi, level, s, cycle_agent,
  profile: { steps: p[0], tin: p[1], tout: p[2], tier: p[3], retry: p[4], judge: p[5] },
}));

export const makeEc = () => structuredClone({
  inputs: {
    multiplier: 2, marketing_budget: 78000000, marketing_fte: 120, campaigns_per_year: 40, concepts_per_campaign: 25,
    markets_per_campaign: 5, formats_per_market: 8, reviewer_fte: 12,
  },
  assumptions: ASM,
  fixed: { loaded_fte_cost: 150000, change_cost_per_fte: 3000 },
  engine: {
    productive_hours: 1600, out_of_scope_fte: 28, out_of_scope_uplift: 0.1,
    overhead_share: { L1: 0, L2: 0.2, L3: 0.08, L4: 0.08 }, autonomous_share_l3: 0.6,
    adoption: 1.0, year1_realisation: 0.5, escape_rate: 0.003, cost_per_escape: 1500,
    token_price: { frontier: { in: 4, out: 20 }, small: { in: 0.1, out: 0.5 } },
    judge_call: { tin: 15000, tout: 1000, tier: 'frontier' },
    demand_multiplier: 2.0, traffic_growth: 1.0, agency_cost_per_fte_equiv: 200000,
    build_one_off: 1500000, platform_team: { fte: 6, cost_per_fte: 200000 },
    autonomy_overhead_hours: { per_workflow_month: 24, calibration_month: 16 },
    severance_months: 6, min_removable_fte: 1.0, counterfactual_funded_share: 1.0,
    agency_scales_with_output: false,
    chain: { p: 0.95, steps: 8, steps_between_gates: 8, retries: 0 },
    portfolio: ['W2', 'W4', 'W6', 'W9'],
  },
  workflows: ROWS,
});

const run = (ec = makeEc(), levers) => {
  const r = economics(ec, levers);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  return r;
};

test('import order: calc.js first and workflows.js first both expose economics', () => {
  assert.equal(typeof economicsViaCalc, 'function');
  assert.equal(typeof economics, 'function');
  assert.equal(economicsViaCalc, economics);
  assert.deepEqual(WORKFLOW_IDS, ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10']);
});

test('fixture rows satisfy fte x 1,600 = units x h', () => {
  for (const w of makeEc().workflows) near(w.fte * 1600, w.units * w.h, 1e-9);
});

test('roll-up: 128,000 h, 56,960 h released (35.6 FTE), lo and hi, multiple on the 80 FTE', () => {
  const r = run().rollup;
  near(r.baseline_hours, 128000, 1e-6);
  near(r.released_hours, 56960, 1e-6);
  near(r.released_fte, 35.6, 1e-9);
  near(r.released_hours_lo, 36400, 1e-6);
  near(r.released_hours_hi, 76160, 1e-6);
  near(r.multiple, 1.8018, 1e-4);
  near(r.multiple_lo, 1.3974, 1e-4);
  near(r.multiple_hi, 2.4691, 1e-4);
});

test('agent state at baseline volume: W1 goldens', () => {
  const w = run().workflows.W1;
  near(w.agent.total_hours, 4800, 1e-6);
  near(w.agent.review_hours, 1600, 1e-6);
  near(w.agent.execution_hours, 3200, 1e-6);
  near(w.agent.fte, 3.0, 1e-9);
  near(w.agent.labour_cost, 450000, 1e-6);
  near(w.agent.agency_cost, 900000, 1e-6);
  near(w.agent.ai_cost, 998.4, 1e-6);
  near(w.current.cost_per_unit, 14062.5, 1e-6);
  near(w.agent.cost_per_unit, 8443.74, 0.01);
  near(w.current.total_hours, 8000, 1e-9);
  assert.equal(w.current.review_hours, 0);
  assert.equal(w.current.ai_cost, 0);
  assert.equal(w.current.autonomous_share, 0);
  assert.equal(w.current.cycle_days, 15);
  assert.equal(w.agent.cycle_days, 8);
});

test('agent state goldens: W3, W6, W8 and total AI', () => {
  const r = run();
  const w3 = r.workflows.W3.agent;
  near(w3.total_hours, 22880, 1e-6);
  near(w3.review_hours, 7040, 1e-6);
  near(w3.fte, 14.3, 1e-9);
  near(w3.agency_cost, 6000000, 1e-6);
  near(w3.ai_cost, 1720, 1e-6);
  const w6 = r.workflows.W6;
  near(w6.agent.total_hours, 5760, 1e-6);
  near(w6.agent.review_hours, 1152, 1e-6);
  near(w6.current.cost_per_unit, 237.5, 1e-9);
  near(w6.agent.cost_per_unit, 120.09, 0.01);
  near(r.workflows.W8.agent.total_hours, 4480, 1e-6);
  near(r.workflows.W8.agent.review_hours, 1280, 1e-6);
  let ai = 0;
  for (const id of ['W1', 'W2', 'W3', 'W4', 'W6', 'W7', 'W8', 'W9', 'W10']) ai += r.workflows[id].agent.ai_cost;
  near(ai, 9608, 1);
});

test('autonomous share: 0 at L2, 0.6 x adoption at L3', () => {
  const r = run();
  assert.equal(r.workflows.W1.agent.autonomous_share, 0);
  assert.equal(r.workflows.W2.agent.autonomous_share, 0.6);
});

test('W5 states come from compute()', () => {
  const r = run();
  const w5 = r.workflows.W5;
  near(w5.current.fte, 6.6175, 1e-4);
  near(w5.current.required_fte, 7.785346, 1e-6);
  near(w5.current.autonomous_share, 0.19, 1e-9);
  near(w5.agent.autonomous_share, 0.57, 1e-9);
  near(w5.current.review_hours, 193.68, 0.01);
  near(w5.agent.review_hours, 581.05, 0.01);
  near(w5.agent_at_multiplier.review_hours, 1162.11, 0.01);
  const c = compute(makeEc().inputs, makeEc().assumptions);
  near(w5.agent_at_multiplier.required_fte, c.scenario.reviewer_fte_required, 1e-9);
});

test('every state carries the contract keys', () => {
  const r = run();
  const keys = ['units', 'hours_per_unit', 'review_hours', 'total_hours', 'fte', 'labour_cost', 'agency_cost', 'ai_cost', 'cost_per_unit', 'cycle_days', 'autonomous_share'];
  for (const id of WORKFLOW_IDS) {
    for (const state of ['current', 'agent']) {
      for (const k of keys) assert.ok(k in r.workflows[id][state], `${id}.${state}.${k}`);
    }
  }
  assert.ok('cycle_days_pooled' in r.workflows.W5.agent);
});

test('workflowState is a pure function of its arguments', () => {
  const ec = makeEc();
  const w = ec.workflows[0];
  const a = workflowState(w, ec.engine, ec.fixed, 1, 1, {});
  const b = workflowState(w, ec.engine, ec.fixed, 1, 1, { inference: 1, escape: 1, review_overhead: 1 });
  assert.deepEqual(a, b);
  const half = workflowState(w, ec.engine, ec.fixed, 1, 0.5, {});
  near(half.total_hours, 8000 * (1 - 0.2), 1e-9);
});

test('reviewer bridge equals compute().capacity_bridge', () => {
  const r = run();
  const b = r.bridge;
  near(b.slack_baseline, 4.214654);
  near(b.programme_added_load, 0.949432);
  near(b.work_avoided, 6.835913);
  near(b.removable_same_output, 3.417957);
  near(r.pools.W5.slack0, 4.214654);
  near(r.pools.W5.E, 3.417957);
});

test('INV-8: released hours stay inside the pools and the reviewer pool is drawn once', () => {
  const r = run();
  assert.ok(r.pool_totals.total_released_hours <= 120 * 1600 + 12 * 1200);
  assert.equal(r.pool_totals.pools_counted.filter((id) => id === 'W5').length, 1);
  const ec = makeEc();
  ec.workflows.push({ ...structuredClone(ec.workflows.find((w) => w.id === 'W4')), id: 'W4b', constraint: 'review_gate' });
  const r2 = run(ec);
  assert.equal(r2.pool_totals.pools_counted.filter((id) => id === 'W5').length, 1);
  near(r2.pool_totals.reviewer_released_hours, r.pool_totals.reviewer_released_hours, 1e-9);
  near(r2.pools.W5.E, r.pools.W5.E, 1e-9);
});

test('maximum sustainable multipliers per pool, reviewers and uniform', () => {
  const m = run().max_multipliers;
  const want = { W1: 1.6667, W2: 2.0, W3: 1.5385, W4: 2.2222, W6: 2.5, W7: 1.6667, W8: 1.0, W9: 2.0, W10: 1.6667 };
  for (const [id, v] of Object.entries(want)) near(m.per_pool[id].multiple, v, 1e-4);
  assert.equal(m.per_pool.W8.binding, 'traffic');
  assert.equal(m.per_pool.W4.binding, 'pool');
  near(m.reviewers.at_target, 2.747637);
  near(m.reviewers.at_full, 3.232514);
  near(m.reviewers.without_programme, 1.541357);
  near(m.uniform.value, 1.0, 1e-9);
  assert.equal(m.uniform.binding, 'W8');
  near(m.uniform_excluding_traffic.value, 1.538462, 1e-6);
  assert.equal(m.uniform_excluding_traffic.binding, 'W3');
});

test('review gate binds when reviewers are scarce', () => {
  const ec = makeEc();
  ec.inputs.reviewer_fte = 5;
  const r = run(ec);
  assert.equal(r.max_multipliers.per_pool.W4.binding, 'review_gate');
  near(r.max_multipliers.per_pool.W4.multiple, 5 / r.pools.W5.reqP1, 1e-9);
});

test('validateEngine returns errors and economics fails closed', () => {
  assert.deepEqual(validateEngine(makeEc()), []);
  const cases = [
    (ec) => { delete ec.workflows[0].agency; },
    (ec) => { ec.workflows[2].fte = -1; },
    (ec) => { ec.workflows[0].r = 0.95; },
    (ec) => { ec.workflows[0].level = 5; },
    (ec) => { ec.workflows[0].level = 0; },
    (ec) => { ec.engine.adoption = 1.5; },
    (ec) => { ec.engine.adoption = -0.1; },
    (ec) => { ec.workflows[1].h = NaN; },
    (ec) => { delete ec.engine.platform_team; },
  ];
  for (const mutate of cases) {
    const ec = makeEc();
    mutate(ec);
    const errs = validateEngine(ec);
    assert.ok(errs.length > 0);
    const r = economics(ec);
    assert.equal(r.ok, false);
    assert.ok(r.errors.length > 0);
  }
  assert.equal(economics(null).ok, false);
  assert.equal(economics(undefined).ok, false);
  assert.equal(economics({}).ok, false);
  assert.equal(economics(makeEc(), { inference: -1 }).ok, false);
});

test('economics does not mutate its input', () => {
  const ec = makeEc();
  const before = structuredClone(ec);
  run(ec);
  assert.deepEqual(ec, before);
});
