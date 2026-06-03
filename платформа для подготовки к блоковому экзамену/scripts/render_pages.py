#!/usr/bin/env python3
"""
Render specific page ranges from DIM PDFs to PNG images.
Usage: python render_pages.py [part] [start_page] [end_page] [output_folder]
  part: 1 or 2
  start_page / end_page: 1-based page numbers
  output_folder: where to save PNGs (default: C:/Temp/dim_pages/)
"""
import sys, os
import fitz  # PyMuPDF

BASE = r"C:\Users\Administrator\Documents\Claude\Projects\платформа для подготовки к блоковому экзамену\source_books"
PDF1 = os.path.join(BASE, "Riyaziyyat Test bank 2025-ci il 1-ci hissə .pdf")
PDF2 = os.path.join(BASE, "Riyaziyyat Test bank 2025-ci il 2-ci hissə.pdf")

def render(part, start_pg, end_pg, out_dir, zoom=2.0):
    pdf_path = PDF1 if part == 1 else PDF2
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    total = len(doc)
    print(f"PDF has {total} pages. Rendering pages {start_pg}-{end_pg}...")
    mat = fitz.Matrix(zoom, zoom)
    saved = []
    for pg_num in range(start_pg - 1, min(end_pg, total)):  # 0-based
        page = doc[pg_num]
        pix = page.get_pixmap(matrix=mat)
        fname = os.path.join(out_dir, f"p{pg_num+1:03d}.png")
        pix.save(fname)
        saved.append(fname)
        if (pg_num - start_pg + 2) % 5 == 0:
            print(f"  Saved page {pg_num+1}")
    doc.close()
    print(f"Done. {len(saved)} pages saved to {out_dir}")
    return saved

if __name__ == '__main__':
    args = sys.argv[1:]
    part = int(args[0]) if args else 1
    start = int(args[1]) if len(args) > 1 else 1
    end = int(args[2]) if len(args) > 2 else 20
    out = args[3] if len(args) > 3 else f"C:/Temp/dim_p{part}_pages"
    render(part, start, end, out)
