import { useEffect, useState } from "react";
import { adminApi } from "./auth";

// ============================================================
// TimelinePage — CRUD cho timeline sự kiện / thành tích
// ============================================================

const EMPTY_FORM = {
  year: "",
  title: "",
  desc: "",
  cardTag: "",
  chips: "",
  accent: false,
  displayOrder: 0,
};

function TimelineForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.year.trim() || !form.title.trim()) {
      setError("Năm và tiêu đề là bắt buộc");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...form,
        chips: form.chips.split(",").map((s) => s.trim()).filter(Boolean),
        displayOrder: Number(form.displayOrder) || 0,
      });
    } catch (err) {
      setError(err?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <label>
          Năm / Ngày *
          <input
            type="text"
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
            placeholder="vd: 20/08/2023 hoặc 2023"
            required
          />
        </label>
        <label>
          Thứ tự hiển thị
          <input
            type="number"
            value={form.displayOrder}
            onChange={(e) => set("displayOrder", e.target.value)}
            placeholder="80 = hiển thị trước"
          />
        </label>
      </div>

      <label>
        Tiêu đề *
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Tên sự kiện / giải đấu"
          required
        />
      </label>

      <label>
        Mô tả
        <textarea
          rows={3}
          value={form.desc}
          onChange={(e) => set("desc", e.target.value)}
          placeholder="Chi tiết về sự kiện..."
        />
      </label>

      <div className="admin-form-grid">
        <label>
          Nhãn thẻ (cardTag)
          <input
            type="text"
            value={form.cardTag}
            onChange={(e) => set("cardTag", e.target.value)}
            placeholder="vd: Giải đấu / Thành tích"
          />
        </label>
        <label>
          Tags (phân cách bằng dấu phẩy)
          <input
            type="text"
            value={form.chips}
            onChange={(e) => set("chips", e.target.value)}
            placeholder="vd: Battle, Street Workout, 2024"
          />
        </label>
      </div>

      <label className="admin-checkbox-label">
        <input
          type="checkbox"
          checked={form.accent}
          onChange={(e) => set("accent", e.target.checked)}
        />
        Nổi bật (accent highlight)
      </label>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-form-actions">
        <button type="button" className="admin-ghost-btn" onClick={onCancel} disabled={saving}>
          Hủy
        </button>
        <button type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : initial?.id ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
}

export default function TimelinePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("list"); // 'list' | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(0);

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/timeline.php", {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu timeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const handleSave = async (formData) => {
    const isEdit = !!editing?.id;
    await adminApi("/api/timeline.php", {
      method: isEdit ? "PUT" : "POST",
      body: isEdit ? { ...formData, id: editing.id } : formData,
    });
    setMode("list");
    setEditing(null);
    await loadItems();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa mục timeline này?")) return;
    setDeletingId(id);
    try {
      await adminApi("/api/timeline.php", {
        method: "DELETE",
        body: { id },
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err?.message || "Không thể xóa");
    } finally {
      setDeletingId(0);
    }
  };

  if (mode === "add" || mode === "edit") {
    return (
      <section className="admin-page">
        <div className="admin-page-header">
          <h1>{mode === "add" ? "Thêm mốc thời gian" : "Sửa mốc thời gian"}</h1>
        </div>
        <TimelineForm
          initial={editing ? {
            ...editing,
            chips: Array.isArray(editing.chips) ? editing.chips.join(", ") : "",
          } : undefined}
          onSave={handleSave}
          onCancel={() => { setMode("list"); setEditing(null); }}
        />
      </section>
    );
  }

  return (
    <section className="admin-page">
      <style>{`
        .timeline-admin-card {
          background: var(--bg2, #f7f7f5);
          border: 1px solid var(--border, #e5e5e5);
          border-radius: 12px;
          padding: 16px 18px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          transition: border-color 0.2s;
        }
        .timeline-admin-card:hover { border-color: var(--accent, #FF6B35); }
        .timeline-admin-meta { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
        .timeline-admin-year { font-size: 0.75rem; font-weight: 700; color: var(--accent, #FF6B35); text-transform: uppercase; letter-spacing: 0.06em; }
        .timeline-admin-title { font-size: 0.95rem; font-weight: 600; margin: 0; }
        .timeline-admin-tag { font-size: 0.75rem; color: var(--fg2, #888); }
        .timeline-admin-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
        .timeline-admin-chip {
          font-size: 0.7rem; padding: 2px 8px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent,#FF6B35) 12%, transparent);
          color: var(--accent,#FF6B35);
        }
        .admin-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .admin-checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; cursor: pointer; }
        .admin-checkbox-label input { width: 16px; height: 16px; cursor: pointer; }
        .admin-form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
        @media (max-width: 600px) { .admin-form-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="admin-page-header row">
        <div>
          <h1>Timeline</h1>
          <p>Quản lý các mốc thời gian, giải đấu và thành tích.</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setMode("add"); }}
          style={{ padding: "8px 18px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
        >
          + Thêm mới
        </button>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="admin-empty">Chưa có mốc thời gian nào.</div>
      ) : (
        <div className="admin-cards">
          {items.map((item) => (
            <div key={item.id} className="timeline-admin-card">
              <div className="timeline-admin-meta">
                <span className="timeline-admin-year">{item.year}</span>
                <h3 className="timeline-admin-title">{item.title}</h3>
                <span className="timeline-admin-tag">{item.cardTag}{item.accent ? " ⭐" : ""}</span>
                {Array.isArray(item.chips) && item.chips.length > 0 && (
                  <div className="timeline-admin-chips">
                    {item.chips.map((chip) => (
                      <span key={chip} className="timeline-admin-chip">{chip}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="admin-table-actions" style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  className="admin-ghost-btn"
                  onClick={() => { setEditing(item); setMode("edit"); }}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="admin-ghost-btn"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  style={{ color: "#E53E3E" }}
                >
                  {deletingId === item.id ? "..." : "Xóa"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
