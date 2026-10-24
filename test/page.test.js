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

// ---- Plan 01-03: front matter, grade key, TOC, sections, numeric gate ----

const TITLES = {
  s01: 'Claim & measurement',
  s02: 'The CFO answer',
  s03: 'The factory and the content supply chain',
  s04: 'Platform and skills',
  s05: 'The 10,000-asset campaign',
  s06: 'The review agent',
  s07: 'The auto-approval gate',
  s08: 'Eval harness and telemetry',
  s09: 'The other five levers',
  s10: 'The outcome case',
  s11: 'Your numbers',
  s12: 'How this compares',
  s13: 'Adoption and Backlog 0',
  s14: 'What goes wrong',
  s15: 'Source register',
};
const SECTION_IDS = Object.keys(TITLES);

// Structural tokens only. A number that is a claim must be a data-fig span with a chip (CRED-02).
const ALLOWED_NUMERIC_TOKENS = [
  '2x', // the programme name
  '1x', // identity reference
  '2–3', // falsifier time window, locked copy
  '2026-10-24', // page date
  '10,000', // the s05 title phrase if echoed
  '1', // Figure 1 label
];

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const strip = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

function sectionHtml(id) {
  const start = html.indexOf(`<section id="${id}"`);
  assert.ok(start >= 0, `missing section ${id}`);
  const end = html.indexOf('</section>', start);
  return html.slice(start, end + '</section>'.length);
}

function metaHtml() {
  const start = html.indexOf('<div class="meta">');
  assert.ok(start >= 0, 'missing .meta');
  return html.slice(start, html.indexOf('</div>', start) + 6);
}

test('title, h1, kicker and byline', () => {
  assert.equal((html.match(/<h1/g) || []).length, 1);
  const h1 = strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)[1]).trim();
  assert.equal(title, h1);
  assert.ok(html.includes('A forward-looking teardown · projection, not retrospective'));
  assert.ok(html.includes('Vincent Lyons'));
});

test('meta grid carries the subject-org assumptions and the date', () => {
  const meta = metaHtml();
  for (const id of ['asm-revenue', 'asm-marketing-budget', 'asm-budget-share', 'asm-marketing-fte', 'asm-campaigns']) {
    assert.ok(meta.includes(`data-fig="${id}"`), `meta missing ${id}`);
  }
  assert.ok(meta.includes('2026-10-24'));
});

test('conflict-of-interest box uses the CONTEXT wording', () => {
  assert.match(html, /class="callout coi"/);
  assert.ok(html.includes('The author works at iStock/Getty Images. The page is vendor-neutral by design; where imagery sourcing or Getty v Stability is discussed, this note is repeated.'));
});

test('grade key defines three grades and a neutral flag', () => {
  const start = html.indexOf('class="legend"');
  assert.ok(start >= 0, 'missing .legend');
  const legend = html.slice(start, html.indexOf('</div>', start));
  for (const d of [
    'Published by a primary or otherwise checkable source, and the figure matches it.',
    'Derived by this page from stated assumptions; change the assumption and the number changes.',
    'A judgement with no checkable source; shown so you can discount it.',
  ]) assert.ok(legend.includes(d), `legend missing: ${d}`);
  for (const c of ['c-b', 'c-m', 'c-s']) assert.equal((legend.match(new RegExp(`class="chip ${c}"`, 'g')) || []).length, 1, c);
  assert.match(legend, /<span class="flag">/);
  assert.ok(legend.includes('It never raises a grade.'));
});

test('table of contents lists s01 to s15 in order', () => {
  const nav = html.match(/<nav[^>]*aria-label="Sections"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'missing nav[aria-label="Sections"]');
  const rows = [...nav[1].matchAll(/<a href="#(s\d\d)"><span class="n">(\d\d)<\/span><span>([^<]+)<\/span><\/a>/g)];
  assert.equal(rows.length, 15);
  rows.forEach(([, id, n, title], i) => {
    assert.equal(id, SECTION_IDS[i]);
    assert.equal(n, id.slice(1));
    assert.equal(decode(title), TITLES[id]);
  });
});

test('fifteen anchored sections with the fixed snippet', () => {
  for (const id of SECTION_IDS) {
    assert.equal((html.match(new RegExp(`<section id="${id}"`, 'g')) || []).length, 1, id);
    const s = sectionHtml(id);
    assert.ok(s.includes(`aria-labelledby="${id}-h"`), id);
    assert.ok(s.includes(`<span class="sec-num">${id.slice(1)}</span>`), id);
    const h2 = s.match(new RegExp(`<h2 id="${id}-h">([^<]*)</h2>`));
    assert.ok(h2, `${id} h2`);
    assert.equal(decode(h2[1]), TITLES[id]);
  }
});

test('skeleton sections 03 to 14 carry a scope sentence and the later note', () => {
  for (let n = 3; n <= 14; n++) {
    const id = `s${String(n).padStart(2, '0')}`;
    const s = sectionHtml(id);
    assert.ok(s.includes('<p class="later">Coming in a later update.</p>'), id);
    const others = [...s.matchAll(/<p(?![^>]*class="later")[^>]*>/g)];
    assert.ok(others.length >= 1, `${id} has no scope sentence`);
  }
});

test('answer-first paragraph is short and states the falsifier', () => {
  const text = strip(sectionHtml('answer'));
  assert.ok(text.split(' ').length <= 120, `answer is ${text.split(' ').length} words`);
  assert.match(text, /falsifier|false/);
  // The falsifier is a disjunction (code review WR-04): flat outcomes alone falsify the claim.
  assert.ok(text.includes('do not improve, or first-pass compliance falls, within 2–3 quarters'), 'answer falsifier must use OR');
  assert.ok(!/do not improve and first-pass compliance falls/.test(html), 'AND falsifier wording is back');
});

test('landmarks and CSP hygiene', () => {
  for (const t of ['<header', '<nav', '<main id="main"', '<footer']) assert.ok(html.includes(t), t);
  assert.ok(!html.includes(' style="'), 'inline style attribute');
});

test('vendor names stay inside s12 and s15', () => {
  let rest = html;
  for (const id of ['s12', 's15']) rest = rest.replace(sectionHtml(id), '');
  assert.ok(!/gradial|airops|profound/i.test(rest));
});

test('numeric gate: no ungraded numerals in the frame', () => {
  const parts = [metaHtml(), sectionHtml('answer'), sectionHtml('s01'), sectionHtml('s02')];
  for (const part of parts) {
    const cleaned = strip(
      part
        .replace(/<span data-fig="[^"]+">[^<]*<\/span>/g, ' ')
        .replace(/<a class="chip[^"]*"[^>]*>[^<]*<\/a>/g, ' ')
        .replace(/<span class="sec-num">[^<]*<\/span>/g, ' ')
        .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
        .replace(/Figure \d+/g, ' '),
    );
    for (const tok of cleaned.match(/\d[\d,.–-]*%?x?/g) || []) {
      const t = tok.replace(/[.,–-]+$/, '');
      assert.ok(ALLOWED_NUMERIC_TOKENS.includes(t), `ungraded numeral "${tok}" in: ${cleaned.slice(0, 80)}`);
    }
  }
});

// ---- Plan 01-04: section 01 ----

const FALSIFIER = 'If approved-live variants per head double but holdout-measured conversion/CAC does not improve, or first-pass compliance falls, within 2–3 quarters, the 2x claim is false for that org.';
const NOT_MEAN = 'It does not mean twice as many assets generated, twice the budget, or half the team. It means twice as many approved-and-live asset-variants per marketing head per quarter, within a flat total marketing budget, with outcomes that hold.';

test('s01 holds both callouts verbatim and the front matter does not duplicate them', () => {
  const s = sectionHtml('s01');
  assert.ok(s.includes('What 2x does not mean'));
  assert.ok(s.includes(NOT_MEAN));
  assert.ok(s.includes('Falsifier'));
  assert.ok(s.includes(FALSIFIER));
  assert.equal(html.split('the 2x claim is false for that org').length - 1, 1);
  assert.equal(html.split('What 2x does not mean').length - 1, 1);
});

test('s01 metric trio carries the six figures', () => {
  const s = sectionHtml('s01');
  const m = s.match(/<div class="metric-trio">[\s\S]*?<\/div>\s*(?=<p|<div class="table-scroll)/);
  assert.ok(m, 'no metric-trio');
  for (const id of ['output-per-head-base', 'output-per-head-scaled', 'concepts-base', 'concepts-scaled', 'vpc-base', 'vpc-scaled']) {
    assert.ok(s.includes(`data-fig="${id}"`), id);
  }
  assert.ok(s.includes('data-fig="asm-approval-yield"'));
  assert.ok(s.includes('data-fig="weighted-ratio"'));
  assert.match(s, /sensitivity/);
});

test('s01 six-lever table', () => {
  const s = sectionHtml('s01');
  assert.ok(s.includes('<caption>The six levers</caption>'));
  assert.match(s, /<div class="table-scroll"[^>]*role="region"[^>]*>\s*<table>\s*<caption>The six levers/);
  const body = s.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, 6);
  rows.forEach((r, i) => {
    assert.match(r[1], new RegExp(`<a class="chip c-[ms]" href="#asm-lever-0${i + 1}-evidence">(Modelled|Speculative)</a>\\s*</td>\\s*$`));
  });
});

// ---- Plan 01-05: section 02 ----

const AI_FLOOR = "AI spend is a floor, not a target. Teams that are rewarded for spending on AI will spend on AI (Goodhart's law); the measure that matters is the cost of an approved, live asset.";
const GARTNER_CAVEAT = 'Secondary source: the Gartner 7.8% figure is reported by trade press; we could not confirm the primary release.';

test('s02 states flat budget, scope, six components, AI-spend floor and review constraint', () => {
  const s = sectionHtml('s02');
  const text = strip(s);
  assert.ok(text.includes(AI_FLOOR), 'AI spend copy');
  assert.ok(text.includes('excludes media'));
  for (const c of ['generation', 'review', 'rework', 'tooling', 'rights', 'storage']) assert.ok(text.includes(c), c);
  for (const id of ['gartner-share-2025', 'gartner-share-2026', 'gartner-sample-2025', 'cpa-base', 'cpa-scaled', 'cpa-change',
    'total-cost-base', 'total-cost-scaled', 'budget-share-base', 'budget-share-scaled', 'ai-spend-base', 'ai-spend-scaled',
    'ai-spend-ratio', 'break-even-auto-approval', 'asm-approval-yield', 'asm-auto-approval']) {
    assert.ok(s.includes(`data-fig="${id}"`), id);
  }
  assert.match(s, /class="callout/);
  if (claims['gartner-share-2026'].grade === 'Modelled') assert.ok(text.includes(GARTNER_CAVEAT));
  else assert.ok(!text.includes(GARTNER_CAVEAT));
});

test('answer carries the cost per asset and stays short', () => {
  const a = sectionHtml('answer');
  assert.ok(a.includes('data-fig="cpa-base"'));
  assert.ok(a.includes('data-fig="cpa-scaled"'));
  assert.ok(strip(a).split(' ').length <= 120);
});

test('gartner 2026 source row is registered', () => {
  assert.equal((html.match(/id="src-gartner-2026-cmo-spend"/g) || []).length, 1);
});

// ---- Code review CR-02: flat total budget, with the production cost rise shown and its funding graded ----

test('answer and s02 show the production cost rise and how a flat total budget funds it', () => {
  const a = sectionHtml('answer');
  assert.ok(a.includes('flat total marketing budget'));
  assert.ok(a.includes('data-fig="total-cost-change"'));
  assert.ok(a.includes('href="#asm-reallocation"'));
  assert.ok(!/same money|at a flat budget/.test(html), 'unqualified flat-budget wording is back');
  const s = sectionHtml('s02');
  for (const id of ['total-cost-delta', 'total-cost-change', 'budget-share-delta', 'asm-reallocation']) {
    assert.ok(s.includes(`data-fig="${id}"`), id);
  }
});

test('answer cites the same Gartner year the model uses for the budget share (IN-07)', () => {
  const a = sectionHtml('answer');
  assert.ok(a.includes('data-fig="gartner-share-2026"'));
  assert.ok(!a.includes('data-fig="gartner-share-2025"'));
  assert.equal(assumptions['asm-budget-share'].display, claims['gartner-share-2026'].display);
});
