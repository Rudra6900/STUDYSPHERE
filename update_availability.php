<?php
require 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$is_available = (isset($input['is_available']) && $input['is_available']) ? 1 : 0;
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("UPDATE users SET is_available = ? WHERE id = ?"); // Removed peer_id update here, it's handled by teacher.js
$stmt->bind_param("ii", $is_available, $user_id);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $conn->error]);
}
?>