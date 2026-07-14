import DictionaryPage from '../features/dictionary/pages/DictionaryPage';
import DictionaryPublicLayout from '../layouts/DictionaryPublicLayout';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';

/**
 * Một URL `/dictionary`, hai trải nghiệm theo trạng thái đăng nhập:
 * - Guest: giữ giao diện public để tra cứu từ trang Landing.
 * - User/Admin đã đăng nhập: giữ Dictionary trong app shell cạnh sidebar.
 *
 * Chờ AuthContext khôi phục phiên trước khi chọn layout để tránh nháy giao diện
 * guest trong lúc access token cũ vẫn đang được xác minh.
 */
export default function DictionaryRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div role="status" className="route-loading">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <MainLayout>
        <DictionaryPage />
      </MainLayout>
    );
  }

  return (
    <DictionaryPublicLayout>
      <DictionaryPage />
    </DictionaryPublicLayout>
  );
}
