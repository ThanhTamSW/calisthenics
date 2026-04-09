import { useMemo, useState } from "react";

function getInitialState(initialValue) {
  return {
    title: initialValue?.title || "",
    description: initialValue?.description || "",
    techText: Array.isArray(initialValue?.tech) ? initialValue.tech.join(", ") : "",
    tag: initialValue?.tag || "Content",
    demo: initialValue?.demo || "",
    github: initialValue?.github || "",
    thumbnail: initialValue?.thumbnail || "",
    featured: Boolean(initialValue?.featured),
    displayOrder: Number(initialValue?.displayOrder || 0),
  };
}

export default function PortfolioForm({
  initialValue,
  saving,
  onCancel,
  onSubmit,
  onUploadImage,
}) {
  const [form, setForm] = useState(() => getInitialState(initialValue));
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const title = useMemo(() => (initialValue ? "Sửa Portfolio Item" : "Thêm Portfolio Item"), [initialValue]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadImage) return;
    setError("");
    setUploading(true);
    try {
      const uploadedUrl = await onUploadImage(file);
      updateField("thumbnail", uploadedUrl);
    } catch (uploadError) {
      setError(uploadError?.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      id: initialValue?.id,
      title: form.title.trim(),
      description: form.description.trim(),
      tech: form.techText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      tag: form.tag.trim(),
      demo: form.demo.trim(),
      github: form.github.trim(),
      thumbnail: form.thumbnail.trim(),
      featured: form.featured,
      displayOrder: Number(form.displayOrder || 0),
    };

    if (!payload.title || !payload.description) {
      setError("Tiêu đề và mô tả là bắt buộc");
      return;
    }

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError?.message || "Không thể lưu dữ liệu");
    }
  };

  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onCancel}>
      <div className="admin-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>{title}</h2>
          <button type="button" className="admin-ghost-btn" onClick={onCancel}>
            Đóng
          </button>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Tiêu đề
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              disabled={saving}
              required
            />
          </label>

          <label>
            Mô tả
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              disabled={saving}
              required
            />
          </label>

          <div className="admin-form-grid">
            <label>
              Tag
              <input
                type="text"
                value={form.tag}
                onChange={(e) => updateField("tag", e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Display Order
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => updateField("displayOrder", e.target.value)}
                disabled={saving}
              />
            </label>
          </div>

          <label>
            Tech (cách nhau dấu phẩy)
            <input
              type="text"
              value={form.techText}
              onChange={(e) => updateField("techText", e.target.value)}
              disabled={saving}
            />
          </label>

          <div className="admin-form-grid">
            <label>
              Demo URL
              <input
                type="url"
                value={form.demo}
                onChange={(e) => updateField("demo", e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              GitHub URL
              <input
                type="url"
                value={form.github}
                onChange={(e) => updateField("github", e.target.value)}
                disabled={saving}
              />
            </label>
          </div>

          <label>
            Thumbnail URL
            <input
              type="text"
              value={form.thumbnail}
              onChange={(e) => updateField("thumbnail", e.target.value)}
              disabled={saving}
            />
          </label>

          <div className="admin-upload-row">
            <label className="admin-upload-btn">
              {uploading ? "Đang upload..." : "Upload ảnh"}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={saving || uploading} />
            </label>
            <label className="admin-check-row">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
                disabled={saving}
              />
              Featured
            </label>
          </div>

          {error ? <div className="admin-alert error">{error}</div> : null}

          <div className="admin-form-actions">
            <button type="button" className="admin-ghost-btn" onClick={onCancel} disabled={saving}>
              Hủy
            </button>
            <button type="submit" disabled={saving || uploading}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

