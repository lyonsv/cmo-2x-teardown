---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 11
subsystem: verification
tags: [checkpoint, local-preview, responsive, print, a11y-smoke]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: complete s09-s12 (03-10)
provides:
  - Recorded automated gate results, responsive and print evidence for Phase 3
key-files:
  modified: []
key-decisions:
  - "No defects found, so no fix commits were needed"
requirements-completed: [CALC-01, CALC-06, CALC-07, COMP-01, LEVER-04, OUTC-01]
duration: 20min
completed: 2026-10-24
---

# Phase 3 Plan 11: Automated gates and local preview Summary

All automated gates passed and the rendered s09-s12 showed no responsive or print defects. No code changed in this plan.

## Automated gates

| Command | Result |
|---------|--------|
| `node --test` | 287 tests, 287 pass, 0 fail |
| `node scripts/smoke.mjs` | PASS a, b, c, d (JS off), e, f, g, h, i, j (hashchange), k |
| `grep -c '<script' site/index.html` | 1 |
| inline `on*=` handlers / `style="` | 0 |
| `base64` / `data:image` | 0 |
| root-absolute `href`/`src` | 0 |
| `site/.nojekyll` | present |
| `<button>` without `type="button"` | 0; one `role="alert"`; one `<output>` |
| `git log origin/main..HEAD` | 42 local commits, nothing pushed, nothing uploaded |

## Rendering evidence

Screenshots and the print PDF were written to the session scratchpad (`p3-preview/`), not the repo.

Method note: plain `chrome --headless --window-size=320` enforces a minimum window width, so the first screenshots were cropped and not valid for width checks. I switched to a CDP script using `Emulation.setDeviceMetricsOverride` at 320, 375, 768 and 1280px, which also measured overflow.

- Overflow test at all four widths: `scrollWidth == innerWidth`, and no element extends past the viewport outside an `overflow` scroll container (empty offender list).
- s11 at 320px (read in slices): form is one column, fields and radio group usable, headline summary wraps, the results and scenario tables scroll inside their own region, Figure 8 (three bar panels, utilisation dashed capacity line) is legible, with the caption and "how to read" text wrapping.
- s11 at 1280px: results table, scenario table, Figure 8 side by side with the reading guide, chips aligned.
- s12 at 320px: matrix scrolls inside its region with the dimension column pinned; cites and access dates wrap.
- s09 and s10 (Figures 2-7 and the outcome case): covered by the overflow test at four widths; no clipping offenders.
- Print (`--print-to-pdf`, 40 pages): s11 inputs, results table, scenario table, maths steps and believe panel print; text search of the s11/s12 pages finds no copy-link, JS notice or button text; the matrix prints unclipped with no sticky artefacts.

## Preview review

auto-approved (user away; orchestrator authorised by user instruction "keep going and approve everything until done"). The user did not review this preview. Inspected by the executor: the items listed under Rendering evidence above (320/375/768/1280 overflow, s11 and s12 screenshots, print pages, JS-off smoke case d, hash round-trip and bad-hash smoke cases). Fixes applied: none needed. Not inspected by eye: s09 and s10 imagery at every width (covered by the automated overflow test only), and tone and fairness of the copy (left for the user's review before publishing).

## Deviations from Plan

None to the page. Local preview server was started and stopped. Task 3: no fixes.

## Self-Check: PASSED
