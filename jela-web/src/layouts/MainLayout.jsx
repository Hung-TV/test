import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import MobileNavbar from '../components/common/MobileNavbar';
import Sidebar from '../components/common/Sidebar';
import { useAppPreferences } from '../hooks/useAppPreferences';
import '../styles/main-layout.css';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useAppPreferences();

  return (
    <div className="app-shell">
      {/* Sidebar cố định trên desktop và trở thành drawer trên màn hình nhỏ. */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="app-shell__main">
        <Header onOpenMenu={() => setIsSidebarOpen(true)} />

        {/* Route thường dùng Outlet; DictionaryRoute truyền children để cùng
            một URL chọn app layout hoặc public layout theo phiên đăng nhập. */}
        <div className="app-shell__content">
          {children || <Outlet />}
        </div>
      </div>

      <MobileNavbar />
    </div>
  );
}
