// Structure checks for the later body sections: #outcomes, #expansion, #roadmap, #risks (plan 07-08).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, strip } from './helpers/html.js';
import { claims, assumptions, sources } from '../site/js/data.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');

function tableByCaption(scope, caption) {
  const t = (scope.match(/<table[^>]*>[\s\S]*?<\/table>/g) || []).find((x) => x.includes(`<caption>${caption}</caption>`));
  assert.ok(t, `table "${caption}"`);
  return t;
}
const bodyRows = (t) => t.slice(t.indexOf('<tbody>')).match(/<tr\b[\s\S]*?<\/tr>/g) || [];
const headOf = (t) => [...t.slice(0, t.indexOf('<tbody>')).matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
const rowName = (r) => strip(r.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]);
const figsOf = (h) => [...h.matchAll(/data-fig="([^"]+)"/g)].map((m) => m[1]);
// A heading block: from the h3 with this id to the next h3 (or the end of the section).
function h3Block(section, id) {
  const start = section.indexOf(`<h3 id="${id}">`);
  assert.ok(start >= 0, `h3 #${id}`);
  const rest = section.slice(start + 10);
  const next = rest.search(/<h3\b|<div id="s\d\d" class="subsection">/);
  return section.slice(start, next < 0 ? undefined : start + 10 + next);
}

// ---- #outcomes ----
const outcomes = elementById(html, 'outcomes');

test('outcomes: the causal chain has the evidence boundary right after "objective-to-live"', () => {
  const block = h3Block(outcomes, 'causal-chain');
  const items = block.match(/<ol class="chain causal">([\s\S]*?)<\/ol>/)[1].match(/<li\b[^>]*>[\s\S]*?<\/li>/g);
  assert.ok(items.length >= 6);
  const at = items.findIndex((li) => li.includes('objective-to-live'));
  assert.ok(at >= 0, 'an item with objective-to-live');
  assert.ok(items[at + 1].startsWith('<li class="evidence-boundary">'), 'the boundary follows it');
  assert.ok(/Evidence stops here; what follows is hypothesis/.test(strip(items[at + 1])), 'text label, not colour alone');
  assert.equal((html.match(/class="evidence-boundary"/g) || []).length, 1);
  assert.ok(strip(items[0]).startsWith('Higher agent autonomy'));
  assert.ok(/more qualified demand and faster learning/.test(strip(items.at(-1))));
});

test('outcomes: three-tier scorecard with units and sources', () => {
  const t = tableByCaption(outcomes, 'Scorecard: telling productivity from activity');
  assert.deepEqual(headOf(t), ['Tier', 'Metric', 'Unit', 'Measured from', 'Why it is not just activity']);
  const tiers = { 'Business outcomes': 0, 'Operating economics': 0, 'Autonomy and quality': 0 };
  for (const r of bodyRows(t)) {
    tiers[rowName(r)] += 1;
    const cells = [...r.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => strip(m[1]));
    assert.equal(cells.length, 4);
    for (const c of cells) assert.ok(c.length > 0 && !/\d/.test(c), c);
  }
  assert.ok(tiers['Business outcomes'] >= 4 && tiers['Operating economics'] >= 5 && tiers['Autonomy and quality'] >= 5, JSON.stringify(tiers));
  assert.ok(!/Vodori|Intercom/.test(strip(t)), 'no vendor comparator');
});

test('outcomes: diminishing returns cites both studies with Benchmark chips, four mechanisms follow', () => {
  const block = h3Block(outcomes, 'diminishing-returns');
  for (const k of ['shapiro-hitsch-tuchman-2021', 'lewis-rao-2015']) {
    assert.ok(block.includes(`<a class="chip c-b" href="#src-${k}">Benchmark</a>`), k);
    assert.ok(html.includes(`<tr id="src-${k}">`), `register row ${k}`);
    assert.equal(sources[k].grade, 'Benchmark');
  }
  for (const id of ['shapiro-negative-margin', 'lewis-rao-ci-width']) {
    assert.ok(block.includes(`data-fig="${id}"`), id);
    assert.equal(claims[id].grade, 'Benchmark');
  }
  assert.ok(/Shapiro, Hitsch and Tuchman/.test(strip(block)) && /Lewis and Rao/.test(strip(block)));
  const dts = [...block.matchAll(/<dt>([\s\S]*?)<\/dt>/g)].map((m) => strip(m[1]));
  assert.deepEqual(dts, ['Speed to market', 'Learning velocity', 'Reallocation', 'Market coverage']);
});

test('outcomes: v1 s10 block and its falsifier stay', () => {
  assert.ok(outcomes.includes('<div id="s10" class="subsection">'));
  assert.ok(outcomes.includes('The falsifier in <a href="#s01">section 01</a> still applies'));
  assert.ok(outcomes.includes('How lift would be proven'));
});

// ---- #expansion ----
const expansion = elementById(html, 'expansion');

test('expansion: adjacent workflows table has seven rows and links every first-edition lever', () => {
  const t = tableByCaption(expansion, 'Adjacent workflows on the shared platform');
  assert.deepEqual(headOf(t), ['Workflow', 'What the agent does', 'What it reuses', 'What it needs that is new', 'Autonomy level reachable']);
  assert.equal(bodyRows(t).length, 7);
  for (const id of ['s09-localisation', 's09-experimentation', 's09-insight', 's09-ops', 's09-aeo']) {
    assert.ok(t.includes(`href="#${id}"`), `row links #${id}`);
    assert.ok(expansion.includes(`<h4 id="${id}">`), `h4 ${id} survives`);
  }
  assert.ok(/Higher autonomy/.test(strip(t)));
});

test('expansion: reusable and domain-specific table, the narrow-first sentence and the v1 block', () => {
  const t = tableByCaption(expansion, 'What is reusable and what is not');
  assert.deepEqual(headOf(t), ['Capability', 'Reusable as is', 'Needs domain-specific work']);
  assert.ok(bodyRows(t).length >= 6);
  assert.ok(/The first product is narrow enough to prove, and the programme is broad enough to make a doubling plausible\./.test(strip(expansion)));
  assert.ok(expansion.includes('<div id="s09" class="subsection">'));
  assert.ok(expansion.includes('<h3 id="s09-h">'));
});

// ---- #roadmap ----
const roadmap = elementById(html, 'roadmap');
const PILOT_IDS = ['asm-pilot-target-hours', 'asm-pilot-target-cycle', 'asm-pilot-escape-ceiling', 'asm-pilot-first-pass-floor'];

test('roadmap: the pilot table has the eight named rows', () => {
  const t = tableByCaption(roadmap, 'The pilot at a glance');
  assert.deepEqual(bodyRows(t).map(rowName), ['Workflow and why', 'Software built', 'Integrations', 'Baseline', 'Autonomy ceiling', 'Targets', 'Acceptance criteria', 'How success is shown']);
  assert.ok(/weeks one to three/.test(strip(t)), 'baseline time study in weeks one to three');
  assert.ok(/Stage:/.test(strip(t)), 'stage ceiling');
});

test('roadmap: every numeral in the pilot is a data-fig on a Speculative claim; pilot targets are hypotheses', () => {
  const block = h3Block(roadmap, 'pilot');
  const text = strip(block
    .replace(/<span data-fig="[^"]+">[^<]*<\/span>/g, ' ')
    .replace(/<a class="chip[^"]*"[^>]*>[^<]*<\/a>/g, ' '));
  assert.ok(!/\d/.test(text), `digit outside a figure: ${text.match(/.{20}\d.{20}/)?.[0]}`);
  for (const id of figsOf(block)) {
    const e = claims[id] ?? assumptions[id];
    assert.equal(e.grade, 'Speculative', id);
  }
  for (const id of PILOT_IDS) {
    assert.ok(block.includes(`data-fig="${id}"`), id);
    const a = assumptions[id];
    assert.equal(a.kind, 'context');
    assert.equal(a.grade, 'Speculative');
    assert.equal(a.evidence, 'hypothesis');
    assert.ok(block.includes(`<a class="chip c-s" href="#${id}">Speculative</a> <span class="ev">hypothesis</span>`), `${id} chip and hypothesis label`);
    assert.ok(html.includes(`<tr id="${id}">`), `register row ${id}`);
  }
});

test('roadmap: next two quarters has rows E1 to E3', () => {
  const t = tableByCaption(roadmap, 'Next two quarters: raise autonomy and widen');
  assert.deepEqual(headOf(t), ['Step', 'What gets built', 'Bottleneck removed', 'Interventions reduced', 'Expected measurable change']);
  const rows = bodyRows(t);
  assert.equal(rows.length, 3);
  ['E1', 'E2', 'E3'].forEach((e, i) => assert.ok(rowName(rows[i]).startsWith(e), e));
  for (const r of rows) assert.ok(/hypothesis/.test(r) && /class="chip c-s"/.test(r));
});

test('roadmap: the portfolio is from the engine, explains pooling and is separated from proven pilot results', () => {
  const block = h3Block(roadmap, 'portfolio');
  const figs = figsOf(block);
  for (const id of ['econ-metric-org_after_platform', 'econ-metric-pooled_hours_multiple', 'econ-scen-C-avoided_hires']) assert.ok(figs.includes(id), id);
  for (const id of figs) assert.match(id, /^econ-/);
  assert.ok(/without double counting/.test(strip(block)) && block.includes('href="#reconciliation"'));
  const t = tableByCaption(block, 'Proven by the pilot versus projected');
  assert.deepEqual(headOf(t), ['What the pilot will have measured', 'What remains a projection']);
  assert.ok(bodyRows(t).length >= 4);
  assert.ok(block.indexOf('Proven by the pilot versus projected') > block.indexOf('data-fig="econ-metric-org_after_platform"'));
  assert.equal(tableByCaption(block, 'Where each workflow could be at twelve months').match(/<th scope="row">/g).length, 10);
  assert.ok(!/revenue (rise|gain|of)/.test(strip(block)), 'no revenue is computed from capacity');
});

test('roadmap: enablement names the redesigned roles and the platform team; v1 s13 stays', () => {
  const block = h3Block(roadmap, 'enablement');
  const t = strip(block);
  for (const w of ['eval curator', 'workflow owner', 'platform team', 'works councils']) assert.ok(t.includes(w), w);
  assert.ok(block.includes('data-fig="econ-inv-platform_team"'));
  assert.ok(roadmap.includes('<div id="s13" class="subsection">'));
  assert.ok(roadmap.includes('<h4>Backlog 0, defined</h4>'));
});

// ---- #risks ----
const risks = elementById(html, 'risks');
const RISK_IDS = ['risk-irreversible', 'risk-ground-truth', 'risk-compounding', 'risk-judge-drift', 'risk-inference', 'risk-goodhart-autonomy', 'risk-labour', 'risk-regressions'];

test('risks: eight agent risks, each with a mitigation or a test', () => {
  assert.ok(risks.includes('<h3 id="agent-risks">'));
  for (const id of RISK_IDS) {
    const start = risks.indexOf(`<h4 id="${id}">`);
    assert.ok(start >= 0, id);
    const block = risks.slice(start, risks.indexOf('</div>', start));
    assert.ok(/<p class="mitigation"><b>(Mitigation|Test):<\/b>/.test(block), `${id} has a mitigation or test`);
    assert.ok(start < risks.indexOf('<div id="s14" class="subsection">'), `${id} sits in the lead block`);
  }
  assert.deepEqual(figsOf(risks.slice(risks.indexOf('<h3 id="agent-risks">'), risks.indexOf('<div id="s14"'))), ['econ-inv-inference', 'econ-inv-severance_B']);
  const text = strip(risks.slice(risks.indexOf('<h3 id="agent-risks">'), risks.indexOf('<div id="s14"')));
  for (const w of ['Stage, verify, then publish', 'kill switch', 'Pin model versions', 'works councils']) assert.ok(text.includes(w), w);
});

test('risks: the register keeps the v1 rows and adds eight', () => {
  const t = tableByCaption(risks, 'Risk register: likelihood grade, mitigation and owner');
  const names = bodyRows(t).map(rowName);
  assert.equal(names.length, 14);
  assert.deepEqual(names.slice(0, 6), ['Slop and sameness', 'Reviewer fatigue', 'Goodhart on counts and spend', 'IP and copyrightability', 'Regulation', 'Agent liability']);
  for (const n of ['Irreversible publication', 'Contested ground truth', 'Compounding multi-step error', 'Judge drift', 'Inference and token spend', 'Goodhart on the autonomy percentage', 'Labour relations', 'Model regressions']) assert.ok(names.includes(n), n);
  assert.ok(risks.includes('<div id="s14" class="subsection">') && risks.includes('<h4 id="s14-slop">'));
});
