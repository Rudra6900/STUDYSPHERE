<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Access Denied']);
    exit;
}

$stmt = $conn->prepare("SELECT lc.id, lc.title, lc.local_video_path, lc.created_at, u.username as teacher_name FROM live_classes lc JOIN users u ON lc.teacher_id = u.id WHERE lc.status = 'pending_verification'");
$stmt->execute();
$result = $stmt->get_result();
echo json_encode($result->fetch_all(MYSQLI_ASSOC));
?>