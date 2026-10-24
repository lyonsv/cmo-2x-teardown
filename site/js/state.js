// Calculator input state: strict text coercion, cross-field validation and the
// URL hash contract. Pure and DOM-free; imports only fields.js and model.js.
import { FIELDS, SCENARIOS } from './fields.js';
import { defaultValues, run } from './model.js';

const PLAIN = /^\d+(\.\d+)?$/;
const THOUSANDS = /^\d{1,3}(,\d{3})+(\.\d+)?$/;
const MAX = 1e9;
const HASH_PREFIX = '#s11?';
const SCENARIO_LABEL = 'Headcount scenario';

const whole = (v) => Number((v * 100).toPrecision(12));

export function coerce(field, text) {
  const label = field.label;
  const raw = String(text ?? '').trim();
  if (raw === '') return { ok: false, message: `${label}: enter a number.` };
  const bad = { ok: false, message: `${label}: use digits only, for example ${field.example}.` };
  const rule = { ok: false, message: `${label}: enter ${field.rule}.` };
  const body = field.kind === 'pct' && raw.endsWith('%') ? raw.slice(0, -1) : raw;
  if (!PLAIN.test(body) && !THOUSANDS.test(body)) return bad;
  const n = Number(body.replaceAll(',', ''));
  if (!Number.isFinite(n) || n > MAX) return rule;
  if (field.kind === 'int' && !Number.isInteger(n)) return rule;
  if (n === 0 && !field.zeroOk) return rule;
  const v = field.kind === 'pct' ? Number((n / 100).toPrecision(12)) : n;
  if (v > 1 && field.kind === 'pct') return rule;
  // A value the share link cannot write back exactly (for example 1e-22, which
  // prints as 0) would not restore, so it is rejected here (IN-01).
  if (!sameAfterText(field, v)) return { ok: false, message: `${label}: use fewer decimal places.` };
  return { ok: true, value: v };
}

function sameAfterText(field, v) {
  const n = Number(toText(field, v));
  return (field.kind === 'pct' ? Number((n / 100).toPrecision(12)) : n) === v;
}

function capMessage(label, cap, when) {
  return `${label}: cannot exceed ${whole(cap)}%, the share of assets that can clear without a person (T0 and T1)${when}.`;
}

export function validate(values, ctx) {
  const errors = [];
  const mix = ctx.assumptions.tier_mix;
  const cap1 = mix.baseline[0] + mix.baseline[1];
  const cap2 = mix.scaled[0] + mix.scaled[1];
  if (values.auto1 > cap1 + 1e-9) {
    errors.push({ key: 'auto1', message: 'Auto-approval share today: cannot exceed ' + `${whole(cap1)}%, the share of assets that can clear without a person (T0 and T1).` });
  }
  if (values.auto2 > cap2 + 1e-9) {
    errors.push({ key: 'auto2', message: capMessage('Auto-approval share at 2x', cap2, '') });
  }
  if (errors.length > 0) return errors;
  const out = run(values, ctx);
  if (!out.ok) {
    for (const e of out.errors) {
      errors.push(e.key === null ? { key: null, message: 'These inputs are too large to calculate.' } : { key: e.key, message: e.message });
    }
  }
  return errors;
}

export function toText(field, value) {
  const v = field.kind === 'pct' ? whole(value) : value;
  return v.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 });
}

export function parseHash(hash, ctx) {
  const values = defaultValues(ctx);
  const notices = [];
  if (typeof hash !== 'string' || !hash.startsWith(HASH_PREFIX)) return { values, notices, restored: false };
  const params = new URLSearchParams(hash.slice(HASH_PREFIX.length));
  for (const field of FIELDS) {
    const raw = params.get(field.key);
    if (raw === null) continue;
    const r = coerce(field, raw);
    if (r.ok) values[field.key] = r.value;
    else notices.push(field.label);
  }
  const sc = params.get('scenario');
  if (sc !== null) {
    if (SCENARIOS.includes(sc)) values.scenario = sc;
    else notices.push(SCENARIO_LABEL);
  }
  return { values, notices, restored: true };
}

export function serialiseHash(values, ctx) {
  const defaults = defaultValues(ctx);
  const parts = [];
  for (const field of FIELDS) {
    if (!Object.is(values[field.key], defaults[field.key])) parts.push(`${field.key}=${toText(field, values[field.key])}`);
  }
  if (values.scenario !== defaults.scenario) parts.push(`scenario=${values.scenario}`);
  return parts.length === 0 ? '' : HASH_PREFIX + parts.join('&');
}

export function changedCount(values, ctx) {
  const defaults = defaultValues(ctx);
  let n = FIELDS.filter((f) => !Object.is(values[f.key], defaults[f.key])).length;
  if (values.scenario !== defaults.scenario) n += 1;
  return n;
}
