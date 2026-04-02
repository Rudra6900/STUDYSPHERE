<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = file_get_contents('php://input');

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => $input,
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);
$result = @file_get_contents('https://wandbox.org/api/compile.json', false, $context);

if ($result === FALSE) {
    echo json_encode(['status' => -1, 'program_error' => 'Failed to reach compilation server from PHP backend.']);
} else {
    // Safely verify if the result is valid JSON
    json_decode($result);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['status' => -1, 'program_error' => 'Compilation API Error: ' . trim($result)]);
    } else {
        echo $result;
    }
}
?>