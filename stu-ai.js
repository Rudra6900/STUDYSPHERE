document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatWindow = document.getElementById('chat-window');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');
    const micBtn = document.getElementById('mic-btn');
    const stopGenContainer = document.getElementById('stop-gen-container');
    const stopGenBtn = document.getElementById('stop-gen-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatListEl = document.getElementById('chat-list');

    // --- API CONFIGURATION (Fix for Connection Error) ---
    const getApiBase = () => {
        if (window.location.port === '5500' || window.location.port === '5501') return 'http://localhost/practice/';
        if (window.location.protocol === 'file:') return 'http://localhost/practice/';
        return '';
    };
    const API_BASE = getApiBase();
    console.log('STU AI connected to:', API_BASE || 'Relative Path');

    // --- MULTIPLE CHAT SESSION MANAGEMENT ---
    let sessions = JSON.parse(localStorage.getItem('stu-ai-sessions') || '[]');
    let currentSessionId = localStorage.getItem('stu-ai-current-id');
    let chatHistory = [];

    // Migration: If old history exists but no sessions, create one
    if (sessions.length === 0 && localStorage.getItem('stu-ai-history')) {
        const oldHistory = JSON.parse(localStorage.getItem('stu-ai-history'));
        if (oldHistory.length > 0) {
            const id = Date.now().toString();
            sessions.push({ id: id, title: 'Previous Chat', messages: oldHistory });
            currentSessionId = id;
            localStorage.removeItem('stu-ai-history'); // Cleanup
        }
    }

    // Initialize if empty
    if (sessions.length === 0) {
        createNewSession();
    } else {
        // Validate current ID
        if (!sessions.find(s => s.id === currentSessionId)) {
            currentSessionId = sessions[0].id;
        }
        loadChat(currentSessionId);
    }

    function createNewSession() {
        const id = Date.now().toString();
        const newSession = {
            id: id,
            title: 'New Chat',
            messages: []
        };
        sessions.unshift(newSession);
        loadChat(id);
    }

    function loadChat(id) {
        currentSessionId = id;
        localStorage.setItem('stu-ai-current-id', currentSessionId);
        const session = sessions.find(s => s.id === id);
        chatHistory = session ? session.messages : [];
        
        // Update Title UI
        const titleEl = document.getElementById('current-chat-title');
        if(titleEl) titleEl.textContent = session ? session.title : 'Chat';

        saveSessions();
        renderHistory();
        renderChatList();
    }

    function saveSessions() {
        // Update current session messages in the main array
        const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
        if (sessionIndex !== -1) {
            sessions[sessionIndex].messages = chatHistory;
            // Auto-title: If title is "New Chat" and we have a user message, use it
            if (sessions[sessionIndex].title === 'New Chat') {
                const firstUserMsg = chatHistory.find(m => m.sender === 'user');
                if (firstUserMsg) {
                    sessions[sessionIndex].title = firstUserMsg.text.substring(0, 25) + (firstUserMsg.text.length > 25 ? '...' : '');
                }
            }
        }
        localStorage.setItem('stu-ai-sessions', JSON.stringify(sessions));
    }

    function addMessage(text, sender, save = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        const avatar = sender === 'bot' ? 'AI' : 'U';
        
        msgDiv.innerHTML = `
            <div class="msg-avatar">${avatar}</div>
            <div class="msg-bubble">${text}</div>
        `;
        
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Apply Syntax Highlighting to Code Blocks
        msgDiv.querySelectorAll('pre code').forEach((block) => {
            if(window.hljs) hljs.highlightElement(block);
        });

        // Add Copy Button to Code Blocks
        msgDiv.querySelectorAll('pre').forEach(pre => {
            if (pre.querySelector('.copy-btn')) return;
            
            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px">content_copy</span>';
            btn.title = 'Copy Code';
            
            btn.addEventListener('click', () => {
                // Clone to avoid copying the button text itself
                const clone = pre.cloneNode(true);
                const existingBtn = clone.querySelector('.copy-btn');
                if(existingBtn) existingBtn.remove();
                
                const code = clone.querySelector('code') ? clone.querySelector('code').innerText : clone.innerText;
                navigator.clipboard.writeText(code).then(() => {
                    btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px">check</span>';
                    setTimeout(() => { btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px">content_copy</span>'; }, 2000);
                });
            });
            pre.appendChild(btn);
        });

        // Add Actions for Bot Messages (TTS, Regenerate)
        if (sender === 'bot') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'msg-actions';
            
            // Text-to-Speech Button
            const ttsBtn = document.createElement('button');
            ttsBtn.className = 'msg-action-btn';
            ttsBtn.innerHTML = '<span class="material-symbols-rounded">volume_up</span>';
            ttsBtn.title = 'Read Aloud';
            ttsBtn.onclick = () => {
                const speech = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, '')); // Strip HTML tags
                window.speechSynthesis.cancel(); // Stop previous
                window.speechSynthesis.speak(speech);
            };
            actionsDiv.appendChild(ttsBtn);

            // Regenerate Button
            const regenBtn = document.createElement('button');
            regenBtn.className = 'msg-action-btn regenerate-btn';
            regenBtn.innerHTML = '<span class="material-symbols-rounded">refresh</span>';
            regenBtn.title = 'Regenerate Response';
            regenBtn.onclick = () => {
                // Remove current message from DOM and History
                msgDiv.remove();
                if(chatHistory.length > 0 && chatHistory[chatHistory.length-1].text === text) {
                    chatHistory.pop();
                    saveSessions();
                }
                // Trigger generation with last user message
                const lastMsg = chatHistory[chatHistory.length - 1];
                if (lastMsg && lastMsg.sender === 'user') {
                    generateResponse(lastMsg.text);
                }
            };
            actionsDiv.appendChild(regenBtn);
            msgDiv.appendChild(actionsDiv);

            // Update latest-bot class
            document.querySelectorAll('.message.bot').forEach(el => el.classList.remove('latest-bot'));
            msgDiv.classList.add('latest-bot');
        }

        if (save) {
            chatHistory.push({ text, sender });
            saveSessions();
        }
    }

    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="msg-avatar">AI</div>
            <div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
        `;
        chatWindow.appendChild(typingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById('typing-indicator');
        if(el) el.remove();
    }

    let controller; // For aborting requests

    async function generateResponse(text) {
        showTyping();
        if(stopGenContainer) stopGenContainer.style.display = 'flex';
        
        // Cancel previous request if active
        if (controller) controller.abort();
        controller = new AbortController();

        // Prepare History for Context (Strip HTML tags for cleaner AI context)
        const historyPayload = chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text.replace(/<[^>]*>?/gm, '') }]
        }));

        try {
            const response = await fetch(API_BASE + 'chat_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text,
                    history: historyPayload 
                }),
                signal: controller.signal
            });

            const textResponse = await response.text();
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (e) {
                console.error("Invalid JSON:", textResponse);
                throw new Error("Server returned invalid JSON. Check console for details.");
            }

            removeTyping();
            if(stopGenContainer) stopGenContainer.style.display = 'none';

            addMessage(data.reply || "I couldn't generate a response.", 'bot');
        } catch (error) {
            if (error.name !== 'AbortError') {
                removeTyping();
                if(stopGenContainer) stopGenContainer.style.display = 'none';
                addMessage(`Error: ${error.message || "Connection failed"}. Check API Key in chat_api.php`, 'bot');
            }
        }
    }

    if(stopGenBtn) {
        stopGenBtn.addEventListener('click', () => {
            if (controller) controller.abort();
            removeTyping();
            if(stopGenContainer) stopGenContainer.style.display = 'none';
        });
    }

    function handleSend() {
        const text = input.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        input.value = '';
        generateResponse(text);
    }

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // --- RENDER SIDEBAR LIST ---
    function renderChatList() {
        if(!chatListEl) return;
        chatListEl.innerHTML = '';
        sessions.forEach(session => {
            const div = document.createElement('div');
            div.className = `chat-item ${session.id === currentSessionId ? 'active' : ''}`;
            div.innerHTML = `
                <span class="chat-item-title">${session.title}</span>
                <span class="material-symbols-rounded delete-chat-icon" style="font-size:16px; color:#ef4444;" title="Delete">delete</span>
            `;
            
            // Click to load
            div.addEventListener('click', (e) => {
                if(e.target.classList.contains('delete-chat-icon') || e.target.innerText === 'delete') return;
                loadChat(session.id);
            });

            // Delete button
            const delBtn = div.querySelector('.delete-chat-icon');
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if(confirm('Delete this chat?')) {
                    sessions = sessions.filter(s => s.id !== session.id);
                    if(sessions.length === 0) createNewSession();
                    else if(session.id === currentSessionId) loadChat(sessions[0].id);
                    else { saveSessions(); renderChatList(); }
                }
            });
            chatListEl.appendChild(div);
        });
    }

    // Render History on Load
    function renderHistory() {
        chatWindow.innerHTML = '';
        if (chatHistory.length === 0) {
            addMessage("Hello! I'm STU, your AI study assistant. How can I help you with your coursework today?", 'bot');
        } else {
            chatHistory.forEach(msg => addMessage(msg.text, msg.sender, false));
        }
        // Ensure latest-bot class is applied after rendering history
        const botMsgs = chatWindow.querySelectorAll('.message.bot');
        if(botMsgs.length > 0) botMsgs[botMsgs.length - 1].classList.add('latest-bot');
    }
    
    // New Chat Button
    if(newChatBtn) {
        newChatBtn.addEventListener('click', createNewSession);
    }

    // Clear Chat
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the chat history?')) {
                chatHistory = [];
                renderHistory();
            }
        });
    }

    // Download Chat
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (chatHistory.length === 0) return alert('No chat history to download.');
            const content = chatHistory.map(msg => `[${msg.sender.toUpperCase()}] ${msg.text}`).join('\n\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stu-ai-chat.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Voice Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && micBtn) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        micBtn.addEventListener('click', () => {
            if (micBtn.classList.contains('listening')) recognition.stop();
            else recognition.start();
        });

        recognition.onstart = () => { micBtn.classList.add('listening'); };
        recognition.onend = () => { micBtn.classList.remove('listening'); };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            input.focus();
        };
    } else if (micBtn) {
        micBtn.style.display = 'none';
    }
});