// Kiek valandų?: laiko formatavimas, rodyklių kampai, atsakymų variantai (be sąsajos).

import { shuffle } from './random.js';

export const LEVEL_MINUTES = {
  hours: [0],
  half: [30],
  quarter: [15, 45],
};

// „3:00“, „7:30“, „4:15“.
export function formatTime(h, m) {
  return `${h}:${String(m).padStart(2, '0')}`;
}

// 1 valanda, 2-9 valandos, 10 ir daugiau valandų.
export function hourWord(h) {
  if (h === 1) return 'valanda';
  if (h >= 2 && h <= 9) return 'valandos';
  return 'valandų';
}

// 15 minučių, 30 minučių, 45 minučių (visos baigiasi taip pat).
export function timeWords(h, m) {
  const base = `${h} ${hourWord(h)}`;
  return m === 0 ? base : `${base} ${m} minučių`;
}

export const nextHour = (h) => (h % 12) + 1;

// Kampai laipsniais nuo 12 val. pagal laikrodžio rodyklę.
export function handAngles(h, m) {
  return { hour: (h % 12) * 30 + m * 0.5, minute: m * 6 };
}

// Paaiškinimas po atsakymo.
export function explainTime(h, m) {
  const minuteNumber = m / 5 === 0 ? 12 : m / 5;
  const hourPart = m === 0
    ? `Trumpoji rodyklė rodo ${h}`
    : `Trumpoji rodyklė yra tarp ${h} ir ${nextHour(h)}`;
  return `${hourPart}, ilgoji rodo ${minuteNumber}, vadinasi, yra ${timeWords(h, m)}.`;
}

// Minutės nuo 12:00 (12 valandų ratu), atstumui tarp laikų.
const total = (t) => (t.h % 12) * 60 + t.m;
export function distance(a, b) {
  const d = Math.abs(total(a) - total(b));
  return Math.min(d, 720 - d);
}

export function levelTimes(level) {
  const list = [];
  for (let h = 1; h <= 12; h++) for (const m of LEVEL_MINUTES[level]) list.push({ h, m });
  return list;
}

// Keturi skirtingi variantai su teisingu: klaidingi yra panašūs laikai (kad reikėtų žiūrėti į rodykles).
export function makeOptions(correct, level, rnd = Math.random) {
  const key = (t) => formatTime(t.h, t.m);
  let pool = levelTimes(level);
  // Sunkesniuose lygiuose klaidinantys variantai gali būti ir iš lengvesnio lygio.
  if (level === 'half') pool = pool.concat(levelTimes('hours'));
  if (level === 'quarter') pool = pool.concat(levelTimes('half'));
  const seen = new Set([key(correct)]);
  const others = pool
    .filter((t) => {
      if (seen.has(key(t))) return false;
      seen.add(key(t));
      return true;
    })
    .sort((a, b) => distance(a, correct) - distance(b, correct));
  const near = shuffle(others.slice(0, 6), rnd);
  const wrong = near.slice(0, 3);
  return shuffle([correct, ...wrong], rnd).map((t) => ({ h: t.h, m: t.m, id: key(t), label: key(t) }));
}

// Iš eilės: n užduočių kiekvienam lygiui, laikai nesikartoja.
export function pickTimes(level, n, rnd = Math.random) {
  const pool = shuffle(levelTimes(level), rnd);
  return pool.slice(0, n);
}
