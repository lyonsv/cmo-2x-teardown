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

const FIG_RE = /<span data-fig="([^"]+)">([^<]*)<\/span>/g;
const CHIP_CLASS = { Benchmark: 'c-b', Modelled: 'c-m', Speculative: 'c-s' };

test('every data-fig matches data.js display', () => {
  const found = [...html.matchAll(FIG_RE)];
  assert.ok(found.length > 0, 'no data-fig spans');
  for (const [, id, text] of found) {
    const e = figEntry(id);
    assert.ok(e, `unknown data-fig ${id}`);
    assert.equal(text, e.display, `${id} display drifted`);
  }
  // Code review WR-07: a data-fig the regex cannot parse (extra attributes,
  // nested markup) must fail, not be silently skipped. Every data-fig is either a
  // plain span matched above or an SVG <text> label checked in figure.test.js.
  const all = (html.match(/\bdata-fig="/g) || []).length;
  const svgText = (html.match(/<text [^>]*\bdata-fig="/g) || []).length;
  assert.equal(found.length + svgText, all, 'some data-fig elements were not checked');
});

// UI-SPEC chip density rule. A chip governs the numbers it sits with: in prose the
// first number of each claim source in a paragraph carries one linked chip; in a
// table each row carries one linked chip in its last cell; in the s15 registers each
// row carries one unlinked grade chip. Grade, ref and display are still checked for
// every data-fig (the drift checks above and the chip checks below).
const CHIP_AFTER = /^\s*<a class="chip (c-[bms])" href="#([^"]+)">([^<]+)<\/a>/;

function collectUnits() {
  let work = html.replace(/<svg[\s\S]*?<\/svg>/g, '');
  const total = (work.match(FIG_RE) || []).length;
  const units = [];
  const take = (re, kind) => {
    work = work.replace(re, (m) => { units.push({ kind, html: m }); return ' '; });
  };
  take(/<tr id="(?:src|asm)-[^"]+">[\s\S]*?<\/tr>/g, 'register');
  take(/<tr\b[^>]*>[\s\S]*?<\/tr>/g, 'row');
  take(/<li\b[^>]*>[\s\S]*?<\/li>/g, 'prose');
  take(/<p\b[^>]*>[\s\S]*?<\/p>/g, 'p');
  take(/<div><span class="lbl">[\s\S]*?<\/div>/g, 'prose');
  take(/<caption>[\s\S]*?<\/caption>/g, 'caption');
  return { units, total };
}

test('governing chip rule (UI-SPEC chip density)', () => {
  const { units, total } = collectUnits();
  const counted = units.reduce((n, u) => n + (u.html.match(FIG_RE) || []).length, 0);
  assert.equal(counted, total, 'a data-fig sits outside every prose, table or register unit');
  const answerP = sectionHtml('answer');
  for (const u of units) {
    const figs = [...u.html.matchAll(FIG_RE)];
    if (u.kind === 'p' || u.kind === 'prose') {
      const seen = new Set();
      for (const m of figs) {
        const e = figEntry(m[1]);
        const chip = u.html.slice(m.index + m[0].length).match(CHIP_AFTER);
        if (!seen.has(e.ref)) {
          seen.add(e.ref);
          assert.ok(chip, `${m[1]}: first number of ${e.ref} in a paragraph needs its chip`);
          assert.equal(chip[3], e.grade, `${m[1]}: chip word`);
          assert.equal(chip[1], CHIP_CLASS[e.grade], `${m[1]}: chip colour class`);
          assert.equal(chip[2], e.ref, `${m[1]}: chip href`);
        } else {
          assert.ok(!(chip && chip[2] === e.ref), `${m[1]}: repeated chip for ${e.ref} in one paragraph`);
        }
      }
      if (u.kind === 'p') {
        const hrefs = [...u.html.matchAll(/<a class="chip [^"]+" href="#([^"]+)"/g)].map((m) => m[1]);
        assert.equal(new Set(hrefs).size, hrefs.length, `repeated chip href in: ${strip(u.html).slice(0, 60)}`);
        const max = answerP.includes(u.html) ? 4 : 3;
        assert.ok(hrefs.length <= max, `${hrefs.length} chips (max ${max}) in: ${strip(u.html).slice(0, 60)}`);
      }
    } else if (u.kind === 'row') {
      const linked = [...u.html.matchAll(/<a class="chip (c-[bms])" href="#([^"]+)">([^<]+)<\/a>/g)];
      assert.equal((u.html.match(/class="chip /g) || []).length, linked.length, 'row chip must be a link');
      assert.ok(!/<td class="num">(?:(?!<\/td>)[\s\S])*class="chip /.test(u.html), 'chip inside td.num');
      if (figs.length) {
        assert.equal(linked.length, 1, `row with data-figs needs exactly one chip: ${strip(u.html).slice(0, 60)}`);
        const lastTd = [...u.html.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].pop()[1];
        assert.ok(lastTd.includes('class="chip '), 'row chip must be in the last cell');
        for (const m of figs) {
          const e = figEntry(m[1]);
          assert.equal(linked[0][2], e.ref, `${m[1]}: row chip href`);
          assert.equal(linked[0][3], e.grade, `${m[1]}: row chip word`);
          assert.equal(linked[0][1], CHIP_CLASS[e.grade], `${m[1]}: row chip class`);
        }
      } else {
        assert.ok(linked.length <= 1, 'row without data-figs has at most one chip');
      }
    } else if (u.kind === 'register') {
      assert.ok(!u.html.includes('<a class="chip'), 'register chip must not link to its own row');
      const spans = [...u.html.matchAll(/<span class="chip (c-[bms])">(Benchmark|Modelled|Speculative)<\/span>/g)];
      assert.equal(spans.length, 1, `register row needs one unlinked grade chip: ${u.html.slice(0, 40)}`);
      assert.equal(spans[0][1], CHIP_CLASS[spans[0][2]]);
      const id = u.html.match(/<tr id="([^"]+)"/)[1];
      const grade = id.startsWith('src-') ? sources[id.slice(4)].grade : assumptions[id].grade;
      assert.equal(spans[0][2], grade, `${id}: register grade`);
    }
  }
  // Caption figures are labels: the same id must be governed by a body row of the table.
  for (const t of html.match(/<table>[\s\S]*?<\/table>/g) || []) {
    const cap = (t.match(/<caption>[\s\S]*?<\/caption>/) || [''])[0];
    const body = t.slice(t.indexOf('<tbody>'));
    for (const m of cap.matchAll(FIG_RE)) assert.ok(body.includes(`data-fig="${m[1]}"`), `caption figure ${m[1]} not in a body row`);
  }
});

test('every chip outside the legend and s15 registers is a link', () => {
  const rest = html
    .replace(/<div class="legend">[\s\S]*?<\/dl>/, '')
    .replace(/<tr id="(?:src|asm)-[^"]+">[\s\S]*?<\/tr>/g, '');
  assert.ok(!rest.includes('<span class="chip'), 'unlinked chip outside the legend and registers');
});

test('every chip colour class matches its grade word', () => {
  const chips = [...html.matchAll(/<(a|span) class="chip ([^"]+)"[^>]*>([^<]+)<\/\1>/g)];
  assert.ok(chips.length > 0);
  for (const [, , cls, word] of chips) assert.equal(cls, CHIP_CLASS[word], `chip "${word}" has class ${cls}`);
  assert.equal(chips.length, (html.match(/class="chip /g) || []).length, 'a chip has markup the check cannot parse');
});

test('every in-page href resolves to an id', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(target), `dead anchor #${target}`);
  }
});

function registerRow(id) {
  const start = html.indexOf(`<tr id="${id}">`);
  assert.ok(start >= 0, `missing register row ${id}`);
  return html.slice(start, html.indexOf('</tr>', start) + '</tr>'.length);
}


test('registers cover every source and assumption', () => {
  for (const id of Object.keys(assumptions)) assert.ok(html.includes(`<tr id="${id}">`), id);
  for (const k of Object.keys(sources)) assert.ok(html.includes(`<tr id="src-${k}">`), k);
});

// Code review WR-06: register text is duplicated by hand from data.js, so every
// field a reader relies on (who, when, where, why) is compared with data.js.
test('source register rows match data.js field by field', () => {
  for (const [k, src] of Object.entries(sources)) {
    const row = registerRow(`src-${k}`);
    const text = decode(row);
    for (const f of ['title', 'publisher', 'published', 'accessed', 'bias', 'read_via']) {
      assert.ok(text.includes(src[f]), `src-${k}: ${f} drifted`);
    }
    assert.ok(row.includes(`<td>${src.accessed}</td>`), `src-${k}: accessed cell`);
    assert.ok(row.includes(`<td>${src.publisher}</td>`), `src-${k}: publisher cell`);
    assert.ok(row.includes(`href="${src.url}"`), `src-${k}: url drifted`);
    assert.ok(row.includes(`<th scope="row" class="id">src-${k}</th>`), `src-${k}: row header`);
    assert.ok(!row.includes('<a class="chip'), `src-${k}: register chip must not link`);
    // WR-07: Grade and Flag cells come from data.js, not from a test-local table.
    const tds = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    assert.equal(tds[3], `<span class="chip ${CHIP_CLASS[src.grade]}">${src.grade}</span>`, `src-${k}: grade cell`);
    assert.equal(tds[4], src.flag ?? 'none', `src-${k}: flag cell`);
  }
});

test('assumption register rows match data.js label, display, grade and basis', () => {
  for (const [id, e] of Object.entries(assumptions)) {
    const row = registerRow(id);
    const text = decode(row);
    assert.ok(row.includes(`<td>${e.label}</td>`), `${id}: label drifted`);
    assert.ok(text.includes(e.basis), `${id}: basis drifted`);
    assert.ok(row.includes(`<span data-fig="${id}">`), `${id}: value is not a data-fig span`);
    assert.ok(row.includes(`<td><span class="chip ${CHIP_CLASS[e.grade]}">${e.grade}</span></td>`), `${id}: grade cell`);
    const value = row.match(new RegExp(`<td><span data-fig="${id}">([^<]*)</span></td>`));
    assert.ok(value, `${id}: value cell must be exactly the data-fig span`);
    assert.equal(decode(value[1]), e.display, `${id}: value cell`);
    assert.ok(row.includes(`<th scope="row" class="id">${id}</th>`), `${id}: row header`);
  }
});

test('lever evidence rows do not repeat one sentence in Value and Basis', () => {
  for (let n = 1; n <= 6; n++) {
    const id = `asm-lever-0${n}-evidence`;
    const cells = [...registerRow(id).matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => strip(m[1]));
    assert.notEqual(cells[1], cells[3], `${id}: Value equals Basis`);
  }
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
  s03: 'The factory model',
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

// Plans 02-02 to 02-06 remove the sections they fill; the final list is s09..s14.
const SKELETON_IDS = ['s09', 's10', 's11', 's12', 's13', 's14'];

test('skeleton ids are s09 to s14', () => {
  assert.deepEqual(SKELETON_IDS, ['s09', 's10', 's11', 's12', 's13', 's14']);
});

test('skeleton sections carry a scope sentence and the later note', () => {
  for (const id of SKELETON_IDS) {
    const s = sectionHtml(id);
    assert.ok(s.includes('<p class="later">Coming in a later update.</p>'), id);
    const others = [...s.matchAll(/<p(?![^>]*class="later")[^>]*>/g)];
    assert.ok(others.length >= 1, `${id} has no scope sentence`);
  }
});

test('s12 stub', () => {
  const s = strip(sectionHtml('s12'));
  assert.ok(s.includes('This section will compare tool categories and, in this section only, named vendors, with every claim sourced and dated.'));
  assert.ok(!s.includes('without naming them here'));
});

test('copy nits from the Phase 1 UI review', () => {
  const a = strip(sectionHtml('answer'));
  assert.ok(!a.includes('it is not rising'));
  assert.ok(a.includes('has flatlined'));
  const s = sectionHtml('s02');
  assert.ok(s.includes('<h3>Budget: flat in total, not in production</h3>'));
  assert.ok(!s.includes('<h3>Flat budget</h3>'));
});

test('s01 metric trio labels are Label style with no line break', () => {
  const trio = sectionHtml('s01').match(/<div class="metric-trio">[\s\S]*?<\/div>\s*<p/)[0];
  assert.ok(!trio.includes('<br>'));
  assert.equal((trio.match(/<span class="lbl">/g) || []).length, 3);
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

// Getty and Stability are named by design (conflict-of-interest note, s05), so they are not listed.
// Code review IN-04: extended with ad-platform, model, DAM and creative-tool names.
// Ordinary English words that are also product names (writer, typeface, meta,
// flux) are matched only in their branded forms to avoid false positives.
const VENDOR_RE = /\b(gradial|airops|profound|adobe|firefly|midjourney|dall-?e|openai|chatgpt|anthropic|claude|gemini|google|microsoft|copilot|canva|shutterstock|runway|synthesia|jasper|salesforce|hubspot|bynder|aprimo|contentful|amazon|aws|azure|honeycomb|athena|optimizely|klarna|unilever|tiktok|linkedin|facebook|instagram|youtube|meta ads|meta platforms|sora|veo|imagen|flux\.1|black forest labs|ideogram|leonardo\.ai|stable diffusion|figma|workfront|sprinklr|celtra|persado|typeface\.ai|writer\.com|smartling|phrase tms|deepl|seismic|sitecore|bria)\b/i;

test('no vendor names outside s12 and s15, apart from the COI notes and the Getty line (IN-04)', () => {
  let rest = html.replace(/<head>[\s\S]*?<\/head>/, '');
  for (const id of ['s12', 's15']) rest = rest.replace(sectionHtml(id), '');
  rest = rest.replace(/<div class="callout coi">[\s\S]*?<\/div>/g, ' ');
  const getty = (rest.match(/<p\b[^>]*>[\s\S]*?<\/p>/g) || []).filter((p) => strip(p).startsWith('Getty v Stability'));
  assert.equal(getty.length, 1, 'exactly one Getty line is exempt');
  rest = rest.replace(getty[0], ' ');
  const m = strip(rest).match(VENDOR_RE);
  assert.ok(!m, `page names a vendor outside s12/s15: ${m && m[0]}`);
});

test('Intercom exactly once outside s12 and s15, in s06', () => {
  let rest = html;
  for (const id of ['s12', 's15']) rest = rest.replace(sectionHtml(id), '');
  assert.equal((strip(rest).match(/\bintercom\b/gi) || []).length, 1);
  const s6 = sectionHtml('s06');
  assert.ok(strip(s6).replace(/\s+([.,;])/g, '$1').includes("This is the equivalent of Intercom's review agent, which inspired the design described here."));
  assert.ok(s6.includes('<a href="#src-intercom-2x-teardown">Intercom\'s review agent</a>'));
});

function regionHtml(open, close) {
  const start = html.indexOf(open);
  assert.ok(start >= 0, `missing ${open}`);
  return html.slice(start, html.indexOf(close, start) + close.length);
}

// The gate covers every reader-facing region: masthead, meta, answer, legend, all
// fifteen sections and the footer (code review WR-06). The nav is excluded: its
// numbers are section numbers, checked by the TOC test.
// Exemption: register rows in s15 quote source titles, IDs, labels and bases that
// contain numerals ("15.3%", "2,080", "asm-lever-01"). Those rows are compared
// field by field with data.js by the register tests above, and their value cells
// are data-fig spans checked by the data-fig test, so they are removed here.
test('time elements carry ISO dates that appear in a source register row', () => {
  const rows = html.match(/<tr id="src-[^"]+">[\s\S]*?<\/tr>/g) || [];
  for (const [, d] of html.matchAll(/<time datetime="([^"]*)">/g)) {
    assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isFinite(Date.parse(d)), `bad date ${d}`);
    assert.ok(rows.some((r) => r.includes(d)), `${d} is not in a source register row`);
  }
  // IN-06: the numeric gate strips <time> with its text, so the text must be the date itself.
  const times = [...html.matchAll(/<time\b([^>]*)>([^<]*)<\/time>/g)];
  assert.equal(times.length, (html.match(/<time\b/g) || []).length, 'a <time> element the check cannot parse');
  for (const [, attrs, text] of times) {
    const d = attrs.match(/^ datetime="([^"]*)"$/);
    assert.ok(d, `<time> must carry only a datetime attribute: ${attrs}`);
    assert.equal(text, d[1], `<time> text "${text}" differs from its datetime`);
  }
});

test('numeric gate: no ungraded numerals anywhere on the page', () => {
  const parts = [
    regionHtml('<header class="masthead">', '</header>'), metaHtml(), sectionHtml('answer'),
    regionHtml('<div class="legend">', '</dl>'),
    ...SECTION_IDS.map((id) => sectionHtml(id).replace(/<tr id="(?:src|asm)-[^"]+">[\s\S]*?<\/tr>/g, ' ')),
    regionHtml('<footer>', '</footer>'),
  ];
  for (const part of parts) {
    const cleaned = strip(
      part
        .replace(/<a href="#s\d\d">[^<]*<\/a>/g, ' ') // in-page section cross-links
        .replace(/<time datetime="\d{4}-\d{2}-\d{2}">[^<]*<\/time>/g, ' ') // ISO dates, checked below
        .replace(/<span data-fig="[^"]+">[^<]*<\/span>/g, ' ')
        .replace(/<a class="chip[^"]*"[^>]*>[^<]*<\/a>/g, ' ')
        .replace(/<span class="sec-num">[^<]*<\/span>/g, ' ')
        .replace(/<h2 id="s\d\d-h">[^<]*<\/h2>/g, ' ') // section titles are locked by the TITLES test
        .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
        .replace(/Figure \d+/g, ' '),
    ).replace(/\bT[0-3]\b/g, ' '); // tier names
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

test('review-constraint copy separates the utilisation target from capacity (WR-03)', () => {
  const s = sectionHtml('s02');
  for (const id of ['break-even-auto-approval', 'asm-target-utilisation', 'capacity-auto-approval']) {
    assert.ok(s.includes(`data-fig="${id}"`), id);
  }
  assert.ok(claims['capacity-auto-approval'].value < claims['break-even-auto-approval'].value);
  assert.ok(!/falls short of the break-even share, review capacity is exceeded/.test(s));
});

// ---- Plan 02-02: s03 factory model and s04 platform ----

const PROSE_BUDGET = { s03: [400, 700], s04: [400, 700], s05: [400, 700], s06: [400, 700], s07: [400, 700], s08: [400, 700] };

test('section prose budgets', () => {
  for (const [id, [lo, hi]] of Object.entries(PROSE_BUDGET)) {
    const s = sectionHtml(id).replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<table>[\s\S]*?<\/table>/g, ' ');
    const parts = s.match(/<(p|li|figcaption)\b[^>]*>[\s\S]*?<\/\1>/g) || [];
    const words = strip(parts.join(' ')).split(' ').filter(Boolean).length;
    assert.ok(words >= lo && words <= hi, `${id} has ${words} prose words (want ${lo}-${hi})`);
  }
});

test('s03 factory model', () => {
  const s = sectionHtml('s03');
  const first = s.slice(s.indexOf('</div>')).match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  assert.equal(strip(first[1]), 'A marketing organisation scales by deriving variants from a few human-directed concepts, not by asking a model for ten thousand originals.');
  assert.ok(!s.includes('<p class="later">'));
  const t = strip(s).toLowerCase();
  assert.ok(t.includes('content supply chain') && t.includes('derive'));
});

test('s04 layered architecture', () => {
  const s = sectionHtml('s04');
  assert.ok(!s.includes('<svg'));
  assert.ok(!s.includes('<p class="later">'));
  assert.match(s, /<div class="table-scroll" role="region" aria-label="[^"]+" tabindex="0">/);
  assert.ok(s.includes('<caption>Operating architecture, by layer</caption>'));
  const head = [...s.match(/<thead>[\s\S]*?<\/thead>/)[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => strip(m[1]));
  assert.deepEqual(head, ['Layer', 'What it does', 'Tool category', 'Reads / writes']);
  const body = s.match(/<tbody>[\s\S]*?<\/tbody>/)[0];
  const rows = body.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g);
  assert.equal(rows.length, 10);
  const names = rows.map((r) => strip(r.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]));
  assert.deepEqual(names, ['Policy source', 'Brief and concepts', 'Generation', 'Derivation and rendering', 'Review agent', 'Auto-approval gate', 'Eval harness and telemetry', 'Asset manifest', 'Activation', 'Measurement']);
  assert.ok(rows[0].startsWith('<tr class="shared">'));
  const lastCell = [...rows[0].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].pop()[1];
  assert.ok(strip(lastCell).includes('Read by generator and reviewer; one versioned source'));
  const table = strip(body).toLowerCase();
  for (const w of ['intent', 'policy', 'build', 'review', 'eval harness', 'system of record', 'activation', 'measurement']) assert.ok(table.includes(w), w);
  const prose = strip(s.replace(/<table>[\s\S]*?<\/table>/, ' ')).toLowerCase();
  assert.ok(prose.includes('versioned') && prose.includes('skills'));
  for (const c of body.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/g)) {
    assert.ok(strip(c).split(' ').length <= 20, `cell over 20 words: ${strip(c)}`);
  }
});

// ---- Plan 02-03: s05 variant matrix ----

test('s05 derive lead and matrix table', () => {
  const s = sectionHtml('s05');
  const first = s.slice(s.indexOf('</div>')).match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  assert.equal(strip(first[1]), 'Derive, do not generate: four master concepts become about 12,000 Modelled variants through templating, localisation and feed rendering, and most land in low-risk tiers.');
  assert.ok(first[1].includes('data-fig="matrix-total"'));
  assert.ok(!s.includes('<p class="later">'));
  assert.match(s, /<div class="table-scroll" role="region" aria-label="[^"]+" tabindex="0">/);
  const cap = s.match(/<caption>([\s\S]*?)<\/caption>/)[1];
  assert.equal(strip(cap), 'Worked example: one campaign, about 12,000 derived variants');
  assert.ok(cap.includes('data-fig="matrix-total"'));
  const table = s.match(/<table>[\s\S]*?<\/table>/)[0];
  const head = [...table.match(/<thead>[\s\S]*?<\/thead>/)[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => strip(m[1]));
  assert.deepEqual(head, ['Factor', 'Count', 'Applies to', 'Variants after factor', 'Grade']);
  const rows = table.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g);
  const names = rows.map((r) => strip(r.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]));
  // CR-02: the matrix counts derived variants before the gate; approved-live is shown at the approval yield.
  assert.deepEqual(names, ['Master concepts', 'Sizes', 'Channels', 'Locales', 'Audiences', 'Tests', 'Feed items', 'Total derived variants, before the gate', 'Approved-live at the approval yield']);
  assert.ok(rows[7].startsWith('<tr class="total">'));
  assert.ok(rows[8].includes('data-fig="matrix-approved"') && rows[8].includes('data-fig="asm-approval-yield"'));
  assert.ok(rows[8].includes('<a class="chip c-m" href="#asm-approval-yield">Modelled</a>'));
  assert.ok(!/approved-live/i.test(strip(rows.slice(0, 8).join(' '))), 'pre-gate rows must not be labelled approved-live');
  for (const r of rows) {
    const tds = [...r.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/g)];
    assert.equal(tds.length, 4);
    for (const t of tds.slice(0, 3)) assert.equal(t[1].trim(), 'class="num"');
  }
  ['sizes', 'channels', 'locales', 'audiences', 'tests', 'feeds'].forEach((id, i) => {
    for (const k of ['count', 'applies', 'variants']) assert.ok(rows[i + 1].includes(`data-fig="matrix-${id}-${k}"`), `${id} ${k}`);
  });
  assert.equal(strip([...rows[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)][1][1]), 'all');
  assert.ok(rows[7].includes('data-fig="matrix-total"'));
  const total = Number(strip(rows[7].match(/data-fig="matrix-total">([^<]*)</)[1]).replace(/,/g, ''));
  assert.ok(total >= 10000 && total <= 13000);
  const after = strip(s.slice(s.indexOf('</table>')));
  // WR-10: independence is an illustrative simplification, and the total is an upper bound.
  assert.ok(/treated as independent for illustration/.test(after) && /upper-bound sketch/.test(after));
  assert.ok(!/no variant is (double counted|counted twice)/.test(after) && !/no variant is counted twice/.test(assumptions['asm-matrix-independence'].basis), 'unsupported no-double-count claim is back');
  assert.ok(/rendered for all five channels/.test(assumptions['asm-matrix-channels'].basis), 'channels wording matches 1 + applies x (count - 1)');
  const tail = s.slice(s.indexOf('</table>'));
  assert.ok(tail.includes('data-fig="matrix-per-concept"') && tail.includes('data-fig="avg-campaign-variants"'));
});

// ---- Plan 02-04: s05 imagery sourcing, Getty line, personalisation ----

const COI_S05 = 'The author works at iStock/Getty Images. This page is vendor-neutral by design; the table below sets out three routes to imagery without ranking them.';

function imageryTable() {
  const s = sectionHtml('s05');
  const m = s.match(/<table>\s*<caption>Imagery sourcing: three routes<\/caption>[\s\S]*?<\/table>/);
  assert.ok(m, 'imagery table missing');
  return { s, table: m[0], at: s.indexOf(m[0]) };
}

test('s05 COI note sits directly above the imagery table', () => {
  const s = sectionHtml('s05');
  const m = s.match(/<div class="callout coi">\s*<span class="lbl">COI note<\/span>\s*<p>([\s\S]*?)<\/p>\s*<\/div>(\s*)<div class="table-scroll"/);
  assert.ok(m, 'COI callout must be immediately followed by the table region');
  assert.equal(strip(m[1]), COI_S05);
  const before = s.slice(0, s.indexOf('<div class="callout coi">')).trimEnd();
  assert.ok(before.endsWith('</p>'), 'a lead-in paragraph must come immediately before the callout');
  const { table } = imageryTable();
  assert.ok(s.indexOf(m[0]) < s.indexOf(table));
});

test('imagery table is neutral', () => {
  const { table } = imageryTable();
  const head = [...table.match(/<thead>[\s\S]*?<\/thead>/)[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => strip(m[1]));
  assert.deepEqual(head, ['Criterion', 'Retrieve approved', 'License', 'Generate', 'Basis']);
  const rows = table.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g);
  assert.deepEqual(rows.map((r) => strip(r.match(/<th scope="row">([\s\S]*?)<\/th>/)[1])), ['Rights', 'Indemnity', 'Copyrightability', 'Cost visibility', 'Speed']);
  for (const r of rows) {
    assert.equal((r.match(/class="chip /g) || []).length, 1, 'one chip per row');
    const last = [...r.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].pop()[1];
    assert.ok(last.includes('class="chip '), 'chip in last cell');
  }
  assert.ok(!/<td\s+class=/.test(table), 'td with a class attribute');
  const t = strip(table).toLowerCase();
  for (const w of ['recommended', 'best', 'winner', 'preferred']) assert.ok(!t.includes(w), w);
  for (const c of table.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/g)) {
    assert.ok(strip(c).split(' ').length <= 20, `cell over 20 words: ${strip(c)}`);
  }
});

test('one dated Getty v Stability line', () => {
  const { s, table } = imageryTable();
  const text = strip(s.replace(/<svg[\s\S]*?<\/svg>/g, ' '));
  assert.equal((text.match(/Getty v Stability/g) || []).length, 1);
  const after = s.slice(s.indexOf(table) + table.length);
  const p = (after.match(/<p\b[^>]*>[\s\S]*?<\/p>/g) || []).find((x) => strip(x).includes('Getty v Stability'));
  assert.ok(p, 'Getty line must follow the table');
  assert.ok(p.includes('<time datetime="2025-11-04">'));
  assert.ok(strip(p).includes('permission to appeal'));
  // WR-05: graded and linked to the source actually read; no unsourced US clause.
  assert.ok(p.includes('<a class="chip c-m" href="#src-ailawsuittracker-getty-uk">Modelled</a>'));
  assert.ok(!/California|refiled|US action/.test(strip(p)), 'unsourced US-action clause is back');
  assert.ok(p.includes('<a href="#s14">section 14</a>'));
  assert.ok(strip(p).replace(/\s+([.,;])/g, '$1').includes('Full treatment in section 14.'));
});

test('personalisation and feeds block', () => {
  const s = sectionHtml('s05');
  const text = strip(s);
  const lower = text.toLowerCase();
  for (const w of ['dynamic creative', 'catalogue', 'feed']) assert.ok(lower.includes(w), w);
  assert.ok(s.includes('data-fig="nyu-ctr-lift"') && s.includes('data-fig="nyu-disclosure-drop"'));
  assert.match(text, /up to 19%/);
  const first = s.match(/<span data-fig="nyu-ctr-lift">[^<]*<\/span>\s*<a class="chip c-b" href="#src-nyu-emory-ai-ads-2025">Benchmark<\/a>/);
  assert.ok(first, 'nyu-ctr-lift must be followed by its Benchmark chip');
  for (const bad of ['3.73', '4.44', '2.56', '685', '105,999']) assert.ok(!s.includes(bad), bad);
  const CAVEAT = 'Secondary source: reported in trade press; we could not confirm the primary paper.';
  if (claims['nyu-ctr-lift'].grade === 'Modelled') assert.ok(text.includes(CAVEAT));
  else assert.ok(!text.includes(CAVEAT));
});

// ---- Plan 02-05: s06 review agent and s07 tier ladder ----

test('s06 review agent rules', () => {
  const s = sectionHtml('s06');
  const ul = s.match(/<ul class="rules">[\s\S]*?<\/ul>/);
  assert.ok(ul, 'ul.rules missing');
  const t = strip(ul[0]).toLowerCase();
  for (const w of ['rule id', 'asset manifest', 'bounded fix loop', 'escalate', 'never lower', 'self-report', 'could not check', 'different model']) assert.ok(t.includes(w), w);
  const datum = (s.match(/<p\b[^>]*>[\s\S]*?<\/p>/g) || []).filter((p) => p.includes('data-fig="ref-auto-approved-share"'));
  assert.equal(datum.length, 1);
  const p = datum[0];
  assert.ok(p.includes('data-fig="ref-bot-approval-rate"'));
  assert.match(p, /<span data-fig="ref-auto-approved-share">[^<]*<\/span>\s*<a class="chip c-m" href="#src-intercom-2x-teardown">Modelled<\/a>\s*<span class="flag">company-reported<\/span>/);
  assert.ok(/\bcode\b/.test(strip(p)), 'must say the reference reviews code');
  const rest = html.replace(sectionHtml('s15'), '').replace(p, '');
  assert.ok(!rest.includes('data-fig="ref-auto-approved-share"') && !rest.includes('data-fig="ref-bot-approval-rate"'), 'datum must appear once');
});

test('s07 tier table', () => {
  const s = sectionHtml('s07');
  const wrap = s.match(/<div class="table-scroll"[^>]*>\s*<table>\s*<caption>Approval tiers \(illustrative\)<\/caption>[\s\S]*?<\/table>\s*<\/div>/);
  assert.ok(wrap, 'tier table missing');
  const table = wrap[0];
  const head = [...table.match(/<thead>[\s\S]*?<\/thead>/)[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => strip(m[1]));
  assert.deepEqual(head, ['Tier', 'Example assets', 'Who approves', 'Share of assets', 'Grade']);
  const rows = table.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g);
  assert.equal(rows.length, 4);
  rows.forEach((r, i) => {
    assert.ok(r.includes(`<th scope="row" class="tier">T${i}</th>`), `T${i} header`);
    assert.ok(r.includes(`data-fig="asm-tier-range-t${i}"`), `T${i} range`);
    assert.ok(r.includes('<b class="default-mark">model default</b>'), `T${i} default mark`);
    assert.ok(r.includes(`data-fig="tier-default-t${i}"`), `T${i} default`);
    const chips = r.match(/class="chip /g) || [];
    assert.equal(chips.length, 1);
    assert.ok(r.includes(`href="#asm-tier-range-t${i}"`));
  });
  assert.match(s, /<\/table>\s*<\/div>\s*<div class="callout">\s*<span class="lbl">Not legal advice<\/span>\s*<p>Illustrative, not legal advice; depends on jurisdiction\.<\/p>\s*<\/div>/);
  const ah = s.match(/<h3>Always human<\/h3>\s*<p>([\s\S]*?)<\/p>\s*<ul>([\s\S]*?)<\/ul>/);
  assert.ok(ah, 'Always human h3, p, ul');
  assert.ok(/illustrative/i.test(ah[1]));
  const list = strip(ah[2]).toLowerCase();
  for (const w of ['hero', 'testimonial', 'claim', 'likeness', 'children', 'third-party rights']) assert.ok(list.includes(w), w);
  for (const id of ['asm-auto-approval', 'tier-eligible-share-scaled', 'auto-share-of-eligible']) assert.ok(s.includes(`data-fig="${id}"`), id);
  assert.ok(/\btarget\b/.test(strip(s)));
});

test('time elements are present', () => {
  assert.ok((html.match(/<time datetime="/g) || []).length >= 1);
});

// ---- Plan 02-06: s07 capacity and fatigue, s08 eval harness and telemetry ----

function proseWords(id) {
  const s = sectionHtml(id).replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<table>[\s\S]*?<\/table>/g, ' ');
  const parts = s.match(/<(p|li|figcaption)\b[^>]*>[\s\S]*?<\/\1>/g) || [];
  return strip(parts.join(' ')).split(' ').filter(Boolean).length;
}

test('s03 to s08 total prose', () => {
  const total = ['s03', 's04', 's05', 's06', 's07', 's08'].reduce((n, id) => n + proseWords(id), 0);
  assert.ok(total >= 2800 && total <= 4200, `total ${total}`);
});

function tableByCaption(sec, caption) {
  const m = sec.match(new RegExp(`<div class="table-scroll"[^>]*>\\s*<table>\\s*<caption>${caption}</caption>[\\s\\S]*?</table>\\s*</div>`));
  assert.ok(m, `table "${caption}" missing`);
  const head = [...m[0].match(/<thead>[\s\S]*?<\/thead>/)[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((x) => strip(x[1]));
  const rows = m[0].match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g);
  return { html: m[0], head, rows };
}

test('s07 reviewer capacity', () => {
  const s = sectionHtml('s07');
  const t = tableByCaption(s, 'Reviewer capacity, 1x and 2x');
  // WR-01: volume and capacity are stated once before the table under their own
  // chips; each row holds only figures that move with the auto-approval share.
  assert.deepEqual(t.head, ['Scenario', 'Human review hours per year (before rework)', 'Utilisation of reviewer capacity', 'Grade']);
  const names = t.rows.map((r) => strip(r.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]));
  assert.deepEqual(names, ['1x without gate', '1x with gate', '2x without gate', '2x with gate']);
  const keys = ['1x-nogate', '1x-gate', '2x-nogate', '2x-gate'];
  t.rows.forEach((r, i) => {
    const k = keys[i];
    for (const id of [`cap-${k}-hours`, `cap-${k}-util`]) assert.ok(r.includes(`data-fig="${id}"`), `${k} ${id}`);
    assert.equal((r.match(/class="chip /g) || []).length, 1);
    assert.ok(r.includes('href="#asm-auto-approval"'));
    for (const id of [`cap-${k}-hours`, `cap-${k}-util`]) assert.equal(claims[id].ref, 'asm-auto-approval', `${id} ref`);
    const tds = [...r.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((x) => x[1]);
    const util = strip(tds[1]);
    assert.equal(util.includes('over capacity'), claims[`cap-${k}-util`].value > 1, `${k} over-capacity wording`);
  });
  assert.equal(strip([...t.rows[2].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)][1][1]), '134.5% over capacity');
  const lead = s.slice(0, s.indexOf(t.html)).match(/<p\b[^>]*>[\s\S]*?<\/p>\s*$/);
  assert.ok(lead, 'a paragraph states volume and capacity directly above the table');
  assert.match(lead[0], /<span data-fig="cap-1x-variants">[^<]*<\/span>\s*<a class="chip c-m" href="#asm-variants-per-concept">Modelled<\/a>/);
  assert.ok(lead[0].includes('data-fig="cap-2x-variants"'));
  assert.match(lead[0], /<span data-fig="cap-capacity-hours">[^<]*<\/span>\s*<a class="chip c-m" href="#asm-reviewer-hours">Modelled<\/a>/);
  const text = strip(s);
  assert.ok(text.includes('With the gate, human review hours fall; without it, 2x volume exceeds reviewer capacity. Utilisation is the binding constraint, not generation.'));
  for (const id of ['asm-rework-rate', 'break-even-auto-approval', 'capacity-auto-approval', 'cap-2x-ref-low-util', 'cap-2x-ref-high-util']) assert.ok(s.includes(`data-fig="${id}"`), id);
  assert.ok(/auto-approval share of zero|no auto-approval/.test(text));
  // The reference-rate utilisations link to the reference and carry its flag.
  assert.match(s, /<span data-fig="cap-2x-ref-high-util">[^<]*<\/span>\s*<a class="chip c-m" href="#src-intercom-2x-teardown">Modelled<\/a>\s*<span class="flag">company-reported<\/span>/);
});

test('s07 fatigue controls', () => {
  const s = sectionHtml('s07');
  const m = s.match(/<h3>Guarding against reviewer fatigue<\/h3>\s*<ul>([\s\S]*?)<\/ul>\s*<p>([\s\S]*?)<\/p>/);
  assert.ok(m, 'fatigue h3, ul, p');
  const lis = m[1].match(/<li>[\s\S]*?<\/li>/g);
  assert.ok(lis.length >= 4 && lis.length <= 6);
  for (const li of lis) assert.ok(li.startsWith('<li><b>'), 'li starts with b');
  const list = strip(m[1]).toLowerCase();
  for (const w of ['blind-first', 'seeded', 'session', 'sampl', 'reason code']) assert.ok(list.includes(w), w);
  assert.equal((m[2].match(/class="chip /g) || []).length, 1);
  assert.ok(m[2].includes('<a class="chip c-s" href="#asm-fatigue-controls">Speculative</a>'));
});

test('s08 eval harness', () => {
  const s = sectionHtml('s08');
  const t = tableByCaption(s, 'What the eval harness reports');
  assert.deepEqual(t.head, ['Metric', 'What it tells you', 'Published threshold', 'Grade']);
  assert.ok(t.rows.length >= 5);
  const low = strip(t.html).toLowerCase();
  for (const w of ['ground truth', 'escape', 'seeded', 'rights-trap', 'precision', 'recall', 'drift', 'noise band']) assert.ok(low.includes(w), w);
  assert.ok((t.html.match(/data-fig="/g) || []).length <= 2);
  for (const r of t.rows) {
    assert.equal((r.match(/class="chip /g) || []).length, 1);
    assert.ok(r.includes('href="#asm-harness-design"'));
  }
  const text = strip(s);
  assert.ok(text.includes('reason code'));
  assert.ok(text.includes('No change to a generator, prompt, model or policy ships if it regresses the harness.'));
  const lower = text.toLowerCase();
  for (const w of ['asset id', 'manifest', 'first-pass compliance', 'queue age', 'rework rate', 'cost per approved-live asset', 'cycle time', 'policy', 'not surveillance']) assert.ok(lower.includes(w), w);
  assert.equal((s.match(/href="#asm-telemetry-metrics"/g) || []).length, 1);
});

// ---- Code review CR-01: page copy matches the model's human-touch share ----

test('s05 and s07 state the human-touch share from the model, not a "small chance" (CR-01)', () => {
  assert.ok(!/small chance/i.test(html), '"small chance" wording is back');
  assert.ok(!/cleared with no human touch|clear with no human touch/.test(html), '"no human touch" overstates the gate');
  for (const id of ['s05', 's07']) {
    assert.ok(sectionHtml(id).includes('data-fig="human-touch-share-scaled"'), `${id} shows the human-touch share`);
  }
  const p = (sectionHtml('s05').match(/<p\b[^>]*>[\s\S]*?<\/p>/g) || []).find((x) => x.includes('data-fig="human-touch-share-scaled"'));
  assert.match(p, /<span data-fig="human-touch-share-scaled">[^<]*<\/span>\s*<a class="chip c-m" href="#asm-auto-approval">Modelled<\/a>/);
  assert.ok(/still reach a person/.test(strip(p)));
  assert.ok(/sampled or escalated share/.test(assumptions['asm-auto-approval'].basis));
});

// ---- Code review WR-02: tier rules are internally consistent ----

test('tier rules agree: T1 reuses approved claims, any new claim is T2 or above (WR-02)', () => {
  const s = sectionHtml('s07');
  const rows = s.match(/<caption>Approval tiers \(illustrative\)<\/caption>[\s\S]*?<\/table>/)[0].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g).slice(1);
  const example = (r) => strip([...r.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)][0][1]).toLowerCase();
  assert.ok(example(rows[1]).includes('already-approved claims') && example(rows[1]).includes('no new claims'), 'T1 allows only reused claims');
  assert.ok(example(rows[1]).includes('existing segments'), 'audience variants from existing segments are T1');
  assert.ok(example(rows[2]).includes('new claim'), 'new claims are T2');
  for (const r of rows.slice(0, 2)) assert.ok(!/\bnew cop(y|ies)\b/.test(example(r)), 'no new copy in T0/T1');
  const ah = s.match(/<h3>Always human<\/h3>\s*<p>([\s\S]*?)<\/p>\s*<ul>([\s\S]*?)<\/ul>/);
  assert.ok(!/claim-bearing/i.test(ah[2]), 'always-human list must not catch reused approved claims');
  assert.ok(/new or comparative claims/i.test(strip(ah[2])));
  assert.ok(/any new claim starts at T2/.test(strip(ah[1])));
});

// ---- Code review WR-03: company-reported figures have a written grade rule and a flag on every appearance ----

test('legend states the grade rule for company-reported figures and every such figure follows it (WR-03)', () => {
  const start = html.indexOf('class="legend"');
  const legend = strip(html.slice(start, html.indexOf('</div>', start)));
  assert.ok(legend.includes('A figure that only the company concerned reports is also graded Modelled, never Benchmark, and is flagged company-reported'));
  const reported = Object.values(claims).filter((c) => c.flag === 'company-reported');
  assert.ok(reported.length >= 2);
  for (const c of reported) assert.equal(c.grade, 'Modelled', `${c.id}: company-reported figures are Modelled`);
  // each appearance of the reference datum carries the flag right after it (or after its chip)
  for (const id of ['ref-auto-approved-share', 'ref-bot-approval-rate']) {
    const re = new RegExp(`<span data-fig="${id}">[^<]*</span>\\s*(?:<a class="chip[^>]*>[^<]*</a>\\s*)?<span class="flag">company-reported</span>`, 'g');
    const all = (html.match(new RegExp(`data-fig="${id}"`, 'g')) || []).length;
    assert.equal((html.match(re) || []).length, all, `${id}: flag missing on an appearance`);
  }
});

// ---- Code review WR-04: the imagery routes are qualified symmetrically (author COI) ----

test('imagery table qualifies every route symmetrically and scopes the Copyright Office source (WR-04)', () => {
  const { table } = imageryTable();
  const rows = table.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g);
  const cells = (r) => [...r.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
  const byName = Object.fromEntries(rows.map((r) => [strip(r.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]), r]));
  const [ret, lic, gen] = cells(byName.Indemnity).map(strip);
  for (const [name, c] of [['License', lic], ['Generate', gen]]) {
    assert.ok(/^Conditional; caps and exclusions vary/.test(c), `${name} indemnity must be qualified the same way`);
  }
  assert.ok(/inherits/i.test(ret), 'retrieved assets inherit the original licence');
  const basis = assumptions['asm-imagery-indemnity'].basis;
  for (const w of ['Licensed stock', 'Generated', 'Retrieved', 'capped']) assert.ok(basis.includes(w), `indemnity basis covers ${w}`);
  // the Benchmark source supports only the generated-imagery cell, so the row is Modelled
  const copy = cells(byName.Copyrightability);
  assert.ok(copy[3].includes('<a class="chip c-m" href="#asm-imagery-routes">Modelled</a>'));
  assert.ok(copy[2].includes('href="#src-usco-copyright-ai-part2"'), 'generate cell links the Copyright Office source');
  assert.ok(!copy[0].includes('src-usco') && !copy[1].includes('src-usco'));
  assert.ok(!table.includes('class="chip c-b"'), 'no route cell is graded Benchmark on a source that does not cover it');
  assert.ok(assumptions['asm-imagery-routes'].basis.includes('US Copyright Office'));
});

// ---- Code review WR-05: no pre-publication to-do in the published register ----

test('source register carries no unresolved pre-publication to-do (WR-05)', () => {
  for (const [k, src] of Object.entries(sources)) {
    assert.ok(!/before publishing|is to confirm|to be confirmed|\bTODO\b/i.test(src.read_via + src.bias), `src-${k}: unresolved to-do`);
  }
  assert.ok(/Not read/.test(sources['getty-v-stability-uk'].read_via));
  assert.ok(sources['ailawsuittracker-getty-uk'].read_via.includes('2025-12-16'));
});

// ---- Code review WR-06: every chip and every flag is checked against data.js ----

test('every linked chip states the grade of the row it links to (WR-06)', () => {
  const chips = [...html.matchAll(/<a class="chip (c-[bms])" href="#([^"]+)">([^<]+)<\/a>/g)];
  assert.equal(chips.length, (html.match(/<a class="chip /g) || []).length, 'a linked chip the check cannot parse');
  for (const [, cls, href, word] of chips) {
    const target = href.startsWith('src-') ? sources[href.slice(4)] : assumptions[href];
    assert.ok(target, `chip links to unknown row #${href}`);
    assert.equal(word, target.grade, `chip to #${href} says ${word}, target is ${target.grade}`);
    assert.equal(cls, CHIP_CLASS[target.grade], `chip to #${href} class`);
  }
});

test('every flagged claim shows its flag wherever it appears (WR-06)', () => {
  const { units } = collectUnits();
  const flagged = Object.values(claims).filter((c) => c.flag);
  assert.ok(flagged.length >= 1);
  for (const c of flagged) {
    const where = units.filter((u) => u.kind !== 'register' && u.html.includes(`data-fig="${c.id}"`));
    assert.ok(where.length >= 1, `${c.id} is not on the page`);
    for (const u of where) {
      // every appearance: the figure, optionally its chip, then the flag
      const all = u.html.split(`data-fig="${c.id}"`).length - 1;
      const re = new RegExp(`<span data-fig="${c.id}">[^<]*</span>\\s*(?:<a class="chip[^>]*>[^<]*</a>\\s*)?<span class="flag">${c.flag}</span>`, 'g');
      assert.equal((u.html.match(re) || []).length, all, `${c.id}: flag ${c.flag} missing after a figure in: ${strip(u.html).slice(0, 60)}`);
    }
  }
  // A flag must sit next to a figure or chip it qualifies, never on its own.
  const legendless = html.replace(/<div class="legend">[\s\S]*?<\/dl>/, '');
  for (const m of legendless.matchAll(/<span class="flag">([^<]+)<\/span>/g)) {
    assert.ok(['vendor-claimed', 'company-reported'].includes(m[1]), `unknown flag ${m[1]}`);
    const before = legendless.slice(Math.max(0, m.index - 160), m.index);
    assert.ok(/(<\/span>|<\/a>)\s*$/.test(before), `flag ${m[1]} does not follow a figure or chip`);
  }
});

// ---- Code review IN-07: the s08 claim about the reference links its source ----

test('s08 links the reference it describes (IN-07)', () => {
  const p = (sectionHtml('s08').match(/<p\b[^>]*>[\s\S]*?<\/p>/g) || []).find((x) => strip(x).includes('newer model tested worse'));
  assert.ok(p);
  assert.ok(p.includes('<a href="#src-intercom-2x-teardown">the one public reference</a>'));
});
