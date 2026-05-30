#!/usr/bin/env python3
"""Rebuild class-1 lessons 3,4,7,8 to NEW 6-section format."""
import subprocess, re, os, json, sys

BASE = r"C:\Users\Administrator\Documents\Claude\Projects"
P002 = os.path.join(BASE, "P002_Math_5_Darslik")

def git_show(commit, path):
    r = subprocess.run(['git','show',f'{commit}:{path}'],capture_output=True,text=True,encoding='utf-8',cwd=BASE)
    return r.stdout

def strip_textbook_images(html):
    card_block = re.compile(r'\s*<div class="card"[^>]*>\s*<div class="card-title"[^>]*>[\s\S]*?(?:Из учебника|\.webp)[\s\S]*?</div>\s*</div>',re.DOTALL)
    result = card_block.sub('', html)
    img_card = re.compile(r'\s*<div class="card"[^>]*>\s*<div[^>]*>[\s\S]*?\.webp[\s\S]*?</div>\s*</div>',re.DOTALL)
    return img_card.sub('', result)

def extract_home_and_theory(stripped):
    home_m = re.search(r'(<section id="home"[^>]*>)', stripped)
    theory_m = re.search(r'<section id="theory"[^>]*>', stripped)
    script_m = re.search(r'\s*<script>', stripped)
    if not home_m or not theory_m or not script_m:
        return None, None
    home_end = theory_m.start()
    home_section = stripped[home_m.start():home_end].rstrip()
    theory_section = stripped[theory_m.start():script_m.start()].rstrip()
    last_close = theory_section.rfind('</section>')
    if last_close != -1:
        theory_section = theory_section[:last_close + len('</section>')]
    return home_section, theory_section

def count_slides(theory_html):
    return max(len(re.findall(r'<div class="widget-slide">', theory_html)), 1)

CSS = r"""      :root {
        --bg-dark: #0f0f1a; --bg-card: rgba(255,255,255,0.05); --bg-glass: rgba(255,255,255,0.08);
        --border-glass: rgba(255,255,255,0.15); --text-primary: #e8e8f0; --text-secondary: #a0a0b8;
        --accent: #00d4aa; --accent-dim: rgba(0,212,170,0.2); --accent-warm: #ff6b6b;
        --accent-warm-dim: rgba(255,107,107,0.2); --accent-blue: #4dabf7;
        --accent-blue-dim: rgba(77,171,247,0.2); --success: #51cf66; --error: #ff6b6b; --warning: #fcc419;
      }
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:"Segoe UI",system-ui,sans-serif; background:var(--bg-dark); color:var(--text-primary); min-height:100vh; overflow-x:hidden; line-height:1.6; }
      .bg-animation { position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; background:radial-gradient(ellipse at 20% 20%,rgba(0,212,170,.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(77,171,247,.08) 0%,transparent 50%); }
      .bg-animation::before { content:""; position:absolute; width:200%; height:200%; top:-50%; left:-50%; background:repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.02) 40px,rgba(255,255,255,.02) 41px); animation:bgMove 20s linear infinite; }
      @keyframes bgMove { 0%{transform:translateY(0)} 100%{transform:translateY(40px)} }
      nav { position:fixed; top:0; left:0; right:0; background:rgba(15,15,26,.85); backdrop-filter:blur(20px); border-bottom:1px solid var(--border-glass); z-index:1000; padding:0 20px; }
      .nav-container { max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; height:60px; }
      .logo { font-size:1.3rem; font-weight:700; background:linear-gradient(135deg,var(--accent),var(--accent-blue)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
      .nav-links { display:flex; gap:8px; list-style:none; }
      .nav-links a { color:var(--text-secondary); text-decoration:none; padding:8px 16px; border-radius:8px; transition:all .3s; font-size:.9rem; font-weight:500; cursor:pointer; border:none; background:transparent; }
      .nav-links a:hover,.nav-links a.active { color:var(--text-primary); background:var(--bg-glass); }
      .nav-links a.active { background:var(--accent-dim); color:var(--accent); }
      section { display:none; opacity:0; padding:100px 20px 60px; max-width:1000px; margin:0 auto; transition:opacity .3s ease; }
      section.active { display:block; opacity:1; animation:fadeIn .5s ease; }
      @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      .card { background:var(--bg-card); backdrop-filter:blur(20px); border:1px solid var(--border-glass); border-radius:20px; padding:32px; margin-bottom:24px; transition:transform .3s,box-shadow .3s; }
      .card:hover { transform:translateY(-2px); box-shadow:0 20px 40px rgba(0,0,0,.3); }
      .card-title { font-size:1.5rem; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:12px; }
      .card-title .icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; }
      .hero { text-align:center; padding:140px 20px 80px; }
      .hero h1 { font-size:3rem; font-weight:800; margin-bottom:20px; background:linear-gradient(135deg,var(--accent),var(--accent-blue),var(--accent-warm)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1.2; }
      .hero p { font-size:1.2rem; color:var(--text-secondary); max-width:600px; margin:0 auto 40px; }
      .btn { display:inline-flex; align-items:center; gap:8px; padding:14px 32px; border-radius:12px; border:none; font-size:1rem; font-weight:600; cursor:pointer; transition:all .3s; text-decoration:none; }
      .btn-primary { background:linear-gradient(135deg,var(--accent),var(--accent-blue)); color:#000; }
      .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--accent-dim); }
      .btn-secondary { background:var(--bg-glass); color:var(--text-primary); border:1px solid var(--border-glass); }
      .btn-secondary:hover { background:var(--bg-card); }
      .btn:disabled { opacity:.5; cursor:not-allowed; transform:none !important; }
      .generate-widget { background:var(--bg-card); border:1px solid var(--border-glass); border-radius:20px; padding:24px; width:100%; }
      .widget-viewport { overflow:hidden; position:relative; min-height:520px; height:auto; width:100%; }
      .widget-track { display:flex; transition:transform .5s cubic-bezier(.4,0,.2,1); width:100%; will-change:transform; }
      .widget-slide { flex:0 0 100%; width:100%; min-width:100%; padding:20px; box-sizing:border-box; overflow-x:hidden; overflow-y:visible; }
      .widget-slide h3 { font-size:1.3rem; color:var(--accent); margin-bottom:16px; }
      .widget-slide p,.widget-slide li { color:var(--text-secondary); line-height:1.8; margin-bottom:12px; }
      .widget-slide .big-math { font-size:1.6rem; text-align:center; margin:20px 0; background:var(--bg-glass); padding:20px; border-radius:12px; font-weight:600; color:var(--text-primary); }
      .widget-nav { display:flex; justify-content:space-between; align-items:center; margin-top:16px; }
      .widget-progress { text-align:center; font-size:.9rem; color:var(--text-secondary); margin-bottom:12px; }
      .sequence-component { display:flex; flex-direction:column; gap:20px; position:relative; }
      .sequence-step { background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:24px 24px 24px 72px; position:relative; transition:all .3s; }
      .sequence-step:hover { border-color:var(--accent); transform:translateX(4px); }
      .sequence-number { position:absolute; left:20px; top:20px; width:40px; height:40px; background:var(--accent); color:#000; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem; }
      .sequence-step h4 { color:var(--text-primary); margin-bottom:8px; font-size:1.1rem; }
      .sequence-step p { color:var(--text-secondary); line-height:1.7; }
      .sequence-connector { position:absolute; left:39px; top:60px; bottom:-30px; width:2px; background:var(--accent-dim); z-index:0; }
      .sequence-step:last-child .sequence-connector { display:none; }
      .formula-box { background:var(--bg-glass); border:1px solid var(--border-glass); border-radius:12px; padding:20px; margin:16px 0; text-align:center; font-size:1.2rem; }
      .tip-box { background:var(--accent-blue-dim); border-left:4px solid var(--accent-blue); padding:16px 20px; border-radius:0 12px 12px 0; margin:16px 0; }
      .tip-box::before { content:"💡 "; }
      .warning-box { background:var(--accent-warm-dim); border-left:4px solid var(--accent-warm); padding:16px 20px; border-radius:0 12px 12px 0; margin:16px 0; }
      .warning-box::before { content:"⚠️ "; }
      .highlight { background:var(--accent-dim); padding:2px 6px; border-radius:4px; color:var(--accent); font-weight:600; }
      .problem-card { background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:24px; margin-bottom:20px; }
      .problem-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
      .problem-number { background:var(--accent-dim); color:var(--accent); padding:4px 12px; border-radius:20px; font-size:.85rem; font-weight:600; }
      .problem-type { color:var(--text-secondary); font-size:.85rem; }
      .problem-text { font-size:1.1rem; margin-bottom:16px; line-height:1.8; }
      .solution-btn { background:var(--accent-dim); color:var(--accent); border:1px solid var(--accent); padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:600; transition:all .3s; }
      .solution-btn:hover { background:var(--accent); color:#000; }
      .solution { display:none; margin-top:20px; padding:20px; background:rgba(0,212,170,.05); border-left:3px solid var(--accent); border-radius:0 12px 12px 0; }
      .solution.active { display:block; animation:slideDown .3s ease; }
      @keyframes slideDown { from{opacity:0;max-height:0} to{opacity:1;max-height:1000px} }
      .solution-step { margin-bottom:12px; padding:8px 0; border-bottom:1px solid var(--border-glass); }
      .solution-step:last-child { border-bottom:none; }
      .step-num { display:inline-block; width:24px; height:24px; background:var(--accent); color:#000; border-radius:50%; text-align:center; line-height:24px; font-size:.8rem; font-weight:700; margin-right:8px; }
      .quiz-container { background:var(--bg-card); border:1px solid var(--border-glass); border-radius:20px; padding:32px; }
      .quiz-progress { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:8px; }
      .progress-bar { flex:1; height:8px; background:var(--bg-glass); border-radius:4px; margin:0 16px; overflow:hidden; min-width:100px; }
      .progress-fill { height:100%; background:linear-gradient(90deg,var(--accent),var(--accent-blue)); border-radius:4px; transition:width .5s ease; width:0%; }
      .quiz-question { font-size:1.2rem; margin-bottom:24px; padding:20px; background:var(--bg-glass); border-radius:12px; border-left:4px solid var(--accent); }
      .quiz-options { display:grid; gap:12px; }
      .quiz-option { background:var(--bg-glass); border:2px solid var(--border-glass); border-radius:12px; padding:16px 20px; cursor:pointer; transition:all .3s; display:flex; align-items:center; gap:12px; }
      .quiz-option:hover { border-color:var(--accent); background:var(--accent-dim); }
      .quiz-option.correct { border-color:var(--success); background:rgba(81,207,102,.15); }
      .quiz-option.wrong { border-color:var(--error); background:rgba(255,107,107,.15); }
      .quiz-option.disabled { pointer-events:none; opacity:.7; }
      .option-letter { width:32px; height:32px; border-radius:8px; background:var(--bg-card); display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0; }
      .quiz-nav { display:flex; justify-content:space-between; margin-top:24px; }
      .stat { background:var(--bg-glass); padding:12px 24px; border-radius:12px; text-align:center; min-width:100px; border:1px solid var(--border-glass); }
      .stat-value { font-size:1.5rem; font-weight:700; color:var(--accent); }
      .stat-label { font-size:.85rem; color:var(--text-secondary); }
      .timer { position:fixed; top:80px; right:20px; background:var(--bg-card); backdrop-filter:blur(20px); border:1px solid var(--border-glass); border-radius:16px; padding:16px 24px; font-size:1.3rem; font-weight:700; font-variant-numeric:tabular-nums; z-index:999; box-shadow:0 10px 30px rgba(0,0,0,.3); }
      .timer.warning { border-color:var(--warning); color:var(--warning); animation:pulse 1s infinite; }
      .timer.danger { border-color:var(--error); color:var(--error); animation:pulse .5s infinite; }
      @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      .results-container { text-align:center; padding:40px; }
      .score-circle { width:200px; height:200px; border-radius:50%; background:conic-gradient(var(--accent) calc(var(--score)*3.6deg),var(--bg-glass) 0); margin:0 auto 32px; display:flex; align-items:center; justify-content:center; position:relative; }
      .score-circle::before { content:""; position:absolute; width:170px; height:170px; background:var(--bg-dark); border-radius:50%; }
      .score-value { position:relative; font-size:3rem; font-weight:800; color:var(--accent); }
      .score-label { font-size:1.2rem; color:var(--text-secondary); margin-bottom:8px; }
      .score-message { font-size:1.5rem; font-weight:700; margin-bottom:32px; }
      .results-breakdown { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:16px; max-width:600px; margin:0 auto 32px; }
      .breakdown-item { background:var(--bg-glass); padding:16px; border-radius:12px; }
      .breakdown-value { font-size:1.5rem; font-weight:700; color:var(--accent); }
      .breakdown-label { font-size:.85rem; color:var(--text-secondary); }
      .hidden { display:none !important; }
      @media(max-width:768px) { .hero h1{font-size:2rem} .nav-links{display:none} .timer{top:70px;right:10px;font-size:1rem;padding:10px 16px} .card{padding:20px} section{padding:80px 16px 40px} .widget-viewport{min-height:500px} }"""

LESSON_DATA = {

'c1l3': {
    'num': 3, 'class': 1,
    'filename': 'math-5-class-1/lesson-3.html',
    'title': 'Сравнение натуральных чисел',
    'subtitle': 'Урок 3. Сравнение, упорядочивание и шкала натуральных чисел.',
    'use_git': True,
    'git_path': 'math-5-class-1/lesson-3.html',
    'algorithm': [
        ('Сравнение по количеству разрядов', 'Если числа имеют разное количество цифр — большее число имеет больше цифр. Пример: 1 234 < 12 345.'),
        ('Сравнение поразрядно', 'При одинаковом числе цифр сравнивайте цифры слева направо: первая различающаяся цифра определяет результат.'),
        ('Упорядочивание по возрастанию', 'Расположите числа от наименьшего к наибольшему: сначала с меньшим числом разрядов, затем поразрядно.'),
        ('Упорядочивание по убыванию', 'Расположите числа от наибольшего к наименьшему — обратный порядок сравнения.'),
        ('Числовая прямая', 'На числовой прямой числа расположены слева направо: чем правее, тем число больше.'),
    ],
    'examples': [
        ('Сравнение по разрядам', 'Сравните 45 670 и 8 999.', [
            ('45 670 — 5 цифр; 8 999 — 4 цифры', '5 > 4, значит'),
            ('Итог', '45 670 > 8 999'),
        ]),
        ('Поразрядное сравнение', 'Сравните 3 842 100 и 3 841 900.', [
            ('Цифры слева: 3=3, 8=8, 4=4, 2=2, 1>9?', 'Нет: 2 > 1 в разряде тысяч'),
            ('Итог', '3 842 100 > 3 841 900'),
        ]),
        ('Упорядочивание', 'Расположите по возрастанию: 5 010, 510, 5 001, 5 100.', [
            ('По числу цифр: 510 (3), остальные (4)', '510 < все четырёхзначные'),
            ('Поразрядно: 5 001 < 5 010 < 5 100', 'Итог: 510; 5 001; 5 010; 5 100'),
        ]),
        ('Вставить знак', 'Вставьте знак: 907 __ 970.', [
            ('Сотни: 9=9. Десятки: 0 < 7', '907 < 970'),
            ('Итог', '907 < 970'),
        ]),
        ('Числовая прямая', 'Найдите, какое из чисел 3 570 или 3 507 расположено правее на числовой прямой.', [
            ('Тысячи: 3=3. Сотни: 5=5. Десятки: 7 > 0', '3 570 > 3 507'),
            ('Итог', '3 570 правее'),
        ]),
    ],
    'questions': [
        {'q':'Сравните: 56 780 и 7 890','options':['<','>','=','нельзя'],'correct':1,'expl':'56 780 — 5 цифр; 7 890 — 4 цифры. Больше цифр → большее число.'},
        {'q':'Сравните: 24 356 и 24 365','options':['24 356 > 24 365','24 356 < 24 365','24 356 = 24 365','нельзя'],'correct':1,'expl':'Десятки: 5 < 6. Значит 24 356 < 24 365.'},
        {'q':'Наибольшее число: 6 789, 6 987, 6 879, 6 798','options':['6 789','6 987','6 879','6 798'],'correct':1,'expl':'Сотни: 7 < 9. 6 987 — наибольшее.'},
        {'q':'Наименьшее число: 10 001, 10 010, 10 100, 9 999','options':['10 001','10 010','10 100','9 999'],'correct':3,'expl':'9 999 — 4 цифры, остальные — 5. Значит 9 999 наименьшее.'},
        {'q':'Расположите по возрастанию: 305, 3 005, 35, 3 500','options':['35; 305; 3 005; 3 500','305; 35; 3 005; 3 500','35; 3 005; 305; 3 500','3 500; 3 005; 305; 35'],'correct':0,'expl':'По числу цифр: 35 (2) < 305 (3) < 3 005 (4) < 3 500 (4). Поразрядно 3 005 < 3 500.'},
        {'q':'Вставьте знак: 100 000 __ 99 999','options':['<','>','=','≥'],'correct':1,'expl':'100 000 — 6 цифр; 99 999 — 5 цифр. 100 000 > 99 999.'},
        {'q':'Правило: числа на числовой прямой расположены...','options':['произвольно','от большего к меньшему слева направо','от меньшего к большему слева направо','в порядке чётности'],'correct':2,'expl':'На числовой прямой числа возрастают слева направо.'},
        {'q':'Сколько натуральных чисел между 10 и 15?','options':['4','5','6','3'],'correct':0,'expl':'Это 11, 12, 13, 14 — всего 4 числа.'},
        {'q':'Знак «≤» означает...','options':['строго меньше','меньше или равно','больше или равно','не равно'],'correct':1,'expl':'≤ читается «меньше или равно».'},
        {'q':'Верно ли: 0 < 1 < 2 < ... ?','options':['Нет','Да, натуральные числа упорядочены','Только для простых','Только для чётных'],'correct':1,'expl':'Натуральный ряд строго упорядочен по возрастанию.'},
        {'q':'Сравните: 2 000 000 и 1 999 999','options':['<','>','=','зависит от задачи'],'correct':1,'expl':'2 000 000 — 7 цифр; 1 999 999 — 7 цифр. Миллионы: 2 > 1.'},
        {'q':'Какое число стоит сразу после 999 999?','options':['1 000 000','1 000 001','999 998','10 000 000'],'correct':0,'expl':'Следующее натуральное число после 999 999 — 1 000 000.'},
        {'q':'Расположите по убыванию: 401, 410, 400, 414','options':['414; 410; 401; 400','400; 401; 410; 414','410; 414; 401; 400','414; 400; 410; 401'],'correct':0,'expl':'414 > 410 > 401 > 400.'},
        {'q':'Сравните: 5 040 900 и 5 400 900','options':['=','5 040 900 > 5 400 900','5 040 900 < 5 400 900','нельзя'],'correct':2,'expl':'Стотысячные: 0 < 4. Значит 5 040 900 < 5 400 900.'},
        {'q':'Сколько двузначных натуральных чисел?','options':['9','90','100','91'],'correct':1,'expl':'От 10 до 99 включительно: 99 − 10 + 1 = 90 чисел.'},
        {'q':'Наименьшее трёхзначное число:','options':['100','101','999','111'],'correct':0,'expl':'Наименьшее трёхзначное — 100.'},
        {'q':'Если a > b и b > c, то...','options':['a < c','a = c','a > c','нельзя определить'],'correct':2,'expl':'Транзитивность порядка: a > b > c → a > c.'},
        {'q':'Сравните: 7 070 070 и 7 700 700','options':['=','7 070 070 > 7 700 700','7 070 070 < 7 700 700','нельзя'],'correct':2,'expl':'Стотысячные: 0 < 7. Значит первое меньше.'},
        {'q':'Между какими соседними натуральными числами НЕТ чисел?','options':['Между 5 и 7','Между 100 и 102','Между 10 и 11','Между 0 и 2'],'correct':2,'expl':'Между 10 и 11 нет натурального числа — это соседние числа.'},
        {'q':'Сравните: 1 000 001 и 999 999','options':['<','>','=','нельзя'],'correct':1,'expl':'1 000 001 — 7 цифр; 999 999 — 6 цифр. Больше цифр — больше число.'},
    ]
},

'c1l4': {
    'num': 4, 'class': 1,
    'filename': 'math-5-class-1/lesson-4.html',
    'title': 'Округление натуральных чисел',
    'subtitle': 'Урок 4. Правила округления до любого разряда.',
    'use_git': True,
    'git_path': 'math-5-class-1/lesson-4.html',
    'algorithm': [
        ('Определить разряд округления', 'Определите, до какого разряда нужно округлить (десятки, сотни, тысячи...).'),
        ('Посмотреть следующую цифру', 'Посмотрите на цифру справа от выбранного разряда.'),
        ('Округление вниз', 'Если эта цифра 0, 1, 2, 3 или 4 — цифру разряда оставьте, все правее заменяйте нулями.'),
        ('Округление вверх', 'Если эта цифра 5, 6, 7, 8 или 9 — цифру разряда увеличивайте на 1, все правее — нули.'),
        ('Проверка', 'Результат должен кратен соответствующей степени десяти: до десятков — кратен 10, до сотен — кратен 100 и т.д.'),
    ],
    'examples': [
        ('До десятков', 'Округлите 347 до десятков.', [
            ('Разряд десятков = 4. Следующая цифра: 7 ≥ 5', 'Округляем вверх: 4 → 5'),
            ('Итог', '350'),
        ]),
        ('До сотен', 'Округлите 4 480 до сотен.', [
            ('Разряд сотен = 4. Следующая цифра: 8 ≥ 5', 'Округляем вверх: 4 → 5'),
            ('Итог', '4 500'),
        ]),
        ('До тысяч', 'Округлите 67 349 до тысяч.', [
            ('Разряд тысяч = 7. Следующая цифра: 3 < 5', 'Оставляем 7, заменяем 349 → 000'),
            ('Итог', '67 000'),
        ]),
        ('До миллионов', 'Округлите 4 735 000 до миллионов.', [
            ('Миллионы = 4. Следующая: 7 ≥ 5', '4 → 5, всё правее — нули'),
            ('Итог', '5 000 000'),
        ]),
        ('Оценка результата', 'Оцените: 498 × 6 ≈ ?', [
            ('498 ≈ 500 (до сотен)', '500 × 6 = 3 000'),
            ('Итог', '≈ 3 000'),
        ]),
    ],
    'questions': [
        {'q':'Округлите 763 до десятков.','options':['760','770','800','750'],'correct':0,'expl':'Цифра десятков = 6. Следующая = 3 < 5 → оставляем. 760.'},
        {'q':'Округлите 855 до сотен.','options':['800','900','860','850'],'correct':1,'expl':'Цифра сотен = 8. Следующая = 5 ≥ 5 → +1. 900.'},
        {'q':'Округлите 4 321 до тысяч.','options':['4 000','5 000','4 300','4 320'],'correct':0,'expl':'Тысячи = 4. Следующая = 3 < 5 → оставляем. 4 000.'},
        {'q':'Округлите 7 500 до тысяч.','options':['7 000','8 000','7 500','7 050'],'correct':1,'expl':'Тысячи = 7. Следующая = 5 ≥ 5 → +1. 8 000.'},
        {'q':'Округлите 349 до сотен.','options':['300','400','350','340'],'correct':0,'expl':'Сотни = 3. Следующая = 4 < 5 → оставляем. 300.'},
        {'q':'Округлите 95 до десятков.','options':['90','100','95','80'],'correct':1,'expl':'Десятки = 9. Следующая = 5 ≥ 5 → 9+1=10, перенос → 100.'},
        {'q':'До какого разряда округлено 12 000?','options':['до десятков','до сотен','до тысяч','до миллионов'],'correct':2,'expl':'Результат кратен 1000, но не обязательно 10 000. Скорее всего до тысяч.'},
        {'q':'Оцените: 203 × 5 ≈ ?','options':['1 000','1 500','800','1 200'],'correct':0,'expl':'203 ≈ 200. 200 × 5 = 1 000.'},
        {'q':'Округлите 9 999 до тысяч.','options':['9 000','10 000','9 900','9 990'],'correct':1,'expl':'Тысячи = 9. Следующая = 9 ≥ 5 → 9+1=10, перенос → 10 000.'},
        {'q':'Округлите 1 450 000 до миллионов.','options':['1 000 000','2 000 000','1 500 000','1 400 000'],'correct':0,'expl':'Миллионы = 1. Следующая = 4 < 5 → оставляем. 1 000 000.'},
        {'q':'Округлите 2 750 000 до миллионов.','options':['2 000 000','3 000 000','2 800 000','2 700 000'],'correct':1,'expl':'Миллионы = 2. Следующая = 7 ≥ 5 → +1. 3 000 000.'},
        {'q':'Оцените: 6 847 + 3 214 ≈ ?','options':['10 000','9 000','11 000','8 000'],'correct':0,'expl':'6 847 ≈ 7 000; 3 214 ≈ 3 000. 7 000 + 3 000 = 10 000.'},
        {'q':'Округлите 34 567 до сотен.','options':['34 500','34 600','35 000','34 000'],'correct':1,'expl':'Сотни = 5. Следующая = 6 ≥ 5 → +1. 34 600.'},
        {'q':'Округлите 50 049 до тысяч.','options':['50 000','51 000','50 100','49 000'],'correct':0,'expl':'Тысячи = 0. Следующая = 4 < 5 → оставляем. 50 000.'},
        {'q':'Правило: цифра 5 при округлении...','options':['округляем вниз','округляем вверх','оставляем как есть','зависит от задачи'],'correct':1,'expl':'Цифра 5 и выше → округляем вверх (увеличиваем разряд на 1).'},
        {'q':'Оцените: 489 × 3 ≈ ?','options':['1 200','1 500','1 800','900'],'correct':1,'expl':'489 ≈ 500. 500 × 3 = 1 500.'},
        {'q':'Округлите 100 до десятков.','options':['90','100','110','0'],'correct':1,'expl':'100 уже кратно 10. Округление ничего не меняет → 100.'},
        {'q':'Округлите 678 234 до десятков тысяч.','options':['670 000','680 000','678 000','700 000'],'correct':1,'expl':'Десятки тысяч = 7. Следующая = 8 ≥ 5 → +1. 680 000.'},
        {'q':'Число 5 500 000, округлённое до миллионов, равно:','options':['5 000 000','6 000 000','5 500 000','4 000 000'],'correct':1,'expl':'Миллионы = 5. Следующая = 5 ≥ 5 → +1. 6 000 000.'},
        {'q':'Округлите 3 456 до сотен.','options':['3 400','3 500','3 450','3 460'],'correct':1,'expl':'Сотни = 4. Следующая = 5 ≥ 5 → +1. 3 500.'},
    ]
},

'c1l7': {
    'num': 7, 'class': 1,
    'filename': 'math-5-class-1/lesson-7.html',
    'title': 'Умножение и деление',
    'subtitle': 'Урок 7. Умножение и деление натуральных чисел. Свойства и алгоритмы.',
    'use_git': False,
    'algorithm': [
        ('Умножение в столбик', 'Множитель умножайте на каждую цифру второго числа справа налево. Результаты сдвигайте на один разряд влево и складывайте.'),
        ('Деление в столбик', 'Выбирайте делимое по цифрам слева направо. Подбирайте цифру частного: произведение ≤ делимого, следующее произведение > делимого.'),
        ('Свойства умножения', 'Переместительное: a × b = b × a. Сочетательное: (a×b)×c = a×(b×c). Распределительное: a×(b+c) = a×b + a×c.'),
        ('Деление с остатком', 'a = b × q + r, где 0 ≤ r < b. Нацелое делится, когда r = 0.'),
        ('Проверка', 'Умножение: поменяйте множители. Деление: частное × делитель + остаток = делимое.'),
    ],
    'examples': [
        ('Умножение в столбик', 'Вычислите: 345 × 27', [
            ('345 × 7 = 2 415; 345 × 20 = 6 900', '2 415 + 6 900 = 9 315'),
            ('Итог', '345 × 27 = 9 315'),
        ]),
        ('Деление в столбик', 'Вычислите: 5 824 ÷ 8', [
            ('5÷8 нет, берём 58: 58÷8=7(ост.2)', '282÷8=35(ост.2)... 5824÷8=728'),
            ('Итог', '728'),
        ]),
        ('Распределительное свойство', 'Вычислите: 36 × 102 удобным способом.', [
            ('36 × (100 + 2) = 36 × 100 + 36 × 2', '3 600 + 72 = 3 672'),
            ('Итог', '3 672'),
        ]),
        ('Деление с остатком', 'Разделите 253 на 7.', [
            ('7 × 36 = 252; 253 − 252 = 1', 'Частное = 36, остаток = 1'),
            ('Итог', '253 = 7 × 36 + 1'),
        ]),
        ('Задача', 'В 15 ящиках по 48 кг фруктов. Сколько всего кг?', [
            ('48 × 15 = 48 × 10 + 48 × 5 = 480 + 240', '720 кг'),
            ('Итог', '720 кг'),
        ]),
    ],
    'questions': [
        {'q':'345 × 6 = ?','options':['2 070','2 007','2 700','2 017'],'correct':0,'expl':'300×6=1800; 40×6=240; 5×6=30. 1800+240+30=2070.'},
        {'q':'728 ÷ 8 = ?','options':['81','91','71','81.5'],'correct':1,'expl':'8×91=728. Проверка: 91×8=728 ✓.'},
        {'q':'Используйте свойство: 25 × 44 = ?','options':['1 100','1 000','1 200','900'],'correct':0,'expl':'25×4×11 = 100×11 = 1 100. Или: 25×44=25×40+25×4=1000+100=1100.'},
        {'q':'2 016 ÷ 7 = ?','options':['288','280','287','281'],'correct':0,'expl':'7×288=2016. Проверка: 7×200=1400; 7×88=616. 1400+616=2016 ✓.'},
        {'q':'Остаток при делении 100 на 7:','options':['1','2','3','0'],'correct':0,'expl':'7×14=98; 100−98=2. Нет, 7×14=98, ост=2. Погодите: 7×14=98, ост=2. Правильный ответ B=1? Нет: 100÷7=14 ост 2. Correct=1 (ответ B = «2»)','correct':1,'expl':'7×14=98. 100−98=2. Остаток = 2.'},
        {'q':'32 × 125 = ?','options':['4 000','3 000','5 000','2 500'],'correct':0,'expl':'32×125=32×1000/8=32000/8=4000.'},
        {'q':'1 500 ÷ 25 = ?','options':['60','50','70','40'],'correct':0,'expl':'25×60=1500 ✓.'},
        {'q':'Переместительное свойство умножения:','options':['a×b = b×a','a×(b+c)=a×b+a×c','(a×b)×c=a×(b×c)','a÷b≠b÷a'],'correct':0,'expl':'Переместительное: a×b = b×a.'},
        {'q':'56 × 99 = ?','options':['5 544','5 600','5 400','5 400'],'correct':0,'expl':'56×(100−1)=5600−56=5544.'},
        {'q':'Если a × b = 0 и b ≠ 0, то...','options':['a = 0','a = b','a = 1','нельзя'],'correct':0,'expl':'Произведение равно нулю, если хотя бы один множитель нуль.'},
        {'q':'7 × (8 + 5) = ?','options':['91','56','35','96'],'correct':0,'expl':'7×13=91. Или: 7×8+7×5=56+35=91.'},
        {'q':'504 ÷ 12 = ?','options':['42','40','44','48'],'correct':0,'expl':'12×42=504 ✓.'},
        {'q':'Наибольший однозначный делитель числа 81:','options':['9','3','27','81'],'correct':0,'expl':'81=9×9. Наибольший однозначный делитель — 9.'},
        {'q':'Сколько раз 15 содержится в 900?','options':['60','50','70','45'],'correct':0,'expl':'900÷15=60 ✓.'},
        {'q':'2 400 × 5 = ?','options':['12 000','1 200','120 000','11 000'],'correct':0,'expl':'2400×5=12000.'},
        {'q':'Деление на ноль...','options':['даёт ноль','невозможно','даёт само число','даёт единицу'],'correct':1,'expl':'Деление на ноль не определено в математике.'},
        {'q':'a × 1 = ?','options':['0','1','a','a+1'],'correct':2,'expl':'Умножение на единицу не изменяет число: a×1=a.'},
        {'q':'Остаток при делении 1 000 на 3:','options':['0','1','2','3'],'correct':1,'expl':'3×333=999; 1000−999=1. Остаток = 1.'},
        {'q':'48 × 50 = ?','options':['2 400','2 000','4 800','480'],'correct':0,'expl':'48×50=48×100/2=4800/2=2400.'},
        {'q':'Если делимое = 144, делитель = 12, то частное = ?','options':['12','11','13','10'],'correct':0,'expl':'144÷12=12 ✓.'},
    ]
},

'c1l8': {
    'num': 8, 'class': 1,
    'filename': 'math-5-class-1/lesson-8.html',
    'title': 'Числовые выражения',
    'subtitle': 'Урок 8. Порядок действий. Скобки. Законы арифметики.',
    'use_git': False,
    'algorithm': [
        ('Шаг 1: Скобки', 'Сначала вычислите все выражения в скобках, начиная с самых внутренних.'),
        ('Шаг 2: Умножение и деление', 'Выполняйте умножение и деление слева направо в порядке их появления.'),
        ('Шаг 3: Сложение и вычитание', 'Выполняйте сложение и вычитание слева направо.'),
        ('Раскрытие скобок', 'Если перед скобкой «+»: знаки не меняются. Если перед скобкой «−»: все знаки внутри меняются.'),
        ('Проверка', 'Подставьте промежуточные результаты и убедитесь, что вычисления верны.'),
    ],
    'examples': [
        ('Без скобок', 'Вычислите: 20 + 8 × 3 − 4 ÷ 2', [
            ('Умножение и деление: 8×3=24; 4÷2=2', '20 + 24 − 2'),
            ('Итог', '42'),
        ]),
        ('Со скобками', 'Вычислите: (20 + 8) × (3 − 4 ÷ 2)', [
            ('Скобки: (28) × (3−2) = (28) × (1)', '28'),
            ('Итог', '28'),
        ]),
        ('Вложенные скобки', 'Вычислите: 100 − (5 × (3 + 4))', [
            ('Внутренние: (3+4)=7; 5×7=35', '100 − 35 = 65'),
            ('Итог', '65'),
        ]),
        ('Раскрытие скобок', 'Раскройте: 50 − (12 + 8)', [
            ('Перед скобкой «−»: знаки меняются', '50 − 12 − 8 = 30'),
            ('Итог', '30'),
        ]),
        ('Составить выражение', 'Запишите выражение: «разность 100 и 25, умноженная на 3»', [
            ('(100 − 25) × 3', '75 × 3 = 225'),
            ('Итог', '225'),
        ]),
    ],
    'questions': [
        {'q':'Вычислите: 10 + 6 × 4','options':['64','34','40','26'],'correct':1,'expl':'Сначала 6×4=24, затем 10+24=34.'},
        {'q':'Вычислите: (10 + 6) × 4','options':['64','34','40','26'],'correct':0,'expl':'Скобки: 10+6=16. Затем 16×4=64.'},
        {'q':'Вычислите: 100 − 5 × 4 ÷ 2 + 3','options':['93','73','83','53'],'correct':0,'expl':'5×4=20; 20÷2=10. 100−10+3=93.'},
        {'q':'Расставьте скобки в 2 + 3 × 4, чтобы получить 20','options':['(2+3)×4','2+(3×4)','2+(3+4)','невозможно'],'correct':0,'expl':'(2+3)×4=5×4=20 ✓.'},
        {'q':'Вычислите: 8 × (12 − 4 × 2)','options':['32','96','8','48'],'correct':0,'expl':'Скобки: 4×2=8; 12−8=4. Затем 8×4=32.'},
        {'q':'Раскройте скобки: a − (b − c) = ?','options':['a−b−c','a−b+c','a+b+c','a+b−c'],'correct':1,'expl':'Перед скобкой «−»: знаки меняются. a−b+c.'},
        {'q':'Вычислите: 50 ÷ 5 + 50 ÷ (5 + 5)','options':['15','10','20','25'],'correct':0,'expl':'50÷5=10; 50÷10=5. 10+5=15.'},
        {'q':'Какой порядок действий правильный?','options':['+ и −, затем × и ÷, затем скобки','Скобки, затем × и ÷, затем + и −','× и ÷, затем скобки, затем + и −','Все слева направо'],'correct':1,'expl':'Правило: сначала скобки, затем × и ÷, затем + и −.'},
        {'q':'Вычислите: (7 + 3) × (8 − 3)','options':['50','40','60','30'],'correct':0,'expl':'(10)×(5)=50.'},
        {'q':'Значение выражения 3 × 4 + 2 × 5 = ?','options':['22','70','34','50'],'correct':0,'expl':'12+10=22.'},
        {'q':'Расставьте скобки, чтобы 10 − 2 + 3 = 5','options':['10 − (2 + 3)','(10 − 2) + 3','нельзя','10 − 2 − 3'],'correct':0,'expl':'10−(2+3)=10−5=5 ✓.'},
        {'q':'Вычислите: 2 × (3 + 4 × 5)','options':['46','70','34','46'],'correct':0,'expl':'4×5=20; 3+20=23; 2×23=46.'},
        {'q':'Порядок в выражении без скобок: 12 ÷ 4 × 3 = ?','options':['1','9','36','12'],'correct':1,'expl':'Слева направо: 12÷4=3; 3×3=9.'},
        {'q':'Вычислите: 100 − (10 + 20 + 30)','options':['40','60','80','140'],'correct':0,'expl':'Скобки: 10+20+30=60. 100−60=40.'},
        {'q':'Раскройте: a + (b − c) = ?','options':['a+b+c','a+b−c','a−b+c','a−b−c'],'correct':1,'expl':'Перед скобкой «+»: знаки не меняются. a+b−c.'},
        {'q':'Вычислите: 6 + 4 × 3 − 2 × 5','options':['8','18','28','−2'],'correct':0,'expl':'4×3=12; 2×5=10. 6+12−10=8.'},
        {'q':'Если поставить скобки в 3 + 4 × 5 − 2, максимальный результат:','options':['31','33','35','21'],'correct':1,'expl':'(3+4)×(5−2)=7×3=21. Или 3+4×(5−2)=3+12=15. Наибольший: (3+4×5)−2=23−2=21. Или 3+(4×5)−2=21. Или 3+4×5−2=21. Без скобок тоже 21. С (3+4)×5−2=33. Итог: 33.'},
        {'q':'Вычислите: (100 − 64) ÷ (4 × 3 − 3)','options':['4','4','5','3'],'correct':0,'expl':'(36)÷(9)=4.'},
        {'q':'Чему равно: 0 × (12 345 + 67 890)?','options':['12 345','67 890','0','80 235'],'correct':2,'expl':'Любое число × 0 = 0.'},
        {'q':'Вычислите: 5 × (3 + 2) − 5 × 3','options':['10','25','0','5'],'correct':0,'expl':'5×5−15=25−15=10. Или по распределительному: 5×(3+2−3)=5×2=10.'},
    ]
},

'c1l10': {
    'num': 10, 'class': 1,
    'filename': 'math-5-class-1/lesson-10.html',
    'title': 'Обобщающий урок: Натуральные числа',
    'subtitle': 'Урок 10. Повторение всей главы: запись, сравнение, округление, действия.',
    'use_git': False,
    'topics': [
        ('Запись и чтение', 'Классы и разряды. Развёрнутая запись. Степени числа 10.'),
        ('Сравнение и порядок', 'Поразрядное сравнение. Числовая прямая. Упорядочивание.'),
        ('Округление', 'Правило округления до любого разряда.'),
        ('Действия с числами', 'Сложение, вычитание, умножение, деление. Порядок действий.'),
        ('Делители и кратные', 'НОД, НОК, признаки делимости, простые числа.'),
    ],
    'algorithm': [
        ('Запись числа по классам', 'Разбейте число на классы по 3 цифры справа. Читайте: «миллиарды — миллионы — тысячи — единицы».'),
        ('Сравнение двух чисел', 'Больше цифр → большее число. При равном количестве цифр: сравнивайте поразрядно слева.'),
        ('Округление', 'Смотрите на цифру СПРАВА от разряда округления. ≥ 5 → +1 к разряду; < 5 → оставить. Правее — нули.'),
        ('Порядок действий', 'Скобки → умножение/деление (слева направо) → сложение/вычитание (слева направо).'),
        ('НОД и НОК', 'НОД: наибольший общий делитель (алгоритм Евклида или разложение). НОК = a × b / НОД(a,b).'),
    ],
    'examples': [
        ('Развёрнутая запись', 'Запишите в развёрнутой форме: 5 307 040.', [
            ('5·1 000 000 + 3·100 000 + 0·10 000 + 7·1 000 + 0·100 + 4·10 + 0', ''),
            ('Итог', '5 307 040 = 5·10⁶ + 3·10⁵ + 7·10³ + 4·10'),
        ]),
        ('Упорядочивание', 'Расположите по убыванию: 5 070 000; 570 000; 5 700 000; 507 000.', [
            ('7 цифр: 5 700 000 > 5 070 000; 6 цифр: 570 000 > 507 000', ''),
            ('Итог', '5 700 000; 5 070 000; 570 000; 507 000'),
        ]),
        ('Округление до тысяч', 'Округлите 3 284 561 до тысяч.', [
            ('Тысячи = 4. Следующая: 5 ≥ 5 → +1', '4 → 5'),
            ('Итог', '3 285 000'),
        ]),
        ('Порядок действий', 'Вычислите: 180 ÷ (3 + 6) × 4 − 20.', [
            ('Скобки: 3+6=9. Деление: 180÷9=20. Умножение: 20×4=80.', '80 − 20'),
            ('Итог', '60'),
        ]),
        ('НОД и НОК', 'Найдите НОД(24, 36) и НОК(24, 36).', [
            ('24 = 2³×3; 36 = 2²×3². НОД = 2²×3 = 12', 'НОК = 24×36/12 = 72'),
            ('Итог', 'НОД = 12; НОК = 72'),
        ]),
    ],
    'questions': [
        {'q':'Какой класс занимает цифра 7 в числе 7 450 000?','options':['единиц','тысяч','миллионов','миллиардов'],'correct':2,'expl':'7 находится на 7-й позиции (миллионы). 7 450 000 = 7 млн 450 тыс.'},
        {'q':'Развёрнутая запись числа 60 305:','options':['6·10⁴+3·10²+5','6·10⁴+3·10+5','60·10³+305','6·10⁴+0·10³+3·10²+0·10+5'],'correct':3,'expl':'60 305 = 6·10 000 + 0·1 000 + 3·100 + 0·10 + 5.'},
        {'q':'Сравните: 4 050 999 и 4 500 099','options':['=','4 050 999 > 4 500 099','4 050 999 < 4 500 099','нельзя'],'correct':2,'expl':'Стотысячные: 0 < 5. Значит 4 050 999 < 4 500 099.'},
        {'q':'Округлите 5 749 800 до миллионов.','options':['5 000 000','6 000 000','5 700 000','5 750 000'],'correct':1,'expl':'Миллионы = 5. Следующая цифра = 7 ≥ 5 → +1. 6 000 000.'},
        {'q':'Вычислите: 48 + 12 × 3 − 6 ÷ 2','options':['171','81','82','78'],'correct':1,'expl':'12×3=36; 6÷2=3. 48+36−3=81.'},
        {'q':'Расположите по возрастанию: 4 005; 45 000; 4 500; 400 500','options':['4 005; 4 500; 45 000; 400 500','45 000; 4 500; 4 005; 400 500','400 500; 4 005; 4 500; 45 000','4 005; 45 000; 4 500; 400 500'],'correct':0,'expl':'4 цифры < 5 цифр < 6 цифр. 4 005 < 4 500 поразрядно.'},
        {'q':'НОД(30, 45) = ?','options':['3','5','15','45'],'correct':2,'expl':'30 = 2×3×5; 45 = 3²×5. НОД = 3×5 = 15.'},
        {'q':'НОК(4, 6) = ?','options':['2','12','24','8'],'correct':1,'expl':'НОД(4,6)=2. НОК = 4×6/2 = 12.'},
        {'q':'Делится ли 2 340 на 9?','options':['нет','да: 2+3+4+0=9','да: оканчивается на 0','да: чётное'],'correct':1,'expl':'Сумма цифр: 2+3+4+0=9. 9 кратно 9 → делится на 9.'},
        {'q':'Вычислите: (25 + 75) × (100 − 96)','options':['400','296','104','10 000'],'correct':0,'expl':'(100)×(4) = 400.'},
        {'q':'Округлите 987 до сотен.','options':['900','1 000','980','990'],'correct':1,'expl':'Сотни = 9. Следующая = 8 ≥ 5 → 9+1=10 → перенос → 1 000.'},
        {'q':'Разложите 36 на простые множители:','options':['4×9','2²×3²','6×6','12×3'],'correct':1,'expl':'36 = 4×9 = 2²×3². Простые множители: 2² × 3².'},
        {'q':'Степень 10⁵ равна:','options':['500','10 000','100 000','1 000 000'],'correct':2,'expl':'10⁵ = 10×10×10×10×10 = 100 000.'},
        {'q':'Сколько семизначных натуральных чисел?','options':['9 000 000','8 999 999','9 000 001','бесконечно'],'correct':0,'expl':'От 1 000 000 до 9 999 999 включительно: 9 000 000 чисел.'},
        {'q':'Если a = 360, b = 24: a ÷ b = ?','options':['14','15','16','12'],'correct':1,'expl':'360 ÷ 24 = 15. Проверка: 15×24=360 ✓.'},
        {'q':'Вычислите: 3 × (120 ÷ 4 + 18) − 50','options':['84','94','100','144'],'correct':1,'expl':'120÷4=30; 30+18=48; 3×48=144; 144−50=94.'},
        {'q':'Признак делимости на 2:','options':['сумма цифр чётная','последняя цифра чётная','число кратно 4','число > 2'],'correct':1,'expl':'На 2 делится число, последняя цифра которого чётная (0,2,4,6,8).'},
        {'q':'Наименьшее 8-значное число:','options':['10 000 000','10 000 001','99 999 999','11 111 111'],'correct':0,'expl':'Наименьшее 8-значное = 10 000 000.'},
        {'q':'Вычислите: 999 + 1','options':['999','1 000','1 001','9 991'],'correct':1,'expl':'999 + 1 = 1 000. Перенос разряда.'},
        {'q':'Число 10⁶ = ?','options':['100 000','1 000 000','10 000 000','100 000 000'],'correct':1,'expl':'10⁶ = 1 000 000 (один миллион).'},
    ]
},

'c1l11': {
    'num': 11, 'class': 1,
    'filename': 'math-5-class-1/lesson-11.html',
    'title': 'Итоговый урок: Глава 1',
    'subtitle': 'Урок 11. Финальное повторение: натуральные числа, порядок действий, НОД/НОК.',
    'use_git': False,
    'topics': [
        ('Натуральные числа', 'Разряды, классы, запись, чтение, сравнение, округление.'),
        ('Умножение и деление', 'Алгоритмы, свойства, деление с остатком.'),
        ('Порядок действий', 'Скобки, приоритеты, раскрытие скобок.'),
        ('НОД и НОК', 'Определения, алгоритм Евклида, применение.'),
        ('Простые числа', 'Признаки делимости, разложение на множители.'),
    ],
    'algorithm': [
        ('Запись и чтение больших чисел', 'Разбейте число на группы по 3 цифры справа. Называйте каждую группу с указанием класса: млрд, млн, тыс, ед.'),
        ('Сравнение чисел', 'Шаг 1: Считаем цифры. Шаг 2: Если поровну — сравниваем слева поразрядно.'),
        ('Действия в правильном порядке', 'Сначала скобки, потом × и ÷ слева направо, потом + и − слева направо.'),
        ('Нахождение НОД', 'Алгоритм Евклида: НОД(a,b) = НОД(b, a mod b). Повторяйте до a mod b = 0.'),
        ('Нахождение НОК', 'НОК(a,b) = a × b ÷ НОД(a,b). Для нескольких чисел: через простые множители, берите наибольшие степени.'),
    ],
    'examples': [
        ('Чтение числа', 'Прочитайте: 9 007 050 304.', [
            ('9 млрд — 7 млн — 50 тыс — 304', 'Девять миллиардов семь миллионов пятьдесят тысяч триста четыре'),
            ('Итог', '9 007 050 304'),
        ]),
        ('Порядок действий', 'Вычислите: 5 × (8 − 3) + 4 × (7 − 2²).', [
            ('Скобки: (8−3)=5; 2²=4; (7−4)=3', '5×5 + 4×3 = 25 + 12'),
            ('Итог', '37'),
        ]),
        ('НОД по алгоритму Евклида', 'НОД(91, 35) = ?', [
            ('91 = 35×2 + 21; 35 = 21×1 + 14; 21 = 14×1 + 7; 14 = 7×2 + 0', 'НОД = 7'),
            ('Итог', 'НОД(91, 35) = 7'),
        ]),
        ('Разложение на множители', 'Разложите 120 на простые множители.', [
            ('120 = 2×60 = 2×2×30 = 2×2×2×15 = 2×2×2×3×5', '2³ × 3 × 5'),
            ('Итог', '120 = 2³ × 3 × 5'),
        ]),
        ('Применение НОК', 'За сколько минут впервые совпадут сигналы, если первый звенит каждые 4 мин, второй — каждые 6 мин?', [
            ('НОК(4, 6) = 12', 'Сигналы совпадут через 12 минут'),
            ('Итог', '12 минут'),
        ]),
    ],
    'questions': [
        {'q':'Прочитайте: 2 040 007. Что за число?','options':['Два миллиона сорок тысяч семь','Двадцать четыре миллиона семь','Два миллиарда сорок семь','Два миллиона четыреста семь'],'correct':0,'expl':'2 040 007 = 2 млн + 040 тыс + 007 = два миллиона сорок тысяч семь.'},
        {'q':'Наибольший шестизначный номер:','options':['100 000','999 999','900 000','999 000'],'correct':1,'expl':'Наибольшее 6-значное число = 999 999.'},
        {'q':'Вычислите: 4 × (15 − 8) + 3 × 6','options':['46','124','46','50'],'correct':0,'expl':'4×7=28; 3×6=18. 28+18=46.'},
        {'q':'НОД(56, 42) = ?','options':['7','14','21','42'],'correct':1,'expl':'56=2³×7; 42=2×3×7. НОД = 2×7 = 14.'},
        {'q':'НОК(8, 12) = ?','options':['4','24','96','48'],'correct':1,'expl':'НОД(8,12)=4. НОК = 8×12/4 = 24.'},
        {'q':'120 ÷ 8 = ?','options':['14','15','16','13'],'correct':1,'expl':'8×15=120 ✓.'},
        {'q':'Простое ли число 91?','options':['да','нет: 91 = 7×13','нет: 91 = 9×10 + 1','нет: делится на 3'],'correct':1,'expl':'91 = 7×13. У числа 91 есть делители 7 и 13, значит оно составное.'},
        {'q':'Признак делимости на 3:','options':['последняя цифра 0 или 3','число чётное','сумма цифр кратна 3','делится на 9'],'correct':2,'expl':'Число делится на 3, если сумма его цифр кратна 3.'},
        {'q':'Вычислите: 1 000 − (250 + 375)','options':['625','375','875','125'],'correct':1,'expl':'Скобки: 250+375=625. 1000−625=375.'},
        {'q':'Делители числа 28 (все):','options':['1,2,4,7,14,28','1,4,7,28','2,4,7,14','1,2,7,14,28'],'correct':0,'expl':'1×28, 2×14, 4×7. Все делители: 1, 2, 4, 7, 14, 28.'},
        {'q':'Разложите 72 на простые множители:','options':['8×9','2³×3²','2⁴×3','6×12'],'correct':1,'expl':'72=8×9=2³×3². ✓'},
        {'q':'Алгоритм Евклида: НОД(48, 18) = ?','options':['2','3','6','9'],'correct':2,'expl':'48=18×2+12; 18=12×1+6; 12=6×2+0. НОД=6.'},
        {'q':'Если a кратно b, то НОД(a,b) = ?','options':['a','b','a×b','a/b'],'correct':1,'expl':'Если a кратно b, то b является делителем a, значит НОД(a,b) = b.'},
        {'q':'Сколько простых чисел между 10 и 20?','options':['3','4','2','5'],'correct':1,'expl':'11, 13, 17, 19 — четыре простых числа.'},
        {'q':'Вычислите: 7 × 8 + 7 × 2','options':['70','77','56','112'],'correct':0,'expl':'По распределительному: 7×(8+2)=7×10=70.'},
        {'q':'НОК(3, 4, 6) = ?','options':['6','12','24','72'],'correct':1,'expl':'2²×3 = 12. НОК(3,4,6) = 12. Проверка: 12÷3=4✓; 12÷4=3✓; 12÷6=2✓.'},
        {'q':'Наименьшее простое чётное число:','options':['1','2','4','6'],'correct':1,'expl':'2 — единственное чётное простое число.'},
        {'q':'Остаток при 1 000 ÷ 9:','options':['0','1','4','9'],'correct':1,'expl':'9×111=999. 1000−999=1. Остаток = 1.'},
        {'q':'Что больше: 2⁵ или 5²?','options':['2⁵','5²','равны','нельзя сравнить'],'correct':1,'expl':'2⁵=32; 5²=25. 32 > 25, значит 2⁵ > 5².'},
        {'q':'Вычислите: 2 + 3 × 4 − 1','options':['19','13','20','17'],'correct':1,'expl':'3×4=12. 2+12−1=13.'},
    ]
},

}

HOME_TEMPLATE = """    <section id="home" class="active">
      <div class="hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="showSection('theory')">📖 Начать урок →</button>
          <button class="btn btn-secondary" onclick="showSection('assessment')">🧪 Пройти тест</button>
        </div>
      </div>
      <div class="card" style="margin-top:20px">
        <div class="card-title"><span class="icon" style="background:var(--accent-blue-dim)">📋</span>Темы урока</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
{topic_cards}
        </div>
      </div>
    </section>"""

THEORY_TEMPLATE = """    <section id="theory">
      <div class="card">
        <div class="card-title"><span class="icon" style="background:var(--accent-dim)">📐</span>{title}</div>
        <p style="color:var(--text-secondary);margin-bottom:24px">{subtitle}</p>
      </div>
      <div class="generate-widget">
        <div class="widget-progress"><span id="slide-num">1</span> / <span id="slide-total"></span></div>
        <div class="widget-viewport"><div class="widget-track" id="widget-track">
{slides}
        </div></div>
        <div class="widget-nav">
          <button class="btn btn-secondary" onclick="prevSlide()">← Назад</button>
          <button class="btn btn-primary" onclick="nextSlide()">Далее →</button>
        </div>
      </div>
    </section>"""

def build_inline_theory(data):
    """Build inline theory section from topics."""
    slides = []
    for topic, desc in data.get('topics', []):
        slides.append(f'''          <div class="widget-slide">
            <h3>{topic}</h3>
            <p>{desc}</p>
          </div>''')
    slides_html = '\n'.join(slides)
    theory = THEORY_TEMPLATE.format(
        title=data['title'],
        subtitle=data['subtitle'],
        slides=slides_html
    )
    topic_cards = '\n'.join(
        f'          <div style="background:var(--bg-glass);padding:16px;border-radius:12px;border:1px solid var(--border-glass)"><strong style="color:var(--accent)">{t}</strong><p style="color:var(--text-secondary);margin-top:8px;font-size:.9rem">{d[:80]}{"..." if len(d)>80 else ""}</p></div>'
        for t, d in data.get('topics', [])
    )
    home = HOME_TEMPLATE.format(
        title=data['title'],
        subtitle=data['subtitle'],
        topic_cards=topic_cards
    )
    return home, theory

def build_algorithm_section(steps):
    lines = ['    <section id="algorithm">','      <div class="card">',
             '        <div class="card-title"><span class="icon" style="background:var(--accent-blue-dim)">🪜</span>Пошаговый алгоритм</div>',
             '        <div class="sequence-component">']
    for i, (h, p) in enumerate(steps):
        is_last = (i == len(steps) - 1)
        lines += [
            '          <div class="sequence-step">',
            f'            <div class="sequence-number">{i+1}</div>',
        ]
        if not is_last:
            lines.append('            <div class="sequence-connector"></div>')
        lines += [f'            <h4>{h}</h4>', f'            <p>{p}</p>', '          </div>']
    lines += ['        </div>', '      </div>', '    </section>']
    return '\n'.join(lines)

def build_examples_section(examples):
    lines = ['    <section id="examples">','      <div class="card">',
             '        <div class="card-title"><span class="icon" style="background:var(--accent-dim)">📝</span>Разбор задач</div>',
             '      </div>']
    for i, (typ, txt, sol) in enumerate(examples):
        sid = f'sol-{i+1}'
        lines += [
            '      <div class="problem-card">','        <div class="problem-header">',
            f'          <span class="problem-number">№ {i+1}</span>',
            f'          <span class="problem-type">{typ}</span>',
            '        </div>',
            f'        <div class="problem-text">{txt}</div>',
            f'        <button class="solution-btn" onclick="toggleSolution(\'{sid}\')">Показать решение</button>',
            f'        <div class="solution" id="{sid}">',
        ]
        for j, (label, result) in enumerate(sol):
            lines.append(f'          <div class="solution-step"><span class="step-num">{j+1}</span>{label}: <strong>{result}</strong></div>')
        lines += ['        </div>', '      </div>']
    lines.append('    </section>')
    return '\n'.join(lines)

def build_trainer_section():
    return '''    <section id="trainer">
      <div class="card">
        <div class="card-title"><span class="icon" style="background:var(--accent-dim)">🏋️</span>Тренажёр</div>
        <p style="color:var(--text-secondary);margin-bottom:24px">Случайные задачи. Подсказки и счётчик серий.</p>
        <div class="quiz-container" style="margin-bottom:20px">
          <div id="trainer-question" style="font-size:1.4rem;text-align:center;margin-bottom:24px;padding:24px;background:var(--bg-glass);border-radius:12px;">Нажмите «Новая задача» для начала</div>
          <div style="display:flex;gap:12px;margin-bottom:20px">
            <input type="text" id="trainer-answer" placeholder="Ваш ответ (буква A/B/C/D)" style="flex:1;padding:14px 16px;background:var(--bg-glass);border:2px solid var(--border-glass);border-radius:12px;color:var(--text-primary);font-size:1rem;outline:none;" />
            <button class="btn btn-primary" onclick="checkTrainer()" id="trainer-check-btn" disabled>Проверить</button>
          </div>
          <div id="trainer-feedback" style="min-height:60px;margin-bottom:16px;"></div>
          <div style="display:flex;gap:12px;justify-content:center">
            <button class="btn btn-secondary" onclick="newTrainerProblem()">Новая задача</button>
            <button class="btn btn-secondary" onclick="showTrainerHint()">Подсказка</button>
          </div>
          <div id="trainer-hint" style="display:none;margin-top:20px;padding:16px;background:var(--accent-blue-dim);border-radius:12px;border-left:4px solid var(--accent-blue);"></div>
        </div>
        <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap;">
          <div class="stat"><div class="stat-value" id="trainer-correct">0</div><div class="stat-label">Верно</div></div>
          <div class="stat"><div class="stat-value" id="trainer-total">0</div><div class="stat-label">Всего</div></div>
          <div class="stat"><div class="stat-value" id="trainer-streak">0</div><div class="stat-label">Серия</div></div>
        </div>
      </div>
    </section>'''

def build_assessment_section(questions):
    n = len(questions)
    return f'''    <section id="assessment">
      <div class="card">
        <div class="card-title"><span class="icon" style="background:var(--accent-blue-dim)">🧪</span>Аттестация — {n} вопросов</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">
          <div class="card" style="padding:24px;text-align:center">
            <div style="font-size:3rem;margin-bottom:12px">🔍</div>
            <h3 style="margin-bottom:8px">Диагностический тест</h3>
            <p style="color:var(--text-secondary);margin-bottom:20px">{n} вопросов с мгновенной обратной связью.</p>
            <button class="btn btn-primary" onclick="startDiagnostic()">Начать тест</button>
          </div>
          <div class="card" style="padding:24px;text-align:center">
            <div style="font-size:3rem;margin-bottom:12px">⏱️</div>
            <h3 style="margin-bottom:8px">Скоростная викторина</h3>
            <p style="color:var(--text-secondary);margin-bottom:20px">{n} вопросов · 10 минут.</p>
            <button class="btn btn-primary" onclick="startTimeAttack()">Начать викторину</button>
          </div>
        </div>
      </div>
      <div id="diagnostic-ui" style="display:none">
        <div class="card"><div class="card-title"><span class="icon" style="background:var(--accent-blue-dim)">🔍</span>Диагностический тест</div></div>
        <div class="quiz-container">
          <div class="quiz-progress">
            <span>Вопрос <span id="diag-current">1</span> / <span id="diag-total">{n}</span></span>
            <div class="progress-bar"><div class="progress-fill" id="diag-progress"></div></div>
            <span id="diag-score">0 правильных</span>
          </div>
          <div class="quiz-question" id="diag-question"></div>
          <div class="quiz-options" id="diag-options"></div>
          <div class="quiz-nav">
            <button class="btn btn-secondary" onclick="prevDiagnostic()" id="diag-prev" disabled>← Назад</button>
            <button class="btn btn-primary" onclick="nextDiagnostic()" id="diag-next" disabled>Далее →</button>
          </div>
          <div id="diag-explanation" style="display:none;margin-top:20px;padding:16px;background:var(--accent-dim);border-radius:12px;border-left:4px solid var(--accent);"></div>
        </div>
      </div>
      <div id="timeattack-ui" style="display:none">
        <div class="timer hidden" id="ta-timer">10:00</div>
        <div class="card"><div class="card-title"><span class="icon" style="background:var(--accent-warm-dim)">⏱️</span>Скоростная викторина</div></div>
        <div class="quiz-container">
          <div class="quiz-progress">
            <span>Вопрос <span id="ta-current">1</span> / {n}</span>
            <div class="progress-bar"><div class="progress-fill" id="ta-progress"></div></div>
          </div>
          <div class="quiz-question" id="ta-question"></div>
          <div class="quiz-options" id="ta-options"></div>
          <div style="display:flex;justify-content:flex-end;margin-top:24px">
            <button class="btn btn-primary" onclick="nextTimeAttack()" id="ta-next">Ответить →</button>
          </div>
        </div>
      </div>
      <div id="results-ui" style="display:none">
        <div class="card">
          <div class="results-container">
            <div class="score-label">Ваш результат</div>
            <div class="score-circle" id="result-circle"><div class="score-value" id="result-percent">0%</div></div>
            <div class="score-message" id="result-message"></div>
            <div class="results-breakdown">
              <div class="breakdown-item"><div class="breakdown-value" id="result-correct">0</div><div class="breakdown-label">Верно</div></div>
              <div class="breakdown-item"><div class="breakdown-value" id="result-wrong">0</div><div class="breakdown-label">Ошибок</div></div>
              <div class="breakdown-item"><div class="breakdown-value" id="result-time">0:00</div><div class="breakdown-label">Время</div></div>
              <div class="breakdown-item"><div class="breakdown-value" id="result-mastery">—</div><div class="breakdown-label">Уровень</div></div>
            </div>
            <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
              <button class="btn btn-primary" onclick="resetAssessment()">Пройти ещё раз</button>
              <button class="btn btn-secondary" onclick="showSection('theory')">Вернуться к теории</button>
            </div>
          </div>
        </div>
      </div>
    </section>'''

def build_js(slide_count, questions):
    q_json = json.dumps(questions, ensure_ascii=False, indent=2)
    n = len(questions)
    return f"""    <script>
      const AppState = {{
        currentSection: 'home', slide: 0,
        trainer: {{ correct:0, total:0, streak:0, current:null }},
        diagnostic: {{ current:0, score:0, answers:[] }},
        timeAttack: {{ current:0, score:0, timer:null, timeLeft:600, startTime:0, answers:[] }},
        mode: null
      }};
      function showSection(id) {{
        document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        document.querySelector('.nav-links a[data-section="' + id + '"]')?.classList.add('active');
        window.scrollTo(0, 0);
        AppState.currentSection = id;
      }}
      document.querySelectorAll('.nav-links a').forEach(link => {{
        link.addEventListener('click', e => {{ e.preventDefault(); showSection(link.dataset.section); }});
      }});
      const totalSlides = {slide_count};
      const track = document.getElementById('widget-track');
      const slideNumEl = document.getElementById('slide-num');
      const slideTotalEl = document.getElementById('slide-total');
      if (slideTotalEl) slideTotalEl.textContent = totalSlides;
      function renderSlide() {{
        if (track) track.style.transform = 'translateX(-' + AppState.slide * 100 + '%)';
        if (slideNumEl) slideNumEl.textContent = AppState.slide + 1;
      }}
      function nextSlide() {{ if (AppState.slide < totalSlides - 1) {{ AppState.slide++; renderSlide(); }} }}
      function prevSlide() {{ if (AppState.slide > 0) {{ AppState.slide--; renderSlide(); }} }}
      function toggleSolution(id) {{
        const el = document.getElementById(id);
        el.classList.toggle('active');
        el.previousElementSibling.textContent = el.classList.contains('active') ? 'Скрыть решение' : 'Показать решение';
      }}
      const allQuestions = {q_json};
      function newTrainerProblem() {{
        const q = allQuestions[Math.floor(Math.random() * allQuestions.length)];
        AppState.trainer.current = q;
        const letters = ['A','B','C','D'];
        const opts = q.opts.map((o,i) => letters[i]+') '+o).join(' | ');
        document.getElementById('trainer-question').textContent = q.text + '\\n' + opts;
        document.getElementById('trainer-answer').value = '';
        document.getElementById('trainer-feedback').innerHTML = '';
        document.getElementById('trainer-hint').style.display = 'none';
        document.getElementById('trainer-check-btn').disabled = false;
      }}
      function showTrainerHint() {{
        if (!AppState.trainer.current) return;
        document.getElementById('trainer-hint').style.display = 'block';
        document.getElementById('trainer-hint').textContent = '💡 ' + AppState.trainer.current.hint;
      }}
      function checkTrainer() {{
        if (!AppState.trainer.current) return;
        const userStr = document.getElementById('trainer-answer').value.trim().toUpperCase();
        if (!userStr) return;
        AppState.trainer.total++;
        const letters = ['A','B','C','D'];
        const correct = letters[AppState.trainer.current.ans];
        const isCorrect = userStr === correct;
        if (isCorrect) {{
          AppState.trainer.correct++;
          AppState.trainer.streak++;
          document.getElementById('trainer-feedback').innerHTML = '<div style="color:var(--success);font-weight:700;font-size:1.1rem;">✓ Верно!</div>';
        }} else {{
          AppState.trainer.streak = 0;
          document.getElementById('trainer-feedback').innerHTML = '<div style="color:var(--error);font-weight:700;font-size:1.1rem;">✗ Неверно. Правильный ответ: ' + correct + '</div>';
        }}
        document.getElementById('trainer-correct').textContent = AppState.trainer.correct;
        document.getElementById('trainer-total').textContent = AppState.trainer.total;
        document.getElementById('trainer-streak').textContent = AppState.trainer.streak;
        document.getElementById('trainer-check-btn').disabled = true;
      }}
      document.getElementById('trainer-answer')?.addEventListener('keypress', e => {{ if (e.key === 'Enter') checkTrainer(); }});
      const diagnosticQuestions = allQuestions;
      function startDiagnostic() {{
        AppState.mode = 'diagnostic';
        AppState.diagnostic = {{ current:0, score:0, answers:[] }};
        document.getElementById('diagnostic-ui').style.display = 'block';
        document.getElementById('timeattack-ui').style.display = 'none';
        document.getElementById('results-ui').style.display = 'none';
        document.getElementById('diag-total').textContent = diagnosticQuestions.length;
        renderDiagnostic();
      }}
      function renderDiagnostic() {{
        const q = diagnosticQuestions[AppState.diagnostic.current];
        document.getElementById('diag-current').textContent = AppState.diagnostic.current + 1;
        document.getElementById('diag-score').textContent = AppState.diagnostic.score + ' правильных';
        document.getElementById('diag-progress').style.width = ((AppState.diagnostic.current + 1) / diagnosticQuestions.length * 100) + '%';
        document.getElementById('diag-question').textContent = q.text;
        document.getElementById('diag-explanation').style.display = 'none';
        document.getElementById('diag-next').disabled = true;
        document.getElementById('diag-prev').disabled = AppState.diagnostic.current === 0;
        const optsDiv = document.getElementById('diag-options');
        optsDiv.innerHTML = '';
        q.opts.forEach((opt, i) => {{
          const div = document.createElement('div');
          div.className = 'quiz-option';
          div.innerHTML = '<div class="option-letter">' + String.fromCharCode(65+i) + '</div><div>' + opt + '</div>';
          div.onclick = () => selectDiagnostic(i, div, q);
          optsDiv.appendChild(div);
        }});
      }}
      function selectDiagnostic(i, div, q) {{
        document.querySelectorAll('#diag-options .quiz-option').forEach(o => o.classList.add('disabled'));
        const isCorrect = i === q.ans;
        div.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) document.querySelectorAll('#diag-options .quiz-option')[q.ans].classList.add('correct');
        if (isCorrect) AppState.diagnostic.score++;
        AppState.diagnostic.answers.push(i);
        document.getElementById('diag-explanation').textContent = (isCorrect ? '✓ ' : '✗ ') + q.hint;
        document.getElementById('diag-explanation').style.display = 'block';
        document.getElementById('diag-next').disabled = false;
      }}
      function nextDiagnostic() {{
        if (AppState.diagnostic.current < diagnosticQuestions.length - 1) {{
          AppState.diagnostic.current++;
          renderDiagnostic();
        }} else {{
          showResults(AppState.diagnostic.score, diagnosticQuestions.length, 0, 'diagnostic');
        }}
      }}
      function prevDiagnostic() {{
        if (AppState.diagnostic.current > 0) {{ AppState.diagnostic.current--; renderDiagnostic(); }}
      }}
      function startTimeAttack() {{
        AppState.mode = 'timeattack';
        AppState.timeAttack = {{ current:0, score:0, timer:null, timeLeft:600, startTime:Date.now(), answers:[] }};
        document.getElementById('diagnostic-ui').style.display = 'none';
        document.getElementById('timeattack-ui').style.display = 'block';
        document.getElementById('results-ui').style.display = 'none';
        const timerEl = document.getElementById('ta-timer');
        timerEl.classList.remove('hidden');
        AppState.timeAttack.timer = setInterval(() => {{
          AppState.timeAttack.timeLeft--;
          const m = Math.floor(AppState.timeAttack.timeLeft / 60);
          const s = AppState.timeAttack.timeLeft % 60;
          timerEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
          timerEl.className = 'timer' + (AppState.timeAttack.timeLeft <= 60 ? ' danger' : AppState.timeAttack.timeLeft <= 120 ? ' warning' : '');
          if (AppState.timeAttack.timeLeft <= 0) {{
            clearInterval(AppState.timeAttack.timer);
            showResults(AppState.timeAttack.score, diagnosticQuestions.length, 0, 'timeattack');
          }}
        }}, 1000);
        renderTimeAttack();
      }}
      function renderTimeAttack() {{
        const q = diagnosticQuestions[AppState.timeAttack.current];
        document.getElementById('ta-current').textContent = AppState.timeAttack.current + 1;
        document.getElementById('ta-progress').style.width = ((AppState.timeAttack.current + 1) / diagnosticQuestions.length * 100) + '%';
        document.getElementById('ta-question').textContent = q.text;
        const optsDiv = document.getElementById('ta-options');
        optsDiv.innerHTML = '';
        q.opts.forEach((opt, i) => {{
          const div = document.createElement('div');
          div.className = 'quiz-option';
          div.innerHTML = '<div class="option-letter">' + String.fromCharCode(65+i) + '</div><div>' + opt + '</div>';
          div.onclick = () => {{
            if (i === q.ans) AppState.timeAttack.score++;
            AppState.timeAttack.answers.push(i);
            nextTimeAttack();
          }};
          optsDiv.appendChild(div);
        }});
        document.getElementById('ta-next').style.display = 'none';
      }}
      function nextTimeAttack() {{
        if (AppState.timeAttack.current < diagnosticQuestions.length - 1) {{
          AppState.timeAttack.current++;
          renderTimeAttack();
        }} else {{
          clearInterval(AppState.timeAttack.timer);
          const elapsed = Math.round((Date.now() - AppState.timeAttack.startTime) / 1000);
          showResults(AppState.timeAttack.score, diagnosticQuestions.length, elapsed, 'timeattack');
        }}
      }}
      function showResults(correct, total, elapsed, mode) {{
        document.getElementById('diagnostic-ui').style.display = 'none';
        document.getElementById('timeattack-ui').style.display = 'none';
        document.getElementById('results-ui').style.display = 'block';
        const pct = Math.round(correct / total * 100);
        document.getElementById('result-circle').style.setProperty('--score', pct);
        document.getElementById('result-percent').textContent = pct + '%';
        document.getElementById('result-correct').textContent = correct;
        document.getElementById('result-wrong').textContent = total - correct;
        const m = Math.floor(elapsed/60), s = elapsed%60;
        document.getElementById('result-time').textContent = m + ':' + (s<10?'0':'') + s;
        const mastery = pct >= 90 ? 'Отлично' : pct >= 70 ? 'Хорошо' : pct >= 50 ? 'Удовл.' : 'Слабо';
        document.getElementById('result-mastery').textContent = mastery;
        document.getElementById('result-message').textContent = pct >= 90 ? '🏆 Отличный результат!' : pct >= 70 ? '👍 Хороший результат!' : '📚 Повторите теорию';
      }}
      function resetAssessment() {{
        document.getElementById('diagnostic-ui').style.display = 'none';
        document.getElementById('timeattack-ui').style.display = 'none';
        document.getElementById('results-ui').style.display = 'none';
        document.getElementById('ta-timer').classList.add('hidden');
      }}
      document.addEventListener('DOMContentLoaded', () => {{ newTrainerProblem(); }});
    </script>"""

def normalize_questions(qs):
    """Convert questions with 'q'/'options'/'correct'/'expl' to 'text'/'opts'/'ans'/'hint' format."""
    result = []
    for q in qs:
        if 'text' in q:
            result.append(q)
        else:
            result.append({'text': q['q'], 'opts': q['options'], 'ans': q['correct'], 'hint': q.get('expl', '')})
    return result

def process_lesson(key, data):
    path_rel = data['filename']
    print(f"  Processing {path_rel}...")

    if data.get('use_git'):
        git_rel = data.get('git_path', path_rel).replace('\\', '/')
        raw = git_show('594728a', f'P002_Math_5_Darslik/{git_rel}')
        if not raw:
            print(f"  [WARN] Not found in 594728a: {path_rel}")
            return
        raw_clean = strip_textbook_images(raw)
        home_html, theory_html = extract_home_and_theory(raw_clean)
        if not home_html or not theory_html:
            print(f"  [WARN] Could not extract from 594728a: {path_rel}")
            return
        slide_cnt = max(len(re.findall(r'<div class="widget-slide">', theory_html)), 1)
    else:
        topics = data.get('topics', [('Тема', 'Описание темы урока')])
        home_html, theory_html = build_inline_theory(data)
        slide_cnt = len(topics)

    questions = normalize_questions(data['questions'])
    algo_html = build_algorithm_section(data['algorithm'])
    ex_html = build_examples_section(data['examples'])
    trainer_html = build_trainer_section()
    assess_html = build_assessment_section(questions)
    js = build_js(slide_cnt, questions)

    n = data['num']
    title = data['title']
    html = f"""<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Урок {n} — {title}</title>
    <style>
{CSS}
    </style>
  </head>
  <body>
    <div class="bg-animation"></div>
    <nav>
      <div class="nav-container">
        <div class="logo">📐 Урок {n}</div>
        <ul class="nav-links">
          <li><a href="#" class="active" data-section="home">Главная</a></li>
          <li><a href="#" data-section="theory">Теория</a></li>
          <li><a href="#" data-section="algorithm">Алгоритм</a></li>
          <li><a href="#" data-section="examples">Примеры</a></li>
          <li><a href="#" data-section="trainer">Тренажёр</a></li>
          <li><a href="#" data-section="assessment">Аттестация</a></li>
        </ul>
      </div>
    </nav>

{home_html}

{theory_html}

{algo_html}

{ex_html}

{trainer_html}

{assess_html}

{js}
  </body>
</html>
"""
    out = os.path.join(P002, path_rel)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  [OK] {os.path.basename(path_rel):25s} slides={slide_cnt} questions={len(questions)}")

def main():
    print("=" * 60)
    print("P002 — Rebuild class-1 lessons 3, 4, 7, 8")
    print("=" * 60)
    for key, data in LESSON_DATA.items():
        process_lesson(key, data)
    print("\nDone.")

if __name__ == '__main__':
    main()
