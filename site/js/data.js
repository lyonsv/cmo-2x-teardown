// Single source of numbers, grades, sources and assumptions (CRED-06).
// The page's data-fig spans, the register rows and compute() all read from here.
import { variantMatrix, compute, economics, sensitivity, WORKFLOW_IDS } from './calc.js';
import { formatValue } from './format.js';
import { present, defaultValues, RESULT_ROWS, ROUTE_SHARE } from './model.js';

export const GRADES = ['Benchmark', 'Modelled', 'Speculative'];
export const FLAGS = ['vendor-claimed', 'company-reported'];
// Evidence class is a second axis, orthogonal to grade (EVID-01). observed = what a
// named organisation reports about itself or what is reported to have happened at
// one (results, incidents, published product capabilities), plus seller-published or
// opinion studies; benchmark = an independent published reference;
// illustrative = an input describing the illustrative company; hypothesis = an effect
// of the programme that a pilot must validate.
export const EVIDENCE = ['observed', 'benchmark', 'illustrative', 'hypothesis'];
export const ALLOWED_PAIRS = {
  benchmark: ['Benchmark', 'Modelled'],
  observed: ['Benchmark', 'Modelled'],
  illustrative: ['Modelled', 'Speculative'],
  hypothesis: ['Modelled', 'Speculative'],
};
export const PUBLISHER_TYPES = ['vendor', 'company', 'academic', 'law-firm commentary', 'press', 'tracker', 'government', 'author', 'secondary'];
export const SCENARIO = { multiplier: 2 };

// Each source carries its own grade and flag (code review WR-07): the register's
// Grade and Flag cells and every chip that links to a source are checked against
// these fields. Law-firm commentary and the author's own secondary reading are a
// Modelled basis, not a Benchmark.
export const sources = {
  'gartner-2025-cmo-spend': {
    title: 'Gartner 2025 CMO Spend Survey Reveals Marketing Budgets Have Flatlined at 7.7% of Overall Company Revenue',
    publisher: 'Gartner, Inc.',
    publisherType: 'company',
    published: '2025-05-12',
    accessed: '2026-10-24',
    url: 'https://www.gartner.com/en/newsroom/press-releases/2025-05-12-gartner-2025-cmo-spend-survey-reveals-marketing-budgets-have-flatlined-at-seven-percent-of-overall-company-revenue',
    bias: 'Analyst firm; self-reported survey of 402 CMOs in North America, the UK and Europe, mostly companies above $1B revenue',
    read_via: 'silicon.co.uk reproduction of the Gartner release (gartner.com returns 403 to automation). Re-check failed 2026-10-24; last verified 2026-10-24. Corroborated by the silicon.co.uk reproduction',
    grade: 'Benchmark',
    flag: null,
  },
  'gartner-2026-cmo-spend': {
    title: 'Gartner 2026 CMO Spend Survey Finds CMOs Allocate 15.3% of Marketing Budgets to AI, But Only 30% Are Ready to Scale AI Capabilities',
    publisher: 'Gartner, Inc.',
    publisherType: 'company',
    published: '2026-05-11',
    accessed: '2026-10-24',
    url: 'https://www.gartner.com/en/newsroom/press-releases/2026-05-11-gartner-2026-cmo-spend-survey-finds-cmos-allocate-15-point-3-percent-of-marketing-budgets-to-ai-but-only-30-percent-are-ready-to-scale-ai-capabilities',
    bias: 'Analyst firm; self-reported survey of 401 CMOs in North America, the UK and Europe, mostly companies above $1B revenue',
    read_via: 'Gartner newsroom page, confirmed in a browser by the author. Re-check failed 2026-10-24; last verified 2026-10-24. Secondary summaries agree',
    grade: 'Benchmark',
    flag: null,
  },
  'nyu-emory-ai-ads-2025': {
    title: 'The Impact of Visual Generative AI on Advertising Effectiveness',
    publisher: 'SSRN (working paper); authors at NYU Stern and Emory',
    publisherType: 'academic',
    published: '2025-11-06',
    accessed: '2026-10-24',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5638311',
    bias: 'Academic working paper; peer-review status not checked; one author is a consultant at an economics consultancy that republished it',
    read_via: 'SSRN page, confirmed in a browser by the author (SSRN returns 403 to automation); date from the NYU Stern research highlight of 2025-11-06. Re-check failed 2026-10-24; last verified 2026-10-24. NYU Stern research highlight page read 2026-10-24',
    grade: 'Benchmark',
    flag: null,
  },
  'shapiro-hitsch-tuchman-2021': {
    title: 'TV Advertising Effectiveness and Profitability: Generalizable Results from 288 Brands',
    publisher: 'Econometrica 89(4) (Shapiro, Hitsch, Tuchman)',
    publisherType: 'academic',
    published: '2021-07',
    accessed: '2026-10-25',
    url: 'https://doi.org/10.3982/ECTA17674',
    bias: 'Peer-reviewed; television advertising for consumer packaged goods brands, not digital or B2B marketing, so it bounds how far the result carries over',
    read_via: 'Abstract on the Econometric Society page fetched 2026-10-25 (the full text was not read); issue month taken from the volume and issue number, day not confirmed',
    grade: 'Benchmark',
    flag: null,
  },
  'lewis-rao-2015': {
    title: 'The Unfavorable Economics of Measuring the Returns to Advertising',
    publisher: 'The Quarterly Journal of Economics 130(4) (Lewis and Rao)',
    publisherType: 'academic',
    published: '2015-07-06',
    accessed: '2026-10-25',
    url: 'https://doi.org/10.1093/qje/qjv023',
    bias: 'Peer-reviewed; 25 field experiments with large retailers and brokerages in digital display advertising; shows how hard the return is to measure, not that it is low',
    read_via: 'Abstract via the Crossref record fetched 2026-10-25 (the journal page returned 403 to automation and the full text was not read); date is the online publication date in that record',
    grade: 'Benchmark',
    flag: null,
  },
  'usco-copyright-ai-part2': {
    title: 'Copyright and Artificial Intelligence, Part 2: Copyrightability',
    publisher: 'U.S. Copyright Office',
    publisherType: 'government',
    published: '2025-01-29',
    accessed: '2026-10-24',
    url: 'https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf',
    bias: 'Government agency report; the Office\'s view of US law, not a court ruling',
    read_via: 'Report PDF; executive summary read directly',
    grade: 'Benchmark',
    flag: null,
  },
  'intercom-2x-teardown': {
    title: 'Intercom / Fin 2x — Teardown',
    publisher: 'Vincent Lyons (author of this page)',
    publisherType: 'author',
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
    publisherType: 'academic',
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
    publisherType: 'vendor',
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
    publisherType: 'vendor',
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
    publisherType: 'academic',
    published: '2013-08-11',
    accessed: '2026-10-24',
    url: 'https://exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf',
    bias: 'Peer-reviewed paper on company-internal data; product ideas, not marketing; the second figure is a second-hand quote',
    read_via: 'Paper PDF fetched 2026-10-24 (Tenet 3); publication date taken from the KDD 2013 conference start, not re-confirmed. Not machine-checkable (PDF): the 2026-10-24 re-check cannot read PDF text; last verified 2026-10-24, when the PDF was read',
    grade: 'Modelled',
    flag: 'company-reported',
  },
  'mmm-geox': {
    title: 'Meridian: GeoX geo experiments for MMM calibration',
    publisher: 'Google (open-source marketing-mix framework documentation)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://developers.google.com/meridian/geox',
    bias: 'Vendor documentation of its own open-source tool; describes a method, reports no outcomes',
    read_via: 'Search summary and the page banner read 2026-10-24; the calibration guide was not opened',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'haynes-2026': {
    title: 'GEO is a distraction',
    publisher: 'Marie Haynes Consulting (SEO consultancy)',
    publisherType: 'vendor',
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
    publisherType: 'vendor',
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
    publisherType: 'press',
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
    publisherType: 'academic',
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
    publisherType: 'government',
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
    publisherType: 'government',
    published: 'undated',
    accessed: '2026-10-24',
    url: 'https://www.law.cornell.edu/uscode/text/17/412',
    bias: 'Primary statute text; how courts apply it varies; not legal advice',
    read_via: 'Statute page read 2026-10-24; the registration precondition for statutory damages',
    grade: 'Benchmark',
    flag: null,
  },
  'gradial-integrations': {
    title: 'Gradial integrations page',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.gradial.com/integrations',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: Adobe Experience Manager, Sitecore, Contentful, Bynder',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'gradial-docs-faq': {
    title: 'Gradial documentation: FAQs',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://docs.gradial.com/docs/faqs/faqs.md',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "full review, spot-check, or auto-approve" and "nothing reaches your live site until a human approves it"; the two statements describe different contexts and are not reconciled by the page',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'gradial-docs-how': {
    title: 'Gradial documentation: How Gradial works',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://docs.gradial.com/docs/getting-started/how-gradial-works.md',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "full review, spot-check, or auto-approve" and "before it reaches a human reviewer"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'gradial-docs-what': {
    title: 'Gradial documentation: What is Gradial',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://docs.gradial.com/docs/getting-started/what-is-gradial.md',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "stay gated on human approval" and "evals framework"; the mechanism of the evals framework is not described',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'gradial-platform': {
    title: 'Gradial platform page',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.gradial.com/platform',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "agent evals" and "lock-in"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'gradial-docs-dam': {
    title: 'Gradial documentation: Digital asset management',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://docs.gradial.com/docs/asset-management/digital-asset-management.md',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: rights metadata and "expired or rights-restricted"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'gradial-docs-translation': {
    title: 'Gradial documentation: Translation and localization',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://docs.gradial.com/docs/translation-and-localization/translation.md',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "inside your CMS" and the vendor assertion about content done without specialist linguists',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'gradial-home': {
    title: 'Gradial home page',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.gradial.com/',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "Run Continuous Experiments" and "Simulate Journeys"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'gradial-geo': {
    title: 'Gradial generative engine optimization solution page',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.gradial.com/solutions/generative-engine-optimization',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "review gates" and the vendor-reported mention-rate change, which the page itself attributes partly to a site redesign',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'gradial-customers': {
    title: 'Gradial customer stories',
    publisher: 'Gradial (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://gradial.com/customers',
    bias: 'Vendor-selected customer story; no method disclosed',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: a named customer story with "1,000 to 1,200" cumulative hours and a second with "ten hours"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'airops-pricing': {
    title: 'AirOps pricing page',
    publisher: 'AirOps (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.airops.com/pricing',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); per-plan marks read from table markup; visible text lost the tick marks. MEDIUM confidence: the markup column classes differ from the visible plan names. Phrases checked: "Human Review" and "Content Review"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'airops-enterprise': {
    title: 'AirOps enterprise page',
    publisher: 'AirOps (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.airops.com/enterprise',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "human review process before going live", "Draft-mode publishing", "SOC 2"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'airops-webflow': {
    title: 'AirOps case study: Webflow',
    publisher: 'AirOps (vendor)',
    publisherType: 'vendor',
    published: '2025-04-28; page metadata modified 2026-06-11',
    accessed: '2026-10-24',
    url: 'https://www.airops.com/blog/webflow-case-study',
    bias: 'Vendor-selected customer story; no method disclosed',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "nearly 10%" and "5x"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'airops-chime': {
    title: 'AirOps case study: Chime',
    publisher: 'AirOps (vendor)',
    publisherType: 'vendor',
    published: '2025-09-11; page metadata modified 2025-11-17',
    accessed: '2026-10-24',
    url: 'https://www.airops.com/blog/chime-case-study',
    bias: 'Vendor-selected customer story; no method disclosed',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "3x" and "89%"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'airops-home': {
    title: 'AirOps home page',
    publisher: 'AirOps (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.airops.com',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrase checked: "AI discovery"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'profound-agents': {
    title: 'Profound agents feature page',
    publisher: 'Profound (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://tryprofound.com/features/agents',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "approval step before anything publishes", "reviewed, edited, or held", "hundreds of inputs"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'profound-pricing': {
    title: 'Profound pricing page',
    publisher: 'Profound (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.tryprofound.com/pricing',
    bias: 'Vendor-authored page; describes its own product',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "Up to 9 Answer Engines", "SOC 2", "CSV, JSON"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'profound-home': {
    title: 'Profound home page',
    publisher: 'Profound (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://www.tryprofound.com',
    bias: 'Vendor-authored page; describes its own product; testimonials carry no method',
    read_via: 'Primary page fetched 2026-10-24 (HTTP 200); phrases checked: "Generates posts and images" and "Agent Analytics"',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  // ---- Phase 4 Plan 2: adoption, risk and regulation sources (all read 2026-10-24) ----
  'parasuraman-manzey-2010': {
    title: 'Complacency and Bias in Human Use of Automation: An Attentional Integration (Human Factors 52(3), 381-410)',
    publisher: 'Human Factors journal (SAGE); Parasuraman and Manzey',
    publisherType: 'academic',
    published: '2010',
    accessed: '2026-10-24',
    url: 'https://doi.org/10.1177/0018720810376055',
    bias: 'Peer-reviewed review article on automation use in general; not a study of marketing review. Only the abstract-level claim is used: complacency and automation bias are documented in naive and expert users, and training or instructions alone do not remove them',
    read_via: 'Crossref metadata and abstract; full text not read. Re-check failed 2026-10-24; last verified 2026-10-24. Publisher page returned 403',
    grade: 'Benchmark',
    flag: null,
  },
  'moffatt-air-canada-2024': {
    title: 'Moffatt v. Air Canada, 2024 BCCRT 149 (file SC-2023-005609): a tribunal held an airline responsible for wrong fare information from its website chatbot; total order $812.02 (damages $650.88, interest $36.14, tribunal fees $125)',
    publisher: 'British Columbia Civil Resolution Tribunal',
    publisherType: 'government',
    published: '2024-02-14',
    event: '2024-02-14',
    accessed: '2026-10-24',
    url: 'https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do',
    bias: 'Tribunal decision by Member Christopher C. Rivers; a small-claims body, so persuasive rather than binding on other courts',
    read_via: 'Decision text read (the page serves a PDF; a browser-like request returns it, a plain automated fetch returns 403)',
    grade: 'Benchmark',
    flag: null,
  },
  'eu-ai-act-art50': {
    title: 'EU AI Act, Article 50: transparency obligations for providers and deployers of certain AI systems (applies from 2026-08-02 under Article 113)',
    publisher: 'artificialintelligenceact.eu (unofficial republication of the EU text)',
    publisherType: 'secondary',
    published: '2024-06-13',
    accessed: '2026-10-24',
    url: 'https://artificialintelligenceact.eu/article/50/',
    bias: 'Unofficial consolidated text of Regulation (EU) 2024/1689; the official text is on EUR-Lex. The page paraphrases and does not quote it. Graded Modelled, not Benchmark, because only this unofficial text was read',
    read_via: 'artificialintelligenceact.eu Article 50 page read; EUR-Lex returned a bot challenge to automation, so the official text was not read directly',
    grade: 'Modelled',
    flag: null,
  },
  'eu-ai-omnibus-2026-1744': {
    title: 'Regulation (EU) 2026/1744 (Digital Omnibus on AI), final text PE-CONS 30/1/26 REV 1: adds a transition to 2026-12-02 for Article 50(2) marking by systems placed on the market before 2026-08-02',
    publisher: 'European Parliament and Council of the European Union',
    publisherType: 'government',
    published: '2026-07-08',
    accessed: '2026-10-24',
    url: 'https://data.consilium.europa.eu/doc/document/PE-30-2026-REV-1/en/pdf',
    bias: 'Legislative text; it changes Article 50 only at paragraph 7 and adds Article 111(4), and leaves the Article 50(4) deployer duty unchanged',
    read_via: 'PE-CONS PDF downloaded and read (Article 111(4) addition and recital 38); the Official Journal date of 2026-07-24 comes from a search snippet of the EUR-Lex record, which could not be fetched. Not machine-checkable (PDF): the 2026-10-24 re-check cannot read PDF text; last verified 2026-10-24, when the PDF was read',
    grade: 'Benchmark',
    flag: null,
  },
  'eu-code-of-practice-transparency': {
    title: 'Code of Practice on Transparency of AI-generated Content (providers: marking and detection; deployers: labelling)',
    publisher: 'European Commission',
    publisherType: 'government',
    published: 'undated on the page',
    accessed: '2026-10-24',
    url: 'https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content',
    bias: 'Regulator page; the code is voluntary, and the Commission and the AI Board describe it as an adequate voluntary tool to demonstrate compliance',
    read_via: 'Commission page read directly. The page is undated in the extract; a law-firm report dates the final code to June 2026 and is not used as a source here',
    grade: 'Benchmark',
    flag: null,
  },
  'asa-ai-disclosure-2025': {
    title: 'Disclosure of AI in Advertising: Striking the Balance Between Creativity and Responsibility',
    publisher: 'Advertising Standards Authority (UK)',
    publisherType: 'government',
    published: '2025-05-29',
    accessed: '2026-10-24',
    url: 'https://www.asa.org.uk/news/disclosure-of-ai-in-advertising-striking-the-balance-between-creativity-and-responsibility.html',
    bias: 'The ASA is the UK self-regulatory body for advertising, funded by an industry levy; typed government as the closest allowed type. States that existing rules apply however content is generated',
    read_via: 'ASA page read directly',
    grade: 'Benchmark',
    flag: null,
  },
  'ftc-fake-reviews-rule-2024': {
    title: 'Federal Trade Commission announces final rule banning fake reviews and testimonials, including AI-generated fake reviews',
    publisher: 'U.S. Federal Trade Commission',
    publisherType: 'government',
    published: '2024-08-14',
    accessed: '2026-10-24',
    url: 'https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials',
    bias: 'Regulator press release announcing a final rule; the effective date comes from secondary summaries and is not used on the page',
    read_via: 'FTC press release read directly',
    grade: 'Benchmark',
    flag: null,
  },
  'incident-mcdonalds-nl-2025': {
    title: "McDonald's Netherlands AI-generated Christmas advert removed after online criticism (NBC News; corroborated by BNN Bloomberg, 2025-12-10)",
    publisher: 'NBC News',
    publisherType: 'press',
    published: '2025-12-11',
    event: '2025-12-10',
    accessed: '2026-10-24',
    url: 'https://www.nbcnews.com/world/europe/mcdonalds-ai-generated-christmas-advert-social-media-backlash-rcna248590',
    bias: 'News report; the company confirmed the removal and gave a statement to NBC and Bloomberg. The event date is the removal date',
    read_via: 'NBC page read; BNN Bloomberg report of 2025-12-10 read as corroboration. The press is the original reporter',
    grade: 'Modelled',
    flag: null,
  },
  'incident-cocacola-2025': {
    title: 'Coca-Cola releases AI-generated "Holidays Are Coming" adverts for a second year (TODAY, 2025-11-04)',
    publisher: 'TODAY (NBC)',
    publisherType: 'press',
    published: '2025-11-04',
    event: '2025-11-03',
    accessed: '2026-10-24',
    url: 'https://www.today.com/today/amp/rcna241799',
    bias: 'News report; the company says the earlier film performed well while press reports a largely negative public reaction, so reception is disputed. The release itself is not in dispute',
    read_via: 'TODAY page read; the press is the original reporter',
    grade: 'Modelled',
    flag: null,
  },
  'incident-guess-vogue-2025': {
    title: 'Guess advert with AI-generated models in US Vogue (ABC7, 2025-08-01; ContentGrip, 2025-08-05)',
    publisher: 'ABC7 / ContentGrip',
    publisherType: 'press',
    published: '2025-08-01',
    event: '2025-08',
    accessed: '2026-10-24',
    url: 'https://abc7news.com/post/controversy-stirs-ai-generated-models-new-guess-ads-appearing-vogue/17390923/',
    bias: 'News reports. Only the narrow facts are used: the advert credit naming the producing agency is printed in the ad (per ContentGrip) and the agency confirmed its role to ABC News. No statement from Vogue or Guess was found in a primary or direct form',
    read_via: 'ABC7 page read; ContentGrip (https://www.contentgrip.com/guess-vogue-ai-model/) read as corroboration. The press is the original reporter',
    grade: 'Modelled',
    flag: null,
  },
  'incident-levis-2023': {
    title: 'Levi Strauss & Co. announces a test of AI-generated models with Lalaland.ai (2023-03-22; editor\'s note dated 2023-03-28)',
    publisher: 'Levi Strauss & Co.',
    publisherType: 'company',
    published: '2023-03-22',
    event: '2023-03-22',
    accessed: '2026-10-24',
    url: 'https://www.levistrauss.com/2023/03/22/lsco-partners-with-lalaland-ai/',
    bias: "Company's own announcement and editor's note, so company-reported; the later criticism is reported by NBC News (2023-04-30, https://www.nbcnews.com/business/business-news/ai-models-levis-controversy-backlash-rcna77280)",
    read_via: 'Company page read; the announcement is the primary source',
    grade: 'Modelled',
    flag: 'company-reported',
  },
};

// ---- Phase 7: Intercom sources and claims (sources) ----
// Primary company posts about its own engineering 2x programme. Every one is a
// self-report with no counterfactual and no audit (research INTERCOM s2.3 and s6).
// All five were fetched in full on 2026-10-25 and the quoted figures found in the text.
const INTERCOM_BIAS = 'Company blog post about its own engineering organisation: self-reported, no control group or counterfactual, no external audit, and model upgrades during the window are confounded with the programme';
Object.assign(sources, {
  'fin-2x-2025': {
    title: '2×',
    publisher: 'Darragh Curran, Fin Ideas (Intercom company blog)',
    publisherType: 'company',
    published: '2025-06-13',
    accessed: '2026-10-25',
    url: 'https://ideas.fin.ai/p/2',
    bias: `${INTERCOM_BIAS}; this post states the goal and the metric, not results`,
    read_via: 'Primary page fetched in full 2026-10-25 (HTTP 200)',
    grade: 'Modelled',
    flag: 'company-reported',
  },
  'fin-2x-nine-months': {
    title: '2× – nine months later: We did it',
    publisher: 'Darragh Curran, Fin Ideas (Intercom company blog)',
    publisherType: 'company',
    published: '2026-04-16',
    accessed: '2026-10-25',
    url: 'https://ideas.fin.ai/p/2x-nine-months-later',
    bias: `${INTERCOM_BIAS}; absolute pull-request counts, the baseline month and cost values are not published, and the metric definition changed from per engineer to per person in R&D between the 2025 and 2026 posts`,
    read_via: 'Primary page fetched in full 2026-10-25 (HTTP 200); every figure used here found in the page text (chart images not read)',
    grade: 'Modelled',
    flag: 'company-reported',
  },
  'intercom-ai-approving-prs': {
    title: 'AI is approving our pull requests: Here\'s how we made it safe',
    publisher: 'Intercom engineering blog',
    publisherType: 'company',
    published: '2026-04-21',
    accessed: '2026-10-25',
    url: 'https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe',
    bias: `${INTERCOM_BIAS}; the hundred-change pilot is too small to show parity with human review`,
    read_via: 'Primary page fetched in full 2026-10-25 (the trailing-slash URL redirects with HTTP 308 to this one, then HTTP 200)',
    grade: 'Modelled',
    flag: 'company-reported',
  },
  'fin-webinar-qa': {
    title: 'Webinar Q&A: How Fin 3x\'d R&D output in 16 months',
    publisher: 'Darragh Curran, Fin Ideas (Intercom company blog)',
    publisherType: 'company',
    published: '2026-05-22',
    accessed: '2026-10-25',
    url: 'https://ideas.fin.ai/p/webinar-q-and-a-how-fin-3xd-r-and',
    bias: `${INTERCOM_BIAS}; answers to audience questions, the richest primary account of mechanisms and caveats`,
    read_via: 'Primary page fetched in full 2026-10-25 (HTTP 200); the webinar recording itself was not viewed',
    grade: 'Modelled',
    flag: 'company-reported',
  },
  'fin-eight-people': {
    title: 'How eight people hold the bar for 200+ builders',
    publisher: 'Clíona de Róiste, Fin Ideas (Intercom company blog)',
    publisherType: 'company',
    published: '2026-07-09',
    accessed: '2026-10-25',
    url: 'https://ideas.fin.ai/p/how-eight-people-hold-the-bar-for',
    bias: `${INTERCOM_BIAS}; describes one frontend infrastructure team, not the whole organisation`,
    read_via: 'Primary page fetched in full 2026-10-25 (HTTP 200)',
    grade: 'Modelled',
    flag: 'company-reported',
  },
});
// ---- end Phase 7: Intercom sources ----

// ---- Phase 6: economics-engine sources (plan 06-04) ----
// Anchors for the engine inputs registered below. They are cited from the engine
// register rows; the page body names tiers and roles, never these publishers.
Object.assign(sources, {
  'anthropic-pricing-2026': {
    title: 'Claude API pricing: model tiers and per-million-token prices',
    publisher: 'Anthropic (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-25',
    url: 'https://platform.claude.com/docs/en/about-claude/pricing',
    bias: 'Vendor-authored price list; list prices are what the seller charges, they change often, and caching and batch discounts are not used here',
    read_via: 'Primary page fetched 2026-10-25; the top tier lists $4 in and $20 out and the small tier $0.10 in and $0.50 out per million tokens (prompts up to 100k)',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'openai-pricing-2026': {
    title: 'API pricing: model tiers and per-million-token prices',
    publisher: 'OpenAI (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-25',
    url: 'https://developers.openai.com/api/docs/pricing',
    bias: 'Vendor-authored price list; list prices are what the seller charges and they change often',
    read_via: 'Primary page fetched 2026-10-25; a top-tier model lists $4 in and $20 out and a small-tier model $0.10 in and $0.50 out per million tokens',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'bls-software-developers-2025': {
    title: 'Occupational Outlook Handbook: Software Developers, Quality Assurance Analysts, and Testers',
    publisher: 'U.S. Bureau of Labor Statistics',
    publisherType: 'government',
    published: 'median pay for May 2025',
    accessed: '2026-10-25',
    url: 'https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm',
    bias: 'Government statistics for the United States; a median wage, not a loaded cost, and it describes software roles rather than marketing platform teams',
    read_via: 'Primary page fetched 2026-10-25; median annual wage $135,980',
    grade: 'Benchmark',
    flag: null,
  },
  'tau-bench-2024': {
    title: 'tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains',
    publisher: 'arXiv preprint 2406.12045',
    publisherType: 'academic',
    published: '2024-06',
    accessed: '2026-10-25',
    url: 'https://arxiv.org/abs/2406.12045',
    bias: 'Preprint, not peer reviewed here; customer-service tasks in retail and airline settings, so transfer to marketing workflows is distant',
    read_via: 'Abstract fetched 2026-10-25; reports repeated-trial reliability (pass^8) below 25 percent in retail for function-calling agents tested at the time',
    grade: 'Modelled',
    flag: null,
  },
  'multi-agent-token-note-2025': {
    title: 'How we built our multi-agent research system',
    publisher: 'Anthropic engineering blog (vendor)',
    publisherType: 'vendor',
    published: '2025-06',
    accessed: '2026-10-25',
    url: 'https://www.anthropic.com/engineering/multi-agent-research-system',
    bias: 'Vendor engineering post about its own product; a single origin, reporting that agents use about four times and multi-agent systems about fifteen times the tokens of a chat',
    read_via: 'Located through search results on 2026-10-25 that trace to this post; read as a secondary summary, not in full',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'agency-billing-survey-2026': {
    title: 'Agency pricing statistics: a billing-rate survey quoted by an agency blog',
    publisher: 'Webtonic (agency vendor blog)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-25',
    url: 'https://www.webtonic.io/blog/pricing-statistics',
    bias: 'A seller blog quoting a founder survey; method and sample not seen, low confidence, used only to show the default is conservative',
    read_via: 'Search result 2026-10-25; the quoted median billing rate is near $185 an hour',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
});
// ---- end Phase 6: economics-engine sources ----

// ---- Phase 7: platform-capability sources for the #compare sub-table (plan 07-09) ----
// Vendor and trade-press statements about what suites and channels document; none is Benchmark.
Object.assign(sources, {
  'adobe-cx-enterprise': {
    title: 'Adobe rebrands Experience Cloud as CX Enterprise and goes all in on AI agents',
    publisher: 'MarTech (trade press)',
    publisherType: 'press',
    published: '2026-04-20',
    accessed: '2026-10-25',
    url: 'https://martech.org/adobe-rebrands-experience-cloud-as-cx-enterprise-goes-all-in-on-ai-agents/',
    bias: 'Trade press summarising a vendor launch; the vendor claims are reported, not tested',
    read_via: 'Re-check failed 2026-10-25 (HTTP 403 to an automated fetch); the research reading of 2026-10-25 from search summaries stands, so the page was not read in full',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'adobe-aep-agents': {
    title: 'Adobe announces general availability of AI agents for businesses (press release)',
    publisher: 'Adobe (vendor)',
    publisherType: 'vendor',
    published: '2025-09-10',
    accessed: '2026-10-25',
    url: 'https://news.adobe.com/news/downloads/pdfs/2025/09/091025-general-availability-of-ai-agents.pdf',
    bias: 'Vendor press release; describes its own product',
    read_via: 'Release PDF fetched and read 2026-10-25 (HTTP 200); it states general availability of AI agents and of AEP Agent Orchestrator',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'adobe-workfront': {
    title: 'Adobe now lets Workfront users assign tasks to AI agents',
    publisher: 'Computerworld (trade press)',
    publisherType: 'press',
    published: '2026-08-13',
    accessed: '2026-10-25',
    url: 'https://computerworld.com/article/4209291/adobe-now-lets-workfront-users-assign-tasks-to-ai-agents.html',
    bias: 'Trade press reporting a vendor launch; vendor capability claims are reported, not tested',
    read_via: 'Article fetched 2026-10-25 (HTTP 200); it states three types of collaborator are now generally available, a content reviewer agent checks content against brand guidelines, and only admins can create them',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'salesforce-connections-2026': {
    title: 'Salesforce Connections 2026 takeaways',
    publisher: 'Salesforce (vendor)',
    publisherType: 'vendor',
    published: '2026-06-12',
    accessed: '2026-10-25',
    url: 'https://www.salesforce.com/blog/?p=145255',
    bias: 'Vendor blog describing its own product; availability not stated',
    read_via: 'Page fetched 2026-10-25 (HTTP 200); phrases checked: Content Agent takes a campaign brief and generates on-brand content across channels; Goals Agent can build, run and optimize campaigns based on goals, budget and guardrails',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'salesforce-marketing-agents-2024': {
    title: 'Salesforce marketing agents blog post',
    publisher: 'Salesforce (vendor)',
    publisherType: 'vendor',
    published: '2024-10-21',
    accessed: '2026-10-25',
    url: 'https://www.salesforce.com/blog/marketing-agents/',
    bias: 'Vendor blog describing its own product; two years old, so it may not describe the product today',
    read_via: 'Page fetched 2026-10-25 (HTTP 200); phrase checked: the draft journey with all campaign content that you can further refine, approve and activate',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'hubspot-fall-2026': {
    title: 'HubSpot debuts Breeze Assistant and a self-updating CRM',
    publisher: 'CMSWire (trade press)',
    publisherType: 'press',
    published: '2026-09-16',
    accessed: '2026-10-25',
    url: 'https://www.cmswire.com/customer-experience/hubspot-debuts-breeze-assistant-selfupdating-crm/',
    bias: 'Trade press summarising a vendor release; naming has changed over time',
    read_via: 'Page fetched 2026-10-25 (HTTP 200); phrase checked: Marketing Studio, an insight-to-action tool with campaign and content AI agents',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'hubspot-spring-2025': {
    title: 'HubSpot Spring 2025 Spotlight: Breeze agents',
    publisher: 'HubSpot (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-25',
    url: 'https://www.hubspot.com/company-news/spring-2025-spotlight-breeze-agents',
    bias: 'Vendor page describing its own product; a year and a half old',
    read_via: 'Page fetched 2026-10-25 (HTTP 200); phrase checked: the Breeze Customer, Knowledge Base, Prospecting and Content Agents',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'google-ads-brand-guidelines': {
    title: 'About brand guidelines (Google Ads Help)',
    publisher: 'Google (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-25',
    url: 'https://support.google.com/google-ads/answer/14934472?hl=en',
    bias: 'Official help page; describes the vendor product, and states no availability date',
    read_via: 'Page fetched 2026-10-25 (HTTP 200); it documents brand guidelines (business name and logos) for Performance Max campaigns',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'google-ads-ai-max': {
    title: 'About AI Max for Search campaigns (Google Ads Help)',
    publisher: 'Google (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-25',
    url: 'https://support.google.com/google-ads/answer/15910366',
    bias: 'Official help page; describes the vendor product, and states no availability date',
    read_via: 'Page fetched 2026-10-25 (HTTP 200); phrases checked: better text customization of headlines and descriptions, and final URL expansion',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'meta-advantage-plus': {
    title: 'Meta Advantage+ (business page)',
    publisher: 'Meta (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-25',
    url: 'https://www.facebook.com/business/ads/meta-advantage-plus',
    bias: 'Vendor page describing its own product',
    read_via: 'Re-check failed 2026-10-25 (HTTP 400 to an automated fetch); the research reading of 2026-10-25 stands: Advantage+ automates audience, placement and budget',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'meta-full-automation-report': {
    title: 'Meta aims to fully automate ad creation with AI by 2026 (Campaign Asia)',
    publisher: 'Campaign Asia (trade press)',
    publisherType: 'press',
    published: '2025-06-03',
    accessed: '2026-10-25',
    url: 'https://www.campaignasia.com/article/meta-aims-to-fully-automate-ad-creation-with-ai-by-2026/502831',
    bias: 'Secondhand: reports a Wall Street Journal report of a company aim; no official Meta launch confirmed',
    read_via: 'Page fetched 2026-10-25 (HTTP 200); headline and date checked, the underlying report was not read',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'smartling-lqa-agent': {
    title: 'Smartling launches its largest AI innovation release yet',
    publisher: 'Smartling (vendor)',
    publisherType: 'vendor',
    published: '2026-05-19',
    accessed: '2026-10-25',
    url: 'https://www.smartling.com/company-news/smartling-launches-its-largest-ai-innovation-release-yet',
    bias: 'Vendor press release; accuracy figures are the vendor\'s own tests',
    read_via: 'Release fetched 2026-10-25 (HTTP 200); phrases checked: LQA Agent uses the MQM framework, and teams can run it fully automatically without a human reviewer or route issues to people',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'phrase-ai-solutions': {
    title: 'Phrase AI solutions (Quality Performance Score)',
    publisher: 'Phrase (vendor)',
    publisherType: 'vendor',
    published: 'undated on the page',
    accessed: '2026-10-25',
    url: 'https://phrase.com/platform/ai-solutions',
    bias: 'Vendor page describing its own product',
    read_via: 'Page fetched 2026-10-25 (HTTP 200); phrase checked: an AI-powered quality score based on MQM 2.0, with a threshold that sends lower-scoring translations for review',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
  'bynder-compliance-agent': {
    title: 'Bynder expands AI agent capabilities (press release)',
    publisher: 'Bynder (vendor)',
    publisherType: 'vendor',
    published: '2025-12-16',
    accessed: '2026-10-25',
    url: 'https://www.globenewswire.com/news-release/2025/12/16/3206286/0/en/Bynder-expands-AI-Agent-capabilities-to-empower-brands-to-scale-creative-freedom-with-intelligent-control.html',
    bias: 'Vendor press release on a wire service; describes its own product',
    read_via: 'Re-check failed 2026-10-25 (HTTP 403 to an automated fetch); the research reading from a search summary stands, so the release was not read in full',
    grade: 'Modelled',
    flag: 'vendor-claimed',
  },
});
// ---- end Phase 7: platform-capability sources ----

// Source evidence: a flag means a named organisation reports its own results (observed);
// press incident reports are observed events. A source is a benchmark only if it is
// independent of what it describes (code review WR-02): anything a vendor publishes,
// and any opinion post, is observed, and its publisher column says who reported it.
const OPINION_SOURCES = new Set(['haynes-2026']); // "GEO is a distraction": an argued post with figures
for (const [key, src] of Object.entries(sources)) {
  const independent = src.publisherType !== 'vendor' && !OPINION_SOURCES.has(key);
  src.evidence = src.flag || key.startsWith('incident-') || !independent ? 'observed' : 'benchmark';
}

export { formatValue };

// One price per hour (ECON-04): the reviewer and marketer hourly rates are derived
// from the one loaded annual cost, so a change to it moves both and no two prices
// for an hour of the same person can drift apart.
const LOADED_FTE_COST = 150000;
const PRODUCTIVE_HOURS = 1600;
const REVIEWER_HOURS = 1200;

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
    'A modelled team size for the subject organisation; there is no published source. It is the core of the denominator of the primary metric (useful work per marketing FTE-equivalent, with agency FTE-equivalents added), and in the calculator it also sets the one-off change cost in the headcount scenarios. Holding it flat is an assumption, not a modelled result (see asm-flat-marketing-headcount).'),
  'asm-campaigns': a('asm-campaigns', 'Campaigns per year', 'input', 'campaigns_per_year', 40, 'campaigns', '~40',
    'A modelled campaign cadence; there is no published source.'),
  'asm-concepts-per-campaign': a('asm-concepts-per-campaign', 'Unique concepts per campaign', 'input', 'concepts_per_campaign', 25, 'concepts', '25',
    'A modelled creative breadth per campaign; there is no published source.'),
  'asm-markets': a('asm-markets', 'Markets per campaign', 'input', 'markets_per_campaign', 5, 'markets', '5',
    'One market is one country or language market with its own launch. A modelled count with no published benchmark; with eight formats per market it reproduces the forty variants per concept used for review load.'),
  'asm-formats-per-market': a('asm-formats-per-market', 'Formats per market', 'input', 'formats_per_market', 8, 'formats', '8',
    'Sizes and channel cuts per market: derived variants that are internal throughput and not the claim. Fixed in the calculator; no published benchmark.'),
  'asm-reviewer-fte': a('asm-reviewer-fte', 'Reviewer headcount', 'input', 'reviewer_fte', 12, 'FTE', '12',
    'A modelled review capacity; there is no published source.'),
  'asm-growth-route': a('asm-growth-route', 'How you get to 2x', 'model', 'campaign_growth_share', 0.5, 'share of growth in log terms',
    'Both: campaigns and markets each about 1.41x',
    'Splits the doubling of campaign-markets between more campaigns and more markets in log terms: 1 means more campaigns only, 0 means more markets only, 0.5 means both, each grown by the square root of the multiplier. The page chose the default; there is no published benchmark.'),
};

assumptions['asm-tier-mix'] = {
  ...a('asm-tier-mix', 'Review tier mix', 'model', 'tier_mix', { baseline: [0.40, 0.35, 0.20, 0.05], scaled: [0.55, 0.30, 0.12, 0.03] }, 'share of variants',
    'T0–T3: 40/35/20/5% today; 55/30/12/3% at 2x', 'Illustrative tier shares; no published benchmark exists'),
};
assumptions['asm-approval-yield'] = a('asm-approval-yield', 'Approval yield', 'model', 'approval_yield', 0.95, 'share of derived variants', '95%',
  'Share of derived variants that clear the gate after the bounded fix loop; rejected variants still cost generation and review. No published benchmark.');

function m(id, label, key, value, unit, display, basis) {
  assumptions[id] = a(id, label, 'model', key, value, unit, display, basis);
}
m('asm-auto-approval', 'Auto-approval share', 'auto_approval_share', { baseline: 0.20, scaled: 0.60 }, 'share of variants', '20% today, 60% at 2x',
  'Share of variants cleared by the gate without a full human review; a sampled or escalated share of them is still seen by a person. The assumption the whole cost claim leans on; no published benchmark.');
m('asm-sampling-rate', 'Sampling audit rate', 'sampling_rate', { baseline: 0.05, scaled: 0.05 }, 'share of auto-approved', '5%',
  'Share of auto-approved variants audited by a human sample; no published benchmark.');
m('asm-escalation-rate', 'Escalation rate', 'escalation_rate', { baseline: 0.05, scaled: 0.05 }, 'share of auto-approved', '5%',
  'Share of auto-approved variants escalated to a human by the gate; no published benchmark.');
m('asm-review-minutes', 'Review time per reviewed variant', 'review_minutes_per_variant', 12, 'minutes', '12 min',
  'Human review time for each variant a person touches; no published benchmark.');
m('asm-rework-rate', 'Rework rate', 'rework_rate', 0.15, 'share of variants', '15%',
  'Share of variants needing one regenerate-and-re-review loop; no published benchmark.');
m('asm-reviewer-hours', 'Review hours per reviewer per year', 'reviewer_hours_per_fte_year', REVIEWER_HOURS, 'hours', '1,200',
  'A fatigue cap on productive review time, not the 2,080 contract hours; no published benchmark.');
m('asm-reviewer-rate', 'Reviewer cost per hour', 'reviewer_rate_per_hour', LOADED_FTE_COST / REVIEWER_HOURS, 'USD per hour', '$125',
  'The price of a reviewer hour: loaded annual cost per FTE divided by the 1,200 productive review hours (asm-loaded-fte-cost / asm-reviewer-hours). One of two hourly prices, one per role; the review overhead of autonomous workflows is priced at this rate because it is review work. Derived, not an independent input.');
m('asm-marketer-rate', 'Marketer cost per hour', 'marketer_rate_per_hour', LOADED_FTE_COST / PRODUCTIVE_HOURS, 'USD per hour', '$93.75',
  'The price of a marketer hour: loaded annual cost per FTE divided by the 1,600 productive hours of a marketer (asm-loaded-fte-cost / asm-productive-hours). One of two hourly prices, one per role. Derived, not an independent input.');
m('asm-concept-hours', 'Internal hours per master concept', 'concept_internal_hours', 35.2, 'hours per master concept', '35.2 hours',
  'Internal creative direction and production hours per master concept, priced at the marketer rate. Set to the average of the creative-production workflow, 35.2 hours (35,200 hours over 1,000 concepts a year) so one quantity has one number; no published benchmark.');
m('asm-master-concept-cost', 'Agency fee per master concept', 'master_concept_cost', 1200, 'USD per concept', '$1,200',
  'The external agency fee only, for each unique concept; the internal hours are asm-concept-hours, priced at the marketer rate. No published benchmark.');
m('asm-variant-cost', 'Cost per derived variant', 'variant_cost', { baseline: 4.00, scaled: 0.80 }, 'USD per variant', '$4.00 today, $0.80 at 2x',
  'Manual or agency derivation today versus AI-derived at 2x; the most contestable cost driver, no published benchmark.');
m('asm-rights-per-concept', 'Rights and licensing per concept', 'rights_cost_per_concept', 250, 'USD per concept', '$250',
  'Rights attach to masters, not derivatives; no published benchmark.');
m('asm-storage-per-variant', 'Storage per approved asset per year', 'storage_cost_per_variant', 0.02, 'USD per variant', '$0.02',
  'Only approved, live assets are stored; no published benchmark.');
m('asm-tooling', 'Annual tooling cost', 'tooling_cost_annual', { baseline: 150000, scaled: 600000 }, 'USD per year', '$150k today, $600k at 2x',
  'Platform licences, observability and eval-harness upkeep, as a fixed annual cost (not inference); no published benchmark.');
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

assumptions['asm-productive-hours'] = { ...a('asm-productive-hours', 'Productive hours per marketer per year', 'engine', 'productive_hours', PRODUCTIVE_HOURS, 'hours per marketer FTE per year', '1,600',
  'About 2,080 contract hours less about 200 for leave and about 280 not attributable to production work. No published benchmark.') };

// ---- Phase 6: economics-engine inputs (plan 06-04) ----
// Every input of workflows.js economics() is an assumption here, under kind 'engine',
// so defaultInputs() and defaultAssumptions() (kinds 'input' and 'model') are unchanged.
// Each row carries its own evidence (illustrative describes the company today,
// hypothesis is a programme effect a pilot must validate) and an optional `cites` list
// of source keys that the generated register row links. The W5 review pool is not a
// row: its states come from compute() at the v1 slice.
// Code review CR-03: a programme-effect hypothesis that no source supports is a judgement
// with no checkable source, which the legend grades Speculative (as the escape rate always
// was). So every 'hypothesis' row defaults to Speculative; the cites on the workflow-effect
// rows support only their token profiles and the platform-team cite only its wage, not the
// hour reductions, agency reductions or team size, so they do not lift the grade.
function eng(id, label, key, value, unit, display, basis, evidence, grade, cites = []) {
  const g = grade ?? (evidence === 'hypothesis' ? 'Speculative' : 'Modelled');
  return { ...a(id, label, 'engine', key, value, unit, display, basis), grade: g, evidence, cites };
}
const pct0 = (x) => `${Math.round(x * 1000) / 10}%`;
const num0 = (x) => x.toLocaleString('en-US');
const usd0 = (x) => `$${x.toLocaleString('en-US')}`;
const engineRows = [
  eng('asm-out-of-scope-fte', 'Marketing FTE outside the nine workflows', 'out_of_scope_fte', 28, 'FTE', '28',
    'The 120 marketing FTE less the 92 in scope (80 marketers in nine workflows plus 12 reviewers); they get only an assistance-level uplift. No published benchmark.', 'illustrative'),
  eng('asm-out-of-scope-uplift', 'Assistance uplift for out-of-scope staff', 'out_of_scope_uplift', 0.10, 'share of hours', '10%',
    'Task-level assistance gains of 25 to 40 percent discounted to about 10 percent (range 0 to 15) for staff whose work is not redesigned; a hypothesis for a pilot to test.', 'hypothesis'),
  eng('asm-overhead-share', 'Review and exception hours the agents create', 'overhead_share', { L1: 0, L2: 0.20, L3: 0.08, L4: 0.08 }, 'share of baseline hours',
    'L1 0%, L2 20%, L3 8%, L4 8%',
    'Human review and exception hours that agent work creates, as a share of baseline hours: none at L1 because assistance output is checked inside the task, 20 percent at L2 and 8 percent at L3 and L4. No published benchmark.', 'hypothesis'),
  eng('asm-autonomous-share', 'Autonomous share at levels 3 and 4', 'autonomous_share_l3', 0.60, 'share of units', '60%',
    'Share of units completed with no human touch beyond sampling once a workflow reaches autonomy level 3 or 4; the same 60 percent hypothesis as the auto-approval gate (range 40 to 85).', 'hypothesis'),
  eng('asm-adoption-rate', 'Adoption at steady state', 'adoption', 1.0, 'share of modelled effect', '100%',
    'Share of the modelled effect that is realised once the programme has settled; 100 percent is full adoption (range 50 to 100). No adoption rates were found, so this is a hypothesis.', 'hypothesis'),
  eng('asm-year1-realisation', 'First-year realisation of savings', 'year1_realisation', 0.5, 'share of savings', '50%',
    'Share of scenario B savings realised in the first year while adoption ramps; run costs are charged in full from day one. A hypothesis.', 'hypothesis'),
  eng('asm-escape-rate', 'Escape rate for unseen auto-approved variants', 'escape_rate', 0.003, 'share of unseen auto-approved variants', '0.3%',
    'Share of auto-approved variants that nobody sees and that carry a defect reaching the market; 0.3 percent is an invented point in a 0.1 to 2 percent range, to be measured by sampling audits in the pilot.', 'hypothesis', 'Speculative'),
  eng('asm-cost-per-escape', 'Cost per escaped defect', 'cost_per_escape', 1500, 'USD per escape', '$1,500',
    'A blend of 90 percent minor escapes (about three labour hours and a re-issue, near $300) and 10 percent serious ones (about $12,000 for a pull, re-buy and triage), near $1,500; a judgement, not a measured cost.', 'illustrative', 'Speculative'),
  eng('asm-token-price-frontier', 'Model price, top tier', 'token_price.frontier', { in: 4, out: 20 }, 'USD per million tokens', '$4 in, $20 out',
    'List price per million tokens for the top model tier, as published in two model developers\' price lists; uncached and unbatched, so it errs high (range x0.5 to x5).', 'illustrative', 'Modelled', ['anthropic-pricing-2026', 'openai-pricing-2026']),
  eng('asm-token-price-small', 'Model price, small tier', 'token_price.small', { in: 0.10, out: 0.50 }, 'USD per million tokens', '$0.10 in, $0.50 out',
    'List price per million tokens for the small model tier, as published in two model developers\' price lists, for prompts up to 100k tokens (range x0.5 to x5).', 'illustrative', 'Modelled', ['anthropic-pricing-2026', 'openai-pricing-2026']),
  eng('asm-judge-call', 'Judge check per run', 'judge_call', { tin: 15000, tout: 1000, tier: 'frontier' }, 'tokens per judge call', '15,000 in, 1,000 out, top tier',
    'Each judge check reads about 15,000 tokens and writes about 1,000 on the top tier; an assumption, and judge reliability is itself unproven. Agents use several times the tokens of a chat, and multi-agent systems far more.', 'illustrative', 'Modelled', ['multi-agent-token-note-2025']),
  eng('asm-demand-multiplier', 'Demand growth in scenario C', 'demand_multiplier', 2.0, 'multiple of today', '2.0x',
    'Growth in demand for in-scope work in the growing-demand scenario (range 1.5 to 3); a survey published by a software seller reports that most marketers expect far more content demand, an interested party, so this is an assumption.', 'illustrative'),
  eng('asm-traffic-growth', 'Traffic growth for experimentation', 'traffic_growth', 1.0, 'multiple of today', '1.0x',
    'Growth in experiment traffic; 1.0 caps experimentation at baseline statistical power, because doubling the number of tests without more traffic halves the power of each (range 1.0 to 2.0).', 'illustrative'),
  eng('asm-agency-fte-cost', 'Cost of one agency FTE-equivalent', 'agency_cost_per_fte_equiv', 200000, 'USD per FTE-equivalent per year', '$200,000',
    'Blended annual cost of one agency FTE-equivalent, about $125 an hour, used to put agency spend and in-house staff in one denominator; a billing survey quoted by an agency blog points nearer $185 an hour, a weak source, so the lower, more conservative figure is used.', 'illustrative', 'Modelled', ['agency-billing-survey-2026']),
  eng('asm-build-cost', 'One-off build and integration', 'build_one_off', 1500000, 'USD one-off', '$1.5M',
    'About six platform FTE-years ($1.2M) plus $0.3M for integration, evaluation-set labelling and security review (range $0.75M to $3M); no published benchmark.', 'hypothesis'),
  eng('asm-platform-team', 'Platform team', 'platform_team', { fte: 6, cost_per_fte: 200000 }, 'FTE and USD per FTE per year', '6 FTE at $200,000',
    'Two platform engineers, two workflow owners, one evaluation curator and one security and governance lead (range 4 to 10 FTE); a government median wage for software developers of $135,980 divided by 0.70 gives about $194,000 loaded.', 'hypothesis', undefined, ['bls-software-developers-2025']),
  eng('asm-autonomy-overhead', 'Autonomy review overhead', 'autonomy_overhead_hours', { per_workflow_month: 24, calibration_month: 16 }, 'hours per month', '24 h per workflow, 16 h calibration',
    'Recurring human work the programme creates: 24 hours a month per autonomous workflow for evaluation curation and sampling, plus 16 hours a month of judge calibration (range x0.5 to x2); the hours are assumptions. It is review work, so it is priced at the reviewer hourly rate.', 'hypothesis'),
  eng('asm-severance-months', 'Severance and exit cost', 'severance_months', 6, 'months of loaded cost per removed FTE', '6 months',
    'Months of loaded cost charged for each removed FTE, in scenario B only (range 0 to 12); it varies by jurisdiction, and works-council duties were not researched.', 'hypothesis', 'Speculative'),
  eng('asm-min-removable-fte', 'Smallest removable release', 'min_removable_fte', 1.0, 'FTE', '1.0 FTE',
    'A pool must free at least one FTE before any headcount counts as removable; smaller releases are reported as fragmented capacity, not as savings.', 'illustrative'),
  eng('asm-counterfactual-funded', 'Share of the no-programme plan that was funded', 'counterfactual_funded_share', 1.0, 'share of avoided hires and agency growth', '100%',
    'Avoided hires and avoided agency growth are real savings only if the plan without the programme would have been funded; 100 percent counts all of both and lower values shrink both parts of the growing-demand saving. A hypothesis, and the most generous end of its range.', 'hypothesis'),
  eng('asm-agency-scales', 'Agency spend grows with output in scenario A', 'agency_scales_with_output', true, 'switch', 'Yes, grows with the output it supports',
    'Whether agency spend grows with output in the same-team scenario. Each unit of work needs agency input as well as in-house hours, so yes (the default) charges the extra agency spend the output needs in the net cash effect and counts it, as agency FTE-equivalents, in the denominator of the output multiple. No holds agency spend at today\'s budget and caps each workflow\'s output at what that budget can support. Either way, output that needs agency work is never counted while that work is held flat.', 'illustrative'),
  eng('asm-chain-success', 'Per-step success of an agent chain', 'chain', { p: 0.95, steps: 8, steps_between_gates: 8, retries: 0 }, 'probability and steps', '95% a step, 8 steps, no gates',
    'A diagnostic shown beside the 60 percent autonomous share, not an input that moves hours: success compounds as the per-step rate to the number of steps (range 90 to 99 percent), and a published benchmark of tool-using agents reports repeated-trial reliability below 25 percent in retail tasks.', 'illustrative', 'Modelled', ['tau-bench-2024']),
  eng('asm-portfolio-workflows', 'Delegated portfolio', 'portfolio', ['W2', 'W4', 'W6', 'W9'], 'workflow ids', 'W2, W4, W6, W9',
    'The delegated portfolio used for the portfolio version of the headline metric: planning and operations, adaptation and localisation, publishing and activation, and measurement and reporting. It was chosen as the four workflows with the largest assumed net hour reductions (50 to 60 percent), so it is the best case among the workflows, not a typical one; the pilot workflows and the whole organisation are shown beside it.', 'illustrative'),
  eng('asm-pilot-workflows', 'Pilot workflows counted as output', 'pilot', ['W2', 'W4', 'W6'], 'workflow ids', 'W2, W4, W6',
    'The workflows of the twelve-week pilot that count as output in the metric: planning and operations, adaptation and localisation, and publishing and activation. Review (W5) is also in the pilot, but it is a gate, not output, so it is not counted. The whole platform team is charged against them, so the after-platform figure is a worst case for a pilot this small.', 'illustrative'),
];
for (const row of engineRows) assumptions[row.id] = row;

// The nine workflows (W5 review is not a row): one illustrative row describing the
// company today, one hypothesis row for the programme effects.
const WF = [
  ['W1', 'Research and insight', 5, 160, 50, 1500000, 0.40, 0.25, 0.55, 2, 0.40, 15, 8, null, [30, 30000, 2000, 'frontier', 0.25, 3]],
  ['W2', 'Planning, briefing and ops', 12, 200, 96, 500000, 0.50, 0.30, 0.65, 3, 0, 10, 5, null, [25, 25000, 1500, 'frontier', 0.20, 2]],
  ['W3', 'Creative production (masters)', 22, 1000, 35.2, 6000000, 0.35, 0.20, 0.50, 2, 0, 12, 9, null, [12, 15000, 2000, 'frontier', 0.30, 2]],
  ['W4', 'Adaptation and localisation', 10, 200, 80, 2000000, 0.55, 0.40, 0.70, 3, 0.40, 15, 5, 'review_gate', [60, 20000, 2000, 'small', 0.15, 8]],
  ['W6', 'Publishing and activation', 9, 12000, 1.2, 1500000, 0.60, 0.40, 0.75, 3, 0.40, 3, 0.5, 'review_gate', [8, 8000, 500, 'small', 0.10, 1]],
  ['W7', 'SEO and answer-engine content', 4, 1600, 4, 1500000, 0.40, 0.25, 0.55, 2, 0.40, 14, 6, null, [10, 20000, 2000, 'frontier', 0.25, 1]],
  ['W8', 'Experimentation', 4, 80, 80, 500000, 0.30, 0.20, 0.45, 2, 0, 21, 18, 'traffic', [30, 30000, 3000, 'frontier', 0.25, 3]],
  ['W9', 'Measurement and reporting', 6, 600, 16, 1000000, 0.50, 0.35, 0.65, 3, 0.40, 5, 1, null, [15, 25000, 2000, 'frontier', 0.20, 2]],
  ['W10', 'Monitoring and optimisation', 8, 1600, 8, 1500000, 0.40, 0.25, 0.55, 3, 0.40, 7, 2, null, [6, 10000, 800, 'small', 0.10, 1]],
];
export const WORKFLOW_ROW_IDS = WF.map((w) => w[0]);
for (const [id, name, fte, units, h, agency, r, lo, hi, level, s, cycleNow, cycleAgent, constraint, p] of WF) {
  const lower = id.toLowerCase();
  const hours = fte * PRODUCTIVE_HOURS;
  const extra = id === 'W3'
    ? ' The hours per master concept are 35.2 so that 22 FTE at 1,600 hours matches 1,000 concepts at 35.2 hours (35,200 hours); this is the same quantity as asm-concept-hours.'
    : '';
  assumptions[`asm-wf-${lower}`] = eng(`asm-wf-${lower}`, `${id} ${name}: the company today`, `workflow:${id}`,
    { name, fte, units, h, agency, cycle_now: cycleNow, constraint }, 'FTE, units, hours per unit, USD, days',
    `${fte} FTE, ${num0(units)} units at ${h} h, ${usd0(agency)} agency`,
    `${fte} FTE at ${num0(PRODUCTIVE_HOURS)} productive hours is ${num0(hours)} hours a year, equal to ${num0(units)} units at ${h} hours each; ${usd0(agency)} of agency spend and ${cycleNow} days elapsed from request to delivery today. An illustrative description of the company, not a benchmark.${extra}`,
    'illustrative');
  assumptions[`asm-wf-${lower}-agent`] = eng(`asm-wf-${lower}-agent`, `${id} ${name}: programme effects`, `workflow:${id}:agent`,
    { r, lo, hi, level, s, cycle_agent: cycleAgent, profile: { steps: p[0], tin: p[1], tout: p[2], tier: p[3], retry: p[4], judge: p[5] } },
    'share of hours, level, days',
    `${pct0(r)} net hours saved (${pct0(lo)} to ${pct0(hi)}), L${level}, ${cycleAgent} days`,
    `Net hour reduction of ${pct0(r)} (range ${pct0(lo)} to ${pct0(hi)}) at autonomy level ${level}, agency spend reduced by ${pct0(s)} and ${cycleAgent} days elapsed from request to delivery; the agent run is ${p[0]} steps of ${num0(p[1])} tokens in and ${num0(p[2])} out on the ${p[3]} tier, with ${pct0(p[4])} retries and ${p[5]} judge checks. Programme effects that a pilot must validate; no published benchmark.`,
    'hypothesis', undefined, ['multi-agent-token-note-2025']);
}

// Engine values by key, as plain data: nested keys are written 'token_price.frontier'.
// Copies are returned, so a caller can move one input without touching data.js.
export function engineValues() {
  const out = {};
  for (const e of Object.values(assumptions)) if (e.kind === 'engine') out[e.key] = structuredClone(e.value);
  return out;
}

// The context workflows.js economics() takes (the 06-02 contract): the v1 slice
// context plus the engine globals and the nine workflow rows. Both arguments can be
// overridden (the evidence trace moves one input at a time); neither is mutated.
export function engineContext(ctx = modelContext(), values = engineValues()) {
  const engine = {};
  for (const [key, value] of Object.entries(values)) {
    if (key.startsWith('workflow:')) continue;
    const path = key.split('.');
    let node = engine;
    for (const k of path.slice(0, -1)) node = node[k] ??= {};
    node[path.at(-1)] = structuredClone(value);
  }
  const workflows = WORKFLOW_ROW_IDS.map((id) => ({ id, ...structuredClone(values[`workflow:${id}`]), ...structuredClone(values[`workflow:${id}:agent`]) }));
  return {
    inputs: structuredClone(ctx.inputs),
    assumptions: structuredClone(ctx.assumptions),
    fixed: { ...ctx.fixed },
    engine,
    workflows,
  };
}
// ---- end Phase 6: economics-engine inputs ----

assumptions['asm-reallocation'] = a('asm-reallocation', 'Funding for the production cost rise', 'context', null, null, null,
  'assumed to come from other marketing lines; agency spend is modelled as its own line',
  'The first-edition scenario holds the total marketing budget flat, so the rise in external production spend is assumed to be funded from other marketing lines. Agency spend does not fund it: the economics engine compares the rise with the agency change at the same higher volume, and at that volume agency spend rises with the output rather than falling, so it releases nothing. Agency spend can fall only at today\'s output (scenario B), which is not the volume at which production cost rises. The cheaper-variant saving is already inside the rise and is not counted again. If the other lines cannot shrink, the budget is not flat and the claim must be restated. No published benchmark.');

// Code review WR-02: "flat headcount" is asserted, not modelled. Only reviewer
// capacity is checked, so the marketer side is a visible Speculative assumption.
assumptions['asm-flat-marketing-headcount'] = { ...a('asm-flat-marketing-headcount', 'Flat marketing headcount', 'context', null, null, null,
  'held flat by assumption, not modelled',
  'Marketing headcount is held flat by assumption; the model checks reviewer capacity only and does not test whether marketers can carry 1.41x to 2x the master concepts (1.41x on the default route, 2x if all the growth comes from more campaigns) or the extra market launches. No published benchmark; if your marketers cannot absorb the extra work, headcount is not flat and the claim must be restated.'), grade: 'Speculative' };

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
lever(6, 'Lever 6 evidence: answer-engine visibility', 'Speculative', 'Thin, vendor-only data', 'Thin, vendor-only and panel-based; outcomes are speculative. Non-vendor traffic studies from October 2026 (two of the three by authors who sell search or visibility services) find AI-assistant referrals a small share of search traffic; visibility has not been shown to move pipeline.');

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
  // Vendor-published outcomes (plan 03-10): Modelled, vendor-claimed, never averaged, never Benchmark.
  'gradial-tmobile-hours-before': {
    id: 'gradial-tmobile-hours-before', value: 1000, unit: 'cumulative hours before, low end of the vendor-stated range 1,000 to 1,200 (T-Mobile campaign, vendor page)', display: '1,000 to 1,200 hours',
    grade: 'Modelled', flag: 'vendor-claimed', ref: 'src-gradial-customers',
  },
  'airops-webflow-refresh': {
    id: 'airops-webflow-refresh', value: 5, unit: 'multiple of content refresh velocity (Webflow, vendor case study)', display: '5x',
    grade: 'Modelled', flag: 'vendor-claimed', ref: 'src-airops-webflow',
  },
  'airops-webflow-signups': {
    id: 'airops-webflow-signups', value: 0.1, unit: 'share of signups attributed to ChatGPT, stated as nearly this (Webflow, vendor case study)', display: '10%', format: 'pct0',
    grade: 'Modelled', flag: 'vendor-claimed', ref: 'src-airops-webflow',
  },
  'airops-chime-citations': {
    id: 'airops-chime-citations', value: 3, unit: 'multiple of citations (Chime, vendor case study)', display: '3x',
    grade: 'Modelled', flag: 'vendor-claimed', ref: 'src-airops-chime',
  },
  'airops-chime-time': {
    id: 'airops-chime-time', value: 0.89, unit: 'time reduction as a fraction (Chime, vendor case study)', display: '89%', format: 'pct0',
    grade: 'Modelled', flag: 'vendor-claimed', ref: 'src-airops-chime',
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
  ...Object.fromEntries([
    ['concepts-base', 'baseline.concepts', 'asm-concepts-per-campaign', 'unique concepts a year'],
    ['concepts-scaled', 'scenario.concepts', 'asm-concepts-per-campaign', 'unique concepts a year'],
  ].map(([id, derived, ref, unit]) => [id, {
    id, value: null, unit, display: '', grade: 'Modelled', flag: null, ref, derived, decimals: 0, format: 'int',
  }])),
  ...Object.fromEntries([
    ['cm-base', 'baseline.campaign_markets_per_quarter', 'asm-markets', 'campaign-markets launched per quarter: one campaign launched in one market counts once', 0, 'int'],
    ['cm-scaled', 'scenario.campaign_markets_per_quarter', 'asm-markets', 'campaign-markets launched per quarter: one campaign launched in one market counts once', 0, 'int'],
    ['btl-base', 'baseline.brief_to_live_days', 'asm-build-days', 'brief-to-live time, days', 1, 'days1'],
    ['btl-scaled', 'scenario.brief_to_live_days', 'asm-build-days', 'brief-to-live time, days', 1, 'days1'],
    ['cpcm-base', 'baseline.cost_per_campaign_market', 'asm-master-concept-cost', 'USD production cost per campaign-market', 0, 'usd0'],
    ['cpcm-scaled', 'scenario.cost_per_campaign_market', 'asm-master-concept-cost', 'USD production cost per campaign-market', 0, 'usd0'],
    ['cpcm-change', 'ratios.cost_per_campaign_market_change', 'asm-master-concept-cost', 'change in production cost per campaign-market', 2, 'pctchg0'],
    ['cpa-base', 'baseline.cost_per_asset', 'asm-variant-cost', 'USD per approved asset', 2, 'usd2'],
    ['cpa-scaled', 'scenario.cost_per_asset', 'asm-variant-cost', 'USD per approved asset', 2, 'usd2'],
    ['cpa-change', 'ratios.cost_per_asset_change', 'asm-variant-cost', 'change in cost per approved asset', 2, 'pctchg0'],
    ['total-cost-base', 'baseline.cost.total', 'asm-variant-cost', 'USD per year', 0, 'usdm2'],
    ['total-cost-scaled', 'scenario.cost.total', 'asm-variant-cost', 'USD per year', 0, 'usdm2'],
    ['total-cost-delta', 'deltas.total_cost', 'asm-variant-cost', 'USD per year, 2x minus baseline', 0, 'usdm2'],
    ['total-cost-change', 'ratios.total_cost_change', 'asm-variant-cost', 'change in production-attributable cost', 2, 'pctchg0'],
    ['budget-share-delta', 'deltas.production_share_of_budget', 'asm-marketing-budget', 'percentage points of marketing budget', 3, 'pts1'],
    ['budget-share-base', 'baseline.production_share_of_budget', 'asm-marketing-budget', 'share of marketing budget', 3, 'pct1'],
    ['budget-share-scaled', 'scenario.production_share_of_budget', 'asm-marketing-budget', 'share of marketing budget', 3, 'pct1'],
    ['ai-spend-base', 'baseline.ai_spend', 'asm-ai-share-tooling', 'USD per year', 0, 'usd0'],
    ['ai-spend-scaled', 'scenario.ai_spend', 'asm-ai-share-tooling', 'USD per year', 0, 'usd0'],
    ['ai-spend-ratio', 'ratios.ai_spend', 'asm-ai-share-tooling', 'x', 1, 'x1'],
    ['break-even-auto-approval', 'break_even_auto_approval.value', 'asm-auto-approval', 'minimum auto-approval share at flat reviewers', 2, 'pct0'],
    ['human-touch-share-scaled', 'scenario.human_touch_share', 'asm-auto-approval', 'share of derived variants seen by a person at 2x (full review, sampling or escalation)', 2, 'pct0'],
    ['capacity-auto-approval', 'capacity_auto_approval.value', 'asm-auto-approval', 'auto-approval share below which review capacity is exceeded', 2, 'pct0'],
  ].map(([id, derived, ref, unit, decimals, format]) => [id, {
    id, value: null, unit, display: '', grade: 'Modelled', flag: null, ref, derived, decimals, format,
  }])),
  ...Object.fromEntries(['base', 'scaled'].flatMap((side) => [
    ['generation', 'asm-variant-cost'],
    ['review', 'asm-review-minutes'],
    ['rework', 'asm-rework-rate'],
    ['tooling', 'asm-tooling'],
    ['rights', 'asm-rights-per-concept'],
    ['storage', 'asm-storage-per-variant'],
  ].map(([comp, ref]) => {
    const id = `cpa-${comp}-${side}`;
    return [id, {
      id, value: null, unit: `USD per approved asset, ${comp}`, display: '',
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
  'shapiro-negative-margin': {
    id: 'shapiro-negative-margin', value: 0.8, unit: 'lower bound on the share of 288 brands with a negative return on investment at the margin of television advertising', display: '80%', format: 'pct0',
    grade: 'Benchmark', flag: null, ref: 'src-shapiro-hitsch-tuchman-2021',
  },
  'lewis-rao-ci-width': {
    id: 'lewis-rao-ci-width', value: 100, unit: 'lower bound on the median width of the confidence interval on return on investment, in percentage points, across 25 field experiments', display: '100 percentage points',
    grade: 'Benchmark', flag: null, ref: 'src-lewis-rao-2015',
  },
  'winrate-second-hand': {
    id: 'winrate-second-hand', value: 0.10, unit: 'share of experiments that led to a business change, second company quoted second-hand', display: '10%', format: 'pct0',
    grade: 'Modelled', flag: 'company-reported', ref: 'src-kohavi-2013',
  },
};

// ECON-12: derived claims carry no typed values. Each value is resolved once, at
// module load, from compute() at the page defaults and rounded to the claim's
// decimals; display follows from the format. Claims with an override (the capacity
// rows) keep their own literals and are re-checked by data.test under their scenario.
{
  const r = compute(defaultInputs(), defaultAssumptions());
  if (!r.ok) throw new Error(`derived claims: compute rejected the defaults (${r.errors.map((e) => e.message).join('; ')})`);
  for (const c of Object.values(claims)) {
    if (!c.derived || c.override || c.value !== null) continue;
    const v = c.derived.split('.').reduce((o, k) => o[k], r);
    c.value = Number(v.toFixed(c.decimals ?? 0));
    c.display = formatValue(c.value, c.format);
  }
}

// Winners a quarter (s10): the test cadence times the lowest and highest reported
// win rates, read from the assumption and the claims rather than repeated as literals.
{
  const cadence = assumptions['asm-tests-per-quarter'].value;
  for (const [id, rateId, unit] of [
    ['tests-winners-lo', 'winrate-second-hand', 'winners a quarter at the lowest reported rate'],
    ['tests-winners-hi', 'winrate-paper', 'winners a quarter at the highest reported rate'],
  ]) {
    const value = Math.round(cadence * claims[rateId].value);
    claims[id] = { id, value, unit, display: String(value), grade: 'Modelled', flag: null, ref: 'asm-tests-per-quarter', inputs: [rateId] };
  }
}

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
  // Evidence inputs: the totals multiply every factor; each factor's running count multiplies the ones before it.
  const matrixInputs = ['asm-matrix-concepts', ...r.rows.map((row) => `asm-matrix-${row.id}`)];
  claims['matrix-total'].inputs = matrixInputs;
  claims['matrix-per-concept'].inputs = matrixInputs;
  r.rows.forEach((row, i) => { claims[`matrix-${row.id}-variants`].inputs = matrixInputs.slice(0, i + 2); });
  // CR-02: the matrix counts derived variants before the gate. Approved is
  // that count at the approval yield, the same yield s01 uses for the headline.
  const approved = r.total * assumptions['asm-approval-yield'].value;
  claims['matrix-approved'] = { id: 'matrix-approved', value: approved, unit: 'approved variants in the worked campaign, at the approval yield',
    display: formatValue(approved, 'int'), grade: 'Modelled', flag: null, ref: 'asm-approval-yield', format: 'int', inputs: ['matrix-total'] };
  claims['avg-campaign-variants'] = {
    id: 'avg-campaign-variants', value: 1000, unit: 'derived variants per campaign in the model: internal throughput, not the claim', display: '1,000',
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
      grade: 'Modelled', flag: null, ref: `asm-tier-range-t${i}`, format: 'pct0', inputs: ['asm-tier-mix'], side: '2x' };
  });
  const eligible = scaled[0] + scaled[1];
  const auto = assumptions['asm-auto-approval'].value.scaled;
  const autoOfEligible = Number((auto / eligible).toFixed(2));
  claims['tier-eligible-share-scaled'] = { id: 'tier-eligible-share-scaled', value: eligible, unit: 'share of variants in tiers T0 and T1 at 2x',
    display: formatValue(eligible, 'pct0'), grade: 'Modelled', flag: null, ref: 'asm-auto-approval', format: 'pct0', inputs: ['asm-tier-mix'], side: '2x' };
  claims['auto-share-of-eligible'] = { id: 'auto-share-of-eligible', value: autoOfEligible, unit: 'share of tier-eligible variants the agent must clear without a full human review',
    display: formatValue(autoOfEligible, 'pct0'), grade: 'Modelled', flag: null, ref: 'asm-auto-approval', format: 'pct0', inputs: ['asm-tier-mix'], side: '2x' };
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
  put('cap-1x-variants', 40000, 'derived variants a year at 1x: internal throughput, not the claim', 'baseline.variants_per_year', 0, 'int', { multiplier: 1, auto_approval_share: 0.2 }, 'asm-formats-per-market');
  put('cap-2x-variants', 80000, 'derived variants a year at 2x: internal throughput, not the claim', 'scenario.variants_per_year', 0, 'int', { multiplier: 2, auto_approval_share: 0.6 }, 'asm-formats-per-market');
  put('cap-capacity-hours', 14400, 'reviewer capacity, hours per year', 'baseline.review_capacity_hours', 0, 'int', { multiplier: 1, auto_approval_share: 0.2 }, 'asm-reviewer-hours');
  // IN-05: read the reference rates from their claims, so a corrected reference
  // figure flows through (data.test then flags the stale utilisation literal).
  put('cap-2x-ref-low-util', 1.113, '2x utilisation at the reference low clearance rate (company-reported input)', 'scenario.utilisation', 3, 'pct1',
    { multiplier: 2, auto_approval_share: claims['ref-auto-approved-share'].value }, 'src-intercom-2x-teardown', 'company-reported');
  claims['cap-2x-ref-low-util'].inputs = ['ref-auto-approved-share'];
  put('cap-2x-ref-high-util', 1.001, '2x utilisation at the reference high clearance rate (company-reported input)', 'scenario.utilisation', 3, 'pct1',
    { multiplier: 2, auto_approval_share: claims['ref-bot-approval-rate'].value }, 'src-intercom-2x-teardown', 'company-reported');
  claims['cap-2x-ref-high-util'].inputs = ['ref-bot-approval-rate'];
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

// ---- Phase 4 Plan 2: context assumptions for s13 and s14 ----
// Kind 'context' rows are shown and graded but never read by the model.
// CR-01: N is derived from the model, not chosen beside it. It is the 2x
// brief-to-live time at the page defaults (build time plus one review touch,
// including queue wait and rework), rounded up to whole days, so the target can
// never sit below what the page's own maths predicts.
{
  const btl = compute(defaultInputs(), defaultAssumptions()).scenario.brief_to_live_days;
  const n = Math.ceil(btl);
  assumptions['asm-backlog0-days'] = a('asm-backlog0-days', 'Backlog 0 service level (N)', 'context', null, n, 'days', `${n} days`,
    `A service-level target this page chose, not a measurement: the modelled brief-to-live time at 2x with the page defaults (build time plus one review touch, including queue wait and rework, ${formatValue(btl, 'days1')}), rounded up. The model gives an average, so a ceiling on the oldest brief is harder to meet than the model shows; read it as the least a 2x programme must achieve, not a forecast. Replace it with your own service level. No published benchmark.`);
}
assumptions['asm-adoption-design'] = { ...a('asm-adoption-design', 'Adoption stages, first moves and guardrails', 'context', null, null, null, "Author's design",
  "The adoption stages, first moves and guardrails in section 08 are the author's design, not a measured pathway. No adoption rates are stated because none were found."), grade: 'Speculative' };
assumptions['asm-risk-likelihood'] = { ...a('asm-risk-likelihood', 'Risk likelihood words', 'context', null, null, null, "Author's judgement",
  "The likelihood words in the risk register are the author's judgement from the incidents and sources cited in section 09, not measured rates."), grade: 'Speculative' };

// ---- Phase 7 plan 06: workflow prioritisation (ECONP-06) ----
// The five scores per workflow are the author's judgements (1 to 5, 5 is best; risk 5 is
// low risk), recorded once as a judgement table. They are not model output, and no model
// figure reads them. Each score and each total is a claim on one Speculative context row.
assumptions['asm-prioritisation'] = { ...a('asm-prioritisation', 'Workflow prioritisation scores', 'context', null, null, null, "Author's judgement",
  'Scores from 1 to 5 for value (hours and agency spend in scope), feasibility (how reliable agents are today and how hard the integration is), repeatability (volume and standardisation), risk (brand, legal and spend exposure, where 5 is low risk) and measurable autonomy (whether success can be checked by a deterministic test), each summed without weighting. Judgements informed by the workflow inventory, not measurements; replace them with your own scoring. No published benchmark.'), grade: 'Speculative' };
export const PRIORITY_SCORES = {
  W1: { value: 2, feasibility: 4, repeatability: 3, risk: 4, autonomy: 2 },
  W2: { value: 4, feasibility: 3, repeatability: 4, risk: 4, autonomy: 3 },
  W3: { value: 5, feasibility: 2, repeatability: 2, risk: 2, autonomy: 2 },
  W4: { value: 4, feasibility: 4, repeatability: 5, risk: 3, autonomy: 4 },
  W5: { value: 3, feasibility: 4, repeatability: 5, risk: 2, autonomy: 4 },
  W6: { value: 3, feasibility: 4, repeatability: 5, risk: 3, autonomy: 5 },
  W7: { value: 2, feasibility: 4, repeatability: 4, risk: 3, autonomy: 3 },
  W8: { value: 2, feasibility: 3, repeatability: 3, risk: 3, autonomy: 4 },
  W9: { value: 3, feasibility: 4, repeatability: 4, risk: 4, autonomy: 3 },
  W10: { value: 3, feasibility: 3, repeatability: 4, risk: 2, autonomy: 4 },
};
for (const [wid, sc] of Object.entries(PRIORITY_SCORES)) {
  const total = Object.values(sc).reduce((x, y) => x + y, 0);
  for (const [key, v] of [...Object.entries(sc), ['total', total]]) {
    const id = `prio-${wid}-${key}`;
    claims[id] = { id, value: v, unit: `Prioritisation score for ${wid}, ${key}${key === 'total' ? ' (sum of the five scores)' : ' (1 to 5)'}`, display: String(v), grade: 'Speculative', flag: null, ref: 'asm-prioritisation' };
  }
}
// ---- Phase 7 plan 08: pilot targets and acceptance criteria (ROAD-01) ----
// Targets for the twelve-week pilot. They are the author's hypotheses, set so a pilot can
// pass or fail them; no model figure reads them (kind 'context'). Each is Speculative with
// hypothesis evidence, and the page shows each beside a Speculative chip.
const pilot = (id, label, value, unit, display, basis) => {
  assumptions[id] = { ...a(id, label, 'context', null, value, unit, display, basis), grade: 'Speculative', evidence: 'hypothesis' };
};
pilot('asm-pilot-target-hours', 'Pilot target: fewer human hours per market launched', 0.4, 'share of baseline human hours per market launched', '40%',
  "A target the author chose for the pilot, set below the fully ramped reduction the model uses for planning and briefing so that a first slice can pass it. Hypothesis: measure it against the baseline time study of weeks one to three and replace it with your own. No published benchmark.");
pilot('asm-pilot-target-cycle', 'Pilot target: shorter objective-to-verified-live time', 0.5, 'share of baseline median objective-to-verified-live time', '50%',
  "A target the author chose for the pilot, in line with the model's ramped elapsed-time assumption for planning and briefing. Hypothesis: the median is measured from workflow state against the baseline time study. No published benchmark.");
pilot('asm-pilot-escape-ceiling', 'Pilot acceptance: ceiling on the escape rate in sampled outputs', 0.01, 'share of sampled outputs with an error that passed review', '1%',
  "A ceiling the author chose, deliberately looser than the 0.3% escape rate the model assumes at scale because a pilot samples heavily and a pilot that exceeds this ceiling should stop. Hypothesis: replace it with the error tolerance your brand and legal owners set. No published benchmark.");
pilot('asm-pilot-first-pass-floor', 'Pilot acceptance: floor on first-pass acceptance', 0.8, 'share of derived variants accepted by review at the first pass', '80%',
  "A floor the author chose for the pilot, below the 95% approval yield the model assumes once the rules are encoded. Hypothesis: measured by the review tool against the baseline from weeks one to three. No published benchmark.");
// ---- end Phase 7 plan 06: prioritisation ----

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
  const ops = (id, value, unit, format, statId) => {
    claims[id] = { id, value, unit, display: formatValue(value, format), grade: 'Speculative', flag: null, ref: 'asm-incident-rate', format,
      inputs: ['concepts-scaled', ...(statId ? [statId] : [])], side: '2x' };
  };
  ops('ops-incidents', incidents, 'illustrative rights incidents a year at 2x master concepts', 'num1');
  ops('ops-exposure-lo', incidents * claims['stat-ordinary-min'].value, 'USD illustrative statutory exposure a year, ordinary minimum', 'usd0', 'stat-ordinary-min');
  ops('ops-exposure-hi', incidents * claims['stat-ordinary-max'].value, 'USD illustrative statutory exposure a year, ordinary maximum', 'usd0', 'stat-ordinary-max');
  ops('ops-exposure-wilful', incidents * claims['stat-wilful-max'].value, 'USD illustrative statutory exposure a year, wilful ceiling', 'usd0', 'stat-wilful-max');
}

// ---- Plan 03-03: answer-engine visibility claims (non-vendor traffic studies, one benchmark) ----

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
// Markets and formats per market are registered above as kind 'input' (asm-markets,
// asm-formats-per-market), so defaultInputs() carries them into compute(). The two
// rows below are kind 'calc' and used only by the headcount scenarios.

assumptions['asm-loaded-fte-cost'] = a('asm-loaded-fte-cost', 'Loaded annual cost per FTE', 'calc', null, LOADED_FTE_COST, 'USD per FTE per year', '$150,000',
  'A round figure for salary plus on-costs, used by the headcount scenarios and to set the one hourly price for reviewers and marketers; replace it with your own. No published benchmark.');
assumptions['asm-change-mgmt'] = a('asm-change-mgmt', 'One-off change cost per affected FTE', 'calc', null, 3000, 'USD per affected FTE', '$3,000 per affected FTE',
  'About one week of loaded time per person in the marketing team, reviewers included (they are inside the 120), for training and process change; it excludes severance and exit costs. No published benchmark.');

// The context model.js needs, so model.js itself never imports this file.
export function modelContext() {
  return {
    inputs: defaultInputs(),
    assumptions: defaultAssumptions(),
    grades: Object.fromEntries(Object.values(assumptions).map((e) => [e.id, e.grade])),
    fixed: {
      loaded_fte_cost: assumptions['asm-loaded-fte-cost'].value,
      change_cost_per_fte: assumptions['asm-change-mgmt'].value,
      min_removable_fte: assumptions['asm-min-removable-fte'].value,
    },
  };
}

// Every static number in the s11 results table is generated from the same
// presenter the live calculator uses; `calc` is a path into
// present(defaultValues(ctx), ctx) that data.test re-resolves. The builder takes
// any context, so the evidence trace below can re-run it with one input moved.
// `side: '2x'` marks figures computed at the 2x scenario or stating a change from
// baseline to 2x: the scaled and change cells, the headcount scenarios, the
// sensitivity cells (each measured at 2x) and every Show the maths step (each step
// works through the 2x numbers).
function presenterClaims(ctx) {
  const out = {};
  const p = present(defaultValues(ctx), ctx);
  if (!p.ok) throw new Error(`presenter claims: the model rejected its inputs (${p.errors.map((e) => e.message).join('; ')})`);
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
      if (cellName !== 'base') claim.side = '2x';
      out[id] = claim;
    }
  }
  // Scenarios A, B and C (pilot slice) at the page defaults, from the same presenter. Only C is the static table; A and B
  // are generated so the live table's data-fig ids always resolve to a computed claim.
  for (const mode of ['a', 'b', 'c']) {
    const sc = present({ ...defaultValues(ctx), scenario: mode }, ctx).scenario;
    for (const row of sc.rows) {
      const id = `calc-scen-${mode}-${row.id}`;
      out[id] = {
        id, value: row.value, unit: `Scenario ${sc.name}, pilot slice, at the page defaults: ${row.label}`, display: row.text, grade: row.grade, flag: null,
        ref: row.ref, calc: `scenario${mode.toUpperCase()}.rows.${row.id}`, side: '2x',
      };
    }
  }
  for (const row of p.sensitivity) {
    for (const [cellName, node] of Object.entries(row.cells)) {
      if (node.value === undefined) continue;
      const id = `calc-sens-${row.key}-${cellName}`;
      out[id] = {
        id, value: node.value, unit: `Sensitivity of ${row.label}, ${cellName}`, display: node.text, grade: row.grade, flag: null, ref: row.ref,
        calc: `sensitivity.${row.key}.${cellName}`, side: '2x',
      };
    }
  }
  // Show the maths and What you must believe: every figure shares its item's grade and register row.
  const figClaim = (fig, node, unit, grade, ref, calc, side) => {
    if (node.value !== undefined) out[fig] = { id: fig, value: node.value, unit, display: node.text, grade, flag: null, ref, calc, ...(side ? { side } : {}) };
  };
  for (const m of p.maths) {
    for (const part of [...m.parts, m.result]) {
      if (part.fig) figClaim(part.fig, part, `Show the maths, ${m.name}`, m.grade, m.ref, `maths.${m.id}.${part.fig.split('-').pop()}`, '2x');
    }
  }
  for (const b of p.believe) {
    for (const part of b.parts) {
      if (part.fig) figClaim(part.fig, part, `What you must believe: ${b.statement}`, b.grade, b.ref, `believe.${b.key}.${part.fig.endsWith('-swing') ? 'swing' : 'value'}`);
    }
  }
  return out;
}
Object.assign(claims, presenterClaims(modelContext()));

// ---- Phase 6: generated engine claims (ECON-12) ----
// Every engine output a later phase will show is a claim whose value is read from
// economics() or compute(), never typed. `econ` is a dot path into the economics()
// output plus `sensitivity` (array rows are addressed by index); `derived` is a path
// into compute(). Display is rounded, value is not. Evidence is traced from the
// engine and model inputs the figure actually depends on (see the trace below).
function econBundle(ec) {
  const e = economics(ec);
  if (!e.ok) throw new Error(`engine claims: economics rejected its inputs (${(e.errors ?? []).map((x) => x.message ?? x).join('; ')})`);
  let sens;
  return Object.defineProperty({ ...e }, 'sensitivity', {
    enumerable: false,
    get: () => {
      sens ??= sensitivity(ec);
      if (!sens.ok) throw new Error('engine claims: sensitivity rejected its inputs');
      return sens;
    },
  });
}
const pathIn = (obj, path) => path.split('.').reduce((x, k) => x?.[k], obj);

function engineClaims(ec) {
  const out = {};
  const bundle = econBundle(ec);
  const baseline = compute(ec.inputs, ec.assumptions);
  if (!baseline.ok) throw new Error('engine claims: compute rejected its inputs');
  const names = Object.fromEntries(ec.workflows.map((w) => [w.id, w.name]));
  names.W5 = 'Review and approval';
  const asmFor = (id) => (id === 'W5' ? 'asm-reviewer-fte' : `asm-wf-${id.toLowerCase()}`);
  const add = (id, source, path, format, unit, ref, opts = {}) => {
    const value = pathIn(source, path);
    if (typeof value !== 'number' || !Number.isFinite(value)) return;
    const full = `econ-${id}`;
    out[full] = { id: full, value, unit, display: formatValue(value, format), format, grade: opts.grade ?? 'Modelled', flag: null, ref, [opts.derived ? 'derived' : 'econ']: path };
    if (opts.side) out[full].side = opts.side;
  };
  const econ = (id, path, format, unit, ref, opts) => add(id, bundle, path, format, unit, ref, opts);
  const derived = (id, path, format, unit, ref, opts) => add(id, baseline, path, format, unit, ref, { ...opts, derived: true });

  // Per-workflow tables, current state and agent-enabled.
  const FIELDS = [
    ['units', 'int', 'units a year'], ['hours_per_unit', 'num1', 'human hours per unit'], ['review_hours', 'int', 'human review hours a year'],
    ['total_hours', 'int', 'total human hours a year'], ['fte', 'num1', 'people (FTE)'], ['labour_cost', 'usd0', 'labour cost a year'],
    ['agency_cost', 'usd0', 'agency cost a year'], ['ai_cost', 'usd0', 'AI inference cost a year'], ['cost_per_unit', 'usd0', 'cost per unit'],
    ['cycle_days', 'days1', 'days elapsed from request to delivery'], ['autonomous_share', 'pct0', 'share of units completed with no human edit'],
  ];
  // Code review CR-03, WR-01: every figure of the agent-enabled state describes the
  // programme hypothesis, so it is Speculative and links the row that governs it: the
  // workflow's programme-effects row, or for W5 (whose agent state comes from the
  // auto-approval gate scaled by adoption) the adoption row.
  for (const id of WORKFLOW_IDS) {
    for (const state of ['current', 'agent']) {
      const agentRef = id === 'W5' ? 'asm-adoption-rate' : `${asmFor(id)}-agent`;
      const ref = state === 'agent' ? agentRef : asmFor(id);
      for (const [field, format, what] of FIELDS) {
        econ(`wf-${id}-${state}-${field}`, `workflows.${id}.${state}.${field}`, format,
          `${id} ${names[id]}, ${state === 'agent' ? 'agent-enabled' : 'current state'}, ${what}`, ref, state === 'agent' ? { side: '2x', grade: 'Speculative' } : {});
      }
    }
  }

  // Reviewer capacity bridge and the scale-versus-programme split (compute() side).
  for (const [key, format, what, side] of [
    ['slack_baseline', 'num2', 'reviewer slack today, in FTE', 'baseline'],
    ['programme_added_load', 'num2', 'reviewer load the programme adds, in FTE', '2x'],
    ['work_avoided', 'num2', 'reviewer work avoided by the programme, in FTE', '2x'],
    ['avoided_hires', 'num2', 'reviewer hires avoided against doing the same volume without the programme, in FTE', '2x'],
    ['unused', 'num2', 'reviewer capacity left unused at 2x, in FTE', '2x'],
    ['removable_same_output', 'num2', 'reviewers removable at the same output as today, in FTE', '2x'],
    ['max_multiple_at_target', 'x2', 'largest output multiple the reviewers can carry at the target utilisation', '2x'],
  ]) derived(`bridge-${key}`, `capacity_bridge.${key}`, format, `Reviewer bridge: ${what}`, 'asm-reviewer-fte', { side });
  for (const [metric, label, format] of [['total_cost', 'total cost a year', 'usd0'], ['cost_per_asset', 'cost per approved asset', 'usd2']]) {
    for (const [key, what, fmt] of [['scale_effect', 'change from scale alone', format], ['programme_effect', 'change from the programme', format], ['scale_share', 'share of the change that scale alone explains', 'pct0']]) {
      derived(`effects-${metric}-${key}`, `effects.${metric}.${key}`, fmt, `Scale versus programme: ${label}, ${what}`, 'asm-variant-cost', { side: '2x' });
    }
  }

  // Scenarios A (hold the people), B (remove the capacity), C (absorb the demand).
  // Code review WR-01: each figure links the register row that drives its weakest grade,
  // measured by moving each Speculative engine row in turn: adoption (which scales every
  // programme effect) for most figures, the platform team for run cost, first-year
  // realisation for the year-one net, severance for the one-off cost, and the funded
  // share for the avoided cost against growing without the programme.
  const SPEC = { grade: 'Speculative' };
  const ADOPT = 'asm-adoption-rate';
  const scen = (k, key, path, format, what, ref, opts = {}) => econ(`scen-${k}-${key}`, `scenarios.${k}.${path}`, format, `Scenario ${k}: ${what}`, ref, { side: '2x', ...opts });
  scen('A', 'net', 'net', 'usd0', 'net cash effect against today a year', ADOPT, SPEC);
  scen('A', 'run_cost', 'run_cost.total', 'usd0', 'run cost a year', 'asm-platform-team', SPEC);
  scen('A', 'implied_agency_growth', 'agency.implied_growth', 'usd0', 'extra agency spend the output rise needs, a year', ADOPT, SPEC);
  scen('B', 'net', 'net', 'usd0', 'net cash effect against today a year', ADOPT, SPEC);
  scen('B', 'run_cost', 'run_cost.total', 'usd0', 'run cost a year', 'asm-platform-team', SPEC);
  scen('B', 'removable_fte', 'labour.removable_fte', 'num1', 'people removable at the same output (FTE)', ADOPT, SPEC);
  scen('B', 'labour_saving', 'labour.saving', 'usd0', 'labour saving a year', ADOPT, SPEC);
  scen('B', 'agency_saving', 'agency.saving', 'usd0', 'agency saving a year', ADOPT, SPEC);
  scen('B', 'year1_net', 'year1_net', 'usd0', 'net cash effect in year one', 'asm-year1-realisation', SPEC);
  scen('B', 'one_off', 'one_off.total', 'usd0', 'one-off cost including severance', 'asm-severance-months', SPEC);
  scen('B', 'payback_simple', 'payback_simple', 'years1', 'simple cash payback', ADOPT, SPEC);
  scen('B', 'payback_ramped', 'payback_ramped', 'years1', 'cash payback with the year-one ramp', ADOPT, SPEC);
  scen('C', 'net', 'net', 'usd0', 'net cash effect against today a year (spend rises)', ADOPT, SPEC);
  scen('C', 'run_cost', 'run_cost.total', 'usd0', 'run cost a year', 'asm-platform-team', SPEC);
  scen('C', 'hires_with', 'labour.hires_with', 'num1', 'hires needed with the programme (FTE)', ADOPT, SPEC);
  scen('C', 'hires_without', 'labour.hires_without', 'num1', 'hires needed without the programme (FTE)', 'asm-demand-multiplier');
  scen('C', 'avoided_hires', 'labour.avoided_hires', 'num1', 'hires avoided against growing without the programme (FTE)', ADOPT, SPEC);
  scen('C', 'avoided_cost', 'avoided_cost', 'usd0', 'cost avoided against growing without the programme, a year', 'asm-counterfactual-funded', SPEC);
  scen('C', 'net_avoided', 'net_avoided', 'usd0', 'cost avoided against growing without the programme, net of run cost, a year (not cash against today)', 'asm-counterfactual-funded', SPEC);
  scen('C', 'versus_today', 'versus_today', 'usd0', 'spend versus today after absorbing the demand', ADOPT, SPEC);
  scen('C', 'payback_avoided', 'payback_avoided', 'years1', 'payback on the cost avoided against growing without the programme (not a cash payback)', 'asm-counterfactual-funded', SPEC);
  scen('C', 'agency_avoided', 'agency.avoided', 'usd0', 'agency spend avoided against growing without the programme', ADOPT, SPEC);

  // Released-capacity reconciliation (ECON-02), portfolio scope, in FTE. Slack at baseline
  // and the capacity the programme releases are the same under every scenario, so they are
  // read once; where the capacity goes differs by scenario. The hours figure is the same
  // release in hours a year. All share one register row so a table row can carry one chip.
  econ('recon-slack0', 'reconciliation.B.slack0', 'num1', 'Reconciliation: capacity already unused at baseline, in FTE', 'asm-reviewer-fte', { side: 'baseline' });
  econ('recon-released', 'reconciliation.B.released', 'num1', 'Reconciliation: capacity the programme releases from existing work, in FTE', ADOPT, { side: '2x', ...SPEC });
  econ('recon-released_hours', 'pool_totals.total_released_hours', 'int', 'Reconciliation: hours of existing work the programme eliminates a year', ADOPT, { side: '2x', ...SPEC });
  for (const k of ['A', 'B', 'C']) {
    for (const [key, what] of [['redeployed', 'capacity redeployed into additional work'], ['removed', 'capacity removed as headcount'], ['hires', 'hires needed for the extra work'], ['unused', 'capacity left unused'], ['gap', 'unreconciled difference']]) {
      econ(`recon-${k}-${key}`, `reconciliation.${k}.${key}`, 'num1', `Reconciliation, scenario ${k}: ${what}, in FTE`, ADOPT, { side: '2x', ...SPEC });
    }
  }

  // Investment: one-off and the run-cost lines (shown for scenario B).
  const inv = (key, path, what, ref, opts) => econ(`inv-${key}`, path, 'usd0', `Investment: ${what}`, ref, { side: '2x', ...opts });
  inv('build', 'investment.one_off.build', 'one-off build cost', 'asm-build-cost');
  inv('change', 'investment.one_off.change', 'one-off change management cost', 'asm-change-mgmt');
  inv('severance_B', 'investment.one_off.severance_B', 'severance if scenario B removes the capacity', 'asm-severance-months', SPEC);
  inv('platform_team', 'investment.run.B.platform_team', 'platform team, a year', 'asm-platform-team');
  inv('platform_tooling', 'investment.run.B.platform_tooling', 'platform tooling, a year', 'asm-tooling');
  inv('autonomy_overhead', 'investment.run.B.autonomy_overhead', 'review overhead of autonomous workflows, a year', 'asm-autonomy-overhead');
  // Inference is priced from the sourced token prices, but the per-workflow run profiles
  // (steps, tokens, retries) are programme hypotheses; W7's profile drives the most.
  inv('inference', 'investment.run.B.inference', 'model inference, a year', 'asm-wf-w7-agent', SPEC);
  inv('variant_ai', 'investment.run.B.variant_ai', 'AI cost of derived variants, a year', 'asm-variant-cost');
  inv('escape', 'investment.run.B.escape', 'cost of defects that escape review, a year', 'asm-escape-rate', SPEC);

  // Primary metric and maximum multipliers.
  // Code review WR-02: each multiple links the input that drives its grade, not the agency
  // cost row: adoption for the programme multiples, traffic for the uniform limit.
  const met = (key, path, what, ref = ADOPT, opts = SPEC) => econ(`metric-${key}`, `metric.${path}`, 'x2', `Output multiple: ${what}`, ref, { side: '2x', ...opts });
  met('org_before_platform', 'A.org_before_platform', 'organisation-wide, before the platform team');
  met('org_after_platform', 'A.org_after_platform', 'organisation-wide, after the platform team');
  met('portfolio_before_platform', 'A.portfolio_before_platform', 'delegated workflows, before the platform team');
  met('portfolio_after_platform', 'A.portfolio_after_platform', 'delegated workflows, after the platform team');
  met('pilot_before_platform', 'A.pilot_before_platform', 'pilot workflows, before the platform team');
  met('pilot_after_platform', 'A.pilot_after_platform', 'pilot workflows, after the whole platform team');
  met('B_org', 'B.org', 'organisation-wide under scenario B');
  met('C_org', 'C.org', 'organisation-wide under scenario C');
  met('pooled_hours_multiple', 'pooled_hours_multiple', 'capacity multiple from pooling the released hours');
  met('max_uniform_multiplier', 'max_uniform_multiplier', 'the multiple every workflow can carry at once', 'asm-traffic-growth', {});
  for (const id of WORKFLOW_IDS) {
    // W5 is bound by reviewer capacity under the adoption-scaled gate; W8 by traffic.
    const ref = id === 'W5' ? ADOPT : id === 'W8' ? 'asm-traffic-growth' : `${asmFor(id)}-agent`;
    econ(`max-${id}`, `max_multipliers.per_pool.${id}.multiple`, 'x2', `Largest output multiple for ${id} ${names[id]}`, ref, { side: '2x', ...(id === 'W8' ? {} : SPEC) });
  }
  econ('max-uniform', 'max_multipliers.uniform.value', 'x2', 'Largest output multiple every workflow can carry at once', 'asm-traffic-growth', { side: '2x' });
  // Setting traffic aside, creative production (W3) binds.
  econ('max-uniform-excl-traffic', 'max_multipliers.uniform_excluding_traffic.value', 'x2', 'Largest output multiple every workflow can carry at once, excluding traffic-capped work', 'asm-wf-w3-agent', { side: '2x', ...SPEC });

  // Sensitivity (each cell is a re-run of economics() with one input moved).
  // Each cell links the input it moves (WR-02: review overhead moves the multiple through
  // the overhead share, not the W5 sampling rate). The inference price row is Modelled,
  // but its cells are Speculative through the programme effects, so they link adoption,
  // the input that drives their grade.
  const SENS = { adoption: [ADOPT, 'adoption'], escape: ['asm-escape-rate', 'escape rate'], inference: [ADOPT, 'inference price'], review_overhead: ['asm-overhead-share', 'review overhead'] };
  bundle.sensitivity.rows.forEach((row, i) => {
    const [ref, label] = SENS[row.id];
    for (const end of ['low', 'high']) {
      for (const [cellKey, format, what] of [['org_A_after', 'x2', 'organisation-wide output multiple'], ['net_B', 'usd0', 'scenario B net cash effect a year']]) {
        econ(`sens-${row.id}-${end}-${cellKey}`, `sensitivity.rows.${i}.${end}.${cellKey}`, format, `Sensitivity, ${label} ${end}: ${what}`, ref, { side: '2x', ...SPEC });
      }
    }
  });

  // Funding check for the production cost rise.
  const fund = (key, format, what) => econ(`funding-${key}`, `funding.${key}`, format, `Funding check: ${what}`, 'asm-reallocation', { side: '2x' });
  fund('slice_cash_rise', 'usd0', 'rise in external production cash spend');
  fund('reducible_agency', 'usd0', 'agency spend that could be cut at today\'s output (scenario B)');
  fund('agency_change_at_volume', 'usd0', 'change in agency spend at the higher volume');
  fund('netted_inside_delta', 'usd0', 'cheaper-variant saving already inside the rise');
  fund('coverage', 'x1', 'times the agency spend released at the higher volume covers the rise');
  return out;
}
Object.assign(claims, engineClaims(engineContext()));
// ---- end Phase 6: engine claims ----

// ---- Phase 7: Intercom sources and claims (claims) ----
// Company-reported results from Intercom's own posts, shown in #autonomy. Each is
// Modelled with the company-reported flag (legend rule), observed evidence, and refs
// the primary post it came from. None is a marketing result.
{
  const ic = (id, value, display, unit, ref) => {
    claims[id] = { id, value, unit: `${unit}, company-reported by Intercom about its engineering organisation`, display, grade: 'Modelled', flag: 'company-reported', ref };
  };
  const S2 = 'src-fin-2x-nine-months';
  ic('ic-prs-per-head-multiple', 2, '2x', 'Merged pull requests per person in R&D against the 12-month goal, as reported in April 2026', S2);
  ic('ic-defect-backlog-fall',-0.54, '−54%', 'Change in a core product defect backlog since the start of 2026', S2);
  ic('ic-downtime-fall',-0.35, '−35%', 'Change in downtime attributed to breaking code changes over 11 months, while deployments doubled', S2);
  ic('ic-agent-driven-pr-share', 0.936, '93.6%', 'Share of pull requests driven by a coding agent in April 2026', S2);
  ic('ic-ai-approved-share', 0.192, '19.2%', 'Share of merged pull requests approved by an AI reviewer with no human reviewer, a few weeks after launch', S2);
  ic('ic-auto-approved-median-merge-min', 14.6, '14.6 minutes', 'Median time to merge for auto-approved pull requests', S2);
  ic('ic-org-median-merge-min', 75.8, '75.8 minutes', 'Median time to merge across the whole organisation', S2);
  ic('ic-auto-approved-small-share', 0.86, '86%', 'Share of auto-approved pull requests that change 20 lines or fewer', S2);
  ic('ic-plugin-skills', 267, '267', 'Skills in the shared plugin repository', S2);
  ic('ic-plugin-contributors', 153, '153', 'Contributors to the shared plugin repository (31% of R&D by the same post)', S2);
  ic('ic-infra-team-size', 8, '8', 'People maintaining the frontend AI infrastructure', 'src-fin-eight-people');
  ic('ic-infra-builders', 450, 'about 450', 'Engineers who have shipped frontend code using that infrastructure', 'src-fin-eight-people');
}
// ---- end Phase 7: Intercom claims ----

// ---- Evidence classes for assumptions and claims (EVID-01) ----
// Nothing is observed for the subject organisation, so no assumption is 'observed'.
// Programme effects and designs to validate in a pilot are hypotheses; every other
// assumption describes the illustrative company.
const HYPOTHESIS_ASSUMPTIONS = new Set([
  'asm-tier-mix', 'asm-auto-approval', 'asm-variant-cost', 'asm-tooling', 'asm-ai-share-variant', 'asm-ai-share-tooling', 'asm-build-days',
  'asm-tier-range-t0', 'asm-tier-range-t1', 'asm-tier-range-t2', 'asm-tier-range-t3', 'asm-reallocation', 'asm-flat-marketing-headcount',
  'asm-review-agent-design', 'asm-harness-design', 'asm-telemetry-metrics', 'asm-fatigue-controls', 'asm-adoption-design',
  'asm-risk-likelihood', 'asm-backlog0-days', 'asm-sampling-rate', 'asm-escalation-rate',
  'asm-lever-01-evidence', 'asm-lever-02-evidence', 'asm-lever-03-evidence', 'asm-lever-04-evidence', 'asm-lever-05-evidence', 'asm-lever-06-evidence',
  'asm-growth-route',
  // Code review WR-03: a cost that exists only because of the programme, and a rate
  // used only to project incidents at 2x, describe programme effects.
  'asm-change-mgmt', 'asm-incident-rate',
]);
for (const asm of Object.values(assumptions)) {
  // Engine rows carry their own evidence (set where they are defined).
  if (asm.evidence === undefined) asm.evidence = HYPOTHESIS_ASSUMPTIONS.has(asm.id) ? 'hypothesis' : 'illustrative';
}
// Per-side evidence (ECON-12): an assumption's baseline value describes the company today
// (illustrative); its 2x value is the programme effect (hypothesis). The register cell
// shows the weakest class, so `evidence` stays 'hypothesis'.
const isPerSide = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && 'baseline' in v && 'scaled' in v;
for (const asm of Object.values(assumptions)) {
  if (asm.kind === 'model' && asm.evidence === 'hypothesis' && isPerSide(asm.value)) asm.evidence_sides = { baseline: 'illustrative', scaled: 'hypothesis' };
}

// A claim takes the weakest class of everything it depends on (CONTEXT: derived
// claims inherit the weakest class of their inputs), and anything computed at the
// 2x scenario or stating a change from baseline to 2x is at most a hypothesis.
//
// Inputs are traced, not guessed from ids: each compute() input, model assumption
// and fixed calculator figure is moved in turn, the model is re-run, and every
// figure that changes depends on it. The 2x multiplier is traced the same way and
// counts as a hypothesis, because doubling is itself the programme effect. Figures
// built outside the model list their inputs in `inputs`; the side is '2x' when the
// figure was built on the 2x side (`side`) or its compute() path is not a
// `baseline.` path. Each claim exposes the ids it depends on as `inputs`.
//
// The trace re-runs the presenter about fifty times and the economics engine (with
// its sensitivity grid) about a hundred times, one variant per v1 input, model
// assumption and engine row, so it runs on the first read of a claim's `evidence`,
// `inputs` or (for generated econ-* claims) `grade`, never on page load. Engine rows
// are moved whole: every numeric leaf is nudged at once (levels and step
// counts step by one so they stay valid integers).
{
  const RANK = { hypothesis: 0, illustrative: 1, observed: 2, benchmark: 3 };
  const MULTIPLIER = 'scenario-multiplier';
  const nudge = (v) => {
    if (typeof v === 'number') return v === 0 ? 0.01 : v * 0.9;
    // Tier mixes must still sum to one: move two points from T0 to T2.
    if (Array.isArray(v)) return v.map((x, i) => (i === 0 ? x - 0.02 : i === 2 ? x + 0.02 : x));
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, nudge(x)]));
  };
  // Whole-number fields step by one so the moved row stays valid (IN-03 validates the chain).
  const STEPPED = new Set(['level', 'steps', 'steps_between_gates', 'retries']);
  const nudgeEngine = (v, key = '') => {
    if (typeof v === 'number') return STEPPED.has(key) ? (v > 1 ? v - 1 : v + 1) : v === 0 ? 0.01 : v * 0.9;
    if (Array.isArray(v)) return v.map((x) => nudgeEngine(x, key));
    if (v !== null && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, nudgeEngine(x, k)]));
    return v;
  };
  const derivedValue = (c, ctx) => {
    const o = c.override;
    const inputs = o ? { ...ctx.inputs, multiplier: o.multiplier } : ctx.inputs;
    const a = o ? { ...ctx.assumptions, auto_approval_share: { baseline: o.auto_approval_share, scaled: o.auto_approval_share } } : ctx.assumptions;
    const r = compute(inputs, a);
    if (!r.ok) throw new Error(`evidence trace: ${c.id} has no value under a moved input`);
    return c.derived.split('.').reduce((x, k) => x[k], r);
  };
  const differs = (x, y) => (typeof x === 'number' && typeof y === 'number' ? Math.abs(x - y) > 1e-9 * Math.max(1, Math.abs(x)) : x !== y);

  function trace() {
    const base = modelContext();
    const variants = [[MULTIPLIER, { ...base, inputs: { ...base.inputs, multiplier: base.inputs.multiplier * 1.25 } }]];
    const engineVariants = [];
    for (const asm of Object.values(assumptions)) {
      if (asm.kind === 'input') variants.push([asm.id, { ...base, inputs: { ...base.inputs, [asm.key]: nudge(asm.value) } }]);
      if (asm.kind === 'engine') {
        const values = engineValues();
        // The portfolio id list and the chain-success rule are structural; only numbers move.
        values[asm.key] = nudgeEngine(values[asm.key]);
        engineVariants.push([asm.id, base, values]);
      }
      if (asm.kind === 'model' && asm.evidence_sides) {
        // Per-side evidence: move one side at a time so each side is attributed on its own.
        for (const side of ['baseline', 'scaled']) {
          variants.push([`${asm.id}#${side}`, { ...base, assumptions: { ...base.assumptions, [asm.key]: { ...asm.value, [side]: nudge(asm.value[side]) } } }]);
        }
      } else if (asm.kind === 'model') {
        // The route share must stay one of the route radios.
        const moved = asm.key === 'campaign_growth_share' ? Object.values(ROUTE_SHARE).find((x) => x !== asm.value) : nudge(asm.value);
        variants.push([asm.id, { ...base, assumptions: { ...base.assumptions, [asm.key]: moved } }]);
      }
    }
    // Both hourly prices are derived from the loaded cost, so they move with it.
    const loadedFactor = nudge(base.fixed.loaded_fte_cost) / base.fixed.loaded_fte_cost;
    variants.push(['asm-loaded-fte-cost', { ...base, fixed: { ...base.fixed, loaded_fte_cost: nudge(base.fixed.loaded_fte_cost) },
      assumptions: { ...base.assumptions,
        reviewer_rate_per_hour: base.assumptions.reviewer_rate_per_hour * loadedFactor,
        marketer_rate_per_hour: base.assumptions.marketer_rate_per_hour * loadedFactor } }]);
    variants.push(['asm-change-mgmt', { ...base, fixed: { ...base.fixed, change_cost_per_fte: nudge(base.fixed.change_cost_per_fte) } }]);

    // Compare against the unmoved model output: derived claims store rounded values.
    const modelled = Object.values(claims).filter((c) => c.derived || c.calc || c.econ);
    const valueIn = (c, ctx, presented, bundle) => {
      if (c.econ) return pathIn(bundle, c.econ);
      return c.derived ? derivedValue(c, ctx) : presented[c.id]?.value;
    };
    const bundleOf = (ctx, values) => econBundle(engineContext(ctx, values));
    const presentedBase = presenterClaims(base);
    const bundleBase = bundleOf(base);
    const unmoved = new Map(modelled.map((c) => [c.id, valueIn(c, base, presentedBase, bundleBase)]));
    const traced = new Map(modelled.map((c) => [c.id, []]));
    // v1 variants move the presenter and, through engineContext(ctx), the engine;
    // engine variants move one engine row and leave the v1 presenter alone.
    for (const [id, ctx, values] of [...variants, ...engineVariants]) {
      const presented = values ? presentedBase : presenterClaims(ctx);
      const bundle = bundleOf(ctx, values);
      for (const c of modelled) {
        if (values && !c.econ) continue;
        if (differs(valueIn(c, ctx, presented, bundle), unmoved.get(c.id))) traced.get(c.id).push(id);
      }
    }

    const result = new Map();
    const classOf = (id) => {
      if (id === MULTIPLIER) return 'hypothesis';
      if (id.startsWith('src-')) return sources[id.slice(4)].evidence;
      if (id.includes('#')) {
        const [base, side] = id.split('#');
        return assumptions[base].evidence_sides[side];
      }
      if (assumptions[id]) return assumptions[id].evidence;
      return resolve(claims[id]).evidence;
    };
    function resolve(c) {
      if (result.has(c.id)) return result.get(c.id);
      const inputs = [...new Set([...(declared.get(c.id) ?? []), ...(traced.get(c.id) ?? [])])];
      const twoX = c.side === '2x' || (c.side !== 'baseline' && c.derived !== undefined && !c.derived.startsWith('baseline.'));
      // A per-side ref is read on the side the claim is built on: baseline unless 2x.
      const refAsm = assumptions[c.ref];
      let evidence = refAsm?.evidence_sides ? refAsm.evidence_sides[twoX ? 'scaled' : 'baseline'] : classOf(c.ref);
      for (const id of [...inputs, ...(twoX ? [MULTIPLIER] : [])]) {
        const e = classOf(id);
        if (RANK[e] < RANK[evidence]) evidence = e;
      }
      const out = { evidence, inputs };
      result.set(c.id, out);
      return out;
    }
    for (const c of Object.values(claims)) resolve(c);
    return result;
  }

  let traced = null;
  const get = (c, field) => {
    if (traced === null) traced = trace();
    return traced.get(c.id)[field];
  };
  const declared = new Map();
  for (const c of Object.values(claims)) {
    declared.set(c.id, c.inputs ?? []);
    delete c.inputs;
    Object.defineProperty(c, 'evidence', { get: () => get(c, 'evidence'), enumerable: true, configurable: true });
    Object.defineProperty(c, 'inputs', { get: () => get(c, 'inputs'), enumerable: true, configurable: true });
    if (c.econ || c.id.startsWith('econ-')) {
      // A generated figure is no stronger than the weakest grade among the inputs it
      // depends on (a Modelled total that moves with a Speculative escape rate is Speculative).
      const own = c.grade;
      const WEAK = { Benchmark: 2, Modelled: 1, Speculative: 0 };
      Object.defineProperty(c, 'grade', {
        get: () => get(c, 'inputs').reduce((g, id) => {
          const x = assumptions[id.split('#')[0]]?.grade;
          return x in WEAK && WEAK[x] < WEAK[g] ? x : g;
        }, own),
        enumerable: true, configurable: true,
      });
    }
  }
}
