#!/usr/bin/env python3
"""
Generate DİM 2025 test HTML files from extracted JSON question banks.
Usage: python generate_dim_tests.py
Output: app/public/lessons/tests/dim-*.html
"""
import json, os, re, sys

# ── Config ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, 'app', 'public', 'lessons', 'tests')
JSON_FILES_P1 = [
    'C:/Temp/dim_p1_extract_s1to4.json',
    'C:/Temp/dim_p1_extract_s5to8.json',
    'C:/Temp/dim_p1_extract_s9to13.json',
    'C:/Temp/dim_p1_extract_s14to17.json',
]
JSON_FILES_P2 = [
    'C:/Temp/dim_p2_extract_s1to6.json',
    'C:/Temp/dim_p2_extract_s7to11.json',
    'C:/Temp/dim_p2_extract_s12to17.json',
]
JSON_FILES = JSON_FILES_P1 + JSON_FILES_P2

# ── Section metadata (for tests.ts entries) ──────────────────────────────────
SECTION_META = {
    # Part 1
    'section_1':  {'slug': 'dim-natural-ededler',   'title_az': 'Natural ədədlər',           'title_ru': 'Натуральные числа',                    'title_en': 'Natural Numbers',              'diff': 1, 'time': 25},
    'section_2':  {'slug': 'dim-kesrler',            'title_az': 'Adi və onluq kəsrlər',       'title_ru': 'Обыкновенные и десятичные дроби',       'title_en': 'Fractions',                    'diff': 1, 'time': 25},
    'section_3':  {'slug': 'dim-faiz-nisbat',        'title_az': 'Faiz. Nisbət. Tənasüb',      'title_ru': 'Проценты. Отношение. Пропорция',        'title_en': 'Percent, Ratio, Proportion',    'diff': 2, 'time': 30},
    'section_4':  {'slug': 'dim-heqiqi-ededler',     'title_az': 'Həqiqi ədədlər',             'title_ru': 'Действительные числа',                 'title_en': 'Real Numbers',                 'diff': 2, 'time': 25},
    'section_5':  {'slug': 'dim-cebri-ifadeler',     'title_az': 'Tam cəbri ifadələr',          'title_ru': 'Целые алгебраические выражения',        'title_en': 'Algebraic Expressions',        'diff': 2, 'time': 25},
    'section_6':  {'slug': 'dim-vuruqlara-ayirma',   'title_az': 'Çoxhədlinin vuruqlara ayrılması', 'title_ru': 'Разложение многочлена на множители', 'title_en': 'Factoring Polynomials',        'diff': 2, 'time': 25},
    'section_7':  {'slug': 'dim-rasional-kesrler',   'title_az': 'Rasional kəsrlər',            'title_ru': 'Рациональные дроби',                   'title_en': 'Rational Fractions',           'diff': 2, 'time': 25},
    'section_8':  {'slug': 'dim-kvadrat-kokler',     'title_az': 'Kvadrat köklər. Üstlü qüvvət', 'title_ru': 'Квадратные корни. Степени',           'title_en': 'Square Roots, Powers',         'diff': 2, 'time': 25},
    'section_9':  {'slug': 'dim-tənliklər',          'title_az': 'Birməchullu tənliklər',       'title_ru': 'Уравнения с одним неизвестным',         'title_en': 'Equations',                    'diff': 2, 'time': 30},
    'section_10': {'slug': 'dim-tenlikler-sistemi',  'title_az': 'Tənliklər sistemi',           'title_ru': 'Системы уравнений',                    'title_en': 'Systems of Equations',         'diff': 2, 'time': 30},
    'section_11': {'slug': 'dim-berabersizlikler',   'title_az': 'Bərabərsizliklər',            'title_ru': 'Неравенства',                          'title_en': 'Inequalities',                 'diff': 3, 'time': 30},
    'section_12': {'slug': 'dim-ardıcıllıqlar',      'title_az': 'Ardıcıllıqlar. Silsilələr',   'title_ru': 'Последовательности. Прогрессии',        'title_en': 'Sequences & Series',           'diff': 2, 'time': 30},
    'section_13': {'slug': 'dim-coxluqlar',          'title_az': 'Çoxluqlar',                   'title_ru': 'Множества',                            'title_en': 'Sets',                         'diff': 1, 'time': 20},
    'section_14': {'slug': 'dim-hendese-esaslari',   'title_az': 'Həndəsənin əsas anlayışları', 'title_ru': 'Основные понятия геометрии',           'title_en': 'Geometry Basics',              'diff': 1, 'time': 25},
    'section_15': {'slug': 'dim-ucbucaqlar',         'title_az': 'Üçbucaqlar',                  'title_ru': 'Треугольники',                         'title_en': 'Triangles',                    'diff': 2, 'time': 30},
    'section_16': {'slug': 'dim-coxbucaqlılar',      'title_az': 'Çoxbucaqlılar. Dördbucaqlılar', 'title_ru': 'Многоугольники. Четырёхугольники',  'title_en': 'Polygons, Quadrilaterals',      'diff': 2, 'time': 30},
    'section_17': {'slug': 'dim-cevre-daire',        'title_az': 'Çevrə və dairə',              'title_ru': 'Окружность и круг',                    'title_en': 'Circle',                       'diff': 2, 'time': 30},
    'section_18': {'slug': 'dim-situasiya-1',        'title_az': 'Situasiya məsələləri (I hissə)', 'title_ru': 'Ситуационные задачи (часть I)',      'title_en': 'Situational Problems (Part I)', 'diff': 3, 'time': 35},
    'section_exam1': {'slug': 'dim-qebul-2025-may', 'title_az': 'Qəbul imtahanı — 25 May 2025', 'title_ru': 'Вступительный экзамен 25 мая 2025',   'title_en': 'Entrance Exam May 2025',       'diff': 3, 'time': 40},
    # Part 2
    'section_1p2':  {'slug': 'dim-funksiyalar',       'title_az': 'Funksiyalar və qrafiklər',    'title_ru': 'Функции и графики',                    'title_en': 'Functions & Graphs',           'diff': 2, 'time': 30},
    'section_2p2':  {'slug': 'dim-triq-funksiyalar',  'title_az': 'Triqonometrik funksiyalar',   'title_ru': 'Тригонометрические функции',           'title_en': 'Trigonometric Functions',      'diff': 2, 'time': 30},
    'section_3p2':  {'slug': 'dim-toplama-teoremi',   'title_az': 'Triqonometrik toplama teoremi', 'title_ru': 'Теоремы сложения. Двойной угол',    'title_en': 'Sum/Double Angle Formulas',     'diff': 3, 'time': 30},
    'section_4p2':  {'slug': 'dim-triq-tenlikler',    'title_az': 'Triqonometrik tənliklər',     'title_ru': 'Тригонометрические уравнения',         'title_en': 'Trigonometric Equations',      'diff': 3, 'time': 30},
    'section_5p2':  {'slug': 'dim-ustlu-loq-funk',    'title_az': 'Üstlü və loqarifmik funksiyalar', 'title_ru': 'Показательные и логарифмические функции', 'title_en': 'Exp & Log Functions',    'diff': 2, 'time': 30},
    'section_6p2':  {'slug': 'dim-ustlu-loq-tenlik',  'title_az': 'Üstlü, loqarifmik tənliklər', 'title_ru': 'Показательные/логарифмические уравнения', 'title_en': 'Exp/Log Equations',        'diff': 3, 'time': 30},
    'section_7p2':  {'slug': 'dim-limit',             'title_az': 'Ardıcıllığın limiti. Funksiyanın limiti', 'title_ru': 'Предел последовательности и функции', 'title_en': 'Limits',              'diff': 3, 'time': 30},
    'section_8p2':  {'slug': 'dim-toreme',            'title_az': 'Törəmə və tətbiqləri',        'title_ru': 'Производная и её применение',          'title_en': 'Derivative & Applications',    'diff': 3, 'time': 30},
    'section_9p2':  {'slug': 'dim-inteqral',          'title_az': 'İbtidai funksiya və inteqral', 'title_ru': 'Первообразная и интеграл',            'title_en': 'Antiderivative & Integral',     'diff': 3, 'time': 30},
    'section_10p2': {'slug': 'dim-kompleks',          'title_az': 'Kompleks ədədlər',             'title_ru': 'Комплексные числа',                    'title_en': 'Complex Numbers',              'diff': 3, 'time': 20},
    'section_11p2': {'slug': 'dim-ehtimal-stat',      'title_az': 'Birləşmələr. Ehtimal. Statistika', 'title_ru': 'Комбинаторика. Вероятность. Статистика', 'title_en': 'Combinatorics, Probability, Statistics', 'diff': 2, 'time': 30},
    'section_12p2': {'slug': 'dim-fiqurlarin-sahesi', 'title_az': 'Fiqurların sahəsi',            'title_ru': 'Площадь фигур',                        'title_en': 'Area of Figures',              'diff': 2, 'time': 30},
    'section_13p2': {'slug': 'dim-oxsarliq',          'title_az': 'Hərəkət. Oxşarlıq',           'title_ru': 'Движение. Подобие',                    'title_en': 'Motion & Similarity',          'diff': 2, 'time': 25},
    'section_14p2': {'slug': 'dim-vektorlar',         'title_az': 'Vektorlar. Koordinatlar metodu', 'title_ru': 'Векторы. Метод координат',           'title_en': 'Vectors & Coordinates',        'diff': 2, 'time': 30},
    'section_15p2': {'slug': 'dim-feza-hendese',      'title_az': 'Fəzada xəttlər və müstəvilər', 'title_ru': 'Прямые и плоскости в пространстве', 'title_en': 'Lines & Planes in Space',       'diff': 3, 'time': 30},
    'section_16p2': {'slug': 'dim-coxuzluler',        'title_az': 'Çoxüzlülər, səthi, həcmi',    'title_ru': 'Многогранники, поверхность, объём',    'title_en': 'Polyhedra, Surface, Volume',    'diff': 3, 'time': 30},
    'section_17p2': {'slug': 'dim-firlanma',          'title_az': 'Fırlanma cisimləri',           'title_ru': 'Тела вращения',                        'title_en': 'Solids of Revolution',         'diff': 3, 'time': 30},
    'section_18p2': {'slug': 'dim-situasiya-2',       'title_az': 'Situasiya məsələləri (II hissə)', 'title_ru': 'Ситуационные задачи (часть II)',    'title_en': 'Situational Problems (Part II)', 'diff': 3, 'time': 35},
    'section_19p2': {'slug': 'dim-isbat',             'title_az': 'İsbat məsələləri',             'title_ru': 'Задачи на доказательство',             'title_en': 'Proof Problems',               'diff': 3, 'time': 25},
    'section_exam2': {'slug': 'dim-qebul-2025',       'title_az': 'Qəbul imtahanı — 2025',       'title_ru': 'Вступительный экзамен 2025',           'title_en': 'Entrance Exam 2025',           'diff': 3, 'time': 45},
}

# Part 2 sections in JSON files are named section_1..section_5 but need p2 suffix
# Mapping: json key -> meta key
KEY_MAP_P2 = {
    'section_1': 'section_1p2',
    'section_2': 'section_2p2',
    'section_3': 'section_3p2',
    'section_4': 'section_4p2',
    'section_5': 'section_5p2',
    'section_6': 'section_6p2',
    'section_7': 'section_7p2',
    'section_8': 'section_8p2',
    'section_9': 'section_9p2',
    'section_10': 'section_10p2',
    'section_11': 'section_11p2',
    'section_12': 'section_12p2',
    'section_13': 'section_13p2',
    'section_14': 'section_14p2',
    'section_15': 'section_15p2',
    'section_16': 'section_16p2',
    'section_17': 'section_17p2',
    'section_18': 'section_18p2',
    'section_19': 'section_19p2',
    'section_exam2': 'section_exam2',
}

def clean_option(opt):
    """Remove leading 'A) ', 'B) ' etc. prefixes from options."""
    return re.sub(r'^[A-E]\)\s*', '', str(opt)).strip()

def escape_html(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def html_test(test_id, title_az, questions, time_minutes, accent_color='#f97316'):
    """Generate a complete standalone HTML test file."""
    qs_js = json.dumps(questions, ensure_ascii=False)
    return f'''<!DOCTYPE html>
<html lang="az">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{escape_html(title_az)}</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh}}
.exam-header{{background:#1e293b;border-bottom:1px solid #334155;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}}
.exam-title{{font-weight:700;font-size:13px;color:{accent_color}}}
.timer{{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;background:#0f172a;padding:4px 12px;border-radius:8px;border:1px solid #334155;color:#e2e8f0}}
.timer.warn{{color:{accent_color}}}.timer.danger{{color:#ef4444;animation:pulse 1s infinite}}
@keyframes pulse{{0%,100%{{opacity:1}}50%{{opacity:.4}}}}
.prog-bar{{height:4px;background:#1e293b}}
.prog-fill{{height:100%;background:{accent_color};transition:width .3s}}
.body{{max-width:700px;margin:0 auto;padding:24px 16px}}
.start{{text-align:center;padding:36px 20px}}
.start h2{{font-size:22px;font-weight:800;color:{accent_color};margin-bottom:8px}}
.start p{{color:#94a3b8;font-size:13px;margin-bottom:18px}}
.info-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}}
.info-card{{background:#1e293b;border-radius:10px;padding:12px;text-align:center}}
.info-card .val{{font-size:22px;font-weight:800;color:{accent_color}}}
.info-card .lbl{{font-size:10px;color:#94a3b8;margin-top:2px}}
.note{{font-size:11px;color:#475569;margin-bottom:20px}}
.q-panel{{display:none}}
.q-counter{{font-size:11px;color:#94a3b8;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between}}
.q-text{{font-size:15px;line-height:1.65;font-weight:500;margin-bottom:20px;color:#f1f5f9}}
.options{{display:flex;flex-direction:column;gap:9px}}
.opt{{background:#1e293b;border:1.5px solid #334155;border-radius:10px;padding:11px 15px;text-align:left;cursor:pointer;transition:all .15s;font-size:13px;color:#e2e8f0;display:flex;align-items:center;gap:11px;width:100%}}
.opt:hover{{background:rgba(249,115,22,.08);border-color:rgba(249,115,22,.4)}}
.opt.sel{{border-color:{accent_color};background:rgba(249,115,22,.1);font-weight:600}}
.opt.sel .opt-lbl{{background:{accent_color};color:#0f172a}}
.opt-lbl{{width:24px;height:24px;background:#334155;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}}
.nav{{display:flex;gap:8px;margin-top:20px;flex-wrap:wrap}}
.btn{{padding:9px 18px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:600;transition:all .15s}}
.btn-outline{{background:transparent;border:1.5px solid #475569;color:#94a3b8}}
.btn-outline:hover{{border-color:#94a3b8;color:#e2e8f0}}
.btn-primary{{background:{accent_color};color:#0f172a}}
.btn-primary:hover{{filter:brightness(1.1)}}
.q-dots{{display:flex;flex-wrap:wrap;gap:4px;margin-top:14px}}
.dot{{width:20px;height:20px;border-radius:4px;background:#1e293b;border:1px solid #334155;font-size:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#64748b;transition:all .1s}}
.dot.done{{background:rgba(249,115,22,.15);border-color:{accent_color};color:{accent_color};font-weight:700}}
.dot.current{{background:{accent_color};color:#0f172a;font-weight:700}}
.result{{display:none;text-align:center;padding:28px 20px}}
.score-ring{{width:120px;height:120px;border-radius:50%;border:10px solid #1e293b;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;position:relative}}
.score-ring::before{{content:'';position:absolute;inset:-10px;border-radius:50%;background:conic-gradient({accent_color} calc(var(--p,0)*1%),#1e293b 0);z-index:-1}}
.res-title{{font-size:20px;font-weight:800;margin-bottom:6px}}
.res-sub{{color:#94a3b8;font-size:13px;margin-bottom:18px}}
.res-actions{{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}}
.review{{text-align:left;margin-top:24px;display:flex;flex-direction:column;gap:7px}}
.ri{{background:#1e293b;border-radius:8px;padding:11px 13px;border-left:4px solid}}
.ri.ok{{border-color:#22c55e}}.ri.ng{{border-color:#ef4444}}
.rq{{font-size:12px;color:#cbd5e1;margin-bottom:4px}}
.ra{{font-size:11px;margin-bottom:2px}}
.ra .ok-a{{color:#22c55e}}.ra .ng-a{{color:#ef4444}}
.re{{font-size:10px;color:#64748b;margin-top:2px}}
.hidden{{display:none!important}}
@media(max-width:480px){{.info-grid{{grid-template-columns:1fr 1fr}}.q-text{{font-size:13px}}}}
</style>
</head>
<body>
<div class="exam-header hidden" id="hdr">
  <div class="exam-title">📝 DİM 2025 — {escape_html(title_az)}</div>
  <div class="timer" id="tmr">{time_minutes:02d}:00</div>
</div>
<div class="prog-bar"><div class="prog-fill" id="pg" style="width:0%"></div></div>
<div class="body">
  <div class="start" id="start">
    <h2>{escape_html(title_az)}</h2>
    <p>DİM 2025 Riyaziyyat Test Toplusu əsasında hazırlanmışdır</p>
    <div class="info-grid">
      <div class="info-card"><div class="val" id="qcount">?</div><div class="lbl">Sual sayı</div></div>
      <div class="info-card"><div class="val">{time_minutes}</div><div class="lbl">Dəqiqə</div></div>
      <div class="info-card"><div class="val">5</div><div class="lbl">Variant (A–E)</div></div>
    </div>
    <p class="note">DİM 2025 test toplusundan orijinal suallar. Hər düzgün cavab 1 xal.</p>
    <button class="btn btn-primary" style="font-size:14px;padding:11px 28px" onclick="startTest()">Testi Başla →</button>
  </div>
  <div class="q-panel" id="qp">
    <div class="q-counter"><span id="qc">Sual 1 / ?</span><span id="qa-count" style="color:{accent_color};font-weight:600"></span></div>
    <div class="q-text" id="qt"></div>
    <div class="options" id="opts"></div>
    <div class="nav">
      <button class="btn btn-outline" id="bp" onclick="prevQ()" style="visibility:hidden">← Əvvəlki</button>
      <button class="btn btn-primary" id="bn" onclick="nextQ()">Növbəti →</button>
      <button class="btn btn-outline" onclick="finishTest()" style="margin-left:auto">Bitir ✓</button>
    </div>
    <div class="q-dots" id="dots"></div>
  </div>
  <div class="result" id="res">
    <div class="score-ring" id="ring"><span id="rpct">0%</span></div>
    <div class="res-title" id="rtitle"></div>
    <div class="res-sub" id="rsub"></div>
    <div class="res-actions">
      <button class="btn btn-primary" onclick="restartTest()">Yenidən başla</button>
      <button class="btn btn-outline" onclick="toggleReview()">📋 Analiz</button>
    </div>
    <div class="review hidden" id="rev"></div>
  </div>
</div>
<script>
const TEST_ID='{test_id}';
const TIME_LIMIT={time_minutes}*60;
const QS={qs_js};
const LABELS=['A','B','C','D','E'];
let idx=0,ans=[],elapsed=0,timeLeft=TIME_LIMIT,tmrId=null;
document.getElementById('qcount').textContent=QS.length;
function startTest(){{
  ans=new Array(QS.length).fill(-1);
  document.getElementById('start').classList.add('hidden');
  document.getElementById('qp').style.display='block';
  document.getElementById('hdr').classList.remove('hidden');
  buildDots();renderQ();
  tmrId=setInterval(tick,1000);
}}
function tick(){{
  elapsed++;timeLeft--;
  const m=Math.floor(timeLeft/60),s=timeLeft%60;
  const el=document.getElementById('tmr');
  el.textContent=pad(m)+':'+pad(s);
  el.className='timer'+(timeLeft<=60?' danger':timeLeft<=180?' warn':'');
  if(timeLeft<=0){{clearInterval(tmrId);showResult();}}
}}
function pad(n){{return String(n).padStart(2,'0')}}
function buildDots(){{
  document.getElementById('dots').innerHTML=QS.map((_,i)=>`<div class="dot" id="d${{i}}" onclick="goQ(${{i}})">${{i+1}}</div>`).join('');
}}
function updateDots(){{
  QS.forEach((_,i)=>{{const d=document.getElementById('d'+i);d.className='dot'+(i===idx?' current':ans[i]>=0?' done':'');}});
}}
function renderQ(){{
  const q=QS[idx];
  document.getElementById('qc').textContent=`Sual ${{idx+1}} / ${{QS.length}}`;
  document.getElementById('qa-count').textContent=`${{ans.filter(a=>a>=0).length}} cavablandı`;
  document.getElementById('qt').innerHTML=q.q;
  document.getElementById('opts').innerHTML=q.o.map((o,i)=>
    `<button class="opt${{ans[idx]===i?' sel':''}}" onclick="selectOpt(${{i}})"><span class="opt-lbl">${{LABELS[i]}}</span>${{o}}</button>`
  ).join('');
  document.getElementById('pg').style.width=((idx+1)/QS.length*100)+'%';
  document.getElementById('bp').style.visibility=idx>0?'visible':'hidden';
  document.getElementById('bn').textContent=idx===QS.length-1?'Son sual':'Növbəti →';
  updateDots();
}}
function selectOpt(i){{ans[idx]=i;document.querySelectorAll('.opt').forEach((b,j)=>b.classList.toggle('sel',j===i));updateDots();}}
function prevQ(){{if(idx>0){{idx--;renderQ();}}}}
function nextQ(){{if(idx<QS.length-1){{idx++;renderQ();}}}}
function goQ(i){{idx=i;renderQ();}}
function finishTest(){{
  const u=ans.filter(a=>a<0).length;
  if(u>0&&!confirm(`${{u}} sual cavabsız qalıb. Testi bitirmək istəyirsiniz?`))return;
  clearInterval(tmrId);showResult();
}}
function showResult(){{
  document.getElementById('qp').style.display='none';
  document.getElementById('hdr').classList.add('hidden');
  document.getElementById('res').style.display='block';
  const correct=ans.reduce((acc,a,i)=>acc+(a===QS[i].a?1:0),0);
  const pct=Math.round(correct/QS.length*100);
  document.getElementById('ring').style.setProperty('--p',pct);
  document.getElementById('rpct').textContent=pct+'%';
  document.getElementById('rtitle').textContent=pct>=90?'🏆 Əla!':pct>=70?'✅ Yaxşı!':pct>=50?'📈 Orta':'💪 Davam et!';
  document.getElementById('rsub').textContent=`${{correct}} / ${{QS.length}} düzgün · ${{pct}}% · ${{Math.floor(elapsed/60)}}:${{pad(elapsed%60)}} vaxt`;
  try{{
    const p={{itemId:TEST_ID,points:correct,maxPoints:QS.length,timeSpentSeconds:elapsed}};
    window.parent.postMessage({{type:'SCORE_UPDATE',payload:p}},'*');
    if(pct>=50)window.parent.postMessage({{type:'LESSON_COMPLETE',payload:p}},'*');
  }}catch(e){{}}
}}
function toggleReview(){{
  const rev=document.getElementById('rev');
  if(!rev.classList.contains('hidden')){{rev.classList.add('hidden');return;}}
  rev.classList.remove('hidden');
  rev.innerHTML=QS.map((q,i)=>{{
    const ok=ans[i]===q.a;
    const my=ans[i]>=0?LABELS[ans[i]]+') '+q.o[ans[i]]:'Cavabsız';
    return `<div class="ri ${{ok?'ok':'ng'}}"><div class="rq">${{i+1}}. ${{q.q}}</div><div class="ra">${{!ok?`<span class="ng-a">Cavabınız: ${{my}}</span> &nbsp;·&nbsp; `:''}}  <span class="ok-a">Düzgün: ${{LABELS[q.a]}}) ${{q.o[q.a]}}</span></div>${{q.e?`<div class="re">💡 ${{q.e}}</div>`:''}}</div>`;
  }}).join('');
  rev.scrollIntoView({{behavior:'smooth'}});
}}
function restartTest(){{
  clearInterval(tmrId);elapsed=0;timeLeft=TIME_LIMIT;idx=0;
  document.getElementById('res').style.display='none';
  document.getElementById('start').classList.remove('hidden');
}}
</script>
</body>
</html>'''

def clean_questions(qs):
    """Clean option prefixes and validate questions."""
    cleaned = []
    for q in qs:
        if not q.get('q') or not q.get('o'):
            continue
        opts = [clean_option(o) for o in q['o']]
        if len(opts) < 4:
            continue  # skip malformed
        # Ensure 5 options
        while len(opts) < 5:
            opts.append('')
        a = q.get('a', -1)
        if not isinstance(a, int) or a < 0 or a >= len(opts):
            continue  # skip if no valid answer
        cleaned.append({
            'q': q['q'].strip(),
            'o': opts,
            'a': a,
            'e': q.get('e', '').strip()
        })
    return cleaned

def normalize_question(q):
    """Normalize question dict to internal format {q, o, a, e}."""
    # Support both formats: {q,o,a,e} and {text,opts,ans}
    text = q.get('q') or q.get('text', '')
    opts = q.get('o') or q.get('opts', [])
    ans  = q.get('a')
    if ans is None:
        ans = q.get('ans', -1)
    exp  = q.get('e') or q.get('explanation', '')
    return {'q': str(text).strip(), 'o': opts, 'a': ans, 'e': str(exp).strip()}

def load_all_data():
    """Load and merge all JSON question files."""
    merged = {}

    for jf in JSON_FILES:
        if not os.path.exists(jf):
            print(f"  ⚠️  Not found: {jf}")
            continue
        try:
            with open(jf, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"  ⚠️  Error reading {jf}: {e}")
            continue

        is_p2 = '_p2_' in jf
        print(f"  Loading {os.path.basename(jf)} ({'Part2' if is_p2 else 'Part1'})")

        for key, sec_data in data.items():
            if is_p2:
                meta_key = KEY_MAP_P2.get(key, key)
            else:
                meta_key = key

            # sec_data can be a list (new format) or a dict with 'questions' key
            if isinstance(sec_data, list):
                questions_raw = sec_data
            else:
                questions_raw = sec_data.get('questions', [])

            questions_norm = [normalize_question(q) for q in questions_raw]

            if meta_key not in merged:
                merged[meta_key] = {'questions': []}
            merged[meta_key]['questions'].extend(questions_norm)
            print(f"    {key} → {meta_key}: {len(questions_norm)} questions")

    return merged

# ── Accent colors per difficulty ─────────────────────────────────────────────
def accent_for_slug(slug):
    if 'natural' in slug or 'kesrler' in slug or 'coxluqlar' in slug:
        return '#22c55e'
    elif 'triq' in slug or 'inteqral' in slug or 'toreme' in slug or 'limit' in slug or 'kompleks' in slug:
        return '#a855f7'
    elif 'qebul' in slug or 'situasiya' in slug:
        return '#ef4444'
    elif 'vektorlar' in slug or 'feza' in slug or 'coxuzluler' in slug or 'firlanma' in slug:
        return '#3b82f6'
    else:
        return '#f97316'

def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    print("Loading question data...")
    all_data = load_all_data()
    print(f"  Found {len(all_data)} sections")

    generated = []

    for meta_key, meta in SECTION_META.items():
        sec_data = all_data.get(meta_key)
        if not sec_data or not sec_data.get('questions'):
            print(f"  ⚠️  No questions for {meta_key} ({meta['slug']}) — skipping")
            continue

        qs = clean_questions(sec_data['questions'])
        if len(qs) < 5:
            print(f"  ⚠️  Too few questions ({len(qs)}) for {meta_key} — skipping")
            continue

        # Cap at 30 questions
        qs = qs[:30]

        slug = meta['slug']
        filename = f"{slug}.html"
        filepath = os.path.join(OUT_DIR, filename)

        accent = accent_for_slug(slug)
        html = html_test(
            test_id=slug,
            title_az=meta['title_az'],
            questions=qs,
            time_minutes=meta['time'],
            accent_color=accent,
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f"  ✅ {filename} ({len(qs)} questions)")
        generated.append((slug, meta, len(qs)))

    # ── Generate tests.ts entries ────────────────────────────────────────────
    print(f"\nGenerating src/data/tests.ts entries for {len(generated)} tests...")
    ts_lines = [
        "import type { Test } from '@/types';",
        "",
        "export const TESTS: Test[] = [",
    ]

    for slug, meta, qcount in generated:
        ts_lines.append(f"  {{")
        ts_lines.append(f"    id: '{slug}',")
        ts_lines.append(f"    slug: '{slug}',")
        ts_lines.append(f"    title: {{ az: '{meta['title_az']}', ru: '{meta['title_ru']}', en: '{meta['title_en']}' }},")
        ts_lines.append(f"    description: {{ az: 'DİM 2025 test toplusundan orijinal suallar', ru: 'Оригинальные вопросы из тест-банка DİM 2025', en: 'Original questions from DİM 2025 test bank' }},")
        ts_lines.append(f"    topicIds: [],")
        ts_lines.append(f"    questionCount: {qcount},")
        ts_lines.append(f"    timeMinutes: {meta['time']},")
        ts_lines.append(f"    difficulty: {meta['diff']},")
        ts_lines.append(f"    url_path: '/lessons/tests/{slug}.html',")
        ts_lines.append(f"    year: 2025,")
        ts_lines.append(f"  }},")

    ts_lines.append("];")
    ts_lines.append("")
    ts_lines.append("export const getTestBySlug = (slug: string): Test | undefined =>")
    ts_lines.append("  TESTS.find((t) => t.slug === slug);")

    ts_path = os.path.join(BASE_DIR, 'app', 'src', 'data', 'tests.ts')
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(ts_lines) + '\n')

    print(f"\n✅ Done! Generated {len(generated)} test files + tests.ts")
    print(f"Output directory: {OUT_DIR}")

if __name__ == '__main__':
    main()
