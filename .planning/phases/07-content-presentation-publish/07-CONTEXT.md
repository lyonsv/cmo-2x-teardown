# Phase 7: Content, Presentation & Publish - Context

**Gathered:** 2026-10-25
**Status:** Ready for planning
**Mode:** Orchestrator decisions (author away, best judgement; author approved the merge of former Phases 7–10 and an interim publish). Sources: `.planning/v2.0-BRIEF.md` (the spec, esp. s2, s5, s6, s8–s11 and the Final test), `.planning/research/INTERCOM.md`, `ARCHITECTURE.md` (component table, s5 slice, s7 worked example, s8 diagram spec), `FEATURES.md` (W1–W10, s5 metric, s11 scorecard), `PITFALLS.md`, `SUMMARY.md` Decisions 1–8; Phase 5 and 6 CONTEXT/SUMMARY files; `05-UI-SPEC.md` (design contract for the whole v2 page); `05-UI-REVIEW.md` follow-ups.

<domain>
## Phase Boundary

Write all new reader-facing content into the Phase 5 scaffold, present the Phase 6 engine outputs, update the comparison section, then validate and publish. Lean workflow: one plan set, `node --test` + crosscheck per commit, one `scripts/gates.sh` run per wave end, one consolidated code review + fix before the final publish, one interim publish.

</domain>

<decisions>
## Implementation Decisions

### Writing
- Voice: a practical engineering and business leader; plain English; short sentences; no invented terminology; banned-jargon test stays green. Every number is a `data-fig` bound to a claim with a grade chip (one chip per sentence, weakest grade) — no hand-typed numbers. The central chain "software built → autonomy enabled → human work reduced → marketing capacity increased → business outcomes improved" appears on the first screen and is the spine of every section; each section states where evidence stops and hypothesis begins.
- Depth by disclosure: body sections stay short and scannable; detail goes in `<details>` blocks, tables and appendices. Do not delete v1 substance — move it (inventory test).
- Vendor neutrality unchanged: vendors only in `#compare` and `#register`. Intercom is the subject of `#autonomy` and may be named there (update the Intercom-mention test deliberately); its tools are named by category.

### Section order and titles (9 body sections + appendices, ids from Phase 5)
- `#opportunity` 01 "What 2x means": first screen (thesis, the system, measurable ambition, honest-2x headline from the engine: org-wide vs delegated portfolio), 2x definition (primary metric = useful work per marketing FTE-equivalent; speed = objective-to-live; guardrails; outcomes never claimed doubled), capacity/efficiency/effectiveness, why there is no merged-PR equivalent. v1 s01/s02 content becomes concise supporting material here or moves to an appendix.
- `#autonomy` 02 retitled as a question, e.g. "Why hand agents whole workflows?": autonomy ladder (assistance, agentic execution, higher autonomy, outcome-directed) with when higher autonomy is and is not justified; Intercom evidence (measured and why, company-reported results table with dates, demonstrated vs uncertain, the bottleneck moved, transferable-principles table incl. what does not transfer).
- `#build` 03 "What needs to be built": 60-second plain-English block first; six parts summary; ten-capability table (body: condensed; full columns in `<details>`); build-and-own / integrate / platform-provided (by category); permission levels read/draft/stage/publish/spend beside T0–T3; always-human decisions; smallest useful slice; E0–E5 expansion path. v1 s04 material folded in or moved to appendix.
- `#supply-chain` 04 "The first workflow": the chain objective → research/plan → brief → create → adapt/localise → review → publish/activate → measure → optimise/refresh; the two-variant SVG diagram per ARCHITECTURE s8 (`fig-flow`, `flow-wide` 720×500 + `flow-narrow` 300×~900 switched by CSS, print uses wide or narrow whichever stays ≥ ~8pt; new `test/flow.test.js`); stage-by-stage responsibilities table; worked example "launch the approved campaign in three additional markets" (ARCHITECTURE s7) with hours/handoffs bound to engine claims; why removing handoffs beats faster generation; wedge into a broader system. v1 s03 factory content moves to appendix A area or is retired with reason in `retired.json`.
- `#economics` 05: honest-2x panel; workflow inventory W1–W10 (eight brief fields; body table condensed, full in `<details>`) with prioritisation scores; per-workflow current vs agent-enabled table (pilot slice W2/W4/W5/W6 in full, others roll-up) with evidence classes; scenarios A/B/C side by side (C default) with investment and payback; released-hours reconciliation and reviewer bridge (baseline slack separate); scale vs programme split; sensitivity (tornado table or simple bar figure); the calculator (`#s11`) rewired to A/B/C with legacy `scenario=` mapping, keeping inputs, share link and show-the-maths; "fully loaded" mislabel removed.
- `#outcomes` 06: causal chain with a visible evidence-boundary marker after "shorter objective-to-live"; three-tier scorecard (business outcomes, operating economics, autonomy and quality) with units and measurement sources; diminishing returns (Shapiro et al., Lewis & Rao) and the four defensible outcome mechanisms; falsifier retained.
- `#expansion` 07: adjacent workflows (from v1 s09 levers and FEATURES W7–W10) on the same infrastructure; reusable vs domain-specific table.
- `#roadmap` 08: 12-week pilot (workflow and why = market-expansion launch slice W2/W4/W5/W6; software; integrations; baseline time study weeks 1–3; "stage" ceiling; targets and acceptance criteria graded hypothesis), next two quarters (E1–E3), 12-month portfolio combined via engine pooling (no double counting), clearly separated from proven pilot results; enablement (training, trust, permissions, accountability, role redesign: reviewer → eval curator, coordinator → workflow owner, small platform team); v1 s13 Backlog 0 content kept.
- `#risks` 09: v1 s14 plus irreversible publication, contested ground truth, compounding error, judge drift, inference/token spend, Goodhart on autonomy %, labour relations, model regressions — each with mitigation or test.
- `#compare` E: add a dated sub-table "What major suites and channels already automate" (ARCHITECTURE platform landscape) with sources, "announced" where GA is unconfirmed, new register rows.
- Remove all "Detail to follow" markers as sections fill; apply 05-UI-REVIEW follow-ups (legend retitle + evidence key label + "grade and evidence are independent" sentence; rename six "Evidence grade" headers to "Grade"; source register URL column width so Evidence is visible at 1440px; hosted h3 visual weight; divider spacing; appendix h2s say "Appendix").

### Publish
- Interim publish (push to origin/main → pages.yml deploys) after the opening sections (#opportunity, #autonomy, #build) and #supply-chain with the diagram are complete and `scripts/gates.sh` is green. Final publish after everything, one consolidated code review + fixes, gates green at desktop and 320px, and W3C Nu 0 errors (curl to validator.w3.org/nu). Never force-push. Confirm the deploy run succeeds and live HTML equals local.

### Claude's Discretion
- Exact prose, table layouts within the UI-SPEC tokens, which v1 paragraphs are summarised vs moved, chart form for sensitivity.

</decisions>

<code_context>
## Existing Code Insights
- Page `site/index.html` (Phase 5 scaffold: 16 sections, hosted v1 blocks as `div.subsection` with v1 ids); `site/assets/style.css` tokens; `site/js/data.js` claims/assumptions/evidence; `calc.js`/`workflows.js` (Phase 6); `model.js` + `ui.js` + `state.js` calculator; `svg.js` helper; diagrams in hosted v1 blocks (Figures 2–7) with `test/diagram.test.js`.
- Guards: inventory (`test/fixtures/v1-inventory.json`, `retired.json`), anchors, jargon, share links, evidence pairs, numeric gate, vendor regex (`test/page.test.js`), crosscheck.
</code_context>

<specifics>
- The brief's "Final test" list is the acceptance bar for the opening sections.
</specifics>

<deferred>
- Full editable inputs for every workflow; browser gates in CI.
</deferred>
