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
