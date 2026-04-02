<?php
require 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Please login to enroll.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$course_id = $input['course_id'] ?? 0;
$points_used = intval($input['points_used'] ?? 0);

// Deduct points if user chose to apply them
if ($points_used > 0) {
    $conn->query("UPDATE users SET studysphere_points = GREATEST(0, studysphere_points - $points_used) WHERE id = $user_id");
}

// Check if user is already enrolled
$check = $conn->query("SELECT id FROM enrollments WHERE user_id = $user_id AND course_id = $course_id");
if ($check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'You are already enrolled in this course.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)");
$stmt->bind_param("ii", $user_id, $course_id);

if ($stmt->execute()) echo json_encode(['success' => true]);
else echo json_encode(['success' => false, 'message' => 'Failed to enroll: ' . $conn->error]);
?>