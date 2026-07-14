import axiosClient from '../../api/axiosClient';
import { mockKanjiList } from '../../data/adminMockData';
import {
  ADMIN_ENDPOINTS,
  USE_FAKE_ADMIN,
  fakeDelay,
  getAdminError,
  getAdminResponseData,
} from './adminConfig';

const USE_FAKE_KANJI = false;

const findKanjiIndex = (id) =>
  mockKanjiList.findIndex((kanji) => String(kanji.id) === String(id));

const getFakeKanji = (id) => {
  const index = findKanjiIndex(id);
  if (index === -1 || mockKanjiList[index].status === 'DELETED') {
    throw new Error('Không tìm thấy Kanji');
  }
  return { index, kanji: mockKanjiList[index] };
};

const hasDuplicateCharacter = (character, ignoredId = null) =>
  mockKanjiList.some(
    (kanji) =>
      kanji.character === character &&
      String(kanji.id) !== String(ignoredId) &&
      kanji.status !== 'DELETED',
  );

export async function getKanjiList(params = {}) {
  try {
    if (!USE_FAKE_KANJI) {
      const response = await axiosClient.get(ADMIN_ENDPOINTS.kanji, { params });
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const {
      page = 1,
      limit = 10,
      keyword = '',
      level = 'ALL',
      status = 'ALL',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = params;

    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    let items = mockKanjiList.filter((kanji) => {
      if (kanji.status === 'DELETED') return false;

      const searchableText = [
        kanji.character,
        kanji.meaning,
        kanji.onyomi,
        kanji.kunyomi,
      ]
        .join(' ')
        .toLocaleLowerCase('vi');

      return (
        (!normalizedKeyword || searchableText.includes(normalizedKeyword)) &&
        (level === 'ALL' || kanji.jlptLevel === level) &&
        (status === 'ALL' || kanji.status === status)
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
    const pageItems = items.slice(start, start + safeLimit);

    return {
      items: pageItems,
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
      },
    };
  } catch (error) {
    throw getAdminError(error, 'Không thể tải danh sách Kanji');
  }
}

export async function getKanjiById(id) {
  try {
    if (!USE_FAKE_KANJI) {
      const response = await axiosClient.get(ADMIN_ENDPOINTS.kanjiById(id));
      return getAdminResponseData(response);
    }

    await fakeDelay();
    return { ...getFakeKanji(id).kanji };
  } catch (error) {
    throw getAdminError(error, 'Không thể tải Kanji');
  }
}

export async function createKanji(payload) {
  try {
    if (!USE_FAKE_KANJI) {
      const response = await axiosClient.post(ADMIN_ENDPOINTS.kanji, payload);
      return getAdminResponseData(response);
    }

    await fakeDelay();
    if (hasDuplicateCharacter(payload.character)) {
      throw new Error('Kanji này đã tồn tại');
    }

    const now = new Date().toISOString();
    const kanji = {
      ...payload,
      id: Date.now(),
      status: payload.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'Admin',
      updatedBy: 'Admin',
    };
    mockKanjiList.unshift(kanji);
    return { ...kanji };
  } catch (error) {
    throw getAdminError(error, 'Không thể tạo Kanji');
  }
}

export async function updateKanji(id, payload) {
  try {
    if (!USE_FAKE_KANJI) {
      const response = await axiosClient.put(
        ADMIN_ENDPOINTS.kanjiById(id),
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { index, kanji } = getFakeKanji(id);
    if (
      payload.character &&
      hasDuplicateCharacter(payload.character, kanji.id)
    ) {
      throw new Error('Kanji này đã tồn tại');
    }

    mockKanjiList[index] = {
      ...kanji,
      ...payload,
      id: kanji.id,
      createdAt: kanji.createdAt,
      createdBy: kanji.createdBy,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin',
    };
    return { ...mockKanjiList[index] };
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật Kanji');
  }
}

export async function updateKanjiStatus(id, payload) {
  try {
    if (!['ACTIVE', 'HIDDEN'].includes(payload.status)) {
      throw new Error('Trạng thái Kanji không hợp lệ');
    }

    if (!USE_FAKE_KANJI) {
      const response = await axiosClient.patch(
        ADMIN_ENDPOINTS.kanjiStatus(id),
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { kanji } = getFakeKanji(id);
    const now = new Date().toISOString();
    kanji.status = payload.status;
    kanji.updatedAt = now;
    kanji.updatedBy = 'Admin';

    return {
      id: kanji.id,
      character: kanji.character,
      status: kanji.status,
      updatedAt: now,
      updatedBy: 'Admin',
    };
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật trạng thái Kanji');
  }
}

export async function deleteKanji(id) {
  try {
    if (!USE_FAKE_KANJI) {
      const response = await axiosClient.delete(ADMIN_ENDPOINTS.kanjiById(id));
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { kanji } = getFakeKanji(id);
    kanji.status = 'DELETED';
    kanji.updatedAt = new Date().toISOString();
    kanji.updatedBy = 'Admin';

    return {
      id: kanji.id,
      character: kanji.character,
      status: 'DELETED',
    };
  } catch (error) {
    throw getAdminError(error, 'Không thể xóa Kanji');
  }
}

export async function checkKanjiExists(character) {
  try {
    if (!USE_FAKE_KANJI) {
      const response = await axiosClient.get(`${ADMIN_ENDPOINTS.kanji}/check`, {
        params: { character },
      });
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const existing = mockKanjiList.find(
      (kanji) => kanji.character === character && kanji.status !== 'DELETED'
    );
    if (existing) {
      return {
        exists: true,
        character: existing.character,
        meaning: existing.meaning,
        jlpt: existing.jlptLevel,
      };
    }
    return { exists: false };
  } catch (error) {
    return { exists: false };
  }
}

const adminKanjiService = {
  getKanjiList,
  getKanjiById,
  createKanji,
  updateKanji,
  updateKanjiStatus,
  deleteKanji,
  checkKanjiExists,
};

export default adminKanjiService;
