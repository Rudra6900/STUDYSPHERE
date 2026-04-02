const getApiBase = () => {
    if (window.location.port === '5500' || window.location.port === '5501') return 'http://localhost/practice/';
    if (window.location.protocol === 'file:') return 'http://localhost/practice/';
    return '';
};
const API_BASE = getApiBase();

let allUsers = [];
let allCourses = [];
let allDeletedLogs = [];

document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('users-table-body');
    const coursesTableBody = document.getElementById('courses-table-body');
    const courseForm = document.getElementById('course-form');
    const notesTableBody = document.getElementById('notes-table-body');
    const tabs = document.querySelectorAll('.stat-card[data-filter]');
    const searchInput = document.getElementById('user-search');

    function updateDashboardStats() {
        // Calculate counts
        const studentCount = Array.isArray(allUsers) ? allUsers.filter(user => user && user.role === 'student').length : 0;
        const teacherCount = Array.isArray(allUsers) ? allUsers.filter(user => user && user.role === 'teacher').length : 0;
        const proCount = Array.isArray(allUsers) ? allUsers.filter(user => user && user.is_pro).length : 0;
        const courseCount = Array.isArray(allCourses) ? allCourses.length : 0;
        const delStudentCount = Array.isArray(allDeletedLogs) ? allDeletedLogs.filter(log => log && log.role === 'student').length : 0;
        const delTeacherCount = Array.isArray(allDeletedLogs) ? allDeletedLogs.filter(log => log && log.role === 'teacher').length : 0;

        // Update UI
        const studentEl = document.getElementById('student-count');
        const teacherEl = document.getElementById('teacher-count');
        const proEl = document.getElementById('pro-count');
        const courseEl = document.getElementById('course-count');
        const delStudentEl = document.getElementById('deleted-student-count');
        const delTeacherEl = document.getElementById('deleted-teacher-count');

        if (studentEl) studentEl.textContent = studentCount;
        if (teacherEl) teacherEl.textContent = teacherCount;
        if (proEl) proEl.textContent = proCount;
        if (courseEl) courseEl.textContent = courseCount;
        if (delStudentEl) delStudentEl.textContent = delStudentCount;
        if (delTeacherEl) delTeacherEl.textContent = delTeacherCount;
    }

    function resetUserTableHeaders() {
        const thead = document.querySelector('#users-table-body').previousElementSibling;
        if (!thead.innerHTML.includes('/th></tr>')) {
            thead.innerHTML = `<tr><th>Username</th><th>Email</th><th>Role</th><th>Last Login</th><th>Status</th><th>Actions</th></tr>`;
        }
    }

    function renderUsers(filter = 'all') {
        if (!usersTableBody) return;
        resetUserTableHeaders();

        const filteredUsers = allUsers.filter(user => {
            if (filter === 'all') return true;
            if (filter === 'pro') return user.is_pro;
            return user.role === filter;
        }).filter(user => {
            const searchTerm = searchInput.value.toLowerCase();
            return (
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
                // Add other fields if needed
            );
        });

        if (filteredUsers.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No users found for this filter.</td></tr>`;
            return;
        }

        usersTableBody.innerHTML = filteredUsers.map(user => `
            <tr data-user-id="${user.id}">
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <span class="status-badge role-${user.role}">${user.role}</span>
                    ${user.is_pro ? '<span class="status-badge" style="background:rgba(245, 158, 11, 0.1); color:#f59e0b; border:1px solid rgba(245, 158, 11, 0.2); margin-left:5px; font-size:0.75rem;"><i class="bx bxs-star"></i> PRO</span>' : ''}
                    ${user.role === 'teacher' && user.verification_status === 'pending' ? '<span class="status-badge" style="background:rgba(245, 158, 11, 0.1); color:#f59e0b; border:1px solid rgba(245, 158, 11, 0.2); margin-left:5px; font-size:0.75rem;">KYC PENDING</span>' : ''}
                    ${user.role === 'teacher' && user.verification_status === 'verified' ? '<span class="status-badge" style="background:rgba(16, 185, 129, 0.1); color:#10b981; border:1px solid rgba(16, 185, 129, 0.2); margin-left:5px; font-size:0.75rem;">VERIFIED</span>' : ''}
                </td>
                <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
                <td><span class="status-badge ${user.status === 'banned' ? 'status-banned' : 'status-active'}">${user.status}</span></td>
                <td>
                    <div class="action-btn-group">
                        <button class="table-btn" onclick="openEditUserModal(${user.id})" title="Edit">
                            <i class='bx bx-edit'></i>
                        </button>
                        ${user.role === 'teacher' && user.verification_status === 'pending' ? 
                        `<button class="table-btn" style="color: #10b981; border-color: #10b981;" onclick="openKycModal(${user.id})">View KYC</button>` : ''}
                    ${user.role === 'teacher' && user.verification_status === 'verified' ? `<button class="table-btn" style="color: #f59e0b; border-color: #f59e0b;" onclick="unverifyTeacher(${user.id})">Unverify</button>` : ''}
                        <button class="table-btn ${user.status === 'banned' ? 'unban' : 'ban'}" onclick="toggleBan(${user.id})">
                            ${user.status === 'banned' ? 'Unban' : 'Ban'}
                        </button>
                        <button class="table-btn delete" style="color: #ef4444;" onclick="lifetimeBan(${user.id}, '${user.email}')" title="Lifetime Ban">
                            <i class='bx bx-block'></i></button>
                        <button class="table-btn delete" onclick="deleteUser(${user.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function fetchUsers() {
        fetch(`${API_BASE}get_users.php?t=${Date.now()}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    window.location.href = 'login.html'; // Redirect if not authorized
                    return;
                }
                // Mock Pro Status if backend doesn't provide it (for demonstration)
                allUsers = data.map(user => ({
                    ...user,
                    is_pro: user.is_pro !== undefined ? user.is_pro : (user.id % 3 === 0) 
                }));
                renderUsers();
                updateDashboardStats();
            })
            .catch(err => {
                console.error('Error fetching users:', err);
                usersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger);">Failed to load user data.</td></tr>`;
            });
    }

    searchInput.addEventListener('input', () => {
        const activeTab = document.querySelector('.stat-card.active');
        if (activeTab) {
            if (activeTab.dataset.filter.startsWith('deleted_')) {
                fetchDeletedUsers(activeTab.dataset.filter, searchInput.value);
            } else {
                renderUsers(activeTab.dataset.filter);
            }
        }
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update Table Title based on card clicked
            const filterNames = { 'student': 'Students', 'teacher': 'Teachers', 'pro': 'Pro Users', 'deleted_student': 'Deleted Students', 'deleted_teacher': 'Deleted Teachers' };
            const tableTitle = document.getElementById('table-dynamic-title');
            if (tableTitle) tableTitle.innerHTML = `<i class='bx bxs-user-account'></i> User List: ${filterNames[tab.dataset.filter]}`;

            if (tab.dataset.filter.startsWith('deleted_')) {
                fetchDeletedUsers(tab.dataset.filter, searchInput.value);
            } else {
                renderUsers(tab.dataset.filter);
            }
        });
    });

    function fetchDeletedUsers(filterType, searchTerm = '') {
        const targetRole = filterType === 'deleted_student' ? 'student' : 'teacher';
        
        fetch(`${API_BASE}get_deleted_users.php?t=${Date.now()}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                allDeletedLogs = data; // Keep in sync for counts
                updateDashboardStats();
                const thead = document.querySelector('#users-table-body').previousElementSibling;
                thead.innerHTML = `<tr><th>Username</th><th>Email ID</th><th>Role</th><th>Deleted Date</th><th>Reason</th></tr>`;
                
                const filteredData = (Array.isArray(data) ? data : []).filter(log => log && log.role && log.role.toLowerCase() === targetRole && ((log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) || (log.email && log.email.toLowerCase().includes(searchTerm.toLowerCase()))));
                if (filteredData.length === 0) {
                    usersTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No deleted accounts found.</td></tr>`;
                    return;
                }
                usersTableBody.innerHTML = filteredData.map(log => `
                    <tr>
                        <td>${log.username || 'Unknown'}</td>
                        <td>${log.email || 'Unknown'}</td>
                        <td><span class="status-badge role-${log.role}">${log.role}</span></td>
                        <td>${new Date(log.deletion_date).toLocaleString()}</td>
                        <td>${log.reason || 'No reason provided'}</td>
                    </tr>
                `).join('');
            });
    }

    function fetchNotes() {
        fetch(`${API_BASE}get_notes.php?t=${Date.now()}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (!notesTableBody) return;
                if (data.length === 0) {
                    notesTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No materials uploaded yet.</td></tr>`;
                    return;
                }
                notesTableBody.innerHTML = data.map(n => `
                    <tr>
                        <td><a href="${API_BASE}${n.file_path}" target="_blank" style="color:var(--accent); text-decoration:none; font-weight:500;"><i class='bx bxs-file-pdf'></i> ${n.title}</a></td>
                        <td>${n.teacher_name}</td>
                        <td>${n.course_name || 'General Material'}</td>
                        <td>${new Date(n.created_at).toLocaleString()}</td>
                        <td>${n.status === 'pending' ? '<span class="status-badge" style="background:rgba(245,158,11,0.1); color:#f59e0b;">Pending</span>' : '<span class="status-badge" style="background:rgba(16,185,129,0.1); color:#10b981;">Approved</span>'}</td>
                        <td>
                            ${n.status === 'pending' ? `<button class="table-btn unban" onclick="verifyNote(${n.id}, 'approve')">Approve</button>` : ''}
                            <button class="table-btn delete" onclick="deleteNote(${n.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            });
    }

    window.deleteNote = function(id) {
        if (!confirm('Are you sure you want to delete this material?')) return;
        fetch(`${API_BASE}delete_note.php`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id: id })
        }).then(res => res.json()).then(data => {
            if (data.success) fetchNotes();
            else alert(data.message || 'Failed to delete note.');
        });
    };

    window.verifyNote = function(id, action) {
        if (!confirm(`Are you sure you want to ${action} this note?`)) return;
        fetch(`${API_BASE}verify_note.php`, {
            method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include',
            body: JSON.stringify({id, action})
        }).then(res=>res.json()).then(data => {
            if(data.success) fetchNotes();
            else alert('Failed to process note.');
        });
    }

    function fetchPendingVideos() {
        fetch(`${API_BASE}get_pending_videos.php?t=${Date.now()}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                const tbody = document.getElementById('videos-table-body');
                if (!tbody) return;
                if (!data || data.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No videos pending approval.</td></tr>`;
                    return;
                }
                tbody.innerHTML = data.map(v => `
                    <tr>
                        <td>${v.title}</td>
                        <td>${v.teacher_name}</td>
                        <td><a href="${API_BASE}${v.local_video_path}" target="_blank" style="color:var(--accent); text-decoration:none;"><i class='bx bx-play-circle'></i> Preview Video</a></td>
                        <td>${new Date(v.created_at).toLocaleString()}</td>
                        <td>
                            <button class="table-btn unban" onclick="verifyVideo(${v.id}, 'approve')" style="font-weight:bold;"><i class='bx bx-check'></i> Approve</button>
                            <button class="table-btn delete" onclick="verifyVideo(${v.id}, 'reject')"><i class='bx bx-x'></i> Reject</button>
                        </td>
                    </tr>
                `).join('');
            });
    }

    window.verifyVideo = function(id, action) {
        if (!confirm(`Are you sure you want to ${action} this video?`)) return;
        fetch(`${API_BASE}verify_video.php`, {
            method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include',
            body: JSON.stringify({id, action})
        }).then(res=>res.json()).then(data => {
            if(data.success) fetchPendingVideos();
            else alert('Failed to process video.');
        });
    }

    window.openKycModal = function(id) {
        const user = allUsers.find(u => u.id == id);
        if (user) {
            // Append API_BASE so the images load correctly from the PHP server
            document.getElementById('kyc-id-img').src = user.id_image ? API_BASE + user.id_image : 'https://via.placeholder.com/250?text=No+ID+Uploaded';
            document.getElementById('kyc-live-img').src = user.live_photo ? API_BASE + user.live_photo : 'https://via.placeholder.com/250?text=No+Photo+Uploaded';
            document.getElementById('kyc-approve-btn').onclick = function() {
                verifyTeacher(id);
                document.getElementById('kyc-modal').style.display = 'none';
            };
            document.getElementById('kyc-reject-btn').onclick = function() {
                rejectTeacher(id);
            };
            document.getElementById('kyc-modal').style.display = 'block';
        } else {
            alert('Unable to load user details.');
        }
    };

    window.toggleBan = function(id) {
        if (!confirm('Are you sure you want to toggle the ban status for this user?')) return;
        
        fetch(`${API_BASE}get_users.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'toggle_ban', id: id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchUsers(); // Re-fetch to update UI
            } else {
                alert('Action failed.');
            }
        });
    }

    window.verifyTeacher = function(id) {
        if (!confirm('Are you sure you want to verify this teacher?')) return;
        
        fetch(`${API_BASE}get_users.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'verify_teacher', id: id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) fetchUsers();
            else alert('Action failed.');
        })
        .catch(err => alert('Network error or server failed. Check console.'));
    }

    window.unverifyTeacher = function(id) {
        if (!confirm('Are you sure you want to suspend/unverify this teacher? They will lose dashboard access until re-verified.')) return;
        
        fetch(`${API_BASE}get_users.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'unverify_teacher', id: id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) fetchUsers();
            else alert('Action failed.');
        })
        .catch(err => alert('Network error or server failed. Check console.'));
    }

    window.rejectTeacher = function(id) {
        if (!confirm('Are you sure you want to reject this KYC and permanently delete the teacher account?')) return;
        
        fetch(`${API_BASE}get_users.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'delete', id: id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchUsers();
                document.getElementById('kyc-modal').style.display = 'none';
            } else {
                alert('Action failed.');
            }
        })
        .catch(err => alert('Network error or server failed. Check console.'));
    }

    window.lifetimeBan = function(id, email) {
        if (!confirm('Are you sure you want to apply a Lifetime Ban? This blacklists their email.')) return;
        
        fetch(`${API_BASE}get_users.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'lifetime_ban', id: id, email: email })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) fetchUsers();
            else alert('Action failed.');
        });
    }

    window.deleteUser = function(id) {
        document.getElementById('delete-target-id').value = id;
        document.getElementById('delete-reason-input').value = '';
        document.getElementById('delete-reason-modal').style.display = 'block';
    }

    window.executeDeleteUser = function() {
        const id = document.getElementById('delete-target-id').value;
        const reason = document.getElementById('delete-reason-input').value.trim() || 'Admin deleted (No reason)';
        document.getElementById('delete-reason-modal').style.display = 'none';

        fetch(`${API_BASE}get_users.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'delete', id: id, reason: reason || 'Admin deleted (No reason)' })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchUsers(); // Re-fetch to update UI
            } else {
                alert('Action failed.');
            }
        });
    }

    if (courseForm) {
        courseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('course-name').value;
            const price = parseFloat(document.getElementById('course-price').value).toFixed(2);
            const imageInput = document.getElementById('course-image');
            const teacherName = document.getElementById('course-teacher').value;

            const formData = new FormData();
            formData.append('course_name', name);
            formData.append('course_price', price);
            if (teacherName) formData.append('external_teacher_name', teacherName);
            
            // Append image if selected
            if (imageInput && imageInput.files.length > 0) {
                formData.append('course_image', imageInput.files[0]);
            }

            fetch(`${API_BASE}add_course.php`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data && data.success) {
                courseForm.reset();
                alert(data.message || 'Course added successfully');
                    fetchCourses();
                } else {
                    // Defensive check to avoid "undefined"
                    const errorMsg = (data && (data.error || data.message)) ? (data.error || data.message) : 'Failed to add course.';
                    alert(errorMsg);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error connecting to server.');
            });
        });
    }

    // Edit User Form Handler
    const editUserForm = document.getElementById('edit-user-form');
    if (editUserForm) {
        editUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-user-id').value;
            const username = document.getElementById('edit-user-username').value;
            const email = document.getElementById('edit-user-email').value;
            const role = document.getElementById('edit-user-role').value;

            fetch(`${API_BASE}get_users.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    action: 'update_user', 
                    id: id, 
                    username: username, 
                    email: email, 
                    role: role 
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('edit-user-modal').style.display = 'none';
                    fetchUsers();
                    alert('User updated successfully');
                } else {
                    alert('Failed to update user');
                }
            });
        });
    }
    
    // Edit Course Form Handler
    const editCourseForm = document.getElementById('edit-course-form');
    if (editCourseForm) {
        editCourseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-course-id').value;
            const name = document.getElementById('edit-course-name').value;
            const price = document.getElementById('edit-course-price').value;

            fetch(`${API_BASE}edit_course.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: id, course_name: name, course_price: price })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('edit-course-modal').style.display = 'none';
                    fetchCourses();
                    alert('Course updated successfully');
                } else {
                    alert('Failed to update course: ' + (data.message || ''));
                }
            });
        });
    }

    function renderCourses() {
        if (!coursesTableBody) return;
        if (!Array.isArray(allCourses) || allCourses.length === 0) {
            coursesTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No courses found.</td></tr>`;
            return;
        }
        coursesTableBody.innerHTML = allCourses.map(course => `
            <tr>
                <td>${course.course_name}</td>
                <td>${course.teacher_name || 'Admin'}</td>
                <td>$${course.course_price}</td>
                <td>${course.status === 'pending' ? '<span class="status-badge" style="background:rgba(245,158,11,0.1); color:#f59e0b;">Pending</span>' : '<span class="status-badge" style="background:rgba(16,185,129,0.1); color:#10b981;">Approved</span>'}</td>
                <td>
                    ${course.status === 'pending' ? `<button class="table-btn unban" onclick="verifyCourse(${course.id})">Approve</button>` : ''}
                    <button class="table-btn" onclick="openEditCourseModal(${course.id})">Edit</button>
                    <button class="table-btn delete" onclick="deleteCourse(${course.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    function fetchCourses() {
        fetch(`${API_BASE}get_courses.php?t=${Date.now()}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                // Check for error OR if data is not an array (e.g. success:false message)
                if (data.error || !Array.isArray(data)) {
                    const msg = data.error || data.message || "Invalid data format";
                    console.error(msg);
                    
                    // Display error in the table so it's visible
                    if (coursesTableBody) {
                        coursesTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--danger);">Error: ${msg}</td></tr>`;
                    }
                    return;
                }
                allCourses = data;
                renderCourses();
                updateDashboardStats();
            })
            .catch(err => {
                console.error('Error fetching courses:', err);
                coursesTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--danger);">Failed to load course data.</td></tr>`;
            }
        );
    }

    function fetchDeletedLogsInitial() {
        fetch(`${API_BASE}get_deleted_users.php?t=${Date.now()}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                allDeletedLogs = data;
                updateDashboardStats();
            });
    }

    // Initial load
    fetchUsers();
    fetchCourses();
    fetchNotes();
    fetchPendingVideos();
    fetchDeletedLogsInitial();
    document.querySelector('.stat-card[data-filter="student"]').click(); // Start on Students tab
});

window.openEditUserModal = function(id) {
    // Access allUsers from the closure if possible, but since this is global, 
    // we might need to find the user from the DOM or fetch again. 
    // For simplicity, let's assume allUsers is accessible or we pass data.
    // Better approach: Find row and get data, or use the allUsers variable if scope allows.
    // Since allUsers is inside DOMContentLoaded, we can't access it directly here easily without refactoring.
    // Quick fix: We will rely on the fact that we can grab data from the row or just reload.
    // Actually, let's move this function INSIDE DOMContentLoaded or make allUsers global.
    // For this specific request, I'll assume we can just grab the data from the row for now or use a global var.
    // Let's use a simple trick:
    const row = document.querySelector(`tr[data-user-id="${id}"]`);
    if (row) {
        const username = row.children[0].textContent;
        const email = row.children[1].textContent;
        const roleText = row.children[2].textContent.trim();
        const role = roleText.toLowerCase().includes('teacher') ? 'teacher' : 'student';
        
        document.getElementById('edit-user-id').value = id;
        document.getElementById('edit-user-username').value = username;
        document.getElementById('edit-user-email').value = email;
        document.getElementById('edit-user-role').value = role;
        document.getElementById('edit-user-modal').style.display = 'block';
    }
};

window.openEditCourseModal = function(id) {
    const course = allCourses.find(c => c.id == id);
    if (course) {
        document.getElementById('edit-course-id').value = course.id;
        document.getElementById('edit-course-name').value = course.course_name;
        document.getElementById('edit-course-price').value = course.course_price;
        document.getElementById('edit-course-modal').style.display = 'block';
    }
};

window.verifyCourse = function(id) {
    if (!confirm('Approve this course for students to enroll?')) return;
    fetch(`${API_BASE}verify_course.php`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({ id: id })
    }).then(res => res.json()).then(data => {
        if (data && data.success) {
            alert('Course approved successfully!');
            fetchCourses();
        } else {
            alert('Failed to verify course: ' + (data.message || 'Unknown error'));
        }
    }).catch(err => {
        console.error(err);
        alert('Failed to connect to server.');
    });
}

window.deleteCourse = function(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    fetch(`${API_BASE}delete_course.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.success) {
            alert('Course deleted successfully!');
            fetchCourses();
        } else {
            alert((data && (data.error || data.message)) || 'Action failed.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Failed to connect to server.');
    });
}

window.onclick = function(event) {
    const userModal = document.getElementById('edit-user-modal');
    const kycModal = document.getElementById('kyc-modal');
    const courseModal = document.getElementById('edit-course-modal');
    const deleteModal = document.getElementById('delete-reason-modal');
    if (event.target == userModal) {
        userModal.style.display = "none";
    }
    if (event.target == kycModal) {
        kycModal.style.display = "none";
    }
    if (event.target == courseModal) {
        courseModal.style.display = "none";
    }
    if (event.target == deleteModal) {
        deleteModal.style.display = "none";
    }
}