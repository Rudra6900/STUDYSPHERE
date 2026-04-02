<?php
require 'db.php';
header('Content-Type: application/json');

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

// Check credentials
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit;
}

$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0 && $user = $result->fetch_assoc()) {
    if (password_verify($password, $user['password'])) {

        if (isset($user['status']) && $user['status'] === 'banned') {
            echo json_encode(['success' => false, 'message' => 'Your account has been suspended.']);
            exit;
        }

        // Regenerate session ID to prevent session fixation and clear old data
        session_unset();
        session_regenerate_id(true);

        // Update last_login timestamp
        $updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $updateStmt->bind_param("i", $user['id']);
        $updateStmt->execute();

        // Set Session Variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'] ?? 'student';

        if (isset($user['role']) && $user['role'] === 'teacher') {
            $_SESSION['teacher_logged_in'] = true;
        }

        if (isset($user['role']) && $user['role'] === 'admin') {
            $_SESSION['admin_logged_in'] = true;
        }

        session_write_close(); // Ensure session is saved before output
        echo json_encode(['success' => true, 'username' => $user['username'], 'role' => $user['role'] ?? 'student', 'avatar' => $user['avatar'] ?? '']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
}
?>
