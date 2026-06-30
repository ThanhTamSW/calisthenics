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

function portfolio_clean_text($value): string
{
    $value = trim((string) $value);
    $value = strip_tags($value);
    return trim((string) preg_replace('/\s+/u', ' ', $value));
}

function portfolio_clean_multiline($value): string
{
    $value = trim((string) $value);
    $value = strip_tags($value);
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    return trim($value);
}

function portfolio_normalize_tech($value): array
{
    if (is_array($value)) {
        $items = $value;
    } else {
        $items = preg_split('/[,;\n]+/', (string) $value) ?: [];
    }

    $clean = [];
    foreach ($items as $item) {
        $text = portfolio_clean_text($item);
        if ($text !== '') {
            $clean[] = $text;
        }
    }

    return array_values(array_unique($clean));
}

function portfolio_map_row(array $row): array
{
    $tech = json_decode((string) ($row['tech_json'] ?? '[]'), true);
    if (!is_array($tech)) {
        $tech = [];
    }

    return [
        'id' => (int) $row['id'],
        'title' => (string) $row['title'],
        'description' => (string) $row['description'],
        'tech' => array_values($tech),
        'tag' => (string) $row['tag'],
        'demo' => (string) ($row['demo_url'] ?? ''),
        'github' => (string) ($row['github_url'] ?? ''),
        'thumbnail' => (string) ($row['thumbnail'] ?? ''),
        'featured' => (bool) ((int) ($row['featured'] ?? 0)),
        'displayOrder' => (int) ($row['display_order'] ?? 0),
    ];
}

if ($method === 'GET') {
    $stmt = $pdo->query(
        'SELECT id, title, description, tech_json, tag, demo_url, github_url, thumbnail, featured, display_order
         FROM portfolio_items
         ORDER BY featured DESC, display_order DESC, id DESC'
    );
    $rows = $stmt->fetchAll();
    $data = array_map('portfolio_map_row', $rows ?: []);
    app_json_response(200, $data);
}

app_require_auth();
$payload = app_read_json_body();

if ($method === 'DELETE') {
    $id = (int) ($payload['id'] ?? ($_GET['id'] ?? 0));
    if ($id <= 0) {
        app_json_response(422, ['success' => false, 'message' => 'Portfolio id is required']);
    }

    $stmt = $pdo->prepare('DELETE FROM portfolio_items WHERE id = :id');
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        app_json_response(404, ['success' => false, 'message' => 'Portfolio item not found']);
    }

    app_json_response(200, ['success' => true, 'message' => 'Deleted']);
}

$id = (int) ($payload['id'] ?? 0);
$title = portfolio_clean_text($payload['title'] ?? '');
$description = portfolio_clean_multiline($payload['description'] ?? '');
$tech = portfolio_normalize_tech($payload['tech'] ?? []);
$tag = portfolio_clean_text($payload['tag'] ?? 'Content');
$demo = trim((string) ($payload['demo'] ?? ''));
$github = trim((string) ($payload['github'] ?? ''));
$thumbnail = trim((string) ($payload['thumbnail'] ?? ''));
$featured = !empty($payload['featured']) ? 1 : 0;
$displayOrder = (int) ($payload['displayOrder'] ?? $payload['display_order'] ?? 0);

if ($method === 'PUT') {
    if ($id <= 0) {
        app_json_response(422, ['success' => false, 'message' => 'Portfolio id is required']);
    }

    $currentStmt = $pdo->prepare(
        'SELECT id, title, description, tech_json, tag, demo_url, github_url, thumbnail, featured, display_order
         FROM portfolio_items
         WHERE id = :id
         LIMIT 1'
    );
    $currentStmt->execute(['id' => $id]);
    $current = $currentStmt->fetch();
    if (!is_array($current)) {
        app_json_response(404, ['success' => false, 'message' => 'Portfolio item not found']);
    }

    if ($title === '') {
        $title = (string) $current['title'];
    }
    if ($description === '') {
        $description = (string) $current['description'];
    }
    if (count($tech) === 0) {
        $decoded = json_decode((string) $current['tech_json'], true);
        $tech = is_array($decoded) ? $decoded : [];
    }
    if ($tag === '') {
        $tag = (string) $current['tag'];
    }
    if ($demo === '' && array_key_exists('demo', $payload) === false) {
        $demo = (string) $current['demo_url'];
    }
    if ($github === '' && array_key_exists('github', $payload) === false) {
        $github = (string) $current['github_url'];
    }
    if ($thumbnail === '' && array_key_exists('thumbnail', $payload) === false) {
        $thumbnail = (string) $current['thumbnail'];
    }
    if (array_key_exists('featured', $payload) === false) {
        $featured = (int) $current['featured'];
    }
    if (!array_key_exists('displayOrder', $payload) && !array_key_exists('display_order', $payload)) {
        $displayOrder = (int) $current['display_order'];
    }
}

if ($title === '' || $description === '') {
    app_json_response(422, ['success' => false, 'message' => 'Title and description are required']);
}

if ($tag === '') {
    $tag = 'Content';
}

$techJson = json_encode(array_values($tech), JSON_UNESCAPED_UNICODE);
if (!is_string($techJson)) {
    $techJson = '[]';
}

if ($method === 'POST') {
    $stmt = $pdo->prepare(
        'INSERT INTO portfolio_items
          (title, description, tech_json, tag, demo_url, github_url, thumbnail, featured, display_order)
         VALUES
          (:title, :description, :tech_json, :tag, :demo_url, :github_url, :thumbnail, :featured, :display_order)'
    );

    $stmt->execute([
        'title' => $title,
        'description' => $description,
        'tech_json' => $techJson,
        'tag' => $tag,
        'demo_url' => $demo,
        'github_url' => $github,
        'thumbnail' => $thumbnail,
        'featured' => $featured,
        'display_order' => $displayOrder,
    ]);

    $id = (int) $pdo->lastInsertId();
} else {
    $stmt = $pdo->prepare(
        'UPDATE portfolio_items
         SET
           title = :title,
           description = :description,
           tech_json = :tech_json,
           tag = :tag,
           demo_url = :demo_url,
           github_url = :github_url,
           thumbnail = :thumbnail,
           featured = :featured,
           display_order = :display_order,
           updated_at = NOW()
         WHERE id = :id'
    );

    $stmt->execute([
        'id' => $id,
        'title' => $title,
        'description' => $description,
        'tech_json' => $techJson,
        'tag' => $tag,
        'demo_url' => $demo,
        'github_url' => $github,
        'thumbnail' => $thumbnail,
        'featured' => $featured,
        'display_order' => $displayOrder,
    ]);
}

$fetchStmt = $pdo->prepare(
    'SELECT id, title, description, tech_json, tag, demo_url, github_url, thumbnail, featured, display_order
     FROM portfolio_items
     WHERE id = :id
     LIMIT 1'
);
$fetchStmt->execute(['id' => $id]);
$item = $fetchStmt->fetch();

app_json_response(200, [
    'success' => true,
    'data' => is_array($item) ? portfolio_map_row($item) : null,
]);

