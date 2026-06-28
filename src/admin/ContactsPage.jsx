import { useEffect, useState } from "react";
import { adminApi } from "./auth";

const STATUS_OPTIONS = ["all", "new", "read", "replied"];

function ReplyModal({ contact, onClose, onReplied }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (message.trim().length < 10) {
      setError("Nội dung phản hồi quá ngắn (tối thiểu 10 ký tự)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await adminApi("/api/contact_reply.php", {
        method: "POST",
        body: { contact_id: contact.id, message: message.trim() },
      });
      onReplied(contact.id);
      onClose();
    } catch (err) {
      setError(err?.message || "Không thể gửi phản hồi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>Phản hồi cho {contact.name}</h2>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-reply-info">
            <span className="admin-reply-info-label">Đến:</span>
            <span>{contact.name} &lt;{contact.email}&gt;</span>
          </div>
          <div className="admin-reply-info">
            <span className="admin-reply-info-label">Chủ đề gốc:</span>
            <span>{contact.subject || "(không có)"}</span>
          </div>
          <div className="admin-reply-original">
            <div className="admin-reply-original-label">Tin nhắn gốc:</div>
            <blockquote className="admin-reply-blockquote">{contact.message}</blockquote>
          </div>

          <label className="admin-reply-label">
            Nội dung phản hồi
            <textarea
              className="admin-reply-textarea"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập nội dung phản hồi của bạn..."
              disabled={loading}
              autoFocus
            />
          </label>

          {error && <div className="admin-alert error">{error}</div>}
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-ghost-btn" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button type="button" className="admin-primary-btn" onClick={handleSend} disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi phản hồi →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(0);
  const [replyContact, setReplyContact] = useState(null);

  const loadContacts = async (nextFilter = filter) => {
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
  };

  useEffect(() => {
    loadContacts(filter);
  }, [filter]);

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

  const handleReplied = (contactId) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId ? { ...c, status: "replied" } : c
      )
    );
  };

  return (
    <section className="admin-page">
      <style>{`
        .admin-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: adminFadeIn 0.15s ease;
        }
        @keyframes adminFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .admin-modal {
          background: var(--bg, #fff);
          border: 1px solid var(--border, #e5e5e5);
          border-radius: 16px;
          width: 100%; max-width: 560px;
          max-height: 90dvh;
          display: flex; flex-direction: column;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18);
          animation: adminSlideUp 0.2s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes adminSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .admin-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--border, #e5e5e5);
        }
        .admin-modal-header h2 { font-size: 1rem; font-weight: 600; margin: 0; }
        .admin-modal-close {
          background: none; border: none; cursor: pointer;
          color: var(--fg2, #888); font-size: 1rem;
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .admin-modal-close:hover { background: var(--bg2, #f0f0f0); }
        .admin-modal-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
        .admin-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border, #e5e5e5);
          display: flex; justify-content: flex-end; gap: 10px;
        }
        .admin-reply-info { display: flex; gap: 8px; font-size: 0.85rem; color: var(--fg2, #888); }
        .admin-reply-info-label { font-weight: 600; min-width: 90px; }
        .admin-reply-original { display: flex; flex-direction: column; gap: 6px; }
        .admin-reply-original-label { font-size: 0.8rem; font-weight: 600; color: var(--fg2, #888); }
        .admin-reply-blockquote {
          border-left: 3px solid var(--border, #e5e5e5);
          padding: 10px 14px;
          margin: 0;
          font-size: 0.85rem;
          color: var(--fg2, #888);
          background: var(--bg2, #f7f7f7);
          border-radius: 0 8px 8px 0;
          white-space: pre-wrap;
          max-height: 100px; overflow-y: auto;
        }
        .admin-reply-label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; font-weight: 600; }
        .admin-reply-textarea {
          width: 100%;
          border: 1.5px solid var(--border, #e5e5e5);
          border-radius: 10px;
          padding: 10px 14px;
          font-family: inherit;
          font-size: 0.9rem;
          background: var(--bg, #fff);
          color: var(--fg, #141414);
          resize: vertical;
          transition: border-color 0.2s;
        }
        .admin-reply-textarea:focus {
          outline: none;
          border-color: var(--accent, #FF6B35);
        }
        .admin-primary-btn {
          background: var(--accent, #FF6B35);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .admin-primary-btn:hover { opacity: 0.88; }
        .admin-primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .admin-reply-btn {
          background: color-mix(in srgb, var(--accent, #FF6B35) 12%, transparent);
          color: var(--accent, #FF6B35);
          border: 1.5px solid color-mix(in srgb, var(--accent, #FF6B35) 30%, transparent);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-reply-btn:hover {
          background: color-mix(in srgb, var(--accent, #FF6B35) 20%, transparent);
        }
      `}</style>

      {replyContact && (
        <ReplyModal
          contact={replyContact}
          onClose={() => setReplyContact(null)}
          onReplied={handleReplied}
        />
      )}

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
                <small>{new Date(contact.created_at).toLocaleString("vi-VN")}</small>
                <div className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-reply-btn"
                    onClick={() => setReplyContact(contact)}
                    disabled={updatingId === contact.id}
                  >
                    ✉ Phản hồi
                  </button>
                  <button
                    type="button"
                    className="admin-ghost-btn"
                    onClick={() => updateStatus(contact.id, "read")}
                    disabled={updatingId === contact.id || contact.status === "read"}
                  >
                    Đã đọc
                  </button>
                  <button
                    type="button"
                    className="admin-ghost-btn"
                    onClick={() => updateStatus(contact.id, "replied")}
                    disabled={updatingId === contact.id || contact.status === "replied"}
                  >
                    Đã phản hồi
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
