# CMO 2x: Marketing Acceleration Teardown

A single static page that sets out what doubling a marketing organisation's output would take. It is a forward-looking, evidence-graded projection, not a retrospective: every number carries a grade and links to the source or assumption behind it.

## Layout

- `site/` is the published folder: `index.html`, `assets/style.css`, `js/data.js`, `js/calc.js` and `.nojekyll`.
- `site/js/data.js` is the single source of numbers, grades, sources and assumptions.
- `site/js/calc.js` holds the pure calculator maths.
- `test/` holds the `node:test` suites that keep the page, the data and the calculator in step.

## Test

Requires Node 22 or later. There are no dependencies to install.

```
node --test
```

Per-phase gate: run `scripts/gates.sh` before closing any phase. It runs the unit tests, the cross-check, and the browser checks (smoke, accessibility and print), and stops at the first failure. It needs Chrome, python3 and poppler (`pdftotext` and `pdfinfo`). If Chrome fails to start, it retries that check once. The CI deploy runs only `node --test`, so a Chrome hiccup can never block a deploy.

## Preview

```
open site/index.html
python3 -m http.server -d site
```

## Deploy

Pushing to `main` runs the tests, then publishes `site/` to GitHub Pages. The deploy job does not run if the tests fail.
