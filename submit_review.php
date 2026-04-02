<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];

$data = json_decode(file_get_contents('php://input'), true);
$classId = $data['class_id'] ?? 0;
$rating = $data['rating'] ?? 0;
$comment = $data['comment'] ?? '';

if (empty($classId) || empty($rating)) {
    echo json_encode(['success' => false, 'message' => 'Missing class_id or rating']);
    exit;
}

if ($rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid rating (must be 1-5)']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO class_reviews (class_id, user_id, rating, comment) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiis", $classId, $userId, $rating, $comment);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}
?>