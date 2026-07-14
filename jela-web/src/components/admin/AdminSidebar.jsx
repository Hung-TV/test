import { NavLink } from 'react-router-dom';
import Brand from '../common/Brand';
import {
  DashboardIcon,
  UsersIcon,
  DatabaseIcon,
  RoadmapIcon,
  AlertIcon,
  GearIcon,
  BookOpenIcon,
} from '../common/AppIcons';

/** Danh sách menu chính của trang Admin */
const adminNavItems = [
  { to: '/admin',               label: 'Tổng quan',           icon: DashboardIcon, end: true },
  { to: '/admin/students',      label: 'Quản lý Tài khoản',   icon: UsersIcon },
  { to: '/admin/kanji',         label: 'Dữ liệu Kanji',       icon: DatabaseIcon },
  { to: '/admin/vocabulary',    label: 'Dữ liệu Từ vựng',     icon: BookOpenIcon },
  { to: '/admin/learning-paths',label: 'Cấu hình Lộ trình',   icon: RoadmapIcon },
  { to: '/admin/reports',       label: 'Báo cáo lỗi',         icon: AlertIcon },
  { to: '/admin/settings',      label: 'Cài đặt hệ thống',    icon: GearIcon },
];

export default function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      <aside className={`admin-sidebar${isOpen ? ' admin-sidebar--open' : ''}`}>
        {/* Logo — click về /admin */}
        <Brand to="/admin" />

        {/* Menu chính */}
        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {adminNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Backdrop cho mobile */}
      {isOpen && (
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label="Đóng menu"
          onClick={onClose}
        />
      )}
    </>
  );
}
