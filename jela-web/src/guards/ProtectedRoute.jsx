import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute — yêu cầu đã đăng nhập (bất kỳ role).
 *
 * Dành cho khu vực học viên (/, /kanji, /profile...).
 * Cả USER lẫn ADMIN đều có thể vào nếu muốn.
 *
 * isInitializing guard đảm bảo không redirect về /login sớm
 * khi token còn đang được xác minh từ localStorage.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  // Giữ màn hình trống trong khi AuthContext đang khởi tạo.
  // Không dùng <Navigate> ở đây để tránh redirect nhầm.
  if (isInitializing) {
    return <div role="status" className="route-loading">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
