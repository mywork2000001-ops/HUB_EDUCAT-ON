/**
 * Textbook Engine — 5-Pillar Learning System v2.0
 * Pillars: Theory | Practice | Simulation | Exam (30 MCQ) | Challenge (15q, 10s, 3 lives)
 */

const TextbookEngine = (() => {

  /* ── i18n strings ─────────────────────────────────────────── */
  const LANG = {
    az: { correct:'✓ Düzgün!', wrong:'✗ Səhv', hint:'💡 İpucu', next:'Növbəti →',
          prev:'← Əvvəlki', check:'Yoxla', restart:'🔄 Yenidən', score:'Nəticə',
          lives:'Canlı', gameover:'Oyun bitdi!', win:'Bravo! 🎉', timeup:'⏰ Vaxt bitdi!',
          theory:'📘 Nəzəriyyə', practice:'✍️ Tapşırıqlar', simulation:'🧪 Trenajer',
          exam:'📝 Testlər', challenge:'🏆 Viktorina',
          examScore:'sual doğrudur', of:'/', finish:'Bitir',
          startChallenge:'Oyunu Başlat', q:'Sual' },
    ru: { correct:'✓ Правильно!', wrong:'✗ Неверно', hint:'💡 Подсказка', next:'Вперёд →',
          prev:'← Назад', check:'Проверить', restart:'🔄 Заново', score:'Результат',
          lives:'Жизни', gameover:'Игра окончена!', win:'Браво! 🎉', timeup:'⏰ Время вышло!',
          theory:'📘 Теория', practice:'✍️ Задачи', simulation:'🧪 Тренажёр',
          exam:'📝 Тесты', challenge:'🏆 Викторина',
          examScore:'вопросов правильно', of:'/', finish:'Завершить',
          startChallenge:'Начать игру', q:'Вопрос' },
    en: { correct:'✓ Correct!', wrong:'✗ Wrong', hint:'💡 Hint', next:'Next →',
          prev:'← Prev', check:'Check', restart:'🔄 Restart', score:'Score',
          lives:'Lives', gameover:'Game Over!', win:'Bravo! 🎉', timeup:'⏰ Time Up!',
          theory:'📘 Theory', practice:'✍️ Practice', simulation:'🧪 Simulator',
          exam:'📝 Exam', challenge:'🏆 Challenge',
          examScore:'correct', of:'/', finish:'Finish',
          startChallenge:'Start Game', q:'Question' },
  };

  let lang = 'az';
  const t = k => (LANG[lang] || LANG.az)[k] || k;

  /* ── Tab navigation ─────────────────────────────────────── */
  function initTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    const panels = document.querySelectorAll('[data-panel]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.toggle('tab-active', t.dataset.tab === target));
        panels.forEach(p => p.classList.toggle('hidden', p.dataset.panel !== target));
      });
    });
    if (tabs.length) tabs[0].click();
  }

  /* ── Language switcher ───────────────────────────────────── */
  function initLang() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        lang = btn.dataset.langBtn;
        document.querySelectorAll('[data-lang-btn]').forEach(b =>
          b.classList.toggle('lang-active', b.dataset.langBtn === lang));
        applyLang();
      });
    });
  }

  function applyLang() {
    document.querySelectorAll('[data-az],[data-ru],[data-en]').forEach(el => {
      const val = el.dataset[lang] || el.dataset.az;
      if (val !== undefined) el.textContent = val;
    });
    updateExamLang();
    updateChallengeLang();
  }

  /* ── Practice: real-time input feedback ─────────────────── */
  function initPractice() {
    document.querySelectorAll('.practice-item').forEach(item => {
      const input = item.querySelector('.practice-input');
      const fb    = item.querySelector('.practice-feedback');
      const ans   = item.dataset.answer;
      if (!input || !ans) return;
      input.addEventListener('input', () => {
        const v = input.value.trim();
        if (!v) { fb.textContent = ''; fb.className = 'practice-feedback'; return; }
        const ok = v === ans;
        fb.textContent = ok ? t('correct') : t('wrong');
        fb.className = 'practice-feedback ' + (ok ? 'correct' : 'wrong');
      });
    });
  }

  /* ── Simulation: dispatch to unit-level init ─────────────── */
  function initSimulation() {
    if (typeof window.initSim === 'function') window.initSim();
  }

  /* ══════════════════════════════════════════════════════════
     EXAM — 30 MCQ engine
  ══════════════════════════════════════════════════════════ */
  let examState = { score: 0, answered: new Set() };

  function initExam() {
    examState = { score: 0, answered: new Set() };
    renderExam();
  }

  function renderExam() {
    const qs = window.EXAM_QS || [];
    const container = document.getElementById('examContainer');
    if (!container || !qs.length) return;

    container.innerHTML = qs.map((q, i) => {
      const qText  = q[lang] || q.az;
      const opts   = q['opts_' + lang] || q.opts_az || q.opts || [];
      return `
      <div class="exam-q" data-idx="${i}" data-ans="${q.ans}">
        <p class="exam-qtext"><span class="exam-qnum">Q${i+1}</span> ${qText}</p>
        <div class="exam-opts">
          ${opts.map((o, j) => `<button class="exam-opt" data-val="${j}" onclick="TextbookEngine.examClick(this,${i},${j})">${o}</button>`).join('')}
        </div>
        <div class="exam-hint hidden" data-hint-idx="${i}">${q.hint ? (q.hint[lang] || q.hint.az || '') : ''}</div>
      </div>`;
    }).join('');

    const scoreEl = document.getElementById('examScore');
    if (scoreEl) scoreEl.textContent = `0 ${t('of')} ${qs.length}`;
  }

  function examClick(btn, idx, val) {
    if (examState.answered.has(idx)) return;
    examState.answered.add(idx);
    const qs = window.EXAM_QS || [];
    const q = qs[idx];
    const correct = (val === q.ans);
    if (correct) examState.score++;

    const qEl = document.querySelector(`.exam-q[data-idx="${idx}"]`);
    qEl.querySelectorAll('.exam-opt').forEach(b => {
      b.disabled = true;
      if (+b.dataset.val === q.ans) b.classList.add('exam-correct');
      else if (+b.dataset.val === val && !correct) b.classList.add('exam-wrong');
    });

    const hintEl = qEl.querySelector('.exam-hint');
    if (hintEl) hintEl.classList.remove('hidden');

    const scoreEl = document.getElementById('examScore');
    if (scoreEl) scoreEl.textContent = `${examState.score} ${t('of')} ${qs.length}`;
  }

  function updateExamLang() {
    const qs = window.EXAM_QS || [];
    document.querySelectorAll('.exam-q').forEach((qEl, i) => {
      const q = qs[i];
      if (!q) return;
      const qText = qEl.querySelector('.exam-qtext');
      if (qText) qText.innerHTML = `<span class="exam-qnum">Q${i+1}</span> ${q[lang] || q.az}`;
      const opts = q['opts_' + lang] || q.opts_az || q.opts || [];
      qEl.querySelectorAll('.exam-opt').forEach((b, j) => { b.textContent = opts[j] || b.textContent; });
      const hintEl = qEl.querySelector('.exam-hint');
      if (hintEl && q.hint) hintEl.textContent = q.hint[lang] || q.hint.az || '';
    });
  }

  /* ══════════════════════════════════════════════════════════
     CHALLENGE — 15 questions, 10s timer, 3 Life Hearts
  ══════════════════════════════════════════════════════════ */
  const CHALLENGE_TIME = 10;
  const MAX_LIVES = 3;
  let CH = { qi: 0, lives: MAX_LIVES, score: 0, timer: null, started: false, qs: [] };

  function initChallenge() {
    CH.qs = shuffle([...(window.CHALLENGE_QS || [])]).slice(0, 15);
    CH.qi = 0; CH.lives = MAX_LIVES; CH.score = 0; CH.started = false;
    if (CH.timer) clearInterval(CH.timer);
    renderChallengeStart();
  }

  function renderChallengeStart() {
    const el = document.getElementById('challengeArea');
    if (!el) return;
    el.innerHTML = `
      <div class="ch-start">
        <div class="ch-icon">🏆</div>
        <h3 class="ch-title">${t('challenge')}</h3>
        <p class="ch-desc">15 sual · 10 saniyə · ❤️❤️❤️ 3 canlı</p>
        <button class="ch-btn-start" onclick="TextbookEngine.chStart()">${t('startChallenge')}</button>
      </div>`;
  }

  function chStart() {
    CH.qi = 0; CH.lives = MAX_LIVES; CH.score = 0; CH.started = true;
    renderChallengeQ();
  }

  function renderChallengeQ() {
    const el = document.getElementById('challengeArea');
    if (!el) return;
    if (CH.qi >= CH.qs.length) { chWin(); return; }
    const q = CH.qs[CH.qi];
    const qText = q[lang] || q.az;
    const opts  = q['opts_' + lang] || q.opts_az || q.opts || [];
    const hearts = '❤️'.repeat(CH.lives) + '🖤'.repeat(MAX_LIVES - CH.lives);

    el.innerHTML = `
      <div class="ch-hud">
        <span class="ch-lives">${hearts}</span>
        <span class="ch-progress">${t('q')} ${CH.qi + 1} / ${CH.qs.length}</span>
        <span class="ch-score">⭐ ${CH.score}</span>
      </div>
      <div class="ch-timer-bar"><div class="ch-timer-fill" id="chTimerFill"></div></div>
      <div class="ch-timer-num" id="chTimerNum">${CHALLENGE_TIME}</div>
      <div class="ch-qtext">${qText}</div>
      <div class="ch-opts">
        ${opts.map((o, j) => `<button class="ch-opt" onclick="TextbookEngine.chAnswer(${j})">${o}</button>`).join('')}
      </div>`;

    startChallengeTimer();
  }

  function startChallengeTimer() {
    if (CH.timer) clearInterval(CH.timer);
    let left = CHALLENGE_TIME;
    const fill = () => {
      const f = document.getElementById('chTimerFill');
      const n = document.getElementById('chTimerNum');
      if (f) f.style.width = (left / CHALLENGE_TIME * 100) + '%';
      if (n) n.textContent = left;
    };
    fill();
    CH.timer = setInterval(() => {
      left--;
      fill();
      if (left <= 0) {
        clearInterval(CH.timer);
        chWrong(true);
      }
    }, 1000);
  }

  function chAnswer(val) {
    if (CH.timer) clearInterval(CH.timer);
    const q = CH.qs[CH.qi];
    if (val === q.ans) { CH.score++; chCorrect(); }
    else               { chWrong(false); }
  }

  function chCorrect() {
    flashFeedback('correct', t('correct'));
    CH.qi++;
    setTimeout(() => renderChallengeQ(), 900);
  }

  function chWrong(timeup) {
    CH.lives--;
    flashFeedback('wrong', timeup ? t('timeup') : t('wrong'));
    if (CH.lives <= 0) { setTimeout(() => chGameOver(), 900); return; }
    CH.qi++;
    setTimeout(() => renderChallengeQ(), 900);
  }

  function flashFeedback(type, msg) {
    const el = document.getElementById('challengeArea');
    if (!el) return;
    const fb = document.createElement('div');
    fb.className = 'ch-flash ch-flash-' + type;
    fb.textContent = msg;
    el.appendChild(fb);
    setTimeout(() => fb.remove(), 850);
  }

  function chGameOver() {
    const el = document.getElementById('challengeArea');
    if (!el) return;
    el.innerHTML = `
      <div class="ch-result ch-result-over">
        <div class="ch-result-icon">💔</div>
        <h3>${t('gameover')}</h3>
        <p class="ch-result-score">⭐ ${CH.score} / ${CH.qs.length}</p>
        <button class="ch-btn-start" onclick="TextbookEngine.chStart()">${t('restart')}</button>
      </div>`;
  }

  function chWin() {
    const el = document.getElementById('challengeArea');
    if (!el) return;
    el.innerHTML = `
      <div class="ch-result ch-result-win">
        <div class="ch-result-icon">🏆</div>
        <h3>${t('win')}</h3>
        <p class="ch-result-score">⭐ ${CH.score} / ${CH.qs.length}</p>
        <button class="ch-btn-start" onclick="TextbookEngine.chStart()">${t('restart')}</button>
      </div>`;
  }

  function updateChallengeLang() { /* re-render current question if in progress */ }

  /* ── Utility ─────────────────────────────────────────────── */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ── Public init ─────────────────────────────────────────── */
  function init() {
    initTabs();
    initLang();
    initPractice();
    initSimulation();
    initExam();
    initChallenge();
    /* dark mode toggle */
    const dm = document.getElementById('darkToggle');
    if (dm) dm.addEventListener('click', () => document.documentElement.classList.toggle('dark'));
  }

  return { init, examClick, chStart, chAnswer, examClick };
})();

document.addEventListener('DOMContentLoaded', TextbookEngine.init);
