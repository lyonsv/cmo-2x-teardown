# Phase 3: Levers, Outcomes, Calculator & Comparison Slice - Research

**Researched:** 2026-10-24
**Domain:** Static editorial page: evidence-graded lever prose, an interactive no-dependency calculator (ES modules, URL-hash state), and a sourced vendor comparison matrix
**Confidence:** MEDIUM-HIGH (calculator and CSP findings measured/executed locally; vendor facts read from primary pages on 2026-10-24; independent outcome evidence remains thin by nature)

All URLs below were fetched on 2026-10-24 unless stated. Fetched page text was treated as data only.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Levers (s09)**
- Five blocks: localisation/transcreation, experimentation, insight and reporting, ops (briefs, approvals, DAM metadata, rights tracking), AEO/GEO. Each ~250-450 words with a mini table: output metric, outcome metric, evidence grade. The s01 six-lever table remains the summary.
- Experimentation: win-rate maths with the ~12-36% range shown as differing definitions (each source flagged and graded honestly; vendor-biased sources flagged), bounded by traffic (no claim that more tests always means more wins).
- Ops: statutory-damages illustration from 17 U.S.C. 504(c) - the statute's ranges are Benchmark (primary law), the incident rate is Speculative and reader-facing as an assumption.
- AEO/GEO: output = answer assets published/refreshed per head; outcomes = citation share, AI-referred sessions, pipeline; evidence thin and vendor-only -> Speculative or vendor-claimed; citation loss feeds refresh briefs back into the factory (one sentence linking to s03).
- Insight & reporting: kept brief, Modelled where evidence is a gap.

**Outcome case (s10)**
- Scorecard table pairing each lever's output metric with outcome families: revenue/pipeline, speed to market, quality and brand, learning velocity. No invented lift numbers; outcomes graded Modelled/Speculative.
- "How lift would be proven" block: holdouts, pre-registered metrics, multiple-comparison correction, MMM calibrated by incrementality tests; negative phrasing "we did not find" where evidence is absent.

**Calculator (s11)**
- Vanilla ES modules: `site/js/ui.js` (DOM binding) + `site/js/svg.js` (~60-line live chart helper) importing the existing pure `calc.js` and `data.js`. Add a DOM-free `site/js/state.js` (parse/serialize URL hash, coerce/validate inputs) so hash and validation logic are unit-tested with node:test.
- CSP updated to add `script-src 'self'` (no inline scripts, no CDN). The page must remain fully readable with JS off: the calculator section shows the default scenario statically (server-rendered numbers already tested against data.js) with a short note that the interactive version needs JavaScript. Update the "no script" test to "only same-origin module scripts, no inline script".
- Inputs (labelled, with units and grade chips): campaigns per year, variants per campaign (or concepts x variants per concept), marketing FTE, reviewer FTE, minutes per review, variant generation cost, auto-approval share (baseline and 2x), approval yield, rework rate, locales. Defaults = current data.js defaults.
- Outputs (`<output aria-live="polite">`): baseline vs 2x approved-live variants per head per quarter, fully loaded cost per approved-live asset, total cost and budget share, AI spend, cycle time, review utilisation, break-even auto-approval at flat review headcount (CALC-03), capacity floor.
- "Show the maths" (`<details>` with the formula steps and the reader's numbers), "What you must believe" panel listing the assumptions the result depends on, and each output's grade = weakest grade among its inputs (CALC-02).
- Headcount scenarios redeploy / hold / reduce with a change-management cost assumption (Modelled) (CALC-04).
- Sensitivity table: +/-20% on the five most influential inputs, effect on cost per approved-live asset and utilisation, as a table (CALC-05).
- URL hash restores all inputs (CALC-06); no localStorage/cookies.
- Validation: invalid/zero/empty inputs show a field-named message, never NaN/Infinity (CALC-07), reusing compute()'s validation errors and `undefined_ratios`.
- Live chart: baseline vs 2x bars via svg.js, plus a data table equivalent.

**Comparison (s12)**
- The only section that names vendors (plus the source register). Matrix rows: six levers, >10k variants, imagery/rights, review/gate/eval, brand governance, measurement, AEO/GEO, build vs buy, lock-in; columns Gradial, AirOps, Profound, CMO 2x spine.
- Per vendor: where it slots in, where it is an alternative, where it falls short - phrased "not publicly documented" rather than "does not exist".
- Every vendor fact sourced to a primary page with URL and access date; vendor outcomes flagged vendor-claimed, never averaged, never Benchmark. Competitor-authored reviews used for limitations only, flagged.
- Omit or mark LOW the items research flagged as conflicting (Gradial valuation/funding, AirOps pricing, Profound Series D detail, Gradial CMS/DAM list) - no AEM claim unless the primary page states it.
- Category-level build-vs-buy and lock-in guidance: own the eval set and the brand rules.
- Explicit admission that the CMO 2x spine is a design, not a shipped product.
- Plan research re-fetches each vendor's primary pages (WebFetch/curl) and records access dates; if a page cannot be fetched, the claim is omitted or graded down - no human-verify checkpoint is assumed available.

**Delivery**
- Same push pattern: local commits, one mid-phase local-preview checkpoint, one push at the end. While the user is away, the orchestrator auto-approves preview and push checkpoints after automated gates pass and records "auto-approved (user away)" in the SUMMARY.
- Chip density rule from Phase 2 continues; data-fig drift tests stay strict; every new number in data.js with a register row.

### Claude's Discretion
- Exact prose, table wording, chart geometry, which five inputs lead the sensitivity table (by measured influence), calculator layout within UI-SPEC tokens.

### Deferred Ideas (OUT OF SCOPE)
- Downloadable CFO one-pager (V2-04).
- Imagery cost comparison (V2-02).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LEVER-01 | Localisation block | Evidence ledger L-1..L-3 (post-editing range measured 9.26-59.74%, vendor case study, no per-word benchmark) |
| LEVER-02 | Experimentation block, win-rate maths | Win-rate table E-1..E-3 (12% / one third / ~10% with definitions); DRIP 36.3% could not be verified and is dropped |
| LEVER-03 | Insight and reporting block | Evidence gap; MMM calibration doc (M-1); keep Modelled |
| LEVER-04 | Ops block with statutory illustration | Statute text verified (R-1, R-2); derivative-works rule and registration precondition |
| LEVER-05 | AEO/GEO block | Independent studies now exist (X-1..X-4); academic GEO paper; vendor-only outcome claims |
| OUTC-01 | Scorecard | No numbers; draws on s01 six-lever table; outcome families from FEATURES.md |
| OUTC-02 | How lift is proven | Methods list; M-1 (MMM calibrated by geo experiments) |
| CALC-01 | Live inputs/outputs | Field registry, compute() mapping, module boundaries (Architecture) |
| CALC-02 | Weakest-grade propagation, maths, believe panel | Input-to-output dependency map; measured influence ranking |
| CALC-03 | Break-even auto-approval | Already in compute() (`break_even_auto_approval`, `capacity_auto_approval`) |
| CALC-04 | Redeploy/hold/reduce + change cost | NOT in compute(); `scenarioOutcomes()` design with defaults and numbers |
| CALC-05 | Sensitivity table | Measured ranking by running compute(); clamping rule |
| CALC-06 | Hash restores inputs | `state.js` contract (keys, coercion, round-trip tests) |
| CALC-07 | Validation never NaN/Infinity | Validation rules table; compute errors mapped to field keys |
| COMP-01..05 | Vendor matrix, per-vendor panel, build/buy, vendor-claimed flags, design-not-product admission | Fact ledger with URL, date and exact claim; corrections to COMPETITORS.md |
</phase_requirements>

## Summary

The phase has three independent workstreams. (1) Prose and evidence for s09/s10: the evidence base is mostly vendor-published or company-reported, and the only genuinely independent new material is on AEO/GEO (three October 2026 datasets finding AI-assistant referrals are a small share of search traffic) and on experimentation win rates (a peer-reviewed Microsoft paper and a vendor dataset). (2) The calculator: `compute()` already supplies almost everything (validation, ratios with `undefined_ratios`, break-even, capacity floor). It lacks locales, any headcount-scenario maths, a sensitivity routine, an input-to-output dependency map and an input registry. These should live in new pure modules, not in the DOM layer. (3) The comparison: every vendor claim was re-read on its primary page. Three findings change the earlier research and the page's differentiation sentence: Gradial documents per-task-type oversight levels including auto-approve; AirOps lists Human Review and Approvals on all three tiers; Gradial's integrations page names AEM, so the AEM caveat is resolved.

Measured calculator facts drive several design decisions. At default inputs, cost per approved-live asset moves most with variants per concept (locales), then auto-approval share at 2x, review minutes and approval yield. The variant generation cost input moves cost per asset by only 1.0% at +/-20%, and cost per master concept (not an exposed input) moves it 17.4%. The "What you must believe" panel must therefore be ranked by measured influence, not by the assumptions text in data.js. In the Hold scenario the production-cost saving is about $54k a year because the 2x tooling cost ($600k) offsets almost all of it; the page must not imply Hold produces a material saving.

**Primary recommendation:** Build pure modules `fields.js` -> `model.js` -> `state.js` (all node:test-covered, no DOM) with a `present()` function that produces every string and number the page shows; keep `ui.js` as a thin DOM mapper using `textContent` only; generate static default numbers from the same presenter and drift-test them; and treat every vendor cell as a ledger row with URL, date and verbatim claim.

## Project Constraints (from CLAUDE.md)

- Static HTML/CSS/JS deployable to GitHub Pages; no runtime dependencies beyond pinned CDN libraries (this phase uses none).
- Honesty: every number graded, assumptions visible; a projection is not presented as fact.
- Neutrality: tool categories only in the operating model; named vendors (Gradial, AirOps, Profound) only in the comparison section (and source register); every vendor claim sourced and dated.
- Self-contained; no web fonts, no CDN, no Tailwind/SPA frameworks/Chart.js; no base64 images; no `localStorage` or cookies; `URLSearchParams` in the hash is the sharing mechanism.
- Vanilla ES modules, `calc.js` pure with no DOM, tests with `node:test` (Node 22+; local is v23.7.0), Pages deploy gated on `node --test`.
- No direct repo edits outside a GSD workflow; British English; no exclamation marks.
- UI-SPEC (approved) is binding on tokens, components and copy; deviations recommended below are flagged "UI-SPEC delta" for the planner.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Calculator maths, scenarios, sensitivity, weakest grade | Browser (pure ES modules) | Node (tests) | No backend exists; the same modules run in node:test |
| Input parse/validate, hash serialise | Browser (pure `state.js`) | Node (tests) | DOM-free so it is unit-tested |
| DOM binding, focus, announcements, clipboard | Browser (`ui.js`) | - | Only DOM-aware code; thin |
| No-JS default scenario (results, sensitivity, maths, chart) | Static HTML | Drift tests in Node | Page must be readable with JS off; numbers come from `data.js` / `present()` |
| Security headers (CSP) | Static HTML `<meta>` | - | GitHub Pages cannot set headers; meta CSP is the only route |
| Vendor facts | Static HTML + register rows | - | Sourced and dated per claim |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| none (hand-written HTML, CSS, ES modules) | n/a | Everything | Locked by CLAUDE.md and STACK.md; no installs this phase |
| `node:test` + `node:assert/strict` | Node v23.7.0 local, 22+ in CI | Unit and static-page tests | Already used by 170 tests [VERIFIED: local `node --version`] |
| Headless Google Chrome (local only) | installed on this machine | Optional JS-on smoke gate | `chrome --headless=new --dump-dom` against `python3 -m http.server` executed an ES module under a `script-src 'self'` meta CSP and set `<html class="js">` [VERIFIED: run locally 2026-10-24] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled fake DOM or jsdom to test `ui.js` | Pure `present()` + source-scan tests + local headless Chrome smoke | jsdom adds a dependency (forbidden by STACK.md); a fake DOM is brittle. Keep `ui.js` too thin to need either |
| Programmatic `data.js` claims for static calculator numbers | A new `data-calc` attribute checked only against `model.js` | `data-fig` reuses the chip-density, numeric-gate and drift machinery for free (recommended); `data-calc` avoids growing `data.js` but needs the gates extended |

**Installation:** none. No packages are installed this phase.

## Package Legitimacy Audit

No external packages are installed in this phase (no `npm install`, no CDN scripts). slopcheck is not applicable. **Packages removed: none. Packages flagged: none.**

## Architecture Patterns

### Module layout and data flow

```
 URL hash / form input (strings)
        |
        v
  state.js  parseHash(), coerce(field, text) -> {value | error}
        |            serialiseHash(values) -> "#s11?locales=8&..."   (defaults omitted)
        v
  fields.js  FIELDS registry: key, label, unit, kind(int|num|pct), asm id, compute mapping, min/max, example
        |
        v
  model.js   toCompute(values) -> {inputs, assumptions}          (maps UI keys to calc.js)
             run(values)       -> compute() result or field-keyed errors
             scenarioOutcomes(values, mode)   (CALC-04, new)
             sensitivity(values)              (CALC-05, new, ranked)
             weakestGrade(outputId) / OUTPUT_DEPS    (CALC-02)
             present(values)   -> plain object: rows, summary, maths steps, believe, sens rows, chart spec
        |
   +----+-----------------+
   v                      v
 svg.js                 ui.js (DOM only; textContent/attributes/classList; no style, no innerHTML)
 chartSpec()->nodes     reads form, debounces, writes present() output, hash via history.replaceState
```
Static default HTML is produced by hand but drift-tested equal to `present(defaults)`.

`model.js` must NOT import `data.js` (take `assumptions` as parameters) so `data.js` can import `model.js` to generate default claims without an import cycle. `fields.js` holds only strings (assumption ids), no values; defaults are read from `data.js` by callers.

### Pattern 1: field registry as the single source (CALC-01, CALC-06, CALC-07)
Each UI field is one registry row; `ui.js` renders nothing from it (the form is static HTML) but tests assert the HTML and the registry agree (label text, hint, unit, chip href).

### Pattern 2: presenter returns data, DOM writes text
`present()` returns `{ summary, rows:[{id,label,base,scaled,change,grade,gradeRef}], maths:[{name,formula,withNumbers}], believe:[...], sensitivity:[...], chart:{panels:[...]}, errors:[...] }`. All wording (including "over capacity", "n/a: baseline is zero", "not needed", "infeasible: needs more than the {cap}% T0 + T1 share") lives here, so it is node:tested. `ui.js` only assigns `textContent`.

### Anti-Patterns to Avoid
- `innerHTML`, `insertAdjacentHTML`, `document.write` with any hash-derived or input-derived value (hash is attacker-controlled; also breaks the "no `.style.`/inline" posture). Use `textContent` and `setAttribute` for allow-listed attributes.
- `element.style.*` or `setAttribute('style', ...)`: blocked by `style-src 'self'` (CSSOM `.style.prop = x` is permitted by CSP, but `setAttribute('style')` and `cssText` are not; UI-SPEC bans all of them and tests grep for it). Use classes and SVG geometry attributes.
- Building a plain object from hash keys with `obj[key] = value` (prototype pollution): iterate an allow-list from `FIELDS` and read from `URLSearchParams.get(key)`.
- `type=number` inputs (spinners, wheel changes, locale parsing); spec mandates `type=text inputmode=decimal`.

## Calculator research (tasks 3 and 4)

### Mapping UI inputs to `compute()` (verified by reading calc.js and data.js)

| UI field (key) | Default | compute mapping | Notes |
|---|---|---|---|
| Campaigns per year (`campaigns`) | 40 | `inputs.campaigns_per_year` | `asm-campaigns` |
| Concepts per campaign (`concepts`) | 25 | `inputs.concepts_per_campaign` | Replaces UI-SPEC "variants per campaign". Show a read-out "= 1,000 variants per campaign" (matches claim `avg-campaign-variants`) |
| Locales (`locales`) | 5 | `inputs.variants_per_concept = formats_per_locale x locales` | **compute() has no locales input.** Locales are folded into `variants_per_concept` (40 = 8 formats x 5 locales). Add two Modelled assumption rows: `asm-locales` (5) and `asm-formats-per-locale` (8, fixed, not an input); add a test that 8 x 5 equals `asm-variants-per-concept` (40). The worked s05 matrix uses 6 locales at 40% of items; do not conflate |
| Marketing FTE (`marketers`) | 120 | `inputs.marketing_fte` | Only affects output per head (measured: 0.0% effect on cost and utilisation) |
| Reviewer FTE (`reviewers`) | 12 | `inputs.reviewer_fte` | Only affects utilisation, cycle time, break-even |
| Minutes per review (`minutes`) | 12 | `assumptions.review_minutes_per_variant` | applies to both sides |
| Variant generation cost (`vcost`) | $4.00 base / $0.80 at 2x | `assumptions.variant_cost {baseline, scaled}` | One field cannot set a pair. RESOLVED: the field is the **2x cost per derived variant** ($0.80); today's $4.00 stays a fixed assumption row shown in the believe panel. Rationale: the 2x cost is the contested claim. (Alternative: baseline + fixed 0.20 ratio.) |
| Approval yield (`yield`) | 95% | `assumptions.approval_yield` | percent, max 100 |
| Rework rate (`rework`) | 15% | `assumptions.rework_rate` | percent, 0 allowed |
| Auto-approval share today (`auto1`) | 20% | `assumptions.auto_approval_share.baseline` | cap = baseline T0+T1 = 75% |
| Auto-approval share at 2x (`auto2`) | 60% | `assumptions.auto_approval_share.scaled` | cap = scaled T0+T1 = 85% (message uses `{cap}`) |
| Scenario (`scenario`) | `redeploy` | `scenarioOutcomes()` (new) | radio |
| Cost per master concept (`mconcept`) | $1,200 | `assumptions.master_concept_cost` | **UI-SPEC delta, recommended 13th field** (see influence ranking). If the planner declines, it must appear in the believe panel as a fixed assumption flagged "carries the result" |

Fixed (not inputs): `marketing_budget` ($78M), `multiplier` (2), `concept_growth_exponent`, tier mix and weights, sampling/escalation 5%/5%, reviewer rate $100/h, reviewer hours 1,200, rights $250/concept, storage, tooling ($150k/$600k), AI shares, build days, review service days, target utilisation 85%.

### Measured influence (ran `compute()` at defaults; each input +/-20%, others unchanged) [VERIFIED: local run 2026-10-24]

Cost per approved-live asset at 2x (default $41.18), change for -20% / +20%:

| Input | Cost/asset -20% / +20% | Swing (pts) | Utilisation (default 61.9%) -20% / +20% |
|---|---|---|---|
| Locales (= variants per concept) | +17.6% / -11.8% | 29.4 | -20.0% / +20.0% |
| Cost per master concept (not exposed) | -8.7% / +8.7% | 17.4 | 0 / 0 |
| Auto-approval at 2x | +6.3% / -6.3% | 12.6 | +23.5% / -23.5% |
| Review minutes | -5.4% / +5.4% | 10.8 | -20.0% / +20.0% |
| Approval yield | +7.3% / -1.5% (capped, see below) | 8.8 | +25.0% / -5.0% |
| Campaigns per year (identical to concepts per campaign) | +4.6% / -3.0% | 7.6 | -20.0% / +20.0% |
| Reviewer rate $/h (not exposed) | -5.4% / +5.4% | 10.8 | 0 / 0 |
| Rework rate | -0.8% / +0.8% | 1.6 | -2.6% / +2.6% |
| Variant generation cost (2x) | -0.5% / +0.5% | 1.0 | 0 / 0 |
| Reviewer FTE | 0 / 0 | 0 | +25.0% / -16.7% |
| Marketing FTE; auto-approval today | 0 / 0 | 0 | 0 / 0 |

Consequences:
- Default top five exposed inputs by cost swing: Locales, Auto-approval at 2x, Review minutes, Approval yield, then Campaigns/Concepts (exact tie; break ties by registry order). Utilisation ranking differs (reviewers, auto2, yield lead): the table orders by cost swing as UI-SPEC states, and both columns are shown.
- **Rank at runtime** (`sensitivity()` sorts by the reader's own numbers) and drift-test the static default order.
- **Clamp perturbations to validity**: +20% on yield 95% exceeds 100% (clamp to 100%, effective +5.3%); auto2 must stay <= cap; percent fields must stay in range. Label a clamped cell "capped" via a footnote line (text, not colour) and test it.
- The data.js basis for `asm-variant-cost` calls it "the most contestable cost driver". At these defaults it moves cost per asset by 1.0%; the per-asset cost fall (-36%) is mostly fixed concept cost spread over more variants per concept plus tooling. State this plainly in the believe panel; do not assert influence, compute it. The three "carries the result" markers come from the ranking.
- Hold scenario saving is tiny (below).

### CALC-02: weakest-grade propagation (dependency map derived from reading `side()` and `breakEven()`)

| Output | Depends on (UI inputs + fixed assumptions) |
|---|---|
| Approved-live variants per head | campaigns, concepts, locales, formats, marketers, multiplier, concept growth exponent |
| Cost per approved-live asset; total cost | volume inputs, yield, auto1/auto2, sampling, escalation, rework, minutes, reviewer rate, master concept cost, variant cost, rights, storage, tooling (reviewer FTE does not enter, verified 0.0%) |
| Budget share | total cost + marketing budget |
| AI spend | volume, yield, variant cost, AI shares, tooling |
| Cycle time | build days, review service days, utilisation inputs, rework |
| Review utilisation | volume, yield, auto shares, sampling/escalation, minutes, rework, reviewers, reviewer hours |
| Break-even / capacity floor | as utilisation, plus tier mix cap, target utilisation |

Implement `OUTPUT_DEPS` as arrays of assumption ids (`asm-*`), `weakestGrade(ids)` with order Speculative < Modelled < Benchmark, and the link target = first id (in dependency order) carrying the weakest grade. **Today every `kind:'input'|'model'` assumption is Modelled, so every output row is Modelled**; the logic must still be tested with a synthetic Speculative assumption (injectable `assumptions` map) so it is not dead code. Each static result claim's `ref` must equal that link target, because the governing-chip row test requires the row chip href, word and class to equal the claim's ref and grade.

### CALC-04: headcount scenarios (not in compute(); new pure function)

The model contains no people cost for marketers or idle reviewer capacity (cost.total has generation, review hours worked, rework, tooling, rights, storage). Scenario maths therefore needs two new Modelled assumption rows, both "no published benchmark":
- `asm-loaded-fte-cost`: $150,000 per FTE per year (basis: a round figure, reader to replace).
- `asm-change-mgmt`: $3,000 per affected FTE, one-off, year 1 (basis: about one week of loaded time, 150,000 / 2,080 x 40 = $2,885, rounded). Applied to marketing FTE + reviewer FTE in every scenario ("included in every scenario" per UI-SPEC). Excludes severance and exit costs; say so in the basis.

Definitions (defaults in brackets, from running compute()):
- Reviewer FTE required at target utilisation = `review_hours x (1 + rework) / (reviewer_hours_per_fte_year x target_utilisation)` [2x: 8.73 FTE vs 12 today; baseline needs 7.79].
- **Redeploy** (default): team flat, 2x volume; freed reviewer FTE = max(0, current - required) [3.27 FTE] is reported as capacity moved to other work, no cash saving; if negative, "needs {n} more reviewers".
- **Hold**: volume held at 1x, team flat, 2x-side costs: `compute({...inputs, multiplier: 1})` uses scaled assumptions at m=1 [total $2.535M vs baseline $2.589M, a saving of about $54k a year (2%), utilisation 30.9%]. The saving is small because the 2x tooling cost ($600k vs $150k) offsets the cheaper variants. Copy must not imply a material saving.
- **Reduce**: 2x volume, reviewers cut to the required FTE [saves 3.27 x $150k = about $490k a year people cost at the stated assumption]. Marketers are not cut: the model has no marketer capacity constraint, so say "reviewer headcount only".
- Returns `{ mode, reviewer_fte_required, reviewer_fte_delta, people_cost_change, production_cost_change, change_mgmt_one_off, first_year_net }`. Never NaN: guard zero capacity via compute validation.

UI-SPEC deltas to flag: UI-SPEC's results-table row list has nine rows and no people-cost rows; add a compact second table "Headcount scenario: {name}" below the results table (reviewer FTE required, FTE freed or needed, annual people cost change, production cost change, one-off change cost, first-year net), driven by the radio. The scenario does not change the baseline/2x columns, so the chart and hash semantics stay simple. The scenario descriptions in UI-SPEC copy should be adjusted: Hold = "Keep the team and today's volume; take any saving as lower cost." Reduce = "Cut reviewer headcount to the capacity the 2x output needs." Redeploy unchanged.

### `state.js` hash contract

- Format: `#s11?key=value&key=value`; parse with `new URLSearchParams(hash.slice(hash.indexOf('?') + 1))`; a plain `#s11`, `#src-...` hash returns `{values: defaults, notices: []}`.
- Keys (stable, lower-case): `campaigns, concepts, locales, marketers, reviewers, minutes, vcost, yield, rework, auto1, auto2, mconcept (if adopted), scenario`. `scenario` values `redeploy|hold|reduce`.
- Only non-default values are written. Percent fields are written as whole numbers ("85"), parsed back to fractions. Convert with `Number((v * 100).toPrecision(12))` and parse with `/ 100` then `Number(x.toPrecision(12))`, so 0.07 round-trips as 7 not 7.000000000000001.
- `coerce(field, text)`: trim; strip a trailing `%` for percent fields; allow thousands commas only in the strict form `^\d{1,3}(,\d{3})+(\.\d+)?$`; accept plain decimals `^\d+(\.\d+)?$`; reject everything else including `1e3`, `0x10`, `NaN`, `Infinity`, `-3`, `1,5`, whitespace inside digits. Empty -> "enter a number". Max sanity bound 1e9 (counts) so overflow is rare; `compute()` `field:null` remains the backstop.
- Zero policy (RESOLVED, reconciles CALC-07 with model meaning): reject 0 for campaigns, concepts, locales, marketers, reviewers, minutes, yield, vcost, mconcept (they are divisors or compute requires > 0 or the reading is meaningless); **allow 0 for rework and for auto1/auto2** (valid, meaningful). Tests cover each.
- Cross-field: `auto1 <= baseline cap (0.75)` and `auto2 <= scaled cap (0.85)` computed from `defaultAssumptions().tier_mix` and reported with the UI-SPEC wording. Map any `compute()` error back to a UI key: `campaigns_per_year -> campaigns`, `concepts_per_campaign -> concepts`, `variants_per_concept -> locales`, `marketing_fte -> marketers`, `reviewer_fte -> reviewers`, `approval_yield -> yield`, `rework_rate -> rework`, `review_minutes_per_variant -> minutes`, `master_concept_cost -> mconcept`, `variant_cost -> vcost`, `auto_approval_share -> auto1 or auto2 by whether the message contains "(baseline)" or "(scaled)"`. A `field: null` error becomes the overflow heading.
- Invalid hash values fall back to defaults and are returned in `notices` with field labels (UI-SPEC copy "Some values in the link were not valid, so defaults were used for: ..."). Unknown keys ignored. Duplicate keys: first wins.
- Round-trip tests: for random valid value sets `parse(serialise(v)) deepEqual v`; defaults serialise to `""`; each of `""`, `"abc"`, `"1e999"`, `"-3"`, `"0"` produces a field-named error and never NaN/Infinity in any output; error messages equal the UI-SPEC templates.

### node:test coverage plan (all DOM-free)
`state.test.js` (above); `model.test.js`: identity (multiplier 1 gives baseline equals 2x), monotonicity (more locales gives more assets and more cost), golden hand-calculated case for `scenarioOutcomes` (use the existing GOLDEN_ASSUMPTIONS pattern in calc.test.js), sensitivity ranking at defaults equals the table above, clamp behaviour, `weakestGrade` with injected Speculative, `present()` never contains `NaN|Infinity|undefined|null`, cost per asset falls as volume rises (CFO claim); `calc-page.test.js`: static s11 HTML matches `present(defaults)`; structural/CSP/source-scan tests from UI-SPEC "Test & Verification Hooks".

### Testing `ui.js` without a DOM dependency
1. Keep `ui.js` to wiring (target under 150 lines): read values, call `present()`, assign `textContent`/attributes/classes.
2. Source-scan tests (as UI-SPEC specifies): no `.style.`, `setAttribute('style'`, `innerHTML`, `localStorage|sessionStorage|document.cookie|fetch(|XMLHttpRequest|eval|new Function` in `ui.js|state.js|svg.js|model.js`.
3. **Optional automated JS-on smoke (local, not CI)** since no human preview is available: start `python3 -m http.server`, run `chrome --headless=new --disable-gpu --virtual-time-budget=3000 --dump-dom http://localhost:PORT/site/index.html`, assert the DOM has `<html class="js">`, no "NaN" text, and the summary `<output>` is non-empty. Add a variant with `#s11?locales=0` asserting an error summary appears. This was proven to execute a module under a `script-src 'self'` meta CSP [VERIFIED: local run]. Note that `file://` URLs do not load ES modules in Chrome; local preview must use an http server.
4. `svg.js`: export `chartSpec(results)` returning plain `{tag, attrs, text}` nodes (testable) and `renderChart(svgEl, results)` which only creates SVG nodes via `createElementNS`.

### CSP and script change (task 4)
- New meta: `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'` [CITED: UI-SPEC]. `connect-src` falls back to `default-src 'none'` which is correct (no network). `frame-ancestors` cannot be set in a meta CSP; ignore.
- Existing tests to change: `page.test.js` "static page guards" asserts `!html.includes('<script')`; replace with: exactly one `<script`, it is `<script type="module" src="js/ui.js"></script>`, before `</body>`, no inline script bodies, no `on\w+=` attributes. Keep `!html.includes(' style="')` (the 'landmarks and CSP hygiene' test). The SVG tests in figure/diagram tests forbid `<script` inside SVG: still valid. Add a test that the CSP string equals the UI-SPEC string.
- Module graph: `ui.js` imports `./model.js`, `./state.js`, `./svg.js`, `./data.js`; `data.js` imports `calc.js` (and `model.js` if default claims are generated). All same-origin, so `script-src 'self'` covers them; GitHub Pages serves `.js` with a JavaScript MIME type (required for modules).
- `<html class="js">` is added by `ui.js` after parse, so JS users see a brief flash of the no-JS note and hidden form before the module runs (`.calc-live{display:none}` until then). A second synchronous external `<script src>` in `<head>` could remove the flash but contradicts UI-SPEC's "one script"; keep UI-SPEC and accept the flash (recorded).
- Clipboard: `navigator.clipboard.writeText` needs a secure context (Pages is HTTPS; localhost counts as secure). The selection fallback uses `input.select()` and `document.execCommand('copy')`.
- `history.replaceState(null, '', '#s11?...')` is allowed; it does not trigger navigation or scrolling.

### Phase 2 UI-review carry-over to fold into Plan 1 (from 02-UI-REVIEW.md, verified against style.css and index.html)
1. `td.num` is `400 12px/1.6 mono` (style.css line 50) beside 17px serif row labels: add `font-variant-numeric: tabular-nums` and `vertical-align: baseline` to table cells, check alignment in headless Chrome screenshot (no new font size). Add `tr.total` rule (600 weight, 1px `--ink` top border); index.html line 390 already emits `<tr class="total">` with no CSS. Make "134.5% over capacity" (line 530) 600 weight.
2. Tier table default-mark layout: show the value first (`55%`), then the `.default-mark` "model default", with the range on its own line.
3. `th.tier` (line 109) loses to `tbody th[scope=row]`: change selector to `tbody th[scope=row].tier`.
4. s05, s07, s08 length: measure words with a script and either trim or record an exception in the plan SUMMARY (the budget is advisory).
5. Capacity wording: add "over capacity" beside 100.1% and 111.3% in s07 prose; add grade chips for the company-reported 28.4% and 111.3% under the chip rule.
6. Figures 4, 5, 6: give the Figure 5 "Pass" box an outward arrow, accent only the auto-approve arrow in Figure 4 (already so; add the missing arrow), reduce the isolated margins of Figure 6. These are SVG edits; diagram tests forbid digits and style attributes, so keep that.
7. Minor: telemetry bullet punctuation; s02 "budgets are not rising to meet the ambition" beside 7.7% to 7.8% (change to "budgets have flattened"); chip total is now 150: no recount needed unless s02 changes, but re-run the governing-chip test.
These are cheap, low-risk, and test-guarded; do them first so later plans start from a clean base.

## Vendor evidence ledger (task 1)

Access date for every row: **2026-10-24**. Source-id column is the proposed `src-` register id. Proposed register treatment for all vendor-authored pages: grade **Modelled**, flag **vendor-claimed** (consistent with Phase 2's Intercom precedent "Modelled + company-reported"); never Benchmark. The flag list in `data.js` (`FLAGS`) needs `competitor-authored` and `low confidence` added if used in s12 (UI-SPEC permits them); update `FLAGS` and the legend/register checks together.

### Corrections to COMPETITORS.md (read before drafting s12)

| Earlier note | Primary-page finding | Effect on the page |
|---|---|---|
| "No vendor documents tiered auto-approval" (Gradial) | Gradial docs: "For any task type, you can configure full review, spot-check, or auto-approve" and oversight "Early / Established / Advanced"; docs also say "spend changes and production publishes stay gated on human approval" (they conflict with each other) | Do NOT say Gradial lacks tiers. Say: oversight levels per task type are documented; a gate tiered by asset risk class and an eval harness calibrated against human reviewer decisions are "Not publicly documented (checked 2026-10-24)" |
| Gradial CMS/DAM list unconfirmed; "no AEM claim" | Primary integrations page lists Adobe Experience Manager (6.5 or Cloud) and Sitecore, Contentful, Contentstack, Sanity, Drupal, WordPress, Bynder | AEM may be stated, citing `src-gradial-integrations` |
| AirOps Human Review tier availability unconfirmed | Pricing-page markup shows Human Review and Approvals and Content Review and Quality Scores marked on all three tiers (Solo, Pro, Enterprise); Collaboration only on Enterprise | State "listed on all three plans" with MEDIUM note: read from table markup, the visible text lost the tick marks, and the markup column classes are `is-starter/is-scale/is-agency` while the FAQ also mentions Scale and Agency plans |
| Profound Series D from one outlet | Profound's own blog (2026-09-16): "$180M in Series D funding at a $1.8B valuation" | Verified, but funding is not needed for COMP-01..05: omit all funding from s12 |
| AirOps Webflow homepage figure conflicts (6% vs 10%) | The homepage headline no longer carries that figure; Webflow case study (2026-06-11) says 2% to nearly 10% | Use only the case-study figures with the page date |
| Gradial GEO is a workflow | Gradial publishes its own GEO case study (2-3% to 26% mention rate in four weeks; the page says it guided a site redesign that "did the heavy lifting") and GEO research on 260+ brands | Vendor-claimed, confounded by its own description; shows the AEO evidence is vendor-authored |

### Gradial

| ID | Dimension | Claim (verbatim or close paraphrase) | Source id / URL |
|---|---|---|---|
| G1 | CMS/DAM | "30 integrations"; CMS/DAM tiles: Adobe Experience Manager ("AEM 6.5 or AEM Cloud"), Sitecore ("XM Cloud, XP, or Content Hub"), Contentful, Contentstack, Sanity, Drupal, WordPress, Bynder | `src-gradial-integrations` https://www.gradial.com/integrations |
| G2 | Review/gate | "For any task type, you can configure full review, spot-check, or auto-approve. The level of autonomy is always in your control." | `src-gradial-docs-faq` https://docs.gradial.com/docs/faqs/faqs.md |
| G3 | Review/gate | "The team reviews at whatever level of oversight is configured - full review, spot-check, or auto-approve for trusted task types." QA, accessibility, brand and compliance checks are applied "before it reaches a human reviewer" | `src-gradial-docs-how` https://docs.gradial.com/docs/getting-started/how-gradial-works.md |
| G4 | Review/gate (conflict) | "hard limits on what agents can do unsupervised - spend changes and production publishes stay gated on human approval" and (FAQ, sandbox context) "nothing reaches your live site until a human approves it" | `src-gradial-docs-what` https://docs.gradial.com/docs/getting-started/what-is-gradial.md ; docs-faq |
| G5 | Eval | "An evals framework continuously measures output quality across task types" (mechanism not described); platform page: agents "improve ... using signals from agent evals, approvals, quality checks, and outcomes" | docs-what; `src-gradial-platform` https://www.gradial.com/platform |
| G6 | Imagery/rights | DAM docs: rights and expiry metadata captured at ingestion; QA flags "expired or rights-restricted" assets in the CMS before go-live. Image generation or licensing of imagery: not publicly documented (checked) | `src-gradial-docs-dam` https://docs.gradial.com/docs/asset-management/digital-asset-management.md |
| G7 | Localisation | Translation "inside your CMS"; docs assert "80% of your content" can be done without specialist linguists, "reserve ... human review for the 20%" (vendor assertion, no evidence); MSM inheritance for AEM | `src-gradial-docs-translation` https://docs.gradial.com/docs/translation-and-localization/translation.md |
| G8 | Experimentation/insight | Home page use cases "Run Continuous Experiments", "Simulate Journeys at Scale"; docs list an Adobe Target integration; no experiment win-rate or statistics method documented | `src-gradial-home` https://www.gradial.com/ |
| G9 | AEO/GEO | GEO workflow: monitoring, ranked fix plan, "Keep humans in control with review gates"; monitored models listed in docs; own case study "From 2-3% to 26% mention rate in four weeks" (vendor-claimed, confounded by a redesign) | `src-gradial-geo` https://www.gradial.com/solutions/generative-engine-optimization ; docs `.../docs/insights/geo-monitoring.md` |
| G10 | Vendor outcomes | T-Mobile: campaign "1,000 to 1,200 cumulative hours ... roughly 80 hours with QA in the loop, and in about 30 minutes for the underlying execution"; "90% faster time to market", "10x more throughput", "100% quality target". AWS: page creation "roughly ten hours to about thirty minutes". Micron: authoring "approximately four hours to about 20 minutes" | `src-gradial-customers` https://gradial.com/customers |
| G11 | Lock-in | "operates across clouds, models, and MCPs / agents ... without lock-in" (claim); a separate ACI product documents "Data Ownership and Portability" (do not conflate) | platform page; docs index |
| G12 | Security | Trust Center at trust.gradial.com is a JavaScript app (contents not retrieved); the FAQ answers "Is Gradial SOC 2 compliant?" only by referring to gradial.com/security, which lists no certification text. Cell: "SOC 2 status not stated on the pages read (checked)" | docs-faq |
| G13 | >10k variants | Batch Migration and bulk updates documented; no figure above hundreds of assets per job read; creative variant explosion not publicly documented | docs index; DAM docs ("a single campaign shoot can produce 600 assets") |

### AirOps

| ID | Dimension | Claim | Source id / URL |
|---|---|---|---|
| A1 | Review/gate | Pricing table marks "Content Review & Quality Scores" and "Human Review & Approvals" on Solo, Pro and Enterprise | `src-airops-pricing` https://www.airops.com/pricing (parsed from markup) |
| A2 | Review/gate | Enterprise page: "Every piece routes through your human review process before going live"; "Draft-mode publishing with human review at any stage". No risk tiering or auto-approval policy described (checked) | `src-airops-enterprise` https://www.airops.com/enterprise |
| A3 | Brand | Brand Kits: 1 / 1 / unlimited; Knowledge Bases 3 / 5 / unlimited | airops-pricing |
| A4 | AEO | Answer engines: Solo "ChatGPT" only; Pro and Enterprise: ChatGPT, Gemini, Perplexity, Google AI Studio, Claude, Copilot, Grok; enterprise page lists daily insights across ChatGPT, Gemini, Perplexity, Google AI Mode, Google AI Overviews (the two lists differ) | airops-pricing; airops-enterprise |
| A5 | Measurement | Conversion tracking via Google Analytics and Amplitude on all tiers; Custom Dashboards Enterprise only | airops-pricing |
| A6 | Scale | Grids and Playbooks and Workflows on all tiers; tasks 35,000 / 100,000 / custom; Solo overage $0.025 a task. Plan dollar prices not on the page (omit pricing) | airops-pricing |
| A7 | Security/lock-in | "SOC 2 Type II ... Report under NDA", "Data never used to train models", bring-your-own model keys, "unconditional opt-out clause", model-agnostic over OpenAI, Anthropic and Google | airops-enterprise |
| A8 | Imagery/rights/localisation/experimentation | Not publicly documented on the pages read (checked). Regions and languages exist as tracking and personalisation settings, not a localisation workflow | pricing; enterprise |
| A9 | Vendor outcomes | Webflow (2026-06-11): "5x increase in content refresh velocity", "40% immediate traffic uplift within days of publication", ChatGPT-attributed signups "from 2% to nearly 10%", "6x higher conversion rate from AI-sourced traffic vs traditional SEO". Chime (2025-11-17): "3x citation increase", "70% increase in refresh velocity" (16 to 27 posts a month), "89% time reduction" (45 minutes to under 5; the body also says under 10) | `src-airops-webflow` https://www.airops.com/blog/webflow-case-study ; `src-airops-chime` https://www.airops.com/blog/chime-case-study |
| A10 | Slot-in | Text and refresh workflows, AEO content engineering, Grids as batch runner; home page now positions AirOps as strategy plus platform for "AI discovery" | airops home https://www.airops.com |

### Profound

| ID | Dimension | Claim | Source id / URL |
|---|---|---|---|
| P1 | Review/gate | "Every Agent run includes an approval step before anything publishes, so you can stay in control of what goes live"; "Any content generated by an Agent can be reviewed, edited, or held". Tiering or auto-approval: not publicly documented (checked) | `src-profound-agents` https://tryprofound.com/features/agents |
| P2 | AEO breadth | Enterprise: "Up to 9 Answer Engines tracked": ChatGPT, Perplexity, Google AI Mode, Gemini, Microsoft Copilot, DeepSeek, Anthropic Claude, Google AI Overviews, Exa Search. Trial: ChatGPT, Gemini, Google AI Overviews, 50 prompts daily for 7 days | `src-profound-pricing` https://www.tryprofound.com/pricing |
| P3 | Methodology | How mentions and citations are collected and validated: not publicly documented on the pricing, agents or answer-engine pages read; FAQ says it "runs structured prompts across AI platforms" (checked) | pricing |
| P4 | Lock-in/data | Trial: history, exports and API "None"; Enterprise: "All time", "CSV, JSON", API "Yes"; REST API docs exist at docs.tryprofound.com | pricing |
| P5 | Security | "SSO/SAML + SOC 2 compliance" listed under Enterprise | pricing |
| P6 | Scale | "Process hundreds of inputs in parallel" in Sheets; "Each Agent queries 16 reasoning models" | agents |
| P7 | Brand/imagery | Brand kit and knowledge base feed agents; home page: "Generates posts and images, sized per platform"; rights handling not publicly documented | `src-profound-home` https://www.tryprofound.com ; agents |
| P8 | Measurement | Agent Analytics (server and CDN logs: Akamai, AWS, Cloudflare, Fastly, Google Analytics, Google Cloud Platform, Netlify, Vercel, WordPress); no conversion-to-revenue claim beyond testimonials | home; pricing |
| P9 | Vendor outcomes (home testimonials, no method) | "50% increase in Plaid's AI Search visibility", "30% Time saved", "100x Increase in monthly revenue from AI systems for one client", "7x Increase in brand visibility for key topic", "16 competitors surpassed"; agents page: Hone "visibility by 800%" | profound-home; profound-agents |

### Matrix cell rules (from UI-SPEC)
- Each vendor fact: statement (<=25 words) + `.cite` to the register row. Outcome numbers add `.flag` "vendor-claimed", never averaged, never next to a Benchmark chip, and one vendor per cell.
- Absence cell: `.nd` "Not publicly documented" + "checked 2026-10-24". Never "does not have".
- Suggested "falls short / not documented" phrasing grounded above: Gradial: imagery generation and licensing, a risk-class-tiered gate, an eval harness calibrated to human decisions, creative variant production above hundreds of assets per job. AirOps: imagery, rights, localisation workflow, experimentation, tiered auto-approval. Profound: tiered approval, rights, localisation workflow, experimentation, mention-counting methodology.
- Competitor-authored reviews (Profound's AirOps review, Analyze AI's Profound review) were not re-fetched this session: **omit them** (Open Question 5 resolved); the pages' own limitations carry the falls-short column.
- Omitted by decision: all funding and valuation figures (verified for Profound only; irrelevant), AirOps dollar prices, vendor testimonial counts ("25,000 marketers"), "trusted by a third of the Fortune 100".
- CMO 2x spine column cells link to s03 (factory), s04 (platform and skills), s05 (10,000-asset campaign), s06 (review agent), s07 (gate), s08 (eval harness); each ends "Design".
- Differentiation sentence to use: "The pages read do not describe a gate tiered by asset risk class, or an eval harness calibrated against human reviewer decisions. Gradial does document oversight levels per task type." (Verified wording; avoids the false "no vendor documents tiers".)

## Levers evidence ledger (task 2)

| ID | Claim | Primary source, definition, bias | Proposed grade |
|---|---|---|---|
| E-1 | "Only 12% of experiments produce a statistically significant improvement on the primary metric. Teams are roughly as likely to see a negative result as a positive one." (127,000 true experiments on its own platforms, 2018-2023; a "winning experiment" is a true experiment whose primary metric moves the winning direction at >=90% significance; the same page also argues "volume is how you turn unpredictable individual outcomes into reliable program-level improvement") | https://www.optimizely.com/insights/top-10-takeaways-from-the-experimentation-playbook/ ; definition https://www.optimizely.com/field-notes/guides/173000-experiments (a later 173K-experiment dataset) . Experimentation-platform vendor; self-selected customers; commercial interest in test volume | Modelled + vendor-claimed |
| E-2 | "Only one third of the ideas tested at Microsoft improved the metric(s) they were designed to improve" (product ideas, not marketing) | Kohavi, Deng, Frasca, Walker, Xu, Pohlmann, "Online Controlled Experiments at Large Scale", KDD 2013, Tenet 3, https://exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf (peer-reviewed paper; company-internal data) | Modelled + company-reported (consistent with Phase 2 precedent); not Benchmark |
| E-3 | At Google "about 10 percent" of controlled experiments led to business changes (quoted from Jim Manzi in the same paper) | Same paper, Tenet 3; second-hand quote; the metric is "led to business changes", not "won" | Modelled + company-reported, flagged second-hand |
| E-x | DRIP 36.3% "significant winners" | **Could not be verified**: no primary DRIP source found; the one secondary table gives identical 36.3% and 41.6% values for two different sources, which looks like a copy error | **Drop it.** CONTEXT's "~12-36%" becomes "about 10-33% by definition" (RESOLVED, flag as a deviation in the plan SUMMARY) |

Win-rate arithmetic for the page: expected winners = tests run x rate; show it at the reader-free default of, say, 20 tests, but keep any number as a graded `data-fig`. Traffic bound: a test needs enough visitors per arm (the Optimizely definition requires 1,000+ visitors per arm for a "true experiment"); more tests on the same traffic means each is underpowered or they queue. State "more tests do not always mean more wins" with the 12% vs one-third spread as evidence that the definition drives the number. Do not name Optimizely or Microsoft in s09 prose (see Pitfall 1): write "an experimentation-platform vendor's dataset" and "a large software company's paper" with the register link.

| ID | Localisation claim | Source and caveat | Grade |
|---|---|---|---|
| L-1 | Post-editing neural machine translation made translators faster by 59.74% (German to French) and 9.26% (German to Italian) in a banking and finance study; quality equal or slightly better; "Three out of four translators were faster" in a sub-test | Läubli et al., arXiv:1906.01685 (2019), https://arxiv.org/abs/1906.01685 (abstract) and PDF text. Pre-LLM, one domain, few translators; shows variance, not a rate | Modelled (not Benchmark: tiny sample, pre-LLM) |
| L-2 | An enterprise saved "more than $3.4 million in translation costs" in year one, content "got to market 50% faster", MQM "99+" | Smartling case study (anonymised customer), https://smartling.com/resources/case-study/technology-customer-case-study . Vendor-selected | Modelled + vendor-claimed |
| L-3 | Per-word rates | No primary found; FEATURES.md only had a vendor blog | State "we did not find a primary source"; do not give a rate |
| L-x | Intel/Lilt 40% year-on-year saving | Primary PDF returned 403; **omit** |  |

AEO/GEO (LEVER-05): does an independent measurement study exist? **Yes, but it argues for caution, not lift.**

| ID | Finding | Source | Notes / grade |
|---|---|---|---|
| X-1 | 12 months of GA4 data across 100 sites (145 million sessions): sessions from ChatGPT were 0.62% of Google organic volume, 0.73% for all LLMs; where conversions were tracked (55 sites) ChatGPT visitors converted at 13.8% vs 3.02% for Google organic, yet Google drove 96.5% of conversions; ChatGPT sessions have been falling since August 2025 | Marie Haynes, 2026-10-21, https://www.mariehaynes.com/geo-is-a-distraction/ (SEO consultancy, non-random sample, author sells SEO services) | Modelled, no flag |
| X-2 | 95 websites, Sep 2025 to Aug 2026: organic search delivered 39 times the traffic of AI assistants (AI = 2.6% of organic, rising from about 2.0% to 3.9% by August 2026); AI conversion 7.18% vs 6.08% organic (1.18x pooled); AI converted worse than organic on 23 of 63 sites; 3.2 AI conversions per 100 organic | The SEO Works (UK agency that also sells GEO services), https://www.seoworks.co.uk/downloads/ai-referral-traffic-benchmark/ (undated page; data to Aug 2026) | Modelled, no flag; sell-side author finds a low number, which cuts against bias |
| X-3 | Across 12 sites, "Direct sessions with identifiable AI traces are only 0.003% of total direct traffic"; AI visibility and direct or branded traffic correlations did not survive a shifted-series test; "I could not yet detect 'hidden' AI traffic without self-reported attribution" | Kevin Indig, Growth Memo, 2026-10-19, https://www.growth-memo.com/p/does-ai-drive-more-direct-traffic (small, B2B-skewed sample) | Modelled |
| X-4 | "GEO can boost visibility by up to 40% in generative engine responses" on an author-built benchmark (GEO-bench) | Aggarwal et al., KDD 2024, https://arxiv.org/abs/2311.09735 . Measures citation visibility in model answers, not sessions or pipeline | Modelled |
| X-5 | Brand lists from AI assistants almost never repeat across identical prompts (reported under 1 in 100); visibility share was more stable than rank | SparkToro and Gumshoe.ai study; **primary post not retrieved** (found only via Search Engine Journal and Search Engine Land summaries; Search Engine Land returned 403); authors have a commercial interest and it is not peer reviewed | **Omit** (secondary only) or mention as "we could not read the primary". Recommend omit |
| X-6 | Vendor and agency outcomes (Gradial 2-3% to 26% mention rate, AirOps 3x citations, Profound 50% visibility) | Ledger rows G9, A9, P9 | vendor-claimed, never averaged |

Implications for LEVER-05: grade the lever Speculative as already set in data.js (`asm-lever-06-evidence`). Use X-1..X-3 to say the referral channel is small today and visibility metrics have not been shown to move pipeline: use the negative phrasing "We did not find evidence that visibility gains translate into pipeline." Output metric stays answer assets published or refreshed per head. The s01 lever table and data.js already carry Speculative for AEO; keep the register row text in sync (the register row `asm-lever-06-evidence` basis may need one added sentence, which is also tested field by field).

Ops (LEVER-04), statutory damages, verified from Cornell LII:
- 17 U.S.C. 504(c)(1): "not less than $750 or more than $30,000 as the court considers just" per work; "all the parts of a compilation or derivative work constitute one work" [VERIFIED: https://www.law.cornell.edu/uscode/text/17/504].
- (c)(2) willful: "not more than $150,000"; innocent: "not less than $200" [VERIFIED: same].
- 17 U.S.C. 412: no statutory damages for infringement of an unpublished work commenced before registration, or for infringement commenced after first publication and before registration unless registered within three months of publication [VERIFIED: https://www.law.cornell.edu/uscode/text/17/412]. Add it as one sentence of caveat; it shrinks the exposure a lot.
- Table rows: Ordinary "$750 to $30,000 per work"; Innocent "court may reduce to not less than $200"; Wilful "court may increase to not more than $150,000". Each Benchmark with `src-cornell-17usc504`. Not legal advice callout per UI-SPEC.
- **Do not multiply by the variant count.** Derivatives of one work count as one work, so "10,000 assets x $150,000" is wrong. Illustrate per work, with an incident rate per 1,000 master concepts (rights attach to masters in this model), Speculative, reader-owned: e.g. "if 1 in 1,000 master concepts has a rights problem, 1,189 concepts at 2x is about 1.2 incidents a year, $0.9k to $36k at the ordinary range and up to about $178k if wilful". The incident rate default is invented: grade Speculative with the "Treat this rate as yours to replace" sentence. The numbers must be `data-fig` claims; the statute digits "17" and "504" in prose need `ALLOWED_NUMERIC_TOKENS` entries or must sit in a `data-fig`.
- Honest finding to state: even at the wilful ceiling this is small relative to the $3.3M production cost; the tail risk is injunction and brand harm, not damages.

Insight and reporting (LEVER-03), OUTC-02: MMM calibration. Google's open-source Meridian documents GeoX geo experiments to "calibrate your MMM" with priors from experiment results [CITED: https://developers.google.com/meridian/geox; the calibration guide page itself was not opened]. Grade Modelled. Method names for the proof block (holdouts, pre-registered metrics, multiple-comparison correction): these are methods, not claims, so no source row is needed for the names, but any numeric statement needs one. Kohavi paper (E-2) supports "most ideas fail, so measure". Do not name Google/Meridian in s10 prose (VENDOR_RE catches "google"): write "an open-source marketing-mix framework" with a register link.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Hash parsing | String splitting on `&` and `=` | `URLSearchParams` over an allow-list of keys | Encoding edge cases; prototype-pollution safety |
| Number formatting | Template strings | Existing `formatValue()` in `data.js` (extend with `pctchg1` for signed one-decimal) | Already handles U+2212 minus, rounding, kinds |
| Validation messages and error mapping | Per-field ad hoc | `compute()` errors plus a `fields.js` rule table | One source; CALC-07 reuses `undefined_ratios` |
| Chart | A chart library | `svg.js` building `createElementNS` nodes from the UI-SPEC geometry | Locked by CLAUDE.md |
| Copy to clipboard | Custom | `navigator.clipboard.writeText` with `select()` fallback | Spec-defined |
| Weakest-grade logic | Inline in `ui.js` | `model.js` `weakestGrade()` with a dependency map | Testable; avoids dead code |

## Common Pitfalls

### Pitfall 1: the vendor-name test will fail s09 and s10
**What goes wrong:** `VENDOR_RE` in `test/page.test.js` (line 371) bans, outside s12 and s15: optimizely, microsoft, google, chatgpt, openai, anthropic, claude, gemini, copilot, smartling, adobe, aws, amazon, and others. s09 naturally mentions Optimizely, Microsoft, Google (Manzi), Smartling, ChatGPT. Also "Intercom" is allowed exactly once outside s12/s15.
**How to avoid:** anonymise in s09/s10 prose and table source cells ("an experimentation-platform vendor's dataset of 127,000 tests", "a large software company's paper", "AI assistants", "an open-source marketing-mix framework", "a translation-technology vendor's case study"), linking to the register row where the name appears. This also honours CLAUDE.md neutrality. Do not weaken the test.

### Pitfall 2: numeric gate, chip rules and calculator static content
The gate (test line 423) strips only `<span data-fig>`, chips, section cross-links and SVG; any other digit in s09-s12 text (hint "Default 40", "17 U.S.C. 504", "Figure 8" is stripped, "12 months", "10,000", the "{n} changed" status) fails unless allow-listed or wrapped. Row-kind units need exactly one chip in the last cell and all `data-fig`s in that row must share the chip's ref and grade. Plan the s11 results, sensitivity, believe and maths markup against these rules from the start; give every static default number a claim (generate them programmatically in `data.js` from `compute()`/`sensitivity()`, with a `derived` or `calc` descriptor and a test that recomputes it) rather than adding hundreds of literals. Input `value="40"` attributes are not text and are fine.

### Pitfall 3: UI-SPEC wording that the model contradicts
(a) UI-SPEC lists "variants per campaign" and "locales" as separate inputs; compute() has no locales (resolved above). (b) "Variant generation cost" is a pair in compute (resolved above). (c) `td.num` sign wording: UI-SPEC shows "-3.1%" with a hyphen but `formatValue` uses U+2212 (true minus); use U+2212 for consistency and screen readers and update the sample in tests. (d) UI-SPEC says "Hold: keep the volume; take the saving as lower cost": the saving is about 2%. (e) The results-table row list has no people-cost rows (resolved with a second table).

### Pitfall 4: +/-20% leaves the valid range
Yield 95% x 1.2 > 100%; percent shares and the auto2 cap. Without clamping, `compute()` returns validation errors and the sensitivity table shows blanks or NaN. Clamp, label, test.

### Pitfall 5: reviewer FTE does not move cost per asset
Cost per asset is independent of reviewer FTE and marketing FTE in this model (review cost is hours worked x rate, not idle capacity). A reader who changes reviewers will see no cost change and may think the tool is broken: the hint under both fields must say what they do affect ("changes utilisation, cycle time and break-even only").

### Pitfall 6: Gradial docs contradict themselves on human approval
"Production publishes stay gated on human approval" vs "auto-approve for trusted task types". Quote both with their sources in the ledger or choose the narrower claim ("documents configurable oversight per task type"); do not assert either as the whole truth.

### Pitfall 7: AirOps pricing markup is the only evidence for per-tier features
The visible text lost the tick icons. The "all three tiers" reading comes from SVG check markup and class names that do not match the visible plan names (starter/scale/agency vs Solo/Pro/Enterprise) and the FAQ mentions Scale and Agency plans. State it as read from the table, grade MEDIUM, and phrase the cell "listed on all three plans".

### Pitfall 8: js flash and `:target`
`.calc-live` is hidden until `ui.js` adds `js` to `<html>`: expected flash. Plain `#s11` and `#src-` hashes must keep working: `ui.js` must only act on hashes beginning `#s11?`.

### Pitfall 9: sticky first column and print for the matrix
The matrix needs `min-width:960px` inside `.table-scroll`, sticky `th[scope=row]` limited to `.matrix` (style test); print rule sets `position:static`. Existing style tests restrict colours to tokens and font sizes to four; reuse existing classes.

### Pitfall 10: data.js `FLAGS` and register tests
Adding sources with flag `vendor-claimed` is already permitted; `competitor-authored`/`low confidence` require editing `FLAGS` and any legend text that enumerates flags. The register tests compare each source row field by field (`title`, `publisher`, `published`, `accessed`, `url`, `bias`, `read_via`, grade, flag), so every new source needs all fields and a matching HTML row.

## Code Examples

### Hash round-trip (pure, allow-list)
```js
// Source: URLSearchParams (WHATWG URL Standard); pattern for state.js
export function parseHash(hash, fields) {
  const q = hash.startsWith('#s11?') ? hash.slice(5) : '';
  const params = new URLSearchParams(q);
  const values = {}, notices = [];
  for (const f of fields) {           // allow-list; never iterate params directly
    const raw = params.get(f.key);
    if (raw === null) { values[f.key] = f.default; continue; }
    const r = coerce(f, raw);
    if (r.ok) values[f.key] = r.value; else { values[f.key] = f.default; notices.push(f.label); }
  }
  return { values, notices };
}
```

### Strict number coercion
```js
const PLAIN = /^\d+(\.\d+)?$/, COMMAS = /^\d{1,3}(,\d{3})+(\.\d+)?$/;
export function toNumber(text) {
  const t = String(text).trim().replace(/%$/, '');
  if (t === '') return { ok: false, why: 'empty' };
  const n = PLAIN.test(t) ? Number(t) : COMMAS.test(t) ? Number(t.replace(/,/g, '')) : NaN;
  return Number.isFinite(n) ? { ok: true, value: n } : { ok: false, why: 'format' };
}
```

### Required reviewer FTE (scenario maths)
```js
// review_hours already includes generated variants x human-touch share x minutes
const requiredFte = (side, a) => (side.review_hours * (1 + a.rework_rate)) /
  (a.reviewer_hours_per_fte_year * a.target_utilisation);
```

### Headless JS-on smoke (local, not CI)
```bash
python3 -m http.server 8765 --directory site &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --virtual-time-budget=3000 --dump-dom http://localhost:8765/index.html 2>/dev/null | grep -c '<html[^>]*class="js"'
```

## State of the Art

| Old (research baseline) | Current (this session) | Impact |
|---|---|---|
| Vendors have only a uniform human gate | Gradial documents per-task-type full review / spot-check / auto-approve | Reword the differentiation claim |
| Gradial CMS/DAM list unverified | Integrations page lists AEM, Sitecore, Contentful, Contentstack, Sanity, Drupal, WordPress, Bynder | AEM may be named with citation |
| AEO evidence vendor-only | Three independent October 2026 datasets show AI referrals small; one academic benchmark | AEO lever stays Speculative, with a measured-caution paragraph |
| Win-rate range ~12-36% | 12% (vendor), one third (Microsoft, peer-reviewed), about 10% (Google, second-hand); 36.3% unverifiable | Use 10-33% by definition |

## Runtime State Inventory
Not applicable: this is an additive build phase, not a rename or migration. No stored data, services, OS registrations or secrets are involved. The static site has no runtime state; the only build artefact is the Pages workflow, which runs `node --test` before deploy.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `$150,000` loaded cost per FTE and `$3,000` one-off change cost per affected FTE are reasonable Modelled defaults | CALC-04 | Scenario numbers shift; reader can override only via a future input, and the register says "no published benchmark" |
| A2 | Incident rate of 1 per 1,000 master concepts as the Speculative default | Ops statutory illustration | Illustrative only; labelled Speculative, reader-owned |
| A3 | Vendor pages graded Modelled + vendor-claimed (not Speculative) | Register treatment | Planner/user may prefer Speculative for outcome pages |
| A4 | Locales default 5 and 8 formats per locale reproduce the existing 40 variants per concept | Calculator mapping | Pure decomposition of an existing default; tested for equality |
| A5 | AirOps column classes `is-starter/is-scale/is-agency` map to Solo/Pro/Enterprise | AirOps ledger A1 | Wrong tier attribution; mitigated by "listed on all three plans" phrasing |
| A6 | A flash of the no-JS note before `ui.js` runs is acceptable | CSP section | UI-SPEC already accepts one script; cosmetic only |

## Open Questions (all RESOLVED recommendations; planner proceeds without user input)

1. **Where does locales live in the model?** RESOLVED: fold into `variants_per_concept = formats x locales` in `model.js`; two new assumption rows; equality test with the existing 40.
2. **One field for a two-sided variant cost?** RESOLVED: the field is the 2x cost; today's cost stays fixed.
3. **Zero policy vs CALC-07?** RESOLVED: reject zero for divisors and costs, allow zero for rework and auto-approval shares.
4. **How to show static default numbers under the existing gates?** RESOLVED: generate `data-fig` claims in `data.js` from `compute()`/`sensitivity()` via a `calc` descriptor and recompute them in `data.test.js`; `model.js` must not import `data.js`.
5. **Competitor-authored reviews?** RESOLVED: omit (not re-fetched this session); no "competitor-authored" flag needed, so `FLAGS` gains only what is used.
6. **DRIP 36.3% and SparkToro/Gumshoe study?** RESOLVED: drop DRIP (unverifiable); omit SparkToro/Gumshoe (secondary only).
7. **Scenario semantics (CALC-04)?** RESOLVED: as defined above with a second table; flag UI-SPEC delta.
8. **Add master concept cost as an input?** RESOLVED: yes, recommended 13th field (second most influential driver). If declined, list it in the believe panel as a fixed assumption that carries the result.
9. **s15 flags and registers**: still needs a human legal read of the ops and statute wording before publication (Phase 4 scope); flagged in the plan SUMMARY, not blocking.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | tests, local scripts | yes | v23.7.0 | CI uses setup-node (existing workflow) |
| python3 | local http server for preview and smoke | yes | system | `npx serve` not needed |
| Google Chrome (headless) | optional JS-on smoke and screenshots | yes | local app | skip; rely on source-scan tests |
| poppler `pdftotext` | not required by the build (used in research) | yes | homebrew | n/a |
| ctx7 / Context7 | not needed (no libraries) | n/a | - | - |

**Missing dependencies with no fallback:** none.

## Validation Architecture
Skipped as a standalone section: `.planning/config.json` has `workflow.nyquist_validation: false`. The test plan lives under "node:test coverage plan" and in UI-SPEC "Test & Verification Hooks". Existing baseline: 170 tests across six files; quick run `node --test`; full run is the same command.

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Allow-listed hash keys, strict `coerce()`, bounded values, `textContent` only |
| V14 Configuration | yes | Meta CSP `script-src 'self'`; no inline script or style; no CDN |
| V2/V3/V4/V6, V7 | no | No auth, sessions, storage, crypto or server |

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| DOM XSS via the URL hash or input echoed into the page | Tampering | `textContent`/`setAttribute` with allow-listed attributes; never `innerHTML`; field labels come from the registry, not the hash |
| Prototype pollution from hash keys | Tampering | Iterate the registry allow-list, not `URLSearchParams` entries |
| Resource exhaustion from huge numbers | DoS | Bounds plus `compute()` finite checks; debounce recompute |
| Privacy leak via share link | Information disclosure | Hash stays client-side (never sent in requests); hint says nothing is sent or saved; no analytics |

## Sources

### Primary (HIGH confidence)
- https://www.law.cornell.edu/uscode/text/17/504 and /412 - statute text, read 2026-10-24
- https://exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf - Kohavi et al. KDD 2013, Tenet 3
- https://arxiv.org/abs/1906.01685 and PDF; https://arxiv.org/abs/2311.09735
- https://www.optimizely.com/insights/top-10-takeaways-from-the-experimentation-playbook/ and /field-notes/guides/173000-experiments
- Vendor primary pages read: gradial.com (home, platform, customers, integrations, geo), docs.gradial.com (llms.txt, what-is-gradial, how-gradial-works, faqs, DAM, translation, regulatory), airops.com (home, pricing, enterprise, Webflow and Chime case studies), tryprofound.com (home, pricing, features/agents, series-D blog), docs.tryprofound.com/llms.txt
- https://www.mariehaynes.com/geo-is-a-distraction/ ; https://www.growth-memo.com/p/does-ai-drive-more-direct-traffic ; https://www.seoworks.co.uk/downloads/ai-referral-traffic-benchmark/ ; https://sparktoro.com/blog/is-ai-visibility-a-marketing-boondoggle/ (commentary pointing to the three studies)
- https://smartling.com/resources/case-study/technology-customer-case-study
- Local execution: `compute()` sensitivity run, headless Chrome smoke test (scratchpad)

### Secondary (MEDIUM)
- https://developers.google.com/meridian/geox (search summary and a banner read; calibration guide not opened)

### Tertiary (LOW, not used on the page)
- Search Engine Journal / Search Engine Land / WARC summaries of the SparkToro and Gumshoe study (primary unread); secondary tables attributing 36.3% to DRIP

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH (no new dependencies; verified locally)
- Calculator architecture and measured influence: HIGH (executed against real `compute()`)
- Vendor ledger: MEDIUM-HIGH (primary pages read; AirOps per-tier marks parsed from markup; Gradial trust centre unreadable)
- Levers evidence: MEDIUM (independent AEO studies are small, non-random samples; win-rate sources have definition and bias issues)
- Pitfalls: HIGH (checked against the existing test code)

**Research date:** 2026-10-24
**Valid until:** 7 days for vendor pages and AEO studies (fast-moving); 30 days for calculator and statute findings
