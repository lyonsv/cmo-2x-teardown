# Phase 4 Plan 09: Publish Summary (PARTIAL: Task 1 done, Task 2 pending)

Status: Task 1 (final pre-flight) complete on 2026-10-24. Task 2 (approve-push) awaiting user. Task 3 (W3C, push, live checks) NOT run. Nothing uploaded, nothing pushed.

## Pre-flight

| Command | Result |
|---------|--------|
| `node --test` | 372 tests, 372 pass, fail 0 |
| `node scripts/crosscheck.mjs` | exit 0: 0 failures; figures 334, chips 169, cites 62, register rows 107, unreferenced 4, defaults 12 |
| `node scripts/smoke.mjs` | exit 0 on re-runs (17 PASS, no FAIL). One transient failure on the first run: `FAIL o invalid field then hashchange: no page target` (headless target lookup, not a page defect); two consecutive re-runs passed |
| `node scripts/a11y.mjs` | exit 0 |
| `node scripts/print.mjs` | exit 0 (83 pages read, legal flag on page 1) |
| `grep -c '<script' site/index.html` | 1 |
| `grep -c "script-src 'self'" site/index.html` | 1 |
| `grep -cE ' on[a-z]+=\| style="'` | 0 |
| `grep -c 'base64\|data:image'` | 0 |
| `grep -cE '(href\|src)="/'` | 0 |
| `grep -rcE "localStorage\|sessionStorage\|document\.cookie\|innerHTML" site/js` | 0 in all 9 files |
| `ls site/.nojekyll` | present |
| `grep -c 'has not yet been reviewed by counsel'` | 1 |
| `git branch --show-current` | main |
| `git status --porcelain -- site test scripts .github` | empty |
| `grep -c 'Getty\|s14-getty' site/index.html` | 0 (content removed by quick task 261024-s14) |

## Freshness gate

- Reverify run date D (04-05-SUMMARY.md line 49): 2026-10-24
- Today: 2026-10-24
- Regulation validity limit: 2026-11-07 (today is on or before it)
- Days since D: 0 (limit 7)
- Result: FRESH

## Unpushed commits (`git log origin/main..HEAD --oneline`): 45

```
f32ca88 docs(phase-4): update tracking after wave 8
e7040d4 docs(04-08): record preview approval, no changes
b8164b3 docs(04-08): record gates and pending human UAT list
a41ba92 fix(04-08): live chart panel label fits the viewBox under text spacing
67afb84 docs(03.1): UI audit review
63382be docs(phase-03.1): complete phase execution
6743d56 docs(03.1): record CR-01, WR-01, WR-02 fix status
350f5d6 fix(03.1): WR-02 grade flat marketing headcount as a Speculative assumption
1e1fa5e fix(03.1): WR-01 rename headline metric to campaign-markets launched per quarter
6bca234 fix(03.1): CR-01 over-capacity 2x campaign-markets shown as demand, not live
94a9c36 docs(03.1): record code review fix status
646b2c9 fix(03.1): IN-02 disclose cost per campaign-market as a unit translation of cost per approved asset
8bc8282 fix(03.1): IN-03 deduplicate OUTPUT_DEPS lists, order unchanged
215a0a2 fix(03.1): IN-01 serialiseHash and changedCount ignore missing or unknown route
414ad83 fix(03.1): WR-05 fail loudly when the growth share matches no route radio
b6702cd fix(03.1): WR-04 replace approved-live with approved asset wording and guard it
809924f fix(03.1): WR-03 validate marketing FTE in run() with a field-keyed error
b126a7a docs(03.1): add code review report
4a032c4 docs(03.1-07): complete relabel and guards plan
3e5759f test(03.1-07): page-wide reframe guards; remaining cycle time reworded to brief-to-live time
05d5026 feat(03.1-07): label s05/s07 variants as internal throughput; Brief-to-live time in s08
cfcee15 docs(phase-03.1): update tracking after wave 6
8310152 docs(03.1-06): record gates and user preview approval
5b76798 docs(03.1-05): complete answer, s01, s02 reframe plan
75ba215 docs(03.1-05): record headline reframe decision and revise CRED-03, CALC-01
85deadc feat(03.1-05): campaign-market answer and s01, page-wide figure sync, route default crosscheck
4c918dc feat(03.1-05): s02 cost per campaign-market and four-panel Figure 1
535356c docs(03.1-04): record decision and metrics
159486f docs(03.1-04): complete campaign-market calculator page plan
17841c8 docs(03.1-04): summary
35e1d8d fix(03.1-04): marketing FTE register basis matches data.js
360274f test(03.1-04): smoke cases for markets and route, hostile route fallback
79d7849 feat(03.1-04): static s11 results, Figure 8, maths, believe and sensitivity from present(defaults)
64b533a feat(03.1-04): s11 markets field and route radios, ui.js route wiring, register rows
78ddf4b docs(03.1-03): complete presenter and chart spec plan
8b8d219 docs(03.1-03): summary
526cf9d feat(03.1-03): Figure 8 chart spec shows campaign-markets, cost per approved asset, utilisation
30ce629 feat(03.1-03): ten-row presenter, route-aware summary and maths on the campaign-market model
65774d2 docs(03.1-02): complete data, fields and route hash plan
48c0bad feat(03.1-02): route allow-list in the share hash, input-side tests
2018473 feat(03.1-02): campaign-market assumptions, claims, markets field and route mapping
3cae5ea docs(03.1-01): complete campaign-market engine plan
794c1c0 docs(03.1-01): summary
ae9088a feat(03.1-01): campaign-market engine with growth route
5e1cb77 test(03.1-01): failing campaign-market engine tests
```

Note: origin/main already contains d66c835 (quick task 261024-s14, COI and Getty removal), so the legal-flag content that is unpublished is the Phase 3.1 and Phase 4 work above.

## Local preview

`python3 -m http.server 8000 --bind 127.0.0.1 -d site` running in the background; `curl` returns HTTP 200 at http://127.0.0.1:8000/.

## Open human UAT

04-HUMAN-UAT.md: 11 items pending (status: partial). Phase 2 and Phase 3 HUMAN-UAT items also remain open.

## Push approval

Push approval: pending user reply

## Notes for Task 3

- The live grep for `id="s14-getty"` must be dropped (expect 0): the Getty content was removed by quick task 261024-s14. The remaining live greps in the plan still apply.
- Plan text about "the legal-review flag under the COI note" is outdated: the COI note was removed; the legal flag (`class="callout legal-flag"`) remains.
