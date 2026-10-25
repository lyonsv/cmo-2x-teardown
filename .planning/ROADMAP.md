# Roadmap: CMO 2x — Marketing Acceleration Teardown

## Milestones

- ✅ **v1.0 CMO 2x Teardown** — Phases 1–4 incl. 3.1 (shipped 2026-10-24) — [archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v2.0 Autonomous Marketing Operations** — Phases 5–10 (in progress, started 2026-10-25)

## Phases

<details>
<summary>✅ v1.0 CMO 2x Teardown (Phases 1–4) — SHIPPED 2026-10-24</summary>

- [x] Phase 1: Foundation & Thesis Slice (7/7 plans) — completed 2026-10-24
- [x] Phase 2: Factory & Spine Slice (8/8 plans) — completed 2026-10-24
- [x] Phase 3: Levers, Outcomes, Calculator & Comparison Slice (12/12 plans) — completed 2026-10-24
- [x] Phase 3.1: Headline Metric Reframe (7/7 plans) — completed 2026-10-24
- [x] Phase 4: Adoption, Risk, Evidence & Publish Slice (9/9 plans) — completed 2026-10-24

</details>

### 🚧 v2.0 Autonomous Marketing Operations (Phases 5–10)

**Milestone goal:** Rework the live report from "AI content production" into a case for progressively delegating whole marketing workflows to agents: what must be built, what it is worth in hours, FTEs, cost and KPIs, and how a 12-week pilot proves it. Central chain: software built → autonomy enabled → human work reduced → marketing capacity increased → business outcomes improved.

**Order:** guards before edits; engine before prose about numbers; thesis and architecture text alongside the engine; presentation last. Every phase ends with `node --test`, crosscheck, smoke, a11y and print gates green (QA-05 is owned by Phase 7 after the 2026-10-25 merge of former Phases 7–10).

- [x] **Phase 5: Restructure Scaffold, Evidence Schema & Guards** - Executive-question section order with semantic ids and legacy anchors, evidence classes on every figure, and tests that stop links, figures and depth being lost (completed 2026-10-25)
- [x] **Phase 6: Economics Engine** - `calc.js` models W1–W10, the capacity bridge, scenarios A/B/C, investment and sensitivity, with no double counting enforced by invariant tests (completed 2026-10-25)
- [ ] **Phase 7: Content, Presentation & Publish** - All new reader-facing sections (thesis, Intercom, build, supply chain + diagram, economics/outcomes/calculator, expansion, roadmap, risks, comparison), then validate and publish (merged from former 7–10)

## Phase Details

### Phase 5: Restructure Scaffold, Evidence Schema & Guards
**Goal**: The live page is reordered around the executive questions without losing a single v1 link, figure or share link, and every figure carries a visible evidence class, so all later content edits happen behind guards.
**Depends on**: Nothing (first phase of v2.0; builds on shipped v1.0)
**Requirements**: STRUCT-01, STRUCT-02, STRUCT-03, STRUCT-04, STRUCT-05, STRUCT-06, EVID-01, EVID-02, EVID-03
**Success Criteria** (what must be TRUE):
  1. A reader sees sections in executive-question order (opportunity, why autonomy, what needs to be built, first workflow, economics, outcomes, expansion, roadmap, risks, appendices) and the TOC matches; every v1 anchor (`#s01`–`#s15`, figure and table ids) still lands on the matching content.
  2. A recorded v1 calculator share link (`#s11?…`, including `scenario=redeploy|hold|reduce`) restores a scenario in a fixture test.
  3. Tests fail if a v1 `data-fig` id or `<figure>` disappears without being listed as retired, if any in-page `href="#…"` does not resolve, or if banned jargon appears in the page body.
  4. Every assumption and claim in `data.js` has an `evidence` class (observed, benchmark, illustrative, hypothesis) in an allowed (evidence, grade) pair enforced by a test, and the reader sees the class in the assumptions table and the source register.
  5. The grade key explains the four evidence classes and states that nothing is observed for the subject organisation until the pilot runs; `node --test`, crosscheck, smoke, a11y and print gates are green (browser gates in CI or a documented per-phase gate run).
**Plans**: 5 plans
Plans:
- [x] 05-01-PLAN.md — Guards on the v1 page: balanced-tag test helper, inventory and share-link fixtures, anchor and jargon tests, scripts/gates.sh
- [x] 05-02-PLAN.md — Evidence schema in data.js (EVIDENCE, ALLOWED_PAIRS, evidence on every source, assumption and claim) with pair tests
- [x] 05-03-PLAN.md — Mechanical move to executive-question order with semantic ids and new TOC, then ordinal-label text fix
- [x] 05-04-PLAN.md — Framing stubs, appendix divider and Supports pointers
- [x] 05-05-PLAN.md — Evidence column in both registers, evidence key in the grade legend, phase-close gates
**UI hint**: yes

### Phase 6: Economics Engine
**Goal**: A tested model produces every labour and financial figure the page will need (per workflow, per scenario, per role) from `data.js`/`calc.js`, with conservation and no-double-counting proven by tests, so 2x is tested rather than assumed.
**Depends on**: Phase 5
**Requirements**: ECON-01, ECON-02, ECON-03, ECON-04, ECON-05, ECON-06, ECON-07, ECON-08, ECON-09, ECON-10, ECON-11, ECON-12
**Success Criteria** (what must be TRUE):
  1. `calc.js` returns, for each of W1–W10 in current and agent-enabled states, workload, hours per unit, review and exception hours, total hours, productive FTE, labour cost, agency/vendor cost, AI/software cost, cost per equivalent output, cycle time and autonomous share, plus the primary metric (useful work per marketing FTE-equivalent, agency FTE-equivalents included, frozen baseline standard hours) organisation-wide and for the delegated portfolio.
  2. Tests enforce INV-1–INV-11: released hours reconcile exactly into eliminated, redeployed, avoided hires, reducible external spend, removable headcount and baseline-unused capacity; each hour has one price; labour is counted once; no saving exceeds its source line; reviewer slack, programme-added review load and work avoided are separate outputs.
  3. Scenarios A, B and C (C default) are distinct outputs with investment (build, run incl. platform team, inference, autonomy review overhead, escape cost), annual net effect, scale-vs-programme decomposition, sensitivity to adoption, escape rate, inference cost and review overhead, and the maximum sustainable multiplier per constrained role.
  4. Master-concept cost is split into internal hours and an explicit agency fee; the `rework_rate` read path cannot return NaN when baseline and 2x values differ (regression test).
  5. No page figure that comes from the model is hand-typed (crosscheck enforced), and all existing gates remain green.
**Plans**: 5 plans
Plans:
- [x] 06-01-PLAN.md — calc.js hardening (additive): concept split fields, cash/internal views, reviewer bridge, scale-vs-programme effects, pooled queue bound, rework_rate fix
- [x] 06-02-PLAN.md — Portfolio engine workflows.js: W1-W10 states, pools and bridge, scenarios A/B/C, ledger and invariants, investment, primary metric, sensitivity, max multipliers
- [x] 06-03-PLAN.md — Atomic v1 figure migration: cash-view legacy scenarios, 35.2 h concept split, one price per hour, computed derived claims, page figures and prose
- [x] 06-04-PLAN.md — Engine inputs in data.js (kind 'engine'), engineContext(), new sources, generated register rows, per-side evidence
- [x] 06-05-PLAN.md — Generated econ-* claims, engine evidence trace, no-hand-typed guards, phase-end gates

### Phase 7: Content, Presentation & Publish
**Goal**: Write every new reader-facing section in one push — opening thesis and 2x definition, Intercom evidence, "What needs to be built", the content supply chain with its diagram and worked example, economics and outcomes presentation (calculator on A/B/C), expansion, roadmap, risks and the comparison update — then validate and publish. Merged from former Phases 7–10 on 2026-10-25 at the author's request to cut elapsed time (lean workflow: one plan set, one consolidated code review, one gate run, no per-phase verification).
**Depends on**: Phase 5, Phase 6
**Requirements**: THESIS-01, THESIS-02, THESIS-03, THESIS-04, THESIS-05, THESIS-06, INTERCOM-01, INTERCOM-02, INTERCOM-03, INTERCOM-04, BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05, FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05, STRUCT-07, ECONP-01, ECONP-02, ECONP-03, ECONP-04, ECONP-05, ECONP-06, OUT-01, OUT-02, OUT-03, EXP-01, EXP-02, ROAD-01, ROAD-02, ROAD-03, ROAD-04, RISK-01, COMP-01, QA-05, QA-06, QA-07
**Interim publish**: once the opening sections (thesis, 2x definition, Intercom, What needs to be built) and the supply-chain section with diagram are written and all gates pass, publish an interim version (author-approved 2026-10-25); later sections may still show v1 content at that point.
**Success Criteria** (what must be TRUE):
  1. Opening: the first screen states the thesis, proposed system and measurable ambition with grade chips; then an explicit 2x definition (primary metric, speed measure, guardrails, outcome metrics, trade-offs), capacity/efficiency/effectiveness kept separate, why marketing has no merged-PR equivalent, the four-rung autonomy ladder, and an Intercom section (measured and why, company-reported results with dates, demonstrated vs uncertain, the bottleneck moved, transferable-principles table; tooling by category only).
  2. "What needs to be built": a 60-second plain-English block; all ten capabilities with problem, software, inputs/integrations, agent permissions, verification, human intervention, autonomy contribution, each marked build-and-own / integrate / platform-provided; permission levels beside T0–T3 and always-human decisions; smallest slice and E0–E5.
  3. Supply chain: the full chain objective → optimise/refresh with generation as one step; a responsive two-variant inline-SVG diagram (lanes, multi-stage agent runs, shared platform, approval/exception boundaries, measure→act loop; legible at 320px and print; text equivalent; not colour-only; locked by test/flow.test.js); a worked example with hours bound to model figures; v1 depth kept in body summaries or appendices (inventory test).
  4. Economics and outcomes: honest-2x statement (org-wide vs delegated portfolio), workflow inventory with prioritisation, per-workflow table with evidence classes, scenarios A/B/C with investment and payback, released-hours reconciliation with baseline slack separate, sensitivity; calculator on A/B/C keeping inputs, share link (legacy values mapped) and show-the-maths; causal chain with evidence-boundary marker, three-tier scorecard, sourced diminishing returns; every figure generated from data.js/calc.js.
  5. Expansion, roadmap, risks, comparison and publish: adjacent workflows and reusable vs domain-specific; 12-week pilot, next two quarters, 12-month portfolio without double counting, separated from proven results; enablement; risks with mitigations; dated platform sub-table in the comparison section (vendors nowhere else); all gates green at desktop and 320px; W3C 0 errors; live on GitHub Pages with a completion summary.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution order:** 5 → 6 and 7 (parallel) → 8 → 9 → 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Thesis Slice | v1.0 | 7/7 | Complete | 2026-10-24 |
| 2. Factory & Spine Slice | v1.0 | 8/8 | Complete | 2026-10-24 |
| 3. Levers, Outcomes, Calculator & Comparison Slice | v1.0 | 12/12 | Complete | 2026-10-24 |
| 3.1 Headline Metric Reframe | v1.0 | 7/7 | Complete | 2026-10-24 |
| 4. Adoption, Risk, Evidence & Publish Slice | v1.0 | 9/9 | Complete | 2026-10-24 |
| 5. Restructure Scaffold, Evidence Schema & Guards | v2.0 | 5/5 | Complete    | 2026-10-25 |
| 6. Economics Engine | v2.0 | 5/5 | Complete    | 2026-10-25 |
| 7. Content, Presentation & Publish | v2.0 | 8/10 | In Progress|  |
