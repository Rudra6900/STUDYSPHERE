<?php
// Handle CORS for cross-origin requests (e.g., Live Server to XAMPP)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

// Simple session start for maximum compatibility on localhost
session_set_cookie_params(0, '/');
session_start();
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$password = $input['password'] ?? '';

// List of valid admin codes
$valid_codes = ['admin123', 'Rudra121', 'pritush234','suhani989'];

if (in_array($password, $valid_codes)) {
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['is_admin'] = true; // Set for compatibility
    session_write_close(); // Ensure session is saved before redirect
    echo json_encode(['success' => true]);
} else {
    // Do not destroy session here, just deny access
    echo json_encode(['success' => false]);
}
?>