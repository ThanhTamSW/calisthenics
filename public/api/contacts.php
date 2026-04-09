<?php declare(strict_types=1);

require_once __DIR__ . '/db.php';

app_send_json_headers('GET, PATCH, OPTIONS');
app_handle_options_request();
$method = app_require_method(['GET', 'PATCH']);

try {
    $pdo = app_pdo();
} catch (Throwable $exception) {
    app_json_response(500, ['success' => false, 'message' => 'Database connection failed']);
}

app_require_auth();

if ($method === 'GET') {
    $summaryOnly = isset($_GET['summary']) && (string) $_GET['summary'] === '1';
    if ($summaryOnly) {
        $counts = [
            'total' => (int) $pdo->query('SELECT COUNT(*) FROM contacts')->fetchColumn(),
            'unread' => (int) $pdo->query("SELECT COUNT(*) FROM contacts WHERE status = 'new'")->fetchColumn(),
            'read' => (int) $pdo->query("SELECT COUNT(*) FROM contacts WHERE status = 'read'")->fetchColumn(),
            'replied' => (int) $pdo->query("SELECT COUNT(*) FROM contacts WHERE status = 'replied'")->fetchColumn(),
        ];

        app_json_response(200, ['success' => true, 'data' => $counts]);
    }

    $allowedStatus = ['all', 'new', 'read', 'replied'];
    $status = strtolower(trim((string) ($_GET['status'] ?? 'all')));
    if (!in_array($status, $allowedStatus, true)) {
        $status = 'all';
    }

    $limit = max(1, min(500, (int) ($_GET['limit'] ?? 100)));

    if ($status === 'all') {
        $stmt = $pdo->prepare(
            'SELECT id, name, email, subject, message, ip_address, user_agent, status, created_at, updated_at
             FROM contacts
             ORDER BY created_at DESC
             LIMIT :limit'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare(
            'SELECT id, name, email, subject, message, ip_address, user_agent, status, created_at, updated_at
             FROM contacts
             WHERE status = :status
             ORDER BY created_at DESC
             LIMIT :limit'
        );
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
    }

    $rows = $stmt->fetchAll();
    app_json_response(200, ['success' => true, 'data' => $rows]);
}

$data = app_read_json_body();
$id = (int) ($data['id'] ?? 0);

if ($id <= 0) {
    app_json_response(422, ['success' => false, 'message' => 'Contact id is required']);
}

$status = strtolower(trim((string) ($data['status'] ?? '')));
if ($status === '' && array_key_exists('is_read', $data)) {
    $status = (bool) $data['is_read'] ? 'read' : 'new';
}

if (!in_array($status, ['new', 'read', 'replied'], true)) {
    app_json_response(422, ['success' => false, 'message' => 'Status must be new, read or replied']);
}

$stmt = $pdo->prepare('UPDATE contacts SET status = :status, updated_at = NOW() WHERE id = :id');
$stmt->execute([
    'status' => $status,
    'id' => $id,
]);

if ($stmt->rowCount() === 0) {
    $existsStmt = $pdo->prepare('SELECT id FROM contacts WHERE id = :id LIMIT 1');
    $existsStmt->execute(['id' => $id]);
    if (!$existsStmt->fetch()) {
        app_json_response(404, ['success' => false, 'message' => 'Contact not found']);
    }
}

$rowStmt = $pdo->prepare(
    'SELECT id, name, email, subject, message, ip_address, user_agent, status, created_at, updated_at
     FROM contacts
     WHERE id = :id
     LIMIT 1'
);
$rowStmt->execute(['id' => $id]);
$row = $rowStmt->fetch();

app_json_response(200, ['success' => true, 'data' => $row]);

