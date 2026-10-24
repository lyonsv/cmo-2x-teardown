---
phase: 03-levers-outcomes-calculator-comparison-slice
fixed_at: 2026-10-24T00:00:00Z
review_path: .planning/phases/03-levers-outcomes-calculator-comparison-slice/03-REVIEW.md
iteration: 1
findings_in_scope: 22
fixed: 22
skipped: 0
deferred: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-10-24
**Source review:** .planning/phases/03-levers-outcomes-calculator-comparison-slice/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 22 (CR-01, WR-01 to WR-10, IN-01 to IN-11)
- Fixed: 22
- Skipped: 0
- Deferred: 0. No fix needed a design-token change or a large copy change.
- Tests: 287 before, 293 after, all passing (`node --test`).
- Smoke: 11 cases before, 14 after, all passing (`node scripts/smoke.mjs`). New cases are `l`, `m` and `n`, and case `h` gained the share-link and summary-link checks.
- `node --test` and the smoke run passed after every fix. No static servers or headless Chrome were left running.
- Each fix is one commit (`fix(03): <id> ...`), with hooks on. The commits were made in a worktree and fast-forwarded onto `main`. Nothing was pushed.
- Gates were tightened, never loosened. The data-fig drift, chip↔grade and vendor-name checks are unchanged. The numeric gate is narrower in two places (WR-06, IN-02).

## Fixed Issues

### CR-01: Sensitivity rounds integer inputs

**Files modified:** `site/js/model.js`, `test/model.test.js`
**Commit:** cae9df7
**Applied fix:**
- `perturb()` no longer rounds `int` fields. `compute()` accepts fractional volumes, so each move is exactly ±20% and the column headers stay true.
- Bounded inputs (percentages, and the auto-approval T0+T1 caps) are still clamped, and their cells are still marked `capped`.
- New tests:
  - at 2 locales, `locales` still ranks first;
  - at 2 and 3 locales, `util.down` is −20% and `util.up` is +20% (within 1e-9) and neither cell is capped;
  - at campaigns 2 and concepts 2, both still rank and both move.
- The page defaults are unchanged, because 5 locales already moved exactly.

**Status:** fixed: requires human verification (logic change in the ranking that drives "What you must believe")

### WR-01: Scenario-row grades are not the weakest grade of their inputs

**Files modified:** `site/js/model.js`, `test/model.test.js`
**Commit:** ff40a2d
**Applied fix:**
- People cost is now graded by `asm-loaded-fte-cost` plus the UTIL inputs.
- The one-off change cost is graded by `asm-change-mgmt` plus marketing FTE and reviewer FTE.
- First-year net is graded by the union of change-mgmt, loaded cost, both FTE inputs, COST and UTIL.
- At the shipped grades the chips and refs are unchanged.
- New test: re-grading a COST, a UTIL or an FTE input to Speculative carries that grade through to the right rows.

**Status:** fixed: requires human verification (logic)

### WR-02: Field hints say "only", but the model contradicts them

**Files modified:** `site/index.html`, `test/calc-page.test.js`
**Commit:** 2d8c369
**Applied fix:**
- Marketing FTE hint: "Changes output per head and the one-off change cost."
- Reviewer FTE hint: "Changes utilisation, cycle time, break-even, the capacity floor and the headcount scenario, but not production cost."
- Both hints were checked against the model with a probe.
- The test now bans the word "only" in any field hint and pins the new wording.

**Status:** fixed

### WR-03: The static "Hold saves little" sentence sits beside live numbers

**Files modified:** `site/index.html`, `site/js/data.js`, `test/calc-page.test.js`, `test/data.test.js`
**Commit:** a234a2d
**Applied fix:**
- The sentence now reads: "At the page defaults, Hold changes annual production cost by only <data-fig −$53,579> <Modelled chip>, because higher tooling cost offsets cheaper variants; choose Hold above to see the figure for your inputs."
- New claim `calc-scen-hold-production_cost_change`. It is built from `present({...defaults, scenario: 'hold'})`. The data.test calc-path resolver handles the new `scenarioHold.*` head.
- Tests:
  - the exact sentence and chip are pinned;
  - the unscoped "Hold saves little" is banned.

**Status:** fixed: requires human verification (copy)

### WR-04: The overflow test is vacuous

**Files modified:** `test/state.test.js`
**Commit:** 67de1f1
**Applied fix:**
- The test now asserts that all volumes at 1e9 return `[]` at the shipped assumptions.
- It drives the overflow branch with `reviewer_hours_per_fte_year: Number.MIN_VALUE`, and asserts the exact key-null message.
- A comment notes that, with inputs capped at 1e9, reader inputs cannot reach this branch. The branch and its UI copy are kept as a defensive guard.

**Status:** fixed

### WR-05: The error summary (`role="alert"`) is rebuilt on every keystroke

**Files modified:** `site/js/ui.js`, `scripts/smoke.mjs`
**Commit:** 745cf4d
**Applied fix:**
- `showSummary` rebuilds only when the joined set of `key + message` changes.
- `showFieldErrors` leaves a field's error node alone when its text is unchanged.
- New smoke case `l`: retyping values that keep the same error makes 0 DOM mutations in the alert and the field. Changing the error does update it. The case was confirmed to fail on the old `ui.js` (20 mutations).

**Status:** fixed

### WR-06: Hard-coded "$3,000 per affected FTE" escapes the numeric gate

**Files modified:** `test/calc-page.test.js`, `test/page.test.js`
**Commit:** 0bc163d
**Applied fix:**
- A `data-fig` span was tried first. It breaks the existing rule that no `data-fig` may sit inside `.calc-live`, so it was dropped.
- Instead, the hint is pinned exactly to `assumptions['asm-change-mgmt'].display`, and `display` is checked against `formatValue(value, 'usd0')`.
- The numeric gate no longer strips the whole calculator form. It exempts only two strings:
  - the leading "Default N" of each field hint (already pinned to data.js through `toText`);
  - the change-management sentence, built from data.js.
- Probes confirmed that changing the amount to $4,000, or adding a numeral to any hint, now fails the gate.

**Status:** fixed

### WR-07: Winners-per-quarter claims hard-code their inputs

**Files modified:** `site/js/data.js`, `test/data.test.js`
**Commit:** 982cdb1
**Applied fix:**
- `tests-winners-lo` and `tests-winners-hi` are now computed after the claims object, from `asm-tests-per-quarter` × `winrate-second-hand` and × `winrate-paper`.
- The test takes its expected values from data.js. It also asserts that lo and hi use the minimum and maximum reported rates, and that the source no longer contains `Math.round(<digit>`.
- The values are unchanged (2 and 7).

**Status:** fixed

### WR-08: The share link goes stale while inputs are invalid

**Files modified:** `site/js/ui.js`, `site/assets/style.css`, `scripts/smoke.mjs`
**Commit:** 1aa6c83
**Applied fix:**
- While there are errors, the share field is cleared and Copy link is disabled.
- The share status says "Fix the highlighted inputs before sharing.", or "Finish entering the inputs before sharing." when no error is visible yet.
- The next valid update re-enables the button and clears the status.
- The click handler also refuses an empty link.
- `.btn:disabled` gets a dashed border and a not-allowed cursor, using existing tokens only.
- Smoke case `h` asserts that sharing is blocked and then restored.

**Status:** fixed

### WR-09: The `js` class is set before initialisation

**Files modified:** `site/js/ui.js`, `scripts/smoke.mjs`
**Commit:** 281c977
**Applied fix:**
- `classList.add('js')` now runs after every lookup and listener. A failed lookup stops the module before that line.
- The class is still added just before `restore()`, so the scroll to s11 lands on the final layout.
- If `restore()` throws, the class is removed again.
- New smoke case `m` removes `#copy-link` before the module runs, then asserts there is no `js` class and the no-JS note is visible. It was confirmed to fail on the old code.
- The commit also shortened the WR-05 and WR-08 comments, to keep `ui.js` under its existing 300-line budget. That test was not loosened.

**Status:** fixed

### WR-10: An untouched invalid field blanks the results with no visible reason

**Files modified:** `site/js/ui.js`, `scripts/smoke.mjs`
**Commit:** 9584a4c
**Applied fix:**
- If there are errors but none is visible (the reader is still typing in an untouched field) and valid results are on screen, the results, chart and summary are kept.
- The status says "Showing: results for your last complete inputs".
- Sharing is blocked with "Finish entering the inputs before sharing."
- Results are dashed only once an error is visible.
- The share helpers were folded into one `setShare()`.
- New smoke case `n`: clearing Locales keeps the cost cell, the status and the chart. Typing 6 then updates the results and unblocks sharing.

**Status:** fixed: requires human verification (UX state handling)

### IN-01: Values below 1e-20 round-trip to "0"

**Files modified:** `site/js/state.js`, `test/state.test.js`
**Commit:** 309e68e
**Applied fix:**
- `coerce` rejects any value that `toText` cannot write back exactly, with the message "<Label>: use fewer decimal places."
- New test: the 1e-22 case, plus a share-link round trip for every field and several decimal inputs.

**Status:** fixed

### IN-02: The '20%' allow-list token is global

**Files modified:** `test/page.test.js`
**Commit:** 459cad1
**Applied fix:**
- `'20%'` was removed from `ALLOWED_NUMERIC_TOKENS`.
- In s11 only, four exact phrasings are stripped, each built from `formatValue(SENSITIVITY_STEP, 'pct0')`:
  - "each input moved X down and up"
  - "at −X"
  - "at +X"
  - "A X rise moves"
- A probe confirmed that a bare "20%" in s05 now fails the gate.

**Status:** fixed

### IN-03: The step size is duplicated as literal text

**Files modified:** `site/js/model.js`, `test/calc-page.test.js`
**Commit:** 08bc5d2
**Applied fix:**
- The believe sentence is now built from `SENSITIVITY_STEP`.
- A new test pins the static caption, the column headers and the believe text to `formatValue(SENSITIVITY_STEP, 'pct0')`.

**Status:** fixed

### IN-04: The auto-approval cap message is built two ways

**Files modified:** `site/js/state.js`, `test/state.test.js`
**Commit:** a945e29
**Applied fix:** `auto1` now uses `capMessage`. The test pins the exact message, which is unchanged.

**Status:** fixed

### IN-05: The input handler can run `update` twice per keystroke

**Files modified:** `site/js/ui.js`
**Commit:** ba75cae
**Applied fix:** Touched fields update immediately. Other fields update after the 250 ms debounce. Never both.

**Status:** fixed

### IN-06: `keyFor` parses an English message

**Files modified:** `site/js/calc.js`, `site/js/model.js`, `test/model.test.js`
**Commit:** 68ff81a
**Applied fix:**
- `calc.js` errors for `auto_approval_share` (both the share-range check and the cap check) now carry `which: 'baseline' | 'scaled'`.
- `keyFor` keys on `which`.
- The new test includes the share-range error with no side suffix, which the old code wrongly mapped to `auto2`.

**Status:** fixed

### IN-07: Vendor behaviour stated as fact

**Files modified:** `site/index.html`, `test/compare.test.js`
**Commit:** 48c9958
**Applied fix:**
- AirOps review cell: "...listed on all three plans (plan marks read from the page markup, so not certain). [pricing cite] The enterprise page says every piece routes through human review before going live. [enterprise cite]"
- The AirOps panel now says "Its enterprise page says it routes every piece…".
- Seven other behavioural matrix cells now start with "Says", "Documents" or "Describes".
- The test pins the MEDIUM-confidence qualifier, and requires "says" in any "routes every piece" or "every piece routes" sentence in s12.

**Status:** fixed: requires human verification (vendor copy)

### IN-08: "Independent traffic studies" applied to sell-side authors

**Files modified:** `site/index.html`, `site/js/data.js`, `test/page.test.js`
**Commit:** a26eb7b
**Applied fix:**
- s09 now says "Non-vendor traffic studies".
- The `asm-lever-06-evidence` basis, and its register row, now say "Non-vendor traffic studies from October 2026 (two of the three by authors who sell search or visibility services)".
- A test bans "Independent traffic studies".

**Status:** fixed

### IN-09: Smoke CDP calls have no timeout

**Files modified:** `scripts/smoke.mjs`
**Commit:** 5c3a187
**Applied fix:**
- The websocket must open within 10 s.
- Each `send` rejects after 15 s.
- All pending calls reject on `ws.onclose`.

**Status:** fixed

### IN-10: Common entry forms are rejected

**Files modified:** `site/js/state.js`, `test/state.test.js`
**Commit:** f3c04f6
**Applied fix:**
- A leading `$` is stripped in `usd` fields only.
- A bare leading decimal point (`.5`) is accepted.
- Tests cover `$0.80`, `$1,200`, `.5`, `.5%`, `$` in a non-$ field (rejected), and malformed forms such as `$`, `$$1`, `.`, `1.` and `.5.5` (rejected).

**Status:** fixed

### IN-11: Error-summary links push history

**Files modified:** `site/js/ui.js`, `scripts/smoke.mjs`
**Commit:** a3221d6
**Applied fix:**
- One delegated click handler on the summary calls `preventDefault()` and focuses the input.
- Smoke case `h` asserts that the hash is unchanged, `history.length` is unchanged and focus is on `#in-campaigns`. It was confirmed to fail on the old code.

**Status:** fixed

## Notes for the verifier

- **New claim:** `calc-scen-hold-production_cost_change` (−$53,579, Modelled, ref `asm-locales`, the same ref as the production-cost row).
- **New UI copy:**
  - "Fix the highlighted inputs before sharing."
  - "Finish entering the inputs before sharing."
  - "Showing: results for your last complete inputs"
  - "<Label>: use fewer decimal places."
  - These strings are not yet in 03-UI-SPEC.md. The orchestrator may want to add them.
- **`ui.js` line budget:** 298 lines, against a limit of under 300. The budget is nearly used up.
- **Error shape:** `compute()` errors may now carry a `which` property.
- **Not changed:** REVIEW.md, design tokens, the data-fig drift test, the chip↔grade tests and the vendor-name tests.
- **Process note:** the IN-05 commit was first made while the `ui.js` line-budget test was failing (one line over). It was amended before any other commit, so the final commit `ba75cae` passes. Nothing was pushed.

---

_Fixed: 2026-10-24_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
