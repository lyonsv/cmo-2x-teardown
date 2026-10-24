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
  return errors;
}

function side(inputs, k, m) {
  const concepts = inputs.campaigns_per_year * inputs.concepts_per_campaign * Math.pow(m, k);
  const variants_per_concept = inputs.variants_per_concept * Math.pow(m, 1 - k);
  const variants_per_year = concepts * variants_per_concept;
  const output_per_head_per_quarter = variants_per_year / 4 / inputs.marketing_fte;
  return { concepts, variants_per_concept, variants_per_year, output_per_head_per_quarter };
}

export function compute(inputs, assumptions) {
  const errors = validate(inputs, assumptions);
  if (errors.length > 0) return { ok: false, errors };
  const k = assumptions.concept_growth_exponent;
  const baseline = side(inputs, k, 1);
  const scenario = side(inputs, k, inputs.multiplier);
  const ratios = {
    output_per_head: scenario.output_per_head_per_quarter / baseline.output_per_head_per_quarter,
  };
  const all = [...Object.values(baseline), ...Object.values(scenario), ...Object.values(ratios)];
  if (!all.every(Number.isFinite)) {
    return { ok: false, errors: [{ field: 'multiplier', message: 'inputs produce a value outside the representable range' }] };
  }
  return { ok: true, baseline, scenario, ratios };
}
