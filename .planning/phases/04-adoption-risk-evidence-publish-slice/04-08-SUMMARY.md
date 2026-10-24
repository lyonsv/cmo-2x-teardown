---
phase: 04-adoption-risk-evidence-publish-slice
plan: 08
subsystem: testing
tags: [checkpoint, local-preview, human-uat]
status: partial (Task 1 done; Task 2 preview awaiting user)
requirements: [QA-01, QA-02, QA-03, QA-04]
key-files:
  created: [.planning/phases/04-adoption-risk-evidence-publish-slice/04-HUMAN-UAT.md]
  modified: [site/assets/style.css, test/style.test.js]
---

# Phase 4 Plan 8: Gates and preview Summary (partial)

## Gates (run 2026-10-24 on commit a41ba92)

All five gates exit 0.

1. `node --test`: tests 372, pass 372, fail 0.
2. `node scripts/crosscheck.mjs`: `crosscheck: 0 failures; figures 334, chips 169, cites 62, register rows 107, unreferenced 4, defaults 12`.
3. `node scripts/smoke.mjs`: 17 PASS lines (cases a to q), 0 FAIL.
4. `node scripts/a11y.mjs`: 23 PASS, 0 FAIL (0 unnamed; landmarks banner/main/nav/contentinfo; h1 1, skips 0; 16 named sections; en-GB; targets >= 48px; 401 tab stops with outlines; 320px scrollWidth 320; text-spacing scrollWidth 320, overflow only in 27 scroll regions).
5. `node scripts/print.mjs`: 11 PASS, 0 FAIL (legal flag in print and on page 1; maths open; 83 pages, ceiling 100; no clipped cells at 700px).

Also: `grep -c 'class="callout legal-flag"' site/index.html` = 1; `git status --porcelain -- site test scripts` empty after the fix commit; no COI/Getty text on the page (grep 0).

## Deviations

**1. [Rule 1 - Bug] Live chart panel label overflowed under text spacing**
- Found during: Task 1, first a11y.mjs run (FAIL "text-spacing overflow only in scroll regions": svg text "Campaign-markets launched per quarter" right 329, in `svg.fig-live`, viewBox width 300).
- Cause: the 37-character headline label from Phase 03.1 in 12px mono, with WCAG 1.4.12 spacing, exceeds the 300-unit viewBox (and would clip).
- Fix: `.fig-live .panel-lbl { font-family: var(--serif); }` (11px was tried first and rejected by the font-size-scale test). Pinned in test/style.test.js. CSS and test only.
- Commit: a41ba92. The live chart panel labels now differ in face from Figure 1; flagged in HUMAN-UAT item 11.

**2. Plan wording adapted to quick task 261024-s14** (COI note and Getty content removed): the legal flag no longer sits under a COI note, and the Getty COI check was dropped from HUMAN-UAT. Added HUMAN-UAT item 11 for the Phase 03.1 37-character label fit advisory.

## Human UAT

04-HUMAN-UAT.md: 11 items, all pending, none passed.

## Preview review

pending user reply (local preview at http://127.0.0.1:8000/, server already running, HTTP 200 confirmed)

## Self-Check: PASSED (Task 1 only)
