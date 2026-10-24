---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 04-07-PLAN.md
last_updated: "2026-10-24T20:57:48.370Z"
last_activity: 2026-10-24 -- Phase 4 execution started
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 43
  completed_plans: 41
  percent: 80
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-10-24)

**Core value:** A CMO and their CFO finish the page convinced, through transparent and graded reasoning plus their own numbers, that a 2x marketing programme is credible, governable, and improves business outcomes rather than just adding volume.
**Current focus:** Phase 4 — Adoption, Risk, Evidence & Publish Slice

## Current Position

Phase: 4 (Adoption, Risk, Evidence & Publish Slice) — EXECUTING
Plan: 1 of 9
Status: Executing Phase 4
Last activity: 2026-10-24 -- Phase 4 execution started

Progress: [██████████] 95%

## Performance Metrics

**Velocity:**

- Total plans completed: 34
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 7 | - | - |
| Phase 2 P01 | 25min | 3 tasks | 7 files |
| Phase 2 P02 | 20 min | 3 tasks | 5 files |
| Phase 2 P03 | 15 min | 3 tasks | 7 files |
| Phase 2 P04 | 25min | 2 tasks | 4 files |
| Phase 2 P05 | 30min | 3 tasks | 7 files |
| Phase 2 P06 | 25min | 3 tasks | 5 files |
| 2 | 8 | - | - |
| Phase 3 P01 | 25min | 2 tasks | 6 files |
| Phase 3 P03 | 25min | 2 tasks | 4 files |
| Phase 3 P05 | 40min | 2 tasks | 10 files |
| Phase 3 P06 | 55min | 3 tasks | 9 files |
| Phase 3 P07 | 40min | 2 tasks | 10 files |
| Phase 3 P08 | 55min | 2 tasks | 13 files |
| Phase 3 P09 | 40min | 2 tasks | 7 files |
| 3 | 12 | - | - |
| Phase 4 P01 | 25min | 3 tasks | 14 files |
| Phase 4 P03 | 25min | 2 tasks | 4 files |
| Phase 4 P04 | 30min | 2 tasks | 4 files |
| Phase 4 P05 | 40min | 2 tasks | 8 files |
| Phase 4 P07 | 40min | 2 tasks | 7 files |
| Phase 03.1 P01 | 20min | 2 tasks | 2 files |
| Phase 03.1 P04 | 40min | 3 tasks | 6 files |
| 03.1 | 7 | - | - |

## Accumulated Context

### Roadmap Evolution

- Phase 03.1 inserted after Phase 3: Headline metric reframe: user challenged assets-per-marketing-head as a CMO metric (no benchmark, mostly crops/locales); reframe to campaigns and market launches in market per quarter + brief-to-live time + cost per approved asset; Phase 4 plans 04-08/04-09 held until 03.1 completes (URGENT)

| Phase 1 P01 | 15min | 3 tasks | 11 files |
| Phase 1 P05 | session | 4 tasks | 6 files |
| Phase 01 P06 | 20m | 2 tasks | 4 files |
| Phase 1 P07 | 20min | 3 tasks | 2 files |

### Decisions

- Roadmap: 4 vertical-slice phases (coarse), each ending in a deployed page increment on GitHub Pages
- Roadmap: CRED-02 (grade chip linked to register on every quantitative claim) is established in Phase 1 and must hold in every later phase; QA-04 in Phase 4 enforces it
- Roadmap: CALC-08 (tested `calc.js`) lands in Phase 1, the calculator UI and remaining CALC requirements in Phase 3
- Research: headline metric is approved-live variants per marketing head per quarter; tier weighting is a sensitivity only
- Research: grade key is Benchmark / Modelled / Speculative plus a separate vendor-claimed/company-reported flag
- [Phase 1]: Register value cells use data-fig plus self-linking chip; include-hidden-files ships .nojekyll
- [Phase 1]: 01-05: Gartner 2026 graded Benchmark; s02 prose numeral-free via data-fig spans
- [Phase 01]: 01-06: Figure bar widths use claim values (rounded output 83/167), tested within 0.5
- [Phase 1]: 01-07: legend heading is h2.legend-title for W3C heading-level rule; Phase 1 live at lyonsv.github.io/cmo-2x-teardown
- [Phase ?]: 02-01: chip adjacency replaced by governing-chip rule; register chips unlinked; numeric gate pre-strips T0-T3, section links, time
- [Quick 261024-s14]: COI note and Getty v Stability content removed at author's request; CRED-04 Out of Scope
- [Phase 2]: Diagram nodes 240 wide (x=30), height lines*16+8; step lists and captions carry no digits
- [Phase 2]: Matrix assumptions use kind 'matrix' and claims use a matrix field so compute-based tests and defaults ignore them
- [Phase 2]: NYU/Emory CTR lift and disclosure change graded Benchmark (user confirmed on SSRN 2026-10-24)
- [Phase 2]: Reference datum 19.2%/28.4% graded Modelled + company-reported; 60% auto-approval framed as a Modelled target (71% of 85% eligible)
- [Phase 2]: Capacity claims are literal values with override markers, recomputed in test from a test-local scenario table
- [Phase 3]: Post-editing range 9.26-59.74% graded Modelled with scope caveats; vendor case anonymised and flagged vendor-claimed
- [Phase 3]: 03-06: #s11? hash counts as restored even if all values invalid; summary debounced 400ms, table 250ms
- [Phase 4]: s11 shows one grade chip per group with a shared-grade guard test; s12 matrix dates collapse into the caption
- [Phase 03.1]: calc.test.js inlines page defaults rather than importing data.js (red until 03.1-05)
- [Phase 03.1]: [03.1-04] Hours maths step labelled internal throughput, not the claim; smoke route cases read radio checked over CDP

### Pending Todos

- Phase 3 UI review (17/24, advisory): 'Show the maths' disclosure marker; scenario radios 24px; table number/label size mismatch (12px mono vs 17px serif, 'Not applicable' cells); Hold sentence 'only −$53,579' wording; 49 identical Modelled chips in s11 (density rule); 'over capacity at 186% of capacity'; matrix cell cite density; s10/s12 word budgets; hint units/separators; Change column sign convention; re-check invalid-field→hashchange path. See 03-UI-REVIEW.md. Fold into Phase 4 Plan 1.
- Phase 3 HUMAN-UAT deferred (user away): vendor fairness/tone, legal wording, s09/s10 tone, hands-on calculator. See 03-HUMAN-UAT.md.

- Phase 2 HUMAN-UAT deferred (user away): visual/print check, author check of stock-licence indemnity wording. See 02-HUMAN-UAT.md.

### Blockers/Concerns

- No independent benchmarks for cost per asset, approval times, incident rates, auto-approval share; these must be Modelled, reader-overridable defaults
- Phase 2: review live Intercom reference sections 05-14 before locking tiers/harness/Backlog 0
- Phase 3: vendor claims need primary-page re-verification
- Phase 4: legal review dropped by the author 2026-10-24 (counsel review not performed; page flag removed). EU AI Act Art. 50 content was re-verified in 04-05 and stays on the page as content.

## Session Continuity

Last session: 2026-10-24T20:32:08.724Z
Stopped at: Completed 04-07-PLAN.md
Resume file: None

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 261024-s14 | Remove COI disclosure and Getty-specific content (author request) | 2026-10-24 | af3922e | [261024-s14](./quick/261024-s14-remove-conflict-of-interest-disclosure-a/) |
