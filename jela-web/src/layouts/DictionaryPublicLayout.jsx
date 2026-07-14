import LandingNav from '../components/landingpage/LandingNav';
import '../components/landingpage/landing.css';

/**
 * DictionaryPublicLayout — layout cho trang Từ điển truy cập public (/dictionary).
 *
 * Layout này chỉ dành cho guest. DictionaryRoute dùng MainLayout cho tài khoản
 * đã đăng nhập để nội dung luôn nằm cạnh sidebar của app học viên.
 */
export default function DictionaryPublicLayout({ children }) {
  return (
    /* Bọc trong class lp để kế thừa CSS tokens (màu, font) từ landing.css */
    <div className="lp dict-public-shell">
      <LandingNav />

      {/* Wrapper nội dung: có padding và max-width để không bị quá sát màn hình */}
      <div className="dict-public-content">
        {children}
      </div>
    </div>
  );
}
