// Pure calculator model: maps reader-facing field values onto compute() and turns
// the result into the exact strings and grades the page shows. No DOM, and no
// import of data.js: everything it needs arrives in `ctx`, built by data.js
// modelContext(). Imports are limited to calc.js, fields.js and format.js.
import { compute } from './calc.js';
import { COMPUTE_FIELD_TO_KEY, FIELDS, SCENARIOS } from './fields.js';
import { formatValue } from './format.js';

// ctx = { inputs, assumptions, grades: { 'asm-...': grade }, fixed: { formats_per_locale, default_locales } }

export function defaultValues(ctx) {
  const a = ctx.assumptions;
  return {
    campaigns: ctx.inputs.campaigns_per_year,
    concepts: ctx.inputs.concepts_per_campaign,
    locales: ctx.fixed.default_locales,
    marketers: ctx.inputs.marketing_fte,
    reviewers: ctx.inputs.reviewer_fte,
    minutes: a.review_minutes_per_variant,
    vcost: a.variant_cost.scaled,
    mconcept: a.master_concept_cost,
    yield: a.approval_yield,
    rework: a.rework_rate,
    auto1: a.auto_approval_share.baseline,
    auto2: a.auto_approval_share.scaled,
    scenario: 'redeploy',
  };
}

export function toCompute(values, ctx) {
  const inputs = {
    ...ctx.inputs,
    campaigns_per_year: values.campaigns,
    concepts_per_campaign: values.concepts,
    variants_per_concept: ctx.fixed.formats_per_locale * values.locales,
    marketing_fte: values.marketers,
    reviewer_fte: values.reviewers,
  };
  const assumptions = {
    ...ctx.assumptions,
    review_minutes_per_variant: values.minutes,
    variant_cost: { baseline: ctx.assumptions.variant_cost.baseline, scaled: values.vcost },
    master_concept_cost: values.mconcept,
    approval_yield: values.yield,
    rework_rate: values.rework,
    auto_approval_share: { baseline: values.auto1, scaled: values.auto2 },
  };
  return { inputs, assumptions };
}

function keyFor(error) {
  const field = error.field;
  if (field === 'auto_approval_share') return String(error.message).includes('(baseline)') ? 'auto1' : 'auto2';
  if (typeof field === 'string' && Object.hasOwn(COMPUTE_FIELD_TO_KEY, field)) return COMPUTE_FIELD_TO_KEY[field];
  return null;
}

export function run(values, ctx) {
  const { inputs, assumptions } = toCompute(values, ctx);
  const r = compute(inputs, assumptions);
  if (r.ok) return { ok: true, result: r };
  return { ok: false, errors: r.errors.map((e) => ({ key: keyFor(e), message: e.message })) };
}

// Most influential first (measured at the defaults, see 03-RESEARCH). The link
// target of an output's grade chip is the first id here that carries the weakest
// grade. Reviewer FTE and marketing FTE are not dependencies of the cost rows:
// review cost is hours worked, not idle capacity.
const VOLUME = ['asm-campaigns', 'asm-concepts-per-campaign', 'asm-formats-per-locale', 'asm-concept-growth'];
const COST = [
  'asm-locales', 'asm-master-concept-cost', 'asm-auto-approval', 'asm-review-minutes', 'asm-approval-yield',
  'asm-rework-rate', 'asm-variant-cost', ...VOLUME.slice(0, 3), 'asm-concept-growth', 'asm-sampling-rate',
  'asm-escalation-rate', 'asm-reviewer-rate', 'asm-rights-per-concept', 'asm-storage-per-variant', 'asm-tooling',
];
const UTIL = [
  'asm-locales', 'asm-reviewer-fte', 'asm-auto-approval', 'asm-review-minutes', 'asm-approval-yield', 'asm-rework-rate',
  'asm-sampling-rate', 'asm-escalation-rate', 'asm-reviewer-hours', ...VOLUME,
];

export const OUTPUT_DEPS = {
  output_per_head: ['asm-campaigns', 'asm-concepts-per-campaign', 'asm-locales', 'asm-formats-per-locale', 'asm-marketing-fte', 'asm-concept-growth'],
  cost_per_asset: COST,
  total_cost: COST,
  budget_share: [...COST, 'asm-marketing-budget'],
  ai_spend: [
    'asm-locales', 'asm-variant-cost', 'asm-ai-share-variant', 'asm-tooling', 'asm-ai-share-tooling', 'asm-approval-yield', ...VOLUME,
  ],
  cycle_time: ['asm-review-service-days', 'asm-build-days', ...UTIL],
  utilisation: UTIL,
  break_even: [...UTIL, 'asm-tier-mix', 'asm-target-utilisation'],
  capacity_floor: [...UTIL, 'asm-tier-mix'],
};

const GRADE_ORDER = ['Speculative', 'Modelled', 'Benchmark'];

export function weakestGrade(ids, grades) {
  let best = null;
  for (const id of ids) {
    const grade = grades[id];
    const rank = GRADE_ORDER.indexOf(grade);
    if (rank < 0) continue;
    if (best === null || rank < best.rank) best = { rank, grade, ref: id };
  }
  return best === null ? { grade: 'Speculative', ref: ids[0] } : { grade: best.grade, ref: best.ref };
}

export const RESULT_ROWS = [
  { id: 'output_per_head', label: 'Approved-live variants per head per quarter', format: 'int', changeFormat: 'pctchg0' },
  { id: 'cost_per_asset', label: 'Fully loaded cost per approved-live asset', format: 'usd2', changeFormat: 'pctchg0' },
  { id: 'total_cost', label: 'Total production cost', format: 'usdm2', changeFormat: 'pctchg0' },
  { id: 'budget_share', label: 'Production share of marketing budget', format: 'pct1', changeFormat: 'pts1' },
  { id: 'ai_spend', label: 'AI spend', format: 'usd0', changeFormat: 'pctchg0' },
  { id: 'cycle_time', label: 'Cycle time, brief to live (days)', format: 'days1', changeFormat: 'pctchg0' },
  { id: 'utilisation', label: 'Review utilisation', format: 'pct1', changeFormat: 'pts1' },
  { id: 'break_even', label: 'Break-even auto-approval at flat reviewer headcount', format: 'pct0', changeFormat: 'none' },
  { id: 'capacity_floor', label: 'Capacity floor (auto-approval below which review capacity is exceeded)', format: 'pct0', changeFormat: 'none' },
];

const NOT_APPLICABLE = 'Not applicable';
const ZERO_BASE = 'n/a: baseline is zero';

// A cell never carries a non-finite number or a missing value: text-only cells
// simply have no `value` key.
const cell = (value, text) => (Number.isFinite(value) ? { value, text } : { text });

function breakEvenCell(be) {
  if (be.status === 'not_needed') return { text: 'not needed' };
  if (be.status === 'infeasible') return { text: `infeasible: needs more than the ${formatValue(be.cap, 'pct0')} T0 + T1 share` };
  return cell(be.value, formatValue(be.value, 'pct0'));
}

function buildRows(r) {
  const b = r.baseline;
  const s = r.scenario;
  const undef = new Set(r.undefined_ratios);
  const ratioChange = (name, ratio) => (undef.has(name) || ratio === null ? { text: ZERO_BASE } : cell(ratio - 1, formatValue(ratio - 1, 'pctchg0')));
  const util = (v) => (v >= 1 ? `${formatValue(v, 'pct1')} over capacity` : formatValue(v, 'pct1'));
  const cycle = (v) => (v === null ? { text: 'unbounded (over capacity)' } : cell(v, formatValue(v, 'days1')));
  let cycleChange;
  if (b.cycle_days === null || s.cycle_days === null) cycleChange = { text: 'n/a: over capacity' };
  else if (b.cycle_days === 0) cycleChange = { text: ZERO_BASE };
  else cycleChange = cell(s.cycle_days / b.cycle_days - 1, formatValue(s.cycle_days / b.cycle_days - 1, 'pctchg0'));
  const na = { text: NOT_APPLICABLE };
  const by = {
    output_per_head: [cell(b.output_per_head_per_quarter, formatValue(b.output_per_head_per_quarter, 'int')),
      cell(s.output_per_head_per_quarter, formatValue(s.output_per_head_per_quarter, 'int')),
      ratioChange('output_per_head', r.ratios.output_per_head)],
    cost_per_asset: [cell(b.cost_per_asset, formatValue(b.cost_per_asset, 'usd2')),
      cell(s.cost_per_asset, formatValue(s.cost_per_asset, 'usd2')),
      ratioChange('cost_per_asset', r.ratios.cost_per_asset)],
    total_cost: [cell(b.cost.total, formatValue(b.cost.total, 'usdm2')),
      cell(s.cost.total, formatValue(s.cost.total, 'usdm2')),
      ratioChange('total_cost', r.ratios.total_cost)],
    budget_share: [cell(b.production_share_of_budget, formatValue(b.production_share_of_budget, 'pct1')),
      cell(s.production_share_of_budget, formatValue(s.production_share_of_budget, 'pct1')),
      cell(r.deltas.production_share_of_budget, formatValue(r.deltas.production_share_of_budget, 'pts1'))],
    ai_spend: [cell(b.ai_spend, formatValue(b.ai_spend, 'usd0')), cell(s.ai_spend, formatValue(s.ai_spend, 'usd0')),
      ratioChange('ai_spend', r.ratios.ai_spend)],
    cycle_time: [cycle(b.cycle_days), cycle(s.cycle_days), cycleChange],
    utilisation: [cell(b.utilisation, util(b.utilisation)), cell(s.utilisation, util(s.utilisation)),
      cell(s.utilisation - b.utilisation, formatValue(s.utilisation - b.utilisation, 'pts1'))],
    break_even: [na, breakEvenCell(r.break_even_auto_approval), na],
    capacity_floor: [na, breakEvenCell(r.capacity_auto_approval), na],
  };
  return by;
}

// ---- Headcount scenarios (CALC-04) ----

const finite = (v) => (Number.isFinite(v) ? v : 0);

function requiredReviewerFte(side, a) {
  return (side.review_hours * (1 + a.rework_rate)) / (a.reviewer_hours_per_fte_year * a.target_utilisation);
}

// Redeploy keeps the team and the 2x output. Hold keeps the team and today's volume
// (multiplier 1 with the scaled assumptions). Reduce cuts reviewer headcount only,
// to the capacity the 2x output needs. The change cost applies in every scenario.
export function scenarioOutcomes(values, ctx, mode) {
  const out = run(values, ctx);
  if (!out.ok) return { ok: false, errors: out.errors };
  const m = SCENARIOS.includes(mode) ? mode : 'redeploy';
  const { inputs, assumptions } = toCompute(values, ctx);
  const r = out.result;
  let side = r.scenario;
  let production = r.scenario.cost.total - r.baseline.cost.total;
  if (m === 'hold') {
    const held = compute({ ...inputs, multiplier: 1 }, assumptions);
    if (!held.ok) return { ok: false, errors: held.errors.map((e) => ({ key: keyFor(e), message: e.message })) };
    side = held.scenario;
    production = held.scenario.cost.total - r.baseline.cost.total;
  }
  const required = requiredReviewerFte(side, assumptions);
  const delta = values.reviewers - required;
  const people = m === 'reduce' && delta > 0 ? -delta * ctx.fixed.loaded_fte_cost : 0;
  const oneOff = ctx.fixed.change_cost_per_fte * (values.marketers + values.reviewers);
  const net = people + production + oneOff;
  if (![required, delta, people, production, oneOff, net].every(Number.isFinite)) return { ok: false, errors: [{ key: null, message: 'These inputs are too large to calculate.' }] };
  return {
    ok: true, mode: m, reviewer_fte_required: required, reviewer_fte_delta: delta, people_cost_change: people,
    production_cost_change: production, change_mgmt_one_off: oneOff, first_year_net: net,
  };
}

// ---- Sensitivity (CALC-05): each input moved 20% down and up, others unchanged ----

export const SENSITIVITY_STEP = 0.2;
const SENSITIVITY_ROWS = 5;

function perturb(field, base, step, ctx) {
  const target = base * (1 + step);
  let v = target;
  let capped = false;
  if (field.kind === 'int') {
    v = Math.round(target);
    if (v < 1) { v = 1; capped = target < 1 - 1e-9; }
  }
  let limit = Infinity;
  if (field.kind === 'pct') limit = 1;
  const mix = ctx.assumptions.tier_mix;
  if (field.key === 'auto1') limit = Math.min(limit, mix.baseline[0] + mix.baseline[1]);
  if (field.key === 'auto2') limit = Math.min(limit, mix.scaled[0] + mix.scaled[1]);
  if (v > limit) { v = limit; capped = true; }
  return { v, capped };
}

export function sensitivity(values, ctx) {
  const base = run(values, ctx);
  if (!base.ok) return [];
  const b = base.result.scenario;
  const rel = (now, was) => (was === 0 || !Number.isFinite(now) || !Number.isFinite(was) ? null : now / was - 1);
  const rows = FIELDS.map((field, order) => {
    const cost = { down: null, up: null };
    const util = { down: null, up: null };
    const capped = { down: false, up: false };
    const baseValue = values[field.key];
    for (const [dir, step] of [['down', -SENSITIVITY_STEP], ['up', SENSITIVITY_STEP]]) {
      if (baseValue === 0) continue;
      const p = perturb(field, baseValue, step, ctx);
      capped[dir] = p.capped;
      const r = run({ ...values, [field.key]: p.v }, ctx);
      if (!r.ok) continue;
      cost[dir] = rel(r.result.scenario.cost_per_asset, b.cost_per_asset);
      util[dir] = rel(r.result.scenario.utilisation, b.utilisation);
    }
    const swing = Math.abs(finite(cost.down)) + Math.abs(finite(cost.up));
    return { key: field.key, label: field.label, ref: field.asm, grade: ctx.grades[field.asm], cost, util, capped, swing, order };
  });
  rows.sort((x, y) => y.swing - x.swing || x.order - y.order);
  return rows.slice(0, SENSITIVITY_ROWS).map(({ swing, order, ...row }) => row);
}

const SCENARIO_NAMES = { redeploy: 'Redeploy', hold: 'Hold', reduce: 'Reduce' };

function scenarioPresentation(values, ctx) {
  const o = scenarioOutcomes(values, ctx, values.scenario);
  const mode = o.ok ? o.mode : (SCENARIOS.includes(values.scenario) ? values.scenario : 'redeploy');
  const util = weakestGrade(OUTPUT_DEPS.utilisation, ctx.grades);
  const prod = weakestGrade(OUTPUT_DEPS.total_cost, ctx.grades);
  const defs = [
    ['reviewer_fte_required', 'Reviewer FTE required at target utilisation', util, (v) => formatValue(v, 'num1')],
    ['reviewer_fte_delta', 'Reviewer FTE freed (or needed)', util, (v) => (v >= 0 ? `${formatValue(v, 'num1')} freed` : `needs ${formatValue(-v, 'num1')} more reviewers`)],
    ['people_cost_change', 'Annual people cost change', { grade: ctx.grades['asm-loaded-fte-cost'], ref: 'asm-loaded-fte-cost' }, (v) => formatValue(v, 'usd0')],
    ['production_cost_change', 'Annual production cost change', prod, (v) => formatValue(v, 'usd0')],
    ['change_mgmt_one_off', 'One-off change cost (year one)', { grade: ctx.grades['asm-change-mgmt'], ref: 'asm-change-mgmt' }, (v) => formatValue(v, 'usd0')],
    ['first_year_net', 'First-year net cost change', { grade: ctx.grades['asm-change-mgmt'], ref: 'asm-change-mgmt' }, (v) => formatValue(v, 'usd0')],
  ];
  const rows = defs.map(([id, label, g, fmt]) => {
    const node = o.ok && Number.isFinite(o[id]) ? { value: o[id], text: fmt(o[id]) } : { text: 'n/a' };
    return { id, label, ...node, grade: g.grade, ref: g.ref };
  });
  return { mode, name: SCENARIO_NAMES[mode], rows };
}

function sensitivityPresentation(values, ctx) {
  const node = (v) => (v === null ? { text: 'n/a' } : { value: v, text: formatValue(v, 'pctchg1') });
  return sensitivity(values, ctx).map((row) => ({
    key: row.key, label: row.label,
    cells: { costDown: node(row.cost.down), costUp: node(row.cost.up), utilDown: node(row.util.down), utilUp: node(row.util.up) },
    capped: row.capped, grade: row.grade, ref: row.ref,
  }));
}

export function present(values, ctx) {
  const out = run(values, ctx);
  if (!out.ok) {
    return {
      ok: false, summary: '', overCapacity: false, rows: [],
      errors: out.errors.map((e) => (e.key === null ? { message: e.message } : { key: e.key, message: e.message })),
    };
  }
  const r = out.result;
  const cells = buildRows(r);
  const rows = RESULT_ROWS.map((def) => {
    const [base, scaled, change] = cells[def.id];
    const { grade, ref } = weakestGrade(OUTPUT_DEPS[def.id], ctx.grades);
    return { id: def.id, label: def.label, base, scaled, change, grade, ref };
  });
  const over = r.scenario.review_capacity_exceeded;
  const x = formatValue(r.scenario.output_per_head_per_quarter, 'int');
  const y = formatValue(r.scenario.cost_per_asset, 'usd2');
  const z = formatValue(r.scenario.utilisation, 'pct0');
  const summary = `At 2x, your team approves ${x} variants per head per quarter at ${y} per approved asset, with reviewers ${over ? 'over capacity at' : 'at'} ${z} of capacity.`;
  return {
    ok: true, summary, overCapacity: over, rows, errors: [],
    scenario: scenarioPresentation(values, ctx), sensitivity: sensitivityPresentation(values, ctx),
  };
}
