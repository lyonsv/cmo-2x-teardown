# Competitive Landscape: Gradial, AirOps, Profound vs the CMO 2x approach

**Researched:** 2026-10-24 (all URLs accessed 2026-10-24 unless stated)
**Scope:** Three commercial offerings. Stack, features, architecture and pitfalls are covered elsewhere.
**Overall confidence:** MEDIUM. Vendor sites and press were read directly. Independent verification of outcomes is almost absent. Three of the four third-party reviews are competitor-authored.

Note on neutrality: PROJECT.md says the published page stays vendor-neutral and names categories only. This file is internal research. The vendor names should not appear on the page. Use the categories in the last section.

Evidence grade key used below:
- **V-claim**: vendor-claimed, on the vendor's own site or in a vendor-fed press piece.
- **Press-repeat**: a third party repeating vendor figures without verification.
- **Independent**: measured or audited by someone with no stake. None found for any outcome metric below.
- **Competitor-authored**: a review written by a direct rival. Use with caution.

---

## 1. Summary

- **None of the three is an alternative to the CMO 2x operating model.** Each is a component or a partial overlap. None covers the full factory (brief to measure) and none covers imagery, rights or >10k-asset variant production.
- **Gradial is the closest overlap.** It is agentic execution for enterprise web and email: CMS authoring, DAM tagging, QA, localisation and GEO. It claims governance is embedded in the workflow. It overlaps most with the "ops" and "build" halves of the spine. Its public material gives no detail on review tiers, an eval harness built from human decisions, or rights.
- **AirOps is a content and AEO workflow builder** (Grids, Workflows, Brand Kit, Knowledge Base, Human Review checkpoints). It is aimed at SEO and growth teams and is marketing-led, not a governance layer.
- **Profound is mainly a measurement layer** (prompt tracking across up to 9 answer engines, Agent Analytics from server logs) with a growing agent and content layer that always stops at a human approval.
- **AEO/GEO recommendation: add it as a sixth lever, or as an explicit "discovery" sub-lever.** Two of the three vendors, plus a third whose core is AEO, treat it as the main new surface. Gradial (an execution vendor) also sells a GEO workflow. This is also the most visible part of the market's funding: Profound raised $96M (Feb 2026) then $180M (Sep 2026), AirOps $40M (Nov 2025). See section 6.
- **The core CMO 2x differentiator holds up.** No vendor publicly documents a risk-tiered auto-approval gate, or an eval harness that calibrates a review agent against human reviewer decisions. The closest are Gradial's "agents improve using signals from evals, approvals" and AirOps's "Evaluate" loop step. Both are asserted, with no mechanism published. The absence is of public information, not proof the capability is missing.

---

## 2. Gradial (gradial.com)

**Company and funding.** Seattle. Legal name Panorama Artificial Intelligence Corp. Series A $13M, Series B $35M (Dec 2025, VMG Partners lead), Series C $65M on 2026-06-17 (Insight Partners lead, $675M valuation reported by Axios, with Madrona, VMG, PruVen). Total funding is reported variously as about $110M, $118M and $120M+.
Sources: [Axios](https://axios.com/2026/06/18/gradial-ai-agents-marketing), [CMSWire Series C](https://www.cmswire.com/digital-marketing/gradial-lands-65m-series-c-for-agentic-marketing-platform/), [CMSWire Series B](https://www.cmswire.com/digital-experience/gradial-raises-35m-series-b-to-scale-agentic-marketing-automation), [Madrona](https://www.madrona.com/harnessing-agentic-marketing-for-the-enterprise-gradials-series-c-fundraise/). The valuation figure came via search summary of Axios and was not read on the page, so treat it as MEDIUM.

**Problem solved.** The execution backlog in enterprise web, email and digital-experience teams: turning approved direction into live pages, emails and assets. ([gradial.com](https://www.gradial.com), 2026-10-24)

**Target buyer.** Marketing ops, web, email and digital experience leaders at large enterprises. Verticals listed are retail/CPG, health, auto, tech, financial services and sports. ([gradial.com](https://www.gradial.com))

**Core capabilities (V-claim, site):**
- Campaign execution: landing pages, product detail pages, emails.
- DAM upload, naming, metadata and tagging; asset QA, completeness and accessibility checks; regression detection before release.
- Localisation, migrations, broken-link fixes.
- Continuous experiments and journey simulation; performance insight tied back to execution.
- GEO workflow: finds gaps in AI-driven discoverability on owned content, prioritises, ships governed updates. ([platform page](https://www.gradial.com/platform))

**Position in supply chain.** Create (assembly, not creative ideation), adapt/version (templated), review/QA, DAM metadata, distribute (push to CMS), light measure, light AEO/GEO. It starts from "approved direction", so brief and concept are upstream and human.

**Architecture and governance model (V-claim).** Five layers: intelligence/reasoning, integrations (CMS, DAM, design, workflow tools), rules engine (brand, accessibility, legal, governance), design system (enforced components), infrastructure (multi-cloud, multi-model, MCP, "without lock-in"). An orchestrator agent routes tasks. Rules apply during creation, not only at final review. Approvals and validation history are kept in each run's execution history. Agents "improve as they run, using signals from evals, approvals, quality checks, and outcomes." ([platform page](https://www.gradial.com/platform))
**Gap:** no public description of reviewer roles, approval tiers, auto-approve thresholds, or how evals are built. A Trust Center is linked, but no certifications were described on the page.

**Claimed outcomes (all V-claim or press-repeat, no independent verification):**
- T-Mobile: campaign of 1,000-1,200 cumulative hours done in about 80 hours with QA in the loop; 90% faster time to market; 10x throughput ([customers page](https://gradial.com/customers)). A secondary article reports 80-90% reduction in execution time (press-repeat).
- AWS: page creation about 10 hours to about 30 minutes. Micron: authoring about 4 hours to about 20 minutes. ([customers page](https://gradial.com/customers))
- SLA turnaround 10 days to same day with brand and WCAG compliance maintained; "up to 20x" efficiency; ">80%" campaign execution time reduction; ARR "more than 10x" in 12 months. ([CMSWire](https://www.cmswire.com/digital-marketing/gradial-lands-65m-series-c-for-agentic-marketing-platform/))
- Gradial blog: about 95% time saving on routine updates across about 70% of workload (single-source, reported via search).
- The CMSWire piece itself notes that standardised cross-platform benchmarks are nascent and that stitching agentic tools together still needs custom integration.
- Outcomes are time and throughput. No revenue, conversion or quality-incident outcomes were found.

**Pricing.** Not published; demo only. No third-party price estimates found. (Gap.)

**Customers.** Case studies: T-Mobile, Visit Qatar, Prudential, Avalara, AWS, Micron, Natixis. Logos include Cisco, Intel, Kaiser Permanente, Wells Fargo, Vanguard, US Bank, Lenovo, AAA.

**Limitations and unknowns.**
- Which CMS and DAM it supports is not stated on the platform or customers pages. Adobe and Sitecore are mentioned in a Gradial blog (via search) and Adobe/Salesforce/ServiceNow/Databricks in Axios coverage. The CMSWire article did not mention AEM. Verify before claiming AEM support.
- Imagery generation, rights/licensing and creative-concept variant explosion are not described. Its scope is web and email page execution, not 10k-asset creative production.
- Localisation is one line ("consistent across channels and locales").
- Outcome metrics are time-based and self-reported.

---

## 3. AirOps (airops.com)

**Company and funding.** $40M Series B announced Nov 2025, Greylock lead per most sources (one aggregator disagrees). A $225M valuation appears in one outlet only (LOW). Total funding figures range $55.5M-$62.5M across trackers. Positions itself as "the content engineering platform." ([TheSaaSNews](https://www.thesaasnews.com/news/airops-raises-40-million-in-series-b/), [CB Insights](https://www.cbinsights.com/company/airops/financials), [Seedtable](https://seedtable.com/companies/airops/funding-rounds/series-b-2025-11)). The homepage now frames AirOps as a partner for "AI search (AI discovery) strategy", combining consulting and platform. ([airops.com](https://www.airops.com))

**Problem solved.** Brand visibility in AI search and SEO, via continuous research, publish and refresh of content. Also a general no-code AI workflow builder for content teams.

**Target buyer.** Growth, SEO and content marketing leaders, mainly at tech and SaaS companies (customer logos: Upwork, Ramp, Webflow, Chime, HubSpot, Carta, Brex, Wiz, KAYAK, Gong, monday.com, Sprout Social). It also has an enterprise page. ([airops.com/enterprise](https://www.airops.com/enterprise))

**Core capabilities.**
- **Workflows:** a visual builder chaining data sources, AI steps, Brand Kit context, Knowledge Base lookups and Human Review checkpoints. ([docs](https://docs.airops.com/getting-started/core-concepts), via search summary.)
- **Grids:** spreadsheet-style interface to run workflows across hundreds of URLs or rows, for non-builders. A competitor review notes it suits large backlogs.
- **Brand Kit:** voice, tone, style rules, product lines, templates, audiences and regions. **Knowledge Base:** uploaded docs, scraped sites, connected databases.
- **Integrations:** CMS (WordPress, Webflow, Contentful per competitor review) and SEO tools (Moz, Semrush); tier-limited.
- **AEO:** answer-engine visibility insights, with content refresh as the action. Pricing page lists insights across 7+ engines at Pro, ChatGPT only at Solo. ([pricing](https://www.airops.com/pricing))
- **Enablement:** AirOps University runs a "Content Engineer" cohort teaching a Create > Evaluate > Update > Compound loop, plus Brand Kit and MCP setup ([cohort](https://cohort.airops.com/cohort-4), via search summary).

**Position in supply chain.** Brief (brief-generation workflow), create (text), adapt (refresh and scale across URLs), review (human checkpoint and "content review and quality scores" listed as features), distribute (CMS publish), AEO/GEO discovery and measurement (core). Not imagery, DAM or rights.

**Governance / review model.** Brand Kit rules injected into generation; optional Human Review checkpoint in a workflow, with content refresh flows routed through it before CMS publish. Features listed on the pricing page: Content Review and Quality Scores, Human Review and Approvals, Version History. The page gives no detail, and tier availability is unconfirmed. No risk tiering or auto-approval policy is documented. ([pricing](https://www.airops.com/pricing))

**Claimed outcomes (V-claim unless noted):**
- Webflow: 40% traffic uplift on refreshed articles within days; ChatGPT-attributed signups 2% to nearly 10%; AI traffic converts 6x SEO traffic. The homepage headline gives a different figure (6% rise in AI-attributed signups), so AirOps's own materials are internally inconsistent. ([Webflow case study](https://airops.com/blog/webflow-case-study))
- Chime: 3x AI search citations, 70% rise in refresh velocity, 89% time reduction. ([Chime case study](https://airops.com/blog/chime-case-study))
- Ramp: customer quote; a "10x ROI" figure came from a third-party review and is unconfirmed.
- Of the three vendors, AirOps is the only one that ties claims to pipeline and signups, but the homepage gives no metrics for its "tie every move back to pipeline and revenue" claim.
- Independent verification: none found.

**Pricing.** Published tiers: Solo, Pro, Enterprise. Dollar figures are not on the pricing page, which shows task-based usage (Solo 35,000 tasks, Pro 100,000, Enterprise custom; Solo overage $0.025/task). A competitor review (Profound) quotes Solo about $200/month and Pro about $2,000/month. Treat those dollar figures as LOW. The page's FAQ mentions "Scale" and "Agency" plans and uses "credits" and "tasks" interchangeably, so billing predictability is a stated concern in the competitor review. ([pricing](https://www.airops.com/pricing), [competitor review](https://www.tryprofound.com/blog/airops-review))

**Limitations (competitor-authored review, so LOW-MEDIUM):** drafts "not publish-ready", brand rules sometimes over-applied (stripping all negative framing), content refresh can break structure (FAQs mid-article, H2 to H3), learning curve, visibility data described as surface-level. Text-centric; no imagery or DAM in material read.

---

## 4. Profound (tryprofound.com)

**Company and funding.** Series C $96M (Feb 2026, $1B valuation, Lightspeed lead, Sequoia, Kleiner Perkins participating). Series D $180M (reported 2026-09-15, $1.8B valuation, Sequoia and Kleiner Perkins co-lead). Total raised since 2024 more than $335M. Revenue is undisclosed. ([Fortune](https://dc.fortune.com/2026/02/24/exclusive-as-ai-threatens-search-profound-raises-96-million-to-help-brands-stay-visible/), [TNW](https://thenextweb.com/news/profound-180m-series-d-ai-answer-engine-optimisation)). Series D has few outlets (TNW citing Bloomberg); verify against a primary source.

**Problem solved.** Knowing and improving how a brand appears in answers from ChatGPT, Perplexity, Claude, Gemini and Google AI surfaces; proving AI-driven traffic. ([tryprofound.com](https://www.tryprofound.com))

**Target buyer.** Marketing, SEO and brand leaders; enterprise-led ("trusted by a third of the Fortune 100", unnamed, V-claim). Also an agency plan.

**Core capabilities.**
- **Answer-engine tracking:** prompts re-run daily, full answer snapshots with mentions, ranking and sources. Enterprise tracks up to 9 engines (ChatGPT, Perplexity, Google AI Mode, Gemini, Copilot, DeepSeek, Claude, AI Overviews, Exa). ChatGPT Shopping on Enterprise. ([pricing](https://www.tryprofound.com/pricing))
- **Prompt Volumes:** panel-based estimates of what people ask AI engines. A competitor review calls it directional and noisier than search volume.
- **Agent Analytics:** reads server and CDN logs to show which AI bots crawl, cite and refer traffic to which pages.
- **AI Marketer / Agents:** drag-and-drop builder and templates (content refresh, AEO FAQs, competitive research, net-new content), Brand Kit injection, CMS publishing, social posts and images, sponsored answer ads, correction drafts, launch materials. ([agents page](https://tryprofound.com/features/agents))
- Enterprise: SSO/SAML, SOC 2 stated, API, CSV/JSON exports. Also "forward-deployed marketing engineers" (TNW).

**Position in supply chain.** Measure and discover (core), brief (insight to recommendation), create and adapt (text, some social imagery), distribute (CMS push after approval). No DAM, rights, localisation workflow or experimentation platform found.

**Governance / review model (V-claim).** "Every Agent run includes a human approval step before anything publishes. You can review, edit, or hold content." One uniform human gate on everything; no tiering or auto-approval described. ([agents page](https://tryprofound.com/features/agents))

**Claimed outcomes (V-claim, testimonials on homepage, no methodology or time frame):** Plaid +50% AI search visibility; MongoDB 30% time saved; Ramp 7x brand visibility on a key topic; Zoom passed 16 competitors on a topic; Gr0 "100x" monthly revenue from AI systems. The Gr0 and Ramp figures are visibility or small-base numbers and should not be read as enterprise revenue effect. No independent verification found.

**Pricing.** Enterprise custom, Trial free (limited credits), Agency Growth self-serve (400 credits per client workspace per month). No dollar figures on the pricing page. A competitor review (Analyze AI) gives conflicting numbers ("$99/$399/custom" and "about $2,000/month") and is LOW confidence. ([pricing](https://www.tryprofound.com/pricing), [Analyze AI review](https://www.tryanalyze.ai/blog/profound-ai-review))

**Limitations (competitor-authored; LOW-MEDIUM).** No native GA4 or conversion link (shows where you appear, not which sessions converted); agent node library limited to AEO and content workflows, with no native CRM lookup, gated publishing logic or webhook triggers in that review's tests; one workspace per account (agency limit). TNW notes methodology for counting mentions is not explained and the business depends on third-party models staying measurable. No independent audit of tracking accuracy found.

---

## 5. Comparison matrix

Ratings: Full / Partial / Thin / None-found. "None-found" means public material read did not show it, not that it is absent. Vendor columns are V-claim-based unless noted.

| Dimension | CMO 2x (as designed) | Gradial | AirOps | Profound |
|---|---|---|---|---|
| Scope across five levers (content factory, localisation, experimentation, insight/reporting, ops) | All five, with content factory as the spine | Content execution + ops + localisation (thin) + experiments (claimed) + insight (claimed) | Content + insight (AEO) only; ops and experimentation thin | Insight/reporting (strong, AEO only); content thin; others none-found |
| >10k-asset variant production | Core design target (sizes x channels x locales x audiences x tests) | Page/email templated assembly; no 10k-asset creative variant evidence. Largest claim is a single T-Mobile campaign | Row/URL scale via Grids (hundreds of URLs); text, not creative variants | Parallel Sheets (hundreds of inputs); not an asset factory |
| Imagery and rights | Sourced, licensed or generated imagery with rights tracking | DAM tagging/QA; no generation or rights/licensing found | None-found | Images sized for social; no rights handling found |
| Review agent + auto-approval tiers + eval harness | Central spine: review agent, risk-tiered gates, eval harness from human decisions | Rules engine plus embedded approvals; "improves from evals, approvals" asserted; no tiers or harness published | Human Review checkpoint, quality scores, "Evaluate" loop step; no tiers or harness published | Uniform human approval on every run; no tiers, no harness |
| Brand governance | Brand/legal/rights review agent | Rules engine (brand, a11y, legal) enforced at creation, plus design system | Brand Kit rules injected; competitor review reports over-application | Brand Kit injection |
| Localisation | Lever with transcreation and per-locale review | One line; "consistent across locales" | Brand Kit holds region variations; no localisation workflow found | Language and region setting on prompt tracking only |
| Experimentation | Lever, with learning velocity metric | "Continuous experiments", journey simulation (V-claim) | None-found | None-found (measures visibility, not tests) |
| Measurement / outcome linkage | Per-head output paired with revenue, speed, quality, learning metrics | Time/throughput outcomes; insights "tied back to execution"; no revenue linkage found | Claims pipeline linkage; evidence is signups/traffic (V-claim, inconsistent) | Visibility and bot-traffic strong; no GA4/conversion link per competitor review |
| AEO/GEO coverage | Under-weighted | Workflow for discoverability gaps on owned content | Core (positioning and consulting) | Core (9 engines, prompt volumes, agent analytics) |
| Build vs buy | Build an operating model, buy components by category | Buy, high-touch enterprise | Buy; self-serve to enterprise | Buy; enterprise custom |
| Lock-in | Low by design (category-level components) | Claims "without lock-in" (multi-cloud, model, MCP); rules, memory and run history sit in the platform (inference, MEDIUM) | Workflows, Brand Kit and Knowledge Base live in platform (inference); task-metered | Prompt history and snapshots live in platform; API and exports on Enterprise only |

---

## 6. Slot-in vs alternative

| Vendor | Verdict | Where it slots in | What it does not replace |
|---|---|---|---|
| Gradial | Partial alternative to the ops and "build" half for web and email; component, not replacement, for the spine | Execution layer: CMS authoring, DAM metadata, QA and accessibility checks are what the review agent would sit in front of or alongside. Its rules engine is a pre-gate check. | Creative and imagery generation at 10k+ scale, rights review, a calibrated eval harness, tiered auto-approval policy, the metric design and the CFO argument |
| AirOps | Component. Not an alternative to anything but the text and AEO slice | Text and refresh workflows; AEO content engineering; Grids as a batch runner | Imagery, rights, DAM, multi-channel variants, review calibration |
| Profound | Component for insight and measure. Content agents overlap lightly | AEO/GEO discovery and measurement; Agent Analytics for bot traffic | Anything beyond AEO; no experimentation or conversion link |

Observations:
- **All three put a human in the loop, not a calibrated reviewer.** Profound's gate is one uniform approval step. Gradial's and AirOps's are described only generally. The CMO 2x spine (risk tiers, eval harness built from reviewer decisions, adoption floor) is where the approach is differentiated, but this is an absence-of-public-information finding.
- **Reviewer fatigue is the unaddressed cost.** A uniform human approval on every run is exactly the pattern the CMO 2x risk-tiered gate is meant to relieve. Do not assert vendors lack tiering; say it is not publicly documented.
- **Vendor outcome claims are almost all effort-saved or visibility metrics.** CMO 2x's pairing of output with outcome metrics (revenue, speed, quality, learning) is stricter than any vendor's published evidence.
- **Vendor figures cannot be used as Benchmark-grade on the page.** Everything above is V-claim or press-repeat. If cited at all, grade as vendor-reported (the lowest evidence tier) and keep them anonymous.

---

## 7. Implications for CMO 2x

1. **Add AEO/GEO, recommended as a sixth lever ("answer-engine visibility" / discovery).** Reasons: (a) three funded vendors, with $335M+ raised by Profound alone, indicate where buyers are spending; (b) it fits the framework: output metric (pages or answer assets published/refreshed per head), outcome metrics (share of citations, AI-referred sessions and conversion), learning velocity (refresh cycle time); (c) it feeds the content factory, because citation-loss signals drive refresh briefs, closing a loop the current five levers lack. Keep it graded honestly: measurement is panel- and sample-based, methodology is unaudited, and the engines are outside the brand's control (TNW). Treat outcome claims as Speculative or vendor-reported until independent evidence exists.
2. **Alternative to a sixth lever:** fold AEO into insight and reporting plus content refresh. Choose this if page length is a constraint. The cost is that it understates the discovery shift. Preferred option is the sixth lever, with the caveat that the page stay category-level.
3. **Position the review spine as the thing the tool category leaves open.** Phrase it as "most agent platforms put a human approval step on every run and do not publicly describe risk-tiered auto-approval or an eval harness calibrated to reviewer decisions", not "none do".
4. **Fill the imagery and rights gap explicitly.** None of the three covers it, so the page's imagery-and-rights argument cannot lean on vendor evidence. Use other sources.
5. **Do not use vendor numbers as benchmarks.** At most use ranges as "vendor-reported" illustrations: for example execution-time reductions of 80-95% are claimed for web page assembly (Gradial) and about 89% for refresh time (AirOps). They are not comparable to 10k-asset creative production.
6. **Add a lock-in and build-vs-buy note** at category level: where run history, rules, brand context and eval data live determines portability. Own the eval set and brand rules regardless of vendor.

## 8. Gaps and verification still needed

- No independent (non-vendor, non-competitor) evaluation of any outcome claim. G2 and AWS Marketplace reviews were not read in detail.
- Gradial: supported CMS/DAM list, approval workflow, pricing, and the Axios valuation figure were not confirmed from primary pages.
- AirOps: tier availability of Human Review; Ramp case study; true pricing. The Webflow headline numbers conflict between its own pages.
- Profound: revenue, Series D from a primary source, tracking-accuracy methodology.
- Competitor reviews (Profound on AirOps, Analyze AI on Profound) are biased and were used only for limitations, flagged LOW-MEDIUM.
- Several details (AirOps docs, cohort, Gradial blog 95% claim, AirOps Webflow/Chime figures) came from search-result summaries and were not read in full on the source page.

## 9. Sources (accessed 2026-10-24)

Gradial: https://www.gradial.com, https://www.gradial.com/platform, https://gradial.com/customers, https://axios.com/2026/06/18/gradial-ai-agents-marketing, https://www.cmswire.com/digital-marketing/gradial-lands-65m-series-c-for-agentic-marketing-platform/, https://www.cmswire.com/digital-experience/gradial-raises-35m-series-b-to-scale-agentic-marketing-automation, https://www.madrona.com/harnessing-agentic-marketing-for-the-enterprise-gradials-series-c-fundraise/, https://pulse2.com/gradial-35-million-series-b/
AirOps: https://www.airops.com, https://www.airops.com/pricing, https://www.airops.com/enterprise, https://docs.airops.com/getting-started/core-concepts, https://cohort.airops.com/cohort-4, https://airops.com/blog/webflow-case-study, https://airops.com/blog/chime-case-study, https://www.thesaasnews.com/news/airops-raises-40-million-in-series-b/, https://www.cbinsights.com/company/airops/financials, https://seedtable.com/companies/airops/funding-rounds/series-b-2025-11, https://www.tryprofound.com/blog/airops-review (competitor-authored)
Profound: https://www.tryprofound.com, https://www.tryprofound.com/pricing, https://tryprofound.com/features/agents, https://thenextweb.com/news/profound-180m-series-d-ai-answer-engine-optimisation, https://dc.fortune.com/2026/02/24/exclusive-as-ai-threatens-search-profound-raises-96-million-to-help-brands-stay-visible/, https://www.tryanalyze.ai/blog/profound-ai-review (competitor-authored), https://www.conductor.com/academy/profound-agents/
