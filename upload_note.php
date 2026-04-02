<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['teacher_logged_in']) || $_SESSION['teacher_logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$title = $_POST['title'] ?? 'Untitled Note';
$course_id = !empty($_POST['course_id']) ? intval($_POST['course_id']) : NULL;
$teacher_id = $_SESSION['user_id'];

if (!isset($_FILES['note_file']) || $_FILES['note_file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'File upload failed or was too large.']);
    exit;
}

$uploadDir = 'uploads/notes/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", basename($_FILES['note_file']['name']));
$targetFilePath = $uploadDir . $fileName;

if (move_uploaded_file($_FILES['note_file']['tmp_name'], $targetFilePath)) {
    // Status is explicitly set to 'pending'
    $stmt = $conn->prepare("INSERT INTO notes (teacher_id, course_id, title, file_path, status) VALUES (?, ?, ?, ?, 'pending')");
    $stmt->bind_param("iiss", $teacher_id, $course_id, $title, $targetFilePath);
    if ($stmt->execute()) echo json_encode(['success' => true]);
    else echo json_encode(['success' => false, 'message' => 'Database Error: ' . $conn->error]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save file to server. Check folder permissions.']);
}
?>