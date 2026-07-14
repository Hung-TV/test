import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { JLPT_LEVEL_LABELS } from '../../constants/authConstants';
import { SHARED_APP_TRANSLATIONS } from '../../constants/settingsConstants';
import { useAppPreferences } from '../../hooks/useAppPreferences';
import { resolveIsAdmin } from '../../utils/auth';
import {
  BookOpenIcon,
  ChartIcon,
  ChevronDownIcon,
  DashboardIcon,
  FlameIcon,
  LogoutIcon,
  MenuIcon,
  ProfileIcon,
  SettingsIcon,
} from './AppIcons';

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function Header({ onOpenMenu }) {
  const { user, logout } = useAuth();
  const { language } = useAppPreferences();
  const copy = SHARED_APP_TRANSLATIONS[language] || SHARED_APP_TRANSLATIONS.vi;
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const displayName = user?.fullName || user?.name || user?.email || copy.learner;
  const rawLevel = user?.level || user?.jlptLevel || 'BEGINNER';
  const level = JLPT_LEVEL_LABELS[rawLevel] || rawLevel;
  const avatarUrl = user?.avatarUrl || user?.avatar;
  // Kiểm tra quyền admin chỉ để quyết định menu UX. AdminRoute và backend
  // vẫn là lớp bảo vệ quyền truy cập thật cho khu vực quản trị.
  const isAdmin = resolveIsAdmin(user);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    logout();
    toast.success(copy.signedOut);
  };

  return (
    <header className="app-header">
      <button
        type="button"
        className="app-header__menu"
        aria-label="Mở menu"
        onClick={onOpenMenu}
      >
        <MenuIcon size={22} />
      </button>

      <strong className="app-header__title">JELA</strong>

      <div className="app-header__actions">
        <div className="streak-pill" title="Chuỗi học tập hiện tại">
          <FlameIcon size={17} />
          <span>{user?.streakCount || 0}</span>
        </div>

        <div className="app-user" ref={accountMenuRef}>
          {/* Tên và avatar là một nút thống nhất để vùng bấm rõ ràng trên cả desktop/mobile. */}
          <button
            type="button"
            className="app-user__trigger"
            aria-label="Mở menu tài khoản"
            aria-haspopup="menu"
            aria-expanded={isAccountMenuOpen}
            onClick={() => setIsAccountMenuOpen((current) => !current)}
          >
            <span className="app-user__copy">
              <strong>{displayName}</strong>
              <span>{/* {copy.level.toUpperCase()} 12 · */}{level}</span>
            </span>

            <span className="app-user__avatar" aria-hidden="true">
              {avatarUrl ? <img src={avatarUrl} alt="" /> : getInitials(displayName)}
            </span>

            <ChevronDownIcon
              size={16}
              className={`app-user__chevron${isAccountMenuOpen ? ' app-user__chevron--open' : ''}`}
            />
          </button>

          {isAccountMenuOpen && (
            <div className="account-menu" role="menu">
              <div className="account-menu__header">
                <strong>{displayName}</strong>
                <span>{user?.email || `Trình độ ${level}`}</span>
              </div>

              <div className="account-menu__divider" />

              <Link
                to="/profile"
                role="menuitem"
                className="account-menu__item"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                <ProfileIcon size={18} />
                <span>{copy.profile}</span>
              </Link>

              {isAdmin ? (
                <>
                  {/* Cả hai role đều có thể quay về Landing Page giới thiệu. */}
                  <Link
                    to="/landing"
                    role="menuitem"
                    className="account-menu__item"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <DashboardIcon size={18} />
                    <span>{copy.landingTitle}</span>
                  </Link>

                  {/* Menu riêng cho admin: quay về flow học viên để kiểm tra. */}
                  <Link
                    to="/"
                    role="menuitem"
                    className="account-menu__item"
                    // Điều hướng về trang học viên và đóng dropdown.
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <BookOpenIcon size={18} />
                    <span>{copy.studentSpace}</span>
                  </Link>

                  {/* Menu riêng cho admin: vào dashboard quản trị. */}
                  <Link
                    to="/admin"
                    role="menuitem"
                    className="account-menu__item"
                    // Điều hướng vào trang quản trị; AdminRoute vẫn kiểm tra role.
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <ChartIcon size={18} />
                    <span>{copy.adminPage}</span>
                  </Link>
                </>
              ) : (
                /* Menu riêng cho user thường: không render bất kỳ link admin nào. */
                <Link
                  to="/landing"
                  role="menuitem"
                  className="account-menu__item"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  <DashboardIcon size={18} />
                  {/* Với user, "Trang chủ" là Landing Page; `/` là dashboard học viên. */}
                  <span>{copy.landingPage}</span>
                </Link>
              )}

              <Link
                to="/settings"
                role="menuitem"
                className="account-menu__item"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                <SettingsIcon size={18} />
                <span>{copy.settings}</span>
              </Link>

              <div className="account-menu__divider" />

              <button
                type="button"
                role="menuitem"
                className="account-menu__item account-menu__item--danger"
                onClick={handleLogout}
              >
                <LogoutIcon size={18} />
                <span>{copy.signOut}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
