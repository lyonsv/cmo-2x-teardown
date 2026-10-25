// Negative values format the absolute value and put a true minus sign (U+2212)
// first, so -1 in usd2 is "−$1.00", not "$-1.00". A value that rounds to zero
// carries no sign.
// Pure and DOM-free; data.js re-exports it so existing imports keep working.
export function formatValue(value, format) {
  const n = (v, d) => v.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
  const body = {
    int: (v) => Math.round(v).toLocaleString('en-GB', { maximumFractionDigits: 0 }),
    x1: (v) => `${n(v, 1)}x`,
    usd0: (v) => `$${n(v, 0)}`,
    usd2: (v) => `$${n(v, 2)}`,
    usdm2: (v) => `$${n(v / 1e6, 2)}M`,
    pct0: (v) => `${n(v * 100, 0)}%`,
    pct1: (v) => `${n(v * 100, 1)}%`,
    num1: (v) => n(v, 1),
    num2: (v) => n(v, 2),
    x2: (v) => `${n(v, 2)}x`,
    years1: (v) => `${n(v, 1)} years`,
    days1: (v) => `${n(v, 1)} days`,
  }[format];
  if (body) {
    const text = body(Math.abs(value));
    return value < 0 && /[1-9]/.test(text) ? `\u2212${text}` : text;
  }
  if (format === 'applies') return value === 1 ? 'all' : formatValue(value, 'pct0');
  if (format === 'pts1') {
    const text = `${n(Math.abs(value) * 100, 1)} points`;
    return value < 0 && /[1-9]/.test(text) ? `\u2212${text}` : text;
  }
  if (format === 'ptschg1') {
    const text = `${n(Math.abs(value) * 100, 1)} points`;
    if (!/[1-9]/.test(text)) return text;
    return `${value < 0 ? '\u2212' : '+'}${text}`;
  }
  if (format === 'pctchg0') {
    const p = Math.round(value * 100);
    return `${p < 0 ? '\u2212' : p > 0 ? '+' : ''}${Math.abs(p)}%`;
  }
  if (format === 'pctchg1') {
    const text = `${n(Math.abs(value) * 100, 1)}%`;
    if (!/[1-9]/.test(text)) return text;
    return `${value < 0 ? '\u2212' : '+'}${text}`;
  }
  throw new Error(`unknown format ${format}`);
}
