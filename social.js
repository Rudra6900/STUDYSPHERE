<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>StudySphere Social</title>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="all.css" />
  <link rel="stylesheet" href="social.css" />
  <script src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js" defer></script>
  <style>
    /* Consistent Bottom Menu Style */
    .menu {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 12px 30px;
        border-radius: 50px;
        display: flex;
        gap: clamp(20px, 4vw, 40px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        width: auto;
        min-width: 300px;
        justify-content: center;
    }
    .link .link-icon { font-family: 'Material Symbols Rounded'; font-size: 24px; }
    body { padding-bottom: 100px; }
  </style>
</head>
<body>
  <header>
    <h1>👥 Social Hub</h1>
    <div class="streak-counter" style="position:absolute; right:20px; top:20px; background:rgba(255,255,255,0.2); padding:6px 12px; border-radius:20px; font-weight:bold; color:white; backdrop-filter:blur(4px);">🔥 0</div>
  </header>

  <div class="floating-bg">
      <box-icon name='book-open' color="white" class="float-item" style="top: 15%; left: 10%; width: 80px; height: 80px; animation-duration: 25s;"></box-icon>
      <box-icon name='graduation' type='solid' color="white" class="float-item" style="top: 75%; left: 85%; width: 120px; height: 120px; animation-duration: 30s; animation-delay: -5s;"></box-icon>
      <box-icon name='brain' type='solid' color="white" class="float-item" style="top: 45%; left: 45%; width: 60px; height: 60px; animation-duration: 20s; animation-delay: -10s;"></box-icon>
      <box-icon name='pencil' type='solid' color="white" class="float-item" style="top: 85%; left: 15%; width: 100px; height: 100px; animation-duration: 22s; animation-delay: -2s;"></box-icon>
      <box-icon name='calculator' type='solid' color="white" class="float-item" style="top: 25%; left: 90%; width: 70px; height: 70px; animation-duration: 28s; animation-delay: -8s;"></box-icon>
      <box-icon name='bulb' type='solid' color="white" class="float-item" style="top: 10%; left: 50%; width: 50px; height: 50px; animation-duration: 18s; animation-delay: -15s;"></box-icon>
  </div>

  <div class="social-container">
    <!-- Left Sidebar: Profile & Groups -->
    <aside class="social-sidebar">
        <div class="card">
            <h3>My Groups</h3>
            <ul style="list-style:none; padding:0; color:var(--muted);">
                <li style="padding:8px 0; border-bottom:1px solid var(--border); cursor:pointer; transition:0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color=''" onclick="openGroupModal('Web Dev Study')">📚 Web Dev Study</li>
                <li style="padding:8px 0; border-bottom:1px solid var(--border); cursor:pointer; transition:0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color=''" onclick="openGroupModal('Calculus 101')">🧮 Calculus 101</li>
                <li style="padding:8px 0; cursor:pointer; transition:0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color=''" onclick="openGroupModal('UI/Design')">🎨 UI/Design</li>
            </ul>
        </div>
    </aside>

    <!-- Center: Feed -->
    <main class="feed">
        <!--Create Post-->
        <div class="post-card create-post">
            <textarea id="post-text" placeholder="Share something with your peers..." style="width:100%; border:1px solid var(--border); background:rgba(0,0,0,0.05); color:var(--text); border-radius:12px; padding:14px; font-family:inherit; resize:vertical; min-height:80px; outline:none;"></textarea>
            <div id="image-preview-container" style="display:none; margin-top:10px; position:relative;">
                <img id="image-preview" src="" alt="Preview" style="max-width:100%; border-radius:8px; max-height:300px; object-fit:cover;">
                <button id="remove-image-btn" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.6); color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">&times;</button>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <input type="file" id="post-image-input" accept="image/*" style="display:none;">
                <button id="upload-trigger-btn" class="action-btn" style="color:var(--accent); font-size:14px;">
                    <span class="material-symbols-rounded">add_photo_alternate</span> Photo
                </button>
                <button id="post-btn" style="background:var(--accent); color:white; border:none; padding:8px 24px; border-radius:8px; cursor:pointer; font-weight:500;">Post</button>
            </div>
        </div>

        <!-- Feed Post 1 -->
        <div class="post-card">
            <div class="post-header">
                <div class="avatar" style="background:#10b981">NV</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">Neha Verma</div>
                    <div style="font-size:12px; color:var(--muted)">2 hours ago</div>
                </div>
            </div>
            <p class="post-content">Just finished the HTML/CSS module! The flexbox quiz was tricky but I finally got 100%. Anyone want to study Grid together?</p>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">12</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
            <!-- Comment Section -->
            <div class="comments-section" style="display:none;">
                <div class="comment-list">
                    <!-- No comments yet -->
                </div>
                <div class="comment-input-area">
                    <div class="avatar" style="width:32px; height:32px; font-size:14px;">U</div>
                    <input type="text" placeholder="Write a comment..." class="comment-input">
                </div>
            </div>
        </div>

        <!-- Feed Post 2 (Image) -->
        <div class="post-card">
           <div class="post-header">
          <div class="avatar avatar-color-2">AK</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">Amit Kumar</div>
                    <div style="font-size:12px; color:var(--muted)">4 hours ago</div>
                </div>
            </div>
            <p class="post-content">My study setup for the finals! ☕📚 #grind #coffee</p>
            <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=60" class="post-media" alt="Study Setup">
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">45</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
            <!-- Comment Section -->
            <div class="comments-section" style="display:none;">
                <div class="comment-list">
                    <div class="comment">
                        <div class="comment-avatar">AR</div>
                        <div class="comment-bubble"><strong>Arjun:</strong> Nice setup! Where did you get that lamp?</div>
                    </div>
                </div>
                <div class="comment-input-area">
                    <div class="avatar" style="width:32px; height:32px; font-size:14px;">U</div>
                    <input type="text" placeholder="Write a comment..." class="comment-input">
                </div>
            </div>
        </div>

        <!-- Feed Post 3 (Video) -->
        <div class="post-card">
            <div class="post-header">
          <div class="avatar avatar-color-3">SG</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">Sneha Gupta</div>
                    <div style="font-size:12px; color:var(--muted)">6 hours ago</div>
                </div>
            </div>
            <p class="post-content">Found this cool animation trick in CSS. Check it out!</p>
            <video controls class="post-media" poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60">
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">89</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
            <!-- Comment Section -->
            <div class="comments-section" style="display:none;">
                <div class="comment-list">
                    <!-- No comments yet -->
                </div>
                <div class="comment-input-area">
                    <div class="avatar" style="width:32px; height:32px; font-size:14px;">U</div>
                    <input type="text" placeholder="Write a comment..." class="comment-input">
                </div>
            </div>
        </div>

        <!-- Feed Post 4 (Poll) -->
        <div class="post-card">
            <div class="post-header">
          <div class="avatar avatar-color-4">PS</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">Pooja Sharma</div>
                    <div style="font-size:12px; color:var(--muted)">8 hours ago</div>
                </div>
            </div>
            <p class="post-content">Which framework should I learn next? 🤔</p>
            <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
                <div style="background:rgba(0,0,0,0.05); border:1px solid var(--border); padding:10px 16px; border-radius:8px; cursor:pointer; position:relative; overflow:hidden;">
                    <div style="position:absolute; left:0; top:0; bottom:0; width:70%; background:rgba(59, 130, 246, 0.1);"></div>
                    <div style="position:relative; display:flex; justify-content:space-between; font-size:14px; font-weight:500; color:var(--text);"><span>React</span> <span>70%</span></div>
                </div>
                <div style="background:rgba(0,0,0,0.05); border:1px solid var(--border); padding:10px 16px; border-radius:8px; cursor:pointer; position:relative; overflow:hidden;">
                    <div style="position:absolute; left:0; top:0; bottom:0; width:30%; background:rgba(59, 130, 246, 0.1);"></div>
                    <div style="position:relative; display:flex; justify-content:space-between; font-size:14px; font-weight:500; color:var(--text);"><span>Vue</span> <span>30%</span></div>
                </div>
            </div>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">24</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
        </div>

        <!-- Feed Post 5 (Code Snippet) -->
        <div class="post-card">
           <div class="post-header">
          <div class="avatar avatar-color-5">VS</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">Vikram Singh</div>
                    <div style="font-size:12px; color:var(--muted)">12 hours ago</div>
                </div>
            </div>
            <p class="post-content">Finally understood JavaScript closures! Here is a simple example:</p>
            <pre style="background:rgba(0,0,0,0.2); color:var(--text); padding:16px; border-radius:12px; font-family:monospace; font-size:13px; overflow-x:auto; margin-top:12px;">function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}</pre>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">56</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
        </div>

        <!-- Feed Post 6 (Study Group) -->
        <div class="post-card">
            <div class="post-header">
            <div class="avatar avatar-color-6">RD</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">Rohan Das</div>
                    <div style="font-size:12px; color:var(--muted)">14 hours ago</div>
                </div>
            </div>
            <p class="post-content">Anyone struggling with Calculus II? I'm forming a study group for the upcoming midterm. We meet on Discord every evening at 7 PM. Let me know if you want to join! 📉📈</p>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">18</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
        </div>

        <!-- Feed Post 7 (Motivation) -->
        <div class="post-card">
            <div class="post-header">
            <div class="avatar avatar-color-1">AD</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">Anjali Desai</div>
                    <div style="font-size:12px; color:var(--muted)">1 day ago</div>
                </div>
            </div>
            <p class="post-content">"Success is the sum of small efforts, repeated day in and day out." - Robert Collier. Keep pushing everyone! 💪✨</p>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">142</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
        </div>

        <!-- Feed Post 8 (Resource Share) -->
        <div class="post-card">
            <div class="post-header">
            <div class="avatar avatar-color-7">KM</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">Karan Malhotra</div>
                    <div style="font-size:12px; color:var(--muted)">1 day ago</div>
                </div>
            </div>
            <p class="post-content">Just found this amazing cheat sheet for Python Data Science libraries (Pandas, NumPy, Matplotlib). Highly recommend bookmarking it!</p>
            <div style="background:rgba(0,0,0,0.05); border:1px solid var(--border); border-radius:12px; padding:15px; margin-top:10px; display:flex; align-items:center; gap:15px; cursor:pointer;">
                <div style="width:50px; height:50px; background:#e0e7ff; border-radius:8px; display:grid; place-items:center; color:#4338ca; font-weight:bold;">PDF</div>
                <div>
                    <div style="font-weight:600; color:var(--text);">Python_DS_Cheatsheet.pdf</div>
                    <div style="font-size:12px; color:var(--muted);">2.4 MB • PDF Document</div>
                </div>
                <span class="material-symbols-rounded" style="margin-left:auto; color:var(--muted);">download</span>
            </div>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">67</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
        </div>

        <!-- Feed Post 9 (Question with multiple choice) -->
        <div class="post-card">
            <div class="post-header">
            <div class="avatar avatar-color-8">RV</div>
        <div class="container-cb">
                    <div style="font-weight:600; color:var(--text)">Ravi Verma</div>
                    <div style="font-size:12px; color:var(--muted)">2 days ago</div>
                </div>
            </div>
            <p class="post-content">What's your favorite code editor?</p>
            <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
                <div style="background:rgba(0,0,0,0.05); border:1px solid var(--border); padding:10px 16px; border-radius:8px; cursor:pointer; position:relative; overflow:hidden; transition:background 0.2s;">
                    <div style="position:relative; display:flex; justify-content:space-between; font-size:14px; font-weight:500; color:var(--text);"><span>VS Code</span></div>
                </div>
                <div style="background:rgba(0,0,0,0.05); border:1px solid var(--border); padding:10px 16px; border-radius:8px; cursor:pointer; position:relative; overflow:hidden; transition:background 0.2s;">
                    <div style="position:relative; display:flex; justify-content:space-between; font-size:14px; font-weight:500; color:var(--text);"><span>Sublime Text</span></div>
                </div>
                <div style="background:rgba(0,0,0,0.05); border:1px solid var(--border); padding:10px 16px; border-radius:8px; cursor:pointer; position:relative; overflow:hidden; transition:background 0.2s;">
                    <div style="position:relative; display:flex; justify-content:space-between; font-size:14px; font-weight:500; color:var(--text);"><span>Atom</span></div>
                </div>
            </div>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">33</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
        </div>

        <!-- Feed Post 10 (Job Opportunity) -->
        <div class="post-card">
            <div class="post-header">
            <div class="avatar avatar-jobs">Jobs</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">StudySphere Careers</div>
                    <div style="font-size:12px; color:var(--muted)">3 days ago</div>
                </div>
            </div>
            <p class="post-content">We're hiring a Front-End Developer! Check out the job description and apply:</p>
            <div style="background:rgba(0,0,0,0.05); border:1px solid var(--border); border-radius:12px; padding:15px; margin-top:10px; display:flex; align-items:center; gap:15px; cursor:pointer;">
                <div style="width:50px; height:50px; background:#cffafe; border-radius:8px; display:grid; place-items:center; color:#06b6d4; font-weight:bold;">
                    <span class="material-symbols-rounded">work</span>
                </div>
                <div>
                    <div style="font-weight:600; color:var(--text);">Front-End Developer</div>
                    <div style="font-size:12px; color:var(--muted);">StudySphere • Full-time</div>
                </div>
                <span class="material-symbols-rounded" style="margin-left:auto; color:var(--muted);">open_in_new</span>
            </div>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">91</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
        </div>

        <!-- Feed Post 11 (Achievement Share) -->
        <div class="post-card">
            <div class="post-header">
            <div class="avatar avatar-color-9">RS</div>
                <div>
                    <div style="font-weight:600; color:var(--text)">Rahul Sharma</div>
                    <div style="font-size:12px; color:var(--muted)">4 days ago</div>
                </div>
            </div>
            <p class="post-content">Just earned the "Quiz Master" badge! 🏆 Feeling good about my progress. #StudySphere #QuizMaster</p>
            <div style="background:rgba(0,0,0,0.05); border:1px solid var(--border); border-radius:12px; padding:15px; margin-top:10px; display:flex; align-items:center; gap:15px;">
                <div style="width:50px; height:50px; background:#fef08a; border-radius:8px; display:grid; place-items:center; color:#854d0e; font-size:1.4rem;">🏆</div>
                <div>
                    <div style="font-weight:600; color:var(--text);">Quiz Master</div>
                    <div style="font-size:12px; color:var(--muted);">Reached 100% on 3 quizzes</div>
                </div>
            </div>
            <div class="post-actions">
                <button class="action-btn"><span class="material-symbols-rounded">thumb_up</span> <span class="like-count">109</span> Likes</button>
                <button class="action-btn"><span class="material-symbols-rounded">comment</span> Comment</button>
                <button class="action-btn"><span class="material-symbols-rounded">share</span> Share</button>
            </div>
        </div>
    </main>

    <!-- Right Sidebar: Trending -->
    <aside class="social-sidebar">
        <div class="card">
            <h3>Trending Topics</h3>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
                <span style="background:rgba(255,255,255,0.1); padding:6px 12px; border-radius:20px; font-size:13px; color:var(--muted)">#javascript</span>
                <span style="background:rgba(255,255,255,0.1); padding:6px 12px; border-radius:20px; font-size:13px; color:var(--muted)">#exams</span>
                <span style="background:rgba(255,255,255,0.1); padding:6px 12px; border-radius:20px; font-size:13px; color:var(--muted)">#studyhacks</span>
            </div>
        </div>
    </aside>
  </div>

  <!-- MODAL: STUDY GROUP (Copied from front.html to enable chats here) -->
  <div id="group-modal" class="modal" style="display:none; position:fixed; z-index:2000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.7); backdrop-filter:blur(5px);">
      <div class="modal-content" id="group-modal-content" style="background:#1e293b; max-width: 800px; height: 600px; display: flex; flex-direction: column; padding: 0; overflow: hidden; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius:16px; border:1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.6);">
        <div id="group-modal-header" style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: #0f172a;">
            <h2 id="group-modal-title" style="margin:0; color:white; font-size: 1.5rem;">Study Group</h2>
            <div style="display:flex; align-items:center; gap:15px;">
                <button class="btn" style="background:#10b981; padding:8px 16px; font-size:0.85rem; border:none; color:white; display:flex; align-items:center; gap:6px; border-radius:20px; cursor:pointer;">
                    <i class='bx bxs-phone'></i> Join Voice
                </button>
                <span class="close-modal" onclick="closeGroupModal()" style="font-size:28px; color:#94a3b8; cursor:pointer;">&times;</span>
            </div>
        </div>
        
        <div style="flex: 1; display: flex; overflow: hidden;">
            <!-- Sidebar -->
            <div style="width: 250px; border-right: 1px solid rgba(255,255,255,0.1); padding: 20px; background: rgba(0,0,0,0.2); display: flex; flex-direction: column;">
                <h4 style="color:#94a3b8; margin-top:0; margin-bottom: 15px;">Members (3)</h4>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                    <div style="width:32px; height:32px; background:#3b82f6; border-radius:50%; display:grid; place-items:center; color:white; font-weight:bold;">Y</div>
                    <span style="color:white;">You</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                    <div style="width:32px; height:32px; background:#10b981; border-radius:50%; display:grid; place-items:center; color:white; font-weight:bold;">RS</div>
                    <span style="color:white;">Rahul Sharma</span>
                    <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-left: auto;"></span>
                </div>
                <button class="btn" style="width:100%; margin-top:auto; padding:10px; background:rgba(255,255,255,0.1); border:none; color:white; border-radius:8px; cursor:pointer;">Invite Friend</button>
            </div>

            <!-- Chat Area -->
            <div style="flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.1);">
                <div id="group-chat-msgs" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
                    <div style="align-self: flex-start; max-width: 80%;">
                        <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">Rahul Sharma</div>
                        <div style="background: rgba(255,255,255,0.05); padding: 10px 15px; border-radius: 12px; border-bottom-left-radius: 4px; color: white; line-height: 1.4; border:1px solid rgba(255,255,255,0.1);">
                            Hey! Ready for the study session?
                        </div>
                    </div>
                </div>
                <div style="padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px; background: #0f172a;">
                    <input type="text" id="group-chat-input" placeholder="Type a message..." style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; color: white; outline: none;">
                    <button class="btn" onclick="sendGroupMessage()" style="padding: 0 20px; background:#3b82f6; border:none; color:white; border-radius:8px; cursor:pointer;">Send</button>
                </div>
            </div>
        </div>
      </div>
  </div>

  <!-- Navigation Menu -->
  <nav class="menu" role="navigation" aria-label="Main Menu">
    <a href="front.html" class="link"><span class="link-icon">dashboard</span><span class="link-title">Dashboard</span></a>
    <a href="classes.html" class="link"><span class="link-icon">live_tv</span><span class="link-title">Classes</span></a>
    <a href="#" class="link active"><span class="link-icon">group</span><span class="link-title">Social</span></a>
    <a href="stu-ai.html" class="link"><span class="link-icon">smart_toy</span><span class="link-title">STU AI</span></a>
    <a href="settings.html" class="link"><span class="link-icon">settings</span><span class="link-title">Settings</span></a>
  </nav>
  <script src="jsss.js?v=3.0"></script>
  <script src="social.js?v=3.0"></script>
</body>






</html>