import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GRADES, FLAGS, formatValue, claims, assumptions, sources, defaultInputs, defaultAssumptions, variantMatrixDefaults,
} from '../site/js/data.js';
import { compute, variantMatrix } from '../site/js/calc.js';

const entries = [...Object.values(claims), ...Object.values(assumptions)];

test('map keys equal entry ids and claims/assumptions are disjoint', () => {
  for (const [k, v] of Object.entries(claims)) assert.equal(v.id, k);
  for (const [k, v] of Object.entries(assumptions)) assert.equal(v.id, k);
  for (const k of Object.keys(claims)) assert.ok(!(k in assumptions), `${k} collides`);
});

test('grades and flags are valid', () => {
  for (const e of entries) {
    assert.ok(GRADES.includes(e.grade), `${e.id}: bad grade`);
    assert.ok(e.flag === null || FLAGS.includes(e.flag), `${e.id}: bad flag`);
    if (e.grade === 'Benchmark') assert.equal(e.flag, null, `${e.id}: flagged Benchmark`);
  }
});

test('refs resolve; Benchmark claims cite an https source with an accessed date', () => {
  for (const c of Object.values(claims)) {
    if (c.ref.startsWith('src-')) {
      const s = sources[c.ref.slice(4)];
      assert.ok(s, `${c.id}: missing source ${c.ref}`);
      if (c.grade === 'Benchmark') {
        assert.match(s.url, /^https:\/\//);
        assert.match(s.accessed, /^\d{4}-\d{2}-\d{2}$/);
      }
    } else {
      assert.ok(assumptions[c.ref], `${c.id}: missing assumption ${c.ref}`);
      assert.notEqual(c.grade, 'Benchmark', `${c.id}: Benchmark must cite a source`);
    }
  }
});

test('derived claims equal compute() output on default inputs', () => {
  const r = compute(defaultInputs(), defaultAssumptions());
  assert.equal(r.ok, true);
  for (const c of Object.values(claims)) {
    if (!c.derived || c.override) continue;
    const v = c.derived.split('.').reduce((o, k) => o[k], r);
    assert.equal(Number(v.toFixed(c.decimals ?? 0)), c.value, `${c.id} drifted`);
  }
});

test('formatValue formats int and x1', () => {
  assert.equal(formatValue(1189.2, 'int'), '1,189');
  assert.equal(formatValue(1.626, 'x1'), '1.6x');
});

test('derived claims carry a format and display === formatValue(value, format)', () => {
  for (const c of Object.values(claims)) {
    if (!c.derived) continue;
    assert.ok(c.format, `${c.id}: no format`);
    assert.equal(c.display, formatValue(c.value, c.format), `${c.id} display`);
  }
});

test('six lever evidence entries exist, ungraded Benchmark never, no company names', () => {
  for (let n = 1; n <= 6; n++) {
    const e = assumptions[`asm-lever-0${n}-evidence`];
    assert.ok(e, `lever ${n}`);
    assert.equal(e.kind, 'evidence');
    assert.notEqual(e.grade, 'Benchmark');
    assert.notEqual(e.display, e.basis, `lever ${n}: Value repeats Basis`);
    assert.ok(e.display.split(' ').length <= 6, `lever ${n}: Value is not short`);
    assert.ok(!/gradial|airops|profound|optimizely|klarna|unilever/i.test(e.display + e.basis));
  }
});

// gartner-share-2026 grade is Benchmark: 01-02-SUMMARY.md records gartner_2026_grade: Benchmark
// (user confirmed the primary Gartner newsroom page on 2026-10-24).
test('gartner-share-2026 grade matches the 01-02 browser check', () => {
  assert.equal(claims['gartner-share-2026'].grade, 'Benchmark');
  assert.equal(claims['gartner-share-2026'].flag, null);
  assert.ok(sources['gartner-2026-cmo-spend']);
});

test('s02 derived claims carry the expected displays', () => {
  const want = {
    'cpa-base': '$64.71', 'cpa-scaled': '$41.18', 'cpa-change': '\u221236%',
    'total-cost-base': '$2.59M', 'total-cost-scaled': '$3.29M',
    'budget-share-base': '3.3%', 'budget-share-scaled': '4.2%',
    'ai-spend-base': '$38,421', 'ai-spend-scaled': '$340,421', 'ai-spend-ratio': '8.9x',
    'break-even-auto-approval': '41%',
  };
  for (const [id, d] of Object.entries(want)) assert.equal(claims[id].display, d, id);
});

test('new format kinds', () => {
  assert.equal(formatValue(38421.4, 'usd0'), '$38,421');
  assert.equal(formatValue(64.714, 'usd2'), '$64.71');
  assert.equal(formatValue(2590000, 'usdm2'), '$2.59M');
  assert.equal(formatValue(0.41, 'pct0'), '41%');
  assert.equal(formatValue(0.033, 'pct1'), '3.3%');
  assert.equal(formatValue(-0.36, 'pctchg0'), '\u221236%');
  assert.equal(formatValue(0.2, 'pctchg0'), '+20%');
});

test('every model assumption is Modelled', () => {
  for (const e of Object.values(assumptions)) if (e.kind === 'model') assert.equal(e.grade, 'Modelled', e.id);
});

test('negative values put a true minus sign before the currency symbol', () => {
  assert.equal(formatValue(-1, 'usd2'), '\u2212$1.00');
  assert.equal(formatValue(-38421.4, 'usd0'), '\u2212$38,421');
  assert.equal(formatValue(-710000, 'usdm2'), '\u2212$0.71M');
  assert.equal(formatValue(-0.033, 'pct1'), '\u22123.3%');
  assert.equal(formatValue(-1189.2, 'int'), '\u22121,189');
  assert.equal(formatValue(-0.001, 'usd2'), '$0.00');
  assert.equal(formatValue(-0, 'int'), '0');
});

// ---- Plan 02-03: worked variant matrix ----

const GOLDEN_F = [
  { id: 'sizes', count: 10, applies: 1 },
  { id: 'channels', count: 5, applies: 0.75 },
  { id: 'locales', count: 6, applies: 0.4 },
  { id: 'audiences', count: 5, applies: 0.75 },
  { id: 'tests', count: 4, applies: 0.5 },
  { id: 'feeds', count: 4, applies: 0.5 },
];

test('variantMatrixDefaults is four concepts and the golden factor set', () => {
  assert.equal(variantMatrixDefaults.concepts, 4);
  assert.deepEqual(variantMatrixDefaults.factors.map(({ id, count, applies }) => ({ id, count, applies })), GOLDEN_F);
});

test('matrix claims equal variantMatrix()', () => {
  const r = variantMatrix(variantMatrixDefaults.concepts, variantMatrixDefaults.factors);
  assert.equal(r.ok, true);
  const mc = Object.values(claims).filter((c) => c.matrix);
  assert.ok(mc.length >= 20);
  for (const c of mc) {
    const { row, field } = c.matrix;
    const expected = field === 'concepts' ? r.concepts : field === 'total' ? r.total : field === 'per_concept' ? r.per_concept
      : r.rows.find((x) => x.id === row)[field];
    assert.ok(Math.abs(c.value - expected) <= 1e-9, `${c.id} drifted`);
    assert.equal(c.display, formatValue(c.value, c.format), `${c.id} display`);
    assert.equal(c.grade, 'Modelled');
    assert.equal(c.flag, null);
    const ref = field === 'concepts' ? 'asm-matrix-concepts' : (field === 'total' || field === 'per_concept') ? 'asm-matrix-independence' : `asm-matrix-${row}`;
    assert.equal(c.ref, ref, `${c.id} ref`);
  }
});

test('matrix assumptions exist as kind matrix, Modelled', () => {
  for (const k of ['concepts', 'sizes', 'channels', 'locales', 'audiences', 'tests', 'feeds', 'independence']) {
    const e = assumptions[`asm-matrix-${k}`];
    assert.ok(e, k);
    assert.equal(e.kind, 'matrix');
    assert.equal(e.grade, 'Modelled');
  }
});

test('avg-campaign-variants equals the model average campaign', () => {
  const r = compute(defaultInputs(), defaultAssumptions());
  const c = claims['avg-campaign-variants'];
  assert.equal(c.value, r.baseline.variants_per_year / defaultInputs().campaigns_per_year);
  assert.equal(c.display, '1,000');
  assert.equal(c.ref, 'asm-campaigns');
});

test('formatValue applies', () => {
  assert.equal(formatValue(1, 'applies'), 'all');
  assert.equal(formatValue(0.75, 'applies'), '75%');
  assert.equal(formatValue(0.4, 'applies'), '40%');
});

// ---- Plan 02-04: imagery sourcing and NYU/Emory ----

// The user confirmed both figures on the SSRN primary page on 2026-10-24 (02-CONTEXT post-research decisions).
test('NYU/Emory grade matches the 2026-10-24 browser confirmation (02-CONTEXT post-research decisions)', () => {
  const want = { 'nyu-ctr-lift': [0.19, '19%'], 'nyu-disclosure-drop': [-0.315, '\u221231.5%'] };
  for (const [id, [value, display]] of Object.entries(want)) {
    const c = claims[id];
    assert.ok(c, id);
    assert.equal(c.value, value);
    assert.equal(c.display, display);
    assert.equal(c.grade, 'Benchmark');
    assert.equal(c.flag, null);
    assert.equal(c.ref, 'src-nyu-emory-ai-ads-2025');
  }
  assert.ok(sources['nyu-emory-ai-ads-2025'].read_via.includes('confirmed in a browser by the author'));
});

test('new sources are complete', () => {
  for (const k of ['nyu-emory-ai-ads-2025', 'usco-copyright-ai-part2', 'getty-v-stability-uk']) {
    const s = sources[k];
    assert.ok(s, k);
    for (const f of ['title', 'publisher', 'published', 'accessed', 'url', 'bias', 'read_via']) {
      assert.equal(typeof s[f], 'string', `${k}.${f}`);
      assert.ok(s[f].length > 0, `${k}.${f} empty`);
    }
    assert.match(s.url, /^https:\/\//);
    assert.equal(s.accessed, '2026-10-24');
  }
  const g = sources['getty-v-stability-uk'];
  assert.ok(g.title.includes('2025-11-04') || g.bias.includes('2025-11-04'));
});

test('imagery assumptions', () => {
  for (const id of ['asm-imagery-routes', 'asm-imagery-indemnity']) {
    const e = assumptions[id];
    assert.ok(e, id);
    assert.equal(e.kind, 'evidence');
    assert.equal(e.grade, 'Modelled');
    assert.notEqual(e.display, e.basis);
  }
});

// ---- Plan 02-05: tiers and the reference datum ----

test('tier defaults equal the calc tier mix', () => {
  for (let i = 0; i < 4; i++) {
    const c = claims[`tier-default-t${i}`];
    const v = assumptions['asm-tier-mix'].value.scaled[i];
    assert.ok(c, `tier-default-t${i}`);
    assert.equal(c.value, v);
    assert.equal(c.format, 'pct0');
    assert.equal(c.display, formatValue(v, 'pct0'));
    assert.equal(c.ref, `asm-tier-range-t${i}`);
    const r = assumptions[`asm-tier-range-t${i}`];
    assert.ok(r, `asm-tier-range-t${i}`);
    assert.equal(r.kind, 'evidence');
    assert.equal(r.grade, 'Modelled');
    assert.ok(r.value.lo <= v && v <= r.value.hi, `T${i} default inside range`);
    assert.equal(r.display, `${Math.round(r.value.lo * 100)}\u2013${Math.round(r.value.hi * 100)}%`);
  }
});

test('eligibility arithmetic', () => {
  const s = assumptions['asm-tier-mix'].value.scaled;
  const e = claims['tier-eligible-share-scaled'];
  const a = claims['auto-share-of-eligible'];
  assert.ok(Math.abs(e.value - (s[0] + s[1])) < 1e-9);
  assert.equal(a.value, Number((assumptions['asm-auto-approval'].value.scaled / 0.85).toFixed(2)));
  for (const c of [e, a]) {
    assert.equal(c.display, formatValue(c.value, 'pct0'));
    assert.equal(c.ref, 'asm-auto-approval');
    assert.equal(c.grade, 'Modelled');
  }
  assert.equal(e.display, '85%');
  assert.equal(a.display, '71%');
});

test('reference datum is Modelled and company-reported', () => {
  const want = { 'ref-auto-approved-share': [0.192, '19.2%'], 'ref-bot-approval-rate': [0.284, '28.4%'] };
  for (const [id, [value, display]] of Object.entries(want)) {
    const c = claims[id];
    assert.ok(c, id);
    assert.equal(c.value, value);
    assert.equal(c.display, display);
    assert.equal(c.grade, 'Modelled');
    assert.equal(c.flag, 'company-reported');
    assert.equal(c.ref, 'src-intercom-2x-teardown');
  }
  assert.equal(sources['intercom-2x-teardown'].url, 'https://lyonsv.github.io/intercom-2x-teardown/');
  assert.ok(assumptions['asm-review-agent-design']);
});

// ---- Plan 02-06: reviewer capacity claims, fatigue, harness and telemetry ----

test('capacity claims recompute under their own scenario', () => {
  // Test-local scenario and provenance table, deliberately not imported from data.js.
  // [multiplier, auto-approval share, ref, flag] (code review WR-01: each claim
  // refs the register row that explains it).
  const SCENARIOS = {
    'cap-1x-nogate': [1, 0, 'asm-auto-approval', null], 'cap-1x-gate': [1, 0.2, 'asm-auto-approval', null],
    'cap-2x-nogate': [2, 0, 'asm-auto-approval', null], 'cap-2x-gate': [2, 0.6, 'asm-auto-approval', null],
    'cap-1x-variants': [1, 0.2, 'asm-variants-per-concept', null], 'cap-2x-variants': [2, 0.6, 'asm-variants-per-concept', null],
    'cap-2x-ref-low': [2, 0.192, 'src-intercom-2x-teardown', 'company-reported'],
    'cap-2x-ref-high': [2, 0.284, 'src-intercom-2x-teardown', 'company-reported'],
    'cap-capacity-hours': [1, 0.2, 'asm-reviewer-hours', null],
  };
  const over = Object.values(claims).filter((c) => c.override);
  assert.ok(over.length >= 13, `only ${over.length} override claims`);
  for (const c of over) {
    const key = Object.keys(SCENARIOS).find((k) => c.id === k || c.id.startsWith(`${k}-`));
    assert.ok(key, `${c.id}: no scenario`);
    const [m, s, ref, flag] = SCENARIOS[key];
    assert.deepEqual(c.override, { multiplier: m, auto_approval_share: s }, `${c.id} override`);
    const a = { ...defaultAssumptions(), auto_approval_share: { baseline: s, scaled: s } };
    const r = compute({ ...defaultInputs(), multiplier: m }, a);
    assert.equal(r.ok, true);
    const v = c.derived.split('.').reduce((o, k) => o[k], r);
    assert.equal(Number(v.toFixed(c.decimals)), c.value, `${c.id} drifted`);
    assert.equal(c.display, formatValue(c.value, c.format), `${c.id} display`);
    assert.equal(c.grade, 'Modelled');
    assert.equal(c.flag, flag, `${c.id} flag`);
    assert.equal(c.ref, ref, `${c.id} ref`);
  }
  const pin = {
    'cap-2x-nogate-util': '134.5%', 'cap-2x-gate-util': '61.9%', 'cap-2x-ref-low-util': '111.3%',
    'cap-2x-ref-high-util': '100.1%', 'cap-2x-nogate-hours': '16,842', 'cap-capacity-hours': '14,400',
    'cap-1x-variants': '40,000', 'cap-2x-variants': '80,000',
  };
  for (const [id, d] of Object.entries(pin)) assert.equal(claims[id]?.display, d, id);
  for (const row of ['1x-nogate', '1x-gate', '2x-nogate', '2x-gate']) {
    for (const f of ['hours', 'util']) assert.ok(claims[`cap-${row}-${f}`], `cap-${row}-${f}`);
  }
  // IN-05: the reference-rate scenarios use the reference claims themselves
  assert.equal(claims['cap-2x-ref-low-util'].override.auto_approval_share, claims['ref-auto-approved-share'].value);
  assert.equal(claims['cap-2x-ref-high-util'].override.auto_approval_share, claims['ref-bot-approval-rate'].value);
  // capacity is reviewer headcount times review hours per reviewer
  assert.equal(claims['cap-capacity-hours'].value, assumptions['asm-reviewer-fte'].value * assumptions['asm-reviewer-hours'].value);
});

test('evidence assumptions for fatigue, harness and telemetry', () => {
  const want = { 'asm-fatigue-controls': 'Speculative', 'asm-harness-design': 'Modelled', 'asm-telemetry-metrics': 'Modelled' };
  for (const [id, grade] of Object.entries(want)) {
    const e = assumptions[id];
    assert.ok(e, id);
    assert.equal(e.kind, 'evidence');
    assert.equal(e.grade, grade);
    assert.notEqual(e.display, e.basis);
  }
});

// ---- Code review CR-02: matrix total is derived (pre-gate); approved-live applies the yield ----

test('matrix total is labelled derived and matrix-approved applies the approval yield', () => {
  const r = variantMatrix(variantMatrixDefaults.concepts, variantMatrixDefaults.factors);
  for (const id of ['matrix-total', 'matrix-per-concept']) {
    assert.ok(/derived/.test(claims[id].unit) && !/approved-live/.test(claims[id].unit), `${id} unit`);
  }
  const c = claims['matrix-approved'];
  assert.ok(Math.abs(c.value - r.total * assumptions['asm-approval-yield'].value) <= 1e-9);
  assert.equal(c.display, '11,400');
  assert.equal(c.ref, 'asm-approval-yield');
  assert.equal(c.grade, 'Modelled');
  assert.ok(c.value < r.total);
});

// ---- Code review WR-07: sources carry their own grade and flag ----

test('every source has a valid grade and flag, and claims citing a source share its grade', () => {
  for (const [k, src] of Object.entries(sources)) {
    assert.ok(GRADES.includes(src.grade), `${k}: grade`);
    assert.ok(src.flag === null || FLAGS.includes(src.flag), `${k}: flag`);
    if (src.grade === 'Benchmark') assert.equal(src.flag, null, `${k}: flagged Benchmark source`);
  }
  for (const c of Object.values(claims).filter((x) => x.ref.startsWith('src-'))) {
    const src = sources[c.ref.slice(4)];
    assert.equal(c.grade, src.grade, `${c.id}: grade differs from its source row`);
    if (src.flag) assert.equal(c.flag, src.flag, `${c.id}: source flag ${src.flag} missing`);
  }
});

// ---- Code review IN-08: percentages are stored as fractions ----

test('percentage claims store fractions and display through their format', () => {
  for (const c of Object.values(claims)) {
    if (/%/.test(c.display) && !/^\d+\u2013\d+%$/.test(c.display)) {
      assert.ok(Math.abs(c.value) <= 2, `${c.id}: ${c.value} looks like a percent, not a fraction`);
      if (c.format) assert.equal(formatValue(c.value, c.format), c.display, `${c.id} display`);
    }
  }
  assert.equal(assumptions['asm-budget-share'].value, claims['gartner-share-2026'].value);
});

test('Plan 03-01 localisation sources and claims', () => {
  for (const k of ['laubli-2019', 'translation-vendor-case']) {
    const s = sources[k];
    assert.ok(s, k);
    for (const f of ['title', 'publisher', 'published', 'accessed', 'url', 'bias', 'read_via']) {
      assert.equal(typeof s[f], 'string', `${k}.${f}`);
      assert.ok(s[f].length > 0, `${k}.${f} empty`);
    }
    assert.equal(s.accessed, '2026-10-24');
    assert.equal(s.grade, 'Modelled');
  }
  assert.equal(sources['laubli-2019'].url, 'https://arxiv.org/abs/1906.01685');
  assert.equal(sources['laubli-2019'].flag, null);
  assert.equal(sources['translation-vendor-case'].flag, 'vendor-claimed');
  const want = [
    ['mt-speed-lo', 0.0926, '9.26%', 'src-laubli-2019', null],
    ['mt-speed-hi', 0.5974, '59.74%', 'src-laubli-2019', null],
    ['loc-case-saving', 3400000, '$3.4M', 'src-translation-vendor-case', 'vendor-claimed'],
    ['loc-case-faster', 0.5, '50%', 'src-translation-vendor-case', 'vendor-claimed'],
  ];
  for (const [id, value, display, ref, flag] of want) {
    const c = claims[id];
    assert.ok(c, id);
    assert.equal(c.value, value); assert.equal(c.display, display);
    assert.equal(c.ref, ref); assert.equal(c.grade, 'Modelled'); assert.equal(c.flag, flag);
  }
});

test('Plan 03-02 experimentation sources, claims and assumption', () => {
  const want = {
    'experimentation-vendor-playbook': ['https://www.optimizely.com/insights/top-10-takeaways-from-the-experimentation-playbook/', 'vendor-claimed'],
    'kohavi-2013': ['https://exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf', 'company-reported'],
  };
  for (const [k, [url, flag]] of Object.entries(want)) {
    const s = sources[k];
    assert.ok(s, k);
    for (const f of ['title', 'publisher', 'published', 'accessed', 'url', 'bias', 'read_via']) {
      assert.equal(typeof s[f], 'string', `${k}.${f}`);
      assert.ok(s[f].length > 0, `${k}.${f} empty`);
    }
    assert.equal(s.accessed, '2026-10-24');
    assert.equal(s.grade, 'Modelled');
    assert.equal(s.url, url);
    assert.equal(s.flag, flag);
  }
  const claimWant = [
    ['winrate-vendor', 0.12, '12%', 'src-experimentation-vendor-playbook', 'vendor-claimed'],
    ['winrate-vendor-n', 127000, '127,000', 'src-experimentation-vendor-playbook', 'vendor-claimed'],
    ['winrate-paper', 0.33, '33%', 'src-kohavi-2013', 'company-reported'],
    ['winrate-second-hand', 0.10, '10%', 'src-kohavi-2013', 'company-reported'],
    ['tests-winners-lo', Math.round(20 * 0.10), String(Math.round(20 * 0.10)), 'asm-tests-per-quarter', null],
    ['tests-winners-hi', Math.round(20 * 0.33), String(Math.round(20 * 0.33)), 'asm-tests-per-quarter', null],
  ];
  for (const [id, value, display, ref, flag] of claimWant) {
    const c = claims[id];
    assert.ok(c, id);
    assert.equal(c.value, value); assert.equal(c.display, display);
    assert.equal(c.ref, ref); assert.equal(c.grade, 'Modelled'); assert.equal(c.flag, flag);
  }
  const t = assumptions['asm-tests-per-quarter'];
  assert.ok(t);
  assert.equal(t.value, 20); assert.equal(t.display, '20'); assert.equal(t.grade, 'Modelled');
  assert.ok(['evidence', 'context'].includes(t.kind));
});

test('Plan 03-02 insight source', () => {
  const s = sources['mmm-geox'];
  assert.ok(s);
  for (const f of ['title', 'publisher', 'published', 'accessed', 'url', 'bias', 'read_via']) assert.ok(s[f] && s[f].length > 0, f);
  assert.equal(s.url, 'https://developers.google.com/meridian/geox');
  assert.equal(s.grade, 'Modelled'); assert.equal(s.flag, null); assert.equal(s.accessed, '2026-10-24');
  assert.ok(/calibration guide/.test(s.read_via) && /not opened/.test(s.read_via));
});

test('Plan 03-03 statute sources, claims, incident assumption and ops claims', () => {
  for (const [k, url] of [['cornell-17usc504', 'https://www.law.cornell.edu/uscode/text/17/504'], ['cornell-17usc412', 'https://www.law.cornell.edu/uscode/text/17/412']]) {
    const s = sources[k];
    assert.ok(s, k);
    for (const f of ['title', 'publisher', 'published', 'accessed', 'url', 'bias', 'read_via']) assert.ok(typeof s[f] === 'string' && s[f].length > 0, `${k}.${f}`);
    assert.equal(s.url, url); assert.equal(s.grade, 'Benchmark'); assert.equal(s.flag, null); assert.equal(s.accessed, '2026-10-24');
  }
  for (const [id, value, display] of [['stat-ordinary-min', 750, '$750'], ['stat-ordinary-max', 30000, '$30,000'], ['stat-innocent-min', 200, '$200'], ['stat-wilful-max', 150000, '$150,000']]) {
    const c = claims[id];
    assert.ok(c, id);
    assert.equal(c.value, value); assert.equal(c.display, display); assert.equal(c.grade, 'Benchmark');
    assert.equal(c.flag, null); assert.equal(c.ref, 'src-cornell-17usc504');
  }
  const a = assumptions['asm-incident-rate'];
  assert.equal(a.grade, 'Speculative'); assert.equal(a.value, 0.001); assert.equal(a.display, '1 in 1,000 master concepts');
  assert.ok(a.basis.includes('Treat this rate as yours to replace'));
  const inc = claims['concepts-scaled'].value * 0.001;
  const want = { 'ops-incidents': [inc, '1.2'], 'ops-exposure-lo': [inc * 750, formatValue(inc * 750, 'usd0')], 'ops-exposure-hi': [inc * 30000, formatValue(inc * 30000, 'usd0')], 'ops-exposure-wilful': [inc * 150000, formatValue(inc * 150000, 'usd0')] };
  for (const [id, [value, display]] of Object.entries(want)) {
    const c = claims[id];
    assert.ok(Math.abs(c.value - value) < 1e-9, id);
    assert.equal(c.display, display); assert.equal(c.grade, 'Speculative'); assert.equal(c.ref, 'asm-incident-rate');
  }
});

test('formatValue num1 gives one decimal', () => {
  assert.equal(formatValue(1.189, 'num1'), '1.2');
  assert.equal(formatValue(12, 'num1'), '12.0');
});

test('Plan 03-03 answer-engine sources and claims', () => {
  const want = {
    'haynes-2026': 'https://www.mariehaynes.com/geo-is-a-distraction/',
    'seoworks-2026': 'https://www.seoworks.co.uk/downloads/ai-referral-traffic-benchmark/',
    'indig-2026': 'https://www.growth-memo.com/p/does-ai-drive-more-direct-traffic',
    'aggarwal-geo-2024': 'https://arxiv.org/abs/2311.09735',
  };
  for (const [k, url] of Object.entries(want)) {
    const s = sources[k];
    assert.ok(s, k);
    for (const f of ['title', 'publisher', 'published', 'accessed', 'url', 'bias', 'read_via']) assert.ok(typeof s[f] === 'string' && s[f].length > 0, `${k}.${f}`);
    assert.equal(s.url, url); assert.equal(s.grade, 'Modelled'); assert.equal(s.flag, null);
  }
  const cw = [['aeo-chatgpt-share', 0.0062, '0.62%', 'src-haynes-2026'], ['aeo-llm-share', 0.0073, '0.73%', 'src-haynes-2026'],
    ['aeo-organic-multiple', 39, '39 times', 'src-seoworks-2026'], ['aeo-ai-share-organic', 0.026, '2.6%', 'src-seoworks-2026'],
    ['aeo-hidden-direct', 0.00003, '0.003%', 'src-indig-2026'], ['aeo-geo-bench', 0.40, '40%', 'src-aggarwal-geo-2024']];
  for (const [id, value, display, ref] of cw) {
    const c = claims[id];
    assert.ok(c, id);
    assert.equal(c.value, value); assert.equal(c.display, display); assert.equal(c.ref, ref); assert.equal(c.grade, 'Modelled');
  }
  assert.ok(assumptions['asm-lever-06-evidence'].basis.includes('visibility has not been shown to move pipeline'));
  assert.equal(assumptions['asm-lever-06-evidence'].grade, 'Speculative');
});
