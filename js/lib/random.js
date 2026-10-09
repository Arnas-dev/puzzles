// Maži atsitiktinumo pagalbininkai. Visi priima pasirinktinį `rnd`, kad testai būtų nuspėjami.

export function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick(arr, rnd = Math.random) {
  return arr[Math.floor(rnd() * arr.length)];
}

export function sample(arr, n, rnd = Math.random) {
  return shuffle(arr, rnd).slice(0, n);
}

export function randInt(min, max, rnd = Math.random) {
  return min + Math.floor(rnd() * (max - min + 1));
}
