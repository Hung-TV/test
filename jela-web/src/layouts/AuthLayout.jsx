import { Link, Outlet, useLocation } from "react-router-dom";
import screenImage from "../assets/images/screen.png";
import { AUTH_ASSETS } from "../components/auth/authAssets";
import { useAppPreferences } from "../hooks/useAppPreferences";
import "../styles/auth.css";

export default function AuthLayout() {
  const location = useLocation();
  const { language, setLanguage } = useAppPreferences();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <div className="login-page">
      <div className="login-illustration-panel">
        <header className="login-brand">
          <div className="login-brand-icon">
            {AUTH_ASSETS.logoIcon ? (
              <img src={AUTH_ASSETS.logoIcon} alt="JELA logo" />
            ) : (
              <span className="login-brand-icon-fallback">あa</span>
            )}
          </div>
          <div className="login-brand-text">
            <span className="login-brand-name">JELA</span>
            <span className="login-brand-tagline">
              {language === 'vi' ? 'Học tiếng Nhật' : 'Learn Japanese'}
            </span>
          </div>
        </header>

        <div className="login-illustration">
          <img src={screenImage} alt="Japanese landscape illustration" />
        </div>
      </div>

      <div className="login-form-panel">
        {/* Thanh tác vụ trên cùng (Đổi ngôn ngữ + Về trang chủ) để cải thiện UX và đồng bộ */}
        <div className="auth-top-actions">
          <button
            type="button"
            className="auth-lang-btn"
            onClick={toggleLanguage}
            aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            🌐 {language === 'vi' ? 'EN' : 'VI'}
          </button>
          
          <Link to="/landing" className="auth-back-home" aria-label={language === 'vi' ? 'Về trang chủ' : 'Back to home'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{language === 'vi' ? 'Trang chủ' : 'Home'}</span>
          </Link>
        </div>

        <div
          key={location.pathname}
          className="login-form-container auth-form-enter"
        >
          <Outlet />
        </div>

        <div className="login-watermark" aria-hidden="true">
          日本語
        </div>
      </div>
    </div>
  );
}
