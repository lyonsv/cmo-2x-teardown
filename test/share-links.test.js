import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { modelContext } from '../site/js/data.js';
import { parseHash, serialiseHash } from '../site/js/state.js';
import { LEGACY_SCENARIOS } from '../site/js/model.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const links = JSON.parse(readFileSync(new URL('./fixtures/v1-share-links.json', import.meta.url), 'utf8'));
const ctx = modelContext();

// Hard-coded on purpose: a future default change must fail here, not be silently re-recorded.
const DEFAULTS = {
  campaigns: 40, concepts: 25, markets: 5, marketers: 120, reviewers: 12, minutes: 12,
  vcost: 0.8, mconcept: 1200, yield: 0.95, rework: 0.15, auto1: 0.2, auto2: 0.6,
  route: 'both', scenario: 'c',
};

test('there are nine recorded v1 share links including all three scenarios', () => {
  assert.equal(links.length, 9);
  for (const s of ['scenario=hold', 'scenario=reduce', 'scenario=redeploy']) {
    assert.ok(links.some((l) => l.hash.includes(s)), s);
  }
});

test('legacy scenario values map to A, B and B, and the writer never emits a legacy value', () => {
  assert.deepEqual(LEGACY_SCENARIOS, { redeploy: 'a', hold: 'b', reduce: 'b' });
  for (const [legacy, mapped] of Object.entries(LEGACY_SCENARIOS)) {
    const v = parseHash(`#s11?scenario=${legacy}`, ctx).values;
    assert.equal(v.scenario, mapped);
    assert.equal(serialiseHash(v, ctx), `#s11?scenario=${mapped}`);
  }
  // WR-09: a v1 link without scenario= used v1's default (redeploy), so it opens in A, the same
  // as an explicit scenario=redeploy; links this edition writes always name their scenario.
  assert.equal(parseHash('#s11?markets=6', ctx).values.scenario, 'a', 'a v1 link without scenario= opens in A, like redeploy');
  assert.equal(serialiseHash({ ...DEFAULTS, markets: 6 }, ctx), '#s11?markets=6&scenario=c');
  assert.equal(parseHash(serialiseHash({ ...DEFAULTS, markets: 6 }, ctx), ctx).values.scenario, 'c');
});

test('WR-09: legacy mappings that change what the link showed carry a visible notice', () => {
  assert.deepEqual(parseHash('#s11?scenario=redeploy', ctx).info, []);
  assert.deepEqual(parseHash('#s11?markets=6', ctx).info, []);
  assert.match(parseHash('#s11?scenario=reduce', ctx).info.join(' '), /Reduce scenario, which has no exact equivalent here, so it shows B/);
  assert.match(parseHash('#s11?rework=10', ctx).info.join(' '), /now changes only the 2x side/);
  assert.match(parseHash('#s11?rework=10&scenario=hold', ctx).info.join(' '), /now changes only the 2x side/);
  assert.deepEqual(parseHash('#s11?rework=10&scenario=b', ctx).info, [], 'a link written by this edition is not legacy');
  assert.deepEqual(parseHash('', ctx).info, []);
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
