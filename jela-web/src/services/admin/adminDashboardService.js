import axiosClient from '../../api/axiosClient';
import {
  mockAccounts,
  mockDashboardStats,
  mockKanjiList,
  mockReports,
} from '../../data/adminMockData';
import {
  ADMIN_ENDPOINTS,
  USE_FAKE_ADMIN,
  fakeDelay,
  getAdminError,
  getAdminResponseData,
} from './adminConfig';

const isToday = (value) => {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const byDateDescending = (field) => (left, right) =>
  new Date(right[field] || 0) - new Date(left[field] || 0);

export async function getDashboard() {
  try {
    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.get(ADMIN_ENDPOINTS.dashboard);
      return getAdminResponseData(response);
    }

    await fakeDelay();

    const activeAccounts = mockAccounts.filter(
      (account) => account.status !== 'DELETED',
    );
    const visibleKanji = mockKanjiList.filter(
      (kanji) => kanji.status !== 'DELETED',
    );

    return {
      stats: {
        totalAccounts: activeAccounts.length,
        totalStudents: activeAccounts.filter(
          (account) => account.role === 'USER',
        ).length,
        totalTutors: activeAccounts.filter(
          (account) => account.role === 'TUTOR',
        ).length,
        newAccountsToday: activeAccounts.filter((account) =>
          isToday(account.createdAt),
        ).length,
        todayVisits: mockDashboardStats.todayVisits,
        totalKanji: visibleKanji.length,
        // Mock dashboard lấy trực tiếp số báo cáo đang chờ từ report module.
        // Khi có BE, dashboard endpoint nên trả sẵn chỉ số tổng hợp này.
        pendingReports: mockReports.filter(
          (report) => report.status === 'PENDING',
        ).length,
      },
      recentAccounts: [...activeAccounts]
        .sort(byDateDescending('createdAt'))
        .slice(0, 5),
      recentKanji: [...visibleKanji]
        .sort(byDateDescending('updatedAt'))
        .slice(0, 5),
    };
  } catch (error) {
    throw getAdminError(error, 'Không thể tải dữ liệu tổng quan');
  }
}

const adminDashboardService = {
  getDashboard,
};

export default adminDashboardService;
