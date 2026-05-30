#!/usr/bin/env python3
"""Inject textbook images into the Из учебника card in class-1 lesson theory sections."""
import os, re

BASE = r"C:\Users\Administrator\Documents\Claude\Projects\P002_Math_5_Darslik\math-5-class-1"

LESSON_IMAGES = {
    1:  (['page_011', 'page_012'], 'sec_s1_2b'),
    2:  (['page_013', 'page_014'], 'sec_s1_2b'),
    3:  (['page_015', 'page_016'], 'sec_s1_2_comparison'),
    4:  (['page_017', 'page_018'], 'sec_s1_3_rounding'),
    5:  (['page_019', 'page_020'], None),
    6:  (['page_021', 'page_022'], None),   # sec_s1_5_squares_a/b already handled as pair
    9:  (['page_027', 'page_028'], 'sec_s1_8_divisors'),
}

# Lesson-6 special: has two section images
LESSON_6_SECTION_IMGS = ['sec_s1_5_squares_a', 'sec_s1_5_squares_b']

def make_image_card_content(pages, section_img, lesson_num):
    img_style = 'width:100%;border-radius:12px;border:1px solid var(--border-glass);'
    lines = []
    lines.append('        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px;">')
    for p in pages:
        num = p.replace('page_', '')
        lines.append(f'          <img src="../assets/img/pages/{p}.webp" alt="Страница учебника {num}" style="{img_style}">')
    lines.append('        </div>')
    if lesson_num == 6:
        lines.append('        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px;">')
        for si in LESSON_6_SECTION_IMGS:
            lines.append(f'          <img src="../assets/img/pages/{si}.webp" alt="Раздел учебника" style="{img_style}">')
        lines.append('        </div>')
    elif section_img:
        lines.append(f'        <img src="../assets/img/pages/{section_img}.webp" alt="Раздел учебника" style="width:100%;max-width:600px;display:block;margin:16px auto 0;border-radius:12px;border:1px solid var(--border-glass);">')
    return '\n'.join(lines)

for lesson_num, (pages, section_img) in LESSON_IMAGES.items():
    path = os.path.join(BASE, f'lesson-{lesson_num}.html')
    with open(path, encoding='utf-8') as f:
        content = f.read()

    if f'assets/img/pages/{pages[0]}' in content:
        print(f"  lesson-{lesson_num}: images already present, skipping")
        continue

    # Pattern: card with Из учебника that has empty body before </section>
    # We need to insert content between the card-title closing div and the end of card/section
    card_content = make_image_card_content(pages, section_img, lesson_num)

    # Find the empty card: "Из учебника" followed by whitespace/newline and </div> or </section>
    pattern = re.compile(
        r'(>Из учебника\s*</div>\s*)\n(\s*)(</div>)?\s*\n(\s*</section>)',
        re.DOTALL
    )

    def replacer(m):
        return f'{m.group(1)}\n{card_content}\n      </div>\n    </section>'

    new_content, count = pattern.subn(replacer, content)
    if count == 0:
        # Try a simpler pattern: card-title line + empty content before </section>
        simple = re.compile(
            r'(>Из учебника\n\s*</div>\n)\s*\n\s*</section>',
            re.DOTALL
        )
        new_content, count = simple.subn(
            lambda m: f'{m.group(1)}\n{card_content}\n      </div>\n    </section>',
            content
        )

    if count > 0:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  lesson-{lesson_num}: injected {len(pages)} page imgs + {'1 section img' if section_img else 'no section img'}")
    else:
        print(f"  lesson-{lesson_num}: WARNING - pattern not found, manual edit needed")

print("Done.")
