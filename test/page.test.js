import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { claims, assumptions, sources, PUBLISHER_TYPES } from '../site/js/data.js';
import { SENSITIVITY_STEP } from '../site/js/model.js';
import { formatValue } from '../site/js/format.js';

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

// s11 group grade rule (Phase 4 Plan 1, 04-UI-SPEC "Chip density amendment"): the rows of
// the three s11 tables carry no chip; the p.grade-note after each table region carries one
// chip, and every member figure's ref must be a register link in that note. calc-page.test
// pins the shared-grade guard; this rule only governs placement.
function groupedRows() {
  const s11 = sectionHtml('s11');
  const out = new Map();
  for (const label of ['Calculator results', 'Headcount scenario', 'Sensitivity']) {
    const i = s11.indexOf(`aria-label="${label}"`);
    assert.ok(i >= 0, label);
    const endTable = s11.indexOf('</table>', i);
    const table = s11.slice(i, endTable);
    const end = s11.indexOf('</div>', endTable) + '</div>'.length;
    const note = s11.slice(end).match(/^\s*(<p class="table-note grade-note">[\s\S]*?<\/p>)/);
    assert.ok(note, `${label}: grade note must follow the table region`);
    for (const tr of table.slice(table.indexOf('<tbody>')).match(/<tr>[\s\S]*?<\/tr>/g)) out.set(tr, note[1]);
  }
  return out;
}

test('governing chip rule (UI-SPEC chip density)', () => {
  const { units, total } = collectUnits();
  const grouped = groupedRows();
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
    } else if (u.kind === 'row' && grouped.has(u.html)) {
      assert.ok(!u.html.includes('class="chip'), `GROUPED row must carry no chip: ${strip(u.html).slice(0, 60)}`);
      const note = grouped.get(u.html);
      const listed = new Set([...note.matchAll(/<a href="#([^"]+)">/g)].map((m) => m[1]));
      const noteChip = note.match(/<a class="chip (c-[bms])" href="#[^"]+">([^<]+)<\/a>/);
      for (const m of figs) {
        const e = figEntry(m[1]);
        assert.ok(listed.has(e.ref), `${m[1]}: ref ${e.ref} is not listed in the grade note`);
        assert.equal(noteChip[2], e.grade, `${m[1]}: grade note word`);
        assert.equal(noteChip[1], CHIP_CLASS[e.grade], `${m[1]}: grade note class`);
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
test('source register header is the eight pinned columns', () => {
  const i = html.indexOf('<th scope="col">Publisher</th>');
  assert.ok(i > 0);
  const thead = html.slice(html.lastIndexOf('<thead>', i), html.indexOf('</thead>', i));
  const cols = [...thead.matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.deepEqual(cols, ['ID', 'Claim', 'Publisher', 'Publisher type', 'Date accessed', 'Grade', 'Flag', 'URL']);
  assert.ok(html.includes('Publisher type says who published the source. It never changes a grade.'));
});

test('source register rows match data.js field by field', () => {
  for (const [k, src] of Object.entries(sources)) {
    const row = registerRow(`src-${k}`);
    const text = decode(row);
    for (const f of ['title', 'publisher', 'published', 'accessed', 'bias', 'read_via']) {
      assert.ok(text.includes(src[f]), `src-${k}: ${f} drifted`);
    }
    assert.ok(row.includes(`href="${src.url}"`), `src-${k}: url drifted`);
    assert.ok(row.includes(`<th scope="row" class="id">src-${k}</th>`), `src-${k}: row header`);
    assert.ok(!row.includes('<a class="chip'), `src-${k}: register chip must not link`);
    // WR-07: Grade and Flag cells come from data.js, not from a test-local table.
    const tds = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    // Columns: td0 Claim, td1 Publisher, td2 Publisher type, td3 Date accessed, td4 Grade, td5 Flag, td6 URL.
    assert.equal(decode(tds[1]), src.publisher, `src-${k}: publisher cell`);
    assert.ok(PUBLISHER_TYPES.includes(src.publisherType), `src-${k}: publisherType not in the fixed list`);
    assert.equal(tds[2], src.publisherType, `src-${k}: publisher type cell`);
    assert.equal(tds[3], `<time datetime="${src.accessed}">${src.accessed}</time>`, `src-${k}: accessed cell`);
    assert.equal(tds[4], `<span class="chip ${CHIP_CLASS[src.grade]}">${src.grade}</span>`, `src-${k}: grade cell`);
    assert.equal(tds[5], src.flag ?? 'none', `src-${k}: flag cell`);
    if (src.event) assert.ok(tds[0].includes(`Event dated ${src.event}.`), `src-${k}: event date missing from the claim cell`);
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
  const scripts = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/g) || [];
  assert.deepEqual(scripts, ['<script type="module" src="js/ui.js"></script>'], 'exactly one same-origin module script');
  assert.equal((html.match(/<script/g) || []).length, 1);
  assert.ok(html.indexOf('</footer>') < html.indexOf('<script') && html.indexOf('<script') < html.indexOf('</body>'), 'script sits between footer and body end');
  assert.ok(!/\son[a-z]+\s*=/i.test(html), 'inline event handler present');
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

// The sensitivity step (a method parameter, UI-SPEC) is exempt only in s11 and only
// in its four fixed phrasings, built from SENSITIVITY_STEP (IN-02, IN-03).
const STEP = formatValue(SENSITIVITY_STEP, 'pct0');
const stripStep = (h) => h
  .replace(`each input moved ${STEP} down and up`, ' ')
  .replaceAll(`at −${STEP}`, ' ').replaceAll(`at +${STEP}`, ' ')
  .replace(`A ${STEP} rise moves`, ' ');

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

// Every section is now filled; the later note must not appear anywhere.
test('no section carries the later note', () => {
  assert.ok(!html.includes('class="later"'));
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
  const trio = sectionHtml('s01').match(/<div class="metric-trio">[\s\S]*?<\/div>\s*(?=<p|<div class="table-scroll)/)[0];
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

test('CSP meta is exactly the pinned policy', () => {
  const m = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/);
  assert.ok(m, 'CSP meta');
  assert.equal(m[1], "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'");
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

// Code review IN-04: extended with ad-platform, model, DAM and creative-tool names.
// Ordinary English words that are also product names (writer, typeface, meta,
// flux) are matched only in their branded forms to avoid false positives.
const VENDOR_RE = /\b(gradial|airops|profound|adobe|firefly|midjourney|dall-?e|openai|chatgpt|anthropic|claude|gemini|google|microsoft|copilot|canva|shutterstock|runway|synthesia|jasper|salesforce|hubspot|bynder|aprimo|contentful|amazon|aws|azure|honeycomb|athena|optimizely|klarna|unilever|tiktok|linkedin|facebook|instagram|youtube|meta ads|meta platforms|sora|veo|imagen|flux\.1|black forest labs|ideogram|leonardo\.ai|stable diffusion|figma|workfront|sprinklr|celtra|persado|typeface\.ai|writer\.com|smartling|phrase tms|deepl|seismic|sitecore|bria)\b/i;

test('no vendor names outside s12 and s15 (IN-04)', () => {
  let rest = html.replace(/<head>[\s\S]*?<\/head>/, '');
  for (const id of ['s12', 's15']) rest = rest.replace(sectionHtml(id), '');
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
// IN-06, relaxed deliberately and narrowly in Phase 4 Plan 2: the UI-SPEC .asat block
// shows "24 October 2026" and the Guess incident is known only to the month. The numeric
// gate strips <time> with its text, so the text is validated here: it must be the datetime
// itself, or "D Month YYYY" (full dates, no leading zero) or "Month YYYY" (YYYY-MM) for the
// same date. Anything else fails, so a numeral cannot hide inside a <time> element.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function timeIssue(datetime, text) {
  const m = datetime.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return `datetime "${datetime}" is not YYYY-MM or YYYY-MM-DD`;
  const [, y, mo, d] = m;
  const month = Number(mo);
  if (month < 1 || month > 12) return `bad month in ${datetime}`;
  if (d) {
    const dt = new Date(Date.UTC(Number(y), month - 1, Number(d)));
    if (dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== Number(d)) return `${datetime} is not a real date`;
  }
  const human = d ? `${Number(d)} ${MONTHS[month - 1]} ${y}` : `${MONTHS[month - 1]} ${y}`;
  return text === datetime || text === human ? null : `<time> text "${text}" is neither "${datetime}" nor "${human}"`;
}

test('time text rule: pinned incident pairs pass and a mismatched pairing fails', () => {
  const pairs = [['2025-12-10', '10 December 2025'], ['2025-11-03', '3 November 2025'], ['2025-08', 'August 2025'],
    ['2024-02-14', '14 February 2024'], ['2023-03-22', '22 March 2023'], ['2026-10-24', '24 October 2026'], ['2026-10-24', '2026-10-24']];
  for (const [d, t] of pairs) assert.equal(timeIssue(d, t), null, `${d} / ${t}`);
  for (const [d, t] of [['2025-12-10', 'December 2025'], ['2025-08', '1 August 2025'], ['2025-12-10', '09 December 2025'],
    ['2025-02-30', '30 February 2025'], ['2025-13', 'Month 2025'], ['2025-12-10', '10 Dec 2025']]) {
    assert.notEqual(timeIssue(d, t), null, `${d} / ${t} should fail`);
  }
});

test('time elements carry ISO dates that appear in a source register row', () => {
  const rows = html.match(/<tr id="src-[^"]+">[\s\S]*?<\/tr>/g) || [];
  const times = [...html.matchAll(/<time\b([^>]*)>([^<]*)<\/time>/g)];
  assert.equal(times.length, (html.match(/<time\b/g) || []).length, 'a <time> element the check cannot parse');
  for (const [, attrs, text] of times) {
    const d = attrs.match(/^ datetime="([^"]*)"$/);
    assert.ok(d, `<time> must carry only a datetime attribute: ${attrs}`);
    assert.equal(timeIssue(d[1], text), null);
    assert.ok(rows.some((r) => r.includes(d[1])), `${d[1]} is not in a source register row`);
  }
});

const isRegisterId = (id) => (id.startsWith('src-') ? Boolean(sources[id.slice(4)]) : Boolean(assumptions[id]));

test('register-id links name a real row', () => {
  const links = [...html.matchAll(/<a(?: class="cite")? href="#([^"]+)">((?:src|asm)-[^<]*)<\/a>/g)];
  assert.ok(links.length > 0);
  for (const [, href, text] of links) {
    assert.equal(text, href, `link text ${text} differs from its target #${href}`);
    assert.ok(isRegisterId(href), `#${href} is not a data.js key`);
  }
  assert.equal(links.length, [...html.matchAll(/<a\b[^>]*>(?:src|asm)-[^<]*<\/a>/g)].length, 'a register-id link the check cannot parse');
});

// Legal references (EU Article 50 and the omnibus regulation) carry numerals that are
// names, not measurements. They pass the gate only as exactly one of these strings.
const LEGAL_REFS = ['Article 50', 'Article 50(2)', 'Article 50(4)', 'Regulation (EU) 2026/1744'];

test('every legal-ref span carries one pinned reference', () => {
  const spans = [...html.matchAll(/<span class="legal-ref">([^<]*)<\/span>/g)];
  for (const m of spans) assert.ok(LEGAL_REFS.includes(m[1]), `legal-ref span "${m[1]}"`);
  assert.equal((html.match(/class="legal-ref"/g) || []).length, spans.length, 'a legal-ref span the check cannot parse');
});

test('numeric gate: no ungraded numerals anywhere on the page', () => {
  const parts = [
    regionHtml('<header class="masthead">', '</header>'), metaHtml(), sectionHtml('answer'),
    regionHtml('<div class="legend">', '</dl>'),
    // The calculator form is not stripped wholesale (WR-06). It sits in a .calc-live
    // wrapper, which carries no data-fig, so two exact strings are exempted instead:
    // the leading "Default N" of each field hint (calc-page.test pins N to data.js
    // via toText) and the change-management sentence, built here from data.js so a
    // changed assumption fails the gate. Any other numeral in the form fails.
    ...SECTION_IDS.map((id) => (id === 's11' ? stripStep(sectionHtml(id)) : sectionHtml(id))
      .replace(/<p class="hint" id="hint-[a-z0-9]+">Default \$?[\d.,]+%?/g, ' ')
      .replace(`Change-management cost: ${assumptions['asm-change-mgmt'].display}, included`, ' ')
      .replace(/<tr id="(?:src|asm)-[^"]+">[\s\S]*?<\/tr>/g, ' ')),
    regionHtml('<footer>', '</footer>'),
  ];
  for (const part of parts) {
    const cleaned = strip(
      part
        .replace(/<span class="statute">17 U\.S\.C\. (?:504\(c\)|412)<\/span>/g, ' ') // statute citations, span text pinned below
        .replace(/<span class="legal-ref">([^<]*)<\/span>/g, (all, t) => (LEGAL_REFS.includes(t) ? ' ' : all)) // pinned legal references, see test below
        .replace(/<a href="#s\d\d">[^<]*<\/a>/g, ' ') // in-page section cross-links
        .replace(/<a(?: class="cite")? href="#((?:src|asm)-[^"]+)">([^<]*)<\/a>/g, (all, id, text) => (text === `#${id}`.slice(1) && isRegisterId(id) ? ' ' : all)) // register-id links, see test below
        .replace(/<time datetime="\d{4}-\d{2}(?:-\d{2})?">[^<]*<\/time>/g, ' ') // dates, text validated by timeIssue above
        .replace(/<span data-fig="[^"]+">[^<]*<\/span>/g, ' ')
        .replace(/<a class="chip[^"]*"[^>]*>[^<]*<\/a>/g, ' ')
        .replace(/<span class="sec-num">[^<]*<\/span>/g, ' ')
        .replace(/<h2 id="s\d\d-h">[^<]*<\/h2>/g, ' ') // section titles are locked by the TITLES test
        .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
        .replace(/Figure \d+/g, ' '),
    ).replace(/\bT[0-3]\b/g, ' ').replace(/\bBacklog 0\b/g, ' '); // tier names and the programme end-state name
    for (const tok of cleaned.match(/\d[\d,.–-]*%?x?/g) || []) {
      const t = tok.replace(/[.,–-]+$/, '');
      assert.ok(ALLOWED_NUMERIC_TOKENS.includes(t), `ungraded numeral "${tok}" in: ${cleaned.slice(0, 80)}`);
    }
  }
});

// ---- Plan 01-04: section 01 ----

const FALSIFIER = 'If campaign-markets launched per quarter double but holdout-measured conversion/CAC does not improve, or first-pass compliance falls, within 2–3 quarters, the 2x claim is false for that org.';
const NOT_MEAN = 'It does not mean twice as many assets generated, twice the budget, or half the team. It means twice as many campaign-markets launched per quarter, within a flat total marketing budget and flat headcount, with outcomes that hold. Extra crops, sizes or locales of the same campaign-market do not count toward 2x.';

test('s01 holds both callouts verbatim and the front matter does not duplicate them', () => {
  const s = sectionHtml('s01');
  assert.ok(s.includes('What 2x does not mean'));
  assert.ok(s.includes(NOT_MEAN));
  assert.ok(s.includes('Falsifier'));
  assert.ok(s.includes(FALSIFIER));
  assert.equal(html.split('the 2x claim is false for that org.').length - 1, 1);
  assert.equal(html.split('What 2x does not mean').length - 1, 1);
});

test('s01 flat headcount is a linked Speculative assumption, not a modelled result (WR-02)', () => {
  const e = assumptions['asm-flat-marketing-headcount'];
  assert.ok(e, 'asm-flat-marketing-headcount is registered');
  assert.equal(e.grade, 'Speculative');
  assert.match(e.basis, /checks reviewer capacity only/);
  const chip = '<a class="chip c-s" href="#asm-flat-marketing-headcount">Speculative</a>';
  const s = sectionHtml('s01');
  assert.ok(s.includes(`flat headcount ${chip}`), 'the s01 definition links the assumption where it says flat headcount');
  const notMean = s.slice(s.indexOf('What 2x does not mean'), s.indexOf('Falsifier'));
  assert.ok(notMean.includes(chip) && /assumed, not tested/.test(strip(notMean)), '"What 2x does not mean" says flat headcount is assumed');
  assert.ok(!/flat-headcount statement/.test(assumptions['asm-marketing-fte'].basis), 'asm-marketing-fte must not claim to back the flat-headcount statement');
});

test('s01 metric trio carries the campaign-market claim and its companions', () => {
  const s = sectionHtml('s01');
  const m = s.match(/<div class="metric-trio">[\s\S]*?<\/div>\s*(?=<p|<div class="table-scroll)/);
  assert.ok(m, 'no metric-trio');
  for (const id of ['cm-base', 'cm-scaled', 'btl-base', 'btl-scaled', 'cpa-base', 'cpa-scaled']) {
    assert.ok(m[0].includes(`data-fig="${id}"`), id);
  }
  for (const l of ['Campaign-markets launched per quarter', 'Brief-to-live time', 'Cost per approved asset']) {
    assert.ok(m[0].includes(`<span class="lbl">${l}</span>`), l);
  }
  // The removed per-head, weighted and variants-per-concept claims are gone everywhere.
  assert.ok(!/output-per-head|weighted-ratio|data-fig="vpc-/.test(html), 'a removed claim is back on the page');
  const prose = strip(sectionHtml('answer')) + ' ' + strip(s);
  assert.ok(!/per (marketing )?head/i.test(prose), 'per-head wording in the answer or s01');
  assert.ok(!/tier-weighted/i.test(s));
});

test('s01 six-lever table', () => {
  const s = sectionHtml('s01');
  assert.ok(s.includes('<caption>The six levers</caption>'));
  assert.match(s, /<div class="table-scroll"[^>]*role="region"[^>]*>\s*<table>\s*<caption>The six levers/);
  const body = s.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)];
  assert.equal(rows.length, 6);
  assert.ok(strip(rows[0][1]).includes('Campaign-markets launched per quarter; brief-to-live time; cost per approved asset'));
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
    'cpcm-base', 'cpcm-scaled', 'cpcm-change', 'total-cost-base', 'total-cost-scaled', 'budget-share-base', 'budget-share-scaled', 'ai-spend-base', 'ai-spend-scaled',
    'ai-spend-ratio', 'break-even-auto-approval', 'asm-approval-yield', 'asm-auto-approval']) {
    assert.ok(s.includes(`data-fig="${id}"`), id);
  }
  assert.match(s, /<h3>Cost per campaign-market<\/h3>/);
  assert.match(s, /class="callout/);
  if (claims['gartner-share-2026'].grade === 'Modelled') assert.ok(text.includes(GARTNER_CAVEAT));
  else assert.ok(!text.includes(GARTNER_CAVEAT));
});

test('answer carries the cost per asset and stays short', () => {
  const a = sectionHtml('answer');
  assert.ok(a.includes('data-fig="cpa-base"'));
  assert.ok(a.includes('data-fig="cpa-scaled"'));
  assert.ok(strip(a).split(' ').length <= 120);
  for (const id of ['cm-base', 'cm-scaled', 'btl-base', 'btl-scaled']) assert.ok(a.includes(`data-fig="${id}"`), id);
  assert.ok(strip(a).includes('flat headcount'));
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

const PROSE_BUDGET = { s03: [400, 700], s04: [400, 700], s05: [400, 700], s06: [400, 700], s07: [400, 700], s08: [400, 700], s09: [1500, 2000], s10: [400, 600], s12: [700, 900], s13: [400, 700], s14: [900, 1600] };

test('section prose budgets', () => {
  for (const [id, [lo, hi]] of Object.entries(PROSE_BUDGET)) {
    const s = sectionHtml(id).replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<table>[\s\S]*?<\/table>/g, ' ');
    const parts = s.match(/<(p|li|figcaption|dd)\b[^>]*>[\s\S]*?<\/\1>/g) || [];
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
  assert.ok(strip(s).includes('Derived variants: internal throughput, not the claim.'));
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
  // CR-02: the matrix counts derived variants before the gate; the approved count is shown at the approval yield.
  assert.deepEqual(names, ['Master concepts', 'Sizes', 'Channels', 'Locales', 'Audiences', 'Tests', 'Feed items', 'Total derived variants, before the gate', 'Approved at the approval yield']);
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

// ---- Plan 02-04: s05 imagery sourcing, personalisation ----

function imageryTable() {
  const s = sectionHtml('s05');
  const m = s.match(/<table(?: id=\"legal-s05-imagery\")?>\s*<caption>Imagery sourcing: three routes<\/caption>[\s\S]*?<\/table>/);
  assert.ok(m, 'imagery table missing');
  return { s, table: m[0], at: s.indexOf(m[0]) };
}

test('s05 intro paragraph is immediately followed by the imagery table region', () => {
  const s = sectionHtml('s05');
  const { table } = imageryTable();
  const m = s.match(/<p>[^<]*Every campaign needs images[\s\S]*?<\/p>\s*<div class="table-scroll" role="region" aria-label="Imagery sourcing table" tabindex="0">\s*<table/);
  assert.ok(m, 'intro p must be immediately followed by the table region');
  assert.ok(table.includes('<caption>Imagery sourcing: three routes</caption>'));
  assert.ok(table.includes('href="#src-usco-copyright-ai-part2"'));
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
  const parts = s.match(/<(p|li|figcaption|dd)\b[^>]*>[\s\S]*?<\/\1>/g) || [];
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
  assert.ok(strip(s).includes('Derived variants: internal throughput, not the claim.'));
  assert.ok(strip(s).includes('Review volume, in derived variants (internal throughput, not the claim), is'));
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
  assert.match(lead[0], /<span data-fig="cap-1x-variants">[^<]*<\/span>\s*<a class="chip c-m" href="#asm-formats-per-market">Modelled<\/a>/);
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
  for (const w of ['asset id', 'manifest', 'first-pass compliance', 'queue age', 'rework rate', 'cost per approved asset', 'brief-to-live time', 'policy', 'not surveillance']) assert.ok(lower.includes(w), w);
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

// ---- Code review WR-04: the imagery routes are qualified symmetrically ----

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

// ---- Plan 03-01: Phase 2 UI-review carry-over ----

test('tier table shows the default first, then the range on its own line', () => {
  const s = sectionHtml('s07');
  for (const n of [0, 1, 2, 3]) {
    assert.match(s, new RegExp(`<td><span data-fig="tier-default-t${n}">[^<]*</span> <b class="default-mark">model default</b><br><span data-fig="asm-tier-range-t${n}">[^<]*</span></td>`));
  }
});

test('s07 capacity prose says over capacity beside 100.1% and 111.3%', () => {
  const s = sectionHtml('s07');
  for (const id of ['cap-2x-ref-high-util', 'cap-2x-ref-low-util']) {
    const i = s.indexOf(`data-fig="${id}"`);
    assert.ok(i > 0, id);
    assert.ok(/over capacity/.test(s.slice(i, i + 260).replace(/<[^>]+>/g, ' ').slice(0, 60 + 40)), `${id} lacks over capacity`);
  }
});

test('s02 says budgets have flattened', () => {
  const s = sectionHtml('s02');
  assert.ok(s.includes('budgets have flattened'));
  assert.ok(!s.includes('not rising to meet the ambition'));
});

// ---- Plan 03-01: s09 lead and localisation block (LEVER-01) ----

test('s09 opens with the lead and the localisation block', () => {
  const s = sectionHtml('s09');
  assert.ok(!s.includes('class="later"'));
  const first = s.slice(s.indexOf('</div>')).match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  assert.equal(strip(first[1]), 'The factory doubles output; five other levers decide whether the extra output is worth having.');
  assert.ok(s.includes('<h3 id="s09-localisation">Localisation and transcreation</h3>'));
  const { head, rows } = tableByCaption(s, 'Localisation and transcreation: output, outcome and evidence');
  assert.deepEqual(head, ['Measure', 'Metric', 'Evidence grade']);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((r) => strip(r.match(/<th[^>]*>([\s\S]*?)<\/th>/)[1])), ['Output', 'Outcome']);
  for (const r of rows) {
    assert.equal((r.match(/class="chip /g) || []).length, 1);
    assert.ok(r.includes('<a class="chip c-m" href="#asm-lever-02-evidence">Modelled</a></td>'));
  }
});

test('localisation block carries the graded evidence and caveats, anonymised', () => {
  const s = sectionHtml('s09');
  const lstart = s.indexOf('id="s09-localisation"');
  const lend = s.indexOf('id="s09-experimentation"');
  const block = s.slice(lstart, lend > lstart ? lend : undefined);
  const t = strip(block.replace(/<table>[\s\S]*?<\/table>/g, ' '));
  assert.ok(t.includes('we did not find a primary source'));
  assert.ok(/pre-LLM/.test(t) && /one domain/.test(t) && /few translators/.test(t));
  for (const n of ['Smartling', 'Intel', 'Lilt']) assert.ok(!t.includes(n), n);
  assert.ok(block.includes('data-fig="mt-speed-lo"') && block.includes('data-fig="mt-speed-hi"'));
  assert.ok(block.includes('href="#src-laubli-2019"') && block.includes('href="#src-translation-vendor-case"'));
  assert.ok(block.includes('<a href="#s05">'));
  const prose = (block.replace(/<table>[\s\S]*?<\/table>/g, ' ').match(/<(p|li)\b[^>]*>[\s\S]*?<\/\1>/g) || []);
  const words = strip(prose.join(' ')).split(' ').filter(Boolean).length;
  assert.ok(words >= 250 && words <= 450, `localisation prose ${words} words`);
});

// ---- Plan 03-02: experimentation and insight blocks (LEVER-02, LEVER-03) ----

function leverBlock(id, nextId) {
  const s = sectionHtml('s09');
  const start = s.indexOf(`id="${id}"`);
  assert.ok(start >= 0, `missing ${id}`);
  const end = nextId ? s.indexOf(`id="${nextId}"`) : s.length;
  return s.slice(start, end > start ? end : s.length);
}
const blockWords = (b) => strip((b.replace(/<table>[\s\S]*?<\/table>/g, ' ').match(/<(p|li)\b[^>]*>[\s\S]*?<\/\1>/g) || []).join(' ')).split(' ').filter(Boolean).length;

test('experimentation block: win rates by definition, never averaged, bounded by traffic', () => {
  const s = sectionHtml('s09');
  assert.ok(s.includes('<h3 id="s09-experimentation">Experimentation</h3>'));
  const block = leverBlock('s09-experimentation', 's09-insight');
  const mini = tableByCaption(block, 'Experimentation: output, outcome and evidence');
  assert.deepEqual(mini.head, ['Measure', 'Metric', 'Evidence grade']);
  for (const r of mini.rows) assert.ok(r.includes('<a class="chip c-m" href="#asm-lever-03-evidence">Modelled</a></td>'));
  const t = tableByCaption(block, 'Reported A/B win rates by definition of a win');
  assert.deepEqual(t.head, ['Source', 'What counts as a win', 'Rate', 'Grade']);
  assert.equal(t.rows.length, 3);
  const ids = [['winrate-vendor', 'src-experimentation-vendor-playbook'], ['winrate-paper', 'src-kohavi-2013'], ['winrate-second-hand', 'src-kohavi-2013']];
  t.rows.forEach((r, i) => {
    assert.ok(!/average/i.test(r), 'row mentions average');
    const tds = [...r.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/g)];
    assert.ok(tds[1][1].includes('class="num"'), 'Rate cell must be td.num');
    const flag = claims[ids[i][0]].flag;
    assert.ok(new RegExp(`<span data-fig="${ids[i][0]}">[^<]*</span> <span class="flag">${flag}</span>`).test(tds[1][2]), `rate cell ${ids[i][0]}`);
    assert.ok(r.includes(`href="#${ids[i][1]}"`));
  });
  assert.ok(!/average/i.test(strip(block)), 'block mentions average');
  assert.ok(!/36/.test(strip(s)), 'a 36 token appears in s09');
  const text = strip(block);
  assert.ok(/bounded by traffic/.test(text) && /more tests do not always mean more wins/.test(text));
  assert.ok(block.includes('data-fig="asm-tests-per-quarter"') && block.includes('data-fig="tests-winners-lo"') && block.includes('data-fig="tests-winners-hi"'));
  assert.ok(block.includes('href="#src-kohavi-2013"') && block.includes('href="#src-experimentation-vendor-playbook"'));
  const words = blockWords(block);
  assert.ok(words >= 250 && words <= 450, `experimentation prose ${words} words`);
});

test('insight and reporting block is brief, Modelled, anonymised', () => {
  const s = sectionHtml('s09');
  assert.ok(s.indexOf('id="s09-insight"') > s.indexOf('id="s09-experimentation"'));
  assert.ok(s.includes('<h3 id="s09-insight">Insight and reporting</h3>'));
  const block = leverBlock('s09-insight', 's09-ops');
  const mini = tableByCaption(block, 'Insight and reporting: output, outcome and evidence');
  assert.equal(mini.rows.length, 2);
  for (const r of mini.rows) assert.ok(r.includes('<a class="chip c-m" href="#asm-lever-04-evidence">Modelled</a></td>'));
  const text = strip(block);
  assert.ok(/evidence gap|we did not find/.test(text));
  assert.ok(!VENDOR_RE.test(text));
  assert.ok(block.includes('<a class="chip c-m" href="#src-mmm-geox">Modelled</a>'));
  assert.ok(block.includes('<a href="#s08">'));
  const words = blockWords(block);
  assert.ok(words >= 150 && words <= 300, `insight prose ${words} words`);
});

// ---- Plan 03-03: operations block with statutory illustration (LEVER-04) ----

test('every statute span carries exactly one of the two pinned citations', () => {
  const spans = [...html.matchAll(/<span class="statute">([^<]*)<\/span>/g)];
  assert.ok(spans.length >= 2);
  for (const m of spans) assert.ok(['17 U.S.C. 504(c)', '17 U.S.C. 412'].includes(m[1]), `statute span "${m[1]}"`);
  assert.equal((html.match(/class="statute"/g) || []).length, spans.length, 'a statute span the check cannot parse');
});

test('ops block: statutory table, callout, reader-owned incident rate, per-work illustration', () => {
  const s = sectionHtml('s09');
  assert.ok(s.includes('<h3 id="s09-ops">Operations: briefs, approvals, metadata and rights</h3>'));
  const block = leverBlock('s09-ops', 's09-aeo');
  const mini = tableByCaption(block, 'Operations: output, outcome and evidence');
  for (const r of mini.rows) assert.ok(r.includes('<a class="chip c-s" href="#asm-lever-05-evidence">Speculative</a></td>'));
  const t = tableByCaption(block, '<span class="statute">17 U\\.S\\.C\\. 504\\(c\\)</span>: statutory damages per work infringed');
  assert.deepEqual(t.head, ['Case', 'Range per work', 'Grade']);
  assert.equal(t.rows.length, 3);
  assert.deepEqual(t.rows.map((r) => strip(r.match(/<th[^>]*>([\s\S]*?)<\/th>/)[1])), ['Ordinary', 'Innocent', 'Wilful']);
  for (const r of t.rows) assert.ok(r.includes('<a class="chip c-b" href="#src-cornell-17usc504">Benchmark</a></td>'));
  const after = block.slice(block.indexOf('</table>', block.indexOf('statutory damages per work infringed')));
  assert.match(after, /^<\/table>\s*<\/div>\s*<div class="callout">\s*<span class="lbl">Not legal advice<\/span>\s*<p id="legal-s09-notadvice">Illustrative, not legal advice; depends on jurisdiction\.<\/p>/);
  const text = strip(block);
  assert.ok(text.includes('Treat this rate as yours to replace.'));
  assert.ok(block.includes('<a class="chip c-s" href="#asm-incident-rate">Speculative</a>'));
  assert.ok(block.includes('<a class="chip c-b" href="#src-cornell-17usc412">Benchmark</a>'));
  assert.ok(/<span class="statute">17 U\.S\.C\. 412<\/span>/.test(block));
  assert.ok(/one work/.test(text) && /per master concept, not per variant/.test(text));
  assert.ok(/injunction/.test(text) && /small beside/.test(text));
  assert.ok(block.includes('<a href="#s07">the auto-approval gate</a>'));
  // never multiplied by the variant count
  assert.ok(!/data-fig="(?:matrix-[^"]*|cap-[^"]*-variants|vpc-[^"]*|avg-campaign-variants)"/.test(block), 'ops block uses a variant count');
  const words = blockWords(block);
  assert.ok(words >= 250 && words <= 450, `ops prose ${words} words`);
});

// ---- Plan 03-03: answer-engine visibility block and s09 completion (LEVER-05) ----

test('traffic studies by sell-side authors are not called independent (IN-08)', () => {
  assert.ok(!/Independent traffic studies/i.test(html));
  assert.ok(!/Independent traffic studies/i.test(assumptions['asm-lever-06-evidence'].basis));
  assert.match(sectionHtml('s09'), /Non-vendor traffic studies published up to/);
});

test('aeo block: Speculative, we-did-not-find, independent studies, refresh link to s03', () => {
  const s = sectionHtml('s09');
  assert.ok(s.includes('<h3 id="s09-aeo">Answer-engine visibility (AEO/GEO)</h3>'));
  assert.ok(s.indexOf('id="s09-aeo"') > s.indexOf('id="s09-ops"'));
  assert.equal(s.lastIndexOf('<h3 '), s.indexOf('<h3 id="s09-aeo"'), 'aeo is the last block');
  const block = leverBlock('s09-aeo');
  const mini = tableByCaption(block, 'Answer-engine visibility: output, outcome and evidence');
  assert.equal(mini.rows.length, 2);
  for (const r of mini.rows) assert.ok(r.includes('<a class="chip c-s" href="#asm-lever-06-evidence">Speculative</a></td>'));
  const text = strip(block);
  assert.ok(text.includes('We did not find evidence that visibility gains translate into pipeline.'));
  const sentence = strip(block).split(/(?<=\.)\s/).find((x) => /refresh briefs/.test(x));
  assert.ok(sentence && /factory/.test(sentence), 'refresh sentence');
  assert.ok(/refresh briefs[^.]*<a href="#s03">/.test(block), 'refresh sentence links s03');
  assert.ok(block.includes('<a href="#s03">the factory model</a>') && block.includes('<a href="#s12">how this compares</a>'));
  for (const id of ['aeo-llm-share', 'aeo-organic-multiple', 'aeo-ai-share-organic', 'aeo-hidden-direct', 'aeo-geo-bench']) assert.ok(block.includes(`data-fig="${id}"`), id);
  for (const k of ['haynes-2026', 'seoworks-2026', 'indig-2026', 'aggarwal-geo-2024']) assert.ok(block.includes(`href="#src-${k}"`), k);
  const words = blockWords(block);
  assert.ok(words >= 250 && words <= 450, `aeo prose ${words} words`);
});

test('s09 has five blocks in order, no vendor or panel names, anonymised', () => {
  const s = sectionHtml('s09');
  const ids = [...s.matchAll(/<h3 id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ['s09-localisation', 's09-experimentation', 's09-insight', 's09-ops', 's09-aeo']);
  const t = strip(s);
  for (const n of ['SparkToro', 'Gumshoe', 'ChatGPT']) assert.ok(!t.includes(n), n);
  assert.ok(!VENDOR_RE.test(t));
  assert.ok(!/gradial|airops|profound/i.test(t));
});

// ---- Plan 03-04: s10 outcome case and CTA ----

test('s10 outcome scorecard (OUTC-01)', () => {
  const s = sectionHtml('s10');
  assert.ok(!s.includes('<p class="later">'));
  const first = s.slice(s.indexOf('</div>')).match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  assert.equal(strip(first[1]), 'More output only counts if outcomes hold, and that has to be shown with holdouts, not assumed.');
  assert.match(s, /<div class="table-scroll" role="region" aria-label="Outcome scorecard" tabindex="0">/);
  const t = tableByCaption(s, "Outcome scorecard: each lever's output paired with outcome families");
  assert.deepEqual(t.head, ['Lever', 'Output metric', 'Revenue and pipeline', 'Speed to market', 'Quality and brand', 'Learning velocity', 'Weakest grade']);
  assert.equal(t.rows.length, 6);
  const s01 = sectionHtml('s01');
  const s01rows = s01.match(/<caption>The six levers<\/caption>[\s\S]*?<\/table>/)[0].match(/<tr>\s*<th scope="row">[\s\S]*?<\/tr>/g);
  assert.equal(s01rows.length, 6);
  t.rows.forEach((r, i) => {
    const name = (x) => strip(x.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]);
    assert.equal(name(r), name(s01rows[i]));
    const cells = [...r.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    assert.equal(cells.length, 6);
    cells.slice(0, 5).forEach((c) => {
      assert.ok(!/\d/.test(strip(c)), `digit in scorecard cell: ${strip(c)}`);
      assert.ok(strip(c).split(' ').length <= 20, strip(c));
    });
    const chips = r.match(/<a class="chip c-[ms]"/g) || [];
    assert.equal(chips.length, 1);
    const want = s01rows[i].match(/<a class="chip (c-[ms])" href="#(asm-lever-0\d-evidence)">(\w+)<\/a>/);
    assert.ok(cells[5].includes(`<a class="chip ${want[1]}" href="#${want[2]}">${want[3]}</a>`));
  });
  assert.ok(strip(t.html).includes('We did not find evidence of lift'));
});

test('s10 proof block (OUTC-02)', () => {
  const s = sectionHtml('s10');
  const h = s.indexOf('<h3>How lift would be proven</h3>');
  assert.ok(h > 0);
  const ol = s.slice(h).match(/<ol class="proof-steps">([\s\S]*?)<\/ol>/);
  assert.ok(ol);
  const lis = ol[1].match(/<li>[\s\S]*?<\/li>/g);
  assert.equal(lis.length, 4);
  assert.deepEqual(lis.map((l) => strip(l.match(/<b>([\s\S]*?)<\/b>/)[1])), ['Holdouts', 'Pre-registered metrics', 'Multiple-comparison correction', 'MMM calibrated by incrementality tests']);
  assert.ok(lis[3].includes('<a class="chip c-m" href="#asm-lever-04-evidence">Modelled</a>'));
  const after = s.slice(s.indexOf('</ol>'));
  assert.match(after, /<div class="callout">\s*<span class="lbl">We did not find<\/span>/);
  assert.ok(s.includes('The falsifier in <a href="#s01">section 01</a> still applies: if holdout-measured outcomes do not improve, the 2x claim is false for that organisation.'));
  assert.ok(!VENDOR_RE.test(strip(s)));
});

test('Run your own numbers CTA is identical in s02 and s10', () => {
  const cta = '<a class="btn btn-primary" href="#s11">Run your own numbers</a>';
  assert.equal((html.match(/class="btn btn-primary"/g) || []).length, 2);
  for (const id of ['s02', 's10']) {
    const s = sectionHtml(id);
    assert.ok(s.includes(cta), id);
    assert.ok(s.replace(/\s*<\/section>$/, '').endsWith(`<p>${cta}</p>`), `${id} CTA is last`);
  }
});

// ---- Plan 04-03: s13 adoption and Backlog 0 ----

test('s13 adoption and Backlog 0', () => {
  const s = sectionHtml('s13');
  assert.ok(!s.includes('class="later"'));
  const first = s.slice(s.indexOf('</div>')).match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  assert.equal(strip(first[1]), 'Adoption starts with the work that is safest to automate, and success is measured by how long approved demand waits.');
  assert.equal((s.match(/<table>/g) || []).length, 1);
  assert.ok(s.includes('<caption>Adoption stages by team: first move and guardrail</caption>'));
  const head = [...s.match(/<thead>[\s\S]*?<\/thead>/)[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => strip(m[1]));
  assert.deepEqual(head, ['Stage', 'Team', 'First move', 'Guardrail', 'Grade']);
  const rows = s.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g);
  assert.ok(rows.length >= 4 && rows.length <= 5);
  for (const r of rows) {
    assert.match(r, /<th scope="row">/);
    for (const c of r.match(/<td>[\s\S]*?<\/td>/g).slice(0, 3)) assert.ok(strip(c).split(' ').length <= 20, strip(c));
    assert.equal((r.match(/class="chip /g) || []).length, 1);
  }
  assert.ok(s.includes('<a href="#s11">section 11</a>'));
  assert.ok(/<h3>What stays human<\/h3>\s*(<p>[\s\S]*?<\/p>\s*)?<ul>/.test(s));
  const t = strip(s);
  assert.ok(!t.includes('Intercom'));
  assert.ok(!VENDOR_RE.test(t));
  assert.ok(!/does not have|does not exist/.test(t));
  assert.ok(t.includes('Replace the service level with your own; the rest of your numbers go in section 11 .'));
});

test('s13 Backlog 0 definition block', () => {
  const s = sectionHtml('s13');
  assert.equal((s.match(/<h3>Backlog 0, defined<\/h3>/g) || []).length, 1);
  const blk = s.match(/<div class="backlog0">[\s\S]*?<\/div>/)[0];
  const p = blk.match(/<p>([\s\S]*?)<\/p>/)[1];
  assert.equal(p, 'Backlog 0 means no approved brief waits longer than <span data-fig="asm-backlog0-days">8 days</span> <a class="chip c-m" href="#asm-backlog0-days">Modelled</a> for its first derived set to go live. Replace this with your own service level.');
  assert.ok(!blk.match(/<dl>[\s\S]*<\/dl>/)[0].includes('data-fig'));
  const dts = [...blk.matchAll(/<dt>([\s\S]*?)<\/dt>/g)].map((m) => strip(m[1]));
  assert.deepEqual(dts, ['Measure', 'Target', "Reader's number"]);
  assert.equal(assumptions['asm-backlog0-days'].display, '8 days');
});

// ---- Plan 04-03: s14 incidents ----

const INCIDENT_ROWS = [
  ['2025-12-10', '10 December 2025', 'Established', 'src-incident-mcdonalds-nl-2025'],
  ['2025-11-03', '3 November 2025', 'Disputed', 'src-incident-cocacola-2025'],
  ['2025-08', 'August 2025', 'Established', 'src-incident-guess-vogue-2025'],
  ['2024-02-14', '14 February 2024', 'Established', 'src-moffatt-air-canada-2024'],
  ['2023-03-22', '22 March 2023', 'Established', 'src-incident-levis-2023'],
];

test('s14 lead, status legend and incident table', () => {
  const s = sectionHtml('s14');
  const first = s.slice(s.indexOf('</div>')).match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  assert.equal(strip(first[1]), 'Most failures here are governance failures, and several have already happened to someone.');
  const legend = s.match(/<div class="legend">[\s\S]*?<\/div>/)[0];
  assert.deepEqual([...legend.matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map((m) => m[1]), [
    'Established: confirmed by a court, a regulator or the party concerned.',
    'Alleged: reported but not confirmed.',
    'Disputed: the parties disagree on the facts.',
  ]);
  assert.ok(s.indexOf('class="legend"') < s.indexOf('<table'));
  assert.ok(s.includes('<caption>Public incidents of AI-generated marketing content and agent liability, with status</caption>'));
  const head = [...s.match(/<thead>[\s\S]*?<\/thead>/)[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => strip(m[1]));
  assert.deepEqual(head, ['Incident', 'Date', 'What happened', 'Status', 'Source']);
  const rows = s.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g);
  assert.equal(rows.length, INCIDENT_ROWS.length);
  rows.forEach((r, i) => {
    const [dt, text, status, src] = INCIDENT_ROWS[i];
    assert.ok(r.includes(`<time datetime="${dt}">${text}</time>`), `${dt} date pair`);
    const marks = [...r.matchAll(/<span class="status status-(\w+)">(\w+)<\/span>/g)];
    assert.equal(marks.length, 1);
    assert.equal(marks[0][2], status);
    assert.equal(marks[0][1], status.toLowerCase());
    assert.ok(!/class="chip/.test(r));
    const tds = r.match(/<td>[\s\S]*?<\/td>/g);
    const what = strip(tds[1]);
    assert.ok(what.split(' ').length <= 25, what);
    assert.ok(!/\d/.test(what), what);
    assert.ok(!VENDOR_RE.test(strip(r)));
    const cites = [...r.matchAll(/class="cite" href="#(src-[^"]+)"/g)].map((m) => m[1]);
    assert.ok(cites.includes(src));
    for (const c of cites) assert.equal(sources[c.slice(4)].event, dt, c);
  });
  assert.ok(!strip(s).includes('Intercom'));
});

// ---- Plan 04-04: s14 risk blocks and register ----

const RISK_BLOCKS = [
  ['slop', 'Slop and sameness'],
  ['fatigue', 'Reviewer fatigue'],
  ['goodhart', 'Goodhart on counts and spend'],
  ['ip', 'IP and copyrightability'],
  ['regulation', 'Regulation'],
];

function riskBlock(slug) {
  const s = sectionHtml('s14');
  const start = s.indexOf(`<h3 id="s14-${slug}">`);
  assert.ok(start >= 0, `no block ${slug}`);
  const rest = s.slice(start + 10);
  const next = rest.search(/<h3 id="s14-|<div class="table-scroll"[^>]*aria-label="Risk register/);
  return s.slice(start, next < 0 ? s.length : start + 10 + next);
}

test('s14 risk blocks appear in order with answer-first, mitigation and as-at', () => {
  const s = sectionHtml('s14');
  const hs = [...s.matchAll(/<h3 id="s14-([a-z]+)">([^<]*)<\/h3>/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(hs.slice(0, RISK_BLOCKS.length), RISK_BLOCKS);
  for (const [slug] of RISK_BLOCKS) {
    const b = riskBlock(slug);
    const first = b.match(/<\/h3>\s*<p>([\s\S]*?)<\/p>/);
    assert.ok(first, `${slug}: first paragraph`);
    assert.ok(strip(first[1]).split(' ').length <= 30, `${slug}: answer-first sentence too long`);
    assert.match(b, /<p class="mitigation"><b>Mitigation:<\/b> [^<]/);
    const asat = b.match(/<p class="asat"><b>As at <time datetime="(\d{4}-\d{2}-\d{2})">[^<]*<\/time><\/b>:[\s\S]*?<\/p>/);
    assert.ok(asat, `${slug}: as-at callout`);
    assert.match(asat[0], /class="cite" href="#src-/);
    if (['ip', 'regulation'].includes(slug)) assert.ok(strip(asat[0]).endsWith('Check again before relying on it.'), slug);
  }
});

test('s14 reviewer fatigue cites Parasuraman and Manzey at abstract level only', () => {
  const b = riskBlock('fatigue');
  assert.ok(b.includes('href="#src-parasuraman-manzey-2010"'));
  assert.ok(b.includes('href="#s07"'));
  assert.match(strip(b), /expert/i);
  assert.match(strip(b), /training/i);
});

test('s14 risk register table', () => {
  const s = sectionHtml('s14');
  const t = s.match(/<table class="risk-register">[\s\S]*?<\/table>/);
  assert.ok(t, 'no risk register');
  assert.ok(t[0].includes('<caption>Risk register: likelihood grade, mitigation and owner</caption>'));
  const head = [...t[0].match(/<thead>[\s\S]*?<\/thead>/)[0].matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.deepEqual(head, ['Risk', 'Likelihood', 'Mitigation', 'Owner', 'Grade']);
  const rows = t[0].match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr>[\s\S]*?<\/tr>/g);
  assert.equal(rows.length, 6);
  assert.match(strip(rows[5]), /^Agent liability/);
  for (const r of rows) {
    const tds = [...r.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    assert.equal(tds.length, 4);
    assert.ok(['Low', 'Medium', 'High'].includes(strip(tds[0])), strip(tds[0]));
    assert.ok(['Brand governance', 'Legal', 'Marketing operations', 'Analytics'].includes(strip(tds[2])), strip(tds[2]));
    assert.match(tds[3], /^<a class="chip c-s" href="#asm-risk-likelihood">Speculative<\/a>$/);
    for (const c of r.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/g)) assert.ok(strip(c).split(' ').length <= 20, strip(c));
  }
  assert.ok(!/--low|--verified|\b(green|amber|red)\b/i.test(t[0]));
});

test('s14 regulation block states Article 50 dates exactly and does not overstate', () => {
  const b = riskBlock('regulation');
  const t = strip(b);
  assert.ok(b.includes('<time datetime="2026-08-02">2 August 2026</time>'));
  assert.ok(b.includes('<time datetime="2026-12-02">2 December 2026</time>'));
  assert.ok(b.includes('<span class="legal-ref">Article 50(2)</span>') && b.includes('<span class="legal-ref">Article 50(4)</span>'));
  assert.ok(t.includes('not delayed'));
  assert.ok(!/delays Article 50|Article 50 is delayed/.test(t));
  assert.ok(!/influencer/i.test(t));
  for (const id of ['src-eu-ai-act-art50', 'src-eu-ai-omnibus-2026-1744', 'src-eu-code-of-practice-transparency', 'src-asa-ai-disclosure-2025', 'src-ftc-fake-reviews-rule-2024']) assert.ok(b.includes(`href="#${id}"`), id);
  assert.ok(b.includes('data-fig="nyu-disclosure-drop"'));
  assert.ok(t.includes('voluntary'));
  assert.ok(b.includes('<time datetime="2025-05-29">') && b.includes('<time datetime="2024-08-14">'));
});

test('s14 carries four legal ids', () => {
  for (const id of ['legal-s14-copyright', 'legal-s14-regulation', 'legal-s14-agent-liability']) {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, id);
  }
});

test('no COI callout or Getty, Stability or iStock mention remains (CRED-04 removed at author\'s request)', () => {
  const css = readFileSync(new URL('../site/assets/style.css', import.meta.url), 'utf8');
  assert.ok(!/callout coi/.test(html));
  assert.ok(!/\.coi\b/.test(css));
  assert.ok(!/getty|istock|stability ai|v stability/i.test(html));
  assert.ok(!html.includes('id="s14-getty"') && !html.includes('id="legal-s05-getty"'));
  assert.ok(!Object.keys(sources).some((k) => /getty|stability/i.test(k)));
});

// ---- 03.1 reframe guards (D-03, D-04, D-07, D-09) ----
const guardText = (h) => strip(h.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ' '));
const guardSentences = (h) => guardText(h).split(/(?<=[.!?])\s+/);
const guardFigIds = (h) => [...h.matchAll(/data-fig="([^"]+)"/g)].map((m) => m[1]);
const guardVariantFig = /^(matrix-|cap-.*-variants$|avg-campaign-variants$)/;

test('03.1 reframe guards: no variants per head, no cycle time', (t) => {
  for (const sent of guardSentences(html)) {
    assert.ok(!(/variant/i.test(sent) && /per (marketing )?head/i.test(sent)), `variants per head: ${sent}`);
  }
  assert.ok(!/cycle time/i.test(guardText(html)), 'cycle time must read brief-to-live time');
});

test('03.1 reframe guards: "approved-live" is gone, the metric reads "approved asset" (WR-04)', () => {
  assert.ok(!/approved-live/i.test(guardText(html)), 'approved-live must read approved');
  assert.ok(!/approved-live/i.test(html), 'approved-live must not survive in markup or attributes');
});

test('03.1 reframe guards: the headline is a launch rate, never "in market" or "live per quarter" (WR-01)', () => {
  const stale = /in market per quarter|live per quarter|campaigns live across markets|campaign live in one market/i;
  assert.ok(!stale.test(guardText(html)), 'page text must say launched per quarter');
  assert.ok(!stale.test(html), 'markup and attributes must say launched per quarter');
  for (const id of ['cm-base', 'cm-scaled']) {
    assert.ok(!stale.test(claims[id].unit), `${id} unit`);
    assert.match(claims[id].unit, /launched per quarter/);
  }
  for (const f of ['model.js', 'svg.js', 'data.js']) {
    assert.ok(!stale.test(readFileSync(new URL(`../site/js/${f}`, import.meta.url), 'utf8')), `${f} must say launched per quarter`);
  }
  assert.match(guardText(sectionHtml('s01')), /campaign-markets launched per quarter/);
});

test('03.1 reframe guards: definition appears once, in s01', () => {
  const phrase = 'one campaign launched in one market';
  const all = guardText(html).toLowerCase().split(phrase).length - 1;
  assert.equal(all, 1);
  assert.ok(guardText(sectionHtml('s01')).toLowerCase().includes(phrase));
});

test('03.1 reframe guards: variant-count figures stay in s05, s07, s15', () => {
  const body = html.replace(/<script\b[\s\S]*?<\/script>/g, '');
  const hits = {};
  for (const m of body.matchAll(/<section id="([^"]+)"[\s\S]*?<\/section>/g)) {
    for (const id of guardFigIds(m[0])) if (guardVariantFig.test(id)) (hits[m[1]] ||= []).push(id);
  }
  assert.ok(hits.s05 && hits.s07, 'figures present in s05 and s07');
  for (const sec of Object.keys(hits)) assert.ok(['s05', 's07', 's15'].includes(sec), `${hits[sec][0]} appears in ${sec}`);
});

test('03.1 reframe guards: s11 variant maths is labelled internal throughput', () => {
  const s = sectionHtml('s11');
  const steps = s.match(/<li><b>[\s\S]*?<\/li>/g) || [];
  const carrying = steps.filter((li) => /data-fig="calc-maths-(generated|hours)-/.test(li));
  assert.ok(carrying.length >= 2, 'both derived-variant steps present');
  for (const li of carrying) assert.ok(strip(li.match(/<b>([\s\S]*?)<\/b>/)[1]).includes('internal throughput, not the claim'), strip(li).slice(0, 60));
  const orphan = [...s.matchAll(/data-fig="calc-maths-(generated|hours)-[^"]*"/g)].length;
  const inSteps = carrying.join('').match(/data-fig="calc-maths-(generated|hours)-[^"]*"/g).length;
  assert.equal(orphan, inSteps, 'no variant maths figure outside a labelled step');
});

test('03.1 reframe guards: pipeline is not a headline', () => {
  const ans = html.slice(html.indexOf('<section id="answer"'), html.indexOf('</section>', html.indexOf('<section id="answer"')));
  const ansP = ans.match(/<p\b[\s\S]*?<\/p>/)[0];
  assert.ok(!/pipeline/i.test(strip(ansP)), 'answer paragraph');
  const s01 = sectionHtml('s01');
  const paras = s01.match(/<p\b[\s\S]*?<\/p>/g).slice(0, 2).join(' ');
  const trio = s01.match(/<div class="metric-trio">[\s\S]*?<\/div>\s*<\/div>|<div class="metric-trio">[\s\S]*?<\/div>/)[0];
  assert.ok(!/pipeline/i.test(strip(paras)), 's01 definition paragraphs');
  assert.ok(!/pipeline/i.test(strip(trio)), 's01 metric trio');
});
