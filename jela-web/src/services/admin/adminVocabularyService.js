import axiosClient from '../../api/axiosClient';
import { mockVocabularyList } from '../../data/adminMockData';
import {
  ADMIN_ENDPOINTS,
  USE_FAKE_ADMIN,
  fakeDelay,
  getAdminError,
  getAdminResponseData,
} from './adminConfig';

const VOCABULARY_API_BASE = ADMIN_ENDPOINTS.vocabulary;
const USE_FAKE_VOCABULARY = false;

/*
 * Danh sách field được phép gửi lên Backend khi create/update.
 *
 * Mục đích:
 * - Tránh gửi dư field chỉ dùng để hiển thị như id, createdAt, updatedAt.
 * - Tránh gửi field không thuộc request DTO của Backend.
 * - Giữ payload sạch, dễ debug.
 */
const VOCABULARY_FIELDS = [
  'word',
  'kana',
  // 'romaji',
  'meaning',
  // 'partOfSpeech',
  'jlptLevel',
  'topic',
  'exampleJapanese',
  'exampleVietnamese',
  'status',
];

const clone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const getVocabularyResponseData = (response) =>
  getAdminResponseData(getAdminResponseData(response));

/*
 * Chuẩn hóa dữ liệu từ Backend/mock về cùng một model mà FE sử dụng.
 * Hàm này giúp page Admin Vocabulary không bị vỡ UI
 * khi response có tên field hơi khác nhau.
 *
 * Lưu ý:
 * - Đây KHÔNG còn là mapping từ Dictionary API user.
 * - Đây chỉ là lớp bảo vệ nhẹ cho Admin Vocabulary API.
 */
export function normalizeVocabulary(item = {}) {
  const normalizedStatus = String(item.status || 'ACTIVE').toUpperCase();

  return {
    id: item.id ?? item.wordId ?? item.vocabularyId,

    word: item.word ?? item.japanese ?? item.wordText ?? '',

    kana: item.kana ?? item.reading ?? item.kanaReading ?? '',

    romaji: item.romaji ?? item.romanization ?? '',

    meaning:
      item.meaning ??
      item.vietnameseMeaning ??
      item.meaningVi ??
      item.translation ??
      '',

    partOfSpeech:
      item.partOfSpeech ?? item.type ?? item.wordType ?? '',

    jlptLevel:
      item.jlptLevel ?? item.level ?? item.jlpt ?? '',

    topic:
      item.topic ?? item.category ?? item.topicName ?? '',

    exampleJapanese:
      item.exampleJapanese ??
      item.japaneseExample ??
      item.example?.japanese ??
      '',

    exampleVietnamese:
      item.exampleVietnamese ??
      item.vietnameseExample ??
      item.example?.vietnamese ??
      '',

    /*
     * Chuẩn trạng thái dùng trong FE:
     * - ACTIVE: đang hiển thị / đang dùng
     * - HIDDEN: bị ẩn, user thường không thấy
     * - DELETED: mock soft delete, thường không hiển thị
     *
     * LOCKED là tên cũ trong mock/admin cũ.
     * Nếu còn dữ liệu cũ LOCKED thì chuyển về HIDDEN.
     */
    status: normalizedStatus === 'LOCKED' ? 'HIDDEN' : normalizedStatus,

    createdAt: item.createdAt ?? null,
    updatedAt: item.updatedAt ?? null,
    createdBy: item.createdBy ?? null,
    updatedBy: item.updatedBy ?? null,
  };
}

/*
 * Tìm vị trí item trong mock list.
 * Chỉ dùng khi USE_FAKE_ADMIN = true.
 */
const findVocabularyIndex = (id) =>
  mockVocabularyList.findIndex((item) => String(item.id) === String(id));

/*
 * Lấy một từ trong mock list.
 * Nếu không tìm thấy hoặc đã bị soft delete thì báo lỗi.
 */
const getFakeVocabulary = (id) => {
  const index = findVocabularyIndex(id);

  if (index === -1 || mockVocabularyList[index].status === 'DELETED') {
    throw new Error('Không tìm thấy từ vựng');
  }

  return { index, item: mockVocabularyList[index] };
};

/*
 * Chuẩn hóa chuỗi để so sánh/search:
 * - Ép về string
 * - Trim khoảng trắng
 * - Lowercase theo tiếng Việt
 */
const createComparableTerm = (value) =>
  String(value || '').trim().toLocaleLowerCase('vi');


const hasDuplicateVocabulary = (payload, ignoredId = null) => {
  const word = createComparableTerm(payload.word);
  const kana = createComparableTerm(payload.kana);

  return mockVocabularyList.some(
    (item) =>
      String(item.id) !== String(ignoredId) &&
      item.status !== 'DELETED' &&
      createComparableTerm(item.word) === word &&
      createComparableTerm(item.kana) === kana,
  );
};

/*
 * Lọc payload trước khi gửi Backend.
 *
 * Chỉ giữ lại các field nằm trong VOCABULARY_FIELDS.
 * Nhờ vậy FE không gửi nhầm:
 * - id
 * - createdAt
 * - updatedAt
 * - createdBy
 * - updatedBy
 * - pagination field
 */
const toVocabularyPayload = (payload = {}) =>
  Object.fromEntries(
    VOCABULARY_FIELDS.filter((field) =>
      Object.prototype.hasOwnProperty.call(payload, field),
    ).map((field) => [field, payload[field]]),
  );

/*
 * Chuẩn hóa response danh sách từ vựng.
 *
 * Hàm này hỗ trợ nhiều kiểu response phổ biến từ Backend:
 *
 * 1. Trả trực tiếp array:
 * [
 *   { id, word, meaning },
 *   ...
 * ]
 *
 * 2. Trả dạng phân trang tự custom:
 * {
 *   items: [],
 *   pagination: {
 *     page,
 *     limit,
 *     totalItems,
 *     totalPages
 *   }
 * }
 *
 * 3. Trả dạng Spring Page:
 * {
 *   content: [],
 *   page,
 *   size,
 *   totalElements,
 *   totalPages
 * }
 */
const normalizeListResponse = (data = {}, requestedParams = {}) => {
  const rawItems = Array.isArray(data)
    ? data
    : data.items ?? data.content ?? data.results ?? [];

  const page = Math.max(
    1,
    Number(data.pagination?.page ?? data.page ?? requestedParams.page) || 1,
  );

  const limit = Math.max(
    1,
    Number(data.pagination?.limit ?? data.size ?? requestedParams.limit) || 10,
  );

  const totalItems = Number(
    data.pagination?.totalItems ??
      data.totalElements ??
      data.totalItems ??
      rawItems.length,
  );

  const totalPages =
    Number(data.pagination?.totalPages ?? data.totalPages) ||
    Math.ceil(totalItems / limit);

  return {
    items: rawItems.map(normalizeVocabulary),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

/*
 * Lấy danh sách từ vựng cho trang admin.
 *
 * Dùng cho:
 * - Table danh sách từ
 * - Search
 * - Filter theo JLPT level
 * - Filter theo trạng thái
 * - Filter theo loại từ
 * - Filter theo chủ đề
 * - Sort
 *
 * API thật nên là:
 * GET /api/admin/vocabulary
 */
export async function getVocabularyList(params = {}) {
  try {
    const requestParams = {
      page: params.page ?? 1,
      limit: params.limit ?? 10,

      /*
       * keyword dùng cho admin search.
       * Nếu Backend đang dùng searchKey thì có thể đổi keyword thành searchKey.
       * Nhưng nên thống nhất admin API dùng keyword cho dễ hiểu.
       */
      keyword: params.keyword ?? '',

      /*
       * Hỗ trợ cả level contract mới và jlptLevel của UI cũ.
       * Khi gửi lên BE, thống nhất gửi key là level.
       */
      level: params.level ?? params.jlptLevel ?? 'ALL',

      status: params.status ?? 'ALL',
      partOfSpeech: params.partOfSpeech ?? 'ALL',
      topic: params.topic ?? 'ALL',
      sortBy: params.sortBy ?? 'updatedAt',
      sortOrder: params.sortOrder ?? 'desc',
    };

    if (!USE_FAKE_VOCABULARY) {
      const response = await axiosClient.get(VOCABULARY_API_BASE, {
        params: requestParams,
      });

      const data = getVocabularyResponseData(response);
      return normalizeListResponse(data, requestParams);
    }

    /*
     * Mock mode:
     * Dùng khi Backend admin chưa làm xong.
     */
    await fakeDelay();

    const keyword = createComparableTerm(requestParams.keyword);

    let items = mockVocabularyList.map(normalizeVocabulary).filter((item) => {
      /*
       * Item DELETED mặc định không hiện.
       * Chỉ hiện khi admin chủ động filter status = DELETED.
       */
      if (item.status === 'DELETED' && requestParams.status !== 'DELETED') {
        return false;
      }

      const searchableText = [
        item.word,
        item.kana,
        item.romaji,
        item.meaning,
      ]
        .join(' ')
        .toLocaleLowerCase('vi');

      return (
        (!keyword || searchableText.includes(keyword)) &&
        (requestParams.level === 'ALL' ||
          item.jlptLevel === requestParams.level) &&
        (requestParams.status === 'ALL' ||
          item.status === requestParams.status) &&
        (requestParams.partOfSpeech === 'ALL' ||
          item.partOfSpeech === requestParams.partOfSpeech) &&
        (requestParams.topic === 'ALL' || item.topic === requestParams.topic)
      );
    });

    items = [...items].sort((left, right) => {
      const result = String(left[requestParams.sortBy] ?? '').localeCompare(
        String(right[requestParams.sortBy] ?? ''),
        'vi',
        { numeric: true },
      );

      return requestParams.sortOrder === 'asc' ? result : -result;
    });

    const page = Math.max(1, Number(requestParams.page) || 1);
    const limit = Math.max(1, Number(requestParams.limit) || 10);
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;

    return {
      items: clone(items.slice(start, start + limit)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  } catch (error) {
    throw getAdminError(error, 'Không thể tải danh sách từ vựng');
  }
}

/*
 * Lấy chi tiết một từ vựng cho admin xem/sửa.
 *
 * API thật:
 * GET /api/admin/vocabulary/{id}
 */
export async function getVocabularyById(id) {
  try {
    if (!USE_FAKE_VOCABULARY) {
      const response = await axiosClient.get(
        ADMIN_ENDPOINTS.vocabularyById(id),
      );

      return normalizeVocabulary(getVocabularyResponseData(response));
    }

    await fakeDelay();

    return normalizeVocabulary(clone(getFakeVocabulary(id).item));
  } catch (error) {
    throw getAdminError(error, 'Không thể tải thông tin từ vựng');
  }
}

/*
 * Tạo từ vựng mới.
 *
 * API thật:
 * POST /api/admin/vocabulary
 *
 * Backend nên validate:
 * - word không rỗng
 * - meaning không rỗng
 * - không trùng word + kana
 * - level hợp lệ nếu có
 */
export async function createVocabulary(payload) {
  try {
    const cleanPayload = toVocabularyPayload(payload);

    if (!USE_FAKE_VOCABULARY) {
      const response = await axiosClient.post(
        VOCABULARY_API_BASE,
        cleanPayload,
      );

      return normalizeVocabulary(getVocabularyResponseData(response));
    }

    await fakeDelay();

    if (hasDuplicateVocabulary(cleanPayload)) {
      throw new Error('Từ vựng có cùng từ và cách đọc đã tồn tại');
    }

    const now = new Date().toISOString();

    const newItem = normalizeVocabulary({
      ...cleanPayload,
      id: Date.now(),
      status: cleanPayload.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      createdBy: 'Admin',
      updatedBy: 'Admin',
    });

    mockVocabularyList.unshift(newItem);

    return clone(newItem);
  } catch (error) {
    throw getAdminError(error, 'Không thể tạo từ vựng');
  }
}

/*
 * Cập nhật thông tin từ vựng.
 *
 * API thật:
 * PUT /api/admin/vocabulary/{id}
 *
 * Chỉ gửi các field nằm trong VOCABULARY_FIELDS.
 * Không gửi id, createdAt, updatedAt lên Backend.
 */
export async function updateVocabulary(id, payload) {
  try {
    const cleanPayload = toVocabularyPayload(payload);

    if (!USE_FAKE_VOCABULARY) {
      const response = await axiosClient.put(
        ADMIN_ENDPOINTS.vocabularyById(id),
        cleanPayload,
      );

      return normalizeVocabulary(getVocabularyResponseData(response));
    }

    await fakeDelay();

    const { index, item } = getFakeVocabulary(id);

    if (hasDuplicateVocabulary(cleanPayload, id)) {
      throw new Error('Từ vựng có cùng từ và cách đọc đã tồn tại');
    }

    mockVocabularyList[index] = normalizeVocabulary({
      ...item,
      ...cleanPayload,
      id: item.id,
      createdAt: item.createdAt,
      createdBy: item.createdBy,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin',
    });

    return clone(mockVocabularyList[index]);
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật từ vựng');
  }
}

/*
 * Cập nhật trạng thái từ vựng.
 *
 * API thật:
 * PATCH /api/admin/vocabulary/{id}/status
 *
 * Status FE đang dùng:
 * - ACTIVE: từ đang hoạt động
 * - HIDDEN: từ bị ẩn khỏi phía user
 *
 * Không nên xóa cứng ngay nếu từ đã liên kết với:
 * - lịch sử tra từ
 * - danh sách yêu thích
 * - flashcard
 * - danh sách học của user
 */
export async function updateVocabularyStatus(id, payload = {}) {
  try {
    const nextStatus =
      typeof payload === 'string'
        ? payload
        : payload.status;

    const normalizedStatus =
      nextStatus === 'LOCKED' ? 'HIDDEN' : String(nextStatus).toUpperCase();

    if (!['ACTIVE', 'HIDDEN'].includes(normalizedStatus)) {
      throw new Error('Trạng thái từ vựng chỉ nhận ACTIVE hoặc HIDDEN');
    }

    const cleanPayload = {
      status: normalizedStatus,
    };

    if (!USE_FAKE_VOCABULARY) {
      const response = await axiosClient.patch(
        ADMIN_ENDPOINTS.vocabularyStatus(id),
        cleanPayload,
      );

      return normalizeVocabulary(getVocabularyResponseData(response));
    }

    await fakeDelay();

    const { item } = getFakeVocabulary(id);

    item.status = normalizedStatus;
    item.updatedAt = new Date().toISOString();
    item.updatedBy = 'Admin';

    return normalizeVocabulary(clone(item));
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật trạng thái từ vựng');
  }
}

/*
 * Xóa từ vựng.
 *
 * API thật:
 * DELETE /api/admin/vocabulary/{id}
 *
 * Gợi ý nghiệp vụ:
 * - Nếu Backend đã có quan hệ với user history/favorite/learning list,
 *   KHÔNG nên hard delete.
 * - Backend nên chuyển status thành DELETED hoặc HIDDEN.
 *
 * Ở mock mode, ta dùng soft delete bằng status = DELETED.
 */
export async function deleteVocabulary(id) {
  try {
    if (!USE_FAKE_VOCABULARY) {
      const response = await axiosClient.delete(
        ADMIN_ENDPOINTS.vocabularyById(id),
      );

      return getVocabularyResponseData(response);
    }

    await fakeDelay();

    const { item } = getFakeVocabulary(id);

    item.status = 'DELETED';
    item.updatedAt = new Date().toISOString();
    item.updatedBy = 'Admin';

    return {
      id: item.id,
      status: 'DELETED',
    };
  } catch (error) {
    throw getAdminError(error, 'Không thể xóa từ vựng');
  }
}

/*
 * Object export mặc định cho page import gọn hơn.
 *
 * toggleVocabularyStatus là tên cũ.
 * Giữ lại tạm thời để tránh vỡ code ở những component cũ.
 * Sau khi migrate xong toàn bộ UI, có thể xóa alias này.
 */
export async function checkVocabularyExists(word, kana) {
  try {
    if (!USE_FAKE_VOCABULARY) {
      const response = await axiosClient.get(`${VOCABULARY_API_BASE}/check`, {
        params: { word, kana },
      });
      return getAdminResponseData(response);
    }
    await fakeDelay();
    const existing = mockVocabularyList.find(
      (item) =>
        item.status !== 'DELETED' &&
        createComparableTerm(item.word) === createComparableTerm(word) &&
        createComparableTerm(item.kana) === createComparableTerm(kana)
    );
    if (existing) {
      return {
        exists: true,
        word: existing.word,
        kana: existing.kana,
        meaning: existing.meaning,
        jlpt: existing.jlptLevel,
      };
    }
    return { exists: false };
  } catch (error) {
    return { exists: false };
  }
}

const adminVocabularyService = {
  getVocabularyList,
  getVocabularyById,
  createVocabulary,
  updateVocabulary,
  updateVocabularyStatus,
  deleteVocabulary,
  checkVocabularyExists,

  // Alias cũ, giữ tạm để tương thích ngược.
  toggleVocabularyStatus: (id, status) =>
    updateVocabularyStatus(id, {
      status: status === 'LOCKED' ? 'HIDDEN' : status,
    }),
};

export default adminVocabularyService;