// Structure checks for section 02 (#autonomy), plan 07-02: THESIS-05, INTERCOM-01..04.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { elementById, strip, decode } from './helpers/html.js';
import { claims, sources } from '../site/js/data.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const section = elementById(html, 'autonomy');
const text = strip(section);

// Same pattern as test/page.test.js: tool and vendor names stay out of body sections.
const VENDOR_RE = /\b(gradial|airops|profound|adobe|firefly|midjourney|dall-?e|openai|chatgpt|anthropic|claude|gemini|google|microsoft|copilot|canva|shutterstock|runway|synthesia|jasper|salesforce|hubspot|bynder|aprimo|contentful|amazon|aws|azure|honeycomb|athena|optimizely|klarna|unilever|tiktok|linkedin|facebook|instagram|youtube|meta ads|meta platforms|sora|veo|imagen|flux\.1|black forest labs|ideogram|leonardo\.ai|stable diffusion|figma|workfront|sprinklr|celtra|persado|typeface\.ai|writer\.com|smartling|phrase tms|deepl|seismic|sitecore|bria)\b/i;

function tableByCaption(caption) {
  const tables = section.match(/<table>[\s\S]*?<\/table>/g) || [];
  const t = tables.find((x) => x.includes(`<caption>${caption}</caption>`) || x.includes(`<caption>${caption.replace(/'/g, '&#39;')}</caption>`));
  assert.ok(t, `table "${caption}"`);
  return t;
}
const bodyRows = (t) => t.slice(t.indexOf('<tbody>')).match(/<tr\b[\s\S]*?<\/tr>/g) || [];
const headers = (t) => [...t.slice(0, t.indexOf('<tbody>')).matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => decode(m[1]));

test('section 02 is titled as a question and the TOC label matches', () => {
  const h2 = section.match(/<h2 id="autonomy-h">([^<]*)<\/h2>/);
  assert.ok(h2, 'h2');
  const title = decode(h2[1]);
  assert.ok(title.endsWith('?'), title);
  const toc = html.match(/<a href="#autonomy"><span class="n">02<\/span><span>([^<]*)<\/span><\/a>/);
  assert.ok(toc, 'toc entry');
  assert.equal(decode(toc[1]), title);
});

test('the four ladder rows appear in order with their five columns', () => {
  const t = tableByCaption('Four levels of autonomy');
  assert.deepEqual(headers(t), ['Level', 'What the agent does', 'What people do', 'Justified when', 'Not justified when']);
  const rows = bodyRows(t).map((r) => decode(r.match(/<th scope="row">([^<]*)<\/th>/)[1]));
  assert.deepEqual(rows, ['Assistance', 'Agentic execution', 'Higher autonomy', 'Outcome-directed autonomy']);
  assert.ok(!/\d/.test(strip(t)), 'no digits in the ladder');
  assert.match(text, /Higher autonomy is not automatically better/);
});

test('the Intercom results table has at least eight rows, each dated, flagged, charted and tied to a Modelled claim', () => {
  const t = tableByCaption("Intercom's company-reported results");
  assert.deepEqual(headers(t), ['Measure', 'Result', 'Source and date', 'Caveat']);
  const rows = bodyRows(t);
  assert.ok(rows.length >= 8, `${rows.length} rows`);
  const ids = new Set();
  for (const r of rows) {
    const figs = [...r.matchAll(/data-fig="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(figs.length >= 1, 'a data-fig in every row');
    for (const f of figs) {
      ids.add(f);
      assert.ok(f.startsWith('ic-'), f);
      assert.equal(claims[f].grade, 'Modelled', f);
      assert.equal(claims[f].flag, 'company-reported', f);
      assert.equal(claims[f].evidence, 'observed', f);
    }
    assert.equal((r.match(/class="chip c-m"/g) || []).length, 1, 'one Modelled chip');
    assert.equal((r.match(/<span class="flag">company-reported<\/span>/g) || []).length, figs.length, 'a flag after each figure');
    const time = r.match(/<time datetime="(\d{4}-\d{2}-\d{2})">/);
    assert.ok(time, 'a time element');
    const cite = r.match(/<a class="cite" href="#(src-[^"]+)">/);
    assert.ok(cite, 'a primary source cite');
    assert.equal(sources[cite[1].slice(4)].published, time[1], `${cite[1]} date matches its source`);
  }
  assert.ok(ids.size >= 8, `${ids.size} distinct claims`);
});

test('every ic- claim is shown in the results table and cites a primary post', () => {
  const t = tableByCaption("Intercom's company-reported results");
  const icIds = Object.keys(claims).filter((k) => k.startsWith('ic-'));
  assert.ok(icIds.length >= 8);
  for (const id of icIds) {
    assert.ok(t.includes(`data-fig="${id}"`), `${id} missing from the results table`);
    assert.match(claims[id].ref, /^src-(fin-|intercom-)/, id);
  }
});

test('the principles table has three columns and the does-not-transfer list is present', () => {
  const t = tableByCaption('What transfers to marketing, and what does not');
  assert.deepEqual(headers(t), ['Intercom mechanism', 'Marketing translation', 'What does not transfer']);
  assert.ok(bodyRows(t).length >= 7);
  assert.match(text, /What does not transfer/);
});

test('required subsections are present in order', () => {
  const order = ['autonomy-ladder', 'intercom-measured', 'intercom-results', 'intercom-uncertain', 'bottleneck-moved', 'transferable-principles'];
  let at = -1;
  for (const id of order) {
    const i = section.indexOf(`<h3 id="${id}">`);
    assert.ok(i > at, `h3#${id} in order`);
    at = i;
  }
});

test('no to-follow marker, and no vendor or product names, in #autonomy', () => {
  assert.ok(!section.includes('class="to-follow"'));
  assert.doesNotMatch(text, VENDOR_RE);
  assert.match(text, /\bIntercom\b/);
});

test('mutation: the vendor guard would catch a named tool', () => {
  assert.match(strip('<p>the agent was Claude</p>'), VENDOR_RE);
});
