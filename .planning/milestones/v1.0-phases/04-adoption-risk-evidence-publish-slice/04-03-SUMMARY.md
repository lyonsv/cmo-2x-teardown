---
phase: 04-adoption-risk-evidence-publish-slice
plan: 03
subsystem: ui
tags: [s13, s14, adoption, backlog-0, incidents]
requires:
  - phase: 04-adoption-risk-evidence-publish-slice
    provides: plan 02 sources, context assumptions, time rule
provides:
  - s13 Adoption and Backlog 0 (table, human-only list, role shift, queue-age SLA block)
  - s14 lead, status legend and five-row incident table
  - .backlog0 and .status CSS
affects: [04-04, 04-05]
key-files:
  modified:
    - site/index.html
    - site/assets/style.css
    - test/page.test.js
    - test/style.test.js
key-decisions:
  - "Backlog 0 is defined as a queue-age SLA with N tied to asm-backlog0-days via data-fig and a linked Modelled chip"
  - "Incident status carried by word plus border style (solid, dashed, double), never colour"
requirements-completed: []
duration: 25min
completed: 2026-10-24
---

# Phase 4 Plan 3: s13 adoption and s14 incidents Summary

s13 now explains adoption and defines Backlog 0 as a queue-age service level, and s14 opens with five verified, statused public incidents.

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1. s13 Adoption and Backlog 0 | 91d6743 | adoption table, what stays human, `.backlog0` block, prose budget 400-700 |
| 2. s14 lead, legend, incident table | 0dee56e | five incidents, `.status` variants, later-note guard replaced |

`node --test`: 308 pass, 0 fail. `node scripts/smoke.mjs`: no FAIL.

## Deviations from Plan

- **[Rule 3 - Blocking] Numeric gate and "Backlog 0".** The mandated phrase "Backlog 0" tripped the numeral gate. The gate now strips the exact phrase `Backlog 0` (like tier names). ALLOWED_NUMERIC_TOKENS is unchanged. Section references in prose are links (`<a href="#s07">section 7</a>`), which the gate already exempts.
- **Closing sentence.** Used "Replace the service level with your own; the rest of your numbers go in section 11." instead of the UI-SPEC "Set your own service level in section 11", because the s11 calculator has no N input.
- **Date cells.** Full-date events use "D Month YYYY" visible text, per the strict 04-02 time rule; only the Guess event uses "Month YYYY" (`2025-08`).
- **Status count.** `class="status status-` appears 8 times (5 table rows plus 3 legend terms), not 5; the legend uses the same marker so the cue is learned before the table.
- Skeleton tests: with both s13 and s14 filled in this plan, the two skeleton tests were replaced by one "no section carries the later note" test at the end of Task 2.

## For human UAT and legal review (Plan 08)

Judgement calls (RESEARCH A2): Coca-Cola is marked Disputed (company statement versus press on reception); Guess is marked Established for the narrow facts only (advert credit and agency role; no Vogue or Guess statement is used). McDonald's is described as published on its Dutch online channel, with no platform name. Dropped items from RESEARCH V1 stay dropped. All incident text is neutral past tense, with no quantities.

## Known Stubs

None. s14 is intentionally incomplete (risk blocks arrive in Plan 04); it has no later-note and no prose budget yet.

## Threat Flags

None.

## Self-Check: PASSED

Commits 91d6743 and 0dee56e exist; tests and smoke green.
