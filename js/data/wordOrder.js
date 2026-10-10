// Sudėkite sakinį: sakiniai, kurių žodžius reikia sudėti į teisingą eilę.
// Kiekvienas įrašas: [sakinys mažosiomis raidėmis, pasirenkamos kitos tinkamos eilės...].
// Pirmą raidę didžiąja ir tašką gale prideda žaidimas. Tik paprasti esamojo laiko sakiniai,
// kuriuose viena eilė aiškiai natūrali; kitos natūralios eilės surašytos kaip pakaitalai.

const EASY = [
  ['katė geria pieną', 'pieną geria katė'],
  ['mama verda sriubą', 'sriubą verda mama'],
  ['vaikai žaidžia kieme', 'kieme žaidžia vaikai'],
  ['tėtis skaito laikraštį', 'laikraštį skaito tėtis'],
  ['šuo graužia kaulą', 'kaulą graužia šuo'],
  ['močiutė kepa pyragą', 'pyragą kepa močiutė'],
  ['senelis laisto gėles', 'gėles laisto senelis'],
  ['sesuo plauna indus', 'indus plauna sesuo'],
  ['brolis valgo obuolį', 'obuolį valgo brolis'],
  ['paukštis čiulba medyje', 'medyje čiulba paukštis'],
  ['sniegas krinta lauke', 'lauke krinta sniegas'],
  ['vaikas geria sultis', 'sultis geria vaikas'],
  ['pardavėja sveria sūrį', 'sūrį sveria pardavėja'],
  ['karvė ėda žolę', 'žolę ėda karvė'],
  ['višta deda kiaušinius', 'kiaušinius deda višta'],
  ['tėvas taiso kėdę', 'kėdę taiso tėvas'],
  ['saulė šviečia ryškiai'],
  ['mergaitė piešia namą', 'namą piešia mergaitė'],
  ['berniukas valgo sausainį', 'sausainį valgo berniukas'],
  ['zuikis ėda morką', 'morką ėda zuikis'],
];

const MEDIUM = [
  ['mama pjausto šviežią duoną'],
  ['tėtis geria karštą arbatą'],
  ['vaikai valgo šaltus ledus'],
  ['senelė verda skanią košę'],
  ['šuo noriai geria vandenį', 'šuo geria vandenį noriai'],
  ['mama kasdien kepa duoną', 'mama kepa duoną kasdien', 'kasdien mama kepa duoną'],
  ['mūsų katė miega sofoje'],
  ['mažas šuniukas ėda mėsą'],
  ['vaikai lipdo sniego senį'],
  ['vakare tėtis skaito knygą', 'tėtis skaito knygą vakare', 'tėtis vakare skaito knygą'],
  ['ryte mama geria kavą', 'mama geria kavą ryte', 'mama ryte geria kavą'],
  ['mes perkame šviežią pieną'],
  ['močiutė mezga šiltą šaliką'],
  ['vištos lesa grūdus kieme', 'kieme vištos lesa grūdus', 'vištos kieme lesa grūdus'],
  ['katė gaudo mažą pelę'],
  ['sesuo plauna raudoną obuolį'],
  ['brolis geria šaltą pieną'],
  ['tėtis remontuoja seną spintą'],
  ['mergaitė laisto raudonas rožes'],
  ['arklys ėda šviežią šieną'],
];

const HARD = [
  ['mama kepa pyragą su obuoliais'],
  ['vaikai žaidžia kieme su kamuoliu', 'vaikai su kamuoliu žaidžia kieme', 'kieme vaikai žaidžia su kamuoliu'],
  ['tėtis geria juodą kavą be cukraus'],
  ['močiutė mezga šiltą šaliką anūkui'],
  ['senelis rytais laisto gražias gėles', 'rytais senelis laisto gražias gėles', 'senelis laisto gražias gėles rytais'],
  ['šuo bėga paskui mažą katę'],
  ['katė miega ant minkštos sofos'],
  ['mes parduotuvėje perkame šviežią pieną', 'parduotuvėje mes perkame šviežią pieną', 'mes perkame šviežią pieną parduotuvėje'],
  ['vaikai rudenį renka geltonus lapus', 'rudenį vaikai renka geltonus lapus'],
  ['tėtis žiemą valo sniegą kieme', 'žiemą tėtis valo sniegą kieme'],
  ['sesuo vakare plauna indus virtuvėje', 'vakare sesuo plauna indus virtuvėje', 'sesuo plauna indus virtuvėje vakare'],
  ['mama virtuvėje verda skanią sriubą', 'mama verda skanią sriubą virtuvėje', 'virtuvėje mama verda skanią sriubą'],
  ['vištos kieme lesa smulkius grūdus', 'kieme vištos lesa smulkius grūdus', 'vištos lesa smulkius grūdus kieme'],
  ['karvės pievoje ėda žalią žolę', 'karvės ėda žalią žolę pievoje', 'pievoje karvės ėda žalią žolę'],
  ['senelis sode skina raudonus obuolius', 'senelis skina raudonus obuolius sode', 'sode senelis skina raudonus obuolius'],
  ['brolis geria šiltą pieną su medumi'],
  ['sesuo piešia gražų paveikslą pieštuku', 'sesuo pieštuku piešia gražų paveikslą'],
  ['močiutė sekmadienį kepa skanius blynus', 'sekmadienį močiutė kepa skanius blynus', 'močiutė kepa skanius blynus sekmadienį'],
  ['tėtis šeštadienį taiso seną kėdę', 'šeštadienį tėtis taiso seną kėdę', 'tėtis taiso seną kėdę šeštadienį'],
  ['mažas šuniukas geria vandenį iš dubenėlio', 'mažas šuniukas iš dubenėlio geria vandenį'],
];

const build = ([main, ...alts]) => ({
  words: main.split(' '),
  alts: alts.map((a) => a.split(' ')),
});

export const WORD_ORDER = {
  easy: EASY.map(build),
  medium: MEDIUM.map(build),
  hard: HARD.map(build),
};
