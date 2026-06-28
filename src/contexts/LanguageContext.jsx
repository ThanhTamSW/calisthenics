import { createContext, useCallback, useContext, useMemo, useState } from "react";

// ============================================================
// LANGUAGE CONTEXT — hỗ trợ Tiếng Việt & English
// ============================================================

const TRANSLATIONS = {
  vi: {
    // Header
    nav_about: "Về mình",
    nav_journey: "Hành trình",
    nav_contact: "Liên hệ",
    cta_contact: "Liên hệ",

    // Hero
    hero_greeting: "Xin chào, mình là",
    hero_subtitle: "Calisthenics athlete · Content creator",
    hero_tag: "CALISTHENICS - HÀNH TRÌNH - KỶ LUẬT",
    hero_h1_1: "Strength.",
    hero_h1_2: "Balance.",
    hero_h1_3: "Discipline",
    hero_desc: "Mình là Thanh Tâm. Calisthenics với mình là một hành trình dài từ những bài tập cơ bản đến những trận battle thực chiến. Mình ở đây để chia sẻ lại quá trình đó một cách chân thật và mộc mạc nhất — không màu mè, chỉ có mồ hôi và nỗ lực tiến lên mỗi ngày.",
    hero_cta_journey: "Xem hành trình",
    hero_cta_connect: "Kết nối với mình",
    hero_stat_1_num: "Top 1",
    hero_stat_1_label: "Premium Battle I",
    hero_stat_2_num: "5+",
    hero_stat_2_unit: "năm",
    hero_stat_2_label: "Tập luyện",
    hero_stat_3_num: "7+",
    hero_stat_3_unit: "giải",
    hero_stat_3_label: "Đã tham gia",
    hero_follow: "Theo dõi mình",
    hero_add_image: "Thêm ảnh của bạn vào đây",
    hero_badge: "Never Give Up",

    // About
    about_tag: "Về mình",
    about_heading_1: "Kiên trì mỗi ngày,",
    about_heading_2: "tiến bộ",
    about_heading_em: "mỗi ngày",
    about_bio_1: "Mình là <strong>Nguyễn Thanh Tâm</strong>, gắn bó với calisthenics từ năm <strong>2020</strong>.",
    about_bio_2: "Quá trình tập luyện của mình đi từ các bài nền tảng như pull-up, dips, core đến các kỹ năng nâng cao như muscle up, front lever và planche.",
    about_bio_3: "Mình chia sẻ hành trình trên TikTok & Facebook dưới thương hiệu <strong>Tâm Calisthenics</strong>. Mình tin rằng <strong>kỷ luật và nhất quán</strong> là điều tạo ra khác biệt thật sự.",
    about_interest_1: "Calisthenics",
    about_interest_2: "Street Workout",
    about_interest_3: "Skills Training",
    about_interest_4: "Cardio",
    about_interest_5: "Dinh dưỡng",
    about_interest_6: "Chia sẻ hành trình",
    about_card_1_num: "Top 1",
    about_card_1_label: "Premium Battle I",
    about_card_2_num: "5+",
    about_card_2_label: "Năm tập luyện",
    about_card_3_num: "7+",
    about_card_3_label: "Giải đấu tham gia",
    about_tab_journey: "Hành trình",
    about_image_alt: "Ảnh",

    // Contact
    contact_tag: "Liên hệ",
    contact_heading_1: "Kết nối",
    contact_heading_em: "với mình",
    contact_desc: "Dù bạn muốn hỏi về calisthenics, hợp tác làm content, hay đơn giản là muốn chia sẻ hành trình tập luyện, mình luôn sẵn lòng.",
    contact_name_label: "Tên của bạn",
    contact_email_label: "Email",
    contact_subject_label: "Chủ đề",
    contact_message_label: "Tin nhắn",
    contact_name_placeholder: "Nguyễn Văn A",
    contact_email_placeholder: "email@example.com",
    contact_subject_placeholder: "Hợp tác, hỏi về calisthenics, ...",
    contact_message_placeholder: "Xin chào, mình muốn hỏi về...",
    contact_send: "Gửi tin nhắn",
    contact_sending: "Đang gửi...",
    contact_success_title: "Gửi thành công!",
    contact_success_desc: "Mình đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất có thể.",
    contact_send_another: "Gửi tin nhắn khác",
    contact_error_default: "Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ qua email.",
    contact_err_name_req: "Bạn chưa nhập tên",
    contact_err_email_req: "Bạn chưa nhập email",
    contact_err_email_invalid: "Email chưa đúng định dạng",
    contact_err_msg_req: "Bạn chưa nhập tin nhắn",
    contact_err_msg_len: "Tin nhắn cần ít nhất 10 ký tự",
    contact_err_timeout: "Hệ thống phản hồi chậm. Vui lòng thử lại sau ít phút.",
    contact_err_generic: "Có lỗi xảy ra. Vui lòng thử lại.",
    contact_char_count: "ký tự",

    // Portfolio
    portfolio_tag: "Thành tích",
    portfolio_heading_1: "Hành trình",
    portfolio_heading_em: "thi đấu",
    portfolio_filter_all: "Tất cả",

    // Footer
    footer_tagline_1: "Calisthenics athlete.",
    footer_tagline_2: "Chia sẻ hành trình thật — không filter.",
    footer_nav_title: "Trang",
    footer_social_title: "Theo dõi",
    footer_copy_1: "Tâm Calisthenics",
    footer_copy_2: "Làm với",
    footer_copy_3: "và",
    footer_back_to_top: "Lên đầu trang",

    // Language toggle
    lang_toggle: "EN",
    lang_current: "Tiếng Việt",
  },

  en: {
    // Header
    nav_about: "About",
    nav_journey: "Journey",
    nav_contact: "Contact",
    cta_contact: "Contact",

    // Hero
    hero_greeting: "Hi, I'm",
    hero_subtitle: "Calisthenics athlete · Content creator",
    hero_tag: "CALISTHENICS - JOURNEY - DISCIPLINE",
    hero_h1_1: "Strength.",
    hero_h1_2: "Balance.",
    hero_h1_3: "Discipline",
    hero_desc: "I'm Thanh Tam. My calisthenics journey spans from the very basics to intense competitive battles. I'm here to share that process in the most raw and authentic way — no fluff, just sweat and the relentless effort to level up every day.",
    hero_cta_journey: "My Journey",
    hero_cta_connect: "Connect with me",
    hero_stat_1_num: "Top 1",
    hero_stat_1_label: "Premium Battle I",
    hero_stat_2_num: "5+",
    hero_stat_2_unit: "years",
    hero_stat_2_label: "Training",
    hero_stat_3_num: "7+",
    hero_stat_3_unit: "events",
    hero_stat_3_label: "Joined",
    hero_follow: "Follow me",
    hero_add_image: "Add your image here",
    hero_badge: "Never Give Up",

    // About
    about_tag: "About me",
    about_heading_1: "Consistent every day,",
    about_heading_2: "progressing",
    about_heading_em: "every day",
    about_bio_1: "I'm <strong>Nguyen Thanh Tam</strong>, dedicated to calisthenics since <strong>2020</strong>.",
    about_bio_2: "My training journey started from fundamentals like pull-ups, dips, and core, advancing to skills like muscle-ups, front lever, and planche.",
    about_bio_3: "I share my journey on TikTok & Facebook under the brand <strong>Tâm Calisthenics</strong>. I believe <strong>discipline and consistency</strong> are what truly make the difference.",
    about_interest_1: "Calisthenics",
    about_interest_2: "Street Workout",
    about_interest_3: "Skills Training",
    about_interest_4: "Cardio",
    about_interest_5: "Nutrition",
    about_interest_6: "Sharing Journey",
    about_card_1_num: "Top 1",
    about_card_1_label: "Premium Battle I",
    about_card_2_num: "5+",
    about_card_2_label: "Years of training",
    about_card_3_num: "7+",
    about_card_3_label: "Competitions joined",
    about_tab_journey: "Journey",
    about_image_alt: "Image",

    // Contact
    contact_tag: "Contact",
    contact_heading_1: "Connect",
    contact_heading_em: "with me",
    contact_desc: "Whether you want to ask about calisthenics, collaborate on content, or simply share your training journey, I'm always open to connecting.",
    contact_name_label: "Your name",
    contact_email_label: "Email",
    contact_subject_label: "Subject",
    contact_message_label: "Message",
    contact_name_placeholder: "John Doe",
    contact_email_placeholder: "email@example.com",
    contact_subject_placeholder: "Collaboration, Q&A, ...",
    contact_message_placeholder: "Hi, I would like to ask about...",
    contact_send: "Send message",
    contact_sending: "Sending...",
    contact_success_title: "Message sent!",
    contact_success_desc: "I have received your message and will reply as soon as possible.",
    contact_send_another: "Send another message",
    contact_error_default: "An error occurred. Please try again or contact me via email.",
    contact_err_name_req: "Please enter your name",
    contact_err_email_req: "Please enter your email",
    contact_err_email_invalid: "Invalid email format",
    contact_err_msg_req: "Please enter your message",
    contact_err_msg_len: "Message must be at least 10 characters long",
    contact_err_timeout: "System is responding slowly. Please try again in a few minutes.",
    contact_err_generic: "An error occurred. Please try again.",
    contact_char_count: "chars",

    // Portfolio
    portfolio_tag: "Achievements",
    portfolio_heading_1: "Competition",
    portfolio_heading_em: "journey",
    portfolio_filter_all: "All",

    // Footer
    footer_tagline_1: "Calisthenics athlete.",
    footer_tagline_2: "Sharing the real journey — no filters.",
    footer_nav_title: "Pages",
    footer_social_title: "Follow",
    footer_copy_1: "Tâm Calisthenics",
    footer_copy_2: "Made with",
    footer_copy_3: "and",
    footer_back_to_top: "Back to top",

    // Language toggle
    lang_toggle: "VI",
    lang_current: "English",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem("lang");
      return saved === "en" ? "en" : "vi";
    } catch {
      return "vi";
    }
  });

  const toggleLang = useCallback(() => {
    setLang((current) => {
      const next = current === "vi" ? "en" : "vi";
      try {
        localStorage.setItem("lang", next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.vi[key] ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, toggleLang, t }), [lang, toggleLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLang must be used within LanguageProvider");
  return context;
}
