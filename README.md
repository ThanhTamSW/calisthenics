# Tâm Calisthenics — Personal Brand Website

React + Vite (FE) · PHP + PHPMailer (BE) · Dark/Light · Accent #FF6B35

---

## Cấu trúc thư mục
```
tam-calisthenics/
├─ index.html
├─ package.json
├─ vite.config.js
├─ src/                  # Frontend React
│  ├─ App.jsx            # Root + theme toggle
│  ├─ index.css          # Global styles + variables
│  └─ components/
│     ├─ Header.jsx      # Sticky nav + mobile menu
│     ├─ HeroSection.jsx # Hero + marquee + avatar
│     ├─ AboutMe.jsx     # Bio + skills + timeline
│     ├─ PortfolioGrid.jsx# Projects + filter tags
│     ├─ ContactForm.jsx # Form + validation
│     └─ Footer.jsx      # Footer + social links
└─ public/
   └─ api/
      ├─ contact.php     # Xử lý form liên hệ (PHPMailer + Gmail SMTP)
      └─ portfolio.php   # API trả danh sách dự án
```

---

## Chạy local
```bash
npm install
npm run dev          # FE tại http://localhost:5173
php -S localhost:8080 -t public   # BE PHP
```
Vite đã proxy `/api/*` sang `http://localhost:8080` (có thể đổi bằng `VITE_API_TARGET`).

---

## Build & Deploy
```bash
npm run build        # tạo thư mục /dist
```
Triển khai lên hosting:
- Upload toàn bộ `/dist` vào `/public_html/`
- Upload `/public/api/*.php` vào `/public_html/api/`

---

## Cấu hình Gmail SMTP
1) Bật 2-Step Verification cho Gmail
2) Tạo App Password (16 ký tự)
3) Điền vào `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=tls
SMTP_USERNAME=ngthanhtam21.work@gmail.com
SMTP_PASSWORD=YOUR_16_CHAR_APP_PASSWORD
SMTP_FROM_EMAIL=ngthanhtam21.work@gmail.com
SMTP_FROM_NAME=Tam Calisthenics
CONTACT_TO_EMAIL=ngthanhtam21.work@gmail.com
CONTACT_CONFIRMATION_ENABLED=true
SMTP_TIMEOUT=15

# Anti-spam settings
CONTACT_MIN_FILL_MS=2500
CONTACT_RATE_LIMIT_ENABLED=true
CONTACT_RATE_LIMIT_WINDOW=600
CONTACT_RATE_LIMIT_MAX=5

# reCAPTCHA v3 (optional, recommended)
VITE_RECAPTCHA_SITE_KEY=
CONTACT_RECAPTCHA_SECRET=
CONTACT_RECAPTCHA_MIN_SCORE=0.5
CONTACT_RECAPTCHA_ACTION=contact_submit

# Admin login rate limit
ADMIN_LOGIN_RATE_LIMIT_ENABLED=true
ADMIN_LOGIN_RATE_LIMIT_WINDOW=900
ADMIN_LOGIN_RATE_LIMIT_MAX=8
# ADMIN_LOGIN_RATE_LIMIT_STORAGE=/tmp/tam_admin_login_rate_limit.json

# CORS whitelist (comma separated)
# APP_CORS_ORIGINS=http://localhost:5173,https://thanhtamnguyen.id.vn
APP_CORS_ORIGINS=
```
Lưu ý: `.env` đã được `.gitignore`.

### Bật reCAPTCHA v3
1) Vào Google reCAPTCHA Admin và tạo key loại v3  
2) Điền `VITE_RECAPTCHA_SITE_KEY` (public key) và `CONTACT_RECAPTCHA_SECRET` (secret key) vào `.env`  
3) Restart app/dev server  

Nếu để trống 2 biến trên, form vẫn chạy với lớp chống spam còn lại (honeypot + rate limit).

### CORS cho API
- CORS đã chuyển sang whitelist qua `APP_CORS_ORIGINS`.
- Nếu để trống biến này, API chỉ phục vụ same-origin (không mở cross-origin từ trình duyệt).

### Chống brute-force đăng nhập Admin
- `/api/auth.php` có giới hạn đăng nhập sai theo `username + IP`.
- Khi vượt giới hạn, API trả `429 Too Many Requests`.

---

## Ghi chú nhanh
- FE/BE đều UTF-8, đã sửa lỗi mojibake.
- API contact trả JSON rõ ràng: 200/400/405/422/500, kèm thông báo tiếng Việt.
- Contact API có anti-spam 3 lớp: honeypot, giới hạn tần suất theo IP, reCAPTCHA v3 (optional).
- Form FE có timeout 15s, hiển thị lỗi chi tiết từ backend.
- Social links: TikTok @tamcalisthenics, Facebook profile id=61576483281888.

---

## Nhiệm vụ còn lại
- Điền `SMTP_PASSWORD` thật để gửi mail production.
- Thêm ảnh thật vào Hero (`/public/images/avatar.jpg`).
- Nếu cần thêm dự án mới: chỉnh `public/api/portfolio.php` hoặc dùng CMS khác.
