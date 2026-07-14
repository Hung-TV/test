// Dữ liệu mẫu được tách khỏi JSX để sau này thay bằng response API mà không cần
// sửa cấu trúc component hoặc CSS của Dashboard.
export const learningModules = [
  {
    character: 'あ',
    reading: "'A'",
    title: 'Nguyên âm: Giai đoạn 1',
    description: 'Làm chủ nền tảng phát âm tiếng Nhật.',
    duration: '5 phút',
    category: 'LUYỆN VIẾT',
  },
  {
    character: 'か',
    reading: "'KA'",
    title: 'Phụ âm: Hàng K',
    description: 'Bổ sung phụ âm vào nền tảng từ vựng của bạn.',
    duration: '8 phút',
    category: 'NGỮ PHÁP',
  },
];

export const recentWords = [
  { japanese: '食べる', reading: 'TABERU', meaning: 'Ăn' },
  { japanese: '勉強', reading: 'BENKYOU', meaning: 'Học tập' },
  { japanese: '日本語', reading: 'NIHONGO', meaning: 'Tiếng Nhật' },
];

export const navigationItems = [
  { to: '/', label: 'Tổng quan', icon: 'dashboard', end: true },
  { to: '/roadmap', label: 'Lộ trình', icon: 'roadmap' },
  { to: '/dictionary', label: 'Từ điển', icon: 'dictionary' },
  { to: '/kanji', label: 'Hán tự', icon: 'kanji' },
  { to: '/my-decks', label: 'Danh sách học', icon: 'myDecks' },
];
