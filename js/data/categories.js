// „Kuris netinka?“: kategorijos vardas daugiskaitos vardininku („Kiti trys yra vaisiai.“) ir žodžiai iš words.js.
// Kategorijos parinktos taip, kad joks žodis netilptų į dvi kategorijas.

export const CATEGORIES = [
  { name: 'vaisiai', words: ['obuolys', 'kriaušė', 'vyšnia', 'citrina', 'bananas'] },
  { name: 'daržovės', words: ['morka', 'bulvė', 'agurkas', 'svogūnas', 'česnakas'] },
  { name: 'gyvūnai', words: ['šuo', 'katė', 'arklys', 'karvė', 'kiaulė', 'kiškis', 'pelė'] },
  { name: 'transporto priemonės', words: ['automobilis', 'laivas', 'lėktuvas', 'dviratis'] },
  { name: 'drabužiai', words: ['kepurė', 'kojinės', 'kelnės', 'marškinėliai'] },
  { name: 'gėrimai', words: ['pienas', 'vanduo', 'arbata', 'kava', 'sultys'] },
  { name: 'dangaus kūnai', words: ['saulė', 'mėnulis', 'žvaigždė'] },
  { name: 'namų daiktai', words: ['durys', 'lova', 'raktas', 'laikrodis', 'telefonas', 'knyga'] },
];

// Poros, kurių nemaišome: vaisiai su gėrimais (sultys) ir pan. gali kelti abejonių.
export const AVOID_PAIRS = [
  ['vaisiai', 'gėrimai'],
  ['gyvūnai', 'gėrimai'],
  ['vaisiai', 'daržovės'],
];
