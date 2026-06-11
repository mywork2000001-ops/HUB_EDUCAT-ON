GLOBAL EDU-PLATFORM ORCHESTRATOR
════════════════════════════════════════════════════════════════════
 0. LIVE PROJECT GRAPH  (актуально на 2026-06-11)
════════════════════════════════════════════════════════════════════

ROOT: C:/Users/Administrator/Documents/Claude/Projects/
│
├── index.html                          ← MASTER HUB v4.0.0
│                                         Data-driven карточки из PLATFORMS[]
│                                         Фильтры: Hamısı / Şagird / Müəllim
│                                         Прогресс-бары, Coming Soon слот, hover-glow
│                                         Добавить P005+ = 1 объект в PLATFORMS[]
├── CLAUDE.md                           ← Этот файл
├── .gitignore
│
├── scripts/                            ← Все Python-скрипты автоматизации (17 файлов)
│   ├── extract_code.py / lesson_gen.py / rebuild_lessons.py
│   ├── fix_a0.py / fix_katex.py / fix_katex2.py / fix_katex_delimiters.py
│   ├── fix_type_b_css.py / fix_type_b_dedup.py / fix_a0_multiline.py
│   ├── inject_images.py / migrate_to_katex.py / optimize_topics.py
│   ├── rebuild_batch_c1.py / generate_lessons.py / global_parser.py
│   └── gen_lessons_p002.ps1
│
├── _Shared_Core/                       ← ОБЩЕЕ ЯДРО (все проекты)
│   ├── style.css                       ← Глобальные стили, CSS-переменные, dark/light
│   ├── script.js                       ← Утилиты, i18n, навигация
│   ├── textbook_engine.js              ← Движок P002 (4-Pillar)
│   ├── textbook_template.html          ← Шаблон для новых Movzu
│   ├── quiz-engine.js                  ← MCQ-движок (P001/P003 тесты)
│   └── quiz.css                        ← Стили викторин
│
├── P001_Math_5_DIM/                    ═══ ПРОЕКТ 1: DİM Тест-банк ═══
│   ├── index.html                      ← Лендинг P001
│   └── 5dim_sinif_testi2025/
│       ├── index.html
│       ├── Lesson-1.html … Lesson-17.html   (17 уроков ✅ COMPLETE)
│       ├── script.js
│       ├── style.css
│       └── assets/img/                 ← ~1 190 WebP/PNG изображений
│           └── p[lesson]_[type]_[N].webp
│
├── P002_Math_5_Darslik/               ═══ ПРОЕКТ 2: Учебник (4-Pillar) ═══
│   ├── index.html                      ← Лендинг P002
│   ├── math-5-class-1/                 ← Глава 1
│   │   ├── index.html
│   │   └── lesson-1.html … lesson-11.html
│   ├── math-5-class-2/ … math-5-class-8/   (8 глав × 11 уроков = 88 файлов)
│   └── [каждая глава содержит index.html + lesson-1..11.html]
│
├── P003_Block_Exam/                    ═══ ПРОЕКТ 3 (P003) ═══
    │
    ├── source_books/                   ← Исходные материалы
    │   ├── Riyaziyyat Test bank 2025-ci il 1-ci hissə.pdf
    │   ├── Riyaziyyat Test bank 2025-ci il 2-ci hissə.pdf
    │   ├── DIM_2025_INDEX.html
    │   └── Revane/
    │
    ├── scripts/                        ← Генерация контента P003
    │   ├── generate_dim_tests.py
    │   ├── render_pages.py
    │   └── pg_imgs/
    │
    └── app/                            ← REACT/VITE ПРИЛОЖЕНИЕ
        ├── package.json                ← React 19, Vite, TS, TailwindCSS, Radix-UI
        ├── vite.config.ts
        ├── tailwind.config.js
        ├── index.html                  ← Vite entry point
        │
        ├── src/
        │   ├── main.tsx / App.tsx
        │   ├── app/Router.tsx
        │   ├── pages/  (10 страниц)
        │   │   ├── DashboardPage.tsx
        │   │   ├── TopicsPage.tsx / TopicDetailPage.tsx / TopicLessonPage.tsx
        │   │   ├── TestsPage.tsx / TestViewPage.tsx
        │   │   ├── ProofsPage.tsx / ProofViewPage.tsx
        │   │   └── SituationalPage.tsx / SituationalViewPage.tsx
        │   ├── components/
        │   │   ├── ContentViewer.tsx / Layout.tsx
        │   │   └── ui/  (60+ Radix-UI компонентов)
        │   ├── context/LangContext.tsx  ← AZ / RU / EN переключение
        │   ├── hooks/use-mobile.ts
        │   ├── services/ProgressService.ts
        │   ├── data/
        │   │   ├── topics.ts           ← 28 тем (содержимое)
        │   │   ├── tests.ts            ← Тест-вопросы
        │   │   ├── proofs.ts           ← Математические доказательства
        │   │   └── situational.ts      ← Ситуационные задачи
        │   ├── types/index.ts
        │   └── lib/utils.ts
        │
        ├── public/lessons/             ← СТАТИЧЕСКИЕ HTML-УРОКИ
        │   ├── topics/
        │   │   ├── index.html          ← Каталог 28 тем
        │   │   ├── topic-01.html … topic-28.html   (28 тем ✅)
        │   │   ├── topic-shared-a.css / .js
        │   │   └── topic-shared-b.css
        │   ├── tests/
        │   │   ├── index.html          ← Каталог тестов
        │   │   ├── p1-s01-t1.html      ← Тест 1 [РАЗБЛОКИРОВАН]
        │   │   ├── p1-s01-t2.html      ← Тест 2 [РАЗБЛОКИРОВАН]
        │   │   ├── p1-s01-t3.html
        │   │   ├── test-dim-mixed.html
        │   │   ├── test-variant-1.html / test-variant-2.html
        │   │   └── [8 тест-файлов всего]
        │   ├── proofs/
        │   │   ├── index.html
        │   │   ├── proof-pythagoras.html
        │   │   ├── proof-triangle-angles.html
        │   │   └── proof-vieta.html
        │   └── situational/
        │       ├── index.html
        │       ├── sit-bag.html / sit-magaza.html / sit-mesafe.html
        │       └── [4 ситуационных задачи]
        │
        └── dist/                       ← Сборка Vite (продакшн)
            ├── index.html
            └── assets/ (CSS + JS бандлы)

├── P004_TAIM_2026/                     ═══ ПРОЕКТ 4 (P004): TAİM 2026 ═══
│   Назначение: Платформа для подготовки к MİQ (аттестация педагогов)
│   Аудитория: Учителя Азербайджана | AZ + RU | PWA | Offline
│   Авторы: Ferid Hesenov, Aysel Balasova, Sola Mustafayeva
│   Источник: TAİM TEST BANK 2026 (PDF 312 стр., OCR)
│
├── index.html              ← Главный дашборд (47 уроков, учительская панель)
├── quiz.html               ← Конструктор квиза
│
├── ── ТЕСТ-ФАЙЛЫ (47 тестов) ─────────────────────────────────────
│   ├── test-1.html … test-38.html      ← Тематические тесты
│   │   │  Структура: var CONFIG = { topicAz, topicRu, sectionAz,
│   │   │    sectionRu, totalTimeMin, _k (XOR-зашифр.), questions[] }
│   │   │  + <script src="engine.js">
│   │   ├── I  BÖLMƏ — Hüquqi Savadlılıq         (test-1)
│   │   ├── II BÖLMƏ — Metodiki Savadlılıq        (test-2 … test-30)
│   │   │   ├── 2.1.1 İnteqrasiya                (test-2)
│   │   │   ├── 2.1.2 XXI əsr kompetensiyaları   (test-3)
│   │   │   ├── 2.x.x … 2.x.x (прочие темы)     (test-4 … test-30)
│   │   └── III BÖLMƏ — Pedaqoji Savadlılıq      (test-31 … test-38)
│   │       ├── Psixi teoriyalar (Gardner, Piaget, Vygotsky…)
│   │       └── SEL, bullying prevention, classroom mgmt
│   │
│   ├── test-fs1.html … test-fs6.html   ← Fəsil sınaqları (главы)
│   └── test-us1.html … test-us3.html   ← Ümumi sınaqlar (итоговые)
│
├── ── ДВИЖОК ──────────────────────────────────────────────────────
│   ├── engine.js           ← Единый движок v4 (obfuscated, 34.8 KB)
│   │   │  • XOR-дешифровка CONFIG._k (KEY: 8 bytes)
│   │   │  • Двуязычный UI (AZ/RU toggle)
│   │   │  • Таймер с анимацией (красная граница < 60 с)
│   │   │  • Сохранение/возобновление (localStorage, 24 ч)
│   │   │  • Порог сдачи: 70%
│   │   │  • Генерация сертификата (printable window)
│   │   │  • История результатов (taim_history, max 200)
│   │   └── • Review-режим после завершения
│   ├── protect.js          ← Защита (F12, Ctrl+U/S/P, DevTools) [obfusc.]
│   ├── convert.js          ← Batch-конвертер форматов (Node.js)
│   ├── rekey.js            ← Шифровальщик ответов → CONFIG._k
│   ├── make-icons.js       ← Генератор PWA-иконок
│   └── sw.js               ← Service Worker (cache: taim-v12)
│
├── style.css               ← Единая таблица стилей (тёмная тема #1e3c72)
├── manifest.json           ← PWA манифест (standalone, AZ, education)
├── icons/
│   ├── icon-192.png        ← PWA иконка 192×192 (any + maskable)
│   └── icon-512.png        ← PWA иконка 512×512 (any + maskable)
│
├── Folder/                 ← Данные и источники
│   ├── taim_test_bank_2026.json   ← OCR-ответы (313 стр, 47 секций)
│   ├── parse_answers.py           ← Структура всех ключей ответов
│   ├── answer_keys_hires.txt      ← OCR страниц 304–305
│   ├── answer_pages.txt           ← Маркеры 312 страниц
│   └── pdf_text.txt               ← Плейсхолдер
│   └── [TAİM TEST BANK 2026.pdf   ← НЕ в git: >100 MB]
│   └── [Images/ page_001..312.png ← НЕ в git: excluded]
│
├── README.md
├── CLAUDE.md
└── .gitignore              ← Исключает PDF + Images/

УЧИТЕЛЬСКАЯ ПАНЕЛЬ P004:
  Пароль (localStorage): "Test2026"
  Возможности: рейтинги (0=locked, 1–3=done), сброс прогресса,
               смена пароля, история тестов (taim_history)

────────────────────────────────────────────────────────────────────
 МАТРИЦА СТАТУСОВ (на 2026-06-11)
────────────────────────────────────────────────────────────────────

  Проект │ Компонент              │ Статус    │ Кол-во файлов
─────────┼────────────────────────┼───────────┼───────────────
  HUB    │ Master index.html      │ ✅ v4.0.0  │ data-driven PLATFORMS[]
  P001   │ DİM Уроки              │ ✅ DONE    │ 17/17 уроков
  P001   │ Изображения            │ ✅ DONE    │ ~1 190 WebP
  P002   │ index.html (дашборд)   │ ✅ DONE    │ TAİM-style, AZ+RU
  P002   │ Главы учебника         │ ⚠️ PART    │ 8 глав, 88 уроков
  P003   │ Темы (topics)          │ ✅ DONE    │ 28/28 HTML
  P003   │ Тесты (tests)          │ 🔄 WIP     │ 2 разблокировано
  P003   │ Доказательства (proofs)│ 🔄 WIP     │ 3 HTML
  P003   │ Ситуационные задачи    │ 🔄 WIP     │ 3 HTML
  P003   │ React App (src/)       │ ✅ BUILD   │ dist/ готов
  P004   │ Тесты (test-1..38)     │ ✅ DONE    │ 38 тест-HTML
  P004   │ Fəsil sınaqları        │ ✅ DONE    │ 6 (fs1–fs6)
  P004   │ Ümumi sınaqlar         │ ✅ DONE    │ 3 (us1–us3)
  P004   │ PWA / offline          │ ✅ DONE    │ sw.js v12, manifest
─────────┴────────────────────────┴───────────┴───────────────

 HUB АРХИТЕКТУРА index.html v4.0.0
────────────────────────────────────────────────────────────────────
  Файл: Projects/index.html
  Версия: v4.0.0 (2026-06-11)
  Ключевой принцип: ВСЕ карточки рендерятся из PLATFORMS[] массива.

  PLATFORMS[] — структура одной записи:
    { id, href, status ('active'|'wip'|'coming'), audience ('student'|'teacher'|'both'),
      c (primary color), c2 (secondary), cbg (chip bg), ctxt (chip text),
      iconBg, icon, progress (0–100),
      meta:{az,ru,en}, stats:{az,ru,en}, title:{az,ru,en},
      desc:{az,ru,en}, tags:[], cta:{az,ru,en} }

  ФИЛЬТРЫ: tabAll / tabStudent (audience='student') / tabTeacher (audience='teacher')
  СТАТУСЫ: 'active' → зелёный badge | 'wip' → жёлтый | 'coming' → blur lock overlay
  ЧТО ДОБАВИТЬ P005+: вписать 1 объект в конец PLATFORMS[].
  LANG: LangManager.cycle() перерендеривает все карточки через renderCards().

────────────────────────────────────────────────────────────────────
 ТЕХНОЛОГИЧЕСКИЙ СТЕК
────────────────────────────────────────────────────────────────────

  P003 App      │ Технология
────────────────┼────────────────────────────────────────────────
  UI Framework  │ React 19 + TypeScript
  Build Tool    │ Vite
  Стили         │ TailwindCSS 3 + CSS Variables (dark/light)
  Компоненты    │ Radix-UI (60+ примитивов)
  Роутинг       │ React Router 7
  Формы         │ React Hook Form + Zod
  Графики       │ Recharts
  Уведомления   │ Sonner (toast)
  Темы          │ next-themes
  Иконки        │ Lucide React
  Математика    │ KaTeX (primary) + MathJax (fallback) + MathML (a11y)
  Языки         │ AZ / RU / EN (LangContext.tsx)
────────────────┴────────────────────────────────────────────────

  P004 App      │ Технология
────────────────┼────────────────────────────────────────────────
  Frontend      │ HTML5, CSS3, Vanilla JS (без фреймворков)
  Движок        │ engine.js v4 (единый для всех 47 тестов)
  Шифрование    │ XOR-шифр ответов (rekey.js → CONFIG._k)
  Безопасность  │ protect.js (блок F12/DevTools/PrintScreen)
  PWA           │ Service Worker (taim-v12), manifest.json
  Хранилище     │ localStorage (прогресс, история, учитель)
  Языки         │ AZ / RU (bilingual toggle в каждом тесте)
  Сертификат    │ Генерация при ≥70% (printable window)
  Данные        │ OCR из PDF → parse_answers.py → JSON
────────────────┴────────────────────────────────────────────────

════════════════════════════════════════════════════════════════════

1. IDENTITY & MISSION
   You are the Lead Systems Architect & Automation Engineer.
   Mission: Transform legacy educational materials (PDF/Books) into a high-performance, multilingual, interactive testing ecosystem. You operate with full autonomy to build, audit, and deploy.
2. SYSTEM ARCHITECTURE (ID-BASED)
   All work is organized into a scalable hierarchy:
   Root: C:/Users/Administrator/Documents/Claude/Projects/
   Central Hub: index.html (The Master Entry Point — 2-card dashboard: P001 + P002).
   Shared Core: /_Shared_Core/ (Global style.css, script.js, textbook_engine.js, textbook_template.html).
   Project Folders: P[ID]_[Subject]\_[Grade/Type]
   P001_Math_5_DIM: DIM test bank — Lesson-X.html files (17 lessons, 1–17).
   P002_Math_5_Darslik: Interactive textbook — Movzu-X.html files (mövzular 18+).
   Internal: /assets/img/, /core/.
3. TECHNICAL STANDARDS
   3.1 Languages
   100% support for Azerbaijani (AZ), Russian (RU), and English (EN).
   All translation keys must be consistent: text, opts, hint, explanation.
   3.2 Mathematics Rendering & Symbol Readability
   3.2.1 LaTeX Engine
   Primary: KaTeX (server-side pre-rendering for instant display, no FOUC).
   Fallback: MathJax v3 (for complex environments: matrices, arrays, commutative diagrams).
   Static: Pre-render all LaTeX to HTML+CSS at build time using katex.renderToString().
   3.2.2 LaTeX Escaping Rules
   In HTML attributes: \\frac{a}{b} (double backslash)
   In JavaScript strings: \\\\frac{a}{b} (quadruple backslash)
   In JSON: \\\\frac{a}{b} (quadruple backslash)
   Never use raw backslash in HTML content without escaping.
   3.2.3 Math Accessibility (A11y)
   Every mathematical expression MUST include:
   HTML
   Preview
   Copy
   <span class="math-expression" role="img" aria-label="square root of x squared plus y squared">
     <!-- KaTeX rendered output -->
   </span>
   MathML output for screen readers (KaTeX output: 'mathml')
   Alt text for all SVG math diagrams
   SpeakText enabled: "x equals y squared plus five"
   Braille support: Nemeth Braille encoding for refreshable displays
   High contrast mode: Math symbols minimum 3:1 contrast ratio
   Zoom support: Math scales without breaking layout (em/rem units)
   3.2.4 Math Symbol Cheat Sheet (5-ci sinif)
   Table
   Symbol	LaTeX	Description (AZ)	Description (RU)	Description (EN)
   ÷	\div	bölü	деление	division
   ×	\times	vurma	умножение	multiplication
   ½	\frac{1}{2}	bir yarım	одна вторая	one half
   =	=	bərabərdir	равно	equals
   ≠	\neq	bərabər deyil	не равно	not equal
   <	<	kiçikdir	меньше	less than
   >	>	böyükdür	больше	greater than
   ≤	\leq	kiçik və ya bərabər	меньше или равно	less than or equal
   ≥	\geq	böyük və ya bərabər	больше или равно	greater than or equal
   °	^\circ	dərəcə	градус	degree
   π	\pi	pi	пи	pi
   √	\sqrt{x}	kök altı x	квадратный корень из x	square root of x
   ∛	\sqrt[3]{x}	kub kök	кубический корень	cube root
   a²	a^2	a kvadrat	a в квадрате	a squared
   a³	a^3	a kub	a в кубе	a cubed
   { }	\{ \}	sığa	фигурные скобки	braces
   [ ]	[ ]	kvadrat mötərizə	квадратные скобки	brackets
   ( )	( )	dairəvi mötərizə	круглые скобки	parentheses
   3.2.5 Readability Requirements
   All math symbols must render at minimum 16px on mobile, 18px on desktop.
   Fraction bars must be clearly visible (minimum 1px, recommended 2px).
   Exponents must be distinguishable from base (minimum 0.6em size difference).
   Subscripts must not overlap with adjacent text.
   Font stack: System fonts + STIX Two Math, Latin Modern Math.
   3.2.6 Color Coding for Math
   css
   Copy
   :root {
     --math-number: #2563eb;      /* Blue for numbers */
     --math-variable: #dc2626;    /* Red for variables */
     --math-operator: #000000;    /* Black for operators */
     --math-result: #16a34a;      /* Green for final answers */
     --math-hint: #9333ea;        /* Purple for hints */
   }
   3.2.7 Interactive Math Elements
   Click on fraction → expand step-by-step simplification.
   Hover on variable → show definition tooltip.
   Click on diagram → toggle labels/measurements.
   All interactions keyboard-accessible (Enter/Space).
   3.3 Graphics
   Priority 1: Dynamic Inline SVG (clean, responsive, 2px strokes).
   Priority 2: Optimized WebP/PNG images in /assets/img/.
   SVG Math Diagrams: All geometric figures must be inline SVG with aria-label descriptions.
   SVG Standards: viewBox responsive, aria-label with full geometric description, dark/light mode CSS variables for colors, all text as <text> elements (not paths) for accessibility.
   3.4 UI/UX
   Minimalist design, mobile-first.
   Dark/Light mode support via CSS variables.
   Font: System font stack + math-specific fonts (STIX Two Math, Latin Modern Math).
   Touch targets: Minimum 44×44px for mobile.
   Reduced motion: Respect prefers-reduced-motion.
   Keyboard navigation: Full Tab order, Enter/Space activation.
   Focus indicators: Visible 2px outline.
4. TOKEN OPTIMIZATION STRATEGY (BUDGET CONTROL)
   You must switch models based on task complexity to minimize costs:
   Table
   Task Type Model Cost/1M tokens Use Case
   Complex UI/JS logic Claude 3.5 Sonnet $3.00 SVG generation, architectural changes
   Bulk text translations Claude 3 Haiku $0.25 Raw PDF text cleaning, HTML cloning
   High-level system redesign Claude 3 Opus $15.00 Complex mathematical auditing
   Routine content generation Claude 3 Haiku $0.25 Question variants, hint generation
   Code review & audit Claude 3.5 Sonnet $3.00 Answer key verification, logic checks
   Batching rule: Group ≥10 similar tasks before invoking API.
   Caching rule: Cache rendered LaTeX HTML; never re-render static math.
5. AGENT & SUBAGENT ARCHITECTURE (AUTONOMOUS OPERATIONS)
   5.1 System Overview
   The platform operates as a hierarchical multi-agent system with autonomous task decomposition, parallel execution, and self-correction loops.
   plain
   Copy
   ┌─────────────────────────────────────────────────────────────┐
   │ ORCHESTRATOR AGENT │
   │ (Master Controller - Claude Opus) │
   │ • Task decomposition • Quality gating • Deployment │
   └──────────────┬──────────────────────────────┬───────────────┘
   │ │
   ┌──────────▼──────────┐ ┌───────────▼────────────┐
   │ CONTENT AGENTS │ │ TECHNICAL AGENTS │
   │ (Claude Sonnet) │ │ (Claude Sonnet) │
   ├─────────────────────┤ ├────────────────────────┤
   │ • Extractor Agent │ │ • SVG Generator Agent │
   │ • Translator Agent │ │ • LaTeX Renderer Agent │
   │ • Auditor Agent │ │ • UI Builder Agent │
   │ • Hint Writer Agent │ │ • Accessibility Agent │
   └──────────┬──────────┘ └───────────┬─────────────┘
   │ │
   ┌──────────▼──────────┐ ┌───────────▼────────────┐
   │ QUALITY AGENTS │ │ INFRASTRUCTURE │
   │ (Claude Haiku) │ │ AGENTS │
   ├─────────────────────┤ ├────────────────────────┤
   │ • Validator Agent │ │ • Git Commit Agent │
   │ • Watchtower Agent │ │ • Deploy Agent │
   │ • A11y Checker Agent│ │ • Backup Agent │
   └─────────────────────┘ └────────────────────────┘
   5.2 Agent Definitions
   5.2.1 ORCHESTRATOR AGENT (Master)
   Role: Central controller, task router, quality gatekeeper.
   Model: Claude 3 Opus (for complex decisions).
   Responsibilities:
   Parse user requests into atomic tasks.
   Select appropriate subagents based on task type.
   Enforce workflow sequencing (DAG execution).
   Final quality gate before deployment.
   Maintain project state in shared memory.
   System Prompt:
   plain
   Copy
   You are the Orchestrator Agent for the Global Edu-Platform.
   Your job is to decompose educational content tasks into atomic subtasks,
   route them to specialized subagents, and enforce quality gates.
   Rules:
6. Always verify answer keys before approving content.
7. Never deploy without accessibility audit pass.
8. Maintain mathematical notation consistency across all languages.
9. Log all decisions to shared state.
   5.2.2 EXTRACTOR AGENT
   Role: PDF/text extraction and structuring.
   Model: Claude 3 Haiku.
   Tools: PyMuPDF, OCR (Tesseract), structured output (JSON).
   Workflow:
   Extract raw text from PDF using scripts/extract*pdf.py.
   Identify question boundaries (numbers, spacing patterns).
   Detect mathematical expressions (regex: \$.*?\$, \\[._?\\]).
   Output structured JSON: {id, text, options, answer, hint, difficulty}.
   5.2.3 TRANSLATOR AGENT
   Role: AZ↔RU↔EN translation with math preservation.
   Model: Claude 3 Haiku.
   Constraints:
   Preserve all LaTeX expressions unchanged.
   Maintain option ordering (A,B,C,D).
   Keep numerical values identical.
   Flag culturally ambiguous content.
   Output Format:
   JSON
   Copy
   {
   "az": {"text": "...", "opts": ["...", "..."], "hint": "..."},
   "ru": {"text": "...", "opts": ["...", "..."], "hint": "..."},
   "en": {"text": "...", "opts": ["...", "..."], "hint": "..."}
   }
   5.2.4 SVG GENERATOR AGENT
   Role: Create mathematical diagrams as inline SVG.
   Model: Claude 3.5 Sonnet.
   Standards:
   2px stroke width, responsive viewBox.
   aria-label with full geometric description.
   Dark/light mode CSS variables for colors.
   All text as <text> elements (not paths) for accessibility.
   Example Output:
   SVG
   Preview
   Copy
   <svg viewBox="0 0 200 150" aria-label="Triangle ABC with base AB=5cm, height=3cm">
   <polygon points="20,130 100,20 180,130" fill="none" stroke="var(--math-stroke)" stroke-width="2"/>
   <text x="100" y="15" text-anchor="middle">A</text>
   <text x="10" y="145" text-anchor="middle">B</text>
   <text x="190" y="145" text-anchor="middle">C</text>
   </svg>
   5.2.5 LATEX RENDERER AGENT
   Role: Pre-render LaTeX to HTML+CSS/MathML.
   Model: Claude 3 Haiku.
   Process:
   Parse LaTeX expressions from content.
   Render via KaTeX (katex.renderToString()).
   Generate MathML for screen readers.
   Inject aria-label with spoken math.
   Cache output to avoid re-rendering.
   5.2.6 AUDITOR AGENT
   Role: Verify answer keys and hint logic.
   Model: Claude 3.5 Sonnet.
   Checklist:
   [ ] ans index matches correct option.
   [ ] Hint logic leads to correct answer.
   [ ] No duplicate correct answers.
   [ ] All options are plausible distractors.
   [ ] Mathematical calculations verified.
   [ ] LaTeX renders correctly in all three languages.
   Audit Report Format:
   JSON
   Copy
   {
   "lesson": "Lesson-5",
   "questions_audited": 20,
   "errors_found": 2,
   "errors": [
   {"q_id": 12, "type": "wrong_answer", "expected": "B", "found": "C"},
   {"q_id": 15, "type": "broken_latex", "expression": "\\frac{1}{\\sqrt{2}}"}
   ],
   "status": "needs_fix"
   }
   5.2.7 ACCESSIBILITY AGENT (A11y)
   Role: Ensure WCAG 2.1 AA compliance.
   Model: Claude 3 Haiku.
   Checks:
   Color contrast ratios (math symbols ≥ 3:1, text ≥ 4.5:1).
   Screen reader compatibility (MathML + aria-label).
   Keyboard navigation (Tab order, Enter/Space activation).
   Focus indicators (visible 2px outline).
   Reduced motion support.
   Alt text for all images/SVGs.
   5.2.8 WATCHTOWER AGENT
   Role: Continuous quality monitoring.
   Model: Claude 3 Haiku.
   Triggers:
   Runs after every deployment.
   Checks for broken links, rendering errors.
   Monitors user interaction patterns.
   Flags anomalies (e.g., 100% wrong answers on Q5).
   5.2.9 GIT COMMIT AGENT
   Role: Automated version control.
   Model: Claude 3 Haiku.
   Commit Convention:
   plain
   Copy
   feat: add Lesson-12 with 25 questions [P001]
   fix: correct answer key for Q7 in Lesson-3 [P001]
   a11y: add MathML to all fractions in Movzu-18 [P002]
   docs: update symbol cheat sheet
   chore: optimize SVG assets
   Auto-command:
   bash
   Copy
   git add . && git commit -m "feat: [description] [Project]" && git push origin main
   5.3 Agent Communication Protocol
   All agents communicate via structured JSON messages through a shared state store:
   JSON
   Copy
   {
   "message_id": "uuid-v4",
   "from_agent": "extractor",
   "to_agent": "translator",
   "task_id": "lesson-5-extraction",
   "timestamp": "2026-05-28T11:54:00Z",
   "payload": {
   "type": "extraction_complete",
   "data": { },
   "metadata": {
   "pages_processed": 12,
   "questions_found": 25,
   "math_expressions": 47
   }
   },
   "priority": "high",
   "requires_response": true
   }
   5.4 Autonomous Workflow Patterns
   Pattern A: PDF-to-Lesson Pipeline (Autonomous)
   plain
   Copy
10. Orchestrator receives: "Create Lesson-18 from PDF"
11. Orchestrator spawns Extractor Agent → raw JSON
12. Parallel spawn: Translator Agent (AZ/RU/EN)
13. Parallel spawn: SVG Generator Agent (diagrams)
14. Parallel spawn: LaTeX Renderer Agent (math)
15. Orchestrator collects results → assembles HTML
16. Spawns Auditor Agent → verification
17. Spawns A11y Agent → accessibility check
18. If all pass → Git Commit Agent → Deploy Agent
19. Watchtower Agent monitors post-deploy
    Pattern B: Content Update (Autonomous)
    plain
    Copy
20. Watchtower detects: "Q7 in Lesson-3 has 95% wrong answers"
21. Watchtower alerts Orchestrator
22. Orchestrator spawns Auditor Agent → deep inspection
23. Auditor confirms: answer key error
24. Orchestrator spawns Fix Agent → corrects answer
25. Auditor re-verifies → passes
26. Git Commit Agent → commit + push
27. Deploy Agent → redeploy
    Pattern C: Multi-Language Sync (Autonomous)
    plain
    Copy
28. Content updated in AZ (source of truth)
29. Orchestrator detects change
30. Spawns Translator Agent → RU + EN
31. Spawns Auditor Agent → verify consistency
32. Spawns A11y Agent → check all three languages
33. Auto-commit with "sync: update translations for Lesson-X"
    5.5 Error Handling & Recovery
    Table
    Error Type Detection Recovery Action
    Broken LaTeX LaTeX Renderer Fallback to MathJax; log for manual review
    Wrong answer key Auditor Agent Block deployment; flag for human review
    Translation mismatch Auditor Agent Re-run Translator Agent with stricter prompt
    SVG render fail SVG Generator Retry with simplified geometry; log
    A11y violation A11y Agent Auto-fix if possible; else block deployment
    Git conflict Git Commit Agent Auto-stash → rebase → retry; alert if fails
    Deploy failure Deploy Agent Rollback to last known good; alert
34. AUTOMATION WORKFLOWS
    A. PDF-to-Lesson Pipeline
    Extract: Use scripts/extract_pdf.py (PyMuPDF) to get raw text and images.
    Standardize: Apply \_Shared_Core templates to new lessons.
    Audit: Verify ans indices match the hint logic.
    Render: Pre-render all LaTeX via KaTeX; generate MathML.
    A11y: Run Accessibility Agent checks.
    Deploy: Git commit + push + invalidate cache.
    B. Deployment
    Every lesson creation or fix must be followed by:
    git add . && git commit -m "feat/fix: [desc]" && git push origin main
35. PROJECT INVENTORY
    P001_Math_5_DIM: DİM 2025 test bank. Exactly 17 lessons (Lesson-1 → Lesson-17). MCQ engine only.
    P002_Math_5_Darslik: Interactive textbook. 4-Pillar system (Theory · Practice · Evaluation · Gamification). Files: Movzu-18.html → Movzu-N.html. Engine: \_Shared_Core/textbook_engine.js. Template: \_Shared_Core/textbook_template.html.
    P003_Block_Exam (платформа для подготовки к блоковому экзамену): React/Vite/TS app. 28 topics ✅, tests WIP, proofs WIP, situational WIP. Path: Projects/платформа для подготовки к блоковому экзамену/app/
    P004_TAİM_2026: Standalone PWA platform for MİQ teacher certification. 47 tests (38 topic + 6 chapter + 3 final), ~1500+ questions, AZ+RU bilingual, engine.js v4, XOR-encrypted answers, offline-ready (sw.js v12). Path: Projects/P004_TAIM_2026/
36. LESSON STRUCTURE (P002: 4-Pillar + Trainer System)
    Each Movzu-X.html follows the 4-Pillar architecture with 5 interactive modules:
    plain
    Copy
    ┌─────────────────────────────────────────────────────────────┐
    │ MOVZU STRUCTURE │
    ├─────────────────────────────────────────────────────────────┤
    │ PILLAR 1: THEORY (Nəzəriyyə) │
    │ ├── Animated concept explanation │
    │ ├── Inline SVG diagrams with step-by-step reveals │
    │ ├── LaTeX formulas with click-to-expand derivations │
    │ └── Key definitions with AZ/RU/EN toggle │
    ├─────────────────────────────────────────────────────────────┤
    │ PILLAR 2: SIMULYATOR (Praktika / Simulyator) │
    │ ├── Guided problem solving (3-5 worked examples) │
    │ ├── Step-by-step hints (not just answers) │
    │ ├── Interactive manipulatives (drag, slider, input) │
    │ └── Immediate feedback with explanation │
    ├─────────────────────────────────────────────────────────────┤
    │ PILLAR 3: TESTLƏR (Qiymətləndirmə / Testlər) │
    │ ├── 20-25 MCQ per Movzu │
    │ ├── Adaptive difficulty (easy → medium → hard) │
    │ ├── Timer per question (optional, configurable) │
    │ ├── Instant grading with wrong-answer analysis │
    │ └── Results dashboard with weak-topic highlighting │
    ├─────────────────────────────────────────────────────────────┤
    │ PILLAR 4: VIKTORINA (Oyunlaşdırma / Viktorina) │
    │ ├── Speed challenge (60-second sprint) │
    │ ├── Streak counter with visual rewards │
    │ ├── Leaderboard (localStorage, class sync optional) │
    │ ├── Achievement badges per Movzu mastery │
    │ └── Final boss: mixed-topic quiz (10 random questions) │
    ├─────────────────────────────────────────────────────────────┤
    │ PILLAR 5: TRENAJÖR (Təkrar / Trenajör) — SRS │
    │ ├── Auto-generated weak-point drills │
    │ ├── Daily 10-question review from past Movzular │
    │ ├── SRS algorithm (Anki-like intervals) │
    │ └── Wrong-answer bank with forced re-attempts │
    └─────────────────────────────────────────────────────────────┘
    8.1 Module Specifications
    Table
    Module File Suffix Engine Data Source Lang Support
    Theory Movzu-X.html#theory textbook_engine.js Inline HTML + SVG AZ/RU/EN toggle
    Simulyator Movzu-X.html#practice textbook_engine.js JSON: practice[] AZ/RU/EN
    Testlər Movzu-X.html#test test_engine.js JSON: questions[] AZ/RU/EN
    Viktorina Movzu-X.html#quiz quiz_engine.js Random from questions[] AZ/RU/EN
    Trenajör trenajor.html srs_engine.js Cross-lesson wrong-answer DB AZ/RU/EN
    8.2 Navigation Flow
    plain
    Copy
    Student enters Movzu-18
    ↓
    [Theory] → Read → "I understand" button
    ↓
    [Simulyator] → Solve 3 guided problems → All correct?
    ↓ YES ↓ NO
    [Testlər] [Stay in Simulyator]
    ↓ ↓
    Score ≥ 80%? Hint → Retry → Pass
    ↓ YES ↓ NO
    [Viktorina] [Trenajör] → Weak points drill
    ↓ ↓
    Badge unlocked Return to Simulyator
    8.3 Data Schema per Movzu
    JSON
    Copy
    {
    "movzu_id": 18,
    "title": {"az": "Natural ədədlər", "ru": "Натуральные числа", "en": "Natural Numbers"},
    "theory": {
    "sections": [
    {"heading": "...", "body": "...", "svg_id": "diagram-1"},
    {"heading": "...", "body": "...", "interactive_id": "number-line"}
    ]
    },
    "practice": [
    {"id": 1, "problem": "...", "steps": [...], "hints": [...], "answer": "..."}
    ],
    "questions": [
    {"id": 1, "text": "...", "opts": [...], "ans": 0, "hint": "...", "difficulty": 1}
    ],
    "quiz_config": {"time_limit": 60, "question_count": 10, "mix_with": [16, 17, 19]}
    }
    8.4 Trenajör (SRS Engine) Logic
    Interval algorithm: Wrong answer → 1 day → 3 days → 7 days → 14 days → 30 days.
    Source pool: All wrong answers across all Movzular + flagged "hard" questions.
    Daily limit: 10 questions max (configurable).
    Mastery threshold: 3 consecutive correct answers removes from SRS pool.
    Cross-device: Export/import JSON backup.
37. SHARED CORE FILE STRUCTURE
    plain
    Copy
    /\_Shared_Core/
    ├── style.css # Global styles, CSS variables, dark/light mode
    ├── script.js # Global utilities, i18n helpers
    ├── textbook_engine.js # P002 interactive engine
    ├── textbook_template.html # Base template for new Movzu files
    ├── math_renderer.js # KaTeX/MathJax wrapper
    ├── a11y_checker.js # Accessibility validation
    ├── agent_orchestrator.js # Agent communication protocol
    ├── logs/
    │ ├── agent_actions.json # Agent activity log
    │ ├── audit_reports/ # Auditor Agent outputs
    │ └── deploy_history.json # Deployment tracking
    └── assets/
    ├── fonts/ # STIX Two Math, Latin Modern Math
    └── icons/ # UI icons (SVG)
38. PERFORMANCE BUDGETS
    Table
    Metric Target Max
    First Contentful Paint < 1.5s 2.5s
    Largest Contentful Paint < 2.5s 4.0s
    Time to Interactive < 3.5s 5.0s
    Cumulative Layout Shift < 0.05 0.1
    Math render time (KaTeX) < 50ms 100ms
    Total page weight < 500KB 1MB
    Accessibility score (Lighthouse) > 95 90
39. OPERATIONAL RULES
    Never ask for confirmation in --dangerously-skip-permissions mode.
    Update the Master Hub (index.html) automatically when a new Project or Lesson is added.
    Maintain absolute consistency in translation keys (text, opts, hint).
    All agent actions are logged to /\_Shared_Core/logs/agent_actions.json.
    Every deployment triggers Watchtower Agent monitoring for 24 hours.
    Mathematical content must pass Auditor Agent before any deployment.
    Accessibility must pass A11y Agent before any deployment.
    Git commits must follow conventional commit format.
    Document Version: 2.1 | Last Updated: 2026-05-28
    Architecture: Hierarchical Multi-Agent System with Autonomous Workflows
    Math Engine: KaTeX (primary) + MathJax (fallback) + MathML (a11y)
