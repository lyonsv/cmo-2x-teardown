import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compute } from '../site/js/calc.js';
import { formatValue } from '../site/js/format.js';
import { FIELDS, ROUTES, SCENARIOS, COMPUTE_FIELD_TO_KEY } from '../site/js/fields.js';
import {
  defaultValues, toCompute, run, ROUTE_SHARE, LEGACY_SCENARIOS, OUTPUT_DEPS, weakestGrade, RESULT_ROWS, present, scenarioOutcomes, sensitivity, SENSITIVITY_STEP,
} from '../site/js/model.js';
import { modelContext, assumptions, defaultInputs, defaultAssumptions } from '../site/js/data.js';

const ctx = modelContext();
// The three first-edition programme hypotheses are Speculative at the shipped grades (regraded before
// publish). Tests that inject one weak input restore them to Modelled so the injected input alone decides.
const ISOLATED = { 'asm-auto-approval': 'Modelled', 'asm-variant-cost': 'Modelled', 'asm-tooling': 'Modelled' };
const read = (p) => readFileSync(new URL(`../site/js/${p}`, import.meta.url), 'utf8');

test('format.js: new kinds days1 and pctchg1', () => {
  assert.equal(formatValue(11.85, 'days1').endsWith(' days'), true);
  assert.equal(formatValue(7.52, 'days1'), '7.5 days');
  assert.equal(formatValue(0.042, 'pctchg1'), '+4.2%');
  assert.equal(formatValue(-0.031, 'pctchg1'), '−3.1%');
  assert.equal(formatValue(0, 'pctchg1'), '0.0%');
  assert.equal(formatValue(-0.00001, 'pctchg1'), '0.0%');
});

test('FIELDS: 12 rows in order, unique keys, every asm id exists', () => {
  assert.deepEqual(FIELDS.map((x) => x.key), [
    'campaigns', 'concepts', 'markets', 'marketers', 'reviewers', 'minutes', 'vcost', 'mconcept', 'yield', 'rework', 'auto1', 'auto2',
  ]);
  assert.equal(new Set(FIELDS.map((x) => x.key)).size, 12);
  for (const x of FIELDS) assert.ok(assumptions[x.asm], `${x.key}: ${x.asm} missing`);
  assert.deepEqual(SCENARIOS, ['a', 'b', 'c']);
  assert.deepEqual(LEGACY_SCENARIOS, { redeploy: 'a', hold: 'b', reduce: 'b' });
  assert.equal(FIELDS.find((x) => x.key === 'rework').zeroOk, true);
  assert.equal(FIELDS.find((x) => x.key === 'campaigns').zeroOk, false);
  for (const k of Object.values(COMPUTE_FIELD_TO_KEY)) assert.ok(FIELDS.some((x) => x.key === k));
});

test('markets and formats per market reproduce forty variants per concept', () => {
  assert.equal(assumptions['asm-formats-per-market'].value * assumptions['asm-markets'].value, 40);
  assert.equal(ctx.inputs.formats_per_market, 8);
  assert.equal(ctx.inputs.markets_per_campaign, 5);
  assert.equal('formats_per_locale' in ctx.fixed, false);
  assert.equal('default_locales' in ctx.fixed, false);
});

test('defaultValues route maps to asm-growth-route through ROUTE_SHARE', () => {
  assert.deepEqual(ROUTE_SHARE, { both: 0.5, campaigns: 1, markets: 0 });
  assert.deepEqual(ROUTES, ['both', 'campaigns', 'markets']);
  assert.equal(ROUTE_SHARE[defaultValues(ctx).route], assumptions['asm-growth-route'].value);
  assert.equal(defaultValues(ctx).route, 'both');
});

test('defaultValues fails loudly when the registered growth share matches no route (WR-05)', () => {
  for (const share of [0.25, 0.75, 2, NaN, undefined]) {
    const drifted = { ...ctx, assumptions: { ...ctx.assumptions, campaign_growth_share: share } };
    assert.throws(() => defaultValues(drifted), /asm-growth-route/, String(share));
  }
  for (const r of ROUTES) {
    const exact = { ...ctx, assumptions: { ...ctx.assumptions, campaign_growth_share: ROUTE_SHARE[r] } };
    assert.equal(defaultValues(exact).route, r);
  }
});

test('defaultValues reads the data.js defaults', () => {
  assert.deepEqual(defaultValues(ctx), {
    campaigns: 40, concepts: 25, markets: 5, marketers: 120, reviewers: 12, minutes: 12, vcost: 0.8, mconcept: 1200,
    yield: 0.95, rework: 0.15, auto1: 0.2, auto2: 0.6, route: 'both', scenario: 'c',
  });
});

test('identity: run(defaults) equals compute(defaultInputs(), defaultAssumptions())', () => {
  const r = run(defaultValues(ctx), ctx);
  assert.equal(r.ok, true);
  const direct = compute(defaultInputs(), defaultAssumptions());
  assert.deepEqual(r.result, direct);
  assert.equal(r.result.scenario.cost_per_asset.toFixed(2), '106.38'); // 8,510,272 / 80,000 approved assets
  assert.equal(r.result.scenario.utilisation.toFixed(3), '0.619');
});

test('toCompute maps markets, route and the variant cost pair', () => {
  const { inputs, assumptions: a } = toCompute({ ...defaultValues(ctx), markets: 6, vcost: 1.5, auto1: 0.1, auto2: 0.5 }, ctx);
  assert.equal(inputs.markets_per_campaign, 6);
  assert.equal(inputs.formats_per_market, 8);
  assert.equal('variants_per_concept' in inputs, false);
  assert.equal(a.campaign_growth_share, 0.5);
  assert.equal(toCompute({ ...defaultValues(ctx), route: 'campaigns' }, ctx).assumptions.campaign_growth_share, 1);
  assert.equal(toCompute({ ...defaultValues(ctx), route: 'markets' }, ctx).assumptions.campaign_growth_share, 0);
  for (const bad of ['evil', '__proto__', 'constructor', '', undefined, 3]) {
    assert.equal(toCompute({ ...defaultValues(ctx), route: bad }, ctx).assumptions.campaign_growth_share, 0.5, String(bad));
  }
  assert.deepEqual(a.variant_cost, { baseline: 4, scaled: 1.5 });
  assert.deepEqual(a.auto_approval_share, { baseline: 0.1, scaled: 0.5 });
});

test('monotonicity: more markets gives more variants and more total cost', () => {
  const a = run(defaultValues(ctx), ctx).result;
  const b = run({ ...defaultValues(ctx), markets: 6 }, ctx).result;
  assert.ok(b.scenario.variants_per_year > a.scenario.variants_per_year);
  assert.ok(b.scenario.cost.total > a.scenario.cost.total);
});

test('CFO claim: cost per asset at 2x is below baseline at defaults', () => {
  const r = run(defaultValues(ctx), ctx).result;
  assert.ok(r.scenario.cost_per_asset < r.baseline.cost_per_asset);
});

test('run maps compute errors to field keys', () => {
  const keyOf = (over) => {
    const r = run({ ...defaultValues(ctx), ...over }, ctx);
    assert.equal(r.ok, false);
    return r.errors.map((e) => e.key);
  };
  assert.ok(keyOf({ reviewers: 0 }).includes('reviewers'));
  assert.ok(keyOf({ auto2: 0.9 }).includes('auto2'));
  assert.ok(keyOf({ yield: 0 }).includes('yield'));
  assert.ok(keyOf({ markets: 0 }).includes('markets'));
  // marketing FTE is not a compute() input, but run() still validates it and keys the error to the field (WR-03).
  assert.equal(Object.values(COMPUTE_FIELD_TO_KEY).includes('marketers'), false);
  for (const bad of [0, -50, NaN, Infinity, -Infinity, undefined, '120']) {
    const r = run({ ...defaultValues(ctx), marketers: bad }, ctx);
    assert.equal(r.ok, false, String(bad));
    assert.deepEqual(r.errors, [{ key: 'marketers', message: 'Marketing FTE: enter a number above 0.' }], String(bad));
    const s = scenarioOutcomes({ ...defaultValues(ctx), marketers: bad }, ctx, 'a');
    assert.equal(s.ok, false, String(bad));
    assert.ok(s.errors.some((e) => e.key === 'marketers'), String(bad));
  }
  // A marketers error sits alongside compute() errors, not instead of them.
  assert.deepEqual(keyOf({ marketers: -1, reviewers: 0 }).sort(), ['marketers', 'reviewers']);
  // keyFor maps the growth share error to the route field when an unknown route falls back to an invalid default share.
  const badRoute = run({ ...defaultValues(ctx), route: 'evil' }, { ...ctx, assumptions: { ...ctx.assumptions, campaign_growth_share: 2 } });
  assert.equal(badRoute.ok, false);
  assert.ok(badRoute.errors.some((e) => e.key === 'route'));
  for (const e of run({ ...defaultValues(ctx), reviewers: 0 }, ctx).errors) assert.equal(typeof e.message, 'string');
});

test('OUTPUT_DEPS: ten outputs, valid ids, reviewer and marketing FTE are not cost deps', () => {
  assert.deepEqual(Object.keys(OUTPUT_DEPS), RESULT_ROWS.map((r) => r.id));
  for (const [out, ids] of Object.entries(OUTPUT_DEPS)) {
    assert.ok(ids.length > 0);
    assert.equal(new Set(ids).size, ids.length, `${out} lists an id twice (IN-03)`);
    for (const id of ids) assert.ok(assumptions[id], `${out}: ${id} is not an assumption`);
  }
  assert.deepEqual(OUTPUT_DEPS.cost_per_asset.slice(0, 5), [
    'asm-markets', 'asm-master-concept-cost', 'asm-auto-approval', 'asm-review-minutes', 'asm-approval-yield',
  ]);
  assert.deepEqual(OUTPUT_DEPS.campaign_markets, ['asm-campaigns', 'asm-markets', 'asm-growth-route']);
  assert.deepEqual(OUTPUT_DEPS.cost_per_campaign_market, OUTPUT_DEPS.cost_per_asset);
  for (const id of ['asm-markets', 'asm-formats-per-market', 'asm-growth-route']) assert.ok(OUTPUT_DEPS.cost_per_asset.includes(id), id);
  for (const ids of Object.values(OUTPUT_DEPS)) for (const gone of ['asm-locales', 'asm-formats-per-locale', 'asm-concept-growth']) assert.ok(!ids.includes(gone), gone);
  for (const out of ['cost_per_asset', 'total_cost', 'ai_spend']) {
    assert.ok(!OUTPUT_DEPS[out].includes('asm-reviewer-fte'), out);
    assert.ok(!OUTPUT_DEPS[out].includes('asm-marketing-fte'), out);
  }
});

test('weakestGrade: order Speculative < Modelled < Benchmark, ref is first id with that grade', () => {
  const ids = ['asm-a', 'asm-b', 'asm-c'];
  assert.deepEqual(weakestGrade(ids, { 'asm-a': 'Modelled', 'asm-b': 'Modelled', 'asm-c': 'Modelled' }), { grade: 'Modelled', ref: 'asm-a' });
  assert.deepEqual(weakestGrade(ids, { 'asm-a': 'Benchmark', 'asm-b': 'Modelled', 'asm-c': 'Speculative' }), { grade: 'Speculative', ref: 'asm-c' });
  assert.deepEqual(weakestGrade(ids, { 'asm-a': 'Benchmark', 'asm-b': 'Benchmark', 'asm-c': 'Benchmark' }), { grade: 'Benchmark', ref: 'asm-a' });
  assert.deepEqual(weakestGrade(['asm-b', 'asm-c'], { 'asm-a': 'Speculative', 'asm-b': 'Modelled', 'asm-c': 'Modelled' }), { grade: 'Modelled', ref: 'asm-b' });
});

test('weakest grade flows into present(): injected Speculative input', () => {
  const grades = { ...ctx.grades, ...ISOLATED, 'asm-review-minutes': 'Speculative' };
  const p = present(defaultValues(ctx), { ...ctx, grades });
  const row = (id) => p.rows.find((r) => r.id === id);
  assert.deepEqual([row('cost_per_asset').grade, row('cost_per_asset').ref], ['Speculative', 'asm-review-minutes']);
  assert.equal(row('campaign_markets').grade, 'Modelled');
  assert.equal(row('campaign_markets').ref, OUTPUT_DEPS.campaign_markets[0]);
});

test('present(defaults): ten rows in order with golden texts', () => {
  const p = present(defaultValues(ctx), ctx);
  assert.equal(p.ok, true);
  assert.equal(p.overCapacity, false);
  assert.deepEqual(p.rows.map((r) => r.id), RESULT_ROWS.map((r) => r.id));
  assert.deepEqual(p.rows.map((r) => r.label), RESULT_ROWS.map((r) => r.label));
  const row = (id) => p.rows.find((r) => r.id === id);
  assert.equal(row('cost_per_asset').base.text, '$152.18');
  assert.equal(row('cost_per_asset').scaled.text, '$106.38');
  assert.equal(row('cost_per_asset').change.text, '−30%');
  assert.equal(row('campaign_markets').base.text, '50');
  assert.equal(row('campaign_markets').scaled.text, '100');
  assert.equal(row('campaign_markets').change.text, '+100%');
  assert.equal(row('brief_to_live').base.text, '11.8 days');
  assert.equal(row('brief_to_live').scaled.text, '7.5 days');
  assert.equal(row('brief_to_live').change.text, '−36%');
  assert.equal(row('cost_per_campaign_market').base.text, '$30,436');
  assert.equal(row('cost_per_campaign_market').scaled.text, '$21,276');
  assert.equal(row('cost_per_campaign_market').change.text, '−30%');
  assert.equal(row('total_cost').base.text, '$6.09M');
  assert.equal(row('total_cost').scaled.text, '$8.51M');
  assert.equal(row('total_cost').change.text, '+40%');
  assert.equal(row('budget_share').base.text, '7.8%');
  assert.equal(row('budget_share').scaled.text, '10.9%');
  assert.equal(row('budget_share').change.text, '+3.1 points');
  assert.equal(row('utilisation').base.text, '55.1%');
  assert.deepEqual(p.rows.slice(0, 4).map((r) => r.id), ['campaign_markets', 'brief_to_live', 'cost_per_asset', 'cost_per_campaign_market']);
  assert.equal(p.rows.length, 10);
  assert.equal(row('ai_spend').scaled.text, '$340,421');
  assert.equal(row('utilisation').scaled.text, '61.9%');
  assert.equal(row('break_even').scaled.text, '41%');
  assert.equal(row('capacity_floor').scaled.text, '29%');
  assert.equal(row('break_even').base.text, 'Not applicable');
  assert.equal(row('break_even').change.text, 'Not applicable');
  for (const r of p.rows) {
    // Shipped grades: each row carries the weakest grade of its inputs and links the first input at that grade.
    const w = weakestGrade(OUTPUT_DEPS[r.id], ctx.grades);
    assert.equal(r.grade, w.grade);
    assert.equal(r.ref, w.ref);
  }
  const rr = Object.fromEntries(RESULT_ROWS.map((x) => [x.id, x]));
  for (const r of p.rows) {
    if (r.base.value !== undefined) assert.equal(r.base.text, formatValue(r.base.value, rr[r.id].format));
  }
  assert.equal(p.summary, 'With more campaigns and more markets, at 2x you have 100 campaign-markets launched per quarter, brief to live in 7.5 days, at $106.38 per approved asset and $21,276 per campaign-market, with reviewers at 62% of capacity.');
  assert.ok(!/per head|cycle/i.test(p.summary));
});

test('route effect: markets cheapest, campaigns dearest, headline identical; summary names the route', () => {
  const at = (route) => present({ ...defaultValues(ctx), route }, ctx);
  const row = (p, id) => p.rows.find((r) => r.id === id);
  assert.equal(row(at('markets'), 'cost_per_asset').scaled.text, '$81.78');
  assert.equal(row(at('both'), 'cost_per_asset').scaled.text, '$106.38');
  assert.equal(row(at('campaigns'), 'cost_per_asset').scaled.text, '$141.16');
  for (const route of ROUTES) assert.equal(row(at(route), 'campaign_markets').scaled.text, '100', route);
  assert.ok(at('campaigns').summary.startsWith('With more campaigns, at 2x you have 100'));
  assert.ok(at('markets').summary.startsWith('With more markets, at 2x you have 100'));
  for (const route of ROUTES) assert.ok(!/per head|cycle/i.test(at(route).summary));
});

test('model.js carries no cycle-time or per-head wording and no removed ids', () => {
  assert.ok(!/cycle time|per head|output_per_head|asm-locales|concept-growth/i.test(read('model.js')));
});

test('present with too few reviewers: over capacity wording', () => {
  const p = present({ ...defaultValues(ctx), reviewers: 4 }, ctx);
  assert.equal(p.ok, true);
  assert.equal(p.overCapacity, true);
  const row = (id) => p.rows.find((r) => r.id === id);
  assert.ok(row('utilisation').scaled.text.includes('over capacity'));
  assert.equal(row('brief_to_live').scaled.text, 'unbounded (over capacity)');
  assert.equal(row('brief_to_live').change.text, 'n/a: over capacity');
  // CR-01: over capacity the 2x campaign-markets are demand, never called live.
  assert.equal(row('campaign_markets').scaled.text, '100 (not achievable: over capacity)');
  assert.ok(Math.abs(row('campaign_markets').scaled.value - 100) < 1e-9);
  // Four reviewers are over capacity at baseline too, so today's volume is also marked.
  assert.equal(row('campaign_markets').base.text, '50 (not achievable: over capacity)');
  assert.equal(row('campaign_markets').change.text, 'n/a: over capacity');
  assert.match(p.summary, /^With more campaigns and more markets, 2x would mean 100 campaign-markets launched per quarter, but reviewers are over capacity, at \d+%, so that volume cannot go live and brief-to-live time is unbounded\.$/);
  assert.ok(!p.summary.includes('live per quarter'));
  assert.ok(p.summary.includes('cannot go live'));
  // Over capacity at 2x only (the reviewer's repro): baseline stays plain.
  const q = present({ ...defaultValues(ctx), auto2: 0.2 }, ctx);
  const qrow = (id) => q.rows.find((r) => r.id === id);
  assert.equal(q.overCapacity, true);
  assert.equal(qrow('campaign_markets').base.text, '50');
  assert.equal(qrow('campaign_markets').scaled.text, '100 (not achievable: over capacity)');
  assert.equal(qrow('campaign_markets').change.text, 'n/a: over capacity');
  assert.equal(q.summary, 'With more campaigns and more markets, 2x would mean 100 campaign-markets launched per quarter, but reviewers are over capacity, at 110%, so that volume cannot go live and brief-to-live time is unbounded.');
  assert.ok(!q.summary.includes('live per quarter'));
  assert.ok(!p.summary.includes('of capacity'));
});

test('present: zero-baseline AI spend gives n/a change', () => {
  const c = {
    ...ctx,
    assumptions: {
      ...ctx.assumptions,
      ai_share_of_variant_cost: { baseline: 0, scaled: 0.6 },
      ai_share_of_tooling: { baseline: 0, scaled: 0.5 },
    },
  };
  const p = present(defaultValues(ctx), c);
  assert.equal(p.ok, true);
  assert.equal(p.rows.find((r) => r.id === 'ai_spend').change.text, 'n/a: baseline is zero');
});

test('present: not_needed and infeasible break-even text', () => {
  const easy = present({ ...defaultValues(ctx), reviewers: 100 }, ctx);
  assert.equal(easy.rows.find((r) => r.id === 'break_even').scaled.text, 'not needed');
  const hard = present({ ...defaultValues(ctx), reviewers: 3, minutes: 60 }, ctx);
  const t = hard.rows.find((r) => r.id === 'break_even').scaled.text;
  assert.ok(/^infeasible: needs more than the \d+% T0 \+ T1 share$/.test(t), t);
});

test('present: errors come back without rows and without NaN', () => {
  const p = present({ ...defaultValues(ctx), reviewers: 0 }, ctx);
  assert.equal(p.ok, false);
  assert.deepEqual(p.rows, []);
  assert.equal(p.summary, '');
  assert.ok(p.errors.some((e) => e.key === 'reviewers'));
});

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('fuzz: present() never emits NaN, Infinity, undefined or null', () => {
  const rand = rng(42);
  const between = (lo, hi) => lo + rand() * (hi - lo);
  const BAD = /NaN|Infinity|undefined|null/;
  for (let i = 0; i < 200; i++) {
    const v = {
      campaigns: Math.ceil(between(1, 200)), concepts: Math.ceil(between(1, 100)), markets: Math.ceil(between(1, 20)), route: ROUTES[Math.floor(rand() * 3)],
      marketers: between(1, 500), reviewers: between(0.5, 100), minutes: between(1, 60), vcost: between(0.01, 10),
      mconcept: between(1, 5000), yield: between(0.1, 1), rework: between(0, 1), auto1: between(0, 0.75), auto2: between(0, 0.85),
      scenario: 'a',
    };
    const p = present(v, ctx);
    assert.equal(BAD.test(JSON.stringify(p)), false, JSON.stringify(v));
  }
  const base = defaultValues(ctx);
  for (const key of Object.keys(base).filter((k) => k !== 'scenario')) {
    for (const bad of [0, 1e9, 1e300, -1, NaN, Infinity]) {
      const p = present({ ...base, [key]: bad }, ctx);
      assert.equal(BAD.test(JSON.stringify(p)), false, `${key}=${bad}: ${JSON.stringify(p).slice(0, 120)}`);
    }
  }
});

test('purity: import specifiers of model.js, fields.js and format.js', () => {
  const specs = (src) => [...src.matchAll(/import\s+(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/g), ...src.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)]
    .map((m) => m[1]).sort();
  assert.deepEqual(specs(read('model.js')), ['./calc.js', './fields.js', './format.js']);
  assert.deepEqual(specs(read('fields.js')), []);
  assert.deepEqual(specs(read('format.js')), []);
  for (const f of ['model.js', 'fields.js', 'format.js']) {
    assert.ok(!/\bdocument\b|\bwindow\b|innerHTML/.test(read(f)), `${f} touches the DOM`);
  }
});

// ---- Plan 03-07: headcount scenarios and sensitivity ----

test('auto-approval errors map to their field by side, not by message text (IN-06)', () => {
  const d = defaultValues(ctx);
  const at = (mix) => run({ ...d }, { ...ctx, assumptions: { ...ctx.assumptions, tier_mix: mix } });
  const one = at({ baseline: [0.05, 0.05, 0.6, 0.3], scaled: ctx.assumptions.tier_mix.scaled });
  assert.equal(one.ok, false);
  assert.deepEqual(one.errors.map((e) => e.key), ['auto1']);
  const two = at({ baseline: ctx.assumptions.tier_mix.baseline, scaled: [0.1, 0.1, 0.5, 0.3] });
  assert.deepEqual(two.errors.map((e) => e.key), ['auto2']);
  const r = compute(toCompute(d, ctx).inputs, { ...toCompute(d, ctx).assumptions, auto_approval_share: { baseline: -1, scaled: 0.6 } });
  assert.equal(r.errors[0].which, 'baseline');
  assert.equal(run({ ...d, auto1: -1 }, ctx).errors[0].key, 'auto1', 'a share error without a side suffix still maps to auto1');
});

test('scenarioOutcomes goldens at defaults (A, B, C on the cash view, change cost on 120 marketing FTE)', () => {
  const v = defaultValues(ctx);
  const cb = run(v, ctx).result.capacity_bridge;
  const A = scenarioOutcomes(v, ctx, 'a');
  assert.equal(A.reviewer_fte_required.toFixed(2), '8.73');
  assert.equal(A.output_multiple, ctx.inputs.multiplier);
  assert.equal(A.max_multiple, cb.max_multiple_at_target);
  assert.equal(A.people_cost_change, 0);
  // Cash view: 2x cash total 2,729,683.35 less baseline 1,794,484.21 = 935,199.14.
  assert.equal(A.production_cost_change.toFixed(2), '935199.14');
  // One-off: $3,000 x 120 marketing FTE (the 12 reviewers are inside the 120) = 360,000.
  assert.equal(A.change_mgmt_one_off, 360000);
  // WR-10: the net has the portfolio engine's sign: positive is a saving, negative a rise in spend.
  assert.equal(A.first_year_net.toFixed(2), '-1295199.14'); // -(935,199.14 + 360,000)
  const B = scenarioOutcomes(v, ctx, 'b');
  assert.equal(B.output_multiple, 1);
  assert.equal(B.production_cost_change.toFixed(2), '295052.63');
  assert.equal(B.removable_fte, cb.removable_same_output, 'attributable only: baseline slack excluded');
  assert.equal(B.people_cost_change, -cb.removable_same_output * ctx.fixed.loaded_fte_cost);
  assert.equal(B.first_year_net.toFixed(2), '-142359.13'); // -(-512,693.50 + 295,052.63 + 360,000)
  const C = scenarioOutcomes(v, ctx, 'c');
  assert.equal(C.reviewer_fte_without, cb.required_without_programme);
  assert.equal(C.reviewer_fte_required, cb.required_programme);
  assert.equal(C.avoided_hires, cb.avoided_hires);
  assert.equal(C.avoided_hire_cost, cb.avoided_hires * ctx.fixed.loaded_fte_cost);
  assert.equal(C.people_cost_change, 0, 'no hires needed with the programme at the defaults');
  assert.equal(C.first_year_net.toFixed(2), '-1295199.14', 'avoided hire cost is against a no-programme plan and is not netted');
  assert.ok(B.removable_fte !== A.reviewer_fte_delta && B.first_year_net !== A.first_year_net && C.avoided_hires !== B.removable_fte, 'scenarios are distinct');
  for (const o of [A, B, C]) assert.equal(o.change_mgmt_one_off, 360000, 'change cost in every scenario');
});

test('WR-10: calculator B applies the smallest removable release, as the engine does', () => {
  const v = defaultValues(ctx);
  const gross = run(v, ctx).result.capacity_bridge.removable_same_output;
  assert.ok(gross > 1);
  const high = { ...ctx, fixed: { ...ctx.fixed, min_removable_fte: gross + 1 } };
  const B = scenarioOutcomes(v, high, 'b');
  assert.equal(B.removable_fte, 0);
  assert.equal(B.people_cost_change, 0);
  assert.equal(B.fragmented_fte, gross);
  assert.equal(ctx.fixed.min_removable_fte, 1);
  assert.equal(scenarioOutcomes(v, ctx, 'b').removable_fte, gross);
});

test('scenarioOutcomes: every field is finite for the defaults and for multiplier 1 (identity)', () => {
  const one = { ...ctx, inputs: { ...ctx.inputs, multiplier: 1 } };
  for (const c of [ctx, one]) {
    for (const m of ['a', 'b', 'c']) {
      const o = scenarioOutcomes(defaultValues(c), c, m);
      assert.equal(o.ok, true);
      for (const [k, x] of Object.entries(o)) if (typeof x === 'number') assert.ok(Number.isFinite(x), `${m}.${k}`);
    }
  }
  const cb = run(defaultValues(one), one).result.capacity_bridge;
  assert.equal(scenarioOutcomes(defaultValues(one), one, 'c').avoided_hires, Math.max(0, cb.avoided_hires));
  assert.equal(scenarioOutcomes(defaultValues(one), one, 'a').output_multiple, 1);
  assert.equal(scenarioOutcomes(defaultValues(ctx), ctx, 'unknown').mode, 'c', 'unknown mode falls back to C');
});

test('run: reviewers cannot outnumber the marketing team', () => {
  const bad = run({ ...defaultValues(ctx), marketers: 12, reviewers: 13 }, ctx);
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.errors.map((e) => e.key), ['reviewers']);
  assert.equal(run({ ...defaultValues(ctx), marketers: 12, reviewers: 12 }, ctx).ok, true);
});

test('scenarioOutcomes: too few reviewers needs more, A cuts nothing, C prices the hires it still needs; failures return errors', () => {
  const v = { ...defaultValues(ctx), reviewers: 6 };
  const red = scenarioOutcomes(v, ctx, 'a');
  assert.ok(red.reviewer_fte_delta < 0);
  assert.equal(red.people_cost_change, 0);
  const c = scenarioOutcomes(v, ctx, 'c');
  assert.ok(c.people_cost_change > 0, 'hires still needed with the programme are priced');
  assert.ok(c.avoided_hires >= 0);
  const bad = scenarioOutcomes({ ...defaultValues(ctx), reviewers: 0 }, ctx, 'b');
  assert.equal(bad.ok, false);
  assert.ok(Array.isArray(bad.errors));
});

test('sensitivity ranking, clamping and reviewer-only utilisation effect at defaults', () => {
  const rows = sensitivity(defaultValues(ctx), ctx);
  assert.deepEqual(rows.map((r) => r.key), ['markets', 'mconcept', 'auto2', 'minutes', 'yield']);
  const y = rows.find((r) => r.key === 'yield');
  assert.equal(y.capped.up, true);
  assert.equal(y.capped.down, false);
  assert.equal(rows[0].ref, 'asm-markets');
  assert.equal(rows[0].grade, 'Modelled');
  const finiteOrNull = (x) => x === null || Number.isFinite(x);
  for (const r of rows) for (const g of [r.cost, r.util]) assert.ok(finiteOrNull(g.down) && finiteOrNull(g.up));
  const full = sensitivity({ ...defaultValues(ctx), auto2: 0.9 }, ctx);
  assert.deepEqual(full, []);
});

test('sensitivity: small integer volumes move exactly the stated step (CR-01)', () => {
  const d = defaultValues(ctx);
  const two = sensitivity({ ...d, markets: 2 }, ctx);
  assert.ok(two.some((r) => r.key === 'markets'), 'markets stays ranked at 2 markets');
  for (const loc of [2, 3]) {
    const v = { ...d, markets: loc };
    const row = sensitivity(v, ctx).find((r) => r.key === 'markets');
    assert.ok(row, `markets ranked at ${loc}`);
    assert.deepEqual(row.capped, { down: false, up: false });
    const util = (x) => run(x, ctx).result.scenario.utilisation;
    // Utilisation is linear in markets, so a 20% move gives exactly -20% and +20%.
    assert.ok(Math.abs(row.util.down - (util({ ...v, markets: loc * 0.8 }) / util(v) - 1)) < 1e-12);
    assert.ok(Math.abs(row.util.down + SENSITIVITY_STEP) < 1e-9, `util.down at ${loc} markets`);
    assert.ok(Math.abs(row.util.up - SENSITIVITY_STEP) < 1e-9, `util.up at ${loc} markets`);
  }
  const small = sensitivity({ ...d, campaigns: 2, concepts: 2 }, ctx);
  for (const key of ['campaigns', 'concepts']) {
    const row = small.find((r) => r.key === key);
    assert.ok(row, `${key} stays ranked at 2`);
    assert.ok(row.cost.down > 0 && row.cost.up < 0, `${key} moves at 2`);
  }
  const one = sensitivity({ ...d, campaigns: 1 }, ctx);
  for (const r of one) if (r.key === 'campaigns') assert.equal(r.capped.down, false, 'a volume of 1 moves to 0.8, not capped');
});

test('sensitivity: auto-approval cap clamps and is marked capped', () => {
  const v = { ...defaultValues(ctx), auto2: 0.85 };
  const row = sensitivity(v, ctx).find((r) => r.key === 'auto2');
  assert.ok(row, 'auto2 stays in the top five');
  assert.equal(row.capped.up, true);
  assert.equal(row.cost.up, 0, 'already at the cap, so no further movement');
});

test('scenario rows carry the weakest grade of their inputs (WR-01)', () => {
  const at = (grades) => {
    const p = present({ ...defaultValues(ctx), scenario: 'b' }, { ...ctx, grades });
    return Object.fromEntries(p.scenario.rows.map((r) => [r.id, [r.grade, r.ref]]));
  };
  const cost = at({ ...ctx.grades, ...ISOLATED, 'asm-master-concept-cost': 'Speculative' });
  assert.deepEqual(cost.first_year_net, ['Speculative', 'asm-master-concept-cost']);
  assert.deepEqual(cost.production_cost_change, ['Speculative', 'asm-master-concept-cost']);
  assert.equal(cost.people_cost_change[0], 'Modelled', 'master concept cost does not feed people cost');
  const util = at({ ...ctx.grades, ...ISOLATED, 'asm-review-minutes': 'Speculative' });
  assert.deepEqual(util.people_cost_change, ['Speculative', 'asm-review-minutes']);
  assert.deepEqual(util.first_year_net, ['Speculative', 'asm-review-minutes']);
  const fte = at({ ...ctx.grades, ...ISOLATED, 'asm-marketing-fte': 'Speculative' });
  assert.deepEqual(fte.change_mgmt_one_off, ['Speculative', 'asm-marketing-fte']);
  assert.deepEqual(fte.first_year_net, ['Speculative', 'asm-marketing-fte']);
  const d = at({ ...ctx.grades, ...ISOLATED });
  assert.equal(d.people_cost_change[1], 'asm-loaded-fte-cost', 'ref unchanged at the shipped grades');
  assert.equal(d.first_year_net[1], 'asm-change-mgmt', 'ref unchanged at the shipped grades');
});

test('present().scenario and .sensitivity are finite and labelled', () => {
  const p = present(defaultValues(ctx), ctx);
  assert.equal(p.scenario.name, 'C: growing demand, limited hiring');
  assert.deepEqual(p.scenario.rows.map((r) => r.id), ['reviewer_fte_without', 'reviewer_fte_required', 'avoided_hires', 'avoided_hire_cost', 'change_mgmt_one_off', 'first_year_net']);
  assert.equal(p.scenario.rows[2].text, '3.6');
  const at = (m) => present({ ...defaultValues(ctx), scenario: m }, ctx).scenario;
  assert.equal(at('a').rows[3].text, '$935,199');
  assert.equal(at('b').rows[3].text, '$295,053');
  assert.deepEqual(at('a').rows.map((r) => r.id), ['output_multiple', 'reviewer_fte_required', 'max_multiple', 'production_cost_change', 'change_mgmt_one_off', 'first_year_net']);
  assert.deepEqual(at('b').rows.map((r) => r.id), ['removable_fte', 'reviewer_fte_required', 'people_cost_change', 'production_cost_change', 'change_mgmt_one_off', 'first_year_net']);
  assert.equal(p.sensitivity[0].cells.costDown.text, '+21.5%');
  assert.equal(p.sensitivity[0].cells.costUp.text, '−14.3%');
  assert.equal(p.sensitivity.length, 5);
});

test('fuzz: scenario and sensitivity never emit NaN, Infinity, undefined or null', () => {
  const rand = rng(7);
  const between = (lo, hi) => lo + rand() * (hi - lo);
  const BAD = /NaN|Infinity|undefined|null/;
  for (let i = 0; i < 200; i++) {
    const v = {
      campaigns: Math.ceil(between(1, 200)), concepts: Math.ceil(between(1, 100)), markets: Math.ceil(between(1, 20)), route: ROUTES[Math.floor(rand() * 3)],
      marketers: between(1, 500), reviewers: between(0.5, 100), minutes: between(1, 60), vcost: between(0.01, 10),
      mconcept: between(1, 5000), yield: between(0.1, 1), rework: between(0, 1), auto1: between(0, 0.75), auto2: between(0, 0.85),
      scenario: ['a', 'b', 'c'][i % 3],
    };
    const p = present(v, ctx);
    if (!p.ok) continue;
    assert.equal(BAD.test(JSON.stringify({ s: p.scenario, n: p.sensitivity })), false, JSON.stringify(v));
  }
});

// ---- Plan 03-08: maths and believe ----

test('present().maths: eight steps, digit-free formulas, results equal the table rows', () => {
  const p = present(defaultValues(ctx), ctx);
  assert.deepEqual(p.maths.map((m) => m.id), ['campaign_markets', 'generated', 'touch', 'hours', 'utilisation', 'cost', 'cost_campaign_market', 'breakeven']);
  for (const m of p.maths) {
    assert.ok(!/\d/.test(m.formula), `${m.id} formula has a digit`);
    for (const part of m.parts.filter((x) => !x.fig)) assert.ok(!/\d/.test(part.text), `${m.id} text part "${part.text}"`);
    assert.ok(m.parts.some((x) => x.fig));
    assert.ok(['Modelled', 'Speculative', 'Benchmark'].includes(m.grade) && ctx.grades[m.ref]);
  }
  const by = Object.fromEntries(p.maths.map((m) => [m.id, m]));
  const row = (id) => p.rows.find((r) => r.id === id);
  assert.equal(by.campaign_markets.result.text, row('campaign_markets').scaled.text);
  assert.equal(by.cost.result.text, row('cost_per_asset').scaled.text);
  assert.equal(by.cost_campaign_market.result.text, row('cost_per_campaign_market').scaled.text);
  assert.match(by.generated.name, /internal throughput, not the claim/);
  assert.match(by.hours.name, /internal throughput, not the claim/);
  assert.equal(by.utilisation.result.text, row('utilisation').scaled.text);
  assert.equal(by.breakeven.result.text, row('break_even').scaled.text);
  assert.equal(by.generated.result.text, '84,211', 'generated variants 80,000 / 0.95 = 84,210.5');
  assert.equal(by.campaign_markets.result.text, '100');
});

test('present().maths substitutes the reader values', () => {
  const p = present({ ...defaultValues(ctx), markets: 6, campaigns: 10 }, ctx);
  assert.ok(p.maths[0].parts.some((x) => x.text === '6'), 'six markets per campaign');
  assert.ok(p.maths[0].parts.some((x) => x.text === '10'), 'ten campaigns a year');
  assert.equal(p.maths[0].result.text, '30', '10 x 6 x 2 / 4');
});

test('present().believe: seven items, top three carry the result, variant cost effect is computed and small', () => {
  const p = present(defaultValues(ctx), ctx);
  assert.deepEqual(p.believe.map((b) => b.key), ['markets', 'mconcept', 'auto2', 'minutes', 'yield', 'tooling', 'vcost']);
  assert.deepEqual(p.believe.map((b) => b.asm).slice(5), ['asm-tooling', 'asm-variant-cost']);
  assert.deepEqual(p.believe.map((b) => b.carries), [true, true, true, false, false, false, false]);
  for (const b of p.believe) assert.ok(!/\d/.test(b.parts.filter((x) => !x.fig).map((x) => x.text).join('').replace(/20%|2x/g, '')), b.key);
  const v = p.believe[6];
  assert.match(v.statement, /only slightly/);
  const swing = v.parts.find((x) => x.fig === 'calc-believe-vcost-swing');
  assert.ok(swing && Math.abs(swing.value) < 0.02);
  const up = present({ ...defaultValues(ctx), vcost: 0.8 * 1.2 }, ctx).rows.find((r) => r.id === 'cost_per_asset').scaled.value;
  const was = p.rows.find((r) => r.id === 'cost_per_asset').scaled.value;
  assert.ok(Math.abs(swing.value - (up / was - 1)) < 1e-9);
});

test('present().believe follows the live ranking and never lists a key twice', () => {
  const p = present({ ...defaultValues(ctx), markets: 8, vcost: 60 }, ctx);
  const keys = p.believe.map((b) => b.key);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(keys.length >= 5 && keys.length <= 7);
  assert.equal(p.believe.filter((b) => b.carries).length, 3);
  assert.equal(present({ ...defaultValues(ctx), campaigns: 0 }, ctx).maths, undefined);
});

test('believe says markets, not locales', () => {
  const p = present(defaultValues(ctx), ctx);
  assert.equal(p.believe[0].statement.startsWith('Each campaign runs in this many markets: '), true);
  assert.ok(!p.believe.some((b) => /locale/i.test(b.statement)));
});
