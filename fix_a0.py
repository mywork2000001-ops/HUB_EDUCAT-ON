"""
fix_a0.py  — fix the "all answers at a:0" bug in all 17 topic HTML files.
Strategy: for each QS entry, cycle the correct answer position 0→1→2→3→0→...
This gives 5 answers at each of A/B/C/D for a 20-question test.
"""

import re
import os

TOPICS_DIR = r"C:\Users\Administrator\Documents\Claude\Projects\платформа для подготовки к блоковому экзамену\app\public\lessons\topics"

def extract_options(line, o_start):
    """
    Parse the options array starting at the '[' character at o_start.
    Returns list of option strings (with their surrounding quotes) and end index.
    """
    i = o_start + 1  # skip past '['
    options = []
    current = []
    in_quote = None

    while i < len(line):
        c = line[i]

        if in_quote is None:
            if c in ("'", '"'):
                in_quote = c
                current.append(c)
            elif c == ']':
                # end of array
                return options, i
            # else: whitespace/comma between options — skip
        else:
            # inside a quoted string
            if c == '\\':
                # escape: consume this and next char literally
                current.append(c)
                i += 1
                if i < len(line):
                    current.append(line[i])
            elif c == in_quote:
                # end of this option string
                current.append(c)
                options.append(''.join(current))
                current = []
                in_quote = None
            else:
                current.append(c)
        i += 1

    return options, len(line)


def fix_line(line, q_index):
    """
    If the line contains a QS entry with a:0, rotate the correct answer
    to position (q_index % 4). Returns the modified line.
    """
    # Detect if this line has an answer field (a:N or a: N)
    a_match = re.search(r'\ba\s*:\s*([0-3])\b', line)
    if not a_match:
        return line, False

    current_a = int(a_match.group(1))
    target_pos = q_index % 4

    # Only modify if current answer is 0 (and target differs)
    if current_a != 0:
        return line, True  # already has varied answer, count it

    if target_pos == 0:
        return line, True  # stays at 0 — no change needed

    # Find 'o:[' pattern
    o_match = re.search(r'\bo\s*:\s*\[', line)
    if not o_match:
        return line, True

    array_start = o_match.end() - 1  # position of '['
    options, array_end = extract_options(line, array_start)

    if len(options) != 4:
        return line, True  # can't safely modify

    # Swap option[0] (correct) with option[target_pos]
    opts = options[:]
    opts[0], opts[target_pos] = opts[target_pos], opts[0]

    # Rebuild the options array string
    new_o_str = '[' + ','.join(opts) + ']'
    old_o_str = line[array_start:array_end + 1]

    # Replace in line
    new_line = line[:array_start] + new_o_str + line[array_end + 1:]

    # Update a:0 → a:target_pos
    new_line = re.sub(r'\ba\s*:\s*0\b', f'a:{target_pos}', new_line, count=1)

    return new_line, True


def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    q_index = 0  # counts questions processed

    for line in lines:
        new_line, was_q = fix_line(line, q_index)
        if was_q:
            q_index += 1
        new_lines.append(new_line)

    new_content = '\n'.join(new_lines)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False


def main():
    for n in range(1, 18):
        fname = f"topic-{n:02d}.html"
        fpath = os.path.join(TOPICS_DIR, fname)
        if not os.path.exists(fpath):
            print(f"MISSING: {fname}")
            continue
        changed = fix_file(fpath)
        status = "FIXED" if changed else "ok   "
        print(f"{status}: {fname}")


if __name__ == '__main__':
    main()
