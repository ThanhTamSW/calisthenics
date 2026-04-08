<?php declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

ini_set('display_errors', '0');
ini_set('html_errors', '0');

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function jsonResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function loadEnvFile(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }

        [$name, $value] = array_map('trim', explode('=', $line, 2));
        if ($name === '') {
            continue;
        }

        if (
            (strpos($value, '"') === 0 && substr($value, -1) === '"') ||
            (strpos($value, "'") === 0 && substr($value, -1) === "'")
        ) {
            $value = substr($value, 1, -1);
        }

        if (getenv($name) !== false) {
            continue;
        }

        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
        putenv($name . '=' . $value);
    }
}

function envValue(string $key, ?string $default = null): ?string
{
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

function envFlag(string $key, bool $default = false): bool
{
    $value = envValue($key);
    if ($value === null || $value === '') {
        return $default;
    }

    return in_array(strtolower(trim($value)), ['1', 'true', 'yes', 'on'], true);
}

function envInt(string $key, int $default): int
{
    $value = envValue($key);
    if ($value === null || $value === '' || !is_numeric($value)) {
        return $default;
    }

    return (int) $value;
}

function envFloat(string $key, float $default): float
{
    $value = envValue($key);
    if ($value === null || $value === '' || !is_numeric($value)) {
        return $default;
    }

    return (float) $value;
}

function sanitizeHeaderValue(string $value): string
{
    return trim(str_replace(["\r", "\n"], '', $value));
}

function sanitizeShortText(string $value): string
{
    $value = strip_tags($value);
    $value = preg_replace('/\s+/', ' ', $value) ?? $value;
    return trim($value);
}

function sanitizeMessage(string $value): string
{
    $value = strip_tags($value);
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    return trim($value);
}

function messageLength(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

function missingConfigKeys(array $config): array
{
    $required = [
        'host' => 'SMTP_HOST',
        'username' => 'SMTP_USERNAME',
        'password' => 'SMTP_PASSWORD',
        'fromEmail' => 'SMTP_FROM_EMAIL',
        'toEmail' => 'CONTACT_TO_EMAIL',
    ];

    $missing = [];
    foreach ($required as $configKey => $envKey) {
        if (!isset($config[$configKey]) || trim((string) $config[$configKey]) === '') {
            $missing[] = $envKey;
        }
    }

    return $missing;
}

function makeMailer(array $config): PHPMailer
{
    $mailer = new PHPMailer(true);
    $mailer->isSMTP();
    $mailer->Host = $config['host'];
    $mailer->Port = $config['port'];
    $mailer->SMTPAuth = true;
    $mailer->Username = $config['username'];
    $mailer->Password = $config['password'];
    $mailer->CharSet = 'UTF-8';
    $mailer->Timeout = $config['timeout'];
    $mailer->isHTML(false);

    if ($config['secure'] === 'ssl') {
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($config['secure'] === 'tls') {
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mailer->SMTPSecure = false;
        $mailer->SMTPAutoTLS = false;
    }

    $mailer->setFrom($config['fromEmail'], $config['fromName']);

    return $mailer;
}

function getClientIp(): string
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
            $parts = array_map('trim', explode(',', $value));
            foreach ($parts as $part) {
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

function allowByRateLimit(string $storagePath, string $ip, int $maxRequests, int $windowSeconds): bool
{
    $dir = dirname($storagePath);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    $fp = @fopen($storagePath, 'c+');
    if ($fp === false) {
        // Fail-open so contact form still works if filesystem is locked down.
        return true;
    }

    $allowed = true;

    try {
        if (!flock($fp, LOCK_EX)) {
            return true;
        }

        rewind($fp);
        $raw = stream_get_contents($fp);
        $store = [];

        if (is_string($raw) && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $store = $decoded;
            }
        }

        $now = time();
        $cutoff = $now - $windowSeconds;

        foreach ($store as $key => $attempts) {
            if (!is_array($attempts)) {
                unset($store[$key]);
                continue;
            }

            $recent = [];
            foreach ($attempts as $ts) {
                $tsInt = (int) $ts;
                if ($tsInt > $cutoff) {
                    $recent[] = $tsInt;
                }
            }

            if (count($recent) === 0) {
                unset($store[$key]);
            } else {
                $store[$key] = $recent;
            }
        }

        $bucketKey = $ip !== '' ? $ip : 'unknown';
        $bucket = $store[$bucketKey] ?? [];
        if (!is_array($bucket)) {
            $bucket = [];
        }

        if (count($bucket) >= $maxRequests) {
            $allowed = false;
        } else {
            $bucket[] = $now;
            $store[$bucketKey] = $bucket;
        }

        rewind($fp);
        ftruncate($fp, 0);
        fwrite($fp, json_encode($store));
        fflush($fp);
        flock($fp, LOCK_UN);
    } finally {
        fclose($fp);
    }

    return $allowed;
}

function verifyRecaptcha(
    string $secret,
    string $token,
    string $remoteIp,
    string $expectedAction,
    float $minScore
): array {
    $payload = http_build_query([
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $remoteIp,
    ]);

    $responseBody = null;

    if (function_exists('curl_init')) {
        $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
        if ($ch !== false) {
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            ]);

            $result = curl_exec($ch);
            if (is_string($result)) {
                $responseBody = $result;
            }
            curl_close($ch);
        }
    }

    if ($responseBody === null) {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => $payload,
                'timeout' => 10,
            ],
        ]);

        $result = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
        if (is_string($result)) {
            $responseBody = $result;
        }
    }

    if (!is_string($responseBody) || trim($responseBody) === '') {
        return [false, 'empty_response'];
    }

    $decoded = json_decode($responseBody, true);
    if (!is_array($decoded)) {
        return [false, 'invalid_json'];
    }

    if (($decoded['success'] ?? false) !== true) {
        $errorCodes = $decoded['error-codes'] ?? [];
        $errorText = is_array($errorCodes) ? implode(',', $errorCodes) : 'unknown_error';
        return [false, 'google_reject:' . $errorText];
    }

    if ($expectedAction !== '') {
        $action = (string) ($decoded['action'] ?? '');
        if ($action !== '' && $action !== $expectedAction) {
            return [false, 'action_mismatch'];
        }
    }

    if (isset($decoded['score'])) {
        $score = (float) $decoded['score'];
        if ($score < $minScore) {
            return [false, 'score_too_low:' . $score];
        }
    }

    return [true, 'ok'];
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, ['success' => false, 'message' => 'Method not allowed']);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || $rawBody === '') {
    jsonResponse(400, ['success' => false, 'message' => 'Request body is empty']);
}

$data = json_decode($rawBody, true);
if (!is_array($data)) {
    jsonResponse(400, ['success' => false, 'message' => 'Invalid JSON']);
}

$name = sanitizeShortText((string) ($data['name'] ?? ''));
$email = sanitizeHeaderValue(trim((string) ($data['email'] ?? '')));
$subjectInput = sanitizeShortText((string) ($data['subject'] ?? ''));
$subject = sanitizeHeaderValue($subjectInput !== '' ? $subjectInput : 'Lien he tu website');
$message = sanitizeMessage((string) ($data['message'] ?? ''));

$honeypot = sanitizeShortText((string) ($data['website'] ?? ''));
$formElapsedMs = (int) ($data['formElapsedMs'] ?? 0);
$recaptchaToken = trim((string) ($data['recaptchaToken'] ?? ''));

$errors = [];
if ($name === '') {
    $errors[] = 'Thieu ten';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Email khong hop le';
}
if (messageLength($message) < 10) {
    $errors[] = 'Tin nhan qua ngan';
}
if (!empty($errors)) {
    jsonResponse(422, ['success' => false, 'errors' => $errors]);
}

$rootPath = dirname(__DIR__, 2);
$autoloadPath = $rootPath . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

if (!is_file($autoloadPath)) {
    jsonResponse(500, [
        'success' => false,
        'message' => 'Thieu thu vien mail tren server. Hay cai Composer dependencies truoc.',
    ]);
}

require_once $autoloadPath;

loadEnvFile($rootPath . DIRECTORY_SEPARATOR . '.env');

$config = [
    'host' => trim((string) envValue('SMTP_HOST', '')),
    'port' => envInt('SMTP_PORT', 587),
    'secure' => strtolower(trim((string) envValue('SMTP_SECURE', 'tls'))),
    'username' => trim((string) envValue('SMTP_USERNAME', '')),
    'password' => (string) envValue('SMTP_PASSWORD', ''),
    'fromEmail' => trim((string) envValue('SMTP_FROM_EMAIL', '')),
    'fromName' => trim((string) envValue('SMTP_FROM_NAME', 'Tam Calisthenics')),
    'toEmail' => trim((string) envValue('CONTACT_TO_EMAIL', 'ngthanhtam21.work@gmail.com')),
    'timeout' => envInt('SMTP_TIMEOUT', 15),
    'sendConfirmation' => envFlag('CONTACT_CONFIRMATION_ENABLED', true),
];

$antiSpam = [
    'minFillMs' => max(0, envInt('CONTACT_MIN_FILL_MS', 2500)),
    'rateLimitEnabled' => envFlag('CONTACT_RATE_LIMIT_ENABLED', true),
    'rateLimitWindow' => max(10, envInt('CONTACT_RATE_LIMIT_WINDOW', 600)),
    'rateLimitMax' => max(1, envInt('CONTACT_RATE_LIMIT_MAX', 5)),
    'rateLimitStorage' => trim((string) envValue('CONTACT_RATE_LIMIT_STORAGE', sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'tam_contact_rate_limit.json')),
    'recaptchaSecret' => trim((string) envValue('CONTACT_RECAPTCHA_SECRET', '')),
    'recaptchaMinScore' => envFloat('CONTACT_RECAPTCHA_MIN_SCORE', 0.5),
    'recaptchaAction' => trim((string) envValue('CONTACT_RECAPTCHA_ACTION', 'contact_submit')),
];

$missingKeys = missingConfigKeys($config);
if (!empty($missingKeys)) {
    jsonResponse(500, [
        'success' => false,
        'message' => 'SMTP chua duoc cau hinh day du trong file .env.',
        'missing' => $missingKeys,
    ]);
}

if (!filter_var($config['fromEmail'], FILTER_VALIDATE_EMAIL) || !filter_var($config['toEmail'], FILTER_VALIDATE_EMAIL)) {
    jsonResponse(500, [
        'success' => false,
        'message' => 'SMTP_FROM_EMAIL hoac CONTACT_TO_EMAIL khong hop le.',
    ]);
}

if ($config['port'] <= 0) {
    jsonResponse(500, [
        'success' => false,
        'message' => 'SMTP_PORT phai la so nguyen duong.',
    ]);
}

if (!in_array($config['secure'], ['', 'tls', 'ssl'], true)) {
    jsonResponse(500, [
        'success' => false,
        'message' => 'SMTP_SECURE chi nhan tls, ssl hoac de trong.',
    ]);
}

if ($honeypot !== '') {
    jsonResponse(422, ['success' => false, 'message' => 'Du lieu gui khong hop le.']);
}

if ($antiSpam['minFillMs'] > 0 && $formElapsedMs > 0 && $formElapsedMs < $antiSpam['minFillMs']) {
    jsonResponse(429, ['success' => false, 'message' => 'Ban thao tac qua nhanh. Vui long thu lai.']);
}

$clientIp = getClientIp();
if ($antiSpam['rateLimitEnabled']) {
    $allowed = allowByRateLimit(
        $antiSpam['rateLimitStorage'],
        $clientIp,
        $antiSpam['rateLimitMax'],
        $antiSpam['rateLimitWindow']
    );

    if (!$allowed) {
        jsonResponse(429, ['success' => false, 'message' => 'Ban gui qua nhieu lan. Vui long thu lai sau it phut.']);
    }
}

if ($antiSpam['recaptchaSecret'] !== '') {
    if ($recaptchaToken === '') {
        jsonResponse(422, ['success' => false, 'message' => 'Thieu token xac minh anti-spam.']);
    }

    [$okCaptcha, $captchaReason] = verifyRecaptcha(
        $antiSpam['recaptchaSecret'],
        $recaptchaToken,
        $clientIp,
        $antiSpam['recaptchaAction'],
        $antiSpam['recaptchaMinScore']
    );

    if (!$okCaptcha) {
        error_log('[contact.php] reCAPTCHA failed - ' . $captchaReason);
        jsonResponse(422, ['success' => false, 'message' => 'Xac minh anti-spam that bai.']);
    }
}

$mailSubject = sprintf('[%s] - tu %s', $subject, sanitizeHeaderValue($name));
$body = "Ban co tin nhan moi tu website tamcalisthenics.\n\n";
$body .= "----------------------------\n";
$body .= "Ten:     {$name}\n";
$body .= "Email:   {$email}\n";
$body .= "Chu de:  {$subject}\n";
$body .= "----------------------------\n\n";
$body .= "{$message}\n\n";
$body .= "----------------------------\n";
$body .= "Gui luc: " . date('d/m/Y H:i:s') . "\n";
$body .= "IP:      " . $clientIp . "\n";

try {
    $mailer = makeMailer($config);
    $mailer->addAddress($config['toEmail']);
    $mailer->addReplyTo($email, $name);
    $mailer->Subject = $mailSubject;
    $mailer->Body = $body;
    $mailer->send();
} catch (MailException $exception) {
    error_log('[contact.php] Primary SMTP send failed - ' . $exception->getMessage());
    jsonResponse(500, [
        'success' => false,
        'message' => 'Khong the gui email luc nay. Vui long kiem tra lai cau hinh SMTP.',
    ]);
} catch (Throwable $exception) {
    error_log('[contact.php] Primary SMTP unexpected error - ' . $exception->getMessage());
    jsonResponse(500, [
        'success' => false,
        'message' => 'He thong gui mail dang gap loi khong mong muon.',
    ]);
}

if ($config['sendConfirmation']) {
    try {
        $confirmMailer = makeMailer($config);
        $confirmMailer->addAddress($email, $name);
        $confirmMailer->Subject = 'Minh da nhan duoc tin nhan cua ban! - Tam Calisthenics';
        $confirmMailer->Body = "Xin chao {$name},\n\n";
        $confirmMailer->Body .= "Cam on ban da lien he! Minh da nhan duoc tin nhan va se phan hoi som nhat co the.\n\n";
        $confirmMailer->Body .= "Tin nhan cua ban:\n\"{$message}\"\n\n";
        $confirmMailer->Body .= "---\n";
        $confirmMailer->Body .= "Tam Calisthenics\n";
        $confirmMailer->Body .= "TikTok: @tamcalisthenics\n";
        $confirmMailer->Body .= "Facebook: https://www.facebook.com/profile.php?id=61576483281888&locale=vi_VN\n";
        $confirmMailer->send();
    } catch (MailException $exception) {
        error_log('[contact.php] Confirmation SMTP send failed - ' . $exception->getMessage());
    } catch (Throwable $exception) {
        error_log('[contact.php] Confirmation SMTP unexpected error - ' . $exception->getMessage());
    }
}

jsonResponse(200, ['success' => true, 'message' => 'Gui thanh cong']);