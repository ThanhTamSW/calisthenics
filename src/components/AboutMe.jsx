import { useEffect, useState } from "react";
import useScrollReveal from "../hooks/useScrollReveal";

// ============================================================
// ABOUT ME - Tam Calisthenics Personal Brand
// ============================================================

const TIMELINE_AUTOPLAY_MS = 4200;
const TIMELINE_CAROUSEL_TRANSITION_MS = 900;

const TIMELINE = [
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
    desc: "Được mời làm giám khảo tại giải Battle Of Team I, đánh dấu cột mốc mới trong hành trình thi đấu.",
    accent: false,
    cardTag: "Thành tích",
    chips: ["Giám khảo", "Battle Of Team", "2024"],
    imageKeys: ["giamkhao_1", "giamkhao_2", "giamkhao_3", "giamkhao_4", "giamkhao"],
  },
  {
    year: "27/04/2024",
    title: "PREMIUM BATTLE II",
    desc: "Premium Battle II là sự kiện được tổ chức chuyên nghiệp dành cho cộng đồng đam mê Calisthenics trên khắp Việt Nam. Giải đấu quy tụ nhiều tài năng nổi bật với những màn trình diễn đầy ấn tượng, sức mạnh và kỹ thuật. Mục tiêu của giải là tìm ra đại diện Việt Nam tham dự Xia-Long Cup Asia Street Workout Championship tại Đài Loan và có thể là giải SWUB.",
    accent: false,
    cardTag: "Giải đấu",
    chips: ["Premium", "Battle", "2024"],
    imageKeys: ["premium2_1", "premium2_2", "premium2_3"],
  },
  {
    year: "21/01/2024",
    title: "Ultimate Battle Z 2024",
    desc: "Tham gia Ultimate Battle Z 2024, cọ xát cùng các vận động viên street workout mạnh trong khu vực.",
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
    desc: "Sau thời gian dài ấp ủ, SOUTHERN STREET WORKOUT BATTLE 2023 chính thức khởi tranh. Southern Street Workout ra đời với sứ mệnh tổ chức các giải đấu và sự kiện Street Workout tại khu vực miền Nam Việt Nam. Với sự đồng hành từ Ashura, Sept Strength Club, shop Hoàng Kỳ Tống và VNSWC, giải đấu trở thành tiền đề để lan tỏa đam mê Street Workout, tinh thần tập luyện và rèn luyện sức khỏe tới cộng đồng.",
    accent: false,
    cardTag: "Giải đấu",
    chips: ["Street Workout", "Battle", "2023"],
    imageKeys: ["southern_1"],
  },
  {
    year: "2020",
    title: "Bắt đầu hành trình Calisthenics",
    desc: "Lần đầu tiếp xúc với calisthenics và street workout. Bắt đầu tập các động tác cơ bản và xây dựng nền tảng từ đầu.",
    accent: false,
    cardTag: "Hành trình",
    chips: ["Calisthenics", "Nền tảng", "Khởi đầu"],
    imageKeys: [],
  },
];

const INTERESTS = [
  { emoji: "\u{1F4AA}", label: "Calisthenics" },
  { emoji: "\u{1F938}", label: "Street Workout" },
  { emoji: "\u{1F3AF}", label: "Skills Training" },
  { emoji: "\u{1F3C3}", label: "Cardio" },
  { emoji: "\u{1F957}", label: "Dinh dưỡng" },
  { emoji: "\u{1F3AC}", label: "Chia sẻ hành trình" },
];

const TIMELINE_IMAGE_MODULES = import.meta.glob("../../images/*.{png,jpg,jpeg,webp,avif,gif,svg}", {
  eager: true,
  import: "default",
});

const TIMELINE_IMAGE_LOOKUP = Object.entries(TIMELINE_IMAGE_MODULES).reduce((acc, [path, url]) => {
  const fileName = path.split("/").pop() || "";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  acc[baseName] = url;
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

function resolveTimelineImages(imageKeys = []) {
  return imageKeys
    .map((key) => {
      const src = TIMELINE_IMAGE_LOOKUP[key] || "";
      if (!src) return null;
      return {
        src,
        position: TIMELINE_IMAGE_FOCUS[key] || "center center",
      };
    })
    .filter(Boolean);
}

function TimelineMediaCarousel({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);

  useEffect(() => {
    setActiveIndex(0);
    setPreviousIndex(null);
  }, [images]);

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
  }, [images]);

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
              aria-label={`Ảnh ${index + 1}`}
              onClick={() => switchToIndex(index)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function AboutMe() {
  const [openTimelineId, setOpenTimelineId] = useState("");
  const headerLeftRef = useScrollReveal();
  const headerRightRef = useScrollReveal();
  const cardsRef = useScrollReveal();
  const tabsRef = useScrollReveal();

  const toggleTimeline = (id) => {
    setOpenTimelineId((current) => (current === id ? "" : id));
  };

  return (
    <>
      <style>{`

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-8px); }
        }
        @keyframes timelineFadeIn {
          from { opacity: 0; transform: scale(1.01); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes timelineFadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(1.01); }
        }

        .about-section {
          background: var(--bg);
          padding: clamp(72px, 8vw, 100px) clamp(16px, 4vw, 48px);
          font-family: 'Inter', sans-serif;
          color: var(--fg);
          transition: background 0.4s, color 0.4s;
        }

        .about-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* -- HEADER -- */
        .about-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(28px, 6vw, 80px);
          align-items: center;
          margin-bottom: 80px;
          animation: fadeUp 0.7s 0.1s both;
        }

        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 20px;
        }
        .section-tag::before {
          content: '';
          width: 24px; height: 1.5px;
          background: var(--accent);
        }

        .about-heading {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          line-height: 1.0;
          letter-spacing: -0.04em;
          margin-bottom: 24px;
        }
        .about-heading em {
          font-style: normal;
          color: var(--accent);
        }

        .about-bio {
          font-size: 0.95rem;
          font-weight: 300;
          line-height: 1.85;
          color: var(--fg2);
        }
        .about-bio p + p { margin-top: 16px; }
        .about-bio strong { color: var(--fg); font-weight: 500; }

        /* Interests chips */
        .interests {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }
        .interest-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--fg);
          transition: border-color 0.2s, transform 0.2s;
        }
        .interest-chip:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        /* -- CARD GRID -- */
        .about-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 64px;
          animation: fadeUp 0.7s 0.2s both;
        }
        .about-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          backdrop-filter: blur(8px);
          transition: border-color 0.2s, transform 0.2s;
        }
        .about-card:hover {
          border-color: var(--accent);
          transform: translateY(-4px);
        }
        .card-icon {
          font-size: 1.8rem;
          margin-bottom: 12px;
          display: block;
          animation: float 4s ease-in-out infinite;
        }
        .card-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--accent);
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .card-label {
          font-size: 0.8rem;
          color: var(--fg2);
          font-weight: 400;
        }

        /* -- TABS -- */
        .tabs-wrap { animation: fadeUp 0.7s 0.3s both; }

        .tab-list {
          display: flex;
          gap: 4px;
          background: var(--bg2);
          border-radius: 14px;
          padding: 4px;
          margin-bottom: 32px;
          width: fit-content;
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tab-list::-webkit-scrollbar { display: none; }
        .tab-btn {
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          padding: 9px 20px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          background: transparent;
          color: var(--fg2);
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .tab-btn.active {
          background: var(--accent);
          color: #fff;
        }

        /* Timeline */
        .timeline {
          position: relative;
          padding-left: 28px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 6px; top: 8px; bottom: 8px;
          width: 1.5px;
          background: var(--border);
        }
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -25px; top: 14px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--bg2);
          border: 2px solid var(--border);
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .timeline-item.accent::before,
        .timeline-item.open::before {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 0 4px rgba(255,107,53,0.15);
        }
        .timeline-head {
          width: 100%;
          border: none;
          background: transparent;
          color: inherit;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          cursor: pointer;
          text-align: left;
          padding: 4px 0;
        }
        .timeline-head-main {
          flex: 1;
          min-width: 0;
        }
        .timeline-year {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent);
          margin-bottom: 4px;
        }
        .timeline-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--fg);
          line-height: 1.4;
        }
        .timeline-chevron {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg2);
          color: var(--fg2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          flex-shrink: 0;
          transition: transform 0.2s ease, color 0.2s, border-color 0.2s;
        }
        .timeline-item.open .timeline-chevron {
          transform: rotate(90deg);
          color: var(--accent);
          border-color: var(--accent);
        }
        .timeline-panel {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transform: translateY(-4px);
          transition: max-height 0.38s ease, opacity 0.24s ease, transform 0.24s ease;
        }
        .timeline-panel.open {
          max-height: 980px;
          opacity: 1;
          transform: translateY(0);
          margin-top: 8px;
        }
        .timeline-desc {
          font-size: 0.85rem;
          font-weight: 300;
          color: var(--fg2);
          line-height: 1.65;
          margin-bottom: 12px;
        }
        .timeline-project-card {
          margin-top: 14px;
          width: 100%;
          max-width: 860px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .timeline-project-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .timeline-project-thumb {
          position: relative;
          height: clamp(250px, 32vw, 360px);
          background: linear-gradient(135deg, var(--bg2), var(--bg));
          overflow: hidden;
          transform: translateZ(0);
        }
        .timeline-project-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 32%;
          display: block;
          backface-visibility: hidden;
        }
        .timeline-project-image.active {
          z-index: 2;
          animation: timelineFadeIn ${TIMELINE_CAROUSEL_TRANSITION_MS}ms ease both;
        }
        .timeline-project-image.previous {
          z-index: 1;
          animation: timelineFadeOut ${TIMELINE_CAROUSEL_TRANSITION_MS}ms ease both;
        }
        .timeline-project-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--fg2);
          opacity: 0.45;
        }
        .timeline-project-tag {
          position: absolute;
          right: 10px;
          bottom: 10px;
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 700;
          color: #fff;
          background: rgba(0, 0, 0, 0.55);
          padding: 4px 9px;
          border-radius: 999px;
          backdrop-filter: blur(4px);
          z-index: 3;
        }
        .timeline-project-dots {
          position: absolute;
          left: 50%;
          bottom: 10px;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 3;
        }
        .timeline-project-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          border: 0;
          padding: 0;
          background: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: width 0.2s ease, background 0.2s ease;
        }
        .timeline-project-dot.active {
          width: 14px;
          background: #fff;
        }
        .timeline-project-body {
          padding: 14px;
        }
        .timeline-project-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--fg);
          margin-bottom: 6px;
        }
        .timeline-project-desc {
          font-size: 0.8rem;
          line-height: 1.65;
          color: var(--fg2);
          margin-bottom: 12px;
        }
        .timeline-project-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .timeline-project-chip {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--accent);
          background: rgba(255,107,53,0.10);
          border: 1px solid rgba(255,107,53,0.20);
          border-radius: 6px;
          padding: 3px 8px;
        }

        /* -- RESPONSIVE -- */
        @media (max-width: 860px) {
          .about-section { padding: 72px 24px; }
          .about-header {
            grid-template-columns: 1fr;
            gap: 32px;
            margin-bottom: 48px;
          }
          .about-cards { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .about-section { padding: 64px 16px; }
          .about-header {
            gap: 24px;
            margin-bottom: 36px;
          }
          .about-heading {
            font-size: clamp(1.9rem, 9vw, 2.6rem);
            line-height: 1.05;
            margin-bottom: 14px;
          }
          .about-bio { font-size: 0.9rem; line-height: 1.75; }
          .about-cards {
            gap: 12px;
            margin-bottom: 40px;
          }
          .about-card { padding: 20px; border-radius: 16px; }
          .card-icon { font-size: 1.5rem; margin-bottom: 8px; }
          .card-num { font-size: 1.7rem; }
          .interests { gap: 8px; margin-top: 20px; }
          .interest-chip {
            padding: 6px 12px;
            font-size: 0.75rem;
          }
          .tab-list { padding: 3px; }
          .tab-btn { padding: 8px 14px; font-size: 0.78rem; }
          .timeline-project-thumb { height: 180px; }
          .timeline-project-body { padding: 12px; }
          .timeline-project-title { font-size: 0.88rem; }
          .timeline-project-desc { font-size: 0.78rem; }
        }
        @media (max-width: 420px) {
          .about-section { padding: 56px 14px; }
          .about-cards { grid-template-columns: 1fr; gap: 10px; }
          .about-header { margin-bottom: 28px; }
          .tab-btn { padding: 7px 12px; font-size: 0.75rem; }
        }
      `}</style>

      <section className="about-section" id="about">
        <div className="about-inner">

          {/* HEADER */}
          <div className="about-header">
            <div ref={headerLeftRef} className="scroll-reveal-left">
              <div className="section-tag">Về mình</div>
              <h2 className="about-heading">
                Kiên trì mỗi ngày,<br />
                tiến bộ <em>mỗi ngày</em>
              </h2>
            </div>
            <div ref={headerRightRef} className="scroll-reveal-right">
              <div className="about-bio">
                <p>
                  Mình là <strong>Nguyễn Thanh Tâm</strong>, gắn bó với calisthenics từ năm <strong>2020</strong>.
                </p>
                <p>
                  Quá trình tập luyện của mình đi từ các bài nền tảng như pull-up, dips, core đến các kỹ năng nâng cao như muscle up, front lever và planche.
                </p>
                <p>
                  Mình chia sẻ hành trình trên TikTok & Facebook dưới thương hiệu <strong>Tâm Calisthenics</strong>. Mình tin rằng <strong>kỷ luật và nhất quán</strong> là điều tạo ra khác biệt thật sự.
                </p>
              </div>
              <div className="interests">
                {INTERESTS.map((i) => (
                  <div key={i.label} className="interest-chip">
                    <span>{i.emoji}</span> {i.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STAT CARDS */}
          <div ref={cardsRef} className="about-cards scroll-reveal">
            <div className="about-card">
              <span className="card-icon">{"\u{1F947}"}</span>
              <div className="card-num">Top 1</div>
              <div className="card-label">Premium Battle I</div>
            </div>
            <div className="about-card">
              <span className="card-icon">{"\u{1F4AA}"}</span>
              <div className="card-num">5+</div>
              <div className="card-label">Năm tập luyện</div>
            </div>
            <div className="about-card">
              <span className="card-icon">{"\u{1F3C6}"}</span>
              <div className="card-num">7+</div>
              <div className="card-label">Giải đấu tham gia</div>
            </div>
          </div>

          {/* TABS */}
          <div ref={tabsRef} className="tabs-wrap scroll-reveal" id="journey">
            <div className="tab-list">
              <button className="tab-btn active">Hành trình</button>
            </div>

            <div className="timeline">
              {TIMELINE.map((t, index) => {
                const timelineId = `${t.year}-${t.title}`;
                const isOpen = openTimelineId === timelineId;
                const images = resolveTimelineImages(t.imageKeys);
                return (
                  <div key={`${t.year}-${t.title}-${index}`} className={`timeline-item${t.accent ? " accent" : ""}${isOpen ? " open" : ""}`}>
                    <button type="button" className="timeline-head" onClick={() => toggleTimeline(timelineId)} aria-expanded={isOpen}>
                      <div className="timeline-head-main">
                        <div className="timeline-year">{t.year}</div>
                        <div className="timeline-title">{t.title}</div>
                      </div>
                      <span className="timeline-chevron">{">"}</span>
                    </button>

                    <div className={`timeline-panel${isOpen ? " open" : ""}`}>
                      <div className="timeline-project-card">
                        <div className="timeline-project-thumb">
                          <TimelineMediaCarousel images={images} title={t.title} />
                          <span className="timeline-project-tag">{t.cardTag}</span>
                        </div>
                        <div className="timeline-project-body">
                          <div className="timeline-project-title">{t.title}</div>
                          <div className="timeline-project-desc">{t.desc}</div>
                          <div className="timeline-project-chips">
                            {t.chips.map((chip) => (
                              <span key={`${t.title}-${chip}`} className="timeline-project-chip">{chip}</span>
                            ))}
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









