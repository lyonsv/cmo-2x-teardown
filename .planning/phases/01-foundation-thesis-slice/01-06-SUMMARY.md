---
phase: 01-foundation-thesis-slice
plan: 06
subsystem: section-02
tags: [section-02, svg-figure, data-table, accessibility, print]
requires: ["01-05"]
provides:
  - "Figure 1 in s02: three-panel inline SVG (output per head, cost per asset by six components, AI spend)"
  - "Always-visible Figure 1 data table with Modelled chips on all 18 values"
  - "Twelve cpa-<component>-base|scaled claims derived from compute()"
  - "Chart CSS: palette tokens, fig-scroll, print greys"
key-files:
  created:
    - test/figure.test.js
  modified:
    - site/js/data.js
    - site/index.html
    - site/assets/style.css
decisions:
  - "Bar widths use the claim values (output 83 and 167 are rounded), so the baseline output bar is 298.2 wide, not 298.8"
  - "Figure geometry generated once by a scratchpad script and hand-spliced; nothing generated is committed"
requirements-completed: [CFO-04, CFO-02, CRED-02, CRED-06, SHELL-04]
completed: 2026-10-24
---

# Phase 1 Plan 06: Figure 1 Summary

Figure 1 sits in s02 directly after the "figure below breaks the cost down by component" paragraph. It shows baseline above 2x in three panels, each on its own scale, with an always-visible data table below. Every width, label and table value is tested against data.js, and the component claims are tested against compute().

## Commits
- 1332280 test(01-06): failing figure tests and twelve cost component claims (RED)
- 3128e8a feat(01-06): Figure 1 SVG, data table and chart CSS in s02 (GREEN)

## Results
Full suite: 59 pass, 0 fail. `data-bar=` count 16, `<details` 0, `style="` 0, page 48,548 bytes.

Component displays (baseline then 2x): generation $34.21 / $18.68, review $17.26 / $9.68, rework $3.22 / $1.58, tooling $3.75 / $7.50, rights $6.25 / $3.72, storage $0.02 / $0.02. Sums are $64.71 and $41.18, matching cpa-base and cpa-scaled.

## Deviations from Plan
None to the code. Per the orchestrator note, the plan's baseline review figure was corrected to $17.26, and compute() agrees. All displays match compute().

## Known Stubs
None. s03-s14 remain skeletons by design.

## Not verified
The figure was not eyeballed in a browser or print preview in this run; layout is checked by tests and geometry only. At 480px and below the SVG renders at its 560px minimum inside a scroll region, so chart text is about 7px effective, as the UI-SPEC contract dictates.

## Self-Check: PASSED
Commits 1332280 and 3128e8a exist; test/figure.test.js exists.
