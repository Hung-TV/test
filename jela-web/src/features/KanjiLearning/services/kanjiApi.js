/**
 * kanjiApi — contract HTTP cho toàn bộ Kanji và Kanji List endpoint.
 * Mặc định dùng API thật. Đặt VITE_USE_FAKE_KANJI_API=true để dùng dữ liệu giả khi cần demo offline.
 */
import axiosClient from '../../../api/axiosClient';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import {
  fakeLevels,
  fakeKanjiByLevel,
  fakeSearchResults,
  getFakeKanjiDetail,
  fakeKanjiHistory,
  fakeLearningLists,
} from '../data/kanjiFakeData';

// ── Công tắc fake/real lấy từ biến môi trường ───────────────────────────────
const USE_FAKE = import.meta.env.VITE_USE_FAKE_KANJI_API === 'true';

// ── Helpers ───────────────────────────────────────────────────────────────────
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

let _fakeLists = null;
let _fakeNextId = 10;

const getFakeLists = () => {
  if (!_fakeLists) {
    _fakeLists = [...fakeLearningLists];
  }
  return _fakeLists;
};

// ── kanjiApi ──────────────────────────────────────────────────────────────────
export const kanjiApi = {
  /** GET /api/kanji */
  async getLevels() {
    if (USE_FAKE) {
      await delay();
      return fakeLevels;
    }
    const response = await axiosClient.get(API_ENDPOINTS.kanji.levels);
    if (Array.isArray(response)) {
      return response.map(item => ({
        level: item.level,
        totalKanji: item.totalKanji ?? 0,
        learnedKanji: item.learnedKanji ?? 0,
        isUnlocked: item.isUnlocked ?? true,
        listId: item.listId ?? null,
      }));
    }
    return response;
  },

  /** GET /api/kanji/list?level=N5&page=1 - Backend sử dụng page 1-indexed */
  async getKanjiByLevel(level, page = 0, size = 10) {
    if (USE_FAKE) {
      await delay(300);
      return fakeKanjiByLevel(level, page, size);
    }
    const backendPage = page + 1;
    const response = await axiosClient.get(API_ENDPOINTS.kanji.list, { params: { level, page: backendPage, size } });
    // Backend có thể trả về totalPages ở cấp root thay vì trong pageable
    const totalPages    = response?.totalPages    ?? response?.pageable?.totalPages    ?? 1;
    const totalElements = response?.totalElements ?? response?.pageable?.totalElements ?? 0;
    const pageNumber    = response?.number        ?? response?.pageable?.pageNumber    ?? page;
    
    const rawContent = response?.content ?? [];
    const mappedContent = rawContent.map((item) => ({
      id: item.id,
      character: item.character,
      meaning: item.meaning,
      strokeCount: item.strokeCount,
      romaji: item.reading || '',
    }));

    return {
      content: mappedContent,
      pageable: {
        pageNumber,
        pageSize:      response?.size    ?? size,
        totalElements,
        totalPages,
        isLast: pageNumber >= totalPages - 1,
      },
    };
  },

  /** GET /api/kanji/search?searchKey=... */
  async searchKanji(keyword) {
    if (USE_FAKE) {
      await delay(200);
      return fakeSearchResults(keyword);
    }
    const list = await axiosClient.get(API_ENDPOINTS.kanji.search, { params: { searchKey: keyword } });
    return (list || []).map((item) => ({
      id: item.id,
      character: item.character,
      meaning: item.meaning,
      level: item.level,
      romaji: item.reading || '',
    }));
  },

  /** GET /api/kanji/:id */
  async getKanjiDetail(id) {
    if (USE_FAKE) {
      await delay(300);
      const detail = getFakeKanjiDetail(id);
      if (!detail) throw new Error('Không tìm thấy Kanji');
      return detail;
    }
    const response = await axiosClient.get(API_ENDPOINTS.kanji.detail(id));
    
    // Ánh xạ danh sách từ vựng mẫu riêng biệt theo âm On và âm Kun từ Backend
    const exampleOn = response?.on || [];
    const exampleKun = response?.kun || [];
    
    const vocabOn = exampleOn.map((item) => ({
      id: item.id,
      word: item.word,
      hiragana: item.hiragana,
      romaji: '',
      meaning: item.meaning,
      meaningEn: item.meaning,
    }));

    const vocabKun = exampleKun.map((item) => ({
      id: item.id,
      word: item.word,
      hiragana: item.hiragana,
      romaji: '',
      meaning: item.meaning,
      meaningEn: item.meaning,
    }));

    return {
      id: response.id,
      character: response.character,
      level: response.level, // Backend trả về level trực tiếp
      meaning: response.meaning,
      meaningEn: response.meaning,
      onyomi: response.onyomi, // Backend trả về onyomi (List)
      kunyomi: response.kunyomi, // Backend trả về kunyomi (List)
      romaji: response.reading, // Backend trả về reading (Sino-Vietnamese), ánh xạ sang romaji của FE
      strokeCount: response.strokeCount, // Backend trả về strokeCount trực tiếp
      radical: response.radical,
      vocabulariesOn: vocabOn,
      vocabulariesKun: vocabKun,
      vocabularies: [...vocabOn, ...vocabKun], // Fallback tương thích ngược
    };
  },

  /** GET /api/me/kanji-history?page=1 */
  async getKanjiHistory(page = 0, size = 10) {
    if (USE_FAKE) {
      await delay(300);
      const start       = page * size;
      const items       = fakeKanjiHistory.slice(start, start + size);
      const totalItems  = fakeKanjiHistory.length;
      const totalPages  = Math.ceil(totalItems / size) || 1;
      return {
        items,
        pageable: {
          pageNumber:    page,
          pageSize:      size,
          totalElements: totalItems,
          totalPages,
          isLast:        page >= totalPages - 1,
        },
      };
    }
    const backendPage = page + 1; // Backend dùng 1-indexed
    const response = await axiosClient.get(API_ENDPOINTS.kanji.history, {
      params: { page: backendPage, size },
      skipAuthLogout: true,
    });
    
    // Map response của Backend sang cấu trúc Frontend yêu cầu
    const list          = response?.hisKanjiList ?? response?.content ?? [];
    const totalPages    = response?.totalPages    ?? 1;
    const totalElements = response?.totalRecords  ?? response?.totalElements ?? list.length;
    const pageNumber    = backendPage - 1; // backend dùng 1-indexed, FE dùng 0-indexed
    return {
      items: list.map(item => ({
        kanjiId:   item.id,
        character: item.character,
        meaning:   item.meaning ?? '',
        romaji:    item.romaji  ?? '',
        viewedAt:  item.searchedAt ?? item.viewedAt,
      })),
      pageable: {
        pageNumber,
        pageSize:      size,
        totalElements,
        totalPages,
        isLast: pageNumber >= totalPages - 1,
      },
    };
  },

  // ─── Danh sách học Kanji (Kanji Lists) ──────────────────────────────────────

  /** GET /api/me/kanji-list/all */
  async getLists() {
    if (USE_FAKE) {
      await delay();
      return [...getFakeLists()];
    }
    const response = await axiosClient.get(API_ENDPOINTS.kanji.lists, { skipAuthLogout: true });
    if (Array.isArray(response)) {
      return response.map(item => ({
        id: item.listId ?? item.id,
        name: item.listName ?? item.name,
        sourceType: item.sourceType ?? 'CUSTOM',
        itemCount: item.totalCount ?? item.itemCount ?? 0,
        dueCount: item.dueCount ?? 0,
        masteredCount: item.masteredCount ?? 0,
        newCount: item.newCount ?? 0,
        learningCount: item.learningCount ?? 0,
        completed: item.completed ?? false,
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));
    }
    return [];
  },

  async getListDetails(id, page = 1, size = 10) {
    return axiosClient.get(API_ENDPOINTS.kanji.listDetails(id), {
      params: { page, size }
    });
  },

  async getLearnSession(id, batchSize) {
    return axiosClient.get(API_ENDPOINTS.kanji.learnSession(id), {
      params: { batchSize }
    });
  },

  /** POST /api/me/kanji-list/create  body: { name } */
  async createList(name) {
    if (USE_FAKE) {
      await delay(300);
      const newList = { id: _fakeNextId++, name, itemCount: 0 };
      _fakeLists = [...getFakeLists(), newList];
      return newList;
    }
    return axiosClient.post(API_ENDPOINTS.kanji.createList, { name }, { skipAuthLogout: true });
  },

  /** POST /api/me/kanji-list/{listId}/items  body: { kanjiId } */
  async addKanji(listId, kanjiId) {
    if (USE_FAKE) {
      await delay(300);
      _fakeLists = getFakeLists().map((l) =>
        l.id === listId ? { ...l, itemCount: (l.itemCount || 0) + 1 } : l
      );
      return {
        status: 'success',
        message: 'Đã thêm Kanji vào danh sách thành công.',
        data: { listId, kanjiId },
      };
    }
    return axiosClient.post(
      API_ENDPOINTS.kanji.addKanji(listId),
      { kanjiId },
      { skipAuthLogout: true }
    );
  },

  async getReviewSession(id, batchSize = 10) {
    if (USE_FAKE) {
      await delay(300);
      return { questions: [] };
    }
    return axiosClient.get(API_ENDPOINTS.kanji.reviewSession(id), {
      params: { batchSize }
    });
  },

  async explainAnswerStream(correctCharacter, selectedCharacter, onChunk) {
    if (USE_FAKE) {
      await delay(400);
      onChunk('Đây là giải thích giả lập cho lỗi sai.');
      return;
    }
    return axiosClient.post(API_ENDPOINTS.kanji.explainReview, {
      correctCharacter,
      selectedCharacter
    }, { timeout: 60000 });
  },

  async submitReview(listId, reviews) {
    if (USE_FAKE) {
      await delay(300);
      return { status: 'success' };
    }
    return axiosClient.post(API_ENDPOINTS.kanji.submitReview(listId), { reviews });
  },

  /** POST /api/me/kanji-list/levels/{level}/start */
  async startJlptLevel(level) {
    if (USE_FAKE) {
      await delay(500);
      // Fake: tạo list giả và trả về listId mô phỏng
      const fakeListId = 900 + ['N5','N4','N3','N2','N1'].indexOf(level);
      _fakeLists = getFakeLists().map(l => l);
      return { listId: fakeListId, listName: `JLPT ${level}` };
    }
    return axiosClient.post(API_ENDPOINTS.kanji.startLevel(level));
  },
};

export default kanjiApi;
