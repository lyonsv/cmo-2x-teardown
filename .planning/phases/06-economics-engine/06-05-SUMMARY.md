---
phase: 06-economics-engine
plan: 05
subsystem: data
tags: [engine-claims, evidence-trace, crosscheck, guards, gates]
requires: [06-04]
provides:
  - engineClaims(ec) in data.js, generating 300 econ-* claims from economics(), sensitivity() and compute()
  - formats x2, num2, years1
  - evidence trace over kind 'engine' rows (one variant per row), engine-aware v1 variants
  - lazy grade getter on econ-* claims (weakest grade among traced inputs)
  - "no hand-typed model numbers" test and a crosscheck drift rule for every derived, calc or econ span
affects: [08, 09]
key-files:
  modified: [site/js/data.js, site/js/format.js, scripts/crosscheck.mjs, test/engine-data.test.js, test/evidence.test.js, test/data.test.js, test/crosscheck.test.js]
key-decisions:
  - "econ claim grade is a lazy getter: the declared grade lowered to the weakest grade among the assumptions the trace finds it depends on"
  - "Agent-state per-workflow claims ref asm-wf-wN-agent (hypothesis row) rather than asm-wf-wN; W5 refs asm-reviewer-fte"
  - "A derived claim can set side 'baseline' so a compute() baseline figure (reviewer slack today) is not treated as 2x"
requirements-completed: [ECON-01, ECON-03, ECON-06, ECON-07, ECON-08, ECON-09, ECON-10, ECON-11, ECON-12]
completed: 2026-10-25
---

# Phase 6 Plan 05: Engine claims, guards and phase gates Summary

Every engine output Phases 8-9 will show is now a generated claim: 300 `econ-*` claims whose value is read from `economics()`, `sensitivity()` or `compute()` (never typed), each with a register ref, a grade and a traced evidence class. A test and a crosscheck rule make hand-typed model numbers impossible to commit unnoticed. 538 tests green, crosscheck 0 failures (figures 391, chips 179, cites 97, register rows 162, unchanged since engine claims are not on the page yet), `scripts/gates.sh` ALL GATES GREEN on the first run.

## Tasks and commits

1. 03a9965: `engineClaims(ec)`, formats, engine-input evidence trace, grade getter, tests
2. fa2fe8b: crosscheck drift rule for all derived, calc and econ spans, planted-HTML mutation tests, "no hand-typed model numbers" test

## Claim families (300)

per-workflow 220 (10 workflows x current/agent x 11 fields), reviewer bridge 7, effects 6, scenarios 20, investment 9, metric 8, maximum multipliers 12, sensitivity 14 (adoption high is null and skipped), funding 4. Goldens asserted: B net 7,451,190; org after platform 1.60x; portfolio after platform 1.99x; slack baseline 4.21; funding coverage 3.7x.

## Evidence and grade results

- W1..W10 current-state claims: illustrative; agent-state, scenario, metric, sensitivity, effects, funding, max and investment claims: hypothesis; reviewer slack baseline: illustrative, other bridge claims hypothesis (they trace to asm-reviewer-fte and asm-review-minutes).
- Because the grade follows the trace, 12 scenario claims, 2 investment claims and 9 sensitivity claims are Speculative (everything that moves with the escape rate or severance months, including the net figures and run cost totals). The B one-off, both paybacks, severance and escape lines are Speculative as the plan required.
- Trace cost: about 0.3 s on first read of `evidence`, `inputs` or an econ `grade`; page load does not run it (tested: all three are getters; no browser module reads claims).
- Claims whose value is constant zero (no review, no AI cost, no agency) trace to no input by construction; the test exempts value 0.

## Requirement to test map

| Req | Tests |
|-----|-------|
| ECON-01 | workflows.test: "agent state goldens", "every state carries the contract keys", "fixture rows satisfy fte x 1,600 = units x h"; engine-data.test: "econ claims: ... values computed exactly" |
| ECON-02 | workflows.test: "INV-1 ... every pool", "INV-7", "INV-8" (still Pending in REQUIREMENTS: owned by 06-02, not listed in this plan) |
| ECON-03 | economics.test: "capacity bridge goldens (ECON-03)"; workflows.test: "reviewer bridge equals compute().capacity_bridge"; engine-data.test goldens (bridge slack 4.21) |
| ECON-06 | economics.test: "INV-9" x2; engine-data.test: effects claims recomputed |
| ECON-07 | workflows.test: "scenario A ...", "scenario B goldens", "scenario C goldens"; engine-data.test: econ-scen-* values |
| ECON-08 | workflows.test: "primary metric at defaults", "W5 is not in the numerator"; engine-data.test: metric goldens |
| ECON-09 | workflows.test: "scenario B goldens" (investment, payback), "INV-5/6"; evidence.test: econ-inv Speculative grades |
| ECON-10 | workflows.test: "sensitivity rows/goldens/ranking"; engine-data.test: sensitivity claims |
| ECON-11 | workflows.test: "maximum sustainable multipliers per pool, reviewers and uniform"; engine-data.test: econ-max-* claims |
| ECON-12 | data.test: "no hand-typed model numbers"; crosscheck.test: three planted-drift mutations; economics.test: rework rate finite per side; evidence.test: econ evidence, grade, lazy-trace tests |

## Honest headline numbers for Phase 9

- Primary metric, organisation-wide: 1.60x after the platform team, 1.65x before. Delegated portfolio (W2, W4, W6, W9): 1.99x after, 2.18x before. Pooled hours multiple 1.47x. B org 1.34x, C org 1.32x.
- Uniform multiple every workflow can carry at once: 1.0x (W8 traffic cap); 1.54x excluding traffic-capped work (W3 binds).
- Inference about $9.6k a year at defaults (about $10k).
- Scenario B net +$7.45M a year (39.0 removable FTE, one-off $4.79M including $2.93M Speculative severance, payback 0.64 years simple, 1.28 ramped); scenario C net +$15.5M; scenario A net -$2.13M (run cost, no cash saving).
- These differ from the CONTEXT expectation of about 1.4-1.5x organisation-wide and about 1.8x portfolio because the primary metric puts agency FTE-equivalents in the denominator and takes baseline reviewer slack out of the saving (06-RESEARCH Summary point 3); the portfolio and org figures are higher before the platform team's cost is netted off.

## Gate results

`bash scripts/gates.sh`: node --test, crosscheck, smoke, a11y (483 tab stops, 320px and text-spacing checks) and print (128 pages against a ceiling of 131, no blank pages) all passed on the first attempt. No CDP flake occurred. The print ceiling was not raised: no register rows were added by this plan.

## Deviations from Plan

**1. [Rule 1 - Bug] Output paths differ from the interfaces table.** Metric figures live at `metric.A.*`, `metric.B.org`, `metric.C.org`; scenario payback and run cost at `scenarios.X.payback_simple` and `run_cost.total`; investment run lines at `investment.run.B.*`; max-multipliers per pool at `.multiple`; sensitivity cells are `rows[i].{low,high}.{org_A_after,net_B}`. Claims use the real paths (sensitivity addressed as `sensitivity.rows.<i>...`).

**2. [Rule 2] Grade is derived, not typed.** The plan's grade rule test would fail for any net or run-cost claim that moves with the Speculative escape rate, so econ grades are lowered lazily to the weakest traced input. Bridge ids (reviewer bridge) follow the compute() baseline.

**3. [Rule 1] Existing "derived claims equal compute()" test** rounds to `decimals`; econ derived claims keep exact values, so that test skips `econ-` ids and the new "no hand-typed" test covers them exactly.

**4. [Rule 1] Trace grade lookup** handles per-side input ids (`asm-x#baseline`) by stripping the suffix.

**5. Counts.** The plan quotes sources 56, assumptions 106, 525 tests; tests are now 538. Nothing else was stale.

## Known Stubs

None. Engine claims are not on the page yet; Phases 8-9 bind spans to them.

## Threat Flags

None. T-06-10: values read from engine paths, recompute test, source-text literal test and crosscheck drift rule over all derived/calc/econ spans. T-06-11: trace stays lazy.

## Self-Check: PASSED

Commits 03a9965 and fa2fe8b present; `node --test` 538 pass; crosscheck 0 failures; gates.sh green.
