---
phase: 05-restructure-scaffold-evidence-schema-guards
reviewed: 2026-10-25T09:18:44Z
depth: standard
files_reviewed: 25
files_reviewed_list:
  - README.md
  - scripts/crosscheck.mjs
  - scripts/gates.sh
  - scripts/smoke.mjs
  - scripts/snapshot-v1-inventory.mjs
  - site/assets/style.css
  - site/index.html
  - site/js/data.js
  - test/calc-page.test.js
  - test/compare.test.js
  - test/crosscheck.test.js
  - test/diagram.test.js
  - test/evidence.test.js
  - test/figure.test.js
  - test/fixtures/retired.json
  - test/fixtures/v1-share-links.json
  - test/fixtures/v1-inventory.json
  - test/guards.test.js
  - test/helpers.test.js
  - test/helpers/html.js
  - test/inventory.test.js
  - test/legal.test.js
  - test/page.test.js
  - test/share-links.test.js
  - test/style.test.js
findings:
  critical: 1
  warning: 8
  info: 8
  total: 17
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-10-25T09:18:44Z
**Depth:** standard
**Files Reviewed:** 25
**Status:** issues_found

## Summary

The diff from 7aa0bc2 to HEAD was reviewed. The mechanical move in `site/index.html` is structurally sound. Tags balance (16/16 section, 139/139 div). Every v1 id is still on the element that holds its content. TOC hrefs resolve. Cross-reference labels point to the right new section or appendix.

The main defect is in the evidence schema. The 2x-side detection in `data.js` relies on a heuristic over `calc`, `derived` and `id` strings, and that heuristic misses whole families of derived claims. As a result, 44 claims that describe the programme at 2x are labelled `illustrative` instead of `hypothesis`. `test/evidence.test.js` copies the same heuristic line for line, so it confirms the error instead of catching it.

Further issues:
- Some source labels shown to readers contradict the evidence definitions printed in the grade key.
- The heading outline was flattened by the demotion.
- Several guard tests were made weaker in ways that will matter when Phases 7–10 add new content.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: 44 derived 2x claims are classed `illustrative`, and the evidence test repeats the same wrong heuristic

**File:** `site/js/data.js:1134-1144`, `test/evidence.test.js:65-79`
**Issue:** CONTEXT requires that "derived claims inherit the weakest class of their inputs". It also requires that anything on the 2x side is at most `hypothesis`. The `twoXSide` predicate does not do this. It only matches `-scaled` ids, `derived` paths starting with `scenario.`, `calc-scen*`/`calc-sens*` ids, and `calc` paths containing `scaled|change|scenario|sensitivity`. It misses the following (verified by dumping `claims`):

- **All 38 `calc-maths-*` claims.** Their `calc` is `maths.<step>.<n>`. Every one is computed at 2x: `mathsPresentation` uses `sc()` (scaled) values, `r.scenario`, and the 60% auto-approval share at 2x. For example, `calc-maths-touch-1` is the 2x auto-approval share. All 38 get `illustrative` because their nominal `ref` is `asm-markets` or `asm-campaigns`.
- **`cpcm-change`** (`derived: ratios.cost_per_campaign_market_change`) and **`budget-share-delta`** (`derived: deltas.production_share_of_budget`). Both are baseline-to-2x changes. The `change` match is applied only to `calc`, not to `derived`, and `deltas.` is not matched at all.
- **`ops-incidents`, `ops-exposure-lo`, `ops-exposure-hi`, `ops-exposure-wilful`.** These are computed from `claims['concepts-scaled']` (the 2x master concepts, line 1011). Their unit text even says "at 2x master concepts". They inherit `illustrative` from `ref: 'asm-incident-rate'` because only `c.ref` is consulted.

More generally, the rule reads only one nominal `ref` per claim. That ref is an arbitrary anchor (`asm-markets` for most calculator outputs), not the set of inputs. So "weakest of inputs" is not implemented anywhere.

These values are not rendered yet. However, `data.js` is the single source of truth, and Phase 9 (ECONP-03) is scheduled to display claim evidence in the economics tables. The test `claim evidence is the weakest of its ref and the 2x-side rule` re-implements `twoXSide` byte for byte (evidence.test.js:67-68), so it is tautological and fixes the wrong values in place.

**Fix:** Classify by what the claim describes, not by string matching. For example, mark presenter outputs explicitly:

```js
// data.js – when building presenter claims
const side = cellName === 'base' ? 'base' : 'twoX';          // rows/sens/scen
claims[id] = { ..., side };
// maths: every step is at 2x
figClaim(part.fig, part, ..., { side: 'twoX' });
// ratios./deltas./ops-*: side: 'twoX'

const twoXSide = (c) => c.side === 'twoX';
```

In the test, replace the copied predicate with an independent oracle. For example, hard-code the expected sets: assert that every `calc-maths-*`, `ops-*`, `cpcm-change` and `budget-share-delta` claim is `hypothesis`. Add an assertion that no claim whose `unit` contains "at 2x" is better than `hypothesis`.

## Warnings

### WR-01: Labels shown to readers contradict the `observed` definition printed in the grade key

**File:** `site/index.html:43-45` (evidence key), `site/js/data.js:578-580`
**Issue:** The key tells readers that `observed` means "Measured results reported by a named organisation … The flag column says who reported it." Two groups of register rows break this:

- **Vendor pages with no measured results.** 15 vendor rows are labelled `observed` but contain no measured results: `gradial-integrations`, `gradial-docs-*` (5), `gradial-platform`, `gradial-home`, `gradial-geo`, `airops-pricing`, `airops-enterprise`, `airops-home`, `profound-agents`, `profound-pricing`, `profound-home`. They are product, pricing and home pages. The phase research said so itself (RESEARCH A4: "Over-states what docs evidence"). A4 was accepted by the orchestrator, but the displayed definition was not widened to match, as was done for A1.
- **Press incidents with no flag.** Three press incidents (`incident-mcdonalds-nl-2025`, `incident-cocacola-2025`, `incident-guess-vogue-2025`) are `observed` with Flag `none`. So "the flag column says who reported it" is false for those rows.

On a page whose core rule is that labels never overstate, this is a visible honesty inconsistency.

**Fix:** Either widen the key, for example: "Observed: what a named organisation reports or states about itself or an event, such as case results, product documentation or a reported incident. Where it is not independent, the flag column says who reported it". Or reclassify the 15 non-results vendor pages. Add a page test that pins the definition to the classification rule.

### WR-02: Unflagged vendor-published sources default to `benchmark`

**File:** `site/js/data.js:579`
**Issue:** The rule is `src.flag || key.startsWith('incident-') ? 'observed' : 'benchmark'`. Every source without a flag therefore becomes `benchmark`, including `publisherType: 'vendor'` sources: `mmm-geox` (vendor product docs), `haynes-2026` ("GEO is a distraction", an opinion piece) and `seoworks-2026`. The key defines benchmark as "an industry survey, statistic or study, or a primary legal or regulatory text". A vendor opinion post is none of these. No test checks that `benchmark` sources are independent; `INDEPENDENT` is applied only to `observed`.
**Fix:** Make the classification explicit per source (an `evidence` field in each literal) rather than inferring it from `flag`. Add a test that a `benchmark` source with `publisherType` in `{vendor, company, author}` must appear on an explicit, reasoned allow-list. Gartner (company) would be on that list.

### WR-03: Two programme-effect assumptions are classed `illustrative`

**File:** `site/js/data.js:998-1000` (`asm-incident-rate`), `site/js/data.js:1041-1042` (`asm-change-mgmt`), `site/js/data.js:1122-1129`
**Issue:** CONTEXT says assumptions "that describe a programme effect are `hypothesis`".

- `asm-change-mgmt` is a cost that exists only because of the programme: training and process change per affected FTE.
- `asm-incident-rate` is used only to project rights incidents at 2x master concepts.

Neither describes the illustrative company. Both are absent from `HYPOTHESIS_ASSUMPTIONS`. The evidence test hard-codes the same 29-id list, so it cannot detect this.
**Fix:** Add both to `HYPOTHESIS_ASSUMPTIONS` and to the test's `HYPOTHESIS` list. Then update the counts: 31 hypothesis (24 Modelled, 7 Speculative), 31 illustrative Modelled, 0 illustrative Speculative. Alternatively, record in CONTEXT why they are illustrative.

### WR-04: The heading outline is flattened, and appendices have duplicate h2/h3 titles

**File:** `site/index.html:139-245` (s02), `758` (s10), `780-870` (s09), `908-922` (s13), `963-991` (s14), `1018-1021`, `1085-1100` (s05), `1106-1109`, `1165-1231` (s07), `1244-1304` (s08), `1320-1474` (s12), `1490-1493`, `2507` (s15)
**Issue:** Each v1 heading was demoted from h2 to h3, but its inner h3 sub-headings were not demoted to h4. They are now siblings of the block heading. Examples:
- "Budget: flat in total, not in production" sits at the same level as "The CFO answer".
- "AirOps", "Gradial" and "Profound" sit at the same level as "How this compares".
- "Localisation and transcreation" sits at the same level as "The other five levers".

Screen-reader heading navigation and the print/PDF outline lose the nesting. In addition, every appendix repeats its title twice in a row. For example, h2 "The 10,000-asset campaign" is immediately followed by h3 "The 10,000-asset campaign"; the same happens for B–F. Assistive technology announces the same heading twice.
**Fix:** Demote the inner `<h3>` of each hosted block to `<h4>`, and add matching CSS. Update `MEASURED_H3` and add an h4 count. For appendices where the host title equals the v1 title, either give the h3 a distinct label or make it `visually-hidden`. The id must stay on the div either way.

### WR-05: `aria-labelledby` on 15 role-less `div.subsection` elements is prohibited and has no effect

**File:** `site/index.html:76, 139, 263, 295, 378, 715, 777, 892, 938, 1020, 1108, 1167, 1246, 1322, 1492`
**Issue:** ARIA 1.2 prohibits naming the `generic` role, so `aria-labelledby` on a plain `<div>` is ignored by assistive technology and flagged by axe (`aria-prohibited-attr`). The local a11y gate does not catch this, because `scripts/a11y.mjs:48` only inspects `main section`. `page.test.js` also pins the invalid markup: it requires the exact string `<div id="sNN" class="subsection" aria-labelledby="sNN-h">`.
**Fix:** Either drop `aria-labelledby` from the subsection divs (the h3 already names the content) or add `role="region"` if a landmark is genuinely wanted. Fifteen extra regions is probably too many. Update the `open` string in the HOSTED test.

### WR-06: Guard tests were weakened during the move

**File:** `test/page.test.js:1681-1690`, `test/page.test.js:649`, `test/page.test.js:655`
**Issue:**
1. **Variant-count guard no longer scans the summary or new sections.** The 03.1 guard used to scan every `<section>`, including `#answer`. It now iterates only `V1_IDS`, so a variant-count figure placed in `#answer`, in a framing stub, or in new Phase 7–10 content outside a v1 div is never checked. This is exactly where new content will go.
2. **Numeric gate exempts any heading id ending in `-h`.** It now strips every `<h2>` or `<h3>` whose id matches `[a-z0-9-]+-h`, not only the locked section titles. A future `<h3 id="savings-h">Cuts cost 40%</h3>` would pass ungraded. Only the 15 hosted ids and the 15 SECTIONS titles are actually locked.
3. **Numeric gate exempts any link text pointing at a section.** All link text targeting any section id is exempt, for example `<a href="#economics">saves 40%</a>`.

**Fix:**
1. Iterate over all top-level `<section>` elements plus `#answer`, and attribute hits to the innermost v1 id when one exists.
2. Restrict the heading exemption to ids in `SECTION_IDS ∪ V1_IDS`.
3. Restrict the link exemption to text matching `^(section \w+|Appendix [A-F]|<known title>)$`.

### WR-07: The `#autonomy` stub presents an unproven claim as settled, with no grade

**File:** `site/index.html:256`
**Issue:** "Why does giving agents responsibility for whole workflows, rather than producing more content, raise what a marketing team can complete?" A "why does X" question presupposes that X is true. For a marketing organisation, X is the page's central unvalidated hypothesis, and the stub carries no chip. The project's honesty rule requires every claim to be graded. CONTEXT asks for "one honest framing paragraph stating the question the section answers", and this wording answers the question before the evidence arrives.
**Fix:** "Would giving agents responsibility for whole workflows, rather than asking them for more content, raise what a marketing team can complete? This section will set out the evidence from a published engineering programme that did this, what it measured, and where that evidence stops."

### WR-08: The jargon guard skips author-written assumption text and never scans JS-rendered copy

**File:** `test/guards.test.js:45-48`
**Issue:** CONTEXT excludes only "Register/source titles". `bodyText` removes every `<tr id="asm-…">` row as well. Those rows hold the page author's own Basis prose, for example the `asm-*-design` and `asm-lever-*` text, which is fully in scope for the ban-list. Strings that `ui.js` and `model.js` inject at runtime (status text, maths explanations, scenario labels) are not scanned at all.
**Fix:** Exclude only the Claim/title cell of `src-` rows, for example by stripping `<tr id="src-…">…<td>(title)</td>`, and keep `asm-` rows. Also run `BAN` over the string literals in `site/js/model.js`, `site/js/ui.js` and `site/js/data.js` (basis fields), or over the smoke-test DOM dump.

## Info

### IN-01: Shipping scripts import from the test tree, and smoke now throws instead of reporting FAIL

**File:** `scripts/smoke.mjs:8,16`, `scripts/snapshot-v1-inventory.mjs:6`
**Issue:** `scripts/` depends on `test/helpers/html.js`. Also, `elementById` throws `missing element #s11` when the DOM is incomplete, where the old slice returned an empty string. A load-time race now aborts the whole smoke run with a stack trace instead of a named `FAIL nan`.
**Fix:** Move the helper to `scripts/lib/html.mjs` and import it from both places. Wrap `s11Of` in a try/catch that calls `fail('s11', …)`.

### IN-02: The snapshot script silently overwrites the frozen fixture

**File:** `scripts/snapshot-v1-inventory.mjs:18`
**Issue:** The comment says "never re-run", but nothing enforces it, and `generatedOn` is hard-coded. A re-run silently rebases the inventory guard.
**Fix:** Exit non-zero if `test/fixtures/v1-inventory.json` exists, unless `--force` is passed.

### IN-03: `.to-follow` duplicates `.later` declaration for declaration

**File:** `site/assets/style.css:52-55, 246-249`
**Fix:** `.later, .to-follow { … }` in both the screen and print blocks.

### IN-04: A stale test message and a trivially true assertion

**File:** `test/calc-page.test.js:232`, `test/helpers.test.js:16-22`
**Issue:** The message still says "JS sets the h2 tabindex", but the heading is now an h3. In helpers.test, "slices every v1 section" checks that `<section>` tags balance inside v1 divs, which contain no sections, so it is always 0 = 0.
**Fix:** Update the message. Assert `<div>` balance instead.

### IN-05: `diagram.test.js` assigns a figure to the last v1 opening tag before it

**File:** `test/diagram.test.js:25`
**Issue:** A figure added in Phase 7+ after a subsection closes (for example inside `#build` after `s04`) would be attributed to `s04`.
**Fix:** Pick the innermost v1 element that actually contains `m.index`, using `elementById` start and end offsets.

### IN-06: Cross-reference label styles are inconsistent

**File:** `site/index.html:757, 771, 933, 966, 979, 1339-1395, 2493, 2501, 2523`; `site/js/data.js:988, 990`
**Issue:** The page mixes "section one", "section 01", "section 1", "section 5", "section 08" and "Section four". The cross-reference test accepts all of these forms, so the drift will grow.
**Fix:** Pick one form, for example "section 05", or the title as link text, and assert it.

### IN-07: The "factory" link points to Appendix A, not to the factory model (pre-existing in v1)

**File:** `site/index.html:79`
**Issue:** `<a href="#s05">factory</a>` lands on "The 10,000-asset campaign" (Appendix A), while the factory model is `#s03` (section 04). The move makes the jump more jarring, because it now goes from section 01 into the appendices.
**Fix:** Point the link at `#s03`, or relabel it "worked campaign".

### IN-08: The `gates.sh` retry reads a file that an asynchronous `tee` may still be writing

**File:** `scripts/gates.sh:12-15`
**Issue:** The process substitution `2> >(tee "$err" >&2)` is not awaited, so `grep` can read `$err` before `tee` has flushed it. Then a real CDP flake is not retried. The `sleep 1` hides this in practice but does not guarantee it.
**Fix:** `"$@" 2>"$err"; rc=$?; cat "$err" >&2; if [ $rc -eq 0 ]; then …`

---

_Reviewed: 2026-10-25T09:18:44Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
