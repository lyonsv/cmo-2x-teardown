# Retrospective

## Milestone: v1.0 — CMO 2x Teardown

**Shipped:** 2026-10-24
**Phases:** 5 (1, 2, 3, 3.1, 4) | **Plans:** 43

### What Was Built
A single evidence-graded static page on GitHub Pages: thesis and CFO case, factory and review spine, levers and outcomes, an interactive tested calculator, a sourced vendor comparison, adoption, risk and an evidence register, gated by tests, crosscheck, accessibility and print checks.

### What Worked
- One source of numbers (`data.js`) plus a scripted crosscheck kept page, figures and calculator in agreement through a late headline reframe.
- Test-first engine changes with hand-calculated goldens made the 3.1 metric swap safe.
- Independent code review after each phase caught honesty defects the tests could not (e.g. "live" volume that could not go live, a Backlog 0 target the model missed).

### What Was Inefficient
- The headline metric was reframed after three phases had shipped, forcing a page-wide relabel.
- Plans written before author decisions (COI/Getty removal, legal-flag drop) needed orchestrator adaptation at execution time.
- Headless Chrome (CDP) checks flaked intermittently with "no page target".

### Patterns Established
- Grade every number, link every chip to a register row, and let crosscheck fail the deploy on drift.
- Reader-visible claim changes go to the author; mechanical fixes are automated.
- Absence guards (tests that removed content stays removed) after author removals.

### Key Lessons
- Fix the headline metric in CMO terms before building on it.
- Tie targets (e.g. Backlog 0) to the model in code, so they cannot drift from the maths.
- Record dropped manual checks as dropped, not passed.

### Cost Observations
- Model mix: Opus orchestrator, Sonnet executors, reviewers and verifiers.
- Notable: one-plan waves ran sequentially on the main tree without worktrees.

## Cross-Milestone Trends

(First milestone — no trends yet.)
