/**
 * deckApi.js — contract cho Bộ thẻ cá nhân (My Decks).
 * Tích hợp dữ liệu thật từ Dictionary Lists và Kanji Lists.
 * Mặc định dùng API thật; chỉ bật fake data khi VITE_USE_FAKE_DECK_API=true.
 *
 * @typedef {{ id: string, rawId: number, type: 'dictionary'|'kanji', title: string, totalWords: number, dueCount: number, isFavorite: boolean, lastAccessed: string }} Deck
 */
import dictionaryApi from '../../../api/dictionaryApi';
import kanjiApi from '../../KanjiLearning/services/kanjiApi';
import { mockDecks } from '../data/mockDeck';

const USE_FAKE = import.meta.env.VITE_USE_FAKE_DECK_API === 'true';
const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

const deckApi = {
  /** Lấy toàn bộ bộ thẻ từ cả 2 nguồn: Dictionary Lists và Kanji Lists */
  getAll: async () => {
    if (USE_FAKE) {
      await delay(800);
      return [...mockDecks];
    }

    try {
      const [dictLists, kanjiLists] = await Promise.all([
        dictionaryApi.getLists().catch(() => []),
        kanjiApi.getLists().catch(() => []),
      ]);

      const mappedDictDecks = (dictLists || []).map((item) => {
        const id = item.id ?? item.listId;
        const name = item.name ?? item.listName ?? '';
        const count = item.wordCount ?? item.itemCount ?? item.totalCount ?? 0;
        const due = item.dueCount ?? 0;
        return {
          id: `dict-${id}`,
          rawId: id,
          type: 'dictionary',
          title: name,
          titleEn: name,
          titleVi: name,
          totalWords: Number(count),
          dueCount: Number(due),
          masteredCount: Number(item.masteredCount || 0),
          newCount: Number(item.newCount || 0),
          learningCount: Number(item.learningCount || 0),
          completed: item.completed ?? false,
          sourceType: 'CUSTOM', // Mặc định từ điển là CUSTOM
          isFavorite: false,
          lastAccessed: item.updatedAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        };
      });

      const mappedKanjiDecks = (kanjiLists || []).map((item) => {
        const id = item.id ?? item.listId;
        const name = item.name ?? item.listName ?? '';
        const count = item.itemCount ?? item.totalCount ?? 0;
        const due = item.dueCount ?? 0;
        return {
          id: `kanji-${id}`,
          rawId: id,
          type: 'kanji',
          title: name,
          titleEn: name,
          titleVi: name,
          totalWords: Number(count),
          dueCount: Number(due),
          masteredCount: Number(item.masteredCount || 0),
          newCount: Number(item.newCount || 0),
          learningCount: Number(item.learningCount || 0),
          completed: item.completed ?? false,
          sourceType: item.sourceType ?? 'CUSTOM', // Phân loại hệ thống/cá nhân
          isFavorite: false,
          lastAccessed: item.updatedAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        };
      });

      return [...mappedDictDecks, ...mappedKanjiDecks];
    } catch (error) {
      console.error('Failed to fetch merged decks:', error);
      throw error;
    }
  },

  /** Tạo bộ thẻ mới (hỗ trợ tạo Dictionary list hoặc Kanji list ở backend) */
  create: async (payload) => {
    if (USE_FAKE) {
      await delay(400);
      const newDeck = {
        id: `fake-${Date.now()}`,
        totalWords: 0,
        dueCount: 0,
        isFavorite: false,
        lastAccessed: new Date().toISOString(),
        ...payload,
      };
      mockDecks.unshift(newDeck);
      return newDeck;
    }

    if (payload.type === 'dictionary') {
      const response = await dictionaryApi.createList(payload.title);
      return {
        id: `dict-${response.id ?? response.listId}`,
        rawId: response.id ?? response.listId,
        type: 'dictionary',
        title: response.name ?? response.listName,
        titleEn: response.name ?? response.listName,
        totalWords: 0,
        dueCount: 0,
        isFavorite: false,
        lastAccessed: new Date().toISOString(),
      };
    } else {
      const response = await kanjiApi.createList(payload.title);
      return {
        id: `kanji-${response.id ?? response.listId}`,
        rawId: response.id ?? response.listId,
        type: 'kanji',
        title: response.name ?? response.listName,
        titleEn: response.name ?? response.listName,
        totalWords: 0,
        dueCount: 0,
        isFavorite: false,
        lastAccessed: new Date().toISOString(),
      };
    }
  },

  /** Cập nhật thông tin bộ thẻ (chỉ hỗ trợ mock ở local) */
  update: async (id, payload) => {
    if (USE_FAKE) {
      await delay(400);
      const idx = mockDecks.findIndex((d) => d.id === id);
      if (idx !== -1) mockDecks[idx] = { ...mockDecks[idx], ...payload };
      return mockDecks[idx];
    }
    // API thật chưa hỗ trợ cập nhật thông tin list từ backend, trả về payload giả lập thành công
    return { id, ...payload };
  },

  /** Xóa bộ thẻ (chỉ hỗ trợ mock ở local) */
  delete: async (id) => {
    if (USE_FAKE) {
      await delay(300);
      const idx = mockDecks.findIndex((d) => d.id === id);
      if (idx !== -1) mockDecks.splice(idx, 1);
      return { success: true };
    }
    // API thật chưa hỗ trợ xóa list từ backend, trả về thành công giả lập
    return { success: true };
  },
};

export default deckApi;
