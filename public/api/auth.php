<?php declare(strict_types=1);

require_once __DIR__ . '/db.php';

app_send_json_headers('POST, OPTIONS');
app_handle_options_request();
app_require_method(['POST']);

// ============================================================
// Rate limiting cho đăng nhập admin
// Giới hạn theo IP để chống brute-force
// ============================================================
function auth_rate_limit_path(): string
{
    $tmp = sys_get_temp_dir();
    return $tmp . DIRECTORY_SEPARATOR . 'tam_admin_login_rate_limit.json';
}

function auth_check_rate_limit(string $ip): bool
{
    $maxAttempts = app_env_int('ADMIN_LOGIN_MAX_ATTEMPTS', 10);
    $windowSecs  = app_env_int('ADMIN_LOGIN_WINDOW_SECS', 600); // 10 phút
    $storagePath = auth_rate_limit_path();

    $dir = dirname($storagePath);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    $fp = @fopen($storagePath, 'c+');
    if ($fp === false) {
        // Fail-open: nếu không ghi được file thì vẫn cho qua
        return true;
    }

    $allowed = true;

    try {
        if (!flock($fp, LOCK_EX)) {
            return true;
        }

        rewind($fp);
        $raw   = stream_get_contents($fp);
        $store = [];

        if (is_string($raw) && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $store = $decoded;
            }
        }

        $now    = time();
        $cutoff = $now - $windowSecs;

        // Dọn sạch các record đã hết hạn
        foreach ($store as $key => $attempts) {
            if (!is_array($attempts)) {
                unset($store[$key]);
                continue;
            }
            $recent = array_filter($attempts, fn($ts) => (int) $ts > $cutoff);
            if (count($recent) === 0) {
                unset($store[$key]);
            } else {
                $store[$key] = array_values($recent);
            }
        }

        $bucketKey = $ip !== '' ? $ip : 'unknown';
        $bucket    = is_array($store[$bucketKey] ?? null) ? $store[$bucketKey] : [];

        if (count($bucket) >= $maxAttempts) {
            $allowed = false;
        } else {
            $bucket[]           = $now;
            $store[$bucketKey]  = $bucket;
        }

        rewind($fp);
        ftruncate($fp, 0);
        fwrite($fp, (string) json_encode($store));
        fflush($fp);
        flock($fp, LOCK_UN);
    } finally {
        fclose($fp);
    }

    return $allowed;
}

// Lấy IP của người dùng (hỗ trợ Cloudflare & reverse proxy)
function auth_get_client_ip(): string
{
    $candidates = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_REAL_IP',
        'REMOTE_ADDR',
    ];

    foreach ($candidates as $key) {
        $value = trim((string) ($_SERVER[$key] ?? ''));
        if ($value === '') {
            continue;
        }

        if ($key === 'HTTP_X_FORWARDED_FOR') {
            foreach (array_map('trim', explode(',', $value)) as $part) {
                if (filter_var($part, FILTER_VALIDATE_IP)) {
                    return $part;
                }
            }
            continue;
        }

        if (filter_var($value, FILTER_VALIDATE_IP)) {
            return $value;
        }
    }

    return 'unknown';
}

// ============================================================
// Đọc body, kiểm tra connection DB
// ============================================================
try {
    $pdo = app_pdo();
} catch (Throwable $exception) {
    app_json_response(500, ['success' => false, 'message' => 'Database connection failed']);
}

$data = app_read_json_body();

// ============================================================
// Kiểm tra rate limit TRƯỚC khi xử lý đăng nhập
// ============================================================
$clientIp = auth_get_client_ip();
if (!auth_check_rate_limit($clientIp)) {
    app_json_response(429, [
        'success' => false,
        'message' => 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 10 phút.',
    ]);
}

// ============================================================
// Xác thực username & password
// ============================================================
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

// ============================================================
// Tạo Access Token (JWT ngắn hạn: 8 giờ mặc định)
// ============================================================
$secret = trim((string) app_env('JWT_SECRET', ''));
if ($secret === '') {
    app_json_response(500, ['success' => false, 'message' => 'JWT secret is not configured']);
}

$accessExpiresIn = max(300, app_env_int('ADMIN_JWT_EXPIRES', 28800));
$now             = time();
$accessExpiresAt = $now + $accessExpiresIn;

$accessToken = app_create_jwt([
    'sub'      => (int) $admin['id'],
    'username' => (string) $admin['username'],
    'iat'      => $now,
    'exp'      => $accessExpiresAt,
], $secret);

// ============================================================
// Tạo Refresh Token (JWT dài hạn: 30 ngày mặc định)
// Lưu vào HttpOnly Secure Cookie
// ============================================================
$refreshExpiresIn  = max(3600, app_env_int('ADMIN_REFRESH_EXPIRES', 2592000)); // 30 ngày
$refreshExpiresAt  = $now + $refreshExpiresIn;

$refreshToken = app_create_jwt([
    'sub'  => (int) $admin['id'],
    'type' => 'refresh',
    'iat'  => $now,
    'exp'  => $refreshExpiresAt,
], $secret . '_refresh');

// Gửi Refresh Token qua HttpOnly Cookie
$isSecure    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
               || (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443;
$cookiePath  = trim((string) app_env('ADMIN_COOKIE_PATH', '/api'));
$cookieName  = 'tam_refresh';

setcookie($cookieName, $refreshToken, [
    'expires'  => $refreshExpiresAt,
    'path'     => $cookiePath,
    'secure'   => $isSecure,
    'httponly' => true,
    'samesite' => 'Strict',
]);

app_json_response(200, [
    'success'     => true,
    'token'       => $accessToken,
    'expiresIn'   => $accessExpiresIn,
    'expiresAt'   => $accessExpiresAt,
    'user'        => [
        'id'          => (int) $admin['id'],
        'username'    => (string) $admin['username'],
        'displayName' => (string) $admin['display_name'],
    ],
]);
