---
phase: 06-economics-engine
verified: 2026-10-25T00:00:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
---

# Phase 6: Economics Engine Verification Report

**Phase Goal:** A tested model produces every labour and financial figure from data.js/calc.js, with conservation and no-double-counting proven by tests.
**Mode:** Lean verification. Files were read and the four named test files were run. scripts/gates.sh was not run, as instructed.

## Observable Truths

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|---|---|---|
| 1 | W1-W10 current and agent-enabled states with all per-workflow fields and the primary metric | VERIFIED | `site/js/workflows.js` exports `WORKFLOW_IDS` (W1-W10), `currentState`, `workflowState` and `economics`. Covered by `test/workflows.test.js` and `test/economics.test.js`. |
| 2 | INV-1 to INV-11 enforced by tests | VERIFIED | INV-1 to INV-11 are all referenced in `test/*.js`. `checkLedger` and `sumLedger` are exported, and a ledger test checks `counted_in` and `scope`. |
| 3 | Scenarios A/B/C, investment, scale-vs-programme, sensitivity and max multipliers | VERIFIED | `economics()` and `sensitivity()` exist. Sensitivity goldens, ranking and non-mutation tests pass. |
| 4 | Concept split into internal hours and agency fee; rework_rate cannot return NaN | VERIFIED | `test/calc.test.js` covers rework_rate with differing baseline and scaled values and asserts every number is finite. calc.test.js, data.test.js and crosscheck.test.js pass (113/113). |
| 5 | No hand-typed model numbers (crosscheck); existing gates green | VERIFIED (lean) | `test/data.test.js` has a "no hand-typed model numbers" test and it passes. The browser and other gates were not re-run here; the caller reports gates.sh was green at the end of 06-05. |

**Score:** 5/5

## Test Run

- `node --test test/workflows.test.js test/economics.test.js test/engine-data.test.js test/evidence.test.js`: 83 pass, 0 fail.
- Extra spot-check of `test/data.test.js`, `test/crosscheck.test.js` and `test/calc.test.js`: 113 pass, 0 fail.

## Requirements Coverage

ECON-01 to ECON-12 are each claimed by at least one plan's `requirements` field (06-01: 04, 05, 12; 06-02: 01, 02, 03, 04, 07 to 11; 06-03: 03, 05, 06, 12; 06-04: 01, 08, 09, 10, 12; 06-05: 01, 03, 06 to 12). All are marked Complete in REQUIREMENTS.md. There are no orphaned requirements.

## Anti-Patterns

No TBD, FIXME or XXX markers in `site/js/workflows.js`, `calc.js` or `data.js`.

## Caveats

- `site/index.html` was being edited concurrently, so no page-level figure checks were done beyond the crosscheck tests.
- The browser, a11y and print gates were not run.

## Human Verification Required

None.
