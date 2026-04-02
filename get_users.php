<?php
require 'db.php';
header('Content-Type: application/json');

// Get JSON input for Admin actions (Ban/Delete)
$input = json_decode(file_get_contents('php://input'), true);

// --- ADMIN LOGIC ---
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    
    // Handle POST actions (Ban/Delete)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $input['action'] ?? '';
        $id = $input['id'] ?? 0;

        if ($action === 'delete') {
            $reason = $input['reason'] ?? 'No reason provided';
            // 1. Get file paths before deleting the user
            $get_files_stmt = $conn->prepare("SELECT username, email, role, id_image, live_photo FROM users WHERE id = ?");
            $get_files_stmt->bind_param("i", $id);
            $get_files_stmt->execute();
            $result = $get_files_stmt->get_result();
            $user_files = $result->fetch_assoc();

            // 2. Delete the files from the server if they exist
            if ($user_files) {
                if (!empty($user_files['id_image']) && file_exists($user_files['id_image'])) {
                    @unlink($user_files['id_image']); // Use @ to suppress warnings if file is somehow gone
                }
                if (!empty($user_files['live_photo']) && file_exists($user_files['live_photo'])) {
                    @unlink($user_files['live_photo']);
                }
                
                // 2.5 Log deletion to the deleted_logs table
                $role = $user_files['role'];
                $username = $user_files['username'];
                $email = $user_files['email'];

                // Guarantee Table Exists Before Altering
                $conn->query("CREATE TABLE IF NOT EXISTS deleted_logs (
                    log_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    username VARCHAR(50) DEFAULT 'Unknown',
                    email VARCHAR(100) DEFAULT 'Unknown',
                    role VARCHAR(20) NOT NULL,
                    reason VARCHAR(255) DEFAULT 'No reason provided',
                    deletion_date DATETIME DEFAULT CURRENT_TIMESTAMP
                )");

                // Auto-migrate if schema is missing columns
                $checkCol = $conn->query("SHOW COLUMNS FROM deleted_logs LIKE 'email'");
                if ($checkCol && $checkCol->num_rows == 0) {
                    $conn->query("ALTER TABLE deleted_logs ADD COLUMN email VARCHAR(100) DEFAULT 'Unknown'");
                }
                $checkUserCol = $conn->query("SHOW COLUMNS FROM deleted_logs LIKE 'username'");
                if ($checkUserCol && $checkUserCol->num_rows == 0) {
                    $conn->query("ALTER TABLE deleted_logs ADD COLUMN username VARCHAR(50) DEFAULT 'Unknown'");
                }
                $checkReasonCol = $conn->query("SHOW COLUMNS FROM deleted_logs LIKE 'reason'");
                if ($checkReasonCol && $checkReasonCol->num_rows == 0) {
                    $conn->query("ALTER TABLE deleted_logs ADD COLUMN reason VARCHAR(255) DEFAULT 'No reason provided'");
                }

                $log_stmt = $conn->prepare("INSERT INTO deleted_logs (user_id, username, email, role, reason) VALUES (?, ?, ?, ?, ?)");
                if ($log_stmt) {
                    $log_stmt->bind_param("issss", $id, $username, $email, $role, $reason);
                    $log_stmt->execute();
                }
            }
            $get_files_stmt->close();

            // 3. Delete user from database
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(['success' => true]);
            exit;
        } elseif ($action === 'toggle_ban') {
            // Toggle status between 'active' and 'banned'
            $stmt = $conn->prepare("UPDATE users SET status = IF(status='banned', 'active', 'banned') WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(['success' => true]);
        }  elseif ($action === 'lifetime_ban') {
            $email = $input['email'] ?? '';
            // Blacklist email and ban user
            $stmt = $conn->prepare("UPDATE users SET status = 'banned', blacklisted_email = ? WHERE id = ?");
            $stmt->bind_param("si", $email, $id);
            $stmt->execute();
            echo json_encode(['success' => true]);
            exit;
        } elseif ($action === 'update_user') {
            $username = $input['username'] ?? '';
            $email = $input['email'] ?? '';
            $role = $input['role'] ?? 'student';
            
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?");
            $stmt->bind_param("sssi", $username, $email, $role, $id);
            $stmt->execute();
            echo json_encode(['success' => true]);
            exit;
        } elseif ($action === 'verify_teacher') {
            // 1. Get the teacher's email before updating
            $stmt = $conn->prepare("SELECT email, username FROM users WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $teacher = $stmt->get_result()->fetch_assoc();

            // 2. Verify the teacher
            $stmt = $conn->prepare("UPDATE users SET verification_status = 'verified' WHERE id = ?");
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                // 3. Send automated email notification
                // DISABLED FOR LOCALHOST: mail() blocks XAMPP threads for 60 seconds if SMTP is not configured.
                // if ($teacher && !empty($teacher['email'])) {
                //     $to = $teacher['email'];
                //     $subject = "Account Verified - StudySphere";
                //     $message = "Hello " . $teacher['username'] . ",\n\nGood news! Your teacher account has been successfully verified by our administration team.\n\nYou can now log in and access your dashboard to start taking classes.\n\nWelcome to StudySphere!";
                //     $headers = "From: noreply@example.com\r\nReply-To: noreply@example.com\r\n";
                //     @mail($to, $subject, $message, $headers); 
                // }
                echo json_encode(['success' => true]);
            }
            exit;
        } elseif ($action === 'unverify_teacher') {
            $stmt = $conn->prepare("UPDATE users SET verification_status = 'pending' WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(['success' => true]);
            exit;
        }
    }

    // Admin View: Fetch ALL users
    $result = $conn->query("SELECT * FROM users");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    exit;
}

// --- TEACHER LOGIC (RESTRICTED) ---
$action = $_GET['action'] ?? ($input['action'] ?? '');
if (isset($_SESSION['user_id']) && $_SESSION['role'] === 'teacher' && $action === 'teacher_students') {
    $teacher_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("
        SELECT DISTINCT u.id, u.username, u.email, u.last_login, u.status 
        FROM users u
        INNER JOIN enrollments e ON u.id = e.user_id
        INNER JOIN courses c ON e.course_id = c.id
        WHERE c.teacher_id = ? AND u.role = 'student'
    ");
    if (!$stmt) {
        echo json_encode(['error' => 'Database query preparation failed: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if (!$result) {
        echo json_encode(['error' => 'Failed to retrieve students: ' . $conn->error]);
        exit;
    }

    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    exit;
}

// --- UNAUTHORIZED ---
http_response_code(403);
echo json_encode(['error' => 'Access Denied']);
?>