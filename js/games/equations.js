// Skaičių lygtys (kaip kryžiaskaičiai): trūksta vieno skaičiaus.

import { h } from '../ui.js';
import { runChoiceGame } from '../lib/choiceGame.js';
import { randInt, pick, shuffle } from '../lib/random.js';

const TIERS = [
  { max: 10, form: 'result' },
  { max: 10, form: 'result' },
  { max: 10, form: 'addend' },
  { max: 10, form: 'addend' },
  { max: 20, form: 'result' },
  { max: 20, form: 'addend' },
];

// Grąžina { a, op, b, c, missing } kur a op b = c, o `missing` yra 'a' | 'b' | 'c'.
export function makeEquation(tier, rnd = Math.random) {
  const { max, form } = TIERS[tier % TIERS.length];
  const op = pick(['+', '−'], rnd);
  let a;
  let b;
  let c;
  if (op === '+') {
    c = randInt(Math.min(4, max), max, rnd);
    a = randInt(1, c - 1, rnd);
    b = c - a;
  } else {
    a = randInt(Math.min(4, max), max, rnd);
    b = randInt(1, a - 1, rnd);
    c = a - b;
  }
  const missing = form === 'result' ? 'c' : 'b';
  return { a, op, b, c, missing };
}

export function answerOf(eq) {
  return eq[eq.missing];
}

export function makeOptions(answer, max, rnd = Math.random) {
  const set = new Set([answer]);
  const near = shuffle([-2, -1, 1, 2, 3, -3], rnd);
  for (const d of near) {
    if (set.size === 4) break;
    const v = answer + d;
    if (v >= 0 && v <= max + 3) set.add(v);
  }
  return [...set].sort((x, y) => x - y);
}

export function buildRounds() {
  return TIERS.map((tier, i) => {
    const eq = makeEquation(i);
    const answer = answerOf(eq);
    return {
      layout: 'numbers',
      correct: answer,
      options: makeOptions(answer, tier.max).map((n) => ({ id: n, label: String(n) })),
      explain: `${eq.a} ${eq.op} ${eq.b} = ${eq.c}`,
      build() {
        const slot = h('span', { class: 'blank-slot', 'aria-hidden': 'true' }, '00');
        const part = (key) => (eq.missing === key ? slot : String(eq[key]));
        const el = h('p', { class: 'equation' }, part('a'), ` ${eq.op} `, part('b'), ' = ', part('c'));
        return {
          el,
          reveal() {
            slot.textContent = String(answer);
            slot.classList.add('filled');
            slot.removeAttribute('aria-hidden');
          },
        };
      },
    };
  });
}

export function mount(root, ctx) {
  runChoiceGame(root, ctx, {
    title: 'Skaičių lygtys',
    instruction: 'Pasirinkite trūkstamą skaičių.',
    buildRounds,
  });
}
