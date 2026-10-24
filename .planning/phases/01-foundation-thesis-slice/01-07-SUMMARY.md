---
phase: 01-foundation-thesis-slice
plan: 07
subsystem: publish
tags: [publish, verification, github-pages, checkpoint]
requires: [01-06]
provides:
  - Live Phase 1 page at https://lyonsv.github.io/cmo-2x-teardown/ from a test-gated deploy
affects: [site/index.html, site/assets/style.css]
key-files:
  modified: [site/index.html, site/assets/style.css]
decisions:
  - "Legend heading is an h2.legend-title (was h3) so the heading outline has no skipped level; styling kept identical via a .legend-title rule"
metrics:
  tasks: 3
  files: 2
completed: 2026-10-24
---

# Phase 1 Plan 7: Publish and verify Summary

The Phase 1 page is live at the public Pages URL, deployed by a workflow that ran `node --test` first (test job success, then deploy job success), after the user reviewed it locally and approved the push.

## Pre-flight (Task 1)

- `node --test`: 59 pass, 0 fail
- `grep -c '<script'`: 0; base64 in index.html and style.css: 0; vendor names (gradial/airops/profound): 0; absolute `href`/`src` paths: 0
- `site/.nojekyll` present; `site/index.html` 48,548 bytes
- `.github/workflows/pages.yml` has `needs: test` (line 26)
- `href="#s` count 19 locally (15 TOC + 4 in-page cross-links); live check treated as >= 15

## Push approval

User reply (verbatim): "approve-push"

## W3C Nu validation (Task 3, after approval)

- First run: 1 error (h3 "How to read the grades" followed h1, skipping a heading level), 1 info.
- Fix (markup and CSS only, no copy or number changes): `<h3>` became `<h2 class="legend-title">`, with `.legend .legend-title` reproducing the old h3 look. Commit b4cc65f. `node --test` still 59/59.
- Re-run: **0 errors**. One remaining message is type info: "external stylesheet assets/style.css blocked by style-src" . That is a validator artefact (the page is posted as an anonymous document, so `'self'` has no origin); the live page loads its stylesheet normally. Not a defect.

## Deploy

- Pushed main c72d08d..b4cc65f (no force). `git rev-parse HEAD` equals `origin/main` (b4cc65f) at that point.
- Run id: **40083178894** (pages.yml), head SHA b4cc65f
- Jobs: test = success, deploy = success

## Live checks

URL: **Live URL** https://lyonsv.github.io/cmo-2x-teardown/

| Check | Count |
|-------|-------|
| `aria-labelledby="f2-t f2-d"` | 1 |
| `the 2x claim is false for that org` | 1 |
| `id="s15"` | 1 |
| `Conflict of interest` | 1 |
| `href="#s` | 21 (>= 15) |
| `legend-title` (fix is live) | 1 |

## Phase 1 success criteria and evidence

1. Title block, metadata, COI note, grade key with vendor-claimed flag, answer-first paragraph before section 01: live greps for `Conflict of interest`; legend test in test/page.test.js (flag span, "It never raises a grade."); answer section precedes s01 in served HTML.
2. TOC jumps to all 15 sections: 15 TOC anchors, live `href="#s` = 21 and `id="s15"` present; page tests check every TOC target id exists.
3. Section 01 metric trio, six-lever table, "does not mean", falsifier: covered by page tests from plan 01-04/05; live HTML contains the falsifier text.
4. Section 02 Gartner framing, cost per approved-live asset, AI spend floor, SVG figure with data table: live `aria-labelledby="f2-t f2-d"` and `the 2x claim is false for that org`; figure tests from 01-06.
5. Every quantitative claim has a linked grade chip, figures from `data.js`, deploy gated on tests: chip/register tests in the 59-test suite; run 40083178894 shows test success before deploy success; `needs: test` at pages.yml line 26.

## Deviations from Plan

**1. [Rule 1 - Bug] Heading level skip flagged by W3C Nu** - fixed as above, commit b4cc65f, files site/index.html and site/assets/style.css.

The remote repository already existed with Pages enabled (plan 01-02), so no repo creation was needed.

## Self-Check: PASSED

Live URL responds with all expected markers; run jobs both success; b4cc65f is on origin/main.
