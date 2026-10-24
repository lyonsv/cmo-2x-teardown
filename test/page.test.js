import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { claims, assumptions, sources } from '../site/js/data.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');

function figEntry(id) {
  if (claims[id]) return { display: claims[id].display, grade: claims[id].grade, ref: claims[id].ref };
  if (assumptions[id]) return { display: assumptions[id].display, grade: assumptions[id].grade, ref: id };
  return null;
}

const figRe = /<span data-fig="([^"]+)">([^<]*)<\/span>(\s*<a class="chip c-[bms]" href="#([^"]+)">([^<]+)<\/a>)?/g;

test('every data-fig matches data.js and is followed by its chip', () => {
  const found = [...html.matchAll(figRe)];
  assert.ok(found.length > 0, 'no data-fig spans');
  for (const [, id, text, chip, href, word] of found) {
    const e = figEntry(id);
    assert.ok(e, `unknown data-fig ${id}`);
    assert.equal(text, e.display, `${id} display drifted`);
    assert.ok(chip, `${id}: no chip after number`);
    assert.equal(word, e.grade, `${id}: chip word`);
    assert.equal(href, e.ref, `${id}: chip href`);
  }
});

test('every in-page href resolves to an id', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(target), `dead anchor #${target}`);
  }
});

test('registers cover every source and assumption', () => {
  for (const id of Object.keys(assumptions)) assert.ok(html.includes(`<tr id="${id}">`), id);
  for (const k of Object.keys(sources)) assert.ok(html.includes(`<tr id="src-${k}">`), k);
});

test('static page guards', () => {
  assert.ok(!html.includes('<script'), 'script element present');
  assert.ok(!html.includes('data:image'), 'data:image present');
  assert.match(html, /<html lang="en-GB">/);
  assert.ok(existsSync(new URL('../site/.nojekyll', import.meta.url)));
});
