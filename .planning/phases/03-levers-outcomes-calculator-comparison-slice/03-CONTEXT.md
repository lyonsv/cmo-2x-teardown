# Phase 3: Levers, Outcomes, Calculator & Comparison Slice - Context

**Gathered:** 2026-10-24
**Status:** Ready for planning
**Mode:** Smart discuss, recommended answers auto-accepted by the orchestrator. The user was away and had said "keep going and approve everything until done"; every choice below is the recommended option and can be revisited.

<domain>
## Phase Boundary

A reader can see the five other levers and the outcome case, run their own numbers through the calculator, and see fairly how the approach compares to Gradial, AirOps and Profound.

Delivers sections 09 (other five levers), 10 (outcome case), 11 (calculator), 12 (How this compares) in full, replacing their skeletons. Requirements: LEVER-01..05, OUTC-01..02, CALC-01..07, COMP-01..05.

</domain>

<decisions>
## Implementation Decisions

### Levers (s09)
- Five blocks: localisation/transcreation, experimentation, insight and reporting, ops (briefs, approvals, DAM metadata, rights tracking), AEO/GEO. Each ~250–450 words with a mini table: output metric, outcome metric, evidence grade. The s01 six-lever table remains the summary.
- Experimentation: win-rate maths with the ~12–36% range shown as differing definitions (each source flagged and graded honestly; vendor-biased sources flagged), bounded by traffic (no claim that more tests always means more wins).
- Ops: statutory-damages illustration from 17 U.S.C. 504(c) — the statute's ranges are Benchmark (primary law), the incident rate is Speculative and reader-facing as an assumption.
- AEO/GEO: output = answer assets published/refreshed per head; outcomes = citation share, AI-referred sessions, pipeline; evidence thin and vendor-only → Speculative or vendor-claimed; citation loss feeds refresh briefs back into the factory (one sentence linking to s03).
- Insight & reporting: kept brief, Modelled where evidence is a gap.

### Outcome case (s10)
- Scorecard table pairing each lever's output metric with outcome families: revenue/pipeline, speed to market, quality and brand, learning velocity. No invented lift numbers; outcomes graded Modelled/Speculative.
- "How lift would be proven" block: holdouts, pre-registered metrics, multiple-comparison correction, MMM calibrated by incrementality tests; negative phrasing "we did not find" where evidence is absent.

### Calculator (s11)
- Vanilla ES modules: `site/js/ui.js` (DOM binding) + `site/js/svg.js` (~60-line live chart helper) importing the existing pure `calc.js` and `data.js`. Add a DOM-free `site/js/state.js` (parse/serialize URL hash, coerce/validate inputs) so hash and validation logic are unit-tested with node:test.
- CSP updated to add `script-src 'self'` (no inline scripts, no CDN). The page must remain fully readable with JS off: the calculator section shows the default scenario statically (server-rendered numbers already tested against data.js) with a short note that the interactive version needs JavaScript. Update the "no script" test to "only same-origin module scripts, no inline script".
- Inputs (labelled, with units and grade chips): campaigns per year, variants per campaign (or concepts × variants per concept), marketing FTE, reviewer FTE, minutes per review, variant generation cost, auto-approval share (baseline and 2x), approval yield, rework rate, locales. Defaults = current data.js defaults.
- Outputs (`<output aria-live="polite">`): baseline vs 2x approved-live variants per head per quarter, fully loaded cost per approved-live asset, total cost and budget share, AI spend, cycle time, review utilisation, break-even auto-approval at flat review headcount (CALC-03), capacity floor.
- "Show the maths" (`<details>` with the formula steps and the reader's numbers), "What you must believe" panel listing the assumptions the result depends on, and each output's grade = weakest grade among its inputs (CALC-02).
- Headcount scenarios redeploy / hold / reduce with a change-management cost assumption (Modelled) (CALC-04).
- Sensitivity table: ±20% on the five most influential inputs, effect on cost per approved-live asset and utilisation, as a table (CALC-05).
- URL hash restores all inputs (CALC-06); no localStorage/cookies.
- Validation: invalid/zero/empty inputs show a field-named message, never NaN/Infinity (CALC-07), reusing compute()'s validation errors and `undefined_ratios`.
- Live chart: baseline vs 2x bars via svg.js, plus a data table equivalent.

### Comparison (s12)
- The only section that names vendors (plus the source register). Matrix rows: six levers, >10k variants, imagery/rights, review/gate/eval, brand governance, measurement, AEO/GEO, build vs buy, lock-in; columns Gradial, AirOps, Profound, CMO 2x spine.
- Per vendor: where it slots in, where it is an alternative, where it falls short — phrased "not publicly documented" rather than "does not exist".
- Every vendor fact sourced to a primary page with URL and access date; vendor outcomes flagged vendor-claimed, never averaged, never Benchmark. Competitor-authored reviews used for limitations only, flagged.
- Omit or mark LOW the items research flagged as conflicting (Gradial valuation/funding, AirOps pricing, Profound Series D detail, Gradial CMS/DAM list — no AEM claim unless the primary page states it).
- Category-level build-vs-buy and lock-in guidance: own the eval set and the brand rules.
- Explicit admission that the CMO 2x spine is a design, not a shipped product.
- Plan research re-fetches each vendor's primary pages (WebFetch/curl) and records access dates; if a page cannot be fetched, the claim is omitted or graded down — no human-verify checkpoint is assumed available.

### Delivery
- Same push pattern: local commits, one mid-phase local-preview checkpoint, one push at the end. While the user is away, the orchestrator auto-approves preview and push checkpoints after automated gates pass and records "auto-approved (user away)" in the SUMMARY.
- Chip density rule from Phase 2 continues; data-fig drift tests stay strict; every new number in data.js with a register row.

### Claude's Discretion
- Exact prose, table wording, chart geometry, which five inputs lead the sensitivity table (by measured influence), calculator layout within UI-SPEC tokens.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/js/calc.js`: `compute(inputs, assumptions)` (validation errors with field names, `undefined_ratios`, `human_touch_share`, break-even with cap, `capacity_auto_approval`, `deltas`), `variantMatrix()`.
- `site/js/data.js`: sources (with grade/flag), assumptions, claims (incl. `override` scenario claims), `formatValue` kinds.
- Tests: page/data/calc/figure/diagram/style suites (170 tests); governing-chip rule; numeric gate with pre-strip; VENDOR_RE outside s12/s15; register field-by-field checks.

### Established Patterns
- TDD per plan; SVG with title/desc + visible text equivalent; CSP `default-src 'none'; style-src 'self'` (Phase 3 adds `script-src 'self'`).

### Integration Points
- s09–s12 skeletons exist; s15 registers get new sources/assumptions.
- Pages deploy gated on `node --test`.

</code_context>

<specifics>
## Specific Ideas

- Calculator is the CFO's tool: lead with "your numbers", show the maths, and say plainly which assumptions carry the result.

</specifics>

<deferred>
## Deferred Ideas

- Downloadable CFO one-pager (V2-04).
- Imagery cost comparison (V2-02).

</deferred>

## Post-research decisions (2026-10-24, orchestrator accepting 03-RESEARCH recommendations; user away)

- Experimentation win-rate range becomes ~10–33% by definition (Optimizely 12% vendor-claimed; Microsoft ~1/3 company-reported via Kohavi et al. KDD 2013; Google ~10% second-hand in the same paper). DRIP 36.3% dropped (no primary source). ROADMAP's "12–36%" wording is superseded by the sourced range.
- Vendor matrix uses the corrected facts: Gradial documents per-task-type oversight (full review / spot-check / auto-approve); what is "not publicly documented" is a risk-class tier gate and a human-decision-calibrated eval harness. Gradial CMS/DAM list may name AEM etc. with citation. AirOps Human Review "listed on all three plans" (MEDIUM). Omit all funding figures from s12.
- AEO/GEO graded Speculative with "we did not find…" phrasing, citing the independent traffic studies found; SparkToro/Gumshoe omitted.
- 17 U.S.C. 504(c) ranges Benchmark (Cornell LII); page must not multiply damages by variant count (derivatives = one work); §412 registration precondition noted.
- Localisation 9.26–59.74% (Läubli et al. 2019) graded Modelled with scope caveats.
- Calculator: locales folded into variants per concept (8 formats × 5 locales); headcount scenarios via a new pure `scenarioOutcomes()` with Modelled $150k loaded FTE cost and $3k change cost per affected FTE; sensitivity and "what you must believe" ranked by measured influence (locales, master concept cost, 2x auto-approval, review minutes, yield…); perturbations clamped to valid ranges; add cost per master concept as an input.
- Module split: pure `fields.js` → `model.js` → `state.js` (model.js does not import data.js); `ui.js` thin, `textContent` only; headless-Chrome JS-on smoke check as an automated gate (no human needed).
- Non-s12 prose anonymises vendor/company names (VENDOR_RE); names appear only in s12 and register rows.
