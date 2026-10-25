// Final test (v2.0-BRIEF): the opening sections. Plan 07-01.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, strip } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const answer = elementById(html, 'answer');
const answerText = strip(answer);
const CHAIN = ['Software built', 'Autonomy enabled', 'Human work reduced', 'Marketing capacity increased', 'Business outcomes improved'];
const SIX = [
  ["What we're building", 'build'],
  ['Why it matters', 'opportunity'],
  ['Where we start', 'supply-chain'],
  ['How it expands', 'expansion'],
  ['What it is worth', 'economics'],
  ['How we prove it', 'roadmap'],
];

test('Final test: first screen shows the five-link chain in order', () => {
  let at = -1;
  for (const l of CHAIN) {
    const i = answerText.indexOf(l, at + 1);
    assert.ok(i > at, l);
    at = i;
  }
});

test('Final test: six answers, exact labels in order, each linking to its section', () => {
  const dl = answer.match(/<dl class="six-answers">([\s\S]*?)<\/dl>/);
  assert.ok(dl, 'dl.six-answers');
  const dts = [...dl[1].matchAll(/<dt>([\s\S]*?)<\/dt>/g)].map((m) => strip(m[1]));
  assert.deepEqual(dts, SIX.map((s) => s[0]));
  const dds = [...dl[1].matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map((m) => m[1]);
  assert.equal(dds.length, 6);
  SIX.forEach(([, id], i) => assert.ok(dds[i].includes(`href="#${id}"`), `dd ${i} links #${id}`));
});

test('Final test: honest headline is engine-bound and never says outcomes double', () => {
  assert.ok(answer.includes('data-fig="econ-metric-org_after_platform"'));
  assert.ok(answer.includes('data-fig="econ-metric-portfolio_after_platform"'));
  assert.ok(!/doubl\w* (revenue|pipeline|outcomes)/i.test(answerText));
  assert.ok(/not a claim that 2x is achieved/.test(answerText));
});

test('Final test: standfirst names agents', () => {
  const sf = html.match(/<p class="standfirst">([\s\S]*?)<\/p>/)[1];
  assert.ok(/agents/.test(strip(sf)));
});

// ---- Task 2: section 01 body ----
const opp = elementById(html, 'opportunity');

test('#opportunity defines 2x, separates capacity from effectiveness and explains the missing merged PR', () => {
  for (const id of ['define-2x', 'capacity-efficiency-effectiveness', 'no-merged-pr']) assert.ok(opp.includes(`<h3 id="${id}">`), id);
  const t = opp.match(/<caption>How 2x is measured<\/caption>[\s\S]*?<\/table>/);
  assert.ok(t, 'caption');
  assert.equal((t[0].match(/<tbody>[\s\S]*<\/tbody>/)[0].match(/<tr>/g) || []).length, 5);
  assert.match(strip(opp), /does not (establish|mean) doubled revenue/i);
});
