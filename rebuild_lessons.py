#!/usr/bin/env python3
"""
Rebuild 4 old-format lesson files into the new Lesson-16 format.
Gets home+theory from commit 594728a, strips textbook images, adds new sections.
"""

import subprocess, re, os, json

BASE = r"C:\Users\Administrator\Documents\Claude\Projects"
P002 = os.path.join(BASE, "P002_Math_5_Darslik")

def git_show(commit, path):
    r = subprocess.run(['git', 'show', f'{commit}:{path}'],
                       capture_output=True, text=True, encoding='utf-8',
                       cwd=BASE)
    return r.stdout

def strip_textbook_images(html):
    """Remove <div class=\"card\"> blocks that contain Из учебника or .webp imgs."""
    # Pattern: card div block that contains textbook images
    card_block = re.compile(
        r'\s*<div class="card"[^>]*>\s*<div class="card-title"[^>]*>'
        r'[\s\S]*?(?:Из учебника|\.webp)[\s\S]*?</div>\s*</div>',
        re.DOTALL)
    result = card_block.sub('', html)
    # Also remove simpler one-card patterns
    img_card = re.compile(
        r'\s*<div class="card"[^>]*>\s*<div[^>]*>[\s\S]*?\.webp[\s\S]*?</div>\s*</div>',
        re.DOTALL)
    result = img_card.sub('', result)
    return result

def extract_home_and_theory(stripped_content):
    """Extract home + theory sections from stripped 594728a content."""
    # Find home section
    home_m = re.search(r'(<section id="home"[^>]*>)', stripped_content)
    if not home_m:
        return None, None
    # Find theory section start
    theory_m = re.search(r'<section id="theory"[^>]*>', stripped_content)
    if not theory_m:
        return None, None
    # Find where script starts (end of theory)
    script_m = re.search(r'\s*<script>', stripped_content)
    if not script_m:
        return None, None
    # Content between home start and script
    body_content = stripped_content[home_m.start():script_m.start()].rstrip()
    # Split into home and theory
    home_end = theory_m.start()
    home_section = stripped_content[home_m.start():home_end].rstrip()
    theory_section = stripped_content[theory_m.start():script_m.start()].rstrip()
    # Find last </section> in theory
    last_close = theory_section.rfind('</section>')
    if last_close != -1:
        theory_section = theory_section[:last_close + len('</section>')]
    return home_section, theory_section

def count_slides(theory_html):
    return max(len(re.findall(r'<div class="widget-slide">', theory_html)), 1)

# ============================================================
# LESSON DATA (algorithm, examples, assessment per topic)
# ============================================================

LESSON_DATA = {

# ---- CLASS 1 / LESSON 1 : Обзор курса ----
'c1l1': {
    'num': 1, 'class': 1,
    'filename': 'math-5-class-1/lesson-1.html',
    'title': 'Обзор курса',
    'subtitle': 'Урок 1. Повторение: натуральные числа, дроби, выражения и уравнения.',
    'topics': [
        ('Натуральные числа', 'Разряды, классы, запись и чтение больших чисел.'),
        ('Дроби', 'Правильные, неправильные, смешанные. Сравнение дробей.'),
        ('Выражения', 'Порядок действий, скобки, законы арифметики.'),
        ('Уравнения', 'Нахождение неизвестного компонента. Проверка.'),
    ],
    'algorithm': [
        ('Натуральные числа', 'Разбейте число на классы по три цифры справа → читайте каждый класс отдельно (единицы, тысячи, миллионы).'),
        ('Сравнение чисел', 'Сравнивайте поразрядно слева направо: больше разрядов → больше число; при равном числе разрядов — первая различающаяся цифра решает.'),
        ('Дроби', 'Для сравнения дробей приведите к общему знаменателю → сравнивайте числители.'),
        ('Порядок действий', 'Выполняйте: (1) действия в скобках; (2) умножение и деление слева направо; (3) сложение и вычитание слева направо.'),
        ('Уравнения', 'Найдите неизвестное: перенесите известные части, используйте правило «неизвестное слагаемое = сумма − слагаемое», «множитель = произведение : другой множитель» и т.д. Сделайте проверку.'),
    ],
    'examples': [
        ('Запись числа', 'Запишите цифрами: семь миллионов четыреста двенадцать тысяч пятьдесят.', [
            ('Млн: 7, тыс: 412, ед: 050', '7 412 050'),
            ('Итог', '7 412 050'),
        ]),
        ('Сравнение', 'Сравните: 5 384 200 и 5 384 020.', [
            ('Сравниваем поразрядно', '5 = 5, 3 = 3, 8 = 8, 4 = 4, 2 > 0'),
            ('Итог', '5 384 200 > 5 384 020'),
        ]),
        ('Округление', 'Округлите 348 762 до тысяч.', [
            ('Цифра тысяч = 8, после неё: 762 ≥ 500', 'Округляем вверх'),
            ('Итог', '349 000'),
        ]),
        ('Порядок действий', 'Вычислите: 120 : (4 + 2) × 5 − 30.', [
            ('Скобки: 4 + 2 = 6', '120 : 6 × 5 − 30'),
            ('Слева направо: 120 : 6 = 20; 20 × 5 = 100', '100 − 30'),
            ('Итог', '70'),
        ]),
        ('Уравнение', 'Решите: x + 245 = 780.', [
            ('x = 780 − 245', 'x = 535'),
            ('Проверка: 535 + 245 = 780 ✓', 'x = 535'),
        ]),
        ('Дроби', 'Сравните: 3/4 и 5/6.', [
            ('Общий знаменатель: НОК(4,6) = 12', '3/4 = 9/12; 5/6 = 10/12'),
            ('9 < 10', '3/4 < 5/6'),
        ]),
    ],
    'trainer_type': 'arithmetic',
    'questions': [
        {'q':'Запишите цифрами: «три миллиона пятьдесят тысяч восемь»','options':['3 050 008','3 500 008','3 050 800','30 500 08'],'correct':0,'expl':'3 млн 050 тыс 008 → 3 050 008.'},
        {'q':'Сколько разрядов в числе 2 500 000?','options':['6','7','5','8'],'correct':1,'expl':'2 500 000 — семизначное число, 7 разрядов.'},
        {'q':'Сравните: 4 389 100 и 4 389 010','options':['<','>','=','нельзя'],'correct':1,'expl':'Сравниваем разряды: ...1 > 0, значит 4 389 100 > 4 389 010.'},
        {'q':'Округлите 567 890 до тысяч.','options':['567 000','568 000','570 000','560 000'],'correct':1,'expl':'Цифра тысяч = 7, после неё 890 ≥ 500 → +1 → 568 000.'},
        {'q':'Вычислите: 84 : (3 + 4) × 2','options':['24','12','168','6'],'correct':0,'expl':'Скобки: 3+4=7. 84:7=12. 12×2=24.'},
        {'q':'Решите: y − 136 = 254','options':['y=390','y=118','y=400','y=290'],'correct':0,'expl':'y = 254 + 136 = 390. Проверка: 390 − 136 = 254 ✓.'},
        {'q':'Наибольшее число: 5 009 000, 5 090 000, 5 900 000, 5 000 900','options':['5 009 000','5 090 000','5 900 000','5 000 900'],'correct':2,'expl':'Сотни тысяч: 0 < 0 < 9 > 0. 5 900 000 — наибольшее.'},
        {'q':'Значение цифры 6 в числе 3 684 000','options':['6 000','60 000','600 000','6 000 000'],'correct':2,'expl':'6 в разряде сотен тысяч: 6 × 100 000 = 600 000.'},
        {'q':'Вычислите: (18 + 12) : 5 + 7 × 2','options':['20','16','8','24'],'correct':0,'expl':'(30):5=6; 7×2=14; 6+14=20.'},
        {'q':'Решите: 3x = 720','options':['x=240','x=215','x=2160','x=717'],'correct':0,'expl':'x = 720 : 3 = 240. Проверка: 3×240=720 ✓.'},
        {'q':'Округлите 1 234 567 до миллионов.','options':['1 000 000','2 000 000','1 200 000','1 234 000'],'correct':0,'expl':'После единиц млн идёт 234 567 < 500 000 → 1 000 000.'},
        {'q':'Число разрядов в числе 10 000 000?','options':['7','8','6','9'],'correct':1,'expl':'10 000 000 — восьмизначное число (8 разрядов).'},
        {'q':'Сравните: 2/3 и 3/4','options':['2/3 > 3/4','2/3 < 3/4','2/3 = 3/4','нельзя'],'correct':1,'expl':'НОК(3,4)=12. 2/3=8/12; 3/4=9/12. 8<9, значит 2/3 < 3/4.'},
        {'q':'Вычислите: 200 − 5 × (3 + 7)','options':['150','1950','165','120'],'correct':0,'expl':'Скобки: 3+7=10. Умножение: 5×10=50. Вычитание: 200−50=150.'},
        {'q':'Решите: x : 15 = 12','options':['x=180','x=27','x=3','x=0.8'],'correct':0,'expl':'x = 12 × 15 = 180. Проверка: 180:15=12 ✓.'},
        {'q':'Правильная дробь — это дробь, у которой...','options':['числитель = знаменатель','числитель > знаменатель','числитель < знаменатель','знаменатель = 0'],'correct':2,'expl':'Правильная дробь: числитель строго меньше знаменателя.'},
        {'q':'1/2 в числовом виде равно','options':['0,5','0,2','0,12','2'],'correct':0,'expl':'1÷2 = 0,5.'},
        {'q':'Запишите цифрами: «восемьсот пятьдесят миллионов»','options':['850 000 000','85 000 000','8 500 000','850 000'],'correct':0,'expl':'850 млн = 850 × 1 000 000 = 850 000 000.'},
        {'q':'Смешанное число 2 3/5 в виде неправильной дроби:','options':['5/3','13/5','12/5','10/3'],'correct':1,'expl':'2×5+3=13; знаменатель=5. Итог: 13/5.'},
        {'q':'Вычислите: 360 : 6 : 3 + 10','options':['30','70','20','100'],'correct':0,'expl':'360:6=60; 60:3=20; 20+10=30.'},
    ]
},

# ---- CLASS 1 / LESSON 9 : Делители и кратные ----
'c1l9': {
    'num': 9, 'class': 1,
    'filename': 'math-5-class-1/lesson-9.html',
    'title': 'Делители и кратные',
    'subtitle': 'Урок 9. Признаки делимости. НОД и НОК.',
    'topics': [
        ('Делители', 'Натуральное число a является делителем b, если b : a не имеет остатка.'),
        ('Кратные', 'Число b кратно a, если b = a × k для некоторого натурального k.'),
        ('Признаки делимости', 'На 2, 3, 5, 9, 10 — быстрые проверки без деления.'),
        ('НОД и НОК', 'Наибольший общий делитель и наименьшее общее кратное двух чисел.'),
    ],
    'algorithm': [
        ('Найти все делители числа n', 'Перебирайте числа от 1 до √n. Если число d делит n нацело — и d, и n/d являются делителями.'),
        ('Признаки делимости', 'На 2: последняя цифра чётная. На 3: сумма цифр кратна 3. На 5: оканчивается на 0 или 5. На 9: сумма цифр кратна 9. На 10: оканчивается на 0.'),
        ('Найти НОД', 'Запишите все делители каждого числа → найдите наибольший общий. Или используйте алгоритм Евклида: НОД(a,b) = НОД(b, a mod b).'),
        ('Найти НОК', 'НОК(a,b) = a × b / НОД(a,b). Или разложите на простые множители и возьмите наибольшие степени каждого простого.'),
        ('Проверка', 'НОД × НОК = a × b (для двух чисел a и b). Используйте для контроля.'),
    ],
    'examples': [
        ('Делители числа', 'Найдите все делители числа 24.', [
            ('1×24, 2×12, 3×8, 4×6', 'Делители: 1, 2, 3, 4, 6, 8, 12, 24'),
            ('Итог', '{1, 2, 3, 4, 6, 8, 12, 24}'),
        ]),
        ('Признаки делимости', 'Делится ли 5 436 на 3?', [
            ('Сумма цифр: 5+4+3+6 = 18', '18 кратно 3'),
            ('Итог', '5 436 делится на 3'),
        ]),
        ('НОД двух чисел', 'Найдите НОД(18, 24).', [
            ('Делители 18: 1,2,3,6,9,18', 'Делители 24: 1,2,3,4,6,8,12,24'),
            ('Общие: 1, 2, 3, 6. Наибольший = 6', 'НОД(18, 24) = 6'),
        ]),
        ('НОК двух чисел', 'Найдите НОК(4, 6).', [
            ('НОД(4,6) = 2', 'НОК = 4 × 6 / 2 = 12'),
            ('Итог', 'НОК(4, 6) = 12'),
        ]),
        ('Простые числа', 'Является ли число 37 простым?', [
            ('√37 ≈ 6,1. Делим на 2,3,5: 37 не делится ни на одно', 'У числа 37 нет делителей кроме 1 и 37'),
            ('Итог', '37 — простое число'),
        ]),
        ('Алгоритм Евклида', 'Найдите НОД(48, 36) методом Евклида.', [
            ('НОД(48,36) = НОД(36,12) = НОД(12,0) = 12', '48=36×1+12; 36=12×3+0'),
            ('Итог', 'НОД(48, 36) = 12'),
        ]),
    ],
    'trainer_type': 'divisors',
    'questions': [
        {'q':'Какое число является делителем числа 30?','options':['7','8','6','11'],'correct':2,'expl':'30 : 6 = 5 (без остатка), значит 6 — делитель 30.'},
        {'q':'Числа, кратные 4, из: 10, 12, 14, 16','options':['10 и 14','12 и 16','10 и 12','14 и 16'],'correct':1,'expl':'12=4×3 ✓; 16=4×4 ✓. Остальные не делятся на 4 нацело.'},
        {'q':'Признак делимости на 9: 2+8+0+8 = ?','options':['2808 делится на 9','2808 не делится на 9','нужно делить','нет признака'],'correct':0,'expl':'Сумма цифр: 2+8+0+8=18. 18 кратно 9, значит 2808 делится на 9.'},
        {'q':'НОД(12, 18) = ?','options':['3','6','12','18'],'correct':1,'expl':'Делители 12: 1,2,3,4,6,12. Делители 18: 1,2,3,6,9,18. НОД = 6.'},
        {'q':'НОК(3, 5) = ?','options':['8','15','1','30'],'correct':1,'expl':'НОД(3,5)=1. НОК = 3×5/1 = 15.'},
        {'q':'Сколько делителей у числа 16?','options':['4','5','6','3'],'correct':1,'expl':'Делители 16: 1, 2, 4, 8, 16 — итого 5.'},
        {'q':'Простое число — это число, которое...','options':['делится только на 1 и само себя','делится на 2','имеет чётное число делителей','кратно любому числу'],'correct':0,'expl':'Простое число имеет ровно два делителя: 1 и само себя.'},
        {'q':'Является ли число 1 простым?','options':['да','нет, у 1 только один делитель','нет, 1 делится на 2','да, это исключение'],'correct':1,'expl':'У числа 1 только один делитель (само себя). По определению, простое ≥ 2.'},
        {'q':'НОД(100, 75) = ?','options':['5','25','50','75'],'correct':1,'expl':'100 = 4×25; 75 = 3×25. НОД = 25.'},
        {'q':'Делится ли 135 на 5?','options':['нет','да, оканчивается на 5','да, сумма цифр = 9','нельзя определить'],'correct':1,'expl':'135 оканчивается на 5 → делится на 5.'},
        {'q':'НОК(6, 9) = ?','options':['3','54','18','63'],'correct':2,'expl':'НОД(6,9)=3. НОК = 6×9/3 = 18.'},
        {'q':'Сколько натуральных делителей у простого числа p?','options':['1','2','p','бесконечно'],'correct':1,'expl':'У простого числа ровно 2 делителя: 1 и p.'},
        {'q':'Какое число НЕ является делителем 42?','options':['6','7','8','14'],'correct':2,'expl':'42:8 = 5 остаток 2 ≠ 0. Значит 8 — не делитель 42.'},
        {'q':'НОД(a,b)×НОК(a,b) при a=4, b=6:','options':['24','48','12','10'],'correct':0,'expl':'НОД=2, НОК=12. 2×12=24. Также: 4×6=24. ✓'},
        {'q':'Разложите 12 на простые множители:','options':['2×6','2²×3','3×4','2×2×2'],'correct':1,'expl':'12 = 2×6 = 2×2×3 = 2²×3.'},
        {'q':'Число 48 делится на 3?','options':['нет','да: 4+8=12, 12 кратно 3','да: оканчивается на 8','нет: чётное'],'correct':1,'expl':'Сумма цифр 48: 4+8=12. 12 кратно 3, значит 48 делится на 3.'},
        {'q':'НОК(2, 3, 4) = ?','options':['6','12','24','48'],'correct':1,'expl':'2=2; 3=3; 4=2². НОК = 2²×3 = 12.'},
        {'q':'Чётное число — это число, кратное:','options':['3','5','2','9'],'correct':2,'expl':'Чётное число делится на 2 нацело.'},
        {'q':'Делится ли 1 110 на 10?','options':['нет','да, оканчивается на 0','да, сумма цифр 3','нет, нечётное'],'correct':1,'expl':'1 110 оканчивается на 0 → делится на 10.'},
        {'q':'НОД(17, 51) = ?','options':['1','3','17','51'],'correct':2,'expl':'51 = 17×3, значит 17 является делителем 51. НОД = 17.'},
    ]
},

# ---- CLASS 2 / LESSON 1 : Введение в дроби ----
'c2l1': {
    'num': 1, 'class': 2,
    'filename': 'math-5-class-2/Lesson-1.html',
    'title': 'Введение в дроби',
    'subtitle': 'Урок 1. Обыкновенные дроби: числитель, знаменатель, виды дробей.',
    'topics': [
        ('Дробь', 'Число вида a/b, где a — числитель, b — знаменатель (b ≠ 0).'),
        ('Виды дробей', 'Правильная (a < b), неправильная (a ≥ b), смешанное число.'),
        ('Сравнение дробей', 'С одинаковым знаменателем, с одинаковым числителем, через десятичные.'),
        ('Дроби на числовой прямой', 'Расположение дробей и смешанных чисел на прямой.'),
    ],
    'algorithm': [
        ('Записать дробь', 'Считайте: на сколько равных частей разделили (знаменатель снизу) и сколько частей взяли (числитель сверху).'),
        ('Перевести неправильную в смешанное', 'Разделите числитель на знаменатель. Частное = целая часть, остаток = новый числитель.'),
        ('Перевести смешанное в неправильную', 'Целая часть × знаменатель + числитель = новый числитель. Знаменатель тот же.'),
        ('Сравнить дроби с разными знаменателями', 'Приведите к общему знаменателю (НОК) → сравните числители.'),
        ('Найти дробь от числа', 'a/b от N = N × a : b. Сначала разделите N на b, потом умножьте на a.'),
    ],
    'examples': [
        ('Запись дроби', 'Арбуз разрезали на 8 частей. Съели 3 части. Какую часть съели?', [
            ('Взяли 3 из 8 равных частей', 'Дробь: 3/8'),
            ('Итог', '3/8 арбуза'),
        ]),
        ('Неправильная → смешанное', 'Переведите 17/5 в смешанное число.', [
            ('17 : 5 = 3 (остаток 2)', '17/5 = 3 целых 2/5'),
            ('Итог', '3²⁄₅'),
        ]),
        ('Смешанное → неправильная', 'Переведите 4⅔ в неправильную дробь.', [
            ('4×3 + 2 = 14; знаменатель = 3', '4⅔ = 14/3'),
            ('Итог', '14/3'),
        ]),
        ('Сравнение', 'Сравните 5/8 и 3/4.', [
            ('НОК(8,4) = 8. 5/8 и 6/8', '5 < 6'),
            ('Итог', '5/8 < 3/4'),
        ]),
        ('Дробь числа', 'Найдите 3/5 от 40.', [
            ('40 : 5 × 3 = 8 × 3 = 24', '3/5 от 40 = 24'),
            ('Итог', '24'),
        ]),
        ('Числовая прямая', 'Где на числовой прямой находится 7/4?', [
            ('7/4 = 1¾; между 1 и 2, ближе к 2', '1 < 7/4 < 2'),
            ('Итог', 'Между 1 и 2'),
        ]),
    ],
    'trainer_type': 'fractions',
    'questions': [
        {'q':'Числитель дроби 7/12 равен:','options':['12','7','5','19'],'correct':1,'expl':'Числитель — число над чертой дроби. В дроби 7/12 числитель = 7.'},
        {'q':'Знаменатель дроби 5/8 равен:','options':['5','13','8','3'],'correct':2,'expl':'Знаменатель — число под чертой. В дроби 5/8 знаменатель = 8.'},
        {'q':'Правильная дробь — это:','options':['числитель > знаменатель','числитель = знаменатель','числитель < знаменатель','знаменатель = 0'],'correct':2,'expl':'Правильная дробь: числитель строго меньше знаменателя (a < b).'},
        {'q':'Переведите 11/4 в смешанное число:','options':['2¾','3¼','11/4','1¾'],'correct':0,'expl':'11:4=2 (ост.3). Итог: 2¾.'},
        {'q':'Смешанное число 3⅖ = ?','options':['17/5','14/5','8/5','35/5'],'correct':0,'expl':'3×5+2=17. Знаменатель 5. Итог: 17/5.'},
        {'q':'Сравните: 2/3 и 4/5','options':['2/3 > 4/5','2/3 < 4/5','2/3 = 4/5','нельзя сравнить'],'correct':1,'expl':'НОК(3,5)=15. 2/3=10/15; 4/5=12/15. 10<12, значит 2/3 < 4/5.'},
        {'q':'Дробь 0/7 равна:','options':['7','1','0','1/7'],'correct':2,'expl':'0/7 = 0÷7 = 0. Числитель 0 → дробь равна нулю.'},
        {'q':'Дробь 9/9 равна:','options':['0','9','1','1/9'],'correct':2,'expl':'9/9 = 9÷9 = 1. Числитель = знаменатель → дробь = 1.'},
        {'q':'Найдите 1/4 от 100.','options':['400','4','25','40'],'correct':2,'expl':'100÷4 = 25. Итог: 25.'},
        {'q':'Найдите 3/4 от 80.','options':['20','60','30','240'],'correct':1,'expl':'80÷4×3 = 20×3 = 60.'},
        {'q':'Какая из дробей равна 1/2?','options':['2/3','3/4','4/8','3/5'],'correct':2,'expl':'4/8 = 4÷8 = 0,5 = 1/2. ✓'},
        {'q':'Упростите дробь 6/18:','options':['1/3','6/18','2/6','3/9'],'correct':0,'expl':'НОД(6,18)=6. 6÷6=1; 18÷6=3. Итог: 1/3.'},
        {'q':'Сравните: 7/8 и 7/9','options':['7/8 < 7/9','7/8 > 7/9','7/8 = 7/9','нельзя'],'correct':1,'expl':'Одинаковые числители. Меньший знаменатель → большая дробь. 8<9, значит 7/8 > 7/9.'},
        {'q':'Пицца разрезана на 6 частей. Съели 4. Сколько осталось?','options':['4/6','2/6','1/3','оба последних'],'correct':3,'expl':'Осталось 2 из 6 = 2/6 = 1/3.'},
        {'q':'На числовой прямой [0;1] дробь 3/4 находится:','options':['правее 1/2','левее 1/2','на 1/2','правее 1'],'correct':0,'expl':'3/4 = 0,75 > 0,5 = 1/2. Значит правее 1/2.'},
        {'q':'Сумма 1/5 + 2/5 = ?','options':['3/5','3/10','2/25','1'],'correct':0,'expl':'Знаменатели равны. 1+2=3; знаменатель 5. Итог: 3/5.'},
        {'q':'Дробь 5/1 равна:','options':['1/5','5','0','1'],'correct':1,'expl':'5/1 = 5÷1 = 5. Это просто натуральное число 5.'},
        {'q':'Полчаса — это какая часть часа?','options':['1/3','1/2','1/4','2/3'],'correct':1,'expl':'30 минут = 1/2 часа. Час = 60 мин. 30/60 = 1/2.'},
        {'q':'Неправильная дробь — это:','options':['a/b где a>b','a/b где a<b','a/b где a=b','дробь без числителя'],'correct':0,'expl':'Неправильная дробь: числитель ≥ знаменатель (a ≥ b).'},
        {'q':'Найдите 2/5 от 45.','options':['9','18','22','90'],'correct':1,'expl':'45÷5=9. 9×2=18.'},
    ]
},

# ---- CLASS 2 / LESSON 9 : Умножение дробей ----
'c2l9': {
    'num': 9, 'class': 2,
    'filename': 'math-5-class-2/Lesson-9.html',
    'title': 'Умножение дробей',
    'subtitle': 'Урок 9. Умножение обыкновенных дробей и смешанных чисел.',
    'topics': [
        ('Умножение дробей', 'a/b × c/d = (a×c)/(b×d). Числители и знаменатели перемножаются отдельно.'),
        ('Умножение смешанных', 'Переведите в неправильную дробь → умножайте как дроби → переводите обратно.'),
        ('Сокращение до умножения', 'Сокращайте числитель одной дроби с знаменателем другой (крест-накрест).'),
        ('Дробь числа', 'n × a/b = (n×a)/b. Или: найдите 1/b от n, умножьте на a.'),
    ],
    'algorithm': [
        ('Перемножить дроби', 'Умножьте числитель на числитель, знаменатель на знаменатель: a/b × c/d = ac/bd. Сократите результат на НОД.'),
        ('Перемножить смешанные числа', 'Переведите каждое смешанное в неправильную дробь → перемножьте дроби → переведите обратно.'),
        ('Сокращение крест-накрест', 'Числитель первой дроби с знаменателем второй (и наоборот) сокращаются ДО умножения. Упрощает вычисления.'),
        ('Умножить дробь на натуральное', 'a/b × n = (a×n)/b. Если n кратно b — сократите сначала: a × (n/b).'),
        ('Проверка', 'Результат умножения правильных дробей должен быть меньше каждого множителя. Для смешанных — примерно оцените: 1½ × 2⅓ ≈ 1,5 × 2,3 ≈ 3,5.'),
    ],
    'examples': [
        ('Умножение дробей', 'Вычислите: 3/4 × 2/5', [
            ('3×2=6; 4×5=20', '6/20'),
            ('Сокращаем: НОД(6,20)=2. 6/20=3/10', 'Итог: 3/10'),
        ]),
        ('Крест-накрест', 'Вычислите: 4/9 × 3/8', [
            ('Сокращаем: 4 и 8 → 1 и 2; 3 и 9 → 1 и 3', '1/3 × 1/2 = 1/6'),
            ('Итог', '1/6'),
        ]),
        ('Дробь на целое', 'Вычислите: 5/6 × 12', [
            ('12/6=2 (сокращаем). 5×2=10', '5/6 × 12 = 10'),
            ('Итог', '10'),
        ]),
        ('Смешанные числа', 'Вычислите: 2⅓ × 1½', [
            ('2⅓ = 7/3; 1½ = 3/2', '7/3 × 3/2 = 21/6 = 3½'),
            ('Итог', '3½'),
        ]),
        ('Дробь числа', 'Найдите 5/8 от 56.', [
            ('56 ÷ 8 = 7; 7 × 5 = 35', '5/8 от 56 = 35'),
            ('Итог', '35'),
        ]),
        ('Задача', 'Ткань длиной 6 м. Израсходовали 3/4. Сколько метров осталось?', [
            ('Израсходовали: 6 × 3/4 = 18/4 = 4,5 м', 'Осталось: 6 − 4,5 = 1,5 м'),
            ('Итог', '1,5 м'),
        ]),
    ],
    'trainer_type': 'fraction_mult',
    'questions': [
        {'q':'3/4 × 2/3 = ?','options':['6/7','1/2','5/7','3/4'],'correct':1,'expl':'3×2/(4×3) = 6/12 = 1/2.'},
        {'q':'2/5 × 5/6 = ?','options':['10/30','1/3','2/6','7/11'],'correct':1,'expl':'2×5/(5×6) = 10/30 = 1/3.'},
        {'q':'7/8 × 4 = ?','options':['7/2','28/8','3.5','первые три верны'],'correct':3,'expl':'7/8×4 = 28/8 = 7/2 = 3,5. Все три варианта верны.'},
        {'q':'1/4 × 1/4 = ?','options':['2/8','1/16','1/8','4/16'],'correct':1,'expl':'1×1/(4×4) = 1/16.'},
        {'q':'Найдите 2/3 от 27.','options':['9','18','14','81'],'correct':1,'expl':'27÷3=9; 9×2=18.'},
        {'q':'2½ × 4 = ?','options':['8','10','6','12'],'correct':1,'expl':'2½ = 5/2. 5/2 × 4 = 20/2 = 10.'},
        {'q':'3/5 × 5/3 = ?','options':['9/25','15/15','1','6/8'],'correct':2,'expl':'3×5/(5×3) = 15/15 = 1. Взаимно обратные дроби!'},
        {'q':'Упростите перед умножением: 4/9 × 3/8','options':['12/72','1/6','4/24','2/9'],'correct':1,'expl':'4 и 8: ÷4 → 1 и 2. 3 и 9: ÷3 → 1 и 3. 1/3 × 1/2 = 1/6.'},
        {'q':'1⅓ × 1½ = ?','options':['2','1','1⅓','1¾'],'correct':0,'expl':'4/3 × 3/2 = 12/6 = 2.'},
        {'q':'5/7 × 0 = ?','options':['5/7','0','7/5','1'],'correct':1,'expl':'Любое число × 0 = 0.'},
        {'q':'Найдите 3/4 от 60.','options':['15','45','80','20'],'correct':1,'expl':'60÷4=15; 15×3=45.'},
        {'q':'2/3 × 9/4 = ?','options':['3/2','18/12','2/4','6/7'],'correct':0,'expl':'2×9/(3×4)=18/12=3/2. Или: 2 и 4→1/2; 9 и 3→3; 1/2×3=3/2.'},
        {'q':'3⅓ × 6/5 = ?','options':['4','3⅔','20/15','5'],'correct':0,'expl':'3⅓ = 10/3. 10/3 × 6/5 = 60/15 = 4.'},
        {'q':'При умножении правильных дробей результат:','options':['больше каждого множителя','равен меньшему из множителей','меньше каждого множителя','нельзя определить'],'correct':2,'expl':'Произведение двух правильных дробей (меньше 1) меньше каждого множителя.'},
        {'q':'4/5 × 15 = ?','options':['60/5','12','20','3'],'correct':1,'expl':'15/5=3 (сокращаем). 4×3=12.'},
        {'q':'Решите: x = 2/7 × 21','options':['x=6','x=42/7','x=3','x=14'],'correct':0,'expl':'21/7=3 (сокращаем). 2×3=6.'},
        {'q':'2/5 × 5/2 = ?','options':['4/10','1','5/2','2/5'],'correct':1,'expl':'Взаимно обратные дроби: 2/5 × 5/2 = 10/10 = 1.'},
        {'q':'Площадь прямоугольника со сторонами 2/3 м и 3/4 м:','options':['1/2 кв.м','6/12 кв.м','1 кв.м','Оба первые'],'correct':3,'expl':'2/3 × 3/4 = 6/12 = 1/2. Первые два ответа одинаковы (= 1/2).'},
        {'q':'3/8 × 8 = ?','options':['24/8','4','3','2'],'correct':2,'expl':'3/8 × 8 = 24/8 = 3.'},
        {'q':'1/6 × 1/6 = ?','options':['2/12','1/36','1/12','2/6'],'correct':1,'expl':'1×1/(6×6) = 1/36.'},
    ]
},
}

# ============================================================
# CSS + TEMPLATE PARTS (copied from Lesson-16.html)
# ============================================================

CSS = r"""      :root {
        --bg-dark: #0f0f1a;
        --bg-card: rgba(255, 255, 255, 0.05);
        --bg-glass: rgba(255, 255, 255, 0.08);
        --border-glass: rgba(255, 255, 255, 0.15);
        --text-primary: #e8e8f0;
        --text-secondary: #a0a0b8;
        --accent: #00d4aa;
        --accent-dim: rgba(0, 212, 170, 0.2);
        --accent-warm: #ff6b6b;
        --accent-warm-dim: rgba(255, 107, 107, 0.2);
        --accent-blue: #4dabf7;
        --accent-blue-dim: rgba(77, 171, 247, 0.2);
        --success: #51cf66;
        --error: #ff6b6b;
        --warning: #fcc419;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; background: var(--bg-dark); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; line-height: 1.6; }
      .bg-animation { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: radial-gradient(ellipse at 20% 20%, rgba(0,212,170,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(77,171,247,0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255,107,107,0.05) 0%, transparent 60%); }
      .bg-animation::before { content: ""; position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background: repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px); animation: bgMove 20s linear infinite; }
      @keyframes bgMove { 0% { transform: translateY(0); } 100% { transform: translateY(40px); } }
      nav { position: fixed; top: 0; left: 0; right: 0; background: rgba(15,15,26,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-glass); z-index: 1000; padding: 0 20px; }
      .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; height: 60px; }
      .logo { font-size: 1.3rem; font-weight: 700; background: linear-gradient(135deg, var(--accent), var(--accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .nav-links { display: flex; gap: 8px; list-style: none; }
      .nav-links a { color: var(--text-secondary); text-decoration: none; padding: 8px 16px; border-radius: 8px; transition: all 0.3s; font-size: 0.9rem; font-weight: 500; cursor: pointer; border: none; background: transparent; }
      .nav-links a:hover, .nav-links a.active { color: var(--text-primary); background: var(--bg-glass); }
      .nav-links a.active { background: var(--accent-dim); color: var(--accent); }
      section { display: none; opacity: 0; padding: 100px 20px 60px; max-width: 1000px; margin: 0 auto; transition: opacity 0.3s ease; }
      section.active { display: block; opacity: 1; animation: fadeIn 0.5s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .card { background: var(--bg-card); backdrop-filter: blur(20px); border: 1px solid var(--border-glass); border-radius: 20px; padding: 32px; margin-bottom: 24px; transition: transform 0.3s, box-shadow 0.3s; }
      .card:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
      .card-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
      .card-title .icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
      .hero { text-align: center; padding: 140px 20px 80px; }
      .hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 20px; background: linear-gradient(135deg, var(--accent), var(--accent-blue), var(--accent-warm)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; }
      .hero p { font-size: 1.2rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 40px; }
      .btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 12px; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; text-decoration: none; }
      .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent-blue)); color: #000; }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px var(--accent-dim); }
      .btn-secondary { background: var(--bg-glass); color: var(--text-primary); border: 1px solid var(--border-glass); }
      .btn-secondary:hover { background: var(--bg-card); }
      .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
      .generate-widget { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 20px; padding: 24px; width: 100%; }
      .widget-viewport { overflow: hidden; position: relative; min-height: 520px; height: auto; width: 100%; }
      .widget-track { display: flex; transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); width: 100%; will-change: transform; }
      .widget-slide { flex: 0 0 100%; width: 100%; min-width: 100%; padding: 20px; box-sizing: border-box; overflow-x: hidden; overflow-y: visible; }
      .widget-slide h3 { font-size: 1.3rem; color: var(--accent); margin-bottom: 16px; }
      .widget-slide p, .widget-slide li { color: var(--text-secondary); line-height: 1.8; margin-bottom: 12px; }
      .widget-slide .big-math { font-size: 1.6rem; text-align: center; margin: 20px 0; background: var(--bg-glass); padding: 20px; border-radius: 12px; font-weight: 600; color: var(--text-primary); }
      .widget-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
      .widget-progress { text-align: center; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px; }
      .sequence-component { display: flex; flex-direction: column; gap: 20px; position: relative; }
      .sequence-step { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 16px; padding: 24px 24px 24px 72px; position: relative; transition: all 0.3s; }
      .sequence-step:hover { border-color: var(--accent); transform: translateX(4px); }
      .sequence-number { position: absolute; left: 20px; top: 20px; width: 40px; height: 40px; background: var(--accent); color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }
      .sequence-step h4 { color: var(--text-primary); margin-bottom: 8px; font-size: 1.1rem; }
      .sequence-step p { color: var(--text-secondary); line-height: 1.7; }
      .sequence-connector { position: absolute; left: 39px; top: 60px; bottom: -30px; width: 2px; background: var(--accent-dim); z-index: 0; }
      .sequence-step:last-child .sequence-connector { display: none; }
      .formula-box { background: var(--bg-glass); border: 1px solid var(--border-glass); border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center; font-size: 1.2rem; }
      .tip-box { background: var(--accent-blue-dim); border-left: 4px solid var(--accent-blue); padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 16px 0; }
      .tip-box::before { content: "💡 "; }
      .warning-box { background: var(--accent-warm-dim); border-left: 4px solid var(--accent-warm); padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 16px 0; }
      .warning-box::before { content: "⚠️ "; }
      .highlight { background: var(--accent-dim); padding: 2px 6px; border-radius: 4px; color: var(--accent); font-weight: 600; }
      .problem-card { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
      .problem-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .problem-number { background: var(--accent-dim); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
      .problem-type { color: var(--text-secondary); font-size: 0.85rem; }
      .problem-text { font-size: 1.1rem; margin-bottom: 16px; line-height: 1.8; }
      .solution-btn { background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
      .solution-btn:hover { background: var(--accent); color: #000; }
      .solution { display: none; margin-top: 20px; padding: 20px; background: rgba(0,212,170,0.05); border-left: 3px solid var(--accent); border-radius: 0 12px 12px 0; }
      .solution.active { display: block; animation: slideDown 0.3s ease; }
      @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 1000px; } }
      .solution-step { margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid var(--border-glass); }
      .solution-step:last-child { border-bottom: none; }
      .step-num { display: inline-block; width: 24px; height: 24px; background: var(--accent); color: #000; border-radius: 50%; text-align: center; line-height: 24px; font-size: 0.8rem; font-weight: 700; margin-right: 8px; }
      .quiz-container { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 20px; padding: 32px; }
      .quiz-progress { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 8px; }
      .progress-bar { flex: 1; height: 8px; background: var(--bg-glass); border-radius: 4px; margin: 0 16px; overflow: hidden; min-width: 100px; }
      .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-blue)); border-radius: 4px; transition: width 0.5s ease; width: 0%; }
      .quiz-question { font-size: 1.2rem; margin-bottom: 24px; padding: 20px; background: var(--bg-glass); border-radius: 12px; border-left: 4px solid var(--accent); }
      .quiz-options { display: grid; gap: 12px; }
      .quiz-option { background: var(--bg-glass); border: 2px solid var(--border-glass); border-radius: 12px; padding: 16px 20px; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 12px; }
      .quiz-option:hover { border-color: var(--accent); background: var(--accent-dim); }
      .quiz-option.correct { border-color: var(--success); background: rgba(81,207,102,0.15); }
      .quiz-option.wrong { border-color: var(--error); background: rgba(255,107,107,0.15); }
      .quiz-option.disabled { pointer-events: none; opacity: 0.7; }
      .option-letter { width: 32px; height: 32px; border-radius: 8px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
      .quiz-nav { display: flex; justify-content: space-between; margin-top: 24px; }
      .stat { background: var(--bg-glass); padding: 12px 24px; border-radius: 12px; text-align: center; min-width: 100px; border: 1px solid var(--border-glass); }
      .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
      .stat-label { font-size: 0.85rem; color: var(--text-secondary); }
      .timer { position: fixed; top: 80px; right: 20px; background: var(--bg-card); backdrop-filter: blur(20px); border: 1px solid var(--border-glass); border-radius: 16px; padding: 16px 24px; font-size: 1.3rem; font-weight: 700; font-variant-numeric: tabular-nums; z-index: 999; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .timer.warning { border-color: var(--warning); color: var(--warning); animation: pulse 1s infinite; }
      .timer.danger { border-color: var(--error); color: var(--error); animation: pulse 0.5s infinite; }
      @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      .results-container { text-align: center; padding: 40px; }
      .score-circle { width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(var(--accent) calc(var(--score) * 3.6deg), var(--bg-glass) 0); margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; position: relative; }
      .score-circle::before { content: ""; position: absolute; width: 170px; height: 170px; background: var(--bg-dark); border-radius: 50%; }
      .score-value { position: relative; font-size: 3rem; font-weight: 800; color: var(--accent); }
      .score-label { font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 8px; }
      .score-message { font-size: 1.5rem; font-weight: 700; margin-bottom: 32px; }
      .results-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 16px; max-width: 600px; margin: 0 auto 32px; }
      .breakdown-item { background: var(--bg-glass); padding: 16px; border-radius: 12px; }
      .breakdown-value { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
      .breakdown-label { font-size: 0.85rem; color: var(--text-secondary); }
      .hidden { display: none !important; }
      @media (max-width: 768px) { .hero h1 { font-size: 2rem; } .nav-links { display: none; } .timer { top: 70px; right: 10px; font-size: 1rem; padding: 10px 16px; } .card { padding: 20px; } section { padding: 80px 16px 40px; } .widget-viewport { min-height: 500px; } }"""

def build_algorithm_section(steps):
    lines = ['    <!-- ALGORITHM -->', '    <section id="algorithm">',
             '      <div class="card">',
             '        <div class="card-title"><span class="icon" style="background:var(--accent-blue-dim)">🪜</span>Пошаговый алгоритм</div>',
             '        <div class="sequence-component">']
    for i, (h, p) in enumerate(steps):
        is_last = (i == len(steps) - 1)
        lines.append('          <div class="sequence-step">')
        lines.append(f'            <div class="sequence-number">{i+1}</div>')
        if not is_last:
            lines.append('            <div class="sequence-connector"></div>')
        lines.append(f'            <h4>{h}</h4>')
        lines.append(f'            <p>{p}</p>')
        lines.append('          </div>')
    lines += ['        </div>', '      </div>', '    </section>']
    return '\n'.join(lines)

def build_examples_section(examples):
    lines = ['    <!-- EXAMPLES -->', '    <section id="examples">',
             '      <div class="card">',
             '        <div class="card-title"><span class="icon" style="background:var(--accent-dim)">📝</span>Разбор задач</div>',
             '      </div>']
    for i, (typ, txt, solution_steps) in enumerate(examples):
        sid = f'sol-{i+1}'
        lines += [
            '      <div class="problem-card">',
            '        <div class="problem-header">',
            f'          <span class="problem-number">№ {i+1}</span>',
            f'          <span class="problem-type">{typ}</span>',
            '        </div>',
            f'        <div class="problem-text">{txt}</div>',
            f'        <button class="solution-btn" onclick="toggleSolution(\'{sid}\')">Показать решение</button>',
            f'        <div class="solution" id="{sid}">',
        ]
        for j, (label, result) in enumerate(solution_steps):
            lines.append(f'          <div class="solution-step"><span class="step-num">{j+1}</span>{label}: <strong>{result}</strong></div>')
        lines += ['        </div>', '      </div>']
    lines.append('    </section>')
    return '\n'.join(lines)

def build_trainer_section(trainer_type):
    return '''    <!-- TRAINER -->
    <section id="trainer">
      <div class="card">
        <div class="card-title"><span class="icon" style="background:var(--accent-dim)">🏋️</span>Тренажёр</div>
        <p style="color:var(--text-secondary);margin-bottom:24px">Случайные задачи. Подсказки и счётчик серий.</p>
        <div class="quiz-container" style="margin-bottom:20px">
          <div id="trainer-question" style="font-size:1.4rem;text-align:center;margin-bottom:24px;padding:24px;background:var(--bg-glass);border-radius:12px;">Нажмите «Новая задача» для начала</div>
          <div style="display:flex;gap:12px;margin-bottom:20px">
            <input type="text" id="trainer-answer" placeholder="Ваш ответ" style="flex:1;padding:14px 16px;background:var(--bg-glass);border:2px solid var(--border-glass);border-radius:12px;color:var(--text-primary);font-size:1rem;outline:none;" />
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
    q_json = json.dumps(questions, ensure_ascii=False)
    n = len(questions)
    return f'''    <!-- ASSESSMENT -->
    <section id="assessment">
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
            <p style="color:var(--text-secondary);margin-bottom:20px">{n} вопросов • 10 минут.</p>
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
              <button class="btn btn-secondary" onclick="showSection(\'theory\')">Вернуться к теории</button>
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

      // Slider
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

      // Solution toggles
      function toggleSolution(id) {{
        const el = document.getElementById(id);
        el.classList.toggle('active');
        const btn = el.previousElementSibling;
        btn.textContent = el.classList.contains('active') ? 'Скрыть решение' : 'Показать решение';
      }}

      // Trainer
      const trainerProblems = (function() {{
        const q = {q_json};
        return q.map(x => ({{ text: x.q, answer: String(x.correct), hint: x.expl }}));
      }})();
      function newTrainerProblem() {{
        const p = trainerProblems[Math.floor(Math.random() * trainerProblems.length)];
        AppState.trainer.current = p;
        document.getElementById('trainer-question').textContent = p.text;
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
        const userStr = document.getElementById('trainer-answer').value.trim();
        if (!userStr) return;
        AppState.trainer.total++;
        const correct = AppState.trainer.current.answer;
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

      // Assessment
      const diagnosticQuestions = {q_json};
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
        document.getElementById('diag-question').textContent = q.q;
        document.getElementById('diag-explanation').style.display = 'none';
        document.getElementById('diag-next').disabled = true;
        document.getElementById('diag-prev').disabled = AppState.diagnostic.current === 0;
        const optsDiv = document.getElementById('diag-options');
        optsDiv.innerHTML = '';
        q.options.forEach((opt, i) => {{
          const div = document.createElement('div');
          div.className = 'quiz-option';
          div.innerHTML = '<div class="option-letter">' + String.fromCharCode(65+i) + '</div><div>' + opt + '</div>';
          div.onclick = () => selectDiagnostic(i, div, q);
          optsDiv.appendChild(div);
        }});
      }}
      function selectDiagnostic(i, div, q) {{
        document.querySelectorAll('#diag-options .quiz-option').forEach(o => o.classList.add('disabled'));
        const isCorrect = i === q.correct;
        div.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) document.querySelectorAll('#diag-options .quiz-option')[q.correct].classList.add('correct');
        if (isCorrect) AppState.diagnostic.score++;
        AppState.diagnostic.answers.push(i);
        document.getElementById('diag-explanation').textContent = (isCorrect ? '✓ ' : '✗ ') + q.expl;
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
        document.getElementById('ta-question').textContent = q.q;
        const optsDiv = document.getElementById('ta-options');
        optsDiv.innerHTML = '';
        q.options.forEach((opt, i) => {{
          const div = document.createElement('div');
          div.className = 'quiz-option';
          div.innerHTML = '<div class="option-letter">' + String.fromCharCode(65+i) + '</div><div>' + opt + '</div>';
          div.onclick = () => {{
            if (i === q.correct) AppState.timeAttack.score++;
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
    </script>"""

def build_full_file(data, home_html, theory_html):
    n = data['num']
    title = data['title']
    subtitle = data['subtitle']
    topics = data['topics']
    cls = data['class']

    # Replace back button in home section if present
    home_html = re.sub(r"onclick=\"showSection\('(?:assessment|test|practice|trainer|quiz)'\)\"",
                       "onclick=\"showSection('theory')\"", home_html)

    algo_html = build_algorithm_section(data['algorithm'])
    ex_html = build_examples_section(data['examples'])
    trainer_html = build_trainer_section(data['trainer_type'])
    assess_html = build_assessment_section(data['questions'])
    slide_cnt = count_slides(theory_html)
    js = build_js(slide_cnt, data['questions'])

    return f"""<!doctype html>
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

def process_lesson(key, data):
    path_rel = data['filename']
    path_594728a = path_rel.replace('\\', '/')
    print(f"  Processing {path_rel}...")
    raw = git_show('594728a', f'P002_Math_5_Darslik/{path_594728a}')
    if not raw:
        print(f"  [WARN] Could not get from 594728a: {path_rel}")
        return
    raw_clean = strip_textbook_images(raw)
    home_html, theory_html = extract_home_and_theory(raw_clean)
    if not home_html or not theory_html:
        print(f"  [WARN] Could not extract home/theory from {path_rel}")
        return
    full = build_full_file(data, home_html, theory_html)
    out = os.path.join(P002, path_rel)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(full)
    slides = count_slides(theory_html)
    print(f"  [OK] {os.path.basename(path_rel):30s} slides={slides} questions={len(data['questions'])}")

def main():
    print("=" * 60)
    print("P002 — Rebuild 4 old-format lesson files")
    print("=" * 60)
    for key, data in LESSON_DATA.items():
        process_lesson(key, data)
    print("\nDone.")

if __name__ == '__main__':
    main()
