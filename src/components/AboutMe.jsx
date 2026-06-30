import { useCallback, useEffect, useRef, useState } from "react";
import "./AboutMe.css";
import useScrollReveal from "../hooks/useScrollReveal";
import { useLang } from "../contexts/LanguageContext";

// ============================================================
// ABOUT ME - Tam Calisthenics Personal Brand
// ============================================================

const TIMELINE_AUTOPLAY_MS = 4200;
const TIMELINE_CAROUSEL_TRANSITION_MS = 900;

// Fallback data khi API chưa sẵn sàng
const TIMELINE_FALLBACK = [
  {
    year: "30/03/2025",
    title: "Battle Of Team II",
    desc: "Tham gia thi đấu tại Battle Of Team II, tiếp tục hành trình cọ xát và nâng cấp bản thân.",
    accent: true,
    cardTag: "Giải đấu",
    chips: ["Battle Of Team", "Street Workout", "2025"],
    imageKeys: ["BOT_II"],
  },
  {
    year: "31/12/2024",
    title: "Giám khảo - Battle Of Team I",
    desc: "Được mời làm giám khảo tại giải Battle Of Team I. Từ vận động viên trở thành người đánh giá.",
    accent: false,
    cardTag: "Thành tích",
    chips: ["Giám khảo", "Battle Of Team", "2024"],
    imageKeys: ["giamkhao_1", "giamkhao_2", "giamkhao_3", "giamkhao_4", "giamkhao"],
  },
  {
    year: "27/04/2024",
    title: "PREMIUM BATTLE II",
    desc: "Premium Battle II là sự kiện được tổ chức chuyên nghiệp dành cho cộng đồng đam mê Calisthenics trên khắp Việt Nam. Giải đấu quy tụ nhiều tài năng nổi bật với những màn trình diễn đầy ấn tượng, sức mạnh và kỹ thuật.",
    accent: false,
    cardTag: "Giải đấu",
    chips: ["Premium", "Battle", "2024"],
    imageKeys: ["premium2_1", "premium2_2", "premium2_3"],
  },
  {
    year: "21/01/2024",
    title: "Ultimate Battle Z 2024",
    desc: "Tham gia Ultimate Battle Z 2024, cọ xát với các vận động viên mạnh nhất khu vực.",
    accent: false,
    cardTag: "Giải đấu",
    chips: ["Battle", "Street Workout", "2024"],
    imageKeys: ["ultimateZ_1", "ultimateZ_2"],
  },
  {
    year: "09/12/2023",
    title: "VIETNAM STREET WORKOUT CHAMPIONSHIP 2023",
    desc: "Vietnam Street Workout Championship 2023 quy tụ vận động viên từ ba miền Bắc, Trung, Nam. Giải đấu hướng tới thúc đẩy phong trào Calisthenics - Street Workout, kết nối cộng đồng và lan tỏa tinh thần vượt giới hạn tại Việt Nam.",
    accent: false,
    cardTag: "Giải đấu",
    chips: ["Championship", "Street Workout", "2023"],
    imageKeys: ["championship_1"],
  },
  {
    year: "20/08/2023",
    title: "PREMIUM BATTLE I",
    desc: "Ngày 20/08/2023, The Premium Battle chính thức diễn ra với bầu không khí kịch tính và đầy đam mê của cộng đồng calisthenics Việt Nam. Giải đấu nổi bật với bảng thi đấu hấp dẫn cùng hệ thống huy chương dành cho những vận động viên xuất sắc nhất.",
    accent: false,
    cardTag: "Thành tích",
    chips: ["Top 1", "Champion", "Battle"],
    imageKeys: ["premium1_1", "premium1_2", "premium1_3", "premium1_4", "premium1_5"],
  },
  {
    year: "15/07/2023",
    title: "SOUTHERN STREET WORKOUT BATTLE 2023",
    desc: "Sau thời gian dài ấp ủ, SOUTHERN STREET WORKOUT BATTLE 2023 chính thức khởi tranh. Southern Street Workout ra đời với sứ mệnh tổ chức các giải đấu và sự kiện Street Workout tại khu vực miền Nam Việt Nam.",
    accent: false,
    cardTag: "Giải đấu",
    chips: ["Street Workout", "Battle", "2023"],
    imageKeys: ["southern_1"],
  },
  {
    year: "2020",
    title: "Bắt đầu hành trình Calisthenics",
    desc: "Cột mốc đầu tiên bén duyên với Calisthenics & Street Workout. Hành trình bắt đầu từ con số 0 với những bài tập cơ bản nhất. Từng giọt mồ hôi ngày đó đã xây dựng nên một nền móng vững chắc cho hiện tại.",
    accent: false,
    cardTag: "Hành trình",
    chips: ["Calisthenics", "Nền tảng", "Khởi đầu"],
    imageKeys: [],
  },
];

const INTERESTS = [
  { emoji: "\u{1F4AA}", labelKey: "about_interest_1" },
  { emoji: "\u{1F938}", labelKey: "about_interest_2" },
  { emoji: "\u{1F3AF}", labelKey: "about_interest_3" },
  { emoji: "\u{1F3C3}", labelKey: "about_interest_4" },
  { emoji: "\u{1F957}", labelKey: "about_interest_5" },
  { emoji: "\u{1F3AC}", labelKey: "about_interest_6" },
];

// Non-eager loading: images will be loaded only when needed
const TIMELINE_IMAGE_MODULES = import.meta.glob("../../public/images/{BOT_II,giamkhao,giamkhao_1,giamkhao_2,giamkhao_3,giamkhao_4,premium1_1,premium1_2,premium1_3,premium1_4,premium1_5,premium2_1,premium2_2,premium2_3,southern_1,ultimateZ_1,ultimateZ_2,championship_1}.{png,jpg,jpeg,webp,avif,gif,svg}", {
  import: "default",
});

const TIMELINE_IMAGE_LOADERS = Object.entries(TIMELINE_IMAGE_MODULES).reduce((acc, [path, loader]) => {
  const fileName = path.split("/").pop() || "";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  acc[baseName] = loader;
  return acc;
}, {});

const TIMELINE_IMAGE_FOCUS = {
  premium1_1: "center 40%",
  premium1_3: "center 42%",
  premium1_4: "center 74%",
  premium1_5: "center 38%",
  premium2_1: "center 38%",
  premium2_2: "center 44%",
  premium2_3: "center 42%",
  championship_1: "center 44%",
  southern_1: "center 38%",
  BOT_II: "center 22%",
};

const getTimelineId = (timelineItem) => `${timelineItem.year}-${timelineItem.title}`;

function resolveTimelineImages(imageKeys = [], imageLookup = {}) {
  return imageKeys
    .map((key) => {
      const src = imageLookup[key] || "";
      if (!src) return null;
      return {
        src,
        position: TIMELINE_IMAGE_FOCUS[key] || "center center",
      };
    })
    .filter(Boolean);
}

function TimelineMediaCarousel({ images, title, imageAltText }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const imageSignature = images.map((image) => `${image.src}::${image.position || ""}`).join("|");

  useEffect(() => {
    setActiveIndex(0);
    setPreviousIndex(null);
  }, [imageSignature]);

  useEffect(() => {
    if (images.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % images.length;
        setPreviousIndex(current);
        return next;
      });
    }, TIMELINE_AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [imageSignature, images.length]);

  useEffect(() => {
    if (previousIndex === null) return undefined;
    const timer = setTimeout(() => setPreviousIndex(null), TIMELINE_CAROUSEL_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [previousIndex]);

  const switchToIndex = (nextIndex) => {
    if (nextIndex === activeIndex) return;
    setPreviousIndex(activeIndex);
    setActiveIndex(nextIndex);
  };

  if (images.length === 0) {
    return (
      <div className="timeline-project-placeholder">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <>
      {previousIndex !== null && images[previousIndex] ? (
        <img
          src={images[previousIndex].src}
          alt=""
          aria-hidden="true"
          className="timeline-project-image previous"
          style={{ objectPosition: images[previousIndex].position }}
          loading="lazy"
        />
      ) : null}
      <img
        src={images[activeIndex].src}
        alt={title}
        className="timeline-project-image active"
        style={{ objectPosition: images[activeIndex].position }}
        loading="lazy"
      />
      {images.length > 1 && (
        <div className="timeline-project-dots">
          {images.map((_, index) => (
            <button
              key={`${title}-dot-${index}`}
              type="button"
              className={`timeline-project-dot${index === activeIndex ? " active" : ""}`}
              aria-label={`${imageAltText || 'Ảnh'} ${index + 1}`}
              onClick={() => switchToIndex(index)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function AboutMe() {
  const { t } = useLang();
  const [timeline, setTimeline] = useState(TIMELINE_FALLBACK);
  const [openTimelineId, setOpenTimelineId] = useState("");
  const [activeTimelineId, setActiveTimelineId] = useState("");
  const [timelineImageLookup, setTimelineImageLookup] = useState({});
  const headerLeftRef = useScrollReveal();
  const headerRightRef = useScrollReveal();
  const cardsRef = useScrollReveal();
  const tabsRef = useScrollReveal();
  const timelineItemRefs = useRef({});

  // Fetch timeline từ API, fallback về dữ liệu tĩnh nếu thất bại
  useEffect(() => {
    // Không fetch PHP API nếu đang ở môi trường tĩnh (GitHub Pages)
    const hostname = window.location.hostname || "";
    if (hostname.includes("github.io") || hostname.includes("thanhtamnguyen.id.vn")) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    
    // Đặt timeout 2 giây để tránh bị treo trang nếu server phản hồi chậm
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    fetch("/api/timeline.php", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          // Map API response sang định dạng component (imageKeys giữ từ fallback nếu title khớp)
          const mapped = data.map((item) => {
            const fallback = TIMELINE_FALLBACK.find(
              (f) => f.title.toLowerCase() === item.title.toLowerCase()
            );
            return {
              year: item.year,
              title: item.title,
              desc: item.desc,
              accent: !!item.accent,
              cardTag: item.cardTag,
              chips: Array.isArray(item.chips) ? item.chips : [],
              imageKeys: fallback?.imageKeys ?? [],
            };
          });
          setTimeline(mapped);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          console.warn('Timeline API fetch timeout or aborted, using fallback.');
        } else {
          console.error("Failed to load timeline from API:", err);
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const getItems = () =>
      Object.entries(timelineItemRefs.current)
        .map(([id, element]) => ({ id, element }))
        .filter((item) => item.element instanceof HTMLElement);

    let items = getItems();

    const syncActiveTimelineItem = () => {
      if (items.length === 0) {
        items = getItems();
        if (items.length === 0) return;
      }

      const focusLine = window.innerHeight * 0.42;
      const sortedItems = [...items].sort((a, b) => {
        const aTop = a.element.getBoundingClientRect().top;
        const bTop = b.element.getBoundingClientRect().top;
        return aTop - bTop;
      });

      let nextActiveId = sortedItems[0].id;

      for (let index = 0; index < sortedItems.length; index += 1) {
        const { id, element } = sortedItems[index];
        const rect = element.getBoundingClientRect();
        const markerY = rect.top + 14;
        if (markerY <= focusLine) {
          nextActiveId = id;
        } else {
          break;
        }
      }

      setActiveTimelineId((current) => (current === nextActiveId ? current : nextActiveId));
    };

    syncActiveTimelineItem();
    window.addEventListener("scroll", syncActiveTimelineItem, { passive: true });
    window.addEventListener("resize", syncActiveTimelineItem);

    return () => {
      window.removeEventListener("scroll", syncActiveTimelineItem);
      window.removeEventListener("resize", syncActiveTimelineItem);
    };
  }, []);


  const loadTimelineImages = useCallback(async (imageKeys = []) => {
    const keysToLoad = imageKeys.filter((key) => key && !timelineImageLookup[key] && TIMELINE_IMAGE_LOADERS[key]);
    if (keysToLoad.length === 0) return;

    const loadedEntries = await Promise.all(
      keysToLoad.map(async (key) => {
        try {
          const url = await TIMELINE_IMAGE_LOADERS[key]();
          return [key, url];
        } catch {
          return null;
        }
      })
    );

    const safeEntries = loadedEntries.filter(Boolean);
    if (safeEntries.length === 0) return;

    setTimelineImageLookup((current) => ({
      ...current,
      ...Object.fromEntries(safeEntries),
    }));
  }, [timelineImageLookup]);

  useEffect(() => {
    if (!activeTimelineId) return;
    const activeTimeline = timeline.find((item) => getTimelineId(item) === activeTimelineId);
    if (activeTimeline) loadTimelineImages(activeTimeline.imageKeys);
  }, [activeTimelineId, timeline, loadTimelineImages]);
  const toggleTimeline = (id) => {
    const timelineItem = timeline.find((item) => getTimelineId(item) === id);
    if (timelineItem) {
      loadTimelineImages(timelineItem.imageKeys);
    }
    setOpenTimelineId((current) => (current === id ? "" : id));
  };

  return (
    <>
      <section className="about-section" id="about">
        <div className="about-inner">

          {/* HEADER */}
          <div className="about-header">
            <div ref={headerLeftRef} className="scroll-reveal-left">
              <div className="section-tag">{t("about_tag")}</div>
              <h2 className="about-heading">
                {t("about_heading_1")}<br />
                {t("about_heading_2")} <em>{t("about_heading_em")}</em>
              </h2>
            </div>
            <div ref={headerRightRef} className="scroll-reveal-right">
              <div className="about-bio">
                <p dangerouslySetInnerHTML={{ __html: t("about_bio_1") }} />
                <p dangerouslySetInnerHTML={{ __html: t("about_bio_2") }} />
                <p dangerouslySetInnerHTML={{ __html: t("about_bio_3") }} />
              </div>
              <div className="interests">
                {INTERESTS.map((i) => (
                  <div key={i.labelKey} className="interest-chip">
                    <span>{i.emoji}</span> {t(i.labelKey)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STAT CARDS */}
          <div ref={cardsRef} className="about-cards scroll-reveal">
            <div className="about-card">
              <span className="card-icon">{"\u{1F947}"}</span>
              <div className="card-num">{t("about_card_1_num")}</div>
              <div className="card-label">{t("about_card_1_label")}</div>
            </div>
            <div className="about-card">
              <span className="card-icon">{"\u{1F4AA}"}</span>
              <div className="card-num">{t("about_card_2_num")}</div>
              <div className="card-label">{t("about_card_2_label")}</div>
            </div>
            <div className="about-card">
              <span className="card-icon">{"\u{1F3C6}"}</span>
              <div className="card-num">{t("about_card_3_num")}</div>
              <div className="card-label">{t("about_card_3_label")}</div>
            </div>
          </div>

          {/* TABS */}
          <div ref={tabsRef} className="tabs-wrap scroll-reveal" id="journey">
            <div className="tab-list">
              <button className="tab-btn active">{t("about_tab_journey")}</button>
            </div>

            <div className="timeline">
              {timeline.map((t_item, index) => {
                const timelineId = getTimelineId(t_item);
                const isOpen = openTimelineId === timelineId;
                const isInView = activeTimelineId === timelineId;
                const images = resolveTimelineImages(t_item.imageKeys, timelineImageLookup);
                const hasConfiguredImages = (t_item.imageKeys ?? []).length > 0;
                return (
                  <div
                    key={`${t_item.year}-${t_item.title}-${index}`}
                    ref={(element) => {
                      if (element) timelineItemRefs.current[timelineId] = element;
                      else delete timelineItemRefs.current[timelineId];
                    }}
                    className={`timeline-item${t_item.accent ? " accent" : ""}${isOpen ? " open" : ""}${isInView ? " in-view" : ""}`}
                  >
                    <button type="button" className="timeline-head" onClick={() => toggleTimeline(timelineId)} aria-expanded={isOpen}>
                      <div className="timeline-head-main">
                        <div className="timeline-year">{t_item.year}</div>
                        <div className="timeline-title">{t_item.title}</div>
                      </div>
                      <span className="timeline-chevron">{">"}</span>
                    </button>

                    <div className={`timeline-panel${isOpen ? " open" : ""}`}>
                      <div className="timeline-panel-inner">
                        <div className="timeline-project-card">
                          {hasConfiguredImages ? (
                            <div className="timeline-project-thumb">
                              <TimelineMediaCarousel images={images} title={t_item.title} imageAltText={t("about_image_alt")} />
                              <span className="timeline-project-tag">{t_item.cardTag}</span>
                            </div>
                          ) : null}
                          <div className="timeline-project-body">
                            <div className="timeline-project-title">{t_item.title}</div>
                            <div className="timeline-project-desc">{t_item.desc}</div>
                            <div className="timeline-project-chips">
                              {!hasConfiguredImages ? <span className="timeline-project-chip">{t_item.cardTag}</span> : null}
                              {t_item.chips.map((chip) => (
                                <span key={`${t_item.title}-${chip}`} className="timeline-project-chip">{chip}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}












