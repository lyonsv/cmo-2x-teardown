// Single source of numbers, grades, sources and assumptions (CRED-06).
// The page's data-fig spans, the register rows and compute() all read from here.

export const GRADES = ['Benchmark', 'Modelled', 'Speculative'];
export const FLAGS = ['vendor-claimed', 'company-reported'];
export const SCENARIO = { multiplier: 2 };

export const sources = {
  'gartner-2025-cmo-spend': {
    title: 'Gartner 2025 CMO Spend Survey Reveals Marketing Budgets Have Flatlined at 7.7% of Overall Company Revenue',
    publisher: 'Gartner, Inc.',
    published: '2025-05-12',
    accessed: '2026-10-24',
    url: 'https://www.gartner.com/en/newsroom/press-releases/2025-05-12-gartner-2025-cmo-spend-survey-reveals-marketing-budgets-have-flatlined-at-seven-percent-of-overall-company-revenue',
    bias: 'Analyst firm; self-reported survey of 402 CMOs in North America, the UK and Europe, mostly companies above $1B revenue',
    read_via: 'Business Wire reproduction of the Gartner release (gartner.com returns 403 to automation)',
  },
};

function a(id, label, kind, key, value, unit, display, basis) {
  return { id, label, kind, key, value, unit, display, grade: 'Modelled', flag: null, basis };
}

export const assumptions = {
  'asm-revenue': a('asm-revenue', 'Subject organisation revenue', 'context', null, 1000000000, 'USD', '~$1B',
    'A round figure for a generic enterprise; there is no published source for this organisation.'),
  'asm-marketing-budget': a('asm-marketing-budget', 'Marketing budget', 'context', null, 78000000, 'USD', '~$78M',
    'Revenue multiplied by the budget share below.'),
  'asm-budget-share': a('asm-budget-share', 'Marketing budget as a share of revenue', 'context', null, 7.8, '% of revenue', '7.8%',
    'Set equal to the Gartner 2026 average; the subject org is an average respondent, not a benchmark.'),
  'asm-marketing-fte': a('asm-marketing-fte', 'Marketing headcount', 'input', 'marketing_fte', 120, 'FTE', '~120',
    'A modelled team size for the subject organisation; there is no published source.'),
  'asm-campaigns': a('asm-campaigns', 'Campaigns per year', 'input', 'campaigns_per_year', 40, 'campaigns', '~40',
    'A modelled campaign cadence; there is no published source.'),
  'asm-concepts-per-campaign': a('asm-concepts-per-campaign', 'Unique concepts per campaign', 'input', 'concepts_per_campaign', 25, 'concepts', '25',
    'A modelled creative breadth per campaign; there is no published source.'),
  'asm-variants-per-concept': a('asm-variants-per-concept', 'Variants per concept', 'input', 'variants_per_concept', 40, 'variants', '40',
    'A modelled count of sizes, locales and channel cuts per concept; there is no published source.'),
  'asm-reviewer-fte': a('asm-reviewer-fte', 'Reviewer headcount', 'input', 'reviewer_fte', 12, 'FTE', '12',
    'A modelled review capacity; there is no published source.'),
  'asm-concept-growth': a('asm-concept-growth', 'Concept growth exponent', 'model', 'concept_growth_exponent', 0.25, 'exponent', '0.25',
    'Share of growth from new concepts in log terms; 0 means pure derivation.'),
};

export const claims = {
  'gartner-share-2025': {
    id: 'gartner-share-2025', value: 7.7, unit: '% of revenue', display: '7.7%',
    grade: 'Benchmark', flag: null, ref: 'src-gartner-2025-cmo-spend',
  },
  'output-per-head-base': {
    id: 'output-per-head-base', value: 83, unit: 'approved-live asset-variants per head per quarter', display: '83',
    grade: 'Modelled', flag: null, ref: 'asm-variants-per-concept',
    derived: 'baseline.output_per_head_per_quarter', decimals: 0,
  },
  'output-per-head-scaled': {
    id: 'output-per-head-scaled', value: 167, unit: 'approved-live asset-variants per head per quarter', display: '167',
    grade: 'Modelled', flag: null, ref: 'asm-variants-per-concept',
    derived: 'scenario.output_per_head_per_quarter', decimals: 0,
  },
};

export function defaultInputs() {
  const out = { multiplier: SCENARIO.multiplier };
  for (const e of Object.values(assumptions)) if (e.kind === 'input') out[e.key] = e.value;
  return out;
}

export function defaultAssumptions() {
  const out = {};
  for (const e of Object.values(assumptions)) if (e.kind === 'model') out[e.key] = e.value;
  return out;
}
