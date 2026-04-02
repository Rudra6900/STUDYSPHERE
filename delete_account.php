<?php
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}

$id = $_SESSION['user_id'];

// 1. Get user's info before deletion
$get_user_stmt = $conn->prepare("SELECT username, email, role FROM users WHERE id = ?");
$get_user_stmt->bind_param("i", $id);
$get_user_stmt->execute();
$result = $get_user_stmt->get_result();
$user = $result->fetch_assoc();
$role = $user['role'] ?? 'unknown';
$username = $user['username'] ?? 'unknown_user';
$email = $user['email'] ?? 'unknown_email';

// 2. Log deletion
$reason = "User self-deleted account";

// Guarantee Table Exists Before Altering
$conn->query("CREATE TABLE IF NOT EXISTS deleted_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(50) DEFAULT 'Unknown',
    email VARCHAR(100) DEFAULT 'Unknown',
    role VARCHAR(20) NOT NULL,
    reason VARCHAR(255) DEFAULT 'No reason provided',
    deletion_date DATETIME DEFAULT CURRENT_TIMESTAMP
)");

$checkCol = $conn->query("SHOW COLUMNS FROM deleted_logs LIKE 'email'");
if ($checkCol && $checkCol->num_rows == 0) {
    $conn->query("ALTER TABLE deleted_logs ADD COLUMN email VARCHAR(100) DEFAULT 'Unknown'");
}
$checkUserCol = $conn->query("SHOW COLUMNS FROM deleted_logs LIKE 'username'");
if ($checkUserCol && $checkUserCol->num_rows == 0) {
    $conn->query("ALTER TABLE deleted_logs ADD COLUMN username VARCHAR(50) DEFAULT 'Unknown'");
}
$checkReasonCol = $conn->query("SHOW COLUMNS FROM deleted_logs LIKE 'reason'");
if ($checkReasonCol && $checkReasonCol->num_rows == 0) {
    $conn->query("ALTER TABLE deleted_logs ADD COLUMN reason VARCHAR(255) DEFAULT 'No reason provided'");
}

$log_stmt = $conn->prepare("INSERT INTO deleted_logs (user_id, username, email, role, reason) VALUES (?, ?, ?, ?, ?)");

if ($log_stmt === false) {
    die("<h1>Critical Database Error</h1><p>The `deleted_logs` table schema is out of date.</p><p>Please run the <a href='setup_db.php'>Database Setup Script</a> to fix this issue.</p><p><strong>Error:</strong> " . $conn->error . "</p>");
}

$log_stmt->bind_param("issss", $id, $username, $email, $role, $reason);
$log_stmt->execute();

// 3. Delete user from database
$delete_stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$delete_stmt->bind_param("i", $id);
$delete_stmt->execute();
session_destroy();
header("Location: login.html");
?>