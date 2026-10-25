// Single source of numbers, grades, sources and assumptions (CRED-06).
// The page's data-fig spans, the register rows and compute() all read from here.
import { variantMatrix, compute } from './calc.js';
import { formatValue } from './format.js';
import { present, defaultValues, RESULT_ROWS } from './model.js';

export const GRADES = ['Benchmark', 'Modelled', 'Speculative'];
export const FLAGS = ['vendor-claimed', 'company-reported'];
// Evidence class is a second axis, orthogonal to grade (EVID-01). observed = measured
// results reported by a named organisation; benchmark = a published reference;
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
    flag: null,
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

// Source evidence: a flag means a named organisation reports its own results (observed);
// press incident reports are observed events; everything else is a published reference.
for (const [key, src] of Object.entries(sources)) {
  src.evidence = src.flag || key.startsWith('incident-') ? 'observed' : 'benchmark';
}

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
    'A modelled team size for the subject organisation; there is no published source. The headline has no per-head denominator: marketing FTE feeds only the one-off change cost in the headcount scenarios. Holding it flat is an assumption, not a modelled result (see asm-flat-marketing-headcount).'),
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
    ['concepts-base', 1000, 'baseline.concepts', 'asm-concepts-per-campaign', 'unique concepts a year'],
    ['concepts-scaled', 1414, 'scenario.concepts', 'asm-concepts-per-campaign', 'unique concepts a year'],
  ].map(([id, value, derived, ref, unit]) => [id, {
    id, value, unit, display: formatValue(value, 'int'), grade: 'Modelled', flag: null, ref, derived, decimals: 0, format: 'int',
  }])),
  ...Object.fromEntries([
    ['cm-base', 50, 'baseline.campaign_markets_per_quarter', 'asm-markets', 'campaign-markets launched per quarter: one campaign launched in one market counts once', 0, 'int'],
    ['cm-scaled', 100, 'scenario.campaign_markets_per_quarter', 'asm-markets', 'campaign-markets launched per quarter: one campaign launched in one market counts once', 0, 'int'],
    ['btl-base', 11.8, 'baseline.brief_to_live_days', 'asm-build-days', 'brief-to-live time, days', 1, 'days1'],
    ['btl-scaled', 7.5, 'scenario.brief_to_live_days', 'asm-build-days', 'brief-to-live time, days', 1, 'days1'],
    ['cpcm-base', 12943, 'baseline.cost_per_campaign_market', 'asm-master-concept-cost', 'USD production cost per campaign-market', 0, 'usd0'],
    ['cpcm-scaled', 9052, 'scenario.cost_per_campaign_market', 'asm-master-concept-cost', 'USD production cost per campaign-market', 0, 'usd0'],
    ['cpcm-change', -0.3, 'ratios.cost_per_campaign_market_change', 'asm-master-concept-cost', 'change in production cost per campaign-market', 2, 'pctchg0'],
    ['cpa-base', 64.71, 'baseline.cost_per_asset', 'asm-variant-cost', 'USD per approved asset', 2, 'usd2'],
    ['cpa-scaled', 45.26, 'scenario.cost_per_asset', 'asm-variant-cost', 'USD per approved asset', 2, 'usd2'],
    ['cpa-change', -0.3, 'ratios.cost_per_asset_change', 'asm-variant-cost', 'change in cost per approved asset', 2, 'pctchg0'],
    ['total-cost-base', 2588589, 'baseline.cost.total', 'asm-variant-cost', 'USD per year', 0, 'usdm2'],
    ['total-cost-scaled', 3620631, 'scenario.cost.total', 'asm-variant-cost', 'USD per year', 0, 'usdm2'],
    ['total-cost-delta', 1032041, 'deltas.total_cost', 'asm-variant-cost', 'USD per year, 2x minus baseline', 0, 'usdm2'],
    ['total-cost-change', 0.4, 'ratios.total_cost_change', 'asm-variant-cost', 'change in production-attributable cost', 2, 'pctchg0'],
    ['budget-share-delta', 0.013, 'deltas.production_share_of_budget', 'asm-marketing-budget', 'percentage points of marketing budget', 3, 'pts1'],
    ['budget-share-base', 0.033, 'baseline.production_share_of_budget', 'asm-marketing-budget', 'share of marketing budget', 3, 'pct1'],
    ['budget-share-scaled', 0.046, 'scenario.production_share_of_budget', 'asm-marketing-budget', 'share of marketing budget', 3, 'pct1'],
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
    ['generation', 'asm-variant-cost', { base: 34.21, scaled: 22.06 }],
    ['review', 'asm-review-minutes', { base: 17.26, scaled: 9.68 }],
    ['rework', 'asm-rework-rate', { base: 3.22, scaled: 1.58 }],
    ['tooling', 'asm-tooling', { base: 3.75, scaled: 7.5 }],
    ['rights', 'asm-rights-per-concept', { base: 6.25, scaled: 4.42 }],
    ['storage', 'asm-storage-per-variant', { base: 0.02, scaled: 0.02 }],
  ].map(([comp, ref, vals]) => {
    const id = `cpa-${comp}-${side}`;
    return [id, {
      id, value: vals[side], unit: `USD per approved asset, ${comp}`, display: formatValue(vals[side], 'usd2'),
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
};

// Winners a quarter (s10): the test cadence times the lowest and highest reported
// win rates, read from the assumption and the claims rather than repeated as literals.
{
  const cadence = assumptions['asm-tests-per-quarter'].value;
  for (const [id, rateId, unit] of [
    ['tests-winners-lo', 'winrate-second-hand', 'winners a quarter at the lowest reported rate'],
    ['tests-winners-hi', 'winrate-paper', 'winners a quarter at the highest reported rate'],
  ]) {
    const value = Math.round(cadence * claims[rateId].value);
    claims[id] = { id, value, unit, display: String(value), grade: 'Modelled', flag: null, ref: 'asm-tests-per-quarter' };
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
  // CR-02: the matrix counts derived variants before the gate. Approved is
  // that count at the approval yield, the same yield s01 uses for the headline.
  const approved = r.total * assumptions['asm-approval-yield'].value;
  claims['matrix-approved'] = { id: 'matrix-approved', value: approved, unit: 'approved variants in the worked campaign, at the approval yield',
    display: formatValue(approved, 'int'), grade: 'Modelled', flag: null, ref: 'asm-approval-yield', format: 'int' };
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
  put('cap-1x-variants', 40000, 'derived variants a year at 1x: internal throughput, not the claim', 'baseline.variants_per_year', 0, 'int', { multiplier: 1, auto_approval_share: 0.2 }, 'asm-formats-per-market');
  put('cap-2x-variants', 80000, 'derived variants a year at 2x: internal throughput, not the claim', 'scenario.variants_per_year', 0, 'int', { multiplier: 2, auto_approval_share: 0.6 }, 'asm-formats-per-market');
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
  // The s11 note quotes Hold's production cost change at the page defaults, so the
  // sentence is scoped to the defaults and its number comes from the presenter.
  {
    const hold = present({ ...defaultValues(ctx), scenario: 'hold' }, ctx).scenario;
    const row = hold.rows.find((r) => r.id === 'production_cost_change');
    const id = 'calc-scen-hold-production_cost_change';
    claims[id] = {
      id, value: row.value, unit: `Headcount scenario ${hold.name} at the page defaults: ${row.label}`, display: row.text, grade: row.grade, flag: null,
      ref: row.ref, calc: 'scenarioHold.rows.production_cost_change',
    };
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
  // Show the maths and What you must believe: every figure shares its item's grade and register row.
  const figClaim = (fig, node, unit, grade, ref, calc) => {
    if (node.value !== undefined) claims[fig] = { id: fig, value: node.value, unit, display: node.text, grade, flag: null, ref, calc };
  };
  for (const m of p.maths) {
    for (const part of [...m.parts, m.result]) {
      if (part.fig) figClaim(part.fig, part, `Show the maths, ${m.name}`, m.grade, m.ref, `maths.${m.id}.${part.fig.split('-').pop()}`);
    }
  }
  for (const b of p.believe) {
    for (const part of b.parts) {
      if (part.fig) figClaim(part.fig, part, `What you must believe: ${b.statement}`, b.grade, b.ref, `believe.${b.key}.${part.fig.endsWith('-swing') ? 'swing' : 'value'}`);
    }
  }
}

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
]);
for (const asm of Object.values(assumptions)) {
  asm.evidence = HYPOTHESIS_ASSUMPTIONS.has(asm.id) ? 'hypothesis' : 'illustrative';
}

// A claim takes the weakest class of its inputs; anything on the 2x side of the model
// is at most a hypothesis, even when its input is company-reported.
{
  const RANK = { hypothesis: 0, illustrative: 1, observed: 2, benchmark: 3 };
  const weakest = (x, y) => (RANK[x] <= RANK[y] ? x : y);
  const twoXSide = (c) => c.id.endsWith('-scaled') || (c.derived ?? '').startsWith('scenario.') ||
    /scaled|change|scenario|sensitivity/.test(c.calc ?? '') || c.id.startsWith('calc-scen') || c.id.startsWith('calc-sens');
  for (const c of Object.values(claims)) {
    const base = c.ref.startsWith('src-') ? sources[c.ref.slice(4)].evidence : assumptions[c.ref].evidence;
    c.evidence = twoXSide(c) ? weakest(base, 'hypothesis') : base;
  }
}
