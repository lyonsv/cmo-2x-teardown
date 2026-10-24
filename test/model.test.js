import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compute } from '../site/js/calc.js';
import { formatValue } from '../site/js/format.js';
import { FIELDS, SCENARIOS, COMPUTE_FIELD_TO_KEY } from '../site/js/fields.js';
import {
  defaultValues, toCompute, run, OUTPUT_DEPS, weakestGrade, RESULT_ROWS, present, scenarioOutcomes, sensitivity,
} from '../site/js/model.js';
import { modelContext, assumptions, defaultInputs, defaultAssumptions } from '../site/js/data.js';

const ctx = modelContext();
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
    'campaigns', 'concepts', 'locales', 'marketers', 'reviewers', 'minutes', 'vcost', 'mconcept', 'yield', 'rework', 'auto1', 'auto2',
  ]);
  assert.equal(new Set(FIELDS.map((x) => x.key)).size, 12);
  for (const x of FIELDS) assert.ok(assumptions[x.asm], `${x.key}: ${x.asm} missing`);
  assert.deepEqual(SCENARIOS, ['redeploy', 'hold', 'reduce']);
  assert.equal(FIELDS.find((x) => x.key === 'rework').zeroOk, true);
  assert.equal(FIELDS.find((x) => x.key === 'campaigns').zeroOk, false);
  for (const k of Object.values(COMPUTE_FIELD_TO_KEY)) assert.ok(FIELDS.some((x) => x.key === k));
});

test('locales are folded: formats per locale x default locales = variants per concept', () => {
  assert.equal(ctx.fixed.formats_per_locale * ctx.fixed.default_locales, assumptions['asm-variants-per-concept'].value);
  assert.equal(ctx.fixed.formats_per_locale, 8);
  assert.equal(ctx.fixed.default_locales, 5);
});

test('defaultValues reads the data.js defaults', () => {
  assert.deepEqual(defaultValues(ctx), {
    campaigns: 40, concepts: 25, locales: 5, marketers: 120, reviewers: 12, minutes: 12, vcost: 0.8, mconcept: 1200,
    yield: 0.95, rework: 0.15, auto1: 0.2, auto2: 0.6, scenario: 'redeploy',
  });
});

test('identity: run(defaults) equals compute(defaultInputs(), defaultAssumptions())', () => {
  const r = run(defaultValues(ctx), ctx);
  assert.equal(r.ok, true);
  const direct = compute(defaultInputs(), defaultAssumptions());
  assert.deepEqual(r.result, direct);
  assert.equal(r.result.scenario.cost_per_asset.toFixed(2), '41.18');
  assert.equal(r.result.scenario.utilisation.toFixed(3), '0.619');
});

test('toCompute folds locales and the variant cost pair', () => {
  const { inputs, assumptions: a } = toCompute({ ...defaultValues(ctx), locales: 6, vcost: 1.5, auto1: 0.1, auto2: 0.5 }, ctx);
  assert.equal(inputs.variants_per_concept, 48);
  assert.deepEqual(a.variant_cost, { baseline: 4, scaled: 1.5 });
  assert.deepEqual(a.auto_approval_share, { baseline: 0.1, scaled: 0.5 });
});

test('monotonicity: more locales gives more variants and more total cost', () => {
  const a = run(defaultValues(ctx), ctx).result;
  const b = run({ ...defaultValues(ctx), locales: 6 }, ctx).result;
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
  assert.ok(keyOf({ marketers: 0 }).includes('marketers'));
  assert.ok(keyOf({ locales: 0 }).includes('locales'));
  for (const e of run({ ...defaultValues(ctx), reviewers: 0 }, ctx).errors) assert.equal(typeof e.message, 'string');
});

test('OUTPUT_DEPS: nine outputs, valid ids, reviewer and marketing FTE are not cost deps', () => {
  assert.deepEqual(Object.keys(OUTPUT_DEPS), RESULT_ROWS.map((r) => r.id));
  for (const [out, ids] of Object.entries(OUTPUT_DEPS)) {
    assert.ok(ids.length > 0);
    for (const id of ids) assert.ok(assumptions[id], `${out}: ${id} is not an assumption`);
  }
  assert.deepEqual(OUTPUT_DEPS.cost_per_asset.slice(0, 5), [
    'asm-locales', 'asm-master-concept-cost', 'asm-auto-approval', 'asm-review-minutes', 'asm-approval-yield',
  ]);
  assert.deepEqual(OUTPUT_DEPS.output_per_head.slice(0, 3), ['asm-campaigns', 'asm-concepts-per-campaign', 'asm-locales']);
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
  const grades = { ...ctx.grades, 'asm-review-minutes': 'Speculative' };
  const p = present(defaultValues(ctx), { ...ctx, grades });
  const row = (id) => p.rows.find((r) => r.id === id);
  assert.deepEqual([row('cost_per_asset').grade, row('cost_per_asset').ref], ['Speculative', 'asm-review-minutes']);
  assert.equal(row('output_per_head').grade, 'Modelled');
  assert.equal(row('output_per_head').ref, OUTPUT_DEPS.output_per_head[0]);
});

test('present(defaults): nine rows in order with golden texts', () => {
  const p = present(defaultValues(ctx), ctx);
  assert.equal(p.ok, true);
  assert.equal(p.overCapacity, false);
  assert.deepEqual(p.rows.map((r) => r.id), RESULT_ROWS.map((r) => r.id));
  assert.deepEqual(p.rows.map((r) => r.label), RESULT_ROWS.map((r) => r.label));
  const row = (id) => p.rows.find((r) => r.id === id);
  assert.equal(row('cost_per_asset').base.text, '$64.71');
  assert.equal(row('cost_per_asset').scaled.text, '$41.18');
  assert.equal(row('cost_per_asset').change.text, '−36%');
  assert.equal(row('output_per_head').base.text, '83');
  assert.equal(row('output_per_head').scaled.text, '167');
  assert.equal(row('total_cost').scaled.text, '$3.29M');
  assert.equal(row('budget_share').scaled.text, '4.2%');
  assert.equal(row('ai_spend').scaled.text, '$340,421');
  assert.equal(row('utilisation').scaled.text, '61.9%');
  assert.equal(row('break_even').scaled.text, '41%');
  assert.equal(row('capacity_floor').scaled.text, '29%');
  assert.equal(row('break_even').base.text, 'Not applicable');
  assert.equal(row('break_even').change.text, 'Not applicable');
  for (const r of p.rows) {
    assert.equal(r.grade, 'Modelled');
    assert.equal(r.ref, OUTPUT_DEPS[r.id][0]);
  }
  const rr = Object.fromEntries(RESULT_ROWS.map((x) => [x.id, x]));
  for (const r of p.rows) {
    if (r.base.value !== undefined) assert.equal(r.base.text, formatValue(r.base.value, rr[r.id].format));
  }
  assert.equal(p.summary, 'At 2x, your team approves 167 variants per head per quarter at $41.18 per approved asset, with reviewers at 62% of capacity.');
});

test('present with too few reviewers: over capacity wording', () => {
  const p = present({ ...defaultValues(ctx), reviewers: 4 }, ctx);
  assert.equal(p.ok, true);
  assert.equal(p.overCapacity, true);
  const row = (id) => p.rows.find((r) => r.id === id);
  assert.ok(row('utilisation').scaled.text.includes('over capacity'));
  assert.equal(row('cycle_time').scaled.text, 'unbounded (over capacity)');
  assert.ok(p.summary.includes('with reviewers over capacity at'));
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
      campaigns: Math.ceil(between(1, 200)), concepts: Math.ceil(between(1, 100)), locales: Math.ceil(between(1, 20)),
      marketers: between(1, 500), reviewers: between(0.5, 100), minutes: between(1, 60), vcost: between(0.01, 10),
      mconcept: between(1, 5000), yield: between(0.1, 1), rework: between(0, 1), auto1: between(0, 0.75), auto2: between(0, 0.85),
      scenario: 'redeploy',
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

test('scenarioOutcomes goldens at defaults', () => {
  const v = defaultValues(ctx);
  const red = scenarioOutcomes(v, ctx, 'redeploy');
  assert.equal(red.reviewer_fte_required.toFixed(2), '8.73');
  assert.equal(red.reviewer_fte_delta.toFixed(2), '3.27');
  assert.equal(red.people_cost_change, 0);
  assert.equal(Math.round(red.production_cost_change), 705782);
  assert.equal(red.change_mgmt_one_off, 396000);
  assert.equal(Math.round(red.first_year_net), 1101782);
  const hold = scenarioOutcomes(v, ctx, 'hold');
  assert.equal(Math.round(hold.production_cost_change), -53579);
  assert.equal(hold.people_cost_change, 0);
  assert.equal(Math.round(hold.first_year_net), 342421);
  assert.ok(Math.abs(hold.production_cost_change) < 60000, 'Hold saving stays small');
  const cut = scenarioOutcomes(v, ctx, 'reduce');
  assert.equal(Math.round(cut.people_cost_change), -489783);
  assert.equal(Math.round(cut.first_year_net), 611999);
  for (const o of [red, hold, cut]) assert.equal(o.change_mgmt_one_off, 396000, 'change cost in every scenario');
});

test('scenarioOutcomes: too few reviewers needs more, reduce cuts nothing; failures return errors', () => {
  const v = { ...defaultValues(ctx), reviewers: 6 };
  const red = scenarioOutcomes(v, ctx, 'redeploy');
  assert.ok(red.reviewer_fte_delta < 0);
  assert.equal(scenarioOutcomes(v, ctx, 'reduce').people_cost_change, 0);
  assert.match(present(v, ctx).scenario.rows[1].text, /^needs \d+\.\d more reviewers$/);
  const bad = scenarioOutcomes({ ...defaultValues(ctx), reviewers: 0 }, ctx, 'hold');
  assert.equal(bad.ok, false);
  assert.ok(Array.isArray(bad.errors));
});

test('sensitivity ranking, clamping and reviewer-only utilisation effect at defaults', () => {
  const rows = sensitivity(defaultValues(ctx), ctx);
  assert.deepEqual(rows.map((r) => r.key), ['locales', 'mconcept', 'auto2', 'minutes', 'yield']);
  const y = rows.find((r) => r.key === 'yield');
  assert.equal(y.capped.up, true);
  assert.equal(y.capped.down, false);
  assert.equal(rows[0].ref, 'asm-locales');
  assert.equal(rows[0].grade, 'Modelled');
  const finiteOrNull = (x) => x === null || Number.isFinite(x);
  for (const r of rows) for (const g of [r.cost, r.util]) assert.ok(finiteOrNull(g.down) && finiteOrNull(g.up));
  const full = sensitivity({ ...defaultValues(ctx), auto2: 0.9 }, ctx);
  assert.deepEqual(full, []);
});

test('sensitivity: auto-approval cap clamps and is marked capped', () => {
  const v = { ...defaultValues(ctx), auto2: 0.85 };
  const row = sensitivity(v, ctx).find((r) => r.key === 'auto2');
  assert.ok(row, 'auto2 stays in the top five');
  assert.equal(row.capped.up, true);
  assert.equal(row.cost.up, 0, 'already at the cap, so no further movement');
});

test('present().scenario and .sensitivity are finite and labelled', () => {
  const p = present(defaultValues(ctx), ctx);
  assert.equal(p.scenario.name, 'Redeploy');
  assert.deepEqual(p.scenario.rows.map((r) => r.id), ['reviewer_fte_required', 'reviewer_fte_delta', 'people_cost_change', 'production_cost_change', 'change_mgmt_one_off', 'first_year_net']);
  assert.equal(p.scenario.rows[3].text, '$705,782');
  assert.equal(present({ ...defaultValues(ctx), scenario: 'hold' }, ctx).scenario.rows[3].text, '−$53,579');
  assert.equal(p.sensitivity[0].cells.costDown.text, '+17.6%');
  assert.equal(p.sensitivity[0].cells.costUp.text, '−11.8%');
  assert.equal(p.sensitivity.length, 5);
});

test('fuzz: scenario and sensitivity never emit NaN, Infinity, undefined or null', () => {
  const rand = rng(7);
  const between = (lo, hi) => lo + rand() * (hi - lo);
  const BAD = /NaN|Infinity|undefined|null/;
  for (let i = 0; i < 200; i++) {
    const v = {
      campaigns: Math.ceil(between(1, 200)), concepts: Math.ceil(between(1, 100)), locales: Math.ceil(between(1, 20)),
      marketers: between(1, 500), reviewers: between(0.5, 100), minutes: between(1, 60), vcost: between(0.01, 10),
      mconcept: between(1, 5000), yield: between(0.1, 1), rework: between(0, 1), auto1: between(0, 0.75), auto2: between(0, 0.85),
      scenario: ['redeploy', 'hold', 'reduce'][i % 3],
    };
    const p = present(v, ctx);
    if (!p.ok) continue;
    assert.equal(BAD.test(JSON.stringify({ s: p.scenario, n: p.sensitivity })), false, JSON.stringify(v));
  }
});

// ---- Plan 03-08: maths and believe ----

test('present().maths: eight steps, digit-free formulas, results equal the table rows', () => {
  const p = present(defaultValues(ctx), ctx);
  assert.deepEqual(p.maths.map((m) => m.id), ['volume', 'output', 'generated', 'touch', 'hours', 'utilisation', 'cost', 'breakeven']);
  for (const m of p.maths) {
    assert.ok(!/\d/.test(m.formula), `${m.id} formula has a digit`);
    for (const part of m.parts.filter((x) => !x.fig)) assert.ok(!/\d/.test(part.text), `${m.id} text part "${part.text}"`);
    assert.ok(m.parts.some((x) => x.fig));
    assert.ok(['Modelled', 'Speculative', 'Benchmark'].includes(m.grade) && ctx.grades[m.ref]);
  }
  const by = Object.fromEntries(p.maths.map((m) => [m.id, m]));
  const row = (id) => p.rows.find((r) => r.id === id);
  assert.equal(by.output.result.text, row('output_per_head').scaled.text);
  assert.equal(by.cost.result.text, row('cost_per_asset').scaled.text);
  assert.equal(by.utilisation.result.text, row('utilisation').scaled.text);
  assert.equal(by.breakeven.result.text, row('break_even').scaled.text);
  assert.equal(by.volume.result.text, '80,000');
});

test('present().maths substitutes the reader values', () => {
  const p = present({ ...defaultValues(ctx), locales: 6 }, ctx);
  assert.ok(p.maths[0].parts.some((x) => x.text === '48'), 'forty-eight variants per concept');
});

test('present().believe: seven items, top three carry the result, variant cost effect is computed and small', () => {
  const p = present(defaultValues(ctx), ctx);
  assert.deepEqual(p.believe.map((b) => b.key), ['locales', 'mconcept', 'auto2', 'minutes', 'yield', 'tooling', 'vcost']);
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
  const p = present({ ...defaultValues(ctx), locales: 8, vcost: 60 }, ctx);
  const keys = p.believe.map((b) => b.key);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(keys.length >= 5 && keys.length <= 7);
  assert.equal(p.believe.filter((b) => b.carries).length, 3);
  assert.equal(present({ ...defaultValues(ctx), campaigns: 0 }, ctx).maths, undefined);
});
