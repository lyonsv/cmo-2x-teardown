// Shared HTML slicing helpers for scripts and tests (test/helpers/html.js re-exports
// them, so scripts never import from the test tree). No side effects, no tests here.
export const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
export const strip = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

// Outer HTML of the section or div carrying id="id", found by tag-depth counting.
export function elementById(html, id) {
  const open = new RegExp(`<(section|div)\\b[^>]*\\sid="${id}"[^>]*>`).exec(html);
  if (!open) throw new Error(`missing element #${id}`);
  const tag = open[1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  re.lastIndex = open.index + open[0].length;
  let depth = 1;
  let m;
  while (depth > 0 && (m = re.exec(html))) depth += m[1] ? -1 : 1;
  if (depth !== 0) throw new Error(`unbalanced #${id}`);
  return html.slice(open.index, m.index + m[0].length);
}

// Body of a section as the legacy tests saw it: a demoted wrapper's own h3 heading is dropped.
export function sectionHtml(html, id) {
  return elementById(html, id).replace(new RegExp(`<h3 id="${id}-h">[\\s\\S]*?</h3>`), '');
}
