// Sudėkite sakinį: spauskite žodžius ta tvarka, kokia jie eina sakinyje. Jokio vilkimo, laikmačio ar taškų.
// Neteisingai sudėjus, teisingose vietose esantys žodžiai lieka žali, kiti grįžta į apatinę eilutę.

import { h, createFeedback, progressBar, finishView, makeLock, nextGood } from '../ui.js';
import { sample } from '../lib/random.js';
import { WORD_ORDER } from '../data/wordOrder.js';
import {
  makeTiles, textsOf, isCorrect, place, remove, undo, keepCorrect,
  nextHint, applyHint, shownWord, display,
} from '../lib/wordOrderLogic.js';

// Du sakiniai iš kiekvienos pakopos: 3, 4, 5 ar 6 žodžiai.
export function pickSentences(rnd = Math.random) {
  return [
    ...sample(WORD_ORDER.easy, 2, rnd),
    ...sample(WORD_ORDER.medium, 2, rnd),
    ...sample(WORD_ORDER.hard, 2, rnd),
  ];
}

export function mount(root, ctx) {
  const lock = makeLock();
  let sentences = pickSentences();
  let round = 0;

  function showRound() {
    const sentence = sentences[round];
    const tiles = makeTiles(sentence);
    const n = tiles.length;
    let slots = new Array(n).fill(null);
    let history = [];
    let locked = new Set(); // vietos, kuriose žodis jau teisingas
    let hint = null; // { index, id, text }
    let done = false;

    const feedback = createFeedback();
    const byId = (id) => tiles.find((t) => t.id === id);

    const answerRow = h('div', { class: 'wo-answer', role: 'group', 'aria-label': 'Sakinys' });
    const poolRow = h('div', { class: 'wo-pool', role: 'group', 'aria-label': 'Žodžiai' });
    const doneLine = h('p', { class: 'wo-done sentence', hidden: true });
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');
    const undoBtn = h('button', { class: 'btn light', type: 'button' }, '↩ Atšaukti');
    const checkBtn = h('button', { class: 'btn big green', type: 'button', hidden: true }, 'Patikrinti');
    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true },
      round === sentences.length - 1 ? 'Baigti ✓' : 'Toliau →');

    function paint() {
      const full = slots.every((id) => id != null);
      const answerKids = [];
      slots.forEach((id, i) => {
        if (id == null) {
          const isHintSlot = hint && hint.index === i;
          answerKids.push(h('span', { class: 'wo-slot empty' + (isHintSlot ? ' hint' : ''), 'aria-label': `Vieta ${i + 1}, tuščia` },
            h('span', { class: 'wo-num', 'aria-hidden': 'true' }, String(i + 1))));
        } else {
          const t = byId(id);
          const good = locked.has(i) || done;
          const btn = h('button', {
            type: 'button',
            class: 'wo-word placed' + (good ? ' good' : '') + (hint && hint.id === id ? ' hint' : ''),
            'data-id': String(id),
            'aria-label': `${shownWord(t.text, i)}, vieta ${i + 1}. ${done ? '' : 'Spauskite, kad grąžintumėte.'}`,
            disabled: done || locked.has(i),
          }, shownWord(t.text, i));
          btn.addEventListener('click', () => back(id));
          answerKids.push(btn);
        }
        if (i === n - 1) answerKids.push(h('span', { class: 'wo-dot', 'aria-hidden': 'true' }, '.'));
      });
      answerRow.replaceChildren(...answerKids);

      const poolKids = tiles.filter((t) => !slots.includes(t.id)).map((t) => {
        const btn = h('button', {
          type: 'button',
          class: 'wo-word' + (hint && hint.id === t.id ? ' hint' : ''),
          'data-id': String(t.id),
        }, t.text);
        btn.addEventListener('click', () => put(t.id));
        return btn;
      });
      poolRow.replaceChildren(...poolKids);
      poolRow.classList.toggle('empty', poolKids.length === 0);

      const canUndo = !done && history.some((id) => slots.includes(id) && !locked.has(slots.indexOf(id)));
      undoBtn.disabled = !canUndo;
      hintBtn.hidden = done;
      undoBtn.hidden = done;
      checkBtn.hidden = done || !full;
    }

    function clearHint() { hint = null; }

    function put(id) {
      if (lock.locked || done) return;
      const next = place(slots, id);
      if (!next) return;
      clearHint();
      slots = next;
      history.push(id);
      const full = slots.every((x) => x != null);
      if (full) feedback.show('hint', 'Visi žodžiai sudėti.', 'Spauskite „Patikrinti“ arba pakeiskite žodžius.');
      else feedback.clear();
      paint();
      if (full) checkBtn.focus({ preventScroll: true });
    }

    function back(id) {
      if (lock.locked || done) return;
      const next = remove(slots, id);
      if (!next) return;
      clearHint();
      slots = next;
      history = history.filter((x) => x !== id);
      feedback.clear();
      paint();
    }

    function doUndo() {
      if (lock.locked || done) return;
      const r = undo(slots, history, locked);
      if (!r) return;
      clearHint();
      slots = r.slots;
      history = r.history;
      feedback.clear();
      paint();
    }

    function doHint() {
      if (lock.locked || done) return;
      const next = nextHint(slots, tiles, sentence);
      if (!next) return;
      if (hint && hint.id === next.id && hint.index === next.index) {
        // Antras paspaudimas: žodis įdedamas į savo vietą.
        slots = applyHint(slots, next);
        history = history.filter((x) => x !== next.id);
        history.push(next.id);
        locked = new Set([...locked].filter((i) => slots[i] != null));
        clearHint();
        feedback.show('hint', `Įdėtas žodis „${shownWord(next.text, next.index)}“.`, 'Dabar rinkitės kitą žodį.');
        if (slots.every((x) => x != null)) {
          feedback.show('hint', 'Visi žodžiai sudėti.', 'Spauskite „Patikrinti“.');
        }
        paint();
        return;
      }
      hint = next;
      feedback.show('hint', `Kitas žodis: „${shownWord(next.text, next.index)}“.`,
        'Jis pažymėtas spalva. Spauskite „Užuomina“ dar kartą, ir jis bus įdėtas.');
      paint();
    }

    function check() {
      if (lock.locked || done) return;
      const texts = textsOf(slots, tiles);
      if (texts.some((t) => t == null)) return;
      clearHint();
      if (isCorrect(texts, sentence)) {
        done = true;
        feedback.show('good', nextGood(), 'Sakinys sudėtas teisingai.');
        doneLine.textContent = display(texts);
        doneLine.hidden = false;
        paint();
        nextBtn.hidden = false;
        nextBtn.focus({ preventScroll: true });
        return;
      }
      const r = keepCorrect(slots, tiles, sentence);
      slots = r.slots;
      locked = r.kept;
      history = history.filter((id) => slots.includes(id));
      feedback.show('try', 'Beveik! Žalios vietos teisingos.', 'Pabandykite kitus žodžius.');
      paint();
    }

    hintBtn.addEventListener('click', doHint);
    undoBtn.addEventListener('click', doUndo);
    checkBtn.addEventListener('click', check);
    nextBtn.addEventListener('click', () => {
      if (lock.locked) return;
      lock.lock();
      round += 1;
      if (round >= sentences.length) finish();
      else showRound();
    });

    root.replaceChildren(
      h('section', { class: 'game wo-game' },
        h('h1', { class: 'game-title' }, 'Sudėkite sakinį'),
        progressBar(round, sentences.length, 'Sakinys'),
        h('p', { class: 'instruction' }, 'Spauskite žodžius tokia tvarka, kaip jie eina sakinyje.'),
        h('div', { class: 'wo-area' },
          h('p', { class: 'wo-label' }, 'Sakinys'),
          answerRow,
          doneLine,
          h('p', { class: 'wo-label' }, 'Žodžiai'),
          poolRow,
        ),
        h('div', { class: 'dock' },
          feedback.el,
          h('div', { class: 'actions' }, hintBtn, undoBtn, h('span', { class: 'spacer' }), checkBtn, nextBtn),
        ),
      ),
    );
    paint();
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visi sakiniai sudėti. Puikiai sekasi!',
      onAgain: () => { lock.lock(); sentences = pickSentences(); round = 0; showRound(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  showRound();
}
