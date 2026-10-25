---
phase: 06-economics-engine
plan: 01
subsystem: engine
tags: [calc, economics, capacity-bridge, decomposition, erlang-c]
requires: []
provides:
  - compute() cost_cash, cost_internal, reviewer_fte_required, capacity_bridge, effects, brief_to_live_days_pooled
  - erlangC, waitMMc, waitMM1, chainSuccess exports
  - rework_rate per-side read path in model.js
affects: [06-02, 06-03]
tech-stack:
  added: []
  patterns: [additive optional assumptions (absent = 0), null-with-reason for undefined decompositions]
key-files:
  created: [test/economics.test.js]
  modified: [site/js/calc.js, site/js/model.js]
key-decisions:
  - "Pooled queue servers capped at 2000 so extreme reviewer counts cannot loop for ever"
  - "Corrected fixture uses 35.2 internal hours per master concept (orchestrator Q1)"
requirements-completed: [ECON-03, ECON-05, ECON-06, ECON-12]
duration: 40min
completed: 2026-10-25
---

# Phase 6 Plan 01: Engine hardening Summary

Additive corrections to compute(): master-concept split (internal hours at the marketer rate plus agency fee), cash and internal-labour views, reviewer capacity bridge, scale-vs-programme decomposition, pooled queue bound, chain success, and the rework_rate read-path fix. No page figure moved (figures 346, chips 178, register rows 112; 476 tests green).

## New compute() output keys and goldens (corrected fixture: reviewer rate 125, 35.2 h x 93.75)

- `baseline/scenario.cost_cash` {concept_fee, variants, tooling, rights, storage, total}: baseline total 1,794,484.21, 2x 2,729,683.35, delta 935,199.14
- `cost_internal` {concept_hours, review, total}: baseline 4,292,631.58; cash + internal = cost.total on both sides
- `cost.total` baseline 6,087,115.79, 2x 8,510,272.32; cost per asset 152.1779 / 106.3784 (-30.1%)
- `reviewer_fte_required`: 7.785346 / 8.734778
- `capacity_bridge`: slack_baseline 4.214654; programme_added_load 0.949432; work_avoided 6.835913 (avoided_hires 3.570691 + unused 3.265222); removable_same_output 3.417957; required_programme_same_output 4.367389; required_without_programme 15.570691; max_multiple_at_target 2.747637; at_full 3.232514; without_programme 1.541357
- `effects.{total_cost,cost_per_asset,cost_per_campaign_market,brief_to_live_days}`: total_cost scale_effect +3,154,630.21, programme_effect -731,473.68; cost per asset scale_share 0.80036 (legacy fixture 0.642); brief_to_live scale parts null, reason `over_capacity`
- `brief_to_live_days_pooled`: 9.738979 / 4.758976 (M/M/1 upper bound 11.845828 / 7.524156 unchanged)
- Exports: erlangC, waitMMc, waitMM1, chainSuccess (0.66342 / 0.93237 / 0.85076)

## Deviations from Plan

**1. [Rule 1 - Bug] Plan golden max_multiple_without_programme 1.541362 is a typo.** 12 / 7.785346 = 1.541357; test asserts 1.541357.

**2. [Rule 1 - Bug] Pooled queue hang.** Uncapped Erlang recurrence made test/model.test.js (fuzzed reviewer counts) run indefinitely. Servers capped at 2000 (conservative). Fixed before the first commit.

Commits were split slightly differently from the task boundaries: commit 1 holds all calc.js work (both tasks) because the Task 2 calc.js additions were interdependent; commit 2 holds the model.js fix and the rework regression test (written red first, confirmed failing).

## Commits
- e47bfb8: calc.js engine additions and tests
- 14f3b94: model.js rework_rate per side and reviewer FTE from compute()

## Self-Check: PASSED
