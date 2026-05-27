#!/usr/bin/env python3
"""
global_parser.py
================
EduParser — PDF-to-Lesson extraction pipeline for the Global EDU-Platform.

Usage
-----
    python global_parser.py --project P001 --file path/to/book.pdf
    python global_parser.py --project P001 --file book.pdf --lang az --dpi 200 --verbose
    python global_parser.py --project P001 --file book.pdf --pages 5   # Vision Workflow, first 5 pages

Dependencies
------------
    pip install pymupdf pillow

Optional (OCR fallback):
    pip install pytesseract
    + install Tesseract binary: https://github.com/tesseract-ocr/tesseract
"""

from __future__ import annotations

import argparse
import io
import json
import logging
import re
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# Force UTF-8 on Windows consoles (cp1252 can't encode checkmarks / arrows)
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ── Optional dependency guards ─────────────────────────────────────────────
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    from PIL import Image
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
class PageImage:
    page:       int
    filename:   str     # relative path from PROJECTS_ROOT
    width:      int
    height:     int
    dpi:        int


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
    page_images:  list[PageImage]        = field(default_factory=list)
    ocr_pages:    list[int]              = field(default_factory=list)
    errors:       list[str]              = field(default_factory=list)
    elapsed_sec:  float                  = 0.0


# ══════════════════════════════════════════════════════════════════════════════
# Regex Patterns
# ══════════════════════════════════════════════════════════════════════════════

_RE_QUESTION = re.compile(
    r"""
    ^
    (?:
        (?P<numbered>
            (?P<qnum>\d{1,3})
            [\.\)\-\s]
        )
        |
        (?P<q_prefixed>
            (?:Q|Sual|Вопрос|Question)\.?\s*
            (?P<qnum2>\d{1,3})
        )
    )
    \s*
    (?P<body>.+)
    """,
    re.VERBOSE | re.IGNORECASE | re.MULTILINE,
)

_RE_OPTION = re.compile(
    r"""
    ^
    (?:
        \(?
        (?P<letter>[A-Ea-eА-ДаА-Еа-е])
        [\.\)\-]
        \)?
    )
    \s*
    (?P<body>.+)
    """,
    re.VERBOSE | re.MULTILINE,
)

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
    5. [vision path]       — render page images + write manifest.json
    6. print_summary()     — colourised report
    """

    PROJECTS_ROOT = Path(__file__).resolve().parent.parent   # …/Projects/
    WEBP_QUALITY  = 85
    WEBP_MAX_W    = 1200
    VECTOR_DPI    = 150
    VISION_DPI    = 300   # full-page render DPI for scanned books

    # ── Construction ──────────────────────────────────────────────────────────

    def __init__(
        self,
        project_id: str,
        pdf_path:   Path,
        lang:       str  = "az",
        dpi:        int  = 150,
        pages:      Optional[int] = None,
        verbose:    bool = False,
    ) -> None:
        self.project_id = project_id.upper()
        self.pdf_path   = pdf_path.resolve()
        self.lang       = lang.lower()
        self.dpi        = dpi
        self.page_limit = pages   # None = all pages
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
        candidates = sorted(self.PROJECTS_ROOT.glob(f"{self.project_id}_*"))
        if candidates:
            self.project_dir = candidates[0]
        else:
            self.project_dir = self.PROJECTS_ROOT / self.project_id
            self.project_dir.mkdir(parents=True, exist_ok=True)
            self.log.warning(f"Project folder not found — created {self.project_dir}")

        self.assets_dir = self.project_dir / "assets" / "img"
        self.assets_dir.mkdir(parents=True, exist_ok=True)

        # Vision Workflow: page renders live under <root>/assets/img/<project_id>/pages/
        self.pages_dir = self.PROJECTS_ROOT / "assets" / "img" / self.project_id / "pages"
        self.pages_dir.mkdir(parents=True, exist_ok=True)

        self.json_out     = self.project_dir / "raw_data.json"
        self.manifest_out = self.PROJECTS_ROOT / "assets" / "img" / self.project_id / "manifest.json"

        self.log.debug(f"Project dir  : {self.project_dir}")
        self.log.debug(f"Assets dir   : {self.assets_dir}")
        self.log.debug(f"Pages dir    : {self.pages_dir}")
        self.log.debug(f"JSON output  : {self.json_out}")
        self.log.debug(f"Manifest     : {self.manifest_out}")

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
        self.log.info(
            f"Project: {self.project_id}  |  Lang hint: {self.lang.upper()}  |  DPI: {self.dpi}"
            + (f"  |  Page limit: {self.page_limit}" if self.page_limit else "")
        )

        self._result = ParseResult(
            project_id=self.project_id,
            source_file=str(self.pdf_path),
            page_count=0,
        )

        with fitz.open(str(self.pdf_path)) as doc:
            self._doc = doc
            total_pages = len(doc)
            self._result.page_count = total_pages

            limit = min(self.page_limit, total_pages) if self.page_limit else total_pages
            self.log.info(f"Opened PDF: {total_pages} total pages  |  Processing: {limit}")

            raw_blocks: list[dict] = []
            for page_num, page in enumerate(doc, start=1):
                if page_num > limit:
                    break
                self.log.debug(f"  Processing page {page_num}/{limit} …")
                blocks = self._process_page(page, page_num)
                raw_blocks.extend(blocks)

        questions = self._parse_questions(raw_blocks)
        self._result.questions = questions

        # Vision Workflow: if every processed page was image-only, build manifest
        processed = limit if self.page_limit else self._result.page_count
        all_scanned = (
            len(self._result.ocr_pages) == processed
            and processed > 0
            and not raw_blocks
        )
        has_page_images = bool(self._result.page_images)

        if all_scanned or has_page_images:
            self._save_manifest()

        self._result.elapsed_sec = time.perf_counter() - t0
        self._save_json()
        self._print_summary()
        return self._result

    # ── Vision Workflow ───────────────────────────────────────────────────────

    def render_pages_to_images(
        self,
        doc: "fitz.Document",
        page_limit: Optional[int] = None,
    ) -> list[PageImage]:
        """
        Render each PDF page to a full-resolution WebP image at VISION_DPI.
        Saves to pages_dir and returns a list of PageImage records.
        Public so it can be called standalone without running the full pipeline.
        """
        total = len(doc)
        limit = min(page_limit, total) if page_limit else total
        results: list[PageImage] = []

        self.log.info(
            _Colour.wrap(f"Vision Workflow: rendering {limit} page(s) at {self.VISION_DPI} DPI …", _Colour.MAGENTA)
        )

        mat = fitz.Matrix(self.VISION_DPI / 72, self.VISION_DPI / 72)

        for page_num in range(1, limit + 1):
            page = doc[page_num - 1]
            try:
                pix      = page.get_pixmap(matrix=mat, alpha=False)
                img_data = pix.tobytes("png")

                filename     = f"page_{page_num:03d}.webp"
                out_path     = self.pages_dir / filename
                rel_path     = f"assets/img/{self.project_id}/pages/{filename}"

                self._save_page_webp(img_data, out_path)

                pi = PageImage(
                    page=page_num,
                    filename=rel_path,
                    width=pix.width,
                    height=pix.height,
                    dpi=self.VISION_DPI,
                )
                results.append(pi)
                self.log.info(
                    f"  ✓ Page {page_num:>3}/{limit}  →  {filename}  "
                    f"({pix.width}×{pix.height} px)"
                )
            except Exception as exc:
                msg = f"Page render failed page={page_num}: {exc}"
                self.log.warning(f"  ⚠ {msg}")
                self._result.errors.append(msg)

        return results

    def _save_page_webp(self, raw_bytes: bytes, out_path: Path) -> None:
        """Save raw PNG bytes as high-quality WebP for AI Vision consumption."""
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        # No downscaling for vision pages — preserve full resolution
        img.save(str(out_path), "WEBP", quality=90, method=6)

    def _save_manifest(self) -> None:
        """Write manifest.json listing all rendered page images."""
        r = self._result
        payload = {
            "project_id":   r.project_id,
            "source_file":  Path(r.source_file).name,
            "generated":    time.strftime("%Y-%m-%dT%H:%M:%S"),
            "total_pages":  r.page_count,
            "rendered_pages": len(r.page_images),
            "vision_dpi":   self.VISION_DPI,
            "pages_dir":    str(self.pages_dir),
            "pages": [
                {
                    "page":     pi.page,
                    "filename": pi.filename,
                    "width":    pi.width,
                    "height":   pi.height,
                    "dpi":      pi.dpi,
                }
                for pi in r.page_images
            ],
        }
        with self.manifest_out.open("w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        self.log.info(f"✓ Manifest saved → {self.manifest_out}")

    # ── Page Processing ───────────────────────────────────────────────────────

    def _process_page(self, page: "fitz.Page", page_num: int) -> list[dict]:
        """Extract text blocks and images from a single page.

        Always renders a full-page vision image so every page ends up in
        the manifest regardless of whether it carries a text layer.
        """
        # Vision Workflow: render full page unconditionally
        self._render_page_to_vision(page, page_num)

        raw_text = page.get_text("text").strip()

        if _RE_WHITESPACE_ONLY.match(raw_text):
            self._handle_ocr_page(page, page_num)
            return []

        text_blocks = page.get_text("blocks")
        parsed_blocks = []
        for b in text_blocks:
            if b[6] != 0:
                continue
            text = b[4].strip()
            if text:
                parsed_blocks.append({
                    "page": page_num,
                    "bbox": list(b[:4]),
                    "text": text,
                })

        self._extract_raster_images(page, page_num)
        self._extract_vector_regions(page, page_num)

        return parsed_blocks

    def _render_page_to_vision(self, page: "fitz.Page", page_num: int) -> None:
        """Render the full page at VISION_DPI and store a PageImage record."""
        try:
            mat      = fitz.Matrix(self.VISION_DPI / 72, self.VISION_DPI / 72)
            pix      = page.get_pixmap(matrix=mat, alpha=False)
            img_data = pix.tobytes("png")

            filename = f"page_{page_num:03d}.webp"
            out_path = self.pages_dir / filename
            rel_path = f"assets/img/{self.project_id}/pages/{filename}"

            self._save_page_webp(img_data, out_path)

            self._result.page_images.append(PageImage(
                page=page_num,
                filename=rel_path,
                width=pix.width,
                height=pix.height,
                dpi=self.VISION_DPI,
            ))
            self.log.info(
                f"  [vision] page {page_num:>3}  →  {filename}  ({pix.width}x{pix.height} px)"
            )
        except Exception as exc:
            msg = f"Vision render failed page={page_num}: {exc}"
            self.log.warning(f"  WARN {msg}")
            self._result.errors.append(msg)

    # ── Image Extraction ──────────────────────────────────────────────────────

    def _extract_raster_images(self, page: "fitz.Page", page_num: int) -> None:
        """Extract all embedded raster images from the page."""
        image_list = page.get_images(full=True)
        if not image_list:
            return

        doc = page.parent
        for img_index, img_info in enumerate(image_list, start=1):
            xref = img_info[0]
            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                img_w = base_image.get("width", 0)
                img_h = base_image.get("height", 0)

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
        """Detect vector drawing clusters and render each region as WebP."""
        drawings = page.get_drawings()
        if not drawings:
            return

        all_rects = [fitz.Rect(d["rect"]) for d in drawings if d.get("rect")]
        if not all_rects:
            return

        clusters = self._cluster_rects(all_rects, gap=20)

        for cluster_idx, cluster_rect in enumerate(clusters, start=1):
            if cluster_rect.width < 5 or cluster_rect.height < 5:
                continue
            if cluster_rect.width * cluster_rect.height < 2000:
                continue

            try:
                mat  = fitz.Matrix(self.VECTOR_DPI / 72, self.VECTOR_DPI / 72)
                clip = cluster_rect + fitz.Rect(-4, -4, 4, 4)
                pix  = page.get_pixmap(matrix=mat, clip=clip, alpha=False)
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
        """Greedy proximity clustering: merge rects within `gap` points of each other."""
        if not rects:
            return []

        clusters: list[list[fitz.Rect]] = []

        for rect in rects:
            merged = False
            for cluster in clusters:
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

    # ── OCR / Vision Fallback ─────────────────────────────────────────────────

    def _handle_ocr_page(self, page: "fitz.Page", page_num: int) -> None:
        """
        Called when a page has no extractable text (scanned image).
        Vision render was already done by _render_page_to_vision; this method
        only records the page as OCR-needed and optionally runs Tesseract.
        """
        self._result.ocr_pages.append(page_num)

        # Optional Tesseract OCR on top
        if TESSERACT_AVAILABLE:
            self.log.info(f"  Page {page_num}: running Tesseract OCR …")
            try:
                mat = fitz.Matrix(200 / 72, 200 / 72)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                lang_map  = {"az": "aze", "ru": "rus", "en": "eng"}
                tess_lang = lang_map.get(self.lang, "eng")
                text = pytesseract.image_to_string(img, lang=tess_lang)
                if text.strip():
                    self.log.info(
                        f"  ✓ Tesseract extracted {len(text.split())} words from page {page_num}"
                    )
            except Exception as exc:
                self.log.warning(f"  ⚠ Tesseract failed on page {page_num}: {exc}")
        else:
            self.log.warning(
                f"  ⚠ Page {page_num}: no text layer detected. "
                "Page image saved for AI Vision processing."
            )

    # ── Question Parsing ──────────────────────────────────────────────────────

    def _parse_questions(self, raw_blocks: list[dict]) -> list[ExtractedQuestion]:
        """Apply heuristic regex to raw text blocks and assemble ExtractedQuestion objects."""
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
                    "id":      q.id,
                    "page":    q.page,
                    "text":    q.text.as_dict(),
                    "options": q.options.as_dict(),
                    "images":  q.images,
                    "raw":     q.raw,
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
            "page_images": [
                {
                    "page":     pi.page,
                    "filename": pi.filename,
                    "width":    pi.width,
                    "height":   pi.height,
                    "dpi":      pi.dpi,
                }
                for pi in r.page_images
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

        row("Project",          r.project_id,                 _Colour.CYAN)
        row("Source file",      Path(r.source_file).name)
        row("Pages processed",  r.page_count)
        row("Questions parsed", len(r.questions),              _Colour.GREEN if r.questions  else _Colour.YELLOW)
        row("Images extracted", len(r.images),                 _Colour.GREEN if r.images     else _Colour.YELLOW)
        row("Page renders",     len(r.page_images),            _Colour.MAGENTA if r.page_images else "")
        row("OCR pages",        len(r.ocr_pages) or "none",    _Colour.YELLOW if r.ocr_pages else "")
        row("Errors",           len(r.errors)    or "none",    _Colour.RED    if r.errors    else _Colour.GREEN)
        row("Elapsed",          f"{r.elapsed_sec:.2f}s")
        row("JSON output",      str(self.json_out),            _Colour.CYAN)

        if r.page_images:
            row("Manifest",     str(self.manifest_out),        _Colour.MAGENTA)

        if r.ocr_pages:
            pages_str = ", ".join(str(p) for p in r.ocr_pages)
            print(f"\n  {_Colour.wrap('⚠  Scanned pages (no text layer):', _Colour.YELLOW)} {pages_str}")
            print(
                f"  {_Colour.wrap('   → Page images saved to: ' + str(self.pages_dir), _Colour.MAGENTA)}"
            )
            print(
                f"  {_Colour.wrap('   → Feed manifest.json to Claude / GPT-4o Vision for extraction', _Colour.DIM)}"
            )

        if r.errors:
            print(f"\n  {_Colour.wrap('Errors:', _Colour.RED)}")
            for err in r.errors[:5]:
                print(f"    • {err}")
            if len(r.errors) > 5:
                print(f"    … and {len(r.errors) - 5} more (see raw_data.json → diagnostics.errors)")

        status_colour = _Colour.GREEN if not r.errors else _Colour.YELLOW
        status_label  = "OK — ready for Vision / template generation" if r.page_images else "OK — ready for template generation"
        if r.errors:
            status_label = "WARN — completed with errors"
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
            "  python global_parser.py --project P001 --file book.pdf --lang ru --dpi 200 --verbose\n"
            "  python global_parser.py --project P001 --file book.pdf --pages 5"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--project", "-p",
        required=True,
        metavar="PROJECT_ID",
        help="Project identifier, e.g. P001",
    )
    p.add_argument(
        "--file", "-f",
        required=True,
        metavar="PDF_PATH",
        type=Path,
        help="Path to the source PDF file (absolute or relative to CWD)",
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
        help="Resolution for vector region rendering (default: 150)",
    )
    p.add_argument(
        "--pages",
        default=None,
        type=int,
        metavar="N",
        help="Limit processing to the first N pages (default: all pages)",
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
        pages=args.pages,
        verbose=args.verbose,
    )
    edu.run()


if __name__ == "__main__":
    main()
