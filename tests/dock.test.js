// Apatinė valdymo juosta: kiekvienas žaidimas turi turėti .dock, o perpiešiamos sritys nepaliečia pačios juostos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const OWN_DOCK = ['sudoku', 'crossword', 'lights', 'flood', 'tiles', 'pipes', 'blackwhite'];
const CHOICE = ['completeWord', 'pictureWord', 'sequence', 'oddOneOut', 'equations', 'sentence'];

test('dock: žaidimai su savo lenta turi .dock su atsiliepimu ir veiksmais', () => {
  for (const name of OWN_DOCK) {
    const src = readFileSync(`js/games/${name}.js`, 'utf8');
    const m = src.match(/class: 'dock' \},([\s\S]*?)\n {8}\),\n {6}\),/);
    assert.ok(m, `${name}: nerasta .dock`);
    assert.match(m[1], /feedback\.el/, `${name}: .dock be atsiliepimo`);
    assert.match(m[1], /class: 'actions'/, `${name}: .dock be veiksmų`);
  }
});

test('dock: pasirinkimo žaidimai naudoja bendrą choiceGame su .dock ir .options viduje', () => {
  const lib = readFileSync('js/lib/choiceGame.js', 'utf8');
  const m = lib.match(/class: 'dock' \},([\s\S]*?)\n {8}\),\n {6}\),/);
  assert.ok(m, 'choiceGame: nerasta .dock');
  assert.match(m[1], /'options '/);
  assert.match(m[1], /feedback\.el/);
  assert.match(m[1], /class: 'actions'/);
  for (const name of CHOICE) {
    assert.match(readFileSync(`js/games/${name}.js`, 'utf8'), /runChoiceGame/, `${name} nenaudoja choiceGame`);
  }
});

test('dock: Sudoku ir kryžiažodis perpiešia tik savo skydelį, ne juostą', () => {
  const sd = readFileSync('js/games/sudoku.js', 'utf8');
  assert.match(sd, /choices\.replaceChildren\(/);
  assert.doesNotMatch(sd, /area\.replaceChildren\([^)]*numbers/);
  const cw = readFileSync('js/games/crossword.js', 'utf8');
  assert.match(cw, /panel\.replaceChildren\(\.\.\.panelKids\.filter\(Boolean\)\)/);
});
