// Print check (QA-02): print-media computed styles, table clipping, printToPDF page count and page-1 text.
// Usage: node scripts/print.mjs [baseUrl]   (without a base URL it serves site/ itself). Node built-ins plus pdftotext and pdfinfo (poppler).
// Grayscale print and a real printer are not covered: those stay on the human UAT list.
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { withPage, startServer, sleep, runCleanups } from './cdp.mjs';

// Drift ceiling = round(measured pages * 1.15). Measured 87 pages on 2026-10-24 (preferCSSPageSize, printBackground).
const CEILING = 100;

let failed = false;
const pass = (n, d) => console.log(`PASS ${n}${d ? `: ${d}` : ''}`);
const fail = (n, m) => { failed = true; console.error(`FAIL ${n}: ${m}`); };
const test = (n, cond, detail, msg) => (cond ? pass(n, detail) : fail(n, msg || detail));

function pdftotext(path) {
  const r = spawnSync('pdftotext', ['-layout', path, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error || r.status !== 0) return null;
  return r.stdout;
}

async function main(base) {
  if (spawnSync('pdftotext', ['-v']).error || spawnSync('pdfinfo', ['-v']).error) {
    fail('poppler', 'pdftotext or pdfinfo missing: install poppler to run the print check');
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), 'print-check-'));
  try {
    await withPage(async ({ send, evalJs }) => {
      await send('Page.enable');
      await send('Emulation.setDeviceMetricsOverride', { width: 700, height: 900, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: base });
      for (let i = 0; i < 80 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
      // IN-01: the print checks assume the live page, so fail loudly if the module never loaded.
      if ((await evalJs("document.documentElement.classList.contains('js')")) !== true) throw new Error('module did not load');
      await sleep(500);
      await send('Emulation.setEmulatedMedia', { media: 'print' });
      // ui.js opens details.maths on beforeprint only; printToPDF fires it, but the computed-style
      // check below fires it explicitly so the state can be measured.
      await evalJs("window.dispatchEvent(new Event('beforeprint'))");
      await sleep(300);

      const st = await evalJs(`(() => {
        const disp = (sel) => [...document.querySelectorAll(sel)].map((e) => getComputedStyle(e).display);
        const rows = [...document.querySelectorAll('td,th')];
        const over = rows.filter((c) => c.getBoundingClientRect().right > innerWidth + 0.5).length;
        return { legal: disp('.legal-flag'), maths: [...document.querySelectorAll('details.maths')].map((d) => d.open),
          hidden: ['.calc-live .btn', '.share', '.calc-errors', '.calc-nojs'].map((s) => [s, disp(s)]),
          sw: document.documentElement.scrollWidth, iw: innerWidth, over, cells: rows.length };
      })()`);
      test('legal flag absent (dropped by author)', st.legal.length === 0, 'no .legal-flag element');
      test('details.maths open (via beforeprint, as ui.js does)', st.maths.length > 0 && st.maths.every(Boolean), `${st.maths.length} element(s)`);
      for (const [sel, ds] of st.hidden) test(`${sel} hidden in print`, ds.every((d) => d === 'none'), `${ds.length} element(s)`, `display ${ds.join(',')}`);
      test('no horizontal overflow at 700px', st.sw <= st.iw, `scrollWidth ${st.sw}, width ${st.iw}`);
      test('no table cell clipped at the right edge', st.over === 0, `${st.cells} cells checked`, `${st.over} cells beyond the right edge`);

      const pdf = (await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true })).result.data;
      const path = join(dir, 'page.pdf');
      writeFileSync(path, Buffer.from(pdf, 'base64'));
      // IN-05: pdfinfo gives an exact count even when page objects sit in object streams.
      const info = spawnSync('pdfinfo', [path], { encoding: 'utf8' });
      const count = info.error || info.status !== 0 ? 0 : Number((info.stdout.match(/^Pages:\s+(\d+)/m) || [])[1] || 0);
      test('page count under ceiling', count > 0 && count <= CEILING, `${count} pages, ceiling ${CEILING}`);
      const text = pdftotext(path);
      if (text === null) { fail('pdftotext', 'pdftotext failed to read the PDF'); return; }
      const pages = text.split('\f').filter((_, i, a) => i < a.length - 1 || a[i].trim());
      const blank = pages.map((p, i) => [i + 1, p.replace(/\s/g, '').length]).filter(([, n]) => n <= 20);
      test('no blank pages', blank.length === 0, `${pages.length} pages read, all over 20 characters`, `blank/near-blank pages: ${blank.map(([i]) => i).join(', ')}`);
      const p1 = pages[0].replace(/\s+/g, ' ');
      test('page 1 has no legal-review flag', !p1.includes('has not yet been reviewed by counsel'), 'absent');
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

try {
  const base = process.argv[2] || await startServer();
  await main(base);
} catch (e) {
  fail('setup', e.message);
} finally {
  runCleanups();
}
console.log('Manual (not attempted here): grayscale print, a real printer, other paper sizes.');
process.exit(failed ? 1 : 0);
