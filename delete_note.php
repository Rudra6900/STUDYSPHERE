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

if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'Note ID is required.']);
    exit;
}

$stmt = $conn->prepare("SELECT file_path FROM notes WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
if ($note = $result->fetch_assoc()) {
    if (file_exists($note['file_path'])) @unlink($note['file_path']);
}

$del = $conn->prepare("DELETE FROM notes WHERE id = ?");
$del->bind_param("i", $id);
if ($del->execute()) echo json_encode(['success' => true]);
else echo json_encode(['success' => false, 'message' => 'Database error']);
?>