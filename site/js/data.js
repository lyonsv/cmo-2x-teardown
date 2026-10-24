// Single source of numbers, grades, sources and assumptions (CRED-06).
// The page's data-fig spans, the register rows and compute() all read from here.
import { variantMatrix } from './calc.js';
import { formatValue } from './format.js';
import { present, defaultValues, RESULT_ROWS } from './model.js';

export const GRADES = ['Benchmark', 'Modelled', 'Speculative'];
export const FLAGS = ['vendor-claimed', 'company-reported'];
export const SCENARIO = { multiplier: 2 };

// Each source carries its own grade and flag (code review WR-07): the register's
// Grade and Flag cells and every chip that links to a source are checked against
// these fields. Law-firm commentary and the author's own secondary reading are a
// Modelled basis, not a Benchmark.
export const sources = {
  'gartner-2025-cmo-spend': {
    title: 'Gartner 2025 CMO Spend Survey Reveals Marketing Budgets Have Flatlined at 7.7% of Overall Company Revenue',
    publisher: 'Gartner, Inc.',
    published: '2025-05-12',
    accessed: '2026-10-24',
    url: 'https://www.gartner.com/en/newsroom/press-releases/2025-05-12-gartner-2025-cmo-spend-survey-reveals-marketing-budgets-have-flatlined-at-seven-percent-of-overall-company-revenue',
    bias: 'Analyst firm; self-reported survey of 402 CMOs in North America, the UK and Europe, mostly companies above $1B revenue',
    read_via: 'Business Wire reproduction of the Gartner release (gartner.com returns 403 to automation)',
    grade: 'Benchmark',
    flag: null,
  },
  'gartner-2026-cmo-spend': {
    title: 'Gartner 2026 CMO Spend Survey Finds CMOs Allocate 15.3% of Marketing Budgets to AI, But Only 30% Are Ready to Scale AI Capabilities',
    publisher: 'Gartner, Inc.',
    published: '2026-05-11',
    accessed: '2026-10-24',
    url: 'https://www.gartner.com/en/newsroom/press-releases/2026-05-11-gartner-2026-cmo-spend-survey-finds-cmos-allocate-15-point-3-percent-of-marketing-budgets-to-ai-but-only-30-percent-are-ready-to-scale-ai-capabilities',
    bias: 'Analyst firm; self-reported survey of 401 CMOs in North America, the UK and Europe, mostly companies above $1B revenue',
    read_via: 'Gartner newsroom page, confirmed in a browser by the author',
    grade: 'Benchmark',
    flag: null,
  },
  'nyu-emory-ai-ads-2025': {
    title: 'The Impact of Visual Generative AI on Advertising Effectiveness',
    publisher: 'SSRN (working paper); authors at NYU Stern and Emory',
    published: '2025-11-06',
    accessed: '2026-10-24',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5638311',
    bias: 'Academic working paper; peer-review status not checked; one author is a consultant at an economics consultancy that republished it',
    read_via: 'SSRN page, confirmed in a browser by the author (SSRN returns 403 to automation); date from the NYU Stern research highlight of 2025-11-06',
    grade: 'Benchmark',
    flag: null,
  },
  'usco-copyright-ai-part2': {
    title: 'Copyright and Artificial Intelligence, Part 2: Copyrightability',
    publisher: 'U.S. Copyright Office',
    published: '2025-01-29',
    accessed: '2026-10-24',
    url: 'https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf',
    bias: 'Government agency report; the Office\'s view of US law, not a court ruling',
    read_via: 'Report PDF; executive summary read directly',
    grade: 'Benchmark',
    flag: null,
  },
  'getty-v-stability-uk': {
    title: 'Getty Images v Stability AI [2025] EWHC 2863 (Ch): judgment dated 2025-11-04 and permission to appeal',
    publisher: 'Taylor Wessing (law-firm commentary)',
    published: '2026-01',
    accessed: '2026-10-24',
    url: 'https://www.taylorwessing.com/en/insights-and-events/insights/2026/01/next-steps-for-getty-v-stability-why-has-permission-to-appeal-been-granted',
    bias: 'Law-firm commentary on a UK High Court judgment, not the judgment itself; appeal status is time-sensitive',
    read_via: 'Not read: the page returned 403 to automation on 2026-10-24 and the article was not opened in a browser; publication month taken from the URL. The facts on this page were checked against the AI Lawsuit Tracker case page instead (see its source row)',
    grade: 'Modelled',
    flag: null,
  },
  'ailawsuittracker-getty-uk': {
    title: 'Getty Images v. Stability AI (UK), [2025] EWHC 2863 (Ch): case page',
    publisher: 'AI Lawsuit Tracker (ailawsuittracker.com)',
    published: '2026-10-11',
    accessed: '2026-10-24',
    url: 'https://ailawsuittracker.com/cases/getty-images-v-stability-ai-uk-2025-ewhc-2863-ch/',
    bias: 'Third-party case tracker summarising the court record, not the judgment itself; legal status is time-sensitive',
    read_via: 'Case page read on 2026-10-24 (reviewed against the court record 2026-05-25, page text reviewed 2026-10-11, footer updated 2026-10-19). It records the judgment of 2025-11-04, permission for Getty to appeal the secondary copyright ruling granted 2025-12-16 with the appeal pending, and Stability refused permission to appeal the trade mark findings. A search on 2026-10-24 found no Court of Appeal hearing or judgment',
    grade: 'Modelled',
    flag: null,
  },
  'intercom-2x-teardown': {
    title: 'Intercom / Fin 2x — Teardown',
    publisher: 'Vincent Lyons (author of this page)',
    published: '2026-08-25',
    accessed: '2026-10-24',
    url: 'https://lyonsv.github.io/intercom-2x-teardown/',
    bias: "The author's own secondary reading of company-presented webinar screenshots dated 2026-05-19; every figure is company-reported and concerns an engineering organisation reviewing code, not marketing assets",
    read_via: 'Page read in full and key screenshots viewed, 2026-10-24',
    grade: 'Modelled',
    flag: 'company-reported',
  },
  'laubli-2019': {
    title: 'Post-editing Productivity with Neural Machine Translation: An Empirical Assessment of Speed and Quality in the Banking and Finance Domain',
    publisher: 'arXiv (Läubli et al.)',
    published: '2019-06-04',
    accessed: '2026-10-24',
    url: 'https://arxiv.org/abs/1906.01685',
    bias: 'Academic study; pre-LLM neural MT, one banking and finance domain, few translators; shows variance, not a rate',
    read_via: 'arXiv abstract page read 2026-10-24',
    grade: 'Modelled',
    flag: null,
  },
  'translation-vendor-case': {
    title: 'How a Fortune 500 enterprise translated millions of words at scale',
    publisher: 'Smartling (translation-technology vendor)',
    published: '2025-03-10',
    accessed: '2026-10-24',
    url: 'https://smartling.com/resources/case-study/technology-customer-case-study',
    bias: 'Vendor-selected anonymised customer case study; the savings and speed figures are the vendor\'s own',
    read_via: 'Case-study page read 2026-10-24',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'experimentation-vendor-playbook': {
    title: 'Top 10 takeaways from running 173,000 experiments',
    publisher: 'Optimizely (experimentation-platform vendor)',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.optimizely.com/insights/top-10-takeaways-from-the-experimentation-playbook/',
    bias: 'Experimentation-platform vendor; self-selected customers; commercial interest in test volume',
    read_via: 'Page read 2026-10-24; the 127,000 true experiments and the win definition (primary metric moves the winning way at the vendor\'s significance threshold) come from the vendor\'s linked 173,000-experiments guide, https://www.optimizely.com/field-notes/guides/173000-experiments',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'kohavi-2013': {
    title: 'Online Controlled Experiments at Large Scale',
    publisher: 'KDD 2013 (Kohavi, Deng, Frasca, Walker, Xu, Pohlmann; Microsoft)',
    published: '2013-08-11',
    accessed: '2026-10-24',
    url: 'https://exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf',
    bias: 'Peer-reviewed paper on company-internal data; product ideas, not marketing; the second figure is a second-hand quote',
    read_via: 'Paper PDF fetched 2026-10-24 (Tenet 3); publication date taken from the KDD 2013 conference start, not re-confirmed',
    grade: 'Modelled',
    flag: 'company-reported',
  },
  'mmm-geox': {
    title: 'Meridian: GeoX geo experiments for MMM calibration',
    publisher: 'Google (open-source marketing-mix framework documentation)',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://developers.google.com/meridian/geox',
    bias: 'Vendor documentation of its own open-source tool; describes a method, reports no outcomes',
    read_via: 'Search summary and the page banner read 2026-10-24; the calibration guide was not opened',
    grade: 'Modelled',
    flag: null,
  },
  'haynes-2026': {
    title: 'GEO is a distraction',
    publisher: 'Marie Haynes Consulting (SEO consultancy)',
    published: '2026-10-21',
    accessed: '2026-10-24',
    url: 'https://www.mariehaynes.com/geo-is-a-distraction/',
    bias: 'Non-random sample of 100 sites; author sells SEO services',
    read_via: 'Page read 2026-10-24; only figures, dates and authorship recorded',
    grade: 'Modelled',
    flag: null,
  },
  'seoworks-2026': {
    title: 'AI referral traffic benchmark',
    publisher: 'The SEO Works (UK agency selling GEO services)',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.seoworks.co.uk/downloads/ai-referral-traffic-benchmark/',
    bias: 'Agency sample of 95 sites; sell-side author reporting a low number',
    read_via: 'Page read 2026-10-24; the data run to August 2026; only figures, dates and authorship recorded',
    grade: 'Modelled',
    flag: null,
  },
  'indig-2026': {
    title: 'Does AI drive more direct traffic?',
    publisher: 'Growth Memo (Kevin Indig)',
    published: '2026-10-19',
    accessed: '2026-10-24',
    url: 'https://www.growth-memo.com/p/does-ai-drive-more-direct-traffic',
    bias: 'Small B2B-skewed sample of 12 sites',
    read_via: 'Page read 2026-10-24; only figures, dates and authorship recorded',
    grade: 'Modelled',
    flag: null,
  },
  'aggarwal-geo-2024': {
    title: 'GEO: Generative Engine Optimization',
    publisher: 'KDD 2024 (Aggarwal et al.)',
    published: '2024-08-25',
    accessed: '2026-10-24',
    url: 'https://arxiv.org/abs/2311.09735',
    bias: 'Author-built benchmark measuring citation visibility in model answers, not sessions or pipeline',
    read_via: 'arXiv abstract page read 2026-10-24; the publication date is the KDD 2024 conference start, not re-confirmed',
    grade: 'Modelled',
    flag: null,
  },
  'cornell-17usc504': {
    title: '17 U.S. Code section 504: Remedies for infringement: Damages and profits',
    publisher: 'Legal Information Institute, Cornell Law School (US Code text)',
    published: 'undated',
    accessed: '2026-10-24',
    url: 'https://www.law.cornell.edu/uscode/text/17/504',
    bias: 'Primary statute text; how courts apply it varies; not legal advice',
    read_via: 'Statute page read 2026-10-24; subsection (c) quoted for the per-work ranges and the rule that all the parts of a derivative work constitute one work',
    grade: 'Benchmark',
    flag: null,
  },
  'cornell-17usc412': {
    title: '17 U.S. Code section 412: Registration as prerequisite to certain remedies for infringement',
    publisher: 'Legal Information Institute, Cornell Law School (US Code text)',
    published: 'undated',
    accessed: '2026-10-24',
    url: 'https://www.law.cornell.edu/uscode/text/17/412',
    bias: 'Primary statute text; how courts apply it varies; not legal advice',
    read_via: 'Statute page read 2026-10-24; the registration precondition for statutory damages',
    grade: 'Benchmark',
    flag: null,
  },
};

export { formatValue };

function a(id, label, kind, key, value, unit, display, basis) {
  return { id, label, kind, key, value, unit, display, grade: 'Modelled', flag: null, basis };
}

export const assumptions = {
  'asm-revenue': a('asm-revenue', 'Subject organisation revenue', 'context', null, 1000000000, 'USD', '~$1B',
    'A round figure for a generic enterprise; there is no published source for this organisation.'),
  'asm-marketing-budget': a('asm-marketing-budget', 'Marketing budget', 'input', 'marketing_budget', 78000000, 'USD', '~$78M',
    'Revenue multiplied by the budget share below.'),
  'asm-budget-share': a('asm-budget-share', 'Marketing budget as a share of revenue', 'context', null, 0.078, 'share of revenue', '7.8%',
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

function m(id, label, key, value, unit, display, basis) {
  assumptions[id] = a(id, label, 'model', key, value, unit, display, basis);
}
m('asm-auto-approval', 'Auto-approval share', 'auto_approval_share', { baseline: 0.20, scaled: 0.60 }, 'share of variants', '20% today, 60% at 2x',
  'Share of variants cleared by the gate without a full human review; a sampled or escalated share of them is still seen by a person. The assumption the whole cost claim leans on; no published benchmark.');
m('asm-sampling-rate', 'Sampling audit rate', 'sampling_rate', 0.05, 'share of auto-approved', '5%',
  'Share of auto-approved variants audited by a human sample; no published benchmark.');
m('asm-escalation-rate', 'Escalation rate', 'escalation_rate', 0.05, 'share of auto-approved', '5%',
  'Share of auto-approved variants escalated to a human by the gate; no published benchmark.');
m('asm-review-minutes', 'Review time per reviewed variant', 'review_minutes_per_variant', 12, 'minutes', '12 min',
  'Human review time for each variant a person touches; no published benchmark.');
m('asm-rework-rate', 'Rework rate', 'rework_rate', 0.15, 'share of variants', '15%',
  'Share of variants needing one regenerate-and-re-review loop; no published benchmark.');
m('asm-reviewer-hours', 'Review hours per reviewer per year', 'reviewer_hours_per_fte_year', 1200, 'hours', '1,200',
  'A fatigue cap on productive review time, not the 2,080 contract hours; no published benchmark.');
m('asm-reviewer-rate', 'Reviewer cost per hour', 'reviewer_rate_per_hour', 100, 'USD per hour', '$100',
  'Fully loaded cost of a review hour; no published benchmark.');
m('asm-master-concept-cost', 'Cost per master concept', 'master_concept_cost', 1200, 'USD per concept', '$1,200',
  'Human-directed creative for each unique concept; no published benchmark.');
m('asm-variant-cost', 'Cost per derived variant', 'variant_cost', { baseline: 4.00, scaled: 0.80 }, 'USD per variant', '$4.00 today, $0.80 at 2x',
  'Manual or agency derivation today versus AI-derived at 2x; the most contestable cost driver, no published benchmark.');
m('asm-rights-per-concept', 'Rights and licensing per concept', 'rights_cost_per_concept', 250, 'USD per concept', '$250',
  'Rights attach to masters, not derivatives; no published benchmark.');
m('asm-storage-per-variant', 'Storage per approved asset per year', 'storage_cost_per_variant', 0.02, 'USD per variant', '$0.02',
  'Only approved, live assets are stored; no published benchmark.');
m('asm-tooling', 'Annual tooling cost', 'tooling_cost_annual', { baseline: 150000, scaled: 600000 }, 'USD per year', '$150k today, $600k at 2x',
  'Platform, model commitments and eval-harness upkeep, as a fixed annual cost; no published benchmark.');
m('asm-ai-share-variant', 'AI share of variant cost', 'ai_share_of_variant_cost', { baseline: 0.05, scaled: 0.60 }, 'share of variant cost', '5% today, 60% at 2x',
  'Share of the cost of a derived variant that is AI inference; no published benchmark.');
m('asm-ai-share-tooling', 'AI share of tooling cost', 'ai_share_of_tooling', { baseline: 0.20, scaled: 0.50 }, 'share of tooling cost', '20% today, 50% at 2x',
  'Share of annual tooling cost that is AI services; no published benchmark.');
m('asm-build-days', 'Brief-to-ready build time', 'build_days', { baseline: 8, scaled: 3 }, 'days', '8 days today, 3 at 2x',
  'Time to build a campaign from brief to ready for review; no published benchmark.');
m('asm-review-service-days', 'Review turnaround per touch', 'review_service_days', 1.5, 'days', '1.5 days',
  'Turnaround for one review touch before queueing; no published benchmark.');
m('asm-target-utilisation', 'Target reviewer utilisation', 'target_utilisation', 0.85, 'share of capacity', '85%',
  'Utilisation above which queues grow quickly; used for the break-even auto-approval share. No published benchmark.');

assumptions['asm-reallocation'] = a('asm-reallocation', 'Funding for the production cost rise', 'context', null, null, null,
  'reallocated from other marketing lines, chiefly agency and production fees',
  'The page holds the total marketing budget flat. The rise in production-attributable cost is assumed to be funded by moving money from other marketing lines, chiefly the agency and production fees that AI-derived variants replace. No published benchmark; if those lines cannot shrink, the budget is not flat and the claim must be restated.');

function lever(n, label, grade, display, basis) {
  const id = `asm-lever-0${n}-evidence`;
  assumptions[id] = { id, label, kind: 'evidence', key: null, value: null, unit: null, display, grade, flag: null,
    basis };
}
lever(1, 'Lever 1 evidence: content generation', 'Modelled', 'Company-reported anchors', 'Company-reported anchors only, plus one controlled click-through study; the rest is modelled.');
lever(2, 'Lever 2 evidence: localisation', 'Modelled', 'Vendor case studies', 'Vendor case studies and a wide academic range. Post-editing speed-ups from 9 to 60 percent in one pre-LLM study and one vendor case study; per-word rates are a gap.');
lever(3, 'Lever 3 evidence: experimentation', 'Modelled', 'Vendor-biased anchors', 'Published win-rate anchors exist but are vendor-biased; verified in a later section.');
lever(4, 'Lever 4 evidence: insight and reporting', 'Modelled', 'An evidence gap', 'Almost entirely an evidence gap; kept brief and modelled.');
lever(5, 'Lever 5 evidence: ops', 'Speculative', 'A judgement', 'No data beyond the statute; a judgement.');
lever(6, 'Lever 6 evidence: answer-engine visibility', 'Speculative', 'Thin, vendor-only data', 'Thin, vendor-only and panel-based; outcomes are speculative. Independent traffic studies from October 2026 find AI-assistant referrals a small share of search traffic; visibility has not been shown to move pipeline.');

assumptions['asm-tests-per-quarter'] = a('asm-tests-per-quarter', 'Experiments run per team per quarter', 'context', null, 20, 'experiments', '20',
  'An illustrative test cadence for one team; replace with your own. No published benchmark.');

assumptions['asm-imagery-routes'] = { id: 'asm-imagery-routes', label: 'Imagery routes: rights, cost and speed', kind: 'evidence', key: null, value: null, unit: null,
  display: 'Generic route comparison', grade: 'Modelled', flag: null,
  basis: 'Generic comparison of retrieving approved, licensing and generating imagery; actual terms depend on each licence, model provider and jurisdiction. The copyrightability entry for generated imagery follows the US Copyright Office report listed in the source register, which is the Office\'s view of US law, not a ruling; the entries for the other two routes are generic. Not legal advice.' };
assumptions['asm-imagery-indemnity'] = { id: 'asm-imagery-indemnity', label: 'Imagery routes: indemnity', kind: 'evidence', key: null, value: null, unit: null,
  display: 'Typical contract terms', grade: 'Modelled', flag: null,
  basis: 'Generic summary of typical indemnity terms on every route. Licensed stock: indemnity is commonly capped, with higher caps on paid or extended licence tiers, and excludes modified, misused or out-of-scope use. Generated: law-firm commentary describes AI-provider indemnity as often limited to paid tiers, conditional on using the provider safeguards, excluding output the customer knew or should have known infringed and often excluding modified output; caps can apply. Retrieved: an approved asset inherits whatever indemnity its original licence gave. Licences and provider contracts vary. Not legal advice.' };

export const variantMatrixDefaults = {
  concepts: 4,
  factors: [
    { id: 'sizes', label: 'Sizes', count: 10, applies: 1 },
    { id: 'channels', label: 'Channels', count: 5, applies: 0.75 },
    { id: 'locales', label: 'Locales', count: 6, applies: 0.4 },
    { id: 'audiences', label: 'Audiences', count: 5, applies: 0.75 },
    { id: 'tests', label: 'Tests', count: 4, applies: 0.5 },
    { id: 'feeds', label: 'Feed items', count: 4, applies: 0.5 },
  ],
};

assumptions['asm-matrix-concepts'] = a('asm-matrix-concepts', 'Master concepts in the worked campaign', 'matrix', null, 4, 'concepts', '4',
  'Four human-directed master concepts for one flagship campaign; illustrative, no published benchmark.');
{
  const wording = {
    sizes: ['10 sizes, all items', 'Ten sizes, each applied to every item, so the count and the fraction both multiply the whole set; illustrative, no published benchmark.'],
    channels: ['5 channels, 75% of items', 'Five channels, with 75% of the items rendered for all five channels and the rest for one; illustrative, no published benchmark.'],
    locales: ['6 locales, 40% of items', 'Six locales, with 40% of the items localised into all of them; illustrative, no published benchmark.'],
    audiences: ['5 audiences, 75% of items', 'Five audience segments, with 75% of the items tailored to each; illustrative, no published benchmark.'],
    tests: ['4 tests, 50% of items', 'Four test treatments, with 50% of the items carrying them; illustrative, no published benchmark.'],
    feeds: ['4 feed items, 50% of items', 'Four feed-rendered forms, with 50% of the items rendered into a feed; illustrative, no published benchmark.'],
  };
  for (const f of variantMatrixDefaults.factors) {
    const id = `asm-matrix-${f.id}`;
    assumptions[id] = a(id, `Worked campaign: ${f.label}`, 'matrix', null, { count: f.count, applies: f.applies }, 'factor',
      wording[f.id][0], wording[f.id][1]);
  }
}
assumptions['asm-matrix-independence'] = a('asm-matrix-independence', 'Independence of matrix factors', 'matrix', null, null, null,
  'Factors treated as independent; an upper-bound sketch',
  'Each factor expands only the stated share of the variants that exist after the previous factor, and factors are treated as independent for illustration. Real campaigns have correlated factors: sizes follow channel placement specs, so not every channel takes every size. The total is therefore an upper-bound sketch, not a count of distinct valid variants; the applies fractions stand in only roughly for those exclusions. With fractional shares the counts are expected counts, rounded only for display.');

// Shares and percentage changes are stored as fractions throughout (code review
// IN-08), so 0.19 displays as 19% via its format.
export const claims = {
  'gartner-share-2025': {
    id: 'gartner-share-2025', value: 0.077, unit: 'share of revenue', display: '7.7%', format: 'pct1',
    grade: 'Benchmark', flag: null, ref: 'src-gartner-2025-cmo-spend',
  },
  'gartner-share-2026': {
    id: 'gartner-share-2026', value: 0.078, unit: 'share of revenue', display: '7.8%', format: 'pct1',
    grade: 'Benchmark', flag: null, ref: 'src-gartner-2026-cmo-spend',
  },
  'gartner-sample-2025': {
    id: 'gartner-sample-2025', value: 402, unit: 'respondents', display: '402',
    grade: 'Benchmark', flag: null, ref: 'src-gartner-2025-cmo-spend',
  },
  'nyu-ctr-lift': {
    id: 'nyu-ctr-lift', value: 0.19, unit: 'click-through lift as a fraction, fully AI-created ads (up to)', display: '19%', format: 'pct0',
    grade: 'Benchmark', flag: null, ref: 'src-nyu-emory-ai-ads-2025',
  },
  'nyu-disclosure-drop': {
    id: 'nyu-disclosure-drop', value: -0.315, unit: 'change in click-through as a fraction when AI involvement is disclosed', display: '\u221231.5%', format: 'pct1',
    grade: 'Benchmark', flag: null, ref: 'src-nyu-emory-ai-ads-2025',
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
  ...Object.fromEntries([
    ['cpa-base', 64.71, 'baseline.cost_per_asset', 'asm-variant-cost', 'USD per approved-live asset', 2, 'usd2'],
    ['cpa-scaled', 41.18, 'scenario.cost_per_asset', 'asm-variant-cost', 'USD per approved-live asset', 2, 'usd2'],
    ['cpa-change', -0.36, 'ratios.cost_per_asset_change', 'asm-variant-cost', 'change in cost per approved-live asset', 2, 'pctchg0'],
    ['total-cost-base', 2588589, 'baseline.cost.total', 'asm-variant-cost', 'USD per year', 0, 'usdm2'],
    ['total-cost-scaled', 3294371, 'scenario.cost.total', 'asm-variant-cost', 'USD per year', 0, 'usdm2'],
    ['total-cost-delta', 705782, 'deltas.total_cost', 'asm-variant-cost', 'USD per year, 2x minus baseline', 0, 'usdm2'],
    ['total-cost-change', 0.27, 'ratios.total_cost_change', 'asm-variant-cost', 'change in production-attributable cost', 2, 'pctchg0'],
    ['budget-share-delta', 0.009, 'deltas.production_share_of_budget', 'asm-marketing-budget', 'percentage points of marketing budget', 3, 'pts1'],
    ['budget-share-base', 0.033, 'baseline.production_share_of_budget', 'asm-marketing-budget', 'share of marketing budget', 3, 'pct1'],
    ['budget-share-scaled', 0.042, 'scenario.production_share_of_budget', 'asm-marketing-budget', 'share of marketing budget', 3, 'pct1'],
    ['ai-spend-base', 38421, 'baseline.ai_spend', 'asm-ai-share-tooling', 'USD per year', 0, 'usd0'],
    ['ai-spend-scaled', 340421, 'scenario.ai_spend', 'asm-ai-share-tooling', 'USD per year', 0, 'usd0'],
    ['ai-spend-ratio', 8.9, 'ratios.ai_spend', 'asm-ai-share-tooling', 'x', 1, 'x1'],
    ['break-even-auto-approval', 0.41, 'break_even_auto_approval.value', 'asm-auto-approval', 'minimum auto-approval share at flat reviewers', 2, 'pct0'],
    ['human-touch-share-scaled', 0.46, 'scenario.human_touch_share', 'asm-auto-approval', 'share of derived variants seen by a person at 2x (full review, sampling or escalation)', 2, 'pct0'],
    ['capacity-auto-approval', 0.29, 'capacity_auto_approval.value', 'asm-auto-approval', 'auto-approval share below which review capacity is exceeded', 2, 'pct0'],
  ].map(([id, value, derived, ref, unit, decimals, format]) => [id, {
    id, value, unit, display: formatValue(value, format), grade: 'Modelled', flag: null, ref, derived, decimals, format,
  }])),
  ...Object.fromEntries(['base', 'scaled'].flatMap((side) => [
    ['generation', 'asm-variant-cost', { base: 34.21, scaled: 18.68 }],
    ['review', 'asm-review-minutes', { base: 17.26, scaled: 9.68 }],
    ['rework', 'asm-rework-rate', { base: 3.22, scaled: 1.58 }],
    ['tooling', 'asm-tooling', { base: 3.75, scaled: 7.5 }],
    ['rights', 'asm-rights-per-concept', { base: 6.25, scaled: 3.72 }],
    ['storage', 'asm-storage-per-variant', { base: 0.02, scaled: 0.02 }],
  ].map(([comp, ref, vals]) => {
    const id = `cpa-${comp}-${side}`;
    return [id, {
      id, value: vals[side], unit: `USD per approved-live asset, ${comp}`, display: formatValue(vals[side], 'usd2'),
      grade: 'Modelled', flag: null, ref,
      derived: `${side === 'base' ? 'baseline' : 'scenario'}.cost_per_asset_by_component.${comp}`, decimals: 2, format: 'usd2',
    }];
  }))),
  'mt-speed-lo': {
    id: 'mt-speed-lo', value: 0.0926, unit: 'post-editing time saving, low end, one pre-LLM study', display: '9.26%',
    grade: 'Modelled', flag: null, ref: 'src-laubli-2019',
  },
  'mt-speed-hi': {
    id: 'mt-speed-hi', value: 0.5974, unit: 'post-editing time saving, high end, one pre-LLM study', display: '59.74%',
    grade: 'Modelled', flag: null, ref: 'src-laubli-2019',
  },
  'loc-case-saving': {
    id: 'loc-case-saving', value: 3400000, unit: 'USD translation cost saved, one vendor case study', display: '$3.4M',
    grade: 'Modelled', flag: 'vendor-claimed', ref: 'src-translation-vendor-case',
  },
  'loc-case-faster': {
    id: 'loc-case-faster', value: 0.5, unit: 'share faster to market, one vendor case study', display: '50%', format: 'pct0',
    grade: 'Modelled', flag: 'vendor-claimed', ref: 'src-translation-vendor-case',
  },
  'winrate-vendor': {
    id: 'winrate-vendor', value: 0.12, unit: 'share of experiments that win, experimentation-platform vendor dataset', display: '12%', format: 'pct0',
    grade: 'Modelled', flag: 'vendor-claimed', ref: 'src-experimentation-vendor-playbook',
  },
  'winrate-vendor-n': {
    id: 'winrate-vendor-n', value: 127000, unit: 'true experiments in the vendor dataset', display: '127,000',
    grade: 'Modelled', flag: 'vendor-claimed', ref: 'src-experimentation-vendor-playbook',
  },
  'winrate-paper': {
    id: 'winrate-paper', value: 0.33, unit: 'share of ideas that improved the metric they were designed to improve, one large software company', display: '33%', format: 'pct0',
    grade: 'Modelled', flag: 'company-reported', ref: 'src-kohavi-2013',
  },
  'winrate-second-hand': {
    id: 'winrate-second-hand', value: 0.10, unit: 'share of experiments that led to a business change, second company quoted second-hand', display: '10%', format: 'pct0',
    grade: 'Modelled', flag: 'company-reported', ref: 'src-kohavi-2013',
  },
  'tests-winners-lo': {
    id: 'tests-winners-lo', value: Math.round(20 * 0.10), unit: 'winners a quarter at the lowest reported rate', display: String(Math.round(20 * 0.10)),
    grade: 'Modelled', flag: null, ref: 'asm-tests-per-quarter',
  },
  'tests-winners-hi': {
    id: 'tests-winners-hi', value: Math.round(20 * 0.33), unit: 'winners a quarter at the highest reported rate', display: String(Math.round(20 * 0.33)),
    grade: 'Modelled', flag: null, ref: 'asm-tests-per-quarter',
  },
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

{
  const r = variantMatrix(variantMatrixDefaults.concepts, variantMatrixDefaults.factors);
  const add = (id, value, unit, format, ref, row, field) => {
    claims[id] = { id, value, unit, display: formatValue(value, format), grade: 'Modelled', flag: null, ref, format, matrix: { row, field } };
  };
  add('matrix-concepts', r.concepts, 'master concepts', 'int', 'asm-matrix-concepts', null, 'concepts');
  for (const row of r.rows) {
    const ref = `asm-matrix-${row.id}`;
    add(`matrix-${row.id}-count`, row.count, `${row.id} per item`, 'int', ref, row.id, 'count');
    add(`matrix-${row.id}-applies`, row.applies, `share of items that take ${row.id}`, 'applies', ref, row.id, 'applies');
    add(`matrix-${row.id}-variants`, row.variants, 'variants after this factor', 'int', ref, row.id, 'variants');
  }
  add('matrix-total', r.total, 'derived variants entering review in the worked campaign, before the gate', 'int', 'asm-matrix-independence', null, 'total');
  add('matrix-per-concept', r.per_concept, 'derived variants per master concept, before the gate', 'int', 'asm-matrix-independence', null, 'per_concept');
  // CR-02: the matrix counts derived variants before the gate. Approved-live is
  // that count at the approval yield, the same yield s01 uses for the headline.
  const approved = r.total * assumptions['asm-approval-yield'].value;
  claims['matrix-approved'] = { id: 'matrix-approved', value: approved, unit: 'approved-live variants in the worked campaign, at the approval yield',
    display: formatValue(approved, 'int'), grade: 'Modelled', flag: null, ref: 'asm-approval-yield', format: 'int' };
  claims['avg-campaign-variants'] = {
    id: 'avg-campaign-variants', value: 1000, unit: 'approved-live variants per campaign in the model', display: '1,000',
    grade: 'Modelled', flag: null, ref: 'asm-campaigns',
  };
}

// ---- Plan 02-05: review agent design, tier ranges, reference datum ----

assumptions['asm-review-agent-design'] = { id: 'asm-review-agent-design', label: 'Review agent design', kind: 'evidence', key: null, value: null, unit: null,
  display: 'Design pattern from one public reference', grade: 'Modelled', flag: null,
  basis: 'Behaviours adapted from one company-reported engineering example (rule citations, audit trail, admitting what was not checked, separate eligibility and quality); untested in marketing. No published benchmark.' };

{
  const RANGES = [[0.45, 0.65], [0.25, 0.35], [0.08, 0.16], [0.02, 0.05]];
  RANGES.forEach(([lo, hi], i) => {
    const id = `asm-tier-range-t${i}`;
    assumptions[id] = { id, label: `Tier T${i} share range`, kind: 'evidence', key: null, value: { lo, hi }, unit: 'share of variants at 2x',
      display: `${Math.round(lo * 100)}\u2013${Math.round(hi * 100)}%`, grade: 'Modelled', flag: null,
      basis: 'Illustrative range at 2x around the model default; no published benchmark. Default from the review tier mix.' };
  });
  const scaled = assumptions['asm-tier-mix'].value.scaled;
  scaled.forEach((v, i) => {
    const id = `tier-default-t${i}`;
    claims[id] = { id, value: v, unit: 'model default share of variants at 2x', display: formatValue(v, 'pct0'),
      grade: 'Modelled', flag: null, ref: `asm-tier-range-t${i}`, format: 'pct0' };
  });
  const eligible = scaled[0] + scaled[1];
  const auto = assumptions['asm-auto-approval'].value.scaled;
  const autoOfEligible = Number((auto / eligible).toFixed(2));
  claims['tier-eligible-share-scaled'] = { id: 'tier-eligible-share-scaled', value: eligible, unit: 'share of variants in tiers T0 and T1 at 2x',
    display: formatValue(eligible, 'pct0'), grade: 'Modelled', flag: null, ref: 'asm-auto-approval', format: 'pct0' };
  claims['auto-share-of-eligible'] = { id: 'auto-share-of-eligible', value: autoOfEligible, unit: 'share of tier-eligible variants the agent must clear without a full human review',
    display: formatValue(autoOfEligible, 'pct0'), grade: 'Modelled', flag: null, ref: 'asm-auto-approval', format: 'pct0' };
  claims['ref-auto-approved-share'] = { id: 'ref-auto-approved-share', value: 0.192, unit: 'share of merged code changes approved with no human, reference organisation',
    display: '19.2%', grade: 'Modelled', flag: 'company-reported', ref: 'src-intercom-2x-teardown' };
  claims['ref-bot-approval-rate'] = { id: 'ref-bot-approval-rate', value: 0.284, unit: 'rolling bot approval rate, reference organisation',
    display: '28.4%', grade: 'Modelled', flag: 'company-reported', ref: 'src-intercom-2x-teardown' };
}

// ---- Plan 02-06: reviewer capacity, fatigue, harness and telemetry ----
// Capacity claims are literal values re-checked by data.test under their own
// scenario (override = the multiplier and a flat auto-approval share). Each claim
// refs the row that explains it (code review WR-01): hours and utilisation move
// with the auto-approval share; volume with variants per concept; capacity with
// review hours per reviewer; the reference-rate utilisations rest on the
// reference's company-reported clearance rates.

{
  const ROWS = [['1x-nogate', 1, 0, 'baseline'], ['1x-gate', 1, 0.2, 'baseline'], ['2x-nogate', 2, 0, 'scenario'], ['2x-gate', 2, 0.6, 'scenario']];
  const VALUES = {
    '1x-nogate': [8421, 0.673], '1x-gate': [6905, 0.551],
    '2x-nogate': [16842, 1.345], '2x-gate': [7747, 0.619],
  };
  const put = (id, value, unit, derived, decimals, format, override, ref, flag = null) => {
    claims[id] = { id, value, unit, display: formatValue(value, format), grade: 'Modelled', flag, ref, derived, decimals, format, override };
  };
  for (const [row, multiplier, share, side] of ROWS) {
    const override = { multiplier, auto_approval_share: share };
    const [hours, util] = VALUES[row];
    put(`cap-${row}-hours`, hours, 'human review hours per year, before rework', `${side}.review_hours`, 0, 'int', override, 'asm-auto-approval');
    put(`cap-${row}-util`, util, 'reviewer utilisation, including rework', `${side}.utilisation`, 3, 'pct1', override, 'asm-auto-approval');
  }
  put('cap-1x-variants', 40000, 'approved-live variants per year at 1x', 'baseline.variants_per_year', 0, 'int', { multiplier: 1, auto_approval_share: 0.2 }, 'asm-variants-per-concept');
  put('cap-2x-variants', 80000, 'approved-live variants per year at 2x', 'scenario.variants_per_year', 0, 'int', { multiplier: 2, auto_approval_share: 0.6 }, 'asm-variants-per-concept');
  put('cap-capacity-hours', 14400, 'reviewer capacity, hours per year', 'baseline.review_capacity_hours', 0, 'int', { multiplier: 1, auto_approval_share: 0.2 }, 'asm-reviewer-hours');
  // IN-05: read the reference rates from their claims, so a corrected reference
  // figure flows through (data.test then flags the stale utilisation literal).
  put('cap-2x-ref-low-util', 1.113, '2x utilisation at the reference low clearance rate (company-reported input)', 'scenario.utilisation', 3, 'pct1',
    { multiplier: 2, auto_approval_share: claims['ref-auto-approved-share'].value }, 'src-intercom-2x-teardown', 'company-reported');
  put('cap-2x-ref-high-util', 1.001, '2x utilisation at the reference high clearance rate (company-reported input)', 'scenario.utilisation', 3, 'pct1',
    { multiplier: 2, auto_approval_share: claims['ref-bot-approval-rate'].value }, 'src-intercom-2x-teardown', 'company-reported');
}

function evidence(id, label, grade, display, basis) {
  assumptions[id] = { id, label, kind: 'evidence', key: null, value: null, unit: null, display, grade, flag: null, basis };
}
evidence('asm-fatigue-controls', 'Reviewer-fatigue controls', 'Speculative', 'Design judgement',
  'Controls drawn from general review practice and one company-reported engineering example; vigilance research suggests attention falls over long sessions, but no marketing-specific evidence was checked. A judgement.');
evidence('asm-harness-design', 'Eval harness design', 'Modelled', 'Design from one public reference',
  "Harness pattern adapted from one company-reported engineering example: human decisions as ground truth, versioned datasets, baseline-versus-treatment comparison inside a noise band; most changes tested there were inconclusive and a newer model tested worse. Thresholds must be calibrated on the organisation's own data.");
evidence('asm-telemetry-metrics', 'Telemetry metrics', 'Modelled', 'Recommended instrumentation',
  'Metrics chosen so every cost, quality and outcome figure on this page can be measured per asset ID; no published benchmark.');

// ---- Plan 03-03: operations lever, statutory-damages illustration ----
// The statute ranges are Benchmark (primary law). The incident rate is an invented,
// reader-owned assumption (Speculative). Rights attach to master concepts and all
// derivatives of one work count as one work, so exposure is per master concept and
// is never multiplied by the variant count.

assumptions['asm-incident-rate'] = { id: 'asm-incident-rate', label: 'Rights incidents per master concept', kind: 'evidence', key: null, value: 0.001, unit: 'incidents per master concept',
  display: '1 in 1,000 master concepts', grade: 'Speculative', flag: null,
  basis: 'An invented illustrative rate of rights problems per master concept; rights attach to masters, and derivatives of one work count as one work. Treat this rate as yours to replace. No published benchmark.' };

{
  const stat = (id, value, unit) => {
    claims[id] = { id, value, unit, display: formatValue(value, 'usd0'), grade: 'Benchmark', flag: null, ref: 'src-cornell-17usc504', format: 'usd0' };
  };
  stat('stat-ordinary-min', 750, 'USD per work infringed, ordinary minimum');
  stat('stat-ordinary-max', 30000, 'USD per work infringed, ordinary maximum');
  stat('stat-innocent-min', 200, 'USD per work infringed, floor where the court finds innocent infringement');
  stat('stat-wilful-max', 150000, 'USD per work infringed, ceiling where the court finds wilful infringement');
  const rate = assumptions['asm-incident-rate'].value;
  const incidents = claims['concepts-scaled'].value * rate;
  const ops = (id, value, unit, format) => {
    claims[id] = { id, value, unit, display: formatValue(value, format), grade: 'Speculative', flag: null, ref: 'asm-incident-rate', format };
  };
  ops('ops-incidents', incidents, 'illustrative rights incidents a year at 2x master concepts', 'num1');
  ops('ops-exposure-lo', incidents * claims['stat-ordinary-min'].value, 'USD illustrative statutory exposure a year, ordinary minimum', 'usd0');
  ops('ops-exposure-hi', incidents * claims['stat-ordinary-max'].value, 'USD illustrative statutory exposure a year, ordinary maximum', 'usd0');
  ops('ops-exposure-wilful', incidents * claims['stat-wilful-max'].value, 'USD illustrative statutory exposure a year, wilful ceiling', 'usd0');
}

// ---- Plan 03-03: answer-engine visibility claims (independent traffic studies, one benchmark) ----

for (const [id, value, unit, display, ref] of [
  ['aeo-chatgpt-share', 0.0062, 'share of search-engine organic volume from one assistant, 12 months of analytics across 100 sites', '0.62%', 'src-haynes-2026'],
  ['aeo-llm-share', 0.0073, 'share of search-engine organic volume from all assistants, 12 months of analytics across 100 sites', '0.73%', 'src-haynes-2026'],
  ['aeo-organic-multiple', 39, 'times more traffic from organic search than from AI assistants, 95 sites', '39 times', 'src-seoworks-2026'],
  ['aeo-ai-share-organic', 0.026, 'AI-assistant traffic as a share of organic search traffic, 95 sites', '2.6%', 'src-seoworks-2026'],
  ['aeo-hidden-direct', 0.00003, 'share of direct sessions with identifiable AI traces, 12 sites', '0.003%', 'src-indig-2026'],
  ['aeo-geo-bench', 0.40, 'up to this rise in citation visibility in model answers, author-built benchmark', '40%', 'src-aggarwal-geo-2024'],
]) {
  claims[id] = { id, value, unit, display, grade: 'Modelled', flag: null, ref };
}

// ---- Plan 03-05: calculator assumptions and generated result claims ----
// Locales are folded into variants per concept as formats per locale x locales
// (8 x 5 = 40). Both are Modelled and kind 'calc', so defaultInputs() and
// defaultAssumptions() ignore them.

assumptions['asm-locales'] = a('asm-locales', 'Locales per concept', 'calc', null, 5, 'locales', '5',
  'A modelled locale count; with eight formats per locale it reproduces the forty variants per concept used across the page. No published benchmark.');
assumptions['asm-formats-per-locale'] = a('asm-formats-per-locale', 'Formats per locale', 'calc', null, 8, 'formats', '8',
  'Sizes and channel cuts per locale; fixed in the calculator. No published benchmark.');
assumptions['asm-loaded-fte-cost'] = a('asm-loaded-fte-cost', 'Loaded annual cost per FTE', 'calc', null, 150000, 'USD per FTE per year', '$150,000',
  'A round figure for salary plus on-costs, used only by the headcount scenarios; replace it with your own. No published benchmark.');
assumptions['asm-change-mgmt'] = a('asm-change-mgmt', 'One-off change cost per affected FTE', 'calc', null, 3000, 'USD per affected FTE', '$3,000 per affected FTE',
  'About one week of loaded time per person in the marketing and review teams for training and process change; it excludes severance and exit costs. No published benchmark.');

// The context model.js needs, so model.js itself never imports this file.
export function modelContext() {
  return {
    inputs: defaultInputs(),
    assumptions: defaultAssumptions(),
    grades: Object.fromEntries(Object.values(assumptions).map((e) => [e.id, e.grade])),
    fixed: {
      formats_per_locale: assumptions['asm-formats-per-locale'].value,
      default_locales: assumptions['asm-locales'].value,
      loaded_fte_cost: assumptions['asm-loaded-fte-cost'].value,
      change_cost_per_fte: assumptions['asm-change-mgmt'].value,
    },
  };
}

// Every static number in the s11 results table is generated from the same
// presenter the live calculator uses; `calc` is a path into
// present(defaultValues(ctx), ctx) that data.test re-resolves.
{
  const ctx = modelContext();
  const p = present(defaultValues(ctx), ctx);
  for (const row of p.rows) {
    const def = RESULT_ROWS.find((d) => d.id === row.id);
    for (const [cellName, node, format] of [['base', row.base, def.format], ['scaled', row.scaled, def.format], ['change', row.change, def.changeFormat]]) {
      if (node.value === undefined) continue;
      const id = `calc-${row.id}-${cellName}`;
      const claim = {
        id, value: node.value, unit: `${def.label}, ${cellName === 'base' ? 'baseline' : cellName === 'scaled' ? 'at 2x' : 'change'}`,
        display: node.text, grade: row.grade, flag: null, ref: row.ref, calc: `rows.${row.id}.${cellName}`,
      };
      if (format !== 'none' && formatValue(node.value, format) === node.text) claim.format = format;
      claims[id] = claim;
    }
  }
  // Headcount scenario (default: Redeploy) and sensitivity cells, from the same presenter.
  for (const row of p.scenario.rows) {
    const id = `calc-scen-${row.id}`;
    claims[id] = { id, value: row.value, unit: `Headcount scenario ${p.scenario.name}: ${row.label}`, display: row.text, grade: row.grade, flag: null, ref: row.ref, calc: `scenario.rows.${row.id}` };
  }
  for (const row of p.sensitivity) {
    for (const [cellName, node] of Object.entries(row.cells)) {
      if (node.value === undefined) continue;
      const id = `calc-sens-${row.key}-${cellName}`;
      claims[id] = {
        id, value: node.value, unit: `Sensitivity of ${row.label}, ${cellName}`, display: node.text, grade: row.grade, flag: null, ref: row.ref,
        calc: `sensitivity.${row.key}.${cellName}`,
      };
    }
  }
}
