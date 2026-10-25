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

**Order:** guards before edits; engine before prose about numbers; thesis and architecture text alongside the engine; presentation last. Every phase ends with `node --test`, crosscheck, smoke, a11y and print gates green (QA-05 is owned by Phase 10 but enforced in every phase).

- [x] **Phase 5: Restructure Scaffold, Evidence Schema & Guards** - Executive-question section order with semantic ids and legacy anchors, evidence classes on every figure, and tests that stop links, figures and depth being lost (completed 2026-10-25)
- [ ] **Phase 6: Economics Engine** - `calc.js` models W1–W10, the capacity bridge, scenarios A/B/C, investment and sensitivity, with no double counting enforced by invariant tests
- [ ] **Phase 7: Thesis, Intercom Evidence & What Needs to Be Built** - First screen, 2x definition, autonomy ladder, rewritten Intercom section and the "What needs to be built" architecture (can run alongside Phase 6)
- [ ] **Phase 8: Content Supply Chain & Diagram** - Full supply chain as the first workflow, responsive two-variant SVG diagram, hours-bound worked example, v1 depth moved to appendices
- [ ] **Phase 9: Economics, Outcomes & Calculator Presentation** - Honest-2x panel, per-workflow table, scenarios, reconciliation, sensitivity, outcomes chain and scorecard, calculator on A/B/C
- [ ] **Phase 10: Expansion, Roadmap, Risks, Comparison & Publish** - Adjacent workflows, 12-week pilot to 12-month portfolio, risks, dated platform sub-table, full validation and publish

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
- [ ] 06-01-PLAN.md — calc.js hardening (additive): concept split fields, cash/internal views, reviewer bridge, scale-vs-programme effects, pooled queue bound, rework_rate fix
- [ ] 06-02-PLAN.md — Portfolio engine workflows.js: W1-W10 states, pools and bridge, scenarios A/B/C, ledger and invariants, investment, primary metric, sensitivity, max multipliers
- [ ] 06-03-PLAN.md — Atomic v1 figure migration: cash-view legacy scenarios, 35.2 h concept split, one price per hour, computed derived claims, page figures and prose
- [ ] 06-04-PLAN.md — Engine inputs in data.js (kind 'engine'), engineContext(), new sources, generated register rows, per-side evidence
- [ ] 06-05-PLAN.md — Generated econ-* claims, engine evidence trace, no-hand-typed guards, phase-end gates

### Phase 7: Thesis, Intercom Evidence & What Needs to Be Built
**Goal**: A reader of the opening sections can say what is being built, why autonomy (not more content) is the lever, what 2x means, and what Intercom actually showed.
**Depends on**: Phase 5 (can run alongside Phase 6)
**Requirements**: THESIS-01, THESIS-02, THESIS-03, THESIS-05, THESIS-06, INTERCOM-01, INTERCOM-02, INTERCOM-03, INTERCOM-04, BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05
**Success Criteria** (what must be TRUE):
  1. The first screen states the thesis, the proposed system and the measurable ambition with grade chips; the reader then sees an explicit 2x definition (primary metric, speed measure, quality guardrails, outcome metrics, trade-offs), capacity/efficiency/effectiveness kept separate with "doubled capacity does not establish doubled revenue", why marketing has no merged-PR equivalent, and the four-rung autonomy ladder with when higher autonomy is and is not justified.
  2. The Intercom section shows what was measured and why, results tagged company-reported with dates and sources, demonstrated versus uncertain, how the bottleneck moved, and a table of transferable principles with their marketing translation and what does not transfer; tooling is named by category only.
  3. An early "What needs to be built" section opens with a plain-English description readable in about 60 seconds, then a capability table covering all ten capabilities (problem, software, inputs/integrations, agent permissions, verification, human intervention, autonomy contribution) each marked build-and-own, integrate or platform-provided by category.
  4. The reader sees permission levels (read, draft, stage, publish, spend) beside tiers T0–T3 and the always-human decisions, and the smallest useful end-to-end slice with expansion steps E0–E5.
  5. Jargon, vendor-neutrality, anchor, inventory and all existing gates are green.
**Plans**: TBD
**UI hint**: yes

### Phase 8: Content Supply Chain & Diagram
**Goal**: The reader sees the content supply chain as the first delegated workflow, end to end, with a diagram that explains human vs agent work at a glance and a worked example whose hours come from the model.
**Depends on**: Phase 5, Phase 7 (worked-example hours need Phase 6)
**Requirements**: FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05, STRUCT-07
**Success Criteria** (what must be TRUE):
  1. The reader sees the full chain from business objective to optimisation and refresh, with content generation shown as one step, and why removing handoffs, coordination and repeated review is worth more than faster generation, as a wedge into a broader system.
  2. A responsive inline-SVG diagram (wide and narrow variants) shows stages, human vs agent lanes, multi-stage agent runs, the shared platform underneath, approval/exception boundaries and the measure→act loop; it is legible at 320px and in print, has a text equivalent, does not rely on colour alone, and is locked by `test/flow.test.js`.
  3. The worked example "launch an approved campaign in additional markets" states step by step what is autonomous and what is not, with hours and handoffs bound to model figures via `data-fig`.
  4. v1 depth (10,000-asset campaign, review agent, gate, eval harness, telemetry, comparison, register) is present as body summaries or appendices, confirmed by the figure inventory test, and all gates are green.
**Plans**: TBD
**UI hint**: yes

### Phase 9: Economics, Outcomes & Calculator Presentation
**Goal**: A CFO can audit, on the page, what changes in hours, FTEs, cost and investment under each scenario, and a CMO can see how that capacity might, and might not, become business outcomes.
**Depends on**: Phase 6 (and the Phase 5 scaffold)
**Requirements**: ECONP-01, ECONP-02, ECONP-03, ECONP-04, ECONP-05, ECONP-06, OUT-01, OUT-02, OUT-03, THESIS-04
**Success Criteria** (what must be TRUE):
  1. The reader sees an honest-2x statement of what the default model gives organisation-wide versus on the delegated portfolio, the workflow inventory with all eight brief fields and a prioritisation, and the per-workflow current vs agent-enabled table (pilot workflows in full, others rolled up) with evidence classes.
  2. The reader sees scenarios A, B and C side by side with annual financial implications, investment and payback; the released-hours reconciliation with reconciled reviewer capacity (baseline slack shown separately); and sensitivity to adoption, error rates, inference cost and review overhead.
  3. The calculator offers A/B/C, keeps its existing inputs, share link and "show the maths", maps legacy `scenario=` values, and no longer mislabels a partial cost as "fully loaded".
  4. The outcomes section shows the causal chain with a visible marker where evidence stops and hypothesis begins, a three-tier scorecard separating productivity from activity, and sourced diminishing-returns and outcome mechanisms (speed, learning velocity, reallocation, market coverage).
  5. Every figure on these sections is generated from `data.js`/`calc.js` and all gates are green at desktop and 320px.
**Plans**: TBD
**UI hint**: yes

### Phase 10: Expansion, Roadmap, Risks, Comparison & Publish
**Goal**: The reader sees how the system expands, how it is delivered and proven, what could stop it, and how it compares to what suites already automate; the finished page is validated and live.
**Depends on**: Phases 5, 6, 7, 8, 9
**Requirements**: EXP-01, EXP-02, ROAD-01, ROAD-02, ROAD-03, ROAD-04, RISK-01, COMP-01, QA-05, QA-06, QA-07
**Success Criteria** (what must be TRUE):
  1. The reader sees adjacent workflows on the same infrastructure, which capabilities are reusable versus domain-specific, a 12-week pilot (workflow and why, software, integrations, baseline measurement, "stage" autonomy, target and acceptance criteria), the next two quarters, and a 12-month portfolio that combines without double counting and is clearly separated from proven pilot results.
  2. The reader sees organisational enablement (training, trust, permissions, accountability, role redesign) and each listed risk and assumption with a mitigation or test.
  3. The comparison section has a dated sub-table of what major suites and channels already automate, sourced, with "announced" where availability is unconfirmed, and matching new register rows; vendor names appear nowhere else.
  4. `node --test`, crosscheck, smoke, a11y and print gates pass, the page is checked at desktop and 320px, and W3C Nu reports 0 errors.
  5. The page is live on GitHub Pages and a completion summary lists changes, material assumptions, what remains unverified and checks run.
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
| 6. Economics Engine | v2.0 | 0/TBD | Not started | - |
| 7. Thesis, Intercom Evidence & What Needs to Be Built | v2.0 | 0/TBD | Not started | - |
| 8. Content Supply Chain & Diagram | v2.0 | 0/TBD | Not started | - |
| 9. Economics, Outcomes & Calculator Presentation | v2.0 | 0/TBD | Not started | - |
| 10. Expansion, Roadmap, Risks, Comparison & Publish | v2.0 | 0/TBD | Not started | - |
