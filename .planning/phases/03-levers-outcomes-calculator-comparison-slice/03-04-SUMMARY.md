---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 04
subsystem: ui
tags: [s10, outcome-case, cta, tdd]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: s09 levers and s01 six-lever table (03-01 to 03-03)
provides:
  - s10 outcome scorecard (six levers, no digits, one grade chip per row)
  - s10 proof block (four ordered methods) and a "We did not find" callout
  - .btn and .btn-primary styles; "Run your own numbers" CTA at the end of s02 and s10
affects: [03-05]
key-files:
  modified: [site/index.html, site/assets/style.css, test/page.test.js, test/style.test.js]
key-decisions:
  - "Scorecard chips mirror the s01 grades (four Modelled, two Speculative), tested row by row"
requirements-completed: [OUTC-01, OUTC-02]
duration: 15min
completed: 2026-10-24
---

# Phase 3 Plan 4: Outcome case and CTA Summary

s10 now argues the outcome case with no invented lift figures: a six-row scorecard pairing each lever's output with four outcome families, a four-step proof method (holdouts, pre-registered metrics, multiple-comparison correction, MMM calibrated by incrementality tests), a "We did not find" callout, the falsifier pointer and a primary CTA to #s11 (also at the end of s02).

## Tasks

Both tasks were committed together as the plan's single commit instruction specifies: 61e70ec (`feat(03-04): outcome case and run-your-numbers CTA`).

s10 prose is 447 words (budget 400-600). Tests: 194 pass, 0 fail.

## Deviations from Plan

**1. [Rule 1 - Test] Falsifier uniqueness test:** the s01 test counted the substring "the 2x claim is false for that org", which the locked s10 pointer sentence ("...for that organisation.") also contains. It now matches the full "org." ending.

**2.** `--ink-2` exists as a token, so no substitute was needed. Buttons are links, so the existing `a:focus-visible` outline applies.

## Known Stubs

None in s10. s11 to s14 remain skeletons by design (the CTA target #s11 is still a skeleton until a later plan).

## Threat Flags

None. T-03-11 mitigated (no digits in outcome cells, tested). T-03-12: in-page anchors only.

## Self-Check: PASSED

Commit 61e70ec exists; `node --test` passes.
