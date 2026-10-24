---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 02
subsystem: ui
tags: [s09, experimentation, insight, tdd]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: lever block pattern, s09 lead and localisation block (03-01)
provides:
  - s09 Experimentation block with an unaveraged win-rate table by definition of a win
  - s09 Insight and reporting block (brief, Modelled, evidence gap stated)
  - sources experimentation-vendor-playbook, kohavi-2013, mmm-geox; six win-rate and arithmetic claims; asm-tests-per-quarter
affects: [03-03, 03-04, 03-05]
tech-stack:
  added: []
  patterns: [win-rate rows carry figure then flag in td.num, one chip in the last cell]
key-files:
  created: []
  modified: [site/index.html, site/js/data.js, test/page.test.js, test/data.test.js]
key-decisions:
  - "Win rates shown as three definitions (12% vendor-claimed, 33% and 10% company-reported), never averaged"
  - "s09 prose anonymised; vendor, software company and MMM framework linked to register rows only"
requirements-completed: [LEVER-02, LEVER-03]
duration: 20min
completed: 2026-10-24
---

# Phase 3 Plan 2: Experimentation and Insight levers Summary

s09 now carries an Experimentation block (win-rate table by definition, illustrative 20-test arithmetic, explicit traffic bound) and a brief Modelled Insight and reporting block built around marketing-mix models calibrated by experiments.

## Tasks

1. Experimentation block with win-rate table - commit 269fedf
2. Insight and reporting block - commit af10202

## Deviations from Plan

**1. [Spec supersession] LEVER-02 range:** shown as about 10-33% by definition. The ROADMAP/REQUIREMENTS "12-36%" wording is superseded per 03-CONTEXT post-research decisions. The DRIP 36.3% figure is dropped (no primary source); no "36" token appears in s09 (tested).

**2. [Rule 1 - Test scope] Localisation prose test:** it sliced from the localisation heading to the end of s09, so the new blocks would have inflated its word count. It now ends at the experimentation heading.

**3. Publication dates:** the vendor page and the geo-experiments documentation page carry no date, so `published` reads "undated on the page". The paper date 2013-08-11 is the KDD 2013 conference start and is not re-confirmed (stated in read_via). The paper PDF was fetched (9 pages) but its text was not machine-extracted, so the one-third and ten percent figures rest on the research ledger quotes.

**4. Task 1 commit** includes the Task 2 tests (added red) because both test files were written up front; the suite was green again at the Task 2 commit.

No auth gates.

## Known Stubs

None. s10-s14 remain skeletons by design.

## Self-Check: PASSED

Commits 269fedf and af10202 exist; `node --test` 183 pass, 0 fail.
