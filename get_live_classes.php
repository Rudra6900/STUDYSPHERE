<?php
require 'db.php';
header('Content-Type: application/json');

$teacher_only = isset($_GET['teacher_only']) && $_GET['teacher_only'] === 'true';

if ($teacher_only) {
    if (!isset($_SESSION['teacher_logged_in']) || $_SESSION['teacher_logged_in'] !== true) {
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    $teacher_id = $_SESSION['user_id'];
    $stmt = $conn->prepare("
        SELECT id, title, scheduled_time, status, video_id 
        FROM live_classes WHERE teacher_id = ? ORDER BY scheduled_time DESC
    ");
    $stmt->bind_param("i", $teacher_id);
} else {
    $stmt = $conn->prepare("
        SELECT lc.id, lc.title, lc.scheduled_time, lc.status, lc.video_id, u.username as teacher_name 
        FROM live_classes lc JOIN users u ON lc.teacher_id = u.id ORDER BY lc.scheduled_time ASC
    ");
}

$stmt->execute();
$result = $stmt->get_result();
$classes = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($classes);
?>