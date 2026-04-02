<?php
require 'db.php';
if (session_status() === PHP_SESSION_NONE) session_start();

// Prevent browser caching of this page so it always checks the real DB status
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if (!isset($_SESSION['teacher_logged_in']) || $_SESSION['teacher_logged_in'] !== true) {
    header("Location: login.html");
    exit;
}

// Verify if Teacher has passed KYC
$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT verification_status, id_image FROM users WHERE id = ?");

if (!$stmt) {
    // Table columns are missing. Prompt user to run setup_db.php
    die("<h2>Database Needs Updating!</h2><p>Please visit <a href='setup_db.php'>setup_db.php</a> in your browser to run the database migrations and create the missing verification_status column.</p>");
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && $user['verification_status'] !== 'verified') {
    echo "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Teacher Verification</title><link href='https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap' rel='stylesheet'><style>body { background: #0f172a; color: white; font-family: 'Outfit', sans-serif; text-align: center; padding-top: 10vh; } .box { background: rgba(255,255,255,0.05); padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); display: inline-block; max-width: 500px; width: 90%; } a { color: #3b82f6; text-decoration: none; font-weight: bold; margin-top: 20px; display: inline-block; } .input-group { text-align: left; margin-bottom: 20px; } label { display: block; margin-bottom: 8px; color: #94a3b8; } input[type='file'] { width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); color: white; } button { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; font-size: 1rem; margin-top: 10px; } button:hover { background: #2563eb; }</style></head><body>";
    echo "<div class='box'>";
    
    if (empty($user['id_image'])) {
        echo "<h1 style='color:#f59e0b; margin-top:0;'>🔒 Account Verification</h1>";
        echo "<p style='color:#cbd5e1; line-height:1.6; margin-bottom: 30px;'>To ensure the safety of our students, please verify your identity before accessing the dashboard.</p>";
        
        echo "<form action='upload_kyc.php' method='POST' enctype='multipart/form-data'>";
        echo "<div class='input-group'><label>Upload Govt. ID (Aadhar, PAN, Voter ID)</label><input type='file' name='id_image' accept='image/*' required></div>";
        echo "<div class='input-group'><label>Capture Live Photo</label>";
        echo "<div style='display:flex; flex-direction:column; align-items:center; background:rgba(0,0,0,0.2); padding:15px; border-radius:8px;'>
                <div id='video-container' style='width:100%; max-width:300px; height:225px; background:#000; border-radius:8px; display:flex; justify-content:center; align-items:center; overflow:hidden;'>
                    <button type='button' id='start-cam-btn' style='background:#3b82f6; width:auto; padding:8px 20px; margin:0;'>📹 Start Camera</button>
                    <video id='video' width='100%' style='max-width:300px; display:none;' autoplay playsinline></video>
                </div>
                <button type='button' id='snap-btn' style='background:#10b981; margin-top:10px; width:auto; padding:8px 20px; display:none;'>📸 Take Photo</button>
                <canvas id='canvas' style='display:none;'></canvas>
                <input type='hidden' name='live_photo_base64' id='live_photo_base64' required>
                <p id='snap-status' style='color:#10b981; margin-top:10px; display:none;'>✔ Photo Captured!</p>
              </div>";
        echo "</div>";
        echo "<button type='submit' id='verify-submit-btn' style='opacity:0.5; pointer-events:none;'>Verify Now</button>";
        echo "</form>";

        echo "<script>
            const video = document.getElementById('video');
            const startCamBtn = document.getElementById('start-cam-btn');
            const canvas = document.getElementById('canvas');
            const snapBtn = document.getElementById('snap-btn');
            const hiddenInput = document.getElementById('live_photo_base64');
            const status = document.getElementById('snap-status');
            const submitBtn = document.getElementById('verify-submit-btn');

            startCamBtn.addEventListener('click', () => {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => { 
                        video.srcObject = stream; 
                        video.style.display = 'block';
                        startCamBtn.style.display = 'none';
                        snapBtn.style.display = 'block';
                    })
                    .catch(err => { console.error('Camera error:', err); alert('Camera access denied! Please allow camera permissions in your browser settings.'); });
            });

            snapBtn.addEventListener('click', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                hiddenInput.value = canvas.toDataURL('image/jpeg');
                status.style.display = 'block';
                snapBtn.textContent = '📸 Retake Photo';
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
            });
        </script>";
    } else {
        echo "<h1 style='color:#10b981; margin-top:0;'>⏳ Under Review</h1>";
        echo "<p style='color:#cbd5e1; line-height:1.6;'>Your documents have been submitted successfully. Our administration team is currently reviewing your profile.</p>";
        echo "<p style='color:#94a3b8; font-size: 0.9rem;'>This usually takes 24-48 hours. Thank you for your patience!</p>";
    }

    echo "<a href='logout.php'>Logout</a>";
    echo "</div></body></html>";
    exit;
}

$teacherName = $_SESSION['username']; 
include 'teacher_dashboard.html';
?>