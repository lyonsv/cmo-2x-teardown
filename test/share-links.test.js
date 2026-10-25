import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { modelContext } from '../site/js/data.js';
import { parseHash, serialiseHash } from '../site/js/state.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const links = JSON.parse(readFileSync(new URL('./fixtures/v1-share-links.json', import.meta.url), 'utf8'));
const ctx = modelContext();

// Hard-coded on purpose: a future default change must fail here, not be silently re-recorded.
const DEFAULTS = {
  campaigns: 40, concepts: 25, markets: 5, marketers: 120, reviewers: 12, minutes: 12,
  vcost: 0.8, mconcept: 1200, yield: 0.95, rework: 0.15, auto1: 0.2, auto2: 0.6,
  route: 'both', scenario: 'redeploy',
};

test('there are nine recorded v1 share links including all three scenarios', () => {
  assert.equal(links.length, 9);
  for (const s of ['scenario=hold', 'scenario=reduce', 'scenario=redeploy']) {
    assert.ok(links.some((l) => l.hash.includes(s)), s);
  }
});

for (const l of links) {
  test(`parseHash restores ${l.hash.slice(0, 60)}`, () => {
    const r = parseHash(l.hash, ctx);
    assert.deepEqual(r.values, { ...DEFAULTS, ...l.expect });
    assert.equal(r.restored, true);
    assert.deepEqual(r.notices, l.notices);
  });
  if (!l.acceptOnly && l.notices.length === 0) {
    test(`serialiseHash reproduces ${l.hash.slice(0, 60)}`, () => {
      assert.equal(serialiseHash(parseHash(l.hash, ctx).values, ctx), l.hash);
    });
  }
}

test('the page keeps the calculator container and heading ids ui.js depends on', () => {
  assert.ok(html.includes('id="s11"'));
  assert.ok(html.includes('id="s11-h"'));
});
