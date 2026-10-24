---
phase: 02-factory-spine-slice
audited: 2026-10-24
baseline: 02-UI-SPEC.md
overall: 18/24
scores: {copywriting: 3, visuals: 3, color: 3, typography: 3, spacing: 3, experience: 3}
screenshots: desktop 1280px only (headless Chrome, scratchpad; not committed). Mobile/print not verified.
---

# Phase 2 UI Review (advisory)

Recorded by the orchestrator from the gsd-ui-auditor report (the auditor returned findings without writing this file).

Phase 1 carry-over fixes confirmed: strong/b 600, metric-trio labels, row headers ink/normal case, Figure 1 min-width 800px at ≤960px, copy nits (except one s02 "budgets are not rising" sentence).

## Priority fixes (all WARNING)

1. Table numbers: `td.num` 12px mono sits ~4px above serif row labels; add tabular-nums + baseline alignment. `tr.total` has no CSS (spec wants 600-weight total row with top rule). Emphasise "134.5% over capacity".
2. Tier table "model default" tag splits the share cell into three lines; put default first ("55% [model default]"), range on the next line.
3. Dead CSS: `th.tier` loses to `tbody th[scope=row]`; use `tbody th[scope=row].tier` so T0–T3 render mono.
4. Section length: s05, s07, s08 likely over the 700-word budget; trim or record an exception.
5. Capacity wording: prose quoting 100.1% / 111.3% lacks "over capacity"; 28.4% and 111.3% carry the company-reported flag but no grade chip.
6. Figure 4 fork: only the auto-approve arrow is accent; Figure 5 "Pass" box has no outward arrow; Figure 6 sits alone with wide margins.

## Minor

- Telemetry bullet punctuation inconsistent.
- s02 "budgets are not rising to meet the ambition" beside 7.7%→7.8%.
- Chip total now 150 (86 links, 64 spans); check s02 per-paragraph max of 3.

## Not verified

Figures 2–7 at 320/375/768px, Figure 1 on phones, print preview; s12/s15 carry-over copy; s02 per-paragraph chip counts.
