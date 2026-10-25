// Print helper, loaded on its own so printing never depends on the calculator
// (code review WR-11): if ui.js fails, every details.maths fold, including the
// evidence key, still opens for print. No imports and no other side effects.
let openedForPrint = [];
window.addEventListener('beforeprint', () => {
  openedForPrint = [...document.querySelectorAll('details.maths')].filter((d) => !d.open);
  openedForPrint.forEach((d) => { d.open = true; });
});
window.addEventListener('afterprint', () => {
  openedForPrint.forEach((d) => { d.open = false; });
  openedForPrint = [];
});
