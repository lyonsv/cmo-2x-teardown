---
phase: 05-restructure-scaffold-evidence-schema-guards
plan: 02
subsystem: data
tags: [evidence, data-js, tdd, node-test]
requires: []
provides:
  - EVIDENCE and ALLOWED_PAIRS exports in site/js/data.js
  - evidence class on 45 sources, 62 assumptions and every claim
  - test/evidence.test.js (pairs, flags, counts, inheritance)
affects: [05-05]
tech-stack:
  added: []
  patterns: [post-pass assignment of evidence, rule recomputed independently in the test]
key-files:
  created: [test/evidence.test.js]
  modified: [site/js/data.js]
key-decisions:
  - "Evidence is assigned by post-passes; the a() helper signature is unchanged"
  - "Claim evidence is computed: weakest of ref and a 2x-side override (hypothesis), applied to src- and asm- refs"
requirements-completed: [EVID-01]
duration: 10min
completed: 2026-10-25
---

# Phase 5 Plan 02: Evidence Schema Summary

Every source, assumption and claim in data.js now carries an evidence class (observed, benchmark, illustrative, hypothesis), with a test enforcing allowed (evidence, grade) pairs, flags, counts and computed claim inheritance.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1 RED: evidence tests | 9611823 | failing (EVIDENCE not exported) |
| 2 GREEN: data.js schema and post-passes | 5955888 | 419 tests pass, crosscheck 0 failures |

## Decisions

Author decisions A1 (statutes benchmark), A4 (vendor docs observed plus existing flag), A12 (cap-2x-ref-* hypothesis) applied. Counts matched the research prototype exactly on first run; all 29 hypothesis ids existed with the spelling in the plan.

## Deviations from Plan

None. No HTML, grade, flag or display text changed; `git diff -- site/index.html` empty. Nothing pushed.

## Known Stubs

None.

## Self-Check: PASSED
