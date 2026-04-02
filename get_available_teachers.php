<?php
require 'db.php';
header('Content-Type: application/json');

// Fetch all active teachers who have toggled their availability to ON
$stmt = $conn->query("SELECT id, username, peer_id FROM users WHERE role = 'teacher' AND is_available = 1 AND status = 'active' ORDER BY username ASC");

if ($stmt) {
    echo json_encode($stmt->fetch_all(MYSQLI_ASSOC));
} else {
    echo json_encode([]);
}
?>