<?php
// Handle CORS for development environments (e.g., Live Server)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

require 'db.php'; // Include database connection
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];
$amount = $input['amount'] ?? 499;

// In a real application, you would process payment with a gateway here.
// For this practice, we simulate success and update the database.

$stmt = $conn->prepare("UPDATE users SET is_pro = 1 WHERE id = ?");
$stmt->bind_param("i", $userId);

if ($stmt->execute()) {
    $_SESSION['is_pro'] = true; // Update session state
    $orderId = 'SS_ORD_' . strtoupper(uniqid());

    // Return success response
    echo json_encode(['success' => true, 'message' => 'Upgrade successful!', 'orderId' => $orderId, 'amount' => $amount]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database update failed.']);
}
?>