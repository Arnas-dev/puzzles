import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePuzzle, puzzleRows, solve, isSolved, conflicts, litCells, hint, generate, fromStored, STORED,
  overNumbers, doneNumbers, unlitCount, lempuciu, WHITE,
} from '../js/lib/lightUpLogic.js';

// Paprasta nuspėjama atsitiktinių skaičių seka.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test('litCells: lemputė šviečia iki juodo langelio', () => {
  const p = parsePuzzle(['..#.', '....', '....', '....']);
  const lamps = new Array(16).fill(0);
  lamps[0] = 1;
  const lit = litCells(p, lamps);
  assert.deepEqual([0, 1, 4, 8, 12].map((i) => lit[i]), [true, true, true, true, true]);
  assert.equal(lit[3], false);
  assert.equal(lit[5], false);
});

test('conflicts: lemputės mato viena kitą, bet juodas langelis užstoja', () => {
  const p = parsePuzzle(['.#..', '....', '....', '....']);
  const a = new Array(16).fill(0);
  a[0] = 1; a[2] = 1; // skiria juodas langelis
  assert.equal(conflicts(p, a).size, 0);
  a[12] = 1; // tame pačiame stulpelyje kaip 0
  assert.deepEqual([...conflicts(p, a)].sort((x, y) => x - y), [0, 12]);
});

test('isSolved ir skaičiai', () => {
  const p = parsePuzzle(['1...', '....', '....', '....']);
  const { solution, count } = solve(p, 5);
  assert.ok(count >= 1);
  assert.ok(isSolved(p, solution));
  const none = new Array(16).fill(0);
  assert.equal(isSolved(p, none), false);
  assert.equal(unlitCount(p, none), 15);
});

test('overNumbers ir doneNumbers', () => {
  const p = parsePuzzle(['.1..', '....', '....', '....']);
  const l = new Array(16).fill(0);
  l[0] = 1;
  assert.deepEqual([...doneNumbers(p, l)], [1]);
  l[2] = 1;
  assert.deepEqual([...overNumbers(p, l)], [1]);
});

test('solve skaičiuoja kelis sprendinius ir neturi sprendinio', () => {
  assert.equal(solve(parsePuzzle(['..', '..']), 10).count, 2);
  // skaičius 3, bet kaimynų tik du: sprendinio nėra
  assert.equal(solve(parsePuzzle(['3.', '..']), 10).count, 0);
});

test('lempuciu: daugiskaita', () => {
  assert.equal(lempuciu(1), '1 lemputė');
  assert.equal(lempuciu(2), '2 lemputės');
  assert.equal(lempuciu(9), '9 lemputės');
  assert.equal(lempuciu(10), '10 lempučių');
  assert.equal(lempuciu(12), '12 lempučių');
});

test('saugotos užduotys: bent 10, kiekviena turi vieną sprendinį', () => {
  assert.ok(STORED.length >= 10);
  for (const rows of STORED) {
    const p = parsePuzzle(rows);
    assert.deepEqual(puzzleRows(p), rows);
    const r = solve(p, 2);
    assert.equal(r.count, 1, rows.join('/'));
    assert.ok(isSolved(p, r.solution));
  }
  for (const n of [4, 5, 6]) {
    const f = fromStored(n, seeded(n));
    assert.equal(f.n, n);
    assert.ok(isSolved(f, f.solution));
  }
});

test('generavimas: 200 užduočių kiekvieno dydžio, vienas sprendinys, atitinka lemputes', () => {
  for (const n of [4, 5, 6]) {
    const rnd = seeded(n * 1000 + 7);
    for (let k = 0; k < 200; k++) {
      const p = generate(n, rnd);
      assert.equal(p.cells.length, n * n);
      assert.ok(p.cells.some((v) => v !== WHITE), 'turi būti juodų langelių');
      const r = solve(p, 2);
      assert.equal(r.count, 1, `${n}x${n} #${k}: ${puzzleRows(p).join('/')}`);
      assert.deepEqual(r.solution, p.solution);
      assert.ok(isSolved(p, p.solution));
    }
  }
});

test('generate visada baigiasi: be laiko pavaizduojama saugota užduotis', () => {
  const p = generate(5, seeded(3), { maxMs: 0, maxTries: 0 });
  assert.equal(p.n, 5);
  assert.ok(isSolved(p, p.solution));
  const q = generate(6, seeded(4), { maxMs: 400 });
  assert.ok(isSolved(q, q.solution));
});

test('užuomina visada priartina prie sprendinio', () => {
  for (const n of [4, 5, 6]) {
    const rnd = seeded(n * 31);
    for (let k = 0; k < 60; k++) {
      const p = generate(n, rnd);
      const sol = p.solution;
      const whites = p.cells.map((v, i) => (v === WHITE ? i : -1)).filter((i) => i >= 0);
      // atsitiktinė būsena: kai kurios teisingos lemputės, kartais klaidingų
      const lamps = new Array(n * n).fill(0);
      for (const i of whites) {
        if (sol[i] && rnd() < 0.5) lamps[i] = 1;
        else if (!sol[i] && rnd() < 0.15) lamps[i] = 1;
      }
      const dist = (a) => a.reduce((s, v, i) => s + (v !== sol[i] ? 1 : 0), 0);
      let guard = 0;
      while (dist(lamps) > 0) {
        const before = dist(lamps);
        const h = hint(p, lamps, sol);
        assert.ok(h, 'užuomina turi būti, kol yra skirtumų');
        assert.ok(h.text && h.text.length > 0);
        assert.equal(p.cells[h.index], WHITE);
        if (h.action === 'add') {
          assert.equal(lamps[h.index], 0);
          assert.equal(sol[h.index], 1);
          lamps[h.index] = 1;
        } else {
          assert.equal(lamps[h.index], 1);
          assert.equal(sol[h.index], 0);
          lamps[h.index] = 0;
        }
        assert.equal(dist(lamps), before - 1);
        assert.ok(++guard < 100);
      }
      assert.ok(isSolved(p, lamps));
      assert.equal(hint(p, lamps, sol), null);
    }
  }
});
