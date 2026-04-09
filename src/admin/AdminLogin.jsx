import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticated, setAdminSession } from "./auth";
import "./admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "Đăng nhập thất bại");
      }

      setAdminSession({
        token: payload.token,
        user: payload.user,
        expiresAt: payload.expiresAt,
      });

      navigate("/admin/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError?.message || "Không thể đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>Admin Dashboard</h1>
        <p>Đăng nhập để quản lý portfolio và tin nhắn liên hệ.</p>

        <form onSubmit={handleSubmit} className="admin-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              disabled={loading}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </label>

          {error ? <div className="admin-alert error">{error}</div> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

