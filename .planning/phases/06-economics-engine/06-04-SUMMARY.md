---
phase: 06-economics-engine
plan: 04
subsystem: data
tags: [engine-inputs, register, per-side-evidence, sources]
requires: [06-02, 06-03]
provides:
  - 42 kind 'engine' assumptions in data.js (23 globals, asm-productive-hours, 18 workflow rows) with grade, evidence, basis, cites
  - engineValues() and engineContext(ctx, values) matching the 06-02 contract
  - six new sources in the register
  - scripts/gen-register-rows.mjs (generated engine register rows between markers)
  - per-side evidence (evidence_sides) and per-side trace variants (id#baseline, id#scaled)
affects: [06-05]
key-files:
  created: [scripts/gen-register-rows.mjs, test/engine-data.test.js]
  modified: [site/js/data.js, site/index.html, scripts/crosscheck.mjs, test/data.test.js, test/evidence.test.js]
key-decisions:
  - "Engine rows carry their own evidence; the evidence post-pass skips rows that already have it"
  - "Per-side ref class: a claim reads a per-side ref on its baseline side unless built at 2x"
requirements-completed: [ECON-01, ECON-08, ECON-09, ECON-10, ECON-12]
completed: 2026-10-25
---

# Phase 6 Plan 04: Engine inputs and per-side evidence Summary

Every economics-engine input is now a graded assumption in `data.js` and a generated register row. `economics(engineContext())` reproduces the 06-02 goldens (A net -2,133,647; B net 7,451,190; C net 15,523,156; org after platform 1.600x; portfolio 1.989x; funding coverage 3.725). 525 tests green, crosscheck 0 failures (figures 391, chips 179, cites 97, register rows 162).

## New engine rows (kind 'engine', grade / evidence)

Hypothesis / Modelled: out-of-scope uplift, overhead share, autonomous share, adoption, year-1 realisation, build cost, platform team, autonomy overhead, counterfactual funded share, and the nine `asm-wf-wN-agent` rows. Hypothesis / Speculative: escape rate, severance months. Illustrative / Modelled: out-of-scope FTE, token price top tier, token price small tier, judge call, demand multiplier, traffic growth, agency FTE cost, minimum removable FTE, agency scales switch, chain success, portfolio workflows, nine `asm-wf-wN` rows. Illustrative / Speculative: cost per escape. asm-productive-hours (existing, illustrative) is now generated too.

## New sources (56 total, was 50)

anthropic-pricing-2026 and openai-pricing-2026 (vendor, vendor-claimed, observed); bls-software-developers-2025 (government, Benchmark, benchmark); tau-bench-2024 (academic, Modelled, benchmark); multi-agent-token-note-2025 and agency-billing-survey-2026 (vendor, vendor-claimed, observed). Each is cited from at least one engine row. No vendor name appears in any basis text.

## Updated counts

Sources 56 (benchmark/Benchmark 13, benchmark/Modelled 5, observed/Modelled 38). Assumptions 106: hypothesis 51 (Modelled 42, Speculative 9), illustrative 55 (Modelled 54, Speculative 1).

## Claims whose evidence class changed (hypothesis to illustrative)

cpa-base, cpcm-base, total-cost-base, budget-share-base (already illustrative), cpa-review-base, cpa-generation-base, calc-utilisation-base, calc-cost_per_asset-base, calc-total_cost-base, calc-brief_to_live-base and the other baseline-only cells. Claims on the 2x side or stating a change stay hypothesis. No claim value or display changed; `defaultInputs()` and `defaultAssumptions()` keep their key sets (asserted).

## Deviations from Plan

**1. [Rule 3] Counts stale.** The plan quotes 45 to 51 sources and 65 assumptions; after Phase 7 the base was 50 sources, so the total is 56; assumptions 65 + 41 new = 106.

**2. [Rule 1] Basis text avoided the words "cycle time"** (a page guard forbids them); workflow rows say "days elapsed from request to delivery".

**3. Crosscheck justification.** Engine rows without a page link are justified by a computed rule in `crosscheck.mjs`. Because the rule is computed, a future link does not trigger a stale-justification failure for engine rows (a row either is referenced or is covered by the rule).

**4. Source register rows were written once by a scratch script and committed as hand rows** (sources are not generated); engine rows are generated.

**5. Acceptance grep `#baseline` in data.js returns 0** because the variant id is built as a template string (`${asm.id}#${side}`); behaviour is covered by `test/evidence.test.js`.

## Known Stubs

None.

## Threat Flags

None. T-06-08: generator escapes every string and builds cite links only from known source keys (throws on unknown). T-06-09: allowed-pairs test on every engine row, crosscheck compares register evidence cells with data.js.

## Commits

- be58e93: engine assumptions, engineContext(), sources, generated register rows
- 8cf7241: per-side evidence and per-side trace

## Self-Check: PASSED
