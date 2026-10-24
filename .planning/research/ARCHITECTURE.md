# Architecture Research

**Domain:** AI-accelerated enterprise marketing content factory (build-and-review spine) and the information architecture of the page that explains it
**Researched:** 2026-10-24
**Confidence:** MEDIUM. The supply-chain component map reflects well-established industry structure (training knowledge, not re-verified against vendor docs, which is fine because the page is category-neutral). The Intercom-to-marketing mapping is MEDIUM: only sections 01-04 and part of 05 of the reference are readable as text (the rest of the page is about 950k characters of base64 screenshots). Shrek, the gate, and shrek-curator details were NOT readable, so the mapping uses the PROJECT.md descriptions plus the section titles. The page IA is a recommendation, not a finding.

## Standard Architecture

### System Overview

Today's enterprise content supply chain is a relay of human hand-offs between systems of record. With agents it becomes a loop: a generation layer and a review layer both consume the same machine-readable policy, and review outcomes feed back as training and eval data.

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. INTENT LAYER                                                      │
│  Brief/intake ─ Campaign strategy ─ Audience & offer ─ Budget/targets│
│  (work mgmt / CMP)   (structured brief = machine-readable contract)  │
└───────────────┬──────────────────────────────────────────────────────┘
                │ structured brief (JSON-like: claims, locales, formats, audiences, risk class)
┌───────────────▼──────────────────────────────────────────────────────┐
│ 2. KNOWLEDGE / POLICY LAYER  (the "platform base")                   │
│  Brand guidelines-as-code ─ Claims library ─ Legal/reg rules by      │
│  market & product ─ Rights/licence registry ─ Glossaries/term bases  │
│  ─ Product data (PIM) ─ Approved-asset memory (DAM)                  │
└───────┬──────────────────────────────────────────────────┬───────────┘
        │ skills (brand, channel, locale)                  │ same policy
┌───────▼───────────────────────────┐          ┌───────────▼───────────┐
│ 3. BUILD LAYER                    │          │ 4. REVIEW LAYER       │
│  Orchestrator agent               │  asset + │  Review agent         │
│  ├ copy model                     │ manifest │  (brand/legal/rights/ │
│  ├ image/video model OR           │ ───────► │   accessibility/claims│
│  │  licensed/sourced retrieval    │          │   checks)             │
│  ├ creative automation/templating │ ◄─────── │  Risk tiering         │
│  │  (resize, adapt, version)      │ findings │  Auto-approval gate   │
│  ├ localisation/transcreation     │ (fix loop│  Human reviewer queue │
│  └ dynamic creative / feed render │  ≤N)     │  (sampled + escalated)│
└───────────────┬───────────────────┘          └───────┬───────────────┘
                │                                      │ decision + reason codes
                │                              ┌───────▼───────────────┐
                │                              │ 5. EVAL HARNESS       │
                │                              │  Ground truth = human │
                │                              │  decisions; precision/│
                │                              │  recall by tier; gate │
                │                              │  threshold tuning     │
                │                              └───────┬───────────────┘
┌───────────────▼──────────────────────────────────────▼───────────────┐
│ 6. SYSTEM OF RECORD: DAM + rights + provenance                       │
│  Approved asset + metadata + licence scope/expiry + C2PA-style       │
│  provenance + approval record (who/what approved, which tier)        │
└───────────────┬──────────────────────────────────────────────────────┘
                │ publish via connectors
┌───────────────▼──────────────────────────────────────────────────────┐
│ 7. ACTIVATION LAYER                                                  │
│  Ad platforms ─ Email/CRM/MAP ─ Web/CMS ─ Retail/commerce ─ CDP      │
│  (audience + decisioning chooses which variant to whom)              │
└───────────────┬──────────────────────────────────────────────────────┘
                │ impressions, clicks, conversions, incidents
┌───────────────▼──────────────────────────────────────────────────────┐
│ 8. MEASUREMENT & TELEMETRY                                           │
│  Creative-level performance ─ Experiment results ─ MMM/incrementality│
│  ─ Fatigue detection ─ Factory telemetry (cost/asset, cycle time,    │
│  rejection rate, escape rate, reviewer load)                         │
└───────────────┬──────────────────────────────────────────────────────┘
                └──► back to Layer 1 (briefs) and Layer 2 (what works → skills/claims)
```

### Component Responsibilities

| Component | Responsibility | Today (category) | Change when agents generate and review |
|-----------|----------------|------------------|----------------------------------------|
| Brief/intake (CMP, work management) | Capture objective, audience, claims, markets, deadlines | Free-text docs, forms, ticketing | Becomes a structured contract the agents consume; ambiguous briefs are the new bottleneck. Also yields the risk class that drives tiering |
| Brand guideline system | Hold identity rules | PDF/portal for humans | Compiled into machine-checkable rules plus exemplars (skills). Same source feeds generator and reviewer, otherwise they drift |
| Claims & legal rule library | Approved/prohibited statements by market and product | Legal memos, spreadsheets, tribal knowledge | Versioned, citable rule set; the review agent cites rule IDs. Biggest build effort and biggest enabler of auto-approval |
| PIM / product & catalog feeds | Source of truth for product attributes, price, availability | PIM, feeds to channels | Feeds dynamic creative render; makes whole families of variants deterministic (low risk) |
| DAM | Store, tag, search, version approved assets | Human tagging, folder taxonomy | Auto-tagging at ingest; becomes the retrieval memory for generators and the system of record for approvals and provenance |
| Rights management | Licence scope, territory, term, talent/model releases | Spreadsheet or DAM fields, manual checks | Machine-readable licence scope checked at assembly and at publish; expiry triggers takedown. Generated assets need their own provenance and model-terms record |
| Creative automation / templating | Deterministic resize, versioning, feed-driven rendering | Template engines, scripts, agencies | Stays the lowest-risk, highest-volume path. Agents drive it rather than replace it |
| GenAI models (copy, image, video) | Create net-new content | Piloted by individuals | Called by skills with brand/channel/locale context; outputs always carry a manifest (prompt, model, inputs, licence basis) |
| Localisation / transcreation | Adapt language and culture | TMS plus agencies, weeks of lag | Agent first draft with term base and in-market reviewer sampling; lag falls from weeks to hours for low-risk tiers |
| Review/proofing | Human approval rounds | Proofing tools, email, meetings | Review agent does first pass on everything; humans handle escalations and a sampled audit stream |
| Activation (ad platforms, MAP, CMS, CDP) | Deliver the right variant to the right audience | Manual upload, connectors | Connectors read the DAM approval state; only approved IDs publish (hard gate) |
| Measurement (creative analytics, experimentation, MMM) | Attribute outcomes | Siloed dashboards, quarterly MMM | Creative-level results join to asset manifest, giving learning velocity and fatigue signals back to briefs |
| Eval harness | Prove the review agent is right | Does not exist today | New component. Without it the gate cannot be trusted or tuned |
| Telemetry | Observe the factory | Rarely exists | New component. Cost/asset, cycle time, rejection and escape rates, reviewer load |

## Intercom-to-Marketing Construct Map

| Intercom construct | Marketing equivalent | Notes and risks |
|--------------------|----------------------|-----------------|
| Merged PRs per R&D head (per-head, not per engineer) | **Approved, live assets (weighted) per marketing head**, with weighting by complexity tier (a resize is not a hero film). Define "head" as total marketing FTE including agency-equivalent FTE | Goodhart hazard is worse than for PRs because assets are cheap to make. Pair with outcome metrics (ROAS/conversion, brief-to-live, rejection and escape rate) and with experiments per quarter. Weighted output must be defined before any 2x claim |
| "Our org is a factory" | Marketing as a content factory with a defined input (briefs), stations, QA, and throughput | Frame the factory as quality-controlled; avoid the "slop mill" connotation by leading with the review spine |
| Platform: base + developer-tools + team plugins, plus marketplace | Layer 0 base (policy, telemetry, provenance hooks); Layer 1 shared marketing tools (brief parser, DAM, rights, review client); Layer 2 function/team plugins (brand teams, regions, channels). Marketplace is an internal registry with owners, versions, and evals | Plugins must pass evals before deployment (the Intercom rule for developer-tools) |
| Plugin inventory | Inventory table grouped by Foundation / Creative / Channel / Locale / Data and insight / Ops | Keep category-neutral; show owner and eval status columns |
| Skills (anatomy, enforcement pattern) | Brand skills (identity, tone, imagery rules), channel skills (specs, platform policies), locale skills (term base, cultural rules, regulatory notes), product-line skills | Enforcement pattern: skill files plus hooks that refuse to emit assets without a manifest and rights basis |
| Shrek, the code review agent | **Brand/legal/rights review agent**: checks brand conformity, claim legality by market, rights and likeness, accessibility, factual match to PIM, and generative-artefact defects | Must cite rule IDs and attach findings to the manifest. Separate model/prompt family from the generator where practical, to limit correlated errors |
| Auto-approval gate | **Tiered gate by risk**: T0 deterministic derivatives (resize, reformat, feed render) auto-publish; T1 new executions inside approved claims and brand (agent plus sampled audit); T2 new claims, new imagery of people, new markets (agent plus mandatory human); T3 regulated product, comparative or health/finance claims, crisis topics (human and legal only, agent assists) | Tier is assigned from the brief's risk class and re-assessed by the review agent (can escalate, never de-escalate). Thresholds are set from eval data, not opinion |
| shrek-curator eval harness | **Review-eval harness**: ground-truth set built from human reviewer decisions (approve/reject/edit plus reason codes), seeded with planted violations and rights traps. Reports precision/recall per tier, false-approve (escape) rate, and drift over time | The gate threshold for each tier is a published number. A model, rule, or skill change cannot ship if it regresses the harness |
| Telemetry (Honeycomb, S3, Athena) | Factory telemetry: per-asset manifest and decision log in a queryable store; dashboards for cost/asset, cycle time, tier mix, auto-approval rate, escape rate, reviewer load, spend by team | Category-neutral wording: "observability and event store" |
| Spend as a floor, not a KPI | Same: AI spend per head is a minimum adoption signal, never a target; judge cost per approved asset and outcomes | Avoids Goodhart; this is the CFO bridge |
| Adoption: pulling up the floor | Raise the lowest-adopting teams (regions, brand, long-tail agencies) with enablement, templates, office hours, and champions rather than celebrating the top users | Show distribution of usage, not just the mean |
| Backlog 0 | **Zero unserved demand**: zero unserved localisation requests, zero untested audiences or hypotheses, zero assets past rights expiry still live, zero briefs waiting on an unstaffed variant | Use as the destination metric. Define with a queue-age SLA, not a literal zero |
| What they got wrong | Slop at scale, brand dilution, rights exposure, Goodhart on counts, reviewer fatigue, correlated model errors, over-trust in the gate | Candid section |

## Data Flow: how a brief becomes 10,000+ approved, rights-cleared assets

```
1  Brief (structured) ─► risk class + variant matrix declared
2  Matrix expansion (deterministic, not generative)
     sizes × channels × locales × audiences × test cells × feed items
     e.g. 6 sizes × 5 channels × 12 locales × 6 audiences × 4 tests ≈ 8,640 base cells, plus feed items
3  Source decision per cell: retrieve approved asset (DAM) │ licensed/sourced │ generate
4  Build: master concepts (few, human-directed, high tier) ─► derive (templating, localisation, feed render)
5  Every asset emits a MANIFEST (inputs, model, prompt/skill versions, rights basis, claim IDs, locale, tier)
6  Review agent: checks asset + manifest against policy; returns pass / fix / escalate (+ rule IDs)
7  Fix loop (bounded retries) ─► else escalate
8  Gate: T0 auto ─ T1 auto + sample audit ─ T2/T3 human queue
9  Human decisions logged with reason codes ─► eval ground truth ─► threshold tuning
10 Approved asset written to DAM with approval record + provenance + licence expiry
11 Activation connectors publish only approved IDs; rights expiry triggers pull
12 Performance joins back by asset ID ─► fatigue detection, learning, new briefs/skills
```

Key point for the page: the 10,000 is mostly derivation of a few concepts, so about 85-95% of assets sit in T0/T1 (Modelled assumption, to be exposed in the calculator). Human attention concentrates on the few master concepts and the T2/T3 tail. This is where the economics and the governance argument meet.

### Boundary rules (what talks to what)

| Boundary | Communication | Rule |
|----------|---------------|------|
| Build to Review | Asset + manifest only | Reviewer never trusts generator self-reports; it re-derives checks |
| Review to Gate | Findings + proposed tier | Review can escalate tier, never lower it |
| Gate to DAM | Approval record | Only the gate writes "approved"; humans override through the same path |
| DAM to Activation | Approved-ID allow-list | Hard gate; unapproved assets cannot publish |
| Human decisions to Eval | Decision + reason code | Every human decision is ground truth. Sampling of auto-approved items provides the escape-rate estimate |
| Measurement to Intent/Policy | Aggregated insights | Learnings propose changes to briefs and skills, but policy changes are human-approved and eval-gated |
| Policy sources to Build and Review | One versioned source | Single source prevents generator/reviewer drift |

## Architectural Patterns

### Pattern 1: Derive, do not generate
**What:** Generate few master concepts; produce volume through deterministic templating, localisation, and feed rendering. **When:** Variant explosion (10,000+). **Trade-offs:** Far lower risk and cost; less novelty per variant, so pair with an experimentation lane for true creative divergence.

### Pattern 2: Risk-tiered gate with eval-set thresholds
**What:** Auto-approval authority is earned per tier by measured precision/recall on human ground truth. **Trade-offs:** Needs a labelled set and ongoing sampling; reviewer sampling adds cost but is the only honest escape-rate measure.

### Pattern 3: Policy as code, shared by maker and checker
**What:** Brand, claim, and rights rules as versioned artefacts used by skills and by the review agent. **Trade-offs:** Up-front legal/brand effort; correlated failure if the rules themselves are wrong, so rules carry owners and review dates.

### Pattern 4: Manifest and provenance on every asset
**What:** Immutable record of how an asset was made and approved. **Trade-offs:** Pipeline discipline; pays back in rights audits, regulator requests, and takedowns.

### Pattern 5: Evidence-graded claims in the page itself
**What:** Each number tagged Benchmark / Modelled / Speculative with visible assumptions and a source ID. **Trade-offs:** Slower to write; core to credibility with the CFO.

## Anti-Patterns

### Anti-Pattern 1: Counting assets as the output metric
**What people do:** Report raw asset count. **Why wrong:** Cheap to inflate; invites slop. **Instead:** Weighted approved-and-live assets per head with outcome and quality guardrails.

### Anti-Pattern 2: Generator and reviewer on separate rulebooks
**Instead:** One policy source, different model/prompt families.

### Anti-Pattern 3: Human review of everything (or of nothing)
**Why wrong:** The first hits reviewer fatigue and kills the speed case; the second hides escapes. **Instead:** Tiering plus sampled audits.

### Anti-Pattern 4: Gate thresholds set by opinion
**Instead:** Thresholds are outputs of the eval harness and are published.

### Anti-Pattern 5: Telling the CFO that AI spend is a KPI
**Instead:** Spend is a floor; cost per approved asset and outcomes are the KPIs.

## Scaling Considerations (of the factory, not the web page)

| Concern | 1 campaign / one market | Dozens of campaigns, 10+ locales | Global, many brands |
|---------|-------------------------|----------------------------------|---------------------|
| Policy and claims library | Single brand rulebook | Per-market claim variants | Federated ownership with a central core |
| Reviewer load | Everything human-reviewed is feasible | Tiering mandatory | Regional reviewer pools plus sampled audit |
| Eval set | Hundreds of labelled decisions | Per-tier, per-locale sets | Continuous labelling and drift monitoring |
| Rights | Spreadsheet works | Machine-readable scope required | Expiry automation and takedown SLAs |

First bottleneck: human review capacity for T2/T3 and ambiguous briefs. Second: rights and claim data quality (legacy assets with unknown licence scope).

## Page Information Architecture

### Recommended page section order

Mirrors the reference's 14-section skeleton but moves the calculator and risk framing so the argument serves both readers. Front matter (unnumbered): title block, metadata (date, evidence base, assumed org profile), "How to read the confidence grades" key (Benchmark / Modelled / Speculative; keep the reference's visual badge pattern), table of contents, one-paragraph "answer first" summary.

| # | Section | Reader | Purpose | Figures / tables / components |
|---|---------|--------|--------|-------------------------------|
| 01 | The claim and how to measure it | CMO | Define the 2x output metric (weighted approved-live assets per head) and the four outcome families, with the anti-gaming rules | Fig 1: metric tree (output vs outcome vs guardrail). Table: "Every number, its grade, and its source" (stub; completed in 14). Callout: what 2x does not mean |
| 02 | The spend floor and the CFO answer | CFO | Cost per approved asset falls while AI spend per head rises; spend is a floor, not a KPI | Fig 2: cost-per-asset vs AI spend curve (Modelled). Calculator teaser result, linked. CFO callout. **Needs the calculator model but not the UI** |
| 03 | The mental model: marketing as a factory | CMO | Operating principle: agents must meet a senior marketer's standard, and the factory has QA | Fig 3: factory diagram (the system overview above, simplified). Today vs agent-era supply chain table |
| 04 | Anatomy of the content supply chain | CMO | Brief to measure, components, what changes with agents | Fig 4: supply-chain flow (brief, create, adapt, review, rights/DAM, distribute, measure). Component table (category-only) with "what changes" column |
| 05 | The platform: three layers and a marketplace | CMO | Base/policy, shared tools, team plugins, internal marketplace | Fig 5: layer diagram. Table: plugin inventory by category with owner and eval status |
| 06 | Skills: brand, channel, locale | CMO | Skill anatomy and enforcement pattern | Table: skill inventory; example skill outline; enforcement callout (no manifest, no output) |
| 07 | The 10,000-asset campaign, end to end | CMO | Variant explosion, imagery source decision, personalisation, feeds | Fig 6: matrix expansion worked example. Fig 7: data-flow of brief to approved assets (the 12 steps). Table: source decision (retrieve / licence / generate) by risk. **Calculator inputs defined here** |
| 08 | The review agent | CMO/Legal | What the agent checks, how it cites rules, fix loop, limits | Table: check inventory and rule sources. Fig 8: review sequence diagram. Example finding card |
| 09 | The auto-approval gate | CMO/CFO | Tiers T0-T3, escalation rules, authority earned by eval data | Fig 9: tier ladder with volume share and review mode. Table: tier criteria, examples, approver, sampling rate |
| 10 | The eval harness: ground truth from reviewers | CMO/CFO | How reviewer decisions become the benchmark; precision/recall, escape rate, drift | Fig 10: labelling loop. Illustrative confusion matrix per tier (Speculative, labelled as illustrative). Table: metrics and thresholds |
| 11 | Telemetry | CFO | What is measured, where it lives | Dashboard mock (Fig 11, Illustrative). Table: metric dictionary with definitions |
| 12 | The other four 2x areas | CMO | Localisation, experimentation, insight and reporting, ops (briefs, approvals, DAM tagging, rights) each with output metric and outcome argument | One compact card per area. Table: output metric, outcome link, grade |
| 13 | The outcome case | CMO/CFO | Revenue/pipeline, speed, quality/brand, learning velocity | Fig 12: outcome chain (volume to testing to learning to performance). Table: outcome metrics, baseline, 2x scenario, grade |
| 14 | **Your numbers: the calculator** | CFO | Reader sets assets/campaign, campaigns/yr, team size, cost/asset, locales, tier mix, reviewer rates; sees baseline vs 2x output, cost, cycle time | Interactive component with visible assumptions panel, grade badge per output, sensitivity table, "reset to defaults", shareable URL state |
| 15 | Adoption: pulling up the floor | CMO | Enablement across creative, brand, and regional teams; adoption distribution | Fig 13: usage distribution (Illustrative). Table: team archetypes and plays |
| 16 | Where it leads: Backlog 0 | CMO | Zero unserved demand: localisation, audiences, hypotheses, rights expiry | Table: Backlog 0 metrics with queue-age SLAs |
| 17 | What goes wrong | Both | Slop at scale, brand dilution, rights/IP exposure, Goodhart, reviewer fatigue, correlated errors | Risk register table: likelihood, impact, control, residual |
| 18 | Source register and evidence gaps | CFO | Every cited source with ID and grade; what is not known | Source table; "evidence gaps" list; assumptions register matching the calculator |

Note: this is 18 sections versus the reference's 14. If strict parity matters, merge 03+04, 05+06, and 10+11 to land at 15, and fold 12 into 13. Recommended default: keep 14-ish by merging; see the roadmap implication below. Either way, the calculator should sit at a point where the reader has seen the factory and the gate (so the tier-mix inputs make sense) and before adoption and risk.

### Argument arc

1. CMO: claim, metric, why it is credible (01, 03, 04).
2. CFO hook early: the spend floor and cost trend (02) with the calculator result teased, so finance readers stay.
3. The machinery (05-07), then the spine (08-10) where governance earns trust, then telemetry (11).
4. Breadth and outcomes (12-13) so the case is not volume for its own sake.
5. Calculator (14) lets both readers test it with their numbers.
6. Adoption, Backlog 0, and candour (15-17) address "can we do it" and "what could go wrong".
7. Evidence (18).

### Calculator model (must be specified first)

Inputs: assets per campaign, campaigns per year, team size (FTE), loaded cost per FTE, current cost per asset, locales, audiences, tests per campaign, current brief-to-live days, tier mix (T0-T3 share), review minutes per tier, auto-approval escape rate, AI spend per asset or per head.
Outputs: baseline vs 2x assets per head, cost per approved asset, total cost, cycle time, human review hours and reviewer load, expected escapes at the chosen escape rate (this keeps the governance cost visible).
Rules: every default has a grade and a source ID; outputs inherit the weakest input grade; a "what you must believe" panel states the break-even assumptions; client-side only, no persistence, state in URL hash.

### Build order for the page (dependencies)

```
A. Evidence & assumptions register (source IDs, grades, defaults)      ─┐
B. Metric definitions (output metric, outcome metrics, guardrails)      ├─► C. Calculator model (pure JS, unit-testable, no UI)
                                                                        ┘          │
D. Page shell: title block, grade key, TOC, figure/table/callout styles            │
E. Architecture content: 03, 04, 05, 06 (diagrams are static SVG)                  │
F. Spine content: 07, 08, 09, 10, 11  (tier mix and rates feed C's defaults) ◄─────┤
G. Section 02 CFO answer (cites C's output)  ◄────────────────────────────────────┘
H. Calculator UI (14) on top of C
I. Breadth and outcomes: 12, 13
J. Adoption, Backlog 0, what goes wrong: 15, 16, 17
K. Section 18 source register finalised last, reconciled against every grade used
L. Cross-check pass: every number on the page appears in the register; calculator defaults equal prose figures
```

Hard dependencies: A and B before C; C before G and H; F's tier shares and review rates before C's defaults are finalised (iterate once); K last. Diagrams (Figs 3-10) can be built in parallel with prose. Suggested phases: (1) evidence and metric foundation, (2) calculator model, (3) page shell and design system, (4) architecture and spine sections, (5) breadth, outcomes, adoption, risk, (6) calculator UI, CFO section, final reconciliation, deploy.

## Recommended Project Structure (static site)

```
/
├── index.html            # single self-contained page (matches the reference's hosting model)
├── assets/
│   ├── styles.css        # tokens, grade badges, figure/table/callout styles, print styles
│   ├── calculator.js     # model (pure functions) + UI binding, no network
│   ├── data.js           # defaults, grades, source IDs (single source for prose and calculator)
│   └── figures/*.svg     # inline-able SVG diagrams (text-selectable, accessible, lightweight)
└── tests/calculator.test.js   # model sanity tests (optional, run locally)
```

Rationale: the reference page is about 950k characters because screenshots are base64-embedded; avoid that. Use SVG and real HTML tables so it loads fast, is searchable, and is accessible. A single `data.js` prevents the prose and calculator numbers from diverging.

## Integration Points

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GitHub Pages | Static files from branch/`docs` | No server. Pin any CDN library versions with SRI hashes, or use none (prefer vanilla JS and hand-written SVG; optional small charting lib) |

| Boundary | Communication | Notes |
|----------|---------------|-------|
| data.js to prose and calculator | Build-time or load-time injection | Same figures everywhere |
| Calculator to URL hash | State serialisation | Shareable scenarios, no persistence |

## Gaps and flags for later phases

- Reference sections 05-14 were unreadable (base64 images). Review the live page visually before locking the gate tiers, eval metrics, and Backlog 0 definition so the translation is faithful. Do not quote Intercom specifics beyond the sections 01-04 facts verified here.
- Benchmarks for content-factory productivity, review-agent precision, and cost per asset need a dedicated sourcing pass; expect many figures to be Modelled or Speculative.
- Regulated-category and AI-disclosure rules differ by jurisdiction; treat the T3 definition as illustrative and flag it as not legal advice.
- Section count (14 vs 18) is a decision for the roadmap.

## Sources

- https://lyonsv.github.io/intercom-2x-teardown/ (sections 01-04 and part of 05 readable; remainder are screenshots). MEDIUM
- .planning/PROJECT.md (project requirements and context). HIGH for scope
- Industry knowledge of marketing technology categories (DAM, PIM, CMP, creative automation, MMM, rights management). Training data, LOW-MEDIUM; not verified against current vendor documentation, intentionally category-level.

---
*Architecture research for: AI-accelerated enterprise marketing content factory and its explainer page*
*Researched: 2026-10-24*
