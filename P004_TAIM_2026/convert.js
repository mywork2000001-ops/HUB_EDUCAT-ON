#!/usr/bin/env node
/**
 * MİQ Test Bank – Batch Converter
 * Converts all 47 test HTML files to unified engine+style format.
 * Run: node convert.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const DIR  = __dirname;

/* ══════════════════════════════════════════════════
   FILE METADATA
   ══════════════════════════════════════════════════ */
const META = {
  'test-1.html':   { sectionAz:'I BÖLMƏ: Hüquqi savadlılıq', sectionRu:'I РАЗДЕЛ: Правовая грамотность', topicAz:'1.1.1–1.1.4 Hüquqi savadlılıq', topicRu:'1.1.1–1.1.4 Правовая грамотность', time:45 },
  'test-2.html':   { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.1 İnteqrasiya', topicRu:'2.1.1 Интеграция', time:60 },
  'test-3.html':   { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.2 XXI əsrin kompetensiyaları', topicRu:'2.1.2 Компетенции XXI века', time:45 },
  'test-4.html':   { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.3 Təfəkkürün növləri', topicRu:'2.1.3 Виды мышления', time:90 },
  'test-5.html':   { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.4 Metakognitiv bacarıqlar', topicRu:'2.1.4 Метакогнитивные навыки', time:45 },
  'test-6.html':   { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.5 Bilik növləri', topicRu:'2.1.5 Виды знаний и деятельности', time:60 },
  'test-7.html':   { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.6 Blumun idrak taksonomiyası', topicRu:'2.1.6 Таксономия Блума', time:60 },
  'test-8.html':   { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.7 Webb Dərin bilik səviyyələri', topicRu:'2.1.7 Уровни глубоких знаний Вебба', time:55 },
  'test-9.html':   { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.8 Tədrisin forma və modelləri', topicRu:'2.1.8 Формы и модели обучения', time:0 },
  'test-10.html':  { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.9 Tədrisin strategiya və texnikaları', topicRu:'2.1.9 Стратегии и техники обучения', time:90 },
  'test-11.html':  { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.10 İllik və gündəlik planlaşdırma', topicRu:'2.1.10 Годовое и ежедневное планирование', time:60 },
  'test-12.html':  { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.11 Şagirdyönümlü (interaktiv) təlim', topicRu:'2.1.11 Ученикоориентированное обучение', time:60 },
  'test-13.html':  { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.12 Müəllimin fasilitasiya bacarığı', topicRu:'2.1.12 Фасилитаторские навыки учителя', time:30 },
  'test-14.html':  { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.13 Fərdiləşdirilmiş təlim', topicRu:'2.1.13 Дифференцированное обучение', time:75 },
  'test-15.html':  { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.14 Öyrənmə tərzi', topicRu:'2.1.14 Стили обучения', time:30 },
  'test-16.html':  { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.15 Rəqəmsal vasitələr və süni intellekt', topicRu:'2.1.15 Цифровые инструменты и ИИ', time:0 },
  'test-17.html':  { sectionAz:'II BÖLMƏ: Metodiki savadlılıq', sectionRu:'II РАЗДЕЛ: Методическая грамотность', topicAz:'2.1.16 Dizayn düşüncəsi', topicRu:'2.1.16 Дизайн-мышление', time:0 },
  'test-fs1.html': { sectionAz:'Fəsil sınaqları', sectionRu:'Разделительные тесты', topicAz:'Fəsil sınağı 1', topicRu:'Раздельный тест 1', time:0 },
  'test-fs2.html': { sectionAz:'Fəsil sınaqları', sectionRu:'Разделительные тесты', topicAz:'Fəsil sınağı 2', topicRu:'Раздельный тест 2', time:0 },
  'test-18.html':  { sectionAz:'II BÖLMƏ: Qiymətləndirici savadlılıq', sectionRu:'II РАЗДЕЛ: Оценочная грамотность', topicAz:'2.2.1 Qiymətləndirmənin növləri', topicRu:'2.2.1 Виды оценивания', time:0 },
  'test-19.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.1 Müasir pedaqoji yanaşmalar', topicRu:'3.1.1 Современные педагогические подходы', time:0 },
  'test-20.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.2 Şəxsiyyətin formalaşması', topicRu:'3.1.2 Формирование личности', time:45 },
  'test-21.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.3 H.Qardner: Çoxnövlü zəka', topicRu:'3.1.3 Г.Гарднер: Множественный интеллект', time:60 },
  'test-22.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.4 J.Piaje: Zehni inkişaf mərhələləri', topicRu:'3.1.4 Ж.Пиаже: Стадии умственного развития', time:60 },
  'test-23.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.5 L.Viqotski: Yaxın inkişaf zonası', topicRu:'3.1.5 Л.Выготский: Зона ближайшего развития', time:60 },
  'test-24.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.6 K.Dvek: Düşüncə tərzi', topicRu:'3.1.6 К.Двек: Тип мышления', time:60 },
  'test-25.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.7 L.Kolberq: Mənəvi inkişaf', topicRu:'3.1.7 Л.Кольберг: Нравственное развитие', time:60 },
  'test-26.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.8 R.Qanye: Öyrənmənin şərtləri', topicRu:'3.1.8 Р.Ганье: Условия обучения', time:45 },
  'test-27.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.9 D.Qoulman: Emosional zəka', topicRu:'3.1.9 Д.Гоулман: Эмоциональный интеллект', time:60 },
  'test-28.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.10 K.Yunq: Psixoloji tiplər', topicRu:'3.1.10 К.Юнг: Психологические типы', time:45 },
  'test-29.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.11 A.Bandura: Sosial öyrənmə', topicRu:'3.1.11 А.Бандура: Социальное обучение', time:45 },
  'test-30.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.12 J.Bruner: Koqnitiv öyrənmə', topicRu:'3.1.12 Дж.Брунер: Когнитивное обучение', time:45 },
  'test-31.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.1.13 K.Rocers: Şəxsiyyətyönümlü yanaşma', topicRu:'3.1.13 К.Роджерс: Личностно-ориентированный подход', time:45 },
  'test-fs3.html': { sectionAz:'Fəsil sınaqları', sectionRu:'Разделительные тесты', topicAz:'Fəsil sınağı 3', topicRu:'Раздельный тест 3', time:45 },
  'test-fs4.html': { sectionAz:'Fəsil sınaqları', sectionRu:'Разделительные тесты', topicAz:'Fəsil sınağı 4', topicRu:'Раздельный тест 4', time:45 },
  'test-32.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.2.1 Sosial-emosional öyrənmə (CASEL)', topicRu:'3.2.1 Социально-эмоциональное обучение (CASEL)', time:45 },
  'test-33.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.2.2 Səmərəli öyrənmə mühiti', topicRu:'3.2.2 Эффективная образовательная среда', time:45 },
  'test-34.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.2.3 Pozitiv intizam', topicRu:'3.2.3 Позитивная дисциплина', time:45 },
  'test-35.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.2.4 Sinfin idarəedilməsi', topicRu:'3.2.4 Управление классом', time:90 },
  'test-36.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.2.5 Müəllim-şagird münasibətləri', topicRu:'3.2.5 Отношения учитель-ученик', time:45 },
  'test-37.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.2.6 Şagird davranışının idarəolunması', topicRu:'3.2.6 Управление поведением учеников', time:45 },
  'test-38.html':  { sectionAz:'III BÖLMƏ: Psixoloji-pedaqoji biliklər', sectionRu:'III РАЗДЕЛ: Психолого-педагогические знания', topicAz:'3.2.7 Qısnama (bullinq)', topicRu:'3.2.7 Буллинг', time:60 },
  'test-fs5.html': { sectionAz:'Fəsil sınaqları', sectionRu:'Разделительные тесты', topicAz:'Fəsil sınağı 5', topicRu:'Раздельный тест 5', time:30 },
  'test-fs6.html': { sectionAz:'Fəsil sınaqları', sectionRu:'Разделительные тесты', topicAz:'Fəsil sınağı 6', topicRu:'Раздельный тест 6', time:30 },
  'test-us1.html': { sectionAz:'Ümumi sınaqlar', sectionRu:'Общие тесты', topicAz:'Ümumi sınaq 1', topicRu:'Общий тест 1', time:30 },
  'test-us2.html': { sectionAz:'Ümumi sınaqlar', sectionRu:'Общие тесты', topicAz:'Ümumi sınaq 2', topicRu:'Общий тест 2', time:30 },
  'test-us3.html': { sectionAz:'Ümumi sınaqlar', sectionRu:'Общие тесты', topicAz:'Ümumi sınaq 3', topicRu:'Общий тест 3', time:30 },
};

/* ══════════════════════════════════════════════════
   JS DATA EXTRACTION – bracket-matching eval
   ══════════════════════════════════════════════════ */
function extractVar(html, varName) {
  const pattern = new RegExp(`(?:const|let|var)\\s+${varName}\\s*=\\s*`);
  const startIdx = html.search(pattern);
  if (startIdx === -1) return null;

  const eqIdx = html.indexOf('=', startIdx) + 1;
  let i = eqIdx;
  while (i < html.length && (html[i] === ' ' || html[i] === '\n' || html[i] === '\r')) i++;

  const opener = html[i];
  if (opener !== '[' && opener !== '{') return null;
  const closer = opener === '[' ? ']' : '}';

  let depth = 0;
  let inStr = false;
  let strCh = '';
  let j = i;
  while (j < html.length) {
    const ch = html[j];
    if (inStr) {
      if (ch === '\\') { j += 2; continue; }
      if (ch === strCh) inStr = false;
    } else {
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; }
      else if (ch === opener) depth++;
      else if (ch === closer) {
        depth--;
        if (depth === 0) break;
      }
    }
    j++;
  }

  const code = html.slice(i, j + 1);
  try {
    return (new Function('return ' + code))();
  } catch (e) {
    console.error(`  extractVar(${varName}) parse error:`, e.message);
    return null;
  }
}

/* ══════════════════════════════════════════════════
   HTML FORM EXTRACTION (test-9, 16, 17, fs1, fs2)
   Extracts AZ questions from HTML DOM structure.
   ══════════════════════════════════════════════════ */
function extractHTMLFormAZ(html) {
  const questions = [];
  // Match each .question block
  const qBlockRe = /<div\s+class="question">([\s\S]*?)(?=<div\s+class="question"|<div\s+[^>]*(?:btn-container|result\b|checkBtn)|<\/form>)/g;
  let m;
  while ((m = qBlockRe.exec(html)) !== null) {
    const block = m[1];

    // Extract question number line
    const numRe = /<div\s+class="question-number">([\s\S]*?)<\/div>/;
    const numM = block.match(numRe);
    let numText = numM ? numM[1].replace(/<[^>]+>/g, ' ').trim() : '';

    // Extract optional question-text div (tables, extra HTML)
    const textRe = /<div\s+class="question-text">([\s\S]*?)<\/div>/;
    const textM = block.match(textRe);
    const extraHTML = textM ? textM[1].trim() : '';

    // Full question text: number line + extra HTML
    let fullText = numText;
    if (extraHTML) fullText = numText + '\n' + extraHTML;

    // Extract labels (A)..E))
    const labels = [];
    const labelRe = /<label[^>]*>([\s\S]*?)<\/label>/g;
    let lm;
    while ((lm = labelRe.exec(block)) !== null) {
      labels.push(lm[1].replace(/<[^>]+>/g, '').trim());
    }

    questions.push({ text: fullText, labels });
  }
  return questions;
}

/* Strip "A) " letter prefix from option strings */
function stripPrefix(s) {
  return s.replace(/^[A-Ea-e][)\.]\s*/, '').trim();
}

/* Letter "A" → index 0 */
function letterToIdx(letter) {
  const l = String(letter).toUpperCase().trim();
  return ['A','B','C','D','E'].indexOf(l);
}

/* ══════════════════════════════════════════════════
   NORMALIZERS PER FORMAT
   ══════════════════════════════════════════════════ */

/* Format A1: { text:{az,ru}, options:{az,ru}, correct:0, explanation:{az,ru} }
   Used by: test-1, test-2(+subject), test-3, test-10, test-13, test-15, test-20..26 */
function normalizeA1(raw) {
  return raw.map(q => ({
    text:    q.text,
    options: q.options,
    correct: (q.correct !== undefined) ? q.correct
             : (q.answer !== undefined) ? letterToIdx(q.answer) : 0,
    explanation: q.explanation || { az:'', ru:'' },
    subject: q.subject || undefined,
  }));
}

/* Format A2: { text:{az,ru}, options:{az,ru}, correct:0 } – no explanation
   Used by: test-10 (ru==az placeholder), test-13, test-15 */
// → handled by normalizeA1

/* Format B_az_ru: az and ru in separate arrays [questions + ruQuestions]
   Used by: test-4, test-5, test-6, test-7, test-8, test-11, test-12, test-14 */
function normalizeBSplit(azArr, ruArr) {
  return azArr.map((q, i) => {
    const ru = ruArr ? ruArr[i] : null;
    const azText    = q.text || q.q || '';
    const azOpts    = q.options || q.o || q.opts || [];
    const correct   = (q.correct !== undefined) ? q.correct
                    : (q.answer  !== undefined) ? letterToIdx(q.answer)
                    : (q.a       !== undefined) ? q.a : 0;
    return {
      text:    { az: azText,     ru: ru ? (ru.text || ru.q || azText) : azText },
      options: { az: azOpts,     ru: ru ? (ru.options || ru.o || ru.opts || azOpts) : azOpts },
      correct,
      explanation: q.explanation || { az:'', ru:'' },
    };
  });
}

/* Format C_Q: { q:"az", o:[...], a:0 } + ruQ: { q:"ru", o:[...] }
   Used by: test-18, test-19 */
function normalizeCQ(azArr, ruArr) {
  return azArr.map((q, i) => {
    const ru = ruArr ? ruArr[i] : null;
    return {
      text:    { az: q.q || q.text || '', ru: ru ? (ru.q || ru.text || q.q || '') : (q.q || '') },
      options: { az: q.o || q.options || [],  ru: ru ? (ru.o || ru.options || q.o || []) : (q.o || []) },
      correct: (q.a !== undefined) ? q.a : (q.correct !== undefined) ? q.correct : 0,
      explanation: q.explanation || { az:'', ru:'' },
    };
  });
}

/* Format D: { id, text:{az,ru}, options:{az:["A) ..."],ru:[...]}, answer:"A" }
   Used by: test-20..27 (but test-20..26 detected as A1 already – answer:"A")
   Note: options may have "A) " prefix */
function normalizeD(raw) {
  return raw.map(q => ({
    text:    q.text,
    options: {
      az: (q.options.az || []).map(stripPrefix),
      ru: (q.options.ru || []).map(stripPrefix),
    },
    correct: (q.answer !== undefined) ? letterToIdx(q.answer)
           : (q.correct !== undefined) ? q.correct : 0,
    explanation: q.explanation || { az:'', ru:'' },
  }));
}

/* Format F: { az:{text,options}, ru:{text,options}, answer:"A" }
   Used by: test-27..31, test-fs3 */
function normalizeF(raw) {
  return raw.map(q => ({
    text:    { az: q.az ? (q.az.text || '') : '', ru: q.ru ? (q.ru.text || '') : '' },
    options: { az: q.az ? (q.az.options || []) : [], ru: q.ru ? (q.ru.options || []) : [] },
    correct: (q.answer !== undefined) ? letterToIdx(q.answer)
           : (q.correct !== undefined) ? q.correct : 0,
    explanation: q.explanation || { az:'', ru:'' },
  }));
}

/* Format G: { az:{q,opts}, ru:{q,opts}, correct:0, explanation:{az,ru} }
   Used by: test-32..38, test-fs4..6, test-us1..3 */
function normalizeG(raw) {
  return raw.map(q => ({
    text:    { az: q.az ? (q.az.q || q.az.text || '') : '', ru: q.ru ? (q.ru.q || q.ru.text || '') : '' },
    options: { az: q.az ? (q.az.opts || q.az.options || []) : [], ru: q.ru ? (q.ru.opts || q.ru.options || []) : [] },
    correct: (q.correct !== undefined) ? q.correct : 0,
    explanation: q.explanation || { az:'', ru:'' },
  }));
}

/* HTML Form: extract AZ from HTML + RU from RU_DATA + correctAnswers */
function normalizeHTMLForm(html) {
  const azQuestions = extractHTMLFormAZ(html);
  const correctAnswersObj = extractVar(html, 'correctAnswers');
  const ruData = extractVar(html, 'RU_DATA');

  const ruQuestions = ruData ? ruData.questions || [] : [];

  return azQuestions.map((q, i) => {
    const qKey = 'q' + (i + 1);
    const correctLetter = correctAnswersObj ? (correctAnswersObj[qKey] || 'A') : 'A';
    const correct = letterToIdx(correctLetter);

    const ruQ = ruQuestions[i] || {};
    // RU question text: from ruQ.num (strip leading "N. ") + ruQ.text
    let ruText = ruQ.num ? ruQ.num.replace(/^\d+\.\s*/, '') : q.text;
    if (ruQ.text) ruText = ruText + '\n' + ruQ.text;

    const ruLabels = ruQ.labels || q.labels;

    return {
      text:    { az: q.text,  ru: ruText },
      options: { az: q.labels.map(stripPrefix), ru: ruLabels.map(stripPrefix) },
      correct,
      explanation: { az:'', ru:'' },
    };
  });
}

/* ══════════════════════════════════════════════════
   DETECT FORMAT + EXTRACT
   ══════════════════════════════════════════════════ */
function extractQuestions(filename, html) {
  // HTML form files (correctAnswers object)
  if (html.includes('correctAnswers') && !html.includes('const questions')) {
    return normalizeHTMLForm(html);
  }

  // Format G: az.q/opts + ru.q/opts + correct:0 (test-32..38, fs4..6, us1..3)
  {
    const raw = extractVar(html, 'questions');
    if (raw && raw.length && raw[0] && raw[0].az && (raw[0].az.q !== undefined || raw[0].az.opts)) {
      return normalizeG(raw);
    }
    // Format F: az.text/options + ru.text/options + answer:"A" (test-27..31, fs3)
    if (raw && raw.length && raw[0] && raw[0].az && raw[0].az.text !== undefined) {
      return normalizeF(raw);
    }
    // Format A1: text:{az,ru} + options:{az,ru} + correct/answer
    if (raw && raw.length && raw[0] && raw[0].text && typeof raw[0].text === 'object') {
      // Check if options need "A) " stripping
      const firstOpt = (raw[0].options && raw[0].options.az && raw[0].options.az[0]) || '';
      if (/^[A-E][)\.]\s/.test(firstOpt)) return normalizeD(raw);
      return normalizeA1(raw);
    }
    // Format B (questions array, az only) + separate ruQuestions
    if (raw && raw.length && raw[0] && (raw[0].text !== undefined || raw[0].q !== undefined)) {
      const ruArr = extractVar(html, 'ruQuestions');
      return normalizeBSplit(raw, ruArr);
    }
  }

  // Format C_Q: const Q = [{q,o,a}] + const ruQ = [{q,o}]
  {
    const azArr = extractVar(html, 'Q');
    if (azArr && Array.isArray(azArr) && azArr.length && azArr[0].q !== undefined) {
      const ruArr = extractVar(html, 'ruQ');
      return normalizeCQ(azArr, ruArr);
    }
  }

  console.warn(`  WARNING: unknown format for ${filename}`);
  return [];
}

/* ══════════════════════════════════════════════════
   HTML GENERATION
   ══════════════════════════════════════════════════ */
function generateHTML(filename, meta, questions) {
  const topicTitle = meta.topicAz.replace(/"/g, '&quot;');
  const qJSON = JSON.stringify(questions, null, 2);

  return `<!doctype html>
<html lang="az">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MİQ Test | ${topicTitle}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app"></div>
  <script>
var CONFIG = {
  sectionAz: ${JSON.stringify(meta.sectionAz)},
  sectionRu: ${JSON.stringify(meta.sectionRu)},
  topicAz:   ${JSON.stringify(meta.topicAz)},
  topicRu:   ${JSON.stringify(meta.topicRu)},
  totalTimeMin: ${meta.time},
  backLink: "index.html",
  questions: ${qJSON}
};
  </script>
  <script src="engine.js"></script>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════ */
let ok = 0, fail = 0;

for (const [filename, meta] of Object.entries(META)) {
  const filepath = path.join(DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`SKIP  ${filename} (not found)`);
    continue;
  }

  try {
    const html = fs.readFileSync(filepath, 'utf8');
    const questions = extractQuestions(filename, html);

    if (!questions || questions.length === 0) {
      console.log(`FAIL  ${filename} – 0 questions extracted`);
      fail++;
      continue;
    }

    const newHTML = generateHTML(filename, meta, questions);
    fs.writeFileSync(filepath, newHTML, 'utf8');
    console.log(`OK    ${filename} – ${questions.length} questions`);
    ok++;
  } catch (e) {
    console.error(`FAIL  ${filename} – ${e.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} ok, ${fail} failed`);
