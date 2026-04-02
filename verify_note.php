<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? 0;
$action = $input['action'] ?? '';

$status = ($action === 'approve') ? 'approved' : 'rejected';

$stmt = $conn->prepare("UPDATE notes SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

echo json_encode(['success' => $stmt->execute()]);
?>