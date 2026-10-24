---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 12
subsystem: publish
tags: [publish, checkpoint, github-pages, w3c, live-smoke]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: verified s09-s12 (03-11)
provides:
  - Phase 3 page live at https://lyonsv.github.io/cmo-2x-teardown/
key-files:
  modified: []
key-decisions:
  - "Single push for Phase 3 (c8c8b04..0e00b48), no force"
requirements-completed: [LEVER-01, LEVER-02, LEVER-03, LEVER-04, LEVER-05, OUTC-01, OUTC-02, CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, CALC-07, COMP-01, COMP-02, COMP-03, COMP-04, COMP-05]
duration: 15min
completed: 2026-10-24
---

# Phase 3 Plan 12: Publish Summary

Phase 3 is live: W3C Nu reported zero errors, one push, the test-then-deploy run succeeded, and the live headless smoke passes, so the calculator runs under the CSP.

Live URL: https://lyonsv.github.io/cmo-2x-teardown/

## Pre-flight (Task 1)

| Command | Result |
|---------|--------|
| `node --test` | 287 tests, 287 pass, 0 fail |
| `node scripts/smoke.mjs` | PASS a-k |
| `grep -c '<script'` | 1 |
| `script-src 'self'` count | 1 |
| inline `on*=` / `style="` | 0 |
| `base64` / `data:image` | 0 |
| root-absolute href/src | 0 |
| localStorage/sessionStorage/cookie/innerHTML in site/js | 0 in every file |
| `site/.nojekyll` | present |
| vendor-name lines in site/index.html | 150 (live page: only inside s12 and s15) |
| branch | main |
| `git status --porcelain -- site test scripts .github` | empty |
| `git log origin/main..HEAD` | 43 commits |
| Vendor access date | 2026-10-24 (same day as 03-09, inside the 7-day window) |

## Push approval

approve-push, given by the orchestrator under the user's standing instruction "keep going and approve everything until done" (user away). It was given only after every automated gate above passed. The user did not review the page personally. Tone and fairness of the copy, and s09/s10 imagery by eye, remain for the user's review.

## W3C Nu (after approval, before push)

0 errors, 0 warnings, 2 info messages. Both are the known upload artefact (the validator has no base URL): "external stylesheet assets/style.css blocked by style-src" and "external script js/ui.js blocked by script-src". Neither is a real violation; both resources are same-origin and load live. No markup fix was needed.

## Push and deploy

- `git push origin main`: c8c8b04..0e00b48, the only push in Phase 3, no force.
- Run id 40115045733: `test success`, `deploy success` (test 7s, deploy 16s). One annotation about the ubuntu-latest label migration, not an error.

## Live checks

| Check | Result |
|-------|--------|
| s09-aeo | 1 |
| Outcome scorecard | 2 |
| Results for your numbers (baseline and 2x) | 1 |
| id="f8-t" | 1 |
| class="matrix" | 1 |
| It is not a shipped product | 1 |
| js/ui.js | 1 |
| ui.js content type | application/javascript; charset=utf-8 |
| Live smoke `node scripts/smoke.mjs <live url>` | PASS a, b, c, d, e, f, g, h, i, j, k |
| HEAD vs origin/main | both 0e00b48 |

## Deviations from Plan

None. The local preview server was not left running. The final docs commit is pushed as a second push, which the user's instruction authorised, so the "only one push" truth covers the page publish (the page was live after the first push).

## Self-Check: PASSED
