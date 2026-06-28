<?php declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/db.php';

app_send_json_headers('POST, OPTIONS');
app_handle_options_request();
app_require_method(['POST']);
app_require_auth();

ini_set('display_errors', '0');

$rootPath     = dirname(__DIR__, 2);
$autoloadPath = $rootPath . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

if (!is_file($autoloadPath)) {
    app_json_response(500, ['success' => false, 'message' => 'Thiếu thư viện mail trên server.']);
}
require_once $autoloadPath;

try {
    $pdo = app_pdo();
} catch (Throwable $exception) {
    app_json_response(500, ['success' => false, 'message' => 'Database connection failed']);
}

$data      = app_read_json_body();
$contactId = (int) ($data['contact_id'] ?? 0);
$replyBody = trim(strip_tags((string) ($data['message'] ?? '')));

if ($contactId <= 0) {
    app_json_response(422, ['success' => false, 'message' => 'Contact ID là bắt buộc']);
}
if (mb_strlen($replyBody) < 10) {
    app_json_response(422, ['success' => false, 'message' => 'Nội dung phản hồi quá ngắn (tối thiểu 10 ký tự)']);
}

$stmt = $pdo->prepare('SELECT id, name, email, subject FROM contacts WHERE id = :id LIMIT 1');
$stmt->execute(['id' => $contactId]);
$contact = $stmt->fetch();

if (!is_array($contact)) {
    app_json_response(404, ['success' => false, 'message' => 'Không tìm thấy liên hệ']);
}

// Đọc cấu hình SMTP từ .env
app_load_env();

$smtpHost     = trim((string) app_env('SMTP_HOST', ''));
$smtpPort     = app_env_int('SMTP_PORT', 587);
$smtpSecure   = strtolower(trim((string) app_env('SMTP_SECURE', 'tls')));
$smtpUsername = trim((string) app_env('SMTP_USERNAME', ''));
$smtpPassword = (string) app_env('SMTP_PASSWORD', '');
$smtpFrom     = trim((string) app_env('SMTP_FROM_EMAIL', ''));
$smtpFromName = trim((string) app_env('SMTP_FROM_NAME', 'Tâm Calisthenics'));
$smtpTimeout  = app_env_int('SMTP_TIMEOUT', 15);

if ($smtpHost === '' || $smtpUsername === '' || $smtpPassword === '' || $smtpFrom === '') {
    app_json_response(500, ['success' => false, 'message' => 'SMTP chưa được cấu hình đầy đủ.']);
}

try {
    $mailer = new PHPMailer(true);
    $mailer->isSMTP();
    $mailer->Host       = $smtpHost;
    $mailer->Port       = $smtpPort;
    $mailer->SMTPAuth   = true;
    $mailer->Username   = $smtpUsername;
    $mailer->Password   = $smtpPassword;
    $mailer->CharSet    = 'UTF-8';
    $mailer->Timeout    = $smtpTimeout;
    $mailer->isHTML(false);

    if ($smtpSecure === 'ssl') {
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($smtpSecure === 'tls') {
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mailer->SMTPSecure = false;
        $mailer->SMTPAutoTLS = false;
    }

    $mailer->setFrom($smtpFrom, $smtpFromName);
    $mailer->addAddress((string) $contact['email'], (string) $contact['name']);
    $mailer->Subject = 'Re: ' . (string) $contact['subject'];
    $mailer->Body    = "Xin chào " . (string) $contact['name'] . ",\n\n";
    $mailer->Body   .= $replyBody . "\n\n";
    $mailer->Body   .= "---\n" . $smtpFromName . "\n";
    $mailer->Body   .= "TikTok: @tamcalisthenics\n";
    $mailer->Body   .= "Facebook: https://www.facebook.com/profile.php?id=61576483281888\n";
    $mailer->send();
} catch (MailException $exception) {
    error_log('[contact_reply.php] SMTP send failed - ' . $exception->getMessage());
    app_json_response(500, ['success' => false, 'message' => 'Không thể gửi email lúc này.']);
} catch (Throwable $exception) {
    error_log('[contact_reply.php] Unexpected error - ' . $exception->getMessage());
    app_json_response(500, ['success' => false, 'message' => 'Lỗi hệ thống không mong muốn.']);
}

// Cập nhật trạng thái thành 'replied'
$updateStmt = $pdo->prepare('UPDATE contacts SET status = :status, updated_at = NOW() WHERE id = :id');
$updateStmt->execute(['status' => 'replied', 'id' => $contactId]);

app_json_response(200, ['success' => true, 'message' => 'Đã gửi phản hồi thành công']);
