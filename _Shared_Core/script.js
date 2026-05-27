/* ============================================================
   GLOBAL EDU-PLATFORM — Master Script
   _Shared_Core/script.js  |  v1.0  |  2026-05-28
   ============================================================ */

'use strict';

/* ── Theme ────────────────────────────────────────────────── */
const ThemeManager = (() => {
  const KEY = 'edu-theme';

  function apply(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(KEY, theme);
  }

  function toggle() {
    const isDark = document.documentElement.classList.contains('dark');
    apply(isDark ? 'light' : 'dark');
  }

  function init() {
    const saved = localStorage.getItem(KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved ?? (prefersDark ? 'dark' : 'light'));
  }

  return { init, toggle, apply };
})();

/* ── Language ─────────────────────────────────────────────── */
const LangManager = (() => {
  const KEY = 'edu-lang';
  const LANGS = ['az', 'ru', 'en'];
  let current = 'az';
  let strings = {};

  function setStrings(obj) { strings = obj; }

  function apply(lang) {
    current = lang;
    localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang;
    if (!strings[lang]) return;
    Object.entries(strings[lang]).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
    const btn = document.getElementById('langBtn');
    if (btn) btn.textContent = lang.toUpperCase();
  }

  function cycle() {
    const next = LANGS[(LANGS.indexOf(current) + 1) % LANGS.length];
    apply(next);
  }

  function init(obj) {
    if (obj) setStrings(obj);
    const saved = localStorage.getItem(KEY) || 'az';
    apply(saved);
  }

  return { init, cycle, apply, setStrings, get current() { return current; } };
})();

/* ── LocalStorage Progress ────────────────────────────────── */
const Progress = (() => {
  function get(projectId) {
    return JSON.parse(localStorage.getItem(`progress-${projectId}`) || '{}');
  }

  function set(projectId, lessonId, status) {
    const data = get(projectId);
    data[lessonId] = status;
    localStorage.setItem(`progress-${projectId}`, JSON.stringify(data));
  }

  function summary(projectId) {
    const data = get(projectId);
    const vals = Object.values(data);
    return {
      completed:  vals.filter(v => v === 'completed').length,
      inProgress: vals.filter(v => v === 'in-progress').length,
      total:      vals.length,
    };
  }

  return { get, set, summary };
})();

/* ── DOM ready helper ─────────────────────────────────────── */
function onReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

/* ── KaTeX auto-render helper ─────────────────────────────── */
function initKaTeX() {
  if (typeof renderMathInElement !== 'undefined') {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$',  right: '$',  display: false },
      ],
      throwOnError: false,
    });
  }
}

/* ── Auto-init ────────────────────────────────────────────── */
onReady(() => {
  ThemeManager.init();
});
