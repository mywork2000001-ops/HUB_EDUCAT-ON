#!/usr/bin/env python3
"""
generate_p002_indexes.py
Generates math-5-class-N/index.html for all 8 chapters of P002_Math_5_Darslik.
Each chapter index is styled identically to the root P002 index.html,
showing lessons as cards instead of chapters.
"""

import json, os

ROOT = os.path.join(os.path.dirname(__file__), '..', 'P002_Math_5_Darslik')

CHAPTERS = [
    {
        "n": 1, "dir": "math-5-class-1",
        "icon": "🔢", "color": "#f97316",
        "storageKey": "math5_state",
        "az": {"num": "Fəsil 1", "title": "Natural Ədədlər",
               "sub": "Hesab, müqayisə, arifmetika, ENBÖ, EBÖQ"},
        "ru": {"num": "Глава 1", "title": "Натуральные числа",
               "sub": "Счёт, сравнение, арифметика, НОД, НОК"},
        "lessons": [
            {"file": "Lesson-1.html",  "az": "Yazılışı və oxunuşu",           "ru": "Запись и чтение"},
            {"file": "Lesson-2.html",  "az": "Müqayisə və sıralama",          "ru": "Сравнение и порядок"},
            {"file": "Lesson-3.html",  "az": "Yuvarlaqlaşdırma",              "ru": "Округление"},
            {"file": "Lesson-4.html",  "az": "Toplama və çıxma",              "ru": "Сложение и вычитание"},
            {"file": "Lesson-5.html",  "az": "Natural ədədin kvadratı, kubu", "ru": "Квадрат и куб числа"},
            {"file": "Lesson-6.html",  "az": "Vurma və bölmə",                "ru": "Умножение и деление"},
            {"file": "Lesson-7.html",  "az": "Ədədi ifadələr",                "ru": "Числовые выражения"},
            {"file": "Lesson-8.html",  "az": "Bölənlər və qatlar",            "ru": "Делители и кратные"},
            {"file": "Lesson-9.html",  "az": "ƏBOB və ƏKOB",                  "ru": "НОД и НОК"},
            {"file": "Lesson-10.html", "az": "Ümumiləşdirmə",                 "ru": "Обобщение"},
            {"file": "Lesson-11.html", "az": "Yekun dərs",                    "ru": "Итоговый урок"},
        ]
    },
    {
        "n": 2, "dir": "math-5-class-2",
        "icon": "🍕", "color": "#6366f1",
        "storageKey": "fractions5_state",
        "az": {"num": "Fəsil 2", "title": "Adi Kəsrlər",
               "sub": "Anlayış, əməliyyatlar, qarışıq ədədlər"},
        "ru": {"num": "Глава 2", "title": "Обыкновенные дроби",
               "sub": "Понятие, операции, смешанные числа"},
        "lessons": [
            {"file": "Lesson-1.html",    "az": "Kəsrin anlayışı",                "ru": "Понятие дроби"},
            {"file": "Lesson-2.html",    "az": "Kəsrlərin müqayisəsi",           "ru": "Сравнение дробей"},
            {"file": "Lesson-3.html",    "az": "Əsas xassə. Sadələşdirmə",       "ru": "Осн. свойство. Сокращение"},
            {"file": "Lesson-4.html",    "az": "Ortaq məxrəcli kəsrlər",         "ru": "Общий знаменатель"},
            {"file": "Lesson-5.html",    "az": "Toplama və çıxma",               "ru": "Сложение и вычитание"},
            {"file": "Lesson-6.1.html",  "az": "Qarışıq ədədlər",               "ru": "Смешанные числа"},
            {"file": "Lesson-6.2.html",  "az": "Adi kəsrlərin vurulması",       "ru": "Умножение дробей"},
            {"file": "Lesson-6.2-1.html","az": "Adi kəsrlərin bölünməsi",       "ru": "Деление дробей"},
            {"file": "Lesson-7.html",    "az": "Qarışıq ədədlərin bölünməsi",   "ru": "Деление смешанных"},
            {"file": "Lesson-8.html",    "az": "Ədədin hissəsini tapmaq",       "ru": "Нахождение части числа"},
            {"file": "Lesson-9.html",    "az": "Ədədi hissəsinə görə tapmaq",   "ru": "Нахождение числа по части"},
            {"file": "Lesson-10.html",   "az": "Birgə əməllər",                 "ru": "Совместные действия"},
            {"file": "Lesson-11.html",   "az": "Söz məsələləri",                "ru": "Текстовые задачи"},
            {"file": "Lesson-12.html",   "az": "Ümumiləşdirmə",                 "ru": "Обобщение"},
            {"file": "Lesson-13.html",   "az": "Yekun dərs — 1",               "ru": "Итоговый урок — 1"},
            {"file": "Lesson-14.html",   "az": "Yekun dərs — 2",               "ru": "Итоговый урок — 2"},
        ]
    },
    {
        "n": 3, "dir": "math-5-class-3",
        "icon": "🔟", "color": "#14b8a6",
        "storageKey": "decimals5_state",
        "az": {"num": "Fəsil 3", "title": "Onluq Kəsrlər",
               "sub": "Yazılış, müqayisə, bütün arifmetik əməliyyatlar"},
        "ru": {"num": "Глава 3", "title": "Десятичные дроби",
               "sub": "Запись, сравнение, все арифметические действия"},
        "lessons": [
            {"file": "Lesson-1.html",  "az": "Anlayış. Yazılış və oxunuş",    "ru": "Понятие. Запись и чтение"},
            {"file": "Lesson-2.html",  "az": "Müqayisə",                      "ru": "Сравнение"},
            {"file": "Lesson-3.html",  "az": "Onluq kəsrlərin müqayisəsi",    "ru": "Сравнение десятичных"},
            {"file": "Lesson-4.html",  "az": "Adi ↔ Onluq çevrilmə",         "ru": "Перевод обыкн. ↔ десят."},
            {"file": "Lesson-5.html",  "az": "Toplama",                        "ru": "Сложение"},
            {"file": "Lesson-6.html",  "az": "Çıxma",                          "ru": "Вычитание"},
            {"file": "Lesson-7.html",  "az": "Onluq kəsrlərin çıxılması",     "ru": "Вычитание десятичных"},
            {"file": "Lesson-8.html",  "az": "Vurma — ümumi qayda",           "ru": "Умножение — общее правило"},
            {"file": "Lesson-9.html",  "az": "× 10, 100, 1000",              "ru": "Умножение на 10, 100, 1000"},
            {"file": "Lesson-10.html", "az": "Vurma — 1",                     "ru": "Умножение — 1"},
            {"file": "Lesson-11.html", "az": "Vurma — 2",                     "ru": "Умножение — 2"},
            {"file": "Lesson-12.html", "az": "Bölmə — 1",                     "ru": "Деление — 1"},
            {"file": "Lesson-13.html", "az": "Bölmə — 2",                     "ru": "Деление — 2"},
            {"file": "Lesson-14.html", "az": "Adi kəsrə vurma/bölmə",        "ru": "Умн./дел. на обыкновенную"},
            {"file": "Lesson-15.html", "az": "Ümumiləşdirmə",                 "ru": "Обобщение"},
            {"file": "Lesson-16.html", "az": "Yekun dərs",                    "ru": "Итоговый урок"},
        ]
    },
    {
        "n": 4, "dir": "math-5-class-4",
        "icon": "💯", "color": "#f59e0b",
        "storageKey": "percentages5_state",
        "az": {"num": "Fəsil 4", "title": "Faizlər",
               "sub": "Faiz anlayışı, hesablamalar, məsələlər"},
        "ru": {"num": "Глава 4", "title": "Проценты",
               "sub": "Понятие процента, вычисления, задачи"},
        "lessons": [
            {"file": "Lesson-1.html", "az": "Faiz anlayışı",                  "ru": "Понятие процента"},
            {"file": "Lesson-2.html", "az": "Ədədin faizini tapmaq",          "ru": "Нахождение процента числа"},
            {"file": "Lesson-3.html", "az": "Ədədi faizinə görə tapmaq",      "ru": "Нахождение числа по проценту"},
            {"file": "Lesson-4.html", "az": "Faiz artımı / azalması",         "ru": "Процентное увелич. / умен."},
            {"file": "Lesson-5.html", "az": "Faizlə bağlı məsələlər — 1",   "ru": "Задачи на проценты — 1"},
            {"file": "Lesson-6.html", "az": "Faizlə bağlı məsələlər — 2",   "ru": "Задачи на проценты — 2"},
            {"file": "Lesson-7.html", "az": "Nisbət və tənasüb",              "ru": "Отношение и пропорция"},
            {"file": "Lesson-8.html", "az": "Ümumiləşdirmə",                  "ru": "Обобщение"},
            {"file": "Lesson-9.html", "az": "Yekun dərs",                     "ru": "Итоговый урок"},
        ]
    },
    {
        "n": 5, "dir": "math-5-class-5",
        "icon": "🔡", "color": "#a855f7",
        "storageKey": "equations5_state",
        "az": {"num": "Fəsil 5", "title": "İfadələr. Tənliklər. Bərabərsizliklər",
               "sub": "Dəyişənlər, sadələşdirmə, tənliklər, məsələlər"},
        "ru": {"num": "Глава 5", "title": "Выражения. Уравнения. Неравенства",
               "sub": "Переменные, упрощение, уравнения, задачи"},
        "lessons": [
            {"file": "Lesson-1.html",  "az": "Ədədi ifadə. Dəyişən",         "ru": "Числовое выражение. Переменная"},
            {"file": "Lesson-2.html",  "az": "Dəyişənli ifadə",              "ru": "Выражение с переменной"},
            {"file": "Lesson-3.html",  "az": "Tənlik anlayışı",              "ru": "Понятие уравнения"},
            {"file": "Lesson-4.html",  "az": "Sadə tənliklərin həlli",       "ru": "Решение простых уравнений"},
            {"file": "Lesson-5.html",  "az": "Mürəkkəb tənliklər",          "ru": "Сложные уравнения"},
            {"file": "Lesson-6.html",  "az": "Tənliklə məsələ həlli",       "ru": "Решение задач через уравнение"},
            {"file": "Lesson-7.html",  "az": "Bərabərsizlik anlayışı",      "ru": "Понятие неравенства"},
            {"file": "Lesson-8.html",  "az": "Bərabərsizliklərin həlli",    "ru": "Решение неравенств"},
            {"file": "Lesson-9.html",  "az": "Birgə məsələlər",             "ru": "Комплексные задачи"},
            {"file": "Lesson-10.html", "az": "Funksiya anlayışı",            "ru": "Понятие функции"},
            {"file": "Lesson-11.html", "az": "Ümumiləşdirmə",               "ru": "Обобщение"},
            {"file": "Lesson-12.html", "az": "Yekun dərs",                   "ru": "Итоговый урок"},
        ]
    },
    {
        "n": 6, "dir": "math-5-class-6",
        "icon": "📐", "color": "#10b981",
        "storageKey": "figures5_state",
        "az": {"num": "Fəsil 6", "title": "Müstəvi Fiqurlar",
               "sub": "Bucaqlar, sahələr, çerçivə, çoxbucaqlılar"},
        "ru": {"num": "Глава 6", "title": "Плоские фигуры",
               "sub": "Углы, площади, построения, многоугольники"},
        "lessons": [
            {"file": "Lesson-1.html",  "az": "Nöqtə. Xətt. Bucaq",          "ru": "Точка. Прямая. Угол"},
            {"file": "Lesson-2.html",  "az": "Bucaqların növləri",           "ru": "Виды углов"},
            {"file": "Lesson-3.html",  "az": "Üçbucaq",                      "ru": "Треугольник"},
            {"file": "Lesson-4.html",  "az": "Üçbucağın növləri",           "ru": "Виды треугольников"},
            {"file": "Lesson-5.html",  "az": "Dördbucaqlılar",              "ru": "Четырёхугольники"},
            {"file": "Lesson-6.html",  "az": "Düzbucaqlı. Perimetr",        "ru": "Прямоугольник. Периметр"},
            {"file": "Lesson-7.html",  "az": "Sahə anlayışı",               "ru": "Понятие площади"},
            {"file": "Lesson-8.html",  "az": "Dairə. Çevrə",               "ru": "Круг. Окружность"},
            {"file": "Lesson-9.html",  "az": "Ümumiləşdirmə",              "ru": "Обобщение"},
            {"file": "Lesson-10.html", "az": "Yekun dərs",                  "ru": "Итоговый урок"},
        ]
    },
    {
        "n": 7, "dir": "math-5-class-7",
        "icon": "📦", "color": "#8b5cf6",
        "storageKey": "spatial5_state",
        "az": {"num": "Fəsil 7", "title": "Fəza Fiqurları",
               "sub": "Həcm, səthi, prizmalar, silindr, konus"},
        "ru": {"num": "Глава 7", "title": "Пространственные фигуры",
               "sub": "Объём, поверхность, призмы, цилиндр, конус"},
        "lessons": [
            {"file": "Lesson-1.html",  "az": "Düzbucaqlı paralelepipped",   "ru": "Прямоугольный параллелепипед"},
            {"file": "Lesson-2.html",  "az": "Kub",                         "ru": "Куб"},
            {"file": "Lesson-3.html",  "az": "Silindr",                     "ru": "Цилиндр"},
            {"file": "Lesson-4.html",  "az": "Konus",                       "ru": "Конус"},
            {"file": "Lesson-5.html",  "az": "Kürə",                        "ru": "Шар"},
            {"file": "Lesson-6.html",  "az": "Həcm anlayışı",              "ru": "Понятие объёма"},
            {"file": "Lesson-7.html",  "az": "Həcm hesablanması — 1",      "ru": "Вычисление объёма — 1"},
            {"file": "Lesson-8.html",  "az": "Həcm hesablanması — 2",      "ru": "Вычисление объёма — 2"},
            {"file": "Lesson-9.html",  "az": "Görünüş. Kəsik",            "ru": "Проекции. Сечения"},
            {"file": "Lesson-10.html", "az": "Ümumiləşdirmə",             "ru": "Обобщение"},
            {"file": "Lesson-11.html", "az": "Yekun dərs",                 "ru": "Итоговый урок"},
        ]
    },
    {
        "n": 8, "dir": "math-5-class-8",
        "icon": "📊", "color": "#06b6d4",
        "storageKey": "statistics5_state",
        "az": {"num": "Fəsil 8", "title": "Statistika və Məlumatlar",
               "sub": "Orta ədədi, diaqramlar, məlumatın təqdimatı"},
        "ru": {"num": "Глава 8", "title": "Статистика и данные",
               "sub": "Среднее арифметическое, диаграммы, представление данных"},
        "lessons": [
            {"file": "Lesson-1.html", "az": "Orta hesabi",                  "ru": "Среднее арифметическое"},
            {"file": "Lesson-2.html", "az": "Diaqramlar — çubuq, sektor",   "ru": "Диаграммы — столбчатая, секторная"},
            {"file": "Lesson-3.html", "az": "Qrafiklər",                    "ru": "Графики"},
            {"file": "Lesson-4.html", "az": "Məlumatların toplanması",      "ru": "Сбор данных"},
            {"file": "Lesson-5.html", "az": "Yekun dərs",                   "ru": "Итоговый урок"},
        ]
    },
]


def make_html(ch):
    lessons_js = json.dumps(ch["lessons"], ensure_ascii=False, indent=4)
    chapter_js = json.dumps({
        "n":         ch["n"],
        "icon":      ch["icon"],
        "color":     ch["color"],
        "storageKey":ch["storageKey"],
        "az":        ch["az"],
        "ru":        ch["ru"],
        "total":     len(ch["lessons"]),
    }, ensure_ascii=False, indent=4)

    return f"""<!doctype html>
<html lang="az">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{ch["az"]["num"]} — {ch["az"]["title"]} · Riyaziyyat 5</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/index.min.css" />
  <style>
    :root {{
      --bg: #0f172a;
      --surface: #1e293b;
      --surface2: #273348;
      --border: #2a3f5c;
      --text: #f1f5f9;
      --muted: #64748b;
      --accent: {ch["color"]};
      --success: #22c55e;
      --sidebar-w: 230px;
      --hdr-h: 60px;
      --strip-h: 42px;
      --radius: 12px;
    }}
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html {{ scroll-behavior: smooth; }}
    body {{ font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }}

    /* TOPBAR */
    .topbar {{
      position: sticky; top: 0; z-index: 300;
      height: var(--hdr-h);
      background: rgba(15,23,42,0.96);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }}
    .topbar-inner {{
      max-width: 1440px; margin: 0 auto;
      padding: 0 1.25rem; height: 100%;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    }}
    .topbar-left {{ display: flex; align-items: center; gap: 0.75rem; }}
    .app-icon {{ font-size: 1.6rem; line-height: 1; flex-shrink: 0; }}
    .app-title {{ font-size: 1rem; font-weight: 800; letter-spacing: -0.01em; }}
    .app-sub {{ font-size: 0.68rem; color: var(--muted); margin-top: 0.1rem; }}
    .topbar-right {{ display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0; }}

    .nav-btn {{
      background: var(--surface); border: 1px solid var(--border);
      color: var(--muted); font-size: 0.78rem; font-weight: 700;
      padding: 0.38rem 0.85rem; border-radius: 8px; cursor: pointer;
      transition: all 0.15s; white-space: nowrap; font-family: inherit;
      display: flex; align-items: center; gap: 0.4rem; text-decoration: none;
    }}
    .nav-btn:hover {{ border-color: var(--accent); color: var(--accent); }}

    .lang-sw {{ display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }}
    .lang-btn {{ background: none; border: none; color: var(--muted); font-size: 0.78rem; font-weight: 700; padding: 0.32rem 0.65rem; cursor: pointer; transition: all 0.15s; font-family: inherit; }}
    .lang-btn.active {{ background: var(--accent); color: #fff; }}
    .lang-btn:hover:not(.active) {{ color: var(--text); }}

    /* PROGRESS STRIP */
    .prog-strip {{
      height: var(--strip-h);
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center;
    }}
    .prog-inner {{
      max-width: 1440px; margin: 0 auto;
      padding: 0 1.25rem;
      display: flex; align-items: center; gap: 1rem; width: 100%;
    }}
    .prog-label {{ font-size: 0.75rem; color: var(--muted); white-space: nowrap; }}
    .prog-track {{ flex: 1; max-width: 360px; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }}
    .prog-fill {{ height: 100%; background: linear-gradient(90deg, var(--accent), #818cf8); border-radius: 3px; transition: width 0.6s ease; }}
    .prog-pct {{ font-size: 0.75rem; font-weight: 700; color: var(--accent); white-space: nowrap; }}

    /* LAYOUT */
    .layout {{
      display: flex;
      max-width: 1440px; margin: 0 auto;
      min-height: calc(100vh - var(--hdr-h) - var(--strip-h));
    }}

    /* SIDEBAR */
    .sidebar {{
      width: var(--sidebar-w); flex-shrink: 0;
      position: sticky;
      top: calc(var(--hdr-h) + var(--strip-h));
      height: calc(100vh - var(--hdr-h) - var(--strip-h));
      overflow-y: auto;
      border-right: 1px solid var(--border);
      padding: 0.75rem 0;
    }}
    .sidebar::-webkit-scrollbar {{ width: 3px; }}
    .sidebar::-webkit-scrollbar-thumb {{ background: var(--border); border-radius: 2px; }}

    .snav-label {{
      font-size: 0.62rem; font-weight: 700; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.07em;
      padding: 0.85rem 1rem 0.3rem;
    }}
    .snav-item {{
      display: flex; align-items: center; gap: 0.55rem;
      padding: 0.45rem 1rem; cursor: pointer;
      border-left: 3px solid transparent;
      color: var(--muted); font-size: 0.78rem;
      text-decoration: none; transition: all 0.15s;
    }}
    .snav-item:hover {{ background: rgba(255,255,255,0.04); color: var(--text); border-left-color: rgba(99,102,241,0.4); }}
    .snav-item.active {{ background: rgba(99,102,241,0.08); color: var(--accent); border-left-color: var(--accent); }}
    .snav-num {{ font-size: 0.62rem; font-weight: 700; width: 20px; text-align: center; flex-shrink: 0; opacity: 0.7; }}
    .snav-txt {{ flex: 1; font-weight: 500; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
    .snav-check {{ font-size: 0.7rem; flex-shrink: 0; color: var(--success); }}

    /* MAIN */
    .main-content {{ flex: 1; padding: 1.5rem 1.5rem 3rem; min-width: 0; }}

    /* CHAPTER BANNER */
    .ch-banner {{
      display: flex; align-items: center; gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      border-radius: var(--radius);
      margin-bottom: 1.75rem;
    }}
    .ch-banner-ico {{ font-size: 2.2rem; flex-shrink: 0; }}
    .ch-banner-info {{ flex: 1; min-width: 0; }}
    .ch-banner-num {{ font-size: 0.68rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; }}
    .ch-banner-title {{ font-size: 1.1rem; font-weight: 800; margin-top: 0.15rem; }}
    .ch-banner-sub {{ font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem; }}
    .ch-banner-stats {{ font-size: 0.78rem; color: var(--muted); text-align: right; flex-shrink: 0; }}
    .ch-banner-stats b {{ color: var(--accent); font-weight: 700; }}

    /* LESSON GRID */
    .lesson-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.85rem;
    }}

    /* LESSON CARD */
    .lesson-card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid transparent;
      border-radius: var(--radius);
      padding: 1.15rem 1.25rem;
      text-decoration: none; color: var(--text);
      display: block;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }}
    .lesson-card:hover {{
      transform: translateY(-2px);
      background: var(--surface2);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }}
    .lesson-card.done {{ border-left-color: var(--success); }}
    .lesson-card.active {{ border-left-color: var(--accent); }}

    .lc-top {{ display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }}
    .lc-num-badge {{
      width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 800;
      background: rgba(255,255,255,0.06); color: var(--muted);
      border: 1px solid var(--border);
    }}
    .lc-num-badge.done {{ background: rgba(34,197,94,0.12); color: var(--success); border-color: rgba(34,197,94,0.3); }}
    .lc-num-badge.active {{ background: rgba(255,255,255,0.08); color: var(--accent); border-color: var(--accent); }}

    .lc-body {{ flex: 1; min-width: 0; }}
    .lc-label {{ font-size: 0.62rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.18rem; }}
    .lc-title {{ font-size: 0.88rem; font-weight: 700; line-height: 1.4; }}
    .lc-status {{ font-size: 0.7rem; color: var(--muted); margin-top: 0.18rem; }}
    .lc-status.done {{ color: var(--success); }}
    .lc-status.active {{ color: var(--accent); }}

    .lc-ico {{ font-size: 1rem; flex-shrink: 0; }}

    .lc-btn {{
      display: block; width: 100%; font-family: inherit; font-size: 0.78rem; font-weight: 600;
      padding: 0.42rem; border-radius: 7px; cursor: pointer; transition: all 0.15s;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: var(--muted);
      text-align: center; text-decoration: none; margin-top: 0.75rem;
    }}
    .lesson-card:hover .lc-btn,
    .lc-btn:hover {{
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }}
    .lc-btn.done {{
      background: rgba(34,197,94,0.08);
      border-color: rgba(34,197,94,0.25);
      color: var(--success);
    }}
    .lc-btn.done:hover {{ background: var(--success); color: #fff; border-color: var(--success); }}

    /* TOAST */
    .toast {{
      position: fixed; bottom: 1.5rem; left: 50%;
      transform: translateX(-50%) translateY(72px);
      background: var(--surface2); border: 1px solid var(--border);
      color: var(--text); font-size: 0.82rem; font-weight: 600;
      padding: 0.55rem 1.2rem; border-radius: 999px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35); z-index: 900;
      transition: transform 0.28s, opacity 0.28s; opacity: 0; pointer-events: none; white-space: nowrap;
    }}
    .toast.show {{ transform: translateX(-50%) translateY(0); opacity: 1; }}

    @media (max-width: 860px) {{
      .sidebar {{ display: none; }}
      .main-content {{ padding: 1rem 1rem 3rem; }}
    }}
    @media (max-width: 500px) {{
      .lesson-grid {{ grid-template-columns: 1fr; }}
      .app-sub {{ display: none; }}
    }}
  </style>
</head>
<body>

  <!-- TOPBAR -->
  <header class="topbar">
    <div class="topbar-inner">
      <div class="topbar-left">
        <span class="app-icon">{ch["icon"]}</span>
        <div>
          <div class="app-title" id="appTitle"></div>
          <div class="app-sub" id="appSub">Riyaziyyat 5 · {len(ch["lessons"])} dərs</div>
        </div>
      </div>
      <div class="topbar-right">
        <div class="lang-sw">
          <button class="lang-btn active" id="lbAZ" onclick="setLang('az')">AZ</button>
          <button class="lang-btn" id="lbRU" onclick="setLang('ru')">RU</button>
        </div>
        <a href="../index.html" class="nav-btn">← <span id="backTxt">Geri</span></a>
      </div>
    </div>
  </header>

  <!-- PROGRESS STRIP -->
  <div class="prog-strip">
    <div class="prog-inner">
      <span class="prog-label" id="progLabel">–</span>
      <div class="prog-track"><div class="prog-fill" id="progFill" style="width:0%"></div></div>
      <span class="prog-pct" id="progPct">0%</span>
    </div>
  </div>

  <!-- LAYOUT -->
  <div class="layout">
    <aside class="sidebar"><nav id="sidebarNav"></nav></aside>
    <main class="main-content">
      <div class="ch-banner">
        <span class="ch-banner-ico">{ch["icon"]}</span>
        <div class="ch-banner-info">
          <div class="ch-banner-num" id="bannerNum"></div>
          <div class="ch-banner-title" id="bannerTitle"></div>
          <div class="ch-banner-sub" id="bannerSub"></div>
        </div>
        <div class="ch-banner-stats" id="bannerStats"></div>
      </div>
      <div class="lesson-grid" id="lessonGrid"></div>
    </main>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const CHAPTER = {chapter_js};
    const LESSONS = {lessons_js};

    const UI = {{
      az: {{
        back:       'Geri',
        progOf:     (c, t) => `${{c}} / ${{t}} dərs tamamlandı`,
        doneStats:  (c, t) => `<b>${{c}}</b> / ${{t}} tamamlandı`,
        btnStart:   '▶ Başla',
        btnCont:    '▶ Davam et',
        btnRepeat:  '↺ Təkrarla',
        dərs:       'Dərs',
        done:       'Tamamlandı ✓',
        inProg:     'Davam edir',
        notStarted: 'Başlanmamış',
      }},
      ru: {{
        back:       'Назад',
        progOf:     (c, t) => `${{c}} / ${{t}} уроков завершено`,
        doneStats:  (c, t) => `<b>${{c}}</b> / ${{t}} завершено`,
        btnStart:   '▶ Начать',
        btnCont:    '▶ Продолжить',
        btnRepeat:  '↺ Повторить',
        dərs:       'Урок',
        done:       'Завершён ✓',
        inProg:     'В процессе',
        notStarted: 'Не начат',
      }},
    }};

    let lang = localStorage.getItem('p002_lang') || 'az';
    const u = () => UI[lang];

    function loadStars() {{
      try {{
        const raw = localStorage.getItem(CHAPTER.storageKey);
        if (raw) {{
          const s = JSON.parse(raw);
          const stars = Array.isArray(s.stars) ? s.stars : [];
          while (stars.length < CHAPTER.total) stars.push(0);
          return stars.slice(0, CHAPTER.total);
        }}
      }} catch(e) {{}}
      return new Array(CHAPTER.total).fill(0);
    }}

    function getDone(stars) {{ return stars.filter(s => s > 0).length; }}

    function render() {{
      const stars = loadStars();
      const done = getDone(stars);
      const total = CHAPTER.total;
      const pct = total > 0 ? Math.round(done / total * 100) : 0;

      // Topbar
      document.getElementById('appTitle').textContent = CHAPTER[lang].num + ' — ' + CHAPTER[lang].title;
      document.getElementById('backTxt').textContent = u().back;

      // Progress strip
      document.getElementById('progLabel').textContent = u().progOf(done, total);
      document.getElementById('progFill').style.width = pct + '%';
      document.getElementById('progPct').textContent = pct + '%';

      // Lang buttons
      document.getElementById('lbAZ').classList.toggle('active', lang === 'az');
      document.getElementById('lbRU').classList.toggle('active', lang === 'ru');
      document.documentElement.lang = lang;

      // Banner
      document.getElementById('bannerNum').textContent   = CHAPTER[lang].num;
      document.getElementById('bannerTitle').textContent = CHAPTER[lang].title;
      document.getElementById('bannerSub').textContent   = CHAPTER[lang].sub;
      document.getElementById('bannerStats').innerHTML   = u().doneStats(done, total);

      // Sidebar
      const nav = document.getElementById('sidebarNav');
      nav.innerHTML = `<div class="snav-label">${{lang === 'az' ? 'Dərslər' : 'Уроки'}}</div>`;
      LESSONS.forEach((les, i) => {{
        const isDone = stars[i] > 0;
        const a = document.createElement('a');
        a.className = 'snav-item' + (isDone ? ' done' : '');
        a.href = les.file;
        a.innerHTML = `
          <span class="snav-num">${{i + 1}}</span>
          <span class="snav-txt">${{les[lang]}}</span>
          ${{isDone ? '<span class="snav-check">✓</span>' : ''}}
        `;
        nav.appendChild(a);
      }});

      // Lesson grid
      const grid = document.getElementById('lessonGrid');
      grid.innerHTML = '';
      LESSONS.forEach((les, i) => {{
        const isDone   = stars[i] > 0;
        const isActive = i === done && !isDone && done < total;
        const n = i + 1;

        let cardCls = 'lesson-card';
        if (isDone)        cardCls += ' done';
        else if (isActive) cardCls += ' active';

        let badgeCls = 'lc-num-badge';
        if (isDone)        badgeCls += ' done';
        else if (isActive) badgeCls += ' active';

        let statusTxt, statusCls, btnTxt, btnCls;
        if (isDone) {{
          statusTxt = u().done;       statusCls = 'done';
          btnTxt    = u().btnRepeat;  btnCls    = 'lc-btn done';
        }} else if (isActive) {{
          statusTxt = u().inProg;     statusCls = 'active';
          btnTxt    = u().btnCont;    btnCls    = 'lc-btn';
        }} else {{
          statusTxt = u().notStarted; statusCls = '';
          btnTxt    = u().btnStart;   btnCls    = 'lc-btn';
        }}

        const a = document.createElement('a');
        a.className = cardCls;
        a.href = les.file;
        a.innerHTML = `
          <div class="lc-top">
            <div class="${{badgeCls}}">${{n}}</div>
            <div class="lc-body">
              <div class="lc-label">${{u().dərs}} ${{n}}</div>
              <div class="lc-title">${{les[lang]}}</div>
              <div class="lc-status ${{statusCls}}">${{statusTxt}}</div>
            </div>
            <span class="lc-ico">${{isDone ? '✅' : isActive ? '▶' : ''}}</span>
          </div>
          <span class="${{btnCls}}">${{btnTxt}}</span>
        `;
        grid.appendChild(a);
      }});

      // Animate bars after paint
      setTimeout(() => {{
        document.querySelectorAll('[data-bar-w]').forEach(el => {{
          el.style.width = el.dataset.barW + '%';
        }});
      }}, 100);
    }}

    function setLang(l) {{
      lang = l;
      localStorage.setItem('p002_lang', l);
      render();
    }}

    // Sync when returning from lesson
    window.addEventListener('storage', render);
    window.addEventListener('pageshow', render);

    render();
  </script>
</body>
</html>
"""


def main():
    generated = 0
    for ch in CHAPTERS:
        html = make_html(ch)
        out_path = os.path.join(ROOT, ch["dir"], "index.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  ✓ {ch['dir']}/index.html — {ch['az']['title']} ({len(ch['lessons'])} dərs)")
        generated += 1

    print(f"\n✅ {generated} chapter index.html generated.")


if __name__ == "__main__":
    main()
