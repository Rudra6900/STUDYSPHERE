<?php
require 'db.php';
header('Content-Type: application/json');

// This is a public endpoint, so no admin check is required.
// Any logged-in user can see available courses.

$result = $conn->query("SELECT * FROM courses WHERE status = 'approved' OR status IS NULL ORDER BY id DESC");
if ($result) {
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database query failed: ' . $conn->error]);
}
?>