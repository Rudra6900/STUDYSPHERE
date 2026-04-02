<?php
require 'db.php';
header('Content-Type: application/json');

$isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

$sql = "SELECT n.*, u.username as teacher_name, c.course_name 
        FROM notes n 
        LEFT JOIN users u ON n.teacher_id = u.id 
        LEFT JOIN courses c ON n.course_id = c.id";

// Admins see everything (pending and approved). Students/Teachers only see approved notes.
if ($isAdmin) {
    $sql .= " ORDER BY n.created_at DESC";
} else {
    $sql .= " WHERE n.status = 'approved' ORDER BY n.created_at DESC";
}

$result = $conn->query($sql);
echo json_encode($result->fetch_all(MYSQLI_ASSOC));
?>