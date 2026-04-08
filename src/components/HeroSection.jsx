import { useState, useEffect } from "react";

// ============================================================
// HERO SECTION — Tâm Calisthenics
// Nhận dark/onToggle từ App để sync dark mode
// ============================================================
const HERO_CAROUSEL_AUTOPLAY_MS = 4000;
const PROFILE_IMAGE_MODULES = import.meta.glob("../../images/profile*.{png,jpg,jpeg,webp,avif,gif,svg}", {
  eager: true,
  import: "default",
});

const PROFILE_IMAGES = Object.entries(PROFILE_IMAGE_MODULES)
  .sort(([aPath], [bPath]) => {
    const aName = aPath.split("/").pop() || "";
    const bName = bPath.split("/").pop() || "";
    return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: "base" });
  })
  .map(([, url]) => url);
export default function HeroSection({ dark, onToggle }) {
  const [mounted, setMounted] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const hasAvatarCarousel = PROFILE_IMAGES.length > 1;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasAvatarCarousel) return undefined;

    const timer = setInterval(() => {
      setAvatarIndex((prev) => (prev + 1) % PROFILE_IMAGES.length);
    }, HERO_CAROUSEL_AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [hasAvatarCarousel]);

  const goPrevAvatar = () => {
    if (PROFILE_IMAGES.length === 0) return;
    setAvatarIndex((prev) => (prev - 1 + PROFILE_IMAGES.length) % PROFILE_IMAGES.length);
  };

  const goNextAvatar = () => {
    if (PROFILE_IMAGES.length === 0) return;
    setAvatarIndex((prev) => (prev + 1) % PROFILE_IMAGES.length);
  };

  return (
    <>
      <style>{`
        /* —— ANIMATIONS —— */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,107,53,0.5); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 14px rgba(255,107,53,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,107,53,0); }
        }
        @keyframes dash {
          from { stroke-dashoffset: 400; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* —— LAYOUT —— */
        .hero-wrap {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          z-index: 1;
          padding-top: 68px; /* offset cho sticky header */
        }

        /* —— HERO BODY —— */
        .hero-body {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 0;
          align-items: center;
          padding: clamp(20px, 4vw, 40px) clamp(16px, 4vw, 48px) clamp(44px, 6vw, 60px);
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
        }

        /* —— LEFT —— */
        .hero-left { padding-right: clamp(0px, 5vw, 60px); }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          border: 1px solid rgba(255,107,53,0.30);
          border-radius: 999px;
          padding: 6px 14px;
          margin-bottom: 32px;
          opacity: 0;
          animation: fadeUp 0.7s 0.3s forwards;
        }
        .hero-tag::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse-ring 2s infinite;
          flex-shrink: 0;
        }

        .hero-h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
          color: var(--fg);
          margin-bottom: 28px;
          opacity: 0;
          animation: fadeUp 0.7s 0.45s forwards;
        }
        .hero-h1 .line-accent {
          color: var(--accent);
          position: relative;
          display: inline-block;
        }
        /* Underline SVG drawn animation */
        .hero-h1 .line-accent svg {
          position: absolute;
          bottom: -8px; left: 0;
          width: 100%; height: 10px;
          overflow: visible;
        }
        .hero-h1 .line-accent svg path {
          stroke: var(--accent);
          stroke-width: 3;
          fill: none;
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          stroke-linecap: round;
          animation: dash 0.9s 1s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        .hero-desc {
          font-size: 1.05rem;
          font-weight: 300;
          line-height: 1.75;
          color: var(--fg2);
          max-width: 540px;
          margin-bottom: 44px;
          opacity: 0;
          animation: fadeUp 0.7s 0.6s forwards;
        }

        .hero-ctas {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          opacity: 0;
          animation: fadeUp 0.7s 0.75s forwards;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--accent);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          padding: 14px 28px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          box-shadow: 0 4px 20px rgba(255,107,53,0.35);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(255,107,53,0.45);
          background: var(--accent2);
        }
        .btn-primary svg { transition: transform 0.2s; }
        .btn-primary:hover svg { transform: translateX(4px); }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: var(--fg);
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          padding: 13px 24px;
          border-radius: 999px;
          border: 1.5px solid var(--border);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, transform 0.2s;
        }
        .btn-secondary:hover {
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-2px);
        }

        /* —— STATS ROW —— */
        .stats-row {
          display: flex;
          gap: 36px;
          flex-wrap: wrap;
          margin-top: 56px;
          padding-top: 36px;
          border-top: 1px solid var(--border);
          opacity: 0;
          animation: fadeUp 0.7s 0.9s forwards;
        }
        .stat-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.9rem;
          font-weight: 800;
          color: var(--fg);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .stat-num span { color: var(--accent); }
        .stat-label {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--fg2);
          letter-spacing: 0.04em;
          margin-top: 4px;
        }

        /* —— RIGHT — AVATAR CARD —— */
        .hero-right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          opacity: 0;
          animation: fadeIn 0.8s 0.5s forwards;
        }

        .avatar-card {
          position: relative;
          width: 360px;
        }

        /* Floating geometric shapes */
        .geo-circle {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(255,107,53,0.25);
        }
        .geo-circle-1 {
          width: 340px; height: 340px;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          animation: float 8s ease-in-out infinite;
        }
        .geo-circle-2 {
          width: 260px; height: 260px;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          border-color: rgba(255,107,53,0.12);
          animation: float 8s 1s ease-in-out infinite reverse;
        }

        .avatar-img-wrap {
          position: relative;
          width: 260px;
          height: 340px;
          margin: 40px auto;
          border-radius: 140px 140px 100px 100px;
          overflow: hidden;
          background: var(--bg2);
          box-shadow: var(--shadow);
          animation: float 6s ease-in-out infinite;
        }
        .avatar-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .avatar-carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(0, 0, 0, 0.45);
          color: #fff;
          font-size: 16px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 4;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .avatar-carousel-nav:hover {
          background: rgba(0, 0, 0, 0.65);
          transform: translateY(-50%) scale(1.05);
        }
        .avatar-carousel-nav.prev { left: 10px; }
        .avatar-carousel-nav.next { right: 10px; }
        .avatar-carousel-dots {
          position: absolute;
          left: 50%;
          bottom: 12px;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 4;
        }
        .avatar-carousel-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          border: none;
          background: rgba(255, 255, 255, 0.45);
          padding: 0;
          cursor: pointer;
          transition: width 0.2s ease, background 0.2s ease;
        }
        .avatar-carousel-dot.active {
          width: 16px;
          background: #fff;
        }
        /* Placeholder khi chưa có ảnh */
        .avatar-placeholder {
          width: 100%; height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--fg2);
        }
        .avatar-placeholder svg { opacity: 0.4; }
        .avatar-placeholder span {
          font-size: 0.75rem;
          opacity: 0.5;
          text-align: center;
          padding: 0 20px;
        }

        /* Accent corner badge */
        .avatar-badge {
          position: absolute;
          bottom: 20px; right: -16px;
          background: var(--accent);
          color: #fff;
          border-radius: 16px;
          padding: 12px 16px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          line-height: 1.3;
          box-shadow: 0 8px 24px rgba(255,107,53,0.4);
          z-index: 2;
        }

        /* Social pill */
        .social-pill {
          position: absolute;
          top: 20px; left: -24px;
          background: var(--card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: var(--shadow);
          z-index: 2;
        }
        .social-pill-icons { display: flex; gap: 6px; }
        .social-pill-icons a {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--bg2);
          display: flex; align-items: center; justify-content: center;
          color: var(--fg2);
          text-decoration: none;
          font-size: 0.7rem;
          font-weight: 700;
          transition: background 0.2s, color 0.2s;
        }
        .social-pill-icons a:hover { background: var(--accent); color: #fff; }
        .social-pill-label {
          font-size: 0.7rem;
          color: var(--fg2);
          font-weight: 400;
          white-space: nowrap;
        }

        /* —— MARQUEE STRIP —— */
        .marquee-wrap {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 14px 0;
          overflow: hidden;
          opacity: 0;
          animation: fadeIn 0.6s 1.1s forwards;
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
        .marquee-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 32px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--fg2);
          white-space: nowrap;
        }
        .marquee-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }

        /* —— RESPONSIVE —— */
        @media (max-width: 900px) {
          .hero-wrap { padding-top: 68px; }
          .hero-body {
            grid-template-columns: 1fr;
            padding: 20px 20px 48px;
            gap: 40px;
          }
          .hero-left { padding-right: 0; }
          .hero-right { justify-content: center; }
          .avatar-card { width: 300px; }
          .avatar-img-wrap { width: 220px; height: 280px; }
          .geo-circle-1 { width: 280px; height: 280px; }
          .geo-circle-2 { width: 220px; height: 220px; }
          .stats-row { gap: 24px; }
        }

        @media (max-width: 640px) {
          .hero-body {
            padding: 16px 16px 40px;
            gap: 28px;
          }
          /* Image card appears FIRST on mobile */
          .hero-right { order: -1; }
          .hero-left  { order:  1; }
          .hero-tag {
            margin-bottom: 16px;
            font-size: 0.66rem;
            letter-spacing: 0.1em;
          }
          .hero-h1 {
            font-size: clamp(2.1rem, 11vw, 3.3rem);
            line-height: 0.98;
            margin-bottom: 16px;
          }
          .hero-desc {
            font-size: 0.93rem;
            line-height: 1.65;
            margin-bottom: 24px;
            max-width: 100%;
          }
          .hero-ctas { gap: 10px; }
          .btn-primary,
          .btn-secondary {
            width: 100%;
            justify-content: center;
            padding: 14px 20px;
          }
          .stats-row {
            margin-top: 28px;
            padding-top: 20px;
            gap: 12px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .stat-num { font-size: 1.25rem; }
          .stat-label {
            font-size: 0.68rem;
            letter-spacing: 0.02em;
          }
          .avatar-card { width: 260px; }
          .avatar-img-wrap {
            width: 200px;
            height: 260px;
            margin: 32px auto;
          }
          .avatar-carousel-nav {
            width: 28px;
            height: 28px;
          }
          .social-pill {
            left: 50%;
            top: -8px;
            transform: translateX(-50%);
            padding: 8px 12px;
          }
          .avatar-badge {
            right: 50%;
            bottom: -8px;
            transform: translateX(50%);
            white-space: nowrap;
          }
          .marquee-item {
            padding: 0 20px;
            font-size: 0.66rem;
          }
        }

        @media (max-width: 420px) {
          .hero-body { padding: 10px 14px 36px; gap: 24px; }
          .stats-row {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }
          .stat-num { font-size: 1.15rem; }
          .stat-label { font-size: 0.64rem; }
          .avatar-card { width: 230px; }
          .avatar-img-wrap { width: 176px; height: 230px; }
          .geo-circle-1 { width: 230px; height: 230px; }
          .geo-circle-2 { width: 180px; height: 180px; }
          .social-pill-label { display: none; }
        }
      `}</style>

      {/* —— MARKUP —— */}
      <div className="hero-wrap">

        {/* MARQUEE */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...Array(2)].map((_, i) =>
              ["Calisthenics", "Street Workout", "Muscle Up", "Handstand", "Front Lever", "Planche", "Comeback"].map((item, j) => (
                <div className="marquee-item" key={`${i}-${j}`}>
                  <span className="marquee-dot" />
                  {item}
                </div>
              ))
            )}
          </div>
        </div>

        {/* HERO BODY */}
        <div className="hero-body">

          {/* LEFT */}
          <div className="hero-left">

            <div className="hero-tag">Liên hệ - Huấn luyện - Chia sẻ</div>

            <h1 className="hero-h1">
              Strength.<br />
              Balance.<br />
              <span className="line-accent">
                Discipline
                <svg viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M2,8 Q50,2 100,8 Q150,14 198,6" />
                </svg>
              </span>
            </h1>

            <p className="hero-desc">
              Mình là Thanh Tâm — đang comeback calisthenics sau 10 tháng nghỉ.
              Chia sẻ hành trình tập luyện thật, tiến bộ thật, không filter.
            </p>

            <div className="hero-ctas">
              <a href="#portfolio" className="btn-primary">
                Xem hành trình
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#contact" className="btn-secondary">
                Kết nối với mình
              </a>
            </div>

            <div className="stats-row">
              <div>
                <div className="stat-num">5+ <span>năm</span></div>
                <div className="stat-label">Tập luyện</div>
              </div>
              <div>
                <div className="stat-num">6+ <span>giải</span></div>
                <div className="stat-label">Đã tham gia</div>
              </div>
              <div>
                <div className="stat-num">Top 1</div>
                <div className="stat-label">Premium Battle</div>
              </div>
            </div>
          </div>

          {/* RIGHT — AVATAR */}
          <div className="hero-right">
            <div className="avatar-card">
              <div className="geo-circle geo-circle-1" />
              <div className="geo-circle geo-circle-2" />

              {/* Social pill */}
              <div className="social-pill">
                <div className="social-pill-icons">
                  <a href="https://tiktok.com/@tamcalisthenics" target="_blank" rel="noreferrer">Tt</a>
                  <a href="https://www.facebook.com/profile.php?id=61576483281888&locale=vi_VN" target="_blank" rel="noreferrer">Fb</a>
                  <a href="mailto:ngthanhtam21.work@gmail.com">@</a>
                </div>
                <span className="social-pill-label">Theo dõi mình</span>
              </div>

              {/* Avatar image carousel */}
              <div className="avatar-img-wrap">
                {PROFILE_IMAGES.length > 0 ? (
                  <img src={PROFILE_IMAGES[avatarIndex]} alt={`Thanh Tam ${avatarIndex + 1}`} loading="lazy" />
                ) : (
                  <div className="avatar-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <span>Thêm ảnh của bạn vào đây</span>
                  </div>
                )}

                {hasAvatarCarousel && (
                  <>
                    <button type="button" className="avatar-carousel-nav prev" onClick={goPrevAvatar} aria-label="Previous image">
                      {"<"}
                    </button>
                    <button type="button" className="avatar-carousel-nav next" onClick={goNextAvatar} aria-label="Next image">
                      {">"}
                    </button>
                    <div className="avatar-carousel-dots">
                      {PROFILE_IMAGES.map((_, index) => (
                        <button
                          key={`avatar-dot-${index}`}
                          type="button"
                          className={`avatar-carousel-dot${index === avatarIndex ? " active" : ""}`}
                          onClick={() => setAvatarIndex(index)}
                          aria-label={`Avatar ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Badge */}
              <div className="avatar-badge">
                💪 Never Give Up
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
