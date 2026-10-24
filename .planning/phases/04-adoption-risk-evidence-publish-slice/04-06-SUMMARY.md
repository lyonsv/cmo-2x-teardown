---
phase: 04-adoption-risk-evidence-publish-slice
plan: 06
subsystem: testing
tags: [crosscheck, ci, static-a11y, node-test]
requires:
  - phase: 04-adoption-risk-evidence-publish-slice
    provides: plan 05 evidence gaps list and legal flag
provides:
  - scripts/crosscheck.mjs run({ html, data }) with eight checks and a CLI
  - test/crosscheck.test.js CI gate plus mutation tests
  - test/a11y-static.test.js browser-free WCAG 2.2 AA checks (14 tests)
affects: [04-09]
key-files:
  created:
    - scripts/crosscheck.mjs
    - test/crosscheck.test.js
    - test/a11y-static.test.js
  modified: []
key-decisions:
  - "Register rows count as referenced only through href links, not data-fig refs, so the cross-check cannot be satisfied by the row's own figure"
  - "No page or CSS defects were found; all findings were pinned exceptions or test refinements"
requirements-completed: [QA-04]
duration: 25min
completed: 2026-10-24
---

# Phase 4 Plan 6: Cross-check and static accessibility gates Summary

A Node-built-ins cross-check now fails CI when a graded number loses its register row, a calculator default drifts from data.js, a source loses its publisher type, or an evidence gap is untraced, and 14 static WCAG tests gate every deploy.

## Tasks

| Task | Commits | Result |
|------|---------|--------|
| 1 RED | 26183a8 (test) | crosscheck.test.js written against a missing module |
| 1 GREEN | 2e83ab3 (feat) | crosscheck.mjs, all eight checks, report 324 figures, 166 chips, 67 cites, 112 register rows, 12 defaults |
| 2 | d8fd8ef (test) | a11y-static.test.js, 14 tests, passes on the existing page |

Full `node --test`: 343 pass, 0 fail. `node scripts/smoke.mjs`: all PASS.

## Pinned exceptions (each inspected)

JUSTIFIED_UNREFERENCED (crosscheck.mjs), eight rows with no `href="#id"` anywhere on the page:
- src-getty-v-stability-uk: law-firm commentary that was not read (403), kept in the register for transparency while the s13 status row cites the CMS source instead.
- asm-formats-per-locale, asm-concept-growth, asm-sampling-rate, asm-escalation-rate, asm-reviewer-rate, asm-ai-share-variant, asm-build-days: model assumptions shown only in the register because the calculator does not expose them.

GAP_TRACE: twelve gap leads mapped to assumptions (eight) or 'no assumption: external evidence' (four: analyst hours, DAM metadata, AEO outcomes, localisation cost per word). Assumption choices are a judgement and may be revised.

a11y-static.test.js:
- FIGURE_EXCEPTIONS: "Figure 8 Baseline against 2x for your numbers..." because the live chart redraws from the results table directly above it and the caption points to that table.
- SECTION_LABEL_EXCEPTIONS: `answer`, a single paragraph with no h2, named by aria-label="Summary".
- TABLE_EXCEPTIONS: empty.

## Test refinements (not page defects)

- Section label check accepts aria-label for the pinned `answer` section.
- Control labelling accepts a wrapping `<label>` for the three scenario radios (no id).
- Colour-token check applies only to colour properties, so spacing tokens like `--s-md` on `.gaps li` are not flagged.

## Deviations from Plan

None. No page or CSS fixes were required.

## Known Stubs

None.

## Self-Check: PASSED

Files exist, commits 2e83ab3 and d8fd8ef present, full test suite and smoke green.
