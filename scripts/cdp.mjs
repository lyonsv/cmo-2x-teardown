// Shared headless-Chrome harness (extracted from smoke.mjs). Node built-ins only.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

export const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const SITE = fileURLToPath(new URL('../site', import.meta.url));
const cleanups = [];
export const addCleanup = (fn) => cleanups.push(fn);
export function runCleanups() { for (const c of cleanups.splice(0).reverse()) { try { c(); } catch { /* best effort */ } } }
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const need = (cond, msg) => { if (!cond) throw new Error(msg); };



function freePort() {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });
}

export async function startServer() {
  const port = await freePort();
  const proc = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', SITE], { stdio: 'ignore' });
  addCleanup(() => proc.kill());
  const base = `http://127.0.0.1:${port}/`;
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base)).ok) return base; } catch { /* not up yet */ }
    await sleep(100);
  }
  throw new Error('static server did not start');
}

export function profile() {
  const dir = mkdtempSync(join(tmpdir(), 'smoke-chrome-'));
  addCleanup(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

export function dump(url, extra = []) {
  const r = spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile()}`, '--virtual-time-budget=4000', ...extra, '--dump-dom', url], { encoding: 'utf8', timeout: 60000, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !r.stdout) throw new Error(`chrome failed: ${r.stderr}`);
  return r.stdout;
}

export async function withPage(fn) {
  const dir = profile();
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', `--user-data-dir=${dir}`, 'about:blank'], { stdio: 'ignore' });
  addCleanup(() => chrome.kill());
  const portFile = join(dir, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  need(existsSync(portFile), 'DevToolsActivePort never appeared');
  const port = readFileSync(portFile, 'utf8').split('\n')[0];
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* retry */ }
    if (!target) await sleep(100);
  }
  need(target, 'no page target');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('websocket did not open within 10 s')), 10000);
    ws.onopen = () => { clearTimeout(t); res(); };
    ws.onerror = () => { clearTimeout(t); rej(new Error('websocket error')); };
  });
  let id = 0;
  // Every CDP call settles: a reply, a 15 s timeout, or the socket closing (IN-09).
  const pending = new Map();
  const settle = (key, fn) => { const p = pending.get(key); if (p) { pending.delete(key); clearTimeout(p.timer); fn(p); } };
  ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id) settle(msg.id, (p) => p.res(msg)); };
  ws.onclose = () => { for (const key of [...pending.keys()]) settle(key, (p) => p.rej(new Error(`CDP socket closed during ${p.method}`))); };
  const send = (method, params = {}) => new Promise((res, rej) => {
    id += 1;
    const key = id;
    const timer = setTimeout(() => settle(key, (p) => p.rej(new Error(`CDP ${method} timed out after 15 s`))), 15000);
    pending.set(key, { res, rej, timer, method });
    ws.send(JSON.stringify({ id: key, method, params }));
  });
  // WR-03: a page-side exception is an error, never a silent undefined.
  const evalJs = async (expression) => {
    const r = (await send('Runtime.evaluate', { expression, returnByValue: true })).result;
    if (r.exceptionDetails) throw new Error(`page eval failed: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
    return r.result.value;
  };
  try {
    return await fn({ send, evalJs });
  } finally {
    ws.close();
    chrome.kill();
  }
}
