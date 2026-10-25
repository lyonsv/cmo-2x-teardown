# Phase 6: Economics Engine - Context

**Gathered:** 2026-10-25
**Status:** Ready for planning
**Mode:** Smart discuss, recommendations auto-accepted (author away; standing instruction to use best judgement). Sources: `.planning/v2.0-BRIEF.md` s3, s7; `.planning/research/FEATURES.md` s4–s8 (workflow inventory, defaults, do-not-double-count register); `.planning/research/PITFALLS.md` s1 (model audit, D1–D6, INV-1–INV-11); SUMMARY.md "Decisions Taken".

<domain>
## Phase Boundary

Engine and data only: pure, tested modules that produce every labour and financial figure later phases will put on the page. No new page sections or presentation (Phases 8–9). Existing page figures must stay consistent with the engine: where an engine correction changes a v1 number already on the page, update the page text/claims in the same commit so crosscheck stays green, and record the before/after in the SUMMARY.

</domain>

<decisions>
## Implementation Decisions

### Module layout
- Keep `site/js/calc.js` as the engine entry point. Add a pure, DOM-free module `site/js/workflows.js` (per-workflow model, capacity bridge, scenarios, investment, sensitivity, primary metric) and re-export its public functions from `calc.js`. Inputs and defaults live in `data.js` (as `assumptions` with grade + evidence), never inside the engine.
- The v1 content-factory model (`compute()`) stays and is corrected, not replaced: it remains the detailed model of the pilot slice (W2 planning/ops, W4 adaptation/localisation, W5 review, W6 publishing) and the calculator's backbone.

### Workflow model (ECON-01)
- W1–W10 with the FEATURES.md s4 defaults (FTE, units/yr, baseline hours/unit, agency $, default net hour reduction and range). 92 in-scope FTE; 28 out-of-scope FTE get an assistance-level uplift (default 10%, range 0–15%) and are otherwise untouched.
- Productive hours: 1,600 per marketer FTE per year (illustrative); reviewers keep v1's 1,200-hour fatigue cap.
- Per workflow and state (current, agent-enabled): annual workload (units), human hours per unit, review and exception hours (agent-created human work: default 20% of baseline hours at L2, 8% at L3, illustrative), total human hours, productive FTE, labour cost, agency/vendor cost, AI and software cost (inference + licences per unit), cost per equivalent output, cycle time (days, illustrative per workflow), autonomous share (share of units completed with no human touch beyond sampling).
- Autonomy level per workflow at 12 months (L1–L4) per FEATURES s4.
- W5 review uses the v1 reviewer model (not a flat % reduction): per-variant hours fall, total hours can rise with volume.
- W8 experimentation is traffic-capped: its capacity multiple cannot exceed a traffic constraint input (default 1.0x traffic growth → tests capped at baseline power).

### Pricing and double counting (ECON-04, ECON-05)
- One price per hour: hourly cost = fully loaded annual cost per FTE ÷ productive hours for that role (marketer $150k/1,600h; reviewer $150k/1,200h). Remove the $100/h vs $125/h split (D1/D2).
- Cash view is primary for CFO outputs: payroll by FTE, external spend by line (agency, vendor, AI/software, media excluded). Activity-cost views (cost per approved asset etc.) are labelled as such and never summed with cash lines.
- Master-concept cost split into internal hours (default 40 h at the marketer rate, illustrative) plus an agency fee (default $1,200, illustrative) — record which v1 figures move.
- Savings ledger: every saving carries `counted_in` (labour | agency | vendor | ai) and the tests forbid the same dollars in two lines and any saving larger than its source line (INV-1–INV-11 from PITFALLS.md, written as tests with hand-calculated goldens from the PITFALLS 1.1 table).
- Paid media is never a saving.
- The $1.03M "funded from agency fees" story (D3) is corrected to whatever the engine actually supports.

### Capacity bridge and reconciliation (ECON-02, ECON-03)
- Released hours reconcile exactly (conservation test) into: hours eliminated from existing workload; capacity redeployed into additional work; avoided future hires; reducible external spend (agency/vendor, in $ not hours); genuinely removable headcount; capacity already unused at baseline (slack). Baseline slack is reported separately and never attributed to the programme (INV-4).
- Reviewer bridge at defaults should reproduce PITFALLS figures: 4.21 FTE slack today; +0.95 FTE programme-added review load at 2x; 6.84 FTE review work avoided at 2x (3.57 avoided hires + 3.27 unused); 3.42 FTE removable at same output. If an engine correction changes these, the new values are authoritative and the SUMMARY explains the delta.

### Scenarios (ECON-07)
- A "same team, more output": headcount and agency budget fixed; output = what released capacity absorbs, bounded by the binding role.
- B "same output, lower cost": output fixed at baseline; removable FTE and reducible agency spend realised with an adoption lag (year-1 realisation default 50%, illustrative).
- C "growing demand, limited hiring" (default): demand multiplier on in-scope work (default 2.0, editable); output the hires and agency spend needed with vs without the programme.
- Legacy calculator modes map: redeploy→A, hold→B, reduce→B with headcount cut (mapping implemented in Phase 9; engine exposes A/B/C).

### Primary metric (ECON-08)
- Useful work index = Σ completed units × frozen baseline standard hours per unit (only objective-linked, approved, live/delivered units count). Denominator = in-house marketing FTE + agency FTE-equivalents (agency fees ÷ blended agency cost per FTE-equivalent, default $200k, illustrative). Report org-wide and for the delegated portfolio (W2, W4, W6, W9), plus the per-workflow multiple. The engine must report honestly whatever the defaults give (research expects ~1.4–1.5x org-wide, ~1.8x portfolio).

### Investment, sensitivity, limits (ECON-09, ECON-10, ECON-11)
- Investment: one-off build/integration (default $1.5M, illustrative), platform team run cost (default 6 FTE × $200k, illustrative), inference cost (per agent-run unit: steps × tokens × price × retries incl. judge calls; default per-unit costs illustrative, tokens price editable), autonomy review overhead (eval curation, sampling, judge calibration hours), escape cost (unseen auto-approved volume × escape rate × cost per escape, hypothesis). Severance/change cost on a separate Speculative line (B only). Output annual net effect and payback per scenario.
- Sensitivity outputs for adoption (0.5–1.0), escape rate (×0.5–×3), inference cost (×0.5–×5), review overhead (×0.5–×2): tornado-style low/base/high on the primary metric and scenario net effect.
- Max sustainable multiplier per constrained role (reviewers bind at ~2.75x today per PITFALLS; marketer pools per workflow).
- Scale-vs-programme decomposition (ECON-06): every baseline→2x change in the v1 model is split into the effect of 2x volume with baseline assumptions vs the programme's assumption changes; test the decomposition closes (INV-9).

### Evidence classes and claims (ECON-12)
- Per-side evidence: an assumption's baseline value is `illustrative`; its agent-enabled/2x value is `hypothesis` (fixes the Phase 5 note that baseline figures inherited hypothesis). Implement as per-side evidence on assumptions that have baseline/scaled values; claims derived only from baseline values become illustrative.
- All new engine outputs that later phases will show are registered as derived claims in `data.js` (value computed, never typed). Crosscheck/tests enforce no hand-typed model numbers.
- Fix the `rework_rate` read path (`model.js` reads without `pick()`) with a regression test where baseline and 2x differ.

### Claude's Discretion
- Exact default values where FEATURES.md gives none (cycle times, inference per-unit costs, sampling hours), provided each is graded and has a one-line basis.
- Internal API shapes and file split beyond the module rule above.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `calc.js` `compute(inputs)`, `variantMatrix`; `model.js` `present`, `defaultValues`, `RESULT_ROWS`, scenario modes (redeploy/hold/reduce, `first_year_net` at model.js:242); `data.js` `a()` helper, `claims` with `derived` paths, evidence post-pass (Phase 5).
- Tests: `test/calc.test.js`, `test/model.test.js`, `test/data.test.js`, `test/evidence.test.js`, crosscheck.

### Established Patterns
- Pure ES modules testable in Node; `node:test` + `assert/strict`; golden cases; literal claim values cross-checked against derived values.

### Integration Points
- `data.js` claims → page `data-fig` spans; crosscheck compares. Calculator (ui.js) reads model.js present().

</code_context>

<specifics>
## Specific Ideas

- PITFALLS.md s1.1 table supplies goldens; FEATURES.md s4 roll-up supplies workflow defaults; FEATURES s8 is the do-not-double-count spec.

</specifics>

<deferred>
## Deferred Ideas

- Page presentation of all new outputs (Phase 9); worked-example hours on the page (Phase 8).
- Full editable inputs for every workflow in the calculator (future).

</deferred>
