import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { strip } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const inv = JSON.parse(readFileSync(new URL('./fixtures/v1-inventory.json', import.meta.url), 'utf8'));
const RETIRED = JSON.parse(readFileSync(new URL('./fixtures/retired.json', import.meta.url), 'utf8'));

// ---- STRUCT-05: every in-page link resolves (query stripped) ----
const idsOf = (page) => new Set([...page.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const hrefsOf = (page) => [...page.matchAll(/href="#([^"]*)"/g)].map((m) => m[1]);
export function unresolved(page) {
  const ids = idsOf(page);
  return hrefsOf(page).map((h) => h.split('?')[0]).filter((h) => h === '' || !ids.has(h));
}

test('every in-page href resolves to an element id', () => {
  assert.ok(hrefsOf(html).length > 0);
  assert.deepEqual(unresolved(html), []);
});

test('a bare href="#" is rejected and a dangling anchor is caught', () => {
  assert.deepEqual(unresolved('<a href="#">x</a>'), ['']);
  assert.deepEqual(unresolved('<a href="#nope?x=1">x</a><p id="yes"></p>'), ['nope']);
  assert.deepEqual(unresolved('<a href="#yes?x=1">x</a><p id="yes"></p>'), []);
});

test('every v1 id still resolves unless retired', () => {
  const ids = idsOf(html);
  for (const id of inv.ids) {
    if (RETIRED[`id:${id}`]) continue;
    assert.ok(ids.has(id), `v1 id ${id} no longer resolves`);
  }
});

test('no table-of-contents link carries a query', () => {
  const toc = html.match(/<nav class="toc"[\s\S]*?<\/nav>/);
  assert.ok(toc, 'toc nav');
  for (const h of toc[0].matchAll(/href="([^"]*)"/g)) assert.ok(!h[1].includes('?'), h[1]);
});

// ---- STRUCT-06: banned jargon in body text (source titles excluded) ----
export const BAN = /\b(agentic marketing operating system|AI transformation|unlock\w*|supercharge\w*|game[- ]changer|revolutionis\w*|revolutioniz\w*|seamless\w*|synerg(?:y|ies)|leverage AI|10x your)\b/i;
// Code review WR-08: CONTEXT excludes only register/source titles, so only the title
// text at the start of each source row's first cell is dropped. The assumption rows,
// and the rest of each source row (bias, read-via, publisher), are the author's words.
const bodyText = (page) => strip(page
  .replace(/<head>[\s\S]*?<\/head>/, '')
  .replace(/(<tr id="src-[^"]+">\s*<th\b[^>]*>[^<]*<\/th>\s*<td>)[^<]*/g, '$1'));

test('no banned jargon in the page body', () => {
  assert.doesNotMatch(bodyText(html), BAN);
});

test('mutation: the jargon guard fires on banned phrases', () => {
  const bad = html.replace('</main>', '<p>a seamless handover</p><p>Unlocking value</p></main>');
  assert.notEqual(bad, html, 'mutation applied');
  const text = bodyText(bad);
  assert.match(text, BAN);
  assert.match(bodyText('<p>an AI transformation</p>'), BAN);
  const row = '<tr id="src-x"><th scope="row" class="id">src-x</th><td>Seamless title<br>Bias text.</td></tr>';
  assert.doesNotMatch(bodyText(row), BAN, 'a source title is excluded');
  assert.match(bodyText(row.replace('Bias text', 'A seamless bias note')), BAN, 'the rest of a source row is scanned');
  assert.match(bodyText('<tr id="asm-x"><th>asm-x</th><td>leverage AI</td></tr>'), BAN, 'assumption rows are scanned');
});

// Text the scripts put on the page: every string literal in the browser modules
// (comments removed), and the reader-facing fields of data.js except source titles.
const JS = ['model.js', 'ui.js', 'fields.js', 'panels.js', 'format.js', 'state.js', 'svg.js', 'calc.js'];
const literals = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:\\'"`])\/\/.*$/gm, '$1')
  .match(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g) || [];

test('no banned jargon in strings the scripts render', async () => {
  for (const f of JS) {
    const src = readFileSync(new URL(`../site/js/${f}`, import.meta.url), 'utf8');
    const lits = literals(src);
    assert.ok(lits.length > 0, `${f}: no literals found`);
    for (const l of lits) assert.doesNotMatch(l, BAN, `${f}: ${l.slice(0, 60)}`);
  }
  const { assumptions, claims, sources } = await import('../site/js/data.js');
  const fields = [
    ...Object.values(assumptions).flatMap((a) => [a.label, a.display, a.basis, a.unit]),
    ...Object.values(claims).flatMap((c) => [c.unit, c.display]),
    ...Object.values(sources).flatMap((x) => [x.bias, x.read_via, x.publisher]),
  ].filter((x) => typeof x === 'string');
  assert.ok(fields.length > 300, `only ${fields.length} data.js strings`);
  for (const t of fields) assert.doesNotMatch(t, BAN, t.slice(0, 60));
  assert.ok(literals("const a = 'a seamless start'; // unlock").some((l) => BAN.test(l)), 'mutation: a literal is scanned');
  assert.ok(!literals("const a = 1; // unlock it").some((l) => BAN.test(l)), 'comments are not scanned');
});
