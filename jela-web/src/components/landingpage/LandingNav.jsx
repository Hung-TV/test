import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { resolveIsAdmin } from '../../utils/auth';
import {
  DashboardIcon,
  HomeIcon,
  DictionaryIcon,
  LogoutIcon,
  CrownIcon,
  BookOpenIcon
} from '../common/AppIcons';

/**
 * LandingNav — thanh điều hướng dùng chung cho Landing Page và các trang public.
 *
 * Props:
 *  - lang ('vi'|'en') — ngôn ngữ hiển thị. Không bắt buộc khi dùng standalone.
 *  - onToggleLang — callback đổi ngôn ngữ. Ẩn nút nếu không truyền.
 *  - copy — i18n object chứa nhãn. Sẽ dùng nhãn tiếng Việt mặc định nếu thiếu.
 */
export default function LandingNav({ lang, onToggleLang, copy = {} }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* Đóng dropdown khi click ra ngoài */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Đóng dropdown khi chuyển route */
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  /* Nhãn mặc định — tiếng Việt/Anh dựa trên prop lang, và có thể ghi đè bởi prop copy */
  const isEn = lang === 'en';
  const t = {
    nav: isEn ? 'Navigation' : 'Điều hướng',
    navLinks: isEn ? 'Main Links' : 'Liên kết chính',
    features: isEn ? 'Features' : 'Tính năng',
    paths: isEn ? 'Paths' : 'Lộ trình',
    community: isEn ? 'Community' : 'Cộng đồng',
    dictionary: isEn ? 'Dictionary' : 'Từ điển',
    switchLang: isEn ? 'Switch to Vietnamese' : 'Switch to English',
    signIn: isEn ? 'Sign In' : 'Đăng nhập',
    joinFree: isEn ? 'Join Free' : 'Tham gia miễn phí',
    enterApp: isEn ? 'Go to App' : 'Vào ứng dụng',
    backToHome: isEn ? 'Back to Home' : 'Trang chủ',
    signOut: isEn ? 'Sign Out' : 'Đăng xuất',
    adminRole: isEn ? 'Admin' : 'Quản trị viên',
    learnerRole: isEn ? 'Learner' : 'Học viên',
    backToLanding: isEn ? 'Back to landing page' : 'Về trang giới thiệu',
    ...copy,
  };

  const isAdmin    = resolveIsAdmin(user);
  const appHome    = isAdmin ? '/admin' : '/';
  const isInApp    = !location.pathname.startsWith('/landing') && location.pathname !== '/dictionary';
  const displayName = user?.fullName || user?.name || user?.email || 'User';
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <nav className="lp-nav" role="navigation" aria-label={t.nav}>
      <div className="lp-nav__inner">

        {/* ── Brand ─────────────────────────────────────────── */}
        <Link
          to={isAuthenticated ? appHome : '/landing'}
          className="lp-nav__brand"
          aria-label="JELA — Trang chủ"
        >
          JEL<span>A</span>
        </Link>

        {/* ── Nav links / Breadcrumb ─────────────────────────── */}
        {copy.features ? (
          /* LandingPage đầy đủ */
          <ul className="lp-nav__links" aria-label={t.navLinks}>
            <li><a href="#features">{t.features}</a></li>
            <li><a href="#paths">{t.paths}</a></li>
            <li><a href="#community">{t.community}</a></li>
            <li>
              <Link to="/dictionary" className="lp-nav__dict-link">
                {t.dictionary}
              </Link>
            </li>
          </ul>
        ) : (
          /* Standalone (ví dụ: /dictionary) — breadcrumb đơn giản */
          <nav className="lp-nav__breadcrumb" aria-label="Điều hướng phụ">
            <Link to="/landing" className="lp-nav__back-link">← {t.backToHome}</Link>
            <span className="lp-nav__breadcrumb-sep" aria-hidden="true">/</span>
            <span className="lp-nav__breadcrumb-current">{t.dictionary}</span>
          </nav>
        )}

        {/* ── Actions ───────────────────────────────────────── */}
        <div className="lp-nav__actions">

          {/* Nút đổi ngôn ngữ */}
          {onToggleLang && (
            <button
              type="button"
              className="lp-nav__lang-btn"
              onClick={onToggleLang}
              aria-label={t.switchLang}
              title={t.switchLang}
            >
              🌐 {lang === 'vi' ? 'EN' : 'VI'}
            </button>
          )}

          {isAuthenticated ? (
            /* ── User dropdown ── */
            <div className="lp-nav__user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="lp-nav__user-trigger"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-label={`Tài khoản ${displayName}`}
              >
                {/* Avatar */}
                <div className="lp-nav__avatar">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} />
                  ) : (
                    <span>{avatarLetter}</span>
                  )}
                </div>

                {/* Tên */}
                <span className="lp-nav__username">{displayName}</span>

                {/* Chevron */}
                <svg
                  className={`lp-nav__chevron ${dropdownOpen ? 'lp-nav__chevron--open' : ''}`}
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="lp-nav__dropdown" role="menu">
                  {/* Header thông tin user */}
                  <div className="lp-nav__dropdown-header">
                    <div className="lp-nav__dropdown-avatar">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={displayName} />
                      ) : (
                        <span>{avatarLetter}</span>
                      )}
                    </div>
                    <div>
                      <p className="lp-nav__dropdown-name">{displayName}</p>
                      <p className="lp-nav__dropdown-role">
                        {isAdmin ? (
                          <><CrownIcon size={12} style={{ display: 'inline', marginRight: '4px' }}/>{t.adminRole}</>
                        ) : (
                          <><BookOpenIcon size={12} style={{ display: 'inline', marginRight: '4px' }}/>{t.learnerRole}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="lp-nav__dropdown-divider" />

                  {/* Vào ứng dụng */}
                  <Link
                    to={appHome}
                    className="lp-nav__dropdown-item"
                    role="menuitem"
                  >
                    <span className="lp-nav__dropdown-icon"><DashboardIcon size={16} /></span>
                    {t.enterApp}
                  </Link>

                  {/* Về trang Landing (nếu đang ở trong app) */}
                  {isInApp && (
                    <Link
                      to="/landing"
                      className="lp-nav__dropdown-item"
                      role="menuitem"
                    >
                      <span className="lp-nav__dropdown-icon"><HomeIcon size={16} /></span>
                      {t.backToLanding}
                    </Link>
                  )}

                  {/* Từ điển */}
                  <Link
                    to="/dictionary"
                    className="lp-nav__dropdown-item"
                    role="menuitem"
                  >
                    <span className="lp-nav__dropdown-icon"><DictionaryIcon size={16} /></span>
                    {t.dictionary}
                  </Link>

                  <div className="lp-nav__dropdown-divider" />

                  {/* Đăng xuất */}
                  <button
                    type="button"
                    className="lp-nav__dropdown-item lp-nav__dropdown-item--danger"
                    role="menuitem"
                    onClick={() => { setDropdownOpen(false); logout(); }}
                  >
                    <span className="lp-nav__dropdown-icon"><LogoutIcon size={16} /></span>
                    {t.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Chưa đăng nhập */
            <>
              <Link to="/login"  className="lp-btn-outline">{t.signIn}</Link>
              <Link to="/signup" className="lp-btn-primary">{t.joinFree}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
