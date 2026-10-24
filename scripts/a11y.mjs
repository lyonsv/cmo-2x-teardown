// Automated accessibility, 320px reflow and text-spacing checks in headless Chrome. Node built-ins only.
// Usage: node scripts/a11y.mjs [baseUrl]   (without a base URL it serves site/ itself)
// Scope: structure, names, focus, target size, reflow. NOT screen reader, zoom, real device
// or grayscale print: those stay on the human UAT list.
import { withPage, startServer, sleep, runCleanups } from './cdp.mjs';

let failed = false;
const pass = (n, d) => console.log(`PASS ${n}${d ? `: ${d}` : ''}`);
const fail = (n, m) => { failed = true; console.error(`FAIL ${n}: ${m}`); };
const test = (n, cond, detail, msg) => (cond ? pass(n, detail) : fail(n, msg || detail));

const NAMED_ROLES = new Set(['button', 'link', 'textbox', 'spinbutton', 'radio', 'combobox', 'region', 'table']);

async function load(send, evalJs, url, w, h) {
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  for (let i = 0; i < 80 && (await evalJs("document.documentElement.classList.contains('js')")) !== true; i++) await sleep(100);
  // IN-01: checks against the no-JS page would look like real failures, so stop here.
  if ((await evalJs("document.documentElement.classList.contains('js')")) !== true) throw new Error('module did not load');
  await sleep(500);
}

async function axChecks(send) {
  const { nodes } = (await send('Accessibility.getFullAXTree')).result;
  const live = nodes.filter((n) => !n.ignored);
  const role = (n) => n.role && n.role.value;
  const name = (n) => ((n.name && n.name.value) || '').trim();
  const counts = {};
  for (const n of live) counts[role(n)] = (counts[role(n)] || 0) + 1;
  const unnamed = live.filter((n) => NAMED_ROLES.has(role(n)) && !name(n));
  test('ax unnamed', unnamed.length === 0,
    `0 unnamed of button ${counts.button || 0}, link ${counts.link || 0}, textbox ${counts.textbox || 0}, spinbutton ${counts.spinbutton || 0}, radio ${counts.radio || 0}, region ${counts.region || 0}, table ${counts.table || 0}`,
    `${unnamed.length} unnamed: ${unnamed.slice(0, 5).map((n) => role(n) + '#' + n.nodeId).join(', ')}`);
  const lm = ['banner', 'main', 'navigation', 'contentinfo'].map((r) => `${r} ${counts[r] || 0}`);
  test('ax landmarks', ['banner', 'main', 'navigation', 'contentinfo'].every((r) => counts[r] === 1), lm.join(', '));
  const liveProps = live.filter((n) => (n.properties || []).some((p) => p.name === 'live' && p.value.value !== 'off'));
  const liveRoles = liveProps.map((n) => `${role(n)}(${(n.properties.find((p) => p.name === 'live').value.value)})`);
  // Expected per 03-UI-SPEC: summary output, one status, share-result status, alert error summary.
  const alerts = counts.alert || 0;
  test('ax live regions', liveProps.length >= 1 && alerts <= 1, `found ${liveRoles.length}: ${liveRoles.join(', ')}; alert roles ${alerts}`);
}

async function domChecks(evalJs) {
  const r = await evalJs(`(() => {
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]);
    let skips = 0; for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skips++;
    const secs = [...document.querySelectorAll('main section')];
    const bad = secs.filter((s) => { const l = s.getAttribute('aria-labelledby'); if (l) { const e = document.getElementById(l); return !(e && /^H2$/.test(e.tagName) && s.contains(e)); } return !s.getAttribute('aria-label'); }).map((s) => s.id);
    return { h1: hs.filter((x) => x === 1).length, skips, bad, lang: document.documentElement.lang, secs: secs.length };
  })()`);
  test('heading order', r.h1 === 1 && r.skips === 0, `h1 ${r.h1}, level skips ${r.skips}`);
  test('section names', r.bad.length === 0, `${r.secs} sections named`, `unlabelled sections: ${r.bad.join(', ')}`);
  test('lang', r.lang === 'en-GB', r.lang);
}

async function focusChecks(send, evalJs) {
  const pos = await evalJs("[...document.querySelectorAll('[tabindex]')].filter((e) => e.tabIndex > 0).length");
  test('no positive tabindex', pos === 0, 'none');
  await evalJs('document.activeElement && document.activeElement.blur(); window.scrollTo(0,0)');
  const stops = [];
  const key = (type) => send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  const describe = `(() => { const e = document.activeElement; if (!e || e === document.body) return null;
    if (window.__first === e) return null; if (!window.__first) window.__first = e;
    let cs = getComputedStyle(e);
    // The calculator inputs draw the ring on .control:focus-within (style.css line 138).
    const ring = e.closest('.control');
    if (cs.outlineStyle === 'none' && ring) cs = getComputedStyle(ring);
    e.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    // Covered only if no point of any client rect resolves to the element (inline links wrap across lines).
    let top = null, fixed = true;
    for (const q of e.getClientRects()) {
      const t = document.elementFromPoint(Math.min(Math.max(q.left + q.width / 2, 1), innerWidth - 1), Math.min(Math.max(q.top + q.height / 2, 1), innerHeight - 1));
      top = t; if (t && (t === e || e.contains(t) || t.contains(e))) { fixed = false; break; }
    }
    if (!e.getClientRects().length) fixed = false;
    return { tag: e.tagName.toLowerCase(), id: e.id || '', href: e.getAttribute('href') || '', os: cs.outlineStyle, ow: cs.outlineWidth, bs: cs.boxShadow, covered: !!fixed, coverTag: top ? top.tagName + '.' + top.className : '', scroll: !!e.closest('.table-scroll,.fig-scroll'), tabindex: e.tabIndex }; })()`;
  for (let i = 0; i < 600; i++) {
    await key('rawKeyDown'); await key('keyUp');
    const d = await evalJs(describe);
    if (!d) break;
    stops.push(d);
  }
  test('tab stops found', stops.length > 0, `${stops.length} tab stops`, 'no tab stops were recorded');
  test('first tab stop', stops[0] && stops[0].tag === 'a' && stops[0].href === '#answer', `${stops[0] && stops[0].tag + ' ' + stops[0].href}`);
  const noOutline = stops.filter((s) => (s.os === 'none' || s.ow === '0px') && s.bs === 'none');
  test('visible focus indicator', noOutline.length === 0, `${stops.length} tab stops, all with an outline`,
    `no outline on ${noOutline.slice(0, 5).map((s) => s.tag + (s.id ? '#' + s.id : '') + s.href).join(', ')}`);
  const covered = stops.filter((s) => s.covered);
  test('focus not covered', covered.length === 0, 'no tab stop is covered by another element',
    `covered: ${covered.slice(0, 8).map((s) => s.tag + s.href + (s.scroll ? ' [scroll]' : '') + ' by ' + s.coverTag).join('; ')}`);
  return stops;
}

async function orderCheck(send, evalJs) {
  // Tag each focus stop with its DOM index while tabbing again, then require ascending order.
  await evalJs('document.activeElement && document.activeElement.blur(); window.scrollTo(0,0)');
  const all = '[...document.querySelectorAll("*")]';
  const idxs = [];
  const key = (type) => send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  for (let i = 0; i < 600; i++) {
    await key('rawKeyDown'); await key('keyUp');
    const idx = await evalJs(`(() => { const e = document.activeElement; return !e || e === document.body ? -1 : ${all}.indexOf(e); })()`);
    if (idx < 0) break;
    idxs.push(idx);
  }
  test('focus order stops found', idxs.length > 0, `${idxs.length} stops`, 'no focus stops were recorded');
  let backwards = 0;
  for (let i = 1; i < idxs.length; i++) if (idxs[i] < idxs[i - 1]) backwards++;
  test('focus order follows DOM', backwards === 0, `${idxs.length} stops in DOM order`, `${backwards} stops jump backwards`);
}

async function targetChecks(evalJs) {
  const r = await evalJs(`(() => {
    const h = (e) => e.getBoundingClientRect().height, w = (e) => e.getBoundingClientRect().width;
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const small = [];
    for (const e of document.querySelectorAll('input:not([type=radio]):not([type=hidden]),button,summary')) if (vis(e) && h(e) < 47.5) small.push(e.tagName + '.' + e.className + ' ' + Math.round(h(e)));
    const radios = [...document.querySelectorAll('input[type=radio]')].filter(vis).filter((e) => h(e) < 23.5 || w(e) < 23.5).map((e) => e.id || e.name);
    const inline = (e) => { const p = e.closest('p,li,td,th,dd,figcaption,summary,span.cite-wrap') ; if (!p) return false; return [...p.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 12); };
    let inl = 0; const outside = [];
    for (const e of document.querySelectorAll('.chip,.cite')) { if (!vis(e) || h(e) >= 23.5) continue; if (inline(e)) inl++; else outside.push(e.className + ' ' + Math.round(h(e)) + ' "' + e.textContent.trim().slice(0, 20) + '"'); }
    return { small, radios, inl, outside, count: document.querySelectorAll('input,button,summary').length };
  })()`);
  test('targets >= 48px', r.small.length === 0, `${r.count} inputs/buttons/summaries checked`, `too small: ${r.small.slice(0, 5).join('; ')}`);
  test('radios >= 24px', r.radios.length === 0, 'all radios at least 24x24', r.radios.join(', '));
  test('chips and cites >= 24px outside running text', r.outside.length === 0,
    `inline-link exception (WCAG 2.5.8): ${r.inl} chips/cites under 24px sit inside running text`, `${r.outside.length} outside text: ${r.outside.slice(0, 6).join('; ')}`);
}

async function reflow(evalJs, label) {
  const r = await evalJs(`(() => {
    const out = [];
    for (const e of document.querySelectorAll('body *')) {
      if (e.closest('.table-scroll,.fig-scroll') || e.matches('.skip')) continue; // .skip is parked off-screen until focused
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.position === 'fixed') continue;
      const b = e.getBoundingClientRect(); if (b.width === 0) continue;
      if (b.right > 320.5 || b.left < -0.5) out.push(e.tagName.toLowerCase() + '.' + e.className + ' right ' + Math.round(b.right));
    }
    const scrolls = [...document.querySelectorAll('.table-scroll,.fig-scroll')];
    const unfocusable = scrolls.filter((s) => s.tabIndex < 0 || !(s.getAttribute('aria-label') || s.getAttribute('aria-labelledby'))).length;
    const inside = (e) => { if (!e) return false; const b = e.getBoundingClientRect(); return b.left >= -0.5 && b.right <= 320.5; };
    return { sw: document.documentElement.scrollWidth, out: [...new Set(out)], scrolls: scrolls.length, unfocusable,
      legal: !document.querySelector('.legal-flag'),
      clipped: [...document.querySelectorAll('body *')].filter((e) => { const cs = getComputedStyle(e); return cs.overflow === 'hidden' && cs.display !== 'none' && e.scrollHeight > e.clientHeight + 1 && e.clientHeight > 0; }).map((e) => e.tagName.toLowerCase() + '.' + e.className) };
  })()`);
  test(`${label} no horizontal scroll`, r.sw <= 320, `scrollWidth ${r.sw}`);
  test(`${label} overflow only in scroll regions`, r.out.length === 0, `${r.scrolls} scroll regions, none else overflow`, r.out.slice(0, 8).join('; '));
  test(`${label} scroll regions focusable and named`, r.unfocusable === 0, `${r.scrolls} regions`);
  test(`${label} legal flag absent (dropped by author)`, r.legal, `absent ${r.legal}`);
  return r;
}

async function main(base) {
  await withPage(async ({ send, evalJs }) => {
    await load(send, evalJs, base, 1280, 900);
    await axChecks(send);
    await domChecks(evalJs);
    await targetChecks(evalJs);
    await focusChecks(send, evalJs);
    await orderCheck(send, evalJs);
    await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: false });
    await sleep(500);
    await reflow(evalJs, '320px');
    // WCAG 1.4.12 text spacing
    const css = 'html *{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}';
    let method = 'adoptedStyleSheets';
    const added = await evalJs(`(() => { try { const s = new CSSStyleSheet(); s.replaceSync(${JSON.stringify(css)}); document.adoptedStyleSheets = [...document.adoptedStyleSheets, s]; return true; } catch (e) { return false; } })()`);
    if (!added) {
      method = 'CSS.createStyleSheet';
      await send('DOM.enable'); await send('CSS.enable');
      const frame = (await send('Page.getFrameTree')).result.frameTree.frame.id;
      const sid = (await send('CSS.createStyleSheet', { frameId: frame })).result.styleSheetId;
      await send('CSS.setStyleSheetText', { styleSheetId: sid, text: css });
    }
    await sleep(500);
    const r = await reflow(evalJs, 'text-spacing');
    test('text spacing no clipped overflow:hidden', r.clipped.length === 0, `applied via ${method}`, r.clipped.slice(0, 6).join('; '));
  });
}

try {
  const base = process.argv[2] || await startServer();
  await main(base);
} catch (e) {
  fail('setup', e.message);
} finally {
  runCleanups();
}
console.log('Manual (not attempted here): screen reader, zoom to 400%, real devices, grayscale print.');
process.exit(failed ? 1 : 0);
