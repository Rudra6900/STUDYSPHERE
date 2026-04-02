<?php
// Enable error reporting to debug setup issues
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'db.php';

echo "<h1>Database Setup Status</h1>";

// Create Users Table (if it doesn't exist, your existing data is safe)
$sqlUsers = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    avatar VARCHAR(255) DEFAULT NULL,
    is_pro TINYINT(1) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sqlUsers) === TRUE) {
    echo "<p style='color:green'>✔ Table 'users' checked/created.</p>";
} else {
    echo "<p style='color:red'>✘ Error checking table 'users': " . $conn->error . "</p>";
}

// Create Courses Table
$sqlCourses = "CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_price DECIMAL(10, 2) NOT NULL,
    course_image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sqlCourses) === TRUE) {
    echo "<p style='color:green'>✔ Table 'courses' checked/created.</p>";
} else {
    echo "<p style='color:red'>✘ Error creating table 'courses': " . $conn->error . "</p>";
}

// Check/Add course_image column if missing (Migration)
$checkCol = $conn->query("SHOW COLUMNS FROM courses LIKE 'course_image'");
if ($checkCol && $checkCol->num_rows == 0) {
    $conn->query("ALTER TABLE courses ADD COLUMN course_image VARCHAR(255) DEFAULT NULL");
    echo "<p style='color:green'>✔ Added missing column 'course_image' to courses table.</p>";
}

// Check/Add teacher_id to courses table
$checkCourseTeacherCol = $conn->query("SHOW COLUMNS FROM courses LIKE 'teacher_id'");
if ($checkCourseTeacherCol && $checkCourseTeacherCol->num_rows == 0) {
    $conn->query("ALTER TABLE courses ADD COLUMN teacher_id INT DEFAULT NULL");
    echo "<p style='color:green'>✔ Added missing column 'teacher_id' to courses table.</p>";
}

// Check/Add status column to courses table
$checkCourseStatus = $conn->query("SHOW COLUMNS FROM courses LIKE 'status'");
if ($checkCourseStatus && $checkCourseStatus->num_rows == 0) {
    $conn->query("ALTER TABLE courses ADD COLUMN status VARCHAR(20) DEFAULT 'pending'");
    echo "<p style='color:green'>✔ Added missing column 'status' to courses table.</p>";
}

// Check/Add external_teacher_name to courses table for admin-added courses
$checkCourseExtTeacherCol = $conn->query("SHOW COLUMNS FROM courses LIKE 'external_teacher_name'");
if ($checkCourseExtTeacherCol && $checkCourseExtTeacherCol->num_rows == 0) {
    $conn->query("ALTER TABLE courses ADD COLUMN external_teacher_name VARCHAR(255) DEFAULT NULL");
    echo "<p style='color:green'>✔ Added 'external_teacher_name' column for admin-managed courses.</p>";
}

// Create Enrollments Table (Required for student enrollment)
$sqlEnrollments = "CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sqlEnrollments) === TRUE) {
    echo "<p style='color:green'>✔ Table 'enrollments' checked/created.</p>";
} else {
    echo "<p style='color:red'>✘ Error creating table 'enrollments': " . $conn->error . "</p>";
}

// Check/Add new columns to users table (KYC, Bans, Monetization, P2P)
$checkUserCols = $conn->query("SHOW COLUMNS FROM users LIKE 'verification_status'");
$setupUserCols = true;
if ($checkUserCols && $checkUserCols->num_rows == 0) {
    $alterUsersSql = "ALTER TABLE users 
        ADD COLUMN id_image VARCHAR(255) DEFAULT NULL,
        ADD COLUMN live_photo VARCHAR(255) DEFAULT NULL,
        ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending',
        ADD COLUMN blacklisted_email VARCHAR(255) DEFAULT NULL,
        ADD COLUMN blacklisted_ip VARCHAR(20) DEFAULT NULL,
        ADD COLUMN is_available TINYINT(1) DEFAULT 0,
        ADD COLUMN is_master TINYINT(1) DEFAULT 0,
        ADD COLUMN studysphere_points INT DEFAULT 0";
    if ($conn->query($alterUsersSql) === TRUE) {
        echo "<p style='color:green'>✔ Added KYC, Bans, Monetization, and P2P columns to 'users' table.</p>";
    } else {
        echo "<p style='color:red'>✘ Error altering 'users' table: " . $conn->error . "</p>";
    }
}

// Create Deleted Logs Table
// This is now the primary creation method with all columns to prevent errors on new setups.
// Migrations below will handle older setups.
$sqlDeletedLogs = "CREATE TABLE IF NOT EXISTS deleted_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(50) DEFAULT 'Unknown',
    email VARCHAR(100) DEFAULT 'Unknown',
    role VARCHAR(20) NOT NULL,
    reason VARCHAR(255) DEFAULT 'No reason provided',
    deletion_date DATETIME DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sqlDeletedLogs) === TRUE) {
    echo "<p style='color:green'>✔ Table 'deleted_logs' checked/created.</p>";
}

// --- MIGRATIONS for existing tables that might be missing columns ---
$migrations = [
    'deleted_logs' => [
        'reason' => "ADD COLUMN reason VARCHAR(255) DEFAULT 'No reason provided'",
        'username' => "ADD COLUMN username VARCHAR(50) DEFAULT 'Unknown'",
        'email' => "ADD COLUMN email VARCHAR(100) DEFAULT 'Unknown'"
    ]
];

foreach ($migrations as $table => $columns) {
    foreach ($columns as $column => $definition) {
        $checkCol = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
        if ($checkCol && $checkCol->num_rows == 0) {
            $conn->query("ALTER TABLE `$table` $definition");
        }
    }
}

// Create Server-Side Notifications Table for Cross-Device 1-on-1 Chats
$sqlNotifs = "CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_user VARCHAR(50) NOT NULL,
    sender_user VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    data TEXT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sqlNotifs) === TRUE) {
    echo "<p style='color:green'>✔ Table 'notifications' checked/created.</p>";
}

// Create Doubt Sessions Table
$sqlDoubtSessions = "CREATE TABLE IF NOT EXISTS doubt_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    student_id INT NOT NULL,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME DEFAULT NULL,
    charge_amount DECIMAL(10, 2) DEFAULT 0.00
)";
if ($conn->query($sqlDoubtSessions) === TRUE) {
    echo "<p style='color:green'>✔ Table 'doubt_sessions' checked/created.</p>";
}

// Create War Quiz Table
$sqlWarQuiz = "CREATE TABLE IF NOT EXISTS war_quiz (
    war_id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_name VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    option1 VARCHAR(255) NOT NULL,
    option2 VARCHAR(255) NOT NULL,
    option3 VARCHAR(255) NOT NULL,
    option4 VARCHAR(255) NOT NULL,
    correct_answer INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sqlWarQuiz) === TRUE) {
    echo "<p style='color:green'>✔ Table 'war_quiz' checked/created.</p>";
}

// Create Lessons Table
$sqlLessons = "CREATE TABLE IF NOT EXISTS lessons (
    lesson_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    fastest_completion_time DECIMAL(10, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sqlLessons) === TRUE) {
    echo "<p style='color:green'>✔ Table 'lessons' checked/created.</p>";
}

// Create Live Classes Table
$sqlLiveClasses = "CREATE TABLE IF NOT EXISTS live_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    scheduled_time DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    video_id VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sqlLiveClasses) === TRUE) {
    echo "<p style='color:green'>✔ Table 'live_classes' checked/created.</p>";
}

$checkLiveCatCol = $conn->query("SHOW COLUMNS FROM live_classes LIKE 'category'");
if ($checkLiveCatCol && $checkLiveCatCol->num_rows == 0) {
    $conn->query("ALTER TABLE live_classes ADD COLUMN category VARCHAR(50) DEFAULT 'General'");
    echo "<p style='color:green'>✔ Added missing column 'category' to live_classes table.</p>";
}

$checkLiveVideoCol = $conn->query("SHOW COLUMNS FROM live_classes LIKE 'local_video_path'");
if ($checkLiveVideoCol && $checkLiveVideoCol->num_rows == 0) {
    $conn->query("ALTER TABLE live_classes ADD COLUMN local_video_path VARCHAR(255) DEFAULT NULL");
    echo "<p style='color:green'>✔ Added missing column 'local_video_path' to live_classes table.</p>";
}

// Create Notes Table
$sqlNotes = "CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    course_id INT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($sqlNotes) === TRUE) {
    echo "<p style='color:green'>✔ Table 'notes' checked/created.</p>";
}

$checkNotesStatusCol = $conn->query("SHOW COLUMNS FROM notes LIKE 'status'");
if ($checkNotesStatusCol && $checkNotesStatusCol->num_rows == 0) {
    $conn->query("ALTER TABLE notes ADD COLUMN status VARCHAR(20) DEFAULT 'pending'");
    echo "<p style='color:green'>✔ Added missing column 'status' to notes table.</p>";
}

// Create Class Reviews Table
$sqlReviews = "CREATE TABLE IF NOT EXISTS class_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

echo "<hr><p>Setup complete. <a href='admin.html'>Go to Admin Panel</a> or <a href='classes.html'>Go to Classes</a>.</p>";
?>