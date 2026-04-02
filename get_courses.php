<?php
require 'db.php';
header('Content-Type: application/json');

$isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
$isTeacher = isset($_SESSION['teacher_logged_in']) && $_SESSION['teacher_logged_in'] === true;
$teacherOnly = isset($_GET['teacher_only']) && $_GET['teacher_only'] === 'true';

// Bulletproof Table Checks
$conn->query("CREATE TABLE IF NOT EXISTS courses (id INT AUTO_INCREMENT PRIMARY KEY, course_name VARCHAR(255) NOT NULL, course_price DECIMAL(10, 2) NOT NULL, course_image VARCHAR(255) DEFAULT NULL, teacher_id INT DEFAULT 0, status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
$checkTeacherId = $conn->query("SHOW COLUMNS FROM courses LIKE 'teacher_id'");
if ($checkTeacherId && $checkTeacherId->num_rows == 0) $conn->query("ALTER TABLE courses ADD COLUMN teacher_id INT DEFAULT 0");
$checkStatus = $conn->query("SHOW COLUMNS FROM courses LIKE 'status'");
if ($checkStatus && $checkStatus->num_rows == 0) $conn->query("ALTER TABLE courses ADD COLUMN status VARCHAR(20) DEFAULT 'pending'");
$checkExtTeacher = $conn->query("SHOW COLUMNS FROM courses LIKE 'external_teacher_name'");
if ($checkExtTeacher && $checkExtTeacher->num_rows == 0) $conn->query("ALTER TABLE courses ADD COLUMN external_teacher_name VARCHAR(255) DEFAULT NULL");

if ($isAdmin && !$teacherOnly) {
    $result = $conn->query("SELECT c.*, CASE WHEN u.username IS NOT NULL THEN u.username WHEN c.external_teacher_name IS NOT NULL AND c.external_teacher_name != '' THEN c.external_teacher_name ELSE 'Admin' END as teacher_name FROM courses c LEFT JOIN users u ON c.teacher_id = u.id ORDER BY c.id DESC");
} else if ($isTeacher) {
    $teacher_id = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT * FROM courses WHERE teacher_id = ? ORDER BY id DESC");
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!$result) {
    echo json_encode(['error' => 'Database Query Failed: ' . $conn->error]);
    exit;
}

echo json_encode($result->fetch_all(MYSQLI_ASSOC));
?>