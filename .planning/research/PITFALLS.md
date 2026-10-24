# Domain Pitfalls

**Domain:** Scaling AI content generation to 2x in enterprise marketing, plus the persuasive evidence-graded page ("CMO 2x") that argues for it
**Researched:** 2026-10-24
**Overall confidence:** MEDIUM. Incidents are well documented in trade and news press. Quantitative claims about reviewer fatigue and attribution inflation are mostly secondary or vendor sources. Page-level technical items rest on W3C and standard practice.

Phase labels used below (map to roadmap as needed):
- **P-Content**: research and claim register, grading, source register
- **P-Spine**: build-and-review section (review agent, tiers, eval harness)
- **P-Outcomes**: outcome case, CFO answer, headcount
- **P-Calc**: calculator
- **P-Build**: page build, accessibility, deploy
- **P-Risks**: the candid "what goes wrong" section

Evidence-handling rule for all incidents below: cite the primary or news source, state what is established vs. alleged, and never imply that sales or brand-health damage was measured when the sources only show social backlash.

---

## Part A. What marketing orgs get wrong when scaling AI content

### Critical A1: Shipping AI-looking creative into emotionally loaded brand moments (slop and brand dilution)
**What goes wrong:** Polished-but-uncanny output at scale draws public backlash, and "we saved time and money" becomes the story.
**Documented cases:**
- Coca-Cola holiday ads, 2024 and 2025. Backlash both years. In 2025 Coca-Cola said ~100 people worked on it, with five AI specialists generating 70,000+ clips in a month. Critics cited shot-to-shot style drift. Marketing chief defended it on speed and cost. https://designcompass.org/en/2025/11/10/coca-colas-ai-ad-faces-backlash-again-this-year/ and https://www.nbcnews.com/news/amp/rcna180665 (confidence MEDIUM; no sales impact verified)
- McDonald's Netherlands, Dec 2025. 45-second AI spot pulled within days, called "an important learning." Producer: "thousands of takes", team "hardly slept" for seven weeks. Note the counter-lesson: the AI ad was not cheap in labour. https://www.nbcnews.com/world/europe/mcdonalds-ai-generated-christmas-advert-social-media-backlash-rcna248590 and https://www.techradar.com/ai-platforms-assistants/mcdonalds-pulls-ai-generated-christmas-ad-after-backlash-over-soulless-visuals-and-holiday-chaos (MEDIUM)
- Guess ad in Vogue, Aug 2025. AI model with a tiny corner disclosure ("Produced by Seraphinne Vallora on AI"). Backlash over disclosure and craft. https://www.contentgrip.com/guess-vogue-ai-model/ (MEDIUM)
- Levi's / Lalaland, Mar 2023. AI models pitched as a way to "increase diversity" drew accusations of substituting for hiring diverse models. Levi's clarified it was not a substitute. https://rangefinderonline.com/news-features/after-backlash-levis-ai-generate-models/ (MEDIUM)
- Sports Illustrated fake AI bylines, Nov 2023 (content, not ads, but the trust-collapse pattern is the same; parent company blamed a third party). https://www.vpm.org/npr-news/2023-11-28/some-of-the-bylines-in-sports-illustrated-likely-arent-real-people-theyre-ai-generated-writers) (MEDIUM)
- Consumer perception research: NIQ (vendor, press release only, no independent verification) reports consumers identify most AI ads and rate them "annoying, boring, confusing"; the "weak memory activation" claim could not be verified in detail. https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/ (LOW-MEDIUM)
**Why it happens:** Volume tiers treat all assets as equal. Hero, emotional, and talent-led work gets the same pipeline as resizes.
**Consequences:** Earned-media backlash, pulled campaigns, "AI-first" framing becomes the brand story.
**Warning signs:** Page or plan describes AI for "everything"; no tier that excludes hero/brand-moment work; no disclosure policy.
**Prevention:** Make the tiering explicit: AI-led for variants, resizes, localisation, catalog, and tests; human-led for hero and cultural moments. Say on the page that the 2x applies to variant volume, not to flagship creative. Add a "human-only list" to the review spine.
**Phase:** P-Spine (tier definitions), P-Risks (cases).

### Critical A2: Creative sameness and fatigue (convergence at scale)
**What goes wrong:** Many assets, little differentiation. 10,000 variants of one idea is one idea.
**Evidence:** Doshi and Hauser, Science Advances (Jul 2024): AI-assisted stories were rated more creative individually but were more similar to each other than human-only stories (a collective diversity cost). Lab study on short stories, not ads, so transfer to ad creative is an inference. https://pmc.ncbi.nlm.nih.gov/articles/PMC11244532 (HIGH on the study, LOW on transfer)
**Warning signs:** Variant count rises while the number of distinct concepts is flat; fatigue-detected-to-refresh time grows; test winners are near-duplicates.
**Prevention:** Define a "distinct concept" metric alongside asset count (concepts per campaign, variants per concept). Cap variants per concept. Require diversity checks in the eval harness (embedding distance between concepts). Grade this claim Speculative on the page.
**Phase:** P-Spine, P-Outcomes (learning velocity).

### Critical A3: Goodhart on asset counts (and on AI spend)
**What goes wrong:** Once "assets produced" or "AI spend" is the target, it stops measuring what you want. The 2x headline becomes the gaming target.
**Evidence:** General principle (Goodhart/Strathern: "when a measure becomes a target, it ceases to be a good measure"). No marketing-specific peer-reviewed case found. The Coca-Cola 70,000-clips-to-one-ad ratio is a useful illustration that raw generation counts are not output.
**Warning signs:** Headline metric is assets, impressions, or spend; no pairing with outcome metrics; targets set per team without quality gates.
**Prevention:** Define output as "approved-and-live assets per marketing head that pass the gate", paired with outcome metrics (conversion, rejection rate, rights incidents). Treat AI spend as a floor, never a KPI (already a project decision). Show the metric definition in the first screen of the page. State explicitly what would falsify the 2x.
**Phase:** P-Content (metric definition), P-Outcomes.

### Critical A4: IP, copyright, likeness, and training-data exposure (and over-trusting indemnification)
**What goes wrong:** Teams assume "commercially safe" or "indemnified" equals "no risk".
**Evidence:**
- Getty Images v Stability AI, UK High Court, 4 Nov 2025 ([2025] EWHC 2863 (Ch)): secondary copyright claim failed; narrow, "extremely limited" trade mark findings for older model versions where watermarks appeared in outputs; Getty had dropped primary training and output claims, so those issues remain undecided in the UK. https://www.aippi.org/news/getty-images-v-stability-ai-uk-high-court-finds-no-secondary-copyright-infringement-in-landmark-genai-ruling/ and https://www.mishcon.com/news/getty-images-v-stability-ai-unpacking-the-high-courts-judgment (HIGH on the facts, appeal status not checked). Disclosure: the author works at iStock/Getty, so this case must be described neutrally and flagged as a party interest.
- US Copyright Office, Part 2 (29 Jan 2025): prompts alone are insufficient for authorship; protection needs human-authored expression or creative modification. Consequence: fully generated assets may be unprotectable, so competitors can copy them. https://copyrightalliance.org/ai-report-part-2-copyrightability/ (HIGH)
- Indemnities exist from some tool and content vendors (reported 2023 by Adobe and Shutterstock). The searches did not surface caps, exclusions, or conditions, and terms may have changed. https://petapixel.com/2023/07/10/shutterstock-announce-legal-protection-for-its-generative-ai-users (LOW on current terms; verify before stating anything specific)
**Warning signs:** Plan says "indemnified, so safe"; no policy on likeness, trademarks, or recognisable characters in prompts; no record of which model produced which asset.
**Prevention:** On the page, state that indemnity is a risk transfer with conditions, not risk removal, and that terms vary by vendor and must be read. Keep provenance metadata per asset (model, version, prompt, reviewer). Add automated checks to the review agent for logos, third-party marks, and recognisable people. Flag that unprotectable output matters for brand-asset ownership. Do not name vendors on the page (project constraint), so cite the court and Copyright Office, not vendor terms.
**Phase:** P-Spine, P-Risks. Flag legal review of the page wording itself.

### Critical A5: Regulatory and ad-standards exposure (disclosure, substantiation, deception)
**What goes wrong:** AI-generated imagery misrepresents the product; AI claims are unsubstantiated; required labels are missing.
**Evidence:**
- EU AI Act Article 50: transparency duties apply from 2 Aug 2026; deployers must disclose deepfakes with visible or audible labels (machine-readable marks added by providers do not satisfy this); the Commission published a voluntary Code of Practice on marking and labelling on 10 June 2026; one source reports a transition to 2 Dec 2026 for machine-readable marking for systems already on the market, with no grace period for deployer disclosure. Sources are law-firm commentary; check the Commission text. https://connectontech.bakermckenzie.com/new-eu-guidance-on-ai-transparency-what-should-companies-be-doing-from-2-august-2026 and https://www.heuking.de/en/news-events/newsletter-articles/detail/the-european-commission-specifies-labelling-requirements-for-ai-generated-content-and-deepfakes.html (MEDIUM; verify against the primary text before publishing specifics)
- UK ASA: WiggyDog ruling, where AI or real puppy footage reinforced a "lifelike" claim the product could not support; Henry's Boots, where AI-generated "Henry" and unsupported claims were upheld. CAP codes are media-neutral. https://marketinglaw.osborneclarke.com/advertising-regulation/asa-clamps-down-on-wiggydogs-exaggerated-robot-puppy-claims/ and https://marketinglaw.osborneclarke.com/advertising-regulation/henrys-boots-gets-the-boot/ (MEDIUM)
- FTC Operation AI Comply (25 Sep 2024): action against unsubstantiated AI claims (DoNotPay, $193,000) and an AI tool built to bulk-generate reviews (Rytr; 3-2 vote, dissent noted no allegation that the reviews were published). The FTC final rule on fake reviews (14 Aug 2024) is relevant to AI-generated testimonials. https://www.orrick.com/en/Insights/2024/10/FTC-Targets-Unfair-or-Deceptive-AI-Practices-With-Five-New-Enforcement-Actions (MEDIUM; no check of 2025-26 FTC posture changes)
- Willy's Chocolate Experience, Glasgow, Feb 2024: AI imagery that did not match the real event; police intervened; refunds issued. Extreme case, but it shows the product-fidelity risk. https://petapixel.com/2024/02/28/families-scammed-by-ai-images-that-promised-willy-wonka-style-event (MEDIUM)
- Liability for automated output stays with the brand: Air Canada chatbot tribunal ruling (BC Civil Resolution Tribunal, 2024). Details and amounts not verified; no primary URL retrieved in this pass, so find the tribunal decision before citing (LOW).
**Warning signs:** Product imagery generated rather than photographed for claim-bearing ads (e.g., "actual results", food, efficacy); testimonial-like copy produced by the generator; no per-market labelling rule set.
**Prevention:** Review agent includes a claim-substantiation tier: any asset with performance, efficacy, or "real person" implications is human-reviewed. A per-market disclosure rule table, versioned. Keep "regulatory dates" in a clearly dated callout on the page, because they move.
**Phase:** P-Spine, P-Risks. Research flag: re-verify EU Article 50 and Code of Practice text immediately before publication.

### Critical A6: Reviewer fatigue and rubber-stamping at volume
**What goes wrong:** Human review is the spine, but at 10,000+ assets it decays into approve-all.
**Evidence:** Automation bias is established in human-factors research (Parasuraman and Manzey, Human Factors, 2010). Specific numbers circulating (e.g., a 2023 radiology study accuracy drops) came through blog secondary citations and could not be verified; do not repeat them. https://dev.to/brennhill/automation-bias-why-people-rubber-stamp-ai-and-how-to-fix-it-2587 (LOW; find the primary papers)
**Warning signs:** Approval rate near 100%; median review time per asset falling; reviewers agree with the agent's score without comment; no seeded-error tests.
**Prevention:** Design review as sampling plus exception handling, not full inspection. Seed known-bad assets into queues and measure catch rate (the eval harness's "ground truth" job). Hide the agent's verdict until the reviewer has judged. Cap session length. Report reviewer catch rate on the page's governance section as a leading indicator. Grade the claim "tiered gates keep quality" as Modelled, not Benchmark.
**Phase:** P-Spine.

### Critical A7: Measurement that cannot attribute the lift
**What goes wrong:** Platform dashboards credit AI creative with lift that would have happened anyway; no holdout; many variants make stats under-powered (multiple comparisons).
**Evidence:** Practitioner and vendor sources report platform ROAS overstating incrementality (e.g., one geo-lift test reporting a 33% overstatement for one campaign type; a Digiday-cited "75% of 100+ tests poor"). All vendor-sourced; a "2.3x across 150 brands" figure came from an unverifiable vendor blog, so do not use it. https://www.ruleranalytics.com/blog/ppc/google-ads-roas/ (LOW)
**Warning signs:** Outcome case built on platform-reported ROAS; no geo or holdout design; "tests per quarter" counted as a win; winners declared at p<0.05 across hundreds of variants.
**Prevention:** Specify counterfactuals: holdout markets or audiences, pre-registered primary metric, correction for multiple comparisons, MMM calibrated with incrementality tests. In the page, mark every outcome claim Modelled or Speculative unless a controlled test is cited. Add an "evidence gaps" row: no public controlled study isolating AI-creative lift at scale (verify this negative claim before asserting it).
**Phase:** P-Outcomes, P-Content.

### Critical A8: Headcount and adoption failure (the CFO's real question, and the creatives' real fear)
**What goes wrong:** Either the page dodges the headcount question (CFO dismisses it) or the rollout alienates creators.
**Evidence:**
- Duolingo "AI-first", Apr 2025: backlash after a memo about phasing out contractors for AI-doable work; earlier reports of ~10% contractor cuts in 2024 (inconsistently reported); the CEO said he was misunderstood. Social posts were taken down and later restored. https://www.marketing-interactive.com/duolingo-goes-rogue-amid-ai-first-backlash (LOW-MEDIUM; aggregator-heavy)
- Klarna, May 2025: CEO said cheaper AI chatbots gave lower quality, and the company began rehiring humans while still expecting attrition-driven reductions. https://www.entrepreneur.com/business-news/klarna-ceo-reverses-course-by-hiring-more-humans-not-ai/ (MEDIUM; customer service, not marketing: analogy only)
- MIT NANDA "GenAI Divide" (Aug 2025): "95% of pilots show no measurable P&L impact". Widely cited but heavily criticised (small sample, undefined measure, vendor conflict). If cited, grade it Uncertain and note the criticism; better, don't lead with it. https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo and https://www.dbreunig.com/2025/09/15/ai-adoption-at-work-play.html (MEDIUM that the criticism exists)
**Prevention:** State the headcount position plainly: modelled scenarios (redeploy, hold flat, reduce) in the calculator with the cost shown for each. Treat creators as reviewers and curators with defined roles. Include change-management cost (training, review time) in the cost side; zero is not credible.
**Phase:** P-Outcomes, P-Calc, P-Risks.

---

## Moderate Pitfalls

### M1: Localisation errors and cultural failures
**What goes wrong:** Fluent but wrong; imperatives that read as commands; tone flat; wrong gestures or imagery for the market.
**Evidence status:** The famous anecdotes (KFC "eat your fingers off", etc.) are repeated across vendor blogs with no primary source. Do not use them as evidence. Only generic claims are supportable. https://multilingual.com/five-prominent-machine-translation-mistakes-in-advertising-campaigns/ (LOW)
**Prevention:** Use in-market reviewers per locale, back-translation checks, glossaries and do-not-translate lists, and a locale-specific rejection-rate metric. Grade any "x% of localisation can be auto-approved" claim as Speculative. Tier by risk: UI/catalog strings vs. slogans.
**Detection:** Rejection rates diverge sharply by locale; in-market teams re-do work silently.
**Phase:** P-Spine, localisation section.

### M2: Rights-expiry and usage breaches (and AI worsening them)
**What goes wrong:** Assets (talent, photography, music) used beyond licence term, territory, or medium. More assets and more variants mean more breach surface, and generated derivatives hide the source licence.
**Evidence:** Numerous complaints (outcomes largely not established in the results): Gilead photographer suit (Nov 2025), Roc Nation models (Dec 2025; social-only licence allegedly used on billboards), Clairol, Oliver Peoples. https://www.law360.com/articles/2411023 and https://www.complex.com/music/a/alex-ocho/models-sue-roc-nation-over-alleged-billboard-megan-thee-stallion-swiwsuit (LOW-MEDIUM: allegations, paywalled)
**Prevention:** Rights metadata (term, territory, media) bound to the asset and inherited by every derivative. Automated expiry takedown. Page should present these as allegations, not findings.
**Detection:** No expiry field on derivatives; takedown relies on email.
**Phase:** P-Spine, ops section.

### M3: DAM sprawl and metadata rot
**What goes wrong:** 2x assets means 2x untagged, duplicated, orphaned items; search degrades, reuse falls, rights data decays.
**Evidence:** No quantified, citable public source found in this research. Treat as Speculative (reasoned from first principles). Do not fabricate a figure.
**Prevention:** Mandatory metadata at generation time (not afterwards), dedupe and retention rules, a cost-of-storage line in the calculator. Metric: share of assets with complete rights and provenance metadata.
**Phase:** P-Spine, ops section.

### M4: Compounding "spend as KPI" and unit-cost illusions
**What goes wrong:** Cost per asset falls because the denominator includes unusable assets; review and rework costs are excluded.
**Prevention:** Cost per approved-live asset, including review time, rework, tooling, rights, and storage. Show the arithmetic on screen.
**Phase:** P-Calc, P-Outcomes.

---

## Part B. What makes a CMO or CFO dismiss the page

| Dismissal trigger | Why the reader reacts | Prevention |
|-------------------|----------------------|------------|
| Unsourced statistics | CFO asks "where is that from?" and discounts everything else | Every number has a grade and a register entry; no number without a source or "assumption" label. Never use unverifiable vendor stats (e.g., the 2.3x ROAS figure above). |
| Vendor-hype tone | Reads as a sales document | Vendor-neutral by category (project constraint); lead with failures; include the A1 incident list in the main text, not an appendix. Disclose the author's employer in the metadata block. |
| Vanity output metrics | "Assets produced" says nothing about value | Output metric defined with a gate and paired with outcome metrics (see A3). |
| No counterfactual | "Compared with what?" | State the baseline and a holdout design for each outcome claim (see A7). |
| Ignoring headcount | The CFO assumes that is the hidden agenda | Explicit scenarios with costs (see A8). |
| Calculator with hidden assumptions | Distrust, then ignoring the tool | All defaults visible, editable, sourced or flagged, with a "show the maths" view and a reset. |
| Treating a projection as fact | Credibility lost on first overclaim | Use "Benchmark / Modelled / Speculative" consistently; unverified items are Speculative, not softened. |
| One-sided risk treatment | "They are selling" | The risks section names the strongest counter-arguments, including that some pilots show no P&L gain (with source criticism) and that AI ads get consumer pushback. |
| Cherry-picked success stories | Survivorship bias | Include the failures above; note that cost-saving stories (e.g., a month vs. long production) still involved large human effort. |

**Phase:** P-Content (all), P-Calc.

---

## Part C. Page-level technical pitfalls

### C1: Calculator maths and units (Critical for credibility)
- **Unit confusion:** per head vs. per team, per year vs. per campaign, percent vs. fraction, currency symbol vs. thousands. Use a single internal unit set (assets, USD, hours, months) and format only at display.
- **Floating point:** do money maths in integer cents or round at defined points; avoid `toFixed` on intermediate values, since it returns a string and rounds unexpectedly (e.g., 1.005).
- **Variant explosion double counting:** sizes x channels x locales x audiences x tests is multiplicative, but dependencies are not (not every locale needs every size). Provide "applicable fraction" inputs. Never present the raw product as the work required.
- **Divide-by-zero and NaN:** empty or zero inputs show "NaN", "Infinity", or negative cost per asset. Validate, clamp, and show an inline message.
- **Baseline vs. 2x comparison:** apply the same cost components to both; if review time is omitted from 2x, savings are overstated. Include review capacity and reviewer-hours as a binding constraint (output cannot exceed review throughput at the chosen tier).
- **Hidden assumptions:** show the formulas and defaults, link each default to a register entry with grade, and allow the CFO to override all of them. Round-trip test: baseline inputs with 1x multiplier must return baseline outputs exactly.
- **Testing:** write the model as pure functions, unit-test with fixed fixtures (including zero, huge numbers, and 1x identity) before wiring to the UI.
**Phase:** P-Calc.

### C2: Misleading charts
**Pitfalls:** truncated y-axes, dual axes implying correlation, bar charts for non-zero baselines, un-labelled units, cumulative charts that make growth look steeper, projections styled like observations.
**Prevention:** Zero baselines for bars; visually distinguish Modelled and Speculative (dashed lines, hatching, grade chip) from Benchmark; every figure has a caption stating source and grade (matches the reference page's "Fig" convention); show ranges, not single points, for modelled results.
**Phase:** P-Build, P-Content.

### C3: Accessibility
**Pitfalls:** colour as the only carrier of confidence grade (also fails for colour-blind readers), low contrast chips, calculator inputs without labels, no live region for results, charts without text alternatives, focus order, motion.
**Prevention:** Grade chips carry text (e.g., "Modelled") as well as colour; labelled inputs and `aria-live="polite"` on outputs; provide a data table equivalent for each chart; keyboard-operable controls; contrast checked at AA. Regulatory context: the European Accessibility Act applies from 28 June 2025 to many consumer-facing services, though this page is a thought-leadership page and is probably out of scope; still, a CMO audience may notice. Treat WCAG 2.2 AA as the target. https://www.noerr.com/en/insights/accessibility-in-e-commerce-new-obligations-for-online-shop-operators-starting-from-june-2025 (MEDIUM; scope not verified for this page)
**Phase:** P-Build.

### C4: Mobile layout for long tables
**Pitfalls:** wide tables break the layout or force two-dimensional scrolling. WCAG 1.4.10 Reflow exempts data tables that need two dimensions, but only the table; surrounding content must still reflow. Best practice is to put the table in its own scrollable container so the page does not scroll sideways. https://www.w3.org/WAI/WCAG22/Understanding/reflow.html (HIGH)
**Prevention:** Wrap tables in `overflow-x: auto` containers with a focusable region (`tabindex="0"`, `role="region"`, `aria-label`); sticky first column; or convert to stacked cards below a breakpoint for tables with 3 or fewer key columns. Test at 320 CSS px. Avoid fixed-width pre blocks.
**Phase:** P-Build.

### C5: Page weight and self-containment
**Observation:** The reference page embeds images as base64 `data:` URIs and its HTML text is roughly 957,000 characters (measured via fetch). That makes it a heavy single file: slow on mobile, hard to diff, and awkward to read for tools. https://lyonsv.github.io/intercom-2x-teardown/ (HIGH, observed)
**Prevention:** For this page, prefer inline SVG for charts (small, accessible, scalable) over base64 raster images. If rasters are used, keep them separate and compressed; set explicit width/height to avoid layout shift. Set a page weight budget.
**Phase:** P-Build.

### C6: GitHub Pages path and deploy issues
- **Project-site base path:** a project site is served at `https://<owner>.github.io/<repo>/` (confirmed in docs: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages). Root-absolute links like `/styles.css` or `/img/x.svg` resolve to the domain root and 404. Use relative paths (`./styles.css`) and relative in-page anchors. HIGH on the URL structure, MEDIUM on consequences (standard behaviour).
- **Case sensitivity:** the hosting is case-sensitive, so `Chart.svg` and `chart.svg` differ. Case mismatches work on macOS (case-insensitive by default, as on this machine) and fail when deployed. Use lowercase file names and test via a case-sensitive check before push. (MEDIUM, standard practice; not verified in the fetched docs.)
- **Jekyll processing:** files and folders beginning with an underscore are ignored by Jekyll on Pages. Add an empty `.nojekyll` file at the published root if using any underscore directories. (MEDIUM, standard behaviour; verify in GitHub docs.)
- **CDN libraries:** pin versions and use Subresource Integrity (`integrity` + `crossorigin`) for any CDN script; a static page that breaks when a CDN changes is a credibility risk. Prefer vendoring a small file over a CDN. (MEDIUM)
- **Branch and folder source:** confirm whether Pages is serving from the root or `/docs`; relative paths differ.
- **Cache and stale deploy:** hard refresh after push; verify the live URL, not only the local file.
**Phase:** P-Build.

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| P-Content | Unsourced or unverified stats leak in (NIQ, MIT 95%, vendor ROAS figures) | Claim register with grade and URL; reject items without a primary source or mark Speculative |
| P-Content | Evidence-gap negatives asserted without checking ("no public study shows X") | Verify before publishing, or phrase as "we did not find" |
| P-Content | Author's iStock/Getty affiliation vs. Getty v Stability coverage | Disclose in the metadata block; describe the case neutrally using court and neutral law-firm sources |
| P-Spine | Reviewer rubber-stamping; agent verdict anchors humans | Seeded-error tests; blind-first review; sampling design |
| P-Spine | Auto-approval tiers too permissive for claim-bearing or likeness assets | Mandatory human tier list for claims, people, hero, and regulated categories |
| P-Spine | Provenance and rights metadata missing at generation | Make metadata a gate input, not an afterthought |
| P-Outcomes | Counterfactual missing; platform ROAS used as evidence | Holdouts, incrementality, MMM calibration described explicitly |
| P-Outcomes | Headcount dodge | Scenarios with costs in the calculator and text |
| P-Calc | Unit errors, double counting, NaN, hidden defaults | Pure-function model, unit tests, show-the-maths, 1x identity test |
| P-Build | Base64 bloat, root-absolute paths, case-sensitivity, `overflow` tables | See C5, C6, C4 |
| P-Risks | Section reads as perfunctory | Use the incident list above, with what was established vs. alleged, and what the org should have done |

## Research Flags (need deeper research later)

1. EU AI Act Article 50: verify against the Commission's primary text and the final Code of Practice before publication (law-firm sources only here; dates may have been adjusted).
2. Vendor indemnification terms: current caps and exclusions unverified; page must stay vendor-neutral, so state only that terms vary.
3. Air Canada tribunal ruling: find the primary decision (BC Civil Resolution Tribunal, Moffatt v. Air Canada, 2024) before citing; no valid URL was retrieved in this pass.
4. Reviewer fatigue evidence: locate peer-reviewed primary studies (Parasuraman and Manzey 2010 and others) rather than blog citations.
5. Quantified DAM metadata rot and rights-incident rates: no citable public source found; page must treat as Speculative.
6. Any "AI creative lifts conversion by x%" benchmark: not researched in this pass (out of the pitfalls scope); needs STACK/FEATURES-side evidence and a controlled-study check.
7. Getty v Stability: appeal status not checked.

## Sources

Incidents and regulation (all fetched via web search, 2026-10-24; confidence per entry above):
- https://designcompass.org/en/2025/11/10/coca-colas-ai-ad-faces-backlash-again-this-year/
- https://www.nbcnews.com/news/amp/rcna180665
- https://www.nbcnews.com/world/europe/mcdonalds-ai-generated-christmas-advert-social-media-backlash-rcna248590
- https://www.techradar.com/ai-platforms-assistants/mcdonalds-pulls-ai-generated-christmas-ad-after-backlash-over-soulless-visuals-and-holiday-chaos
- https://www.contentgrip.com/guess-vogue-ai-model/
- https://rangefinderonline.com/news-features/after-backlash-levis-ai-generate-models/
- https://www.vpm.org/npr-news/2023-11-28/some-of-the-bylines-in-sports-illustrated-likely-arent-real-people-theyre-ai-generated-writers
- https://petapixel.com/2024/02/28/families-scammed-by-ai-images-that-promised-willy-wonka-style-event
- https://www.aippi.org/news/getty-images-v-stability-ai-uk-high-court-finds-no-secondary-copyright-infringement-in-landmark-genai-ruling/
- https://www.mishcon.com/news/getty-images-v-stability-ai-unpacking-the-high-courts-judgment
- https://copyrightalliance.org/ai-report-part-2-copyrightability/
- https://www.orrick.com/en/Insights/2024/10/FTC-Targets-Unfair-or-Deceptive-AI-Practices-With-Five-New-Enforcement-Actions
- https://marketinglaw.osborneclarke.com/advertising-regulation/asa-clamps-down-on-wiggydogs-exaggerated-robot-puppy-claims/
- https://marketinglaw.osborneclarke.com/advertising-regulation/henrys-boots-gets-the-boot/
- https://connectontech.bakermckenzie.com/new-eu-guidance-on-ai-transparency-what-should-companies-be-doing-from-2-august-2026
- https://www.heuking.de/en/news-events/newsletter-articles/detail/the-european-commission-specifies-labelling-requirements-for-ai-generated-content-and-deepfakes.html
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11244532
- https://nielseniq.com/global/en/news-center/2024/niq-research-uncovers-hidden-consumer-attitudes-toward-ai-generated-ads/
- https://www.marketing-interactive.com/duolingo-goes-rogue-amid-ai-first-backlash
- https://www.entrepreneur.com/business-news/klarna-ceo-reverses-course-by-hiring-more-humans-not-ai/
- https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo
- https://www.dbreunig.com/2025/09/15/ai-adoption-at-work-play.html
- https://www.ruleranalytics.com/blog/ppc/google-ads-roas/
- https://www.law360.com/articles/2411023
- https://www.complex.com/music/a/alex-ocho/models-sue-roc-nation-over-alleged-billboard-megan-thee-stallion-swiwsuit
- https://multilingual.com/five-prominent-machine-translation-mistakes-in-advertising-campaigns/

Page-level:
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- https://www.noerr.com/en/insights/accessibility-in-e-commerce-new-obligations-for-online-shop-operators-starting-from-june-2025
- https://lyonsv.github.io/intercom-2x-teardown/ (reference page; observed base64 images, three-tier Verified/Inferred/Uncertain key, "Fig" captions)
