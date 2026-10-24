---
phase: 01-foundation-thesis-slice
verified: 2026-10-24T00:00:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open https://lyonsv.github.io/cmo-2x-teardown/ in a browser at desktop and phone width, and print preview"
    expected: "Editorial layout renders, sticky TOC works, Figure 1 SVG panels are legible, chips are readable, print shows each register URL once"
    why_human: "Visual appearance and responsive/print behaviour cannot be verified by grep"
  - test: "Read sections 01 and 02 as a CFO"
    expected: "Prose is persuasive, sceptical in tone, British English, and the reallocation caveat reads clearly"
    why_human: "Prose quality and persuasiveness are subjective"
---

# Phase 1: Foundation & Thesis Slice Verification Report

**Phase Goal:** A reader can open the live page and understand the 2x claim, how it is measured, how every number is graded, and why the CFO should believe the cost story.
**Verified:** 2026-10-24
**Status:** human_needed (all automated checks pass)
**Re-verification:** No, initial verification. Verified against the revised CONTEXT (falsifier OR; flat budget with explicit reallocation).

## Observable Truths

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|---|---|---|
| 1 | Title block, metadata, COI note, grade key with separate vendor-claimed/company-reported flag, answer-first paragraph before s01 | VERIFIED | Live page (HTTP 200, byte-identical to `site/index.html`) shows title, kicker, byline, date, evidence base, subject-org assumptions, `.callout.coi` (iStock/Getty text), grade key with "Says who made the claim. It never raises a grade.", and answer paragraph (~100 words) stating claim, governed-review condition and falsifier, all before s01. |
| 2 | TOC links to all 15 sections | VERIFIED | `id="s01"` to `id="s15"` all present. 15 distinct `#sNN` hrefs. No href points to a missing id. s03 to s14 are anchored skeletons with "Coming in a later update". |
| 3 | s01: metric defined beside concepts and variants per concept, six-lever table, "what 2x does not mean", falsifier | VERIFIED | s01 text defines approved-live variants per head per quarter (83 to 167), unique concepts (1,000 to 1,189), variants per concept (40 to 67), 1.6x tier-weighted sensitivity (not headline), six-lever table with output, outcome and grade columns, "What 2x does not mean", and the revised OR falsifier verbatim from CONTEXT. |
| 4 | s02: Gartner flat-budget framing, fully loaded cost per approved-live asset baseline vs 2x, AI spend as floor, SVG with data table | VERIFIED | s02 has Gartner 7.7%/7.8% Benchmark, 402 CMOs, $64.71 to $41.18 across six components, explicit reallocation paragraph (+$0.71M, 0.9 points, Modelled), AI spend floor with Goodhart, inline `<svg>` with `<title>`/`<desc>` in a `<figure>`, and an always-visible data table. |
| 5 | Every quantitative claim has a linked grade chip; figures from `data.js`; push deploys only if `node --test` passes | VERIFIED | 140 chips are `<a class="chip">` links, all hrefs resolve to register `src-`/`asm-` ids. The 3 non-link chips are in the grade key legend. 67 `data-fig` tags are checked against `data.js` by tests. `pages.yml` has `deploy: needs: test`, and `test` runs `node --test`. `node --test` gives 85/85 pass. Deploy run 40084842503 succeeded per the caller. |

**Score:** 5/5

## Required Artifacts

| Artifact | Status | Details |
|---|---|---|
| `site/index.html` (51 KB, 0 base64, 0 `<script>`) | VERIFIED | Substantive, equals live page |
| `site/assets/style.css` | VERIFIED | Tokens, chip contrast and print tests pass |
| `site/js/data.js`, `site/js/calc.js` | VERIFIED | Pure modules, used by tests and the drift check |
| `site/.nojekyll` | VERIFIED | Present |
| `.github/workflows/pages.yml` | VERIFIED | Test job gates the deploy job |
| `test/*.test.js` (5 files) | VERIFIED | 85 tests pass |

## Data-Flow Trace

Prose numbers are static HTML tagged `data-fig`. `test/page.test.js` and `test/figure.test.js` compare them with `data.js` and `calc.js` output, so drift fails the build. FLOWING.

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Test suite | `node --test` | 85 pass, 0 fail | PASS |
| Live page | `curl` | 200, identical to local `site/index.html` | PASS |

## Probe Execution

No `probe-*.sh` scripts are declared or present. Not applicable.

## Requirements Coverage

| Requirement | Status | Evidence |
|---|---|---|
| SHELL-01 | SATISFIED | Public URL live, `site/` with relative paths and `.nojekyll` |
| SHELL-02 | SATISFIED | Title, metadata and answer-first paragraph before s01 |
| SHELL-03 | SATISFIED | 15-section TOC with working anchors |
| SHELL-04 | SATISFIED | System fonts, tokens, `.sec-head`, `.chip`, no base64 |
| SHELL-05 | SATISFIED | `pages.yml` with `needs: test` |
| CRED-01 | SATISFIED | Grade key plus separate flag that never upgrades a grade |
| CRED-02 | SATISFIED | 140 linked text chips, hrefs resolve |
| CRED-03 | SATISFIED | s01 metric trio and tier-weighted sensitivity only |
| CRED-04 | SATISFIED in Phase 1 scope | COI in the front matter, and s05 skeleton states it will be repeated there. Repeat at imagery and Getty v Stability sections falls to later phases. |
| CRED-05 | SATISFIED | "What 2x does not mean" and the falsifier |
| CRED-06 | SATISFIED | `data.js` is the single source, with drift tests |
| CFO-01 | SATISFIED | Gartner 7.7%/7.8% Benchmark with the survey caveat |
| CFO-02 | SATISFIED | Six-component cost for baseline and 2x |
| CFO-03 | SATISFIED | AI spend as a floor, with Goodhart |
| CFO-04 | SATISFIED | Inline SVG plus data table |
| LEVER-06 | SATISFIED | Six-lever table in s01 |
| CALC-08 | SATISFIED | `calc.test.js` covers identity, monotonicity, golden cases, edge inputs and cost per asset falling with volume |

All 17 IDs are marked Complete in REQUIREMENTS.md and map to Phase 1. No orphaned requirements.

## Anti-Patterns Found

No TBD, FIXME or XXX markers in `site/`, `test/` or `.github/`. No stubs found. The skeleton sections s03 to s14 are intentional and in scope per CONTEXT.

## Human Verification Required

1. **Visual, responsive and print check of the live page.** Expected: layout, Figure 1 legibility and print output are as designed. Why human: visual.
2. **CFO-reader read-through of s01 and s02.** Expected: prose is credible and clear, including the reallocation caveat. Why human: subjective.

## Gaps Summary

No gaps. All five roadmap success criteria and all 17 requirements are met in code and on the live page. The status is `human_needed` only because visual and prose-quality checks cannot be automated.

---

_Verified: 2026-10-24_
_Verifier: Claude (gsd-verifier)_
