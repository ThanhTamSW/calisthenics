<?php declare(strict_types=1);

if (!function_exists('app_load_env')) {
    function app_load_env(?string $rootPath = null): void
    {
        static $loaded = false;
        if ($loaded) {
            return;
        }

        $root = $rootPath ?? dirname(__DIR__, 2);
        
        $autoloadPath = $root . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
        if (is_file($autoloadPath)) {
            require_once $autoloadPath;
        }
        
        if (class_exists('Dotenv\Dotenv')) {
            $dotenv = Dotenv\Dotenv::createImmutable($root);
            $dotenv->safeLoad();
        }

        $loaded = true;
    }
}

if (!function_exists('app_env')) {
    function app_env(string $key, ?string $default = null): ?string
    {
        app_load_env();

        $value = getenv($key);
        if ($value !== false) {
            return $value;
        }
        if (array_key_exists($key, $_ENV)) {
            return (string) $_ENV[$key];
        }
        if (array_key_exists($key, $_SERVER)) {
            return (string) $_SERVER[$key];
        }

        return $default;
    }
}

if (!function_exists('app_env_int')) {
    function app_env_int(string $key, int $default): int
    {
        $value = app_env($key);
        if ($value === null || $value === '' || !is_numeric($value)) {
            return $default;
        }
        return (int) $value;
    }
}

if (!function_exists('app_env_bool')) {
    function app_env_bool(string $key, bool $default = false): bool
    {
        $value = app_env($key);
        if ($value === null || $value === '') {
            return $default;
        }
        return in_array(strtolower(trim($value)), ['1', 'true', 'yes', 'on'], true);
    }
}

if (!function_exists('app_json_response')) {
    function app_json_response(int $statusCode, array $payload): void
    {
        http_response_code($statusCode);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (!function_exists('app_send_json_headers')) {
    function app_send_json_headers(string $allowedMethods = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'): void
    {
        header('Content-Type: application/json; charset=UTF-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: ' . $allowedMethods);
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
}

if (!function_exists('app_handle_options_request')) {
    function app_handle_options_request(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}

if (!function_exists('app_require_method')) {
    function app_require_method(array $allowedMethods): string
    {
        $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
        if (!in_array($method, $allowedMethods, true)) {
            app_json_response(405, ['success' => false, 'message' => 'Method not allowed']);
        }
        return $method;
    }
}

if (!function_exists('app_read_json_body')) {
    function app_read_json_body(): array
    {
        $raw = file_get_contents('php://input');
        if (!is_string($raw) || trim($raw) === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            app_json_response(400, ['success' => false, 'message' => 'Invalid JSON body']);
        }

        return $decoded;
    }
}

if (!function_exists('app_pdo')) {
    function app_pdo(): PDO
    {
        static $pdo = null;
        if ($pdo instanceof PDO) {
            return $pdo;
        }

        app_load_env();

        $host = trim((string) app_env('DB_HOST', ''));
        $port = app_env_int('DB_PORT', 3306);
        $dbName = trim((string) app_env('DB_NAME', ''));
        $user = trim((string) app_env('DB_USER', ''));
        $password = (string) app_env('DB_PASSWORD', '');

        if ($host === '' || $dbName === '' || $user === '') {
            throw new RuntimeException('Missing DB config. Check DB_HOST, DB_NAME, DB_USER in .env');
        }

        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $dbName);

        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        return $pdo;
    }
}

if (!function_exists('app_base64url_encode')) {
    function app_base64url_encode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}

if (!function_exists('app_base64url_decode')) {
    function app_base64url_decode(string $data): string
    {
        $padding = 4 - (strlen($data) % 4);
        if ($padding < 4) {
            $data .= str_repeat('=', $padding);
        }
        return (string) base64_decode(strtr($data, '-_', '+/'));
    }
}

if (!function_exists('app_create_jwt')) {
    function app_create_jwt(array $payload, string $secret): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];

        $encodedHeader = app_base64url_encode((string) json_encode($header, JSON_UNESCAPED_UNICODE));
        $encodedPayload = app_base64url_encode((string) json_encode($payload, JSON_UNESCAPED_UNICODE));
        $signature = hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, $secret, true);
        $encodedSignature = app_base64url_encode($signature);

        return $encodedHeader . '.' . $encodedPayload . '.' . $encodedSignature;
    }
}

if (!function_exists('app_verify_jwt')) {
    function app_verify_jwt(string $token, string $secret): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
        $expectedSig = app_base64url_encode(hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, $secret, true));
        if (!hash_equals($expectedSig, $encodedSignature)) {
            return null;
        }

        $payloadJson = app_base64url_decode($encodedPayload);
        $payload = json_decode($payloadJson, true);
        if (!is_array($payload)) {
            return null;
        }

        if (isset($payload['exp']) && (int) $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }
}

if (!function_exists('app_bearer_token')) {
    function app_bearer_token(): string
    {
        $header = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
        if ($header === '' && function_exists('getallheaders')) {
            $headers = getallheaders();
            if (is_array($headers) && isset($headers['Authorization'])) {
                $header = (string) $headers['Authorization'];
            }
        }

        if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return '';
        }

        return trim((string) ($matches[1] ?? ''));
    }
}

if (!function_exists('app_require_auth')) {
    function app_require_auth(): array
    {
        $token = app_bearer_token();
        if ($token === '') {
            app_json_response(401, ['success' => false, 'message' => 'Unauthorized']);
        }

        $secret = trim((string) app_env('JWT_SECRET', ''));
        if ($secret === '') {
            app_json_response(500, ['success' => false, 'message' => 'Server auth secret is not configured']);
        }

        $payload = app_verify_jwt($token, $secret);
        if (!is_array($payload)) {
            app_json_response(401, ['success' => false, 'message' => 'Invalid or expired token']);
        }

        $adminId = (int) ($payload['sub'] ?? 0);
        if ($adminId <= 0) {
            app_json_response(401, ['success' => false, 'message' => 'Invalid token payload']);
        }

        $pdo = app_pdo();
        $stmt = $pdo->prepare('SELECT id, username, display_name FROM admins WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $adminId]);
        $admin = $stmt->fetch();

        if (!is_array($admin)) {
            app_json_response(401, ['success' => false, 'message' => 'Admin account not found']);
        }

        return $admin;
    }
}

