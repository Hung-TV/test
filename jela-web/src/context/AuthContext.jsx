import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContextDefinition';
import {
  AUTH_SESSION_REFRESHED_EVENT,
  AUTH_UNAUTHORIZED_EVENT,
} from '../constants/authConstants';
import authApi from '../api/authApi';
import userApi from '../api/userApi';
import { resolveIsAdmin } from '../utils/auth';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  // Lazy initializer chỉ chạy một lần trước lần render đầu tiên, tránh nháy trang login
  // và không cần gọi nhiều setState liên tiếp bên trong useEffect.
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      return { user: null, accessToken: null };
    }

    try {
      return {
        accessToken: token,
        user: JSON.parse(savedUser),
      };
    } catch {
      // Dữ liệu user có thể bị sửa hoặc hỏng trong localStorage. Xóa phiên lỗi để
      // ứng dụng vẫn khởi động bình thường thay vì crash tại JSON.parse.
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return { user: null, accessToken: null };
    }
  });
  const [isInitializing, setIsInitializing] = useState(
    () => Boolean(
      localStorage.getItem('accessToken') &&
      localStorage.getItem('user'),
    ),
  );

  const login = useCallback((data) => {
    // Chỉ tạo phiên khi API trả đủ thông tin bắt buộc. Điều này ngăn trường hợp
    // response lỗi/sai cấu trúc nhưng giao diện vẫn hiểu nhầm là đã đăng nhập.
    if (!data?.accessToken || !data?.user) {
      throw new Error('Dữ liệu đăng nhập không hợp lệ.');
    }

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }

    setAuthState({
      accessToken: data.accessToken,
      user: data.user,
    });
    // Login đã có đủ token/user nên route guard không cần tiếp tục chờ
    // quá trình khôi phục phiên cũ (nếu trước đó đang diễn ra).
    setIsInitializing(false);
    // Dùng resolveIsAdmin để xử lý cả 2 format: ["ADMIN"] hoặc [{name:"ADMIN"}].
    if (resolveIsAdmin(data.user)) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  }, [navigate]);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refreshToken');

    // Xóa phiên trên trình duyệt ngay để UI phản hồi tức thì; request backend
    // chạy nền nhằm thu hồi refresh token và không giữ user ở màn hình chờ.
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    setAuthState({ user: null, accessToken: null });
    // Quan trọng: logout có thể làm effect xác minh phiên bị cleanup trước
    // khi `.finally()` chạy. Chủ động kết thúc initializing để PublicRoute
    // render trang login thay vì mắc vĩnh viễn ở màn hình chờ/trắng.
    setIsInitializing(false);
  }, []);

  const updateUser = useCallback((updates) => {
    setAuthState((currentState) => {
      if (!currentState.user) return currentState;

      const updatedUser = {
        ...currentState.user,
        ...updates,
      };

      // Đồng bộ localStorage để thông tin mới vẫn tồn tại sau khi tải lại trang.
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return {
        ...currentState,
        user: updatedUser,
      };
    });
  }, []);

  useEffect(() => {
    // Axios hoạt động ngoài cây React nên dùng một browser event nhỏ để báo
    // AuthProvider cập nhật state ngay khi backend xác nhận token không còn hợp lệ.
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  useEffect(() => {
    const handleSessionRefreshed = (event) => {
      const accessToken = event.detail?.accessToken;
      const refreshedUser = event.detail?.user;
      if (!accessToken) return;

      setAuthState((currentState) => ({
        accessToken,
        user: {
          ...(currentState.user || {}),
          ...(refreshedUser || {}),
        },
      }));
    };

    window.addEventListener(
      AUTH_SESSION_REFRESHED_EVENT,
      handleSessionRefreshed,
    );
    return () => {
      window.removeEventListener(
        AUTH_SESSION_REFRESHED_EVENT,
        handleSessionRefreshed,
      );
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== 'accessToken') return;

      if (!event.newValue) {
        logout();
        return;
      }

      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (!storedUser) return;

        setAuthState({
          accessToken: event.newValue,
          user: storedUser,
        });
      } catch {
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout]);

  useEffect(() => {
    // Phiên không có token đã được initializer/logout đưa về trạng thái sẵn sàng.
    if (!authState.accessToken) return;

    let isActive = true;

    // Đồng bộ dữ liệu tài khoản thật khi mở app. Interceptor sẽ tự refresh nếu
    // access token 15 phút đã hết nhưng refresh token vẫn còn hạn.
    userApi.getCurrentUser()
      .then((currentUser) => {
        if (!isActive || !currentUser) return;

        setAuthState((currentState) => {
          const updatedUser = {
            ...(currentState.user || {}),
            ...currentUser,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));

          return {
            ...currentState,
            user: updatedUser,
          };
        });
      })
      .catch(() => {
        // Lỗi xác thực đã được interceptor xử lý. Với lỗi mạng tạm thời, giữ
        // session local để user không bị đăng xuất oan.
      })
      .finally(() => {
        if (isActive) setIsInitializing(false);
      });

    return () => {
      isActive = false;
    };
  }, [authState.accessToken]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await userApi.getCurrentUser();
      if (currentUser) {
        setAuthState((currentState) => {
          const updatedUser = {
            ...(currentState.user || {}),
            ...currentUser,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return {
            ...currentState,
            user: updatedUser,
          };
        });
      }
      return currentUser;
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  }, []);

  const value = useMemo(() => ({
    user: authState.user,
    accessToken: authState.accessToken,
    // Không lưu isAuthenticated thành state riêng để tránh lệch trạng thái với token/user.
    isAuthenticated: Boolean(authState.accessToken && authState.user),
    isInitializing,
    login,
    logout,
    updateUser,
    refreshUser,
  }), [authState, isInitializing, login, logout, updateUser, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
