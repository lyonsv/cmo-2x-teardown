# CMO 2x — Marketing Acceleration Teardown

## What This Is

A single, self-contained static HTML page, hosted on GitHub Pages, that shows what an "Intercom 2x" style acceleration would look like for a generic enterprise CMO's organisation. It is modelled on the editorial, evidence-graded teardown at https://lyonsv.github.io/intercom-2x-teardown/, but it is a forward-looking projection, not a retrospective. It focuses on content generation for campaigns with more than 10,000 assets, covers four further areas where a CMO could double output, and argues in every case why the extra output also improves outcomes.

## Core Value

A CMO and their CFO finish the page convinced, through transparent and graded reasoning plus their own numbers, that a 2x marketing programme is credible, governable, and improves business outcomes rather than just adding volume.

## Requirements

### Validated

- ✓ Editorial page shell, title block, metadata, COI note, grade key and 15-section TOC, live on GitHub Pages behind a test-gated workflow — Phase 1
- ✓ Confidence grades (Benchmark / Modelled / Speculative + vendor/company flag) on every number, linked to a register, all from one `data.js` — Phase 1
- ✓ Headline metric (approved-live variants per head per quarter, with concepts and variants per concept), six-lever table, "what 2x does not mean" and falsifier — Phase 1
- ✓ CFO answer: Gartner-anchored flat budget, fully loaded cost per approved-live asset ($64.71 → $41.18, Modelled), AI spend as a floor, Figure 1 — Phase 1
- ✓ Tested pure `calc.js` model (identity, monotonicity, golden cases, edge inputs, cost per asset falling) — Phase 1
- ✓ Factory and content supply chain (Figures 2–3), layered operating architecture with one shared versioned policy source — Phase 2
- ✓ 10,000+ asset campaign: worked variant matrix (12,000 derived → 11,400 approved-live), derive-don't-generate, neutral imagery-sourcing table with COI note, personalisation/feeds with NYU/Emory (Benchmark) — Phase 2
- ✓ Build-and-review spine: review agent, T0–T3 tiers with human-only list, reviewer-capacity worked example, fatigue controls, eval harness and telemetry — Phase 2 (author UAT on indemnity wording and Getty facts pending)
- ✓ Five other levers incl. AEO/GEO, outcome case with proof design, interactive calculator (scenarios, sensitivity, show the maths, what you must believe, share link), and the sourced Gradial/AirOps/Profound comparison — Phase 3 (author UAT on tone, vendor fairness, legal wording pending)

### Active

- [ ] Editorial teardown page with a numbered section structure, a title block, metadata, and a "how to read the confidence grades" key, mirroring the reference page's format
- [ ] Every quantitative claim carries a confidence grade (e.g. Benchmark / Modelled / Speculative) with stated assumptions; public benchmarks are cited where they exist
- [ ] Headline 2x framing, with a clearly defined output metric (the equivalent of Intercom's "merged PRs per R&D head") plus outcome metrics, so the 2x cannot be gamed
- [ ] A "marketing org as a factory" mental model and operating principle
- [ ] Deep dive on content generation at more than 10,000 assets per campaign, covering variant explosion (sizes × channels × locales × audiences × tests), imagery-heavy production (sourced, licensed, or generated), personalisation / dynamic creative, and product or catalog feeds
- [ ] A build-and-review spine as the centrepiece: a brand/legal/rights review agent (the equivalent of Intercom's "Shrek"), tiered auto-approval gates, and a ground-truth eval harness (the equivalent of "shrek-curator")
- [ ] Other 2x opportunities, each with an output metric and an outcome argument: localisation/transcreation, experimentation, insight & reporting, and ops (briefs, approvals, DAM tagging/metadata, rights tracking)
- [ ] Outcome case across revenue/pipeline (conversion, CAC, ROAS), speed to market (brief-to-live, market launch lag), quality & brand (compliance, rejection rate, rights incidents), and learning velocity (experiments per quarter, creative fatigue detection)
- [ ] A CFO answer: cost per asset or per campaign trends down as AI spend rises; spend treated as a floor, not a KPI
- [ ] An interactive calculator where the reader sets assets per campaign, campaigns per year, team size, cost per asset, locales, and so on, and sees the baseline vs 2x output, cost, and cycle-time maths
- [ ] Adoption section: how to pull up the floor across creative, brand, and regional teams
- [ ] A candid "what goes wrong" section: slop at scale, brand dilution, rights/IP exposure, Goodhart on output counts, reviewer fatigue
- [ ] Source register and evidence-gaps section
- [ ] Answer-engine visibility (AEO/GEO) as a sixth 2x lever: share of voice and citations in AI answer engines as the output, discovery and pipeline as the outcome
- [ ] A named "How this compares" section that sets the approach against Gradial, AirOps and Profound, using fair, sourced, dated claims with vendor-claimed figures marked as such. It covers where each tool slots into the operating model, where each one is an alternative, and where each falls short
- [ ] Vendor-neutral elsewhere: the operating model names tool categories (GenAI image model, DAM, review agent, PIM, MMM), not brands. The comparison section is the only exception
- [ ] Deployable to GitHub Pages as static files (no build server required at runtime)

### Out of Scope

- A teardown of a specific named company or of Getty Images/iStock's own marketing org — the user chose a generic enterprise CMO
- Real internal data — the figures are modelled from public benchmarks and stated assumptions
- Naming or favouring vendors outside the comparison section — the operating model stays neutral by category
- Backend services, accounts, or data persistence for the calculator — it is client-side only
- Building the actual agents or pipelines described — the page describes them; it does not implement them

## Context

- The reference page (Intercom / Fin 2x teardown) runs to 14 numbered sections: results and how they were measured (including "the spend floor" and "the CFO answer"), mental model, platform layers, plugin inventory, skills, the Shrek review agent, the auto-approval gate, the shrek-curator eval harness, telemetry, adoption ("pulling up the floor"), where it leads ("Backlog 0"), what they got wrong, and a source register. Its tone is analytical and deliberately sceptical, with a Verified/Inferred/Uncertain grading key, before/after tables, and figure captions.
- Intercom's key framings to translate: the per-head output metric (not per engineer), a factory metaphor, spend as a floor rather than a KPI to avoid Goodhart, a tiered auto-approval gate, and honest self-critique.
- The audience is a CMO deciding whether to invest, with the CFO as a secondary reader, so the case must hold up to a finance reader's scrutiny.
- The working directory name `build-and-review` reflects the generation-plus-governance spine.
- The author works at iStock/Getty, but the page is deliberately generic and vendor-neutral.

## Constraints

- **Delivery**: static HTML/CSS/JS deployable to GitHub Pages — same hosting model as the reference
- **Honesty**: every number is graded and its assumptions visible — a CMO 2x is a projection, and presenting it as fact would undermine credibility
- **Neutrality**: tool categories only in the operating model; named vendors (Gradial, AirOps, Profound) appear only in the comparison section, and every claim about them is sourced and dated
- **Self-contained**: no runtime dependencies beyond pinned CDN libraries, if any are used

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Generic enterprise CMO, not a named org | Any CMO should be able to map onto it | — Pending |
| Modelled + graded numbers (Benchmark / Modelled / Speculative) | Mirrors the reference's rigour while staying honest that this is a projection | — Pending |
| Review/approval gate is the central spine | Without governance, 2x volume means 2x risk; this is the "review" in build-and-review | — Pending |
| Include an interactive calculator | Puts the reader's own numbers into the model, which strengthens the CFO case | — Pending |
| Candid risks section | Credibility with a sceptical CMO/CFO reader | — Pending |
| Static GitHub Pages delivery | Matches the reference | — Pending |
| Named comparison vs Gradial, AirOps, Profound on the page | The user wants the CMO to see how this approach compares to market offerings | — Pending |
| Falsifier uses OR (outcomes flat OR compliance falls) | Code review: AND let flat outcomes escape falsification; a CFO would spot it | ✓ Phase 1 |
| Flat budget stated with explicit reallocation (~$0.71M from agency/production lines) | Model shows production cost rising 27%; honesty constraint | ✓ Phase 1 |
| Add AEO/GEO as a sixth lever | Answer-engine visibility is an emerging output/outcome channel (Profound) that the original five levers missed | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-24 after Phase 3 (live at https://lyonsv.github.io/cmo-2x-teardown/)*
