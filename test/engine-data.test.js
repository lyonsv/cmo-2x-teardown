// Engine inputs live in data.js (plan 06-04): contract shape, default goldens, grades.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assumptions, sources, engineValues, engineContext, defaultInputs, defaultAssumptions, modelContext, GRADES, ALLOWED_PAIRS } from '../site/js/data.js';
import { economics } from '../site/js/calc.js';

const engineRows = Object.values(assumptions).filter((e) => e.kind === 'engine');
const near = (x, y, tol) => assert.ok(Math.abs(x - y) <= tol, `${x} vs ${y}`);

test('engineContext has exactly the 06-02 contract keys', () => {
  const ec = engineContext();
  assert.deepEqual(Object.keys(ec).sort(), ['assumptions', 'engine', 'fixed', 'inputs', 'workflows']);
  assert.deepEqual(ec.workflows.map((w) => w.id), ['W1', 'W2', 'W3', 'W4', 'W6', 'W7', 'W8', 'W9', 'W10']);
  for (const w of ec.workflows) {
    for (const f of ['name', 'fte', 'units', 'h', 'agency', 'cycle_now', 'constraint', 'r', 'lo', 'hi', 'level', 's', 'cycle_agent', 'profile']) assert.ok(f in w, `${w.id}.${f}`);
    near(w.fte * ec.engine.productive_hours, w.units * w.h, 1e-9);
  }
  for (const k of ['productive_hours', 'out_of_scope_fte', 'overhead_share', 'token_price', 'judge_call', 'platform_team', 'autonomy_overhead_hours', 'chain', 'portfolio', 'agency_scales_with_output']) assert.ok(k in ec.engine, k);
  assert.deepEqual(ec.engine.token_price.frontier, { in: 4, out: 20 });
  assert.deepEqual(ec.fixed, modelContext().fixed);
});

test('economics(engineContext()) reproduces the 06-02 goldens', () => {
  const e = economics(engineContext());
  assert.equal(e.ok, true);
  near(e.scenarios.B.net, 7451190, 2);
  near(e.scenarios.C.net, 15523156, 2);
  near(e.scenarios.A.net, -2133647, 2);
  near(e.metric.A.org_after_platform, 1.600, 1e-3);
  near(e.metric.A.portfolio_after_platform, 1.989, 1e-3);
  near(e.funding.coverage, 3.725, 1e-3);
});

test('overrides move one input and nothing is mutated', () => {
  const before = JSON.stringify(engineValues());
  const v = engineValues();
  v.build_one_off = 3000000;
  v['token_price.frontier'] = { in: 8, out: 40 };
  const ec = engineContext(undefined, v);
  assert.equal(ec.engine.build_one_off, 3000000);
  assert.deepEqual(ec.engine.token_price.frontier, { in: 8, out: 40 });
  assert.equal(economics(ec).ok, true);
  ec.engine.token_price.small.in = 99;
  ec.workflows[0].fte = 99;
  assert.equal(JSON.stringify(engineValues()), before);
  assert.equal(engineValues().build_one_off, 1500000);
});

test('defaultInputs and defaultAssumptions keep their key sets', () => {
  assert.deepEqual(Object.keys(defaultInputs()).sort(), ['campaigns_per_year', 'concepts_per_campaign', 'formats_per_market', 'marketing_budget', 'marketing_fte', 'markets_per_campaign', 'multiplier', 'reviewer_fte']);
  assert.deepEqual(Object.keys(defaultAssumptions()).sort(), [
    'ai_share_of_tooling', 'ai_share_of_variant_cost', 'approval_yield', 'auto_approval_share', 'build_days', 'campaign_growth_share', 'concept_internal_hours',
    'escalation_rate', 'marketer_rate_per_hour', 'master_concept_cost', 'review_minutes_per_variant', 'review_service_days', 'reviewer_hours_per_fte_year',
    'reviewer_rate_per_hour', 'rework_rate', 'rights_cost_per_concept', 'sampling_rate', 'storage_cost_per_variant', 'target_utilisation', 'tier_mix',
    'tooling_cost_annual', 'variant_cost',
  ]);
});

test('every engine row is graded, evidenced and explained', () => {
  assert.equal(engineRows.length, 42); // 23 globals, asm-productive-hours, 18 workflow rows
  for (const e of engineRows) {
    assert.ok(GRADES.includes(e.grade), e.id);
    assert.ok(['illustrative', 'hypothesis'].includes(e.evidence), e.id);
    assert.ok(ALLOWED_PAIRS[e.evidence].includes(e.grade), `${e.id}: pair`);
    for (const f of ['basis', 'unit', 'display', 'label']) assert.ok(typeof e[f] === 'string' && e[f].trim(), `${e.id}.${f}`);
    assert.doesNotMatch(e.basis, /anthropic|openai|claude|gpt/i, `${e.id}: vendor name in basis`);
  }
  assert.equal(Object.keys(engineValues()).length, engineRows.length);
});

test('new sources: vendor price lists flagged, BLS benchmark, tau-bench modelled, all cited', () => {
  for (const k of ['anthropic-pricing-2026', 'openai-pricing-2026']) {
    assert.equal(sources[k].publisherType, 'vendor');
    assert.equal(sources[k].flag, 'vendor-claimed');
    assert.equal(sources[k].evidence, 'observed');
  }
  assert.equal(sources['bls-software-developers-2025'].publisherType, 'government');
  assert.equal(sources['bls-software-developers-2025'].grade, 'Benchmark');
  assert.equal(sources['bls-software-developers-2025'].evidence, 'benchmark');
  assert.equal(sources['tau-bench-2024'].publisherType, 'academic');
  assert.equal(sources['tau-bench-2024'].grade, 'Modelled');
  const cited = new Set(engineRows.flatMap((e) => e.cites ?? []));
  for (const k of ['anthropic-pricing-2026', 'openai-pricing-2026', 'bls-software-developers-2025', 'tau-bench-2024', 'multi-agent-token-note-2025', 'agency-billing-survey-2026']) {
    assert.ok(cited.has(k), `${k} is not cited by an engine row`);
  }
});

test('the register carries generated rows and the generator is idempotent', async () => {
  const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/<!-- engine-register:start -->/g) ?? []).length, 1);
  assert.equal((html.match(/<!-- engine-register:end -->/g) ?? []).length, 1);
  const { apply } = await import('../scripts/gen-register-rows.mjs');
  assert.equal(apply(html), html);
});

// ---- Phase 6 plan 05: generated engine claims ----
import { claims } from '../site/js/data.js';
import { formatValue } from '../site/js/format.js';
import { compute, sensitivity } from '../site/js/calc.js';

const econ = () => Object.values(claims).filter((c) => c.id.startsWith('econ-'));
const at = (obj, path) => path.split('.').reduce((x, k) => x?.[k], obj);

test('formats x2, num2, years1', () => {
  assert.equal(formatValue(1.6, 'x2'), '1.60x');
  assert.equal(formatValue(39.018, 'num2'), '39.02');
  assert.equal(formatValue(1.2767, 'years1'), '1.3 years');
  assert.equal(formatValue(-1.234, 'x2'), '−1.23x');
  assert.equal(formatValue(-1.234, 'num2'), '−1.23');
  assert.equal(formatValue(-2.5, 'years1'), '−2.5 years');
});

test('econ claims: at least 250, unique, every ref is a register assumption, values computed exactly', () => {
  const list = econ();
  assert.ok(list.length >= 250, `${list.length}`);
  assert.equal(new Set(list.map((c) => c.id)).size, list.length);
  const ec = engineContext();
  const e = { ...economics(ec), sensitivity: sensitivity(ec) };
  const r = compute(defaultInputs(), defaultAssumptions());
  for (const c of list) {
    assert.ok(assumptions[c.ref], `${c.id}: ref ${c.ref}`);
    assert.ok(c.econ !== undefined || c.derived !== undefined, c.id);
    assert.equal(c.value, at(c.econ !== undefined ? e : r, c.econ ?? c.derived), `${c.id} drifted`);
    assert.equal(c.display, formatValue(c.value, c.format), c.id);
    assert.ok(Number.isFinite(c.value), c.id);
  }
});

test('econ claim goldens', () => {
  near(claims['econ-scen-B-net'].value, 7451190, 2);
  assert.equal(claims['econ-metric-org_after_platform'].display, '1.60x');
  assert.equal(claims['econ-metric-portfolio_after_platform'].display, '1.99x');
  assert.equal(claims['econ-bridge-slack_baseline'].display, '4.21');
  assert.equal(claims['econ-funding-coverage'].display, '3.7x');
  assert.equal(claims['econ-sens-adoption-high-net_B'], undefined, 'adoption has no high case');
  assert.equal(claims['econ-scen-A-payback_simple'], undefined);
});

test('econ claims: values move when the engine inputs move (no stale constants)', () => {
  const values = engineValues();
  values.escape_rate *= 3;
  const moved = { ...economics(engineContext(modelContext(), values)) };
  assert.notEqual(moved.scenarios.B.net, claims['econ-scen-B-net'].value);
});
