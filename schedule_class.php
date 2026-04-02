<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['teacher_logged_in'])) { 
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit; 
}

$data = json_decode(file_get_contents('php://input'), true);
$title = $data['title'] ?? '';
$scheduled_time = $data['scheduled_time'] ?? '';
$video_id = $data['video_id'] ?? 'jfKfPfyJRdk';
$teacher_id = $_SESSION['user_id'];

if (empty($title) || empty($scheduled_time)) {
    echo json_encode(['success' => false, 'message' => 'Title and time are required.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO live_classes (teacher_id, title, scheduled_time, video_id) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $teacher_id, $title, $scheduled_time, $video_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
?>