#!/usr/bin/env python3
"""
fix_type_b_dedup.py
Remove CSS rules from Type B inline <style> blocks that are already covered
by topic-shared-b.css, keeping only truly topic-specific rules.
"""
import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from pathlib import Path

TOPICS_DIR = Path(r"C:\Users\Administrator\Documents\Claude\Projects\платформа для подготовки к блоковому экзамену\app\public\lessons\topics")

def read(p):
    return p.read_text(encoding="utf-8")

def write(p, content):
    p.write_text(content, encoding="utf-8", newline="\n")

def normalise_sel(s):
    """Strip whitespace/newlines from selector for comparison."""
    return re.sub(r'\s+', ' ', s).strip()

# ── Build set of selectors already in shared-b.css ──────────────
shared_b = read(TOPICS_DIR / "topic-shared-b.css")
# Extract all selectors (everything before { in each rule)
shared_selectors = set()
for m in re.finditer(r'([^{}]+)\{[^{}]*\}', shared_b, re.DOTALL):
    for part in m.group(1).split(','):
        shared_selectors.add(normalise_sel(part))

print(f"Shared-b selectors: {len(shared_selectors)}")

# ── Process each Type B topic ────────────────────────────────────
for i in range(15, 29):
    fname = f"topic-{i:02d}.html"
    filepath = TOPICS_DIR / fname
    content = read(filepath)

    # Find inline <style>…</style> block AFTER the shared-b link
    link_pos = content.find('href="topic-shared-b.css"')
    if link_pos == -1:
        print(f"  {fname}: no shared-b link, skip")
        continue

    # Find next <style>…</style> after that link
    style_m = re.search(r'<style>([\s\S]*?)</style>', content[link_pos:])
    if not style_m:
        print(f"  {fname}: no inline style after link, already clean ✓")
        continue

    style_start = link_pos + style_m.start()
    style_end   = link_pos + style_m.end()
    css_inner   = style_m.group(1)

    # Split css_inner into individual rules (selector { body })
    # Handle @keyframes, media queries etc. with a depth counter
    unique_rules = []
    pos = 0
    text = css_inner

    while pos < len(text):
        # Skip whitespace and comments
        m_ws = re.match(r'[\s\n]+', text[pos:])
        if m_ws:
            pos += m_ws.end()
            continue
        m_comment = re.match(r'/\*.*?\*/', text[pos:], re.DOTALL)
        if m_comment:
            pos += m_comment.end()
            continue

        # Find selector and opening brace
        brace = text.find('{', pos)
        if brace == -1:
            break
        selector_raw = text[pos:brace]
        # Find matching closing brace
        depth = 0
        rule_end = brace
        while rule_end < len(text):
            if text[rule_end] == '{':
                depth += 1
            elif text[rule_end] == '}':
                depth -= 1
                if depth == 0:
                    break
            rule_end += 1

        rule_body = text[brace:rule_end + 1]
        full_rule = selector_raw + rule_body

        # Check if ALL selector parts are in shared
        selector_parts = [normalise_sel(p) for p in selector_raw.split(',') if p.strip()]
        all_in_shared = all(
            any(sp == ss or sp in ss for ss in shared_selectors)
            for sp in selector_parts
            if sp
        )

        if not all_in_shared:
            unique_rules.append(full_rule.strip())

        pos = rule_end + 1

    if unique_rules:
        new_style = "<style>\n" + "\n".join(unique_rules) + "\n</style>"
        new_content = content[:style_start] + new_style + content[style_end:]
        write(filepath, new_content)
        print(f"  {fname}: kept {len(unique_rules)} unique rules (removed {css_inner.count('{') - len(unique_rules)})")
    else:
        # No unique rules — remove inline style entirely
        new_content = content[:style_start] + content[style_end:]
        write(filepath, new_content)
        print(f"  {fname}: removed all inline CSS (fully covered by shared) ✓")

print("\nDone.")
