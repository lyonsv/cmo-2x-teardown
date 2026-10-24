---
phase: 02-factory-spine-slice
plan: 04
subsystem: s05-imagery-personalisation
tags: [s05, imagery-sourcing, coi, getty, nyu-emory, personalisation]
requires: [02-03]
provides:
  - neutral imagery-sourcing table (3 routes x 5 criteria) with the COI note directly above it
  - one dated Getty v Stability line linked to its register row, pointing to section 14
  - personalisation / DCO / feeds block with NYU/Emory claims graded Benchmark
  - sources nyu-emory-ai-ads-2025, usco-copyright-ai-part2, getty-v-stability-uk; assumptions asm-imagery-routes, asm-imagery-indemnity
affects: [02-08, 04-legal-review]
tech-stack:
  added: []
  patterns: ["register grade for a source row can be overridden in the test (SRC_GRADE) when it is not Benchmark"]
key-files:
  created: []
  modified: [site/js/data.js, site/index.html, test/page.test.js, test/data.test.js]
key-decisions:
  - "NYU/Emory CTR lift (up to 19%) and disclosure change (-31.5%) are Benchmark: the user confirmed both on the SSRN page on 2026-10-24"
  - "Getty commentary source row is graded Modelled (law-firm commentary, not the judgment)"
requirements-completed: [GEN-03, GEN-04]
duration: ~25 min
completed: 2026-10-24
---

# Phase 2 Plan 04: Imagery sourcing, Getty line and personalisation Summary

s05 now ends with a neutral three-route imagery table (COI note immediately above, no ranking, no colour coding, one Basis chip per row), one dated Getty v Stability sentence, and a personalisation and feeds block carrying the Benchmark-graded NYU/Emory CTR figures.

## Commits

- RED: `test(02-04): imagery sourcing, Getty line and NYU/Emory contract (RED)`
- GREEN: f2ab740 `feat(02-04): s05 imagery sourcing, COI note, Getty line and personalisation`

## Verification

`node --test`: 138 pass, 0 fail (RED had 9 failures, all in the tests added here). `<tr id="src-` count is 5; no "google", "3.73", "4.44" or "105,999" on the page; one `<time datetime="2025-11-04">`. s05 prose is within the 400-700 budget.

## Source checks (T-02-13)

- Copyright Office report PDF: HTTP 200 on the direct URL, used as the source URL.
- Taylor Wessing page: HTTP 403 to automation (Azure WAF). Burges Salmon fallback: also 403. I have no WebFetch, so neither page was read. Fetched text was treated as data only; nothing was followed.
- Consequence: `getty-v-stability-uk` uses Taylor Wessing as publisher, `published: '2026-01'` taken from the URL path only, and `read_via` states that the page was not readable and that the judgment date and permission to appeal rest on search summaries recorded in 02-RESEARCH. The judgment date 2025-11-04 comes from research, not from a page read here.

## Deviations from Plan

**1. [Rule 3 - Blocking] Register grade test assumed every source row is Benchmark**
- **Found during:** Task 2
- **Issue:** The governing chip test hard-coded Benchmark for all `src-` rows, which contradicts the plan's Modelled chip for the Getty commentary row.
- **Fix:** Added `SRC_GRADE` override map in `test/page.test.js` (only `getty-v-stability-uk` is Modelled).
- **Files modified:** test/page.test.js
- **Commit:** f2ab740

**2. [Source access] Getty commentary pages could not be read** (see Source checks). Not a code change; flagged for the author.

## Human follow-up needed

Before publishing (02-08 approve-push checkpoint): the author should open the Taylor Wessing article in a browser, confirm its publication date, the 2025-11-04 judgment and the grant of permission to appeal, and re-check Court of Appeal status. Update `published` and `read_via` in `site/js/data.js` and the register row if anything differs.

## Known Stubs

None added. s06 to s14 remain "Coming in a later update." skeletons by design.

## Threat Flags

None. T-02-14 (adjacency and neutrality tests), T-02-15 (only the two user-confirmed figures, trade-press numbers tested absent, grade-pin test) and T-02-16 (dated `<time>`, status re-check flagged above) are covered.

## Self-Check: PASSED

f2ab740 and the RED commit exist; full suite green.
