<?php declare(strict_types=1);

require_once __DIR__ . '/db.php';

// ============================================================
// Endpoint: POST /api/logout.php
// Xoá Refresh Token cookie phía server
// ============================================================

app_send_json_headers('POST, OPTIONS');
app_handle_options_request();
app_require_method(['POST']);

$cookieName = 'tam_refresh';
$cookiePath = trim((string) app_env('ADMIN_COOKIE_PATH', '/api'));

// Xoá cookie bằng cách set expires về quá khứ
setcookie($cookieName, '', [
    'expires'  => time() - 3600,
    'path'     => $cookiePath,
    'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
                  || (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443,
    'httponly' => true,
    'samesite' => 'Strict',
]);

app_json_response(200, ['success' => true, 'message' => 'Logged out successfully']);
