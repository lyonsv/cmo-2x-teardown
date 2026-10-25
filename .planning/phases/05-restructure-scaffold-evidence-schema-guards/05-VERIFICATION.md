---
phase: 05-restructure-scaffold-evidence-schema-guards
verified: 2026-10-25T00:00:00Z
status: passed
score: 5/5 roadmap success criteria verified
overrides_applied: 0
---

# Phase 5 Verification

**Goal:** Page reordered around executive questions without losing v1 links, figures or share links; every figure carries a visible evidence class; guards in place.

## Observable truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Sections in executive-question order, TOC matches, all v1 `#s01`-`#s15` anchors resolve | VERIFIED | `site/index.html` sections: opportunity, autonomy, build, supply-chain, economics, outcomes, expansion, roadmap, risks, appendices, compare, register. All 15 legacy `id="sNN"` wrappers present. `nav.toc` present. |
| 2 | v1 share links incl. scenario=redeploy/hold/reduce restore a scenario in a fixture test | VERIFIED | `test/fixtures/v1-share-links.json`, `test/share-links.test.js`; pass in `node --test`. |
| 3 | Tests fail on lost data-fig/figure, unresolved href="#", banned jargon | VERIFIED | `test/inventory.test.js`, `test/guards.test.js`, fixtures `v1-inventory.json` and `retired.json`; all pass. |
| 4 | Every data.js assumption/claim has an evidence class in an allowed (evidence, grade) pair, enforced by a test; class visible in assumptions table and source register | VERIFIED | `test/evidence.test.js`; `data.js` sets evidence on sources and assumptions; `<span class="ev">` rendered in register rows. |
| 5 | Grade key explains four classes and states nothing is observed for the subject organisation until the pilot; all gates green | VERIFIED | `index.html` lines 45-54 hold the key and the statement. `node --test` 435/435 pass. `crosscheck` 0 failures. `scripts/gates.sh` ended "ALL GATES GREEN" (smoke, a11y, print). No CDP flake rerun needed. |

## Requirements coverage

All nine IDs in PLAN frontmatter (05-01: STRUCT-02..06; 05-02: EVID-01; 05-03: STRUCT-01, 02; 05-04: STRUCT-01, 06; 05-05: EVID-02, 03) are in REQUIREMENTS.md, marked Complete and mapped to Phase 5. No orphans. STRUCT-07 is mapped to Phase 8, correctly not claimed.

- STRUCT-01..06: SATISFIED
- EVID-01: SATISFIED
- EVID-02: SATISFIED for the assumptions table and source register. The economics-table part is accepted scope for Phase 9 (per CONTEXT).
- EVID-03: SATISFIED

## Anti-patterns

No TBD/FIXME/XXX in site, test or scripts. One "TODO" match is a test regex, not debt.

## Notes

The page is intentionally not pushed until Phase 10. No human verification items beyond the manual items gates.sh itself lists (screen reader, real devices, grayscale print), which are not Phase 5 contract.

## Gaps

None.
