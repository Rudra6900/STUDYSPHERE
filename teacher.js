const getApiBase = () => {
    if (window.location.port === '5500' || window.location.port === '5501') return 'http://localhost/practice/';
    if (window.location.protocol === 'file:') return 'http://localhost/practice/';
    return '';
};
var API_BASE = getApiBase();

document.addEventListener('DOMContentLoaded', () => {

    // --- SECURITY & DIRECT ACCESS CHECK ---
    // Completely blocks unverified users from accessing the dashboard directly
    fetch(`${API_BASE}get_profile.php?t=${Date.now()}`, { credentials: 'include', cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            if (data.error || data.role !== 'teacher') {
                window.location.href = 'login.html';
                return;
            }
            // The server-side `teacher.php` script is the gatekeeper for verification.
            // If this JavaScript is running, it means the user is either verified (and seeing the dashboard)
            // or they are on the verification page itself. We don't need a redundant client-side check
            // that could cause race conditions on hard refresh.

            // Fix name display if directly accessing the HTML file
            const nameEl = document.getElementById('teacher-welcome-name');
            if (nameEl && nameEl.textContent.includes('<?php')) nameEl.textContent = data.username;
            
            // Set Availability Toggle state
            const availabilityToggle = document.querySelector('.switch input[type="checkbox"]');
            if (availabilityToggle) {
                if (data.is_available !== undefined) {
                    availabilityToggle.checked = (data.is_available == 1);
                    localStorage.setItem('teacher_available', data.is_available == 1 ? '1' : '0'); // Fix: Sync to memory so requests aren't blocked
                } else {
                    availabilityToggle.checked = (localStorage.getItem('teacher_available') === '1');
                }
            }
        })
        .catch(() => window.location.href = 'login.html');

    // Load pending doubt requests on page load so they aren't lost on refresh!
    fetch(API_BASE + 'api_notifications.php?action=get_requests', {credentials: 'include', cache: 'no-store'})
        .then(res => res.json())
        .then(reqs => {
            const isAvail = localStorage.getItem('teacher_available') === '1';
            if(Array.isArray(reqs) && isAvail) {
                reqs.forEach(r => {
                    window.addDoubtRequestToTable(r.sender_user, r.created_at);
                });
            }
        });

    // Schedule Modal Logic
    const scheduleModal = document.getElementById('schedule-modal');
    const scheduleBtn = document.getElementById('schedule-class-btn');
    const scheduleForm = document.getElementById('schedule-form');

    if (scheduleBtn && scheduleModal) {
        scheduleBtn.onclick = () => scheduleModal.style.display = "block";
    }

    if (scheduleForm) {
        scheduleForm.onsubmit = (e) => {
            e.preventDefault();
            const title = document.getElementById('schedule-title').value;
            const time = document.getElementById('schedule-time').value;
            const videoId = document.getElementById('schedule-video-id').value || 'nu_pCVPKzTk';

            fetch(`${API_BASE}schedule_class.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ title, scheduled_time: time, video_id: videoId })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    alert('Class scheduled successfully!');
                    scheduleModal.style.display = "none";
                    scheduleForm.reset();
                    fetchAndRenderScheduledClasses();
                    
                    // Send simulated push notification to students cross-tab
                    localStorage.setItem('new_class_notification', JSON.stringify({
                        title: title, time: Date.now()
                    }));
                } else {
                    alert(data.message || 'Failed to schedule class.');
                }
            })
            .catch(err => alert('Error scheduling class.'));
        }
    }

    // Teacher Create Course Logic
    const createCourseModal = document.getElementById('create-course-modal');
    const createCourseBtn = document.getElementById('create-course-btn');
    const createCourseForm = document.getElementById('create-course-form');

    if (createCourseBtn && createCourseModal) {
        createCourseBtn.onclick = () => createCourseModal.style.display = "block";
    }

    if (createCourseForm) {
        createCourseForm.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('course_name', document.getElementById('t-course-name').value);
            formData.append('course_price', document.getElementById('t-course-price').value);
            formData.append('status', 'pending'); // Ensure teacher courses go to pending state
            
            const imageInput = document.getElementById('t-course-image');
            if (imageInput && imageInput.files.length > 0) {
                formData.append('course_image', imageInput.files[0]);
            }
            // teacher_id is automatically pulled from $_SESSION in add_course.php

            fetch(`${API_BASE}add_course.php`, { method: 'POST', credentials: 'include', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.success) { alert('Course Created Successfully! Available for students to enroll.'); createCourseModal.style.display = "none"; createCourseForm.reset(); fetchAndRenderMyCourses(); } 
                else { alert(data.message || 'Failed to create course.'); }
            })
            .catch(err => alert('Error uploading course.'));
        }
    }

    // Assignment Modal Logic
    const assignModal = document.getElementById('assignment-modal');
    const assignBtn = document.getElementById('create-assignment-btn');
    const assignForm = document.getElementById('assignment-form');

    if (assignBtn && assignModal) {
        assignBtn.onclick = () => assignModal.style.display = "block";
    }

    // Notes Modal Logic
    const notesModal = document.getElementById('notes-modal');
    const notesBtn = document.getElementById('upload-note-btn');
    const notesForm = document.getElementById('notes-form');

    if (notesBtn && notesModal) {
        notesBtn.onclick = () => {
            fetch(`${API_BASE}get_courses.php?teacher_only=true`, { credentials: 'include' })
                .then(res => res.json())
                .then(courses => {
                    const select = document.getElementById('note-course');
                    if (select && Array.isArray(courses)) {
                        select.innerHTML = '<option value="">General (No Course)</option>' + 
                            courses.map(c => `<option value="${c.id}">${c.course_name}</option>`).join('');
                    }
                });
            notesModal.style.display = "block";
        };
    }

    if (notesForm) {
        notesForm.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(notesForm);
            formData.append('course_id', document.getElementById('note-course').value);
            fetch(`${API_BASE}upload_note.php`, { method: 'POST', credentials: 'include', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.success) { alert('Note uploaded successfully!'); notesModal.style.display = "none"; notesForm.reset(); } 
                else { alert(data.message || 'Failed to upload note.'); }
            })
            .catch(err => alert('Error uploading note.'));
        }
    }

    // Upload Video Modal Logic
    const videoModal = document.getElementById('upload-video-modal');
    const videoBtn = document.getElementById('upload-video-btn');
    const videoForm = document.getElementById('upload-video-form');

    if (videoBtn && videoModal) {
        videoBtn.onclick = () => videoModal.style.display = "block";
    }

    if (videoForm) {
        videoForm.onsubmit = (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('video-file');
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                return alert('Please select a video file.');
            }
            const file = fileInput.files[0];
            if (file.size > 2000 * 1024 * 1024) {
                if (!confirm('This video is very large (over 2GB). It may exceed your server limits and fail. Continue anyway?')) return;
            }
            
            const formData = new FormData();
            formData.append('title', document.getElementById('video-title').value);
            formData.append('video_file', file);
            
            fetch(`${API_BASE}upload_video.php`, { method: 'POST', credentials: 'include', body: formData })
            .then(res => res.text())
            .then(text => {
                let data;
                try { data = JSON.parse(text); } 
                catch(e) { throw new Error("Invalid server response (Session may have expired): " + text.substring(0, 50)); }
                
                if (data.success) {
                    alert('Video uploaded successfully! It is now pending admin approval.'); 
                    videoModal.style.display = "none"; 
                    videoForm.reset(); 
                    fetchAndRenderScheduledClasses();
                } else {
                    throw new Error(data.message || 'Unknown server error');
                }
            })
            .catch(err => {
                alert('Upload Failed: ' + err.message);
            });
        }
    }

    // Poll Modal Logic
    const pollModal = document.getElementById('poll-modal');
    const pollBtn = document.getElementById('create-poll-btn');
    const pollForm = document.getElementById('poll-form');
    
    // Poll Results Logic
    const resultsModal = document.getElementById('poll-results-modal');
    let currentPollVotes = [];

    if (pollBtn && pollModal) {
        pollBtn.onclick = () => pollModal.style.display = "block";
    }

    if (pollForm) {
        pollForm.onsubmit = (e) => {
            e.preventDefault();
            const question = pollForm.querySelector('input[name="question"]').value;
            const options = Array.from(pollForm.querySelectorAll('input[name="option"]'))
                                 .map(input => input.value.trim())
                                 .filter(val => val !== '');
            
            if (!question || options.length < 2) {
                alert('Please provide a question and at least two options.');
                return;
            }
            
            // Initialize votes
            currentPollVotes = new Array(options.length).fill(0);
            
            // Save poll data
            localStorage.setItem('live_poll_data', JSON.stringify({ id: 'poll_' + Date.now(), question, options }));
            
            alert('Poll has been sent to students!');
            pollModal.style.display = 'none';
            pollForm.reset();

            // Open Results Modal immediately
            if(resultsModal) {
                document.getElementById('result-question').textContent = question;
                updateResultsUI(options);
                resultsModal.style.display = 'block';
            }
        };
    }

    // Listen for votes
    window.addEventListener('storage', (e) => {
        if (e.key === 'poll_vote' && e.newValue) {
            const vote = JSON.parse(e.newValue);
            if (currentPollVotes[vote.optionIndex] !== undefined) {
                currentPollVotes[vote.optionIndex]++;
                
                // Get current options from the form (or saved state) to re-render
                // For simplicity, we assume the modal is open and we just update bars
                const barsContainer = document.getElementById('result-bars');
                if(barsContainer && barsContainer.children.length > 0) {
                    const totalVotes = currentPollVotes.reduce((a, b) => a + b, 0);
                    currentPollVotes.forEach((count, idx) => {
                        const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                        const barFill = document.getElementById(`bar-fill-${idx}`);
                        const barText = document.getElementById(`bar-text-${idx}`);
                        if(barFill) barFill.style.width = `${percentage}%`;
                        if(barText) barText.textContent = `${count} votes (${percentage}%)`;
                    });
                }
            }
        }
    });

    function updateResultsUI(options) {
        const container = document.getElementById('result-bars');
        container.innerHTML = options.map((opt, i) => `
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.9rem;">
                    <span>${opt}</span>
                    <span id="bar-text-${i}">0 votes (0%)</span>
                </div>
                <div style="background:rgba(255,255,255,0.1); height:10px; border-radius:5px; overflow:hidden;">
                    <div id="bar-fill-${i}" style="background:var(--accent); width:0%; height:100%; transition:width 0.3s;"></div>
                </div>
            </div>
        `).join('');
    }

    // Generic Close Logic for All Modals
    document.querySelectorAll('.close-modal').forEach(span => {
        span.onclick = function() {
            this.closest('.modal').style.display = "none";
        }
    });

    // Close when clicking outside any modal
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            // Prevent 1-on-1 chat from closing when clicking outside
            if (event.target.id === 'private-chat-modal') return;
            event.target.style.display = "none";
        }
    };

    if (assignForm) {
        assignForm.onsubmit = (e) => {
            e.preventDefault();
            alert('Assignment Created Successfully! (This is a demo)');
            assignModal.style.display = "none";
            assignForm.reset();
        }
    }

    // --- STUDENT MANAGEMENT ---
    const studentTableBody = document.getElementById('student-table-body');

    function fetchAndRenderStudents() {
        if (!studentTableBody) return;

        fetch(`${API_BASE}get_users.php?action=teacher_students&t=${Date.now()}`, { credentials: 'include', cache: 'no-store' })
            .then(res => res.json())
            .then(users => {
                if (users.error) {
                    studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--danger);">${users.error}</td></tr>`;
                    return;
                }
                if (users.length === 0) {
                    studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No students found.</td></tr>`;
                    return;
                }

                studentTableBody.innerHTML = users.map(user => `
                    <tr>
                        <td>
                            <div class="user-info">
                                <div class="avatar">${user.username.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div style="font-weight: 600;">${user.username}</div>
                                </div>
                            </div>
                        </td>
                        <td>${user.email}</td>
                        <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
                        <td><span class="status-badge ${user.status === 'banned' ? 'status-banned' : 'status-active'}">${user.status}</span></td>
                        <td>
                            <div class="action-btn-group">
                                <button class="table-btn" onclick="openReport('${user.username}')">View Report</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            })
            .catch(err => {
                console.error('Error fetching students:', err);
                studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--danger);">Failed to load student data.</td></tr>`;
            });
    }

    fetchAndRenderStudents();

    // --- SCHEDULED CLASSES MANAGEMENT ---
    const scheduledClassesTableBody = document.getElementById('scheduled-classes-table-body');

    function fetchAndRenderScheduledClasses() {
        if (!scheduledClassesTableBody) return;

        fetch(`${API_BASE}get_live_classes.php?teacher_only=true&t=${Date.now()}`, { credentials: 'include', cache: 'no-store' })
            .then(res => res.json())
            .then(classes => {
                if (classes.error) {
                    scheduledClassesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--danger);">${classes.error}</td></tr>`;
                    return;
                }
                if (classes.length === 0) {
                    scheduledClassesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No scheduled classes found.</td></tr>`;
                    return;
                }

                scheduledClassesTableBody.innerHTML = classes.map(c => {
                    let actionButtons = '';
                    
                    if (c.status === 'scheduled') {
                        const safeTitle = c.title.replace(/'/g, "\\'");
                        actionButtons = `<button class="table-btn" onclick="startLive(${c.id}, '${safeTitle}')" style="color: #10b981; border-color: #10b981; margin-right: 5px;"><i class='bx bx-broadcast'></i> Go Live</button>
                                         <button class="table-btn delete" onclick="deleteClass(${c.id})" style="color: #ef4444; border-color: #ef4444;">Cancel</button>`;
                    } else if (c.status === 'live') {
                        actionButtons = `<button class="table-btn" onclick="endLive(${c.id})" style="color: #ef4444; border-color: #ef4444; margin-right: 5px;"><i class='bx bx-stop-circle'></i> End Stream</button>`;
                    } else if (c.status === 'pending_verification') {
                        actionButtons = `<span style="color:#f59e0b; font-size: 0.85rem;"><i class='bx bx-time'></i> Pending Approval</span>`;
                    } else {
                        actionButtons = `<span style="color:#94a3b8; font-size: 0.85rem;">Saved as Recording</span>`;
                    }

                    return `
                        <tr>
                            <td>${c.title}</td>
                            <td>${new Date(c.scheduled_time).toLocaleString()}</td>
                            <td><span class="status-badge status-${c.status === 'live' ? 'live' : (c.status === 'scheduled' ? 'scheduled' : 'ended')}" ${c.status !== 'live' && c.status !== 'scheduled' ? 'style="background:rgba(255,255,255,0.1); color:#94a3b8;"' : ''}>${c.status.toUpperCase()}</span></td>
                            <td>
                                <div class="action-btn-group">${actionButtons}</div>
                            </td>
                        </tr>
                    `;
                }).join('');
            })
            .catch(err => {
                scheduledClassesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--danger);">Failed to load scheduled classes.</td></tr>`;
            });
    }

    fetchAndRenderScheduledClasses();

    window.deleteClass = function(id) {
        if (!confirm('Are you sure you want to cancel this scheduled class?')) return;
        fetch(`${API_BASE}delete_class.php`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id: id })
        }).then(res => res.json()).then(data => {
            if (data.success) { alert('Class cancelled successfully.'); fetchAndRenderScheduledClasses(); } 
            else { alert(data.message || 'Failed to cancel class.'); }
        });
    };

    window.startLive = function(id, title) {
        if (!confirm('Start the live stream for this class now? Students will see it as LIVE.')) return;
        fetch(`${API_BASE}start_live_class.php`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id: id })
        }).then(res => res.json()).then(data => {
            if (data.success) { 
                showToast('🔴 Stream Started!'); fetchAndRenderScheduledClasses(); openLiveStreamModal(id, title); 
                localStorage.setItem('system_chat_msg', JSON.stringify({ classId: id, msg: `The teacher has officially started the class!`, time: Date.now() }));
            } 
            else { alert(data.message || 'Failed to start class.'); }
        });
    };

    window.endLive = function(id) {
        if (!confirm('Are you sure you want to end this live stream?')) return;
        fetch(`${API_BASE}end_live_class.php`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id: id })
        }).then(res => res.json()).then(data => {
            if (data.success) { showToast('Stream ended.'); fetchAndRenderScheduledClasses(); } 
            else { alert(data.message || 'Failed to end class.'); }
        });
    };

    let localStream = null;
    let teacherPeer = null;

    window.openLiveStreamModal = function(id, title) {
        const modal = document.getElementById('live-stream-modal');
        const videoEl = document.getElementById('teacher-local-video');
        const statusEl = document.getElementById('live-status-indicator');
        
        document.querySelector('#live-stream-title span').innerText = title;
        modal.style.display = 'block';
        modal.dataset.liveId = id; // Store ID to close it later

        // Request raw camera & mic access
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStream = stream;
                videoEl.srcObject = stream; // Show local camera on screen
                
                // Setup broadcasting server
                const peerId = 'studysphere_class_' + id;
                teacherPeer = new Peer(peerId);
                
                teacherPeer.on('open', function() {
                    statusEl.innerText = "🔴 LIVE - Broadcasting to students...";
                    statusEl.style.background = "rgba(239, 68, 68, 0.8)";
                });
                
                // When a student connects, send them the camera stream
                teacherPeer.on('call', function(call) {
                    call.answer(localStream);
                });
            })
            .catch(err => {
                statusEl.innerText = "Camera access denied!";
                alert('Camera/Microphone access denied! Please allow permissions in your browser settings.');
            });
    };

    window.closeLiveStream = function() {
        if (!confirm('Are you sure you want to end this live stream for everyone?')) return;
        const modal = document.getElementById('live-stream-modal');
        
        if (localStream) { localStream.getTracks().forEach(track => track.stop()); localStream = null; }
        if (teacherPeer) { teacherPeer.destroy(); teacherPeer = null; }
        if (document.getElementById('teacher-local-video')) document.getElementById('teacher-local-video').srcObject = null;
        
        modal.style.display = 'none';
        if (modal.dataset.liveId) endLive(modal.dataset.liveId);
    };

    // --- MY COURSES MANAGEMENT ---
    const myCoursesTableBody = document.getElementById('my-courses-table-body');
    let teacherCourses = [];

    window.fetchAndRenderMyCourses = function() {
        if (!myCoursesTableBody) return;
        fetch(`${API_BASE}get_courses.php?teacher_only=true&t=${Date.now()}`, { credentials: 'include', cache: 'no-store' })
            .then(res => res.json())
            .then(courses => {
                if (courses.error || !Array.isArray(courses)) {
                    myCoursesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--danger);">Failed to load courses.</td></tr>`;
                    return;
                }
                teacherCourses = courses;
                if (courses.length === 0) {
                    myCoursesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">You haven't created any courses yet.</td></tr>`;
                    return;
                }
                myCoursesTableBody.innerHTML = courses.map(c => `
                    <tr>
                        <td>${c.course_name}</td>
                        <td>₹${c.course_price}</td>
                        <td><span class="status-badge" style="background:${c.status==='approved'?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)'}; color:${c.status==='approved'?'#10b981':'#f59e0b'}; padding:4px 8px; border-radius:12px; font-size:0.8rem;">${c.status.toUpperCase()}</span></td>
                        <td>
                            <button class="table-btn" onclick="openTeacherEditCourse(${c.id})" style="color:#3b82f6; border-color:#3b82f6; padding: 4px 10px; border-radius: 6px; cursor: pointer; background: transparent; border: 1px solid #3b82f6;">Edit</button>
                            <button class="table-btn delete" onclick="deleteTeacherCourse(${c.id})" style="color:#ef4444; border-color:#ef4444; padding: 4px 10px; border-radius: 6px; cursor: pointer; background: transparent; border: 1px solid #ef4444; margin-left: 5px;">Delete</button>
                        </td>
                    </tr>
                `).join('');
            })
            .catch(err => {
                myCoursesTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--danger);">Failed to load courses.</td></tr>`;
            });
    }

    fetchAndRenderMyCourses();

    window.openTeacherEditCourse = function(id) {
        const c = teacherCourses.find(x => x.id == id);
        if(c) {
            document.getElementById('edit-t-course-id').value = c.id;
            document.getElementById('edit-t-course-name').value = c.course_name;
            document.getElementById('edit-t-course-price').value = c.course_price;
            document.getElementById('teacher-edit-course-modal').style.display = 'block';
        }
    }

    const editCourseForm = document.getElementById('teacher-edit-course-form');
    if (editCourseForm) {
        editCourseForm.onsubmit = (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-t-course-id').value;
            const name = document.getElementById('edit-t-course-name').value;
            const price = document.getElementById('edit-t-course-price').value;

            fetch(`${API_BASE}edit_course.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ id: id, course_name: name, course_price: price })
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    alert('Course updated successfully!');
                    document.getElementById('teacher-edit-course-modal').style.display = 'none';
                    fetchAndRenderMyCourses();
                } else { alert('Failed to update: ' + data.message); }
            });
        }
    }

    window.deleteTeacherCourse = function(id) {
        if(!confirm('Are you sure you want to delete this course?')) return;
        fetch(`${API_BASE}delete_course.php`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
            body: JSON.stringify({id: id})
        }).then(res => res.json()).then(data => {
            if(data.success) {
                alert('Course deleted successfully!');
                fetchAndRenderMyCourses();
            } else {
                alert('Failed to delete course: ' + (data.message || ''));
            }
        });
    }

    // Handle Teacher Availability Toggle
    window.toggleAvailability = function(checkbox) {
        localStorage.setItem('teacher_available', checkbox.checked ? '1' : '0');
        fetch(`${API_BASE}update_availability.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ is_available: checkbox.checked })
        })
        .then(res => {
            if (!res.ok) throw new Error(`Server Error: ${res.status}`);
            return res.json();
        })
        .then(data => {
            if(data.success) {
                showToast(`Availability updated to: ${checkbox.checked ? 'Online' : 'Offline'}`);
            } else {
                checkbox.checked = !checkbox.checked; // Revert UI on failure
                localStorage.setItem('teacher_available', checkbox.checked ? '1' : '0');
                alert('Failed to update status: ' + (data.message || 'Unknown error.'));
            }
        })
        .catch(err => {
            console.error(err);
            checkbox.checked = !checkbox.checked; // Revert UI on failure
            localStorage.setItem('teacher_available', checkbox.checked ? '1' : '0');
            alert('Network Error: Could not update availability. Please ensure your server is running.');
        });
    }
});

// Global function to open Report Modal
window.openReport = function(username) {
    const modal = document.getElementById('report-modal');
    const title = document.getElementById('report-title');
    const body = document.getElementById('report-body');
    
    if(modal && title && body) {
        title.textContent = `Progress Report: ${username}`;
        
        // Mock Data Visualization
        body.innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; text-align:center; border:1px solid rgba(255,255,255,0.1);">
                    <div style="color:#94a3b8; font-size:13px; margin-bottom:5px;">Average Grade</div>
                    <div style="font-size:28px; font-weight:bold; color:#3b82f6;">88%</div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; text-align:center; border:1px solid rgba(255,255,255,0.1);">
                    <div style="color:#94a3b8; font-size:13px; margin-bottom:5px;">Attendance</div>
                    <div style="font-size:28px; font-weight:bold; color:#10b981;">95%</div>
                </div>
            </div>
            
            <h4 style="color:#e2e8f0; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Recent Activity</h4>
            <ul style="list-style:none; padding:0; color:#cbd5e1; font-size:14px;">
                <li style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                    <span><i class='bx bxs-file-html' style="color:#e34f26; margin-right:8px;"></i> HTML Basics Quiz</span> 
                    <span style="background:rgba(16, 185, 129, 0.2); color:#34d399; padding:2px 8px; border-radius:4px; font-size:12px;">90%</span>
                </li>
                <li style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                    <span><i class='bx bxs-file-css' style="color:#264de4; margin-right:8px;"></i> CSS Flexbox</span> 
                    <span style="background:rgba(245, 158, 11, 0.2); color:#fbbf24; padding:2px 8px; border-radius:4px; font-size:12px;">75%</span>
                </li>
                <li style="padding:10px 0; display:flex; justify-content:space-between; align-items:center;">
                    <span><i class='bx bxs-file-js' style="color:#f7df1e; margin-right:8px;"></i> JS Intro</span> 
                    <span style="background:rgba(59, 130, 246, 0.2); color:#60a5fa; padding:2px 8px; border-radius:4px; font-size:12px;">Pending</span>
                </li>
            </ul>
            
            <button style="width:100%; margin-top:20px; padding:12px; background:var(--accent); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;" onclick="alert('Detailed PDF download started...')">Download Full Transcript</button>
        `;
        
        modal.style.display = 'block';
    }
};

// Cross-Device Server Polling
setInterval(() => {
    const isAvail = localStorage.getItem('teacher_available') === '1';
    fetch(API_BASE + 'api_notifications.php?action=poll', {credentials: 'include'})
    .then(res => res.json())
    .then(notifs => {
        if(!Array.isArray(notifs)) return;
        notifs.forEach(n => {
            if (n.type === '1on1_request' && isAvail) {
                window.addDoubtRequestToTable(n.sender_user, n.created_at || new Date().toISOString());
            }
            if (n.type === '1on1_chat_msg') {
                const data = JSON.parse(n.data);
                const modal = document.getElementById('private-chat-modal');
                if (modal && modal.style.display === 'block' && data.room === modal.dataset.roomId) {
                    appendPrivateMsg(data.text, false, n.sender_user);
                }
            }
            if (n.type === '1on1_end') {
                const data = JSON.parse(n.data);
                const modal = document.getElementById('private-chat-modal');
                if (modal && modal.style.display === 'block' && data.room === modal.dataset.roomId) {
                    alert('The student has left the session.');
                    closePrivateChat(false);
                }
            }
            if (n.type === 'system_msg') {
                const data = JSON.parse(n.data);
                showToast(`🔔 <b>System</b><br>${data.text}`);
            }
        });
    }).catch(e => console.error(e));
}, 3000);

    window.addDoubtRequestToTable = function(studentName, timeStr) {
        if (!studentName) return; // Prevent empty ghost requests
        const tbody = document.getElementById('doubt-requests-table-body');
        if (!tbody) return;
        
        if (tbody.innerHTML.includes('No pending requests')) {
            tbody.innerHTML = '';
        }
        if (document.getElementById('request-' + studentName)) return; // Prevent duplicates

        const tr = document.createElement('tr');
        tr.id = 'request-' + studentName;
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:32px; height:32px; background:#3b82f6; border-radius:50%; display:grid; place-items:center; color:white; font-weight:bold;">${studentName.charAt(0).toUpperCase()}</div>
                    <b>${studentName}</b>
                </div>
            </td>
            <td>${new Date(timeStr).toLocaleTimeString()}</td>
            <td>
                <button class="table-btn unban" style="font-weight:bold; border-color:#10b981; color:#10b981; margin-right:5px;" onclick="accept1on1('${studentName}', this.closest('tr'))">Accept</button>
                <button class="table-btn delete" style="font-weight:bold; border-color:#ef4444; color:#ef4444;" onclick="decline1on1('${studentName}', this.closest('tr'))">Decline</button>
            </td>
        `;
        tbody.prepend(tr);
    }

    window.accept1on1 = function(studentName, rowEl) {
        if(rowEl) rowEl.remove();
        const tbody = document.getElementById('doubt-requests-table-body');
        if (tbody && tbody.children.length === 0) tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No pending requests.</td></tr>';

        const roomId = 'room_' + Math.random().toString(36).substr(2, 9);
        
        fetch(API_BASE + 'api_notifications.php?action=send', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
            body: JSON.stringify({ target: studentName, type: '1on1_accepted', data: { room: roomId } })
        });

        openPrivateChat(studentName, roomId, true);
    }
    
    window.decline1on1 = function(studentName, rowEl) {
        if(rowEl) rowEl.remove();
        const tbody = document.getElementById('doubt-requests-table-body');
        if (tbody && tbody.children.length === 0) tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No pending requests.</td></tr>';
        
        fetch(API_BASE + 'api_notifications.php?action=send', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
            body: JSON.stringify({ target: studentName, type: 'system_msg', data: { text: 'The teacher is currently busy and declined the request.' } })
        });
    }

    window.appendPrivateMsg = function(text, isSelf, senderName = 'You') {
        const box = document.getElementById('private-chat-msgs');
        if(!box) return;
        const div = document.createElement('div');
        div.style.alignSelf = isSelf ? 'flex-end' : 'flex-start';
        div.style.background = isSelf ? '#3b82f6' : 'rgba(255,255,255,0.05)';
        div.style.border = isSelf ? 'none' : '1px solid rgba(255,255,255,0.1)';
        div.style.color = 'white';
        div.style.padding = '12px 18px';
        div.style.borderRadius = '16px';
        div.style.borderBottomRightRadius = isSelf ? '4px' : '16px';
        div.style.borderBottomLeftRadius = isSelf ? '16px' : '4px';
        div.style.maxWidth = '80%';
        div.innerHTML = `<div style="font-size:0.75rem; color:rgba(255,255,255,0.7); margin-bottom:4px;">${senderName}</div><div>${text}</div>`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    window.sendPrivateMsg = function(roomId, isTeacher) {
        const input = document.getElementById('private-chat-input');
        const text = input.value.trim();
        if(!text) return;
        appendPrivateMsg(text, true, 'You');
        
        const modal = document.getElementById('private-chat-modal');
        const target = modal.dataset.peerName || 'Student';
        
        fetch(API_BASE + 'api_notifications.php?action=send', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
            body: JSON.stringify({ target: target, type: '1on1_chat_msg', data: { room: roomId, text: text } })
        });

        input.value = '';
    }

    let privateCallPeer = null;
    let privateLocalStream = null;

    window.openPrivateChat = function(peerName, roomId, isTeacher) {
        const modal = document.getElementById('private-chat-modal');
        const container = document.getElementById('private-chat-container');
        document.getElementById('private-chat-title').innerHTML = `<i class='bx bx-video'></i> <span>1-on-1 with ${peerName}</span> <button id="screen-share-btn" onclick="toggleScreenShare('${roomId}')" style="margin-left:15px; background:rgba(59,130,246,0.2); color:#3b82f6; border:1px solid #3b82f6; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:0.85rem; transition:0.2s;"><i class='bx bx-desktop'></i> Share Screen</button>`;
        container.innerHTML = `
            <div id="private-chat-msgs" style="flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:15px;">
                <div style="color:var(--muted); text-align:center; font-size:0.85rem; padding: 10px; background: rgba(128,128,128,0.1); border-radius: 8px;">
                    Secure 1-on-1 session started. You can now chat and talk.
                </div>
            </div>
            <div style="padding:15px; border-top:1px solid var(--border); display:flex; gap:10px; background: var(--bg);">
                <input type="text" id="private-chat-input" placeholder="Type your message..." style="flex:1; padding:12px; border-radius:8px; border:1px solid var(--border); background: transparent; color: var(--text); outline:none;">
                <button onclick="sendPrivateMsg('${roomId}', ${isTeacher})" style="padding:10px 20px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">Send</button>
            </div>
        `;
        modal.style.display = 'block';
        modal.dataset.roomId = roomId;
        modal.dataset.isTeacher = isTeacher;
        modal.dataset.peerName = peerName;

        let remoteVid = document.getElementById('remote-student-video');
        if (!remoteVid) {
            const localVid = document.getElementById('local-cam-video');
            if (localVid && localVid.parentElement) {
                localVid.parentElement.insertAdjacentHTML('afterbegin', `<video id="remote-student-video" autoplay playsinline style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; z-index:5;"></video>`);
                localVid.style.zIndex = '10'; 
            }
            remoteVid = document.getElementById('remote-student-video');
        }

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                privateLocalStream = stream;
                const localVid = document.getElementById('local-cam-video');
                if (localVid) localVid.srcObject = stream;

                if (privateCallPeer) privateCallPeer.destroy();
                privateCallPeer = new Peer('room_' + roomId + '_teacher');

                privateCallPeer.on('call', call => {
                    call.answer(stream);
                    call.on('stream', remoteStream => {
                        if (remoteVid) remoteVid.srcObject = remoteStream;
                        const placeholder = localVid.parentElement.querySelector('div[style*="text-align: center"]');
                        if (placeholder) placeholder.style.display = 'none';
                    });
                });
            })
            .catch(err => {
                console.error(err);
                alert("Please allow camera and microphone permissions.");
            });

        document.getElementById('private-chat-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendPrivateMsg(roomId, isTeacher);
        });
    }

    let isScreenSharing = false;

    window.toggleScreenShare = async function(roomId) {
        if (!privateCallPeer) return alert("Call not connected yet.");
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];
                const connections = privateCallPeer.connections;
                for (let peerId in connections) {
                    connections[peerId].forEach(conn => {
                        const sender = conn.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
                        if (sender) sender.replaceTrack(screenTrack);
                    });
                }
                const localVid = document.getElementById('local-cam-video');
                if (localVid) localVid.srcObject = screenStream;
                isScreenSharing = true;
                document.getElementById('screen-share-btn').innerHTML = `<i class='bx bx-stop-circle'></i> Stop Sharing`;
                document.getElementById('screen-share-btn').style.background = 'rgba(239, 68, 68, 0.2)';
                document.getElementById('screen-share-btn').style.color = '#ef4444';
                document.getElementById('screen-share-btn').style.borderColor = '#ef4444';
                screenTrack.onended = () => revertToWebcam();
            } else {
                revertToWebcam();
            }
        } catch (e) { console.error("Screen share error:", e); }
    };

    window.revertToWebcam = async function() {
        if (!privateCallPeer || !privateLocalStream) return;
        const videoTrack = privateLocalStream.getVideoTracks()[0];
        const connections = privateCallPeer.connections;
        for (let peerId in connections) {
            connections[peerId].forEach(conn => {
                const sender = conn.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            });
        }
        const localVid = document.getElementById('local-cam-video');
        if (localVid) localVid.srcObject = privateLocalStream;
        isScreenSharing = false;
        const shareBtn = document.getElementById('screen-share-btn');
        if(shareBtn) {
            shareBtn.innerHTML = `<i class='bx bx-desktop'></i> Share Screen`;
            shareBtn.style.background = 'rgba(59,130,246,0.2)';
            shareBtn.style.color = '#3b82f6';
            shareBtn.style.borderColor = '#3b82f6';
        }
    };

    window.closePrivateChat = function(notifyPeer = true) {
        const modal = document.getElementById('private-chat-modal');
        const container = document.getElementById('private-chat-container');
        
        if (notifyPeer && modal && modal.dataset.peerName && modal.dataset.roomId) {
            fetch(API_BASE + 'api_notifications.php?action=send', {
                method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
                body: JSON.stringify({ target: modal.dataset.peerName, type: '1on1_end', data: { room: modal.dataset.roomId } })
            });
        }

        if (privateLocalStream) {
            privateLocalStream.getTracks().forEach(track => track.stop());
            privateLocalStream = null;
        }
        if (privateCallPeer) {
            privateCallPeer.destroy();
            privateCallPeer = null;
        }
        
        const localVid = document.getElementById('local-cam-video');
        if (localVid) {
            localVid.srcObject = null;
            const placeholder = localVid.parentElement.querySelector('div[style*="text-align: center"]');
            if (placeholder) placeholder.style.display = 'block';
        }
        const remoteVid = document.getElementById('remote-student-video');
        if (remoteVid) remoteVid.srcObject = null;
        
        if(container) container.innerHTML = ''; 
        if(modal) modal.style.display = 'none';
    }

function playNotificationSound() {
    // Intentionally left blank to completely stop the irritating background beep
}

function showToast(html) {
    playNotificationSound();
    const toast = document.createElement('div');
    toast.innerHTML = html;
    toast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); color:white; padding:15px 20px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.5); z-index:3000; animation:fadeInUp 0.3s; display:flex; align-items:center; gap:10px;';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}