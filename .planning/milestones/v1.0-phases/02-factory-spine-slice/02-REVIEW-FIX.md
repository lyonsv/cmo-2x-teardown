---
phase: 02-factory-spine-slice
fixed_at: 2026-10-24T15:36:01Z
review_path: .planning/phases/02-factory-spine-slice/02-REVIEW.md
iteration: 1
findings_in_scope: 23
fixed: 23
skipped: 0
deferred: 1
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-10-24T15:36:01Z
**Source review:** .planning/phases/02-factory-spine-slice/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 23 (CR-01, CR-02, WR-01 to WR-10, and every IN item except IN-09)
- Fixed: 23
- Skipped: 0
- Deferred: 1 (IN-09, a design-token change, out of scope by instruction)
- Test suite: 155 tests before, 170 after, all passing (`node --test`)
- Each fix is one commit (`fix(02): <id> ...`). Commits were made in a worktree and fast-forwarded onto `main`. Nothing was pushed.

## Fixed Issues

### CR-01: s05 "small chance" of human review contradicts the model's 46%

**Files modified:** `site/js/calc.js`, `site/js/data.js`, `site/index.html`, `test/page.test.js`, `test/calc.test.js`
**Commit:** fa49081
**Applied fix:**
- `side()` in compute now returns `human_touch_share` (h = 1 − auto × (1 − (sampling + escalation))). It is a new output key.
- New derived claim `human-touch-share-scaled` (46%, ref `asm-auto-approval`).
- s05 now says that at 2x about 46% of derived variants still reach a person, through full review, sampling or escalation. It carries a Modelled chip.
- s07 says "without a full human review" and adds the 46% figure.
- s07 lead and s02 no longer say "no human" or "no human touch".
- The `asm-auto-approval` basis now says a sampled or escalated share is still seen by a person. The register row was updated to match.
- Tests:
  - the formula is checked on both sides, and `review_hours` is checked to use it;
  - "small chance" and "no human touch" are banned;
  - the s05 chip is checked.

**Status:** fixed: requires human verification (copy change)

### CR-02: Matrix total labelled "approved-live" but counts derived variants before the gate

**Files modified:** `site/js/data.js`, `site/index.html`, `test/page.test.js`, `test/data.test.js`
**Commit:** 565b686
**Applied fix:**
- The row is now "Total derived variants, before the gate". The caption reads "about 12,000 derived variants". The `matrix-total` and `matrix-per-concept` units say "derived … before the gate".
- New row "Approved-live at the approval yield", showing the `asm-approval-yield` 95% and a new claim `matrix-approved` (11,400 = total × yield, ref `asm-approval-yield`).
- Tests pin the labels and fail if a pre-gate row says "approved-live". `matrix-approved` is checked against `variantMatrix()` × yield.

**Status:** fixed: requires human verification

### WR-01: Chip targets chosen to satisfy the row rule, not provenance

**Files modified:** `site/js/data.js`, `site/index.html`, `test/page.test.js`, `test/data.test.js`, `02-UI-SPEC.md`
**Commit:** 25e61b3
**Applied fix:**
- Each capacity claim now refs the row that explains it:
  - hours and utilisation → `asm-auto-approval`;
  - new `cap-1x-variants` and `cap-2x-variants` → `asm-variants-per-concept`;
  - `cap-capacity-hours` → `asm-reviewer-hours`;
  - the reference-rate utilisations → `src-intercom-2x-teardown`, with the `company-reported` flag.
- Volume and the flat 14,400 h capacity are now stated once, each with its own chip, in a paragraph directly above the table. The table is now Scenario / Hours / Utilisation of reviewer capacity / Grade.
- The one-chip-per-row rule was kept. It was not loosened.
- The data.test scenario table now pins the ref and flag for each claim, and checks capacity = FTE × hours.
- UI-SPEC records the column change.

**Status:** fixed: requires human verification (table layout differs from the original UI-SPEC column list)

### WR-02: Tier rules contradict each other; Figure 6 disagrees with the table

**Files modified:** `site/index.html`, `test/page.test.js`
**Commit:** 2f25543
**Applied fix:** This follows the post-review decision: T1 covers new executions of already-approved claims only, and any new claim is T2 or higher.
- T1 now reads "New executions that reuse already-approved claims (no new claims); templates with retrieved approved imagery; audience variants built from existing segments".
- T2 now reads "any new claim or new claim phrasing … newly defined audience segments".
- In the Always-human list, "Claim-bearing" became "New or comparative claims, testimonials and endorsements". The intro explains why reused claims can sit in T1.
- Figure 6 node text now matches the table:
  - T0 · resizes and swaps / gate: policy match + sample
  - T1 · approved claims reused / gate: agent pass + sample
  - T2 · new claims or imagery
  - T3 · hero, endorsements
- The `<desc>` was rewritten.
- A headless Chrome render was checked visually.

**Status:** fixed: requires human verification (governance wording)

### WR-03: Company-reported reference datum graded Modelled without a legend rule; 28.4% unflagged

**Files modified:** `site/index.html`, `test/page.test.js`
**Commit:** 53c13ac
**Applied fix:**
- The grade stays non-Benchmark, as the orchestrator instructed ("never Benchmark for company-reported").
- The legend's Modelled definition now carries a written rule: a figure that only the company concerned reports is graded Modelled, never Benchmark, and is flagged company-reported, because the page uses it as an input it cannot check. This matches the existing practice for lever 1 evidence and the source row.
- 28.4% now carries its own flag.
- Test:
  - the legend rule must be present;
  - every company-reported claim must be Modelled;
  - every appearance of either reference figure must carry its flag.

**Status:** fixed: requires human verification (grading-policy wording)

### WR-04: Imagery indemnity qualified only for the generate route (COI asymmetry)

**Files modified:** `site/js/data.js`, `site/index.html`, `test/page.test.js`
**Commit:** 9bf0063
**Applied fix:**
- Indemnity row:
  - Retrieve: "Inherits the original licence's indemnity, if any."
  - License: "Conditional; caps and exclusions vary by licence tier."
  - Generate: "Conditional; caps and exclusions vary by provider and tier."
- The `asm-imagery-indemnity` basis now covers licensed stock, generated and retrieved assets in parallel.
- Copyrightability row:
  - It is now Modelled (`asm-imagery-routes`). The Generate cell links to the USCO source ("Per the US Copyright Office"), so the Benchmark source no longer appears to cover the retrieve and license cells.
  - The `asm-imagery-routes` basis says this.
- Test:
  - license and generate are qualified the same way;
  - the basis covers all three routes;
  - the table has no Benchmark chip, and USCO is linked only from the Generate cell.

**Status:** fixed: requires human verification. The stock-licence indemnity description ("commonly capped, higher caps on paid or extended tiers, excludes modified, misused or out-of-scope use") is a generic Modelled summary and is not drawn from a registered source. Given the author's COI, the author should confirm that it is fair.

### WR-05: Getty row carried a pre-publication to-do; the tracker actually used was not registered

**Files modified:** `site/js/data.js`, `site/index.html`, `test/page.test.js`
**Commit:** b35f8f2
**Applied fix:**
- New source `ailawsuittracker-getty-uk`: Modelled, with a register row. Its `read_via` gives the dates from 02-08-SUMMARY:
  - reviewed against the court record 2026-05-25;
  - page text reviewed 2026-10-11;
  - footer updated 2026-10-19;
  - permission to appeal 2025-12-16.
- The Taylor Wessing `read_via` now says "Not read" and points to the tracker. The "before publishing" to-do is removed.
- Getty line:
  - the unsourced US-refiling clause is dropped;
  - it now says "permission to appeal the copyright ruling, and the appeal is pending";
  - it carries a Modelled chip linked to the tracker.
- Tests ban a to-do in any source, and ban the US clause and the unchipped line.

**Status:** fixed: requires human verification. The `published` date for the tracker is set to 2026-10-11, the page-text review date. The sentence's "dismissed secondary copyright claim / upheld narrower trade mark claim" is supported by the tracker as summarised in 02-08-SUMMARY and 02-RESEARCH. The author should confirm this against the tracker page.

### WR-06: Standalone chips and flags never checked against data.js

**Files modified:** `test/page.test.js`, `site/index.html`
**Commit:** 343140b
**Applied fix:**
- New global test: every linked chip's word and class must equal the grade of its `#src-`/`#asm-` target in data.js.
- New flag test: every appearance of a flagged claim must be followed, optionally after its chip, by its flag span. A flag must follow a figure or chip.
- Mutation checks confirmed that both tests fail on a wrong chip and on a missing flag.
- The flag test found a live gap: 111.3% had no flag. It is now flagged.

**Status:** fixed

### WR-07: Source grades and flags lived only in the test file

**Files modified:** `site/js/data.js`, `test/page.test.js`, `test/data.test.js`
**Commit:** f7b6bd1
**Applied fix:**
- Every source in data.js now has `grade` and `flag`. The test-only `SRC_GRADE` map was deleted.
- The register test now asserts that each source row's Grade cell and Flag cell equal `src.grade` and `src.flag ?? 'none'`.
- New data test: source grades and flags are valid, and a Benchmark source is never flagged. A claim citing a source shares its grade and carries its flag.

**Status:** fixed

### WR-08: Figure 6 text-equivalent exemption passed vacuously

**Files modified:** `test/diagram.test.js`, `site/index.html`
**Commit:** b0faa1f
**Applied fix:**
- The tier table must now be the next element after Figure 6.
- For each node:
  - the content words of its title must appear in that tier's Example cell;
  - the words of its approver line must appear in Who approves;
  - T0 and T1 must sit above the dashed divider and mention a sample;
  - T2 and T3 must sit below it, mention a human and not mention a sample.
- The T1 example wording was adjusted ("reuse") so that the table carries the node's words.
- A mutation check with the old node text fails.

**Status:** fixed

### WR-09: variantMatrix() accepted duplicate ids and sparse arrays

**Files modified:** `site/js/calc.js`, `test/calc.test.js`
**Commit:** 8758c66
**Applied fix:**
- Validation now uses an indexed `for` loop, so holes are validated as `{}` and report `factors[i].id/count/applies`.
- A repeated id gives `factors[i].id` "id must be unique".
- Tests cover duplicate ids, a leading hole and a trailing hole. None of them returns `total` or `rows`.

**Status:** fixed

### WR-10: "No variant is double counted" asserted without support; channels wording did not match the maths

**Files modified:** `site/js/data.js`, `site/index.html`, `test/page.test.js`
**Commit:** 893d9ed
**Applied fix:**
- The s05 paragraph and the `asm-matrix-independence` display and basis now say the factors are "treated as independent for illustration". They also say that sizes follow channel placement specs, so the total is "an upper-bound sketch, not a count of distinct valid variants".
- The channels basis now reads "75% of the items rendered for all five channels and the rest for one".
- The test now requires this wording and fails if the no-double-count claim comes back.
- Merging sizes and channels into one factor was not done, because it would change the worked numbers.

**Status:** fixed: requires human verification (copy)

### IN-01: Enumerator and order tests restated the formula

**Files modified:** `test/calc.test.js`
**Commit:** 1db9865
**Applied fix:**
- New real enumerator. It builds explicit variant tuples, with configurable item picking, and asserts that they are pairwise distinct.
- It checks:
  - a hand-built 4-concept case with fractions 0.5 and 0.25 (10 variants), using two different picking rules;
  - the full worked campaign: 12,000 distinct tuples.
- The order test is kept, with a comment saying it only guards the implementation.

**Status:** fixed

### IN-02: Figure 1 legibility test asserted a constant

**Files modified:** `test/style.test.js`
**Commit:** e26581c
**Applied fix:** The effective size is now computed from the page's `svg.fig` viewBox width, the CSS `.fig text` size and the `min-width` in the 960px media rule.
**Status:** fixed

### IN-03: Five identical "Steps in this figure" headings

**Files modified:** `site/index.html`, `test/diagram.test.js`, `02-UI-SPEC.md`
**Commit:** a97fd30
**Applied fix:** The headings now read "Steps in Figure N". The test and UI-SPEC were updated.
**Status:** fixed

### IN-04: Vendor denylist incomplete and scoped to s03–s08

**Files modified:** `test/page.test.js`
**Commit:** 90215f3
**Applied fix:**
- Added these names:
  - ad platforms (TikTok, LinkedIn, Facebook, Instagram, YouTube, Meta in branded forms);
  - models (Sora, Veo, Imagen, Flux.1, Ideogram, Stable Diffusion, Bria);
  - workflow and DAM tools (Figma, Workfront, Sprinklr, Celtra, Persado, Sitecore, Seismic);
  - localisation tools (Smartling, DeepL, Phrase TMS);
  - Typeface.ai and Writer.com.
- Ordinary words such as "writer" and "typeface" are matched only in their branded forms.
- The test now covers the whole page outside s12 and s15. It excludes only the COI callouts and the single Getty line.

**Status:** fixed

### IN-05: Reference rates duplicated as literals in the capacity overrides

**Files modified:** `site/js/data.js`, `test/data.test.js`
**Commit:** 6254f9d
**Applied fix:** The overrides now read `claims['ref-auto-approved-share'].value` and `claims['ref-bot-approval-rate'].value`. The test asserts the link. The test-local scenario table is kept on purpose, so it still catches a stale utilisation literal.
**Status:** fixed

### IN-06: `<time>` text and SVG text exempt from numeric checks

**Files modified:** `test/page.test.js`, `test/diagram.test.js`
**Commit:** 3620f20
**Applied fix:**
- Every `<time>` must have only a `datetime` attribute, and its text must equal that date.
- New diagram test: SVG `<text>`, `<title>` and `<desc>` in Figures 2–7 carry no digits once `T0`–`T3` are removed.

**Status:** fixed

### IN-07: s08 reference claim had no source link

**Files modified:** `site/index.html`, `test/page.test.js`
**Commit:** cc4b121
**Applied fix:** "the one public reference" in s08 now links to `#src-intercom-2x-teardown`. The "Intercom exactly once" rule still holds.
**Status:** fixed

### IN-08: Percent values stored inconsistently

**Files modified:** `site/js/data.js`, `test/data.test.js`
**Commit:** 356ef18
**Applied fix:**
- These values are now stored as fractions, with a format:
  - `nyu-ctr-lift`: 0.19, pct0
  - `nyu-disclosure-drop`: −0.315, pct1
  - `gartner-share-2025` and `gartner-share-2026`: 0.077 and 0.078, pct1
  - `asm-budget-share`: 0.078
- Displays are unchanged.
- New test: no percent-displayed claim stores a percent-scale value, and display equals `formatValue`.

**Status:** fixed

### IN-10: Figure 5 had no direct agent → escalate path

**Files modified:** `site/index.html`, `test/diagram.test.js`
**Commit:** f6e5024
**Applied fix:**
- Added an `edge-review` path down the left margin, from the review agent to Escalate. It is used for "could not check".
- The `<desc>` was updated.
- A test asserts the edge.
- A headless Chrome render was checked visually.

**Status:** fixed

### IN-11: Two source entries on one line in data.js

**Files modified:** `site/js/data.js`
**Commit:** 5a44639
**Applied fix:** The `intercom-2x-teardown` entry now starts on its own line.
**Status:** fixed

### IN-12: variantMatrix() returns non-integer counts, undocumented

**Files modified:** `site/js/calc.js`, `site/js/data.js`, `site/index.html`, `test/calc.test.js`
**Commit:** 65d6348
**Applied fix:**
- The JSDoc now says that totals are expected counts, are never rounded in the model, and are rounded for display only.
- The `asm-matrix-independence` basis and its register row say the same.
- A test pins `variantMatrix(1, [{count:2, applies:0.3}]).total` = 1.3 and a non-integer multi-factor case.

**Status:** fixed

## Deferred Issues

### IN-09: The Benchmark colour is reused as the diagram accent

**File:** `site/assets/style.css` (`.fig-d .node-review rect`, `.edge-review`)
**Reason:** Deferred by instruction, because it would change the design tokens. It needs a decision on a new `--accent` token, or a legend note, plus a contrast re-check.
**Original issue:** `--verified` is the Benchmark chip colour, so green review paths in Illustrative diagrams can read as "verified".

## Notes for the verifier

- **New `compute()` output:** `baseline.human_touch_share` and `scenario.human_touch_share`.
- **New claims:** `human-touch-share-scaled`, `matrix-approved`, `cap-1x-variants` and `cap-2x-variants`.
- **Removed claims:** `cap-*-variants` for each of the four rows, and the per-row `cap-capacity-hours` cells (the claim itself remains, stated once).
- **New source:** `ailawsuittracker-getty-uk`.
- **Sources now carry `grade` and `flag`.** Phase 3 register rendering can read them.
- **Prose budgets:** s03–s08 are still within 400–700 words each, and the total is within its range.
- **Not changed:**
  - REVIEW.md;
  - the Phase 1 deferred items (IN-03, IN-04, IN-06 and IN-08 from 01-REVIEW).
- **Not pushed:** nothing has been pushed.

---

_Fixed: 2026-10-24T15:36:01Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
