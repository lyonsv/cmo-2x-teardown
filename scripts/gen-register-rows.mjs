// Regenerates the economics-engine rows of the assumption register from data.js.
// Rows for every assumption of kind 'engine' live between the two marker comments in
// site/index.html. On the first run any hand-written engine rows are removed and the
// markers are placed where the first one was. Idempotent: a second run changes nothing.
import { readFileSync, writeFileSync } from 'node:fs';
import { assumptions, sources } from '../site/js/data.js';

const PAGE = new URL('../site/index.html', import.meta.url);
const START = '<!-- engine-register:start -->';
const END = '<!-- engine-register:end -->';
const CHIP = { Benchmark: 'c-b', Modelled: 'c-m', Speculative: 'c-s' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderRow(e) {
  // Cite links are built only from known source keys (T-06-08).
  const cites = (e.cites ?? []).map((k) => {
    if (!sources[k]) throw new Error(`${e.id}: unknown source ${k}`);
    return `<a class="cite" href="#src-${k}">src-${k}</a>`;
  });
  const basis = esc(e.basis) + (cites.length ? ` Sources: ${cites.join(', ')}` : '');
  return [
    `            <tr id="${e.id}">`,
    `              <th scope="row" class="id">${e.id}</th>`,
    `              <td>${esc(e.label)}</td>`,
    `              <td><span data-fig="${e.id}">${esc(e.display)}</span></td>`,
    `              <td><span class="chip ${CHIP[e.grade]}">${e.grade}</span></td>`,
    `              <td><span class="ev">${e.evidence}</span></td>`,
    `              <td>${basis}</td>`,
    '            </tr>',
  ].join('\n');
}

export function render() {
  const rows = Object.values(assumptions).filter((e) => e.kind === 'engine').map(renderRow);
  return `${START}\n${rows.join('\n')}\n            ${END}`;
}

export function apply(html) {
  const block = render();
  if (html.includes(START)) {
    const i = html.indexOf(START);
    const j = html.indexOf(END) + END.length;
    return html.slice(0, i) + block + html.slice(j);
  }
  let out = html;
  let at = -1;
  for (const e of Object.values(assumptions).filter((x) => x.kind === 'engine')) {
    const m = out.match(new RegExp(`( *)<tr id="${e.id}">[\\s\\S]*?</tr>\\n`));
    if (!m) continue;
    if (at < 0) { at = m.index; out = out.slice(0, at) + '@@ENGINE@@\n' + out.slice(at + m[0].length); } else out = out.replace(m[0], '');
  }
  if (at < 0) throw new Error('no engine row found to place the markers');
  return out.replace('@@ENGINE@@', `            ${block}`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const before = readFileSync(PAGE, 'utf8');
  const after = apply(before);
  if (after !== before) writeFileSync(PAGE, after);
  console.log(`gen-register-rows: ${Object.values(assumptions).filter((e) => e.kind === 'engine').length} engine rows ${after === before ? 'unchanged' : 'written'}`);
}
