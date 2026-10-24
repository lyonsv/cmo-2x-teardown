// Thin DOM binding for the s11 calculator. All maths and parsing live in
// model.js and state.js; this file only moves text between them and the page.
// Text is written with textContent only; nothing is stored or sent.
import { modelContext } from './data.js';
import { present, defaultValues } from './model.js';
import { FIELDS } from './fields.js';
import { chartSpec, renderChart } from './svg.js';
import { writeMaths, writeBelieve } from './panels.js';
import { coerce, validate, parseHash, serialiseHash, toText, changedCount } from './state.js';

const ctx = modelContext();
const defaults = defaultValues(ctx);
const $ = (id) => document.getElementById(id);
const status = document.querySelector('.calc-status');
const summary = $('calc-summary');
const errBox = document.querySelector('.calc-errors');
const shareLink = $('share-link');
const shareStatus = document.querySelector('.share-status');
const copyBtn = $('copy-link');
const rows = [...document.querySelectorAll('[aria-label="Calculator results"] tbody tr')];
const inputs = Object.fromEntries(FIELDS.map((f) => [f.key, $(`in-${f.key}`)]));

const GROUPS = ['scenario', 'route'];
const radios = Object.fromEntries(GROUPS.map((g) => [g, [...document.querySelectorAll(`input[name="${g}"]`)]]));
const scenTable = document.querySelector('[aria-label="Headcount scenario"]');
const scenRows = [...scenTable.querySelectorAll('tbody tr')];
const sensRows = [...document.querySelectorAll('[aria-label="Sensitivity"] tbody tr')];
const chart = document.querySelector('svg.fig-live');
const chartEmpty = document.querySelector('.chart-empty');
const mathsBox = document.querySelector('details.maths');
const mathsItems = [...document.querySelectorAll('.maths-steps > li')];
const believeList = document.querySelector('.believe ul');
const SENS_CELLS = ['costDown', 'costUp', 'utilDown', 'utilUp'];
const touched = new Set();
let tableTimer = 0;
let summaryTimer = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function read() {
  const values = { ...defaults };
  for (const g of GROUPS) values[g] = (radios[g].find((r) => r.checked) || radios[g][0]).value;
  const errors = [];
  for (const f of FIELDS) {
    const r = coerce(f, inputs[f.key].value);
    if (r.ok) values[f.key] = r.value;
    else errors.push({ key: f.key, message: r.message });
  }
  return { values, errors };
}

function fillInputs(values) {
  for (const f of FIELDS) inputs[f.key].value = toText(f, values[f.key]);
  for (const g of GROUPS) for (const r of radios[g]) r.checked = r.value === values[g];
}

function setCell(td, node, withValue) {
  td.textContent = '';
  if (withValue === 'dash') {
    td.removeAttribute('class');
    td.append('—', el('span', 'visually-hidden', 'not available'));
    return;
  }
  if (node.value !== undefined) {
    td.className = 'num';
    const span = el('span', '', node.text);
    span.setAttribute('data-fig', withValue);
    td.append(span);
  } else {
    td.className = 'na';
    td.append(node.text);
  }
}

function writeResults(p) {
  p.rows.forEach((row, i) => {
    const tds = rows[i].querySelectorAll('td');
    ['base', 'scaled', 'change'].forEach((name, c) => setCell(tds[c], row[name], `calc-${row.id}-${name}`));
  });
}

function writeScenario(sc) {
  scenTable.querySelector('caption').textContent = `Headcount scenario: ${sc.name}`;
  sc.rows.forEach((row, i) => { scenRows[i].querySelector('[data-fig]').textContent = row.text; });
}

// Rewrites the five static sensitivity rows in the live ranking order.
function writeSensitivity(list) {
  list.forEach((row, i) => {
    const tr = sensRows[i];
    tr.querySelector('th').textContent = row.label;
    [...tr.querySelectorAll('td.num')].forEach((td, c) => {
      const node = row.cells[SENS_CELLS[c]];
      const fig = td.querySelector('[data-fig]');
      fig.textContent = node.text;
      fig.setAttribute('data-fig', `calc-sens-${row.key}-${SENS_CELLS[c]}`);
      td.querySelector('.capped').textContent = row.capped[c % 2 === 0 ? 'down' : 'up'] ? 'capped' : '';
    });
  });
}

function dashResults() {
  for (const tr of rows) [...tr.querySelectorAll('td')].slice(0, 3).forEach((td) => setCell(td, null, 'dash'));
  for (const el_ of [...scenRows, ...sensRows].flatMap((tr) => [...tr.querySelectorAll('[data-fig]')])) el_.textContent = '—';
  for (const el_ of document.querySelectorAll('.capped')) el_.textContent = '';
  for (const fig of document.querySelectorAll('.maths-steps [data-fig], .believe [data-fig]')) fig.textContent = '\u2014';
  chart.setAttribute('hidden', '');
  chartEmpty.removeAttribute('hidden');
}

function showFieldErrors(errors) {
  const byKey = new Map(errors.filter((e) => e.key).map((e) => [e.key, e.message]));
  for (const f of FIELDS) {
    const input = inputs[f.key];
    const field = input.closest('.field');
    const old = $(`err-${f.key}`);
    const msg = byKey.get(f.key);
    const rest = msg && (msg.startsWith(`${f.label}: `) ? msg : `${f.label}: ${msg}`);
    // Unchanged message: leave the node alone so assistive tech does not re-read it (WR-05).
    if (old && msg && old.textContent === `Error: ${rest}`) continue;
    if (old) old.remove();
    if (!msg) {
      input.removeAttribute('aria-invalid');
      field.classList.remove('is-invalid');
      input.setAttribute('aria-describedby', `hint-${f.key}`);
      continue;
    }
    input.setAttribute('aria-invalid', 'true');
    field.classList.add('is-invalid');
    const p = el('p', 'field-error');
    p.id = `err-${f.key}`;
    p.append(el('b', '', 'Error:'), ` ${rest}`);
    field.append(p);
    input.setAttribute('aria-describedby', `hint-${f.key} err-${f.key}`);
  }
}

// role="alert": rebuilt only when the set of messages changes (WR-05).
let summaryShown = '';

function showSummary(errors) {
  const shown = errors.map((e) => `${e.key}\u0000${e.message}`).join('\n');
  if (shown === summaryShown) return;
  summaryShown = shown;
  const list = errBox.querySelector('ul');
  list.textContent = '';
  if (errors.length === 0) {
    errBox.setAttribute('hidden', '');
    return;
  }
  const overflow = errors.find((e) => !e.key);
  errBox.querySelector('b').textContent = overflow ? overflow.message : `Fix ${errors.length} ${errors.length === 1 ? 'input' : 'inputs'} to see results`;
  for (const e of errors) {
    const li = el('li');
    if (e.key) {
      const a = el('a', '', e.message);
      a.setAttribute('href', `#in-${e.key}`);
      li.append(a);
    } else li.textContent = 'Reduce the largest input and try again.';
    list.append(li);
  }
  errBox.removeAttribute('hidden');
}

let pendingNotice = '';

function statusText(values) {
  const n = changedCount(values, ctx);
  const line = n === 0 ? 'Showing: page defaults' : `Showing: your numbers (${n} changed)`;
  return pendingNotice ? `${pendingNotice} ${line}` : line;
}

// Invalid inputs: no link to numbers that are not on screen (WR-08).
const SHARE_BLOCKED = ['Fix the highlighted inputs before sharing.', 'Finish entering the inputs before sharing.'];

const setShareStatus = (text) => { if (shareStatus.textContent !== text) shareStatus.textContent = text; };

function setShare(link, blocked) {
  shareLink.value = link;
  copyBtn.disabled = blocked !== '';
  if (blocked || SHARE_BLOCKED.includes(shareStatus.textContent)) setShareStatus(blocked);
}

// True while the results on screen are those of the last complete, valid inputs.
let showing = false;

// Re-reads every input and repaints. `commit` is true for change/blur/reset/restore.
function update(commit, immediateSummary) {
  const { values, errors: fieldErrors } = read();
  const errors = fieldErrors.length > 0 ? fieldErrors : validate(values, ctx);
  const visible = fieldErrors.length > 0 ? errors.filter((e) => touched.has(e.key)) : errors;
  showFieldErrors(visible);
  showSummary(visible);
  if (errors.length > 0) setShare('', SHARE_BLOCKED[visible.length > 0 ? 0 : 1]);
  // Still typing in an untouched field: keep the last results and say so (WR-10).
  if (errors.length > 0 && visible.length === 0 && showing) {
    status.textContent = 'Showing: results for your last complete inputs';
    return;
  }
  clearTimeout(summaryTimer);
  if (errors.length > 0) {
    showing = false;
    dashResults();
    summary.textContent = 'Results are not available until the inputs are fixed.';
    status.textContent = pendingNotice || 'Showing: results not available';
    return;
  }
  showing = true;
  const p = present(values, ctx);
  writeResults(p);
  writeScenario(p.scenario);
  writeSensitivity(p.sensitivity);
  writeMaths(mathsItems, p.maths);
  writeBelieve(believeList, p.believe);
  chart.removeAttribute('hidden');
  chartEmpty.setAttribute('hidden', '');
  renderChart(chart, chartSpec(p));
  const writeSummary = () => { summary.textContent = p.summary; };
  if (immediateSummary) writeSummary();
  else summaryTimer = setTimeout(writeSummary, 400);
  status.textContent = statusText(values);
  const hash = serialiseHash(values, ctx);
  setShare(location.href.split('#')[0] + hash, '');
  if (commit) history.replaceState(null, '', hash || location.pathname + location.search);
}

function restore() {
  const parsed = parseHash(location.hash, ctx);
  fillInputs(parsed.values);
  touched.clear();
  pendingNotice = parsed.notices.length > 0
    ? `Some values in the link were not valid, so defaults were used for: ${parsed.notices.join(', ')}.` : '';
  update(false, true);
  pendingNotice = '';
  if (!parsed.restored) return;
  const h = $('s11-h');
  h.setAttribute('tabindex', '-1');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('s11').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
  h.focus({ preventScroll: true });
}

const form = document.querySelector('.calc-form');
form.addEventListener('submit', (e) => e.preventDefault());
form.addEventListener('input', (e) => {
  const key = e.target.name;
  clearTimeout(tableTimer);
  pendingNotice = '';
  if (touched.has(key)) update(false, false);
  else tableTimer = setTimeout(() => update(false, false), 250); // never both (IN-05)
});
form.addEventListener('change', (e) => {
  clearTimeout(tableTimer);
  pendingNotice = '';
  if (e.target.name) touched.add(e.target.name);
  update(true, true);
});

copyBtn.addEventListener('click', () => {
  const done = (msg) => { shareStatus.textContent = msg; };
  if (copyBtn.disabled || shareLink.value === '') return;
  const fail = () => { shareLink.select(); done('Could not copy. Select the link and copy it manually.'); };
  if (!navigator.clipboard) return fail();
  navigator.clipboard.writeText(shareLink.value).then(() => done('Link copied.'), fail);
});

// Summary links focus their input without changing location.hash or history (IN-11).
errBox.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#in-"]'); if (a) { e.preventDefault(); inputs[a.getAttribute('href').slice(4)]?.focus(); } });

$('reset-calc').addEventListener('click', () => {
  fillInputs(defaults);
  touched.clear();
  pendingNotice = '';
  update(true, true);
  shareStatus.textContent = '';
  inputs.campaigns.focus();
});

// The maths opens for printing and goes back afterwards.
let mathsWasOpen = false;
window.addEventListener('beforeprint', () => { mathsWasOpen = mathsBox.open; mathsBox.open = true; });
window.addEventListener('afterprint', () => { mathsBox.open = mathsWasOpen; });

window.addEventListener('hashchange', () => {
  if (location.hash.startsWith('#s11?')) restore();
});

// `js` reveals the live form, so it is set only after every lookup and listener above
// succeeded, and removed if restore() throws: a failure keeps the no-JS note (WR-09).
document.documentElement.classList.add('js');
try { restore(); } catch (err) { document.documentElement.classList.remove('js'); throw err; }
