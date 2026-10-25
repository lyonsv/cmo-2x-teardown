# Intercom / Fin "2x": What Was Done, What Was Measured, and What Transfers to Marketing

**Milestone:** v2.0 Autonomous Marketing Operations. Brief section 1.
**Researched:** 2026-10-25
**Overall confidence:** HIGH on what Intercom said; MEDIUM on what it proves; LOW to MEDIUM on transfer to marketing (that part is reasoning, labelled as such).

**Naming.** Intercom renamed itself Fin on 2026-05-12, and Salesforce agreed to acquire it on 2026-06-15 (sources S13 and S14). This file says "Intercom" for the 2x programme, because that was the company's name when the programme ran.

**Tags used for every figure:**
- **[CR]**: company-reported. Intercom/Fin published it about itself. Nobody has audited it, and nobody outside the company can check it.
- **[CR-slide]**: company-reported, but it appears only on webinar slides. We see it only through the reference teardown's screenshots (S10), not in Intercom's own text.
- **[3P]**: third-party source.
- **[Inf]**: our own inference.

All pages were fetched on 2026-10-25 unless the source register says otherwise. Quotes are verbatim from the fetched text.

---

## 0. Bottom line for the report rewrite

1. **What Intercom measured is a capacity metric, not an outcome metric. Intercom says so itself.** The headline is "merged PRs divided by total number of people in R&D". It is a whole-system throughput measure, and the CTO calls it "required, but not sufficient" for business impact (S4, 2026-05-22). Business outcomes ("revenue growth is accelerating") are asserted, not quantified, and nothing is claimed as causal.
2. **The gains came from an operating system, not from a tool.** The named mechanisms are:
   - one standard agent platform, with an adoption target of more than 80% and then 95% of PRs;
   - a dedicated platform team ("team-2x") plus a shared, auto-distributed and evaluated skills library (267 skills, 153 contributors);
   - review automation with risk-gated auto-approval (19.2% of merged PRs, later reported as "half");
   - an eval harness for the reviewer;
   - telemetry on adoption and cost;
   - management changes: time, permission, explicit expectations, and leaders embedding with teams.
3. **The bottleneck moved, and they chased it.** First code authoring moved. Then CI, which "melted down" (S10, which relays a podcast). Then human PR review. Next is production diagnosis, which is still unsolved. The marketing equivalent of this sequence is the most transferable idea in the whole case.
4. **Much stays uncertain.** Every number is self-reported. There is no counterfactual or control group, and model upgrades during the window are confounded with the programme (the Opus 4.6 / Christmas 2025 "breakthrough"). The 16-month "3x" window starts before the June 2025 goal. "Features shipped" may be self-reported in Slack. The revert-rate comparison has a selection problem, and the definition of the metric changed between the two posts.
5. **Marketing has no merged-PR equivalent.** Reasons: outputs are heterogeneous, there is no single system of record or "merge" event, attribution lags, credit is shared with sales, agencies sit outside headcount, and labour is only about 22% of marketing budget (versus payroll "massively dominating" R&D cost). The report needs a constructed unit, "verified completed work item", weighted by size, with outcome guardrails attached. Section 7 sets this out.

---

## 1. Timeline and source map

| Date | Event | Source |
|---|---|---|
| 2025-06-13 | CTO Darragh Curran publishes "2×", a version of his email to all of R&D. It sets an explicit goal to double productivity in 12 months. | S1 [CR] |
| 2025-07-01 / 07-07 | CPO and marketing lead Paul Adams publishes "Marketing in an AI World" and "Marketing Principles". These describe a separate marketing reorg with no 2x metric. | S15, S16 [CR] |
| ~Dec 2025 | A podcast chapter title names a "breakthrough moment with Opus 4.6 and Christmas break 2025". | S9 (episode page) [3P listing] |
| 2026-04-16 | "2× – nine months later: We did it". All headline outcome numbers come from here. | S2 [CR] |
| 2026-04-20 | Brian Scanlan on the *How I AI* podcast. | S9 (episode page only, recording not viewed) |
| 2026-04-21 | Intercom engineering blog: "AI is approving our pull requests". Mirrored on ideas.fin.ai on 2026-04-24. | S3 [CR] |
| 2026-05-12 | Intercom renames to Fin; "All of our 1,400 employees". | S13 [CR] |
| 2026-05-19 | Leadership webinar. The recording was not viewed; the slides are known through S10. | S10 [CR-slide] |
| 2026-05-22 | Webinar Q&A post answering 72 questions. This is the richest source on mechanisms and caveats. | S4 [CR] |
| 2026-06-04 | VP Engineering Dave Lynch, "The rise of GTM engineering". Covers the AEO engine and the outbound cockpit. | S17 [CR] |
| 2026-06-15 | Salesforce signs an agreement to acquire Fin for about $3.6B. | S14 [CR] |
| 2026-07-07 / 07-09 / 07-15 | Posts by the research and data science lead, the frontend infrastructure lead, and Brian Scanlan on skills. | S5, S6, S7 [CR] |
| 2026-07-14 / 08-31 | Honeycomb publishes Curran's CTO letter and an interview recap. | S11, S12 [3P host, CR content] |
| 2026-08-25 | Reference teardown, built from 55 webinar screenshots. | S10 [3P, graded] |
| 2026-08-28 | Pedro Tabacof, "Why not just ship it?". Covers Fin's product eval and A/B discipline. | S8 [CR] |

**Not found.** The promised part two ("our messy journey… what we've learned", S2) has not appeared in the ideas.fin.ai archive as of 2026-10-25; we checked the archive API. The full "2x principles" document was promised "in the days ahead" (S2), but only the first principle is public. We did not view the webinar recording, the How I AI recording, Brian Scanlan's X thread, or the Ramp post that S2 mentions.

---

## 2. The metric: what, why, weaknesses, guardrails

### 2.1 Definition (and the definition drift)

- **June 2025 (S1):** "we will measure our progress here by measuring the average number of merged pull requests (PRs) per engineer per month (others have used this measure too)."
- **April 2026 (S2):** "We measured the number of merged PRs divided by the total number of employees in our R&D org… total number of merged PRs, divided by total number of people in R&D (everyone from IC engineers to VP of product design)."
- **May 2026 (S4):** "Yes, merged PRs, but specifically total merged PRs divided by total number of people in the entire R&D org. This is about measuring the throughput of the entire system, not just the per engineer output."

**[Inf] The denominator changed** from "per engineer" (2025) to "all R&D people" (2026). Intercom has not published whether the 2x was computed on the same denominator throughout, or on what baseline month. The report should cite the 2026 definition and note the change.

### 2.2 Why they chose it (their stated reasons)

- Proxy for impact: "A change that makes it to production is a reasonable proxy for impact. We have separate mechanisms that ensure we are working on the right things, and that the work we do is good quality." (S1, 2025-06-13)
- Pragmatism over the ideal metric: "Ideally I'd like to measure how long it takes us, on average, to bring something from idea to being in the hands of our customers… I can't think of a great way to operationalize that today, so we will start with something potentially flawed but pragmatic." (S1)
- Three reasons for dividing by all of R&D: "1) that's all the cost; 2) we expect all people to be able to directly and indirectly impact the metric; and 3) it puts healthy pressure on our org design, by default we should assume all our existing org structure patterns are wrong for the new world." (S2, 2026-04-16)
- The metric as a bottleneck detector: "Putting higher expectations on merged PR throughput puts pressure on the whole system, exposing bottlenecks which we then systematically tackle." (S2)
- The factory model: "Your org is a factory, the production line spits out Pull Requests, we need to understand and optimise the factory to maximise the throughput of PRs." (S1) And: "Our job is to increase the throughput of the factory, while maintaining or improving quality and decreasing cost. Time, cost, scope, pick three!" (S2)
- Every lever moves it: "This number goes up when non-engineers can make changes directly. It goes up when AI agents can make changes autonomously (or at least with human approval). It goes up when engineers find ways to be more productive themselves, or less reliant on handoff or synching with other humans." (S1)
- Two zoom levels: "We also look at this top-down. What we actually want to optimize is how frequently and how quickly we can go from problem to solve or idea, to solution in our customers' hands. Both views are useful, but at different zoom levels." (S2)

### 2.3 Weaknesses they admitted

- "Obviously not all PRs are equal; small PRs can be super high value, large PRs can be low value, but as a proxy it's good enough." (S1)
- "There are of course ways using this measure could be misused… Despite valid concerns – such as the risk of cynical gamification – we believe it's important to measure this and to be transparent about it." (S1)
- "Using this metric in isolation to try and measure an individual's performance can be problematic… But using it as a lens to assess the health and productivity of a team or an organisation is incredibly powerful." (S1)
- "This particular measure is easy to criticize… This isn't far off measuring LOC?" (S2)
- "it was and still is true that the number of PRs doesn't directly translate into business impact. However, it is a required pre-condition to be able to ship at least something: required, but not sufficient." (S4, 2026-05-22)
- On product changes: "This is noisy data, not all product changes are equal in size, scope, etc., you can have spiky months, but it's directionally indicative." (S2)

### 2.4 Guardrails actually used (mechanisms, not slogans)

| Guardrail | Evidence | Tag |
|---|---|---|
| Quality signals tracked alongside the metric: the defect backlog, a static-analysis code-quality score, downtime from breaking changes, and revert rates | S2, S3 | [CR] |
| Culture as the anti-gaming control: "gamification is a culture problem, not a measurement problem" (quoting Claire Vo). Also: "anything egregious would become obvious quickly" | S4 | [CR] |
| Attribution fixed so the metric would not discourage good behaviour. Cloud-agent PRs (Buzz) at first "didn't attribute the work to the person who initiated it, and there was reluctance to use this system… We fixed the attribution" | S4 | [CR] |
| Pressure on PR size. The review agent "won't approve large PRs", which creates an incentive for small changes. They report that size has "increased a little alongside volume" | S3, S4 | [CR] |
| Per-engineer tiering uses five inputs (intensity, output, depth, efficiency in $/PR, prompt quality), not PR count alone. The scatter plots *weighted* PRs | S2; S10 for "weighted" | [CR], [CR-slide] |
| "Features shipped" and "median days idea→shipped" used as top-down outcome-ish views | S2; S10 for slide values | [CR], [CR-slide] |

**[Inf] What is missing.** No published holdout or comparison group. No published PR size distribution over time. No customer-outcome metric tied to the 2x. Intercom gives no external audit of the metric; its auditor engagement (Schellman) covered change-management compliance, not productivity.

---

## 3. Results: every published figure, tagged

| Measure | Value | Source and date | Tag | Notes |
|---|---|---|---|---|
| Merged PRs per R&D head | 2x "with time to spare" against a 12-month goal | S2, 2026-04-16 | [CR] | No absolute counts or baseline month published in text |
| Same, longer window | "looking back over 16 months we've 3x'd" | S2 | [CR] | **[Inf]** 16 months back from Apr 2026 is about Dec 2024, before the June 2025 goal. S1 already reported "~20% YoY" improvement before the programme |
| Product defect backlog | −54%; "closing all critical and high defects" | S2 | [CR] | Slide values 1,539→709; critical 25→3; high 67→8 (S10) [CR-slide] |
| <24h defect-fix SLO | "currently at 10.4% and climbing" | S2 | [CR] | |
| Product changes | ">2x product changes, 39% faster from idea to shipped"; "Median time from idea to product change is nearly cut in half" | S2 | [CR] | Slide values: features/month 11→21→25→46 (Dec–Mar); median days 56→49→40→34 (S10) [CR-slide]. S10 reports from spoken commentary that "features shipped" may be **self-reported via a Slack channel** (graded Uncertain there) |
| Code quality (static analysis) | Declined as AI wrote more code; "possibly our first ever five-week streak of net positive code quality" | S2 | [CR] | Method not specified |
| Downtime from breaking code changes | −35% over 11 months "even as our deployments doubled" | S2, S3 | [CR] | "attributed to code-related breaking changes", per the slide footnote (S10) |
| AI spend | "climbing sharply… We've not tried to optimize this" | S2 | [CR] | No absolute figures. S4: "under forecasting token spend… now dealing with all the reactive financial planning work" |
| Fully loaded cost per PR | "in a steady decline"; "Payroll-related costs massively dominate this" | S2 | [CR] | No values published. S4: "fully loaded cost drops dramatically" |
| Agent-driven PRs | 93.6%. A 6-week goal of >80%, then 95% | S2 | [CR] | Slide: 38.9%→93.6% (Jan 5 – Apr 13) (S10) [CR-slide]. Definition of "driven" not published |
| AI-approved PRs, no human reviewer | 19.2% of merged PRs; goal >50% "by the end of April" | S2, S3 | [CR] | July 2026: "half are auto-approved by Agents" (S6, one sentence, 2026-07-09) [CR] |
| Share of PRs evaluated by the approval system | "roughly 60%" | S2 | [CR] | |
| Merge time | Auto-approved median 14.6 min vs org median 75.8 min | S2 | [CR] | |
| Auto-approved PR size | 86% are ≤20 lines | S2 | [CR] | |
| Fully autonomous PRs | 497 in the first four weeks (agent wrote, AI approved, shipped) | S2, S3 | [CR] | |
| AI approval pilot | >100 PRs, zero reverts; "6–16x improvement in time-to-approval at the 75th percentile" | S3, 2026-04-21 | [CR] | **[Inf]** At n≈100, zero reverts gives an approximate 95% upper bound of 3% (rule of three). That is consistent with, but does not prove, parity with a 0.5–5% base rate |
| Revert rate, AI-authored vs human-authored | Backend 0.53% vs 5.39%; frontend 0.22% vs 2.00% | S3 | [CR] | **[Inf]** Selection effect: with more than 93% of PRs agent-driven, the "human-authored" group is a residual set of probably different and harder work. The figures are not comparable as a causal estimate |
| Plugin repo | 153 contributors (31% of R&D), 267 skills, "most actively contributed-to project" | S2; repeated in S7 | [CR] | **[Inf]** 153/0.31 ≈ 494, which fits "~500" rather than "473" |
| Contributor distribution | "Top 5% of contributors produce 6x the median PR throughput" | S2 | [CR] | |
| Spend vs output | "the vast majority of people who are meaningfully pulling up the average are spending >$1k per month on tokens, but spending >$1k doesn't guarantee that" | S2 | [CR] | |
| Spend on skill development | "by ~PR count it's ~5%" | S4 | [CR] | |
| Single token optimisation | High-res Playwright screenshots fixed, "saved a projected $300k annual costs" | S4 | [CR] | |
| Company-wide adoption | "almost 1,100 active Claude Code users across the company (out of total company size of 1,305)"; 473 in R&D | S2 | [CR] | S13 (2026-05-12) gives 1,400 employees |
| Org scale | "~500 people building and operating the product"; ~8.5M LOC; 2,539 CI jobs and 313 production deploys in 24h | S2 | [CR] | S3: "hundreds of times a day"; S8 (Aug 2026): "around 200 times a day". The figures are inconsistent and probably measured differently |
| Merge-to-production | "12 minutes" on average | S3 | [CR] | |
| Business outcomes | "revenue growth to continue accelerating"; "able to say yes much more frequently, which translates into deals closing that would have been blocked" | S4 | [CR], anecdotal | No figures, and no causal claim made |

---

## 4. What changed in the operating model, by lever

### 4.1 Agentic coding (the authoring step)

- They standardised on one tool after a permissive start. "We used to be open here… but then got opinionated and doubled down on a single primary tool (Claude Code), which helped ensure gains compounded across the whole team" (S4). They also call it a mistake: "We weren't opinionated enough early enough, there were gains but mostly in isolation… It took us too long to centralize on a platform." (S4)
- They set a hard adoption target in weeks: ">80% of PRs would be driven by Claude Code" within six weeks, later raised to 95% (S2).
- The first principle: "All technical work is becoming agent-first. This is the top priority for R&D." (S2)
- The acceptance criterion for the platform was shown on a slide: "Your agent system should be able to do everything a senior engineer can do, consistently at the standard of a senior engineer, or beyond." (S10 [CR-slide]; echoed in S4: "our agents should be able to do all aspects of the job a senior engineer does").
- Agents get the same access as a human with the same role: "we aim for Claude to be able to do/access anything an engineer would… read-only access to our production infrastructure, data warehouse, etc., honoring a given engineer's existing roles and permissions." (S4)
- Cloud and scheduled agents ("Buzz… can be triggered on schedule or by webhook") were still "a small contribution right now" to PR numbers (S4).

### 4.2 Shared tooling, plugins and skills (the platform)

- A dedicated team: "a very senior core team of three IC engineers (Principal/Senior Principal), two Senior+ engineers, a Staff TPM, and a VP eng… existed for about six months… We wish we'd started sooner" (S4). Contribution is also "explicitly everybody's job" (S4). "This isn't a platform team building for others; modernizing the factory is now part of everyone's job." (S2)
- Distribution: a private plugin marketplace with auto-update, then forced through IT MDM because auto-update was unreliable (S4).
- Hierarchy and governance: a base plugin, then role, language and team plugins, "many disabled by default". Skills are governed "same as code", with a promotion rule: "50 weekly active for a skill to be eligible to promote to a base plugin". There is also "gardening and removing skills that don't get traction" (S4).
- Evals live next to skills: "Basically like automated tests" (S4). Brian Scanlan's rules for good skills include "Have evals… Have guardrails… Have owners… Use hooks to force skill-use when essential". His list of bad skills includes "Half-ass the work – create a dashboard for humans to make decisions rather than fully delegating the work to the Agent." (S7, 2026-07-15)
- Deterministic enforcement: hooks intercept the agent (for example, when it tries to open a PR with the `gh` CLI) and inject the required skill (S4).
- Encoded judgment: in frontend infrastructure, the "Surge Intelligence" knowledge layer took the share of design-system components an agent reached for from 7% to 96%, and correct placement in context from 42% to 68%. "about a quarter of pages still use the wrong props" (S6, 2026-07-09) [CR]. This is a with/without measurement of a knowledge layer, and it is directly reusable as a method.
- A small team supports a large population: "Now, around 450 engineers have shipped React code… using AI infrastructure created and maintained by just eight people." (S6) [CR]

### 4.3 Review automation (the quality gate)

- Why: "Humans simply don't have the time or mental capacity to properly review the volume of AI-generated code we're now producing… either the queue backs up and velocity drops, or, more dangerously, humans start rubber-stamping." (S3, 2026-04-21)
- How:
  - Review is decomposed "into separate sub-jobs, each handled by an independent sub-Agent" (problem description, intent alignment, safety, logic, best practice) (S3).
  - The reviewer runs in "isolated, short-lived containers, triggered by GitHub webhooks… uses both Claude and Codex" (S4).
  - Repository-specific safety criteria "define what areas of the code are safe to auto-approve" (S4).
- Risk gating:
  - "We've started with the lowest risk changes – feature flag cleanups, small bug fixes, focused improvements" (S2).
  - "Our very first iteration was an agent based on deterministic rules approving changes to documentation/tests/etc" (S4).
  - "PR size is one heuristic, other signals that indicate the level of risk/blast radius" (S4).
  - S10 shows that eligibility and quality are separate axes. A PR can be "eligible" and still fail, and changes that touch "Critical Data" or schema are never auto-approved [CR-slide].
- Human override and accountability: "Any engineer can request a human review on any change, at any time… The human who ships the code remains accountable for the outcome." (S3)
- Reviewer prompts are editable "but this requires peer approval… owners/experts in particular parts of the system own… the review/approval requirements for their area" (S4).
- If a PR is not auto-approved, it goes to normal human approval with Slack routing (S4).
- Compliance: "Every AI-approved PR is labelled, logged, and queryable… We engaged our auditors, Schellman, early, before we scaled" (SOC 2, HIPAA, ISO 27001, ISO 42001, AIUC-1) (S3).

### 4.4 Evaluation of the reviewer

- "We have a human-curated set of historical PRs with confirmed issues. Any time we change the agent or the prompts, we re-run evals… Building and curating a dataset is by far the hardest and most time consuming part… Spending less time on reviewing PRs manually is a good incentive for [experts] to contribute." (S4)
- "a custom framework to run statistical analysis of the impact that individual prompts… have on correctly judging a code change… producing statistical significance results on whether the prompt changes move the needle in terms of recall and precision." (S4)
- "For high-stakes agents like Shrek, virtually any change goes through evals first… We treat any change as a hypothesis that needs validation." (S4)
- Newer models are not automatically better: "even switching within the same family (Opus 4.6 → Opus 4.7) might result in a degradation" (S4). S10 shows a webinar screenshot of the Opus 4.7 experiment flagged WORSE on safety and problem statement, and of 27 experiments with zero BETTER verdicts [CR-slide].
- **Weakest point, visible only in screenshots:**
  - Live agreement between the bot and humans on the *Safety* criterion was 36.2%, and 70.5% in the curated eval (S10) [CR-slide].
  - The live bot approval rate was 28.4% (284/1000) (S10) [CR-slide].
- Trust threshold: "We had this intuition that if the review quality is below some threshold, people will tune out of it. So we had a high bar we needed to hit." (Curran via S12, 2026-08-31)

### 4.5 Organisational change

- An explicit, hardened expectation: "It's a hardened goal, it's part of our expectations for designers, engineers, PMs. We will track ourselves as leaders, managers, teams, and ICs against it." (S1)
- Time and permission: "'Not having time' is the primary reason people cite for not trying new tools. Managers and leaders will support you taking the time to skill up… pushing back the occasional deadline if necessary" (S1).
- Leaders close to the work: "I'll be spending at least 1 week per month embedding with our engineering teams." (S1)
- Enablement mechanisms (S4):
  - a compulsory competitive hackathon ("Everyone, no matter what their role, had to participate");
  - show-and-tell sessions;
  - "no-IDE weeks".
- Hiring and performance: "we are already screening potential interview candidates based on them having strong examples of using AI" (S1). Planned "tweaks to our performance process" (S1); the details are not published.
- Org design: "Essentially no, not dramatically… no dramatic re-orgs. We do, however, intend to push harder… (for example, shrinking teams)" (S4). "Directionally, what is a team today should be a single person on some near-ish timeframe." (S4)
- The spend floor: "It's ironic that the sentiment amongst many leaders or CFOs is that this is all becoming too expensive, our evidence suggests that it's way more expensive in the long run to hold back spend" (S2). "Right now we monitor, but don't limit." (S4) "All engineers/employees have access to Claude Code & Cowork, so far unlimited tokens." (S4)
- Telemetry on people: OTEL to Honeycomb on every hook event, and session transcripts that are "pseudo-anonymize[d]" with opt-out and 14-day expiry (S4). Tiering of individuals is computed from telemetry (S2).
- Roles outside engineering: designers ship code, and "it is expected that designers can/do fix papercuts or small bugs" (S4). The research and data science team reports "SQL used to be the majority of the job, and now it's near zero", "no reorg, new titles, updated competency framework", and "Our 2x isn't twice the output. It's the same hours spent a level up." (S5, 2026-07-07)

### 4.6 The six sources of gain named at the start (S1, 2025-06-13), with the CTO's first-cut estimates

1. "Make humans faster at what they do… A reasonable target here is that we all get about 50% faster."
2. "Enable non-engineers to contribute."
3. "Reduce sync and collaboration overheads. Writing code is often not the bottleneck – it's how we work together as humans."
4. "Make ourselves redundant for parts of the jobs we do today", meaning experts provide self-serve templates, guardrails and automation.
5. "Recognise the problems where AI can give you 20-100x lift… work that follows a repeated pattern."
6. "Send large quantities of relatively simple work to an army of AI agents… dead code/test deletion, unused feature flag removal, issue and exception triage and fixing, framework or dependency upgrades."

**Not published:** how much of the 2x came from each source. **[Inf]** The memo's own arithmetic, about 1.5x from individual speed, implies the rest has to come from removing coordination and handoffs and from agent-only work. That matches the brief's thesis.

---

## 5. How autonomy removed bottlenecks across the lifecycle

| Stage | Bottleneck before | What removed it | What it exposed next | Source |
|---|---|---|---|---|
| Authoring | Human coding time | Agent-first authoring (93.6% agent-driven) | CI capacity | S2; S10 |
| CI | "CI originally collapsed and became 10x more expensive" | Performance work on CI | Review | S10, relaying the How I AI write-up. We could not re-verify this; treat it as MEDIUM |
| Review | Human review queue; risk of rubber-stamping | AI reviewer, risk-gated auto-approval, small-PR incentive | Production diagnosis and unknown unknowns | S2, S3 |
| Merge to production | Already fast (12 min) | Existing CI/CD, a precondition | | S3 |
| Production | "The majority of Intercom's largest outages weren't even caused by changes to product code at all" | An agent for production diagnosis is "in parallel" development | Still unsolved: "our agents still confidently identify plausible suggestions that are red herrings" | S3; S4 |
| Prioritisation | Backlog triage overhead | Defect backlog −54%; target of a <24h fix SLO and "effectively no backlog" | Decision-making and narrative capacity outside R&D. The question was asked at the webinar; the answer is in the recording only | S2; S4 |
| Toil | Dependency upgrades, flaky tests, flag cleanup | "army of agents"; the flaky-spec skill "runs continuously" | | S1; S10 |

Two statements carry the logic:
- "Creating PRs isn't the only part of the 'factory' to apply an Agent-first mindset to. With the ramp-up in PRs, unsurprisingly, one of the bottlenecks that gets exposed is PR review and approval. If we want our factory to move faster, we can't have every increment waiting in a human review queue." (S2)
- "Expect the constraint to move, not disappear." (S10, the teardown's summary) **[Inf]** This is the single strongest structural argument for the marketing report. Faster asset generation alone will move the bottleneck to brand and legal review, then to trafficking and publishing, then to measurement.

Preconditions they name:
- "Culture that was focused on shipping, and systems/processes optimized around that (e.g. CI/CD)." (S4)
- "AI is an amplifier: it amplifies whatever you already have, both good and bad." (Honeycomb's framing of Curran's letter, S11, 2026-07-14)

---

## 6. Demonstrated vs uncertain

### Demonstrated (with the caveat that it is self-reported)
- A large, fast **behaviour change**: 38.9% to 93.6% agent-driven PRs in about 14 weeks [CR-slide/CR]; about 1,100 of 1,305 staff are active users [CR].
- **Throughput per head rose roughly 2x** on Intercom's own definition and data [CR]. This is credible because several indicators move together (PRs, deployments doubled, features shipped, idea-to-ship time). None of them is independent of Intercom.
- **No visible quality collapse** on the measures Intercom tracks: attributable downtime down 35%, defect backlog down 54%, code-quality score dipped and then recovered [CR].
- **Review automation works for a narrow, low-risk class**: about 19% of merged PRs, mostly ≤20 lines, median merge 14.6 min, and a 100-PR pilot with zero reverts [CR].
- **The constraint moved** from authoring to CI to review, as their account of events shows.
- Institutional artefacts exist and are partly public: the `intercom/2x-skills` repository, as published (S7), and the curator/eval screenshots (S10).

### Uncertain or not demonstrated
1. **Everything is self-reported.** There is no third-party audit of productivity data. Absolute PR counts, baselines and cost-per-PR values are unpublished.
2. **There is no counterfactual.** No control group, no holdout, no comparison with similar companies. Industry evidence shows how hard this is: METR's controlled study found experienced developers 19% *slower* with early-2025 tools (S18, 2025-07-10). Its February 2026 rerun could not keep a clean control, because developers declined "to work without AI", and METR called its new estimates "only very weak evidence" (S19, 2026-02-24).
3. **Confound with model releases.** The podcast's chapter list names "The breakthrough moment with Opus 4.6 and Christmas break 2025" (S9). The slide series for features shipped jumps 11 to 46 between December and March (S10). Model capability gains and operating-model changes cannot be separated.
4. **The window starts before the goal.** "3x over 16 months" includes about six months before the June 2025 goal, and S1 already reported a pre-existing ~20% YoY trend.
5. **Metric definition drift**: "per engineer" in 2025, "all R&D" in 2026 (see §2.1).
6. **Goodhart exposure.** PR size "increased a little" (S4). We know little about splitting behaviour. The auto-approval size limit rewards small PRs, which raises the count. They call that "win, win" for safety, but it also inflates the metric. **[Inf]**
7. **Business outcomes are asserted, not shown**: "revenue growth is accelerating" (S4), without figures. "You should expect revenue to be a lagging indicator." (S4)
8. **Cost**: the trend in cost per PR is described, but no values are given. Token spend was under-forecast (S4). On the webinar, Intercom said not every business can afford this strategy (S10 [CR-slide/spoken]).
9. **The revert comparison has a selection problem** (see §3 notes). Safety-criterion agreement of 36–70% (S10) means the gate's core judgement is contested even among humans.
10. **"Features shipped" may be counted from a Slack channel**, which makes it sensitive to how often people report (S10, Uncertain).
11. **Unevenness**: the top 5% produce 6x the median (S2). The average hides a fat tail, and pulling up the floor is "still WIP".
12. **Cognitive and comprehension debt** has been considered, "but haven't seen major evidence" (S4). Context-switching load is real: "We are all managers now… it can be exhausting" (S4). The research team reports more time spent verifying AI output (S5).
13. **Transferability to other organisations is caveated by Intercom itself**: "it's hard to productize culture, and some of these systems will be very opinionated/over-fitted to our culture" (S4).

---

## 7. The measurement problem for marketing

### 7.1 Why there is no merged-PR equivalent

What makes a merged PR a usable unit, and the marketing reality for each property:

| Property of a merged PR | Marketing reality | Consequence |
|---|---|---|
| **One pipeline, one system of record.** Git records every unit with author, size, reviewer, timestamp and merge event | Work is spread across the work-management tool, DAM, CMS, ad platforms, MAP/ESP, social tools, agency trackers and email | No free event log. The unit has to be **constructed** and instrumented (a build item) |
| **Atomic and roughly comparable.** Most PRs are small increments to one product | Outputs are heterogeneous: a banner resize, a 40-market launch, an analyst report, an event, a pricing page test, a media-plan change | A raw count is meaningless without size weighting. Intercom itself plotted *weighted* PRs per engineer (S10) |
| **Binary terminal state** (merged and deployed in 12 min) | "Live" happens in many places, and some work never goes live (research, plans, briefs) | The completion event has to be defined per workflow type and verified, not self-declared |
| **Fast, objective quality signals** (CI, tests, reverts, incident attribution) | No test suite for persuasion. Brand harm is diffuse. Compliance escapes are rare but costly. A published ad cannot be "un-seen" | Quality guardrails must come from pre-flight checks plus sampled human audit, not revert rates |
| **Short value lag** (customers get the change within minutes) | Effects show up in weeks to quarters. B2B purchase cycles are long; only a small share of buyers is in market at any time ("up to 95%" are not, per Dawes' 95:5 heuristic, S21) | Outcome metrics lag the programme. Early proof has to rest on capacity, cycle time and quality, with outcome tests designed in from day one |
| **Credit stays inside R&D** | Pipeline and revenue credit is shared with sales, product, partners and brand. Attribution models are contested | Per-FTE pipeline is noisy and politically contested, so it can be a guardrail, not the primary 2x metric |
| **The denominator is the whole cost.** "Payroll-related costs massively dominate" cost per PR (S2) | Gartner 2025: paid media 30.6% of the marketing budget, martech 22.4%, **labour 21.9%**, agencies 20.7% (S20 secondary reproduction of Gartner 2025 CMO Spend Survey [3P], MEDIUM) | Doubling output per marketing head acts on roughly a fifth of spend. **Agencies (about a fifth more) sit outside headcount**, so moving work in or out of an agency can fake per-head gains. The denominator has to include agency FTE-equivalents or be cost-based |
| **Demand for increments is close to unbounded** ("never had a shortage of product vision", S2) | Audience attention and media budget are bounded. More emails or assets can cut response, and more campaigns can cannibalise | Capacity does not equal effectiveness, the core point of the brief (§3). A "Backlog 0" analogy only holds for operational and maintenance work |

### 7.2 Candidate units of completed work (ranked)

| Rank | Candidate unit | Definition | Strength | Weakness | Verdict |
|---|---|---|---|---|---|
| 1 | **Verified completed work item (VCWI)**, size-weighted | A request in the work-management system with a declared type, size class (S/M/L/XL, set at intake by rubric, not by the requester) and acceptance criteria. It closes only when the system verifies the terminal event: live in the channel, or the research or plan accepted by its owner | The closest analogue to a merged PR: one pipeline, a defined terminal state, works across all workflow types, can be instrumented automatically | Size classes can drift (Goodhart through splitting or inflating). Needs a weighting rubric, plus calibration audits | **Primary metric candidate.** Weighted VCWI per marketing FTE-equivalent, with agency FTE-equivalents in the denominator. Sibling view: per $ of fully loaded labour plus agency cost |
| 2 | **Objective-to-live cycle time** (median) | From an approved business objective or brief to verified live | This is the measure Curran actually wanted ("idea to being in the hands of our customers", S1) and later reported (median days 56→34, [CR-slide]). Hard to game without real speed | Mixed sizes skew the median, so it has to be segmented by size class | **Co-primary or top-down view.** Mirrors Intercom's "two zoom levels" (S2) |
| 3 | **Campaign-market launched** (the existing v1 metric) | A campaign launched and verified live in one market | Meaningful to a CMO; already in the model | Covers only the launch workflow, not research, optimisation or operations | Keep as the **content supply chain workflow's** unit, rolled up into VCWI |
| 4 | **Experiments completed with a pre-registered readout** | A test with a declared primary metric, power and decision recorded | Measures learning velocity and links to effectiveness. Fin's product team uses exactly this discipline (S8) | Low volume, and long tests | Workflow-level metric for experimentation |
| 5 | **Agent "outcome"** (Fin's pricing unit) | "when Fin successfully completes an action it was configured to perform", including a handoff to a human when configured (S22) | A natural unit for the autonomy scorecard. It counts agent completion even when a human finishes the work | Measures the agent, not organisational output | **Autonomy-tier metric**, the % of eligible workflow instances completed by an agent |
| 6 | Approved-live assets | Count of assets live | Easy | Mechanical and gameable. v1 already rejected it as the headline (PROJECT.md Key Decisions) | Internal capacity measure only |
| — | Pipeline or opportunities per marketing FTE | | What the CMO cares about | Lagged, shared credit, attribution-dependent | **Outcome guardrail, not the productivity metric**. Intercom equally treats revenue as "lagging" (S4) |

**Recommended framing for the report [Inf]:**
- **Primary (capacity):** size-weighted verified completed work items per marketing FTE-equivalent, counting all marketing staff from IC to CMO plus agency FTE-equivalents. This copies Intercom's "divide by everyone, because that's all the cost".
- **Top-down view:** median objective-to-live time by size class.
- **Guardrails:** first-pass acceptance rate; compliance or brand escapes found after publication; takedowns and rollbacks; human review hours per item.
- **Outcome tier (lagging, tested not assumed):** pipeline per marketing $, CAC, and the conversion effects of experiments.

The report should keep Intercom's honesty pattern: say the primary metric is "required, but not sufficient", and track outcomes separately.

---

## 8. Transferable principles: Intercom mechanism → marketing translation → what does NOT transfer

Each row is an **operating mechanism**. The marketing translations are our design proposals [Inf]; the Intercom column is sourced.

| # | Intercom mechanism (source) | Marketing translation (concrete) | What does NOT transfer, or needs changing |
|---|---|---|---|
| 1 | **One org-wide throughput metric, divided by all R&D heads including managers**, used to diagnose the system rather than rank individuals (S1, S2, S4) | Size-weighted VCWI per marketing FTE-equivalent, with the CMO, ops and agency FTE-equivalents in the denominator. A weekly flow review of where items wait | No free system of record and no uniform unit (see §7.1). Agencies sit outside headcount. Labour is about 22% of marketing spend versus payroll-dominated R&D cost |
| 2 | **Two zoom levels**: unit throughput plus idea-to-customer time (S2) | Objective-to-live median by size class next to VCWI | Marketing "live" is multi-system. Verification of the terminal event has to be built |
| 3 | **Explicit, public, hardened goal and expectation for every role**; leaders tracked against it (S1) | The CMO sets a 12-month capacity goal, written into role expectations for brand, regional, ops and agency management | Intercom's leadership was "already convinced"; it was "easy mode" (S10). Marketing leaders may need the 12-week pilot as proof first |
| 4 | **Standardise on one primary agent platform** after a permissive phase failed to compound (S4) | One agent runtime or harness for marketing workflows. Skills and policies written once, not per point tool | Marketing work runs inside many SaaS tools with uneven APIs, so no single CLI covers it. Intercom's own engineer argues "SaaS wasn't built for Agents" (ideas.fin.ai, 2026-04-27, not quoted here). An integration layer is a real build cost |
| 5 | **A dedicated platform team ("team-2x"), plus contribution as everyone's job** (S2, S4); an engineer paired with a domain expert in GTM (S17) | A small marketing-agent platform team (a GTM/marketing engineer, a marketing ops lead, a brand systems owner, an evals owner), plus a contribution expectation for every marketer | Intercom drew from very senior engineers. Most marketing organisations lack in-house engineering, which raises the build-versus-integrate question |
| 6 | **Shared, versioned skills library with owners, evals, promotion and demotion rules** (50 WAU), force-distributed (S4, S7) | A brand, claims, channel-spec, locale and compliance skill library: each skill owned, versioned and tested, with "experimental" twins and pruning | Engineers already use git and code review for skill governance. Marketing needs a governance surface non-engineers can use, though Intercom did get 600+ non-R&D staff onto Claude Code (S2) |
| 7 | **Encode expert judgment into the environment, and measure with versus without it** (Surge Intelligence 7%→96%, S6) | A brand-system knowledge layer (approved components, claims register, imagery and rights rules, tone), measured by an A/B of agent output with and without it | "the part that carries our taste… still mostly live in people" (S6). Brand taste is harder to encode than code conventions; expect partial coverage |
| 8 | **Push work to agents end-to-end, not to dashboards**: "Half-ass the work – create a dashboard for humans to make decisions rather than fully delegating" is a bad skill (S7) | Workflow agents own whole stages (derive, localise, validate, traffic, verify live) rather than producing recommendations | Some marketing decisions (positioning, spend allocation, new claims) are judgment-heavy and high-stakes, so they stay human by design |
| 9 | **Treat review as the next bottleneck**; build a decomposed AI reviewer with independent sub-agents per criterion (S3) | A review agent with sub-checks for brand, claims substantiation, legal or regulatory text, rights and licence, accessibility, channel specs and locale | There is no executable test for "is this persuasive" or "on brand". Ground truth is contested (Intercom's own Safety agreement is 36–70%, S10) |
| 10 | **Two-axis gate**: a deterministic eligibility policy (risk class, size, critical-data exclusions) × a quality verdict. Start with the lowest-risk classes; never-auto list (S2, S3, S4, S10) | T0–T3 tiers: auto-approve derived variants of an approved master with locked claims (resizes, crops, approved-translation-memory locales). Human-only for new claims, pricing, comparatives, regulated categories and talent/rights | A revert is cheap and near-instant in software. A published ad, email or claim **cannot be un-seen**, and regulators judge what was shown. The tiers must be more conservative, and post-publication monitoring has to substitute for revert |
| 11 | **Humans can always pull the cord; the shipper stays accountable after merge** (S3) | Any marketer can force human review. The DRI who launches watches early performance and can take it down | Accountability for agency-produced work is contractual, not cultural |
| 12 | **Eval the reviewer against curated ground truth with paired statistics; every change is a hypothesis; newer models can be worse** (S4, S10) | A curated dataset of historical brand and legal approve/reject decisions with rationales. Every prompt, model or policy change runs baseline versus treatment before shipping | Dataset curation is "by far the hardest" part (S4). Marketing has fewer labelled past decisions, and reviewers often disagree, so inter-rater calibration has to come first |
| 13 | **Audit by design; engage auditors early** (S3) | Engage legal, regulatory and privacy teams before scaling. Every agent approval labelled, logged and queryable, with the evidence pack identical to a human approval | Marketing regulation (advertising standards, sector rules, AI-disclosure laws) varies by market, so the policy source has to be per jurisdiction |
| 14 | **Spend as a floor; track fully loaded cost per unit** (S2, S4) | AI and inference spend monitored but not capped in the pilot. The CFO metric is fully loaded cost per VCWI including agency cost | Labour is a smaller share of marketing cost, so cost-per-unit gains move total budget less than in R&D. The bigger money levers are agency and production fees. Unlimited tokens may not suit organisations with tighter cost cultures, and Intercom itself under-forecast spend (S4) |
| 15 | **An "army of agents" on high-volume toil** (S1) | Continuous agents for DAM tagging and metadata, rights-expiry takedowns, broken links and pages, feed hygiene, SEO and AEO fixes, campaign QA, UTM and taxonomy hygiene. A "backlog 0"-style SLO for operational defects | This transfers strongly. The limit is write access across many SaaS tools |
| 16 | **Let non-specialists ship; make experts redundant through self-serve with guardrails** (S1, S4) | Regional and product marketers launch approved campaigns in their markets through the agent. Brand provides templates and policies rather than reviewing each asset | Brand consistency risk is reputational and cumulative, not caught by any automated test |
| 17 | **Pull up the floor**: protected time, explicit permission, a compulsory hackathon, show-and-tell, "no-IDE weeks", telemetry-based tiers, attribution fixed so agent work counts for the person (S1, S2, S4) | Protected learning time. A mandatory "agent day" per team. Credit for agent-completed work goes to the initiating DRI. Adoption telemetry by team | Per-individual telemetry and tiering may conflict with EU works councils and monitoring law. Intercom used pseudonymisation, opt-out and 14-day expiry (S4). Recommend aggregate-only reporting by default |
| 18 | **Expect a quality dip; have the measurement in place before it** (S2, S4) | Baseline first-pass acceptance, escape rate and brand-audit scores **before** the pilot starts | Same principle. The risk is higher because escapes are public |
| 19 | **Preconditions**: a shipping culture, CI/CD, test coverage, high trust (S4, S11) | Build the marketing "CI" first: pre-flight validation (specs, claims, links, accessibility, rights) and verified publishing | **Most marketing organisations lack this foundation.** It is a build item, not a given, and it is the biggest reason a marketing 2x will take longer than Intercom's |
| 20 | **Product-side eval discipline** (Fin): backtest, A/B with one pre-declared primary metric, standing rules ("never knowingly ship a resolution rate regression, and never knowingly increase hallucinations"), ramped rollout (S8) | The effectiveness tier: holdouts and A/B for agent-run optimisation, standing rules ("never knowingly ship a compliance regression"), ramped autonomy | Intercom's R&D 2x **did not** use this for its productivity claim; it lives on the product side. For marketing it is the route from capacity to evidence of effectiveness, and goes beyond what Intercom showed for 2x |

### Intercom's own marketing organisation (context, not evidence of a marketing 2x)

- Paul Adams (CPO and marketing lead) reorganised marketing separately in 2025:
  - "we no longer have a marketing calendar. We're working month to month";
  - "we no longer have marketing teams/departments. We work in small cross-functional workstreams of ~5 people. Each workstream has a single DRI";
  - "Fast beats Approved… Co-ordination, orchestration, approvals. Slow, slow, slow… The DRI holds the quality standard" (S15, 2025-07-01).
  - He also wrote: "A marketer using an agent trained on your strategy, positioning, messaging, and brand voice can generate PMM-level content. Maybe not 100%, but 80%" (S23, 2025-11-17) [CR, opinion].
- **No marketing productivity metric or result has been published.**
- GTM engineering (S17, 2026-06-04) [CR]:
  - an AEO engine that "dramatically increased Fin's visibility in AI chatbot responses and grew bot-sourced revenue pipeline" (no figures);
  - an outbound cockpit that "has already generated $1.2 million in sales pipeline, and we're tracking toward $5 million by year-end";
  - a tool "built… in roughly three weeks that replaced a vendor product we had been evaluating".
- The research team's ROI-deck agent has "produced well over 450 decks, more than a hundred a month" (S5) [CR].
- **Use for the report:** this is evidence that Intercom applies the same pattern (builder paired with a domain expert, an orchestration layer above systems of record, agents with the same data access as humans) to GTM. It is not evidence that marketing doubled.

---

## 9. Implications for the report rewrite (for the requirements and roadmap step)

1. **Opening and thesis:** quote Intercom accurately.
   - It is "merged PRs ÷ all R&D people", explicitly "required, but not sufficient".
   - The gains came from agent-first execution, a shared skills platform, risk-gated review automation and management change, not from "AI writing code" alone.
   - Use "the bottleneck moved from authoring to CI to review" as the bridge to marketing.
2. **"What Intercom did" section:** use the §3 table with [CR] tags and the §6 demonstrated/uncertain split. Retire any wording that implies independent verification.
3. **The 2x definition:** adopt the VCWI-per-FTE-equivalent approach (with agency in the denominator) plus objective-to-live time, and say plainly why no merged-PR equivalent exists (§7.1).
4. **Architecture:** rows 5–13 and 19 of §8 map directly onto "What needs to be built":
   - platform team;
   - skills and policy library;
   - knowledge layer;
   - review agent with a two-axis gate;
   - eval harness with curated ground truth;
   - audit log;
   - pre-flight checks and verified publishing (the "marketing CI").
5. **Economics:** do not import "cost per PR falls because payroll dominates" without adjustment. In marketing, labour is about 22% and agencies about 21% of budget (MEDIUM). Model labour and agency separately to avoid double-counting.
6. **Risks:**
   - irreversibility of publication (no revert);
   - contested ground truth for brand and legal judgments;
   - monitoring and works-council constraints;
   - Goodhart through splitting work items;
   - model-version regressions;
   - token-spend under-forecasting.

## 10. Gaps and open questions

- **Not viewed:** the webinar recording (2026-05-19), the How I AI episode (2026-04-20), Brian Scanlan's X thread, and the Ramp post. Slide-level numbers rely on the reference teardown's screenshots.
- No public baseline month, absolute PR counts, or cost-per-PR values. If the report needs them, they cannot be sourced.
- The "2x principles" document beyond principle 1 is unpublished. The part-two "messy journey" post has not appeared.
- The July 2026 claim that "half are auto-approved" (S6) is a single sentence with no definition or date window.
- The Gartner labour and agency budget shares come from a trade-press reproduction (S20). Confirm against the Gartner release before using them as a Benchmark grade on the page. The site already tracks Gartner 2025 and 2026 via `site/js/data.js`.
- The 95:5 heuristic (S21) is reported through secondary sources. Dawes' original wording is "up to 95%", and it depends on the category.
- The CI meltdown ("10x more expensive") is relayed by S10 from a podcast write-up we could not re-locate.

---

## Source register

| ID | Source | Author / publisher | Date | URL | Status |
|---|---|---|---|---|---|
| S1 | "2×" | Darragh Curran, Fin Ideas | 2025-06-13 | https://ideas.fin.ai/p/2 | Fetched in full |
| S2 | "2× – nine months later: We did it" | Darragh Curran, Fin Ideas | 2026-04-16 | https://ideas.fin.ai/p/2x-nine-months-later | Fetched in full (chart images not readable as text) |
| S3 | "AI is approving our pull requests: Here's how we made it safe" | Kesha Mykhailov and Niamh Young, Intercom Blog | 2026-04-21 (ideas.fin.ai mirror 2026-04-24) | https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/ | Fetched in full |
| S4 | "Webinar Q&A: How Fin 3x'd R&D output in 16 months" | Darragh Curran, Fin Ideas (also an X article) | 2026-05-22 | https://ideas.fin.ai/p/webinar-q-and-a-how-fin-3xd-r-and | Fetched in full |
| S5 | "Nobody changed their title. Everybody changed their job." | Karen Church, Fin Ideas | 2026-07-07 | https://ideas.fin.ai/p/nobody-changed-their-title-everybody | Fetched in full |
| S6 | "How eight people hold the bar for 200+ builders" | Clíona de Róiste, Fin Ideas | 2026-07-09 | https://ideas.fin.ai/p/how-eight-people-hold-the-bar-for | Fetched in full |
| S7 | "Claude Code: Good skills, bad skills" | Brian Scanlan, Fin Ideas | 2026-07-15 | https://ideas.fin.ai/p/claude-code-good-skills-bad-skills | Fetched in full |
| S8 | "Why not just ship it?" | Pedro Tabacof, Fin Ideas | 2026-08-28 | https://ideas.fin.ai/p/why-not-just-ship-it | Fetched in full |
| S9 | How I AI episode page, "How Intercom 2x'd their engineering velocity in 9 months with Claude Code" | Lenny's Newsletter / Claire Vo | 2026-04-20 | https://www.lennysnewsletter.com/p/how-intercom-2xd-their-engineering | Episode page and chapter list only; recording not viewed |
| S10 | Reference teardown "What Intercom actually built to double engineering throughput" | lyonsv (third party, graded) | 2026-08-25 | https://lyonsv.github.io/intercom-2x-teardown/ | Fetched in full. Source of the slide-only figures |
| S11 | "Shipping Is Your Company's Heartbeat: A Letter from a CTO" | Honeycomb (Curran's chapter) | 2026-07-14 | https://www.honeycomb.io/blog/shipping-is-your-companys-heartbeat-letter-from-cto | Fetched |
| S12 | "Fin's CTO on Building Great Engineering Organizations in the AI Era" | Honeycomb | 2026-08-31 | https://www.honeycomb.io/blog/fin-cto-building-great-engineering-organizations-ai-era | Fetched. Note: it misdates the public commitment to "April" (it was June 2025) |
| S13 | "Today Intercom becomes Fin" | Eoghan McCabe, Fin Ideas | 2026-05-12 | https://ideas.fin.ai/p/today-intercom-becomes-fin | Fetched |
| S14 | "Salesforce signs definitive agreement to acquire Fin" | Eoghan McCabe, Fin Ideas | 2026-06-15 | https://ideas.fin.ai/p/salesforce-signs-definitive-agreement | Fetched. Confirms about $3.6B; close expected in Q4 of Salesforce FY2027 |
| S15 | "Marketing in an AI World" | Paul Adams, Fin Ideas | 2025-07-01 | https://ideas.fin.ai/p/marketing-in-an-ai-world | Fetched |
| S16 | "Marketing Principles for the AI Age" | Paul Adams, Fin Ideas | 2025-07-07 | https://ideas.fin.ai/p/marketing-principles-for-the-ai-age | Fetched |
| S17 | "The rise of GTM engineering" | Dave Lynch, Fin Ideas | 2026-06-04 | https://ideas.fin.ai/p/the-rise-of-gtm-engineering | Fetched |
| S18 | "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity" | METR | 2025-07-10 | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ | Fetched via WebFetch summary. The page now marks itself "out of date" |
| S19 | METR uplift update | METR | 2026-02-24 | https://metr.org/blog/2026-02-24-uplift-update/ | Fetched via WebFetch summary |
| S20 | "Agencies firmly in the firing line as CMOs plot cutbacks" (reports the Gartner 2025 CMO Spend Survey) | DecisionMarketing | 2025 (survey released 2025-05-12) | https://www.decisionmarketing.co.uk/news/agencies-firmly-in-the-firing-line-as-cmos-plot-cutbacks | Fetched. Secondary; MEDIUM |
| S21 | "The 95:5 rule is the new 60:40 rule" and others (reporting Dawes / B2B Institute 2021) | Marketing Week and others | various | https://www.marketingweek.com/peter-weinberg-jon-lombardo-95-5-rule | Search results only; primary paper not fetched; LOW–MEDIUM |
| S22 | "From resolutions to outcomes: Evolving how Fin delivers value" | Intercom Blog | metadata 2026-03-12 (body cites June 2026 data, so probably updated) | https://www.intercom.com/blog/from-resolutions-to-outcomes-evolving-how-fin-delivers-value/ | Fetched |
| S23 | "The Rise of the Full Stack Marketer" | Paul Adams, Fin Ideas | 2025-11-17 | https://ideas.fin.ai/p/the-rise-of-the-full-stack-marketer | Fetched |
