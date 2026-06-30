import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AboutMe from "./components/AboutMe.jsx";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";
import SeoHead from "./components/SeoHead";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import ProtectedRoute from "./admin/ProtectedRoute";
import DashboardPage from "./admin/DashboardPage";
import ContactsPage from "./admin/ContactsPage";
import TimelinePage from "./admin/TimelinePage";

function PublicSite({ dark, onToggle }) {
  return (
    <>
      <SeoHead />
      <Header dark={dark} onToggle={onToggle} />

      <main>
        <HeroSection dark={dark} onToggle={onToggle} />
        <AboutMe />
        <ContactForm />
      </main>

      <FloatingContact />
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
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="timeline" element={<TimelinePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
