<?php
require 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($_SESSION['admin_logged_in']) && !isset($_SESSION['teacher_logged_in'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']); 
    exit;
}

$id = $input['id'] ?? 0;
if (isset($_SESSION['teacher_logged_in']) && $_SESSION['teacher_logged_in'] === true && !isset($_SESSION['admin_logged_in'])) {
    $stmt = $conn->prepare("DELETE FROM courses WHERE id = ? AND teacher_id = ?");
    $stmt->bind_param("ii", $id, $_SESSION['user_id']);
} else {
    $stmt = $conn->prepare("DELETE FROM courses WHERE id = ?");
    $stmt->bind_param("i", $id);
}
if($stmt->execute()) echo json_encode(['success' => true]);
else echo json_encode(['success' => false, 'message' => $conn->error]);
?>