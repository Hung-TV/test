import axiosClient from '../../api/axiosClient';
import { mockReports } from '../../data/adminMockData';
import {
  ADMIN_ENDPOINTS,
  USE_FAKE_ADMIN,
  fakeDelay,
  getAdminError,
  getAdminResponseData,
} from './adminConfig';

/**
 * Reserved for future development.
 * Service xử lý báo cáo lỗi Kanji, âm đọc, ví dụ, giao diện và góp ý.
 *
 * Currently using mock data when USE_FAKE_ADMIN = true.
 * Switch USE_FAKE_ADMIN to false when BE APIs are ready.
 */

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED'];
const REPORT_TYPE_LABELS = {
  KANJI_MEANING_ERROR: 'Kanji sai nghĩa',
  READING_ERROR: 'Sai âm đọc',
  EXAMPLE_ERROR: 'Sai ví dụ',
  UI_ERROR: 'Lỗi giao diện',
  OTHER: 'Góp ý khác',
};

const findReport = (reportId) => {
  const report = mockReports.find(
    (item) => String(item.id) === String(reportId),
  );
  if (!report) throw new Error('Không tìm thấy báo cáo');
  return report;
};

export async function getReports(params = {}) {
  try {
    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.get(ADMIN_ENDPOINTS.reports, { params });
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const {
      page = 1,
      limit = 10,
      keyword = '',
      type = 'ALL',
      status = 'ALL',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');

    let items = mockReports.filter((report) => {
      const searchableText = [
        report.reporterName,
        report.reporterEmail,
        report.relatedContent,
        report.description,
      ]
        .join(' ')
        .toLocaleLowerCase('vi');
      return (
        (!normalizedKeyword || searchableText.includes(normalizedKeyword)) &&
        (type === 'ALL' || report.type === type) &&
        (status === 'ALL' || report.status === status)
      );
    });

    items = [...items].sort((left, right) => {
      const result = String(left[sortBy] ?? '').localeCompare(
        String(right[sortBy] ?? ''),
        'vi',
        { numeric: true },
      );
      return sortOrder === 'asc' ? result : -result;
    });

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Number(limit) || 10);
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / safeLimit);
    const start = (safePage - 1) * safeLimit;

    return {
      items: structuredClone(items.slice(start, start + safeLimit)),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
      },
    };
  } catch (error) {
    throw getAdminError(error, 'Không thể tải danh sách báo cáo');
  }
}

export async function getReportById(reportId) {
  try {
    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.get(
        ADMIN_ENDPOINTS.reportById(reportId),
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    return structuredClone(findReport(reportId));
  } catch (error) {
    throw getAdminError(error, 'Không thể tải báo cáo');
  }
}

export async function updateReportStatus(reportId, payload) {
  try {
    if (!VALID_STATUSES.includes(payload.status)) {
      throw new Error('Trạng thái báo cáo không hợp lệ');
    }
    if (
      ['RESOLVED', 'REJECTED'].includes(payload.status) &&
      !payload.adminNote?.trim()
    ) {
      throw new Error('Vui lòng nhập ghi chú khi hoàn tất hoặc từ chối báo cáo');
    }

    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.patch(
        ADMIN_ENDPOINTS.reportStatus(reportId),
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const report = findReport(reportId);
    report.status = payload.status;
    report.adminNote = payload.adminNote?.trim() || null;
    report.updatedAt = new Date().toISOString();
    return structuredClone(report);
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật báo cáo');
  }
}

// Adapter giữ contract mảng và nhãn tiếng Việt mà ReportManagementPage đang dùng.
const getLegacyReports = async () => {
  const result = await getReports({ limit: Number.MAX_SAFE_INTEGER });
  return result.items.map((report) => ({
    ...report,
    type: REPORT_TYPE_LABELS[report.type] || report.type,
    date: new Date(report.createdAt).toLocaleDateString('vi-VN'),
  }));
};

const adminReportService = {
  getReports: getLegacyReports,
  getReportById,
  updateReportStatus: (reportId, status, adminNote) =>
    updateReportStatus(reportId, { status, adminNote }),
};

export default adminReportService;
