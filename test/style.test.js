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
