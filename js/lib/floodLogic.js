// Spalvų užliejimas: loginė dalis be sąsajos.
// Lenta: masyvas iš n*n skaičių (0..k-1), kiekvienas skaičius yra spalva.
// Užliejama sritis: viršutinis kairysis langelis ir visi su juo sujungti tos pačios spalvos langeliai.

export const SPALVOS = [
  { name: 'oranžinė', symbol: '●', color: '#e69f00' },
  { name: 'mėlyna', symbol: '▲', color: '#56b4e9' },
  { name: 'žalia', symbol: '■', color: '#2fbf8f' },
  { name: 'rožinė', symbol: '◆', color: '#e08fc0' },
];

function neighbourIdx(n, idx) {
  const r = Math.floor(idx / n);
  const c = idx % n;
  const out = [];
  if (r > 0) out.push(idx - n);
  if (r < n - 1) out.push(idx + n);
  if (c > 0) out.push(idx - 1);
  if (c < n - 1) out.push(idx + 1);
  return out;
}

// Užlietos srities langelių numeriai.
export function floodedRegion(board, n) {
  const color = board[0];
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const cur = stack.pop();
    for (const j of neighbourIdx(n, cur)) {
      if (!seen.has(j) && board[j] === color) {
        seen.add(j);
        stack.push(j);
      }
    }
  }
  return seen;
}

export const isWon = (board) => board.every((c) => c === board[0]);

// Vienas žingsnis: užlieta sritis pakeičia spalvą. Gretimi tos spalvos langeliai prisijungia
// patys, nes sritis visada skaičiuojama iš naujo. Pradinė lenta nekeičiama.
export function floodStep(board, n, color) {
  const next = board.slice();
  if (color === board[0]) return next;
  for (const idx of floodedRegion(board, n)) next[idx] = color;
  return next;
}

// Spalvos, kurios prijungtų bent vieną naują langelį.
function usefulColors(board, n, k) {
  const region = floodedRegion(board, n);
  const found = new Set();
  for (const idx of region) {
    for (const j of neighbourIdx(n, idx)) {
      if (!region.has(j)) found.add(board[j]);
    }
  }
  return [...found].filter((c) => c < k);
}

// Užuomina: godus pasirinkimas su žvilgsniu per vieną žingsnį į priekį.
// Niekada nesiūlo spalvos, kurią sritis jau turi. Laimėjus grąžina null.
export function hintColor(board, n, k) {
  if (isWon(board)) return null;
  let best = null;
  let bestScore = -1;
  for (const c of usefulColors(board, n, k)) {
    const after = floodStep(board, n, c);
    const first = floodedRegion(after, n).size;
    let second = first;
    if (!isWon(after)) {
      for (const c2 of usefulColors(after, n, k)) {
        second = Math.max(second, floodedRegion(floodStep(after, n, c2), n).size);
      }
    } else {
      second = n * n + 1;
    }
    const score = second * 1000 + first;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

// Sukuria atsitiktinę lentą, kuri nėra vienos spalvos ir kurioje naudojamos visos k spalvų.
export function makeFlood(n, k, rnd = Math.random) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const board = Array.from({ length: n * n }, () => Math.floor(rnd() * k));
    if (isWon(board)) continue;
    if (new Set(board).size < Math.min(k, 2)) continue;
    return board;
  }
  throw new Error('nepavyko sukurti spalvų lentos');
}
