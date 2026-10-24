import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Browser-free half of the WCAG 2.2 AA checklist (UI-SPEC page-wide QA, QA-01).
// Pinned exceptions are listed with a one-sentence reason; a stale key fails.
const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../site/assets/style.css', import.meta.url), 'utf8');
const strip = (s) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Keyed by table caption text.
const TABLE_EXCEPTIONS = {};
// Keyed by the figure's figcaption text (first 60 chars).
const FIGURE_EXCEPTIONS = {
  'Figure 8 Baseline against 2x for your numbers. Each panel ha': 'The live calculator chart redraws from the results table directly above it in the same section, and its caption sends the reader to that table for the exact values.',
};
// Sections without an h2 must carry a non-empty aria-label instead.
const SECTION_LABEL_EXCEPTIONS = {
  answer: 'The summary block is a single answer paragraph with no heading, so it is named by aria-label="Summary".',
};

const body = html.slice(html.indexOf('<body'));

// ---- structure ----
const headings = [...html.matchAll(/<h([1-6])\b[^>]*>/g)].map((m) => ({ level: Number(m[1]), at: m.index }));

test('exactly one h1', () => {
  assert.equal(headings.filter((h) => h.level === 1).length, 1);
});

test('heading levels never increase by more than one', () => {
  for (let i = 1; i < headings.length; i++) {
    assert.ok(headings[i].level - headings[i - 1].level <= 1, `h${headings[i - 1].level} then h${headings[i].level} at ${headings[i].at}`);
  }
});

test('every h4 has a preceding h3 in the same section', () => {
  for (const sec of html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)) {
    const hs = [...sec[1].matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    hs.forEach((lvl, i) => { if (lvl === 4) assert.ok(hs.slice(0, i).includes(3), 'h4 without a preceding h3 in its section'); });
  }
});

test('every section is labelled by its h2; lang en-GB; one title', () => {
  const secs = [...html.matchAll(/<section id="([^"]+)"([^>]*)>/g)];
  assert.ok(secs.length >= 15);
  for (const [, id, rest] of secs) {
    if (SECTION_LABEL_EXCEPTIONS[id]) { assert.match(rest, /aria-label="[^"]+"/, id); continue; }
    const m = rest.match(/aria-labelledby="([^"]+)"/);
    assert.ok(m, `${id} has aria-labelledby`);
    assert.ok(new RegExp(`<h2[^>]*id="${m[1]}"`).test(html), `${id} labelled by an h2 with id ${m[1]}`);
  }
  assert.match(html, /<html[^>]*\blang="en-GB"/);
  assert.equal((html.match(/<title>[^<]+<\/title>/g) || []).length, 1);
});

test('ids are unique and every in-page href resolves', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids.filter((v, i, a) => a.indexOf(v) !== i), []);
  const set = new Set(ids);
  for (const [, h] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(set.has(h), `href #${h}`);
});

// ---- tables ----
test('every table has a caption, th scope on column heads and sits in a labelled focusable scroll region', () => {
  const used = new Set();
  const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)];
  assert.ok(tables.length >= 8);
  for (const t of tables) {
    const cap = t[1].match(/<caption[^>]*>([\s\S]*?)<\/caption>/);
    assert.ok(cap && strip(cap[1]), `table at ${t.index} has a caption`);
    const name = strip(cap[1]);
    for (const th of (t[1].match(/<thead[\s\S]*?<\/thead>/) || [''])[0].matchAll(/<th\b([^>]*)>/g)) assert.match(th[1], /scope="/, `${name}: thead th has scope`);
    if (TABLE_EXCEPTIONS[name]) { used.add(name); continue; }
    const before = html.slice(0, t.index);
    const wrap = before.match(/<div class="table-scroll"([^>]*)>\s*$/);
    assert.ok(wrap, `${name}: directly inside .table-scroll`);
    assert.match(wrap[1], /role="region"/, name);
    assert.match(wrap[1], /aria-label="[^"]+"/, name);
    assert.match(wrap[1], /tabindex="0"/, name);
  }
  assert.deepEqual(Object.keys(TABLE_EXCEPTIONS).filter((k) => !used.has(k)), [], 'stale TABLE_EXCEPTIONS');
  for (const [k, v] of Object.entries(TABLE_EXCEPTIONS)) assert.ok(v.endsWith('.'), k);
});

// ---- svg and figures ----
test('every svg role=img has title, desc and aria-labelledby naming them', () => {
  const svgs = [...html.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/g)];
  assert.ok(svgs.length >= 8);
  for (const [, attrs, inner] of svgs) {
    assert.match(attrs, /role="img"/);
    const lb = attrs.match(/aria-labelledby="([^"]+)"/);
    assert.ok(lb, 'svg aria-labelledby');
    const title = inner.match(/<title id="([^"]+)">([^<]+)<\/title>/);
    const desc = inner.match(/<desc id="([^"]+)">([^<]+)<\/desc>/);
    assert.ok(title && desc, 'svg has title and desc with ids');
    assert.deepEqual(lb[1].split(/\s+/).sort(), [title[1], desc[1]].sort());
  }
});

test('every figure with an svg has a visible text equivalent', () => {
  const used = new Set();
  const figs = [...html.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/g)];
  for (const f of figs) {
    if (!f[1].includes('<svg')) continue;
    const cap = f[1].match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/);
    const key = strip(cap ? cap[1] : '').slice(0, 60);
    if (FIGURE_EXCEPTIONS[key]) { used.add(key); continue; }
    const after = html.slice(f.index + f[0].length);
    const sibling = /^\s*(?:<div class="table-scroll"[^>]*>\s*)?<(table|ol|ul)\b([^>]*)>/.exec(after);
    const inside = /<(table|ol|ul)\b([^>]*)>/.exec(f[1]);
    const eq = inside || sibling;
    assert.ok(eq, `figure "${key}" has a text equivalent`);
    assert.doesNotMatch(eq[2], /\bhidden\b|sr-only/, `figure "${key}" equivalent is visible`);
    const wrapper = /^\s*<div class="([^"]*)"/.exec(after);
    if (!inside && wrapper) assert.doesNotMatch(wrapper[1], /sr-only|hidden/);
  }
  assert.deepEqual(Object.keys(FIGURE_EXCEPTIONS).filter((k) => !used.has(k)), [], 'stale FIGURE_EXCEPTIONS');
  for (const [k, v] of Object.entries(FIGURE_EXCEPTIONS)) assert.ok(v.endsWith('.'), k);
});

// ---- forms and focus ----
test('every input, select and textarea has a label; no placeholder; no positive tabindex', () => {
  const controls = [...body.matchAll(/<(input|select|textarea)\b([^>]*)>/g)].filter((m) => !/type="hidden"/.test(m[2]));
  assert.ok(controls.length >= 12);
  for (const [, tag, attrs] of controls) {
    const id = attrs.match(/\bid="([^"]+)"/);
    if (id && new RegExp(`<label[^>]*\\bfor="${id[1]}"`).test(html)) continue;
    // Otherwise the control must be wrapped by its label (the scenario radios).
    const at = body.indexOf(`<${tag}${attrs}>`);
    const wrapped = body.lastIndexOf('<label', at) > body.lastIndexOf('</label>', at);
    assert.ok(wrapped, `${tag} ${attrs} is labelled by label for= or by a wrapping label`);
  }
  assert.doesNotMatch(body, /\splaceholder=/);
  for (const [, v] of body.matchAll(/tabindex="(-?\d+)"/g)) assert.ok(Number(v) <= 0, `tabindex ${v}`);
});

test('the skip link is the first focusable element and lands on #answer', () => {
  const first = /<(a|button|input|select|textarea|summary)\b[^>]*>|<[a-z0-9]+\b[^>]*\btabindex="0"[^>]*>/.exec(body);
  assert.ok(first);
  assert.equal(first[0], '<a class="skip" href="#answer">');
  assert.ok(html.includes('id="answer"'));
});

// ---- CSS ----
function blockEnd(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}' && --depth === 0) return i;
  }
  throw new Error('unbalanced css');
}

function rules() {
  const out = [];
  const printRanges = [];
  for (const m of css.matchAll(/@media[^{]*print[^{]*\{/g)) printRanges.push([m.index, blockEnd(css, m.index + m[0].length - 1)]);
  for (const m of css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    out.push({ sel: m[1].trim(), decl: m[2], print: printRanges.some(([a, b]) => m.index > a && m.index < b), at: m.index });
  }
  return out;
}

test('scroll-behavior: smooth only appears inside prefers-reduced-motion: no-preference', () => {
  const hits = [...css.matchAll(/scroll-behavior\s*:\s*smooth/g)];
  assert.ok(hits.length >= 1);
  for (const m of hits) {
    const open = css.lastIndexOf('@media', m.index);
    assert.ok(open >= 0, 'smooth scroll is inside an @media');
    const head = css.slice(open, css.indexOf('{', open));
    assert.match(head, /prefers-reduced-motion:\s*no-preference/);
    assert.ok(m.index < blockEnd(css, css.indexOf('{', open)));
  }
});

test('status, asat, gaps, legal-flag and grade-note use only ink, muted, rule, paper tokens (grey in print)', () => {
  const allowed = new Set(['--ink', '--muted', '--rule', '--paper', '--paper-2']);
  const re = /(^|[\s,>+~])\.(status(?:-[a-z]+)?|asat|gaps|legal-flag|grade-note)\b/;
  let checked = 0;
  for (const r of rules()) {
    if (!r.sel.split(',').some((s) => re.test(s.trim()))) continue;
    checked += 1;
    for (const d of r.decl.split(';')) {
      if (!/^\s*(color|background|border(-[a-z]+)?|outline|fill|stroke|text-decoration-color)\s*:/.test(d)) continue;
      for (const [, v] of d.matchAll(/var\((--[a-z0-9-]+)\)/g)) assert.ok(allowed.has(v), `${r.sel}: ${v}`);
    }
    assert.doesNotMatch(r.decl, /\b(rgb|hsl)a?\(/, r.sel);
    for (const [, hex] of r.decl.matchAll(/#([0-9a-fA-F]{3,6})\b/g)) {
      assert.ok(r.print, `${r.sel}: hex colour outside print`);
      const h = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
      assert.ok(h.slice(0, 2) === h.slice(2, 4) && h.slice(2, 4) === h.slice(4, 6), `${r.sel}: print colour #${hex} is not grey`);
    }
  }
  assert.ok(checked >= 5);
});

test('position: sticky appears only in the .matrix row-header rule (accepted exception)', () => {
  const hits = rules().filter((r) => /position\s*:\s*sticky/.test(r.decl));
  assert.deepEqual(hits.map((r) => r.sel), ['.matrix tbody th[scope=row]']);
});

// ---- contrast ----
const root = css.match(/:root\s*{([\s\S]*?)}/)[1];
const token = (n) => root.match(new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`))[1];
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

test('.status border is at least 3:1 and .legal-flag text at least 4.5:1', () => {
  const status = rules().find((r) => r.sel === '.status' && !r.print);
  assert.match(status.decl, /border:\s*1px solid var\(--ink\)/);
  for (const bg of ['paper', 'paper-2']) assert.ok(contrast(token('ink'), token(bg)) >= 3, `status border on ${bg}`);
  const flag = rules().find((r) => r.sel === '.callout.legal-flag' && !r.print);
  assert.match(flag.decl, /background:\s*var\(--paper-2\)/);
  assert.doesNotMatch(flag.decl, /(^|[;\s])color\s*:/, 'legal-flag text inherits ink');
  assert.ok(contrast(token('ink'), token('paper-2')) >= 4.5);
});
