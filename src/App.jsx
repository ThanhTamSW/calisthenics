import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AboutMe from "./components/AboutMe.jsx";
import PortfolioGrid from "./components/PortfolioGrid";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import ProtectedRoute from "./admin/ProtectedRoute";
import DashboardPage from "./admin/DashboardPage";
import PortfolioPage from "./admin/PortfolioPage";
import ContactsPage from "./admin/ContactsPage";

function PublicSite({ dark, onToggle }) {
  return (
    <>
      <Header dark={dark} onToggle={onToggle} />

      <main>
        <HeroSection dark={dark} onToggle={onToggle} />
        <AboutMe />
        <PortfolioGrid />
        <ContactForm />
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // ignore storage failure
    }
  }, [dark]);

  const toggleTheme = () => setDark((value) => !value);

  return (
    <Routes>
      <Route path="/" element={<PublicSite dark={dark} onToggle={toggleTheme} />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="contacts" element={<ContactsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
