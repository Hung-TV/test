import axiosClient from '../../api/axiosClient';
import { mockSystemSettings } from '../../data/adminMockData';
import {
  ADMIN_ENDPOINTS,
  USE_FAKE_ADMIN,
  fakeDelay,
  getAdminError,
  getAdminResponseData,
} from './adminConfig';

/**
 * Reserved for future development.
 * Một số cấu hình có thể cần quyền SUPER_ADMIN khi backend được hoàn thiện.
 *
 * Currently using mock data when USE_FAKE_ADMIN = true.
 * Switch USE_FAKE_ADMIN to false when BE APIs are ready.
 */

const USE_FAKE_SETTINGS = false;

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const DEFAULT_SETTINGS = {
  appName: 'JELA',
  allowRegistration: true,
  allowGoogleLogin: true,
  defaultUserLevel: 'N5',
  defaultQuizQuestionCount: 10,
  quizPassScore: 70,
  maintenanceMode: false,
  maintenanceMessage: '',
};

const validateSettings = (settings) => {
  if (!settings.appName?.trim()) {
    throw new Error('Tên ứng dụng không được để trống');
  }
  if (!LEVELS.includes(settings.defaultUserLevel)) {
    throw new Error('Cấp độ mặc định không hợp lệ');
  }
  if (Number(settings.defaultQuizQuestionCount) <= 0) {
    throw new Error('Số câu hỏi mặc định phải lớn hơn 0');
  }
  if (
    Number(settings.quizPassScore) < 0 ||
    Number(settings.quizPassScore) > 100
  ) {
    throw new Error('Điểm đạt phải nằm trong khoảng từ 0 đến 100');
  }
  if (settings.maintenanceMode && !settings.maintenanceMessage?.trim()) {
    throw new Error('Vui lòng nhập thông báo khi bật chế độ bảo trì');
  }
};

export async function getSystemSettings() {
  try {
    if (!USE_FAKE_SETTINGS) {
      const response = await axiosClient.get(ADMIN_ENDPOINTS.settings);
      return getAdminResponseData(response);
    }

    await fakeDelay();
    return { ...mockSystemSettings };
  } catch (error) {
    throw getAdminError(error, 'Không thể tải cấu hình hệ thống');
  }
}

export async function updateSystemSettings(payload) {
  try {
    const nextSettings = { ...mockSystemSettings, ...payload };
    validateSettings(nextSettings);

    if (!USE_FAKE_SETTINGS) {
      const response = await axiosClient.put(
        ADMIN_ENDPOINTS.settings,
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    Object.assign(mockSystemSettings, nextSettings, {
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin',
    });
    return { ...mockSystemSettings };
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật cấu hình hệ thống');
  }
}

// API reset được để sẵn cho giai đoạn phát triển sau; hiện chỉ reset mock local.
export async function resetSystemSettings() {
  try {
    await fakeDelay();
    Object.assign(mockSystemSettings, DEFAULT_SETTINGS, {
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin',
    });
    return { ...mockSystemSettings };
  } catch (error) {
    throw getAdminError(error, 'Không thể khôi phục cấu hình mặc định');
  }
}

/*
 * Adapter tương thích tên field cũ của AdminSettingPage.
 * Điểm dạng phần trăm trong service được quy đổi về số câu đúng cho UI cũ.
 */
const toLegacySettings = (settings) => ({
  ...settings,
  defaultLevel: settings.defaultUserLevel,
  defaultQuizQuestions: settings.defaultQuizQuestionCount,
  quizPassingScore: Math.ceil(
    (settings.quizPassScore / 100) * settings.defaultQuizQuestionCount,
  ),
});

const fromLegacySettings = (settings) => ({
  appName: settings.appName,
  allowRegistration: settings.allowRegistration,
  allowGoogleLogin: settings.allowGoogleLogin,
  defaultUserLevel: settings.defaultLevel,
  defaultQuizQuestionCount: Number(settings.defaultQuizQuestions),
  quizPassScore: Math.round(
    (Number(settings.quizPassingScore) /
      Number(settings.defaultQuizQuestions || 1)) *
      100,
  ),
  maintenanceMode: settings.maintenanceMode,
  maintenanceMessage: settings.maintenanceMessage,
});

const adminSettingsService = {
  getSystemSettings: async () => toLegacySettings(await getSystemSettings()),
  updateSystemSettings: async (settings) =>
    toLegacySettings(await updateSystemSettings(fromLegacySettings(settings))),
  resetSystemSettings: async () =>
    toLegacySettings(await resetSystemSettings()),
};

export default adminSettingsService;
