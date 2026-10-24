---
phase: 01-foundation-thesis-slice
reviewed: 2026-10-24T10:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - .github/workflows/pages.yml
  - README.md
  - package.json
  - site/assets/style.css
  - site/index.html
  - site/js/calc.js
  - site/js/data.js
  - test/calc.test.js
  - test/data.test.js
  - test/figure.test.js
  - test/page.test.js
findings:
  critical: 2
  warning: 9
  info: 9
  total: 20
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-10-24T10:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

The full suite (59 tests) passes and the default scenario computes. Where the code was checked, the numbers on the page match `compute()`. The defects are in four places:

- **Edge-case contract of `calc.js`.** Plausible, validation-passing assumptions give `ok: false` with an error blamed on the wrong field.
- **Break-even logic and its copy.** The value ignores the tier cap, and the page text misstates what falls short of break-even means.
- **Places where the page's own reasoning undercuts the honesty constraint.** These are the "flat budget" headline and the falsifier.
- **Tests that look strict but leave whole classes of drift unchecked.** These are the SVG `<desc>`, the register text, the chip colour class, and spans the regex does not match.

All edge cases below were confirmed by running `compute()` directly, using a scratch probe script.

## Critical Issues

### CR-01: Valid assumptions such as "no AI spend today" make compute() fail, and the error blames `multiplier`

**File:** `site/js/calc.js:153-170` (ratios and the allFinite fallback), `site/js/calc.js:66-78` (validation that allows the zero)
**Issue:** `ai_share_of_variant_cost`, `ai_share_of_tooling`, `tooling_cost_annual` and `variant_cost` are validated as `>= 0`. If a user's baseline has no AI spend (`ai_share_of_variant_cost.baseline = 0` and `ai_share_of_tooling.baseline = 0`), then `baseline.ai_spend = 0`. That makes `ratios.ai_spend = x / 0 = Infinity`, `allFinite` rejects the whole result, and the caller gets:

```
{"ok":false,"errors":[{"field":"multiplier","message":"inputs produce a value outside the representable range"}]}
```

This was confirmed with `compute(defaultInputs(), {...defaultAssumptions(), ai_share_of_variant_cost:{baseline:0,scaled:0.6}, ai_share_of_tooling:{baseline:0,scaled:0.5}})`.

"No AI today" is the most natural baseline a CMO would enter into the s11 calculator. It wipes out every output, including the cost-per-asset answer, which is finite, and the error points at a field that is not at fault. The same thing happens whenever any ratio denominator is 0, for example a baseline `cost.total` of 0. This breaks the module's documented contract: "bad input comes back as `{ ok: false, errors }`" naming the field.
**Fix:** Make ratios with a zero denominator `null` (as is already done for `cycle_days`) instead of failing the whole result. Keep the allFinite guard only as a last resort, with a neutral field name:
```js
const ratio = (a, b) => (b === 0 ? null : a / b);
const ratios = {
  output_per_head: ratio(scenario.output_per_head_per_quarter, baseline.output_per_head_per_quarter),
  ...
  ai_spend: ratio(scenario.ai_spend, baseline.ai_spend),
};
ratios.cost_per_asset_change = ratios.cost_per_asset === null ? null : ratios.cost_per_asset - 1;
...
if (!allFinite(out)) return { ok: false, errors: [{ field: null, message: 'inputs produce a value outside the representable range' }] };
```
Add a test: a baseline with zero AI share gives `ok: true` and `ratios.ai_spend === null`.

### CR-02: The headline says "at a flat budget", but the page's own model raises production cost by 27%

**File:** `site/index.html:33` (answer), `site/index.html:121` (what-2x-means callout), `site/index.html:134`
**Issue:** The answer paragraph and the "What 2x does not mean" callout say the doubling happens "at a flat budget" and that "the extra output must come from the same money". The model shows production-attributable cost rising from $2.59M to $3.29M a year: +$0.71M, +27% (`total-cost-base` and `total-cost-scaled`). Tooling quadruples. The page never says where the extra $0.71M comes from inside the $78M budget, for example by reallocating media or agency fees.

A CFO who reads two paragraphs will find that the headline contradicts the figure underneath it. This breaks the project's Honesty constraint and its Core Value ("credible, governable"). It is a correctness defect in the argument, not just wording.
**Fix:** Do one of the following:
- (a) Restate the claim as "within a flat marketing budget, with production cost rising from X to Y (Z% of budget), funded by [stated, graded offset]". Add a graded assumption for the offset to `data.js`.
- (b) Change the headline metric to "flat total marketing budget" and show the reallocation explicitly.

Either way, put the delta (`total_cost` ratio, already computed as `ratios.total_cost`) on the page as a `data-fig` claim beside the headline, so it cannot be hidden.

## Warnings

### WR-01: Assumptions given as `{baseline, scaled}` pass validation but are read as scalars, producing NaN that is blamed on `multiplier`

**File:** `site/js/calc.js:66-78` (`both()` validation) vs `site/js/calc.js:98-122` (`side()` consumption)
**Issue:** `validateCost` runs every field in `SHARE_FIELDS` and `NONNEG_FIELDS` through `both()`, which accepts either a scalar or `{baseline, scaled}`. `side()` and `breakEven()` call `pick()` only for some of them: auto_approval_share, variant_cost, tooling, the AI shares and build_days. These fields are read raw:
- `sampling_rate`, `escalation_rate`, `rework_rate`
- `review_minutes_per_variant`, `reviewer_rate_per_hour`, `master_concept_cost`
- `rights_cost_per_concept`, `storage_cost_per_variant`, `review_service_days`

So `rework_rate: {baseline: 0.15, scaled: 0.1}` validates, then computes `NaN`, and returns the misleading `multiplier` error (confirmed).

Worse, `a.sampling_rate + a.escalation_rate` with object values is string concatenation. The `sampling + escalation <= 1` cross-check at line 77 is skipped because `isShare(object)` is false. So `{0.6,0.6}` + `{0.6,0.6}` gets past the guard that is supposed to catch it.
**Fix:** Either `pick()` every assumption in `side()` and `breakEven()` (a per-side value is a legitimate modelling need, for example a lower rework rate at 2x), or validate these fields as scalar only. Apply the sum check per side:
```js
const S = (name) => pick(a[name], which);
const q = S('sampling_rate') + S('escalation_rate');
const r = S('rework_rate');
...
```

### WR-02: Break-even auto-approval is reported `ok` even when it exceeds the T0+T1 cap that validation enforces

**File:** `site/js/calc.js:132-141`
**Issue:** `validateCost` rejects `auto_approval_share` values above `tier_mix[0] + tier_mix[1]` (0.85 at 2x). `breakEven` never applies that cap. With `reviewer_fte: 3` it returns `{ value: 0.936, status: 'ok' }` (confirmed): a break-even share the model itself says is impossible, labelled feasible. The calculator will tell users the programme is achievable when it is not.

The unused `inputs` parameter suggests this check was intended.
**Fix:**
```js
const mix = pick(a.tier_mix, 'scaled');
const cap = mix[0] + mix[1];
if (aStar > cap) return { value: aStar, status: 'infeasible' };
```
Add a test with a tight reviewer headcount whose `aStar` falls between the cap and 1.

### WR-03: Review-constraint copy says missing break-even means capacity is exceeded; the maths says 85% utilisation

**File:** `site/index.html:214`
**Issue:** "If the real rate falls short of the break-even share, review capacity is exceeded and the 2x programme stalls in the queue." The 41% break-even is computed at `target_utilisation = 0.85`, not at capacity. At the defaults, capacity (utilisation = 1) is reached only below about 28.5% auto-approval (computed from the model). Between 28.5% and 41%, the model has utilisation at 85% to 100% with finite cycle times. The copy overstates the consequence and misdescribes the graded number it sits next to.
**Fix:** "...at least 41% of variants clear with no human touch, keeping reviewers at or below the 85% [chip] utilisation target. Below that, queues and cycle time grow quickly. Below about N% [chip], capacity is exceeded outright." Add N as a derived claim, so the copy and the maths cannot drift.

### WR-04: The falsifier uses AND, so a programme that doesn't improve outcomes but keeps compliance is never falsified

**File:** `site/index.html:33`, `site/index.html:125`; `test/page.test.js:202`
**Issue:** "...holdout-measured conversion/CAC does not improve **and** first-pass compliance falls..." For this to trigger, both conditions must fail together. If output doubles and conversion/CAC are flat while compliance holds, the claim survives. The page's Core Value is that extra output *improves outcomes*. Flat outcomes should falsify it on their own. As written, the falsifier is weaker than the claim, and a sceptical CFO will notice. The test locks this wording in verbatim.
**Fix:** Use OR: "...but holdout-measured conversion/CAC does not improve, **or** first-pass compliance falls, within 2–3 quarters...". Update `FALSIFIER` in `test/page.test.js` to match.

### WR-05: The SVG `<desc>` hard-codes six claim values that no test checks against data.js

**File:** `site/index.html:139`; `test/page.test.js:190`, `test/figure.test.js:73-77`
**Issue:** The `<desc>` text gives 83, 167, $64.71, $41.18, $38,421 and $340,421 as plain text. The numeric gate strips the whole `<svg>` (`page.test.js:190`), and `figure.test.js` checks only `<text data-fig>` labels. If an assumption changes, the bars, labels and table update or fail the tests, but what screen readers announce keeps the stale numbers and every test still passes. This defeats the "single source" design (CRED-06) for the accessible alternative in particular.
**Fix:** In `figure.test.js`, take every numeric token in `<desc>` and assert that each one equals the `display` of one of the panel claims. Or check that `desc` includes `claims[id].display` for the six ids and contains no other numerals.

### WR-06: Register and source text is not checked against data.js, and the numeric gate covers only 4 of the page's regions

**File:** `test/page.test.js:36-39`, `test/page.test.js:182-198`; `site/index.html:291-308`, `317-…`
**Issue:**
- `registers cover every source and assumption` checks only that `<tr id="…">` exists. The title, publisher, published and accessed dates, URL, label and basis in each register row are duplicated by hand from `data.js`, and none of them are compared. A changed URL or accessed date in `data.js` (the "sourced and dated" Neutrality constraint) can silently differ from the page.
- The numeric gate runs only on `.meta`, `#answer`, `s01` and `s02`. It skips s03–s15 and the register. Numbers added to later sections in later phases will not be gated, and the register already carries ungraded numerals ("15.3%", "30%", "401") that nothing checks.

**Fix:**
- For each source, assert that the row contains `s.title`, `s.publisher`, `s.accessed` and `href="${s.url}"`.
- For each assumption, assert that the row contains `label` and `basis`.
- Extend the gate to all sections, with an explicit, commented exemption for register cells that quote source titles.

### WR-07: The chip and data-fig regex skips spans it doesn't match exactly, and never checks the chip colour class against the grade

**File:** `test/page.test.js:14-27`
**Issue:**
1. `figRe` matches only `<span data-fig="x">plain text</span>`. A span with any other attribute, such as `<span class="num" data-fig="x">`, or with nested markup is not matched. No assertion fails and its display is never checked. The test checks only that some spans were found (`found.length > 0`), not that every `data-fig` was covered.
2. The chip class is matched by `c-[bms]`, but only the chip *word* and `href` are compared with data.js. `<a class="chip c-b" href="#asm-x">Modelled</a>` passes, so a Modelled number would be shown in Benchmark green. That breaks the grading system, which is the page's main promise.

**Fix:**
```js
const allIds = [...html.matchAll(/data-fig="([^"]+)"/g)].length;
assert.equal(found.length + svgTextFigs, allIds, 'some data-fig spans were not checked');
const CLS = { Benchmark: 'c-b', Modelled: 'c-m', Speculative: 'c-s' };
// capture the class letter and assert cls === CLS[e.grade]
```

### WR-08: The Modelled chip fails WCAG AA contrast on the paper-2 background

**File:** `site/assets/style.css:2,5,35-36,60,72`
**Issue:** `--inferred` (#8A6A12) on `--paper-2` (#EDEDE6) has a contrast of **4.30:1**, below the 4.5:1 that 12px text needs. Modelled chips appear on paper-2 in the grade legend (`.legend`). They also appear in any register row that is the current `:target` (`.register tr:target`), which is exactly the row a user has just navigated to from a chip. On `--paper` it is 4.59:1, which only just passes.
**Fix:** Darken `--inferred` to about `#7A5D0F` (above 5:1 on both backgrounds) and check `--verified`, `--low` and `--muted` again after the change.

### WR-09: The cost-stack segments rely on grey shade alone, and the light segments are almost invisible

**File:** `site/assets/style.css:4,80-82`; `site/index.html:154-180`
**Issue:** The six cost components differ only by grey fill. `--seg-6` (#DCDDD5) is 1.24:1 against the paper and `--seg-5` is 1.57:1, well below the 3:1 non-text contrast that WCAG 1.4.11 asks for. They also sit next to each other, separated only by a 1px paper-coloured stroke. Rights and storage cannot be told apart from the background or from each other. The data table below is an alternative, but CLAUDE.md says "never rely on colour alone" and the figure is the CFO's main view.
**Fix:** Darken the light end of the ramp (each segment at least 3:1 against `--paper`), give each segment an ink-coloured stroke, or label segments directly when they are wide enough. A hatch pattern for alternate segments also works in print.

## Info

### IN-01: `breakEven` has an unused parameter, and `side()` shadows `k`

**File:** `site/js/calc.js:99,121,132`
**Issue:** `inputs` is never used in `breakEven`. In `side()`, `for (const k of [...])` at line 121 shadows the exponent `k` declared at line 99. That is harmless today, but anyone who later uses `k` inside or after the loop will get the wrong value.
**Fix:** Use the parameter for the tier cap (WR-02), or remove it. Rename the loop variable to `comp`.

### IN-02: `formatValue` puts the minus sign after the dollar sign

**File:** `site/js/data.js:42-44`
**Issue:** `formatValue(-1, 'usd2')` returns `$-1.00`. Negative values are not reachable today, but s11 deltas such as savings will produce them.
**Fix:** Format the absolute value and put the sign first using U+2212, as `pctchg0` already does.

### IN-03: Displays are formatted from the rounded value, not the computed one

**File:** `site/js/data.js:183-204`; `test/data.test.js:46,59`
**Issue:** `display = formatValue(value, format)`, where `value` is already rounded to `decimals`. When `decimals` is coarser than the format needs (for example `cpa-change`, decimals 2 and pct0), double rounding can give a display one unit away from `formatValue(computed, format)`. It is correct at the current defaults.
**Fix:** In the test, also assert `formatValue(computedValue, c.format) === c.display`.

### IN-04: The workflow does not run tests on pull requests, and actions are pinned by tag

**File:** `.github/workflows/pages.yml:3-6,19-41`
**Issue:**
- Tests run only on pushes to `main`, so a broken change is caught only when it is already on the deploy branch. The deploy is gated, so nothing broken is published, but `main` goes red.
- Actions are pinned to major tags, not commit SHAs. Permissions are correctly scoped: `contents: read` at the top level, and `pages: write` plus `id-token: write` only on deploy.

**Fix:** Add `pull_request:` with a test-only job (put `if: github.event_name == 'push'` on deploy). Optionally, pin actions to SHAs.

### IN-05: The print stylesheet prints each source URL twice

**File:** `site/assets/style.css:102`
**Issue:** The link text in the register is already the full URL, so `::after { content: " (" attr(href) ")" }` repeats it.
**Fix:** Drop the rule, or use short link text such as "gartner.com" in the register.

### IN-06: Dozens of links are announced only as "Modelled"

**File:** `site/index.html` (all `.chip` anchors)
**Issue:** In a screen reader's link list, every chip reads "Modelled" or "Benchmark" with no target. The surrounding sentence gives context, so WCAG 2.4.4 is met in context, but navigating by link list is poor. In the register, each row's chips link to the row itself.
**Fix:** Add hidden text, for example `<a class="chip c-m" href="#asm-variant-cost">Modelled<span class="vh">: see cost per derived variant</span></a>`. Make the chips in register rows non-link `<span>`s.

### IN-07: The answer quotes the 2025 Gartner figure while the model uses the 2026 one

**File:** `site/index.html:33` vs `site/js/data.js:83-84`
**Issue:** The headline cites 7.7% (2025). The subject organisation's budget share is set to the 2026 7.8% average. That is a small inconsistency in the most-read paragraph.
**Fix:** Cite `gartner-share-2026` in the answer, or say "7.7% to 7.8%".

### IN-08: The page guards will block the planned calculator, and calc.js and data.js are published unused

**File:** `site/index.html:6`; `test/page.test.js:42`; `README.md:7`
**Issue:**
- The CSP is `default-src 'none'` with no `script-src`, and a test asserts the page has no `<script>` at all. The s11 module script will be blocked by both, and that must be changed on purpose, not loosened by accident.
- `js/calc.js` and `js/data.js` are deployed, but the page does not load them yet.

**Fix:** When s11 lands, add `script-src 'self'` only, and replace the no-script test with "the only script is `<script type="module" src="js/ui.js">`".

### IN-09: The monotonicity test does not cover cost, though CLAUDE.md asks for it

**File:** `test/calc.test.js:121-130`
**Issue:** CLAUDE.md asks for "more locales gives more assets and more cost". The test checks only `variants_per_year` rising with each volume input. It never checks that `cost.total` rises.
**Fix:** In the same loop, assert that `r.scenario.cost.total >= prevCost` and that `r.ok === true`.

---

_Reviewed: 2026-10-24T10:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
