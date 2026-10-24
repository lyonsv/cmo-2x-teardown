---
phase: 04-adoption-risk-evidence-publish-slice
plan: 01
subsystem: ui
tags: [ui-review-carryover, chip-density, calculator, a11y]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: s11 calculator, s12 matrix, 03-UI-REVIEW fixes list
provides:
  - Phase 3 UI-review fixes 1-8 closed and pinned by tests
  - s11 group grade rule with a shared-grade guard test
  - s12 matrix without per-cell dates
  - smoke case o (invalid field then hashchange)
affects: [04-02, 04-03, 04-04]
tech-stack:
  added: []
  patterns: ["group grade note (one chip per group, register links for members)", "ptschg1 signed points format"]
key-files:
  created: []
  modified:
    - site/assets/style.css
    - site/index.html
    - site/js/format.js
    - site/js/model.js
    - site/js/fields.js
    - site/js/ui.js
    - test/style.test.js
    - test/calc-page.test.js
    - test/page.test.js
    - test/data.test.js
    - test/model.test.js
    - test/compare.test.js
    - scripts/smoke.mjs
    - .planning/phases/04-adoption-risk-evidence-publish-slice/04-UI-SPEC.md
key-decisions:
  - "s11 shows one grade chip per group (4 fieldsets, 3 tables) with plain register links for members; a test fails if members stop sharing one grade"
  - "s12 matrix cells show the cite only; the caption carries the single check date; a test requires per-cell dates again if vendor access dates differ"
  - "budget-share-delta claim keeps pts1: it sits in prose, not a Change column"
requirements-completed: []
duration: 25min
completed: 2026-10-24
---

# Phase 4 Plan 1: Phase 3 UI-review carry-over and s11 chip density Summary

Closed the eight Phase 3 UI-review fixes plus the signed Change column, and replaced 49 identical s11 chips with a tested group grade rule (24 chips remain).

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1. Visual, copy and format fixes | d6aaaa9 | Fixes 1, 2, 3, 4, 6, 8 and signed points change |
| 2. s11 group grade rule and s12 cite density | 2b13b13 | Fixes 5 and 7, UI-SPEC amendment |
| 3. Hashchange smoke case o | ea2a6c0 | Fix for the hashchange re-check (no ui.js change needed) |

## What changed

- Show the maths has the native disclosure marker (`display: list-item`, 48px target via padding). Scenario radios render at 24 x 24 px.
- `td.num` is 17px mono (16px under 720px); `td.na` is the same font in muted ink and carries the "Not applicable" cells, including after live updates in ui.js.
- New `ptschg1` format: Change column for budget share and utilisation reads "+0.9 points" / "+6.7 points" with a true minus for negatives.
- Hold sentence: "Hold's change in annual production cost is -$53,579 (a saving), because ..." with the sign word chosen from the presenter value in the test. Over-capacity summary: "with reviewers over capacity, at 186%." Hints: "Default $0.80." and "Default $1,200." through a new optional `hintFormat` on FIELDS.
- s11 group rule: four fieldset notes, three table notes (`p.table-note.grade-note`), no Grade column on the three s11 tables, hints end with a register link. `writeSensitivity` no longer touches a chip. `assertGroupRule` in calc-page.test.js fails with "group members no longer share one grade: restore per-member chips".
- Numeric gate exemption limited to register-id links whose text equals the href and names a real data.js key, plus a test that every such link names a real row.
- s12 matrix: cite-date spans removed from cells; caption adds "Absences were checked on 2026-10-24." Vendor panel `dd` dates unchanged.

## Measurements

- s11 chips: 49 before, 24 after (4 fieldset notes, 3 table notes, Headcount change-cost line, 8 maths, 7 believe, Hold sentence); hard cap 25 not raised.
- Prose budget counts (the test's method, tables and SVG excluded): s10 = 447 (budget 400-600), s12 = 741 (budget 700-900). No exception needed. The review's higher counts included the matrix.
- Tests: `node --test` 298 pass, 0 fail. Smoke: 15 cases, all PASS including case o.

## Smoke case o

Types 0 into campaigns (aria-invalid true), then sets `location.hash = '#s11?reviewers=4'`. Asserts: status is not "not available", cost per asset and utilisation equal the model values for reviewers=4, reviewers input is 4, campaigns input is back to the default 40 (hash restore resets unlisted fields), and no field is aria-invalid. It passed on first run, so ui.js needed no fix. The transient in the UI review was not reproduced.

## CONTEXT deviation (orchestrator-authorised)

CONTEXT Delivery says the chip density rule stays strict. The s11 group grade rule changes where chips are placed in s11: one per group instead of one per member. It was authorised by the orchestrator's instruction to resolve the s11 chip-density conflict deliberately. It keeps every number graded and traceable (plain register link per member, ref-set equality test) and adds the shared-grade guard, so it is tighter in what it proves, not looser. Measured count 24 against expected about 24 and the cap of 25. Recorded in 04-UI-SPEC.md under "Chip density amendment (Phase 4 Plan 1)"; s13 and s14 keep the per-row Grade column.

## Deviations from Plan

- **[Process] Tests written alongside code rather than as a separate failing commit.** TDD red state was confirmed on the s11 and matrix changes (five tests failed after the HTML edit and before the test rewrite) but not committed separately. Plan type is execute, not tdd.
- **[Rule 3 - Blocking] Unused import** removed the now unused `CHIP` import after the chip lines were deleted.
- Page Hold sentence uses a raw apostrophe ("Hold's"), consistent with the existing fixed-note text.

## Known Stubs

None.

## Threat Flags

None. No inline style or script added; hygiene tests unchanged and green.

## Self-Check: PASSED

Commits d6aaaa9, 2b13b13, ea2a6c0 exist; modified files present; `node --test` and `node scripts/smoke.mjs` green.
