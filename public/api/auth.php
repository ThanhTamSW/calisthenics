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

$rateLimitEnabled = app_env_bool('ADMIN_LOGIN_RATE_LIMIT_ENABLED', true);
$rateLimitWindow = max(10, app_env_int('ADMIN_LOGIN_RATE_LIMIT_WINDOW', 900));
$rateLimitMaxAttempts = max(1, app_env_int('ADMIN_LOGIN_RATE_LIMIT_MAX', 8));
$rateLimitStorage = trim((string) app_env(
    'ADMIN_LOGIN_RATE_LIMIT_STORAGE',
    sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'tam_admin_login_rate_limit.json'
));
$rateLimitBucket = strtolower($username) . '@' . app_client_ip();

if ($rateLimitEnabled) {
    $allowed = app_rate_limit_allow($rateLimitStorage, $rateLimitBucket, $rateLimitMaxAttempts, $rateLimitWindow);
    if (!$allowed) {
        app_json_response(429, [
            'success' => false,
            'message' => 'Too many login attempts. Please wait and try again.',
        ]);
    }
}

$stmt = $pdo->prepare('SELECT id, username, display_name, password_hash FROM admins WHERE username = :username LIMIT 1');
$stmt->execute(['username' => $username]);
$admin = $stmt->fetch();

if (!is_array($admin) || !password_verify($password, (string) $admin['password_hash'])) {
    app_json_response(401, ['success' => false, 'message' => 'Invalid credentials']);
}

if ($rateLimitEnabled) {
    app_rate_limit_clear($rateLimitStorage, $rateLimitBucket);
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
