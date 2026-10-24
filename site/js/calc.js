// Pure calculator maths. No DOM, no imports. compute() never throws and never
// returns NaN or Infinity: bad input comes back as { ok: false, errors }.
// Undefined values are null, never an error: cycle_days when review capacity is
// exceeded, and any ratio whose baseline is 0 (named in undefined_ratios).

const POSITIVE_INPUTS = [
  'campaigns_per_year',
  'concepts_per_campaign',
  'variants_per_concept',
  'marketing_fte',
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
  const k = assumptions && typeof assumptions === 'object' ? assumptions.concept_growth_exponent : undefined;
  if (typeof k !== 'number' || !Number.isFinite(k) || k < 0 || k > 1) {
    errors.push({ field: 'concept_growth_exponent', message: 'concept_growth_exponent must be a finite number between 0 and 1' });
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
  const w = a.tier_weights;
  if (!Array.isArray(w) || w.length !== 4 || !w.every(isPositive)) {
    errors.push({ field: 'tier_weights', message: 'tier_weights must be four finite numbers greater than 0' });
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
  const both = (name, ok, msg) => {
    if (!ok(pick(a[name], 'baseline')) || !ok(pick(a[name], 'scaled'))) errors.push({ field: name, message: `${name} ${msg}` });
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
      errors.push({ field: 'auto_approval_share', message: `auto_approval_share (${which}) cannot exceed the T0 + T1 share of the tier mix` });
    }
  }
}

// Every cost-half assumption may differ by side ({ baseline, scaled }), so every
// one is read through pick(); validation checks both sides of the same fields.
function side(inputs, a, which, m) {
  const S = (name) => pick(a[name], which);
  const k = a.concept_growth_exponent;
  const concepts = inputs.campaigns_per_year * inputs.concepts_per_campaign * Math.pow(m, k);
  const variants_per_concept = inputs.variants_per_concept * Math.pow(m, 1 - k);
  const variants_per_year = concepts * variants_per_concept;
  const output_per_head_per_quarter = variants_per_year / 4 / inputs.marketing_fte;
  const generated_variants_per_year = variants_per_year / a.approval_yield;
  const mix = pick(a.tier_mix, which);
  const tier_factor = mix.reduce((acc, share, i) => acc + share * a.tier_weights[i], 0);
  const weighted_output_per_head_per_quarter = output_per_head_per_quarter * tier_factor;
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
  for (const k of ['generation', 'review', 'rework', 'tooling', 'rights', 'storage']) cost_per_asset_by_component[k] = cost[k] / V;
  const ai_spend = G * variantCost * S('ai_share_of_variant_cost') + tooling * S('ai_share_of_tooling');
  const exceeded = utilisation >= 1;
  const service = S('review_service_days');
  const cycle_days = exceeded ? null
    : S('build_days') + (1 + r) * (service + (service * utilisation) / (1 - utilisation));
  return {
    concepts, variants_per_concept, variants_per_year, generated_variants_per_year,
    output_per_head_per_quarter, weighted_output_per_head_per_quarter,
    review_hours, review_capacity_hours, utilisation, review_capacity_exceeded: exceeded,
    cost, cost_per_asset: cost.total / V, cost_per_asset_by_component, ai_spend, cycle_days,
    production_share_of_budget: cost.total / inputs.marketing_budget,
  };
}

function breakEven(inputs, a, scenario) {
  const S = (name) => pick(a[name], 'scaled');
  const q = S('sampling_rate') + S('escalation_rate');
  const denom = scenario.generated_variants_per_year * (1 + S('rework_rate')) * (S('review_minutes_per_variant') / 60);
  const hStar = (a.target_utilisation * scenario.review_capacity_hours) / denom;
  const aStar = (1 - hStar) / (1 - q);
  if (aStar <= 0) return { value: 0, status: 'not_needed' };
  if (aStar > 1) return { value: 1, status: 'infeasible' };
  return { value: aStar, status: 'ok' };
}

// Every numeric leaf must be finite; null (cycle_days at capacity, undefined ratios) is allowed.
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
    output_per_head: ratio('output_per_head', scenario.output_per_head_per_quarter, baseline.output_per_head_per_quarter),
    weighted_output_per_head: ratio('weighted_output_per_head',
      scenario.weighted_output_per_head_per_quarter, baseline.weighted_output_per_head_per_quarter),
    cost_per_asset: ratio('cost_per_asset', scenario.cost_per_asset, baseline.cost_per_asset),
    ai_spend: ratio('ai_spend', scenario.ai_spend, baseline.ai_spend),
    total_cost: ratio('total_cost', scenario.cost.total, baseline.cost.total),
  };
  ratios.cost_per_asset_change = ratios.cost_per_asset === null ? null : ratios.cost_per_asset - 1;
  const break_even_auto_approval = breakEven(inputs, assumptions, scenario);
  const out = { ok: true, baseline, scenario, ratios, undefined_ratios, break_even_auto_approval };
  // Last resort only: validation should stop every bad input first. Reaching
  // this means overflow from extreme but individually valid inputs, so no single
  // field can honestly be blamed.
  if (!allFinite(out)) {
    return { ok: false, errors: [{ field: null, message: 'inputs produce a value outside the representable range' }] };
  }
  return out;
}
