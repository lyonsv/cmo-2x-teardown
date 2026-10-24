---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 10
subsystem: comparison
tags: [s12, vendor-panels, build-vs-buy, vendor-claims, tdd]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: vendor sources, s12 matrix (03-09)
provides:
  - Vendor-published outcomes table (five claims, Modelled, vendor-claimed)
  - Alphabetical AirOps, Gradial, Profound panels
  - Build, buy and lock-in block and the vendor-claims callout
affects: [03-11]
key-files:
  modified: [site/js/data.js, site/index.html, site/assets/style.css, test/compare.test.js, test/page.test.js]
key-decisions:
  - "Only outcome figures whose phrases were re-verified in 03-09's ledger were used"
  - "dd added to the prose-budget helpers; s12 budget 700-900 added (final count 737)"
requirements-completed: [COMP-02, COMP-03, COMP-04]
duration: 25min
completed: 2026-10-24
---

# Phase 3 Plan 10: Vendor outcomes, panels and build/buy Summary

s12 is complete: a flagged, unaveraged vendor-outcomes table, three vendor panels with dated "Not publicly documented" absences, a build/buy and lock-in block ending "Own the eval set and the brand rules; rent the rest.", and the "How we treated vendor claims" callout.

## Tasks

Both tasks were committed together as d68100e (the HTML, data and tests are interdependent, so a clean split was not practical).

## Deviations from Plan

1. **[Scope] Fewer outcome rows than the plan examples.** The 03-09 ledger re-verified only: Webflow "5x" and "nearly 10%", Chime "3x" and "89%", Gradial T-Mobile "1,000 to 1,200" hours. Gradial "90% faster"/"10x" and all Profound figures (50% Plaid etc.) were not re-verified, so they are omitted. The Webflow from-figure ("2%") was also not verified and is omitted. The T-Mobile row states the verified figure only and says the comparison figure was not re-verified.
2. **[UI-SPEC delta, as planned]** Outcome numbers live in their own table with a Modelled chip linking to the source, not in chip-less matrix cells.
3. **[Callout wording]** The UI-SPEC callout's competitor-review sentence is replaced with "Reviews written by competitors were not used." (none re-fetched). Addresses the 03-09 note that the callout was missing.
4. **[Scope] Added two short connecting paragraphs** (panel intro, pilot pointer) to reach the 700-word floor; prose count is 737 (dd counted).
5. The "profound-home" cite from 03-09 remains in the matrix only.

## Verification

`node --test`: 287 pass, 0 fail. `node scripts/smoke.mjs` exit 0. No new fetches.

## Known Stubs

None.

## Threat Flags

None. T-03-33 and T-03-34 mitigated by tests (flag after every figure, Modelled grade, caption "not verified", no averaging wording, dated absence phrasing only).

## Self-Check: PASSED

Commit d68100e exists; test/compare.test.js extended.
