---
phase: 01-foundation-thesis-slice
plan: 05
subsystem: section-02
tags: [section-02, cfo, cost-model, gartner, checkpoint]
requires: ["01-02", "01-04"]
provides:
  - "compute(): full model with review capacity, six-component cost, AI spend, cycle time, break-even auto-approval, budget share"
  - "data.js: cost assumptions (Modelled), Gartner 2026 source and claim, s02 derived claims"
  - "Section 02 prose and answer paragraph cost clause"
key-files:
  modified:
    - site/js/calc.js
    - site/js/data.js
    - site/index.html
    - test/calc.test.js
    - test/data.test.js
    - test/page.test.js
decisions:
  - "Total-cost claim uses 0 decimals (2588589 / 3294371); usdm2 format divides by 1e6"
  - "s02 prose avoids numerals because of the numeric gate; figures come from data-fig spans"
  - "Gartner 2026 graded Benchmark per 01-02-SUMMARY"
  - "Identity test copies every {baseline, scaled} assumption and walks nested cost leaves, since cost assumptions are two-sided"
requirements-completed: [CFO-01, CFO-02, CFO-03, CALC-08, CRED-02, CRED-06]
completed: 2026-10-24
---

# Phase 1 Plan 05: Section 02 and Cost Model Summary

Section 02 shows why 2x is affordable at a flat budget. Fully loaded cost per approved-live asset falls from $64.71 to $41.18 (-36%), built from six components. Total production cost rises from $2.59M to $3.29M, which is 3.3% to 4.2% of the marketing budget. AI spend rises from $38,421 to $340,421 (8.9x), framed as a floor, not a KPI. Break-even auto-approval at flat review headcount is 40.9% (41%), against a modelled 60%.

## Commits
- 35d9b8a test(01-05): failing tests for cost model, Gartner 2026 grade, s02 copy (RED)
- 7dca9d9 feat(01-05): full cost model in compute() and s02 data entries (GREEN)
- 5ca1c85 test(01-05): identity test walks nested cost leaves
- 7f92f15 feat(01-05): s02 prose, answer cost clause, register rows (17 asm register rows, 1 source row)

## Prose review (checkpoint: human-verify)
User response: "approved". No copy or layout changes. The user accepted the s02 "figure below" forward reference; Figure 1 lands in 01-06.

## Deviations from Plan
**1. [Rule 1 - Bug] Identity test failed after cost assumptions became two-sided.**
- Commit 7dca9d9 was made while the 01-01 identity test was failing, because it did not copy nested cost leaves.
- Fixed in 5ca1c85: the test copies every {baseline, scaled} assumption and walks nested cost leaves.

## Known Stubs
None for this plan. The s02 "figure below" reference points to Figure 1, which is built in 01-06. s03-s14 remain skeletons by design.

## Self-Check: PASSED
Commits 35d9b8a, 7dca9d9, 5ca1c85, 7f92f15 exist in git log. Preview server stopped; port 8765 no longer responds.
