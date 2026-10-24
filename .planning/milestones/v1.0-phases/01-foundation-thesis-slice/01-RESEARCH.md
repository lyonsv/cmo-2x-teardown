# Phase 1: Foundation & Thesis Slice - Research

**Researched:** 2026-10-24
**Domain:** Static editorial page (hand-written HTML/CSS), pure-JS calculator module, `node:test`, GitHub Pages via Actions
**Confidence:** HIGH for tooling and workflow; MEDIUM for the Gartner 2026 grade; every calculator default is Modelled by construction.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
**Delivery & repo**
- Create a **public** GitHub repo `lyonsv/cmo-2x-teardown` (mirrors `intercom-2x-teardown`) and push `main`. **Confirm with the user before creating the repo or pushing** (outward-facing action).
- Layout: `site/index.html`, `site/assets/style.css`, `site/js/data.js`, `site/js/calc.js`, `site/.nojekyll`; tests in `test/` at the repo root. All paths relative.
- Deploy: Actions workflow on push to `main`: `node --test` job -> `actions/upload-pages-artifact` (path `site/`) -> `actions/deploy-pages`. Verify current action major versions when writing it.
- Prose numbers are written statically in the HTML **and** tagged `data-fig="<id>"`; a `node:test` test parses `site/index.html` and checks every tagged value against `data.js` (page works with JS off and cannot drift from the data).

**Front matter & voice**
- Title: "CMO 2x: what doubling a marketing organisation's output would take". Kicker: "A forward-looking teardown · projection, not retrospective".
- Byline "Vincent Lyons". COI box: "The author works at iStock/Getty Images. The page is vendor-neutral by design; where imagery sourcing or Getty v Stability is discussed, this note is repeated."
- Subject-org assumptions in metadata (all Modelled, reader-overridable in Phase 3 calculator): ~$1B revenue, ~$78M marketing budget (7.8% of revenue), ~120 marketing FTE, ~40 campaigns/yr.
- British English; analytical and sceptical tone like the reference. Answer-first paragraph <=120 words stating the claim, the condition (governed review) and the falsifier.

**Metric & CFO model**
- Headline metric: approved-and-live asset-variants per marketing head per quarter; all marketing FTE in the denominator; always shown beside unique concepts and variants per concept; tier-weighted view offered only as a sensitivity.
- `calc.js` implements the **full model now** (variants, review capacity with auto-approval share and sampling/escalation, fully loaded cost per approved-live asset - generation, review, rework, tooling, rights, storage - and cycle time). Phase 3 only adds UI. Pure ES module, no DOM, `compute(inputs, assumptions)`; invalid inputs return validation errors, never NaN/Infinity.
- Tests (CALC-08): 1x identity, monotonicity, hand-calculated golden case, zero/edge inputs, cost per approved asset falls with volume.
- Gartner 7.7% (2025) / 7.8% (2026): grade **Benchmark** only if a primary or Gartner press-release page is confirmed during plan research; otherwise Modelled with a "secondary source" note.
- Falsifier: "If approved-live variants per head double but holdout-measured conversion/CAC does not improve and first-pass compliance falls within 2-3 quarters, the 2x claim is false for that org."
- Section 02 figure: paired horizontal bars, baseline vs 2x, for output per head, cost per approved-live asset (stacked by cost component) and AI spend; inline SVG with `<title>`/`<desc>` plus a `<table>` equivalent.
- AI spend framed as a floor, not a KPI, with the Goodhart rationale.

**Skeleton sections & register**
- Sections 03-14: real `<section id="sNN">` with `.sec-head`, title, a "Coming in a later update" note and a one-sentence scope, so every TOC anchor works. 15 numbered sections per the research structure (01 Claim & measurement ... 12 How this compares ... 15 Source register).
- Section 15 in Phase 1: working source register + assumptions register for the `data.js` entries Phase 1 uses, rendered statically in HTML and verified by test against `data.js`.
- Grade chip text (Benchmark / Modelled / Speculative) is an `<a href="#src-...">` / `#asm-...` link to its register row; the vendor-claimed / company-reported flag is a separate small mono tag after the chip and never upgrades a grade.
- Copy the reference's tokens and `.wrap` / `.sec-head` / `.chip` styles nearly verbatim; remap chip colours to the three grades plus a neutral flag style; light theme only, plus `@media print`. No base64 images.

### Claude's Discretion
- Exact default values for calc assumptions beyond the subject org (cost components, auto-approval share, rework rate) - Modelled, stated in the assumptions register.
- Exact wording of section 01/02 prose, within the decisions above.

### Deferred Ideas (OUT OF SCOPE)
- Dark mode - not planned.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHELL-01 | Public Pages URL, static `site/`, relative paths, `.nojekyll` | Workflow in Code Examples; Pitfall 1 (dotfile excluded from artifact; harmless) and Pitfall 2 (Pages source must be "GitHub Actions") |
| SHELL-02 | Title block, metadata, answer-first paragraph | UI-SPEC structure; subject-org values in the data.js shape |
| SHELL-03 | TOC to 15 sections | Section titles table; anchor test |
| SHELL-04 | Editorial design language, no base64 | UI-SPEC; static-page tests (no `data:image`, no `<script>`) |
| SHELL-05 | Actions workflow gated on `node --test` | Verified action versions; `needs: test` pattern |
| CRED-01..02 | Grade key, chips linked to registers | data.js shape; chip-link test |
| CRED-03 | Headline metric definition with concepts and variants per concept | calc.js model (`headline` output), tier weighting as sensitivity only |
| CRED-04 | COI note | `.callout.coi`; test that COI text is present |
| CRED-05 | "What 2x does not mean" + falsifier | Copy locked in UI-SPEC |
| CRED-06 | One `data.js` | data.js shape; drift test |
| CFO-01 | Flat-budget framing on Gartner | Gartner verification below |
| CFO-02 | Fully loaded cost per approved-live asset | calc.js model, six components |
| CFO-03 | AI spend as floor | `ai_spend` output; copy in UI-SPEC |
| CFO-04 | Static baseline-vs-2x SVG + table | Figure values generated from `compute()` defaults, mirrored in HTML, verified by test |
| LEVER-06 | Six-lever table in s01 | Lever list in SUMMARY.md "The Six Levers" (not re-researched) |
| CALC-08 | Pure `calc.js` with node:test tests | Test plan, golden case, tooling findings |
</phase_requirements>

## Summary

Phase 1 is a standard hand-written-HTML build; the only real engineering is `calc.js` / `data.js` and the tests that bind prose to data. All tooling questions were resolved by direct checks on 2026-10-24: current Actions majors are checkout v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5, setup-node v7. `node --test` with no arguments discovers `test/**/*.js` and `*.test.js` files; ESM works. Add a root `package.json` containing only `{"type":"module"}` so `.js` files are unambiguously ESM on every Node 22.x runner. Do NOT pass a bare directory (`node --test test/`) on Node 23: it errors.

Gartner: the 2025 release text (7.7%, 402 CMOs, Feb-Mar 2025) was read verbatim in a Business Wire reproduction of Gartner's own press release. The 2026 Gartner newsroom page (7.8%, 401 CMOs, Jan-Mar 2026) returns HTTP 403 to automated fetch, so the 7.8% wording was read only via trade press quoting the release. Recommendation below: grade 7.7% (2025) Benchmark; grade 7.8% (2026) Benchmark only if the planner includes a one-minute manual browser check of the Gartner URL (a `checkpoint:human-verify` task), otherwise Modelled with the secondary-source note.

The calculator model (below) produces, for the default subject org, 83 -> 167 approved-live variants per head per quarter, cost per approved-live asset $63.48 -> $40.57 (-36%), production-attributable cost $2.54M -> $3.25M, and AI spend $38k -> $338k. All of those are Modelled. Production-attributable cost is about 3-4% of the $78M budget, because media dominates; the page must say that, or the CFO will ask.

**Primary recommendation:** Build `data.js` first (claims, assumptions, sources, with a `display` string per claim), then `calc.js` against it, then the tests, then the HTML with `data-fig` tags last, so the drift test is red until prose and data agree.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page prose, grade chips, registers | CDN / Static (HTML) | - | Must work with JS off; no script loaded in Phase 1 |
| Source of truth for numbers | Static (`data.js`, ES module) | Node tests | Imported by tests now, by calculator UI in Phase 3 |
| Calculator maths | Static (`calc.js`, pure) | Node tests | No DOM; testable under Node |
| Prose-vs-data consistency | Test (Node, build-time gate) | - | Parses HTML text; blocks deploy |
| Deployment gating | GitHub Actions | - | `needs: test` before deploy |
| Section 02 figure | Static inline SVG, authored from `compute()` defaults | Test | No JS at runtime; numbers verified against `data.js` |

## Standard Stack

No runtime dependencies. [VERIFIED: CLAUDE.md + STACK.md, project-level research]

### Core
| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| Hand-written HTML + `site/assets/style.css` | n/a | Page | Locked |
| `node:test`, `node:assert/strict`, `node:fs`, `node:path` | Node 22 LTS in CI, local v23.7.0 | Tests | Built in, no install |
| Root `package.json` `{"type":"module"}` only | n/a | ESM semantics for `data.js`, `calc.js`, tests | See finding 3 |

### GitHub Actions (verified 2026-10-24 via `gh api repos/<action>/releases/latest`)
| Action | Latest | Pin as |
|--------|--------|--------|
| actions/checkout | v7.0.1 (2026-07-20) | `@v7` |
| actions/setup-node | v7.1.0 (2026-10-08) | `@v7` |
| actions/configure-pages | v6.0.0 (2026-03-25) | `@v6` |
| actions/upload-pages-artifact | v5.0.0 (2026-04-10) | `@v5` |
| actions/deploy-pages | v5.0.1 (2026-09-01) | `@v5` |

[VERIFIED: GitHub releases API, 2026-10-24]. The GitHub starter workflow (`actions/starter-workflows/pages/static.yml`) still shows older majors (checkout@v4, configure-pages@v5, upload-pages-artifact@v3, deploy-pages@v5); do not copy its versions. The `permissions` and `environment` block in it is current and is reproduced below. [VERIFIED: raw file read via gh api]

Node 22 in CI: `node-version: 22` resolves to the latest 22.x (v22.23.4 released 2026-10-20, LTS "Jod"). [VERIFIED: nodejs.org/dist/index.json]

## Package Legitimacy Audit

No external packages are installed (no npm, pip or cargo). Only first-party `actions/*` actions are used, all confirmed as releases in their official GitHub repos. slopcheck not applicable.

**Packages removed due to slopcheck [SLOP]:** none. **Flagged [SUS]:** none.

## Finding 1: Gartner figures

| Item | Finding |
|------|---------|
| 2025 release | URL: `https://www.gartner.com/en/newsroom/press-releases/2025-05-12-gartner-2025-cmo-spend-survey-reveals-marketing-budgets-have-flatlined-at-seven-percent-of-overall-company-revenue`. Title: "Gartner 2025 CMO Spend Survey Reveals Marketing Budgets Have Flatlined at 7.7% of Overall Company Revenue". Dated 2025-05-12. |
| 2025 wording (verbatim, read in Business Wire reproduction via silicon.co.uk) | "CMOs report that their marketing budgets for 2025 remain flat at 7.7% of overall company revenue, according to a survey by Gartner, Inc. This is consistent with last year when marketing budgets represented 7.7% of overall company revenue (see Figure 1)." Sample: "conducted February through March 2025 among 402 CMOs and other marketing leaders in North America, the United Kingdom and Europe ... with the vast majority of respondents reporting annual revenue of over $1 billion." |
| 2026 release | URL: `https://www.gartner.com/en/newsroom/press-releases/2026-05-11-gartner-2026-cmo-spend-survey-finds-cmos-allocate-15-point-3-percent-of-marketing-budgets-to-ai-but-only-30-percent-are-ready-to-scale-ai-capabilities`. Dated 2026-05-11. Title: "Gartner 2026 CMO Spend Survey Finds CMOs Allocate 15.3% of Marketing Budgets to AI, But Only 30% Are Ready to Scale AI Capabilities". |
| 2026 wording (via Communicate Online and search summaries quoting the release) | "marketing budgets increased only slightly to 7.8% of company revenue in 2026 from 7.7% in 2025"; "conducted between January and March 2026 among 401 CMOs and other marketing leaders" in North America, UK and Europe, mostly revenue above $1B. |
| Access | `gartner.com` returns HTTP 403 to WebFetch and curl (both years); the URLs do appear in search results, so they exist. |

**Recommendation:**
- 7.7% (2025): **Benchmark**. Primary Gartner release text confirmed verbatim via its Business Wire distribution; Gartner URL confirmed by search. Flag: none (survey, self-reported, but Gartner is a checkable primary).
- 7.8% (2026): **Benchmark conditional.** Plan one `checkpoint:human-verify` task: "open the 2026 Gartner URL in a browser and confirm the sentence 'increased only slightly to 7.8% of company revenue in 2026 from 7.7% in 2025'". If confirmed, Benchmark; if not done, **Modelled** with the UI-SPEC caveat ("Secondary source: ..."). The test should assert the data.js grade matches whichever was chosen.
- Scope caveat to print beside both: North America, UK, Europe only, 400-ish respondents, mostly $1B+ revenue; marketing budget as % of revenue is an average (2025: half of CMOs at 6% or less) [CITED: campaignlive.com article via search summary; MEDIUM]. The subject org (~$1B revenue, $78M = 7.8%) is therefore "average Gartner respondent", a Modelled assumption, not a Benchmark.
- Exclude the 21.3% mature-AI figure and the 49/40/27% GenAI-ROI split from Phase 1 (49/40/27 meaning flagged unclear in FEATURES.md; the 2025 search summary reads them as shares reporting ROI via time efficiency, cost efficiency, capacity, but it was not read in the primary text).

## Finding 2: Workflow

```yaml
# .github/workflows/pages.yml
name: Test and deploy to Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
      - run: node --test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v7
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: site/
      - id: deployment
        uses: actions/deploy-pages@v5
```

[VERIFIED: permissions/environment/concurrency block from actions/starter-workflows pages/static.yml; action majors from releases API]. Least privilege: `pages: write` and `id-token: write` only on the deploy job (the starter puts them at workflow level; job-level is stricter and equivalent).

Also add a `pull_request` trigger to the `test` job only if wanted; deploy must stay on `push` to `main`. Keep it simple: omit.

## Finding 3: `node --test` behaviour (tested locally on v23.7.0, docs read)

- With no arguments, discovery matches `**/*.test.{cjs,mjs,js}`, `**/*-test.*`, `**/*_test.*`, `**/test-*.*`, `**/test.*` and **everything** under any `test/` directory (`**/test/**/*.{cjs,mjs,js}`). `node_modules` is skipped. [CITED: nodejs.org/api/test.html]. Consequence: put only test files (and helpers that are themselves valid tests or named `_helpers`-style outside `test/`) in `test/`; any helper module inside `test/` is executed as a test file. Keep shared helpers in `test-support/` or inline.
- Tested: a `test/a.test.js` using `import` syntax and importing `../site/js/data.js`, with no `package.json`, runs OK on v23.7.0 (syntax detection). With `package.json` `{"type":"module"}`, also OK. Syntax detection is not guaranteed on every 22.x, and it prints warnings when it kicks in on some versions [ASSUMED], so the minimal `package.json` is the reliable choice. It does not affect the browser. No `.mjs` renaming needed.
- `node --test test/` (a bare directory argument) **fails on v23.7.0** ("Cannot find module .../test"). Use plain `node --test` or quoted globs: `node --test "test/**/*.test.js"`. [VERIFIED: ran locally]
- Test files run in separate processes; each file must import what it needs. Output summary uses `ℹ tests/pass/fail` lines; exit code non-zero on failure, which is what gates the workflow.
- Parsing `site/index.html` without dependencies: `readFileSync(new URL('../site/index.html', import.meta.url), 'utf8')`, then regex. Strictly constrain the HTML so regexes are reliable: `data-fig` spans must be `<span data-fig="id">text</span>` on one line with no nested tags inside; ids `id="..."` double-quoted; chips are `<a class="chip c-b|c-m|c-s" href="#src-...|#asm-...">Word</a>`. Do not try to build an HTML parser.

Recommended test files:
| File | Checks |
|------|--------|
| `test/calc.test.js` | CALC-08: identity, monotonicity, golden case, edge inputs, cost falls with volume, validation never NaN/Infinity (walk every numeric leaf with `Number.isFinite`) |
| `test/data.test.js` | Every claim has id, display, grade in {Benchmark, Modelled, Speculative}, flag in {null, vendor-claimed, company-reported}, source id that exists (or `assumption`); Benchmark claims must have a source with `url` and `accessed`; flag never changes grade (flag=vendor-claimed with grade Benchmark is an error); every source `url` is https |
| `test/page.test.js` | For each `data-fig="id"`: id exists in data.js and element text equals `claim.display`; each chip following it has the grade word equal to data.js; every `href="#x"` resolves to an `id="x"`; TOC has 15 links, sections `s01..s15` present with `<h2 id="sNN-h">`; every `src-*`/`asm-*` row in registers matches a data.js entry and vice versa (for Phase 1 entries); no `<script`, no `data:image`; COI string present; falsifier string present verbatim; answer paragraph word count <=120; `lang="en-GB"`; no named vendors (Gradial, AirOps, Profound) outside s12 and s15 |
| `test/figure.test.js` | Section 02 table cells equal `compute(defaults)` outputs rounded for display; SVG value labels equal the same strings |

## Finding 4: calc.js model

Design rules: pure ES module, no DOM, no rounding inside the maths (round only for display), return objects never throw. All assumptions come from `data.js` (`assumptions` map) and are passed to `compute(inputs, assumptions)`; the default assumptions object is `defaultAssumptions()` derived from data.js, so register and maths share one source. Floating point: tests use a `close(a, b, 1e-6)` helper (V at 2x is 80000.00000000001 under `Math.pow`).

### Inputs (reader-overridable in Phase 3)
| Key | Default (subject org) | Grade |
|-----|----------------------|-------|
| `campaigns_per_year` | 40 | Modelled |
| `concepts_per_campaign` | 25 | Modelled |
| `variants_per_concept` | 40 | Modelled |
| `marketing_fte` | 120 | Modelled |
| `reviewer_fte` (flat across scenarios) | 12 (10% of FTE) | Modelled |
| `multiplier` | 2 | n/a (the claim under test) |
| Context only (not in maths): revenue 1,000,000,000; marketing budget 78,000,000 (7.8%) | | Modelled |

### Assumptions (all Modelled; no source exists for any of them)
| Key | Baseline / 2x | Meaning |
|-----|---------------|---------|
| `concept_growth_exponent` | 0.25 | Share of growth (in log terms) from new concepts: concepts x m^k, variants per concept x m^(1-k). k=0 means pure derivation; at m=2 concepts grow 19%, vpc grows 68%. Identity at m=1 holds for any k. Prevents "sameness" critique |
| `auto_approval_share` | 0.20 / 0.60 | Share of variants cleared with no human. Validation: must be <= T0+T1 share |
| `sampling_rate`, `escalation_rate` | 0.05 / 0.05 | Share of auto-approved variants audited by sampling / escalated to a human. q = s + e = 0.10 |
| `review_minutes_per_variant` | 12 | Human review time per reviewed variant |
| `rework_rate` | 0.15 | Share of variants needing one regenerate-and-re-review loop |
| `reviewer_hours_per_fte_year` | 1200 | Review hours per reviewer (fatigue cap, not 2080) |
| `reviewer_rate_per_hour` | 100 | Fully loaded USD per review hour |
| `master_concept_cost` | 1200 | USD per human-directed master concept |
| `variant_cost` | 4.00 / 0.80 | USD per derived variant (manual/agency vs AI-derived) |
| `rights_cost_per_concept` | 250 | USD licences/usage per concept (rights attach to masters, not derivatives) |
| `storage_cost_per_variant` | 0.02 | USD per variant per year |
| `tooling_cost_annual` | 150,000 / 600,000 | Fixed: platform, model commitments, eval harness upkeep |
| `ai_share_of_variant_cost` | 0.05 / 0.60 | AI inference share of variant cost |
| `ai_share_of_tooling` | 0.20 / 0.50 | |
| `tier_mix` | T0..T3 = 0.40/0.35/0.20/0.05 baseline; 0.55/0.30/0.12/0.03 at 2x | Only used for tier-weighted sensitivity and the auto-approval validation |
| `tier_weights` | 1 / 2 / 4 / 8 | Relative effort weights, sensitivity only |
| `build_days` | 8 / 3 | Brief-to-ready build time |
| `review_service_days` | 1.5 | Turnaround per review touch before queueing |
| `target_utilisation` | 0.85 | For break-even auto-approval |

### Formulas (per scenario s in {baseline, 2x}; m = 1 for baseline)
```
concepts      = campaigns * concepts_per_campaign * m^k
vpc           = variants_per_concept * m^(1-k)
V             = concepts * vpc                       # approved-live variants / year
headline      = V / 4 / marketing_fte                # per head per quarter (unweighted)
h             = 1 - a*(1 - q)                        # share of variants a human touches
review_hours  = V * h * minutes/60
capacity      = reviewer_fte * hours_per_fte
rho           = review_hours * (1 + r) / capacity    # utilisation incl. rework touches
cost.generation = concepts*master_cost + V*variant_cost
cost.review     = review_hours * rate
cost.rework     = r*V*variant_cost + r*V*h*minutes/60*rate
cost.tooling    = tooling_cost_annual
cost.rights     = concepts * rights_cost_per_concept
cost.storage    = V * storage_cost_per_variant
total           = sum of six; cost_per_asset = total / V
ai_spend        = V*variant_cost*ai_share_variant + tooling*ai_share_tooling
cycle_days      = build_days + (1+r)*(service_days + service_days*rho/(1-rho))   # null if rho >= 1
weighted_per_head (sensitivity) = headline * sum(tier_mix_i * weight_i)
break_even_auto_approval (at flat reviewer_fte and target_utilisation u):
  h* = u*capacity / (V*(1+r)*minutes/60);  a* = (1 - h*)/(1 - q)
  return {value: clamp, status: 'not_needed' (a*<=0) | 'ok' | 'infeasible' (a*>1)}
```
Scope statement the page must carry: cost is **production-attributable** (the six components); it excludes media and non-production headcount.

### Output shape
```js
{ ok: true,
  baseline: { concepts, variants_per_concept, variants_per_year, output_per_head_per_quarter, weighted_output_per_head_per_quarter,
              review_hours, review_capacity_hours, utilisation, review_capacity_exceeded,
              cost: { generation, review, rework, tooling, rights, storage, total }, cost_per_asset, ai_spend, cycle_days },
  scenario: { ...same... },
  ratios: { output_per_head, cost_per_asset, ai_spend, total_cost },
  break_even_auto_approval: { value, status } }
// invalid: { ok: false, errors: [{ field, message }] }
```
Validation: numeric and finite; `campaigns, concepts, vpc, fte, reviewer_fte, multiplier > 0`; shares and rates in [0,1]; tier mixes sum to 1 (tolerance 1e-9); `auto_approval_share <= t0 + t1`. `utilisation >= 1` is not a validation error: set `review_capacity_exceeded: true` and `cycle_days: null` (the "review is the binding constraint" result). No `Infinity` or `NaN` ever.

Optional small export: `weakestGrade([...])` with ordering Benchmark > Modelled > Speculative (Phase 3 inheritance); cheap, may be left to Phase 3.

### Default outputs (hand-run in a scratch script, 2026-10-24)
| Metric | Baseline | 2x |
|--------|----------|----|
| Concepts / vpc | 1,000 / 40 | 1,189.2 / 67.27 |
| Approved-live variants / yr | 40,000 | 80,000 |
| Per head per quarter | 83.3 | 166.7 |
| Review utilisation | 52.4% | 58.8% |
| Cost: generation / review / rework / tooling / rights / storage | 1,360,000 / 656,000 / 122,400 / 150,000 / 250,000 / 800 | 1,491,049 / 736,000 / 120,000 / 600,000 / 297,302 / 1,600 |
| Total production-attributable | $2,539,200 | $3,245,950 |
| Cost per approved-live asset | $63.48 | $40.57 (-36%) |
| AI spend | $38,000 | $338,400 (8.9x) |
| Cycle time (days) | 11.6 | 7.2 |

Sanity: with `auto_approval_share` held at 0.20 at 2x, utilisation = 52.4% x 2 x (h ratio 1) ~ 105%, i.e. review capacity exceeded. That is the SPINE "review is the binding constraint" demonstration and should be a test case ("2x at baseline auto-approval flags capacity exceeded"). Treat the defaults as starting values; the executor may retune them but must keep: 2x cost per asset < baseline, utilisation at 2x < 1 under default assumptions, and AI spend rises.

### Hand-calculated golden case (independent of defaults)
Inputs: campaigns 10, concepts/campaign 10, variants/concept 10, FTE 10, reviewer_fte 2, multiplier 2. Assumptions: k = 0, a = 0.2 baseline / 0.5 at 2x, s = e = 0.05 (q = 0.1), minutes 12, r = 0.1, hours/FTE 1000, rate 100, master 1000, variant cost 5 / 1, rights/concept 100, storage 0.10, tooling 10,000 / 30,000. (Tier mix may be 0.5/0.5/0/0 both sides to pass validation; AI shares and build days arbitrary.)

| | Baseline | 2x |
|---|----------|----|
| concepts, V | 100, 1,000 | 100, 2,000 |
| per head per quarter | 25 | 50 |
| h | 0.82 | 0.55 |
| review hours | 1000 x 0.82 x 0.2 = 164 | 2000 x 0.55 x 0.2 = 220 |
| utilisation (x1.1 / 2000) | 180.4/2000 = 0.0902 | 242/2000 = 0.121 |
| generation | 100x1000 + 1000x5 = 105,000 | 100,000 + 2000x1 = 102,000 |
| review | 16,400 | 22,000 |
| rework | 100x5 + 100x0.82x0.2x100 = 500 + 1,640 = 2,140 | 200x1 + 200x0.55x0.2x100 = 200 + 2,200 = 2,400 |
| tooling / rights / storage | 10,000 / 10,000 / 100 | 30,000 / 10,000 / 200 |
| total | 143,640 | 166,600 |
| cost per asset | 143.64 | 83.30 |

Ratios: output 2.0, cost per asset 0.5799. Second golden check for the exponent: m = 4, k = 0.5 gives concepts x2 and vpc x2 exactly (V x4).

Other tests: identity (m = 1 -> baseline equals scenario for every numeric leaf only if baseline and scenario assumptions are equal, so build the identity test with scenario assumptions copied from baseline); monotonicity (increase locales/vpc, V and total cost non-decreasing); cost per asset strictly decreasing across m in [1, 1.5, 2, 3] under defaults; zero/negative/NaN/string/empty inputs -> `ok:false` with the field named; auto-approval > T0+T1 -> error; `reviewer_fte` small -> `review_capacity_exceeded` and `cycle_days === null`.

## Finding 5: data.js shape

```js
export const GRADES = ['Benchmark', 'Modelled', 'Speculative'];      // strongest first
export const FLAGS  = ['vendor-claimed', 'company-reported'];

export const sources = {
  'gartner-2025-cmo-spend': {
    title: 'Gartner 2025 CMO Spend Survey Reveals Marketing Budgets Have Flatlined at 7.7% of Overall Company Revenue',
    publisher: 'Gartner, Inc.', published: '2025-05-12', accessed: '2026-10-24',
    url: 'https://www.gartner.com/en/newsroom/press-releases/2025-05-12-...',
    bias: 'Analyst firm; self-reported survey of ~402 CMOs, N. America/UK/Europe, mostly $1B+ revenue',
    read_via: 'Business Wire reproduction of the release' },   // honest provenance
  'gartner-2026-cmo-spend': { ... }
};

export const assumptions = {            // inputs and modelling defaults
  'asm-revenue':        { id: 'asm-revenue', label: 'Subject-org revenue', value: 1_000_000_000, unit: 'USD', display: '~$1B', grade: 'Modelled', flag: null, basis: '...' },
  'asm-auto-approval':  { id: 'asm-auto-approval', label: 'Auto-approval share', value: { baseline: 0.2, scaled: 0.6 }, unit: 'share', display: '20% / 60%', grade: 'Modelled', flag: null, basis: 'Design choice, no source' },
  ...
};

export const claims = {                 // numbers that appear in prose / figure; each has data-fig
  'gartner-share-2025': { id: 'gartner-share-2025', value: 7.7, unit: '% of revenue', display: '7.7%', grade: 'Benchmark', flag: null, source: 'gartner-2025-cmo-spend' },
  'gartner-share-2026': { value: 7.8, display: '7.8%', grade: 'Benchmark' /* or Modelled, see Finding 1 */, source: 'gartner-2026-cmo-spend', note: '...' },
  'output-per-head-base': { value: 83.3, display: '83', grade: 'Modelled', derived_from: ['asm-...'] },   // equals compute() output, tested
  ...
};
```
Rules: `id` equals the map key; chip href is `#src-<sourceId>` for sourced claims and `#asm-<id>` for modelled ones, so register row ids are `src-…` / `asm-…`; `display` is the exact string in the HTML; derived claims (the figure numbers) are produced by a `deriveClaims()` helper from `compute(defaultInputs, defaultAssumptions)` rather than hand-typed, with the test asserting the HTML equals them. A derived claim's grade is the weakest of its inputs (Modelled). Phase 1 `claims` should be limited to numbers actually in the page.

## Section titles (15, from SUMMARY.md outline)
01 Claim and measurement; 02 The CFO answer (spend floor); 03 The factory and the content supply chain; 04 Platform and skills; 05 The 10,000-asset campaign; 06 The review agent; 07 The auto-approval gate; 08 Eval harness and telemetry; 09 The other five levers; 10 The outcome case; 11 Your numbers (calculator); 12 How this compares; 13 Adoption and Backlog 0; 14 What goes wrong; 15 Source register, evidence gaps and assumptions. [CITED: .planning/research/SUMMARY.md table]

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing in tests | A parser | Regex over a constrained markup contract | Zero deps; contract is enforced by the same test |
| Test runner | Custom script | `node --test` | Exit code gates Actions |
| Chart | Chart library | Hand-authored inline SVG | Locked in UI-SPEC |
| Pages deploy | `gh-pages` branch scripts | Official three Pages actions | Official path |

## Common Pitfalls

### 1. `.nojekyll` is not in the artifact
`upload-pages-artifact` v4+ excludes dotfiles by default (a v5 input `include-hidden-files` exists). [VERIFIED: release notes v4.0.0 and v4.0.1 via gh api]. With Actions deployment Jekyll never runs, so the missing file is harmless. Keep `site/.nojekyll` in git to satisfy SHELL-01, and either set `include-hidden-files: true` (assumption: input name as in v4.0.1/v5 notes) or leave it out and say so. A test asserting the file exists in the repo is fine.

### 2. Pages source must be "GitHub Actions"
Deploy fails until the repo's Settings > Pages > Source is set to GitHub Actions (or `gh api -X POST repos/lyonsv/cmo-2x-teardown/pages -f build_type=workflow`). The first deploy to the `github-pages` environment may need manual approval of the branch rule. Plan this as part of the (user-confirmed) repo-creation task. [ASSUMED: standard behaviour, not re-tested here]

### 3. Helper files inside `test/` run as tests
Default discovery executes every `.js` under `test/`. Keep helpers elsewhere.

### 4. `node --test test/` fails on Node 23
Use bare `node --test` (what the workflow runs).

### 5. Floating point in golden tests
`Math.pow` yields 80000.00000000001; use a tolerance helper, never `assert.equal` on computed floats.

### 6. Grade drift via chips
Chip text duplicated in HTML can disagree with data.js: the page test compares chip word to data.js grade, and compares flag tag presence.

### 7. Gartner scope creep
Do not describe the 7.8% as a population benchmark for all firms (N. America/UK/Europe, mostly $1B+, self-reported). The subject org at exactly 7.8% is Modelled.

### 8. Production cost vs total budget
$2.5-3.2M against $78M budget could look trivial. State explicitly that media and non-production headcount are excluded, or the CFO story loses credibility.

## State of the Art

| Old | Current | Impact |
|-----|---------|--------|
| upload-pages-artifact v3 includes dotfiles | v4+ excludes them | `.nojekyll` not uploaded; harmless |
| Starter workflow versions | Newer majors exist (checkout v7, configure-pages v6, upload v5, setup-node v7) | Use the verified list |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Syntax detection printing warnings on some 22.x without `"type":"module"` | Finding 3 | Low: `package.json` is added anyway |
| A2 | Pages source setting and first-deploy environment approval behaviour | Pitfall 2 | Medium: first deploy fails; fix in Settings |
| A3 | `include-hidden-files` input name on upload-pages-artifact v5 | Pitfall 1 | Low: harmless to omit |
| A4 | Every calculator default (all rows of the assumptions table, golden case excluded) | Finding 4 | Intended: Modelled, reader-overridable; reviewer FTE 10%, 12 min/review, $4 vs $0.80 variant cost are the most contestable |
| A5 | 49/40/27% GenAI-ROI reading | Finding 1 | Excluded from Phase 1 |

## Open Questions (RESOLVED)

1. **Gartner 2026 grade** - could not read the primary page (403). Resolve with the human-verify task; default Modelled if skipped.
   RESOLVED: handled in plan 01-02 Task 3 (browser check records `gartner_2026_grade`) and plan 01-05 (applies the grade; test enforces the caveat when Modelled).
2. **Repo creation and push** - outward-facing; planner must put a `checkpoint:human-verify` before `gh repo create` and `git push`.
   RESOLVED: handled in plan 01-02 Task 1 (blocking checkpoint:decision before repo creation and push) and plan 01-07 Task 2 (approve-push checkpoint before the final push).
3. **Prose numbers in s01/s02 that are Speculative or unsourced** - keep Phase 1 prose to numbers in `data.js` only.
   RESOLVED: handled by the drift test (plan 01-01 page.test.js: every data-fig equals data.js) and the numeric-token gate (plan 01-03), extended in 01-04 to 01-06.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | Tests | yes | v23.7.0 local; CI uses 22.x | - |
| gh CLI | Repo creation, Pages setup, release checks | yes (used for API calls) | - | Manual in browser |
| Git remote | Deploy | no (none exists) | - | Created in-phase after user confirmation |
| Gartner pages | Primary check | no (403 to automation) | - | Manual browser check |

## Validation Architecture

`workflow.nyquist_validation` is `false` in `.planning/config.json`: section skipped. Test plan is under Finding 3 and Finding 4; commands are `node --test` (full) and `node --test test/calc.test.js` (quick).

## Security Domain

Static page with no inputs, scripts or third-party assets in Phase 1: ASVS V5 input validation applies only to `compute()` (validated numerics, covered by tests); V6 not applicable. Workflow: least-privilege `permissions` (above), first-party actions only, pinned to majors. Optionally pin to commit SHAs (stricter, not required here). No secrets used.

## Project Constraints (from CLAUDE.md)
- Static HTML/CSS/JS for GitHub Pages; no runtime dependencies; no CDN libraries in Phase 1.
- Every number graded with visible assumptions; vendor names only in comparison section and register (Phase 1 therefore names none; the test enforces this).
- Hand-written HTML, system fonts, vanilla ES modules, `node:test`; no build step; no Jest/Vitest/Playwright.
- `localStorage`/cookies not used; no base64 images; no unpinned CDN.
- Work through GSD commands before file edits.

## Sources

### Primary (HIGH)
- GitHub releases API for actions/checkout, setup-node, configure-pages, upload-pages-artifact, deploy-pages (2026-10-24)
- actions/starter-workflows `pages/static.yml` (read via gh api)
- https://nodejs.org/api/test.html (default discovery patterns); nodejs.org/dist/index.json (22.23.4)
- Local run of `node --test` on v23.7.0

### Secondary (MEDIUM)
- Gartner 2025 release text via https://www.silicon.co.uk/press-release/gartner-2025-cmo-spend-survey-reveals-marketing-budgets-have-flatlined-at-7-7-of-overall-company-revenue (Business Wire reproduction)
- https://communicateonline.me/news/cmos-increase-ai-spending-despite-limited-readiness-gartner-finds/ (2026 wording quoted)
- https://campaignlive.com/article/marketing-budgets-hold-77-2025-gartner-cmo-survey/1920581 (distribution: half at 6% or less)

### Tertiary
- Gartner newsroom URLs (listed in Finding 1): exist per search results, not readable by automation (403).

## Metadata
**Confidence:** Stack/workflow HIGH; Gartner 2025 HIGH, 2026 MEDIUM; calculator defaults LOW by nature (Modelled).
**Research date:** 2026-10-24. **Valid until:** about 2026-11-24 (action versions move).
