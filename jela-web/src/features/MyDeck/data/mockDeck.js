/**
 * mockDeck.js — dữ liệu giả lập cho tính năng Bộ thẻ cá nhân.
 * Khi BE sẵn sàng: xóa file này và thay bằng gọi axiosClient thật.
 */

/** @type {import('../services/deckApi').Deck[]} */
export const mockDecks = [
  {
    id: 1,
    title: 'Từ vựng N5 — Thiên nhiên',
    titleEn: 'N5 Vocabulary — Nature',
    totalWords: 103,
    dueCount: 18,
    isFavorite: true,
    lastAccessed: '2026-06-28T07:30:00Z',
  },
  {
    id: 2,
    title: 'Động từ thông dụng N4',
    titleEn: 'Common N4 Verbs',
    totalWords: 181,
    dueCount: 5,
    isFavorite: true,
    lastAccessed: '2026-06-27T21:15:00Z',
  },
  {
    id: 3,
    title: 'Kanji chủ đề Gia đình',
    titleEn: 'Family Kanji',
    totalWords: 48,
    dueCount: 12,
    isFavorite: false,
    lastAccessed: '2026-06-27T14:00:00Z',
  },
  {
    id: 4,
    title: 'Từ vựng JLPT N3 — Cảm xúc',
    titleEn: 'JLPT N3 Vocabulary — Emotions',
    totalWords: 230,
    dueCount: 0,
    isFavorite: false,
    lastAccessed: '2026-06-26T09:45:00Z',
  },
  {
    id: 5,
    title: 'Mẫu câu giao tiếp hàng ngày',
    titleEn: 'Everyday Conversation Patterns',
    totalWords: 65,
    dueCount: 3,
    isFavorite: true,
    lastAccessed: '2026-06-25T18:20:00Z',
  },
  {
    id: 6,
    title: 'Hán tự theo bộ thủ — Nước & Lửa',
    titleEn: 'Kanji Radicals — Water & Fire',
    totalWords: 40,
    dueCount: 22,
    isFavorite: false,
    lastAccessed: '2026-06-24T11:00:00Z',
  },
];
