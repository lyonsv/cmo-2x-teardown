<!-- GSD:project-start source:PROJECT.md -->
## Project

**CMO 2x — Marketing Acceleration Teardown**

A single, self-contained static HTML page, hosted on GitHub Pages, that shows what an "Intercom 2x" style acceleration would look like for a generic enterprise CMO's organisation. It is modelled on the editorial, evidence-graded teardown at https://lyonsv.github.io/intercom-2x-teardown/, but it is a forward-looking projection, not a retrospective. It focuses on content generation for campaigns with more than 10,000 assets, covers four further areas where a CMO could double output, and argues in every case why the extra output also improves outcomes.

**Core Value:** A CMO and their CFO finish the page convinced, through transparent and graded reasoning plus their own numbers, that a 2x marketing programme is credible, governable, and improves business outcomes rather than just adding volume.

### Constraints

- **Delivery**: static HTML/CSS/JS deployable to GitHub Pages — same hosting model as the reference
- **Honesty**: every number is graded and its assumptions visible — a CMO 2x is a projection, and presenting it as fact would undermine credibility
- **Neutrality**: tool categories only in the operating model; named vendors (Gradial, AirOps, Profound) appear only in the comparison section, and every claim about them is sourced and dated
- **Self-contained**: no runtime dependencies beyond pinned CDN libraries, if any are used
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Verdict
## What the reference page actually is (inspected 2026-10-24)
- One hand-written `index.html`, about 3 MB. No generator meta tag, no `<script>` at all, no external CSS and no web fonts.
- All CSS is in one inline `<style>` block. It uses CSS custom properties (`--paper`, `--ink`, `--verified`, `--inferred`, `--low`), a `.wrap` of 1080px, a grid `.sec-head` with a mono section number, and `.chip` confidence badges.
- Type is a system stack. Serif: Iowan Old Style / Palatino / Charter / Georgia. Mono: ui-monospace / SF Mono / Menlo. Nothing is downloaded.
- There are 36 `<figure>` elements, 7 `<table>`, and 1 `<nav>`. The figures are base64-embedded JPEGs, which is why the file is 3 MB. There are no SVG charts.
- Implication: the new page's look can be copied almost verbatim. The calculator and charts are the only new engineering. Do not copy the base64-image approach for new figures. Use SVG (small, crisp, text selectable) and, if screenshots are needed, separate files in `assets/`.
## Recommended Stack
### Core
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| HTML5, hand-written | n/a | Page content, 14ish numbered sections, tables, chips | Matches the reference. Content is the product. Every extra layer adds nothing for a single page. |
| CSS in `assets/style.css` (or inline) | n/a | Editorial styling | Reuse the reference's tokens. A separate file is fine on Pages. Inline is also fine if you want literally one file. |
| Vanilla ES modules (`<script type="module">`) | n/a | Calculator UI and charts | Native in all current browsers. No build needed. |
| `calc.js` (pure ES module, no DOM) | n/a | Calculator maths: `compute(inputs) -> outputs` | Testable in Node and importable by the browser unchanged. This is the key to testability. |
### Charts
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Hand-written inline SVG, with a ~60 line `svg.js` helper for the live calculator chart | n/a | Baseline vs 2x bars, cost per asset trend, cycle-time waterfall | The page needs 3 to 5 simple charts (bars, a line, a stacked bar). Zero dependency, prints well, matches the editorial style, and is accessible (`<title>`/`<desc>`, text labels). Static charts can be authored directly in the HTML. |
### Testing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `node:test` + `node:assert/strict` (built in) | Node 22 LTS or later (local is v23.7.0) | Unit tests on `calc.js` | No `npm install` and no `package.json` dependencies. Run `node --test`. |
### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GitHub Pages via Actions (`actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`) | check current majors when writing the workflow (v4 era for deploy-pages and upload-pages-artifact, MEDIUM, not verified here) | Publish static files | The workflow can run `node --test` first and gate deploy on passing tests. Uploads the folder as is. |
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Site tooling | Hand-written HTML | Astro 7.4.2 (needs Node >=22.23.4) | Excellent for multi-page content sites, with Markdown, components and islands. For one page it adds a toolchain, `node_modules`, a CI build, and fast-moving major versions (the version moved far in a year), for little gain. Pick Astro only if the page is split into many content files, or becomes several pages. |
| Site tooling | Hand-written HTML | Eleventy 3.1.7 (Node >=18) | The lightest generator, and a legitimate fallback. Its value is templating repeated parts (chips, source register, section header). A single page has few repeats, so it saves little. If the HTML becomes painful to maintain, Eleventy is the first upgrade, and it migrates easily because the HTML already exists. |
| Site tooling | Hand-written HTML | Observable Framework 1.13.4 | Built for data apps and dashboards in Markdown with reactive JS. It is heavy, its visual language is dashboard-like rather than editorial, and it needs a build. It fits a data-notebook deliverable, not this page. |
| Site tooling | Hand-written HTML | Vite 8.3.5 single page (Node ^20.19 or >=22.12) | Gives HMR and bundling, but nothing here needs bundling. It would require a build step and `base` path config for the Pages subpath. Reasonable only if you adopt npm chart libraries and want them bundled. |
| Charts | Inline SVG | Chart.js 4.6.1 | Canvas-based (not selectable or printable as crisply), about 200 KB, default look is generic and needs heavy theming to look editorial. Overkill for 3 to 5 charts. |
| Charts | Inline SVG | Observable Plot 0.6.17 | Nice API and good defaults, and it outputs SVG. But it depends on D3 modules (about 200 KB from a CDN), and its tidy defaults still need restyling. Good fallback if chart count grows past about 6 or you need axes and scales for real data. Pin `https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.17/+esm` with SRI. |
| Charts | Inline SVG | D3 7.9.0 | A toolkit, not a chart library. You write the charts yourself anyway, so use only what you need. If scales are wanted, import `d3-scale` alone rather than the full bundle. |
## Calculator Architecture (testable by design)
- Put every assumption (2x multiplier, review throughput per reviewer, AI cost per asset floor, rework rate) in a named `assumptions` object with its confidence grade. The page's assumptions table and the code then share one source, so the graded claims cannot drift from the maths.
- Test: identity case (multiplier 1 gives baseline = 2x), monotonicity (more locales gives more assets and more cost), a hand-calculated golden case, zero and edge inputs (0 locales, empty field returns a validation error rather than NaN), and cost per asset falls as volume rises under the stated assumptions (this is the CFO claim, so test it).
- Example test:
## Deployment to GitHub Pages
## Supporting Choices
| Concern | Choice | Notes |
|---------|--------|-------|
| Fonts | System stacks as in the reference | No web-font download, no layout shift. Do not add Google Fonts (a privacy concern, and it breaks "self-contained"). |
| Maintainability of many sections | Consistent semantic markup: `<section id="s03">`, `.sec-head`, `<span class="chip chip--modelled">`, `<figure><figcaption>` | Use a fixed snippet for each pattern and grep-check them. Sticky `<nav>` of anchors, with `scroll-margin-top` and `scroll-behavior: smooth` (respect `prefers-reduced-motion`). |
| Confidence grades | CSS chip classes: Benchmark, Modelled, Speculative | Define colours in `:root` as the reference does. Never rely on colour alone, always include the text label. |
| Tables | Plain `<table>` with `<caption>`, wrapped in `overflow-x:auto` | Mobile fit. |
| Print | A small `@media print` block | CFO readers print or save to PDF. |
| Lint (optional) | `npx html-validate` or the W3C validator run once per milestone | Not a standing dependency. |
## What NOT to Use
- A SPA framework (React, Vue, Svelte): one page of mostly static prose gains nothing and the page gets heavier.
- Tailwind or other CSS frameworks: the reference's bespoke editorial CSS is the design.
- Chart.js: see above, canvas and generic look.
- Full `d3` from a CDN for a handful of bars.
- Base64-embedded images for new figures: the reference's 3 MB file is the cautionary example.
- Unpinned CDN URLs (`@latest`) or CDN scripts without SRI. If you do add Plot or d3-scale, pin the exact version and add `integrity` and `crossorigin`.
- `localStorage` or cookies for the calculator state: out of scope, and `URLSearchParams` in the hash is enough if shareable scenarios are wanted (optional and cheap).
- Jest, Vitest 5.0.5 or Playwright for v1: the built-in runner covers pure maths. Add Vitest only if tests need a DOM, and then prefer testing `ui.js` through a tiny DOM-free interface instead.
## Upgrade Path (only if triggered)
## Installation
# No dependencies. Node 22 or later for tests only.
# Local preview (any static server)
## Confidence
| Item | Level | Basis |
|------|-------|-------|
| Reference page construction | HIGH | Fetched and inspected the page source |
| Package versions (astro 7.4.2, eleventy 3.1.7, vite 8.3.5, d3 7.9.0, plot 0.6.17, chart.js 4.6.1, framework 1.13.4, vitest 5.0.5) | HIGH | `npm view` on 2026-10-24 |
| Node engine requirements | HIGH | `npm view <pkg> engines.node` |
| No-framework recommendation | HIGH | Derived from scope and constraints |
| GitHub Actions major versions | MEDIUM | From training knowledge, not verified. Check each action's releases page. |
| `node --test` behaviour | MEDIUM-HIGH | Built into Node 18 and later, stable in 20 and later. Not re-checked against docs here. |
## Sources
- https://lyonsv.github.io/intercom-2x-teardown/ (reference page source)
- npm registry, queried with `npm view` for each package, 2026-10-24
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-actions (not re-fetched, check when writing the workflow)
- https://nodejs.org/api/test.html (not re-fetched)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
