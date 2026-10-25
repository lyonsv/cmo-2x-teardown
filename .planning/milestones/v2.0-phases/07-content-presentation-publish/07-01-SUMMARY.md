---
phase: 07-content-presentation-publish
plan: 01
subsystem: content
tags: [first-screen, thesis, chain, definition-of-2x, spine, honest-headline]
requires: [06-05]
provides:
  - "rewritten masthead standfirst and #answer: thesis, five-link chain, honest org-wide vs delegated-portfolio multiples, six answers"
  - "#opportunity: define-2x table, capacity/efficiency/effectiveness, no-merged-PR argument"
  - "test/opening.test.js (brief Final test items) and #opportunity registered in SPINE"
affects: [07-09]
key-files:
  created: [test/opening.test.js]
  modified: [site/index.html, site/assets/style.css, test/page.test.js, test/spine.test.js]
key-decisions:
  - "v1 answer text kept as a first-edition scenario disclosure (div#first-edition-scenario > details.maths) so inventory counts hold and v1 substance is not lost"
  - "No new data.js claims: prose uses words, the only numerals are engine-bound data-fig spans"
requirements-completed: [THESIS-01, THESIS-02, THESIS-03, THESIS-04, THESIS-06]
completed: 2026-10-25
---

# Phase 7 Plan 01: First screen and "What 2x means" Summary

The first screen now states the thesis (agents given whole workflows under permissions, checks and approvals), the five-link chain, the ambition (2x useful work per marketing FTE-equivalent, tested not assumed) and six answers that link to #build, #opportunity, #supply-chain, #expansion, #economics and #roadmap. Section 01 defines 2x, separates capacity, efficiency and effectiveness, and explains why marketing has no merged-PR equivalent.

## Commits
- 264920b feat(07-01): first screen, spine registration, opening tests, deliberate page-test updates
- c7374f2 feat(07-01): section 01 definition, capacity/effectiveness, merged-PR argument

## Honest headline values shown (engine claims, Modelled via asm-agency-fte-cost)
- Organisation-wide after the platform team: `econ-metric-org_after_platform` = 1.60x
- Delegated portfolio after the platform team: `econ-metric-portfolio_after_platform` = 1.99x
- Stated as this page's model results, "not a claim that 2x is achieved"; "Outcomes are never claimed to double". Falsifier kept in its OR form.
Claim ids matched the plan's table; no deviation in ids.

## v1 text reworded or wrapped
- Old #answer paragraphs (launch-rate 50 to 100, brief-to-live, cost per asset, +40% production cost, Gartner share, "has flatlined") moved verbatim in substance into `div#first-edition-scenario > details.maths` "The launch-rate scenario from the first edition" (split into two paragraphs for the chip limit; falsifier now lives in #answer only; a chip for asm-variant-cost added after the +40% figure so the chip rule holds).
- v1 s01 "Claim & measurement" two paragraphs wrapped in `details.maths` "The launch-rate measure from the first edition"; the sentence "It is an organisation total within a flat total marketing budget and flat headcount" now begins "In the first-edition scenario it is ...".
- Nothing deleted: all v1 ids, data-figs (with counts), figures and captions still resolve (inventory test green).

## Deliberate test changes (test/page.test.js)
- "answer-first paragraph is short and states the falsifier" became "answer states thesis and falsifier" (cap 260 words, OR falsifier kept).
- "copy nits": "has flatlined" now checked in #opportunity (it moved there).
- Tests that pinned figures in #answer (cost per asset and launch-rate figures, production cost rise and funding, Gartner year) now read `#first-edition-scenario`.
- Page date 2026-10-25 (meta, footer, allowed numeric token and meta test); access dates and register dates stay 2026-10-24.
- `P7_H3_OPPORTUNITY = 3` added on its own line beside the other plans' lines.

## Spine
`#opportunity` registered in SPINE (chain-pos bolds "Marketing capacity increased"; evidence-stop says the target definition is a choice and multiples are model outputs). CSS from 07-02 reused; added `.chain`, `.six-answers` and `dl.def-list` rules with existing tokens (12px mono scale kept).

## Verification
`node --test` 544 pass, 0 fail; `node scripts/crosscheck.mjs` 0 failures; `bash scripts/gates.sh` ALL GATES GREEN (first run; print at ceiling, 131 of 131 pages).

## Deviations from Plan
**1. [Rule 3 - Blocking]** Inventory counts forced the v1 answer figures to stay on the page; resolved by the first-edition disclosure above (Task 1 commit rather than Task 2).
**2. [Rule 2]** The 2x table and prose carry no digits (numeric gate); the plan's mention of Shapiro et al. / Lewis and Rao is summarised in words without a figure and links to #outcomes. No new sources or claims were added.

## Known Stubs
None.

## Self-Check: PASSED
Commits 264920b and c7374f2 present; opening.test.js exists.
