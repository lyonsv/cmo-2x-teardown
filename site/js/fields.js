// Calculator field registry. Strings only: no values live here (defaults come
// from data.js via model.js defaultValues). DOM-free, no imports.

const WHOLE = 'a whole number of 1 or more';
const ABOVE0 = 'a number above 0';

function f(key, label, unit, kind, group, asm, zeroOk, rule, example, hintFormat) {
  return hintFormat ? { key, label, unit, kind, group, asm, zeroOk, rule, example, hintFormat } : { key, label, unit, kind, group, asm, zeroOk, rule, example };
}

export const FIELDS = [
  f('campaigns', 'Campaigns per year', 'campaigns', 'int', 'volume', 'asm-campaigns', false, WHOLE, '40'),
  f('concepts', 'Concepts per campaign', 'concepts', 'int', 'volume', 'asm-concepts-per-campaign', false, WHOLE, '25'),
  f('markets', 'Markets per campaign', 'markets', 'int', 'volume', 'asm-markets', false, WHOLE, '5'),
  f('marketers', 'Marketing FTE', 'FTE', 'num', 'people', 'asm-marketing-fte', false, ABOVE0, '120'),
  f('reviewers', 'Reviewer FTE', 'FTE', 'num', 'people', 'asm-reviewer-fte', false, ABOVE0, '12'),
  f('minutes', 'Minutes per review', 'minutes', 'num', 'people', 'asm-review-minutes', false, ABOVE0, '12'),
  f('vcost', 'Variant generation cost at 2x', '$ per variant', 'usd', 'cost', 'asm-variant-cost', false, ABOVE0, '0.80', 'usd2'),
  f('mconcept', 'Agency fee per master concept', '$ per concept', 'usd', 'cost', 'asm-master-concept-cost', false, ABOVE0, '1,200', 'usd0'),
  f('yield', 'Approval yield', '%', 'pct', 'cost', 'asm-approval-yield', false, 'a percentage above 0 and up to 100', '95'),
  f('rework', 'Rework rate', '%', 'pct', 'cost', 'asm-rework-rate', true, 'a percentage from 0 to 100', '15'),
  f('auto1', 'Auto-approval share today', '%', 'pct', 'automation', 'asm-auto-approval', true, 'a percentage from 0 to 100', '20'),
  f('auto2', 'Auto-approval share at 2x', '%', 'pct', 'automation', 'asm-auto-approval', true, 'a percentage from 0 to 100', '60'),
];

export const ROUTES = ['both', 'campaigns', 'markets'];

export const SCENARIOS = ['a', 'b', 'c'];

export const COMPUTE_FIELD_TO_KEY = {
  campaigns_per_year: 'campaigns',
  concepts_per_campaign: 'concepts',
  markets_per_campaign: 'markets',
  reviewer_fte: 'reviewers',
  review_minutes_per_variant: 'minutes',
  variant_cost: 'vcost',
  master_concept_cost: 'mconcept',
  approval_yield: 'yield',
  rework_rate: 'rework',
};
