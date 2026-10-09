// Kryžiažodžio išdėstymo tikrinimas ir tinklelio sudarymas (naudoja ir žaidimas, ir testai).
// Žodis: { answer, row, col, dir: 'A' (iš kairės į dešinę) | 'D' (iš viršaus į apačią) }

const letters = (s) => Array.from(s);

export function buildGrid(words) {
  const cells = new Map(); // "r,c" -> raidė
  const errors = [];
  for (const wd of words) {
    letters(wd.answer).forEach((ch, k) => {
      const r = wd.row + (wd.dir === 'D' ? k : 0);
      const c = wd.col + (wd.dir === 'A' ? k : 0);
      const key = `${r},${c}`;
      if (cells.has(key) && cells.get(key) !== ch) {
        errors.push(`Neatitinka raidė langelyje ${key}: „${cells.get(key)}“ ir „${ch}“ (${wd.answer})`);
      }
      cells.set(key, ch);
    });
  }
  return { cells, errors };
}

export function validateLayout(words) {
  const { cells, errors } = buildGrid(words);
  const keys = [...cells.keys()].map((k) => k.split(',').map(Number));
  if (keys.length === 0) return { ok: false, errors: ['tuščia'], rows: 0, cols: 0 };
  const minR = Math.min(...keys.map((k) => k[0]));
  const minC = Math.min(...keys.map((k) => k[1]));
  const maxR = Math.max(...keys.map((k) => k[0]));
  const maxC = Math.max(...keys.map((k) => k[1]));
  if (minR < 0 || minC < 0) errors.push('išdėstymas išeina už ribų');

  // Kiekviena iš eilės einanti ≥2 raidžių grandinė turi būti lygiai vienas deklaruotas žodis.
  const declared = new Set(words.map((w) => `${w.dir}:${w.row},${w.col}:${w.answer}`));
  const has = (r, c) => cells.has(`${r},${c}`);
  const found = new Set();
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (!has(r, c)) continue;
      if (!has(r, c - 1) && has(r, c + 1)) {
        let s = '';
        let cc = c;
        while (has(r, cc)) { s += cells.get(`${r},${cc}`); cc++; }
        found.add(`A:${r},${c}:${s}`);
      }
      if (!has(r - 1, c) && has(r + 1, c)) {
        let s = '';
        let rr = r;
        while (has(rr, c)) { s += cells.get(`${rr},${c}`); rr++; }
        found.add(`D:${r},${c}:${s}`);
      }
    }
  }
  for (const d of declared) if (!found.has(d)) errors.push(`žodis neatitinka tinklelio: ${d}`);
  for (const f of found) if (!declared.has(f)) errors.push(`atsitiktinis žodis tinklelyje: ${f}`);

  // Ar visi langeliai sujungti?
  const start = keys[0].join(',');
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const [r, c] = queue.pop().split(',').map(Number);
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${r + dr},${c + dc}`;
      if (cells.has(key) && !seen.has(key)) { seen.add(key); queue.push(key); }
    }
  }
  if (seen.size !== cells.size) errors.push('išdėstymas nesujungtas');

  return { ok: errors.length === 0, errors, rows: maxR - minR + 1, cols: maxC - minC + 1, minR, minC };
}
