import { useState, useEffect } from "react";
import "./FloatingContact.css";

export default function FloatingContact() {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Hiện tin nhắn sau khi trang tải 2 giây
    const showTimer = setTimeout(() => setShowMessage(true), 2000);
    // Tự động ẩn tin nhắn sau 15 giây
    const hideTimer = setTimeout(() => setShowMessage(false), 15000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="floating-contact-wrapper">
      {/* Khung chat chào hỏi */}
      <div className={`floating-welcome-msg ${showMessage ? "show" : ""}`}>
        <button className="close-msg-btn" onClick={() => setShowMessage(false)}>✕</button>
        <div className="msg-content">
          <strong>Xin chào! 👋</strong>
          <p>Bạn cần tư vấn lộ trình tập luyện hay hợp tác? Nhắn Tâm ngay nhé!</p>
        </div>
      </div>
      <a
        href="https://www.tiktok.com/@tamcalisthenics"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn tiktok shake-anim"
        style={{ animationDelay: "0s" }}
        aria-label="Tiktok"
      >
        <span className="msg-badge">1</span>
        <svg viewBox="0 0 448 512" fill="currentColor" width="24" height="24">
          <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
        </svg>
        <span className="floating-tooltip">TikTok</span>
      </a>

      <a
        href="https://zalo.me/0900000000"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn zalo shake-anim"
        style={{ animationDelay: "1.5s" }}
        aria-label="Zalo"
      >
        <span className="msg-badge">2</span>
        <span style={{ fontWeight: 800, fontSize: "14px", fontStyle: "italic" }}>Zalo</span>
        <span className="floating-tooltip">Chat Zalo</span>
      </a>

      <a
        href="https://www.facebook.com/profile.php?id=61576483281888"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn facebook shake-anim"
        style={{ animationDelay: "0.5s" }}
        aria-label="Facebook"
      >
        <span className="msg-badge">1</span>
        <svg viewBox="0 0 320 512" fill="currentColor" width="24" height="24">
          <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
        </svg>
        <span className="floating-tooltip">Facebook</span>
      </a>

      <a
        href="#contact"
        className="floating-btn mail shake-anim"
        style={{ animationDelay: "1s" }}
        aria-label="Liên hệ"
      >
        <span className="msg-badge">1</span>
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
        <span className="floating-tooltip">Gửi Email</span>
      </a>
    </div>
  );
}
