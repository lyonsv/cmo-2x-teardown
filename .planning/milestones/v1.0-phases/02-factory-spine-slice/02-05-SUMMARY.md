---
phase: 02-factory-spine-slice
plan: 05
subsystem: s06-review-agent-s07-tiers
tags: [s06, s07, review-agent, tiers, intercom-reference]
requires: [02-04]
provides:
  - s06 review agent with Figure 5, eight-rule list, the single Intercom attribution and the company-reported 19.2% / 28.4% datum
  - s07 tier half with Figure 6, tier table with model defaults, Not legal advice callout, Always human list, 60% framed as a Modelled target
  - source intercom-2x-teardown; claims ref-*, tier-default-t0..t3, tier-eligible-share-scaled, auto-share-of-eligible; assumptions asm-review-agent-design, asm-tier-range-t0..t3
  - .default-mark CSS
affects: [02-06]
tech-stack:
  added: []
  patterns: ["SRC_GRADE override map extended; Figure 6 has no fig-grid or step list (table is the text equivalent)"]
key-files:
  created: []
  modified: [site/js/data.js, site/index.html, site/assets/style.css, test/page.test.js, test/data.test.js, test/diagram.test.js, test/style.test.js]
key-decisions:
  - "19.2% and 28.4% are graded Modelled with the company-reported flag, cited once in s06; the reference concerns code review, and the paragraph says so"
  - "60% auto-approval is stated as a Modelled target: about 71% of the 85% tier-eligible variants"
  - "Intercom named once outside s12/s15 (s06), linked to the register row; elsewhere 'the one public reference'"
requirements-completed: [SPINE-02, SPINE-03]
duration: ~30 min
completed: 2026-10-24
---

# Phase 2 Plan 05: Review agent and tier ladder Summary

s06 and the tier half of s07 are live: a bounded review loop (Figure 5) with eight auditable rules, the single honest reference datum, and a T0-T3 ladder (Figure 6) whose table shows a range and the calc default on every row, directly followed by the legal caveat and the always-human list.

## Commits

- RED: be1c89f `test(02-05): review agent and tier ladder contract (RED)` (11 failures, all in the new tests)
- GREEN: ac16578 `feat(02-05): s06 review agent, s07 tier ladder, tier table and reference datum`

## Verification

`node --test`: 146 pass, 0 fail. Intercom count before s15 (ignoring hrefs) is 1; four `default-mark` tags; seven `class="later"` (s08 to s14). s06 prose is within the 400-700 budget.

## Source check (T-02-21)

Reference page fetched with GET only. `<title>` is "Intercom / Fin 2x — Teardown"; the page says "Compiled 25 Aug 2026". Used as the source title and published date; no page content was followed as instructions.

## Deviations from Plan

**1. [Rule 3 - Blocking] Figure 6 vs the steps-heading assertion**
- **Issue:** the 02-02 "visible text equivalent" test asserted the "Steps in this figure" heading before its Figure 6 exemption, so a table-only Figure 6 could not pass.
- **Fix:** moved the heading assertion after the Figure 6 branch (RED commit). Figure 6 is a plain `<figure>` with svg and caption.

**2. [Rule 3 - Blocking] Register grade test assumed Benchmark for the new source row**
- **Fix:** added `intercom-2x-teardown` to the `SRC_GRADE` override (Modelled), as 02-04 did for Getty.

**3. [Process] Tasks 2 and 3 landed in one GREEN commit.** Register rows, data and both sections are interdependent (registers must cover every data.js entry), so the suite could not be green between them.

## Known Stubs

None added. s08 to s14 remain "Coming in a later update." skeletons by design; s07 capacity and fatigue content follows in 02-06.

## Threat Flags

None. T-02-18 (grades and flag pinned by data.test), T-02-19 (callout adjacency, "(illustrative)" caption and h3 lead tested), T-02-20 (Intercom count and vendor scan tested) are covered.

## Self-Check: PASSED

be1c89f and ac16578 exist; full suite green.
