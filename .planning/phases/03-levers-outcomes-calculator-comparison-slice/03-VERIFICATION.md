---
phase: 03-levers-outcomes-calculator-comparison-slice
verified: 2026-10-24T00:00:00Z
status: human_needed
score: 5/5 roadmap success criteria verified (automated); 19/19 requirement IDs satisfied in code
overrides_applied: 0
human_verification:
  - test: "Read s12 (Gradial, AirOps, Profound) as each vendor would"
    expected: "Every claim is sourced, dated, and fairly worded; 'not publicly documented' is used rather than 'does not exist'; no vendor would call it a misrepresentation"
    why_human: "Vendor fairness and tone cannot be judged by grep; the preview checkpoint was auto-approved by the orchestrator"
  - test: "Read the 17 U.S.C. 504(c) tail-risk illustration in s09 and the s12 admission wording"
    expected: "Legal wording is accurate, clearly illustrative, and graded Speculative; no legal advice implied"
    why_human: "Legal wording needs review (formal legal flag is scheduled for Phase 4)"
  - test: "Read s09 and s10 copy (levers, experimentation win-rate framing, outcome scorecard, how lift is proven)"
    expected: "Tone is credible to a CMO and CFO, and the 10-33% range is presented as a definition effect, not a target"
    why_human: "Editorial tone and persuasiveness"
  - test: "Use the s11 calculator by hand on desktop and a phone (change inputs, switch scenarios, copy and open a share link)"
    expected: "Layout, chart and results feel right and are legible; the 'what you must believe' panel reads sensibly after the CR-01 sensitivity change"
    why_human: "Visual and UX quality; REVIEW-FIX flags CR-01 and WR-01 as 'requires human verification' for logic changes"
---

# Phase 3 Verification

**Goal:** A reader can see the five other levers and the outcome case, run their own numbers through the calculator, and see fairly how the approach compares to Gradial, AirOps and Profound.
**Re-verification:** No, initial.

## Evidence run in this session

| Check | Result |
|---|---|
| `node --test` | 293 tests, 293 pass, 0 fail |
| `node scripts/smoke.mjs` (local, headless Chrome) | all 14 cases PASS (a to n) |
| `node scripts/smoke.mjs https://lyonsv.github.io/cmo-2x-teardown/` | all 14 cases PASS against the live page |
| Live HTML vs `site/index.html` | byte-identical (`diff` clean) |
| Leftover processes (http.server, Chrome) | none |
| Debt markers (TBD/FIXME/XXX) in `site/` | none |
| Git working tree | clean |

## Success criteria

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Levers localisation, experimentation, insight, ops (504(c) tail-risk), AEO/GEO with metric, argument, grade | VERIFIED | `<section id="s09">` (line 623) holds the lever blocks; 504(c) table at line 699; win-rate table at lines 656-664 backed by `data.js` winrate-* entries: 12% vendor, 33% company paper, 10% second-hand, so the sourced range is 10-33% (supersession honoured; no 12-36% on the page) |
| 2 | Outcome scorecard across four dimensions and how lift is proven | VERIFIED | `s10` (line 735); holdout text present; backed by OUTC-01/02 tests in `test/page.test.js` |
| 3 | Live calculator, graded assumptions, show the maths, believe panel, weakest-grade inheritance | VERIFIED | `s11` (line 794), `site/js/{calc,model,fields,panels,state,ui,svg}.js`; smoke cases a, k, i; model tests |
| 4 | Break-even, redeploy/hold/reduce with change cost, sensitivity, no NaN/Infinity, URL hash restore | VERIFIED | Smoke b, c, e, f, g, h, j, n; the scenario row shows "Hold, -$53,579"; `test/model.test.js`, `state.test.js` |
| 5 | Comparison matrix, per-vendor text, vendor-claimed flags with URL and date, build-vs-buy, "a design, not a shipped product", vendor names only in s12 and register | VERIFIED | `s12` (line 1128); vendor names appear first at line 1137 (inside s12), then in the register block (lines 1475-1635) and in `data.js` source entries; none in s01-s11. 33 "vendor-claimed" flags; 13 "not publicly documented" uses; line 1133 says the spine "is a design described on this page. It is not a shipped product" |

## Requirements coverage (REQUIREMENTS.md)

LEVER-01..05, OUTC-01, OUTC-02, CALC-01..07 and COMP-01..05 are all marked [x] in REQUIREMENTS.md and each is backed by page content or code located above. No orphaned Phase 3 IDs. CALC-08 and LEVER-06 (Phase 1) are still satisfied: the calc tests pass.

## Regression

Phase 1 and 2 sections s01-s08 are still present. All 15 section anchors exist. The full test suite (which includes the Phase 1 and 2 drift and page tests) passes.

## Review fixes

03-REVIEW-FIX.md reports 22 of 22 findings fixed (CR-01, WR-01 to WR-10, IN-01 to IN-11), and tests went from 287 to 293. The tests and the smoke run pass on the current tree, so I found no evidence contradicting the fixes. I did not re-audit each of the 22 individually.

## Gaps

None found. The only open items are human judgement items, listed in the frontmatter. The preview and push checkpoints were auto-approved by the orchestrator, so they are not counted as human-passed.
