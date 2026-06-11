/* ============================================================
   EduHub — Universal Certificate Generator
   _Shared_Core/certificate.js  |  v1.0  |  2026-06-12

   Usage:
     EduCert.generate({
       name:        'Əli Həsənov',       // student / teacher name
       platform:    'P001',              // P001–P005
       achievement: 'DİM Test Modulu 3', // lesson/test title
       score:       24,                  // correct answers
       total:       30,                  // total questions
       percent:     80,                  // 0–100
       lang:        'az',               // 'az' | 'ru' | 'en'
       date:        '12.06.2026',        // optional, auto if omitted
     });
   ============================================================ */

const EduCert = (() => {

  const PLATFORMS = {
    P001: { name:{az:'DİM Test Platforması',      ru:'Платформа DİM',          en:'DİM Test Platform'},
            color:'#3b82f6', grad:'135deg,#3b82f6,#1d4ed8', icon:'∑' },
    P002: { name:{az:'İnteraktiv Dərslik',        ru:'Интерактивный учебник',  en:'Interactive Textbook'},
            color:'#10b981', grad:'135deg,#10b981,#047857', icon:'📖' },
    P003: { name:{az:'Blok İmtahan Platforması',  ru:'Блоковый экзамен',       en:'Block Exam Platform'},
            color:'#8b5cf6', grad:'135deg,#8b5cf6,#6d28d9', icon:'🎓' },
    P004: { name:{az:'TAİM 2026',                 ru:'TAİM 2026',              en:'TAİM 2026'},
            color:'#f97316', grad:'135deg,#f97316,#c2410c', icon:'🏫' },
    P005: { name:{az:'EduHub',                    ru:'EduHub',                 en:'EduHub'},
            color:'#6366f1', grad:'135deg,#6366f1,#4338ca', icon:'⚡' },
  };

  const T = {
    az: {
      certTitle:   'SERTIFIKAT',
      certSub:     'Bu sertifikat təqdim edilir',
      achLabel:    'Uğurla tamamlandı',
      scoreLabel:  'Nəticə',
      dateLabel:   'Tarix',
      issuer:      'IEN — Interactive Education Network',
      congrats:    'Təbriklər!',
      passMsg:     'Uğurla keçdiniz',
      failMsg:     'İştirak etdiniz',
      printBtn:    '🖨️ Çap et',
      closeBtn:    '✕ Bağla',
      outOf:       '-dən',
    },
    ru: {
      certTitle:   'СЕРТИФИКАТ',
      certSub:     'Настоящим удостоверяется',
      achLabel:    'Успешно пройдено',
      scoreLabel:  'Результат',
      dateLabel:   'Дата',
      issuer:      'IEN — Interactive Education Network',
      congrats:    'Поздравляем!',
      passMsg:     'Успешно сдали',
      failMsg:     'Приняли участие',
      printBtn:    '🖨️ Печать',
      closeBtn:    '✕ Закрыть',
      outOf:       'из',
    },
    en: {
      certTitle:   'CERTIFICATE',
      certSub:     'This is to certify that',
      achLabel:    'Successfully Completed',
      scoreLabel:  'Score',
      dateLabel:   'Date',
      issuer:      'IEN — Interactive Education Network',
      congrats:    'Congratulations!',
      passMsg:     'Passed',
      failMsg:     'Participated',
      printBtn:    '🖨️ Print',
      closeBtn:    '✕ Close',
      outOf:       'out of',
    },
  };

  function formatDate(d) {
    if (d) return d;
    const now = new Date();
    return `${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()}`;
  }

  function generate(cfg) {
    const lang    = cfg.lang || 'az';
    const t       = T[lang] || T.az;
    const pid     = (cfg.platform || 'P001').toUpperCase();
    const pInfo   = PLATFORMS[pid] || PLATFORMS.P001;
    const pName   = pInfo.name[lang] || pInfo.name.az;
    const percent = cfg.percent ?? Math.round((cfg.score / cfg.total) * 100);
    const passed  = percent >= 60;
    const date    = formatDate(cfg.date);
    const uid     = Math.random().toString(36).slice(2,8).toUpperCase();

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${t.certTitle} — ${cfg.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    font-family:'Inter',sans-serif;
    background:#f0f4f8;
    min-height:100vh;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:2rem 1rem;
  }

  /* ── Toolbar ── */
  .toolbar {
    display:flex; gap:1rem; margin-bottom:1.5rem;
    background:#fff; padding:.75rem 1.5rem; border-radius:12px;
    box-shadow:0 2px 12px rgba(0,0,0,.08);
  }
  .toolbar button {
    padding:.5rem 1.25rem; border-radius:8px; border:none;
    font-size:.85rem; font-weight:700; cursor:pointer;
    font-family:inherit; transition:all .15s;
  }
  .btn-print { background:${pInfo.color}; color:#fff; }
  .btn-print:hover { opacity:.85; }
  .btn-close { background:#f1f5f9; color:#475569; }
  .btn-close:hover { background:#e2e8f0; }

  /* ── Certificate page (A4 landscape) ── */
  .cert {
    width:297mm; max-width:100%;
    background:#fff;
    border-radius:16px;
    box-shadow:0 8px 40px rgba(0,0,0,.12);
    position:relative;
    overflow:hidden;
  }

  /* Top accent bar */
  .cert-bar {
    height:8px;
    background:linear-gradient(${pInfo.grad});
  }

  /* Corner ornaments */
  .cert-corner {
    position:absolute; width:120px; height:120px;
    border:3px solid ${pInfo.color}22;
  }
  .cert-corner.tl { top:16px; left:16px; border-right:none; border-bottom:none; border-radius:8px 0 0 0; }
  .cert-corner.tr { top:16px; right:16px; border-left:none; border-bottom:none; border-radius:0 8px 0 0; }
  .cert-corner.bl { bottom:16px; left:16px; border-right:none; border-top:none; border-radius:0 0 0 8px; }
  .cert-corner.br { bottom:16px; right:16px; border-left:none; border-top:none; border-radius:0 0 8px 0; }

  /* Body */
  .cert-body {
    padding:2.5rem 3.5rem;
    display:flex; flex-direction:column; align-items:center; text-align:center;
    gap:1.25rem;
    position:relative; z-index:1;
  }

  /* Platform badge */
  .platform-badge {
    display:inline-flex; align-items:center; gap:.6rem;
    padding:.4rem 1.1rem; border-radius:9999px;
    background:linear-gradient(${pInfo.grad});
    color:#fff; font-size:.78rem; font-weight:800; letter-spacing:.06em;
    text-transform:uppercase;
  }
  .platform-icon {
    width:2rem; height:2rem; border-radius:8px;
    background:rgba(255,255,255,.2);
    display:flex; align-items:center; justify-content:center;
    font-size:1rem;
  }

  /* IEN logo */
  .ien-logo {
    display:flex; align-items:center; gap:.5rem;
    color:#64748b; font-size:.72rem; font-weight:700; letter-spacing:.08em;
  }
  .ien-badge {
    width:1.8rem; height:1.8rem; border-radius:6px;
    background:linear-gradient(135deg,#10b981,#6366f1);
    color:#fff; font-size:.65rem; font-weight:900;
    display:flex; align-items:center; justify-content:center;
  }

  /* Title */
  .cert-title {
    font-family:'Playfair Display',serif;
    font-size:2.8rem; font-weight:900; letter-spacing:.15em;
    color:#0f172a;
    text-transform:uppercase;
    position:relative;
  }
  .cert-title::after {
    content:''; display:block;
    width:60px; height:3px; margin:.5rem auto 0;
    background:linear-gradient(${pInfo.grad});
    border-radius:9999px;
  }

  .cert-sub {
    font-size:.85rem; color:#64748b; font-weight:500; letter-spacing:.02em;
  }

  /* Name */
  .cert-name {
    font-family:'Playfair Display',serif;
    font-size:2.4rem; font-weight:700;
    color:${pInfo.color};
    padding:.25rem 2rem;
    border-bottom:2px solid ${pInfo.color}33;
    min-width:300px;
  }

  /* Achievement */
  .cert-ach-label {
    font-size:.7rem; font-weight:800; text-transform:uppercase;
    letter-spacing:.1em; color:#94a3b8;
  }
  .cert-ach {
    font-size:1.1rem; font-weight:700; color:#1e293b;
    max-width:500px; line-height:1.4;
  }

  /* Score row */
  .score-row {
    display:flex; align-items:center; gap:2rem;
  }
  .score-circle {
    width:90px; height:90px; border-radius:50%;
    background:linear-gradient(${pInfo.grad});
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    color:#fff;
    box-shadow:0 4px 16px ${pInfo.color}44;
  }
  .score-pct  { font-size:1.5rem; font-weight:900; line-height:1; }
  .score-lbl  { font-size:.55rem; font-weight:700; letter-spacing:.06em; opacity:.85; }
  .score-detail {
    display:flex; flex-direction:column; align-items:flex-start; gap:.3rem;
  }
  .score-frac {
    font-size:1.6rem; font-weight:900; color:#0f172a;
  }
  .score-frac span { font-size:1rem; color:#94a3b8; font-weight:500; }
  .pass-badge {
    display:inline-flex; align-items:center; gap:.4rem;
    padding:.25rem .75rem; border-radius:9999px;
    font-size:.72rem; font-weight:800;
    ${passed
      ? `background:#d1fae5;color:#065f46;`
      : `background:#fef3c7;color:#92400e;`}
  }

  /* Footer */
  .cert-footer {
    width:100%; display:flex; align-items:flex-end;
    justify-content:space-between; padding-top:1rem;
    border-top:1px solid #f1f5f9;
  }
  .sig-line {
    display:flex; flex-direction:column; align-items:center; gap:.35rem;
  }
  .sig-blank {
    width:140px; height:1px; background:#cbd5e1;
  }
  .sig-name { font-size:.68rem; font-weight:700; color:#64748b; letter-spacing:.04em; }
  .sig-role { font-size:.6rem; color:#94a3b8; }
  .cert-id {
    font-size:.6rem; color:#cbd5e1; font-family:monospace; letter-spacing:.08em;
  }
  .date-block {
    display:flex; flex-direction:column; align-items:center; gap:.35rem;
  }
  .date-val  { font-size:.9rem; font-weight:800; color:#1e293b; }
  .date-lbl  { font-size:.6rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.07em; }

  /* Bottom bar */
  .cert-bar-bottom {
    height:5px;
    background:linear-gradient(${pInfo.grad});
    opacity:.4;
  }

  /* ── Print ── */
  @media print {
    body { background:#fff; padding:0; justify-content:flex-start; }
    .toolbar { display:none; }
    .cert { box-shadow:none; border-radius:0; width:100%; }
    @page { margin:0; size:A4 landscape; }
  }
</style>
</head>
<body>

<div class="toolbar">
  <button class="btn-print" onclick="window.print()">${t.printBtn}</button>
  <button class="btn-close" onclick="window.close()">${t.closeBtn}</button>
</div>

<div class="cert">
  <div class="cert-bar"></div>

  <!-- Corner ornaments -->
  <div class="cert-corner tl"></div>
  <div class="cert-corner tr"></div>
  <div class="cert-corner bl"></div>
  <div class="cert-corner br"></div>

  <div class="cert-body">

    <!-- Header: logo + platform badge -->
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
      <div class="ien-logo">
        <div class="ien-badge">IEN</div>
        <span>Interactive Education Network</span>
      </div>
      <div class="platform-badge">
        <div class="platform-icon">${pInfo.icon}</div>
        ${pName}
      </div>
    </div>

    <!-- Title -->
    <div>
      <div class="cert-title">${t.certTitle}</div>
    </div>

    <!-- Sub -->
    <p class="cert-sub">${t.certSub}</p>

    <!-- Name -->
    <div class="cert-name">${cfg.name || '—'}</div>

    <!-- Achievement -->
    <div>
      <p class="cert-ach-label">${t.achLabel}</p>
      <p class="cert-ach">${cfg.achievement || pName}</p>
    </div>

    <!-- Score -->
    <div class="score-row">
      <div class="score-circle">
        <span class="score-pct">${percent}%</span>
        <span class="score-lbl">${t.scoreLabel}</span>
      </div>
      <div class="score-detail">
        <div class="score-frac">
          ${cfg.score ?? '—'} <span>/ ${cfg.total ?? '—'}</span>
        </div>
        <div class="pass-badge">
          ${passed ? '✓' : '○'} ${passed ? t.passMsg : t.failMsg}
        </div>
      </div>
    </div>

    <!-- Footer: signatures + date + ID -->
    <div class="cert-footer">
      <div class="sig-line">
        <div class="sig-blank"></div>
        <div class="sig-name">IEN Platform</div>
        <div class="sig-role">${t.issuer}</div>
      </div>
      <div style="text-align:center">
        <div class="cert-id">ID: IEN-${pid}-${uid}</div>
      </div>
      <div class="date-block">
        <div class="date-val">${date}</div>
        <div class="date-lbl">${t.dateLabel}</div>
      </div>
    </div>

  </div>

  <div class="cert-bar-bottom"></div>
</div>

</body>
</html>`;

    const win = window.open('', '_blank', 'width=1100,height=750');
    if (!win) { alert('Popup blocked. Allow popups for certificate generation.'); return; }
    win.document.write(html);
    win.document.close();
  }

  return { generate };

})();

// Global shorthand
window.EduCert = EduCert;
