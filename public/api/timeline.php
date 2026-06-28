<?php declare(strict_types=1);

require_once __DIR__ . '/db.php';

app_send_json_headers('GET, POST, PUT, DELETE, OPTIONS');
app_handle_options_request();

$method = app_require_method(['GET', 'POST', 'PUT', 'DELETE']);

try {
    $pdo = app_pdo();
} catch (Throwable $exception) {
    app_json_response(500, ['success' => false, 'message' => 'Database connection failed']);
}

function timeline_clean_text($value): string
{
    return trim(preg_replace('/\s+/', ' ', strip_tags(trim((string) $value))) ?? '');
}

function timeline_clean_multiline($value): string
{
    $value = strip_tags(trim((string) $value));
    return trim(str_replace(["\r\n", "\r"], "\n", $value));
}

function timeline_normalize_chips($value): array
{
    if (is_array($value)) {
        $items = $value;
    } else {
        $items = preg_split('/[,;\n]+/', (string) $value) ?: [];
    }
    $clean = [];
    foreach ($items as $item) {
        $text = timeline_clean_text($item);
        if ($text !== '') {
            $clean[] = $text;
        }
    }
    return array_values(array_unique($clean));
}

function timeline_map_row(array $row): array
{
    $chips = json_decode((string) ($row['chips_json'] ?? '[]'), true);
    if (!is_array($chips)) {
        $chips = [];
    }
    return [
        'id'           => (int) $row['id'],
        'year'         => (string) $row['year'],
        'title'        => (string) $row['title'],
        'desc'         => (string) $row['description'],
        'cardTag'      => (string) $row['card_tag'],
        'chips'        => array_values($chips),
        'accent'       => (bool) ((int) ($row['accent'] ?? 0)),
        'displayOrder' => (int) ($row['display_order'] ?? 0),
    ];
}

if ($method === 'GET') {
    $stmt = $pdo->query(
        'SELECT id, year, title, description, card_tag, chips_json, accent, display_order
         FROM timeline_items
         ORDER BY display_order DESC, id DESC'
    );
    $rows = $stmt->fetchAll();
    $data = array_map('timeline_map_row', $rows ?: []);
    app_json_response(200, $data);
}

app_require_auth();
$payload = app_read_json_body();

if ($method === 'DELETE') {
    $id = (int) ($payload['id'] ?? ($_GET['id'] ?? 0));
    if ($id <= 0) {
        app_json_response(422, ['success' => false, 'message' => 'Timeline id is required']);
    }
    $stmt = $pdo->prepare('DELETE FROM timeline_items WHERE id = :id');
    $stmt->execute(['id' => $id]);
    if ($stmt->rowCount() === 0) {
        app_json_response(404, ['success' => false, 'message' => 'Timeline item not found']);
    }
    app_json_response(200, ['success' => true, 'message' => 'Deleted']);
}

$id           = (int) ($payload['id'] ?? 0);
$year         = timeline_clean_text($payload['year'] ?? '');
$title        = timeline_clean_text($payload['title'] ?? '');
$desc         = timeline_clean_multiline($payload['description'] ?? $payload['desc'] ?? '');
$cardTag      = timeline_clean_text($payload['cardTag'] ?? $payload['card_tag'] ?? 'Sự kiện');
$chips        = timeline_normalize_chips($payload['chips'] ?? []);
$accent       = !empty($payload['accent']) ? 1 : 0;
$displayOrder = (int) ($payload['displayOrder'] ?? $payload['display_order'] ?? 0);

if ($method === 'PUT') {
    if ($id <= 0) {
        app_json_response(422, ['success' => false, 'message' => 'Timeline id is required']);
    }
    $currentStmt = $pdo->prepare(
        'SELECT id, year, title, description, card_tag, chips_json, accent, display_order
         FROM timeline_items WHERE id = :id LIMIT 1'
    );
    $currentStmt->execute(['id' => $id]);
    $current = $currentStmt->fetch();
    if (!is_array($current)) {
        app_json_response(404, ['success' => false, 'message' => 'Timeline item not found']);
    }
    if ($year === '')  $year  = (string) $current['year'];
    if ($title === '') $title = (string) $current['title'];
    if ($desc === '')  $desc  = (string) $current['description'];
    if (count($chips) === 0) {
        $decoded = json_decode((string) $current['chips_json'], true);
        $chips = is_array($decoded) ? $decoded : [];
    }
    if ($cardTag === '' || $cardTag === 'Sự kiện') {
        if (array_key_exists('cardTag', $payload) === false && array_key_exists('card_tag', $payload) === false) {
            $cardTag = (string) $current['card_tag'];
        }
    }
    if (!array_key_exists('accent', $payload)) {
        $accent = (int) $current['accent'];
    }
    if (!array_key_exists('displayOrder', $payload) && !array_key_exists('display_order', $payload)) {
        $displayOrder = (int) $current['display_order'];
    }
}

if ($year === '' || $title === '') {
    app_json_response(422, ['success' => false, 'message' => 'Year and title are required']);
}

$chipsJson = json_encode(array_values($chips), JSON_UNESCAPED_UNICODE);
if (!is_string($chipsJson)) {
    $chipsJson = '[]';
}

if ($method === 'POST') {
    $stmt = $pdo->prepare(
        'INSERT INTO timeline_items (year, title, description, card_tag, chips_json, accent, display_order)
         VALUES (:year, :title, :description, :card_tag, :chips_json, :accent, :display_order)'
    );
    $stmt->execute([
        'year'         => $year,
        'title'        => $title,
        'description'  => $desc,
        'card_tag'     => $cardTag,
        'chips_json'   => $chipsJson,
        'accent'       => $accent,
        'display_order'=> $displayOrder,
    ]);
    $id = (int) $pdo->lastInsertId();
} else {
    $stmt = $pdo->prepare(
        'UPDATE timeline_items
         SET year = :year, title = :title, description = :description,
             card_tag = :card_tag, chips_json = :chips_json,
             accent = :accent, display_order = :display_order, updated_at = NOW()
         WHERE id = :id'
    );
    $stmt->execute([
        'id'           => $id,
        'year'         => $year,
        'title'        => $title,
        'description'  => $desc,
        'card_tag'     => $cardTag,
        'chips_json'   => $chipsJson,
        'accent'       => $accent,
        'display_order'=> $displayOrder,
    ]);
}

$fetchStmt = $pdo->prepare(
    'SELECT id, year, title, description, card_tag, chips_json, accent, display_order
     FROM timeline_items WHERE id = :id LIMIT 1'
);
$fetchStmt->execute(['id' => $id]);
$item = $fetchStmt->fetch();

app_json_response(200, [
    'success' => true,
    'data'    => is_array($item) ? timeline_map_row($item) : null,
]);
