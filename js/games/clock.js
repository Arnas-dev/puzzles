// Kiek valandų? Analoginis laikrodis ir keturi laiko variantai.

import { h } from '../ui.js';
import { runChoiceGame } from '../lib/choiceGame.js';
import { pickTimes, makeOptions, formatTime, explainTime, handAngles } from '../lib/clockLogic.js';

const PER_LEVEL = 3;
const LEVELS = ['hours', 'half', 'quarter'];

// Statinis SVG be naudotojo duomenų: tik skaičiai iš mūsų pačių kodo.
function clockSvg(hh, mm) {
  const { hour, minute } = handAngles(hh, mm);
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0;
    ticks += `<line x1="100" y1="${big ? 12 : 14}" x2="100" y2="${big ? 20 : 18}" stroke="#161616" stroke-width="${big ? 3 : 1.5}" transform="rotate(${i * 6} 100 100)"/>`;
  }
  let nums = '';
  for (let n = 1; n <= 12; n++) {
    const a = (n * 30 * Math.PI) / 180;
    const x = 100 + 70 * Math.sin(a);
    const y = 100 - 70 * Math.cos(a);
    nums += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="800" fill="#161616">${n}</text>`;
  }
  const wrap = h('div', { class: 'clock-face', role: 'img', 'aria-label': 'Analoginis laikrodis' });
  wrap.innerHTML = `<svg viewBox="0 0 200 200" focusable="false" aria-hidden="true">
    <circle cx="100" cy="100" r="96" fill="#fff" stroke="#1f2937" stroke-width="6"/>
    ${ticks}${nums}
    <line x1="100" y1="100" x2="100" y2="42" stroke="#0b4f9c" stroke-width="6" stroke-linecap="round" transform="rotate(${minute} 100 100)"/>
    <line x1="100" y1="100" x2="100" y2="58" stroke="#c2410c" stroke-width="10" stroke-linecap="round" transform="rotate(${hour} 100 100)"/>
    <circle cx="100" cy="100" r="7" fill="#161616"/>
  </svg>`;
  return wrap;
}

export function buildRounds() {
  const rounds = [];
  for (const level of LEVELS) {
    for (const time of pickTimes(level, PER_LEVEL)) {
      const id = formatTime(time.h, time.m);
      rounds.push({
        layout: 'times',
        correct: id,
        options: makeOptions(time, level),
        explain: explainTime(time.h, time.m),
        build() {
          return { el: clockSvg(time.h, time.m), reveal() {} };
        },
      });
    }
  }
  return rounds;
}

export function mount(root, ctx) {
  runChoiceGame(root, ctx, {
    title: 'Kiek valandų?',
    instruction: 'Trumpoji rodyklė rodo valandas, ilgoji rodo minutes. Kiek valandų rodo laikrodis?',
    buildRounds,
  });
}
