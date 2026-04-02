<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['teacher_logged_in']) || $_SESSION['teacher_logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? 0;
$teacher_id = $_SESSION['user_id'];

$stmt = $conn->prepare("UPDATE live_classes SET status = 'ended' WHERE id = ? AND teacher_id = ?");
$stmt->bind_param("ii", $id, $teacher_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>