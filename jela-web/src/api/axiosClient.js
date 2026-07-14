import axios from "axios";
import {
  AUTH_SESSION_REFRESHED_EVENT,
  AUTH_UNAUTHORIZED_EVENT,
} from "../constants/authConstants";
import { API_ENDPOINTS } from "./apiConfig";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Client riêng không gắn interceptor để request refresh không tự gọi lại chính nó.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

const clearStoredSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
};

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const isAccessTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const { exp } = JSON.parse(atob(normalizedPayload));

    // Cho phép lệch đồng hồ nhỏ và refresh trước hạn 5 giây.
    return !exp || exp * 1000 <= Date.now() + 5_000;
  } catch {
    return true;
  }
};

const refreshSession = async () => {
  const refreshToken = localStorage.getItem("refreshToken")?.trim();
  if (!refreshToken) {
    throw new Error("Refresh token is missing.");
  }

  const response = await refreshClient.post(API_ENDPOINTS.auth.refresh, {
    refreshToken,
  });
  const data = response.data;

  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error("Refresh response is invalid.");
  }

  // Backend xoay vòng refresh token, vì vậy phải thay cả hai token cùng lúc.
  const mergedUser = {
    ...(readStoredUser() || {}),
    ...(data.user || {}),
  };

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  if (Object.keys(mergedUser).length > 0) {
    localStorage.setItem("user", JSON.stringify(mergedUser));
  }

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_REFRESHED_EVENT, {
    detail: {
      accessToken: data.accessToken,
      user: mergedUser,
    },
  }));

  return data.accessToken;
};

// JWT được lấy ở thời điểm gửi request để luôn dùng token mới nhất sau refresh.
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")?.trim();

    // AxiosHeaders luôn có trên axios hiện tại, nhưng phép gán fallback giúp
    // interceptor vẫn an toàn nếu một request tùy chỉnh không truyền headers.
    config.headers = config.headers || {};

    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Không để Authorization cũ bị dùng lại trên request public.
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response) => {
    // Nếu response.data tồn tại thì trả về data, ngược lại trả về nguyên response
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config || {};
    const refreshToken = localStorage.getItem("refreshToken")?.trim();
    const accessToken = localStorage.getItem("accessToken")?.trim();
    const tokenExpired = isAccessTokenExpired(accessToken);
    const isAuthenticationFailure =
      status === 401 || (status === 403 && tokenExpired);
    const canRefresh =
      isAuthenticationFailure &&
      refreshToken &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest._retry;

    if (canRefresh) {
      originalRequest._retry = true;

      try {
        // Chỉ một request refresh được chạy dù nhiều API cùng hết access token.
        if (!refreshPromise) {
          refreshPromise = refreshSession().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch {
        // Refresh token hết hạn/bị thu hồi thì phiên mới thực sự kết thúc.
        clearStoredSession();
        return Promise.reject(error);
      }
    }

    if (
      isAuthenticationFailure &&
      !originalRequest.skipAuthLogout &&
      accessToken
    ) {
      clearStoredSession();
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
