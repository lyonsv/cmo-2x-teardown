---
phase: 06-economics-engine
plan: 02
subsystem: engine
tags: [workflows, economics, scenarios, ledger, metric, sensitivity]
requires: [06-01]
provides:
  - economics(ec, levers) portfolio engine (W1-W10 states, pools, bridges, scenarios A/B/C, investment, ledger, funding, metric, max multipliers)
  - sensitivity(ec), checkLedger(rows), sumLedger(rows, scope), validateEngine(ec), workflowState, currentState, WORKFLOW_IDS
affects: [06-04, 06-05]
tech-stack:
  added: []
  patterns: [one bridgePool identity for every scenario, ledger rows with counted_in and scope, fail-closed validation, function declarations only for cycle-safe re-export]
key-files:
  created: [site/js/workflows.js, test/workflows.test.js]
  modified: [site/js/calc.js]
key-decisions:
  - "Engine context ec follows the 06-02 contract exactly; 06-04 builds it from data.js"
  - "Ledger rows are scoped per scenario (scenario field) so B savings and C avoided cost on the same agency line never sum together"
requirements-completed: [ECON-01, ECON-02, ECON-03, ECON-04, ECON-07, ECON-08, ECON-09, ECON-10, ECON-11]
duration: 50min
completed: 2026-10-25
---

# Phase 6 Plan 02: Portfolio engine Summary

Pure, DOM-free `site/js/workflows.js` (795 lines) re-exported from `calc.js` by one `export * from './workflows.js'` line. One function, `economics(ec, levers)`, now produces every labour and financial figure Phases 8-9 will show. No data.js or page change; 514 tests green, crosscheck 0 failures (figures 346, chips 178, register rows 112, unchanged).

## Headline numbers at defaults (all graded Modelled / hypothesis, none observed)

- Primary metric, org-wide: **1.648x before, 1.600x after the platform team**. Delegated portfolio (W2, W4, W6, W9): **2.182x before, 1.989x after**. Pooled-hours multiple 1.4706x. B org 1.342x, C org 1.323x.
- Uniform multiple every pool can carry: **1.0x** (W8 traffic cap); 1.538x excluding traffic-capped work (W3 binds). Reviewers bind at 2.7476x (3.2325x at 100% utilisation, 1.5414x without the programme).
- Scenario A: no cash saving, net -$2,133,647 a year (run cost); agency budget binds on W2, W3, W4, W6, W9 and would imply $5.35M of agency growth.
- Scenario B: 39.018 removable FTE, labour saving $5,852,694, agency saving $3,600,000, run cost $2,001,503, net **+$7,451,190**; one-off $4,786,347 (incl. $2,926,347 Speculative severance); payback 0.64 years simple, 1.28 ramped.
- Scenario C (default): avoided cost $17,635,604, run $2,112,448, net **+$15,523,156**; hires 79.57 without, 10.0 with; position versus today still +$11,912,448; payback 0.12 years.
- Inference is about **$9.6k a year** at default usage; x5 moves B net by about -$39k. The platform team ($1.2M), tooling ($450k), autonomy review overhead ($240k) and escapes dominate run cost.
- Funding check: slice cash rise $935,199, reducible agency $3.6M, netted $116,211, coverage 3.73x (cross-scope ratio).
- Sensitivity ranking by B-net swing: adoption, review overhead, escape, inference (inference smallest).

## Tasks and commits

1. f2c88c4: states, pools, capacity bridge, roll-up, maximum multipliers, validateEngine, calc.js re-export
2. dcdc7c6: scenarios A/B/C, investment and payback, ledger, checkLedger, sumLedger, funding
3. 5263cc8: primary metric and sensitivity

Every research golden is a passing test, including INV-1, INV-3, INV-5, INV-6, INV-7, INV-8, INV-10 by name.

## Deviations from Plan

**1. [Rule 1 - Bug] Plan golden `reviewers without_programme` 1.541362 is a typo.** 12 / 7.785346 = 1.541357 (same typo 06-01 corrected). Test asserts 1.541357.

**2. [Rule 3] `bridge` is taken from compute() at the scenario multiplier, not multiplier 1.** The programme-added load (0.949432) only exists at 2x; the multiplier-1 call is used for Req0, ReqP1 and linear volume scaling.

**3. Crosscheck count.** The plan quotes figures 334; the merged main (07-02/07-03) reports 346 figures, chips 178, register rows 112. Unchanged by this plan.

No golden from the research differed otherwise; all sensitivity cells matched within the stated tolerances on the first run, which supports reading `sampling_rate` and `escalation_rate` scaled on both sides by the review-overhead lever.

## Notes for 06-04 / 06-05

- Extra outputs beyond the plan: `rollup` (hours, lo/hi, 1.8018x on the 80 FTE), `pool_totals` (INV-8), `workflows.W5.agent_at_multiplier`, `scenarios.*.bridge`, `scenarios.C.labour.per_pool` (with `gap` and `identity_gap`), `scenarios.B.labour.fragmented`, `metric.definition`.
- INV-7 holds exactly only where without-programme demand is at or above pool size (all ten pools at defaults); a pool with baseline slack at low demand would report that slack in `unused`.
- Share-link note unchanged from 06-01.

## Known Stubs

None.

## Threat Flags

None. T-06-03: validateEngine plus allFinite guard plus try/catch, fail-closed. T-06-04: checkLedger enforced inside economics(); it returns `{ ok: false, errors }` if its own ledger fails.

## Self-Check: PASSED

Files exist (workflows.js, workflows.test.js, calc.js re-export line), commits f2c88c4, dcdc7c6, 5263cc8 present, `node --test` 514 pass, crosscheck 0 failures.
