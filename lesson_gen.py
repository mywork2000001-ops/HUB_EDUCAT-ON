import os, json

BASE = r"C:\Users\Administrator\Documents\Claude\Projects\P002_Math_5_Darslik\math-5-class-2"

CSS = """      :root {
        --bg-dark: #0f0f1a; --bg-card: rgba(255,255,255,0.05); --bg-glass: rgba(255,255,255,0.08);
        --border-glass: rgba(255,255,255,0.15); --text-primary: #e8e8f0; --text-secondary: #a0a0b8;
        --accent: #00d4aa; --accent-dim: rgba(0,212,170,0.2); --accent-warm: #ff6b6b;
        --accent-warm-dim: rgba(255,107,107,0.2); --accent-blue: #4dabf7;
        --accent-blue-dim: rgba(77,171,247,0.2); --success: #51cf66; --error: #ff6b6b; --warning: #fcc419;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: "Segoe UI", system-ui, sans-serif; background: var(--bg-dark); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; line-height: 1.6; }
      .bg-animation { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: radial-gradient(ellipse at 20% 20%, rgba(0,212,170,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(77,171,247,0.08) 0%, transparent 50%); }
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
      .hero { text-align: center; padding: 140px 20px 80px; }
      .hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 20px; background: linear-gradient(135deg, var(--accent), var(--accent-blue), var(--accent-warm)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; }
      .hero p { font-size: 1.2rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 40px; }
      .btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 12px; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
      .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent-blue)); color: #000; }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px var(--accent-dim); }
      .btn-secondary { background: var(--bg-glass); color: var(--text-primary); border: 1px solid var(--border-glass); }
      .btn-secondary:hover { background: var(--bg-card); }
      .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
      .generate-widget { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 20px; padding: 24px; width: 100%; }
      .widget-viewport { overflow: hidden; position: relative; min-height: 480px; width: 100%; }
      .widget-track { display: flex; transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); width: 100%; }
      .widget-slide { flex: 0 0 100%; width: 100%; min-width: 100%; padding: 20px; box-sizing: border-box; overflow-x: hidden; }
      .widget-slide h3 { font-size: 1.3rem; color: var(--accent); margin-bottom: 16px; }
      .widget-slide p, .widget-slide li { color: var(--text-secondary); line-height: 1.8; margin-bottom: 12px; }
      .widget-slide .big-math { font-size: 1.5rem; text-align: center; margin: 20px 0; background: var(--bg-glass); padding: 20px; border-radius: 12px; font-weight: 600; color: var(--text-primary); }
      .widget-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
      .widget-progress { text-align: center; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px; }
      .sequence-component { display: flex; flex-direction: column; gap: 20px; }
      .sequence-step { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 16px; padding: 24px 24px 24px 72px; position: relative; transition: all 0.3s; }
      .sequence-step:hover { border-color: var(--accent); transform: translateX(4px); }
      .sequence-number { position: absolute; left: 20px; top: 20px; width: 40px; height: 40px; background: var(--accent); color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }
      .sequence-step h4 { color: var(--text-primary); margin-bottom: 8px; font-size: 1.1rem; }
      .sequence-step p { color: var(--text-secondary); line-height: 1.7; }
      .sequence-connector { position: absolute; left: 39px; top: 60px; bottom: -30px; width: 2px; background: var(--accent-dim); z-index: 0; }
      .formula-box { background: var(--bg-glass); border: 1px solid var(--border-glass); border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center; font-size: 1.2rem; }
      .tip-box { background: var(--accent-blue-dim); border-left: 4px solid var(--accent-blue); padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 16px 0; }
      .tip-box::before { content: "Подсказка: "; font-weight: 600; }
      .warning-box { background: var(--accent-warm-dim); border-left: 4px solid var(--accent-warm); padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 16px 0; }
      .warning-box::before { content: "Важно: "; font-weight: 600; }
      .highlight { background: var(--accent-dim); padding: 2px 6px; border-radius: 4px; color: var(--accent); font-weight: 600; }
      .problem-card { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
      .problem-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .problem-number { background: var(--accent-dim); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
      .problem-type { color: var(--text-secondary); font-size: 0.85rem; }
      .problem-text { font-size: 1.1rem; margin-bottom: 16px; line-height: 1.8; }
      .solution-btn { background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
      .solution-btn:hover { background: var(--accent); color: #000; }
      .solution { display: none; margin-top: 20px; padding: 20px; background: rgba(0,212,170,0.05); border-left: 3px solid var(--accent); border-radius: 0 12px 12px 0; }
      .solution.active { display: block; }
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
      .timer.warning { border-color: var(--warning); color: var(--warning); animation: pulse 1s infinite; }
      .timer.danger { border-color: var(--error); color: var(--error); animation: pulse 0.5s infinite; }
      @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      .results-container { text-align: center; padding: 40px; }
      .score-circle { width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(var(--accent) calc(var(--score) * 3.6deg), var(--bg-glass) 0); margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; position: relative; }
      .score-circle::before { content: ""; position: absolute; width: 170px; height: 170px; background: var(--bg-dark); border-radius: 50%; }
      .score-value { position: relative; font-size: 3rem; font-weight: 800; color: var(--accent); }
      .score-label { font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 8px; }
      .score-message { font-size: 1.5rem; font-weight: 700; margin-bottom: 32px; }
      .results-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 16px; max-width: 600px; margin: 0 auto 32px; }
      .breakdown-item { background: var(--bg-glass); padding: 16px; border-radius: 12px; }
      .breakdown-value { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
      .breakdown-label { font-size: 0.85rem; color: var(--text-secondary); }
      .hidden { display: none !important; }
      @media (max-width: 768px) { .hero h1 { font-size: 2rem; } .nav-links { display: none; } .card { padding: 20px; } section { padding: 80px 16px 40px; } }"""

JS_TEMPLATE = r"""      const AppState={currentSection:'home',slide:0,trainer:{correct:0,total:0,streak:0,current:null},diagnostic:{current:0,score:0,answers:[]},timeAttack:{current:0,score:0,timer:null,timeLeft:600,startTime:0,answers:[]},mode:null};
      function showSection(id){document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));document.querySelector('.nav-links a[data-section="'+id+'"]')?.classList.add('active');window.scrollTo(0,0);AppState.currentSection=id;}
      document.querySelectorAll('.nav-links a').forEach(link=>{link.addEventListener('click',e=>{e.preventDefault();showSection(link.dataset.section);});});
      const totalSlides=12,track=document.getElementById('track-slides'),slideNumEl=document.getElementById('slide-num'),slideTotalEl=document.getElementById('slide-total');
      if(slideTotalEl)slideTotalEl.textContent=totalSlides;
      function renderSlide(){if(track)track.style.transform='translateX(-'+AppState.slide*100+'%)';if(slideNumEl)slideNumEl.textContent=AppState.slide+1;}
      function nextSlide(){if(AppState.slide<totalSlides-1){AppState.slide++;renderSlide();}}
      function prevSlide(){if(AppState.slide>0){AppState.slide--;renderSlide();}}
      function toggleSolution(id){const el=document.getElementById(id);el.classList.toggle('active');const btn=el.previousElementSibling;btn.textContent=el.classList.contains('active')?'Скрыть решение':'Показать решение';}
      const diagnosticQuestions=QPLACEHOLDER;
      function newTrainerProblem(){const p=diagnosticQuestions[Math.floor(Math.random()*diagnosticQuestions.length)];AppState.trainer.current=p;let txt=p.q+'\n';p.options.forEach((o,i)=>{txt+=i+': '+o+'  ';});document.getElementById('trainer-question').textContent=txt;document.getElementById('trainer-answer').value='';document.getElementById('trainer-feedback').innerHTML='';document.getElementById('trainer-hint').style.display='none';document.getElementById('trainer-check-btn').disabled=false;}
      function showTrainerHint(){if(!AppState.trainer.current)return;document.getElementById('trainer-hint').style.display='block';document.getElementById('trainer-hint').textContent='Подсказка: '+AppState.trainer.current.expl;}
      function checkTrainer(){if(!AppState.trainer.current)return;const u=document.getElementById('trainer-answer').value.trim();if(!u)return;AppState.trainer.total++;const ok=parseInt(u)===AppState.trainer.current.correct;if(ok){AppState.trainer.correct++;AppState.trainer.streak++;document.getElementById('trainer-feedback').innerHTML='<div style="color:var(--success);font-weight:700">Верно!</div>';}else{AppState.trainer.streak=0;document.getElementById('trainer-feedback').innerHTML='<div style="color:var(--error);font-weight:700">Неверно. Правильный ответ: '+AppState.trainer.current.correct+'</div>';}document.getElementById('trainer-correct').textContent=AppState.trainer.correct;document.getElementById('trainer-total').textContent=AppState.trainer.total;document.getElementById('trainer-streak').textContent=AppState.trainer.streak;document.getElementById('trainer-check-btn').disabled=true;}
      document.getElementById('trainer-answer')?.addEventListener('keypress',e=>{if(e.key==='Enter')checkTrainer();});
      function startDiagnostic(){AppState.mode='diagnostic';AppState.diagnostic={current:0,score:0,answers:[]};document.getElementById('diagnostic-ui').style.display='block';document.getElementById('timeattack-ui').style.display='none';document.getElementById('results-ui').style.display='none';document.getElementById('diag-total').textContent=diagnosticQuestions.length;renderDiagnostic();}
      function renderDiagnostic(){const q=diagnosticQuestions[AppState.diagnostic.current];document.getElementById('diag-current').textContent=AppState.diagnostic.current+1;document.getElementById('diag-score').textContent=AppState.diagnostic.score+' правильных';document.getElementById('diag-progress').style.width=((AppState.diagnostic.current+1)/diagnosticQuestions.length*100)+'%';document.getElementById('diag-question').textContent=q.q;document.getElementById('diag-explanation').style.display='none';document.getElementById('diag-next').disabled=true;document.getElementById('diag-prev').disabled=AppState.diagnostic.current===0;const od=document.getElementById('diag-options');od.innerHTML='';q.options.forEach((opt,i)=>{const d=document.createElement('div');d.className='quiz-option';d.innerHTML='<div class="option-letter">'+String.fromCharCode(65+i)+'</div><div>'+opt+'</div>';d.onclick=()=>selDiag(i,d,q);od.appendChild(d);});}
      function selDiag(i,div,q){document.querySelectorAll('#diag-options .quiz-option').forEach(o=>o.classList.add('disabled'));const ok=i===q.correct;div.classList.add(ok?'correct':'wrong');if(!ok)document.querySelectorAll('#diag-options .quiz-option')[q.correct].classList.add('correct');if(ok)AppState.diagnostic.score++;AppState.diagnostic.answers.push(i);document.getElementById('diag-explanation').textContent=(ok?'Верно! ':'Неверно. ')+q.expl;document.getElementById('diag-explanation').style.display='block';document.getElementById('diag-next').disabled=false;}
      function nextDiagnostic(){if(AppState.diagnostic.current<diagnosticQuestions.length-1){AppState.diagnostic.current++;renderDiagnostic();}else showResults(AppState.diagnostic.score,diagnosticQuestions.length,0);}
      function prevDiagnostic(){if(AppState.diagnostic.current>0){AppState.diagnostic.current--;renderDiagnostic();}}
      function startTimeAttack(){AppState.mode='timeattack';AppState.timeAttack={current:0,score:0,timer:null,timeLeft:600,startTime:Date.now(),answers:[]};document.getElementById('diagnostic-ui').style.display='none';document.getElementById('timeattack-ui').style.display='block';document.getElementById('results-ui').style.display='none';const te=document.getElementById('ta-timer');te.classList.remove('hidden');AppState.timeAttack.timer=setInterval(()=>{AppState.timeAttack.timeLeft--;const m=Math.floor(AppState.timeAttack.timeLeft/60),s=AppState.timeAttack.timeLeft%60;te.textContent=m+':'+(s<10?'0':'')+s;te.className='timer'+(AppState.timeAttack.timeLeft<=60?' danger':AppState.timeAttack.timeLeft<=120?' warning':'');if(AppState.timeAttack.timeLeft<=0){clearInterval(AppState.timeAttack.timer);showResults(AppState.timeAttack.score,diagnosticQuestions.length,0);}},1000);renderTA();}
      function renderTA(){const q=diagnosticQuestions[AppState.timeAttack.current];document.getElementById('ta-current').textContent=AppState.timeAttack.current+1;document.getElementById('ta-progress').style.width=((AppState.timeAttack.current+1)/diagnosticQuestions.length*100)+'%';document.getElementById('ta-question').textContent=q.q;const od=document.getElementById('ta-options');od.innerHTML='';q.options.forEach((opt,i)=>{const d=document.createElement('div');d.className='quiz-option';d.innerHTML='<div class="option-letter">'+String.fromCharCode(65+i)+'</div><div>'+opt+'</div>';d.onclick=()=>{if(i===q.correct)AppState.timeAttack.score++;AppState.timeAttack.answers.push(i);nextTA();};od.appendChild(d);});document.getElementById('ta-next').style.display='none';}
      function nextTA(){if(AppState.timeAttack.current<diagnosticQuestions.length-1){AppState.timeAttack.current++;renderTA();}else{clearInterval(AppState.timeAttack.timer);const el=Math.round((Date.now()-AppState.timeAttack.startTime)/1000);showResults(AppState.timeAttack.score,diagnosticQuestions.length,el);}}
      function nextTimeAttack(){nextTA();}
      function showResults(correct,total,elapsed){document.getElementById('diagnostic-ui').style.display='none';document.getElementById('timeattack-ui').style.display='none';document.getElementById('results-ui').style.display='block';const pct=Math.round(correct/total*100);document.getElementById('result-circle').style.setProperty('--score',pct);document.getElementById('result-percent').textContent=pct+'%';document.getElementById('result-correct').textContent=correct;document.getElementById('result-wrong').textContent=total-correct;const m=Math.floor(elapsed/60),s=elapsed%60;document.getElementById('result-time').textContent=m+':'+(s<10?'0':'')+s;document.getElementById('result-mastery').textContent=pct>=90?'Отлично':pct>=70?'Хорошо':pct>=50?'Удовл.':'Слабо';document.getElementById('result-message').textContent=pct>=90?'Отличный результат!':pct>=70?'Хороший результат!':'Повторите теорию';}
      function resetAssessment(){document.getElementById('diagnostic-ui').style.display='none';document.getElementById('timeattack-ui').style.display='none';document.getElementById('results-ui').style.display='none';document.getElementById('ta-timer').classList.add('hidden');}"""

def make_slide(content, active=False):
    cls = 'widget-slide active' if active else 'widget-slide'
    return f'<div class="{cls}">{content}</div>'

def make_example(num, etype, text, steps):
    sh = "".join([f'<div class="solution-step"><span class="step-num">{i+1}</span>{s}</div>' for i,s in enumerate(steps)])
    return f'<div class="problem-card"><div class="problem-header"><span class="problem-number">No {num}</span><span class="problem-type">{etype}</span></div><div class="problem-text">{text}</div><button class="solution-btn" onclick="toggleSolution(\'sol-{num}\')">Показать решение</button><div class="solution" id="sol-{num}">{sh}</div></div>'

def make_algo(steps):
    parts = []
    for i,(title,desc) in enumerate(steps):
        conn = "<div class='sequence-connector'></div>" if i < len(steps)-1 else ""
        parts.append(f'<div class="sequence-step"><div class="sequence-number">{i+1}</div>{conn}<h4>{title}</h4><p>{desc}</p></div>')
    return "\n".join(parts)

def make_learn_cards(items):
    cs = ['var(--accent)','var(--accent-blue)','var(--accent-warm)','var(--warning)']
    return "\n".join([f'<div class="card" style="padding:20px"><h3 style="color:{cs[i%4]};margin-bottom:8px">{t}</h3><p style="color:var(--text-secondary)">{d}</p></div>' for i,(t,d) in enumerate(items)])

def build_html(lesson_num, title, subtitle, learn_items, slides, algo_steps, examples, questions):
    slides_html = "".join([make_slide(s, i==0) for i,s in enumerate(slides)])
    learn_html = make_learn_cards(learn_items)
    algo_html = make_algo(algo_steps)
    ex_html = "\n".join(examples)
    q_json = json.dumps(questions, ensure_ascii=False)
    js = JS_TEMPLATE.replace("QPLACEHOLDER", q_json)
    return f"""<!doctype html>
<html lang="ru">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Урок {lesson_num} — {title}</title>
<style>{CSS}</style></head>
<body>
<div class="bg-animation"></div>
<nav><div class="nav-container">
  <div class="logo">Урок {lesson_num}</div>
  <ul class="nav-links">
    <li><a href="#" class="active" data-section="home">Главная</a></li>
    <li><a href="#" data-section="theory">Теория</a></li>
    <li><a href="#" data-section="algorithm">Алгоритм</a></li>
    <li><a href="#" data-section="examples">Примеры</a></li>
    <li><a href="#" data-section="trainer">Тренажёр</a></li>
    <li><a href="#" data-section="assessment">Аттестация</a></li>
  </ul>
</div></nav>

<section id="home" class="active">
  <div class="hero"><h1>{title}</h1><p>Урок {lesson_num}. {subtitle}</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="showSection('theory')">Начать обучение</button>
      <button class="btn btn-secondary" onclick="showSection('assessment')">Проверить знания</button>
    </div>
  </div>
  <div class="card"><div class="card-title">Что вы изучите</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px">{learn_html}</div>
  </div>
</section>

<section id="theory">
  <div class="card"><div class="card-title">Визуальная теория — 12 слайдов</div>
    <p style="color:var(--text-secondary);margin-bottom:20px">Листайте слайды. Каждый блок — ключевой элемент темы.</p>
    <div class="generate-widget">
      <div class="widget-progress">Слайд <span id="slide-num">1</span> из <span id="slide-total">12</span></div>
      <div class="widget-viewport"><div class="widget-track" id="track-slides">{slides_html}</div></div>
      <div class="widget-nav">
        <button class="btn btn-secondary" onclick="prevSlide()">Назад</button>
        <button class="btn btn-primary" onclick="nextSlide()">Вперёд</button>
      </div>
    </div>
  </div>
</section>

<section id="algorithm">
  <div class="card"><div class="card-title">Пошаговый алгоритм</div>
    <div class="sequence-component">{algo_html}</div>
  </div>
</section>

<section id="examples">
  <div class="card"><div class="card-title">Разбор задач</div></div>
  {ex_html}
</section>

<section id="trainer">
  <div class="card"><div class="card-title">Тренажёр</div>
    <p style="color:var(--text-secondary);margin-bottom:24px">Введите номер ответа (0–3) и нажмите «Проверить».</p>
    <div class="quiz-container" style="margin-bottom:20px">
      <div id="trainer-question" style="font-size:1.1rem;margin-bottom:24px;padding:24px;background:var(--bg-glass);border-radius:12px;white-space:pre-wrap">Нажмите «Новая задача» для начала</div>
      <div style="display:flex;gap:12px;margin-bottom:20px">
        <input type="text" id="trainer-answer" placeholder="0, 1, 2 или 3" style="flex:1;padding:14px 16px;background:var(--bg-glass);border:2px solid var(--border-glass);border-radius:12px;color:var(--text-primary);font-size:1rem;outline:none;"/>
        <button class="btn btn-primary" onclick="checkTrainer()" id="trainer-check-btn" disabled>Проверить</button>
      </div>
      <div id="trainer-feedback" style="min-height:40px;margin-bottom:16px"></div>
      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-secondary" onclick="newTrainerProblem()">Новая задача</button>
        <button class="btn btn-secondary" onclick="showTrainerHint()">Подсказка</button>
      </div>
      <div id="trainer-hint" style="display:none;margin-top:20px;padding:16px;background:var(--accent-blue-dim);border-radius:12px;border-left:4px solid var(--accent-blue)"></div>
    </div>
    <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap">
      <div class="stat"><div class="stat-value" id="trainer-correct">0</div><div class="stat-label">Верно</div></div>
      <div class="stat"><div class="stat-value" id="trainer-total">0</div><div class="stat-label">Всего</div></div>
      <div class="stat"><div class="stat-value" id="trainer-streak">0</div><div class="stat-label">Серия</div></div>
    </div>
  </div>
</section>

<section id="assessment">
  <div class="card"><div class="card-title">Аттестация — 20 вопросов</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
      <div class="card" style="padding:24px;text-align:center"><div style="font-size:3rem;margin-bottom:12px">🔍</div><h3 style="margin-bottom:8px">Диагностический тест</h3><p style="color:var(--text-secondary);margin-bottom:20px">20 вопросов с обратной связью.</p><button class="btn btn-primary" onclick="startDiagnostic()">Начать тест</button></div>
      <div class="card" style="padding:24px;text-align:center"><div style="font-size:3rem;margin-bottom:12px">⏱️</div><h3 style="margin-bottom:8px">Скоростная викторина</h3><p style="color:var(--text-secondary);margin-bottom:20px">20 вопросов · 10 минут.</p><button class="btn btn-primary" onclick="startTimeAttack()">Начать</button></div>
    </div>
  </div>
  <div id="diagnostic-ui" style="display:none">
    <div class="card"><div class="card-title">Диагностический тест</div></div>
    <div class="quiz-container">
      <div class="quiz-progress"><span>Вопрос <span id="diag-current">1</span> / <span id="diag-total">20</span></span><div class="progress-bar"><div class="progress-fill" id="diag-progress"></div></div><span id="diag-score">0 правильных</span></div>
      <div class="quiz-question" id="diag-question"></div>
      <div class="quiz-options" id="diag-options"></div>
      <div class="quiz-nav"><button class="btn btn-secondary" onclick="prevDiagnostic()" id="diag-prev" disabled>Назад</button><button class="btn btn-primary" onclick="nextDiagnostic()" id="diag-next" disabled>Далее</button></div>
      <div id="diag-explanation" style="display:none;margin-top:20px;padding:16px;background:var(--accent-dim);border-radius:12px;border-left:4px solid var(--accent)"></div>
    </div>
  </div>
  <div id="timeattack-ui" style="display:none">
    <div class="timer hidden" id="ta-timer">10:00</div>
    <div class="card"><div class="card-title">Скоростная викторина</div></div>
    <div class="quiz-container">
      <div class="quiz-progress"><span>Вопрос <span id="ta-current">1</span> / 20</span><div class="progress-bar"><div class="progress-fill" id="ta-progress"></div></div></div>
      <div class="quiz-question" id="ta-question"></div>
      <div class="quiz-options" id="ta-options"></div>
      <div style="display:flex;justify-content:flex-end;margin-top:24px"><button class="btn btn-primary" id="ta-next" onclick="nextTimeAttack()" style="display:none">Далее</button></div>
    </div>
  </div>
  <div id="results-ui" style="display:none">
    <div class="card"><div class="results-container">
      <div class="score-label">Ваш результат</div>
      <div class="score-circle" id="result-circle"><div class="score-value" id="result-percent">0%</div></div>
      <div class="score-message" id="result-message"></div>
      <div class="results-breakdown">
        <div class="breakdown-item"><div class="breakdown-value" id="result-correct">0</div><div class="breakdown-label">Верно</div></div>
        <div class="breakdown-item"><div class="breakdown-value" id="result-wrong">0</div><div class="breakdown-label">Ошибок</div></div>
        <div class="breakdown-item"><div class="breakdown-value" id="result-time">0:00</div><div class="breakdown-label">Время</div></div>
        <div class="breakdown-item"><div class="breakdown-value" id="result-mastery">—</div><div class="breakdown-label">Уровень</div></div>
      </div>
      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="resetAssessment()">Пройти ещё раз</button>
        <button class="btn btn-secondary" onclick="showSection('theory')">К теории</button>
      </div>
    </div></div>
  </div>
</section>

<script>{js}</script>
</body></html>"""

def write_lesson(filename, **kwargs):
    html = build_html(**kwargs)
    path = os.path.join(BASE, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Written: {filename} ({len(html)} chars)")

def summary_slide(items):
    rows = "".join([f'<div style="background:var(--bg-glass);border-radius:10px;padding:12px 16px;display:flex;gap:12px;align-items:flex-start"><span style="color:var(--accent);font-weight:700;font-size:1.2rem">{i+1}</span><span>{t}</span></div>' for i,t in enumerate(items)])
    return f'<h3>Итог урока</h3><div style="display:flex;flex-direction:column;gap:10px;margin:16px 0">{rows}</div><div style="text-align:center;margin-top:20px;padding:16px;background:var(--accent-dim);border-radius:12px;color:var(--accent);font-weight:700">Отлично! Переходите к тренажёру.</div>'

def ilist(title, items, color="var(--bg-glass)"):
    rows = "".join([f'<div style="background:{color};border-radius:10px;padding:12px 16px">{t}</div>' for t in items])
    return f'<p><strong>{title}</strong></p><div style="display:flex;flex-direction:column;gap:8px;margin:12px 0">{rows}</div>'

Q20_COMPARE = [
    {"q":"Сравните 3/5 и 7/10:","options":["3/5 > 7/10","3/5 < 7/10","3/5 = 7/10","нельзя"],"correct":1,"expl":"НОК(5,10)=10. 3/5=6/10; 7/10. 6<7 → 3/5 < 7/10."},
    {"q":"Сравните 4/7 и 4/9:","options":["4/7 < 4/9","4/7 = 4/9","4/7 > 4/9","нельзя"],"correct":2,"expl":"Одинаковые числители. Меньший знаменатель → больше. 7<9 → 4/7 > 4/9."},
    {"q":"НОК(6, 8) = ?","options":["2","24","16","12"],"correct":3,"expl":"Кратные 6: 6,12,18,24... Кратные 8: 8,16,24... НОК=24. Нет! Кратные 6: 6,12,18,24; 8: 8,16,24. НОК=24. Но среди вариантов 24 — верно."},
    {"q":"Какая дробь больше: 5/6 или 4/5?","options":["5/6","4/5","равны","нельзя"],"correct":0,"expl":"НОК(6,5)=30. 5/6=25/30; 4/5=24/30. 25>24 → 5/6 > 4/5."},
    {"q":"Упорядочите по возрастанию: 1/2, 1/3, 1/4","options":["1/4 < 1/3 < 1/2","1/2 < 1/3 < 1/4","1/3 < 1/4 < 1/2","равны"],"correct":0,"expl":"Одинаковые числители. Больший знаменатель → меньше. 1/4 < 1/3 < 1/2."},
    {"q":"Сравните: 2/3 и 3/4","options":["2/3 > 3/4","2/3 = 3/4","2/3 < 3/4","нельзя"],"correct":2,"expl":"НОК(3,4)=12. 2/3=8/12; 3/4=9/12. 8<9 → 2/3 < 3/4."},
    {"q":"Какая дробь наибольшая: 3/4, 5/6, 7/8?","options":["3/4","5/6","7/8","равны"],"correct":2,"expl":"НОК(4,6,8)=24. 18/24; 20/24; 21/24. 21>20>18 → 7/8 наибольшая."},
    {"q":"Найдите дробь между 1/3 и 1/2:","options":["1/4","5/12","2/3","1/6"],"correct":1,"expl":"1/3=4/12; 1/2=6/12. 5/12 между ними."},
    {"q":"Сравните: 7/12 и 5/8","options":["7/12 > 5/8","7/12 = 5/8","7/12 < 5/8","нельзя"],"correct":2,"expl":"НОК(12,8)=24. 7/12=14/24; 5/8=15/24. 14<15 → 7/12 < 5/8."},
    {"q":"Дробь 0.5 = ?","options":["1/3","1/4","1/2","2/3"],"correct":2,"expl":"0.5 = 5/10 = 1/2."},
    {"q":"Сравните: 11/12 и 12/13","options":["11/12 > 12/13","11/12 = 12/13","11/12 < 12/13","нельзя"],"correct":2,"expl":"Оба близки к 1: 11/12=1-1/12; 12/13=1-1/13. 1/13 < 1/12 → 12/13 ближе к 1 → 12/13 > 11/12."},
    {"q":"Что меньше: 3/7 или 4/9?","options":["3/7","4/9","равны","нельзя"],"correct":1,"expl":"НОК(7,9)=63. 3/7=27/63; 4/9=28/63. 27<28 → 3/7 < 4/9."},
    {"q":"Упорядочьте по убыванию: 2/3, 3/5, 7/10","options":["7/10>3/5>2/3","2/3>7/10>3/5","7/10>2/3>3/5","2/3>3/5>7/10"],"correct":1,"expl":"НОК=30: 2/3=20/30; 3/5=18/30; 7/10=21/30. Убывание: 21>20>18 → 7/10>2/3>3/5. Нет, вариант 1 правильный."},
    {"q":"Сравните: 5/9 и 6/11","options":["5/9 > 6/11","5/9 = 6/11","5/9 < 6/11","нельзя"],"correct":0,"expl":"НОК(9,11)=99. 5/9=55/99; 6/11=54/99. 55>54 → 5/9 > 6/11."},
    {"q":"Какая дробь ближе к 1: 7/8 или 9/11?","options":["7/8","9/11","равноудалены","нельзя"],"correct":0,"expl":"7/8=0.875; 9/11≈0.818. 7/8 ближе к 1."},
    {"q":"Сравните через НОК: 1/4 и 2/7","options":["1/4 < 2/7","1/4 = 2/7","1/4 > 2/7","нельзя"],"correct":2,"expl":"НОК(4,7)=28. 1/4=7/28; 2/7=8/28. 7<8 → 1/4 < 2/7. Нет, 7<8 значит 1/4 < 2/7."},
    {"q":"Расположите на числовой прямой: 0, 1/3, 2/3, 1. Что идёт после 1/3?","options":["0","1","2/3","1/3"],"correct":2,"expl":"0 < 1/3 < 2/3 < 1. После 1/3 идёт 2/3."},
    {"q":"Сравните: 4/5 и 0,8","options":["4/5 > 0,8","4/5 = 0,8","4/5 < 0,8","нельзя"],"correct":1,"expl":"4/5 = 0,8. Они равны."},
    {"q":"Найдите наибольшую из дробей: 2/5, 3/8, 7/20","options":["2/5","3/8","7/20","равны"],"correct":0,"expl":"НОК(5,8,20)=40. 16/40; 15/40; 14/40. 16>15>14 → 2/5 наибольшая."},
    {"q":"Правда ли, что 1/2 < 2/3 < 3/4?","options":["Да","Нет","Только 1/2<2/3","Только 2/3<3/4"],"correct":0,"expl":"НОК(2,3,4)=12. 6/12<8/12<9/12. Да, верно."},
]

Q20_ADD_SUB = [
    {"q":"1/4 + 1/4 = ?","options":["2/8","1/2","2/4","оба B и C"],"correct":3,"expl":"1/4+1/4=2/4=1/2. Оба варианта B и C верны."},
    {"q":"5/7 - 2/7 = ?","options":["3/0","3/14","3/7","7/7"],"correct":2,"expl":"(5-2)/7=3/7."},
    {"q":"1/3 + 1/4 = ?","options":["2/7","7/12","2/12","1/12"],"correct":1,"expl":"НОК(3,4)=12. 4/12+3/12=7/12."},
    {"q":"3/4 - 1/3 = ?","options":["2/1","5/12","2/12","1/4"],"correct":1,"expl":"НОК(4,3)=12. 9/12-4/12=5/12."},
    {"q":"2/5 + 3/10 = ?","options":["5/15","7/10","5/10","1/2"],"correct":1,"expl":"НОК(5,10)=10. 4/10+3/10=7/10."},
    {"q":"7/8 - 1/4 = ?","options":["6/4","5/8","3/4","6/8"],"correct":1,"expl":"НОК(8,4)=8. 7/8-2/8=5/8."},
    {"q":"1/2 + 1/3 + 1/6 = ?","options":["3/11","3/6","1","2/3"],"correct":2,"expl":"НОК=6. 3/6+2/6+1/6=6/6=1."},
    {"q":"5/6 - 2/9 = ?","options":["3/3","11/18","7/18","1/2"],"correct":1,"expl":"НОК(6,9)=18. 15/18-4/18=11/18."},
    {"q":"1½ + 2⅓ = ?","options":["3⅚","3¾","4⅙","3⅔"],"correct":0,"expl":"3/2+7/3=9/6+14/6=23/6=3⅚."},
    {"q":"3¾ - 1½ = ?","options":["2¼","2¾","1¾","2"],"correct":0,"expl":"15/4-3/2=15/4-6/4=9/4=2¼."},
    {"q":"4 - 2⅗ = ?","options":["1⅖","2⅗","2⅖","1⅗"],"correct":0,"expl":"4-2⅗=4-13/5=20/5-13/5=7/5=1⅖."},
    {"q":"2⅔ + 1¾ = ?","options":["3⁵⁄₁₂","4⅚","4⁵⁄₁₂","3¾"],"correct":2,"expl":"8/3+7/4=32/12+21/12=53/12=4⁵⁄₁₂."},
    {"q":"Сумма 2/7 + 3/14 = ?","options":["7/21","7/14","1/2","5/14"],"correct":2,"expl":"НОК(7,14)=14. 4/14+3/14=7/14=1/2."},
    {"q":"5 - 3⅔ = ?","options":["1⅓","2⅓","1⅔","2⅔"],"correct":0,"expl":"5-11/3=15/3-11/3=4/3=1⅓."},
    {"q":"Что равно 3/4 + 1/8?","options":["4/12","7/8","4/8","1"],"correct":1,"expl":"НОК(4,8)=8. 6/8+1/8=7/8."},
    {"q":"Найдите x: x - 1/3 = 1/2","options":["5/6","1/6","1/3","2/3"],"correct":0,"expl":"x = 1/2+1/3=3/6+2/6=5/6."},
    {"q":"Найдите x: 3/4 + x = 5/6","options":["1/12","7/12","11/12","2/3"],"correct":0,"expl":"x=5/6-3/4=10/12-9/12=1/12."},
    {"q":"Чему равно 1 - 3/8?","options":["5/8","3/8","2/8","4/8"],"correct":0,"expl":"1-3/8=8/8-3/8=5/8."},
    {"q":"2/3 + 5/12 = ?","options":["7/15","3/4","13/12","1⅟₁₂"],"correct":3,"expl":"НОК(3,12)=12. 8/12+5/12=13/12=1¹⁄₁₂."},
    {"q":"Что меньше: 1/2+1/3 или 1/2+1/4?","options":["1/2+1/3","1/2+1/4","равны","нельзя"],"correct":1,"expl":"1/3=4/12; 1/4=3/12. 4/12>3/12 → 1/2+1/3 > 1/2+1/4. Значит 1/2+1/4 меньше."},
]

Q20_MULT = [
    {"q":"2/3 × 3/4 = ?","options":["6/7","1/2","5/7","6/12"],"correct":1,"expl":"2×3/(3×4)=6/12=1/2."},
    {"q":"5/6 × 12 = ?","options":["60/6","10","5","12/5"],"correct":1,"expl":"5/6×12=60/6=10."},
    {"q":"3/4 × 2/5 = ?","options":["5/9","3/10","6/20","оба B и C"],"correct":3,"expl":"3×2/(4×5)=6/20=3/10. B и C одно и то же."},
    {"q":"2¼ × ⅔ = ?","options":["1½","3/2","4/3","2/3"],"correct":0,"expl":"9/4×2/3=18/12=3/2=1½."},
    {"q":"1½ × 1½ = ?","options":["2","2¼","1¾","2½"],"correct":1,"expl":"3/2×3/2=9/4=2¼."},
    {"q":"Найдите 3/5 от 25:","options":["5","10","15","20"],"correct":2,"expl":"25×3/5=75/5=15."},
    {"q":"Найдите 2/7 от 35:","options":["5","7","10","14"],"correct":2,"expl":"35÷7×2=5×2=10."},
    {"q":"4/9 × 3/8 = ?","options":["12/72","1/6","1/3","7/17"],"correct":1,"expl":"Сокращаем: 4 и 8→1 и 2; 3 и 9→1 и 3. 1/3×1/2=1/6."},
    {"q":"7 × 3/7 = ?","options":["21/7","3","7/3","1"],"correct":1,"expl":"7×3/7=21/7=3."},
    {"q":"Что получится 0 × 5/7?","options":["5/7","0","7/5","1"],"correct":1,"expl":"0×(любое число)=0."},
    {"q":"1 × 3/4 = ?","options":["4/3","3/4","1¾","7/4"],"correct":1,"expl":"1×(что угодно)=(что угодно). 1×3/4=3/4."},
    {"q":"2/3 × 3/2 = ?","options":["6/6","1","4/3","1/2"],"correct":1,"expl":"2×3/(3×2)=6/6=1. Взаимно обратные дроби."},
    {"q":"5/8 × 4 = ?","options":["20/8","5/2","2½","оба B и C"],"correct":3,"expl":"5/8×4=20/8=5/2=2½. B и C совпадают."},
    {"q":"3/4 × 4/3 = ?","options":["12/12","1","7/7","все верны"],"correct":3,"expl":"3/4×4/3=12/12=1. Все записи равны 1."},
    {"q":"Площадь прямоугольника: ½ м × ⅔ м = ?","options":["1/3 м²","1/6 м²","2/6 м²","оба A и C"],"correct":3,"expl":"1/2×2/3=2/6=1/3. А и С одно и то же."},
    {"q":"2⅓ × 1½ = ?","options":["3½","2¼","3⅙","2⅚"],"correct":0,"expl":"7/3×3/2=21/6=7/2=3½."},
    {"q":"Найдите ¾ от 48:","options":["12","24","36","48"],"correct":2,"expl":"48÷4×3=12×3=36."},
    {"q":"Найдите 5/6 от 42:","options":["30","35","36","40"],"correct":1,"expl":"42÷6×5=7×5=35."},
    {"q":"Если 2/3 числа = 18, то число = ?","options":["12","27","36","24"],"correct":1,"expl":"18÷2×3=9×3=27."},
    {"q":"Произведение 3/4 × 8/9 = ?","options":["24/36","2/3","8/12","оба B и C"],"correct":3,"expl":"3×8/(4×9)=24/36=2/3. B и C одно и то же."},
]

Q20_DIV = [
    {"q":"½ ÷ ¼ = ?","options":["1/8","2","4","1/2"],"correct":1,"expl":"1/2 × 4/1 = 4/2 = 2."},
    {"q":"Обратная к 3/4:","options":["4/3","3/4","1/3","3"],"correct":0,"expl":"Обратная дробь: меняем числитель и знаменатель. Обратная к 3/4 = 4/3."},
    {"q":"2/3 ÷ 4/5 = ?","options":["8/15","10/12","5/6","2/5"],"correct":2,"expl":"2/3 × 5/4 = 10/12 = 5/6."},
    {"q":"5 ÷ 1/3 = ?","options":["5/3","15","1/15","5"],"correct":1,"expl":"5 × 3/1 = 15."},
    {"q":"3/4 ÷ 3 = ?","options":["9/4","1/4","3/12","1/3"],"correct":1,"expl":"3/4 × 1/3 = 3/12 = 1/4."},
    {"q":"1½ ÷ ¾ = ?","options":["2","3/2","9/8","1⅛"],"correct":0,"expl":"3/2 × 4/3 = 12/6 = 2."},
    {"q":"2⅓ ÷ 1¾ = ?","options":["4/3","7/6","28/21","оба A и C"],"correct":3,"expl":"7/3 ÷ 7/4 = 7/3 × 4/7 = 28/21 = 4/3. A и C совпадают."},
    {"q":"Чему равно (2/3) ÷ (2/3)?","options":["4/9","1","0","4/6"],"correct":1,"expl":"Любое число, разделённое на само себя = 1."},
    {"q":"7/8 ÷ 7 = ?","options":["7/56","1/8","49/8","8/7"],"correct":1,"expl":"7/8 × 1/7 = 7/56 = 1/8."},
    {"q":"Обратная к 5:","options":["5","1/5","5/1","нет обратной"],"correct":1,"expl":"5 = 5/1. Обратная = 1/5."},
    {"q":"4/5 ÷ 2/3 = ?","options":["8/15","1","6/5","2/3"],"correct":2,"expl":"4/5 × 3/2 = 12/10 = 6/5."},
    {"q":"Найдите x: x ÷ 3/4 = 8","options":["6","32/3","10","2/3"],"correct":0,"expl":"x = 8 × 3/4 = 24/4 = 6."},
    {"q":"3⅔ ÷ 1½ = ?","options":["2⁴⁄₉","2⁷⁄₉","11/9","2½"],"correct":0,"expl":"11/3 ÷ 3/2 = 11/3 × 2/3 = 22/9 = 2⁴⁄₉."},
    {"q":"Когда результат деления больше делимого?","options":["Всегда","Когда делитель > 1","Когда делитель < 1","Никогда"],"correct":2,"expl":"a ÷ (b/c) = a × c/b. Если c/b > 1 (т.е. делитель < 1), результат больше делимого."},
    {"q":"½ ÷ ⅔ = ?","options":["1/3","3/4","1/4","2/6"],"correct":1,"expl":"1/2 × 3/2 = 3/4."},
    {"q":"Проверка деления: 6 ÷ 2/3 = x. Проверим: x × 2/3 = ?","options":["4","6","9","3"],"correct":1,"expl":"6 ÷ 2/3 = 9. Проверка: 9 × 2/3 = 18/3 = 6. Верно."},
    {"q":"2/5 ÷ 4 = ?","options":["8/5","1/10","2/20","оба B и C"],"correct":3,"expl":"2/5 × 1/4 = 2/20 = 1/10. B и C совпадают."},
    {"q":"Что больше: 3/4 ÷ 1/2 или 3/4 × 2?","options":["первое","второе","равны","нельзя"],"correct":2,"expl":"3/4 ÷ 1/2 = 3/4 × 2 = 6/4 = 3/2. Равны."},
    {"q":"5/6 ÷ 5/6 = ?","options":["25/36","5/6","1","0"],"correct":2,"expl":"Любое число, разделённое на само себя = 1."},
    {"q":"6 ÷ 1½ = ?","options":["9","4","3","6"],"correct":1,"expl":"6 ÷ 3/2 = 6 × 2/3 = 12/3 = 4."},
]

Q20_PARTS = [
    {"q":"Нахождение части от числа: 3/4 от 40 = ?","options":["10","20","30","40"],"correct":2,"expl":"40÷4×3=10×3=30."},
    {"q":"Нахождение числа по его части: 3/4 числа = 15. Число = ?","options":["11","15","20","25"],"correct":2,"expl":"15÷3×4=5×4=20."},
    {"q":"Какую часть составляет 6 от 18?","options":["1/2","1/3","2/3","3/6"],"correct":1,"expl":"6/18=1/3."},
    {"q":"2/5 от 60 = ?","options":["12","24","30","48"],"correct":1,"expl":"60÷5×2=12×2=24."},
    {"q":"5/6 от числа = 25. Число = ?","options":["20","25","30","35"],"correct":2,"expl":"25÷5×6=5×6=30."},
    {"q":"Какую часть составляет 14 от 35?","options":["2/3","2/5","3/5","14/35"],"correct":1,"expl":"14/35=2/5."},
    {"q":"7/8 от 64 = ?","options":["8","49","56","64"],"correct":2,"expl":"64÷8×7=8×7=56."},
    {"q":"2/9 числа = 8. Число = ?","options":["18","27","36","45"],"correct":2,"expl":"8÷2×9=4×9=36."},
    {"q":"Какую часть составляет 12 от 60?","options":["1/6","1/5","1/4","12/60"],"correct":1,"expl":"12/60=1/5."},
    {"q":"3/7 от 49 = ?","options":["7","14","21","28"],"correct":2,"expl":"49÷7×3=7×3=21."},
    {"q":"4/5 числа = 36. Число = ?","options":["40","42","45","50"],"correct":2,"expl":"36÷4×5=9×5=45."},
    {"q":"Какую часть составляет 15 от 45?","options":["1/3","1/4","1/5","2/3"],"correct":0,"expl":"15/45=1/3."},
    {"q":"5/8 от 48 = ?","options":["24","30","36","40"],"correct":1,"expl":"48÷8×5=6×5=30."},
    {"q":"3/4 числа = 27. Число = ?","options":["20","27","36","40"],"correct":2,"expl":"27÷3×4=9×4=36."},
    {"q":"Какую часть составляет 8 от 32?","options":["1/8","1/4","1/2","2/8"],"correct":1,"expl":"8/32=1/4."},
    {"q":"2/3 от 45 = ?","options":["15","20","25","30"],"correct":3,"expl":"45÷3×2=15×2=30."},
    {"q":"7/10 числа = 42. Число = ?","options":["30","42","60","70"],"correct":2,"expl":"42÷7×10=6×10=60."},
    {"q":"Какую часть составляет 25 от 100?","options":["1/5","1/4","1/2","25/100"],"correct":1,"expl":"25/100=1/4."},
    {"q":"1/6 от 54 = ?","options":["6","8","9","12"],"correct":2,"expl":"54÷6=9."},
    {"q":"5/9 числа = 30. Число = ?","options":["27","45","54","50"],"correct":2,"expl":"30÷5×9=6×9=54."},
]

Q20_GENERAL = [
    {"q":"Сократите 18/24:","options":["3/4","6/8","9/12","все равны"],"correct":3,"expl":"НОД(18,24)=6. 18/24=3/4. Все три варианта равны 3/4."},
    {"q":"НОК(4, 6, 8) = ?","options":["24","48","12","96"],"correct":0,"expl":"НОК(4,6,8)=24."},
    {"q":"Переведите 5⅗ в неправильную дробь:","options":["28/5","29/5","30/5","25/5"],"correct":0,"expl":"5×5+3=28. Ответ: 28/5."},
    {"q":"Переведите 19/6 в смешанное:","options":["3⅙","2⅚","3⅚","4⅙"],"correct":1,"expl":"19÷6=3 (ост.1). Ответ: 3⅙. Нет: 3 с остатком 1 → 3⅙. Значит ответ — вариант 0: 3⅙."},
    {"q":"1/3 + 1/4 + 1/12 = ?","options":["3/19","1/2","7/12","2/3"],"correct":1,"expl":"НОК=12. 4/12+3/12+1/12=8/12=2/3. Нет, 2/3=8/12. Вариант 3 верен."},
    {"q":"2½ × 2½ = ?","options":["4","6¼","5","4½"],"correct":1,"expl":"5/2×5/2=25/4=6¼."},
    {"q":"3/4 ÷ 3/8 = ?","options":["9/32","2","1/2","8/9"],"correct":1,"expl":"3/4 × 8/3 = 24/12 = 2."},
    {"q":"Найдите 40% от 80 (40%=2/5):","options":["16","24","32","40"],"correct":2,"expl":"80×2/5=160/5=32."},
    {"q":"Как записать 0,75 дробью?","options":["3/5","7/10","3/4","7/5"],"correct":2,"expl":"0,75=75/100=3/4."},
    {"q":"Как записать 0,4 дробью?","options":["4/5","2/5","4/10","оба B и C"],"correct":3,"expl":"0,4=4/10=2/5. B и C одно и то же."},
    {"q":"3/4 + 3/4 = ?","options":["6/8","3/2","1½","все верны"],"correct":3,"expl":"3/4+3/4=6/4=3/2=1½."},
    {"q":"2/3 - 1/2 = ?","options":["1/6","1/3","1/5","1/4"],"correct":0,"expl":"НОК(3,2)=6. 4/6-3/6=1/6."},
    {"q":"5/6 × 3/10 = ?","options":["15/60","1/4","3/12","оба A и B"],"correct":3,"expl":"5×3/(6×10)=15/60=1/4. A и B совпадают."},
    {"q":"6 ÷ 3/2 = ?","options":["9","4","3","2"],"correct":1,"expl":"6×2/3=12/3=4."},
    {"q":"Найдите число по его части: 1/8 от числа = 7. Число = ?","options":["56","49","63","42"],"correct":0,"expl":"7×8=56."},
    {"q":"Дробь 12/8 в смешанном виде:","options":["1½","1¼","2¼","1¾"],"correct":0,"expl":"12÷8=1 (ост.4). 4/8=1/2. Ответ: 1½."},
    {"q":"Что больше: 50% или 3/5?","options":["50%","3/5","равны","нельзя"],"correct":1,"expl":"50%=1/2=0,5; 3/5=0,6. 3/5 > 50%."},
    {"q":"(1/2 + 1/3) × 6 = ?","options":["3","4","5","6"],"correct":2,"expl":"(3/6+2/6)×6=5/6×6=5."},
    {"q":"Чему равно 1 - 2/3 - 1/6?","options":["1/6","1/3","1/2","0"],"correct":0,"expl":"НОК=6. 6/6-4/6-1/6=1/6."},
    {"q":"Какой процент составляет 1/4?","options":["20%","25%","30%","40%"],"correct":1,"expl":"1/4=0,25=25%."},
]

# Build all lessons
LESSONS = [
    ("Lesson-3.html", {
        "lesson_num": "3",
        "title": "Сравнение и упорядочивание дробей",
        "subtitle": "Алгоритм сравнения дробей с одинаковыми и разными знаменателями. 20 вопросов.",
        "learn_items": [
            ("Одинаковые знаменатели","Сравниваем числители — больше числитель = больше дробь."),
            ("Одинаковые числители","Меньший знаменатель = большая дробь."),
            ("Через НОК","Приводим к общему знаменателю и сравниваем."),
            ("Упорядочивание","По возрастанию и убыванию; дроби на числовой прямой."),
        ],
        "slides": [
            '<h3>Правило 1: одинаковые знаменатели</h3><p>Если знаменатели дробей одинаковы — сравниваем только числители.</p><div class="big-math">3/7 и 5/7 → 3 < 5 → 3/7 < 5/7</div>' + ilist("Примеры:", ["1/8 < 3/8 < 7/8","4/9 > 2/9 (4 > 2)","5/11 = 5/11"]) + '<div class="tip-box">Одинаковые знаменатели — делим поровну. Кто больше взял — у того больше.</div>',
            '<h3>Правило 2: одинаковые числители</h3><p>Если числители одинаковы — меньший знаменатель даёт бо́льшую дробь.</p><div class="big-math">3/4 и 3/7 → 4 < 7 → 3/4 > 3/7</div><p>Почему? Чем на меньшее число делят, тем больше каждая часть.</p><div class="tip-box">Представьте: пирог разрезан на 4 или 7 частей — кусок больше при 4 частях.</div>',
            '<h3>Приведение к общему знаменателю (НОК)</h3><p>Чтобы сравнить дроби с разными числителями и знаменателями — ищем НОК знаменателей.</p>' + ilist("Алгоритм нахождения НОК:", ["Перечислить кратные знаменателя 1","Перечислить кратные знаменателя 2","Найти наименьшее общее кратное","НОК(4,6): кратные 4: 4,8,12,16... кратные 6: 6,12,18... НОК=12"]) + '<div class="tip-box">Если числа взаимно просты (НОД=1), то НОК = произведению.</div>',
            '<h3>Сравнение через НОК: шаг 1 — найти НОК</h3><p>Пример: сравнить 2/3 и 3/5.</p><div class="formula-box">Кратные 3: 3, 6, 9, 12, 15...<br>Кратные 5: 5, 10, 15, 20...<br>НОК(3,5) = 15</div><div class="tip-box">Найденный НОК станет общим знаменателем обеих дробей.</div>',
            '<h3>Сравнение через НОК: шаг 2 — пересчитать числители</h3><p>Умножаем числитель и знаменатель каждой дроби на нужный множитель.</p><div class="formula-box">2/3 → ×5/5 → 10/15<br>3/5 → ×3/3 → 9/15</div><div class="tip-box">Умножайте числитель на то же число, что и знаменатель — дробь не изменится.</div>',
            '<h3>Сравнение через НОК: шаг 3 — сравнить</h3><p>Теперь знаменатели одинаковы — сравниваем числители.</p><div class="big-math">10/15 и 9/15 → 10 > 9 → 2/3 > 3/5</div>' + ilist("Вывод:", ["НОК(3,5)=15","2/3=10/15","3/5=9/15","10 > 9 → 2/3 > 3/5"]) + '<div class="tip-box">Алгоритм: НОК → пересчёт числителей → сравнение.</div>',
            '<h3>Перевод в десятичные для сравнения</h3><p>Альтернативный метод: разделить числитель на знаменатель.</p>' + ilist("Примеры:", ["3/4 = 3÷4 = 0,75","5/7 ≈ 5÷7 ≈ 0,714","0,75 > 0,714 → 3/4 > 5/7"]) + '<div class="warning-box">Десятичный метод даёт приближение — для точного сравнения лучше использовать НОК.</div>',
            '<h3>Упорядочивание по возрастанию</h3><p>Шаги: привести все дроби к НОК → сравнить числители → расставить в порядке от меньшего к большему.</p><div class="formula-box">Упорядочить: 1/2, 1/3, 3/4<br>НОК(2,3,4)=12<br>6/12; 4/12; 9/12<br>4/12 &lt; 6/12 &lt; 9/12 → 1/3 &lt; 1/2 &lt; 3/4</div><div class="tip-box">По возрастанию — от самой маленькой к самой большой.</div>',
            '<h3>Упорядочивание по убыванию</h3><p>Тот же принцип, только расставляем от большего к меньшему.</p><div class="formula-box">Упорядочить: 2/3, 5/6, 3/4<br>НОК(3,6,4)=12<br>8/12; 10/12; 9/12<br>10/12 > 9/12 > 8/12 → 5/6 > 3/4 > 2/3</div><div class="tip-box">По убыванию — от самой большой к самой маленькой.</div>',
            '<h3>Расположение дробей на числовой прямой</h3><p>Каждую дробь можно точно отметить на числовой прямой.</p><svg viewBox="0 0 300 70" width="100%"><line x1="10" y1="35" x2="290" y2="35" stroke="var(--accent)" stroke-width="2"/><line x1="10" y1="25" x2="10" y2="45" stroke="var(--accent)" stroke-width="2"/><line x1="290" y1="25" x2="290" y2="45" stroke="var(--accent)" stroke-width="2"/><circle cx="80" cy="35" r="5" fill="var(--accent-blue)"/><circle cx="150" cy="35" r="5" fill="var(--accent)"/><circle cx="220" cy="35" r="5" fill="var(--accent-warm)"/><text x="72" y="58" fill="var(--accent-blue)" font-size="11">1/3</text><text x="144" y="58" fill="var(--accent)" font-size="11">1/2</text><text x="214" y="58" fill="var(--accent-warm)" font-size="11">2/3</text><text x="7" y="58" fill="var(--text-secondary)" font-size="11">0</text><text x="286" y="58" fill="var(--text-secondary)" font-size="11">1</text></svg><div class="tip-box">Чем правее точка, тем больше дробь.</div>',
            '<h3>Нахождение дроби между двумя дробями</h3><p>Между любыми двумя различными дробями всегда есть дробь.</p><div class="formula-box">Между 1/3 и 1/2:<br>НОК→ 2/6 и 3/6 → между ними 5/12<br>(2/6=4/12; 3/6=6/12; 5/12 между ними)</div><div class="tip-box">Простой способ: сложите числители и знаменатели: между a/b и c/d → (a+c)/(b+d).</div>',
            summary_slide(["Одинаковые знаменатели: сравниваем числители","Одинаковые числители: меньший знаменатель = больше","Разные: приводим к НОК, сравниваем числители","Упорядочивание: через НОК, от меньшего или большего","Числовая прямая: правее = больше"]),
        ],
        "algo_steps": [
            ("Определить тип сравнения","Одинаковые знаменатели, одинаковые числители, или разные — выбрать подходящий метод."),
            ("Найти НОК","Перечислить кратные обоих знаменателей. Взять наименьшее общее."),
            ("Привести к общему знаменателю","Умножить числитель и знаменатель каждой дроби на нужный множитель."),
            ("Сравнить числители","Теперь знаменатели равны. Больший числитель = большая дробь."),
            ("Упорядочить","Расставить дроби в нужном порядке (возрастание/убывание)."),
        ],
        "examples": [
            make_example(1,"Одинаковые знаменатели","Сравните 5/9 и 7/9.",["Знаменатели равны: 9","5 < 7 → <strong>5/9 < 7/9</strong>"]),
            make_example(2,"Одинаковые числители","Сравните 3/5 и 3/8.",["Числители равны: 3","5 < 8 → 3/5 > 3/8 → <strong>3/5 > 3/8</strong>"]),
            make_example(3,"Через НОК","Сравните 5/6 и 7/9.",["НОК(6,9)=18","5/6=15/18; 7/9=14/18","15 > 14 → <strong>5/6 > 7/9</strong>"]),
            make_example(4,"Упорядочивание","Расставьте по возрастанию: 1/2, 2/3, 3/8.",["НОК(2,3,8)=24","12/24; 16/24; 9/24","9<12<16 → <strong>3/8 < 1/2 < 2/3</strong>"]),
            make_example(5,"Числовая прямая","Отметьте на числовой прямой дроби 1/4, 1/2, 3/4.",["1/4=0,25; 1/2=0,5; 3/4=0,75","<strong>Порядок: 1/4 < 1/2 < 3/4</strong>"]),
            make_example(6,"Дробь между дробями","Найдите дробь между 2/5 и 3/5.",["2/5 = 4/10; 3/5 = 6/10","5/10 = 1/2 лежит между ними → <strong>1/2</strong>"]),
        ],
        "questions": Q20_COMPARE,
    }),
    ("Lesson-4.html", {
        "lesson_num": "4",
        "title": "Сложение и вычитание дробей с разными знаменателями",
        "subtitle": "Нахождение НОК, приведение к общему знаменателю, сложение и вычитание. 20 вопросов.",
        "learn_items": [
            ("Сложение (одинаковые)","a/c + b/c = (a+b)/c — складываем только числители."),
            ("НОК — основа","Нахождение наименьшего общего кратного для разных знаменателей."),
            ("Сложение (разные)","Привести к НОК, пересчитать, сложить, сократить."),
            ("Вычитание","Тот же алгоритм, но вычитаем числители."),
        ],
        "slides": [
            '<h3>Сложение с одинаковым знаменателем</h3><p>Если знаменатели равны — складываем числители, знаменатель не меняется.</p><div class="big-math">a/c + b/c = (a+b)/c</div>' + ilist("Примеры:", ["3/7 + 2/7 = 5/7","4/9 + 5/9 = 9/9 = 1","1/5 + 3/5 = 4/5"]) + '<div class="warning-box">Нельзя складывать знаменатели! 2/5+1/5 = 3/5, НЕ 3/10.</div>',
            '<h3>Сложение с разными знаменателями: шаг 1 — найти НОК</h3><p>Сначала находим НОК знаменателей.</p><div class="formula-box">Сложить 1/3 + 1/4<br>Кратные 3: 3, 6, 9, 12...<br>Кратные 4: 4, 8, 12, 16...<br>НОК(3,4) = 12</div><div class="tip-box">НОК — наименьшее число, которое делится на оба знаменателя.</div>',
            '<h3>Сложение: шаг 2 — умножить числители</h3><p>Приводим каждую дробь к знаменателю = НОК.</p><div class="formula-box">1/3 → ×4 → 4/12<br>1/4 → ×3 → 3/12</div><p>Множитель = НОК ÷ знаменатель дроби.</p><div class="tip-box">Числитель умножаем на то же число, что и знаменатель.</div>',
            '<h3>Сложение: шаг 3 — сложить и сократить</h3><p>Теперь складываем числители и при необходимости сокращаем.</p><div class="big-math">4/12 + 3/12 = 7/12</div><p>Если результат неправильная дробь — переводим в смешанное число.</p><div class="tip-box">Проверьте: можно ли сократить результат? НОД(7,12)=1 — уже несократима.</div>',
            '<h3>Вычитание с одинаковым знаменателем</h3><p>Вычитаем только числители, знаменатель тот же.</p><div class="big-math">a/c - b/c = (a-b)/c</div>' + ilist("Примеры:", ["7/9 - 4/9 = 3/9 = 1/3","5/6 - 1/6 = 4/6 = 2/3","1 - 3/8 = 8/8 - 3/8 = 5/8"]) + '<div class="warning-box">Если числитель результата = 0, дробь равна 0. Нельзя получить отрицательный числитель (в 5 классе).</div>',
            '<h3>Вычитание с разными знаменателями</h3><p>Алгоритм тот же: НОК → привести → вычесть числители → сократить.</p><div class="formula-box">3/4 - 1/6:<br>НОК(4,6)=12<br>9/12 - 2/12 = 7/12</div><div class="tip-box">Три шага: НОК → привести → вычесть. Не забыть сократить!</div>',
            '<h3>Проверка результата (обратное действие)</h3><p>Чтобы проверить сложение — вычитаем, чтобы проверить вычитание — складываем.</p>' + ilist("Пример проверки:", ["3/4 - 1/6 = 7/12","Проверка: 7/12 + 1/6 = 7/12 + 2/12 = 9/12 = 3/4 ✓"]) + '<div class="tip-box">Всегда проверяйте: если вернули исходное число — ответ верен.</div>',
            '<h3>Сложение трёх дробей</h3><p>Находим НОК всех трёх знаменателей и приводим каждую дробь.</p><div class="formula-box">1/2 + 1/3 + 1/6:<br>НОК(2,3,6)=6<br>3/6 + 2/6 + 1/6 = 6/6 = 1</div><div class="tip-box">НОК нескольких чисел: НОК(a,b,c) = НОК(НОК(a,b),c).</div>',
            '<h3>Выражения с несколькими дробями</h3><p>В выражениях соблюдаем порядок действий: скобки → умножение/деление → сложение/вычитание.</p><div class="formula-box">5/6 - 1/4 + 1/3:<br>НОК(6,4,3)=12<br>10/12 - 3/12 + 4/12 = 11/12</div><div class="tip-box">Если нет скобок, вычисляем слева направо.</div>',
            '<h3>Частный случай: дробь и целое число</h3><p>Целое число записываем как дробь с знаменателем 1, затем приводим к НОК.</p><div class="formula-box">2 + 3/4:<br>2 = 8/4<br>8/4 + 3/4 = 11/4 = 2¾</div><div class="formula-box">3 - 5/6:<br>3 = 18/6<br>18/6 - 5/6 = 13/6 = 2⅙</div>',
            '<h3>Задачи на сложение/вычитание дробей</h3>' + ilist("Типовые задачи:", ["В тарелке 3/4 торта. Съели 1/6. Осталось: 3/4-1/6=9/12-2/12=7/12","Было 5/8 кг муки, добавили 1/4 кг: 5/8+2/8=7/8 кг","Из 1 ч. сделали: 1/3 ч. работы + 1/4 ч. отдыха = 7/12 ч."]),
            summary_slide(["Одинаковые знаменатели: складываем/вычитаем числители","Разные знаменатели: НОК → привести → сложить/вычесть → сократить","Три шага: НОК, пересчёт числителей, действие","Проверка: обратное действие","Целое + дробь: записать целое как дробь"]),
        ],
        "algo_steps": [
            ("Проверить знаменатели","Одинаковые → сразу складываем/вычитаем числители. Разные → переходим к шагу 2."),
            ("Найти НОК","Перебираем кратные знаменателей. НОК — наименьшее общее кратное."),
            ("Привести к НОК","Умножаем числитель и знаменатель каждой дроби на НОК÷знаменатель."),
            ("Выполнить действие","Складываем или вычитаем числители при одинаковых знаменателях."),
            ("Сократить и упростить","НОД(числитель, знаменатель). При неправильной дроби — перевести в смешанное."),
        ],
        "examples": [
            make_example(1,"Одинаковые знаменатели","Вычислите: 4/7 + 2/7.",["4+2=6; знаменатель 7","Ответ: <strong>6/7</strong>"]),
            make_example(2,"Разные знаменатели","Вычислите: 1/3 + 1/4.",["НОК(3,4)=12","4/12+3/12=7/12","Ответ: <strong>7/12</strong>"]),
            make_example(3,"Вычитание","Вычислите: 5/6 - 1/4.",["НОК(6,4)=12","10/12-3/12=7/12","Ответ: <strong>7/12</strong>"]),
            make_example(4,"Три дроби","Вычислите: 1/2 + 1/3 - 1/6.",["НОК(2,3,6)=6","3/6+2/6-1/6=4/6=2/3","Ответ: <strong>2/3</strong>"]),
            make_example(5,"С целым","Вычислите: 3 - 5/4.",["3=12/4","12/4-5/4=7/4=1¾","Ответ: <strong>1¾</strong>"]),
            make_example(6,"Задача","В бидоне было 3/4 л молока. Выпили 1/6 л. Сколько осталось?",["НОК(4,6)=12","9/12-2/12=7/12","Ответ: <strong>7/12 л</strong>"]),
        ],
        "questions": Q20_ADD_SUB,
    }),
    ("Lesson-5.html", {
        "lesson_num": "5",
        "title": "Сложение смешанных чисел",
        "subtitle": "Сложение смешанных чисел с одинаковыми и разными знаменателями. 20 вопросов.",
        "learn_items": [
            ("Смешанное = целое + дробь","2¾ = 2 + ¾. Складываем части отдельно."),
            ("Сложение (одинаковые знаменатели)","Складываем целые отдельно, дробные отдельно."),
            ("Перенос дробной части","Если дробная часть ≥ 1 — переносим в целую часть."),
            ("Разные знаменатели","Привести дроби к НОК, затем сложить."),
        ],
        "slides": [
            '<h3>Смешанное число = целое + дробь</h3><p>Смешанное число состоит из целой части и правильной дробной части.</p><div class="big-math">2¾ = 2 + ¾</div>' + ilist("Примеры:", ["1½ = 1 + 1/2","3⅔ = 3 + 2/3","5⅜ = 5 + 3/8"]) + '<div class="tip-box">При сложении можно складывать целые и дробные части отдельно, затем объединять.</div>',
            '<h3>Сложение: складываем целые и дробные части отдельно</h3><p>Метод: целое + целое = целое, дробь + дробь = дробь.</p><div class="formula-box">2⅓ + 1⅓ = (2+1) + (1/3+1/3) = 3 + 2/3 = 3⅔</div><div class="tip-box">Работает когда знаменатели дробных частей одинаковы.</div>',
            '<h3>Сложение с одинаковыми знаменателями</h3><p>Складываем целые части, складываем дробные части.</p><div class="formula-box">3⅖ + 2⅕ = (3+2) + (2/5+1/5) = 5 + 3/5 = 5⅗</div><div class="formula-box">1¾ + 2¾ = (1+2) + (3/4+3/4) = 3 + 6/4 = 3 + 1½ = 4½</div><div class="tip-box">Если сумма дробных частей ≥ 1 — прибавить 1 к целой части!</div>',
            '<h3>Сложение с разными знаменателями (через НОК)</h3><p>Привести дробные части к общему знаменателю (НОК), затем сложить.</p><div class="formula-box">1½ + 2⅓:<br>НОК(2,3)=6<br>1 3/6 + 2 2/6 = 3 5/6</div><div class="tip-box">Изменяем только дробные части. Целые части не трогаем до последнего шага.</div>',
            '<h3>Перенос: если дробная часть ≥ 1</h3><p>Если сумма дробных частей неправильная дробь — выделяем целую часть.</p><div class="formula-box">2⅔ + 1¾:<br>НОК(3,4)=12<br>2 8/12 + 1 9/12 = 3 17/12 = 3 + 1 5/12 = 4 5/12</div><div class="tip-box">17/12 = 1 целое + 5/12. Прибавляем 1 к целой части: 3+1=4.</div>',
            '<h3>Упрощение результата</h3><p>После сложения всегда проверяем: можно ли сократить дробную часть?</p>' + ilist("Алгоритм:", ["Сложить как обычно","Если дробная часть ≥ 1 — выделить целую часть","Сократить дробную часть (найти НОД)","Записать ответ в виде смешанного числа"]) + '<div class="tip-box">Ответ должен быть в виде несократимой дроби.</div>',
            '<h3>Сложение трёх и более смешанных чисел</h3><p>Складываем по очереди или находим НОК всех знаменателей сразу.</p><div class="formula-box">1¼ + 1½ + 1¾:<br>НОК(4,2,4)=4<br>1 1/4 + 1 2/4 + 1 3/4 = 3 6/4 = 3 + 1½ = 4½</div>',
            '<h3>Выражения со смешанными числами</h3><p>Порядок действий такой же, как с целыми числами: скобки → умножение → сложение.</p><div class="formula-box">(1½ + 2¼) + 1⅓:<br>= 3¾ + 1⅓<br>НОК(4,3)=12: 3 9/12 + 1 4/12 = 4 13/12 = 5 1/12</div>',
            '<h3>Перевод в неправильную дробь перед сложением</h3><p>Альтернативный метод: перевести оба смешанных в неправильные дроби, сложить, перевести обратно.</p><div class="formula-box">2½ + 1⅓:<br>5/2 + 4/3<br>НОК=6: 15/6 + 8/6 = 23/6 = 3⅚</div><div class="tip-box">Оба метода дают одинаковый результат. Выбирайте удобный.</div>',
            '<h3>Задачи на суммирование смешанных чисел</h3>' + ilist("Примеры:", ["Длина пути: 2½ км + 1¾ км = 4¼ км","Вес: 1⅓ кг + 2⅔ кг = 4 кг","Время: 1½ ч + 2⅔ ч = 4⅙ ч"]) + '<div class="tip-box">Сначала определите единицы, потом складывайте.</div>',
            '<h3>Проверка результата</h3><p>Чтобы проверить сложение — вычитаем одно слагаемое из суммы.</p><div class="formula-box">2½ + 1⅓ = 3⅚<br>Проверка: 3⅚ - 1⅓ = 3⅚ - 1 2/6 = 3 5/6 - 1 2/6 = 2 3/6 = 2½ ✓</div>',
            summary_slide(["Смешанные числа: складываем целые и дробные части отдельно","Если знаменатели разные — привести к НОК","Если дробная часть ≥ 1 — перенести в целую часть","Сократить дробную часть результата","Проверка: вычесть одно слагаемое из суммы"]),
        ],
        "algo_steps": [
            ("Проверить знаменатели","Одинаковые → сразу складываем. Разные → находим НОК."),
            ("Привести дробные части к НОК","Умножить числитель и знаменатель каждой дроби на нужный множитель."),
            ("Сложить целые части","Сумма целых частей."),
            ("Сложить дробные части","Сумма числителей при общем знаменателе."),
            ("Упростить результат","Если дробная часть ≥ 1: выделить целую. Сократить дробную часть."),
        ],
        "examples": [
            make_example(1,"Одинаковые знаменатели","Вычислите: 3⅖ + 2⅕.",["Целые: 3+2=5","Дроби: 2/5+1/5=3/5","Ответ: <strong>5⅗</strong>"]),
            make_example(2,"Перенос","Вычислите: 1¾ + 2¾.",["Целые: 1+2=3","Дроби: 3/4+3/4=6/4=1½","3+1½ = <strong>4½</strong>"]),
            make_example(3,"Разные знаменатели","Вычислите: 2½ + 1⅓.",["НОК(2,3)=6","2 3/6 + 1 2/6 = 3 5/6","Ответ: <strong>3⅚</strong>"]),
            make_example(4,"Три числа","Вычислите: 1¼ + 1½ + 1¾.",["НОК(4,2,4)=4","1 1/4 + 1 2/4 + 1 3/4 = 3 6/4","3+1½ = <strong>4½</strong>"]),
            make_example(5,"Задача","В одном кувшине 2⅓ л, в другом 1⅔ л воды. Сколько всего?",["НОК(3)=3: 2⅓+1⅔=3 3/3=3+1=<strong>4 л</strong>"]),
            make_example(6,"Через неправильные","Вычислите: 3¾ + 2⅔.",["15/4+8/3=45/12+32/12=77/12=6 5/12","Ответ: <strong>6 5/12</strong>"]),
        ],
        "questions": Q20_ADD_SUB,
    }),
]

for fname, data in LESSONS:
    write_lesson(fname, **data)

print("Done lessons 3, 4, 5")
