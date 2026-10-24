# Phase 1: Foundation & Thesis Slice - Context

**Gathered:** 2026-10-24
**Status:** Ready for planning

<domain>
## Phase Boundary

A reader can open the live page and understand the 2x claim, how it is measured, how every number is graded, and why the CFO should believe the cost story.

Delivers: the page shell (title block, metadata, COI note, grade key, TOC, answer-first paragraph), sections 01 and 02 in full, sections 03–14 as anchored skeletons, section 15 as a working register for the claims Phase 1 uses, `data.js`, a fully tested `calc.js`, a static baseline-vs-2x SVG figure, and a GitHub Actions Pages workflow gated on `node --test`.

Requirements: SHELL-01..05, CRED-01..06, CFO-01..04, LEVER-06, CALC-08.

</domain>

<decisions>
## Implementation Decisions

### Delivery & repo
- Create a **public** GitHub repo `lyonsv/cmo-2x-teardown` (mirrors `intercom-2x-teardown`) and push `main`. **Confirm with the user before creating the repo or pushing** (outward-facing action).
- Layout: `site/index.html`, `site/assets/style.css`, `site/js/data.js`, `site/js/calc.js`, `site/.nojekyll`; tests in `test/` at the repo root. All paths relative.
- Deploy: Actions workflow on push to `main`: `node --test` job → `actions/upload-pages-artifact` (path `site/`) → `actions/deploy-pages`. Verify current action major versions when writing it.
- Prose numbers are written statically in the HTML **and** tagged `data-fig="<id>"`; a `node:test` test parses `site/index.html` and checks every tagged value against `data.js` (page works with JS off and cannot drift from the data).

### Front matter & voice
- Title: "CMO 2x: what doubling a marketing organisation's output would take". Kicker: "A forward-looking teardown · projection, not retrospective".
- Byline "Vincent Lyons". COI box: "The author works at iStock/Getty Images. The page is vendor-neutral by design; where imagery sourcing or Getty v Stability is discussed, this note is repeated."
- Subject-org assumptions in metadata (all Modelled, reader-overridable in Phase 3 calculator): ~$1B revenue, ~$78M marketing budget (7.8% of revenue), ~120 marketing FTE, ~40 campaigns/yr.
- British English; analytical and sceptical tone like the reference. Answer-first paragraph ≤120 words stating the claim, the condition (governed review) and the falsifier.

### Metric & CFO model
- Headline metric: approved-and-live asset-variants per marketing head per quarter; all marketing FTE in the denominator; always shown beside unique concepts and variants per concept; tier-weighted view offered only as a sensitivity.
- `calc.js` implements the **full model now** (variants, review capacity with auto-approval share and sampling/escalation, fully loaded cost per approved-live asset — generation, review, rework, tooling, rights, storage — and cycle time). Phase 3 only adds UI. Pure ES module, no DOM, `compute(inputs, assumptions)`; invalid inputs return validation errors, never NaN/Infinity.
- Tests (CALC-08): 1x identity, monotonicity, hand-calculated golden case, zero/edge inputs, cost per approved asset falls with volume.
- Gartner 7.7% (2025) / 7.8% (2026): grade **Benchmark** only if a primary or Gartner press-release page is confirmed during plan research; otherwise Modelled with a "secondary source" note.
- Falsifier (revised 2026-10-24 after code review WR-04, user chose OR): "If approved-live variants per head double but holdout-measured conversion/CAC does not improve, or first-pass compliance falls, within 2–3 quarters, the 2x claim is false for that org."
- Flat budget (added 2026-10-24 after code review CR-02): keep "flat total marketing budget"; state explicitly that the rise in production-attributable cost (~$0.7M, under one point of budget) is reallocated from other lines such as agency/production fees, graded Modelled.
- Section 02 figure: paired horizontal bars, baseline vs 2x, for output per head, cost per approved-live asset (stacked by cost component) and AI spend; inline SVG with `<title>`/`<desc>` plus a `<table>` equivalent.
- AI spend framed as a floor, not a KPI, with the Goodhart rationale.

### Skeleton sections & register
- Sections 03–14: real `<section id="sNN">` with `.sec-head`, title, a "Coming in a later update" note and a one-sentence scope, so every TOC anchor works. 15 numbered sections per the research structure (01 Claim & measurement … 12 How this compares … 15 Source register).
- Section 15 in Phase 1: working source register + assumptions register for the `data.js` entries Phase 1 uses, rendered statically in HTML and verified by test against `data.js`.
- Grade chip text (Benchmark / Modelled / Speculative) is an `<a href="#src-…">` / `#asm-…` link to its register row; the vendor-claimed / company-reported flag is a separate small mono tag after the chip and never upgrades a grade.
- Copy the reference's tokens and `.wrap` / `.sec-head` / `.chip` styles nearly verbatim; remap chip colours to the three grades plus a neutral flag style; light theme only, plus `@media print`. No base64 images.

### Claude's Discretion
- Exact default values for calc assumptions beyond the subject org (cost components, auto-approval share, rework rate) — Modelled, stated in the assumptions register.
- Exact wording of section 01/02 prose, within the decisions above.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield repo (only `.planning/`, `CLAUDE.md`).
- Reference page https://lyonsv.github.io/intercom-2x-teardown/ supplies the CSS tokens and patterns to copy.

### Established Patterns
- Stack per CLAUDE.md: hand-written HTML, system fonts, vanilla ES modules, `node:test`, no dependencies, no build step.

### Integration Points
- `data.js` is the single source consumed by prose tests, `calc.js` and (Phase 3) the calculator UI.
- No git remote exists yet; the repo must be created before the page can be live.

</code_context>

<specifics>
## Specific Ideas

- Repo name mirrors the reference: `cmo-2x-teardown` → `https://lyonsv.github.io/cmo-2x-teardown/`.
- Six-lever summary table in section 01 per research SUMMARY ("The Six Levers").

</specifics>

<deferred>
## Deferred Ideas

- Dark mode — not planned.

</deferred>
