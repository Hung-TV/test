import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resolveIsAdmin } from '../utils/auth';

/**
 * AdminRoute — chỉ cho vào nếu đã đăng nhập VÀ có role ADMIN/ROLE_ADMIN.
 *
 * isInitializing guard đảm bảo không redirect sớm về /login
 * khi token còn đang được xác minh từ localStorage.
 */
const AdminRoute = () => {
  const { user, isAuthenticated, isInitializing } = useAuth();

  // Chờ AuthContext xác minh phiên xong trước khi quyết định.
  if (isInitializing) {
    return <div role="status" className="route-loading">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // resolveIsAdmin xử lý cả 2 format: ["ADMIN"] hoặc [{name:"ADMIN"}]
  if (!resolveIsAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
