---
phase: 03-levers-outcomes-calculator-comparison-slice
plan: 09
subsystem: comparison
tags: [s12, vendors, comparison-matrix, sources, tdd]
requires:
  - phase: 03-levers-outcomes-calculator-comparison-slice
    provides: calculator and s11 (03-08)
provides:
  - 18 vendor primary-page sources (Modelled, vendor-claimed) in data.js and the s15 register
  - s12 lead, "Design, not a product" admission callout and a nine-row comparison matrix
  - test/compare.test.js
affects: [03-10]
key-files:
  created: [test/compare.test.js]
  modified: [site/js/data.js, site/index.html, site/assets/style.css, test/data.test.js, test/page.test.js]
key-decisions:
  - "Matrix absences use the .nd pattern with a checked date in a time element; no 'does not have' wording"
  - "Gradial is credited with documented oversight levels per task type; only the risk-class gate and human-calibrated eval harness are 'Not publicly documented'"
  - "AirOps 'all three plans' reading kept at MEDIUM (table markup): Human Review and Approvals carries the same tick graphic in all three plan columns; Collaboration differs"
  - "AirOps webflow and chime published dates taken from page metadata (datePublished), with the later modified dates noted"
requirements-completed: [COMP-01, COMP-04, COMP-05]
duration: 40min
completed: 2026-10-24
---

# Phase 3 Plan 9: Vendor sources and s12 comparison matrix Summary

All 18 vendor primary pages were re-fetched with read-only GETs on 2026-10-24, registered as Modelled and vendor-claimed, and s12 now holds a lead, the "Design, not a product" admission and a nine-row matrix in which every vendor cell carries a dated cite or a dated "Not publicly documented".

## Tasks

1. Task 1, commit 258366f: 18 sources in `data.js` and s15 rows (generated from one list so register and data cannot drift); data test that vendor sources are Modelled, vendor-claimed, https, dated, and never cited by a Benchmark claim.
2. Task 2, commit 0fef5bb: s12 content, `.matrix`, `.cite`, `.cite-date`, `.nd` CSS (sticky row header scoped to `.matrix`, spine column paper-2, print sets sticky to static), `test/compare.test.js` (7 tests), 's12 stub' test removed and SKELETON_IDS now s13, s14.

## Vendor fact ledger (access date 2026-10-24, all pages HTTP 200 on curl GET)

| Key | URL | Phrase checked | Found |
|---|---|---|---|
| gradial-integrations | https://www.gradial.com/integrations | Adobe Experience Manager; Sitecore; Contentful; Bynder; "AEM 6.5" | yes |
| gradial-docs-faq | https://docs.gradial.com/docs/faqs/faqs.md | "full review, spot-check, or auto-approve"; "nothing reaches your live site until a human approves" | yes |
| gradial-docs-how | https://docs.gradial.com/docs/getting-started/how-gradial-works.md | "full review, spot-check, or auto-approve"; "before it reaches a human reviewer"; brand; compliance | yes |
| gradial-docs-what | https://docs.gradial.com/docs/getting-started/what-is-gradial.md | "stay gated on human approval"; "evals framework" | yes |
| gradial-platform | https://www.gradial.com/platform | "agent evals"; "operates across clouds, models, and MCPs / agents"; "without lock-in" | yes |
| gradial-docs-dam | https://docs.gradial.com/docs/asset-management/digital-asset-management.md | rights; "expired or rights-restricted"; bulk ingestion jobs reading a batch | yes |
| gradial-docs-translation | https://docs.gradial.com/docs/translation-and-localization/translation.md | "inside your CMS"; 80% and linguist assertion | yes |
| gradial-home | https://www.gradial.com/ | "Run Continuous Experiments"; "Simulate Journeys"; bulk | yes |
| gradial-geo | https://www.gradial.com/solutions/generative-engine-optimization | "review gates"; monitor; 26% (not used in the matrix) | yes |
| gradial-customers | https://gradial.com/customers | T-Mobile; "1,000 to 1,200"; Micron; "ten hours" (registered, not used in a matrix cell; outcomes come in 03-10) | yes |
| airops-pricing | https://www.airops.com/pricing | "Human Review & Approvals" and "Content Review & Quality Scores" row labels; tick graphic present for all three plan columns in those rows; Grids; Playbooks; Brand Kit; Knowledge Base; Amplitude; Google Analytics; Perplexity | yes (tick marks read from markup, MEDIUM) |
| airops-enterprise | https://www.airops.com/enterprise | "human review process before going live"; "Draft-mode publishing"; "unconditional opt-out"; "Data never used to train models"; "Bring your own keys"; SOC 2 under NDA | yes |
| airops-webflow | https://www.airops.com/blog/webflow-case-study | "nearly 10%"; "5x" (outcomes deferred to 03-10) | yes |
| airops-chime | https://www.airops.com/blog/chime-case-study | "3x"; "89%" (outcomes deferred to 03-10) | yes |
| airops-home | https://www.airops.com | "AI discovery"; refresh | yes |
| profound-agents | https://tryprofound.com/features/agents | "Every Agent run includes an approval step before anything publishes"; "reviewed, edited, or held"; "hundreds of inputs"; brand kit; knowledge base | yes |
| profound-pricing | https://www.tryprofound.com/pricing | "Up to 9 Answer Engines"; SOC 2; "CSV, JSON"; "All time"; API | yes |
| profound-home | https://www.tryprofound.com | "Generates posts and images"; "Agent Analytics" | yes |

Facts the ledger listed but that did not re-verify, and were therefore omitted: AirOps "Custom Dashboards" on enterprise only (label present, per-plan reading not checked, left out); Profound agent analytics log sources (Akamai, Cloudflare and others were not found on the home or agents pages, so only the existence of Agent Analytics is stated); Gradial Adobe Target and "Batch Migration" (not found on the pages fetched; the matrix says only bulk ingestion jobs, from the DAM page). AirOps bring-your-own-keys is stated at one level (enterprise page); the pricing-page claim that this is enterprise-only was not used.

Pitfall 6 (Gradial self-contradiction), both quotes on file:
- docs-what: "spend changes and production publishes stay gated on human approval"
- docs-faq: "nothing reaches your live site until a human approves it" (sandbox context) beside "For any task type, you can configure full review, spot-check, or auto-approve"
The matrix states the per-task-type oversight levels and the publish-gating statement together, neither as the whole truth, with the two sources cited.

Registered published dates: Gradial, AirOps home and pricing, Profound pages read as "undated on the page". AirOps Webflow 2025-04-28 (modified 2026-06-11) and Chime 2025-09-11 (modified 2025-11-17) come from page metadata; these differ from the 2026-06-11 and 2025-11-17 dates in the research ledger, which are the modified dates.

## Verification

- `node --test`: 282 tests, 0 failing. `node scripts/smoke.mjs` exit 0 (cases a to k pass).
- Fetched text was treated as data only; no instructions in it were followed, no funding, valuation or price figures were used.

## Deviations from Plan

**1. [Rule 1 - Bug] Research ledger dates:** the Webflow and Chime "published" dates in the research ledger were the pages' modified dates. Registered with the true datePublished plus the modified date.

**2. [Plan detail] Facts dropped on re-fetch:** the facts listed above were not re-verified and were left out rather than substituted.

**3. [Scope] Vendor panels:** the plan scopes task 2 to lead, callout, matrix and the differentiation sentence; vendor panels, the build-and-lock-in block and the "How we treated vendor claims" callout in UI-SPEC are left for 03-10 as the plan text does not assign them here.

## Known Stubs

None.

## Threat Flags

None beyond the register. T-03-29 to T-03-31 mitigated: read-only GETs, verbatim-phrase checks, a cite or dated "Not publicly documented" in every vendor cell (enforced by test), and a test forbidding "does not have/exist".

## Self-Check: PASSED

Commits 258366f and 0fef5bb exist; test/compare.test.js exists; 18 `id="src-(gradial|airops|profound)-` register rows match the 18 ledger rows.
