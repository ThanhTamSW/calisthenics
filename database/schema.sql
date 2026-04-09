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
    'Dat giai Top 1 tai Premium Battle. Mot trong nhung thanh tich dang tu hao nhat trong hanh trinh calisthenics.',
    '["Top 1","Champion","Battle"]',
    'Thanh tich',
    '',
    '',
    '',
    1,
    10
  ),
  (
    2,
    'SOUTHERN STREET WORKOUT BATTLE 2023',
    'Tham gia giai dau street workout khu vuc mien Nam. Trai nghiem thi dau chuyen nghiep dau tien.',
    '["Street Workout","Battle","2023"]',
    'Giai dau',
    '',
    '',
    '',
    1,
    9
  ),
  (
    3,
    'VIETNAM STREET WORKOUT CHAMPIONSHIP 2023',
    'Tham gia giai vo dich Street Workout Viet Nam 2023. San choi lon cho cong dong calisthenics ca nuoc.',
    '["Quoc gia","Championship","2023"]',
    'Giai dau',
    '',
    '',
    '',
    1,
    8
  ),
  (
    4,
    'PREMIUM BATTLE II',
    'Tiep tuc tham gia Premium Battle lan II. Thu thach ban than o dau truong quen thuoc.',
    '["Battle","Premium","Comeback"]',
    'Giai dau',
    '',
    '',
    '',
    0,
    7
  ),
  (
    5,
    'Giam khao - Battle Of Team I',
    'Duoc moi lam giam khao tai giai Battle Of Team I. Tu van dong vien tro thanh nguoi danh gia.',
    '["Giam khao","Battle Of Team","2024"]',
    'Thanh tich',
    '',
    '',
    '',
    0,
    6
  ),
  (
    6,
    'Battle Of Team Strength Lightz II',
    'Tham gia thi dau tai giai Battle Of Team Strength Lightz II. Tiep tuc chay tren san dau.',
    '["Team Battle","Strength","2024"]',
    'Giai dau',
    '',
    '',
    '',
    0,
    5
  ),
  (
    7,
    'Ultimate Battle Z 2024',
    'Tham gia Ultimate Battle Z 2024, co xat voi cac van dong vien manh nhat khu vuc.',
    '["Battle","Street Workout","2024"]',
    'Giai dau',
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

