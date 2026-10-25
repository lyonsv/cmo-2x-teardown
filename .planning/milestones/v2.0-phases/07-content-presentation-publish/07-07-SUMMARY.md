---
phase: 07-content-presentation-publish
plan: 07
subsystem: calculator
tags: [calculator, scenarios, share-links, legacy-mapping]
requires: [07-06, 06-03, 06-05]
provides:
  - "Calculator scenarios A (same team, more output), B (same output, lower cost), C (growing demand, limited hiring; default)"
  - "LEGACY_SCENARIOS map: redeploy to a, hold to b, reduce to b"
  - "calc-scen-{a,b,c}-* claims; static #s11 scenario table is C"
affects: [07-09]
key-files:
  modified: [site/js/model.js, site/js/state.js, site/js/fields.js, site/js/ui.js, site/js/data.js, site/index.html, scripts/smoke.mjs, test/model.test.js, test/state.test.js, test/share-links.test.js, test/calc-page.test.js, test/data.test.js, test/page.test.js, test/fixtures/retired.json, test/fixtures/v1-share-links.json]
key-decisions:
  - "Avoided hires use the engine's capacity_bridge.avoided_hires (hires beyond today's team), not without minus with"
  - "Scenario C net cost is against today and does not net the avoided hire cost (it is against a no-programme plan)"
requirements-completed: [ECONP-05]
completed: 2026-10-25
---

# Phase 7 Plan 07: Calculator on scenarios A/B/C Summary

The #s11 calculator now speaks the same scenario language as the economics section, with every existing input, the share link, show-the-maths and focus behaviour unchanged. All its scenario figures are labelled as the pilot slice and are not added to the portfolio figures.

**Commit:** 6a932a8 feat(07-07): calculator on scenarios A/B/C with legacy share-link mapping

## What changed
- **Model:** `SCENARIOS = ['a','b','c']`, `LEGACY_SCENARIOS`, default C. `scenarioOutcomes` per mode from `capacity_bridge`: A reports the largest multiple the reviewers can carry (2.7x at defaults); B reports removable reviewer FTE (3.4, attributable to the programme only, baseline slack excluded) priced at the loaded cost as a capacity figure; C reports reviewers needed without (15.6) and with (8.7) the programme, hires avoided (3.6) and their annual cost ($535,604). Each mode has six presenter rows with the weakest-grade logic as before.
- **State:** `parseHash` maps legacy values then applies the allow-list; the writer only emits a, b (C is the default and is omitted). Label is now "Scenario".
- **Page:** radios a/b/c with C checked, caption "Scenario: C: growing demand, limited hiring", static rows for C, a pilot-slice sentence linking to #scenarios, and a note bound to `calc-scen-c-avoided_hires`. `ui.js` rewrites row labels and data-fig ids per scenario.
- **Claims:** `calc-scen-{a,b,c}-<row>` generated from the presenter; the old `calc-scen-*` and `calc-scen-hold-*` ids and the old caption are in `retired.json` with the reason.
- **No "fully loaded" label remains** in model.js or fields.js.

## Deviations from Plan

**1. [Rule 1 - Bug] Avoided hires definition.** The plan's behaviour says avoided = without minus with. At defaults that is 6.8 FTE, but the team has 12 reviewers and 15.6 are needed without the programme, so only 3.6 hires are actually avoided; 6.8 would overstate by counting existing capacity. `avoided_hires` uses `capacity_bridge.avoided_hires`, matching the reconciliation in section 05. `reviewer_fte_without` and `reviewer_fte_required` show both sides. Identity at multiplier 1 is tested finite and equal to the bridge value.

**2. [Rule 3 - Blocking] Tasks 1 and 2 committed together.** Changing the allow-list and defaults alone leaves the page, claims and inventory tests red, and every commit must be green, so both tasks are one commit.

**3. Scenario C people cost.** If the programme still needs hires beyond the team, C prices them (people cost change, positive); zero at defaults. Net is against today and excludes the avoided hire cost.

**4. Test guards.** The ui.js size guard (under 300 lines) required compacting `writeScenario`. The scenario ref-parity test now asserts every ref any scenario can cite is linked from the one note.

## Behaviour notes
- v1 share links with `scenario=` restore to a, b, b and are rewritten as a or b. **v1 links without `scenario=` now open in C** (previously Redeploy); documented in the share-links test.
- Smoke still navigates to the legacy `#s11?scenario=hold` link and asserts the B caption and radio.

## Gate results
`node --test` 580 pass; crosscheck 0 failures (figures 708, chips 310, register rows 163); `bash scripts/gates.sh` ALL GATES GREEN first run; print 168 pages against ceiling 193 (not exceeded).

## Known Stubs
None.

## Threat Flags
None new. T-07-13: legacy lookup then allow-list; `Object.hasOwn` guards prototype keys (`scenario=toString` tested to fall back to C). T-07-14: slice-scope sentence and tests comparing static rows to `present()`.

## Self-Check: PASSED
