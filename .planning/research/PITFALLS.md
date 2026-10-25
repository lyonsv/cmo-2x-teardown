# Pitfalls Research and Model Audit: v2.0 Autonomous Marketing Operations

**Domain:** Evidence-graded static executive report with a tested labour and financial model (agentic marketing operations)
**Researched:** 2026-10-25
**Confidence:** HIGH for the model audit. Every number below was recomputed by running `site/js/calc.js` and `site/js/model.js` against `site/js/data.js` defaults. MEDIUM for the argument pitfalls, which rest on primary sources plus some secondary summaries (flagged inline).

**Remit:** brief sections 7, 11 and 12 and the "Avoid" list (`.planning/v2.0-BRIEF.md:225-283, 378-432`).

---

## Part 1. Model audit (calc.js, model.js, data.js)

### 1.0 The defaults, recomputed

All figures come from `compute(defaultInputs(), defaultAssumptions())` and `scenarioOutcomes()` (Node, 2026-10-25).

| Quantity | Baseline (1x) | 2x | Source line |
|---|---|---|---|
| Campaign-markets a year (per quarter) | 200 (50) | 400 (100) | calc.js:108-111 |
| Master concepts a year | 1,000 | 1,414 | calc.js:112 |
| Approved variants V / generated G | 40,000 / 42,105 | 80,000 / 84,211 | calc.js:115-116 |
| Auto-approval share | 20% | 60% | data.js:605 |
| Human-touch share h | 82% | 46% | calc.js:121 |
| Review hours, before rework | 6,905 | 7,747 | calc.js:125 |
| Review hours, with 15% rework | 7,941 | 8,909 | calc.js:127 |
| Reviewer capacity (12 FTE x 1,200 h) | 14,400 | 14,400 | calc.js:126, data.js:588, 615 |
| Utilisation | 55.1% | 61.9% | calc.js:127 |
| Reviewer FTE required at the 85% target | 7.79 | 8.73 | model.js:217-219 |
| Production cost | $2,588,589 | $3,620,631 | calc.js:138 |
| Cost per approved asset | $64.71 | $45.26 | calc.js:150 |
| Brief-to-live | 11.8 days | 7.5 days | calc.js:144-145 |
| AI spend | $38,421 | $340,421 | calc.js:141 |

### 1.1 Review-capacity reconciliation (the brief calls this out at `.planning/v2.0-BRIEF.md:271`)

**The apparent contradiction.** The calculator reports "Reviewer FTE freed: 3.3" (`site/index.html:986-987`, `model.js:239`). The capacity prose says "With the gate, human review hours fall" (`site/index.html:545`). Yet total human review hours **rise** from 6,905 to 7,747 a year (+842 h, +12.2%), or from 7,941 to 8,909 with rework (+968 h).

**The reconciliation, worked through.**

| Step | Hours (with rework) | Reviewer FTE at 85% target (1,020 productive h each) |
|---|---|---|
| Capacity: 12 reviewers x 1,200 h | 14,400 | 12.00 |
| Baseline demand (1x, 20% auto) | 7,941 | 7.79 |
| **Slack that exists today, before any programme** | | **4.21** (12 − 7.79) |
| 2x demand with the programme (60% auto) | 8,909 | 8.73 |
| **Extra review load the programme's 2x adds over today** | +968 | **+0.95** |
| Reported "freed" = slack − extra load | | 3.27 (shown as 3.3) |
| 2x demand without the programme (auto stays 20%) | 15,883 | 15.57 (110.3% utilisation, over capacity) |
| **Review work avoided by the programme at 2x** | 6,974 | **6.84** (15.57 − 8.73) |
| of which avoided hires (above the 12 on staff) | | 3.57 (15.57 − 12) |
| of which slack that is still unused | | 3.27 |
| Same output (Hold: 1x volume, 60% auto) | 4,455 | 4.37 |
| **Hours genuinely removable by the programme at the same output** | 3,486 | **3.42** (7.79 − 4.37) |

Plain reading:

1. **All of the "3.3 FTE freed" is baseline slack.** The model starts reviewers at 55% utilisation (`data.js:588` 12 FTE against `data.js:615` 1,200 h). The programme does not free reviewers at 2x. It consumes about 1 FTE of existing slack (+0.95), and the rest was idle before the programme began.
2. **The Reduce scenario credits the programme with baseline overstaffing.** Reduce cuts 3.27 FTE for −$489,783 (`model.js:240`). A CFO could cut 4.21 FTE today, with no AI, for about −$632k. At 2x the programme's own effect on reviewer labour is **+0.95 FTE (about +$142k)**, not a saving.
3. **The programme's real value at 2x is avoided cost, not freed cost.** Without it, 2x needs 15.57 reviewer FTE and runs over capacity. With it, 8.73. That 6.84 FTE (3.57 avoided hires plus 3.27 of slack kept spare) is the Scenario C number ("growing demand, limited hiring").
4. **The programme's efficiency at constant output is 3.42 FTE (3,486 h a year)**. That is the Scenario B number ("same output, lower cost"), and it is only cash if the headcount is actually removed.
5. **Per-unit and total move in opposite directions, and both are true.** Review hours per approved variant fall from 0.199 to 0.111 (−44%). Review hours per campaign-market fall from 39.7 to 22.3. Total hours rise 12% because volume doubles. The page must show both rather than say "hours fall".
6. **The headroom is large.** At flat reviewers, utilisation reaches the 85% target at **2.75x** and 100% at **3.23x**. Reviewers are not the binding constraint at 2x under the defaults. The model has no other constraint (marketer hours are not modelled, see 1.5), so **the "2x" headline is an input (`data.js:10` `SCENARIO.multiplier = 2`), not a derived capacity result.**

**Correction (testable):**
- Add `reviewer_fte_required` for both sides to `calc.js side()` (move it out of `model.js:217`). Then add a `capacity_bridge` output: `{ slack_baseline_fte, programme_load_fte, avoided_fte_at_scale, avoided_hires_fte, removable_fte_same_output }`. Its counterfactuals run inside `compute()`: scaled volume with baseline assumptions, and baseline volume with scaled assumptions.
- Test: `slack_baseline_fte − programme_load_fte === reported_freed_fte` (to 1e-9). Also `avoided_fte_at_scale === avoided_hires_fte + max(0, reviewer_fte − required_scaled)`.
- Rewrite `site/index.html:545` to say that review hours per variant fall 44% while total review hours rise 12%, and that 2x fits only because reviewers start at 55% utilisation.
- Relabel the s11 row "Reviewer FTE freed (or needed)" (`model.js:314`) as "Reviewer capacity unused at 2x (of which X was unused before the programme)".

### 1.2 Where labour and agency savings are, or could be, double counted

| # | Location | Mechanism | Size at defaults |
|---|---|---|---|
| D1 | `calc.js:132-133` and `model.js:240`, summed at `model.js:242` | Reviewer labour is counted twice. Production cost prices review hours at `reviewer_rate_per_hour` ($100, `data.js:617`). The people line separately prices reviewer FTE at `loaded_fte_cost` ($150k, `data.js:1022`). `first_year_net` adds both. In Reduce the review-hour delta (+$84,211 review, +$12,632 rework re-review) is not cash, because salaried reviewers absorb it. | Reduce net overstated by about **$97k** (reported $938,258; cash-consistent about $841k). In a "Hold + cut" B scenario the same flaw **overstates savings**: Hold's production delta already contains −$303,158 review and −$65,684 rework, the same hours an FTE cut would bank again. |
| D2 | `data.js:617` vs `data.js:1022` and `data.js:615` | Two prices for one reviewer hour. $100/h in production cost. $150,000 / 1,200 productive h = $125/h in the people line. 12 FTE payroll is $1.8M, but priced review plus rework re-review is only $794k at baseline. | About $1.0M of reviewer payroll is invisible in "fully loaded" cost per asset |
| D3 | `data.js:640-642` (`asm-reallocation`), `site/index.html:29, 134` | The +$1.03M rise is said to be funded "chiefly [from] the agency and production fees that AI-derived variants replace". Inside the model, AI-derived variants replace only the variant line: $168,421 falls to $67,368, a **$101,053** saving, **which is already netted inside the +$1.03M**. Claiming the agency saving again as the funding source counts it twice, and it covers about 10% of the rise. | Funding source is unidentified for about $930k |
| D4 | `data.js:619` master concept cost vs `data.js:578` 120 marketing FTE | It is undefined whether $1,200 a concept is agency cash or internal marketer time. If internal, it duplicates marketer payroll. If agency, the +414 concepts a year add **+$497k of agency spend**, contradicting "funded by shrinking agency fees". | +$497k, direction unknown |
| D5 | `model.js:241` | Change cost applies in every scenario to all 132 FTE ($396k), including Hold. Harmless now, but v2 adds build cost and adoption ramp. Training must not be counted in both "change cost" and "build/enablement cost". | $396k |
| D6 | Future portfolio (brief §10, `.planning/v2.0-BRIEF.md:372`) | Several workflows (content, localisation, experimentation) will each claim the same reviewer pool, the same marketer hours and the same agency line. | Unbounded unless pooled |

**Double-counting invariants (write these as tests in `test/calc.test.js` or a new `test/economics.test.js`):**

- **INV-1 Hour conservation.** For every workflow w and role r: `H_base[w,r] = H_removed + H_redeployed + H_absorbed_by_growth + H_unused_after`. Each hour lands in exactly one bucket. The test sums the buckets and compares (tolerance 1e-6).
- **INV-2 One price per hour.** A role's cost is either activity-priced (hours x rate) or payroll-priced (FTE x loaded cost) within a single scenario total, never both. Test: in the cash view, `cost.review === 0` for salaried roles. `hourly_rate === loaded_fte_cost / productive_hours_per_fte` unless an explicit `rate_basis` field says otherwise.
- **INV-3 Capacity is not cash.** In Scenario A (same team, more output) `cash_labour_change === 0`. Freed hours appear only as `capacity_redeployed_hours`.
- **INV-4 Attribution excludes baseline slack.** `removable_fte_attributable = required_fte_base − required_fte_programme_same_output`, never `current_fte − required_fte_programme`. Test at defaults: 3.42, not 7.63.
- **INV-5 Savings bounded by the line they come from.** `agency_avoided[w] ≤ agency_base[w]`, `reallocation_source ≤ named_line_base − named_line_new`, and `removable_fte[r] ≤ fte_assigned[r]`.
- **INV-6 Netted once.** Any saving already inside `cost.total` delta (variant cost, review hours) cannot also appear as a funding source, a separate "agency avoided" line or an FTE saving. Implement each saving as one tagged ledger row with a `counted_in` field, and fail if a row id is summed in more than one total.
- **INV-7 Avoided hires are exclusive with redeployed capacity.** `avoided_hires_fte = max(0, required_without_programme(demand) − fte_current)`, and `avoided_hires_fte + unused_after_fte = required_without − required_with`.
- **INV-8 Portfolio pooling.** Σ over workflows of hours removed for role r ≤ total hours of role r (for example 120 marketing FTE x productive hours). Shared pools (reviewers) are drawn down once. The test adds a second workflow that touches the same pool and checks the sum.
- **INV-9 Decomposition closes.** `Δcost_total = Δscale (2x volume, baseline assumptions) + Δprogramme (2x, scaled minus baseline assumptions)`, exactly. Same for cost per asset.
- **INV-10 Scenario B ≤ Scenario A.** Cash saved at constant output ≤ hours freed at constant output x loaded rate.
- **INV-11 Identity (exists, keep).** Multiplier 1 with scaled == baseline assumptions gives every delta 0 and every bucket 0.

### 1.3 Headline numbers that conflate capacity, efficiency and effectiveness

| Number (page) | What it actually measures | Conflation | Correction |
|---|---|---|---|
| **50 → 100 campaign-markets per quarter** (`site/index.html:29`, `data.js:756-757`) | `40 x 5 / 4 x multiplier`. The 2x is the input `SCENARIO.multiplier` (`data.js:10`), so 100 is a definitional identity. | Presents a **target** as a **capacity** finding. It is not effectiveness either: under a flat $78M budget, media per campaign-market halves unless media grows, and added markets are usually smaller and lower-yield. | Label it "target volume tested by the model". Derive a separate **max sustainable multiplier** from the binding constraint across all modelled roles (today: reviewers only, 2.75x at 85%). Add an explicit `media_per_campaign_market` dilution line, or state that it is held out of scope. |
| **Cost per approved asset $64.71 → $45.26 (−30%)** (`data.js:763-765`) | Activity-priced cost / approved variants | **64% of the fall is scale, not efficiency.** At 2x with *baseline* assumptions (no AI, no gate change) cost per asset is already $52.22 (−19%), because each concept spreads over 56.6 variants instead of 40 when markets grow. Only −$6.96 of −$19.46 (36%) is the programme. It also omits idle reviewer payroll and all marketer labour, so "fully loaded" (`model.js:145`) is wrong. | Show the decomposition (INV-9). Rename "fully loaded" to "activity cost per approved asset" or genuinely load it. Route matters: on markets-only the no-AI scale effect alone is −31%; on campaigns-only it is −3%. |
| **Cost per campaign-market −30%** (`data.js:760-762`) | Identical ratio to cost per asset, because variants per campaign-market (25 x 8 = 200) is constant | Looks like independent corroboration but is the same number | Say so once, or drop one |
| **Production cost +40% / +$1.03M "reallocated from agency fees"** (`data.js:766-772, 640-642`) | +$497k more concepts, +$450k tooling, +$104k rights, +$84k review, −$101k variants | The rise is mostly **volume** (concepts, rights) plus **tooling**. The funding story names a line the model shows saving $101k (D3). | Model `agency_spend` as an explicit baseline line with its own reducible share. Fund the rise from named lines with INV-5, or state the budget is +1.3 points. |
| **Brief-to-live 11.8 → 7.5 days (−36%)** (`data.js:758-759`, `calc.js:144-145`) | `build_days + (1+r) x queue(review)` | **The whole improvement is `asm-build-days` 8 → 3** (`data.js:633`), a Modelled assumption with no benchmark. The review component *worsens*, 3.85 → 4.52 days, as utilisation rises. The queue term is an M/M/1 formula applied to a 12-reviewer pool, which overstates waiting for pooled servers. | Show build vs review components. Grade build-days as a hypothesis for the pilot to test. Consider an M/M/c (Erlang C) approximation, or label the queue term "single-queue upper bound". |
| **Break-even auto-approval 41%, floor 29%** (`data.js:776-778`) | Auto-approval share needed for 85% / 100% utilisation at 2x | Sound, but depends on the 55% baseline slack (1.1) | Show beside the slack figure |
| **AI spend $38k → $340k (8.9x)** (`data.js:773-775`) | 60% of $0.80 per variant plus 50% of $600k tooling | Inference is a fixed share of a single-generation price. Agentic workflows add planning, tool calls, retries and an LLM judge per variant, none of which is modelled. | See 1.5 (inference model) |

### 1.4 Which numbers are benchmarked and which are illustrative

**Not one model input is benchmarked.** Every `asm-*` row that feeds `compute()` is graded Modelled with the basis "no published benchmark" (`data.js:572-638`). The one model-feeding row graded Speculative is `asm-flat-marketing-headcount` (`data.js:646-648`). The Benchmark chips near the headline (Gartner 7.7% and 7.8%, `data.js:708-715`) set only the $78M budget, and that affects only `production_share_of_budget` (`calc.js:152`). Benchmarks elsewhere: NYU/Emory CTR +19% and disclosure −31.5% (`data.js:741-748`), and statutory damages (`data.js:986-992`). Everything vendor- or company-reported is Modelled with a flag.

The one external anchor for the model's most important assumption, auto-approval at 60% (`data.js:605`), is Intercom's **19.2% / 28.4%** for code (`data.js:908-911`). At those rates the page's own model puts 2x at 111.3% / 100.1% utilisation (`data.js:942-945`). v2 must not quietly drop that tension when it reframes around autonomy.

**Pitfall:** the headline sentence (`site/index.html:29`) asserts "flat headcount" in bold with only Modelled chips. The weakest grade underneath it is Speculative (`data.js:648`), and the chip appears only at `site/index.html:64`. In v2 every executive-summary claim must carry the **weakest** grade of its dependencies (reuse `weakestGrade`, `model.js:131-140`). A test should check that the first-screen chips equal `weakestGrade(deps)`.

### 1.5 What a CFO needs that the model lacks (with proposed calc.js and data.js changes)

| Gap | Today | Proposed change (testable) | Evidence class |
|---|---|---|---|
| **Marketer labour hours** | Not modelled at all. 120 FTE only drives change cost (`data.js:578-579`, `model.js:241`). | Per-workflow `hours_per_unit[role]` with `{baseline, scaled}` and `annual_units`. `required_fte[role] = Σ hours / productive_hours`. Capacity check per role, and the max multiplier is the min over roles. | Illustrative (hours per unit) and hypothesis (scaled hours) |
| **Investment / build cost** | Absent. Only $3k per FTE change cost (`data.js:1024`). | `build_cost_one_off` split into engineering, integration, eval-set labelling and security/legal review, plus `build_months`. Payback month and 3-year NPV at a stated discount rate. | Hypothesis |
| **Run cost** | Tooling $600k fixed (`data.js:627`) | Split into platform licences, inference (below), eval/judge inference, observability, and an ops team in FTE (agent operators, eval curators). Ops FTE must appear in INV-1. | Illustrative |
| **Inference cost sensitivity** | Share of $0.80 per variant (`data.js:621, 629`). Taking $0.80 to $8 moves cost per asset only $45 → $54. | `inference_cost = units x steps_per_unit x tokens_per_step x price x (1 + retry_rate) + judge_calls x judge_price`. Sensitivity at 0.5x, 1x, 3x and 10x price. | Hypothesis |
| **Adoption curve** | Full 2x from day one; year-one net = full run rate + change cost | `adoption[q]` (share of eligible volume on the new workflow by quarter) and a ramp of the auto-approval share. Year 1 and run-rate shown separately. | Hypothesis (`asm-adoption-design` already admits no rates, `data.js:970-971`) |
| **Error / escape cost** | Only rights incidents (Speculative, `data.js:981-1001`) | `unseen_auto = G x auto x (1 − q)`: **45,474 variants a year at 2x vs 7,579 today (6.0x)**. `escapes = unseen_auto x gate_miss_rate`; `escape_cost = escapes x (takedown + rework + incident cost)`. Sensitivity on miss rate (0.1%, 0.5%, 2%). | Hypothesis |
| **Review overhead of autonomy** | Sampling and escalation fixed at 5% + 5% (`data.js:607-610`) | Add eval-set curation hours, sampled-audit hours, incident-review hours, and LLM-judge calibration (human relabels per month) as reviewer-role hours. | Illustrative |
| **Removable vs redeployed vs avoided vs slack** | Conflated in a single "freed" number (`model.js:239`) | `capacity_bridge` (1.1) per role, plus INV-1 buckets | Derived |
| **Unused baseline capacity** | Implicit (55% utilisation) | Explicit output `slack_baseline_fte` per role, reported before any programme effect | Derived |
| **Agency spend** | Implicit in `variant_cost` $4 and maybe in `master_concept_cost` | Explicit `agency_base[w]` with a `reducible_share`. Savings bounded by INV-5. | Illustrative |
| **Value of capacity (Scenario A)** | Redeploy shows only cost (+$1.43M first-year net) | Value line = cost of buying the same extra output the old way. At defaults, 2x without the programme costs $4,177,789 vs $3,620,631 with it: **$557k a year production-cost avoidance**, plus 3.57 avoided reviewer hires (INV-7, not added twice). | Derived |
| **Side-specific rework** | `rework_rate` read unpicked in `model.js:218, 378, 392` | If v2 makes rework `{baseline, scaled}` (likely, for error sensitivity) these lines yield NaN. Read through `pick()`, or move `requiredReviewerFte` into calc.js. Add a test with side-specific rework. | Bug (latent) |

**The three brief scenarios versus today's three modes** (`model.js:221-248`, `site/index.html:894-896`):

- **A. Same team, greater output.** Closest to Redeploy, but Redeploy fixes output at 2x. A must *solve* for output at flat FTE across all roles (today 2.75x, bounded by reviewers only, because marketers are unmodelled).
- **B. Same output, lower cost.** Hold keeps people cost at 0. At defaults the production saving is only **−$53,579**: tooling +$450k offsets −$303k review, −$135k generation and −$66k rework. B must show 3.42 removable FTE (attributable) as cash only when headcount is actually removed, priced once (INV-2).
- **C. Growing demand, limited hiring.** Not present. Output is avoided hires (3.57 reviewer FTE at 2x) plus avoided production cost ($557k), with no double count (INV-7).

Recommendation: replace the Redeploy / Hold / Reduce radio with A / B / C. Keep `scenario=redeploy|hold|reduce` as accepted legacy values in `parseHash` (`state.js:71`), mapped to A/B/B+cut, so v1 share links still restore.

---

## Part 2. Critical pitfalls

### Pitfall 1: Shipping "FTE freed" that is really baseline slack

**What goes wrong:** The v2 economics section headlines removable FTE or capacity released and takes it from `current − required` (`model.js:239`). At defaults that credits the programme with 4.21 FTE of pre-existing idle reviewer time (see 1.1).
**Why it happens:** The utilisation model was built to show 2x *fits*, not to attribute savings. The default 12 reviewers at 1,200 h were never calibrated against 6,905 h of demand.
**How to avoid:** Implement `capacity_bridge` and INV-4. Report slack as its own line ("capacity already unused under baseline assumptions", a category the brief names explicitly). Consider re-basing the illustrative company so baseline utilisation sits near the 85% target (about 9.3 reviewers). Then slack is not the story, and the programme's effect is visible on its own.
**Warning signs:** Removable FTE at Hold (7.63) much larger than at 2x (3.27). Any "freed" figure that does not change when the auto-approval share is set equal on both sides.
**Phase to address:** Economics model phase (first engine phase), before any prose is written about FTEs.

### Pitfall 2: Counting the same labour or agency dollar twice

**What goes wrong:** Review hours priced at $100/h in production cost *and* reviewer FTE priced at $150k in the people line (D1/D2). Agency fees saved inside `cost.total` and then cited again as the reallocation source (D3). Per-workflow savings summed across a portfolio that shares one reviewer pool (D6).
**Why it happens:** Activity costing and payroll costing are both legitimate, but v1 mixed them in `first_year_net` (`model.js:242`).
**How to avoid:** Choose a **cash view** for the CFO tables: payroll by FTE, external spend by line, no activity-priced internal labour. Keep the activity view only for unit economics, labelled as such. Enforce INV-2, INV-5, INV-6 and INV-8 in tests. Tag every saving with `counted_in`.
**Warning signs:** Net savings that exceed baseline spend on a line. Reduce or B results that change when `reviewer_rate_per_hour` changes, since in a cash view they should not.
**Phase to address:** Economics model phase. Crosscheck must also assert that every financial figure on the page derives from one ledger.

### Pitfall 3: Presenting an input (2x) as a finding

**What goes wrong:** "Can roughly double" (`site/index.html:29`) reads as a model result. It is `SCENARIO.multiplier = 2` (`data.js:10`). Only reviewer capacity is checked, and marketer capacity is asserted flat (Speculative, `data.js:646-648`).
**How to avoid:** Phrase it as "the model tests 2x". Compute and show the max sustainable multiplier per role and the binding constraint. Make marketer hours a modelled role so flat headcount becomes a checked result, not an assertion.
**Warning signs:** No output changes when a non-reviewer assumption makes the work harder.
**Phase to address:** Economics model phase; executive-summary copy in the restructure phase.

### Pitfall 4: Attributing scale effects to AI

**What goes wrong:** Cost per asset falls 30%, but 64% of that fall happens at 2x even with no AI (concept amortisation across more markets). Brief-to-live falls only because build days are assumed to drop 8 → 3, while the review part gets slower.
**How to avoid:** Implement INV-9 decomposition in `compute()` (`effects: { scale, programme }`). Show it as a bridge chart. Grade the programme part separately.
**Warning signs:** Cost per asset still falls when every `{baseline, scaled}` assumption is flattened.
**Phase to address:** Economics model phase; diagram/figures phase for the bridge chart.

### Pitfall 5: Capacity framed as effectiveness (overclaiming revenue)

**What goes wrong:** The causal chain (software → autonomy → hours → capacity → outcomes, `.planning/v2.0-BRIEF.md:445`) is drawn with equal-weight arrows. Readers infer that pipeline or revenue scale with capacity. The brief forbids this (`:105`, `:405`).
**Why it happens:** Executive-summary pressure. Also, the only outcome evidence on the page is one CTR study (Benchmark) and vendor case studies (flagged).
**How to avoid:** Mark the arrow where evidence stops: capacity → outcomes is a hypothesis, tested by holdouts. Keep the existing falsifier (`site/index.html:30`). No revenue, pipeline or ROI number is ever computed from capacity. Diminishing returns are stated: experiment win rates are 10-33% (`data.js:813-828`), and added markets are usually smaller. Add a Jevons note: cheaper output tends to raise demand for output (more variants, more tests), so the saving is often consumed as volume. Scenario B cash appears only if leadership caps volume.
**Warning signs:** Any $ figure for revenue or pipeline. Any "ROI" that divides capacity value by cost. The word "will" next to an outcome metric.
**Phase to address:** Outcomes and scorecard phase. A test grepping the executive sections for revenue/ROI numbers without a Speculative chip.

### Pitfall 6: Goodhart on autonomy percentage and activity metrics

**What goes wrong:** "Percentage of eligible workflows completed autonomously" becomes the KPI. Teams widen the eligibility definition, split workflows into trivially auto-approvable pieces (Intercom: 86% of auto-approved PRs are 20 lines or fewer, per ideas.fin.ai "2x nine months later"), or count assets and steps.
**Why it happens:** Autonomy share is easy to measure, and value is not. Intercom itself says its merged-PR metric is "not quite perfect" and "easy to criticize".
**How to avoid:** Primary metric = completed workflows that met objective and guardrails, per FTE. Autonomy % is a **diagnostic**, always paired with escape rate, first-pass acceptance and verified-objective rate. Eligibility definitions are versioned in the policy source and frozen per measurement period. State explicitly: "higher autonomy is not a goal" (`.planning/v2.0-BRIEF.md:76`).
**Warning signs:** Autonomy % rising while escapes, rework or holdout outcomes are flat or worse. The eligible denominator changing between quarters.
**Phase to address:** Thesis and 2x-definition phase (metric choice); scorecard phase.

### Pitfall 7: Compounding error in multi-step agents is not priced

**What goes wrong:** The supply-chain diagram shows one agent running plan → brief → derive → localise → validate → publish → measure. The model prices it like single-step variant generation. Per-step reliability compounds: 0.98 over 8 steps is 0.85, and 0.95 over 8 steps is 0.66. Toby Ord's analysis of METR task-length data finds success decays roughly exponentially with task length, and the 80% horizon is about a third of the 50% horizon (Forethought, 2025-05-06, MEDIUM).
**How to avoid:** In the model, `workflow_success = Π step_success` with verification gates that reset the chain, and escalation volume derived from it, so it feeds reviewer hours. In the narrative, autonomy expands one verified segment at a time, with a checkpoint at each external side-effect (publish, spend, send).
**Warning signs:** An end-to-end autonomy share stated without per-step success rates. Escalation hours that do not move when steps are added.
**Phase to address:** Architecture ("What needs to be built") phase and economics model phase.

### Pitfall 8: Treating the LLM judge as ground truth

**What goes wrong:** Auto-approval rests on an evaluator model. Judge agreement with humans is moderate and biased: position, verbosity and self-preference biases (Zheng et al., NeurIPS 2023). Inter-judge agreement in one 2026 study was 76% (κ = 0.51) (arXiv 2606.13685, LOW: secondary summary). High aggregate agreement can hide failure on items the judge itself cannot answer (Krumdick et al., arXiv 2503.05061, "No Free Labels", MEDIUM).
**How to avoid:** Keep v1's blind-first human labels, seeded-error catch rate and harness (`site/index.html:547-556`, `data.js:953-954`). Model judge calibration as a recurring human cost (1.5). Report judge-vs-human agreement per tier and per rule, never as one aggregate. Grade "auto-approval 60%" as a hypothesis for the pilot.
**Warning signs:** One headline agreement number. No ground-truth refresh cadence. The judge and the generator are the same model family with no cross-check.
**Phase to address:** Architecture phase (evaluation capability) and roadmap phase (pilot acceptance criteria).

### Pitfall 9: Accountability gap when agents act

**What goes wrong:** "Agents publish and optimise spend" with no named human owner. Escapes (brand, claims, rights, regulatory disclosure) then have no accountable party. Intercom's answer is explicit: "The human who ships the code remains accountable for the outcome", and automated approval "is never forced" (Intercom blog, 2026-04-21, company-reported). Moffatt v. Air Canada (`data.js:438-450`) shows the organisation owns what its automated agent says.
**How to avoid:** Every workflow in the architecture names an accountable role and an approval boundary (what the agent may do, spend or publish without a human). Kill switch and rollback are part of the smallest useful slice. The always-human list (`site/index.html:520-527`) carries over unchanged.
**Warning signs:** The diagram has agent lanes with no human owner. "Autonomous" used for actions with external side-effects and no rollback.
**Phase to address:** Architecture phase and supply-chain diagram phase.

### Pitfall 10: Brand and compliance escapes scale with unseen volume

**What goes wrong:** Unseen auto-approved variants rise 6x (7,579 to 45,474 a year at defaults). A tiny miss rate becomes hundreds of live defects. The incident examples on the page (`data.js:511-562`) concern visible hero work, which the always-human list protects. The tail risk sits in the long tail of derived variants.
**How to avoid:** Escape-rate line in the model (1.5). Sampling rate tied to tier and drift alarms. Disclosure obligations (EU AI Act Art. 50 from 2026-08-02, `data.js:451-474`) enforced in the policy source.
**Warning signs:** Sampling rate held constant while unseen volume grows.
**Phase to address:** Economics model phase (escape cost) and risks phase.

### Pitfall 11: Labour relations and role redesign treated as an afterthought

**What goes wrong:** Scenario B ("genuine removable headcount") is presented to a CMO audience as a spreadsheet line. That provokes resistance that sinks adoption, which the page's adoption section depends on. EU works-council consultation and similar duties can apply to reorganisations (not researched here, LOW, flag for legal check). The change cost of $3,000 per FTE (`data.js:1024-1025`) explicitly excludes severance.
**How to avoid:** Scenario B shows severance and exit cost as a separate, Speculative, reader-owned line, and states timing (removal lags adoption). Role redesign (reviewer → eval curator, coordinator → workflow owner) is in the roadmap with hours moving between roles under INV-1. Intercom framed its gains as output per head, with no headcount targets stated (ideas.fin.ai). Note that as a choice, not a neutral default.
**Warning signs:** FTE removal shown in year one at full adoption. No line for the new roles the system needs (agent operators, eval curators).
**Phase to address:** Economics model phase (scenario B lines); roadmap phase (org enablement).

### Pitfall 12: Mapping four evidence classes onto three grades by renaming the grades

**What goes wrong:** Someone replaces Benchmark / Modelled / Speculative with observed / benchmark / illustrative / hypothesis. That breaks `GRADES` (`data.js:7`), `GRADE_ORDER` and `weakestGrade` (`model.js:129-140`), the chip classes `c-b c-m c-s` (79 references across tests and scripts), the legend, the register Grade column, crosscheck, and every v1 claim. Worse, the classes are not a confidence scale. An illustrative input such as "40 campaigns" is not *less reliable* than a hypothesis. It is a different kind of number.
**How to avoid:** Keep grade (confidence, ordered, drives chips and `weakestGrade`). Add an **orthogonal `evidence` field** on every assumption and claim: `observed | benchmark | illustrative | hypothesis`. Rules:
- *benchmark*: an independent published source. Allowed grade Benchmark, or Modelled when transfer distance is large (e.g. code to marketing).
- *observed*: measured fact about a real organisation. Requires a flag (`company-reported` or `vendor-claimed`) unless it comes from the reader's own pilot. Intercom's 19.2% is observed-elsewhere, Modelled, company-reported. **Nothing on the page is observed for the subject organisation**, and the 12-week pilot is what produces observed data.
- *illustrative*: a number describing the hypothetical organisation, which readers should replace (revenue, campaigns, FTE, rates). Grade Modelled.
- *hypothesis*: a claim about the programme's effect that a customer pilot must validate (auto-approval 60%, build days 8 → 3, scaled variant cost, flat marketing headcount, adoption). Grade Modelled or Speculative.
- **Mechanical rule (test):** any assumption whose `{baseline, scaled}` values differ is `hypothesis` (or `benchmark` if sourced). Any `kind: 'input'` describing the organisation is `illustrative`. Allowed (evidence, grade) pairs are enumerated, and a test fails on any other pair.
- **Display:** the chip stays the grade. The evidence class appears as a column in the register and in the assumptions table, plus a one-word text label only in the economics tables. It is not a second chip on every figure (see Pitfall 17).
**Warning signs:** A PR that touches `GRADES` or the chip CSS. Benchmark chips on hypothesis rows.
**Phase to address:** First phase (data schema). Everything later depends on it.

---

## Part 3. Restructure pitfalls (brief section 11)

### Pitfall 13: Losing depth while chasing clarity

**What goes wrong:** The ten-question hierarchy (`.planning/v2.0-BRIEF.md:382-391`) tempts rewriting s03-s08 (factory, platform, 10,000-asset campaign, review agent, gate, harness) into summaries. The brief forbids it (`:399`, `:428`).
**How to avoid:** Move rather than delete. Keep v1 sections as appendices with their content, figures, chips and tests intact. Write new executive sections on top that link down. Add an inventory test listing every v1 `data-fig` id and `<figure>` that must still be present after the restructure. That makes absence a test failure, the inverse of v1's absence guards.
**Warning signs:** The `data-fig` count falls. Tests deleted rather than re-pointed. Page word count falls by more than 20% with no appendix growth.
**Phase to address:** Restructure (information architecture) phase.

### Pitfall 14: Breaking anchors, share links and register links when renumbering

**What goes wrong:**
- `#s11?…` is the share-link contract (`state.js:9` `HASH_PREFIX`, `ui.js:291-292`). v1 links in the wild stop restoring if the calculator moves or is renumbered.
- `test/page.test.js` has about 185 section-id references, `calc-page.test.js` about 60, `smoke.mjs` 21 and `state.test.js` 20. Renumbering causes mass test churn, and the temptation is to loosen tests.
- `crosscheck.mjs` fails on duplicate ids. A naive "keep old id as alias" duplicates `id="s11"`.
- The vendor rule test (`test/page.test.js:404-419`) is keyed to "s12 and s15".
**How to avoid:**
- Use **semantic, stable ids** for new sections (`#opportunity`, `#build`, `#supply-chain`, `#economics`…), not numbers. Display numbers can stay in `.sec-num` as text.
- Keep the calculator's section id `s11`, or have `parseHash` accept both `#s11?` and the new prefix. A fixture test restores a recorded v1 URL (including `scenario=redeploy`) to identical values.
- For moved v1 sections, keep a single legacy anchor element (e.g. an empty `<span id="s07">` at the top of the appendix) and remove the old id from the section. Crosscheck's duplicate check then still passes.
- Re-point the vendor-rule test to the new comparison and register ids in the same commit, without broadening its scope.
- Do the id move as one mechanical, test-only-changing commit before content edits.
**Warning signs:** Diff touching both test expectations and copy in one commit. Any test using `.skip`.
**Phase to address:** Restructure phase, first plan.

### Pitfall 15: Crosscheck and data.js drift during heavy copy edits

**What goes wrong:** New sections quote numbers as literals (for example "3.4 FTE", "$557k") instead of `data-fig` spans. Literal claims in `data.js:756-778, 922-946` are re-checked only against `derived` paths. Prose numbers outside spans are not checked at all.
**How to avoid:** Every new number is a claim with `derived` or `calc` (generated from the presenter, as `data.js:1043-1099` does). Add a crosscheck rule that fails on digits followed by %, $, FTE, h or days in executive sections when they sit outside `data-fig` (with an allowlist for years and section numbers). The capacity bridge, scenario A/B/C and decomposition figures are generated, never typed.
**Warning signs:** Numbers in prose without chips. Data.test pass counts unchanged after adding a figure.
**Phase to address:** Every content phase; rule added in the economics model phase.

### Pitfall 16: Supply-chain diagram illegible at 320px and in print

**What goes wrong:** A nine-stage loop with human/agent lanes, a platform layer, approval boundaries and a feedback arrow is wide. At 320px, a scaled SVG shrinks text below about 9px. a11y.mjs fails any element extending past 320.5px (`scripts/a11y.mjs:140-149`). Print may split it, and colour-only lane coding fails grayscale print (v1 already dropped grayscale print UAT, see `.planning/milestones/v1.0-MILESTONE-AUDIT.md`).
**How to avoid:** Author two layouts from one data structure: horizontal at ≥ 768px and a vertical stacked list of stages at narrow widths (CSS switch, not scaling). Text stays real `<text>` or HTML, at least 12px rendered. Lanes are distinguished by pattern or label as well as colour. Add a `<title>`/`<desc>` and an equivalent HTML table or list. Use `break-inside: avoid` and a print-specific layout. Extend `diagram.test.js` for minimum font size and the text-alternative presence.
**Warning signs:** `viewBox` scaling only. Lane meaning conveyed by fill only.
**Phase to address:** Supply-chain diagram phase.

### Pitfall 17: Grade-chip density in the executive sections

**What goes wrong:** The first screen gets a chip on every number plus a new evidence-class label. The five-minute read becomes noise. Or chips get dropped from the summary to declutter, which breaks the "every number graded" constraint.
**How to avoid:** One chip per sentence, carrying the weakest grade of that sentence's numbers (via `weakestGrade`). Add a grade note per table (v1 pattern WR-01, `model.js:327-340`). Evidence class only in the register and the economics tables. Test that each executive sentence with a `data-fig` has exactly one chip, equal to the weakest grade.
**Phase to address:** Restructure phase and executive copy.

### Pitfall 18: Jargon and invented terminology

**What goes wrong:** "Agentic marketing operating system", "autonomy ladder", "outcome-directed autonomy" and similar phrases replace explanation (`.planning/v2.0-BRIEF.md:80, 403-404`). v1 also coined "campaign-markets", "Backlog 0", T0-T3 and "factory".
**How to avoid:** Define each term once, in operational words (who does what, in which system). Keep the term count small. Ban list in a test: "operating system" (as a metaphor), "AI-powered", "unlock", "transform", "seamless", "revolutionise". Glossary in the appendix.
**Warning signs:** A section explaining what the system *is* with no verbs about inputs, actions and checks.
**Phase to address:** All copy phases; ban-list test in the restructure phase.

### Pitfall 19: Vendor-neutrality rule collides with the Intercom research and the architecture

**What goes wrong:** The new Intercom section must say Intercom used a coding agent and plugins. Intercom's posts name the coding agent product, and `VENDOR_RE` (`test/page.test.js:413`) includes "anthropic" and "claude", so the test fails. The build/integrate/buy section will want to name DAM, CMS and ad platforms (the regex includes sitecore, contentful, salesforce, bynder, google, meta platforms).
**How to avoid:** Keep the rule. Describe Intercom's tooling by category ("a coding agent", "a shared plugin repository"), as v1 did for the MMM framework ("an open-source marketing-mix framework", `site/index.html:689`). Integrations are named by category (DAM, CMS, PIM, ad platform API, analytics warehouse). If the author decides Intercom's own tool names are essential, change the rule explicitly in PROJECT.md first, then scope the exception to the Intercom section id. Do not loosen the regex silently.
**Phase to address:** Intercom research section phase and architecture phase.

### Pitfall 20: a11y and print gates are not in CI

**What goes wrong:** Deploy is gated only on `node --test` plus crosscheck. smoke, a11y and print are not in CI (`.planning/milestones/v1.0-MILESTONE-AUDIT.md`, W2), and they flaked with "no page target" (`.planning/RETROSPECTIVE.md`). A heavy restructure can ship a 320px overflow or a print break.
**How to avoid:** Run all three locally at the end of every phase, with results recorded in VERIFICATION. Consider adding them to CI with a retry, as the first v2 plan. Record any dropped manual check as dropped, not passed (`.planning/RETROSPECTIVE.md` lesson).
**Phase to address:** Restructure phase, first plan; every phase's verification.

---

## Technical debt patterns

| Shortcut | Immediate benefit | Long-term cost | When acceptable |
|---|---|---|---|
| Keep `first_year_net` summing activity cost and payroll | No engine change | Wrong CFO numbers (D1) | Never in v2 |
| Typing new economics figures as literals in data.js | Fast copy | Drift from engine | Only with `derived` and a re-check test |
| Bolting per-workflow models onto `side()` | Reuses tests | `side()` already holds 50 lines of one workflow; portfolio pooling impossible | Never. Add a `workflows[]` layer that calls per-workflow functions and pools roles. |
| Renaming grades to the four classes | One taxonomy | Breaks tests, chips, register, ordering | Never (Pitfall 12) |
| Re-basing reviewer FTE to remove slack | Cleaner story | Changes v1 headline numbers (utilisation, freed FTE) | Acceptable if done deliberately, with the changed figures listed for the author |
| Leaving `SCENARIO.multiplier = 2` as the only output driver | No solver | 2x stays an assertion | Only if the page says "tests 2x" and shows the max sustainable multiplier |

## Looks done but isn't (checklist)

- [ ] **Capacity bridge:** slack + programme load = reported unused capacity, tested; `site/index.html:545` wording fixed.
- [ ] **Scenario B:** removable FTE excludes baseline slack (3.42 at defaults, not 7.63), priced once.
- [ ] **Scenario C:** avoided hires and unused capacity sum to avoided FTE (6.84 at defaults).
- [ ] **Reallocation:** the funding source is a modelled line with enough baseline to cover the rise, or the budget is stated as +1.3 points.
- [ ] **Cost per asset:** decomposed into scale and programme; "fully loaded" either true or renamed.
- [ ] **Brief-to-live:** build and review components shown; build-days graded as a hypothesis.
- [ ] **Marketer hours:** modelled, so "flat headcount" is a checked result.
- [ ] **Investment, run, inference, adoption, escape cost:** each present with a sensitivity.
- [ ] **Evidence class:** on every assumption and claim; allowed (class, grade) pairs tested.
- [ ] **v1 share link** `#s11?…scenario=redeploy` restores.
- [ ] **No revenue/ROI figure** computed from capacity.
- [ ] **All `v1 data-fig` ids** still present (moved, not lost).
- [ ] **smoke, a11y, print** exit 0 at 320px and in print, after the diagram lands.

## Recovery strategies

| Pitfall | Recovery cost | Recovery steps |
|---|---|---|
| Double count shipped | MEDIUM | Add ledger tags and INV tests, regenerate claims; crosscheck flags every changed figure |
| Anchors broken | LOW | Restore legacy anchor spans; add hash fixture tests |
| Depth lost | HIGH | Restore from git by `data-fig` inventory; that is why the inventory test must exist first |
| Grade system renamed | HIGH | Revert; add the orthogonal field |

## Phase-specific warnings

| Phase topic | Likely pitfall | Mitigation |
|---|---|---|
| Data schema / evidence classes (first) | Renaming grades (P12) | Orthogonal `evidence` field plus pair test |
| Economics engine (per-workflow, A/B/C) | Slack as savings (P1), double counting (P2), 2x as input (P3), scale vs AI (P4), latent `rework_rate` NaN (`model.js:218`) | `capacity_bridge`, INV-1 to INV-11, decomposition, `pick()` everywhere; hand-calculated goldens using the 1.1 table |
| Intercom research and thesis | Merged-PR analogy oversold; vendor names (P19); autonomy as a goal (P6) | Quote Intercom's own caveats (imperfect metric, quality dipped, AI spend unoptimised, 19.2% auto-approved vs a > 50% goal); categories not brands |
| What needs to be built | Jargon (P18), accountability gap (P9), compounding error (P7), judge reliability (P8) | Capability table with owner, permission boundary and verification for each row |
| Supply-chain diagram | 320px/print legibility (P16) | Two layouts, real text, non-colour lane coding, text alternative |
| Outcomes and scorecard | Overclaiming revenue (P5), Goodhart (P6), Jevons | Evidence-stops marker on the chain, autonomy % as a diagnostic, falsifier retained |
| Restructure / IA | Depth loss (P13), anchors (P14), chip density (P17), drift (P15) | Inventory test, semantic ids plus legacy anchors, weakest-grade-per-sentence, literal-number crosscheck rule |
| Roadmap and org enablement | Labour relations (P11), pilot vs projection blur | Severance as a separate line, role redesign hours, "observed" reserved for pilot data |
| Validation | Browser gates not in CI (P20) | Run smoke, a11y and print every phase; record dropped checks as dropped |

## Sources

- Repository: `site/js/calc.js`, `site/js/model.js`, `site/js/data.js`, `site/js/state.js`, `site/js/ui.js`, `site/index.html`, `scripts/crosscheck.mjs`, `scripts/a11y.mjs`, `test/page.test.js`; numbers recomputed with Node on 2026-10-25 (HIGH)
- `.planning/v2.0-BRIEF.md`, `.planning/PROJECT.md`, `.planning/milestones/v1.0-MILESTONE-AUDIT.md`, `.planning/RETROSPECTIVE.md`
- Intercom, "2x, nine months later", https://ideas.fin.ai/p/2x-nine-months-later (accessed 2026-10-25; company-reported): metric = merged PRs / all R&D employees; "not quite perfect"; structural quality declined then recovered; AI spend rising and not optimised; 19.2% AI-approved vs a > 50% goal; 86% of auto-approved PRs ≤ 20 lines
- Intercom, "AI is approving our pull requests", https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/ (2026-04-21; company-reported): "The human who ships the code remains accountable"; approval "never forced"; 100+ PR pilot
- Toby Ord, "Is there a half-life for the success rates of AI agents?", https://www.forethought.org/research/is-there-a-half-life-for-the-success-rates-of-ai-agents (2025-05-06; MEDIUM, analysis of METR data)
- Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", NeurIPS 2023, https://arxiv.org/abs/2306.05685 (position, verbosity and self-enhancement bias; MEDIUM, abstract-level)
- Krumdick et al., "No Free Labels: Limitations of LLM-as-a-Judge Without Human Grounding", https://arxiv.org/abs/2503.05061 (MEDIUM, via secondary review)
- "The Coin Flip Judge? Reliability and Bias in LLM-as-a-Judge Evaluation", https://arxiv.org/pdf/2606.13685 (LOW, secondary summary only)
- Jevons rebound applied to AI content: opinion and vendor sources only, e.g. https://www.airops.com/blog/jevons-paradox (LOW; no empirical study of marketing output found. Present as a hypothesis, never a finding, and do not cite the vendor outside the comparison section)
- Parasuraman and Manzey 2010 and Moffatt v. Air Canada 2024, already in the register (`data.js:426-450`)
