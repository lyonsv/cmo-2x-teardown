# CMO 2x v2.0: completion summary

**Live:** https://lyonsv.github.io/cmo-2x-teardown/
**Published commit (site):** `f5bad1e9596982f6c9d5e455023802801ec5d7ea`, pushed to origin/main by fast-forward, never forced (39 commits on top of `fa66201`).
**Date:** 2026-10-25
**Written for:** the author, who was away. Section "Decisions taken on your behalf" lists every call that was made for you.

## What changed

The page moved from a v1 launch-rate scenario ("double campaign-markets per quarter") to a v2.0 argument about handing whole workflows to agents under permissions, checks and approvals. The v1 content was kept: every v1 id, figure and data-fig still resolves (inventory test), and the old material sits in folds and appendices.

### By section

| Section | What it now does |
|---|---|
| First screen and `#opportunity` (01) | States the thesis, the five-link chain (software built, autonomy enabled, human work reduced, capacity increased, outcomes improved), the measurable ambition and an honest headline. Defines 2x as twice the useful work per marketing FTE-equivalent. Separates capacity, efficiency and effectiveness. Explains why there is no merged-PR equivalent in marketing. The v1 launch-rate scenario is kept in a fold labelled first edition. |
| `#autonomy` (02) | "Why hand agents whole workflows?" A four-rung autonomy ladder with when each rung is and is not justified. Intercom's company-reported results with dates, sources and caveats (five new primary sources), what is demonstrated versus uncertain, how the bottleneck moved, and a transferable-principles table including what does not transfer. Intercom tools are named by category only. |
| `#build` (03) | Plain-English description first, then six parts and ten capabilities, build/integrate/platform-provided by category, permission levels (read, draft, stage, publish, spend) beside asset tiers T0 to T3, decisions that stay human, the smallest useful slice, and the E0 to E5 expansion path. |
| `#supply-chain` (04) | The first workflow, from objective to optimise, with Figure 3 (a two-variant SVG diagram: wide and narrow) and stage-by-stage responsibilities. |
| `#economics` (05) | The honest-2x panel (organisation-wide and delegated-portfolio multiples, the uniform limit and what binds), workflow inventory W1 to W10 with prioritisation scores, per-workflow current versus agent tables, scenarios A, B and C side by side (C default) with investment and payback, released-hours reconciliation, reviewer capacity bridge, scale versus programme split, and sensitivity. |
| `#outcomes` (06) | Causal chain with a visible evidence boundary, a three-tier scorecard, diminishing returns (Shapiro et al. 2021; Lewis and Rao 2015) and four defensible outcome mechanisms. Outcomes are never claimed to double. |
| `#expansion` (07) | Adjacent workflows on the same infrastructure, and what is reusable versus domain-specific. |
| `#roadmap` (08) | A 12-week pilot on the market-expansion launch slice (W2, W4, W5, W6) with a "stage" ceiling, four pilot targets graded as hypotheses, next two quarters, a 12-month portfolio kept apart from anything the pilot proves, and enablement. |
| `#risks` (09) | v1 risks plus irreversible publication, contested ground truth, compounding error, judge drift, inference spend, Goodhart on autonomy percentage, labour relations and model regressions, each with a mitigation or test. |
| `#compare` (appendix) | New dated sub-table "What major suites and channels already automate", with a source and availability word on each row ("Generally available", "Announced", "Reported") and fourteen register rows. Vendors are named only here and in the register. |
| Calculator (`#s11`) | Now speaks scenarios A, B and C (C default) on the pilot slice, with the same sign convention as the engine. All existing inputs, share link, show-the-maths and focus behaviour are unchanged. Old `scenario=redeploy|hold|reduce` links map to A, B, B. |

### Engine and calculator

- `calc.js` hardened: master-concept cost split into internal hours plus agency fee, cash and internal-labour views, reviewer capacity bridge, scale versus programme decomposition, pooled queue bound.
- New pure `workflows.js` economics engine: ten workflows, three scenarios, reconciliation, platform team, escape cost, sensitivity. About 300 generated `econ-*` claims, none hand-typed (a test and a crosscheck rule enforce that).
- Every engine input is a graded assumption with a generated register row. A second axis, evidence class (observed, benchmark, illustrative, hypothesis), sits beside the three grade chips.

### v1 figures that moved, and why (Phase 6 correction)

The v1 cost model priced a master concept without its internal hours and used two hourly prices. Both were corrected.

| Figure | v1 | v2.0 |
|---|---|---|
| Cost per approved asset, base / 2x | $64.71 / $45.26 | $152.18 / $106.38 (still -30%) |
| Production-attributable cost, base / 2x | $2.59M / $3.62M | $6.09M / $8.51M (+40%) |
| Share of marketing budget, base / 2x | 3.3% / 4.6% | 7.8% / 10.9% |
| One-off change cost | $396,000 | $360,000 |
| Hold-scenario production change | -$53,579 (a saving) | +$295,053 (an increase) |

Unchanged: brief-to-live 11.8 to 7.5 days, utilisation, break-even auto-approval 41%, capacity floor 29%.

### Figures that moved in the consolidated review

| Figure | Before | After |
|---|---|---|
| Organisation-wide multiple, after platform team | 1.60x Modelled | **1.42x Speculative** |
| Delegated portfolio multiple, after platform team | 1.99x Modelled | **1.72x Speculative** |
| Scenario A net cash effect against today | -$2.13M | -$7.48M (adds $5.35M of agency growth the output needs) |
| Scenario C net cash effect against today | +$15.5M (this was avoided cost) | **-$11.9M** (spend rises); avoided cost shown on its own labelled row |
| Scenario C cash payback | 0.1 years | Not applicable (spend rises) |
| Funding coverage of the cost rise | 3.7x | 0.0x |

### Final regrade (this plan)

`asm-auto-approval` (60% at 2x), `asm-variant-cost` ($0.80 per variant at 2x) and `asm-tooling` ($600k a year at 2x) moved from Modelled to Speculative. No value changed. Derived claims and chips followed, and every chip links the register row that governs its grade. Because calculator tables and field groups now mix grades, their group notes read "The weakest figure in this table is [grade]" and carry the weakest grade, rather than "Every figure ... is Modelled".

## Material assumptions

| Assumption | Value | Grade |
|---|---|---|
| Illustrative company | ~$1B revenue, ~$78M marketing budget (7.8%, Gartner 2026 average), ~120 marketing FTE, 12 reviewers | Modelled |
| Loaded cost per FTE | $150,000 (marketer rate $93.75 an hour, reviewer rate $125 an hour) | Modelled |
| Agency FTE-equivalent conversion | Agency fees divided by a blended rate, editable | Modelled (illustrative) |
| Master concept | $1,200 agency fee plus 35.2 internal hours | Modelled |
| Auto-approval share | 20% today, 60% at 2x | **Speculative** |
| Variant cost | $4.00 today, $0.80 at 2x | **Speculative** |
| Tooling | $150k today, $600k at 2x | **Speculative** |
| Programme adoption, year-1 realisation, autonomous share, out-of-scope uplift, overhead share, autonomy overhead, counterfactual funded share | 100%, 50%, 60%, 10%, L2 20% / L3 8%, 24 h per workflow, 100% | **Speculative** |
| Nine per-workflow agent effects (net hours saved 30% to 60%) | By workflow | **Speculative** |
| Build cost and platform team | $1.5M; 6 FTE at $200,000 | **Speculative** |
| Escape rate and cost | 0.3% of auto-approved variants reach the market with a defect; about $1,500 each | **Speculative** |
| Severance months (scenario B only) | Varies, 0 to 12 | **Speculative** |
| Agency spend grows with output (default switch) | Yes | Modelled |
| Prioritisation scores | Author judgement | Speculative |
| Pilot targets | 40% fewer human hours, 50% shorter objective-to-live, 1% escape ceiling, 80% first-pass floor | **Speculative** (hypotheses) |

**Honest headline, as shown on the page:** 1.42x across the whole organisation (counting the agency spend the output needs and a small platform team) and 1.72x on the delegated portfolio. Both are Speculative model results, not observations. A uniform 2x is not sustainable at defaults: 1.00x because of the traffic cap, 1.54x without it. Outcomes are never claimed to double.

## What remains unverified

- Workflow hour reductions, agent reductions and their ramp have no public benchmark. They are the central hypothesis and are graded Speculative.
- Auto-approval share, variant cost and tooling cost are unsourced.
- Intercom figures are company-reported, with no control group, and a model upgrade is confounded with the window.
- Vendor capabilities are shown as documented on the access date. Re-checks that failed (research reading kept, and each register row says so): `adobe-cx-enterprise` (HTTP 403), `meta-advantage-plus` (HTTP 400 to an automated fetch), `bynder-compliance-agent` (HTTP 403). The Meta row rests on a Campaign Asia report of a WSJ report; the WSJ original was not read and no official Meta launch was found.
- Shapiro et al. and Lewis and Rao were read at abstract level only (the register rows say so). Lewis and Rao is cited for the measurement point, not for diminishing returns.
- The Gartner survey is self-reported by a firm that sells to its respondents. The NYU/Emory paper is not peer reviewed as published on SSRN.
- Pilot targets are hypotheses. Nothing is observed for the subject organisation until the pilot runs.
- Six review fixes change logic, not wording, and the reviewer asked for a human to confirm them: CR-01 (agency growth counted in the headline, default flipped to Yes), CR-02 (scenario C sign and payback), WR-03 (funded share applied to avoided agency growth), WR-04 (funding coverage like-for-like), WR-09 (legacy share links), WR-10 (calculator and portfolio scenarios share one sign convention).
- Not attempted: screen reader testing, zoom to 400%, real devices, grayscale and real-printer output.
- v1 share links without a `scenario=` parameter now open in scenario C (previously Redeploy). A v1 link with `mconcept` now restores the agency fee only, so it computes a different total.

## Checks run

| Check | Result |
|---|---|
| `node --test` | 615 tests, 615 pass, 0 fail |
| `scripts/crosscheck.mjs` | 0 failures (736 figures, 350 chips, 111 cites, 184 register rows, 12 defaults) |
| `scripts/gates.sh` (final run, after the regrade) | ALL GATES GREEN: smoke, a11y (including 320px reflow and text-spacing), print |
| Print | 201 pages against the frozen ceiling of 231; no blank pages; no table cell clipped |
| Screenshots at 1440px and 320px (first screen, Figure 3, #economics workflow table, calculator form) | No overlap or clipped text seen; no document-level horizontal scroll (scrollWidth 1440 and 320). Wide tables scroll inside named, focusable regions by design. At 320px the capture offsets for Figure 3 and the calculator landed on the first screen and the form instead; those two views are covered by the a11y 320px reflow gate and the flow tests, not by a screenshot. |
| W3C Nu validation of `site/index.html` | **0 errors.** 3 warnings, all "Resource violates Content Security Policy (meta tag)" for the external stylesheet and two scripts. They appear because the HTML was POSTed with no base URL; the files load on the live page. |
| Fast-forward check | `git fetch`, origin/main (`fa66201`) is an ancestor of main; `git push origin main` with no force |
| Deploy | pages.yml run **40214131762**, conclusion **success** (test job, then deploy-pages) |
| Live equals local | `index.html`, `assets/style.css` and all 11 `js/*.js` files byte-identical (`cmp`) on the first attempt, 2026-10-25T16:59:11Z |
| Pushed SHA | `f5bad1e9596982f6c9d5e455023802801ec5d7ea` |

The docs commit (SUMMARY.md, COMPLETION.md, planning state) does not touch `site/`; after pushing it, the deploy was re-confirmed against local (see 07-10-SUMMARY.md).

## Requirements

| Requirement | Shown by |
|---|---|
| THESIS-01 to THESIS-04, THESIS-06 | First screen and `#opportunity`; `test/opening.test.js` |
| THESIS-05 | `#autonomy` ladder; `test/autonomy.test.js` |
| INTERCOM-01 to INTERCOM-04 | `#autonomy` results table, demonstrated versus uncertain, principles table; twelve `ic-*` claims; `test/autonomy.test.js` |
| BUILD-01 to BUILD-05 | `#build`; `test/build.test.js` |
| FLOW-01 to FLOW-05 | `#supply-chain` and Figure 3; `test/flow.test.js`, `test/supply-chain.test.js` |
| STRUCT-07 | Body-to-appendix links and spine; `test/spine.test.js`, `test/build.test.js` |
| ECONP-01 to ECONP-04, ECONP-06 | `#economics`; `test/economics-page.test.js` |
| ECONP-05 | Calculator on A/B/C; `test/calc-page.test.js`, `test/share-links.test.js` |
| OUT-01 to OUT-03 | `#outcomes`; `test/later-sections.test.js` |
| EXP-01, EXP-02 | `#expansion`; `test/later-sections.test.js` |
| ROAD-01 to ROAD-04 | `#roadmap`; `test/later-sections.test.js` |
| RISK-01 | `#risks`; `test/later-sections.test.js` |
| COMP-01 | `#compare` platform sub-table; `test/compare.test.js` |
| QA-05 | UI-review follow-ups; `test/a11y-static.test.js`, `scripts/a11y.mjs` |
| QA-06 | `bash scripts/gates.sh` green, desktop and 320px; W3C Nu 0 errors |
| QA-07 | Fast-forward push, deploy run 40214131762 success, live equals local |

## Decisions taken on your behalf

**From the research summary (settled, author away):**
1. Keep the v1 company (120 FTE, $78M, 12 reviewers). Show baseline reviewer slack and reconcile it.
2. Master concept cost split into an internal-hours line and an agency-fee line, re-estimated as illustrative.
3. Keep three grade chips and add an orthogonal evidence class.
4. Primary metric is useful work per marketing FTE-equivalent (agency FTE-equivalents in the denominator). Campaign-markets stays as the reader-facing unit. Objective-to-live time is the speed measure.
5. Scenario C is the default; old `redeploy|hold|reduce` links map to A, B, B.
6. Vendor rule unchanged: categories in the operating model, names only in `#compare` and the register.
7. Semantic section ids plus legacy anchors.
8. Pilot autonomy ceiling is "stage": a person clicks go-live.

**From the phase context:**
- The merge of former phases 7 to 10 into one phase, and an interim publish after the opening sections (you approved both).
- Figures read in page order 1, 3, 2, 4 because v1 Figure 2 moved to Appendix A. Renumbering was not done.
- Evidence key sits in a fold, so a printed legend omits its content (the label and the grade-versus-evidence sentence do print).
- Print page ceiling re-set once to 231 (201 pages x 1.15) and frozen.
- The legal-review flag was dropped, as you decided; the a11y and print gates assert it is absent.

**From the review fixes:**
- CR-01: default for "agency spend scales with output" flipped from No to Yes, so the headline counts the agency spend the extra output needs (1.60x became 1.42x).
- CR-02: scenario C net is the cash effect against today, so it is negative; avoided cost is a separate labelled row.
- CR-03: 18 unsourced engine hypotheses graded Speculative; the legend now says programme effects stay Speculative until a pilot measures them.
- WR-01 and WR-02: most chips link `asm-adoption-rate`, because measurement shows it moves most economics figures most.
- WR-07: the delegated portfolio is stated as the four workflows with the largest assumed hour reductions, a best case.
- IN-02 and IN-06: sampling and overhead double counting, and full-volume inference cost, were documented as conservative choices rather than changed.
- WR-13: no per-section print budget was added.

**Taken in this plan (orchestrator instruction, consistency with CR-03):**
- `asm-auto-approval`, `asm-variant-cost` and `asm-tooling` regraded Speculative.
- Calculator group notes reworded to "The weakest ... is" and carry the weakest grade, because members no longer share a grade. A table row with several figures carries the weakest grade among them, and a short sentence now links `asm-review-service-days` from the results note so no register row is left unreferenced.

## Known debt

- Figure order on the page is 1, 3, 2, 4 and the evidence key does not print.
- Most chips link the single row `asm-adoption-rate` or `asm-auto-approval`, which is accurate but less specific than a per-workflow row.
- Group notes over-warn for the Modelled members of a mixed-grade table (for example campaign-markets in the results table). The figure's own claim grade is correct; only the table note is conservative.
- The calculator's Speculative regrade means the calculator results table is graded by its weakest row, so a reader cannot tell from the note which rows are Modelled.
- Three platform sources failed automated re-check (see unverified list).
- `node --test` can hang at 100% CPU after every file finishes when its output is piped; run it with a timeout or to a file.
- The workflow `ubuntu-latest` label migrates to Ubuntu 26 (GitHub annotation on the deploy run); check the pages.yml action versions at the next change.
- Browser gates (smoke, a11y, print) run locally, not in CI, so the CDP flake cannot block a deploy.
- Deferred by the phase context: full editable inputs for every workflow.
