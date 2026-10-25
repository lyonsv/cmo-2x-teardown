# Phase 5: Restructure Scaffold, Evidence Schema & Guards - Context

**Gathered:** 2026-10-25
**Status:** Ready for planning
**Mode:** Smart discuss, recommendations auto-accepted (author away; standing instruction to use best judgement). Source brief: `.planning/v2.0-BRIEF.md`. Settled milestone decisions: `.planning/research/SUMMARY.md` "Decisions Taken" 1–8.

<domain>
## Phase Boundary

Reorder the page around the executive questions (brief s11) and put the guards in place so later phases can rewrite content safely: semantic section ids with every v1 anchor still resolving, a share-link fixture, inventory/anchor/jargon tests, and an `evidence` class on every assumption and claim shown in the assumptions table and register. This phase moves and frames v1 content; it does not write the new v2 body content (thesis, build, supply chain, economics, roadmap) — those are Phases 7–10. New sections are created as short, honest framing stubs that later phases fill.

</domain>

<decisions>
## Implementation Decisions

### Section architecture and ids
- New body order with semantic ids and display numbers 01–10: `#opportunity` (01, What 2x means — hosts v1 s01 claim & measurement and s02 CFO answer for now), `#autonomy` (02, Why autonomy is the lever — Intercom evidence lands here in Phase 7), `#build` (03, What needs to be built — hosts v1 s04 platform material for now), `#supply-chain` (04, The first workflow — hosts v1 s03 factory model for now), `#economics` (05, The economics — hosts v1 s11 calculator), `#outcomes` (06, hosts v1 s10), `#expansion` (07, hosts v1 s09 levers), `#roadmap` (08, hosts v1 s13 adoption and Backlog 0), `#risks` (09, hosts v1 s14), then appendices with letters: `#appendix-campaign` (A, v1 s05), `#appendix-review` (B, v1 s06), `#appendix-gate` (C, v1 s07), `#appendix-evals` (D, v1 s08), `#compare` (E, v1 s12 How this compares), `#register` (F, v1 s15 source register).
- Every v1 id (`s01`–`s15`, every `sNN-h` heading id, every figure/table/asm/src id) stays on the element that holds that v1 content after the move, so old links land on the right content without duplicate ids. Where a v1 section becomes a subsection, its element keeps `id="sNN"` and its heading is demoted to h3 (heading order must stay valid for a11y).
- TOC lists the ten body sections plus an "Appendices" group; display numbers are plain text, not ids.
- New sections that have no v1 content yet (`#autonomy`, plus the new lead of `#build`, `#supply-chain`, `#economics`) get a heading and one honest framing paragraph stating the question the section answers; no new numbers.
- The live page is NOT republished during Phases 5–9: commits stay local on main and are pushed once in Phase 10 after the full gate run, so readers never see a half-reworked page. (Pushing main deploys via pages.yml.)

### Share links and calculator
- `state.js`/`ui.js` must keep reading `#s11?…`; the calculator's container keeps `id="s11"`. A fixture test stores recorded v1 share-link strings (including `scenario=redeploy`, `hold`, `reduce`) and asserts `parseHash` restores the same values. Scenario renaming to A/B/C is Phase 9; this phase only locks the legacy contract.

### Guards (tests)
- Inventory test: snapshot of every v1 `data-fig` id and `<figure>` id/number taken at the start of the phase, committed as a fixture; a test fails if any disappears unless listed in an explicit `RETIRED` list with a reason (initially empty).
- Anchor test: every `href="#…"` in `site/index.html` resolves to an element id (strip `?…` query).
- Jargon ban-list test on body text (case-insensitive): "agentic marketing operating system", "AI transformation", "unlock", "supercharge", "game-changer", "revolutionise/revolutionize", "seamless", "synergy", "leverage AI", "10x your". Register/source titles excluded.
- Existing tests that hard-code section ids (`EXPECTED_FIGURES`, s06 Intercom-once rule, s12 h3 list, etc.) are updated in the same mechanical commit that moves ids, with no content changes in that commit.

### Evidence classes
- Add `EVIDENCE = ['observed', 'benchmark', 'illustrative', 'hypothesis']` and an `evidence` field on every assumption, claim and source in `data.js`. Definitions: observed = measured results reported by a named organisation (e.g. company-reported case data); benchmark = sourced industry survey, statistic or study; illustrative = a modelling input describing the illustrative company; hypothesis = an effect of the programme that needs validation in a pilot.
- Mechanical defaults: assumptions whose baseline and 2x values differ, or that describe a programme effect, are `hypothesis`; organisation descriptors are `illustrative`; Benchmark-grade sourced claims are `benchmark`; vendor-claimed / company-reported case figures are `observed` (with their existing flag). Derived claims inherit the weakest class of their inputs (hypothesis < illustrative < observed < benchmark for display).
- Allowed (evidence, grade) pairs enforced by test: benchmark→{Benchmark, Modelled}; observed→{Benchmark, Modelled} and must carry a flag when it is not independent; illustrative→{Modelled, Speculative}; hypothesis→{Modelled, Speculative}.
- Display: an "Evidence" column in the assumptions table and the source register, rendered as plain text labels (not colour-only). Body grade chips are unchanged.
- Grade key gains a short paragraph defining the four classes and stating plainly that nothing on the page is observed for the subject organisation; the 12-week pilot is what produces observed data.

### Browser gates
- Add `scripts/gates.sh` that runs `node --test`, crosscheck, smoke (one automatic retry for the known "no page target" flake), a11y and print in order, and document it as the per-phase gate. Browser gates are not added to CI this phase (CI deploy must not be blocked by the CDP flake).

### Claude's Discretion
- Exact wording of the framing stubs and TOC labels (plain English, no jargon, matching the brief's executive questions).
- Whether appendices render with a visual divider/label.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site/js/data.js`: `sources`, `assumptions` (via `a()` helper), `claims` (literal and derived), `GRADES`, `FLAGS`; register and assumptions table rendered from it.
- `test/page.test.js` (VENDOR_RE, section rules), `test/diagram.test.js` (`EXPECTED_FIGURES`), `test/crosscheck.test.js`, `scripts/crosscheck.mjs` (duplicate-id check, chip↔register checks).
- `site/js/state.js` `parseHash` for `#s11?…`.

### Established Patterns
- Sections `<section id="sNN" aria-labelledby="sNN-h">` with `.sec-head` + `.sec-num`; chips `<a class="chip c-m" href="#asm-…">`; `data-fig` spans bound to claims.
- CSP forbids inline script/style; no inline `style=`.

### Integration Points
- TOC `<nav class="toc">` at index.html:45; calculator s11; register s15.
- Smoke/a11y/print scripts locate sections by id — update selectors with the move.

</code_context>

<specifics>
## Specific Ideas

- Brief s11 order is the target; appendices hold v1 depth (brief: "Do not achieve clarity by stripping out the substance").

</specifics>

<deferred>
## Deferred Ideas

- Browser gates in CI (future requirement).
- Scenario A/B/C rename (Phase 9).

</deferred>
