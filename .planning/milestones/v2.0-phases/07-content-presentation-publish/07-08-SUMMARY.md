---
phase: 07-content-presentation-publish
plan: 08
subsystem: content
tags: [outcomes, expansion, roadmap, risks, pilot, evidence-boundary]
requires: [07-07, 06-05]
provides:
  - "#outcomes: causal chain with an evidence boundary, three-tier scorecard, diminishing returns (two Benchmark sources), four defensible mechanisms"
  - "#expansion: adjacent workflows on the shared platform, reusable versus domain-specific"
  - "#roadmap: twelve-week pilot, next two quarters, twelve-month portfolio from engine claims, proven-versus-projected table, enablement"
  - "#risks: eight agent risks with mitigations or tests, eight more risk-register rows"
  - "test/later-sections.test.js"
affects: [07-09]
key-files:
  created: [test/later-sections.test.js]
  modified: [site/index.html, site/js/data.js, site/assets/style.css, test/page.test.js, test/spine.test.js, test/evidence.test.js, test/data.test.js]
key-decisions:
  - "Pilot targets and acceptance criteria are four kind 'context' assumptions, Speculative with hypothesis evidence, shown in a list under the pilot table (one chip per figure) because the chip rule allows one chip per table row"
  - "The twelve-month portfolio figures are data-fig spans on econ-metric and econ-scen claims; pooling is explained in prose and linked to #reconciliation; revenue is never computed from capacity"
  - "Lead sentences for v1 s09, s10 and s13 sit outside the hosted div so the v1 first-paragraph tests still hold"
requirements-completed: [OUT-01, OUT-02, OUT-03, EXP-01, EXP-02, ROAD-01, ROAD-02, ROAD-03, ROAD-04, RISK-01, STRUCT-07]
completed: 2026-10-25
---

# Phase 7 Plan 08: Outcomes, expansion, roadmap and risks Summary

The four later body sections are filled, each keeping its hosted v1 block (s10, s09, s13, s14) with all ids, captions and data-figs. The page now ends its argument with where the evidence stops: a visible boundary after "shorter objective-to-live", a pilot whose targets are graded hypotheses, a portfolio kept apart from anything the pilot proves, and agent-specific risks each with a test or mitigation.

## Commits
- c8e6f9f feat(07-08): outcomes causal chain, scorecard, diminishing returns and expansion tables
- e008e56 feat(07-08): roadmap with pilot, next two quarters, twelve-month portfolio and enablement
- e9daba8 feat(07-08): risks that come with agents, each with a mitigation or test

## New sources (both academic, Benchmark, evidence benchmark, accessed 2026-10-25)
- `shapiro-hitsch-tuchman-2021`: Econometrica 89(4), abstract read on the Econometric Society page. Claim `shapiro-negative-margin` (more than 80% of brands negative at the margin).
- `lewis-rao-2015`: QJE 130(4), abstract via the Crossref record (journal page returned 403). Claim `lewis-rao-ci-width` (median confidence interval over 100 percentage points wide).
Both register rows state the full text was not read and the scope limit (television for consumer goods; digital display).

## New pilot target assumptions (kind context, Speculative, hypothesis, with register rows)
- `asm-pilot-target-hours` 40% fewer human hours per market launched
- `asm-pilot-target-cycle` 50% shorter median objective-to-verified-live time
- `asm-pilot-escape-ceiling` 1% ceiling on escape rate in sampled outputs
- `asm-pilot-first-pass-floor` 80% floor on first-pass acceptance

## Deviations from Plan

**1. [Rule 3 - Blocking] Targets in a list, not in table cells.** The governing chip rule allows a table row with data-figs exactly one chip, with every figure sharing one ref. The Targets and Acceptance rows would each mix two refs, so those rows describe the measures and the four figures sit in a list directly under the table, each with a Speculative chip and a `.ev` hypothesis label.

**2. [Rule 3 - Blocking] "cycle time" is banned page-wide** (03.1 reframe guard). Scorecard row and register text use "elapsed time".

**3. [Rule 3 - Blocking] dd elements are not chip-rule units.** Enablement is a `ul` of `li`, not a `dl`.

**4. Lewis and Rao scope.** The paper is about how hard the return is to measure, not about diminishing returns, so the page cites it for the measurement point and says so. The compounding-error risk uses no numbers (the plan allowed quoting an example only if both numbers were bound to claims).

**5. Tasks 1 and 2 data held out of the first commit.** The four pilot assumptions and their register rows were temporarily held back from commit 1 so that crosscheck (unreferenced register row) stayed green; they landed with the page content in commit 2.

**6. Guards changed deliberately.** `page.test.js`: v1 s09 title and h3/h4 counts (+3 outcomes, +2 expansion, +4 roadmap, +1 risks h3; +8 risk h4), risk register now 14 rows with three new owner categories. `evidence.test.js` and `data.test.js`: sources 58, benchmark/Benchmark 15, assumptions 111, hypothesis/Speculative 13.

## Gate results
`node --test` 597 pass; crosscheck 0 failures (figures 729, chips 344, register rows 169); `bash scripts/gates.sh` ALL GATES GREEN first run; print 185 pages against ceiling 193 (not exceeded); a11y 700 focus stops against cap 1200 (not exceeded).

## Known Stubs
None.

## Threat Flags
None new. T-07-15: evidence-boundary marker tested (text label, one occurrence), pilot targets Speculative and hypothesis, proven-versus-projected table, no revenue computed from capacity. T-07-16: portfolio figures are data-fig on econ claims; crosscheck drift rule passes.

## Self-Check: PASSED
