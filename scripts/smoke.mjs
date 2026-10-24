// Headless-Chrome smoke check for the live calculator. Node built-ins only.
// Usage: node scripts/smoke.mjs [baseUrl]   (without a base URL it serves site/ itself)
// Env: CHROME overrides the Chrome binary path.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { modelContext } from '../site/js/data.js';
import { present, defaultValues } from '../site/js/model.js';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SITE = fileURLToPath(new URL('../site', import.meta.url));
const ctx = modelContext();
const cleanups = [];
let failed = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (name, msg) => { failed = true; console.error(`FAIL ${name}: ${msg}`); };
const ok = (name, detail) => console.log(`PASS ${name}${detail ? `: ${detail}` : ''}`);

function freePort() {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });
}

async function startServer() {
  const port = await freePort();
  const proc = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', SITE], { stdio: 'ignore' });
  cleanups.push(() => proc.kill());
  const base = `http://127.0.0.1:${port}/`;
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base)).ok) return base; } catch { /* not up yet */ }
    await sleep(100);
  }
  throw new Error('static server did not start');
}

function profile() {
  const dir = mkdtempSync(join(tmpdir(), 'smoke-chrome-'));
  cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function dump(url, extra = []) {
  const r = spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile()}`, '--virtual-time-budget=4000', ...extra, '--dump-dom', url], { encoding: 'utf8', timeout: 60000, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !r.stdout) throw new Error(`chrome failed: ${r.stderr}`);
  return r.stdout;
}

const s11Of = (dom) => dom.slice(dom.indexOf('<section id="s11"'), dom.indexOf('</section>', dom.indexOf('<section id="s11"')));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const span = (dom, name) => { const m = dom.match(new RegExp(`data-fig="${name}">([^<]*)<`)); return m ? decode(m[1]) : null; };
const statusOf = (dom) => decode((dom.match(/<p role="status" class="calc-status">([\s\S]*?)<\/p>/) || [])[1] || '');
const expected = (values, row, cell) => present(values, ctx).rows.find((r) => r.id === row)[cell].text;
const check = (name, cond, msg) => { if (!cond) throw new Error(msg); return name; };

async function cases(base) {
  const run = async (name, fn) => {
    try { const detail = await fn(); ok(name, detail); } catch (e) { fail(name, e.message); }
  };
  const d = defaultValues(ctx);

  await run('a defaults render', () => {
    const dom = dump(base);
    check('js', /<html[^>]*class="[^"]*\bjs\b/.test(dom), 'html lacks class js');
    const sum = decode((dom.match(/<output id="calc-summary"[^>]*>([^<]*)</) || [])[1] || '');
    check('summary', sum.startsWith('At 2x, your team approves'), `summary was "${sum}"`);
    check('cost', span(dom, 'calc-cost_per_asset-scaled') === expected(d, 'cost_per_asset', 'scaled'), `cost span ${span(dom, 'calc-cost_per_asset-scaled')}`);
    check('nan', !/NaN|Infinity/.test(s11Of(dom)), 'NaN or Infinity in s11');
    return sum.slice(0, 40);
  });

  await run('b hash restores inputs', () => {
    const dom = dump(`${base}#s11?locales=6&auto2=70`);
    check('status', statusOf(dom).includes('(2 changed)'), `status "${statusOf(dom)}"`);
    const v = { ...d, locales: 6, auto2: 0.7 };
    check('cost', span(dom, 'calc-cost_per_asset-scaled') === expected(v, 'cost_per_asset', 'scaled'), `cost span ${span(dom, 'calc-cost_per_asset-scaled')} vs ${expected(v, 'cost_per_asset', 'scaled')}`);
    return statusOf(dom);
  });

  await run('c bad hash value', () => {
    const dom = dump(`${base}#s11?locales=abc`);
    check('notice', statusOf(dom).includes('defaults were used for: Locales'), `status "${statusOf(dom)}"`);
    check('cost', span(dom, 'calc-cost_per_asset-scaled') === expected(d, 'cost_per_asset', 'scaled'), 'defaults not shown');
  });

  await run('f scenario in the link', () => withPage(async ({ send, evalJs }) => {
    await send('Page.enable');
    await send('Page.navigate', { url: `${base}#s11?scenario=hold` });
    for (let i = 0; i < 50 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
    await sleep(500);
    const cap = await evalJs("document.querySelector('[aria-label=\"Headcount scenario\"] caption').textContent");
    check('caption', cap === 'Headcount scenario: Hold', `caption "${cap}"`);
    const want = present({ ...d, scenario: 'hold' }, ctx).scenario.rows.find((r) => r.id === 'production_cost_change').text;
    const cell = await evalJs("document.querySelector('[data-fig=\"calc-scen-production_cost_change\"]').textContent");
    check('cell', cell === want, `cell ${cell} vs ${want}`);
    check('radio', (await evalJs("document.querySelector('input[name=scenario]:checked').value")) === 'hold', 'hold radio not checked');
    await evalJs("(() => { const r = document.querySelector('input[name=scenario][value=reduce]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); })()");
    await sleep(300);
    const hash = await evalJs('location.hash');
    check('hash', hash === '#s11?scenario=reduce', `hash "${hash}"`);
    return `${cap}, ${want}, ${hash}`;
  }));

  await run('g sensitivity ranks live', () => {
    const dom = dump(`${base}#s11?locales=8`);
    const first = decode((dom.match(/aria-label="Sensitivity"[\s\S]*?<tbody>\s*<tr>\s*<th scope="row">([^<]*)<\/th>/) || [])[1] || '');
    const top = present({ ...d, locales: 8 }, ctx).sensitivity[0];
    check('label', first === top.label, `first row "${first}" vs "${top.label}"`);
    check('cell', span(dom, `calc-sens-${top.key}-costDown`) === top.cells.costDown.text, 'first-row cost cell differs');
    check('nan', !/NaN|Infinity/.test(s11Of(dom)), 'NaN or Infinity in s11');
    return first;
  });

  // --dump-dom cannot run with scripts disabled, so this case drives Chrome over CDP.
  await run('d JS off', () => withPage(async ({ send, evalJs }) => {
    await send('Emulation.setScriptExecutionDisabled', { value: true });
    await send('Page.enable');
    await send('Page.navigate', { url: base });
    await sleep(1500);
    check('nojs class', (await evalJs("document.documentElement.classList.contains('js')")) === false, 'html has class js with scripts disabled');
    check('note', (await evalJs("!!document.querySelector('.calc-nojs')")) === true, 'no-JS note missing');
    const dom = await evalJs('document.documentElement.outerHTML');
    check('static', span(dom, 'calc-cost_per_asset-scaled') === expected(d, 'cost_per_asset', 'scaled'), 'static default span missing');
    const hidden = await evalJs("getComputedStyle(document.getElementById('calc-form-wrap')).display");
    check('form hidden', hidden === 'none', `calc-live display is ${hidden}`);
  }));

  await run('e zero reviewers in link', () => {
    const dom = dump(`${base}#s11?reviewers=0`);
    check('notice', statusOf(dom).includes('defaults were used for: Reviewer FTE'), `status "${statusOf(dom)}"`);
  });

  await run('h typed zero shows a field message and no stale numbers', () => withPage(async ({ send, evalJs }) => {
    await send('Page.enable');
    await send('Page.navigate', { url: base });
    for (let i = 0; i < 50 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
    await evalJs("(() => { const i = document.getElementById('in-campaigns'); i.value = '0'; i.dispatchEvent(new Event('change', { bubbles: true })); })()");
    await sleep(300);
    const err = await evalJs("(document.getElementById('err-campaigns') || {}).textContent");
    check('message', err === 'Error: Campaigns per year: enter a whole number of 1 or more.', `message "${err}"`);
    const cell = await evalJs("document.querySelector('[aria-label=\"Calculator results\"] tbody td').textContent");
    check('dash', cell.startsWith('\u2014') && cell.includes('not available'), `cell "${cell}"`);
    const body = await evalJs("document.getElementById('s11').textContent");
    check('nan', !/NaN|Infinity/.test(body), 'NaN or Infinity in s11');
    const hash = await evalJs('location.hash');
    check('hash untouched', hash === '', `hash "${hash}"`);
  }));

  await run('j hashchange on an open page', () => hashchange(base));
}

async function withPage(fn) {
  const dir = profile();
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', `--user-data-dir=${dir}`, 'about:blank'], { stdio: 'ignore' });
  cleanups.push(() => chrome.kill());
  const portFile = join(dir, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  check('port', existsSync(portFile), 'DevToolsActivePort never appeared');
  const port = readFileSync(portFile, 'utf8').split('\n')[0];
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* retry */ }
    if (!target) await sleep(100);
  }
  check('target', target, 'no page target');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('websocket error')); });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
  const send = (method, params = {}) => new Promise((res) => { id += 1; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
  const evalJs = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.result.value;
  try {
    return await fn({ send, evalJs });
  } finally {
    ws.close();
    chrome.kill();
  }
}

// Same-document navigation to a new hash fires hashchange on the open page.
const hashchange = (base) => withPage(async ({ send, evalJs }) => {
  await send('Page.enable');
  await send('Page.navigate', { url: base });
  for (let i = 0; i < 50 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
  check('loaded', await evalJs("document.documentElement.classList.contains('js')"), 'module did not load');
  await send('Page.navigate', { url: `${base}#s11?locales=7` });
  await sleep(1000);
  const st = await evalJs("document.querySelector('.calc-status').textContent");
  const val = await evalJs("document.getElementById('in-locales').value");
  check('status', st.includes('(1 changed)'), `status "${st}"`);
  check('value', val === '7', `locales input "${val}"`);
  return `${st}, locales=${val}`;
});

try {
  const base = process.argv[2] || await startServer();
  await cases(base);
} catch (e) {
  fail('setup', e.message);
} finally {
  for (const c of cleanups.reverse()) { try { c(); } catch { /* best effort */ } }
}
process.exit(failed ? 1 : 0);
