# Phase 5 — UI Review

**Audited:** 2026-10-25 (retroactive, advisory only; no site files changed)
**Baseline:** 05-UI-SPEC.md (approved design contract) plus 05-CONTEXT.md decisions
**Screenshots:** captured with headless Chrome via `scripts/cdp.mjs` at 1440x900, 768x1024 and 375x812. Stored in `.planning/ui-reviews/05-20261025-121451/` (git-ignored). Includes a comparison measurement against the pre-phase page (`114634c^`).
**Scope:** the TOC with the Appendices group, the framing stubs and the "Detail to follow" marker, the appendix divider and "Supports:" pointers, the Evidence columns in the source and assumptions registers, the evidence key in the legend, and the heading outline.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 2/4 | The new evidence axis reuses the grade word "benchmark" and the legend never explains how the two axes relate. 4 register rows read "MODELLED / benchmark". |
| 2. Visuals | 3/4 | The divider and TOC group clearly mark where the reading path ends. The "Detail to follow" pill looks like a disabled button, and hosted v1 sections lost their visual weight. |
| 3. Color | 4/4 | Evidence labels, pill, divider and TOC label use only `--ink`, `--muted`, `--paper-2` and `--rule`. Accent appears only on links. |
| 4. Typography | 3/4 | Stays within the 4 sizes and 2 weights. Demoted h3s (17px/600) look the same as the h4s inside them, so "The CFO answer" and "Your numbers" do not stand out from their own sub-points. |
| 5. Spacing | 3/4 | All values are tokens. The two legend `dl` grids have different first-column widths, the divider sits only 16px above Appendix A, and the 42px URL column makes register rows up to 910px tall. |
| 6. Experience Design | 3/4 | Anchors, share links and the heading outline are intact (0 skipped levels). The new Evidence column is cut off at 1440px. The legend has doubled in height and pushes the TOC down to about 2,790px on mobile. |

**Overall: 18/24**

---

## Top 3 Priority Fixes

1. **Readers cannot tell a grade from an evidence class (WARNING, highest impact).** The legend is still titled "How to read the grades". The four evidence terms sit in a second unlabelled `dl` with no lead-in. The word "benchmark" appears in both keys with different definitions, and 4 source rows display a `MODELLED` chip next to `benchmark`. A CFO reading "Modelled, benchmark" will think the page contradicts itself. **Fix:** retitle the legend "How to read the grades and evidence". Put a `.steps-h`-style label "Evidence: where a figure comes from" above `dl.evidence-key`. Add one sentence: "Grade says how far you can check the figure; evidence says what kind of source it is. A benchmark source can still feed a Modelled figure when the page derives from it." Also rename the six existing "Evidence grade" column headers (index.html:88, 785, 802, 829, 843, 875) to "Grade".
2. **The new Evidence column is off-screen at desktop and the register rows are huge (WARNING).** At 1440px the source register table is 1231px wide inside a 1032px region. The "EVIDENCE" header is cut to "EV" and its values are hidden until the reader scrolls sideways, with no visual hint that scrolling is possible. The URL column renders at 42px wide, so URLs wrap 2-3 characters per line and rows reach 324-910px tall. The 42px URL column existed before this phase (same row heights at `114634c^`). Phase 5 made it worse by pushing a deliverable column out of view. **Fix:** give the URL column a minimum width (`.register td:last-child { min-width: 16em }`), or move the URL under the claim text in the Claim cell. Either way Grade and Evidence fit in the first 1032px. Optionally move Evidence and Flag directly after ID.
3. **"Detail to follow" sits directly above detail (WARNING).** In `#build`, `#supply-chain` and `#economics` the pill (index.html:262, 294, 377) is followed straight away by the full v1 subsection (platform table, factory model, calculator). The marker therefore says the reverse of what the reader sees next. The pill is also styled like a button: bordered box, 8/16 padding, mono type, the same footprint as the `.btn` controls lower down. **Fix:** make the label specific: "Section introduction to follow" or "Fuller introduction in a later release". Drop the box, keeping the text as `.table-note` styling with a leading rule or an italic serif aside, so it no longer looks clickable. On `#autonomy`, where nothing follows, "Detail to follow" is accurate and can stay.

---

## Detailed Findings

### Pillar 1: Copywriting (2/4)

- **WARNING: the evidence axis is never introduced.** The legend title (index.html:33) still says "How to read the grades". `dl.evidence-key` (index.html:44-54) begins straight after the flags row with no label, so the four lowercase words appear without being named as "evidence". The spec's [judgement] that evidence is "distinguishable by wording only" fails where the wording is identical: `Benchmark` as a grade and `benchmark` as an evidence class.
- **WARNING: pairings that look like contradictions are shown and not explained.** Register cell pairs, counted from index.html: Modelled + observed 29, Modelled + illustrative 31, Modelled + hypothesis 24, Speculative + hypothesis 7, Benchmark + benchmark 12, **Modelled + benchmark 4**. The legend's Modelled definition says company-reported figures are graded Modelled, but no sentence says the axes are independent.
- **WARNING: the column header "Evidence grade" clashes with the new column.** Six tables (index.html:88, 785, 802, 829, 843, 875) use "Evidence grade" for a grade chip column, while the registers now have a separate "Evidence" column with a different meaning. "Evidence gaps" (index.html:2501) adds a third use of the word.
- **WARNING: "Detail to follow" contradicts what follows it** in three of the four stubs (see Top fix 3).
- **WARNING: the Supports pointers are uneven.** B, C, D and E all point to "What needs to be built" (index.html:1106, 1164, 1242, 1317). E, the vendor comparison, arguably supports build-vs-buy in `#economics` or `#roadmap` as much as `#build`. F (index.html:1486) changes form: "Supports: every grade chip on the page links to its row here." has no link and is not a section name. Suggest "Supports: every grade chip on the page" or link to `#opportunity`.
- **WARNING: the stub copy promise is softer than the contract.** The spec asks stubs to "say plainly that the full content arrives in a later release of the page". The stubs say "This section will set out...", which leaves the timing unclear. The pill carries the message, but it is ambiguous (above).
- Pass: the stub leads for `#build`, `#supply-chain` and `#economics` match the spec word for word. `#autonomy` is reworded ("a published engineering programme" rather than naming Intercom), which falls within the CONTEXT discretion and avoids a vendor-neutrality issue. No numbers or chips appear in the stubs. The divider sentence matches the spec exactly. The pilot sentence matches in meaning ("twelve-week" for "12-week" is acceptable house style).

### Pillar 2: Visuals (3/4)

- Pass: the `.appendix-divider` 2px ink rule (same weight as the masthead) clearly ends the nine-section reading path (screenshot `desktop-divider.png`). The TOC "APPENDICES" label sits 24px below the 09 row and 8px above row A, which groups the two runs clearly (`desktop-toc.png`).
- **WARNING: the pill looks like a button.** `.to-follow` (style.css:52) is a bordered `--paper-2` box with 8/16 padding and mono text, the same treatment as the `.later` chart-empty message and very close to the `.btn` controls. Readers can try to click it.
- **WARNING: hosted v1 sections lost their focal point.** "Platform and skills", "The factory model", "Your numbers" (the calculator) and "The CFO answer" were 31px h2s in v1 and are now 17px/600 h3s. In `desktop-build-lead.png` the h3 "Platform and skills" is visually weaker than the table caption below it. This is contract-compliant (the spec says to use the existing h3 style and not restyle it as h2), but the calculator in particular, the page's main interactive object, no longer has a visible entry point inside `#economics`.
- **WARNING: section 02 is an empty stop in the main path.** `#autonomy` is the second section a reader meets and contains one paragraph and a pill (243px tall at desktop). This is acceptable while the page is unpublished (CONTEXT: no publishing during Phases 5-9), but it must not ship as it stands.
- The appendix sec-heads are identical to the body sec-heads, as specified. Appendix letters line up in the 64px column.

### Pillar 3: Color (4/4)

- `.ev` computes to `rgb(26, 28, 27)` (`--ink`) with no background or border, as the contract requires. Evidence never uses colour, so it cannot be confused with the grade chips through colour.
- `.to-follow`, `.toc-group` and `.appendix-divider` use only `--muted`, `--paper-2`, `--rule` and `--ink`. Print overrides set the divider to `#ccc` and the pill to no background.
- Accent (`--verified`) is added only through the "Supports:" links, which are body links and therefore allowed. No accent appears on the divider, the evidence labels or the stubs. Nothing to fix.

### Pillar 4: Typography (3/4)

- Sizes and weights in the new classes: `.ev` 12px/400 mono, `.toc-group` 12px/600 mono uppercase, `.to-follow` 12px/400 mono, divider kicker 12px/600. All are within the declared 4 sizes and 2 weights. No new size or weight was added.
- **WARNING: h3 and h4 are styled the same** (style.css:25, `h3, h4 { font-size: 17px; font-weight: 600 }`). Before Phase 5 that was harmless because h3 sat under a 31px h2. Now each hosted section's h3 sits directly above its own h4s, e.g. `#s02-h` "The CFO answer" followed by h4 "Budget: flat in total, not in production" at the same size and weight. Fix: keep the size (contract) and separate the demoted wrapper heading with a rule, e.g. `.subsection > h3:first-child { border-top: 1px solid var(--rule); padding-top: var(--s-md); }`. Alternatively add the `.kicker` treatment to h4s.
- **Minor: the same component uses two heading levels.** `.steps-h` is an h4 for Figures 2-3 (index.html:317, 355) and an h3 for Figures 4, 5 and 7 (index.html:1049, 1134, 1269). The outline is valid either way because appendices have no wrapper h3, but screen-reader users hear "Steps in Figure N" at different depths.

### Pillar 5: Spacing (3/4)

- All new spacing uses tokens: divider `margin-top: 48px` / `padding-top: 24px`, `.toc-group` 24/8, `.subsection + .subsection` 32px. Measured: risks to divider 48px, stub pill to the first h3 48px (16 + 32), Supports note to the body 16px.
- **WARNING: the two legend grids are misaligned.** The grade `dl` first column is sized by the two flag pills (about 290px) and the evidence `dl` first column by the word "illustrative" (about 110px). Definitions in the two halves start at different x positions (`desktop-legend.png`), which makes the evidence key look like a later addition. Fix: `.legend dl { grid-template-columns: 18ch 1fr; }` with the flag pills allowed to wrap, or a shared `subgrid`.
- **WARNING: the divider is too close to Appendix A.** It is 48px from section 09 above but only 16px from Appendix A's sec-head below (`.appendix-divider p` margin-bottom), and `#appendix-campaign` does not get the `section + section` 32px top margin because a div comes before it. The divider sentence therefore reads as a lead-in to A rather than to the whole group. Fix: `.appendix-divider { margin-bottom: var(--s-xl); }`.
- **WARNING (inherited, made worse): register row heights.** Source register row heights at 1440px are 324, 706, 910, 757, 425 and 578px, caused by the 42px URL column (identical at `114634c^`). Phase 5 raised `min-width` from 1040 to 1160px, but the extra width went to Evidence, and URL stayed at 42px.
- The closing pilot sentence in the legend wraps at 44em inside a 1030px panel, leaving a short orphan line ("observed data."). Minor.

### Pillar 6: Experience Design (3/4)

- Pass: no skipped heading levels across the document (scripted check of all h1-h6). There is one h1, and each body and appendix section has one h2. v1 ids are kept: `#s05-h` and the others live on a `span` inside the appendix h2, and `#s11` stays on the calculator wrapper. `scroll-margin-top` covers `.subsection`. The TOC rows are 52px tall, above the 48px target. Every TOC `href` resolves (guards.test.js). The per-phase gates are reported green.
- **WARNING: the new Evidence column is clipped at desktop.** The source register region has `scrollWidth` 1231 against `clientWidth` 1032 at 1440px. Evidence starts at x=1014 in a 1032px viewport, so only "EV" shows (`desktop-register-head.png`). Nothing shows that the region scrolls, so most desktop readers will not see the column this phase added.
- **WARNING: the legend now delays navigation.** Its height went from 281px to 582px at desktop and to about 1,390px at 375px wide. On mobile the TOC now starts at about y=2,790, more than three screens down, after the answer, the meta block and the full two-axis key. Consider moving the evidence key into a closed `details.maths` ("Show what the evidence labels mean") or below the TOC, keeping the pilot sentence visible.
- **WARNING: appendix headings do not say they are appendices.** The letter is in `.sec-num`, outside the h2, and the divider is a plain `p`. A screen-reader heading list goes from "Risks and assumptions" to "The 10,000-asset campaign" with no sign that the appendices have started. Fix: add `<span class="visually-hidden">Appendix A: </span>` inside each appendix h2, or make the divider label a heading that does not break the outline.
- **Minor: Supports pointers only go one way.** Appendices link up to body sections, but `#build` and `#supply-chain` do not link down to Appendix A-D apart from the existing in-prose `#s08` link. A reader who finishes a stub cannot find the depth that supports it.
- Registry audit: not applicable (no shadcn, no third-party registries).

---

## Files Audited

- `site/index.html` (masthead, legend and evidence key lines 32-55, TOC 56-73, section shells and stubs 74-380, divider and appendices 1016-1490, source register 1491+, assumptions register 1996+)
- `site/assets/style.css` (lines 25, 38-54, 61-66, 91-95, 146, 247-248)
- `.planning/phases/05-restructure-scaffold-evidence-schema-guards/05-UI-SPEC.md`, `05-CONTEXT.md`, `05-01`..`05-05-SUMMARY.md`
- Screenshots and metrics: `.planning/ui-reviews/05-20261025-121451/` (desktop, tablet and mobile: top, legend, toc, autonomy, build-lead, divider, appendix-a-head, register-head, register-right, assumptions-head, assumptions-right, evidence-key, plus `metrics.json`)
