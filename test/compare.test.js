import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sources } from '../site/js/data.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../site/assets/style.css', import.meta.url), 'utf8');
const a = html.indexOf('<section id="s12"');
const s12 = html.slice(a, html.indexOf('</section>', a));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const strip = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const text = strip(s12);
const matrix = s12.slice(s12.indexOf('<table class="matrix">'), s12.indexOf('</table>'));
const bodyRows = [...matrix.slice(matrix.indexOf('<tbody>')).matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
const cells = (row) => [...row.matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => m[2]);
const vendorAccessed = new Set(Object.entries(sources).filter(([k]) => /^(gradial|airops|profound)-/.test(k)).map(([, v]) => v.accessed));

test('s12 has a lead, then the admission callout before the matrix', () => {
  const lead = s12.indexOf('<p>');
  const callout = s12.indexOf('<div class="callout">');
  const table = s12.indexOf('<table class="matrix">');
  assert.ok(lead > 0 && lead < callout && callout < table);
  assert.ok(s12.includes('<span class="lbl">Design, not a product</span>'));
  assert.ok(text.includes('The CMO 2x spine in this column is a design described on this page. It is not a shipped product and has no customers.'));
  assert.ok(text.includes('not a shipped product'));
});

test('matrix container, caption, headers and nine rows in order', () => {
  assert.ok(s12.includes('<div class="table-scroll" role="region" aria-label="Comparison matrix" tabindex="0">'));
  assert.ok(matrix.includes('<caption>How Gradial, AirOps, Profound and the CMO 2x spine compare. Every cell is sourced; access dates are in the source register.</caption>'));
  const head = [...matrix.slice(0, matrix.indexOf('<tbody>')).matchAll(/<th scope="col"[^>]*>([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.deepEqual(head, ['Dimension', 'Gradial', 'AirOps', 'Profound', 'CMO 2x spine (design)']);
  assert.deepEqual(bodyRows.map((r) => strip(cells(r)[0])), [
    'The six levers', 'More than ten thousand variants', 'Imagery and rights', 'Review, gate and eval',
    'Brand governance', 'Measurement', 'AEO and GEO', 'Build vs buy', 'Lock-in',
  ]);
  for (const r of bodyRows) assert.equal(cells(r).length, 5);
});

test('every vendor cell cites a registered row or states not publicly documented with a checked date; spine cells say Design', () => {
  for (const r of bodyRows) {
    const c = cells(r);
    for (const cell of c.slice(1, 4)) {
      const cites = [...cell.matchAll(/<a class="cite" href="#src-((?:gradial|airops|profound)-[a-z-]+)">/g)].map((m) => m[1]);
      const nds = [...cell.matchAll(/<span class="nd">Not publicly documented<\/span><span class="cite-date"> checked <time datetime="(\d{4}-\d{2}-\d{2})">\1<\/time><\/span>/g)];
      assert.ok(cites.length + nds.length > 0, `cell has neither cite nor nd: ${strip(cell).slice(0, 60)}`);
      for (const k of cites) {
        assert.ok(sources[k], `${k} not in data.js`);
        assert.ok(html.includes(`<tr id="src-${k}">`), `${k} not in register`);
        assert.ok(cell.includes(`<a class="cite" href="#src-${k}">src-${k}</a><span class="cite-date"> accessed <time datetime="${sources[k].accessed}">${sources[k].accessed}</time></span>`), `${k} cite date`);
      }
      for (const m of nds) assert.ok(vendorAccessed.has(m[1]), 'nd date is not a vendor access date');
    }
    assert.ok(/\bDesign\b/.test(strip(c[4])), 'spine cell lacks Design');
    assert.match(c[4], /<a href="#s0[3-8]">/);
  }
});

test('every date in s12 is inside a time element; no unfair or financial wording; no digits in cells', () => {
  assert.ok(!/\d{4}-\d{2}-\d{2}/.test(strip(s12.replace(/<time\b[^>]*>[^<]*<\/time>/g, ' '))));
  assert.ok(!/does not (have|exist)/i.test(text));
  for (const w of ['valuation', 'Series', 'funding', '$']) assert.ok(!text.includes(w), w);
  assert.ok(!/\d/.test(strip(matrix.replace(/<time\b[^>]*>[^<]*<\/time>/g, ' ').replace(/<a href="#s0\d">[^<]*<\/a>/g, ' ').replace(/2x/g, ''))));
});

test('review row separates documented oversight levels from the undocumented gate and calibrated eval', () => {
  const c = cells(bodyRows[3]);
  assert.ok(strip(c[1]).includes('oversight levels per task type'));
  assert.ok(strip(c[4]).includes('risk-class tier gate'));
  assert.ok(strip(c[4]).includes('eval harness calibrated against human reviewer decisions'));
  assert.ok(text.includes('The pages read do not describe a gate tiered by asset risk class, or an eval harness calibrated against human reviewer decisions.'));
  assert.ok(strip(c[2]).includes('listed on all three plans'));
});

test('AEM is cited for Gradial, and no price wording appears', () => {
  const g = cells(bodyRows[7])[1];
  assert.ok(g.includes('Adobe Experience Manager') && g.includes('href="#src-gradial-integrations"'));
  assert.ok(!/\b(price|pricing plan|per month|\/mo)\b/i.test(text));
});

test('matrix styles', () => {
  assert.match(css, /\.matrix\s*{\s*min-width:\s*960px/);
  assert.match(css, /\.matrix tbody th\[scope=row\]\s*{[^}]*position:\s*sticky[^}]*background:\s*var\(--paper\)/);
  assert.match(css, /\.matrix \.spine\s*{[^}]*var\(--paper-2\)/);
  const print = css.slice(css.indexOf('@media print'));
  assert.match(print, /\.matrix tbody th\[scope=row\]\s*{\s*position:\s*static/);
  assert.equal((css.match(/position:\s*sticky/g) || []).length, 1, 'sticky is limited to the matrix');
});
