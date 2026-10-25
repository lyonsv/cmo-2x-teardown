# Requirements: CMO 2x — milestone v2.0 Autonomous Marketing Operations

**Defined:** 2026-10-25
**Source:** `.planning/v2.0-BRIEF.md` (author brief, verbatim) and `.planning/research/SUMMARY.md` (incl. "Decisions Taken" 1–8, which are settled).
**Core value (v2.0):** A CMO, CFO or technology leader can explain, after the opening sections, what we are building (a concrete system for safely delegating whole marketing workflows to agents), why it matters, where we start, how it expands, what it is worth in auditable hours, FTEs, cost and KPIs, and how a pilot proves it — and the deeper sections survive hours of scrutiny. Central chain: software built → autonomy enabled → human work reduced → marketing capacity increased → business outcomes improved.

"Reader" below means a CMO, CFO or technology leader reading the live page.

## v2.0 Requirements

### Structure and guards (STRUCT)

- [x] **STRUCT-01**: The page is reordered around the executive questions (opportunity, why autonomy, what needs to be built, first workflow, economics, outcomes, expansion, roadmap, risks, appendices), with a TOC that matches.
- [x] **STRUCT-02**: Sections use semantic ids; every v1 anchor (`#s01`–`#s15`, figure and table ids) still resolves to the matching content.
- [x] **STRUCT-03**: v1 calculator share links (`#s11?…`, including `scenario=redeploy|hold|reduce`) still restore a scenario, proven by a recorded-URL fixture test.
- [x] **STRUCT-04**: A test fails if any v1 `data-fig` id or `<figure>` disappears without being listed as deliberately retired.
- [x] **STRUCT-05**: A test fails if any in-page `href="#…"` does not resolve.
- [x] **STRUCT-06**: A test fails if banned jargon (e.g. "agentic marketing operating system", "AI transformation", "unlock", "supercharge") appears in the page body.
- [ ] **STRUCT-07**: v1 depth (10,000-asset campaign, review agent, gate, eval harness, telemetry, comparison, register) is preserved in body summaries or appendices, not deleted.

### Evidence classes (EVID)

- [x] **EVID-01**: Every assumption and claim in `data.js` carries an `evidence` class (observed, benchmark, illustrative, hypothesis) alongside its existing grade; a test enforces the allowed (evidence, grade) pairs.
- [x] **EVID-02**: The reader can see the evidence class of every figure in the economics tables, the assumptions table and the source register.
- [x] **EVID-03**: The grade key explains the four evidence classes and states that nothing on the page is observed for the subject organisation until the pilot runs.

### Economics engine (ECON)

- [x] **ECON-01**: `calc.js` models workflows W1–W10 with, per workflow and per state (current vs agent-enabled): annual workload, human hours per unit, review and exception hours, total human hours, productive FTE, fully loaded labour cost, agency/vendor cost, AI and software cost, cost per equivalent output, cycle time and autonomously completed share.
- [x] **ECON-02**: Released hours reconcile exactly into hours eliminated, capacity redeployed, avoided hires, reducible external spend, removable headcount and capacity already unused at baseline (a test enforces conservation).
- [x] **ECON-03**: The reviewer model reports baseline slack, programme-added review load and work avoided as separate figures, so "spare capacity" never includes pre-existing slack.
- [x] **ECON-04**: Each hour has one price; labour is counted once (cash view: payroll by FTE, external spend by line); savings cannot exceed their source line (tests enforce INV-1–INV-11).
- [x] **ECON-05**: Master-concept cost is split into internal hours and agency fee, and the agency line is modelled explicitly.
- [x] **ECON-06**: Cost and speed changes are decomposed into scale effects (doubling volume without the programme) and programme effects.
- [x] **ECON-07**: Scenarios A (same team, more output), B (same output, lower cost) and C (growing demand, limited hiring; default) are computed as distinct outputs.
- [x] **ECON-08**: The engine computes the primary metric (useful work per marketing FTE-equivalent, agency FTE-equivalents in the denominator, frozen baseline standard hours) organisation-wide and for the delegated portfolio.
- [x] **ECON-09**: The engine computes required investment (build, run including platform team, inference, review overhead of autonomy, escape cost) and annual net effect per scenario.
- [x] **ECON-10**: The engine computes sensitivity of results to adoption, error/escape rate, inference cost and review overhead.
- [x] **ECON-11**: The engine reports the maximum sustainable multiplier per constrained role, so 2x is tested, not assumed.
- [x] **ECON-12**: All page figures from the model are generated from `data.js`/`calc.js` (no hand-typed model numbers), and the `rework_rate` read path cannot return NaN.

### Thesis and 2x definition (THESIS)

- [x] **THESIS-01**: The first screen states the thesis, the system being proposed and the measurable ambition, with grade chips.
- [x] **THESIS-02**: The reader sees an explicit 2x definition: one primary metric, a speed measure, quality guardrails and outcome metrics, with trade-offs explained.
- [x] **THESIS-03**: Capacity, efficiency and effectiveness are defined and kept separate, and the page states that doubled capacity does not establish doubled revenue.
- [x] **THESIS-04**: The page states honestly what the default model gives organisation-wide versus on the delegated portfolio.
- [ ] **THESIS-05**: The reader sees the autonomy ladder (assistance, agentic execution, higher autonomy, outcome-directed autonomy) and when higher autonomy is and is not justified.
- [x] **THESIS-06**: The page explains why marketing has no merged-PR equivalent and how the constructed unit of completed work avoids that trap.

### Intercom evidence (INTERCOM)

- [ ] **INTERCOM-01**: The reader sees what Intercom measured and why, its results tagged company-reported with dates and sources.
- [ ] **INTERCOM-02**: The reader sees what Intercom demonstrated versus what remains uncertain.
- [ ] **INTERCOM-03**: The reader sees how the bottleneck moved across the engineering lifecycle and why the same happens in marketing.
- [ ] **INTERCOM-04**: The reader sees a table of transferable operating principles, their marketing translation and what does not transfer.

### What needs to be built (BUILD)

- [ ] **BUILD-01**: An early, prominent section titled "What needs to be built" opens with a plain-English description of what the system does, who uses it and how it works, readable in about 60 seconds.
- [ ] **BUILD-02**: The reader sees each capability (objective record, context library, workflow engine, connectors and permissions, worker agents, checks and evals, approval inbox, run record, outcome measurement, feedback) with problem, software, inputs/integrations, agent permissions, verification, human intervention and autonomy contribution.
- [ ] **BUILD-03**: Each capability is marked build-and-own, integrate, or already provided by existing platforms (by category in the body).
- [ ] **BUILD-04**: The reader sees permission levels (read, draft, stage, publish, spend) beside asset risk tiers T0–T3 and the always-human decisions.
- [ ] **BUILD-05**: The reader sees the smallest useful end-to-end slice and how the architecture expands from it (E0–E5).

### Content supply chain (FLOW)

- [x] **FLOW-01**: The reader sees the full content supply chain from business objective to optimisation and refresh, with content generation shown as one step.
- [x] **FLOW-02**: A responsive inline-SVG diagram shows stages, human vs agent responsibilities, multi-stage agent runs, the shared platform underneath, approval/exception boundaries and the measure→act loop, legible at 320px and in print.
- [x] **FLOW-03**: The diagram has a text equivalent and does not rely on colour alone.
- [x] **FLOW-04**: A worked example ("launch an approved campaign in additional markets") states step by step what is autonomous and what is not, with hours and handoffs bound to the model.
- [x] **FLOW-05**: The page shows why removing handoffs, coordination and repeated review is worth more than faster asset generation, and that the wedge leads into a broader system.

### Economics presentation (ECONP)

- [ ] **ECONP-01**: The reader sees the per-workflow current vs agent-enabled table (pilot workflows in full, others at roll-up level) with evidence classes.
- [ ] **ECONP-02**: The reader sees scenarios A, B and C side by side with annual financial implications, required investment and payback.
- [ ] **ECONP-03**: The reader sees the released-hours reconciliation (eliminated, redeployed, avoided hires, external spend, removable headcount, baseline slack) and the reconciled reviewer capacity.
- [ ] **ECONP-04**: The reader sees sensitivity to adoption, error rates, inference cost and review overhead.
- [ ] **ECONP-05**: The calculator offers scenarios A/B/C, keeps its existing inputs, share link and "show the maths", and labels corrected (no mislabelled "fully loaded").
- [ ] **ECONP-06**: The reader sees the workflow inventory with all eight brief fields and a prioritisation by value, feasibility, repeatability, risk and measurable autonomy.

### Outcomes (OUT)

- [ ] **OUT-01**: The reader sees the causal chain from autonomy to outcomes with a visible marker where evidence stops and hypothesis begins.
- [ ] **OUT-02**: The reader sees a three-tier scorecard (business outcomes, operating economics, autonomy and quality) that separates real productivity from activity.
- [ ] **OUT-03**: The page explains diminishing returns and the defensible outcome mechanisms (speed, learning velocity, reallocation, market coverage) with sources.

### Expansion (EXP)

- [ ] **EXP-01**: The reader sees how the same infrastructure supports adjacent workflows (campaign execution, underperformance response, market expansion, conversion, experimentation, discoverability, insight to action).
- [ ] **EXP-02**: The reader sees which capabilities are reusable and which need domain-specific implementation.

### Roadmap (ROAD)

- [ ] **ROAD-01**: The reader sees a 12-week pilot: target workflow and why, software, integrations, baseline measurement, feasible autonomy, target improvement and acceptance criteria.
- [ ] **ROAD-02**: The reader sees the next two quarters: bottlenecks removed, interventions reduced, adjacent operations added, expected measurable improvements.
- [ ] **ROAD-03**: The reader sees a 12-month portfolio whose contributions combine without double counting, clearly separated from proven pilot results.
- [ ] **ROAD-04**: The reader sees organisational enablement: training, trust, permissions, accountability and role redesign.

### Risks (RISK)

- [ ] **RISK-01**: The reader sees the risks and assumptions that could prevent the target (irreversible publication, contested ground truth, compounding error, judge drift, inference cost, Goodhart, labour relations, model regressions), each with a mitigation or test.

### Comparison (COMP)

- [ ] **COMP-01**: The comparison section adds a dated sub-table of what major marketing suites and channels already automate, with sources, "announced" wording where availability is unconfirmed, and new register rows.

### Quality gates (QA)

- [ ] **QA-05**: `node --test`, crosscheck, smoke, a11y and print gates pass, and the page is checked at desktop and 320px, before each publish.
- [ ] **QA-06**: W3C Nu validation reports 0 errors on the final page.
- [ ] **QA-07**: The final page is published to GitHub Pages and a completion summary lists changes, material assumptions, what remains unverified and checks run.

## Future Requirements

- Full editable inputs for every workflow (v2.0 edits only the most material per-workflow inputs).
- Observed pilot data replacing illustrative and hypothesis values.
- Browser gates in CI (carried from v1 debt) if not done in Phase 5.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Building the actual agents or pipelines | The page describes the system; it does not implement it |
| A single "total savings" number | Hides the capacity/efficiency/effectiveness split |
| Revenue computed from output volume | No evidence; capacity ≠ revenue |
| Named vendors outside the comparison section and register | Neutrality constraint |
| Re-basing the illustrative company | Decision 1: baseline slack shown and reconciled instead |
| Backend, accounts or persistence | Static page |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STRUCT-01 | Phase 5 | Complete |
| STRUCT-02 | Phase 5 | Complete |
| STRUCT-03 | Phase 5 | Complete |
| STRUCT-04 | Phase 5 | Complete |
| STRUCT-05 | Phase 5 | Complete |
| STRUCT-06 | Phase 5 | Complete |
| EVID-01 | Phase 5 | Complete |
| EVID-02 | Phase 5 | Complete |
| EVID-03 | Phase 5 | Complete |
| ECON-01 | Phase 6 | Complete |
| ECON-02 | Phase 6 | Complete |
| ECON-03 | Phase 6 | Complete |
| ECON-04 | Phase 6 | Complete |
| ECON-05 | Phase 6 | Complete |
| ECON-06 | Phase 6 | Complete |
| ECON-07 | Phase 6 | Complete |
| ECON-08 | Phase 6 | Complete |
| ECON-09 | Phase 6 | Complete |
| ECON-10 | Phase 6 | Complete |
| ECON-11 | Phase 6 | Complete |
| ECON-12 | Phase 6 | Complete |
| THESIS-01 | Phase 7 | Complete |
| THESIS-02 | Phase 7 | Complete |
| THESIS-03 | Phase 7 | Complete |
| THESIS-04 | Phase 7 | Complete |
| THESIS-05 | Phase 7 | Pending |
| THESIS-06 | Phase 7 | Complete |
| INTERCOM-01 | Phase 7 | Pending |
| INTERCOM-02 | Phase 7 | Pending |
| INTERCOM-03 | Phase 7 | Pending |
| INTERCOM-04 | Phase 7 | Pending |
| BUILD-01 | Phase 7 | Pending |
| BUILD-02 | Phase 7 | Pending |
| BUILD-03 | Phase 7 | Pending |
| BUILD-04 | Phase 7 | Pending |
| BUILD-05 | Phase 7 | Pending |
| FLOW-01 | Phase 7 | Complete |
| FLOW-02 | Phase 7 | Complete |
| FLOW-03 | Phase 7 | Complete |
| FLOW-04 | Phase 7 | Complete |
| FLOW-05 | Phase 7 | Complete |
| STRUCT-07 | Phase 7 | Pending |
| ECONP-01 | Phase 7 | Pending |
| ECONP-02 | Phase 7 | Pending |
| ECONP-03 | Phase 7 | Pending |
| ECONP-04 | Phase 7 | Pending |
| ECONP-05 | Phase 7 | Pending |
| ECONP-06 | Phase 7 | Pending |
| OUT-01 | Phase 7 | Pending |
| OUT-02 | Phase 7 | Pending |
| OUT-03 | Phase 7 | Pending |
| EXP-01 | Phase 7 | Pending |
| EXP-02 | Phase 7 | Pending |
| ROAD-01 | Phase 7 | Pending |
| ROAD-02 | Phase 7 | Pending |
| ROAD-03 | Phase 7 | Pending |
| ROAD-04 | Phase 7 | Pending |
| RISK-01 | Phase 7 | Pending |
| COMP-01 | Phase 7 | Pending |
| QA-05 | Phase 7 | Pending |
| QA-06 | Phase 7 | Pending |
| QA-07 | Phase 7 | Pending |

**Coverage:**
- v2.0 requirements: 62 total
- Mapped to phases: 62
- Unmapped: 0

Per phase: 5 → 9, 6 → 12, 7 → 14, 8 → 6, 9 → 10, 10 → 11.

---
*Requirements defined: 2026-10-25*
*Last updated: 2026-10-25 after v2.0 roadmap creation (traceability filled)*
