import { useCallback, useEffect, useState } from "react";
import { adminApi } from "./auth";

const STATUS_OPTIONS = ["all", "new", "read", "replied"];

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(0);

  const loadContacts = useCallback(async (nextFilter) => {
    setLoading(true);
    setError("");
    try {
      const payload = await adminApi(`/api/contacts.php?status=${encodeURIComponent(nextFilter)}&limit=200`);
      setContacts(Array.isArray(payload?.data) ? payload.data : []);
    } catch (loadError) {
      setError(loadError?.message || "Không thể tải danh sách liên hệ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts(filter);
  }, [filter, loadContacts]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    try {
      await adminApi("/api/contacts.php", {
        method: "PATCH",
        body: { id, status },
      });
      await loadContacts(filter);
    } catch (updateError) {
      setError(updateError?.message || "Không thể cập nhật trạng thái");
    } finally {
      setUpdatingId(0);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header row">
        <div>
          <h1>Contacts</h1>
          <p>Xem và xử lý tin nhắn liên hệ từ website.</p>
        </div>

        <label className="admin-inline-control">
          Trạng thái
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <div className="admin-alert error">{error}</div> : null}

      {loading ? (
        <div className="admin-loading">Đang tải dữ liệu...</div>
      ) : contacts.length === 0 ? (
        <div className="admin-empty">Không có tin nhắn nào.</div>
      ) : (
        <div className="admin-cards">
          {contacts.map((contact) => (
            <article key={contact.id} className="admin-contact-card">
              <header>
                <div>
                  <h3>{contact.name}</h3>
                  <p>{contact.email}</p>
                </div>
                <span className={`admin-status ${contact.status}`}>{contact.status}</span>
              </header>

              <p className="admin-contact-subject">
                <strong>Chủ đề:</strong> {contact.subject || "(không có)"}
              </p>
              <p className="admin-contact-message">{contact.message}</p>

              <footer>
                <small>{new Date(contact.created_at).toLocaleString()}</small>
                <div className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-ghost-btn"
                    onClick={() => updateStatus(contact.id, "read")}
                    disabled={updatingId === contact.id}
                  >
                    Đánh dấu đã đọc
                  </button>
                  <button
                    type="button"
                    className="admin-ghost-btn"
                    onClick={() => updateStatus(contact.id, "replied")}
                    disabled={updatingId === contact.id}
                  >
                    Đánh dấu đã phản hồi
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
