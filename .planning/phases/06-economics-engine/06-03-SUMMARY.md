---
phase: 06-economics-engine
plan: 03
subsystem: page-and-data
tags: [economics, cash-view, concept-split, one-price-per-hour, derived-claims]
requires: [06-01]
provides:
  - legacy headcount scenarios on the cash view, change cost on 120 marketing FTE
  - asm-concept-hours, asm-marketer-rate, asm-productive-hours; reviewer rate derived (125)
  - derived v1 claims computed from compute() at module load (no typed values)
affects: [06-04, 06-05]
key-files:
  modified: [site/js/data.js, site/js/model.js, site/js/fields.js, site/index.html, scripts/crosscheck.mjs, test/data.test.js, test/model.test.js, test/calc-page.test.js, test/evidence.test.js, test/svg.test.js]
key-decisions:
  - "Internal hours per master concept 35.2 (orchestrator Q1), not 40"
  - "Legacy reduce scenario kept as computed (Q6); replaced in Phase 9"
  - "Capacity (cap-*) override claims keep typed literals: utilisation and hours do not move with the correction"
requirements-completed: [ECON-04, ECON-05, ECON-12]
completed: 2026-10-25
---

# Phase 6 Plan 03: v1 correction on the live page Summary

Two green commits move the page to the corrected economics: cash-view scenarios first, then the master-concept split and one price per hour with every moved figure, bar, register row and false sentence fixed together. 479 tests and crosscheck green on both commits (figures 350, chips 179, register rows 115).

## Before / after figures

| Figure | Before | After |
|---|---|---|
| Cost per approved asset base / 2x / change | $64.71 / $45.26 / -30% | $152.18 / $106.38 / -30% |
| Cost per campaign-market base / 2x | $12,943 / $9,052 | $30,436 / $21,276 |
| Total production-attributable cost base / 2x / delta | $2.59M / $3.62M / $1.03M | $6.09M / $8.51M / $2.42M (+40%) |
| Share of marketing budget base / 2x / delta | 3.3% / 4.6% / +1.3 points | 7.8% / 10.9% / +3.1 points |
| Generation per asset base -> 2x | 34.21 -> 22.06 | 116.71 -> 80.39 |
| Review per asset | 17.26 -> 9.68 | 21.58 -> 12.11 |
| Rework per asset | 3.22 -> 1.58 | 3.87 -> 1.94 |
| Tooling / rights / storage | 3.75->7.50 / 6.25->4.42 / 0.02 | unchanged (3.75->7.50 / 6.25->4.42 / 0.02) |
| Redeploy production change | +$1,032,041 | +$935,199 (cash view) |
| Hold production change | -$53,579 | +$295,053 (an increase, not a saving) |
| One-off change cost | $396,000 | $360,000 (120 marketing FTE, reviewers inside) |
| First-year net Redeploy / Hold / Reduce | $1,428,041 / $342,421 / $938,258 | $1,295,199 / $655,053 / $805,416 |
| Route effect, cost per asset at 2x: markets / both / campaigns | $37.75 / $45.26 / $55.88 | $81.78 / $106.38 / $141.16 |

Unchanged: brief-to-live 11.8 -> 7.5 days, AI spend, utilisation, break-even 41%, capacity floor 29%.

Sensitivity top five: same keys and order before and after (markets, mconcept, auto2, minutes, yield). Cost swings: markets +21.5% / -14.3% (was +18.3 / -12.2); agency fee -4.0% / +4.0% (was 9.4); auto2 3.1 (was 5.8); minutes 2.6 (was 4.9); yield +3.5 / -0.7 (was +6.7 / -1.3). The agency fee matters less now because it is a smaller share of activity cost.

## Sentences edited

- Hero: "funded by reallocating agency and production fees" -> "assumed to be funded from other marketing lines"
- s02 cost sentence: "Fully loaded, an approved asset falls from" -> "At activity cost (internal hours at one price per hour plus external spend), an approved asset falls from", plus a sentence with the 35.2 hours and a Modelled chip linking asm-concept-hours
- s02: "Production is a small line in the budget, so" -> "Even so,"
- Figure 1 panel label "fully loaded" -> "activity cost"; Figure 1 and Figure 8 desc texts, bar widths and value-label positions recomputed
- s11: row label "Change in external production spend (cash)"; Hold note now says "an increase" because the tooling rise outweighs the cheaper variants; results row "Activity cost per approved asset"; field and sensitivity label "Agency fee per master concept"; believe sentence "A master concept's agency fee is this much"
- Register: asm-reviewer-rate (125, derived), asm-master-concept-cost (agency fee only), asm-tooling (not inference), asm-loaded-fte-cost, asm-change-mgmt (reviewers inside the 120), asm-reallocation (display and basis rewritten, agency spend modelled as its own line); new rows asm-marketer-rate, asm-concept-hours, asm-productive-hours

## Deviations from Plan

**1. [Rule 1 - Bug] svg.test chartSpec fuzz used reviewers 12 with marketers 0.001.** The new reviewers <= marketers validation rejects it; the fixture now sets reviewers 0.001 too.

**2. [Rule 3] Plan line refs and test counts stale** after Phase 7 (index.html shifted; 476 tests at start, 479 now). Worked from current state; Figure 8 scaled bar stays 136 because svg.js snaps widths to 8px.

Task 1 was committed with the legacy scenarios; the plan's "failing tests first" for Task 2 was applied by writing the INV-2 and derived-pin tests in the same commit after the engine moved (they were verified against the computed values).

## Share-link limitation

An old link's `mconcept` parameter now restores the agency fee only, so a link shared before this change computes a different total (the internal hours at the marketer rate are added on top). STRUCT-03 fixtures still restore. Accepted as T-06-07.

## Known stubs

None. The cap-* override claims retain typed literals, re-checked by data.test under their own scenario (not moved by this correction).

## Commits
- cbd1417: legacy scenarios on cash view, change cost on 120 marketing FTE
- d373372: concept split, one price per hour, computed derived claims, corrected page

## Self-Check: PASSED
