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
