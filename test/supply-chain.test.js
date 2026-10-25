// Structure checks for section 04 (#supply-chain), plan 07-04: FLOW-01..05, STRUCT-07.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, strip } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const section = elementById(html, 'supply-chain');

const STAGES = ['Objective', 'Research and plan', 'Brief', 'Source assets', 'Adapt and localise', 'Review and approve', 'Publish and activate', 'Measure', 'Optimise and refresh'];

function tableByCaption(caption) {
  const t = (section.match(/<table>[\s\S]*?<\/table>/g) || []).find((x) => x.includes(`<caption>${caption}</caption>`));
  assert.ok(t, `table "${caption}"`);
  return t;
}
const bodyRows = (t) => t.slice(t.indexOf('<tbody>')).match(/<tr\b[\s\S]*?<\/tr>/g) || [];

test('stage table has nine rows in chain order with the six pinned columns', () => {
  const t = tableByCaption('Stage by stage: who does what');
  const head = [...t.slice(0, t.indexOf('<tbody>')).matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.deepEqual(head, ['Stage', 'Work today', 'Agent does in the pilot', 'People do in the pilot', 'Later', 'Hand-offs removed']);
  const rows = bodyRows(t);
  assert.deepEqual(rows.map((r) => strip(r.match(/<th scope="row">([\s\S]*?)<\/th>/)[1])), STAGES);
  for (const r of rows) assert.equal((r.match(/<td>/g) || []).length, 5);
});

test('the section says plainly that generation is one of nine steps', () => {
  const text = strip(section);
  assert.ok(/Content generation is one step among nine/.test(text));
  assert.ok(/Generation sits inside two of them/.test(text));
});

test('worked example: ten steps, each starting with Agent or People, in a titled block', () => {
  assert.ok(section.includes('<h3 id="worked-example">Worked example: launch the approved campaign in three additional markets</h3>'));
  const ol = section.match(/<ol id="worked-steps">([\s\S]*?)<\/ol>/)[1];
  const items = ol.match(/<li>[\s\S]*?<\/li>/g);
  assert.equal(items.length, 10);
  for (const li of items) assert.match(strip(li), /^(Agent|People)\b/);
  assert.ok(/<h4>What is autonomous in the pilot<\/h4>/.test(section) && /<h4>What is not<\/h4>/.test(section));
});

test('per-unit table: four workflows, today and with agents, only engine claims, one chip per row', () => {
  const t = tableByCaption('What the pilot workflows change, per unit of work');
  const rows = bodyRows(t);
  assert.equal(rows.length, 8, 'four workflows, two states each');
  assert.equal((t.match(/rowspan="2"/g) || []).length, 4);
  const figs = [...t.matchAll(/data-fig="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(figs.length, 16);
  for (const id of figs) assert.match(id, /^econ-wf-W(2|4|5|6)-(current|agent)-(hours_per_unit|cycle_days)$/);
  for (const w of ['W2', 'W4', 'W5', 'W6']) for (const s of ['current', 'agent']) {
    for (const f of ['hours_per_unit', 'cycle_days']) assert.ok(figs.includes(`econ-wf-${w}-${s}-${f}`), `${w} ${s} ${f}`);
  }
  for (const r of rows) {
    // CR-03: today's rows are Modelled; the agent rows are unsourced programme hypotheses, Speculative.
    const want = r.includes('>hypothesis<') ? 'c-s' : 'c-m';
    assert.equal((r.match(/class="chip /g) || []).length, 1, 'one chip per row');
    assert.equal((r.match(new RegExp(`class="chip ${want}"`, 'g')) || []).length, 1, `one ${want} chip per row`);
    assert.ok(/<span class="ev">(illustrative|hypothesis)<\/span>/.test(r), 'evidence class');
  }
  assert.ok(rows.filter((r) => r.includes('>hypothesis<')).length === 4 && rows.filter((r) => r.includes('>illustrative<')).length === 4);
});

test('hand-offs argument and wedge exist; the wedge links to the expansion section and path', () => {
  assert.ok(/<h3 id="handoffs">Why removing hand-offs beats faster generation<\/h3>/.test(section));
  assert.ok(/<h3 id="wedge">The wedge, not the limit<\/h3>/.test(section));
  const wedge = section.slice(section.indexOf('id="wedge"'), section.indexOf('class="evidence-stop"'));
  assert.ok(wedge.includes('href="#expansion"') && wedge.includes('href="#expansion-path"'));
  assert.ok(section.slice(section.indexOf('id="handoffs"'), section.indexOf('id="wedge"')).includes('href="#economics"'));
  for (const id of ['expansion', 'expansion-path', 'economics', 'roadmap', 'appendix-factory']) assert.ok(html.includes(`id="${id}"`), id);
});

test('no to-follow marker, no vendor or Intercom names, no digits outside bound figures', () => {
  assert.ok(!section.includes('class="to-follow"'));
  assert.ok(!/intercom/i.test(strip(section)));
  const prose = strip(section.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<span data-fig="[^"]+">[^<]*<\/span>/g, ' ').replace(/<span class="sec-num">[^<]*<\/span>/g, ' ').replace(/Figure \d+/g, ' ')).replace(/\bT[0-3]\b/g, ' ');
  assert.ok(!/\d/.test(prose.replace(/\b2x\b/g, ' ')), `digit in prose: ${prose.match(/.{20}\d.{20}/)?.[0]}`);
});

test('the factory model moved to Appendix A and the old Figure 3 is gone', () => {
  const app = elementById(html, 'appendix-campaign');
  assert.ok(app.includes('id="appendix-factory"') && app.includes('<figcaption><b>Figure 2</b>'));
  assert.ok(!section.includes('<figcaption><b>Figure 2</b>'));
  assert.equal((html.match(/<figcaption><b>Figure 3<\/b>/g) || []).length, 1);
  assert.ok(!html.includes('fd3-'));
  assert.ok(section.includes('id="s03"') && section.includes('href="#appendix-factory"'));
  assert.ok(!/asset manifest/i.test(strip(elementById(html, 's03'))), 'run record, not asset manifest, in new copy');
});
