---
phase: 02-factory-spine-slice
plan: 02
subsystem: s03-s04-diagrams-architecture
tags: [s03, s04, svg, diagrams, architecture]
requires: [02-01]
provides:
  - Reusable diagram CSS (.fig-grid, svg.fig-d, node/edge classes, .fig-steps, tr.shared, print rules)
  - test/diagram.test.js contract for every svg.fig-d (EXPECTED_FIGURES)
  - s03 "The factory model" with Figures 2 and 3
  - s04 "Platform and skills" layered architecture table
affects: [02-03, 02-05, 02-06]
tech-stack:
  added: []
  patterns: ["vertical-first 300-wide viewBox diagrams with visible ordered-list equivalent", "accent only on review/gate strokes"]
key-files:
  created: [test/diagram.test.js]
  modified: [test/page.test.js, test/style.test.js, site/assets/style.css, site/index.html]
key-decisions:
  - "Diagram nodes are 240 wide at x=30, height = lines*16+8, enforced by test"
  - "Figure steps and captions carry no digits so the numeric gate needs no new exemptions"
requirements-completed: [SPINE-01]
duration: ~20 min
completed: 2026-10-24
---

# Phase 2 Plan 02: Factory model and platform architecture Summary

s03 and s04 are live: two accessible inline-SVG diagrams (factory model, content supply chain) with visible step lists, a ten-row layered architecture table with one shared versioned policy source, and a reusable diagram CSS and test contract for Figures 4 to 7.

## Commits

- 2b8849c test(02-02): diagram contract and s03/s04 tests (RED)
- 8cbda22 feat(02-02): s03 factory model with Figures 2 and 3
- 80e8bf6 feat(02-02): s04 layered operating architecture

## Verification

`node --test`: 115 pass, 0 fail. RED failed only on the new tests. `class="later"` count is 10 (s05 to s14). One `@media print` block.

## Requirements

SPINE-01 delivered. GEN-05 stays pending: it needs Figure 4 (02-03).

## Deviations from Plan

None. The plan was executed as written. The print block gained the specified rules, and the `.fig-grid` break-inside rule was added to the existing list.

## Known Stubs

None added. s05 to s14 remain "Coming in a later update." skeletons by design.

## Threat Flags

None. SVG hygiene (no style, script, href, image, data) is enforced by diagram.test.js.

## Self-Check: PASSED

test/diagram.test.js exists; commits 2b8849c, 8cbda22, 80e8bf6 exist; full suite green.
