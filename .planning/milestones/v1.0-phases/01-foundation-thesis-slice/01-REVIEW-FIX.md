---
phase: 01-foundation-thesis-slice
fixed_at: 2026-10-24T10:06:07Z
review_path: .planning/phases/01-foundation-thesis-slice/01-REVIEW.md
iteration: 1
findings_in_scope: 16
fixed: 16
skipped: 0
deferred: 4
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-10-24T10:06:07Z
**Source review:** .planning/phases/01-foundation-thesis-slice/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 16 (CR-01, CR-02, WR-01 to WR-09, IN-01, IN-02, IN-05, IN-07, IN-09)
- Fixed: 16
- Skipped: 0
- Deferred by user decision: 4 (IN-03, IN-04, IN-06, IN-08)
- Test suite: 59 tests before, 85 after, all passing (`node --test`)

## Fixed Issues

### CR-01: Valid assumptions such as "no AI spend today" make compute() fail

**Files modified:** `site/js/calc.js`, `test/calc.test.js`
**Commit:** db0e033
**Applied fix:** If a ratio has a zero baseline, it is now `null` and its name is added to a new `undefined_ratios` array. Before, it failed the whole result. `cost_per_asset_change` is null whenever `cost_per_asset` is null. The `allFinite` fallback is kept as a last resort only. It now uses `field: null` because, once validation has passed, only overflow from extreme inputs can reach it. The choice is documented in the module header. Tests cover: no AI spend today (ok, `ai_spend` null and flagged, other outputs finite), a zero-cost baseline, no undefined ratios at the defaults, and the overflow fallback.
**Status:** fixed: requires human verification (logic change to the output contract)

### CR-02: Headline says "at a flat budget" but production cost rises 27%

**Files modified:** `site/js/calc.js`, `site/js/data.js`, `site/index.html`, `test/calc.test.js`, `test/page.test.js`
**Commit:** c2ee17e
**Applied fix:** This follows the user decision recorded in CONTEXT.md: keep "flat total marketing budget" and grade the reallocation.
- `compute()` now returns `deltas.total_cost`, `deltas.production_share_of_budget` and `ratios.total_cost_change`.
- New derived claims: `total-cost-delta` ($0.71M), `total-cost-change` (+27%) and `budget-share-delta` (0.9 points, new `pts1` format).
- New Modelled assumption `asm-reallocation` ("reallocated from other marketing lines, chiefly agency and production fees"), with its register row.
- s02 has a new paragraph. It gives the rise, says that the total budget stays flat only because the rise is reallocated, and says the claim must be restated if those lines cannot shrink.
- The answer and the "What 2x does not mean" callout now say "within a flat total marketing budget". The answer also shows the +27% rise and the reallocation chip. It is 109 words, under the 120 limit.
- The NOT_MEAN test constant was updated. A new test checks for the new figures and fails if "same money" or "at a flat budget" comes back.
**Status:** fixed: requires human verification (argument and wording change)

### WR-01: `{baseline, scaled}` assumptions read as scalars

**Files modified:** `site/js/calc.js`, `test/calc.test.js`
**Commit:** 8557e8c
**Applied fix:** `side()` and `breakEven()` now read every cost-half assumption through `pick()`. The `sampling + escalation <= 1` check now runs per side. Tests check that wrapped equal values reproduce the scalar golden case, that a lower scaled rework rate changes only the scaled side, and that the per-side sum check names `sampling_rate`.
**Status:** fixed: requires human verification

### WR-02: Break-even reported ok above the T0+T1 cap

**Files modified:** `site/js/calc.js`, `test/calc.test.js`
**Commit:** 4204a8f
**Applied fix:** `breakEven` applies the scaled T0+T1 cap. It returns `status: 'infeasible'` with the uncapped value when `cap < a* <= 1`, and it includes `cap` in the result. It also guards the degenerate `sampling + escalation = 1` case, which used to give NaN. Tests: `reviewer_fte: 3` gives infeasible (value between cap and 1), the defaults stay ok and at or below the cap, and q = 1 gives a finite infeasible result.
**Status:** fixed: requires human verification

### WR-03: Review-constraint copy conflates the 85% target with capacity

**Files modified:** `site/js/calc.js`, `site/js/data.js`, `site/index.html`, `test/calc.test.js`, `test/page.test.js`
**Commit:** 6a4e418
**Applied fix:** `breakEven` now takes a utilisation argument. `compute()` also returns `capacity_auto_approval` (utilisation = 1). There is a new derived claim, `capacity-auto-approval`, at 29%. The s02 copy now says 41% keeps reviewers at or below the 85% target (an `asm-target-utilisation` data-fig), that queues grow below that share, and that capacity is exceeded outright below about 29%. A calc test checks that utilisation equals 1 and 0.85 at the two shares, and that capacity is exceeded just below the lower one.
**Status:** fixed: requires human verification

### WR-04: Falsifier uses AND

**Files modified:** `site/index.html`, `test/page.test.js`
**Commit:** 975a304
**Applied fix:** The s01 callout now reads exactly: "If approved-live variants per head double but holdout-measured conversion/CAC does not improve, or first-pass compliance falls, within 2–3 quarters, the 2x claim is false for that org." The answer paraphrase was changed to OR in the same way. The `FALSIFIER` constant was updated, and the answer test now asserts the OR form and rejects the old AND wording anywhere on the page.
**Status:** fixed

### WR-05: SVG `<desc>` numerals not checked

**Files modified:** `test/figure.test.js`
**Commit:** bbf2cd5
**Applied fix:** A new test asserts that `<desc>` contains the display of each of the six panel claims, and that every numeral in it is one of those displays, with exactly six numerals. Mutation-checked: changing 83 to 84 in the desc fails.
**Status:** fixed

### WR-06: Register text not checked, and the numeric gate covered 4 regions

**Files modified:** `test/page.test.js`
**Commit:** ba5d9f4
**Applied fix:**
- Source rows are now checked against data.js for title, publisher, published, accessed, bias, read_via and `href=url`. The publisher and accessed values must also be in their own cells.
- Assumption rows are checked for the label cell, the basis, the value data-fig span and a grade cell with the correct chip class.
- The numeric gate now covers the masthead, meta, answer, legend, all 15 sections and the footer.
- There are two commented exemptions. Register rows are exempt because they are verified field by field above. Locked section `<h2>` titles are exempt because the TITLES test covers them ("Backlog 0").
- Mutation-checked with a changed accessed date, a numeral added to s08, and a changed basis.
**Status:** fixed

### WR-07: data-fig regex skips spans and ignores chip colour class

**Files modified:** `test/page.test.js`
**Commit:** 506bc82
**Applied fix:** The regex captures the chip class and asserts that it matches the grade. A coverage assertion requires every `data-fig` attribute on the page to be either a parsed span or an SVG `<text>` label. A new test checks every chip, whether link or span, for a class matching its word, and fails on chip markup it cannot parse. Mutation-checked with an extra attribute on a span and a `c-b` class on a Modelled chip.
**Status:** fixed

### WR-08: Modelled chip below 4.5:1 on paper-2

**Files modified:** `site/assets/style.css`, `test/style.test.js` (new), `.planning/phases/01-foundation-thesis-slice/01-UI-SPEC.md`
**Commit:** 8983c9c
**Applied fix:** **Token change:** `--inferred` goes from #8A6A12 to #7A5D0F. That is 5.60:1 on paper, 5.25:1 on paper-2 and higher on white. UI-SPEC records the change. The new `test/style.test.js` reads the `:root` tokens and asserts:
- Benchmark, Modelled and Speculative chip colours are at least 4.5:1 on paper, paper-2 and white (print).
- `--muted` is at least 4.5:1 on paper and paper-2.

The test fails on the old token (4.30:1).
**Status:** fixed

### WR-09: Cost-stack segments rely on grey shade alone

**Files modified:** `site/index.html`, `site/assets/style.css`, `test/style.test.js`, `test/figure.test.js`, `.planning/phases/01-foundation-thesis-slice/01-UI-SPEC.md`
**Commit:** 05dfee3
**Applied fix:** **Token change:** the ramp is now #1A1C1B / #3A3D38 / #4A4E48 / #5A5E57 / #6C7068 / #7C8077. The lightest is 3.65:1 on paper. Before, the light end was 1.24 to 2.24:1.
- Segments are separated by a 1.5px paper stroke, so every boundary is at least 3:1.
- Review, tooling and storage (segments 2, 4 and 6) are filled with SVG `<pattern>` diagonal hatches through `fill="url(#hatch-N)"`. The other segments are solid, so neighbours differ by texture. Legend swatches use the same patterns.
- The `<desc>` mentions the hatching.
- UI-SPEC records the palette change.
- Tests: every seg token is at least 3:1 on paper and white; the CSS stroke and fill rules; and every even segment and swatch is hatched while odd ones are solid.
- A headless Chrome screenshot confirmed the hatches render.
**Status:** fixed

### IN-01: Unused `breakEven` parameter and shadowed `k`

**Files modified:** `site/js/calc.js`
**Commit:** 8881633
**Applied fix:** Removed the unused `inputs` parameter, because the tier cap comes from assumptions. Renamed the loop variable to `comp`.
**Status:** fixed

### IN-02: `formatValue` puts the minus after the dollar sign

**Files modified:** `site/js/data.js`, `test/data.test.js`
**Commit:** 2e73c4e
**Applied fix:** The int, x1, usd0, usd2, usdm2, pct0 and pct1 formats now format the absolute value and prefix U+2212. A value that rounds to zero gets no sign. Tests were added.
**Status:** fixed

### IN-05: Print shows each source URL twice

**Files modified:** `site/assets/style.css`, `test/style.test.js`, `.planning/phases/01-foundation-thesis-slice/01-UI-SPEC.md`
**Commit:** ec95033
**Applied fix:** Dropped the `::after` href rule, because the register link text is already the full URL. The UI-SPEC print line was updated. A test asserts that external link text equals its href and that no `attr(href)` `::after` rule exists.
**Status:** fixed

### IN-07: Answer cites the 2025 figure while the model uses 2026

**Files modified:** `site/index.html`, `test/page.test.js`
**Commit:** 2152293
**Applied fix:** The answer now cites `gartner-share-2026` (7.8%) and its source chip. A test asserts the answer uses the 2026 claim and that `asm-budget-share` equals it.
**Status:** fixed

### IN-09: Monotonicity test does not cover cost

**Files modified:** `test/calc.test.js`
**Commit:** e1ec72c
**Applied fix:** The test now asserts `r.ok`, that variants strictly increase, and that baseline and scenario `cost.total` strictly increase for each volume input.
**Status:** fixed

## Deferred Issues (out of scope by user decision)

### IN-03: Displays are formatted from the rounded value, not the computed one

**File:** `site/js/data.js:183-204`; `test/data.test.js:46,59`
**Reason:** Deferred by the user. Correct at the current defaults.

### IN-04: Workflow does not run tests on pull requests; actions are pinned by tag

**File:** `.github/workflows/pages.yml`
**Reason:** Deferred by the user.

### IN-06: Chip links are announced only as "Modelled"

**File:** `site/index.html` (all `.chip` anchors)
**Reason:** Deferred by the user.

### IN-08: Page guards will block the planned calculator; calc.js and data.js are published unused

**File:** `site/index.html:6`; `test/page.test.js:42`; `README.md:7`
**Reason:** Deferred by the user. Handle it when s11 lands in Phase 3.

## Notes for the verifier

- All `calc.js` changes keep the contract: no NaN or Infinity, null for undefined values (`cycle_days`, ratios listed in `undefined_ratios`), and errors that name the field. The overflow fallback is the one exception: it names `field: null`.
- New `compute()` output keys: `undefined_ratios`, `deltas`, `ratios.total_cost_change`, `capacity_auto_approval`, and `cap` on both break-even objects. Phase 3 UI should read these keys.
- Minor prose note: in s02, "Production cost therefore rises…" is now followed by "The saving is therefore…". The two "therefore"s could be smoothed in an editorial pass.
- REVIEW.md was not modified.

---

_Fixed: 2026-10-24T10:06:07Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
