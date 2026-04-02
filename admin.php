<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.html"); // Redirect to login page
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <style>
        body {
            background-color: #25252b;
            color: #fff;
            font-family: 'Poppins', sans-serif;
            padding: 40px;
        }
        h1 { color: #e46033; margin-bottom: 20px; }
        table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        th { background-color: #e46033; color: #25252b; font-weight: 600; }
        tr:hover { background-color: rgba(255,255,255,0.1); }
        .btn-delete {
            background: #ff4444;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: 0.3s;
        }
        .btn-delete:hover { background: #cc0000; }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #e46033;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <a href="logout.php" class="back-link">← Logout</a>
    <h1>Admin Dashboard - User Registry</h1>
    <table>
        <thead>
            <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Password</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="user-table-body"></tbody>
    </table>

    <script>
        const tbody = document.getElementById('user-table-body');
        
        function loadUsers() {
            fetch('get_users.php')
                .then(res => res.text())
                .then(text => {
                    let users;
                    try {
                        users = JSON.parse(text);
                    } catch (e) {
                        if (text.trim().startsWith('<')) {
                            alert('Admin Panel Error: Server returned HTML instead of JSON.\nCheck console for details.');
                        }
                        console.error('Server Error:', text);
                        return;
                    }

                    tbody.innerHTML = '';
                    
                    if (users.error) {
                        alert('Error: ' + users.error);
                        return;
                    }
                    
                    if (!Array.isArray(users)) {
                        console.error('Expected array of users, got:', users);
                        return;
                    }

                    if (users.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#888;">No registered users found.</td></tr>';
                        return;
                    }
                    users.forEach(user => {
                        const isBanned = user.status === 'banned';
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.username}</td>
                            <td>${user.email || '-'}</td>
                            <td>${user.password}</td>
                            <td>${user.last_login || 'Never'}</td>
                            <td>
                                <span style="color:${isBanned ? '#ff4444' : '#00C851'}; font-weight:bold;">
                                    ${isBanned ? 'Banned' : 'Active'}
                                </span>
                            </td>
                            <td>
                                <button class="btn-delete" style="background:${isBanned ? '#00C851' : '#ffbb33'}; margin-right:5px;" onclick="toggleBan(${user.id})">
                                    ${isBanned ? 'Unban' : 'Ban'}
                                </button>
                                <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                });
        }

        window.toggleBan = function(id) {
            fetch('get_users.php', {
                method: 'POST',
                body: JSON.stringify({ id: id, action: 'toggle_ban' }),
                headers: { 'Content-Type': 'application/json' }
            }).then(() => loadUsers());
        };

        window.deleteUser = function(id) {
            if(confirm('Are you sure you want to delete this user?')) {
                fetch('get_users.php', {
                    method: 'POST',
                    body: JSON.stringify({ id: id, action: 'delete' }),
                    headers: { 'Content-Type': 'application/json' }
                }).then(() => loadUsers());
            }
        };

        loadUsers();
    </script>
</body>
</html>