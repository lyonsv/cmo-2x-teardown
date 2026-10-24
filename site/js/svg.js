// Live Figure 8 helper. chartSpec() is pure geometry and text (no DOM, tested in Node);
// renderChart() draws it with createElementNS and attributes only, text via textContent.
import { formatValue } from './format.js';

const NS = 'http://www.w3.org/2000/svg';
const AREA = 192; // bar area is x 0..192; value labels start at x 200 and must fit by 300
const MAX_CHARS = 13; // 100 units at about 7.4 units per 12px mono character
const snap = (v) => Math.round(v / 4) * 4;

// A value that would overflow its label falls back to a compact form.
function fit(text, value, kind) {
  if (text.length <= MAX_CHARS) return text;
  const c = (v) => v.toLocaleString('en-GB', { notation: 'compact', maximumFractionDigits: 1 });
  return { usd: `$${c(value)}`, pct: `${c(value * 100)}%` }[kind] || c(value);
}

const PANELS = [
  { id: 'output_per_head', label: 'Approved-live variants per head', fmt: 'int', kind: 'int' },
  { id: 'cost_per_asset', label: 'Cost per approved-live asset', fmt: 'usd2', kind: 'usd' },
  { id: 'utilisation', label: 'Review utilisation', fmt: 'pct1', kind: 'pct' },
];

export function chartSpec(p) {
  if (!p || !p.ok) return null;
  const desc = [];
  const panels = PANELS.map((def, i) => {
    const row = p.rows.find((r) => r.id === def.id);
    const vals = [row.base.value, row.scaled.value];
    const max = def.id === 'utilisation' ? Math.max(1.2, ...vals) : Math.max(...vals);
    const top = i * 140;
    const bars = [['Baseline', 'bar-base', 'base'], ['2x', 'bar-scaled', 'scaled']].map(([series, cls, side], b) => {
      const value = row[side].value;
      const over = def.id === 'utilisation' && value >= 1;
      const text = fit(formatValue(value, def.fmt), value, def.kind);
      const sameAsRow = text === row[side].text;
      const y = top + 36 + b * 48;
      return {
        series, cls, x: 0, y, width: max > 0 ? snap((value / max) * AREA) : 0, height: 24, seriesY: y - 4,
        value: { fig: sameAsRow ? `calc-${def.id}-${side}` : `calc-chart-${def.id}-${side}`, text },
        textY: over ? y + 12 : y + 16, lines: over ? [text, 'over capacity'] : [text],
      };
    });
    desc.push(`${def.label}: baseline ${bars[0].value.text}, 2x ${bars[1].value.text}${bars[1].lines.length > 1 ? ' (over capacity)' : ''}.`);
    const panel = { label: def.label, labelY: top + 12, bars };
    if (def.id === 'utilisation') panel.refLine = { x: snap(AREA / max), y1: top + 16, y2: top + 108, label: '100% capacity' };
    return panel;
  });
  return { height: 392, panels, desc: `Baseline against 2x for your numbers. ${desc.join(' ')} A dashed line marks 100% capacity.` };
}

function add(svg, tag, attrs, text) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  svg.append(node);
}

export function renderChart(svg, spec) {
  for (const node of [...svg.childNodes]) if (!['title', 'desc'].includes(node.nodeName)) node.remove();
  svg.querySelector('desc').textContent = spec.desc;
  for (const panel of spec.panels) {
    add(svg, 'text', { class: 'panel-lbl', x: 0, y: panel.labelY }, panel.label);
    for (const bar of panel.bars) {
      add(svg, 'text', { class: 'series-lbl', x: 0, y: bar.seriesY }, bar.series);
      add(svg, 'rect', { class: bar.cls, x: bar.x, y: bar.y, width: bar.width, height: bar.height });
      add(svg, 'text', { 'data-fig': bar.value.fig, x: 200, y: bar.textY }, bar.lines[0]);
      if (bar.lines[1]) add(svg, 'text', { class: 'over-lbl', x: 200, y: bar.textY + 12 }, bar.lines[1]);
    }
    const ref = panel.refLine;
    if (!ref) continue;
    add(svg, 'line', { class: 'ref-line', x1: ref.x, y1: ref.y1, x2: ref.x, y2: ref.y2 });
    add(svg, 'text', { class: 'ref-lbl', x: ref.x + 4, y: panel.labelY }, ref.label);
  }
}
