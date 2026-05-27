/**
 * Textbook Engine — 4-Pillar Learning System
 * Pillars: Theory | Practice | Evaluation | Gamification
 */

const TextbookEngine = (() => {

  /* ── Tab navigation ─────────────────────────────────────── */
  function initTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    const panels = document.querySelectorAll('[data-panel]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
        panels.forEach(p => p.classList.toggle('hidden', p.dataset.panel !== target));
      });
    });
    if (tabs.length) tabs[0].click();
  }

  /* ── Practice: real-time input feedback ─────────────────── */
  function initPractice() {
    document.querySelectorAll('.practice-item').forEach(item => {
      const input = item.querySelector('.practice-input');
      const feedback = item.querySelector('.practice-feedback');
      const answer = item.dataset.answer;
      if (!input || !answer) return;

      input.addEventListener('input', () => {
        const val = input.value.trim();
        if (!val) { feedback.textContent = ''; feedback.className = 'practice-feedback'; return; }
        const correct = val === answer;
        feedback.textContent = correct ? '✓ Düzgün!' : '✗';
        feedback.className = 'practice-feedback ' + (correct ? 'correct' : 'wrong');
      });
    });
  }

  /* ── Evaluation: MCQ engine ─────────────────────────────── */
  function initEvaluation() {
    let score = 0, answered = 0;
    const questions = document.querySelectorAll('.eval-question');
    const total = questions.length;
    const scoreEl = document.getElementById('evalScore');

    questions.forEach(q => {
      const opts = q.querySelectorAll('.eval-opt');
      const correct = q.dataset.correct;
      opts.forEach(opt => {
        opt.addEventListener('click', () => {
          if (q.dataset.done) return;
          q.dataset.done = '1';
          answered++;
          const isCorrect = opt.dataset.val === correct;
          if (isCorrect) score++;
          opts.forEach(o => {
            o.classList.toggle('opt-correct', o.dataset.val === correct);
            o.classList.toggle('opt-wrong', o.dataset.val !== correct && o === opt);
          });
          if (scoreEl) scoreEl.textContent = `${score}/${answered} (${total} sual)`;
        });
      });
    });
  }

  /* ── Gamification: timed quiz ───────────────────────────── */
  function initGamification() {
    const container = document.getElementById('quizContainer');
    if (!container) return;
    const questions = JSON.parse(container.dataset.questions || '[]');
    if (!questions.length) return;

    let idx = 0, score = 0, timerInterval = null;
    const TIME_PER_Q = 15;

    const qText   = document.getElementById('quizQuestion');
    const opts    = document.querySelectorAll('.quiz-opt');
    const timerEl = document.getElementById('quizTimer');
    const scoreEl = document.getElementById('quizScore');
    const progEl  = document.getElementById('quizProgress');

    function load(i) {
      clearInterval(timerInterval);
      const q = questions[i];
      if (!q) { showResult(); return; }
      qText.textContent = q.q;
      opts.forEach((btn, j) => {
        btn.textContent = q.opts[j] || '';
        btn.className = 'quiz-opt';
        btn.onclick = () => pick(btn, q.ans, j);
      });
      if (progEl) progEl.style.width = ((i / questions.length) * 100) + '%';
      let t = TIME_PER_Q;
      if (timerEl) timerEl.textContent = t;
      timerInterval = setInterval(() => {
        t--;
        if (timerEl) timerEl.textContent = t;
        if (t <= 0) { clearInterval(timerInterval); next(); }
      }, 1000);
    }

    function pick(btn, ans, j) {
      clearInterval(timerInterval);
      const correct = j === ans;
      if (correct) score++;
      opts.forEach((b, i) => {
        b.classList.toggle('quiz-correct', i === ans);
        b.classList.toggle('quiz-wrong', i !== ans && b === btn);
        b.onclick = null;
      });
      if (scoreEl) scoreEl.textContent = score;
      setTimeout(() => next(), 1200);
    }

    function next() { idx++; load(idx); }

    function showResult() {
      container.innerHTML = `
        <div class="quiz-result">
          <div class="quiz-result-score">${score}/${questions.length}</div>
          <p>${score === questions.length ? '🏆 Möhtəşəm!' : score >= questions.length / 2 ? '👍 Yaxşı nəticə!' : '📚 Daha çox məşq edin!'}</p>
          <button onclick="location.reload()" class="quiz-retry">Yenidən oyna</button>
        </div>`;
    }

    load(0);
  }

  /* ── Public init ────────────────────────────────────────── */
  function init() {
    initTabs();
    initPractice();
    initEvaluation();
    initGamification();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', TextbookEngine.init);
