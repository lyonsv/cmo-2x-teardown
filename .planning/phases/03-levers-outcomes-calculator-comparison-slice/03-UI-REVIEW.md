---
phase: 03-levers-outcomes-calculator-comparison-slice
audited: 2026-10-24
baseline: 03-UI-SPEC.md
overall: 17/24
scores: {copywriting: 3, visuals: 2, color: 3, typography: 3, spacing: 3, experience: 3}
screenshots: captured via CDP at 1280, 375 and 320 (s09-s12), plus over-capacity, invalid and print states; scratchpad ui03/, not committed. 1280px images read by eye; 375/320 checked by DOM measurement (no horizontal overflow, scroll regions) but not read by eye.
---

# Phase 3 UI Review (advisory)

Audit of s09-s12 and the calculator. Findings are classified BLOCKER or WARNING; no BLOCKER found, but two contract defects are close to it (1 and 2).

## Pillar scores

| Pillar | Score | Key finding |
|---|---|---|
| 1. Copywriting | 3/4 | Contract copy is largely verbatim; "only -$53,579" sentence is confusing; summary redundancy |
| 2. Visuals | 2/4 | "Show the maths" has no disclosure marker; radios 13px not 24px; all-identical chips flatten hierarchy |
| 3. Color | 3/4 | Accent kept to links, 2x bars, focus; no red; 9 of 9 results rows share the same Modelled chip so grade colour carries no information |
| 4. Typography | 3/4 | Only the four sizes and two weights (measured); Phase 2 carry-over of 12px mono numbers beside 17px serif labels is unresolved |
| 5. Spacing | 3/4 | 4px scale respected; sub-24px inline link targets and 13px radio marks; no overflow at 320/375/1280 |
| 6. Experience Design | 3/4 | States are well covered (invalid, over capacity, infeasible, reset, share blocking); a few spec deviations |

**Overall: 17/24** (Phase 2 was 18/24; carry-over items 1 and 3 below are still open).

## Top priority fixes

1. **WARNING: "Show the maths" is not recognisable as a disclosure.** `details.maths summary` uses `display:flex` (style.css:175), which removes the native marker (measured: display flex, no visible triangle; screenshot shows plain bold text). A CFO will not know it expands. Fix: add a `::before` text marker ("+" / "-") or keep `display:list-item` with `min-height:48px` via padding.
2. **WARNING: Scenario radios are 13x13px, spec says 24px** (measured; 03-UI-SPEC "native radio 24px"). The 48px label row keeps the target usable, but the visible mark is small beside 48px inputs. Fix: `.radio input{width:24px;height:24px}`.
3. **WARNING: carry-over from Phase 2 not fixed: numbers are 12px mono next to 17px serif row labels** in results, scenario and sensitivity tables, and "Not applicable" cells are 17px serif in the same rows as 12px mono numbers (screenshot s11 results table). Rows look uneven. Fix: render "Not applicable" in `td.num` style and `--muted`, and consider 17px mono for `td.num` in the results table (still within the four sizes).
4. **WARNING: Hold sentence reads wrongly.** "Hold changes annual production cost by only -$53,579" (index.html:998) puts "only" before a minus sign; a reader cannot tell if it is a saving. Rephrase: "Hold lowers annual production cost by $53,579" (sign from data), keep the chip.
5. **WARNING: the same grade chip repeats 49 times in s11** (9 results rows, 6 scenario rows, 5 sensitivity rows, 22 form chips, believe and maths). All are Modelled, so the chip adds noise, not information. Consider showing the chip only where the weakest grade differs, or collapse the results Grade column into the table note. The Phase 1/2 chip density rule is breached in s11.
6. **WARNING: over-capacity summary is redundant**: "reviewers over capacity at 186% of capacity" (verified at `#s11?reviewers=4`). Prefer "reviewers over capacity, at 186%".
7. **WARNING: s12 matrix cells are dense**: source ids (`src-gradial-docs-dam`) plus "accessed 2026-10-24" repeat in nearly every cell and wrap to 3-4 lines in 200px columns. Group the date into the caption (already states it) and show the cite only. Word count: s12 about 1,670 including the matrix against a 700-900 budget excluding the matrix; s10 about 680 against 400-600. Record an exception or trim.
8. **WARNING: hints give no units or separators** ("Default 0.8.", "Default 1200.") while the unit sits inside the box; inconsistent with "Default 95%." Add "$0.80" and "$1,200" so the hint matches how the result tables format the same numbers.

## Phase 2 carry-over check

- Resolved: `tr.total` rule exists; `tbody th[scope=row].tier` rule exists (style.css:118); table numbers use `tabular-nums` (style.css:66, 71).
- Not resolved: 12px mono numbers beside 17px serif labels (fix 3); no "over capacity" emphasis weight beyond text. Chip count rises to 91 across s09-s12 (30 + 7 + 49 + 5).
- Not re-checked: s05/s07/s08 word budgets (outside this phase's focus).

## Detailed findings

### Pillar 1: Copywriting (3/4)
- Verbatim to contract: lead, status line ("Showing: page defaults"), no-JS note, share hint, "Run your own numbers" CTA, spine admission callout ("not a shipped product"), absence phrasing ("Not publicly documented", "checked 2026-10-24"). No "does not have" found in matrix cells.
- Error copy verified live: "Error: Campaigns per year: enter a whole number of 1 or more." and heading "Fix 1 input to see results".
- Over capacity renders as "165.4% over capacity", "unbounded (over capacity)", "infeasible: needs more than the 85% T0 + T1 share". No NaN or Infinity in the DOM.
- Issues: fixes 4, 6, 8 above. New copy not in the spec ("Showing: results for your last complete inputs", "Finish entering the inputs before sharing.") reads fine but is undocumented in the contract.
- "Change" for points metrics reads "0.9 points" without a sign, while ratios read "+27%"; inconsistent sign convention in the Change column.

### Pillar 2: Visuals (2/4)
- Focal point of s11 is the summary sentence followed by the results table, as designed. Figure 8 (bars) is the only accent, as designed; the series are named in text, and over-capacity labels in text.
- Defects: fixes 1, 2, 5. Figure 8 sits in a 360px column with a large empty area to its right under only one short paragraph; value labels at x=200 float 60-100px from the short bars, so bar and value are visually detached. The "100% capacity" label shares a line with the panel label and is crowded.
- Matrix: spine column is correctly shaded and labelled "(design)"; sticky first column works. Vendor panels are text-only dl as specified.
- Icon-only buttons: none. Aria labels on all scroll regions present.

### Pillar 3: Color (3/4)
- Accent only on links, the 2x bars, focus rings and the Benchmark chip class; error uses 3px ink border and a left bar, with no red (verified: border 3px). Hard-coded hex values in the new CSS appear only in the print block (`#bbb`, `#000`, `#555`, per spec).
- Warning: grade colour is uniform (all Modelled, ochre) across s11, so colour and chip carry no discrimination. See fix 5.

### Pillar 4: Typography (3/4)
- Measured computed styles in s09-s12: 12/400, 12/600, 16-17/400, 17/600 (16/600), 25-31/600. Only the declared four sizes and two weights. Inputs 17px (16px and under 720px at 320 and 375; never below 16px).
- Warning: the table number/label mismatch (fix 3). The sensitivity table's group headers (`colgroup`) have an underline that stops short of the Input and Grade columns, so the header band looks broken (screenshot).

### Pillar 5: Spacing (3/4)
- Scale tokens used (4/8/16/24/32/48/64). No arbitrary values in the new CSS apart from `margin: 0 0 8px` on `dl.vendor-dl dd` (style.css:238, literal not token, same value).
- Measured: inputs 48px high; buttons 48px, full width under 720px (343px at 375, 288px at 320). No page-level horizontal overflow at 1280, 375, 320 (scrollWidth equals innerWidth). Data tables scroll inside their regions at 320.
- Warning: 22 inline links at 22px height (cross-references in s09/s10 prose at 375/320), "assumptions register" link 14px high at every width, and 13px radio marks. Inline text links are exempt from WCAG 2.5.8, but the spec asked for 24px.

### Pillar 6: Experience Design (3/4)
- Verified live: invalid field shows the 3px border, field message, alert summary and em-dash "not available" cells; the chart is replaced (`chart-empty` shown); focus stays on the field; no hash change. Copy and Reset behave (reset moves focus to `#in-campaigns`, hash cleared, "Showing: page defaults"). Over-capacity is treated as valid and labelled in the chart (`over capacity`) and table. Reduce scenario changes the people cost line.
- JS-off and failed setup keep the static default scenario (smoke cases d and m pass per 03-REVIEW-FIX).
- Warnings: first-year net cost for the default Redeploy scenario is +$1.1M (cost increase), shown without any prompt, so a reader who expects "2x" to be a saving gets no explanation near the table; fix 1 and the copy in fix 4 would help. The per-cell "capped" marks on the sensitivity table (e.g. "-1.5% capped") are small mono text only.
- Registry audit: not applicable (no shadcn, no third-party blocks).
- One transient I could not reproduce: after an invalid field (campaigns=0) followed by a same-document navigation to `#s11?reviewers=4`, the results stayed "not available" in one run; a fresh load of the same URL behaved correctly. Worth a manual check of the hashchange path with an invalid field.

## Not verified

375px and 320px screenshots were not examined by eye (DOM measurement only). Screen reader behaviour, 200% zoom, JS-off screenshot and print preview of s12 not examined; the print screenshot (s11, emulated print media) was captured but not read.

## Files audited

site/index.html (s09-s12), site/assets/style.css, site/js/ui.js (via behaviour), 03-UI-SPEC.md, 03-CONTEXT.md, 03-REVIEW-FIX.md, 03-11-SUMMARY.md, 02-UI-REVIEW.md, scripts/smoke.mjs (pattern).
