---
phase: 05-restructure-scaffold-evidence-schema-guards
plan: 04
subsystem: page-structure
tags: [stubs, appendix, css, node-test]
requires: [05-03]
provides:
  - four framing stubs with a to-follow marker in autonomy, build, supply-chain, economics
  - Appendices divider and six Supports pointers
affects: [05-05, phase-06, phase-07, phase-08]
key-files:
  modified:
    - site/index.html
    - site/assets/style.css
    - test/page.test.js
    - test/style.test.js
key-decisions:
  - "Marker uses new class to-follow (copy of .later) so the later-ban test is untouched"
requirements-completed: [STRUCT-01, STRUCT-06]
duration: 10min
completed: 2026-10-25
---

# Phase 5 Plan 04: Framing Stubs and Appendix Chrome Summary

Four honest question-led stubs with a "Detail to follow" marker, a visible Appendices divider ending the nine-section path, and a "Supports:" pointer on each of the six appendices.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1 Framing stubs | 295a0fb | stubs, .to-follow (screen and print), placement test |
| 2 Divider and pointers | bce6a9c | .appendix-divider, six Supports notes, divider added to numeric gate, placement test |

## Verification

`node --test` 425 pass; crosscheck 0 failures; `scripts/gates.sh` ALL GATES GREEN. Nothing pushed.

## Deviations from Plan

None. The style.test.js muted-contrast test title was extended to mention to-follow (it checks the shared muted token, not a class list).

## Known Stubs

The four to-follow stubs are intentional; later phases (6, 7, 8) replace them.

## Self-Check: PASSED
