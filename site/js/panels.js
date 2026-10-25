// DOM writers for the "Show the maths" steps, the "What you must believe" list
// and the sensitivity grade note.
// Text goes in with textContent only; attributes carry ids and links.
export const CHIP = { Benchmark: 'c-b', Modelled: 'c-m', Speculative: 'c-s' };

function node(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  n.textContent = text;
  return n;
}

// Parts are { text } or { fig, text }; the grade chip follows the first figure.
function fillParts(target, list, grade, ref) {
  target.textContent = '';
  let chipped = false;
  for (const part of list) {
    if (!part.fig) {
      target.append(part.text);
      continue;
    }
    const span = node('span', '', part.text);
    span.setAttribute('data-fig', part.fig);
    target.append(span);
    if (chipped) continue;
    chipped = true;
    const chip = node('a', `chip ${CHIP[grade]}`, grade);
    chip.setAttribute('href', `#${ref}`);
    target.append(' ', chip);
  }
}

export function writeMaths(items, steps) {
  steps.forEach((step, i) => {
    const li = items[i];
    li.querySelector('b').textContent = step.name;
    const [formula, numbers] = li.querySelectorAll('code');
    formula.textContent = step.formula;
    fillParts(numbers, [...step.parts, step.result], step.grade, step.ref);
  });
}

export function writeBelieve(list, items) {
  list.textContent = '';
  for (const item of items) {
    const li = document.createElement('li');
    fillParts(li, item.parts, item.grade, item.ref);
    if (item.carries) li.append(' ', node('b', 'default-mark', 'carries the result'));
    list.append(li);
  }
}

// Rewrites the grade note under the sensitivity table from the rows shown (WR-01):
// one chip at the weakest grade and one register link per row ref.
export function writeSensitivityNote(target, note) {
  const chip = node('a', `chip ${CHIP[note.grade]}`, note.grade);
  chip.setAttribute('href', `#${note.ref}`);
  target.textContent = '';
  target.append('The weakest figure in this table is ', chip, '. Register rows: ');
  note.refs.forEach((ref, i) => {
    const link = node('a', '', ref);
    link.setAttribute('href', `#${ref}`);
    if (i > 0) target.append(', ');
    target.append(link);
  });
  target.append('.');
}
