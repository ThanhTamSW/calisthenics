import { useState, useEffect } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AboutMe from "./components/AboutMe";
import PortfolioGrid from "./components/PortfolioGrid";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";

// ============================================================
// APP ROOT — Tâm Calisthenics Personal Brand
// ============================================================

export default function App() {
  // — Theme (lưu vào localStorage) —
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { }
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  return (
    <>
      {/* Sticky Header — nhận dark + toggle để sync */}
      <Header dark={dark} onToggle={toggleTheme} />

      <main>
        {/* Hero — sync dark mode qua props */}
        <HeroSection dark={dark} onToggle={toggleTheme} />

        {/* About */}
        <AboutMe />

        {/* Portfolio */}
        <PortfolioGrid />

        {/* Contact */}
        <ContactForm />
      </main>

      <Footer />
    </>
  );
}
