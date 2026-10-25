import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, sectionHtml, strip } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const count = (s, re) => (s.match(re) || []).length;

test('elementById returns the whole v1 s11 section', () => {
  const el = elementById(html, 's11');
  assert.ok(el.startsWith('<section id="s11"'));
  assert.ok(el.endsWith('</section>'));
  assert.equal(count(el, /<section\b/g), count(el, /<\/section>/g));
});

test('elementById slices every v1 section and the answer block', () => {
  const ids = ['answer', ...Array.from({ length: 15 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`)];
  for (const id of ids) {
    const el = elementById(html, id);
    assert.equal(count(el, /<section\b/g), count(el, /<\/section>/g), id);
  }
});

test('elementById handles nested divs', () => {
  const s = '<section id="x"><div id="y"><div>a</div></div></section>';
  assert.equal(elementById(s, 'y'), '<div id="y"><div>a</div></div>');
});

test('elementById throws on missing and unbalanced', () => {
  assert.throws(() => elementById('<div id="a"></div>', 'nope'), /missing element/);
  assert.throws(() => elementById('<div id="z"><div>', 'z'), /unbalanced/);
});

test('sectionHtml drops a demoted h3 heading but keeps an h2', () => {
  const a = '<div id="q"><h3 id="q-h">Title</h3><p>body</p></div>';
  assert.ok(!sectionHtml(a, 'q').includes('Title'));
  assert.ok(sectionHtml(a, 'q').includes('body'));
  const b = '<section id="q"><h2 id="q-h">Title</h2><p>body</p></section>';
  assert.ok(sectionHtml(b, 'q').includes('<h2 id="q-h">Title</h2>'));
});

test('strip removes tags, decodes entities and collapses whitespace', () => {
  assert.equal(strip('<p>a &amp; b &#39;c&#39; &quot;d&quot; &lt;e&gt;\n  f</p>'), `a & b 'c' "d" <e> f`);
});
