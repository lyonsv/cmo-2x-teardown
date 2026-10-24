# Phase 4: Adoption, Risk, Evidence & Publish Slice - Context

**Gathered:** 2026-10-24
**Status:** Ready for planning
**Mode:** Smart discuss with the recommended answers auto-accepted by the orchestrator. The user was away and had said "keep going and approve everything until done". Every choice below is the recommended option and can be revisited.

<domain>
## Phase Boundary

A reader can finish the page with an honest view of adoption, what goes wrong and the evidence gaps, and the published page is accessible, cross-checked, re-verified and flagged for legal review.

Delivers sections 13 (Adoption and where it leads: Backlog 0), 14 (What goes wrong) and 15 (completed source register with bias flags, evidence gaps, assumptions register), plus page-wide QA (WCAG 2.2 AA, 320px, print), a scripted cross-check, re-verification of time-sensitive facts and a legal-review flag, and the final production deploy. Requirements: CLOSE-01..03, QA-01..04.

</domain>

<decisions>
## Implementation Decisions

### s13 Adoption & Backlog 0
- "Pulling up the floor" across creative, brand and regional teams. Covers who adopts first, enablement, the human-only list as reassurance, and the role shift from making to directing and reviewing. Graded Speculative where it is the author's design, with no invented adoption rates.
- Backlog 0 is defined as a queue-age SLA for unserved demand (for example "no approved brief waits longer than N days for its first derived set"). N is a Modelled, reader-replaceable assumption in data.js. Mirror the reference teardown's "where it leads" framing generically. Intercom is not named again outside s06/s12/s15.
- ~400–700 words, one table (adoption stages × team × first move × guardrail).

### s14 What goes wrong
- Incident list table with columns incident, date, what happened, status (established / alleged / disputed), source. Research picks the incidents from the PITFALLS list (e.g. Coca-Cola AI holiday ad, McDonald's NL, Guess/Vogue AI model, Levi's AI models, Moffatt v Air Canada for agent liability) and verifies each against a primary or reputable report. Anything unverifiable is dropped, not softened.
- Risk blocks: slop and sameness (concept count, variant caps, diversity checks); reviewer fatigue (Parasuraman & Manzey 2010 on automation complacency, verified); Goodhart on counts and spend; IP/copyrightability (US Copyright Office Part 2, Getty v Stability full neutral treatment with the COI note repeated); regulation (EU AI Act Art. 50 transparency obligations and dates, ASA, FTC). Each gets a date-stamped "as at <time>" callout.
- Getty v Stability gets its full treatment here. It is neutral, dated, has the COI note beside it, and is sourced to the court/judgment or the tracker.
- A short risk register table (risk × likelihood grade × mitigation × owner category).

### s15 Registers and evidence gaps
- Complete the source register with a publisher-bias flag column (vendor / company / academic / law-firm commentary / press / tracker / government) for every source. Existing sources are backfilled.
- An evidence-gaps section listing each gap as a gap (cost per asset, approval times, incident rates, auto-approval share, first-pass compliance, analyst hours, DAM metadata rot, AEO outcomes…) with what evidence would close it.
- The assumptions register matches data.js exactly (already tested field by field; extend to any new rows).
- Gartner 49/40/27%: verify against the primary source or leave it off. Default is leave it off.

### QA
- QA-04 scripted cross-check: `scripts/crosscheck.mjs` (Node built-ins only), also exposed as a node:test. It checks that every graded number on the page has a register entry, every calculator default equals the prose/static value, every register row is referenced or justified, and every source has a bias flag. It runs in CI via `node --test`.
- QA-01/02: an automated accessibility pass with the existing headless-Chrome CDP harness and no installs. It checks the accessible-name/role tree for labelled inputs, heading order, landmark set, focus order, the contrast tests already in place, and 320px overflow. The print check uses CDP printToPDF with a page count and no clipping. Manual screen-reader testing goes on the human UAT list (not auto-passed).
- QA-03 re-verification: primary-source re-fetch of Gartner, NYU/Emory (SSRN, which may 403, keep the user's earlier confirmation), Optimizely, vendor facts (re-check s12 access dates), EU AI Act Art. 50 (EUR-Lex), Getty v Stability (tracker/judiciary). Re-check dates are stamped in `<time>`. Anything that can't be re-fetched keeps its last verified date with a note.
- Legal-review flag: a visible note near the top ("Legal wording on this page has been flagged for review and has not yet been reviewed by counsel") plus a `LEGAL-REVIEW.md` in .planning listing every legal statement with its location. The note is not removed automatically; removing it needs the author.
- McKinsey: the page currently cites no McKinsey figure. If none is used, record "not used" in the register notes rather than adding one.

### Delivery
- Same pattern as before: local commits, a mid-phase preview checkpoint and a final approve-push checkpoint, both auto-approved by the orchestrator after the automated gates pass and recorded as such, then the production deploy and a live smoke check.
- The chip density rule, the data-fig drift tests, the numeric gate and VENDOR_RE stay strict.

### Claude's Discretion
- Exact prose, table wording, incident selection (verified only), and the Backlog 0 default N.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/smoke.mjs`: CDP harness with Node built-in WebSocket and local Chrome, cases a–n.
- Tests: page/data/calc/figure/diagram/style/state/model/svg/compare/calc-page (293 tests), register field-by-field checks, numeric gate, VENDOR_RE, governing chip.
- data.js sources carry grade and flag; there is no publisher-bias field yet.

### Integration Points
- s13 and s14 are skeletons; s15 has registers. Pages deploy is gated on `node --test`.

</code_context>

<specifics>
## Specific Ideas

- Candour is the credibility lever: the risk section should be as specific as the upside sections.

</specifics>

<deferred>
## Deferred Ideas

- V2 items (Eleventy, imagery cost comparison, real data, CFO PDF).

</deferred>
