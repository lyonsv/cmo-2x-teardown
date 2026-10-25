import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { modelContext, claims, assumptions } from '../site/js/data.js';
import { present, defaultValues, RESULT_ROWS, SENSITIVITY_STEP } from '../site/js/model.js';
import { FIELDS } from '../site/js/fields.js';
import { toText } from '../site/js/state.js';
import { formatValue } from '../site/js/format.js';
import { elementById } from './helpers/html.js';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const s11 = elementById(html, 's11');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const strip = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const ctx = modelContext();
const p = present(defaultValues(ctx), ctx);
const CHIP_CLASS = { Benchmark: 'c-b', Modelled: 'c-m', Speculative: 'c-s' };

// ---- Phase 4 Plan 1: the s11 group grade rule (chip density amendment) ----
// GROUPED names the s11 groups. A group shows its grade chip once, in one note, and
// every member still resolves to a register row through a plain link. The rule is only
// valid while all members of a group share one grade: assertGroupRule fails loudly
// otherwise, and per-member chips must be restored.
const GROUPED = {
  fieldsets: { volume: 'Volume', people: 'People', cost: 'Cost and quality', automation: 'Automation' },
  tables: ['Calculator results', 'Headcount scenario', 'Sensitivity'],
};

function assertGroupRule(name, members, noteHtml) {
  const grades = new Set(members.map((m) => m.grade));
  assert.equal(grades.size, 1, `${name}: group members no longer share one grade: restore per-member chips`);
  const [grade] = grades;
  const refs = [...new Set(members.map((m) => m.ref))];
  const chips = [...noteHtml.matchAll(/<a class="chip (c-[bms])" href="#([^"]+)">([^<]+)<\/a>/g)];
  assert.equal(chips.length, 1, `${name}: the note carries exactly one chip`);
  assert.equal(chips[0][3], grade, `${name}: note chip word`);
  assert.equal(chips[0][1], CHIP_CLASS[grade], `${name}: note chip class`);
  assert.equal(chips[0][2], refs[0], `${name}: note chip links the first member ref`);
  const links = [...noteHtml.matchAll(/<a href="#([^"]+)">([^<]+)<\/a>/g)];
  for (const [, href, text] of links) assert.equal(text, href, `${name}: register link text`);
  assert.deepEqual([...new Set(links.map((l) => l[1]))].sort(), [...refs].sort(), `${name}: register links equal the member refs`);
  for (const ref of refs) assert.ok(assumptions[ref], `${name}: ${ref} is an assumption row`);
}

function regionOf(label) {
  const i = s11.indexOf(`aria-label="${label}"`);
  assert.ok(i >= 0, label);
  const start = s11.lastIndexOf('<div class="table-scroll"', i);
  const endTable = s11.indexOf('</table>', i);
  const end = s11.indexOf('</div>', endTable) + '</div>'.length;
  const note = s11.slice(end).match(/^\s*(<p class="table-note grade-note">[\s\S]*?<\/p>)/);
  return { region: s11.slice(start, end), note: note && note[1] };
}

test('s11 reads in order: lead, status, no-JS note, summary output, results table', () => {
  const idx = [
    s11.indexOf('Replace the defaults with your own numbers. The page recomputes campaign-markets launched per quarter, brief-to-live time, cost per approved asset and per campaign-market, reviewer load and the auto-approval share you would need.'),
    s11.indexOf('<p role="status" class="calc-status">Showing: page defaults</p>'),
    s11.indexOf('<p class="calc-nojs">The interactive calculator needs JavaScript. Below is the default scenario, calculated in advance from the same model.</p>'),
    s11.indexOf('<output id="calc-summary" aria-live="polite" aria-atomic="true">The table below shows the page defaults.</output>'),
    s11.indexOf('<caption>Results for your numbers (baseline and 2x)</caption>'),
  ];
  for (const i of idx) assert.ok(i >= 0, `missing element, positions ${idx}`);
  assert.deepEqual([...idx].sort((a, b) => a - b), idx, 'elements out of order');
  assert.ok(/<p><output id="calc-summary"/.test(s11), 'summary output sits in its own paragraph');
});

test('s11 has one live region and the table is not inside an output', () => {
  assert.equal((s11.match(/aria-live=/g) || []).length, 1);
  const out = s11.match(/<output[\s\S]*?<\/output>/g) || [];
  assert.equal(out.length, 1);
  assert.ok(!out[0].includes('<table'));
});

test('results table: head, ten rows in model order, cells equal present(defaults)', () => {
  const region = s11.match(/<div class="table-scroll"[^>]*aria-label="Calculator results"[^>]*>([\s\S]*?)<\/table>/);
  assert.ok(region, 'results region');
  assert.ok(/role="region"/.test(region[0]) && /tabindex="0"/.test(region[0]));
  const table = region[1];
  const head = [...table.match(/<thead>([\s\S]*?)<\/thead>/)[1].matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.deepEqual(head, ['Output', 'Baseline', '2x', 'Change']);
  const body = table.slice(table.indexOf('<tbody>'));
  const trs = body.match(/<tr>[\s\S]*?<\/tr>/g);
  assert.equal(trs.length, 10);
  trs.forEach((tr, i) => {
    const def = RESULT_ROWS[i];
    const row = p.rows[i];
    assert.equal(strip(tr.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]), def.label);
    const tds = [...tr.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/g)];
    assert.equal(tds.length, 3);
    assert.ok(!tr.includes('class="chip'), `${def.id}: grouped rows carry no chip`);
    ['base', 'scaled', 'change'].forEach((name, c) => {
      const node = row[name];
      const [, attrs, inner] = tds[c];
      if (node.value === undefined) {
        assert.equal(strip(inner), node.text);
        assert.ok(!attrs.includes('num'), `${def.id} ${name}: text cell must not be td.num`);
        if (node.text === 'Not applicable') assert.equal(attrs.trim(), 'class="na"', `${def.id} ${name}: Not applicable is td.na`);
        assert.ok(!inner.includes('data-fig'));
      } else {
        assert.equal(attrs.trim(), 'class="num"', `${def.id} ${name}`);
        const fig = inner.match(new RegExp(`^<span data-fig="calc-${def.id}-${name}">([^<]*)</span>$`));
        assert.ok(fig, `${def.id} ${name}: cell is exactly one data-fig span`);
        assert.equal(decode(fig[1]), node.text);
        const claim = claims[`calc-${def.id}-${name}`];
        assert.equal(claim.display, node.text);
        assert.equal(claim.grade, row.grade);
        assert.equal(claim.ref, row.ref);
      }
    });
  });
  const { note } = regionOf('Calculator results');
  assert.ok(note, 'results table is followed by its grade note');
  assertGroupRule('results', p.rows, note);
});

test('break-even and capacity floor are rows of their own', () => {
  assert.equal(p.rows.find((r) => r.id === 'break_even').scaled.text, '41%');
  assert.equal(p.rows.find((r) => r.id === 'capacity_floor').scaled.text, '29%');
  assert.ok(s11.includes('data-fig="calc-break_even-scaled">41%</span>'));
  assert.ok(s11.includes('data-fig="calc-capacity_floor-scaled">29%</span>'));
});

test('table note and fixed-assumptions sentence follow the table', () => {
  const tableEnd = s11.indexOf('</table>');
  const note = s11.indexOf('<p class="table-note">Each output carries the weakest grade of the inputs it uses. Cost per campaign-market is the same cost as cost per approved asset, expressed per campaign-market, so its change always matches; it is not separate evidence.</p>');
  const fixed = s11.indexOf('<p class="fixed-note">Fixed assumptions that are not inputs here (tier mix, reviewer rate, tooling, rights, storage and today\'s variant cost) are listed with their grades in the <a href="#assumptions-register">assumptions register</a>.</p>');
  assert.ok(tableEnd > 0 && note > tableEnd && fixed > note, `order ${tableEnd} ${note} ${fixed}`);
  assert.match(html, /<div class="table-scroll" id="assumptions-register" role="region"/);
});

test('calculator assumptions have register rows', () => {
  for (const id of ['asm-markets', 'asm-formats-per-market', 'asm-growth-route']) {
    assert.ok(html.includes(`<tr id="${id}">`), id);
  }
});

// ---- Plan 03-06: the form, error summary and share panel ----

function calcLiveWrappers() {
  const out = [];
  const re = /<div class="calc-live" id="([^"]+)">/g;
  let m;
  while ((m = re.exec(s11))) {
    let depth = 1;
    let i = m.index + m[0].length;
    const tag = /<(\/?)div\b[^>]*>/g;
    tag.lastIndex = i;
    let t;
    while (depth > 0 && (t = tag.exec(s11))) depth += t[1] ? -1 : 1;
    out.push({ id: m[1], inner: s11.slice(i, t.index) });
  }
  return out;
}

test('s11 order: lead, status, no-JS, form, errors, summary, results, share last', () => {
  const at = (needle) => {
    const i = s11.indexOf(needle);
    assert.ok(i >= 0, needle);
    return i;
  };
  const order = [
    at('<p role="status" class="calc-status">'),
    at('<p class="calc-nojs">'), at('<div class="calc-live" id="calc-form-wrap">'), at('<div class="calc-live" id="calc-errors-wrap">'),
    at('<p><output id="calc-summary"'), at('aria-label="Calculator results"'), at('<div class="calc-live" id="calc-share-wrap">'),
  ];
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  const share = calcLiveWrappers().find((w) => w.id === 'calc-share-wrap');
  assert.ok(s11.indexOf(share.inner) + share.inner.length > s11.lastIndexOf('</table>'), 'share panel last');
  assert.equal((s11.match(/role="status"/g) || []).length, 2, 'status region and share status only');
});

test('no result, table, figure, details, believe panel or summary sits inside a .calc-live wrapper', () => {
  const wraps = calcLiveWrappers();
  assert.deepEqual(wraps.map((w) => w.id), ['calc-form-wrap', 'calc-errors-wrap', 'calc-share-wrap']);
  for (const w of wraps) {
    for (const bad of ['data-fig=', '<table', '<figure', '<details', 'class="believe"', 'id="calc-summary"']) {
      assert.ok(!w.inner.includes(bad), `${w.id} contains ${bad}`);
    }
  }
});

test('form: six groups, twelve fields in order with label, input, unit, chip and hint', () => {
  const wrap = calcLiveWrappers()[0].inner;
  assert.match(wrap, /^\s*<form class="calc-form" novalidate>[\s\S]*<\/form>\s*$/);
  const groups = [...wrap.matchAll(/<fieldset class="calc-group">\s*<legend>([^<]*)<\/legend>([\s\S]*?)<\/fieldset>/g)];
  assert.deepEqual(groups.map((g) => g[1]), ['Volume', 'How you get to 2x', 'People', 'Cost and quality', 'Automation', 'Headcount scenario']);
  const fields = groups.flatMap((g) => g[2].split('<div class="field">').slice(1));
  fields.forEach((html_, i) => {
    const f = FIELDS[i];
    const d = defaultValues(ctx)[f.key];
    assert.ok(html_.includes(`<label for="in-${f.key}">${f.label}</label>`), f.key);
    const input = `<input id="in-${f.key}" name="${f.key}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="hint-${f.key}" value="${toText(f, d)}">`;
    assert.ok(html_.includes(input), `${f.key} input`);
    assert.ok(html_.includes(`<span class="unit">${f.unit}</span>`), `${f.key} unit`);
    assert.ok(!html_.includes('class="chip'), `${f.key}: grouped fields carry no chip`);
    const hint = html_.match(new RegExp(`<p class="hint" id="hint-${f.key}">([^]*?)</p>`));
    assert.ok(hint && hint[1].startsWith(`Default ${f.hintFormat ? formatValue(d, f.hintFormat) : toText(f, d)}`), `${f.key} hint`);
    assert.ok(hint[1].endsWith(` Register row: <a href="#${f.asm}">${f.asm}</a>.`), `${f.key} hint ends with its register link`);
    hint[1] = hint[1].replace(/ Register row: <a href="[^"]+">[^<]+<\/a>\.$/, '');
    if (f.key === 'vcost') assert.ok(hint[1].startsWith('Default $0.80.'));
    if (f.key === 'mconcept') assert.ok(hint[1].startsWith('Default $1,200.'));
    // WR-02: hints must not claim an input changes "only" some outputs; both FTE
    // inputs also feed the scenario table (change cost, required and freed FTE).
    assert.ok(!/\bonly\b/.test(hint[1]), `${f.key} hint makes an "only" claim`);
    if (f.key === 'reviewers') assert.match(hint[1], /utilisation, brief-to-live time, break-even, the capacity floor and the headcount scenario, but not production cost\./);
    if (f.key === 'marketers') assert.match(hint[1], /the one-off change cost and the headcount scenario; the headline has no per-head denominator\./);
    assert.equal(FIELDS.filter((x) => x.key === f.key).length, 1);
  });
  assert.deepEqual(groups.map((g) => (g[2].match(/<div class="field">/g) || []).length), [3, 0, 3, 4, 2, 0]);
  // Group grade rule: each of the four field groups opens with one note and one chip.
  const fieldGroups = groups.filter((g) => g[1] !== 'How you get to 2x').slice(0, 4);
  const routeGroup = groups[1];
  assert.equal(routeGroup[2].match(/^\s*<p class="grade-note">Defaults in this group are <a class="chip c-m" href="#asm-growth-route">Modelled<\/a>\.<\/p>/) !== null, true);
  assert.equal((routeGroup[2].match(/class="chip /g) || []).length, 1, 'route group has one chip');
  fieldGroups.forEach((g, i) => {
    assert.equal(g[1], Object.values(GROUPED.fieldsets)[i]);
    const key = Object.keys(GROUPED.fieldsets)[i];
    const note = g[2].match(/^\s*(<p class="grade-note">[\s\S]*?<\/p>)/);
    assert.ok(note, `${g[1]}: first element after the legend is the grade note`);
    assert.ok(note[1].startsWith('<p class="grade-note">Defaults in this group are <a class="chip'), g[1]);
    const members = FIELDS.filter((f) => f.group === key).map((f) => ({ ref: f.asm, grade: assumptions[f.asm].grade }));
    const chips = note[1].match(/class="chip /g) || [];
    assert.equal(chips.length, 1);
    assert.equal((g[2].match(/class="chip /g) || []).length, 1, `${g[1]}: one chip in the whole group`);
    // The note carries the chip; each member's register link sits in its own hint.
    const hintLinks = [...g[2].matchAll(/Register row: (<a href="#[^"]+">[^<]+<\/a>)\./g)].map((m) => m[1]).join(' ');
    assertGroupRule(g[1], members, note[1] + hintLinks);
  });
  assert.deepEqual(FIELDS.map((f) => f.group), ['volume', 'volume', 'volume', 'people', 'people', 'people', 'cost', 'cost', 'cost', 'cost', 'automation', 'automation']);
  assert.ok(!/<h[234][^>]*tabindex/.test(s11), 'JS sets the s11-h heading tabindex, not the markup');
});

test('error summary and share panel markup', () => {
  const [, errors, share] = calcLiveWrappers();
  assert.ok(errors.inner.includes('<div class="calc-errors" role="alert" tabindex="-1" hidden>'));
  assert.ok(share.inner.includes('<h4>Share these numbers</h4>'));
  assert.ok(share.inner.includes('<input readonly id="share-link"'));
  assert.ok(share.inner.includes('<button type="button" class="btn" id="copy-link">Copy link</button>'));
  assert.ok(share.inner.includes('<button type="button" class="btn" id="reset-calc">Reset to defaults</button>'));
  assert.ok(share.inner.includes('The link stores your inputs in the address only. Nothing is sent or saved.'));
  assert.ok(share.inner.includes('<p role="status" class="share-status"></p>'));
});

// ---- Plan 03-06: browser-side source hygiene ----

test('site/js sources avoid HTML injection, storage, network and dynamic code', () => {
  const dir = new URL('../site/js/', import.meta.url);
  const FORBIDDEN = ['innerHTML', 'insertAdjacentHTML', 'outerHTML', 'document.write', '.style.', "setAttribute('style'",
    'localStorage', 'sessionStorage', 'document.cookie', 'fetch(', 'XMLHttpRequest', 'eval(', 'new Function'];
  for (const file of ['ui.js', 'model.js', 'state.js', 'fields.js', 'format.js']) {
    const src = readFileSync(new URL(file, dir), 'utf8');
    for (const bad of FORBIDDEN) assert.ok(!src.includes(bad), `${file} contains ${bad}`);
  }
});

test('every import specifier in site/js is a same-folder relative path', () => {
  const dir = new URL('../site/js/', import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const src = readFileSync(new URL(file, dir), 'utf8');
    for (const [, spec] of src.matchAll(/(?:from|import)\s*\(?\s*'([^']+)'/g)) assert.ok(spec.startsWith('./'), `${file}: ${spec}`);
  }
});

test('ui.js stays thin', () => {
  const lines = readFileSync(new URL('../site/js/ui.js', import.meta.url), 'utf8').split('\n').length;
  assert.ok(lines < 300, `ui.js is ${lines} lines`);
});

// ---- Plan 03-07: headcount scenario radios, scenario table, sensitivity table ----

const decodeAll = (x) => decode(x);

test('Headcount scenario group: three radios, redeploy checked, change-cost line with chip', () => {
  const wrap = calcLiveWrappers()[0].inner;
  const group = wrap.match(/<fieldset class="calc-group">\s*<legend>Headcount scenario<\/legend>([\s\S]*?)<\/fieldset>/);
  assert.ok(group, 'scenario fieldset');
  const labels = [...group[1].matchAll(/<label class="radio"><input type="radio" name="scenario" value="(redeploy|hold|reduce)"( checked)?><span class="radio-text"><span class="radio-title">([^<]*)<\/span><span class="radio-desc">([^<]*)<\/span><\/span><\/label>/g)];
  assert.deepEqual(labels.map((m) => [m[1], !!m[2], m[3], decodeAll(m[4])]), [
    ['redeploy', true, 'Redeploy', 'Keep the team and move freed capacity to new work.'],
    ['hold', false, 'Hold', "Keep the team and today's volume; take any saving as lower cost."],
    ['reduce', false, 'Reduce', 'Cut reviewer headcount to the capacity the 2x output needs.'],
  ]);
  const chg = assumptions['asm-change-mgmt'];
  // WR-06: the form sits in a .calc-live wrapper, which carries no data-fig, so the
  // figure is pinned here to the asm-change-mgmt display and the numeric gate
  // exempts exactly this sentence, built from data.js.
  assert.ok(group[1].includes(`<p class="hint radio-note">Change-management cost: ${chg.display}, included in every scenario. <a class="chip ${CHIP_CLASS[chg.grade]}" href="#asm-change-mgmt">${chg.grade}</a></p>`), 'change cost is the asm-change-mgmt display');
  assert.equal(chg.display, `${formatValue(chg.value, 'usd0')} per affected FTE`);
  assert.equal((html.match(/name="scenario"/g) || []).length, 3);
});

test('How you get to 2x group: three radios, both checked, name="route" three times', () => {
  const wrap = calcLiveWrappers()[0].inner;
  const group = wrap.match(/<fieldset class="calc-group">\s*<legend>How you get to 2x<\/legend>([\s\S]*?)<\/fieldset>/);
  assert.ok(group, 'route fieldset');
  const labels = [...group[1].matchAll(/<label class="radio"><input type="radio" name="route" value="(both|campaigns|markets)"( checked)?><span class="radio-text"><span class="radio-title">([^<]*)<\/span><span class="radio-desc">([^<]*)<\/span><\/span><\/label>/g)];
  assert.deepEqual(labels.map((m) => [m[1], !!m[2], m[3], decodeAll(m[4])]), [
    ['both', true, 'Both', 'More campaigns and more markets, each grown by the same factor.'],
    ['campaigns', false, 'More campaigns', 'Same markets; every new campaign needs its own master concepts.'],
    ['markets', false, 'More markets', 'Same campaigns launched in more markets; master concepts are reused.'],
  ]);
  assert.equal((html.match(/name="route"/g) || []).length, 3);
});

function tableAfter(caption) {
  const i = s11.indexOf(`<caption>${caption}</caption>`);
  assert.ok(i >= 0, caption);
  const start = s11.lastIndexOf('<table>', i);
  return { table: s11.slice(start, s11.indexOf('</table>', i)), after: s11.slice(s11.indexOf('</table>', i)), start };
}

test('scenario table: six rows equal present(defaults).scenario; one grade note, no row chips', () => {
  const { table } = tableAfter('Headcount scenario: Redeploy');
  assert.equal(p.scenario.name, 'Redeploy');
  const trs = table.slice(table.indexOf('<tbody>')).match(/<tr>[\s\S]*?<\/tr>/g);
  assert.equal(trs.length, 6);
  trs.forEach((tr, i) => {
    const row = p.scenario.rows[i];
    assert.equal(strip(tr.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]), row.label);
    const fig = tr.match(new RegExp(`<td class="num"><span data-fig="calc-scen-${row.id}">([^<]*)</span></td>`));
    assert.ok(fig, row.id);
    assert.equal(decode(fig[1]), row.text);
    assert.equal(claims[`calc-scen-${row.id}`].display, row.text);
    assert.ok(!tr.includes('class="chip'), `${row.id}: grouped rows carry no chip`);
  });
  // WR-03: the Hold sentence is scoped to the page defaults and its figure is the presenter's Hold row.
  const hold = present({ ...defaultValues(ctx), scenario: 'hold' }, ctx).scenario.rows.find((r) => r.id === 'production_cost_change');
  const word = hold.value < 0 ? 'a saving' : 'an increase';
  assert.ok(s11.includes(`At the page defaults, Hold's change in annual production cost is <span data-fig="calc-scen-hold-production_cost_change">${hold.text}</span> <a class="chip ${CHIP_CLASS[hold.grade]}" href="#${hold.ref}">${hold.grade}</a> (${word}), because higher tooling cost offsets cheaper variants; choose Hold above to see the figure for your inputs.`));
  assert.ok(!/Hold changes annual production cost by only/.test(s11), 'the confusing "only" wording is gone');
  assert.ok(Math.abs(hold.value) < 60000, 'Hold change stays small at the defaults');
  assert.ok(!/Hold saves little/.test(s11), 'no unscoped Hold claim');
  const { note } = regionOf('Headcount scenario');
  assert.ok(note, 'scenario table is followed by its grade note');
  assertGroupRule('scenario', p.scenario.rows, note);
  // The refs do not depend on the chosen scenario, so the one note serves all three.
  for (const mode of ['redeploy', 'hold', 'reduce']) {
    const rows = present({ ...defaultValues(ctx), scenario: mode }, ctx).scenario.rows;
    assert.deepEqual([...new Set(rows.map((r) => r.ref))].sort(), [...new Set(p.scenario.rows.map((r) => r.ref))].sort(), `${mode} refs`);
  }
  assert.deepEqual(trs.map((tr) => tr.match(/calc-scen-([a-z_]+)/)[1]), ['reviewer_fte_required', 'reviewer_fte_delta', 'people_cost_change', 'production_cost_change', 'change_mgmt_one_off', 'first_year_net']);
});

test('sensitivity table: header, five ranked rows equal present(defaults), capped marked and footnoted', () => {
  const { table, after } = tableAfter('Sensitivity: each input moved 20% down and up, others unchanged');
  assert.ok(table.includes('<th scope="colgroup" colspan="2">Cost per approved asset</th>'));
  assert.ok(table.includes('<th scope="colgroup" colspan="2">Reviewer utilisation</th>'));
  assert.equal((table.match(/<th scope="col">at \u221220%<\/th>/g) || []).length, 2);
  assert.equal((table.match(/<th scope="col">at \+20%<\/th>/g) || []).length, 2);
  const trs = table.slice(table.indexOf('<tbody>')).match(/<tr>[\s\S]*?<\/tr>/g);
  assert.equal(trs.length, 5);
  trs.forEach((tr, i) => {
    const row = p.sensitivity[i];
    assert.equal(strip(tr.match(/<th scope="row">([\s\S]*?)<\/th>/)[1]), row.label);
    for (const c of ['costDown', 'costUp', 'utilDown', 'utilUp']) {
      const dir = c.endsWith('Down') ? 'down' : 'up';
      const m = tr.match(new RegExp(`<span data-fig="calc-sens-${row.key}-${c}">([^<]*)</span> <span class="capped">([^<]*)</span>`));
      assert.ok(m, `${row.key} ${c}`);
      assert.equal(decode(m[1]), row.cells[c].text);
      assert.equal(m[2], row.capped[dir] ? 'capped' : '');
      assert.equal(claims[`calc-sens-${row.key}-${c}`].display, row.cells[c].text);
    }
    assert.ok(!tr.includes('class="chip'), `${row.key}: grouped rows carry no chip`);
  });
  const { note } = regionOf('Sensitivity');
  assert.ok(note, 'sensitivity table is followed by its grade note');
  assertGroupRule('sensitivity', p.sensitivity, note);
  assert.ok(!table.includes('>Grade<'), 'no Grade column');
  assert.ok(trs.some((tr) => tr.includes('capped</span>')), 'at least one capped cell at defaults');
  assert.ok(after.includes('<p class="table-note">Capped: the input cannot move further without leaving its valid range.</p>'));
});

// WR-01: ui.js rewrites the sensitivity grade note from present().sensitivityNote,
// so the static note must equal the presenter's note at defaults, and after a
// re-ranking the note must link every row actually shown at the weakest grade.
const sensNoteHtml = (n) => `Every figure in this table is <a class="chip ${CHIP_CLASS[n.grade]}" href="#${n.ref}">${n.grade}</a>. Register rows: `
  + `${n.refs.map((r) => `<a href="#${r}">${r}</a>`).join(', ')}.`;

test('sensitivity grade note equals the presenter note at defaults and follows a re-ranking (WR-01)', () => {
  const { note } = regionOf('Sensitivity');
  assert.equal(note.replace(/^<p class="table-note grade-note">|<\/p>$/g, ''), sensNoteHtml(p.sensitivityNote));
  const values = { ...defaultValues(ctx), vcost: 20, mconcept: 10 };
  const moved = present(values, ctx);
  const shown = moved.sensitivity.map((r) => r.key);
  assert.ok(shown.includes('vcost') && !p.sensitivity.some((r) => r.key === 'vcost'), `re-ranked rows ${shown}`);
  assert.deepEqual(moved.sensitivityNote.refs, [...new Set(moved.sensitivity.map((r) => r.ref))]);
  for (const r of moved.sensitivity) assert.ok(assumptions[r.ref], r.ref);
  // A weaker-graded input entering the table moves the note chip to that grade and row.
  const weak = { ...ctx, grades: { ...ctx.grades, 'asm-variant-cost': 'Speculative' } };
  const n = present(values, weak).sensitivityNote;
  assert.equal(n.grade, 'Speculative');
  assert.equal(n.ref, 'asm-variant-cost');
});

test('sensitivity step text is tied to SENSITIVITY_STEP (IN-03)', () => {
  const step = formatValue(SENSITIVITY_STEP, 'pct0');
  assert.ok(s11.includes(`<caption>Sensitivity: each input moved ${step} down and up, others unchanged</caption>`));
  assert.ok(s11.includes(`<tr><th scope="col">at −${step}</th><th scope="col">at +${step}</th><th scope="col">at −${step}</th><th scope="col">at +${step}</th></tr>`));
  assert.ok(p.believe.find((b) => b.key === 'vcost').statement.includes(`A ${step} rise moves`));
  assert.ok(s11.includes(`A ${step} rise moves cost per approved asset`));
});

test('scenario and sensitivity tables sit before the share panel and outside .calc-live', () => {
  const share = s11.indexOf('<div class="calc-live" id="calc-share-wrap">');
  assert.ok(s11.indexOf('Headcount scenario: Redeploy</caption>') > s11.indexOf('Each output carries the weakest grade'));
  assert.ok(s11.indexOf('Sensitivity: each input moved') > s11.indexOf('Headcount scenario: Redeploy</caption>'));
  assert.ok(s11.indexOf('Capped: the input cannot move further') < share);
});

// ---- Plan 03-08: Figure 8, show the maths, what you must believe ----

test('s11 order: results, fixed note, scenario, Figure 8, maths, believe, sensitivity, share', () => {
  const at = (needle) => {
    const i = s11.indexOf(needle);
    assert.ok(i >= 0, needle);
    return i;
  };
  const order = [
    at('<caption>Results for your numbers'), at('<p class="table-note">Each output carries'), at('<p class="fixed-note">'),
    at('Headcount scenario: Redeploy</caption>'), at('<b>Figure 8</b>'), at('<details class="maths">'), at('<div class="believe">'),
    at('Sensitivity: each input moved'), at('<div class="calc-live" id="calc-share-wrap">'),
  ];
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(s11, /<p class="fixed-note">[^<]*<a href="#assumptions-register">assumptions register<\/a>/);
  assert.ok(s11.indexOf('<p class="fixed-note">') - s11.indexOf('Each output carries') < 280, 'fixed note sits under the results table');
  // IN-02: cost per campaign-market is disclosed as a unit translation of cost per approved asset, in the results note and Figure 1.
  for (const where of [s11.slice(s11.indexOf('<p class="table-note">Each output carries')), html.slice(html.indexOf('<b>Figure 1</b>'))]) {
    assert.match(where.slice(0, 600), /expressed per campaign-market, so its change always matches; it is not separate evidence\./);
  }
  assert.match(s11, /<div class="fig-grid">[\s\S]*<svg class="fig fig-live"[\s\S]*How to read this[\s\S]*<\/figure>/);
});

test('details.maths: closed, eight steps with name, formula, "With your numbers:" and one chip', () => {
  const m = s11.match(/<details class="maths">\s*<summary>Show the maths<\/summary>\s*<ol class="maths-steps">([\s\S]*?)<\/ol>\s*<\/details>/);
  assert.ok(m, 'details.maths');
  assert.ok(!/<details class="maths" open/.test(s11));
  const lis = m[1].match(/<li>[\s\S]*?<\/li>/g);
  assert.equal(lis.length, 8);
  lis.forEach((li, i) => {
    const step = p.maths[i];
    assert.match(li, /^<li><b>[^<]+<\/b> <code>[^<]+<\/code><span class="maths-with">With your numbers: <code>/);
    assert.equal(strip(li.match(/<b>([^<]*)<\/b>/)[1]), step.name);
    assert.equal(strip(li.match(/<\/b> <code>([^<]*)<\/code>/)[1]), step.formula);
    const figs = [...li.matchAll(/<span data-fig="(calc-maths-[a-z_]+-[0-9r]+)">([^<]*)<\/span>/g)];
    assert.deepEqual(figs.map((f) => f[1]), [...step.parts, step.result].filter((x) => x.fig).map((x) => x.fig));
    figs.forEach((f, k) => assert.equal(decode(f[2]), [...step.parts, step.result].filter((x) => x.fig)[k].text));
    assert.equal((li.match(/class="chip /g) || []).length, 1);
    assert.ok(li.includes(`<a class="chip ${CHIP_CLASS[step.grade]}" href="#${step.ref}">${step.grade}</a>`));
  });
  for (const id of ['generated', 'hours']) {
    const step = p.maths.find((x) => x.id === id);
    assert.match(step.name, /internal throughput, not the claim/, id);
  }
});

test('s11 text has no "cycle time" and no per-head denominator', () => {
  const text = strip(s11);
  assert.ok(!/cycle time/i.test(text), 'cycle time');
  assert.ok(!/per head/i.test(text), 'per head');
});

test('.believe: lead, 5-7 items with figure and chip, three carry the result', () => {
  const m = s11.match(/<div class="believe">\s*<h4>What you must believe<\/h4>\s*<p>The result holds only if these hold\.<\/p>\s*<ul>([\s\S]*?)<\/ul>\s*<\/div>/);
  assert.ok(m, '.believe');
  const lis = m[1].match(/<li>[\s\S]*?<\/li>/g);
  assert.equal(lis.length, p.believe.length);
  assert.ok(lis.length >= 5 && lis.length <= 7);
  lis.forEach((li, i) => {
    const b = p.believe[i];
    assert.ok(li.includes(`data-fig="calc-believe-${b.key}">`), b.key);
    assert.equal((li.match(/class="chip /g) || []).length, 1);
    assert.ok(li.includes(`<a class="chip ${CHIP_CLASS[b.grade]}" href="#${b.ref}">${b.grade}</a>`));
    assert.equal(li.includes('<b class="default-mark">carries the result</b>'), b.carries);
    const plain = strip(li.replace('<b class="default-mark">carries the result</b>', '').replace(/<a class="chip[^>]*>[^<]*<\/a>/, '')).replace(/\s+([.,])/g, '$1');
    assert.equal(plain, b.statement);
  });
  assert.equal((s11.match(/carries the result/g) || []).length, 3);
  assert.match(m[1], /only slightly/);
});

test('Figure 8, maths and believe sit outside every .calc-live wrapper', () => {
  for (const w of calcLiveWrappers()) {
    for (const bad of ['<figure', '<details', 'class="believe"', '<svg', 'class="maths-steps"']) assert.ok(!w.inner.includes(bad), `${w.id} contains ${bad}`);
  }
});

test('ui.js has an invalid state for the chart and prints with the maths open', () => {
  const ui = readFileSync(new URL('../site/js/ui.js', import.meta.url), 'utf8');
  assert.ok(ui.includes('renderChart('));
  assert.ok(ui.includes('beforeprint') && ui.includes('afterprint'));
  assert.match(s11, /<p class="later chart-empty" hidden>Fix the highlighted inputs to see the chart\.<\/p>/);
});

test('site/js sources scanned for hygiene include svg.js and panels.js', () => {
  const FORBIDDEN = ['innerHTML', 'insertAdjacentHTML', 'outerHTML', 'document.write', '.style.', "setAttribute('style'", 'localStorage', 'fetch(', 'eval(', 'new Function'];
  for (const file of ['svg.js', 'panels.js']) {
    const src = readFileSync(new URL(`../site/js/${file}`, import.meta.url), 'utf8');
    for (const bad of FORBIDDEN) assert.ok(!src.includes(bad), `${file} contains ${bad}`);
  }
});
