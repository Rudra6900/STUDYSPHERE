<?php
// Start output buffering to catch any unexpected output/errors

// Ensure session is started for all API calls
if (session_status() === PHP_SESSION_NONE) {
    // Set a standard session cookie (1 day lifetime, root path)
    session_set_cookie_params(86400, '/');
    session_start();
}

// Start output buffering AFTER session_start() to avoid "headers already sent" issues
ob_start();

// Disable error reporting to prevent HTML breaking JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING); // Show errors but hide notices/warnings in production API
ini_set('display_errors', 0);

// Allow CORS so file:/// debugging works
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");

// Handle Preflight OPTIONS request (Fix for "Failed to fetch" on Live Server)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Disable mysqli exceptions (PHP 8+ default) so we can handle errors manually
mysqli_report(MYSQLI_REPORT_OFF);

// Handle Fatal Errors gracefully by returning JSON
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        // If there's any output buffering active, clean it.
        // This prevents partial HTML/text from breaking JSON response
        while (ob_get_level() > 0) ob_end_clean(); 
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Critical Server Error: ' . $error['message']]);
    }
});

$host = '127.0.0.1';
$db = 'studysphere';
$user = 'root';
$pass = ''; // Default XAMPP password is empty

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    if (ob_get_length()) ob_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}
?>
