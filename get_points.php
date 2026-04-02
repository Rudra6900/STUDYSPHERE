<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['points' => 0]);
    exit;
}

$stmt = $conn->prepare("SELECT studysphere_points FROM users WHERE id = ?");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
echo json_encode(['points' => $user ? (int)$user['studysphere_points'] : 0]);
?>