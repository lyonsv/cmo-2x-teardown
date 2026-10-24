---
phase: 02-factory-spine-slice
reviewed: 2026-10-24T18:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - site/assets/style.css
  - site/index.html
  - site/js/calc.js
  - site/js/data.js
  - test/calc.test.js
  - test/data.test.js
  - test/diagram.test.js
  - test/figure.test.js
  - test/page.test.js
  - test/style.test.js
findings:
  critical: 2
  warning: 10
  info: 12
  total: 24
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-10-24T18:00:00Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

Scope: `git diff d3bd0ff^..HEAD` for the files listed above. All 155 tests pass (`node --test`). `variantMatrix()` edge cases were checked with a scratch probe script, and so was every chip on the page against the grade of its target in data.js. Prior items IN-03, IN-04, IN-06 and IN-08 from 01-REVIEW are deliberately deferred and are not raised again here.

The maths in `variantMatrix()` is correct for valid input. Every `data-fig` on the page matches data.js. No chip currently shows the wrong grade for its target.

The defects fall into four groups:

- **Honesty.** Two statements on the published page contradict the page's own model: the "small chance" of human review, and the matrix total labelled "approved-live". Some provenance is hidden behind the wrong chip target. The tier rules contradict each other.
- **Tests.** The new chip-density rule is looser than the rule it replaced in ways that matter: standalone chips and flags are never checked against data.js. One rule also forces wrong `ref`s into data.js.
- **`variantMatrix()` validation.** It accepts inputs that Phase 3 will hit: duplicate ids and sparse arrays.
- **Neutrality.** One neutrality asymmetry in the imagery table (indemnity), which is sensitive because of the COI. The Getty source row still carries a pre-publication to-do.

## Critical Issues

### CR-01: s05 says derived variants reach the gate "with a small chance of sending anything to a person"; the model sends 46% to a person at 2x

**File:** `site/index.html:395`; related `site/index.html:508`, `site/js/data.js:132-133`
**Issue:** The sentence reads: "Most variants are mechanical derivations of approved masters, which is why most land in low-risk tiers and reach the auto-approval gate with a small chance of sending anything to a person."

The page's own `compute()` says otherwise. At 2x the human-touch share is `h = 1 − auto × (1 − (sampling + escalation)) = 1 − 0.6 × 0.9 = 0.46`, so 46% of generated variants get a human review. Even inside T0+T1 (85%), clearing 71% with 10% of those sampled or escalated leaves about 36% of low-tier variants in front of a person. The capacity table in s07 (7,747 human hours at 2x with the gate) depends on exactly this volume.

A CFO who reads s05 and then s07 meets two incompatible statements, and the binding-constraint argument of s07 is weakened by the earlier claim. This breaks the Honesty constraint, and the sentence has no chip.

A related point: line 508 says the agent must clear "about 71% of those with no human". The `asm-auto-approval` basis (data.js:133) says "cleared with no human touch". But `side()` sends a further `sampling_rate + escalation_rate` (10%) of auto-approved variants to a human, so "no human touch" overstates the case.

**Fix:** Replace the clause with a graded figure from the model. Add a derived claim `human-touch-share-scaled` = `1 − auto × (1 − q)` (0.46, ref `asm-auto-approval`), then write:
```html
…which is why most land in low-risk tiers. Even so, at 2x about <span data-fig="human-touch-share-scaled">46%</span> <a class="chip c-m" href="#asm-auto-approval">Modelled</a> of derived variants still reach a person, which is why <a href="#s07">the auto-approval gate</a> matters.
```
Change the `asm-auto-approval` basis to "cleared by the gate; a sampled or escalated share is still seen by a person".

### CR-02: The matrix total is labelled "approved-live" but counts derived variants before the gate, which contradicts the page's own metric definition

**File:** `site/index.html:390` (row header "Total approved-live variants"); `site/js/data.js:326-327` (units "approved-live variants in the worked campaign" and "...per master concept"); `test/page.test.js:597` (locks the label)
**Issue:** s01 defines the headline metric as approved-and-live variants only: "Assets that are generated but not approved never count", and output is derived "at an approval yield of 95%". `variantMatrix()` multiplies concepts by expansion factors. It has no yield term, so its 12,000 is the number of *derived* variants entering review. At the page's own 95% yield, about 11,400 are approved-live.

Labelling the derived count as approved-live is the exact conflation the page's s01 definition and falsifier exist to prevent. The test pins the wrong label, so a fix will fail CI until the test is changed as well. The s05 lead (line 335) correctly says only "variants". The table and claim units do not.

**Fix:** Rename the row header to "Total derived variants" and the claim units to "derived variants…". Optionally add a row "Approved-live at the approval yield" with a claim `matrix-approved` = `total × approval_yield` (ref `asm-approval-yield`). Update `test/page.test.js:597` to match.

## Warnings

### WR-01: Chip targets are chosen to satisfy the one-chip-per-row test, not to match provenance (capacity table and reference-rate utilisation)

**File:** `site/js/data.js:378, 383-389`; `site/index.html:525-528, 533`; `test/page.test.js:94-99`, `test/page.test.js:769`, `test/data.test.js:290`
**Issue:** The row rule requires every `data-fig` in a row to share the single chip's `ref`, so every capacity claim is given `ref: 'asm-auto-approval'`. That includes:
- `cap-capacity-hours` (14,400). This is `reviewer_fte × reviewer_hours_per_fte_year` and has nothing to do with auto-approval.
- `cap-*-variants`, which do not depend on auto-approval either.

A reader who clicks the chip next to 14,400 lands on a row that cannot explain it. `asm-reviewer-fte` and `asm-reviewer-hours` are not linked from s07 at all.

Worse, at line 533 `cap-2x-ref-high-util` (100.1%) and `cap-2x-ref-low-util` (111.3%) are computed from the *company-reported* code-review rates of the reference. Yet they sit under the `asm-auto-approval` chip with no flag, which presents them as outputs of the page's own 60% assumption. The provenance (company-reported, a different domain) disappears at the point where it matters most.
**Fix:**
- Give `cap-capacity-hours` `ref: 'asm-reviewer-hours'` and move it out of the per-row cells, for example into the caption or a header note ("capacity 14,400 h/yr").
- For the variants column, either relax the row rule to "every data-fig's ref is linked somewhere in the same table" or point it at `asm-variants-per-concept`.
- Re-ref the two reference-rate utilisations to `src-intercom-2x-teardown` and render them with the `company-reported` flag.
- Update `test/data.test.js:290`, which hard-codes the wrong ref for all override claims.

### WR-02: The tier rules contradict each other and the diagram disagrees with the table it defers to

**File:** `site/index.html:500` (T1: "New copy inside an approved claims library"), `site/index.html:513` (Always human: "Claim-bearing … content"), `site/index.html:487-488` vs `499-500`
**Issue:**
- T1 lets "new copy inside an approved claims library" be cleared by "Agent pass; human sample", which means it can be auto-approved. The "Always human" list says claim-bearing content "never auto-approve[s], whatever the agent's verdict". A governance reader cannot follow both.
- Figure 6 labels T0 "gate: auto-approve" and T1 "approved templates". The table says T0 is "Policy match; human sample", and it puts "feed tiles from approved templates" in T0, not T1.
- T2 lists "new audience segments". The worked matrix expands 75% of items across 5 audiences. If those count as new segments, most of the 12,000 are T2, which contradicts "most land in low-risk tiers".

**Fix:**
- Narrow the always-human item to "new or comparative claims, testimonials and endorsements", and state that copy drawn verbatim from a pre-approved claims library is the one claim-bearing exception allowed in T1. Or move that row to T2.
- Align the Figure 6 node text with the table ("T0 · resizes and swaps / policy match + sample"; "T1 · library copy, templates / agent pass + sample").
- Say explicitly that audience variants built from existing segments are T0/T1.

### WR-03: The company-reported reference datum is graded Modelled, which the page's own legend does not allow

**File:** `site/js/data.js:361-364`; `site/index.html:470`; `test/data.test.js:252-262`; `test/page.test.js:17`
**Issue:** The legend defines Modelled as "Derived by this page from stated assumptions; change the assumption and the number changes." 19.2% and 28.4% are not derived from any assumption on this page. They are figures the reference reported. Labelling them Modelled misuses the grading system, which is the page's main promise, and the tests lock that in (`SRC_GRADE` override, `data.test` pin).

The page also has no rule for which grade a secondary, company-reported datum gets. Separately, `ref-bot-approval-rate` (28.4%) is shown with no `company-reported` flag (line 470), because only the first datum in the paragraph carries one.
**Fix:** Grade both as Benchmark with `flag: 'company-reported'`. The legend says the flag "never raises a grade", and the source is checkable. Or add a written rule in the legend for secondary reports and apply it the same way everywhere. Show the flag after each flagged figure, or state once in the sentence that both are company-reported.

### WR-04: The imagery table lists indemnity conditions only for the generate route; given the COI, this is a neutrality asymmetry

**File:** `site/index.html:408`; `site/js/data.js:186-188`
**Issue:** In the Indemnity row, retrieve and license say "Often set by the contract.", while generate says "Conditional; scope, tiers and exclusions vary by provider." The `asm-imagery-indemnity` basis describes only AI-provider indemnity limits (paid tiers, safeguards, knowledge exclusions, caps).

Stock-licence indemnities are also tiered and capped. Standard licences commonly carry low caps that can be raised for a fee, and they exclude modified or misused content. The author works for a licensing vendor, so presenting the caveats for one route only is the kind of tilt the COI note promises not to make. The tests check for banned ranking words but cannot catch asymmetric qualification.

The Copyrightability row has the same governance issue in a different form. One Benchmark chip to the USCO report covers the retrieve and license cells too, which that source does not address.
**Fix:**
- Make the cells parallel, for example License: "Conditional; caps and exclusions vary by licence tier." Retrieve: "Inherits the original licence's indemnity, if any."
- Extend the `asm-imagery-indemnity` basis to cover stock-licence terms.
- In the Copyrightability row, either restrict the Benchmark chip's scope ("Generate column: USCO") or grade the row Modelled with USCO cited in the basis.

### WR-05: The published Getty source row still says the author must confirm it "before publishing", and the source actually used to verify it is not registered

**File:** `site/js/data.js:46-54`; `site/index.html:415`
**Issue:** `read_via` reads: "the author is to confirm both and the Court of Appeal status in a browser before publishing". Phase 2 is live (02-08), so the public register shows an unresolved pre-publication to-do on the one claim about the author's employer's litigation.

02-08-SUMMARY records that the re-check used ailawsuittracker.com, not Taylor Wessing (still 403). That source is not in the register. The Getty line also states things the registered source's title does not cover:
- "dismissed Getty's secondary copyright claim"
- "upheld a narrower trade mark claim"
- "a separate US action was refiled in California", which rests on a Bloomberg Law *headline only*, per `read_via`.

None of these carries a chip.
**Fix:**
- Update `read_via` to the actual verification: tracker URL, the dates it reviewed, and "Taylor Wessing article not read".
- Add the tracker as a source row.
- Either drop the US-refiling clause or register a source that was actually read.
- Put a grade chip on the line (Modelled, matching the row), so the sentence is graded like every other claim.

### WR-06: The new chip-density rule never checks standalone chips or flags against data.js

**File:** `test/page.test.js:63-111`
**Issue:** The rule that this phase replaced checked chip word, class and href for every `data-fig`. The new rule leaves several gaps:
- For `p` and `prose` units, only a chip directly after the first figure of each ref is checked. Trailing standalone chips are checked only for class ↔ word, never word ↔ the target's grade in data.js. Examples are `asm-review-agent-design` (line 469), `asm-fatigue-controls`, `asm-harness-design` and `asm-telemetry-metrics`.
- For `row` units without `data-fig`s, only `linked.length <= 1` is asserted. This covers every imagery, harness and lever row.

So `<a class="chip c-b" href="#asm-imagery-routes">Benchmark</a>` would pass every generic test. The specific tests for s05 and s08 assert href but not grade.

Flags are not enforced anywhere generically. A `vendor-claimed` figure (coming in s12) can appear with no flag and pass, and `ref-bot-approval-rate` already does (WR-03). The probe found no current mismatch, so this is a gap in the guard rather than a live defect.

**Fix:** Add one global test:
```js
for (const [, cls, href, word] of html.matchAll(/<a class="chip (c-[bms])" href="#([^"]+)">([^<]+)<\/a>/g)) {
  const g = href.startsWith('src-') ? sourceGrade(href.slice(4)) : assumptions[href]?.grade;
  assert.equal(word, g, `chip to #${href} says ${word}, target is ${g}`);
}
const units = collectUnits().units;
for (const c of Object.values(claims).filter((c) => c.flag)) {
  for (const u of units.filter((u) => u.html.includes(`data-fig="${c.id}"`) && u.kind !== "register")) {
    assert.ok(u.html.includes(`<span class="flag">${c.flag}</span>`), `${c.id}: flag ${c.flag} missing`);
  }
}
```

### WR-07: Source grades and flags live only in the test file, not in data.js

**File:** `test/page.test.js:16-17, 109`; `site/js/data.js:9-63`; `site/index.html` source register Flag column
**Issue:** `SRC_GRADE` is a test-local override map. Sources in data.js have no `grade` or `flag` field. The register's Grade and Flag cells for sources (for example "Modelled" and "company-reported" on `src-intercom-2x-teardown`) are therefore typed by hand and compared with a second hand-typed table in the test. The Flag cell is not compared with anything.

This bypasses the CRED-06 single source. It was added twice as a workaround (02-04 and 02-05) instead of fixing the model, and Phase 3's register rendering will have nothing to read.
**Fix:** Add `grade` and `flag` to each source in data.js, delete `SRC_GRADE`, and assert in `source register rows match data.js` that the Grade and Flag cells equal `src.grade` and `src.flag ?? 'none'`.

### WR-08: The Figure 6 text-equivalent exemption passes vacuously

**File:** `test/diagram.test.js:140-146`; `site/index.html:476-492`
**Issue:** For Figure 6 the test requires only that the caption says "see the table" and that the string `<table>` appears anywhere between the figure and the end of the section. The capacity table later in s07 would satisfy it. Nothing checks that the table's tier rows carry the node content. The table and figure in fact disagree (WR-02). The "auto above, human below" divider is also expressed only in the SVG.
**Fix:** Assert that the *next* element after `</figure>` is the tier table region. Assert that each Figure 6 node title's tier (T0–T3) and its approver wording appear in the matching table row, and that the "Who approves" cells for T0/T1 mention a sample or auto path while those for T2/T3 mention a human.

### WR-09: `variantMatrix()` accepts duplicate factor ids and sparse arrays; data.js keys claims by id

**File:** `site/js/calc.js:237-255`; `site/js/data.js:320-325`
**Issue:** These were confirmed with the probe:
- `variantMatrix(2, [{id:'a',count:2,applies:1},{id:'a',count:3,applies:1}])` returns `ok: true`. data.js builds `matrix-${row.id}-*` claims and `asm-matrix-${f.id}` assumptions, so a duplicate id silently overwrites the first factor's claims while the total still includes both.
- `variantMatrix(2, [ , {...}])` returns `ok: true` with `rows: [<hole>, {...}]`. `forEach` and `map` both skip holes, so validation never sees index 0, and any consumer that does `rows[i].id` throws.

Phase 3 makes the matrix interactive and reuses this function, so both inputs become reachable from the UI.
**Fix:**
```js
const ids = new Set();
for (let i = 0; i < factors.length; i++) {
  const f = factors[i];
  const src = f && typeof f === 'object' ? f : {};
  // ...existing checks...
  if (typeof src.id === 'string' && ids.has(src.id)) errors.push({ field: `factors[${i}].id`, message: 'id must be unique' });
  ids.add(src.id);
}
```
Use an indexed `for` loop so holes are validated as `{}`. Add both cases to the validation test table.

### WR-10: The "no variant is double counted" claim is asserted but not supported; sizes and channels are not independent, and the channel wording does not match the maths

**File:** `site/index.html:394`; `site/js/data.js:206-207, 219-221`
**Issue:**
- The page states "The factors are independent… so no variant is double counted". In practice sizes are largely dictated by channel (placement specs). Applying all 10 sizes to every item and then multiplying 75% of items by all 5 channels counts a channel × size combination that does not exist. The register even concedes "a size that a channel does not take".
- The channels basis says "75% of the items going to more than one channel". `1 + 0.75 × (5 − 1)` models 75% going to *all five*.
- Nothing tests the independence claim. The "order independent" test (calc.test) only proves that multiplication commutes.

**Fix:**
- Reword to "treated as independent for illustration; real campaigns have correlated factors (sizes follow channels), so the total is an upper-bound sketch".
- Change the channels wording to "75% of the items rendered for all five channels".
- Consider merging sizes and channels into one "placements" factor.

## Info

### IN-01: The "independent enumerator" and order-independence tests restate the formula

**File:** `test/calc.test.js:415-445`
**Issue:** `enumerate()` computes `k × count + (items − k)` with `k = items × applies`. That is the same expression as `1 + applies × (count − 1)`, differing only by rounding, so it cannot catch a modelling error. Order independence is guaranteed by commutativity.
**Fix:** Add a real enumerator over a small explicit set, for example tagging items and expanding them, and assert counts for a hand-built case with a non-trivial fraction.

### IN-02: The Figure 1 legibility test asserts a constant

**File:** `test/style.test.js:105-111`
**Issue:** `assert.ok((12 * 800) / 960 >= 10)` is always true. It does not read Figure 1's viewBox width or the CSS text size.
**Fix:** Parse the `viewBox` width from the `svg.fig` element and the `.fig text` font size from CSS, and compute the ratio from those.

### IN-03: Five identical "Steps in this figure" headings

**File:** `site/index.html:250, 288, 363, 445, 572`
**Issue:** In a screen reader's heading list these are indistinguishable (WCAG 2.4.6).
**Fix:** Use "Steps in Figure 2" and so on, or a visually hidden suffix. Update `diagram.test.js:125`.

### IN-04: The vendor denylist is incomplete and scoped to s03–s08 only

**File:** `test/page.test.js:359-373`
**Issue:** `VENDOR_RE` misses many likely names, for example meta, tiktok, linkedin, sora, veo, imagen, flux, ideogram, figma, workfront, sprinklr, celtra, persado, typeface and writer. The answer, s01, s02 and the s09–s14 stubs are checked only for gradial, airops and profound.
**Fix:** Apply `VENDOR_RE` to everything outside s12 and s15, excluding the COI and Getty line, and extend the list.

### IN-05: Reference rates are duplicated as literals in the capacity overrides

**File:** `site/js/data.js:388-389`; `test/data.test.js:273`
**Issue:** 0.192 and 0.284 are typed again instead of read from `claims['ref-auto-approved-share'].value`. If the reference figure is corrected, the 100.1% and 111.3% figures silently stop matching it.
**Fix:** Use `claims['ref-auto-approved-share'].value` in the override.

### IN-06: `<time>` inner text and SVG text are exempt from every numeric check

**File:** `test/page.test.js:417, 422`; `test/diagram.test.js:131-138`
**Issue:**
- The gate strips `<time>` with any inner text and checks only the `datetime` attribute.
- It strips the whole `<svg>`. The no-digits test covers steps and captions, but not SVG `<text>`, `<title>` or `<desc>` in Figures 2–7.

**Fix:** Assert that the inner text of `<time>` equals its `datetime`, and extend the no-digits check to each `fig-d` SVG once `T[0-3]` has been removed.

### IN-07: A claim about the reference in s08 has no source link

**File:** `site/index.html:601`
**Issue:** "In the one public reference, most tested changes were inconclusive and a newer model tested worse" is a factual claim about the reference. Its only chip points to `asm-harness-design`, not to `src-intercom-2x-teardown`.
**Fix:** Link "the one public reference" to `#src-intercom-2x-teardown`.

### IN-08: Units for percentage values are inconsistent across claims

**File:** `site/js/data.js:237-242` vs `361-364`
**Issue:** `nyu-ctr-lift` and `nyu-disclosure-drop` store percent values (19, −31.5). The reference and tier claims store fractions (0.192). Phase 3 code that reads `value` will mix scales.
**Fix:** Store fractions throughout and format with `pct0` or `pct1`.

### IN-09: The Benchmark colour is reused as the diagram accent

**File:** `site/assets/style.css` (`.fig-d .node-review rect`, `.edge-review`)
**Issue:** `--verified` is the Benchmark chip colour. In wholly Illustrative diagrams, green review paths can read as "verified".
**Fix:** Add a dedicated `--accent` token, or note it in the legend.

### IN-10: Figure 5 has no direct path from agent to escalation for "could not check"

**File:** `site/index.html:432-442, 451`
**Issue:** Step 5 says an asset is escalated "when the loop runs out, or something could not be checked". The SVG only draws Fix → Escalate.
**Fix:** Add an edge from the review agent to the escalate node, or reword the step.

### IN-11: Formatting slip in data.js

**File:** `site/js/data.js:54`
**Issue:** `},  'intercom-2x-teardown': {` runs two entries onto one line.
**Fix:** Put the entry on its own line.

### IN-12: `variantMatrix()` returns non-integer "variants"

**File:** `site/js/calc.js:251-257`
**Issue:** With fractional `applies` the result is an expected count, for example `variantMatrix(1, [{count:2, applies:0.3}])` gives 1.3. The defaults happen to be integral, but nothing documents this.
**Fix:** Document "expected count" in the JSDoc and in the s05 note, or round at display only. Phase 3 will need this.

---

_Reviewed: 2026-10-24T18:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
