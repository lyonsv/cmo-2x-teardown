---
phase: 02-factory-spine-slice
plan: 08
subsystem: publish
tags: [publish, checkpoint, github-pages, legal-recheck]
requires: ["02-07"]
provides:
  - Live Phase 2 page at https://lyonsv.github.io/cmo-2x-teardown/
key-files:
  created: []
  modified: []
requirements-completed: [GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, SPINE-01, SPINE-02, SPINE-03, SPINE-04, SPINE-05, SPINE-06, SPINE-07]
metrics:
  completed: 2026-10-24
---

# Phase 2 Plan 08: Publish Phase 2 Summary

Phase 2 (sections 03-08, Figures 2-7) published to GitHub Pages from a test-gated deploy, after a Getty re-check and the user's explicit approval. No site edits were needed.

## Getty re-check

Unchanged as at 2026-10-24. The ailawsuittracker.com page (last reviewed against court record 2026-05-25, page text reviewed 2026-10-11, footer updated 2026-10-19) confirms the decision of 2025-11-04 ([2025] EWHC 2863 (Ch)), Getty granted permission to appeal 2025-12-16 (secondary copyright), appeal pending, and Stability refused permission on the trade mark findings 2025-12-16. A search found no Court of Appeal hearing or judgment. No edit made.

## Pre-flight

155/155 tests; 0 script tags; 0 base64/data:image; 0 vendor names; 0 absolute href/src paths; `site/.nojekyll` present; clean tree; 39 commits ahead of origin/main at checkpoint.

## Push approval

User reply (verbatim): "approve-push". The option selected was labelled "Taylor Wessing confirms (or I accept the tracker)". The Taylor Wessing article was not independently fetched by automation (403). The user also approved a second, docs-only push for this closing commit.

## W3C Nu (after approval, before push)

0 errors, 0 warnings, 1 info: external stylesheet "assets/style.css" blocked by style-src (known validator artefact from 01-07, not fixed). No markup fixes needed.

## Push and deploy

- `git push origin main` (no force): a25198f..17268fb
- Run id 40106116939 (pages.yml): test success, deploy success (node --test ran first; deploy needs test).
- Live URL: https://lyonsv.github.io/cmo-2x-teardown/

## Live checks (grep counts)

fd2-t 2; fd7-t 2; "Worked example: one campaign" 1; "Imagery sourcing: three routes" 1; "Approval tiers (illustrative)" 1; "Reviewer capacity, 1x and 2x" 1; "What the eval harness reports" 1; "COI note" 1. HEAD == origin/main (17268fb) after the code push.

## ROADMAP Phase 2 success criteria

1. Factory/supply chain/flow SVG figures and shared policy source: live (fd2-t present, Figures 2-4; built 02-02 to 02-03).
2. Variant matrix, derive-not-generate, imagery sourcing with COI note, personalisation block: live ("Worked example: one campaign", "Imagery sourcing: three routes", "COI note").
3. Review agent and T0-T3 ladder with illustrative note: live ("Approval tiers (illustrative)").
4. Reviewer capacity worked example and fatigue controls: live ("Reviewer capacity, 1x and 2x").
5. Eval harness and telemetry join: live ("What the eval harness reports", fd7-t).

## Deviations from Plan

None. Automated source fetches could not reach Taylor Wessing (403); noted above.

## Self-Check: PASSED
