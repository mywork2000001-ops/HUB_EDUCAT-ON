#!/usr/bin/env python3
"""
global_parser.py
================
EduParser — PDF-to-Lesson extraction pipeline for the Global EDU-Platform.

Usage
-----
    python global_parser.py --project P001 --file path/to/book.pdf
    python global_parser.py --project P001 --file book.pdf --lang az --dpi 200 --verbose

Dependencies
------------
    pip install pymupdf pillow

Optional (OCR fallback):
    pip install pytesseract
    + install Tesseract binary: https://github.com/tesseract-ocr/tesseract
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

# ── Optional dependency guards ─────────────────────────────────────────────
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    from PIL import Image
    import io
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


# ══════════════════════════════════════════════════════════════════════════════
# ANSI colour helpers (no external dep; falls back gracefully on non-TTY)
# ══════════════════════════════════════════════════════════════════════════════

class _Colour:
    """ANSI escape codes, disabled automatically on non-TTY streams."""
    _TTY = sys.stdout.isatty()

    RED     = "\033[91m" if _TTY else ""
    GREEN   = "\033[92m" if _TTY else ""
    YELLOW  = "\033[93m" if _TTY else ""
    BLUE    = "\033[94m" if _TTY else ""
    MAGENTA = "\033[95m" if _TTY else ""
    CYAN    = "\033[96m" if _TTY else ""
    BOLD    = "\033[1m"  if _TTY else ""
    DIM     = "\033[2m"  if _TTY else ""
    RESET   = "\033[0m"  if _TTY else ""

    @classmethod
    def wrap(cls, text: str, *codes: str) -> str:
        return "".join(codes) + str(text) + cls.RESET


class _ColourFormatter(logging.Formatter):
    """Colourised log formatter — maps log levels to ANSI colours."""

    _LEVEL_STYLES = {
        logging.DEBUG:    (_Colour.DIM,     "DBG"),
        logging.INFO:     (_Colour.CYAN,    "INF"),
        logging.WARNING:  (_Colour.YELLOW,  "WRN"),
        logging.ERROR:    (_Colour.RED,     "ERR"),
        logging.CRITICAL: (_Colour.RED + _Colour.BOLD, "CRT"),
    }

    def format(self, record: logging.LogRecord) -> str:
        colour, tag = self._LEVEL_STYLES.get(record.levelno, ("", "???"))
        ts      = self.formatTime(record, "%H:%M:%S")
        prefix  = _Colour.wrap(f"[{tag}]", colour, _Colour.BOLD)
        ts_str  = _Colour.wrap(ts, _Colour.DIM)
        msg     = record.getMessage()
        # Colour specific patterns inline
        msg = re.sub(r"(\bOK\b|✓)", _Colour.wrap(r"\1", _Colour.GREEN, _Colour.BOLD), msg)
        msg = re.sub(r"(\bERROR\b|✗)", _Colour.wrap(r"\1", _Colour.RED, _Colour.BOLD), msg)
        msg = re.sub(r"(\bWARN\b|⚠)", _Colour.wrap(r"\1", _Colour.YELLOW, _Colour.BOLD), msg)
        return f"{ts_str} {prefix} {msg}"


# ══════════════════════════════════════════════════════════════════════════════
# Data Models
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class MultiLang:
    az: str = ""
    ru: str = ""
    en: str = ""

    def as_dict(self) -> dict:
        return {"az": self.az, "ru": self.ru, "en": self.en}


@dataclass
class MultiLangList:
    az: list[str] = field(default_factory=list)
    ru: list[str] = field(default_factory=list)
    en: list[str] = field(default_factory=list)

    def as_dict(self) -> dict:
        return {"az": self.az, "ru": self.ru, "en": self.en}


@dataclass
class ExtractedImage:
    filename: str       # relative path from project root
    page:     int
    width:    int
    height:   int
    source:   str       # "raster" | "vector_region"


@dataclass
class ExtractedQuestion:
    id:      int
    text:    MultiLang
    options: MultiLangList
    images:  list[str]          # list of image filenames
    page:    int
    raw:     str                # original raw text block (diagnostic)


@dataclass
class ParseResult:
    project_id:   str
    source_file:  str
    page_count:   int
    questions:    list[ExtractedQuestion] = field(default_factory=list)
    images:       list[ExtractedImage]   = field(default_factory=list)
    ocr_pages:    list[int]              = field(default_factory=list)
    errors:       list[str]              = field(default_factory=list)
    elapsed_sec:  float                  = 0.0


# ══════════════════════════════════════════════════════════════════════════════
# Regex Patterns
# ══════════════════════════════════════════════════════════════════════════════

# Question starters: "1.", "2)", "Q1", "Q1.", "Sual 1", "Вопрос 1"
_RE_QUESTION = re.compile(
    r"""
    ^                               # start of string (or line)
    (?:
        (?P<numbered>               # numbered: 1.  2)  3-
            (?P<qnum>\d{1,3})       # number 1–999
            [\.\)\-\s]
        )
        |
        (?P<q_prefixed>             # prefixed: Q1  Q.1  Sual 3  Вопрос 5
            (?:Q|Sual|Вопрос|Question)\.?\s*
            (?P<qnum2>\d{1,3})
        )
    )
    \s*
    (?P<body>.+)                    # question body
    """,
    re.VERBOSE | re.IGNORECASE | re.MULTILINE,
)

# Option starters: "A)", "B.", "C-", "(D)", "а)", "б)"  (latin + cyrillic)
_RE_OPTION = re.compile(
    r"""
    ^
    (?:
        \(?                          # optional opening paren
        (?P<letter>[A-Ea-eА-ДаА-Еа-е])  # letter A-E or А-Д (Cyrillic)
        [\.\)\-]                     # separator
        \)?
    )
    \s*
    (?P<body>.+)
    """,
    re.VERBOSE | re.MULTILINE,
)

# Blank / near-blank page: used to flag OCR candidates
_RE_WHITESPACE_ONLY = re.compile(r"^\s*$")


# ══════════════════════════════════════════════════════════════════════════════
# EduParser
# ══════════════════════════════════════════════════════════════════════════════

class EduParser:
    """
    Main extraction engine.

    Workflow
    --------
    1. open_document()     — load PDF with PyMuPDF
    2. process_pages()     — iterate pages → extract text + images
    3. parse_questions()   — apply regex heuristics
    4. save_json()         — write raw_data.json
    5. print_summary()     — colourised report
    """

    PROJECTS_ROOT = Path(__file__).resolve().parent.parent   # …/Projects/
    WEBP_QUALITY  = 80
    WEBP_MAX_W    = 1000
    VECTOR_DPI    = 150   # DPI for rendering vector-only page regions

    # ── Construction ──────────────────────────────────────────────────────────

    def __init__(
        self,
        project_id: str,
        pdf_path:   Path,
        lang:       str  = "az",
        dpi:        int  = 150,
        verbose:    bool = False,
    ) -> None:
        self.project_id = project_id.upper()
        self.pdf_path   = pdf_path.resolve()
        self.lang       = lang.lower()
        self.dpi        = dpi
        self.verbose    = verbose

        self._setup_logging()
        self._setup_paths()
        self._check_dependencies()

        self._doc: Optional["fitz.Document"] = None
        self._result: Optional[ParseResult]  = None

    def _setup_logging(self) -> None:
        self.log = logging.getLogger(f"EduParser[{self.project_id}]")
        self.log.setLevel(logging.DEBUG if self.verbose else logging.INFO)
        if not self.log.handlers:
            h = logging.StreamHandler(sys.stdout)
            h.setFormatter(_ColourFormatter())
            self.log.addHandler(h)

    def _setup_paths(self) -> None:
        """Resolve all I/O paths from project ID."""
        # Find project folder: first match P001_* under PROJECTS_ROOT
        candidates = sorted(self.PROJECTS_ROOT.glob(f"{self.project_id}_*"))
        if candidates:
            self.project_dir = candidates[0]
        else:
            # Auto-create if the project folder doesn't exist yet
            self.project_dir = self.PROJECTS_ROOT / self.project_id
            self.project_dir.mkdir(parents=True, exist_ok=True)
            self.log.warning(f"Project folder not found — created {self.project_dir}")

        self.assets_dir = self.project_dir / "assets" / "img"
        self.assets_dir.mkdir(parents=True, exist_ok=True)

        self.json_out = self.project_dir / "raw_data.json"
        self.log.debug(f"Project dir  : {self.project_dir}")
        self.log.debug(f"Assets dir   : {self.assets_dir}")
        self.log.debug(f"JSON output  : {self.json_out}")

    def _check_dependencies(self) -> None:
        if not PYMUPDF_AVAILABLE:
            self.log.error("PyMuPDF not installed. Run: pip install pymupdf")
            sys.exit(1)
        if not PILLOW_AVAILABLE:
            self.log.error("Pillow not installed. Run: pip install pillow")
            sys.exit(1)
        if not TESSERACT_AVAILABLE:
            self.log.warning("⚠ pytesseract not found — OCR fallback disabled")

    # ── Public API ────────────────────────────────────────────────────────────

    def run(self) -> ParseResult:
        """Full pipeline: open → process → parse → save → report."""
        t0 = time.perf_counter()
        self.log.info(_Colour.wrap(f"Starting EduParser  ·  {self.pdf_path.name}", _Colour.BOLD))
        self.log.info(f"Project: {self.project_id}  |  Lang hint: {self.lang.upper()}  |  DPI: {self.dpi}")

        self._result = ParseResult(
            project_id=self.project_id,
            source_file=str(self.pdf_path),
            page_count=0,
        )

        with fitz.open(str(self.pdf_path)) as doc:
            self._doc = doc
            self._result.page_count = len(doc)
            self.log.info(f"Opened PDF: {len(doc)} pages")

            raw_blocks: list[dict] = []
            for page_num, page in enumerate(doc, start=1):
                self.log.debug(f"  Processing page {page_num}/{len(doc)} …")
                blocks = self._process_page(page, page_num)
                raw_blocks.extend(blocks)

        questions = self._parse_questions(raw_blocks)
        self._result.questions = questions

        self._result.elapsed_sec = time.perf_counter() - t0
        self._save_json()
        self._print_summary()
        return self._result

    # ── Page Processing ───────────────────────────────────────────────────────

    def _process_page(self, page: "fitz.Page", page_num: int) -> list[dict]:
        """Extract text blocks and images from a single page."""
        # ── Text ─────────────────────────────────────────────────────────────
        raw_text = page.get_text("text").strip()

        if _RE_WHITESPACE_ONLY.match(raw_text):
            self._handle_ocr_page(page, page_num)
            return []

        # Structured blocks: each block → (x0,y0,x1,y1, text, block_no, block_type)
        text_blocks = page.get_text("blocks")
        parsed_blocks = []
        for b in text_blocks:
            if b[6] != 0:   # type 0 = text, 1 = image
                continue
            text = b[4].strip()
            if text:
                parsed_blocks.append({
                    "page": page_num,
                    "bbox": list(b[:4]),
                    "text": text,
                })

        # ── Images ───────────────────────────────────────────────────────────
        self._extract_raster_images(page, page_num)
        self._extract_vector_regions(page, page_num)

        return parsed_blocks

    # ── Image Extraction ──────────────────────────────────────────────────────

    def _extract_raster_images(self, page: "fitz.Page", page_num: int) -> None:
        """Extract all embedded raster images from the page."""
        image_list = page.get_images(full=True)
        if not image_list:
            return

        doc = page.parent   # fitz.Document reference
        for img_index, img_info in enumerate(image_list, start=1):
            xref = img_info[0]
            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                img_w = base_image.get("width", 0)
                img_h = base_image.get("height", 0)

                # Skip tiny images (icons / decorations < 50px)
                if img_w < 50 or img_h < 50:
                    self.log.debug(f"    Skipping tiny image {img_index} ({img_w}×{img_h})")
                    continue

                filename = f"p{page_num:03d}_raster_{img_index:02d}.webp"
                out_path = self.assets_dir / filename

                self._save_as_webp(image_bytes, out_path)

                self._result.images.append(ExtractedImage(
                    filename=f"assets/img/{filename}",
                    page=page_num,
                    width=img_w,
                    height=img_h,
                    source="raster",
                ))
                self.log.debug(f"    ✓ Raster image → {filename}  ({img_w}×{img_h})")

            except Exception as exc:
                msg = f"Raster extraction failed xref={xref}: {exc}"
                self.log.warning(f"    ⚠ {msg}")
                self._result.errors.append(msg)

    def _extract_vector_regions(self, page: "fitz.Page", page_num: int) -> None:
        """
        Detect vector drawing clusters and render each bounding-box region
        as a high-res pixmap, then save as WebP.
        Strategy: group drawing paths by proximity; ignore single-line rules.
        """
        drawings = page.get_drawings()
        if not drawings:
            return

        # Aggregate all path bboxes
        all_rects = [fitz.Rect(d["rect"]) for d in drawings if d.get("rect")]
        if not all_rects:
            return

        clusters = self._cluster_rects(all_rects, gap=20)

        for cluster_idx, cluster_rect in enumerate(clusters, start=1):
            # Skip thin horizontal/vertical rules (width or height < 5pt)
            if cluster_rect.width < 5 or cluster_rect.height < 5:
                continue
            # Skip very small clusters (likely decorative lines)
            if cluster_rect.width * cluster_rect.height < 2000:
                continue

            try:
                # Render just the cluster region at VECTOR_DPI
                mat = fitz.Matrix(self.VECTOR_DPI / 72, self.VECTOR_DPI / 72)
                clip = cluster_rect + fitz.Rect(-4, -4, 4, 4)   # 4pt padding
                pix = page.get_pixmap(matrix=mat, clip=clip, alpha=False)
                img_bytes = pix.tobytes("png")

                filename = f"p{page_num:03d}_vector_{cluster_idx:02d}.webp"
                out_path = self.assets_dir / filename

                self._save_as_webp(img_bytes, out_path)

                self._result.images.append(ExtractedImage(
                    filename=f"assets/img/{filename}",
                    page=page_num,
                    width=pix.width,
                    height=pix.height,
                    source="vector_region",
                ))
                self.log.debug(
                    f"    ✓ Vector region {cluster_idx} → {filename} "
                    f"({pix.width}×{pix.height}, area={cluster_rect.width:.0f}×{cluster_rect.height:.0f}pt)"
                )
            except Exception as exc:
                msg = f"Vector render failed page={page_num} cluster={cluster_idx}: {exc}"
                self.log.warning(f"    ⚠ {msg}")
                self._result.errors.append(msg)

    @staticmethod
    def _cluster_rects(rects: list["fitz.Rect"], gap: float = 20) -> list["fitz.Rect"]:
        """
        Greedy 1D clustering: merge rectangles whose bounding boxes are within
        `gap` points of each other on at least one axis.
        Returns a list of merged bounding Rect per cluster.
        """
        if not rects:
            return []

        clusters: list[list[fitz.Rect]] = []

        for rect in rects:
            merged = False
            for cluster in clusters:
                # Check proximity to any existing member
                for member in cluster:
                    expanded = member + fitz.Rect(-gap, -gap, gap, gap)
                    if expanded.intersects(rect):
                        cluster.append(rect)
                        merged = True
                        break
                if merged:
                    break
            if not merged:
                clusters.append([rect])

        # Build union rect per cluster
        result = []
        for cluster in clusters:
            union = cluster[0]
            for r in cluster[1:]:
                union |= r
            result.append(union)
        return result

    # ── WebP Export ───────────────────────────────────────────────────────────

    def _save_as_webp(self, raw_bytes: bytes, out_path: Path) -> None:
        """Decode raw_bytes → resize to max WEBP_MAX_W → save as WebP."""
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        if img.width > self.WEBP_MAX_W:
            ratio = self.WEBP_MAX_W / img.width
            img = img.resize(
                (self.WEBP_MAX_W, int(img.height * ratio)),
                Image.LANCZOS,
            )
        img.save(str(out_path), "WEBP", quality=self.WEBP_QUALITY, method=6)

    # ── OCR Fallback ──────────────────────────────────────────────────────────

    def _handle_ocr_page(self, page: "fitz.Page", page_num: int) -> None:
        """Called when a page has no extractable text (likely scanned)."""
        self._result.ocr_pages.append(page_num)

        if TESSERACT_AVAILABLE:
            self.log.info(f"  Page {page_num}: no text — running Tesseract OCR …")
            try:
                mat = fitz.Matrix(200 / 72, 200 / 72)   # 200 DPI for OCR quality
                pix = page.get_pixmap(matrix=mat, alpha=False)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                lang_map = {"az": "aze", "ru": "rus", "en": "eng"}
                tess_lang = lang_map.get(self.lang, "eng")
                text = pytesseract.image_to_string(img, lang=tess_lang)
                if text.strip():
                    self.log.info(
                        f"  ✓ Tesseract extracted {len(text.split())} words from page {page_num}"
                    )
                    # Re-inject as a synthetic text block for downstream parsing
                    return [{"page": page_num, "bbox": [0, 0, 0, 0], "text": text, "ocr": True}]
            except Exception as exc:
                self.log.warning(f"  ⚠ Tesseract failed on page {page_num}: {exc}")
        else:
            self.log.warning(
                f"  ⚠ Page {page_num} has no text (scanned image). "
                "Install pytesseract + Tesseract binary for OCR, "
                "or use AI Vision (GPT-4o / Claude) for structured extraction."
            )

    # ── Question Parsing ──────────────────────────────────────────────────────

    def _parse_questions(self, raw_blocks: list[dict]) -> list[ExtractedQuestion]:
        """
        Apply heuristic regex to raw text blocks and assemble ExtractedQuestion objects.

        Strategy
        --------
        1. Walk blocks in page order.
        2. A QUESTION_START pattern opens a new question context.
        3. OPTION_START patterns accumulate into the current question's options list.
        4. Anything else before the next question start is appended to the last question body.
        """
        questions: list[ExtractedQuestion] = []
        current_q: Optional[_QBuilder] = None

        for block in raw_blocks:
            lines = block["text"].splitlines()
            for line in lines:
                line = line.strip()
                if not line:
                    continue

                q_match = _RE_QUESTION.match(line)
                if q_match:
                    # Flush previous question
                    if current_q:
                        questions.append(current_q.build(self.lang))

                    qnum_str = q_match.group("qnum") or q_match.group("qnum2") or str(len(questions) + 1)
                    body     = (q_match.group("body") or "").strip()
                    current_q = _QBuilder(
                        id=int(qnum_str),
                        page=block["page"],
                        body=body,
                        lang=self.lang,
                    )
                    continue

                opt_match = _RE_OPTION.match(line)
                if opt_match and current_q:
                    current_q.add_option(opt_match.group("body").strip())
                    continue

                # Continuation text — append to current question body
                if current_q:
                    current_q.append_body(line)

        if current_q:
            questions.append(current_q.build(self.lang))

        self.log.info(f"Parsed {len(questions)} question(s) from {len(raw_blocks)} text block(s)")
        return questions

    # ── JSON Output ───────────────────────────────────────────────────────────

    def _save_json(self) -> None:
        """Serialise ParseResult to raw_data.json."""
        r = self._result

        payload = {
            "project_id":  r.project_id,
            "source_file": Path(r.source_file).name,
            "page_count":  r.page_count,
            "generated":   time.strftime("%Y-%m-%dT%H:%M:%S"),
            "questions": [
                {
                    "id":     q.id,
                    "page":   q.page,
                    "text":   q.text.as_dict(),
                    "options": q.options.as_dict(),
                    "images": q.images,
                    "raw":    q.raw,
                }
                for q in r.questions
            ],
            "images": [
                {
                    "filename": img.filename,
                    "page":     img.page,
                    "width":    img.width,
                    "height":   img.height,
                    "source":   img.source,
                }
                for img in r.images
            ],
            "diagnostics": {
                "ocr_pages":   r.ocr_pages,
                "errors":      r.errors,
                "elapsed_sec": round(r.elapsed_sec, 3),
            },
        }

        with self.json_out.open("w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)

        self.log.info(f"✓ JSON saved → {self.json_out}")

    # ── Summary Report ────────────────────────────────────────────────────────

    def _print_summary(self) -> None:
        r = self._result
        sep = _Colour.wrap("─" * 52, _Colour.DIM)
        print(f"\n{sep}")
        print(_Colour.wrap("  EDUPARSER — EXTRACTION SUMMARY", _Colour.BOLD))
        print(sep)

        def row(label: str, value, colour: str = "") -> None:
            val_str = _Colour.wrap(str(value), colour) if colour else str(value)
            print(f"  {label:<26} {val_str}")

        row("Project",         r.project_id,                _Colour.CYAN)
        row("Source file",     Path(r.source_file).name)
        row("Pages processed", r.page_count)
        row("Questions parsed",len(r.questions),             _Colour.GREEN if r.questions else _Colour.YELLOW)
        row("Images extracted",len(r.images),                _Colour.GREEN if r.images    else _Colour.YELLOW)
        row("OCR pages",       len(r.ocr_pages) or "none",   _Colour.YELLOW if r.ocr_pages else "")
        row("Errors",          len(r.errors)    or "none",   _Colour.RED    if r.errors    else _Colour.GREEN)
        row("Elapsed",         f"{r.elapsed_sec:.2f}s")
        row("Output",          str(self.json_out),           _Colour.CYAN)

        if r.ocr_pages:
            pages_str = ", ".join(str(p) for p in r.ocr_pages)
            print(f"\n  {_Colour.wrap('⚠  OCR pages (no text layer):', _Colour.YELLOW)} {pages_str}")
            if not TESSERACT_AVAILABLE:
                print(
                    f"  {_Colour.wrap('   → Install pytesseract + Tesseract binary', _Colour.DIM)}\n"
                    f"  {_Colour.wrap('   → Or use AI Vision (GPT-4o / Claude) for structured extraction', _Colour.DIM)}"
                )

        if r.errors:
            print(f"\n  {_Colour.wrap('Errors:', _Colour.RED)}")
            for err in r.errors[:5]:
                print(f"    • {err}")
            if len(r.errors) > 5:
                print(f"    … and {len(r.errors) - 5} more (see raw_data.json → diagnostics.errors)")

        status_colour = _Colour.GREEN if not r.errors else _Colour.YELLOW
        status_label  = "OK — ready for template generation" if not r.errors else "WARN — completed with errors"
        print(f"\n  {_Colour.wrap(status_label, status_colour, _Colour.BOLD)}")
        print(f"{sep}\n")


# ══════════════════════════════════════════════════════════════════════════════
# Builder helper (private)
# ══════════════════════════════════════════════════════════════════════════════

class _QBuilder:
    """Accumulates lines for one question before building ExtractedQuestion."""

    def __init__(self, id: int, page: int, body: str, lang: str) -> None:
        self.id      = id
        self.page    = page
        self._body   = body
        self._opts:  list[str] = []
        self._lang   = lang

    def append_body(self, text: str) -> None:
        if self._body:
            self._body += " " + text
        else:
            self._body = text

    def add_option(self, text: str) -> None:
        self._opts.append(text)

    def build(self, lang: str) -> ExtractedQuestion:
        text = MultiLang()
        opts = MultiLangList()
        # Place extracted text in the primary language slot
        setattr(text, lang, self._body)
        setattr(opts, lang, self._opts)
        return ExtractedQuestion(
            id=self.id,
            text=text,
            options=opts,
            images=[],
            page=self.page,
            raw=self._body,
        )


# ══════════════════════════════════════════════════════════════════════════════
# CLI Entry Point
# ══════════════════════════════════════════════════════════════════════════════

def _build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="global_parser",
        description=(
            "EduParser — PDF-to-Lesson extraction pipeline\n"
            "Part of the Global EDU-Platform (Interactive Education Network)\n\n"
            "Examples:\n"
            "  python global_parser.py --project P001 --file book.pdf\n"
            "  python global_parser.py --project P001 --file book.pdf --lang ru --dpi 200 --verbose"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--project", "-p",
        required=True,
        metavar="PROJECT_ID",
        help="Project identifier, e.g. P001  (must match a folder P001_* under Projects/)",
    )
    p.add_argument(
        "--file", "-f",
        required=True,
        metavar="PDF_PATH",
        type=Path,
        help="Path to the source PDF file (absolute or relative to current directory)",
    )
    p.add_argument(
        "--lang", "-l",
        default="az",
        choices=["az", "ru", "en"],
        help="Primary language of the PDF content (default: az)",
    )
    p.add_argument(
        "--dpi",
        default=150,
        type=int,
        metavar="N",
        help="Resolution for vector region rendering (default: 150). Higher = sharper but slower.",
    )
    p.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable DEBUG-level logging",
    )
    return p


def main() -> None:
    parser = _build_arg_parser()
    args   = parser.parse_args()

    pdf_path: Path = args.file
    if not pdf_path.is_absolute():
        # Resolve relative to CWD first, then fall back to books/ directory
        if not pdf_path.exists():
            books_path = Path(__file__).resolve().parent.parent / "books" / pdf_path
            if books_path.exists():
                pdf_path = books_path
            else:
                print(
                    _Colour.wrap(f"ERROR: PDF not found: {args.file}", _Colour.RED, _Colour.BOLD),
                    file=sys.stderr,
                )
                sys.exit(1)

    edu = EduParser(
        project_id=args.project,
        pdf_path=pdf_path,
        lang=args.lang,
        dpi=args.dpi,
        verbose=args.verbose,
    )
    edu.run()


if __name__ == "__main__":
    main()
