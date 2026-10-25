// The "spine" convention (07-CONTEXT, Writing): every body section carries one chain
// position line directly after its heading and one evidence-stop line. SPINE lists the
// section ids that follow it; each content plan appends its own id.
// Created in plan 07-02 in a form plan 07-01 extends (07-01 adds 'opportunity').
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, strip } from './helpers/html.js';

export const SPINE = [
  'opportunity',
  'autonomy',
  'build',
  'supply-chain',
  'economics',
  'outcomes',
  'expansion',
  'roadmap',
];

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const CHAIN = ['Software built', 'Autonomy enabled', 'Human work reduced', 'Marketing capacity increased', 'Business outcomes improved'];

for (const id of SPINE) {
  test(`spine: #${id} has one chain-pos after its heading and one evidence-stop`, () => {
    const el = elementById(html, id);
    assert.equal((el.match(/class="chain-pos"/g) || []).length, 1, 'one chain-pos');
    const head = el.match(/<div class="sec-head">[\s\S]*?<\/div>\s*/);
    assert.ok(head, 'sec-head');
    const after = el.slice(el.indexOf(head[0]) + head[0].length);
    assert.ok(after.startsWith('<p class="chain-pos">'), 'chain-pos is the first element after the heading');
    const chain = after.slice(0, after.indexOf('</p>'));
    const text = strip(chain);
    let at = -1;
    for (const link of CHAIN) {
      const i = text.indexOf(link, at + 1);
      assert.ok(i > at, `chain link "${link}" in order`);
      at = i;
    }
    assert.ok(/<b>[^<]+<\/b>/.test(chain), 'at least one link is bold');
    assert.ok(!/\d/.test(text), 'no digits in the chain line');
    const stops = el.match(/<p class="evidence-stop">[\s\S]*?<\/p>/g) || [];
    assert.equal(stops.length, 1, 'one evidence-stop');
    assert.ok(strip(stops[0]).startsWith('Where the evidence stops.'));
    assert.ok(!/\d/.test(strip(stops[0])), 'no digits in the evidence-stop');
  });
}

test('spine: the check fires on a missing evidence-stop', () => {
  const bad = elementById(html, 'autonomy').replace('class="evidence-stop"', 'class="x"');
  assert.equal((bad.match(/class="evidence-stop"/g) || []).length, 0);
});
