import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { modelContext, claims, assumptions } from '../site/js/data.js';
import { present, defaultValues, RESULT_ROWS } from '../site/js/model.js';

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
  assert.ok(!s11.includes('calc-live'), 'JS-only wrappers arrive in a later plan');
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
