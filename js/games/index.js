// Visų užduočių sąrašas. Eilės tvarka čia yra eilės tvarka pradžios puslapyje.

export const GAMES = [
  {
    id: 'kryziazodis',
    icon: '🧩',
    title: 'Kryžiažodis',
    desc: 'Atspėkite žodžius ir pasirinkite raides.',
    load: () => import('./crossword.js'),
  },
  {
    id: 'pabaikite-zodi',
    icon: '✏️',
    title: 'Pabaikite žodį',
    desc: 'Pasirinkite trūkstamą raidę.',
    load: () => import('./completeWord.js'),
  },
  {
    id: 'koks-tai-zodis',
    icon: '🖼️',
    title: 'Koks tai žodis?',
    desc: 'Pažiūrėkite į paveikslėlį ir pasirinkite žodį.',
    load: () => import('./pictureWord.js'),
  },
  {
    id: 'trukstamas-zodis',
    icon: '💬',
    title: 'Trūkstamas žodis',
    desc: 'Užbaikite sakinį tinkamu žodžiu.',
    load: () => import('./sentence.js'),
  },
  {
    id: 'skaiciai',
    icon: '🔢',
    title: 'Skaičių lygtys',
    desc: 'Pasirinkite trūkstamą skaičių.',
    load: () => import('./equations.js'),
  },
  {
    id: 'seka',
    icon: '🔁',
    title: 'Tęskite seką',
    desc: 'Kas bus toliau?',
    load: () => import('./sequence.js'),
  },
  {
    id: 'kuris-netinka',
    icon: '🧐',
    title: 'Kuris netinka?',
    desc: 'Raskite, kas čia nedera.',
    load: () => import('./oddOneOut.js'),
  },
  {
    id: 'lemputes',
    icon: '💡',
    title: 'Lemputės',
    desc: 'Užgesinkite visas lemputes.',
    load: () => import('./lights.js'),
  },
  {
    id: 'sudoku',
    icon: '🔲',
    title: 'Mažasis sudoku',
    desc: 'Skaičiai nuo 1 iki 4 neturi kartotis.',
    load: () => import('./sudoku.js'),
  },
];
