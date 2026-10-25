---
phase: 07-content-presentation-publish
plan: 04
type: execute
subsystem: content
tags: [supply-chain, svg-diagram, worked-example, engine-claims, figure-3]
requires: [07-03, 06-05]
provides:
  - "#supply-chain section 04: two-variant fig-flow SVG (Figure 3), stage table, worked example, per-unit engine table, hand-offs argument, wedge"
  - "test/flow.test.js, test/supply-chain.test.js"
  - "Appendix A #appendix-factory (v1 factory model and Figure 2)"
affects: [07-05, 07-09]
key-files:
  created: [test/flow.test.js, test/supply-chain.test.js]
  modified: [site/index.html, site/assets/style.css, scripts/print.mjs, test/diagram.test.js, test/inventory.test.js, test/fixtures/retired.json, test/page.test.js, test/spine.test.js]
key-decisions:
  - "Diagram geometry reworked from the ARCHITECTURE s8 table where it collided: nodes 68 wide on x=14+78i, brackets inset by 3, lane descriptors moved into free gutters, boundary label moved to the empty column"
  - "Per-unit hours table has two rows per workflow (today, with agents) because the page chip rule needs one ref per row and current and agent claims have different refs"
  - "s03 stays as div#s03 titled The factory model with condensed prose; full factory figure moved to Appendix A as #appendix-factory (h3 'The factory model in full')"
requirements-completed: [FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05, STRUCT-07]
completed: 2026-10-25
---

# Phase 7 Plan 04: The first workflow Summary

Section 04 now shows the nine-step content supply chain as a responsive two-variant SVG (wide at 760px and in print, a phone-width column below), a stage-by-stage who-does-what table, a ten-step worked example (launch the approved campaign in three more markets) with engine-bound hours and elapsed days, the argument that removing hand-offs beats faster generation, and the wedge into a broader system.

## Commits
- c716557 feat(07-04): diagram, CSS switch, test/flow.test.js, print ceiling 153
- 0c6c7c4 feat(07-04): section text, worked example, per-unit table, s03 condensed, factory model to Appendix A, test updates, print ceiling 158

## The diagram (Figure 3)
- **Wide (720x500):** nine stage labels, a PEOPLE lane (heavy outlines, dashed for steps that fade as trust grows), a dashed approval and exception boundary, an AGENTS lane with two dotted run brackets (launch run across six stages, monitoring run across two), five double-headed accent edges crossing the boundary, a dashed feedback path back into the plan, eight shared-platform blocks, nine existing-system tags and a nine-item legend.
- **Narrow (300x1000):** nine stage cards each with an "Agent:" and a "People:" line, left-rail run brackets, right-side accent ticks where the boundary is crossed, the feedback path, platform and systems blocks, a three-line key. All lines 28 characters or fewer; text-spacing (WCAG 1.4.12) stays inside the viewport at 320px.
- **Switch:** CSS only (`.flow-wide` hidden by default, shown at min-width 760px and in print; `.flow-narrow` the reverse). No inline style, no JS, one SVG in the accessibility tree at a time. Distinct ids (ff1w-*, ff1n-*).
- **Not colour alone:** lane labels and "Agent:/People:" prefixes say who acts; people steps have a heavier stroke, fading steps are dashed, the boundary is dashed; print forces black and grey.
- **Text equivalent:** a visible `ol.fig-steps` (ten steps, digit-free) expands DAM, CMS, PIM, TMS and MAP and names every stage; heading is a `p.steps-h` so no h3 count changes.
- Visually checked in headless Chrome (desktop, 500px column, and print-to-PDF page at A4): text legible at print scale.

## Figure renumbering and retired keys
- New fig-flow diagram is **Figure 3**. Factory model is still **Figure 2** but now sits in Appendix A, so page order reads 1, 3, 2, 4, 5, 6, 7 (the plan fixed Figure 3 for the new diagram; the inventory requires numbers 1 to 8 to exist). Flag for the author if page-order numbering matters.
- Retired in test/fixtures/retired.json: `id:fd3-t`, `id:fd3-d`, `id:fd3-arrow`, `id:fd3-arrow-review`. Reason: v1 Figure 3 (six-box supply chain) is superseded by the new diagram. Figure 3 caption itself survives (new diagram).
- v1 s03 heading `s03-h` and `s03` id kept (AEO paragraph still links `#s03`).

## Tests
test/flow.test.js (geometry, hygiene, digits, ids, text equivalent, CSS switch, human-step stroke), test/supply-chain.test.js (nine-row stage table in order, ten-item worked list, per-unit table with only econ-wf spans, hand-offs and wedge, no digits outside bound figures, factory move). Final: `node --test` 563 pass, crosscheck 0 failures, `bash scripts/gates.sh` ALL GATES GREEN (smoke hit the known CDP "no page target" flake once and passed on the scripted retry).

## Print ceiling
Task 1 measured 133 pages (ceiling 131 failed) and raised it to 153; the finished section measures 137 pages, so by the file's x1.15 convention the ceiling is now **158** (comment updated in scripts/print.mjs).

## Deviations from Plan

**1. [Rule 1 - Bug] ARCHITECTURE s8 wide geometry collided with itself.** Lane labels and bracket labels sat on the paths of the vertical crossing edges; the nine system tags did not fit eight 84-unit slots; 70-wide nodes left 8-unit arrows and 10-character lines overflowed their boxes. Fix: nodes 68 wide at x=14+78i, text 9 characters or fewer where possible, agent lane descriptor in the free left gutter, bracket labels moved to the bracket floor, boundary label moved to the empty column, systems on the stage grid, double-headed edges use one marker with orient auto-start-reverse. test/flow.test.js asserts this grid.

**2. [Rule 3 - Blocking] Per-unit table shape.** The page's chip rule requires every data-fig in a row to share one register ref; today and agent claims have different refs. The table has two rows per workflow (State column), still four workflows, still only econ-wf-W{2,4,5,6} spans, one Modelled chip and one evidence-class span per row. The plan's "Cycle time" header is banned page-wide (must read brief-to-live time), so the column is "Days elapsed". Workflow IDs (W2 etc.) are not shown because the numeric gate treats the digit as ungraded; rows use names and unit.

**3. [Rule 3 - Blocking] Existing guards changed deliberately.** page.test.js: STUBS drops supply-chain; s03 prose floor 400 to 250 and s03-s08 total floor 2800 to 2600 (factory prose moved to Appendix A); h3 count +5 (four new h3 and the appendix-factory heading), h4 count +1 net (two new h4, one steps heading removed with Figure 3; Figure 2's steps heading moved unchanged). diagram.test.js: Figure 3 removed from fig-d expectations, Figure 2 expected in appendix-campaign, section lookup falls back to the enclosing section, five fig-d diagrams. inventory.test.js mutation test filters RETIRED.

**4. Minor.** Appendix h3 is "The factory model in full" (not a duplicate of the s03 heading "The factory model"). Steps heading for Figure 3 is a paragraph, not a heading, to keep heading counts and avoid a skipped level under the h2. Worked-example hours: review per variant displays 0.2 then 0.1 at one decimal (engine 0.19 and 0.11); a table note says so.

## Known Stubs
None in #supply-chain.

## Threat Flags
None new. T-07-07: every number in the worked example is a data-fig on an econ-wf claim (crosscheck drift rule active, supply-chain.test.js pins the ids). T-07-08: flow.test.js forbids style=, href, image, data: in both SVGs; CSP unchanged.

## Self-Check: PASSED
