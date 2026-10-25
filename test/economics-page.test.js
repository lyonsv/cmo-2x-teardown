// Structure and binding checks for section 05 (#economics), plan 07-06: ECONP-01..04, ECONP-06, THESIS-04.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, strip } from './helpers/html.js';
import { claims } from '../site/js/data.js';

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
