#!/usr/bin/env python3
"""Fix K constant escaping and $$ delimiters in all topic files."""
import re, os

BASE = r"C:\Users\Administrator\Documents\Claude\Projects\платформа для подготовки к блоковому экзамену\app\public\lessons\topics"

# Correct K constant supporting all 4 delimiter styles
# In the HTML file we need:  left:'\\(' (two chars in JS source → one backslash at runtime)
CORRECT_K = "const K={delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\\\(',right:'\\\\)',display:false},{left:'\\\\[',right:'\\\\]',display:true}],throwOnError:false};"

def fix(path):
    with open(path, encoding='utf-8') as f:
        src = f.read()
    orig = src

    # 1. Remove any remaining MathJax config block
    src = re.sub(r'<script>\s*MathJax\s*=\s*\{.*?\};\s*</script>\s*', '', src, flags=re.DOTALL)

    # 2. Replace ANY existing K constant (regardless of escaping/delimiters) with the correct one
    #    Match: const K={...throwOnError:false};
    src = re.sub(
        r'const K\s*=\s*\{[^;]+throwOnError\s*:\s*false\s*\}\s*;',
        CORRECT_K,
        src
    )

    # 3. If K still not present, inject it into the first <script> block
    if 'const K=' not in src:
        src = src.replace('<script>', '<script>\n' + CORRECT_K, 1)

    if src != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(src)
        print(f"  [OK]   Fixed: {os.path.basename(path)}")
    else:
        print(f"  [--]   No changes: {os.path.basename(path)}")

if __name__ == '__main__':
    for i in range(1, 13):
        p = os.path.join(BASE, f"topic-{i:02d}.html")
        if os.path.exists(p):
            fix(p)
