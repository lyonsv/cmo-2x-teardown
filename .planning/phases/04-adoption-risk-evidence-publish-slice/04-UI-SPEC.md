---
phase: 4
slug: adoption-risk-evidence-publish-slice
status: approved
reviewed_at: 2026-10-24
shadcn_initialized: false
preset: none
created: 2026-10-24
extends: 03-levers-outcomes-calculator-comparison-slice/03-UI-SPEC.md
---

# Phase 4 — UI Design Contract (Adoption, Risk, Evidence & Publish)

> Extends the approved Phase 1, 2 and 3 contracts. Everything in 01/02/03-UI-SPEC.md still applies (tokens, 4 sizes 12 / 17(16) / 31(25) / clamp 34–58, 2 weights 400 and 600, spacing 4/8/16/24/32/48/64, `.chip`, `.flag`, `.callout`, `.cite`, `.nd`, `.table-scroll` regions, chip density rule, CSP, print). This file states only what is new. Upstream: 04-CONTEXT.md (locked), REQUIREMENTS.md (CLOSE-01..03, QA-01..04). No questions were asked; every answer is from CONTEXT or a default noted here.

Scope: s13, s14 replace their skeletons. s15 gains one register column, an evidence-gaps block, and a "not used" note. A legal-review flag is added near the top of the page. Page-wide QA checklist (last section) is the contract for QA-01/02.

---

## Design System

| Property | Value |
|----------|-------|
| Tool / preset / icons | none (unchanged). Text only, no icons |
| New CSS custom properties | none. No new font size, weight, colour or spacing value |
| Files | `site/index.html`, `site/assets/style.css` (append), `site/js/data.js` (bias field, Backlog 0 N). No new JS module. No JS needed for any new component |
| Scripts / CSP | Unchanged. No inline style, script or handler |

## Colour

Unchanged. Accent `--verified` reserved list is unchanged (no new item). Specifically:
- **Status (established / alleged / disputed), publisher bias and "as at" dates never use colour.** They are words with a neutral ink/muted treatment. `--low` stays Speculative-chip-only; there is no red.
- Risk-register likelihood reuses grade chips (Modelled/Speculative), never a traffic-light.

---

## Components (new)

| Component | Spec |
|-----------|------|
| `.legal-flag` | The legal-review note. `<div class="callout legal-flag" role="note" aria-label="Legal review status">` with `<span class="lbl">Legal review</span>` and one `<p>`. Reuses `.callout` (3px `--ink` left bar, 44em max). Adds only `background:var(--paper-2); border:1px solid var(--rule); border-left:3px solid var(--ink); padding:var(--s-md) var(--s-lg)`. Not a banner: not sticky, not dismissible, no close button, no JS. |
| `.status` | Inline text marker in the incident table. `font:600 12px/1.6 var(--mono); text-transform:uppercase; letter-spacing:.08em; color:var(--ink); border:1px solid var(--ink); border-radius:2px; padding:4px 8px; white-space:nowrap; display:inline-block`. Variants add a **border-style cue as well as the word**: `.status-established` solid; `.status-alleged` dashed; `.status-disputed` `border-style:double; border-width:3px`. The word is always present, so colour/border is redundant, never the only cue (WCAG 1.4.1). Same box shape as `.default-mark` (reuse its rules where identical). |
| `.asat` | Date-stamped "as at" callout inside each risk block. `<p class="asat"><b>As at <time datetime="2026-10-24">24 October 2026</time></b>: {state of play, one or two sentences}. <a class="cite" …>…</a></p>`. Label mono 12px for the lead-in (`<b>` is 600), body Body 400. `border-top:1px solid var(--rule); border-bottom:1px solid var(--rule); padding:var(--s-sm) 0; margin:var(--s-md) 0`. Also present: "Check again before relying on it." as a closing clause only on regulation and litigation blocks. Date format is the same in every block (day, month name, year). |
| `.risk` | A risk block: `<h3 id="s14-{slug}">`, one answer-first sentence (Body, 30 words or fewer), 120–220 words of prose, a **Mitigation** line (`<p class="mitigation"><b>Mitigation:</b> …</p>`, Body, 600 lead-in), then `.asat`. Blocks are separated by 32px; no boxes, no cards. Five blocks, this order: Slop and sameness; Reviewer fatigue; Goodhart on counts and spend; IP, copyrightability and Getty v Stability; Regulation. |
| `.coi` repeat | In the IP block the existing `.callout.coi` markup is repeated **immediately before the Getty v Stability sub-heading and directly above its prose**, not at the end of the block. Text identical to the page-top note (tested). |
| `.gaps` | Evidence-gaps list, see Evidence gaps below. |
| `.backlog0` | Backlog 0 definition block: `.believe`-style panel (bg `--paper-2`, 1px `--rule`, padding 24px, max-width 44em, margin 24px 0), `<h3>` "Backlog 0, defined" + one definition sentence + a small `<dl>` (term: Measure, Target, Reader's number). No accent colour. |
| Tables | Standard `.table-scroll` region (`role="region" aria-label="…" tabindex="0"`), `<caption>`, `th scope`, 20 words or fewer per cell, `td.num` for numerics. Wide tables scroll in their region; the page never scrolls horizontally. |

---

## Section Contracts

### s13 Adoption and Backlog 0 (400–700 words, one table)

Order: lead sentence; adoption table; "Who goes first" prose; "What stays human" (a short bulleted list, 4–6 items, framed as reassurance); role shift paragraph (making to directing and reviewing); Backlog 0 block; closing sentence linking to `#s11` (reader can set N). One Speculative chip at the end of the adoption prose (author's design); no adoption rates are stated.

**Adoption table.** Caption "Adoption stages by team: first move and guardrail". Columns: Stage (row header), Team, First move, Guardrail, Grade. Four to five rows (e.g. Pilot, Extend, Regional roll-out, Steady state). One chip per row in Grade (Speculative where it is the author's design, Modelled where it derives from a model input). Min-width 720px inside the scroll region.

**Backlog 0 block.** Definition sentence: "Backlog 0 means no approved brief waits longer than {N} days for its first derived set." `{N}` is a `data-fig` span (value from data.js, default chosen by research) followed by a Modelled chip linked to its `#asm-…` row and the words "Replace this with your own service level." Drift-tested against data.js. The calculator does not need an input for N in this phase.

### s14 What goes wrong (about 1,200–1,600 words plus tables)

Order: lead sentence ("Most failures here are governance failures, and most have already happened to someone."); incident table; five risk blocks; risk register table.

**Incident table.** Caption "Public incidents of AI-generated marketing content and agent liability, with status". Columns: Incident (row header), Date, What happened, Status, Source. Cell rules: What happened 25 words or fewer, neutral past tense, no adjectives of blame. Status cell holds one `.status` marker with the word Established, Alleged or Disputed; a one-line definition of each sits **above the table** in a `.legend`-style `<dl>` (Established: confirmed by a court, regulator, or the party concerned; Alleged: reported, not confirmed; Disputed: the parties disagree on the facts). Source cell: a `.cite` link to a `#src-` row. Date cell: `<time datetime>`, ISO in the attribute, "Month YYYY" visible. Only incidents verified against a primary or reputable report appear; none are softened. Min-width 840px in region. Rows are ordered by date, newest first. Table is a text equivalent of nothing else: there is no chart.

**Getty v Stability treatment.** Sub-heading `<h4 id="s14-getty">` inside the IP block, at most 250 words. Structure: (1) the repeated COI callout directly above; (2) plain neutral statement of the claims, jurisdictions, and the latest procedural status; (3) `.asat`; (4) a three-column mini-table (Claim, Status, Source) only if two or more distinct rulings exist. Use "claimed", "alleged", "the court held" as appropriate to what is sourced; no characterisation of either party, no prediction. Source is the judgment or tracker (`.cite`). If a point cannot be sourced it is omitted.

**Risk register.** Caption "Risk register: likelihood grade, mitigation and owner". Columns: Risk (row header), Likelihood, Mitigation, Owner, Grade. Likelihood is words (Low, Medium, High) in plain text, not colour, and the Grade chip says how well supported the likelihood is (Speculative unless a source exists). Owner is a category (e.g. Brand governance, Legal, Marketing operations, Analytics), never a named person. Rows: the five risks in block order, plus agent liability (Moffatt v Air Canada) as a sixth. Min-width 720px.

### s15 Registers (layout change: one column added, two blocks added)

| Change | Spec |
|--------|------|
| Publisher-type column | Source table gains a column **"Publisher type"** immediately after Publisher. Cell text is one of: vendor, company, academic, law-firm commentary, press, tracker, government (lowercase, plain text, from a fixed list in data.js; tested for membership). **Text only: no colour, no flag styling, no icon.** Column order: ID, Claim, Publisher, Publisher type, Date accessed, Grade, Flag, URL. Every row, existing rows backfilled (no empty cells). The existing Flag column keeps its role (who made the claim); the new column says who published the source. A one-sentence note above the table: "Publisher type says who published the source. It never changes a grade." The table may exceed 960px; it stays in its scroll region (existing `.register` rule; set `min-width:1040px`). |
| Not used note | Under the source table: `<p class="nd">` "McKinsey: no figure is used on this page." and, if Gartner 49/40/27% is omitted, "Gartner agent-adoption percentages: not used; not verified against the primary source." Body 400, `--muted`. |
| `.gaps` Evidence gaps | `<h3>Evidence gaps</h3>` + lead "These are the numbers this page could not find. Each is a gap, not an estimate." + `<ul class="gaps">` one `<li>` per gap (cost per asset, approval times, incident rates, auto-approval share, first-pass compliance, analyst hours, DAM metadata rot, AEO outcomes). Each item: **bold lead (the gap)**, then "Would be closed by: {evidence}". Max 35 words. No chip (the absence of evidence is not graded); the list ends with one line "Replace any of these with your own data in the calculator." with a link to `#s11`. List marker standard; item gap 16px; max-width 44em. |
| Assumptions register | Unchanged layout; extra rows (Backlog 0 N, risk likelihood if modelled) match data.js exactly. |
| Re-verification stamps | Each re-checked source row shows `<time datetime="2026-10-24">2026-10-24</time>` in Date accessed. A source that could not be re-fetched keeps its last date and the Claim cell gains the sentence "Re-check failed {date}; last verified {date}." (text, no colour). |

---

## Legal-review flag (CLOSE-03)

| Aspect | Contract |
|--------|----------|
| Wording | Label: "Legal review". Text: "Legal wording on this page has been flagged for review and has not yet been reviewed by counsel." Optional second sentence, no more: "Nothing here is legal advice." |
| Placement | Directly after the existing conflict-of-interest `.callout.coi` and before `#answer`: i.e. top of `<main>`, within the first screen on desktop after the meta block. Both notes are adjacent so the reader meets disclosures together. Before the skip link target: the skip link (`#answer`) still lands on the summary, so keyboard users can bypass both. |
| Visibility | Always visible. No JS, no collapse, no dismiss, not hidden at any breakpoint. Not removed automatically (removal is an author edit; tested by a `node:test` that asserts the string is present until the author changes it). |
| Colour | Neutral (`--paper-2`, `--ink` bar). Not red, not a warning colour. |
| Print | **Prints.** Never `display:none` in `@media print`. Print style: `background:none; border:1px solid #555; border-left:3px solid #000; break-inside:avoid;`. It must appear on page 1 of the PDF (QA check below). |
| Local legal statements | The "Not legal advice" callout in s09 and the regulation `.asat` in s14 stay; the top flag does not replace them. `LEGAL-REVIEW.md` lists each with its anchor id (planner: give each legal statement an `id` such as `legal-s09-statutory`). |
| Accessibility | An `<aside aria-label>` landmark would add a landmark, so use `<div class="callout legal-flag" role="note" aria-label="Legal review status">` instead of `<aside>`; role note is not a navigation landmark and does not disturb the landmark set checked in QA. |

---

## Copywriting Contract

Voice unchanged: British English, answer-first, no exclamation marks, no vendor names outside s12/s15 (VENDOR_RE stays strict), Intercom not named in s13.

| Element | Copy |
|---------|------|
| s13 lead | "Adoption starts with the work that is safest to automate, and success is measured by how long approved demand waits." |
| s14 lead | "Most failures here are governance failures, and several have already happened to someone." |
| Primary CTA | None new. Closing links use text links, not `.btn`. s13 closing: "Set your own service level in section 11." |
| Status definitions | "Established: confirmed by a court, a regulator or the party concerned." / "Alleged: reported but not confirmed." / "Disputed: the parties disagree on the facts." |
| As-at lead-in | "As at {D Month YYYY}:" |
| Getty note | Repeat the page-top COI text verbatim: "The author works at iStock/Getty Images. The page is vendor-neutral by design; where imagery sourcing or Getty v Stability is discussed, this note is repeated." |
| Mitigation lead-in | "Mitigation:" |
| Bias note | "Publisher type says who published the source. It never changes a grade." |
| Evidence-gap lead | "These are the numbers this page could not find. Each is a gap, not an estimate." |
| Empty / error states | Not applicable (static content). The only error-like copy is the re-check failure sentence above |
| Destructive actions | None |

---

## Layout & Responsive

- s13/s14/s15 tables in scroll regions: adoption 720px, incident 840px, risk register 720px, source register 1040px min-width. At <=960px they scroll in their region.
- Risk blocks are single column at max-width 44em on all breakpoints. No new grid.
- Row headers (first column) stay `th scope="row"`. Sticky first column is **not** extended to these tables (matrix only, per Phase 3 style test).
- <=720px: body 16px; `.legal-flag` padding 16px 16px; `.status` unchanged (12px). Backlog 0 panel padding 16px.
- Touch targets: `.cite`/chips 24px minimum with 8px spacing (WCAG 2.5.8). The first-column ID links and TOC are unchanged.

## Print

Add to `@media print`: `.legal-flag{background:none;border:1px solid #555;border-left:3px solid #000}`; `.status{border-color:#000;color:#000}`; `.status-disputed{border-style:double}`; `.asat,.backlog0,.legal-flag,.risk{break-inside:avoid}`; `.table-scroll{overflow:visible}` (existing) applies to the new tables and the 1040px register `min-width:0`, with `th`/`td` `overflow-wrap:anywhere` so nothing clips; `thead{display:table-header-group}` so register headers repeat on each page; links print their text only (no URL expansion that breaks layout, except the register URL column, which already shows the URL). `tr{break-inside:avoid}` already exists.

---

## Test & Verification Hooks (for planner)

- **Structure:** `.legal-flag` exists, appears after `.callout.coi` and before `#answer`, text contains "has not yet been reviewed by counsel", no `display:none` for it in any media query (incl. print); each of the three `.status-*` classes has the word Established, Alleged or Disputed as text; every incident row has a `<time datetime>`, one status word and a `.cite` resolving to a `#src-` row with a date; every risk block has a `.asat` with `<time datetime>` and a `.cite`; the Getty sub-section is preceded by a `.callout.coi` whose text equals the top one; every source row has a Publisher type from the fixed list; source table header has "Publisher type" after "Publisher"; no `style=`; no new `font-size`, `font-weight` other than 400/600, no new `color:` outside tokens; no `background` colour classes keyed to status.
- **Style tests:** `.status` has a border-style or width distinct per variant; no `--low`/`--verified` in `.status`, `.asat`, `.gaps`, `.legal-flag`.
- **Drift:** Backlog 0 N, adoption-table figures and any risk-register grade are `data-fig` or data.js-derived; assumptions register equals data.js (field by field, already tested).
- **Copy:** no phrase "does not have"/"does not exist"; no vendor name outside s12/s15; "Intercom" absent from s13/s14.

---

## Page-wide QA checklist (WCAG 2.2 AA, 320px, print) — contract for QA-01/02

Automated where marked (A) via the CDP harness (`scripts/smoke.mjs`); manual items go to human UAT and are not auto-passed (M).

**Structure**
- [ ] (A) Exactly one `<h1>`; headings never skip a level (h2 per section, then h3, h4 only under h3); every `section` has `aria-labelledby` pointing to its h2.
- [ ] (A) Landmark set: one `header`, one `main`, one `nav` ("Sections"); no stray `aside`/`region` landmarks beyond named scroll regions. `lang="en-GB"` on `<html>`; a unique `<title>`.
- [ ] (A) Skip link is first focusable element and lands on `#answer`.
- [ ] (A) Every `id` unique; every `href="#…"` resolves.

**Perceivable**
- [ ] (A) Text contrast >= 4.5:1 (existing tests, plus new `.status`, `.asat`, `.legal-flag`, `.gaps`); non-text (borders of inputs, focus ring, status borders) >= 3:1.
- [ ] (A) No information by colour alone: grades, status, publisher type, likelihood, series all carry words.
- [ ] (A) Every table has a caption, `th scope`, and a labelled `tabindex=0` scroll region; every `<svg role="img">` has `<title>` and `<desc>`.
- [ ] (A) `<time>` elements carry valid `datetime`.
- [ ] (M) 200% and 400% zoom: no clipped content or controls (1.4.4, 1.4.10).
- [ ] (A) Text spacing override (line-height 1.5, paragraph 2em, letter 0.12em, word 0.16em) causes no clipping (1.4.12).

**Operable**
- [ ] (A) Every interactive element is keyboard reachable; focus order follows DOM and Phase 3 order; no `tabindex` > 0; every focused element shows a visible outline (`outline` not `none`).
- [ ] (A) Focus not obscured: no sticky/fixed element exists (2.4.11); `scroll-margin-top:16px` on anchors.
- [ ] (A) Targets: inputs, buttons, summaries >= 48px; chips and cites >= 24x24 with spacing (2.5.8).
- [ ] (A) Link text is meaningful out of context; `.cite` links read their `src-` id plus date.
- [ ] (M) Screen-reader pass (VoiceOver + one other): summary `<output>` announces once per edit; tables read caption then headers; legal flag and COI read in order.

**Understandable / Robust**
- [ ] (A) Every form control has a `<label for>`; errors have text and `aria-invalid`; no placeholder-as-label.
- [ ] (A) Accessible-name/role tree has no unnamed buttons, links or regions; exactly the live regions listed in 03-UI-SPEC checker notes.
- [ ] (A) No inline script/style, CSP string unchanged, no storage or network calls.
- [ ] (A) Reduced motion: smooth scroll only under `prefers-reduced-motion: no-preference`.

**320px reflow**
- [ ] (A) At 320 CSS px: `document.documentElement.scrollWidth <= 320`; no element other than a `.table-scroll` region or `.fig-scroll` overflows; all sections, the legal flag and the COI note readable; the share/radio/button controls do not clip.
- [ ] (A) Each scroll region at 320px is focusable and has an accessible name.
- [ ] (M) Real-device check at 320 and 375 widths (one iOS, one Android) for inputs (no focus zoom, 16px font).

**Print (CDP `printToPDF`)**
- [ ] (A) Prints without error; page count recorded (no blank pages); text on every page is not clipped at the right edge (table `min-width:0`).
- [ ] (A) Legal flag and COI appear on page 1; both present in extracted PDF text.
- [ ] (A) Tables break by row and repeat their header; figures/callouts/`.asat`/`.backlog0` do not split across pages.
- [ ] (A) `details.maths` is open; calculator buttons, share panel, error summary and `.calc-nojs` are absent; chart bars use the grey/black print fills.
- [ ] (M) Visual check of a saved PDF: a CFO could read it without colour (grayscale print preview).

**Content integrity (feeds QA-04)**
- [ ] (A) Every graded number has a register row; every calculator default equals prose/static value; every register row is referenced or justified; every source has a Publisher type; "McKinsey: not used" note present if no McKinsey figure is cited.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |
| Third-party | none | not applicable |
| CDN libraries | none | `script-src 'self'` only |

## Checker Sign-Off

- [x] Dimension 1 Copywriting
- [x] Dimension 2 Visuals
- [x] Dimension 3 Color
- [x] Dimension 4 Typography
- [x] Dimension 5 Spacing
- [x] Dimension 6 Registry Safety

**Approval:** approved 2026-10-24 (gsd-ui-checker) (gsd-ui-checker)

## Checker notes (applied at approval, 2026-10-24)

- **Focal points:** s13 anchor = the Backlog 0 definition sentence; s14 anchor = the incident table, led by the newest verified incident.
- **Legal flag markup:** `<div class="callout legal-flag" role="note">` (never `<aside>`; no extra landmark).
- **Placement:** the legal flag sits between the page-top COI callout and `#answer`; the skip link still targets `#answer`.
- **Dates:** `.asat` and re-verification stamps use each source's actual re-check date in `<time datetime>`, not a fixed string.

## Chip density amendment (Phase 4 Plan 1)

Reason: 03-UI-REVIEW fix 5 measured 49 identical Modelled chips in s11 (results rows, scenario rows, sensitivity rows, 12 field heads, maths and believe items). When every chip says the same thing, grade colour carries no information. The rule is restated, not loosened: every s11 figure keeps a grade and a plain register link, and a test fails the moment the grades of a group diverge.

**Groups (s11 only).** The four calculator fieldsets that hold fields (Volume, People, Cost and quality, Automation) and the three s11 tables (results, headcount scenario, sensitivity).

**Note markup.**
- Table: the element immediately after the table region is `<p class="table-note grade-note">Every figure in this table is <a class="chip c-m" href="#REF0">Modelled</a>. Register rows: <a href="#REF0">REF0</a>, <a href="#REF1">REF1</a>.</p>`, listing each distinct member ref once. Rows carry no chip and the table has no Grade column.
- Fieldset: the first element after `<legend>` is `<p class="grade-note">Defaults in this group are <a class="chip c-m" href="#REF0">Modelled</a>.</p>`. Field heads carry no chip; each hint ends with ` Register row: <a href="#asm-x">asm-x</a>.`
- Register-id links (text equals the href target, an `src-` or `asm-` key of data.js) are the only link text exempt from the numeric gate; a test checks that each names a real row.

**Shared-grade guard.** `assertGroupRule` in test/calc-page.test.js computes the member grades from data.js and the presenter and fails with "group members no longer share one grade: restore per-member chips" if they differ. There is no silent fallback. The Headcount scenario change-cost line keeps its own chip because it is a paragraph.

**Scope.** s13 and s14 tables keep the per-row Grade column and per-row chips of the approved contract. s11 chip count after the amendment: 24, against a hard cap of 25.
