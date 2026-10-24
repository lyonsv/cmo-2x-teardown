import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sources, assumptions } from '../site/js/data.js';
import { FIELDS } from '../site/js/fields.js';
import { run, JUSTIFIED_UNREFERENCED, GAP_TRACE } from '../scripts/crosscheck.mjs';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');

test('crosscheck passes on the page', () => {
  assert.deepEqual(run().failures, []);
});

test('crosscheck report is non-trivial', () => {
  const { report } = run();
  assert.ok(report.figures > 100, `figures ${report.figures}`);
  assert.equal(report.registerRows, Object.keys(sources).length + Object.keys(assumptions).length);
  assert.equal(report.defaultsChecked, FIELDS.length);
});

test('mutation: a removed register row is named', () => {
  const mutated = html.replace(/<tr id="asm-backlog0-days">[\s\S]*?<\/tr>/, '');
  assert.notEqual(mutated, html);
  const { failures } = run({ html: mutated });
  assert.ok(failures.some((f) => f.includes('asm-backlog0-days')), failures.join('\n'));
});

test('mutation: a drifted calculator default is named', () => {
  const mutated = html.replace(/(<input id="in-campaigns"[^>]*value=")40"/, '$141"');
  assert.notEqual(mutated, html);
  const { failures } = run({ html: mutated });
  assert.ok(failures.some((f) => f.includes('default drift') && f.includes('campaigns')), failures.join('\n'));
});

test('mutation: moving the checked route radio is named as route drift', () => {
  const mutated = html
    .replace('<input type="radio" name="route" value="both" checked>', '<input type="radio" name="route" value="both">')
    .replace('<input type="radio" name="route" value="markets">', '<input type="radio" name="route" value="markets" checked>');
  assert.notEqual(mutated, html);
  const { failures } = run({ html: mutated });
  assert.ok(failures.some((f) => f.includes('default drift: route')), failures.join('\n'));
});

test('mutation: a registered growth share that matches no route radio is named, not defaulted (WR-05)', async () => {
  const { modelContext } = await import('../site/js/data.js');
  const ctx = modelContext();
  const drifted = { ...ctx, assumptions: { ...ctx.assumptions, campaign_growth_share: 0.25 } };
  const { failures } = run({ data: { ctx: drifted } });
  assert.ok(failures.some((f) => f.includes('default drift: route') && f.includes('asm-growth-route')), failures.join('\n'));
});

test('mutation: a source with every reference removed is reported as unreferenced', () => {
  const id = 'src-gartner-2025-cmo-spend';
  const mutated = html.replaceAll(`href="#${id}"`, 'href="#s15"');
  assert.notEqual(mutated, html);
  const { failures } = run({ html: mutated });
  assert.ok(failures.some((f) => f.includes('unreferenced register row') && f.includes(id)), failures.join('\n'));
});

test('mutation: a blank publisher type cell is named', () => {
  const mutated = html.replace(/(<tr id="src-gartner-2025-cmo-spend">[\s\S]*?<td>Gartner, Inc\.<\/td>\s*<td>)company(<\/td>)/, '$1$2');
  assert.notEqual(mutated, html);
  const { failures } = run({ html: mutated });
  assert.ok(failures.some((f) => f.includes('src-gartner-2025-cmo-spend publisher type')), failures.join('\n'));
});

test('mutation: a McKinsey mention without the note flips the McKinsey check', () => {
  const mutated = html.replace('<p class="nd">McKinsey: no figure is used on this page.</p>', '');
  const { failures } = run({ html: mutated });
  assert.ok(failures.some((f) => f.includes('McKinsey note mismatch')), failures.join('\n'));
});

test('mutation: an untraced evidence gap is named', () => {
  const mutated = html.replace('<li><b>Approval times and queue ages.</b>', '<li><b>A gap nobody traced.</b>');
  assert.notEqual(mutated, html);
  const { failures } = run({ html: mutated });
  assert.ok(failures.some((f) => f.includes('untraced gap') && f.includes('A gap nobody traced')), failures.join('\n'));
});

test('JUSTIFIED_UNREFERENCED reasons are sentences', () => {
  for (const [k, v] of Object.entries(JUSTIFIED_UNREFERENCED)) {
    assert.equal(typeof v, 'string', k);
    assert.ok(v.endsWith('.') && v.split(/\s+/).length >= 5, `${k}: reason must be a sentence`);
  }
  assert.equal(typeof GAP_TRACE, 'object');
});

test('mutation: a gap removed from the page leaves a stale GAP_TRACE key that is named (IN-04)', () => {
  const mutated = html.replace(/<li><b>First-pass compliance rate\.?<\/b>[\s\S]*?<\/li>/, '');
  assert.notEqual(mutated, html);
  const { failures } = run({ html: mutated });
  assert.ok(failures.some((f) => f.includes('stale GAP_TRACE key First-pass compliance rate')), failures.join('\n'));
});
