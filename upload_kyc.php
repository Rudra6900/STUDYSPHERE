<?php
require 'db.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (!isset($_SESSION['teacher_logged_in']) || $_SESSION['teacher_logged_in'] !== true) {
    header("Location: login.html");
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $id_image_path = null;
    $live_photo_path = null;

    if (isset($_FILES['id_image']) && $_FILES['id_image']['error'] == 0) {
        $id_image_path = $uploadDir . time() . '_id_' . basename($_FILES['id_image']['name']);
        move_uploaded_file($_FILES['id_image']['tmp_name'], $id_image_path);
    }
    
    // Handle Base64 Live Photo Capture
    if (!empty($_POST['live_photo_base64'])) {
        $base64_string = $_POST['live_photo_base64'];
        $image_parts = explode(";base64,", $base64_string);
        $image_base64 = base64_decode($image_parts[1]);
        $live_photo_path = $uploadDir . time() . '_live.jpg';
        file_put_contents($live_photo_path, $image_base64);
    } elseif (isset($_FILES['live_photo']) && $_FILES['live_photo']['error'] == 0) {
        $live_photo_path = $uploadDir . time() . '_live_' . basename($_FILES['live_photo']['name']);
        move_uploaded_file($_FILES['live_photo']['tmp_name'], $live_photo_path);
    }

    $stmt = $conn->prepare("UPDATE users SET id_image = ?, live_photo = ? WHERE id = ?");
    $stmt->bind_param("ssi", $id_image_path, $live_photo_path, $user_id);
    $stmt->execute();

    // Notify Admin via Email
    $admin_email = "admin@example.com";
    $subject = "New Teacher KYC Verification Pending";
    $message = "A teacher (User ID: $user_id) has uploaded their KYC documents and is waiting for verification.\n\nPlease log in to the admin panel to verify them.";
    $headers = "From: noreply@example.com\r\nReply-To: noreply@example.com\r\n";
    
    @mail($admin_email, $subject, $message, $headers); // @ suppresses errors if XAMPP mailserver isn't configured
}
header("Location: teacher.php");
exit;
?>