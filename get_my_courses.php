<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("
    SELECT c.*, e.enrolled_at 
    FROM courses c 
    INNER JOIN enrollments e ON c.id = e.course_id 
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
?>