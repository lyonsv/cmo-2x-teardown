---
phase: 07-content-presentation-publish
plan: 10
subsystem: publish
tags: [publish, validation, github-pages, completion]
requires: [07-01, 07-02, 07-03, 07-04, 07-05, 07-06, 07-07, 07-08, 07-09]
provides:
  - v2.0 live on GitHub Pages, byte-identical to local
  - 07-COMPLETION.md milestone summary
affects: [site/js/data.js, site/js/panels.js, site/index.html]
tech-stack:
  added: []
  patterns: [group note carries the weakest grade of its members; econ claim ref follows the first traced input at its weakest grade]
key-files:
  created:
    - .planning/phases/07-content-presentation-publish/07-COMPLETION.md
  modified:
    - site/js/data.js
    - site/js/panels.js
    - site/index.html
    - test/calc-page.test.js
    - test/data.test.js
    - test/evidence.test.js
    - test/figure.test.js
    - test/model.test.js
    - test/page.test.js
    - test/supply-chain.test.js
key-decisions:
  - "asm-auto-approval, asm-variant-cost and asm-tooling regraded Speculative (orchestrator decision, consistent with CR-03)"
  - "Mixed-grade group notes carry the weakest grade and read 'The weakest figure in this table is'"
requirements-completed: [QA-05, QA-06, QA-07]
metrics:
  tasks: 3
  completed: 2026-10-25
---

# Phase 7 Plan 10: Final publish and completion summary

v2.0 is live at https://lyonsv.github.io/cmo-2x-teardown/ after a last regrade of three unsourced first-edition hypotheses to Speculative, a full green gate run, W3C Nu validation with 0 errors, a fast-forward push and a confirmed byte-identical deploy.

## Tasks

| Task | Commit | Result |
|---|---|---|
| Pre-step: regrade `asm-auto-approval`, `asm-variant-cost`, `asm-tooling` Speculative | `f5bad1e` | `node --test` 615 pass, crosscheck 0 failures |
| 1. Gates, W3C Nu, push, deploy, live comparison | (no commit; push of `f5bad1e`) | All green, see below |
| 2. 07-COMPLETION.md | docs commit | Four required headings present |

## Regrade (pre-step)

- Values did not change; grades, chips and register rows did. A claim that links one of the three rows is Speculative, and an engine claim whose trace reaches one follows through the existing evidence trace.
- Engine claims now take their `ref` lazily: when the traced grade is weaker than the declared row, the claim links the first traced input at that grade (16 W5 current-state figures and `econ-scen-C-hires_without` moved to `asm-auto-approval`).
- Calculator tables and field groups now mix grades, so the group rule changed deliberately: the note carries the weakest grade and links the first member row at that grade. A table row with several figures carries the weakest among them. Wording is "The weakest figure in this table is" and "The weakest default in this group is".
- Tests changed on purpose: grade-count (hypothesis/Modelled 24 to 21, hypothesis/Speculative plus 3), "every model assumption is Modelled" (three exceptions), golden grades in model tests (injected-grade tests restore the three rows to Modelled so the injected input alone decides), group-rule and governing-chip tests (weakest grade), figure and supply-chain row chips.
- One sentence was added to the results table note so `asm-review-service-days` (no longer named by a group note) stays referenced; the "fixed note sits under the results table" distance guard went from 280 to 480 characters.

## Verification

- `bash scripts/gates.sh`: ALL GATES GREEN on the first run (no CDP flake). 615 tests, crosscheck 0 failures, smoke, a11y (320px reflow, text spacing), print 201 pages against the frozen ceiling of 231.
- W3C Nu: 0 errors; 3 warnings (Content Security Policy meta tag blocking external files, an artefact of POSTing the HTML with no base URL).
- Screenshots at 1440px and 320px reviewed: no overlap or clipped text. Two 320px views (Figure 3, calculator) landed on the wrong scroll offset and were not re-shot; the a11y 320px reflow gate and flow tests cover them.
- Push: origin/main (`fa66201`) was an ancestor; `git push origin main`, no force; 39 commits.
- Deploy: pages.yml run 40214131762, conclusion success.
- Live equals local: `index.html`, `assets/style.css` and 11 `js/*.js` files byte-identical on the first attempt (2026-10-25T16:59:11Z).

## Deviations from Plan

**1. [Rule 3 - Blocking] Regrade needed test and page changes beyond data.js** (documented above). Group-rule and governing-chip tests were relaxed from "members share one grade" to "the note or row carries the weakest grade", the minimal change that keeps each figure's own claim grade honest and each chip pointing at its governing row.

**2. [Rule 2 - Correctness] Engine claim `ref` follows the traced weakest grade** so a chip never links a row stronger than the figure it sits beside.

## Auth gates

None.

## Known Stubs

None.

## Self-Check: PASSED
