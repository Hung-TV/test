import axiosClient from './axiosClient';
import {
  API_ENDPOINTS,
  API_FEATURES,
  createUnavailableApiError,
} from './apiConfig';

const userApi = {
  getCurrentUser: () => {
    // Endpoint này đã có ở backend và trả cả authType, emailVerified...
    // Settings dùng dữ liệu này để phân biệt chính xác LOCAL với GOOGLE,
    // kể cả các phiên đăng nhập cũ chưa lưu authType trong localStorage.
    return axiosClient.get(API_ENDPOINTS.user.me);
  },
  updateProfile: (profile) => {
    // Giữ cơ chế lưu local hiện tại để Profile vẫn hoạt động trước khi BE có
    // PATCH /users/me. Khi controller hoàn thiện, bật profileUpdate ở apiConfig.
    if (!API_FEATURES.profileUpdate) {
      return Promise.resolve(profile);
    }

    return axiosClient.patch(API_ENDPOINTS.user.updateProfile, profile);
  },
  updateEmail: (email) => {
    // TODO(BE): bật API_FEATURES.emailUpdate khi backend hoàn thiện flow.
    // Contract đề xuất: PATCH { email } và backend gửi email xác minh tới địa chỉ mới.
    if (!API_FEATURES.emailUpdate) {
      return Promise.reject(
        createUnavailableApiError(
          'EMAIL_UPDATE_API_NOT_CONFIGURED',
          'Email update API is not available.',
        ),
      );
    }

    return axiosClient.patch(API_ENDPOINTS.user.updateEmail, { email });
  },
  sendVerificationEmail: () => {
    // TODO(BE): endpoint dùng JWT để xác định user, không nhận email từ client
    // nhằm tránh bị lợi dụng để gửi thư xác minh tới địa chỉ tùy ý.
    if (!API_FEATURES.emailVerification) {
      return Promise.reject(
        createUnavailableApiError(
          'EMAIL_VERIFICATION_API_NOT_CONFIGURED',
          'Email verification API is not available.',
        ),
      );
    }

    return axiosClient.post(API_ENDPOINTS.user.sendEmailVerification);
  },
};

export default userApi;
