---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 06
subsystem: calculator
tags: [calculator, live, url-hash, validation, csp, tdd, smoke]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: fields.js, model.js present(), static s11 results (03-05)
provides:
  - state.js (coerce, validate, parseHash, serialiseHash, toText, changedCount), pure and tested
  - s11 form (4 fieldsets, 12 fields), error summary and share panel in .calc-live wrappers
  - ui.js live binding (214 lines), CSP with script-src 'self', single module script
  - scripts/smoke.mjs headless Chrome gate
affects: [03-07, 03-08]
key-files:
  created: [site/js/state.js, site/js/ui.js, scripts/smoke.mjs, test/state.test.js]
  modified: [site/index.html, site/assets/style.css, test/page.test.js, test/calc-page.test.js, test/style.test.js]
key-decisions:
  - "Cross-field auto-approval caps are checked in validate() before run(); run() errors for the same key are not duplicated"
  - "A hash that starts #s11? counts as restored even if every value is invalid (still scrolls and focuses s11, and names the defaults used)"
  - "Summary text is debounced to 400ms, table to 250ms; commits (change, reset, restore) write immediately"
requirements-completed: [CALC-01, CALC-07]
duration: 55min
completed: 2026-10-24
---

# Phase 3 Plan 6: Live calculator, URL hash and smoke gate Summary

The calculator is live: 12 labelled inputs recompute baseline vs 2x results, invalid or empty inputs show field-named messages and em dashes instead of stale numbers, non-default inputs are written to `#s11?key=value` and restored on load and on `hashchange`, all under a `script-src 'self'` CSP with one module script.

## Tasks

1. Task 1, commit 88330b6: state.js and test/state.test.js (coercion table, caps, hostile `__proto__`/`constructor` keys, 200-set round trip, no-NaN fuzz, source scan).
2. Task 2, commit 487f93b: form markup (generated from FIELDS and data.js so labels, defaults and chip grades cannot drift), three `.calc-live` wrappers, form CSS within tokens, exact CSP string, single script tag, tests for order, wrappers and script contract.
3. Task 3, commit 53d3cfd: ui.js, scripts/smoke.mjs, source-scan and import-scan tests.

## Verification

- `node --test`: 243 tests, 0 failing.
- `node scripts/smoke.mjs` (exit 0):
  - PASS a defaults render (class js, summary "At 2x, your team approves 167 variants...", cost span equals present())
  - PASS b hash restores inputs (status "Showing: your numbers (2 changed)", cost span equals present() for locales=6, auto2=70)
  - PASS c bad hash value ("defaults were used for: Locales")
  - PASS d JS off (no class js, calc-nojs note and static spans present, .calc-live hidden)
  - PASS e zero reviewers in link (notice names Reviewer FTE)
  - PASS f typed zero (extra case): field error text, em dash cells, no NaN, hash untouched
  - PASS j hashchange on an open page ("(1 changed)", locales input 7)
- `grep` for innerHTML, `.style.`, storage, cookies, fetch, eval in ui.js returns 0; one `<script`, no `on*=`, no `style="`.

## Deviations from Plan

**1. [Rule 3 - Blocking] JS-off case uses CDP, not --dump-dom:** `--dump-dom` with `--blink-settings=scriptEnabled=false` returns an empty document. Case d now uses `Emulation.setScriptExecutionDisabled` over the same CDP helper as case j. Plan constraint on Node built-ins and local Chrome is still met.

**2. [Rule 2 - Coverage] Extra smoke case f:** a CDP-dispatched `change` with a zero value covers the typed-zero path that a hash cannot reach.

**3. [Rule 1 - Test] CSS test constraint:** the existing "no `outline: none`" test forbids that string, so `.control input:focus` uses `outline: 0`, with the visible ring drawn by `.control:focus-within`.

**4. [Plan detail] Hint copy:** pct hints read "Default 95%." (with sign); the concepts hint carries "With locales, this gives the page's average campaign." and reviewer and marketing FTE hints state what they change only.

## Notes for 03-07 and 03-08

- Scenario radios are not in the DOM yet; ui.js keeps `scenario` in a variable and parseHash/serialiseHash already handle it. 03-07 should read the radios in `read()` and set them in `fillInputs()`.
- `.calc-live` wrappers surround only form, errors and share. Insert later results/figure/maths/believe/sensitivity between the results table notes and `#calc-share-wrap`; the wrapper test guards this.
- ui.js is 214 of the 300-line limit.

## Known Stubs

None. The summary `<output>` static text remains until JS runs, by design.

## Threat Flags

None beyond the plan's register. T-03-16 to T-03-21 mitigated: textContent only, FIELDS allow-list with prototype-key test, pinned CSP and script tests, 1e9 bound and strict regex, no storage or network, status line names changed count and invalid values.

## Self-Check: PASSED

Files exist: site/js/state.js, site/js/ui.js, scripts/smoke.mjs, test/state.test.js. Commits 88330b6, 487f93b, 53d3cfd exist. `node --test` and `node scripts/smoke.mjs` pass. No server or Chrome left running.
