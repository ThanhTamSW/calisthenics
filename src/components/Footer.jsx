import useScrollReveal from "../hooks/useScrollReveal";
import { useLang } from "../contexts/LanguageContext";

// ============================================================
// FOOTER — Tâm Calisthenics
// ============================================================

const YEAR = new Date().getFullYear();

const SOCIAL = [
  {
    label: "TikTok",
    href: "https://tiktok.com/@tamcalisthenics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61576483281888&locale=vi_VN",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:ngthanhtam21.work@gmail.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 7l10 7 10-7" />
      </svg>
    ),
  },
  {
    label: "Zalo",
    href: "https://zalo.me/0869797491",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.25 10.75c0-4.28-4.14-7.75-9.25-7.75S1.75 6.47 1.75 10.75c0 3.42 2.64 6.34 6.36 7.37-.3.94-1.12 3-1.18 3.19-.07.21.05.24.18.15.11-.07 3.63-2.4 5.16-3.46.25.02.5.03.76.03 5.11 0 9.22-3.47 9.22-7.28z"/>
      </svg>
    ),
  },
];

const LINKS = [
  { labelKey: "nav_about", href: "#about" },
  { labelKey: "nav_journey", href: "#journey" },
  { labelKey: "nav_contact", href: "#contact" },
];

export default function Footer() {
  const footerRef = useScrollReveal();
  const { t } = useLang();
  return (
    <>
      <style>{`

        .footer {
          background: var(--bg);
          border-top: 1px solid var(--border);
          padding: clamp(44px, 6vw, 56px) clamp(16px, 4vw, 48px) clamp(24px, 4vw, 36px);
          font-family: 'Inter', sans-serif;
          color: var(--fg);
          transition: background 0.4s, color 0.4s;
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .footer-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 48px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }

        .footer-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 1.3rem;
          letter-spacing: -0.03em;
          color: var(--fg);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 12px;
        }
        .footer-logo span { color: var(--accent); }
        .footer-tagline {
          font-size: 0.83rem;
          font-weight: 300;
          color: var(--fg2);
          line-height: 1.65;
          max-width: 240px;
        }

        .footer-links-group {
          display: flex;
          gap: clamp(28px, 6vw, 64px);
        }
        .footer-col-title {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--fg2);
          margin-bottom: 16px;
        }
        .footer-col-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-col-link {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--fg2);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-col-link:hover { color: var(--accent); }

        /* Social */
        .footer-social {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-social-link {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--fg2);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-social-link:hover { color: var(--accent); }
        .footer-social-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: var(--bg2);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .footer-social-link:hover .footer-social-icon {
          background: var(--accent);
          color: #fff;
        }

        /* Bottom bar */
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-copy {
          font-size: 0.78rem;
          color: var(--fg2);
          font-weight: 300;
        }
        .footer-copy span { color: var(--accent); }

        .back-to-top {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--fg2);
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 7px 14px;
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, transform 0.2s;
        }
        .back-to-top:hover {
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .footer { padding: 48px 24px 28px; }
          .footer-top { flex-direction: column; gap: 36px; }
          .footer-links-group { gap: 36px; flex-wrap: wrap; }
          .footer-bottom { flex-direction: column; align-items: flex-start; }
        }

        @media (max-width: 560px) {
          .footer { padding: 40px 16px 22px; }
          .footer-top { gap: 28px; margin-bottom: 36px; }
          .footer-links-group {
            flex-direction: column;
            gap: 24px;
          }
          .footer-copy { font-size: 0.74rem; }
        }
      `}</style>

      <footer ref={footerRef} className="footer scroll-reveal">
        <div className="footer-inner">
          <div className="footer-top">

            {/* Brand */}
            <div className="footer-brand">
              <a href="/" className="footer-logo">
                Tâm<span>.</span>
              </a>
              <p className="footer-tagline">
                {t("footer_tagline_1")}<br />
                {t("footer_tagline_2")}
              </p>
            </div>

            <div className="footer-links-group">
              {/* Nav links */}
              <div className="footer-col">
                <div className="footer-col-title">{t("footer_nav_title")}</div>
                <div className="footer-col-links">
                  {LINKS.map((l) => (
                    <a key={`${l.labelKey}-${l.href}`} href={l.href} className="footer-col-link">{t(l.labelKey)}</a>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="footer-col">
                <div className="footer-col-title">{t("footer_social_title")}</div>
                <div className="footer-social">
                  {SOCIAL.map((s) => (
                    <a key={s.label} href={s.href} className="footer-social-link" target="_blank" rel="noreferrer">
                      <div className="footer-social-icon">{s.icon}</div>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <p className="footer-copy">
              © {YEAR} <span>{t("footer_copy_1")}</span>. {t("footer_copy_2")} 💪 {t("footer_copy_3")} ☕
            </p>
            <a href="#" className="back-to-top">
              {t("footer_back_to_top")}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
