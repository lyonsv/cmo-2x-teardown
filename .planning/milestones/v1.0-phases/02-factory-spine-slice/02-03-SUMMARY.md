---
phase: 02-factory-spine-slice
plan: 03
subsystem: s05-variant-matrix
tags: [s05, variant-matrix, calc, figure-4]
requires: [02-02]
provides:
  - variantMatrix(concepts, factors) pure function in site/js/calc.js
  - variantMatrixDefaults, asm-matrix-* assumptions, matrix-* claims, avg-campaign-variants in data.js
  - formatValue 'applies' format
  - s05 lead, Figure 4 (brief to approved asset), worked variant matrix table reaching 12,000
affects: [02-04, 03-calculator]
tech-stack:
  added: []
  patterns: ["matrix claims computed at module load from variantMatrix, re-checked against a test-local golden set"]
key-files:
  created: []
  modified: [site/js/calc.js, site/js/data.js, site/index.html, test/calc.test.js, test/data.test.js, test/page.test.js, test/diagram.test.js]
key-decisions:
  - "Matrix assumptions use kind 'matrix' so defaultInputs() and defaultAssumptions() ignore them"
  - "Matrix claims carry a matrix field instead of derived, so the compute() drift test skips them"
requirements-completed: [GEN-01, GEN-02, GEN-05]
duration: ~15 min
completed: 2026-10-24
---

# Phase 2 Plan 03: Variant matrix and Figure 4 Summary

s05 now opens with the locked "derive, do not generate" lead, shows Figure 4 (brief to approved asset, with an auto-approve or human-queue fork) and a static worked matrix that totals 12,000 approved-live variants, every number produced by a tested pure `variantMatrix()`.

## Commits

- a657b7a test(02-03): variantMatrix and s05 matrix contract (RED)
- e4a449e feat(02-03): variantMatrix and worked-campaign data
- 0907d5c feat(02-03): s05 derive lead, Figure 4 and the worked variant matrix

## Verification

`node --test`: 130 pass, 0 fail. RED failed only on the new tests. Golden rows 40, 160, 480, 1,920, 4,800, 12,000 match an independent enumerator in the tests. No `<script>` on the page; `class="later"` count is 9 (s06 to s14).

## Requirements

GEN-01 and GEN-02 delivered. GEN-05 complete with Figures 2, 3 and 4.

## Deviations from Plan

None. The plan was executed as written.

## Known Stubs

None added. s06 to s14 remain "Coming in a later update." skeletons by design; imagery sourcing and personalisation in s05 follow in 02-04.

## Threat Flags

None. Mitigations T-02-09 to T-02-11 are covered by validation tests, the golden cross-check and the flagship-vs-average sentence.

## Self-Check: PASSED

Commits a657b7a, e4a449e, 0907d5c exist; full suite green.
