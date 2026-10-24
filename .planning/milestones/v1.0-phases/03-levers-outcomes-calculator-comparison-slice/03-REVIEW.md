---
phase: 03-levers-outcomes-calculator-comparison-slice
reviewed: 2026-10-24T00:00:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - scripts/smoke.mjs
  - site/assets/style.css
  - site/index.html
  - site/js/data.js
  - site/js/fields.js
  - site/js/format.js
  - site/js/model.js
  - site/js/panels.js
  - site/js/state.js
  - site/js/svg.js
  - site/js/ui.js
  - test/calc-page.test.js
  - test/compare.test.js
  - test/data.test.js
  - test/model.test.js
  - test/page.test.js
  - test/state.test.js
  - test/style.test.js
  - test/svg.test.js
findings:
  critical: 1
  warning: 10
  info: 11
  total: 22
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-10-24
**Depth:** standard
**Files Reviewed:** 19 (site/js/calc.js read for call-chain tracing; unchanged in this diff)
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

The client-side security surface is sound. `parseHash` reads only fixed `FIELDS` keys and a whitelisted `scenario`, so prototype pollution or injection through the hash is not possible. Every DOM write uses `textContent` or `setAttribute` with internal ids. There is no `innerHTML`, no `.style` and no inline script, and the CSP meta (`script-src 'self'`) is consistent with the single module script. Vendor claims are Modelled and vendor-claimed and are never Benchmark. Vendor names stay in s12 and s15 (s09 hits are `href="#src-…"` attributes only). The statute illustration multiplies by master concepts, not variants. The win-rate range is presented by definition.

The main defect is in calculator correctness. The sensitivity perturbation rounds integer inputs, so for small realistic values (2 or 3 locales, 1 or 2 campaigns) the table shows moves that are not ±20%, or drops the most influential input entirely. That ranking also drives "What you must believe". Smaller issues: scenario-row grades are not the weakest grade of their inputs, field hints make "only" claims the model contradicts, a static "Hold saves little" sentence sits beside live numbers, one test is vacuous, and one hard-coded number escapes the numeric gate.

All 287 tests pass (`node --test`). Probes were run against the live modules to confirm CR-01, WR-02 and WR-04.

## Critical Issues

### CR-01: Sensitivity rounds integer inputs, so small values show moves that are not ±20% or vanish from the ranking

**File:** `site/js/model.js:210-225` (`perturb`), effect in `site/js/model.js:227-251` and `348-381`
**Issue:** For `kind === 'int'` fields, `perturb` does `v = Math.round(base * (1 ± 0.2))`. It sets `capped` only when the target is below 1. Confirmed by probe:
- `locales: 3` gives 2.4→2 and 3.6→4. These are −33% and +33% moves, shown under the column headers "at −20%" and "at +20%": costDown `+40.0%`, utilDown `−33.3%`. The cells are not marked capped.
- `locales: 2` gives 1.6→2 and 2.4→2. No move at all, so swing = 0 and **locales drops out of the top five**. It is the most influential input at defaults. It also disappears from "What you must believe", and `mconcept, campaigns, concepts` are marked "carries the result" instead.
- `campaigns: 2, concepts: 2` both vanish from the table the same way.

Many organisations have 2 or 3 locales. The table caption and headers promise "each input moved 20% down and up", and the ranking is presented as measured influence (CALC-05, CALC-02). The output is wrong in exactly the panel that tells the CFO what the result rests on.
**Fix:** `compute()` accepts non-integer positive volumes, so do not round in the sensitivity probe. If rounding has to stay, report the move that was actually applied and mark it.
```js
function perturb(field, base, step, ctx) {
  let v = base * (1 + step);          // no Math.round: compute() accepts fractional volumes
  let capped = false;
  let limit = field.kind === 'pct' ? 1 : Infinity;
  const mix = ctx.assumptions.tier_mix;
  if (field.key === 'auto1') limit = Math.min(limit, mix.baseline[0] + mix.baseline[1]);
  if (field.key === 'auto2') limit = Math.min(limit, mix.scaled[0] + mix.scaled[1]);
  if (v > limit) { v = limit; capped = true; }
  return { v, capped };
}
```
Add tests: `sensitivity({...d, locales: 2})` keeps `locales` first, and `locales: 3` gives `util.down` equal to −20% within 1e-9.

## Warnings

### WR-01: Scenario-row grades are not the weakest grade of their inputs

**File:** `site/js/model.js:261-266`
**Issue:** `people_cost_change` is graded by `asm-loaded-fte-cost` alone, but in Reduce it is `delta × loaded cost`, where `delta` depends on every UTIL input. `first_year_net` is graded by `asm-change-mgmt` alone, but it sums people, production (all COST deps) and change cost. The page states "Each output carries the weakest grade of the inputs it uses." Today every dependency is Modelled, so nothing visible is wrong. If any COST or UTIL input is re-graded Speculative (the test at `model.test.js:115` shows this is expected to propagate), the scenario table will still show Modelled.
**Fix:** Grade these rows from unions of their dependencies:
```js
const people = weakestGrade(['asm-loaded-fte-cost', ...OUTPUT_DEPS.utilisation], ctx.grades);
const net = weakestGrade(['asm-change-mgmt', 'asm-loaded-fte-cost', 'asm-marketing-fte', 'asm-reviewer-fte', ...OUTPUT_DEPS.total_cost, ...OUTPUT_DEPS.utilisation], ctx.grades);
```
Also add a test that injects a Speculative COST input and asserts `first_year_net` becomes Speculative.

### WR-02: Field hints say "only", but the model contradicts them

**File:** `site/index.html:825`, `site/index.html:830` (pinned by `test/calc-page.test.js:165-166`)
**Issue:** The Marketing FTE hint says "Changes output per head only." The Reviewer FTE hint says "Changes utilisation, cycle time and break-even only." Both inputs also change the scenario table: `oneOff = change_cost_per_fte × (marketers + reviewers)` (`model.js:196`), and reviewers change the required and freed FTE and the Reduce people cost. Probe: `marketers: 240` moves first-year net from $1,101,782 to $1,461,782. This misleads the reader on a page whose premise is transparent reasoning.
**Fix:** Reword, for example "Changes output per head and the one-off change cost." and "Changes utilisation, cycle time, break-even and the headcount scenario." Update the two test assertions to match.

### WR-03: The static "Hold saves little" sentence sits beside live scenario numbers

**File:** `site/index.html:998`
**Issue:** "Hold saves little, because higher tooling cost offsets cheaper variants." is true only at the defaults (−$53,579). Once the reader changes inputs (for example a lower `vcost` or a higher `mconcept`), the live Hold row can show a large saving or a cost increase. This static claim then contradicts the table next to it. `test/calc-page.test.js:249` pins the sentence.
**Fix:** Scope it to the defaults ("At the page defaults, Hold saves little…") or generate the sentence in `scenarioPresentation` from the sign and size of `production_cost_change`.

### WR-04: The overflow test is vacuous, and the overflow message path is untested

**File:** `test/state.test.js:51-55`
**Issue:** `validate({ ...defaults, campaigns: 1e9, concepts: 1e9, locales: 1e9 }, ctx)` returns `[]` (probe confirmed). Even with every input at its limit it returns `[]`. The loop and the `if (errs.length)` guard therefore assert nothing, and the "These inputs are too large to calculate." branch in `state.js:53` and `ui.js:151-159` is never exercised.
**Fix:** Drive the branch directly with a context that overflows, and assert on it:
```js
const big = { ...ctx, assumptions: { ...ctx.assumptions, reviewer_hours_per_fte_year: 1e-300 } };
const errs = validate(defaults, big);
assert.deepEqual(errs, [{ key: null, message: 'These inputs are too large to calculate.' }]);
```
If no context can produce it, say so in a comment and remove the dead UI copy.

### WR-05: The error summary (`role="alert"`) is rebuilt on every keystroke

**File:** `site/js/ui.js:144-163`, `site/js/ui.js:223-229`
**Issue:** For a touched field, every `input` event calls `update()` immediately and again 250 ms later. `showSummary` empties and refills the `role="alert"` container each time. It also removes and re-appends each `.field-error` and rewrites `aria-describedby`. Screen readers re-announce the alert on each content change, so a user correcting a value hears the full error list repeatedly while typing.
**Fix:** Update the alert only when the set of error messages changes. Compare a joined string of messages before rebuilding. Alternatively, refresh the summary only on `change` and update inline field errors on `input`.

### WR-06: The hard-coded "$3,000 per affected FTE" escapes the numeric gate and data.js

**File:** `site/index.html:879`; `test/page.test.js` (calc-form pre-strip); `test/calc-page.test.js:224` (`Change-management cost: [^<]*`)
**Issue:** The form is pre-stripped from the numeric gate, and the only test on this line matches `[^<]*`. The figure is not a `data-fig` and is not compared with `assumptions['asm-change-mgmt'].value`. If the assumption changes, the hint silently drifts. That breaks the single-source rule (CRED-06), which the pre-strip was supposed to keep narrow.
**Fix:** Put the figure in a `<span data-fig="asm-change-mgmt">$3,000 per affected FTE</span>`, or assert the exact text against `formatValue(assumptions['asm-change-mgmt'].value, 'usd0')`.

### WR-07: The winners-per-quarter claims hard-code their inputs, and the test mirrors the literals

**File:** `site/js/data.js:453-460`; `test/data.test.js:420-421`
**Issue:** `tests-winners-lo/hi` use `Math.round(20 * 0.10)` and `Math.round(20 * 0.33)` instead of `assumptions['asm-tests-per-quarter'].value`, `claims['winrate-second-hand'].value` and `claims['winrate-paper'].value`. The test repeats the same literals, so it is tautological. Change the cadence or a rate and the "2 to 7 winners" sentence goes stale while tests still pass.
**Fix:** Define the claims after `asm-tests-per-quarter` and derive them from those values. In the test, compute the expected values from `assumptions`/`claims`, not literals.

### WR-08: The share link and URL go silently stale while inputs are invalid

**File:** `site/js/ui.js:181-186`, `site/js/ui.js:200-202`, `site/js/ui.js:237-245`
**Issue:** When there are errors, `update()` returns before `shareLink.value` and `history.replaceState` run. The share field keeps the last valid scenario, and "Copy link" reports "Link copied." for numbers that are no longer on screen. A CFO-facing share of the wrong scenario is a credibility risk.
**Fix:** When errors exist, clear or disable the share field and copy button (for example `shareLink.value = ''; copy.disabled = true;`) and set `shareStatus` to "Fix the inputs to share a link." Re-enable them on the next valid update.

### WR-09: The `js` class is set before initialisation, so a runtime failure leaves a dead form and hides the no-JS note

**File:** `site/js/ui.js:11`
**Issue:** `document.documentElement.classList.add('js')` runs before any DOM lookups or `restore()`. If anything after it throws, the CSS (`.js .calc-nojs { display: none }`, `.js .calc-live { display: block }`) shows an unresponsive form and hides the explanation. Possible causes: a missing element after a markup edit, or an older engine without `Object.hasOwn`, which is only reached at runtime.
**Fix:** Move the `classList.add('js')` to after `restore()` succeeds, or wrap initialisation in `try { … } catch { document.documentElement.classList.remove('js'); }`.

### WR-10: An untouched invalid field blanks the results with no visible reason

**File:** `site/js/ui.js:177-185`; `site/index.html:1029`
**Issue:** While a user types into an untouched field (debounced `input` path), `visible` filters out that field's error. Results are dashed, the chart is replaced by "Fix the highlighted inputs to see the chart.", and the summary says results are unavailable, but no input is highlighted and no error is listed. This happens on every intermediate state, for example after clearing a field to retype it.
**Fix:** While errors are hidden because the field is untouched, keep the last valid results (do not call `dashResults`), or change the chart and summary text to say input is still being entered. Only dash results once an error is visible.

## Info

### IN-01: Values below 1e-20 round-trip to "0" and fail on restore

**File:** `site/js/state.js:59-62`
**Issue:** `toText` uses `maximumFractionDigits: 20`. `minutes = 1e-22`, which `coerce` accepts, serialises as `minutes=0`, and the restored link shows the "defaults were used" notice.
**Fix:** Reject values that `toText` cannot represent in `coerce` (for example require `toText(field, v)` to re-coerce to the same value), or set a sensible minimum.

### IN-02: The `'20%'` allow-list token is global, not scoped to s11

**File:** `test/page.test.js:236`
**Issue:** This is the documented narrow addition, but it lets any future unsourced bare "20%" anywhere on the page pass the numeric gate.
**Fix:** Strip "at ±20%" and "A 20% rise" only inside s11 rather than allow-listing the token page-wide.

### IN-03: The step size is duplicated as literal text

**File:** `site/js/model.js:375`; `site/index.html:1066,1069`
**Issue:** "A 20% rise" and the "at ±20%" headers are literals, while the code uses `SENSITIVITY_STEP`.
**Fix:** Build the text from `formatValue(SENSITIVITY_STEP, 'pct0')`, or add a test that ties them together.

### IN-04: The auto-approval cap message is built two different ways

**File:** `site/js/state.js:43-47`
**Issue:** `auto1` builds its message inline, and `auto2` uses `capMessage`.
**Fix:** Use `capMessage` for both.

### IN-05: The input handler can run `update` twice per keystroke

**File:** `site/js/ui.js:227-228`
**Issue:** For a touched field, it runs an immediate update and also schedules a 250 ms one.
**Fix:** Use `if (touched.has(key)) update(false, false); else tableTimer = setTimeout(…)`.

### IN-06: `keyFor` maps errors by parsing an English message

**File:** `site/js/model.js:53`
**Issue:** It decides `auto1` or `auto2` by checking `message.includes('(baseline)')`. Validation errors without that suffix (`calc.js:77`) always map to `auto2`.
**Fix:** Have `calc.js` return `which` on the error object, and key on that.

### IN-07: Vendor behaviour is stated as fact without attribution, and MEDIUM confidence is not surfaced

**File:** `site/index.html:1164`, `site/index.html:1257`
**Issue:** "every piece routes through human review before going live" and "It routes every piece…" assert the vendor's marketing as fact. Line 1199 attributes its claim with "Says…". The "listed on all three plans" claim is MEDIUM confidence per `sources['airops-pricing'].read_via`, but it reads as certain.
**Fix:** Change to "The enterprise page says every piece routes…" and add "(plan marks read from page markup)" or similar.

### IN-08: "Independent traffic studies" is applied to sell-side authors

**File:** `site/index.html:729-730`
**Issue:** Line 729 calls the studies "Independent", and the next paragraph says two of the three authors sell search or visibility services.
**Fix:** Use "Third-party traffic studies" or "Non-vendor traffic studies".

### IN-09: The smoke script's CDP calls have no timeout

**File:** `scripts/smoke.mjs:200-201`
**Issue:** If Chrome drops the websocket or never answers, `send()` never resolves and the smoke run hangs instead of failing.
**Fix:** Race each `send` against a timeout, and reject pending calls on `ws.onclose`.

### IN-10: Common entry forms are rejected

**File:** `site/js/state.js:6-7,21`
**Issue:** "$0.80" in a `$ per variant` field and ".5" both return "use digits only". The message is clear, but this is friction for exactly the fields that show a `$` unit.
**Fix:** Strip a leading `$` for `kind === 'usd'`, and allow `^\.\d+$`.

### IN-11: Error-summary links push history, and Back silently reverts typed inputs

**File:** `site/js/ui.js:156-157`, `site/js/ui.js:261-263`
**Issue:** `href="#in-…"` changes `location.hash` and adds a history entry. Back returns to `#s11?…`, which fires `hashchange`, and `restore()` overwrites the form with the last committed state and clears `touched`. Following an anchor also does not reliably focus the input.
**Fix:** In the summary link click handler, call `preventDefault()` and `inputs[key].focus()`, which is the standard error-summary pattern.

---

_Reviewed: 2026-10-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
