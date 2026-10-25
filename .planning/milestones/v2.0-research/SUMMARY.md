# Project Research Summary

**Project:** CMO 2x — Marketing Acceleration Teardown, milestone v2.0 "Autonomous Marketing Operations"
**Domain:** Evidence-graded static executive report (hand-written HTML, vanilla ES modules, `node:test`) with a tested labour and financial model, re-framed from AI content production to progressively delegating whole marketing workflows to agents
**Researched:** 2026-10-25
**Confidence:** MEDIUM overall. HIGH on what Intercom said and on the v1 model audit; MEDIUM on cost structure and architecture practice; LOW on workflow-level hours and agent reductions (no public benchmark exists).

**Inputs:** `.planning/v2.0-BRIEF.md` (spec), `INTERCOM.md` (brief s1), `FEATURES.md` (brief s3, s4, s7, s8), `ARCHITECTURE.md` (brief s2, s5, s6, s9), `PITFALLS.md` (brief s7, s11, s12 and model audit). No STACK.md this milestone: the stack is unchanged (hand-written HTML/CSS, vanilla ES modules, pure `calc.js`, inline SVG, `node:test`, GitHub Pages).

---

## Executive Summary

v2.0 rewrites an existing, tested page; it does not build a new one. The thesis moves from "AI makes 10,000+ assets cheaply" to "give agents progressively more responsibility for whole workflows, under permissions, checks and approvals, and measure what that does to human hours, capacity and outcomes".

- Intercom's 2x was a **capacity metric** (merged PRs ÷ everyone in R&D) that Intercom itself calls "required, but not sufficient". Its gains came from an **operating system of mechanisms** (one standard agent platform, a shared skills library with evals, risk-gated review automation, management change), not a tool.
- The most transferable idea: **the bottleneck moves** (authoring → CI → review). In marketing, faster generation moves the constraint to approvals, trafficking and measurement.
- Marketing has no merged-PR equivalent, so the page must **construct** a unit of completed work and say why.

**Central honesty finding:** at the page's own defaults, 2x is **not** reached organisation-wide on labour hours: about 1.4–1.5x organisation-wide, about 1.8x on the delegated portfolio, 2x plausible on the best workflows (planning/ops, localisation, publishing, reporting). Saying so is what makes the rest credible.

**v1 holes a CFO would find:**
1. "Fully loaded" cost per asset covers only the ~$2.59M production line (~3.3% of budget), not ~$16M marketer labour or ~$16M agency fees.
2. $1,200 per master concept ≈ 13 loaded hours; not reconciled with in-house labour; undefined whether agency or internal.
3. The "3.3 reviewer FTE freed" is entirely pre-existing slack: reviewers are 55.1% utilised today (7,941 h of 14,400 h); total review hours **rise** 12% at 2x (6,905 → 7,747 h before rework; 7,941 → 8,909 with it).

**Main risks:** presenting baseline slack, scale effects or the 2x input as programme results; double-counting labour and agency dollars; implying capacity becomes revenue; losing v1 depth, anchors and share links during the restructure. All preventable with model invariants as tests, a capacity bridge, an evidence-boundary marker on the causal chain, and a scaffold-first restructure guarded by inventory and anchor tests.

---

## Decisions Taken (author away; orchestrator best judgement — treat as settled)

| # | Question | Decision |
|---|----------|----------|
| 1 | Re-base the illustrative company to remove reviewer slack? | **No.** Keep v1 company (120 FTE, $78M, 12 reviewers). Show baseline reviewer slack explicitly and reconcile it. Scenario attribution excludes baseline slack (INV-4). |
| 2 | Master concept cost ($1,200) | Explicit **internal-hours line + agency-fee line**, re-estimated as an illustrative assumption. Correct the "fully loaded" label to what it covers, or widen it genuinely. |
| 3 | Four evidence classes vs three grade chips | **Keep the three chips** (Benchmark / Modelled / Speculative). Add an orthogonal **`evidence` field**: `observed`, `benchmark`, `illustrative`, `hypothesis`, shown on the page (economics and assumptions tables) and in the register. Allowed (evidence, grade) pairs enumerated and tested. |
| 4 | Primary 2x metric | **Useful work completed per marketing FTE-equivalent** (agency FTE-equivalents in the denominator), weighted at **frozen baseline standard hours**; a unit counts only if objective-linked, approved and live/delivered. **Campaign-markets launched per quarter** stays as the reader-facing operational unit for the wedge. **Objective-to-live time** is the speed measure. Quality guardrails alongside. Outcomes **never claimed as doubled**. Page states honestly what the default model gives organisation-wide vs on the delegated portfolio. |
| 5 | Default economic narrative | **Scenario C (growing demand, limited hiring)** default; A (same team, more output) and B (same output, lower cost) alongside. Old `scenario=redeploy|hold|reduce` share-link values remain accepted (Redeploy→A, Hold→B, Reduce→B with headcount cut), tested with a recorded v1 URL fixture. |
| 6 | Vendor rule and Intercom's tooling | **Unchanged.** Intercom's tooling described by category ("a coding agent", "a shared skills repository"). "MCP" may be named as an open protocol. Platform-vendor evidence goes in s12 and the register only. |
| 7 | Section ids | **Semantic ids** (e.g. `#opportunity`, `#build`, `#supply-chain`, `#economics`) plus **legacy anchors** so v1 links and `#s11?…` share links keep working. |
| 8 | Pilot autonomy ceiling | **"Stage"**: a person clicks go-live. Action levels **read / draft / stage / publish / spend** alongside asset tiers T0–T3. |

**Consequences:**
- Decision 1 makes the capacity bridge a first-class economics element. At defaults: 4.21 FTE reviewer slack today; +0.95 FTE review load at 2x; 6.84 FTE review work avoided at 2x (3.57 avoided hires + 3.27 unused); 3.42 FTE genuinely removable at the same output. Reviewers do not bind until 2.75x.
- Decision 4 needs an illustrative, editable **agency-FTE-equivalent conversion** (agency fees ÷ blended rate). The larger denominator lowers the organisation-wide multiple; the page must show it.

---

## Key Findings

### Intercom (INTERCOM.md; replaces STACK.md this milestone)

- **Metric:** merged PRs ÷ all R&D people (2026 posts); "per engineer per month" in the June 2025 memo — the definition drifted. Chosen as a pragmatic throughput proxy and bottleneck detector. Self-reported, no counterfactual, confounded with a model upgrade (Christmas 2025); "3x over 16 months" window starts ~6 months before the goal was set; ~20%/yr growth pre-existed.
- **Results (company-reported):** ~2x on the metric; defect backlog −54%; breaking-change downtime −35%; 93.6% of PRs agent-driven; 19.2% of merged PRs AI-approved (86% ≤20 lines; median merge 14.6 vs 75.8 min), later "half" (one sentence). AI spend rising, unoptimised. Business outcomes asserted ("accelerating"), not quantified.
- **Mechanisms worth translating:** one standard platform after an open phase that didn't compound; a dedicated platform team (~7 senior) plus contribution from all; skills library (267 skills, 153 contributors) with owners, tests, promotion rules; judgment encoded in the environment and measured with/without (7% → 96%); decomposed review agent with a two-axis gate (eligibility policy × quality verdict); reviewer evaluated against a human-curated set (a newer model did worse); every AI approval logged, auditors engaged early; management change (protected time, permission, compulsory hackathon, no-IDE weeks, unlimited tokens as a spend floor).
- **Bottleneck migration:** writing code → CI (relayed: "melted down", ~10x cost; not re-verified) → human review → production diagnosis (unsolved).
- **Does not transfer:** a published ad cannot be reverted; brand/legal ground truth is contested; no single system of record or "merge" event; outcomes lag and credit is shared with sales; labour is only ~22% of marketing budget (Gartner 2025 21.9%, agencies 20.7%) vs payroll-dominated R&D; agencies sit outside headcount; most marketing orgs lack the "CI" foundation (pre-flight checks, verified publishing) — that foundation is a build item.
- No marketing 2x has been published by Intercom. Its marketing reorg is context only.

### Workflows and labour economics (FEATURES.md)

- **v1 company validated:** 7.8% of revenue (Gartner 2026); 120 FTE × $150k = $18.0M = 23.1% of $78M vs Gartner labour share 21.9–24.5%; $150k is a defensible US blend (BLS May 2025 medians $166,790 managers / $78,760 specialists; wages 70.0% of compensation). Implied agency ~$16.1M (20.7%) is **not modelled in v1** and must be. Paid media (~31%) is working spend, never a productivity saving. Addressable pool ≈ labour + agency ≈ 45% (~$35M).
- **Evidence posture:** task-level gains 14–55% well evidenced (Brynjolfsson +14%; Noy & Zhang −40% time; Dell'Acqua +12–40% inside the frontier, −19 pts outside). Organisation-level gains so far 1.4–5.4% of hours (St. Louis Fed), 2.8% (Danish admin data). The gap is coordination, verification and adoption — what workflow ownership targets — so it is the **central hypothesis**; the pilot tests it. No public evidence for ~50% workflow-hour reductions. Ju & Aral: +50% ads per worker, performance quality-dependent (output ≠ outcome). BCG 2026 "20–30% / 10x" are client anecdotes; quote only as dated aspiration.
- **Workflow inventory W1–W10** with all eight brief fields; 92 in-scope FTE, 28 out of scope; net hours released ~57k default, range 23–48 FTE-equivalent; capacity multiple ~1.8x on 80 non-review in-scope FTE (1.4–2.47x), ~1.4–1.5x across all 120.
- **Prioritisation:** W4 Localisation and W6 Publishing score 20; W2 Planning/ops and W5 Review 18 (pilot core); W3 Creative lowest (13), explicitly **not a 2x source**.
- **Doubled capacity ≠ doubled revenue:** median TV ad elasticity ~0.01 and >80% of brands negative marginal ROI (Shapiro et al., Econometrica 2021); median ROI CI >100 pts wide (Lewis & Rao, QJE 2015); media response saturates (Meridian Hill function). Defensible outcome mechanisms: speed to market, learning velocity, reallocation by marginal ROI, coverage of unserved markets.
- **14-item do-not-double-count register** (FEATURES s8) is the spec for the reconciliation.

**Must have:** workflow inventory; per-workflow model rows from brief s7 (full detail for pilot slice W2, W4, W5, W6; others at roll-up); net-of-agent-created-work hours (review/sampling/exception 15–25% of baseline at L2, 5–10% at L3, illustrative); v1 hole fixes; scenarios A/B/C plus reconciliation (redeployed, removed, unused, avoided hires, baseline slack); 2x definition with guardrails and falsifiers; three-tier scorecard; sensitivity (adoption, error/escape, inference cost, review overhead); evidence class on every figure; budget-structure anchor; prioritisation table.

**Should have:** "honest 2x" panel; released-hours waterfall; evidence-boundary marker on the causal chain (after "shorter objective-to-live"); task-vs-organisation productivity gap figure; autonomy level L1–L4 per workflow tied to a deterministic success check.

**Anti-features:** a single "total savings" number; revenue = output × conversion; RCT task gains applied to workflow hours; BCG figures as defaults; paid-media efficiency counted as productivity; false precision (show ranges).

### Architecture (ARCHITECTURE.md)

**A workflow with agent steps inside it, not a free-roaming agent.** A tested plan template per workflow defines the path; agents draft the plan, adapt, judge and diagnose inside steps. Moving up the autonomy ladder means widening **permissions per action** and later letting the planner choose among permitted actions on evidence.

Six plain parts covering the ten brief capabilities (own / integrate / platform):
1. **Objective record and outcome tracking** (own): goal, measures, guardrails, caps, owner, permission level.
2. **Brand, claims, rights and context library** (own content, integrate storage): versioned, read-only to agents, checks cite rule IDs.
3. **Workflow engine and plan templates** (integrate a durable engine; own templates and planner): removes coordination work.
4. **Connectors and permissions gateway** (own policy and action catalogue; integrate connectors/MCP/iPaaS): read/draft/stage/publish/spend levels, caps, rollback, kill switch, read-back; downstream system enforces permissions. Biggest autonomy lever.
5. **Worker agents and skills** (mostly platform; own rule-encoding skills).
6. **Checks and evals** (own eval sets and thresholds): deterministic checks → review agent on a different model family → sampling; task-completion and deployment checks; pass^k consistency. Autonomy raised only on eval evidence.
7. **Approval inbox** (integrate work-management approvals; own routing): evidence attached; timeouts escalate, never approve.
8. **Run record** (own): append-only ledger objective → run → task → asset → action → platform ID → result; generalises v1's asset manifest.
9. **Outcome measurement** (own definitions/joins; integrate analytics/MMM): holdout or geo designs for outcome claims.
10. **Feedback and optimisation** (own catalogue and caps): logged expected vs observed; don't rebuild in-channel bidding.

**Rule:** own the rules, permissions, evals, run record and outcome definitions; rent generators, channels and plumbing. Suites (Adobe, Salesforce, Workfront, Smartling, HubSpot) are converging on agents inside their own walls; none documents a cross-vendor run record, buyer-owned permission/eval layer or holdout measurement. Vendor detail goes only in s12 and the register.

**Patterns:** workflow first; evaluator–optimiser with bounded retries; stage → verify → publish; durable runs with human signals; least privilege enforced downstream; sampling never reaches zero; separate reading agent (untrusted web) from acting agent.

**Wedge and expansion:**

| Step | Adds | Rung |
|------|------|------|
| E0 pilot | 2–4 additional markets, 2–3 channels, T0/T1 only, "stage", proposals-only feedback | Agentic execution |
| E1 widen | More markets and channels | Agentic execution at scale |
| E2 raise permission | Auto-publish T0/T1 within caps | Higher autonomy |
| E3 close the loop | Monitoring run: refresh and pause | Higher autonomy (optimise) |
| E4 adjacent workflows | Reuse the six parts | Varies |
| E5 outcome-directed | Choices within caps, judged vs holdouts | Outcome-directed |

Machinery reusable; **eval sets, templates and outcome definitions are domain-specific**.

**Diagram spec (ARCHITECTURE s8):** two inline SVGs — `flow-wide` (viewBox 720×500, ≥760px and print) and `flow-narrow` (300×~900, mobile) — switched by CSS (CSP forbids inline script/style). Lanes: people / agents / shared platform / existing systems; run brackets; approval boundary; feedback loop; legend; digit-free steps list as text equivalent. New `fig-flow` class and `test/flow.test.js` (`diagram.test.js` locks `fig-d` to 300 wide, 240–560 high).

**v1 → v2 mapping:** s03 Figure 3 replaced by the new diagram; s03 factory figure retired/appendix; s04 layer table → ten-capability table; s05, s06, s08 → appendices with body summaries; s07 split (tiers, permission levels, always-human list → build; capacity table and break-even → economics; Figure 6 + fatigue controls → appendix); s09 levers → adjacent workflows; s12 kept and extended with a dated platform sub-table; s13 → roadmap and enablement.

### Pitfalls and model audit (PITFALLS.md)

1. **Baseline slack shipped as "FTE freed"** (see above). `site/index.html:545` "With the gate, human review hours fall" is false against today; rewrite as "per-variant hours fall 44%, total rises 12%". Reduce mode −$490k vs ~$632k from cutting slack with no AI.
2. **Double counting:** D1 `first_year_net` (`model.js:242`) adds review hours at $100/h in production cost and reviewer FTE at $150k (~$97k overstatement); D2 two prices for one hour ($100/$125); D3 $1.03M "funded from agency fees" cites a $101k saving already netted; D4 concept cost internal vs agency undefined (+$497k agency if agency); D6 portfolio workflows share one reviewer pool. Fix with a cash view, one price per hour, a saving ledger with `counted_in` tags, INV-1–INV-11 as tests.
3. **The 2x input as a finding; scale as AI:** `SCENARIO.multiplier = 2` is an input (`data.js:10`); 64% of the cost-per-asset fall happens at 2x with no AI (2x baseline assumptions → $52.22); brief-to-live gain comes entirely from build days 8 → 3 (review part slows 3.85 → 4.52 d). Fix: "the model tests 2x"; max sustainable multiplier per role; scale-vs-programme decomposition (INV-9); model marketer hours so "flat headcount" becomes a checked result.
4. **Capacity framed as effectiveness; Goodhart on autonomy %:** no revenue/pipeline/ROI computed from capacity; evidence-stops marker; autonomy % always paired with escape rate, first-pass acceptance, verified-objective rate; freeze eligibility definitions; Jevons note as hypothesis.
5. **Depth and link loss:** move, don't delete, under an inventory test of every v1 `data-fig` and `<figure>`; semantic ids with single legacy anchor spans (avoid duplicate-id crosscheck failures); id move as a separate test-only commit first; `#s11?` share-link fixture; crosscheck rule against literal numbers outside `data-fig` spans.

Further: P7 compounding multi-step error (0.95⁸ ≈ 0.66; price escalations from per-step success); P8 LLM judge not ground truth (agreement per tier/rule; calibration is a recurring human cost); P9 accountability (owner and approval boundary per workflow); P10 escapes scale with unseen volume (auto-approved unseen variants 7,579 → 45,474/yr; add escape-cost line); P11 labour relations (severance on a separate Speculative line; removal lags adoption); P16 diagram legibility at 320px and print; P17 chip density (one chip per sentence, weakest grade); P18 jargon ban-list test; P19 `VENDOR_RE` includes "claude"/"anthropic" — describe Intercom's tools by category; P20 smoke/a11y/print not in CI — run every phase. Latent bug: `model.js:218, 378, 392` read `rework_rate` without `pick()` → NaN if baseline and 2x differ.

---

## Implications for Roadmap

Six phases, numbered 5–10 (v1 ended at phase 4). Coarse granularity. Order: **guards before edits; engine before prose about numbers; thesis and architecture text in parallel with the engine; presentation last.**

### Phase 5: Restructure scaffold, evidence schema and guards
New section order per brief s11 with semantic ids, legacy anchors, updated TOC; anchor-resolution test; `data-fig`/figure inventory test; share-link fixture test; `evidence` field on every assumption and claim with allowed-pairs test and register/assumptions-table columns; jargon ban-list test; smoke/a11y/print in CI with retry or documented per-phase gate. Avoids P12–P14, P18, P20.

### Phase 6: Economics engine
`workflows[]` layer W1–W10 with role pooling, frozen baseline standard hours, primary metric (incl. agency-FTE-equivalent conversion); `capacity_bridge`; scale-vs-programme decomposition; explicit agency line; concept internal hours + agency fee; cash vs activity views; scenarios A/B/C (C default) and max sustainable multiplier per role; investment/build cost, run cost incl. ops FTE, inference cost model, adoption ramp, escape cost, review overhead of autonomy; sensitivities; INV-1–INV-11 tests with PITFALLS goldens; `rework_rate` fix; all page figures as derived claims. Research flag: range-setting for inference cost, agency FTE-e rate, build/run cost, per-step success, queue model (Erlang C vs labelled M/M/1 upper bound).

### Phase 7: Thesis, Intercom evidence and "What needs to be built" (can run alongside Phase 6)
First screen (thesis, system, measurable ambition, "tests 2x"); "what 2x means" (capacity/efficiency/effectiveness, no merged-PR equivalent, primary metric, guardrails, outcomes); rewritten Intercom section (results table with company-reported tags, demonstrated vs uncertain, the bottleneck moved, transferable-principles table, tooling by category); autonomy ladder figure; "What needs to be built" (60-second block, six parts, ten-capability table with `<details>`, permission levels beside T0–T3, always-human list, build/integrate/platform table, minimal slice, E0–E5).

### Phase 8: Content supply chain section and diagram
Two-variant SVG (`flow-wide`, `flow-narrow`), `test/flow.test.js`, stage-by-stage responsibilities table, ten-step worked example ("launch the approved campaign in three additional markets") with hours bound to `data-fig`; v1 s05–s08 moved to appendices with body summaries; `EXPECTED_FIGURES` renumbered. Finish after Phase 6 for the worked-example hours.

### Phase 9: Economics, outcomes and calculator presentation
Honest-2x panel; per-workflow table (pilot slice in full); capacity bridge and reconciled reviewer table; released-hours waterfall and reconciliation; scale-vs-programme bridge; investment, payback, sensitivity; calculator rewired to A/B/C with legacy mapping; "fully loaded" label corrected; outcomes section (causal chain with evidence boundary, three-tier scorecard, four defensible mechanisms, diminishing returns, Jevons note, falsifier retained); prioritisation table.

### Phase 10: Expansion, roadmap, risks, comparison update and final validation
Expansion (reusable vs domain-specific; adjacent workflows from s09 levers); roadmap (12-week pilot with baseline time study, "stage" ceiling, acceptance metrics as hypotheses; next two quarters E1–E3; 12-month portfolio combined via INV-8 pooling; enablement incl. s13 content, role redesign, platform team, aggregate-only telemetry, Backlog 0; pilot vs projection clearly separated); risks and assumptions; s12 dated platform sub-table with register rows and "announced" wording where GA unconfirmed; glossary; full gate run at desktop and 320px; completion summary. Research flag: vendor GA status re-check, Adobe primary release, works-council constraints.

---

## Gaps to Address

- Workflow hours per unit and agent reductions: no benchmark — editable illustrative/hypothesis values with ranges; pilot baseline time study (weeks 1–3) is the only route to observed data.
- Agency FTE-equivalent conversion: not researched — illustrative assumption, effect on org-wide multiple shown.
- Gartner 2026 labour share (24.5%) and 2026 agency share secondary; CMO Survey 2026 primary unreachable — Benchmark grade only for primary-confirmed figures.
- Localisation per-word and LLM post-editing throughput: no authoritative average — low grade/hypothesis.
- v1's 60% auto-approval vs Intercom's observed 19.2%/28.4% puts 2x at 100–111% reviewer utilisation — keep visible; grade 60% as pilot hypothesis.
- Intercom gaps: part-two post and full principles unpublished; no baselines or absolute counts; "half" is one sentence.
- Wide-diagram print legibility (~8pt on A4) unchecked; fallback to narrow variant in print.

---

## Sources

Full registers in INTERCOM.md (S1–S23), FEATURES.md, ARCHITECTURE.md and PITFALLS.md. Primary: Intercom/Fin posts (ideas.fin.ai, intercom.com blog, 2025-06-13 to 2026-08-28; company-reported); repository code recomputed in Node 2026-10-25; Gartner CMO Spend Survey 2025 (2025-05-12) and 2026 (2026-05-11); BLS OOH and ECEC; Brynjolfsson, Li & Raymond (QJE 2025); Noy & Zhang (Science 2023); Dell'Acqua et al. (2023); METR (2025-07-10, 2026-02-24); Humlum & Vestergaard (2025); Shapiro, Hitsch & Tuchman (Econometrica 2021); Lewis & Rao (QJE 2015); Building effective agents (2024-12-19); MCP spec 2025-11-25; OWASP LLM06:2025. Secondary: reference teardown (lyonsv, 2026-08-25); Chief Marketer reproductions of Gartner; Duke Fuqua CMO Survey; Ju & Aral (arXiv 2503.18238); St. Louis Fed (2025-02); BCG CMO Survey 2026; vendor/trade press for platform capabilities (s12 only).

*Research completed: 2026-10-25. Ready for roadmap: yes.*
