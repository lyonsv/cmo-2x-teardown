---
status: partial
phase: 04-adoption-risk-evidence-publish-slice
source: [04-08-PLAN.md, 04-06-SUMMARY.md, 04-07-SUMMARY.md, 04-05-SUMMARY.md, 03.1-UI-REVIEW.md]
started: 2026-10-24T00:00:00Z
updated: 2026-10-24T00:00:00Z
---

## Current Test

Not auto-passed: requires a human. Every item below is pending. Phase 2 and Phase 3 HUMAN-UAT items (03-HUMAN-UAT.md and the Phase 2 list) remain open and are not closed by this file.

Scope note: quick task 261024-s14 removed the COI note and all Getty v Stability content from the page at the author's request. There is no COI note and no Getty text left to check, so the earlier "COI check of the Getty text" item is dropped and the legal flag no longer sits under a COI note.

## Tests

### 1. Screen reader pass (VoiceOver plus one other)
expected: Calculator summary output announces once per edit; tables read caption then headers; the legal flag reads in order before the summary
result: [pending]

### 2. 200% and 400% zoom
expected: No loss of content or function; tables and figures scroll in their named regions
result: [pending]

### 3. Real devices at 320 and 375 (one iOS, one Android)
expected: No horizontal page scroll; no focus zoom on inputs; targets usable
result: [pending]

### 4. Grayscale print preview readable by a CFO
expected: Status labels distinguishable without colour; legal flag on page 1; tables not clipped
result: [pending]

### 5. Tone of s13 (adoption) and s14 (risk)
expected: Analytical, sceptical, British English; no alarmism
result: [pending]

### 6. Incident wording and the two status judgement calls
expected: Incident wording fair and sourced; Coca-Cola Disputed and Guess Established are defensible (RESEARCH A2)
result: [pending]

### 7. Legal wording review by counsel
expected: Counsel reviews using .planning/LEGAL-REVIEW.md; only the author removes the page flag afterwards
result: [pending]

### 8. Vendor statements in s12 checked by status and phrase only
expected: Each statement matches the status and phrase in the source (RESEARCH A6)
result: [pending]

### 9. Sources whose re-check failed (04-05)
expected: Each stamped "Re-check failed 2026-10-24" row is acceptable or replaced: gartner-2025-cmo-spend, gartner-2026-cmo-spend, nyu-emory-ai-ads-2025, kohavi-2013 (phrase not in PDF text), eu-ai-omnibus-2026-1744 (phrase not found), parasuraman-manzey-2010 (403). The getty-v-stability-uk row from the 04-05 list was removed by 261024-s14.
result: [pending]

### 10. Pinned automated-check exceptions for human review
Read from the source files on 2026-10-24.

scripts/crosscheck.mjs JUSTIFIED_UNREFERENCED (register rows no page link points at):
- asm-sampling-rate: A review-model assumption shown only in the register because the calculator does not expose it.
- asm-escalation-rate: A review-model assumption shown only in the register because the calculator does not expose it.
- asm-reviewer-rate: A cost-model assumption shown only in the register because the calculator does not expose it.
- asm-ai-share-variant: A cost-model assumption shown only in the register because the calculator does not expose it.

test/a11y-static.test.js TABLE_EXCEPTIONS: none ({}).

test/a11y-static.test.js FIGURE_EXCEPTIONS:
- "Figure 8 Baseline against 2x for your numbers. Each panel ha": The live calculator chart redraws from the results table directly above it in the same section, and its caption sends the reader to that table for the exact values.

test/a11y-static.test.js SECTION_LABEL_EXCEPTIONS:
- answer: The summary block is a single answer paragraph with no heading, so it is named by aria-label="Summary".

scripts/a11y.mjs / 04-07 (inspected exceptions):
- Matrix sticky header (Pitfall 7): no tab stop was covered, so no exception was needed.
- Inline-link target exception for chips and cites (WCAG 2.5.8): count 0, not exercised.
- `.skip` is excluded from the 320px overflow check because it is parked at left:-9999px until focused.
- Calculator inputs draw the focus ring on `.control:focus-within`; the script accepts the ring on that ancestor.
- `.status-disputed` has a double border on screen; the print rule is a pin only.
- Print page ceiling 100 pages (measured 83 on 2026-10-24; 87 at 04-07).

expected: Each exception is acceptable
result: [pending]

### 11. Phase 03.1 UI-review advisory: 37-character label fit at 320, 375 and 768
Headline label "Campaign-markets launched per quarter" in the s01 metric trio, the Figure 1 panel label and the live chart (Figure 8) panel. Headless Chrome cannot give valid 375 captures, so this needs a real viewport. Judgement items only; not fixed unless an automated gate fails. Note: plan 04-08 changed the live chart panel label to the serif stack because the mono label overflowed the viewBox under the WCAG 1.4.12 text-spacing check.
expected: No label clips or collides with bars; the trio label wraps cleanly to two lines on narrow viewports
result: [pending]

## Summary

total: 11
passed: 0
issues: 0
pending: 11
skipped: 0
blocked: 0

## Gaps
