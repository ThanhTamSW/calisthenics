import { useState, useEffect, useRef, useCallback } from "react";
import "./HeroSection.css";

// ============================================================
// HERO SECTION - Tam Calisthenics
// Nhan dark/onToggle tu App de sync dark mode
// ============================================================
const HERO_CAROUSEL_AUTOPLAY_MS = 6200;
const HERO_CAROUSEL_TRANSITION_MS = 1200;
const PROFILE_IMAGE_ALT_TEXT = {
  profile1: "Nguyen Thanh Tam tap calisthenics o tu the dung tren thanh xa",
  profile2: "Nguyen Thanh Tam luyen ky nang calisthenics voi dong tac can bang",
  profile3: "Chan dung Nguyen Thanh Tam trong buoi tap street workout",
};
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
  .map(([path, url]) => {
    const fileName = path.split("/").pop() || "";
    const baseName = fileName.replace(/\.[^.]+$/, "");
    return {
      src: url,
      alt: PROFILE_IMAGE_ALT_TEXT[baseName] || "Chan dung Nguyen Thanh Tam trong buoi tap calisthenics",
    };
  });
export default function HeroSection({ dark, onToggle }) {
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [avatarPrevIndex, setAvatarPrevIndex] = useState(null);
  const hasAvatarCarousel = PROFILE_IMAGES.length > 1;
  const avatarTransitionTimerRef = useRef(null);

  const clearAvatarTransitionTimer = useCallback(() => {
    if (avatarTransitionTimerRef.current) {
      clearTimeout(avatarTransitionTimerRef.current);
      avatarTransitionTimerRef.current = null;
    }
  }, []);

  const switchAvatar = useCallback((nextValue) => {
    if (PROFILE_IMAGES.length === 0) return;

    setAvatarIndex((currentIndex) => {
      const rawNextIndex = typeof nextValue === "function"
        ? nextValue(currentIndex)
        : Number(nextValue);
      const safeNextIndex = ((rawNextIndex % PROFILE_IMAGES.length) + PROFILE_IMAGES.length) % PROFILE_IMAGES.length;

      if (safeNextIndex === currentIndex) return currentIndex;

      setAvatarPrevIndex(currentIndex);
      clearAvatarTransitionTimer();
      avatarTransitionTimerRef.current = setTimeout(() => {
        setAvatarPrevIndex(null);
        avatarTransitionTimerRef.current = null;
      }, HERO_CAROUSEL_TRANSITION_MS);

      return safeNextIndex;
    });
  }, [clearAvatarTransitionTimer]);

  useEffect(() => {
    if (!hasAvatarCarousel) return;

    const nextIndex = (avatarIndex + 1) % PROFILE_IMAGES.length;
    const image = new Image();
    image.decoding = "async";
    image.src = PROFILE_IMAGES[nextIndex].src;
    if (typeof image.decode === "function") {
      image.decode().catch(() => {});
    }
  }, [avatarIndex, hasAvatarCarousel]);

  useEffect(() => {
    if (!hasAvatarCarousel) return undefined;

    const timer = setInterval(() => {
      switchAvatar((prev) => prev + 1);
    }, HERO_CAROUSEL_AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [hasAvatarCarousel, switchAvatar]);

  useEffect(() => {
    return () => {
      clearAvatarTransitionTimer();
    };
  }, [clearAvatarTransitionTimer]);

  const goPrevAvatar = () => {
    if (PROFILE_IMAGES.length === 0) return;
    switchAvatar((prev) => prev - 1);
  };

  const goNextAvatar = () => {
    if (PROFILE_IMAGES.length === 0) return;
    switchAvatar((prev) => prev + 1);
  };

  return (
    <>
      {/* -- MARKUP -- */}
      <div className="hero-wrap">

        {/* MARQUEE */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...Array(2)].map((_, i) =>
              [
                "CALISTHENICS",
                "HANSTAND",
                "PLANCHE",
                "MALTESE",
                "HEFESTO",
                "FRONT LEVER",
                "BACK LEVER",
                "MUSCLE UP",
                "SWING 360",
                "SWING 540",
                "ALLEY HOOP",
                "SUPRA 540",
                "DRAGON 360",
              ].map((item, j) => (
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

            <div className="hero-tag">CALISTHENICS - HÀNH TRÌNH - KỶ LUẬT</div>

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
              Mình là Thanh Tâm, theo calisthenics từ nền tảng cơ bản đến thi đấu thực chiến.
              Chia sẻ hành trình tập luyện thật, tiến bộ thật, không filter.
            </p>

            <div className="hero-ctas">
              <a href="#about" className="btn-primary">
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
                <div className="stat-num">Top 1</div>
                <div className="stat-label">Premium Battle I</div>
              </div>
              <div>
                <div className="stat-num">5+ <span>năm</span></div>
                <div className="stat-label">Tập luyện</div>
              </div>
              <div>
                <div className="stat-num">7+ <span>giải</span></div>
                <div className="stat-label">Đã tham gia</div>
              </div>
            </div>
          </div>

          {/* RIGHT AVATAR */}
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
                  <>
                    {avatarPrevIndex !== null && PROFILE_IMAGES[avatarPrevIndex] ? (
                      <img
                        key={`avatar-prev-${avatarPrevIndex}-${avatarIndex}`}
                        src={PROFILE_IMAGES[avatarPrevIndex].src}
                        alt=""
                        aria-hidden="true"
                        className="avatar-slide previous"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <img
                      key={`avatar-active-${avatarIndex}`}
                      src={PROFILE_IMAGES[avatarIndex].src}
                      alt={PROFILE_IMAGES[avatarIndex].alt}
                      className="avatar-slide active"
                      loading="eager"
                      decoding="async"
                      fetchpriority={avatarIndex === 0 ? "high" : "auto"}
                    />
                  </>
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
                          onClick={() => switchAvatar(index)}
                          aria-label={`Avatar ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Badge */}
              <div className="avatar-badge">
                Never Give Up
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}




