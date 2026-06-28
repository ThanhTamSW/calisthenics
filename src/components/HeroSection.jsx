import { useState, useEffect, useRef, useCallback } from "react";
import "./HeroSection.css";
import { useLang } from "../contexts/LanguageContext";
import { getImageSrcSetConfig } from "../utils/imageOptimization";

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
// Load only profile image metadata, not images themselves
const PROFILE_IMAGE_NAMES = ['profile1', 'profile2', 'profile3'];

const PROFILE_IMAGES = PROFILE_IMAGE_NAMES.map((baseName) => {
  const srcSetConfig = getImageSrcSetConfig(baseName);
  return {
    baseName,
    srcSet: srcSetConfig,
    alt: PROFILE_IMAGE_ALT_TEXT[baseName] || "Chan dung Nguyen Thanh Tam trong buoi tap calisthenics",
    fallback: `./images/${baseName}-full.jpg`,
  };
});

export default function HeroSection({ dark, onToggle }) {
  const { t } = useLang();
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
    const nextImage = PROFILE_IMAGES[nextIndex];

    const preloadAVIF = document.createElement('link');
    preloadAVIF.rel = 'preload';
    preloadAVIF.as = 'image';
    preloadAVIF.type = 'image/avif';
    preloadAVIF.imagesrcset = nextImage.srcSet.avif;
    document.head.appendChild(preloadAVIF);

    const preloadWebP = document.createElement('link');
    preloadWebP.rel = 'preload';
    preloadWebP.as = 'image';
    preloadWebP.type = 'image/webp';
    preloadWebP.imagesrcset = nextImage.srcSet.webp;
    document.head.appendChild(preloadWebP);

    return () => {
      document.head.removeChild(preloadAVIF);
      document.head.removeChild(preloadWebP);
    };
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

            <div className="hero-tag">{t("hero_tag")}</div>

            <h1 className="hero-h1">
              {t("hero_h1_1")}<br />
              {t("hero_h1_2")}<br />
              <span className="line-accent">
                {t("hero_h1_3")}
                <svg viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M2,8 Q50,2 100,8 Q150,14 198,6" />
                </svg>
              </span>
            </h1>
            <p className="hero-desc">
              {t("hero_desc")}
            </p>

            <div className="hero-ctas">
              <a href="#about" className="btn-primary">
                {t("hero_cta_journey")}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#contact" className="btn-secondary">
                {t("hero_cta_connect")}
              </a>
            </div>

            <div className="stats-row">
              <div>
                <div className="stat-num">{t("hero_stat_1_num")}</div>
                <div className="stat-label">{t("hero_stat_1_label")}</div>
              </div>
              <div>
                <div className="stat-num">{t("hero_stat_2_num")} <span>{t("hero_stat_2_unit")}</span></div>
                <div className="stat-label">{t("hero_stat_2_label")}</div>
              </div>
              <div>
                <div className="stat-num">{t("hero_stat_3_num")} <span>{t("hero_stat_3_unit")}</span></div>
                <div className="stat-label">{t("hero_stat_3_label")}</div>
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
                  <a href="https://tiktok.com/@tamcalisthenics" target="_blank" rel="noreferrer" aria-label="Theo dõi TikTok của Tâm">Tt</a>
                  <a href="https://www.facebook.com/profile.php?id=61576483281888&locale=vi_VN" target="_blank" rel="noreferrer" aria-label="Theo dõi Facebook của Tâm">Fb</a>
                  <a href="https://zalo.me/0869797491" target="_blank" rel="noreferrer" aria-label="Nhắn tin Zalo">Zl</a>
                  <a href="mailto:ngthanhtam21.work@gmail.com" aria-label="Gửi email cho Tâm">@</a>
                </div>
                <span className="social-pill-label">{t("hero_follow")}</span>
              </div>

              {/* Avatar image carousel */}
              <div className="avatar-img-wrap">
                {PROFILE_IMAGES.length > 0 ? (
                  <>
                    {avatarPrevIndex !== null && PROFILE_IMAGES[avatarPrevIndex] ? (
                      <picture key={`avatar-prev-${avatarPrevIndex}-${avatarIndex}`} className="avatar-slide previous" aria-hidden="true">
                        <source srcSet={PROFILE_IMAGES[avatarPrevIndex].srcSet.avif} type="image/avif" />
                        <source srcSet={PROFILE_IMAGES[avatarPrevIndex].srcSet.webp} type="image/webp" />
                        <img
                          src={PROFILE_IMAGES[avatarPrevIndex].fallback}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    ) : null}
                    <picture key={`avatar-active-${avatarIndex}`} className="avatar-slide active">
                      <source srcSet={PROFILE_IMAGES[avatarIndex].srcSet.avif} type="image/avif" />
                      <source srcSet={PROFILE_IMAGES[avatarIndex].srcSet.webp} type="image/webp" />
                      <img
                        src={PROFILE_IMAGES[avatarIndex].fallback}
                        alt={PROFILE_IMAGES[avatarIndex].alt}
                        loading={avatarIndex === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchpriority={avatarIndex === 0 ? "high" : "auto"}
                      />
                    </picture>
                  </>
                ) : (
                  <div className="avatar-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <span>{t("hero_add_image")}</span>
                  </div>
                )}

                {hasAvatarCarousel && (
                  <>
                    <button type="button" className="avatar-carousel-nav prev" onClick={goPrevAvatar} aria-label="Ảnh trước">
                      {"<"}
                    </button>
                    <button type="button" className="avatar-carousel-nav next" onClick={goNextAvatar} aria-label="Ảnh tiếp theo">
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
                {t("hero_badge")}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}




