# Feature Research: Workflows and Labour Economics (v2.0 Autonomous Marketing Operations)

**Domain:** Enterprise marketing operations (100–300 FTE, $50–150M budget). The "features" here are the workflows a model must cover, plus the model elements (metrics, units, cost lines, guards) the v2.0 page needs.
**Researched:** 2026-10-25
**Remit:** Brief sections 3 (what 2x means), 4 (workflows agents should take over), 7 (labour and financial model), 8 (outcomes and scorecard)
**Overall confidence:** MEDIUM on the cost structure (two analyst surveys agree, plus BLS). MEDIUM on task-level AI productivity (several RCTs, none in a marketing organisation running agents end to end). LOW on workflow-level hours and agent reductions (no public benchmark; every default below is an illustrative assumption or a hypothesis).

---

## 0. Evidence classes used in this file

Every number carries one of the brief's four classes, plus a source-type flag where it matters.

| Tag | Brief class | Meaning here |
|-----|-------------|--------------|
| **[OBS]** | Observed evidence | Measured in the subject organisation. **There is none yet.** The 12-week pilot is the first source of OBS numbers. The page must say so. |
| **[BENCH]** | Sourced industry benchmark | A published figure with a URL and date. Further flagged as `vendor`, `consultancy`, `analyst`, `academic-RCT`, `gov` or `secondary` (read through a reproduction, not the primary). |
| **[ILLUS]** | Illustrative modelling assumption | A default chosen by this page to make the arithmetic work. Editable. No source. |
| **[HYP]** | Hypothesis requiring customer validation | A claim the programme depends on, which only the customer's own data or a pilot can confirm or refute. |

Mapping to the existing chips: [BENCH] = Benchmark, [ILLUS] = Modelled, [HYP] = Speculative. A Benchmark from another setting, such as an RCT on support agents, is still [BENCH]. It is never [OBS] for this organisation.

---

## 1. Validating the existing illustrative company (v1 baseline)

The v1 baseline: $1B revenue, $78M marketing budget (7.8%), 120 marketing FTE, 12 reviewer FTE, $150k loaded cost per FTE, 40 campaigns × 5 markets = 200 campaign-markets a year (50 a quarter), 1,000 master concepts, 40,000 variants.

### 1a. What holds up

| v1 figure | Check | Verdict |
|-----------|-------|---------|
| Budget 7.8% of revenue | Gartner 2026 CMO Spend Survey: 7.8% of revenue in 2026, up from 7.7% in 2025; n=401; fielded Jan–Mar 2026 [BENCH analyst] | **Holds.** Note that The CMO Survey (Duke/Deloitte/AMA, US only) reports higher figures: 9.4% of revenue in Spring 2025 and 9.0% reported for 2026. Mention it as a range so a CFO from a US firm is not surprised. |
| 120 FTE at $150k = $18.0M labour | 120 × $150k = $18.0M = **23.1% of $78M**. Gartner puts labour at 21.9% of marketing budget (2025) and **24.5% (2026, secondary report of the Gartner survey)**. 24.5% × $78M = $19.1M, about 127 FTE at $150k. [BENCH analyst] | **Holds well.** This is the strongest external validation of the v1 headcount. Put it on the page. |
| $150k loaded cost per FTE | BLS May 2025 median wage: marketing managers $166,790; market research analysts and marketing specialists $78,760. BLS ECEC June 2026: wages and salaries are 70.0% of private-industry employer compensation cost. So loaded compensation is about $238k for managers and $112k for specialists. A 1:2 manager-to-specialist mix gives about $154k. [BENCH gov] | **Holds as a US blend.** It is compensation only. It excludes space, IT and management overhead. State that it covers US compensation only, and that non-US or agency-heavy orgs differ. |
| Agency spend implied | Gartner 2025: agencies 20.7% of budget, paid media 30.6%, martech 22.4%, labour 21.9%. Gartner 2026: paid media 31.4%, martech 19.4% (five-year low), labour 24.5%. No 2026 agency share was found. [BENCH analyst] | 20.7% × $78M ≈ **$16.1M agency fees**. v1 does not model this line explicitly, only "reallocation from agency and production lines" ($1.03M). v2 must. |

### 1b. What does not hold up (must fix in v2)

1. **v1's "fully loaded cost per approved asset" excludes almost all marketer labour.** `calc.js` totals generation (concepts × $1,200 + variants × $4), review hours used × $100, rework, tooling, rights and storage. That is **$2.59M, or 3.3% of budget**. The 108 non-reviewer marketers ($16.2M) and most of the agency line ($16.1M) sit outside it. "$64.71 → $45.26 fully loaded" is a production-attributable cost, not a fully loaded one. **Rename it, or widen it.** The figure-panel label in `index.html` ("Cost per approved asset (USD, fully loaded)") is the specific string to change.
2. **$1,200 per master concept cannot be reconciled with in-house creative headcount.** At $150k ÷ 1,600 productive hours, $1,200 is about 13 loaded hours. A 20-plus person creative team producing 1,000 concepts a year spends about 35 hours per concept (see §4). Either $1,200 is the marginal external cost only, or the in-house labour is unmodelled. In v2, model labour hours and external cost per concept as separate lines.
3. **Review capacity: the spare capacity is pre-existing slack, not a saving.** At 1x with the gate, v1 uses **6,905 review hours** of a **14,400-hour** capacity (55.1% utilisation including rework). At 2x with the gate, review hours **rise** to **7,747** (61.9%). So:
   - Review hours **increase** by about 842 a year at 2x. They do not fall.
   - The 2x is absorbed by **about 6,500 hours of slack already unused at baseline**. Those hours are "capacity already unused under baseline assumptions" (brief §7). They are neither hours eliminated nor redeployed.
   - The cost model charges only the hours used (6,905 × $100 ≈ $0.69M), while 12 reviewer FTE cost about $1.8M. The idle 45% is invisible in the cost per asset. v2 should cost the reviewer team at FTE cost, show utilisation, and add the exception and sampling hours that agents create.
   - Either the baseline is overstaffed for variant review, or the 12-minute variant review leaves out concept-level, legal and claims review. Most likely the second. v2 should add concept and claims review as a separate review unit.
4. **"Flat marketing headcount" was asserted, not modelled** (v1 `asm-flat-marketing-headcount`, Speculative). The v2 workflow model below is what replaces that assertion.

---

## 2. Labour economics evidence (what the public record supports)

### 2a. Budget and cost structure

| Fact | Value | Class | Source (accessed 2026-10-25) |
|------|-------|-------|------------------------------|
| Marketing budget, share of revenue, 2025 | 7.7% | [BENCH analyst] | Gartner, 2025-05-12, n=402: https://www.gartner.com/en/newsroom/press-releases/2025-05-12-gartner-2025-cmo-spend-survey-reveals-marketing-budgets-have-flatlined-at-seven-percent-of-overall-company-revenue |
| Budget split, 2025 | paid media 30.6%, martech 22.4%, labour 21.9%, agencies 20.7% | [BENCH analyst] | Same release. Corroborated by Chief Marketer, 2025-05-25: https://chiefmarketer.com/gartner-39-of-cmos-plan-to-reduce-labor-costs-and-cut-agency-allocations/ |
| CMOs planning to cut labour costs / agency allocations, 2025 | 39% / 39% | [BENCH analyst] | Chief Marketer, 2025-05-25 (above) |
| CMOs saying genAI reduced reliance on agencies, 2025 | 22% | [BENCH analyst, secondary] | Attributed to the Gartner 2025 release in search summaries. Not seen in the primary text. **Verify before use.** |
| Budget share of revenue, 2026 | 7.8% | [BENCH analyst] | Gartner, 2026-05-11, n=401: https://www.gartner.com/en/newsroom/press-releases/2026-05-11-gartner-2026-cmo-spend-survey-finds-cmos-allocate-15-point-3-percent-of-marketing-budgets-to-ai-but-only-30-percent-are-ready-to-scale-ai-capabilities |
| AI share of marketing budget, 2026; share "ready to scale" | 15.3%; 30% | [BENCH analyst] | Same release |
| Budget split, 2026 | labour 24.5% (up from 21.9%), paid media 31.4%, martech 19.4% | [BENCH analyst, secondary] | Chief Marketer, 2026-06-24: https://www.chiefmarketer.com/gartner-cmo-spend-survey-budgets-reflect-increase-in-consumption-based-martech-paid-media-spend/ (agency share not reported) |
| US marketing budget, share of revenue, Spring 2025; headcount growth | 9.4%; +5.4% | [BENCH academic survey] | Duke Fuqua (The CMO Survey), 2025-04-01, n=281: https://www.fuqua.duke.edu/duke-fuqua-insights/marketing-strategic-influence-expands-as-does-scrutiny |
| AI share of marketing activities, Spring 2025 (self-reported); AI-attributed overhead-cost reduction | 17.2%; 10.8% | [BENCH academic survey, self-reported] | Same page |
| US marketing budget, 2026; headcount growth | 9.0% of revenue; headcount growth "declined by 50%" year on year | [BENCH secondary] | Portada, 2026-04-05: https://www.portada-online.com/latest-news/cmo-survey-ai-growth-marketing-headwinds-2026/. cmosurvey.org refused connections on 2026-10-25, so the primary was not read. |
| Marketing manager median wage, May 2025 | $166,790 | [BENCH gov] | https://www.bls.gov/ooh/management/advertising-promotions-and-marketing-managers.htm |
| Market research analysts and marketing specialists median wage, May 2025 | $78,760 | [BENCH gov] | https://www.bls.gov/ooh/business-and-financial/market-research-analysts.htm |
| Wages as share of employer compensation cost, private industry, June 2026 | 70.0% ($32.82 of $46.89/hr) | [BENCH gov] | https://www.bls.gov/news.release/ecec.nr0.htm |
| In-house agency penetration (ANA members); still using external agencies | 82% (2023, up from 78% in 2018); 92% | [BENCH industry body] | ANA, 2023, n=162: https://www.ana.net/miccontent/show/id/rr-2023-05-rise-in-house-agency |

**Implication for the model:** the addressable cost pool is **labour (~22–25%) plus agency fees (~21%)**, together **about 45% of the marketing budget, roughly $35M on the v1 company**. It is not the v1 production line ($2.6M). **Paid media (~31%) is working spend.** Agents may improve its allocation (effectiveness), but it is not a productivity saving and must never be counted as one.

### 2b. Where time goes (coordination, "work about work", rework)

All of these are vendor or sponsored surveys of self-reported time. Treat them as direction, not as rates.

| Fact | Value | Class | Source |
|------|-------|-------|--------|
| Knowledge-worker time on "work about work" | ~60% (63% at 5,000+ employee orgs) | [BENCH vendor, 2021] | Asana Anatomy of Work 2021 (Sapio, n=13,123): https://www.businesswire.com/news/home/20210114005374/en/ |
| Enterprise workers' time on primary job duties | 40% (US, 2018); 43% (2019 fieldwork, 4 countries, n=3,750) | [BENCH vendor, dated] | Workfront State of Work, via MarketingProfs: https://www.marketingprofs.com/charts/2019/42019/how-much-work-actually-gets-done-at-work |
| UK marketers spending at least a quarter of the week on low-value admin; top cause | 45%; slow approvals (38%) | [BENCH vendor, small sample] | Optimizely, 2026-08-18: https://www.optimizely.com/company/press/uk-survey-ai-admin/ |
| B2B marketers describing their role as 25% creative / 75% coordination | 37.9% | [BENCH vendor, secondary, LOW] | Optimizely "Rebalancing the Marketing Work System", via https://research.agilebrandguide.com/reports/optimizely/optimizely-rebalancing-the-marketing-work-system-addressing-the-passion-pressure-paradox |
| Average creative revision rounds before approval | 5 today (3 in 2007) | [BENCH industry body survey] | IPA BetterIdeas, n=1,034, reported by Marketing Week 2025-03-04: https://www.marketingweek.com/constructive-feedback-ipa/ |
| Regulated (pharma) promotional review: job duration; review duration; circulations; first-pass approval | 14.8 days; 7.6 days; 1.5; marketing 79.2%, medical 66.7%, regulatory 64.6%, legal 55.7% | [BENCH vendor platform data] | Vodori 2025 benchmarks: https://www.vodori.com/blog/how-your-medical-legal-regulatory-review-compares-in-2025 |
| Pharma average content approval time; pre-review delay | 21 days; 5–150 days per asset | [BENCH vendor] | Veeva PromoMats white paper (2025): https://www.veeva.com/eu/wp-content/uploads/2025/05/Veeva-PromoMats-Next-gen-MLR-Review.pdf |
| Marketing content that goes unused | 65% of sales content (Forrester 2018); 37% unusable + 28% unfindable (SiriusDecisions) | [BENCH analyst, dated] | https://www.forrester.com/report/sales-content-its-time-for-an-overhaul/RES174090; https://contently.com/strategist/2017/09/08/quietly-sabotaging-marketing-budget |
| Expected content demand growth | 71% expect >5x by 2027 (2025 survey, n≈1,600) | [BENCH vendor, interested party] | Adobe: https://business.adobe.com/blog/71-percent-of-marketers-say-content-demand-to-increase-5x |

**Use on the page:** these numbers justify the thesis that coordination, approvals and rework, not generation, are where the labour sits. They do not justify any specific hours-per-unit default. The unused-content figure is the strongest single argument against counting assets as output.

### 2c. Localisation

| Fact | Value | Class | Source |
|------|-------|-------|--------|
| Per-word rates: human translation; full MT post-edit; light post-edit | $0.15–0.30; $0.08–0.15; $0.03–0.08 | [BENCH vendor price guide, LOW] | Polilingua (LSP): https://www.polilingua.com/blog/post/machine-translation-post-editing-strategy-guide.htm |
| Typical MTPE discount | ~30% off the human rate (rule of thumb) | [BENCH secondary, forum, LOW] | ProZ threads (2017–2022) |
| Neural MT post-editing speed-up | wide variance; pre-LLM, one domain | [BENCH academic] | Läubli et al. 2019: https://arxiv.org/abs/1906.01685 (already in the v1 register) |
| LLM post-editing of literary text | significantly less time than translating from scratch, similar creativity | [BENCH academic] | MT Summit 2025: https://aclanthology.org/2025.mtsummit-1.40 |

**Gap:** no authoritative 2025–26 per-word average (CSA Research and Slator data are paywalled), and no general LLM post-editing words-per-hour benchmark. Per-word cost and post-edit share stay [ILLUS]/[HYP]. Transcreation and in-market review dominate cost for campaign content, and translation per word understates them.

---

## 3. AI and agent productivity evidence (task level, graded)

**Key framing for the page:** every rigorous study below measures **AI assistance on tasks** (ladder rung 1), sometimes rung 2. **None measures a marketing organisation delegating end-to-end workflows to agents.** The evidence supports "task time falls 14–55% inside the frontier, with quality risk outside it". It does not support "workflow labour halves". That step is [HYP].

| Study | Setting | Result | Class / caveat | Source |
|-------|---------|--------|----------------|--------|
| Brynjolfsson, Li, Raymond, *QJE* 140(2), 2025 | 5,179 customer-support agents, staggered rollout | +14% issues resolved per hour; largest gains for novices (34% in the working paper), little for experienced staff | [BENCH academic-RCT-like (staggered)] | https://www.nber.org/papers/w31161 |
| Dell'Acqua et al. ("Jagged Frontier"), HBS WP 2023 | 758 BCG consultants, 18 tasks | Inside the frontier: +12.2% tasks, 25.1% faster, >40% higher quality. **Outside: 19 percentage points less likely to be correct** | [BENCH academic-RCT, working paper] | https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf |
| Noy & Zhang, *Science* 2023 | 453 professionals, mid-level writing tasks (incl. marketing-style) | −40% time, +18% quality | [BENCH academic-RCT] Short isolated tasks, no fact-checking. | https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1_0.pdf |
| Ju & Aral, "Collaborating with AI Agents", arXiv v3 2026-02 (v4 2026-10-15) | 2,234 participants, 11,024 ads, field test about 5M impressions on X | Human–AI teams: **+50% ads per worker** (60% in v1), better text quality; human–human teams better image quality; both qualities moved CTR/CPC | [BENCH academic-RCT, preprint, **the closest marketing evidence**] Shows output ≠ outcome: per-worker output rose while performance depended on quality dimensions. | https://arxiv.org/abs/2503.18238 |
| Dell'Acqua et al., "Cybernetic Teammate", NBER w33641, 2025 | 776 P&G professionals, real product-innovation tasks | Individuals with AI matched teams without AI; AI broke functional silos | [BENCH academic-RCT] | https://www.nber.org/papers/w33641 |
| Peng et al., arXiv 2023 | Copilot, single coding task | 55.8% faster (95% CI 21–89%) | [BENCH academic-RCT, one task] | https://arxiv.org/abs/2302.06590 |
| Cui, Demirer et al., 2025 (*Management Science*) | 4,867 developers, 3 company field experiments | +26.08% completed tasks (SE 10.3%) | [BENCH academic-RCT] | https://papers.ssrn.com/abstract=4945566 |
| METR, 2025-07-10 | 16 experienced OSS developers, 246 tasks | **19% slower** with AI, while developers believed they were 20% faster | [BENCH academic-RCT, small] The self-report bias warning applies to every marketing survey above. | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ |
| Humlum & Vestergaard, 2025 | Danish admin data, 25,000 workers, 11 exposed occupations | Average time savings 2.8%; no detectable earnings or hours effect | [BENCH academic, observational] Organisation-level gains lag task gains. | https://bfi.uchicago.edu/wp-content/uploads/2025/04/BFI_WP_2025-56-3.pdf |
| Bick, Blandin, Deming (St. Louis Fed) | US survey, Nov 2024 | Users save 5.4% of hours; 1.4% across all workers | [BENCH gov-hosted survey, self-reported] | https://www.stlouisfed.org/on-the-economy/2025/feb/impact-generative-ai-work-productivity |
| Anthropic, 2025-11 | 100k Claude conversations, model-estimated | ~80% task-time reduction; +1.8% a year US labour productivity if adopted | [BENCH vendor, model-estimated, excludes validation time] | https://www.anthropic.com/research/estimating-productivity-gains |
| BCG CMO Survey 2026, 2026-06-15 | 300 CMOs plus client engagements | Client engagements: "cost efficiency improvements of 20% to 30%", "threefold increase in marketing ROI", "tenfold improvement in campaign cycle times". 42% still use genAI only as task assistant; ~8% connect agents to run some campaigns autonomously | [BENCH consultancy, client-selected, no method] Use as an aspiration marker, never as a default. | https://web-assets.bcg.com/pdf-src/prod-live/making-the-agentic-marketing-transformation-a-reality.pdf |
| McKinsey, "Economic potential of generative AI", 2023-06 | Model estimate | Marketing productivity uplift 5–15% of total marketing spend (~$463B) | [BENCH consultancy estimate, secondary, not verified in primary text] | https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier |

**What the evidence lets the page say:**
- Task-level speed-ups of **roughly 15–55%** are well evidenced inside the frontier. **Use 25–40% as the "assistance" band** [BENCH-anchored range].
- Gains are **uneven** (jagged frontier). Quality falls on tasks outside the frontier. This is the evidential basis for review gates and evals.
- **Organisation-level gains are far smaller than task-level gains so far** (2.8%; 1.4–5.4%). The gap between the two is coordination, verification and adoption. That gap is exactly what the v2 thesis says agents with workflow ownership must close. It is therefore the **central [HYP]**, and the pilot exists to test it.
- **The 50% workflow-hour reductions needed for 2x are not shown anywhere in public evidence.** Consultancy figures (BCG 20–30% cost efficiency) are the only claims at that scale, and they are unverified.

---

## 4. Workflow inventory (the "features" the model must cover)

**Illustrative allocation of the v1 company's 120 FTE** [ILLUS, HYP: replace with the customer's org chart]. Productive hours: **1,600 per FTE per year** [ILLUS: 2,080 contract hours minus about 200 leave and holidays minus about 280 non-attributable time; no public benchmark]. Reviewers keep v1's 1,200-hour fatigue cap. 92 FTE are in scope. **28 FTE are out of scope**: leadership, product marketing strategy, comms/PR, events, partner and field relationships, sales enablement. They are not modelled for delegation. Give them only an assistance-level uplift.

Agency fees (~$16M, from Gartner's 20.7%) are allocated by workflow [ILLUS]. Paid media (~$24.5M) is excluded from all savings.

Autonomy ladder used below (from brief §2): **L1** assistance, **L2** agentic execution with human review of each output, **L3** higher autonomy (execute, self-evaluate, correct, escalate exceptions, human samples), **L4** outcome-directed (choose permitted actions from performance feedback).

### W1. Market and customer research and insight
- **Work today:** competitive scans, win/loss synthesis, survey design and analysis, social listening readouts, persona and segment refreshes, research requests from campaign teams.
- **Objective:** better targeting and messaging decisions. Fewer campaigns built on wrong assumptions.
- **People, agencies, tools:** insights analysts, research agencies and panels, syndicated data, social listening, survey platforms, call-recording and CRM data.
- **Labour, delay, rework:** desk research and synthesis, waiting on panel fieldwork, re-cutting data for each stakeholder, findings rarely reaching briefs.
- **Agents could:** continuous competitive and category monitoring; synthesis of calls, reviews and CRM notes; first-draft survey instruments; standing "insight packs" attached to every brief.
- **Stays human:** research questions that matter, primary research with customers, interpretation that changes strategy, panel spend decisions.
- **Infrastructure:** governed access to CRM, call transcripts and reviews; a source-citing retrieval layer; a provenance trail for every claim.
- **Units:** insight deliverables. **Illustrative default:** 160 a year × 50 h = 8,000 h (5 FTE). Agency $1.5M.
- **Agent-enabled default:** −40% net hours (range 25–55%) [HYP]. Feasible level at 12 months: L2–L3 for monitoring and synthesis, L1 for primary research.

### W2. Planning, briefing and campaign operations
- **Work today:** turning objectives into plans and briefs, building project plans, assigning work, chasing status, routing approvals, managing calendars, reconciling versions across work-management, DAM and CMS.
- **Objective:** ship the right campaigns on time. This is the critical path of objective-to-live.
- **People, agencies, tools:** campaign managers, marketing ops, project managers, agency account teams; work-management, DAM and calendar tools.
- **Labour, delay, rework:** this is where "work about work" concentrates (vendor surveys put it at 40–60% of knowledge-worker time). Handoffs, status meetings, incomplete briefs that cause downstream rework (IPA: 5 revision rounds), and approval queues (Optimizely: slow approvals are the top cause of unnecessary work).
- **Agents could:** draft briefs from objective plus insight pack plus brand policy; decompose the brief into a work plan and tickets; derive the market and variant plan; track state; chase owners; assemble approval packets; flag risk to dates.
- **Stays human:** the objective, budget, the go or no-go, priority trade-offs between campaigns, and agency relationships.
- **Infrastructure:** **workflow state and orchestration**. This is the core build. Plus connectors to work management, DAM and CMS, an objective registry, and policy access.
- **Units:** campaign-markets launched (reuses the v1 headline unit). **Default:** 200 a year × 96 h = 19,200 h (12 FTE). Agency $0.5M.
- **Agent-enabled default:** −50% (30–65%) [HYP]. Feasible level: L3 for plan, track and route; L1 for decisions.

### W3. Content and creative production (master assets)
- **Work today:** concepting, copy, design, video and imagery, plus production of master assets.
- **Objective:** distinctive, on-brand assets that perform.
- **People, agencies, tools:** in-house studio, creative agencies, production houses, freelancers, design and genAI tools, stock and licensing.
- **Labour, delay, rework:** revision rounds (IPA: 5), brief ambiguity, agency coordination overhead, rights clearance.
- **Agents could:** first drafts of copy and layouts within brand templates; asset assembly from approved components; rights metadata checks; pre-review self-evaluation against the brand policy.
- **Stays human:** creative direction, the big idea, final taste calls, talent and shoot direction, anything with novel claims.
- **Infrastructure:** brand policy as machine-checkable rules, a component library, evals, rights metadata in the DAM.
- **Units:** master concepts (v1: 1,000 a year). **Default:** 1,000 × 35 h = 35,200 h (22 FTE). Agency $6.0M.
- **Agent-enabled default:** −35% (20–50%) [HYP]. Anchored on writing RCTs (−40% time; Ju & Aral +50% ads per worker) **but** discounted, because creative direction and approval do not compress. Feasible level: L1–L2. **This workflow should not be where 2x comes from.**

### W4. Channel adaptation, localisation and transcreation
- **Work today:** resizing and re-cutting for channels; translation; transcreation; in-market review; legal localisation (claims, disclaimers); market-specific offers.
- **Objective:** reach more markets faster at acceptable quality. This drives the "campaign-markets" count.
- **People, agencies, tools:** regional marketers, localisation PMs, LSPs and translators, in-market reviewers; TMS, MT and LLM, DAM.
- **Labour, delay, rework:** handoffs to the LSP and back, in-market review latency, glossary drift, re-doing all markets when the master changes.
- **Agents could:** derive the variant matrix (v1 "derive, don't generate"); translate and post-edit with glossaries and translation memory; check terminology and claims; route only flagged segments to linguists; re-propagate master changes.
- **Stays human:** transcreation of headline creative in priority markets, in-market cultural sign-off for high-risk content, market entry decisions.
- **Infrastructure:** TMS and glossary connectors, per-market policy (claims, disclaimers, regulation), quality estimation, the review gate.
- **Units:** campaign-market adaptations. **Default:** 200 × 80 h = 16,000 h (10 FTE). Vendor $2.0M.
- **Agent-enabled default:** −55% hours (40–70%) and −30–50% vendor spend [HYP; MTPE pricing at about 70% of human rate is LOW-grade evidence]. Feasible level: **L3**. Highly repeatable, verifiable against glossary and policy, and easy to measure. **Strong candidate for 2x.**

### W5. Brand, legal and regulatory approval
- **Work today:** brand review, legal and claims review, regulatory or medical review in regulated sectors, accessibility and privacy checks.
- **Objective:** no brand, legal or regulatory incidents, without blocking launches.
- **People, agencies, tools:** brand team, in-house counsel, outside counsel for spikes, compliance; proofing and review tools.
- **Labour, delay, rework:** queues (Vodori: 7.6-day review, 14.8-day job; first-pass legal approval 55.7%), repeated circulations, inconsistent reviewers.
- **Agents could:** pre-review every asset against versioned policy; auto-approve T0/T1 (v1 tiers); prepare annotated packets for T2/T3; enforce disclaimers; maintain a ground-truth eval set from human decisions (v1 harness).
- **Stays human:** T2/T3 decisions, novel claims, policy changes, regulated sign-off where law requires a named human, sampling audits.
- **Infrastructure:** the v1 spine (review agent, tiers, harness, telemetry). It is reusable across every other workflow.
- **Units:** variants reviewed (v1: 40,000 a year at 12 min) **plus concept and claims reviews** (new, [ILLUS] 1,000 a year × 2 h). **Use the v1 reconciliation in §1b.**
- **Agent-enabled effect:** per-unit human hours fall through auto-approval, but **total review hours can rise with volume** (v1: 6,905 → 7,747). Report utilisation, exception hours and sampling hours explicitly.

### W6. Publishing, distribution and activation
- **Work today:** CMS page builds, email builds and QA, ad trafficking and set-up, audience uploads, link and UTM tagging, tracking QA, go-live checks.
- **Objective:** correct, on-time deployment with tracking that works.
- **People, agencies, tools:** web producers, email ops, ad ops, media agency trafficking; CMS, ESP, ad platforms, tag manager.
- **Labour, delay, rework:** manual re-keying, broken links and tags, QA loops, queueing for web dev.
- **Agents could:** build pages and emails from approved components, set up campaigns via APIs, apply UTM conventions, run pre-flight QA, **verify deployment** (rendered page, tag fired, link resolves) and roll back on failure.
- **Stays human:** permission for spend changes above thresholds, first deploy in a new channel, incident response.
- **Infrastructure:** permissioned write connectors (CMS, ESP, ad platforms), dry-run and rollback, deployment verification, an audit log.
- **Units:** publish jobs. **Default:** 12,000 × 1.2 h = 14,400 h (9 FTE). Agency $1.5M (share of trafficking fees).
- **Agent-enabled default:** −60% (40–75%) [HYP]. Feasible level: **L3**. Deterministic success checks make autonomy measurable. **Strong candidate.**

### W7. Search and answer-engine visibility (SEO, AEO/GEO)
- **Work today:** technical SEO audits, content refreshes, schema, internal linking, tracking visibility in AI answers (v1 lever 6).
- **Objective:** discovery and organic demand. v1 graded AEO outcomes Speculative.
- **People, agencies, tools:** SEO specialists, content agencies; crawl tools, rank and visibility trackers, CMS.
- **Labour, delay, rework:** audit-to-fix lag (fixes queue behind web dev), refresh backlog.
- **Agents could:** continuous audit, propose and (within policy) apply fixes to metadata, schema and links; refresh stale pages through the review gate; monitor answer-engine citations.
- **Stays human:** content strategy, anything that changes positioning, interpreting volatile visibility data.
- **Units:** pages optimised or refreshed. **Default:** 1,600 × 4 h = 6,400 h (4 FTE). Agency $1.5M.
- **Agent-enabled default:** −40% (25–55%) [HYP]. Feasible level: L3 for technical fixes, L2 for content. Outcome evidence remains weak (v1 lever 6 sources).

### W8. Experimentation and conversion optimisation
- **Work today:** hypothesis backlog, test design, building variants, QA, running tests, analysis, roll-out.
- **Objective:** conversion rate, and learning velocity.
- **People, agencies, tools:** CRO specialists, analysts, developers, CRO agencies; experimentation platform, analytics.
- **Labour, delay, rework:** build and QA time, developer queue, underpowered tests, analysis backlog.
- **Agents could:** generate hypotheses from analytics, build variants, run power checks, QA, monitor guardrails, write readouts, propose the next test (**L4 candidate later**).
- **Stays human:** what metric matters, tests touching price, legal or UX-critical flows, ship decisions on ambiguous results.
- **Units:** experiments (v1: 20 a quarter = 80 a year). **Default:** 80 × 80 h = 6,400 h (4 FTE). Agency $0.5M.
- **Agent-enabled default:** −30% (20–45%) [HYP]. **Capacity is bounded by traffic, not labour.** Doubling test count halves the power per test unless traffic grows (Lewis & Rao; Kohavi, already in the register). **Do not promise 2x tests without a traffic check.**

### W9. Performance measurement and reporting
- **Work today:** weekly and monthly dashboards, campaign wrap reports, QBR decks, ad-hoc questions, data pulls, attribution and MMM refreshes (often an outside consultancy).
- **Objective:** credible numbers for decisions and for the CFO.
- **People, agencies, tools:** marketing analysts, marketing ops, analytics agencies; BI, CDP, MMM tools.
- **Labour, delay, rework:** manual data pulls, reconciling definitions, rebuilding the same deck, answering one-off questions.
- **Agents could:** produce recurring reports, answer questions over a governed semantic layer with citations, flag anomalies, draft wrap reports.
- **Stays human:** metric definitions, causal claims, budget reallocation decisions, MMM model choices.
- **Infrastructure:** **outcome measurement** (shared with every workflow): a governed metrics layer, holdout and geo-test design, an objective registry.
- **Units:** reports and analyses. **Default:** 600 × 16 h = 9,600 h (6 FTE). Agency $1.0M.
- **Agent-enabled default:** −50% (35–65%) [HYP]. Feasible level: L3 for recurring, L2 for ad-hoc.

### W10. Campaign monitoring, optimisation and iteration
- **Work today:** pacing checks, bid and budget shifts, creative fatigue detection and refresh, audience tweaks, alerting, weekly optimisation calls with the media agency.
- **Objective:** efficiency of working media (CPA, ROAS) and pipeline.
- **People, agencies, tools:** performance marketers, media agency; ad platforms (which already automate bidding), analytics.
- **Labour, delay, rework:** dashboard watching, slow reaction to fatigue, agency meeting cadence.
- **Agents could:** monitor pacing and fatigue; propose or (within budget bands) apply permitted changes; trigger creative refresh through W2–W6; log every action with expected and observed effect (**L4**).
- **Stays human:** budget envelopes, channel mix, any spend change outside bands, brand-safety calls.
- **Note:** ad platforms already run bidding autonomously. **Build only the cross-channel and creative-refresh loop, not bidding.**
- **Units:** campaign-market-weeks monitored. **Default:** 1,600 × 8 h = 12,800 h (8 FTE). Agency $1.5M.
- **Agent-enabled default:** −40% (25–55%) [HYP]. Effectiveness gains here bear on working media, and are measured separately.

### Illustrative baseline roll-up (all [ILLUS] unless noted)

| Workflow | FTE | Units/yr | Baseline h/unit | Annual hours | Labour $M | Agency $M | Net hour reduction default (range) | Capacity multiple at default |
|---|---|---|---|---|---|---|---|---|
| W1 Research | 5 | 160 | 50 | 8,000 | 0.75 | 1.5 | 40% (25–55) | 1.67x |
| W2 Planning/ops | 12 | 200 campaign-markets | 96 | 19,200 | 1.80 | 0.5 | 50% (30–65) | 2.00x |
| W3 Creative production | 22 | 1,000 concepts | 35 | 35,200 | 3.30 | 6.0 | 35% (20–50) | 1.54x |
| W4 Adaptation/localisation | 10 | 200 adaptations | 80 | 16,000 | 1.50 | 2.0 | 55% (40–70) | 2.22x |
| W5 Review | 12 | 40,000 variants + 1,000 concepts | v1 model | 14,400 capacity (6,905 used, v1) | 1.80 | — | via v1 gate; total hours may rise | n/a |
| W6 Publishing/activation | 9 | 12,000 jobs | 1.2 | 14,400 | 1.35 | 1.5 | 60% (40–75) | 2.50x |
| W7 SEO/AEO | 4 | 1,600 pages | 4 | 6,400 | 0.60 | 1.5 | 40% (25–55) | 1.67x |
| W8 Experimentation | 4 | 80 tests | 80 | 6,400 | 0.60 | 0.5 | 30% (20–45) | 1.43x (traffic-capped) |
| W9 Measurement | 6 | 600 reports | 16 | 9,600 | 0.90 | 1.0 | 50% (35–65) | 2.00x |
| W10 Monitoring/optimisation | 8 | 1,600 cm-weeks | 8 | 12,800 | 1.20 | 1.5 | 40% (25–55) | 1.67x |
| **In scope** | **92** | | | | **13.8** | **16.0** | | |
| Out of scope | 28 | — | — | — | 4.2 | (in other lines) | assistance only, 10–15% | — |
| **Total** | **120** | | | | **18.0** (23.1% of budget; Gartner 21.9–24.5% [BENCH]) | **16.0** (Gartner 20.7% [BENCH]) | | |

**The arithmetic the page must show:**
- Net hours released at default, excluding review: **~57,000 h ≈ 35.6 FTE-equivalent**. Range: 36,400 (low) to 76,200 (high), so **23–48 FTE-equivalent**.
- Capacity multiple on the 80 non-review in-scope FTE: **1.40x low / 1.80x default / 2.47x high**.
- **Organisation-wide** (all 120 FTE, 192,000 h): default 57,000 / 192,000 = 30% → **1.42x**. Adding an assistance-level 15% for the 28 out-of-scope FTE gives about **1.5x**.
- **Conclusion:** at the page's own defaults, **2x on labour hours across the whole organisation is not reached**. 2x is plausible **on a delegated portfolio** (W2, W4, W6, W9 at or above default) and **on output per fully loaded dollar** once agency substitution is included (see §5). The page should say this plainly. It is the honesty that makes the rest credible. It also answers the brief's "do not assume every function must be transformed".

**Net hour reduction is net of agent-created human work.** For each workflow, split the agent-enabled hours into (a) residual execution hours and (b) **review, sampling and exception hours** that agents generate. Suggested default for (b): 15–25% of the baseline hours in L2 workflows, 5–10% in L3 [ILLUS]. Without (b) the model overstates the gains. v1 already shows the effect in review.

---

## 5. Defining 2x (brief §3): candidate metrics and the recommendation

| Candidate | Pros | Cons | Verdict |
|-----------|------|------|---------|
| Assets or variants per FTE | Easy to count | Mechanical and gameable (v1 already rejected it); 65% of content goes unused (Forrester/SiriusDecisions) | **Reject as a headline.** Internal throughput only. |
| Campaign-markets launched per FTE (v1 headline, per quarter) | Meaningful to a CMO, hard to inflate without real launches | Covers only the content supply chain; launches vary hugely in size; ignores analytics, optimisation and SEO work | **Keep as the headline for the content-supply-chain wedge.** |
| Objective-to-live time | Captures coordination and handoff removal, the thesis; CFO-legible | A speed metric, not a volume metric; can improve while output falls | **Primary guardrail and cycle-time metric** |
| Pipeline (qualified opportunities) per marketing FTE | Closest to business value | Dominated by market conditions, sales and media spend; attribution noise (Lewis & Rao: median ROI CI over 100 pp); lags quarters | **Outcome metric, not the productivity metric.** Measure with holdouts and MMM. |
| Equivalent output per fully loaded dollar (labour + agency + AI/software) | Captures agency substitution and AI cost; the CFO's question | Needs an output index; easier to "double" by cutting spend | **Secondary headline: the efficiency view** |
| **Completed workflow output per in-scope FTE, weighted at baseline standard hours** | Handles heterogeneous work; weights are frozen at baseline, so cheap units cannot be inflated; counts only completed, approved, live, objective-linked units; maps directly to the hours model | Needs a baseline time study (the pilot does this); weights age | **Recommended primary metric** |

**Recommendation:**
- **Primary (capacity):** *useful work completed per in-scope marketing FTE*. That is Σ(completed units × frozen baseline hours per unit) ÷ in-scope FTE. 2x means the same people complete twice the baseline-valued work. A unit counts only if it is linked to a registered objective, approved, and live or delivered. Cancelled and unused work does not count.
- **Efficiency view:** the same index ÷ fully loaded cost (labour + agency + AI/software + platform).
- **Wedge headline:** campaign-markets launched per quarter (v1, kept).
- **Guardrails (each with a falsifier, as in v1):** objective-to-live time; first-pass acceptance; compliance and brand escape rate; human interventions per workflow; share of agent actions achieving verified objectives.
- **Outcomes (effectiveness), never claimed as doubled:** qualified pipeline, CAC or cost per qualified opportunity, conversion, marketing-attributed revenue, MROI. Measure with holdouts, geo tests and MMM.

**Capacity vs efficiency vs effectiveness on the v1 company (default numbers, [ILLUS]):**
- **Capacity (Scenario A):** 80 non-review in-scope FTE deliver about 1.8x baseline-weighted work. Org-wide about 1.4–1.5x.
- **Efficiency (Scenario B):** the same output with about 36 fewer FTE-equivalents of hours (about $5.3M of loaded labour at $150k), **plus** agency reductions on the lines agents substitute (W1, W4, W6, W7, W9 and W10 fees; for example, 30–50% of about $9M ≈ $2.7–4.5M [HYP]), **minus** AI, software and platform cost ([ILLUS] $1.5–3M a year; v1 already assumes $0.6M for production tooling alone).
- **Effectiveness:** unknown until measured. See §7.

---

## 6. Three scenarios (brief §7): what each means and how to keep them distinct

| Scenario | Holds fixed | Moves | Financial meaning | Main trap |
|----------|-------------|-------|-------------------|-----------|
| **A. Same team, more output** | FTE, agency budget | Output index ↑ | **No cash saving.** Value only if the extra output earns a return (effectiveness). | Reporting released hours as savings |
| **B. Same output, lower cost** | Output index | Hours ↓, agency ↓, AI cost ↑ | Cash saving = removable labour + reducible agency − new AI/platform cost − change cost (severance, training) | Counting hours as cash when they are fragmented (0.3 FTE across 10 people is not removable) |
| **C. Growing demand, limited hiring** | Hiring plan capped | Output grows with demand; hours per unit fall | **Avoided hires and avoided agency growth** against a counterfactual growth plan | The counterfactual: avoided hires are only real if the hires were planned and funded |

**Recommended v1-company framing:** C is the most credible for most CMOs. Gartner reports flat budgets (7.7% to 7.8%). Adobe's vendor survey (an interested party) reports expected content demand growth above 5x. And headcount growth halved, according to the secondary CMO Survey 2026 report. Present A as the capacity ceiling, B as the CFO floor, and C as the default narrative.

---

## 7. Why doubled capacity is not doubled revenue (brief §3, §8)

| Mechanism | Evidence | Class |
|-----------|----------|-------|
| **Diminishing returns to media.** MMM response curves are concave or S-shaped (Hill saturation plus adstock carry-over). Meridian documents Hill shape and slope parameters and adstock decay. | https://developers.google.com/meridian/docs/advanced-modeling/model-spec (updated 2026-10-09) | [BENCH vendor docs] |
| **Advertising elasticities are small.** Median TV ad elasticity is about 0.01 across 288 brands: doubling TV ads raised sales about 1%. More than 80% of brands had negative marginal ROI. | Shapiro, Hitsch, Tuchman, *Econometrica* 89(4) 2021: https://papers.ssrn.com/abstract=3273476 ; Kellogg Insight summary | [BENCH academic] |
| **Measurement noise.** Across 25 large field experiments, the median ROI confidence interval was over 100 percentage points wide. Informative experiments can need more than 10M person-weeks. | Lewis & Rao, *QJE* 130(4) 2015 | [BENCH academic] |
| **More output ≠ better performance.** Human–AI ad teams produced 50% more ads per worker, but performance depended on text and image quality, and human teams were better on images. | Ju & Aral 2026 | [BENCH academic-RCT preprint] |
| **Content saturation.** 65% of content goes unused. More assets can mean more waste. | Forrester / SiriusDecisions (dated) | [BENCH analyst] |
| **Experiment capacity is traffic-bound.** Doubling tests without more traffic lowers the power of each test. | Kohavi 2013 (v1 register) | [BENCH academic] |

**Causal chain for the page (where the evidence stops):**
software built → agents take workflow steps **[BENCH task-level; HYP workflow-level]** → fewer human execution and coordination hours **[HYP; pilot measures]** → shorter objective-to-live **[HYP; pilot measures]** → more campaign-markets, experiments and refreshes per FTE **[HYP]** → faster learning and better allocation of working media **[HYP]** → more qualified pipeline at a lower cost per opportunity **[HYP; requires holdout or MMM; may be zero at the margin, per Shapiro et al.]**.

The page should mark the boundary with a visible line after "shorter objective-to-live". Everything to the right is a hypothesis with a named test.

**Most defensible outcome mechanisms** (better than "more volume = more revenue"):
1. **Speed to market.** Launching in additional markets weeks earlier captures demand that otherwise goes uncaptured. Measurable per market.
2. **Learning velocity.** More well-powered tests and faster creative refresh against fatigue.
3. **Reallocation.** Hours and agency dollars moved to higher-marginal-ROI work. Requires MMM marginal-ROI curves.
4. **Coverage.** Markets, segments or long-tail pages that were never served before, where response is not yet saturated.

---

## 8. Do-not-double-count register (quality gate)

These must be separate lines in the model and on the page, and must never be summed into one "savings" figure.

1. **Hours eliminated vs capacity redeployed.** A released hour is either redeployed (Scenario A: output, no cash) or removed (Scenario B: cash). It is never both.
2. **Redeployed capacity vs unused capacity.** Released hours that are neither redeployed nor removed are **unused**. Report them explicitly. Fragmented releases (under 1 FTE per team) default to unused or redeployed, not removed.
3. **Capacity already unused at baseline.** v1 reviewers run at 55% utilisation at baseline. That slack absorbs 2x volume. It is **not** an agent saving. More generally, apply a baseline utilisation factor before claiming released hours.
4. **Avoided hires vs removable headcount.** Avoided hires (Scenario C) are against a counterfactual hiring plan. Removable headcount is against today's payroll. The same FTE-equivalent cannot be both.
5. **Labour savings vs agency savings.** If agents substitute for agency work, the saving is agency fees. If in-house staff then oversee the agents, those hours are a labour **cost**, not a second saving. Insourcing agency work **raises** internal hours.
6. **Agency savings vs v1's $1.03M reallocation.** v1 already spends about $1.03M of agency and production fees to fund the production cost rise. Those dollars cannot be counted again as a v2 agency saving.
7. **Review hours.** Hours saved by auto-approval in W5 vs new sampling, exception and eval-curation hours. Report them net. Do not count the auto-approval saving inside W3 or W4 as well.
8. **Overlapping workflows.** Brief drafting sits in W2, not W3. Variant derivation sits in W4, not W3. Deployment QA sits in W6, not W5. Each hour belongs to exactly one workflow.
9. **Same baseline resource claimed by two levers.** For example, regional marketers' hours appear in both localisation (W4) and monitoring (W10). Allocate their time once, by percentage.
10. **Efficiency vs effectiveness.** Cost per output falling is not a revenue gain. Pipeline uplift must come from holdout or MMM evidence, never from output growth × an average conversion rate.
11. **Working media.** Paid media (about 31% of budget) is not a productivity saving. Better allocation shows up as effectiveness (CPA, ROAS), measured separately.
12. **AI cost.** Count it once, as a run cost (inference + platform + evals). Do not net it inside per-unit costs and also show it as a separate line.
13. **One-off vs run-rate.** Build cost, change cost (v1: $3,000 per affected FTE) and severance are one-off. Savings are annual run-rate. Show payback, not a blended number.
14. **Task speed-up vs workflow speed-up.** Do not apply RCT task-time gains (e.g. −40%) to whole-workflow hours. Coordination and verification hours do not shrink at task rates (Humlum & Vestergaard: 2.8% average).

---

## 9. Prioritisation (brief §4)

Scores 1–5, [ILLUS] judgement informed by the evidence above. Value = hours + agency $ in scope. Feasibility = current agent reliability plus integration difficulty. Repeatability = volume and standardisation. Risk = brand, legal or spend exposure (5 = low risk). Measurable autonomy = deterministic verification of success.

| Workflow | Value | Feasibility | Repeatability | Risk (5=low) | Measurable autonomy | Total | Role in programme |
|----------|-------|-------------|---------------|--------------|---------------------|-------|-------------------|
| W4 Adaptation/localisation | 4 | 4 | 5 | 3 | 4 | **20** | **Pilot core** |
| W6 Publishing/activation | 3 | 4 | 5 | 3 | 5 | **20** | **Pilot core** (verify deployment) |
| W2 Planning/briefing/ops | 4 | 3 | 4 | 4 | 3 | **18** | **Pilot core** (orchestration spine) |
| W5 Review (pre-review + T0/T1) | 3 | 4 | 5 | 2 | 4 | **18** | **Pilot enabler** (v1 spine) |
| W9 Measurement/reporting | 3 | 4 | 4 | 4 | 3 | 18 | Quarter 2 |
| W10 Monitoring/optimisation | 3 | 3 | 4 | 2 | 4 | 16 | Quarter 3 (bounded L4) |
| W7 SEO/AEO | 2 | 4 | 4 | 3 | 3 | 16 | Quarter 2–3 |
| W1 Research/insight | 2 | 4 | 3 | 4 | 2 | 15 | Quarter 2 (feeds briefs) |
| W8 Experimentation/CRO | 2 | 3 | 3 | 3 | 4 | 15 | Quarter 3 (traffic-capped) |
| W3 Creative production (masters) | 5 | 2 | 2 | 2 | 2 | 13 | Assistance (L1–L2) throughout; **not a 2x source** |

**Recommended pilot slice:** "Launch an approved campaign in N additional markets". W2 plans, W4 adapts and localises, W5 pre-reviews and auto-approves T0/T1, W6 publishes and verifies, and the first W9 readout is produced. It matches brief §6's example. It uses the v1 headline unit (campaign-markets). It has deterministic checks. And it hits the three workflows with the highest coordination load.

---

## 10. Feature landscape (template sections, adapted)

### Table stakes (the v2 model and page are not credible without these)

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Workflow inventory W1–W10 with all eight brief fields | Brief §4 | MEDIUM | §4 above is the content source |
| Per-workflow table: workload, h/unit, review/exception h, total h, FTE, labour $, agency $, AI/software $, cost per output, cycle time, autonomous share (current vs agent-enabled) | Brief §7 | HIGH | Extend `calc.js` with a pure `workflowModel(inputs)` and a test for every invariant |
| Evidence class on every figure (OBS/BENCH/ILLUS/HYP) mapped to existing chips | Brief §7, project constraint | LOW | Add a `class` field to the `data.js` entries |
| Budget-structure anchor (labour 22–25%, agency ~21%, media ~31%) | CFO credibility | LOW | Gartner 2025/2026 |
| Fix "fully loaded" labelling, and reconcile review capacity (slack, rising hours, FTE costing) | Brief §7 explicitly | MEDIUM | §1b |
| Three scenarios A/B/C as separate outputs | Brief §7 | MEDIUM | §6 |
| Do-not-double-count ledger shown on the page | Quality gate | MEDIUM | §8, as a reconciliation table: released → redeployed / removed / unused / avoided |
| Primary metric plus guardrails plus outcomes, with falsifiers | Brief §3, §8 | LOW | §5 |
| Three-tier scorecard (outcomes / operating economics / autonomy and quality) | Brief §8 | LOW | §11 |
| Sensitivity: adoption, error/rework rate, inference cost, review overhead | Brief §7 | MEDIUM | Extend the v1 sensitivity panel |

### Differentiators

| Feature | Value proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Baseline-standard-hours output index | Solves "marketing has no merged-PR equivalent" without counting assets | MEDIUM | Frozen weights; only completed, objective-linked units count |
| "Honest 2x" panel: org-wide 1.4–1.5x at defaults vs portfolio 2x | Credibility with the CFO; matches brief "not every function" | LOW | Shows which workflows carry the 2x |
| Evidence-boundary line on the causal chain | Brief §8 "where evidence stops" | LOW | Visual divider |
| Task-vs-org productivity gap shown with RCT vs economy-wide data | Explains why workflow ownership, not tools, is the lever | LOW | Brynjolfsson/Noy vs Humlum/St. Louis Fed |
| Released-hours waterfall: gross → minus agent-created review/exception → net → split into redeployed / removable / unused / avoided | Makes double-counting impossible to hide | MEDIUM | |
| Autonomy level per workflow (L1–L4) tied to a measurable success check | Brief §2 "higher autonomy must be justified" | LOW | |

### Anti-features

| Feature | Why requested | Why problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Single "total savings" number | Executive simplicity | Sums incompatible things (§8) | Reconciliation table plus a scenario selector |
| Revenue uplift = extra output × average conversion | Looks like an ROI | Ignores saturation (Shapiro: ~0.01 elasticity) and measurement noise | Outcome as a hypothesis with a holdout or MMM test design |
| Applying RCT task gains to workflow hours | "Evidence-based" feel | Task ≠ workflow (2.8% vs 40%) | Use RCTs as an upper anchor for execution hours only |
| Assets or tokens or "% of steps using AI" as KPIs | Easy to count | Goodhart; brief §8 forbids | Completed workflows and verified objectives |
| BCG "10x cycle time / 3x ROI" as defaults | Big numbers | Consultancy client anecdotes, no method | Quote as a dated aspiration marker, graded |
| Modelling W3 creative as the main 2x source | v1 inertia | Lowest feasibility and repeatability | Assistance-level in W3; 2x from W2/W4/W6/W9 |
| Counting paid-media efficiency as a productivity saving | Biggest budget line | It is working spend, not labour | Effectiveness tier of the scorecard |
| False precision (e.g. "35.6 FTE released") | Looks rigorous | All inputs are ILLUS/HYP | Show ranges (23–48 FTE-equivalent), round the defaults |

### Feature dependencies

```
Baseline time study (pilot weeks 1-3) ──> frozen standard-hour weights ──> primary metric
Workflow inventory + FTE allocation ──> per-workflow labour model ──> scenarios A/B/C
Per-workflow model ──requires──> review/exception hours line (else gains overstated)
Review reconciliation (v1 slack) ──> W5 row and the "unused capacity" ledger line
Agency allocation by workflow ──> Scenario B agency savings ──conflicts──> v1 $1.03M reallocation (must net)
Objective registry + outcome measurement (holdouts/MMM) ──> effectiveness tier ──> causal chain right of the evidence line
```

### MVP definition (what the v2 page must ship)

- [ ] §1b fixes (label, review reconciliation, concept cost split): **without them the CFO reader finds the hole**
- [ ] W1–W10 inventory (compact cards plus an appendix)
- [ ] Per-workflow model for at least W2, W4, W5, W6 (the pilot slice) in full detail. Other workflows at roll-up level with the same fields.
- [ ] Primary metric, guardrails and outcomes; three-tier scorecard
- [ ] Scenarios A/B/C plus the double-count reconciliation table
- [ ] Prioritisation table
- [ ] Defer: full editable inputs for every workflow (start with FTE, units, h/unit and reduction per workflow; keep the rest fixed and documented)

---

## 11. Scorecard spec (brief §8), with units and measurement source

| Tier | Metric | Unit | Baseline source | Notes |
|------|--------|------|-----------------|-------|
| Outcomes | Marketing-sourced qualified pipeline | $ and count per quarter | CRM | Holdout or geo test for incrementality |
| Outcomes | Cost per qualified opportunity; CAC | $ | CRM + finance | Fully loaded marketing cost in the numerator |
| Outcomes | Conversion rate (key funnels) | % | Analytics | From W8 tests |
| Outcomes | Marketing-attributed revenue; MROI | $; ratio | MMM | MMM marginal ROI, not the average |
| Operating | Useful work per in-scope FTE (primary) | standard hours per FTE | Pilot time study | Frozen weights |
| Operating | Human hours per completed workflow | h | Time study plus workflow logs | Split execution vs review/exception |
| Operating | FTE-equivalent capacity released | FTE-eq | Derived | Split into redeployed / removed / unused / avoided |
| Operating | Fully loaded cost per completed workflow | $ | Finance + logs | Labour + agency + AI/platform |
| Operating | Agency spend avoided | $ | AP data | Net of the v1 reallocation |
| Operating | Objective-to-live cycle time | days | Workflow state | Median and p90 (v1 noted that the average understates the tail) |
| Autonomy and quality | Eligible workflows completed autonomously | % | Workflow logs | "Eligible" is defined per autonomy level |
| Autonomy and quality | Human interventions per workflow | count | Logs | |
| Autonomy and quality | Review and exception time | h | Logs | Feeds the net-hours line |
| Autonomy and quality | First-pass acceptance | % | Review tool | Comparator: pharma legal first-pass 55.7% (Vodori, vendor) |
| Autonomy and quality | Error and compliance escape rate | per 1,000 units | Sampling audits | Falsifier threshold |
| Autonomy and quality | Agent actions achieving verified objectives | % | Deployment verification plus outcome checks | e.g. page live and tag firing; market launched on date |

---

## 12. Gaps and things not verified

- **The CMO Survey 2026 primary report was not read.** cmosurvey.org refused connections on 2026-10-25. The 9.0%, "headcount growth halved" and 24.2% AI-share figures are secondary. Re-check before use.
- **The Gartner 2026 labour share (24.5%)** comes from Chief Marketer's report of the survey. The Gartner page returns 403 to automation. The 2026 agency share was not found.
- **The Gartner 2025 "22% genAI reduced agency reliance"** figure was not seen in primary text.
- **No public benchmark exists** for workflow-level hours per unit, productive hours per marketing FTE, marketing team composition by workflow, or agent-enabled reductions. All are [ILLUS]/[HYP]. The pilot's baseline time study is the only route to [OBS].
- **No authoritative localisation per-word average or LLM post-editing throughput** was found (CSA/Slator are paywalled).
- **The McKinsey 5–15% / $463B figure** was seen only in secondary summaries.
- **Dell'Acqua et al. 2023** is still a working paper.
- **Ju & Aral** has four versions with changing headline numbers (60% in v1, 50% in v3). Cite v3 or v4 with the date.
- **Intercom's measurement detail** (merged PRs per R&D head) belongs to another researcher's remit. This file assumes only the v1 register's company-reported reading.

## Sources (all accessed 2026-10-25 unless noted)

- Gartner 2025 CMO Spend Survey (2025-05-12); Gartner 2026 CMO Spend Survey (2026-05-11): URLs in §2a
- Chief Marketer, 2025-05-25 and 2026-06-24 (Gartner budget splits)
- Duke Fuqua / The CMO Survey, 2025-04-01; Portada, 2026-04-05
- BLS OOH (marketing managers; market research analysts and specialists), May 2025 data; BLS ECEC, June 2026
- ANA, The Continued Rise of the In-House Agency, 2023
- Asana Anatomy of Work 2021; Workfront State of Work (2018/2019) via MarketingProfs; Optimizely (2026-08-18; "Rebalancing" via agilebrandguide)
- IPA BetterIdeas via Marketing Week (2025-03-04); Vodori 2025 benchmarks; Veeva PromoMats white paper (2025)
- Forrester RES174090 (2018); SiriusDecisions via Contently (2017); Adobe content demand (2025)
- Brynjolfsson, Li, Raymond, QJE 2025 (NBER w31161); Dell'Acqua et al. 2023 (SSRN 4573321); Noy & Zhang, Science 2023; Ju & Aral arXiv 2503.18238; Dell'Acqua et al. NBER w33641; Peng et al. arXiv 2302.06590; Cui et al. SSRN 4945566; METR 2025-07-10; Humlum & Vestergaard BFI WP 2025-56; St. Louis Fed 2025-02; Anthropic 2025-11
- BCG CMO Survey 2026 (2026-06-15), PDF read in full
- McKinsey 2023-06 (secondary)
- Shapiro, Hitsch, Tuchman, Econometrica 2021; Lewis & Rao, QJE 2015; Google Meridian model spec (updated 2026-10-09)
- Polilingua MTPE guide; Läubli 2019; MT Summit 2025 (LLM post-editing)
- Repository: `site/js/data.js`, `site/js/calc.js` (v1 baseline and cost structure)

---
*Feature research for: v2.0 Autonomous Marketing Operations, workflows and labour economics*
*Researched: 2026-10-25*
