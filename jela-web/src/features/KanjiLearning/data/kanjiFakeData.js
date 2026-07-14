/**
 * Toàn bộ fake data cho feature KanjiLearning.
 * Cấu trúc khớp hoàn toàn với contract API đã định nghĩa trong nghiệp vụ.
 * Khi BE sẵn sàng, chỉ cần xóa import fake data và sử dụng service thật.
 */

// ─── Flow 1: Cấp độ / Level Hub ──────────────────────────────────────────────
export const fakeLevels = [
  { level: 'N5', totalKanji: 103, learnedKanji: 50, isUnlocked: true,  listId: 901 },
  { level: 'N4', totalKanji: 181, learnedKanji: 12, isUnlocked: true,  listId: null },
  { level: 'N3', totalKanji: 370, learnedKanji: 0,  isUnlocked: true,  listId: null },
  { level: 'N2', totalKanji: 380, learnedKanji: 0,  isUnlocked: false, listId: null },
  { level: 'N1', totalKanji: 600, learnedKanji: 0,  isUnlocked: false, listId: null },
];

// ─── Flow 2: Danh sách Kanji theo cấp độ ─────────────────────────────────────
const allKanji = {
  N5: [
    { id: 1,  character: '水', meaning: 'Thủy, Nước', meaningEn: 'Water',    romaji: 'sui' },
    { id: 2,  character: '火', meaning: 'Hỏa, Lửa', meaningEn: 'Fire',      romaji: 'ka' },
    { id: 3,  character: '木', meaning: 'Mộc, Cây', meaningEn: 'Tree, wood',      romaji: 'moku' },
    { id: 4,  character: '日', meaning: 'Nhật, Ngày', meaningEn: 'Sun, day',    romaji: 'nichi' },
    { id: 5,  character: '月', meaning: 'Nguyệt, Tháng', meaningEn: 'Moon, month', romaji: 'getsu' },
    { id: 6,  character: '山', meaning: 'Sơn, Núi', meaningEn: 'Mountain',      romaji: 'san' },
    { id: 7,  character: '川', meaning: 'Xuyên, Sông', meaningEn: 'River',   romaji: 'sen' },
    { id: 8,  character: '人', meaning: 'Nhân, Người', meaningEn: 'Person',   romaji: 'jin' },
    { id: 9,  character: '口', meaning: 'Khẩu, Miệng', meaningEn: 'Mouth',   romaji: 'kou' },
    { id: 10, character: '目', meaning: 'Mục, Mắt', meaningEn: 'Eye',      romaji: 'moku' },
    { id: 11, character: '耳', meaning: 'Nhĩ, Tai', meaningEn: 'Ear',      romaji: 'ji' },
    { id: 12, character: '手', meaning: 'Thủ, Tay', meaningEn: 'Hand',      romaji: 'shu' },
  ],
  N4: [
    { id: 150, character: '悪', meaning: 'Ác, Xấu', meaningEn: 'Bad, evil',       romaji: 'aku' },
    { id: 151, character: '暗', meaning: 'Ám, Tối', meaningEn: 'Dark',        romaji: 'an' },
    { id: 152, character: '医', meaning: 'Y, Bác sĩ', meaningEn: 'Medicine, doctor',     romaji: 'i' },
    { id: 153, character: '意', meaning: 'Ý, Ý nghĩa', meaningEn: 'Idea, meaning',    romaji: 'i' },
    { id: 154, character: '育', meaning: 'Dục, Nuôi dạy', meaningEn: 'Raise, educate', romaji: 'iku' },
    { id: 155, character: '員', meaning: 'Viên, Thành viên', meaningEn: 'Member', romaji: 'in' },
    { id: 156, character: '院', meaning: 'Viện, Bệnh viện', meaningEn: 'Institution, hospital', romaji: 'in' },
    { id: 157, character: '飲', meaning: 'Ẩm, Uống', meaningEn: 'Drink',       romaji: 'in' },
    { id: 158, character: '運', meaning: 'Vận, Vận chuyển', meaningEn: 'Carry, transport', romaji: 'un' },
    { id: 159, character: '映', meaning: 'Ánh, Chiếu', meaningEn: 'Reflect, project',     romaji: 'ei' },
  ],
  N3: [
    { id: 300, character: '愛', meaning: 'Ái, Tình yêu', meaningEn: 'Love',  romaji: 'ai' },
    { id: 301, character: '安', meaning: 'An, Bình an', meaningEn: 'Peace, safety',   romaji: 'an' },
    { id: 302, character: '案', meaning: 'Án, Kế hoạch', meaningEn: 'Plan, proposal',  romaji: 'an' },
    { id: 303, character: '以', meaning: 'Dĩ, Dùng để', meaningEn: 'By means of',   romaji: 'i' },
    { id: 304, character: '位', meaning: 'Vị, Vị trí', meaningEn: 'Rank, position',    romaji: 'i' },
  ],
  N2: [
    { id: 500, character: '握', meaning: 'Ác, Nắm chặt', meaningEn: 'Grip',  romaji: 'aku' },
    { id: 501, character: '扱', meaning: 'Xử lý', meaningEn: 'Handle, deal with',         romaji: 'atsuka' },
  ],
  N1: [
    { id: 700, character: '哀', meaning: 'Ai, Buồn thương', meaningEn: 'Sorrow', romaji: 'ai' },
    { id: 701, character: '挨', meaning: 'Ải, Chào hỏi', meaningEn: 'Greet',   romaji: 'ai' },
  ],
};

export const fakeKanjiByLevel = (level, page = 0, size = 10) => {
  const list = allKanji[level] || [];
  const total = list.length;
  const totalPages = Math.ceil(total / size) || 1;
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * size;
  const content = list.slice(start, start + size);

  return {
    content,
    pageable: {
      pageNumber: safePage,
      pageSize: size,
      totalElements: total,
      totalPages,
      isLast: safePage >= totalPages - 1,
    },
  };
};

// ─── Flow 3: Kết quả tìm kiếm ────────────────────────────────────────────────
export const fakeSearchResults = (keyword) => {
  if (!keyword?.trim()) return [];
  const q = keyword.toLowerCase();
  const all = Object.values(allKanji).flat();
  return all.filter(
    (k) =>
      k.character.includes(keyword) ||
      k.meaning.toLowerCase().includes(q) ||
      k.meaningEn?.toLowerCase().includes(q) ||
      k.romaji.toLowerCase().includes(q),
  );
};

// ─── Flow 4: Chi tiết Kanji ───────────────────────────────────────────────────
export const fakeKanjiDetails = {
  1: {
    id: 1, character: '水', level: 'N5',
    onyomi: 'スイ', kunyomi: 'みず', romaji: 'sui',
    meaning: 'Thủy, Nước', meaningEn: 'Water', strokeCount: 4,
    vocabularies: [
      { id: 101, word: '水曜日', hiragana: 'すいようび', romaji: 'suiyoubi',   meaning: 'Thứ Tư', meaningEn: 'Wednesday' },
      { id: 102, word: '水道',  hiragana: 'すいどう',   romaji: 'suidou',    meaning: 'Đường ống nước', meaningEn: 'Water supply' },
      { id: 103, word: '冷水',  hiragana: 'れいすい',   romaji: 'reisui',    meaning: 'Nước lạnh', meaningEn: 'Cold water' },
    ],
  },
  2: {
    id: 2, character: '火', level: 'N5',
    onyomi: 'カ', kunyomi: 'ひ', romaji: 'ka',
    meaning: 'Hỏa, Lửa', meaningEn: 'Fire', strokeCount: 4,
    vocabularies: [
      { id: 201, word: '火曜日', hiragana: 'かようび', romaji: 'kayoubi',  meaning: 'Thứ Ba', meaningEn: 'Tuesday' },
      { id: 202, word: '花火',  hiragana: 'はなび',   romaji: 'hanabi',   meaning: 'Pháo hoa', meaningEn: 'Fireworks' },
      { id: 203, word: '火事',  hiragana: 'かじ',     romaji: 'kaji',     meaning: 'Đám cháy', meaningEn: 'Fire' },
    ],
  },
  3: {
    id: 3, character: '木', level: 'N5',
    onyomi: 'モク, ボク', kunyomi: 'き', romaji: 'moku',
    meaning: 'Mộc, Cây', meaningEn: 'Tree, wood', strokeCount: 4,
    vocabularies: [
      { id: 301, word: '木曜日', hiragana: 'もくようび', romaji: 'mokuyoubi', meaning: 'Thứ Năm', meaningEn: 'Thursday' },
      { id: 302, word: '木村',  hiragana: 'きむら',     romaji: 'kimura',    meaning: 'Cây trong làng (tên người)', meaningEn: 'Kimura (surname)' },
      { id: 303, word: '大木',  hiragana: 'たいぼく',   romaji: 'taiboku',   meaning: 'Cây lớn', meaningEn: 'Large tree' },
    ],
  },
  4: {
    id: 4, character: '日', level: 'N5',
    onyomi: 'ニチ, ジツ', kunyomi: 'ひ, か', romaji: 'nichi',
    meaning: 'Nhật, Ngày', meaningEn: 'Sun, day', strokeCount: 4,
    vocabularies: [
      { id: 401, word: '日曜日', hiragana: 'にちようび', romaji: 'nichiyoubi', meaning: 'Chủ Nhật', meaningEn: 'Sunday' },
      { id: 402, word: '日本',  hiragana: 'にほん',     romaji: 'nihon',      meaning: 'Nhật Bản', meaningEn: 'Japan' },
      { id: 403, word: '今日',  hiragana: 'きょう',     romaji: 'kyou',       meaning: 'Hôm nay', meaningEn: 'Today' },
    ],
  },
  5: {
    id: 5, character: '月', level: 'N5',
    onyomi: 'ゲツ, ガツ', kunyomi: 'つき', romaji: 'getsu',
    meaning: 'Nguyệt, Tháng', meaningEn: 'Moon, month', strokeCount: 4,
    vocabularies: [
      { id: 501, word: '月曜日', hiragana: 'げつようび', romaji: 'getsuyoubi', meaning: 'Thứ Hai', meaningEn: 'Monday' },
      { id: 502, word: '一月',  hiragana: 'いちがつ',   romaji: 'ichigatsu',  meaning: 'Tháng Một', meaningEn: 'January' },
      { id: 503, word: '今月',  hiragana: 'こんげつ',   romaji: 'kongetsu',   meaning: 'Tháng này', meaningEn: 'This month' },
    ],
  },
  8: {
    id: 8, character: '人', level: 'N5',
    onyomi: 'ジン, ニン', kunyomi: 'ひと', romaji: 'jin',
    meaning: 'Nhân, Người', meaningEn: 'Person', strokeCount: 2,
    vocabularies: [
      { id: 801, word: '日本人', hiragana: 'にほんじん', romaji: 'nihonjin', meaning: 'Người Nhật Bản', meaningEn: 'Japanese person' },
      { id: 802, word: '大人',  hiragana: 'おとな',     romaji: 'otona',    meaning: 'Người lớn', meaningEn: 'Adult' },
      { id: 803, word: '人口',  hiragana: 'じんこう',   romaji: 'jinkou',   meaning: 'Dân số', meaningEn: 'Population' },
    ],
  },
};

export const getFakeKanjiDetail = (id) => fakeKanjiDetails[id] || null;

// ─── Flow 5: Danh sách học tập ────────────────────────────────────────────────
export const fakeLearningLists = [
  { id: 1, name: 'Kanji N5 ôn tập', itemCount: 20, dueCount: 5, masteredCount: 3, learningCount: 12, newCount: 5, completed: false, updatedAt: '2026-07-08T01:00:00Z' },
  { id: 2, name: 'Từ vựng Kaiwa',   itemCount: 5, dueCount: 0, masteredCount: 5, learningCount: 0, newCount: 0, completed: true, updatedAt: '2026-07-07T12:00:00Z' },
];

// ─── Flow 6: Lịch sử tra cứu ────────────────────────────────────────────────
export const fakeKanjiHistory = [
  { kanjiId: 1,  character: '水', meaning: 'Thủy, Nước',   meaningEn: 'Water',         romaji: 'sui',    viewedAt: '2026-06-28T10:45:00Z' },
  { kanjiId: 8,  character: '人', meaning: 'Nhân, Người',  meaningEn: 'Person',        romaji: 'jin',    viewedAt: '2026-06-28T10:30:00Z' },
  { kanjiId: 4,  character: '日', meaning: 'Nhật, Ngày',   meaningEn: 'Sun, day',       romaji: 'nichi',  viewedAt: '2026-06-27T14:10:00Z' },
  { kanjiId: 2,  character: '火', meaning: 'Hỏa, Lửa',    meaningEn: 'Fire',          romaji: 'ka',     viewedAt: '2026-06-27T09:00:00Z' },
  { kanjiId: 3,  character: '木', meaning: 'Mộc, Cây',    meaningEn: 'Tree, wood',     romaji: 'moku',   viewedAt: '2026-06-26T16:20:00Z' },
  { kanjiId: 5,  character: '金', meaning: 'Kim, Vàng',    meaningEn: 'Gold, metal',    romaji: 'kin',    viewedAt: '2026-06-26T12:00:00Z' },
  { kanjiId: 6,  character: '土', meaning: 'Thổ, Đất',    meaningEn: 'Earth, soil',   romaji: 'do',     viewedAt: '2026-06-25T18:00:00Z' },
  { kanjiId: 7,  character: '山', meaning: 'Sơn, Núi',    meaningEn: 'Mountain',      romaji: 'san',    viewedAt: '2026-06-25T08:30:00Z' },
  { kanjiId: 9,  character: '女', meaning: 'Nữ, Phụ nữ', meaningEn: 'Woman, female', romaji: 'jo',     viewedAt: '2026-06-24T15:00:00Z' },
  { kanjiId: 10, character: '子', meaning: 'Tử, Con cái',  meaningEn: 'Child, son',    romaji: 'shi',    viewedAt: '2026-06-24T10:00:00Z' },
  { kanjiId: 11, character: '口', meaning: 'Khẩu, Miệng', meaningEn: 'Mouth',         romaji: 'kou',    viewedAt: '2026-06-23T20:00:00Z' },
  { kanjiId: 12, character: '大', meaning: 'Đại, To lớn', meaningEn: 'Big, large',    romaji: 'dai',    viewedAt: '2026-06-23T09:00:00Z' },
  { kanjiId: 13, character: '小', meaning: 'Tiểu, Nhỏ',  meaningEn: 'Small, little', romaji: 'shou',   viewedAt: '2026-06-22T14:00:00Z' },
  { kanjiId: 14, character: '上', meaning: 'Thượng, Trên', meaningEn: 'Up, above',   romaji: 'jou',    viewedAt: '2026-06-22T08:00:00Z' },
  { kanjiId: 15, character: '下', meaning: 'Hạ, Dưới',  meaningEn: 'Down, below',   romaji: 'ka',     viewedAt: '2026-06-21T20:00:00Z' },
];
