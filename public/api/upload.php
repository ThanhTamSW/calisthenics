<?php declare(strict_types=1);

require_once __DIR__ . '/db.php';

app_send_json_headers('POST, OPTIONS');
app_handle_options_request();
app_require_method(['POST']);
app_require_auth();

if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
    app_json_response(422, ['success' => false, 'message' => 'No file uploaded']);
}

$file = $_FILES['file'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    app_json_response(422, ['success' => false, 'message' => 'Upload failed with code ' . (int) $file['error']]);
}

$maxBytes = max(1, app_env_int('ADMIN_UPLOAD_MAX_MB', 8)) * 1024 * 1024;
$size = (int) ($file['size'] ?? 0);
if ($size <= 0 || $size > $maxBytes) {
    app_json_response(422, ['success' => false, 'message' => 'File size exceeds the allowed limit']);
}

$tmpPath = (string) ($file['tmp_name'] ?? '');
if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
    app_json_response(422, ['success' => false, 'message' => 'Invalid upload source']);
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = $finfo ? (string) finfo_file($finfo, $tmpPath) : '';
if ($finfo) {
    finfo_close($finfo);
}

$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
    'image/avif' => 'avif',
];

if (!isset($allowed[$mimeType])) {
    app_json_response(422, ['success' => false, 'message' => 'Unsupported file type']);
}

$ext = $allowed[$mimeType];
$safeBase = preg_replace('/[^a-zA-Z0-9_-]+/', '-', pathinfo((string) ($file['name'] ?? 'upload'), PATHINFO_FILENAME));
$safeBase = trim((string) $safeBase, '-_');
if ($safeBase === '') {
    $safeBase = 'image';
}

$fileName = sprintf(
    '%s-%s.%s',
    strtolower($safeBase),
    bin2hex(random_bytes(6)),
    $ext
);

$uploadDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
    app_json_response(500, ['success' => false, 'message' => 'Cannot create upload directory']);
}

$targetPath = $uploadDir . DIRECTORY_SEPARATOR . $fileName;
if (!move_uploaded_file($tmpPath, $targetPath)) {
    app_json_response(500, ['success' => false, 'message' => 'Failed to store uploaded file']);
}

$url = '/uploads/' . rawurlencode($fileName);

app_json_response(200, [
    'success' => true,
    'data' => [
        'filename' => $fileName,
        'url' => $url,
        'size' => $size,
        'mime' => $mimeType,
    ],
]);

