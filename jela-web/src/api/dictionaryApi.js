import axiosClient from './axiosClient';
import { API_ENDPOINTS } from './apiConfig';

// Module này chỉ chịu trách nhiệm mô tả contract HTTP của Dictionary.
// Query state, cache và toast sẽ được xử lý ở hooks/components ở bước UI sau.
export const dictionaryApi = {
  search(searchKey, language) {
    return axiosClient.get(API_ENDPOINTS.dictionary.search, {
      params: { searchKey, lang: language },
    });
  },

  getDetail(id, language) {
    return axiosClient.get(API_ENDPOINTS.dictionary.detail(id), {
      params: { lang: language },
    });
  },

  getLists() {
    return axiosClient.get(API_ENDPOINTS.dictionary.lists);
  },

  addWordToList({ listId, wordId }) {
    return axiosClient.put(
      API_ENDPOINTS.dictionary.addWordToList,
      { listId, wordId },
      {
        // Để DictionaryPage tự hiển thị thông báo 401 theo đúng nghiệp vụ
        // "Vui lòng đăng nhập để lưu từ vựng".
        skipAuthLogout: true,
      },
    );
  },

  addWordToNewList({ listName, wordId }) {
    return axiosClient.put(
      API_ENDPOINTS.dictionary.addWordToNewList,
      { listName, wordId },
      { skipAuthLogout: true },
    );
  },

  getListDetails(id, page = 1, size = 10) {
    return axiosClient.get(API_ENDPOINTS.dictionary.listDetails(id), {
      params: { page, size }
    });
  },

  getHistory(page = 1, language) {
    return axiosClient.get(API_ENDPOINTS.dictionary.history, {
      params: { page, lang: language },
      // History tự hiển thị trạng thái chưa đăng nhập, không ép toàn app logout.
      skipAuthLogout: true,
    });
  },

  createList(name) {
    return axiosClient.post(API_ENDPOINTS.dictionary.createList, { name }, { skipAuthLogout: true });
  },

  getLearnSession(id, batchSize = 10) {
    return axiosClient.get(API_ENDPOINTS.dictionary.learnSession(id), {
      params: { batchSize }
    });
  },

  submitReview(id, reviews) {
    return axiosClient.post(API_ENDPOINTS.dictionary.submitReview(id), { reviews });
  },

  getReviewSession(id, batchSize = 10) {
    return axiosClient.get(API_ENDPOINTS.dictionary.reviewSession(id), {
      params: { batchSize }
    });
  },

  async explainReviewStream(correctWord, selectedWord, questionType, onChunk) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const token = localStorage.getItem('accessToken')?.trim();
    const res = await fetch(`${API_BASE_URL}/me/dictionary-lists/review/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ correctWord, selectedWord, questionType }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }
  }
};

export default dictionaryApi;
