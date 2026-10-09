// Bendras variantų pasirinkimo žaidimas: klausimas, keli atsakymai, švelnus atsiliepimas.
//
// Apvalo (round) forma:
//   build()    -> { el, reveal() }   klausimo elementas ir kaip jį užbaigti po teisingo atsakymo
//   options    -> [{ id, label, emoji? }]
//   correct    -> teisingo varianto id
//   explain    -> trumpas paaiškinimas po teisingo atsakymo (nebūtinas)

import { h, createFeedback, progressBar, finishView, makeLock, nextGood, nextTry } from '../ui.js';
import { shuffle } from './random.js';

export function runChoiceGame(root, ctx, { title, instruction, buildRounds, layout = 'words' }) {
  const lock = makeLock();
  let rounds = [];
  let index = 0;

  function start() {
    rounds = buildRounds();
    index = 0;
    showRound();
  }

  function showRound() {
    const round = rounds[index];
    const built = round.build();
    const feedback = createFeedback();
    let wrongCount = 0;
    let hintStage = 0;
    let solved = false;

    const buttons = shuffle(round.options).map((opt) => {
      const btn = h('button', { class: 'opt', type: 'button', 'data-id': String(opt.id) },
        opt.emoji ? h('span', { class: 'emoji', 'aria-hidden': 'true' }, opt.emoji) : null,
        h('span', {}, opt.label),
      );
      btn.addEventListener('click', () => choose(opt, btn));
      return btn;
    });
    const byId = (id) => buttons.find((b) => b.dataset.id === String(id));
    const correctBtn = () => byId(round.correct);

    const nextBtn = h('button', { class: 'btn big green', type: 'button', hidden: true }, '');
    nextBtn.addEventListener('click', () => {
      if (lock.locked) return;
      lock.lock();
      index += 1;
      if (index >= rounds.length) finish();
      else showRound();
    });
    const hintBtn = h('button', { class: 'btn light', type: 'button' }, '💡 Užuomina');

    function highlightCorrect() {
      correctBtn().classList.add('hint');
    }

    function choose(opt, btn) {
      if (solved || btn.disabled || lock.locked) return;
      if (String(opt.id) === String(round.correct)) {
        solved = true;
        buttons.forEach((b) => {
          b.classList.remove('hint');
          if (b !== btn) b.disabled = true;
        });
        btn.classList.add('correct');
        btn.append(h('span', { 'aria-hidden': 'true' }, '✓'));
        built.reveal?.();
        feedback.show('good', nextGood(), round.explain);
        hintBtn.hidden = true;
        const last = index === rounds.length - 1;
        nextBtn.textContent = last ? 'Baigti ✓' : 'Toliau →';
        nextBtn.hidden = false;
        nextBtn.focus({ preventScroll: true });
      } else {
        wrongCount += 1;
        btn.disabled = true;
        btn.classList.add('tried');
        if (wrongCount >= 2) {
          highlightCorrect();
          feedback.show('try', 'Nieko tokio!', 'Pažiūrėkite į pažymėtą variantą.');
        } else {
          feedback.show('try', nextTry());
        }
      }
    }

    hintBtn.addEventListener('click', () => {
      if (solved || lock.locked) return;
      const wrongLeft = buttons.filter((b) => !b.disabled && b !== correctBtn());
      if (hintStage === 0 && wrongLeft.length > 1) {
        const victim = shuffle(wrongLeft)[0];
        victim.disabled = true;
        victim.classList.add('tried');
        hintStage = 1;
        feedback.show('hint', 'Užuomina:', 'Pašalinome vieną netinkamą variantą.');
      } else {
        hintStage = 2;
        highlightCorrect();
        feedback.show('hint', 'Užuomina:', 'tinka pažymėtas variantas.');
      }
    });

    root.replaceChildren(
      h('section', { class: 'game' },
        h('h1', { class: 'game-title' }, title),
        progressBar(index, rounds.length),
        h('p', { class: 'instruction' }, instruction),
        h('div', { class: 'prompt' }, built.el),
        h('div', { class: 'options ' + (round.layout || layout), role: 'group', 'aria-label': 'Atsakymų variantai' }, buttons),
        feedback.el,
        h('div', { class: 'actions' }, hintBtn, h('span', { class: 'spacer' }), nextBtn),
      ),
    );
    window.scrollTo(0, 0);
  }

  function finish() {
    ctx.complete();
    root.replaceChildren(finishView({
      text: 'Visos užduotys atliktos. Gerai padirbėta!',
      onAgain: () => { lock.lock(); start(); },
      onExit: ctx.exit,
    }));
    window.scrollTo(0, 0);
  }

  start();
}
