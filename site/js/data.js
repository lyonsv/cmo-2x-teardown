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

export function formatValue(value, format) {
  if (format === 'int') return Math.round(value).toLocaleString('en-GB', { maximumFractionDigits: 0 });
  if (format === 'x1') return `${value.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}x`;
  throw new Error(`unknown format ${format}`);
}

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

assumptions['asm-tier-mix'] = {
  ...a('asm-tier-mix', 'Review tier mix', 'model', 'tier_mix', { baseline: [0.40, 0.35, 0.20, 0.05], scaled: [0.55, 0.30, 0.12, 0.03] }, 'share of variants',
    'T0–T3: 40/35/20/5% today; 55/30/12/3% at 2x', 'Illustrative tier shares; no published benchmark exists'),
};
assumptions['asm-tier-weights'] = a('asm-tier-weights', 'Relative review effort per tier', 'model', 'tier_weights', [1, 2, 4, 8], 'relative effort', '1 / 2 / 4 / 8',
  'Relative review effort per tier; used only for the weighted sensitivity because weights are arbitrary and gameable');
assumptions['asm-approval-yield'] = a('asm-approval-yield', 'Approval yield', 'model', 'approval_yield', 0.95, 'share of derived variants', '95%',
  'Share of derived variants that clear the gate after the bounded fix loop; rejected variants still cost generation and review. No published benchmark.');

function lever(n, label, grade, display) {
  const id = `asm-lever-0${n}-evidence`;
  assumptions[id] = { id, label, kind: 'evidence', key: null, value: null, unit: null, display, grade, flag: null,
    basis: display };
}
lever(1, 'Lever 1 evidence: content generation', 'Modelled', 'Company-reported anchors only, plus one controlled click-through study; the rest is modelled.');
lever(2, 'Lever 2 evidence: localisation', 'Modelled', 'Vendor case studies and a wide academic range; per-word rates are a gap.');
lever(3, 'Lever 3 evidence: experimentation', 'Modelled', 'Published win-rate anchors exist but are vendor-biased; verified in a later section.');
lever(4, 'Lever 4 evidence: insight and reporting', 'Modelled', 'Almost entirely an evidence gap; kept brief and modelled.');
lever(5, 'Lever 5 evidence: ops', 'Speculative', 'No data beyond the statute; a judgement.');
lever(6, 'Lever 6 evidence: answer-engine visibility', 'Speculative', 'Thin, vendor-only and panel-based; outcomes are speculative.');

export const claims = {
  'gartner-share-2025': {
    id: 'gartner-share-2025', value: 7.7, unit: '% of revenue', display: '7.7%',
    grade: 'Benchmark', flag: null, ref: 'src-gartner-2025-cmo-spend',
  },
  'output-per-head-base': {
    id: 'output-per-head-base', value: 83, unit: 'approved-live asset-variants per head per quarter', display: '83',
    grade: 'Modelled', flag: null, ref: 'asm-variants-per-concept',
    derived: 'baseline.output_per_head_per_quarter', decimals: 0, format: 'int',
  },
  'output-per-head-scaled': {
    id: 'output-per-head-scaled', value: 167, unit: 'approved-live asset-variants per head per quarter', display: '167',
    grade: 'Modelled', flag: null, ref: 'asm-variants-per-concept',
    derived: 'scenario.output_per_head_per_quarter', decimals: 0, format: 'int',
  },
  ...Object.fromEntries([
    ['concepts-base', 1000, 'baseline.concepts', 'asm-concepts-per-campaign', 'unique concepts a year'],
    ['concepts-scaled', 1189, 'scenario.concepts', 'asm-concepts-per-campaign', 'unique concepts a year'],
    ['vpc-base', 40, 'baseline.variants_per_concept', 'asm-variants-per-concept', 'variants per concept'],
    ['vpc-scaled', 67, 'scenario.variants_per_concept', 'asm-variants-per-concept', 'variants per concept'],
  ].map(([id, value, derived, ref, unit]) => [id, {
    id, value, unit, display: formatValue(value, 'int'), grade: 'Modelled', flag: null, ref, derived, decimals: 0, format: 'int',
  }])),
  'weighted-ratio': {
    id: 'weighted-ratio', value: 1.6, unit: 'x, tier-weighted sensitivity', display: '1.6x', grade: 'Modelled', flag: null,
    ref: 'asm-tier-weights', derived: 'ratios.weighted_output_per_head', decimals: 1, format: 'x1',
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
