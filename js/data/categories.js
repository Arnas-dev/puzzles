// „Kuris netinka?“: kategorijos vardas daugiskaitos vardininku („Kiti trys yra vaisiai.“) ir žodžiai iš words.js.
// Kategorijos parinktos taip, kad joks žodis netilptų į dvi kategorijas.

export const CATEGORIES = [
  { name: 'vaisiai', words: ['obuolys', 'kriaušė', 'citrina', 'bananas', 'arbūzas', 'vynuogės', 'braškė', 'apelsinas', 'persikas', 'ananasas', 'kivis'] },
  { name: 'daržovės', words: ['morka', 'bulvė', 'agurkas', 'svogūnas', 'česnakas', 'pomidoras', 'kukurūzas', 'brokolis'] },
  { name: 'maistas', words: ['duona', 'sūris', 'kiaušinis', 'tortas', 'ledai', 'sausainis', 'pica', 'medus', 'makaronai', 'šokoladas'] },
  { name: 'gėrimai', words: ['pienas', 'vanduo', 'arbata', 'kava', 'sultys'] },
  { name: 'gyvūnai', words: ['šuo', 'katė', 'arklys', 'karvė', 'kiaulė', 'kiškis', 'pelė', 'avis', 'ožka', 'lapė', 'vilkas', 'lokys', 'žirafa', 'dramblys', 'liūtas', 'tigras', 'beždžionė', 'varlė', 'gyvatė', 'delfinas', 'vėžlys', 'ežys', 'zebras', 'kengūra', 'panda'] },
  { name: 'paukščiai', words: ['višta', 'antis', 'pelėda', 'papūga', 'pingvinas', 'gulbė', 'erelis', 'gaidys'] },
  { name: 'vabzdžiai', words: ['bitė', 'drugelis', 'skruzdė', 'boružė', 'vikšras'] },
  { name: 'transporto priemonės', words: ['automobilis', 'laivas', 'lėktuvas', 'dviratis', 'autobusas', 'traukinys', 'sunkvežimis', 'traktorius', 'motociklas', 'raketa'] },
  { name: 'drabužiai', words: ['kepurė', 'batai', 'kojinės', 'kelnės', 'marškinėliai', 'suknelė', 'šalikas', 'pirštinės'] },
  { name: 'oro reiškiniai', words: ['debesis', 'lietus', 'sniegas', 'žaibas', 'vaivorykštė'] },
  { name: 'namų daiktai', words: ['durys', 'lova', 'kėdė', 'sofa', 'raktas', 'laikrodis', 'žvakė', 'vonia'] },
  { name: 'mokyklos reikmenys', words: ['knyga', 'pieštukas', 'rašiklis', 'sąsiuvinis', 'liniuotė', 'kuprinė'] },
  { name: 'muzikos instrumentai', words: ['gitara', 'smuikas', 'būgnas', 'trimitas', 'saksofonas'] },
  { name: 'pastatai', words: ['namas', 'mokykla', 'ligoninė', 'bažnyčia', 'pilis', 'parduotuvė', 'fabrikas', 'viešbutis'] },
  { name: 'augalai', words: ['gėlė', 'medis', 'rožė', 'tulpė', 'saulėgrąža', 'kaktusas', 'palmė'] },
  { name: 'kūno dalys', words: ['akis', 'ausis', 'nosis', 'dantis', 'liežuvis'] },
];

// Poros, kurių nemaišome: vaisiai su gėrimais (sultys) ir pan. gali kelti abejonių.
export const AVOID_PAIRS = [
  ['vaisiai', 'gėrimai'],
  ['gyvūnai', 'gėrimai'],
  ['vaisiai', 'daržovės'],
  ['maistas', 'vaisiai'],
  ['maistas', 'daržovės'],
  ['maistas', 'gėrimai'],
  ['augalai', 'vaisiai'],
  ['augalai', 'daržovės'],
  ['gyvūnai', 'paukščiai'],
  ['gyvūnai', 'vabzdžiai'],
  ['paukščiai', 'vabzdžiai'],
  ['namų daiktai', 'pastatai'],
  ['namų daiktai', 'mokyklos reikmenys'],
  ['mokyklos reikmenys', 'drabužiai'],
  ['oro reiškiniai', 'gėrimai'],
];
