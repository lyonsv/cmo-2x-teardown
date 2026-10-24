# Phase 2: Factory & Spine Slice - Research

**Researched:** 2026-10-24
**Domain:** Hand-written static HTML/CSS/SVG editorial page (sections 03-08), one new pure function in `calc.js`, new `data.js` claims, and a regex-contract test suite that must be evolved without loosening its drift checks.
**Confidence:** HIGH on code/test interplay and calculator numbers (run locally); MEDIUM on legal/evidence facts (primary SSRN paper not readable by automation); HIGH on the Intercom reference content (full text and key screenshots read).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Reference-density sections: ~400-700 words each, one figure and/or table each; ~3,500 words across s03-s08.
- Intercom named once, in s06, as the inspiration ("the equivalent of Intercom's review agent"), sourced to the reference teardown; generic names (review agent, eval harness) everywhere else. Vendor-neutral by tool category; no vendor names outside s12/s15.
- Worked variant matrix: one illustrative campaign of 4 master concepts x sizes x channels x locales x audiences x tests x feed items, with applicable fractions, reaching ~12,000 without double counting. Rendered as a static table, backed by a new pure `variantMatrix()` in calc.js with node:test tests (Phase 3 reuses it). All factors Modelled.
- Tier shares: keep Phase 1 calc defaults (60% auto-approval baseline, T0+T1 cap 85%); the tier table shows Modelled ranges with the calc default marked. No Phase 1 model change unless research forces it.
- Six inline SVGs: (a) factory model (s03), (b) content supply chain (s03), (c) brief -> approved-asset flow (s05), (d) review loop/escalation (s06), (e) T0-T3 tier ladder (s07), (f) eval-harness loop (s08). Operating architecture (s04) as a layered table, with one versioned policy source shared by generator and reviewer shown explicitly.
- Style: monochrome line diagrams in Phase 1 tokens; accent reserved for the review/gate path; labels are real `<text>`; >=12px effective text at all widths.
- Mobile: author vertical-first so diagrams scale without horizontal scroll; same SVG centred on desktop. (Refined in UI-SPEC: viewBox 300 wide, max-width 360px.)
- Accessibility: every figure has `<title>` and `<desc>` plus a visible ordered-list or table text equivalent beside it.
- Imagery-sourcing table (GEN-03): neutral 3 columns (retrieve approved / license / generate) x rows (rights, indemnity, copyrightability, cost visibility, speed). COI note repeated directly above it (CRED-04). Getty v Stability: one dated, neutral line here; full treatment in s14 (Phase 4).
- NYU/Emory CTR finding and -31.5% AI-disclosure penalty: plan research re-reads the primary paper; Benchmark only if confirmed there, else Modelled with a "secondary source" note (same rule as Gartner).
- Tier table and human-only list carry an explicit "Illustrative, not legal advice; depends on jurisdiction" note; tiers worded as examples.
- Plan research views the live Intercom reference sections 05-14 and extracts Shrek / auto-approval gate / shrek-curator patterns before tiers and harness metrics are locked.
- Fold the Phase 1 UI-review fixes into Phase 2's first plan (Figure 1 legibility on phones, `strong,b{font-weight:600}`, `.metric-trio .lbl`, `tbody th[scope=row]`, chip de-duplication in registers, dedupe lever-evidence Value/Basis, copy nits). See 01-UI-REVIEW.md.
- Chip density rule: one chip per claim, linked; registers carry a single unlinked grade chip per row; in prose, chip once per figure per paragraph. Update tests accordingly (no loosening of the data-fig drift checks).
- Pushes: commit locally; one local-preview human-verify checkpoint mid-phase; one push at the end after the user's explicit "approve-push".
- Reviewer-capacity worked example (SPINE-04): static table driven by compute() defaults showing review hours and utilisation at 1x vs 2x, with and without the auto-approval gate; numbers tagged data-fig and tested against data.js.
- TDD per plan (RED test commit, then GREEN). No `<script>` on the page; CSP `default-src 'none'; style-src 'self'`; no inline `style=`.

### Claude's Discretion
- Exact section prose, figure geometry and example assets in the tier table, within the decisions above.
- Fatigue-control and telemetry metric wording (SPINE-06/07), graded Modelled/Speculative where evidence is thin.

### Deferred Ideas (OUT OF SCOPE)
- Full Getty v Stability treatment and incident list - Phase 4 (s14).
- Interactive variant matrix - Phase 3 calculator.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GEN-01 | Worked variant matrix reaching 10,000+ without double counting | `variantMatrix()` contract + golden case (12,000) in "variantMatrix contract" |
| GEN-02 | "Derive, do not generate" principle | Reference mapping (two-axis eligibility; derivation line); s05 lead is locked copy in UI-SPEC |
| GEN-03 | Neutral imagery-sourcing table | "Imagery sourcing facts" (Copyright Office Part 2, indemnity conditions, Getty line) |
| GEN-04 | Personalisation/DCO + feeds block incl. graded NYU/Emory CTR and -31.5% | "NYU/Emory" section: grade recommendation Modelled until author confirms SSRN in a browser |
| GEN-05 | Inline SVG figures with title/desc (factory, supply chain, brief-to-asset) | "SVG figures" section: geometry, id uniqueness, fit tests |
| SPINE-01 | Operating architecture, one versioned policy source | s04 layered table; reference mapping (`.claude/rules/*.md` loaded at review time) |
| SPINE-02 | Review agent behaviours | Reference mapping (rule IDs cited, audit trail, admits what it could not verify, two gates) |
| SPINE-03 | T0-T3 ladder, human-only list, not-legal-advice note | Tier table proposal + default alignment with calc |
| SPINE-04 | Reviewer-capacity worked example | Computed values from `compute()` in "Reviewer-capacity worked example" |
| SPINE-05 | Eval harness | Reference mapping (ground truth, baseline-vs-treatment, noise bands, 12 of 13 inconclusive) |
| SPINE-06 | Telemetry layer | Reference mapping (two streams, asset-ID join) + metric list |
| SPINE-07 | Reviewer-fatigue controls | Control list + escape-rate sampling arithmetic |
</phase_requirements>

## Summary

Phase 2 is almost entirely content, SVG and test work; there is no new runtime dependency and no package to install. The one new engineering unit is `variantMatrix()` in `calc.js`. A multiplicative design (each factor expands a stated fraction of the running set by its count, `multiplier = 1 + applies x (count - 1)`) is order-independent, trivially testable, and reaches exactly 12,000 for 4 concepts with the factor set proposed below. The reviewer-capacity table can be driven directly from `compute()` by overriding `auto_approval_share` (0 for "without gate"); the numbers are in the capacity section. The key story holds: at 2x with no gate, utilisation is 134.5% (over capacity); with the 60% gate it is 61.9%.

The largest planning risk is the existing regex-contract test suite (85 tests, all passing now). Several approved UI-SPEC rules directly contradict current test assertions: chip-after-every-number (`figRe`), register grade cell is a self-link, Figure 1 table needs a chip after each of 18 numbers, skeleton test loops s03-s14, the numeric gate rejects `T0`-`T3`, `section 14`, `Part 2` and any written date. These need deliberate, named test changes that keep every display/grade/ref drift check intact. A second risk is a handful of internal conflicts in the UI-SPEC (duplicate SVG ids, 112-unit boxes vs 28-character lines, per-quarter columns vs annual compute outputs, s03 title). They are listed under "Spec/test conflicts the planner must resolve".

The Intercom reference was read in full (sections 05-14 are screenshots of a May 2026 webinar about an engineering org; the review agent is a code-review bot). The patterns transfer cleanly: two-axis (eligibility vs quality), house rules loaded at review time, audit trail, ground truth from human disagreement, baseline-vs-treatment harness with noise bands. One honest-reporting finding matters for the default: the reference reports 19.2% of merged PRs auto-approved (goal >50%) and a 28.4% rolling bot-approval rate, against this page's 60% default at 2x. At a 28% clearance 2x utilisation is 100.1%.

**Primary recommendation:** Plan 1 = carry-over fixes + test-contract evolution (RED first); Plan 2 = `variantMatrix()` + data.js claims/sources + capacity claims; Plans 3-5 = s03-s04, s05, s06-s08 content with figures; local-preview checkpoint after the figures; one push after "approve-push". Grade NYU/Emory as Modelled with the secondary-source note unless the author confirms the SSRN paper in a browser (precedent: Gartner 2026).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page content, tables, chips, registers | CDN / Static (hand-written HTML on Pages) | - | Single static page, no server |
| Diagrams (6 SVGs) | CDN / Static (inline SVG + external CSS) | - | No script allowed (CSP); styled via `style.css` classes |
| Variant-matrix maths | Pure module `calc.js` (Node-testable, browser-importable later) | `data.js` (defaults + claims) | Phase 3 reuses it; page numbers are static `data-fig` text verified by tests |
| Number/grade single source | `data.js` | HTML spans verified by `node --test` | CRED-06 |
| Deploy gate | GitHub Actions (`pages.yml`, `needs: test`) | - | Existing |

## Standard Stack

No new technology. Everything below already exists in the repo and `node --version` is v23.7.0 [VERIFIED: local `node --version`; `node --test` currently 85 pass, 0 fail].

| Piece | Version | Purpose |
|-------|---------|---------|
| Hand-written HTML + `site/assets/style.css` | n/a | Page, new classes appended |
| `site/js/calc.js` (pure ES module) | n/a | add `variantMatrix()` next to `compute()` |
| `site/js/data.js` | n/a | new sources, assumptions, claims, `formatValue` kinds |
| `node:test` + `node:assert/strict` | Node 23.7.0 local, 22+ in CI | all tests |

**Installation:** none.

## Package Legitimacy Audit

No external packages are installed or recommended in this phase. slopcheck not applicable.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
 CONTEXT/UI-SPEC copy + research facts
              |
              v
   data.js  (sources, assumptions, claims, formats)
      |   \__ imports __> calc.js  compute() , variantMatrix()
      |                       ^
      v                       | recomputed by
 index.html  (data-fig spans, chips, SVG, registers)  <---- test/*.test.js (regex contract)
      |                                                      |
      +--- style.css (tokens, .fig-d, .fig-grid ...) <--- style.test.js (CSS regex + contrast)
      |
      v
 GitHub Actions: node --test  --(green)-->  deploy-pages
```

Reader flow in the page: s03 factory model -> s04 layers -> s05 derive 12,000 variants -> s06 review agent -> s07 tiers and capacity (binding constraint) -> s08 harness proves the gate is safe.

### Recommended file touch list
```
site/index.html          # s01/s02/s15 fixes; s03-s08 content; s09-s14 skeleton text unchanged (s12 stub reworded)
site/assets/style.css    # carry-over fixes + .fig-grid, svg.fig-d, .fig-steps, .shared, .default-mark, print
site/js/calc.js          # + export function variantMatrix(concepts, factors)
site/js/data.js          # + sources, assumptions, claims, formatValue kinds, variantMatrixDefaults, capacity scenarios
test/calc.test.js        # + variantMatrix tests
test/data.test.js        # + drift checks for new derived paths, tier-default claims
test/page.test.js        # contract evolution (see Pitfalls) + new section tests
test/style.test.js       # + CSS rules tests
test/figure.test.js      # keep Figure 1 tests; chip expectation per-row
test/diagram.test.js     # NEW: svg.fig-d geometry/fit/accessibility tests
```

### Pattern 1: variantMatrix (pure, order-independent)
**What:** a factor with `count` n options applying to a share p of the running item set expands that share by n and leaves the rest at 1. Multiplier = 1 + p(n-1). Because each factor transforms the running total by a constant multiplier, total = concepts x product of multipliers, independent of factor order (this is the formal "no double counting" property; independence between factors is the stated assumption and must be printed under the table).
**Contract:**
```js
// concepts: integer >= 1. factors: non-empty array of { id: string, label?: string, count: integer >= 1, applies: number in [0,1] }
export function variantMatrix(concepts, factors)
// ok:   { ok: true, concepts, rows: [{ id, count, applies, multiplier, variants }], total, per_concept }
//       rows[i].variants is the cumulative total AFTER factor i (concepts x product of multipliers 0..i); total === rows.at(-1).variants
// fail: { ok: false, errors: [{ field, message }] }   // same shape as compute(); never throws, never NaN/Infinity
```
Return floats unrounded (display goes through `formatValue(v,'int')`); tests compare with 1e-9 tolerance. An optional `generated = total / approval_yield` is NOT recommended on the function: keep the matrix as the approved-live set (matches the table's "Total approved-live variants" row and CRED-03).
**Worked example (4 concepts), verified by running a prototype** [VERIFIED: local node run]:

| Factor | Count n | Applies p | Multiplier | Variants after |
|--------|--------:|----------:|-----------:|---------------:|
| Master concepts | 4 | all | - | 4 |
| Sizes | 10 | all (1) | 10 | 40 |
| Channels | 5 | 75% | 4 | 160 |
| Locales | 6 | 40% | 3 | 480 |
| Audiences | 5 | 75% | 4 | 1,920 |
| Tests | 4 | 50% | 2.5 | 4,800 |
| Feed items | 4 | 50% | 2.5 | 12,000 |

Per concept: 3,000. All intermediate totals are integers, total is exactly 12,000 (within the 10,000-13,000 test band and matching the UI-SPEC lead "about 12,000"). Reversing the factor order also gives 12,000 (order independence).
**Hand-calculated golden cases for tests:**
1. Above: `variantMatrix(4, F).total === 12000`, rows `[40,160,480,1920,4800,12000]`.
2. Tiny enumerable case: `variantMatrix(2, [{count:3,applies:.5},{count:2,applies:.5}]).total === 6` (2 items; 1 expands to 3 giving 4; then 2 of 4 expand to 2 each giving 6). Cross-check with an independent test-local enumerator that expands `round(items x applies)` items, so the test does not re-use the function's formula.
3. Identity: `count:1` any applies, or `applies:0` any count, leaves the total unchanged.
4. `applies:1` reduces to the plain product.
5. Order independence: every permutation of F gives the same total (use 3 or 4 permutations).
6. Monotonicity: raising a count or an applies never lowers the total.
7. Validation: `concepts 0`, `count 0`, `count 2.5`, `applies 1.1`, `applies -0.1`, `applies NaN`, empty factors, `null` return `{ok:false}` with the failing field named; no NaN anywhere.
8. Default-set band: total in [10000, 13000].
**Caveat to state on the page:** this is one flagship campaign, about 12x the average campaign in the Phase 1 model (calc defaults: 40,000 variants a year over 40 campaigns = 1,000 each, 25 concepts each). Say so in one sentence so a CFO does not read it as the model default [VERIFIED: compute() run, V = 40,000/yr].
**Data wiring:** `data.js` exports `variantMatrixDefaults = { concepts: 4, factors: [...] }`. One assumption per factor row (`asm-matrix-sizes`, ..., all Modelled, `kind: 'evidence'` or a new kind so `defaultAssumptions()` does not pick them up; `defaultInputs()` only reads `kind === 'input'`, `defaultAssumptions()` only `kind === 'model'`). Claims for `count`, `applies` and `variants` per row with a new `derived`-style marker (e.g. `derivedFrom: 'variantMatrix'`, `row: 'sizes'`, `field: 'variants'`); `data.test.js` recomputes with `variantMatrix(variantMatrixDefaults...)` and asserts equality. Add a `formatValue` kind for "applies" that returns `all` when the value is 1 and `pct0` otherwise (`data.test.js` has explicit format tests; add one). Every row's data-figs share one ref (that row's assumption) so the single row chip is unambiguous.

### Pattern 2: Reviewer-capacity scenarios from compute()
See the dedicated section below. Scenario definitions live in `data.js` (`CAPACITY_SCENARIOS`: `{id, multiplier, auto_approval_share}`), each claim records its scenario; `data.test.js` independently recomputes with explicit overrides coded in the test body (not by importing the scenario list) so the test is not circular.

### Pattern 3: Diagram figure (all six)
See "SVG figures" below.

### Anti-Patterns to Avoid
- **Loosening `figRe` to "chip optional" globally.** That deletes the grade/ref check for every number. Replace with the governing-chip rule in Pitfall 1 instead.
- **Hard-coding table numbers in HTML without a claim.** Any digit outside `data-fig`, allow-list or SVG fails the numeric gate (by design).
- **Naming Intercom more than once or any vendor in s03-s08.** `Intercom` must appear exactly once outside s12/s15 (UI-SPEC test hook). Generic phrasing in s07/s08 even where the reference is the evidence ("in the one public reference").
- **Copying the base64-image approach or committing any extracted screenshot.** Images stayed in the session scratchpad only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Arrowheads | Per-edge path polygons | One `<marker>` pair per SVG with unique ids | Consistent, scalable |
| SVG text wrapping | Measuring/`textLength` hacks | `<tspan x dy>` lines authored by hand + a fit test | No JS on page |
| Number formatting | Inline `toLocaleString` copies in tests | `formatValue()` from data.js | Single source (CRED-06) |
| Variant counts | Hand-typed totals | `variantMatrix()` | Phase 3 reuses it; tests lock it |
| Utilisation maths | A second formula for the capacity table | `compute()` | Already validated; table must not diverge |
| Contrast checks | New colour maths | Existing `luminance`/`contrast` helpers in `style.test.js` | Already tested |
| Stats on escape rate | Bespoke confidence maths on the page | State the rule of three in words only (see SPINE-07), or omit | Avoid unsourced statistical claims on a graded page |

## Reference Findings: Intercom teardown sections 05-14 (read 2026-10-24)

Method: downloaded the page to the session scratchpad, extracted base64 images with a script kept outside the download folder, read the stripped text in full and viewed the screenshots for the auto-approval gate, curator Live tab, Compare/regression and Backlog 0 slides [VERIFIED: https://lyonsv.github.io/intercom-2x-teardown/ , page footer "Compiled 25 Aug 2026", webinar screenshots 19 May 2026]. Nothing in the page attempted to instruct the agent (no prompt-injection content observed). Note this teardown is the author's own secondary reading of company-presented webinar screenshots, so every figure below is company-reported; Phase 1 data rules forbid Benchmark when a flag is set, so any Intercom figure used must be Modelled + `company-reported`.

Numbering caveat: reference sections map as 05 base plugin, 06 skills, 07 "Shrek" code-review agent, 08 auto-approval gate, 09 "shrek-curator" ground truth and eval harness, 10 telemetry, 11 adoption, 12 "Backlog 0", 13 what they got wrong, 14 source register. (Our s13 "Adoption and Backlog 0" is Phase 4.)

| Reference pattern (evidence) | Marketing mapping for this page |
|---|---|
| Review bot acknowledges, then every comment cites the rule it enforces, with a link to run logs (audit trail as a trust design) | s06 rule list: cite rule IDs, write findings to the asset manifest, every verdict has a log link |
| Reviewer loads the house rules (`.claude/rules/*.md`) first and shows its working ("Extract Relevant Guidance") | s04/s06: one versioned policy source (brand, legal, accessibility, claims library) read by both generator and reviewer; findings reference policy version |
| Summary table of six criteria; "Auto-approval" is its own row evaluated independently; a failing review can still read "Eligible" (eligibility and outcome are orthogonal: a deterministic policy question vs a judgement question) | s06/s07: the reviewer emits criterion verdicts AND a tier. Tier is assigned by asset class and content features (policy), never lowered by the agent; approval needs both a pass and an eligible tier |
| Reviewer admits what it could not verify (unrun test) rather than papering over it | s06: findings include "could not check" states; unchecked means escalate, not pass. Pairs with "never trusts generator self-reports" |
| Two gates: local review skill before push, bot review after push | s06: pre-publication self-check by the generator is advisory only; the independent reviewer is the gate |
| Auto-approval began with the lowest-risk classes (flag cleanups, small fixes); 86% of auto-approved PRs are 20 lines or fewer; critical-data changes are never auto-approved even when the code is good | s07: T0 = derivations of approved masters (resize, crop, locale swap, feed render); human-only list is a class rule, not a quality score |
| Published numbers: 19.2% of merged PRs AI-approved with no human (goal >50%); ~60% evaluated by the system; live bot approval rate 28.4% (284 of 1,000 PRs); auto-approved median merge time 14.6 min vs 75.8 min | Honest anchor against the 60% default (see Pitfall 8). Use at most one or two of these, Modelled + company-reported, not named as Intercom in s07 |
| "Safety" is the weakest, and the gating, criterion (agreement 36.2% live, 70.5% curated) | s08: report agreement per criterion and per tier, never an average; the rights/claims criteria will be the hard ones |
| shrek-curator tabs: Live, Curate, Compare, Datasets, GT Snapshots, Batches; two-column human-vs-bot verdict per criterion with free-text rationale; datasets versioned and snapshotted | s08 figure/table: ground truth = reviewer decisions with reason codes; versioned datasets and snapshots |
| Thumbs up/down on every bot comment; "curation is the complaints procedure" (the person who disagrees has a self-interested reason to curate) | s08/s07: reviewer override with a reason code is the cheapest ground-truth feed; incentive design matters |
| Compare harness: baseline vs treatment on a fixed dataset, practical margin (+/-4.88pp), paired statistics, per-criterion bands, 27 experiments of which 12 inconclusive, 1 worse (a newer model), 0 better | s08 closing: "no change ships if it regresses the harness"; most changes are not measurable improvements; a newer model tested worse on their judge task, so own the eval |
| Selection-bias guard on the eval (comment-count behaviour check downgrades a headline) | s08: guard the harness against being gamed by the thing it evaluates (e.g. a generator that suppresses hard cases) |
| Telemetry: two streams (skill invocation events to Honeycomb; session transcripts, anonymised, to S3 and Athena); "treat your org like a product ... not surveillance"; per-session cost shown to the individual in real time | s08 telemetry: asset-ID join from manifest to performance; usage and cost telemetry framed as instrumentation, not surveillance; named-individual analysis is the part most likely to land badly |
| "CI melted down ... code review became the bottleneck instead" (company-reported); code quality declined before it recovered (measure before the dip) | s07 binding-constraint argument and s08 "baseline before the dip", stated generically without naming the company again |
| Backlog 0 / Scarcity to Abundance; SLO of fixing reported issues in under 24 hours | Phase 4 (s13). Not needed in Phase 2 beyond, optionally, one framing sentence in s03 |
| Skills treated as software: an `evals/` folder inside a skill; measure, build, enforce, re-measure | s04 "skills as reusable units with their own tests" |

## NYU/Emory AI-ad study (GEN-04)

- Paper: "The Impact of Visual Generative AI on Advertising Effectiveness", Anindya Ghose, Hyesoo Lee, Vilma Todri, Panagiotis Adamopoulos. SSRN abstract id 5638311 (https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5638311) [CITED: NYU Stern research highlight, stern.nyu.edu/experience-stern/faculty-research/ai-advertising-paradox, dated 2025-11-06, which links the SSRN paper].
- **Primary not readable by automation:** SSRN returns HTTP 403 to WebFetch and to curl with a browser user agent [VERIFIED: tool runs 2026-10-24]. This is the same block as gartner.com in Phase 1.
- What the authors' own institutions state (secondary summaries by NYU Stern and by Compass Lexecon, where Ghose is a senior consultant, 2025-11-11): three conditions (human expert, human-made then genAI-modified, fully genAI-created); fully genAI-created ads raised CTR "by up to 19%" in field settings; genAI-modified ads showed no significant improvement; disclosing AI involvement reduced advertising effectiveness "by up to 31.5%" (NYU: "a 31.5% decrease in click-through rates") [CITED: stern.nyu.edu page; compasslexecon.com/insights/publications/the-impact-of-visual-generative-ai-on-advertising-effectiveness]. Design per Compass Lexecon: latent diffusion models plus a laboratory experiment plus a field study.
- Trade-press-only details (NOT confirmed against the paper, tag `[ASSUMED]` if used): CTR 3.73% (human) to 4.44% (AI), disclosed 2.56% (1.17pp absolute); lab sample 685; field 105,999 impressions and 4,026 clicks from a beauty retailer on a display network; whether the 31.5% disclosure effect was measured in the field or the lab; exact SSRN posting date (one search result says October 2025).
- Arithmetic note: 1 - 2.56/3.73 = 31.4%, so the press CTRs are rounded; do not print the CTR pair.
- Counter-evidence for balance (not primary-verified here): a separate study on a native-ad platform found AI and human ads statistically equivalent after matched-pair controls (Columbia, Harvard, TUM, CMU; business.columbia.edu "AI disguise") [LOW, single search].
- **Recommendation:** grade both claims **Modelled** with the visible note "Secondary source: reported in trade press; we could not confirm the primary paper." (UI-SPEC copy), keep the "up to" wording for 19% and the paper's relative framing for 31.5%, do not name the ad network (vendor-neutral). Add a human-verify task: the author opens the SSRN page in a browser. If confirmed, switch to Benchmark, set `read_via` to "SSRN page, confirmed in a browser by the author", mirror the Gartner pattern including a data.test that pins the grade to the recorded check. Keep `flag: null` for Benchmark (test enforces).
- Source row: `sources['nyu-emory-ai-ads-2025']` with title, publisher "SSRN (preprint); NYU Stern and Emory Goizueta authors", published (use 2025-11-06 for the NYU summary only if the SSRN date stays unconfirmed, and say so in `read_via`), accessed 2026-10-24, bias "Academic preprint, not peer reviewed as of the access date [ASSUMED: peer-review status unchecked]; one of the authors is a consultant at an economics consultancy that republished it".

## Imagery sourcing facts (GEN-03) [author COI: iStock/Getty Images, repeat note directly above the table]

| Fact | Detail | Source |
|---|---|---|
| US Copyright Office, Copyright and Artificial Intelligence, Part 2: Copyrightability, released January 2025 (29 January 2025) | Conclusions read directly from the PDF executive summary: copyrightability can be resolved under existing law; AI used to assist rather than stand in for human creativity does not affect protection of the output; copyright protects original human expression even if the work includes AI material; it does not extend to purely AI-generated material or material with insufficient human control over expressive elements; prompts alone do not provide sufficient control on current technology; human authors keep rights in perceptible human contributions and creative selection, arrangement or modification; case-by-case analysis; no case for new sui generis protection | [VERIFIED: copyright.gov/ai and the report PDF, pp. ii-iii] |
| Getty Images v Stability AI (UK) | High Court judgment 4 November 2025, [2025] EWHC 2863 (Ch), Joanna Smith J: secondary copyright infringement claim dismissed (model weights held not to be infringing copies); trade mark claim partly upheld for watermarks on older model versions; passing off not decided; Getty abandoned its training and outputs claims before judgment. Permission to appeal the secondary infringement ruling granted 16-17 December 2025 (pure point of law, "novel and important"); costs judgment [2025] EWHC 3419 (Ch). No Court of Appeal judgment found as at the tracker's October 2026 update; hearing date not confirmed | [CITED: ailawsuittracker.com case page, Taylor Wessing and Burges Salmon commentary; judiciary.uk PDF named in search results, not opened]. MEDIUM: not verified against the court cause list |
| Getty Images v Stability AI (US) | Getty voluntarily dismissed the Delaware action and refiled in the Northern District of California on 14 August 2025 (Bloomberg Law report 2025-08-15); progress after that not found | [CITED: Bloomberg Law headline and search summary]. MEDIUM-LOW |
| Typical indemnity scope (generic, no vendor on page) | Commonly limited to paid or enterprise tiers; conditional on using the provider's filters or guardrails and not disabling citations; excludes output the customer knew or should have known was infringing; often excludes modified output and combinations with other products; trade mark coverage narrower than copyright; liability caps can apply to the indemnity itself; remedy may be to stop using the output | [CITED: Allens, "Using gen AI tools for business: be aware of the many limitations on your IP protections", 2025-02, allens.com.au; Ropes & Gray 2024-01 and Farrer & Co. commentary]. MEDIUM: law-firm commentary, not provider contract text |

**Suggested neutral Getty line (one dated sentence, register-linked, "Full treatment in section 14."):** "As at 2026-10-24, the UK High Court dismissed Getty's secondary copyright claim and upheld a narrower trade mark claim in a judgment dated <time>2025-11-04</time>; Getty has permission to appeal, and a separate US action is pending." Use `<time datetime>` for written dates and teach the numeric gate to strip `<time>` (see Pitfall 3). Re-verify the appeal status against the Court of Appeal listing immediately before publishing (open question 2).

**Neutral table cell content (row by row, no winner, no colour):** Rights: retrieve = existing licence terms govern; licence = per-licence terms; generate = depends on the model terms and any third-party material in output. Indemnity: retrieve/licence = often contractual; generate = conditional (see scope above). Copyrightability: retrieve/licence = rights sit with the existing owner or licensor; generate = purely AI output may not be protectable in the US, human selection and modification may be. Cost visibility: retrieve = low per asset once licensed; licence = per-asset or subscription; generate = metered inference plus review. Speed: retrieve/licence = search time; generate = fast to first draft, review dominates. Grade each row's Basis chip Modelled unless a row rests only on the Copyright Office text (then a Benchmark chip to the source row is acceptable because the PDF was read directly).

## Reviewer-capacity worked example (SPINE-04)

Computed by running `compute()` on `defaultInputs()` / `defaultAssumptions()`, overriding `auto_approval_share` [VERIFIED: local node run 2026-10-24]. Capacity = 12 reviewers x 1,200 h = 14,400 h/year.

| Scenario | Approved-live variants / yr | Generated / yr (yield 95%) | Human review hours / yr | Utilisation (incl. rework 15%) |
|---|---:|---:|---:|---:|
| 1x without gate (auto 0%) | 40,000 | 42,105 | 8,421 | 67.3% |
| 1x with gate (auto 20%, baseline default) | 40,000 | 42,105 | 6,905 | 55.1% |
| 2x without gate (auto 0%) | 80,000 | 84,211 | 16,842 | 134.5% (over capacity) |
| 2x with gate (auto 60%, scaled default) | 80,000 | 84,211 | 7,747 | 61.9% |

Source of each output: `baseline|scenario.variants_per_year`, `.generated_variants_per_year`, `.review_hours`, `.review_capacity_hours`, `.utilisation`. Related existing claims: break-even auto-approval 41% (`break_even_auto_approval.value` 0.409), capacity floor 29% (`capacity_auto_approval.value` 0.285). Default 2x with gate has cycle_days 7.5; at 2x with no gate `cycle_days` is `null` (capacity exceeded), so the table should not show a cycle time.

Points the planner must handle:
1. **Annual vs per quarter.** `compute()` is annual; UI-SPEC says "Assets per quarter". Recommended: change the column to "Approved-live variants per year" and keep annual hours (capacity is defined per year, 1,200 h per reviewer per year). Per-quarter would need a `/4` field on every claim and a new drift path. If the user insists on per quarter: 10,000 / 20,000 variants and 2,105 / 1,726 / 4,211 / 1,937 hours against 3,600 hours of quarterly capacity.
2. **Hours vs utilisation arithmetic.** Utilisation includes the 15% rework loop, hours do not. 16,842 / 14,400 = 117%, but utilisation shows 134.5%. Label the hours column "before rework" and add one sentence plus `asm-rework-rate` data-fig, or the table looks wrong to a CFO.
3. "Without gate" means auto-approval share 0 (everyone is human-reviewed; sampling and escalation then do not apply). State that.
4. Scenario claims need an `override` marker so the drift test recomputes with the same override; define it independently in the test.
5. At the reference's published clearance (19.2% and 28.4%), 2x utilisation is 111.3% and 100.1% [VERIFIED: local run]. This is the strongest honest argument for stating the 60% as a target that depends on T0/T1 being template-derived.
6. Optional, Claude's discretion: a one-campaign load line (a 12,000-variant campaign at 2x with gate is about 1,160 review hours before rework, roughly one reviewer-year of the 1,200-hour cap; without the gate about 2,530). Arithmetic is G = 12,000/0.95, hours = G x h x 0.2 with h = 1 - 0.6 x 0.9 = 0.46. Needs new data-figs and a test; only add if word budget allows.

## Tier table and defaults (SPINE-03)

Calc defaults to keep [VERIFIED: data.js `asm-tier-mix`]: baseline T0-T3 = 40/35/20/5%, scaled (2x) = 55/30/12/3%; T0+T1 = 85% at 2x which equals the validation cap; `auto_approval_share` 20% today, 60% at 2x; sampling 5% and escalation 5% of auto-approved; 12 minutes per reviewed variant; rework 15%. calc validation requires `auto_approval_share <= T0+T1`, so 60% of all variants auto-approved means the agent clears about 70% of the eligible 85%. Say this plainly in prose so T0/T1 wording is consistent with 60%.

Proposed Modelled ranges at 2x (all tagged Illustrative, contain the default): T0 45-65% (default 55%), T1 25-35% (30%), T2 8-16% (12%), T3 2-5% (3%). Marking: UI-SPEC says "the row matching the calc default gets a default mark"; every row has a default, so put the `default-mark` badge after the range in every row (default value shown as its own data-fig) and note the baseline (today) mix in the lead-in. Recommend resolving this ambiguity in plan 1 (see conflicts list).

Example assets (Claude's discretion, marketing-neutral): T0 resizes, crops, locale swaps of pre-approved strings, feed-rendered tiles from approved templates (approved by: policy match, sampled by a human); T1 new copy variants inside an approved claims library, template layouts using retrieved approved imagery (agent pass, human sampled); T2 newly generated imagery, new claim phrasings, regulated-category copy, new audience segments (human reviewer); T3 hero work, testimonials and endorsements, likeness or voice, comparative or health/finance claims (senior human plus legal). Human-only list adds children/minors and anything touching third-party rights. All "illustrative, not legal advice".

Ranges and defaults are numbers: model them as assumption entries `asm-tier-range-t0..t3` (`kind: 'evidence'`, display "45-65%") and four claims `tier-default-t0..t3` (value from `assumptions['asm-tier-mix'].value.scaled[i]`) with a data.test asserting equality and that the range contains the default. `asm-tier-mix.display` today is one long string, so it cannot serve as per-tier figures.

## Fatigue, harness and telemetry content (SPINE-05/06/07)

- Fatigue controls (grade Modelled/Speculative, no unsourced numbers): blind-first review (human forms a verdict before seeing the agent's), seeded-error catch rate as the standing fatigue signal, session caps and queue rotation, random sampling of auto-approvals, approval-rate and time-per-asset drift alarms, mandatory reason codes on override. Reference support: the reviewer "grading its own charitable narrative" and a block on self-merge are both cited as loopholes. Vigilance-decrement literature underpins session caps `[ASSUMED]`, so do not cite it as Benchmark.
- Escape-rate sampling arithmetic (optional, `[ASSUMED]` statistical rule of three, not verified in this session): at the 2x defaults 60% x 80,000 = 48,000 auto-approved a year, 5% sampled = 2,400 audits; zero observed escapes in n audits bounds the true rate near 3/n (about 0.1% at 2,400 a year, about 0.5% per quarter at 600). Safe to omit; if used, it needs data-figs and a Speculative chip.
- Harness metric table (UI-SPEC columns Metric, What it tells you, Published threshold, Grade): agreement with human ground truth per criterion and per tier; escape rate (human sample of auto-approvals); seeded known-bad and rights-trap catch rate; drift over a rolling window; change-gate result (baseline vs treatment inside a stated noise band). Thresholds: say "published and calibrated on the organisation's own data" and prefer relative wording ("no regression beyond the noise band", "no rights-trap misses in T0-T1"); the reference calibrates margins empirically, so any numeric threshold on the page is Speculative and must be a data-fig. Keep numeric thresholds to at most two.
- Telemetry (SPINE-06): asset-ID join from manifest to ad-platform and CRM performance, plus first-pass compliance, auto-approval share by tier, reviewer utilisation, queue age, rework rate, cost per approved-live asset, cycle time, policy and skill version in use.

## SVG figures (GEN-05 and s05-s08)

Geometry from UI-SPEC stands (viewBox `0 0 300 H`, multiples of 4, 240-wide nodes at x=30, node height 40 for 2 lines and 56 for 3, gap 24). Planner-relevant findings:

1. **Duplicate-id trap.** Figure 1 already uses `id="f2-t"` / `f2-d`. UI-SPEC proposes `fN-t` with N the figure number, so Figure 2 would reuse `f2-t`. W3C Nu was run in Phase 1 and would flag duplicate ids. Use `fd2-t`, `fd2-d` ... `fd7-*` (and per-SVG marker ids `fd2-arrow`, `fd2-arrow-review`). The `figure.test.js` match is section-scoped (`#s02`), so existing tests are unaffected. Do not define `arrow` markers once in a hidden `display:none` SVG: markers can fail to render from display-none documents in some browsers; per-SVG markers are safe.
2. **Text fit.** At 12px monospace the advance is about 0.6-0.62 em (7.2-7.5 units) `[ASSUMED]` for SF Mono/Menlo/Consolas fallbacks. A 240-unit box fits about 30 characters, so the 28-character limit holds. A **112-unit fork box fits about 12 characters**, which contradicts the 28-character rule. Either keep fork nodes to 12 characters per line ("Auto-approve", "Human queue") or stack the fork vertically. Add a test that, for every `<g class="node">`, each `<text>`/`<tspan>` line has `chars x 7.5 <= rect width - 16` and the line count x 16 plus 8 equals the rect height.
3. **Size floor test.** In SVG, CSS px equals user units. The test cannot measure rendering, so assert the rule: `style.css` contains `.fig-d text` with `font: 400 12px`; no `<text>` carries `font-size`/`style`; every `svg.fig-d` has `viewBox="0 0 300 H"` with H in [360, 560] and CSS `max-width:360px`. Effective size at a 320px viewport with 16px page padding is 12 x 288/300 = 11.5px (the UI-SPEC floor of 11px).
4. **Accent discipline test.** Collect every `<rect>/<path>/<line>` in `svg.fig-d`; any element with class `edge-review` or `node-review` may use accent, others must not; assert `style.css` only references `var(--verified)` for those two classes within `.fig-d` rules (regex on the rule text). `--inferred` and `--low` must not appear in `.fig-d` rules.
5. **Existing Figure 1 CSS selectors.** `.fig text` and `svg.fig` are class-scoped to Figure 1; new diagrams use class `fig-d`, so no accidental inheritance. Figure 1 carry-over: remove `svg.fig{min-width:560px}` at <=480px and set `min-width:800px` at <=960px inside the `.fig-scroll` region (10px effective, the existing floor). `style.test.js` has no assertion on that rule, so add one.
6. **Number gate.** SVG content is stripped before the numeric gate, but `.fig-steps` lists and captions are not. Keep digits out of them ("N tries" is fine, "3 tries" is not unless data-fig).
7. `.fig-steps` text equivalent is required for Figures 2-5 and 7; Figure 6 (ladder) may point to the tier table. Test: each `svg.fig-d` figure contains `ol.fig-steps`, or its caption includes "see the table" and a `<table>` follows.

## Spec/test conflicts the planner must resolve (decide in Plan 1)

| # | Conflict | Recommendation |
|---|----------|----------------|
| C1 | UI-SPEC s03 title "The factory model"; `page.test.js` TITLES and the TOC lock "The factory and the content supply chain" | Follow the approved UI-SPEC; change TITLES, the TOC `<span>` and the h2 in one commit |
| C2 | `fN-t` ids collide with Figure 1's `f2-t` | Use `fd2`..`fd7` |
| C3 | 112-unit fork boxes vs 28 characters per line | 12 characters per line in forks, or stack |
| C4 | Capacity table "per quarter" vs annual `compute()` | Use annual; amend the column label |
| C5 | "The row matching the calc default" gets the mark; every tier has a default | Mark every row's default value; baseline in prose |
| C6 | Chip-after-every-number test vs "chip once per paragraph / one per table row" | Governing-chip rule in Pitfall 1 |
| C7 | Numeric gate vs `T0`-`T3`, `section 14`, `Part 2`, written dates | Pitfall 3 |
| C8 | UI-SPEC says "Applies to: all" | Add the `all` format; a data-fig must equal `formatValue()` |

## Common Pitfalls

### Pitfall 1: Chip density change breaks the data-fig test unless it is rewritten, not relaxed
**What goes wrong:** `page.test.js` `figRe` requires `<a class="chip">` immediately after every `data-fig` span, and compares chip word, class and href with `data.js`. The new rules (chip once per claim per paragraph; one chip per table row; unlinked grade chip in register rows; Value cell plain) all violate that adjacency.
**How to avoid:** Keep the first half of the test unchanged for every data-fig (id exists, display equals `data.js`). Replace the adjacency half with a "governing chip" rule: (a) prose: the first data-fig of each (ref, grade) pair per `<p>` must be followed by a linked chip whose word, class and href match; later same-ref figures in that paragraph need none; (b) table rows outside s15: the row contains exactly one linked chip, its word/class equal the grade of every data-fig in the row and its href equals their shared ref; (c) s15 register rows: one unlinked `<span class="chip ...">` in the Grade column equal to the entry's grade. Keep the "all data-fig accounted for" count check (WR-07). Relax only "every chip is a link" to "every chip outside s15 registers is a link" (UI-SPEC). Add: no `<p>` has more than 3 chips (4 for the answer-first paragraph), no paragraph repeats the same href chip twice.
**Knock-on updates:** `page.test.js` line 85 (grade cell is `<a class="chip..." href="#id">`), `figure.test.js` "18 figure ids each with a chip" (becomes: 18 data-figs, 9 rows, one chip per row; the row has 2 figures), s01 six-lever test ends with a linked chip after `</td>` (stays), s15 duplicate Value chips (remove).
**Warning signs:** a green suite after you deleted the chip assertion rather than moving it.

### Pitfall 2: Skeleton test and s12 stub
`'skeleton sections 03 to 14 carry a scope sentence and the later note'` loops n=3..14; s03-s08 will no longer have `<p class="later">`. Change to 9..14 and assert the new s12 stub text exactly ("This section will compare tool categories and, in this section only, named vendors, with every claim sourced and dated."). Also remove "it is not rising" (answer paragraph) and assert "has flatlined". `page.test.js` has no test on h3 "Flat budget" so add one for the new h3.

### Pitfall 3: Numeric gate vs T-tiers, section references, dates
`ALLOWED_NUMERIC_TOKENS` is exact-match on tokens produced by `/\d[\d,.–-]*%?x?/g`. "T0–T3" tokenises to `0` and `3`; "section 14", "Part 2", "2025" fail. Do not add loose digits to the allow-list. Instead extend the gate's pre-strip list narrowly: `\bT[0-3]\b` tokens, `<a href="#s\d\d">...</a>` cross-link text, and `<time datetime="YYYY-MM-DD">` elements (with a new test that `datetime` is a valid ISO date and the same date appears in a register row). Add `Figure \d+` is already stripped. Mono row headers like `src-...` live inside register rows which are already exempt.

### Pitfall 4: Registers must be updated in lockstep with data.js
`registers cover every source and assumption` and the field-by-field tests mean every new source (Intercom teardown, NYU/Emory, Copyright Office report, Getty v Stability sources) and every new assumption (7 matrix rows, 4 tier ranges, capacity scenario refs, any threshold) needs an `<tr id>` in s15 with exact label, basis and display. Budget a task for "add register rows" per plan, and keep `sources` fields complete (`title, publisher, published, accessed, url, bias, read_via`). Source register link text must equal its URL (`style.test.js` IN-05). Remember lever-evidence rows: Value holds a short value, Basis the sentence; the test `text.includes(e.basis)` and the label cell still pass if `display` and `basis` become different strings in `data.js` (edit `lever()` accordingly and the test `lever evidence ... no company names` still passes).

### Pitfall 5: Vendor and Intercom hygiene tests
Current test bans only `gradial|airops|profound` outside s12/s15. UI-SPEC adds "no vendor names in s03-s08" and "Intercom exactly once outside s12/s15". Build the name list deliberately (image/model/cloud/ad-platform names) and exclude `Getty` and `Stability` (named by design). Do not write "Google Display Network" for the CTR study; say "a display ad network". The author's COI box names iStock/Getty and is allowed.

### Pitfall 6: Row-header and typography fixes can silently change layout
`tbody th[scope=row]` is also used by registers; IDs need `th.id` mono lowercase. The register markup currently sets `<th scope="row">src-...` without class `id`, add it, and check `.register tr:target` still works. `strong,b{font-weight:600}` also changes the `.default-mark` badge (a `<b>`); set it explicitly. A style test for "no font-size outside the four sizes" must whitelist `clamp()` and the 16px/25px mobile variants (grep every `font:` shorthand and `font-size`).

### Pitfall 7: Print and accent rules
Accent strokes map to `#000` 3px in print, others `#555` 1.5px; add to the existing `@media print` block (extend the existing block rather than adding a second one). `break-inside: avoid` on `.fig-grid` and `tr`.

### Pitfall 8: Honest-default exposure (60% auto-approval)
The reference's published auto-approval is 19.2% of merged PRs (goal above 50%), with a 28.4% live bot approval rate; the page's 20% baseline matches the first figure but 60% at 2x is above any published datum. CONTEXT says keep defaults unless research forces a change; this research does not force a model change, but s07 must not present 60% as evidence: state it as a Modelled target that depends on the share of T0/T1 template-derived assets, show the 41% break-even and 29% capacity floor, and (optionally) cite the reference datum once, generically, Modelled + company-reported. Add a falsifier-style sentence tying back to CRED-05.

### Pitfall 9: Flagship-campaign vs model-default confusion
12,000 variants for one campaign vs 1,000 average in the model. One explicit sentence, and the matrix caption already says "Worked example".

### Pitfall 10: Source dating
Gartner-style "read via" notes are tested field by field. For SSRN, write the real `read_via` ("SSRN returns 403 to automation; figures read from NYU Stern research highlight and Compass Lexecon summary"), not "confirmed in a browser" until the author actually does it.

## Code Examples

### variantMatrix tests (shape)
```js
// Source: contract above; hand-calculated golden case (verified by prototype run 2026-10-24)
const F = [
  { id: 'sizes', count: 10, applies: 1 }, { id: 'channels', count: 5, applies: 0.75 },
  { id: 'locales', count: 6, applies: 0.4 }, { id: 'audiences', count: 5, applies: 0.75 },
  { id: 'tests', count: 4, applies: 0.5 }, { id: 'feeds', count: 4, applies: 0.5 },
];
const r = variantMatrix(4, F);
assert.deepEqual(r.rows.map((x) => Math.round(x.variants)), [40, 160, 480, 1920, 4800, 12000]);
close(r.total, 12000);
close(variantMatrix(4, [...F].reverse()).total, 12000);          // order independence
// independent enumerator for the small case
const enumerate = (n, fs) => fs.reduce((items, f) => { const k = Math.round(items * f.applies); return k * f.count + (items - k); }, n);
assert.equal(enumerate(2, [{ count: 3, applies: .5 }, { count: 2, applies: .5 }]), 6);
```

### Capacity scenario recompute inside data.test.js
```js
// Source: local run 2026-10-24; test recomputes with its own overrides (not the data.js list)
const run = (multiplier, auto) => {
  const a = { ...defaultAssumptions(), auto_approval_share: { baseline: auto, scaled: auto } };
  const r = compute({ ...defaultInputs(), multiplier }, a);
  return multiplier === 1 ? r.baseline : r.scenario;
};
assert.equal(Math.round(run(2, 0).review_hours), 16842);
assert.equal((run(2, 0).utilisation * 100).toFixed(1), '134.5');
assert.equal((run(2, 0.6).utilisation * 100).toFixed(1), '61.9');
```
Note `compute()` reads baseline from `{baseline,...}` and scaled from the same object, so set both sides when you want a single-scenario override.

### Diagram node + text-fit test (shape)
```js
// For each <g class="node">: rect w,h and each tspan line
assert.ok(line.length * 7.5 <= w - 16, `"${line}" does not fit a ${w}-unit node`);
assert.equal(lines * 16 + 8, h);
```

## State of the Art

| Old approach | Current approach | Impact |
|--------------|------------------|--------|
| Judge by vibes whether a model/prompt swap helped | Baseline-vs-treatment on a fixed ground-truth dataset with noise bands (reference: 12 of 13 experiments inconclusive, one newer model worse) | s08 headline: owning the eval |
| One quality score gates approval | Eligibility (policy tier) separate from quality verdict | s06/s07 two-axis design |
| Generator self-reports quality | Independent reviewer, different model/prompt family | SPINE-02 |

**Deprecated/outdated:** nothing in the stack. The Getty v Stability facts are time-sensitive (appeal pending as at 2026-10-24).

## Runtime State Inventory

Not a rename/refactor/migration phase. Omitted.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Monospace advance about 0.6-0.62 em for the font stack, so 12 chars fit 112 units and 30 fit 240 | SVG figures | Text overflows nodes on some devices; mitigate with the fit test and the author's visual check at 320 px |
| A2 | NYU/Emory CTR pair (3.73%/4.44%/2.56%), sample sizes, field-vs-lab location of the disclosure effect | NYU/Emory | Only trade-press supported; do not print them without the primary |
| A3 | SSRN paper is a non-peer-reviewed preprint as of 2026-10-24 | NYU/Emory | Bias text on the source row would be wrong |
| A4 | Rule of three for escape-rate bounds; vigilance decrement as the basis of session caps | Fatigue | Optional content; omit if not confirmed |
| A5 | Tier ranges (45-65/25-35/8-16/2-5) and example assets | Tier table | Illustrative; Claude's discretion area, all Modelled |
| A6 | Marker `display:none` rendering issue in some browsers | SVG figures | Low; per-SVG markers are safe either way |
| A7 | Getty appeal status (no judgment, hearing not listed) as at 2026-10-24 | Imagery facts | Stale or wrong legal line; re-check cause list before publishing |
| A8 | Typical indemnity conditions are representative across providers | Imagery facts | Wrong generalisation; law-firm commentary only; wording kept generic |

## Open Questions

1. **Will the author confirm the NYU/Emory SSRN paper in a browser?**
   - Known: figures are stated by the authors' institutions; SSRN is 403 to automation.
   - Unclear: sample, design detail, where the disclosure effect was measured, exact date.
   - Recommendation: one `checkpoint:human-verify` in the data.js/source plan; ship Modelled + secondary-source note if not confirmed (the UI-SPEC copy is ready).
2. **Getty v Stability appeal status**
   - Known: permission granted December 2025; trackers show pending in October 2026.
   - Unclear: hearing date, any Stability cross-appeal outcome, US action progress.
   - Recommendation: keep the line to the verified facts plus "pending"; re-check judiciary.uk and the Court of Appeal listing at the end-of-phase checkpoint; full treatment in Phase 4 legal review.
3. **Include the reference's 19.2% / 28.4% auto-approval datum on the page?**
   - Recommendation: yes, one sentence, Modelled + `company-reported`, generic wording ("the one public reference"), because it is the honest anchor against 60%. Needs a source row and one or two claims. If the user prefers, descope and keep only the 41% and 29% claims.
4. **Annual vs per-quarter capacity columns (C4).** Recommendation: annual; needs the UI-SPEC column label amended.
5. **Does the s03 title follow UI-SPEC (C1)?** Recommendation: yes.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | tests, calc | yes | v23.7.0 | CI uses its own Node |
| python3 | local preview (`python3 -m http.server -d site`) | yes | present | any static server |
| gsd-sdk | commit helper | yes | present | plain git |
| A browser | local-preview checkpoint (Figures 2-7 at 320/375/768/1280, print preview), SSRN confirmation | user-side | n/a | user performs; Chrome tooling not needed for planning |

No missing blocking dependencies.

## Validation Architecture

Skipped: `workflow.nyquist_validation` is `false` in `.planning/config.json`. (Test commands for the plans: `node --test` full suite, runs in about 0.4 s; per-file `node --test test/calc.test.js`.)

## Security Domain

`security_enforcement` is not set to false, so a brief assessment: the page is static, ships no script, and loads only same-origin CSS under CSP `default-src 'none'; style-src 'self'`.

| ASVS Category | Applies | Control |
|---------------|---------|---------|
| V2/V3/V4 Authentication, Session, Access Control | no | no accounts, no state |
| V5 Input Validation | partly | `calc.js` validates inputs and never returns NaN; `variantMatrix()` follows the same `{ok:false, errors}` contract |
| V6 Cryptography | no | none |
| V14 Config / CSP | yes | no inline `style=`, no `<script>`, no base64; SVG uses class-based styling and presentation attributes only (CSP-safe) |

Threats: injected content from the downloaded reference (treated as untrusted data; images never committed; no instructions observed), outbound links (use plain `<a href>`; register links already present), and unsourced legal claims (mitigated by dated neutral lines, COI note and "not legal advice" callout).

## Sources

### Primary (HIGH confidence)
- https://lyonsv.github.io/intercom-2x-teardown/ - full text of sections 05-14 plus key screenshots viewed (auto-approval gate, curator Live tab, Compare/Opus regression, Backlog 0 slide); read 2026-10-24
- https://www.copyright.gov/ai/ and the Part 2 PDF (executive summary pp. ii-iii read directly) - January 2025 report
- Local repo: `site/js/calc.js`, `site/js/data.js`, `test/*.test.js`, `site/index.html`, `site/assets/style.css`; `compute()` and prototype `variantMatrix()` executed locally

### Secondary (MEDIUM confidence)
- https://www.stern.nyu.edu/experience-stern/faculty-research/ai-advertising-paradox (2025-11-06, links SSRN id 5638311)
- https://www.compasslexecon.com/insights/publications/the-impact-of-visual-generative-ai-on-advertising-effectiveness (2025-11-11)
- https://ailawsuittracker.com/cases/getty-images-v-stability-ai-uk-2025-ewhc-2863-ch/ ; https://www.taylorwessing.com/en/insights-and-events/insights/2026/01/next-steps-for-getty-v-stability-why-has-permission-to-appeal-been-granted ; https://www.burges-salmon.com/articles/102lydc/getty-images-v-stability-ai-getty-granted-permission-to-appeal ; https://www.judiciary.uk/wp-content/uploads/2025/11/Getty-Images-v-Stability-AI.pdf (named, not opened)
- https://news.bloomberglaw.com/ip-law/getty-drops-stability-ai-copyright-suit-refiles-in-california (headline via search)
- https://www.allens.com.au/insights-news/insights/2025/02/using-gen-AI-tools-for-business-be-aware-of-the-many-limitations-on-your-IP-protections/ ; Ropes & Gray 2024-01 and Farrer & Co. indemnity commentary (search summaries)

### Tertiary (LOW confidence)
- the-decoder.com 2025-12-20 and other trade write-ups for the NYU/Emory sample sizes and CTR pair; Columbia "AI disguise" study listing
- SSRN abstract page: HTTP 403, not read

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new technology; Node version and test baseline verified
- Architecture / test interplay: HIGH - read every test and ran the numbers
- Reference patterns: HIGH - full text read, key screenshots viewed
- NYU/Emory and legal facts: MEDIUM - institutional summaries and law-firm commentary, primary SSRN blocked
- Pitfalls: HIGH for test conflicts; MEDIUM for font-metric assumptions

**Research date:** 2026-10-24
**Valid until:** 2026-11-24 (legal status and study confirmation items are the time-sensitive ones)
