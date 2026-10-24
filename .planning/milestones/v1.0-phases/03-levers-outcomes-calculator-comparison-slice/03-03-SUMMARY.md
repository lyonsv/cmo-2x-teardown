---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 03
subsystem: ui
tags: [s09, ops, statutory-damages, aeo, tdd]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: lever block pattern, localisation, experimentation and insight blocks (03-01, 03-02)
provides:
  - s09 Operations block with a Benchmark 17 U.S.C. 504(c) table, a Not legal advice callout and a Speculative per-master-concept illustration
  - s09 Answer-engine visibility block graded Speculative with independent traffic studies
  - sources cornell-17usc504, cornell-17usc412, haynes-2026, seoworks-2026, indig-2026, aggarwal-geo-2024; asm-incident-rate; 4 statute claims, 4 ops claims, 6 AEO claims; num1 format
affects: [03-04, 03-05]
tech-stack:
  added: []
  patterns: [span.statute citations pinned by a narrow numeric-gate pre-strip, time element for a dated source in prose]
key-files:
  created: []
  modified: [site/index.html, site/js/data.js, test/page.test.js, test/data.test.js]
key-decisions:
  - "Statutory illustration is per master concept, never multiplied by the variant count; asserted by a test"
  - "Numeric-gate pre-strip limited to the two exact statute texts; ALLOWED_NUMERIC_TOKENS unchanged"
requirements-completed: [LEVER-04, LEVER-05]
duration: 25min
completed: 2026-10-24
---

# Phase 3 Plan 3: Operations and Answer-engine visibility Summary

s09 is complete: the Operations block quotes the statutory ranges as Benchmark and illustrates exposure with a Speculative, reader-owned incident rate; the AEO block grades the lever Speculative, cites three independent traffic studies and an academic benchmark, and says "We did not find evidence that visibility gains translate into pipeline."

## Tasks

1. Operations block with statutory illustration - commit 07b01b4
2. Answer-engine visibility block and s09 completion - commit 1e0150e

## Word counts (prose, tables excluded)

- s09 total: 1,578 (budget 1,500-2,000)
- localisation 331, experimentation 381, insight 177, ops 315, AEO 359

## Illustration values (at 1,189 master concepts, rate 1 in 1,000)

About 1.2 incidents; $892 to $35,670 at the ordinary range; up to $178,350 wilful. All Speculative; the page states these are small beside the $3.29M production cost.

## Deviations from Plan

**1. [Rule 2 - Honesty] Insight test slice:** the insight block test sliced to the end of s09, so the new blocks would have inflated its word count; it now ends at the ops heading (same fix as 03-02).

**2. Source dates:** the Cornell pages carry no currency date, so `published` reads "undated". The SEO Works page is undated; the data run to August 2026 (stated in read_via). The KDD 2024 date 2024-08-25 is the conference start, not re-confirmed (stated in read_via). I could not fetch pages in this run; the study figures and statute ranges rest on the 03-RESEARCH ledger, which recorded them on 2026-10-24, and read_via says only figures, dates and authorship were recorded.

**3. Unused claim:** aeo-chatgpt-share is registered in data.js but not shown in prose, because the page names no products outside s12 and s15.

**4. Date in prose:** "published up to 2026-10-21" is a `<time>` element so the numeric gate and the time-in-register test hold.

## Known Stubs

None. s10-s14 remain skeletons by design.

## Threat Flags

None beyond the plan's register. T-03-07 mitigated (Benchmark statute ranges, per-work rule, section 412 caveat, callout). Phase 4 legal review of the statutory table should be done before launch.

## Self-Check: PASSED

Commits 07b01b4 and 1e0150e exist; `node --test` 190 pass, 0 fail; ALLOWED_NUMERIC_TOKENS unchanged.
