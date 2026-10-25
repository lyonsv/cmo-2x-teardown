---
phase: 07-content-presentation-publish
fixed_at: 2026-10-25T00:00:00Z
review_path: .planning/phases/07-content-presentation-publish/07-REVIEW.md
iteration: 1
findings_in_scope: 25
fixed: 25
skipped: 0
status: all_fixed
---

# Phase 7 / Milestone v2.0: Code Review Fix Report

**Fixed at:** 2026-10-25
**Source review:** .planning/phases/07-content-presentation-publish/07-REVIEW.md
**Iteration:** 1
**Mode:** Worked on the main working tree (orchestrator instruction), one commit per finding or tightly related group, not pushed. `node --test` and `node scripts/crosscheck.mjs` were green after every commit. `bash scripts/gates.sh` passed at the end: ALL GATES GREEN, on the second run after updating two smoke checks for WR-09.

**Summary:**
- Findings in scope: 25 (5 critical, 13 warning, 7 info)
- Fixed: 25 (several logic fixes need a human to confirm them, marked below)
- Skipped: 0
- Tests: 608 before the fixes, 615 after, all passing. Crosscheck shows 0 failures (736 figures, 350 chips, 184 register rows).

## Headline changes

| Figure | Before | After |
|---|---|---|
| Output multiple, whole organisation, after the platform team (first screen, #opportunity, #economics, #roadmap) | 1.60x Modelled | **1.42x Speculative** |
| Output multiple, whole organisation, before the platform team | 1.65x Modelled | 1.45x Speculative |
| Output multiple, delegated portfolio, after / before the platform team | 1.99x / 2.18x Modelled | **1.72x / 1.86x Speculative** |
| Output multiple, pilot workflows (W2, W4, W6), after / before the platform team | not shown | 1.70x / 1.87x Speculative (new) |
| Scenario A net cash effect against today | −$2,133,647 | −$7,481,083 (run cost plus $5,347,436 of agency growth) |
| Scenario C net cash effect against today | +$15,523,156 (this was avoided cost) | **−$11,912,448** (spend rises) |
| Scenario C cash payback | 0.1 years | Not applicable: spend rises against today |
| Scenario C avoided cost against growing without the programme, net of run cost | (in the cash row) | $15,523,156 on its own labelled row; 0.1-year payback, labelled "not a cash payback" |
| W5 reviewers FTE today / with agents | 6.6 / 3.7 | 7.8 / 4.4 (the bridge's required FTE) |
| W5 labour cost today / with agents | $992,632 / $556,842 | $1,167,802 / $655,108 |
| Calculator scenario C first-year net | $1,295,199 (positive meant a cost) | −$1,295,199 (positive means a saving, same sign as the engine) |
| Funding coverage (claim only, not on the page) | 3.7x | 0.0x (agency spend rises at 2x volume) |

Grades: 130 economics figures on the page move from Modelled to Speculative under CR-03. Every chip now links the register row that drives that figure's weakest grade. The full before-and-after list of every page figure whose value or grade changed is in the appendix.

## Fixed Issues

### CR-01: The headline output multiple excludes agency growth the engine says that output needs

**Files modified:** `site/js/workflows.js`, `site/js/data.js`, `site/index.html`, `test/workflows.test.js`, `test/engine-data.test.js`
**Commit:** 28d80d4
**Applied fix:** `agency_scales_with_output` now works in both settings.
- Yes, the new default, keeps the engine's existing "grows with output" meaning. Scenario A charges the implied agency growth in its net. `buildMetric` adds that growth, converted to FTE-equivalents (26.7 org-wide), to the A denominators: org-wide, portfolio and the new pilot figure, before and after the platform team.
- No caps each workflow's scenario A output at what today's agency budget can support, 1/(1−s_eff). The org-wide figure is then 1.25x.

The maximum-multiplier table stays a labour limit (`m_max`). A new test checks that toggling the switch changes the headline when the budget binds, and changes nothing when no budget binds. The prose on the first screen and in #opportunity, #economics, #roadmap and scenario A now says the headline counts the agency spend the extra output needs. Scenario A's "held fixed" row now reads "In-house people; agency spend grows with the output".
**Status:** fixed: requires human verification. The default switch was flipped from No to Yes; the reason is recorded in the asm-agency-scales basis.

### CR-02: Scenario C shows avoided cost as "Annual net cash effect" and a 0.1-year cash payback

**Files modified:** `site/js/workflows.js`, `site/js/data.js`, `site/js/model.js`, `site/index.html`, `test/workflows.test.js`, `test/engine-data.test.js`, `test/economics-page.test.js`
**Commit:** 8993b57
**Applied fix:**
- `scenarios.C.net` is now the cash effect against today, −versus_today. That is the convention A and B already use.
- New fields: `net_avoided` (avoided cost minus run cost) and `payback_avoided`. `payback_simple` is null.
- The table row is now "Annual net cash effect against today". C's cash payback cell reads "Not applicable: spend rises against today".
- Two new rows, each labelled "against growing without the programme … not cash", show the avoided cost net of run cost and its payback.
- The duplicate "Spend versus today" row was removed. The prose says there is no cash saving and no payback against today.
- In the calculator, the avoided reviewer hire cost row is relabelled "against growing without the programme (not cash, not netted)". The calculator's sign convention was aligned under WR-10.
**Status:** fixed: requires human verification

### CR-03: The programme-effect hypotheses behind every headline are graded Modelled

**Files modified:** `site/js/data.js`, `site/index.html` (chips, generated register rows, legend), `scripts/crosscheck.mjs`, `test/evidence.test.js`, `test/supply-chain.test.js`
**Commit:** c8ff92c (grouped with WR-01, WR-02 and WR-12, which cannot be green on their own: a chip must link a row whose grade equals the figure's grade)
**Applied fix:**
- `eng()` now grades every engine row with `evidence: 'hypothesis'` as Speculative, the same as the escape rate. None of these rows has a source for its central value. The cites on the workflow-effect rows support only their token profiles, and the platform-team cite supports only its wage.
- 18 rows were regraded: out-of-scope uplift, overhead share, autonomous share, adoption, year-1 realisation, build cost, platform team, autonomy overhead, counterfactual funded share, and the nine `asm-wf-*-agent` rows. The trace carries the new grade into the derived figures.
- Agent-state per-workflow figures and reconciliation figures are graded Speculative as a family, so table rows keep one grade.
- The legend's Speculative entry now says programme effects stay Speculative until a pilot measures them.
- The grade-count tests were changed on purpose: hypothesis/Modelled 42 → 24, hypothesis/Speculative 13 → 31.
**Status:** fixed

### CR-04: Section 08 claims double-counting controls the engine does not implement

**Files modified:** `site/index.html`, `site/js/data.js`, `scripts/crosscheck.mjs`, `test/later-sections.test.js`
**Commit:** d0388fe
**Applied fix:** #roadmap now says:
- The engine keeps one pool for each workflow, plus one shared reviewer pool. The pools are disjoint by construction, and the engine does not pool hours by role.
- There are two hourly prices, each bound to its register row: $93.75 for a marketer and $125 for a reviewer.
- Autonomy overhead is review work, so it is priced at the reviewer rate. This is documented in the asm-autonomy-overhead and asm-reviewer-rate bases.
- A removed reviewer is valued at the same per-person loaded cost of $150,000. Because reviewers are staffed below their productive hours, this works out to about $147 an hour. That is the same price per person, not a third price per hour.
- The reconciliation is an arithmetic consistency check and is zero by construction.
- 1.47x is "the capacity multiple from pooling the hours the programme releases". Human hours fall.

The rate rows' bases no longer say "One price per hour", and both rate rows are now linked from the page.
**Status:** fixed

### CR-05: Contradictory definitions of 2x remain visible

**Files modified:** `site/index.html`, `site/js/data.js`, `site/js/model.js`, `test/page.test.js`, `test/calc-page.test.js`
**Commit:** eebafec
**Applied fix:**
- "What 2x does not mean" now defines 2x as twice the useful work per marketing FTE-equivalent, and links the definition. Campaign-markets stay the first workflow's operational unit.
- Both falsifiers (first screen and s01) are restated in terms of the primary metric.
- The flat-headcount note, the first-edition measure fold and the metric-trio label are marked as first-edition.
- The asm-marketing-fte basis and the calculator hint now say marketing FTE is the core of the primary metric's denominator.
- A new guard test fails if the old definition comes back in visible text.
**Status:** fixed

### WR-01: Speculative chips repointed to `asm-escape-rate` mislead; the "for severance" note was wrong

**Files modified:** `site/js/data.js`, `site/index.html`
**Commit:** c8ff92c
**Applied fix:** I measured, for each figure, which Speculative engine row moves it most. Refs were then set as follows:

| Figures | Linked row |
|---|---|
| Programme figures, including the A/B/C nets, savings, hires and metrics | `asm-adoption-rate` |
| Run cost | `asm-platform-team` |
| B year-1 net | `asm-year1-realisation` |
| B one-off | `asm-severance-months` |
| C avoided cost, its net and its payback | `asm-counterfactual-funded` |

No row rule had to be relaxed: every table row now shares one governing ref. The scenarios table note and the sensitivity note no longer say nets are Speculative "for severance". They say severance enters only B's one-off cost and payback.
**Status:** fixed

### WR-02: Other chips point at register rows unrelated to the figure

**Files modified:** `site/js/data.js`, `site/js/model.js`, `site/index.html`
**Commit:** c8ff92c
**Applied fix:**

| Figure | Linked row now |
|---|---|
| Metric claims | adoption (they no longer link `asm-agency-fte-cost`) |
| 1.00x uniform limit, and W8 maximum | `asm-traffic-growth` |
| 1.54x excluding traffic | `asm-wf-w3-agent` |
| Review-overhead sensitivity | `asm-overhead-share` (`asm-sampling-rate` is now justified as register-only) |
| Inference sensitivity cells | adoption, which drives their Speculative grade |
| Inference run-cost line | `asm-wf-w7-agent`, the run profile that dominates it |
| Calculator scenario rows and the C avoided-hires chip | `asm-auto-approval` (no longer `asm-markets`) |
**Status:** fixed

### WR-03: The counterfactual funded share applies to avoided hires but not to avoided agency growth

**Files modified:** `site/js/workflows.js`, `site/js/data.js`, `site/index.html`, `test/workflows.test.js`
**Commit:** d14ef3f
**Applied fix:** `avoided_cost = (avoided hires × loaded + avoided agency) × funded share`. The C-agency ledger rows are scaled the same way, and a new `agency.avoided_funded` field was added. The register row was relabelled "Share of the no-programme plan that was funded", and its basis says it is the generous end of its range. Tests cover funded shares of 0 and 0.5.
**Status:** fixed: requires human verification (no default value changes, because the share is 1.0)

### WR-04: The funding check divides scenario-B agency cuts into a cost rise that happens at 2x output

**Files modified:** `site/js/workflows.js`, `site/js/data.js`, `site/index.html`, `test/workflows.test.js`, `test/engine-data.test.js`
**Commit:** 5d90bc0
**Applied fix:** Coverage now compares like with like. It uses the agency change at scenario A's volume, which is +$5,347,436, so nothing is released. The new coverage is 0.0x (it was 3.7x). The asm-reallocation basis now says agency spend does not fund the production cost rise at that volume.
**Status:** fixed: requires human verification

### WR-05: The reconciliation and ledger checks are vacuous

**Files modified:** `site/js/workflows.js`, `site/index.html`, `test/workflows.test.js`
**Commit:** cfd0608
**Applied fix:**
- New `economics().checks`: the hours the pools release, compared with the fall in total hours between today's state and the agent-enabled state of every workflow. These come from two independent code paths, and the check is tested at default inputs, at adoption 0.5 and with review overhead ×2.
- New `checkLedger` rule: a source line may be saved in only one scenario.
- The page lists the three destinations inside the identity separately from the two outside it. It explains why 60,446 hours is 39.0 people (different productive hours per role) and calls the check row zero by construction.
**Status:** fixed

### WR-06: The W5 per-workflow state is inconsistent with the reviewer bridge and the payroll

**Files modified:** `site/js/workflows.js`, `site/index.html`, `test/workflows.test.js`
**Commit:** 8c9c898
**Applied fix:**
- `reviewerState` now uses `fte = reviewer_fte_required` and `labour = fte × loaded`. The W5 labour delta now equals scenario B's 3.42 removable reviewers × $150,000, and this is tested.
- The per-unit table label is now "per generated variant".
- The table note gives the 12-person team (data-fig with chip) and explains that the gap to 12 is capacity already unused.
**Status:** fixed

### WR-07: The delegated portfolio is the four highest-reduction workflows; "pilot slice" names three scopes

**Files modified:** `site/js/workflows.js`, `site/js/data.js`, `site/js/model.js`, `site/index.html`, tests
**Commit:** 6102ce2
**Applied fix:**
- The page and the asm-portfolio-workflows basis now say the portfolio was chosen as the four workflows with the largest assumed hour reductions, so it is a best case.
- New engine input `asm-pilot-workflows` (W2, W4, W6) with validation. It gives the pilot-workflow metric: 1.70x after the whole platform team and 1.87x before it.
- Three names for three scopes throughout the page and in the calculator label: "pilot workflows", "delegated portfolio" and "content-production slice". A test forbids "pilot slice".
**Status:** fixed

### WR-08: The calculator scenario radios refer to a control that does not exist

**Files modified:** `site/index.html`, `test/calc-page.test.js`
**Commit:** d2ad691
**Applied fix:** The radios now read "Keep the team and deliver the 2x output." and "Demand doubles; …".
**Status:** fixed

### WR-09: Legacy share links restore differently from what the v1 author saw

**Files modified:** `site/js/state.js`, `site/js/fields.js`, `site/js/ui.js`, `site/index.html`, `scripts/smoke.mjs`, `test/fixtures/v1-share-links.json`, `test/share-links.test.js`, `test/state.test.js`
**Commits:** 769f416, 3fee865, 62b83c5
**Applied fix:**
- Links written by this edition always carry `scenario=`, so a link without it must be a first-edition link. Such links now open in A, the same as `scenario=redeploy`.
- `scenario=reduce` maps to B with a visible notice in the status line.
- A legacy link that sets `rework=` gets a notice that the baseline is no longer moved.
- The field is now labelled "Rework rate at 2x".
- The v1 fixture expectations were updated on purpose: links without a scenario now expect A. The smoke checks were updated to match.
**Status:** fixed: requires human verification. As a consequence, a v2 link created before this fix (none were published; the interim publish predates the A/B/C calculator) would open in A with no notice.

### WR-10: Calculator and portfolio scenarios with the same name follow different rules and sign conventions

**Files modified:** `site/js/model.js`, `site/js/data.js`, `site/index.html`, `test/model.test.js`
**Commit:** c05f8f1
**Applied fix:**
- Calculator B applies `min_removable_fte`, which is now passed in `modelContext().fixed`, and reports the rest as `fragmented_fte`.
- `first_year_net` uses the engine's sign, where positive is a saving. The row is relabelled "First-year net cash effect against today (negative: spend rises)".
**Status:** fixed: requires human verification

### WR-11: Printing the folds depends on the calculator module running

**Files modified:** `site/js/print.js` (new), `site/js/ui.js`, `site/index.html`, `site/assets/style.css`, `scripts/print.mjs`, tests
**Commit:** 62df328
**Applied fix:**
- The beforeprint/afterprint handler moved into `js/print.js`, a new module with no imports. It loads before ui.js.
- A print-only CSS rule, `details.maths::details-content { content-visibility: visible; display: block; }`, covers readers without JavaScript in browsers that support it.
- The print gate now loads the page a second time with `*js/ui.js` blocked (CDP `Network.setBlockedURLs`) and checks that all 7 folds and the evidence key still open. This passed.
**Status:** fixed

### WR-12: Several headline numbers carry no grade chip

**Files modified:** `site/index.html`
**Commit:** c8ff92c
**Applied fix:**
- The #economics portfolio sentence is now its own paragraph with its own chip, and the new pilot sentence also has a chip.
- On the first screen, 1.42x and 1.72x are in one sentence that shares one chip. That follows the one-chip-per-sentence rule and the test that forbids repeating a ref within a paragraph.
- The calculator table keeps its group note, which now links `asm-auto-approval`.
**Status:** fixed

### WR-13: The print-ceiling gate ratchets upward

**Files modified:** `scripts/print.mjs`
**Commit:** 883631d
**Applied fix:** The ceiling was re-set once to round(201 × 1.15) = 231, using the final measured count of 201 pages. A FROZEN comment says the ceiling must not be raised without recording the measured count and the reason in the plan SUMMARY. No per-section budget was added.
**Status:** fixed

### IN-01: The roll-up range is not adoption- or lever-adjusted

**Files modified:** `site/js/workflows.js`, `test/workflows.test.js` — **Commit:** 7b1cc04
**Applied fix:** `lo` and `hi` now go through `effective()`, and a test checks lo ≤ central ≤ hi at three adoption and lever settings.

### IN-02: Sampling and overhead are counted three or four times on the cost side

**Files modified:** `site/js/data.js`, `site/index.html` — **Commit:** 9c6753c
**Applied fix:** I chose to state the split rather than change the model, so no figure moves. The overhead-share basis and the sensitivity note list the four overlapping places this work is costed. They say costs are conservative and the review-overhead swing is an upper bound.

### IN-03: Some engine fields are not validated

**Files modified:** `site/js/workflows.js`, `site/js/data.js`, `test/workflows.test.js` — **Commit:** 60e910f
**Applied fix:**
- The agency switch must be a boolean.
- `chain` is validated: p is a share; steps, steps between gates and retries are whole numbers.
- `escape_rate` must be a share.
- The pilot list is validated.
- The evidence trace now steps the whole-number chain fields by one so that every moved row stays valid.

### IN-04: `sumLedger` cannot sum the real ledger

**Files modified:** `site/js/workflows.js`, `test/workflows.test.js` — **Commit:** d674b6f
**Applied fix:** `sumLedger(rows, scope, scenario)` filters by scenario and rejects mixing alternative scenarios. A test checks that B's ledger sum equals `scenarios.B.net`.

### IN-05: Wide tables inside folds are capped at 44em

**Files modified:** `site/assets/style.css`, `test/style.test.js` — **Commit:** 6a29b47
**Applied fix:** Added `details.maths:has(.table-scroll) { max-width: none; }`.

### IN-06: Inference cost is charged at full volume regardless of adoption

**Files modified:** `site/js/workflows.js`, `site/js/data.js` — **Commit:** 9c6753c
**Applied fix:** I documented the choice rather than change it, so no figure moves. A code comment and the asm-adoption-rate basis say inference and other run costs are charged in full whatever the adoption, as a conservative choice.

### IN-07: Two sources are graded Benchmark on a self-reported survey and an unreviewed working paper

**Files modified:** `site/js/data.js`, `site/index.html` — **Commit:** adebe31
**Applied fix:** The Gartner bias text now says "Analyst firm that sells research and advice to the CMOs it surveys; self-reported survey…". The NYU/Emory bias text says "Academic working paper on SSRN, not peer reviewed as published there".

## Notes for the developer

- **The CR-03 scope is engine rows only, as instructed.** First-edition model rows that are also unsourced hypotheses stay Modelled, for example `asm-auto-approval` (60% at 2x), `asm-variant-cost` and `asm-tooling`. A strict reading of the legend would make them Speculative too, and that would cascade into the calculator. They need an explicit decision before publish.
- **Most chips now link `asm-adoption-rate`.** That follows from measurement: adoption scales every programme effect and moves most economics figures most. It is accurate, but it is less specific than linking each workflow's effects row.
- **Several fixes change logic rather than wording** (CR-01, CR-02, WR-03, WR-04, WR-09, WR-10). Please confirm their semantics before the final publish.
- **The test runner can hang.** `node --test` (Node 23.7) sometimes hangs at 100% CPU after every child test file has finished, especially when its output is piped into `head`. Several orphaned runners from earlier sessions were found and killed. Run it with a timeout, or write its output to a file.
- **Not done here:** the W3C Nu validator run and the publish, as instructed.

## Appendix: every page figure whose value or grade changed (before → after)

Format: `display [grade ref]`. The table covers the 144 figures that are on the page before or after the fixes. Figures whose only change was the chip ref are not listed; the WR-01 and WR-02 tables above give those refs.

| Figure | Before | After |
|---|---|---|
| `asm-adoption-rate` | 100% [Modelled] | 100% [Speculative] |
| `asm-agency-scales` | No, held at baseline [Modelled] | Yes, grows with the output it supports [Modelled] |
| `asm-autonomous-share` | 60% [Modelled] | 60% [Speculative] |
| `asm-autonomy-overhead` | 24 h per workflow, 16 h calibration [Modelled] | 24 h per workflow, 16 h calibration [Speculative] |
| `asm-build-cost` | $1.5M [Modelled] | $1.5M [Speculative] |
| `asm-counterfactual-funded` | 100% [Modelled] | 100% [Speculative] |
| `asm-out-of-scope-uplift` | 10% [Modelled] | 10% [Speculative] |
| `asm-overhead-share` | L1 0%, L2 20%, L3 8%, L4 8% [Modelled] | L1 0%, L2 20%, L3 8%, L4 8% [Speculative] |
| `asm-pilot-workflows` | (not on page) | W2, W4, W6 [Modelled] |
| `asm-platform-team` | 6 FTE at $200,000 [Modelled] | 6 FTE at $200,000 [Speculative] |
| `asm-wf-w1-agent` | 40% net hours saved (25% to 55%), L2, 8 days [Modelled] | 40% net hours saved (25% to 55%), L2, 8 days [Speculative] |
| `asm-wf-w10-agent` | 40% net hours saved (25% to 55%), L3, 2 days [Modelled] | 40% net hours saved (25% to 55%), L3, 2 days [Speculative] |
| `asm-wf-w2-agent` | 50% net hours saved (30% to 65%), L3, 5 days [Modelled] | 50% net hours saved (30% to 65%), L3, 5 days [Speculative] |
| `asm-wf-w3-agent` | 35% net hours saved (20% to 50%), L2, 9 days [Modelled] | 35% net hours saved (20% to 50%), L2, 9 days [Speculative] |
| `asm-wf-w4-agent` | 55% net hours saved (40% to 70%), L3, 5 days [Modelled] | 55% net hours saved (40% to 70%), L3, 5 days [Speculative] |
| `asm-wf-w6-agent` | 60% net hours saved (40% to 75%), L3, 0.5 days [Modelled] | 60% net hours saved (40% to 75%), L3, 0.5 days [Speculative] |
| `asm-wf-w7-agent` | 40% net hours saved (25% to 55%), L2, 6 days [Modelled] | 40% net hours saved (25% to 55%), L2, 6 days [Speculative] |
| `asm-wf-w8-agent` | 30% net hours saved (20% to 45%), L2, 18 days [Modelled] | 30% net hours saved (20% to 45%), L2, 18 days [Speculative] |
| `asm-wf-w9-agent` | 50% net hours saved (35% to 65%), L3, 1 days [Modelled] | 50% net hours saved (35% to 65%), L3, 1 days [Speculative] |
| `asm-year1-realisation` | 50% [Modelled] | 50% [Speculative] |
| `calc-scen-c-first_year_net` | $1,295,199 [Modelled asm-change-mgmt] | −$1,295,199 [Modelled asm-change-mgmt] |
| `econ-inv-autonomy_overhead` | $240,000 [Modelled asm-autonomy-overhead] | $240,000 [Speculative asm-autonomy-overhead] |
| `econ-inv-build` | $1,500,000 [Modelled asm-build-cost] | $1,500,000 [Speculative asm-build-cost] |
| `econ-inv-inference` | $9,609 [Modelled asm-token-price-frontier] | $9,609 [Speculative asm-wf-w7-agent] |
| `econ-inv-platform_team` | $1,200,000 [Modelled asm-platform-team] | $1,200,000 [Speculative asm-platform-team] |
| `econ-max-W10` | 1.67x [Modelled asm-wf-w10-agent] | 1.67x [Speculative asm-wf-w10-agent] |
| `econ-max-W1` | 1.67x [Modelled asm-wf-w1-agent] | 1.67x [Speculative asm-wf-w1-agent] |
| `econ-max-W2` | 2.00x [Modelled asm-wf-w2-agent] | 2.00x [Speculative asm-wf-w2-agent] |
| `econ-max-W3` | 1.54x [Modelled asm-wf-w3-agent] | 1.54x [Speculative asm-wf-w3-agent] |
| `econ-max-W4` | 2.22x [Modelled asm-wf-w4-agent] | 2.22x [Speculative asm-wf-w4-agent] |
| `econ-max-W5` | 2.75x [Modelled asm-reviewer-fte] | 2.75x [Speculative asm-adoption-rate] |
| `econ-max-W6` | 2.50x [Modelled asm-wf-w6-agent] | 2.50x [Speculative asm-wf-w6-agent] |
| `econ-max-W7` | 1.67x [Modelled asm-wf-w7-agent] | 1.67x [Speculative asm-wf-w7-agent] |
| `econ-max-W9` | 2.00x [Modelled asm-wf-w9-agent] | 2.00x [Speculative asm-wf-w9-agent] |
| `econ-max-uniform-excl-traffic` | 1.54x [Modelled asm-traffic-growth] | 1.54x [Speculative asm-wf-w3-agent] |
| `econ-metric-org_after_platform` | 1.60x [Modelled asm-agency-fte-cost] | 1.42x [Speculative asm-adoption-rate] |
| `econ-metric-org_before_platform` | 1.65x [Modelled asm-agency-fte-cost] | 1.45x [Speculative asm-adoption-rate] |
| `econ-metric-pilot_after_platform` | (not on page) | 1.70x [Speculative asm-adoption-rate] |
| `econ-metric-pilot_before_platform` | (not on page) | 1.87x [Speculative asm-adoption-rate] |
| `econ-metric-pooled_hours_multiple` | 1.47x [Modelled asm-agency-fte-cost] | 1.47x [Speculative asm-adoption-rate] |
| `econ-metric-portfolio_after_platform` | 1.99x [Modelled asm-agency-fte-cost] | 1.72x [Speculative asm-adoption-rate] |
| `econ-metric-portfolio_before_platform` | 2.18x [Modelled asm-agency-fte-cost] | 1.86x [Speculative asm-adoption-rate] |
| `econ-recon-A-gap` | 0.0 [Modelled asm-adoption-rate] | 0.0 [Speculative asm-adoption-rate] |
| `econ-recon-A-hires` | 0.0 [Modelled asm-adoption-rate] | 0.0 [Speculative asm-adoption-rate] |
| `econ-recon-A-redeployed` | 39.7 [Modelled asm-adoption-rate] | 39.7 [Speculative asm-adoption-rate] |
| `econ-recon-A-removed` | 0.0 [Modelled asm-adoption-rate] | 0.0 [Speculative asm-adoption-rate] |
| `econ-recon-A-unused` | 3.5 [Modelled asm-adoption-rate] | 3.5 [Speculative asm-adoption-rate] |
| `econ-recon-B-gap` | 0.0 [Modelled asm-adoption-rate] | 0.0 [Speculative asm-adoption-rate] |
| `econ-recon-B-hires` | 0.0 [Modelled asm-adoption-rate] | 0.0 [Speculative asm-adoption-rate] |
| `econ-recon-B-redeployed` | 0.0 [Modelled asm-adoption-rate] | 0.0 [Speculative asm-adoption-rate] |
| `econ-recon-B-removed` | 39.0 [Modelled asm-adoption-rate] | 39.0 [Speculative asm-adoption-rate] |
| `econ-recon-B-unused` | 4.2 [Modelled asm-adoption-rate] | 4.2 [Speculative asm-adoption-rate] |
| `econ-recon-C-gap` | 0.0 [Modelled asm-adoption-rate] | 0.0 [Speculative asm-adoption-rate] |
| `econ-recon-C-hires` | 10.0 [Modelled asm-adoption-rate] | 10.0 [Speculative asm-adoption-rate] |
| `econ-recon-C-redeployed` | 46.0 [Modelled asm-adoption-rate] | 46.0 [Speculative asm-adoption-rate] |
| `econ-recon-C-removed` | 0.0 [Modelled asm-adoption-rate] | 0.0 [Speculative asm-adoption-rate] |
| `econ-recon-C-unused` | 7.3 [Modelled asm-adoption-rate] | 7.3 [Speculative asm-adoption-rate] |
| `econ-recon-released_hours` | 60,446 [Modelled asm-adoption-rate] | 60,446 [Speculative asm-adoption-rate] |
| `econ-recon-released` | 39.0 [Modelled asm-adoption-rate] | 39.0 [Speculative asm-adoption-rate] |
| `econ-scen-A-implied_agency_growth` | $5,347,436 [Modelled asm-adoption-rate] | $5,347,436 [Speculative asm-adoption-rate] |
| `econ-scen-A-net` | −$2,133,647 [Speculative asm-escape-rate] | −$7,481,083 [Speculative asm-adoption-rate] |
| `econ-scen-B-agency_saving` | $3,600,000 [Modelled asm-adoption-rate] | $3,600,000 [Speculative asm-adoption-rate] |
| `econ-scen-B-labour_saving` | $5,852,693 [Modelled asm-adoption-rate] | $5,852,693 [Speculative asm-adoption-rate] |
| `econ-scen-B-removable_fte` | 39.0 [Modelled asm-adoption-rate] | 39.0 [Speculative asm-adoption-rate] |
| `econ-scen-C-agency_avoided` | $7,200,000 [Modelled asm-adoption-rate] | $7,200,000 [Speculative asm-adoption-rate] |
| `econ-scen-C-avoided_cost` | $17,635,604 [Modelled asm-demand-multiplier] | $17,635,604 [Speculative asm-counterfactual-funded] |
| `econ-scen-C-avoided_hires` | 69.6 [Modelled asm-demand-multiplier] | 69.6 [Speculative asm-adoption-rate] |
| `econ-scen-C-hires_with` | 10.0 [Modelled asm-demand-multiplier] | 10.0 [Speculative asm-adoption-rate] |
| `econ-scen-C-net_avoided` | (not on page) | $15,523,156 [Speculative asm-counterfactual-funded] |
| `econ-scen-C-net` | $15,523,156 [Speculative asm-escape-rate] | −$11,912,448 [Speculative asm-adoption-rate] |
| `econ-scen-C-payback_avoided` | (not on page) | 0.1 years [Speculative asm-counterfactual-funded] |
| `econ-scen-C-payback` | 0.1 years [Speculative asm-escape-rate] | (not on page) |
| `econ-sens-adoption-low-org_A_after` | 1.19x [Modelled asm-adoption-rate] | 1.13x [Speculative asm-adoption-rate] |
| `econ-sens-escape-high-org_A_after` | 1.60x [Speculative asm-escape-rate] | 1.42x [Speculative asm-escape-rate] |
| `econ-sens-escape-low-org_A_after` | 1.60x [Speculative asm-escape-rate] | 1.42x [Speculative asm-escape-rate] |
| `econ-sens-inference-high-org_A_after` | 1.60x [Modelled asm-token-price-frontier] | 1.42x [Speculative asm-adoption-rate] |
| `econ-sens-inference-low-org_A_after` | 1.60x [Modelled asm-token-price-frontier] | 1.42x [Speculative asm-adoption-rate] |
| `econ-sens-review_overhead-high-org_A_after` | 1.37x [Modelled asm-sampling-rate] | 1.31x [Speculative asm-overhead-share] |
| `econ-sens-review_overhead-low-org_A_after` | 1.76x [Modelled asm-sampling-rate] | 1.46x [Speculative asm-overhead-share] |
| `econ-wf-W1-agent-autonomous_share` | 0% [Modelled asm-wf-w1-agent] | 0% [Speculative asm-wf-w1-agent] |
| `econ-wf-W1-agent-fte` | 3.0 [Modelled asm-wf-w1-agent] | 3.0 [Speculative asm-wf-w1-agent] |
| `econ-wf-W1-agent-total_hours` | 4,800 [Modelled asm-wf-w1-agent] | 4,800 [Speculative asm-wf-w1-agent] |
| `econ-wf-W10-agent-autonomous_share` | 60% [Modelled asm-wf-w10-agent] | 60% [Speculative asm-wf-w10-agent] |
| `econ-wf-W10-agent-fte` | 4.8 [Modelled asm-wf-w10-agent] | 4.8 [Speculative asm-wf-w10-agent] |
| `econ-wf-W10-agent-total_hours` | 7,680 [Modelled asm-wf-w10-agent] | 7,680 [Speculative asm-wf-w10-agent] |
| `econ-wf-W2-agent-agency_cost` | $500,000 [Modelled asm-wf-w2-agent] | $500,000 [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-ai_cost` | $812 [Modelled asm-wf-w2-agent] | $812 [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-autonomous_share` | 60% [Modelled asm-wf-w2-agent] | 60% [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-cost_per_unit` | $7,004 [Modelled asm-wf-w2-agent] | $7,004 [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-cycle_days` | 5.0 days [Modelled asm-wf-w2-agent] | 5.0 days [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-fte` | 6.0 [Modelled asm-wf-w2-agent] | 6.0 [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-hours_per_unit` | 48.0 [Modelled asm-wf-w2-agent] | 48.0 [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-labour_cost` | $900,000 [Modelled asm-wf-w2-agent] | $900,000 [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-review_hours` | 1,536 [Modelled asm-wf-w2-agent] | 1,536 [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-total_hours` | 9,600 [Modelled asm-wf-w2-agent] | 9,600 [Speculative asm-wf-w2-agent] |
| `econ-wf-W2-agent-units` | 200 [Modelled asm-wf-w2-agent] | 200 [Speculative asm-wf-w2-agent] |
| `econ-wf-W3-agent-autonomous_share` | 0% [Modelled asm-wf-w3-agent] | 0% [Speculative asm-wf-w3-agent] |
| `econ-wf-W3-agent-fte` | 14.3 [Modelled asm-wf-w3-agent] | 14.3 [Speculative asm-wf-w3-agent] |
| `econ-wf-W3-agent-total_hours` | 22,880 [Modelled asm-wf-w3-agent] | 22,880 [Speculative asm-wf-w3-agent] |
| `econ-wf-W4-agent-agency_cost` | $1,200,000 [Modelled asm-wf-w4-agent] | $1,200,000 [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-ai_cost` | $169 [Modelled asm-wf-w4-agent] | $169 [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-autonomous_share` | 60% [Modelled asm-wf-w4-agent] | 60% [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-cost_per_unit` | $9,376 [Modelled asm-wf-w4-agent] | $9,376 [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-cycle_days` | 5.0 days [Modelled asm-wf-w4-agent] | 5.0 days [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-fte` | 4.5 [Modelled asm-wf-w4-agent] | 4.5 [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-hours_per_unit` | 36.0 [Modelled asm-wf-w4-agent] | 36.0 [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-labour_cost` | $675,000 [Modelled asm-wf-w4-agent] | $675,000 [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-review_hours` | 1,280 [Modelled asm-wf-w4-agent] | 1,280 [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-total_hours` | 7,200 [Modelled asm-wf-w4-agent] | 7,200 [Speculative asm-wf-w4-agent] |
| `econ-wf-W4-agent-units` | 200 [Modelled asm-wf-w4-agent] | 200 [Speculative asm-wf-w4-agent] |
| `econ-wf-W5-agent-agency_cost` | $0 [Modelled asm-reviewer-fte] | $0 [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-ai_cost` | $0 [Modelled asm-reviewer-fte] | $0 [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-autonomous_share` | 57% [Modelled asm-reviewer-fte] | 57% [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-cost_per_unit` | $13 [Modelled asm-reviewer-fte] | $16 [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-cycle_days` | 5.5 days [Modelled asm-reviewer-fte] | 5.5 days [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-fte` | 3.7 [Modelled asm-reviewer-fte] | 4.4 [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-hours_per_unit` | 0.1 [Modelled asm-reviewer-fte] | 0.1 [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-labour_cost` | $556,842 [Modelled asm-reviewer-fte] | $655,108 [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-review_hours` | 581 [Modelled asm-reviewer-fte] | 581 [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-total_hours` | 4,455 [Modelled asm-reviewer-fte] | 4,455 [Speculative asm-adoption-rate] |
| `econ-wf-W5-agent-units` | 42,105 [Modelled asm-reviewer-fte] | 42,105 [Speculative asm-adoption-rate] |
| `econ-wf-W5-current-cost_per_unit` | $24 [Modelled asm-reviewer-fte] | $28 [Modelled asm-reviewer-fte] |
| `econ-wf-W5-current-fte` | 6.6 [Modelled asm-reviewer-fte] | 7.8 [Modelled asm-reviewer-fte] |
| `econ-wf-W5-current-labour_cost` | $992,632 [Modelled asm-reviewer-fte] | $1,167,802 [Modelled asm-reviewer-fte] |
| `econ-wf-W6-agent-agency_cost` | $900,000 [Modelled asm-wf-w6-agent] | $900,000 [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-ai_cost` | $1,071 [Modelled asm-wf-w6-agent] | $1,071 [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-autonomous_share` | 60% [Modelled asm-wf-w6-agent] | 60% [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-cost_per_unit` | $120 [Modelled asm-wf-w6-agent] | $120 [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-cycle_days` | 0.5 days [Modelled asm-wf-w6-agent] | 0.5 days [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-fte` | 3.6 [Modelled asm-wf-w6-agent] | 3.6 [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-hours_per_unit` | 0.5 [Modelled asm-wf-w6-agent] | 0.5 [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-labour_cost` | $540,000 [Modelled asm-wf-w6-agent] | $540,000 [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-review_hours` | 1,152 [Modelled asm-wf-w6-agent] | 1,152 [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-total_hours` | 5,760 [Modelled asm-wf-w6-agent] | 5,760 [Speculative asm-wf-w6-agent] |
| `econ-wf-W6-agent-units` | 12,000 [Modelled asm-wf-w6-agent] | 12,000 [Speculative asm-wf-w6-agent] |
| `econ-wf-W7-agent-autonomous_share` | 0% [Modelled asm-wf-w7-agent] | 0% [Speculative asm-wf-w7-agent] |
| `econ-wf-W7-agent-fte` | 2.4 [Modelled asm-wf-w7-agent] | 2.4 [Speculative asm-wf-w7-agent] |
| `econ-wf-W7-agent-total_hours` | 3,840 [Modelled asm-wf-w7-agent] | 3,840 [Speculative asm-wf-w7-agent] |
| `econ-wf-W8-agent-autonomous_share` | 0% [Modelled asm-wf-w8-agent] | 0% [Speculative asm-wf-w8-agent] |
| `econ-wf-W8-agent-fte` | 2.8 [Modelled asm-wf-w8-agent] | 2.8 [Speculative asm-wf-w8-agent] |
| `econ-wf-W8-agent-total_hours` | 4,480 [Modelled asm-wf-w8-agent] | 4,480 [Speculative asm-wf-w8-agent] |
| `econ-wf-W9-agent-autonomous_share` | 60% [Modelled asm-wf-w9-agent] | 60% [Speculative asm-wf-w9-agent] |
| `econ-wf-W9-agent-fte` | 3.0 [Modelled asm-wf-w9-agent] | 3.0 [Speculative asm-wf-w9-agent] |
| `econ-wf-W9-agent-total_hours` | 4,800 [Modelled asm-wf-w9-agent] | 4,800 [Speculative asm-wf-w9-agent] |

---

_Fixed: 2026-10-25_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
