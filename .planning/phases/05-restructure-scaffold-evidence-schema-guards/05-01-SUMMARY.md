---
phase: 05-restructure-scaffold-evidence-schema-guards
plan: 01
subsystem: testing
tags: [node-test, guards, fixtures, share-links, gates]
requires: []
provides:
  - test/helpers/html.js balanced-tag slicer (elementById, sectionHtml, strip, decode)
  - frozen v1 inventory fixture and RETIRED list (STRUCT-02, STRUCT-04)
  - v1 share-link fixture test (STRUCT-03)
  - anchor and jargon guards (STRUCT-05, STRUCT-06)
  - scripts/gates.sh per-phase gate runner
affects: [05-02, 05-03, phase-07, phase-08, phase-09]
tech-stack:
  added: []
  patterns: [tag-depth slicing for section or div, frozen JSON fixtures, mutation cases proving guards fire]
key-files:
  created:
    - test/helpers/html.js
    - test/helpers.test.js
    - test/inventory.test.js
    - test/share-links.test.js
    - test/guards.test.js
    - test/fixtures/v1-inventory.json
    - test/fixtures/retired.json
    - test/fixtures/v1-share-links.json
    - scripts/snapshot-v1-inventory.mjs
    - scripts/gates.sh
  modified:
    - test/page.test.js
    - test/calc-page.test.js
    - test/compare.test.js
    - test/legal.test.js
    - test/figure.test.js
    - test/diagram.test.js
    - scripts/smoke.mjs
    - README.md
key-decisions:
  - "Guards land against the unmodified v1 page; site/ and .github/ untouched"
  - "retired.json is a JSON file so guards.test.js and inventory.test.js share it without importing a test file"
requirements-completed: [STRUCT-02, STRUCT-03, STRUCT-04, STRUCT-05, STRUCT-06]
duration: 25min
completed: 2026-10-25
---

# Phase 5 Plan 01: Guards Before the Restructure Summary

Every STRUCT-02..06 guard is green on the unmodified v1 page, with mutation cases that prove each one fires, plus a balanced-tag slicer so demoted `<div id="sNN">` wrappers will be sliced whole in Wave 2.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1 Balanced-tag helper, slicers converted | 114634c | helper self-tested on all 15 sections plus answer; page, calc-page, compare, legal, figure, diagram tests and smoke.mjs converted |
| 2 Inventory and share-link fixtures | 1a393ed | inventory (213 ids, 274 data-fig, 334 occurrences, 8 figures, 26 tables, matching research) and nine share links |
| 3 Anchor and jargon guards, gates.sh, README | f951f73 | guards.test.js, executable gates.sh, README paragraph |

## Verification

- `node --test`: 412 pass, 0 fail. `node scripts/crosscheck.mjs`: 0 failures.
- `scripts/gates.sh` printed ALL GATES GREEN (smoke, a11y, print 84 pages) on v1, no retry needed.
- `git diff --stat -- site/ .github/` empty. Nothing pushed.

## Decisions Made

- page.test.js now uses the helper's strip/decode; the helper decode also handles `&lt;`/`&gt;` and no existing assertion changed. Other tests kept their own local decode.
- Share link `#s11?scenario=reduce&route=campaigns` is marked acceptOnly: the app serialises route before scenario, so the recorded legacy order does not round-trip byte for byte, but it parses correctly. `scenario=redeploy`, `markets=abc` and `route=__proto__` are also acceptOnly.

## Deviations from Plan

None beyond the above fixture marking. TDD note: helper and tests were written together, so the RED-on-missing-module step was not committed separately (single test commit per task).

## Known Stubs

None.

## Self-Check: PASSED
