<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$question_text = $input['question_text'] ?? '';
$user_id = $_SESSION['user_id'];
$username = $_SESSION['username']; // Assuming username is stored in session

if (empty($question_text)) {
    echo json_encode(['success' => false, 'message' => 'Question cannot be empty.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO questions (user_id, username, question_text) VALUES (?, ?, ?)");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit;
}

$stmt->bind_param("iss", $user_id, $username, $question_text);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Question posted successfully!', 'id' => $conn->insert_id, 'created_at' => date('Y-m-d H:i:s'), 'username' => $username, 'user_id' => $user_id, 'status' => 'open']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to post question: ' . $conn->error]);
}
?>