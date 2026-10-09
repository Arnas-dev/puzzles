// Žodžių lentelė: w = žodis, e = paveikslėlis, g = grupė (kad pasirinkimuose nebūtų panašių reikšmių).
// Visi žodžiai yra įvardiniai daiktavardžiai vienaskaitos arba daugiskaitos vardininko linksniu.

export const WORDS = [
  // gyvūnai
  { w: 'šuo', e: '🐶', g: 'gyvūnai' },
  { w: 'katė', e: '🐱', g: 'gyvūnai' },
  { w: 'arklys', e: '🐴', g: 'gyvūnai' },
  { w: 'karvė', e: '🐄', g: 'gyvūnai' },
  { w: 'kiaulė', e: '🐷', g: 'gyvūnai' },
  { w: 'kiškis', e: '🐰', g: 'gyvūnai' },
  { w: 'pelė', e: '🐭', g: 'gyvūnai' },
  { w: 'žuvis', e: '🐟', g: 'gyvūnai' },
  { w: 'paukštis', e: '🐦', g: 'gyvūnai' },
  { w: 'bitė', e: '🐝', g: 'gyvūnai' },
  { w: 'drugelis', e: '🦋', g: 'gyvūnai' },
  // vaisiai
  { w: 'obuolys', e: '🍎', g: 'vaisiai' },
  { w: 'kriaušė', e: '🍐', g: 'vaisiai' },
  { w: 'vyšnia', e: '🍒', g: 'vaisiai' },
  { w: 'citrina', e: '🍋', g: 'vaisiai' },
  { w: 'bananas', e: '🍌', g: 'vaisiai' },
  // daržovės
  { w: 'morka', e: '🥕', g: 'daržovės' },
  { w: 'bulvė', e: '🥔', g: 'daržovės' },
  { w: 'agurkas', e: '🥒', g: 'daržovės' },
  { w: 'svogūnas', e: '🧅', g: 'daržovės' },
  { w: 'česnakas', e: '🧄', g: 'daržovės' },
  { w: 'pomidoras', e: '🍅', g: 'daržovės' },
  // maistas
  { w: 'duona', e: '🍞', g: 'maistas' },
  { w: 'sūris', e: '🧀', g: 'maistas' },
  { w: 'kiaušinis', e: '🥚', g: 'maistas' },
  { w: 'tortas', e: '🎂', g: 'maistas' },
  { w: 'ledai', e: '🍦', g: 'maistas' },
  { w: 'sausainis', e: '🍪', g: 'maistas' },
  { w: 'grybas', e: '🍄', g: 'maistas' },
  // gėrimai
  { w: 'pienas', e: '🥛', g: 'gėrimai' },
  { w: 'vanduo', e: '💧', g: 'gėrimai' },
  { w: 'arbata', e: '🍵', g: 'gėrimai' },
  { w: 'kava', e: '☕', g: 'gėrimai' },
  { w: 'sultys', e: '🧃', g: 'gėrimai' },
  // dangus ir oras
  { w: 'saulė', e: '☀️', g: 'dangus' },
  { w: 'mėnulis', e: '🌙', g: 'dangus' },
  { w: 'žvaigždė', e: '⭐', g: 'dangus' },
  { w: 'debesis', e: '☁️', g: 'dangus' },
  { w: 'lietus', e: '🌧️', g: 'dangus' },
  { w: 'sniegas', e: '❄️', g: 'dangus' },
  // transportas
  { w: 'automobilis', e: '🚗', g: 'transportas' },
  { w: 'laivas', e: '🚢', g: 'transportas' },
  { w: 'lėktuvas', e: '✈️', g: 'transportas' },
  { w: 'dviratis', e: '🚲', g: 'transportas' },
  // drabužiai
  { w: 'kepurė', e: '🧢', g: 'drabužiai' },
  { w: 'batai', e: '👟', g: 'drabužiai' },
  { w: 'kojinės', e: '🧦', g: 'drabužiai' },
  { w: 'kelnės', e: '👖', g: 'drabužiai' },
  { w: 'marškinėliai', e: '👕', g: 'drabužiai' },
  // namai ir daiktai
  { w: 'namas', e: '🏠', g: 'namai' },
  { w: 'durys', e: '🚪', g: 'namai' },
  { w: 'lova', e: '🛏️', g: 'namai' },
  { w: 'raktas', e: '🔑', g: 'namai' },
  { w: 'laikrodis', e: '🕒', g: 'namai' },
  { w: 'telefonas', e: '📱', g: 'namai' },
  { w: 'knyga', e: '📖', g: 'namai' },
  { w: 'akiniai', e: '👓', g: 'namai' },
  // kita
  { w: 'gėlė', e: '🌸', g: 'kita' },
  { w: 'medis', e: '🌳', g: 'kita' },
  { w: 'širdis', e: '❤️', g: 'kita' },
  { w: 'ugnis', e: '🔥', g: 'kita' },
];

export const WORD_BY_TEXT = new Map(WORDS.map((x) => [x.w, x]));

// Lietuvių abėcėlė (32 raidės).
export const ALPHABET = 'aąbcčdeęėfghiįyjklmnoprsštuųūvzž'.split('');

// Raidžių „giminaičiai“: lengviausiuose klausimuose jų kaip klaidinančių variantų nenaudojame.
export const LETTER_FAMILY = {
  a: 'a', ą: 'a',
  e: 'e', ę: 'e', ė: 'e',
  i: 'i', į: 'i', y: 'i',
  u: 'u', ų: 'u', ū: 'u',
  c: 'c', č: 'c',
  s: 's', š: 's',
  z: 'z', ž: 'z',
};

export const familyOf = (ch) => LETTER_FAMILY[ch] || ch;
