<?php
// chat_api.php

// 1. BASIC SETUP
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

// 2. CONFIGURATION
// !!! IMPORTANT: PASTE YOUR GOOGLE API KEY BELOW !!!
$apiKey = 'PASTE_YOUR_API_KEY_HERE'; 

// 3. GET USER MESSAGE
$input = json_decode(file_get_contents('php://input'), true);
$userMessage = $input['message'] ?? '';
$history = $input['history'] ?? [];

if (empty($userMessage)) {
    echo json_encode(['reply' => 'Hi there!']);
    exit;
}

// 4. PREPARE DATA FOR AI
$contents = [];
$systemPrompt = "You are STU, a helpful AI study assistant.";

if (!empty($history)) {
    foreach ($history as $index => $msg) {
        $text = $msg['parts'][0]['text'] ?? '';
        if ($index === 0 && $msg['role'] === 'user') {
            $text = $systemPrompt . "\n\n" . $text;
        }
        $contents[] = [
            "role" => ($msg['role'] === 'user') ? 'user' : 'model',
            "parts" => [["text" => $text]]
        ];
    }
} else {
    $contents[] = [
        "role" => "user",
        "parts" => [["text" => $systemPrompt . "\n\nUser: " . $userMessage]]
    ];
}

$payload = ["contents" => $contents];
$apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . trim($apiKey);

// 5. SEND TO GOOGLE
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 6. RETURN RESPONSE
if ($httpCode === 200) {
    $data = json_decode($response, true);
    $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? "I'm not sure how to answer that.";
    
    // Simple formatting
    $reply = preg_replace('/\*\*(.*?)\*\*/', '<b>$1</b>', $reply);
    $reply = nl2br($reply);

    echo json_encode(['reply' => $reply]);
} else {
    echo json_encode(['reply' => "⚠️ Error ($httpCode). Please check your API Key in chat_api.php."]);
}
?>