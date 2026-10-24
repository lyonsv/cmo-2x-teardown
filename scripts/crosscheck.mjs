// QA-04 scripted cross-check. Node built-ins and local site/js imports only: no
// network, no storage, no dynamic code. run({ html, data }) returns
// { failures, report }; run directly it prints failures and exits non-zero.
import { readFileSync } from 'node:fs';
import { sources, assumptions, claims, PUBLISHER_TYPES, modelContext } from '../site/js/data.js';
import { FIELDS } from '../site/js/fields.js';
import { defaultValues } from '../site/js/model.js';
import { toText } from '../site/js/state.js';
import { formatValue } from '../site/js/format.js';

// Register rows that no page link points at, each with the reason. Each entry was inspected.
export const JUSTIFIED_UNREFERENCED = {
  'src-getty-v-stability-uk': 'Law-firm commentary that was not read (the page returned 403), kept in the register for transparency while the s13 status row cites the CMS source instead.',
  'asm-formats-per-locale': 'A fixed model constant shown only in the register because the calculator does not expose it.',
  'asm-concept-growth': 'A model assumption shown only in the register because the calculator does not expose it.',
  'asm-sampling-rate': 'A review-model assumption shown only in the register because the calculator does not expose it.',
  'asm-escalation-rate': 'A review-model assumption shown only in the register because the calculator does not expose it.',
  'asm-reviewer-rate': 'A cost-model assumption shown only in the register because the calculator does not expose it.',
  'asm-ai-share-variant': 'A cost-model assumption shown only in the register because the calculator does not expose it.',
  'asm-build-days': 'A cycle-time assumption shown only in the register because the calculator does not expose it.',
};

const NO_ASM = 'no assumption: external evidence';
// Each evidence gap lead (bold text, trailing full stop removed) maps to the model
// assumptions that stand in for it, or says it has none.
export const GAP_TRACE = {
  'Cost per asset, by asset type and route': ['asm-variant-cost', 'asm-master-concept-cost'],
  'Approval times and queue ages': ['asm-review-service-days', 'asm-backlog0-days'],
  'Rights and compliance incident rates': ['asm-incident-rate', 'asm-risk-likelihood'],
  'Auto-approval share that stays safe': ['asm-auto-approval'],
  'First-pass compliance rate': ['asm-approval-yield'],
  'Analyst hours and insight turnaround': NO_ASM,
  'DAM metadata completeness and decay': NO_ASM,
  'Answer-engine (AEO) outcomes': NO_ASM,
  'Localisation cost per word for LLM-era workflows': NO_ASM,
  'Win rate of marketing experiments, by definition': ['asm-tests-per-quarter'],
  'Reviewer fatigue in marketing review': ['asm-fatigue-controls'],
  'Indemnity caps and exclusions in practice': ['asm-imagery-indemnity'],
};

const MCK_NOTE = 'McKinsey: no figure is used on this page.';
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const strip = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

function defaultData() {
  return {
    sources, assumptions, claims, PUBLISHER_TYPES, FIELDS, ctx: modelContext(),
    dataText: readFileSync(new URL('../site/js/data.js', import.meta.url), 'utf8'),
  };
}

export function run({ html, data } = {}) {
  html ??= readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
  const d = { ...defaultData(), ...(data ?? {}) };
  const failures = [];
  const idList = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const ids = new Set(idList);
  for (const id of new Set(idList.filter((v, i, a) => a.indexOf(v) !== i))) failures.push(`duplicate id ${id}`);

  const rows = new Map();
  for (const m of html.matchAll(/<tr id="((?:src|asm)-[^"]+)">([\s\S]*?)<\/tr>/g)) rows.set(m[1], m[2]);

  // 2. data-fig entries
  const figs = [...html.matchAll(/data-fig="([^"]+)"[^>]*>([^<]*)</g)];
  for (const [, id, text] of figs) {
    const e = d.claims[id] ?? d.assumptions[id];
    if (!e) { failures.push(`data-fig ${id}: no data.js entry`); continue; }
    const ref = d.claims[id] ? d.claims[id].ref : id;
    if (!rows.has(ref)) failures.push(`data-fig ${id}: register row ${ref} missing`);
    // 4 (static calc figures)
    if (id.startsWith('calc-') && d.claims[id] && decode(text) !== d.claims[id].display) failures.push(`default drift: ${id} shows "${text}", data.js has "${d.claims[id].display}"`);
  }

  // 3. chip and cite targets
  const chips = [...html.matchAll(/<a class="chip [^"]*" href="#([^"]+)"/g)].map((m) => m[1]);
  const cites = [...html.matchAll(/<a class="cite" href="#([^"]+)"/g)].map((m) => m[1]);
  for (const t of new Set([...chips, ...cites])) if (!rows.has(t)) failures.push(`chip/cite to #${t} has no register row`);

  // 4. calculator input defaults and hints
  const dv = defaultValues(d.ctx);
  let defaultsChecked = 0;
  for (const f of d.FIELDS) {
    defaultsChecked += 1;
    const want = toText(f, dv[f.key]);
    const inp = html.match(new RegExp(`<input id="in-${f.key}"[^>]*?\\svalue="([^"]*)"`));
    if (!inp || inp[1] !== want) failures.push(`default drift: input in-${f.key} is ${inp ? inp[1] : 'missing'}, data.js has ${want}`);
    const hint = html.match(new RegExp(`<p class="hint" id="hint-${f.key}">([^]*?)</p>`));
    const wantHint = `Default ${f.hintFormat ? formatValue(dv[f.key], f.hintFormat) : want}`;
    if (!hint || !hint[1].startsWith(wantHint)) failures.push(`default drift: hint-${f.key} does not start with "${wantHint}"`);
  }

  // 5. every register row is referenced or justified
  const unreferenced = [];
  for (const [id, body] of rows) {
    const outside = html.replace(`<tr id="${id}">${body}</tr>`, '');
    const referenced = outside.includes(`href="#${id}"`);
    if (!referenced) {
      unreferenced.push(id);
      const why = JUSTIFIED_UNREFERENCED[id];
      if (!(typeof why === 'string' && why.trim())) failures.push(`unreferenced register row ${id}`);
    }
  }
  for (const k of Object.keys(JUSTIFIED_UNREFERENCED)) {
    if (!rows.has(k) || !unreferenced.includes(k)) failures.push(`stale justification ${k}`);
  }

  // 6. publisher types
  for (const [k, s] of Object.entries(d.sources)) {
    const id = `src-${k}`;
    const body = rows.get(id);
    const tds = body ? [...body.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => strip(m[1])) : [];
    if (!d.PUBLISHER_TYPES.includes(s.publisherType) || tds[2] !== s.publisherType) failures.push(`${id} publisher type: data.js "${s.publisherType}", register "${tds[2] ?? 'row missing'}"`);
  }

  // 7. McKinsey note iff no other mention
  const hasNote = html.includes(MCK_NOTE);
  const elsewhere = /mckinsey/i.test(html.replace(MCK_NOTE, '')) || /mckinsey/i.test(d.dataText);
  if (hasNote === elsewhere) failures.push(`McKinsey note mismatch: note ${hasNote ? 'present' : 'absent'}, McKinsey mentioned elsewhere ${elsewhere}`);

  // 8. evidence gaps
  const gaps = html.match(/<ul class="gaps">([\s\S]*?)<\/ul>/);
  for (const m of gaps ? gaps[1].matchAll(/<li><b>([^<]*)<\/b>/g) : []) {
    const lead = strip(m[1]).replace(/\.$/, '');
    const trace = GAP_TRACE[lead];
    if (!trace) { failures.push(`untraced gap ${lead}`); continue; }
    if (trace !== NO_ASM) for (const a of trace) if (!d.assumptions[a]) failures.push(`untraced gap ${lead}: assumption ${a} does not exist`);
  }
  if (!gaps) failures.push('untraced gap: no .gaps list');

  return {
    failures,
    report: { figures: figs.length, chips: chips.length, cites: cites.length, registerRows: rows.size, unreferenced, defaultsChecked },
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const { failures, report } = run();
  failures.forEach((f) => console.error(`FAIL ${f}`));
  console.log(`crosscheck: ${failures.length} failures; figures ${report.figures}, chips ${report.chips}, cites ${report.cites}, register rows ${report.registerRows}, unreferenced ${report.unreferenced.length}, defaults ${report.defaultsChecked}`);
  process.exit(failures.length ? 1 : 0);
}
