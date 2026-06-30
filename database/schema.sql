-- Tam Calisthenics - Admin Dashboard schema
-- Run with your MySQL client, for example:
--   mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS tam_calisthenics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tam_calisthenics;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NOT NULL DEFAULT 'Admin',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_admins_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tech_json LONGTEXT NULL,
  tag VARCHAR(80) NOT NULL DEFAULT 'Content',
  demo_url VARCHAR(500) NULL,
  github_url VARCHAR(500) NULL,
  thumbnail VARCHAR(500) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_portfolio_tag (tag),
  KEY idx_portfolio_featured (featured),
  KEY idx_portfolio_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contacts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  subject VARCHAR(255) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  status ENUM('new', 'read', 'replied') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contacts_status (status),
  KEY idx_contacts_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admins (username, password_hash, display_name)
SELECT
  'admin',
  '$2y$10$bLlaXYF24/kHMlBRtZmsJetPAnvGt.TLi2ArwZr15/szgM74ltmKq',
  'Site Admin'
WHERE NOT EXISTS (
  SELECT 1 FROM admins WHERE username = 'admin'
);

INSERT INTO portfolio_items (
  id, title, description, tech_json, tag, demo_url, github_url, thumbnail, featured, display_order
) VALUES
  (
    1,
    'Top 1 Premium Battle',
    'Ngày 20/08/2023, The Premium Battle chính thức diễn ra với bầu không khí kịch tính và đầy đam mê của cộng đồng calisthenics Việt Nam. Giải đấu nổi bật với bảng thi đấu hấp dẫn cùng hệ thống huy chương dành cho những vận động viên xuất sắc nhất.',
    '["Top 1","Champion","Battle"]',
    'Thành tích',
    '',
    '',
    '',
    1,
    10
  ),
  (
    2,
    'SOUTHERN STREET WORKOUT BATTLE 2023',
    'Sau thời gian dài ấp ủ, SOUTHERN STREET WORKOUT BATTLE 2023 chính thức khởi tranh. Southern Street Workout ra đời với sứ mệnh tổ chức các giải đấu và sự kiện Street Workout tại khu vực miền Nam Việt Nam.',
    '["Street Workout","Battle","2023"]',
    'Giải đấu',
    '',
    '',
    '',
    1,
    9
  ),
  (
    3,
    'VIETNAM STREET WORKOUT CHAMPIONSHIP 2023',
    'Vietnam Street Workout Championship 2023 quy tụ vận động viên từ ba miền Bắc, Trung, Nam. Giải đấu hướng tới thúc đẩy phong trào Calisthenics - Street Workout, kết nối cộng đồng và lan tỏa tinh thần vượt giới hạn tại Việt Nam.',
    '["Quoc gia","Championship","2023"]',
    'Giải đấu',
    '',
    '',
    '',
    1,
    8
  ),
  (
    4,
    'PREMIUM BATTLE II',
    'Premium Battle II là sự kiện được tổ chức chuyên nghiệp dành cho cộng đồng đam mê Calisthenics trên khắp Việt Nam. Giải đấu quy tụ nhiều tài năng nổi bật với những màn trình diễn đầy ấn tượng, sức mạnh và kỹ thuật.',
    '["Battle","Premium","Comeback"]',
    'Giải đấu',
    '',
    '',
    '',
    0,
    7
  ),
  (
    5,
    'Giám khảo - Battle Of Team I',
    'Được mời làm giám khảo tại giải Battle Of Team I. Từ vận động viên trở thành người đánh giá.',
    '["Giám khảo","Battle Of Team","2024"]',
    'Thành tích',
    '',
    '',
    '',
    0,
    6
  ),
  (
    6,
    'Battle Of Team Strength Lightz II',
    'Tham gia thi đấu tại giải Battle Of Team Strength Lightz II. Tiếp tục cháy trên sàn đấu.',
    '["Team Battle","Strength","2024"]',
    'Giải đấu',
    '',
    '',
    '',
    0,
    5
  ),
  (
    7,
    'Ultimate Battle Z 2024',
    'Tham gia Ultimate Battle Z 2024, cọ xát với các vận động viên mạnh nhất khu vực.',
    '["Battle","Street Workout","2024"]',
    'Giải đấu',
    '',
    '',
    '',
    0,
    4
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  tech_json = VALUES(tech_json),
  tag = VALUES(tag),
  demo_url = VALUES(demo_url),
  github_url = VALUES(github_url),
  thumbnail = VALUES(thumbnail),
  featured = VALUES(featured),
  display_order = VALUES(display_order);

CREATE TABLE IF NOT EXISTS timeline_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  year VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  card_tag VARCHAR(80) NOT NULL DEFAULT 'Sự kiện',
  chips_json LONGTEXT NULL,
  accent TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_timeline_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed dữ liệu mẫu từ dữ liệu tĩnh hiện có trong AboutMe.jsx
INSERT INTO timeline_items (year, title, description, card_tag, chips_json, accent, display_order) VALUES
  ('30/03/2025', 'Battle Of Team II', 'Tham gia thi đấu tại Battle Of Team II, tiếp tục hành trình cọ xát và nâng cấp bản thân.', 'Giải đấu', '["Battle Of Team","Street Workout","2025"]', 1, 80),
  ('31/12/2024', 'Giám khảo - Battle Of Team I', 'Được mời làm giám khảo tại giải Battle Of Team I. Từ vận động viên trở thành người đánh giá.', 'Thành tích', '["Giám khảo","Battle Of Team","2024"]', 0, 70),
  ('27/04/2024', 'PREMIUM BATTLE II', 'Premium Battle II là sự kiện được tổ chức chuyên nghiệp dành cho cộng đồng đam mê Calisthenics trên khắp Việt Nam. Giải đấu quy tụ nhiều tài năng nổi bật với những màn trình diễn đầy ấn tượng, sức mạnh và kỹ thuật.', 'Giải đấu', '["Premium","Battle","2024"]', 0, 60),
  ('21/01/2024', 'Ultimate Battle Z 2024', 'Tham gia Ultimate Battle Z 2024, cọ xát với các vận động viên mạnh nhất khu vực.', 'Giải đấu', '["Battle","Street Workout","2024"]', 0, 50),
  ('09/12/2023', 'VIETNAM STREET WORKOUT CHAMPIONSHIP 2023', 'Vietnam Street Workout Championship 2023 quy tụ vận động viên từ ba miền Bắc, Trung, Nam. Giải đấu hướng tới thúc đẩy phong trào Calisthenics - Street Workout, kết nối cộng đồng và lan tỏa tinh thần vượt giới hạn tại Việt Nam.', 'Giải đấu', '["Championship","Street Workout","2023"]', 0, 40),
  ('20/08/2023', 'PREMIUM BATTLE I', 'Ngày 20/08/2023, The Premium Battle chính thức diễn ra với bầu không khí kịch tính và đầy đam mê của cộng đồng calisthenics Việt Nam. Giải đấu nổi bật với bảng thi đấu hấp dẫn cùng hệ thống huy chương dành cho những vận động viên xuất sắc nhất.', 'Thành tích', '["Top 1","Champion","Battle"]', 0, 30),
  ('15/07/2023', 'SOUTHERN STREET WORKOUT BATTLE 2023', 'Sau thời gian dài ấp ủ, SOUTHERN STREET WORKOUT BATTLE 2023 chính thức khởi tranh. Southern Street Workout ra đời với sứ mệnh tổ chức các giải đấu và sự kiện Street Workout tại khu vực miền Nam Việt Nam.', 'Giải đấu', '["Street Workout","Battle","2023"]', 0, 20),
  ('2020', 'Bắt đầu hành trình Calisthenics', 'Lần đầu tiếp xúc với calisthenics và street workout. Bắt đầu tập các động tác cơ bản và xây dựng nền tảng từ đầu.', 'Hành trình', '["Calisthenics","Nền tảng","Khởi đầu"]', 0, 10)
ON DUPLICATE KEY UPDATE title = VALUES(title);

