<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT username, peer_id FROM users WHERE id = ?"); // Now peer_id is retrieved for sender
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$currentUser = $user['username'] ?? '';

if (empty($currentUser)) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'send' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $target = $input['target'] ?? '';
    $type = $input['type'] ?? '';
    $data = isset($input['data']) ? json_encode($input['data']) : '{}';

    $stmt = $conn->prepare("INSERT INTO notifications (target_user, sender_user, type, data) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $target, $currentUser, $type, $data);
    if ($stmt->execute()) echo json_encode(['success' => true]);
    else echo json_encode(['success' => false, 'message' => $conn->error]);

    exit;
}

if ($action === 'poll') {
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE target_user = ? AND is_read = 0 ORDER BY created_at ASC");
    $stmt->bind_param("s", $currentUser);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    if (count($result) > 0) {
        $update = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE target_user = ? AND is_read = 0");
        $update->bind_param("s", $currentUser);
        $update->execute();
    }
    echo json_encode($result);
    exit;
}

if ($action === 'get_requests') {
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE target_user = ? AND type = '1on1_request' AND is_read = 0 ORDER BY created_at DESC");
    $stmt->bind_param("s", $currentUser);
    $stmt->execute();
    echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    exit;
}

if ($action === 'set_peer_id' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $peer_id = $input['peer_id'] ?? null;
    if ($peer_id) {
        $stmt = $conn->prepare("UPDATE users SET peer_id = ? WHERE id = ?");
        $stmt->bind_param("si", $peer_id, $user_id);
        if ($stmt->execute()) echo json_encode(['success' => true]);
        else echo json_encode(['success' => false, 'message' => $conn->error]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Peer ID not provided']);
    }
    exit;
}

if ($action === 'clear_peer_id' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $conn->prepare("UPDATE users SET peer_id = NULL WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    if ($stmt->execute()) echo json_encode(['success' => true]);
    else echo json_encode(['success' => false, 'message' => $conn->error]);
    exit;
}


echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>