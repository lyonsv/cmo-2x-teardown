import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EVIDENCE, ALLOWED_PAIRS, sources, assumptions, claims, defaultInputs, defaultAssumptions } from '../site/js/data.js';
import { compute } from '../site/js/calc.js';

const INDEPENDENT = new Set(['government', 'academic', 'press', 'tracker', 'secondary', 'law-firm commentary']);

// The 31 assumptions that describe a programme effect or design to validate in a pilot.
const HYPOTHESIS = [
  'asm-tier-mix', 'asm-auto-approval', 'asm-variant-cost', 'asm-tooling', 'asm-ai-share-variant', 'asm-ai-share-tooling', 'asm-build-days',
  'asm-tier-range-t0', 'asm-tier-range-t1', 'asm-tier-range-t2', 'asm-tier-range-t3', 'asm-reallocation', 'asm-flat-marketing-headcount',
  'asm-review-agent-design', 'asm-harness-design', 'asm-telemetry-metrics', 'asm-fatigue-controls', 'asm-adoption-design',
  'asm-risk-likelihood', 'asm-backlog0-days', 'asm-sampling-rate', 'asm-escalation-rate',
  'asm-lever-01-evidence', 'asm-lever-02-evidence', 'asm-lever-03-evidence', 'asm-lever-04-evidence', 'asm-lever-05-evidence', 'asm-lever-06-evidence',
  'asm-growth-route', 'asm-change-mgmt', 'asm-incident-rate',
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

// Sell-side studies of other organisations' sites: not claims about the publisher's
// own results, so 'vendor-claimed' would mislabel them and the body would have to call
// them vendor claims. The register's publisher column names the seller instead.
const UNFLAGGED_OBSERVED = {
  'haynes-2026': 'SEO consultancy analysing 100 sites; publisher column says it sells SEO services',
  'seoworks-2026': 'agency benchmark of 95 sites; publisher column says it sells GEO services',
};

test('observed sources that are not independent carry a flag, or a reasoned exception', () => {
  for (const [k, s] of Object.entries(sources)) {
    if (s.evidence === 'observed' && !INDEPENDENT.has(s.publisherType) && !UNFLAGGED_OBSERVED[k]) assert.ok(s.flag, `${k}: observed needs a flag`);
  }
  for (const k of Object.keys(UNFLAGGED_OBSERVED)) assert.equal(sources[k].flag, null, `${k}: stale exception`);
});

// Code review WR-02: a benchmark must be independent of what it describes.
test('benchmark sources are never vendor-published', () => {
  for (const [k, s] of Object.entries(sources)) {
    if (s.evidence === 'benchmark') assert.notEqual(s.publisherType, 'vendor', `${k}: vendor source classed benchmark`);
  }
  assert.equal(sources['haynes-2026'].evidence, 'observed');
});

test('no assumption is observed (nothing is observed for the subject organisation)', () => {
  for (const a of Object.values(assumptions)) assert.notEqual(a.evidence, 'observed', a.id);
});

test('source counts', () => {
  const rows = Object.values(sources);
  assert.equal(rows.length, 45 + 5 + 6); // plus five Intercom primary posts (Phase 7, plan 07-02) and six engine sources (06-04)
  // 06-04 adds: two model price lists, a multi-agent token note, an agency billing survey (observed), BLS (benchmark/Benchmark), tau-bench (benchmark/Modelled)
  assert.equal(count(rows, 'benchmark', 'Benchmark'), 12 + 1);
  assert.equal(count(rows, 'benchmark', 'Modelled'), 4 + 1);
  assert.equal(count(rows, 'observed', 'Modelled'), 29 + 5 + 4);
});

test('assumption counts and the hypothesis list', () => {
  const rows = Object.values(assumptions);
  // 65 + 41 engine rows (06-04): 23 globals and 18 workflow rows (asm-productive-hours was already counted)
  assert.equal(rows.length, 65 + 41);
  assert.equal(HYPOTHESIS.length, 31);
  for (const id of HYPOTHESIS) assert.ok(assumptions[id], `stale id ${id}`);
  // Engine rows carry their own evidence, so the oracle is the list in engine-data.test.js's ENGINE_HYPOTHESIS.
  const ENGINE_HYP = ['asm-out-of-scope-uplift', 'asm-overhead-share', 'asm-autonomous-share', 'asm-adoption-rate', 'asm-year1-realisation', 'asm-escape-rate', 'asm-build-cost', 'asm-platform-team', 'asm-autonomy-overhead', 'asm-severance-months', 'asm-counterfactual-funded',
    ...['w1', 'w2', 'w3', 'w4', 'w6', 'w7', 'w8', 'w9', 'w10'].map((w) => `asm-wf-${w}-agent`)];
  for (const a of rows) assert.equal(a.evidence, HYPOTHESIS.includes(a.id) || ENGINE_HYP.includes(a.id) ? 'hypothesis' : 'illustrative', a.id);
  assert.equal(count(rows, 'hypothesis', 'Modelled'), 24 + 18);
  assert.equal(count(rows, 'hypothesis', 'Speculative'), 7 + 2);
  assert.equal(count(rows, 'illustrative', 'Modelled'), 34 + 20);
  assert.equal(count(rows, 'illustrative', 'Speculative'), 1);
});

const RANK = { hypothesis: 0, illustrative: 1, observed: 2, benchmark: 3 };
const classOf = (ref) => (ref.startsWith('src-') ? sources[ref.slice(4)].evidence : assumptions[ref].evidence);

// Code review CR-01: an oracle written independently of data.js. The claim families
// below are computed at the 2x scenario, or state a change from baseline to 2x, so
// each must be a hypothesis whatever its nominal ref says.
const TWO_X_FAMILIES = [
  /^calc-maths-/, /^calc-scen-/, /^calc-sens-/, /^ops-/, /^cap-2x-/, /^tier-default-t\d$/,
  /-scaled$/, /-change$/, /-delta$/,
  /^ai-spend-ratio$/, /^break-even-auto-approval$/, /^capacity-auto-approval$/, /^auto-share-of-eligible$/,
  /^calc-believe-(auto2|tooling|vcost|vcost-swing)$/,
];

// Hand-checked expectations, both ways: what must stay better than a hypothesis,
// and baseline figures that are hypotheses only because a hypothesis input feeds them.
const EXPECTED = {
  'concepts-base': 'illustrative', // campaigns x concepts per campaign
  'cm-base': 'illustrative', // campaigns x markets
  'calc-campaign_markets-base': 'illustrative',
  'calc-believe-markets': 'illustrative',
  'cap-capacity-hours': 'illustrative', // reviewer FTE x review hours
  'cap-1x-variants': 'illustrative',
  'cpa-storage-base': 'illustrative', // storage per variant only
  'matrix-approved': 'illustrative',
  'tests-winners-hi': 'illustrative', // illustrative cadence x a company-reported rate
  'cpa-review-base': 'hypothesis', // the human-touch share uses the auto-approval share
  'calc-utilisation-base': 'hypothesis',
  'cpcm-base': 'hypothesis', // variant cost and tooling feed it
  'cpa-base': 'hypothesis',
  'stat-ordinary-min': 'benchmark',
  'ref-auto-approved-share': 'observed',
  'cap-2x-ref-low-util': 'hypothesis', // company-reported input, computed at 2x
  'cap-2x-ref-high-util': 'hypothesis',
  'ops-exposure-lo': 'hypothesis', // statute range x incidents at 2x master concepts
};

test('claims computed at 2x, or stating a change to 2x, are hypotheses', () => {
  let n = 0;
  for (const c of Object.values(claims)) {
    if (!TWO_X_FAMILIES.some((re) => re.test(c.id))) continue;
    n += 1;
    assert.equal(c.evidence, 'hypothesis', c.id);
  }
  assert.ok(n >= 120, `only ${n} claims matched a 2x family`);
  for (const id of ['cpcm-change', 'budget-share-delta', 'calc-maths-touch-1', 'ops-incidents', 'calc-maths-campaign_markets-1']) {
    assert.equal(claims[id].evidence, 'hypothesis', id);
  }
  // Unit wording is a second, independent signal.
  for (const c of Object.values(claims)) {
    if (/\bat 2x\b|2x minus/.test(c.unit)) assert.equal(c.evidence, 'hypothesis', `${c.id}: unit "${c.unit}"`);
    if ((c.derived || c.calc) && /\bchange\b/i.test(c.unit)) assert.equal(c.evidence, 'hypothesis', `${c.id}: unit "${c.unit}"`);
  }
});

test('hand-checked claim evidence', () => {
  for (const [id, ev] of Object.entries(EXPECTED)) assert.equal(claims[id].evidence, ev, id);
});

test('no claim is stronger than its own ref', () => {
  for (const c of Object.values(claims)) assert.ok(RANK[c.evidence] <= RANK[classOf(c.ref)], `${c.id}: ${c.evidence} above ${c.ref}`);
});

// Behavioural check on the compute() path: move the multiplier, or any hypothesis
// assumption the model reads, and every derived claim that changes must be a hypothesis.
test('derived claims that move with the multiplier or a hypothesis input are hypotheses', () => {
  const at = (inputs, a, c) => {
    const o = c.override;
    const r = compute(o ? { ...inputs, multiplier: o.multiplier } : inputs,
      o ? { ...a, auto_approval_share: { baseline: o.auto_approval_share, scaled: o.auto_approval_share } } : a);
    assert.equal(r.ok, true, c.id);
    return c.derived.split('.').reduce((x, k) => x[k], r);
  };
  const derived = Object.values(claims).filter((c) => c.derived);
  assert.ok(derived.length >= 40);
  const I = defaultInputs();
  const A = defaultAssumptions();
  const moves = [['multiplier', { ...I, multiplier: 3 }, A]];
  const shrink = (v) => (typeof v === 'number' ? v * 0.9 : { baseline: v.baseline * 0.9, scaled: v.scaled * 0.9 });
  for (const asm of Object.values(assumptions)) {
    if (asm.evidence !== 'hypothesis') continue;
    if (asm.kind === 'input') moves.push([asm.id, { ...I, [asm.key]: shrink(asm.value) }, A]);
    // The tier mix is skipped (its shares must sum to one); the route moves to a valid radio.
    if (asm.kind === 'model' && asm.key === 'campaign_growth_share') moves.push([asm.id, I, { ...A, campaign_growth_share: 1 }]);
    else if (asm.kind === 'model' && asm.key !== 'tier_mix') moves.push([asm.id, I, { ...A, [asm.key]: shrink(asm.value) }]);
  }
  assert.ok(moves.length >= 8, `only ${moves.length} moves`);
  for (const c of derived) {
    const was = at(I, A, c);
    for (const [name, inputs, a] of moves) {
      if (Math.abs(at(inputs, a, c) - was) > 1e-9 * Math.max(1, Math.abs(was))) assert.equal(c.evidence, 'hypothesis', `${c.id} moves with ${name}`);
    }
  }
});
