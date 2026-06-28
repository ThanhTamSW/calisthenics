import { useState, useEffect, useRef, useCallback } from "react";
import "./HeroSection.css";
import { useLang } from "../contexts/LanguageContext";

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
// Lazy glob — Vite sẽ tạo dynamic import riêng cho từng ảnh
// thay vì bundle tất cả vào main chunk như eager: true
const PROFILE_IMAGE_MODULES = import.meta.glob(
  "../../images/profile*.{png,jpg,jpeg,webp,avif,gif,svg}",
  { eager: false, import: "default" }
);

// Sắp xếp module keys để giữ thứ tự ổn định
const PROFILE_MODULE_ENTRIES = Object.entries(PROFILE_IMAGE_MODULES).sort(
  ([aPath], [bPath]) => {
    const aName = aPath.split("/").pop() || "";
    const bName = bPath.split("/").pop() || "";
    return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: "base" });
  }
);

// Hàm tạo metadata ảnh từ path + url
function makeImageMeta(path, url) {
  const baseName = (path.split("/").pop() || "").replace(/\.[^.]+$/, "");
  return {
    src: url,
    alt: PROFILE_IMAGE_ALT_TEXT[baseName] || "Chan dung Nguyen Thanh Tam trong buoi tap calisthenics",
  };
}

// Custom hook load ảnh profile lazy theo thứ tự
function useProfileImages() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (PROFILE_MODULE_ENTRIES.length === 0) return;

    let cancelled = false;
    const result = new Array(PROFILE_MODULE_ENTRIES.length).fill(null);

    // Load tuần tự để ảnh đầu tiên hiện ra nhanh nhất
    const loadAll = async () => {
      for (let i = 0; i < PROFILE_MODULE_ENTRIES.length; i++) {
        if (cancelled) break;
        const [path, loader] = PROFILE_MODULE_ENTRIES[i];
        try {
          const url = await loader();
          if (!cancelled) {
            result[i] = makeImageMeta(path, url);
            setImages((prev) => {
              const next = [...prev];
              next[i] = result[i];
              return next.filter(Boolean);
            });
          }
        } catch {
          // Bỏ qua ảnh lỗi
        }
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, []);

  return images;
}

export default function HeroSection({ dark, onToggle }) {
  const { t } = useLang();
  const PROFILE_IMAGES = useProfileImages(); // Lazy load ảnh profile
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

    // Preload only the next image (not all)
    const nextIndex = (avatarIndex + 1) % PROFILE_IMAGES.length;
    const nextImage = PROFILE_IMAGES[nextIndex];

    // Create a hidden link tag to preload the next image variants
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
                  <a href="https://tiktok.com/@tamcalisthenics" target="_blank" rel="noreferrer">Tt</a>
                  <a href="https://www.facebook.com/profile.php?id=61576483281888&locale=vi_VN" target="_blank" rel="noreferrer">Fb</a>
                  <a href="https://zalo.me/0869797491" target="_blank" rel="noreferrer">Zl</a>
                  <a href="mailto:ngthanhtam21.work@gmail.com">@</a>
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
