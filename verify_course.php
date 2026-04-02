<?php
require 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']); 
    exit;
}

$id = $input['id'] ?? 0;
$stmt = $conn->prepare("UPDATE courses SET status = 'approved' WHERE id = ?");
$stmt->bind_param("i", $id);
if($stmt->execute()) echo json_encode(['success' => true]);
else echo json_encode(['success' => false, 'message' => $conn->error]);
?>