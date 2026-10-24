// Pure calculator maths. No DOM, no imports. compute() never throws and never
// returns NaN or Infinity: bad input comes back as { ok: false, errors }.
// The 2x is counted in campaign-markets (campaigns x markets a year). Variants,
// review load, cost and AI spend are derived from it, so extra crops, sizes or
// locales never raise the headline.
// Undefined values are null, never an error: brief_to_live_days when review capacity is
// exceeded, and any ratio whose baseline is 0 (named in undefined_ratios).

const POSITIVE_INPUTS = [
  'campaigns_per_year',
  'markets_per_campaign',
  'concepts_per_campaign',
  'formats_per_market',
  'reviewer_fte',
  'marketing_budget',
  'multiplier',
];

function isPositive(x) {
  return typeof x === 'number' && Number.isFinite(x) && x > 0;
}

function validate(inputs, assumptions) {
  const errors = [];
  const src = inputs && typeof inputs === 'object' ? inputs : {};
  for (const field of POSITIVE_INPUTS) {
    if (!isPositive(src[field])) {
      errors.push({ field, message: `${field} must be a finite number greater than 0` });
    }
  }
  const k = assumptions && typeof assumptions === 'object' ? assumptions.campaign_growth_share : undefined;
  if (typeof k !== 'number' || !Number.isFinite(k) || k < 0 || k > 1) {
    errors.push({ field: 'campaign_growth_share', message: 'campaign_growth_share must be a finite number between 0 and 1' });
  }
  validateTiers(assumptions, errors);
  validateCost(assumptions, errors);
  return errors;
}

// Assumption values may be { baseline, scaled }; a plain value applies to both sides.
function pick(value, which) {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'baseline' in value) return value[which];
  return value;
}

function isMix(x) {
  return Array.isArray(x) && x.length === 4 && x.every((v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1)
    && Math.abs(x.reduce((a, b) => a + b, 0) - 1) <= 1e-9;
}

function validateTiers(assumptions, errors) {
  const a = assumptions && typeof assumptions === 'object' ? assumptions : {};
  const y = a.approval_yield;
  if (typeof y !== 'number' || !Number.isFinite(y) || y <= 0 || y > 1) {
    errors.push({ field: 'approval_yield', message: 'approval_yield must be a finite number greater than 0 and at most 1' });
  }
  if (!isMix(pick(a.tier_mix, 'baseline')) || !isMix(pick(a.tier_mix, 'scaled'))) {
    errors.push({ field: 'tier_mix', message: 'tier_mix must be four shares between 0 and 1 summing to 1, for baseline and scaled' });
  }
}

const SHARE_FIELDS = ['sampling_rate', 'escalation_rate', 'rework_rate', 'ai_share_of_variant_cost', 'ai_share_of_tooling'];
const NONNEG_FIELDS = [
  'review_minutes_per_variant', 'reviewer_rate_per_hour', 'master_concept_cost', 'variant_cost', 'rights_cost_per_concept',
  'storage_cost_per_variant', 'tooling_cost_annual', 'build_days', 'review_service_days',
];

const isNonNeg = (x) => typeof x === 'number' && Number.isFinite(x) && x >= 0;
const isShare = (x) => isNonNeg(x) && x <= 1;

function validateCost(assumptions, errors) {
  const a = assumptions && typeof assumptions === 'object' ? assumptions : {};
  // `which` names the first failing side, so callers never parse the message.
  const both = (name, ok, msg) => {
    const which = ['baseline', 'scaled'].find((w) => !ok(pick(a[name], w)));
    if (which) errors.push({ field: name, which, message: `${name} ${msg}` });
  };
  both('auto_approval_share', isShare, 'must be a finite share between 0 and 1');
  for (const f of SHARE_FIELDS) both(f, isShare, 'must be a finite share between 0 and 1');
  for (const f of NONNEG_FIELDS) both(f, isNonNeg, 'must be a finite number of at least 0');
  if (!isShare(a.target_utilisation) || a.target_utilisation <= 0) {
    errors.push({ field: 'target_utilisation', message: 'target_utilisation must be greater than 0 and at most 1' });
  }
  if (!isPositive(a.reviewer_hours_per_fte_year)) {
    errors.push({ field: 'reviewer_hours_per_fte_year', message: 'reviewer_hours_per_fte_year must be a finite number greater than 0' });
  }
  for (const which of ['baseline', 'scaled']) {
    const sampling = pick(a.sampling_rate, which);
    const escalation = pick(a.escalation_rate, which);
    if (isShare(sampling) && isShare(escalation) && sampling + escalation > 1) {
      errors.push({ field: 'sampling_rate', message: `sampling_rate + escalation_rate (${which}) must be at most 1` });
    }
    const mix = pick(a.tier_mix, which);
    const share = pick(a.auto_approval_share, which);
    if (isMix(mix) && isShare(share) && share > mix[0] + mix[1] + 1e-9) {
      errors.push({ field: 'auto_approval_share', which, message: `auto_approval_share (${which}) cannot exceed the T0 + T1 share of the tier mix` });
    }
  }
}

// Every cost-half assumption may differ by side ({ baseline, scaled }), so every
// one is read through pick(); validation checks both sides of the same fields.
function side(inputs, a, which, m) {
  const S = (name) => pick(a[name], which);
  // The doubling is split in log terms: campaigns grow by m^share, markets by
  // m^(1 - share), so campaign-markets grow by exactly m on every route.
  const share = a.campaign_growth_share;
  const campaigns = inputs.campaigns_per_year * Math.pow(m, share);
  const markets = inputs.markets_per_campaign * Math.pow(m, 1 - share);
  const campaign_markets_per_year = campaigns * markets;
  const campaign_markets_per_quarter = campaign_markets_per_year / 4;
  const concepts = campaigns * inputs.concepts_per_campaign;
  const variants_per_concept = inputs.formats_per_market * markets;
  const variants_per_campaign_market = inputs.concepts_per_campaign * inputs.formats_per_market;
  const variants_per_year = concepts * variants_per_concept;
  const generated_variants_per_year = variants_per_year / a.approval_yield;
  const G = generated_variants_per_year;
  const V = variants_per_year;
  const auto = S('auto_approval_share');
  const q = S('sampling_rate') + S('escalation_rate');
  const h = 1 - auto * (1 - q);
  const r = S('rework_rate');
  const hoursPer = S('review_minutes_per_variant') / 60;
  const rate = S('reviewer_rate_per_hour');
  const review_hours = G * h * hoursPer;
  const review_capacity_hours = inputs.reviewer_fte * a.reviewer_hours_per_fte_year;
  const utilisation = (review_hours * (1 + r)) / review_capacity_hours;
  const variantCost = S('variant_cost');
  const tooling = S('tooling_cost_annual');
  const cost = {
    generation: concepts * S('master_concept_cost') + G * variantCost,
    review: review_hours * rate,
    rework: r * G * variantCost + r * G * h * hoursPer * rate,
    tooling,
    rights: concepts * S('rights_cost_per_concept'),
    storage: V * S('storage_cost_per_variant'),
  };
  cost.total = cost.generation + cost.review + cost.rework + cost.tooling + cost.rights + cost.storage;
  const cost_per_asset_by_component = {};
  for (const comp of ['generation', 'review', 'rework', 'tooling', 'rights', 'storage']) cost_per_asset_by_component[comp] = cost[comp] / V;
  const ai_spend = G * variantCost * S('ai_share_of_variant_cost') + tooling * S('ai_share_of_tooling');
  const exceeded = utilisation >= 1;
  const service = S('review_service_days');
  const brief_to_live_days = exceeded ? null
    : S('build_days') + (1 + r) * (service + (service * utilisation) / (1 - utilisation));
  return {
    campaigns, markets, campaign_markets_per_year, campaign_markets_per_quarter,
    concepts, variants_per_concept, variants_per_campaign_market, variants_per_year, generated_variants_per_year,
    human_touch_share: h, review_hours, review_capacity_hours, utilisation, review_capacity_exceeded: exceeded,
    cost, cost_per_asset: cost.total / V, cost_per_asset_by_component,
    cost_per_campaign_market: cost.total / campaign_markets_per_year, ai_spend, brief_to_live_days,
    production_share_of_budget: cost.total / inputs.marketing_budget,
  };
}

// Minimum auto-approval share at 2x that keeps reviewer utilisation at or below
// `utilisation`, at flat reviewer headcount. Called at target_utilisation (the
// break-even the page headlines) and at 1 (the share below which review
// capacity is exceeded outright).
function breakEven(a, scenario, utilisation) {
  const S = (name) => pick(a[name], 'scaled');
  const q = S('sampling_rate') + S('escalation_rate');
  const denom = scenario.generated_variants_per_year * (1 + S('rework_rate')) * (S('review_minutes_per_variant') / 60);
  const hStar = (utilisation * scenario.review_capacity_hours) / denom;
  // Auto-approval can only clear T0 and T1 work (validation enforces the same cap),
  // so a break-even share above that cap is infeasible even when it is below 1.
  const mix = pick(a.tier_mix, 'scaled');
  const cap = mix[0] + mix[1];
  if (hStar >= 1) return { value: 0, status: 'not_needed', cap };
  // Every auto-approved variant is sampled or escalated: auto-approval removes no
  // human touches, so no share can reach break-even.
  if (q >= 1) return { value: 1, status: 'infeasible', cap };
  const aStar = (1 - hStar) / (1 - q);
  if (aStar > 1) return { value: 1, status: 'infeasible', cap };
  if (aStar > cap + 1e-9) return { value: aStar, status: 'infeasible', cap };
  return { value: aStar, status: 'ok', cap };
}

// Every numeric leaf must be finite; null (brief_to_live_days at capacity, undefined ratios) is allowed.
function allFinite(x) {
  if (typeof x === 'number') return Number.isFinite(x);
  if (Array.isArray(x)) return x.every(allFinite);
  if (x && typeof x === 'object') return Object.values(x).every(allFinite);
  return true;
}

export function compute(inputs, assumptions) {
  const errors = validate(inputs, assumptions);
  if (errors.length > 0) return { ok: false, errors };
  const baseline = side(inputs, assumptions, 'baseline', 1);
  const scenario = side(inputs, assumptions, 'scaled', inputs.multiplier);
  // A ratio whose baseline is 0 (for example no AI spend today, or a zero-cost
  // baseline) has no meaning. It comes back as null and is listed in
  // undefined_ratios, rather than failing the whole result: every other output,
  // such as cost per asset, is still valid and is what the reader asked for.
  const undefined_ratios = [];
  const ratio = (name, num, den) => {
    if (den === 0) {
      undefined_ratios.push(name);
      return null;
    }
    return num / den;
  };
  const ratios = {
    campaign_markets: ratio('campaign_markets', scenario.campaign_markets_per_year, baseline.campaign_markets_per_year),
    cost_per_asset: ratio('cost_per_asset', scenario.cost_per_asset, baseline.cost_per_asset),
    cost_per_campaign_market: ratio('cost_per_campaign_market', scenario.cost_per_campaign_market, baseline.cost_per_campaign_market),
    ai_spend: ratio('ai_spend', scenario.ai_spend, baseline.ai_spend),
    total_cost: ratio('total_cost', scenario.cost.total, baseline.cost.total),
  };
  ratios.cost_per_asset_change = ratios.cost_per_asset === null ? null : ratios.cost_per_asset - 1;
  ratios.cost_per_campaign_market_change = ratios.cost_per_campaign_market === null ? null : ratios.cost_per_campaign_market - 1;
  ratios.total_cost_change = ratios.total_cost === null ? null : ratios.total_cost - 1;
  // Absolute changes, scenario minus baseline: the production cost rise that a
  // flat total marketing budget has to fund by reallocation (CR-02).
  const deltas = {
    total_cost: scenario.cost.total - baseline.cost.total,
    production_share_of_budget: scenario.production_share_of_budget - baseline.production_share_of_budget,
  };
  const break_even_auto_approval = breakEven(assumptions, scenario, assumptions.target_utilisation);
  const capacity_auto_approval = breakEven(assumptions, scenario, 1);
  const out = {
    ok: true, baseline, scenario, ratios, undefined_ratios, deltas, break_even_auto_approval, capacity_auto_approval,
  };
  // Last resort only: validation should stop every bad input first. Reaching
  // this means overflow from extreme but individually valid inputs, so no single
  // field can honestly be blamed.
  if (!allFinite(out)) {
    return { ok: false, errors: [{ field: null, message: 'inputs produce a value outside the representable range' }] };
  }
  return out;
}

// Worked variant matrix: concepts expanded by a list of factors. Each factor
// multiplies only the stated share (applies) of the running set by its count, so
// multiplier = 1 + applies x (count - 1) and factors are independent. Never throws,
// never returns NaN or Infinity; bad input comes back as { ok: false, errors }.
// Counts are EXPECTED counts: with a fractional `applies` the running set is not
// a whole number (variantMatrix(1, [{ id, count: 2, applies: 0.3 }]).total is
// 1.3). Nothing is rounded here; callers round for display only (formatValue
// 'int'), so totals stay exact for further arithmetic such as the approval yield.
export function variantMatrix(concepts, factors) {
  const errors = [];
  const isInt = (x) => typeof x === 'number' && Number.isInteger(x) && x >= 1;
  if (!isInt(concepts)) errors.push({ field: 'concepts', message: 'concepts must be a finite integer of at least 1' });
  if (!Array.isArray(factors) || factors.length === 0) {
    errors.push({ field: 'factors', message: 'factors must be a non-empty array' });
  } else {
    // Indexed loop, not forEach: forEach skips the holes of a sparse array, so a
    // hole would pass validation and break any consumer that reads rows[i].id.
    // Ids must be unique because data.js keys claims and assumptions by them.
    const ids = new Set();
    for (let i = 0; i < factors.length; i++) {
      const f = factors[i];
      const src = f && typeof f === 'object' ? f : {};
      if (typeof src.id !== 'string' || src.id === '') {
        errors.push({ field: `factors[${i}].id`, message: 'id must be a non-empty string' });
      } else if (ids.has(src.id)) {
        errors.push({ field: `factors[${i}].id`, message: `id must be unique; "${src.id}" is repeated` });
      } else {
        ids.add(src.id);
      }
      if (!isInt(src.count)) errors.push({ field: `factors[${i}].count`, message: 'count must be a finite integer of at least 1' });
      if (typeof src.applies !== 'number' || !Number.isFinite(src.applies) || src.applies < 0 || src.applies > 1) {
        errors.push({ field: `factors[${i}].applies`, message: 'applies must be a finite number between 0 and 1' });
      }
    }
  }
  if (errors.length) return { ok: false, errors };
  let running = concepts;
  const rows = factors.map((f) => {
    const multiplier = 1 + f.applies * (f.count - 1);
    running *= multiplier;
    return { id: f.id, count: f.count, applies: f.applies, multiplier, variants: running };
  });
  if (!Number.isFinite(running)) return { ok: false, errors: [{ field: 'factors', message: 'the product is too large to represent' }] };
  return { ok: true, concepts, rows, total: running, per_concept: running / concepts };
}
