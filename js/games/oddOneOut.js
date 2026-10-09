// Kuris netinka? Trys vienos rūšies daiktai ir vienas svetimas.

import { h } from '../ui.js';
import { runChoiceGame } from '../lib/choiceGame.js';
import { pick, sample, shuffle } from '../lib/random.js';
import { CATEGORIES, AVOID_PAIRS } from '../data/categories.js';
import { WORD_BY_TEXT } from '../data/words.js';

const avoid = (a, b) => AVOID_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export function makeRound(rnd = Math.random) {
  const main = pick(CATEGORIES, rnd);
  const others = CATEGORIES.filter((c) => c !== main && !avoid(c.name, main.name));
  const oddCat = pick(others, rnd);
  const three = sample(main.words, 3, rnd);
  const odd = pick(oddCat.words, rnd);
  return { category: main.name, three, odd };
}

export function buildRounds() {
  const rounds = [];
  const usedCategories = new Set();
  let guard = 0;
  while (rounds.length < 6 && guard++ < 50) {
    const r = makeRound();
    if (usedCategories.has(r.category) && guard < 30) continue;
    usedCategories.add(r.category);
    rounds.push({
      layout: 'words',
      correct: r.odd,
      options: shuffle([...r.three, r.odd]).map((w) => ({ id: w, label: w, emoji: WORD_BY_TEXT.get(w).e })),
      explain: `Netinka: ${r.odd}. Kiti trys yra ${r.category}.`,
      build() {
        return { el: h('p', { class: 'sentence' }, 'Kuris iš keturių netinka?'), reveal() {} };
      },
    });
  }
  return rounds;
}

export function mount(root, ctx) {
  runChoiceGame(root, ctx, {
    title: 'Kuris netinka?',
    instruction: 'Trys žodžiai tinka kartu, o vienas netinka. Pasirinkite tą, kuris netinka.',
    buildRounds,
  });
}
