import axiosClient from '../../api/axiosClient';
import { mockAccounts } from '../../data/adminMockData';
import {
  ADMIN_ENDPOINTS,
  USE_FAKE_ADMIN,
  fakeDelay,
  getAdminError,
  getAdminResponseData,
} from './adminConfig';

const USE_FAKE_ACCOUNTS = false;

const findAccountIndex = (id) =>
  mockAccounts.findIndex((account) => String(account.id) === String(id));

const getFakeAccount = (id) => {
  const index = findAccountIndex(id);
  if (index === -1 || mockAccounts[index].status === 'DELETED') {
    throw new Error('Không tìm thấy tài khoản');
  }
  return { index, account: mockAccounts[index] };
};

const addAdminLog = (account, log) => {
  account.adminLogs = account.adminLogs || [];
  account.adminLogs.unshift({
    id: Date.now(),
    adminName: 'Admin',
    createdAt: new Date().toISOString(),
    ...log,
  });
};

const createDefaultLearningProgress = () => ({
  kanji: 0,
  vocabulary: 0,
  quizzes: 0,
  averageScore: 0,
  completionRate: 0,
});

export async function getAccounts(params = {}) {
  try {
    if (!USE_FAKE_ACCOUNTS) {
      const response = await axiosClient.get(ADMIN_ENDPOINTS.accounts, { params });
      return getAdminResponseData(response);
    }

    await fakeDelay();

    const {
      page = 1,
      limit = 10,
      keyword = '',
      role = 'ALL',
      status = 'ALL',
      level = 'ALL',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    let items = mockAccounts.filter((account) => {
      if (account.status === 'DELETED') return false;

      const matchesKeyword =
        !normalizedKeyword ||
        account.fullName.toLocaleLowerCase('vi').includes(normalizedKeyword) ||
        account.email.toLocaleLowerCase('vi').includes(normalizedKeyword);

      return (
        matchesKeyword &&
        (role === 'ALL' || account.role === role) &&
        (status === 'ALL' || account.status === status) &&
        (level === 'ALL' || account.currentLevel === level)
      );
    });

    items = [...items].sort((left, right) => {
      const leftValue = left[sortBy] ?? '';
      const rightValue = right[sortBy] ?? '';
      const result = String(leftValue).localeCompare(
        String(rightValue),
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
      items: items.slice(start, start + safeLimit),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
      },
    };
  } catch (error) {
    throw getAdminError(error, 'Không thể tải danh sách tài khoản');
  }
}

export async function getAccountById(id) {
  try {
    if (!USE_FAKE_ACCOUNTS) {
      const response = await axiosClient.get(ADMIN_ENDPOINTS.accountById(id));
      return getAdminResponseData(response);
    }

    await fakeDelay();
    return { ...getFakeAccount(id).account };
  } catch (error) {
    throw getAdminError(error, 'Không thể tải tài khoản');
  }
}

export async function createAccount(payload) {
  try {
    if (!USE_FAKE_ACCOUNTS) {
      const response = await axiosClient.post(ADMIN_ENDPOINTS.accounts, payload);
      return getAdminResponseData(response);
    }

    await fakeDelay();

    const emailExists = mockAccounts.some(
      (account) =>
        account.email.toLowerCase() === payload.email.trim().toLowerCase() &&
        account.status !== 'DELETED',
    );
    if (emailExists) throw new Error('Email này đã tồn tại');

    const now = new Date().toISOString();
    const account = {
      id: Date.now(),
      fullName: payload.fullName,
      email: payload.email.trim(),
      avatarUrl: null,
      role: payload.role,
      status: payload.status || 'ACTIVE',
      currentLevel: payload.role === 'USER' ? payload.currentLevel : null,
      mustChangePassword: Boolean(payload.mustChangePassword),
      note: payload.note || '',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      lockedAt: payload.status === 'LOCKED' ? now : null,
      lockReason: null,
      learningProgress:
        payload.role === 'USER' ? createDefaultLearningProgress() : null,
      recentActivities: [],
      adminLogs: [],
    };

    addAdminLog(account, {
      actionType: 'CREATE_ACCOUNT',
      oldValue: null,
      newValue: payload.role,
      reason: payload.note || 'Tạo tài khoản mới',
    });
    mockAccounts.unshift(account);
    return { ...account };
  } catch (error) {
    throw getAdminError(error, 'Không thể tạo tài khoản');
  }
}

export async function updateAccount(id, payload) {
  try {
    if (!USE_FAKE_ACCOUNTS) {
      const response = await axiosClient.put(
        ADMIN_ENDPOINTS.accountById(id),
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { index, account } = getFakeAccount(id);
    const allowedFields = ['fullName', 'avatarUrl', 'currentLevel', 'note'];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => Object.hasOwn(payload, field))
        .map((field) => [field, payload[field]]),
    );

    mockAccounts[index] = {
      ...account,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...mockAccounts[index] };
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật tài khoản');
  }
}

export async function changeAccountRole(id, payload) {
  try {
    if (!USE_FAKE_ACCOUNTS) {
      const response = await axiosClient.patch(
        ADMIN_ENDPOINTS.accountRole(id),
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { account } = getFakeAccount(id);
    if (account.role === payload.role) {
      throw new Error('Vai trò mới phải khác vai trò hiện tại');
    }

    const oldRole = account.role;
    const now = new Date().toISOString();
    account.role = payload.role;
    account.currentLevel =
      payload.role === 'USER' ? account.currentLevel || 'N5' : null;
    account.learningProgress =
      payload.role === 'USER'
        ? account.learningProgress || createDefaultLearningProgress()
        : null;
    account.updatedAt = now;
    addAdminLog(account, {
      actionType: 'CHANGE_ROLE',
      oldValue: oldRole,
      newValue: payload.role,
      reason: payload.reason || '',
    });

    return {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      oldRole,
      newRole: account.role,
      updatedAt: now,
      updatedBy: 'Admin',
    };
  } catch (error) {
    throw getAdminError(error, 'Không thể đổi vai trò tài khoản');
  }
}

export async function lockAccount(id, payload = {}) {
  try {
    if (!payload.reason?.trim()) throw new Error('Lý do khóa là bắt buộc');

    if (!USE_FAKE_ACCOUNTS) {
      const response = await axiosClient.patch(
        ADMIN_ENDPOINTS.accountLock(id),
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { account } = getFakeAccount(id);
    const now = new Date().toISOString();
    const oldStatus = account.status;
    account.status = 'LOCKED';
    account.lockedAt = now;
    account.lockReason = payload.reason.trim();
    account.updatedAt = now;
    addAdminLog(account, {
      actionType: 'LOCK_ACCOUNT',
      oldValue: oldStatus,
      newValue: 'LOCKED',
      reason: payload.reason.trim(),
    });
    return { ...account };
  } catch (error) {
    throw getAdminError(error, 'Không thể khóa tài khoản');
  }
}

export async function unlockAccount(id, payload = {}) {
  try {
    if (!USE_FAKE_ACCOUNTS) {
      const response = await axiosClient.patch(
        ADMIN_ENDPOINTS.accountUnlock(id),
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { account } = getFakeAccount(id);
    const now = new Date().toISOString();
    const oldStatus = account.status;
    account.status = 'ACTIVE';
    account.lockedAt = null;
    account.lockReason = null;
    account.updatedAt = now;
    addAdminLog(account, {
      actionType: 'UNLOCK_ACCOUNT',
      oldValue: oldStatus,
      newValue: 'ACTIVE',
      reason: payload.reason || 'Mở khóa tài khoản',
    });
    return { ...account };
  } catch (error) {
    throw getAdminError(error, 'Không thể mở khóa tài khoản');
  }
}

export async function getAccountAdminLogs(id) {
  try {
    if (!USE_FAKE_ACCOUNTS) {
      const response = await axiosClient.get(ADMIN_ENDPOINTS.accountLogs(id));
      return getAdminResponseData(response);
    }

    await fakeDelay();
    return [...(getFakeAccount(id).account.adminLogs || [])];
  } catch (error) {
    throw getAdminError(error, 'Không thể tải lịch sử quản trị');
  }
}

const adminAccountService = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  changeAccountRole,
  lockAccount,
  unlockAccount,
  getAccountAdminLogs,
};

export default adminAccountService;
