---
phase: 04-adoption-risk-evidence-publish-slice
reviewed: 2026-10-24T22:30:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - scripts/a11y.mjs
  - scripts/cdp.mjs
  - scripts/crosscheck.mjs
  - scripts/print.mjs
  - scripts/reverify.mjs
  - scripts/smoke.mjs
  - site/assets/style.css
  - site/index.html
  - site/js/format.js
  - site/js/ui.js
  - test/a11y-static.test.js
  - test/compare.test.js
  - test/legal.test.js
  - test/style.test.js
findings:
  critical: 1
  warning: 8
  info: 8
  total: 17
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-10-24T22:30:00Z
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

I reviewed the Phase 4 changes from `d6aaaa9^..HEAD`:
- the new QA harness scripts (`cdp`, `a11y`, `print`, `crosscheck`, `reverify`, and the `smoke` refactor);
- the `ui.js`, `format.js` and `style.css` edits;
- the new and changed tests;
- the Phase 4 content in `site/index.html`: s11 grade notes, s13 adoption and Backlog 0, the s14 incidents, risk blocks and risk register, the s15 publisher types, re-verification stamps, evidence gaps and not-used notes.

I did not report items the author has already decided: the legal flag and counsel review were dropped, and the COI note and Getty content were removed.

The main problems are content honesty, not code crashes:
- **Backlog 0 contradicts the model.** Its default service level was derived by ignoring the queueing delay that the page's own model calculates. At the page defaults, the model predicts the average brief misses the published target.
- **The sensitivity table loses its links.** `ui.js` no longer rewrites the per-row grade chip. When the live ranking changes, the static grade note links the wrong register rows.
- **Two re-verification stamps are probably false.** `reverify.mjs` searches raw PDF bytes, so two published "Re-check failed" stamps are likely false negatives.
- **One risk claim has no source.** The IP block says the training-data lawsuits are unresolved, but nothing on the page supports this since the Getty content was removed.
- **Grades, statuses and publisher types do not follow the page's own definitions** in several places in s13, s14 and s15.

## Critical Issues

### CR-01: The Backlog 0 default service level contradicts the page's own brief-to-live model

**File:** `site/index.html:1332` (Backlog 0 block), `site/index.html:2304-2310` (`asm-backlog0-days` register row; text from `site/js/data.js:960-961`)

**Issue:** The register says the 5-working-day target "sits just above the modelled build time at 2x plus one review touch (3 days plus 1.5 days, rounded up)". That sum uses the bare review service time (1.5 days) and leaves out two things that `calc.js:144-145` itself adds to every review touch:
- the queueing wait, `service * utilisation / (1 - utilisation)`;
- the rework loop, `(1 + r)`.

At the page defaults (utilisation 61.9% at 2x, rework 15%), the model's review stage is `1.15 × (1.5 + 1.5 × 0.619 / 0.381) ≈ 4.53` days. Brief to live is 7.5 days, and the page shows this figure in s01, s11 and the answer block.

So by the page's own model, the average brief at 2x takes about 7.5 days. Backlog 0 sets a 5-day ceiling on the oldest waiting brief, and its stated rationale includes a review touch. The page therefore presents as achievable a target its own maths says the defaults miss. It also mixes units: the model counts "days", the target counts "working days".

A CFO who compares s11 with s13 will find this inconsistency. It undercuts the "transparent and graded reasoning" core value.

**Fix:** Do one of the following:
- Derive the default from the model, for example build days plus one queued review touch at 2x utilisation, rounded up (about 8 days). Pin it in a test against `compute()`, so the two cannot drift apart.
- Redefine Backlog 0 to stop before review ("first derived set ready for review"), drop "plus one review touch" from the rationale, and say that review queueing is excluded.

In either case, use one unit (days or working days) across s11 and s13.

```js
// data.js: derive instead of hard-coding
const s = scenarioResult; // compute(defaults).scenario
const backlog0 = Math.ceil(s.build_days + (1 + r) * (svc + svc * s.utilisation / (1 - s.utilisation)));
```

## Warnings

### WR-01: The sensitivity grade note goes stale once the live ranking changes (chip update removed from `ui.js`)

**File:** `site/js/ui.js:92-104` (`writeSensitivity`), `site/index.html:1121`

**Issue:** Phase 4 removed the per-row `a.chip` rewrite from `writeSensitivity` and replaced the row chips with one static grade note. That note lists five fixed register rows: markets, master concept cost, auto-approval, review minutes and approval yield.

`model.sensitivity()` (`model.js:271-294`) ranks **all** `FIELDS` by swing and keeps the top `SENSITIVITY_ROWS`. When a reader changes inputs, for example a high `vcost`, `rework` or `campaigns`, another input moves into the table. `writeSensitivity` then rewrites the row label and figures, but:
- that row has no chip and no register link anywhere;
- the note's "Register rows:" list still names an input that is no longer shown.

The grade word happens to stay right only because every field is graded Modelled today. Nothing enforces that at runtime. Every row of this table is a calculator number, so after interaction the page no longer meets the "every number graded, assumptions visible" constraint.

The static tests (`page.test.js` `groupedRows`, `calc-page.test.js`) check only the default HTML, so this cannot be caught.

**Fix:** In `writeSensitivity`, rebuild the note's register-link list and chip from `list.map((r) => r.ref)` and the weakest of `r.grade`. Alternatively, fix the sensitivity set to the five default inputs. Add a smoke case (for example `#s11?vcost=8`) that checks every displayed row's `ref` appears in the note.

### WR-02: `reverify.mjs` searches raw PDF bytes, and the false negatives are published as "Re-check failed"

**File:** `scripts/reverify.mjs:47,70`; `site/index.html:1461` (`src-kohavi-2013`), `site/index.html:1801` (`src-eu-ai-omnibus-2026-1744`)

**Issue:** `get()` calls `res.text()` on every URL, and line 70 does `body.toLowerCase().includes(phrase)`. Four targets are PDFs:
- `kohavi-2013`
- `usco-copyright-ai-part2`
- `eu-ai-omnibus-2026-1744`
- the `parasuraman` DOI, which redirects to the publisher.

PDF text sits in Flate-compressed content streams, so a byte search usually misses it.

The published register shows the effect. Kohavi now says "Re-check failed 2026-10-24 … Phrase not found in the fetched PDF text", yet the script never extracts PDF text. The omnibus row says "Phrase not found on the re-fetched page", but its phrase is `'2026/1744'`. A PE-CONS document is the pre-publication text and normally does not carry the Official Journal number at all, so that check could never pass.

Readers are told that two sources failed re-verification when the tool could not have confirmed them. This is the reverse of the transparency the stamps are meant to give.

**Fix:**
- For `content-type: application/pdf`, pipe the bytes through `pdftotext -` (as `print.mjs` already does), or report the row as `pdf (manual)` instead of `NO`.
- Change the omnibus phrase to text that is actually in the PE-CONS document (for example `Article 111`).
- Re-run the check, then correct or remove the two stamps.

### WR-03: `evalJs` drops page-side exceptions, so several harness checks can pass with nothing checked

**File:** `scripts/cdp.mjs:86`; affects `scripts/a11y.mjs:76-81,98-106`, `scripts/print.mjs:43-55`, `scripts/smoke.mjs`

**Issue:** `evalJs` returns `result.result.value` and ignores `exceptionDetails`. If an expression throws in the page, `evalJs` silently returns `undefined`:
- In `focusChecks`, `if (!d) break;` ends the loop, so "visible focus indicator" and "focus not covered" pass on an empty list.
- In `orderCheck`, `undefined < 0` is false, so `undefined` indexes are pushed. Every comparison is then false, giving `backwards === 0`, and the check passes after 600 iterations.

These are QA gates for a published page, so a check that passes with nothing checked is a correctness bug in the gate.

**Fix:**
```js
const evalJs = async (expression) => {
  const r = (await send('Runtime.evaluate', { expression, returnByValue: true })).result;
  if (r.exceptionDetails) throw new Error(`page eval failed: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
  return r.result.value;
};
```
Also make the a11y focus tests require `stops.length > 0` (and `idxs.length > 0`).

### WR-04: The "training-data lawsuits are unresolved" claim has no source after the Getty removal

**File:** `site/index.html:1391,1393`

**Issue:** The IP block says "the training-data lawsuits are unresolved", and its "As at" line says "the training-data lawsuits have no final outcome". The only cite is `src-usco-copyright-ai-part2`, a Copyright Office report on copyrightability that says nothing about litigation status.

The Getty source rows were removed in quick task 261024-s14. The page now makes a time-sensitive legal-status claim with no source, which breaks the "every claim sourced and dated" rule. It is also the claim most likely to go out of date.

**Fix:** Do one of the following:
- Remove the lawsuit sentence from both paragraphs.
- Cite a neutral, dated litigation tracker row, for example a tracker index page rather than one case, typed `tracker`, and add it to `verifyPhrase`.

### WR-05: Incident statuses do not follow the page's own legend

**File:** `site/index.html:1361-1362` (incident rows), `site/index.html` s14 legend

**Issue:** The legend defines the statuses as follows:
- **Disputed**: "the parties disagree on the facts".
- **Established**: "confirmed by a court, a regulator or the party concerned".

Two rows do not fit:
- **Coca-Cola is marked Disputed.** Its own register row says "The release itself is not in dispute". What differs is the *reception*, which is opinion, not fact, so by the legend this is Established, with the reception noted in the "What happened" column.
- **Guess is marked Established.** Its register row says "No statement from Vogue or Guess was found in a primary or direct form". The party concerned has not confirmed. Only the producing agency, which is a third party to Guess, confirmed its own role to the press.

**Fix:** Mark Coca-Cola Established and keep the reception note in "What happened". Either mark Guess Alleged, or widen the Established definition to cover "documented in the artefact itself (the printed ad credit)". Then add a test that maps each status to the evidence type recorded in `data.js`.

### WR-06: The "Steady state" adoption row is graded Modelled, but it is the author's design

**File:** `site/index.html:1313`

**Issue:** The other three stage rows are graded Speculative via `asm-adoption-design` ("stages, first moves and guardrails … are the author's design, not a measured pathway"). The Steady state row's first move ("Briefs flow to derived sets without hand-offs") and team assignment are the same kind of design content. It is chipped Modelled via `asm-backlog0-days`, only because its guardrail cell mentions Backlog 0.

Under the page's weakest-grade rule, the row should be Speculative. As written, the design pathway's end state looks better evidenced than its earlier steps.

**Fix:** Chip the row `<a class="chip c-s" href="#asm-adoption-design">Speculative</a>`. If the Backlog 0 link is wanted, add it in the guardrail cell as a plain `<a href="#asm-backlog0-days">`.

### WR-07: Some publisher types are wrong for the source

**File:** `site/index.html:1581-1590` (`src-intercom-2x-teardown`), `site/index.html:1791-1800` (`src-eu-ai-act-art50`); values from `site/js/data.js`

**Issue:**
- **`src-intercom-2x-teardown` is typed `company`.** The publisher column says "Vincent Lyons (author of this page)". It is the author's personal GitHub Pages teardown, not a company publication. Typing it `company` makes the page's own earlier work look like a company source.
- **`src-eu-ai-act-art50` is typed `government`.** The URL and "Read via" are `artificialintelligenceact.eu`, an unofficial consolidated text from a non-governmental site, and the row says the official EUR-Lex text was not read. The text actually read was not published by a government. That matters because this row is graded Benchmark.

The page says "Publisher type … never changes a grade", but a wrong type still misleads readers about provenance. `crosscheck.mjs` §6 only checks that the type is in `PUBLISHER_TYPES` and matches `data.js`, not that it fits the source.

**Fix:**
- Retype the Intercom row. If the allowed list has no better fit, add `author` (or `self`) to `PUBLISHER_TYPES`.
- Either type the EU row by the publisher actually read (consider adding `secondary`), or read the official text and cite EUR-Lex.

The ASA row is a related, lesser case: it is typed `government` "as the closest allowed type". This also points to a missing `self-regulatory` type.

### WR-08: `legal.test.js` ties the CI deploy gate to a planning document for a review that was dropped

**File:** `test/legal.test.js:6,14-21`; `site/index.html:412,417,704,717,1140,1392,1399,1416`

**Issue:** The author dropped counsel review (commit 300ac84). However:
- Eight `legal-*` ids are still in the published markup, with no consumer.
- `legal.test.js` reads `.planning/LEGAL-REVIEW.md` when the module loads, and requires the id sets to match and to number exactly 8.

`pages.yml` runs `node --test` before deploying. If anyone archives or cleans `.planning/`, which planning workflows commonly do, `readFileSync` throws, the test file fails and deploys stop, for a reason unrelated to the site. Planning artifacts should not gate production.

**Fix:** Do one of the following:
- Remove the `legal-*` ids and the inventory test.
- Move the inventory into a source file outside `.planning/` (for example `test/fixtures/legal-ids.json`), so the deploy gate depends only on files that ship or test.

## Info

### IN-01: `a11y.mjs` and `print.mjs` keep going when the module never loads

**File:** `scripts/a11y.mjs:18`, `scripts/print.mjs:35`
**Issue:** The wait loop gives up silently after 8 s, and all checks then run against the no-JS page, so failures look like real accessibility failures. `smoke.mjs`'s `hashchange` asserts `loaded`; these scripts do not.
**Fix:** After the loop, `if (!(await evalJs("document.documentElement.classList.contains('js')"))) throw new Error('module did not load');`.

### IN-02: `focusChecks` guards against focus wrapping, but `orderCheck` does not

**File:** `scripts/a11y.mjs:62` vs `scripts/a11y.mjs:98-103`
**Issue:** `focusChecks` stops on wrap-around via `window.__first`. `orderCheck` stops only when focus reaches `body`. If Chrome wraps focus back to the skip link, `orderCheck` counts one backwards jump and runs all 600 iterations. Either the guard is dead code or `orderCheck` is fragile.
**Fix:** Use the same first-element stop condition in both loops.

### IN-03: `reverify.mjs` skips rows silently, loses 5xx status codes and has side effects on import

**File:** `scripts/reverify.mjs:14,48-54,57-62`
**Issue:**
- Sources with no phrase are dropped from the report with no line: the five incident rows, `moffatt`, `haynes`, `seoworks`, `indig`, `mmm-geox`, `translation-vendor-case` and others. The report cannot show what was *not* checked.
- A 5xx on the second attempt ends the loop and returns `'ERR'`, losing the status code.
- `export const verifyPhrase` sits in a module whose top level makes network calls, so importing it runs the fetches.
- For vendor rows the phrase is the vendor's own name, which shows only that the page is up, not that the claim was re-read.

**Fix:**
- Print `skipped (no phrase)` rows.
- Return the last status.
- Wrap the run in an `import.meta.url === argv` guard, as `crosscheck.mjs` does.
- Label vendor results "liveness only".

### IN-04: `crosscheck.mjs` does not flag stale `GAP_TRACE` keys

**File:** `scripts/crosscheck.mjs:22-35,130-137`
**Issue:** `JUSTIFIED_UNREFERENCED` fails on stale keys, but `GAP_TRACE` does not. A gap removed from the page leaves a dead mapping, and nothing checks that the mapped assumptions relate to the gap.
**Fix:** After the loop, fail for any `GAP_TRACE` key not seen in the `.gaps` list.

### IN-05: `print.mjs` counts pages with a regex on the raw PDF

**File:** `scripts/print.mjs:60-61`
**Issue:** `/\/Type\s*\/Page(?![s\w])/` breaks if Chrome writes page objects into compressed object streams. Poppler is already required, and `pdfinfo` gives an exact count.
**Fix:** Use `spawnSync('pdfinfo', [path])` and parse `Pages:`.

### IN-06: `cdp.mjs` `dump()` ignores `r.error` and timeouts

**File:** `scripts/cdp.mjs:48`
**Issue:**
- When Chrome is killed at the 60 s timeout (`status === null`, partial `stdout`), the truncated DOM is returned as if valid.
- When the binary is missing, the error reads `chrome failed: null`.

**Fix:** `if (r.error || r.status !== 0) throw new Error(\`chrome failed: ${r.error?.message || r.stderr}\`);`.

### IN-07: Ungraded illustrative number in s13, and hard-coded test and CSS values

**File:** `site/index.html:1329`; `scripts/smoke.mjs:264`; `site/assets/style.css` (720px block, `.backlog0 { padding: 16px; }`)
**Issue:**
- "A designer who once produced forty resizes" is an unchipped illustrative quantity in a page whose rule is that every number is graded.
- Smoke case `o` hard-codes `'40'` instead of `toText` of `d.campaigns`.
- `.backlog0` mobile padding uses a raw `16px` instead of a spacing token.

**Fix:** Reword without a number (or chip it as Speculative), compare against the default from `defaultValues`, and use `var(--s-md)`.

### IN-08: The s14 legend repeats each status word, and the IP block orders its parts differently

**File:** `site/index.html` s14 legend; `site/index.html:1393`
**Issue:**
- Each `<dd>` repeats the `<dt>` word ("Established: Established: …" when read in order).
- In the IP risk block, the `.asat` paragraph comes before `.mitigation`. In the other four blocks the order is the reverse.

**Fix:** Drop the leading word from each `<dd>`, and move the IP `.asat` paragraph after the mitigation.

---

_Reviewed: 2026-10-24T22:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
