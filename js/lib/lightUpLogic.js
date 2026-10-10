// Šviesos (angl. Light Up / Akari): loginė dalis be sąsajos.
// Langelių kodai: -1 = baltas, -2 = juodas be skaičiaus, 0..4 = juodas su skaičiumi
// (tiek lempučių turi stovėti keturiuose gretimuose langeliuose).
// Lemputės: masyvas iš n*n skaičių, 1 = lemputė, 0 = nėra.
// Lemputė apšviečia savo eilutę ir stulpelį iki artimiausio juodo langelio.

import { shuffle } from './random.js';

export const WHITE = -1;
export const BLOCK = -2;

export const isWhite = (v) => v === WHITE;
export const isNumber = (v) => v >= 0;

// ---------- pagalbiniai ----------

// Užduotis iš eilučių: '.' baltas, '#' juodas, '0'..'4' juodas su skaičiumi.
export function parsePuzzle(rows) {
  const n = rows.length;
  const cells = [];
  for (const row of rows) {
    if (row.length !== n) throw new Error('Užduotis turi būti kvadratinė');
    for (const ch of row) cells.push(ch === '.' ? WHITE : ch === '#' ? BLOCK : Number(ch));
  }
  return { n, cells };
}

export function puzzleRows({ n, cells }) {
  const out = [];
  for (let r = 0; r < n; r++) {
    out.push(cells.slice(r * n, r * n + n).map((v) => (v === WHITE ? '.' : v === BLOCK ? '#' : String(v))).join(''));
  }
  return out;
}

export function neighbours(n, i) {
  const r = Math.floor(i / n);
  const c = i % n;
  const out = [];
  if (r > 0) out.push(i - n);
  if (c > 0) out.push(i - 1);
  if (c < n - 1) out.push(i + 1);
  if (r < n - 1) out.push(i + n);
  return out;
}

// Baltų langelių, kuriuos mato langelis i (pats i taip pat), sąrašas.
export function viewOf(cells, n, i) {
  const out = [i];
  const r = Math.floor(i / n);
  const c = i % n;
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    let rr = r + dr;
    let cc = c + dc;
    while (rr >= 0 && rr < n && cc >= 0 && cc < n && cells[rr * n + cc] === WHITE) {
      out.push(rr * n + cc);
      rr += dr;
      cc += dc;
    }
  }
  return out;
}

function views(cells, n) {
  return cells.map((v, i) => (v === WHITE ? viewOf(cells, n, i) : []));
}

export const emptyLamps = (n) => new Array(n * n).fill(0);

// ---------- taisyklių tikrinimas ----------

// Apšviesti langeliai (taip pat ir pats lemputės langelis). Grąžina bool masyvą.
export function litCells({ n, cells }, lamps) {
  const lit = new Array(n * n).fill(false);
  const vs = views(cells, n);
  lamps.forEach((l, i) => {
    if (l && cells[i] === WHITE) for (const j of vs[i]) lit[j] = true;
  });
  return lit;
}

// Lemputės, kurios mato kitą lemputę.
export function conflicts({ n, cells }, lamps) {
  const hit = new Set();
  lamps.forEach((l, i) => {
    if (!l || cells[i] !== WHITE) return;
    for (const j of viewOf(cells, n, i)) {
      if (j !== i && lamps[j]) { hit.add(i); hit.add(j); }
    }
  });
  return hit;
}

// Lempučių skaičius aplink kiekvieną juodą langelį su skaičiumi: Map indeksas -> kiek.
export function numberCounts({ n, cells }, lamps) {
  const m = new Map();
  cells.forEach((v, i) => {
    if (!isNumber(v)) return;
    m.set(i, neighbours(n, i).filter((j) => cells[j] === WHITE && lamps[j]).length);
  });
  return m;
}

// Skaičiai, kurių kaimynystėje lempučių per daug.
export function overNumbers(puzzle, lamps) {
  const out = new Set();
  for (const [i, count] of numberCounts(puzzle, lamps)) if (count > puzzle.cells[i]) out.add(i);
  return out;
}

// Skaičiai, kurių kaimynystėje lempučių lygiai tiek, kiek reikia.
export function doneNumbers(puzzle, lamps) {
  const out = new Set();
  for (const [i, count] of numberCounts(puzzle, lamps)) if (count === puzzle.cells[i]) out.add(i);
  return out;
}

export function unlitCount(puzzle, lamps) {
  const lit = litCells(puzzle, lamps);
  return puzzle.cells.filter((v, i) => v === WHITE && !lit[i]).length;
}

export function isSolved(puzzle, lamps) {
  const { cells } = puzzle;
  if (lamps.length !== cells.length) return false;
  if (lamps.some((l, i) => l && cells[i] !== WHITE)) return false;
  if (conflicts(puzzle, lamps).size > 0) return false;
  if (unlitCount(puzzle, lamps) > 0) return false;
  for (const [i, count] of numberCounts(puzzle, lamps)) if (count !== cells[i]) return false;
  return true;
}

// ---------- sprendiklis ----------

// Atgalinio perrinkimo sprendiklis su išvadų sklaida. Skaičiuoja sprendinius iki `limit`.
// Grąžina { count, solution } (solution - pirmas rastas lempučių masyvas arba null).
export function solve({ n, cells }, limit = 2) {
  const vs = views(cells, n);
  const nums = [];
  cells.forEach((v, i) => {
    if (isNumber(v)) nums.push({ i, v, nb: neighbours(n, i).filter((j) => cells[j] === WHITE) });
  });
  const whites = [];
  cells.forEach((v, i) => { if (v === WHITE) whites.push(i); });

  let count = 0;
  let first = null;

  // s: 0 = nežinoma, 1 = lemputė, 2 = be lemputės
  function setLamp(s, i) {
    if (s[i] === 2) return false;
    if (s[i] === 1) return true;
    s[i] = 1;
    for (const j of vs[i]) {
      if (j === i) continue;
      if (s[j] === 1) return false;
      s[j] = 2;
    }
    return true;
  }

  function propagate(s) {
    let changed = true;
    while (changed) {
      changed = false;
      for (const { v, nb } of nums) {
        let lamps = 0;
        let unk = 0;
        for (const j of nb) { if (s[j] === 1) lamps++; else if (s[j] === 0) unk++; }
        if (lamps > v || lamps + unk < v) return false;
        if (unk > 0 && (lamps === v || lamps + unk === v)) {
          for (const j of nb) {
            if (s[j] !== 0) continue;
            if (lamps === v) s[j] = 2;
            else if (!setLamp(s, j)) return false;
          }
          changed = true;
        }
      }
      for (const w of whites) {
        const view = vs[w];
        let lit = false;
        let cand = -1;
        let candCount = 0;
        for (const j of view) {
          if (s[j] === 1) { lit = true; break; }
          if (s[j] === 0) { cand = j; candCount++; }
        }
        if (lit) continue;
        if (candCount === 0) return false;
        if (candCount === 1) {
          if (!setLamp(s, cand)) return false;
          changed = true;
        }
      }
    }
    return true;
  }

  function search(s) {
    if (count >= limit) return;
    if (!propagate(s)) return;
    const pick = whites.find((i) => s[i] === 0);
    if (pick === undefined) {
      count++;
      if (!first) first = s.map((x) => (x === 1 ? 1 : 0));
      return;
    }
    const a = s.slice();
    if (setLamp(a, pick)) search(a);
    if (count >= limit) return;
    const b = s.slice();
    b[pick] = 2;
    search(b);
  }

  search(new Array(n * n).fill(0));
  return { count, solution: first };
}

// ---------- generatorius ----------

const BLACK_RANGE = { 4: [3, 4], 5: [4, 6], 6: [6, 9], 7: [8, 12] };

// Atsitiktinė išdėstymo schema: juodi langeliai + visus langelius apšviečiantis lempučių rinkinys.
function randomLayout(n, rnd) {
  const [lo, hi] = BLACK_RANGE[n] || [Math.round(n * 1.2), Math.round(n * 1.6)];
  const k = lo + Math.floor(rnd() * (hi - lo + 1));
  const cells = new Array(n * n).fill(WHITE);
  for (const i of shuffle([...cells.keys()], rnd).slice(0, k)) cells[i] = BLOCK;
  const lamps = new Array(n * n).fill(0);
  const lit = new Array(n * n).fill(false);
  for (const i of shuffle([...cells.keys()], rnd)) {
    if (cells[i] !== WHITE || lit[i]) continue;
    lamps[i] = 1;
    for (const j of viewOf(cells, n, i)) lit[j] = true;
  }
  return { cells, lamps };
}

function generateOnce(n, rnd) {
  const { cells, lamps } = randomLayout(n, rnd);
  const full = cells.slice();
  const blocks = [];
  cells.forEach((v, i) => { if (v === BLOCK) blocks.push(i); });
  for (const i of blocks) full[i] = neighbours(n, i).filter((j) => lamps[j]).length;
  if (solve({ n, cells: full }, 2).count !== 1) return null;
  // Skaičius paliekame ten, kur jų reikia vienareikšmiškumui; dalį visada paliekame, kad būtų lengviau.
  const order = shuffle(blocks, rnd);
  let removable = Math.floor(blocks.length / 2);
  const puzzleCells = full.slice();
  for (const i of order) {
    if (removable <= 0) break;
    const keep = puzzleCells[i];
    puzzleCells[i] = BLOCK;
    if (solve({ n, cells: puzzleCells }, 2).count === 1) removable--;
    else puzzleCells[i] = keep;
  }
  return { n, cells: puzzleCells, solution: lamps };
}

// Iš anksto patikrintos užduotys (vienas sprendinys), jei generatorius per ribą nieko nesukurtų.
export const STORED = [
  ['#..1', '.3..', '....', '#...'],
  ['.1..', '2...', '....', '..2.'],
  ['#...', '2...', '....', '#.1.'],
  ['0...', '....', '.3..', '2...'],
  ['....', '.2##', '....', '..3.'],
  ['.....', '....0', '..3..', '.2.#.', '0...#'],
  ['...#.', '1...#', '....1', '2...#', '.....'],
  ['.....', '1....', '..0.1', '.00..', '....#'],
  ['...1.', '.....', '....0', '0..2#', '.....'],
  ['..##.', '.4.1.', '.....', '..2..', '#....'],
  ['......', '.....0', '..2...', '.3#...', '...02.', '.#.#..'],
  ['..02..', '....3.', '......', '.1....', '.2..##', '..#..#'],
  ['..0#..', '...1..', '......', '#1...#', '..2..#', '..0...'],
  ['2.#...', '...2..', '.#....', '#..0..', '.4....', '#.....'],
  ['...2..', '..1#.0', '...#..', '......', '1...1.', '...1.#'],
];

// Sukuria užduotį su vieninteliu sprendiniu. Visada baigiasi: po `maxMs` ar bandymų ribos imama saugota užduotis.
export function generate(n, rnd = Math.random, { maxMs = 400, maxTries = 300 } = {}) {
  const t0 = Date.now();
  for (let k = 0; k < maxTries && Date.now() - t0 < maxMs; k++) {
    const p = generateOnce(n, rnd);
    if (p) return p;
  }
  return fromStored(n, rnd);
}

export function fromStored(n, rnd = Math.random) {
  const list = STORED.filter((rows) => rows.length === n);
  const pool = list.length ? list : STORED;
  const rows = pool[Math.floor(rnd() * pool.length)];
  const puzzle = parsePuzzle(rows);
  const { solution } = solve(puzzle, 1);
  return { n: puzzle.n, cells: puzzle.cells, solution };
}

// ---------- užuomina ----------

const KAIMYNAI = { 1: 'vieną laisvą kaimyną', 2: 'du laisvus kaimynus', 3: 'tris laisvus kaimynus', 4: 'keturis laisvus kaimynus' };

// Viena žingsnis link sprendinio. Grąžina null, kai lemputės jau sutampa su sprendiniu.
// { action: 'remove' | 'add', index, focus (nebūtina), text }
export function hint(puzzle, lamps, solution) {
  const { n, cells } = puzzle;
  const wrong = [];
  const missing = [];
  cells.forEach((v, i) => {
    if (v !== WHITE) return;
    if (lamps[i] && !solution[i]) wrong.push(i);
    else if (!lamps[i] && solution[i]) missing.push(i);
  });

  if (wrong.length) {
    const bad = conflicts(puzzle, lamps);
    const over = overNumbers(puzzle, lamps);
    const nearOver = (i) => neighbours(n, i).find((j) => over.has(j));
    const index = wrong.find((i) => bad.has(i)) ?? wrong.find((i) => nearOver(i) !== undefined) ?? wrong[0];
    if (bad.has(index)) {
      return { action: 'remove', index, text: 'Ši lemputė šviečia kitą lemputę. Jai čia ne vieta.' };
    }
    const num = nearOver(index);
    if (num !== undefined) {
      return {
        action: 'remove', index, focus: num,
        text: cells[num] === 0
          ? 'Šalia skaičiaus 0 lempučių negali būti.'
          : `Šalia skaičiaus ${cells[num]} yra per daug lempučių.`,
      };
    }
    return { action: 'remove', index, text: 'Šios lemputės čia nereikia. Ją reikia nuimti.' };
  }
  if (!missing.length) return null;

  // Visos pastatytos lemputės teisingos, todėl galime rasti vietą, kuri išplaukia iš taisyklių.
  const lit = litCells(puzzle, lamps);
  const free = (j) => cells[j] === WHITE && !lamps[j] && !lit[j];
  for (const [i, v] of cells.entries()) {
    if (!isNumber(v)) continue;
    const nb = neighbours(n, i);
    const have = nb.filter((j) => cells[j] === WHITE && lamps[j]).length;
    const cand = nb.filter(free);
    const need = v - have;
    if (need > 0 && cand.length === need) {
      const index = cand.find((j) => solution[j]);
      if (index !== undefined) {
        return { action: 'add', index, focus: i, text: `Šis skaičius ${v} turi tik ${KAIMYNAI[cand.length]}. Čia turi stovėti lemputė.` };
      }
    }
  }
  for (const [i, v] of cells.entries()) {
    if (v !== WHITE || lit[i]) continue;
    const cand = viewOf(cells, n, i).filter(free);
    if (cand.length === 1 && solution[cand[0]]) {
      return {
        action: 'add', index: cand[0], focus: i,
        text: 'Šį tamsų langelį galima apšviesti tik vienu būdu. Čia turi stovėti lemputė.',
      };
    }
  }
  return { action: 'add', index: missing[0], text: 'Čia reikia lemputės.' };
}

// Lietuviška daugiskaita: 1 lemputė, 2-9 lemputės, 10+ lempučių.
export function lempuciu(count) {
  const last = count % 10;
  if (count % 100 >= 11 && count % 100 <= 19) return `${count} lempučių`;
  if (last === 1) return `${count} lemputė`;
  if (last === 0) return `${count} lempučių`;
  return `${count} lemputės`;
}
