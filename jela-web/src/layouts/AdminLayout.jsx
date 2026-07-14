import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import '../styles/admin.css';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="admin-shell__main">
        <AdminHeader onOpenMenu={() => setIsSidebarOpen(true)} />

        <div className="admin-shell__content">
          <Outlet />
        </div>
      </div>
      
      {/* Re-use the mobile navbar from main layout if necessary, or omit for admin */}
    </div>
  );
}

