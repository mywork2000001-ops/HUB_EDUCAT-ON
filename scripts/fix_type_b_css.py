#!/usr/bin/env python3
"""
fix_type_b_css.py
Fix Type B topics that incorrectly have extra inline CSS after optimization.
For topics 25-28 (base-only CSS) and any topic that ended up with a
duplicate <style> block after the <link> tag, clean up properly.
"""
import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from pathlib import Path

TOPICS_DIR = Path(r"C:\Users\Administrator\Documents\Claude\Projects\платформа для подготовки к блоковому экзамену\app\public\lessons\topics")

def read(p):
    return p.read_text(encoding="utf-8")

def write(p, content):
    p.write_text(content, encoding="utf-8", newline="\n")


def fix_type_b_topic(fname):
    """
    For Type B topics that now have:
       <link rel="stylesheet" href="topic-shared-b.css" />
       <style> ...extra CSS... </style>

    If the extra CSS block is ONLY base selectors (*, html, body, .lesson-header,
    .tab-btn, .section, .slide, etc.), remove it entirely.
    Only keep the inline <style> if it has truly non-base selectors.
    """
    filepath = TOPICS_DIR / fname
    content = read(filepath)

    # Find the pattern: link to shared-b + optional inline style
    link_pattern = r'(\s*<link rel="stylesheet" href="topic-shared-b\.css" />)'
    # After the link, there may be an inline <style> block
    full_pattern = re.search(
        r'(\s*<link rel="stylesheet" href="topic-shared-b\.css" />)'
        r'(\s*<style>[\s\S]*?</style>)?',
        content
    )
    if not full_pattern:
        print(f"  {fname}: no shared-b link found, skipping")
        return

    link_end = full_pattern.end(1)
    style_group = full_pattern.group(2)

    if not style_group:
        print(f"  {fname}: no extra inline style, already clean")
        return

    # The style block exists. Check if it ONLY contains base selectors.
    # Base selectors that should NOT be inline (already in shared):
    BASE_SELECTORS = {
        "*", "*,*::before,*::after", "html", "body", ":root",
        ".lesson-header", ".lesson-header .badge", ".lesson-header h1",
        ".lesson-header p", ".tab-nav", ".tab-nav::-webkit-scrollbar",
        ".tab-btn", ".tab-btn .t-icon", ".tab-btn:hover", ".tab-btn.active",
        ".section", ".section.active", ".slide", ".slide-num", ".slide h2",
        ".slide h3", ".slide p", ".slide ul", ".slide ol", ".slide li",
        ".formula-box", ".def-box", ".info-table", ".svg-wrap",
    }

    # Extract selectors from inline style
    style_inner = re.search(r"<style>([\s\S]*?)</style>", style_group)
    if not style_inner:
        return

    css_inner = style_inner.group(1)
    rules = re.findall(r"([^{}]+)\{[^{}]*\}", css_inner)
    selectors = [r.strip().replace("\n", " ").strip() for r in rules]

    # Check if ALL selectors are base (i.e., nothing extra)
    non_base = [s for s in selectors
                if s and not any(b in s for b in BASE_SELECTORS)
                and s not in ("*", "html", "body", ":root")]

    if not non_base:
        # All base selectors — remove the inline style entirely
        new_content = content[:full_pattern.start(2)] + content[full_pattern.end(2):]
        write(filepath, new_content)
        print(f"  {fname}: removed redundant inline CSS ({len(selectors)} base selectors)")
    else:
        print(f"  {fname}: keeping {len(non_base)} non-base selectors: {non_base[:3]}")


print("=== Fix Type B inline CSS ===\n")
for i in range(15, 29):
    fname = f"topic-{i:02d}.html"
    fix_type_b_topic(fname)

print("\nDone.")
