<?php declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/db.php';

ini_set('display_errors', '0');
ini_set('html_errors', '0');

app_send_json_headers('POST, OPTIONS');
app_handle_options_request();
app_require_method(['POST']);

function envFloat(string $key, float $default): float
{
    $value = app_env($key);
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

$rawBody = file_get_contents('php://input');
if ($rawBody === false || $rawBody === '') {
    app_json_response(400, ['success' => false, 'message' => 'Request body is empty']);
}

$data = json_decode($rawBody, true);
if (!is_array($data)) {
    app_json_response(400, ['success' => false, 'message' => 'Invalid JSON']);
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
    app_json_response(422, ['success' => false, 'errors' => $errors]);
}

$rootPath = dirname(__DIR__, 2);
$autoloadPath = $rootPath . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

if (!is_file($autoloadPath)) {
    app_json_response(500, [
        'success' => false,
        'message' => 'Thieu thu vien mail tren server. Hay cai Composer dependencies truoc.',
    ]);
}

require_once $autoloadPath;

app_load_env();

$config = [
    'host' => trim((string) app_env('SMTP_HOST', '')),
    'port' => app_env_int('SMTP_PORT', 587),
    'secure' => strtolower(trim((string) app_env('SMTP_SECURE', 'tls'))),
    'username' => trim((string) app_env('SMTP_USERNAME', '')),
    'password' => (string) app_env('SMTP_PASSWORD', ''),
    'fromEmail' => trim((string) app_env('SMTP_FROM_EMAIL', '')),
    'fromName' => trim((string) app_env('SMTP_FROM_NAME', 'Tam Calisthenics')),
    'toEmail' => trim((string) app_env('CONTACT_TO_EMAIL', 'ngthanhtam21.work@gmail.com')),
    'timeout' => app_env_int('SMTP_TIMEOUT', 15),
    'sendConfirmation' => app_env_bool('CONTACT_CONFIRMATION_ENABLED', true),
];

$antiSpam = [
    'minFillMs' => max(0, app_env_int('CONTACT_MIN_FILL_MS', 2500)),
    'rateLimitEnabled' => app_env_bool('CONTACT_RATE_LIMIT_ENABLED', true),
    'rateLimitWindow' => max(10, app_env_int('CONTACT_RATE_LIMIT_WINDOW', 600)),
    'rateLimitMax' => max(1, app_env_int('CONTACT_RATE_LIMIT_MAX', 5)),
    'rateLimitStorage' => trim((string) app_env('CONTACT_RATE_LIMIT_STORAGE', sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'tam_contact_rate_limit.json')),
    'recaptchaSecret' => trim((string) app_env('CONTACT_RECAPTCHA_SECRET', '')),
    'recaptchaMinScore' => envFloat('CONTACT_RECAPTCHA_MIN_SCORE', 0.5),
    'recaptchaAction' => trim((string) app_env('CONTACT_RECAPTCHA_ACTION', 'contact_submit')),
];

$missingKeys = missingConfigKeys($config);
if (!empty($missingKeys)) {
    app_json_response(500, [
        'success' => false,
        'message' => 'SMTP chua duoc cau hinh day du trong file .env.',
        'missing' => $missingKeys,
    ]);
}

if (!filter_var($config['fromEmail'], FILTER_VALIDATE_EMAIL) || !filter_var($config['toEmail'], FILTER_VALIDATE_EMAIL)) {
    app_json_response(500, [
        'success' => false,
        'message' => 'SMTP_FROM_EMAIL hoac CONTACT_TO_EMAIL khong hop le.',
    ]);
}

if ($config['port'] <= 0) {
    app_json_response(500, [
        'success' => false,
        'message' => 'SMTP_PORT phai la so nguyen duong.',
    ]);
}

if (!in_array($config['secure'], ['', 'tls', 'ssl'], true)) {
    app_json_response(500, [
        'success' => false,
        'message' => 'SMTP_SECURE chi nhan tls, ssl hoac de trong.',
    ]);
}

if ($honeypot !== '') {
    app_json_response(422, ['success' => false, 'message' => 'Du lieu gui khong hop le.']);
}

if ($antiSpam['minFillMs'] > 0 && $formElapsedMs > 0 && $formElapsedMs < $antiSpam['minFillMs']) {
    app_json_response(429, ['success' => false, 'message' => 'Ban thao tac qua nhanh. Vui long thu lai.']);
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
        app_json_response(429, ['success' => false, 'message' => 'Ban gui qua nhieu lan. Vui long thu lai sau it phut.']);
    }
}

if ($antiSpam['recaptchaSecret'] !== '') {
    if ($recaptchaToken === '') {
        app_json_response(422, ['success' => false, 'message' => 'Thieu token xac minh anti-spam.']);
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
        app_json_response(422, ['success' => false, 'message' => 'Xac minh anti-spam that bai.']);
    }
}

$contactId = null;
try {
    $pdo = app_pdo();
    $insertStmt = $pdo->prepare(
        'INSERT INTO contacts (name, email, subject, message, ip_address, user_agent, status)
         VALUES (:name, :email, :subject, :message, :ip_address, :user_agent, :status)'
    );
    $insertStmt->execute([
        'name' => $name,
        'email' => $email,
        'subject' => $subject,
        'message' => $message,
        'ip_address' => $clientIp,
        'user_agent' => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
        'status' => 'new',
    ]);
    $contactId = (int) $pdo->lastInsertId();
} catch (Throwable $exception) {
    error_log('[contact.php] Save contact to DB failed - ' . $exception->getMessage());
    app_json_response(500, [
        'success' => false,
        'message' => 'Khong the luu tin nhan vao he thong luc nay.',
    ]);
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
    app_json_response(500, [
        'success' => false,
        'message' => 'Khong the gui email luc nay. Vui long kiem tra lai cau hinh SMTP.',
    ]);
} catch (Throwable $exception) {
    error_log('[contact.php] Primary SMTP unexpected error - ' . $exception->getMessage());
    app_json_response(500, [
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

app_json_response(200, ['success' => true, 'message' => 'Gui thanh cong', 'contactId' => $contactId]);
