# Phase 2: Factory & Spine Slice - Context

**Gathered:** 2026-10-24
**Status:** Ready for planning

<domain>
## Phase Boundary

A reader can follow how 10,000+ assets per campaign are derived from a few concepts and governed by a review agent, tiered gate and eval harness, so volume does not mean risk.

Delivers sections 03–08 in full (replacing their Phase 1 skeletons): 03 Mental model (factory + content supply chain), 04 Platform and skills (operating architecture), 05 The 10,000-asset campaign (variant matrix, derive-don't-generate, imagery sourcing, personalisation/feeds), 06 Review agent, 07 Auto-approval gate (T0–T3, human-only list, reviewer capacity, fatigue controls), 08 Eval harness and telemetry. Plus the Phase 1 UI-review fixes.

Requirements: GEN-01..05, SPINE-01..07.

</domain>

<decisions>
## Implementation Decisions

### Content shape & depth
- Reference-density sections: ~400–700 words each, one figure and/or table each; ~3,500 words across s03–s08.
- Intercom named once, in s06, as the inspiration ("the equivalent of Intercom's review agent"), sourced to the reference teardown; generic names (review agent, eval harness) everywhere else. Vendor-neutral by tool category; no vendor names outside s12/s15.
- Worked variant matrix: one illustrative campaign of 4 master concepts × sizes × channels × locales × audiences × tests × feed items, with applicable fractions, reaching ~12,000 without double counting. Rendered as a static table, backed by a new pure `variantMatrix()` in calc.js with node:test tests (Phase 3 reuses it). All factors Modelled.
- Tier shares: keep Phase 1 calc defaults (60% auto-approval baseline, T0+T1 cap 85%); the tier table shows Modelled ranges with the calc default marked. No Phase 1 model change unless research forces it.

### Figures
- Six inline SVGs: (a) factory model (s03), (b) content supply chain (s03), (c) brief → approved-asset flow (s05), (d) review loop/escalation (s06), (e) T0–T3 tier ladder (s07), (f) eval-harness loop (s08). Operating architecture (s04) as a layered table, with one versioned policy source shared by generator and reviewer shown explicitly.
- Style: monochrome line diagrams in Phase 1 tokens; accent reserved for the review/gate path; labels are real `<text>`; ≥12px effective text at all widths.
- Mobile: author vertical-first so diagrams scale without horizontal scroll; same SVG centred on desktop. (Refined in UI-SPEC: viewBox 300 wide, max-width 360px, so 12px text stays ≥~12px effective on phones; ~480 would render 7–9px.)
- Accessibility: every figure has `<title>` and `<desc>` plus a visible ordered-list or table text equivalent beside it.

### Sensitive claims & evidence
- Imagery-sourcing table (GEN-03): neutral 3 columns (retrieve approved / license / generate) × rows (rights, indemnity, copyrightability, cost visibility, speed). COI note repeated directly above it (CRED-04). Getty v Stability: one dated, neutral line here; full treatment in s14 (Phase 4).
- NYU/Emory CTR finding and −31.5% AI-disclosure penalty: plan research re-reads the primary paper; Benchmark only if confirmed there, else Modelled with a "secondary source" note (same rule as Gartner).
- Tier table and human-only list carry an explicit "Illustrative, not legal advice; depends on jurisdiction" note; tiers worded as examples.
- Plan research views the live Intercom reference sections 05–14 in a browser (Chrome tools) and extracts Shrek / auto-approval gate / shrek-curator patterns before tiers and harness metrics are locked.

### Delivery & carry-over
- Fold the Phase 1 UI-review fixes into Phase 2's first plan: Figure 1 legibility on phones (≥10px effective text), `strong,b{font-weight:600}`, `.metric-trio .lbl` label styling (no `<br>`), `tbody th[scope=row]` ink + normal case (mono lowercase for IDs), chip de-duplication in registers, dedupe lever-evidence Value/Basis, copy nits (h3 "Flat budget", s12 stub, "not rising"). See 01-UI-REVIEW.md.
- Chip density rule: one chip per claim, linked; registers carry a single unlinked grade chip per row; in prose, chip once per figure per paragraph. Update tests accordingly (no loosening of the data-fig drift checks).
- Pushes: commit locally; one local-preview human-verify checkpoint mid-phase; one push at the end after the user's explicit "approve-push".
- Reviewer-capacity worked example (SPINE-04): static table driven by compute() defaults showing review hours and utilisation at 1x vs 2x, with and without the auto-approval gate; numbers tagged data-fig and tested against data.js.

### Claude's Discretion
- Exact section prose, figure geometry and example assets in the tier table, within the decisions above.
- Fatigue-control and telemetry metric wording (SPINE-06/07), graded Modelled/Speculative where evidence is thin.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/js/calc.js` — pure `compute(inputs, assumptions)`; returns review hours, utilisation, break-even and capacity auto-approval, `undefined_ratios`, `deltas`.
- `site/js/data.js` — sources/assumptions/claims with `display`, `grade`, `flag`, derived claims from compute(); `formatValue`.
- `test/*.test.js` — regex contract over `site/index.html`: `<span data-fig="id">`, chips `<a class="chip c-b|c-m|c-s" href="#src-…|#asm-…">`, numeric gate over the whole page, register field-by-field checks, chip class ↔ grade check, contrast test (`test/style.test.js`).
- Figure 1 pattern in s02 (SVG + `<title>`/`<desc>` + visible data table; `data-bar` widths tested).

### Established Patterns
- TDD per plan (RED test commit, then GREEN). No `<script>` on the page; CSP `default-src 'none'; style-src 'self'`; no inline `style=`.
- Skeleton sections s03–s14 exist with "Coming in a later update." — replace s03–s08 only.

### Integration Points
- New claims/assumptions go into data.js and the s15 registers; new sources (NYU/Emory, Intercom reference, US Copyright Office, Getty v Stability) need register rows.
- Remote `origin` = github.com/lyonsv/cmo-2x-teardown; Pages deploy gated on `node --test`.

</code_context>

<specifics>
## Specific Ideas

- "Derive, do not generate": a few human-directed master concepts become 10,000+ variants by templating, localisation and feed rendering; most land in low-risk tiers, which makes review capacity the binding constraint.
- Review agent rules from research: cites rule IDs, writes findings to the asset manifest, bounded fix loop then escalate, can escalate but never lower a tier, never trusts generator self-reports, different model/prompt family from the generator.
- Eval harness: ground truth = reviewer decisions with reason codes; seeded known-bad and rights-trap assets; escape-rate sampling of auto-approvals; per-tier precision/recall/drift; published thresholds; no change ships if it regresses the harness.

</specifics>

<deferred>
## Deferred Ideas

- Full Getty v Stability treatment and incident list — Phase 4 (s14).
- Interactive variant matrix — Phase 3 calculator.

</deferred>

## Post-research decisions (2026-10-24)

- NYU/Emory (SSRN 5638311): user opened the primary paper in a browser on 2026-10-24 and **confirmed** the up-to-19% CTR lift for fully AI-created ads and the 31.5% CTR drop on AI disclosure → grade **Benchmark** (accessed 2026-10-24). Sample sizes / CTR pairs not confirmed by the user stay out or Modelled.
- 60% auto-approval default: keep as a **Modelled target**; cite the reference teardown's 19.2% auto-approved PRs (goal >50%) and 28.4% bot approval rate once, in s06 alongside the single Intercom mention (source row + claims); s07 shows the 41% break-even, the ~29% capacity floor, and utilisation at the reference rate (≈100–111% at 2x).
- Reviewer-capacity table uses **annual** figures (matches compute()); hours column labelled "before rework".
- s03 title follows UI-SPEC ("The factory model"); update TITLES, TOC and test together.
- Every tier row shows its calc default.
