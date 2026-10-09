// Kryžiažodžių išdėstymai. Juos rado ir patikrino tools/find-crosswords.mjs, o tests/data.test.js tikrina dar kartą.
// A = iš kairės į dešinę, D = iš viršaus į apačią; row/col skaičiuojami nuo 0.
// Užuominos ir paveikslėliai imami iš clues.js ir words.js.

import { CLUES, EXTRA } from './clues.js';
import { WORD_BY_TEXT } from './words.js';

export const CROSSWORDS = [
  [
    { answer: 'ledai', row: 3, col: 0, dir: 'A' },
    { answer: 'pelė', row: 1, col: 0, dir: 'D' },
    { answer: 'uoga', row: 0, col: 3, dir: 'D' },
  ],
  [
    { answer: 'namas', row: 4, col: 0, dir: 'A' },
    { answer: 'katė', row: 1, col: 1, dir: 'A' },
    { answer: 'kava', row: 1, col: 1, dir: 'D' },
    { answer: 'tėtis', row: 0, col: 4, dir: 'D' },
  ],
  [
    { answer: 'durys', row: 1, col: 0, dir: 'A' },
    { answer: 'batai', row: 4, col: 0, dir: 'A' },
    { answer: 'duona', row: 0, col: 1, dir: 'D' },
    { answer: 'sūris', row: 1, col: 4, dir: 'D' },
  ],
  [
    { answer: 'tortas', row: 1, col: 0, dir: 'A' },
    { answer: 'grybas', row: 4, col: 0, dir: 'A' },
    { answer: 'arklys', row: 0, col: 2, dir: 'D' },
    { answer: 'raktas', row: 0, col: 4, dir: 'D' },
  ],
];

export function describeWord(answer) {
  const extra = EXTRA[answer];
  return {
    emoji: extra ? extra.e : WORD_BY_TEXT.get(answer)?.e ?? '',
    clue: extra ? extra.clue : CLUES[answer] ?? '',
  };
}
