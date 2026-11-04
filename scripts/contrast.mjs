// WCAG contrast check for the colour pairs used in src/styles.css.
// Run: npm run contrast   (AA: 4.5 normal text, 3 large/bold text >= 18.66px bold or 24px)
const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
// Colour pairs used in src/styles.css: [name, text colour, background, isLargeText]
const PALETTE = [
  ['text on page', '#2b2140', '#fff8e7'], ['text on choice', '#2b2140', '#e9f4ff'], ['text on selected', '#2b2140', '#ffd84d'],
  ['primary on page', '#5b3cc4', '#fff8e7'], ['primary on white', '#5b3cc4', '#ffffff'], ['white on primary', '#ffffff', '#5b3cc4'],
  ['green on green-bg', '#17703c', '#d8f7e3'], ['white on green', '#ffffff', '#17703c'], ['green on white', '#17703c', '#ffffff'],
  ['red on red-bg', '#c62828', '#ffe1e1'], ['red on page', '#c62828', '#fff8e7'], ['white on red', '#ffffff', '#c62828'],
  ['orange on orange-bg', '#a84f00', '#fff0dc'], ['white on orange', '#ffffff', '#a84f00'], ['orange on white', '#a84f00', '#ffffff'],
  ['grey on white', '#5a5070', '#ffffff'], ['grey on page', '#5a5070', '#fff8e7'], ['grey on choice', '#5a5070', '#e9f4ff'],
  ['notice', '#7a3a00', '#fff0dc'], ['primary on tile', '#5b3cc4', '#ece6ff'], ['white on disabled', '#ffffff', '#6b6280'],
  ['text on + button', '#2b2140', '#ffd84d'], ['text on − button', '#2b2140', '#8fd3ff'], ['text on × button', '#2b2140', '#b6f2a4'],
  ['text on ÷ button', '#2b2140', '#ffb8d2'], ['text on mixed button', '#2b2140', '#d9ccff'],
];
const pairs = JSON.parse(process.argv[2] ?? 'null') ?? PALETTE;
let fail = 0;
for (const [name, fg, bg, large] of pairs) {
  const r = ratio(fg, bg); const need = large ? 3 : 4.5; const ok = r >= need;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${r.toFixed(2).padStart(5)} (need ${need}) ${name}`);
}
process.exitCode = fail ? 1 : 0;
