<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['teacher_logged_in']) || $_SESSION['teacher_logged_in'] !== true) {
    echo json_encode(['credits' => 0]);
    exit;
}

$teacher_id = $_SESSION['user_id'];

// Fetch all completed doubt sessions for this teacher
$stmt = $conn->prepare("SELECT start_time, end_time FROM doubt_sessions WHERE teacher_id = ? AND end_time IS NOT NULL");
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();

$total_credits = 0;

while ($row = $result->fetch_assoc()) {
    $start = strtotime($row['start_time']);
    $end = strtotime($row['end_time']);
    
    if ($end > $start) {
        $minutes = ceil(($end - $start) / 60);
        $hours = ceil($minutes / 60); // Rounds up to the nearest hour
        $total_credits += ($hours * 10);
    }
}

echo json_encode(['credits' => $total_credits]);
?>
