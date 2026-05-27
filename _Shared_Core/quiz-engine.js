/* ============================================================
   EDU-PLATFORM — Shared Quiz Engine
   _Shared_Core/quiz-engine.js | v1.0 | 2026-05-28
   Requires: window.LESSON_CONFIG and window.QS to be defined
   before this script is loaded.
   ============================================================ */
'use strict';

(function () {
  /* ── Config defaults ── */
  const CFG = Object.assign({
    id: 0,
    title: { az: 'Test', ru: 'Тест', en: 'Test' },
    subtitle: { az: 'Riyaziyyat · V sinif', ru: 'Математика · V класс', en: 'Mathematics · Grade 5' },
    timer: 2700,
    icon: '📙',
    accent: '#4f46e5',
    variants: null,   // null = auto-detect from QS
  }, window.LESSON_CONFIG || {});

  const QS = window.QS || [];

  /* apply accent colour */
  document.documentElement.style.setProperty('--accent', CFG.accent);

  /* detect variants */
  const VARS = CFG.variants || [...new Set(QS.map(q => q.v))].sort();

  /* ── i18n ── */
  const T = {
    az: { done:'Tamamlandı', timer:'Vaxt', variant:'Variant', progress:'İrəliləyiş',
          restart:'🔄 Yenidən başla', close:'Bağla', correct:'Doğru', wrong:'Səhv',
          blank:'Boş', time:'Vaxt', hint:'💡 İpucu', timeUp:'⏰ Vaxt bitdi!',
          badge_choice:'Test', badge_open:'Açıq', question:'SUAL', score:'doğru',
          variantLabel:'Variant' },
    ru: { done:'Выполнено', timer:'Время', variant:'Вариант', progress:'Прогресс',
          restart:'🔄 Начать снова', close:'Закрыть', correct:'Правильно', wrong:'Неверно',
          blank:'Пропущено', time:'Время', hint:'💡 Подсказка', timeUp:'⏰ Время вышло!',
          badge_choice:'Тест', badge_open:'Открытый', question:'ВОПРОС', score:'правильно',
          variantLabel:'Вариант' },
    en: { done:'Done', timer:'Time', variant:'Variant', progress:'Progress',
          restart:'🔄 Restart', close:'Close', correct:'Correct', wrong:'Wrong',
          blank:'Blank', time:'Time', hint:'💡 Hint', timeUp:'⏰ Time is up!',
          badge_choice:'Test', badge_open:'Open', question:'QUESTION', score:'correct',
          variantLabel:'Variant' },
  };

  /* ── State ── */
  let S = { v: VARS[0] || 'A', dark: false, timerLeft: CFG.timer, tid: null,
            ans: {}, hint: {}, lang: 'az', activeQ: null };

  /* ── DOM scaffold ── */
  function buildDOM() {
    const accent = CFG.accent;
    document.body.innerHTML = `
<div class="hdr">
  <div style="display:flex;align-items:center;gap:10px;min-width:0">
    <div class="logo" id="LOGO">${CFG.icon} DİM V</div>
    <div class="vtabs" id="VT"></div>
  </div>
  <div class="hdr-r">
    <div class="tmr-wrap"><span>⏱</span><span id="TMR">${fmtTime(CFG.timer)}</span></div>
    <button class="bicn" id="LANGBTN" onclick="toggleLang()">RU</button>
    <button class="bicn" id="DB" onclick="toggleDark()">${sunSVG()}</button>
    <button class="bfin" onclick="showRes()">✓</button>
  </div>
</div>
<div class="layout">
  <div class="sidebar">
    <div class="scard"><div class="sicn b">${checkSVG()}</div>
      <div><div class="slbl" id="SLBL_DONE">Tamamlandı</div><div class="sval" id="PRG">0/${VARS.length > 0 ? getQs().length : '?'}</div></div></div>
    <div class="scard"><div class="sicn g">${clockSVG()}</div>
      <div><div class="slbl" id="SLBL_TIME">Vaxt</div><div class="sval" id="TMR2">${fmtTime(CFG.timer)}</div></div></div>
    <div class="scard"><div class="sicn y">${starSVG()}</div>
      <div><div class="slbl" id="SLBL_VAR">Variant</div><div class="sval" id="VAR">${S.v}</div></div></div>
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <div class="slbl" id="SLBL_PRG">İrəliləyiş</div>
        <div style="font-size:.72rem;font-weight:800;color:var(--accent)" id="PCT">0%</div>
      </div>
      <div class="pbar"><div class="pfil" id="PFI" style="width:0%"></div></div>
    </div>
    <div><div class="qlabel">Suallar</div><div class="qnav" id="QN"></div></div>
  </div>
  <div class="main">
    <div class="banner" id="BANNER" style="background:linear-gradient(135deg,${accent}cc,${accent})">
      <div class="banner-icon">${CFG.icon}</div>
      <div>
        <div class="banner-title" id="BT">${CFG.title[S.lang] || CFG.title.az}</div>
        <div class="banner-sub" id="BS">${CFG.subtitle[S.lang] || CFG.subtitle.az}</div>
      </div>
    </div>
    <div class="qcard" id="QAREA"></div>
  </div>
</div>
<div class="mob-nav" id="MOB_NAV"></div>
<div class="mover" id="MO">
  <div class="modal">
    <div class="mhdr" style="background:linear-gradient(135deg,${accent}cc,${accent})">
      <div class="mscore" id="RSC">-</div><div class="msub" id="RSB"></div>
    </div>
    <div class="mbody">
      <div class="rgrid">
        <div class="rbox ok"><div class="rbox-num" id="RCO">-</div><div class="rbox-lbl" id="RLBL_CO">Doğru</div></div>
        <div class="rbox wr"><div class="rbox-num" id="RWR">-</div><div class="rbox-lbl" id="RLBL_WR">Səhv</div></div>
        <div class="rbox bl"><div class="rbox-num" id="RBL">-</div><div class="rbox-lbl" id="RLBL_BL">Boş</div></div>
        <div class="rbox tm"><div class="rbox-num" id="RTM">-</div><div class="rbox-lbl" id="RLBL_TM">Vaxt</div></div>
      </div>
      <div class="mbtns">
        <button class="mbtn p" id="RBTN_RESTART" onclick="restart()">🔄 Yenidən başla</button>
        <button class="mbtn s" id="RBTN_CLOSE" onclick="document.getElementById('MO').classList.remove('show')">Bağla</button>
      </div>
    </div>
  </div>
</div>`;
  }

  /* ── SVG helpers ── */
  function sunSVG() {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`;
  }
  function moonSVG() {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
  }
  function checkSVG() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`;
  }
  function clockSVG() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  }
  function starSVG() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
  function fmtTime(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  /* ── Core logic ── */
  function getQs() { return QS.filter(q => q.v === S.v); }

  function buildTabs() {
    const L = T[S.lang];
    const el = document.getElementById('VT'); if (!el) return;
    el.innerHTML = '';
    VARS.forEach(v => {
      const b = document.createElement('button');
      b.className = 'vtab' + (S.v === v ? ' active' : '');
      b.textContent = L.variantLabel + ' ' + v;
      b.onclick = () => { S.v = v; S.ans = {}; S.hint = {}; S.activeQ = null; buildTabs(); renderSidebar(); showQ(0); };
      el.appendChild(b);
    });
    const bt = document.getElementById('BT');
    const bs = document.getElementById('BS');
    if (bt) bt.textContent = CFG.title[S.lang] || CFG.title.az;
    if (bs) bs.textContent = CFG.subtitle[S.lang] || CFG.subtitle.az;
  }

  function renderSidebar() {
    const qs = getQs(), L = T[S.lang];
    const done = qs.filter(q => S.ans[q.id] !== undefined).length;
    document.getElementById('PRG').textContent = done + '/' + qs.length;
    const pct = qs.length ? Math.round((done / qs.length) * 100) : 0;
    document.getElementById('PCT').textContent = pct + '%';
    document.getElementById('PFI').style.width = pct + '%';
    document.getElementById('SLBL_DONE').textContent = L.done;
    document.getElementById('SLBL_TIME').textContent = L.timer;
    document.getElementById('SLBL_VAR').textContent = L.variant;
    document.getElementById('SLBL_PRG').textContent = L.progress;
    document.getElementById('VAR').textContent = S.v;
    const nav = document.getElementById('QN'); nav.innerHTML = '';
    qs.forEach((q, i) => {
      const b = document.createElement('button');
      b.className = 'qnb' + (S.ans[q.id] !== undefined ? ' done' : '') + (S.activeQ === i ? ' active' : '');
      b.textContent = i + 1;
      b.onclick = () => showQ(i);
      nav.appendChild(b);
    });
  }

  function showQ(idx) {
    const qs = getQs(), L = T[S.lang];
    if (idx < 0 || idx >= qs.length) return;
    S.activeQ = idx;
    const q = qs[idx];
    document.querySelectorAll('.qnb').forEach((b, i) => b.classList.toggle('active', i === idx));
    const area = document.getElementById('QAREA');
    const qtext = q[S.lang] || q.en || q.az;
    const shapeKey = (window.QSHAPE || {})[q.id];
    const shapeHTML = shapeKey && (window.SHAPES || {})[shapeKey]
      ? `<div class="qshape">${window.SHAPES[shapeKey]}</div>` : '';

    let h = `<div class="qhdr">
  <span class="qnum">${L.question} ${idx + 1}</span>
  <span class="qtbadge">${L.badge_choice}</span>
  <div style="margin-left:auto;display:flex;gap:6px">
    ${idx > 0 ? `<button class="qnav-btn" onclick="showQ(${idx - 1})">←</button>` : ''}
    ${idx < qs.length - 1 ? `<button class="qnav-btn" onclick="showQ(${idx + 1})">→</button>` : ''}
  </div>
</div>
<div class="qtxt">${qtext}</div>${shapeHTML}`;

    const opts = q['opts_' + S.lang] || q.opts_en || q.opts || [];
    h += `<div class="ogrid">`;
    opts.forEach((o, oi) => {
      h += `<button class="obtn${S.ans[q.id] === oi ? ' sel' : ''}" onclick="pick('${q.id}',${oi},this)">${o}</button>`;
    });
    h += `</div>`;

    if (q.hint) {
      const ht = q.hint[S.lang] || q.hint.ru || q.hint.az;
      const hv = S.hint[q.id];
      h += `<button class="hbtn" onclick="tHint('${q.id}')">${L.hint}</button>
<div class="hint${hv ? ' show' : ''}" id="HH${q.id}">💡 ${ht}</div>`;
    }
    h += `<div class="qprog"><span>${idx + 1} / ${qs.length}</span>
  <div class="qpbar"><div class="qpfil" style="width:${Math.round(((idx + 1) / qs.length) * 100)}%"></div></div>
</div>`;
    area.innerHTML = h;
    area.style.animation = 'none'; area.offsetHeight; area.style.animation = 'cardIn .25s ease both';
  }

  window.pick = function (id, oi, btn) {
    S.ans[id] = oi;
    btn.closest('.ogrid').querySelectorAll('.obtn').forEach((b, i) => { b.className = 'obtn' + (i === oi ? ' sel' : ''); });
    renderSidebar();
    setTimeout(() => { const qs = getQs(); const idx = qs.findIndex(q => q.id === id); if (idx < qs.length - 1) showQ(idx + 1); }, 400);
  };

  window.tHint = function (id) {
    S.hint[id] = !S.hint[id];
    const el = document.getElementById('HH' + id); if (el) el.className = 'hint' + (S.hint[id] ? ' show' : '');
  };

  window.toggleDark = function () {
    S.dark = !S.dark;
    document.documentElement.classList.toggle('dark', S.dark);
    document.getElementById('DB').innerHTML = S.dark ? moonSVG() : sunSVG();
  };

  window.toggleLang = function () {
    const _lg = ['az', 'ru', 'en']; S.lang = _lg[(_lg.indexOf(S.lang) + 1) % 3];
    document.getElementById('LANGBTN').textContent = { az: 'RU', ru: 'EN', en: 'AZ' }[S.lang];
    buildTabs(); renderSidebar(); if (S.activeQ !== null) showQ(S.activeQ);
  };

  window.showRes = function () {
    const qs = getQs(), L = T[S.lang];
    let ok = 0, wr = 0, bl = 0;
    qs.forEach(q => { const a = S.ans[q.id]; if (a === undefined) { bl++; return; } a === q.ans ? ok++ : wr++; });
    const total = qs.length, pct = Math.round((ok / total) * 100);
    const elapsed = CFG.timer - S.timerLeft, em = Math.floor(elapsed / 60), es = elapsed % 60;
    document.getElementById('RSC').textContent = pct + '%';
    document.getElementById('RSB').textContent = ok + '/' + total + ' ' + L.score + ' — ' + L.variantLabel + ' ' + S.v;
    document.getElementById('RCO').textContent = ok;
    document.getElementById('RWR').textContent = wr;
    document.getElementById('RBL').textContent = bl;
    document.getElementById('RTM').textContent = em + ':' + String(es).padStart(2, '0');
    document.getElementById('RBTN_RESTART').textContent = L.restart;
    document.getElementById('RBTN_CLOSE').textContent = L.close;
    document.getElementById('RLBL_CO').textContent = L.correct;
    document.getElementById('RLBL_WR').textContent = L.wrong;
    document.getElementById('RLBL_BL').textContent = L.blank;
    document.getElementById('RLBL_TM').textContent = L.time;
    document.getElementById('MO').classList.add('show');
  };

  window.restart = function () {
    S.ans = {}; S.hint = {}; S.timerLeft = CFG.timer; S.activeQ = null;
    clearInterval(S.tid); S.tid = setInterval(tick, 1000);
    document.getElementById('TMR').style.color = '';
    document.getElementById('MO').classList.remove('show');
    renderSidebar(); showQ(0);
  };

  window.showQ = showQ;

  function tick() {
    if (S.timerLeft <= 0) { clearInterval(S.tid); document.getElementById('TMR').textContent = '00:00'; document.getElementById('TMR').style.color = 'var(--danger)'; showRes(); return; }
    S.timerLeft--;
    const txt = fmtTime(S.timerLeft);
    document.getElementById('TMR').textContent = txt;
    const t2 = document.getElementById('TMR2'); if (t2) t2.textContent = txt;
    if (S.timerLeft <= 300) document.getElementById('TMR').style.color = 'var(--danger)';
    else if (S.timerLeft <= 600) document.getElementById('TMR').style.color = 'var(--warning)';
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    buildDOM();
    buildTabs();
    renderSidebar();
    showQ(0);
    S.tid = setInterval(tick, 1000);
  });

  /* ── Progress bridge ── */
  setTimeout(() => {
    function sendProgress() {
      if (!window.parent) return;
      const qs = getQs(), total = qs.length; if (!total) return;
      let ok = 0; qs.forEach(q => { if (S.ans[q.id] === q.ans) ok++; });
      window.parent.postMessage({ type: 'lessonProgress', lessonId: CFG.id, answersCount: Object.keys(S.ans).length, totalQuestions: total, correctCount: ok, completed: false, answers: S.ans }, '*');
    }
    const _pick = window.pick;
    window.pick = function () { const r = _pick.apply(this, arguments); setTimeout(sendProgress, 50); return r; };
    setInterval(sendProgress, 3000);
    window.addEventListener('message', e => { if (e.data && e.data.type === 'forceFinish') showRes(); });
    setTimeout(sendProgress, 500);
  }, 0);
})();
