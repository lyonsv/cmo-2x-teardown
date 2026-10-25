// Pure portfolio engine. No DOM, no storage, no data.js import. economics() never
// throws and never returns NaN or Infinity: bad input comes back as { ok: false, errors }.
// Slice figures (compute(), the v1 content-factory model) and portfolio figures
// (this module) are different scopes and are never summed; the funding check is
// the only ratio that crosses them and it is labelled as such.
// Only function declarations run at module-evaluation time, so the import cycle
// with calc.js (which re-exports this module) is safe in either import order.
import { compute } from './calc.js';

export const WORKFLOW_IDS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'];

const LEVERS = ['inference', 'escape', 'review_overhead'];
const CONSTRAINTS = [null, 'review_gate', 'traffic'];

const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
const isNonNeg = (x) => isNum(x) && x >= 0;
const isShare = (x) => isNum(x) && x >= 0 && x <= 1;
const isPos = (x) => isNum(x) && x > 0;

function pickSide(value, which) {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'baseline' in value) return value[which];
  return value;
}

function allFinite(x) {
  if (typeof x === 'number') return Number.isFinite(x);
  if (Array.isArray(x)) return x.every(allFinite);
  if (x && typeof x === 'object') return Object.values(x).every(allFinite);
  return true;
}

function fullLevers(levers) {
  const src = levers && typeof levers === 'object' ? levers : {};
  const out = {};
  for (const k of LEVERS) out[k] = src[k] === undefined ? 1 : src[k];
  return out;
}

function overheadShare(engine, level) {
  return engine.overhead_share['L' + level];
}

// Effective per-workflow parameters at adoption a and review-overhead lever k.
// r is the typed NET reduction at k = 1, so more overhead trades against it.
function effective(w, engine, a, k) {
  const ov = overheadShare(engine, w.level);
  return { ov, r_eff: a * (w.r - ov * (k - 1)), ov_eff: ov * k * a, s_eff: w.s * a };
}

// ---------------------------------------------------------------- validation

const ENGINE_FIELDS = [
  ['productive_hours', isPos], ['out_of_scope_fte', isNonNeg], ['out_of_scope_uplift', isShare],
  ['autonomous_share_l3', isShare], ['adoption', isShare], ['year1_realisation', isShare],
  ['escape_rate', isShare], ['cost_per_escape', isNonNeg], ['demand_multiplier', isPos],
  ['traffic_growth', isPos], ['agency_cost_per_fte_equiv', isPos], ['build_one_off', isNonNeg],
  ['severance_months', isNonNeg], ['min_removable_fte', isNonNeg], ['counterfactual_funded_share', isShare],
];
const PROFILE_FIELDS = ['steps', 'tin', 'tout', 'retry', 'judge'];
const WORKFLOW_NUMERIC = ['fte', 'units', 'h', 'agency', 'r', 'lo', 'hi', 's', 'cycle_now', 'cycle_agent'];

export function validateEngine(ec, levers) {
  const errors = [];
  const bad = (field, message) => errors.push({ field, message });
  if (!ec || typeof ec !== 'object') return [{ field: 'ec', message: 'engine context must be an object' }];
  const { inputs, assumptions, fixed, engine, workflows } = ec;
  for (const [name, v] of [['inputs', inputs], ['assumptions', assumptions], ['fixed', fixed], ['engine', engine]]) {
    if (!v || typeof v !== 'object') bad(name, `${name} must be an object`);
  }
  if (!Array.isArray(workflows) || workflows.length === 0) bad('workflows', 'workflows must be a non-empty array');
  if (errors.length) return errors;

  if (!isPos(inputs.marketing_fte)) bad('inputs.marketing_fte', 'marketing_fte must be a finite number greater than 0');
  if (!isPos(inputs.reviewer_fte)) bad('inputs.reviewer_fte', 'reviewer_fte must be a finite number greater than 0');
  if (!isPos(inputs.multiplier)) bad('inputs.multiplier', 'multiplier must be a finite number greater than 0');
  if (!isPos(fixed.loaded_fte_cost)) bad('fixed.loaded_fte_cost', 'loaded_fte_cost must be a finite number greater than 0');
  if (!isNonNeg(fixed.change_cost_per_fte)) bad('fixed.change_cost_per_fte', 'change_cost_per_fte must be a finite number of at least 0');

  for (const [f, ok] of ENGINE_FIELDS) {
    if (!ok(engine[f])) bad(`engine.${f}`, `${f} is missing or out of range`);
  }
  const os = engine.overhead_share;
  for (const L of ['L1', 'L2', 'L3', 'L4']) {
    if (!os || !isShare(os[L])) bad(`engine.overhead_share.${L}`, `overhead_share.${L} must be a share between 0 and 1`);
  }
  const pt = engine.platform_team;
  if (!pt || !isNonNeg(pt.fte) || !isNonNeg(pt.cost_per_fte)) bad('engine.platform_team', 'platform_team needs fte and cost_per_fte of at least 0');
  const ao = engine.autonomy_overhead_hours;
  if (!ao || !isNonNeg(ao.per_workflow_month) || !isNonNeg(ao.calibration_month)) bad('engine.autonomy_overhead_hours', 'autonomy_overhead_hours needs per_workflow_month and calibration_month of at least 0');
  const tp = engine.token_price;
  for (const tier of ['frontier', 'small']) {
    if (!tp || !tp[tier] || !isNonNeg(tp[tier].in) || !isNonNeg(tp[tier].out)) bad(`engine.token_price.${tier}`, `token_price.${tier} needs in and out prices of at least 0`);
  }
  const jc = engine.judge_call;
  if (!jc || !isNonNeg(jc.tin) || !isNonNeg(jc.tout) || !tp || !tp[jc.tier]) bad('engine.judge_call', 'judge_call needs tin, tout and a known tier');
  if (!Array.isArray(engine.portfolio)) bad('engine.portfolio', 'portfolio must be an array of workflow ids');
  // Code review IN-03: the switch and the chain diagnostic are validated too.
  if (typeof engine.agency_scales_with_output !== 'boolean') bad('engine.agency_scales_with_output', 'agency_scales_with_output must be true or false');
  const ch = engine.chain;
  if (ch !== undefined && (!ch || typeof ch !== 'object' || !isShare(ch.p) || !Number.isInteger(ch.steps) || ch.steps < 1
    || !Number.isInteger(ch.steps_between_gates) || ch.steps_between_gates < 1 || !Number.isInteger(ch.retries) || ch.retries < 0)) {
    bad('engine.chain', 'chain needs p as a share and whole numbers of steps (at least 1), steps between gates (at least 1) and retries (at least 0)');
  }

  const k = fullLevers(levers);
  for (const name of LEVERS) {
    if (!isNonNeg(k[name])) bad(`levers.${name}`, `${name} lever must be a finite number of at least 0`);
  }

  const seen = new Set();
  workflows.forEach((w, i) => {
    const p = `workflows[${i}]`;
    if (!w || typeof w !== 'object') return bad(p, 'workflow must be an object');
    if (typeof w.id !== 'string' || w.id === '') bad(`${p}.id`, 'id must be a non-empty string');
    else if (seen.has(w.id)) bad(`${p}.id`, `id must be unique; "${w.id}" is repeated`);
    else seen.add(w.id);
    for (const f of WORKFLOW_NUMERIC) {
      if (!isNum(w[f])) bad(`${p}.${f}`, `${f} is missing or not a finite number`);
      else if (w[f] < 0) bad(`${p}.${f}`, `${f} must be at least 0`);
    }
    if (isNum(w.units) && w.units <= 0) bad(`${p}.units`, 'units must be greater than 0');
    if (isNum(w.h) && w.h <= 0) bad(`${p}.h`, 'h must be greater than 0');
    for (const f of ['r', 'lo', 'hi', 's']) {
      if (isNum(w[f]) && w[f] > 1) bad(`${p}.${f}`, `${f} must be a share between 0 and 1`);
    }
    if (!Number.isInteger(w.level) || w.level < 1 || w.level > 4) bad(`${p}.level`, 'level must be an integer from 1 to 4');
    if (!CONSTRAINTS.includes(w.constraint === undefined ? null : w.constraint)) bad(`${p}.constraint`, "constraint must be null, 'review_gate' or 'traffic'");
    const pr = w.profile;
    if (!pr || typeof pr !== 'object') bad(`${p}.profile`, 'profile is missing');
    else {
      for (const f of PROFILE_FIELDS) if (!isNonNeg(pr[f])) bad(`${p}.profile.${f}`, `${f} is missing or not a finite number of at least 0`);
      if (!tp || !tp[pr.tier]) bad(`${p}.profile.tier`, 'tier must be frontier or small');
    }
    if (isNum(w.r) && Number.isInteger(w.level) && w.level >= 1 && w.level <= 4 && os && isShare(os['L' + w.level]) && isShare(engine.adoption) && isNonNeg(k.review_overhead)) {
      const e = effective(w, engine, engine.adoption, k.review_overhead);
      if (e.r_eff + e.ov_eff > 1 + 1e-12 || e.r_eff >= 1) bad(`${p}.r`, 'net reduction plus review overhead must be at most 1');
    }
  });
  if (Array.isArray(engine.portfolio)) {
    for (const id of engine.portfolio) if (!seen.has(id)) bad('engine.portfolio', `portfolio id "${id}" is not a workflow`);
  }
  if (engine.pilot !== undefined) {
    if (!Array.isArray(engine.pilot)) bad('engine.pilot', 'pilot must be an array of workflow ids');
    else for (const id of engine.pilot) if (!seen.has(id)) bad('engine.pilot', `pilot id "${id}" is not a workflow`);
  }
  return errors;
}

// ---------------------------------------------------------------- per-workflow states

function inferencePerUnit(profile, engine, lever) {
  const tp = engine.token_price[profile.tier];
  const run = (profile.steps * (profile.tin * tp.in + profile.tout * tp.out)) / 1e6 * (1 + profile.retry);
  const jc = engine.judge_call;
  const jp = engine.token_price[jc.tier];
  const judge = (profile.judge * (jc.tin * jp.in + jc.tout * jp.out)) / 1e6;
  return (run + judge) * lever;
}

function stateOf(w, engine, fixed, m, parts) {
  const units = w.units * m;
  const labour = (parts.total_hours / engine.productive_hours) * fixed.loaded_fte_cost;
  return {
    units,
    hours_per_unit: parts.total_hours / units,
    review_hours: parts.review_hours,
    execution_hours: parts.total_hours - parts.review_hours,
    total_hours: parts.total_hours,
    fte: parts.total_hours / engine.productive_hours,
    labour_cost: labour,
    agency_cost: parts.agency_cost,
    ai_cost: parts.ai_cost,
    cost_per_unit: (labour + parts.agency_cost + parts.ai_cost) / units,
    cycle_days: parts.cycle_days,
    autonomous_share: parts.autonomous_share,
  };
}

// Today's state: no agent work, no review overhead, full agency spend, no AI cost.
export function currentState(w, engine, fixed) {
  return stateOf(w, engine, fixed, 1, {
    total_hours: w.units * w.h, review_hours: 0, agency_cost: w.agency, ai_cost: 0,
    cycle_days: w.cycle_now, autonomous_share: 0,
  });
}

// Agent-enabled state at volume multiple m, adoption a and levers.
export function workflowState(w, engine, fixed, m, adoption, levers) {
  const k = fullLevers(levers);
  const e = effective(w, engine, adoption, k.review_overhead);
  const base = w.units * m * w.h;
  const autonomous = w.level >= 3 ? engine.autonomous_share_l3 * adoption : 0;
  return stateOf(w, engine, fixed, m, {
    total_hours: base * (1 - e.r_eff),
    review_hours: base * e.ov_eff,
    agency_cost: w.agency * m * (1 - e.s_eff),
    ai_cost: w.units * m * inferencePerUnit(w.profile, engine, k.inference),
    cycle_days: w.cycle_agent,
    autonomous_share: autonomous,
  });
}

// W5 (review) is never a typed row: its states come from compute().
function reviewerState(side, a, which, fixed) {
  const S = (name) => pickSide(a[name], which);
  const units = side.generated_variants_per_year;
  const rework = S('rework_rate');
  const total_hours = side.review_hours * (1 + rework);
  const exception = (units * S('auto_approval_share') * (S('sampling_rate') + S('escalation_rate')) * S('review_minutes_per_variant') / 60) * (1 + rework);
  // Code review WR-06: reviewers are staffed to the target utilisation, so the people
  // the review work needs (and their cost) are the bridge's required FTE, the same
  // figure scenario B removes, not the hours divided by a full reviewer year.
  const fte = side.reviewer_fte_required;
  const labour = fte * fixed.loaded_fte_cost;
  return {
    units,
    hours_per_unit: total_hours / units,
    review_hours: exception,
    execution_hours: total_hours - exception,
    total_hours,
    fte,
    required_fte: fte,
    labour_cost: labour,
    agency_cost: 0,
    ai_cost: 0,
    cost_per_unit: labour / units,
    cycle_days: side.brief_to_live_days,
    cycle_days_pooled: side.brief_to_live_days_pooled,
    autonomous_share: S('auto_approval_share') * (1 - S('escalation_rate')),
  };
}

// ---------------------------------------------------------------- shared context

// Adoption moves the 2x auto-approval share toward baseline; the review-overhead
// lever scales sampling and escalation on each side.
function adjustAssumptions(asm, adoption, k) {
  const out = { ...asm };
  const auto = asm.auto_approval_share;
  if (auto && typeof auto === 'object' && 'baseline' in auto) {
    out.auto_approval_share = { baseline: auto.baseline, scaled: auto.baseline + adoption * (auto.scaled - auto.baseline) };
  }
  for (const f of ['sampling_rate', 'escalation_rate']) {
    const v = asm[f];
    out[f] = { baseline: pickSide(v, 'baseline') * k, scaled: pickSide(v, 'scaled') * k };
  }
  return out;
}

// One pool, one identity, used by every scenario (INV-1):
// slack0 + E = redeployed + removed + unused_remaining.
function bridgePool(F, req0, reqP1, m, removed) {
  const slack0 = F - req0;
  const E = req0 - reqP1;
  const redeployed = reqP1 * m - reqP1;
  const unused_remaining = F - reqP1 * m - removed;
  return { F, req0, reqP1, m, slack0, E, redeployed, removed, unused_remaining, gap: slack0 + E - (redeployed + removed + unused_remaining) };
}

function prepare(ec, levers) {
  const k = fullLevers(levers);
  const engine = ec.engine;
  const fixed = ec.fixed;
  const a = engine.adoption;
  const asm = adjustAssumptions(ec.assumptions, a, k.review_overhead);
  const c1 = compute({ ...ec.inputs, multiplier: 1 }, asm);
  if (!c1.ok) return { errors: c1.errors };
  const cM = compute(ec.inputs, asm);
  if (!cM.ok) return { errors: cM.errors };
  const F = ec.inputs.reviewer_fte;
  const req0 = c1.baseline.reviewer_fte_required;
  const reqP1 = c1.scenario.reviewer_fte_required;
  const revMax = reqP1 > 0 ? Math.min(F / reqP1, 1e9) : 1e9;
  const rows = ec.workflows.map((w) => {
    const e = effective(w, engine, a, k.review_overhead);
    const cap = 1 / (1 - e.r_eff);
    let m_max = cap;
    let binding = 'pool';
    if (w.constraint === 'traffic' && engine.traffic_growth < m_max) { m_max = engine.traffic_growth; binding = 'traffic'; }
    if (w.constraint === 'review_gate' && revMax < m_max) { m_max = revMax; binding = 'review_gate'; }
    // Scenario A output. Each unit needs agency input as well as in-house hours. When
    // agency spend grows with output (agency_scales_with_output, the default), the
    // output is what the people can carry and the extra agency spend is charged in
    // the net and counted in the metric's denominator. When it is held at today's
    // budget, output is capped at what that budget can support, 1 / (1 - s_eff).
    const headroom = e.s_eff < 1 ? 1 / (1 - e.s_eff) : Infinity;
    let m_A = m_max;
    let bindingA = binding;
    if (!engine.agency_scales_with_output && w.agency > 0 && headroom < m_A) { m_A = Math.max(1, headroom); bindingA = 'agency_budget'; }
    return { w, e, cap, m_max, m_A, binding, bindingA, headroom, H0: w.units * w.h };
  });
  const w4 = rows.find((r) => r.w.id === 'W4');
  const sliceA = w4 ? Math.min(w4.m_A, revMax) : 1;
  return { ec, engine, fixed, a, k, asm, c1, cM, F, req0, reqP1, revMax, rows, sliceA };
}

function orderIds(ids) {
  const known = WORKFLOW_IDS.filter((id) => ids.includes(id));
  return known.concat(ids.filter((id) => !WORKFLOW_IDS.includes(id)));
}

function buildWorkflows(x) {
  const { engine, fixed, a, k, asm, c1, cM, rows } = x;
  const out = {};
  for (const r of rows) {
    out[r.w.id] = {
      current: currentState(r.w, engine, fixed),
      agent: workflowState(r.w, engine, fixed, 1, a, k),
      agent_at_A: workflowState(r.w, engine, fixed, r.m_A, a, k),
      cap: r.cap, m_A: r.m_A, m_max: r.m_max, binding: r.binding, binding_A: r.bindingA, level: r.w.level,
      r_eff: r.e.r_eff, overhead_eff: r.e.ov_eff, s_eff: r.e.s_eff,
    };
  }
  const slice = compute({ ...x.ec.inputs, multiplier: x.sliceA }, asm);
  out.W5 = {
    current: reviewerState(c1.baseline, asm, 'baseline', fixed),
    agent: reviewerState(c1.scenario, asm, 'scaled', fixed),
    agent_at_A: slice.ok ? reviewerState(slice.scenario, asm, 'scaled', fixed) : null,
    agent_at_multiplier: reviewerState(cM.scenario, asm, 'scaled', fixed),
    cap: x.revMax,
    m_A: x.sliceA, binding: 'pool', level: 3,
  };
  const ids = orderIds(Object.keys(out));
  return Object.fromEntries(ids.map((id) => [id, out[id]]));
}

function buildPools(x) {
  const { engine, rows, F, req0, reqP1 } = x;
  const pools = {};
  for (const r of rows) {
    const Fm = r.w.fte;
    pools[r.w.id] = {
      kind: 'marketers', F: Fm, req0: Fm, reqP1: Fm * (1 - r.e.r_eff), slack0: 0, E: Fm * r.e.r_eff,
      released_hours: r.H0 * r.e.r_eff,
    };
  }
  const rh = x.asm.reviewer_hours_per_fte_year * x.asm.target_utilisation;
  pools.W5 = { kind: 'reviewers', F, req0, reqP1, slack0: F - req0, E: req0 - reqP1, released_hours: (req0 - reqP1) * rh };
  const ids = orderIds(Object.keys(pools));
  return Object.fromEntries(ids.map((id) => [id, pools[id]]));
}

function buildRollup(x) {
  const { engine, rows, a, k } = x;
  let hours = 0, released = 0, lo = 0, hi = 0;
  for (const r of rows) {
    hours += r.H0;
    released += r.H0 * r.e.r_eff;
    // Code review IN-01: the range ends get the same adoption and overhead adjustment
    // as the central reduction, so the central multiple always sits inside the range.
    lo += r.H0 * effective({ ...r.w, r: r.w.lo }, engine, a, k.review_overhead).r_eff;
    hi += r.H0 * effective({ ...r.w, r: r.w.hi }, engine, a, k.review_overhead).r_eff;
  }
  const mult = (rel) => (hours - rel > 0 ? hours / (hours - rel) : null);
  return {
    baseline_hours: hours, released_hours: released, released_fte: released / engine.productive_hours,
    released_hours_lo: lo, released_hours_hi: hi,
    multiple: mult(released), multiple_lo: mult(lo), multiple_hi: mult(hi),
  };
}

function buildMaxMultipliers(x) {
  const { rows, c1, revMax } = x;
  const cb = c1.capacity_bridge;
  const per_pool = {};
  for (const r of rows) per_pool[r.w.id] = { multiple: r.m_max, binding: r.binding };
  per_pool.W5 = { multiple: revMax, binding: 'pool' };
  const entries = Object.entries(per_pool);
  const lowest = (list) => {
    let best = null;
    for (const [id, v] of list) if (best === null || v.multiple < best.value) best = { value: v.multiple, binding: id };
    return best;
  };
  const uniform = lowest(entries);
  const noTraffic = lowest(entries.filter(([, v]) => v.binding !== 'traffic'));
  const ids = orderIds(Object.keys(per_pool));
  return {
    per_pool: Object.fromEntries(ids.map((id) => [id, per_pool[id]])),
    reviewers: {
      at_target: cb.max_multiple_at_target, at_full: cb.max_multiple_at_full,
      without_programme: cb.max_multiple_without_programme,
    },
    uniform,
    uniform_excluding_traffic: noTraffic,
  };
}

function buildPoolTotals(x, pools) {
  let marketer = 0;
  let reviewer = 0;
  const counted = [];
  for (const [id, p] of Object.entries(pools)) {
    counted.push(id);
    if (p.kind === 'reviewers') reviewer += p.released_hours;
    else marketer += p.released_hours;
  }
  return {
    marketer_released_hours: marketer, reviewer_released_hours: reviewer, total_released_hours: marketer + reviewer,
    pools_counted: counted,
  };
}

// ---------------------------------------------------------------- run cost and ledger

const COUNTED_IN = ['labour', 'agency', 'vendor', 'ai'];
const RUN_LINE_KIND = {
  platform_team: 'labour', platform_tooling: 'vendor', autonomy_overhead: 'labour',
  inference: 'ai', variant_ai: 'ai', escape: 'vendor',
};

// Programme run cost at a scenario's volumes. volumeOf(row) is the volume multiple
// of each typed workflow; mSlice is the volume multiple of the pilot slice (W5).
function runCost(x, volumeOf, mSlice) {
  const { engine, fixed, asm, k, c1, rows } = x;
  const pt = engine.platform_team;
  const tooling = pickSide(asm.tooling_cost_annual, 'scaled') - pickSide(asm.tooling_cost_annual, 'baseline');
  const n = rows.filter((r) => r.w.level >= 3).length + 1;
  const ao = engine.autonomy_overhead_hours;
  const overhead_hours = (ao.per_workflow_month * 12 * n + ao.calibration_month * 12) * k.review_overhead;
  const overhead_rate = fixed.loaded_fte_cost / asm.reviewer_hours_per_fte_year;
  let inference = 0;
  for (const r of rows) inference += r.w.units * volumeOf(r) * inferencePerUnit(r.w.profile, engine, k.inference);
  const G = c1.scenario.generated_variants_per_year * mSlice;
  const autoB = pickSide(asm.auto_approval_share, 'baseline');
  const autoS = pickSide(asm.auto_approval_share, 'scaled');
  const unseen = 1 - pickSide(asm.sampling_rate, 'scaled') - pickSide(asm.escalation_rate, 'scaled');
  const lines = {
    platform_team: pt.fte * pt.cost_per_fte,
    platform_tooling: tooling,
    autonomy_overhead: overhead_hours * overhead_rate,
    inference,
    variant_ai: G * pickSide(asm.variant_cost, 'scaled'),
    escape: G * (autoS - autoB) * unseen * engine.escape_rate * k.escape * engine.cost_per_escape,
  };
  lines.total = lines.platform_team + lines.platform_tooling + lines.autonomy_overhead + lines.inference + lines.variant_ai + lines.escape;
  return { ...lines, autonomy_overhead_hours: overhead_hours, autonomy_workflows: n };
}

export function checkLedger(rows) {
  const errors = [];
  if (!Array.isArray(rows)) return { ok: false, errors: [{ field: 'rows', message: 'ledger must be an array of rows' }] };
  const ids = new Set();
  const bySource = new Map();
  rows.forEach((row, i) => {
    const bad = (message) => errors.push({ field: row && row.id !== undefined ? row.id : `rows[${i}]`, message });
    if (!row || typeof row !== 'object') return bad('row must be an object');
    if (typeof row.id !== 'string' || row.id === '') bad('id must be a non-empty string');
    else if (ids.has(row.id)) bad(`id "${row.id}" is used twice (INV-6)`);
    else ids.add(row.id);
    if (!COUNTED_IN.includes(row.counted_in)) bad(`counted_in must be one of ${COUNTED_IN.join(', ')}`);
    if (row.scope !== 'portfolio' && row.scope !== 'slice') bad("scope must be 'portfolio' or 'slice'");
    if (!['saving', 'cost', 'avoided'].includes(row.kind)) bad("kind must be 'saving', 'cost' or 'avoided'");
    if (!isNum(row.amount)) return bad('amount must be a finite number');
    const isMedia = typeof row.line === 'string' && /media/i.test(row.line);
    if (isMedia && row.kind !== 'cost') bad('paid media is never a saving');
    if (row.kind === 'saving' || row.kind === 'avoided') {
      if (row.amount < 0) bad('a saving cannot be negative');
      if (isNum(row.source_amount)) {
        if (row.amount > row.source_amount + 1e-6) bad(`saving ${row.amount} exceeds its source line ${row.source_amount} (INV-5)`);
        const key = `${row.scenario || ''}|${row.source_line}`;
        const entry = bySource.get(key) || { sum: 0, source: row.source_amount };
        entry.sum += row.amount;
        bySource.set(key, entry);
      }
    }
  });
  for (const [key, e] of bySource) {
    if (e.sum > e.source + 1e-6) errors.push({ field: key, message: `savings on one source line sum to ${e.sum}, above the line ${e.source} (INV-6)` });
  }
  // Code review WR-05: a source line may be saved in one scenario only, so the same
  // dollars cannot reappear as another scenario's (or the funding check's) saving.
  const savedIn = new Map();
  for (const row of rows) {
    if (!row || row.kind !== 'saving' || typeof row.source_line !== 'string') continue;
    const set = savedIn.get(row.source_line) || new Set();
    set.add(row.scenario || '');
    savedIn.set(row.source_line, set);
  }
  for (const [line, set] of savedIn) {
    if (set.size > 1) errors.push({ field: line, message: `source line ${line} is saved in more than one scenario (${[...set].join(', ')})` });
  }
  return { ok: errors.length === 0, errors };
}

// Sums one scope and one scenario only: rows from two scopes, or from alternative
// scenarios (A, B and C are alternatives, not parts of one plan), never add up to one
// total (code review IN-04). Pass a scenario to sum that scenario's rows of the full ledger.
export function sumLedger(rows, scope, scenario) {
  if (!Array.isArray(rows)) return { ok: false, errors: [{ field: 'rows', message: 'ledger must be an array of rows' }] };
  if (scenario !== undefined) rows = rows.filter((r) => r && r.scenario === scenario && (scope === undefined || r.scope === scope));
  const scopes = new Set(rows.map((r) => r && r.scope));
  if (scopes.size > 1 || (scope !== undefined && scopes.size === 1 && !scopes.has(scope))) {
    return { ok: false, errors: [{ field: 'scope', message: 'rows of different scopes (slice and portfolio) cannot be summed' }] };
  }
  const scenarios = new Set(rows.map((r) => r && r.scenario).filter((s) => s !== undefined));
  if (scenarios.size > 1) {
    return { ok: false, errors: [{ field: 'scenario', message: 'rows of different scenarios are alternatives and cannot be summed' }] };
  }
  const by_counted_in = {};
  let savings = 0;
  let cost = 0;
  for (const r of rows) {
    if (r.kind === 'cost') cost += r.amount;
    else savings += r.amount;
    by_counted_in[r.counted_in] = (by_counted_in[r.counted_in] || 0) + (r.kind === 'cost' ? -r.amount : r.amount);
  }
  return { ok: true, scope: scope === undefined ? (rows.length ? rows[0].scope : null) : scope, savings, cost, net: savings - cost, by_counted_in };
}

// ---------------------------------------------------------------- scenarios

const SCENARIO_LABELS = { A: 'Same team, more output', B: 'Same output, lower cost', C: 'Growing demand, limited hiring' };

function totalAgency(rows) {
  return rows.reduce((t, r) => t + r.w.agency, 0);
}

function payback(oneOff, net) {
  return net > 0 ? oneOff / net : null;
}

function scenarioA(x) {
  const { rows, engine, fixed, F, req0, reqP1 } = x;
  const per_workflow = {};
  const agency_budget_binds = {};
  let implied = 0;
  const bridge = {};
  const implied_by_workflow = {};
  for (const r of rows) {
    per_workflow[r.w.id] = r.m_A;
    // The budget binds where the output people can carry needs more agency input than
    // today's budget buys; reported on the labour-limited output under either setting.
    agency_budget_binds[r.w.id] = r.m_max > r.headroom + 1e-9 && r.w.agency > 0;
    const g = Math.max(0, r.w.agency * (r.m_A * (1 - r.e.s_eff) - 1));
    implied_by_workflow[r.w.id] = g;
    implied += g;
    bridge[r.w.id] = bridgePool(r.w.fte, r.w.fte, r.w.fte * (1 - r.e.r_eff), r.m_A, 0);
  }
  bridge.W5 = bridgePool(F, req0, reqP1, x.sliceA, 0);
  per_workflow.W5 = x.sliceA;
  const run_cost = runCost(x, (r) => r.m_A, x.sliceA);
  const today = totalAgency(rows);
  // With agency held at today's budget the output is capped, so no growth is implied.
  const net = -run_cost.total - implied;
  const change = fixed.change_cost_per_fte * x.ec.inputs.marketing_fte;
  return {
    id: 'A', label: SCENARIO_LABELS.A,
    output: { per_workflow, slice: x.sliceA },
    labour: { cash_change: 0, removable_fte: 0, hires_with: 0, hires_without: 0, avoided_hires: 0, unused: null },
    agency: { today, scenario: today + implied, saving: 0, implied_growth: implied, implied_by_workflow, scales_with_output: !!engine.agency_scales_with_output, budget_binds: agency_budget_binds },
    run_cost, one_off: { build: engine.build_one_off, change, total: engine.build_one_off + change },
    net, payback_simple: null, payback_ramped: null, bridge,
  };
}

function scenarioB(x) {
  const { rows, engine, fixed, F, req0, reqP1 } = x;
  const thr = engine.min_removable_fte;
  const bridge = {};
  const removable_by_pool = {};
  const fragmented = {};
  let removable = 0;
  let agency_saving = 0;
  const agency_by_workflow = {};
  for (const r of rows) {
    const gross = r.w.fte * r.e.r_eff;
    const removed = gross >= thr && gross > 0 ? gross : 0;
    if (removed === 0 && gross > 0) fragmented[r.w.id] = gross;
    removable_by_pool[r.w.id] = removed;
    removable += removed;
    bridge[r.w.id] = bridgePool(r.w.fte, r.w.fte, r.w.fte * (1 - r.e.r_eff), 1, removed);
    const sv = r.w.agency * r.e.s_eff;
    agency_by_workflow[r.w.id] = sv;
    agency_saving += sv;
  }
  const E = req0 - reqP1;
  const remRev = E >= thr && E > 0 ? E : 0;
  if (remRev === 0 && E > 0) fragmented.W5 = E;
  removable_by_pool.W5 = remRev;
  removable += remRev;
  bridge.W5 = bridgePool(F, req0, reqP1, 1, remRev);
  const loaded = fixed.loaded_fte_cost;
  const labour_saving = removable * loaded;
  const run_cost = runCost(x, () => 1, 1);
  const change = fixed.change_cost_per_fte * x.ec.inputs.marketing_fte;
  const severance = (removable * loaded * engine.severance_months) / 12;
  const one_off_total = engine.build_one_off + change + severance;
  const gross = labour_saving + agency_saving;
  const net = gross - run_cost.total;
  const year1_net = engine.year1_realisation * gross - run_cost.total;
  let ramped = null;
  if (net > 0) {
    if (one_off_total <= year1_net && year1_net > 0) ramped = one_off_total / year1_net;
    else ramped = 1 + (one_off_total - year1_net) / net;
  }
  const per_workflow = Object.fromEntries(rows.map((r) => [r.w.id, 1]));
  per_workflow.W5 = 1;
  const agencyToday = totalAgency(rows);
  return {
    id: 'B', label: SCENARIO_LABELS.B,
    output: { per_workflow, slice: 1 },
    labour: { cash_change: -labour_saving, saving: labour_saving, removable_fte: removable, removable_by_pool, fragmented, hires_with: 0, hires_without: 0, avoided_hires: 0, unused: null },
    agency: { today: agencyToday, scenario: agencyToday - agency_saving, saving: agency_saving, by_workflow: agency_by_workflow },
    run_cost, one_off: { build: engine.build_one_off, change, severance, total: one_off_total },
    net, year1_net, payback_simple: payback(one_off_total, net), payback_ramped: ramped, bridge,
  };
}

function scenarioC(x) {
  const { rows, engine, fixed, F, req0, reqP1 } = x;
  const d = engine.demand_multiplier;
  const bridge = {};
  const per_pool = {};
  let hiresWith = 0;
  let hiresWithout = 0;
  let unused = 0;
  let avoided = 0;
  let agencyWithout = 0;
  let agencyWith = 0;
  const demand = {};
  const pool = (id, Fp, without, wth) => {
    const hw = Math.max(0, without - Fp);
    const hi = Math.max(0, wth - Fp);
    const un = Math.max(0, Fp - wth);
    const av = hw - hi;
    per_pool[id] = {
      F: Fp, without, with: wth, hires_without: hw, hires_with: hi, unused: un, avoided: av,
      gap: av + un - (without - wth),
      identity_gap: Fp + hi - (wth + un),
    };
    hiresWith += hi;
    hiresWithout += hw;
    unused += un;
    avoided += av;
  };
  for (const r of rows) {
    const dw = r.w.constraint === 'traffic' ? Math.min(d, engine.traffic_growth) : d;
    demand[r.w.id] = dw;
    pool(r.w.id, r.w.fte, r.w.fte * dw, r.w.fte * dw * (1 - r.e.r_eff));
    bridge[r.w.id] = bridgePool(r.w.fte, r.w.fte, r.w.fte * (1 - r.e.r_eff), dw, 0);
    agencyWithout += r.w.agency * dw;
    agencyWith += r.w.agency * dw * (1 - r.e.s_eff);
  }
  demand.W5 = d;
  pool('W5', F, req0 * d, reqP1 * d);
  bridge.W5 = bridgePool(F, req0, reqP1, d, 0);
  const loaded = fixed.loaded_fte_cost;
  const today = totalAgency(rows);
  const run_cost = runCost(x, (r) => demand[r.w.id], d);
  // Code review WR-03: avoided hires and avoided agency growth are both savings only
  // against a plan that would really have been funded, so the funded share applies to both.
  const funded = engine.counterfactual_funded_share;
  const avoided_cost = (avoided * loaded + (agencyWithout - agencyWith)) * funded;
  // Code review CR-02: like A and B, C's net is the cash effect against today. Spend
  // rises (hires, agency growth and run cost), so there is no cash payback. The saving
  // against growing without the programme is a separate, avoided-cost figure.
  const net_avoided = avoided_cost - run_cost.total;
  const change = fixed.change_cost_per_fte * x.ec.inputs.marketing_fte;
  const one_off_total = engine.build_one_off + change;
  const versus_today = hiresWith * loaded + (agencyWith - today) + run_cost.total;
  const net = -versus_today;
  return {
    id: 'C', label: SCENARIO_LABELS.C,
    output: { per_workflow: demand, slice: d },
    labour: { cash_change: hiresWith * loaded, removable_fte: 0, hires_with: hiresWith, hires_without: hiresWithout, avoided_hires: avoided, unused, per_pool },
    agency: { today, without: agencyWithout, scenario: agencyWith, avoided: agencyWithout - agencyWith, avoided_funded: (agencyWithout - agencyWith) * funded },
    avoided_cost, net_avoided, run_cost, one_off: { build: engine.build_one_off, change, total: one_off_total },
    net, payback_simple: payback(one_off_total, net), payback_avoided: payback(one_off_total, net_avoided), payback_ramped: null, versus_today, bridge,
  };
}

// Code review WR-04: the production cost rise happens at the higher volume, so it is
// compared with the agency change at that same volume (scenario A's output), not with
// the same-output agency cut of scenario B. At the higher volume agency spend rises by
// the growth the output needs, so the agency change can free money only where a
// workflow's agency reduction outruns its volume growth.
function buildFunding(x, sc) {
  const { cM, rows } = x;
  const slice_cash_rise = cM.scenario.cost_cash.total - cM.baseline.cost_cash.total;
  const reducible_agency = rows.reduce((t, r) => t + r.w.agency * r.e.s_eff, 0);
  const agency_change_at_volume = rows.reduce((t, r) => t + r.w.agency * (sc.A.output.per_workflow[r.w.id] * (1 - r.e.s_eff) - 1), 0);
  const agency_released_at_volume = Math.max(0, -agency_change_at_volume);
  const netted_inside_delta = cM.baseline.cost_cash.variants - cM.scenario.cost_cash.variants;
  return {
    scope: 'cross-scope ratio',
    slice_cash_rise, reducible_agency, agency_change_at_volume, agency_released_at_volume, netted_inside_delta,
    coverage: slice_cash_rise > 0 ? Math.max(0, agency_released_at_volume - netted_inside_delta) / slice_cash_rise : null,
  };
}

function buildLedger(x, sc, funding) {
  const { rows, fixed, engine } = x;
  const loaded = fixed.loaded_fte_cost;
  const out = [];
  const add = (row) => out.push({ scope: 'portfolio', ...row });
  const B = sc.B;
  for (const [id, fte] of Object.entries(B.labour.removable_by_pool)) {
    if (fte <= 0) continue;
    add({ id: `B-labour-${id}`, scenario: 'B', line: `labour:${id}`, counted_in: 'labour', kind: 'saving', amount: fte * loaded, source_line: `pool:${id}`, source_amount: B.bridge[id].F * loaded });
  }
  for (const r of rows) {
    const sv = B.agency.by_workflow[r.w.id];
    if (sv > 0) add({ id: `B-agency-${r.w.id}`, scenario: 'B', line: `agency:${r.w.id}`, counted_in: 'agency', kind: 'saving', amount: sv, source_line: `agency:${r.w.id}`, source_amount: r.w.agency });
  }
  for (const key of ['A', 'B', 'C']) {
    for (const [line, counted_in] of Object.entries(RUN_LINE_KIND)) {
      add({ id: `${key}-run-${line}`, scenario: key, line, counted_in, kind: 'cost', amount: sc[key].run_cost[line], source_line: null, source_amount: null });
    }
  }
  const C = sc.C;
  for (const [id, p] of Object.entries(C.labour.per_pool)) {
    const amount = p.avoided * loaded * engine.counterfactual_funded_share;
    if (amount > 0) add({ id: `C-labour-${id}`, scenario: 'C', line: `labour:${id}`, counted_in: 'labour', kind: 'avoided', amount, source_line: `C-hires:${id}`, source_amount: p.hires_without * loaded });
  }
  for (const r of rows) {
    const dw = C.output.per_workflow[r.w.id];
    const without = r.w.agency * dw;
    const amount = (without - r.w.agency * dw * (1 - r.e.s_eff)) * engine.counterfactual_funded_share;
    if (amount > 0) add({ id: `C-agency-${r.w.id}`, scenario: 'C', line: `agency:${r.w.id}`, counted_in: 'agency', kind: 'avoided', amount, source_line: `C-agency:${r.w.id}`, source_amount: without });
  }
  out.push({
    id: 'funding-netted-variants', scenario: 'funding', line: 'variants', counted_in: 'vendor', scope: 'slice', kind: 'saving',
    amount: funding.netted_inside_delta, source_line: 'slice:variants', source_amount: x.c1.baseline.cost_cash.variants,
  });
  return out;
}

// ---------------------------------------------------------------- primary metric

const METRIC_DEFINITION = 'useful work = completed units x frozen baseline in-house standard hours; W5 review excluded as a gate; denominator = in-house FTE + agency FTE-equivalents, including the agency growth the extra output needs (+ platform team in agent-enabled states)';

function buildMetric(x, sc, rollup, maxMult) {
  const { rows, engine, ec, a } = x;
  const ph = engine.productive_hours;
  const eq = engine.agency_cost_per_fte_equiv;
  const pf = engine.platform_team.fte;
  const oosHours = engine.out_of_scope_fte * ph;
  const oosUplift = oosHours / (1 - engine.out_of_scope_uplift * a);
  const I0 = rows.reduce((t, r) => t + r.H0, 0) + oosHours;
  const D0 = ec.inputs.marketing_fte + totalAgency(rows) / eq;
  const IA = rows.reduce((t, r) => t + r.H0 * r.m_A, 0) + oosUplift;
  const portfolio = rows.filter((r) => engine.portfolio.includes(r.w.id));
  const I0p = portfolio.reduce((t, r) => t + r.H0, 0);
  const IAp = portfolio.reduce((t, r) => t + r.H0 * r.m_A, 0);
  const Dp = portfolio.reduce((t, r) => t + r.w.fte + r.w.agency / eq, 0);
  // Code review WR-07: the same multiple for the pilot workflows (review, a gate, is not output).
  const pilot = Array.isArray(engine.pilot) ? rows.filter((r) => engine.pilot.includes(r.w.id)) : [];
  const I0q = pilot.reduce((t, r) => t + r.H0, 0);
  const IAq = pilot.reduce((t, r) => t + r.H0 * r.m_A, 0);
  const Dq = pilot.reduce((t, r) => t + r.w.fte + r.w.agency / eq, 0);
  // Code review CR-01: the agency input the extra output needs is counted in the
  // denominator, so units that need agency work cannot be counted while that work is
  // held flat. Zero when agency spend is held at today's budget (output is capped).
  const growthBy = sc.A.agency.implied_by_workflow;
  const gA = rows.reduce((t, r) => t + growthBy[r.w.id], 0) / eq;
  const gAp = portfolio.reduce((t, r) => t + growthBy[r.w.id], 0) / eq;
  const gAq = pilot.reduce((t, r) => t + growthBy[r.w.id], 0) / eq;
  const ratio = (n, d) => (d > 0 ? n / d : null);
  const B = sc.B;
  const D_B = D0 - B.labour.removable_fte - B.agency.saving / eq + pf;
  const C = sc.C;
  const demand = C.output.per_workflow;
  const I_C = rows.reduce((t, r) => t + r.H0 * demand[r.w.id], 0) + oosHours;
  const D_C = D0 + C.labour.hires_with + (C.agency.scenario - C.agency.today) / eq + pf;
  const pooledBase = ec.inputs.marketing_fte * ph;
  return {
    I0, D0,
    A: {
      org_before_platform: ratio(IA / (D0 + gA), I0 / D0),
      org_after_platform: ratio(IA / (D0 + gA + pf), I0 / D0),
      portfolio_before_platform: Dp > 0 && I0p > 0 ? (IAp / (Dp + gAp)) / (I0p / Dp) : null,
      portfolio_after_platform: Dp > 0 && I0p > 0 ? (IAp / (Dp + gAp + pf)) / (I0p / Dp) : null,
      pilot_before_platform: Dq > 0 && I0q > 0 ? (IAq / (Dq + gAq)) / (I0q / Dq) : null,
      pilot_after_platform: Dq > 0 && I0q > 0 ? (IAq / (Dq + gAq + pf)) / (I0q / Dq) : null,
      agency_growth_fte_equiv: gA,
      agency_growth_fte_equiv_portfolio: gAp,
      per_workflow: Object.fromEntries(rows.map((r) => [r.w.id, r.m_A])),
    },
    B: { org: ratio(D0, D_B), D: D_B },
    C: { org: ratio(I_C / D_C, I0 / D0), I: I_C, D: D_C },
    pooled_hours_multiple: ratio(pooledBase, pooledBase - rollup.released_hours - oosHours * engine.out_of_scope_uplift * a),
    max_uniform_multiplier: maxMult.uniform.value,
    definition: METRIC_DEFINITION,
  };
}

// ---------------------------------------------------------------- reconciliation

// One portfolio-level reading of INV-1 for each scenario: the pool identities summed.
// Capacity already unused at baseline (slack0) is reported on its own line and never
// credited to the programme; capacity released by the programme (E) is what the other
// three destinations (redeployed, removed, left unused) share with it, plus any hires a
// pool needs when its extra work outruns its own capacity. Units are FTE.
function buildReconciliation(scenarios) {
  const out = {};
  for (const k of ['A', 'B', 'C']) {
    const t = { slack0: 0, released: 0, hires: 0, redeployed: 0, removed: 0, unused: 0, gap: 0 };
    for (const b of Object.values(scenarios[k].bridge)) {
      t.slack0 += b.slack0;
      t.released += b.E;
      t.redeployed += b.redeployed;
      t.removed += b.removed;
      // A pool whose extra work outruns its own capacity hires the shortfall (scenario C).
      t.hires += Math.max(0, -b.unused_remaining);
      t.unused += Math.max(0, b.unused_remaining);
      t.gap += Math.abs(b.slack0 + b.E + Math.max(0, -b.unused_remaining) - (b.redeployed + b.removed + Math.max(0, b.unused_remaining)));
    }
    out[k] = t;
  }
  return out;
}

// Code review WR-05: the reconciliation identity is zero by construction, so it cannot
// catch an error. This cross-check compares two independent code paths: the hours the
// pools release (buildPools) against the fall in total human hours between today's and
// the agent-enabled state of every workflow (buildWorkflows, with W5 from compute()).
function crossCheck(out) {
  const pools = out.pool_totals.total_released_hours;
  let states = 0;
  for (const w of Object.values(out.workflows)) states += w.current.total_hours - w.agent.total_hours;
  return { released_hours_pools: pools, released_hours_states: states, released_hours_gap: pools - states };
}

// ---------------------------------------------------------------- entry point

export function economics(ec, levers) {
  try {
    const errors = validateEngine(ec, levers);
    if (errors.length) return { ok: false, errors };
    const x = prepare(ec, levers);
    if (x.errors) return { ok: false, errors: x.errors };
    const pools = buildPools(x);
    const out = {
      ok: true,
      levers: x.k,
      workflows: buildWorkflows(x),
      pools,
      pool_totals: buildPoolTotals(x, pools),
      bridge: x.cM.capacity_bridge,
      rollup: buildRollup(x),
      max_multipliers: buildMaxMultipliers(x),
    };
    const scenarios = { A: scenarioA(x), B: scenarioB(x), C: scenarioC(x) };
    const funding = buildFunding(x, scenarios);
    const ledger = buildLedger(x, scenarios, funding);
    const check = checkLedger(ledger);
    if (!check.ok) return { ok: false, errors: check.errors };
    out.scenarios = scenarios;
    out.reconciliation = buildReconciliation(scenarios);
    out.checks = crossCheck(out);
    out.default_scenario = 'C';
    out.investment = {
      one_off: { build: x.engine.build_one_off, change: scenarios.B.one_off.change, severance_B: scenarios.B.one_off.severance },
      run: { A: scenarios.A.run_cost, B: scenarios.B.run_cost, C: scenarios.C.run_cost },
    };
    out.ledger = ledger;
    out.funding = funding;
    out.metric = buildMetric(x, scenarios, out.rollup, out.max_multipliers);
    if (!allFinite(out)) return { ok: false, errors: [{ field: null, message: 'inputs produce a value outside the representable range' }] };
    return out;
  } catch (err) {
    return { ok: false, errors: [{ field: null, message: `engine failure: ${err && err.message ? err.message : 'unknown'}` }] };
  }
}

// ---------------------------------------------------------------- sensitivity

// Pure re-runs of economics() with one parameter moved; ec is copied, never mutated.
// Adoption is one-sided (the default is 1.0, so only a low case exists). Removable
// FTE steps at the min_removable_fte threshold: a pool below it drops out whole
// (for example W8 at adoption 0.5), so some bars are jumpy by design.
const SENSITIVITY_MOVES = [
  { id: 'adoption', label: 'Adoption (share of the programme effect realised)', low: { adoption: 0.5 }, high: null },
  { id: 'escape', label: 'Escape rate', low: { escape: 0.5 }, high: { escape: 3 } },
  { id: 'inference', label: 'Inference price', low: { inference: 0.5 }, high: { inference: 5 } },
  { id: 'review_overhead', label: 'Review overhead', low: { review_overhead: 0.5 }, high: { review_overhead: 2 } },
];

function cell(r) {
  if (!r || !r.ok) return null;
  return {
    org_A_after: r.metric.A.org_after_platform,
    net_A: r.scenarios.A.net,
    net_B: r.scenarios.B.net,
    net_C: r.scenarios.C.net,
    removable_B: r.scenarios.B.labour.removable_fte,
  };
}

export function sensitivity(ec) {
  const errors = validateEngine(ec);
  if (errors.length) return { ok: false, errors };
  const baseRun = economics(ec);
  if (!baseRun.ok) return baseRun;
  const base = cell(baseRun);
  const rows = SENSITIVITY_MOVES.map((mv) => {
    const run = (move) => {
      if (!move) return null;
      if ('adoption' in move) {
        const copy = { ...ec, engine: { ...ec.engine, adoption: move.adoption } };
        return cell(economics(copy));
      }
      const name = Object.keys(move)[0];
      return cell(economics(ec, { [name]: move[name] }));
    };
    return { id: mv.id, label: mv.label, low: run(mv.low), base, high: run(mv.high) };
  });
  const swing = (row) => Math.max(
    row.low ? Math.abs(row.low.net_B - base.net_B) : 0,
    row.high ? Math.abs(row.high.net_B - base.net_B) : 0,
  );
  const ranking = rows.map((r) => r.id).sort((p, q) => swing(rows.find((r) => r.id === q)) - swing(rows.find((r) => r.id === p)));
  return { ok: true, rows, ranking };
}
