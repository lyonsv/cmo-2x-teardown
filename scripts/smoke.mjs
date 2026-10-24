// Headless-Chrome smoke check for the live calculator. Node built-ins only.
// Usage: node scripts/smoke.mjs [baseUrl]   (without a base URL it serves site/ itself)
// Env: CHROME overrides the Chrome binary path.
import { modelContext } from '../site/js/data.js';
import { present, defaultValues } from '../site/js/model.js';
import { FIELDS } from '../site/js/fields.js';
import { toText } from '../site/js/state.js';
import { withPage, startServer, dump, sleep, runCleanups } from './cdp.mjs';

const ctx = modelContext();
let failed = false;
const fail = (name, msg) => { failed = true; console.error(`FAIL ${name}: ${msg}`); };
const ok = (name, detail) => console.log(`PASS ${name}${detail ? `: ${detail}` : ''}`);

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
    check('summary', sum.startsWith('With more campaigns and more markets, at 2x you have'), `summary was "${sum}"`);
    check('cost', span(dom, 'calc-cost_per_asset-scaled') === expected(d, 'cost_per_asset', 'scaled'), `cost span ${span(dom, 'calc-cost_per_asset-scaled')}`);
    check('nan', !/NaN|Infinity/.test(s11Of(dom)), 'NaN or Infinity in s11');
    return sum.slice(0, 40);
  });

  await run('b hash restores inputs', () => {
    const dom = dump(`${base}#s11?markets=6&auto2=70`);
    check('status', statusOf(dom).includes('(2 changed)'), `status "${statusOf(dom)}"`);
    const v = { ...d, markets: 6, auto2: 0.7 };
    check('cost', span(dom, 'calc-cost_per_asset-scaled') === expected(v, 'cost_per_asset', 'scaled'), `cost span ${span(dom, 'calc-cost_per_asset-scaled')} vs ${expected(v, 'cost_per_asset', 'scaled')}`);
    return statusOf(dom);
  });

  await run('c bad hash value', () => {
    const dom = dump(`${base}#s11?markets=abc`);
    check('notice', statusOf(dom).includes('defaults were used for: Markets per campaign'), `status "${statusOf(dom)}"`);
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
    await evalJs("(() => { const r = document.querySelector('input[name=route][value=campaigns]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); })()");
    await sleep(300);
    const hash2 = await evalJs('location.hash');
    check('route hash', hash2 === '#s11?scenario=reduce&route=campaigns' || hash2 === '#s11?route=campaigns&scenario=reduce', `hash "${hash2}"`);
    return `${cap}, ${want}, ${hash2}`;
  }));

  const open = async ({ send, evalJs }, hash) => {
    await send('Page.enable');
    await send('Page.navigate', { url: `${base}${hash}` });
    for (let i = 0; i < 50 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
    await sleep(500);
  };
  const checkedRoute = (evalJs) => evalJs("document.querySelector('input[name=route]:checked').value");

  await run('p route in the link', () => withPage(async (page) => {
    const { evalJs } = page;
    await open(page, '#s11?route=markets');
    check('radio', (await checkedRoute(evalJs)) === 'markets', 'More markets radio not checked');
    const v = { ...d, route: 'markets' };
    const cost = await evalJs("document.querySelector('[data-fig=\"calc-cost_per_asset-scaled\"]').textContent");
    check('cost', cost === expected(v, 'cost_per_asset', 'scaled'), `cost ${cost} vs ${expected(v, 'cost_per_asset', 'scaled')}`);
    const cm = await evalJs("document.querySelector('[data-fig=\"calc-campaign_markets-scaled\"]').textContent");
    check('cm', cm === expected(d, 'campaign_markets', 'scaled'), `campaign-markets ${cm}`);
    return cost;
  }));

  await run('q hostile route in the link', () => withPage(async (page) => {
    const { evalJs } = page;
    await open(page, '#s11?route=__proto__');
    const st = await evalJs("document.querySelector('.calc-status').textContent");
    check('notice', st.includes('defaults were used for: How you get to 2x'), `status "${st}"`);
    check('both', (await checkedRoute(evalJs)) === 'both', 'Both radio not checked');
    const cost = await evalJs("document.querySelector('[data-fig=\"calc-cost_per_asset-scaled\"]').textContent");
    check('cost', cost === expected(d, 'cost_per_asset', 'scaled'), 'defaults not shown');
  }));

  await run('g sensitivity ranks live', () => {
    const dom = dump(`${base}#s11?markets=8`);
    const first = decode((dom.match(/aria-label="Sensitivity"[\s\S]*?<tbody>\s*<tr>\s*<th scope="row">([^<]*)<\/th>/) || [])[1] || '');
    const top = present({ ...d, markets: 8 }, ctx).sensitivity[0];
    check('label', first === top.label, `first row "${first}" vs "${top.label}"`);
    check('cell', span(dom, `calc-sens-${top.key}-costDown`) === top.cells.costDown.text, 'first-row cost cell differs');
    check('nan', !/NaN|Infinity/.test(s11Of(dom)), 'NaN or Infinity in s11');
    return first;
  });

  // WR-01: after a re-ranking the grade note links every row shown, at the weakest grade.
  await run('r sensitivity grade note follows the ranking', () => {
    const dom = dump(`${base}#s11?vcost=20&mconcept=10`);
    const v = { ...d, vcost: 20, mconcept: 10 };
    const p = present(v, ctx);
    const shown = [...dom.matchAll(/data-fig="calc-sens-([a-z0-9]+)-costDown"/g)].map((m) => m[1]);
    check('rows', JSON.stringify(shown) === JSON.stringify(p.sensitivity.map((r) => r.key)), `rows ${shown}`);
    const note = (dom.match(/aria-label="Sensitivity"[\s\S]*?<p class="table-note grade-note">([\s\S]*?)<\/p>/) || [])[1] || '';
    const links = [...note.matchAll(/<a href="#([^"]+)">/g)].map((m) => m[1]);
    const want = [...new Set(p.sensitivity.map((r) => r.ref))];
    check('links', JSON.stringify(links) === JSON.stringify(want), `note links ${links} vs ${want}`);
    const chip = note.match(/<a class="chip (c-[bms])" href="#([^"]+)">([^<]+)<\/a>/);
    check('chip', chip && chip[3] === p.sensitivityNote.grade && chip[2] === p.sensitivityNote.ref, `note chip ${chip && chip[0]}`);
    return shown.join(',');
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

  // WR-09: if setup fails (here, a required element is missing), the no-JS fallback stays visible.
  await run('m setup failure keeps the no-JS fallback', () => withPage(async ({ send, evalJs }) => {
    await send('Page.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', { source: "document.addEventListener('readystatechange', () => { if (document.readyState === 'interactive') { const b = document.getElementById('copy-link'); if (b) b.remove(); } });" });
    await send('Page.navigate', { url: base });
    await sleep(1500);
    check('nojs class', (await evalJs("document.documentElement.classList.contains('js')")) === false, 'html has class js after a failed setup');
    const note = await evalJs("getComputedStyle(document.querySelector('.calc-nojs')).display");
    check('note visible', note !== 'none', `no-JS note display is ${note}`);
    return `note display ${note}`;
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
    // IN-11: a summary link focuses its input and leaves the hash and history alone.
    const before = await evalJs('history.length');
    await evalJs("document.querySelector('.calc-errors a[href=\"#in-campaigns\"]').click()");
    await sleep(200);
    const after = await evalJs("[location.hash, history.length, document.activeElement.id]");
    check('summary link', after[0] === '' && after[1] === before && after[2] === 'in-campaigns', `after click ${JSON.stringify(after)}`);
    // WR-08: no stale share link while inputs are invalid.
    const share = await evalJs("[document.getElementById('share-link').value, document.getElementById('copy-link').disabled, document.querySelector('.share-status').textContent]");
    check('share blocked', share[0] === '' && share[1] === true && share[2] === 'Fix the highlighted inputs before sharing.', `share ${JSON.stringify(share)}`);
    await evalJs("(() => { const i = document.getElementById('in-campaigns'); i.value = '50'; i.dispatchEvent(new Event('change', { bubbles: true })); })()");
    await sleep(300);
    const back = await evalJs("[document.getElementById('share-link').value, document.getElementById('copy-link').disabled, document.querySelector('.share-status').textContent]");
    check('share restored', back[0].endsWith('#s11?campaigns=50') && back[1] === false && back[2] === '', `share ${JSON.stringify(back)}`);
  }));

  await run('l error summary is not rebuilt while the errors stay the same', () => withPage(async ({ send, evalJs }) => {
    await send('Page.enable');
    await send('Page.navigate', { url: base });
    for (let i = 0; i < 50 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
    const type = (v, ev) => evalJs(`(() => { const i = document.getElementById('in-campaigns'); i.value = '${v}'; i.dispatchEvent(new Event('${ev}', { bubbles: true })); })()`);
    await type('0', 'change');
    await sleep(300);
    await evalJs("(() => { window.__muts = 0; new MutationObserver((l) => { window.__muts += l.length; }).observe(document.querySelector('.calc-errors'), { childList: true, subtree: true, characterData: true }); new MutationObserver((l) => { window.__muts += l.length; }).observe(document.querySelector('#in-campaigns').closest('.field'), { childList: true, subtree: true, characterData: true }); })()");
    await type('00', 'input');
    await sleep(400);
    await type('0', 'input');
    await sleep(400);
    const same = await evalJs('window.__muts');
    check('same', same === 0, `${same} mutations while the error stayed the same`);
    await type('', 'input');
    await sleep(400);
    const changed = await evalJs('window.__muts');
    check('changed', changed > 0, 'summary not updated when the error changed');
    return `${same} then ${changed} mutations`;
  }));

  // WR-10: clearing an untouched field to retype it keeps the last results, labelled as such.
  await run('n retyping an untouched field keeps the last results', () => withPage(async ({ send, evalJs }) => {
    await send('Page.enable');
    await send('Page.navigate', { url: base });
    for (let i = 0; i < 50 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
    await evalJs("(() => { const i = document.getElementById('in-markets'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); })()");
    await sleep(500);
    const cell = await evalJs("document.querySelector('[data-fig=\"calc-cost_per_asset-scaled\"]')?.textContent");
    check('kept', cell === expected(d, 'cost_per_asset', 'scaled'), `cost cell "${cell}"`);
    const st = await evalJs("document.querySelector('.calc-status').textContent");
    check('status', st === 'Showing: results for your last complete inputs', `status "${st}"`);
    check('chart', (await evalJs("document.querySelector('svg.fig-live').hasAttribute('hidden')")) === false, 'chart hidden');
    const share = await evalJs("[document.getElementById('share-link').value, document.getElementById('copy-link').disabled, document.querySelector('.share-status').textContent]");
    check('share', share[0] === '' && share[1] === true && share[2] === 'Finish entering the inputs before sharing.', `share ${JSON.stringify(share)}`);
    await evalJs("(() => { const i = document.getElementById('in-markets'); i.value = '6'; i.dispatchEvent(new Event('input', { bubbles: true })); })()");
    await sleep(800);
    const now = await evalJs("document.querySelector('[data-fig=\"calc-cost_per_asset-scaled\"]').textContent");
    check('updated', now === expected({ ...d, markets: 6 }, 'cost_per_asset', 'scaled'), `cost cell "${now}"`);
    const ok2 = await evalJs("[document.getElementById('copy-link').disabled, document.querySelector('.share-status').textContent]");
    check('share back', ok2[0] === false && ok2[1] === '', `share ${JSON.stringify(ok2)}`);
    return st;
  }));

  await run('i over capacity in the chart', () => {
    const dom = dump(`${base}#s11?reviewers=4`);
    const labels = [...dom.matchAll(/<text class="over-lbl"[^>]*>([^<]*)</g)].map((m) => decode(m[1]));
    const label = labels.join(', ');
    check('label', labels.includes('over capacity'), `over labels "${label}"`);
    check('demand', labels.includes('unachievable'), `over labels "${label}" lack the campaign-markets mark`);
    const sum = decode((dom.match(/<output id="calc-summary"[^>]*>([^<]*)</) || [])[1] || '');
    check('summary', sum.includes('over capacity, at') && sum.includes('cannot go live') && !sum.includes('live per quarter'), `summary "${sum}"`);
    check('nan', !/NaN|Infinity/.test(s11Of(dom)), 'NaN or Infinity in s11');
    return label;
  });

  await run('k chart desc and believe panel at defaults', () => {
    const dom = dump(base);
    const desc = decode((dom.match(/<desc id="f8-d">([^<]*)</) || [])[1] || '');
    const cost = expected(d, 'cost_per_asset', 'scaled');
    check('desc', desc.includes(cost), `desc "${desc}" lacks ${cost}`);
    const marks = (s11Of(dom).match(/carries the result/g) || []).length;
    check('marks', marks === 3, `${marks} carries marks`);
    check('maths', span(dom, 'calc-maths-cost-r') === cost, `maths result ${span(dom, 'calc-maths-cost-r')}`);
    return cost;
  });

  await run('j hashchange on an open page', () => hashchange(base));

  // Phase 3 UI review: an invalid field followed by a same-document hash navigation must
  // show fresh results for the new hash, not the stale "not available" state.
  await run('o invalid field then hashchange', () => withPage(async ({ send, evalJs }) => {
    await send('Page.enable');
    await send('Page.navigate', { url: base });
    for (let i = 0; i < 50 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
    await evalJs("(() => { const i = document.getElementById('in-campaigns'); i.value = '0'; i.dispatchEvent(new Event('change', { bubbles: true })); })()");
    await sleep(600);
    const invalid = await evalJs("document.getElementById('in-campaigns').getAttribute('aria-invalid')");
    check('invalid first', invalid === 'true', `aria-invalid "${invalid}" before the hash change`);
    await evalJs("location.hash = '#s11?reviewers=4'");
    await sleep(1000);
    const st = await evalJs("document.querySelector('.calc-status').textContent");
    check('status', !/not available/i.test(st), `status "${st}"`);
    const fig = await evalJs("document.querySelector('[data-fig=\"calc-cost_per_asset-scaled\"]').textContent");
    const want = expected({ ...d, reviewers: 4 }, 'cost_per_asset', 'scaled');
    check('fresh results', fig === want, `cost per asset "${fig}", expected "${want}"`);
    const util = await evalJs("document.querySelector('[data-fig=\"calc-utilisation-scaled\"]').textContent");
    const wantUtil = expected({ ...d, reviewers: 4 }, 'utilisation', 'scaled');
    check('utilisation reflects the new hash', util === wantUtil, `utilisation "${util}", expected "${wantUtil}"`);
    const rev = await evalJs("document.getElementById('in-reviewers').value");
    check('reviewers', rev === '4', `reviewers "${rev}"`);
    const camp = await evalJs("document.getElementById('in-campaigns').value");
    const wantCamp = toText(FIELDS.find((f) => f.key === 'campaigns'), d.campaigns);
    check('campaigns reset', camp === wantCamp, `campaigns "${camp}", expected default "${wantCamp}"`);
    const stale = await evalJs("document.querySelectorAll('[aria-invalid=\"true\"]').length");
    check('no invalid fields', stale === 0, `${stale} fields still aria-invalid`);
    return `${fig}, reviewers=${rev}, campaigns=${camp}`;
  }));
}


// Same-document navigation to a new hash fires hashchange on the open page.
const hashchange = (base) => withPage(async ({ send, evalJs }) => {
  await send('Page.enable');
  await send('Page.navigate', { url: base });
  for (let i = 0; i < 50 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
  check('loaded', await evalJs("document.documentElement.classList.contains('js')"), 'module did not load');
  await send('Page.navigate', { url: `${base}#s11?markets=7` });
  await sleep(1000);
  const st = await evalJs("document.querySelector('.calc-status').textContent");
  const val = await evalJs("document.getElementById('in-markets').value");
  check('status', st.includes('(1 changed)'), `status "${st}"`);
  check('value', val === '7', `markets input "${val}"`);
  return `${st}, markets=${val}`;
});

try {
  const base = process.argv[2] || await startServer();
  await cases(base);
} catch (e) {
  fail('setup', e.message);
} finally {
  runCleanups();
}
process.exit(failed ? 1 : 0);
