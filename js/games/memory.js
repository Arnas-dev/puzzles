// Atminties poros: atverskite dvi kortas. Paveikslėlis ir jo žodis sudaro porą.
// Neatitinkančios kortos lieka atvertos, kol žaidėjas pats paspaus „Uždengti“ (jokio laikmačio).

import { h, createFeedback, progressBar, finishView, makeLock, nextGood } from '../ui.js';
import { dealPairs, isMatch, hintPair, allMatched } from '../lib/memoryLogic.js';
import { WORDS } from '../data/words.js';

const LEVELS = [3, 4, 6];
const HINT_MS = 4000;

export function mount(root, ctx) {
  const lock = makeLock();
  let level = 0;
  let hintTimer = 0;

  function showLevel() {
    const cards = dealPairs(WORDS, LEVELS[level]);
    const matched = new Set();
    let open = []; // atvertos, dar nesurastos kortos (id)
    let waiting = false; // dvi neatitinkančios kortos laukia „Uždengti“
    let hintIds = [];

    const feedback = createFeedback();
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      level === LEVELS.length - 1 ? 'Baigti ✓' : 'Toliau →');
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');
    const coverBtn = h('button', { class: 'btn big', type: 'button', hidden: true }, 'Uždengti');
    const grid = h('div', { class: `mem-grid n${cards.length}`, role: 'group', 'aria-label': 'Kortos' });

    const byId = (id) => cards.find((c) => c.id === id);
    const btnOf = (id) => grid.querySelector(`[data-id="${id}"]`);

    function label(c, isUp) {
      if (!isUp) return 'Uždengta korta';
      return c.kind === 'pic' ? `Paveikslėlis: ${c.pair}` : `Žodis: ${c.text}`;
    }

    function paint(c) {
      const btn = btnOf(c.id);
      const isUp = open.includes(c.id) || matched.has(c.id);
      btn.className = 'mem-card ' + c.kind
        + (isUp ? ' up' : '')
        + (matched.has(c.id) ? ' matched' : '')
        + (waiting && open.includes(c.id) ? ' wrong' : '')
        + (hintIds.includes(c.id) ? ' hint' : '');
      btn.setAttribute('aria-label', label(c, isUp));
      btn.disabled = matched.has(c.id);
      btn.replaceChildren(h('span', { class: 'face', 'aria-hidden': 'true' }, isUp ? c.text : '?'));
    }

    function paintAll() {
      cards.forEach(paint);
    }

    function clearHint() {
      clearTimeout(hintTimer);
      if (!hintIds.length) return;
      const ids = hintIds;
      hintIds = [];
      ids.forEach((id) => paint(byId(id)));
    }

    function cover() {
      if (!waiting) return;
      const ids = open;
      open = [];
      waiting = false;
      coverBtn.hidden = true;
      ids.forEach((id) => paint(byId(id)));
      feedback.show('hint', 'Kortos uždengtos.', 'Pasirinkite kitą kortą.');
    }

    function flip(id) {
      if (lock.locked || matched.has(id) || open.includes(id)) return;
      clearHint();
      if (waiting) cover();
      const c = byId(id);
      open.push(id);
      if (open.length === 1) {
        feedback.show('hint',
          c.kind === 'pic' ? 'Tai paveikslėlis.' : `Tai žodis „${c.text}“.`,
          c.kind === 'pic' ? 'Raskite kortą su jo žodžiu.' : 'Raskite kortą su jo paveikslėliu.');
        paint(c);
        return;
      }
      const first = byId(open[0]);
      if (isMatch(first, c)) {
        open.forEach((x) => matched.add(x));
        open = [];
        paintAll();
        if (allMatched(cards, matched)) {
          feedback.show('good', nextGood(), 'Visos poros rastos.');
          hintBtn.hidden = true;
          nextBtn.hidden = false;
          nextBtn.focus({ preventScroll: true });
        } else {
          feedback.show('good', 'Čia pora!', `Paveikslėlis ir žodis „${c.pair}“ tinka.`);
        }
        return;
      }
      waiting = true;
      paintAll();
      coverBtn.hidden = false;
      feedback.show('try', 'Čia ne pora.', 'Įsiminkite, kur kas yra. Paskui spauskite „Uždengti“.');
    }

    cards.forEach((c) => {
      const btn = h('button', { type: 'button', 'data-id': c.id });
      btn.addEventListener('click', () => flip(c.id));
      grid.append(btn);
    });

    coverBtn.addEventListener('click', () => { if (!lock.locked) cover(); });

    hintBtn.addEventListener('click', () => {
      if (lock.locked || allMatched(cards, matched)) return;
      clearHint();
      if (waiting) cover();
      const pair = hintPair(cards, matched, open);
      if (!pair) return;
      hintIds = pair;
      pair.forEach((id) => paint(byId(id)));
      feedback.show('hint', 'Užuomina:', 'šios dvi kortos sudaro porą. Jos pažymėtos spalva.');
      hintTimer = setTimeout(clearHint, HINT_MS);
    });

    nextBtn.addEventListener('click', () => {
      if (lock.locked) return;
      lock.lock();
      level += 1;
      if (level >= LEVELS.length) finish();
      else showLevel();
    });

    root.replaceChildren(
      h('section', { class: 'game' },
        h('h1', { class: 'game-title' }, 'Atminties poros'),
        progressBar(level, LEVELS.length, 'Etapas'),
        h('p', { class: 'instruction' }, 'Atverskite dvi kortas. Raskite paveikslėlį ir jo žodį.'),
        h('div', { class: 'mem-area' }, grid),
        h('div', { class: 'dock' },
          feedback.el,
          h('div', { class: 'actions' }, hintBtn, coverBtn, h('span', { class: 'spacer' }), nextBtn),
        ),
      ),
    );
    paintAll();
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visos poros rastos. Puiki atmintis!',
      onAgain: () => { lock.lock(); level = 0; showLevel(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showLevel();

  return () => {
    clearTimeout(hintTimer);
  };
}
