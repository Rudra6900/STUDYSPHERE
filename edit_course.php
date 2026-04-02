<?php
require 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($_SESSION['admin_logged_in']) && !isset($_SESSION['teacher_logged_in'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']); 
    exit;
}

$id = $input['id'] ?? 0;
$name = $input['course_name'] ?? '';
$price = floatval($input['course_price'] ?? 0);

if (isset($_SESSION['teacher_logged_in']) && $_SESSION['teacher_logged_in'] === true && !isset($_SESSION['admin_logged_in'])) {
    $stmt = $conn->prepare("UPDATE courses SET course_name = ?, course_price = ? WHERE id = ? AND teacher_id = ?");
    $stmt->bind_param("sdii", $name, $price, $id, $_SESSION['user_id']);
} else {
    $stmt = $conn->prepare("UPDATE courses SET course_name = ?, course_price = ? WHERE id = ?");
    $stmt->bind_param("sdi", $name, $price, $id);
}

if($stmt->execute()) echo json_encode(['success' => true]);
else echo json_encode(['success' => false, 'message' => $conn->error]);
?>