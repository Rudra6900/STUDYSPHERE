<?php
require 'db.php';
header('Content-Type: application/json');

$result = $conn->query("SELECT username, COALESCE(studysphere_points, 0) as points FROM users WHERE role = 'student' ORDER BY points DESC LIMIT 10");

if ($result) {
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
} else {
    echo json_encode([]);
}
?>