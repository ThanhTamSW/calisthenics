import { Helmet } from "react-helmet-async";

const SITE_URL = "https://thanhtamnguyen.id.vn";
const SITE_NAME = "Tâm Calisthenics";
const DEFAULT_TITLE = "Tâm Calisthenics | VĐV Street Workout & Calisthenics";
const DEFAULT_DESCRIPTION =
  "Nguyễn Thanh Tâm chia sẻ hành trình calisthenics thực chiến, giải đấu, kỹ năng và kế hoạch tập luyện bền vững.";
const DEFAULT_IMAGE = `${SITE_URL}/images/profile1-full.jpg`;
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nguyễn Thanh Tâm",
  alternateName: "Tâm Calisthenics",
  url: SITE_URL,
  image: DEFAULT_IMAGE,
  sameAs: [
    "https://tiktok.com/@tamcalisthenics",
    "https://www.facebook.com/profile.php?id=61576483281888&locale=vi_VN",
  ],
  jobTitle: "Calisthenics Athlete",
  description: DEFAULT_DESCRIPTION,
};

export default function SeoHead() {
  return (
    <Helmet prioritizeSeoTags>
      <title>{DEFAULT_TITLE}</title>
      <meta name="description" content={DEFAULT_DESCRIPTION} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Nguyễn Thanh Tâm" />
      <link rel="canonical" href={SITE_URL} />

      <meta property="og:locale" content="vi_VN" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={DEFAULT_TITLE} />
      <meta property="og:description" content={DEFAULT_DESCRIPTION} />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:image" content={DEFAULT_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={DEFAULT_TITLE} />
      <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      <script type="application/ld+json">{JSON.stringify(personSchema)}</script>

      {GA_MEASUREMENT_ID ? (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      ) : null}
      {GA_MEASUREMENT_ID ? (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
          `}
        </script>
      ) : null}
    </Helmet>
  );
}
