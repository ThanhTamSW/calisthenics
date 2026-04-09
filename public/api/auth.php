<?php declare(strict_types=1);

require_once __DIR__ . '/db.php';

app_send_json_headers('POST, OPTIONS');
app_handle_options_request();
app_require_method(['POST']);

try {
    $pdo = app_pdo();
} catch (Throwable $exception) {
    app_json_response(500, ['success' => false, 'message' => 'Database connection failed']);
}

$data = app_read_json_body();

$username = trim((string) ($data['username'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($username === '' || $password === '') {
    app_json_response(422, ['success' => false, 'message' => 'Username and password are required']);
}

$stmt = $pdo->prepare('SELECT id, username, display_name, password_hash FROM admins WHERE username = :username LIMIT 1');
$stmt->execute(['username' => $username]);
$admin = $stmt->fetch();

if (!is_array($admin) || !password_verify($password, (string) $admin['password_hash'])) {
    app_json_response(401, ['success' => false, 'message' => 'Invalid credentials']);
}

$secret = trim((string) app_env('JWT_SECRET', ''));
if ($secret === '') {
    app_json_response(500, ['success' => false, 'message' => 'JWT secret is not configured']);
}

$expiresIn = max(300, app_env_int('ADMIN_JWT_EXPIRES', 28800));
$now = time();
$expiresAt = $now + $expiresIn;

$token = app_create_jwt([
    'sub' => (int) $admin['id'],
    'username' => (string) $admin['username'],
    'iat' => $now,
    'exp' => $expiresAt,
], $secret);

app_json_response(200, [
    'success' => true,
    'token' => $token,
    'expiresIn' => $expiresIn,
    'expiresAt' => $expiresAt,
    'user' => [
        'id' => (int) $admin['id'],
        'username' => (string) $admin['username'],
        'displayName' => (string) $admin['display_name'],
    ],
]);

