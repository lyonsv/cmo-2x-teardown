---
phase: 05-restructure-scaffold-evidence-schema-guards
plan: 03
subsystem: page-structure
tags: [restructure, toc, anchors, css, node-test]
requires: [05-01, 05-02]
provides:
  - 15 new top-level sections in executive-question order hosting the 15 v1 blocks as div.subsection
  - TOC with nine rows, an Appendices label and six appendix rows
  - SECTIONS and HOSTED maps in test/page.test.js
  - cross-reference label guard test
affects: [05-04, 05-05, phase-06, phase-07, phase-08]
tech-stack:
  added: []
  patterns: [hosted v1 blocks keep their ids as div.subsection with an h3, legacy-view sectionHtml in page.test.js]
key-files:
  created: []
  modified:
    - site/index.html
    - site/assets/style.css
    - site/js/data.js
    - test/page.test.js
    - test/style.test.js
    - test/helpers.test.js
key-decisions:
  - "page.test.js sectionHtml for v1 ids returns a legacy view (h3 shown as the old sec-head) so ~100 content tests stay unchanged"
  - "Appendix links are labelled 'Appendix X'; body links use plain section numbers in the surrounding style"
requirements-completed: [STRUCT-01, STRUCT-02]
duration: 25min
completed: 2026-10-25
---

# Phase 5 Plan 03: Restructure Around Executive Questions Summary

The page now reads 01 What 2x means through 09 Risks, then Appendices A-F, with every v1 id (s01-s15, figures, tables, asm, src) still on the element holding its content.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1 Mechanical move | e3a812f | 16 sections, 15 div.subsection, TOC 9 + group + 6, CSS hooks, structure tests rewritten; inventory, share-link and guards tests unmodified and passing |
| 2 Cross-reference labels | b517c0b | all link labels and two data.js basis strings renumbered; new guard test |

## Verification

- `node --test`: 423 pass, 0 fail. `node scripts/crosscheck.mjs`: 0 failures.
- `scripts/gates.sh`: ALL GATES GREEN (smoke, a11y, print 85 pages), no retry needed.
- `git log origin/main..HEAD` lists the phase commits; nothing pushed.
- h3 count is 53 as the plan predicted (15 hosted plus 38 in-body).

## Deviations from Plan

**1. [Rule 3 - Blocking] test/helpers.test.js updated.** It asserted s11 is a `<section>`; it is now a div. Assertion changed to div. Not listed in the plan's files.

**2. [Rule 3 - Blocking] page.test.js sectionHtml uses a legacy view for v1 ids.** The shared helper drops the wrapper h3, which broke tests that skip the sec-head with `indexOf('</div>')` and tests that `html.replace(sectionHtml(id))`. Hosted ids now return the block with the h3 rendered as the old sec-head; vendor and Intercom exclusion tests use `elementById` directly.

**3. Cross-reference style.** Plain "section 10/11" labels became "section 6/5" (not zero-padded) to match the surrounding style; "section 01" kept padded. The plain-text "section one" at the six-lever table reference is still correct (s01 is section 01) and was left.

The mechanical move touched only the three transformed lines per block, the shells, TOC and CSS inside index.html. Figures were not renumbered (per orchestrator).

## Known Stubs

`#autonomy` holds only its heading; its text is plan 05-04.

## Self-Check: PASSED
