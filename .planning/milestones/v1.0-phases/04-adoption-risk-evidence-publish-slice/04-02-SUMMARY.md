---
phase: 04-adoption-risk-evidence-publish-slice
plan: 02
subsystem: ui
tags: [source-register, publisher-type, test-groundwork, numeric-gate, time]
requires:
  - phase: 04-adoption-risk-evidence-publish-slice
    provides: plan 01 register-id link gate and group grade rule
provides:
  - PUBLISHER_TYPES export and publisherType on all 49 sources
  - 13 new Phase 4 sources (incidents, regulation, Parasuraman and Manzey, Moffatt, Getty US and CMS)
  - asm-backlog0-days, asm-adoption-design, asm-risk-likelihood context assumptions
  - s15 register with a Publisher type column and accessed dates in time elements
  - pinned test rules for time text, legal-ref spans and register columns
affects: [04-03, 04-04, 04-05]
tech-stack:
  added: []
  patterns: ["timeIssue(): datetime must equal text, D Month YYYY or Month YYYY", "LEGAL_REFS pinned numeric-gate door"]
key-files:
  created: []
  modified:
    - site/js/data.js
    - site/index.html
    - site/assets/style.css
    - test/page.test.js
    - test/data.test.js
key-decisions:
  - "time text rule relaxed narrowly: validated pairs only, mismatches fail (pinned fixture of the five incident pairs)"
  - "Legal references pass the numeric gate only as one of four exact strings; ALLOWED_NUMERIC_TOKENS unchanged"
  - "Source table min-width 1040px is scoped by the table's aria-label, so the assumptions table is unaffected"
requirements-completed: []
duration: 25min
completed: 2026-10-24
---

# Phase 4 Plan 2: Register groundwork and pinned test changes Summary

Publisher type is now a required field on every one of 49 sources and a visible s15 column, with 13 Phase 4 sources and three context assumptions added, under deliberately narrow, pinned test changes.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1. Pinned test changes (RED) | 8e72e95 | time rule, LEGAL_REFS, register positions, publisherType and new-entry tests |
| 2. Data, sources, assumptions, s15 column (GREEN) | 0de0068 | data.js, index.html register, style.css |

## RED state before Task 2

`test/data.test.js` and `test/page.test.js` failed to load, because `PUBLISHER_TYPES` was not yet exported. The register-column, publisherType, new-id and new-assumption assertions were therefore all unmet. No unrelated test failed (181 other tests passed).

## What changed

- data.js: `PUBLISHER_TYPES` (seven fixed values), `publisherType` on 36 existing sources per RESEARCH, 13 new sources with optional `event`, three context assumptions. `asm-backlog0-days` is 5 working days, Modelled, basis states it is a chosen target and not a measurement.
- s15: note "Publisher type says who published the source. It never changes a grade.", eight-column thead, Date accessed as `<time>`, `Event dated X.` in the Claim cell for event sources, 13 appended rows, three assumption rows.
- Tests: `timeIssue()` accepts YYYY-MM and YYYY-MM-DD with text equal to the datetime or the matching "D Month YYYY" or "Month YYYY"; a fixture test passes the five incident pairs and fails mismatches (for example 2025-12-10 with "December 2025"). New `LEGAL_REFS` strip and a "every legal-ref span carries one pinned reference" test. Register cells read at positions 0 to 6. The all-sources completeness test replaces the three-id loop. The WR-05 read_via check for '2025-12-16' is kept elsewhere in the suite and passes.
- ALLOWED_NUMERIC_TOKENS, VENDOR_RE, chip rules and data-fig tests are untouched.

## Verification

`node --test`: 304 pass, 0 fail. `node scripts/smoke.mjs`: all PASS. 49 sources, all with a valid publisherType.

## Deviations from Plan

- **[Rule 1 - Bug] Publisher cell comparison** The register test compared the raw publisher against escaped HTML, which fails for "Levi Strauss & Co."; it now compares the decoded cell.
- Task 1 was committed with data and page tests failing to import (the RED state), as intended.
- Getty US `published` is set to the tracker footer date 2026-10-19 and its bias records the conflicting page dates.
- The ASA row is typed government with the industry-levy caveat in its bias note, as planned. The legend note for this is not added here (no legend change was in scope).

## Known Stubs

None. The three context assumptions are referenced by text in sections 13 and 14, which later plans fill.

## Threat Flags

None. No scripts, endpoints or inline styles added.

## Notes

CLOSE-03 is not marked complete: the evidence-gaps section arrives in a later plan, so the requirement is only partly delivered.

## Self-Check: PASSED

Commits 8e72e95 and 0de0068 exist; modified files present; tests and smoke green.
