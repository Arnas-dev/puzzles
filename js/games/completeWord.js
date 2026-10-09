// Pabaikite žodį: trūksta vienos raidės, pasirenkama iš kelių.

import { h } from '../ui.js';
import { runChoiceGame } from '../lib/choiceGame.js';
import { sample } from '../lib/random.js';
import { COMPLETE_WORDS } from '../data/completeWords.js';
import { WORD_BY_TEXT } from '../data/words.js';

export function buildRounds() {
  return sample(COMPLETE_WORDS, 6).map((item) => {
    const chars = Array.from(item.w);
    const correct = chars[item.i];
    return {
      layout: 'letters',
      correct,
      options: [correct, ...item.wrong].map((ch) => ({ id: ch, label: ch })),
      explain: `Žodis yra „${item.w}“.`,
      build() {
        const boxes = chars.map((ch, k) =>
          h('span', { class: 'letter-box' + (k === item.i ? ' blank' : '') }, k === item.i ? '?' : ch));
        const el = h('div', {},
          h('div', { class: 'big-emoji', 'aria-hidden': 'true' }, WORD_BY_TEXT.get(item.w).e),
          h('div', { class: 'letters-row', 'aria-label': `Žodis su trūkstama raide` }, boxes),
        );
        return {
          el,
          reveal() {
            boxes[item.i].textContent = correct;
            boxes[item.i].classList.remove('blank');
            boxes[item.i].classList.add('filled');
          },
        };
      },
    };
  });
}

export function mount(root, ctx) {
  runChoiceGame(root, ctx, {
    title: 'Pabaikite žodį',
    instruction: 'Pasirinkite trūkstamą raidę.',
    buildRounds,
  });
}
