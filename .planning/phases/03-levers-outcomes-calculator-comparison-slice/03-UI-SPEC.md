---
phase: 3
slug: levers-outcomes-calculator-comparison-slice
status: approved
reviewed_at: 2026-10-24
shadcn_initialized: false
preset: none
created: 2026-10-24
extends: 02-factory-spine-slice/02-UI-SPEC.md
---

# Phase 3 — UI Design Contract (Levers, Outcomes, Calculator & Comparison)

> Extends the approved Phase 1 and Phase 2 contracts. Everything in 01-UI-SPEC.md and 02-UI-SPEC.md still applies (tokens, 4 sizes, 2 weights, 4px spacing set, `.chip`, `.flag`, `.callout`, tables in `.table-scroll`, chip density rule, print, accessibility). This file states only what is new or changed. Upstream: 03-CONTEXT.md (locked), REQUIREMENTS.md (LEVER-01..05, OUTC-01..02, CALC-01..07, COMP-01..05), CLAUDE.md. No questions were asked; every answer is from CONTEXT or a default noted here.

Scope: s09, s10, s11, s12 replace their skeletons. s13, s14 stay skeletons. s02 gets one CTA link (see Copywriting). s15 registers gain rows only (no layout change).

**This is the first interactive phase.** The page gains a form, buttons, live results and a share link. Tokens do not change. Three previously declared "not applicable" states (CTA, error, empty) are now defined below.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (unchanged) |
| Preset / library / icons | none / none / none. No icon font, no icon in buttons or errors (text only) |
| Font | Unchanged system stacks, nothing downloaded |
| Files | `site/assets/style.css` (append), `site/index.html`, `site/js/ui.js`, `site/js/svg.js`, `site/js/state.js` (+ existing `calc.js`, `data.js`) |
| Scripts | One `<script type="module" src="js/ui.js">` at end of `<body>`. No inline script, no inline `style=`, no inline event handlers, no CDN. CSP becomes `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'`. The JS must set styling only via classes and attributes (SVG geometry attributes are fine; no `element.style`, since a strict `style-src 'self'` blocks inline style attributes) |
| New CSS custom properties | none |

## Spacing, Typography, Color

Unchanged. Phase 3 adds no size, weight, colour or spacing token. 4 sizes (12 / 17(16) / 31(25) / clamp 34–58), 2 weights (400, 600), spacing 4/8/16/24/32/48/64.

**Form typography (all within the four sizes):**

| Element | Style |
|---------|-------|
| `fieldset > legend` | Label: `600 12px/1.6 var(--mono)`, uppercase, letter-spacing .12em, `--muted` |
| Field `<label>` | Body 600 serif (17px; 16px at <=720px), line-height 1.5 |
| Input text | `400 17px/1.5 var(--mono)` (16px at <=720px; never below 16px so iOS does not zoom on focus) |
| Unit suffix | Label 400 mono, `--muted` |
| Hint under field (`.hint`) | Label 400 mono, `--muted`, e.g. "Default 40" |
| Error text (`.field-error`) | Body 400 serif in `--ink`, begins with `<b>Error:</b>` (600) |
| Button label | Label 600 mono uppercase, letter-spacing .12em |

**Colour rules (changed/extended).**
- Accent `--verified` reserved list adds one item: (6) **the "2x" series in the live calculator chart** (same role as Figure 1). Inputs, buttons, radio marks, the "What you must believe" panel and the matrix never use accent except link text and `:focus-visible`.
- **No red/destructive colour exists.** Errors are never colour-coded. `--low` stays Speculative-chip-only. Error state is carried by (a) 3px `--ink` border on the input (vs 1px `--muted` normally), (b) a 3px `--ink` left bar on the message, (c) the word "Error:" in text, (d) `aria-invalid="true"`. This keeps the one-accent/no-destructive rule and passes non-colour cues.
- Input fill `--paper`, 1px `--muted` border (about 5.2:1 vs paper, passes the 3:1 non-text rule). Read-only/share field fill `--paper-2`.
- `accent-color: var(--ink)` for native radios.

---

## Components (new)

| Component | Spec |
|-----------|------|
| `.btn` | `<button type="button">` or `<a>` styled alike. `min-height:48px; padding:0 var(--s-lg); border:2px solid var(--ink); border-radius:2px; background:var(--paper); color:var(--ink);` Label-style text. Hover: bg `--paper-2`. Focus: standard 2px `--verified` outline, offset 2px. Active: bg `--ink`, text `--paper`. No transition. Link-styled `.btn` has `text-decoration:none`. |
| `.btn-primary` | Same box; bg `--ink`, text `--paper`; hover bg `--ink-2`. Used only for the "Run your own numbers" CTA link. |
| `.calc` | Wrapper for the interactive tool. Order inside: lead, status line, no-JS note, form, errors, summary, results table, chart, maths, believe panel, sensitivity, share. |
| `.calc-live` | Wrapper around the form, share panel and error summary. **Default `display:none`; `.js .calc-live{display:block}`.** `ui.js` adds class `js` to `<html>` on load (the only first-paint-affecting DOM write). |
| `.calc-nojs` | Note shown by default; `.js .calc-nojs{display:none}`. Mono Label, bg `--paper-2`, 1px `--rule`, padding 8px 16px (same look as `.later`). |
| `fieldset.calc-group` | Border none, padding 0, margin `0 0 var(--s-xl)`, `<legend>` as above with 8px bottom margin. Contents in a grid: `repeat(2, minmax(0,1fr))`, gap 24px (columns) 16px (rows); one column at <=720px. Five groups, in order: **Volume** (campaigns per year, variants per campaign, locales), **People** (marketing FTE, reviewer FTE, minutes per review), **Cost and quality** (variant generation cost, approval yield, rework rate), **Automation** (auto-approval share at baseline, auto-approval share at 2x), **Headcount scenario** (radio group, see below). |
| `.field` | Block: `<label for>` (Body 600) then `.control` then `.hint` then `.field-error` (when present). Gap 4px between label and control; 4px control to hint. |
| `.control` | `display:flex`; `<input>` flex 1, `min-height:48px`, padding `0 var(--s-md)`, border 1px `--muted`, radius 2px; unit `<span class="unit">` after it, inside the same bordered box (box border on `.control`, input borderless) so label+unit read as one target. `:focus-within` shows the 2px `--verified` outline offset 2px on `.control`. |
| Grade chip per input | Rendered at the end of the label line (`<a class="chip c-m" href="#asm-…">Modelled</a>`) inside `.field-head` (flex, wrap, gap 8px, space-between). One chip per input; it links to the assumptions register row; 24x24 min target already met. |
| Input attributes | `type="text" inputmode="decimal" autocomplete="off" spellcheck="false"` (no `type=number`: avoids spinners, locale and scroll-wheel changes, and lets us show our own messages for empty/garbage). Percent inputs take a whole-number percentage ("85" for 85%); the unit suffix reads "%". `state.js` converts. `aria-describedby="hint-{key} err-{key}"` where `err-{key}` is listed only while an error exists. |
| Scenario radios | `<fieldset><legend>Headcount scenario</legend>` with three `<label class="radio">` rows (Redeploy / Hold / Reduce): native `<input type="radio" name="scenario">` 24px, label row `min-height:48px`, padding 8px 0, title Body 600 plus one Label-sized description line beneath. Default selected: the CONTEXT default (planner: Redeploy unless calc.js defines otherwise). Arrow keys move selection natively. Below the radios: one line "Change-management cost: {value} (Modelled)" with chip linked to its `#asm-…` row; the value is a model assumption, not an input. |
| `.calc-status` | One line under the lead (Label mono, muted): "Showing: page defaults" or "Showing: your numbers ({n} changed)". Inside `aria-live="polite"` (`<p role="status">`). |
| `.calc-errors` | Shown only when any input is invalid: `<div role="alert" tabindex="-1">` with Body 600 heading "Fix {n} input(s) to see results" and a `<ul>` of links (`<a href="#in-{key}">Campaigns per year: …</a>`) to each field. 3px `--ink` left bar, padding 4px 0 4px 24px, margin 24px 0. On a **commit** (blur or Enter) that leaves the form invalid, focus stays on the field; the summary is announced via `role="alert"` and is not focused. |
| `.field-error` | `<p id="err-{key}" class="field-error">`, margin 4px 0 0, 3px `--ink` left bar, padding-left 8px. Present only while that field is invalid. |
| Summary `<output>` | `<output id="calc-summary" aria-live="polite" aria-atomic="true">` placed directly under the form. One sentence built from current results, e.g. "2x approves {x} variants per head per quarter at {y} per approved asset, with reviewers at {z}% of capacity." Body 600. **This is the only live-announced region**: the results table is not `aria-live` (a full-table announcement on every keystroke is unusable). It is still the `<output>` result region per CONTEXT: the table sits in `<output class="results" for="…input ids…">` without `aria-live`, and the summary carries the announcement. Updates are debounced 400ms after the last input event so screen readers hear one message. |
| Results table | `<div class="table-scroll" role="region" aria-label="Calculator results" tabindex="0">`. Caption "Results for your numbers (baseline and 2x)". Columns: Output (row header), Baseline, 2x, Change, Grade. Rows (this order): Approved-live variants per head per quarter; Fully loaded cost per approved-live asset; Total production cost; Production share of marketing budget; AI spend; Cycle time, brief to live (days); Review utilisation; Break-even auto-approval at flat reviewer headcount; Capacity floor (auto-approval below which review capacity is exceeded). Numeric cells `td.num`. One chip per row in Grade = **weakest grade among that output's inputs** (Speculative < Modelled < Benchmark), linking to the weakest input's `#asm-…` row. Caption note beneath: "Each output carries the weakest grade of the inputs it uses." |
| Special result cells | Utilisation over 1: number plus the words "over capacity" (as in s07). Cycle time at capacity: "unbounded (over capacity)". Ratio with zero baseline (`undefined_ratios`): "n/a: baseline is zero" in the Change cell, other cells still shown. Break-even `not_needed`: "not needed". `infeasible`: "infeasible: needs more than the {cap}% T0 + T1 share". Never NaN, Infinity, "undefined" or "null" in the DOM. |
| `.believe` panel | "What you must believe". Bg `--paper-2`, 1px `--rule`, padding 24px (legend pattern). `<h3>` (margin-top 0) + lead "The result holds only if these hold." + `<ul>` of 5–7 statements, each with the live value in a `data-fig` span, a grade chip, and a link to its register row. The three most influential (from the sensitivity ranking) end with `<b class="default-mark">carries the result</b>`. Always visible, not in `<details>`. |
| `details.maths` | `<details class="maths"><summary>Show the maths</summary>…`, closed by default. Summary: Label mono 600, `min-height:48px`, display flex, align center, underline on hover, focus ring (existing `summary:focus-visible`). Body: `<ol class="maths-steps">` (Body size, item gap 16px). Each step: a one-line plain-English name (Body 600), then `<code>` formula, then a second line "With your numbers:" and `<code>` with substituted values and the result. `code` already Label/mono on `--paper-2`; allow wrap (`white-space:normal; overflow-wrap:anywhere`). `ui.js` sets `open` on `beforeprint` and restores on `afterprint`. |
| Sensitivity table | Caption "Sensitivity: each input moved 20% down and up, others unchanged". `.table-scroll` region. Columns: Input (row header), Cost per approved-live asset at -20%, at +20%, Reviewer utilisation at -20%, at +20%, Grade. Five rows ordered by measured influence (largest swing in cost per asset first). Cells show signed relative change as text with explicit sign ("+4.2%", "-3.1%", "0.0%") in `td.num`; no colour. If an input is at 0 or the change is not computable, cell reads "n/a". Header row group label spans the pairs (`colgroup` + `th scope=colgroup`). Grade chip = grade of that input. Recomputed live from the reader's current numbers. |
| Live chart | See Live Chart. |
| Share panel | `<div class="share">` after the sensitivity table, h3 "Share these numbers". Label "Link to your numbers" + read-only `<input readonly>` (48px, `--paper-2`, mono 17px; `aria-describedby` hint) + `.btn` "Copy link". Hint: "The link stores your inputs in the address only. Nothing is sent or saved." Status `<p role="status" class="share-status">` below: "Link copied." or "Could not copy. Select the link and copy it manually." Clipboard via `navigator.clipboard.writeText` with fallback: select the field text. Second `.btn` "Reset to defaults" sits beside it (wraps under at <=480px). |
| Reset | "Reset to defaults" restores all inputs and scenario, clears the hash, clears errors, moves focus to the first input, status line says "Showing: page defaults". No confirmation: nothing is saved or destructive. |
| Lever block (s09) | `<h3 id="s09-{slug}">` + one answer-first sentence (Body, <=30 words) + mini table + prose. 250–450 words per block, five blocks in CONTEXT order: Localisation and transcreation; Experimentation; Insight and reporting; Operations; Answer-engine visibility (AEO/GEO). |
| Lever mini-table | Standard table in `.table-scroll`. Caption "{Lever}: output, outcome and evidence". Columns: Measure (row header: "Output" / "Outcome" rows), Metric, Evidence grade. Two to four rows; one chip per row in the last column. Same pattern for every block so tables scan identically. |
| Win-rate table (s09 experimentation) | Caption "Reported A/B win rates by definition of a win". Columns: Source (row header, with `.flag` where vendor-sourced), What counts as a win, Rate (`td.num`, `data-fig`), Grade. Range 12–36% is shown as rows with differing definitions, never averaged. A sentence after the table states test volume is bounded by traffic. |
| Statutory table (s09 ops) | Caption "17 U.S.C. 504(c): statutory damages per work infringed". Columns: Case (row header: ordinary, innocent, wilful), Range per work, Grade (Benchmark). Directly below, a `.callout` labelled "Not legal advice" with: "Illustrative, not legal advice; depends on jurisdiction." The incident rate is stated in prose as an assumption with a Speculative chip and the sentence "Treat this rate as yours to replace." |
| Scorecard (s10, OUTC-01) | Caption "Outcome scorecard: each lever's output paired with outcome families". Columns: Lever (row header), Output metric, Revenue and pipeline, Speed to market, Quality and brand, Learning velocity, Weakest grade. Six rows (the six levers, same order as s01). Cells name the metric to watch (<=20 words), **no numbers and no lift figures**. Last column one chip (weakest grade in the row: Modelled or Speculative). Cells where evidence is absent say "We did not find evidence of lift" in plain text. |
| Proof block (s10, OUTC-02) | `<h3>` "How lift would be proven" + `<ol class="proof-steps">` (Body size, 4 items, each a bold lead phrase: **Holdouts**, **Pre-registered metrics**, **Multiple-comparison correction**, **MMM calibrated by incrementality tests**), then a `.callout` labelled "We did not find" listing, in one to three sentences, what the evidence base lacks. One Modelled/Speculative chip at the end of the list. |
| Vendor panel (s12, COMP-02) | After the matrix: for each of Gradial, AirOps, Profound an `<h3>` (vendor name) and `<dl class="vendor-dl">` with three rows: **Where it slots in**, **Where it is an alternative**, **Where it falls short**. `dt` Label mono 600 uppercase muted, `dd` Body 400, <=50 words, margin 0 0 8px. Absences are phrased "Not publicly documented (checked {date})". Order: alphabetical. Not cards, no boxes, no logos. |
| `.cite` | Inline source citation: `<a class="cite" href="#src-…">src-…</a><span class="cite-date"> accessed 2026-10-24</span>`. Label mono 400, `--muted` (link keeps accent colour on hover underline; text `--verified` as all links). Always follows the claim it supports. |
| `.flag` variants | Existing `.flag`. New permitted texts in s12: "vendor-claimed", "company-reported", "competitor-authored", "low confidence". Never a grade colour, never raises a grade. |
| `.nd` | "Not publicly documented" cell text: Body 400, colour `--muted`, followed by the check date in `.cite-date`. |
| Spine admission | `.callout` directly above the matrix, label "Design, not a product", text: "The CMO 2x spine in this column is a design described on this page. It is not a shipped product and has no customers." |

Table/figure rules unchanged (`.table-scroll` region with `tabindex=0` and `aria-label`, `<caption>`, `th scope`, <=20 words per cell; matrix cells may reach 25).

---

## Section Contracts

| Section | Title | Contains (order) |
|---------|-------|------------------|
| s09 "The other five levers" | final | Lead sentence; five lever blocks; each ends with the s01 cross-reference only if useful (no new nav). Experimentation holds the win-rate table; Ops holds the statutory table and "Not legal advice" callout; AEO/GEO holds one sentence linking citation loss to refresh briefs with `<a href="#s03">` |
| s10 "The outcome case" | final | Lead sentence ("Output only counts if outcomes hold"); scorecard; proof block; closing sentence pointing to the Falsifier in s01; `.btn-primary` "Run your own numbers" linking to `#s11` |
| s11 "Your numbers" | final | Lead; status line; `.calc-nojs` note; form (five groups); errors; summary `<output>`; results table; chart figure; `details.maths`; `.believe`; sensitivity table; share panel. Static default scenario is present in the HTML for every results/sensitivity/chart/maths element (see No-JS) |
| s12 "How this compares" | final | Lead; spine admission callout; COI note not needed; matrix; three vendor panels; build-vs-buy and lock-in block (h3 "Build, buy and lock-in": 3–5 bullets with bold lead phrases; closing sentence "Own the eval set and the brand rules; rent the rest."); one `.callout` labelled "How we treated vendor claims" (vendor outcomes flagged vendor-claimed, never averaged, never Benchmark; competitor-authored reviews used for limitations only) |

Word budget: s09 about 1,500 to 2,000 words across five blocks, s10 400–600, s11 prose 200–300 excluding tool copy, s12 700–900 excluding matrix. British English, answer-first, no exclamation marks. Vendor names only in s12 and s15 (tests keep `VENDOR_RE` outside those two).

---

## Interaction & State Contract

| Interaction | Contract |
|-------------|----------|
| Recompute | On `input` event, debounced 250ms for the table, chart and sensitivity; summary announcement debounced 400ms. On `change` (blur/Enter) validate and show errors immediately. No submit button; the `<form>` has `novalidate`, and `submit` is prevented so Enter never reloads. |
| Validation timing | Do not show an error on first focus or while the field is empty and untouched. Show on `change`/blur, or on `input` once the field has previously been committed invalid (so a fix clears the message live). |
| Invalid state | Per field: `aria-invalid="true"`, `aria-describedby` includes the error id, 3px ink border. Results table cells show "—" (an em dash) with the visually-hidden text "not available" and the chart replaced by the empty state below. **Never show stale numbers while inputs are invalid.** |
| Empty/invalid chart | Replaced by a `.later`-styled note: "Fix the highlighted inputs to see the chart." The figure and its caption remain in the DOM. |
| Status | `calc-status` updates; first interaction changes it from "page defaults" to "your numbers ({n} changed)"; returns to defaults wording when every value equals default. |
| Hash | After any valid commit, `history.replaceState` writes only non-default inputs: `#s11?{key}={value}&…` (exact keys defined by `state.js`; scenario included only if non-default). No history entries are pushed. On load, parse the hash: valid keys restore values and scroll to `#s11` (honours `prefers-reduced-motion`; focus moves to the `<h2>` of s11 via `tabindex="-1"` set by JS). Unknown keys ignored. Invalid values fall back to the default and raise a `role="status"` notice above the form: "Some values in the link were not valid, so defaults were used for: {field names}." The TOC `#sNN` anchors and register `:target` highlighting are untouched: plain `#s11` and `#src-…` hashes still work. Without JS a `#s11?…` link lands at the top of the page and shows the static defaults. |
| Storage | No localStorage, sessionStorage, cookies or network requests. The share hint says so. |
| Share | "Copy link" status text is in a `role="status"` region (not a toast, no timeout dismissal; text stays until next action). |
| Hover / transitions | None added. No animation on result updates (the numbers simply change). Respect `prefers-reduced-motion` for the hash scroll only. |
| Focus order | Lead, status, form fields in DOM order (Volume, People, Cost and quality, Automation, Scenario), summary (not focusable), results region (scroll region), chart (not focusable), maths summary, believe links, sensitivity region, share input, Copy link, Reset. |
| Focus visibility | Every input (`.control:focus-within`), button, summary, radio, scroll region, link: 2px `--verified` outline offset 2px. Do not remove native radio focus. |
| Keyboard | Everything reachable by Tab; radios by arrow keys; Enter in a field commits and validates; Space/Enter on buttons; Escape does nothing. |

### States (new for Phase 3)

| State | Treatment |
|-------|-----------|
| Default | Defaults from `data.js` prefilled; status "page defaults"; results show the default scenario (identical to the static HTML) |
| JS off / failed module | `.calc-nojs` visible, form hidden, static default results, sensitivity, maths, believe and chart visible. No broken controls. The static numbers come from the same `data.js` and are drift-tested |
| Typing | Debounced updates; summary announces once |
| Field invalid | As above; other fields keep working |
| Over capacity | Utilisation > 100% shows "over capacity"; summary says "reviewers would be over capacity"; this is a valid result, not an error |
| Infeasible break-even | Text in cell as above; summary unchanged |
| Overflow | If `compute()` returns `field: null`: error summary heading "These inputs are too large to calculate." with body "Reduce the largest input and try again."; no per-field message |
| Copy failed | Status text with manual-copy instruction |
| Invalid hash | Notice as above; defaults for the bad fields |
| Print | See Print |

---

## Live Chart (calculator)

- `<figure>` with `<figcaption><b>Figure 8</b> …</figcaption>` stating: baseline vs 2x for your numbers, each panel has its own scale, "see the results table for the exact values". The results table is its visible text equivalent (always visible, not `<details>`). Numbering continues Figure 8 (Figure 1 and 2–7 exist).
- One inline SVG, `viewBox="0 0 300 H"` (H about 336), `width:100%; max-width:360px; height:auto`, `role="img"`, `<title id="f8-t">`, `<desc id="f8-d">` (the desc text is rewritten by `svg.js` with the current values), vertical-first so no horizontal scroll at 320px (12 units = 11.5px effective at 288px container: same floor as Phase 2). Placed in a `.fig-grid`: chart left, a short Body paragraph "How to read this" right (stacks <=720px).
- Three panels stacked, each: panel label (Label 600, text), then two horizontal bars, **Baseline** (`.bar-base`, `--muted`, top) and **2x** (`.bar-scaled`, `--verified`, below). Bar height 24, gap 8, panel gap 32, bar area x 0..192, value label at x=200 (Label text, `--ink`), never inside the bar. All coordinates multiples of 4. Panels: (1) Approved-live variants per head per quarter, (2) Cost per approved-live asset (currency), (3) Review utilisation (% of reviewer capacity) with a dashed `--muted` vertical reference line at 100% labelled "100% capacity" and scale max = max(120%, largest value). Panels 1 and 2 scale to their own max; zero baseline at x=0.
- Value labels carry units and, for utilisation above 100%, the words "over capacity". Series are identified by text ("Baseline", "2x") before each bar, not by colour only.
- `svg.js` (about 60 lines) exposes `renderChart(svgEl, results)`; it writes only SVG attributes and text nodes (no `style`). Static default SVG is pre-rendered in the HTML and drift-tested against `data.js`, so the chart is present without JS.
- Print: baseline `#bbb`, 2x `#000` (existing rules apply to `.bar-base`/`.bar-scaled`); reference line `#555`.

---

## Comparison Matrix (s12)

| Aspect | Contract |
|--------|----------|
| Container | `<div class="table-scroll" role="region" aria-label="Comparison matrix" tabindex="0">`, table `min-width:960px`, so at <=960px it scrolls within the region; the page never scrolls horizontally |
| Caption | "How Gradial, AirOps, Profound and the CMO 2x spine compare. Every cell is sourced; access dates are in the source register." |
| Columns | Dimension (row header, `position:sticky; left:0; background:var(--paper)`, 1px `--rule` right border, min-width 160px), Gradial, AirOps, Profound, "CMO 2x spine (design)". Column widths: dimension 160px, others at least 200px |
| Rows (9, this order) | The six levers; More than 10,000 variants; Imagery and rights; Review, gate and eval; Brand governance; Measurement; AEO/GEO; Build vs buy; Lock-in. Row 1 may be split into sub-rows if the six levers need it, but row order is fixed |
| Cell content | Plain statement <=25 words, then (when it states a vendor fact) `.cite`. Vendor outcome numbers add `.flag` "vendor-claimed" immediately after the number, never merged with another vendor's number, never averaged, no chip. Absence: `.nd` "Not publicly documented" plus `.cite-date` "checked 2026-10-24" |
| Spine column | Bg `--paper-2` on header and cells; header text includes "(design)"; each cell ends with a "Design" word (not colour) and a link to the section that describes it (`#s03`..`#s08`). No grade chips in the spine column except where a number is quoted from this page, then the page's own chip applies |
| Grades in matrix | Per-cell chips are not used (chip-density exception, recorded here): grade and flag live on the register row each `.cite` links to. The caption states this. Vendor outcome claims are never graded Benchmark |
| LOW items | Items research flagged conflicting (Gradial valuation/funding, AirOps pricing, Profound Series D detail, Gradial CMS/DAM list) are omitted. If any is shown it carries `.flag` "low confidence" and no number. No AEM claim unless the primary page states it |
| Competitor-authored sources | Used for limitations only; cell shows `.flag` "competitor-authored" |
| Responsive | <=720px: same table in scroll region, sticky first column remains; vendor panels (dl) stack naturally |
| Print | `.table-scroll{overflow:visible}`; table `min-width:0; font-size` unchanged; allow table to break across pages by row (`tr{break-inside:avoid}` already); sticky off (`position:static`) |

---

## Layout & Responsive

- Desktop (>720px): calculator fieldsets use two columns; results table, sensitivity, matrix in scroll regions; chart + "How to read" paragraph in `.fig-grid`.
- <=720px: fieldset grid one column; `.field-head` wraps chip under label; `.btn`s full-width stacked (gap 8px); share input full width; body 16px; inputs 16px.
- <=480px: radios stacked already; results table scrolls inside its region. Reflow at 320 CSS px with no page-level horizontal scroll (WCAG 1.4.10).
- Touch targets: every input, button, radio row, summary: min-height 48px (above the 44px minimum). Chips and `.cite` links keep the 24px minimum, with 8px spacing between adjacent inline targets (WCAG 2.5.8).

## Print

Add to `@media print`: `.calc-live .btn, .share, .calc-nojs, .calc-errors{display:none}`; fieldset inputs print with their values (border 1px `#555`); `.believe, .callout, details.maths{break-inside:avoid}`; `details.maths` opened by `ui.js` on `beforeprint`; matrix sticky off; `.btn-primary` hidden (CTA link is navigational); `.cite` prints as normal text. A printed page shows the reader's numbers, the results table, the chart, the maths and the believe panel.

---

## Accessibility (WCAG 2.2 AA)

- Every input has a programmatically associated `<label for>`; the unit and default are in the hint and referenced by `aria-describedby` (so a screen reader hears "Campaigns per year, edit, Default 40, campaigns"). Do not use placeholder as the label.
- Grouping with `<fieldset><legend>`; scenario is a real radio group.
- Errors: text message adjacent to the field, `aria-invalid`, `aria-describedby` to the message, plus the alert summary with links to fields (WCAG 3.3.1, 3.3.3: message says what is wrong and how to fix it). Errors never rely on colour (3.3.1, 1.4.1).
- Correct-input hints: `inputmode="decimal"`; `autocomplete="off"` (these are not personal data, so WCAG 1.3.5 does not apply).
- Consistent help (3.2.6): the grade chip, hint and "Reset to defaults" appear in the same place for every field/section.
- Redundant entry (3.3.7): nothing asked twice; hash restores values.
- Live regions: one polite `<output>` summary, one polite status for hash notices, one for the share result, one `role="alert"` for the error summary. No other live regions.
- Focus not obscured (2.4.11): no sticky header or overlay exists; `scroll-margin-top:16px` stays.
- Dragging not required (2.5.7), no time limits, no auto-updating content other than the debounce.
- Charts: `<title>`/`<desc>` and a visible table; the 100% capacity line is labelled in text.
- Tables: captions, `th scope`, `scope=colgroup` for sensitivity pairs, sticky first column of the matrix is a real `th scope=row`.
- Contrast: inputs 1px `--muted` border on `--paper` 5.2:1; ink-on-paper-2 for read-only share field; focus ring `--verified` on paper over 7:1.
- Text spacing / zoom: 200% zoom and 320px reflow have no clipped controls; do not fix input heights below `min-height:48px` (use `min-height`, not `height`).

---

## Copywriting Contract

Voice unchanged. Figures come from `data.js` via `data-fig` or live from `calc.js`.

| Element | Copy |
|---------|------|
| Primary CTA | "Run your own numbers" (`.btn-primary` link, `href="#s11"`), at the end of s02 and the end of s10. Inside s11 there is no primary button: results update as you type |
| Secondary actions | "Reset to defaults", "Copy link" |
| s09 lead | "The factory doubles output; five other levers decide whether the extra output is worth having." |
| s10 lead | "More output only counts if outcomes hold, and that has to be shown with holdouts, not assumed." |
| s11 lead | "Replace the defaults with your own numbers. The page recomputes cost per approved-live asset, reviewer load and the auto-approval share you would need." |
| s11 status | "Showing: page defaults" / "Showing: your numbers ({n} changed)" |
| No-JS note | "The interactive calculator needs JavaScript. Below is the default scenario, calculated in advance from the same model." |
| Summary sentence | "At 2x, your team approves {x} variants per head per quarter at {y} per approved asset, with reviewers at {z}% of capacity." Over capacity: "…with reviewers over capacity at {z}% of capacity." |
| Empty field error | "{Field}: enter a number." |
| Not a number | "{Field}: use digits only, for example {example}." |
| Below minimum | "{Field}: enter {rule}." where rule is field-specific, e.g. "a whole number of 1 or more", "a number above 0", "a percentage above 0 and up to 100" |
| Cross-field | "Auto-approval share at 2x: cannot exceed {cap}%, the share of assets that can clear without a person (T0 and T1)." and "Sampling plus escalation: must total 100% or less." |
| Zero baseline ratio | "n/a: baseline is zero" |
| Overflow | Heading "These inputs are too large to calculate." Body "Reduce the largest input and try again." |
| Chart empty | "Fix the highlighted inputs to see the chart." |
| Invalid hash | "Some values in the link were not valid, so defaults were used for: {fields}." |
| Share hint | "The link stores your inputs in the address only. Nothing is sent or saved." |
| Copy status | "Link copied." / "Could not copy. Select the link and copy it manually." |
| Scenario names and descriptions | Redeploy: "Keep the team and move freed capacity to new work." Hold: "Keep the team and the volume; take the saving as lower cost." Reduce: "Shrink the team to the capacity the 2x output needs." Planner: align wording with the CALC-04 maths in `calc.js`; names stay Redeploy / Hold / Reduce |
| Change-management cost line | "Change-management cost: {value}, included in every scenario." (Modelled chip) |
| Believe panel lead | "The result holds only if these hold." |
| Spine admission | "The CMO 2x spine in this column is a design described on this page. It is not a shipped product and has no customers." |
| Vendor-claim callout label/body | "How we treated vendor claims": "Vendor-published outcomes are flagged vendor-claimed, shown with their source and access date, and never averaged or graded Benchmark. Reviews written by competitors are used for limitations only and flagged." |
| Absence phrasing | "Not publicly documented (checked 2026-10-24)" only; never "does not have" or "does not exist" |
| Legal note (ops) | Label "Not legal advice": "Illustrative, not legal advice; depends on jurisdiction." |
| Falsifier pointer (s10) | "The falsifier in section 01 still applies: if holdout-measured outcomes do not improve, the 2x claim is false for that organisation." |
| Destructive actions | None. "Reset to defaults" is non-destructive (nothing is stored) so it has no confirmation |

---

## Test & Verification Hooks (for planner)

- **state.js (node:test):** parse/serialise round-trip; defaults omitted from the hash; unknown keys ignored; invalid values reported with field names; percent whole-number coercion; empty string, "abc", "1e999", "-3", "0" each yield a field-named error, never NaN/Infinity; messages match the Copywriting table templates.
- **Drift:** every static default number in s09 (win-rate rows, statutory ranges), s10 and s11 (results, sensitivity, maths, believe, chart label values) is `data-fig` or derived from `compute(defaultInputs())`; test that the pre-rendered SVG value labels equal `compute()` defaults.
- **HTML structural tests:** every calc input has `<label for>`, `aria-describedby` hint, 12 or fewer groups per fieldset, a chip linking to an existing `#asm-` row; one `<output aria-live>` only; `.calc-live` and `.calc-nojs` exist; no `style=` attribute, no inline `<script>`, no `onclick=`; the only `<script>` is `type=module src` same-origin; CSP string matches; no `localStorage|sessionStorage|document.cookie|fetch(|XMLHttpRequest` in `site/js/ui.js|state.js|svg.js`; no `.style.` or `setAttribute('style'` in JS.
- **Style tests:** `.btn` and `.control input` `min-height >= 48px`; no new `font-size` outside the four sizes; `.control input` font-size >= 16px; no `color:` value other than tokens in new CSS; accent used only on links, Benchmark chip, `.bar-scaled`, review path strokes, focus outline; no `outline:none` without replacement; sticky first column limited to `.matrix`.
- **s12:** vendor names only in s12 and s15 (`VENDOR_RE`); every vendor fact cell has a `.cite` whose `href` resolves to a `#src-` row that has a date; no cell text matches `/does not (have|exist)/i`; no vendor number is adjacent to a Benchmark chip; the spine admission callout precedes the matrix; the string "not a shipped product" appears in s12.
- **s09/s10:** each lever block has a table with Output and Outcome rows and one chip per row; the statutory table has three Benchmark rows and the incident rate is Speculative; scorecard has six rows and no digits in outcome cells; proof list has the four named methods.
- **a11y smoke (manual, mid-phase checkpoint):** keyboard-only pass of the form; screen reader pass (summary announces once per edit); 320px and 200% zoom; print preview of s11 and s12; JS-disabled load shows static default scenario. Auto-approved by the orchestrator while the user is away, recorded in the SUMMARY.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |
| Third-party | none | not applicable |
| CDN libraries | none | `script-src 'self'` only; no CDN assets |

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-10-24 (gsd-ui-checker)

## Checker notes (applied at approval, 2026-10-24)

- **s11 focal point and reading order:** the summary sentence (Body 600, in the polite `<output>`) is the anchor; then the results table; the "2x" accent bars in Figure 8 are the only accent in s11; the chart's "How to read this" paragraph and the form hints are secondary.
- **Live regions:** `.calc-status` is the same region as the hash-notice status (one `role="status"`), so the list is: summary `<output aria-live="polite">`, one status region (hash notices + calc status), one share-result status, one `role="alert"` error summary. Structural tests count roles accordingly.
- "Run your own numbers" CTA text is identical in s02 and s10 (tested).
- `--s-md` = 16px and `--s-xl` = 32px (existing tokens).
