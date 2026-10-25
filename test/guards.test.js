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

// ---- STRUCT-06: banned jargon in body text (register rows excluded) ----
export const BAN = /\b(agentic marketing operating system|AI transformation|unlock\w*|supercharge\w*|game[- ]changer|revolutionis\w*|revolutioniz\w*|seamless\w*|synerg(?:y|ies)|leverage AI|10x your)\b/i;
const bodyText = (page) => strip(page
  .replace(/<head>[\s\S]*?<\/head>/, '')
  .replace(/<tr id="(?:src|asm)-[^"]+">[\s\S]*?<\/tr>/g, ''));

test('no banned jargon in the page body', () => {
  assert.doesNotMatch(bodyText(html), BAN);
});

test('mutation: the jargon guard fires on banned phrases', () => {
  const bad = html.replace('</main>', '<p>a seamless handover</p><p>Unlocking value</p></main>');
  assert.notEqual(bad, html, 'mutation applied');
  const text = bodyText(bad);
  assert.match(text, BAN);
  assert.match(bodyText('<p>an AI transformation</p>'), BAN);
  assert.doesNotMatch(bodyText('<tr id="src-x"><td>seamless</td></tr>'), BAN);
});
