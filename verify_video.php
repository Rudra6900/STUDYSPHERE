<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access Denied']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? 0;
$action = $data['action'] ?? '';

if ($action === 'approve') {
    // Approve video so it shows up for students as recorded
    $stmt = $conn->prepare("UPDATE live_classes SET status = 'ended' WHERE id = ?");
    $stmt->bind_param("i", $id);
    if($stmt->execute()) echo json_encode(['success' => true]);
} else if ($action === 'reject') {
    // Delete the file and the database record
    $stmt = $conn->prepare("SELECT local_video_path FROM live_classes WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    if($res && !empty($res['local_video_path']) && file_exists($res['local_video_path'])) {
        @unlink($res['local_video_path']);
    }
    $del = $conn->prepare("DELETE FROM live_classes WHERE id = ?");
    $del->bind_param("i", $id);
    if($del->execute()) echo json_encode(['success' => true]);
}
?>