import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { resolveIsAdmin } from '../../utils/auth';
import {
  BookOpenIcon,
  ChartIcon,
  MenuIcon,
  ChevronDownIcon,
  DashboardIcon,
  UserCircleIcon,
  GearIcon,
  LogoutIcon,
} from '../common/AppIcons';

/** Lấy chữ cái đầu của tên (tối đa 2 chữ) */
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AdminHeader({ onOpenMenu }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.fullName || user?.name || user?.email || 'Admin';
  const avatarUrl   = user?.avatarUrl || user?.avatar;
  // AdminHeader nằm sau AdminRoute; kiểm tra lại role giúp menu không vô tình
  // hiển thị link quản trị nếu component được tái sử dụng ở nơi khác.
  const isAdmin = resolveIsAdmin(user);

  // Đóng dropdown khi click ngoài hoặc nhấn Escape
  useEffect(() => {
    const onPointer = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const close = () => setOpen(false);
  const handleLogout = () => {
    close();
    logout();
    toast.success('Đăng xuất thành công.');
  };

  return (
    <header className="admin-header">
      {/* Nút mở sidebar trên mobile */}
      <button
        type="button"
        className="admin-header__menu-btn"
        aria-label="Mở menu"
        onClick={onOpenMenu}
      >
        <MenuIcon size={22} />
      </button>

      {/* Tag ADMIN MODE */}
      <span className="admin-mode-tag">ADMIN MODE</span>

      {/* User dropdown */}
      <div className="app-user" ref={menuRef}>
        <button
          type="button"
          className="app-user__trigger"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {/* Tên & role */}
          <span className="app-user__copy">
            <strong style={{ color: 'var(--admin-color-navy)' }}>{displayName}</strong>
            <span>Quản trị viên</span>
          </span>

          {/* Avatar chữ cái đầu hoặc ảnh */}
          <span
            className="app-user__avatar"
            aria-hidden="true"
            style={{
              background: 'var(--admin-color-primary)',
              border: '2px solid var(--admin-color-primary)',
            }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="" />
              : getInitials(displayName)
            }
          </span>

          <ChevronDownIcon
            size={16}
            className={`app-user__chevron${open ? ' app-user__chevron--open' : ''}`}
          />
        </button>

        {open && (
          <div className="account-menu" role="menu">
            {/* Thông tin tài khoản */}
            <div className="account-menu__header">
              <strong>{displayName}</strong>
              <span>{user?.email || 'admin@jela.com'}</span>
            </div>

            <div className="account-menu__divider" />

            {/* Thông tin cá nhân của tài khoản admin */}
            <Link
              to="/admin/account"
              role="menuitem"
              className="account-menu__item"
              onClick={close}
            >
              <UserCircleIcon size={18} />
              <span>Thông tin cá nhân</span>
            </Link>

            {/* Cả ADMIN và USER đều được phép về Landing Page giới thiệu. */}
            <Link
              to="/landing"
              role="menuitem"
              className="account-menu__item"
              onClick={close}
            >
              <DashboardIcon size={18} />
              <span>Trang giới thiệu</span>
            </Link>

            {/* Menu riêng cho admin: điều hướng về giao diện học viên. */}
            <Link
              to="/"
              role="menuitem"
              className="account-menu__item"
              onClick={close}
            >
              <BookOpenIcon size={18} />
              <span>Trang học viên</span>
            </Link>

            {/* Menu riêng cho admin: AdminRoute tiếp tục bảo vệ route này. */}
            {isAdmin && (
              <Link
                to="/admin"
                role="menuitem"
                className="account-menu__item"
                onClick={close}
              >
                <ChartIcon size={18} />
                <span>Trang quản trị</span>
              </Link>
            )}

            {/* Cài đặt tài khoản */}
            <Link
              to="/admin/settings"
              role="menuitem"
              className="account-menu__item"
              onClick={close}
            >
              <GearIcon size={18} />
              <span>Cài đặt</span>
            </Link>

            <div className="account-menu__divider" />

            {/* Đăng xuất */}
            <button
              type="button"
              role="menuitem"
              className="account-menu__item account-menu__item--danger"
              onClick={handleLogout}
            >
              <LogoutIcon size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
