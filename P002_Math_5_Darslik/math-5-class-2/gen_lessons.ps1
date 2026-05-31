# Helper to generate a complete lesson HTML file
param()

function Get-LessonCSS {
    return @'
      :root {
        --bg-dark: #0f0f1a;
        --bg-card: rgba(255, 255, 255, 0.05);
        --bg-glass: rgba(255, 255, 255, 0.08);
        --border-glass: rgba(255, 255, 255, 0.15);
        --text-primary: #e8e8f0;
        --text-secondary: #a0a0b8;
        --accent: #00d4aa;
        --accent-dim: rgba(0, 212, 170, 0.2);
        --accent-warm: #ff6b6b;
        --accent-warm-dim: rgba(255, 107, 107, 0.2);
        --accent-blue: #4dabf7;
        --accent-blue-dim: rgba(77, 171, 247, 0.2);
        --success: #51cf66;
        --error: #ff6b6b;
        --warning: #fcc419;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; background: var(--bg-dark); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; line-height: 1.6; }
      .bg-animation { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: radial-gradient(ellipse at 20% 20%, rgba(0,212,170,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(77,171,247,0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255,107,107,0.05) 0%, transparent 60%); }
      .bg-animation::before { content: ""; position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background: repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px); animation: bgMove 20s linear infinite; }
      @keyframes bgMove { 0% { transform: translateY(0); } 100% { transform: translateY(40px); } }
      nav { position: fixed; top: 0; left: 0; right: 0; background: rgba(15,15,26,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-glass); z-index: 1000; padding: 0 20px; }
      .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; height: 60px; }
      .logo { font-size: 1.3rem; font-weight: 700; background: linear-gradient(135deg, var(--accent), var(--accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .nav-links { display: flex; gap: 8px; list-style: none; }
      .nav-links a { color: var(--text-secondary); text-decoration: none; padding: 8px 16px; border-radius: 8px; transition: all 0.3s; font-size: 0.9rem; font-weight: 500; cursor: pointer; border: none; background: transparent; }
      .nav-links a:hover, .nav-links a.active { color: var(--text-primary); background: var(--bg-glass); }
      .nav-links a.active { background: var(--accent-dim); color: var(--accent); }
      section { display: none; opacity: 0; padding: 100px 20px 60px; max-width: 1000px; margin: 0 auto; transition: opacity 0.3s ease; }
      section.active { display: block; opacity: 1; animation: fadeIn 0.5s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .card { background: var(--bg-card); backdrop-filter: blur(20px); border: 1px solid var(--border-glass); border-radius: 20px; padding: 32px; margin-bottom: 24px; transition: transform 0.3s, box-shadow 0.3s; }
      .card:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
      .card-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
      .card-title .icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
      .hero { text-align: center; padding: 140px 20px 80px; }
      .hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 20px; background: linear-gradient(135deg, var(--accent), var(--accent-blue), var(--accent-warm)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; }
      .hero p { font-size: 1.2rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 40px; }
      .btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 12px; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; text-decoration: none; }
      .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent-blue)); color: #000; }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px var(--accent-dim); }
      .btn-secondary { background: var(--bg-glass); color: var(--text-primary); border: 1px solid var(--border-glass); }
      .btn-secondary:hover { background: var(--bg-card); }
      .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
      .generate-widget { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 20px; padding: 24px; width: 100%; }
      .widget-viewport { width: 100%; }
      .widget-track { width: 100%; }
      .widget-slide { display: none; padding: 12px 16px; animation: slideFade 0.3s ease; }
      .widget-slide.active { display: block; }
      @keyframes slideFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      .widget-slide h3 { font-size: 1.3rem; color: var(--accent); margin-bottom: 16px; }
      .widget-slide p, .widget-slide li { color: var(--text-secondary); line-height: 1.8; margin-bottom: 12px; }
      .widget-slide .big-math { font-size: 1.6rem; text-align: center; margin: 20px 0; background: var(--bg-glass); padding: 20px; border-radius: 12px; font-weight: 600; color: var(--text-primary); }
      .widget-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
      .widget-progress { text-align: center; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px; }
      .sequence-component { display: flex; flex-direction: column; gap: 20px; position: relative; }
      .sequence-step { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 16px; padding: 24px 24px 24px 72px; position: relative; transition: all 0.3s; }
      .sequence-step:hover { border-color: var(--accent); transform: translateX(4px); }
      .sequence-number { position: absolute; left: 20px; top: 20px; width: 40px; height: 40px; background: var(--accent); color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }
      .sequence-step h4 { color: var(--text-primary); margin-bottom: 8px; font-size: 1.1rem; }
      .sequence-step p { color: var(--text-secondary); line-height: 1.7; }
      .sequence-connector { position: absolute; left: 39px; top: 60px; bottom: -30px; width: 2px; background: var(--accent-dim); z-index: 0; }
      .sequence-step:last-child .sequence-connector { display: none; }
      .formula-box { background: var(--bg-glass); border: 1px solid var(--border-glass); border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center; font-size: 1.2rem; }
      .tip-box { background: var(--accent-blue-dim); border-left: 4px solid var(--accent-blue); padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 16px 0; }
      .tip-box::before { content: "💡 "; }
      .warning-box { background: var(--accent-warm-dim); border-left: 4px solid var(--accent-warm); padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 16px 0; }
      .warning-box::before { content: "⚠️ "; }
      .highlight { background: var(--accent-dim); padding: 2px 6px; border-radius: 4px; color: var(--accent); font-weight: 600; }
      .problem-card { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
      .problem-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .problem-number { background: var(--accent-dim); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
      .problem-type { color: var(--text-secondary); font-size: 0.85rem; }
      .problem-text { font-size: 1.1rem; margin-bottom: 16px; line-height: 1.8; }
      .solution-btn { background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
      .solution-btn:hover { background: var(--accent); color: #000; }
      .solution { display: none; margin-top: 20px; padding: 20px; background: rgba(0,212,170,0.05); border-left: 3px solid var(--accent); border-radius: 0 12px 12px 0; }
      .solution.active { display: block; animation: slideDown 0.3s ease; }
      @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 1000px; } }
      .solution-step { margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid var(--border-glass); }
      .solution-step:last-child { border-bottom: none; }
      .step-num { display: inline-block; width: 24px; height: 24px; background: var(--accent); color: #000; border-radius: 50%; text-align: center; line-height: 24px; font-size: 0.8rem; font-weight: 700; margin-right: 8px; }
      .quiz-container { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 20px; padding: 32px; }
      .quiz-progress { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 8px; }
      .progress-bar { flex: 1; height: 8px; background: var(--bg-glass); border-radius: 4px; margin: 0 16px; overflow: hidden; min-width: 100px; }
      .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-blue)); border-radius: 4px; transition: width 0.5s ease; width: 0%; }
      .quiz-question { font-size: 1.2rem; margin-bottom: 24px; padding: 20px; background: var(--bg-glass); border-radius: 12px; border-left: 4px solid var(--accent); }
      .quiz-options { display: grid; gap: 12px; }
      .quiz-option { background: var(--bg-glass); border: 2px solid var(--border-glass); border-radius: 12px; padding: 16px 20px; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 12px; }
      .quiz-option:hover { border-color: var(--accent); background: var(--accent-dim); }
      .quiz-option.correct { border-color: var(--success); background: rgba(81,207,102,0.15); }
      .quiz-option.wrong { border-color: var(--error); background: rgba(255,107,107,0.15); }
      .quiz-option.disabled { pointer-events: none; opacity: 0.7; }
      .option-letter { width: 32px; height: 32px; border-radius: 8px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
      .quiz-nav { display: flex; justify-content: space-between; margin-top: 24px; }
      .stat { background: var(--bg-glass); padding: 12px 24px; border-radius: 12px; text-align: center; min-width: 100px; border: 1px solid var(--border-glass); }
      .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
      .stat-label { font-size: 0.85rem; color: var(--text-secondary); }
      .timer { position: fixed; top: 80px; right: 20px; background: var(--bg-card); backdrop-filter: blur(20px); border: 1px solid var(--border-glass); border-radius: 16px; padding: 16px 24px; font-size: 1.3rem; font-weight: 700; z-index: 999; }
      .timer.warning { border-color: var(--warning); color: var(--warning); }
      .timer.danger { border-color: var(--error); color: var(--error); animation: pulse 0.5s infinite; }
      @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      .results-container { text-align: center; padding: 40px; }
      .score-circle { width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(var(--accent) calc(var(--score) * 3.6deg), var(--bg-glass) 0); margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; position: relative; }
      .score-circle::before { content: ""; position: absolute; width: 170px; height: 170px; background: var(--bg-dark); border-radius: 50%; }
      .score-value { position: relative; font-size: 3rem; font-weight: 800; color: var(--accent); }
      .score-label { font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 8px; }
      .score-message { font-size: 1.5rem; font-weight: 700; margin-bottom: 32px; }
      .results-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; max-width: 600px; margin: 0 auto 32px; }
      .breakdown-item { background: var(--bg-glass); padding: 16px; border-radius: 12px; }
      .breakdown-value { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
      .breakdown-label { font-size: 0.85rem; color: var(--text-secondary); }
      .hidden { display: none !important; }
      @media (max-width: 768px) { .hero h1 { font-size: 2rem; } .nav-links { display: none; } section { padding: 70px 12px 24px; } }
'@
}

Write-Host "CSS function defined"
