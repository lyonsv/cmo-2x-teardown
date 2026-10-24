---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 05
subsystem: calculator
tags: [calculator, pure-modules, s11, tdd]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: s10 outcome case and CTA to #s11 (03-04)
provides:
  - format.js (formatValue moved, plus days1 and pctchg1), fields.js (FIELDS, SCENARIOS, COMPUTE_FIELD_TO_KEY), model.js (defaultValues, toCompute, run, OUTPUT_DEPS, weakestGrade, RESULT_ROWS, present)
  - data.js modelContext() and calc-{row}-{base|scaled|change} claims generated from present(defaultValues)
  - s11 static default scenario: nine-row results table with weakest-grade chips, break-even and capacity floor rows
affects: [03-06, 03-07, 03-08]
key-files:
  created: [site/js/format.js, site/js/fields.js, site/js/model.js, test/model.test.js, test/calc-page.test.js]
  modified: [site/js/data.js, site/index.html, site/assets/style.css, test/data.test.js, test/page.test.js]
key-decisions:
  - "present() omits value keys for text-only cells and omits error.key for overflow errors, so the whole presenter output is free of the strings null and undefined (fuzz-tested)"
  - "Locales folded into variants per concept as 8 formats x locales; asm-locales and asm-formats-per-locale are Modelled kind 'calc' assumptions"
requirements-completed: [CALC-03]
duration: 40min
completed: 2026-10-24
---

# Phase 3 Plan 5: Calculator core and static s11 Summary

A DOM-free fields -> model -> presenter spine (model.js imports only calc.js, fields.js and format.js) and a no-JS s11 whose nine-row results table is generated from the same presenter and drift-tested: cost per approved-live asset $64.71 to $41.18 (change −36%), break-even auto-approval 41%, capacity floor 29%, every row graded by the weakest grade among its inputs.

## Tasks

1. Task 1, commit 4adefd7: format.js, fields.js, model.js, data.js assumptions, modelContext() and generated calc claims, register rows for the two new assumptions, tests (identity, monotonicity, CFO claim, error mapping, weakestGrade with injected Speculative input, over-capacity, zero-baseline, no-NaN fuzz over 200 random sets plus zero/huge/NaN cases, import-specifier purity).
2. Task 2, commit 30992b4: s11 static structure, `id="assumptions-register"`, calc CSS, calc-page tests, SKELETON_IDS reduced to s12 to s14.

Full suite: 222 tests, 0 failing. `<script` count in index.html is still 0.

## Deviations from Plan

**1. [Rule 1 - Test] Fraction-bound heuristic:** test/data.test.js "percentage claims store fractions" asserted |value| <= 2 for any claim displaying a percent. The generated `calc-ai_spend-change` is legitimately +786% (8.9x). Calc claims are exempted from that bound; they are re-derived from present() in their own test.

**2. [Plan wording] Register rows added in Task 1:** the asm-locales and asm-formats-per-locale rows were added in Task 1, not Task 2, because the existing register test fails as soon as data.js gains an assumption.

**3. [Contract detail] present() shape:** to satisfy the "no null/undefined in the presenter JSON" fuzz rule, text-only cells (Not applicable, not needed, unbounded) have no `value` key and overflow errors have no `key` key. run() still returns `key: null`. Over-capacity text uses utilisation >= 1 (matching calc's review_capacity_exceeded and the null cycle time), and a cycle-time change with either side at capacity reads "n/a: over capacity".

**UI-SPEC delta:** the results table is not inside `<output>`; the summary output is the only result region (output allows phrasing content only).

## Known Stubs

None in s11. The summary `<output>` text "The table below shows the page defaults." is static until ui.js (03-06) updates it. s12 to s14 remain skeletons by design.

## Threat Flags

None. T-03-13 mitigated (every static number is a generated claim re-checked against present(defaults)). T-03-14 mitigated (fuzz test). T-03-15 mitigated (weakestGrade tested with an injected Speculative input; row chip equals row grade and ref).

## Self-Check: PASSED

Commits 4adefd7 and 30992b4 exist; site/js/format.js, fields.js, model.js, test/model.test.js and test/calc-page.test.js exist; `node --test` passes.
