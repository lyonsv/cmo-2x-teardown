---
phase: 02-factory-spine-slice
plan: 01
subsystem: test-contract-and-carry-over
tags: [carry-over, ui-review, test-contract, chips, numeric-gate]
requires: [Phase 1 page, 01-UI-REVIEW.md]
provides:
  - Governing-chip rule and unlinked register chips in the test contract
  - Numeric gate pre-strips for T0-T3, in-page section links and ISO time elements
  - SKELETON_IDS list, VENDOR_RE and Intercom-once tests
  - Phase 1 UI-review fixes 1-6 on the page; s03 retitled "The factory model"
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07, 02-08]
tech-stack:
  added: []
  patterns: ["governing chip per paragraph/row", "unlinked span chips in s15 registers", "SKELETON_IDS shrinks as sections are filled"]
key-files:
  created: []
  modified:
    - test/page.test.js
    - test/figure.test.js
    - test/style.test.js
    - test/data.test.js
    - site/index.html
    - site/assets/style.css
    - site/js/data.js
key-decisions:
  - "Chip adjacency test replaced by the governing-chip rule; display, grade and ref are still checked for every data-fig (WR-07 count kept)"
  - "ALLOWED_NUMERIC_TOKENS unchanged; only narrow pre-strips added"
  - "Register rows carry one unlinked span chip; lever Value is short, Basis keeps the sentence"
requirements-completed: [CRED-02, GEN-05, SPINE-03]
duration: ~25 min
completed: 2026-10-24
---

# Phase 2 Plan 01: Carry-over fixes and test contract Summary

The page now has about 82 chips instead of roughly 150 (44 before s15), the test contract is ready for tier names, section cross-links and dates, and the Phase 1 UI-review fixes are applied, with no number or locked copy changed beyond those listed.

## Commits

- d3bd0ff test(02-01): evolve chip, register, gate and style contracts (RED)
- e9b81f5 fix(02-01): apply chip density rule, register chips and copy nits (GREEN)
- 9268278 style(02-01): weights, labels, row headers and Figure 1 phone legibility (GREEN)

## What changed

- Tests: governing-chip test (prose, table row, register row units; caption figures must be governed by a body row), unlinked-chip guard, register row header and Value-cell checks, lever Value differs from Basis, SKELETON_IDS, s12 stub, copy nits, metric trio, VENDOR_RE for s03-s08, Intercom at most once outside s12/s15, time-element date test, CSS tests (600 weight, Label style, row headers, 800px Figure 1, font scale).
- HTML: duplicate chips removed, Figure 1 table gets a Grade column and one chip per row, storage legend swatch replaced by "too small to draw; see table", scroll note in the caption, s03 title, s12 stub, `has flatlined`, s02 h3, metric trio labels without `<br>`, register chips unlinked.
- data.js: `lever()` takes a separate `basis`; short Value displays.
- CSS: `strong, b` 600, `.metric-trio .lbl`, `tbody th[scope=row]` rules, Figure 1 `min-width: 800px` at 960px and below (560px rule removed).

## Verification

`node --test`: 100 pass, 0 fail. RED failed only on the intended tests. No inline `style=` attributes. Chip counts: 44 before s15, 82 in total.

## Deviations from Plan

**1. [Rule 1 - Bug] Over-broad register chip rewrite** (found in Task 2): my first pass also converted linked chips in the s01 lever table and the Figure 1 table into unlinked spans. The governing-chip and s01 tests caught it; links were restored (hrefs as specified in the plan) before the commit. No residual effect.

Otherwise none: the plan was executed as written.

## Known Stubs

None added. The skeleton sections s03-s14 remain "Coming in a later update." by design, resolved by plans 02-02 to 02-06 and later phases.

## Threat Flags

None.

## Self-Check: PASSED

Commits d3bd0ff, e9b81f5 and 9268278 exist; all modified files present; full test suite green.
