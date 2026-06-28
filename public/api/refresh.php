<?php declare(strict_types=1);

require_once __DIR__ . '/db.php';

// ============================================================
// Endpoint: POST /api/refresh.php
// Dùng Refresh Token (từ HttpOnly Cookie) để cấp Access Token mới
// ============================================================

app_send_json_headers('POST, OPTIONS');
app_handle_options_request();
app_require_method(['POST']);

$cookieName   = 'tam_refresh';
$refreshToken = trim((string) ($_COOKIE[$cookieName] ?? ''));

if ($refreshToken === '') {
    app_json_response(401, ['success' => false, 'message' => 'Refresh token missing']);
}

$secret = trim((string) app_env('JWT_SECRET', ''));
if ($secret === '') {
    app_json_response(500, ['success' => false, 'message' => 'Server auth secret is not configured']);
}

// Xác minh Refresh Token
$payload = app_verify_jwt($refreshToken, $secret . '_refresh');

if (!is_array($payload) || ($payload['type'] ?? '') !== 'refresh') {
    // Xoá cookie bị lỗi
    setcookie($cookieName, '', ['expires' => time() - 3600, 'path' => trim((string) app_env('ADMIN_COOKIE_PATH', '/api')), 'httponly' => true, 'samesite' => 'Strict']);
    app_json_response(401, ['success' => false, 'message' => 'Invalid or expired refresh token']);
}

$adminId = (int) ($payload['sub'] ?? 0);
if ($adminId <= 0) {
    app_json_response(401, ['success' => false, 'message' => 'Invalid token payload']);
}

// Kiểm tra admin vẫn còn tồn tại trong database
try {
    $pdo = app_pdo();
} catch (Throwable $exception) {
    app_json_response(500, ['success' => false, 'message' => 'Database connection failed']);
}

$stmt = $pdo->prepare('SELECT id, username, display_name FROM admins WHERE id = :id LIMIT 1');
$stmt->execute(['id' => $adminId]);
$admin = $stmt->fetch();

if (!is_array($admin)) {
    app_json_response(401, ['success' => false, 'message' => 'Admin account not found or disabled']);
}

// ============================================================
// Phát hành Access Token mới (ngắn hạn)
// ============================================================
$accessExpiresIn = max(300, app_env_int('ADMIN_JWT_EXPIRES', 28800));
$now             = time();
$accessExpiresAt = $now + $accessExpiresIn;

$accessToken = app_create_jwt([
    'sub'      => (int) $admin['id'],
    'username' => (string) $admin['username'],
    'iat'      => $now,
    'exp'      => $accessExpiresAt,
], $secret);

app_json_response(200, [
    'success'   => true,
    'token'     => $accessToken,
    'expiresIn' => $accessExpiresIn,
    'expiresAt' => $accessExpiresAt,
    'user'      => [
        'id'          => (int) $admin['id'],
        'username'    => (string) $admin['username'],
        'displayName' => (string) $admin['display_name'],
    ],
]);
