import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, strip } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const inv = JSON.parse(readFileSync(new URL('./fixtures/v1-inventory.json', import.meta.url), 'utf8'));
// Map of item key ('id:s07', 'data-fig:xyz', 'fig:4', 'table:Caption') -> reason it was retired.
const RETIRED = JSON.parse(readFileSync(new URL('./fixtures/retired.json', import.meta.url), 'utf8'));

// Returns every fixture item (as a key) that the page no longer carries.
export function missingFrom(page, fixture) {
  const missing = [];
  const ids = new Set([...page.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const id of fixture.ids) if (!ids.has(id)) missing.push(`id:${id}`);
  const fig = {};
  for (const m of page.matchAll(/data-fig="([^"]+)"/g)) fig[m[1]] = (fig[m[1]] || 0) + 1;
  for (const [id, n] of Object.entries(fixture.dataFig)) if ((fig[id] || 0) < n) missing.push(`data-fig:${id}`);
  const figs = new Set([...page.matchAll(/<figcaption><b>Figure (\d+)<\/b>/g)].map((m) => Number(m[1])));
  for (const f of fixture.figures) if (!figs.has(f.n)) missing.push(`fig:${f.n}`);
  const tables = new Set([...page.matchAll(/<caption>([\s\S]*?)<\/caption>/g)].map((m) => strip(m[1])));
  for (const t of fixture.tables) if (!tables.has(t)) missing.push(`table:${t}`);
  return missing;
}

test('fixture matches the recorded v1 counts', () => {
  assert.equal(inv.ids.length, 213);
  assert.equal(Object.keys(inv.dataFig).length, 274);
  assert.equal(Object.values(inv.dataFig).reduce((a, b) => a + b, 0), 334);
  assert.equal(inv.figures.length, 8);
  assert.equal(inv.tables.length, 26);
});

test('every v1 id, data-fig, figure and table caption survives or is retired with a reason', () => {
  const left = missingFrom(html, inv).filter((k) => !RETIRED[k]);
  assert.deepEqual(left, []);
});

test('RETIRED entries carry a reason, exist in the fixture and are really gone', () => {
  const gone = new Set(missingFrom(html, inv));
  const known = new Set([
    ...inv.ids.map((x) => `id:${x}`), ...Object.keys(inv.dataFig).map((x) => `data-fig:${x}`),
    ...inv.figures.map((f) => `fig:${f.n}`), ...inv.tables.map((t) => `table:${t}`),
  ]);
  for (const [key, reason] of Object.entries(RETIRED)) {
    assert.ok(typeof reason === 'string' && reason.length > 0, `${key}: reason`);
    assert.ok(known.has(key), `${key}: not in the v1 fixture`);
    assert.ok(gone.has(key), `stale RETIRED: ${key} is still present`);
  }
});

test('mutation: removing items makes missingFrom report them', () => {
  assert.deepEqual(missingFrom(html, inv), []);
  assert.ok(missingFrom(html.replace('id="s07"', 'id="zz"'), inv).includes('id:s07'));
  const df = Object.keys(inv.dataFig)[0];
  assert.ok(missingFrom(html.replaceAll(`data-fig="${df}"`, 'data-x="1"'), inv).includes(`data-fig:${df}`));
  assert.ok(missingFrom(html.replace('<figcaption><b>Figure 4</b>', '<figcaption><b>Fig</b>'), inv).includes('fig:4'));
  const noCaps = html.replace(/<caption>[\s\S]*?<\/caption>/g, '<caption>x</caption>');
  assert.ok(missingFrom(noCaps, inv).some((k) => k.startsWith('table:')));
});

test('each v1 section is a section or div that holds its own heading', () => {
  for (let i = 1; i <= 15; i++) {
    const id = `s${String(i).padStart(2, '0')}`;
    const el = elementById(html, id);
    assert.match(el, new RegExp(`<h[23] id="${id}-h"`), id);
  }
});
