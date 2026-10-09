// Trūkstamas žodis sakinyje.

import { h } from '../ui.js';
import { runChoiceGame } from '../lib/choiceGame.js';
import { sample } from '../lib/random.js';
import { SENTENCES } from '../data/sentences.js';

// Tarpas prieš / po žodžio: prieš „.“ ir „““ jo nereikia.
export function fullSentence(s) {
  const glue = /^[.“”,!?]/.test(s.after) ? '' : ' ';
  const open = /„$/.test(s.before) ? '' : ' ';
  return `${s.before}${open}${s.answer}${glue}${s.after}`;
}

export function buildRounds() {
  return sample(SENTENCES, 6).map((s) => ({
    layout: 'words',
    correct: s.answer,
    options: [s.answer, ...s.wrong].map((w) => ({ id: w, label: w })),
    explain: fullSentence(s),
    build() {
      const slot = h('span', { class: 'blank-slot', 'aria-hidden': 'true' }, '______');
      const openGap = /„$/.test(s.before) ? '' : ' ';
      const closeGap = /^[.“”,!?]/.test(s.after) ? '' : ' ';
      const el = h('p', { class: 'sentence' }, s.before, openGap, slot, closeGap, s.after);
      return {
        el,
        reveal() {
          slot.textContent = s.answer;
          slot.classList.add('filled');
          slot.removeAttribute('aria-hidden');
        },
      };
    },
  }));
}

export function mount(root, ctx) {
  runChoiceGame(root, ctx, {
    title: 'Trūkstamas žodis',
    instruction: 'Pasirinkite žodį, kuris tinka sakiniui.',
    buildRounds,
  });
}
