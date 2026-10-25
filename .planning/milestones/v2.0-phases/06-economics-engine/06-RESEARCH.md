# Phase 6: Economics Engine - Research

**Researched:** 2026-10-25
**Domain:** Pure, tested labour-and-cost engine (ES modules, `node:test`) behind a static evidence-graded page: per-workflow model, capacity bridge, scenarios A/B/C, primary metric, investment, sensitivity, evidence classes
**Confidence:** HIGH on formulas, goldens and the blast radius of the v1 correction (every number below was produced by running the repo's own `calc.js`, `model.js`, `data.js` and a research prototype on 2026-10-25). MEDIUM on token prices (fetched from official pages, dated). LOW on every workflow-level default (illustrative or hypothesis by construction; no public benchmark exists).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Module layout
- Keep `site/js/calc.js` as the engine entry point. Add a pure, DOM-free module `site/js/workflows.js` (per-workflow model, capacity bridge, scenarios, investment, sensitivity, primary metric) and re-export its public functions from `calc.js`. Inputs and defaults live in `data.js` (as `assumptions` with grade + evidence), never inside the engine.
- The v1 content-factory model (`compute()`) stays and is corrected, not replaced: it remains the detailed model of the pilot slice (W2 planning/ops, W4 adaptation/localisation, W5 review, W6 publishing) and the calculator's backbone.

#### Workflow model (ECON-01)
- W1–W10 with the FEATURES.md s4 defaults (FTE, units/yr, baseline hours/unit, agency $, default net hour reduction and range). 92 in-scope FTE; 28 out-of-scope FTE get an assistance-level uplift (default 10%, range 0–15%) and are otherwise untouched.
- Productive hours: 1,600 per marketer FTE per year (illustrative); reviewers keep v1's 1,200-hour fatigue cap.
- Per workflow and state (current, agent-enabled): annual workload (units), human hours per unit, review and exception hours (agent-created human work: default 20% of baseline hours at L2, 8% at L3, illustrative), total human hours, productive FTE, labour cost, agency/vendor cost, AI and software cost (inference + licences per unit), cost per equivalent output, cycle time (days, illustrative per workflow), autonomous share (share of units completed with no human touch beyond sampling).
- Autonomy level per workflow at 12 months (L1–L4) per FEATURES s4.
- W5 review uses the v1 reviewer model (not a flat % reduction): per-variant hours fall, total hours can rise with volume.
- W8 experimentation is traffic-capped: its capacity multiple cannot exceed a traffic constraint input (default 1.0x traffic growth → tests capped at baseline power).

#### Pricing and double counting (ECON-04, ECON-05)
- One price per hour: hourly cost = fully loaded annual cost per FTE ÷ productive hours for that role (marketer $150k/1,600h; reviewer $150k/1,200h). Remove the $100/h vs $125/h split (D1/D2).
- Cash view is primary for CFO outputs: payroll by FTE, external spend by line (agency, vendor, AI/software, media excluded). Activity-cost views (cost per approved asset etc.) are labelled as such and never summed with cash lines.
- Master-concept cost split into internal hours (default 40 h at the marketer rate, illustrative) plus an agency fee (default $1,200, illustrative) — record which v1 figures move.
- Savings ledger: every saving carries `counted_in` (labour | agency | vendor | ai) and the tests forbid the same dollars in two lines and any saving larger than its source line (INV-1–INV-11 from PITFALLS.md, written as tests with hand-calculated goldens from the PITFALLS 1.1 table).
- Paid media is never a saving.
- The $1.03M "funded from agency fees" story (D3) is corrected to whatever the engine actually supports.

#### Capacity bridge and reconciliation (ECON-02, ECON-03)
- Released hours reconcile exactly (conservation test) into: hours eliminated from existing workload; capacity redeployed into additional work; avoided future hires; reducible external spend (agency/vendor, in $ not hours); genuinely removable headcount; capacity already unused at baseline (slack). Baseline slack is reported separately and never attributed to the programme (INV-4).
- Reviewer bridge at defaults should reproduce PITFALLS figures: 4.21 FTE slack today; +0.95 FTE programme-added review load at 2x; 6.84 FTE review work avoided at 2x (3.57 avoided hires + 3.27 unused); 3.42 FTE removable at same output. If an engine correction changes these, the new values are authoritative and the SUMMARY explains the delta.

#### Scenarios (ECON-07)
- A "same team, more output": headcount and agency budget fixed; output = what released capacity absorbs, bounded by the binding role.
- B "same output, lower cost": output fixed at baseline; removable FTE and reducible agency spend realised with an adoption lag (year-1 realisation default 50%, illustrative).
- C "growing demand, limited hiring" (default): demand multiplier on in-scope work (default 2.0, editable); output the hires and agency spend needed with vs without the programme.
- Legacy calculator modes map: redeploy→A, hold→B, reduce→B with headcount cut (mapping implemented in Phase 9; engine exposes A/B/C).

#### Primary metric (ECON-08)
- Useful work index = Σ completed units × frozen baseline standard hours per unit (only objective-linked, approved, live/delivered units count). Denominator = in-house marketing FTE + agency FTE-equivalents (agency fees ÷ blended agency cost per FTE-equivalent, default $200k, illustrative). Report org-wide and for the delegated portfolio (W2, W4, W6, W9), plus the per-workflow multiple. The engine must report honestly whatever the defaults give (research expects ~1.4–1.5x org-wide, ~1.8x portfolio).

#### Investment, sensitivity, limits (ECON-09, ECON-10, ECON-11)
- Investment: one-off build/integration (default $1.5M, illustrative), platform team run cost (default 6 FTE × $200k, illustrative), inference cost (per agent-run unit: steps × tokens × price × retries incl. judge calls; default per-unit costs illustrative, tokens price editable), autonomy review overhead (eval curation, sampling, judge calibration hours), escape cost (unseen auto-approved volume × escape rate × cost per escape, hypothesis). Severance/change cost on a separate Speculative line (B only). Output annual net effect and payback per scenario.
- Sensitivity outputs for adoption (0.5–1.0), escape rate (×0.5–×3), inference cost (×0.5–×5), review overhead (×0.5–×2): tornado-style low/base/high on the primary metric and scenario net effect.
- Max sustainable multiplier per constrained role (reviewers bind at ~2.75x today per PITFALLS; marketer pools per workflow).
- Scale-vs-programme decomposition (ECON-06): every baseline→2x change in the v1 model is split into the effect of 2x volume with baseline assumptions vs the programme's assumption changes; test the decomposition closes (INV-9).

#### Evidence classes and claims (ECON-12)
- Per-side evidence: an assumption's baseline value is `illustrative`; its agent-enabled/2x value is `hypothesis` (fixes the Phase 5 note that baseline figures inherited hypothesis). Implement as per-side evidence on assumptions that have baseline/scaled values; claims derived only from baseline values become illustrative.
- All new engine outputs that later phases will show are registered as derived claims in `data.js` (value computed, never typed). Crosscheck/tests enforce no hand-typed model numbers.
- Fix the `rework_rate` read path (`model.js` reads without `pick()`) with a regression test where baseline and 2x differ.

### Claude's Discretion
- Exact default values where FEATURES.md gives none (cycle times, inference per-unit costs, sampling hours), provided each is graded and has a one-line basis.
- Internal API shapes and file split beyond the module rule above.

### Deferred Ideas (OUT OF SCOPE)
- Page presentation of all new outputs (Phase 9); worked-example hours on the page (Phase 8).
- Full editable inputs for every workflow in the calculator (future).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ECON-01 | W1–W10 per workflow and state: workload, hours/unit, review/exception hours, total hours, FTE, labour cost, agency, AI/software, cost per output, cycle time, autonomous share | Section "Portfolio engine", "Per-workflow goldens", "Defaults register" (cycle times, inference profiles, autonomy levels) |
| ECON-02 | Released hours reconcile exactly (conservation test) | "Capacity bridge" identities and INV-1 test pattern; pool-level identity `F + hires − removed = Req_with + unused` |
| ECON-03 | Baseline slack, programme-added load and work avoided as separate figures | "Reviewer bridge goldens" (4.214654 / 0.949432 / 6.835913 / 3.570691 / 3.265222 / 3.417957), `reviewer_fte_required` moves into `calc.js` |
| ECON-04 | One price per hour; cash view; savings bounded by source line (INV-1–INV-11) | "One price", "Ledger and invariants", "v1 figures that move" |
| ECON-05 | Concept cost split into internal hours and agency fee; explicit agency line | "Corrected v1 slice", `asm-concept-hours` + `asm-master-concept-cost` re-labelled as the agency fee |
| ECON-06 | Scale vs programme decomposition | `effects` output; closes exactly; cost per asset scale share 81%, programme 19% (corrected figures) |
| ECON-07 | Scenarios A/B/C as distinct outputs | "Scenarios" with goldens for each; legacy `scenarioOutcomes` re-based to the cash view |
| ECON-08 | Primary metric org-wide and portfolio | "Primary metric" definition and numbers (honest result differs from the research expectation, see Summary) |
| ECON-09 | Investment (build, run, inference, review overhead, escape) and annual net per scenario | "Investment and payback" with line items and numbers |
| ECON-10 | Sensitivity to adoption, escape, inference, review overhead | "Sensitivity" tornado numbers |
| ECON-11 | Max sustainable multiplier per constrained role | "Max sustainable multipliers" (per pool, reviewers 2.7476x, uniform 1.0x because of the W8 traffic cap) |
| ECON-12 | No hand-typed model numbers; `rework_rate` read path cannot return NaN | "Generated claims", "rework_rate fix" with regression test recipe |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Static HTML/CSS/JS on GitHub Pages; **no runtime dependencies**, no build step. Tests use `node:test` + `node:assert/strict` (`node --test`), no `package.json` dependencies. [CITED: ./CLAUDE.md]
- **Honesty:** every number is graded, assumptions visible; a CMO 2x is a projection. Nothing on the page is observed for the subject organisation. [CITED: ./CLAUDE.md, REQUIREMENTS EVID-03]
- **Neutrality:** named vendors only in the comparison section and register (s12, s15; `VENDOR_RE` test in `test/page.test.js:568-575`). Describe model tiers by category on the page body ("a frontier model", "a small model"); vendor names (pricing pages) go only in register rows. [VERIFIED: test/page.test.js]
- `calc.js` stays pure and DOM-free; `compute()` never throws and never returns NaN/Infinity (`{ ok:false, errors }`). [CITED: site/js/calc.js header]
- No `localStorage` or cookies; share links use `URLSearchParams` in the hash (STRUCT-03 fixtures must keep passing).
- GSD workflow: all file changes go through a GSD plan/execute command. Every commit keeps `node --test` and `node scripts/crosscheck.mjs` green (baseline today: 435 tests pass, crosscheck 0 failures, figures 334, chips 169, register rows 107). [VERIFIED: run 2026-10-25]
- Browser gates (smoke, a11y, print, via `scripts/gates.sh`) run at the end of each phase, not per commit; the known CDP "no page target" flake is retried once by the script. [VERIFIED: scripts/gates.sh]

## Summary

The engine work is mostly arithmetic that is already pinned by the three research files, but five things were not visible from them and will shape the plan. **(1) The locked concept-cost split moves a lot of v1 page figures.** Pricing a master concept at 40 h × $93.75 + $1,200 = $4,950 (instead of $1,200) and a review hour at $125 (instead of $100) takes cost per approved asset from $64.71 / $45.26 to **$163.43 / $114.33** (change stays −30%), total production-attributable cost from $2.59M / $3.62M to **$6.54M / $9.15M**, and its share of the $78M budget from 3.3% / 4.6% to **8.4% / 11.7%** (+3.3 points, not +1.3). 44 claims and 59 `data-fig` spans change, plus the Figure 1 and Figure 8 geometry and several sentences ("Production is a small line in the budget", "funded by reallocating agency and production fees", "Fully loaded"). Applying the correction alone to a scratch copy of the repo fails exactly 19 tests, which is the work list for the figure-moving commit. **(2) The cash view changes the legacy scenario rows:** at defaults Redeploy's cash production spend change is +$935,199 (first-year net $1,295,199), Hold's is **+$295,053** (not the "−$53,579 saving" the page states) and Reduce nets $805,416. **(3) The honest primary-metric numbers differ from the research expectation.** With the definition below the org-wide multiple at default is 1.65x before and **1.60x after the platform team**, and the delegated portfolio (W2, W4, W6, W9) is 2.18x before and **1.99x after** the platform team. The "~1.8x" in the research notes is the 80 non-review in-scope FTE figure (1.80x), not the portfolio. A uniform 2x across all workflows is not sustainable at defaults: the binding roles are W8 (traffic cap, 1.0x) and W3 (1.54x). **(4) Inference is not a material cost at current token prices** (about $10k a year at default usage; ×5 moves scenario B net by −$39k). The platform team ($1.2M), tooling (+$450k), autonomy review overhead ($240k) and escapes dominate. This is a finding to show, not a default to inflate. **(5) The scale share of the v1 cost-per-asset fall is 81%, not 64%,** once the concept cost carries real internal hours; the programme part is $9.15 of $49.10.

The plan should treat the figure-moving correction as one atomic, isolated commit (page, claims, SVG geometry and tests together), build the portfolio engine as pure modules with goldens first, and add new inputs to `data.js` under a new assumption `kind` (`'engine'`) so `defaultInputs()`, `defaultAssumptions()`, the evidence trace and the 435 existing tests keep their meaning. Each new `assumptions` row needs a register `<tr>` on the page (crosscheck requires one per assumption), so generate those rows from `data.js` with a script rather than by hand.

**Primary recommendation:** five plans in four waves: (1) additive `calc.js` hardening with no figure movement; (2) in parallel, the portfolio engine `workflows.js` with goldens and the atomic v1 figure migration; (3) engine inputs, register rows and per-side evidence in `data.js`; (4) generated engine claims, evidence trace extension, ledger invariants and closure.

## Architectural Responsibility Map

This is a static, client-only page; "tiers" are modules and the test harness.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Hour/cost maths (v1 slice, portfolio, scenarios, metric, sensitivity) | Pure engine modules (`calc.js`, `workflows.js`) | — | DOM-free, testable in Node, imported unchanged by the browser |
| Inputs, defaults, grades, evidence, claims | `data.js` (single source) | `model.js` context builder | CRED-06: page, register and engine read the same numbers |
| Reader-facing strings, labels, grades per output | `model.js` presenter | `format.js` | Existing pattern; Phase 9 extends it |
| Static figures and prose numbers | `index.html` `data-fig` spans | `crosscheck.mjs` | Spans are checked against `data.js` display text |
| Regression guards (INV-1–INV-11, no typed numbers) | `node --test` suite | `scripts/crosscheck.mjs` | Gate on every commit |
| Deployment | GitHub Pages via Actions (unchanged) | — | No change in this phase |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ES modules, hand-written | n/a | `calc.js`, new `workflows.js`, `data.js` | Project convention; no build step [CITED: CLAUDE.md] |
| `node:test` + `node:assert/strict` | Node v23.7.0 local (22+ required) | Unit and golden tests | Already used by all 435 tests [VERIFIED: `node --version`, `node --test`] |

### Supporting
None. No packages are added in this phase.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Erlang C for the review queue | Keep only the M/M/1 term | See "Review queue model": keep M/M/1 as the labelled upper bound **and** add Erlang C as the lower bound |
| Generated register rows (script) | Hand-edited HTML rows | About 40 new rows; a script keeps `data.js` and HTML identical |

**Installation:** none.

**Version verification:** not applicable (no external packages).

## Package Legitimacy Audit

No external packages are installed in this phase (`package.json` has no dependencies and stays that way). slopcheck not run; nothing to approve. **Packages removed: none. Flagged: none.**

## Architecture Patterns

### System architecture (data flow)

```
data.js  assumptions (kind input|model|calc|engine|...) + sources + claims
   |  defaultInputs() / defaultAssumptions()        engineContext()  (new)
   v                                                   |
calc.js  compute(inputs, assumptions)  <----- workflows.js  economics(ec)
   |  (v1 slice: volumes, W5 reviewer hours,           |  imports compute; calc.js re-exports (cycle is safe,
   |   cost_cash / cost_internal, effects,             |  only function declarations are used at eval time)
   |   capacity_bridge, queue bounds)                  |
   |                                                   v
   |                          per-workflow table -> capacity bridge -> scenarios A/B/C
   |                          -> ledger (counted_in) -> primary metric -> investment/payback
   |                          -> sensitivity -> max multipliers -> funding check
   v                                                   v
model.js present() (legacy s11 rows, cash view)     data.js generated claims (calc-style paths)
   |                                                   |
   v                                                   v
index.html data-fig spans  <----- crosscheck.mjs + node --test (goldens, INV tests)
```

Entry points: the calculator (`model.js present()`), and later phases reading generated claims. Slice figures (v1 `compute()`) and portfolio figures (`economics()`) are different scopes and are **never summed**; the only cross-scope item is the funding check (a ratio, labelled).

### Recommended structure
```
site/js/
  calc.js          # v1 slice, corrected; re-exports workflows.js
  workflows.js     # NEW: pure portfolio engine (validate, workflowModel, bridge, scenarios, metric, investment, sensitivity, maxMultipliers, queue, chainSuccess, checkLedger)
  data.js          # + kind:'engine' assumptions, engineContext(), generated claims, per-side evidence
  model.js         # legacy scenario rows -> cash view; rework read path via pick()
test/
  workflows.test.js   # NEW goldens with test-local defaults (like calc.test.js)
  economics.test.js   # NEW INV-1..INV-11, ledger, decomposition, rework regression
scripts/
  gen-register-rows.mjs  # NEW (optional): emit <tr> rows for kind:'engine' assumptions from data.js
```

### Pattern 1: One price per hour (ECON-04)
Hourly rate = loaded annual cost ÷ productive hours for that role: marketer 150,000 ÷ 1,600 = **$93.75**; reviewer 150,000 ÷ 1,200 = **$125.00**. `asm-reviewer-rate` becomes a **derived** value in `data.js` (`loaded_fte_cost / reviewer_hours_per_fte_year`), not an independent input; add `asm-marketer-rate` the same way. Test INV-2: `reviewer_rate_per_hour === loaded / reviewer_hours` and `marketer_rate_per_hour === loaded / productive_hours` to 1e-9. [VERIFIED: prices computed]

### Pattern 2: Corrected v1 slice in `calc.js` (additive, then flipped)
All changes are additive so `test/calc.test.js` (which inlines its own defaults, `reviewer_rate_per_hour: 100`, `master_concept_cost: 1200`) stays green untouched:

- New optional compute assumptions `concept_internal_hours` and `marketer_rate_per_hour` (may be `{baseline, scaled}`; **absent = 0**, which reproduces legacy numbers exactly). `cost.generation = concepts × (master_concept_cost + concept_internal_hours × marketer_rate_per_hour) + G × variant_cost`. `master_concept_cost` is reinterpreted as the **agency fee** per concept (id `asm-master-concept-cost` is kept so `GAP_TRACE`, `OUTPUT_DEPS`, FIELDS and share-link param `mconcept` keep working; relabel it "Agency fee per master concept").
- New outputs per side: `cost_cash` = `{ concept_fee, variants (G × variant_cost × (1 + rework)), tooling, rights, storage, total }` and `cost_internal` = `{ concept_hours, review (review_hours × (1 + rework) × reviewer rate), total }`; invariant `cost_cash.total + cost_internal.total === cost.total` (this identity holds exactly at defaults: 1,794,484 + 4,742,632 = 6,537,116) [VERIFIED: scratch run].
- New per-side output `reviewer_fte_required = review_hours × (1 + rework) / (reviewer_hours × target_utilisation)` (moves `model.js:217` into `calc.js`, read through `pick()` per side).
- New `capacity_bridge`, `effects` and queue bounds (below).

### Pattern 3: Portfolio engine (`workflows.js`)
Per workflow `w` (W1, W2, W3, W4, W6, W7, W8, W9, W10) with typed inputs `fte, units, h` (baseline hours/unit), `agency`, `r` (net hour reduction), `lo`, `hi`, `level`, `s` (agency reduction share):

- Baseline hours `H0 = units × h`; baseline FTE `F = fte` with `H0 = F × 1,600` exactly for every workflow (this is why W3 uses **h = 35.2**, not 35).
- Agent state at volume multiple `m` (adoption `a`, review-overhead multiplier `k`, overhead share `ov` by level: L1 0, L2 0.20, L3 0.08, L4 0.08):
  - `r_eff = a × (r − ov × (k − 1))` (net reduction; at `k = 1` it equals the typed net `r`); `ov_eff = ov × k × a`.
  - total human hours `= units × m × h × (1 − r_eff)`; review/exception hours `= units × m × h × ov_eff`; residual execution `= total − review` (validation: `r_eff + ov_eff ≤ 1`, execution ≥ 0).
  - productive FTE (marketers) `= hours / 1,600`; required FTE target utilisation is 1.0 for marketer pools.
  - labour cost (activity, one price) `= productive FTE × 150,000`; agency cost `= agency × m × (1 − a·s)`; AI/software `= units × m × inference_per_unit`; cost per unit `= (labour + agency + AI) / (units × m)`.
  - autonomous share: 0 at L1/L2; 0.60 at L3/L4 (same hypothesis as the v1 gate); baseline 0 (W5 keeps v1: 20% baseline, 60% agent).
- Pool capacity multiple `cap_w = 1 / (1 − r_eff)`; W8 `m ≤ traffic_growth`; workflows downstream of the review gate (W4, W6) `m ≤ reviewer max multiple`.
- **W5 is not a typed row.** Its states come from `compute()`: current = baseline side, agent at 1x volume = scaled side at multiplier 1, agent at m× = scaled side at multiplier m. Review/exception hours (agent-created) = sampled plus escalated hours `G × auto × (sampling + escalation) × minutes/60 × (1 + rework)`.
- Cycle time: typed illustrative `[current, agent]` days per workflow; W5 from the queue bounds below.

### Pattern 4: Scenarios (all in FTE at target utilisation unless stated)

Notation per pool: `F` assigned FTE, `Req0` baseline required, `ReqP(m)` required with the programme at volume `m` (linear in `m`), `slack0 = F − Req0`, `E = Req0 − ReqP(1)`.

- **A (same team, more output):** `m_w = min(cap_w, traffic cap, reviewer max for gated)`. Headcount fixed; **agency cash held at baseline by definition**; cash labour change 0 (INV-3); net = −(programme run cost). The engine also reports `agency_headroom_w = 1/(1 − s_w)` and `agency_budget_binds_w = m_w > headroom` (true for W2, W3, W4, W6, W9 at defaults) and `implied_agency_growth = Σ max(0, agency_w × (m_w(1 − s_w) − 1))` ($5.35M at defaults) as information, plus a switch `agency_scales_with_output` (default false) that adds it to the net. This makes the assumption visible instead of silent.
- **B (same output, lower cost):** `m = 1`. Removable FTE per pool `= F × r_eff` if at least `min_removable_fte` (default 1.0) else 0 (the remainder is "fragmented", reported as unused); reviewers use `E` (INV-4: never `F − ReqP`). Agency saving `= Σ agency × a × s`. One-offs: build + change cost (per marketing FTE) + severance (Speculative, B only: `removable × loaded × severance_months / 12`). Year-1 realisation applies to savings only (default 0.5); run costs are full from day one.
- **C (growing demand, limited hiring):** demand multiplier `d` (default 2.0) on in-scope work, W8 demand capped at traffic growth. Per pool: `without = F × d` (reviewers `Req0 × d`), `with = F × d × (1 − r_eff)` (reviewers `ReqP(1) × d`), `hires_without = max(0, without − F)`, `hires_with = max(0, with − F)`, `unused = max(0, F − with)`, `avoided = hires_without − hires_with`; INV-7: `avoided + unused = without − with` per pool (gap 0 for all ten pools at defaults). Agency: `without = Σ agency × demand`, `with = Σ agency × demand × (1 − a·s)`. Avoided cost `= avoided_hires × loaded + (agency_without − agency_with)`. Report also the position **against today** (spend still rises); see goldens.

Optional but recommended (cheap): `counterfactual_funded_share` (default 1.0) multiplying avoided hires, because avoided hires are real only if they were planned and funded (FEATURES s6, INV-7 note). Show it in sensitivity extras, not in the four required tornado bars.

### Pattern 5: Conservation (ECON-02, INV-1)

Per pool and scenario, in FTE at target utilisation:

```
slack0 + E  =  redeployed + removed + unused_remaining          (A and B partition)
   redeployed = ReqP(m) − ReqP(1)         removed = B's removable FTE
   unused_remaining = F − ReqP(m) − removed
F + hires_with − removed = ReqP(m) + unused                     (all scenarios, general form)
```

Programme-attributable release is `E`; baseline slack is `slack0` and is reported as its own line, never added to the programme's saving. The six reconciliation items the requirement names map to: hours eliminated = `E` (and `Σ F·r_eff`); capacity redeployed = `redeployed`; avoided hires = C's `avoided`; reducible external spend = `Σ agency × a × s` in dollars; removable headcount = `removed`; capacity unused at baseline = `slack0`. Reviewers' `redeployed` at 2x consumes all of `E` (3.418) and 0.949 of baseline slack: the "programme added load" of PITFALLS 1.1.

### Pattern 6: Primary metric (ECON-08)

- Standard hours per unit are **frozen baseline in-house hours** `h_w` (time-study hours). Numerator `I = Σ units_w × h_w × m_w` over W1–W4, W6–W10 plus the 28 out-of-scope FTE at `28 × 1,600 × 1/(1 − u)`. **W5 is excluded from the output index** (review is a gate, not a unit of output; its capacity enters as the reviewer constraint and its FTE stay in the denominator). Including W5 would credit baseline reviewer slack to the programme (INV-4): reviewers alone absorb 1.54x with no programme.
- Denominator `D = in-house FTE (120, includes the 12 reviewers) + agency FTE-equivalents (Σ agency ÷ 200,000 = 80) + platform team (agent-enabled state only)`. Baseline `D0 = 200`.
- `multiple_s = (I_s / D_s) / (I_0 / D_0)`. Report org-wide and portfolio (W2, W4, W6, W9; platform team allocated 100% to the portfolio, conservative) both **before** and **after** the platform team, plus the per-workflow `m_w`.
- Scenario variants: A uses `m_w` with fixed `D` (+ platform); B uses `m = 1` and the shrunken `D_B`; C uses demand with `D_C`.
- Consequence to state on the page (Phase 9, THESIS-04): the arithmetic-index org-wide multiple is higher than the pooled-hours figure in FEATURES s4 (1.47x with reviewers and a 10% out-of-scope uplift) because each workflow grows by its own multiple. The engine should also expose `max_uniform_multiplier` (the largest multiple every pool can carry together): **1.0x** at defaults because W8 is traffic-capped; **1.538x** if W8 is excluded (W3 binds).

### Pattern 7: Investment and payback (ECON-09)

Programme run cost (annual, per scenario volume): platform team `6 × 200,000`; platform tooling increment `tooling.scaled − tooling.baseline = 450,000` (v1 `asm-tooling`); autonomy review overhead `(24 h × 12 × n_autonomy_workflows + 16 h × 12) × 125` (n = 6: W2, W4, W5-gate, W6, W9, W10; **1,920 h = $240,000**); agent-run inference; variant production AI `G × variant_cost.scaled`; programme-attributable escape cost `(unseen_auto_with − unseen_auto_without) × escape_rate × cost_per_escape` where `unseen_auto = G × auto × (1 − sampling − escalation)` and "without" is the same output at baseline auto-approval. One-off: build $1.5M, change cost `3,000 × marketing FTE`, severance (B only). Payback: simple `one_off / net`; ramped `1 + (one_off − y1_net)/net` when `one_off > y1_net`; `null` when net ≤ 0 (A has no cash payback by definition).

Tooling and variant production AI are also lines **inside** the v1 slice cash delta. They are not double counted because the slice delta and the portfolio ledger are different scopes and are never summed (see Pitfall 3). The v1 `asm-tooling` basis text mentions "model commitments"; reword to "platform licences, observability and eval-harness upkeep (not inference)" so inference is counted once.

### Pattern 8: Sensitivity (ECON-10)

Pure re-runs of `economics()` with one parameter moved; tornado rows `{ low, base, high }` on (a) org-wide A multiple after platform, (b) scenario A/B/C net. Moves: adoption 0.5/1.0 (interpolates the 2x auto-approval share toward baseline and scales `r` and `s`), escape ×0.5/×3, inference price ×0.5/×5, review overhead ×0.5/×2 (shifts hours between review and execution via `r_eff = a(r − ov(k − 1))` and multiplies the v1 sampling and escalation rates and the autonomy overhead hours). Default adoption is 1.0, so the adoption bar is one-sided (low only); say so.

### Pattern 9: Funding check (replaces the D3 story)
`funding = { slice_cash_rise, reducible_agency, netted_inside_delta, coverage }`. At defaults: slice external production spend rises **$935,199** (concept fees +$497k, tooling +$450k, rights +$104k, variants −$116k, storage); portfolio reducible agency spend is **$3,600,000** (Σ agency × s at full adoption; hypothesis). INV-6: the variant-line saving already netted inside the slice delta (**$116,210**) cannot also count as funding, so `coverage = (3,600,000 − 116,210) / 935,199 = 3.73x`. Say what that supports: the cash rise in production spend is covered 3.7 times by reducible agency spend **if** that spend is actually reduced; it does not cover the programme's own run cost ($2.0M in B) in addition. Statement scope: hypothesis-class.

### Review queue model (recommendation)
**Keep the existing M/M/1 term as the headline and label it "single-queue upper bound"; add Erlang C as the pooled lower bound; show both.** Reasons: the M/M/1 term keeps every v1 brief-to-live figure (11.8 → 7.5 days) stable, so it does not add to the figure-moving commit; reviewers are in practice split by specialism (brand, legal, regional), so neither bound is the truth; the M/M/1 formula applied to 12 pooled reviewers overstates waiting (PITFALLS 1.3). Erlang C with `c = floor(reviewer_fte)` servers (conservative for fractional FTE; `null` if offered load ≥ `c`):

```
A = ρ·c            (offered load in Erlangs; ρ = utilisation incl. rework)
B(0)=1;  B(k) = A·B(k−1) / (k + A·B(k−1))            (Erlang B recurrence, numerically stable)
C = B(c) / (1 − ρ·(1 − B(c)))                          (probability of waiting)
Wq = C · s / (c·(1 − ρ))        with s = review_service_days
brief_to_live = build_days + (1 + rework) · (s + Wq)
```
Hand check: `c = 2, ρ = 0.5` gives `C = 1/3`; `c = 1` gives `C = ρ`. [VERIFIED: computed] At defaults (s = 1.5 d, c = 12): baseline ρ = 55.1% gives Wq 0.012 d (M/M/1: 1.844 d) and brief-to-live **9.74 d** (upper bound 11.85); 2x ρ = 61.9% gives Wq 0.030 d (M/M/1: 2.434 d), **4.76 d** (upper 7.52). So the programme's speed claim is a range: −36% (upper bound) to −51% (pooled lower bound). Output names: `brief_to_live_days` (upper, unchanged) and `brief_to_live_days_pooled`.

### Anti-Patterns to Avoid
- **Summing activity cost and payroll** (D1): `first_year_net` must add only cash lines.
- **Counting reviewer slack in the output index or as a saving** (INV-4).
- **Typing model numbers** in `data.js` literals for engine outputs; generate them.
- **Putting engine inputs under `kind: 'input'|'model'`:** `defaultInputs()`/`defaultAssumptions()` select by kind, and `compute()` validates only known fields. A separate `kind: 'engine'` keeps all 435 tests' meaning.
- **Bolting per-workflow logic into `side()`** (PITFALLS debt table): keep `workflows.js` separate.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pooled queue wait | A new simulation or ad-hoc formula | Erlang B recurrence + Erlang C (formula above) | Closed form, 10 lines, verified by hand checks |
| Hour partition | Per-scenario ad-hoc subtraction | One `bridgePool(F, Req0, ReqP, m, removed)` function used by A, B, C | A single identity is testable once (INV-1) |
| Evidence tracing for new claims | Hand-listing inputs per claim | Extend the existing `trace()` in `data.js` to nudge `kind:'engine'` inputs and re-run the engine claim builder | Same mechanism as v1 claims; stays correct as inputs change |
| Register HTML | Hand-typed rows | `scripts/gen-register-rows.mjs` from `data.js` | Crosscheck and `page.test` compare row fields to `data.js` |
| Savings summation | A free-form array of numbers | A ledger of `{ id, line, counted_in, scope, kind, amount }` rows plus `checkLedger(rows)` | Makes INV-5/INV-6 mechanical |
| Rounding for display | `toFixed` in the engine | Keep full precision in the engine; round only in `formatValue` | Matches v1 convention (claims store rounded literals only for v1 derived paths) |

**Key insight:** the risk in this phase is attribution, not arithmetic. Every dollar and hour must land in exactly one bucket, so build the bucket structure (ledger, bridge) first and let the scenarios fill it.

## Runtime State Inventory

Not a rename phase. The one persisted-state item: **share links.** v1 URLs carry `mconcept=` (cost per master concept). After the split the same parameter restores into the **agency-fee** field, so an old link restores the same number but computes a different result than it did when shared. STRUCT-03's recorded fixtures only check that values restore, so they stay green; record this as a disclosed limitation in the SUMMARY. Stored data, live service config, OS-registered state, secrets and build artifacts: **None** (static page, no backend, no env vars; verified by repo layout).

## Common Pitfalls

### Pitfall 1: The figure-moving commit is bigger than it looks
**What goes wrong:** the concept split and one-price fix change 44 claims and 59 spans, and each also appears in SVG geometry and prose.
**Why it happens:** bar widths are `value / panel max × 600` (`test/figure.test.js`), desc/title texts embed the numbers, and prose states relations ("small line in the budget", "+1.3 points", "funded by reallocating agency and production fees", "Fully loaded", Hold "(a saving)").
**How to avoid:** one atomic commit with this checklist: (a) `data.js` literals for the 16 `derived` claims that move (`cpcm-*`, `cpa-*` and its six component pairs, `total-cost-*`, `budget-share-*`); the other 28 are generated from the presenter; (b) all `calc-*` display texts in `index.html`; (c) Figure 1 (`#s02` svg f2: cost and cpcm panels, desc text) and Figure 8 (live chart static markup and desc); (d) sentences at `index.html` lines 29, 144, 146–149, 171 (`Cost per approved asset (USD, fully loaded)`), 500, 563–600 and the Hold note; (e) labels in `model.js` (`RESULT_ROWS` cost_per_asset, scenario row labels) and `fields.js`/page label for `mconcept`; (f) `asm-reviewer-rate`, `asm-master-concept-cost`, `asm-loaded-fte-cost`, `asm-change-mgmt` basis/label text and their register rows; (g) tests listed in "v1 figures that move".
**Warning signs:** `node --test` red in `calc-page`, `page`, `figure`, `data`, `model`, `crosscheck`; a green run after editing only `data.js` means the page was not updated.

### Pitfall 2: Two different hours-per-concept
**What goes wrong:** the v1 slice uses 40 h per master concept (locked); W3 uses 35.2 h per concept (35,200 h ÷ 1,000). A CFO sees two numbers for the same thing.
**How to avoid:** keep 40 h per CONTEXT (locked) but make the difference explicit in the basis of both rows ("40 h is the pilot campaign family including direction and rework; 35.2 h is the average across all creative work") **or** ask the author to set both to 35.2 (one-line change, moves the figures above slightly). See Open Questions Q1.

### Pitfall 3: Slice and portfolio ledgers both include tooling and variant AI
**What goes wrong:** tooling (+$450k) and variant production cost are inside the v1 slice delta **and** are programme run-cost lines in the portfolio ledger.
**How to avoid:** rows carry `scope: 'slice' | 'portfolio'`; `checkLedger` throws if a total mixes scopes. The funding check is a ratio across scopes and is labelled as such. Phase 9 collapses the calculator onto the portfolio ledger.

### Pitfall 4: Scenario A silently assumes agency work does not need to grow
**What goes wrong:** holding agency cash fixed while output rises 1.5x to 2.5x only works if the extra output needs no agency input at baseline rates.
**How to avoid:** report `agency_budget_binds` and `implied_agency_growth` ($5.35M); keep the `agency_scales_with_output` switch. The page must say "agency budget held fixed by assumption".

### Pitfall 5: C's avoided cost is large because the counterfactual is generous
**What goes wrong:** at 2x demand the counterfactual buys 79.6 hires and +$15.5M agency; the programme's "avoided cost" is $17.6M a year (payback 0.12 years). Against today, spend still rises $11.9M.
**How to avoid:** always output the "versus today" position next to the avoided cost, state the counterfactual in words, and keep the `counterfactual_funded_share` lever. Never headline the avoided figure alone.

### Pitfall 6: Review overhead sensitivity that does nothing
**What goes wrong:** if the typed net reduction already includes review overhead, doubling the overhead only reshuffles hours and the tornado bar is zero.
**How to avoid:** use `r_eff = a(r − ov(k − 1))` so overhead trades against net reduction (typed `r` is net at `k = 1`). At ×2 org-wide A falls 1.60x → 1.37x and B net falls $2.06M. [VERIFIED: prototype]

### Pitfall 7: Evidence trace regressions
**What goes wrong:** claims are `defineProperty` accessors installed by the post-pass; claims added after it have no `evidence`. Per-side evidence also leaves shared hypothesis scalars (`asm-sampling-rate`, `asm-escalation-rate`) on baseline claims.
**How to avoid:** add engine claims **before** the evidence block (as `presenterClaims` does). Make `sampling_rate` and `escalation_rate` per-side `{ baseline: 0.05, scaled: 0.05 }` (`calc.js` already supports per-side values) so baseline review claims can be illustrative; otherwise `cpa-review-base`, `cpcm-base`, `total-cost-base` stay hypothesis. The behavioural evidence test must move baseline-side and scaled-side separately.

### Pitfall 8: Cyclic import
**What goes wrong:** `calc.js` re-exports `workflows.js` and `workflows.js` imports `compute` from `calc.js`.
**How to avoid:** use only function declarations at module-evaluation time (hoisted, safe in ESM cycles) and `export * from './workflows.js'` at the bottom of `calc.js`. Because `node --test` runs each file in its own process, one test file importing `calc.js` first and another importing `workflows.js` first covers both orders.

### Pitfall 9: Fractional FTE and thresholds make the tornado jumpy
**How to avoid:** removable FTE is fractional above the threshold (no `floor`); at adoption 0.5 W8 (4 FTE × 15% = 0.6) drops out of removable and the bar steps. Document it; it is honest.

### Pitfall 10: Reviewers inside the 120
`model.js:241` charges change cost to `marketers + reviewers` (132 × $3,000 = $396,000). FEATURES s4 places the 12 reviewers **inside** the 120 (92 in-scope = 80 + 12) and PITFALLS 1.0 calls the others "108 non-reviewer marketers". Charge change cost to `marketers` (120 × $3,000 = **$360,000**) and validate `reviewers ≤ marketers`. Needs the author's nod (Open Question Q2); the number is on the page (`calc-scen-change_mgmt_one_off`).

## Code Examples

Verified patterns (checked by running them in this session).

### Erlang C (pooled reviewers)
```js
// Source: standard M/M/c result; hand-checked (c=2, rho=0.5 -> 1/3; c=1 -> rho)
export function erlangC(c, rho) {            // c integer >= 1, 0 <= rho < 1
  const A = rho * c;
  let B = 1;
  for (let k = 1; k <= c; k++) B = (A * B) / (k + A * B);
  return B / (1 - rho * (1 - B));
}
export const waitMMc = (c, rho, s) => (erlangC(c, rho) * s) / (c * (1 - rho));
export const waitMM1 = (rho, s) => (s * rho) / (1 - rho);
```

### Chain success with verification gates (diagnostic, PITFALLS 7)
```js
// p per-step success, k steps between verification gates, R retries allowed per segment
export const chainSuccess = (p, steps, k, R) =>
  Math.pow(1 - Math.pow(1 - Math.pow(p, k), R + 1), Math.ceil(steps / k));
// chainSuccess(0.95, 8, 8, 0) = 0.6634 (no gates); chainSuccess(0.95, 8, 4, 1) = 0.93237;
// chainSuccess(0.98, 8, 8, 0) = 0.8508. Expected attempts per segment: (1 - (1-p^k)^(R+1)) / p^k.
```
Use as a **diagnostic** (`implied_autonomous_share` next to the typed 60%), not as an input that moves hours; at p = 0.95 over 8 ungated steps it gives 0.66, consistent in size with the 0.60 hypothesis.

### Conservation test recipe (INV-1, per pool)
```js
// Source: derived in this research; reviewer values from PITFALLS 1.1, recomputed
const F = 12, Req0 = 7.785346, ReqP1 = 4.367389, m = 2;
const slack0 = F - Req0, E = Req0 - ReqP1;
const redeployed = ReqP1 * m - ReqP1, removed = 0, unused = F - ReqP1 * m - removed;
assert.ok(Math.abs(slack0 + E - (redeployed + removed + unused)) < 1e-9);
```

### rework_rate regression (ECON-12)
```js
// Today: present(defaultValues(ctx), ctx) with ctx.assumptions.rework_rate = { baseline: 0.20, scaled: 0.10 }
// returns NaN/{ok:false} through requiredReviewerFte (model.js:218) and 1 + A.rework_rate (model.js:378, 392).
// After the fix: finite, ok, and reviewer_fte_required differs per side.
const ctx = modelContext();
const ctx2 = { ...ctx, assumptions: { ...ctx.assumptions, rework_rate: { baseline: 0.20, scaled: 0.10 } } };
const p = present(defaultValues(ctx2), ctx2);
assert.equal(p.ok, true);
walkNumbers(p, (v) => assert.ok(Number.isFinite(v)));
const r = compute(inputs, ctx2.assumptions);
assert.notEqual(r.baseline.reviewer_fte_required, r.scenario.reviewer_fte_required);
```
Also read `rework` in the maths steps through `sc()` and let `scenarioOutcomes` take `reviewer_fte_required` from `compute()`. `defaultValues` must pick the scaled (2x) side for the single UI field, with a test.

## Hand-calculated goldens

All values reproduced by running code on 2026-10-25 [VERIFIED]. Tolerance 1e-6 unless noted.

### Workflow roll-up (FEATURES s4), `F × 1,600 = units × h`
| Workflow | FTE | Units | h/unit | Hours | r (lo–hi) | Released h (default) | Cap multiple |
|---|---|---|---|---|---|---|---|
| W1 | 5 | 160 | 50 | 8,000 | .40 (.25–.55) | 3,200 | 1.6667 |
| W2 | 12 | 200 | 96 | 19,200 | .50 (.30–.65) | 9,600 | 2.0000 |
| W3 | 22 | 1,000 | 35.2 | 35,200 | .35 (.20–.50) | 12,320 | 1.5385 |
| W4 | 10 | 200 | 80 | 16,000 | .55 (.40–.70) | 8,800 | 2.2222 |
| W6 | 9 | 12,000 | 1.2 | 14,400 | .60 (.40–.75) | 8,640 | 2.5000 |
| W7 | 4 | 1,600 | 4 | 6,400 | .40 (.25–.55) | 2,560 | 1.6667 |
| W8 | 4 | 80 | 80 | 6,400 | .30 (.20–.45) | 1,920 | 1.4286 (output 1.0, traffic cap) |
| W9 | 6 | 600 | 16 | 9,600 | .50 (.35–.65) | 4,800 | 2.0000 |
| W10 | 8 | 1,600 | 8 | 12,800 | .40 (.25–.55) | 5,120 | 1.6667 |

- Σ hours (80 non-review in-scope FTE) = **128,000**; released default **56,960 h = 35.6 FTE**; low **36,400**; high **76,160** (FEATURES: ~57,000 / 36,400 / 76,200).
- Multiple on the 80 FTE: `128,000 / (128,000 − 56,960) = 1.8018`; low `1.3974`; high `2.4691` (FEATURES 1.80 / 1.40 / 2.47).
- Pooled-hours org-wide (FEATURES method, 192,000 h): `192,000 / (192,000 − 56,960) = 1.4217`; with out-of-scope 10%: `192,000 / (192,000 − 56,960 − 4,480) = 1.4706`.
- Agency: Σ = $16.0M (in scope); reducible at s = 0.40 on W1, W4, W6, W7, W9, W10 ($9.0M) = **$3.6M**.

### Per-workflow agent state at baseline volume (adoption 1, level shares as above)
| WF | Lvl | Agent h/unit | Total h | Review h | Execution h | FTE | Labour $ (activity) | Agency $ | AI $/yr | Cost/unit now → agent |
|---|---|---|---|---|---|---|---|---|---|---|
| W1 | 2 | 30 | 4,800 | 1,600 | 3,200 | 3.0 | 450,000 | 900,000 | 998 | $14,063 → $8,444 |
| W2 | 3 | 48 | 9,600 | 1,536 | 8,064 | 6.0 | 900,000 | 500,000 | 812 | $11,500 → $7,004 |
| W3 | 2 | 22.88 | 22,880 | 7,040 | 15,840 | 14.3 | 2,145,000 | 6,000,000 | 1,720 | $9,300 → $8,147 |
| W4 | 3 | 36 | 7,200 | 1,280 | 5,920 | 4.5 | 675,000 | 1,200,000 | 169 | $17,500 → $9,376 |
| W6 | 3 | 0.48 | 5,760 | 1,152 | 4,608 | 3.6 | 540,000 | 900,000 | 1,071 | $237.50 → $120.09 |
| W7 | 2 | 2.4 | 3,840 | 1,280 | 2,560 | 2.4 | 360,000 | 900,000 | 2,528 | $1,312.50 → $789.08 |
| W8 | 2 | 56 | 4,480 | 1,280 | 3,200 | 2.8 | 420,000 | 500,000 | 559 | $13,750 → $11,507 |
| W9 | 3 | 8 | 4,800 | 768 | 4,032 | 3.0 | 450,000 | 600,000 | 1,608 | $3,167 → $1,753 |
| W10 | 3 | 4.8 | 7,680 | 1,024 | 6,656 | 4.8 | 720,000 | 900,000 | 143 | $1,688 → $1,013 |

(Review hours `= H0 × ov`; execution hours are total minus review.) Inference total across workflows ≈ **$9,609 a year**.

### Reviewer bridge (PITFALLS 1.1 reproduced; FTE at 85% target = 1,020 h)
| Quantity | Value | PITFALLS |
|---|---|---|
| Baseline required `Req0` (7,941.05 h) | 7.785346 | 7.79 |
| **Baseline slack** `12 − Req0` | **4.214654** | 4.21 |
| Programme at 1x volume `ReqP(1)` (4,454.74 h) | 4.367389 | 4.37 |
| **Removable at same output** `E = Req0 − ReqP(1)` | **3.417957** | 3.42 |
| Programme at 2x `ReqP(2)` (8,909.47 h) | 8.734778 | 8.73 |
| **Programme-added load** `ReqP(2) − Req0` | **0.949432** | 0.95 |
| 2x without programme (15,882.11 h) | 15.570691 | 15.57 |
| **Work avoided at 2x** | **6.835913** | 6.84 |
| of which avoided hires `15.570691 − 12` | 3.570691 | 3.57 |
| of which unused `12 − 8.734778` | 3.265222 | 3.27 |
| Reported "freed" `slack − added load` | 3.265222 | 3.3 |
| Reviewer max multiple at 85% / at 100% | 2.747637 / 3.232514 | 2.75 / 3.23 |
| Review hours per approved variant (with rework) | 0.1985 → 0.1114 (−43.9%) | 0.199 → 0.111 |

The PITFALLS figures hold; no correction to the bridge. Sampling + escalation hours (agent-created): baseline 193.68 h, 1x 581.05 h, 2x 1,162.11 h (with rework). Unseen auto-approved variants: 7,578.9 (baseline), 22,736.8 (1x, 60% auto), 45,473.7 (2x); counterfactual 2x at 20% auto: 15,157.9.

### Scenarios at defaults (prototype-computed; pieces hand-verifiable)
| | A (same team) | B (same output) | C (demand 2.0) |
|---|---|---|---|
| Output | `m_w`: W1 1.667, W2 2.0, W3 1.538, W4 2.222, W6 2.5, W7 1.667, W8 1.0, W9 2.0, W10 1.667; W5 volume 2.222 | 1.0 | 2.0 (W8 1.0) |
| Labour | cash change 0 | removable **39.018 FTE** (35.6 + 3.418), $5,852,693 | hires with programme **10.0**, without **79.571**; avoided **69.571**; unused 7.265 |
| Agency | fixed at $16.0M | −$3,600,000 | with $24.3M, without $31.5M, today $16.0M; avoided growth $7.2M |
| Run cost | $2,133,647 | $2,001,503 | $2,112,448 |
| Annual net (run rate) | **−$2,133,647** (no cash saving) | **+$7,451,190** | **+$15,523,156** (avoided cost $17,635,604 − run) |
| One-off | build $1.5M + change $0.36M | + severance $2,926,347 = $4,786,347 | build + change = $1.86M |
| Year 1 (50% realisation) | n/a | +$2,724,843 | n/a |
| Payback | none (cash) | 0.64 yr simple; **1.28 yr ramped** | 0.12 yr (see Pitfall 5) |
| Primary metric (org, before / after platform) | 1.648x / **1.600x** | D 200 → 148.98: **1.342x** | 1.323x |
| Portfolio W2/W4/W6/W9 | 2.182x / **1.989x** | | |

B run cost lines: platform 1,200,000 + tooling 450,000 + autonomy overhead 240,000 + inference 9,609 + variant AI 33,684 + escape 68,211 = 2,001,504. Per-pool C identity `avoided + unused = without − with` holds for all ten pools (gap 0). C per pool avoided FTE: W1 4.0, W2 12.0, W3 15.4, W4 10.0, W6 9.0, W7 3.2, W8 0, W9 6.0, W10 6.4, W5 3.5707 (sum 69.5707).

### Max sustainable multipliers (ECON-11)
Per pool `1/(1 − r_eff)` as in the table above; reviewers **2.747637** (flat 12 FTE at 85%), 3.232514 at 100%; no-programme reviewer limit `12 / 7.785346 = 1.541`. Uniform: **1.0** (W8 traffic) / **1.5385** (W3, excluding W8). Binding role per workflow reported as `binding: 'pool' | 'traffic' | 'review_gate'`.

### Sensitivity (org A multiple after platform; scenario net)
| Move | A org | A net | B net | B removable FTE | C net |
|---|---|---|---|---|---|
| base | 1.600 | −2.134M | 7.451M | 39.02 | 15.523M |
| adoption 0.5 | 1.187 | −1.996M | 2.549M | 18.11 | 7.228M |
| escape ×0.5 / ×3 | 1.600 | −2.058M / −2.437M | 7.485M / 7.315M | 39.02 | 15.591M / 15.250M |
| inference ×0.5 / ×5 | 1.600 | −2.125M / −2.203M | 7.456M / 7.413M | 39.02 | 15.532M / 15.449M |
| review overhead ×0.5 / ×2 | 1.761 / 1.372 | −2.047M / −2.322M | 8.391M / 5.392M | 44.51 / 26.84 | 16.633M / 12.781M |

Ranking by B net swing: adoption (−4.9M), review overhead (+0.94M / −2.06M), escape (+0.03M / −0.14M), inference (+0.005M / −0.039M). Inference is the smallest bar; that is the finding.

### Scale vs programme decomposition (ECON-06, INV-9), corrected v1 slice
| Quantity | Baseline | 2x, baseline assumptions (scale) | 2x with programme | Scale share |
|---|---|---|---|---|
| Total activity cost | $6,537,116 | $9,878,142 (+$3,341,026) | $9,146,668 (programme −$731,474) | closes: 3,341,026 − 731,474 = 2,609,553 |
| Cost per approved asset | $163.43 | $123.48 | $114.33 | **81.4%** of the −$49.10 (uncorrected: 64.2%) |
| Brief-to-live | 11.85 d | **undefined** (utilisation 110.3%, over capacity) | 7.52 d | scale effect is `null`, not a number |

The speed decomposition cannot close numerically because 2x without the programme exceeds reviewer capacity; the test asserts closure for finite metrics and `null` (with reason `over_capacity`) for brief-to-live.

## v1 figures that move (before → after)

Activity view, corrected defaults (`reviewer rate 125`, `concept = 40 h × 93.75 + 1,200`). [VERIFIED: scratch copy of the repo]

| Figure | Before | After |
|---|---|---|
| Cost per approved asset, baseline / 2x | $64.71 / $45.26 | **$163.43 / $114.33** (change −30%, unchanged) |
| Cost per campaign-market | $12,943 / $9,052 | $32,686 / $22,867 |
| Total production-attributable cost | $2.59M / $3.62M | $6.54M / $9.15M |
| Delta (2x − baseline) | $1.03M | $2.61M |
| Share of marketing budget | 3.3% / 4.6% (+1.3 pts) | 8.4% / 11.7% (+3.3 pts) |
| Components (generation / review / rework per asset) | 34.21 / 17.26 / 3.22 → 22.06 / 9.68 / 1.58 | 127.96 / 21.58 / 3.87 → 88.35 / 12.11 / 1.94 |
| Unchanged | brief-to-live, AI spend, utilisation, break-even, capacity floor, total-cost change (+40%) | same |
| Sensitivity top five (same order) | markets +18.3/−12.2, mconcept ∓9.4, auto2 ∓5.8, minutes ∓4.9, yield +6.7/−1.3 | markets +21.7/−14.5, mconcept ∓3.7 (agency fee only), auto2 ∓2.9, minutes ∓2.4, yield +3.3/−0.7 |

Legacy scenario rows (cash view, change cost on 120 FTE):

| Row | Redeploy | Hold | Reduce |
|---|---|---|---|
| Production cost change (was activity, now cash external) | $1,032,041 → **$935,199** | −$53,579 → **+$295,053** | $1,032,041 → $935,199 |
| People cost change | $0 | $0 | −$489,783 |
| One-off change cost | $396,000 → $360,000 | same | same |
| First-year net | $1,428,041 → **$1,295,199** | $342,421 → **$655,053** | $938,258 → **$805,416** |

44 claims move (`cpcm-*`, `cpa-*` incl. six component pairs, `total-cost-*`, `budget-share-*`, `calc-cost_per_asset-*`, `calc-cost_per_campaign_market-*`, `calc-total_cost-*`, `calc-budget_share-*`, `calc-scen-production_cost_change`, `calc-scen-first_year_net`, ten `calc-sens-*`, seven `calc-maths-cost*`) and 59 spans. After correction the `calc-sens-*` ids that exist depend on the top-five ranking, which keeps the same five keys.

Tests that go red when the correction is applied (19 in the scratch run; fix in the same commit): `calc-page` results table, scenario table, sensitivity table, maths details, `.believe`; `page` "every data-fig matches data.js display"; `model` present(defaults) goldens (lines 74, 178–179, 213, 221), scenarioOutcomes goldens (357–368), scenario/sensitivity finite (454); `data` "derived claims equal compute()" (lines 93–94 pins) and assumption count; Figure 8 static markup and bars; `crosscheck` (register rows for two new assumptions, `defaults`); route-effect and identity tests. `test/calc.test.js` stays green (own fixtures). Also update `test/evidence.test.js` `EXPECTED` when per-side evidence lands.

## Defaults register (range-setting pass)

Grade/evidence per CONTEXT: baseline/org-description values `illustrative`, programme effects `hypothesis`. Basis lines are the one-liners to put on the register row.

| Input | Default | Range | Grade / evidence | Basis and anchor |
|---|---|---|---|---|
| Productive hours per marketer | 1,600 | 1,500–1,800 | Modelled / illustrative | 2,080 contract hours − ~200 leave − ~280 non-attributable [ASSUMED, FEATURES s4]; no public benchmark |
| Loaded cost per FTE | $150,000 | — | existing | BLS marketing managers $166,790 and specialists $78,760 (May 2025) with wages 70.0% of compensation (ECEC June 2026) give ~$154k at a 1:2 mix [CITED: FEATURES s1a] |
| Reviewer hours / rate | 1,200 h / **$125** | — | derived | fatigue cap (existing) ÷ loaded cost; one price |
| Agency cost per FTE-equivalent | $200,000 | 150k–300k | Modelled / illustrative | An agency billing median near $185/h from a founder survey (LOW, vendor blog, weak) × 1,600 h ≈ $296k; $200k (= $125/h) is the conservative, lower figure [CITED: webtonic.io/blog/pricing-statistics via search 2026-10-25, LOW]. Lower $ per FTE-equivalent means more agency FTE-equivalents in the denominator |
| Out-of-scope assistance | 10% | 0–15% | Modelled / hypothesis | Task-level assistance band 25–40% discounted to org level; FEATURES s3 (Humlum & Vestergaard 2.8%, St. Louis Fed 1.4–5.4%) [CITED: FEATURES s3] |
| Review/exception overhead | L2 20%, L3 8% (L4 = L3) | 15–25% / 5–10% | Modelled / hypothesis | FEATURES s4 [ASSUMED]; L1 0 because assistance output is checked as part of the task |
| Net hour reductions | per table | per table | Modelled / hypothesis | FEATURES s4; task RCTs (−14% to −55%) are an upper anchor only for execution hours [CITED: FEATURES s3] |
| Agency reduction share | 0.40 on W1, W4, W6, W7, W9, W10; 0 on W2, W3, W8 | 0.30–0.50 | Modelled / hypothesis | FEATURES s5 (30–50% of ~$9M); W3 creative stays at 0 (not a 2x source) |
| Autonomy levels at 12 months | W1 L2, W2 L3, W3 L2, W4 L3, W5 L3, W6 L3, W7 L2, W8 L2, W9 L3, W10 L3 | — | Modelled / hypothesis | FEATURES s4 "feasible level"; where a range was given (W1, W3, W7) the lower, more review-heavy level is used |
| Autonomous share at L3 | 60% | 40–85% | Modelled / hypothesis | same hypothesis as the v1 gate (auto-approval 60%); Intercom reports 19.2% / 28.4% for code (company-reported) [CITED: data.js `ref-auto-approved-share`] |
| Adoption (steady state) / year-1 realisation | 1.0 / 0.5 | 0.5–1.0 | Modelled / hypothesis | CONTEXT; no adoption rates found (existing `asm-adoption-design`) |
| Demand multiplier (C) | 2.0 | 1.5–3 | Modelled / illustrative | CONTEXT; Adobe vendor survey: 71% expect >5x content demand (interested party) [CITED: FEATURES s2b] |
| Traffic growth (W8 cap) | 1.0 | 1.0–2.0 | Modelled / illustrative | Doubling tests without traffic halves power per test (Kohavi; Lewis & Rao, in register) [CITED: FEATURES s4 W8] |
| Build/integration (one-off) | $1.5M | 0.75–3.0M | Modelled / hypothesis | ~6 platform-engineering FTE-years ($1.2M) + $0.3M integration, eval-set labelling and security review [ASSUMED]. Vendor quotes for a single first agent run $25k–$150k (LOW, sellers of agent builds) and do not scale to a platform [CITED: search 2026-10-25] |
| Platform team | 6 FTE × $200,000 | 4–10 FTE | Modelled / hypothesis | Roles [ASSUMED]: 2 platform engineers, 2 workflow owners/agent operators, 1 eval curator, 1 security/governance. BLS software developers median **$135,980** (May 2025) ÷ 0.70 ≈ $194k loaded [VERIFIED: bls.gov/ooh/computer-and-information-technology/software-developers.htm, fetched 2026-10-25] |
| Autonomy review overhead | 24 h per month per autonomy workflow + 16 h per month judge calibration = 1,920 h ($240k at $125) | ×0.5–×2 | Modelled / hypothesis | PITFALLS 1.5 (eval curation, judge calibration are recurring human cost); hours [ASSUMED] |
| Escape rate | 0.3% of unseen auto-approved variants | ×0.5–×3 | **Speculative** / hypothesis | PITFALLS 1.5 suggests 0.1%, 0.5%, 2% as the range; 0.3% is invented, measured by sampling audits in the pilot |
| Cost per escape | $1,500 | $500–$5,000 | **Speculative** / illustrative | Blend 90% minor (≈ 3 labour hours + re-issue ≈ $300) and 10% serious ($12,000 pull, re-buy, triage) ≈ $1,470 [ASSUMED]. A single fraud-detection vendor blog claims $340k per brand-safety incident with no method (LOW); do not use as a default [CITED: search 2026-10-25] |
| Severance and exit | 6 months of loaded cost per removed FTE, B only | 0–12 | **Speculative** / hypothesis | Varies by jurisdiction; works-council duties may apply (not researched, LOW) |
| Token prices, frontier tier | **$4 in / $20 out per MTok** | ×0.5–×5 (the ×2.5 top tier is $10/$50) | Modelled / illustrative | Anthropic Opus 5.5 $4/$20 and OpenAI gpt-5.6-sol $4/$20 per official pages, fetched 2026-10-25 [VERIFIED: platform.claude.com/docs/en/about-claude/pricing; developers.openai.com/api/docs/pricing] |
| Token prices, small tier | **$0.10 in / $0.50 out per MTok** | ×0.5–×5 | Modelled / illustrative | Anthropic Haiku 5.5 (prompts up to 100k; $0.50/$2.50 above) and OpenAI gpt-6-luna $0.10/$0.50 [VERIFIED, same pages, 2026-10-25] |
| Token modifiers (not in default) | cache reads about 0.05–0.1x input; Batch API −50%; newer Claude tokenizers produce ~30% more tokens for the same text | | note | [VERIFIED: Anthropic pricing page 2026-10-25]. Defaults use list price, uncached, so they err high; the tokenizer note errs the other way |
| Run profile per workflow (steps, tokens in/out per step, retry share, judge calls) | per prototype table (e.g. W2 25 steps, 25k in, 1.5k out, 20% retry, 2 judge calls) | ×0.5–×5 on price | Modelled / illustrative | Agents use ~4x and multi-agent systems ~15x the tokens of chat [CITED: anthropic.com/engineering/multi-agent-research-system, via search 2026-10-25, MEDIUM, single origin]; profiles [ASSUMED] |
| Judge call | 15k in, 1k out, frontier tier | | Modelled / illustrative | [ASSUMED]; judge reliability caveats in PITFALLS 8 |
| Per-step success (diagnostic) | 0.95 (range 0.90–0.99); steps between gates 8; retries 0 | | Modelled / illustrative | Success compounds as p^steps; tau-bench reports pass^8 below 25% in retail for state-of-the-art function-calling agents [CITED: arxiv.org/abs/2406.12045, fetched 2026-10-25]; Ord/METR half-life reading in PITFALLS 7 |
| Cycle time days, current → agent | W1 15→8, W2 10→5, W3 12→9, W4 15→5, W6 3→0.5, W7 14→6, W8 21→18, W9 5→1, W10 7→2; W5 from the queue bounds | | Modelled / hypothesis | [ASSUMED] no benchmark; regulated-sector review durations (Vodori 7.6 d review, 14.8 d job; vendor) only as context [CITED: FEATURES s2b] |
| Per-workflow cost of tooling | none (platform lines are programme-level) | | | avoids double counting AI/software in rows |

**Page neutrality for these sources:** the pricing pages, BLS and tau-bench belong in the register (s15) as new `sources` rows (pricing pages: `publisherType: 'vendor'`, evidence `observed`, flag `vendor-claimed` under the WR-02 rule; BLS: government, benchmark; tau-bench: academic, benchmark/Modelled given transfer distance). Page body names tiers only ("a frontier model", "a small model"). Adding sources changes the pinned count 45 and the source-count test.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| One flat cost per master concept | Internal hours at one price + explicit agency fee | This phase | Cost per asset roughly 2.5x; scale share of the fall 81% |
| Two prices per reviewer hour ($100 activity, $125 payroll) | One price, $125 | This phase | Review cost +25% in the activity view |
| "Freed FTE" = current − required | Baseline slack, programme load, avoided hires, removable FTE as separate lines | This phase | Removable at same output 3.42 FTE, not 7.63 |
| Frontier token price $15/$75 (Opus 4.1 era) | $4/$20 frontier, $0.10/$0.50 small (Oct 2026) | 2025–2026 | Inference is immaterial at bounded usage |

**Deprecated/outdated:** Opus 4.1 and earlier ($15/$75) and Claude Sonnet 4 are retired on Anthropic's own platform. [VERIFIED: pricing page 2026-10-25]

## Plan split (waves keep `node --test` and crosscheck green on every commit)

| Plan | Wave | Goal | Files | Notes |
|------|------|------|-------|-------|
| **06-01** calc.js hardening (additive) | 1 | `reviewer_fte_required` per side via `pick()`; `capacity_bridge`; `effects` (scale vs programme, `null` btl with `over_capacity`); optional `concept_internal_hours`/`marketer_rate_per_hour` with absent = 0; `cost_cash`/`cost_internal`; `erlangC` and pooled brief-to-live; `chainSuccess`; rework regression test | `calc.js`, `test/calc.test.js` (additions only), `test/economics.test.js` (new) | No figure moves; `model.js` rework reads via `sc()`; rework regression test goes here (red first, then fix). Goldens: reviewer bridge, Erlang hand checks, decomposition closes |
| **06-02** portfolio engine | 2 | `workflows.js`: validation, `workflowModel`, pools, bridge, scenarios A/B/C, ledger with `counted_in` and `checkLedger`, primary metric, investment, sensitivity, max multipliers, funding; `calc.js` re-export | `workflows.js` (new), `calc.js` (one `export *` line), `test/workflows.test.js` (new) | Test-local defaults (as `calc.test.js`); every golden in this document; INV-1–INV-11 as named tests; no `data.js` or page change |
| **06-03** v1 figure migration (atomic) | 2 (parallel with 06-02, disjoint files) | Flip defaults: `asm-reviewer-rate` derived 125, add `asm-concept-hours`, `asm-marketer-rate`, relabel `asm-master-concept-cost` as the agency fee; legacy `scenarioOutcomes` to the cash view; change cost on `marketers`; fix prose (hours-fall sentence, "small line", D3 funding, "fully loaded", Hold note); regenerate figures; register rows for the two new rows | `data.js`, `model.js`, `fields.js`/label, `index.html`, `test/{data,model,calc-page,page,figure,crosscheck,evidence}.test.js` | One commit, before/after table in SUMMARY; run the 19-test list; share-link semantics note |
| **06-04** engine inputs and per-side evidence | 3 | `kind:'engine'` assumptions (about 40 rows: 22 global, 18 per-workflow), `engineContext()`, register rows via script, `JUSTIFIED_UNREFERENCED` entries or cites, new sources; per-side evidence (`evidence_sides`, trace variants `id#baseline`/`id#scaled`, `sampling_rate`/`escalation_rate` per-side) | `data.js`, `index.html` (register), `scripts/crosscheck.mjs`, `scripts/gen-register-rows.mjs`, `test/{data,evidence}.test.js` | Update pinned counts (62 assumptions, HYPOTHESIS list, source count 45), baseline claims become illustrative, behavioural evidence test moves sides separately |
| **06-05** generated claims and closure | 4 | `engineClaims(ctx)` (calc-style paths into `economics()`, id `econ-…`, built before the evidence block), trace extended to engine inputs, "no hand-typed model numbers" test, funding claims, formats (`x2`, `months1`), SUMMARY, requirements closure | `data.js`, `format.js`, `test/{data,evidence,economics}.test.js` | Claims not on the page need no register row but their `ref` must exist; trace stays lazy |

Parallelism check: 06-02 touches `workflows.js`, `test/workflows.test.js` and one line of `calc.js` (06-01 already merged); 06-03 touches no `calc.js` logic. 06-04 must follow 06-03 (both edit `data.js` and the register). Within each plan, write the golden tests first (red), then implement.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | All workflow-level defaults (hours, reductions, agency shares, levels, cycle times, run profiles) are illustrative/hypothesis; none is benchmarked | Defaults register | Page numbers read as findings; mitigated by grades and ranges |
| A2 | W3 uses 35.2 h/unit (FEATURES says 35) so `F × 1,600 = hours` exactly | Roll-up | Changes W3 hours by 0.6%; goldens assume 35.2 |
| A3 | Scenario A holds agency cash fixed and does not require agency input for extra output | Pattern 4 | A's multiples are generous; flagged by `agency_budget_binds` and the switch |
| A4 | Primary metric excludes W5 from the output index and values units at in-house standard hours | Pattern 6 | CONTEXT definition is looser; org-wide figure moves a few points; author should confirm (Q3) |
| A5 | Platform team included in the agent-enabled denominator | Pattern 6 | Reports 1.60x not 1.65x; both are exposed |
| A6 | Reviewers are inside the 120 marketing FTE; change cost on 120 | Pitfall 10 | $396,000 vs $360,000 on the page; Q2 |
| A7 | 40 h per concept (locked) coexists with 35.2 h in W3 | Pitfall 2 | Visible inconsistency; Q1 |
| A8 | Erlang C with `floor(reviewer_fte)` servers is an acceptable pooled lower bound | Queue model | Real queues are specialist; presented as a bound |
| A9 | Per-unit inference profiles and the judge profile | Defaults register | Immaterial at current prices (≈ $10k/yr); ×5 sensitivity covers it |
| A10 | Escape rate 0.3%, cost per escape $1,500, severance 6 months | Defaults register | Speculative by design, separate lines |
| A11 | Agency $/FTE-equivalent $200k | Defaults register | Weak anchor ($185/h median is a vendor blog) |
| A12 | Build $1.5M and platform team of 6 | Defaults register | No benchmark for a marketing agent platform; vendor first-agent quotes are far lower |
| A13 | `counterfactual_funded_share` default 1.0 | Pattern 4 | C overstated if hires were never planned |
| A14 | Gartner "40% of agentic AI projects cancelled" was seen only in search snippets; not used | Sources | None (not used) |

## Open Questions

1. **Q1: 40 h per concept (v1 slice) vs 35.2 h (W3)?**
   - What we know: CONTEXT locks 40; FEATURES gives 35 h × 1,000 = 35,200 h.
   - What's unclear: whether the author accepts two numbers for one quantity.
   - Recommendation: build with 40 as locked and cross-explain in both basis lines; if the author prefers one number, set both to 35.2 (cost per asset baseline then about $152, not $163).
2. **Q2: Are the 12 reviewers inside the 120 marketing FTE?**
   - What we know: FEATURES and PITFALLS treat them as inside.
   - Recommendation: yes; change cost on 120; relabel the calculator field "Marketing FTE (including reviewers)" in Phase 9; add `reviewers ≤ marketers` validation.
3. **Q3: Primary metric weights.**
   - What we know: CONTEXT: units × frozen baseline standard hours, denominator in-house + agency FTE-equivalents. It does not say whether agency hours are in the numerator or whether W5 counts.
   - Recommendation: in-house standard hours, W5 excluded (rationale in Pattern 6); expose the pooled-hours figure and `max_uniform_multiplier` beside it; the engine's honest answer is org-wide 1.60x, portfolio 1.99x, uniform 1.0x. Update the "~1.4–1.5x / ~1.8x" expectation in THESIS-04 copy accordingly.
4. **Q4: Concept and claims review in W5 (FEATURES s4, +2 h × 1,000)?**
   - What we know: adding it moves baseline slack from 4.21 to 2.25 FTE and breaks the locked bridge goldens.
   - Recommendation: not in the Phase 6 default; optional input defaulting to 0 only if the planner wants it, listed as a known limitation.
5. **Q5: Should year-1 realisation also apply to C?** CONTEXT applies it to B only. Recommendation: B only; C is a steady-state counterfactual.
6. **Q6: Does the author want legacy `reduce` to keep cutting at the 2x requirement?** It credits 3.27 FTE of baseline slack. Recommendation: leave it labelled (Phase 9 maps it to B, which uses attributable 3.42 FTE at same output) and relabel the row "Reviewer capacity left unused (all of it was unused before the programme)".

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `node --test`, crosscheck, scripts | yes | v23.7.0 (22+ required) | — |
| Google Chrome | phase-end gates (`scripts/gates.sh`: smoke, a11y, print) | yes | `/Applications/Google Chrome.app` | none needed per commit; known CDP flake retried once |
| npm / registry | none | not needed | — | no packages |
| Network | web research only | yes | — | — |

**Missing dependencies with no fallback:** none. **With fallback:** none.

## Security Domain

`security_enforcement` is not set in `.planning/config.json` (treated as enabled). This phase is pure client-side arithmetic with no network, secrets, auth or storage.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication / V3 Session / V4 Access Control | no | static page, no accounts |
| V5 Input Validation | yes | every engine entry validates and returns `{ ok:false, errors }`, never throws and never returns NaN/Infinity (existing `compute()` pattern, `allFinite` guard); share-link values are parsed by existing `state.js` |
| V6 Cryptography | no | none |
| V12 Files and resources / V14 Config | yes (minor) | no `eval`, no dynamic import of user data; hash params only via `URLSearchParams` |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Crafted share link producing non-finite or enormous values | Tampering / DoS | validation plus `allFinite` last-resort guard; add the new engine outputs to the guard |
| Misleading numbers through a silent default | Repudiation (integrity of claims) | grades, evidence classes, generated claims, crosscheck |

## Sources

### Primary (HIGH confidence)
- Repository, run 2026-10-25: `site/js/calc.js`, `model.js`, `data.js`, `fields.js`, `format.js`, `test/*.test.js`, `scripts/crosscheck.mjs`, `scripts/gates.sh`; scratch copy of the repo with the proposed correction (19 failing tests, scenario and sensitivity values)
- Anthropic pricing page, fetched 2026-10-25: https://platform.claude.com/docs/en/about-claude/pricing (Opus 5.5 $4/$20, Sonnet 5.5 $2/$10, Haiku 5.5 $0.10/$0.50 up to 100k prompts, Fable 5.1 $10/$50; cache hits 0.05–0.1x; Batch −50%; ~30% more tokens for the same text on 4.7+ tokenizers)
- OpenAI pricing page, fetched 2026-10-25: https://developers.openai.com/api/docs/pricing (gpt-5.6-sol $4/$20, gpt-6-astra $10/$50, gpt-6-luna $0.10/$0.50, gpt-5.4 $2.50/$15)
- BLS software developers, fetched 2026-10-25 (median $135,980 May 2025): https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm
- tau-bench abstract, fetched 2026-10-25 (pass^8 below 25% in retail): https://arxiv.org/abs/2406.12045
- `.planning/research/FEATURES.md` s1–s9 and `PITFALLS.md` s1 (inputs, defaults and invariants; every figure re-run)

### Secondary (MEDIUM confidence)
- Anthropic engineering, multi-agent research system (agents ~4x, multi-agent ~15x tokens of chat), confirmed via two search results that trace to the same post: https://www.anthropic.com/engineering/multi-agent-research-system

### Tertiary (LOW confidence)
- Agency billing rate median ~$185/h (founder survey quoted by a vendor blog): https://www.webtonic.io/blog/pricing-statistics (search result, method not seen)
- Vendor quotes for building a first AI agent ($25k–$150k): arkasoftwares.com, gigabit.agency, codewave.com (sellers of agent builds)
- A fraud-detection vendor's claim of $340k per brand-safety incident (no method; not used)

## Appendix: reference prototype (research only, not production code)

The goldens above come from this logic (inputs from `defaultInputs()`/`defaultAssumptions()`; `compute()` supplies volumes and reviewer hours). Production code should reproduce its outputs, not copy it.

```js
// Rules: marketer pools target utilisation 1.0, reviewers 0.85 x 1,200 h; adoption a interpolates the 2x auto-approval share;
// r_eff = a*(r - ov*(k-1)); A uses in-house capacity multiples; B removable = max(0, F*r_eff) if >= 1 FTE; C hires/unused per pool.
const wfState = (w, g) => {
  const ovd = g.ov[w.lvl], r = g.adoption * (w.r - ovd * (g.ovMult - 1)), s = w.s * g.adoption;
  const cap = 1 / (1 - r);                                   // pool capacity multiple
  const mA = Math.min(cap, w.traffic ? g.traffic : Infinity, w.gated ? revMax : Infinity);
  return { r_eff: r, s_eff: s, cap, mA, hBase: w.u * w.h };
};
// Reviewer pool (FTE at target): Req = review_hours*(1+rework)/(1200*0.85); Req0 from compute(m=1).baseline;
// ReqP(m) = ReqP(1)*m from compute(m=1).scenario; revMax = F/ReqP(1)  (2.747637 at defaults)
// Index: I = sum(units*h*m_w) + 28*1600/(1-u*a); D = 120 + sum(agency)/200000 (+6 platform when agent-enabled)
// multiple = (I_s/D_s)/(I_0/D_0), I_0 = 128,000 + 44,800 = 172,800, D_0 = 200
// Run cost = 6*200000 + (tooling.scaled - tooling.baseline) + overheadHours*125 + inference + G*variant_cost.scaled + escape
// escape(m) = G(m)*(auto_agent - auto_base)*(1 - sampling - escalation)*escape_rate*escape_cost
```

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, no packages, existing runner.
- Architecture and formulas: HIGH, run against the repo; reviewer bridge reproduces PITFALLS exactly.
- Blast radius of the v1 correction: HIGH, measured on a scratch copy.
- Workflow defaults, cost items and escape figures: LOW by construction (illustrative or hypothesis); token prices MEDIUM-HIGH (official pages, dated).
- Pitfalls: HIGH for the repo-specific ones, MEDIUM for market facts.

**Research date:** 2026-10-25
**Valid until:** 2026-11-25 for token prices (fast-moving); the engine design is stable until the CONTEXT decisions change.
