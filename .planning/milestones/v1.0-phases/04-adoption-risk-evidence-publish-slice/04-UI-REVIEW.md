# Phase 4 — UI Review

**Audited:** 2026-10-24
**Baseline:** 04-UI-SPEC.md (approved), with the author decisions applied: legal flag, COI note and Getty content removed; counsel review and human UAT dropped. 04-REVIEW.md fixes treated as applied.
**Screenshots:** not captured. The live URL returns 200, but this audit is code-only (site/index.html lines 801-1421 and 1421-2354 for s11, s13, s14, s15, and site/assets/style.css including `@media print`). Layout and print claims below are inferred from CSS, not seen.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Spec copy is followed and the voice is honest. Bare `src-…` ids are the link text for every cite, and the evidence-gaps list runs past its brief. |
| 2. Visuals | 3/4 | The status, as-at and Backlog 0 treatments are clear and carry words. The Regulation block is long, and its cite string is hard to scan. |
| 3. Color | 4/4 | No new colour. Status is carried by border style and words. The Speculative and Modelled chips are the only grade colours. |
| 4. Typography | 4/4 | Only 12 / 17 / 31 / clamp sizes and weights 400 / 600 are used. No new sizes. `.status` and `.chip` use the same 12px mono 600. |
| 5. Spacing | 3/4 | Two spec min-widths are missing. `.asat` and `.risk` margins are close to spec but not identical. |
| 6. Experience Design | 3/4 | Keyboard-reachable scroll regions and print rules are in place. Printing a long `.risk` block with `break-inside: avoid` risks large gaps. Evidence of the print layout is code-only. |

**Overall: 20/24**

---

## Top 3 Priority Fixes

1. **Adoption table and risk register have no `min-width`** — the spec sets 720px for both (UI-SPEC Layout & Responsive). `style.css` sets min-widths only for `.matrix` (78), `table.incidents` (189) and the source register (88). At 320-375px the five-column tables will compress into very narrow columns, and the scroll region is never needed. That harms readability of the "First move" and "Mitigation" cells. Fix: add `table.adoption, table.risk-register { min-width: 720px }` (needs a class on the adoption table at `index.html:1306`), and add both to the print `min-width: 0` rule at `style.css:256`.
2. **Print rule gaps for the new tables and long risk blocks** — `.risk` is `break-inside: avoid` (`style.css:254`) and the Regulation block (`index.html:1396-1404`) runs well over the 120-220 word spec (about 330 words, with 5 cites). In PDF this block jumps to a new page and leaves white space, and it contradicts the 84-page count the harness records. Fix: allow `.risk` to break (`break-inside: auto`) and keep only `.asat`, `h3` (`break-after: avoid`) and `.mitigation` unsplit. Trim the Regulation block towards the word budget.
3. **Cite links are raw ids with no date** — every `.cite` reads `src-incident-cocacola-2025` and similar (`index.html:1360-1364`, `1373`, `1403`). The QA contract says cites read "their `src-` id plus date", and a screen-reader user hears an id string. The Regulation as-at line stacks five of them in a 12px mono line. Fix: add the access date (`.cite-date` already exists, `style.css:83`) or give each cite an `aria-label` such as "Source: Coca-Cola holiday adverts, accessed 2026-10-24", and put a visible gap or list structure around multiple cites.

Further issues, in descending severity:

4. **Evidence-gaps list is 12 items, spec says 8 named gaps** (`index.html:2332-2343`). Four extra gaps are fine on content, but several "Would be closed by" clauses run to 25-30 words, near the 35-word cap. The item "Reviewer fatigue in marketing review" duplicates the s14 as-at statement, which is fine, but the list has no grouping. Add a short group label or trim.
5. **`.asat` margin deviates** — spec `margin: var(--s-md) 0`, built `margin: 0 0 var(--s-md)` (`style.css:188`). Because the block sits after `.mitigation`, this is visually fine; flag only as a spec deviation.
6. **Adoption table: all four rows are Speculative**, so the Grade column adds no information (`index.html:1310-1313`). The rule in the Chip density amendment (chips must carry information) argues for a single note, as s11 does. The spec asked for per-row chips, so this is a spec-vs-amendment tension, not a defect. Consider one `grade-note` below the table.
7. **Risk register likelihood and grade are both single-valued in the Grade column** (all six Speculative, `index.html:1411-1416`), same point as 6.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

- s13 lead (`index.html:1303`) and s14 lead (`1346`) match the contract word for word. The s13 closing links to section 11 as specified (`1342`). No exclamation marks. British spelling holds ("optimise", "Localisation").
- Status definitions are tidy after the IN-08 fix (`1350-1352`): the word is in the `.status` marker, and the definition does not repeat it.
- "Mitigation:" lead-in and "As at 24 October 2026:" are consistent across all five blocks (`1372-1403`). "Check again before relying on it." appears on IP and Regulation only. The spec limits it to regulation and litigation, so the IP use is acceptable.
- WARNING: the cite link text is the bare id (see fix 3). Meaningful-out-of-context is a stated QA item.
- WARNING: the IP block opening sentence (`1391`) says "Treat the rights in the data each model was trained on as an open question too, for the vendor and counsel to answer." This is guidance, not a claim, and is acceptable after WR-04, but the word "too" reads as if a prior sentence existed and now doesn't (the Getty text was removed). Reword to stand alone.
- Not-used notes are present (`1884-1885`). The Gartner note is a reduced version of the spec's "not verified against the primary source" reason. Acceptable, but the why is lost.

### Pillar 2: Visuals (3/4)

- s13 focal point: the Backlog 0 panel (`1330-1341`) reads as a distinct block (paper-2 background, rule, 44em), as the spec says. The `<dl>` collapses to one column at <=720px (`style.css:207`).
- s14 focal point: the legend leads the incident table, and rows are newest first. `.status` variants are distinguishable without colour (solid / dashed / 3px double, `style.css:182-184`). At 12px, the dashed vs solid difference on a 1px border is subtle and the double border at 3px is the only strong cue. The word is always present, so this is not a WCAG failure.
- Risk blocks are plain prose, separated by `margin: 32px 0`. This matches the "no boxes, no cards" rule. The cost is a long, text-heavy section (about 1,700 words) with four tables and blocks and little visual rhythm beyond h3 headings.
- WARNING: the Regulation as-at line (`1403`) carries five cites inline and is the longest unbroken mono run on the page. It will wrap raggedly on mobile.
- No icon-only controls were introduced.

### Pillar 3: Color (4/4)

- No new colour or custom property. `.status`, `.asat`, `.gaps` and `.backlog0` use only `--ink`, `--rule`, `--paper-2`, `--muted` (`style.css:36-37,178-188`). There is no `--low` or `--verified` in them, as the style tests demand.
- `style="`: 0 occurrences in index.html. Print overrides use `#000`, `#555`, `#ccc`, hard-coded but confined to `@media print`, which matches the spec.
- Chip use is heavy (about 200 `class="chip` occurrences across the page), but s11 was brought to the cap by the amendment (24 against 25). In s13 and s14 the tables keep per-row chips, all of one value per table, which dilutes the colour signal (fixes 6 and 7). This is a minor note, not a colour error.

### Pillar 4: Typography (4/4)

- Declared sizes only: 12px mono (status, chip, cite, grade-note), 17px (h3, legend title), 31px (h2), clamp (h1); body 16px at <=720px. No new `font-size`.
- Weights are 400 and 600 only. `b`/`strong` map to 600 (`style.css`), which covers `.mitigation b` and `.asat b`.
- No finding that lowers the score.

### Pillar 5: Spacing (3/4)

- Tokens only (`--s-xs` to `--s-3xl`), and the IN-07 fix replaced the last raw 16px in `.backlog0`. `.backlog0` padding is `--s-lg` (24px) as specified, `--s-md` on mobile.
- WARNING: missing `min-width: 720px` for the adoption and risk-register tables (fix 1).
- WARNING: `.asat` margin differs from spec (fix 5).
- `.gaps li { margin: 0 0 var(--s-md) }` and `max-width: 44em` match the spec (`style.css:36-37`).
- The source register keeps its 1040px min-width, reset to 0 for print (`style.css:256`). The Publisher type column sits right after Publisher (`index.html:1429`).

### Pillar 6: Experience Design (3/4)

- Every table is in a `role="region"` with an `aria-label` and `tabindex="0"` (`1305`, `1355`, `1406`), and has a caption and `th scope`. Headings are h2 then h3, with no skipped levels in s13-s15 (`s14-ip` etc. are h3).
- Print: `thead { display: table-header-group }`, `tr { break-inside: avoid }`, `.status` and `.asat` rules, and `th, td { overflow-wrap: anywhere }` are present (`style.css:235-260`). The harness records 84 pages and the legal-flag print rules are rightly absent.
- WARNING: `.risk { break-inside: avoid }` with the longest block (fix 2). Also `.risk-register` and the adoption table are not in the print `min-width: 0` rule. They have no min-width yet, so this is only a future-proofing note once fix 1 lands.
- Static page: no loading, empty or error states apply. The only dynamic piece in this scope is the s11 sensitivity note, which the WR-01 fix now rebuilds from the rows shown. That is an improvement, and covered by smoke case `r` in the review's fix status.
- Not verified here and not auto-passed: the 200% / 400% zoom item, the screen-reader pass, and the grayscale print preview (author dropped human UAT).

Registry audit: not applicable (no shadcn, no third-party registries).

---

## Files Audited

- /Users/vincent.lyons/git/build-and-review/site/index.html (s11 grade notes, s13, s14, s15)
- /Users/vincent.lyons/git/build-and-review/site/assets/style.css (new components, responsive block, `@media print`)
- /Users/vincent.lyons/git/build-and-review/.planning/phases/04-adoption-risk-evidence-publish-slice/04-UI-SPEC.md
- /Users/vincent.lyons/git/build-and-review/.planning/phases/04-adoption-risk-evidence-publish-slice/04-REVIEW.md
