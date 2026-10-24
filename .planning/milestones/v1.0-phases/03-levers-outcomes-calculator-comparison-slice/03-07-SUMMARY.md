---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 07
subsystem: calculator
tags: [calculator, scenarios, sensitivity, tdd, url-hash]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: model.js present(), state.js hash contract, ui.js live binding (03-05, 03-06)
provides:
  - scenarioOutcomes() and sensitivity() in model.js, pure and tested, surfaced through present().scenario and present().sensitivity
  - asm-loaded-fte-cost ($150,000) and asm-change-mgmt ($3,000 per affected FTE), Modelled, with register rows
  - Headcount scenario radios (Redeploy, Hold, Reduce) in the form, restored from and written to the hash
  - Scenario table and sensitivity table in s11, static defaults and live
affects: [03-08]
key-files:
  modified: [site/js/model.js, site/js/data.js, site/js/ui.js, site/index.html, site/assets/style.css, scripts/smoke.mjs, test/model.test.js, test/data.test.js, test/calc-page.test.js, test/page.test.js]
key-decisions:
  - "Hold is compute() at multiplier 1 with the scaled assumptions; its saving is about $53,579 a year and the copy says it is small"
  - "Reduce cuts reviewer headcount only; with too few reviewers the people cost change is 0, not a positive cost"
  - "Capped means clamped by a range limit (100%, the T0+T1 cap, or a minimum of 1); rounding a whole-number count is not capped"
  - "Sensitivity cells are relative changes shown with pctchg1; a zero base value or failed run gives n/a"
requirements-completed: [CALC-04, CALC-05]
duration: 40min
completed: 2026-10-24
---

# Phase 3 Plan 7: Headcount scenarios and sensitivity Summary

Reader can switch Redeploy, Hold and Reduce and see a six-row headcount table (reviewer FTE, people cost, production cost, change cost, first-year net), and sees which five inputs move cost per approved-live asset most when each is moved 20% down and up, ranked live from their own numbers and restored from a shared link.

## Tasks

1. Task 1, commit 12526a7: `scenarioOutcomes`, `sensitivity`, presenter extensions, two assumptions and register rows, golden tests (redeploy net $1,101,782; hold -$53,579 production and net $342,421; reduce people -$489,783 and net $611,999), a ranking test (locales, mconcept, auto2, minutes, yield; yield +20% capped) and a 200-case fuzz.
2. Task 2, commit 56ebdc6: scenario fieldset with radios and change-management line, scenario table, sensitivity table with a `capped` marker and footnote, label.radio CSS, ui.js live wiring (246 lines), generated `calc-scen-*` and `calc-sens-*` claims, smoke cases f and g.

## Verification

- `node --test`: 254 tests, 0 failing.
- `node scripts/smoke.mjs` (exit 0): PASS a, b, c, d, e, f (hold link shows "Headcount scenario: Hold", cell equals present(), radio checked, changing the radio writes `#s11?scenario=reduce`), g (first sensitivity row follows the live ranking for locales=8), h (typed zero), j.
- Both new tables sit between the results notes and `#calc-share-wrap`, outside every `.calc-live`.

## Deviations from Plan

**1. [Rule 3 - Blocking] Smoke case naming:** 03-06 already used case f for the typed-zero case. It is renamed h so f and g match this plan.

**2. [Rule 1 - Bug] Negative zero:** Reduce with too few reviewers produced -0 for the people cost change; fixed so it is 0 (found by the new test).

**3. [Plan detail] Smoke case f uses CDP,** not `--dump-dom`, because the checked radio is a property and does not serialise into the DOM dump; this also lets it test the change-to-hash path.

**4. [Test scope] Reviewer-only utilisation behaviour** is not asserted through `sensitivity()` because reviewers never reach the top five at defaults; reviewer FTE is not a cost dependency, which `OUTPUT_DEPS` tests already pin.

## Known Stubs

None.

## Threat Flags

None beyond the register. T-03-22 to T-03-25 mitigated: scenario hash restricted to SCENARIOS by parseHash, textContent only in ui.js (source-scan test green), Hold saving pinned by golden test with the offset copy, perturbations clamped and failed runs shown as n/a with a fuzz test.

## Self-Check: PASSED

Commits 12526a7 and 56ebdc6 exist. `node --test` and `node scripts/smoke.mjs` pass. No server or Chrome started by this plan is left running.
