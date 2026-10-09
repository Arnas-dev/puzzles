import { GAMES } from './games/index.js';
import { h, watchDocks } from './ui.js';
import { load, save } from './lib/store.js';
import { initCursor } from './cursor.js';

const app = document.getElementById('app');
const topbar = document.getElementById('topbar');

const SCALES = [1, 1.2, 1.4];
let scaleIdx = Math.min(Math.max(load('scale', 0), 0), SCALES.length - 1);
let cleanup = null;
let routeToken = 0;
const cursor = initCursor();

// Bandymų gaidelė: ?scale=0|1|2 taikoma šiam puslapiui ir nesaugoma.
const forced = new URLSearchParams(location.search).get('scale');
const forcedIdx = forced !== null && /^[0-2]$/.test(forced) ? Number(forced) : null;
if (forcedIdx !== null) scaleIdx = forcedIdx;

function applyScale() {
  document.documentElement.style.setProperty('--scale', String(SCALES[scaleIdx]));
  if (forcedIdx === null) save('scale', scaleIdx);
}

function doneSet() {
  return new Set(load('done', []));
}

function markDone(id) {
  const set = doneSet();
  set.add(id);
  save('done', [...set]);
}

function renderTopbar(inGame) {
  // Matomas tekstas „A−“ įeina į prieinamą pavadinimą (balso valdymui); žodžius mato tik ekrano skaitytuvas.
  const smaller = h('button', { class: 'btn light', type: 'button' }, 'A−', h('span', { class: 'sr-only' }, ' Mažinti raides'));
  const bigger = h('button', { class: 'btn light', type: 'button' }, 'A+', h('span', { class: 'sr-only' }, ' Didinti raides'));
  smaller.disabled = scaleIdx === 0;
  bigger.disabled = scaleIdx === SCALES.length - 1;
  const refresh = () => {
    smaller.disabled = scaleIdx === 0;
    bigger.disabled = scaleIdx === SCALES.length - 1;
  };
  smaller.addEventListener('click', () => { scaleIdx = Math.max(0, scaleIdx - 1); applyScale(); refresh(); });
  bigger.addEventListener('click', () => { scaleIdx = Math.min(SCALES.length - 1, scaleIdx + 1); applyScale(); refresh(); });

  const haloBtn = h('button', { class: 'btn light halo-toggle', type: 'button', 'aria-pressed': String(cursor.isOn()) }, '🔆 Žymeklis');
  haloBtn.addEventListener('click', () => haloBtn.setAttribute('aria-pressed', String(cursor.toggle())));

  topbar.replaceChildren(
    inGame
      ? h('a', { class: 'btn big light', href: '#/' }, '← Į sąrašą')
      : h('span', { class: 'site-title' }, '🧩 Galvosūkiai'),
    h('div', { class: 'tools' },
      h('span', { class: 'tools-label' }, 'Raidės:'),
      smaller,
      bigger,
      haloBtn,
    ),
  );
}

function renderHome() {
  document.title = 'Galvosūkiai';
  const done = doneSet();
  app.replaceChildren(
    h('h1', {}, 'Pasirinkite užduotį'),
    h('p', { class: 'lead' }, 'Spustelėkite pele bet kurią užduotį. Skubėti nereikia.'),
    h('ul', { class: 'game-list' }, GAMES.map((g) =>
      h('li', {},
        h('a', { class: 'game-card', href: `#/${g.id}` },
          h('span', { class: 'icon', 'aria-hidden': 'true' }, g.icon),
          h('span', {}, h('span', { class: 'name' }, g.title), h('span', { class: 'desc' }, g.desc)),
          done.has(g.id) ? h('span', { class: 'done-badge' }, '✓ Atlikta') : null,
        ),
      ),
    )),
  );
}

async function route() {
  const token = ++routeToken;
  if (cleanup) {
    try { cleanup(); } catch (e) { console.error(e); }
    cleanup = null;
  }
  const id = location.hash.replace(/^#\/?/, '');
  const game = GAMES.find((g) => g.id === id);
  renderTopbar(!!game);
  if (!game) {
    renderHome();
    window.scrollTo(0, 0);
    return;
  }
  document.title = `${game.title} · Galvosūkiai`;
  app.replaceChildren();
  try {
    const mod = await game.load();
    if (token !== routeToken) return;
    const result = mod.mount(app, {
      exit: () => { location.hash = '#/'; },
      complete: () => markDone(game.id),
      game,
    });
    cleanup = typeof result === 'function' ? result : null;
  } catch (e) {
    console.error(e);
    app.replaceChildren(
      h('p', { class: 'lead' }, 'Nepavyko įkelti užduoties. Grįžkite į sąrašą ir bandykite dar kartą.'),
      h('a', { class: 'btn big', href: '#/' }, '← Į sąrašą'),
    );
  }
}

applyScale();
watchDocks(app);
window.addEventListener('hashchange', route);
route();
