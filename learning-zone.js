/*********************** Data: 20 quiz questions ***********************/
const QUESTIONS = [
  {q: 'Which tag is used to create a hyperlink in HTML?', opts:['&lt;link&gt;','&lt;a&gt;','&lt;href&gt;','&lt;anchor&gt;'], a:1, topic:'HTML Basics'},
  {q: 'Which attribute is used to give a unique id to an HTML element?', opts:['class','id','data-id','name'], a:1, topic:'HTML Attributes'},
  {q: 'Which CSS property controls the space between lines of text?', opts:['letter-spacing','line-height','text-spacing','word-spacing'], a:1, topic:'CSS Typography'},
  {q: 'How do you make an element flex container?', opts:['display:flex','display:block-flex','flexbox:true','layout:flex'], a:0, topic:'CSS Flexbox'},
  {q: 'Which property is used to change the background color?', opts:['background-color','bgcolor','color-bg','backgroundStyle'], a:0, topic:'CSS Styling'},
  {q: 'Which HTML element is used to include JavaScript?', opts:['&lt;script&gt;','&lt;js&gt;','&lt;scripting&gt;','&lt;javascript&gt;'], a:0, topic:'HTML Scripting'},
  {q: 'How do you write a comment in JavaScript?', opts:['// comment','&lt;!-- comment --&gt;','/* comment */','Both // and /* */'], a:3, topic:'JS Syntax'},
  {q: 'Which method selects an element by its CSS selector?', opts:['getElementById','querySelector','select','findElement'], a:1, topic:'JS DOM'},
  {q: 'What does CSS stand for?', opts:['Cascading Style Sheets','Colorful Style Sheets','Computer Style Sheets','Creative Style Sheets'], a:0, topic:'CSS Basics'},
  {q: 'Which HTML5 element represents self-contained content?', opts:['&lt;section&gt;','&lt;div&gt;','&lt;article&gt;','&lt;component&gt;'], a:2, topic:'HTML5 Semantics'},
  {q: 'Which operator is used for strict equality in JS?', opts:['=','==','===','!=='], a:2, topic:'JS Operators'},
  {q: 'What is the default display of a &lt;div&gt; element?', opts:['inline','block','flex','inline-block'], a:1, topic:'CSS Layout'},
  {q: 'Which CSS unit is relative to the root element font-size?', opts:['px','em','rem','%'], a:2, topic:'CSS Units'},
  {q: 'Which event fires when the user clicks a button?', opts:['onchange','onclick','onhover','onselect'], a:1, topic:'JS Events'},
  {q: 'Which HTTP method is commonly used to request data without changes?', opts:['POST','PUT','GET','DELETE'], a:2, topic:'Web Protocols'},
  {q: 'Which property makes elements stack in a grid layout?', opts:['display:grid','display:flex','grid-stack:true','layout:grid'], a:0, topic:'CSS Grid'},
  {q: 'Which HTML attribute provides alternative text for images?', opts:['title','alt','desc','caption'], a:1, topic:'HTML Accessibility'},
  {q: 'How do you store data locally in the browser (simple key/value)?', opts:['sessionStorage','localStorage','cookies','IndexedDB'], a:1, topic:'Browser Storage'},
  {q: 'Which CSS pseudo-class applies when the mouse is over an element?', opts:[':active',':hover',':focus',':visited'], a:1, topic:'CSS Selectors'},
  {q: 'Which keyword declares a block-scoped variable in modern JS?', opts:['var','let','const','both let & const'], a:3, topic:'JS Variables'}
];

/*********************** App state & helpers ***********************/
const state = {
  mode: 'exam', // 'exam', 'result'
  activeQuestions: [],
  answers: {}, // Map question index -> answer index
  marked: new Set(),
  currentIdx: 0,
  score: null,
  isReviewing: false,
  reviewQueue: []
};

function playClickSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch(e){}
}

// Global switcher for home cards
window.switchTab = function(name){
  const views = {
    home: document.querySelector('[data-view="home"]'),
    notes: document.querySelector('[data-view="notes"]'), 
    quiz: document.querySelector('[data-view="quiz"]'), 
    progress: document.querySelector('[data-view="progress"]')
  };
  Object.keys(views).forEach(k=>{ if(views[k]) views[k].hidden = k!==name });
  if(name==='quiz') renderQuiz();
  if(name==='progress') renderProgress();
}


const quizArea = document.getElementById('quiz-area');
const resetBtn = document.getElementById('reset-quiz');
const scoreEl = document.getElementById('score');

const notesFill = document.getElementById('notes-fill');
const quizFill = document.getElementById('quiz-fill');
const scoreFill = document.getElementById('score-fill');

/*********************** Render quiz ***********************/
function renderQuiz(){
  quizArea.innerHTML = '';
 

  // 2. RESULT SCREEN
  if(state.mode === 'result'){
    const total = state.activeQuestions.length;
    const correct = state.score;
    
    // Analyze weak topics
    const wrongTopics = [];
    state.activeQuestions.forEach((q, idx) => {
      if(state.answers[idx] !== q.a) wrongTopics.push(q.topic);
    });
    const uniqueWeakness = [...new Set(wrongTopics)];

    quizArea.innerHTML = `
      <div style="text-align:center; padding: 20px;">
        <h2>Exam Results</h2>
        <div style="font-size: 48px; font-weight:bold; margin: 20px 0;">${correct} / ${total}</div>
        <div class="progress-bar" style="max-width:300px; margin:0 auto 20px auto"><div class="progress-fill" style="width: ${(correct/total)*100}%"></div></div>
        
        ${uniqueWeakness.length > 0 ? `
          <div style="text-align:left; background:rgba(239,68,68,0.1); padding:16px; border-radius:12px; border:1px solid rgba(239,68,68,0.2); margin-top:20px;">
            <h4 style="margin-top:0; color:#fca5a5">Topics to Review:</h4>
            <ul style="margin:0; padding-left:20px; color:#fca5a5">
              ${uniqueWeakness.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        ` : `<p style="color:#4ade80">Perfect score! You have mastered these topics.</p>`}
        
        <button class="btn" onclick="resetExam()" style="margin-top:24px">Change Topic / New Exam</button>
      </div>
    `;
    return;
  }

  // 3. EXAM MODE (Single Question)
  const q = state.activeQuestions[state.currentIdx] || QUESTIONS[0];
  const isMarked = state.marked.has(state.currentIdx);
  const selectedAns = state.answers[state.currentIdx];

  let isLastStep = false;
  if (state.isReviewing) {
    const qIdx = state.reviewQueue.indexOf(state.currentIdx);
    if (qIdx === state.reviewQueue.length - 1) isLastStep = true;
  } else {
    if (state.currentIdx === state.activeQuestions.length - 1) isLastStep = true;
  }

  const qHTML = `
    <div class="quiz-header">
      <span class="muted">Question ${state.currentIdx + 1} of ${state.activeQuestions.length} ${state.isReviewing ? '(Review Mode)' : ''}</span>
      <div style="display:flex; align-items:center; gap:10px">
        ${isMarked ? '<span style="color:#f59e0b; font-size:12px">★ Marked</span>' : ''}
      </div>
    </div>
    <div class="question">
      <span class="topic-badge">${q.topic}</span>
      <div style="font-size:16px; margin-bottom:12px"><strong>Q${state.currentIdx + 1}.</strong> ${q.q}</div>
      <div class="options" id="opts-container">
        ${q.opts.map((opt, i) => `
          <button class="option ${selectedAns === i ? 'selected' : ''}" 
            onclick="selectAnswer(${i})">${opt}</button>
        `).join('')}
      </div>
    </div>

    <div class="quiz-nav">
      <button class="btn" onclick="prevQuestion()" ${(!state.isReviewing && state.currentIdx === 0) ? 'disabled style="opacity:0.5"' : ''}>← Previous</button>
      <button class="btn review ${isMarked ? 'active' : ''}" onclick="toggleMark()">★ Mark for Review</button>
      ${isLastStep 
        ? '<button class="btn primary" onclick="submitExam()">Submit Exam</button>' 
        : '<button class="btn" onclick="nextQuestion()">Save & Next →</button>'}
    </div>
  `;
  quizArea.innerHTML = qHTML;
}

window.selectAnswer = function(idx){
  state.answers[state.currentIdx] = idx;
  renderQuiz(); // re-render to show selection
}

window.nextQuestion = function(){ 
  if (state.isReviewing) {
    const qIdx = state.reviewQueue.indexOf(state.currentIdx);
    if (qIdx < state.reviewQueue.length - 1) {
      state.currentIdx = state.reviewQueue[qIdx + 1];
    }
  } else {
    state.currentIdx++; 
  }
  renderQuiz(); 
}
window.prevQuestion = function(){ 
  if (state.isReviewing) {
    const qIdx = state.reviewQueue.indexOf(state.currentIdx);
    if (qIdx > 0) {
      state.currentIdx = state.reviewQueue[qIdx - 1];
    } else if(confirm("Exit review mode?")) {
      state.isReviewing = false;
      state.currentIdx = state.activeQuestions.length - 1;
    }
  } else {
    state.currentIdx--; 
  }
  renderQuiz(); 
}
window.toggleMark = function(){ 
  if(state.marked.has(state.currentIdx)) state.marked.delete(state.currentIdx);
  else state.marked.add(state.currentIdx);
  renderQuiz();
}

window.submitExam = function(force){
  const finish = () => {
    let correct = 0;
    state.activeQuestions.forEach((q, i) => {
      if(state.answers[i] === q.a) correct++;
    });
    state.score = correct;
    state.mode = 'result';
    state.isReviewing = false;
    renderQuiz();
    if (correct >= 15) awardBadge('quiz-master');
    saveProgress();
  };

  if(force === true) { finish(); return; }

  if(state.marked.size > 0 && !state.isReviewing){
    if(confirm(`You have ${state.marked.size} marked questions. Review them now?`)){
      state.isReviewing = true;
      state.reviewQueue = Array.from(state.marked).sort((a,b)=>a-b);
      state.currentIdx = state.reviewQueue[0];
      renderQuiz();
      return;
    }
  }

  if(confirm('Are you sure you want to submit?')){
    finish();
  }
}

window.resetExam = function(){
  state.mode = 'exam';
  state.answers = {};
  state.marked = new Set();
  state.currentIdx = 0;
  state.score = null;
  state.isReviewing = false;
  state.reviewQueue = [];
  renderQuiz();
}

/*********************** Persistence ***********************/
function saveProgress(){
  // Simplified persistence for demo
  const toSave = {score: state.score};
  try {
    localStorage.setItem('learning-zone', JSON.stringify(toSave));
  } catch(e){}
  // also update notes progress (simple heuristic: if user scrolled to bottom)
  let notesSeen = false;
  try { notesSeen = localStorage.getItem('notes-seen') === 'true'; } catch(e){}
  notesFill.style.width = notesSeen ? '100%' : '40%';
}
function loadProgress(){
  let raw;
  try { raw = localStorage.getItem('learning-zone'); } catch(e){}
  if(raw){
    try{const parsed = JSON.parse(raw); if(parsed.score!==undefined) state.score = parsed.score;}catch(e){console.warn(e)}
  }
}

/*********************** Tabs & modal behavior ***********************/

// Shared modal
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const modalOk = document.getElementById('modal-ok');

function showModal(title,body,okCb){
  modalTitle.textContent = title; modalBody.textContent = body; modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
  modalOk.onclick = ()=>{ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); if(typeof okCb==='function') okCb(); };
  modalClose.onclick = ()=>{ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); };
}

// side buttons open modal
document.querySelectorAll('[data-popup-title]').forEach(b=>{
  b.addEventListener('click', ()=>{
    const t = b.dataset.popupTitle; const body = b.dataset.popupBody;
    if(b.id === 'danger-reset'){
      showModal(t, body, ()=>{ localStorage.removeItem('learning-zone'); localStorage.removeItem('notes-seen'); state.score = null; resetExam(); renderProgress(); scoreEl.textContent = '—'; alert('Progress reset') });
    } else showModal(t, body);
  });
});

/*********************** Buttons popup animation (micro) ***********************/
// make all .btn show a small popup on click (re-usable)
document.querySelectorAll('.btn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    // for primary actions we don't want the mini peek (submit handled separately)
    if(btn.id==='submit-quiz' || btn.id==='reset-quiz' || btn.id==='modal-ok' || btn.classList.contains('primary')) return;
    // tiny animated tooltip near the button
    const tip = document.createElement('div');
    tip.textContent = btn.innerText + ' ✨';
    tip.style.position='absolute'; tip.style.padding='8px 10px'; tip.style.borderRadius='8px'; tip.style.background='linear-gradient(90deg, rgba(124,58,237,0.14), rgba(6,182,212,0.06))'; tip.style.color='white'; tip.style.fontSize='13px'; tip.style.boxShadow='0 8px 20px rgba(2,6,23,0.5)'; tip.style.transform='translateY(-8px)'; tip.style.transition='opacity .3s, transform .3s'; tip.style.opacity='0'; tip.style.zIndex=1500;
    document.body.appendChild(tip);
    const rect = btn.getBoundingClientRect(); tip.style.left = (rect.left + rect.width/2 - tip.offsetWidth/2) + 'px'; tip.style.top = (rect.top - 44) + 'px';
    requestAnimationFrame(()=>{ tip.style.opacity='1'; tip.style.transform='translateY(0)' });
    setTimeout(()=>{ tip.style.opacity='0'; tip.style.transform='translateY(-6px)'; setTimeout(()=>tip.remove(),290); },1000);
  });
});

/*********************** Progress render ***********************/
function renderProgress(){
  // notes progress: check localStorage flag
  const notesSeen = localStorage.getItem('notes-seen') === 'true';
  notesFill.style.width = notesSeen ? '100%' : '40%';
  if(state.score!==null){ scoreFill.style.width = `${Math.round((state.score/QUESTIONS.length)*100)}%`; scoreEl.textContent = `${state.score}`; }
}

/*********************** Small features: detect when user scrolls notes to bottom ***********/
const notesSection = document.querySelector('[data-view="notes"]');
if (notesSection) {
  notesSection.addEventListener('scroll', ()=>{
    // not necessary on desktop; provide a click to mark as read
  });
}
// Add a floating "Mark notes as read" button
const markBtn = document.createElement('button'); markBtn.className='btn'; markBtn.style.position='fixed'; markBtn.style.right='24px'; markBtn.style.bottom='24px'; markBtn.style.zIndex=1400; markBtn.textContent='Mark notes as read';
document.body.appendChild(markBtn);
markBtn.addEventListener('click', ()=>{ localStorage.setItem('notes-seen','true'); notesFill.style.width='100%'; showModal('Nice!', 'Notes marked as read.'); awardBadge('note-taker'); saveProgress(); });

/*********************** Design toggles ***********************/
document.getElementById('motion-toggle').addEventListener('change', (e)=>{
  if(!e.target.checked){ document.querySelectorAll('.float-shape').forEach(s=>s.style.animation='none'); } else { document.querySelectorAll('.float-shape').forEach(s=>s.style.animation='floaty 6s ease-in-out infinite'); }
});
document.getElementById('compact-toggle').addEventListener('change', (e)=>{
  if(e.target.checked){ document.body.style.fontSize='14px'; document.querySelectorAll('.panel').forEach(p=>p.style.padding='10px'); } else { document.body.style.fontSize='16px'; document.querySelectorAll('.panel').forEach(p=>p.style.padding='18px'); }
});

/*********************** Daily Goal Tracker ***********************/
let studySeconds = 0;
const goalMinutes = parseInt(localStorage.getItem('dailyGoal')) || 60;
const goalDisplay = document.getElementById('study-goal-display');
const timeDisplay = document.getElementById('study-time-display');
const goalFill = document.getElementById('study-goal-fill');

function initTracker() {
  // Check date to reset daily progress
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('study-date');
  
  // Update Streak Display
  const streak = localStorage.getItem('daily-streak') || '0';
  const streakEl = document.getElementById('lz-streak');
  if(streakEl) streakEl.textContent = `🔥 ${streak}`;

  if (lastDate !== today) {
    localStorage.setItem('study-date', today);
    localStorage.setItem('study-minutes', '0');
    studySeconds = 0;
  } else {
    studySeconds = (parseInt(localStorage.getItem('study-minutes')) || 0) * 60;
  }

  if(goalDisplay) goalDisplay.textContent = `/ ${goalMinutes}m`;
  updateTrackerUI();

  // Increment time every second
  setInterval(() => {
    studySeconds++;
    if (studySeconds % 60 === 0) {
      localStorage.setItem('study-minutes', Math.floor(studySeconds / 60));
      updateTrackerUI();
      if (Math.floor(studySeconds / 60) >= goalMinutes) awardBadge('dedicated-learner');
    }
  }, 1000);
}

function updateTrackerUI() {
  const mins = Math.floor(studySeconds / 60);
  if(timeDisplay) timeDisplay.textContent = `${mins}m`;
  if(goalFill) {
    const pct = Math.min((mins / goalMinutes) * 100, 100);
    goalFill.style.width = `${pct}%`;
  }
}

/*********************** Badges System ***********************/
function awardBadge(id) {
  let badges = JSON.parse(localStorage.getItem('user-badges') || '[]');
  if (!badges.includes(id)) {
    badges.push(id);
    localStorage.setItem('user-badges', JSON.stringify(badges));
    // Show notification
    const tip = document.createElement('div');
    tip.innerHTML = `🏆 Badge Unlocked: <b>${id.replace('-', ' ').toUpperCase()}</b>`;
    tip.style.cssText = 'position:fixed; top:20px; right:20px; background:#f59e0b; color:white; padding:12px 20px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.2); z-index:2000; animation: popIn 0.3s;';
    document.body.appendChild(tip);
    setTimeout(()=>tip.remove(), 3000);
    if (typeof triggerConfetti === 'function') triggerConfetti();
  }
}

/*********************** Focus Mode ***********************/
window.toggleFocusMode = function() {
  document.body.classList.toggle('focus-mode');
  const btn = document.getElementById('exit-focus-btn');
  if(document.body.classList.contains('focus-mode')) {
    if(btn) btn.style.display = 'block';
  } else {
    if(btn) btn.style.display = 'none';
  }
};
document.getElementById('focus-mode-btn')?.addEventListener('click', window.toggleFocusMode);

/*********************** Initialization ***********************/
state.activeQuestions = [...QUESTIONS];
loadProgress(); renderQuiz(); renderProgress(); initTracker();

// ensure quiz view rebuilt if user switches back
window.addEventListener('storage', ()=>{ loadProgress(); renderQuiz(); renderProgress(); });

// Accessibility: close modal with ESC
window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); } });

/*********************** PDF Download for Notes ***********************/
window.jsPDF = window.jspdf.jsPDF; // Make jsPDF globally accessible

window.downloadNotesAsPdf = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 15; // Y-coordinate for text

    doc.setFontSize(20);
    doc.text("StudySphere Learning Zone Notes", 10, y);
    y += 10;
    doc.setFontSize(10);
    doc.text("Generated on: " + new Date().toLocaleString(), 10, y);
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30); // Darker text for content

    const notesContainer = document.querySelector('[data-view="notes"]');
    if (notesContainer) {
        // Select relevant content elements, excluding buttons and the main title
        const contentElements = notesContainer.querySelectorAll('.section h3, .note-block p, .note-block ul, .note-block pre');

        contentElements.forEach(element => {
            let text = '';
            let fontSize = 12;
            let textColor = [30, 30, 30]; // Default dark gray
            let isCodeBlock = false;

            if (element.tagName === 'H3') {
                text = element.textContent.trim();
                fontSize = 16;
                textColor = [0, 0, 0]; // Black for headings
            } else if (element.tagName === 'P') {
                text = element.textContent.trim();
                fontSize = 12;
            } else if (element.tagName === 'UL') {
                text = Array.from(element.querySelectorAll('li')).map(li => `  • ${li.textContent.trim()}`).join('\n');
                fontSize = 12;
            } else if (element.tagName === 'PRE') {
                text = element.textContent.trim();
                fontSize = 10;
                textColor = [50, 50, 50]; // Slightly lighter for code
                isCodeBlock = true;
            }

            if (text) {
                doc.setFontSize(fontSize);
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);

                const splitText = doc.splitTextToSize(text, doc.internal.pageSize.width - 20);
                
                // Add new page if content exceeds current page
                if (y + (splitText.length * (fontSize * 0.7)) + (isCodeBlock ? 8 : 4) > doc.internal.pageSize.height - 20) {
                    doc.addPage();
                    y = 15; // Reset Y for new page
                    doc.setFontSize(10);
                    doc.setTextColor(150, 150, 150);
                    doc.text("Continued...", doc.internal.pageSize.width - 40, 10);
                    doc.setFontSize(fontSize); // Reset to current content font size
                    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                }

                if (isCodeBlock) {
                    // Add a light background for code blocks
                    const textHeight = splitText.length * (fontSize * 0.7); // Approximate line height
                    doc.setFillColor(245, 245, 245); // Light gray background
                    doc.rect(10, y - 2, doc.internal.pageSize.width - 20, textHeight + 4, 'F'); // Add padding
                    doc.text(splitText, 12, y + 2); // Indent code slightly
                    y += textHeight + 8; // Add extra space after code block
                } else {
                    doc.text(splitText, 10, y);
                    y += (splitText.length * (fontSize * 0.7)) + 4; // Line height + small gap
                }
            }
        });
    }

    doc.save("StudySphere_Notes.pdf");
    showModal('Download Complete!', 'Your notes have been downloaded as a PDF.');
};

// Accessibility: close modal with ESC
window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); } });

/*********************** AI Note-to-Podcast ***********************/
window.playNotesAsPodcast = function() {
    if ('speechSynthesis' in window) {
        // If speaking, stop it.
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            showModal('Podcast Stopped', 'The audio summary has been stopped.');
            return;
        }

        let fullText = "Notes Summary. ";
        document.querySelectorAll('.notes .section').forEach(section => {
            const title = section.querySelector('h3');
            const content = section.querySelector('.note-block');
            if (title) fullText += title.textContent + ". ";
            if (content) {
                content.querySelectorAll('p, li').forEach(p => {
                    fullText += p.textContent + ". ";
                });
            }
        });

        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;

        utterance.onstart = () => {
            showModal('Podcast Playing', 'Listening to AI-generated summary of your notes. Click the button again to stop.');
        };

        window.speechSynthesis.speak(utterance);

    } else {
        alert("Sorry, your browser does not support Text-to-Speech.");
    }
};