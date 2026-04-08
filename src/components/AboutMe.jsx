import { useState } from "react";
import useScrollReveal from "../hooks/useScrollReveal";

// ============================================================
// ABOUT ME — Tâm Calisthenics Personal Brand
// ============================================================

const SKILLS = [
  { name: "Pull-ups", level: 85 },
  { name: "Dips", level: 80 },
  { name: "Muscle Up", level: 55 },
  { name: "Handstand", level: 45 },
  { name: "Front Lever", level: 40 },
  { name: "Planche", level: 25 },
];

const TIMELINE = [
  {
    year: "2024",
    title: "Giám khảo & Thi đấu",
    desc: "Giám khảo Giải Battle Of Team I. Tham gia giải Battle Of Team Strength Lightz II.",
    accent: true,
  },
  {
    year: "2023",
    title: "Top 1 Premium Battle & Thi đấu quốc gia",
    desc: "Tham gia giải SOUTHERN STREET WORKOUT BATTLE 2023. Đạt Top 1 Premium Battle. Tham gia VIETNAM STREET WORKOUT CHAMPIONSHIP 2023 và PREMIUM BATTLE II.",
    accent: false,
  },
  {
    year: "2020",
    title: "Bắt đầu hành trình Calisthenics",
    desc: "Lần đầu tiếp xúc với calisthenics và street workout. Bắt đầu tập các động tác cơ bản và xây dựng nền tảng từ đầu.",
    accent: false,
  },
];

const INTERESTS = [
  { emoji: "💪", label: "Calisthenics" },
  { emoji: "🤸", label: "Street Workout" },
  { emoji: "🎯", label: "Skills Training" },
  { emoji: "🏃", label: "Cardio" },
  { emoji: "🥗", label: "Dinh dưỡng" },
  { emoji: "🎬", label: "Chia sẻ hành trình" },
];

export default function AboutMe() {
  const [activeTab, setActiveTab] = useState("skills");
  const headerLeftRef = useScrollReveal();
  const headerRightRef = useScrollReveal();
  const cardsRef = useScrollReveal();
  const tabsRef = useScrollReveal();
  return (
    <>
      <style>{`

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to   { width: var(--fill); }
        }
        @keyframes float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-8px); }
        }

        .about-section {
          background: var(--bg);
          padding: 100px 48px;
          font-family: 'Inter', sans-serif;
          color: var(--fg);
          transition: background 0.4s, color 0.4s;
        }

        .about-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* —— HEADER —— */
        .about-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
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

        /* —— CARD GRID —— */
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

        /* —— TABS —— */
        .tabs-wrap { animation: fadeUp 0.7s 0.3s both; }

        .tab-list {
          display: flex;
          gap: 4px;
          background: var(--bg2);
          border-radius: 14px;
          padding: 4px;
          margin-bottom: 32px;
          width: fit-content;
        }
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
        }
        .tab-btn.active {
          background: var(--accent);
          color: #fff;
        }

        /* Skills */
        .skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .skill-item {}
        .skill-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .skill-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--fg);
        }
        .skill-pct {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
        }
        .skill-bar {
          height: 6px;
          background: var(--bg2);
          border-radius: 999px;
          overflow: hidden;
        }
        .skill-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          border-radius: 999px;
          width: var(--fill);
          animation: fillBar 1s 0.5s cubic-bezier(0.22,1,0.36,1) both;
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
          margin-bottom: 32px;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -25px; top: 6px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--bg2);
          border: 2px solid var(--border);
        }
        .timeline-item.accent::before {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 0 4px rgba(255,107,53,0.15);
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
          margin-bottom: 6px;
        }
        .timeline-desc {
          font-size: 0.85rem;
          font-weight: 300;
          color: var(--fg2);
          line-height: 1.65;
        }

        /* —— RESPONSIVE —— */
        @media (max-width: 860px) {
          .about-section { padding: 72px 24px; }
          .about-header { grid-template-columns: 1fr; gap: 40px; }
          .about-cards { grid-template-columns: 1fr 1fr; }
          .skills-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .about-cards { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="about-section" id="about">
        <div className="about-inner">

          {/* HEADER */}
          <div className="about-header">
            <div ref={headerLeftRef} className="scroll-reveal-left">
              <div className="section-tag">Về mình</div>
              <h2 className="about-heading">
                Tập ban ngày,<br />
                Tập <em>ban đêm</em>
              </h2>
            </div>
            <div ref={headerRightRef} className="scroll-reveal-right">
              <div className="about-bio">
                <p>
                  Mình là <strong>Nguyễn Thanh Tâm</strong> — người đang
                  comeback calisthenics sau <strong>10 tháng nghỉ</strong> vì bận công việc
                  và cuộc sống thay đổi.
                </p>
                <p>
                  Mình tập calisthenics và chia sẻ hành trình
                  trên TikTok & Facebook dưới thương hiệu <strong>Tâm Calisthenics</strong>.
                  Mục tiêu của mình là chinh phục các động tác nâng cao như muscle up,
                  front lever và planche.
                </p>
                <p>
                  Mình tin rằng <strong>kỷ luật và nhất quán</strong> — dù trong
                  tập luyện hay cuộc sống — là thứ tạo ra sự khác biệt thật sự.
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
              <span className="card-icon">💪</span>
              <div className="card-num">5+</div>
              <div className="card-label">Năm tập luyện</div>
            </div>
            <div className="about-card">
              <span className="card-icon">🏆</span>
              <div className="card-num">6+</div>
              <div className="card-label">Giải đấu tham gia</div>
            </div>
            <div className="about-card">
              <span className="card-icon">🥇</span>
              <div className="card-num">Top 1</div>
              <div className="card-label">Premium Battle</div>
            </div>
          </div>

          {/* TABS */}
          <div ref={tabsRef} className="tabs-wrap scroll-reveal">
            <div className="tab-list">
              <button
                className={`tab-btn${activeTab === "skills" ? " active" : ""}`}
                onClick={() => setActiveTab("skills")}
              >
                Kỹ năng
              </button>
              <button
                className={`tab-btn${activeTab === "timeline" ? " active" : ""}`}
                onClick={() => setActiveTab("timeline")}
              >
                Hành trình
              </button>
            </div>

            {activeTab === "skills" && (
              <div className="skills-grid">
                {SKILLS.map((s) => (
                  <div key={s.name} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">{s.name}</span>
                      <span className="skill-pct">{s.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div className="skill-fill" style={{ "--fill": `${s.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="timeline">
                {TIMELINE.map((t) => (
                  <div key={t.year} className={`timeline-item${t.accent ? " accent" : ""}`}>
                    <div className="timeline-year">{t.year}</div>
                    <div className="timeline-title">{t.title}</div>
                    <div className="timeline-desc">{t.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
}
