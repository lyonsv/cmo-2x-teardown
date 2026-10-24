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
  assert.ok((12 * 800) / 960 >= 10);
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
