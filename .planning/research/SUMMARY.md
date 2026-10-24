# Project Research Summary

**Project:** CMO 2x — Marketing Acceleration Teardown
**Domain:** Long-form, evidence-graded editorial static page for a CMO (primary reader) and CFO (secondary), with a client-side calculator. Modelled on the Intercom 2x teardown.
**Researched:** 2026-10-24
**Confidence:** MEDIUM. HIGH on stack and page structure; MEDIUM-LOW on quantitative benchmarks; MEDIUM on vendor facts.

> Synthesised from STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md and COMPETITORS.md. The synthesiser was unable to write the file, so the orchestrator saved its returned text verbatim.

## Executive Summary

This is a persuasive analytical document, not a software product. The reference page is one hand-written HTML file with inline CSS, system fonts and no JavaScript. Its credibility comes from graded claims, visible assumptions and candid self-critique. This page should be built the same way:

- **Stack.** Hand-written HTML/CSS, plus one pure-maths calculator module tested with `node:test`, plus a thin DOM/SVG layer. No framework and no bundler.
- **Deploy.** A GitHub Actions Pages workflow.
- **Where the effort goes.** The only real engineering is the calculator and the SVG figures. The bulk of the work is content.

**Central finding: marketing has no public equivalent of Intercom's merged-PRs-per-head data.** No independent benchmark exists for:

- assets per marketer
- cost per asset
- approval cycle time
- rights-incident rate
- auto-approval rate

Cost figures are mostly company-reported (Klarna, Unilever) or vendor-reported. So the page should carry few Benchmark anchors, many Modelled numbers with visible assumptions, and an explicit evidence-gaps section.

**The argument rests on "derive, do not generate":**

1. A few human-directed master concepts become 10,000+ variants through templating, localisation and feed rendering.
2. Most of those assets then sit in low-risk tiers.
3. That makes review capacity the binding constraint.
4. The build-and-review spine (review agent, tiers T0–T3, eval harness) addresses that constraint.

The output metric is approved-and-live variants per marketing head, always paired with outcome and guardrail metrics. AI spend is a floor, never a KPI.

**Main risks are to credibility:**

- unsourced or vendor-hyped numbers
- Goodhart on asset counts
- no counterfactual for outcome claims
- calculator maths with hidden assumptions
- one-sided treatment of risk

**Three deliberate sensitivities:**

1. Gradial, AirOps and Profound are named in one comparison section only. Every claim about them is sourced, dated and flagged as vendor-claimed.
2. A conflict-of-interest note is required, because the author works at iStock/Getty. This bears on imagery sourcing and on Getty v Stability.
3. EU AI Act Article 50 (applicable since 2026-08-02) and the Getty appeal status must be re-verified against primary sources immediately before publishing.

## Key Findings

### Recommended Stack

- **Markup and styling.** Hand-written HTML with CSS custom properties.
  - Copy the reference's `.wrap`, `.sec-head` and `.chip` patterns.
  - System fonts only.
  - No base64 images. The reference is about 3 MB because of them.
- **`calc.js`.** A pure ES module exposing `compute(inputs, assumptions)`.
- **`ui.js` and `svg.js`.** `ui.js` plus a roughly 60-line `svg.js` bind the calculator to `<output aria-live="polite">` and a live SVG chart. Static figures are authored as inline SVG.
- **`data.js`.** The single source for defaults, grades and source IDs. Prose and the calculator both read from it, so graded claims cannot drift from the maths.
- **Tests: `node:test` on Node 22.** Cover these cases:
  - 1x identity
  - monotonicity
  - a hand-calculated golden case
  - zero and edge inputs, which must produce a validation error and never NaN
  - cost per approved asset falls as volume rises (the CFO claim)
- **GitHub Pages via Actions.**
  - Tests gate the deploy.
  - `site/` is uploaded unchanged.
  - All URLs are relative.
  - Include a `.nojekyll` file.
  - Verify the action major versions before pinning them (MEDIUM confidence, unverified).
- **Avoid:** Chart.js, Tailwind, SPA frameworks, unpinned CDNs and `localStorage`.
- **Shareable scenarios:** use URL-hash state.
- **Upgrade path, only if triggered:** Eleventy first, then Observable Plot, pinned with SRI.

### Expected Features

**Table stakes:**

- **One output metric** with an anti-gaming denominator. Show it beside cost per approved live asset and median days from brief to live.
- **Paired outcome metrics**, measured by holdout rather than platform attribution.
- **A grade on every number.** Back this with a grade key, a source register with bias flags, and an evidence-gaps section.
- **Visible variant arithmetic**, using "applicable fraction" inputs.
- **A CFO answer** anchored on flat budgets. Gartner puts marketing budgets at 7.7% of revenue in 2025 and 7.8% in 2026.
- **The governance spine.**
- **A candid "what goes wrong" section.**

**Differentiators:**

- **Calculator with a reviewer-capacity model.** It shows the break-even auto-approval rate at flat review headcount.
- **Variant-explosion worked example**, showing concepts against variants.
- **Win-rate maths.** Test win rates run from 12% to 36% depending on the definition used.
- **Disclosure penalty.** NYU/Emory found a −31.5% click-through rate when ads are labelled as AI.
- **Tier risk matrix.**
- **Statutory-damages tail-risk illustration.** The incident rate is graded Speculative.
- **Neutral imagery-sourcing decision table**, with the conflict-of-interest note beside it.
- **AEO/GEO as the sixth lever.**
- **Adoption playbook.** It comes late in the page and is graded Speculative.

**Anti-features:**

- A headline "assets generated" metric.
- Unattributed round-number claims.
- Vendor case studies presented as benchmarks. Show them as "company-reported" or "vendor-reported", and never average them.
- Fabricated typical variant counts, approval times or incident rates.
- Platform self-report treated as independent evidence.
- Vendor names outside section 12 and the source register.

**Defer, or keep brief:**

- Imagery cost comparison.
- Quantified benefits of insight and reporting.
- Fatigue day-counts, per-word localisation rates and any single personalisation uplift figure.

**Primary-metric decision for Phase 1.** FEATURES.md proposes unweighted gate-cleared live variants per head. ARCHITECTURE.md proposes complexity-weighted. The recommendation:

- **Headline metric:** approved-and-live variants per marketing head per quarter. The denominator is all marketing FTE, including brand, ops, regional and agency-equivalent staff.
- **Always shown beside it:** unique concepts, and variants per concept.
- **Tier-weighted view:** offered as a sensitivity only, because weights are arbitrary and can be gamed.

**Grade key.** Use Benchmark / Modelled / Speculative. PROJECT.md governs here, not the reference's Verified / Inferred / Uncertain. Add a separate source flag, vendor-claimed or company-reported, that never upgrades a claim to Benchmark.

### The Six Levers

| # | Lever | Output metric | Outcome metric | Evidence |
|---|---|---|---|---|
| 1 | Content generation at 10,000+ assets (deep dive) | Approved-live variants per head; unique concepts; cost per approved live asset | Holdout conversion / CAC / ROAS; first-pass compliance; rejection rate; brief-to-live time | Mostly Modelled. Company-reported anchors are flagged. One controlled CTR study and one null retail result. |
| 2 | Localisation / transcreation | Approved localised assets per locale per quarter; lag from master to last locale | Launch lag; locale rejection rate; quality sampled by linguists | Vendor case studies, plus an academic range of 9–60%. Per-word rates are a GAP. |
| 3 | Experimentation | Experiments per quarter; rate of conclusive tests | Winners rolled out; time from fatigue to replacement | Decent anchors, but vendor-biased: Optimizely ~12%, DRIP 36.3%, Microsoft ~1/3. Traffic bounds the number of tests. |
| 4 | Insight and reporting | Time to insight; share of reports automated; MMM refresh cadence | Faster budget reallocation; earlier fatigue detection | Almost all GAP. Keep brief and Modelled. |
| 5 | Ops: briefs, approvals, DAM metadata, rights | Brief-to-draft time; review rounds; metadata completeness; rights-check coverage | Rights incidents per 1,000 assets; reuse; takedown rate | GAP, apart from the statute. Speculative. |
| 6 | Answer-engine visibility (AEO/GEO) | Answer assets published or refreshed per head; prompts tracked | Share of voice and citations; AI-referred sessions and conversion; discovery and pipeline | Thin and vendor-only. Panel-based and unaudited. Grade outcomes Speculative or vendor-reported. |

Lever 6 closes a loop: when citations are lost, that signal becomes a refresh brief for the factory.

### Architecture Approach

**The operating model is a closed loop:**

1. A structured brief carries a risk class.
2. One versioned policy layer feeds both the generator and the reviewer. It covers brand, claims, legal, rights, glossaries and PIM data.
3. Generation derives volume from a few masters, and every asset emits a manifest.
4. The review agent returns pass, fix or escalate, citing rule IDs.
5. A tiered gate makes the approval decision.
6. Human decisions become ground truth for the eval harness.
7. Approved assets go to the DAM with provenance and licence scope.
8. Activation publishes only approved IDs.
9. Performance data joins back by asset ID.

**Components:**

- intent
- policy and knowledge
- build
- review
- eval harness
- system of record (DAM, rights and provenance)
- measurement and telemetry

**Rules:**

- Derive, do not generate.
- Review can escalate an asset's tier but never lower it.
- The reviewer never trusts the generator's self-reports.
- Thresholds come from eval data, not opinion.
- Policy changes need human approval and must pass the eval harness.
- Use a different model or prompt family for review than for generation.

### Build-and-Review Spine

**Tiers:**

- **T0:** deterministic derivatives. Auto-publish.
- **T1:** new executions inside approved claims. Agent review plus a sampled audit.
- **T2:** new claims, people imagery or new markets. Agent review plus mandatory human review.
- **T3:** regulated, comparative, health/finance or crisis content. Human and legal review only, with agent assistance.
- **Human-only list:** hero and cultural-moment work, claim-bearing and testimonial-like content, and anything using a likeness.
- Tier definitions are illustrative, depend on jurisdiction, and are not legal advice.

**Review agent:**

- Cites rule IDs.
- Attaches its findings to the asset manifest.
- Runs a bounded fix loop, then escalates.

**Eval harness:**

- Ground truth comes from reviewer decisions with reason codes.
- Seeded known-bad assets and rights traps test the reviewer.
- Auto-approved items are sampled to estimate the escape rate.
- It tracks precision, recall and drift per tier.
- Thresholds are published.
- No model, rule or skill change ships if it makes the harness results worse.

**Reviewer-capacity model:**

- Human reviews = assets × (1 − auto-approval share) × sampling and escalation rates.
- Output cannot exceed review throughput.
- The calculator shows the break-even auto-approval rate needed for 2x at flat headcount.
- "85–95% of assets fall in T0/T1" is a Modelled input, exposed for the reader to change.
- Fatigue controls:
  - Blind-first review: the reviewer doesn't see the agent's verdict first.
  - Catch rate on seeded errors as a leading indicator.
  - Session caps.
  - Sampling instead of full inspection.

### Page Section Structure (14 vs 18 reconciliation)

**Recommendation: 15 numbered sections.** Merge the 18-section draft down to near the reference's 14, then add the named comparison section.

- The CFO hook stays early.
- The calculator sits after the gate and before adoption and risk.

**Unnumbered front matter:**

- title block and metadata
- conflict-of-interest note
- grade key
- contents
- answer-first paragraph

| # | Section | Merges (draft sections) |
|---|---|---|
| 01 | Claim and measurement: output metric, outcome families, six levers at a glance, what 2x does not mean | 01 |
| 02 | Spend floor and CFO answer | 02 |
| 03 | Mental model: factory and content supply chain | 03+04 |
| 04 | Platform and skills | 05+06 |
| 05 | The 10,000-asset campaign: variant matrix, imagery sourcing, personalisation, feeds | 07 |
| 06 | Review agent | 08 |
| 07 | Auto-approval gate: tiers, human-only list, reviewer capacity | 09 |
| 08 | Eval harness and telemetry | 10+11 |
| 09 | The other five levers: localisation, experimentation, insight, ops, AEO | 12 (+ lever 6) |
| 10 | Outcome case | 13 |
| 11 | Your numbers: calculator | 14 |
| 12 | **How this compares:** Gradial, AirOps, Profound. The only section that names vendors. | new |
| 13 | Adoption and where it leads: Backlog 0 as a queue-age SLA | 15+16 |
| 14 | What goes wrong | 17 |
| 15 | Source register, evidence gaps and assumptions register | 18 |

**Formatting conventions:**

- Figures are inline SVG with `<title>` and `<desc>`.
- Tables have a `<caption>` and sit inside `overflow-x:auto` regions.
- Include an `@media print` stylesheet.

### Competitor Positioning (section 12)

PROJECT.md overrides the "keep names internal" note in COMPETITORS.md. Vendor names appear only in this section and in the source register.

None of the three is an alternative to the full operating model. Each is a component or a partial overlap.

| Vendor | Verdict | Slots in as | Does not replace (based on public material) |
|---|---|---|---|
| Gradial | Closest overlap. A partial alternative to the ops and build half, for web and email. | Execution layer: CMS authoring, DAM metadata, QA and accessibility. Its rules engine works as a pre-gate check. | Creative and imagery generation at 10k+ assets, rights review, a documented eval harness, tiered auto-approval, metric design. |
| AirOps | A component for the text and AEO slice. | Refresh workflows, AEO content engineering, Grids as a batch runner. | Imagery, rights, DAM, multi-channel variants, review calibration. |
| Profound | A component for measurement and discovery. | AEO tracking across up to 9 engines; Agent Analytics. | Anything beyond AEO. No documented link to experimentation or conversion (source is competitor-authored; LOW-MEDIUM confidence). |

**Writing rules:**

- Source and date every claim (accessed 2026-10-24; re-verify at publish), and flag it as vendor-claimed.
- All outcome figures are vendor claims or repeated in press. None is independent, and none is comparable to creative production at 10k assets.
- Use competitor-authored reviews for limitations only, and flag them as such.
- Say "not publicly documented", never "does not exist".
  - Profound documents a uniform human approval on every run.
  - Gradial and AirOps describe approvals only in general terms.
- Acknowledge that the CMO 2x spine is a design, not a shipped product.
- Cover build vs buy and lock-in at category level. The advice: own the eval set and the brand rules.
- Omit these, or treat them as LOW confidence, because sources conflict or are thin:
  - Gradial's valuation and total funding.
  - AirOps pricing, and its inconsistent Webflow figures.
  - Profound's Series D, which comes from a single outlet.
  - Gradial's CMS/DAM list. Do not claim AEM support.

### Top Pitfalls

1. **Goodhart on counts or spend.**
   - Count only gate-cleared output, and pair it with outcomes and concept count.
   - State a falsifier.
2. **No counterfactual.**
   - Use holdouts and pre-registered metrics.
   - Correct for multiple comparisons.
   - Calibrate MMM against incrementality tests.
   - Grade outcomes Modelled or Speculative.
   - Phrase negatives as "we did not find".
3. **Untraceable statistics.** Keep a claim register. Exclude or flag:
   - the NIQ claims about AI ads
   - MIT's "95%" (grade it Uncertain if used)
   - the 2.3x ROAS vendor figure
   - "10–15% personalisation lift"
   - fatigue day-counts
   - the Nielsen 43% / 37% figures
4. **Slop, brand dilution and sameness.**
   - The 2x applies to variants, not flagship creative.
   - Use a human-only list, the concept metric, variant caps and diversity checks.
   - Put the incident list (Coca-Cola, McDonald's NL, Guess, Levi's) in the main text, separating what was established from what was alleged.
5. **Calculator credibility.**
   - Failure modes: hidden assumptions, unit errors, double-counted variants, NaN, omitted review cost.
   - Guards: a pure model, a 1x identity test, "show the maths", a "what you must believe" panel, and outputs inheriting the grade of their weakest input.
   - Cost per approved-live asset must include review, rework, tooling, rights and storage.
   - Headcount scenarios (redeploy, hold, reduce) must include change-management cost.
6. **Legal, regulatory and conflict-of-interest issues.**
   - Indemnity transfers risk; it does not remove it.
   - Fully generated output may not be protectable by copyright (US Copyright Office, January 2025).
   - Disclosure and substantiation rules apply: EU AI Act Article 50, the ASA and the FTC.
   - Describe Getty v Stability neutrally, with the COI note beside it.
   - Have the page's own wording legally reviewed.

**Technical pitfalls:**

- root-absolute paths
- filename case sensitivity
- a missing `.nojekyll` file
- unpinned CDNs
- grades shown by colour alone

Target WCAG 2.2 AA.

## Implications for Roadmap

**Four phases.** Each is a vertical slice that ends with a deployed, viewable increment of the page.

- The calculator model is built early; its UI comes later.
- The source register grows in every phase and is reconciled in Phase 4.

### Phase 1: Foundation and thesis slice

**Rationale:** the metric definition, the grade scheme and the register must come first. The CFO section needs the calculator model, but not its UI.

**Delivers:**

- **Live page on GitHub Pages:** shell, metadata, conflict-of-interest note, grade key, contents, answer-first paragraph, design tokens, and print and mobile table patterns.
- **Content:** sections 01–02 and a skeleton of section 15.
- **Code:** `data.js` and a tested `calc.js`.
- **Figure:** a static baseline-vs-2x figure.
- **Deploy:** a Pages workflow gated on the tests.

**Addresses:**

- the metric decision, including the concept-count rule
- the grade key with its vendor flag
- the Gartner anchors
- the spend floor
- the six-lever table

**Avoids:**

- Goodhart
- unsourced statistics
- calculator unit errors
- Pages path and case issues
- base64 bloat

### Phase 2: Factory and spine slice

**Rationale:** the spine is the centrepiece, and its tier shares and review rates become the calculator defaults. Expect one iteration with the Phase 1 model.

**Delivers:**

- Sections 03–08, with SVG figures:
  - factory
  - supply chain
  - variant matrix
  - flow from brief to approved asset
  - tier ladder
  - review sequence
  - eval loop
- The tier table with the human-only list.
- A static worked example of reviewer capacity.
- The neutral imagery-sourcing table, with the COI note.

**Avoids:**

- slop
- rubber-stamp review
- permissive tiers for claims and likeness
- split rulebooks for generator and reviewer
- over-trusting indemnity

### Phase 3: Levers, outcomes, calculator and comparison slice

**Rationale:** the breadth sections and the comparison need the finished operating model, and the calculator UI needs finished defaults.

**Delivers:**

- **Sections 09–12:**
  - the five other levers, including AEO
  - the outcome case, with a holdout design
  - the interactive calculator
  - "How this compares"
- **Calculator features:**
  - assumptions panel
  - a grade on each output
  - sensitivity table
  - headcount scenarios
  - reviewer-capacity output
  - URL-hash state

**Avoids:**

- outcome claims without a counterfactual
- hidden assumptions
- vendor claims graded as Benchmark
- competitor-authored claims used as fact

### Phase 4: Adoption, risk, evidence and publish slice

**Rationale:** these sections have the weakest evidence and the fewest dependencies. Reconciling the register and re-verifying claims must come last.

**Delivers:**

- **Sections 13–15:**
  - adoption, with Backlog 0
  - the risk section, with the incident list and a risk register
  - the finished source register, with publisher bias flags
  - evidence gaps
  - an assumptions register that matches `data.js`
- **Cross-checks:** every number appears in the register, and every calculator default matches the prose.
- **Accessibility pass:** WCAG 2.2 AA, layout at 320px, and data tables behind every chart.
- **Reviews:** legal wording review and vendor re-verification.
- **Production deploy.**

### Research Flags

**Phase 2:** view the live reference page visually before locking the tiers, the harness metrics and Backlog 0. Its sections 05–14 are base64 screenshots.

**Phase 3:**

- Re-verify all vendor claims against primary pages.
- Confirm Gradial's CMS/DAM list and which AirOps tier includes Human Review.
- Check whether any independent AEO measurement study exists.

**Phase 4:**

- Verify these against primary text:
  - EU AI Act Article 50 and its Code of Practice
  - the Getty appeal status
  - Moffatt v Air Canada
  - Parasuraman and Manzey (2010) on reviewer fatigue
- Check indemnity wording.
- Flag the page for legal review.

**Standard patterns, so skip research:** Phase 1. Only the Gartner figures and the action versions need a quick check.

## Confidence Assessment

| Area | Confidence | Notes |
|---|---|---|
| Stack | HIGH | Reference page fetched, npm versions checked, and the choice follows from the constraints. Action major versions are MEDIUM. |
| Features | MEDIUM-LOW | Structure and metrics are strong. Many benchmarks were read only through secondary sources: Gartner returned 403, and the McKinsey and Unilever primary pages were unreachable. Most operational benchmarks are gaps. |
| Architecture | MEDIUM | The category-level component map is well established. The Intercom mapping rests on section titles and PROJECT.md, because the Shrek, gate and harness sections were unreadable. |
| Pitfalls | MEDIUM | Incidents are well documented. Fatigue and attribution numbers are mostly secondary. Regulatory items come from law-firm commentary. |
| Competitors | MEDIUM | Vendor pages were read directly. No outcome claim has independent verification. Three of the four third-party reviews are competitor-authored. |

**Overall:** MEDIUM. Enough to plan and build. Content claims need re-verification before publishing.

### Gaps to Address

- **No independent benchmarks** for cost per asset, variant counts, approval times, rights-incident rates, auto-approval share, first-pass compliance rate, analyst hours, or DAM metadata rot. These become Modelled defaults the reader can override, since no internal data is available. List each one in the evidence-gaps section.
- **Primary sources unread:**
  - Gartner 2025/2026
  - McKinsey: economic potential, State of AI, personalisation
  - the Unilever release
  - the NYU/Emory paper and the arXiv preprints
  - the Optimizely PDF

  Open each one before assigning a Benchmark grade, or downgrade the claim.
- **Gartner 49% / 40% / 27% (G3):** the meaning is unclear. Verify or drop.
- **Intercom's Shrek, gate and curator specifics:** unreadable so far. Review the live page before Phase 2.
- **EU AI Act dates:** a 2 Dec 2026 transition date has been reported. Verify against the Commission's text and date-stamp the callout.
- **Getty v Stability appeal status:** not yet checked.
- **Vendor facts:** valuation, CMS/DAM list, pricing, the Series D and tracking methodology. Re-verify or omit.
- **AEO outcome evidence:** vendor testimonials with small bases. Grade it Speculative or vendor-reported.
- **Primary-metric weighting:** confirm in Phase 1.
- **GitHub Actions versions and `node --test` behaviour:** verify when writing the workflow.

## Sources

Primary and secondary sources are collected in STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md and COMPETITORS.md.

**Primary:**

- the reference page
- the npm registry
- 17 U.S.C. 504
- WCAG reflow
- GitHub Pages docs
- NYU Stern
- Doshi and Hauser (PMC)
- NBER w26278
- MIT Economics
- vendor pages (read directly, but their claims remain vendor-claimed)

**Secondary:**

- Gartner releases, read through summaries
- commentary on Getty v Stability (AIPPI, Mishcon)
- Copyright Alliance
- law-firm commentary on the EU AI Act
- press coverage of incidents
- funding coverage of the vendors (Axios, CMSWire, TNW, Fortune)
- Adobe surveys (vendor-biased)
- Optimizely
- Kohavi
- Nimdzi

**Tertiary:**

- company-reported figures from Klarna and Unilever
- competitor-authored reviews, used for limitations only
- vendor polls (Canto, PerformLine, Circana, Monks, Claritas)
- DRIP, via Foundry CRO
- blogs on creative fatigue
- MIT NANDA's "95%"
- NIQ's research on how people perceive AI ads
- filings in rights disputes

---
*Research completed: 2026-10-24*
*Ready for roadmap: yes*
