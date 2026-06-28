import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "./auth";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    portfolioTotal: 0,
    featuredTotal: 0,
    contactsTotal: 0,
    unreadTotal: 0,
  });

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const [portfolioData, contactsSummary] = await Promise.all([
          fetch("/api/portfolio.php").then((r) => r.json()),
          adminApi("/api/contacts.php?summary=1"),
        ]);

        const portfolioList = Array.isArray(portfolioData) ? portfolioData : [];
        const contacts = contactsSummary?.data || {};

        if (!active) return;
        setStats({
          portfolioTotal: portfolioList.length,
          featuredTotal: portfolioList.filter((item) => item?.featured).length,
          contactsTotal: Number(contacts.total || 0),
          unreadTotal: Number(contacts.unread || 0),
        });
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError?.message || "Không thể tải dữ liệu dashboard");
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Tổng quan nhanh tình trạng website.</p>
      </div>

      {error ? <div className="admin-alert error">{error}</div> : null}

      <div className="admin-stats-grid">
        <Link to="/admin/portfolio" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-icon">🏆</div>
          <div>
            <h3>Portfolio Items</h3>
            <strong>{loading ? "..." : stats.portfolioTotal}</strong>
          </div>
        </Link>
        <Link to="/admin/portfolio" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-icon">🔥</div>
          <div>
            <h3>Featured</h3>
            <strong>{loading ? "..." : stats.featuredTotal}</strong>
          </div>
        </Link>
        <Link to="/admin/contacts" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-icon">📨</div>
          <div>
            <h3>Contacts</h3>
            <strong>{loading ? "..." : stats.contactsTotal}</strong>
          </div>
        </Link>
        <Link to="/admin/contacts" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-icon">🔴</div>
          <div>
            <h3>Unread Messages</h3>
            <strong>{loading ? "..." : stats.unreadTotal}</strong>
          </div>
        </Link>
      </div>
    </section>
  );
}

