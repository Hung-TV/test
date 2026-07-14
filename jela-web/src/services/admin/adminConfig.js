export const USE_FAKE_ADMIN = true;

export const fakeDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const ADMIN_ENDPOINTS = {
  dashboard: '/admin/dashboard',
  accounts: '/admin/accounts',
  accountById: (id) => `/admin/accounts/${id}`,
  accountRole: (id) => `/admin/accounts/${id}/role`,
  accountLock: (id) => `/admin/accounts/${id}/lock`,
  accountUnlock: (id) => `/admin/accounts/${id}/unlock`,
  accountLogs: (id) => `/admin/accounts/${id}/admin-logs`,
  kanji: '/admin/kanji',
  kanjiById: (id) => `/admin/kanji/${id}`,
  kanjiStatus: (id) => `/admin/kanji/${id}/status`,
  learningPaths: '/admin/learning-paths', 
  learningPathByLevel: (level) => `/admin/learning-paths/${level}`,
  lessons: '/admin/learning-paths/lessons',
  lessonById: (lessonId) => `/admin/learning-paths/lessons/${lessonId}`,
  lessonStatus: (lessonId) =>
    `/admin/learning-paths/lessons/${lessonId}/status`,
  lessonOrder: (lessonId) =>
    `/admin/learning-paths/lessons/${lessonId}/order`,
  reports: '/admin/reports',
  reportById: (reportId) => `/admin/reports/${reportId}`,
  reportStatus: (reportId) => `/admin/reports/${reportId}/status`,
  settings: '/admin/settings',
  vocabulary: '/admin/vocabulary',
  vocabularyById: (id) => `/admin/vocabulary/${id}`,
  vocabularyStatus: (id) => `/admin/vocabulary/${id}/status`,
};

export const getAdminResponseData = (response) => response?.data ?? response;

export const getAdminError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage;

  const serviceError = new Error(message);
  serviceError.cause = error;
  return serviceError;
};
