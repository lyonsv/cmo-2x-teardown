import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EVIDENCE, ALLOWED_PAIRS, sources, assumptions, claims } from '../site/js/data.js';

const INDEPENDENT = new Set(['government', 'academic', 'press', 'tracker', 'secondary', 'law-firm commentary']);

// The 29 assumptions that describe a programme effect or design to validate in a pilot.
const HYPOTHESIS = [
  'asm-tier-mix', 'asm-auto-approval', 'asm-variant-cost', 'asm-tooling', 'asm-ai-share-variant', 'asm-ai-share-tooling', 'asm-build-days',
  'asm-tier-range-t0', 'asm-tier-range-t1', 'asm-tier-range-t2', 'asm-tier-range-t3', 'asm-reallocation', 'asm-flat-marketing-headcount',
  'asm-review-agent-design', 'asm-harness-design', 'asm-telemetry-metrics', 'asm-fatigue-controls', 'asm-adoption-design',
  'asm-risk-likelihood', 'asm-backlog0-days', 'asm-sampling-rate', 'asm-escalation-rate',
  'asm-lever-01-evidence', 'asm-lever-02-evidence', 'asm-lever-03-evidence', 'asm-lever-04-evidence', 'asm-lever-05-evidence', 'asm-lever-06-evidence',
  'asm-growth-route',
];

const count = (rows, ev, grade) => rows.filter((r) => r.evidence === ev && r.grade === grade).length;

test('EVIDENCE and ALLOWED_PAIRS have the agreed values', () => {
  assert.deepEqual(EVIDENCE, ['observed', 'benchmark', 'illustrative', 'hypothesis']);
  assert.deepEqual(ALLOWED_PAIRS, {
    benchmark: ['Benchmark', 'Modelled'], observed: ['Benchmark', 'Modelled'],
    illustrative: ['Modelled', 'Speculative'], hypothesis: ['Modelled', 'Speculative'],
  });
});

test('every source, assumption and claim has a valid (evidence, grade) pair', () => {
  const all = [...Object.entries(sources), ...Object.entries(assumptions), ...Object.entries(claims)];
  for (const [k, e] of all) {
    assert.ok(EVIDENCE.includes(e.evidence), `${k}: evidence ${e.evidence}`);
    assert.ok(ALLOWED_PAIRS[e.evidence].includes(e.grade), `${k}: ${e.evidence}/${e.grade}`);
  }
});

test('observed sources that are not independent carry a flag', () => {
  for (const [k, s] of Object.entries(sources)) {
    if (s.evidence === 'observed' && !INDEPENDENT.has(s.publisherType)) assert.ok(s.flag, `${k}: observed needs a flag`);
  }
});

test('no assumption is observed (nothing is observed for the subject organisation)', () => {
  for (const a of Object.values(assumptions)) assert.notEqual(a.evidence, 'observed', a.id);
});

test('source counts', () => {
  const rows = Object.values(sources);
  assert.equal(rows.length, 45);
  assert.equal(count(rows, 'benchmark', 'Benchmark'), 12);
  assert.equal(count(rows, 'benchmark', 'Modelled'), 7);
  assert.equal(count(rows, 'observed', 'Modelled'), 26);
});

test('assumption counts and the hypothesis list', () => {
  const rows = Object.values(assumptions);
  assert.equal(rows.length, 62);
  assert.equal(HYPOTHESIS.length, 29);
  for (const id of HYPOTHESIS) assert.ok(assumptions[id], `stale id ${id}`);
  for (const a of rows) assert.equal(a.evidence, HYPOTHESIS.includes(a.id) ? 'hypothesis' : 'illustrative', a.id);
  assert.equal(count(rows, 'hypothesis', 'Modelled'), 23);
  assert.equal(count(rows, 'hypothesis', 'Speculative'), 6);
  assert.equal(count(rows, 'illustrative', 'Modelled'), 32);
  assert.equal(count(rows, 'illustrative', 'Speculative'), 1);
});

const RANK = { hypothesis: 0, illustrative: 1, observed: 2, benchmark: 3 };
const weakest = (a, b) => (RANK[a] <= RANK[b] ? a : b);
const twoXSide = (c) => c.id.endsWith('-scaled') || (c.derived ?? '').startsWith('scenario.') ||
  /scaled|change|scenario|sensitivity/.test(c.calc ?? '') || c.id.startsWith('calc-scen') || c.id.startsWith('calc-sens');
function expectedClaimEvidence(c) {
  const base = c.ref.startsWith('src-') ? sources[c.ref.slice(4)].evidence : assumptions[c.ref].evidence;
  return twoXSide(c) ? weakest(base, 'hypothesis') : base;
}

test('claim evidence is the weakest of its ref and the 2x-side rule', () => {
  assert.equal(claims['cap-2x-ref-low-util'].evidence, 'hypothesis');
  assert.equal(claims['cap-2x-ref-high-util'].evidence, 'hypothesis');
  for (const c of Object.values(claims)) assert.equal(c.evidence, expectedClaimEvidence(c), c.id);
});
