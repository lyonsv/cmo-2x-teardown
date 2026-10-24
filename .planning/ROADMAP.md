# Roadmap: CMO 2x — Marketing Acceleration Teardown

## Overview

One static, evidence-graded editorial page on GitHub Pages, built as four vertical slices. Each phase ends with a deployed, viewable increment of the live page. Phase 1 publishes the thesis (metric, grade scheme, CFO answer) with a tested calculator model. Phase 2 adds the factory and the build-and-review spine. Phase 3 adds the other levers, the outcome case, the interactive calculator and the vendor comparison. Phase 4 adds adoption, risk and the reconciled source register, then runs the accessibility, re-verification and legal-flag pass and the production deploy.

Granularity: coarse. Mode: MVP (every phase is a vertical slice that ends in a deployed page increment).

## Phases

- [x] **Phase 1: Foundation & Thesis Slice** - Live shell with front matter, sections 01-02, `data.js`, tested `calc.js`, baseline-vs-2x figure, tested Pages deploy (completed 2026-10-24)
- [x] **Phase 2: Factory & Spine Slice** - Sections 03-08: factory, supply chain, 10,000-asset campaign, review agent, T0-T3 gate, eval harness and telemetry (completed 2026-10-24)
- [ ] **Phase 3: Levers, Outcomes, Calculator & Comparison Slice** - Sections 09-12: five other levers incl. AEO, outcome case, interactive calculator, Gradial/AirOps/Profound comparison
- [ ] **Phase 4: Adoption, Risk, Evidence & Publish Slice** - Sections 13-15, register reconciliation, WCAG/mobile/print pass, re-verification, legal flag, production deploy

## Phase Details

### Phase 1: Foundation & Thesis Slice

**Goal**: A reader can open the live page and understand the 2x claim, how it is measured, how every number is graded, and why the CFO should believe the cost story.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05, CRED-01, CRED-02, CRED-03, CRED-04, CRED-05, CRED-06, CFO-01, CFO-02, CFO-03, CFO-04, LEVER-06, CALC-08
**Success Criteria** (what must be TRUE):

  1. Reader opens the public GitHub Pages URL and sees the title block, metadata, conflict-of-interest note, grade key (with the separate vendor-claimed/company-reported flag), and an answer-first paragraph before section 01.
  2. Reader jumps from the table of contents to any of the 15 numbered sections by anchor link (later sections may be marked as skeleton or coming).
  3. Reader sees in section 01 the output metric defined (approved-live variants per marketing head per quarter, beside concept count and variants per concept), the six-lever summary table, a "what 2x does not mean" statement and a stated falsifier.
  4. Reader sees in section 02 the Gartner-anchored flat-budget framing, fully loaded cost per approved-live asset for baseline vs 2x, AI spend framed as a floor, and a baseline-vs-2x SVG figure with a data-table equivalent.
  5. Every quantitative claim shows a text grade chip linked to a register entry, and the figures come from `data.js`. A push deploys only if `node --test` passes.

**Plans:** 7/7 plans complete

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Walking Skeleton locally: data.js -> calc.js -> page with chips and register, drift tests, test-gated Pages workflow

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Publish skeleton (user-approved repo creation and push) and Gartner 2026 browser check

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Front matter, COI note, grade key, answer-first paragraph, 15-section TOC and skeletons, full stylesheet

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-04-PLAN.md — Section 01: headline metric trio, tier-weighted sensitivity, six-lever table, what 2x does not mean, falsifier

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 01-05-PLAN.md — Section 02 prose: Gartner flat budget, full cost model with approval yield, cost per approved-live asset, review constraint, AI-spend floor; local prose review checkpoint

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 01-06-PLAN.md — Section 02 Figure 1 (inline SVG) with always-visible data table

**Wave 7** *(blocked on Wave 6 completion)*

- [x] 01-07-PLAN.md — Pre-flight, user review and approved push, live verification

**UI hint**: yes
**Research flag**: Standard patterns. Quick-check only the Gartner 7.7/7.8% primary figures, GitHub Actions major versions and `node --test` behaviour. Confirm the primary-metric weighting decision (unweighted headline, tier weighting as sensitivity).

### Phase 2: Factory & Spine Slice

**Goal**: A reader can follow how 10,000+ assets per campaign are derived from a few concepts and governed by a review agent, tiered gate and eval harness, so volume does not mean risk.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, SPINE-01, SPINE-02, SPINE-03, SPINE-04, SPINE-05, SPINE-06, SPINE-07
**Success Criteria** (what must be TRUE):

  1. Reader sees the factory model, content supply chain and brief-to-approved-asset flow as SVG figures (each with title/desc), plus the operating architecture with one versioned policy source shared by generator and reviewer.
  2. Reader sees a worked variant matrix reaching 10,000+ without double counting, the "derive, do not generate" principle, a neutral imagery-sourcing table with the conflict-of-interest note beside it, and the personalisation/feed block including the graded CTR finding and the -31.5% disclosure penalty.
  3. Reader sees the review agent behaviour (cites rule IDs, bounded fix loop, escalate but never lower a tier, different model family) and the T0-T3 ladder with examples, human-only list and "illustrative, not legal advice" note.
  4. Reader sees a static reviewer-capacity worked example showing review throughput is the binding constraint at 2x, and reviewer-fatigue controls.
  5. Reader sees the eval harness (ground truth from reviewer decisions, seeded known-bad and rights-trap assets, escape-rate sampling, per-tier precision/recall/drift, no-regression rule) and the telemetry asset-ID join with the dashboard metrics.

**Plans**: 8 plans

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Phase 1 UI-review fixes and test-contract evolution (governing-chip rule, register chips, numeric-gate pre-strips, s03 title, vendor list)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — s03 factory model (Figures 2, 3) and s04 layered architecture; diagram contract and CSS

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md — variantMatrix() with tests; s05 derive lead, Figure 4 and the 12,000-variant matrix

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 02-04-PLAN.md — s05 imagery sourcing (COI note, neutral table, Getty line) and personalisation/feeds with NYU/Emory (Benchmark)

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 02-05-PLAN.md — s06 review agent (Figure 5, single Intercom mention, reference datum) and s07 tier ladder (Figure 6, tier table, legal note, Always human)

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 02-06-PLAN.md — s07 reviewer capacity and fatigue controls; s08 eval harness (Figure 7), metrics table and telemetry

**Wave 7** *(blocked on Wave 6 completion)*

- [x] 02-07-PLAN.md — Local preview checkpoint (widths and print) and fixes

**Wave 8** *(blocked on Wave 7 completion)*

- [x] 02-08-PLAN.md — Getty re-check, approve-push checkpoint, W3C, push and live verification

**UI hint**: yes
**Research flag**: Visually review the live Intercom reference sections 05-14 (base64 screenshots) before locking tiers, harness metrics and Backlog 0 framing. Tier shares and review rates set here become calculator defaults in Phase 3, so expect one iteration with the Phase 1 `calc.js` model.

### Phase 3: Levers, Outcomes, Calculator & Comparison Slice

**Goal**: A reader can see the five other levers and the outcome case, run their own numbers through the calculator, and see fairly how the approach compares to Gradial, AirOps and Profound.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: LEVER-01, LEVER-02, LEVER-03, LEVER-04, LEVER-05, OUTC-01, OUTC-02, CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07, COMP-01, COMP-02, COMP-03, COMP-04, COMP-05
**Success Criteria** (what must be TRUE):

  1. Reader sees localisation, experimentation (win-rate maths; sourced range about 10-33% by definition, superseding the earlier 12-36% per 03-CONTEXT post-research decisions), insight and reporting, ops (with the 17 U.S.C. 504(c) tail-risk illustration graded Speculative) and AEO/GEO blocks, each with output metric, outcome argument and grade.
  2. Reader sees the outcome scorecard across revenue/pipeline, speed to market, quality and brand, and learning velocity, plus how lift would be proven (holdouts, pre-registration, multiple-comparison correction, MMM calibrated by incrementality).
  3. Reader enters their own inputs and sees baseline vs 2x output, fully loaded cost per approved-live asset and cycle time update live, with each assumption graded, "show the maths", a "what you must believe" panel, and outputs inheriting the weakest input grade.
  4. Reader sees the break-even auto-approval rate at flat review headcount, redeploy/hold/reduce scenarios with change-management cost, and a sensitivity table. Invalid or zero inputs show a message, never NaN or Infinity, and a URL hash restores a shared scenario.
  5. Reader sees the comparison matrix and per-vendor slot-in/alternative/falls-short text ("not publicly documented" wording), each vendor outcome flagged vendor-claimed with source URL and access date, category-level build-vs-buy and lock-in guidance, and the admission that the spine is a design not a shipped product. Vendor names appear only here and in the source register.

**Plans:** 1/12 plans executed

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Phase 2 UI-review fixes; s09 lead and localisation lever (LEVER-01)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 03-02-PLAN.md — s09 experimentation (win rates by definition, traffic bound) and insight levers

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 03-03-PLAN.md — s09 operations (17 U.S.C. 504(c) illustration) and AEO/GEO levers; s09 complete

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 03-04-PLAN.md — s10 outcome scorecard, proof block, "Run your own numbers" CTAs

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 03-05-PLAN.md — Pure calculator core (format/fields/model, weakest grade) and static s11 default results

**Wave 6** *(blocked on Wave 5 completion)*

- [ ] 03-06-PLAN.md — Live calculator: state.js hash/validation, form, ui.js, CSP script-src 'self', headless smoke

**Wave 7** *(blocked on Wave 6 completion)*

- [ ] 03-07-PLAN.md — Headcount scenarios (redeploy/hold/reduce) and sensitivity table

**Wave 8** *(blocked on Wave 7 completion)*

- [ ] 03-08-PLAN.md — Show the maths, what you must believe, live Figure 8 (svg.js)

**Wave 9** *(blocked on Wave 8 completion)*

- [ ] 03-09-PLAN.md — Vendor primary-page re-verification, s12 admission and comparison matrix

**Wave 10** *(blocked on Wave 9 completion)*

- [ ] 03-10-PLAN.md — Vendor-published outcomes (flagged), vendor panels, build/buy and lock-in

**Wave 11** *(blocked on Wave 10 completion)*

- [ ] 03-11-PLAN.md — Automated gates and local preview checkpoint (widths, print, JS off) and fixes

**Wave 12** *(blocked on Wave 11 completion)*

- [ ] 03-12-PLAN.md — Approve-push checkpoint, W3C, single push, live verification and live smoke

**UI hint**: yes
**Research flag**: Re-verify all vendor claims against primary pages (Gradial CMS/DAM list, which AirOps tier includes Human Review, Profound engine count and methodology). Check whether any independent AEO measurement study exists. Open primary sources before assigning any Benchmark grade.

### Phase 4: Adoption, Risk, Evidence & Publish Slice

**Goal**: A reader can finish the page with an honest view of adoption, what goes wrong and the evidence gaps, and the published page is accessible, cross-checked, re-verified and flagged for legal review.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: CLOSE-01, CLOSE-02, CLOSE-03, QA-01, QA-02, QA-03, QA-04
**Success Criteria** (what must be TRUE):

  1. Reader sees the adoption section (pulling up the floor across creative, brand and regional teams) with Backlog 0 defined as a queue-age SLA.
  2. Reader sees "what goes wrong": an incident list separating established from alleged, slop and sameness, reviewer fatigue, Goodhart, IP/copyrightability and regulation (EU AI Act Art. 50, ASA, FTC) with date-stamped callouts.
  3. Reader sees the source register with publisher bias flags, the evidence-gaps section and an assumptions register that matches `data.js`. A scripted check confirms every graded number has a register entry and every calculator default matches the prose.
  4. Reader can use the page with a keyboard and screen reader (labelled inputs, aria-live outputs, data-table equivalents, grades not by colour alone), at 320 CSS px with tables scrolling in their own regions, and can print it cleanly.
  5. Primary sources, vendor facts, EU AI Act Art. 50 and Getty v Stability status are re-verified and date-stamped, the legal wording is flagged for review, and the production deploy is live.

**Plans**: TBD
**UI hint**: yes
**Research flag**: Verify against primary text: EU AI Act Art. 50 and Code of Practice (including the reported 2 Dec 2026 transition date), Getty v Stability appeal status, Moffatt v Air Canada, Parasuraman and Manzey (2010), indemnity wording, Gartner 49/40/27% figures (verify or drop). Flag the page for legal review.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Thesis Slice | 7/7 | Complete    | 2026-10-24 |
| 2. Factory & Spine Slice | 8/8 | Complete    | 2026-10-24 |
| 3. Levers, Outcomes, Calculator & Comparison Slice | 1/12 | In Progress|  |
| 4. Adoption, Risk, Evidence & Publish Slice | 0/TBD | Not started | - |
