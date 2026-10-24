---
phase: 02-factory-spine-slice
plan: 06
subsystem: s07-capacity-s08-eval-harness
tags: [s07, s08, reviewer-capacity, fatigue, eval-harness, telemetry]
requires: [02-05]
provides:
  - s07 reviewer-capacity table (1x and 2x, with and without the gate), 41% break-even, 29% floor, reference-rate utilisation, fatigue controls
  - s08 with Figure 7 (eval-harness loop), "What the eval harness reports" table with relative thresholds, closing rule, telemetry block
  - 14 cap-* claims with override markers, recomputed by data.test under a test-local scenario table
  - assumptions asm-fatigue-controls (Speculative), asm-harness-design, asm-telemetry-metrics (Modelled)
affects: [02-07]
tech-stack:
  added: []
  patterns: ["claims carry an override { multiplier, auto_approval_share } and are skipped by the default-inputs recompute, then checked by their own scenario test"]
key-files:
  created: []
  modified: [site/js/data.js, site/index.html, test/data.test.js, test/page.test.js, test/diagram.test.js]
key-decisions:
  - "Capacity claims are literal values, re-derived in test from a scenario table written in the test body, not imported"
  - "Harness thresholds are relative wording only; zero numeric thresholds"
  - "Telemetry metrics are per asset, tier and queue, never per named reviewer"
requirements-completed: [SPINE-04, SPINE-05, SPINE-06, SPINE-07]
duration: ~25 min
completed: 2026-10-24
---

# Phase 2 Plan 06: Reviewer capacity and eval harness Summary

The spine is complete: s07 now shows that 2x without the auto-approval gate runs reviewers at 134.5% (over capacity) and 61.9% with it, and s08 shows how the gate is proven and kept safe through a ground-truth eval harness (Figure 7) and per-asset telemetry.

## Commits

- RED: 177440f `test(02-06): capacity, fatigue, harness and telemetry contract (RED)`
- GREEN s07: 2fbca6e `feat(02-06): s07 reviewer capacity and fatigue controls`
- GREEN s08: 8a4e573 `feat(02-06): s08 eval harness, Figure 7 and telemetry`

## Verification

`node --test`: 155 pass, 0 fail. Six diagrams (Figures 2-7), `class="later"` count 6 (s09 to s14), vendor-name grep 0, s03-s08 prose total within 2,800-4,200 and each of s07 and s08 within 400-700.

## Deviations from Plan

**1. [Process] All three new assumptions and their register rows landed in Task 2's commit.** The register-coverage test requires a row for every data.js entry, so asm-harness-design and asm-telemetry-metrics could not wait for Task 3. Task 3 is the s08 page content only.

**2. [Scope] Figure 7 added to EXPECTED_FIGURES** as the orchestrator instructed; the 02-06 plan's `7: 's08'` acceptance grep still matches.

## Known Stubs

None. s09 to s14 remain "Coming in a later update." skeletons by design.

## Threat Flags

None. T-02-23 to T-02-26 are covered by data.test scenario recompute, the zero-numeric-threshold harness table, the tested "not surveillance" sentence and the VENDOR_RE scan over s03-s08.

## Self-Check: PASSED

177440f, 2fbca6e and 8a4e573 exist; full suite green.
