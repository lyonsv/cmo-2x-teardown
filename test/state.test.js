import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { modelContext } from '../site/js/data.js';
import { FIELDS, ROUTES, SCENARIOS } from '../site/js/fields.js';
import { present, defaultValues } from '../site/js/model.js';
import { coerce, validate, parseHash, serialiseHash, toText, changedCount } from '../site/js/state.js';

const ctx = modelContext();
const F = Object.fromEntries(FIELDS.map((f) => [f.key, f]));
const defaults = defaultValues(ctx);

test('coerce accepts plain, thousands and percent text', () => {
  assert.deepEqual(coerce(F.campaigns, '40'), { ok: true, value: 40 });
  assert.deepEqual(coerce(F.campaigns, ' 1,200 '), { ok: true, value: 1200 });
  assert.deepEqual(coerce(F.yield, '85%'), { ok: true, value: 0.85 });
  assert.deepEqual(coerce(F.yield, '7'), { ok: true, value: 0.07 });
  assert.deepEqual(coerce(F.rework, '0'), { ok: true, value: 0 });
  assert.deepEqual(coerce(F.auto1, '0'), { ok: true, value: 0 });
  assert.deepEqual(coerce(F.vcost, '0.80'), { ok: true, value: 0.8 });
  // IN-10: a leading $ in a $ field and a bare leading decimal point are accepted.
  assert.deepEqual(coerce(F.vcost, '$0.80'), { ok: true, value: 0.8 });
  assert.deepEqual(coerce(F.mconcept, '$1,200'), { ok: true, value: 1200 });
  assert.deepEqual(coerce(F.vcost, '.5'), { ok: true, value: 0.5 });
  assert.deepEqual(coerce(F.yield, '.5%'), { ok: true, value: 0.005 });
  assert.equal(coerce(F.minutes, '$12').ok, false, '$ only in $ fields');
  for (const t of ['$', '$$1', '.', '1.', '$-1', '.5.5']) assert.equal(coerce(F.vcost, t).ok, false, t);
});

test('coerce messages follow the copy templates', () => {
  assert.equal(coerce(F.campaigns, '').message, 'Campaigns per year: enter a number.');
  assert.equal(coerce(F.campaigns, '   ').message, 'Campaigns per year: enter a number.');
  const fmt = 'Campaigns per year: use digits only, for example 40.';
  for (const t of ['abc', '1e3', '0x10', 'NaN', 'Infinity', '-3', '1,5', '1 000', '1e999', '%', '--1']) {
    assert.deepEqual(coerce(F.campaigns, t), { ok: false, message: fmt }, t);
  }
  const rule = 'Campaigns per year: enter a whole number of 1 or more.';
  assert.equal(coerce(F.campaigns, '0').message, rule);
  assert.equal(coerce(F.campaigns, '2.5').message, rule);
  assert.equal(coerce(F.campaigns, '1000000001').message, rule);
  assert.equal(coerce(F.yield, '101').message, 'Approval yield: enter a percentage above 0 and up to 100.');
  assert.equal(coerce(F.yield, '0').message, 'Approval yield: enter a percentage above 0 and up to 100.');
  assert.equal(coerce(F.marketers, '0').message, 'Marketing FTE: enter a number above 0.');
});

test('coerce rejects values the share link cannot write back exactly (IN-01)', () => {
  const minutes = FIELDS.find((f) => f.key === 'minutes');
  assert.deepEqual(coerce(minutes, '0.0000000000000000000001'), { ok: false, message: 'Minutes per review: use fewer decimal places.' });
  for (const f of FIELDS) {
    for (const t of ['1', '0.5', '12.25', '0.00000001', '1,200.5']) {
      const r = coerce(f, t);
      if (!r.ok) continue;
      const back = parseHash(`#s11?${f.key}=${toText(f, r.value)}`, ctx);
      assert.deepEqual(back.notices, [], `${f.key}=${t} restores`);
      assert.equal(back.values[f.key], r.value, `${f.key}=${t} round-trips`);
    }
  }
});

test('validate: cross-field caps and clean defaults', () => {
  assert.deepEqual(validate(defaults, ctx), []);
  const hi2 = validate({ ...defaults, auto2: 0.9 }, ctx);
  assert.equal(hi2.length, 1);
  assert.equal(hi2[0].key, 'auto2');
  assert.match(hi2[0].message, /^Auto-approval share at 2x: cannot exceed 85%, the share of assets that can clear without a person \(T0 and T1\)\.$/);
  const hi1 = validate({ ...defaults, auto1: 0.8 }, ctx);
  assert.equal(hi1[0].key, 'auto1');
  assert.match(hi1[0].message, /cannot exceed 75%/);
  assert.equal(hi1[0].message, 'Auto-approval share today: cannot exceed 75%, the share of assets that can clear without a person (T0 and T1).');
});

test('validate: overflow becomes a key-null message', () => {
  // Reader inputs are capped at 1e9, so at the shipped assumptions even every
  // volume at its limit still computes. The overflow branch is defensive; it is
  // driven here with a context whose capacity is so small utilisation is Infinity.
  assert.deepEqual(validate({ ...defaults, campaigns: 1e9, concepts: 1e9, markets: 1e9 }, ctx), []);
  const big = { ...ctx, assumptions: { ...ctx.assumptions, reviewer_hours_per_fte_year: Number.MIN_VALUE } };
  assert.deepEqual(validate(defaults, big), [{ key: null, message: 'These inputs are too large to calculate.' }]);
});

test('parseHash: non-calculator hashes give defaults and restored false', () => {
  for (const h of ['', '#s11', '#src-gartner-2025-cmo-spend', '#s10?markets=3', undefined]) {
    const r = parseHash(h, ctx);
    assert.deepEqual(r.values, defaults);
    assert.equal(r.restored, false);
    assert.deepEqual(r.notices, []);
  }
});

test('parseHash: restores valid values and reports invalid ones by label', () => {
  const ok = parseHash('#s11?markets=6&auto2=70', ctx);
  assert.equal(ok.values.markets, 6);
  assert.equal(ok.values.auto2, 0.7);
  assert.equal(ok.restored, true);
  assert.deepEqual(ok.notices, []);
  const bad = parseHash('#s11?markets=abc', ctx);
  assert.equal(bad.values.markets, defaults.markets);
  assert.deepEqual(bad.notices, ['Markets per campaign']);
  assert.deepEqual(parseHash('#s11?reviewers=0', ctx).notices, ['Reviewer FTE']);
  assert.equal(parseHash('#s11?markets=6&markets=9', ctx).values.markets, 6);
  assert.equal(parseHash('#s11?scenario=hold', ctx).values.scenario, 'b');
  assert.equal(parseHash('#s11?scenario=redeploy', ctx).values.scenario, 'a');
  assert.equal(parseHash('#s11?scenario=reduce', ctx).values.scenario, 'b');
  assert.equal(parseHash('#s11?scenario=c', ctx).values.scenario, 'c');
  assert.equal(parseHash('#s11?scenario=toString', ctx).values.scenario, 'c');
  const evil = parseHash('#s11?scenario=evil', ctx);
  assert.equal(evil.values.scenario, defaults.scenario);
  assert.deepEqual(evil.notices, ['Scenario']);
});

test('parseHash: route restores only from the allow-list (T-03.1-04, T-03.1-05)', () => {
  assert.equal(defaults.route, 'both');
  assert.equal(parseHash('#s11?route=markets', ctx).values.route, 'markets');
  assert.equal(parseHash('#s11?route=campaigns', ctx).values.route, 'campaigns');
  assert.deepEqual(parseHash('#s11?route=markets', ctx).notices, []);
  for (const t of ['evil', '__proto__', 'constructor', 'toString', '']) {
    const r = parseHash(`#s11?route=${t}`, ctx);
    assert.equal(r.values.route, 'both', t);
    assert.deepEqual(r.notices, ['How you get to 2x'], t);
  }
  assert.equal(parseHash('#s11?route=markets&route=campaigns', ctx).values.route, 'markets');
});

test('parseHash: hostile keys cannot pollute prototypes', () => {
  const before = Object.getOwnPropertyNames(Object.prototype).sort();
  const r = parseHash('#s11?__proto__=1&constructor=2&prototype=3&toString=4', ctx);
  assert.deepEqual(r.values, defaults);
  assert.deepEqual(Object.getOwnPropertyNames(Object.prototype).sort(), before);
  assert.equal({}.polluted, undefined);
  const r2 = parseHash('#s11?__proto__[polluted]=1&markets=4', ctx);
  assert.equal(r2.values.markets, 4);
  assert.equal({}.polluted, undefined);
});

test('serialiseHash: defaults give an empty string, order follows FIELDS', () => {
  assert.equal(serialiseHash(defaults, ctx), '');
  assert.equal(serialiseHash({ ...defaults, auto2: 0.7, markets: 6 }, ctx), '#s11?markets=6&auto2=70');
  assert.equal(serialiseHash({ ...defaults, scenario: 'b', markets: 6 }, ctx), '#s11?markets=6&scenario=b');
  assert.equal(serialiseHash({ ...defaults, route: 'campaigns' }, ctx), '#s11?route=campaigns');
  assert.equal(serialiseHash({ ...defaults, scenario: 'b', markets: 6, route: 'markets' }, ctx), '#s11?markets=6&route=markets&scenario=b');
  assert.equal(changedCount(defaults, ctx), 0);
  assert.equal(changedCount({ ...defaults, auto2: 0.7, markets: 6 }, ctx), 2);
  assert.equal(changedCount({ ...defaults, scenario: 'a' }, ctx), 1);
  assert.equal(changedCount({ ...defaults, route: 'markets' }, ctx), 1);
  assert.equal(changedCount({ ...defaults, route: 'markets', scenario: 'b', markets: 6 }, ctx), 3);
});

test('serialiseHash and changedCount never write or count a missing or unknown route or scenario (IN-01)', () => {
  const { route, scenario, ...bare } = defaults;
  assert.equal(serialiseHash(bare, ctx), '');
  assert.equal(changedCount(bare, ctx), 0);
  for (const v of [{ ...defaults, route: undefined }, { ...defaults, route: 'evil' }, { ...defaults, scenario: undefined }, { ...defaults, scenario: 'evil' }]) {
    assert.equal(serialiseHash(v, ctx), '', JSON.stringify(v));
    assert.equal(changedCount(v, ctx), 0);
  }
  assert.equal(serialiseHash({ ...bare, markets: 6 }, ctx), '#s11?markets=6');
  assert.ok(!/undefined/.test(serialiseHash({ ...bare, markets: 6 }, ctx)));
});

test('toText: whole percents, no separators, no exponent', () => {
  assert.equal(toText(F.yield, 0.95), '95');
  assert.equal(toText(F.mconcept, 1200), '1200');
  assert.equal(toText(F.vcost, 0.8), '0.8');
  assert.equal(toText(F.vcost, 1e-7), '0.0000001');
  for (const f of FIELDS) assert.ok(!/[,e]/i.test(toText(f, defaults[f.key])), f.key);
});

function rng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

test('round trip over 200 random valid value sets', () => {
  const r = rng(7);
  for (let i = 0; i < 200; i++) {
    const v = { scenario: SCENARIOS[Math.floor(r() * 3)], route: ROUTES[Math.floor(r() * 3)] };
    for (const f of FIELDS) {
      if (r() < 0.3) { v[f.key] = defaults[f.key]; continue; }
      if (f.kind === 'int') v[f.key] = 1 + Math.floor(r() * 500);
      else if (f.kind === 'pct') v[f.key] = (f.zeroOk ? Math.floor(r() * 101) : 1 + Math.floor(r() * 100)) / 100;
      else v[f.key] = Math.round((0.01 + r() * 300) * 100) / 100;
    }
    const hash = serialiseHash(v, ctx);
    const back = parseHash(hash, ctx);
    assert.deepEqual(back.values, v, hash);
    assert.deepEqual(back.notices, []);
  }
});

test('hostile text never reaches the presenter as NaN, Infinity or undefined', () => {
  for (const f of FIELDS) {
    for (const t of ['', 'abc', '1e999', '-3', '0', 'Infinity', 'NaN']) {
      const c = coerce(f, t);
      const values = { ...defaults, ...(c.ok ? { [f.key]: c.value } : {}) };
      const out = JSON.stringify([present(values, ctx), validate(values, ctx), c.ok ? '' : c.message]);
      assert.ok(!/NaN|Infinity|undefined|null/.test(out), `${f.key} ${JSON.stringify(t)}`);
      if (!c.ok) assert.ok(c.message.startsWith(`${f.label}: `));
    }
  }
});

test('state.js source avoids DOM, storage, network and dynamic code', () => {
  const src = readFileSync(new URL('../site/js/state.js', import.meta.url), 'utf8');
  for (const bad of ['innerHTML', 'localStorage', 'sessionStorage', 'document.cookie', 'fetch(', 'XMLHttpRequest', 'eval(', 'new Function']) {
    assert.ok(!src.includes(bad), bad);
  }
  assert.ok(!/params\[|params\.get\([^)]*\)\]/.test(src), 'no bracket assignment from URLSearchParams');
  for (const [, spec] of src.matchAll(/from '([^']+)'/g)) assert.ok(spec.startsWith('./'), spec);
});
