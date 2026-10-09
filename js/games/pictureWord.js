// Koks tai žodis? Paveikslėlis ir keli žodžiai.

import { h } from '../ui.js';
import { runChoiceGame } from '../lib/choiceGame.js';
import { sample, shuffle } from '../lib/random.js';
import { WORDS } from '../data/words.js';

export function buildRounds() {
  return sample(WORDS, 6).map((word) => {
    // Klaidinantys žodžiai iš skirtingų grupių, kad nebūtų dviejų panašios reikšmės variantų.
    const seenGroups = new Set([word.g]);
    const wrong = [];
    for (const cand of shuffle(WORDS)) {
      if (wrong.length === 3) break;
      if (seenGroups.has(cand.g)) continue;
      seenGroups.add(cand.g);
      wrong.push(cand);
    }
    return {
      layout: 'words',
      correct: word.w,
      options: [word, ...wrong].map((x) => ({ id: x.w, label: x.w })),
      explain: `Tai yra ${word.w}.`,
      build() {
        const slot = h('div', { class: 'big-emoji', role: 'img', 'aria-label': 'Paveikslėlis' }, word.e);
        return { el: slot, reveal() {} };
      },
    };
  });
}

export function mount(root, ctx) {
  runChoiceGame(root, ctx, {
    title: 'Koks tai žodis?',
    instruction: 'Pažiūrėkite į paveikslėlį ir pasirinkite tinkamą žodį.',
    buildRounds,
  });
}
