---
phase: 04-adoption-risk-evidence-publish-slice
plan: 05
subsystem: ui
tags: [s15, evidence-gaps, legal-flag, re-verification]
requires:
  - phase: 04-adoption-risk-evidence-publish-slice
    provides: plan 04 s14 risk blocks and four legal-s14 ids
provides:
  - s15 evidence-gaps list (twelve gaps with closers) and McKinsey and Gartner not-used notes
  - Legal-review flag after the COI note, with a test that keeps it
  - Ten legal-* ids tied two ways to .planning/LEGAL-REVIEW.md
  - scripts/reverify.mjs and a recorded QA-03 run with dated stamps
affects: [04-06, 04-09]
key-files:
  created:
    - .planning/LEGAL-REVIEW.md
    - test/legal.test.js
    - scripts/reverify.mjs
  modified:
    - site/index.html
    - site/assets/style.css
    - site/js/data.js
    - test/page.test.js
    - test/style.test.js
key-decisions:
  - "Legal ids sit on inner elements (caption-less table id, tr id, p id) so pinned callout and table regexes keep matching"
  - "Gartner not-used note uses RESEARCH V6 wording (generative-AI return percentages), not UI-SPEC's agent-adoption label"
requirements-completed: [CLOSE-03, QA-03]
duration: 40min
completed: 2026-10-24
---

# Phase 4 Plan 5: Evidence gaps, legal flag and re-verification Summary

s15 now states what the page could not prove (twelve gaps, each with "Would be closed by:" and a link to section 11), the page carries a protected legal-review flag with a ten-row inventory for counsel, and the time-sensitive sources were re-fetched with honest dated stamps.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1. Gaps, not-used notes, legal flag, legal ids, LEGAL-REVIEW.md | 22ffa3e | s15 gaps list, two `.nd` notes, `.callout.legal-flag` (CSS and print), ten ids, inventory, legal.test.js, style test |
| 2. QA-03 re-verification | (this plan's task 2 commit) | scripts/reverify.mjs, run, Re-check failed stamps in data.js and the register |

`node --test`: 320 pass, 0 fail. `node scripts/smoke.mjs`: all PASS.

## Reverify run

Reverify run date: 2026-10-24

Status and phrase-found table (script output; 1 s gap, sequential, no retries on 403, no circumvention):

| id | status | phrase found |
|----|--------|--------------|
| gartner-2025-cmo-spend | 403 | n/a |
| gartner-2026-cmo-spend | 403 | n/a |
| nyu-emory-ai-ads-2025 (SSRN) | 403 | n/a |
| usco-copyright-ai-part2 | 200 | yes |
| getty-v-stability-uk (Taylor Wessing) | 403 | n/a |
| ailawsuittracker-getty-uk | 200 | yes |
| laubli-2019 | 200 | yes |
| experimentation-vendor-playbook (Optimizely) | 200 | yes |
| kohavi-2013 | 200 | NO (PDF text) |
| aggarwal-geo-2024 | 200 | yes |
| cornell-17usc504 / cornell-17usc412 | 200 | yes / yes |
| gradial x10 (integrations, docs-faq, docs-how, docs-what, platform, docs-dam, docs-translation, home, geo, customers) | 200 | yes |
| airops x5 (pricing, enterprise, webflow, chime, home) | 200 | yes |
| profound x3 (agents, pricing, home) | 200 | yes |
| parasuraman-manzey-2010 | 403 | n/a |
| eu-ai-act-art50 | 200 | yes |
| eu-ai-omnibus-2026-1744 | 200 | NO |
| eu-code-of-practice-transparency | 200 | yes ("adequate voluntary tool") |
| asa-ai-disclosure-2025 | 200 | yes |
| ftc-fake-reviews-rule-2024 | 200 | yes |
| getty-v-stability-us | 200 | yes |
| getty-v-stability-uk-cms | 200 | yes |

Re-stamped (200 and phrase found): every row marked yes. Their `accessed` was already 2026-10-24, the same date as the run (D = 2026-10-24), so no date value changed, and no s12 matrix caption, vendor panel or literal-date test pin needed editing.

Rows carrying "Re-check failed 2026-10-24; last verified 2026-10-24." (in data.js and the register, equal): gartner-2025-cmo-spend (corroborated by the silicon.co.uk reproduction; "Business Wire reproduction" wording removed), gartner-2026-cmo-spend (secondary summaries agree), nyu-emory-ai-ads-2025 (NYU Stern research highlight page read 2026-10-24; the extra Stern page is not a scripted target), getty-v-stability-uk (403), kohavi-2013 (phrase not in PDF text), eu-ai-omnibus-2026-1744 (phrase not found), parasuraman-manzey-2010 (403). The user's 2026-10-24 SSRN and Gartner browser confirmations stay in read_via. ailawsuittracker-getty-uk keeps '2025-12-16' and adds "CMS tracker dates the grant 17 December".

s14 as-at dates: all cite sources checked on 2026-10-24, the same day; no s14 fact changed. The EU Commission code page and the Getty trackers still show no Court of Appeal hearing or judgment, so no stop-and-report was needed.

For the human UAT list: vendor rows (Gradial, AirOps, Profound) were checked by status and brand-name phrase only, s12 statements not re-read in full.

## Deviations from Plan

- **Gartner note wording.** The note reads "Gartner's generative-AI return percentages: not used on this page." (RESEARCH V6), not UI-SPEC's "agent-adoption" label, because the 49/40/27 figures are 2025 generative-AI ROI figures.
- **Legal id placement and test edits (Rule 3).** Pinned regexes in page.test.js (imagery table, s09 Not legal advice callout) were narrowly widened to allow the new ids: `<table id="legal-s05-imagery">` and `<p id="legal-s09-notadvice">`. s05 indemnity id is on the `<tr>`; s12 admission id is on the callout `<p>`.
- **Closing line.** "Replace any of these with your own data in the calculator. See section 11." with the link on "section 11", to keep the numeric gate and the exact sentence.
- **Vendor phrases.** Vendor rows use the product name as the phrase rather than a phrase from each s12 statement; recorded above as status and phrase only.
- **Reverify script.** `scripts/reverify.mjs` writes nothing and exits 0; the extra Stern URL target in the plan was dropped because no exact page URL was held in data.js (its content was read during research and is cited in read_via).

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

LEGAL-REVIEW.md, legal.test.js, reverify.mjs exist; commit 22ffa3e exists; ten legal ids equal ten inventory rows; `node --test` and smoke green.
