import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');

test('legal-review flag is absent (dropped by author decision 2026-10-24)', () => {
  assert.doesNotMatch(html, /legal-flag/);
  assert.doesNotMatch(html, /has not yet been reviewed by counsel/);
  assert.doesNotMatch(html, /aria-label="Legal review status"/);
});

// WR-08: counsel review was dropped, so no legal-review inventory ids remain and no
// test reads planning files (CI must depend only on files that ship or test).
test('no legal-review inventory ids remain on the page', () => {
  assert.doesNotMatch(html, /id="legal-/);
});

test('s15 lists evidence gaps with closers and the not-used notes', () => {
  const s15 = html.slice(html.indexOf('<section id="s15"'));
  assert.ok(s15.includes('<h3 id="s15-gaps">Evidence gaps</h3>'));
  assert.ok(s15.includes('These are the numbers this page could not find. Each is a gap, not an estimate.'));
  const ul = s15.match(/<ul class="gaps">([\s\S]*?)<\/ul>/);
  assert.ok(ul);
  const items = [...ul[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  assert.equal(items.length, 12);
  for (const li of items) {
    assert.match(li, /^<b>[^<]+<\/b> Would be closed by: /);
    const text = li.replace(/<[^>]+>/g, '');
    assert.ok(text.split(/\s+/).length <= 35, 'at most 35 words: ' + text);
    assert.doesNotMatch(text, /\d/, 'numeral-free');
  }
  for (const lead of ['Cost per asset', 'Approval times', 'incident rates', 'Auto-approval share', 'First-pass compliance', 'Analyst hours', 'DAM metadata', 'Answer-engine']) {
    assert.ok(ul[1].includes(lead), lead);
  }
  assert.ok(s15.includes('Replace any of these with your own data in the calculator.'));
  assert.ok(/<a href="#s11">/.test(s15.slice(s15.indexOf('Replace any of these'))));
  assert.ok(html.includes('<p class="nd">McKinsey: no figure is used on this page.</p>'));
  assert.ok(html.includes("<p class=\"nd\">Gartner's generative-AI return percentages: not used on this page; not verified against the primary source.</p>"));
  assert.equal((html.match(/mckinsey/gi) || []).length, 1);
  assert.doesNotMatch(html, /\b49%[\s\S]{0,200}\b40%[\s\S]{0,200}\b27%/);
});

test('rows that could not be re-fetched say so and keep their last verified date (QA-03)', async () => {
  const { sources } = await import('../site/js/data.js');
  for (const k of ['gartner-2025-cmo-spend', 'gartner-2026-cmo-spend', 'nyu-emory-ai-ads-2025']) {
    assert.match(sources[k].read_via, /Re-check failed \d{4}-\d{2}-\d{2}; last verified \d{4}-\d{2}-\d{2}\./, k);
    assert.ok(html.includes(sources[k].read_via), `${k} register matches data.js`);
  }
});

test('PDF sources are stamped not machine-checkable, never "Re-check failed" (WR-02)', async () => {
  const { sources } = await import('../site/js/data.js');
  for (const k of ['kohavi-2013', 'eu-ai-omnibus-2026-1744']) {
    assert.match(sources[k].url, /pdf/i, k);
    assert.match(sources[k].read_via, /Not machine-checkable \(PDF\): the \d{4}-\d{2}-\d{2} re-check cannot read PDF text; last verified \d{4}-\d{2}-\d{2}, when the PDF was read/, k);
    assert.doesNotMatch(sources[k].read_via, /Re-check failed|Phrase not found/, k);
    assert.ok(html.includes(sources[k].read_via), `${k} register matches data.js`);
  }
  assert.doesNotMatch(html, /Phrase not found/);
});
