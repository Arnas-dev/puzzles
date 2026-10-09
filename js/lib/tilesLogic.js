// Plytelės (slenkamos plytelės): loginė dalis be sąsajos.
// Lenta: masyvas iš rows*cols skaičių; 0 yra tuščia vieta. Išspręsta: 1, 2, 3, ..., 0.

export function solvedBoard(rows, cols) {
  const b = Array.from({ length: rows * cols }, (_, i) => i + 1);
  b[rows * cols - 1] = 0;
  return b;
}

export function isSolved(board) {
  for (let i = 0; i < board.length - 1; i++) if (board[i] !== i + 1) return false;
  return board[board.length - 1] === 0;
}

// Plytelių vietos, kurias galima pastumti (šalia tuščios vietos).
export function movableTiles(board, rows, cols) {
  const e = board.indexOf(0);
  const r = Math.floor(e / cols);
  const c = e % cols;
  const out = [];
  if (r > 0) out.push(e - cols);
  if (r < rows - 1) out.push(e + cols);
  if (c > 0) out.push(e - 1);
  if (c < cols - 1) out.push(e + 1);
  return out;
}

export const canMove = (board, rows, cols, idx) => movableTiles(board, rows, cols).includes(idx);

// Pastumia plytelę į tuščią vietą. Jei negalima, grąžina null. Pradinė lenta nekeičiama.
export function moveTile(board, rows, cols, idx) {
  if (!canMove(board, rows, cols, idx)) return null;
  const next = board.slice();
  const e = board.indexOf(0);
  next[e] = next[idx];
  next[idx] = 0;
  return next;
}

// Lenta sudaroma iš išspręstos atliekant atsitiktinius teisėtus žingsnius (todėl visada išsprendžiama),
// niekada iš karto negrąžinant ankstesnio žingsnio. Niekada nebūna jau išspręsta.
export function makeTiles(rows, cols, moves, rnd = Math.random) {
  for (let attempt = 0; attempt < 200; attempt++) {
    let board = solvedBoard(rows, cols);
    let prevEmpty = -1;
    for (let m = 0; m < moves; m++) {
      const e = board.indexOf(0);
      const options = movableTiles(board, rows, cols).filter((i) => i !== prevEmpty);
      const idx = options[Math.floor(rnd() * options.length)];
      board = moveTile(board, rows, cols, idx);
      prevEmpty = e;
    }
    if (!isSolved(board)) return board;
  }
  throw new Error('nepavyko sukurti plytelių lentos');
}

// Platus paieškos būdas: trumpiausias kelias iki išspręstos lentos.
// Grąžina plytelių vietų sąrašą (paspaudimų seką) arba null, jei jau išspręsta.
export function solvePath(board, rows, cols) {
  if (isSolved(board)) return null;
  const startKey = board.join(',');
  const parent = new Map([[startKey, null]]); // raktas -> { prev, idx }
  let frontier = [board];
  while (frontier.length) {
    const nextFrontier = [];
    for (const cur of frontier) {
      const curKey = cur.join(',');
      for (const idx of movableTiles(cur, rows, cols)) {
        const nb = moveTile(cur, rows, cols, idx);
        const key = nb.join(',');
        if (parent.has(key)) continue;
        // idx yra spaudžiamos plytelės vieta lentoje `cur`.
        parent.set(key, { prev: curKey, idx });
        if (isSolved(nb)) {
          const path = [];
          let k = key;
          while (parent.get(k)) {
            const p = parent.get(k);
            path.push(p.idx);
            k = p.prev;
          }
          return path.reverse();
        }
        nextFrontier.push(nb);
      }
    }
    frontier = nextFrontier;
  }
  return null;
}

// Užuomina: pirmojo trumpiausio sprendimo žingsnio plytelės vieta (arba null).
export function hintTile(board, rows, cols) {
  const path = solvePath(board, rows, cols);
  return path ? path[0] : null;
}
