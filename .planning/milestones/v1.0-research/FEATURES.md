# Feature Landscape

**Domain:** Evidence-graded "CMO 2x" web page: content levers and evidence base for an AI-driven doubling of enterprise marketing output
**Researched:** 2026-10-24
**Overall confidence:** MEDIUM-LOW on benchmarks (many primary documents were paywalled, blocked, or timed out; most figures were verified only through secondary coverage), HIGH on page-structure recommendations.

## Read this first: the evidence base is thin, and that is the finding

Marketing has no public equivalent of Intercom's merged-PRs-per-head data. Across the searches:

- **No independent, public "assets per marketer" or "cost per asset" benchmark** was found for large brands. Every cost-per-asset or cycle-time figure is company-reported (Klarna, Unilever) or vendor-reported (localisation vendors, DAM vendors).
- **Gartner and Forrester primary documents were mostly unreachable** (403, timeouts). Gartner's CMO Spend Survey press release was verified only through search summaries. No Gartner or Forrester "content supply chain" quantification was found. The "content supply chain" literature is dominated by Adobe-sponsored work, which the page must flag as vendor-biased.
- **Approval cycle times, rounds of review, rights-incident costs, brand-compliance rates, MMM refresh effort, and analyst hours: no credible public benchmark found.** These are marked GAP below. The calculator should take them as user inputs, and the page should grade defaults as Modelled or Speculative.
- Consequence for the page: the honest design is "few Benchmark-graded anchors, many Modelled numbers with visible assumptions, and an explicit evidence-gaps section". The gaps section is itself a differentiator with a sceptical CFO.

Grade scale used in the register: **B** = Benchmark (public source), **M** = Modelled (stated assumptions), **S** = Speculative. A "B" proposed here means the figure is public; where I could only reach a secondary source I say so and recommend the author re-verify the primary before publishing.

---

## Table Stakes

Missing any of these and the CMO or CFO dismisses the page.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| T1. Single defined output metric, with a denominator that resists gaming | Core of the Intercom analogue. Recommended: **approved-and-live asset-variants per marketing head per quarter** (all marketing headcount including brand, ops and regional, as in Intercom's all-R&D denominator), counting only assets that cleared the review gate and shipped. Report beside it **cost per approved live asset** and **brief-to-live median days**. | Med | Never count generated or drafted assets. Counting only gate-cleared, live assets is the anti-Goodhart device. Define "asset" (a unique creative x size x locale x audience cell?) explicitly, and show a "unique concepts" count beside it so variant inflation is visible. |
| T2. Outcome metrics paired with the output metric (counter-metrics) | CFO will ask "so what". Pair with: incremental conversion or CAC/ROAS from holdout tests, brand-compliance first-pass rate, rejection/rework rate, rights incidents, experiments per quarter. | Med | See metric table below. Outcomes must be measured by experiment or holdout, not platform-reported attribution. |
| T3. Grade on every number plus a "how to read the grades" key | Project constraint. Grades must be visible inline (badge), not just in an appendix. | Low | Grade definitions: B = public source, link and date; M = formula and assumptions shown; S = author judgement, treat as a lead. |
| T4. Visible baseline-vs-2x arithmetic for 10,000+ asset campaigns | The "10,000" claim must be derivable: sizes x channels x locales x audiences x tests. | Med | All inputs are reader-editable in the calculator. Default values are Modelled. No public source gives typical variant counts; do not cite one. |
| T5. CFO answer: cost per asset falls while AI spend rises | Direct requirement. Show unit economics: AI spend is a floor to enable use, not a KPI. | Med | Anchor on Gartner: marketing budgets flat at 7.7% of revenue in 2025 and 7.8% in 2026, so 2x output has to come from flat budgets. Caveat: Klarna and Unilever savings figures are company claims (see register). |
| T6. Governance spine: brand/legal/rights review agent, tiered auto-approval, ground-truth eval harness | Project centrepiece. Without it, 2x output means 2x risk. | High | Describe the tiers (auto-approve, sample-audited, human-required) by risk class: e.g. resize and localise of an approved master (low) vs new claims, regulated categories, people imagery (high). No public benchmark exists for auto-approval rates in marketing. All rates Modelled or Speculative. |
| T7. Honest "what goes wrong": slop, brand dilution, rights/IP exposure, Goodhart, reviewer fatigue, AI-disclosure penalty | A sceptical CMO needs this to trust the page. | Med | Cite the one solid counter-signal found: labelled AI ads lost 31.5% of clicks in the NYU/Emory study (see register). |
| T8. Source register with date, URL, credibility note, vendor-bias flag | Project requirement. Vendor-published studies (Adobe, localisation vendors, Optimizely, Claritas) must be flagged. | Low | Use the benchmark register below as the seed. |
| T9. Evidence-gaps section | Required, and the gaps here are large (see Gaps list). | Low | List explicitly what the author could not find. |
| T10. Per-lever page blocks, each with output metric, how AI changes throughput, outcome argument, benchmarks | Matches the brief. Levers: content generation (deep), localisation, experimentation, insight/reporting, ops. | Med | Template per lever is in "Lever-by-lever findings" below. |

### Outcome and output metric set (recommended)

| Dimension | Output / leading metric | Outcome metric (what must not get worse or must improve) | Measurement guard |
|-----------|-------------------------|-----------------------------------------------------------|-------------------|
| Revenue/pipeline | Approved live variants per head | Incremental conversion rate, CAC, ROAS measured by holdout or geo-test; MMM-implied marginal ROI | Report on holdout lift, not platform attribution. |
| Speed | Brief-to-live median days; market launch lag (global master to last locale) | Share of campaigns launched on planned date | Use median and P90, not mean. |
| Quality/brand | Auto-approval share by tier | First-pass brand/legal compliance rate; rejection rate; rights incidents per 1,000 assets; post-publish takedown rate | Sample-audit auto-approved assets against human ground truth (eval harness). |
| Learning | Experiments per quarter | Conclusive-test rate; share of winners rolled out; time from creative fatigue signal to replacement | Pre-register primary metric (win rates swing 12% to 36% depending on definition, see register). |
| Efficiency | Cost per approved live asset | Total marketing cost as % revenue (Gartner anchor) | AI spend reported as a floor, never as a target. |

---

## Differentiators

Not expected, but would make the page stand out for a CMO or CFO.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| D1. Interactive calculator (assets/campaign, campaigns/yr, team size, cost per asset, locales, review hit rates) | Lets the CFO put their own numbers in. Shows baseline vs 2x output, cost, cycle time. | High | Client-side only. Show reviewer-capacity constraint: auto-approval rate directly determines whether reviewer headcount stays flat at 2x (the central argument for the spine). |
| D2. Reviewer-capacity model ("review is the bottleneck") | Most AI-content pitches ignore that approval load scales with volume. Model: human reviews needed = assets x (1 - auto-approval rate) x sampling. Shows the break-even auto-approval rate for 2x output at flat review headcount. | Med | All inputs Modelled. This is the page's analytical core and has no public benchmark, so be explicit. |
| D3. "Variant explosion" worked example with unique-concept count vs variant count | Pre-empts the "vanity volume" objection. Shows 10,000 assets from, for example, 40 concepts. | Med | Illustrative, grade Modelled. |
| D4. Honest win-rate maths: most tests lose, so experiment velocity matters | Counter-intuitive and defensible: if only about 12% to 36% of tests win, doubling test throughput is what doubles the count of wins. | Low | Needs the definition caveat (register rows E1 to E3). |
| D5. Creative fatigue as the outcome argument for volume | Gives a real reason that more variants improve outcomes, not just output: exposure decay means a fixed creative set wears out. | Med | Evidence quality is weak (see register F1 to F3). Frame as hypothesis supported by wear-out literature, not as a proven curve. |
| D6. Disclosure-penalty and "AI from scratch vs AI-edited" nuance | Rare, specific, relevant to governance policy (labelling rules). | Low | Single study, single campaign, secondary-verified numbers. Grade Benchmark with narrow caveat. |
| D7. Tiered risk matrix: which asset classes can auto-approve | Practical and concrete for brand and legal. | Med | Modelled. |
| D8. Statutory-damages exposure arithmetic for rights incidents | Gives the CFO a tail-risk number: US statutory damages are $750 to $30,000 per work, up to $150,000 if willful, so 10,000 unlicensed assets is a large exposure on paper. | Low | Benchmark for the statutory range (17 U.S.C. 504(c)); the incident-rate input is Speculative. Applies only to registered US works (17 U.S.C. 412). Not legal advice. |
| D9. "Floor not KPI" spend framing with Gartner AI-allocation anchor | Mirrors Intercom; CMOs allocate about 15.3% of budget to AI (Gartner 2026) yet only 30% report mature readiness. | Low | Use as context for the spend floor, not as proof of returns. |
| D10. Imagery sourcing decision frame: licensed vs generated vs shot, by risk and brand-distinctiveness | Relevant to imagery-heavy production. Vendor-neutral, categories only. | Med | No public cost-per-image benchmark found. Use user inputs. Note the author works at a licensed-imagery company, so state the conflict-of-interest and keep the frame symmetrical. |
| D11. Adoption "pull up the floor" playbook for creative, brand and regional teams | Mirrors reference page, absent from most AI-marketing content. | Med | No public benchmark found. Speculative or Modelled. |

---

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| A1. Headline "assets generated" or "content volume" metric | Goodhart. Merriam-Webster named "slop" its 2025 word of the year (secondary source), and no study was found quantifying brand damage, which means the page cannot claim safety either. | Count only approved-and-live assets, pair with outcome metrics. |
| A2. Unattributed round-number claims ("AI cuts content cost 40 to 60%", "automates 80% of content tasks") | Traced to vendor blogs and sites with no primary source. A search for the "80% of content creation tasks" and "30% cost reduction" claims found no primary McKinsey source. | Use only claims with a traceable source, grade the rest Modelled. |
| A3. Presenting vendor case studies as industry benchmarks | Self-selected, unaudited. Klarna's own image-saving figure is reported as both $6M and $1.5M by different outlets. | Show as "company-reported" rows with a bias flag. Never average them. |
| A4. A single personalisation uplift number (e.g. "10 to 15% revenue lift") | The 10 to 15% figure could not be traced to McKinsey's page; only the "40% more revenue from personalization" finding was confirmed. | Use the confirmed McKinsey 40% finding with its correlational caveat (see register P1), or omit. |
| A5. A precise creative-fatigue day count or frequency threshold | Vendor sources contradict each other (7 to 10 days, 14 to 21 days, median 18 days; frequency thresholds from 2.0 to 4.0). | Describe fatigue qualitatively, offer fatigue detection as a process, let reader set their own refresh interval in the calculator. |
| A6. Vendor or brand names on the page | Neutrality constraint. | Cite vendor-published studies in the source register by publisher name with a bias flag, and use categories (GenAI image model, DAM, PIM, MMM) in the body. Decide whether naming a publisher in the register is acceptable under the neutrality rule. |
| A7. Per-word MTPE rate tables | The only per-word figures found ($0.08 to $0.10 post-edit vs $0.15 traditional) come from a vendor blog that attributes them to Nimdzi without confirmation. Nimdzi itself says price-per-word is becoming impractical in AI workflows. | Model localisation cost as cost per approved localised asset with a reader-set rate. |
| A8. Claiming full-funnel revenue impact of 2x output | Marketing outcomes have long lags and many confounders. | Claim leading indicators and holdout-measured lift, label revenue outcomes as Modelled. |
| A9. Fabricated "typical" variant counts, approval times, or rights-incident rates | No public data. | Mark as GAP and let the calculator carry reader inputs. |
| A10. Treating Meta-style platform claims as independent evidence | Platform-reported (e.g. Meta's incremental conversions claims) are not controlled studies of creative. | Exclude or flag as platform self-report. |

---

## Lever-by-lever findings

### 1. Content generation, 10,000+ assets per campaign (deep dive)

**(a) How AI changes throughput.** Derivative production (resize, reformat, localise, audience-swap, A/B variant) moves from manual to automated generation with review by exception. The multiplicative structure (sizes x channels x locales x audiences x tests) is what makes 10,000+ reachable; the throughput constraint shifts from production to review. Imagery: generation or digital-twin rendering replaces some reshoots and some licensed-image purchases; the choice depends on distinctiveness, people/likeness risk and IP posture. Catalog/feed: templated generation from product data (PIM) with feed-level QA.

**(b) Output metric.** Approved live asset-variants per marketing head; secondary: cost per approved live asset; unique-concept count; first-pass approval rate.

**(c) Outcome argument.** (i) More variants enable more testing and audience-fit; (ii) wear-out of repeated creative (weak, secondary evidence); (iii) the one strong controlled study found AI-from-scratch ads beat expert human ads on CTR in a single Google Display campaign, but fell 31.5% when disclosed as AI; (iv) a field experiment found AI-written retail messaging effects were small and not statistically significant (1.6% sales lift, p not significant), so the page should not promise a lift from generation alone. Quality gains are plausible for writing tasks (Noy and Zhang) but those tasks had no factual-accuracy checks.

**(d) Evidence quality.** Variant counts and cost per asset at large brands: no independent public benchmark (GAP). Company-reported: Unilever digital-twin imagery "2x faster, 50% cheaper" (company press release, March 2025); Klarna image cycle from six weeks to about one week (company-reported, May 2024). "Content supply chain" literature: Adobe's 2023 survey (88% say content demand at least doubled in two years; vendor survey) and an Adobe/Advanis 2026 survey of 150 marketers (84% missed an opportunity because workflows were too slow; vendor-sponsored, small n). No Gartner, Forrester, BCG content-supply-chain quantification was retrievable. McKinsey 2023 gen-AI estimate of 5% to 15% of marketing spend as productivity value (via WARC summary; primary page timed out).

### 2. Localisation / transcreation

**(a)** Machine translation with post-editing and LLM first drafts compress turnaround and cost for tier-2 content; transcreation for flagship creative stays human-led with AI assist. **(b)** Approved localised assets per locale per quarter; global-master-to-last-locale lag (days); cost per approved localised asset. **(c)** Faster and broader locale coverage earlier; fewer "English-only" launch gaps; localisation quality is a brand-risk control point, so pair with linguist-reviewed sampling. **(d)** Public evidence is academic or vendor. Academic MT post-editing productivity gains vary widely by language pair and domain (from about 9% to about 60% in one NMT bank-domain study, 2019; gains not guaranteed when MT quality is poor). Vendor: Intel with Lilt reports a 40% year-on-year translation cost reduction for the same volume; Smartling customer reports 50% faster to market and $3.4M saved (vendor case study); a Forrester commissioned composite found a 50% workload reduction (commissioned study). Nimdzi market sizing (USD 72.6B for 2025, under 1% CAGR to 2030, 2026 edition) is useful context. Per-word rates: GAP (credible source not found).

### 3. Experimentation

**(a)** AI generates more testable variants and hypotheses and accelerates analysis, so test count per quarter is bounded by traffic and analysis capacity, not creative supply. **(b)** Experiments per quarter and conclusive-test rate; learning velocity. **(c)** Most ideas do not win, so more shots on goal is the mechanism. Microsoft: about one-third of ideas positive, one-third flat, one-third negative (Kohavi slides, 2009/2012). Optimizely 2023: about 12% of 127,000 experiments win on the primary metric at 90% significance. DRIP Agency: 36.3% of tests produced a significant winner in an e-commerce set. Startup study (Koning, Hasan, Chatterji, Management Science 2022): A/B testing adopters saw performance improvements of 30% to 100% after a year (measured on page views, startups, not enterprise marketing). **(d)** Caveats: win-rate definitions differ; vendor datasets self-select; traffic limits mean 10,000 variants do not mean 10,000 testable hypotheses. Use bandit or sequential methods language carefully and generically.

### 4. Insight and reporting

**(a)** AI agents draft recurring reports, anomaly narratives, and fatigue alerts; MMM moves toward more frequent refresh. **(b)** Time-to-insight (hours from data to decision-ready readout); MMM refresh cadence; share of recurring reports automated. **(c)** Faster reallocation of budget; earlier creative-fatigue detection. **(d)** Analyst-hours and time-to-insight: GAP (no credible public benchmark). Context only: NIQ CMO report (via trade press, September 2026): 74% of CMOs under more scrutiny to prove ROI, 9% have adequate real-time insight access (vendor-published, secondary). Vendor commentary says once-a-year MMM goes stale (Circana, July 2026). Monks: monthly or always-on needs clean data and automated pipelines; otherwise quarterly. Sellforte: unexplained movement destroys trust. No source found with weeks-to-run for open-source MMM tools.

### 5. Ops: briefs, approvals, DAM tagging/metadata, rights tracking

**(a)** AI drafts briefs, auto-tags and enriches metadata, pre-checks assets against brand and rights rules, routes only exceptions to humans. **(b)** Brief-to-first-draft time; review rounds per asset; auto-approval share; share of assets with complete metadata; rights-check coverage. **(c)** Cheaper, faster review and findable assets increase reuse; pre-clearance lowers incident risk. **(d)** Approval cycle times and rounds of review: GAP (searches returned only vendor documentation and forum posts). Time lost searching: Canto marketing poll (vendor poll, secondary): 33.4% of marketers spend about three weeks a year searching for files. The frequently-cited McKinsey "1.8 hours a day searching for information" is secondary, general information not assets, and untraced to a primary. Brand-compliance rates: GAP; closest is PerformLine (vendor): 20% of reviewed assets flagged for potential regulatory violations in Q1 2024, which is regulatory, not brand-style. Rights incident costs: statutory damages range (Benchmark) but incident frequency GAP.

### 6. Outcome metrics (summary)

Covered in the metric table. Revenue/pipeline: report holdout-measured lift. Speed: brief-to-live and market-launch lag. Quality/brand: first-pass compliance, rejection, rights incidents. Learning: experiments per quarter, fatigue detection lead time. Productivity context: P&G/Harvard/Wharton "Cybernetic Teammate" (776 employees, one-day exercise; AI individuals matched two-person human teams on quality; 12 to 16% faster per secondary reports). McKinsey State of AI: marketing and sales is where gen AI revenue gains are most often reported, typically under 5% (secondary summaries only).

---

## Benchmark Register

Proposed grades: **B** = Benchmark, **M** = Modelled, **S** = Speculative. "Verified via" notes how I reached the figure. Items marked RE-VERIFY need the author to open the primary before publication.

| ID | Claim | Figure | Source URL | Date | Proposed grade | Caveat |
|----|-------|--------|-----------|------|----------------|--------|
| G1 | Marketing budget as % of company revenue | 7.7% (2025), 7.8% (2026); 401 to 402 CMOs, mostly $1B+ revenue | https://www.gartner.com/en/newsroom/press-releases/2025-05-12-gartner-2025-cmo-spend-survey-reveals-marketing-budgets-have-flatlined-at-seven-percent-of-overall-company-revenue ; 2026: https://gartner.com/en/newsroom/press-releases/2026-05-11-gartner-2026-cmo-spend-survey-finds-cmos-allocate-15-point-3-percent-of-marketing-budgets-to-ai-but-only-30-percent-are-ready-to-scale-ai-capabilities | 2025-05-12; 2026-05-11 | B | Gartner site returned 403 on direct fetch; figures verified through search summaries of the release. North America, UK, Europe only. |
| G2 | AI share of marketing budget and readiness | 15.3% of budget to AI; 30% report mature AI readiness; 70% say AI leadership is a critical 2026 goal | Gartner 2026 release (URL in G1); corroborated by https://www.barchart.com/story/news/1852528/gartner-2026-cmo-spend-survey-finds-cmos-allocate-15-3-of-marketing-budgets-to-ai-but-only-30-are-ready-to-scale-ai-capabilities | 2026-05-11 | B | Survey of self-reported allocations, not outcomes. The 21.3% figure for mature firms appears in one secondary source only, so exclude. |
| G3 | How CMOs say gen-AI pays off | 49% time efficiency, 40% cost efficiency, 27% capacity to produce more content | Gartner 2025 release (URL in G1), via search summary | 2025-05-12 | B (RE-VERIFY) | Unclear whether percentages are shares of respondents; single secondary reading. |
| M1 | Gen-AI productivity value in marketing | 5% to 15% of marketing spend; survey of 82 senior marketing executives expected average 13% cost cut | https://www.warc.com/content/article/warc-research/mckinseys-view-on-the-benefits-of-generative-ai-for-marketers/en-gb/151966 ; primary: https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier | 2023 | B (RE-VERIFY primary) | Top-down estimate and executive expectations, not measured results. Primary page timed out. |
| M2 | Gen-AI revenue and cost effects in marketing/sales | Most common reported revenue increase under 5%; most common cost decrease under 10% | McKinsey State of AI (primary not reached); summaries at https://gend.co/blog/mckinsey-state-of-ai-2025-key-findings-what-to-do | 2024 to 2025 | B (RE-VERIFY) | Secondary summaries only, attributions conflict between years. Good "tempered expectations" anchor if confirmed. |
| P1 | Personalisation leaders earn more revenue from it | Excellers generate 40% more revenue from personalisation than average players; over $1T US value at top-quartile | https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-value-of-getting-personalization-right-or-wrong-is-multiplying (fetch timed out; wording confirmed on mckinsey.com.br mirror) | 2021 | B | Correlational; the widely repeated "10 to 15% revenue lift" could NOT be confirmed in this source, so do not use it. |
| P2 | Gen-AI ad messaging in online retail | 1.6% sales lift, not statistically significant; about 4% estimated per exposed customer (authors' lower bound); AI-written Google ad titles slightly negative, insignificant | https://arxiv.org/pdf/2510.12049 | 2025 (arXiv) | B | Preprint; one retailer; read via search summary. Useful as sober counterweight. |
| P3 | Dynamic creative optimisation at scale | +3.09% ad CTR in online A/B test (PinDCO) | https://arxiv.org/pdf/2609.11943 | 2026 (arXiv, RecSys 2026) | B (RE-VERIFY) | Platform-authored, single platform, CTR not conversion. |
| P4 | Vendor GenAI personalisation case | 52% lift in conversions for GenAI ads; 4% incremental over existing creative | https://claritas.com/?p=5226 | n/d | S (do not use as Benchmark) | Vendor case study; the headline 197% mixes effects. Exclude from page or list only as flagged vendor claim. |
| C1 | AI-from-scratch ads vs expert human ads | Up to 19% higher CTR (3.73% to 4.44% reported secondary); AI-edited human ads no gain | https://www.stern.nyu.edu/experience-stern/faculty-research/ai-advertising-paradox ; SSRN: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5638311 | 2025-11-06 | B | NYU page confirms "up to 19%" with no sample or platform. The Google Display, single-campaign detail comes from secondary coverage. CTR, not sales. |
| C2 | Disclosure penalty | Labelling an ad as AI-generated reduced CTR by 31.5% | Same as C1 | 2025-11-06 | B | Same study; trade press reports 31%. Strong governance implication. |
| C3 | Human vs AI campaigns on brand metrics | 43% higher unaided recall, 37% higher emotional engagement for human campaigns | not traced to Nielsen primary | 2025 | EXCLUDE | Only blog attributions found. |
| W1 | Writing productivity with an LLM | Time down 40%, quality up 18% (453 professionals) | https://economics.mit.edu/news/study-finds-chatgpt-boosts-worker-productivity-some-writing-tasks | 2023 | B | Mid-level writing tasks; no fact-checking; not marketing creative. |
| W2 | Cybernetic Teammate (P&G) | n=776; AI individuals matched two-person teams on quality; about 12% to 16% faster (secondary) | https://cosm.aei.org/the-surprising-benefits-of-cooperative-ai/ (secondary); primary on SSRN/HBS | 2025 | B (RE-VERIFY) | One-day exercise; speed figure from one trade report. |
| I1 | Company-reported image production savings | Klarna: image cycle six weeks to about seven days; $6M vs $1.5M annual image savings (conflicting); about $10M annual AI savings, sales and marketing spend down 11% | https://www.bankingdive.com/news/klarna-generative-ai-openai-cut-marketing-spend-efficiency/718002/ ; https://www.verdict.co.uk/klarna-says-it-has-cut-marketing-costs-by-10m-with-genai/ | 2024-05 | B as "company-reported" only | Unaudited; outlets disagree on the image figure. Klarna is a consumer fintech, not a typical enterprise. |
| I2 | Digital-twin product imagery | Unilever: 2x faster, 50% cheaper, 100% brand consistency; TRESemme Thailand 87% content-cost cut and 5% purchase-intent rise | https://www.unilever.com/news/press-and-media/press-releases/2025/unilever-reinvents-product-shoots-with-digital-twins-and-ai (403 on fetch; figures via trade coverage https://campaignlive.com/article/unilever-uses-digital-twins-accelerate-content-creation/1911080) | 2025-03 | B as "company-reported" only | Presented at a vendor conference; comparison baseline (traditional photography) not audited; physical-product imagery only. |
| D1 | Content demand growth | 88% of marketing/CX leaders say demand at least doubled in two years; two-thirds expect about 5x in two years | https://news.adobe.com/news/news-details/2023/adobe-unveils-world-s-first-content-supply-chain-solution-to-fuel-experience-led-growth | 2023-03-21 | B (vendor-biased) | Adobe commissioned and sells content-supply-chain products. Sentiment survey. Do not merge with the 2025-era ANZ "88%" which has different wording. |
| D2 | Workflow responsiveness | 84% missed at least one opportunity in prior quarter because workflows could not respond; n=150 | https://business.adobe.com/blog/how-ai-can-resolve-workflow-bottlenecks | 2026 | B (vendor-biased, small n) | Vendor-sponsored, 150 respondents, five countries. |
| L1 | Localisation cost with AI-assisted translation | Intel/Lilt: 40% YoY cost reduction for same volume; Smartling customer: 50% faster, $3.4M saved | https://www.intel.com/content/dam/www/central-libraries/us/en/documents/intel-cps-lilt-case-study-forintelwebteamonly.pdf ; https://smartling.com/resources/case-study/technology-customer-case-study | n/d | B as "vendor case study" | Vendor-selected customers; no common baseline. |
| L2 | Localisation workload with AI (composite) | 50% workload reduction; 90% faster internal document translation | https://translated.com/resources/the-roi-of-ai-translation-measuring-business-impact | 2024 | S/B (flag) | Commissioned Forrester composite, not a real firm. |
| L3 | MT post-editing productivity range | About 9% to 60% depending on language pair (bank-domain NMT study); not always positive | https://arxiv.org/pdf/1906.01685 (verify this is the bank-domain study) | 2019 | B (RE-VERIFY) | Academic, pre-LLM, single domain. Shows variance, not a rate. |
| L4 | Language industry size | USD 72.6B (2025), under 1% CAGR to USD 76.1B by 2030; PPW becoming impractical | https://nimdzi.com/nimdzi-100-2026/ | 2026 | B | Market context, not a cost benchmark. |
| E1 | Microsoft experiment outcomes | About 1/3 of ideas positive and significant, 1/3 flat, 1/3 negative and significant | https://ai.stanford.edu/~ronnyk/2009-06-28KDDTutorialT4part1.pdf ; https://ai.stanford.edu/~ronnyk/2012-09ACMRecSysNR.pdf | 2009; 2012 | B | Microsoft product experiments, not marketing; old. Use as direction only. |
| E2 | Optimizely win rate | About 12% win on primary metric (127,000 experiments, 2018 to 2023, 90% significance) | https://www.optimizely.com/contentassets/176d12c99e0e458190ae5478f02615a9/10-takeaways-to-supercharge-your-ab-testing-and-experimentation-program.pdf ; https://Optimizely.com/company/press/the-experimentation-experience-report/ | 2023-11-27 | B (vendor-biased) | Vendor platform users self-select; newer 173K-experiment guide uses a different dataset, so do not assume 12% persists. |
| E3 | European e-commerce win rate | 36.3% significant winners; 41.6% inconclusive (90+ brands) | https://foundrycro.com/blog/ab-testing-statistics-benchmarks-2026/ (secondary; original DRIP Agency) | 2026 | S/B (RE-VERIFY) | Agency benchmark, secondary only. Illustrates that definition drives the number (12% vs 36%). |
| E4 | A/B testing and startup performance | Adopters improved performance 30% to 100% after a year (page-view-based); 9% to 18% more new products | https://www.nber.org/papers/w26278 | 2019 (WP); Management Science 2022 | B | Startups, page views as performance, not enterprise marketing. |
| F1 | Creative fatigue, repeated exposure | About 45% drop in click or conversion likelihood by fourth exposure; median creative life 18 days (Meta dataset) | no primary retrieved | 2022 to 2023 | S (or exclude) | Only secondary blogs; sources disagree (about 40% vs 45%; 2022 vs 2023). |
| F2 | Wear-out in broadcast evidence | Analytic Partners: 14 of more than 50,000 ads had run their course when replaced; ABX radio study: wear-out only on heaviest-spend ads | https://www.insideradio.com/free/new-study-shows-consumers-don-t-tire-of-radio-ads/article_82081b15-415f-4f55-b89b-2bd4710b17df.html (secondary) | n/d | S (RE-VERIFY) | Secondary; this is a counter-argument to "fatigue demands volume" and the page should present it. |
| R1 | US statutory damages for copyright infringement | $750 to $30,000 per work; up to $150,000 if willful; $200 floor if innocent | https://law.justia.com/codes/us/title-17/chapter-5/sec-504/ | statute (2024 code) | B | US only; only for works registered in time (17 U.S.C. 412); not an incident-rate benchmark. |
| R2 | Regulatory flag rate in marketing assets | 20% of assets reviewed flagged for potential regulatory violations (Q1 2024) | https://performline.com/?p=28238 | 2024 | S (vendor) | Compliance-tech vendor; regulated-industry sample; not brand-compliance. |
| O1 | Time searching for files | 33.4% of marketers spend about three weeks per year searching for files; 15% up to six weeks | https://canto.com/blog/content-chaos-poll/ | n/d | S (vendor poll) | DAM vendor poll; self-reported. |
| R3 | Insight access gap | 74% of CMOs under more scrutiny to prove ROI; 9% have adequate real-time insight access | https://ppc.land/niqs-cadence-now-runs-googles-open-source-ad-budget-model-meridian/ | 2026-09 | B (vendor-published, secondary) | NIQ CMO Report relayed by trade press; primary not read. |
| R4 | MMM cadence guidance | Annual MMM stale; monthly or always-on needs automated pipelines, else quarterly | https://www.circana.com/post/how-often-should-you-run-marketing-mix-modeling ; https://www.monks.com/articles/these-5-factors-will-tell-you-when-refresh-your-marketing-mix-model | 2026 | S (vendor opinion) | Vendor positions, not measured; ARF/OptiMine refresh-cadence findings (Feb 2026) not accessible. |

---

## Gaps (do not fill with invented numbers)

| Needed | Status | Page treatment |
|--------|--------|----------------|
| Cost per asset and variant counts for large brands (independent) | GAP; only company-reported (Klarna, Unilever) | Reader inputs; defaults Modelled; show company-reported anchors flagged. |
| Gartner, Forrester, BCG, McKinsey content-supply-chain quantification | GAP; primary sources not reachable or not found | Cite only Adobe's vendor surveys with bias flag; list as evidence gap. |
| Approval cycle time and rounds of review in marketing | GAP | Modelled; brief-to-live is a metric the reader measures at baseline. |
| DAM tagging time saved / metadata completeness | GAP (only vendor polls) | Modelled. |
| Rights-incident frequency and cost | GAP (statute only) | Calculator input with Speculative default; statutory range as tail risk. |
| Brand-compliance first-pass rates and rejection rates | GAP | Modelled; eval harness would generate this ground truth, which is itself a selling point. |
| Analyst hours and time-to-insight | GAP | Modelled. |
| MMM build duration and refresh effect on outcomes | GAP | Qualitative only. |
| Per-word and per-asset localisation rates | GAP (unverified vendor blog only) | Reader input. |
| DCO-specific independent lift evidence | Thin: PinDCO platform paper, one retail preprint | Present as modest and uncertain. |
| Brand-dilution cost of AI content at volume | GAP; conceptual only | Treat as a risk, not a quantified number. |

---

## Feature Dependencies

```
T1 Output metric definition -> T2 Outcome metric pairing -> T4 Variant arithmetic -> D1 Calculator
T6 Governance spine (review agent, tiers, eval harness) -> D2 Reviewer-capacity model -> D1 Calculator (review headcount output)
T6 eval harness -> T2 quality/brand metrics (compliance, rejection, rights incidents are measured here)
T3 Grade key -> every benchmark row (T8 register) -> T9 Evidence-gaps section
T5 CFO answer -> D1 Calculator (cost per approved asset curve) and D9 Spend-floor framing
Experimentation lever (3) -> learning-velocity outcomes; depends on Content generation (1) supplying variants
Localisation (2) and Ops (5) -> depend on T6 gate (same review spine, different tiers)
T7 What-goes-wrong -> motivates T6 tiering and A1 (no raw volume metric)
D8 Rights exposure -> depends on rights-tracking in Ops (5) and the review agent's rights check
```

## MVP Recommendation

Prioritise:
1. T1 + T2 + T3 + T8/T9: the metric definition, outcome pairing, grade key, source register and gaps. These are the credibility base.
2. T4 + T6 + D2: variant arithmetic plus the governance spine with a reviewer-capacity model. This is the "build-and-review" argument and the most original content.
3. T5 + D1: CFO answer and calculator (the calculator is how the page survives the lack of public cost benchmarks).
4. One differentiator beyond those: D4 (win-rate maths) or D6 (disclosure penalty), both cheap and evidence-backed.

Defer:
- D10 imagery sourcing frame: needs conflict-of-interest handling and no public cost data; ship as a short neutral decision table, not a cost comparison.
- D11 adoption playbook: no public evidence; ship late with Speculative grades.
- Per-lever deep quantification for insight/reporting: nearly all GAP; keep brief.

## Sources

Confidence note: sources reached directly are noted per row. Primary documents NOT read (flagged RE-VERIFY or "secondary"): McKinsey personalisation and economic-potential pages (timeouts), Gartner press releases (403), Unilever press release (403), Meta creative-fatigue analysis (not found), Nielsen AI-vs-human (not found), Optimizely PDF (found via search, not opened), arXiv papers (read via search summaries).

- https://www.stern.nyu.edu/experience-stern/faculty-research/ai-advertising-paradox (fetched, MEDIUM-HIGH)
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5638311 (paper, not opened)
- Gartner 2025 and 2026 CMO Spend Survey releases (URLs in register; MEDIUM via summaries)
- https://www.nber.org/papers/w26278
- https://economics.mit.edu/news/study-finds-chatgpt-boosts-worker-productivity-some-writing-tasks
- https://news.adobe.com/news/news-details/2023/adobe-unveils-world-s-first-content-supply-chain-solution-to-fuel-experience-led-growth
- https://law.justia.com/codes/us/title-17/chapter-5/sec-504/
- https://nimdzi.com/nimdzi-100-2026/
- Reference page structure: https://lyonsv.github.io/intercom-2x-teardown/ (fetched; 14 sections, Verified/Inferred/Uncertain grading)
