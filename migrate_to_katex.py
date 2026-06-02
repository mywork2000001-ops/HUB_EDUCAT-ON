#!/usr/bin/env python3
"""Migrate all topic-XX.html from MathJax to KaTeX."""
import re, os, sys

BASE = r"C:\Users\Administrator\Documents\Claude\Projects\платформа для подготовки к блоковому экзамену\app\public\lessons\topics"

KATEX_CSS = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">'
KATEX_JS  = '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>'
KATEX_AR  = '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>'
KATEX_SCRIPTS = f"  {KATEX_CSS}\n  {KATEX_JS}\n  {KATEX_AR}"

KATEX_OPTS_CONST = "const K={delimiters:[{left:'\\\\(',right:'\\\\)',display:false},{left:'\\\\[',right:'\\\\]',display:true}],throwOnError:false};"

def migrate(path):
    with open(path, encoding='utf-8') as f:
        src = f.read()
    orig = src

    # ── 1. CSS: replace MathJax output selectors ──────────────────────────────
    # compact form (08-12)
    src = src.replace(
        '.MathJax{font-size:1.05em!important;}mjx-container[display="true"]{overflow-x:auto;padding:6px 0;}',
        '.katex{font-size:1.05em!important;}.katex-display{overflow-x:auto;padding:6px 0;}'
    )
    # formatted form (06-07)
    src = re.sub(
        r'\.MathJax\s*\{\s*font-size:\s*1\.05em\s*!important;\s*\}',
        '.katex { font-size: 1.05em !important; }',
        src
    )
    src = re.sub(
        r'mjx-container\[display="true"\]\s*\{[^}]*\}',
        '.katex-display { overflow-x: auto; padding: 6px 0; }',
        src
    )
    # old-style (01-05) — may appear inside formatted CSS block
    src = re.sub(r'mjx-container[^\n]*\n?', '', src)

    # ── 2. Inject KaTeX scripts before </head> ─────────────────────────────────
    # First: remove the MathJax <script> config block (window.MathJax = {...})
    # compact one-liner (08-12): <script>\nwindow.MathJax={...};\n</script>
    src = re.sub(
        r'<script>\s*window\.MathJax\s*=\s*\{.*?\};\s*</script>\s*',
        '',
        src,
        flags=re.DOTALL
    )
    # formatted multi-line (06-07): // ─── MathJax ... window.MathJax = { ... }
    src = re.sub(
        r'//\s*─+\s*MathJax\s*─+.*?window\.MathJax\s*=\s*\{.*?\}\s*',
        '',
        src,
        flags=re.DOTALL
    )
    # Pattern A (01-05): MathJax = { ... } (without window., multiline)
    src = re.sub(
        r'MathJax\s*=\s*\{(?:[^{}]|\{[^{}]*\})*\}\s*;?\s*\n',
        '',
        src,
        flags=re.DOTALL
    )

    # Remove the <script src="...mathjax..."> tag (all variants)
    src = re.sub(
        r'<script[^>]*cdn\.jsdelivr\.net/npm/mathjax[^>]*></script>\s*',
        '',
        src,
        flags=re.IGNORECASE
    )
    src = re.sub(
        r'<script[^>]*mathjax[^>]*async[^>]*></script>\s*',
        '',
        src,
        flags=re.IGNORECASE
    )

    # Remove preconnect to cdn.jsdelivr.net if it was only for MathJax
    # (keep it if other scripts still use it — we still use jsdelivr for KaTeX)

    # Inject KaTeX before </head>
    if KATEX_CSS not in src:
        src = src.replace('</head>', KATEX_SCRIPTS + '\n</head>', 1)

    # ── 3. JavaScript: replace MathJax API with KaTeX ─────────────────────────

    # 3a. renderMathNow function (compact 08-12)
    src = src.replace(
        'function renderMathNow(id){const el=document.getElementById(id);if(el&&window.MathJax)MathJax.typesetPromise([el]).catch(console.error);}',
        KATEX_OPTS_CONST + 'function renderMathNow(id){const el=document.getElementById(id);if(el)renderMathInElement(el,K);}'
    )
    # renderMathNow formatted (06-07)
    src = re.sub(
        r'function renderMathNow\(id\)\s*\{[^}]*MathJax\.typesetPromise[^}]*\}',
        KATEX_OPTS_CONST + 'function renderMathNow(id){const el=document.getElementById(id);if(el)renderMathInElement(el,K);}',
        src
    )
    # renderMathNow (01-05 style - might be named differently)
    src = re.sub(
        r'function renderMath\(id\)\s*\{[^}]*MathJax[^}]*\}',
        KATEX_OPTS_CONST + 'function renderMath(id){const el=document.getElementById(id);if(el)renderMathInElement(el,K);}',
        src
    )

    # 3b. buildSlides: MathJax.startup.promise.then(...typesetPromise([track]))
    # compact
    src = src.replace(
        'MathJax.startup.promise.then(()=>MathJax.typesetPromise([track]))',
        'renderMathInElement(track,K)'
    )
    # formatted
    src = re.sub(
        r'MathJax\.startup\.promise\.then\s*\(\s*\(\)\s*=>\s*MathJax\.typesetPromise\(\[track\]\)\s*\)',
        'renderMathInElement(track, K)',
        src
    )

    # 3c. toggleSol compact
    src = src.replace(
        'if(sol.classList.contains(\'open\')&&window.MathJax)MathJax.typesetPromise([sol]).catch(console.error);',
        'if(sol.classList.contains(\'open\'))renderMathInElement(sol,K);'
    )
    # toggleSol formatted (06-07)
    src = re.sub(
        r"if\s*\(sol\.classList\.contains\('open'\)\s*&&\s*window\.MathJax\)\s*\n?\s*MathJax\.typesetPromise\(\[sol\]\)\.catch\(console\.error\);",
        "if (sol.classList.contains('open')) renderMathInElement(sol, K);",
        src
    )

    # 3d. selectDQ: if(window.MathJax)MathJax.typesetPromise([ex]).catch(console.error);
    src = src.replace(
        'if(window.MathJax)MathJax.typesetPromise([ex]).catch(console.error);',
        'renderMathInElement(ex,K);'
    )
    src = re.sub(
        r'if\s*\(window\.MathJax\)\s*MathJax\.typesetPromise\(\[ex\]\)\.catch\(console\.error\);',
        'renderMathInElement(ex, K);',
        src
    )

    # 3e. DOMContentLoaded: MathJax.startup.promise.then(()=>MathJax.typesetPromise([document.body]))
    src = src.replace(
        'MathJax.startup.promise.then(()=>MathJax.typesetPromise([document.body]))',
        'renderMathInElement(document.body,K)'
    )
    src = re.sub(
        r'MathJax\.startup\.promise\.then\s*\(\s*\(\)\s*=>\s*MathJax\.typesetPromise\(\[document\.body\]\)\s*\)',
        'renderMathInElement(document.body, K)',
        src
    )

    # 3f. Pattern A misc: if (window.MathJax) MathJax.typesetPromise([el])
    src = re.sub(
        r'if\s*\(\s*(?:el\s*&&\s*)?window\.MathJax\s*\)\s*MathJax\.typesetPromise\(\[[^\]]+\]\)\.catch\(console\.error\);',
        lambda m: re.sub(r'if\s*\(\s*(?:el\s*&&\s*)?window\.MathJax\s*\)\s*MathJax\.typesetPromise\(\[([^\]]+)\]\)\.catch\(console\.error\);',
                         r'renderMathInElement(\1, K);', m.group(0)),
        src
    )

    # 3g. Any remaining MathJax.typesetPromise([...]) without guard
    src = re.sub(
        r'(?:if\s*\([^)]*MathJax[^)]*\)\s*)?MathJax\.typesetPromise\(\[([^\]]+)\]\)(?:\.catch\([^)]*\))?;',
        r'renderMathInElement(\1, K);',
        src
    )

    # 3h. MathJax.startup.defaultReady() patterns (Pattern A only)
    # Remove the whole ready() callback that wraps defaultReady + typesetPromise
    src = re.sub(
        r'ready\s*\(\)\s*\{[^}]*MathJax\.startup\.defaultReady\(\);[^}]*\}',
        '',
        src,
        flags=re.DOTALL
    )

    # 3i. Any remaining window.MathJax references
    src = re.sub(r'window\.MathJax\b', 'window._katex_loaded', src)

    # 3j. If renderMathInElement(document.body, K) not yet added in DOMContentLoaded
    # Make sure DOMContentLoaded calls renderMathInElement(document.body, K)
    src = re.sub(
        r"document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{([^}]*buildSlides\(\);[^}]*)\}\s*\);",
        lambda m: (
            "document.addEventListener('DOMContentLoaded',()=>{"
            + m.group(1)
            + ("renderMathInElement(document.body,K);" if "renderMathInElement(document.body" not in m.group(1) else "")
            + "});"
        ),
        src
    )

    # ── 4. Ensure K constant is defined (if not added by renderMathNow replacement)
    if 'const K=' not in src and 'const K =' not in src:
        # inject before first function definition
        src = src.replace(
            '<script>',
            '<script>\n' + KATEX_OPTS_CONST,
            1
        )

    if src == orig:
        print(f"  [SKIP] No changes: {os.path.basename(path)}")
    else:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(src)
        print(f"  [OK]   Migrated:  {os.path.basename(path)}")

    return src != orig


if __name__ == '__main__':
    files = [os.path.join(BASE, f"topic-{i:02d}.html") for i in range(1, 13)]
    changed = 0
    for p in files:
        if os.path.exists(p):
            if migrate(p):
                changed += 1
        else:
            print(f"  [MISS] Not found: {os.path.basename(p)}")
    print(f"\nDone: {changed} files migrated.")
