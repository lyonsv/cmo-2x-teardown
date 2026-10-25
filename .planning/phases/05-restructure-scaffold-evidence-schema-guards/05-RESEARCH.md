# Phase 5: Restructure Scaffold, Evidence Schema & Guards - Research

**Researched:** 2026-10-25
**Domain:** Static-HTML restructure under test guards (hand-written page, `node:test`, headless-Chrome gates). No external libraries.
**Confidence:** HIGH (every finding below comes from reading or running this repo on 2026-10-25; baseline `node --test` is 378 pass / 0 fail, `node scripts/crosscheck.mjs` is 0 failures)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Section architecture and ids**
- New body order with semantic ids and display numbers 01–10: `#opportunity` (01, What 2x means — hosts v1 s01 claim & measurement and s02 CFO answer for now), `#autonomy` (02, Why autonomy is the lever — Intercom evidence lands here in Phase 7), `#build` (03, What needs to be built — hosts v1 s04 platform material for now), `#supply-chain` (04, The first workflow — hosts v1 s03 factory model for now), `#economics` (05, The economics — hosts v1 s11 calculator), `#outcomes` (06, hosts v1 s10), `#expansion` (07, hosts v1 s09 levers), `#roadmap` (08, hosts v1 s13 adoption and Backlog 0), `#risks` (09, hosts v1 s14), then appendices with letters: `#appendix-campaign` (A, v1 s05), `#appendix-review` (B, v1 s06), `#appendix-gate` (C, v1 s07), `#appendix-evals` (D, v1 s08), `#compare` (E, v1 s12 How this compares), `#register` (F, v1 s15 source register).
- Every v1 id (`s01`–`s15`, every `sNN-h` heading id, every figure/table/asm/src id) stays on the element that holds that v1 content after the move, so old links land on the right content without duplicate ids. Where a v1 section becomes a subsection, its element keeps `id="sNN"` and its heading is demoted to h3 (heading order must stay valid for a11y).
- TOC lists the ten body sections plus an "Appendices" group; display numbers are plain text, not ids.
- New sections that have no v1 content yet (`#autonomy`, plus the new lead of `#build`, `#supply-chain`, `#economics`) get a heading and one honest framing paragraph stating the question the section answers; no new numbers.
- The live page is NOT republished during Phases 5–9: commits stay local on main and are pushed once in Phase 10 after the full gate run, so readers never see a half-reworked page. (Pushing main deploys via pages.yml.)

**Share links and calculator**
- `state.js`/`ui.js` must keep reading `#s11?…`; the calculator's container keeps `id="s11"`. A fixture test stores recorded v1 share-link strings (including `scenario=redeploy`, `hold`, `reduce`) and asserts `parseHash` restores the same values. Scenario renaming to A/B/C is Phase 9; this phase only locks the legacy contract.

**Guards (tests)**
- Inventory test: snapshot of every v1 `data-fig` id and `<figure>` id/number taken at the start of the phase, committed as a fixture; a test fails if any disappears unless listed in an explicit `RETIRED` list with a reason (initially empty).
- Anchor test: every `href="#…"` in `site/index.html` resolves to an element id (strip `?…` query).
- Jargon ban-list test on body text (case-insensitive): "agentic marketing operating system", "AI transformation", "unlock", "supercharge", "game-changer", "revolutionise/revolutionize", "seamless", "synergy", "leverage AI", "10x your". Register/source titles excluded.
- Existing tests that hard-code section ids (`EXPECTED_FIGURES`, s06 Intercom-once rule, s12 h3 list, etc.) are updated in the same mechanical commit that moves ids, with no content changes in that commit.

**Evidence classes**
- Add `EVIDENCE = ['observed', 'benchmark', 'illustrative', 'hypothesis']` and an `evidence` field on every assumption, claim and source in `data.js`. Definitions: observed = measured results reported by a named organisation (e.g. company-reported case data); benchmark = sourced industry survey, statistic or study; illustrative = a modelling input describing the illustrative company; hypothesis = an effect of the programme that needs validation in a pilot.
- Mechanical defaults: assumptions whose baseline and 2x values differ, or that describe a programme effect, are `hypothesis`; organisation descriptors are `illustrative`; Benchmark-grade sourced claims are `benchmark`; vendor-claimed / company-reported case figures are `observed` (with their existing flag). Derived claims inherit the weakest class of their inputs (hypothesis < illustrative < observed < benchmark for display).
- Allowed (evidence, grade) pairs enforced by test: benchmark→{Benchmark, Modelled}; observed→{Benchmark, Modelled} and must carry a flag when it is not independent; illustrative→{Modelled, Speculative}; hypothesis→{Modelled, Speculative}.
- Display: an "Evidence" column in the assumptions table and the source register, rendered as plain text labels (not colour-only). Body grade chips are unchanged.
- Grade key gains a short paragraph defining the four classes and stating plainly that nothing on the page is observed for the subject organisation; the 12-week pilot is what produces observed data.

**Browser gates**
- Add `scripts/gates.sh` that runs `node --test`, crosscheck, smoke (one automatic retry for the known "no page target" flake), a11y and print in order, and document it as the per-phase gate. Browser gates are not added to CI this phase (CI deploy must not be blocked by the CDP flake).

### Claude's Discretion
- Exact wording of the framing stubs and TOC labels (plain English, no jargon, matching the brief's executive questions).
- Whether appendices render with a visual divider/label.

### Deferred Ideas (OUT OF SCOPE)
- Browser gates in CI (future requirement).
- Scenario A/B/C rename (Phase 9).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STRUCT-01 | Page reordered around executive questions, TOC matches | Section map, move recipe, TOC test rewrite (Architecture Patterns, Test Impact Map) |
| STRUCT-02 | Semantic ids; every v1 anchor still resolves | v1 id inventory (213 ids), div-wrapper pattern, V1_IDS fixture + resolve test |
| STRUCT-03 | v1 `#s11?…` share links restore, fixture test | Real recorded strings and parse results (Share-link section) |
| STRUCT-04 | Test fails if v1 `data-fig` or `<figure>` vanishes unless RETIRED | Inventory counts (274 unique data-fig ids, 8 figures, 26 tables) and generator script |
| STRUCT-05 | Test fails on any unresolved `href="#…"` | Already enforced in 3 places; add one canonical test that strips `?query` and covers V1_IDS |
| STRUCT-06 | Test fails on banned jargon in body | Baseline scan found zero hits; regex and scope given |
| EVID-01 | `evidence` on every assumption, claim, source + pair test | Full proposed classification (prototype passes with 0 violations) |
| EVID-02 | Reader sees class in assumptions table and register | Register is static HTML; column inserts and the test lines that pin cell indexes |
| EVID-03 | Grade key explains four classes, nothing observed for subject org | Legend markup, tests that constrain it, numeric-gate trap on "12-week" |
</phase_requirements>

## Summary

The page is a hand-written 2,354-line `site/index.html` with 15 `<section id="sNN">` blocks, one TOC `<nav>`, and **static HTML registers** (the source register and assumptions register are typed into the page and cross-checked against `data.js` by tests; nothing is rendered by JS except the live calculator). That shapes everything: adding an Evidence column means hand-editing 107 `<tr>` rows plus the tests that pin cell positions, and the restructure is a block move in one file.

The biggest risk is not the move itself but the test suite's coupling to the old structure. About 60 test sites call `sectionHtml('sNN')`, which slices from `<section id="sNN"` to the **first** `</section>`. Demoted v1 sections become `<div id="sNN" class="subsection">` (UI-SPEC, and also forced by `scripts/a11y.mjs`, which requires every `main section` to be labelled by an `h2` it contains). So the first job is a shared balanced-tag helper, introduced **before** the move so the move commit changes only the page and a short list of structure tests. Three other traps: tests that regex `<h3 id="s09-…">`/`<h3 id="s14-…">` will start matching the demoted heading `s09-h`/`s14-h`; the numeric gate iterates `SECTION_IDS` and would stop covering the new h2 and stub text; and the UI-SPEC example stub for `#autonomy` says "Intercom", which breaks the "Intercom exactly once outside s12 and s15" test.

Evidence classes prototype cleanly under CONTEXT's mechanical rules: 45 sources, 62 assumptions, 214 claims, **zero** (evidence, grade) violations. A short list of rows is genuinely ambiguous (statutes, vendor product-doc sources, design-recommendation assumptions, press incident reports) and is flagged for the planner below.

**Primary recommendation:** Wave 0 adds guards and fixtures against the unmodified page (all green), Wave 1 is one mechanical move commit (page + structure tests + helper usage, no copy changes), Wave 2 adds stubs/TOC polish/CSS and the evidence column and key. Keep every commit green on `node --test` and crosscheck; run `scripts/gates.sh` at each wave end.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Section order, ids, TOC, stubs | Static HTML (`site/index.html`) | CSS (`style.css`) | Hand-written page; no generator |
| Evidence field and allowed pairs | Data (`site/js/data.js`) | Tests | Single source of numbers/grades; register is a hand-copy checked by tests |
| Evidence column in registers | Static HTML | Tests + crosscheck | Registers are typed HTML, not JS-rendered |
| Share-link contract | `site/js/state.js` (pure) | `ui.js` (restore/focus) | `parseHash` is DOM-free and testable in Node |
| Guards (inventory, anchors, jargon) | `test/*.js` (node:test) | `scripts/crosscheck.mjs` | CI runs only `node --test` |
| Browser gates | `scripts/*.mjs` via Chrome CDP | `scripts/gates.sh` | Local only (CONTEXT) |

## Standard Stack

No packages are installed in this phase. Everything is hand-written HTML/CSS/JS plus Node built-ins.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Node `node:test` + `node:assert/strict` | Node v23.7.0 local, 22 in CI [VERIFIED: `node --version`, `.github/workflows/pages.yml`] | All guard tests | Project convention (CLAUDE.md); no `package.json` dependencies |
| Headless Google Chrome via `scripts/cdp.mjs` | local app at `/Applications/Google Chrome.app` [VERIFIED: ls] | smoke / a11y / print | Existing harness |
| `pdftotext` / `pdfinfo` (poppler) | `/opt/homebrew/bin/pdftotext` [VERIFIED: command -v] | print gate | Existing print.mjs requirement |
| `python3 -m http.server` | python3 at `/opt/homebrew/bin/python3` [VERIFIED] | `startServer()` in cdp.mjs | Existing |

**Installation:** none. **Package Legitimacy Audit:** No external packages are recommended; slopcheck not applicable. Packages removed: none. Flagged: none.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | tests, gates | yes | v23.7.0 | — |
| Chrome | smoke, a11y, print | yes | installed app | `CHROME` env override |
| pdftotext/pdfinfo | print gate | yes | poppler (brew) | none (print gate fails loudly by design) |
| python3 | static server | yes | brew | — |
| bash | `scripts/gates.sh` | yes (macOS zsh/bash) | — | — |

Missing dependencies: none.

## Architecture Patterns

### System Architecture (data flow)

```
data.js (sources, assumptions, claims, GRADES, FLAGS, +EVIDENCE)
   |-- imported by --> test/*.js, scripts/crosscheck.mjs, ui.js (via modelContext)
   |
index.html (hand-written)
   |-- masthead / meta / #answer / .legend / <nav.toc>
   |-- body sections (h2): opportunity, autonomy, build, supply-chain, economics,
   |        outcomes, expansion, roadmap, risks
   |        each hosts  <div id="sNN" class="subsection"><h3 id="sNN-h">…</h3> v1 content </div>
   |-- .appendix-divider
   |-- appendix sections (h2, letters A–F): appendix-campaign, appendix-review,
   |        appendix-gate, appendix-evals, compare, register
   |-- static register rows <tr id="src-…|asm-…"> (hand-copied from data.js, tests compare)
   |
   +-- ui.js (module) --> reads location.hash '#s11?…' --> state.parseHash --> form
test/ + crosscheck  --> read index.html + data.js as text and assert
scripts/gates.sh    --> node --test; crosscheck; smoke(+1 retry); a11y; print
```

### Recommended file additions
```
test/helpers/html.js            # elementById/sectionHtml balanced slicer, strip, decode (new)
test/fixtures/v1-inventory.json # snapshot of v1 ids, data-fig ids, figures, tables (new)
test/fixtures/v1-share-links.json
test/inventory.test.js          # STRUCT-02/04
test/share-links.test.js        # STRUCT-03
test/guards.test.js             # STRUCT-05 canonical anchor test + STRUCT-06 jargon (or split)
test/evidence.test.js           # EVID-01 pairs, EVID-02 cells (or fold into data.test.js)
scripts/gates.sh
```

### Pattern 1: Hosting wrapper (locked by CONTEXT, shaped by UI-SPEC)

```html
<section id="opportunity" aria-labelledby="opportunity-h">
  <div class="sec-head"><span class="sec-num">01</span><h2 id="opportunity-h">What 2x means</h2></div>
  <div id="s01" class="subsection" aria-labelledby="s01-h">
    <h3 id="s01-h">Claim &amp; measurement</h3>
    …v1 content unchanged…
  </div>
  <div id="s02" class="subsection" aria-labelledby="s02-h">
    <h3 id="s02-h">The CFO answer</h3>
    …
  </div>
</section>
```

Why `div`, not nested `section`: (1) `scripts/a11y.mjs` "section names" requires `main section` to be labelled by an `H2` it contains, so an h3-labelled `<section>` fails; (2) `test/a11y-static.test.js` "every section is labelled by its h2" does the same by regex over `<section id=…>`; (3) its "every h4 has a preceding h3 in the same section" uses `<section>…</section>` lazy matches, which nested sections would truncate; (4) `section + section` in `style.css:58` would draw a rule between sibling subsections. [VERIFIED: file reads]

### Pattern 2: Balanced element helper (new, prerequisite for the move)

```js
// test/helpers/html.js
export const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
export const strip = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

// Returns the outer HTML of the element (section or div) carrying id="id", by tag-depth counting.
export function elementById(html, id) {
  const open = new RegExp(`<(section|div)\\b[^>]*\\sid="${id}"[^>]*>`).exec(html);
  if (!open) throw new Error(`missing element #${id}`);
  const tag = open[1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  re.lastIndex = open.index + open[0].length;
  let depth = 1, m;
  while (depth > 0 && (m = re.exec(html))) depth += m[1] ? -1 : 1;
  if (depth !== 0) throw new Error(`unbalanced #${id}`);
  return html.slice(open.index, m.index + m[0].length);
}

// Body of a v1 section as the old tests saw it: for a demoted wrapper, drop its own h3 heading.
export function sectionHtml(html, id) {
  const el = elementById(html, id);
  return el.replace(new RegExp(`<h3 id="${id}-h">[\\s\\S]*?</h3>`), '');
}
```

Dropping the wrapper's own `<h3 id="sNN-h">` keeps legacy tests that regex `<h3 id="s09-…">` or `<h3 id="s14-([a-z]+)">` working (they would otherwise match `s09-h` / `s14-h`; see pitfall 3). The helper is safe on the current page for `section` ids too (no `<section>` nests, no self-closing `div`). [ASSUMED: no `<div` appears inside inline SVG text or comments in index.html; verify when writing the helper by asserting depth returns to 0 for all 15 ids on the unmodified page, which Wave 0 does.]

### Anti-Patterns to Avoid
- **Moving HTML by hand in an editor.** Do it with a throwaway script that slices on the section line ranges and wraps (recipe below), so the move is reviewable as pure relocation.
- **Changing copy in the move commit.** Titles of new h2s are the only new text; stubs, cross-reference labels and the divider go in a later commit.
- **Nested `<section>` for hosted v1 content** (see Pattern 1).
- **Colour on evidence labels** (UI-SPEC: plain `.ev` text).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing in tests | A DOM or regex-per-test | `test/helpers/html.js` tag-depth slicer (above) | Repo already uses regex slicing; one shared, tested slicer replaces ~10 ad-hoc `indexOf('</section>')` |
| Inventory snapshot | Hand-typed id lists | A generator script run once on the pre-move HTML, output committed as JSON | 274 data-fig ids, 213 ids and 26 tables cannot be typed reliably |
| Share-link strings | Invented examples | Strings produced by `serialiseHash` plus the exact strings already in `scripts/smoke.mjs` | Real recorded format; verified below |
| Evidence inheritance | Per-claim literals for 214 claims | One post-pass in `data.js` (rule below) | Drift-proof and testable |

## Runtime State Inventory

This is a reorder/rename of a static page, so the five categories are answered explicitly.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. The calculator uses no `localStorage`/cookies (CLAUDE.md; `state.js` test forbids storage APIs). Share state lives only in the URL hash. | None |
| Live service config | GitHub Pages deploy (`.github/workflows/pages.yml`) triggers on push to `main`. Phases 5–9 must NOT push (CONTEXT). No other service. | Do not push; verify with `git status`/`git log origin/main..` before any phase close |
| OS-registered state | None | None |
| Secrets/env vars | None; `CHROME` env var is an optional override read by `scripts/cdp.mjs` | None |
| Build artifacts | None (no build step, no `node_modules`). Old external links are the "installed" state: `https://lyonsv.github.io/cmo-2x-teardown/#s07` etc. | Anchor + inventory fixtures protect them |

External bookmarks to `#s01`–`#s15` and `#sNN-h`, `#asm-…`, `#src-…` and `#s11?…` are the only runtime state; they must keep resolving. [VERIFIED: grep and repo layout]

## Findings: what hard-codes structure

### v1 ids (all must survive)
213 ids total on the page today [VERIFIED: node script]: `answer`, `main`, `assumptions-register`, `s01`–`s15`, `s01-h`…`s15-h`, `s09-localisation|experimentation|insight|ops|aeo`, `s14-slop|fatigue|goodhart|ip|regulation`, `s15-gaps`, calculator ids (`calc-*`, `in-*`, `hint-*`, `copy-link`, `reset-calc`, `share-link`, `share-hint`), SVG ids (`fd2`–`fd7` title/desc/arrow, `f2-t/d`, `f8-t/d`, `hatch-*`), and `src-*` / `asm-*` register row ids (107). All stay unchanged; only new ids are added.

Heading counts today: 1 h1, 16 h2 (15 sections plus the legend title "How to read the grades"), 38 h3, 0 h4. After the move the h2 count stays 16 (legend title, 9 body h2, 6 appendix h2); the 15 v1 h2s become h3, bringing h3 to 53 before stubs. Every h2 is followed only by h3, so heading order stays valid. [VERIFIED by structure; assert the counts in the structure test.]

### Where tests and scripts hard-code section ids, order, figure numbers or TOC (must change in the move commit unless noted)

| Location | What it assumes | Change needed |
|----------|-----------------|---------------|
| `test/page.test.js:256-272` `TITLES`, `SECTION_IDS` | 15 v1 ids with v1 h2 titles, in order | Replace with new section table (id, display number, h2 title) and a separate `HOSTED` map (v1 id -> {host, h3 title}) |
| `page.test.js:340-351` "table of contents lists s01 to s15" | 15 `<a href="#sNN"><span class="n">NN</span>`, `n === id.slice(1)` | Rewrite: 9 body rows + Appendices group + 6 rows, letters A–F, every href resolves |
| `page.test.js:353-363` "fifteen anchored sections with the fixed snippet" | `<section id="sNN" aria-labelledby>`, `sec-num` = NN, `<h2 id="sNN-h">` | Split: new sections follow the h2 snippet; hosted v1 ids are `<div id class="subsection">` with `<h3 id="sNN-h">` |
| `page.test.js:366-368` "no section carries the later note" | `!html.includes('class="later"')` | **Conflicts with the UI-SPEC "Detail to follow" pill (`.later`).** Rewrite to: `.later` appears only inside the four stub sections; update in the stub commit |
| `page.test.js:404-426` vendor/Intercom tests | `sectionHtml('s12')`/`('s15')` removed before scanning; Intercom once in `s06` | Works unchanged via helper (ids stay). Stub text must avoid vendor names and the word "Intercom" (see pitfall 2) |
| `page.test.js:517-545` numeric gate | `SECTION_IDS.map(sectionHtml)`; strips `<h2 id="s\d\d-h">`; strips `<a href="#s\d\d">` links | Iterate the **new** section ids (so new h2 and stub text are scanned); strip `<h[23] id="[a-z0-9-]+-h">`; link strip keep `#s\d\d` and add new ids; `<span class="sec-num">` already stripped (letters A–F contain no digits) |
| `page.test.js:670` `PROSE_BUDGET` + `proseWords` | Word budgets per v1 id via `sectionHtml` | Works via helper (wrapper body only, h3 dropped; budgets count only `p/li/figcaption/dd`) |
| `page.test.js:1256-1257`, `1436-1448` | `matchAll(/<h3 id="([^"]+)"/)` for s09 blocks; `/<h3 id="s14-([a-z]+)">/` for s14 | Would pick up `s09-h` / `s14-h`; fixed by the helper dropping the wrapper h3 (or filter `-h`) |
| `page.test.js:1126,1184,1218,1246-1247,1307,1311-1316,1341,1347,1471` | Cross-link hrefs and **link text** ("section 01", "section 11", "the factory model", CTA `href="#s11"` in s02 and s10) | hrefs unchanged (ids stay). Text pins at 1307, 1341, 1347 change only if the ordinal labels are rewritten (see below) |
| `page.test.js:1553-1567` "reframe guards" | definition once in s01; variant figures only in `['s05','s07','s15']` | Uses `sectionHtml` ids, still valid |
| `test/diagram.test.js:11,33` `EXPECTED_FIGURES`, `sec = last <section id="(s\d\d)">` before the figure | `<section id="sNN">` | Change regex to `<(?:section|div) id="(s\d\d)"`; **mapping values stay** (`2:'s03',3:'s03',4:'s05',5:'s06',6:'s07',7:'s08'`) because v1 ids are retained. Page order of fig-d figures stays ascending (2,3 in `#supply-chain`; 4–7 in appendices) |
| `test/calc-page.test.js:11-12` | `html.indexOf('<section id="s11"')` … first `</section>` | Use `elementById(html,'s11')` (h3 dropped variant not needed: tests check body content). `:232` `!/<h2[^>]*tabindex/` still true (heading is now h3; add `h3` to regex) |
| `test/compare.test.js:8-9`, `:132` `<h3>([^<]*)</h3>` names, `:154` | s12 slice; vendor names list of attribute-less `<h3>` | Use helper. `<h3 id="s12-h">` has an attribute so `<h3>` regex ignores it |
| `test/legal.test.js:20` | `html.slice(html.indexOf('<section id="s15"'))` | s15 becomes `<div id="s15" class="subsection">` inside `#register`; use `elementById` |
| `test/figure.test.js:7` | `html.match(/<section id="s02"[\s\S]*?<\/section>/)` | Use `elementById(html,'s02')`; "no `<details>` in s02" and svg count unchanged |
| `test/a11y-static.test.js` | h2 per `<section id>`, no heading skip, one h1, h4 rule | Passes if hosted wrappers are `div`. `SECTION_LABEL_EXCEPTIONS` unchanged (`answer`). `secs.length >= 15` still holds (16 sections: answer + 15) |
| `test/crosscheck.test.js:54` | rewrites `href="#id"` to `#s15` | `#s15` still exists; no change |
| `scripts/crosscheck.mjs` | duplicate-id check (`\bid="…"`), chip/cite targets, register rows | Passes unchanged; add Evidence-cell check (see below) |
| `scripts/smoke.mjs:15` `s11Of` | slice from `<section id="s11"` to first `</section>` | Rewrite with a tag-depth slice over the dumped DOM (or `document.getElementById('s11').textContent` via `evalJs`, as line 171 already does). `:187` expects share link ends with `#s11?campaigns=50` (unchanged) |
| `scripts/a11y.mjs:46-53` | heading order (no skips), `main section` labelled by contained H2 | Passes with div wrappers; this is the live check that forces the div choice |
| `scripts/print.mjs` | print-hidden selectors (`.calc-live .btn` …), page ceiling 100 | Unchanged selectors; re-measure page count after stubs/divider/Evidence column |
| `site/js/ui.js:243-247,292` | `$('s11-h')` gets `tabindex=-1`, focused after restore; `$('s11')` scrollIntoView | Works (ids kept). **CSS gap:** `style.css:136-137` draws the focus ring only on `h2:focus`/`h2:focus-visible`; `s11-h` becomes h3, so add `h3:focus, h3:focus-visible` (outline 2px `--verified`, offset 2px). Not in the UI-SPEC "complete" additive list; flag to the planner |
| `site/js/state.js:9`, `ui.js:292` | `'#s11?'` prefix | Unchanged (locked) |
| `site/assets/style.css:57-58` | `section { scroll-margin-top:16px }`, `section + section` rule | Add `.subsection { scroll-margin-top: 16px }` (UI-SPEC) |

Figure inventory today: 8 `<figure>` elements with captions "Figure 1"…"Figure 8"; fig-d diagrams are Figures 2–7 (`<title id="fd{n}-t">`), Figure 1 uses `f2-t/f2-d`, Figure 8 (calculator, `fig-live`) uses `f8-t/f8-d`. [VERIFIED] There are 26 `<table>` elements, each with a `<caption>`; tables have no ids, so the inventory keys them by caption text.

**Reading-order side effect to decide (not a test failure):** after the move Figure 8 (in `#economics`) appears before Figures 4–7 (appendices), and figure 1 and 2–3 precede it. Tests only require fig-d ascending order, which still holds. Do **not** renumber in Phase 5 (renumbering changes v1 figure numbers, prose such as "Steps in Figure 4", and the inventory key); note it for Phase 8, which adds a new diagram and renumbers anyway. [ASSUMED: acceptable to author; listed in Open Questions]

### Visible ordinal cross-references that become wrong after renumbering

Link hrefs stay correct; the **link text** quotes v1 numbers. These are reader-visible and must be updated in a separate text-only commit right after the move (tests pin only three of them):

| Line (index.html) | Text today | Target now lives in | Suggested text |
|---|---|---|---|
| 798 | "section 01" (to `#s01`) | `#opportunity` (display 01) | unchanged (still 01) but safer: "What 2x means" |
| 1318, 1321, 1379 | "section 7" (to `#s07`) | Appendix C | "Appendix C" |
| 1329 | "section 6" (to `#s06`) | Appendix B | "Appendix B" |
| 1342, 2345 | "section 11" (to `#s11`) | `#economics` (display 05) | "section 05" or "the economics section" |
| 1372 | "section 3" and "section 5" | `#supply-chain` (04), Appendix A | "section 04", "Appendix A" |
| 1385 | "section 1", "section 10" | 01, 06 | "section 01", "section 06" |
| 1392 | "section 5" | Appendix A | "Appendix A" |
| 1152–1208 (compare matrix) | "Section three/four/five/six/seven/eight" (9 cells) | s03→04, s04→03, s05→A, s06→B, s07→C, s08→D | "Section 04", "Section 03", "Appendix A"… |
| `data.js:971,973` and register rows `index.html:2316,2323` | "section 13", "section 14" in `asm-adoption-design`, `asm-risk-likelihood` basis | `#roadmap` (08), `#risks` (09) | "section 08", "section 09"; **edit `data.js` and the HTML register row together** (page.test compares basis text) |
| `page.test.js:1307,1341,1347` | pin "section 01", "section 11" | — | Update the pinned strings in the same commit as the text |

Directional words ("below", "later", "above") were scanned; every hit is within-section or about the register and stays valid. [VERIFIED: grep]

## Findings: share links (STRUCT-03)

`state.js` contract [VERIFIED: read]: `HASH_PREFIX = '#s11?'`; `parseHash(hash, ctx)` returns `{values, notices, restored}`; non-`#s11?` hashes (including `#s11`, `#s10?…`) give defaults and `restored:false`; `serialiseHash` writes only non-default values in `FIELDS` order, then `route`, then `scenario`; it never writes a default, so **`scenario=redeploy` is never produced by the app**, yet it is accepted on parse (it is in the allow-list `SCENARIOS`) and is a legitimate recorded link. The live share URL is `location.href.split('#')[0] + hash`, i.e. `https://lyonsv.github.io/cmo-2x-teardown/#s11?…`. [VERIFIED: ui.js:230; remote is `lyonsv/cmo-2x-teardown`]

Defaults (from `defaultValues(modelContext())`): campaigns 40, concepts 25, markets 5, marketers 120, reviewers 12, minutes 12, vcost 0.8, mconcept 1200, yield 0.95, rework 0.15, auto1 0.2, auto2 0.6, route `both`, scenario `redeploy`.

Real strings, run through `parseHash` on 2026-10-25 (diff against defaults shown):

| Recorded hash | Restored values that differ from default | notices |
|---|---|---|
| `#s11?scenario=redeploy` | none (equals default) | none |
| `#s11?scenario=hold` | scenario `hold` | none |
| `#s11?scenario=reduce&route=campaigns` | scenario `reduce`, route `campaigns` | none |
| `#s11?markets=6&auto2=70` | markets 6, auto2 0.7 | none |
| `#s11?reviewers=4` | reviewers 4 | none |
| `#s11?vcost=20&mconcept=10` | vcost 20, mconcept 10 | none |
| `#s11?campaigns=50&concepts=30&markets=8&marketers=150&reviewers=14&minutes=10&vcost=0.6&mconcept=1500&yield=90&rework=10&auto1=25&auto2=65&route=markets&scenario=hold` | all 12 numeric fields, route `markets`, scenario `hold` (yield 0.9, rework 0.1, auto1 0.25, auto2 0.65) | none; re-serialises byte-identical |
| `#s11?markets=abc` | none | `["Markets per campaign"]` (default kept) |
| `#s11?route=__proto__` | none | `["How you get to 2x"]` |

Fixture shape recommendation (`test/fixtures/v1-share-links.json`): `[{ "hash": "...", "expect": { "markets": 6, "auto2": 0.7 }, "notices": [] }, …]` where `expect` lists only fields that differ from defaults; the test builds `{...defaults, ...expect}` and `assert.deepEqual(parseHash(hash, ctx).values, …)`, plus `restored === true`. Add a second assertion that `serialiseHash(values)` re-produces the hash for every link except `scenario=redeploy` (documented as accept-only). Keep fixtures independent of `data.js` defaults: write explicit expected numbers so a future default change fails loudly rather than silently re-recording. [ASSUMED: three legacy `route=` links are valid v1.0 because `route` shipped in Phase 03.1 before the v1.0 tag; links with no `route` also exist.] Also pin in the same test that the page still contains `id="s11"` and `id="s11-h"` (ui.js depends on both).

Browser behaviour: a `#s11?markets=6` URL matches no element id, so the browser does not scroll; `ui.js restore()` does the scroll and focus (`$('s11').scrollIntoView`, `s11-h` focus). The `smoke.mjs` hash cases (`a`–`i` at lines 39–297) are the end-to-end proof and need no change except `s11Of`.

## Findings: registers and evidence display (EVID-02)

Both registers are **static HTML**, in `#s15`: the source register `<table>` (caption "Source register", header `ID, Claim, Publisher, Publisher type, Date accessed, Grade, Flag, URL`; 45 rows `src-*`) and the assumptions register `<div class="table-scroll" id="assumptions-register">` (header `ID, Assumption, Value, Grade, Basis`; 62 rows `asm-*`). Nothing is generated; `page.test.js` and crosscheck compare them to `data.js`. [VERIFIED]

Adding the column (immediately after Grade, UI-SPEC):
- Source rows: cells become `ID(th) | Claim | Publisher | Publisher type | Date accessed | Grade | Evidence | Flag | URL`. Pinned positions to update: `page.test.js:187-189` header deepEqual (8 -> 9 columns), `:214` `tds[4]` stays Grade, **`:215` `tds[5]` Flag becomes `tds[6]`**, add `tds[5]` Evidence assertion `<span class="ev">${src.evidence}</span>`. `crosscheck.mjs:120` reads `tds[2]` (Publisher type): unaffected. `crosscheck.test.js:61` mutation regex reads `<td>company</td>` after Publisher: unaffected.
- Assumption rows: cells `Label | Value | Grade | Evidence | Basis`. `page.test.js:224-228` use `includes` (unaffected). **`:238` lever test compares `cells[1]` (Value) with `cells[3]` (Basis): Basis becomes `cells[4]`.**
- `.ev` markup: `<td><span class="ev">hypothesis</span></td>`; for observed sources the existing Flag column already carries `vendor-claimed`/`company-reported` (UI-SPEC says the flag "follows the label"; because Flag is its own column in the source register, keep it there rather than moving it into the Evidence cell, and note this reading in the plan).
- CSS: `.register [aria-label="Source register table"] table { min-width: 1040px }` (style.css:88) -> 1160px (UI-SPEC +120). The print override at `:259` already resets it; `style.test.js:309` pins the print rule text, not the width.
- Chip rules: the Evidence cell is plain text, so `page.test.js` "every chip outside the legend and registers is a link" and the density collector are unaffected. The numeric gate strips register rows wholesale.
- Crosscheck addition: for every `src-*` and `asm-*` row, the Evidence cell text equals `data.js` `evidence` (crosscheck already extracts `tds` for publisher type; reuse that).
- The economics-table half of EVID-02 ("every figure in the economics tables") is **not** delivered by CONTEXT's Phase 5 scope (assumptions table and register only; the s11 results table and scenario tables are rebuilt in Phase 9). Flag for the verifier: EVID-02 is partially satisfied in Phase 5 by design and completed in Phase 9.

Legend (EVID-03): `.legend` holds a single `<dl>` of grades. Constraints: `page.test.js:327` slices the legend to the first `</div>` and requires exactly one of each grade chip and the three definitions plus the flag sentence; `:153` strips only up to the **first** `</dl>` when checking for unlinked chips; the numeric gate scans `regionHtml('<div class="legend">', '</dl>')`, i.e. only the first `dl`. So the new class definitions (second `dl`, no chips) and the closing paragraph sit outside the numeric gate. Still **write "twelve-week"** or keep the digits out of the paragraph, because "12-week" would fail the gate if someone later widens the region (and "12" is not in `ALLOWED_NUMERIC_TOKENS`). Use `<span class="ev">` for the `dt` words (UI-SPEC).

## Findings: evidence classification (EVID-01)

Implementation recommendation: add `export const EVIDENCE = ['observed','benchmark','illustrative','hypothesis']` and an `ALLOWED_PAIRS` map to `data.js` (the test imports it). Put literal `evidence` on each of the 45 `sources` and 62 `assumptions`; compute `claims[*].evidence` in a single end-of-file post-pass (rule below), so inheritance is enforced rather than hand-typed.

Rule for claims (prototyped on 2026-10-25; 0 violations of the allowed pairs):
1. `ref` starts with `src-`: claim.evidence = that source's evidence.
2. `ref` starts with `asm-`: claim.evidence = that assumption's evidence, **except** claims on the 2x side (id ends `-scaled`, `derived` path starts `scenario.`, `calc` path contains `scaled`, `change`, `scenario` or `sensitivity`, or id starts `calc-scen`/`calc-sens`), which are `hypothesis`. Rationale: CONTEXT says derived claims inherit the weakest class of their inputs, and a 2x outcome rests on hypothesis inputs even when its `ref` row is an illustrative descriptor (for example `cm-scaled` refs `asm-markets`).
3. Weakest-first order for any multi-input case: hypothesis < illustrative < observed < benchmark.

Resulting counts (prototype): **Sources** 45 = 12 benchmark/Benchmark, 7 benchmark/Modelled, 26 observed/Modelled. **Assumptions** 62 = 32 illustrative/Modelled, 23 hypothesis/Modelled, 6 hypothesis/Speculative, 1 illustrative/Speculative. **Claims** 214 = 9 benchmark/Benchmark, 8 benchmark/Modelled, 15 observed/Modelled, 87 illustrative/Modelled, 91 hypothesis/Modelled, 4 illustrative/Speculative.

### Sources (45)

| Evidence | Grade | Flag | Source ids | Notes |
|---|---|---|---|---|
| benchmark | Benchmark | none | gartner-2025-cmo-spend, gartner-2026-cmo-spend, nyu-emory-ai-ads-2025 | clear |
| benchmark | Benchmark | none | usco-copyright-ai-part2, cornell-17usc504, cornell-17usc412, parasuraman-manzey-2010, moffatt-air-canada-2024, eu-ai-omnibus-2026-1744, eu-code-of-practice-transparency, asa-ai-disclosure-2025, ftc-fake-reviews-rule-2024 | **AMBIGUOUS A1**: statutes, regulator texts, a tribunal decision and a review article are not "survey, statistic or study" |
| benchmark | Modelled | none | laubli-2019, aggarwal-geo-2024 | academic studies; clear |
| benchmark | Modelled | none | haynes-2026, seoworks-2026, indig-2026 | **AMBIGUOUS A2**: small sell-side samples reported by the author's own sites; `benchmark` fits "study", `observed` would require a flag these rows do not carry; keep weakness in grade Modelled and `bias` text |
| benchmark | Modelled | none | mmm-geox, eu-ai-act-art50 | **AMBIGUOUS A3**: mmm-geox describes a method and reports no outcome; eu-act is an unofficial reproduction of a primary text |
| observed | Modelled | vendor-claimed | gradial-* (10), airops-* (5), profound-* (3) (18 total), translation-vendor-case, experimentation-vendor-playbook | **AMBIGUOUS A4**: most gradial/airops/profound rows are product docs, pricing and home pages (capability statements, not measured results); only `*-customers`, `airops-webflow`, `airops-chime` carry results. CONTEXT's mechanical default says vendor-claimed -> observed, so use it and keep the flag |
| observed | Modelled | company-reported | intercom-2x-teardown, kohavi-2013, incident-levis-2023 | clear |
| observed | Modelled | none | incident-mcdonalds-nl-2025, incident-cocacola-2025, incident-guess-vogue-2025 | **AMBIGUOUS A5**: press reports of events, independent, no flag; "measured results" is a stretch |

If the author prefers, the nine A1 rows are the only ones that would need a wording change to the `benchmark` definition shown to readers ("a published reference: survey, statistic, study or primary text"). Recommendation: keep `benchmark` for A1 and widen the definition wording in the key; do not invent a fifth class.

### Assumptions (62), with the mechanical rule that decides each

| Evidence | Rule | Ids |
|---|---|---|
| hypothesis | baseline != 2x value | asm-tier-mix, asm-auto-approval, asm-variant-cost, asm-tooling, asm-ai-share-variant, asm-ai-share-tooling, asm-build-days (7) |
| hypothesis | 2x ranges / programme effect | asm-tier-range-t0..t3 (4), asm-reallocation, asm-flat-marketing-headcount (Speculative) |
| hypothesis | design recommendation to validate in pilot (**AMBIGUOUS A6**) | asm-review-agent-design, asm-harness-design, asm-telemetry-metrics, asm-fatigue-controls (Speculative), asm-adoption-design (Speculative), asm-risk-likelihood (Speculative), asm-backlog0-days (target derived from the 2x model) |
| hypothesis | programme-only gate parameter (**AMBIGUOUS A7**) | asm-sampling-rate, asm-escalation-rate (apply only to auto-approved variants, which exist mainly at 2x) |
| hypothesis | per-lever evidence rows describe lever effects (**AMBIGUOUS A8**) | asm-lever-01..06-evidence (01–04 Modelled, 05–06 Speculative) |
| hypothesis | programme choice (**AMBIGUOUS A9**) | asm-growth-route |
| illustrative | organisation descriptor | asm-revenue, asm-budget-share, asm-marketing-budget, asm-marketing-fte, asm-campaigns, asm-concepts-per-campaign, asm-markets, asm-formats-per-market, asm-reviewer-fte, asm-tests-per-quarter, asm-loaded-fte-cost, asm-change-mgmt |
| illustrative | same value at baseline and 2x; company parameter | asm-approval-yield (**A10**: arguably a programme effect), asm-review-minutes, asm-rework-rate, asm-reviewer-hours, asm-reviewer-rate, asm-master-concept-cost, asm-rights-per-concept, asm-storage-per-variant, asm-review-service-days, asm-target-utilisation |
| illustrative | matrix sketch | asm-matrix-concepts, asm-matrix-sizes, -channels, -locales, -audiences, -tests, -feeds, asm-matrix-independence |
| illustrative | invented rate (Speculative) | asm-incident-rate |
| illustrative | generic contract/route summaries (**AMBIGUOUS A11**; conservative choice, "benchmark" would overclaim) | asm-imagery-routes, asm-imagery-indemnity |

Counts match the prototype: 29 hypothesis (23 Modelled + 6 Speculative) and 33 illustrative (32 Modelled + 1 Speculative) = 62.

### Claims (214)
- 9 `src-` literals with Benchmark grade (gartner x3, nyu x2, stat-* x4): `benchmark`.
- 9 vendor-claimed literals (gradial, airops, translation, winrate-vendor x2): `observed`; 4 company-reported (winrate-paper, winrate-second-hand, ref-auto-approved-share, ref-bot-approval-rate): `observed`; 2 derived company-reported (`cap-2x-ref-low-util`, `cap-2x-ref-high-util`): by rule 2 they `ref` `src-intercom-2x-teardown`, so `observed` **even though they are 2x model outputs fed by an observed input** (**AMBIGUOUS A12**: weakest-input rule says these should be `hypothesis` because they run the model at 2x with company-reported inputs; apply the `derived`-on-2x override to `src-` refs too if the planner agrees, and re-check the pair test: hypothesis/Modelled is allowed).
- 8 `src-` Modelled literals (mt-speed, aeo-*): `benchmark` (follow A2).
- 48 derived `asm-` claims, 130 literal `asm-` claims (matrix, tier, calc-*, tests-winners): by the rule above; 4 `ops-*` claims are `illustrative`/Speculative.

### Test for allowed pairs (EVID-01)

```js
// data.test.js (or evidence.test.js)
const ALLOWED = { benchmark: ['Benchmark','Modelled'], observed: ['Benchmark','Modelled'],
                  illustrative: ['Modelled','Speculative'], hypothesis: ['Modelled','Speculative'] };
const INDEPENDENT = new Set(['government','academic','press','tracker','secondary','law-firm commentary']);
for (const e of [...Object.values(assumptions), ...Object.values(claims)]) {
  assert.ok(EVIDENCE.includes(e.evidence), `${e.id}: evidence`);
  assert.ok(ALLOWED[e.evidence].includes(e.grade), `${e.id}: ${e.evidence}/${e.grade}`);
}
for (const [k, s] of Object.entries(sources)) {
  assert.ok(ALLOWED[s.evidence].includes(s.grade), k);
  if (s.evidence === 'observed' && !INDEPENDENT.has(s.publisherType)) assert.ok(s.flag, `${k}: observed needs a flag`);
}
```
Note `kohavi-2013` is typed `academic` but carries `company-reported`; both pass. The prior test at `data.test.js:19-22` ("Benchmark never flagged") stays. Also assert: no assumption is `observed` (nothing is observed for the subject organisation; EVID-03) and every claim's evidence equals the weakest of its ref and 2x rule (so a hand edit fails).

## Findings: guards

**Inventory (STRUCT-02/04).** Generate once from the unmodified page, commit JSON, never regenerate silently. Contents: (a) `ids`: all 213 ids; (b) `dataFig`: sorted unique 274 ids (334 occurrences; also store occurrence count per id so removing one of two uses fails); (c) `figures`: `[{n:1..8, caption prefix, svgTitleId}]`; (d) `tables`: 26 caption texts. Test: every fixture entry is present in the new page or listed in `RETIRED = { id: 'reason' }` (initially `{}`); a stale RETIRED entry (item present) also fails, mirroring `JUSTIFIED_UNREFERENCED` in crosscheck. Add the tag-depth check that each v1 section id (`s01`–`s15`) is still a `section` or `div` whose `<h2|h3 id="sNN-h">` is inside it.

Generator (throwaway, run at Wave 0 against the current commit, output committed; the script itself may live in `scripts/` or be deleted):
```js
const html = readFileSync('site/index.html','utf8');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
const df = {}; for (const m of html.matchAll(/data-fig="([^"]+)"/g)) df[m[1]] = (df[m[1]]||0)+1;
const figures = [...html.matchAll(/<figcaption><b>Figure (\d+)<\/b>/g)].map(m=>Number(m[1]));
const tables = [...html.matchAll(/<caption>([\s\S]*?)<\/caption>/g)].map(m=>strip(m[1]));
```

**Anchor test (STRUCT-05).** Three tests already assert resolution (`page.test.js:166`, `a11y-static.test.js:56`, crosscheck duplicates). Add one canonical test in the new guards file that strips `?…` and `#`, handles ids with no `href` match, also asserts every `V1_IDS` entry resolves and that `href="#"` alone is rejected, and delete or leave the older duplicates (leave: they are cheap). No TOC link may use `?`.

**Jargon test (STRUCT-06).**
```js
const BAN = /\b(agentic marketing operating system|AI transformation|unlock\w*|supercharge\w*|game[- ]changer|revolutionis\w*|revolutioniz\w*|seamless\w*|synergy|synergies|leverage AI|10x your)\b/i;
const body = html.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<tr id="(?:src|asm)-[^"]+">[\s\S]*?<\/tr>/g, '');
assert.doesNotMatch(strip(body), BAN);
```
Baseline: **zero hits** on the current page (grep case-insensitive for all ten phrases and `leverage`); register rows stripped per CONTEXT (source and assumption titles/bases excluded). Add a mutation case (insert "seamless" into a copy and assert the regex fires) so the guard is proven live. Also run the same regex over the `claims`/`assumptions` `display`/`label` strings? Not required; skip.

**Duplicate ids** are already covered by crosscheck and `diagram.test.js` "every id on the page is unique" (uses `\sid=`).

## Findings: browser gates (`scripts/gates.sh`)

Existing entry points [VERIFIED: read]: `node --test`; `node scripts/crosscheck.mjs`; `node scripts/smoke.mjs [baseUrl]` (starts its own `python3 -m http.server` when no URL); `node scripts/a11y.mjs`; `node scripts/print.mjs`. Failures print `FAIL <name>: <msg>` on stderr and exit 1; the known flake is `FAIL setup: no page target` (thrown by `withPage` in `cdp.mjs:68`, caught by smoke's `fail('setup', …)`). Retry strategy: capture stderr to a temp file under `${TMPDIR:-/tmp}`, and re-run **once** only when it contains `no page target` or `DevToolsActivePort never appeared`; any other failure fails immediately.

```bash
#!/usr/bin/env bash
# Per-phase gate. Local only (not in CI: the CDP "no page target" flake must not block deploy).
set -u
cd "$(dirname "$0")/.."
run() { echo "== $*"; "$@"; }
run node --test || exit 1
run node scripts/crosscheck.mjs || exit 1
retry_once() {            # retry only the known CDP startup flake
  local err; err=$(mktemp)
  if "$@" 2> >(tee "$err" >&2); then rm -f "$err"; return 0; fi
  if grep -qE 'no page target|DevToolsActivePort never appeared' "$err"; then
    echo "-- known CDP flake, retrying once: $*"; rm -f "$err"; "$@"
  else rm -f "$err"; return 1; fi
}
echo "== smoke";  retry_once node scripts/smoke.mjs  || exit 1
echo "== a11y";   retry_once node scripts/a11y.mjs   || exit 1
echo "== print";  retry_once node scripts/print.mjs  || exit 1
echo "ALL GATES GREEN"
```
Keep the executable bit (`chmod +x`, commit with `git update-index --chmod=+x` if needed). Document in README under "Test" with the exact command `scripts/gates.sh` and the statement that CI runs only `node --test`. The retry is applied to a11y and print as well (they share `withPage`); CONTEXT names it for smoke, so say so in the plan and keep a11y/print retry as a harmless superset. [ASSUMED: a11y/print also use `withPage` and so can raise the same error; a11y imports `withPage, startServer` and print uses the same harness per the script headers.]

## Common Pitfalls

### Pitfall 1: Slicing helpers silently truncate hosted sections
**What goes wrong:** `html.indexOf('</section>')` after `<section id="s11"` returns the end of the first nested element, or `-1` if `s11` is a `div`; tests either throw or assert on a fragment.
**How to avoid:** introduce `test/helpers/html.js` in Wave 0 and convert every raw slice (`calc-page.test.js:11`, `compare.test.js:8`, `legal.test.js:20`, `figure.test.js:7`, `smoke.mjs:15`, `diagram.test.js:33`) while the page is still v1, so these edits are green on the old page.
**Warning signs:** "missing section s11", assertions on short strings.

### Pitfall 2: Framing stub copy breaks existing content tests
**What goes wrong:** the UI-SPEC example for `#autonomy` names "Intercom's engineering programme"; `page.test.js:422` requires exactly one `Intercom` outside s12/s15 (in s06). The "Detail to follow" pill uses `.later`, and `page.test.js:366` forbids `class="later"` anywhere. Stub text with a number fails the numeric gate; "10,000-asset" is allowed, "12-week" is not.
**How to avoid:** reword the autonomy stub to "a named engineering organisation's programme" (Phase 7 will rewrite the Intercom test); change the `.later` test to "only inside the four stub sections"; no digits in stubs.

### Pitfall 3: Demoted heading ids leak into block-listing tests
**What goes wrong:** `page.test.js:1256` collects `<h3 id="…">` in s09 and `:1444` collects `<h3 id="s14-…">`; a wrapper `<h3 id="s09-h">` / `<h3 id="s14-h">` appears first and fails the deepEqual/slice. Same for `riskBlock`'s `next` search.
**How to avoid:** `sectionHtml()` drops the wrapper heading (Pattern 2), or filter ids ending `-h`.

### Pitfall 4: The numeric gate and prose budgets stop covering new text
**What goes wrong:** the gate iterates `SECTION_IDS` (v1 ids); new h2 titles, the divider and stub paragraphs live in the new section shells, outside the hosted divs, so they are never scanned. Conversely the `<h2 id="s\d\d-h">` strip no longer matches the new `<h2 id="opportunity-h">`.
**How to avoid:** iterate the new section ids (shell plus hosted content), widen the strip to `<h[23] id="[a-z0-9-]+-h">`, keep `PROSE_BUDGET` keyed by v1 id.

### Pitfall 5: Focus ring lost on the calculator heading
**What goes wrong:** `ui.js` focuses `#s11-h` after a share link restores; the ring styles only target `h2`. After demotion to h3 the focus is invisible (WCAG 2.4.7).
**How to avoid:** add `h3:focus, h3:focus-visible` to the existing focus rule (and a `style.test.js` assertion); the a11y gate checks focus visibility elsewhere (`focusChecks`).

### Pitfall 6: Source-register column inserts shift pinned cell indexes
See "Findings: registers": `page.test.js:187-189, 215, 238`. Update in the same commit as the HTML or tests go red.

### Pitfall 7: Ordinal prose references go stale
See the table above. Not caught by tests except three pins; found by grep. Add a guard: no visible text matches `/\b[Ss]ection (\d+|[a-z]+)\b</a>` pointing at a v1 id unless it equals the new display number (simple mapping test), or simply assert the stale strings are gone.

### Pitfall 8: Appendix h2 plus identical hosted h3
For appendices A–F the v1 title and the new h2 are the same words ("The review agent" h2, then h3 "The review agent"). Cosmetic duplication, locked by CONTEXT/UI-SPEC (Option A below). Recommended handling: keep it, give each appendix the "Supports:" pointer; Phase 8 collapses it.

### Pitfall 9: Pushing deploys
`git push` on main triggers `pages.yml`. Phase 5–9 commits stay local. Add "no push" to the plan's verification checklist and run `git log origin/main..HEAD --oneline` at phase close.

### Pitfall 10: Table scroll width and print page count
Adding Evidence widens the source table to 1160px (screen) and adds ~45 short cells; print resets `min-width`. Re-run print (ceiling 100 pages) and a11y at 320px after Wave 2.

## Code Examples

### Mechanical move recipe (throwaway script, run once, review the diff)
```text
Input: current index.html, line ranges of the 15 <section …>…</section> blocks (from
       grep -n '<section\|</section>' — s01 62-124, s02 125-238, s03 239-316, s04 317-343,
       s05 344-427, s06 428-482, s07 483-557, s08 558-629, s09 630-741, s10 742-800,
       s11 801-1134, s12 1135-1300, s13 1301-1343, s14 1344-1420, s15 1421-2346).
Output order and wrapping:
  <section id="opportunity">  h2 + [s01 div] [s02 div]  </section>
  <section id="autonomy">     h2 only (stub text lands in Wave 2)       </section>
  <section id="build">        h2 + [s04 div]                            </section>
  <section id="supply-chain"> h2 + [s03 div]                            </section>
  <section id="economics">    h2 + [s11 div]                            </section>
  <section id="outcomes">     h2 + [s10 div]                            </section>
  <section id="expansion">    h2 + [s09 div]                            </section>
  <section id="roadmap">      h2 + [s13 div]                            </section>
  <section id="risks">        h2 + [s14 div]                            </section>
  .appendix-divider (Wave 2)
  <section id="appendix-campaign"> A + [s05 div] …  appendix-review B [s06], appendix-gate C [s07],
  appendix-evals D [s08], compare E [s12], register F [s15]
Per hosted block:
  <section id="sNN" aria-labelledby="sNN-h">  ->  <div id="sNN" class="subsection" aria-labelledby="sNN-h">
  <div class="sec-head"><span class="sec-num">NN</span><h2 id="sNN-h">T</h2></div>  ->  <h3 id="sNN-h">T</h3>
  </section> -> </div>
Everything else byte-identical. Hosted blocks keep their inner h3s untouched.
```
Inner h3s inside demoted blocks (for example the five h3s in s02, `steps-h` h3s in s03, s05, s06, s08, s11) stay h3, so a demoted h3 is followed by sibling h3s; heading order is valid (no skip), though the hierarchy is flat. Do not demote inner headings to h4: `compare.test.js:132` and several `<h3>` literal pins would all change, and the UI-SPEC does not ask for it. [VERIFIED: a11y rules only forbid skipped levels]

### Evidence post-pass sketch (data.js)
```js
const RANK = { hypothesis: 0, illustrative: 1, observed: 2, benchmark: 3 };
const weakest = (...xs) => xs.reduce((a, b) => (RANK[a] <= RANK[b] ? a : b));
const twoXSide = (c) => /-scaled$/.test(c.id) || /^scenario\./.test(c.derived ?? '') ||
  /scaled|change|scenario|sensitivity/.test(c.calc ?? '') || /^calc-(scen|sens)/.test(c.id);
for (const c of Object.values(claims)) {
  const base = c.ref.startsWith('src-') ? sources[c.ref.slice(4)].evidence : assumptions[c.ref].evidence;
  c.evidence = twoXSide(c) ? weakest(base, 'hypothesis') : base;
}
```
Place after the last `claims[...] =` assignment (the file builds claims across ~600 lines; the final block is the calc-* loop ending the file) and after all `assumptions[...]` assignments. The `a()` helper takes no `evidence` parameter today (`a(id,label,kind,key,value,unit,display,basis)`), so assign evidence either through a `EVIDENCE_OF = { 'asm-…': 'hypothesis', … }` map applied in a post-pass (recommended: one reviewable table, default `illustrative`, fail-loud test that every assumption id appears in the map or in the default set) or by extending the helper signatures (touches ~60 call sites). Sources: add an `evidence` field per literal entry, or the same map approach keyed by source key with a rule (`flag` set -> observed; `incident-*` -> observed; else benchmark).

## State of the Art

| Old approach | Current approach | Impact |
|--------------|------------------|--------|
| PITFALLS.md suggested empty legacy `<span id="s07">` anchors | CONTEXT locks "id stays on the element holding the content" (div wrappers) | Old links land on real content; tests keep slicing by id |
| Browser gates only manual | `scripts/gates.sh` per-phase, not CI | CI deploy cannot be blocked by the CDP flake |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Statutes, regulator texts, tribunal decision and review article are classed `benchmark` | Evidence / Sources | Reader-visible label for 9 sources; author may want a wider definition or `observed` |
| A2 | haynes/seoworks/indig are `benchmark` (study), not `observed` | Evidence / Sources | If `observed`, they need a flag the data does not carry |
| A3 | mmm-geox and eu-ai-act-art50 are `benchmark` | Evidence / Sources | Label only |
| A4 | All 18 gradial/airops/profound rows are `observed` + vendor-claimed even where they are product docs | Evidence / Sources | Over-states what docs evidence; alternative is `benchmark`-less class which does not exist |
| A5 | Press incident reports are `observed` | Evidence / Sources | Label only |
| A6–A11 | Assumption classes for design rows, gate parameters, lever rows, growth route, approval yield, imagery rows | Evidence / Assumptions | Label only; test pairs still pass either way |
| A12 | The two 2x reference-utilisation claims (`cap-2x-ref-*`) should be `hypothesis`, not `observed` | Evidence / Claims | Mislabels a model output as observed |
| A13 | Figures are not renumbered in Phase 5 (Figure 8 appears before Figures 4–7) | Findings | Reader sees non-sequential figure numbers until Phase 8 |
| A14 | v1 recorded links include ones with and without `route=` | Share links | Fixture coverage only |
| A15 | No `<div`/`<section` inside SVG text or comments in `index.html` (helper depth count) | Pattern 2 | Helper throws "unbalanced"; Wave 0 asserts this on all 15 ids |
| A16 | a11y.mjs and print.mjs can hit the same "no page target" flake | gates.sh | Retry wrapper is a harmless superset |

## Open Questions

1. **Hosted-heading duplication for 1:1 hosts (appendices and body 06–09).**
   - Known: CONTEXT/UI-SPEC lock `<div id="sNN">` + h3 inside the new h2 section; appendix titles equal the v1 titles.
   - Unclear: whether the author accepts "The review agent" as h2 then h3.
   - Recommendation: accept (locked); alternative that also satisfies the id rule is to give body 06–09 new h2 titles (UI-SPEC already does: "What it means for CMO outcomes" over "The outcome case") and leave appendices duplicated until Phase 8.
2. **Where do ordinal link labels get fixed.** Recommendation: a separate text-only commit immediately after the move (Wave 1b), with its three pinned test strings.
3. **Figure renumbering** (A13). Recommendation: defer to Phase 8.
4. **A1–A12 classifications**: planner should present A1, A4 and A12 to the author at the first checkpoint; others are low stakes.
5. **UI-SPEC says "ten body sections" and also "nine ids"**: render nine body rows plus the Appendices group, per the UI-SPEC's own note. The TOC test must expect 9 + 6.

## Security Domain

`security_enforcement` is not disabled in `.planning/config.json`, so included briefly. The phase adds no network, storage or dynamic code.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes (hash parsing) | `parseHash` allow-lists `route`/`scenario`, strict numeric coercion; keep the prototype-pollution tests (`state.test.js`) green; fixtures must not weaken them |
| V14 Configuration | yes | CSP meta (`default-src 'none'; script-src 'self'; style-src 'self'`) and "no inline style" tests; new classes only, no `style=`, no new scripts |
| V2/V3/V4/V6 | no | no auth, sessions or crypto |

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Crafted `#s11?…` link (prototype pollution, injection) | Tampering | Existing allow-list and `URLSearchParams` handling; fixture adds `route=__proto__` and `markets=abc` cases |
| Inline style or script slipping into new markup | Tampering | `page.test.js` "static page guards" (no `style=`, one module script, no `on*=`) |

## Validation Architecture

Skipped: `workflow.nyquist_validation` is `false` in `.planning/config.json`. (Existing infrastructure for reference: `node --test` 378 tests, ~1 s; gates via `scripts/gates.sh`.)

## Proposed Plan Split (every commit green)

Rule for every commit: `node --test` and `node scripts/crosscheck.mjs` pass before committing. Browser gates (`scripts/gates.sh`) run at the end of each wave and at phase close. No push.

**Wave 0 (page unchanged; all green; independent plans can run in parallel)**
- **05-01 Test scaffolding and guards**
  1. `test/helpers/html.js` (`elementById`, `sectionHtml`, `strip`, `decode`) with a self-test asserting depth balances for all 15 sections on the v1 page.
  2. Convert raw slices to the helper in `calc-page`, `compare`, `legal`, `figure`, `diagram` tests and `smoke.mjs s11Of`; make `page.test.js` import the helper (keep local function names). Page unchanged, tests green.
  3. Generate and commit `test/fixtures/v1-inventory.json`; add `test/inventory.test.js` with `RETIRED = {}`.
  4. `test/fixtures/v1-share-links.json` + `test/share-links.test.js` (table above).
  5. Canonical anchor test (strip `?`, V1_IDS resolve) and jargon test with mutation case.
  6. `scripts/gates.sh` + README "Per-phase gate" section.
- **05-02 Evidence schema in data.js (no HTML)**: `EVIDENCE`, `ALLOWED_PAIRS`, per-source and per-assumption `evidence`, claims post-pass, pair/inheritance tests, "nothing observed for subject org" test. Touches only `data.js` and tests, so it can run beside 05-01.

**Wave 1 (single plan, strictly sequential commits)**
- **05-03 Restructure**
  1. *Mechanical move commit*: run the move recipe; new h2 shells with titles only; TOC rewritten to 9 + group + 6 (labels from UI-SPEC); `.subsection` and `h3:focus` CSS; structure tests updated (`TITLES`/`SECTION_IDS`, TOC test, anchored-sections test, numeric gate iteration, diagram regex, a11y exceptions untouched). No copy edits in hosted blocks. `grep`-verify with the inventory test that all 213 ids and 334 data-fig occurrences are unchanged and a `git diff --color-moved` review.
  2. *Text-only follow-up commit*: ordinal link labels, `data.js:971,973` plus the two register rows, the three pinned test strings.
  3. Wave-end gates: `scripts/gates.sh`.

**Wave 2 (after Wave 1; two plans touching different regions of index.html, run sequentially to avoid conflicts)**
- **05-04 Framing stubs and appendix chrome**: four stubs with `.later` pill and the UI-SPEC copy (autonomy reworded, no digits, no vendor names), `.appendix-divider`, "Supports:" pointers, `.toc-group`, additive CSS and print rules, `.later` test rewrite, jargon/numeric tests over new text.
- **05-05 Evidence display and grade key**: Evidence column in both registers (HTML + tests + crosscheck cell check + min-width), `.ev` CSS, legend class definitions and the pilot sentence, test updates at the pinned lines, page-count and a11y/print re-run. Phase-close: full `scripts/gates.sh`, `git log origin/main..HEAD`, no push.

Parallelism note: 05-01 and 05-02 are independent (Wave 0). 05-03 depends on 05-01 (helper, fixtures) and should follow 05-02 only for merge hygiene (no file overlap, so it is not a hard dependency). 05-04 and 05-05 both edit `index.html` and `style.css`, so they are Wave 2 sequential.

## Project Constraints (from CLAUDE.md)

- Static HTML/CSS/JS on GitHub Pages; no runtime dependencies beyond pinned CDN libraries (none are used; none to be added).
- Honesty: every number is graded with visible assumptions; evidence classes extend that rule, and nothing may be labelled `observed` for the subject organisation.
- Neutrality: vendor names only in the comparison section (`#compare`, v1 s12) and register; the stubs and body text must use category names. `VENDOR_RE` stays enforced.
- Self-contained: no web fonts, no CDN scripts, no `localStorage`/cookies; `URLSearchParams` hash is the only state.
- Tests with `node:test`; no Jest/Vitest/Playwright; no new dependencies.
- Edit only through a GSD workflow (this research feeds `/gsd-plan-phase`; execution goes through `/gsd-execute-phase`).
- CSP forbids inline script and inline `style=`.

## Sources

### Primary (HIGH confidence): repository files read or executed on 2026-10-25
- `/Users/vincent.lyons/git/build-and-review/site/index.html` (structure, ids, registers, legend, TOC)
- `site/js/data.js`, `site/js/state.js`, `site/js/fields.js`, `site/js/ui.js`, `site/assets/style.css`
- `test/page.test.js`, `diagram.test.js`, `calc-page.test.js`, `compare.test.js`, `legal.test.js`, `figure.test.js`, `a11y-static.test.js`, `crosscheck.test.js`, `state.test.js`, `data.test.js`, `style.test.js`
- `scripts/crosscheck.mjs`, `smoke.mjs`, `a11y.mjs`, `print.mjs`, `cdp.mjs`
- `.github/workflows/pages.yml`, `package.json`, `README.md`, `.planning/config.json`, `ROADMAP.md`, `REQUIREMENTS.md`, `STATE.md`, `research/PITFALLS.md`, `research/ARCHITECTURE.md`
- Executed: `node --test` (378 pass), `node scripts/crosscheck.mjs` (0 failures), `parseHash`/`serialiseHash` probes, evidence prototype over `data.js`

### Secondary / Tertiary
- None. No web research was needed; no external library is involved.

## Metadata

**Confidence breakdown:**
- Test and structure coupling map: HIGH, from direct reads and greps.
- Share-link contract and strings: HIGH, executed.
- Evidence classification: HIGH for mechanics (prototype, 0 violations), MEDIUM for the flagged ambiguous rows (author judgement).
- gates.sh retry details: MEDIUM (a11y/print flake behaviour assumed same as smoke).

**Research date:** 2026-10-25
**Valid until:** until `site/index.html` or `data.js` changes materially (the line numbers above are as of commit e695c35); re-grep before executing.
