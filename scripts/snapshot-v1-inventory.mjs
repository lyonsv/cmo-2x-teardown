// Run once on the v1 page at the start of Phase 5; output is a frozen fixture.
// Never re-run to make a failing inventory test pass; retire items in
// test/fixtures/retired.json instead.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { strip } from './lib/html.mjs';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const ids = [...new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))].sort();
const dataFig = {};
for (const m of html.matchAll(/data-fig="([^"]+)"/g)) dataFig[m[1]] = (dataFig[m[1]] || 0) + 1;
const sortedFig = Object.fromEntries(Object.entries(dataFig).sort(([a], [b]) => (a < b ? -1 : 1)));
const figures = [...html.matchAll(/<figcaption><b>Figure (\d+)<\/b>([\s\S]*?)<\/figcaption>/g)]
  .map((m) => ({ n: Number(m[1]), captionPrefix: strip(m[2]).slice(0, 60) }));
const tables = [...html.matchAll(/<caption>([\s\S]*?)<\/caption>/g)].map((m) => strip(m[1]));
const generatedFrom = execSync('git rev-parse --short HEAD').toString().trim();
const out = { generatedFrom, generatedOn: '2026-10-25', ids, dataFig: sortedFig, figures, tables };
writeFileSync(new URL('../test/fixtures/v1-inventory.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(ids.length, Object.keys(dataFig).length, figures.length, tables.length);
