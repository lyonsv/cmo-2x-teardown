---
phase: 04-adoption-risk-evidence-publish-slice
verified: 2026-10-24T00:00:00Z
status: passed
score: 5/5 roadmap success criteria verified (SC5 legal-flag clause superseded by author decision)
overrides_applied: 0
re_verification: false
---

# Phase 4: Adoption, Risk, Evidence & Publish Slice Verification Report

**Goal:** Honest view of adoption, what goes wrong and evidence gaps; published page accessible, cross-checked, re-verified.
**Status:** passed
**Requirements:** CLOSE-01, CLOSE-02, CLOSE-03, QA-01, QA-02, QA-03, QA-04. All seven are claimed by plans and mapped to Phase 4 in REQUIREMENTS.md. There are no orphans.

## Scope changes treated as authoritative (not gaps)
- Author: "Drop the legal review entirely and remove the flag. Drop those UAT items." The "flagged for legal review" clause of the goal, SC5 and QA-03 is superseded. This is recorded in REQUIREMENTS.md, LEGAL-REVIEW.md and 04-HUMAN-UAT.md (status: dropped). The live page has no "Legal review" text.
- Quick task 261024-s14 removed the COI note and all Getty content. The live page has 0 "Getty" matches. The plan-level Getty/COI truths are superseded.
- **The 11 manual UAT checks were NOT performed.** They are not passed and not pending. They were dropped by the author. These are screen reader (VoiceOver plus one other), 200% and 400% zoom, real devices, grayscale print, tone review, incident status judgement, counsel review, and the like. No assistive-technology or real-device evidence exists. Only automated checks (AX tree, focus order, 320px, print to PDF) back SC4.
- Push approval was delegated and recorded in 04-09-SUMMARY.md.

## Gates re-run by the verifier
| Gate | Result |
|---|---|
| `node --test` | 376 pass, 0 fail |
| `node scripts/crosscheck.mjs` | 0 failures (334 figures, 169 chips, 62 cites, 107 register rows, 12 defaults) |
| `node scripts/smoke.mjs` (local) | All cases PASS (last four lines read; run completed on the first try) |
| `node scripts/a11y.mjs` (local) | 0 FAIL; 27 scroll regions focusable and named at 320px; text-spacing OK |
| `node scripts/print.mjs` | PASS; 84 pages (ceiling 100), no blank pages, no clipped cells |
| `node scripts/smoke.mjs <live URL>` | PASS |
| `node scripts/a11y.mjs <live URL>` | 0 FAIL |
| Live HTML vs `site/index.html` | Byte-identical (diff -q silent), so the published page equals the repo, with a clean tree at HEAD 0338b26 |

## Success criteria
| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Adoption section with Backlog 0 as a queue-age SLA | VERIFIED | Live `#s13`; line 1332: "Backlog 0 means no approved brief waits longer than 8 days [Modelled] ... Replace this with your own service level." N is derived in data.js (review fix CR-01). |
| 2 | "What goes wrong": incidents (established vs alleged), slop, fatigue, Goodhart, IP, regulation, dated callouts | VERIFIED | `#s14` live; 5 "As at" callouts, Established/Alleged statuses, Parasuraman and Moffatt cited, EU AI Act Art. 50 with 2026-08-02 and the 2026-12-02 transition. Status judgements were revised in review (WR-05); the correctness of the judgement itself is an author-dropped manual item. |
| 3 | Source register with publisher flags, evidence gaps, assumptions register matching data.js; scripted check | VERIFIED | `#s15` live, "Publisher type" present, "Evidence gaps" present, McKinsey and Gartner not-used notes present, no Gartner 49/27% figures (the 40% hits are other figures). crosscheck.mjs and `node --test` pass, with mutation tests. |
| 4 | Keyboard and screen reader, 320px, print | VERIFIED (automated only) | a11y.mjs (AX tree, focus order, targets, 320px, text spacing), static WCAG tests, print.mjs, all passing locally and live. Real screen reader and device testing was not performed (dropped by author). |
| 5 | Re-verified and date-stamped, production deploy live (legal flag superseded) | VERIFIED | `<time>`-stamped register dates, reverify stamps (PDFs marked manual, WR-02), live URL serves HEAD content and passes smoke and a11y. |

## Review
04-REVIEW.md found 17 issues, all marked fixed in its Fix Status section. The page was republished after the fixes (04-09-SUMMARY), and the live page matches the repo. The review notes some fixes "require human verification" (for example, the Backlog 0 N logic), and no human did so.

## Anti-patterns
No blockers found by the gates. I did not run a separate TODO/FIXME grep over the modified files. This is a minor gap in this verification.

## Human verification
None pending (all dropped by author, see above).

## Caveats
- SC4 is met by automated evidence only.
- Phase 2 and Phase 3 HUMAN-UAT items remain open per 04-HUMAN-UAT.md and are outside this phase's scope.

_Verifier: Claude (gsd-verifier)_
