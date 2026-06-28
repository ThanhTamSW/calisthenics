import { useState, useRef } from "react";
import useScrollReveal from "../hooks/useScrollReveal";
import "./ContactForm.css";
import { useLang } from "../contexts/LanguageContext";

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
  {
    label: "Zalo",
    handle: "0869797491",
    href: "https://zalo.me/0869797491",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.25 10.75c0-4.28-4.14-7.75-9.25-7.75S1.75 6.47 1.75 10.75c0 3.42 2.64 6.34 6.36 7.37-.3.94-1.12 3-1.18 3.19-.07.21.05.24.18.15.11-.07 3.63-2.4 5.16-3.46.25.02.5.03.76.03 5.11 0 9.22-3.47 9.22-7.28z"/>
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
function validate(fields, t) {
  const errors = {};
  if (!fields.name.trim()) errors.name = t("contact_err_name_req");
  if (!fields.email.trim()) errors.email = t("contact_err_email_req");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = t("contact_err_email_invalid");
  if (!fields.message.trim()) errors.message = t("contact_err_msg_req");
  else if (fields.message.trim().length < 10)
    errors.message = t("contact_err_msg_len");
  return errors;
}

export default function ContactForm() {
  const { t } = useLang();
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
      const errs = validate({ ...fields, [name]: value }, t);
      setErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const errs = validate(fields, t);
    setErrors((prev) => ({ ...prev, [name]: errs[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, message: true };
    setTouched(allTouched);
    setSubmitMessage("");
    const errs = validate(fields, t);
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
        throw new Error(details || payload?.message || t("contact_err_generic"));
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
          ? t("contact_err_timeout")
          : error?.message || t("contact_error_default");
      setSubmitMessage(message);
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const isLoading = status === "loading";

  return (
    <>

      <section className="contact-section" id="contact">
        <div className="contact-inner">

          {/* LEFT INFO */}
          <div ref={infoRef} className="contact-info scroll-reveal-left">
            <div className="section-tag">{t("contact_tag")}</div>
            <h2 className="contact-heading">
              {t("contact_heading_1")}<br /><em>{t("contact_heading_em")}</em>
            </h2>
            <p className="contact-sub">
              {t("contact_desc")}
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
                  <div className="success-title">{t("contact_success_title")}</div>
                  <p className="success-sub">
                    {t("contact_success_desc")}
                  </p>
                  <button
                    className="success-back"
                    onClick={() => {
                      setStatus("idle");
                      setSubmitMessage("");
                      formStartedAtRef.current = Date.now();
                    }}
                  >
                    {t("contact_send_another")}
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
                      {submitMessage || t("contact_error_default")}
                    </div>
                  )}

                  <div className="form-row">
                    {/* Name */}
                    <div className="field-group">
                      <label className="field-label" htmlFor="name">
                        {t("contact_name_label")} <span className="required">*</span>
                      </label>
                      <input
                        id="name" name="name" type="text"
                        className={`field-input${errors.name && touched.name ? " has-error" : touched.name && !errors.name ? " is-valid" : ""}`}
                        placeholder={t("contact_name_placeholder")}
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
                        {t("contact_email_label")} <span className="required">*</span>
                      </label>
                      <input
                        id="email" name="email" type="email"
                        className={`field-input${errors.email && touched.email ? " has-error" : touched.email && !errors.email ? " is-valid" : ""}`}
                        placeholder={t("contact_email_placeholder")}
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
                    <label className="field-label" htmlFor="subject">{t("contact_subject_label")}</label>
                    <input
                      id="subject" name="subject" type="text"
                      className="field-input"
                      placeholder={t("contact_subject_placeholder")}
                      value={fields.subject}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Message */}
                  <div className="field-group">
                    <label className="field-label" htmlFor="message">
                      {t("contact_message_label")} <span className="required">*</span>
                    </label>
                    <textarea
                      id="message" name="message" rows={5}
                      className={`field-textarea${errors.message && touched.message ? " has-error" : touched.message && !errors.message ? " is-valid" : ""}`}
                      placeholder={t("contact_message_placeholder")}
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
                      <span className="char-count">{charCount} {t("contact_char_count")}</span>
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
                        {t("contact_sending")}
                      </>
                    ) : (
                      <>
                        {t("contact_send")}
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
