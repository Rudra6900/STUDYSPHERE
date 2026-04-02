<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Access Denied']);
    exit;
}

$stmt = $conn->prepare("SELECT log_id, user_id, username, email, role, reason, deletion_date FROM deleted_logs ORDER BY deletion_date DESC");
$stmt->execute();
$result = $stmt->get_result();
echo json_encode($result->fetch_all(MYSQLI_ASSOC));
?>