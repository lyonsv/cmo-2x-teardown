---
phase: 2
slug: factory-spine-slice
status: approved
reviewed_at: 2026-10-24
shadcn_initialized: false
preset: none
created: 2026-10-24
extends: 01-foundation-thesis-slice/01-UI-SPEC.md
---

# Phase 2 — UI Design Contract (Factory & Spine Slice)

> Extends the approved Phase 1 contract. Everything in 01-UI-SPEC.md still applies (tokens, 4 sizes, 2 weights, 4px spacing set, page structure, `.chip`, `.callout`, tables, print, accessibility). This file states only what is new or changed. Upstream: 02-CONTEXT.md (locked), 01-UI-REVIEW.md (fixes), REQUIREMENTS.md (GEN-01..05, SPINE-01..07), CLAUDE.md. No questions were asked; every answer comes from CONTEXT or a default noted here.

Scope: sections s03–s08 replace their skeletons; s01/s02/s15 get the Phase 1 fixes; s09–s14 stay skeletons.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (unchanged; shadcn, Tailwind, frameworks not used) |
| Preset / component library / icons | none / none / none. No icon font. Diagram glyphs are SVG shapes only |
| Font | Unchanged system stacks, nothing downloaded |
| Files | `site/assets/style.css`, `site/index.html`. No `<script>`, no inline `style=`, no base64. CSP stays `default-src 'none'; style-src 'self'` |
| New CSS | Appended to `style.css`; new classes listed under Components. No new custom properties except `--fig-w` (see Diagrams) |

## Spacing, Typography, Color

Unchanged from Phase 1 (spacing 4/8/16/24/32/48/64; sizes 12 / 17(16) / 31(25) / clamp 34–58; weights 400 and 600; line heights 1.6 / 1.5 / 1.15 / 1.05). Phase 2 adds no size, weight, colour or spacing token.

**Changed colour rule.** Accent `--verified` reserved list becomes: (1) link text, (2) Benchmark chip, (3) the "2x" series in Figure 1, (4) `:focus-visible` outline, (5) **the review/gate path in diagrams (Figures 5, 6 and the review/gate nodes of 3, 4 and 7), strokes and arrowheads only, never body text or table fills.** Everything else in a diagram is `--ink` (primary flow, 1.5px) or `--muted` (secondary, annotations). `--inferred` / `--low` never appear in diagrams.

**Typography fixes (from 01-UI-REVIEW).**
- Add `strong, b { font-weight: 600; }` (kills the third rendered weight, 700).
- `figcaption b { text-transform: uppercase; font-weight: 600; }`.
- `.metric-trio .lbl { display:block; font:400 12px/1.6 var(--mono); color:var(--muted); margin-bottom:var(--s-sm); }`; delete the `<br>` in s01 markup; value stays Body 600.
- Row headers: `tbody th[scope=row] { font:400 17px/1.5 var(--serif); text-transform:none; letter-spacing:0; color:var(--ink); }` (16px at <=720px). Register ID cells use `tbody th[scope=row].id { font:400 12px/1.6 var(--mono); }` and lowercase text identical to the `id` attribute.
- `thead th` and `caption` keep Label uppercase.

---

## Components (new)

| Component | Spec |
|-----------|------|
| `.fig-grid` | Wrapper for each diagram figure: grid `minmax(0,360px) 1fr`, gap 24px, `align-items:start`. At <=720px one column, diagram first, `.fig-steps` below. Sits inside `<figure>`. |
| `svg.fig-d` | Inline diagram. `viewBox="0 0 300 H"` (H 360–560), `width:100%; max-width:360px; height:auto; margin:0 auto`, `role="img"`, `aria-labelledby="fN-t fN-d"`. See Diagrams. |
| `.fig-steps` | `<ol>` text equivalent beside/below every diagram, Body size, 400, item gap 8px, max-width 44em, heading `<h4>` "Steps in this figure" (Label). Item text names the node and the arrow, in diagram order. It is the required visible equivalent (CONTEXT). |
| Layered architecture table (s04) | Standard table in `.table-scroll`, caption "Operating architecture, by layer". Columns: Layer (row header), What it does, Tool category, Reads / writes. Rows top to bottom: Policy source, Brief and concepts, Generation, Derivation and rendering, Review agent, Auto-approval gate, Eval harness and telemetry, Asset manifest. The **Policy source** row has class `shared`: 3px `--ink` left inset shadow and, in the Reads / writes cell, the text "Read by generator and reviewer; one versioned source". Neutral categories only, no vendor names. |
| Variant matrix table (s05) | Caption "Worked example: one campaign, about 12,000 variants". Columns: Factor (row header), Count, Applies to, Variants after factor. `Applies to` is a fraction or "all" (so nothing is double counted); last row "Total approved-live variants" (600 weight). Cells numeric, `td.num`, every number `data-fig` from `variantMatrix()` defaults. One Grade column at the end with a single Modelled chip per row. Total must read between 10,000 and 13,000. |
| Imagery sourcing table (s05, GEN-03) | Caption "Imagery sourcing: three routes". Columns: Criterion (row header), Retrieve approved, License, Generate, Basis. Rows: Rights, Indemnity, Copyrightability, Cost visibility, Speed. Neutral wording, no route marked as the winner, no colour coding. `Basis` holds one chip per row. The COI box (`.callout.coi`, label "COI note") sits **directly above the table**, between the lead-in sentence and the caption. Getty v Stability: one dated sentence after the table, linked to its register row. |
| Tier table (s07) | Caption "Approval tiers (illustrative)". Columns: Tier (row header "T0 …T3" in mono), Example assets, Who approves, Share of assets (Modelled range). The row matching the calc default gets `<b class="default-mark">model default</b>` after its range. `.default-mark`: Label 12px 600 mono, ink, 1px `--ink` border, padding 4px 8px, radius 2px. Directly under the table: `.callout` labelled "Not legal advice" with the exact text "Illustrative, not legal advice; depends on jurisdiction." |
| Human-only list (s07) | `<ul>` of assets/decisions that never auto-approve, Body size, under h3 "Always human". Same legal note applies (covered by the callout above; repeat the phrase "illustrative" in the h3's lead sentence). |
| Reviewer-capacity table (s07, SPINE-04) | Caption "Reviewer capacity, 1x and 2x". Columns: Scenario (row header), Assets per quarter, Human review hours, Reviewer capacity (hours), Utilisation. Four rows: 1x without gate, 1x with gate, 2x without gate, 2x with gate. Every number `data-fig`, tested against `data.js`/`compute()`. Utilisation over 100% is shown as the number plus the words "over capacity" in the same cell (text, not colour). One chip per row, last column "Grade". |
| Telemetry / metrics table (s08) | Caption "What the eval harness reports". Columns: Metric (row header), What it tells you, Published threshold, Grade. Single chip per row. |
| Fatigue controls (s07) | `<ul>` (SPINE-06) under h3 "Guarding against reviewer fatigue", 4–6 bullets, Body size, each starting with a bold lead phrase. Grade chip once at the end of the list paragraph, Modelled/Speculative per CONTEXT. |
| `.lbl` in `.metric-trio` | See Typography fixes. |

Table/figure rules: every table in `.table-scroll` (role=region, tabindex=0, aria-label), `<caption>`, `th scope`. No cell holds more than about 20 words. Mobile (<=480px) tables may scroll; first column stays the row header.

---

## Diagrams (six inline SVGs)

| # | Section | Figure | Subject | Layout |
|---|---------|--------|---------|--------|
| 2 | s03 | Figure 2 | Factory model: few human-directed concepts in, derivation line, approved variants out, with the review gate between | Vertical: Concepts → Derive (template, localise, render feeds) → Review & gate → Approved-live |
| 3 | s03 | Figure 3 | Content supply chain: brief, concept, derive, review, publish, measure, feed back to brief | Vertical, return arrow on the right edge |
| 4 | s05 | Figure 4 | Brief to approved asset: brief, master concept, matrix expansion, manifest, review agent, tier, approved or human queue | Vertical with a fork at tier |
| 5 | s06 | Figure 5 | Review loop: asset in, review agent, pass / fix loop (bounded, N tries) / escalate to human; can raise tier, never lower | Vertical with a loop-back arrow |
| 6 | s07 | Figure 6 | T0–T3 ladder: four stacked rungs, auto-approve above, human below, with example label per rung | Four stacked rectangles, widths equal |
| 7 | s08 | Figure 7 | Eval-harness loop: reviewer decisions with reason codes → ground truth; seeded bad assets; escape sampling; per-tier precision/recall/drift; change gate | Vertical loop |

Geometry and style (all six):
- Authored vertical-first: `viewBox="0 0 300 H"`, node boxes 240 wide centred (x=30) or 112 wide in two columns for forks, node height 40 (2 text lines) or 56 (3 lines), vertical gap 24 between nodes, arrows 1.5px with a 6x6 `<marker>` arrowhead. All coordinates multiples of 4.
- Scale: the SVG renders at the container width up to `max-width:360px`, centred in its grid cell on desktop. 300-unit viewBox means 12px text is 11.5px effective at a 320px viewport and 12px or more from 332px upward; on desktop it renders at up to 14.4px. **This is the floor: no `<text>` below 12 units, and the hard minimum effective size is 11px.** (CONTEXT said "~480 wide"; a 480 viewBox cannot give 12px text on 320–390px phones, so the viewBox is 300 and the rendered cap is 360px. The diagrams stay vertical so width is not the constraint.)
- Text: real `<text>`, `font:400 12px var(--mono)` via `.fig-d text`, fill `--ink`; node titles 600 (`.node-t`); max 28 characters per line (use `<tspan x dy>`), no text on top of arrows, no rotated text.
- Nodes: `rect` fill `--paper`, stroke `--ink` 1.5px, radius 2. Gate/review nodes: stroke `--verified` 2px, fill `--paper-2`. Secondary/annotation text and dashed feedback arrows: `--muted`. Fills never carry meaning alone: review-path nodes also carry the label word "Review" or "Gate" in their text.
- Review/gate path (accent): all strokes and arrowheads of the review agent, fix loop, escalation, and tier gate. Print: accent maps to `#000` at 3px stroke, other strokes `#555` 1.5px (add to the `@media print` block); every accent element stays labelled.
- CSS classes: `.fig-d .node`, `.node-t`, `.edge`, `.edge-review`, `.edge-soft` (dashed `4 4`), `.node-review`. Two explicit markers are defined instead of relying on `context-stroke`: (`arrow` ink, `arrow-review` verified).
- Accessibility: `<title id="fN-t">` (one short phrase) and `<desc id="fN-d">` (the flow in one or two sentences) plus the visible `.fig-steps` list. Caption `<figcaption><b>Figure N</b> …</figcaption>` states what the diagram shows and that it is illustrative. Tier ladder (Figure 6) is additionally paired with the tier table (the table is its text equivalent; the `.fig-steps` list may be omitted there and the caption must say "see the table").
- No animation, no hover states, no tooltips, no links inside SVG.

---

## Section Contracts (s03–s08)

Each section: `.sec-head`, one answer-first sentence (Body, <=30 words), figure and/or table, prose; 400–700 words total, British English, no vendor names (Intercom once in s06, see Copywriting). Order inside a section: lead sentence, figure + `.fig-steps`, table, supporting prose.

| Section | Title (final) | Contains |
|---------|---------------|----------|
| s03 | "The factory model" | Figures 2 and 3 with `.fig-steps`; one paragraph on content supply chain; GEN-01 |
| s04 | "Platform and skills" | Layered architecture table; short prose on one versioned policy source shared by generator and reviewer, skills as reusable units; no figure (CONTEXT) |
| s05 | "The 10,000-asset campaign" | Lead sentence "derive, do not generate"; Figure 4; variant matrix table; imagery sourcing (COI box, table, Getty line); personalisation and feeds paragraph; GEN-02..05 |
| s06 | "The review agent" | Figure 5; rule list (cites rule IDs, writes to manifest, bounded fix loop then escalate, escalate but never lower a tier, never trusts generator self-report, different model/prompt family); Intercom attribution sentence |
| s07 | "The auto-approval gate" | Figure 6; tier table + "Not legal advice" callout; "Always human" list; reviewer-capacity table; fatigue controls |
| s08 | "Eval harness and telemetry" | Figure 7; metrics table; sentence "no change ships if it regresses the harness" |

---

## Chip Density Rule (revised, replaces Phase 1 behaviour)

1. One chip per claim, and it links to its `#src-…` or `#asm-…` row (`<a class="chip …">`).
2. Prose: one chip per figure/claim per paragraph. A paragraph that cites the same source for several numbers carries the chip after the first. Target: no paragraph has more than 3 chips; the answer-first paragraph at most 4.
3. Tables: one chip per row, in a dedicated last column "Grade" (or "Basis"); numeric cells carry no chip. This applies retroactively to Figure 1's data table and the `.meta` block (one chip per value is kept in `.meta` because each value is a separate assumption).
4. Registers (s15): one grade chip per row, in the Grade column only, as an **unlinked** `<span class="chip c-b|c-m|c-s">`; the Value column shows plain text. No self-link. Tests keep the chip-class ↔ grade check on both `a.chip` and `span.chip` and keep all `data-fig` drift checks unchanged; only the "every chip is a link" expectation is relaxed to "every chip outside s15 registers is a link".
5. Never remove the word: grades are always text, never colour only.

---

## Carry-over Fixes (Phase 1 UI-review, first plan)

| Item | Contract |
|------|----------|
| Figure 1 on phones | Remove `svg.fig{min-width:560px}` at <=480px. Set `svg.fig{min-width:800px}` at <=960px inside the `.fig-scroll` focusable region: 12 units x 800/960 = 10px effective (the existing floor). Above 960px unchanged. Caption adds "Scroll sideways on small screens." Storage segment (0.19px) gets a leader label in the legend noting "too small to draw; see table" instead of a phantom swatch. |
| Weights | `strong, b` 600 (above). |
| Metric trio | `.lbl` Label style, `<br>` removed. |
| Row headers | `tbody th[scope=row]` rule above; applies to six-levers, Figure 1 table, all new tables and registers. |
| Registers | One unlinked chip per row; lever-evidence rows: Value holds a short value ("Company-reported anchors"), Basis holds the sentence (no identical text in both cells). |
| Copy nits | s02 h3 "Flat budget" becomes "Budget: flat in total, not in production". s12 stub: "This section will compare tool categories and, in this section only, named vendors, with every claim sourced and dated." Answer-first: "it is not rising" becomes "has flatlined". |
| Callout placement | Leave "What 2x does not mean" and "Falsifier" in s01; record this as a deliberate change from Phase 1 Page Structure item 6 (no action). |

---

## Interaction & State Contract

Unchanged: no script, native anchors, focus rings, `:target` register highlight. New: `.fig-steps` and tables are plain document flow, no `<details>`. Figures are not focusable except their scroll regions (Figure 1 only). Loading/empty/error: not applicable. Reflow at 320px without page-level horizontal scroll; Figures 2–7 never need horizontal scroll.

## Responsive & Print

- <=720px: `.fig-grid` one column, diagram centred above steps; table scroll regions as Phase 1.
- Print: add `.fig-grid{display:block}`, `svg.fig-d{max-width:320px}`, accent strokes to `#000` 3px, `.node-review` fill `#fff`, `.default-mark` keeps border, `figure, .fig-grid, .callout, tr{break-inside:avoid}`.

## Accessibility

Per Phase 1 plus: every diagram has `<title>`, `<desc>` and a visible ordered-list or table equivalent; review path distinguishable by stroke weight and text label, not colour; contrast >= 4.5:1 for text, >= 3:1 for strokes (`--verified` on `--paper-2` is above 7:1); row headers are real `th scope=row`; the `.default-mark` carries the words "model default".

---

## Copywriting Contract

Voice unchanged (British English, analytical, sceptical, no exclamation marks).

| Element | Copy |
|---------|------|
| Primary CTA | None in Phase 2 (read-only). Phase 3 CTA stays "Run your own numbers" |
| s03 lead | "A marketing organisation scales by deriving variants from a few human-directed concepts, not by asking a model for ten thousand originals." |
| s05 lead | "Derive, do not generate: four master concepts become about 12,000 variants through templating, localisation and feed rendering, and most land in low-risk tiers." |
| s05 COI note (label "COI note") | "The author works at iStock/Getty Images. This page is vendor-neutral by design; the table below sets out three routes to imagery without ranking them." |
| Getty v Stability line | One neutral, dated sentence stating the case exists and its status as of the access date, linked to a register row; "Full treatment in section 14." |
| s06 attribution | "This is the equivalent of Intercom's review agent, which inspired the design described here." (linked to the reference teardown register row; only mention of Intercom outside s12/s15) |
| s07 legal note | Label "Not legal advice". Body: "Illustrative, not legal advice; depends on jurisdiction." |
| s07 capacity note | "With the gate, human review hours fall; without it, 2x volume exceeds reviewer capacity. Utilisation is the binding constraint, not generation." (numbers via `data-fig`) |
| s08 closing | "No change to a generator, prompt, model or policy ships if it regresses the harness." |
| Table "over capacity" text | "over capacity" appended to the utilisation figure |
| Empty / error / destructive | Not applicable (static, read-only, no destructive actions) |
| NYU/Emory CTR and AI-disclosure penalty | If primary paper confirms: Benchmark. Else Modelled with the visible note "Secondary source: reported in trade press; we could not confirm the primary paper." |

Skeleton note for s09–s14 unchanged ("Coming in a later update."); s12 scope sentence as in Carry-over Fixes.

---

## Test & Verification Hooks (for planner)

- Every new number is `<span data-fig="id">` tied to `data.js`; variant matrix to `variantMatrix()` (new pure function in calc.js, node:test coverage including no double counting and 10,000–13,000 total); capacity table to `compute()` defaults.
- Add style tests: `strong,b` weight 600; `tbody th[scope=row]` not uppercase; `.fig-d text` size >= 12px; no `font-size` outside the four sizes in new CSS; no inline `style=`; accent used in diagrams only via `.edge-review`/`.node-review`.
- Add HTML tests: every `svg.fig-d` has `<title>`, `<desc>`, `viewBox` starting `0 0 300`, no `<text>` font below 12; each figure has an `ol.fig-steps` or an adjacent table; COI note precedes the imagery table; "Not legal advice" callout follows the tier table; Intercom appears exactly once outside s12/s15; no vendor names in s03–s08.
- One local-preview human-verify checkpoint mid-phase: check Figures 2–7 at 320, 375, 768 and 1280px, Figure 1 at 375px, print preview of s05–s07.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |
| Third-party | none | not applicable |
| CDN libraries | none | no scripts or CDN assets |

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-10-24 (gsd-ui-checker)
