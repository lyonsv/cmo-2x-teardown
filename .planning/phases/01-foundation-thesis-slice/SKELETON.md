# Walking Skeleton — CMO 2x: Marketing Acceleration Teardown

**Phase:** 1
**Generated:** 2026-10-24

## Capability Proven End-to-End

A reader opens https://lyonsv.github.io/cmo-2x-teardown/ and sees the page title, a Benchmark-graded Gartner figure and the modelled 2x headline output per head, each with a grade chip that jumps to its register row. Every number comes from `site/js/data.js`, the headline is reproduced by `site/js/calc.js` under `node --test`, and the page was published by a workflow that ran those tests first (plans 01-01 and 01-02).

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | None. One hand-written `site/index.html`, one `site/assets/style.css`, no `<script>` on the page in Phase 1 | CLAUDE.md and CONTEXT: content is the product; the reference page is hand-written; works with JS off |
| Data layer | `site/js/data.js` ES module: `sources`, `assumptions`, `claims`, `GRADES`, `FLAGS`, `SCENARIO`, `defaultInputs()`, `defaultAssumptions()`, `formatValue()` | CRED-06: one source for prose, figure, tests and (Phase 3) the calculator UI |
| "Read/write" round trip | data.js -> static HTML (`data-fig` spans) and data.js -> `compute()` -> derived claims, both checked by `node:test` | No database; the drift test is the persistence contract |
| Calculator | `site/js/calc.js`, pure ES module, `compute(inputs, assumptions)` returns `{ok:true,...}` or `{ok:false, errors}`; never throws, never NaN/Infinity | CALC-08; Phase 3 adds only UI (`ui.js`, `svg.js`) on top |
| Markup contract | `<span data-fig="ID">DISPLAY</span>` + `<a class="chip c-b|c-m|c-s" href="#src-…|#asm-…">Grade</a>`; register rows `<tr id="src-…|asm-…">` in `#s15`; sections `<section id="sNN" aria-labelledby="sNN-h">` with `.sec-head` | Regex-testable without an HTML parser or dependencies |
| Grades | Benchmark / Modelled / Speculative, plus neutral `.flag` (vendor-claimed / company-reported) that never upgrades a grade | CRED-01, PROJECT.md |
| Tests | `node --test` (Node 22 in CI), `node:assert/strict`; root `package.json` is only `{"name","private","type":"module"}`; test files only in `test/` | No dependencies; discovery runs every `.js` under `test/` |
| Auth | None (static, read-only page) | Out of scope by PROJECT.md |
| Security headers | CSP meta `default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'`; no inline `style=`; Phase 3 adds `script-src 'self'` only | Cheap XSS hardening for a static page |
| Deployment target | GitHub Pages via Actions: `.github/workflows/pages.yml`, job `test` (`node --test`) then job `deploy` (`needs: test`) with checkout@v7, setup-node@v7, configure-pages@v6, upload-pages-artifact@v5 (`path: site/`), deploy-pages@v5; Pages source = GitHub Actions; repo `lyonsv/cmo-2x-teardown` (public) | SHELL-01, SHELL-05; mirrors the reference repo |
| Directory layout | `site/` (published: `index.html`, `assets/style.css`, `js/data.js`, `js/calc.js`, `.nojekyll`), `test/` (`*.test.js`), `.github/workflows/`, `README.md`, `package.json` | Relative paths only; only `site/` is uploaded |

## Stack Touched in Phase 1

- [x] Project scaffold: `package.json` (ESM only), `node --test` runner, README (01-01)
- [x] Routing: anchor routing, 15 section ids `s01`..`s15`, register row ids (01-01, 01-03)
- [x] Data: one real read path (page and calc read data.js) and one real round trip (data.js -> compute() -> derived claims -> HTML, verified by tests) (01-01)
- [x] UI: chip links that land on highlighted register rows; TOC navigation (01-01, 01-03)
- [x] Deployment: test-gated Pages deploy to a public URL (01-02, 01-07)

## Out of Scope (Deferred to Later Slices)

- Any JavaScript on the page (calculator UI, live SVG chart, URL-hash scenarios): Phase 3
- Sections 03-14 content (skeleton scope sentences only in Phase 1): Phases 2-4
- Vendor names anywhere (section 12 only, Phase 3)
- Full source/assumptions register reconciliation, evidence gaps, QA-04 scripted cross-check: Phase 4 (Phase 1 already checks registers against data.js both ways)
- Dark mode: deferred (CONTEXT)
- Build tools, frameworks, CDN libraries, web fonts, `localStorage`
- SHA-pinned actions (major-pinned first-party actions accepted)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: sections 03-08 (factory, supply chain, 10,000-asset campaign, review agent, T0-T3 gate, eval harness) with SVG figures; tier shares and review rates feed back into data.js defaults
- Phase 3: sections 09-12 (other levers, outcome case, interactive calculator on the existing `compute()`, vendor comparison); first page script under `script-src 'self'`
- Phase 4: sections 13-15 complete, register reconciliation and QA-04 cross-check, WCAG/320px/print pass, re-verification, legal flag, production deploy
