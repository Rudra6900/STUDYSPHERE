<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in']) && !isset($_SESSION['teacher_logged_in'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$course_name = $_POST['course_name'] ?? '';
$course_price = floatval($_POST['course_price'] ?? 0);

// Identify if upload is from Teacher based on the payload sent by teacher.js
$is_teacher_upload = isset($_POST['status']) && $_POST['status'] === 'pending';

if ($is_teacher_upload) {
    $status = 'pending'; // Teachers MUST be pending until admin approves
    $teacher_id = $_SESSION['user_id']; // Bind to the specific teacher
    $external_teacher_name = null;
} else {
    // Admin Upload
    $status = 'approved'; 
    $teacher_id = 0; // Admin courses belong to no specific teacher
    $external_teacher_name = $_POST['external_teacher_name'] ?? null;
}

// Handle Image Upload
$image_path = null;
if (isset($_FILES['course_image']) && $_FILES['course_image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'uploads/courses/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", basename($_FILES['course_image']['name']));
    $targetFilePath = $uploadDir . $fileName;
    if (move_uploaded_file($_FILES['course_image']['tmp_name'], $targetFilePath)) {
        $image_path = $targetFilePath;
    }
}

$stmt = $conn->prepare("INSERT INTO courses (course_name, course_price, course_image, teacher_id, status, external_teacher_name) VALUES (?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit;
}

$stmt->bind_param("sdsiss", $course_name, $course_price, $image_path, $teacher_id, $status, $external_teacher_name);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Course added successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add course: ' . $conn->error]);
}
?>