"""
fix_a0_multiline.py  — fix multi-line format QS arrays in topics 01-06.
These files have each option on its own line like:
  o: [
    "$2^2\\cdot3^2\\cdot5$",
    "$2^3\\cdot3\\cdot5$",
    ...
  ],
  a: 0,
"""

import re
import os

TOPICS_DIR = r"C:\Users\Administrator\Documents\Claude\Projects\платформа для подготовки к блоковому экзамену\app\public\lessons\topics"

def fix_multiline_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We'll work on the full content, replacing question blocks.
    # Strategy: find each 'a: 0,' (or 'a:0,') occurrence, look backwards
    # for the options array and forwards to verify it's a QS entry.

    q_index = 0
    offset = 0
    new_content = list(content)  # mutable list of chars
    changed = False

    # Find all 'a: 0,' positions
    a_pattern = re.compile(r'\ba\s*:\s*0\s*,')

    for a_match in list(a_pattern.finditer(content)):
        target_pos = q_index % 4
        q_index += 1

        if target_pos == 0:
            continue  # No swap needed

        a_start = a_match.start()
        a_end = a_match.end()

        # Look backwards in content for 'o: [' before this 'a: 0'
        before = content[:a_start]
        # Find the last 'o: [' or 'o:['
        o_bracket_match = None
        for m in re.finditer(r'\bo\s*:\s*\[', before):
            o_bracket_match = m

        if not o_bracket_match:
            continue

        o_bracket_end = o_bracket_match.end()  # position after '['

        # Extract from o_bracket_end to the closing ']'
        # Find matching ']'
        depth = 1
        i = o_bracket_end
        while i < len(content) and depth > 0:
            c = content[i]
            if c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
            i += 1
        o_bracket_close = i - 1  # position of ']'

        # The options array string (between [ and ])
        opts_str = content[o_bracket_end:o_bracket_close]

        # Parse individual options from the string
        # Options are quoted strings, one per line (possibly)
        # Use the same char-by-char parser
        options = []
        positions = []  # (start, end) in content coordinates
        j = o_bracket_end
        current_start = None
        current_chars = []
        in_quote = None

        while j < o_bracket_close:
            c = content[j]
            if in_quote is None:
                if c in ("'", '"'):
                    in_quote = c
                    current_start = j
                    current_chars = [c]
            else:
                if c == '\\':
                    current_chars.append(c)
                    j += 1
                    if j < o_bracket_close:
                        current_chars.append(content[j])
                elif c == in_quote:
                    current_chars.append(c)
                    options.append(''.join(current_chars))
                    positions.append((current_start, j + 1))
                    current_chars = []
                    in_quote = None
                else:
                    current_chars.append(c)
            j += 1

        if len(options) != 4:
            continue

        # We need to swap options[0] with options[target_pos] in-place.
        # positions[i] = (start, end) of each option string in 'content'
        # We rebuild: replace options[0] text with options[target_pos] text
        # and options[target_pos] text with options[0] text.

        opt0_start, opt0_end = positions[0]
        optT_start, optT_end = positions[target_pos]
        opt0_text = content[opt0_start:opt0_end]
        optT_text = content[optT_start:optT_end]

        # Build a modified version of the content around these ranges.
        # Do it in reverse order to preserve positions.
        seg = content[:opt0_start] + optT_text + content[opt0_end:optT_start] + opt0_text + content[optT_end:]

        # Now update a: 0 → a: target_pos in this new string.
        # Recompute a_match position (it has shifted if the swap changed lengths).
        len_delta = len(optT_text) - len(opt0_text)
        new_a_start = a_start + len_delta if a_start > opt0_end else a_start
        # Actually simpler: just do a regex replace on the first 'a: 0' after opt position
        seg = seg[:a_start + len_delta] + re.sub(
            r'\ba\s*:\s*0\b', f'a: {target_pos}',
            seg[a_start + len_delta:], count=1
        )

        content = seg
        changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    return changed


def count_answer_distribution(filepath):
    """Count how many questions have each answer position."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    counts = {0: 0, 1: 0, 2: 0, 3: 0}
    for m in re.finditer(r'\ba\s*:\s*([0-3])\b', content):
        a = int(m.group(1))
        if a in counts:
            counts[a] += 1
    return counts


def main():
    # Fix topics 01-06 (multi-line format)
    for n in range(1, 7):
        fname = f"topic-{n:02d}.html"
        fpath = os.path.join(TOPICS_DIR, fname)
        if not os.path.exists(fpath):
            print(f"MISSING: {fname}")
            continue
        changed = fix_multiline_file(fpath)
        dist = count_answer_distribution(fpath)
        status = "FIXED" if changed else "ok   "
        print(f"{status}: {fname}  dist={dist}")

    print("\n--- Updated distribution for topics 07-16 ---")
    for n in range(7, 18):
        fname = f"topic-{n:02d}.html"
        fpath = os.path.join(TOPICS_DIR, fname)
        if not os.path.exists(fpath):
            continue
        dist = count_answer_distribution(fpath)
        print(f"topic-{n:02d}: {dist}")


if __name__ == '__main__':
    main()
