<?php
require 'db.php';
header('Content-Type: application/json');

$username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? 'student';

if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

// Strict Email Validation Backend
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/', $email)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format. Domain cannot start with a number.']);
    exit;
}

// Check if email already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already registered. Please login.']);
    exit;
}
$stmt->close();

// Check if username exists
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Username already taken.']);
    exit;
}
$stmt->close();

// Hash password and insert user
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

if ($role === 'teacher') {
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, role, verification_status) VALUES (?, ?, ?, ?, 'pending')");
    $stmt->bind_param("ssss", $username, $email, $hashed_password, $role);
} else {
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $username, $email, $hashed_password, $role);
}

if ($stmt->execute()) {
    // Regenerate session ID before setting new user's data to prevent session mix-up
    session_unset();
    session_regenerate_id(true);

    // Log the new user in immediately to prevent account mismatches
    $new_user_id = $conn->insert_id;
    $_SESSION['user_id'] = $new_user_id;
    $_SESSION['username'] = $username;
    $_SESSION['role'] = $role;
    if ($role === 'teacher') {
        $_SESSION['teacher_logged_in'] = true;
    }

    echo json_encode(['success' => true, 'username' => $username, 'role' => $role]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
}
?>