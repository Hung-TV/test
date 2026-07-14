import LandingNav    from '../components/landingpage/LandingNav';
import { useAppPreferences } from '../hooks/useAppPreferences';
import HeroSection   from '../components/landingpage/HeroSection';
import StatsBar      from '../components/landingpage/StatsBar';
import FeaturesSection from '../components/landingpage/FeaturesSection';
import PathsSection  from '../components/landingpage/PathsSection';
import CtaSection    from '../components/landingpage/CtaSection';
import Footer        from '../components/common/Footer';
import '../components/landingpage/landing.css';

/* ── Bản dịch ─────────────────────────────────────────────── */
const COPY = {
  vi: {
    /* Nav */
    nav: 'Điều hướng Landing',
    navLinks: 'Liên kết chính',
    features: 'Tính năng',
    paths: 'Lộ trình',
    community: 'Cộng đồng',
    dictionary: 'Từ điển',
    switchLang: 'Switch to English',
    signIn: 'Đăng nhập',
    joinFree: 'Tham gia miễn phí',

    /* Hero */
    eyebrow: 'NỀN TẢNG HỌC TIẾNG NHẬT SỐ 1',
    h1Part1: 'Chinh phục tiếng Nhật,',
    h1Accent: 'từng nét bút',
    h1Part2: 'một.',
    sub: 'Từ N5 đến N1 — lộ trình rõ ràng, học Kanji bằng nhận diện nét bút, theo dõi chuỗi học tập và chinh phục JLPT với sự tự tin.',
    ctaPrimary: 'Bắt đầu học miễn phí',
    ctaSecondary: 'Xem tính năng',

    /* Stats */
    students: 'học viên đăng ký',
    kanji: 'Kanji trong thư viện',
    levels: 'cấp độ JLPT',
    satisfaction: 'hài lòng',

    /* Features */
    featureTag: 'TÍNH NĂNG',
    featureTitle: 'Tập trung vào điều quan trọng',
    featureSub: 'Học thông minh hơn với bộ công cụ được thiết kế riêng cho người học tiếng Nhật hiện đại.',
    f1Title: 'Từ điển thông minh',
    f1Desc: 'Nhận diện nét bút mạnh mẽ, tra bất kỳ ký tự nào và xem ngay số nét, nghĩa, cách đọc phổ biến.',
    f2Title: 'Lộ trình có thưởng',
    f2Desc: 'Duy trì chuỗi ngày học, leo bảng xếp hạng và nhận huy hiệu khi chinh phục từng cột mốc ngữ pháp.',
    f3Title: 'Tập trung vào JLPT',
    f3Desc: 'Nội dung được phân loại theo N5–N1. Luyện đề mẫu và bài tập bám sát cấu trúc đề thi thật.',
    f4Title: 'Luyện viết Kanji',
    f4Desc: 'Vẽ chữ Kanji ngay trên màn hình và nhận phân tích nét bút tức thì để cải thiện độ chính xác.',
    f5Title: 'Theo dõi tiến độ',
    f5Desc: 'Biểu đồ trực quan hiển thị số Kanji đã học, tỷ lệ nhớ và thời gian học mỗi ngày.',
    f6Title: 'Bộ thẻ Flashcard',
    f6Desc: 'Tạo bộ thẻ cá nhân, lật thẻ học từ vựng theo phương pháp lặp lại ngắt quãng (SRS).',

    /* Paths */
    pathTag: 'LỘ TRÌNH HỌC',
    pathTitle: 'Chọn hành trình của bạn',
    pathSub: 'Từ những nét hiragana đầu tiên đến đọc hiểu văn bản phức tạp — chúng tôi vạch rõ từng bước.',
    p1Title: 'Nền tảng N5 – N4',
    p1Desc: 'Nắm vững Hiragana, Katakana và 300 Kanji thiết yếu trong cuộc sống hàng ngày.',
    p2Title: 'Trung cấp N3 – N2',
    p2Desc: 'Mở rộng lên 1.000+ Kanji, cấu trúc ngữ pháp nâng cao và đọc hiểu báo chí.',
    p3Title: 'Cao cấp N1',
    p3Desc: 'Làm chủ tiếng Nhật tự nhiên, thành ngữ và văn bản học thuật ở cấp độ bản ngữ.',
    viewPath: 'Xem lộ trình',

    /* CTA */
    ctaSectionTitle: 'Bắt đầu hành trình Nhật ngữ ngay hôm nay',
    ctaSectionSub: 'Hơn 50.000 học viên đang chinh phục tiếng Nhật cùng phương pháp học tập dựa trên nét bút độc đáo của JELA.',
    ctaSectionPrimary: 'Bắt đầu miễn phí',
    ctaSectionSecondary: 'Xem các lộ trình',

    /* Footer */
    brandDesc: 'Japanese Education & Learning App — Đưa tiếng Nhật đến gần hơn với mọi người.',
    company: 'Công ty',
    support: 'Hỗ trợ',
    product: 'Sản phẩm',
    aboutUs: 'Về chúng tôi',
    careers: 'Tuyển dụng',
    press: 'Báo chí',
    blog: 'Blog',
    helpCenter: 'Trung tâm trợ giúp',
    privacy: 'Chính sách riêng tư',
    terms: 'Điều khoản dịch vụ',
    contact: 'Liên hệ',
    dictionary: 'Từ điển',
    kanjiLib: 'Thư viện Kanji',
    flashcards: 'Flashcard',
    roadmap: 'Lộ trình học',
    copyright: '© 2025 JELA — Japanese Education & Learning App. Bảo lưu mọi quyền.',
  },

  en: {
    /* Nav */
    nav: 'Landing navigation',
    navLinks: 'Main links',
    features: 'Features',
    paths: 'Learning Paths',
    community: 'Community',
    dictionary: 'Dictionary',
    switchLang: 'Chuyển sang tiếng Việt',
    signIn: 'Sign In',
    joinFree: 'Join Free',

    /* Hero */
    eyebrow: '#1 JAPANESE LEARNING PLATFORM',
    h1Part1: 'Master Japanese,',
    h1Accent: 'One Stroke',
    h1Part2: 'at a Time.',
    sub: 'From N5 to N1 — a clear roadmap, stroke-recognition Kanji, daily streak tracking, and the confidence to pass JLPT.',
    ctaPrimary: 'Start Learning for Free',
    ctaSecondary: 'Watch Preview',

    /* Stats */
    students: 'enrolled students',
    kanji: 'Kanji in library',
    levels: 'JLPT levels',
    satisfaction: 'satisfaction rate',

    /* Features */
    featureTag: 'FEATURES',
    featureTitle: 'Focus on What Matters',
    featureSub: 'Study smarter with a toolset built specifically for modern Japanese learners.',
    f1Title: 'Smart Dictionary',
    f1Desc: 'Powerful stroke recognition — draw any character and instantly get stroke count, meanings, and readings.',
    f2Title: 'Gamified Roadmap',
    f2Desc: 'Maintain your streak, climb the leaderboard, and earn badges as you master new grammar and vocabulary.',
    f3Title: 'JLPT Focused',
    f3Desc: 'Content organized by N5–N1. Practice exams and targeted drills mirror the real test format.',
    f4Title: 'Kanji Writing Practice',
    f4Desc: 'Draw Kanji directly on screen and receive instant stroke analysis to improve your accuracy.',
    f5Title: 'Progress Analytics',
    f5Desc: 'Visual charts show Kanji learned, retention rate, and daily study time at a glance.',
    f6Title: 'Flashcard Decks',
    f6Desc: 'Build personal decks and review vocabulary with spaced repetition (SRS) for long-term retention.',

    /* Paths */
    pathTag: 'LEARNING PATHS',
    pathTitle: 'Choose Your Path',
    pathSub: 'From your first Hiragana stroke to complex news articles — every step is mapped.',
    p1Title: 'N5 – N4 Foundation',
    p1Desc: 'Master Hiragana, Katakana, and the first 300 essential Kanji for daily life.',
    p2Title: 'N3 – N2 Intermediate',
    p2Desc: 'Expand to 1,000+ Kanji, advanced grammar structures, and newspaper reading.',
    p3Title: 'N1 Advanced',
    p3Desc: 'Achieve native-level fluency, idioms, and academic-level text comprehension.',
    viewPath: 'View Path',

    /* CTA */
    ctaSectionTitle: 'Start Your Japanese Journey Today',
    ctaSectionSub: 'Join 50,000+ students mastering Japanese through JELA\'s unique stroke-based learning method.',
    ctaSectionPrimary: 'Get Started Free',
    ctaSectionSecondary: 'Compare Plans',

    /* Footer */
    brandDesc: 'Japanese Education & Learning App — Making Japanese accessible to everyone.',
    company: 'Company',
    support: 'Support',
    product: 'Product',
    aboutUs: 'About Us',
    careers: 'Careers',
    press: 'Press',
    blog: 'Blog',
    helpCenter: 'Help Center',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact',
    dictionary: 'Dictionary',
    kanjiLib: 'Kanji Library',
    flashcards: 'Flashcards',
    roadmap: 'Learning Roadmap',
    copyright: '© 2025 JELA — Japanese Education & Learning App. All rights reserved.',
  },
};

/* ── Page ─────────────────────────────────────────────────── */
export default function LandingPage() {
  const { language, setLanguage } = useAppPreferences();
  const copy = COPY[language];

  const toggleLang = () => setLanguage(language === 'vi' ? 'en' : 'vi');

  return (
    <div className="lp">
      <LandingNav lang={language} onToggleLang={toggleLang} copy={copy} />

      <HeroSection copy={{
        eyebrow: copy.eyebrow,
        h1Part1: copy.h1Part1,
        h1Accent: copy.h1Accent,
        h1Part2: copy.h1Part2,
        sub: copy.sub,
        ctaPrimary: copy.ctaPrimary,
        ctaSecondary: copy.ctaSecondary,
      }} />

      <StatsBar copy={{
        students: copy.students,
        kanji: copy.kanji,
        levels: copy.levels,
        satisfaction: copy.satisfaction,
      }} />

      <FeaturesSection copy={{
        tag: copy.featureTag,
        title: copy.featureTitle,
        sub: copy.featureSub,
        f1Title: copy.f1Title, f1Desc: copy.f1Desc,
        f2Title: copy.f2Title, f2Desc: copy.f2Desc,
        f3Title: copy.f3Title, f3Desc: copy.f3Desc,
        f4Title: copy.f4Title, f4Desc: copy.f4Desc,
        f5Title: copy.f5Title, f5Desc: copy.f5Desc,
        f6Title: copy.f6Title, f6Desc: copy.f6Desc,
      }} />

      <PathsSection copy={{
        tag: copy.pathTag,
        title: copy.pathTitle,
        sub: copy.pathSub,
        p1Title: copy.p1Title, p1Desc: copy.p1Desc,
        p2Title: copy.p2Title, p2Desc: copy.p2Desc,
        p3Title: copy.p3Title, p3Desc: copy.p3Desc,
        viewPath: copy.viewPath,
      }} />

      <CtaSection copy={{
        title: copy.ctaSectionTitle,
        sub: copy.ctaSectionSub,
        ctaPrimary: copy.ctaSectionPrimary,
        ctaSecondary: copy.ctaSectionSecondary,
      }} />

      <Footer copy={copy} />
    </div>
  );
}
