// Structure and binding checks for section 05 (#economics), plan 07-06: ECONP-01..04, ECONP-06, THESIS-04.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, strip } from './helpers/html.js';
import { claims } from '../site/js/data.js';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const whole = elementById(html, 'economics');
// The calculator (#s11) is rewired in plan 07-07 and is out of scope for this file.
const section = whole.slice(0, whole.indexOf('<div id="s11"'));

function tableByCaption(caption, scope = section) {
  const t = (scope.match(/<table>[\s\S]*?<\/table>/g) || []).find((x) => x.includes(`<caption>${caption}</caption>`));
  assert.ok(t, `table "${caption}"`);
  return t;
}
const headOf = (t) => [...t.slice(0, t.indexOf('<tbody>')).matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
const bodyRows = (t) => t.slice(t.indexOf('<tbody>')).match(/<tr\b[\s\S]*?<\/tr>/g) || [];
const figsOf = (h) => [...h.matchAll(/data-fig="([^"]+)"/g)].map((m) => m[1]);

test('section has the chain position, an evidence-stop and no to-follow marker', () => {
  assert.ok(section.includes('<p class="chain-pos">'));
  assert.ok(!html.includes('class="to-follow"'), 'no to-follow marker anywhere on the page');
  assert.equal((section.match(/class="evidence-stop"/g) || []).length, 1);
  assert.ok(whole.includes('<div id="s11"'), 'the calculator stays below the new content');
});

test('honest 2x panel: org-wide and portfolio multiples, uniform limit and binding roles from econ claims', () => {
  const start = section.indexOf('<h3 id="honest-2x">');
  assert.ok(start > 0);
  const panel = section.slice(start, section.indexOf('<h3 id="workflow-inventory">'));
  const figs = figsOf(panel);
  for (const id of ['econ-metric-org_after_platform', 'econ-metric-org_before_platform', 'econ-metric-portfolio_after_platform', 'econ-metric-portfolio_before_platform', 'econ-metric-max_uniform_multiplier', 'econ-max-uniform-excl-traffic']) {
    assert.ok(figs.includes(id), id);
  }
  for (const id of figs) assert.match(id, /^econ-/);
  const text = strip(panel);
  assert.ok(/uniform 2x across every workflow is not sustainable/.test(text));
  assert.ok(/tests 2x; it does not assume it/.test(text));
  assert.ok(/Outcomes are not claimed to double/.test(text));
  assert.ok(/not a claim that 2x is achieved/.test(text));
  // the honest numbers are the engine's, not 2x
  assert.ok(claims['econ-metric-org_after_platform'].value < 2 && claims['econ-metric-portfolio_after_platform'].value < 2);
});

test('inventory: condensed table has ten rows and five columns, full table has eight fields and ten rows inside details', () => {
  const cond = tableByCaption('Marketing workflows, today and with agents');
  assert.deepEqual(headOf(cond), ['Workflow', 'Business objective', 'What agents could run', 'What stays human', 'Priority score']);
  assert.equal(bodyRows(cond).length, 10);
  const det = section.match(/<details class="maths">\s*<summary>All eight fields for each workflow<\/summary>[\s\S]*?<\/details>/);
  assert.ok(det, 'details block');
  const full = tableByCaption('Workflow inventory in full', det[0]);
  assert.ok(!cond.includes('Workflow inventory in full') && section.indexOf(full) > section.indexOf(det[0].slice(0, 40)));
  const head = headOf(full);
  assert.deepEqual(head, ['Workflow', 'Work today', 'Objective', 'People, agencies and tools', 'Sources of labour, delay and rework', 'What agents could execute', 'Decisions that stay human', 'Impact on hours, cost, throughput and KPIs', 'Shared infrastructure needed']);
  assert.equal(head.length - 1, 8, 'the eight brief fields besides the workflow name');
  const rows = bodyRows(full);
  assert.equal(rows.length, 10);
  for (const r of rows) assert.equal((r.match(/<td>/g) || []).length, 8);
});

test('prioritisation: ten rows, seven columns, scores bound to the Speculative judgement claims, sorted by total', () => {
  const t = tableByCaption('Where to start: prioritisation');
  assert.equal(headOf(t).length, 7);
  const rows = bodyRows(t);
  assert.equal(rows.length, 10);
  const totals = [];
  for (const r of rows) {
    const figs = figsOf(r);
    assert.equal(figs.length, 6);
    for (const id of figs) assert.match(id, /^prio-W\d+-(value|feasibility|repeatability|risk|autonomy|total)$/);
    assert.equal((r.match(/class="chip c-s"/g) || []).length, 1, 'one Speculative chip per row');
    assert.ok(r.includes('href="#asm-prioritisation"'));
    totals.push(claims[figs.at(-1)].value);
  }
  assert.deepEqual(totals, [...totals].sort((a, b) => b - a));
  assert.ok(/not a source of 2x/.test(strip(section)), 'creative production is not a 2x source');
});

test('prio claims: totals are sums of the five scores, all on one Speculative register row', () => {
  for (let n = 1; n <= 10; n++) {
    const parts = ['value', 'feasibility', 'repeatability', 'risk', 'autonomy'].map((k) => claims[`prio-W${n}-${k}`].value);
    assert.equal(claims[`prio-W${n}-total`].value, parts.reduce((x, y) => x + y, 0));
    for (const k of ['value', 'feasibility', 'repeatability', 'risk', 'autonomy', 'total']) {
      const c = claims[`prio-W${n}-${k}`];
      assert.equal(c.ref, 'asm-prioritisation');
      assert.equal(c.grade, 'Speculative');
    }
  }
});

test('per-workflow tables: eleven measures for W2, W4, W5, W6, every value an econ-wf claim, every row has an evidence label', () => {
  const t1 = tableByCaption('Per workflow: current against agent-enabled');
  const t2 = tableByCaption('Per workflow: cost and speed, current against agent-enabled');
  const seen = new Set();
  for (const t of [t1, t2]) {
    const rows = bodyRows(t);
    assert.equal(rows.length, 8, 'four workflows, two states each');
    for (const r of rows) {
      assert.ok(/<span class="ev">(illustrative|hypothesis)<\/span>/.test(r), 'evidence label');
      const figs = figsOf(r);
      assert.ok(figs.length >= 5);
      for (const id of figs) {
        assert.match(id, /^econ-wf-W(2|4|5|6)-(current|agent)-[a-z_]+$/);
        seen.add(id.split('-').slice(4).join('-'));
      }
      const cells = [...r.matchAll(/<td class="num">([\s\S]*?)<\/td>/g)];
      for (const [, cell] of cells) assert.ok(/^<span data-fig="econ-wf-[^"]+">[^<]*<\/span>$/.test(cell), `value cell is a bare econ-wf figure: ${cell}`);
    }
  }
  assert.deepEqual([...seen].sort(), ['agency_cost', 'ai_cost', 'autonomous_share', 'cost_per_unit', 'cycle_days', 'fte', 'hours_per_unit', 'labour_cost', 'review_hours', 'total_hours', 'units']);
  assert.equal(seen.size, 11);
  assert.ok(/portfolio model, annual/i.test(strip(section)), 'scope note');
});

test('roll-up table: the six other workflows, two states each, with evidence labels', () => {
  const t = tableByCaption('Other workflows at roll-up');
  const rows = bodyRows(t);
  assert.equal(rows.length, 12);
  assert.equal((t.match(/rowspan="2"/g) || []).length, 6);
  for (const r of rows) {
    assert.ok(/<span class="ev">(illustrative|hypothesis)<\/span>/.test(r));
    for (const id of figsOf(r)) assert.match(id, /^econ-wf-W(1|3|7|8|9|10)-(current|agent)-(total_hours|fte|autonomous_share)$/);
  }
});

// ---- Task 2: scenarios, investment, reconciliation, reviewer bridge, scale vs programme, sensitivity ----

test('scenarios table: three scenario columns with C marked default, honest net, payback and null handling', () => {
  const t = tableByCaption('Scenarios A, B and C side by side');
  const head = headOf(t);
  assert.equal(head.length, 5);
  assert.deepEqual(head.slice(1, 4), ['A: same team, more output', 'B: same output, lower cost', 'C: growing demand, limited hiring (default)']);
  assert.ok(head[3].endsWith('(default)') && !head[1].includes('default') && !head[2].includes('default'));
  const rows = bodyRows(t);
  const label = (r) => strip(r.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]);
  const byLabel = Object.fromEntries(rows.map((r) => [label(r), r]));
  const net = byLabel['Annual net cash effect against today'];
  assert.deepEqual(figsOf(net), ['econ-scen-A-net', 'econ-scen-B-net', 'econ-scen-C-net']);
  assert.deepEqual(figsOf(byLabel['Annual run cost of the programme']), ['econ-scen-A-run_cost', 'econ-scen-B-run_cost', 'econ-scen-C-run_cost']);
  // A has no cash saving and no payback; the engine returns no figure, so the cell says so in words
  assert.ok(claims['econ-scen-A-net'].value < 0, 'scenario A has no cash saving');
  assert.equal(claims['econ-scen-A-payback_simple'], undefined);
  assert.match(strip(byLabel['Simple cash payback on the one-off cost']), /Not applicable: no cash saving/);
  // CR-02: C's spend rises against today, so it has no cash payback; the avoided-cost
  // payback is on its own labelled row.
  assert.match(strip(byLabel['Simple cash payback on the one-off cost']), /Not applicable: spend rises against today/);
  assert.deepEqual(figsOf(byLabel['Simple cash payback on the one-off cost']), ['econ-scen-B-payback_simple']);
  assert.ok(claims['econ-scen-C-net'].value < 0, 'scenario C spend rises against today');
  near(claims['econ-scen-C-net'].value, -claims['econ-scen-C-versus_today'].value, 1e-6);
  const avoidedRows = rows.filter((r) => /against growing without the programme/.test(label(r)));
  assert.deepEqual(avoidedRows.flatMap(figsOf), ['econ-scen-C-avoided_cost', 'econ-scen-C-net_avoided', 'econ-scen-C-payback_avoided']);
  for (const r of avoidedRows) assert.match(label(r), /not (cash|a cash payback)/);
  for (const id of ['econ-scen-A-net', 'econ-scen-B-net', 'econ-scen-C-net']) assert.equal(claims[id].grade, 'Speculative', id);
  // scenario-specific rows
  for (const id of ['econ-scen-A-implied_agency_growth', 'econ-scen-B-removable_fte', 'econ-scen-B-labour_saving', 'econ-scen-B-agency_saving', 'econ-scen-B-year1_net',
    'econ-scen-B-one_off', 'econ-scen-C-hires_with', 'econ-scen-C-hires_without', 'econ-scen-C-avoided_hires', 'econ-scen-C-avoided_cost', 'econ-scen-C-net_avoided']) {
    assert.ok(figsOf(t).includes(id), id);
  }
  for (const r of rows) assert.ok(strip(r).length > 0);
  const text = strip(section);
  assert.ok(/There is no cash saving/.test(text), 'A: no cash saving');
  assert.ok(/not a recommendation to remove anyone/.test(text), 'B: removable FTE is capacity, not a recommendation');
  assert.ok(/Scenario C still costs more than today/.test(text), 'C: spend still rises against today');
  assert.ok(claims['econ-scen-C-versus_today'].value > 0);
});

test('investment table: build, change, run lines, an escape-cost row and a Speculative severance row', () => {
  const t = tableByCaption('What the programme costs to build and run');
  const rows = bodyRows(t);
  assert.equal(rows.length, 9);
  const ids = rows.flatMap(figsOf);
  for (const k of ['build', 'change', 'severance_B', 'platform_team', 'platform_tooling', 'autonomy_overhead', 'inference', 'variant_ai', 'escape']) assert.ok(ids.includes(`econ-inv-${k}`), k);
  const sev = rows.find((r) => r.includes('econ-inv-severance_B'));
  const esc = rows.find((r) => r.includes('econ-inv-escape'));
  assert.match(sev, /class="chip c-s"[^>]*>Speculative</);
  assert.match(esc, /class="chip c-s"[^>]*>Speculative</);
  assert.match(strip(section), /Inference is small; the people who run the platform dominate the run cost/);
  assert.ok(claims['econ-inv-inference'].value < claims['econ-inv-platform_team'].value / 10);
});

test('reconciliation: the six destinations plus a check row, and baseline slack shown on its own', () => {
  const t = tableByCaption('Released hours, reconciled');
  const rows = bodyRows(t);
  const labels = rows.map((r) => strip(r.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]));
  const want = ['Hours of existing work eliminated', 'Redeployed into additional work', 'Avoided future hires', 'Reducible external spend', 'Removable headcount', 'Capacity already unused at baseline', 'Check:'];
  for (const w of want) assert.ok(labels.some((l) => l.startsWith(w)), w);
  const slack = rows.find((r) => r.includes('econ-recon-slack0'));
  assert.ok(/not a programme gain/.test(strip(slack)));
  assert.equal((slack.match(/colspan="3"/g) || []).length, 1, 'baseline slack is one separate figure, not split across scenarios');
  const check = rows.find((r) => strip(r).startsWith('Check:'));
  assert.deepEqual(figsOf(check), ['econ-recon-A-gap', 'econ-recon-B-gap', 'econ-recon-C-gap']);
  for (const k of ['A', 'B', 'C']) assert.ok(Math.abs(claims[`econ-recon-${k}-gap`].value) < 1e-9, `scenario ${k} reconciles`);
  assert.ok(figsOf(t).includes('econ-scen-C-avoided_hires'));
  assert.ok(figsOf(t).includes('econ-recon-released_hours'));
});

test('reviewer bridge keeps baseline slack separate and links Appendix C and back', () => {
  const t = tableByCaption('Reviewer capacity, reconciled');
  const rows = bodyRows(t);
  const ids = rows.flatMap(figsOf);
  assert.deepEqual(ids, ['econ-bridge-slack_baseline', 'econ-bridge-programme_added_load', 'econ-bridge-work_avoided', 'econ-bridge-avoided_hires', 'econ-bridge-unused', 'econ-bridge-removable_same_output', 'econ-bridge-max_multiple_at_target']);
  assert.ok(/Spare reviewer capacity before the programme, not a programme gain/.test(strip(rows[0])));
  assert.ok(section.includes('<a href="#s07">Appendix C</a>'));
  const s07 = elementById(html, 's07');
  assert.ok(s07.includes('href="#reconciliation"'), 'Appendix C points back to the reconciliation');
  assert.ok(html.includes('id="reconciliation"'));
});

test('scale versus programme: slice scope labelled, every effect an econ claim', () => {
  const start = section.indexOf('<h3 id="scale-programme">');
  const block = section.slice(start, section.indexOf('<h3 id="sensitivity">'));
  assert.ok(/Scope: the production slice/.test(strip(block)));
  const ids = figsOf(block);
  assert.deepEqual(ids, ['econ-effects-total_cost-scale_effect', 'econ-effects-total_cost-programme_effect', 'econ-effects-total_cost-scale_share', 'econ-effects-cost_per_asset-scale_effect', 'econ-effects-cost_per_asset-programme_effect', 'econ-effects-cost_per_asset-scale_share']);
});

test('sensitivity table: four inputs, engine cells, nulls written as Not applicable; largest multiples for ten workflows', () => {
  const t = tableByCaption('Sensitivity of the result');
  const text = strip(t);
  for (const input of ['Adoption', 'Escape rate', 'Inference price', 'Review overhead']) assert.ok(text.includes(input), input);
  assert.equal(bodyRows(t).length, 8);
  for (const id of figsOf(t)) assert.match(id, /^econ-sens-(adoption|escape|inference|review_overhead)-(low|high)-(org_A_after|net_B)$/);
  assert.equal(claims['econ-sens-adoption-high-org_A_after'], undefined);
  assert.match(text, /Not applicable/);
  const m = tableByCaption('Largest multiple each team can carry');
  const ids = bodyRows(m).flatMap(figsOf);
  assert.deepEqual(ids, Array.from({ length: 10 }, (_, i) => `econ-max-W${i + 1}`));
  assert.ok(/Traffic, not labour/.test(strip(m)));
});

test('every numeral in #economics outside the calculator sits inside a data-fig span', () => {
  const prose = strip(section
    .replace(/<span data-fig="[^"]+">[^<]*<\/span>/g, ' ')
    .replace(/<span class="sec-num">[^<]*<\/span>/g, ' ')
    .replace(/<a class="chip[^"]*"[^>]*>[^<]*<\/a>/g, ' ')
    .replace(/<a href="#s07">Appendix C<\/a>/g, ' '))
    .replace(/\bT[0-3]\b/g, ' ').replace(/\bW(?:10|[1-9])\b/g, ' ');
  const left = prose.replace(/\b2x\b/g, ' ');
  assert.ok(!/\d/.test(left), `digit outside a figure: ${left.match(/.{25}\d.{25}/)?.[0]}`);
});

test('no vendor name and no hand-typed money in #economics', () => {
  const text = strip(section);
  assert.ok(!/gradial|airops|profound|intercom/i.test(text));
  assert.ok(!/\$\s?\d/.test(strip(section.replace(/<span data-fig="[^"]+">[^<]*<\/span>/g, ' '))));
});
