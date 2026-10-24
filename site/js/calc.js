// Pure calculator maths. No DOM, no imports. compute() never throws and never
// returns NaN or Infinity: bad input comes back as { ok: false, errors }.

const POSITIVE_INPUTS = [
  'campaigns_per_year',
  'concepts_per_campaign',
  'variants_per_concept',
  'marketing_fte',
  'reviewer_fte',
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

function side(inputs, a, which, m) {
  const k = a.concept_growth_exponent;
  const concepts = inputs.campaigns_per_year * inputs.concepts_per_campaign * Math.pow(m, k);
  const variants_per_concept = inputs.variants_per_concept * Math.pow(m, 1 - k);
  const variants_per_year = concepts * variants_per_concept;
  const output_per_head_per_quarter = variants_per_year / 4 / inputs.marketing_fte;
  const generated_variants_per_year = variants_per_year / a.approval_yield;
  const mix = pick(a.tier_mix, which);
  const tier_factor = mix.reduce((acc, share, i) => acc + share * a.tier_weights[i], 0);
  const weighted_output_per_head_per_quarter = output_per_head_per_quarter * tier_factor;
  return {
    concepts, variants_per_concept, variants_per_year, generated_variants_per_year,
    output_per_head_per_quarter, weighted_output_per_head_per_quarter,
  };
}

export function compute(inputs, assumptions) {
  const errors = validate(inputs, assumptions);
  if (errors.length > 0) return { ok: false, errors };
  const baseline = side(inputs, assumptions, 'baseline', 1);
  const scenario = side(inputs, assumptions, 'scaled', inputs.multiplier);
  const ratios = {
    output_per_head: scenario.output_per_head_per_quarter / baseline.output_per_head_per_quarter,
    weighted_output_per_head: scenario.weighted_output_per_head_per_quarter / baseline.weighted_output_per_head_per_quarter,
  };
  const all = [...Object.values(baseline), ...Object.values(scenario), ...Object.values(ratios)];
  if (!all.every(Number.isFinite)) {
    return { ok: false, errors: [{ field: 'multiplier', message: 'inputs produce a value outside the representable range' }] };
  }
  return { ok: true, baseline, scenario, ratios };
}
