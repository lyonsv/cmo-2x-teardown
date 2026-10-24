---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 01
subsystem: ui
tags: [ui-review-carry-over, s09, localisation, tdd]
requires:
  - phase: 02-factory-spine-slice
    provides: s02-s08 markup, data.js claims, page tests
provides:
  - Phase 2 UI-review fixes (CSS, tier table, capacity wording, Figures 4-6)
  - s09 lead and the localisation and transcreation lever block
  - laubli-2019 and translation-vendor-case sources with four graded claims
affects: [03-02, 03-03, 03-04, 03-05]
tech-stack:
  added: []
  patterns: [lever block = h3 + answer-first sentence + Output/Outcome mini table + prose]
key-files:
  created: []
  modified: [site/assets/style.css, site/index.html, site/js/data.js, test/page.test.js, test/style.test.js, test/data.test.js]
key-decisions:
  - "Post-editing range 9.26% to 59.74% graded Modelled with pre-LLM, one-domain, few-translator caveats"
  - "Vendor case study anonymised in prose and flagged vendor-claimed; no per-word rate given"
requirements-completed: [LEVER-01]
duration: 25min
completed: 2026-10-24
---

# Phase 3 Plan 1: UI-review carry-over and localisation lever Summary

Phase 2 UI-review backlog cleared with test guards, and s09 now opens with its lead and a graded localisation block (Modelled post-editing range, vendor-claimed case study, no per-word rate).

## Tasks

1. Phase 2 UI-review fixes - commit 327fd33
2. s09 lead and localisation block - commit 4275b5e

## Details

- Word counts (existing proseWords logic): s05 501, s07 531, s08 528, all inside the 400-700 budget, so no trim. Localisation block prose: 331 words (250-450).
- 28.4% and 111.3% chips: no chip added. 111.3% sits in a paragraph already governed by the src-intercom-2x-teardown chip on 100.1% (chip density rule: one chip per ref per paragraph); 28.4% likewise governed by the paragraph chip. Both carry the company-reported flag.
- Telemetry bullets in s08: the "Then ..." and "Reviewer decisions" bullets already end with full stops; the short metric bullets carry the full stop inside the bold lead-in, so no change was needed.
- Figures: Fig 4 human-queue branch now accent (both fork branches match; the auto-approve branch already had its arrow head); Fig 5 gains a Pass outward arrow with a "to the gate" note, Escalate shifted to y216 (viewBox 304); Fig 6 viewBox trimmed to 276.
- s09 and s15 text: the lever-02 evidence basis extended with the post-editing sentence (data.js and register row in step).
- arXiv v1 date confirmed as 2019-06-04 (plan suggested 06-05). Vendor case study published 2025-03-10, headline "How a Fortune 500 enterprise translated millions of words at scale"; page states more than $3.4M saved and 50% faster to market.

## Deviations from Plan

**1. [Rule 1 - Interpretation] Figure 4 "missing arrow"**: the auto-approve branch already had an accent arrow head; the asymmetry was the plain human-queue branch, so that branch was made accent. Diagram accent tests still green.

**2. [Rule 1 - Date] arXiv published date** set to 2019-06-04 per the abstract page instead of the plan's 06-05.

Otherwise as written. No auth gates.

## Known Stubs

None in new content. s10-s14 remain skeletons by design.

## Self-Check: PASSED

Commits 327fd33 and 4275b5e exist; `node --test` 179 pass, 0 fail.
