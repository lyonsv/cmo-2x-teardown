# Architecture Research: v2.0 Autonomous Marketing Operations

**Domain:** Software that lets a marketing organisation hand whole workflows to agents, step by step, under permissions, checks and approvals, and the page section that explains it
**Researched:** 2026-10-25
**Remit:** v2.0 brief sections 2, 5, 6 and 9 (thesis, "What needs to be built", content supply chain and diagram, expansion beyond content)
**Overall confidence:** MEDIUM. The engineering practice is HIGH (primary docs read). Vendor capabilities are MEDIUM to LOW, because most are launch posts or secondary press. The component design is the author's design, graded Modelled or Speculative on the page.

> **Neutrality reminder for executors.** `test/page.test.js` (`VENDOR_RE`, about line 413) fails the build if any of these names appears outside s12 and s15: Adobe, Workfront, Salesforce, HubSpot, Bynder, Smartling, "Phrase TMS", Google, "Meta Ads", OpenAI, Anthropic, Claude, and others. The vendor material in this file is for the comparison section (s12) and the source register (s15) only. Everywhere else, the page must use the category names given in the tables below, such as "marketing suite agents", "ad platform automated campaigns", "translation quality scoring" and "durable workflow engine". Cite engineering guidance from model developers through `#src-…` links, with neutral link text such as "one model developer's agent guidance".

---

## 1. The system in plain English (the 60-second version for the page)

**What it does.** A marketer gives the system an objective. An example: "Launch the spring campaign in Germany, France and Japan by 1 May, within this budget, using only approved claims." The system plans the work. It does the work in the tools the team already uses (asset library, CMS, translation system, ad platforms, email platform, analytics). It checks its own output against the brand, legal and quality rules. It sends people only the decisions that exceed its permissions or its confidence. It confirms that the work actually went live correctly. Then it reports whether the objective was met and proposes what to do next.

**Who uses it.**
- **Campaign owners** set objectives and limits, and approve plans.
- **Brand, legal and regional reviewers** decide exceptions, not routine work.
- **A small marketing operations and platform team** owns the rules, the permissions, the connections to each tool and the quality tests.
- **Leadership** sees the scorecard: completed workflows, human hours, interventions and outcomes.

**How it works, in six parts.** These map one-to-one to the brief's six agent abilities (brief s2).

1. **An objective record** for each piece of work: goal, measures, limits, owner, deadline.
2. **A plan**, drawn from a tested template for that workflow, which the agent fills in and a person approves.
3. **Agents that act through controlled connections** to existing systems. Each connection carries explicit permissions: read, draft, stage, publish and spend.
4. **Automatic checks** on every output: rule checks first, then a separate review agent, then sampling by people.
5. **An approval inbox** where exceptions arrive with the evidence attached.
6. **A run record and outcome measures.** These log every step, every decision and every result against the objective, and feed the next plan.

**What it is not.** It is not a new content generator, a replacement for the marketing suite, or a large platform that has to be finished before anything works. The first version runs one workflow end to end. Later workflows reuse the same six parts.

Recommended page framing: show this as **"software built → autonomy enabled → human work reduced → capacity increased → outcomes improved"**, with the six parts as the "software built" link in that chain.

---

## 2. Standard architecture

### System overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PEOPLE  set objectives · approve plans · decide exceptions · own rules    │
│         (campaign owner, brand/legal/regional reviewers, ops team)        │
└───────────────▲──────────────────────────────▲───────────────────────────┘
                │ approvals / exceptions        │ scorecard, proposals
┌───────────────┴──────────────────────────────┴───────────────────────────┐
│ WORKFLOW RUNS (one per objective; days to weeks long)                     │
│  plan ─► brief ─► source ─► adapt/localise ─► check ─► stage/publish ─►   │
│  verify ─► measure ─► propose/apply permitted changes ─┐                  │
│   ▲────────────────────── results feed next plan ◄─────┘                  │
├──────────────────────────────────────────────────────────────────────────┤
│ SHARED PLATFORM (build once, reuse for every workflow)                    │
│ ┌──────────┐┌──────────┐┌─────────┐┌──────────┐┌────────┐┌───────┐┌─────┐ │
│ │Objectives││Brand,    ││Workflow ││Connectors││Checks  ││Approv-││Outc-│ │
│ │& run     ││claims,   ││engine   ││& permis- ││& evals ││al     ││ome  │ │
│ │record    ││rights,   ││(durable)││sions     ││        ││inbox  ││meas-│ │
│ │(ledger)  ││context   ││         ││(gateway) ││        ││       ││ures │ │
│ └──────────┘└──────────┘└─────────┘└──────────┘└────────┘└───────┘└─────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│ EXISTING SYSTEMS (connected, not replaced)                                │
│ DAM · CMS · PIM · TMS · ad platforms · email/MAP · analytics/MMM ·        │
│ work management · CRM/CDP · built-in agents of each of these              │
└──────────────────────────────────────────────────────────────────────────┘
```

The key structural decision is that **the agent run is a workflow with agent steps inside it, not a free-roaming agent.** One model developer's guidance separates "workflows" (fixed code paths that orchestrate models and tools) from "agents" (models that direct their own process). It recommends the simplest pattern that works and adding autonomy only when it measurably helps ([Building effective agents, 2024-12-19](https://www.anthropic.com/engineering/building-effective-agents), HIGH). Another developer's guide says a deterministic solution may suffice where judgement, messy rules or unstructured data are absent ([A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf), HIGH). For marketing this means:

- **Fixed path, agent steps.** A market launch follows a known path (plan, derive, localise, check, publish, verify, measure). The path is a tested template, and the agent fills it in. The agentic parts sit inside the steps: drafting the plan, adapting copy, judging quality, diagnosing a deployment failure.
- **Autonomy is configured, not inherent.** Moving up the autonomy ladder means two things. First, widening what each step may do without a person (permissions). Second, eventually letting the planner choose among permitted actions based on results (outcome-directed). The model itself does not change.

### Component responsibilities: the ten capabilities in the brief

For each capability the table gives the problem, the software, the inputs and integrations, the agent permissions, verification, human intervention, and its contribution to autonomy. The classification column uses three values. **Own** means build and own. **Integrate** means buy or rent, then connect. **Platform** means existing marketing platforms usually provide it already.

| # | Capability (plain-English component name) | Problem it solves | Software that must exist | Inputs, data, integrations | What agents may do | How success is verified | How humans intervene | Contribution to autonomy and outcomes | Classification |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Objective record and outcome tracking** | Work today starts from tickets ("make 10 translations"), not objectives, so nobody can say whether the work achieved anything | A structured objective record: goal, primary measure, guardrail measures, markets, channels, budget cap, deadline, allowed claims, owner, approvers, permission level granted, measurement plan (holdout or baseline). Every run, task and asset links to it | Campaign plan or brief, KPI definitions from analytics or finance, budget from the planning tool | Draft an objective from a request. Propose measures. Never change budget or permission level | Every run and every live asset traces to one objective. The objective closes with a measured result, or with "not measurable" stated | The owner writes or approves the objective and grants the permission level | The precondition for outcome-directed autonomy: an agent cannot pursue a goal that is not written down. It also stops "assets produced" passing as the outcome | **Own** (schema, definitions, link to finance). UI can be a form in the work-management tool |
| 2 | **Brand, claims, rights and context library** | Agents and reviewers apply different, unwritten rules, and drift shows up as defects (v1 s04 makes this point) | One versioned policy source: brand rules, the approved-claims library by market, regulatory rules by market, the rights register (licence scope, territory, expiry), tone and terminology, audience and market facts. Exposed to agents as a read-only service, with version IDs on every read | DAM rights metadata, PIM product facts, legal-approved claims, brand guidelines, translation memory and glossaries, CDP segments (read) | Read only. May *propose* new entries, such as a newly needed claim. Never approve them | Every check cites the policy version and rule ID (as in v1 s06). Eval sets test that the rules are applied | Brand and legal own every change, released as a versioned change with an owner and date | Lets low-risk work clear without a person, because the rules are explicit and testable. Without it, nothing can move above assisted work | **Own** the content and versioning. Storage can be integrated (knowledge store, DAM fields). Suites now offer brand-context services (s12 material), but the rules must stay exportable |
| 3 | **Planning and orchestration (workflow engine)** | Coordination is the hidden cost: tickets, chasing, hand-offs between agency, localisation vendor, regional teams and trafficking | (a) A **durable workflow engine** that keeps state across days-long waits, retries, timers and approval signals. (b) **Plan templates** per workflow (for example "market launch"), with steps, dependencies and stop conditions. (c) A **planner step** in which an agent fills the template from the objective and context | Objective record, policy library, capacity and calendar data from work management | Fill a plan template. Choose among permitted step variants. Pause and resume. Retry within limits. May not add step types that are not in the template | Plan passes rule validation (every market has a legal rule set, every asset a rights record). Run completes or stops with a stated reason. Measures: interventions per run and the share of runs completed without a human step outside the plan | People approve the plan (pilot), cancel or re-route a run, and edit templates | Removes the coordination work: one run replaces many tickets and hand-offs. This is where much of the hours saving sits (economics researcher to quantify) | **Integrate** the engine (durable workflow category). **Own** the templates and the planner prompts. Suite orchestrators are an option if the stack is single-suite |
| 4 | **Connectors and permissions (action gateway)** | Agents with broad API keys are the main safety risk. Agents with no access can only draft, so they save little | A gateway through which every agent action passes. It provides: one identity per agent role; scoped credentials per system; an action catalogue with a **permission level** per action (read, draft, stage, publish, spend); caps (markets, assets, money per day); idempotency and rollback (unpublish, pause); a kill switch; a full action log. Connectors use the system's API, or a standard tool protocol (MCP) where the vendor provides a server | DAM, CMS, PIM, TMS, ad platforms, email/MAP, analytics, work management, CRM/CDP | Only actions in the catalogue, at the permission level granted for this run. Writes default to draft or paused state | The downstream system enforces the permission, not the model ("complete mediation", [OWASP LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/), HIGH). Every write is read back to confirm it happened | Approval is required for high-risk actions (publish outside caps, any spend increase, new market go-live in the pilot). Revoke or pause at any time | The single biggest lever on autonomy. Raising a workflow's level from "stage" to "publish within caps" is the actual autonomy step, and it is reversible | **Own** the permission policy and action catalogue. **Integrate** the gateway and connectors (vendor MCP servers, iPaaS, direct APIs) |
| 5 | **Execution: worker agents and skills** | Production and operational tasks (resizing, localising, building pages, trafficking, QA, tagging, reporting) eat most hours | Skills: packaged, versioned task units with instructions, tools and tests (v1 s04 "skills"). Worker agents run skills. In-platform agents (suite content agents, DAM tagging, TMS translation) are called as workers through connectors | Master assets (DAM), templates, product feeds (PIM), translation memory, channel specs | Execute skills on the run's assets within the permission level. Fix loops are bounded (v1 s06) | Each skill has a regression eval set that must keep passing. Output passes component 6 | People direct master concepts (creative judgement stays human) and own skill changes | Volume and speed. Derive-don't-generate (v1 s03) keeps most work in low-risk tiers | **Platform** for many tasks (generation, translation, resizing, tagging already exist in suites, TMS and DAM). **Own** the skills that encode your rules and the glue. Do not rebuild generators |
| 6 | **Checks and evaluations** | More output without scaled checking means more risk, and reviewer capacity becomes the binding constraint (v1 s07 capacity table) | Three layers. (a) **Deterministic checks**: specs, character limits, links, tracking parameters, locale formats, required disclosures, rights expiry. (b) **A review agent** on a different model from the generator, citing rule IDs (v1 s06). (c) **An eval harness**: human ground truth, seeded defects, sampled auto-approvals, change gate (v1 s08). Extended for v2 to **task-completion checks** (did the run do what the objective asked?) and **deployment checks** (is it live, correct and tracked?) | Policy library, run record, human decisions with reason codes, platform read-back APIs | Run checks. Fix within bounded loops. Escalate. **Can raise a tier, never lower one** | Agreement with humans per criterion and per tier. Escape rate in sampled auto-approvals. Seeded catch rate. Consistency across repeated runs (see note on pass^k below) | Reviewers label disagreements. A person who does not own the generator maintains the eval sets | This is what *earns* each autonomy step: a permission level is raised only when the evals show the escape rate is within threshold for that action class | **Own** the eval sets, thresholds and harness. Integrate the eval tooling. Platform review agents (for example work-management "content reviewer" assignees, DAM compliance agents, TMS quality scoring) are inputs to be calibrated, not trusted |
| 7 | **Approval inbox, exceptions and intervention** | Reviewers today re-review whole batches, so routine items and risky ones get the same attention | One inbox for every run. Each item carries its evidence (findings, rule IDs, diff against the approved master, what could not be checked). It supports batch approval of homogeneous items, sampling queues, blind-first review (v1 s07 fatigue controls), reason codes, and service levels with timeouts that escalate rather than auto-approve | Run record, findings, tier rules, approver directory | Route, batch, remind, escalate on timeout. Never approve on a person's behalf | Queue age, decision time, overturn rate, and reason-code coverage | This is the intervention surface. People approve, reject with reason, edit, take over a step, or stop the run | Moves people from doing work to deciding exceptions. The share of work routed here is the "human interventions per workflow" metric | **Integrate** (work-management tools now offer AI assignees and approvals). **Own** the routing rules (T0–T3 plus permission levels) |
| 8 | **Run record: state, memory, provenance and audit** | Without an end-to-end record nobody can show which rule, model, prompt or person produced a live asset, or join results to decisions | An append-only ledger keyed by objective, run, task, asset and action. It records inputs, policy version, model and skill version, findings, approvals, platform IDs and results. This **generalises v1's asset manifest** from assets to actions. Memory is split three ways: run state (in the workflow engine); organisational memory (curated, versioned learnings in the library, with provenance); and no unbounded free-form agent memory | Every component writes to it. The DAM, CMS and ad platform IDs are stored for the join | Append only | Completeness: every live asset and every action has a full chain. Audits are run on samples | Auditors and owners query it. Corrections are new entries, never edits | The evidence base for raising autonomy and for the CFO: hours, interventions, costs and outcomes per run come from here, not from surveys | **Own** (the data and schema). Storage is commodity |
| 9 | **Performance and business-result measurement** | Output counts look like progress while outcomes are unknown (v1 s03 caution; brief s8) | Joins from asset and run IDs to channel performance, web analytics and CRM pipeline. Deployment verification. Guardrail monitors. Holdout or geo-experiment designs for outcome claims. Feeds the three-tier scorecard (brief s8) | Ad platform reporting, web analytics, CRM/opportunities, MMM where it exists | Read. Compute. Flag guardrail breaches. Write measurement reports to the run record | Measured result versus the objective, with a stated method (holdout, baseline, pre/post). Data freshness checks | Analysts own the measurement method. Leadership reads the scorecard | Turns "completed" into "achieved". The prerequisite for outcome-directed autonomy and for any revenue claim on the page | **Own** the definitions and joins. **Integrate** analytics and MMM. **Platform** for in-channel reporting |
| 10 | **Feedback-driven iteration and optimisation** | Learning is slow: results reach the next brief weeks later, if at all | (a) A **monitoring run** per live objective that compares results with guardrails and objective. (b) A catalogue of **permitted adjustments**: refresh fatigued creative (T0/T1), pause an underperforming variant, shift budget between pre-approved variants within caps, open a test. (c) **Proposals** for anything outside the catalogue. Learnings are written back to the library with provenance | Measurement (9), library (2), permissions (4) | Apply catalogue adjustments within caps. Propose the rest | Each change is logged with its expected effect and is later checked against the measured effect (were the agent's changes right more often than not?) | People approve proposals, set caps, and review the change log weekly | Outcome-directed autonomy. Agents choose permitted actions from feedback rather than following a fixed sequence | **Own** the catalogue and caps. **Platform** for in-channel bidding, audience and placement automation. Do not duplicate it: set its inputs and guardrails |

**Note on consistency (component 6).** Agent eval guidance separates pass@k (at least one of k attempts succeeds) from pass^k (all k succeed). It recommends pass^k-style measures "for agents where consistency is essential" ([Demystifying evals for AI agents, 2026-01-09](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), HIGH). An autonomous workflow that runs hundreds of times a quarter needs per-run reliability, not best-of-k. The page should say so in plain words: "a step that works nine times in ten will fail several times a week at this volume."

**Note on review-agent limits (component 6).** Model-based graders show position, verbosity and self-preference biases ([Zheng et al. 2023, arXiv 2306.05685](https://arxiv.org/abs/2306.05685), HIGH). Evaluation criteria also shift as people grade outputs ("criteria drift", [Shankar et al. 2024, arXiv 2404.12272](https://arxiv.org/abs/2404.12272), HIGH). Current guidance says model graders "should be closely calibrated with human experts", should be allowed to answer "Unknown", and should grade one dimension per judge (Demystifying evals, HIGH). These limits support v1's existing rules: different model from the generator, per-criterion agreement, "unchecked means escalate". Keep those rules and cite these sources in s15.

### Permission levels (a new, small idea: keep it plain)

v1 tiers **assets** by risk (T0–T3). v2 also needs to tier **actions**, because agents now publish and spend, not just produce. Recommended wording on the page: "what an agent may do in each system". Avoid "autonomy envelope" and similar coined terms.

| Level | Verb | Examples | Default rule | Raised when |
|---|---|---|---|---|
| Read | read | Pull masters from the DAM, read performance, read rights | Always allowed within the run's scope | n/a |
| Draft | draft | Write a brief, create localised copy in the TMS, draft a CMS page | Allowed. Output goes to checks | n/a |
| Stage | stage | Build the ad set in a **paused** state, CMS page in preview, email in a test list | Allowed after checks pass | n/a |
| Publish | publish | Activate paused ads, publish a page, send to a live list | **Pilot: a person clicks go-live.** Later: automatic for T0/T1 content in markets and channels already approved, within caps | Evals show escape rate in sampled auto-approvals below threshold for N consecutive runs (threshold set from the organisation's own data, as in v1 s08) |
| Spend | spend | Change budgets or bids, open a new channel | **Always human above a cap.** Within a pre-approved cap, shifts between approved variants may be automated | Holdout evidence shows the agent's changes beat a "no change" control |

**Always human, whatever the level:** the v1 s07 list (hero work, new or comparative claims, likeness, children, uncleared rights), plus first go-live in a new country, budget increases, crisis or sensitive topics, and anything the checks flag as "could not check".

**Separate the reading agent from the acting agent.** A research step that reads untrusted web content, such as competitor pages, reviews or answer-engine output, must not hold publish or spend rights in the same context. Agents that combine private data, untrusted content and the ability to communicate externally are the classic prompt-injection exposure ([the "lethal trifecta", 2025-06-16](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), MEDIUM: practitioner source, widely cited). This is a concrete design rule the page can state without jargon.

### Build, integrate, or already provided: summary table for the page (category names only)

| Component | Build and own | Integrate | Usually already provided by existing platforms (category) |
|---|---|---|---|
| Objective record | Schema, KPI definitions, link to finance | Form in the work-management tool | Partly: suite "goals" features within one suite only |
| Brand, claims, rights, context library | Rules content, versioning, approved-claims library, rights register | Knowledge store, DAM fields | Suite brand-context services and DAM brand-compliance agents (calibrate, do not rely on them as the only copy) |
| Workflow engine and plan templates | Templates, planner, stop rules | Durable workflow engine | Suite orchestrators (good if the stack is single-suite) |
| Connectors and permissions | Permission policy, action catalogue, caps | Gateway, vendor tool servers (MCP), integration platforms | Some work-management and suite tools now expose tool servers |
| Worker agents and skills | Skills that encode your rules; glue | Model access (model-agnostic) | Generation, resizing, translation, tagging, page building, journey drafting |
| Checks and evals | Eval sets, seeded defects, thresholds, harness | Eval tooling | Platform review agents and translation quality scores (inputs to calibrate) |
| Approval inbox | Routing rules (tiers and permission levels) | Work-management approvals | AI assignees in work-management tools |
| Run record | Schema and data | Storage | None end to end across vendors (not found as of 2026-10-25) |
| Outcome measurement | Definitions, joins, holdout designs | Analytics, MMM | In-channel reporting |
| Feedback and optimisation | Permitted-adjustment catalogue, caps | n/a | Ad platform automated bidding, audiences and placements |

**Opinionated rule for the page:** *own the rules, the permissions, the evals, the run record and the outcome definitions; rent the generators, the channels and the plumbing.* This extends v1's s12 line "Own the eval set and the brand rules; rent the rest." Keep the existing line and extend it, for continuity.

### What existing platforms document today (for s12 and s15 only, accessed 2026-10-25)

Use this as the evidence behind the "already provided" column. On the page it lives **only** in s12 (a new sub-table, for example "What the major suites and channels already automate") and in s15 register rows with `publisherType: 'vendor'` or `'press'` and `flag: 'vendor-claimed'` where applicable.

| Platform family | What is documented | Date | Source | Confidence |
|---|---|---|---|---|
| Adobe (CX Enterprise, formerly Experience Cloud) | Rebranded at Summit 2026 around "Content Supply Chain", "Brand Visibility" and "Customer Engagement". "Brand Intelligence" offers brand context accessible to agents. "Coworkers" are described as persistent agents that orchestrate Adobe and third-party agents. Describes human-in-the-loop for planning and human-on-the-loop for guarded autonomous agents. Uses LLM-as-judge validation. Marketo program-creation and campaign-validation agents | 2026-04-20 (updated 2026-05-05) | [MarTech](https://martech.org/adobe-rebrands-experience-cloud-as-cx-enterprise-goes-all-in-on-ai-agents/) | MEDIUM (trade press summarising the launch; the Business Wire release returned 403) |
| Adobe AEP agents | Agent Orchestrator plus Audience, Journey, Experimentation and other agents announced as generally available. Content Production Agent listed in GenStudio for Performance Marketing | 2025-09-10 | [Adobe press release PDF](https://news.adobe.com/news/downloads/pdfs/2025/09/091025-general-availability-of-ai-agents.pdf), [martech.org](https://martech.org/adobe-makes-ai-agents-and-orchestrator-generally-available/) | MEDIUM (search summaries; PDF not opened) |
| Adobe Workfront | "AI Collaborators": content reviewer (checks against brand guidelines), project coordinator, task agents that connect external agents. Actions logged in the update stream. Only admins can create them. MCP client access lets external assistants create records and approve content | 2026-08-13 | [Computerworld](https://computerworld.com/article/4209291/adobe-now-lets-workfront-users-assign-tasks-to-ai-agents.html) | MEDIUM (press; some sources dispute the GA status of one type) |
| Salesforce (Agentforce Marketing) | Content Agent turns a brief into on-brand content across channels. Goals Agent "can build, run, and optimize campaigns based on the goals, budget, and guardrails you define". Segments built from plain language. No availability stated | 2026-06-12 | [Salesforce blog, Connections 2026 takeaways](https://www.salesforce.com/blog/?p=145255) | MEDIUM (vendor blog; availability unverified) |
| Salesforce (earlier) | Agent drafts the brief, then content, segment and draft journey. Marketer "can further refine, approve, and activate" | 2024-10-21 | [Salesforce blog, marketing agents](https://www.salesforce.com/blog/marketing-agents/) | HIGH for what it claims (vendor) |
| HubSpot | Fall '26 "Marketing Studio" described as an insight-to-action tool with campaign and content agents. Earlier Breeze Content Agent and others. Knowledge Base Agent drafts for human review | 2026-09-16; 2025-04-10 | [CMSWire](https://www.cmswire.com/customer-experience/hubspot-debuts-breeze-assistant-selfupdating-crm/), [HubSpot](https://www.hubspot.com/company-news/spring-2025-spotlight-breeze-agents) | MEDIUM / LOW (naming changed in 2026, per partner blogs) |
| Google Ads | Performance Max brand guidelines (business name, logos, colours, font) at campaign level. Google "will do its best to apply" them, and logos are not guaranteed in every impression. AI Max for Search turns on text customisation and final URL expansion by default | accessed 2026-10-25 | [Brand guidelines help](https://support.google.com/google-ads/answer/14934472?hl=en), [AI Max help](https://support.google.com/google-ads/answer/15910366) | HIGH (official help) |
| Meta | Advantage+ automates "audience, placement and budget". Fully automated ad creation from a URL and budget was **reported** (WSJ, June 2025) as a 2026 aim. No official launch confirmed in the sources found | accessed 2026-10-25 | [Meta Advantage+ page](https://www.facebook.com/business/ads/meta-advantage-plus), [Campaign Asia on the WSJ report](https://www.campaignasia.com/article/meta-aims-to-fully-automate-ad-creation-with-ai-by-2026/502831) | HIGH (current automation) / LOW (full automation) |
| Smartling | LQA Agent scores translations with MQM, gives pass/fail per language, and can run "fully automatically without a human reviewer", routing issues to people while error-free content publishes. Vendor reports 90% agreement with humans in internal tests | 2026-05-19 | [Smartling release](https://www.smartling.com/company-news/smartling-launches-its-largest-ai-innovation-release-yet) | HIGH for the claim; accuracy figure is vendor-claimed |
| Phrase | Quality Performance Score (0–100, MQM-based) used to route content to retranslation, post-editing or go-live | 2023-12 (launch); page accessed 2026-10-25 | [Phrase AI solutions](https://phrase.com/platform/ai-solutions), [Phrase QPS help](https://support.phrase.com/hc/en-us/articles/5709672289180) | MEDIUM |
| Bynder | Compliance Agent audits DAM assets against brand and legal rules, with human-in-the-loop. Enrichment Agent writes metadata. Rights or licence-expiry agent not found | 2025-12-16 | [GlobeNewswire](https://www.globenewswire.com/news-release/2025/12/16/3206286/0/en/Bynder-expands-AI-Agent-capabilities-to-empower-brands-to-scale-creative-freedom-with-intelligent-control.html) (403; read via search summary) | MEDIUM-LOW |

**What this evidence implies (for the build/buy argument).**
- **The suites are converging on this architecture.** Each has orchestrators, brand context, review agents, approvals and goal-driven campaign agents. The page should say so honestly, in category terms outside s12.
- **Every one of them works inside its own walls.** None of the pages read documents three things across vendors: (a) one run record from objective to outcome, (b) a permission policy and eval sets owned by the buyer, or (c) holdout-based outcome measurement. "Not found as of 2026-10-25" is an absence of documentation, not a claim the capability is missing. Use v1 s12's "Not publicly documented" convention.
- **The choice therefore depends on the stack.** In a single-suite organisation, buy the orchestration and own the rules, evals, ledger and measures. In a multi-vendor organisation (the common enterprise case), the thin cross-system layer (components 1, 3, 4, 8 and 9) is the build.
- **Do not duplicate in-channel optimisation.** Ad platforms already automate bidding, audience and placement (Meta's page says so for audience, placement and budget, HIGH). The system's job is to feed them approved creative and objectives, set caps, and measure with holdouts.

---

## 3. Recommended project structure (how the page code should be organised)

This is a static page, so "structure" means page sections plus `data.js` content. No new runtime code is needed for the architecture section. The diagram is hand-written SVG.

```
site/
├── index.html                # new and moved sections (see section 7 of this file for the map)
├── assets/style.css          # + .fig-flow rules, wide/narrow swap, print rules
└── js/data.js                # + sources for s12/s15 vendor rows and engineering guidance
                              # + assumptions for any new graded claims (e.g. pilot targets)
test/
├── diagram.test.js           # EXPECTED_FIGURES renumbered; fig-d rules unchanged
├── flow.test.js              # NEW: rules for the two-variant supply-chain diagram
├── page.test.js              # section ids, vendor-name gate, Intercom count, TOC
└── compare.test.js           # s12 h3 list if a platform sub-table is added
```

### Structure rationale
- **Separate test file for the new diagram.** The existing `fig-d` geometry rules (300-unit viewBox, height 240–560, node widths 240 or 112) cannot hold a wide, multi-lane diagram. Give it a new class (`fig-flow`) and its own test, rather than loosening tests that guard Figures 2–7.
- **Category names in the body, vendor names in s12 and s15.** The vendor gate test already enforces this split.

---

## 4. Architectural patterns (to describe on the page and to inform the pilot)

### Pattern 1: Workflow first, agent steps inside
**What:** A fixed, tested plan template per workflow, with agentic steps (plan drafting, adaptation, judgement, diagnosis) inside it.
**When to use:** All workflows at the start. Free planning is the outcome-directed rung, and only after evals justify it.
**Trade-offs:** It is less flexible, but it is predictable, testable and auditable. Each template doubles as the unit of measurement ("completed workflow").

### Pattern 2: Evaluator–optimiser loop with bounded retries
**What:** The generator produces, the checks critique, the generator fixes, up to N tries, then the item escalates. This is v1 s06's bounded fix loop. It is a named pattern in Building effective agents. The OpenAI guide recommends escalating on "exceeding failure thresholds" and on "high-risk actions" (HIGH).
**Trade-offs:** Each retry costs inference and adds latency. The cap stops loops running for ever.

### Pattern 3: Stage, verify, then publish
**What:** Every external write goes to a draft or paused state first. The system reads it back from the platform API and verifies it (exists, correct market, correct asset IDs, links resolve, tracking fires, correct budget cap). Only then does it publish, either by a person in the pilot or automatically at a higher permission level.
**Trade-offs:** One extra step. In return, "go-live" becomes a cheap, reversible decision, and deployment errors are caught before spend.

### Pattern 4: Durable runs with human signals
**What:** Runs last days to weeks: approvals, a 7–14 day early-performance read, refresh cycles. The workflow engine must survive restarts and wait for an approval without polling. Durable-execution engines document this pattern: pause on a risky action, wait for a signal, keep timers, log decisions ([Temporal: durable AI and human-in-the-loop](https://docs.temporal.io/ai), HIGH for the pattern).
**Trade-offs:** Adds an engine to operate. The alternative, a home-made state machine on cron, loses approvals and timers when something fails.

### Pattern 5: Least privilege enforced downstream
**What:** Each agent role has its own credentials with the narrowest scopes. The target system (ad account roles, CMS roles) enforces them, and the gateway adds caps and logging. The MCP specification itself says hosts "must obtain explicit user consent before invoking any tool", that tool descriptions from untrusted servers are untrusted, and that the protocol "cannot enforce these security principles", so implementers must ([MCP specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25), HIGH).
**Trade-offs:** More set-up per connector. This is the cost of being allowed to raise autonomy at all.

### Pattern 6: Calibrated, sampled trust
**What:** Autonomy for an action class is raised only on evidence from the eval harness (per-criterion agreement, escape rate in sampled auto-approvals, seeded catch rate). It is lowered automatically on drift. Sampling never drops to zero.
**Trade-offs:** Sampling costs reviewer hours, and the economics model must count them. This is the "review-capacity reconciliation" the brief asks for: the hours cannot disappear.

## Anti-patterns

| Anti-pattern | Why it is wrong | Do this instead |
|---|---|---|
| A big "agentic marketing OS" built before any workflow runs | The brief rules it out. It delivers no value and nothing can be measured | One workflow end to end on the six parts, then reuse |
| One super-agent with keys to every system | Excessive agency (OWASP LLM06). Untrusted inputs combined with publish rights | Agent roles per step, scoped credentials, gateway caps |
| Trusting a platform's built-in reviewer or quality score as the gate | Uncalibrated on your rules. The vendor marks its own homework | Treat it as one signal, calibrated against your human labels in the eval harness |
| Counting assets, tokens or "steps touched by AI" | Gameable. The brief s8 forbids it | Completed workflows, interventions per workflow, verified outcomes |
| Free-form long-term agent memory | Unreviewable. Learns wrong lessons silently | Curated, versioned learnings in the library, with provenance |
| Rebuilding bidding or audience optimisation | Ad platforms already do it | Feed them, cap them, measure them with holdouts |
| Auto-approve on approval timeout | Converts reviewer absence into risk | Timeouts escalate. They never approve |

---

## 5. Smallest useful end-to-end slice, and how it expands

### The slice: "Launch an approved campaign in additional markets"

Why this one: it is the brief's own example. It crosses many teams and systems (DAM, TMS, CMS, ad platform, work management, analytics). It has a clear unit of output (a market launched), a clear cycle time (objective to verified live), and low creative risk (masters and claims are already approved). It also exercises all six parts.

**Scope for the first 12 weeks** (the roadmap researcher sets targets. This defines the shape):

| In scope | Out of scope (later) |
|---|---|
| One campaign family whose masters and claims are approved in the source market | New concepts, new claims (always T2/T3 human) |
| 2–4 additional markets with existing legal rule sets | First-ever entry into a new country |
| Two or three channels, for example paid social plus landing page, optionally email | All channels |
| T0/T1 derivations only: resize, locale, channel cut, approved-claim reuse | T2 imagery generation |
| Permission level: **stage**. A person clicks go-live per market | Auto-publish |
| Early-performance read at a fixed point against the source market and guardrails | Automatic budget shifts |
| Plan from a fixed template, filled in by the agent and approved by the owner | Agent-chosen plans |

**Components needed in the slice, and their minimum version:**

| Component | Minimum version for the slice |
|---|---|
| Objective record | A form with ~12 fields stored in the run record |
| Library | Approved claims for this campaign; legal rules for the target markets; rights records for the masters; glossary |
| Workflow engine and template | One template: market launch |
| Connectors | DAM read; TMS draft (or machine translation plus linguist sample); CMS draft and preview; ad platform create-paused and read-back; work-management approvals; analytics read |
| Checks | Deterministic spec, link and tracking checks; review agent; eval set seeded from past launches; linguist sample |
| Approval inbox | Plan approval, exceptions, per-market go-live, all in the existing work-management tool |
| Run record | Objective → run → task → asset → action → platform ID → result |
| Measurement | Deployment verification. Early KPI versus source-market benchmark and guardrails. Hours and interventions logged per run |
| Feedback | Proposals only. No automatic changes |

**Acceptance evidence the slice must produce** (definitions only; targets are hypotheses for the roadmap and economics researchers):
human hours per market launched; hand-offs per launch; objective-to-verified-live time; first-pass acceptance; human interventions per run (planned versus unplanned); escape rate in sampled outputs; deployment-verification pass rate; early KPI versus guardrail.

### Expansion path

| Step | What changes | New build | Reused | Autonomy rung reached |
|---|---|---|---|---|
| E0 pilot | As above | Everything, at minimum size | n/a | Agentic execution (agents run the workflow; humans review and go live) |
| E1 widen | More markets and channels, email, more campaign families | Connectors for new channels; market rule sets | All six parts | Agentic execution at scale |
| E2 raise permission | Auto-publish T0/T1 in already-approved markets within caps; batch approvals | Threshold rules; sampled post-publish audit | Evals, gateway, inbox | **Higher autonomy** (execute, check, correct, advance; escalate exceptions) |
| E3 close the loop | Monitoring run: detect fatigue or underperformance, propose and then apply refreshes (T0/T1) and pauses | Monitoring template; adjustment catalogue | Measurement, library, skills | Higher autonomy on the optimise stage |
| E4 adjacent workflows | See section 6 | Templates, checks and metrics per workflow | All six parts | Varies by workflow |
| E5 outcome-directed | Agent chooses among permitted actions (which variants to refresh, which tests to open, budget shifts within caps) to move a stated KPI, judged against holdouts | Holdout infrastructure; action-effect tracking | Everything | **Outcome-directed autonomy**, only where holdouts show the changes beat "no change" |

---

## 6. Reusable versus domain-specific (brief s9)

| Capability | Reusable across workflows? | What is workflow-specific |
|---|---|---|
| Objective record and run record | Fully reusable | The measures chosen per workflow |
| Workflow engine | Fully reusable | Templates |
| Connectors and gateway | Reusable per system (one DAM connector serves all workflows) | The action catalogue entries and caps per workflow |
| Library | Brand, claims and rights reusable | Channel and regulatory rules added per domain (for example, pricing rules for CRO) |
| Approval inbox and routing | Reusable | Routing rules per action class |
| Eval harness (machinery) | Reusable | **Eval sets are domain-specific.** Localisation quality, page-change safety and bid-change safety need different ground truth |
| Measurement joins | Reusable | Outcome definitions and holdout designs per workflow |
| Skills | Some reusable (copy adaptation, resizing, tagging) | Most domain-specific (experiment design, insight writing, answer-engine refresh) |

### Adjacent workflows on the same platform

| Workflow | Reuses | Needs new | Realistic starting rung | Main risk |
|---|---|---|---|---|
| Ongoing campaign execution (trafficking, QA, pacing reports) | Everything from the slice | Pacing monitors; more channel connectors | Higher autonomy for QA and trafficking | Spend errors (cap them) |
| Underperformance detection and permitted fixes | Monitoring run, catalogue | Diagnosis skills; catalogue entries | Propose → apply within caps | Overreacting to noise; needs minimum-sample rules |
| Localisation and market-expansion programmes | The slice itself | Market rule sets | Higher autonomy | Regulatory variation by market |
| Conversion improvement (landing pages) | CMS connector, checks, run record | Experiment platform connector; page-change evals | Agentic execution (humans approve tests) | Underpowered tests (v1 s09 traffic point) |
| Repeatable experimentation | Measurement, holdouts | Test design skills; power checks | Agentic execution | Win-rate definitions (v1 s09) |
| Answer-engine visibility monitoring | Library, skills, refresh loop (v1 s09 already says lost prompts become refresh briefs) | Monitoring connector (category tool); refresh template | Higher autonomy for refreshes of existing pages | Speculative outcome link (keep v1's grade) |
| Performance insight generation | Measurement joins, run record | Insight skills; analyst review | Assistance → agentic execution | Wrong causal stories. Keep humans on interpretation |

**Page message:** the first product is narrow (one template, a few connectors). The programme is broad, because every later workflow costs a template, its checks and a few connectors, not a new platform. That is the brief's "narrow enough to prove, broad enough to make 2x plausible."

---

## 7. The content supply chain as the first workflow (brief s6)

### Stage-by-stage responsibilities (pilot versus later)

| Stage | Work today (typical) | Agent does (pilot) | Person does (pilot) | Later (E2–E5) | Hand-offs and coordination removed |
|---|---|---|---|---|---|
| Objective | Request arrives as tickets or an email | Drafts the objective record from the request | Owner sets goal, measures, limits, permission level | Same (stays human) | Turns "ten translation tickets" into one objective |
| Research and plan | PM scopes, checks calendars and rules, writes the task list | Fills the market-launch template: markets, assets needed, rule sets, dates, risks, what it cannot do | Approves the plan (one decision) | Plan auto-approved when it matches a pre-approved pattern | Scoping meetings; spreadsheet tracking |
| Brief | Writes briefs for agency, localisation vendor, regions | Generates per-market and per-channel task specs from the plan | None (part of plan approval) | Same | Briefing each supplier separately |
| Source assets | Finds the right approved masters; checks rights | Pulls masters and rights records from the DAM; flags expiries | Creative lead directs any **new** master (out of slice scope) | Same; new concepts stay human | Asset hunting; rights chasing |
| Adapt and localise | Agency resizes; vendor translates; designer re-lays out | Derives variants (T0/T1); localises through TMS or MT with glossary; re-lays out | Linguists check a sample per market | Sample rate falls as quality scores prove out | Agency and vendor round trips |
| Review and approve | Brand, legal and regional review every asset, often repeatedly | Deterministic checks plus review agent; bounded fix loop; batches homogeneous items | Decides exceptions (new claim needed, unchecked items, T2/T3); regional sign-off per market | Auto-approve T0/T1 with sampling | Repeated whole-batch reviews; version ping-pong |
| Publish and activate | Trafficker builds campaigns and pages; QA checks | Stages ads (paused), pages (preview), emails (test); reads back and verifies | Clicks go-live per market | Auto-publish within caps for approved markets | Trafficking tickets; manual QA |
| Measure | Analyst pulls reports days or weeks later | Verifies tracking; reads early KPIs against guardrails at a fixed point; writes a short report | Reads the report | Continuous monitoring run | Report requests |
| Optimise and refresh | Next brief, sometimes informed by results | Proposes refreshes, pauses and tests | Approves proposals | Applies T0/T1 refreshes and pauses within caps; outcome-directed choices under holdout | Learning reaching the next brief late or never |

### Worked example: "launch the approved spring campaign in three additional markets"

This walk-through is for the page. Keep every count illustrative and graded. The economics researcher supplies hours.

1. **Objective (person, one decision).** The owner writes: launch in markets A, B and C by a date; channels paid social and landing page; budget cap per market; use only claims approved for these markets; primary measure is qualified visits or leads versus the source market's first two weeks; guardrails are complaint and disapproval rates; permission level is stage.
2. **Plan (agent, then one human approval).** The agent fills the market-launch template. It lists the masters needed, the variants per channel and market, the rule sets that apply, the linguist sample sizes, the dates, and **what it cannot do**. For example: "market C requires a disclosure not in the approved claims library, so one item needs legal." The owner approves the plan.
3. **Source (agent).** It pulls masters and rights records from the DAM. It finds that one image's licence excludes market B, so it substitutes an approved alternative of the same tier and records why. *This removes a rights chase that today costs several emails.*
4. **Adapt and localise (agent).** It derives sizes and channel cuts and localises copy using the glossary and translation memory. Translation quality scoring routes low-scoring segments to a linguist. Other segments go to a linguist **sample**.
5. **Check (agent, with escalation).** Deterministic checks cover specs, links, tracking parameters and disclosures. The review agent checks claims, brand and rights per market and cites rule IDs. Fix loops are bounded. *Two kinds of item cross the approval boundary:* the market C disclosure (legal) and anything "could not check". Everything else is batched for regional sign-off with the evidence attached.
6. **Approve (people, few decisions).** Legal approves or rewrites the disclosure, and the new wording enters the claims library for next time. Each regional lead approves their market as a batch, with a sample view, instead of asset by asset.
7. **Stage and verify (agent).** It builds ads in a paused state and pages in preview. It reads them back from each platform: correct market targeting, correct asset IDs, landing pages resolve, tracking fires, budget equals the cap.
8. **Go-live (person in the pilot).** One click per market. At E2 this becomes automatic for already-approved markets.
9. **Measure (agent).** At the fixed early-read point, the agent compares each market with the source-market benchmark and the guardrails. It writes a short report to the run record.
10. **Propose (agent) and decide (person).** "Variant X is fatiguing in market B, so refresh with the approved alternate headline; market C landing page has a high bounce rate on mobile, so open a test." The owner approves. At E3 the T0/T1 refresh is applied automatically.

**What is autonomous in the pilot:** steps 2 (drafting), 3, 4, 5, 7 and 9, plus all coordination between them.
**What is not:** the objective, plan approval, new claims, legal decisions, regional sign-off, go-live, any spend change and any new creative concept.
**Where value comes from (the brief's key argument):** the agent does not mainly save time by writing faster. It removes the tickets, briefings, supplier round trips, repeated reviews, trafficking hand-offs and report requests between stages. One run with a few human decisions replaces a chain of hand-offs. The economics model should count **hand-offs and wait time**, not just production minutes.

---

## 8. Diagram specification: "The content supply chain, run by agents"

### Delivery constraints (verified in the repo)
- CSP is `script-src 'self'; style-src 'self'`, and the tests forbid inline `style=` attributes. **No JS-driven viewBox swap and no inline styles.** Use **two inline SVGs** and switch them with CSS media queries in `assets/style.css`.
- The existing `fig-d` test (`test/diagram.test.js`) forces a 300-unit width, a height of 240–560, and node widths of 240 or 112 only. **Use a new class `fig-flow`** so those rules do not apply, and add `test/flow.test.js` with equivalent hygiene. Carry over the existing hygiene rules: no `style=`, `font-size`, `transform`, `href`, `<image>`, `data:`; one rect per node; no digits in diagram text, steps or caption (tier names T0–T3 excepted); unique ids; `role="img"` with `<title>`/`<desc>`; a visible `<ol class="fig-steps">` text equivalent that names every node title.
- Reuse the existing tokens and classes (`.node`, `.node-review`, `.edge`, `.edge-review`, `.edge-soft`, `.note`, `.node-t`, `--verified` accent for review and approval). Add the new classes listed below.
- **Never colour alone.** Human versus agent must be readable from lane labels and text (wide) or from the "People:" and "Agent:" prefixes (narrow). Human-decision nodes also get a distinct stroke pattern.

### Responsive strategy

| Variant | viewBox | Shown when | Why |
|---|---|---|---|
| `flow-wide` | `0 0 720 500` | `@media (min-width: 760px)` and **in print** | At 760px the content width is about 712, so the scale is about 1.0 and 12-unit text renders at about 12px. On A4 print (about 643px printable) the scale is 0.89, giving about 10.7px (about 8pt) text, which is legible. Cap on screen with `max-width: 960px` |
| `flow-narrow` | `0 0 300 H` (H about 900, a multiple of 4) | Below 760px; hidden in print | At a 320px viewport the content is 272px, so the scale is 0.9 and text is about 10.8px, matching the existing figures |

CSS (add to `style.css`):
```css
.fig-flow { display: block; width: 100%; height: auto; margin: 0 auto; }
.flow-wide { display: none; max-width: 960px; }
.flow-narrow { max-width: 360px; }
@media (min-width: 760px) { .flow-wide { display: block; } .flow-narrow { display: none; } }
@media print { .flow-wide { display: block; max-width: 100%; } .flow-narrow { display: none; } }
.fig-flow text { font: 400 12px var(--mono); fill: var(--ink); }
.fig-flow .lane-lbl { font-weight: 600; fill: var(--muted); letter-spacing: .08em; }
.fig-flow .stage-lbl { font-weight: 600; }
.fig-flow .node-human rect { fill: var(--paper-2); stroke: var(--ink); stroke-width: 2.5; }
.fig-flow .node-fades rect { stroke-dasharray: 5 3; }        /* human step that falls away as trust grows */
.fig-flow .run rect { fill: none; stroke: var(--ink); stroke-width: 1; stroke-dasharray: 2 3; }
.fig-flow .platform rect { fill: var(--paper-2); stroke: var(--ink); stroke-width: 1.5; }
.fig-flow .system rect { fill: var(--paper); stroke: var(--rule); stroke-width: 1; }
.fig-flow .boundary { stroke: var(--verified); stroke-width: 2; stroke-dasharray: 8 4; }
```
Note: `display:none` removes the inactive SVG from the accessibility tree, so screen readers get exactly one. Both SVGs need **distinct ids**, for example `ff1w-t`/`ff1w-d` and `ff1n-t`/`ff1n-d`, and marker ids `ff1w-arrow`, `ff1w-arrow-review`, `ff1n-…`. The single `<ol class="fig-steps">` serves as the text equivalent for both.

### Wide variant: grid and nodes (viewBox 0 0 720 500)

Nine stage columns, width 78 each, starting at x = 9. Column centres: **48, 126, 204, 282, 360, 438, 516, 594, 672**. The node rect in column i has x = 13 + 78i, width 70. Text is ≤ 10 characters per line (12-unit mono at about 7.2 units per character). Node height follows the existing rule: lines × 16 + 8 (2 lines = 40, 3 lines = 56).

**Row A: stage header** (text only, class `stage-lbl`, `text-anchor="middle"`, first line y = 18, second y = 32). A rule under it is a `line class="edge-soft"` at y = 42 from x 9 to 711.

| Col | Line 1 | Line 2 |
|---|---|---|
| 1 | Objective | |
| 2 | Research | and plan |
| 3 | Brief | |
| 4 | Source | assets |
| 5 | Adapt and | localise |
| 6 | Review and | approve |
| 7 | Publish, | activate |
| 8 | Measure | |
| 9 | Optimise, | refresh |

**Row B: people lane.** Lane label `text.lane-lbl` at x = 9, y = 60: "PEOPLE · decide, approve, handle exceptions". Nodes at y = 68, h = 56, class `node node-human` (add `node-fades` where marked).

| Col | Node lines | Notes |
|---|---|---|
| 1 | Set goal, / budget and / limits | |
| 2 | Approve / the plan | h 40 |
| 4 | Direct / new master / concepts | Out of slice scope, but shown because it is the human creative role |
| 5 | Linguist / samples | h 40; `node-fades` |
| 6 | Decide / exceptions | h 40; accent: also `node-review` styling allowed |
| 7 | Go-live / sign-off / pilot only | `node-fades` |
| 9 | Approve / changes / above caps | |
(Columns 3 and 8 are empty: no human step.)

**Boundary.** A `line class="boundary"` at y = 140 from x 9 to 711. Label `text.note` at x = 711, y = 156, `text-anchor="end"`: "approval and exception boundary".

**Row C: agent lane.** Lane label at x = 9, y = 172: "AGENTS · execute within permissions, check, escalate".
- **Run bracket 1** (`g.run`, rect x = 87, y = 178, w = 468, h = 100, rx = 4) spans columns 2–7. Inner label `text.note` at x = 95, y = 194: "launch run · one objective, many stages, no hand-offs".
- **Run bracket 2** (`g.run`, rect x = 559, y = 178, w = 152, h = 100) spans columns 8–9. Inner label at x = 567, y = 194: "monitoring run".
- Agent nodes at y = 206, h = 56, class `node`, except column 6 which is `node node-review`:

| Col | Node lines |
|---|---|
| 2 | Draft plan / from goal / and data |
| 3 | Write task / specs per / market |
| 4 | Pull / approved / masters |
| 5 | Derive, / localise, / re-lay out |
| 6 | Check / policy and / rights |
| 7 | Stage, / verify, / publish |
| 8 | Join / results to / asset IDs |
| 9 | Propose or / apply / fixes |

**Edges** (all horizontal edges at y = 234, from the right edge of one node to the left edge of the next; `class="edge"`, `marker-end="url(#ff1w-arrow)"`):
- Agent chain: col2→3, 3→4, 4→5, 5→6, 6→7, 7→8 (crosses from run 1 into run 2), 8→9.
- **Human to agent** (plain edges, downward): col1 people (bottom y 124) → col2 agent top (y 206), a diagonal path `M48 124 V150 H126 V204`, label `note` "goal" near (56, 150). Col4 people → col4 agent (vertical, x = 282, y 124 → 204).
- **Boundary crossings** (accent; `class="edge edge-review"`, `marker-end="url(#ff1w-arrow-review)"`, plus `marker-start` with a review marker if double-headed, which the new test must allow). Vertical lines at the column centre from the agent node top (y 206) to the people node bottom (y 108 or 124):
  - col2 "plan for approval" (up)
  - col5 "sample" (up)
  - col6 "exceptions" (up)
  - col7 "ready to go live" (up)
  - col9 "change above caps" (up)
  Decisions return down the same line (double-headed). Keep labels in the steps list, not on the diagram, to avoid clutter.
- **Feedback loop** (`class="edge edge-soft"`, `marker-end="url(#ff1w-arrow)"`): `path d="M672 278 V296 H126 V280"`. Label `text.note` at x = 360, y = 312, `text-anchor="middle"`: "results and learnings feed the next plan".

**Row D: shared platform.** Lane label at x = 9, y = 336: "SHARED PLATFORM · built once, reused by every workflow". Eight blocks, class `platform`, at y = 344, h = 40, width 84, x = 10 + 88i (10, 98, 186, 274, 362, 450, 538, 626). Text ≤ 11 characters per line:

| # | Line 1 | Line 2 |
|---|---|---|
| 1 | Objectives | and ledger |
| 2 | Brand and | claims |
| 3 | Rights and | context |
| 4 | Workflow | engine |
| 5 | Permissions | and tools |
| 6 | Checks and | evals |
| 7 | Approval | inbox |
| 8 | Outcome | measures |

One `line class="edge-soft"` with no marker from the bottom of run bracket 1 (x = 321, y = 278) to the platform top (y = 344) is optional. Instead, prefer a `text.note` at x = 711, y = 330, `text-anchor="end"`: "every step reads and writes here".

**Row E: existing systems.** Lane label at x = 9, y = 404: "YOUR EXISTING SYSTEMS · connected, not replaced". Eight tags, class `system`, at y = 412, h = 24, width 84, same x as row D, single line centred at y = 428: **DAM, CMS, PIM, TMS, Ad platforms, Email, MAP** (11 characters, fits), **Analytics, Work mgmt**. The steps list must expand every abbreviation.

**Row F: legend** (y = 452–492, `text.note` items with sample strokes): plain arrow "work moves on"; accent dashed line "approval and exception boundary"; accent arrow "crosses the boundary"; dotted box "one agent run"; dashed node "falls away as trust grows"; grey dashed arrow "feedback loop". Two rows of three, at y = 464 and y = 484, x = 9, 249 and 489.

### Narrow variant (viewBox 0 0 300 H, about 900)

A single column of nine stage nodes, `x = 30, width = 240` (≤ 28 characters per line), each with 3 lines. Line 1 is the stage name (`node-t`), line 2 "Agent: …", line 3 "People: …" (or "People: none"). Heights are 56 and the gap is 16, so stage i is at y = 40 + 72i.

| Stage | Line 2 (agent) | Line 3 (people) | Class |
|---|---|---|---|
| Objective | Agent: drafts the record | People: set goal and limits | `node node-human` |
| Research and plan | Agent: drafts plan from data | People: approve the plan | `node node-human` |
| Brief | Agent: task specs per market | People: none | `node` |
| Source assets | Agent: pulls approved masters | People: direct new concepts | `node node-human` |
| Adapt and localise | Agent: derives and localises | People: linguist samples | `node` |
| Review and approve | Agent: checks policy, rights | People: decide exceptions | `node node-review` |
| Publish and activate | Agent: stages and verifies | People: go-live, pilot only | `node node-human node-fades` |
| Measure | Agent: joins results to IDs | People: none | `node` |
| Optimise and refresh | Agent: proposes, applies fixes | People: approve above caps | `node node-human` |

- Lane header at y = 20: `text.lane-lbl` "Each stage: what the agent does, what people do".
- **Run brackets on the left rail:** a `path class="run"`-style line at x = 18 from the top of the Research node to the bottom of the Publish node, with ticks; label node above? No: put a `text.note` at x = 30, y = (top of Research) − 4: "launch run starts". A second bracket for Measure → Optimise, labelled "monitoring run".
- **Boundary markers:** on the right side (x = 274–290), a short accent tick (`edge-review`) beside each node with human approval; a single legend line explains "accent tick = crosses the approval boundary".
- **Feedback loop:** `path class="edge edge-soft"` from the Optimise node's right edge (x 270) → x 292 → up to the Research node's right edge, arrow. Label `note` below Optimise: "results feed the next plan".
- **Platform:** after the stages, `text.lane-lbl` "Shared platform, reused by every workflow", then two 3-line nodes (`platform`, x = 30, w = 240): "Objectives, ledger, rules / Workflow engine, permissions / Checks, evals, approval inbox" and "Outcome measures". Alternatively, four 112-wide blocks in two rows using the existing 112-unit geometry (x = 30 and 158).
- **Existing systems:** one `system` node, 2 lines: "DAM · CMS · PIM · TMS · ads" / "email · analytics · work mgmt".
- **Legend:** three lines of `note` text.

### Steps list (text equivalent; no digits)
1. Objective: a person sets the goal, measures, budget and limits; the agent records it.
2. Then Research and plan: the agent drafts a plan from the goal and data; a person approves the plan.
3. Then Brief: the agent writes task specs for each market and channel.
4. Then Source assets: the agent pulls approved master assets and their rights from the digital asset manager (DAM); people direct any new concept.
5. Then Adapt and localise: the agent derives variants and localises them through the translation management system (TMS); linguists check samples, fewer as quality is proven.
6. Then Review and approve: the agent checks every variant against policy, claims and rights; exceptions cross the approval boundary to a person.
7. Then Publish and activate: the agent stages and verifies in the content management system (CMS), ad platforms and email or marketing automation platform (MAP); in the pilot a person signs off go-live.
8. Then Measure: the agent joins results from analytics to each asset and run.
9. Then Optimise and refresh: the agent proposes or applies permitted fixes; changes above the caps go to a person. Results and learnings feed the next plan.
10. Underneath, a shared platform (objectives and ledger, brand and claims, rights and context, workflow engine, permissions and tools, checks and evals, approval inbox, outcome measures) is built once and reused by every workflow, connected to the systems you already run, including the product information manager (PIM) and work management.

Caption: "**Figure N** The content supply chain run by agents: people set goals and decide exceptions, agents carry the work across stages, and a shared platform underneath is reused by later workflows. Illustrative." Keep the caption digit-free.

### Placement
Put this figure at the top of the new content-supply-chain section. It replaces v1 Figure 3 (the six-box supply chain), which it fully supersedes. A smaller companion, a static "autonomy ladder" figure (four rungs), belongs in the thesis section. That is not this researcher's remit, but it should share the `fig-d` style.

---

## 9. Mapping v1 s03–s08 into the new structure

The proposed order follows brief s11: opportunity → insight → **what needs to be built** → **first workflow** → economics → outcomes → **expansion** → roadmap → risks → appendices.

| v1 material | Verdict | New home | Notes |
|---|---|---|---|
| s03 Figure 2 "factory model" | **Retire or appendix** | Appendix A (technical) or delete | The factory metaphor is superseded by the workflow and autonomy framing. Keep "derive, don't generate" as one paragraph in the Adapt stage of the supply-chain section |
| s03 Figure 3 "content supply chain" | **Replace** | New supply-chain section (new Figure) | The new diagram supersedes it |
| s03 prose: constraint moves to review; manifest; "measure quality before volume" | **Keep, condensed** | "What needs to be built" (checks; run record) and the supply-chain section | "Asset manifest" becomes "run record" (it now covers actions, not just assets). Say so once: "the asset manifest in earlier versions" is not needed in v2 copy. Just rename |
| s04 layer table | **Rewrite and merge** | "What needs to be built": becomes the ten-capability component table (category names only) | Rows map: Policy source → Library; Brief and concepts → Objective record and Planner; Generation and Derivation → Worker agents and skills; Review agent, Gate, Eval → Checks and evals plus Approval inbox; Asset manifest → Run record; Activation → Connectors and permissions; Measurement → Outcome measures. Add the missing rows: workflow engine, permissions, feedback loop |
| s04 "one versioned policy source", "skills as software" | **Keep** | "What needs to be built" (Library; Worker agents and skills) | Core ideas, still correct |
| s05 10,000-asset campaign (matrix, imagery sourcing, personalisation) | **Move to appendix**, with a two-sentence pointer from the Adapt stage | Appendix B "Variant volume and imagery" | Keep the data-fig bindings unchanged (crosscheck tests). The 46% human-touch figure stays visible in the economics section because it drives review hours |
| s06 Review agent (Figure 5, rules list, reference datum) | **Appendix, summarised in the body** | Body: three sentences in "Checks and evals". Appendix A1: full section | The rules list is the strongest technical content. Keep it whole. Add the LLM-as-judge limits paragraph (sources above). The page allows one Intercom mention outside s12 and s15, currently in s06; the Intercom research section will need that test changed |
| s07 Auto-approval gate (Figure 6, tier table, always-human list, capacity table, fatigue controls) | **Split** | Body ("What needs to be built"): tiers T0–T3 plus the new permission levels table plus the always-human list. **Economics section**: the reviewer-capacity table and break-even auto-approval (brief s7 asks for review-capacity reconciliation). Appendix A2: Figure 6, fatigue controls, the legal callout | Figure 6's test ties it to the tier table directly after it. Move them together |
| s08 Eval harness and telemetry (Figure 7, metrics table) | **Appendix, summarised in the body** | Body: "Checks and evals" and "Outcome measures" rows. Appendix A3: full section. Telemetry metrics list → scorecard section (brief s8 tiers) | Extend the harness metrics with task-completion and deployment-verification checks, and a consistency (repeat-run) measure |
| s09 five levers | **Reframe** | Expansion section: each lever becomes an adjacent workflow on the shared platform (table in section 6 of this file) | Keep the evidence paragraphs and grades. Change the headings from "lever" to "workflow" |
| s12 How this compares | **Keep and extend** | Stays a named section, probably after "What needs to be built" or in the appendices | Add a dated sub-table "What the major suites and channels already automate" (section 2 above). Requires `compare.test.js` h3 list and new source rows |
| s13 Adoption and Backlog 0 | **Move** | Roadmap section (organisational enablement) | Backlog 0 stays as a service-level measure |

### Integration points and test impact (explicit)
- **Section ids.** 61 test references point at s03–s08. Recommend **semantic ids for new sections** (`build`, `supply-chain`, `expand`, `appendix-review` and so on) and a single planned pass that updates `page.test.js`, `diagram.test.js` (`EXPECTED_FIGURES`), `crosscheck`, TOC, `#s0N` cross-links and share-link anchors together. Do not leave orphan `href="#s07"` links. A grep gate in a test (every `href="#…"` resolves to an id) prevents this.
- **Figure numbering.** Inserting the new figure early renumbers Figures 2–7. `diagram.test.js` asserts numbering in page order and the section for each figure. Update both in the same plan.
- **Vendor gate.** Section 2's vendor table goes only into s12 and s15. Engineering-guidance sources (model developers, OWASP, MCP spec, Temporal, papers) go into s15 with neutral link text in the body. "MCP" and "Model Context Protocol" are **not** in `VENDOR_RE`. Naming the open protocol in the body is technically allowed, but it is an **author decision** whether a protocol counts as a vendor. Recommended body wording: "a standard tool-connection protocol".
- **data.js.** New `sources` entries need `accessed: '2026-10-25'`. `compare.test.js` requires all *gradial/airops/profound* sources to share one accessed date (2026-10-24). New vendor prefixes (adobe-, salesforce-, …) are outside that regex, but if the s12 matrix caption collapses dates, it must cover the mixed dates.
- **No new numbers in the architecture section** except via `data.js` assumptions with grades. The pilot acceptance targets belong to the roadmap or economics researchers.

### Suggested build order
1. **Scaffold:** new section ids and order, the TOC, the anchor-resolution test, and the test updates for moved sections. No content change yet.
2. **"What needs to be built"** (plain-English block, the ten-capability table condensed for the body with a full version in `<details>`, the permission levels, the build/integrate/platform table, the minimal slice). Text only, so it carries little risk.
3. **Supply-chain section and diagram:** both SVG variants, CSS, `flow.test.js`, the steps list, the stage table, the worked example (hours placeholders bound to the economics model once available).
4. **Move s05–s08 to appendices**, with body summaries and the reviewer-capacity table moved to economics.
5. **Expansion section:** the reusable versus domain-specific table and adjacent workflows, rebuilt from s09 content.
6. **s12 extension:** the dated platform sub-table and s15 rows.
7. **Print and 320px checks** with the existing `scripts/print.mjs`, `smoke.mjs` and `a11y.mjs`.

Steps 2 and 3 have no dependency on the economics rework, except the worked example's hours, so they can run in parallel with it.

---

## 10. Scaling considerations (for the page's "how it grows" argument)

| Concern | Pilot (one workflow, a few markets) | Programme (5–7 workflows) | Organisation-wide |
|---|---|---|---|
| Reviewer load | Sampling heavy; humans see most items | Sampling reduced per proven action class; capacity table governs | Exceptions-only for T0/T1; review hours still scale with volume, so model them (v1 s07) |
| Connectors | 5–6 systems | Most of the stack | Maintenance becomes a standing ops cost; budget for it |
| Eval sets | One, seeded from past launches | One per workflow | Owned by a small evaluation function separate from builders |
| Permission policy | Stage only | Publish within caps for proven classes | Spend within caps for proven classes; quarterly review |
| Run record | One store | Shared schema across workflows | The source of the leadership scorecard |

---

## Sources (accessed 2026-10-25 unless stated)

**Engineering practice (HIGH unless noted)**
- Building effective agents (model developer engineering post), 2024-12-19: https://www.anthropic.com/engineering/building-effective-agents
- Demystifying evals for AI agents, 2026-01-09: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- A practical guide to building agents (model developer PDF; tool risk ratings, human-intervention triggers, manager versus decentralised patterns): https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
- Model Context Protocol specification 2025-11-25 (security and trust principles): https://modelcontextprotocol.io/specification/2025-11-25 (newer versions may exist; check before citing a version)
- OWASP LLM06:2025 Excessive Agency: https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
- The lethal trifecta, 2025-06-16 (MEDIUM; practitioner): https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
- Zheng et al., Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena, 2023: https://arxiv.org/abs/2306.05685
- Shankar et al., Who Validates the Validators?, 2024-04-18: https://arxiv.org/abs/2404.12272
- Temporal, Durable AI and human-in-the-loop cookbook: https://docs.temporal.io/ai

**Platform capabilities (for s12 and s15 only)**
- MarTech, Adobe CX Enterprise, 2026-04-20 (updated 2026-05-05): https://martech.org/adobe-rebrands-experience-cloud-as-cx-enterprise-goes-all-in-on-ai-agents/
- Adobe AEP agents GA press release, 2025-09-10: https://news.adobe.com/news/downloads/pdfs/2025/09/091025-general-availability-of-ai-agents.pdf (not opened; via search, MEDIUM)
- Computerworld, Workfront AI Collaborators, 2026-08-13: https://computerworld.com/article/4209291/adobe-now-lets-workfront-users-assign-tasks-to-ai-agents.html
- Salesforce, Connections 2026 takeaways, 2026-06-12: https://www.salesforce.com/blog/?p=145255
- Salesforce, marketing agents, 2024-10-21: https://www.salesforce.com/blog/marketing-agents/
- HubSpot Spotlight (Breeze agents), updated 2025-04-10: https://www.hubspot.com/company-news/spring-2025-spotlight-breeze-agents
- CMSWire, HubSpot Fall '26 Spotlight, 2026-09-16: https://www.cmswire.com/customer-experience/hubspot-debuts-breeze-assistant-selfupdating-crm/
- Google Ads Help, brand guidelines: https://support.google.com/google-ads/answer/14934472?hl=en
- Google Ads Help, AI Max for Search: https://support.google.com/google-ads/answer/15910366
- Meta Advantage+: https://www.facebook.com/business/ads/meta-advantage-plus
- Campaign Asia on the WSJ report of Meta's full-automation aim (LOW): https://www.campaignasia.com/article/meta-aims-to-fully-automate-ad-creation-with-ai-by-2026/502831
- Smartling release, 2026-05-19: https://www.smartling.com/company-news/smartling-launches-its-largest-ai-innovation-release-yet
- Phrase AI solutions and QPS help: https://phrase.com/platform/ai-solutions , https://support.phrase.com/hc/en-us/articles/5709672289180
- Bynder Compliance Agent, 2025-12-16 (403; via search summary): https://www.globenewswire.com/news-release/2025/12/16/3206286/0/en/Bynder-expands-AI-Agent-capabilities-to-empower-brands-to-scale-creative-freedom-with-intelligent-control.html

**Repository (inspected 2026-10-25):** `site/index.html` s03–s08 and s12; `site/assets/style.css` (fig-d classes, print block, CSP-compatible); `test/diagram.test.js` (fig-d geometry rules); `test/page.test.js` (`VENDOR_RE`, Intercom count, CSP); `test/compare.test.js` (s12 structure).

## Gaps and open questions
- **Vendor GA status** for several agents (Salesforce Goals and Content agents, HubSpot Marketing Studio, Meta full automation, one Workfront collaborator type) is unconfirmed. Wording in s12 must say "announced" or "described", not "available".
- **The Adobe Summit 2026 primary release** (Business Wire) returned 403. A re-read before publishing s12 rows is needed.
- **Cross-vendor orchestration absence** is "not found in pages read". It must be phrased with v1's "Not publicly documented (checked 2026-10-25)" convention.
- **Hours and hand-off counts** for the worked example are not researched here. The economics researcher should source them, or grade them as hypotheses needing customer validation.
- **Author decision:** whether naming MCP (an open protocol) in the body breaches the neutrality rule.
- **Print:** the wide variant at about 8pt on A4 should be checked with `scripts/print.mjs`. If it is too small, fall back to printing the narrow variant at `max-width: 300px` (height about 900, which fits one A4 page).
