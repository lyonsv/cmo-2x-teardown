---
phase: 07-content-presentation-publish
reviewed: 2026-10-25T00:00:00Z
depth: standard
scope: milestone v2.0 consolidated (git diff b515dcf HEAD -- site scripts test)
files_reviewed: 16
files_reviewed_list:
  - site/js/workflows.js
  - site/js/calc.js
  - site/js/model.js
  - site/js/data.js
  - site/js/state.js
  - site/js/ui.js
  - site/js/format.js
  - site/js/fields.js
  - site/index.html
  - site/assets/style.css
  - scripts/crosscheck.mjs
  - scripts/gen-register-rows.mjs
  - scripts/a11y.mjs
  - scripts/print.mjs
  - scripts/smoke.mjs
  - scripts/gates.sh
findings:
  critical: 5
  warning: 13
  info: 7
  total: 25
status: issues_found
---

# Phase 7 / Milestone v2.0: Code Review Report

**Reviewed:** 2026-10-25
**Depth:** standard. The engine was run at the defaults and at perturbed inputs to confirm each numeric claim below.
**Files Reviewed:** 16 source files, plus the test files skimmed for weakened guards
**Status:** issues_found

## Summary

`node --test` passes (608/608). Most of the arithmetic hangs together: the nine workflow rows reconcile exactly to 80 FTE at 1,600 hours, the W5 reviewer pool and the v1 slice share one compute(), and slice and portfolio scopes are not added together. The problems are in what the headline figures measure and how the page describes them.

1. **The headline 1.60x relies on agency budget the engine says it would need but does not count.** Scenario A holds agency spend flat. The engine itself estimates $5.35M of agency growth for the same output, and the metric ignores it. With that growth counted, the figure is about 1.42x (CR-01).
2. **The default scenario C shows avoided cost as "Annual net cash effect".** The table reports +$15.5M and a 0.1-year payback. Actual spend rises $11.9M against today (CR-02).
3. **The programme-effect hypotheses behind every headline are graded Modelled.** Under the page's own legend they are Speculative. Meanwhile the escape rate, which is minor and has the same basis, is graded Speculative, and 07-06 pointed the net-cash chips at it (CR-03, WR-01).
4. **Section 08 claims double-counting controls the engine does not implement.** These are "pools hours by role", "every hour has one price" and a check line that is zero by algebra (CR-04).
5. **The page still contains contradictory definitions of 2x.** These appear in the visible callout, the falsifier and the marketing-FTE register row (CR-05).

On 07-06 specifically: pointing Speculative figures at `asm-escape-rate` is technically true, because escape is a Speculative input those figures depend on. It is still misleading. The page's own sensitivity table shows escape moving scenario B's net by under 2%. The accompanying note also says B's net is Speculative "for severance", and that is false: severance is not in B's net. The chip rule is driving the content rather than the evidence (WR-01).

## Critical Issues

### CR-01: The headline output multiple excludes agency growth the engine says that output needs

**File:** `site/js/workflows.js:668-705` (buildMetric), `site/js/workflows.js:477-504` (scenarioA); `site/index.html:37`, `site/index.html:953`, `site/index.html:1881`
**Issue:** `metric.A.org_after_platform` (1.60x) and `portfolio_after_platform` (1.99x) grow each workflow's in-house output by `m_A` and keep the agency FTE-equivalents in the denominator at baseline (`D0 + pf`). The same engine reports `scenarios.A.agency.budget_binds` true for W2, W3, W4, W6 and W9. It also reports `implied_growth = $5,347,436`, which is 26.7 agency FTE-equivalents of spend needed to deliver those units. `buildMetric` never reads it, even when `agency_scales_with_output` is true; verified that the switch leaves 1.6003x unchanged. Counting the implied growth gives about 1.42x organisation-wide. The page's own reason for the denominator (line 103: "so that moving work to an agency cannot fake a gain") is broken in reverse: units that need agency input are counted while that input is held flat. The first screen presents the headline 1.60x with no caveat.
**Fix:** Charge the implied agency growth in the A denominator. Alternatively, cap `m_A` at the agency headroom `1/(1-s_eff)` where `budget_binds` is true, and state which you chose.
```js
// buildMetric, scenario A
const agencyGrowthEq = sc.A.agency.implied_growth / eq;           // always, not only when the switch is on
org_after_platform: ratio(IA / (D0 + pf + agencyGrowthEq), I0 / D0),
portfolio_after_platform: /* same with the portfolio's share of implied growth */
```
Then rebind every `econ-metric-*` figure, and add a sentence saying the headline includes the agency spend the extra output needs.

### CR-02: Scenario C (the default) shows avoided cost as "Annual net cash effect" and a 0.1-year cash payback

**File:** `site/index.html:1089`, `site/index.html:1091`; `site/js/data.js:1777`, `site/js/data.js:1784`; `site/js/workflows.js:600-611`
**Issue:** `scenarios.C.net` is `avoided_cost - run_cost`. That is savings against a counterfactual hiring plan (69.6 avoided FTE x $150k, plus $7.2M of avoided agency growth). It is not cash. The scenarios table puts $15,523,156 in the row "Annual net cash effect", and the claim unit in data.js is "net cash effect a year". The simple payback of 0.1 years is computed from the same avoided figure. The engine's own `versus_today` shows spend rising by $11,912,448, which the prose at line 1082 admits. A CFO reading the table row sees a positive cash figure that is really an avoided-cost figure. It also rests on `counterfactual_funded_share` = 100%, the most generous end of its range (data.js:1076).
**Fix:** Split the row. For C, show "Annual cash effect versus today" as `-versus_today` and "Annual cost avoided against the no-programme plan, net of run cost" as `net`. Rename the claim unit, and either drop the C payback or label it "payback against the no-programme plan". Consider defaulting `counterfactual_funded_share` below 1, or showing C at 50% as well.

### CR-03: The programme-effect hypotheses behind every headline are graded Modelled, contradicting the page's own legend

**File:** `site/js/data.js:1040-1047`, `site/js/data.js:1066-1071`, `site/js/data.js:1112-1117`; `site/index.html:56-61`
**Issue:** The legend says Speculative means "a judgement with no checkable source". The net hour reductions `r`, agency reductions `s`, `overhead_share`, `adoption`, `autonomous_share_l3`, `build_one_off` and `platform_team` are all evidence `hypothesis`. Their basis text says "no published benchmark" or "a hypothesis". Yet they carry grade `Modelled` (18 engine rows are Modelled/hypothesis). `asm-escape-rate` has the same basis ("an invented point") and is graded Speculative. The headline 1.60x/1.99x, the 39 removable FTE, the $5.85M labour saving and every per-workflow agent figure therefore show a Modelled chip, while being judgements no reader can check. This is the honesty constraint in CLAUDE.md ("every number is graded").
**Fix:** Grade every engine row whose evidence is `hypothesis` and has no `cites` as Speculative. Let the lazy grade getter (data.js:2042-2054) carry that through to the derived econ claims. Alternatively, rewrite the legend so Modelled explicitly covers uncited programme hypotheses, and apply it to the escape rate as well. Either way the two cases must be graded consistently.

### CR-04: Section 08 claims double-counting controls the engine does not implement

**File:** `site/index.html:1881-1882`; `site/js/workflows.js:237-243`, `303-317`, `394`, `714-731`
**Issue:** Each statement was checked against the code:
- "The engine pools hours by role, so one person's hour freed in two workflows is counted once." False. `buildPools` creates one pool per workflow id and sums them, with no deduplication by role or person.
- "Every hour has one price." False. Marketer hours are priced at $93.75 (loaded/1,600). Reviewer hours are $125 (loaded/1,200). Reviewer FTE removed in B is valued at loaded per 1,020 hours (1,200 x 0.85), about $147 an hour. Autonomy-overhead hours, which are marketer workflow-owner time, are priced at the reviewer rate (`overhead_rate`, line 394). For the same reason, line 1129's "60,446 hours ... which is 39.0 people" does not hold at any single rate: 60,446 / 1,600 = 37.8.
- "The check line reads zero in every scenario." True, but by construction. `bridgePool` defines `unused_remaining = F - reqP1*m - removed` and `redeployed = reqP1*m - reqP1`, so `slack0 + E - (redeployed + removed + unused_remaining)` is algebraically zero. `buildReconciliation` only adds `max(0,-x) - max(0,x) + x = 0`. It cannot detect an error.
- "splits them into redeployed, removed, unused and avoided". The table note at line 1148 says avoided sits outside the identity.
- Line 1881, "pooled human hours across all workflows rise by 1.47x". `pooled_hours_multiple` is a capacity multiple, `base/(base - released)`. Human hours fall; they do not rise.
**Fix:** Rewrite line 1882 to describe what the engine actually does: per-workflow pools that are disjoint by construction, two hourly prices with their derivation, and a reconciliation that is an accounting identity rather than an independent check. Fix line 1881 to "the capacity multiple from pooling the released hours is 1.47x". Either price autonomy overhead at the marketer rate, or document why it uses the reviewer rate.

### CR-05: Contradictory definitions of 2x remain visible on the page

**File:** `site/index.html:37`, `103`, `198`, `203`, `1250`, `3539`
**Issue:** Line 103 sets the primary metric as "useful work completed per marketing FTE-equivalent". Outside any first-edition fold, three places contradict it:
- The callout at line 198 says "It means twice as many campaign-markets launched per quarter, within a flat total marketing budget and flat headcount".
- The falsifier at lines 37 and 203, including the first screen, is keyed to campaign-markets doubling.
- The `asm-marketing-fte` register row (3539) and the calculator hint (1250) say "The headline has no per-head denominator: marketing FTE feeds only the one-off change cost". Marketing FTE is now the core of `D0`, the denominator of the primary metric.

The brief requires an explicit, defensible choice of metric. The page currently states two.
**Fix:** Move the line 198 callout inside the first-edition `<details>` or reword it against useful work per FTE-equivalent. Restate the falsifier in the primary metric's terms, keeping holdout-measured CAC and conversion as outcome guardrails. Correct the register basis text and the hint so they say marketing FTE is the denominator of the primary metric.

## Warnings

### WR-01: The 07-06 repoint of Speculative chips to `asm-escape-rate` misleads, and the explanatory note is factually wrong

**File:** `site/js/data.js:1765-1784`, `site/js/data.js:1837`; `site/index.html:1079`, `1082`, `1089-1092`, `1097`, `1103`, `1107`, `1172`, `1179-1185`, `1189`
**Issue:** The traced grade (Speculative) is correct under the weakest-input rule. But the chip sends readers to an input that the page's own sensitivity table shows moves scenario B's net by under 2% ($7.31M to $7.49M). The inputs that really drive the A, B and C nets are the programme effects (CR-03), `demand_multiplier` and `counterfactual_funded_share`, and none of them is linked. The table notes at 1107 and 1189 say nets are Speculative "because they depend on the escape rate and severance" ("for B, severance"). Severance is not in `scenarios.B.net` (`net = gross - run_cost.total`, workflows.js:538-539); it enters only `one_off` and payback. A net equal to minus the run cost (A) is labelled Speculative because 7% of it is escape cost.
**Fix:** After CR-03, link each net figure to its dominant Speculative driver: adoption or the programme-effect row for B, `asm-counterfactual-funded` or `asm-demand-multiplier` for C, and `asm-platform-team` for A. Relax the one-chip-per-row test where a row truly has two drivers. Remove "and severance" from 1107 and 1189, or restrict it to payback and one-off.

### WR-02: Other chips point at register rows unrelated to the figure

**File:** `site/js/data.js:1813`, `1826`, `1829`; `site/index.html:37`, `954`, `1184`, `1418`
**Issue:**
- Every `econ-metric-*` claim refs `asm-agency-fte-cost`, including "largest multiple every workflow can carry, 1.00x" (954), which is bound by traffic, not agency cost.
- `econ-max-uniform-excl-traffic` (1.54x) refs `asm-traffic-growth`, but its binding pool is W3 creative production.
- The review-overhead sensitivity of the organisation-wide multiple refs `asm-sampling-rate`. Sampling acts only on W5, which is excluded from the multiple's numerator; the multiple moves through `asm-overhead-share`.
- The calculator scenario C avoided-hires figure (1418) refs `asm-markets`.
**Fix:** Use the binding or dominant input as the ref: `asm-wf-<binding>-agent` or `asm-overhead-share` for metric and max claims, `asm-wf-w3-agent` for the excluding-traffic figure, `asm-overhead-share` for the review-overhead sensitivity, and `asm-reviewer-fte` or `asm-auto-approval` for the reviewer hires.

### WR-03: The counterfactual funded share applies to avoided hires but not to avoided agency growth

**File:** `site/js/workflows.js:600`, `site/js/workflows.js:651-656`
**Issue:** `avoided_cost = avoided * loaded * counterfactual_funded_share + (agencyWithout - agencyWith)`. If the no-programme plan was unfunded, its agency growth was equally unfunded, yet it is always counted in full. With the share at 0, the engine still reports C net = +$5.09M and avoided cost = $7.2M (verified).
**Fix:** Multiply the agency term (and the `C-agency-*` ledger rows) by `counterfactual_funded_share`, or add a separate funded share for agency and register it.

### WR-04: The funding check divides scenario-B agency cuts into a cost rise that happens at 2x output

**File:** `site/js/workflows.js:615-625`; `site/js/data.js:1151-1153`
**Issue:** `coverage = (Σ agency*s_eff - netted) / slice_cash_rise` = 3.7x. The numerator is the same-output agency saving (scenario B). The denominator is the cash rise at 2x volume, which is scenario A territory, where the engine says agency spend must rise by $5.35M. `asm-reallocation` tells readers that "the economics engine ... tests how far the reducible part covers the rise". That test mixes two scenarios that cannot both hold.
**Fix:** Compute coverage at the 2x volume: `(agency reduction at m) - implied_growth - netted`. Alternatively, remove the sentence from the `asm-reallocation` basis until the check is meaningful.

### WR-05: The reconciliation and ledger checks are vacuous, so the tests that rely on them cannot catch double counting

**File:** `site/js/workflows.js:237-243`, `413-445`, `714-731`; `site/index.html:1129`, `1144`, `1148`
**Issue:** The INV-1 gap is an algebraic identity (see CR-04). `checkLedger` bounds each labour saving by `B.bridge[id].F * loaded` (the whole pool) and each agency saving by the whole agency line, and `r_eff < 1` already guarantees both. No check spans lines: for example W5 reviewer removal against autonomy-overhead hours, or B agency savings reused in `buildFunding`. The page then presents the zero check row as proof that "nothing is counted twice or lost" (1129). Line 1129 also lists five destinations, including avoided hires and external spend, while the note at 1148 says those two sit outside the identity.
**Fix:** Present the check as an identity, not a test. Add a real cross-check, for example `Σ released hours (pools) == Σ (current.total_hours - agent.total_hours)` from `buildWorkflows` plus W5, and a ledger rule that each source line appears in at most one scenario's saving. Fix 1129 to list the three in-identity destinations and the two outside it separately.

### WR-06: The W5 per-workflow state is inconsistent with the reviewer bridge and the payroll

**File:** `site/js/workflows.js:193-216`, `314`; `site/index.html:921`, `1031-1032`, `1047-1048`
**Issue:**
- `reviewerState.fte = total_hours / 1200` gives 6.6 today. The bridge's `required_baseline` (at 85% utilisation) is 7.8, and the team is 12.
- Labour cost today shows $992,632, while 12 reviewers cost $1.8M.
- Scenario B values the 3.42 removable reviewers at loaded per 1,020 hours, while the W5 row's labour delta is $435,789.
- The stage table labels W5 "per variant reviewed", but `hours_per_unit` is per generated variant (units = 42,105 generated). Per reviewed variant it is about 0.23 hours.

The same pool therefore has three FTE numbers and two costs.
**Fix:** Use `reviewer_fte_required` for `fte`, and price labour as `required_fte * loaded`, so the row matches the bridge and scenario B. Add a "headcount today: 12" note. Relabel 921 as "per generated variant".

### WR-07: The delegated portfolio is the four highest-reduction workflows, and "pilot slice" names three different scopes

**File:** `site/js/data.js:1082`; `site/index.html:37`, `953`, `1000`, `1021`, `1385`; `site/js/model.js:222-227`
**Issue:**
- The portfolio W2, W4, W6, W9 is exactly the four rows with the highest `r` (0.50, 0.55, 0.60, 0.50), which is what produces 1.99x (about 2x). The page does not disclose the selection rule.
- Section 05 says the pilot slice is W4, W6, W2 and W5 (line 1000), so W9 is in the portfolio but not the pilot, and W5 is in the pilot but excluded from the metric.
- The calculator note (1385) and model.js call the v1 content factory "the pilot slice".
**Fix:** State how the portfolio was chosen, and show the metric for the pilot workflows (W2, W4, W6) too. Use three distinct names: "pilot workflows", "delegated portfolio" and "content-production slice (calculator)".

### WR-08: The calculator scenario radios refer to a control that does not exist

**File:** `site/index.html:1303-1305`; `site/js/fields.js:11-24`
**Issue:** "Keep the team and deliver the multiple you set above" and "Demand grows to the multiple you set". `FIELDS` has no multiplier, so it is fixed at 2.
**Fix:** Say "the 2x output" and "demand doubles", or add a `multiplier` field with coercion and hash support.

### WR-09: Legacy share links restore differently from what the v1 author saw

**File:** `site/js/state.js:89-95`; `site/js/model.js:230`, `site/js/model.js:64`; `test/share-links.test.js:26-34`
**Issue:**
- A v1 link with no `scenario=` (meaning v1's default, redeploy) opens C, while an explicit `scenario=redeploy` opens A. The same v1 state restores two ways.
- `reduce` (v1: 2x output with reviewers cut to need) maps to `b` (today's output). That is a different scenario, and no notice is given.
- The v1 `rework` input applied to both sides. It now changes only the 2x side (`toCompute`), so recorded `rework=` links silently produce different numbers. The field is still labelled "Rework rate", not "Rework rate at 2x".
**Fix:** When `restored` is true and the hash has no `scenario`, map the scenario to `a` (v1 default semantics) or push a notice. Map `reduce` with a notice ("v1 Reduce has no exact equivalent; showing B"). Relabel the field "Rework rate at 2x", and when a legacy link carries `rework`, notify that the baseline is no longer moved.

### WR-10: Calculator and portfolio scenarios with the same name follow different rules and sign conventions

**File:** `site/js/model.js:241-268`; `site/index.html:1089`, `1414`
**Issue:**
- Calculator B counts any `removable_same_output > 0` (for example 0.4 FTE) as a saving. The engine's B drops pools under `min_removable_fte` (1.0) as fragmented.
- The calculator's `first_year_net` is positive for a cost ($1,295,199 for C). The portfolio `net` is positive for a saving ($15.5M for C). Both are "scenario C", so a reader sees opposite signs.
**Fix:** Apply `min_removable_fte` in `scenarioOutcomes`. Label the calculator row "First-year cost increase versus today", or flip its sign to match the portfolio.

### WR-11: Printing the folds depends on the calculator module running

**File:** `site/js/ui.js:286-289`, `site/js/ui.js:18-30`; `scripts/print.mjs:46-48`; `site/assets/style.css:285-334`
**Issue:** All seven `details.maths` folds, including the evidence key (index.html:67) and the full workflow inventory, open for print only through ui.js's `beforeprint` handler. ui.js does unguarded top-level DOM lookups (for example `document.querySelector('[aria-label="Sensitivity"]').nextElementSibling`), so any markup drift that throws aborts the module before the handler registers. A no-JS reader also prints with every fold closed. print.mjs dispatches `beforeprint` itself, so the gate cannot detect either failure. 07-09 flagged the evidence-key print gap; it is covered only on this happy path.
**Fix:** Move the print handler into its own tiny module (`print.js`) loaded independently of the calculator. Add a print-gate run with ui.js blocked to confirm the folds still open.

### WR-12: Several headline numbers carry no grade chip

**File:** `site/index.html:37`, `site/index.html:953`, `site/index.html:1386-1412`
**Issue:**
- On the first screen, 1.99x has no chip.
- At line 953, 1.65x, 1.99x and 2.18x share no chip.
- The calculator scenario table rows have no chip; one note chip pointing at `asm-markets` covers them.

CLAUDE.md requires every number to be graded.
**Fix:** Add a chip after each figure, or one per sentence bound to the figure's own traced grade and ref.

### WR-13: The print-ceiling gate ratchets upward and no longer guards anything

**File:** `scripts/print.mjs:10-16`
**Issue:** The ceiling was reset to round(measured x 1.15) four times in this milestone (131 → 158 → 193 → 224) whenever content grew. The 07-09 measurement also found a 281-page regression from print widths, which was fixed this time, but the ratchet would have absorbed it on the next raise. The gate only catches a jump of more than 15% within a single plan.
**Fix:** Freeze the ceiling for the final publish, and require a written justification in the summary for any future raise. Better, add a per-section page budget, or a check that no table exceeds N pages.

## Info

### IN-01: The roll-up range is not adoption- or lever-adjusted

**File:** `site/js/workflows.js:319-334`
**Issue:** `released` uses `r_eff`, which scales with adoption and overhead, but `lo` and `hi` use the raw `w.lo` and `w.hi`. At adoption 0.5 the central multiple (1.29) falls below `multiple_lo` (1.40). It is not on the page today, but the API is exported.
**Fix:** Apply `effective()` to `lo` and `hi` as well.

### IN-02: Sampling and overhead are counted three or four times on the cost side

**File:** `site/js/workflows.js:45-48`, `site/js/workflows.js:387-411`; `site/js/data.js:1041-1043`, `1068-1071`
**Issue:** Sampling and evaluation work appears in `overhead_share` (inside `r`), in `autonomy_overhead_hours` ("evaluation curation and sampling"), in the platform team's evaluation curator, and in W5 `sampling_rate`. This is conservative, but the `review_overhead` lever scales all of them at once, which overstates its sensitivity rank.
**Fix:** State the split, or drop sampling from `autonomy_overhead_hours`.

### IN-03: Some engine fields are not validated

**File:** `site/js/workflows.js:52-58`, `site/js/workflows.js:79-96`
**Issue:** `agency_scales_with_output` (boolean) and `chain` are not validated. `escape_rate` accepts values above 1.
**Fix:** Add `typeof === 'boolean'` and `isShare` checks.

### IN-04: `sumLedger` cannot sum the real ledger

**File:** `site/js/workflows.js:447-463`
**Issue:** The production ledger mixes `slice` and `portfolio` rows, so `sumLedger(out.ledger)` always fails. It also does not filter by scenario, so summing the portfolio rows adds A, B and C together.
**Fix:** Add a `scenario` parameter, or delete the function if it is unused outside tests.

### IN-05: Wide tables inside folds are capped at 44em

**File:** `site/assets/style.css:251`; `site/index.html:978-998`
**Issue:** `details.maths { max-width: 44em }` constrains the nine-column inventory table and the other wide tables inside folds. On screen they need a long sideways scroll, and in print they are squeezed.
**Fix:** Use `details.maths:has(.table-scroll) { max-width: none; }` or a modifier class.

### IN-06: Inference cost is charged at full volume regardless of adoption

**File:** `site/js/workflows.js:186`, `site/js/workflows.js:396`
**Issue:** At adoption 0.5 every unit still pays agent inference. This is conservative and small, but inconsistent with how `r_eff` and `s_eff` scale.
**Fix:** Multiply by `a`, or document the choice.

### IN-07: Two sources are graded Benchmark on a self-reported survey and an unreviewed working paper

**File:** `site/js/data.js` (sources `gartner-2025-cmo-spend`, `gartner-2026-cmo-spend`, `nyu-emory-ai-ads-2025`)
**Issue:** Gartner's figures are a self-reported survey from a research seller, and the NYU/Emory paper is an SSRN working paper. Both are acceptable, but the register row should say "self-reported survey" and "not peer reviewed".
**Fix:** Add those words to the bias text.

---

_Reviewed: 2026-10-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
