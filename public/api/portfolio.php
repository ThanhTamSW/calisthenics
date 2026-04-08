<?php
// ============================================================
// /api/portfolio.php — Trả về danh sách dự án dạng JSON
// ============================================================

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$projects = [
  [
    "id"          => 1,
    "title"       => "Top 1 Premium Battle",
    "description" => "Đạt giải Top 1 tại Premium Battle. Một trong những thành tích đáng tự hào nhất trong hành trình calisthenics.",
    "tech"        => ["Top 1", "Champion", "Battle"],
    "tag"         => "Thành tích",
    "demo"        => "",
    "github"      => "",
    "thumbnail"   => "",
    "featured"    => true,
  ],
  [
    "id"          => 2,
    "title"       => "SOUTHERN STREET WORKOUT BATTLE 2023",
    "description" => "Tham gia giải đấu street workout khu vực miền Nam. Trải nghiệm thi đấu chuyên nghiệp đầu tiên.",
    "tech"        => ["Street Workout", "Battle", "2023"],
    "tag"         => "Giải đấu",
    "demo"        => "",
    "github"      => "",
    "thumbnail"   => "",
    "featured"    => true,
  ],
  [
    "id"          => 3,
    "title"       => "VIETNAM STREET WORKOUT CHAMPIONSHIP 2023",
    "description" => "Tham gia giải vô địch Street Workout Việt Nam 2023. Sân chơi lớn nhất cho cộng đồng calisthenics cả nước.",
    "tech"        => ["Quốc gia", "Championship", "2023"],
    "tag"         => "Giải đấu",
    "demo"        => "",
    "github"      => "",
    "thumbnail"   => "",
    "featured"    => true,
  ],
  [
    "id"          => 4,
    "title"       => "PREMIUM BATTLE II",
    "description" => "Tiếp tục tham gia Premium Battle lần II. Thử thách bản thân ở đấu trường quen thuộc.",
    "tech"        => ["Battle", "Premium", "Comeback"],
    "tag"         => "Giải đấu",
    "demo"        => "",
    "github"      => "",
    "thumbnail"   => "",
    "featured"    => false,
  ],
  [
    "id"          => 5,
    "title"       => "Giám khảo - Battle Of Team I",
    "description" => "Được mời làm giám khảo tại giải Battle Of Team I. Từ vận động viên trở thành người đánh giá.",
    "tech"        => ["Giám khảo", "Battle Of Team", "2024"],
    "tag"         => "Thành tích",
    "demo"        => "",
    "github"      => "",
    "thumbnail"   => "",
    "featured"    => false,
  ],
  [
    "id"          => 6,
    "title"       => "Battle Of Team Strength Lightz II",
    "description" => "Tham gia thi đấu tại giải Battle Of Team Strength Lightz II. Tiếp tục cháy trên sàn đấu.",
    "tech"        => ["Team Battle", "Strength", "2024"],
    "tag"         => "Giải đấu",
    "demo"        => "",
    "github"      => "",
    "thumbnail"   => "",
    "featured"    => false,
  ],
  [
    "id"          => 7,
    "title"       => "Ultimate Battle Z 2024",
    "description" => "Tham gia Ultimate Battle Z 2024, cọ xát với các vận động viên mạnh nhất khu vực.",
    "tech"        => ["Battle", "Street Workout", "2024"],
    "tag"         => "Giải đấu",
    "demo"        => "",
    "github"      => "",
    "thumbnail"   => "",
    "featured"    => false,
  ],
];

echo json_encode($projects, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

