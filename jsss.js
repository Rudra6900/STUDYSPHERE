  // --- NAVIGATION FUNCTIONS ---
  function quiz() {
    window.location.href = 'Learning Zone — Notes · Quiz · Progress.html';
}

function social() {
    window.location.href = 'social.html';
}

function stuai() {
    window.location.href = 'stu-ai.html';
}

function settings() {
    window.location.href = 'settings.html';
}

// --- MENU HOVER EFFECTS ---
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const menu = document.querySelector('.menu');
        if (!menu) return;
        const links = Array.from(menu.querySelectorAll('.link'));
        const originalActive = menu.querySelector('.link.active');

        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                // mark hovered link
                link.classList.add('hovered');
                // if hovering a different link, collapse the original active
                if (originalActive && originalActive !== link) {
                    originalActive.classList.remove('active');
                }
            });

            link.addEventListener('mouseleave', () => {
                // remove hovered mark
                link.classList.remove('hovered');
                // if no other link is hovered, restore original active
                const anyHovered = links.some(l => l.classList.contains('hovered'));
                if (!anyHovered && originalActive) {
                    originalActive.classList.add('active');
                }
            });
        });

        // --- DAILY STREAK TRACKING ---
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem('last-login-date');
        let streak = parseInt(localStorage.getItem('daily-streak') || '0');

        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Increment if logged in yesterday, otherwise reset (unless it's a new user)
            if (lastLogin === yesterday.toDateString()) {
                streak++;
            } else if (lastLogin) {
                streak = 1; 
            } else {
                streak = 1; // First time
            }
            localStorage.setItem('daily-streak', streak);
            localStorage.setItem('last-login-date', today);
            
            // Streak Notification
            const notif = document.createElement('div');
            notif.innerHTML = `<i class='bx bxs-flame' style='font-size:1.2rem;'></i> <b>${streak} Day Streak!</b> Keep it up!`;
            notif.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#f59e0b; color:white; padding:10px 24px; border-radius:30px; box-shadow:0 4px 20px rgba(245, 158, 11, 0.4); z-index:9999; animation: slideDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-weight:bold; display:flex; align-items:center; gap:8px; font-family:"Outfit", sans-serif;';
            
            // Inject animation style if needed
            if(!document.getElementById('streak-anim-style')) {
                const style = document.createElement('style');
                style.id = 'streak-anim-style';
                style.innerHTML = `@keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(notif);
            setTimeout(() => { notif.style.transition='opacity 0.5s'; notif.style.opacity='0'; setTimeout(()=>notif.remove(),500); }, 3000);
        }
        // Update UI elements
        document.querySelectorAll('.streak-counter').forEach(el => el.innerHTML = `<i class='bx bxs-flame' style='color:#f59e0b;'></i> ${streak} Day`);
    });
})();