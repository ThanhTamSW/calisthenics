import { useEffect, useMemo, useState } from "react";
import PortfolioForm from "./PortfolioForm";
import { adminApi } from "./auth";

export default function PortfolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(0);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) return Number(b.featured) - Number(a.featured);
      return Number(b.displayOrder || 0) - Number(a.displayOrder || 0);
    });
  }, [items]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/portfolio.php");
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError?.message || "Không thể tải portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editingItem?.id) {
        await adminApi("/api/portfolio.php", { method: "PUT", body: { ...payload, id: editingItem.id } });
      } else {
        await adminApi("/api/portfolio.php", { method: "POST", body: payload });
      }
      await fetchItems();
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Xóa item này?");
    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    try {
      await adminApi("/api/portfolio.php", { method: "DELETE", body: { id } });
      await fetchItems();
    } catch (deleteError) {
      setError(deleteError?.message || "Không thể xóa item");
    } finally {
      setDeletingId(0);
    }
  };

  const handleUploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const payload = await adminApi("/api/upload.php", { method: "POST", body: formData });
    const url = payload?.data?.url || "";
    if (!url) {
      throw new Error("Upload thành công nhưng không nhận được URL");
    }
    return url;
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header row">
        <div>
          <h1>Portfolio</h1>
          <p>Quản lý danh sách dự án/hành trình hiển thị ở trang chính.</p>
        </div>
        <button type="button" onClick={openCreate}>
          + Thêm item
        </button>
      </div>

      {error ? <div className="admin-alert error">{error}</div> : null}

      {loading ? (
        <div className="admin-loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Tag</th>
                <th>Featured</th>
                <th>Order</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="admin-subtext">{item.description}</div>
                  </td>
                  <td>{item.tag}</td>
                  <td>{item.featured ? "Yes" : "No"}</td>
                  <td>{item.displayOrder || 0}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button type="button" className="admin-ghost-btn" onClick={() => openEdit(item)}>
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">Chưa có dữ liệu portfolio.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {formOpen ? (
        <PortfolioForm
          initialValue={editingItem}
          saving={saving}
          onCancel={closeForm}
          onSubmit={handleSave}
          onUploadImage={handleUploadImage}
        />
      ) : null}
    </section>
  );
}

