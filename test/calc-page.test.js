import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { modelContext, claims, assumptions } from '../site/js/data.js';
import { present, defaultValues, RESULT_ROWS } from '../site/js/model.js';
import { FIELDS } from '../site/js/fields.js';
import { toText } from '../site/js/state.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const start = html.indexOf('<section id="s11"');
const s11 = html.slice(start, html.indexOf('</section>', start));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const strip = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const ctx = modelContext();
const p = present(defaultValues(ctx), ctx);
const CHIP_CLASS = { Benchmark: 'c-b', Modelled: 'c-m', Speculative: 'c-s' };

test('s11 reads in order: lead, status, no-JS note, summary output, results table', () => {
  const idx = [
    s11.indexOf('Replace the defaults with your own numbers. The page recomputes cost per approved-live asset, reviewer load and the auto-approval share you would need.'),
    s11.indexOf('<p role="status" class="calc-status">Showing: page defaults</p>'),
    s11.indexOf('<p class="calc-nojs">The interactive calculator needs JavaScript. Below is the default scenario, calculated in advance from the same model.</p>'),
    s11.indexOf('<output id="calc-summary" aria-live="polite" aria-atomic="true">The table below shows the page defaults.</output>'),
    s11.indexOf('<caption>Results for your numbers (baseline and 2x)</caption>'),
  ];
  for (const i of idx) assert.ok(i >= 0, `missing element, positions ${idx}`);
  assert.deepEqual([...idx].sort((a, b) => a - b), idx, 'elements out of order');
  assert.ok(/<p><output id="calc-summary"/.test(s11), 'summary output sits in its own paragraph');
});

test('s11 has one live region and the table is not inside an output', () => {
  assert.equal((s11.match(/aria-live=/g) || []).length, 1);
  const out = s11.match(/<output[\s\S]*?<\/output>/g) || [];
  assert.equal(out.length, 1);
  assert.ok(!out[0].includes('<table'));
});

test('results table: head, nine rows in model order, cells equal present(defaults)', () => {
  const region = s11.match(/<div class="table-scroll"[^>]*aria-label="Calculator results"[^>]*>([\s\S]*?)<\/table>/);
  assert.ok(region, 'results region');
  assert.ok(/role="region"/.test(region[0]) && /tabindex="0"/.test(region[0]));
  const table = region[1];
  const head = [...table.match(/<thead>([\s\S]*?)<\/thead>/)[1].matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.deepEqual(head, ['Output', 'Baseline', '2x', 'Change', 'Grade']);
  const body = table.slice(table.indexOf('<tbody>'));
  const trs = body.match(/<tr>[\s\S]*?<\/tr>/g);
  assert.equal(trs.length, 9);
  trs.forEach((tr, i) => {
    const def = RESULT_ROWS[i];
    const row = p.rows[i];
    assert.equal(strip(tr.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]), def.label);
    const tds = [...tr.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/g)];
    assert.equal(tds.length, 4);
    ['base', 'scaled', 'change'].forEach((name, c) => {
      const node = row[name];
      const [, attrs, inner] = tds[c];
      if (node.value === undefined) {
        assert.equal(strip(inner), node.text);
        assert.ok(!attrs.includes('num'), `${def.id} ${name}: text cell must not be td.num`);
        assert.ok(!inner.includes('data-fig'));
      } else {
        assert.equal(attrs.trim(), 'class="num"', `${def.id} ${name}`);
        const fig = inner.match(new RegExp(`^<span data-fig="calc-${def.id}-${name}">([^<]*)</span>$`));
        assert.ok(fig, `${def.id} ${name}: cell is exactly one data-fig span`);
        assert.equal(decode(fig[1]), node.text);
        const claim = claims[`calc-${def.id}-${name}`];
        assert.equal(claim.display, node.text);
        assert.equal(claim.grade, row.grade);
        assert.equal(claim.ref, row.ref);
      }
    });
    const chip = tds[3][2].match(/^<a class="chip (c-[bms])" href="#([^"]+)">([^<]+)<\/a>$/);
    assert.ok(chip, `${def.id}: grade cell is exactly one linked chip`);
    assert.equal(chip[3], row.grade);
    assert.equal(chip[1], CHIP_CLASS[row.grade]);
    assert.equal(chip[2], row.ref);
    assert.ok(assumptions[row.ref], `${row.ref} is an assumption row`);
  });
});

test('break-even and capacity floor are rows of their own', () => {
  assert.equal(p.rows.find((r) => r.id === 'break_even').scaled.text, '41%');
  assert.equal(p.rows.find((r) => r.id === 'capacity_floor').scaled.text, '29%');
  assert.ok(s11.includes('data-fig="calc-break_even-scaled">41%</span>'));
  assert.ok(s11.includes('data-fig="calc-capacity_floor-scaled">29%</span>'));
});

test('table note and fixed-assumptions sentence follow the table', () => {
  const tableEnd = s11.indexOf('</table>');
  const note = s11.indexOf('<p class="table-note">Each output carries the weakest grade of the inputs it uses.</p>');
  const fixed = s11.indexOf('<p class="fixed-note">Fixed assumptions that are not inputs here (tier mix, reviewer rate, tooling, rights, storage and today\'s variant cost) are listed with their grades in the <a href="#assumptions-register">assumptions register</a>.</p>');
  assert.ok(tableEnd > 0 && note > tableEnd && fixed > note, `order ${tableEnd} ${note} ${fixed}`);
  assert.match(html, /<div class="table-scroll" id="assumptions-register" role="region"/);
});

test('calculator assumptions have register rows', () => {
  for (const id of ['asm-locales', 'asm-formats-per-locale']) {
    assert.ok(html.includes(`<tr id="${id}">`), id);
  }
});

// ---- Plan 03-06: the form, error summary and share panel ----

function calcLiveWrappers() {
  const out = [];
  const re = /<div class="calc-live" id="([^"]+)">/g;
  let m;
  while ((m = re.exec(s11))) {
    let depth = 1;
    let i = m.index + m[0].length;
    const tag = /<(\/?)div\b[^>]*>/g;
    tag.lastIndex = i;
    let t;
    while (depth > 0 && (t = tag.exec(s11))) depth += t[1] ? -1 : 1;
    out.push({ id: m[1], inner: s11.slice(i, t.index) });
  }
  return out;
}

test('s11 order: lead, status, no-JS, form, errors, summary, results, share last', () => {
  const at = (needle) => {
    const i = s11.indexOf(needle);
    assert.ok(i >= 0, needle);
    return i;
  };
  const order = [
    at('<p role="status" class="calc-status">'),
    at('<p class="calc-nojs">'), at('<div class="calc-live" id="calc-form-wrap">'), at('<div class="calc-live" id="calc-errors-wrap">'),
    at('<p><output id="calc-summary"'), at('aria-label="Calculator results"'), at('<div class="calc-live" id="calc-share-wrap">'),
  ];
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  const share = calcLiveWrappers().find((w) => w.id === 'calc-share-wrap');
  assert.ok(s11.indexOf(share.inner) + share.inner.length > s11.lastIndexOf('</table>'), 'share panel last');
  assert.equal((s11.match(/role="status"/g) || []).length, 2, 'status region and share status only');
});

test('no result, table, figure, details, believe panel or summary sits inside a .calc-live wrapper', () => {
  const wraps = calcLiveWrappers();
  assert.deepEqual(wraps.map((w) => w.id), ['calc-form-wrap', 'calc-errors-wrap', 'calc-share-wrap']);
  for (const w of wraps) {
    for (const bad of ['data-fig=', '<table', '<figure', '<details', 'class="believe"', 'id="calc-summary"']) {
      assert.ok(!w.inner.includes(bad), `${w.id} contains ${bad}`);
    }
  }
});

test('form: four groups, twelve fields in order with label, input, unit, chip and hint', () => {
  const wrap = calcLiveWrappers()[0].inner;
  assert.match(wrap, /^\s*<form class="calc-form" novalidate>[\s\S]*<\/form>\s*$/);
  const groups = [...wrap.matchAll(/<fieldset class="calc-group">\s*<legend>([^<]*)<\/legend>([\s\S]*?)<\/fieldset>/g)];
  assert.deepEqual(groups.map((g) => g[1]), ['Volume', 'People', 'Cost and quality', 'Automation']);
  const fields = groups.flatMap((g) => g[2].split('<div class="field">').slice(1));
  fields.forEach((html_, i) => {
    const f = FIELDS[i];
    const d = defaultValues(ctx)[f.key];
    assert.ok(html_.includes(`<label for="in-${f.key}">${f.label}</label>`), f.key);
    const input = `<input id="in-${f.key}" name="${f.key}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="hint-${f.key}" value="${toText(f, d)}">`;
    assert.ok(html_.includes(input), `${f.key} input`);
    assert.ok(html_.includes(`<span class="unit">${f.unit}</span>`), `${f.key} unit`);
    const grade = assumptions[f.asm].grade;
    assert.ok(html_.includes(`<a class="chip ${CHIP_CLASS[grade]}" href="#${f.asm}">${grade}</a>`), `${f.key} chip`);
    const hint = html_.match(new RegExp(`<p class="hint" id="hint-${f.key}">([^<]*)</p>`));
    assert.ok(hint && hint[1].startsWith(`Default ${toText(f, d)}`), `${f.key} hint`);
    if (f.key === 'reviewers') assert.match(hint[1], /utilisation, cycle time and break-even only/);
    if (f.key === 'marketers') assert.match(hint[1], /output per head only/);
    assert.equal(FIELDS.filter((x) => x.key === f.key).length, 1);
  });
  assert.deepEqual(groups.map((g) => (g[2].match(/<div class="field">/g) || []).length), [3, 3, 4, 2]);
  assert.deepEqual(FIELDS.map((f) => f.group), ['volume', 'volume', 'volume', 'people', 'people', 'people', 'cost', 'cost', 'cost', 'cost', 'automation', 'automation']);
  assert.ok(!/<h2[^>]*tabindex/.test(s11), 'JS sets the h2 tabindex');
});

test('error summary and share panel markup', () => {
  const [, errors, share] = calcLiveWrappers();
  assert.ok(errors.inner.includes('<div class="calc-errors" role="alert" tabindex="-1" hidden>'));
  assert.ok(share.inner.includes('<h3>Share these numbers</h3>'));
  assert.ok(share.inner.includes('<input readonly id="share-link"'));
  assert.ok(share.inner.includes('<button type="button" class="btn" id="copy-link">Copy link</button>'));
  assert.ok(share.inner.includes('<button type="button" class="btn" id="reset-calc">Reset to defaults</button>'));
  assert.ok(share.inner.includes('The link stores your inputs in the address only. Nothing is sent or saved.'));
  assert.ok(share.inner.includes('<p role="status" class="share-status"></p>'));
});

// ---- Plan 03-06: browser-side source hygiene ----

test('site/js sources avoid HTML injection, storage, network and dynamic code', () => {
  const dir = new URL('../site/js/', import.meta.url);
  const FORBIDDEN = ['innerHTML', 'insertAdjacentHTML', 'outerHTML', 'document.write', '.style.', "setAttribute('style'",
    'localStorage', 'sessionStorage', 'document.cookie', 'fetch(', 'XMLHttpRequest', 'eval(', 'new Function'];
  for (const file of ['ui.js', 'model.js', 'state.js', 'fields.js', 'format.js']) {
    const src = readFileSync(new URL(file, dir), 'utf8');
    for (const bad of FORBIDDEN) assert.ok(!src.includes(bad), `${file} contains ${bad}`);
  }
});

test('every import specifier in site/js is a same-folder relative path', () => {
  const dir = new URL('../site/js/', import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const src = readFileSync(new URL(file, dir), 'utf8');
    for (const [, spec] of src.matchAll(/(?:from|import)\s*\(?\s*'([^']+)'/g)) assert.ok(spec.startsWith('./'), `${file}: ${spec}`);
  }
});

test('ui.js stays thin', () => {
  const lines = readFileSync(new URL('../site/js/ui.js', import.meta.url), 'utf8').split('\n').length;
  assert.ok(lines < 300, `ui.js is ${lines} lines`);
});
