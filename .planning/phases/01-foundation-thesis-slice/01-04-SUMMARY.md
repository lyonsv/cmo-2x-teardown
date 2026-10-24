---
phase: 01-foundation-thesis-slice
plan: 04
subsystem: section-01
tags: [section-01, metric, six-levers, calc-output-model]
requires: ["01-03"]
provides:
  - "compute() output half: generated variants, tier-weighted sensitivity, tier and yield validation"
  - "data.js: formatValue, tier and approval-yield assumptions, six lever-evidence entries, s01 derived claims"
  - "Section 01: metric definition, metric trio, weighted sensitivity, six-lever table, two callouts"
key-files:
  modified:
    - site/js/calc.js
    - site/js/data.js
    - site/index.html
    - test/calc.test.js
    - test/data.test.js
    - test/page.test.js
decisions:
  - "Callouts (What 2x does not mean, Falsifier) moved from front matter into s01; the answer-first paragraph still states the falsifier in one sentence"
  - "Old 'multiplier 1 gives scenario equal baseline' test replaced by the identity test with scaled values copied from baseline, since default tier mix legitimately differs by side"
requirements-completed: [CRED-03, CRED-05, LEVER-06, CALC-08, CRED-06, CRED-02]
completed: 2026-10-24
---

# Phase 1 Plan 04: Section 01 and Output Model Summary

Section 01 now defines the headline metric (approved-and-live variants per marketing head per quarter, all FTE in the denominator), shows it with concepts and variants per concept (83 to 167, 1,000 to 1,189, 40 to 67), gives the tier-weighted view as a 1.6x sensitivity, and lists six graded levers. Every figure comes from the tested model.

## Commits
- test(01-04): failing tests (RED)
- feat(01-04): output model, tier validation, s01 data entries (GREEN for calc and data)
- feat(01-04): section 01 content, callouts, register rows (full suite 35 pass, 0 fail)

## Orchestrator note: callouts moved
The "What 2x does not mean" and "Falsifier" callouts were removed from the front matter (after the legend) and now sit only in s01. A test asserts each appears exactly once on the page. The answer-first paragraph keeps its one-sentence falsifier.

## Deviations from Plan
- Acceptance grep `grep -c 'href="#asm-lever-0'` is 18, not 6: each lever chip appears once in s01 and twice in its register row (value and grade columns, per existing register pattern). The s01 table has exactly 6 and `id="asm-lever-0` is 6. No code change needed.
- Existing 01-01 test "multiplier 1 gives scenario equal to baseline" removed (superseded by the identity test), see decisions.
- Expected derived values (1,000 / 1,189 / 40 / 67 / 1.6x) matched compute() exactly; no differences.

## Known Stubs
None for this plan. s02 and s03-s14 remain skeletons by design (01-05 onwards).

## Self-Check: PASSED
