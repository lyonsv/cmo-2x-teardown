// Goldens for the portfolio engine (06-RESEARCH "Hand-calculated goldens"). The
// engine context is built inline from the 06-02 contract, like calc.test.js, so
// these tests do not depend on data.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { economics as economicsViaCalc, compute } from '../site/js/calc.js';
import { economics, validateEngine, workflowState, WORKFLOW_IDS, checkLedger, sumLedger, sensitivity } from '../site/js/workflows.js';

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
    agency_scales_with_output: true,
    chain: { p: 0.95, steps: 8, steps_between_gates: 8, retries: 0 },
    portfolio: ['W2', 'W4', 'W6', 'W9'],
    pilot: ['W2', 'W4', 'W6'],
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

test('IN-01: the roll-up range is adjusted for adoption and overhead like the central value', () => {
  for (const [adoption, levers] of [[0.5], [1, { review_overhead: 2 }], [0.3, { review_overhead: 0.5 }]]) {
    const ec = makeEc();
    ec.engine.adoption = adoption;
    const r = run(ec, levers).rollup;
    assert.ok(r.multiple_lo <= r.multiple + 1e-12 && r.multiple <= r.multiple_hi + 1e-12, `${adoption}: ${r.multiple_lo} ${r.multiple} ${r.multiple_hi}`);
  }
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
  // WR-06: the W5 row uses the bridge's required FTE, so its FTE and labour cost match
  // the reviewer bridge and scenario B's removable reviewers.
  near(w5.current.fte, 7.785346, 1e-6);
  near(w5.current.required_fte, 7.785346, 1e-6);
  near(w5.current.labour_cost, 7.785346 * 150000, 1);
  near(w5.current.labour_cost - w5.agent.labour_cost, r.scenarios.B.labour.removable_by_pool.W5 * 150000, 1e-6);
  near(w5.current.fte - w5.agent.fte, r.pools.W5.E, 1e-9);
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

// ---------------------------------------------------------------- Task 2: scenarios, investment, ledger

const M_A = { W1: 1.6667, W2: 2.0, W3: 1.5385, W4: 2.2222, W6: 2.5, W7: 1.6667, W8: 1.0, W9: 2.0, W10: 1.6667 };

test('scenario A: output bounded by the binding role, no labour cash change, agency grows with the output', () => {
  const A = run().scenarios.A;
  for (const [id, v] of Object.entries(M_A)) near(A.output.per_workflow[id], v, 1e-4);
  near(A.output.slice, 2.2222, 1e-4);
  assert.equal(A.labour.cash_change, 0);
  near(A.run_cost.total, 2133647.05, 1);
  near(A.agency.implied_growth, 5347435.9, 1);
  near(A.net, -2133647.05 - 5347435.9, 1);
  near(A.agency.scenario, A.agency.today + A.agency.implied_growth, 1e-6);
  const binds = A.agency.budget_binds;
  for (const id of ['W2', 'W3', 'W4', 'W6', 'W9']) assert.equal(binds[id], true, id);
  for (const id of ['W1', 'W7', 'W8', 'W10']) assert.equal(binds[id], false, id);
  assert.equal(A.payback_simple, null);
  assert.equal(A.payback_ramped, null);
  assert.equal(A.label, 'Same team, more output');
});

test('INV-3: scenario A has zero cash labour change at any adoption', () => {
  for (const adoption of [0, 0.3, 1]) {
    const ec = makeEc();
    ec.engine.adoption = adoption;
    assert.equal(run(ec).scenarios.A.labour.cash_change, 0);
  }
});

test('scenario A with agency held at today\'s budget caps output where the budget binds (CR-01)', () => {
  const grows = run();
  const ec = makeEc();
  ec.engine.agency_scales_with_output = false;
  const held = run(ec);
  const A = held.scenarios.A;
  // No growth is implied, so the net is the run cost alone.
  assert.equal(A.agency.implied_growth, 0);
  assert.ok(A.net > grows.scenarios.A.net);
  // W2 and W3 have no agency reduction, so their output cannot grow on a flat budget;
  // W4, W6 and W9 are capped at 1 / (1 - 0.4).
  near(A.output.per_workflow.W2, 1, 1e-9);
  near(A.output.per_workflow.W3, 1, 1e-9);
  for (const id of ['W4', 'W6', 'W9']) near(A.output.per_workflow[id], 1 / 0.6, 1e-9);
  for (const id of ['W1', 'W7', 'W8', 'W10']) near(A.output.per_workflow[id], M_A[id], 1e-4);
  // The largest multiple each team can carry is a labour limit and does not move.
  for (const [id, v] of Object.entries(M_A)) near(held.max_multipliers.per_pool[id].multiple, v, 1e-4);
});

test('CR-01: toggling agency_scales_with_output changes the headline metric when the budget binds', () => {
  const grows = run().metric.A;
  const ec = makeEc();
  ec.engine.agency_scales_with_output = false;
  const held = run(ec).metric.A;
  assert.ok(Math.abs(grows.org_after_platform - held.org_after_platform) > 0.05, `${grows.org_after_platform} vs ${held.org_after_platform}`);
  near(grows.org_after_platform, 1.4164, 1e-4);
  near(held.org_after_platform, 1.2505, 1e-4);
  near(grows.agency_growth_fte_equiv, 5347435.9 / 200000, 1e-5);
  assert.equal(held.agency_growth_fte_equiv, 0);
  // Without any binding budget (every workflow has headroom), the switch changes nothing.
  const free = makeEc();
  for (const w of free.workflows) w.agency = 0;
  const f1 = run(free).metric.A.org_after_platform;
  free.engine.agency_scales_with_output = false;
  near(run(free).metric.A.org_after_platform, f1, 1e-12);
});

test('scenario B goldens: removable FTE, savings, run lines, one-off, payback', () => {
  const B = run().scenarios.B;
  near(B.labour.removable_fte, 39.017957, 1e-5);
  near(B.labour.removable_by_pool.W5, 3.417957, 1e-6);
  assert.ok(Math.abs(B.labour.removable_by_pool.W5 - 7.63) > 1);
  near(B.labour.saving, 5852693.5, 1);
  near(B.agency.saving, 3600000, 1e-6);
  near(B.run_cost.platform_team, 1200000, 1e-6);
  near(B.run_cost.platform_tooling, 450000, 1e-6);
  near(B.run_cost.autonomy_overhead, 240000, 1e-6);
  near(B.run_cost.autonomy_overhead_hours, 1920, 1e-9);
  near(B.run_cost.inference, 9608, 1);
  near(B.run_cost.variant_ai, 33684.21, 0.01);
  near(B.run_cost.escape, 68210.53, 0.01);
  near(B.run_cost.total, 2001503.4, 1);
  near(B.net, 7451190.1, 1);
  near(B.one_off.build, 1500000, 1e-6);
  near(B.one_off.change, 360000, 1e-6);
  near(B.one_off.severance, 2926346.75, 1);
  near(B.one_off.total, 4786346.75, 1);
  near(B.year1_net, 2724843.35, 1);
  near(B.payback_simple, 0.642, 1e-3);
  near(B.payback_ramped, 1.277, 1e-3);
});

test('B never counts baseline reviewer slack; fragmented pools are reported', () => {
  const ec = makeEc();
  ec.engine.min_removable_fte = 5;
  const B = run(ec).scenarios.B;
  assert.equal(B.labour.removable_by_pool.W1, 0);
  assert.ok('W1' in B.labour.fragmented);
  near(B.labour.removable_by_pool.W5, 0);
  near(B.bridge.W1.unused_remaining, 2, 1e-9);
});

test('scenario C goldens', () => {
  const C = run().scenarios.C;
  near(C.labour.hires_without, 79.5707, 1e-4);
  near(C.labour.hires_with, 10.0, 1e-9);
  near(C.labour.avoided_hires, 69.5707, 1e-4);
  near(C.labour.unused, 7.2652, 1e-4);
  const want = { W1: 4.0, W2: 12.0, W3: 15.4, W4: 10.0, W6: 9.0, W7: 3.2, W8: 0, W9: 6.0, W10: 6.4, W5: 3.570691 };
  for (const [id, v] of Object.entries(want)) near(C.labour.per_pool[id].avoided, v, 1e-6);
  near(C.agency.without, 31500000, 1e-6);
  near(C.agency.scenario, 24300000, 1e-6);
  near(C.agency.today, 16000000, 1e-6);
  near(C.avoided_cost, 17635603.72, 3);
  near(C.run_cost.total, 2112447.6, 3);
  near(C.net_avoided, 15523156.11, 3);
  near(C.versus_today, 11912447.6, 3);
  // CR-02: the net is cash against today (spend rises), so there is no cash payback.
  near(C.net, -11912447.6, 3);
  assert.equal(C.payback_simple, null);
  near(C.payback_avoided, 0.12, 0.005);
  assert.equal(C.label, 'Growing demand, limited hiring');
  assert.equal(run().default_scenario, 'C');
});

test('WR-03: the counterfactual funded share applies to avoided agency growth as well as avoided hires', () => {
  const ec = makeEc();
  ec.engine.counterfactual_funded_share = 0;
  const r = run(ec);
  assert.equal(r.scenarios.C.avoided_cost, 0);
  near(r.scenarios.C.net_avoided, -r.scenarios.C.run_cost.total, 1e-6);
  assert.equal(r.ledger.filter((l) => l.scenario === 'C' && l.kind === 'avoided').length, 0);
  ec.engine.counterfactual_funded_share = 0.5;
  const half = run(ec).scenarios.C;
  near(half.avoided_cost, 17635603.72 / 2, 3);
  near(half.agency.avoided_funded, 7200000 / 2, 1e-6);
});

test('WR-05: released hours agree between the pools and the workflow states (an independent path)', () => {
  for (const [ec, levers] of [[makeEc()], [(() => { const e = makeEc(); e.engine.adoption = 0.5; return e; })()], [makeEc(), { review_overhead: 2 }]]) {
    const c = run(ec, levers).checks;
    assert.ok(c.released_hours_pools > 0);
    near(c.released_hours_gap, 0, 1e-6);
  }
});

test('WR-05: a source line saved in two scenarios is rejected', () => {
  const row = (id, scenario) => ({ id, scenario, line: 'agency:W1', counted_in: 'agency', scope: 'portfolio', kind: 'saving', amount: 10, source_line: 'agency:W1', source_amount: 1000 });
  assert.equal(checkLedger([row('a', 'B')]).ok, true);
  const r = checkLedger([row('a', 'B'), row('b', 'funding')]);
  assert.equal(r.ok, false);
  assert.match(r.errors[0].message, /more than one scenario/);
  assert.equal(checkLedger(run().ledger).ok, true);
});

test('INV-1: slack0 + E = redeployed + removed + unused_remaining, scenarios A and B, every pool', () => {
  const r = run();
  for (const key of ['A', 'B']) {
    for (const b of Object.values(r.scenarios[key].bridge)) {
      near(b.slack0 + b.E, b.redeployed + b.removed + b.unused_remaining, 1e-9);
      near(b.gap, 0, 1e-9);
    }
  }
  assert.equal(Object.keys(r.scenarios.A.bridge).length, 10);
});

test('reconciliation summary (07-06): available capacity equals where it went, baseline slack separate, hires tie to scenario C', () => {
  const r = run();
  for (const k of ['A', 'B', 'C']) {
    const t = r.reconciliation[k];
    near(t.slack0 + t.released + t.hires, t.redeployed + t.removed + t.unused, 1e-9);
    near(t.gap, 0, 1e-9);
    near(t.slack0, r.bridge.slack_baseline, 1e-9);
    near(t.released, r.scenarios.B.labour.removable_fte, 1e-9);
  }
  near(r.reconciliation.C.hires, r.scenarios.C.labour.hires_with, 1e-9);
  near(r.reconciliation.C.unused, r.scenarios.C.labour.unused, 1e-9);
  near(r.reconciliation.B.removed, r.scenarios.B.labour.removable_fte, 1e-9);
  assert.equal(r.reconciliation.A.removed, 0);
});

test('INV-1 general form for C: F + hires_with = requirement + unused, per pool', () => {
  const C = run().scenarios.C;
  for (const p of Object.values(C.labour.per_pool)) near(p.identity_gap, 0, 1e-9);
});

test('INV-7: avoided + unused = without - with for all ten pools', () => {
  const C = run().scenarios.C;
  assert.equal(Object.keys(C.labour.per_pool).length, 10);
  for (const p of Object.values(C.labour.per_pool)) near(p.avoided + p.unused, p.without - p.with, 1e-9);
});

test('INV-5: savings are bounded by their source line', () => {
  const r = run();
  const agency = Object.fromEntries(makeEc().workflows.map((w) => [w.id, w.agency]));
  for (const [id, v] of Object.entries(r.scenarios.B.agency.by_workflow)) assert.ok(v <= agency[id] + 1e-9, id);
  for (const [id, v] of Object.entries(r.scenarios.B.labour.removable_by_pool)) assert.ok(v <= r.pools[id].F + 1e-9, id);
  assert.deepEqual(checkLedger(r.ledger).errors, []);
  const bad = checkLedger([{ id: 'x', line: 'agency:W1', counted_in: 'agency', scope: 'portfolio', kind: 'saving', amount: 2000000, source_line: 'agency:W1', source_amount: 1500000 }]);
  assert.equal(bad.ok, false);
  assert.match(bad.errors[0].message, /INV-5/);
});

test('INV-6: ledger rejects a repeated id and two savings summing above one source line', () => {
  const row = (id, amount) => ({ id, line: 'agency:W1', counted_in: 'agency', scope: 'portfolio', kind: 'saving', amount, source_line: 'agency:W1', source_amount: 1000000 });
  assert.equal(checkLedger([row('a', 400000), row('a', 100000)]).ok, false);
  assert.equal(checkLedger([row('a', 600000), row('b', 600000)]).ok, false);
  assert.equal(checkLedger([row('a', 400000), row('b', 600000)]).ok, true);
});

test('INV-6: funding nets the variant saving already inside the slice delta', () => {
  const f = run().funding;
  near(f.netted_inside_delta, 116210.53, 0.01);
  near(f.slice_cash_rise, 935199.14, 0.01);
  near(f.reducible_agency, 3600000, 1e-6);
  // WR-04: like with like. At the higher volume agency spend rises ($5,347,436), so
  // nothing is released to cover the production cost rise.
  near(f.agency_change_at_volume, 5347435.9, 1);
  assert.equal(f.agency_released_at_volume, 0);
  assert.equal(f.coverage, 0);
  assert.equal(f.scope, 'cross-scope ratio');
});

test('INV-10: B labour saving is bounded by hours released plus reviewer headroom', () => {
  const r = run();
  let bound = 0;
  for (const p of Object.values(r.pools)) bound += p.E;
  assert.ok(r.scenarios.B.labour.saving <= bound * 150000 + 1e-6);
});

test('ledger: counted_in values, paid media and scope mixing', () => {
  const base = { id: 'm', line: 'media:search', counted_in: 'agency', scope: 'portfolio', kind: 'saving', amount: 1, source_line: 's', source_amount: 10 };
  assert.equal(checkLedger([{ ...base, counted_in: 'media' }]).ok, false);
  assert.equal(checkLedger([base]).ok, false);
  assert.equal(checkLedger([{ ...base, line: 'agency:media buying' }]).ok, false);
  assert.equal(checkLedger([{ ...base, line: 'agency:W1' }]).ok, true);
  for (const c of ['labour', 'agency', 'vendor', 'ai']) assert.equal(checkLedger([{ ...base, line: 'x', counted_in: c }]).ok, true);
  const r = run();
  const slice = r.ledger.filter((l) => l.scope === 'slice');
  assert.deepEqual(slice.map((l) => l.id), ['funding-netted-variants']);
  for (const l of r.ledger) if (l.scope !== 'slice') assert.equal(l.scope, 'portfolio');
  assert.equal(sumLedger(r.ledger).ok, false);
  assert.equal(sumLedger(r.ledger.filter((l) => l.scope === 'portfolio'), 'portfolio').ok, true);
  assert.equal(sumLedger(r.ledger.filter((l) => l.scope === 'slice'), 'portfolio').ok, false);
});

// ---------------------------------------------------------------- Task 3: primary metric and sensitivity

test('primary metric at defaults: org-wide, portfolio, B, C, pooled hours', () => {
  const m = run().metric;
  near(m.I0, 172800, 1e-6);
  near(m.D0, 200, 1e-9);
  // CR-01: the agency growth the extra output needs (26.7 FTE-equivalents org-wide)
  // is in the denominator.
  near(m.A.org_before_platform, 1.4539, 1e-3);
  near(m.A.org_after_platform, 1.4164, 1e-3);
  near(m.A.portfolio_before_platform, 1.8636, 1e-3);
  near(m.A.portfolio_after_platform, 1.7208, 1e-3);
  near(m.B.org, 1.342, 1e-3);
  near(m.B.D, 148.98, 0.01);
  near(m.C.org, 1.323, 1e-3);
  near(m.C.I, 294400, 1e-6);
  near(m.C.D, 257.5, 1e-9);
  near(m.pooled_hours_multiple, 1.4706, 1e-4);
  near(m.max_uniform_multiplier, 1.0, 1e-3);
  for (const [id, v] of Object.entries(M_A)) near(m.A.per_workflow[id], v, 1e-4);
  assert.match(m.definition, /W5 review excluded/);
});

test('W5 is not in the numerator: reviewer headcount leaves I0 unchanged', () => {
  const ec = makeEc();
  ec.inputs.reviewer_fte = 20;
  near(run(ec).metric.I0, 172800, 1e-6);
});

const SENS = {
  base: { org: 1.416, A: -7481083, B: 7451190, C: -11912448, rem: 39.02 },
  adoption: { low: { org: 1.134, A: -3923000, B: 2549000, C: -20207000, rem: 18.11 } },
  escape: { low: { A: -7405000, B: 7485000, C: -11844000 }, high: { A: -7784000, B: 7315000, C: -12185000 } },
  inference: { low: { A: -7472000, B: 7456000, C: -11903000 }, high: { A: -7550000, B: 7413000, C: -11987000 } },
  review_overhead: {
    low: { org: 1.462, A: -10482000, B: 8391000, C: -10774000, rem: 44.51 },
    high: { org: 1.306, A: -4416000, B: 5392000, C: -14711000, rem: 26.84 },
  },
};

test('sensitivity rows: order, shape and one-sided adoption', () => {
  const s = sensitivity(makeEc());
  assert.equal(s.ok, true);
  assert.deepEqual(s.rows.map((r) => r.id), ['adoption', 'escape', 'inference', 'review_overhead']);
  for (const r of s.rows) {
    for (const k of ['org_A_after', 'net_A', 'net_B', 'net_C', 'removable_B']) assert.ok(k in r.base, k);
  }
  assert.equal(s.rows[0].high, null);
  assert.ok(s.rows[0].low);
});

test('sensitivity goldens (multiples +-0.002, dollars +-2,000, FTE +-0.02)', () => {
  const s = sensitivity(makeEc());
  const b = s.rows[0].base;
  near(b.org_A_after, SENS.base.org, 0.002);
  near(b.net_A, SENS.base.A, 2000);
  near(b.net_B, SENS.base.B, 2000);
  near(b.net_C, SENS.base.C, 2000);
  near(b.removable_B, SENS.base.rem, 0.02);
  for (const row of s.rows) {
    for (const side of ['low', 'high']) {
      const want = SENS[row.id][side];
      if (!want) continue;
      const got = row[side];
      near(got.net_A, want.A, 2000);
      near(got.net_B, want.B, 2000);
      near(got.net_C, want.C, 2000);
      near(got.org_A_after, want.org ?? SENS.base.org, 0.002);
      near(got.removable_B, want.rem ?? SENS.base.rem, 0.02);
    }
  }
});

test('sensitivity ranking: adoption > review overhead > escape > inference', () => {
  assert.deepEqual(sensitivity(makeEc()).ranking, ['adoption', 'review_overhead', 'escape', 'inference']);
});

test('sensitivity never mutates ec', () => {
  const ec = makeEc();
  const before = structuredClone(ec);
  sensitivity(ec);
  assert.deepEqual(ec, before);
});

test('sensitivity fails closed on a bad context', () => {
  const ec = makeEc();
  ec.engine.adoption = 2;
  assert.equal(sensitivity(ec).ok, false);
});

test('levers: identity at 1 and review overhead trades against the net reduction', () => {
  const a = run();
  const b = run(makeEc(), { inference: 1, escape: 1, review_overhead: 1 });
  assert.deepEqual(a.scenarios.B.net, b.scenarios.B.net);
  const k2 = run(makeEc(), { review_overhead: 2 });
  near(k2.workflows.W1.r_eff, 0.2, 1e-9);
  assert.ok(k2.scenarios.B.net < a.scenarios.B.net);
});

test('every ledger row carries counted_in and scope and ids are unique', () => {
  const r = run();
  for (const l of r.ledger) {
    assert.ok(['labour', 'agency', 'vendor', 'ai'].includes(l.counted_in), l.id);
    assert.ok(typeof l.scope === 'string', l.id);
  }
  assert.equal(new Set(r.ledger.map((l) => l.id)).size, r.ledger.length);
});
