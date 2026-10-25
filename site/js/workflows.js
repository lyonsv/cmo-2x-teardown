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
  ['escape_rate', isNonNeg], ['cost_per_escape', isNonNeg], ['demand_multiplier', isPos],
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
  const labour = (total_hours / a.reviewer_hours_per_fte_year) * fixed.loaded_fte_cost;
  return {
    units,
    hours_per_unit: total_hours / units,
    review_hours: exception,
    execution_hours: total_hours - exception,
    total_hours,
    fte: total_hours / a.reviewer_hours_per_fte_year,
    required_fte: side.reviewer_fte_required,
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
    let m_A = cap;
    let binding = 'pool';
    if (w.constraint === 'traffic' && engine.traffic_growth < m_A) { m_A = engine.traffic_growth; binding = 'traffic'; }
    if (w.constraint === 'review_gate' && revMax < m_A) { m_A = revMax; binding = 'review_gate'; }
    return { w, e, cap, m_A, binding, H0: w.units * w.h };
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
      cap: r.cap, m_A: r.m_A, binding: r.binding, level: r.w.level,
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
  const { engine, rows } = x;
  let hours = 0, released = 0, lo = 0, hi = 0;
  for (const r of rows) {
    hours += r.H0;
    released += r.H0 * r.e.r_eff;
    lo += r.H0 * r.w.lo;
    hi += r.H0 * r.w.hi;
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
  for (const r of rows) per_pool[r.w.id] = { multiple: r.m_A, binding: r.binding };
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
    if (!allFinite(out)) return { ok: false, errors: [{ field: null, message: 'inputs produce a value outside the representable range' }] };
    return out;
  } catch (err) {
    return { ok: false, errors: [{ field: null, message: `engine failure: ${err && err.message ? err.message : 'unknown'}` }] };
  }
}
