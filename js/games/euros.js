// Kiek eurų? Piešiamos monetos ir banknotai, reikia pasirinkti bendrą sumą.
// Piešiniai paprasti, savo (ne oficialūs): spalvotas apskritimas ar stačiakampis su verte.

import { h } from '../ui.js';
import { runChoiceGame } from '../lib/choiceGame.js';
import { makeRounds } from '../lib/eurosLogic.js';

const INK = '#161616';
const LINE = '#1f2937';
const GOLD = '#e0a526';
const SILVER = '#d5dae0';

// Statinis SVG be naudotojo duomenų: tik reikšmės iš mūsų pačių kodo.
function coinSvg(item) {
  const euro = item.cents >= 100;
  const value = euro ? item.cents / 100 : item.cents;
  const unit = euro ? '€' : 'ct';
  let body;
  if (euro) {
    // Dviejų spalvų moneta: išorinis žiedas ir vidus skirtingų spalvų.
    const outer = item.cents === 100 ? GOLD : SILVER;
    const inner = item.cents === 100 ? SILVER : GOLD;
    body = `<circle cx="50" cy="50" r="46" fill="${outer}" stroke="${LINE}" stroke-width="4"/>
      <circle cx="50" cy="50" r="32" fill="${inner}" stroke="${LINE}" stroke-width="2.5"/>`;
  } else {
    body = `<circle cx="50" cy="50" r="46" fill="${GOLD}" stroke="${LINE}" stroke-width="4"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
  }
  return `<svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">${body}
    <text x="50" y="47" text-anchor="middle" dominant-baseline="central" font-size="${value >= 10 && !euro ? 38 : 44}" font-weight="800" fill="${INK}">${value}</text>
    <text x="50" y="74" text-anchor="middle" dominant-baseline="central" font-size="20" font-weight="800" fill="${INK}">${unit}</text>
  </svg>`;
}

function noteSvg(item) {
  const value = item.cents / 100;
  const fill = value === 5 ? '#b9e0bd' : '#f3b9b9';
  return `<svg viewBox="0 0 160 84" focusable="false" aria-hidden="true">
    <rect x="3" y="3" width="154" height="78" rx="8" fill="${fill}" stroke="${LINE}" stroke-width="4"/>
    <rect x="11" y="11" width="138" height="62" rx="5" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-dasharray="4 3"/>
    <text x="80" y="36" text-anchor="middle" dominant-baseline="central" font-size="40" font-weight="800" fill="${INK}">${value}</text>
    <text x="80" y="62" text-anchor="middle" dominant-baseline="central" font-size="20" font-weight="800" fill="${INK}">€</text>
  </svg>`;
}

function moneyRow(items) {
  const row = h('div', { class: 'money-row', role: 'img', 'aria-label': 'Monetos ir banknotai' });
  for (const item of items) {
    const cell = h('span', { class: 'money-item ' + item.kind });
    cell.innerHTML = item.kind === 'note' ? noteSvg(item) : coinSvg(item);
    row.append(cell);
  }
  return row;
}

export function buildRounds() {
  return makeRounds(3).map((r) => ({
    layout: 'money',
    correct: r.correct,
    options: r.options,
    explain: r.explain,
    build() {
      return { el: moneyRow(r.items), reveal() {} };
    },
  }));
}

export function mount(root, ctx) {
  runChoiceGame(root, ctx, {
    title: 'Kiek eurų?',
    instruction: 'Sudėkite monetų ir banknotų vertes. Kiek čia pinigų?',
    buildRounds,
  });
}
