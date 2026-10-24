import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Contrast checks on the colour tokens in style.css (UI-SPEC: text >= 4.5:1,
// non-text graphics >= 3:1). Added after code review WR-08.

const css = readFileSync(new URL('../site/assets/style.css', import.meta.url), 'utf8');
const root = css.match(/:root\s*{([\s\S]*?)}/)[1];
const token = (name) => {
  const m = root.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  assert.ok(m, `missing token --${name}`);
  return m[1];
};

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Every background a chip can sit on: the page, the legend and :target register
// rows (paper-2), and white in print.
const CHIP_BACKGROUNDS = { paper: token('paper'), 'paper-2': token('paper-2'), print: '#FFFFFF' };

test('contrast helper matches known WCAG values', () => {
  assert.ok(Math.abs(contrast('#000000', '#FFFFFF') - 21) < 1e-9);
  assert.ok(Math.abs(contrast('#777777', '#FFFFFF') - 4.48) < 0.01);
});

test('grade chip text is at least 4.5:1 on every background it sits on', () => {
  for (const grade of ['verified', 'inferred', 'low']) {
    for (const [bg, hex] of Object.entries(CHIP_BACKGROUNDS)) {
      const c = contrast(token(grade), hex);
      assert.ok(c >= 4.5, `--${grade} on ${bg} is ${c.toFixed(2)}:1`);
    }
  }
});

test('muted text (meta, captions, flags, later notes) is at least 4.5:1 on paper and paper-2', () => {
  for (const bg of ['paper', 'paper-2']) {
    const c = contrast(token('muted'), token(bg));
    assert.ok(c >= 4.5, `--muted on ${bg} is ${c.toFixed(2)}:1`);
  }
});

test('cost-stack fills are at least 3:1 against paper and white (WR-09)', () => {
  for (let i = 1; i <= 6; i++) {
    for (const [bg, hex] of [['paper', token('paper')], ['print', '#FFFFFF']]) {
      const c = contrast(token(`seg-${i}`), hex);
      assert.ok(c >= 3, `--seg-${i} on ${bg} is ${c.toFixed(2)}:1`);
    }
  }
});

test('cost segments are separated by a paper gap and alternate segments are hatched', () => {
  assert.match(css, /\.seg\s*{\s*stroke:\s*var\(--paper\);\s*stroke-width:\s*1\.5;/);
  for (const i of [1, 3, 5]) assert.match(css, new RegExp(`\\.seg-${i} { fill: var\\(--seg-${i}\\); }`));
  for (const i of [2, 4, 6]) {
    assert.match(css, new RegExp(`\\.hatch-bg-${i} { fill: var\\(--seg-${i}\\); }`));
    assert.ok(!new RegExp(`\\.seg-${i}\\s*{`).test(css), `.seg-${i} must not set a CSS fill (it would override the hatch)`);
  }
});

test('print shows each register URL once: link text is the URL and no ::after repeats it (IN-05)', () => {
  const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
  const links = [...html.matchAll(/<a href="(https?:[^"]+)">([^<]+)<\/a>/g)];
  assert.ok(links.length > 0);
  for (const [, href, text] of links) assert.equal(text, href);
  assert.ok(!/::after\s*{[^}]*attr\(href\)/.test(css));
});

// ---- Phase 2 plan 01: Phase 1 UI-review typography and legibility fixes ----

const rule = (selector) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`(?:^|\\n)${esc} {([^}]*)}`));
  assert.ok(m, `missing rule ${selector}`);
  return m[1];
};

test('bold text renders at 600, not the synthesised 700', () => {
  assert.ok(css.includes('strong, b { font-weight: 600; }'));
  const fc = rule('figcaption b');
  assert.ok(fc.includes('text-transform: uppercase') && fc.includes('font-weight: 600'));
});

test('metric-trio labels use the Label style', () => {
  const r = rule('.metric-trio .lbl');
  for (const d of ['display: block', 'font: 400 12px/1.6 var(--mono)', 'color: var(--muted)']) assert.ok(r.includes(d), d);
});

test('table row headers are ink, normal case body text; ids stay mono', () => {
  const r = rule('tbody th[scope=row]');
  for (const d of ['font: 400 17px/1.5 var(--serif)', 'text-transform: none', 'letter-spacing: 0', 'color: var(--ink)']) assert.ok(r.includes(d), d);
  assert.ok(rule('tbody th[scope=row].id').includes('font: 400 12px/1.6 var(--mono)'));
});

test('Figure 1 stays legible on phones: 12px text scaled by 800/960 is at least 10px', () => {
  assert.ok(!css.includes('min-width: 560px'));
  const m = css.match(/@media \(max-width: 960px\) {([\s\S]*?)\n}/);
  assert.ok(m, 'missing 960px media block');
  assert.ok(m[1].includes('svg.fig { min-width: 800px; }'));
  // Code review IN-02: compute the ratio from the real viewBox, CSS text size and
  // minimum rendered width, so a change to any of them is caught.
  const page = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
  const figs = [...page.matchAll(/<svg\b[^>]*\bclass="fig"[^>]*>/g)].map((x) => x[0]);
  assert.ok(figs.length >= 1, 'no svg.fig on the page');
  const textPx = Number(css.match(/\.fig text\s*{[^}]*font:\s*\d+\s+(\d+(?:\.\d+)?)px/)[1]);
  const minWidth = Number(m[1].match(/svg\.fig\s*{\s*min-width:\s*(\d+)px/)[1]);
  for (const open of figs) {
    const vbWidth = Number(open.match(/viewBox="0 0 (\d+(?:\.\d+)?) \d+(?:\.\d+)?"/)[1]);
    const effective = (textPx * Math.min(minWidth, vbWidth)) / vbWidth;
    assert.ok(effective >= 10, `svg.fig text renders at ${effective.toFixed(2)}px at its minimum width`);
  }
});

test('font sizes stay on the scale', () => {
  const ok = new Set(['12px', '16px', '17px', '25px', '31px', '10.5pt']);
  const sizes = [
    ...[...css.matchAll(/(?<![-\w])font:\s*\S+\s+([^\s/;}]+)/g)].map((m) => m[1]),
    ...[...css.matchAll(/font-size:\s*([^;}]+)/g)].map((m) => m[1].trim()),
  ];
  assert.ok(sizes.length > 5);
  for (const sz of sizes) assert.ok(ok.has(sz) || sz.startsWith('clamp('), `off-scale font size ${sz}`);
});

// ---- Phase 2 plan 02: diagram CSS ----

const rules = () => [...css.matchAll(/(?:^|\n|\s)([^{}@\n][^{}]*?) {([^}]*)}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));

test('diagram layout rules', () => {
  const g = rule('.fig-grid');
  assert.ok(g.includes('grid-template-columns: minmax(0, 360px) 1fr') && g.includes('gap: var(--s-lg)'));
  const s = rule('svg.fig-d');
  for (const d of ['width: 100%', 'max-width: 360px', 'height: auto']) assert.ok(s.includes(d), d);
  const t = rule('.fig-d text');
  assert.ok(t.includes('font: 400 12px') && t.includes('fill: var(--ink)'));
  assert.ok(rule('.fig-d .node-t').includes('font-weight: 600'));
  assert.ok(rule('.fig-d .edge-soft').includes('stroke-dasharray: 4 4'));
  const m = css.match(/@media \(max-width: 720px\) {([\s\S]*?)\n}/);
  assert.ok(m && /\.fig-grid { grid-template-columns: 1fr; }/.test(m[1]), '720px fig-grid rule');
});

test('accent is used in diagrams only on review/gate paths', () => {
  for (const r of rules()) {
    if (!r.sel.includes('.fig-d')) continue;
    if (r.body.includes('var(--verified)')) assert.match(r.sel, /edge-review|node-review|arrow-head-review/, r.sel);
    assert.ok(!r.body.includes('--inferred') && !r.body.includes('--low'), r.sel);
  }
});

test('diagram print rules', () => {
  const blocks = css.match(/@media print {[\s\S]*$/g);
  assert.equal((css.match(/@media print/g) || []).length, 1);
  const p = blocks[0];
  for (const d of ['.fig-grid { display: block; }', 'svg.fig-d { max-width: 320px; }']) assert.ok(p.includes(d), d);
  assert.match(p, /\.fig-d \.edge-review[^{]*{[^}]*stroke: #000;[^}]*stroke-width: 3;/);
  assert.match(p, /\.fig-d \.node-review rect { fill: #fff; }/);
  assert.match(p, /[^{}]*\.fig-grid[^{}]*{ break-inside: avoid; }/);
});

test('diagram contrast', () => {
  assert.ok(contrast(token('verified'), token('paper-2')) >= 3);
  assert.ok(contrast(token('ink'), token('paper')) >= 4.5);
});

// ---- Phase 2 plan 05: default mark ----

test('.default-mark is a bordered mono tag and prints with a black border', () => {
  const r = rule('.default-mark');
  for (const d of ['font: 600 12px/1.6 var(--mono)', 'border: 1px solid var(--ink)', 'padding: var(--s-xs) var(--s-sm)', 'border-radius: 2px', 'color: var(--ink)']) assert.ok(r.includes(d), d);
  assert.ok(css.match(/@media print {[\s\S]*$/)[0].includes('.default-mark'));
});

// Phase 3 Plan 1: Phase 2 UI-review fixes.
test('table cells align on the baseline with tabular numerals', () => {
  const rule = css.match(/(?:^|\n)th, td \{([^}]*)\}/);
  assert.ok(rule, 'th, td rule');
  assert.match(rule[1], /vertical-align:\s*baseline/);
  assert.match(css, /table \{[^}]*font-variant-numeric:\s*tabular-nums/);
});

test('total row has 600 weight and a 1px ink top rule', () => {
  const rule = css.match(/tr\.total th, tr\.total td \{([^}]*)\}/);
  assert.ok(rule, 'tr.total rule');
  assert.match(rule[1], /font-weight:\s*600/);
  assert.match(rule[1], /border-top:\s*1px solid var\(--ink\)/);
});

test('tier row headers use the specific selector', () => {
  assert.match(css, /tbody th\[scope=row\]\.tier \{/);
  assert.ok(!/^th\.tier/m.test(css));
});

// Phase 3 Plan 4: buttons and proof list.
test('.btn and .btn-primary follow the UI-SPEC', () => {
  const rule = (sel) => (css.match(new RegExp(`(?:^|\\n)${sel.replace(/[.:]/g, '\\$&')} \\{([^}]*)\\}`)) || [])[1] || '';
  const b = rule('.btn');
  for (const d of ['min-height: 48px', 'border: 2px solid var(--ink)', 'border-radius: 2px', 'background: var(--paper)', 'color: var(--ink)']) assert.ok(b.includes(d), d);
  assert.ok(rule('.btn-primary').includes('background: var(--ink)') && rule('.btn-primary').includes('color: var(--paper)'));
  assert.ok(rule('.btn:hover').includes('var(--paper-2)'));
  assert.ok(rule('.btn-primary:hover').includes('var(--ink-2)'));
  assert.match(css, /@media print \{[\s\S]*\.btn-primary \{ display: none; \}/);
  assert.match(css, /@media \(max-width: 720px\) \{[\s\S]*?\.btn \{ width: 100%;/);
  assert.match(css, /ol\.proof-steps li \+ li \{ margin-top: var\(--s-md\); \}/);
  assert.ok(!/outline:\s*none/.test(css));
});

// Phase 3 Plan 6: calculator form.
test('calculator form CSS follows the UI-SPEC', () => {
  const rl = (sel) => (css.match(new RegExp(`(?:^|\\n)${sel.replace(/[.\[\]=:]/g, '\\$&')} \\{([^}]*)\\}`)) || [])[1] || '';
  const input = rl('.control input');
  assert.match(input, /min-height:\s*48px/);
  const fs = Number(input.match(/font:\s*\d+\s+(\d+)px/)[1]);
  assert.ok(fs >= 16);
  assert.match(rl('.btn'), /min-height:\s*48px/);
  assert.match(rl('.is-invalid .control, .control.is-invalid'), /border:\s*3px solid var\(--ink\)/);
  assert.match(rl('.field-error'), /border-left:\s*3px solid var\(--ink\)/);
  assert.match(css, /accent-color:\s*var\(--ink\)/);
  assert.match(css, /@media \(max-width: 720px\) \{[\s\S]*?fieldset\.calc-group \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /@media print \{[\s\S]*\.share, \.calc-errors, \.calc-nojs, \.calc-live \.btn \{ display: none; \}/);
  const added = css.slice(css.indexOf('.calc-form {'), css.indexOf('ol.proof-steps {'));
  for (const [, v] of added.matchAll(/(?:^|[^-])color:\s*([^;}]+)/g)) assert.match(v.trim(), /^var\(--(ink|muted|verified|paper|paper-2)\)$/, v);
});

test('Figure 8 opts out of the Figure 1 phone minimum width', () => {
  const m = css.match(/@media \(max-width: 960px\) {([\s\S]*?)\n}/);
  assert.ok(m[1].includes('svg.fig { min-width: 800px; }'), 'Figure 1 rule untouched');
  assert.ok(m[1].includes('svg.fig.fig-live { min-width: 0; }'));
  assert.ok(m[1].indexOf('svg.fig.fig-live') > m[1].indexOf('svg.fig { min-width: 800px; }'));
  const page = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
  assert.equal((page.match(/<svg\b[^>]*\bclass="fig fig-live"/g) || []).length, 1);
  assert.ok(/svg\.fig-live\s*{[^}]*max-width: 360px/.test(css));
});

// Phase 4 Plan 1: Phase 3 UI-review fixes 1, 2 and 3.
test('details.maths summary keeps the native disclosure marker and a 48px target', () => {
  const r = rule('details.maths summary');
  assert.ok(r.includes('display: list-item'));
  assert.ok(!r.includes('display: flex'));
  assert.ok(r.includes('min-height: 48px') && r.includes('padding: var(--s-md) 0'));
});

test('scenario radios render at 24 x 24 px (WCAG 2.5.8)', () => {
  const r = rule('.radio input');
  assert.ok(r.includes('width: 24px') && r.includes('height: 24px'));
});

test('table numbers match their 17px row labels; Not applicable is muted', () => {
  assert.ok(rule('td.num').includes('font: 400 17px/1.6 var(--mono)'));
  const na = rule('td.na');
  assert.ok(na.includes('font: 400 17px/1.6 var(--mono)') && na.includes('color: var(--muted)'));
  const m = css.match(/@media \(max-width: 720px\) {([\s\S]*?)\n}/);
  assert.ok(/td\.num, td\.na { font-size: 16px; }/.test(m[1]));
});

// ---- Phase 4 plan 03: Backlog 0 block ----

test('.backlog0 is a paper-2 panel with tokens only', () => {
  const r = rule('.backlog0');
  for (const d of ['background: var(--paper-2)', 'border: 1px solid var(--rule)', 'padding: var(--s-lg)', 'max-width: 44em']) assert.ok(r.includes(d), d);
  assert.ok(!/--verified|--low/.test(r));
});

test('.status is a bordered mono tag with a non-colour cue per variant', () => {
  const r = rule('.status');
  for (const d of ['font: 600 12px/1.6 var(--mono)', 'text-transform: uppercase', 'letter-spacing: .08em', 'color: var(--ink)', 'border: 1px solid var(--ink)']) assert.ok(r.includes(d), d);
  assert.ok(rule('.status-alleged').includes('border-style: dashed'));
  const d = rule('.status-disputed');
  assert.ok(d.includes('border-style: double') && d.includes('border-width: 3px'));
  for (const s of ['.status', '.status-alleged', '.status-disputed']) assert.ok(!/--low|--verified|background/.test(rule(s)), s);
});

// ---- Phase 4 plan 04: risk blocks ----

test('.asat is ruled top and bottom, .risk is spaced, no status colours', () => {
  const a = rule('.asat');
  for (const d of ['border-top: 1px solid var(--rule)', 'border-bottom: 1px solid var(--rule)', 'padding: var(--s-sm) 0']) assert.ok(a.includes(d), d);
  assert.ok(rule('.risk').includes('margin: var(--s-xl) 0'));
  for (const s of ['.asat', '.risk', '.mitigation']) assert.ok(!/--low|--verified/.test(rule(s)), s);
});
