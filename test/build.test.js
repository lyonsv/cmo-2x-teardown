// Structure checks for section 03 (#build), plan 07-03: BUILD-01..05, STRUCT-07.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, strip, decode } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const section = elementById(html, 'build');
const text = strip(section);

// Same pattern as test/page.test.js: vendor and product names stay out of body sections.
const VENDOR_RE = /\b(gradial|airops|profound|adobe|firefly|midjourney|dall-?e|openai|chatgpt|anthropic|claude|gemini|google|microsoft|copilot|canva|shutterstock|runway|synthesia|jasper|salesforce|hubspot|bynder|aprimo|contentful|amazon|aws|azure|honeycomb|athena|optimizely|klarna|unilever|tiktok|linkedin|facebook|instagram|youtube|meta ads|meta platforms|sora|veo|imagen|flux\.1|black forest labs|ideogram|leonardo\.ai|stable diffusion|figma|workfront|sprinklr|celtra|persado|typeface\.ai|writer\.com|smartling|phrase tms|deepl|seismic|sitecore|bria)\b/i;

function tableByCaption(caption) {
  const tables = section.match(/<table>[\s\S]*?<\/table>/g) || [];
  const t = tables.find((x) => x.includes(`<caption>${caption}</caption>`));
  assert.ok(t, `table "${caption}"`);
  return t;
}
const bodyRows = (t) => t.slice(t.indexOf('<tbody>')).match(/<tr\b[\s\S]*?<\/tr>/g) || [];
const headers = (t) => [...t.slice(0, t.indexOf('<tbody>')).matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => decode(m[1]));
const cells = (r) => [...r.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map((m) => strip(m[1]));

const CAPABILITIES = [
  'Objective record and outcome tracking',
  'Brand, claims, rights and context library',
  'Planning and orchestration (workflow engine)',
  'Connectors and permissions',
  'Worker agents and skills',
  'Checks and evaluations',
  'Approval inbox and exceptions',
  'Run record',
  'Performance and business-result measurement',
  'Feedback and optimisation',
];
const OWN = /^(Build and own|Integrate|Platform-provided)( \+ (Build and own|Integrate|Platform-provided))*$/;

test('section 03 keeps its title and opens with the plain-English block before the capabilities', () => {
  assert.match(section, /<h2 id="build-h">What needs to be built<\/h2>/);
  const a = section.indexOf('id="build-60s"');
  const b = section.indexOf('id="capabilities"');
  assert.ok(a > 0 && b > a, 'build-60s precedes capabilities');
  const block = elementById(html, 'build-60s');
  const words = strip(block).split(' ').length;
  assert.ok(words <= 200, `${words} words in the plain-English block`);
  assert.ok(!/\d/.test(strip(block)), 'no digits in the plain-English block');
  assert.match(strip(block), /who|campaign owners/i);
});

test('six parts are listed in order', () => {
  const ol = section.slice(section.indexOf('id="six-parts"')).match(/<ol>([\s\S]*?)<\/ol>/)[1];
  const items = [...ol.matchAll(/<li><b>([^<]*)<\/b>/g)].map((m) => m[1]);
  assert.equal(items.length, 6);
  assert.match(items[0], /objective record/i);
  assert.match(items[5], /run record/i);
});

test('the ten capabilities table has ten rows, in order, each marked build, integrate or platform', () => {
  const t = tableByCaption('The ten capabilities');
  assert.deepEqual(headers(t), ['Capability', 'Problem it solves', 'Own, integrate or platform', 'How it raises autonomy']);
  const rows = bodyRows(t);
  assert.equal(rows.length, 10);
  rows.forEach((r, i) => {
    const c = cells(r);
    assert.equal(c[0], CAPABILITIES[i]);
    assert.match(c[2], OWN, `row ${i} classification`);
  });
});

test('ten capabilities in full: eight columns, ten rows, inside a details element', () => {
  const t = tableByCaption('The ten capabilities in full');
  assert.deepEqual(headers(t), ['Capability', 'Software needed', 'Inputs and integrations', 'Agents may', 'Verified by', 'People intervene', 'Autonomy contribution', 'Own, integrate or platform']);
  const rows = bodyRows(t);
  assert.equal(rows.length, 10);
  rows.forEach((r, i) => {
    const c = cells(r);
    assert.equal(c.length, 8);
    assert.equal(c[0], CAPABILITIES[i]);
    assert.match(c[7], OWN, `full row ${i} classification`);
  });
  const at = section.indexOf('<caption>The ten capabilities in full</caption>');
  const open = section.lastIndexOf('<details', at);
  assert.ok(open >= 0 && section.indexOf('</details>', open) > at, 'full table is inside a details element');
  assert.ok(!/<details class="maths" open/.test(section));
});

test('the build, integrate or provided table lists the ten components and the ownership rule', () => {
  assert.match(text, /Own the rules, the permissions, the evals, the run record and the outcome definitions; rent the generators, the channels and the plumbing\./);
  const t = tableByCaption('Build, integrate or already provided');
  assert.deepEqual(headers(t), ['Component', 'Build and own', 'Integrate', 'Usually already provided by existing platforms']);
  assert.equal(bodyRows(t).length, 10);
});

test('v1 section 04 survives inside a details element with its layer table', () => {
  assert.equal((html.match(/<caption>Operating architecture, by layer<\/caption>/g) || []).length, 1);
  const at = section.indexOf('id="s04"');
  const open = section.lastIndexOf('<details class="maths">', at);
  assert.ok(open >= 0 && section.indexOf('</details>', at) > at, 's04 inside details');
  assert.match(section.slice(open, at), /The first edition's layer view/);
  assert.match(strip(elementById(html, 's04')), /one versioned policy source/);
  assert.match(strip(elementById(html, 's04')), /Skills are the second idea/);
});

test('the body links down to Appendices B, C and D from the checks and run-record rows', () => {
  for (const id of ['appendix-review', 'appendix-gate', 'appendix-evals']) assert.ok(section.includes(`href="#${id}"`), `link to #${id}`);
});

test('no to-follow marker and no vendor or product names in #build', () => {
  assert.ok(!section.includes('class="to-follow"'));
  assert.doesNotMatch(text, VENDOR_RE);
});

test('permission levels read, draft, stage, publish, spend appear in order and stage is the pilot ceiling', () => {
  const t = tableByCaption('Permission levels beside asset risk tiers');
  assert.deepEqual(headers(t), ['Permission level', 'What the agent may do', 'Allowed for tiers', 'Pilot ceiling']);
  const rows = bodyRows(t).map(cells);
  assert.deepEqual(rows.map((c) => c[0]), ['Read', 'Draft', 'Stage', 'Publish', 'Spend']);
  assert.match(rows[2][3], /Pilot ceiling/);
  for (const i of [0, 1, 3, 4]) assert.doesNotMatch(rows[i][3], /Pilot ceiling\./, `row ${i} is not the ceiling`);
  assert.match(rows[4][3], /Never in the pilot/);
  assert.match(section, /href="#s07"/, 'links the full tier definitions');
});

test('always-human list has at least seven items and links the appendix list', () => {
  const at = section.indexOf('id="always-human"');
  const ul = section.slice(at).match(/<ul>([\s\S]*?)<\/ul>/)[1];
  const items = ul.match(/<li>/g) || [];
  assert.ok(items.length >= 7, `${items.length} items`);
  assert.ok(section.slice(at, section.indexOf('<ul>', at)).includes('href="#s07"'));
});

test('smallest useful version is shown, with a pointer forward to the first workflow', () => {
  const at = section.indexOf('id="smallest-slice"');
  assert.ok(at > 0);
  const part = section.slice(at, section.indexOf('<h3 id="expansion-path"'));
  assert.match(strip(part), /launching an approved campaign in additional markets/);
  assert.ok(part.includes('href="#supply-chain"'));
  assert.ok(!/\d/.test(strip(part).replace(/\bsection 04\b/, '')), 'no digits in the slice description');
});

test('the expansion path has six rows E0 to E5 in order', () => {
  const t = tableByCaption('How the system grows from the first slice');
  assert.deepEqual(headers(t), ['Step', 'Adds', 'Autonomy level']);
  const steps = bodyRows(t).map((r) => cells(r)[0].slice(0, 2));
  assert.deepEqual(steps, ['E0', 'E1', 'E2', 'E3', 'E4', 'E5']);
});

test('the evidence stop says the design has not been run here, and carries no digits', () => {
  const stop = section.match(/<p class="evidence-stop">[\s\S]*?<\/p>/)[0];
  assert.match(strip(stop), /None of it has been run in this organisation/);
  assert.ok(!/\d/.test(strip(stop)));
});
