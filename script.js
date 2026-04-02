const container = document.querySelector('.container');
// --- API CONFIGURATION ---
// Using relative paths to ensure compatibility with Port Forwarding / Tunnels.
const getApiBase = () => {
    if (window.location.port === '5500' || window.location.port === '5501') return 'http://localhost/practice/';
    if (window.location.protocol === 'file:') return 'http://localhost/practice/';
    return '';
};
const API_BASE = getApiBase();
console.log('API_BASE set to:', API_BASE || 'Relative Path');

const LoginLink = document.querySelector('.SignInLink');
const RegisterLink = document.querySelector('.SignUpLink');

// Check URL params for register mode
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('register') === 'true' && container) {
    container.classList.add('active');
}

// --- TOGGLE LOGIN / REGISTER VIEW ---
if (RegisterLink) {
    RegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (container) container.classList.add('active');
    });
}

if (LoginLink) {
    LoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (container) container.classList.remove('active');
    });
}

// --- FORGOT PASSWORD LOGIC ---
function forgotPassword(){
    const email = prompt('Please enter your email to receive a password reset link:');
    if(!email) return;
    const re = /\S+@\S+\.\S+/;
    if(!re.test(email)){
        alert('Please enter a valid email address.');
        return;
    }
    
    fetch(API_BASE + 'forgot_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.debug_link) console.log("Debug Reset Link:", data.debug_link);
    })
    .catch(err => alert('Error sending request.'));
}
document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIN FORM SUBMISSION ---
    const loginForm = document.querySelector('.form-box.Login form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            // Send to PHP Backend
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            fetch(API_BASE + 'login.php', { method: 'POST', body: formData, credentials: 'include' })
                .then(response => response.text())
                .then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        if (text.includes('<?php')) {
                            alert('Setup Error: PHP code is not executing.\n\nPlease ensure you are accessing this site via your Web Server (e.g., localhost/practice) and NOT via Live Server (127.0.0.1:5500).');
                            throw new Error('Server returned raw PHP');
                        }
                        throw new Error('Invalid Server Response: ' + text.substring(0, 100));
                    }
                })
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('username', data.username);
                        localStorage.setItem('avatar', data.avatar || '');
                        localStorage.setItem('isNewUser', 'true');
                        if (data.role === 'teacher') {
                            window.location.href = API_BASE + 'teacher.php';
                        } else {
                            window.location.href = API_BASE + 'front.html';
                        }
                     } else {
                        alert(data.message);
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                    alert('Login Error: ' + err.message + '\n\nPossible causes:\n1. XAMPP is not running.\n2. "practice" folder is not in htdocs.\n3. Database connection failed.');
                });
        });
    }

    // --- REGISTER FORM SUBMISSION ---
    const registerForm = document.querySelector('.form-box.Register form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const role = (e.submitter && e.submitter.value) ? e.submitter.value : 'student';

            if (!username || !email || !password) {
                alert('Please fill in all fields');
                return;
            }

            if (password.length < 8) {
                alert('Password must be at least 8 characters long.');
                return;
            }

            // Strict Email Validation (prevents numbers immediately after @)
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address. The domain name cannot start with a number.');
                return;
            }

            // Send to PHP Backend
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', role);

            fetch(API_BASE + 'register.php', { method: 'POST', body: formData })
                .then(response => response.text())
                .then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        if (text.includes('<?php')) {
                            alert('Setup Error: PHP code is not executing.\n\nPlease ensure you are accessing this site via your Web Server (e.g., localhost/practice) and NOT via Live Server (127.0.0.1:5500).');
                            throw new Error('Server returned raw PHP');
                        }
                        throw new Error('Invalid Server Response: ' + text.substring(0, 100));
                    }
                })
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('username', username);
                        localStorage.setItem('isNewUser', 'true');
                        
                        sessionStorage.setItem('username', username);
                        sessionStorage.setItem('isNewUser', 'true');
                        
                        alert('Registration successful!');
                        if (role === 'teacher') {
                           window.location.href = API_BASE + 'teacher.php';
                        } else {
                            window.location.href = API_BASE + 'front.html';
                        }
                    } else {
                        alert(data.message || 'Registration failed');
                    }   

                })
                .catch(err => {
                    console.error('Error:', err);
                    alert('Network error: ' + err.message);
                });
        });
    }

    // --- PASSWORD VISIBILITY TOGGLE ---
    const eye = document.getElementById('eyeball');
    const passwordInput = document.querySelector('.form-box.Login input[type="password"]');

    if (eye && passwordInput) {
        eye.addEventListener('click', e => {
            e.preventDefault();
            const isShown = document.body.classList.toggle('show-password');
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
            eye.setAttribute('aria-pressed', String(isShown));
            eye.setAttribute('aria-label', isShown ? 'Hide password' : 'Show password');
            passwordInput.focus();
        });
    }

    // Attach forgot-password link handler (replaces inline onclick)
    const forgotLink = document.getElementById('forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            forgotPassword();
        });
    }

    // --- FLASHLIGHT BEAM EFFECT ---
    const beam = document.getElementById('beam');
    // limit beam movement to a small range and smooth transitions
    const MAX_BEAM_DEG = 6; // maximum degrees the beam will rotate (±8°)
    let lastBeamDeg = 0;
    function updateBeamAngle(e) {
        if (!document.body.classList.contains('show-password')) return;
        if (!eye || !beam) return;
        const rect = eye.parentElement.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        let deg = Math.atan2(dy, dx) * 180 / Math.PI;
        // normalize to [-180, 180]
        if (deg > 180) deg -= 360;
        // clamp to a small range so beam only moves slightly
        const target = Math.max(-MAX_BEAM_DEG, Math.min(MAX_BEAM_DEG, deg));
        // smooth the movement (linear interpolation)
        lastBeamDeg = lastBeamDeg + (target - lastBeamDeg) * 0.18;
        document.documentElement.style.setProperty('--beamDegrees', lastBeamDeg + 'deg');
    }

    // keep listening; updateBeamAngle only acts when show-password is active
    document.addEventListener('mousemove', updateBeamAngle);

    // --- SECRET ADMIN ENTRY (Right-click Login) ---
    const loginBtn = document.querySelector('.form-box.Login .btn'); // Keep existing right-click for fun

    function handleAdminLogin() {
        const code = prompt("Enter Admin Code:");
        if (code) {
            fetch(API_BASE + 'admin_verify.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Important: Save session cookie
                body: JSON.stringify({ password: code })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirect to the PHP server URL to ensure admin.php executes
                    window.location.href = API_BASE + 'admin.html';
                } else {
                    alert('Access Denied: Invalid Admin Code');
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });
        }
    }

    if (loginBtn) {
        loginBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            handleAdminLogin();
        });
    }
});