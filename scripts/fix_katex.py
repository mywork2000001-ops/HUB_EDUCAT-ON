#!/usr/bin/env python3
"""Fix remaining MathJax blocks + update K delimiters to support $ and \( in all files."""
import re, os

BASE = r"C:\Users\Administrator\Documents\Claude\Projects\платформа для подготовки к блоковому экзамену\app\public\lessons\topics"

# Support all delimiter styles: $$, $, \(...\), \[...\]
NEW_K = r"const K={delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false};"

OLD_K = r"const K={delimiters:[{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false};"

def fix(path):
    with open(path, encoding='utf-8') as f:
        src = f.read()
    orig = src

    # 1. Remove remaining <script>MathJax = {...};</script> blocks (Pattern A remnant)
    src = re.sub(
        r'<script>\s*MathJax\s*=\s*\{.*?\};\s*</script>\s*',
        '',
        src,
        flags=re.DOTALL
    )

    # 2. Update K constant to support both $ and \( delimiters
    src = src.replace(OLD_K, NEW_K)

    # 3. If K not defined yet (edge case), add it
    if 'const K=' not in src and 'const K =' not in src:
        # find first <script> in body and inject
        src = re.sub(r'(<script>)(\s*(?!window\.|MathJax))', r'\1\n' + NEW_K + r'\2', src, count=1)

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
