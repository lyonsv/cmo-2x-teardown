# Milestones

## v2.0 Autonomous Marketing Operations (Shipped: 2026-10-25)

**Live:** https://lyonsv.github.io/cmo-2x-teardown/
**Phases completed:** 3 phases (5, 6, 7 — 7 merged from former 7–10 at the author's request), 20 plans. 615 tests, crosscheck, smoke, a11y and print gates green; W3C Nu 0 errors. Source brief: `milestones/v2.0-BRIEF.md`; completion summary: `milestones/v2.0-phases/07-content-presentation-publish/07-COMPLETION.md`.

**Key accomplishments:**

- Page reframed from AI content production to progressively delegating whole marketing workflows to agents; first screen states the thesis, the five-link chain (software built → autonomy enabled → human work reduced → capacity increased → outcomes improved) and the model's honest result.
- New executive-question structure (01 What 2x means … 09 Risks, appendices A–F) with semantic ids; every v1 anchor, figure and calculator share link kept working behind inventory, anchor, jargon and share-link guards.
- Four evidence classes (observed, benchmark, illustrative, hypothesis) on every source, assumption and claim, alongside the grades; unsourced programme hypotheses graded Speculative.
- Tested portfolio engine (`workflows.js`) for W1–W10: per-workflow hours, FTE, labour, agency, AI cost, scenarios A/B/C, investment, sensitivity, reconciliation of released hours with baseline reviewer slack kept separate, one price per role, ~300 generated `econ-*` claims (nothing hand-typed).
- Honest headline: useful work per marketing FTE-equivalent 1.42x organisation-wide and 1.72x on the delegated portfolio at defaults (Speculative); 2x not claimed; scenario C spend rises $11.9M against today; v1 cost per approved asset corrected to $152.18 → $106.38.
- New sections: Intercom evidence (company-reported, demonstrated vs uncertain, bottleneck moved), "What needs to be built" (ten capabilities, build/integrate/platform, permission levels, smallest slice, E0–E5), the content supply chain with a two-variant responsive SVG diagram and worked example, outcomes scorecard with evidence boundary, expansion, 12-week pilot to 12-month roadmap, agent risks, dated platform sub-table.

**Author decisions:** lean workflow (no per-phase UI contract/research/plan-check; one consolidated review before publish); phases 7–10 merged; interim publish after the opening sections. Orchestrator decisions on the author's behalf are listed in `07-COMPLETION.md`.

**Known debt at close:** six review fixes change logic and need human confirmation (CR-01, CR-02, WR-03, WR-04, WR-09, WR-10); three vendor sources failed automated re-check; figures read 1, 3, 2, 4 in page order; evidence-key printing needs a manual check; ~200-page print; browser gates not in CI; no milestone audit run (consolidated review stood in).

---

## v1.0 CMO 2x Teardown (Shipped: 2026-10-24)

**Live:** https://lyonsv.github.io/cmo-2x-teardown/
**Phases completed:** 5 phases (1, 2, 3, 3.1, 4), 43 plans. 378 tests, crosscheck, smoke, a11y and print gates green; W3C Nu 0 errors.

**Key accomplishments:**

- One self-contained, evidence-graded static page (s01–s15), with every number carrying a Benchmark/Modelled/Speculative chip linked to a 107-row source and assumption register, kept honest by a scripted crosscheck that gates deploy.
- Headline reframed (Phase 3.1) to CMO terms: campaign-markets launched per quarter, 50 → 100 at flat budget and headcount, with brief-to-live 11.8 → 7.5 days and cost per approved asset $64.71 → $45.26; variant counts demoted to internal throughput.
- Tested calc engine (`calc.js`) and interactive calculator (s11) with a shareable hash, route choice, over-capacity states shown as demand not delivery, and "what you must believe" sensitivity.
- Factory and build-and-review spine (s03–s08): 10,000+ assets per campaign from a few concepts, review agent, T0–T3 gate, eval harness and telemetry.
- Levers, outcomes and a sourced, dated comparison with Gradial, AirOps and Profound (s09–s12); adoption, Backlog 0, incidents, dated risk blocks and evidence gaps (s13–s15).
- Test-gated GitHub Pages deploy with static and browser accessibility, 320px and print checks.

**Author decisions at close:** COI note and Getty content removed (quick task 261024-s14); legal-review flag and counsel review dropped; all human UAT items dropped (not performed).

**Known deferred items at close:** 7 open-artifact items (1 quick task without status, 4 UAT files, 2 verification files with human items dropped by author), plus tech debt listed in `milestones/v1.0-MILESTONE-AUDIT.md` (browser checks not in CI, cite links lack dates, real-device label fit unchecked, a11y 401/400 focus stops).

---
