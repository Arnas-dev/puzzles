// Sudėkite sakinį: maišymas, tikrinimas, užuomina ir atšaukimas (be sąsajos).
// Sakinys = { words: [...], alts?: [[...], ...] }. Žodžiai saugomi mažosiomis raidėmis.
// Dėlionės būsena: slots[i] = plytelės id arba null. Plytelė = { id, text }.

import { shuffle } from './random.js';

export const orders = (s) => [s.words, ...(s.alts || [])];

const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// Sumaišytos plytelės: eilė niekada nesutampa su teisinga (nei su jokia leistina) eile.
export function makeTiles(sentence, rnd = Math.random) {
  const tiles = sentence.words.map((text, i) => ({ id: i, text }));
  const all = orders(sentence);
  const n = tiles.length;
  if (n < 2) return tiles;
  for (let t = 0; t < 200; t++) {
    const mixed = shuffle(tiles, rnd);
    if (!all.some((o) => same(o, mixed.map((x) => x.text)))) return mixed;
  }
  // Atsarginis variantas: apsukame teisingą eilę (visada kitokia, jei visi žodžiai skirtingi).
  return tiles.slice().reverse();
}

// Tekstai pagal vietas (null, jei vieta tuščia).
export function textsOf(slots, tiles) {
  return slots.map((id) => {
    if (id == null) return null;
    const t = tiles.find((x) => x.id === id);
    return t ? t.text : null;
  });
}

export function isCorrect(texts, sentence) {
  if (texts.some((t) => t == null)) return false;
  return orders(sentence).some((o) => same(o, texts));
}

// Eilė, kuri geriausiai atitinka dabartinę padėtį (lygiųjų atveju pagrindinė).
export function bestOrder(texts, sentence) {
  let best = sentence.words;
  let bestScore = -1;
  for (const o of orders(sentence)) {
    const score = o.reduce((n, w, i) => n + (texts[i] === w ? 1 : 0), 0);
    if (score > bestScore) { best = o; bestScore = score; }
  }
  return best;
}

// Kiekvienai vietai: true, jei joje stovi teisingas žodis (pagal artimiausią leistiną eilę).
export function positionCorrect(texts, sentence) {
  const best = bestOrder(texts, sentence);
  return texts.map((t, i) => t != null && t === best[i]);
}

// Padeda plytelę į pirmą laisvą vietą. Grąžina naują slots arba null, jei vietų nėra / plytelė jau padėta.
export function place(slots, id) {
  if (slots.includes(id)) return null;
  const i = slots.indexOf(null);
  if (i < 0) return null;
  const next = slots.slice();
  next[i] = id;
  return next;
}

// Grąžina plytelę į apačią.
export function remove(slots, id) {
  const i = slots.indexOf(id);
  if (i < 0) return null;
  const next = slots.slice();
  next[i] = null;
  return next;
}

// Atšaukia paskutinį padėjimą (tik tarp neužrakintų). history = id eilė, locked = vietų aibė.
export function undo(slots, history, locked = new Set()) {
  for (let k = history.length - 1; k >= 0; k--) {
    const id = history[k];
    const i = slots.indexOf(id);
    if (i < 0 || locked.has(i)) continue;
    const next = slots.slice();
    next[i] = null;
    return { slots: next, history: history.slice(0, k) };
  }
  return null;
}

// Po neteisingo bandymo: teisingos vietos lieka, kitos plytelės grįžta. Grąžina { slots, kept, returned }.
export function keepCorrect(slots, tiles, sentence) {
  const ok = positionCorrect(textsOf(slots, tiles), sentence);
  const kept = new Set();
  const returned = [];
  const next = slots.map((id, i) => {
    if (id != null && ok[i]) { kept.add(i); return id; }
    if (id != null) returned.push(id);
    return null;
  });
  return { slots: next, kept, returned };
}

// Užuomina: pirma vieta, kurioje nėra teisingo žodžio, ir to žodžio plytelė.
// Pirmiausia ieškoma dar nepadėtos plytelės, paskui (jei ji jau stovi kitoje, neteisingoje vietoje) padėtos.
export function nextHint(slots, tiles, sentence) {
  const texts = textsOf(slots, tiles);
  if (isCorrect(texts, sentence)) return null;
  const target = bestOrder(texts, sentence);
  const ok = positionCorrect(texts, sentence);
  const index = ok.findIndex((v) => !v);
  if (index < 0) return null;
  const word = target[index];
  const free = tiles.find((t) => t.text === word && !slots.includes(t.id));
  const tile = free || tiles.find((t) => t.text === word && slots.indexOf(t.id) !== index && !ok[slots.indexOf(t.id)]);
  if (!tile) return null;
  return { index, id: tile.id, text: word };
}

// Įvykdo užuominą: tikslinė vieta išvaloma (jei joje stovėjo kitas žodis), plytelė pastatoma į ją.
export function applyHint(slots, hint) {
  const next = slots.slice();
  const from = next.indexOf(hint.id);
  if (from >= 0) next[from] = null;
  next[hint.index] = hint.id;
  return next;
}

// Sakinys ekrane: pirma raidė didžioji, gale taškas.
export function display(words) {
  const text = words.join(' ');
  return text.charAt(0).toLocaleUpperCase('lt') + text.slice(1) + '.';
}

// Žodis eilutėje: pirmas rodomas su didžiąja raide.
export function shownWord(text, index) {
  return index === 0 ? text.charAt(0).toLocaleUpperCase('lt') + text.slice(1) : text;
}
