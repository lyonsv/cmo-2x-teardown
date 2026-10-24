# Requirements: CMO 2x — Marketing Acceleration Teardown

**Defined:** 2026-10-24
**Core Value:** A CMO and their CFO finish the page convinced, through transparent, graded reasoning and their own numbers, that a 2x marketing programme is credible, governable, and improves business outcomes rather than just adding volume.

"Reader" means the CMO (primary) or CFO (secondary) visiting the published page.

## v1 Requirements

### Page Shell & Delivery

- [x] **SHELL-01**: Reader can open the page at a public GitHub Pages URL, served from a static `site/` folder with relative paths and `.nojekyll`
- [x] **SHELL-02**: Reader sees a title block, metadata (date, evidence base, subject-org assumptions), and an answer-first summary paragraph before section 01
- [x] **SHELL-03**: Reader can jump to any of the 15 numbered sections from a table of contents with anchor links
- [x] **SHELL-04**: The page uses the reference's editorial design language (system serif/mono fonts, CSS custom-property tokens, `.sec-head` numbering, `.chip` grade badges) with no base64 images
- [x] **SHELL-05**: Deploys run through a GitHub Actions workflow that executes `node --test` and publishes only if the tests pass

### Credibility Foundation

- [x] **CRED-01**: Reader sees a grade key (Benchmark / Modelled / Speculative) plus a separate source flag (vendor-claimed / company-reported) that never upgrades a claim to Benchmark
- [x] **CRED-02**: Every quantitative claim on the page shows a text grade chip (not colour-only) linked to a source-register or assumptions-register entry
- [x] **CRED-03**: Reader sees the headline output metric defined as approved-and-live asset-variants per marketing head per quarter (all marketing FTE in the denominator), always shown beside the unique-concept count and variants per concept, with tier weighting offered only as a sensitivity
- [x] **CRED-04**: Reader sees a conflict-of-interest note (author works at iStock/Getty Images) in the front matter and repeated next to imagery sourcing and Getty v Stability
- [x] **CRED-05**: Reader can see a "what 2x does not mean" statement and a stated falsifier for the 2x claim
- [x] **CRED-06**: All numbers, defaults, grades and source IDs come from one `data.js` used by both prose and calculator, so they cannot diverge

### CFO Answer

- [x] **CFO-01**: Reader sees the flat-budget framing anchored on graded Gartner figures (marketing budget ≈7.7–7.8% of revenue)
- [x] **CFO-02**: Reader sees cost per approved-live asset fully loaded (generation, review, rework, tooling, rights, storage) for the baseline and 2x scenarios
- [x] **CFO-03**: Reader sees AI spend framed as a floor, not a KPI, with the Goodhart rationale
- [x] **CFO-04**: Reader sees a static baseline-vs-2x figure (inline SVG with a data-table equivalent) in section 02

### Content Generation (>10,000 assets)

- [x] **GEN-01**: Reader sees a worked variant-matrix example (concepts × sizes × channels × locales × audiences × tests × feed items, with applicable-fraction inputs) that reaches 10,000+ without double counting
- [x] **GEN-02**: Reader sees the "derive, do not generate" principle: a few human-directed master concepts derived into the full set
- [x] **GEN-03**: Reader sees a neutral imagery-sourcing decision table (retrieve approved / license / generate) with rights, indemnity and copyrightability notes
- [x] **GEN-04**: Reader sees a personalisation/DCO and product/catalog-feed block, including the graded NYU/Emory CTR finding and the −31.5% AI-disclosure penalty
- [x] **GEN-05**: Reader sees inline SVG figures for the factory model, the content supply chain, and the brief-to-approved-asset flow, each with `<title>`/`<desc>`

### Build-and-Review Spine

- [x] **SPINE-01**: Reader sees the operating architecture (intent, policy/knowledge, build, review, eval harness, system of record, activation, measurement) with one versioned policy source shared by generator and reviewer
- [x] **SPINE-02**: Reader sees the review agent described: cites rule IDs, writes findings to the asset manifest, runs a bounded fix loop, can escalate but never lower a tier, and uses a different model/prompt family from the generator
- [x] **SPINE-03**: Reader sees the T0–T3 tier ladder with examples, a human-only list (hero work, claim-bearing/testimonial content, likeness), and an "illustrative, not legal advice" note
- [x] **SPINE-04**: Reader sees a static reviewer-capacity worked example showing why review throughput is the binding constraint at 2x
- [x] **SPINE-05**: Reader sees the eval harness: reviewer decisions with reason codes as ground truth, seeded known-bad and rights-trap assets, escape-rate sampling of auto-approvals, per-tier precision/recall/drift, and no change shipping if it regresses the harness
- [x] **SPINE-06**: Reader sees the telemetry layer: asset-ID join from manifest to performance, and the dashboard metrics to instrument
- [x] **SPINE-07**: Reader sees reviewer-fatigue controls (blind-first review, seeded-error catch rate, session caps, sampling)

### Other Levers

- [x] **LEVER-01**: Reader sees a localisation/transcreation block with its output metric (approved localised assets per locale; master-to-last-locale lag), its outcome argument and graded evidence
- [x] **LEVER-02**: Reader sees an experimentation block with win-rate maths (≈12–36% depending on definition; superseded by the sourced ≈10–33% range, see 03-CONTEXT post-research decisions) explaining why test velocity improves outcomes, bounded by traffic
- [x] **LEVER-03**: Reader sees an insight & reporting block with its output/outcome metrics, marked Modelled where evidence is a gap
- [x] **LEVER-04**: Reader sees an ops block (briefs, approvals, DAM metadata, rights tracking) including a statutory-damages tail-risk illustration (17 U.S.C. 504(c)) with the incident rate graded Speculative
- [x] **LEVER-05**: Reader sees an answer-engine visibility (AEO/GEO) block: answer assets published/refreshed per head as output; citation share, AI-referred sessions and pipeline as outcomes; citation loss feeding refresh briefs back into the factory
- [x] **LEVER-06**: Reader sees a six-lever summary table (output metric, outcome metric, evidence grade) in section 01

### Outcome Case

- [x] **OUTC-01**: Reader sees an outcome scorecard pairing each output metric with outcomes across revenue/pipeline, speed to market, quality & brand, and learning velocity
- [x] **OUTC-02**: Reader sees how lift would be proven: holdouts, pre-registered metrics, multiple-comparison correction, MMM calibrated by incrementality, with outcomes graded Modelled/Speculative

### Calculator

- [x] **CALC-01**: Reader can enter their own inputs (assets per campaign, campaigns per year, team size, cost per asset, locales, tier mix, etc.) and see baseline vs 2x output, fully loaded cost per approved-live asset, and cycle time update live
- [x] **CALC-02**: Reader sees every assumption with its grade, the "show the maths" breakdown, and a "what you must believe" panel; each output inherits the grade of its weakest input
- [x] **CALC-03**: Reader sees the break-even auto-approval rate required for 2x at flat review headcount
- [x] **CALC-04**: Reader can switch between headcount scenarios (redeploy / hold / reduce), with change-management cost included
- [x] **CALC-05**: Reader sees a sensitivity table for the most influential inputs
- [x] **CALC-06**: Reader can share a scenario via a URL hash that restores all inputs
- [x] **CALC-07**: Invalid or zero inputs show a validation message, never NaN or Infinity
- [x] **CALC-08**: The calculator maths is a pure `calc.js` module covered by `node:test` tests: 1x identity, monotonicity, a hand-calculated golden case, edge inputs, and cost per approved asset falling with volume

### Comparison

- [x] **COMP-01**: Reader sees a comparison matrix of Gradial, AirOps and Profound against the CMO 2x approach (six levers, >10k variants, imagery/rights, review/gate/eval, brand governance, measurement, AEO/GEO, build vs buy, lock-in)
- [x] **COMP-02**: Reader sees for each vendor where it slots into the operating model, where it is an alternative, and where it falls short, phrased as "not publicly documented" rather than "does not exist"
- [x] **COMP-03**: Reader sees category-level build-vs-buy and lock-in guidance (own the eval set and brand rules)
- [x] **COMP-04**: Reader sees vendor-published outcomes flagged as vendor-claimed, each with its source URL and access date, never averaged or graded Benchmark
- [x] **COMP-05**: The section acknowledges that the CMO 2x spine is a design, not a shipped product; vendor names appear only in this section and the source register

### Closing Sections

- [x] **CLOSE-01**: Reader sees a candid "what goes wrong" section: a documented incident list (established vs alleged), slop and sameness, reviewer fatigue, Goodhart, IP/copyrightability, and regulation (EU AI Act Art. 50, ASA, FTC) with date-stamped callouts
- [x] **CLOSE-02**: Reader sees an adoption section (pulling up the floor across creative, brand and regional teams) and Backlog 0 defined as a queue-age SLA for unserved demand
- [x] **CLOSE-03**: Reader sees a source register (with publisher bias flags), an evidence-gaps section, and an assumptions register that matches `data.js`

### Quality & Publish

- [ ] **QA-01**: The page meets WCAG 2.2 AA: labelled inputs, `aria-live` outputs, data-table equivalents for charts, and grades not conveyed by colour alone
- [x] **QA-02**: The page is usable at 320 CSS px with tables in their own horizontal-scroll regions, and prints cleanly via an `@media print` stylesheet
- [x] **QA-03**: Before publishing, primary sources (Gartner, McKinsey, NYU/Emory, Optimizely), vendor facts, EU AI Act Art. 50, and Getty v Stability status are re-verified, and the page's legal wording is flagged for review
- [x] **QA-04**: An automated or scripted cross-check confirms every graded number on the page has a register entry and every calculator default matches the prose

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancements

- **V2-01**: Migrate to Eleventy if repeated markup becomes painful
- **V2-02**: Imagery cost comparison (licensed vs generated vs shot) once credible benchmarks exist
- **V2-03**: Replace Modelled defaults with real customer/internal data where available
- **V2-04**: Downloadable CFO one-pager (PDF) of the reader's calculator scenario

## Out of Scope

| Feature | Reason |
|---------|--------|
| Headline "assets generated" volume metric | Goodhart anti-feature: rewards slop; only gate-cleared live assets count |
| Unattributed round-number claims (e.g. "80% of content tasks automated", "10–15% personalisation lift") | No traceable primary source; undermines credibility |
| Vendor case studies presented as benchmarks or averaged | Vendor-claimed and not comparable; shown only as flagged illustrations |
| Precise creative-fatigue thresholds, per-word localisation rate tables | Sources contradict one another or can't be verified |
| Invented typical variant counts, approval times or incident rates | Evidence gaps are stated as gaps or as reader-overridable Modelled defaults |
| Vendor names outside the comparison section and source register | Operating model stays vendor-neutral by category |
| Teardown of a named company's (or Getty/iStock's) own marketing org | User chose a generic enterprise CMO |
| Backend, accounts, persistence, `localStorage` for scenarios | Static, client-side only; sharing via URL hash |
| Building the actual agents/pipelines | The page describes the operating model; it doesn't implement it |
| Frameworks, bundlers, Chart.js, Tailwind | Stack research: no build step earns its keep for one page |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-01 | Phase 1 | Complete |
| SHELL-02 | Phase 1 | Complete |
| SHELL-03 | Phase 1 | Complete |
| SHELL-04 | Phase 1 | Complete |
| SHELL-05 | Phase 1 | Complete |
| CRED-01 | Phase 1 | Complete |
| CRED-02 | Phase 1 | Complete |
| CRED-03 | Phase 1 | Complete |
| CRED-04 | Phase 1 | Complete |
| CRED-05 | Phase 1 | Complete |
| CRED-06 | Phase 1 | Complete |
| CFO-01 | Phase 1 | Complete |
| CFO-02 | Phase 1 | Complete |
| CFO-03 | Phase 1 | Complete |
| CFO-04 | Phase 1 | Complete |
| LEVER-06 | Phase 1 | Complete |
| CALC-08 | Phase 1 | Complete |
| GEN-01 | Phase 2 | Complete |
| GEN-02 | Phase 2 | Complete |
| GEN-03 | Phase 2 | Complete |
| GEN-04 | Phase 2 | Complete |
| GEN-05 | Phase 2 | Complete |
| SPINE-01 | Phase 2 | Complete |
| SPINE-02 | Phase 2 | Complete |
| SPINE-03 | Phase 2 | Complete |
| SPINE-04 | Phase 2 | Complete |
| SPINE-05 | Phase 2 | Complete |
| SPINE-06 | Phase 2 | Complete |
| SPINE-07 | Phase 2 | Complete |
| LEVER-01 | Phase 3 | Complete |
| LEVER-02 | Phase 3 | Complete |
| LEVER-03 | Phase 3 | Complete |
| LEVER-04 | Phase 3 | Complete |
| LEVER-05 | Phase 3 | Complete |
| OUTC-01 | Phase 3 | Complete |
| OUTC-02 | Phase 3 | Complete |
| CALC-01 | Phase 3 | Complete |
| CALC-02 | Phase 3 | Complete |
| CALC-03 | Phase 3 | Complete |
| CALC-04 | Phase 3 | Complete |
| CALC-05 | Phase 3 | Complete |
| CALC-06 | Phase 3 | Complete |
| CALC-07 | Phase 3 | Complete |
| COMP-01 | Phase 3 | Complete |
| COMP-02 | Phase 3 | Complete |
| COMP-03 | Phase 3 | Complete |
| COMP-04 | Phase 3 | Complete |
| COMP-05 | Phase 3 | Complete |
| CLOSE-01 | Phase 4 | Complete |
| CLOSE-02 | Phase 4 | Complete |
| CLOSE-03 | Phase 4 | Complete |
| QA-01 | Phase 4 | Pending |
| QA-02 | Phase 4 | Complete |
| QA-03 | Phase 4 | Complete |
| QA-04 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0

---
*Requirements defined: 2026-10-24*
*Last updated: 2026-10-24 after roadmap creation (traceability filled)*
