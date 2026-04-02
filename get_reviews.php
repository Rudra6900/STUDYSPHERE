<?php
require 'db.php';
header('Content-Type: application/json');

$classId = $_GET['class_id'] ?? 0;

if (empty($classId)) {
    echo json_encode(['error' => 'Missing class_id']);
    exit;
}

$stmt = $conn->prepare("SELECT review_id, user_id, rating, comment, created_at FROM class_reviews WHERE class_id = ?");
$stmt->bind_param("i", $classId);
$stmt->execute();
$result = $stmt->get_result();

if ($result) {
    $reviews = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($reviews);
} else {
    echo json_encode(['error' => 'Failed to fetch reviews']);
}
?>