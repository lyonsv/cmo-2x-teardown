---
phase: 05-restructure-scaffold-evidence-schema-guards
fixed_at: 2026-10-25T12:10:54Z
review_path: .planning/phases/05-restructure-scaffold-evidence-schema-guards/05-REVIEW.md
iteration: 1
findings_in_scope: 17
fixed: 17
skipped: 0
status: all_fixed
---

# Phase 5: Code Review Fix Report

**Fixed at:** 2026-10-25T12:10:54Z
**Source review:** .planning/phases/05-restructure-scaffold-evidence-schema-guards/05-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 17 (1 critical, 8 warning, 8 info)
- Fixed: 17
- Skipped: 0

After every commit, `node --test` (now 435 tests) and `node scripts/crosscheck.mjs` were green. At the end, `scripts/gates.sh` hit the known "no page target" CDP flake in smoke, on both the first run and its automatic retry. The single permitted rerun was fully green: node --test, crosscheck, smoke, a11y and print.

## Fixed Issues

### CR-01: 44 derived 2x claims are classed `illustrative`, and the evidence test repeats the same wrong heuristic

**Files modified:** `site/js/data.js`, `test/evidence.test.js`
**Commit:** 0fb31c3
**Status:** fixed: requires human verification (logic change)
**Applied fix:**
- The id/calc string heuristic is replaced by a traced dependency set. Every `compute()` input, model assumption and fixed calculator figure (loaded FTE cost, change cost) is moved in turn. The model and presenter are then re-run, and each claim whose value changes records that input. The 2x multiplier is traced the same way and counts as a hypothesis input.
- Figures built outside the model declare their `inputs`: ops-*, tests-winners-*, matrix totals, tier and auto-share figures, and cap-2x-ref-*.
- A claim is `2x` side if:
  - it was built on the 2x side (presenter scaled/change cells, scenario, Hold, sensitivity, and all Show the maths steps); or
  - its `derived` path is not a `baseline.` path.
- A claim's evidence is the weakest of its ref, its inputs (recursively, through claim inputs) and, if it is 2x side, hypothesis. Each claim now exposes `evidence` and `inputs`.
- The presenter block became `presenterClaims(ctx)` so the trace can re-run it.
- The trace costs about 120 ms (about 50 presenter runs). It is therefore lazy: it runs on the first read of `claim.evidence` or `claim.inputs`, so page load is unchanged. No browser module reads claims.
- The test now checks against an independent oracle:
  - explicit 2x id families must be hypothesis, with at least 120 matches;
  - unit wording ("at 2x", "2x minus", "change" on model figures) must be hypothesis;
  - a hand-checked table covers both directions;
  - no claim may be stronger than its ref;
  - a separate behavioural check: any `derived` claim that moves with the multiplier or with a hypothesis assumption must be a hypothesis.
- Against the old `data.js`, the new test fails three times.

**For human review:** under the plain "weakest of all inputs" rule, most baseline cost and utilisation figures are now `hypothesis`, because the auto-approval share, variant cost, tooling and build days are each classed hypothesis as a whole, including their baseline halves. Examples: `cpcm-base`, `budget-share-base`, `cpa-review-base`, `calc-*-base` for cost, utilisation and brief-to-live. `cpa-base` and `total-cost-base` were already hypothesis for the same reason. This errs towards honesty. If the baseline halves should count as illustrative descriptors of the company, CONTEXT would need a per-side rule.

### WR-01: Labels shown to readers contradict the `observed` definition printed in the grade key

**Files modified:** `site/index.html`, `site/js/data.js`, `test/page.test.js`
**Commit:** ffebd51
**Applied fix:**
- The grade key's `observed` text now reads: "What a named organisation reports about itself, or what is reported to have happened at a named organisation: results, incidents, or published product capabilities. It also covers studies published by a seller or as opinion, which are not independent. The publisher and flag columns say who reported it."
- The middle sentence covers the WR-02 reclassification.
- `benchmark` now reads "A published reference that is independent of what it describes: …".
- The page test pins both texts, and the data.js comment matches.
- A4 is unchanged: vendor pages stay observed and vendor-claimed.

### WR-02: Unflagged vendor-published sources default to `benchmark`

**Files modified:** `site/js/data.js`, `site/index.html`, `test/data.test.js`, `test/evidence.test.js`
**Commit:** d0f3b70
**Applied fix:**
- The rule is now explicit: a source is `benchmark` only if it is independent, meaning its publisherType is not `vendor` and it is not in `OPINION_SOURCES` (haynes-2026).
- mmm-geox, haynes-2026 and seoworks-2026 are now `observed`, and their register Evidence cells are updated.
- mmm-geox also receives the `vendor-claimed` flag: it is Google documenting its own tool, and no body figure cites it, so no chip or body text changes. The data.test pin is updated.
- haynes-2026 and seoworks-2026 keep no flag. Flagging them would force `vendor-claimed` spans onto the `aeo-*` body figures that the body calls "non-vendor traffic studies". They sit on a reasoned `UNFLAGGED_OBSERVED` list in the evidence test.
- New test: benchmark implies publisherType is not vendor.
- Source counts are now 12 benchmark/Benchmark, 4 benchmark/Modelled and 29 observed/Modelled.

### WR-03: Two programme-effect assumptions are classed `illustrative`

**Files modified:** `site/js/data.js`, `site/index.html`, `test/evidence.test.js`
**Commit:** 6e36397
**Applied fix:**
- `asm-change-mgmt` and `asm-incident-rate` are added to `HYPOTHESIS_ASSUMPTIONS` and to the test list, which now has 31 entries.
- Their register Evidence cells now read `hypothesis`.
- Counts are now 24 hypothesis/Modelled, 7 hypothesis/Speculative, 31 illustrative/Modelled and 0 illustrative/Speculative.

### WR-04: The heading outline is flattened, and appendices have duplicate h2/h3 titles

**Files modified:** `site/index.html`, `site/assets/style.css`, `test/page.test.js`, `test/calc-page.test.js`, `test/style.test.js`, `test/diagram.test.js`, `test/inventory.test.js`
**Commit:** 525d306
**Applied fix:**
- **Body sections:** in the 9 hosted body blocks (s01, s02, s03, s04, s09, s10, s11, s13, s14), the 24 inner h3s are now h4. This includes the s09/s14 id'd headings and the Figure 2/3 steps headings.
- **Appendices:** the six appendices (s05, s06, s07, s08, s12, s15) had the same title on the h2 and the h3. The duplicate h3 is removed, and its `sNN-h` id moves onto a span inside the appendix h2, for example `<h2 id="appendix-campaign-h"><span id="s05-h">…</span></h2>`. Every v1 id still resolves, and the appendices' inner headings stay h3 directly under the h2.
- `#s11-h` is untouched: it is still an h3, and ui.js still focuses it.
- **CSS:** h4 shares the h3 rule. The `.believe`, `.backlog0` and `.risk` heading rules, and the print rules, now target h4.
- **Tests:** they pin the new shape: 9 hosted h3s, 6 appendix spans, 23 h3, 24 h4 and 0 h5. They also check that no h3 appears inside a hosted body block and no h4 inside an appendix block. The legacy `sectionHtml` view synthesises the old heading for appendix blocks.

### WR-05: `aria-labelledby` on 15 role-less `div.subsection` elements is prohibited and has no effect

**Files modified:** `site/index.html`, `test/page.test.js`, `test/a11y-static.test.js`, `scripts/a11y.mjs`
**Commit:** 29d368f
**Applied fix:**
- `aria-labelledby` is dropped from all 15 subsection divs; no landmarks were added.
- The HOSTED test's opening tag is updated.
- New static test: no role-less div or span carries `aria-label` or `aria-labelledby`.
- New a11y gate check "no named generic elements", which passed in the final gate run.

### WR-06: Guard tests were weakened during the move

**Files modified:** `test/page.test.js`
**Commit:** 917b46d
**Applied fix:**
1. The variant-count guard scans every `data-fig` on the page, with scripts blanked. Each hit is attributed to the innermost v1 block, else to its top-level section (including `#answer`), else to "outside". Self-checks plant a matrix figure in `#answer` and in the `#autonomy` stub, and assert that both are caught.
2. The numeric gate's heading exemption now covers only h2/h3 ids in SECTION_IDS ∪ V1_IDS, plus the appendix span form.
3. The link exemption now covers only "section N/word" and "Appendix A–F" label text.
- Checked by hand: planting `<h3 id="savings-h">Cuts cost 40%</h3>` or `<a href="#economics">saves 40%</a>` now fails the gate.

### WR-07: The `#autonomy` stub presents an unproven claim as settled, with no grade

**Files modified:** `site/index.html`
**Commit:** 4abef21
**Applied fix:**
- The stub now opens "Would giving agents responsibility for whole workflows, rather than asking them for more content, raise what a marketing team can complete?", as the reviewer suggested.
- The section title "Why autonomy is the lever" is locked by CONTEXT and the SECTIONS test, so it was not changed. It still presupposes the answer; consider it when Phase 7 fills the section.

### WR-08: The jargon guard skips author-written assumption text and never scans JS-rendered copy

**Files modified:** `test/guards.test.js`
**Commit:** 29909e5
**Applied fix:**
- `bodyText` now drops only the title text in each source row's first cell, which matches all 45 source rows. Assumption rows and the rest of each source row are scanned.
- New test: the ban list is run over:
  - every string literal, with comments removed, in model.js, ui.js, fields.js, panels.js, format.js, state.js, svg.js and calc.js;
  - the reader-facing fields of data.js: assumption label, display, basis and unit; claim unit and display; source bias, read_via and publisher, but not titles.
- Mutation checks cover each path. There are no current hits.

### IN-01: Shipping scripts import from the test tree, and smoke now throws instead of reporting FAIL

**Files modified:** `scripts/lib/html.mjs` (moved from `test/helpers/html.js`), `test/helpers/html.js` (now a re-export), `scripts/smoke.mjs`, `scripts/snapshot-v1-inventory.mjs`
**Commit:** 474eda1
**Applied fix:**
- The helpers now live in `scripts/lib/html.mjs`, and the scripts import them from there. `test/helpers/html.js` re-exports them, so no test imports changed.
- `s11Of` catches a missing `#s11` and records `FAIL s11` instead of aborting the run.

### IN-02: The snapshot script silently overwrites the frozen fixture

**Files modified:** `scripts/snapshot-v1-inventory.mjs`
**Commit:** cda7388
**Applied fix:** the script exits 1 with an explanation if `test/fixtures/v1-inventory.json` exists, unless `--force` is passed. Checked: it exits 1 today.

### IN-03: `.to-follow` duplicates `.later` declaration for declaration

**Files modified:** `site/assets/style.css`
**Commit:** 5560763
**Applied fix:** the rules are merged into `.later, .to-follow { … }`, in both the screen and the print blocks.

### IN-04: A stale test message and a trivially true assertion

**Files modified:** `test/calc-page.test.js`, `test/helpers.test.js`
**Commit:** 1f4f021
**Applied fix:**
- The tabindex message now names the s11-h heading, and the regex also covers h4.
- The helpers test now asserts `<div>` balance for each v1 block, alongside the section check.

### IN-05: `diagram.test.js` assigns a figure to the last v1 opening tag before it

**Files modified:** `test/diagram.test.js`
**Commit:** 1e9d365
**Applied fix:** each figure is attributed to the innermost v1 element that actually contains it, using the start and end offsets from `elementById`.

### IN-06: Cross-reference label styles are inconsistent

**Files modified:** `site/index.html`, `test/page.test.js`
**Commit:** 69566af
**Applied fix:**
- All section cross-references now use "section NN" (or "Section NN" at the start of a table cell): section 01, 03, 04, 05 and 06. The data.js and register "section 08/09" basis texts were already in this form.
- The unlinked "section one" became a link, `<a href="#s01">section 01</a>`; the six-lever table it names is in s01. Linking it keeps it inside the narrowed numeric-gate exemption.
- The test now requires two-digit labels on links and in prose, with source titles excluded.

### IN-07: The "factory" link points to Appendix A, not to the factory model

**Files modified:** `site/index.html`
**Commit:** db7585c
**Applied fix:** the link text is relabelled "worked campaign" and the target `#s05` is kept. That is where the variants are counted, which matches the s05/s07 variant-count guard.

### IN-08: The `gates.sh` retry reads a file that an asynchronous `tee` may still be writing

**Files modified:** `scripts/gates.sh`
**Commit:** 3ad97bd
**Applied fix:**
- `retry_once` now writes stderr to the file, waits for the command, and then echoes the file. grep therefore reads a complete file.
- The 1 s pause is kept, now just before the retry.

---

_Fixed: 2026-10-25T12:10:54Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
