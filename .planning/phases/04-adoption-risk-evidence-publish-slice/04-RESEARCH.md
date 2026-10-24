# Phase 4: Adoption, Risk, Evidence & Publish Slice - Research

**Researched:** 2026-10-24
**Domain:** Static editorial page content (s13, s14, s15), legal and incident fact-checking, scripted QA (Node built-ins and headless Chrome CDP)
**Confidence:** HIGH on the verified facts (primary texts fetched this session); MEDIUM on press-sourced incident details; the Phase 4 test-suite impacts are HIGH (read from the code).

All fetched text was treated as data, not instructions. No human browser checks were used. Access date for every URL below: **2026-10-24** unless stated.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**s13 Adoption & Backlog 0**
- "Pulling up the floor" across creative, brand and regional teams. Covers who adopts first, enablement, the human-only list as reassurance, and the role shift from making to directing and reviewing. Graded Speculative where it is the author's design, with no invented adoption rates.
- Backlog 0 is defined as a queue-age SLA for unserved demand (for example "no approved brief waits longer than N days for its first derived set"). N is a Modelled, reader-replaceable assumption in data.js. Mirror the reference teardown's "where it leads" framing generically. Intercom is not named again outside s06/s12/s15.
- ~400–700 words, one table (adoption stages × team × first move × guardrail).

**s14 What goes wrong**
- Incident list table with columns incident, date, what happened, status (established / alleged / disputed), source. Research picks the incidents from the PITFALLS list (e.g. Coca-Cola AI holiday ad, McDonald's NL, Guess/Vogue AI model, Levi's AI models, Moffatt v Air Canada for agent liability) and verifies each against a primary or reputable report. Anything unverifiable is dropped, not softened.
- Risk blocks: slop and sameness (concept count, variant caps, diversity checks); reviewer fatigue (Parasuraman & Manzey 2010 on automation complacency, verified); Goodhart on counts and spend; IP/copyrightability (US Copyright Office Part 2, Getty v Stability full neutral treatment with the COI note repeated); regulation (EU AI Act Art. 50 transparency obligations and dates, ASA, FTC). Each gets a date-stamped "as at <time>" callout.
- Getty v Stability gets its full treatment here. It is neutral, dated, has the COI note beside it, and is sourced to the court/judgment or the tracker.
- A short risk register table (risk × likelihood grade × mitigation × owner category).

**s15 Registers and evidence gaps**
- Complete the source register with a publisher-bias flag column (vendor / company / academic / law-firm commentary / press / tracker / government) for every source. Existing sources are backfilled.
- An evidence-gaps section listing each gap as a gap (cost per asset, approval times, incident rates, auto-approval share, first-pass compliance, analyst hours, DAM metadata rot, AEO outcomes…) with what evidence would close it.
- The assumptions register matches data.js exactly (already tested field by field; extend to any new rows).
- Gartner 49/40/27%: verify against the primary source or leave it off. Default is leave it off.

**QA**
- QA-04 scripted cross-check: `scripts/crosscheck.mjs` (Node built-ins only), also exposed as a node:test. It checks that every graded number on the page has a register entry, every calculator default equals the prose/static value, every register row is referenced or justified, and every source has a bias flag. It runs in CI via `node --test`.
- QA-01/02: an automated accessibility pass with the existing headless-Chrome CDP harness and no installs. It checks the accessible-name/role tree for labelled inputs, heading order, landmark set, focus order, the contrast tests already in place, and 320px overflow. The print check uses CDP printToPDF with a page count and no clipping. Manual screen-reader testing goes on the human UAT list (not auto-passed).
- QA-03 re-verification: primary-source re-fetch of Gartner, NYU/Emory (SSRN, which may 403, keep the user's earlier confirmation), Optimizely, vendor facts (re-check s12 access dates), EU AI Act Art. 50 (EUR-Lex), Getty v Stability (tracker/judiciary). Re-check dates are stamped in `<time>`. Anything that can't be re-fetched keeps its last verified date with a note.
- Legal-review flag: a visible note near the top ("Legal wording on this page has been flagged for review and has not yet been reviewed by counsel") plus a `LEGAL-REVIEW.md` in .planning listing every legal statement with its location. The note is not removed automatically; removing it needs the author.
- McKinsey: the page currently cites no McKinsey figure. If none is used, record "not used" in the register notes rather than adding one.

**Delivery**
- Same pattern as before: local commits, a mid-phase preview checkpoint and a final approve-push checkpoint, both auto-approved by the orchestrator after the automated gates pass and recorded as such, then the production deploy and a live smoke check.
- The chip density rule, the data-fig drift tests, the numeric gate and VENDOR_RE stay strict.

### Claude's Discretion
- Exact prose, table wording, incident selection (verified only), and the Backlog 0 default N.

### Deferred Ideas (OUT OF SCOPE)
- V2 items (Eleventy, imagery cost comparison, real data, CFO PDF).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLOSE-01 | Candid "what goes wrong": incident list (established vs alleged), slop, reviewer fatigue, Goodhart, IP/copyrightability, regulation with date-stamped callouts | Verified incident set (5 rows) with statuses; verified regulation text and dates; Getty status; Parasuraman and Manzey citation and finding; ASA and FTC pages |
| CLOSE-02 | Adoption section and Backlog 0 as a queue-age SLA | Backlog 0 default N = 5 working days, derived from existing modelled build and review times; table design; numeric-gate handling |
| CLOSE-03 | Source register with publisher bias flags, evidence-gaps section, assumptions register matching data.js | Proposed `publisherType` for all 36 existing sources plus the new ones; evidence-gap list with "closed by"; register test impacts |
| QA-01 | WCAG 2.2 AA | CDP accessibility pass design with measured baseline |
| QA-02 | 320px and print | Measured baseline: scrollWidth 320, no overflow, 40 print pages; check design |
| QA-03 | Re-verify primary sources, vendor facts, Art. 50, Getty; flag legal wording | Re-fetch results per source; what cannot be re-fetched; LEGAL-REVIEW.md inventory approach |
| QA-04 | Scripted cross-check | Existing vs new checks table; static (CI) vs CDP (local) split |
</phase_requirements>

## Summary

Phase 4 is content plus QA on an existing, heavily tested static page. No new runtime dependency, no new JS module, no package install. The risk is not engineering; it is that **the existing strict test suite will fail on perfectly sensible new content** (numerals in prose, `<time>` text rules, register column indices, skeleton tests). Section "Pitfalls" lists each collision with the exact test, so Plan 1 can adjust the tests deliberately rather than by accident.

The research flag items resolved as follows. EU AI Act: Article 50 applies from 2 August 2026; the Digital Omnibus on AI (Regulation (EU) 2026/1744, in the Official Journal 24 July 2026) adds a transitional rule so providers of generative systems **placed on the market before 2 August 2026** must comply with the Art. 50(2) machine-readable marking duty by **2 December 2026**. It does not delay the deployer duties in Art. 50(4) (disclosing deepfakes), which are the ones that bite a CMO. The Commission's Code of Practice on Transparency of AI-generated Content is final and the Commission and AI Board have confirmed it as an adequate voluntary tool. Getty v Stability (UK): judgment 4 November 2025, permission to appeal the secondary-infringement ruling granted December 2025 (sources disagree on 16 vs 17 December), no Court of Appeal hearing or judgment found as at 24 October 2026; the US case is active in the Northern District of California. Moffatt v Air Canada is verified from the tribunal's own decision. Parasuraman and Manzey is verified through Crossref. The Gartner 49/40/27% figures are real but are **generative-AI return figures from the 2025 CMO Spend Survey, not agent-adoption figures** (CONTEXT mislabels them).

**Primary recommendation:** Treat Phase 4 as four plans: (1) Phase 3 UI-review fixes plus test-suite groundwork (time/numeric-gate/register-column changes, `publisherType`, new sources); (2) s13 and s14 content; (3) s15 completion, legal flag, LEGAL-REVIEW.md, re-verification stamps; (4) `crosscheck.mjs`, `a11y.mjs`/print checks, final deploy. Keep every new numeral either inside a `<time>`, a `data-fig` span, a pinned legal-reference span, or a register row.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| s13/s14/s15 prose, tables, legal flag | CDN / Static (hand-written HTML) | — | Pure static content; no JS (UI-SPEC: no new JS module) |
| Backlog 0 N, publisher type, source and assumption rows | Static data module (`site/js/data.js`) | HTML register (tested equal) | Single source of truth already drives page and tests |
| Cross-check (graded numbers, defaults, register references) | Build/CI (node:test, no browser) | Local script entry `scripts/crosscheck.mjs` | Must run in the Pages workflow, which has no Chrome |
| Accessibility, 320px, print checks | Local headless Chrome over CDP | — | Needs a rendering engine; CI does not have one; results are recorded in VERIFICATION |
| Re-verification of sources | Local fetch script/manual (`curl`/WebFetch) | `read_via` and `accessed` fields in data.js | Gartner and SSRN 403 automated clients; user confirmation is kept |
| Legal-review flag | Static HTML (`.legal-flag`) | `LEGAL-REVIEW.md` in .planning | Visible to readers; inventory for counsel |

## Standard Stack

No new libraries. Phase 4 uses what is already in the repo.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| `node:test` + `node:assert/strict` | Node 23.7.0 local, Node 22 in CI | New tests; crosscheck test | Already the project runner; `node --test` gates deploy [VERIFIED: `node --version`, `.github/workflows/pages.yml`] |
| Headless Google Chrome via CDP over Node built-in `WebSocket` | local `/Applications/Google Chrome.app` | a11y, 320px, print | Same pattern as `scripts/smoke.mjs`; no install [VERIFIED: probe run this session] |
| `python3 -m http.server` | system | Local static server for CDP runs | Already used by smoke.mjs [VERIFIED: scripts/smoke.mjs] |
| `pdftotext` (poppler) | `/opt/homebrew/bin/pdftotext` | Optional: page-1 text check of the printed PDF | Local only; script must skip with a note if absent [VERIFIED: `which pdftotext`] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand CDP checks | axe-core / pa11y / Lighthouse | Violates "no installs / self-contained"; CDP `Accessibility.getFullAXTree` plus DOM checks cover the UI-SPEC checklist |
| Parsing PDF by regex for page count | pdf-lib | Not needed; Chrome emits one `/Type /Page` object per page (measured: 40) |

**Installation:** none. **Package Legitimacy Audit:** no external packages are installed in this phase, so no slopcheck run is required. Packages removed: none. Packages flagged: none.

## Architecture Patterns

### Data and test flow
```
site/js/data.js (sources + publisherType + event dates, assumptions incl. asm-backlog0-days, claims)
        |                                   |
        v                                   v
site/index.html (s13, s14 hand-written;     test/*.test.js  (field-by-field register match,
 s15 register rows, gaps list, legal flag)   numeric gate, chip density, VENDOR_RE, new tests)
        |                                   |
        +------> scripts/crosscheck.mjs <---+   (static, Node built-ins, exposed via test/crosscheck.test.js, runs in CI)
        |
        v  (local only)
scripts/cdp.mjs (extracted withPage harness) --> scripts/a11y.mjs  (AX tree, headings, landmarks, focus, 320px, text spacing)
                                              --> scripts/print.mjs (printToPDF: pages, flag on page 1, clipping)
scripts/smoke.mjs keeps cases a-n and imports cdp.mjs
```

### Recommended structure additions
```
scripts/
  cdp.mjs          # withPage, startServer, profile, sleep (extracted from smoke.mjs, no behaviour change)
  crosscheck.mjs   # exports run(): returns {failures:[]}; CLI prints and exits non-zero
  a11y.mjs         # QA-01/02 automated items
  print.mjs        # QA-02 print items (may be a function inside a11y.mjs)
test/crosscheck.test.js   # imports run() from ../scripts/crosscheck.mjs, asserts no failures
.planning/LEGAL-REVIEW.md
```

### Pattern: new numerals go through one of four doors (numeric gate)
The numeric gate (`test/page.test.js` line 437) allows only `2x, 1x, 2–3, 2026-10-24, 10,000, 1` outside these exemptions: `<time datetime="YYYY-MM-DD">…</time>` (any inner text), `data-fig` spans, `<a href="#sNN">` cross-links, register rows, `.statute` spans pinned to two strings. So:
1. Dates: `<time datetime="2025-12-10">December 2025</time>`.
2. Claims: `data-fig` backed by data.js with a linked chip.
3. Legal references ("Article 50", "Article 50(2)", "Regulation (EU) 2026/1744"): add a `<span class="legal-ref">` stripped by the gate **only if its text is in a pinned list** (mirror the existing `.statute` pattern and its pinned-text test). Do not widen `ALLOWED_NUMERIC_TOKENS` for '50'.
4. Register rows and the s15 evidence-gap list: write gap text without numerals; case numbers live only in register rows.

### Anti-Patterns to Avoid
- **Numerals in incident cells** ("45-second", "70,000 clips", "$812"): they fail the gate. Omit them (the incident is described without them) or make them graded claims. Recommendation: omit.
- **Colour for status/publisher type**: UI-SPEC forbids; the CSS test must assert it.
- **Writing "does not exist/does not have"** in any new copy (existing copy test).
- **Naming vendors in s13/s14** (VENDOR_RE). Incident companies (Coca-Cola, McDonald's, Guess, Levi's, Vogue, Air Canada) are not in VENDOR_RE, so they may appear in s14. Do not name Google/Microsoft/OpenAI etc. (for example, do not name Google Ads when mentioning NYU/Emory).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessibility tree | A custom ARIA computation | CDP `Accessibility.getFullAXTree` | Chrome computes accessible names and roles; measured: 11,293 nodes, 0 unnamed interactive on today's page |
| PDF page count | PDF parser | Count `/Type /Page` (not `/Pages`) in the PDF bytes | Measured 40 pages; regex is enough |
| Register/page cross-check | A second copy of the data | Import `site/js/data.js` and parse `site/index.html` with the same regex helpers the tests use | Single source of truth; avoids drift |
| Reading Gartner/SSRN | Bot-evasion (headless browser, spoofed UAs) | Keep the user's 2026-10-24 confirmation plus a corroborating public page | The sandbox denied a headless-browser attempt as bot-check circumvention; do not retry. Use publicly reachable reproductions or the university highlight page |
| Date formatting | New formatter | Fixed `<time datetime>` with a visible day-month-year string | Same format in every block (UI-SPEC) |

## Runtime State Inventory

Not a rename/refactor/migration phase. Omitted deliberately. One adjacent note: the GitHub Pages deployment (`.github/workflows/pages.yml`, actions `checkout@v7`, `setup-node@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`) exists and is unchanged by this phase [VERIFIED: file read].

## Verified Facts

### V1. Incidents for s14 (record for the incident table)

Rule applied: status words follow the UI-SPEC definitions (Established: confirmed by a court, a regulator or the party concerned; Alleged: reported but not confirmed; Disputed: the parties disagree on the facts). Newest first. No numerals in the "What happened" text. `datetime` values are the event date; where only a month is known the planner needs the YYYY-MM relaxation described under Pitfall 2.

| Incident | Event date (`datetime`) | What happened (neutral, <=25 words) | Status | Best source (grade, publisherType) |
|---|---|---|---|---|
| McDonald's Netherlands AI Christmas advert | 2025-12-10 (removal; released on the Dutch YouTube channel the preceding Saturday per NBC) | Published an AI-generated Christmas advert on its Dutch YouTube channel, then removed it after online criticism, saying it was intended to show stressful holiday moments. | **Established** (McDonald's confirmed removal and gave a statement to NBC and Bloomberg) | NBC News, 2025-12-11, https://www.nbcnews.com/world/europe/mcdonalds-ai-generated-christmas-advert-social-media-backlash-rcna248590 (Modelled, press). Corroboration: BNN Bloomberg 2025-12-10 https://www.bnnbloomberg.ca/business/company-news/2025/12/10/not-lovin-it-mcdonalds-pulls-dutch-ai-christmas-ad |
| Coca-Cola "Holidays Are Coming" AI adverts | 2025-11-03 (2025 release; first AI holiday adverts were 2024) | Released AI-generated holiday adverts for a second year. The company says the earlier film performed well; press reports a largely negative public reaction. | **Disputed** (company statement vs press on reception; the release itself is not in dispute). Judgement call: planner may split into "release: Established" if preferred | TODAY (NBC), 2025-11-04, https://www.today.com/today/amp/rcna241799 (Modelled, press) |
| Guess advert with AI-generated models in US Vogue | 2025-08 (August 2025 issue) | Ran a Guess advert featuring AI-generated models, credited in the ad to the agency that produced them; the placement drew public criticism. | **Established** for the narrow facts only (the advert credit "Produced by Seraphinne Vallora on AI" is printed in the ad per ContentGrip; the agency confirmed its role to ABC News). Do **not** include any Vogue or Guess statement: none was found in a primary or direct form | ABC7/ABC News, 2025-08-01, https://abc7news.com/post/controversy-stirs-ai-generated-models-new-guess-ads-appearing-vogue/17390923/ ; ContentGrip, 2025-08-05, https://www.contentgrip.com/guess-vogue-ai-model/ (Modelled, press) |
| Moffatt v Air Canada, 2024 BCCRT 149 | 2024-02-14 | A tribunal held an airline responsible for wrong fare information given by its website chatbot and ordered it to pay the customer. | **Established** (tribunal decision) | BC Civil Resolution Tribunal decision, file SC-2023-005609, Member Christopher C. Rivers, https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do (Benchmark, government). Note: the page returns a PDF; `curl` with a browser-like UA gets 200, WebFetch gets 403. |
| Levi Strauss and Lalaland.ai AI models | 2023-03-22 | Announced a test of AI-generated models alongside human models; after criticism added an editor's note that it was not a substitute for diversity work. | **Established** (company's own announcement and editor's note dated 2023-03-28) | Levi Strauss & Co. https://www.levistrauss.com/2023/03/22/lsco-partners-with-lalaland-ai/ (Modelled, company; primary). Secondary: NBC News 2023-04-30 https://www.nbcnews.com/business/business-news/ai-models-levis-controversy-backlash-rcna77280 |

Moffatt facts verified in the decision text: Air Canada argued the chatbot was "a separate legal entity that is responsible for its own actions"; the member called it "a remarkable submission" and found Air Canada "did not take reasonable care to ensure its chatbot was accurate"; total order **$812.02** (damages $650.88, interest $36.14, CRT fees $125). Keep amounts out of prose (numeric gate) unless modelled as graded claims; the register row can carry them.

**Dropped (not verified to an acceptable source this pass, or out of scope):**
- Guess/Vogue "Vogue says it was not an editorial decision": only relayed second-hand from a BBC article that could not be fetched (BBC URLs 404; PetaPixel 403). Dropped.
- Coca-Cola "about 100 people, 70,000+ clips, one month": appears only in a behind-the-scenes video voiceover reported by TODAY, and a WSJ report not retrieved. Dropped. McDonald's "thousands of takes / seven weeks": not re-verified. Dropped.
- Sports Illustrated fake bylines (not advertising) and Klarna reversal (company statement, not an AI-content incident): not re-verified, not needed. Dropped.

Tension worth one sentence in the regulation block: the NYU Stern page reports disclosure of AI involvement reduced click-through, while Art. 50(4) and the ASA push towards disclosure. Both are already in the page's data (`nyu-disclosure-drop`); reuse that claim rather than adding new numbers. [CITED: https://www.stern.nyu.edu/experience-stern/faculty-research/ai-advertising-paradox, 2025-11-06, fetched 200 this session; it also corroborates the 19% and 31.5% figures, so it can be added to `read_via` for src-nyu-emory-ai-ads-2025]

### V2. EU AI Act Art. 50 and the omnibus

| Fact | Evidence |
|---|---|
| Art. 50 obligations apply from 2 August 2026 (Art. 113) | Commission page: "These transparency obligations, applicable from 2 August 2026" https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content ; artificialintelligenceact.eu Art. 50 page "Comes into force 2 August 2026, according to Article 113" https://artificialintelligenceact.eu/article/50/ [VERIFIED: fetched] |
| Art. 50(2): providers of systems generating synthetic audio, image, video or text must mark outputs in a machine-readable format and make them detectable; exception for assistive editing functions | artificialintelligenceact.eu text [CITED] (unofficial consolidated text; EUR-Lex returns an HTTP 202 bot challenge to scripted clients, and the official Regulation (EU) 2024/1689 page could not be read directly. Plan 3 should record this and keep the page's wording to paraphrase, not quotation) |
| Art. 50(4): deployers of a system that generates or manipulates image, audio or video constituting a deep fake must disclose that it is artificially generated or manipulated; for evidently artistic, creative, satirical or fictional works the duty is limited to disclosure "in an appropriate manner that does not hamper the display or enjoyment of the work"; AI-generated public-interest text needs disclosure unless human review or editorial control applies | same [CITED] |
| Art. 50(5): information must be provided clearly, "at the latest at the time of the first interaction or exposure", conforming to accessibility requirements | same [CITED] |
| Digital Omnibus on AI = Regulation (EU) 2026/1744 of the European Parliament and of the Council, 8 July 2026, amending Regulations (EU) 2024/1689, 2018/1139 and 2023/1230; enters into force the third day after publication in the OJ; EUR-Lex record dated 24.7.2026 | Council/Parliament final text PE-CONS 30/1/26 REV 1 https://data.consilium.europa.eu/doc/document/PE-30-2026-REV-1/en/pdf (downloaded, `pdftotext`, Article 4 read); EUR-Lex ELI https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng (existence and date from search snippet only; not fetchable) [VERIFIED for text; CITED for OJ date] |
| The 2 December 2026 transition: new Art. 111(4): "Providers of AI systems, including general-purpose AI systems, generating synthetic audio, image, video or text content, that have been placed on the market before 2 August 2026 shall take the necessary steps in order to comply with Article 50(2) by 2 December 2026." Recital 38 calls it "a transitional period of four months" | PE-CONS text, lines under the Art. 111 amendment and recital (38) [VERIFIED] |
| The omnibus changes Art. 50 only at paragraph 7 (codes of practice assessment procedure) for this regulation; it does not change Art. 50(4) deployer duties | grep of the PE-CONS text: Art. 50 appears at recital 38, the Art. 50(7) replacement and the Art. 111(4) addition [VERIFIED] |
| Code of Practice on Transparency of AI-generated Content: two sections (providers: marking and detection; deployers: labelling of deepfakes and AI-generated text); voluntary; "The Commission and the AI Board have confirmed that the code is an adequate voluntary tool to demonstrate compliance"; the Commission also published guidelines on the scope of Art. 50 and a set of EU icons deployers may use; about 190 signatories by end of July 2026 | https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content [VERIFIED: fetched]. The page itself is undated in the extract; do not state a publication date on the page. Law-firm reporting dates the final code to June 2026 (Jones Day, https://www.jonesday.com/en/insights/2026/06/european-commission-publishes-final-code-of-practice-on-marking-and-labelling-aigenerated-content) |

Wording to use in the `.asat` block, without numerals other than in `<time>` and pinned `legal-ref` spans: transparency duties in the AI Act's Article 50 apply from `<time datetime="2026-08-02">2 August 2026</time>`; providers of generative systems already on the market before that date have until `<time datetime="2026-12-02">2 December 2026</time>` to meet the machine-readable marking duty; deployers' duty to disclose deepfakes is not delayed; a voluntary code of practice has been confirmed by the Commission as adequate. "Check again before relying on it."

The claim "2 December 2026 is a delay of Art. 50 overall" is **false**; it applies only to Art. 50(2) and only to systems placed on the market before 2 August 2026. Several secondary sources were unclear on this (Simmons & Simmons flagged it as unresolved at the provisional-agreement stage); the final text settles it.

### V3. ASA (UK) and FTC (US)

| Item | Fact | Source |
|---|---|---|
| ASA/CAP | The CAP and BCAP Codes contain no AI-specific rules; "our existing rules apply regardless of how content is generated, edited, or targeted"; there is no general UK legal duty to label AI use in ads; "Disclosure alone is very unlikely to mitigate the harm caused by a fundamentally misleading message"; labelling a deepfake as comedic or an influencer as AI-generated may negate an otherwise misleading impression; advertisers remain responsible for AI output | ASA, "Disclosure of AI in Advertising: Striking the Balance Between Creativity and Responsibility", 29 May 2025, https://www.asa.org.uk/news/disclosure-of-ai-in-advertising-striking-the-balance-between-creativity-and-responsibility.html [VERIFIED: fetched]. Grade Benchmark, government (UK self-regulatory body funded by an industry levy; "government" is the closest allowed type: note in the legend) |
| FTC | Final rule banning fake reviews and testimonials announced 14 August 2024; covers reviews and testimonials by someone who does not exist, "including AI-generated fake reviews"; effective 60 days after Federal Register publication (a later FTC warning letter states 21 October 2024) | https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials [VERIFIED: fetched]. Effective date from the FTC rulemaking page and a 2025 FTC warning, via search summary only [CITED]. The FTC endorsements page (https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews, undated) says to disclose material connections but does not address AI endorsements or virtual influencers: do not claim FTC guidance on AI influencers |
| FTC Rytr | A 2024 consent order against an AI review-generation seller was reopened and set aside on 22 December 2025 | FTC, search summary only [LOW]. Do not cite on the page |

### V4. Getty v Stability AI (neutral, as at 2026-10-24)

| Point | Fact | Source |
|---|---|---|
| UK High Court judgment | 4 November 2025, [2025] EWHC 2863 (Ch), Mrs Justice Joanna Smith; trial June 2025. Getty dropped primary copyright and database-right claims late in trial; **secondary copyright infringement claim failed** (the court found Stable Diffusion did not embody infringing copies, though an AI model could in principle be an "article"); **trade mark claims succeeded in part** for early model versions and certain outputs, failed on others; passing off not decided | CMS case tracker (last updated 16 April 2026) https://cms.law/en/int/publication/artificial-intelligence-and-copyright-case-tracker/united-kingdom-getty-images-us-inc-ors-v-stability-ai-ltd ; AI Lawsuit Tracker https://ailawsuittracker.com/cases/getty-images-v-stability-ai-uk-2025-ewhc-2863-ch/ [CITED, two trackers agree] |
| Permission to appeal | Granted on the secondary-infringement ruling after the judgment: **tracker says 16 December 2025; CMS page says 17 December 2025** (CMS publication of the outcome dated 21 January 2026). Sources agree it was granted to Getty by the High Court judge; AI Vortex alone reports a hearing "expected late 2026" (unauthoritative). **No Court of Appeal hearing date or judgment found**; trackers checked 19 to 20 October 2026 show none | Trackers above; Taylor Wessing https://www.taylorwessing.com/en/insights-and-events/insights/2026/01/next-steps-for-getty-v-stability-why-has-permission-to-appeal-been-granted [CITED] |
| US case | Getty Images (US), Inc. v. Stability AI, Ltd., N.D. Cal. No. 3:25-cv-06891, filed 14 August 2025 (refiling after the Delaware action was voluntarily dismissed). 23 April 2026: motion to dismiss granted only as to the DMCA section 1202 claim, with leave to amend. Jury trial set for 18 January 2028. Stage: active | https://ailawsuittracker.com/cases/getty-v-stability-ai/ (page dates conflict: "last reviewed 7 October 2026", "text reviewed 11 October 2026", footer "Updated 19 October 2026") [CITED, single tracker; CourtListener docket 403] |

**Wording rule for the page:** say "permission to appeal was granted in December 2025" (do not pick a day; record the 16/17 discrepancy in the register row note). Existing data.js row `ailawsuittracker-getty-uk` has `published: '2026-10-11'`; the tracker footer now says "Updated Oct 19, 2026". Update `accessed` only; keep `published` and add a note, since the trackers' own dates conflict. Existing text "Judgment 2025-11-04, permission to appeal 2025-12-16" in 02-HUMAN-UAT item 3 is **confirmed by the tracker**, with the CMS one-day discrepancy; that human item is still the author's (COI) and stays open. Mini-table (Claim, Status, Source) is justified: two distinct rulings exist (secondary infringement failed; trade mark partly succeeded). Numerals: write dates in `<time>`; case numbers only in register rows.

### V5. Parasuraman and Manzey (2010)

Citation: Parasuraman, R. and Manzey, D. H. (2010). "Complacency and Bias in Human Use of Automation: An Attentional Integration." *Human Factors* 52(3), 381-410. DOI 10.1177/0018720810376055. [VERIFIED: Crossref API https://api.crossref.org/works/10.1177/0018720810376055; the DOI resolves to journals.sagepub.com but SAGE returned a redirect, and the publisher page was not read]. Abstract (Crossref) states: automation complacency "occurs under conditions of multiple-task load, when manual tasks compete with the automated task for the operator's attention", is found in "both naive and expert participants and cannot be overcome with simple practice"; automation bias "results in making both omission and commission errors when decision aids are imperfect", "occurs in both naive and expert participants, cannot be prevented by training or instructions, and can affect decision making in individuals as well as in teams". Source row: grade Benchmark (peer-reviewed review article), publisherType academic, `read_via`: "Crossref metadata and abstract; full text not read". Use only the abstract-level claim (reviewer fatigue and complacency are documented, and training alone does not fix them); do not extrapolate to marketing review rates. Keep `asm-fatigue` claims Speculative.

### V6. Gartner 49/40/27%

The three figures are in the **Gartner 2025 CMO Spend Survey** release (already source `gartner-2025-cmo-spend`): "GenAI investments are delivering ROI through improved time efficiency (49%), improved cost efficiency (40%) and improving capacity to produce more content and/or handle more business (27%). Just 1% of CMOs said GenAI investments are not currently a priority." [VERIFIED: reproduction at https://www.silicon.co.uk/press-release/gartner-2025-cmo-spend-survey-reveals-marketing-budgets-have-flatlined-at-7-7-of-overall-company-revenue, fetched; gartner.com itself returns 403 to scripted clients]. They are **not** agent-adoption figures. Gartner's October 2025 martech release (a different survey) is where agents appear (45% say vendor agents fail expectations); not verified further.

Recommendation: **leave the three percentages off** as CONTEXT defaults, but correct the s15 "not used" note, whose current wording ("Gartner agent-adoption percentages") mislabels them. Numeral-free replacement: "Gartner generative-AI return percentages: not used on this page." If the planner wants one, "only a minority report more content capacity as an ROI" is the single useful use (27%) and would need a Benchmark claim with `data-fig` on `src-gartner-2025-cmo-spend`; not recommended for scope.

### V7. Gartner 2026 and other facts re-fetched

| Source (data.js id) | Re-check result 2026-10-24 | Action |
|---|---|---|
| gartner-2025-cmo-spend | gartner.com 403. Content corroborated via silicon.co.uk reproduction (7.7% flat, 402 respondents; GenAI ROI figures) | Keep `read_via`; stamp accessed 2026-10-24 only if the reproduction is the stated read_via (already true) |
| gartner-2026-cmo-spend | gartner.com 403 to scripted fetch; search summaries of the release (15.3% AI share, ~30% mature readiness, 401 CMOs, 7.8% of revenue, fielded January to March 2026) agree with data.js; Barchart reproduction returned a bot challenge | Keep the user's browser confirmation; add "Re-check failed 2026-10-24 for direct fetch; corroborated by secondary summaries" sentence per UI-SPEC rule if the planner wants the stamp. Last verified date stays |
| nyu-emory-ai-ads-2025 | SSRN 403. NYU Stern highlight page (200, dated 2025-11-06) states 19% (up to) and 31.5% disclosure drop | Keep user confirmation; add the Stern page as corroborating `read_via`; stamp |
| experimentation-vendor-playbook | Optimizely page 200; shows "173,000 experiments" and a 12% figure | Re-stamp 2026-10-24 (page fetched, key figure present) |
| usco-copyright-ai-part2, haynes-2026, seoworks-2026, indig-2026, kohavi-2013, laubli-2019, aggarwal-geo-2024, mmm-geox, cornell x2, translation-vendor-case | HTTP 200 on fetch (status only; content not re-read) | Re-stamp only if the planner re-reads; otherwise keep dates |
| 18 vendor rows (gradial x10, airops x5, profound x3) | HTTP 200 on fetch (status only) | s12 content check is a separate script step (see QA-03 plan below) |
| ailawsuittracker-getty-uk, getty-v-stability-uk (Taylor Wessing) | Both 200; content consistent with V4 | Re-stamp; see V4 date note |
| McKinsey | No McKinsey figure anywhere (`grep -ci mckinsey` = 0 in index.html and data.js) | Record "McKinsey: no figure is used on this page." |

## Source register: `publisherType`

Fixed list for data.js: `['vendor','company','academic','law-firm commentary','press','tracker','government']`. Rule proposed: **type of the originating publisher of the claim** (not the mirror used to read it), because Publisher type must never change a grade. Government includes courts, tribunals, regulators and statute text. Neutral text, no colour (UI-SPEC).

| Source id | Proposed publisherType | Note |
|---|---|---|
| gartner-2025-cmo-spend, gartner-2026-cmo-spend | company | Commercial research firm; existing `bias` text says "Analyst firm" |
| nyu-emory-ai-ads-2025, laubli-2019, aggarwal-geo-2024, kohavi-2013 | academic | Kohavi has Microsoft authors; flag stays `company-reported` |
| usco-copyright-ai-part2, cornell-17usc504, cornell-17usc412 | government | Cornell LII republishes statute text; originating text is government |
| getty-v-stability-uk | law-firm commentary | Taylor Wessing |
| ailawsuittracker-getty-uk | tracker | |
| intercom-2x-teardown | company | Author's own page; imperfect fit, seven-value list is fixed by UI-SPEC. Flag it as `company-reported` already |
| translation-vendor-case, experimentation-vendor-playbook, mmm-geox | vendor | Google's Meridian documentation is a publisher with a product interest |
| haynes-2026, seoworks-2026 | vendor | Both sell SEO/GEO services; consistent with the existing "sell-side authors" wording |
| indig-2026 | press | Independent newsletter |
| gradial-* (10), airops-* (5), profound-* (3) | vendor | |

New sources Phase 4 should register (all `accessed` 2026-10-24; ids proposed):

| id | Publisher | publisherType | Grade (convention: court and regulator text Benchmark; press and secondary Modelled) |
|---|---|---|---|
| parasuraman-manzey-2010 | Human Factors journal (SAGE) | academic | Benchmark |
| moffatt-air-canada-2024 | BC Civil Resolution Tribunal | government | Benchmark |
| eu-ai-act-art50 | European Union (consolidated text via artificialintelligenceact.eu; official text EUR-Lex) | government | Benchmark |
| eu-ai-omnibus-2026-1744 | European Parliament and Council (PE-CONS 30/1/26 REV 1) | government | Benchmark |
| eu-code-of-practice-transparency | European Commission | government | Benchmark |
| asa-ai-disclosure-2025 | Advertising Standards Authority | government | Benchmark |
| ftc-fake-reviews-rule-2024 | US Federal Trade Commission | government | Benchmark |
| getty-v-stability-us | AI Lawsuit Tracker | tracker | Modelled |
| getty-v-stability-uk-cms | CMS law firm tracker | law-firm commentary | Modelled |
| incident-mcdonalds-nl-2025 | NBC News | press | Modelled |
| incident-cocacola-2025 | TODAY (NBC) | press | Modelled |
| incident-guess-vogue-2025 | ABC7 / ContentGrip | press | Modelled |
| incident-levis-2023 | Levi Strauss & Co. | company | Modelled (company's own statement) |

Existing `test/data.test.js` checks that "claims citing a source share its grade", `Benchmark claims cite an https source with an accessed date`, and "new sources are complete" (fields: title, publisher, published, accessed, url, bias, read_via, grade, flag). Add `publisherType` (and optional `event` date string) to the "complete" check. For press and `read_via`, use honest text such as "page read; publisher is the original reporter". Because each `time` date in prose must appear in a source register row (Pitfall 2), put the event date in the new `event` field and render it in the Claim cell ("Event dated 2025-12-10.").

## Evidence-gaps list (s15)

Wording: no numerals (page gate; "10,000" is allowed but avoid), each item at most 35 words, bold gap then "Would be closed by:". Derived from SUMMARY.md gaps and the `no published benchmark` assumptions in data.js.

| Gap | Would be closed by |
|---|---|
| Cost per asset, by asset type and route | The reader's finance and production ledger, joined to asset IDs for three or more quarters; a vendor-neutral benchmark with stated scope |
| Approval times and queue ages | Workflow-tool timestamps from brief to approval per touch, by tier |
| Rights and compliance incident rates | The reader's own legal and takedown log divided by assets published; no public rate exists |
| Auto-approval share that stays safe | A calibrated eval harness run against human reviewer decisions, with sampling audit results |
| First-pass compliance rate | Gate logs of first submissions against brand and legal rules, before any fix loop |
| Analyst hours and insight turnaround | Time tracking on reporting tasks before and after automation |
| DAM metadata completeness and decay | An audit of rights, expiry and usage metadata against a sample of live assets |
| Answer-engine (AEO) outcomes | Independent, pre-registered traffic and pipeline studies with holdouts; current evidence is vendor or panel based |
| Localisation cost per word for LLM-era workflows | Current vendor-neutral rate cards and post-edit effort studies on modern models |
| Win rate of marketing experiments by definition | Multiple independent datasets with the win definition stated, not one vendor's |
| Reviewer fatigue in marketing review | A time-on-task and error-rate study of reviewers at AI-era volumes |
| Indemnity caps and exclusions in practice | Current licence and provider contract terms read by counsel for the reader's own suppliers |

Closing line (UI-SPEC): "Replace any of these with your own data in the calculator." with link to `#s11`. The planner should cross-check each gap against an actual `no published benchmark` assumption or evidence entry (QA-04: every gap is traceable).

## s13 Backlog 0 default N

Recommend `asm-backlog0-days`: kind `context`, key null, value **5**, unit "working days", display "5 days", grade Modelled, basis: "A service-level target this page chose, not a measurement: it sits just above the modelled build time at 2x plus one review touch (3 days plus 1.5 days, rounded up). Replace it with your own service level. No published benchmark." This ties N to existing assumptions (`asm-build-days` scaled 3 and `asm-review-service-days` 1.5) so the CFO can see where it came from [VERIFIED: data.js lines 481 to 484]. Render with `<span data-fig="asm-backlog0-days">5 days</span>` and a linked Modelled chip to `#asm-backlog0-days` ("assumption register matches data.js exactly" is tested). `figEntry()` in page.test.js looks up `assumptions[id]` for `data-fig`, so no claims entry is required. Check `test/data.test.js` 'every model assumption is Modelled' and `defaultAssumptions()` handling of kind `context` rows.

## Common Pitfalls

### Pitfall 1: Skeleton tests will fail the moment s13/s14 are filled
`test/page.test.js` lines 325 to 338 assert `SKELETON_IDS = ['s13','s14']` and that each carries `<p class="later">Coming in a later update.</p>`. **Remove or invert** these two tests in Plan 2 (replace with "s13 and s14 have no `.later`"). Also the s09-style prose budgets: add `PROSE_BUDGET` entries for s13 (400 to 700) and s14 (1,200 to 1,600 outside tables; UI-SPEC says "about") and check `PROSE_BUDGET` includes only the sections listed. Warning sign: `node --test` red on "skeleton".

### Pitfall 2: `<time>` rules collide with the UI-SPEC and with incident dates
`test/page.test.js` line 420: (a) every `<time datetime>` must match `^\d{4}-\d{2}-\d{2}$` (so no YYYY-MM); (b) the date must appear inside some source register row; (c) **the `<time>` text must equal the datetime** (IN-06), but the UI-SPEC `.asat` mandates `<time datetime="2026-10-24">24 October 2026</time>`. Plan 1 must change this test: allow `YYYY-MM` and `YYYY-MM-DD`; allow human text that parses to the same date (validate with a month-name map); require each datetime to be in a register row **or** in a `.status` incident row whose source row carries the matching `event` date. Also update the numeric-gate strip regex (`<time datetime="\d{4}-\d{2}-\d{2}">`) to the same pattern. Also `compare.test.js` line 59 ("every date in s12 is inside a time element") may interact; re-run.
**Also:** the register `Date accessed` cell is asserted as plain `<td>${src.accessed}</td>` (line ~164). UI-SPEC wants `<time>` there. Either keep plain text (recommended: simplest; then "re-check stamps in `<time>`" is satisfied only in prose `cite-date` spans) or update the test to accept `<td><time datetime="X">X</time></td>`. Decide in Plan 1 and apply once.

### Pitfall 3: The register gains a column, and the test indexes cells by position
`test/page.test.js` line ~168 reads `tds[3]` as grade and `tds[4]` as flag. With "Publisher type" inserted after Publisher the indices become: td0 Claim, td1 Publisher, td2 Publisher type, td3 Date accessed, td4 Grade, td5 Flag, td6 URL. Update to `tds[4]`, `tds[5]` and add `tds[2] === src.publisherType` plus a membership check against the exported list. The `<thead>` string in index.html and the `min-width:1040px` CSS rule go together. `style.test.js` line 70 ("print shows each register URL once") may be sensitive to register markup; re-run.

### Pitfall 4: Numerals in legal and incident prose (numeric gate)
See "four doors". Dates in the regulation block, "Article 50", "Part 2", "2024 BCCRT 149" and the Getty citation are the hot spots. Specific traps: "Part 2" (the Copyright Office report title) contains a numeral; reuse the pattern of the existing `.statute` span or reference the report as "the Copyright Office's copyrightability report". "EWHC", "BCCRT" citations belong in register rows. `Figure \d+` and `Section` cross-links are exempt, so "see section 11" must be written as `<a href="#s11">section 11</a>`.

### Pitfall 5: COI note text identity and VENDOR_RE interplay
The test `no vendor names outside s12 and s15, apart from the COI notes` strips every `<div class="callout coi">…</div>` and exactly one `<p>` starting "Getty v Stability" (line 387). s14's Getty sub-section must repeat the COI callout verbatim above it (UI-SPEC test), so the existing "exactly one Getty line is exempt" assertion (line 392) will break if the s14 prose has a paragraph that starts with "Getty v Stability" (s05 already has one). Start the s14 paragraph differently ("The UK case between Getty Images and Stability AI …") or extend the exemption deliberately. "Getty" and "Stability" are not in VENDOR_RE, but "Google Ads" (NYU/Emory) and "Microsoft" are: avoid them in s13/s14.
Also `Intercom exactly once outside s12 and s15, in s06` stays strict: do not name Intercom in s13.

### Pitfall 6: Source-claim grade sharing and chips
`test/data.test.js` "claims citing a source share its grade" and the governing chip rule: if s13/s14 add a `data-fig` that cites a source, its grade must equal the source's grade, and each paragraph needs a linked chip at the first use. Incident table rows hold `.cite` links (not chips) so that "row without data-figs has at most one chip" is not triggered; keep Grade chips out of the incident table and out of `.status` cells. The risk register has a Grade column: one chip per row, in the last cell, linked to a register row. `.status` is not a chip; do not give it `class="chip"`.

### Pitfall 7: Existing-page a11y checklist items that already deviate
- The UI-SPEC says "no sticky/fixed element exists (2.4.11)", but `.matrix tbody th[scope=row] { position: sticky; left: 0 }` exists inside a scroll region. The a11y script should allow sticky only inside `.matrix .table-scroll` and record it as an accepted exception (it is horizontally sticky within its own scroll container and cannot obscure focus at page level).
- Landmarks measured today: banner 1, main 1, navigation 1, **contentinfo 1** (footer), plus 40 `region` nodes (15 `<section aria-labelledby>`, the `aria-label` summary and named scroll regions), 3 `status` roles. The UI-SPEC list omits the footer; the check must allow it. `role="alert"` on `.calc-errors` is a live region listed in 03-UI-SPEC.
- Heading counts today: h1 1, h2 16 (15 sections plus the legend title "How to read the grades"), h3 28. The legend h2 precedes the sections; fine for order.
- Phase 3 UI review open items (below) touch a11y targets: radios 13px (WCAG 2.5.8 needs 24px or spacing), inline links at 22px height (exempt inline), `details.maths summary` lacks a marker.

### Pitfall 8: Cannot re-fetch Gartner and SSRN
Do not attempt headless-browser or user-agent tricks. The sandbox refused an attempt as bot-check circumvention. Keep the user's confirmation and add the corroboration sentence; stamp only what was actually fetched.

### Pitfall 9: Press-sourced "Established"
"Established" for Guess/Vogue and Coca-Cola reception are the two judgment calls. Coca-Cola is marked Disputed because the company's own statement and the press differ on reception. If the author prefers conservatism, mark Guess "Alleged" and say so; the table text is neutral either way. Do not add any quantity (clips, comments, views).

## Code Examples

### Crosscheck: what exists vs what is new (QA-04)

| Check | Exists today? | Where | Action |
|---|---|---|---|
| Every `data-fig` span equals data.js display | yes | page.test.js "every data-fig matches data.js display" | Reuse; crosscheck calls the same helpers or re-implements 10 lines |
| Every graded number has a register entry (claim ref resolves to a `src-`/`asm-` row on the page) | partly: "registers cover every source and assumption" is the reverse direction (data to page) | page.test.js line 149; data.test.js "refs resolve" | **New**: for every `data-fig` and chip href on the page, the `#id` resolves to a `<tr id>` in s15 |
| Chip grade and class equals the register row's grade | yes | "every linked chip states the grade of the row it links to" | Reuse |
| Calculator defaults equal prose/static values | mostly: calc-page.test "results table cells equal present(defaults)", "Default N hint pinned to data.js", smoke case a | calc-page.test.js | **New small**: each `input#in-*` `value`/hint default equals `assumptions[...]` default (twelve fields) and the static `data-fig="calc-*"` equals `present(defaults)` for all rows, not only the table |
| Every register row is referenced or justified | no | | **New**: for each `<tr id="src-*">` / `asm-*`, count in-page references (`href="#id"`, `.cite`, chips). Unreferenced rows must be in a small `JUSTIFIED_UNREFERENCED` map in crosscheck.mjs with a reason (e.g. rows that exist only as register entries for the vendor matrix are referenced via `.cite`; likely few). Print the list |
| Every source has a publisherType from the fixed list, and the register cell equals it | no | | **New** (also in page.test field-by-field) |
| "McKinsey: no figure is used" note present iff no McKinsey in page/data | no | | **New** (`/mckinsey/i` absent from both but the note's text) |
| Every evidence gap is traceable | no | | **New (optional)**: each `.gaps li` bold lead maps to a keyword list or assumption id |
| Legal flag present and ordered (after `.callout.coi`, before `#answer`); never `display:none` | UI-SPEC test hook | | **New** in page.test.js (static CSS scan including `@media print`) |
| Every `<time>` datetime valid; every `.status` row has time, one status word, `.cite` to a dated register row | partly | page.test.js line 420 | **New/updated** |
| Every `id` unique; every `href="#…"` resolves | `href` resolves yes (line 135); **id uniqueness no** | | **New** |
| No `style=` attribute; no inline script/handler | partly yes (static page guards; handlers) | | Add `style=` assertion |
| Table has caption, `th scope`, labelled `tabindex=0` region; svg has title and desc | partly (various) | | **New page-wide** static versions of the UI-SPEC checklist, so CI covers what Chrome covers locally |

`scripts/crosscheck.mjs` skeleton (Node built-ins only):

```js
// Source: pattern from test/page.test.js helpers; no dependencies.
import { readFileSync } from 'node:fs';
import { claims, assumptions, sources, PUBLISHER_TYPES } from '../site/js/data.js';
const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
export function run() {
  const failures = [];
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const dupes = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]).filter((v, i, a) => a.indexOf(v) !== i);
  if (dupes.length) failures.push(`duplicate ids: ${[...new Set(dupes)].join(', ')}`);
  for (const [, id] of html.matchAll(/data-fig="([^"]+)"/g)) {
    const e = claims[id] ?? assumptions[id];
    if (!e) { failures.push(`data-fig ${id} has no data.js entry`); continue; }
    const ref = claims[id] ? claims[id].ref : id;
    if (!ids.has(ref)) failures.push(`data-fig ${id}: register row ${ref} missing`);
  }
  for (const [k, s] of Object.entries(sources)) {
    if (!PUBLISHER_TYPES.includes(s.publisherType)) failures.push(`src-${k}: publisherType`);
  }
  return { failures };
}
if (import.meta.url === `file://${process.argv[1]}`) { const { failures } = run(); failures.forEach((f) => console.error(`FAIL ${f}`)); process.exit(failures.length ? 1 : 0); }
```
and `test/crosscheck.test.js`: `import { run } from '../scripts/crosscheck.mjs'; test('crosscheck passes', () => assert.deepEqual(run().failures, []));`. Existing tests scan `site/js` for network/storage/eval (calc-page.test.js line 191): scripts/ is not scanned, but keep crosscheck free of network anyway.

### CDP accessibility pass (reuse smoke.mjs `withPage`)

Verified in a probe this session (baseline numbers in the next table). Do not use `--dump-dom`; use `withPage` (CDP) and `Runtime.evaluate` for DOM rules, `Accessibility.getFullAXTree` for roles and names.

```js
// Source: probe run 2026-10-24 against site/ (Chrome headless=new, Node WebSocket)
await send('Accessibility.enable');
const { result: { nodes } } = await send('Accessibility.getFullAXTree');
const named = ['button', 'link', 'textbox', 'spinbutton', 'radio', 'combobox', 'region', 'table'];
const unnamed = nodes.filter((n) => !n.ignored && named.includes(n.role?.value) && !(n.name?.value || '').trim());
// roles: count banner, main, navigation, contentinfo; region must have a name
```

DOM checks via `evalJs`:
- Headings: collect `h1..h6` in DOM order; assert exactly one h1; each step up at most one level; h4 only under an h3 within the same section.
- Each `section[id]` has `aria-labelledby` pointing to an existing h2 id; `html[lang="en-GB"]`; one `<title>`.
- First focusable element is `a.skip[href="#answer"]`; collect tabbable elements (`a[href],button,input,select,textarea,summary,[tabindex]:not([tabindex="-1"])`, not `[hidden]`/display none) and assert none has `tabIndex > 0`; focus order follows DOM (compare `compareDocumentPosition` order with the array order; expected equal since no positive tabindex).
- Visible focus: for each focusable, `el.focus()` then `getComputedStyle(el).outlineStyle !== 'none'` and `outlineWidth !== '0px'` (the CSS may use `:focus-visible`; call `Emulation` keyboard first or dispatch `Input.dispatchKeyEvent` Tab so focus-visible applies; otherwise test the CSS rule statically).
- Targets: `getBoundingClientRect` of `input,button,summary` >= 48 high; `.chip`, `.cite` >= 24 x 24 (known Phase 3 deviations: radios 13px, see UI review; decide before enforcing).
- Table checks: every `table` has `caption`, `thead th[scope]`, tbody row headers `th[scope=row]` where first column is a label, and is inside `.table-scroll[role=region][aria-label][tabindex="0"]`; every `svg[role=img]` has `title` and `desc` and `aria-labelledby`.
- `<time datetime>` valid; no `style=` attribute; no `script` other than one module; CSP meta string unchanged (compare to existing test constant).
- 320px: `Emulation.setDeviceMetricsOverride {width:320,height:800,mobile:false}`; assert `document.documentElement.scrollWidth <= 320` and that no element outside `.table-scroll,.fig-scroll` has `getBoundingClientRect().right > 320.5`; each `.table-scroll` is focusable and named. Use `mobile:false` (as in the probe) so the page is not scaled by a layout viewport.
- Text spacing (1.4.12): inject a style via `Page.addScriptToEvaluateOnNewDocument` or `Emulation`-free approach: `evalJs` appends `<style>*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}</style>`; then re-run the overflow check and assert text elements are not clipped (`scrollHeight <= clientHeight` for elements with `overflow:hidden`). The CSP blocks injected inline styles only if it covers style-src; since this is a test in the browser context, use `CSS.addStyleSheet`-free approach: `new CSSStyleSheet()` with `document.adoptedStyleSheets` (adopted sheets are not blocked by CSP `style-src` attribute rules). [ASSUMED: not tested; if blocked, set a long timeout and fall back to `Emulation.setEmulatedMedia`-free DevTools `CSS.createStyleSheet`]
- Reduced motion: scan CSS text for `scroll-behavior` and assert it sits inside `@media (prefers-reduced-motion: no-preference)`.
- Colour independence (1.4.1): static test: `.status`, `.asat`, `.gaps`, `.legal-flag` rules contain no `color:` token outside `--ink/--muted/--rule/--paper*`; no `--low/--verified` in them (UI-SPEC style test hook).
- Contrast: existing `test/style.test.js` helper; add `.status` border-colour (ink on paper-2: 3:1 non-text) and `.legal-flag` assertions with the same helper.

### Baseline measured today (before Phase 4 changes)

| Measure | Result | Method |
|---|---|---|
| scrollWidth at 320 CSS px | 320 (no overflow); zero elements beyond 320.5 outside scroll regions | CDP probe |
| AX tree | 11,293 nodes; banner 1, main 1, navigation 1, contentinfo 1; headings 45; tables 23; textboxes 13; radios 3; buttons 2; links 303; 0 unnamed interactive nodes | `Accessibility.getFullAXTree` |
| Positive tabindex | 0 | DOM |
| Print via `Page.printToPDF` with `Emulation.setEmulatedMedia {media:'print'}` | 1,274,901 bytes, **40 pages**, text extractable | `/Type /Page` count; `pdftotext -l 1` shows masthead on page 1 |

### Print check design (QA-02)
`Emulation.setEmulatedMedia({media:'print'})`, `Page.printToPDF({printBackground:true, preferCSSPageSize:true})`, decode base64, write to the OS temp dir, count `/Type /Page`. Record the page count (expected well above 40 after s13 to s15 grow; assert it is below a recorded ceiling only as a drift tripwire, say the new count plus 15%). Assert: (a) no blank pages: with `pdftotext -f N -l N`, every page has more than 20 characters (skip if `pdftotext` is absent, with a note); (b) legal flag text and the COI text appear in `pdftotext -l 1` output (page 1); (c) in print emulation, `getComputedStyle` of `.legal-flag` is not `display:none`, and `details.maths` is `open`, `.calc-live .btn`, `.share`, `.calc-errors`, `.calc-nojs` computed `display:none`; (d) clipping: with print media emulated and viewport set to the A4/Letter content width (about 718 CSS px at 96 dpi for 8.5in minus margins; use 700), every `td/th` has `getBoundingClientRect().right <= innerWidth + 0.5` and `document.documentElement.scrollWidth <= innerWidth` after `.table-scroll{overflow:visible}` and `min-width:0`. The UI-SPEC print block must include the `.register` `min-width:0` override or the 1040px register will clip, which is exactly what this check catches.

### QA-03 re-verification execution
Add `scripts/reverify.mjs` (Node built-in `fetch`, local only, not in CI, polite: sequential with a 1 s gap, a single realistic `user-agent` is acceptable but no circumvention): for each source GET the URL, record status and a required phrase (a short `verifyPhrase` per source, stored in a plain map in the script, not in data.js), print a table `id status phrase-found`. Anything non-200 or phrase missing: do not change `accessed`; add the UI-SPEC "Re-check failed {date}; last verified {date}." sentence to the Claim cell via `read_via` or a new `recheck` field. Phrase candidates already verified in this session: Optimizely "173,000", Stern "31.5%", USCO "Copyrightability", arXiv titles. The vendor rows are 200 today; the content re-check against s12's "says/documents" statements is a separate manual step that cannot be fully automated; record "status only" honestly in the VERIFICATION file.

## Phase 3 UI-review hook (for Plan 1)

`03-UI-REVIEW.md` (17/24, advisory, committed in d741d62) and STATE.md Pending Todos say "Fold into Phase 4 Plan 1". Plan 1 should have a task "Fold Phase 3 UI-review fixes" that reads `.planning/phases/03-levers-outcomes-calculator-comparison-slice/03-UI-REVIEW.md` "Top priority fixes" 1 to 8 and "Phase 2 carry-over check", and adds Phase 3's "Change column sign convention" and the invalid-field to hashchange re-check (smoke case suggestion: navigate with `campaigns=0` then hashchange to `reviewers=4`). Most relevant to Phase 4 QA: fix 2 (radios 24px, a WCAG 2.5.8 item), fix 1 (disclosure marker on `details.maths summary`), fix 8 (hint units), fix 7 (s10/s12 word-budget exceptions). Fix 5 (49 identical chips in s11) conflicts with the "chip density rule stays strict": resolve in Plan 1 by editing the test and UI-SPEC deliberately (do not silently drop chips). If review findings change before planning, the hook is that Plan 1 reads the file at execution time rather than copying findings.

## State of the Art

| Old approach | Current approach | When changed | Impact |
|--------------|------------------|--------------|--------|
| AI Act Art. 50 applies 2 August 2026 for all | Same date, plus Art. 111(4): marking duty for generative systems already on the market by 2 December 2026 | Regulation (EU) 2026/1744, OJ 24 July 2026 | Page must say "providers already on the market" and that deployer duties are not delayed |
| Code of practice in drafting | Final Code of Practice on Transparency of AI-generated Content, Commission/AI Board assessed it adequate | June 2026 reporting; Commission page | Cite the Commission page; the code is voluntary |
| Getty v Stability: first-instance ruling | Permission to appeal granted December 2025; US case continues in N.D. Cal. | 2025-12; 2026-04 (DMCA 1202 ruling) | "Appeal pending, no hearing found" with a check-again note |
| FTC: guidance only | Rule banning fake reviews including AI-generated, in force October 2024 | 2024-08-14 announcement | Cite as one example; do not claim an AI-influencer rule |

**Deprecated/outdated in the repo:** CONTEXT's phrase "Gartner agent-adoption percentages" (these are generative-AI ROI figures); `ailawsuittracker-getty-uk.published = 2026-10-11` (tracker footer now 2026-10-19); STATE/UAT note "permission to appeal 2025-12-16" (CMS says 17 December).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Backlog 0 default of 5 working days is a sensible, modelled-and-labelled choice | s13 | Low: Modelled, replaceable; CONTEXT leaves N to discretion |
| A2 | Coca-Cola row status "Disputed" and Guess row "Established" are defensible readings of the UI-SPEC definitions | V1 | Medium: reader may disagree; wording is neutral and sourced; author can flip statuses |
| A3 | `adoptedStyleSheets` bypasses CSP for the text-spacing test | CDP design | Low: only affects a local test; fallback noted |
| A4 | The OJ publication date 24 July 2026 for Regulation (EU) 2026/1744 | V2 | Low: from an EUR-Lex search snippet; the PE-CONS text confirms adoption date 8 July 2026 and the entry-into-force rule. If unsure, say "adopted July 2026" |
| A5 | "government" is the closest allowed type for ASA (an industry-funded regulator) | Source register | Low: label only; never changes a grade |
| A6 | Existing vendor/other rows are still accurate on their own pages (only HTTP status was re-checked) | V7 | Medium: a vendor could have changed pages; s12 text carries "checked 2026-10-24" dates. Flag in VERIFICATION as status-only |
| A7 | FTC Rytr order reopened 22 Dec 2025 and ASA 2026 SoulTalk ruling (search summaries only) | V3 | None if not cited; do not cite |

## Open Questions (all RESOLVED, planner proceeds without user input)

1. **Which incidents go in the table?** RESOLVED: five rows (McDonald's NL, Coca-Cola, Guess/Vogue, Moffatt v Air Canada, Levi's), statuses as in V1; everything else dropped.
2. **Is the 2 December 2026 date real?** RESOLVED: yes, Art. 111(4) (Regulation (EU) 2026/1744); applies only to Art. 50(2) marking for systems already on the market before 2 August 2026.
3. **Use the Gartner 49/40/27%?** RESOLVED: verified (they are 2025 GenAI ROI figures), but leave them off the page; fix the "not used" note wording.
4. **Getty appeal status?** RESOLVED: permission to appeal granted December 2025 on the secondary-infringement point; no Court of Appeal hearing or judgment found as at 24 October 2026; US case active; 16 vs 17 December discrepancy recorded.
5. **Can Phase 4 close the open human UAT items?** RESOLVED: no. Phase 1 UAT is closed (passed). Phase 2 UAT item 3 (Getty tracker facts) is now corroborated by two trackers and Phase 4 re-verification, but it is the author's COI check and stays open; items 1 (visual/print) and 2 (stock-licence indemnity wording, COI) remain the author's. Phase 3 UAT items 1 to 4 (vendor fairness, legal wording of 17 U.S.C. 504(c) and the s12 admission, tone, hands-on calculator) remain the author's; Phase 4 adds the legal flag and LEGAL-REVIEW.md that item 2 says "lands in Phase 4". Phase 4 adds its own UAT: screen readers (VoiceOver plus one), 200%/400% zoom, real-device 320/375, grayscale print review, s13/s14 tone, incident wording. Record these as pending, not passed.
6. **Indemnity wording?** RESOLVED: keep the generic Modelled wording ("terms vary; read them"), list it in LEGAL-REVIEW.md, and leave the author's COI confirmation (02-HUMAN-UAT 2) open. Not re-verified against any named vendor terms (neutrality constraint).
7. **Where do register stamps for failed re-fetch go?** RESOLVED: add the UI-SPEC sentence to the Claim cell through data.js `read_via` text (tested field by field) so the register stays equal to data.js.
8. **Does QA-04 need a browser?** RESOLVED: no. Static `crosscheck.mjs` runs in CI; Chrome-dependent checks (a11y, print, 320) live in local scripts and are run once per milestone and recorded in 04-VERIFICATION.

## LEGAL-REVIEW.md inventory approach

Give each legal statement an anchor id as UI-SPEC says (`legal-s05-getty`, `legal-s05-imagery`, `legal-s05-indemnity`, `legal-s09-statutory`, `legal-s09-notadvice`, `legal-s12-admission`, `legal-s14-copyright`, `legal-s14-getty`, `legal-s14-regulation`, `legal-s14-agent-liability`). Today's known legal statements: the s05 imagery table (`asm-imagery-routes`, `asm-imagery-indemnity`), the single Getty line at index.html line 417, the s09 "Not legal advice" callout (line 511), the 17 U.S.C. 504(c) and 412 table and illustration (s09), and the s12 spine admission. `LEGAL-REVIEW.md` columns: id, section, statement (one line), source id, what counsel should check. Add a `node:test` that every `id="legal-…"` in the page appears in LEGAL-REVIEW.md and vice versa. The top flag text is asserted verbatim: "Legal wording on this page has been flagged for review and has not yet been reviewed by counsel." (UI-SPEC: optional second sentence "Nothing here is legal advice.") and sits between the `.callout.coi` and `#answer`; `test/page.test.js` line 477 ("s01 holds both callouts verbatim and the front matter does not duplicate them") and the COI `<div class="callout coi">` regex used in the VENDOR_RE test must still match: the new flag is `<div class="callout legal-flag">`, which the `callout coi` regex does not match, so its text is subject to the vendor scan (it names no vendor, fine).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | tests, crosscheck | yes | v23.7.0 (CI Node 22) | none needed |
| Google Chrome (headless) | a11y, print, smoke | yes | `/Applications/Google Chrome.app` (CDP probe succeeded) | `CHROME` env override; skip locally if absent |
| python3 | static server for CDP runs | yes | system | any static server |
| pdftotext | page-1 PDF text check | yes | `/opt/homebrew/bin/pdftotext` | skip text assertions, keep page count and DOM checks |
| curl / fetch to public sites | re-verification | yes, except gartner.com, papers.ssrn.com, EUR-Lex (202 challenge), BBC (404/403), PetaPixel, FashionNetwork, CourtListener, Business Wire (403) | | keep last verified date plus note; use public reproductions where available |
| GitHub Pages workflow | deploy | yes (existing) | actions v5/v6/v7 majors as in file | |

**Missing with no fallback:** none. **Missing with fallback:** the 403/202 sites above.

## Validation Architecture

`workflow.nyquist_validation` is `false` in `.planning/config.json`, so the formal Nyquist section is omitted. The validation design for this phase is carried by the sections "Crosscheck", "CDP accessibility pass", "Print check design" and "QA-03 re-verification execution" above. Test commands: quick `node --test test/page.test.js test/data.test.js test/crosscheck.test.js`; full `node --test`; local CDP `node scripts/smoke.mjs && node scripts/a11y.mjs`.

## Security Domain

Static page with no server, no user data storage and no network calls (tests enforce). Applicable: V5 Input validation (calculator already validated; hash parsing tested), V14 Configuration (CSP meta string pinned; do not change). New content adds only static HTML and text: no new script, inline style or handler (tests: single module script, no `on*=`, add `style=` ban). External links in s14/s15 are plain `<a href>`; consider `rel="noopener"` only if `target="_blank"` is ever added (it is not today). Re-verification script reads public pages only, stores nothing, sends no site data. Threat: link rot or content-swap at a cited URL; mitigation: dated accessed stamps and the check-again clause.

## Sources

### Primary (HIGH confidence)
- Council/Parliament final text of the Digital Omnibus on AI, PE-CONS 30/1/26 REV 1, https://data.consilium.europa.eu/doc/document/PE-30-2026-REV-1/en/pdf (downloaded and read: Art. 111(4) addition, recital 38, Art. 50(7), entry into force clause)
- European Commission, Code of Practice on Transparency of AI-generated Content, https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content (fetched)
- BC Civil Resolution Tribunal, Moffatt v Air Canada, 2024 BCCRT 149, https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do (downloaded as PDF and read)
- Crossref API for 10.1177/0018720810376055 (Parasuraman and Manzey)
- ASA, https://www.asa.org.uk/news/disclosure-of-ai-in-advertising-striking-the-balance-between-creativity-and-responsibility.html (29 May 2025; fetched)
- FTC, https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials (fetched)
- Levi Strauss & Co., https://www.levistrauss.com/2023/03/22/lsco-partners-with-lalaland-ai/ (fetched)
- NYU Stern research highlight, https://www.stern.nyu.edu/experience-stern/faculty-research/ai-advertising-paradox (6 November 2025; fetched)
- Repository files read: 04-CONTEXT.md, 04-UI-SPEC.md, test/page.test.js, test/style.test.js, test/data.test.js listings, scripts/smoke.mjs, site/js/data.js, site/index.html, `.github/workflows/pages.yml`, 03-UI-REVIEW.md, the three HUMAN-UAT files

### Secondary (MEDIUM confidence)
- artificialintelligenceact.eu Art. 50 (unofficial consolidated explorer; reflects the amended text), https://artificialintelligenceact.eu/article/50/
- CMS tracker https://cms.law/en/int/publication/artificial-intelligence-and-copyright-case-tracker/united-kingdom-getty-images-us-inc-ors-v-stability-ai-ltd ; AI Lawsuit Tracker UK and US pages; Taylor Wessing; Jones Day (June 2026)
- NBC News (McDonald's, 2025-12-11; Levi's, 2023-04-30), BNN Bloomberg (2025-12-10), TODAY (2025-11-04), ABC7 (2025-08-01), ContentGrip (2025-08-05)
- silicon.co.uk reproduction of the Gartner 2025 release (49/40/27%, 7.7%, 402 respondents)

### Tertiary (LOW confidence, not to be cited on the page)
- Search summaries only: EUR-Lex OJ date 24.7.2026 for 2026/1744, FTC Rytr reopening, ASA SoulTalk ruling, Gartner 2026 release figures via media summaries, AI Vortex hearing estimate, Simmons & Simmons/Usercentrics commentary on the omnibus scope

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH (no new dependencies; harness verified by a probe)
- Architecture and test impacts: HIGH (read from test code; four collisions identified by line)
- Verified facts (regulation, Moffatt, Parasuraman, Gartner, Getty UK): HIGH to MEDIUM (primary text read; Getty and press via trackers)
- Incident statuses and Backlog 0 default: MEDIUM (judgement calls recorded as A1, A2)
- Pitfalls: HIGH

**Research date:** 2026-10-24
**Valid until:** 2026-11-07 for the regulation and Getty statuses (fast-moving; re-check before the final deploy); 30 days for the rest.
