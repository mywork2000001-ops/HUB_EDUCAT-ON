/* =====================================================================
   DİM 2025 – Shared exam engine
   Each lesson page must define (before loading this script):
     const examData   = { title:{az,ru,en}, subtitle:{az,ru,en}, timeLimit, variants:[...] }
     const STORAGE_KEY = "unique_key_per_lesson"
   ===================================================================== */

/* ── UI localization strings ── */
const ui = {
  az: {
    timer:      "Qalan vaxt",
    answered:   "Cavablanıb",
    progress:   "Ümumi progress",
    grid:       "Sual gridi",
    legend:     "Şərhlər",
    legEmpty:   "Cavabsız",
    legAnswered:"Cavablanıb",
    legCurrent: "Cari",
    prev:       "Əvvəlki",
    next:       "Növbəti",
    finish:     "İmtahanı bitir",
    single:     "Tək cavab",
    resTitle:   "İmtahan nəticəsi",
    resMsg:     "Düzgün cavablar: {c} / {t}. Dəqiqlik: {p}%",
    correct:    "Düzgün",
    wrong:      "Səhv",
    empty:      "Boş",
    review:     "Cavablara bax",
    restart:    "Yenidən başla",
    close:      "Bağla",
    confirmRestart: "Yenidən başlamaq? Bütün cavablar silinəcək.",
  },
  ru: {
    timer:      "Осталось времени",
    answered:   "Отвечено",
    progress:   "Общий прогресс",
    grid:       "Сетка вопросов",
    legend:     "Пояснения",
    legEmpty:   "Без ответа",
    legAnswered:"Отвечено",
    legCurrent: "Текущий",
    prev:       "Предыдущий",
    next:       "Следующий",
    finish:     "Завершить экзамен",
    single:     "Один ответ",
    resTitle:   "Результат экзамена",
    resMsg:     "Правильных ответов: {c} из {t}. Точность: {p}%",
    correct:    "Правильно",
    wrong:      "Неправильно",
    empty:      "Пусто",
    review:     "Посмотреть ответы",
    restart:    "Начать заново",
    close:      "Закрыть",
    confirmRestart: "Начать заново? Все ответы будут удалены.",
  },
  en: {
    timer:      "Time left",
    answered:   "Answered",
    progress:   "Overall progress",
    grid:       "Question grid",
    legend:     "Legend",
    legEmpty:   "Unanswered",
    legAnswered:"Answered",
    legCurrent: "Current",
    prev:       "Previous",
    next:       "Next",
    finish:     "Finish exam",
    single:     "Single answer",
    resTitle:   "Exam results",
    resMsg:     "Correct answers: {c} / {t}. Accuracy: {p}%",
    correct:    "Correct",
    wrong:      "Wrong",
    empty:      "Empty",
    review:     "Review answers",
    restart:    "Restart",
    close:      "Close",
    confirmRestart: "Restart? All answers will be deleted.",
  },
};

/* ── EduHub integration ── */
const EDUHUB_RESULTS_URL = (window.EDUHUB_URL || "") + "/api/results";

/* ── State ── */
let state = {
  variantIndex:  0,
  questionIndex: 0,
  answers:       {},
  timeLeft:      (typeof examData !== "undefined" ? examData.timeLimit : 60) * 60,
  finished:      false,
  review:        false,
  lang:          "az",
  studentName:   "",
  studentClass:  "",
  startedAt:     null,
};

let _slideDir = "right"; // "right" = forward, "left" = backward

/* ── Persistence ── */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.answers)        state.answers      = s.answers;
      if (s.timeLeft != null) state.timeLeft   = s.timeLeft;
      if (s.finished != null) state.finished   = s.finished;
      if (s.lang)           state.lang         = s.lang;
      if (s.startedAt)      state.startedAt    = s.startedAt;
    }
    // student identity persists across lessons
    state.studentName  = localStorage.getItem("dim_student_name")  || "";
    state.studentClass = localStorage.getItem("dim_student_class") || "";
  } catch (e) {}
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    answers:   state.answers,
    timeLeft:  state.timeLeft,
    finished:  state.finished,
    lang:      state.lang,
    startedAt: state.startedAt,
  }));
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  state.answers      = {};
  state.timeLeft     = examData.timeLimit * 60;
  state.finished     = false;
  state.review       = false;
}

/* ── Language ── */
function setLang(lang) {
  state.lang = lang;
  saveState();
  _syncLangBtns();
  renderAll();
}

function toggleLang() {
  const order = ["az", "ru", "en"];
  state.lang = order[(order.indexOf(state.lang) + 1) % 3];
  saveState();
  _syncLangBtns();
  renderAll();
}

function _syncLangBtns() {
  ["az", "ru", "en"].forEach(l => {
    const el = document.getElementById("lb" + l.toUpperCase());
    if (el) el.classList.toggle("active", l === state.lang);
  });
}

/* ── Theme ── */
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
}

/* ── Render ── */
function updateTexts() {
  const L = ui[state.lang];
  _syncLangBtns();

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setH = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  if (examData.title)    set("examTitle",    examData.title[state.lang]);
  if (examData.subtitle) set("examSubtitle", examData.subtitle[state.lang]);

  set("lblTimer",    L.timer);
  set("lblAnswered", L.answered);
  set("lblProgress", L.progress);
  set("lblGrid",     L.grid);
  set("lblLegend",   L.legend);
  set("legEmpty",    L.legEmpty);
  set("legAnswered", L.legAnswered);
  set("legCurrent",  L.legCurrent);
  set("btnPrev",     L.prev);
  set("btnNext",     L.next);
  set("btnFinish",   L.finish);
  set("qType",       L.single);
  set("resTitle",    L.resTitle);
  set("lblCorrect",  L.correct);
  set("lblWrong",    L.wrong);
  set("lblEmpty",    L.empty);
  set("btnReview",   L.review);
  set("btnRestart",  L.restart);
  set("btnClose",    L.close);
}

function renderVariantTabs() {
  const container = document.getElementById("variantTabs");
  if (!container) return;
  container.innerHTML = "";
  examData.variants.forEach((v, i) => {
    const btn = document.createElement("button");
    btn.className = "tab " + (i === state.variantIndex ? "active" : "");
    btn.textContent = v.name[state.lang];
    btn.onclick = () => { _slideDir = "right"; state.variantIndex = i; state.questionIndex = 0; renderAll(); };
    container.appendChild(btn);
  });
}

function renderQuestionGrid() {
  const container = document.getElementById("questionGrid");
  if (!container) return;
  container.innerHTML = "";
  const variant = examData.variants[state.variantIndex];
  variant.questions.forEach((q, i) => {
    const key = variant.id + "-" + q.id;
    const btn = document.createElement("button");
    btn.className = "q-btn";
    if (i === state.questionIndex) btn.classList.add("active");
    if (state.answers[key]) btn.classList.add("answered");
    btn.textContent = q.id;
    btn.onclick = () => { _slideDir = i > state.questionIndex ? "right" : "left"; state.questionIndex = i; renderAll(); };
    container.appendChild(btn);
  });
}

function renderQuestion() {
  window.scrollTo({ top: 0, behavior: "instant" });
  const variant = examData.variants[state.variantIndex];
  const q       = variant.questions[state.questionIndex];
  const key     = variant.id + "-" + q.id;
  const saved   = state.answers[key];
  const L       = state.lang;

  /* Slide animation */
  const content = document.getElementById("qContent");
  if (content) {
    content.classList.remove("slide-in-right", "slide-in-left", "fade-in");
    void content.offsetWidth; // force reflow
    content.classList.add(_slideDir === "right" ? "slide-in-right" : "slide-in-left");
  }

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set("qBadge",   variant.id + q.id);
  set("qCounter", (state.questionIndex + 1) + " / " + variant.questions.length);

  const qText = document.getElementById("qText");
  if (qText) qText.innerHTML = q.text[L];

  const imgDiv = document.getElementById("qImage");
  if (imgDiv) imgDiv.innerHTML = q.image || "";

  /* Matching area (optional) */
  const matchDiv = document.getElementById("qMatching");
  if (matchDiv) {
    if (q.matching) {
      matchDiv.classList.remove("hidden");
      matchDiv.innerHTML =
        "<div>" + q.matching.left.map(s => `<p>${s}</p>`).join("") + "</div>" +
        "<div>" + q.matching.right.map(s => `<p>${s}</p>`).join("") + "</div>";
    } else {
      matchDiv.classList.add("hidden");
      matchDiv.innerHTML = "";
    }
  }

  const optsDiv = document.getElementById("qOptions");
  if (!optsDiv) return;
  optsDiv.innerHTML = "";

  const opts = q.options[L];
  opts.forEach((opt, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const div    = document.createElement("div");
    div.className = "option";
    if (saved === letter) div.classList.add("selected");
    if (state.review) {
      if (letter === q.correct)       div.classList.add("correct");
      else if (saved === letter)      div.classList.add("wrong");
    }
    div.innerHTML =
      `<span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style="background:var(--primary-light);color:var(--primary)">${letter}</span>` +
      `<span class="text-sm">${opt}</span>`;
    if (!state.review) {
      div.onclick = () => { state.answers[key] = letter; saveState(); renderAll(); };
    }
    optsDiv.appendChild(div);
  });

  if (window.renderMathInElement) {
    const content = document.getElementById("qContent");
    if (content) {
      setTimeout(() => renderMathInElement(content, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$",  right: "$",  display: false },
        ],
        throwOnError: false,
      }), 10);
    }
  }
}

function updateProgress() {
  const total    = examData.variants.reduce((s, v) => s + v.questions.length, 0);
  const answered = Object.keys(state.answers).length;
  const pct      = Math.round((answered / total) * 100);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("answeredCount",   answered + "/" + total);
  set("progressPercent", pct + "%");
  const bar = document.getElementById("progressBar");
  if (bar) bar.style.width = pct + "%";
}

function renderAll() {
  renderVariantTabs();
  renderQuestionGrid();
  renderQuestion();
  updateProgress();
  updateTexts();
}

/* ── Navigation ── */
function prevQuestion() {
  if (state.questionIndex > 0) { _slideDir = "left"; state.questionIndex--; renderAll(); }
}

function nextQuestion() {
  const variant = examData.variants[state.variantIndex];
  if (state.questionIndex < variant.questions.length - 1) { _slideDir = "right"; state.questionIndex++; renderAll(); }
}

/* ── Timer ── */
let _timerInterval;

function startTimer() {
  clearInterval(_timerInterval);
  _timerInterval = setInterval(() => {
    if (state.finished) return;
    state.timeLeft--;
    saveState();
    updateTimerDisplay();
    if (state.timeLeft <= 0) finishExam();
  }, 1000);
}

function updateTimerDisplay() {
  const m  = Math.floor(state.timeLeft / 60).toString().padStart(2, "0");
  const s  = (state.timeLeft % 60).toString().padStart(2, "0");
  const el = document.getElementById("timer");
  if (!el) return;
  el.textContent = m + ":" + s;
  if (state.timeLeft < 300) el.classList.add("text-red-500");
  else                       el.classList.remove("text-red-500");
}

/* ── Exam lifecycle ── */
function finishExam() {
  state.finished = true;
  saveState();
  clearInterval(_timerInterval);
  showResults();
  sendToHub();
}

async function sendToHub() {
  try {
    const r = calculateResults();
    const percent = Math.round((r.correct / r.total) * 100);
    const name = state.studentName || localStorage.getItem("dim_student_name") || "Şagird";
    const body = {
      student_name:  name,
      student_class: state.studentClass || localStorage.getItem("dim_student_class") || "",
      platform:      "P001",
      lesson_id:     typeof STORAGE_KEY !== "undefined" ? STORAGE_KEY : "",
      lesson_title:  examData?.title?.[state.lang] || examData?.title?.az || "",
      score:         r.correct,
      total:         r.total,
      percent,
      answers:       state.answers,
      started_at:    state.startedAt,
      finished_at:   new Date().toISOString(),
    };
    await fetch(EDUHUB_RESULTS_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
  } catch {
    // fail silently — results page still works
  }
}

function calculateResults() {
  let correct = 0, wrong = 0, empty = 0;
  examData.variants.forEach(v => {
    v.questions.forEach(q => {
      const ans = state.answers[v.id + "-" + q.id];
      if (!ans)              empty++;
      else if (ans === q.correct) correct++;
      else                   wrong++;
    });
  });
  return { correct, wrong, empty, total: correct + wrong + empty };
}

function showResults() {
  const r = calculateResults();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("correctCount",    r.correct);
  set("wrongCount",      r.wrong);
  set("emptyCount",      r.empty);
  set("resultScoreIcon", r.correct);

  const L   = ui[state.lang];
  const msg = L.resMsg.replace("{c}", r.correct).replace("{t}", r.total)
                       .replace("{p}", Math.round((r.correct / r.total) * 100));
  set("resultMessage", msg);

  /* ── Build wrong-answers list ── */
  const wrongItems = [];
  examData.variants.forEach(v => {
    v.questions.forEach(q => {
      const ans = state.answers[v.id + "-" + q.id];
      if (ans && ans !== q.correct) {
        wrongItems.push({ vId: v.id, q, userAns: ans });
      }
    });
  });

  let wrongSect = document.getElementById("wrongAnswersList");
  if (!wrongSect) {
    wrongSect = document.createElement("div");
    wrongSect.id = "wrongAnswersList";
    wrongSect.style.marginTop = "0";
    const modal = document.getElementById("resultModal");
    const inner = modal && modal.querySelector(".card");
    if (inner) {
      const btnRow = inner.querySelector(".flex.gap-3.justify-center");
      if (btnRow) inner.insertBefore(wrongSect, btnRow);
      else inner.appendChild(wrongSect);
    }
  }

  if (wrongItems.length === 0) {
    wrongSect.innerHTML = "";
    wrongSect.style.display = "none";
  } else {
    const labels = { az: "Səhv cavablar", ru: "Неверные ответы", en: "Wrong answers" };
    wrongSect.style.display = "";
    wrongSect.innerHTML =
      `<div class="wrong-summary-title">✗ ${labels[state.lang] || labels.az}</div>` +
      wrongItems.map(item => {
        const rawText = item.q.text[state.lang] || item.q.text.az;
        const plain = rawText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const excerpt = plain.length > 55 ? plain.substring(0, 55) + "…" : plain;
        return `<div class="wrong-item">
          <span class="wrong-item-num">${item.vId}${item.q.id}</span>
          <span class="wrong-item-text" title="${plain}">${excerpt}</span>
          <span class="wrong-item-answers">
            <span class="wrong-item-user">${item.userAns}</span>
            <span class="wrong-item-arrow">→</span>
            <span class="wrong-item-correct">${item.q.correct}</span>
          </span>
        </div>`;
      }).join("");
  }

  const modal = document.getElementById("resultModal");
  if (modal) { modal.classList.remove("hidden"); modal.classList.add("flex"); }
}

function closeResults() {
  const modal = document.getElementById("resultModal");
  if (modal) { modal.classList.add("hidden"); modal.classList.remove("flex"); }
}

function showReview() {
  state.review = true;
  state.variantIndex  = 0;
  state.questionIndex = 0;
  closeResults();
  renderAll();
}

function resetExam() {
  if (!confirm(ui[state.lang].confirmRestart)) return;
  clearState();
  closeResults();
  renderAll();
  startTimer();
}

/* ── Keyboard shortcuts ── */
document.addEventListener("keydown", e => {
  if (state.finished && !state.review) return;
  if (e.key === "ArrowLeft")  { _slideDir = "left";  prevQuestion(); }
  if (e.key === "ArrowRight") { _slideDir = "right"; nextQuestion(); }
  if (e.key >= "1" && e.key <= "5") {
    const variant = examData.variants[state.variantIndex];
    const q       = variant.questions[state.questionIndex];
    const idx     = parseInt(e.key) - 1;
    if (idx < q.options[state.lang].length) {
      state.answers[variant.id + "-" + q.id] = String.fromCharCode(65 + idx);
      saveState();
      renderAll();
    }
  }
});

/* ── Number line helper ── */
function numberLine(min, max, step, points, labels) {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const w = 400, h = 80, pad = 30;
  const scale = (w - 2 * pad) / (max - min);
  let s = `<svg viewBox="0 0 ${w} ${h}" class="number-line" xmlns="${SVG_NS}">`;
  s += `<line x1="${pad}" y1="${h/2}" x2="${w-pad}" y2="${h/2}" stroke="currentColor" stroke-width="2"/>`;
  s += `<polygon points="${w-pad},${h/2} ${w-pad-8},${h/2-5} ${w-pad-8},${h/2+5}" fill="currentColor"/>`;
  for (let v = min; v <= max; v += step) {
    const x = pad + (v - min) * scale;
    s += `<line x1="${x}" y1="${h/2-6}" x2="${x}" y2="${h/2+6}" stroke="currentColor" stroke-width="2"/>`;
    s += `<text x="${x}" y="${h/2+22}" text-anchor="middle" font-size="12" fill="currentColor">${v}</text>`;
  }
  points.forEach((p, i) => {
    const x = pad + (p - min) * scale;
    s += `<circle cx="${x}" cy="${h/2}" r="5" fill="var(--primary)" stroke="white" stroke-width="2"/>`;
    s += `<text x="${x}" y="${h/2-12}" text-anchor="middle" font-size="13" font-weight="bold" fill="var(--primary)">${labels[i]}</text>`;
  });
  s += `</svg>`;
  return s;
}

/* ── Name modal ── */
function showNameModal(onConfirm) {
  const overlay = document.createElement("div");
  overlay.id = "nameModal";
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9999";
  const lang = state.lang;
  const labels = {
    az: { title:"Adınızı daxil edin", name:"Ad Soyad", cls:"Sinif (məs: 5)", btn:"Başla" },
    ru: { title:"Введите ваше имя",   name:"Имя Фамилия", cls:"Класс (напр: 5)", btn:"Начать" },
    en: { title:"Enter your name",    name:"Full Name", cls:"Class (e.g. 5)", btn:"Start" },
  };
  const L = labels[lang] || labels.az;
  overlay.innerHTML = `
    <div style="background:var(--surface,#1e293b);border:1px solid var(--border,#334155);border-radius:16px;padding:28px;width:min(340px,90vw);box-shadow:0 20px 60px rgba(0,0,0,.5)">
      <h2 style="color:var(--text,#f1f5f9);font-size:1.1rem;font-weight:700;margin-bottom:18px">${L.title}</h2>
      <input id="nm_name"  placeholder="${L.name}"  style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--border,#334155);background:var(--bg,#0f172a);color:var(--text,#f1f5f9);font-size:.95rem;margin-bottom:10px;box-sizing:border-box" />
      <input id="nm_class" placeholder="${L.cls}"   style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--border,#334155);background:var(--bg,#0f172a);color:var(--text,#f1f5f9);font-size:.95rem;margin-bottom:18px;box-sizing:border-box" />
      <button id="nm_btn" style="width:100%;padding:12px;border-radius:8px;background:var(--primary,#3b82f6);color:#fff;font-weight:700;font-size:1rem;border:none;cursor:pointer">${L.btn}</button>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById("nm_btn").addEventListener("click", () => {
    const name = (document.getElementById("nm_name").value || "").trim();
    const cls  = (document.getElementById("nm_class").value || "").trim();
    if (!name) { document.getElementById("nm_name").style.borderColor = "#ef4444"; return; }
    state.studentName  = name;
    state.studentClass = cls;
    localStorage.setItem("dim_student_name",  name);
    localStorage.setItem("dim_student_class", cls);
    overlay.remove();
    onConfirm();
  });
}

/* ── Bootstrap ── */
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderAll();
  updateTimerDisplay();
  if (state.finished) {
    showResults();
  } else if (!state.studentName) {
    showNameModal(() => {
      state.startedAt = new Date().toISOString();
      saveState();
      startTimer();
    });
  } else {
    if (!state.startedAt) { state.startedAt = new Date().toISOString(); saveState(); }
    startTimer();
  }
});
