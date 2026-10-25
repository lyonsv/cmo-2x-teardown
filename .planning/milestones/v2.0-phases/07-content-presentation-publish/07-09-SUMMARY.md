---
phase: 07-content-presentation-publish
plan: 09
subsystem: content
tags: [compare, platform-sub-table, register, ui-review, polish, spine]
requires: [07-08]
provides:
  - "#compare (#s12) h3#suites-automate: twelve-row dated table of what major suites and channels document, with Status limited to Generally available / Announced / Reported"
  - "fourteen platform-capability sources in data.js and #s15 (adobe-, salesforce-, hubspot-, google-ads-, meta-, smartling-, phrase-, bynder-), all Modelled and vendor-claimed"
  - "05-UI-REVIEW follow-ups: legend, Grade headers, register widths, Appendix heading prefixes, h3 rule, divider spacing, .to-follow removed"
  - "Figure 3 wide variant labels with inner padding"
affects: [07-10]
key-files:
  modified: [site/index.html, site/assets/style.css, site/js/data.js, scripts/a11y.mjs, scripts/print.mjs, test/compare.test.js, test/page.test.js, test/style.test.js, test/spine.test.js, test/flow.test.js, test/data.test.js, test/evidence.test.js, test/inventory.test.js]
key-decisions:
  - "Status 'Generally available' only for the two rows whose source says so (Adobe agents press release read in full, Computerworld on Workfront); help pages and trade press with no launch statement are 'Reported'; launch descriptions without a GA statement are 'Announced'. The tests pin this"
  - "Trade-press sources about vendor products carry the vendor-claimed flag, so their evidence class is observed, not benchmark"
  - "The evidence key sits in a closed details element, so the legend is 1,026px tall at 375px and 1,183px at 320px (was 1,554px and 1,762px with the extra sentence), under the 1,200px budget at 375px"
  - "Source register columns are fixed-width on screen only (@media screen); print keeps auto layout"
requirements-completed: [COMP-01, QA-05, STRUCT-07]
completed: 2026-10-25
---

# Phase 7 Plan 09: Platform sub-table and UI-review polish Summary

#compare now says what the suites and channels already document, with a date and a source on every row and an availability word that the source supports. The page also closes out the 05-UI-REVIEW findings, and every body section is on the spine.

## Commits
- 496b121 feat(07-09): dated platform sub-table in #compare with fourteen register rows
- 8c072e8 feat(07-09): UI-review follow-ups, register width, Figure 3 label padding and spine test

## Platform re-checks (accessed 2026-10-25)
WebFetch was not available in this run, so each URL was re-fetched with curl and a browser user agent, and the relevant phrases were checked in the text.

Confirmed on re-check: Adobe agents press release (PDF opened and read: states general availability of AI agents and the orchestrator), Computerworld on Workfront (states three collaborator types are now generally available, content reviewer, admins only), Salesforce 2026 and 2024 blogs, CMSWire on HubSpot (dated 2026-09-16), HubSpot Spring 2025 page, both Google Ads help pages, Campaign Asia (published 2025-06-03, reports the WSJ aim), Smartling release (2026-05-19), Phrase AI solutions page.

**Sources whose re-check failed** (research reading kept, and the register row says so):
- `adobe-cx-enterprise` (MarTech): HTTP 403. The MarTech article on Adobe agents going generally available also returned 403 and was replaced by the Adobe press release, which opened.
- `meta-advantage-plus` (Meta business page): HTTP 400 to an automated fetch.
- `bynder-compliance-agent` (GlobeNewswire): HTTP 403.

Status words: Generally available (2 rows), Announced (7 rows), Reported (3 rows). The Campaign Asia article reports a WSJ report; the WSJ original was not read, and the row says no official Meta launch was found.

## Deviations from Plan

**1. [Rule 3 - Blocking] Implications are a bold-led paragraph and list, not an h4.** Appendix blocks may not contain h4 (page.test.js), so "What this evidence implies" is a `<p><b>`. The new h3 adds one to the pinned h3 count (`P7_H3_COMPARE`).

**2. [Rule 3 - Blocking] Prose budget for s12 raised from 700-900 to 700-1100 words** for the sub-table lead and the four implications.

**3. [Rule 3 - Blocking] Print page ceiling raised 193 to 224.** Measured 195 pages after fourteen register rows, the sub-table and the legend (was 185); ceiling is round(195 x 1.15), following the convention in scripts/print.mjs. The first measure of 281 pages came from the fixed register widths applying in print; scoping them to `@media screen` fixed it.

**4. [Rule 1 - Bug] a11y text-spacing check flagged `.visually-hidden` spans** as clipped overflow. They are clipped by design, so scripts/a11y.mjs exempts that class.

**5. Source register fix is column widths, not a URL min-width.** The suggested `td:last-child { min-width: 16em }` alone grew the table to 1,461px. On screen the table is now fixed layout at 1,300px: ID 130, Claim 330, Publisher 120, Type 80, Date 90, Grade 90, Evidence 100, Flag 90, URL 270. At 1440px the region is 1,032px wide, Evidence ends at 940px inside it, and the URL column is 270px wide (was 42px). The URL column still needs a sideways scroll, as the review allowed.

**6. Evidence key folded into details.maths.** The plan allowed this if the legend exceeded about 1,200px at 375px. Print: closed details elements do not print their content, so the evidence key is absent from a printed legend (the label and the grade/evidence sentence do print). Not changed here; flag for 07-10 if wanted.

## Polish items from the orchestrator
1. **Figure 3 labels.** Wide-variant node lines are now at most eight characters (was nine), giving about 5px of padding each side (`flow.test.js` pins the limit). Relabelled: "Set goal / budget / limits", "Go-live / sign-off / in pilot", "Decide / each / case", "Approve / changes / past cap", "Plan / from the / goal", "Write / task / specs", "Derive / localise / resize", "Join / results / to work". "Linguist" and "concepts" (eight characters) are still snug but clear. Screenshot at 1440: `/private/tmp/claude-502/-Users-vincent-lyons-git-build-and-review/546957a9-5509-4f77-9d35-2dfe722da3cc/scratchpad/shots/desktop-fig3.png`.
2. **Figure numbering.** Left as is. The figures read in page order 1, 3, 2, 4 because v1 Figure 2 moved to Appendix A; renumbering would touch figure captions, steps headings, inventory and the cross-reference tests. Recommend a decision in 07-10 or the final review.

## Screenshots and measurements
In `/private/tmp/claude-502/-Users-vincent-lyons-git-build-and-review/546957a9-5509-4f77-9d35-2dfe722da3cc/scratchpad/shots/`: `desktop-{legend,fig3,registerhead,divider,suites}.png`, `mobile375-{legend,suites}.png`, `mobile320-{legend,suites}.png`. Measurements: legend 579px (1440), 1,026px (375), 1,183px (320); no document-level horizontal scroll at 1440, 375 or 320.

## Gate results
`node --test` 608 pass; crosscheck 0 failures (register rows 183); `bash scripts/gates.sh` ALL GATES GREEN (second run, after the print fix); print 195 pages against ceiling 224; a11y 731 focus stops against cap 1200. Nothing pushed.

## Known Stubs
None. No "Detail to follow" text or `.to-follow` rule remains; all nine body sections are on the spine (deep-equal test added).

## Threat Flags
None new. T-07-17: every row sourced and dated, Status limited and pinned by tests, three failed re-checks disclosed in the register. T-07-18: VENDOR_RE test unchanged and green; vendor names appear only in #s12 and #s15.

## Self-Check: PASSED
