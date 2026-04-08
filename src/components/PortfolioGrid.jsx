import { useState, useEffect } from "react";
import useScrollReveal from "../hooks/useScrollReveal";

// ============================================================
// PORTFOLIO GRID — fetch từ /api/portfolio.php
// ============================================================

const TAGS = ["Tất cả", "Giải đấu", "Thành tích", "Content"];

// Fallback data khi chưa có API
const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: "🥇 Top 1 Premium Battle",
    description: "Đạt giải Top 1 tại Premium Battle. Một trong những thành tích đáng tự hào nhất trong hành trình calisthenics.",
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
    description: "Tham gia giải đấu street workout khu vực miền Nam. Trải nghiệm thi đấu chuyên nghiệp đầu tiên.",
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
    description: "Tham gia giải vô địch Street Workout Việt Nam 2023. Sân chơi lớn nhất cho cộng đồng calisthenics cả nước.",
    tech: ["Quốc gia", "Championship", "2023"],
    tag: "Giải đấu",
    demo: "",
    github: "",
    thumbnail: "",
    featured: true,
  },
  {
    id: 4,
    title: "PREMIUM BATTLE II",
    description: "Tiếp tục tham gia Premium Battle lần II. Thử thách bản thân ở đấu trường quen thuộc.",
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
    tech: ["Giám khảo", "Battle Of Team", "2024"],
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

function ProjectCard({ project, index }) {
  return (
    <div
      className={`project-card${project.featured ? " featured" : ""}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Thumbnail */}
      <div className="card-thumb">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.title} />
        ) : (
          <div className="thumb-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {project.featured && <div className="featured-badge">Featured</div>}
        <div className="card-tag-chip">{project.tag}</div>
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
          {!project.demo && !project.github && (
            <span className="link-btn disabled">Sắp ra mắt</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioGrid() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("Tất cả");
  const headingRef = useScrollReveal();
  const filtersRef = useScrollReveal();
  const gridRef = useScrollReveal();

  useEffect(() => {
    fetch("/api/portfolio.php")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => {
        // Dùng fallback nếu API chưa có
        setProjects(FALLBACK_PROJECTS);
        setLoading(false);
      });
  }, []);

  const filtered =
    activeTag === "Tất cả"
      ? projects
      : projects.filter((p) => p.tag === activeTag);

  return (
    <>
      <style>{`

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          from { background-position: -400px 0; }
          to   { background-position: 400px 0; }
        }

        .portfolio-section {
          background: var(--bg2);
          padding: 100px 48px;
          font-family: 'Inter', sans-serif;
          color: var(--fg);
          transition: background 0.4s, color 0.4s;
        }
        .portfolio-inner { max-width: 1100px; margin: 0 auto; }

        .portfolio-top {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 24px;
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
          margin-bottom: 12px;
        }
        .section-tag::before {
          content: '';
          width: 24px; height: 1.5px;
          background: var(--accent);
        }

        .portfolio-heading {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 3.5vw, 3rem);
          line-height: 1.0;
          letter-spacing: -0.04em;
        }
        .portfolio-heading em { font-style: normal; color: var(--accent); }

        /* Filter tags */
        .filter-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          animation: fadeUp 0.7s 0.2s both;
          margin-bottom: 40px;
        }
        .filter-tag {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 8px 18px;
          border-radius: 999px;
          border: 1.5px solid var(--border);
          background: transparent;
          color: var(--fg2);
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-tag:hover { border-color: var(--accent); color: var(--accent); }
        .filter-tag.active { background: var(--accent); border-color: var(--accent); color: #fff; }

        /* Grid */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        /* Card */
        .project-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.25s, box-shadow 0.25s;
          animation: fadeUp 0.5s both;
          backdrop-filter: blur(8px);
        }
        .project-card:hover {
          border-color: var(--accent);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.10);
        }
        .project-card.featured { grid-column: span 2; }

        /* Thumb */
        .card-thumb {
          position: relative;
          height: 180px;
          background: var(--bg2);
          overflow: hidden;
        }
        .project-card.featured .card-thumb { height: 220px; }
        .card-thumb img { width:100%; height:100%; object-fit:cover; }
        .thumb-placeholder {
          width:100%; height:100%;
          display:flex; align-items:center; justify-content:center;
          color: var(--fg2);
          opacity: 0.3;
          background: linear-gradient(135deg, var(--bg2), var(--bg));
        }

        .featured-badge {
          position: absolute;
          top: 12px; left: 12px;
          background: var(--accent);
          color: #fff;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .card-tag-chip {
          position: absolute;
          bottom: 12px; right: 12px;
          background: rgba(0,0,0,0.55);
          color: #fff;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          backdrop-filter: blur(4px);
        }

        /* Content */
        .card-content { padding: 24px; }
        .card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--fg);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .card-desc {
          font-size: 0.83rem;
          font-weight: 300;
          color: var(--fg2);
          line-height: 1.65;
          margin-bottom: 16px;
        }
        .card-tech {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }
        .tech-chip {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--accent);
          background: rgba(255,107,53,0.10);
          border: 1px solid rgba(255,107,53,0.20);
          border-radius: 6px;
          padding: 3px 8px;
        }
        .card-links { display:flex; gap:8px; }
        .link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .link-btn.primary {
          background: var(--accent);
          color: #fff;
        }
        .link-btn.primary:hover { background: var(--accent2); }
        .link-btn.secondary {
          background: var(--bg2);
          color: var(--fg);
          border: 1px solid var(--border);
        }
        .link-btn.secondary:hover { border-color: var(--accent); color: var(--accent); }
        .link-btn.disabled {
          background: var(--bg2);
          color: var(--fg2);
          cursor: default;
          opacity: 0.6;
        }

        /* Skeleton */
        .skeleton-card {
          border-radius: 20px;
          overflow: hidden;
          background: var(--bg2);
          border: 1px solid var(--border);
        }
        .skeleton-thumb {
          height: 180px;
          background: linear-gradient(90deg, var(--bg2) 25%, var(--bg) 50%, var(--bg2) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-body { padding: 24px; }
        .skeleton-line {
          border-radius: 6px;
          background: linear-gradient(90deg, var(--bg2) 25%, var(--bg) 50%, var(--bg2) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.5s infinite;
          margin-bottom: 10px;
        }

        @media (max-width: 860px) {
          .portfolio-section { padding: 72px 24px; }
          .projects-grid { grid-template-columns: 1fr 1fr; }
          .project-card.featured { grid-column: span 2; }
        }
        @media (max-width: 560px) {
          .projects-grid { grid-template-columns: 1fr; }
          .project-card.featured { grid-column: span 1; }
        }
      `}</style>

      <section className="portfolio-section" id="portfolio">
        <div className="portfolio-inner">

          <div ref={headingRef} className="portfolio-top scroll-reveal-left">
            <div>
              <div className="section-tag">Portfolio</div>
              <h2 className="portfolio-heading">
                Hành trình<br />của <em>mình</em>
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

