---
phase: 02-factory-spine-slice
verified: 2026-10-24T16:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Visually review sections 03-08 on the live page at desktop and mobile widths, and in print preview"
    expected: "Figures 2-7 are legible, tables scroll rather than overflow, accent colour appears only on review/gate paths, print output is readable"
    why_human: "Visual layout, legibility and print appearance cannot be verified by grep"
  - test: "Author confirms the generic stock-licence indemnity summary in the s05 imagery table is fair (author works at iStock/Getty)"
    expected: "Wording is acceptable or is edited. It is a Modelled summary with no registered source."
    why_human: "Conflict-of-interest and legal-fairness judgement (02-REVIEW-FIX flagged it)"
  - test: "Author confirms the Getty v. Stability tracker facts (dismissed secondary copyright claim, narrower trade mark claim upheld) against the tracker page, and the published date of 2026-10-11"
    expected: "Page text matches the tracker"
    why_human: "Legal fact check against an external source, flagged by 02-REVIEW-FIX"
---

# Phase 2: Factory and Spine Slice Verification Report

**Phase Goal:** A reader can follow how 10,000+ assets per campaign are derived from a few concepts and governed by a review agent, tiered gate and eval harness, so volume does not mean risk.
**Verified:** 2026-10-24
**Status:** human_needed
**Re-verification:** No, initial verification

The live page (https://lyonsv.github.io/cmo-2x-teardown/) was fetched and is byte-identical to `site/index.html` at HEAD. It was checked against the revised CONTEXT (post-research and post-review decisions).

## Observable Truths

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|---|---|---|
| 1 | Factory model, supply chain and brief-to-approved flow as SVG figures with title/desc, plus operating architecture with one versioned policy source | VERIFIED | s03 has 2 figures, 2 `<svg>`, 2 `<title>`, 2 `<desc>` (Figures 2, 3). s04 has the layered architecture table, with the policy source "read by generator and reviewer; one versioned source". s05-s08 each have one titled SVG (Figures 4-7), 7 figures in total. |
| 2 | Variant matrix reaches 10,000+ without double counting; "derive, do not generate"; neutral imagery table with COI note; personalisation/feed block with graded CTR and -31.5% | VERIFIED | s05 opens with "Derive, do not generate: four master concepts become about 12,000 Modelled variants". The matrix gives 12,000 before the gate and 11,400 approved-live at the 95% yield. The factors are stated as independent and the total as an upper-bound sketch, so the page does not claim distinct variants. The imagery table has three routes (retrieve/license/generate) with no ranking, and the COI note sits beside it ("author works at iStock/Getty Images"). The NYU/Emory up-to-19% CTR lift and -31.5% are graded Benchmark, with an SSRN source row accessed 2026-10-24 matching the post-research decision. |
| 3 | Review agent behaviour and T0-T3 ladder with examples, human-only list, "illustrative, not legal advice" | VERIFIED | s06 covers rule-ID citation, bounded fix loop, never lowering a tier and a different model family. The Intercom reference appears once, as the post-review decision requires. s07 has the T0-T3 table with examples, shares and defaults, an "Always human" list (hero, claims, likeness, children, third-party rights), and the "Illustrative, not legal advice" note. T1 means no new claims, per WR-02. |
| 4 | Static reviewer-capacity worked example showing review is the binding constraint, plus fatigue controls | VERIFIED | s07 has a 1x/2x with/without-gate table: 2x without the gate is 134.5% utilisation, with the gate 61.9%. It states the 41% break-even and the ~29% floor, and the 100.1% and 111.3% utilisation at the reference rates, flagged company-reported. Fatigue controls cover blind-first review, seeded-error catch rate, session caps, sampling, drift alarms and reason codes. |
| 5 | Eval harness and telemetry | VERIFIED | s08 covers ground truth from reviewer decisions with reason codes, seeded known-bad and rights-trap assets, escape sampling, per-tier precision/recall/drift, and the no-regression rule ("No change ... ships if it regresses the harness"). Telemetry joins the asset ID in the manifest to performance and lists 8 dashboard metrics. |

**Score:** 5/5 truths verified.

Post-review decisions were checked against the page. CR-01: "about 46% of all derived variants are still seen by someone", with no "small chance" wording found. CR-02: the 12,000 pre-gate and 11,400 approved-live rows are shown. WR-02 tiers are consistent. 02-REVIEW-FIX reports 23 fixed and 0 skipped.

## Requirements Coverage

All 12 IDs (GEN-01..05, SPINE-01..07) appear in PLAN frontmatter. All are marked Complete in REQUIREMENTS.md. The union of the plan requirement fields covers every ID, and plan 02-06 lists all 12. No orphaned requirements.

| Req | Status | Evidence |
|---|---|---|
| GEN-01 | SATISFIED | s05 variant matrix, 12,000 pre-gate and 11,400 approved-live |
| GEN-02 | SATISFIED | "Derive, do not generate" in s05 |
| GEN-03 | SATISFIED | s05 imagery table plus COI note |
| GEN-04 | SATISFIED | s05 personalisation/feed block, 19% and -31.5% graded Benchmark |
| GEN-05 | SATISFIED | 7 SVG figures, each with title and desc |
| SPINE-01 | SATISFIED | s04 architecture table |
| SPINE-02 | SATISFIED | s06 |
| SPINE-03 | SATISFIED | s07 tier ladder |
| SPINE-04 | SATISFIED | s07 capacity table |
| SPINE-05 | SATISFIED | s08 harness |
| SPINE-06 | SATISFIED | s08 telemetry |
| SPINE-07 | SATISFIED | s07 fatigue controls |

## Behavioral and Regression Checks

| Check | Result |
|---|---|
| `node --test` | 170 pass, 0 fail, 0 skipped, so no Phase 1 regression |
| Live page == repo HEAD file | Identical |
| TBD/FIXME/XXX/TODO in `site/index.html` and `site/js/*.js` | None |
| Vendor names (Gradial, AirOps, Profound) on the page | 0, so the neutrality constraint holds before Phase 3 |

## Anti-Patterns

None blocking.

## Human Verification Required

1. **Visual and print review of s03-s08.** Check desktop, mobile and print preview.
2. **Stock-licence indemnity wording.** The summary in the s05 imagery table is a generic Modelled statement with no registered source, and the author has a COI. The author should confirm it is fair.
3. **Getty tracker facts.** The author should confirm the dismissed secondary copyright claim and the narrower trade mark claim upheld, plus the 2026-10-11 date, against the tracker page.

## Gaps Summary

No gaps. All five success criteria and all 12 requirements are evidenced in the code and on the live page. Status is human_needed only because of the three author and visual checks above.

_Verifier: Claude (gsd-verifier)_

## Addendum 2026-10-24

The status line above is unchanged. Disposition of the human items, none of which were performed:

1. Visual and print review of s03-s08: dropped by author (not performed). Author decision 2026-10-24: "Drop the legal review entirely and remove the flag. Drop those UAT items. Keep going other than that."
2. Stock-licence indemnity wording and conflict of interest: moot, content removed in quick task 261024-s14.
3. Getty tracker facts: moot, content removed in quick task 261024-s14.

This is not a pass. See 02-HUMAN-UAT.md.
