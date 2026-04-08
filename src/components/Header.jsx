import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Về mình", href: "#about" },
  { label: "Hành trình", href: "#portfolio" },
  { label: "Liên hệ", href: "#contact" },
];

export default function Header({ dark, onToggle }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );

    ["about", "portfolio", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <>
      <style>{`

        @keyframes slideDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes menuOpen {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        .header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 0 48px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: color-mix(in srgb, var(--bg) 80%, transparent);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 4px 30px rgba(0,0,0,0.08);
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
          font-family: 'Inter', sans-serif;
          animation: slideDown 0.5s 0.1s both;
        }

        .header.scrolled {
          background: color-mix(in srgb, var(--bg) 92%, transparent);
          border-bottom: 1px solid rgba(255,107,53,0.15);
          box-shadow: 0 4px 30px rgba(0,0,0,0.12), 0 1px 0 rgba(255,107,53,0.08);
        }

        .header-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 1.7rem;
          letter-spacing: -0.03em;
          color: var(--fg);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 2px;
          transition: color 0.2s;
        }
        .header-logo:hover { color: var(--accent); }
        .header-logo-dot { color: var(--accent); }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          position: relative;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: var(--fg2);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover { color: var(--fg); background: var(--bg2); }
        .nav-link.active { color: var(--accent); }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 2px; left: 50%;
          transform: translateX(-50%);
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--accent);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toggle-btn {
          width: 44px; height: 24px;
          border-radius: 999px;
          border: 1.5px solid var(--border);
          background: var(--bg2);
          cursor: pointer;
          position: relative;
          transition: background 0.3s;
          flex-shrink: 0;
        }
        .toggle-btn::after {
          content: '';
          position: absolute;
          top: 2px; left: 2px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: var(--accent);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .toggle-btn.dark::after { transform: translateX(20px); }

        .header-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          color: #fff;
          background: var(--accent);
          padding: 8px 18px;
          border-radius: 999px;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          white-space: nowrap;
        }
        .header-cta:hover { background: var(--accent2); transform: translateY(-1px); }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .hamburger:hover { background: var(--bg2); }
        .hamburger span {
          display: block;
          width: 20px; height: 1.5px;
          background: var(--fg);
          border-radius: 999px;
          transition: transform 0.3s, opacity 0.3s;
          transform-origin: center;
        }
        .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4.5px, 4.5px); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4.5px, -4.5px); }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 68px; left: 12px; right: 12px;
          background: color-mix(in srgb, var(--bg) 95%, transparent);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px;
          z-index: 99;
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
          animation: menuOpen 0.25s ease;
        }
        .mobile-menu.open { display: block; }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }
        .mobile-nav-link {
          font-size: 1rem;
          font-weight: 500;
          color: var(--fg);
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 12px;
          transition: background 0.2s, color 0.2s;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mobile-nav-link:hover,
        .mobile-nav-link.active { background: var(--bg2); color: var(--accent); }

        .mobile-menu-footer {
          border-top: 1px solid var(--border);
          padding-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mobile-toggle-label {
          font-size: 0.82rem;
          color: var(--fg2);
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .header { padding: 0 20px; }
          .header-nav, .header-cta { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>

      <header className={`header${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="header-logo">
          Tâm<span className="header-logo-dot">.</span>
        </a>

        <nav className="header-nav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link${activeSection === link.href.replace("#", "") ? " active" : ""}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className={`toggle-btn${dark ? " dark" : ""}`}
            onClick={onToggle}
            aria-label="Toggle dark mode"
          />
          <a href="#contact" className="header-cta">
            Liên hệ
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <div className="mobile-nav-links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`mobile-nav-link${activeSection === link.href.replace("#", "") ? " active" : ""}`}
              onClick={handleNavClick}
            >
              {link.label}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
        <div className="mobile-menu-footer">
          <span className="mobile-toggle-label">{dark ? "Dark mode" : "Light mode"}</span>
          <button
            className={`toggle-btn${dark ? " dark" : ""}`}
            onClick={onToggle}
            aria-label="Toggle dark mode"
          />
        </div>
      </div>
    </>
  );
}
