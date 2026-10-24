---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 08
subsystem: calculator
tags: [calculator, show-the-maths, believe-panel, live-chart, svg, tdd]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: present(), sensitivity(), ui.js live binding, generated calc claims (03-05 to 03-07)
provides:
  - present().maths (eight named steps with the reader's numbers) and present().believe (5-7 ranked beliefs)
  - svg.js chartSpec() (pure geometry) and renderChart() (createElementNS and attributes only)
  - panels.js DOM writers for the maths steps and believe list
  - Static Figure 8, details.maths and .believe in s11, drift-tested, with generated calc-maths-* and calc-believe-* claims
affects: [03-09]
key-files:
  created: [site/js/svg.js, site/js/panels.js, test/svg.test.js]
  modified: [site/js/model.js, site/js/data.js, site/js/ui.js, site/index.html, site/assets/style.css, scripts/smoke.mjs, test/model.test.js, test/data.test.js, test/calc-page.test.js, test/style.test.js]
key-decisions:
  - "Believe panel is the live sensitivity top five plus 2x tooling cost and 2x variant generation cost, skipping a duplicate if variant cost enters the top five; the top three by cost swing carry the result"
  - "The variant-cost item computes its own swing (a 20% rise) and says 'only slightly' only when the measured change is under 2%"
  - "Chart value labels reuse the results-table claims where the text matches; a compact fallback keeps every label within 13 characters"
  - "Series names sit as text above each bar, so a label line is only the value and, for utilisation at or above full capacity, 'over capacity' underneath"
requirements-completed: [CALC-02, CALC-01]
duration: 55min
completed: 2026-10-24
---

# Phase 3 Plan 8: Show the maths, believe panel and live chart Summary

The calculator is complete: a closed "Show the maths" with eight plain-English steps and the reader's numbers, an always-visible "What you must believe" panel ranked by measured influence, and a live Figure 8 (baseline against 2x in three panels) that is also present as static, drift-tested SVG without JavaScript.

## Tasks

1. Task 1, commit d977636: `present().maths` and `present().believe`, `chartSpec()` and `renderChart()` in `svg.js` (77 lines, no style or innerHTML), tests for geometry (multiples of 4, widths, reference line, over-capacity second line, label fit at defaults, reviewers 4, 1e6 and 1e9 campaigns).
2. Task 2, commit e81d859: static Figure 8 in a `.fig-grid` with a "How to read this" block, `details.maths`, `.believe`, generated claims, CSS (including `svg.fig.fig-live { min-width: 0; }` in the 960px block with the Figure 1 line untouched), live wiring in `ui.js` (265 lines) and `panels.js`, smoke cases i and k.

## Verification

- `node --test`: 275 tests, 0 failing.
- `node scripts/smoke.mjs` (exit 0): PASS a, b, c, d, e, f, g, h, i, j, k.
- Figure 8, the maths, the believe panel and the sensitivity table sit outside every `.calc-live`; the fixed-assumptions sentence still sits directly under the results table.

## Deviations from Plan

**1. [Rule 3 - Blocking] Smoke case letters:** h was already the typed-zero case, so the plan's new h and i became i (over capacity at reviewers=4) and k (defaults: chart desc, three "carries the result" marks, maths cost result). Cases a to j all pass.

**2. [Rule 1 - Bug] Break-even step with zero review minutes:** the maths step produced an infinite share when minutes per review is 0 (a valid input); the existing present() fuzz caught it. It now reads "no limit".

**3. [Plan detail] Chip inside the numbers code:** the governing chip rule requires the chip directly after the first figure, so each maths step's single chip sits after the first number inside the "With your numbers" code element. The rule itself is unchanged.

**4. [Plan detail] Series labels:** to keep value labels to 13 characters and name each series in text, "Baseline" and "2x" are separate text lines above each bar (Figure height 392 rather than about 336).

## Known Stubs

None.

## Threat Flags

None beyond the register. T-03-26 to T-03-28 mitigated: svg.js and panels.js use createElementNS/createElement, setAttribute for geometry and ids, textContent for all text, and are source-scanned; svg.js has no "style"; the believe order comes from the computed sensitivity ranking with grade chips linking to register rows.

## Self-Check: PASSED

Commits d977636 and e81d859 exist; site/js/svg.js, site/js/panels.js and test/svg.test.js exist. No server or Chrome started by this plan remains running.
