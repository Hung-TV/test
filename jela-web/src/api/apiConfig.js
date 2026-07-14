// Tất cả đường dẫn API nội bộ được gom tại đây để frontend chỉ có một nguồn
// cấu hình. Các endpoint không thay đổi giữa local/staging/production; chỉ
// VITE_API_BASE_URL trong .env thay đổi theo môi trường triển khai.
export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    googleLogin: "/auth/google",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    changePassword: "/auth/change-password",
  },
  user: {
    me: "/users/me",
    updateProfile: "/users/me",
    updateEmail: "/users/me/email",
    sendEmailVerification: "/users/me/email/verification",
  },
  dictionary: {
    search: "/dictionary/search",
    detail: (id) => `/dictionary/${id}`,
    lists: "/me/dictionary-lists/all",
    listDetails: (id) => `/me/dictionary-lists/${id}/items`,
    addWordToList: "/me/dictionary-lists/add-word",
    addWordToNewList: "/me/dictionary-lists/add-word-to-new-list",
    history: "/me/dictionary-history",
    createList: "/me/dictionary-lists/create",
    learnSession: (listId) => `/me/dictionary-lists/${listId}/learn/session`,
    submitReview: (listId) => `/me/dictionary-lists/${listId}/review`,
    reviewSession: (listId) => `/me/dictionary-lists/${listId}/review/session`,
    explainReview: "/me/dictionary-lists/review/explain",
  },
  kanji: {
    levels: '/kanji',
    list: '/kanji/list',
    search: '/kanji/search',
    detail: (id) => `/kanji/${id}`,
    history: '/me/kanji-history',
    lists: '/me/kanji-list/all',
    createList: '/me/kanji-list/create',
    addKanji: (listId) => `/me/kanji-list/${listId}/items`,
    listDetails: (listId) => `/me/kanji-list/${listId}/items`,
    learnSession: (listId) => `/me/kanji-list/${listId}/learn`,
    reviewSession: (listId) => `/me/kanji-list/${listId}/review/session`,
    submitReview: (listId) => `/me/kanji-list/${listId}/review`,
    explainReview: '/me/kanji-list/review/explain',
    startLevel: (level) => `/me/kanji-list/levels/${level}/start`,
  },
  decks: {
    all: '/me/decks',
    create: '/me/decks',
    update: (id) => `/me/decks/${id}`,
    delete: (id) => `/me/decks/${id}`,
  },
  dashboard: {
    stats: '/users/me/dashboard',
  },
};

// Bật cờ tương ứng khi controller BE đã được triển khai và contract đã khớp.
// Cách này giúp UI vẫn hoàn thiện trước, nhưng không gọi nhầm endpoint chưa có
// hoặc hiển thị thành công giả.
export const API_FEATURES = {
  profileUpdate: true,
  changePassword: true,
  emailUpdate: true,
  emailVerification: true,
};

export const createUnavailableApiError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};
