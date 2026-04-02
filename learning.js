const FLASHCARDS = [
    { term: 'HTML', def: 'Standard markup language for documents designed to be displayed in a web browser.' },
    { term: 'CSS', def: 'Style sheet language used for describing the presentation of a document written in a markup language.' },
    { term: 'JavaScript', def: 'Programming language that conforms to the ECMAScript specification.' },
    { term: 'DOM', def: 'Document Object Model - a cross-platform and language-independent interface that treats an XML or HTML document as a tree structure.' },
    { term: 'API', def: 'Application Programming Interface - a connection between computers or between computer programs.' }
];

let currentCardIdx = 0;
let flipCount = 0;

/* Flashcard Logic */
function renderFlashcard() {
    const card = FLASHCARDS[currentCardIdx];
    // Reset flip state
    document.getElementById('flashcard-inner').style.transform = 'rotateY(0deg)';
    
    // Update content (delayed slightly if flipping back to avoid seeing change)
    setTimeout(() => {
        document.getElementById('fc-front').textContent = card.term;
        document.getElementById('fc-back').textContent = card.def;
        document.getElementById('fc-progress').textContent = `${currentCardIdx + 1} / ${FLASHCARDS.length}`;
    }, 200);
}

function flipCard() {
    const inner = document.getElementById('flashcard-inner');
    const current = inner.style.transform;
    inner.style.transform = current === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)';

    flipCount++;
    const countEl = document.getElementById('fc-flip-count');
    if (countEl) countEl.textContent = `Flips: ${flipCount}`;
}

function nextCard() {
    if (currentCardIdx < FLASHCARDS.length - 1) { currentCardIdx++; renderFlashcard(); }
}

function prevCard() {
    if (currentCardIdx > 0) { currentCardIdx--; renderFlashcard(); }
}

function exitFlashcards() {
    if (typeof window.switchTab === 'function') {
        window.switchTab('home');
    } else {
        window.location.href = 'front.html';
    }
}

function shuffleFlashcards() {
    for (let i = FLASHCARDS.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [FLASHCARDS[i], FLASHCARDS[j]] = [FLASHCARDS[j], FLASHCARDS[i]];
    }
    currentCardIdx = 0;
    renderFlashcard();
}

// Inject Back Button dynamically
const fcContainer = document.getElementById('flashcard-inner');
if (fcContainer && fcContainer.parentNode && !document.getElementById('fc-exit-btn')) {
    const btn = document.createElement('button');
    btn.id = 'fc-exit-btn';
    btn.className = 'btn';
    btn.innerHTML = '← Back';
    btn.style.cssText = 'margin-bottom: 20px; display: inline-block; cursor: pointer; margin-right: 10px;';
    btn.onclick = exitFlashcards;
    fcContainer.parentNode.insertBefore(btn, fcContainer);
}

// Inject Shuffle Button
if (fcContainer && fcContainer.parentNode && !document.getElementById('fc-shuffle-btn')) {
    const btn = document.createElement('button');
    btn.id = 'fc-shuffle-btn';
    btn.className = 'btn';
    btn.innerHTML = '🔀 Shuffle';
    btn.style.cssText = 'margin-bottom: 20px; display: inline-block; cursor: pointer; background: linear-gradient(135deg, #8b5cf6, #6d28d9); border: none;';
    btn.onclick = shuffleFlashcards;
    fcContainer.parentNode.insertBefore(btn, fcContainer);
}

// Inject Flip Counter
if (fcContainer && fcContainer.parentNode && !document.getElementById('fc-flip-count')) {
    const span = document.createElement('span');
    span.id = 'fc-flip-count';
    span.style.cssText = 'margin-left: 15px; font-weight: bold; color: #94a3b8; font-size: 0.9rem; vertical-align: middle; display: inline-block; margin-bottom: 20px;';
    span.textContent = 'Flips: 0';
    fcContainer.parentNode.insertBefore(span, fcContainer);
}

// Initialize Flashcards on load
renderFlashcard();