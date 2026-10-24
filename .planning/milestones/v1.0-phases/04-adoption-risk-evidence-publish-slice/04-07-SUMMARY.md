---
phase: 04-adoption-risk-evidence-publish-slice
plan: 07
subsystem: testing
tags: [cdp, headless-chrome, wcag, reflow-320, print]
requires:
  - phase: 04-adoption-risk-evidence-publish-slice
    provides: plan 06 static a11y and cross-check gates
provides:
  - scripts/cdp.mjs shared headless-Chrome harness
  - scripts/a11y.mjs browser accessibility, 320px and text-spacing checks
  - scripts/print.mjs print checks with page-count drift ceiling
  - print CSS fixes (svg.fig no longer clipped, table min-width resets)
affects: [04-08, 04-09]
key-files:
  created: [scripts/cdp.mjs, scripts/a11y.mjs, scripts/print.mjs]
  modified: [scripts/smoke.mjs, site/assets/style.css, test/style.test.js]
key-decisions:
  - "Print ceiling 100 pages (measured 87, +15%)"
  - "Checks are content-agnostic (structure, names, overflow, page-1 legal flag and COI) so they survive the Phase 03.1 reframe"
requirements-completed: [QA-02]
duration: 40min
completed: 2026-10-24
---

# Phase 4 Plan 7: Browser a11y, 320px and print checks Summary

The CDP harness is extracted to cdp.mjs, and two new scripts check accessibility, 320px reflow, text spacing and print in local headless Chrome. They found one real print defect (figures wider than the page), now fixed.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1 cdp.mjs extraction + a11y.mjs | e1f09f5 | smoke cases a-o all PASS as before; a11y all PASS |
| 2 print.mjs + print CSS | f7728a3 | print all PASS |
| Fix | 9b8fcf3 | tab walk stops when focus wraps to first stop |

`node --test`: 344 pass, 0 fail. smoke: 15 PASS. One transient smoke failure (case h) appeared once right after the refactor and did not recur in 5 further runs; treated as timing flake, not refactor-related.

## a11y.mjs output (1280px then 320px)

- AX tree: 0 unnamed of button 2, link 361, textbox 13, spinbutton 0, radio 3, region 44, table 27
- Landmarks: banner 1, main 1, navigation 1, contentinfo 1
- Live regions found: 3 status (polite), 0 alert roles at load (the alert appears only on errors)
- h1 1, heading level skips 0, 16 named sections, lang en-GB
- Targets: 19 inputs/buttons/summaries all >= 48px; radios >= 24x24; 0 chips/cites under 24px (so no inline-link exception was needed)
- No positive tabindex; first stop is skip link to #answer; 406 tab stops, all with a visible outline; none covered; focus order follows DOM
- 320px: scrollWidth 320; nothing outside the 28 `.table-scroll`/`.fig-scroll` regions overflows; all 28 focusable and named; legal flag and COI inside viewport
- Text spacing (WCAG 1.4.12) via adoptedStyleSheets: same results, no clipped overflow:hidden

## print.mjs output

- Page count 87, ceiling 100 (round 87 x 1.15). Research expected "well above 40".
- Legal flag displayed, details.maths open (via the `beforeprint` handler in ui.js, which the script fires explicitly), `.calc-live .btn`, `.share`, `.calc-errors`, `.calc-nojs` all display none
- 700px: scrollWidth 700, 1374 table cells, none clipped
- pdftotext (/opt/homebrew/bin/pdftotext): 87 pages all over 20 characters; page 1 contains the legal flag and COI sentences

## Deviations from Plan

**1. [Rule 1 - Bug] svg.fig clipped in print**
- Found during: Task 2 (scrollWidth 816 at 700px)
- Issue: `svg.fig { min-width: 800px }` (max-width 960 query) survives into print where `.fig-scroll` is overflow visible, so figures ran off the page.
- Fix: `@media print svg.fig { min-width: 0; max-width: 100%; height: auto }`. Page count rose 74 to 87 because figures now render in full.
- Files: site/assets/style.css; pinned in test/style.test.js. Commit f7728a3.

No other page or CSS defects were found by the a11y pass.

## Pinned exceptions (inspected)

- Pitfall 7 matrix sticky header: no tab stop was covered, so no exception was needed in the script.
- Inline link exception for chips/cites: count 0, not exercised.
- `.skip` is excluded from the 320px overflow check because it is parked at left:-9999px until focused (inspected: intended pattern).
- Calculator inputs draw the focus ring on `.control:focus-within`; the script accepts the ring on that ancestor.
- `.status-disputed` already had a double border on screen; the print rule is a pin only.

## Not covered (human UAT, Plan 08)

Screen reader, zoom to 400%, real devices, grayscale print, real printer, other paper sizes. QA-01 stays partial for these.

## Known Stubs

None.

## Self-Check: PASSED

scripts/cdp.mjs, a11y.mjs, print.mjs exist; commits e1f09f5 and f7728a3 present; node --test and smoke green.
