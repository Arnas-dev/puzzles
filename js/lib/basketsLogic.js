// Išdėliokite į grupes: etapų sudarymas ir paaiškinimas (be sąsajos).

import { shuffle, sample } from './random.js';

// Pirmi trys etapai: 2 grupės po 3 žodžius. Kiti trys: 3 grupės po 2 žodžius.
export const STAGES = [
  { groups: 2, perGroup: 3 },
  { groups: 2, perGroup: 3 },
  { groups: 2, perGroup: 3 },
  { groups: 3, perGroup: 2 },
  { groups: 3, perGroup: 2 },
  { groups: 3, perGroup: 2 },
];

function allowed(names, avoidPairs) {
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (avoidPairs.some(([x, y]) => (x === names[i] && y === names[j]) || (x === names[j] && y === names[i]))) return false;
    }
  }
  return true;
}

// Paaiškinimas po teisingo atsakymo (be linksnių problemų: žodis kabutėse, grupė kabutėse).
export function explainSort(word, group) {
  return `„${word}“ tinka į grupę „${group}“.`;
}

// Vienas etapas: { groups: [vardas, ...], items: [{ word, group }, ...] } su sumaišytais žodžiais.
// Kitame etape stengiamės neimti tų pačių grupių kaip ankstesniame.
export function makeStage(spec, categories, avoidPairs, previous = [], rnd = Math.random) {
  let names = null;
  for (let attempt = 0; attempt < 60; attempt++) {
    const cand = sample(categories, spec.groups, rnd).map((c) => c.name);
    if (!allowed(cand, avoidPairs)) continue;
    names = cand;
    if (!previous.some((p) => cand.every((n) => p.includes(n)))) break;
  }
  const items = [];
  for (const name of names) {
    const cat = categories.find((c) => c.name === name);
    for (const word of sample(cat.words, spec.perGroup, rnd)) items.push({ word, group: name });
  }
  return { groups: names, items: shuffle(items, rnd) };
}

export function makeStages(categories, avoidPairs, rnd = Math.random) {
  const stages = [];
  for (const spec of STAGES) {
    stages.push(makeStage(spec, categories, avoidPairs, stages.map((s) => s.groups), rnd));
  }
  return stages;
}
