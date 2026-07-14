import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resolveIsAdmin } from '../utils/auth';

/**
 * PublicRoute — chỉ cho vào nếu chưa đăng nhập.
 *
 * Sau khi đăng nhập:
 *   - ADMIN  → /admin
 *   - USER   → /
 *
 * isInitializing guard đảm bảo không redirect sớm khi token
 * đang được xác minh từ localStorage.
 */
export default function PublicRoute() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  // Chờ AuthContext xác minh phiên xong trước khi quyết định redirect.
  if (isInitializing) {
    return <div role="status" className="route-loading">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (isAuthenticated) {
    // Điều hướng đúng theo role sau khi đã đăng nhập.
    return <Navigate to={resolveIsAdmin(user) ? '/admin' : '/'} replace />;
  }

  return <Outlet />;
}
