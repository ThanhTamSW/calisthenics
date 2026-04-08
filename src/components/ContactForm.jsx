import { useState, useRef } from "react";
import useScrollReveal from "../hooks/useScrollReveal";

// ============================================================
// CONTACT FORM - Tâm Calisthenics Personal Brand
// Stack: React + gửi về PHP API /api/contact.php
// ============================================================

const SOCIAL_LINKS = [
  {
    label: "TikTok",
    handle: "@tamcalisthenics",
    href: "https://tiktok.com/@tamcalisthenics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    handle: "Tâm Calisthenics",
    href: "https://www.facebook.com/profile.php?id=61576483281888&locale=vi_VN",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Email",
    handle: "ngthanhtam21.work@gmail.com",
    href: "mailto:ngthanhtam21.work@gmail.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 7l10 7 10-7" />
      </svg>
    ),
  },
];

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
let recaptchaScriptPromise = null;

function loadRecaptchaScript(siteKey) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window unavailable"));
  }

  if (window.grecaptcha?.execute) {
    return Promise.resolve();
  }

  if (!recaptchaScriptPromise) {
    recaptchaScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src*="recaptcha/api.js?render=${siteKey}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("reCAPTCHA script load failed")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("reCAPTCHA script load failed"));
      document.head.appendChild(script);
    });
  }

  return recaptchaScriptPromise;
}

async function getRecaptchaToken(siteKey) {
  if (!siteKey) return "";
  await loadRecaptchaScript(siteKey);

  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(siteKey, { action: "contact_submit" })
        .then((token) => resolve(token))
        .catch((error) => reject(error));
    });
  });
}

// Validation
function validate(fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = "Bạn chưa nhập tên";
  if (!fields.email.trim()) errors.email = "Bạn chưa nhập email";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = "Email chưa đúng định dạng";
  if (!fields.message.trim()) errors.message = "Bạn chưa nhập tin nhắn";
  else if (fields.message.trim().length < 10)
    errors.message = "Tin nhắn cần ít nhất 10 ký tự";
  return errors;
}

export default function ContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", subject: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [submitMessage, setSubmitMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const formRef = useRef(null);
  const formStartedAtRef = useRef(Date.now());
  const infoRef = useScrollReveal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((f) => ({ ...f, [name]: value }));
    if (name === "message") setCharCount(value.length);
    if (status === "error") {
      setStatus("idle");
      setSubmitMessage("");
    }
    if (touched[name]) {
      const errs = validate({ ...fields, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const errs = validate(fields);
    setErrors((prev) => ({ ...prev, [name]: errs[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, message: true };
    setTouched(allTouched);
    setSubmitMessage("");
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const recaptchaToken = await getRecaptchaToken(RECAPTCHA_SITE_KEY);
      const payloadToSend = {
        ...fields,
        website: honeypot,
        recaptchaToken,
        formElapsedMs: Math.max(0, Date.now() - formStartedAtRef.current),
      };

      const res = await fetch("/api/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend),
        signal: controller.signal,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || payload?.success === false) {
        const details = Array.isArray(payload?.errors) ? payload.errors.join(". ") : "";
        throw new Error(details || payload?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }

      setStatus("success");
      setSubmitMessage(payload?.message || "");
      setFields({ name: "", email: "", subject: "", message: "" });
      setHoneypot("");
      setTouched({});
      setCharCount(0);
      formStartedAtRef.current = Date.now();
    } catch (error) {
      const message =
        error?.name === "AbortError"
          ? "Hệ thống phản hồi chậm. Vui lòng thử lại sau ít phút."
          : error?.message || "Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ qua email.";
      setSubmitMessage(message);
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const isLoading = status === "loading";

  return (
    <>
      <style>{`

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%,60% { transform:translateX(-6px); }
          40%,80% { transform:translateX(6px); }
        }
        @keyframes scaleIn {
          from { transform:scale(0.85); opacity:0; }
          to   { transform:scale(1);    opacity:1; }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
        @keyframes successPop {
          0%   { transform:scale(0.5) rotate(-10deg); opacity:0; }
          60%  { transform:scale(1.15) rotate(3deg); opacity:1; }
          100% { transform:scale(1) rotate(0deg); opacity:1; }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }

        /* SECTION */
        .contact-section {
          background: var(--bg);
          padding: clamp(72px, 8vw, 100px) clamp(16px, 4vw, 48px);
          overflow-x: clip;
          font-family: 'Inter', sans-serif;
          color: var(--fg);
          transition: background 0.4s, color 0.4s;
        }

        .contact-inner {
          max-width: 1100px;
          width: 100%;
          min-width: 0;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: clamp(28px, 7vw, 80px);
          align-items: start;
        }
        .contact-inner > * { min-width: 0; }

        /* LEFT INFO */
        .contact-info {
          animation: fadeUp 0.7s 0.1s both;
        }

        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 20px;
        }
        .section-tag::before {
          content: '';
          width: 24px; height: 1.5px;
          background: var(--accent);
        }

        .contact-heading {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(2.2rem, 4vw, 3.4rem);
          line-height: 1.0;
          letter-spacing: -0.04em;
          margin-bottom: 20px;
        }
        .contact-heading em {
          font-style: normal;
          color: var(--accent);
        }

        .contact-sub {
          font-size: 0.95rem;
          font-weight: 300;
          line-height: 1.8;
          color: var(--fg2);
          max-width: 380px;
          margin-bottom: 48px;
        }

        /* Social cards */
        .social-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .social-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          text-decoration: none;
          color: var(--fg);
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          backdrop-filter: blur(8px);
          min-width: 0;
          overflow: hidden;
        }
        .social-card:hover {
          border-color: var(--accent);
          transform: translateX(6px);
          box-shadow: var(--shadow);
        }
        .social-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: var(--bg2);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .social-card:hover .social-icon {
          background: var(--accent);
          color: #fff;
        }
        .social-text {
          min-width: 0;
          flex: 1 1 auto;
        }
        .social-label {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--fg2);
          margin-bottom: 2px;
        }
        .social-handle {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--fg);
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .social-arrow {
          margin-left: auto;
          color: var(--fg2);
          transition: color 0.2s, transform 0.2s;
          opacity: 0;
        }
        .social-card:hover .social-arrow {
          opacity: 1;
          color: var(--accent);
          transform: translateX(4px);
        }

        /* RIGHT FORM */
        .contact-form-wrap {
          animation: fadeUp 0.7s 0.25s both;
          min-width: 0;
        }

        .form-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(12px);
          box-shadow: var(--shadow);
          width: 100%;
          min-width: 0;
        }
        .form-card form { width: 100%; min-width: 0; }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          min-width: 0;
        }

        .field-group { margin-bottom: 20px; }
        .field-group.full { grid-column: 1 / -1; }

        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--fg2);
          margin-bottom: 8px;
        }
        .field-label .required { color: var(--accent); margin-left: 2px; }

        .field-input,
        .field-textarea {
          width: 100%;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 13px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          color: var(--fg);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          resize: none;
          min-width: 0;
        }
        .field-input::placeholder,
        .field-textarea::placeholder { color: var(--fg2); opacity: 0.5; }

        .field-input:focus,
        .field-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255,107,53,0.12);
        }

        .field-input.has-error,
        .field-textarea.has-error {
          border-color: var(--err);
          box-shadow: 0 0 0 3px rgba(229,62,62,0.10);
          animation: shake 0.35s ease;
        }

        .field-input.is-valid,
        .field-textarea.is-valid { border-color: var(--ok); }

        .field-error {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: var(--err);
          margin-top: 6px;
          animation: scaleIn 0.2s ease;
        }

        .textarea-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }
        .char-count {
          font-size: 0.72rem;
          color: var(--fg2);
          opacity: 0.6;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--accent);
          color: #fff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 16px 32px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(255,107,53,0.30);
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--accent2);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(255,107,53,0.40);
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Shimmer khi loading */
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.4s;
        }
        .submit-btn.loading::after {
          transform: translateX(100%);
          transition: transform 0.8s;
        }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* SUCCESS STATE */
        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 20px;
          gap: 16px;
          animation: scaleIn 0.4s ease;
        }
        .success-icon {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: rgba(56,161,105,0.12);
          display: flex; align-items: center; justify-content: center;
          animation: successPop 0.5s ease forwards;
        }
        .success-icon svg { color: var(--ok); }
        .success-icon svg path {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: drawCheck 0.5s 0.3s ease forwards;
        }
        .success-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--fg);
        }
        .success-sub {
          font-size: 0.9rem;
          color: var(--fg2);
          font-weight: 300;
          max-width: 260px;
          line-height: 1.6;
        }
        .success-back {
          margin-top: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--accent);
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* ERROR BANNER */
        .error-banner {
          background: rgba(229,62,62,0.08);
          border: 1px solid rgba(229,62,62,0.25);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.83rem;
          color: var(--err);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: scaleIn 0.2s ease;
        }
        .hp-field {
          position: absolute;
          left: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
          pointer-events: none;
        }

        /* RESPONSIVE */
        @media (max-width: 860px) {
          .contact-section { padding: 72px 24px; }
          .contact-inner { grid-template-columns: 1fr; gap: 48px; }
          .contact-sub { max-width: 100%; }
          .form-row { grid-template-columns: 1fr; }
          .form-card { padding: 28px 20px; }
        }

        @media (max-width: 560px) {
          .contact-section { padding: 64px 16px; }
          .contact-heading { line-height: 1.05; margin-bottom: 14px; }
          .contact-sub {
            font-size: 0.9rem;
            line-height: 1.7;
            margin-bottom: 32px;
          }
          .social-list { gap: 10px; }
          .social-card {
            padding: 14px 14px;
            border-radius: 14px;
            gap: 10px;
          }
          .social-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }
          .social-label { font-size: 0.68rem; }
          .social-handle {
            font-size: 0.8rem;
            overflow-wrap: anywhere;
          }
          .form-card {
            padding: 20px 14px;
            border-radius: 18px;
          }
          .field-input,
          .field-textarea {
            padding: 12px 13px;
            font-size: 16px;
          }
          .submit-btn {
            padding: 14px 24px;
            border-radius: 12px;
          }
        }

        @media (max-width: 420px) {
          .contact-section { padding: 56px 12px; }
          .contact-inner { gap: 36px; }
          .social-card {
            align-items: flex-start;
            padding: 12px;
          }
          .form-card {
            padding: 16px 12px;
            border-radius: 16px;
          }
          .social-arrow { display: none; }
          .field-label { font-size: 0.7rem; }
          .char-count { font-size: 0.68rem; }
        }
      `}</style>

      <section className="contact-section" id="contact">
        <div className="contact-inner">

          {/* LEFT INFO */}
          <div ref={infoRef} className="contact-info scroll-reveal-left">
            <div className="section-tag">Liên hệ</div>
            <h2 className="contact-heading">
              Kết nối<br />với <em>mình</em>
            </h2>
            <p className="contact-sub">
              Dù bạn muốn hỏi về calisthenics, hợp tác làm content,
              hay đơn giản là muốn chia sẻ hành trình tập luyện, mình luôn sẵn lòng.
            </p>

            <div className="social-list">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} className="social-card" target="_blank" rel="noreferrer">
                  <div className="social-icon">{s.icon}</div>
                  <div className="social-text">
                    <div className="social-label">{s.label}</div>
                    <div className="social-handle">{s.handle}</div>
                  </div>
                  <div className="social-arrow">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="contact-form-wrap">
            <div className="form-card">

              {status === "success" ? (
                <div className="success-state">
                  <div className="success-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="success-title">Gửi thành công!</div>
                  <p className="success-sub">
                    Mình đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất có thể.
                  </p>
                  <button
                    className="success-back"
                    onClick={() => {
                      setStatus("idle");
                      setSubmitMessage("");
                      formStartedAtRef.current = Date.now();
                    }}
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate>
                  <div className="hp-field" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      value={honeypot}
                      tabIndex={-1}
                      autoComplete="off"
                      onChange={(e) => setHoneypot(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {status === "error" && (
                    <div className="error-banner">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                      {submitMessage || "Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ qua email."}
                    </div>
                  )}

                  <div className="form-row">
                    {/* Name */}
                    <div className="field-group">
                      <label className="field-label" htmlFor="name">
                        Tên của bạn <span className="required">*</span>
                      </label>
                      <input
                        id="name" name="name" type="text"
                        className={`field-input${errors.name && touched.name ? " has-error" : touched.name && !errors.name ? " is-valid" : ""}`}
                        placeholder="Nguyễn Văn A"
                        value={fields.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isLoading}
                        autoComplete="name"
                      />
                      {errors.name && touched.name && (
                        <div className="field-error">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 2.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V4a.5.5 0 01.5-.5zm0 5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                          </svg>
                          {errors.name}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="field-group">
                      <label className="field-label" htmlFor="email">
                        Email <span className="required">*</span>
                      </label>
                      <input
                        id="email" name="email" type="email"
                        className={`field-input${errors.email && touched.email ? " has-error" : touched.email && !errors.email ? " is-valid" : ""}`}
                        placeholder="email@example.com"
                        value={fields.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isLoading}
                        autoComplete="email"
                      />
                      {errors.email && touched.email && (
                        <div className="field-error">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 2.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V4a.5.5 0 01.5-.5zm0 5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                          </svg>
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="field-group">
                    <label className="field-label" htmlFor="subject">Chủ đề</label>
                    <input
                      id="subject" name="subject" type="text"
                      className="field-input"
                      placeholder="Hợp tác, hỏi về calisthenics, ..."
                      value={fields.subject}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Message */}
                  <div className="field-group">
                    <label className="field-label" htmlFor="message">
                      Tin nhắn <span className="required">*</span>
                    </label>
                    <textarea
                      id="message" name="message" rows={5}
                      className={`field-textarea${errors.message && touched.message ? " has-error" : touched.message && !errors.message ? " is-valid" : ""}`}
                      placeholder="Xin chào Tâm, mình muốn hỏi về..."
                      value={fields.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isLoading}
                    />
                    <div className="textarea-footer">
                      {errors.message && touched.message ? (
                        <div className="field-error">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 2.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V4a.5.5 0 01.5-.5zm0 5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                          </svg>
                          {errors.message}
                        </div>
                      ) : <span />}
                      <span className="char-count">{charCount} ký tự</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className={`submit-btn${isLoading ? " loading" : ""}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        Gửi tin nhắn
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </>
                    )}
                  </button>

                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
