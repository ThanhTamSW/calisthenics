import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useScrollReveal from "../hooks/useScrollReveal";
import { useLang } from "../contexts/LanguageContext";
import "./PortfolioGrid.css";

// ============================================================
// PORTFOLIO GRID - fetch tu /api/portfolio.php
// ============================================================

const TAGS = ["Tất cả", "Giải đấu", "Thành tích", "Content"];

// Fallback data khi chua co API
const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: "Top 1 Premium Battle",
    description: "Ngày 20/08/2023, The Premium Battle chính thức diễn ra với bầu không khí kịch tính và đầy đam mê của cộng đồng calisthenics Việt Nam. Giải đấu nổi bật với bảng thi đấu hấp dẫn cùng hệ thống huy chương dành cho những vận động viên xuất sắc nhất.",
    tech: ["Top 1", "Champion", "Battle"],
    tag: "Thành tích",
    demo: "",
    github: "",
    thumbnail: "",
    featured: true,
  },
  {
    id: 2,
    title: "SOUTHERN STREET WORKOUT BATTLE 2023",
    description: "Sau thời gian dài ấp ủ, SOUTHERN STREET WORKOUT BATTLE 2023 chính thức khởi tranh. Southern Street Workout ra đời với sứ mệnh tổ chức các giải đấu và sự kiện Street Workout tại khu vực miền Nam Việt Nam. Với sự đồng hành từ Ashura, Sept Strength Club, shop Hoàng Kế Tường và VNSWC, giải đấu trở thành tiền đề để lan tỏa đam mê Street Workout, tinh thần tập luyện và rèn luyện sức khỏe tới cộng đồng.",
    tech: ["Street Workout", "Battle", "2023"],
    tag: "Giải đấu",
    demo: "",
    github: "",
    thumbnail: "",
    featured: true,
  },
  {
    id: 3,
    title: "VIETNAM STREET WORKOUT CHAMPIONSHIP 2023",
    description: "Vietnam Street Workout Championship 2023 quy tụ vận động viên từ ba miền Bắc, Trung, Nam. Giải đấu hướng tới thúc đẩy phong trào Calisthenics - Street Workout, kết nối cộng đồng và lan tỏa tinh thần vượt giới hạn tại Việt Nam.",
    tech: ["Quoc gia", "Championship", "2023"],
    tag: "Giải đấu",
    demo: "",
    github: "",
    thumbnail: "",
    featured: true,
  },
  {
    id: 4,
    title: "PREMIUM BATTLE II",
    description: "Premium Battle II là sự kiện được tổ chức chuyên nghiệp dành cho cộng đồng đam mê Calisthenics trên khắp Việt Nam. Giải đấu quy tụ nhiều tài năng nổi bật với những màn trình diễn đầy ấn tượng, sức mạnh và kỹ thuật. Mục tiêu của giải là tìm ra đại diện Việt Nam tham dự Xia-Long Cup Asia Street Workout Championship tại Đài Loan và có thể là giải SWUB.",
    tech: ["Battle", "Premium", "Comeback"],
    tag: "Giải đấu",
    demo: "",
    github: "",
    thumbnail: "",
    featured: false,
  },
  {
    id: 5,
    title: "Giám khảo - Battle Of Team I",
    description: "Được mời làm giám khảo tại giải Battle Of Team I. Từ vận động viên trở thành người đánh giá.",
    tech: ["Giam khao", "Battle Of Team", "2024"],
    tag: "Thành tích",
    demo: "",
    github: "",
    thumbnail: "",
    featured: false,
  },
  {
    id: 6,
    title: "Battle Of Team Strength Lightz II",
    description: "Tham gia thi đấu tại giải Battle Of Team Strength Lightz II. Tiếp tục cháy trên sàn đấu.",
    tech: ["Team Battle", "Strength", "2024"],
    tag: "Giải đấu",
    demo: "",
    github: "",
    thumbnail: "",
    featured: false,
  },
  {
    id: 7,
    title: "Ultimate Battle Z 2024",
    description: "Tham gia Ultimate Battle Z 2024, cọ xát với các vận động viên mạnh nhất khu vực.",
    tech: ["Battle", "Street Workout", "2024"],
    tag: "Giải đấu",
    demo: "",
    github: "",
    thumbnail: "",
    featured: false,
  },
];

const CARD_CAROUSEL_AUTOPLAY_MS = 5200;
const CARD_CAROUSEL_TRANSITION_MS = 1200;
const DEFAULT_PORTFOLIO_API_URL = "/api/portfolio.php";
const PORTFOLIO_API_URL = import.meta.env.VITE_PORTFOLIO_API_URL || DEFAULT_PORTFOLIO_API_URL;

const RAW_IMAGE_MODULES = import.meta.glob(
  "../../public/images/*.{png,jpg,jpeg,webp,avif,gif,svg}",
  {
    eager: true,
    import: "default",
  }
);

function normalizeGroupKey(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeText(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatTagLabel(value) {
  const key = normalizeText(value);
  if (key === "tat ca") return "Tất cả";
  if (key === "giai dau") return "Giải đấu";
  if (key === "thanh tich") return "Thành tích";
  return value;
}

function buildImageGroups(modules) {
  const groups = {};

  Object.entries(modules).forEach(([path, url]) => {
    const fileName = path.split("/").pop() || "";
    const baseName = fileName.replace(/\.[^.]+$/, "").toLowerCase();
    const suffixMatch = baseName.match(/_(\d+)$/);
    const key = normalizeGroupKey(baseName.replace(/_(\d+)$/, ""));
    const order = suffixMatch ? Number.parseInt(suffixMatch[1], 10) : 0;

    if (!groups[key]) groups[key] = [];
    groups[key].push({ url, order, fileName });
  });

  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.fileName.localeCompare(b.fileName);
    });
    groups[key] = groups[key].map((item) => item.url);
  });

  return groups;
}

const IMAGE_GROUPS = buildImageGroups(RAW_IMAGE_MODULES);

const TITLE_IMAGE_RULES = [
  {
    key: "premium1",
    match: (title) => title.includes("top 1 premium battle"),
    thumbnailPosition: "center 28%",
    thumbnailPositions: ["center 38%", "center 24%"],
    thumbnailScales: [0.9, 1],
    thumbnailFit: "cover",
  },
  {
    key: "giamkhao",
    match: (title, project) =>
      Number(project?.id) === 5 ||
      (title.includes("giam") && title.includes("battle of team i")),
    thumbnailPosition: "center 26%",
    thumbnailFit: "cover",
  },
  {
    key: "ultimatebattlez2024",
    keys: ["ultimatebattlez", "ultimatez2024", "ultimatez", "ubz2024", "ubz"],
    match: (title, project) =>
      Number(project?.id) === 7 ||
      (title.includes("ultimate") && title.includes("battle") && title.includes("z")),
    thumbnailPosition: "center 28%",
    thumbnailFit: "cover",
  },
];

function resolveImagesFromRule(rule, fallbackImages) {
  const candidateKeys = [rule.key, ...(Array.isArray(rule.keys) ? rule.keys : [])]
    .map((key) => normalizeGroupKey(key))
    .filter(Boolean);

  const merged = [];
  const seen = new Set();

  candidateKeys.forEach((key) => {
    (IMAGE_GROUPS[key] || []).forEach((url) => {
      if (seen.has(url)) return;
      seen.add(url);
      merged.push(url);
    });
  });

  return merged.length > 0 ? merged : fallbackImages;
}

function resolveProjectMedia(project) {
  const normalizedTitle = normalizeText(project.title);
  const rule = TITLE_IMAGE_RULES.find((item) => item.match(normalizedTitle, project));
  const fallbackImages = project.thumbnail ? [project.thumbnail] : [];

  if (!rule) {
    return {
      images: fallbackImages,
      thumbnailPosition: project.thumbnailPosition || "",
      thumbnailPositions: Array.isArray(project.thumbnailPositions) ? project.thumbnailPositions : [],
      thumbnailScales: Array.isArray(project.thumbnailScales) ? project.thumbnailScales : [],
      thumbnailFit: project.thumbnailFit || "",
    };
  }

  const images = resolveImagesFromRule(rule, fallbackImages);
  return {
    images,
    thumbnailPosition: project.thumbnailPosition || rule.thumbnailPosition || "",
    thumbnailPositions: Array.isArray(project.thumbnailPositions) && project.thumbnailPositions.length > 0
      ? project.thumbnailPositions
      : Array.isArray(rule.thumbnailPositions)
        ? rule.thumbnailPositions
        : [],
    thumbnailScales: Array.isArray(project.thumbnailScales) && project.thumbnailScales.length > 0
      ? project.thumbnailScales
      : Array.isArray(rule.thumbnailScales)
        ? rule.thumbnailScales
        : [],
    thumbnailFit: project.thumbnailFit || rule.thumbnailFit || "",
  };
}

function attachProjectImages(list) {
  if (!Array.isArray(list)) return [];
  return list.map((project) => {
    const { images, thumbnailPosition, thumbnailPositions, thumbnailScales, thumbnailFit } = resolveProjectMedia(project);
    return {
      ...project,
      images,
      thumbnail: project.thumbnail || images[0] || "",
      thumbnailPosition,
      thumbnailPositions,
      thumbnailScales,
      thumbnailFit,
    };
  });
}

function ProjectCard({ project, index }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const images = useMemo(() => {
    if (Array.isArray(project.images) && project.images.length > 0) {
      return project.images;
    }
    return project.thumbnail ? [project.thumbnail] : [];
  }, [project.images, project.thumbnail]);
  const hasCarousel = images.length > 1;
  const useContainFit = project.thumbnailFit === "contain";
  const transitionTimerRef = useRef(null);
  const activeImageIndex = images.length > 0
    ? ((activeIndex % images.length) + images.length) % images.length
    : 0;
  const previousImageIndex = previousIndex !== null && images.length > 0
    ? ((previousIndex % images.length) + images.length) % images.length
    : null;

  const getSlidePosition = (slideIndex) =>
    Array.isArray(project.thumbnailPositions) && project.thumbnailPositions[slideIndex]
      ? project.thumbnailPositions[slideIndex]
      : project.thumbnailPosition;

  const getSlideScale = (slideIndex) =>
    Array.isArray(project.thumbnailScales) && project.thumbnailScales[slideIndex]
      ? project.thumbnailScales[slideIndex]
      : 1;

  const clearSlideTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const switchSlide = useCallback((nextValue) => {
    if (images.length === 0) return;

    setActiveIndex((currentIndex) => {
      const rawNextIndex = typeof nextValue === "function"
        ? nextValue(currentIndex)
        : Number(nextValue);
      const safeNextIndex = ((rawNextIndex % images.length) + images.length) % images.length;

      if (safeNextIndex === currentIndex) return currentIndex;

      setPreviousIndex(currentIndex);
      clearSlideTransitionTimer();
      transitionTimerRef.current = setTimeout(() => {
        setPreviousIndex(null);
        transitionTimerRef.current = null;
      }, CARD_CAROUSEL_TRANSITION_MS);

      return safeNextIndex;
    });
  }, [clearSlideTransitionTimer, images.length]);

  useEffect(() => {
    setActiveIndex(0);
    setPreviousIndex(null);
    clearSlideTransitionTimer();
  }, [clearSlideTransitionTimer, project.id, images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    images.forEach((url) => {
      const image = new Image();
      image.decoding = "async";
      image.loading = "eager";
      image.src = url;
      if (typeof image.decode === "function") {
        image.decode().catch(() => {});
      }
    });
  }, [images]);

  useEffect(() => {
    if (!hasCarousel) return undefined;

    const timer = setInterval(() => {
      switchSlide((prev) => prev + 1);
    }, CARD_CAROUSEL_AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [hasCarousel, switchSlide]);

  useEffect(() => {
    return () => {
      clearSlideTransitionTimer();
    };
  }, [clearSlideTransitionTimer]);

  const goPrev = () => {
    switchSlide((prev) => prev - 1);
  };

  const goNext = () => {
    switchSlide((prev) => prev + 1);
  };

  const renderSlide = (imageUrl, imageIndex, variant) => {
    const slidePosition = getSlidePosition(imageIndex);
    const slideScale = getSlideScale(imageIndex);
    const shouldRenderBackdrop = useContainFit || (!useContainFit && slideScale < 0.999);

    return (
      <div
        key={`${project.id}-${variant}-${imageIndex}-${activeIndex}`}
        className={`card-thumb-slide ${variant}`}
        aria-hidden={variant !== "active"}
      >
        {shouldRenderBackdrop && (
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="card-thumb-backdrop"
            loading={index < 2 && variant === "active" ? "eager" : "lazy"}
            style={slidePosition ? { objectPosition: slidePosition } : undefined}
          />
        )}
        <img
          src={imageUrl}
          alt={`${project.title} ${imageIndex + 1}`}
          className="card-thumb-image"
          loading={index < 2 && variant === "active" ? "eager" : "lazy"}
          style={{
            ...(slidePosition ? { objectPosition: slidePosition } : {}),
            ...(project.thumbnailFit ? { objectFit: project.thumbnailFit } : {}),
            ...(slideScale !== 1 ? { transform: `scale(${slideScale})`, transformOrigin: "center center" } : {}),
          }}
        />
      </div>
    );
  };

  return (
    <div
      className={`project-card${project.featured ? " featured" : ""}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Thumbnail */}
      <div className={`card-thumb${useContainFit ? " contain-fit" : ""}`}>
        {images.length > 0 ? (
          <>
            {previousImageIndex !== null && images[previousImageIndex] ? (
              renderSlide(images[previousImageIndex], previousImageIndex, "previous")
            ) : null}
            {renderSlide(images[activeImageIndex], activeImageIndex, "active")}
          </>
        ) : (
          <div className="thumb-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {hasCarousel && (
          <>
            <button type="button" className="carousel-nav prev" onClick={goPrev} aria-label="Previous image">
              {"<"}
            </button>
            <button type="button" className="carousel-nav next" onClick={goNext} aria-label="Next image">
              {">"}
            </button>
            <div className="carousel-dots">
              {images.map((_, dotIndex) => (
                <button
                  key={`${project.id}-dot-${dotIndex}`}
                  type="button"
                  className={`carousel-dot${dotIndex === activeImageIndex ? " active" : ""}`}
                  aria-label={`?nh ${dotIndex + 1}`}
                  onClick={() => switchSlide(dotIndex)}
                />
              ))}
            </div>
          </>
        )}
        {project.featured && <div className="featured-badge">Featured</div>}
        <div className="card-tag-chip">{formatTagLabel(project.tag)}</div>
      </div>

      {/* Content */}
      <div className="card-content">
        <h3 className="card-title">{project.title}</h3>
        <p className="card-desc">{project.description}</p>

        <div className="card-tech">
          {project.tech.map((t) => (
            <span key={t} className="tech-chip">{t}</span>
          ))}
        </div>

        {(project.demo || project.github) && (
          <div className="card-links">
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer" className="link-btn primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Demo
              </a>
            )}
            {project.github && (
              <a href={project.github} target="_blank" rel="noreferrer" className="link-btn secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortfolioGrid() {
  const { t } = useLang();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("Tất cả");
  const headingRef = useScrollReveal();
  const filtersRef = useScrollReveal();
  const gridRef = useScrollReveal();

  useEffect(() => {
    const shouldUseFallbackInDev =
      import.meta.env.DEV &&
      !import.meta.env.VITE_PORTFOLIO_API_URL &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    if (shouldUseFallbackInDev) {
      setProjects(attachProjectImages(FALLBACK_PROJECTS));
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    fetch(PORTFOLIO_API_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Portfolio API ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const safeData = Array.isArray(data) ? data : FALLBACK_PROJECTS;
        setProjects(attachProjectImages(safeData));
      })
      .catch((error) => {
        if (cancelled || error?.name === "AbortError") return;
        if (import.meta.env.DEV) {
          console.info("[PortfolioGrid] fallback projects:", error?.message || error);
        }
        setProjects(attachProjectImages(FALLBACK_PROJECTS));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const filtered =
    normalizeText(activeTag) === "tat ca"
      ? projects
      : projects.filter((p) => normalizeText(p.tag) === normalizeText(activeTag));

  return (
    <>

      <section className="portfolio-section" id="portfolio">
        <div className="portfolio-inner">

          <div ref={headingRef} className="portfolio-top scroll-reveal-left">
            <div>
              <div className="section-tag">{t("portfolio_tag")}</div>
              <h2 className="portfolio-heading">
                {t("portfolio_heading_1")}<br /><em>{t("portfolio_heading_em")}</em>
              </h2>
            </div>
          </div>

          <div ref={filtersRef} className="filter-tags scroll-reveal">
            {TAGS.map((tag) => (
              <button
                key={tag}
                className={`filter-tag${activeTag === tag ? " active" : ""}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div ref={gridRef} className="scroll-reveal-scale">
            {loading ? (
              <div className="projects-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-thumb" />
                    <div className="skeleton-body">
                      <div className="skeleton-line" style={{ height: 16, width: "60%" }} />
                      <div className="skeleton-line" style={{ height: 12, width: "90%" }} />
                      <div className="skeleton-line" style={{ height: 12, width: "75%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="projects-grid">
                {filtered.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
}



