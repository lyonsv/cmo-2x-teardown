---
phase: 07-content-presentation-publish
plan: 03
type: execute
subsystem: content
tags: [build, capabilities, permissions, expansion-path, spine]
requires: [07-02]
provides:
  - "#build section 03 content: plain-English block, six parts, ten capabilities, own/integrate/platform, permissions, always-human, smallest slice, E0-E5"
  - "test/build.test.js"
affects: [07-01, 07-04, 07-09]
key-files:
  created: [test/build.test.js]
  modified: [site/index.html, site/js/ui.js, scripts/print.mjs, test/page.test.js, test/spine.test.js]
key-decisions:
  - "Numeric gate also exempts the exact tokens E0-E5 (same mechanism as T0-T3); no numbers were bound to claims"
  - "ui.js opens every details.maths fold for print, not just the first"
requirements-completed: [BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05, STRUCT-07]
completed: 2026-10-25
---

# Phase 7 Plan 03: What needs to be built Summary

Section 03 now opens with a plain-English system description (about 170 words, no digits), lists six parts and ten capabilities (condensed body table, eight-column full table in a fold), classifies each as build and own, integrate or platform-provided by category, shows permission levels beside the asset risk tiers with stage as the pilot ceiling, lists the decisions that stay with people, describes the smallest useful version and the E0 to E5 expansion path, and keeps the v1 layer table in a fold.

## Commits
- 393e2bb feat(07-03): plain-English block, six parts, ten capabilities, build/integrate/platform
- cf3e489 feat(07-03): permissions beside tiers, always-human, smallest slice, E0-E5

## Deviations from Plan
1. [Rule 3 - Blocking] `ui.js` ran `document.querySelector('details.maths')` and opened only that one fold for print. Adding folds before the calculator's maths box made the first match a content fold, and print.mjs then failed ("details.maths open: 3 elements"). ui.js now opens every `details.maths` on beforeprint and resets only the ones it opened (net one line shorter, so the "ui.js stays thin" limit still holds). The unused `mathsBox` constant was removed. 07-01 will add another fold and benefits from the same fix; Phase 6 edits to ui.js should keep this block.
2. [Rule 3 - Blocking] Print page ceiling raised from 100 to 131 in scripts/print.mjs (measured 114 pages with all folds open; ceiling = round(114 x 1.15), the convention in the file). Later Phase 7 plans add more content and will likely need to re-measure.
3. [Rule 3] Numeric gate (page.test.js) now strips `\bE[0-5]\b` as well as `\bT[0-3]\b`, as the plan allowed. Only those exact tokens are exempt.
4. Heading-count guard: `P7_H3_BUILD = 8` added on its own line next to `P7_H3_AUTONOMY` (from 07-02), so concurrent plans add their own lines rather than editing one number.
5. The "cycle time" phrase is banned by an existing guard (must read brief-to-live time), so the slice description says "brief-to-live time".
6. The body-to-appendix links (STRUCT-07) were added in Task 1 with the table rather than in Task 2, and are asserted in build.test.js.
7. The 07-01 artefacts this plan depends on (test/spine.test.js, .chain-pos/.evidence-stop CSS) were created in 07-02 in a form 07-01 can extend; 'build' is added to SPINE here. The v1 s04 block is the last element in #build, inside a fold, after the evidence-stop line.

## Verification
`node --test` 459 pass, 0 fail; `node scripts/crosscheck.mjs` 0 failures; `bash scripts/gates.sh` ALL GATES GREEN (run at the end of this plan; print page count 114 against the new ceiling of 131).

## Known Stubs
None.

## Threat flags
None. #build carries no numbers, no vendor names (VENDOR_RE over #build in build.test.js) and an evidence-stop line stating that the design has not been run in this organisation.

## Self-Check: PASSED
