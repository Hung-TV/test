import axiosClient from "./axiosClient";
import {
  API_ENDPOINTS,
  API_FEATURES,
  createUnavailableApiError,
} from "./apiConfig";

const authApi = {
  getSettings: () => {
    return axiosClient.get("/auth/settings");
  },
  login: (data) => {
    return axiosClient.post(API_ENDPOINTS.auth.login, data);
  },
  register: (data) => {
    return axiosClient.post(API_ENDPOINTS.auth.register, data);
  },
  forgotPassword: (data) => {
    return axiosClient.post(API_ENDPOINTS.auth.forgotPassword, data);
  },
  resetPassword: (data) => {
    return axiosClient.post(API_ENDPOINTS.auth.resetPassword, data);
  },
  googleLogin: (data) => {
    return axiosClient.post(API_ENDPOINTS.auth.googleLogin, data);
  },
  logout: (refreshToken) => {
    return axiosClient.post(
      API_ENDPOINTS.auth.logout,
      { refreshToken },
      {
        // Logout dùng refresh token trong body, không cần access token và không
        // được kích hoạt lại luồng refresh nếu request thu hồi token thất bại.
        skipAuth: true,
        skipAuthRefresh: true,
        skipAuthLogout: true,
      },
    );
  },
  changePassword: (data) => {
    // Contract frontend gửi: { currentPassword, newPassword, confirmPassword }.
    // Khi BE hoàn thiện controller, bật API_FEATURES.changePassword.
    if (!API_FEATURES.changePassword) {
      return Promise.reject(
        createUnavailableApiError(
          "CHANGE_PASSWORD_API_NOT_CONFIGURED",
          "Change password API is not available.",
        ),
      );
    }

    return axiosClient.patch(API_ENDPOINTS.auth.changePassword, data, {
      // Mật khẩu hiện tại sai có thể được BE trả về 401. Không được xóa phiên
      // trong trường hợp này vì access token của user vẫn còn hợp lệ.
      skipAuthLogout: true,
    });
  },
};

export default authApi;
