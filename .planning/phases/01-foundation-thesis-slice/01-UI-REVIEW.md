# Phase 1 — UI Review

**Audited:** 2026-10-24
**Baseline:** 01-UI-SPEC.md (with the two post-review colour changes: `--inferred` #7A5D0F, cost-stack ramp)
**Screenshots:** not captured (no local dev server, Playwright not installed and not auto-installed). Code-only audit of `site/index.html` (587 lines) and `site/assets/style.css` (115 lines). Rendered-size figures below are computed from the CSS and SVG viewBox, not measured in a browser.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Locked copy matches the contract; stub s12 copy contradicts itself, an "H3 Flat budget" now sits above a +27% cost rise, register repeats text verbatim |
| 2. Visuals | 2/4 | Figure text renders at about 7px on phones and about 9px at tablet widths; 143 chips make the page read as noise; row headers are muted grey caps |
| 3. Color | 3/4 | Tokens and accent reservation are correct; grade colour is spread over 143 chips so the 60/30/10 hierarchy is blurred |
| 4. Typography | 2/4 | A third weight (700) is rendered via unstyled `<strong>`/`<b>`; metric-trio labels have no Label styling; th row headers forced to uppercase mono |
| 5. Spacing | 3/4 | Scale tokens used consistently; no arbitrary values; minor deviations only |
| 6. Experience Design | 3/4 | Native a11y is solid (skip link, regions, focus, targets); self-linking chips and 12 identical stubs weaken navigation value |

**Overall: 16/24**

---

## Top 3 Priority Fixes

1. **Figure 1 text is below the 10px floor the spec sets** (WARNING, borderline BLOCKER for the CFO-04 figure). `svg.fig` is `min-width:560px` at <=480px with a 960 viewBox, so 12px SVG text renders at 12 x 560/960 = 7px. At 768px viewport the SVG is about 720px wide, so text is 9px. Spec: "minimum rendered text must stay >=10px". Fix: set the mobile `min-width` to at least 800px (12 x 800/960 = 10px) and use it from <=960px, or author a narrower mobile viewBox. Keep the focusable `.fig-scroll` wrapper.
2. **Third font weight and unstyled Label elements** (WARNING). `style.css` has no rule for `strong` or `figcaption b`, so the answer-first sentence (`index.html:33`), the s01 `<b>` (`:67`) and "Figure 1" (`:201`) render at the UA 700, breaking the "exactly 2 weights (400/600)" rule. Fix: add `strong, b { font-weight: 600; }`. Also `.metric-trio .lbl` (`:70-72`) has no rule (only `.callout .lbl` exists), so the labels render as 17px serif 600 with a `<br>` instead of the Label caption the spec requires. Fix: move `.lbl` out of `.callout` scope or add `.metric-trio .lbl { display:block; font:400 12px/1.6 var(--mono); color:var(--muted); }` and drop the `<br>`s.
3. **Row headers are styled as column headers** (WARNING). `th { uppercase; .12em; muted }` applies to every `<th scope="row">`. Result: lever names in the six-levers table render as "CONTENT GENERATION AT SCALE (THE DEEP DIVE)", "ANSWER-ENGINE VISIBILITY (CLOSES THE LOOP...)", register IDs as "ASM-REVENUE" (but the hash and the text elsewhere are lowercase), and the labels are muted grey while the data is ink, so the hierarchy is inverted. Fix: `tbody th[scope=row] { font: 400 17px/1.5 var(--serif); text-transform:none; letter-spacing:0; color:var(--ink); }` (mono lowercase for register IDs).

Further fixes (4 to 7):
4. **Chip saturation**: 143 `.chip` elements. s02 paragraphs `:131-135` carry 5 to 9 chips each; the answer paragraph has 8. The assumptions register shows a chip in both the Value and the Grade column of every row (`:327/328` and so on) and every register-row chip links to its own row (`href="#asm-revenue"` inside `id="asm-revenue"`), a no-op link. Fix: keep one chip per register row (Grade column, unlinked or plain span), and in prose chip once per paragraph per source rather than per number.
5. **Register duplicates text**: lever-evidence rows `:537/539`, `:544/546`, `:551/553`, `:558/560`, `:565/567`, `:572/574` repeat the identical sentence in Value and Basis. Fix: put a short value ("Company-reported anchors") in Value and keep the sentence in Basis.
6. **Copy**: `:130` h3 "Flat budget" is followed by a section that says production cost rises 27%; rename e.g. "Budget: flat in total, not in production". `:276` s12 stub says "compare named tools fairly without naming them here" which reads as contradictory; reword to "compare tool categories and, in this section only, named vendors, with every claim sourced and dated". `:33` "it is not rising" sits beside 7.7% to 7.8% (a rise) in `:131`; say "has flatlined".
7. **Layout vs spec**: the "What 2x does not mean" and "Falsifier" callouts are inside s01 (`:119-126`, also mis-indented) rather than directly after the legend (spec Page Structure item 6). A reader reaches the answer and key before the boundaries. Either move them after the legend or note the deliberate change in the spec.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)
- Pass: kicker, h1, standfirst, COI box (`:28-31`), grade key definitions (`:38-45`), skip link text, "What 2x does not mean" and the falsifier (OR form, per WR-04) all match the contract strings. No exclamation marks; British English throughout; no generic CTA labels ("Submit", "OK") present (grep).
- Pass: answer-first block is 105 words (limit 120), states claim, condition and falsifier.
- Warning: `:130` "Flat budget" h3 and `:33` "not rising" as above. `:276` stub copy contradictory.
- Warning: 12 of 15 sections are identical "This section will..." plus "Coming in a later update." This is spec-compliant but the TOC advertises 80% unbuilt content with no status marker; at least s09 and s10 (the "why outcomes improve" half of the Core Value) are absent from the page.
- Minor: register Value cells for `asm-reallocation` and the lever rows hold full sentences (`:530`, `:537`), and `data-fig` is wrapped around a whole sentence in prose (`:135`).

### Pillar 2: Visuals (2/4)
- Focal point: masthead and h1 are clear. The h1 clause after the colon is muted-italic (`h1 em`, #62665F), so the substantive claim is the lowest-contrast text at the top of the page (spec-allowed, but it weakens the focal point).
- Answer paragraph (`:33`) is one 105-word block with 8 chips and a 700-weight run-on first sentence of about 40 words. It is the key CFO artifact and reads as a wall.
- Figure 1 (`:139-199`): structure is good (role=img, title, desc, hatching, values outside bars, table equivalent). Defects: text scaling (Fix 1); the storage segment is 0.19px wide (`:166/174`) and cannot be seen, so the legend lists a swatch that never appears; only `x=240` gridline, no scale ticks, so "own scale" panels carry no axis. Cost-panel bars have no visual distinction between Baseline and 2x (both neutral ramp), so the series colour encoding promised in the spec (muted vs verified) is absent for panel 2; the row labels carry it.
- Chip volume (143) overwhelms hierarchy; chips are the loudest elements in table cells and prose.
- Register: IDs and long URLs make 7-column and 5-column tables; scroll regions are accessible but the Source register on a phone shows one column at a time. Acceptable.
- No icon-only buttons; no aria-label problems found.

### Pillar 3: Color (3/4)
- Tokens match the spec exactly (`style.css:1-5`), including `--inferred` #7A5D0F and the six-step segment ramp (WR-08/WR-09 applied). No hardcoded colours outside `:root` except the print block (`#fff #000 #bbb #ccc`), which is spec-declared.
- Accent (`--verified`): used on `a`, `.c-b`, `.bar-scaled`, focus. Because every `<a class="chip">` and every body link takes `a { color }` and `.c-m` overrides it, accent is correctly reserved. But links (including 143 chips and register URLs) are the majority of coloured pixels, so the "10% accent" is effectively carried by grade colours (amber `--inferred` on 130+ Modelled chips). A reader sees amber everywhere and the Benchmark green becomes the rare signal, which is semantically right but visually noisy.
- Pass: grade never colour-only (word present). Print keeps chip borders and text.

### Pillar 4: Typography (2/4)
- Sizes: 12px, 17px/16px, 31px/25px, clamp 34-58px: 4 sizes, compliant (`.fig text` 12px is in viewBox units, see Fix 1). `td.num` 12px mono per spec.
- Weights: contract is 400 and 600 only. Missing `strong`/`b` rule gives 700 on `index.html:33`, `:67`, `:201` (`figcaption b`). Count of distinct rendered weights: 3.
- `.metric-trio .lbl` unstyled (Fix 2). The headline metric block is where "always together" is enforced; labels in serif body weight make the three-up block hierarchy flat.
- `th` rule applies to row headers (Fix 3), including 12px mono caps with .12em tracking on long phrases.
- `.legend-title` is an `<h2>` styled to h3 size; outline is valid but visually an h3 in h2 slot, and the legend sits outside any `<section>` (no `aria-labelledby`). Minor.
- Pass: tabular-nums on tables; line-heights 1.6/1.5/1.15/1.05 as specified; measure 44em/46em/52em applied.

### Pillar 5: Spacing (3/4)
- All spacing uses the `--s-*` tokens (grep: no arbitrary `[px]` values, no off-scale margins). Section rhythm (32px top padding + 1px rule), `.meta` gap, callouts (24px), figure (32px, 16px) match the contract. Touch targets: `.toc a` 48px min-height, chips about 29px high, tab-stops `.table-scroll` fine.
- Deviations: `.flag` `margin-left: 4px` (on scale); `section + section { margin-top: 32px }` plus the 48px TOC margin makes the TOC-to-s01 and stub-to-stub rhythm tight (12 stubs repeated at about 32+32px each); the six-levers table, callouts and s01 closing `</section>` sit at inconsistent indentation (`:119-126`), harmless in render.
- `.metric-trio` uses `<br>` for the label/value break instead of spacing, which will not respond to the 8px label gap in the spec.

### Pillar 6: Experience Design (3/4)
- Strengths: zero script, CSP meta, `lang="en-GB"`, skip link, landmarks, `prefers-reduced-motion` guard on smooth scroll, focus-visible outlines on links/summary/scroll regions, every scrollable table or figure is a named focusable region, `:target` highlight on register rows, no `outline:none`. Mobile reflow handled with a single breakpoint plus 480px adjustments.
- Weaknesses: (a) every chip inside the register points at its own row (no-op, and announces as a link that goes nowhere); (b) 12 stub sections with no way for a reader to tell, from the TOC, which are live; (c) no section current-state or back-to-top on a very long register (spec says no sticky nav, so acceptable, but a "back to contents" link per section would be cheap); (d) answer section has `aria-label="Summary"` but the skip link target is a non-focusable section, so in some browsers focus does not move (spec accepts hash-native behaviour); (e) Figure 1 on mobile requires a horizontal scroll inside a region at 7px text, so the CFO figure is poor on a phone.
- Registry audit: not applicable (no shadcn, no third-party registries, no scripts).

---

## Files Audited
- /Users/vincent.lyons/git/build-and-review/site/index.html
- /Users/vincent.lyons/git/build-and-review/site/assets/style.css
- /Users/vincent.lyons/git/build-and-review/.planning/phases/01-foundation-thesis-slice/01-UI-SPEC.md
- /Users/vincent.lyons/git/build-and-review/.planning/phases/01-foundation-thesis-slice/01-REVIEW-FIX.md (first 80 lines)
- Not read in detail: 01-0[1-7] SUMMARY/PLAN files, 01-CONTEXT.md (spec carries the locked copy)
