# TAİM TEST BANK 2026 — Project Context

## Project
Interactive MIQ (teacher certification) test platform for Azerbaijani educators.
Authors: Ferid Hesenov, Aysel Balasova, Sola Mustafayeva.
Source PDF: `Folder/TAİM TEST BANK 2026.pdf` (312 pages, image-based/scanned, NOT in git — too large).

## QA Pipeline Rule
**One test per iteration.** After verifying each test, wait for user "Подтверждаю" before proceeding.
End every response with: "Ожидаю твоего подтверждения для перехода к следующему тесту по списку index.html."
**After each test: commit + push to GitHub.**

## File Structure
- `index.html` — Main platform (47 lessons, LESSONS[] array, SECTIONS[]). Direct `<a href>` navigation to tests — no modal/iframe.
- `engine.js` — **Unified test engine v4** (obfuscated). Loaded by all test HTML files.
- `style.css` — **Unified stylesheet**. Loaded by all test HTML files.
- `protect.js` — **Security layer** (obfuscated). Blocks F12/Ctrl+U/S/P/Shift+I/J/C/K, right-click, drag. Loaded by engine.js in tests only (NOT in index.html).
- `sw.js` — Service Worker. Current cache: `taim-v6`. Caches all 47 tests + assets for PWA/offline.
- `manifest.json` — PWA manifest. App name: "TAİM Test Bank 2026", theme: #1e3c72.
- `icons/icon-192.png`, `icons/icon-512.png` — PWA icons.
- `convert.js` — Batch converter (Node.js). Reads original test HTML files, normalises 7 source formats into unified `var CONFIG = {...}` structure.
- `rekey.js` — Answer encryptor (Node.js). Strips `correct` field, writes `_k` (XOR base64 encrypted answers) into CONFIG.
- `test-1.html` → `test-38.html` — Individual test files (all converted + encrypted).
- `test-fs1.html` → `test-fs6.html` — Fəsil sınaqları (all converted + encrypted).
- `test-us1.html` → `test-us3.html` — Ümumi sınaqlar (all converted + encrypted).
- `Folder/taim_test_bank_2026.json` — OCR-extracted answer keys (unreliable for compressed tables).
- `Folder/Images/page_001.png..page_312.png` — PDF pages as PNG (NOT in git).

## Architecture — Unified Engine

All 47 test HTML files share the same structure:
```html
<div id="app"></div>
<script>
var CONFIG = {
  topicAz: "...", topicRu: "...",
  sectionAz: "...", sectionRu: "...",
  totalTimeMin: 45,
  backLink: "index.html",
  _k: "base64encodedEncryptedAnswers",
  questions: [
    { text: {az:"...", ru:"..."}, options: {az:["A)...","B)...",...], ru:[...]}, explanation: {az:"...", ru:"..."} },
    ...
  ]
};
</script>
<script src="style.css">  <!-- linked in <head> -->
<script src="engine.js"></script>
```

**Critical:** Must use `var CONFIG` (not `const`) so `window.CONFIG` is accessible from engine.js.

### Answer Encryption
- `correct` field is **absent** from all question objects in HTML source.
- Correct answers are stored in `CONFIG._k`: base64-encoded XOR cipher.
- Encryption: `byte[i] = (correct_0indexed + 65) XOR KEY[i%8] XOR (i & 0xFF)`
- KEY: `[0x4A, 0x1F, 0x63, 0x2B, 0x77, 0x0E, 0x55, 0x3C]`
- Decryption (in engine.js, obfuscated):
  ```js
  const _ca = C._k ? atob(C._k).split('').map((c,i) =>
    (c.charCodeAt(0) ^ KEY[i%8] ^ (i&0xFF)) - 65
  ) : qs.map(q => q.correct || 0);
  ```

### engine.js Features (v4)
- Bilingual AZ/RU language switch
- Timer with urgent animation
- Auto-save progress to localStorage (key: `taim_<topicAz>`, 24h expiry, resume prompt)
- Pass/fail badge at 70% threshold
- Name input on start screen (captured for certificate)
- Certificate: opens printable window (`window.open`) with auto-print, shown only on pass ≥70%
- Results saved to `taim_history` localStorage array (max 200 entries) for teacher analytics
- Question navigation grid
- Review mode (show correct/wrong after finishing)

### PWA
- Install prompt on Android, iOS, Desktop via `manifest.json` + `sw.js`
- `sw.js` uses `skipWaiting()` + `clients.claim()` for instant activation
- Cache version must be bumped (taim-v1 → v2 → ...) whenever any file changes, to force cache refresh on all clients. Current: `taim-v6`.

### Security
- `protect.js` loaded only in tests (via engine.js), NOT in index.html
- Blocks: F12, Ctrl+U/S/P, Ctrl+Shift+I/J/C/K, right-click, drag
- Does NOT use window-size DevTools detection (was removed — caused false positives on load)
- Correct answers encrypted in `_k`; `engine.js` obfuscated via `javascript-obfuscator v5`
- GitHub repo is **private**

## index.html Details
- LESSONS array: 47 entries (ids 1–49, ids 21 and 22 removed)
- `SECTIONS.after = [0,1,17,19,20,33,35,44]`
- Card click / "Başla" button → plain `<a href="lesson.file">` — direct navigation, no JS, no modal
- Teacher panel password: `Test2026` (stored in localStorage `testbank2026_teacher_pass`)
- Teacher panel features: star ratings per lesson (0=locked, 1–3=done), unlock all, reset all, change password, test history (reads `taim_history`)
- No `protect.js` in index.html (nothing to protect there)

## index.html Lesson Mapping (47 total — 2.2.2 and 2.2.3 removed)
| id | num | file | Topic |
|----|-----|------|-------|
| 1 | 1.1.1–1.1.4 | test-1.html | I BÖLMƏ: Hüquqi savadlılıq |
| 2 | 2.1.1 | test-2.html | İnteqrasiya |
| 3 | 2.1.2 | test-3.html | XXI əsrin kompetensiyaları |
| 4 | 2.1.3 | test-4.html | Təfəkkürün növləri |
| 5 | 2.1.4 | test-5.html | Metakognitiv bacarıqlar |
| 6 | 2.1.5 | test-6.html | Bilik və fəaliyyət növləri |
| 7 | 2.1.6 | test-7.html | Blumun idrak taksonomiyası |
| 8 | 2.1.7 | test-8.html | Webb Dərin bilik səviyyələri |
| 9 | 2.1.8 | test-9.html | Tədrisin forma və modelləri |
| 10 | 2.1.9 | test-10.html | Tədrisin strategiya və texnikaları |
| 11 | 2.1.10 | test-11.html | İllik və gündəlik planlaşdırma |
| 12 | 2.1.11 | test-12.html | Şagirdyönümlü (interaktiv) təlim |
| 13 | 2.1.12 | test-13.html | Müəllimin fasilitasiya bacarığı |
| 14 | 2.1.13 | test-14.html | Fərdiləşdirilmiş təlim |
| 15 | 2.1.14 | test-15.html | Öyrənmə tərzi |
| 16 | 2.1.15 | test-16.html | Rəqəmsal vasitələr və süni intellekt |
| 17 | 2.1.16 | test-17.html | Dizayn düşüncəsi |
| 18 | FS1 | test-fs1.html | Fəsil sınağı 1 |
| 19 | FS2 | test-fs2.html | Fəsil sınağı 2 |
| 20 | 2.2.1 | test-18.html | Qiymətləndirmənin növləri |
| 23 | 3.1.1 | test-19.html | Müasir pedaqoji yanaşmalar |
| 24 | 3.1.2 | test-20.html | Şəxsiyyətin formalaşması |
| 25 | 3.1.3 | test-21.html | H.Qardner: Çoxnövlü zəka |
| 26 | 3.1.4 | test-22.html | J.Piaje: Zehni inkişaf |
| 27 | 3.1.5 | test-23.html | L.Viqotski: Yaxın inkişaf zonası |
| 28 | 3.1.6 | test-24.html | K.Dvek: Düşüncə tərzi |
| 29 | 3.1.7 | test-25.html | L.Kolberq: Mənəvi inkişaf |
| 30 | 3.1.8 | test-26.html | R.Qanye: Öyrənmənin şərtləri |
| 31 | 3.1.9 | test-27.html | D.Qoulman: Emosional zəka |
| 32 | 3.1.10 | test-28.html | K.Yunq: Psixoloji tiplər |
| 33 | 3.1.11 | test-29.html | A.Bandura: Sosial öyrənmə |
| 34 | 3.1.12 | test-30.html | J.Bruner: Koqnitiv öyrənmə |
| 35 | 3.1.13 | test-31.html | K.Rocers: Şəxsiyyətyönümlü yanaşma |
| 36 | FS3 | test-fs3.html | Fəsil sınağı 3 |
| 37 | FS4 | test-fs4.html | Fəsil sınağı 4 |
| 38 | 3.2.1 | test-32.html | Sosial-emosional öyrənmə (CASEL) |
| 39 | 3.2.2 | test-33.html | Səmərəli öyrənmə mühiti |
| 40 | 3.2.3 | test-34.html | Pozitiv intizam |
| 41 | 3.2.4 | test-35.html | Sinfin idarəedilməsi |
| 42 | 3.2.5 | test-36.html | Müəllim-şagird münasibətləri |
| 43 | 3.2.6 | test-37.html | Şagird davranışının idarəolunması |
| 44 | 3.2.7 | test-38.html | Qısnama (bullinq) |
| 45 | FS5 | test-fs5.html | Fəsil sınağı 5 |
| 46 | FS6 | test-fs6.html | Fəsil sınağı 6 |
| 47 | ÜS1 | test-us1.html | Ümumi sınaq 1 |
| 48 | ÜS2 | test-us2.html | Ümumi sınaq 2 |
| 49 | ÜS3 | test-us3.html | Ümumi sınaq 3 |

## QA Status — All 47 Tests Verified ✅
| Test | File | Status | Notes |
|------|------|--------|-------|
| 1 — 1.1.1-1.1.4 | test-1.html | ✅ | 30Q, 45min |
| 2 — 2.1.1 | test-2.html | ✅ | 44Q, by subject, 60min |
| 3 — 2.1.2 | test-3.html | ✅ | 30Q, 45min |
| 4 — 2.1.3 | test-4.html | ✅ | 60Q, 90min |
| 5 — 2.1.4 | test-5.html | ✅ | 30Q, 45min |
| 6 — 2.1.5 | test-6.html | ✅ | 40Q, 60min |
| 7 — 2.1.6 | test-7.html | ✅ | 40Q, 60min |
| 8 — 2.1.7 | test-8.html | ✅ | 35Q, 55min |
| 9 — 2.1.8 | test-9.html | ✅ | 55Q, 80min |
| 10 — 2.1.9 | test-10.html | ✅ | 65Q, 90min |
| 11 — 2.1.10 | test-11.html | ✅ | 40Q, 60min |
| 12 — 2.1.11 | test-12.html | ✅ | 40Q, 60min |
| 13 — 2.1.12 | test-13.html | ✅ | 20Q, 30min |
| 14 — 2.1.13 | test-14.html | ✅ | 50Q, 75min |
| 15 — 2.1.14 | test-15.html | ✅ | 20Q, 30min |
| 16 — 2.1.15 | test-16.html | ✅ | 20Q, 30min |
| 17 — 2.1.16 | test-17.html | ✅ | 25Q, 40min |
| 18 — FS1 | test-fs1.html | ✅ | 20Q, 30min |
| 19 — FS2 | test-fs2.html | ✅ | 20Q, 30min |
| 20 — 2.2.1 | test-18.html | ✅ | 160Q, 180min |
| 23 — 3.1.1 | test-19.html | ✅ | 40Q, 60min |
| 24 — 3.1.2 | test-20.html | ✅ | 20Q, 30min |
| 25 — 3.1.3 | test-21.html | ✅ | 55Q, 80min |
| 26 — 3.1.4 | test-22.html | ✅ | 45Q, 65min |
| 27 — 3.1.5 | test-23.html | ✅ | 35Q, 50min |
| 28 — 3.1.6 | test-24.html | ✅ | 35Q, 50min |
| 29 — 3.1.7 | test-25.html | ✅ | 40Q, 60min |
| 30 — 3.1.8 | test-26.html | ✅ | 30Q, 45min |
| 31 — 3.1.9 | test-27.html | ✅ | 40Q, 60min |
| 32 — 3.1.10 | test-28.html | ✅ | 30Q, 45min |
| 33 — 3.1.11 | test-29.html | ✅ | 20Q, 45min |
| 34 — 3.1.12 | test-30.html | ✅ | 30Q, 45min |
| 35 — 3.1.13 | test-31.html | ✅ | 35Q, 45min |
| 36 — FS3 | test-fs3.html | ✅ | 20Q, 45min |
| 37 — FS4 | test-fs4.html | ✅ | 20Q, 45min |
| 38 — 3.2.1 | test-32.html | ✅ | 20Q, 45min |
| 39 — 3.2.2 | test-33.html | ✅ | 20Q, 45min |
| 40 — 3.2.3 | test-34.html | ✅ | 20Q, 45min |
| 41 — 3.2.4 | test-35.html | ✅ | 50Q, 90min |
| 42 — 3.2.5 | test-36.html | ✅ | 25Q, 45min |
| 43 — 3.2.6 | test-37.html | ✅ | 25Q, 45min |
| 44 — 3.2.7 | test-38.html | ✅ | 30Q, 60min |
| 45 — FS5 | test-fs5.html | ✅ | 20Q, 30min |
| 46 — FS6 | test-fs6.html | ✅ | 20Q, 30min |
| 47 — ÜS1 | test-us1.html | ✅ | 20Q, 30min |
| 48 — ÜS2 | test-us2.html | ✅ | 20Q, 30min |
| 49 — ÜS3 | test-us3.html | ✅ | 20Q, 30min |

## Answer Keys (from JSON — OCR, use as reference only)
JSON path: `Folder/taim_test_bank_2026.json`
**WARNING:** OCR errors common in compressed table cells (D/B confusion, E/F confusion).
Always trust test file content + explanations over JSON when they disagree.

## Important Technical Details
- GitHub repo: https://github.com/mywork2000001-ops/Kurikulum.git — **PRIVATE**
- Git branch: `main`
- Large files excluded from git: PDF + `Folder/Images/` (see `.gitignore`)
- SW cache version: `taim-v6` — **bump this whenever any file changes**
- `var CONFIG` (not `const`) required in test HTML so `window.CONFIG` is reachable from engine.js
- `protect.js` must NOT be in `index.html` — only loaded by engine.js inside test files
- localStorage keys: `taim_<topicSlug>` (progress), `taim_history` (result log), `testbank2026_state` (stars), `testbank2026_teacher_pass` (password)
- To re-encrypt answers after changing test content: run `node rekey.js` from project root
- To re-obfuscate engine.js after editing: `npx javascript-obfuscator engine.js --output engine.js --compact true --string-array true --string-array-encoding base64 --string-array-rotate true --string-array-shuffle true --identifier-names-generator hexadecimal`

## Workflow Per Test (QA)
1. Read test file → extract all answer values
2. Compare with JSON key (reference only)
3. Read Q1 + last Q text for preview
4. Spot-check 5–8 questions via content logic
5. Report: status table + Q1 preview + Qlast preview
6. git add → git commit → git push
7. End: "Ожидаю твоего подтверждения..."
