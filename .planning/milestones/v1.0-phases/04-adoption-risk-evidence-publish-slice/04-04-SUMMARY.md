---
phase: 04-adoption-risk-evidence-publish-slice
plan: 04
subsystem: ui
tags: [s14, risk-blocks, getty, regulation, risk-register, as-at]
requires:
  - phase: 04-adoption-risk-evidence-publish-slice
    provides: plan 03 s14 lead and incident table; plan 02 sources, legal-ref and time rules
provides:
  - s14 five risk blocks, each with answer-first line, Mitigation and dated As-at callout
  - Getty v Stability sub-section (h4#s14-getty) with repeated COI note and claims table
  - Regulation block (EU Article 50, ASA, FTC) and six-row risk register
  - .risk, .asat, .mitigation CSS
  - legal-s14-copyright, legal-s14-getty, legal-s14-regulation, legal-s14-agent-liability ids
affects: [04-05]
key-files:
  modified:
    - site/index.html
    - site/assets/style.css
    - test/page.test.js
    - test/style.test.js
key-decisions:
  - "Each risk block is a div.risk wrapping its h3; the Getty h4 sits inside the IP block"
  - "The Getty permission-to-appeal date is stated as December 2025 only, in a time datetime of 2025-12, because trackers differ by a day"
  - "Agent liability id sits on the register row th, not on prose"
requirements-completed: [CLOSE-01]
duration: 30min
completed: 2026-10-24
---

# Phase 4 Plan 4: s14 risk blocks, Getty and regulation Summary

s14 is now complete: five candid risk blocks with dated as-at callouts (including the neutral Getty v Stability treatment with the COI note repeated directly above and the exact EU Article 50 state of play) and a six-row risk register graded Speculative.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1. Risk structure, CSS, blocks 1-3, register | e19228d | slop, fatigue (abstract-level Parasuraman and Manzey), Goodhart; register with six rows; CSS |
| 2. IP and Getty, Regulation, budget, legal ids | c603a06 | Getty h4 with COI above, claims table, regulation block, s14 prose budget, four legal ids |

`node --test`: 315 pass, 0 fail. `node scripts/smoke.mjs`: no FAIL. s14 prose is about 1,250 words outside tables (budget 1,200-1,600).

## Deviations from Plan

- **Test fix (not a code deviation).** My first register colour check matched "red" inside ordinary words; it now uses word boundaries.
- **No data.js change needed.** All dates used (2026-08-02, 2026-12-02, 2025-05-29, 2024-08-14, 2025-11-04, 2025-12) were already in register rows, so the time test held without edits.
- **December 2025 as `<time datetime="2025-12">`.** Satisfies the numeric gate and matches the register's 2025-12-16 and 2025-12-17 text by substring.
- **Slop and Goodhart as-at cites.** Slop cites the Coca-Cola and Guess incident rows; Goodhart cites the Gartner 2025 CMO survey row (self-reported capacity-to-produce-more-content return, as noted in RESEARCH V6). These are the closest register rows; no new sources were added.
- **No FTC and influencer mention at all**, rather than a negated sentence, so the pinned test cannot misread it.

## For human UAT and legal review (Plan 05 and Plan 08)

The author is a Getty employee: the Getty sub-section wording (claimed, held, no characterisation) needs the author's own COI check. Legal statements carry ids legal-s14-copyright, legal-s14-getty, legal-s14-regulation and legal-s14-agent-liability. The EU Article 50 wording rests on the PE-CONS text and an unofficial consolidated Article 50 page; the Official Journal date was not used. Re-check before 2026-11-07 (T-04-10).

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

Commits e19228d and c603a06 exist; tests and smoke green; `id="s14-getty"` once, `class="callout coi"` three times, four `legal-s14-` ids, only pinned legal-ref texts.
