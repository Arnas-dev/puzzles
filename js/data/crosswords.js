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
  [
    { answer: 'rožė', row: 2, col: 0, dir: 'A' },
    { answer: 'šuo', row: 0, col: 1, dir: 'D' },
  ],
  [
    { answer: 'akis', row: 3, col: 0, dir: 'A' },
    { answer: 'morka', row: 0, col: 1, dir: 'D' },
  ],
  [
    { answer: 'mama', row: 3, col: 0, dir: 'A' },
    { answer: 'sofa', row: 0, col: 1, dir: 'D' },
  ],
  [
    { answer: 'višta', row: 2, col: 0, dir: 'A' },
    { answer: 'lova', row: 0, col: 0, dir: 'D' },
  ],
  [
    { answer: 'sala', row: 3, col: 0, dir: 'A' },
    { answer: 'avis', row: 0, col: 0, dir: 'D' },
    { answer: 'pica', row: 0, col: 3, dir: 'D' },
  ],
  [
    { answer: 'lapė', row: 2, col: 0, dir: 'A' },
    { answer: 'gėlė', row: 0, col: 0, dir: 'D' },
    { answer: 'kėdė', row: 1, col: 3, dir: 'D' },
  ],
  [
    { answer: 'akis', row: 1, col: 0, dir: 'A' },
    { answer: 'karvė', row: 0, col: 0, dir: 'D' },
    { answer: 'bitė', row: 0, col: 2, dir: 'D' },
  ],
  [
    { answer: 'ožka', row: 2, col: 0, dir: 'A' },
    { answer: 'morka', row: 1, col: 0, dir: 'D' },
    { answer: 'lokys', row: 0, col: 2, dir: 'D' },
  ],
  [
    { answer: 'medus', row: 3, col: 0, dir: 'A' },
    { answer: 'palmė', row: 0, col: 0, dir: 'D' },
    { answer: 'nosis', row: 1, col: 4, dir: 'D' },
  ],
  [
    { answer: 'žvakė', row: 2, col: 1, dir: 'A' },
    { answer: 'ausis', row: 4, col: 0, dir: 'A' },
    { answer: 'kivis', row: 0, col: 2, dir: 'D' },
    { answer: 'lokys', row: 0, col: 4, dir: 'D' },
  ],
  [
    { answer: 'antis', row: 3, col: 1, dir: 'A' },
    { answer: 'batai', row: 1, col: 0, dir: 'A' },
    { answer: 'namas', row: 0, col: 1, dir: 'D' },
    { answer: 'dantis', row: 0, col: 3, dir: 'D' },
  ],
  [
    { answer: 'lietus', row: 1, col: 0, dir: 'A' },
    { answer: 'pilis', row: 3, col: 1, dir: 'A' },
    { answer: 'medis', row: 0, col: 2, dir: 'D' },
    { answer: 'žuvis', row: 0, col: 4, dir: 'D' },
  ],
  [
    { answer: 'katė', row: 4, col: 1, dir: 'A' },
    { answer: 'banga', row: 1, col: 0, dir: 'A' },
    { answer: 'knyga', row: 0, col: 2, dir: 'D' },
    { answer: 'karvė', row: 0, col: 4, dir: 'D' },
  ],
  [
    { answer: 'papūga', row: 2, col: 0, dir: 'A' },
    { answer: 'kepurė', row: 0, col: 0, dir: 'D' },
    { answer: 'būgnas', row: 0, col: 4, dir: 'D' },
    { answer: 'raktas', row: 4, col: 0, dir: 'A' },
  ],
  [
    { answer: 'gitara', row: 1, col: 0, dir: 'A' },
    { answer: 'dovana', row: 4, col: 0, dir: 'A' },
    { answer: 'žaibas', row: 0, col: 3, dir: 'D' },
    { answer: 'kalnas', row: 0, col: 5, dir: 'D' },
  ],
  [
    { answer: 'liūtas', row: 1, col: 0, dir: 'A' },
    { answer: 'kiškis', row: 0, col: 1, dir: 'D' },
    { answer: 'dantis', row: 0, col: 4, dir: 'D' },
    { answer: 'širdis', row: 4, col: 0, dir: 'A' },
  ],
  [
    { answer: 'vanduo', row: 3, col: 0, dir: 'A' },
    { answer: 'peilis', row: 1, col: 0, dir: 'A' },
    { answer: 'pienas', row: 0, col: 2, dir: 'D' },
    { answer: 'kiaulė', row: 0, col: 4, dir: 'D' },
  ],
  [
    { answer: 'tigras', row: 1, col: 0, dir: 'A' },
    { answer: 'žiedas', row: 4, col: 0, dir: 'A' },
    { answer: 'širdis', row: 0, col: 1, dir: 'D' },
    { answer: 'kalnas', row: 0, col: 4, dir: 'D' },
  ],
  [
    { answer: 'vilkas', row: 4, col: 0, dir: 'A' },
    { answer: 'saulė', row: 1, col: 2, dir: 'D' },
    { answer: 'banga', row: 0, col: 4, dir: 'D' },
  ],
  [
    { answer: 'krabas', row: 0, col: 0, dir: 'A' },
    { answer: 'tulpė', row: 2, col: 1, dir: 'A' },
    { answer: 'bulvė', row: 0, col: 3, dir: 'D' },
    { answer: 'skėtis', row: 0, col: 5, dir: 'D' },
  ],
  [
    { answer: 'sultys', row: 0, col: 0, dir: 'A' },
    { answer: 'tigras', row: 0, col: 3, dir: 'D' },
    { answer: 'sofa', row: 0, col: 5, dir: 'D' },
  ],
  [
    { answer: 'gaidys', row: 5, col: 0, dir: 'A' },
    { answer: 'knyga', row: 1, col: 1, dir: 'D' },
    { answer: 'laivas', row: 0, col: 5, dir: 'D' },
  ],
  [
    { answer: 'varlė', row: 2, col: 0, dir: 'A' },
    { answer: 'kava', row: 0, col: 0, dir: 'D' },
    { answer: 'lapė', row: 2, col: 3, dir: 'D' },
  ],
  [
    { answer: 'žiedas', row: 2, col: 0, dir: 'A' },
    { answer: 'ežys', row: 1, col: 0, dir: 'D' },
    { answer: 'krabas', row: 0, col: 4, dir: 'D' },
  ],
];

export function describeWord(answer) {
  const extra = EXTRA[answer];
  return {
    emoji: extra ? extra.e : WORD_BY_TEXT.get(answer)?.e ?? '',
    clue: extra ? extra.clue : CLUES[answer] ?? '',
  };
}
