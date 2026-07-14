export const MOCK_STUDENTS = [
  {
    id: 1,
    fullName: 'Nguyễn Văn A',
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
    email: 'nva@example.com',
    role: 'USER',
    level: 'N5',
    progress: '45%',
    status: 'active',
    joined: '01/06/2026',
    createdAt: '01/06/2026',
    lastLoginAt: '06/07/2026',
    stats: { kanji: 120, vocab: 350, quiz: 24, avgScore: 8.5 },
  },
  {
    id: 2,
    fullName: 'Trần Thị B',
    avatarUrl: 'https://i.pravatar.cc/150?u=2',
    email: 'ttb@example.com',
    role: 'TUTOR',
    level: 'N4',
    progress: '80%',
    status: 'active',
    joined: '10/05/2026',
    createdAt: '10/05/2026',
    lastLoginAt: '05/07/2026',
    stats: { kanji: 400, vocab: 1200, quiz: 56, avgScore: 9.2 },
  },
  {
    id: 3,
    fullName: 'Lê Văn C',
    avatarUrl: 'https://i.pravatar.cc/150?u=3',
    email: 'lvc@example.com',
    role: 'USER',
    level: 'N5',
    progress: '15%',
    status: 'locked',
    lockedAt: '04/07/2026',
    lockReason: 'Vi phạm tiêu chuẩn cộng đồng',
    joined: '22/04/2026',
    createdAt: '22/04/2026',
    lastLoginAt: '02/07/2026',
    stats: { kanji: 20, vocab: 50, quiz: 3, avgScore: 5.5 },
  },
  {
    id: 4,
    fullName: 'Phạm Thị D',
    avatarUrl: 'https://i.pravatar.cc/150?u=4',
    email: 'ptd@example.com',
    role: 'ADMIN',
    level: 'N3',
    progress: '60%',
    status: 'active',
    joined: '15/03/2026',
    createdAt: '15/03/2026',
    lastLoginAt: '06/07/2026',
    stats: { kanji: 650, vocab: 2100, quiz: 89, avgScore: 7.8 },
  },
  {
    id: 5,
    fullName: 'Hoàng Văn E',
    avatarUrl: 'https://i.pravatar.cc/150?u=5',
    email: 'hve@example.com',
    role: 'USER',
    level: 'N2',
    progress: '95%',
    status: 'active',
    joined: '08/02/2026',
    createdAt: '08/02/2026',
    lastLoginAt: '06/07/2026',
    stats: { kanji: 1100, vocab: 4500, quiz: 120, avgScore: 8.9 },
  },
];

export const MOCK_ADMIN_LOGS = {
  2: [
    { id: 1, date: '10/06/2026 14:30', admin: 'Lý Gia Huy', action: 'Đổi Role', oldValue: 'USER', newValue: 'TUTOR', reason: 'Nâng cấp tài khoản giáo viên' }
  ],
  3: [
    { id: 2, date: '04/07/2026 09:15', admin: 'Lý Gia Huy', action: 'Khóa tài khoản', oldValue: 'active', newValue: 'locked', reason: 'Vi phạm tiêu chuẩn cộng đồng nhiều lần' }
  ],
  4: [
    { id: 3, date: '20/03/2026 10:00', admin: 'System', action: 'Đổi Role', oldValue: 'USER', newValue: 'ADMIN', reason: 'Khởi tạo tài khoản quản trị' }
  ]
};

export const MOCK_STUDENT_HISTORY = {
  1: [
    { id: 101, activity: 'Hoàn thành Quiz N5 - Bài 1', date: '06/07/2026', score: '9/10' },
    { id: 102, activity: 'Học 20 Kanji mới', date: '05/07/2026', score: '-' },
    { id: 103, activity: 'Hoàn thành Quiz N5 - Bài 2', date: '04/07/2026', score: '8/10' },
  ],
  2: [
    { id: 201, activity: 'Thi thử JLPT N4', date: '02/07/2026', score: '125/180' },
    { id: 202, activity: 'Học 50 Từ vựng', date: '01/07/2026', score: '-' },
  ],
  3: [],
  4: [
    { id: 401, activity: 'Luyện nghe N3', date: '06/07/2026', score: '-' },
    { id: 402, activity: 'Hoàn thành Quiz Ngữ pháp N3', date: '05/07/2026', score: '10/10' },
  ],
  5: [
    { id: 501, activity: 'Thi thử JLPT N2', date: '01/07/2026', score: '160/180' },
  ]
};

export const MOCK_KANJIS = [
  {
    id: 1,
    kanji: '日',
    meaning: 'Mặt trời / Ngày',
    onyomi: 'ニチ, ジツ',
    kunyomi: 'ひ, -び, -か',
    level: 'N5',
    strokes: 4,
    radical: '日',
    suggestedVocab: '日本 (Nhật Bản) - にほん\n日曜日 (Chủ Nhật) - にちようび',
    status: 'active'
  },
  {
    id: 2,
    kanji: '月',
    meaning: 'Mặt trăng / Tháng',
    onyomi: 'ゲツ, ガツ',
    kunyomi: 'つき',
    level: 'N5',
    strokes: 4,
    radical: '月',
    suggestedVocab: '今月 (Tháng này) - こんげつ\n月曜日 (Thứ Hai) - げつようび',
    status: 'active'
  },
  {
    id: 3,
    kanji: '愛',
    meaning: 'Tình yêu / Ái',
    onyomi: 'アイ',
    kunyomi: 'いと.しい',
    level: 'N3',
    strokes: 13,
    radical: '心',
    suggestedVocab: '愛する (Yêu) - あいする\n可愛い (Đáng yêu) - かわいい',
    status: 'active'
  },
  {
    id: 4,
    kanji: '水',
    meaning: 'Nước / Thủy',
    onyomi: 'スイ',
    kunyomi: 'みず',
    level: 'N5',
    strokes: 4,
    radical: '水',
    suggestedVocab: '水曜日 (Thứ Tư) - すいようび\n水 (Nước) - みず',
    status: 'hidden'
  },
];

export const MOCK_LEARNING_PATHS = [
  { id: 1, level: 'N5', title: 'Bài 1: Làm quen Hiragana & Katakana', description: 'Bảng chữ cái cơ bản và cách phát âm', order: 1, kanjiCount: 0, vocabularyCount: 20, isUnlocked: true },
  { id: 2, level: 'N5', title: 'Bài 2: Số đếm và thời gian', description: 'Cách đếm số, nói giờ và ngày tháng', order: 2, kanjiCount: 5, vocabularyCount: 30, isUnlocked: true },
  { id: 3, level: 'N5', title: 'Bài 3: Danh từ cơ bản', description: 'Đồ vật, địa điểm xung quanh', order: 3, kanjiCount: 10, vocabularyCount: 45, isUnlocked: true },
  { id: 4, level: 'N5', title: 'Bài 4: Động từ nhóm 1', description: 'Cách chia và sử dụng động từ nhóm 1', order: 4, kanjiCount: 12, vocabularyCount: 40, isUnlocked: false },
  
  { id: 5, level: 'N4', title: 'Bài 1: Thể thông thường', description: 'Cách sử dụng thể thông thường trong giao tiếp', order: 1, kanjiCount: 15, vocabularyCount: 40, isUnlocked: true },
  { id: 6, level: 'N4', title: 'Bài 2: Câu điều kiện', description: 'Sử dụng ~と, ~ば, ~たら, ~なら', order: 2, kanjiCount: 20, vocabularyCount: 50, isUnlocked: true },
  { id: 7, level: 'N4', title: 'Bài 3: Thể bị động', description: 'Cấu trúc câu bị động', order: 3, kanjiCount: 18, vocabularyCount: 35, isUnlocked: false },
  
  { id: 8, level: 'N3', title: 'Bài 1: Ngữ pháp trung cấp 1', description: 'Các cấu trúc ngữ pháp dùng trong hội thoại', order: 1, kanjiCount: 25, vocabularyCount: 60, isUnlocked: true },
  { id: 9, level: 'N3', title: 'Bài 2: Từ vựng chuyên ngành', description: 'Từ vựng nơi công sở', order: 2, kanjiCount: 30, vocabularyCount: 75, isUnlocked: false },
];

export const MOCK_REPORTS = [
  {
    id: 1,
    reporterName: 'Nguyễn Văn A',
    reporterEmail: 'nva@example.com',
    type: 'Kanji sai nghĩa',
    relatedContent: 'Chữ 日 (Nhật)',
    description: 'Nghĩa của chữ Nhật bị sai trong ví dụ, vui lòng kiểm tra lại câu dịch.',
    date: '06/07/2026',
    status: 'PENDING',
    adminNote: ''
  },
  {
    id: 2,
    reporterName: 'Trần Thị B',
    reporterEmail: 'ttb@example.com',
    type: 'Lỗi giao diện',
    relatedContent: 'Trang Bài 1 - N5',
    description: 'Nút "Làm bài tập" bị kẹt ở góc dưới màn hình điện thoại, không bấm được.',
    date: '05/07/2026',
    status: 'PROCESSING',
    adminNote: 'Đã giao cho team Frontend kiểm tra trên mobile layout.'
  },
  {
    id: 3,
    reporterName: 'Lê Hoàng C',
    reporterEmail: 'lhc@example.com',
    type: 'Sai âm đọc',
    relatedContent: 'Chữ 水 (Thủy)',
    description: 'Kunyomi của chữ Thủy ghi thiếu âm みず.',
    date: '03/07/2026',
    status: 'RESOLVED',
    adminNote: 'Đã bổ sung âm kunyomi vào CSDL.'
  },
  {
    id: 4,
    reporterName: 'Phạm D',
    reporterEmail: 'pd@example.com',
    type: 'Góp ý khác',
    relatedContent: 'Hệ thống chung',
    description: 'Mình mong web có thêm dark mode để học ban đêm đỡ chói mắt.',
    date: '01/07/2026',
    status: 'REJECTED',
    adminNote: 'Tính năng này hiện tại chưa có trong kế hoạch phát triển quý này.'
  }
];

// Dữ liệu cũ phía trên vẫn được giữ nguyên để các page hiện tại tiếp tục hoạt động.
// Hai collection bên dưới chuẩn hóa model cho lớp admin service mới.
const additionalAccounts = [
  {
    id: 6,
    fullName: 'Vũ Minh Anh',
    email: 'minhanh@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=6',
    role: 'USER',
    currentLevel: 'N4',
    status: 'ACTIVE',
    createdAt: '2026-07-05T08:20:00.000Z',
    updatedAt: '2026-07-05T08:20:00.000Z',
    lastLoginAt: '2026-07-06T01:30:00.000Z',
  },
  {
    id: 7,
    fullName: 'Đỗ Hoàng Nam',
    email: 'hoangnam@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=7',
    role: 'TUTOR',
    currentLevel: null,
    status: 'ACTIVE',
    createdAt: '2026-07-04T03:15:00.000Z',
    updatedAt: '2026-07-04T03:15:00.000Z',
    lastLoginAt: '2026-07-05T12:10:00.000Z',
  },
  {
    id: 8,
    fullName: 'Bùi Ngọc Mai',
    email: 'ngocmai@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=8',
    role: 'USER',
    currentLevel: 'N3',
    status: 'HIDDEN',
    createdAt: '2026-07-03T09:45:00.000Z',
    updatedAt: '2026-07-06T02:00:00.000Z',
    lastLoginAt: '2026-07-05T05:20:00.000Z',
    lockedAt: '2026-07-06T02:00:00.000Z',
    lockReason: 'Đăng nhập bất thường nhiều lần',
  },
  {
    id: 9,
    fullName: 'Phan Quốc Bảo',
    email: 'quocbao@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=9',
    role: 'USER',
    currentLevel: 'N5',
    status: 'ACTIVE',
    createdAt: '2026-07-02T04:00:00.000Z',
    updatedAt: '2026-07-02T04:00:00.000Z',
    lastLoginAt: null,
  },
  {
    id: 10,
    fullName: 'Ngô Thanh Hà',
    email: 'thanhha@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=10',
    role: 'ADMIN',
    currentLevel: null,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
  },
];

const additionalKanji = [
  { id: 5, character: '火', meaning: 'Lửa / Hỏa', onyomi: 'カ', kunyomi: 'ひ', jlptLevel: 'N5', strokeCount: 4, radical: '火', status: 'ACTIVE', updatedAt: '2026-07-06T01:00:00.000Z' },
  { id: 6, character: '木', meaning: 'Cây / Mộc', onyomi: 'モク, ボク', kunyomi: 'き', jlptLevel: 'N5', strokeCount: 4, radical: '木', status: 'ACTIVE', updatedAt: '2026-07-05T08:00:00.000Z' },
  { id: 7, character: '学', meaning: 'Học tập', onyomi: 'ガク', kunyomi: 'まな.ぶ', jlptLevel: 'N5', strokeCount: 8, radical: '子', status: 'ACTIVE', updatedAt: '2026-07-04T07:00:00.000Z' },
  { id: 8, character: '語', meaning: 'Ngôn ngữ', onyomi: 'ゴ', kunyomi: 'かた.る', jlptLevel: 'N5', strokeCount: 14, radical: '言', status: 'HIDDEN', updatedAt: '2026-07-03T06:00:00.000Z' },
  { id: 9, character: '食', meaning: 'Ăn / Thực', onyomi: 'ショク', kunyomi: 'た.べる', jlptLevel: 'N5', strokeCount: 9, radical: '食', status: 'ACTIVE', updatedAt: '2026-07-02T05:00:00.000Z' },
  { id: 10, character: '働', meaning: 'Làm việc', onyomi: 'ドウ', kunyomi: 'はたら.く', jlptLevel: 'N4', strokeCount: 13, radical: '人', status: 'HIDDEN', updatedAt: '2026-07-01T04:00:00.000Z' },
];

const parseLegacyDate = (value, fallback) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || '');
  return match
    ? new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00.000Z`).toISOString()
    : fallback;
};

export const mockAccounts = [
  ...MOCK_STUDENTS.map((student) => {
    const createdAt = parseLegacyDate(
      student.createdAt,
      '2026-01-01T00:00:00.000Z',
    );

    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      avatarUrl: student.avatarUrl || null,
      role: student.role,
      currentLevel: student.level || null,
      status: student.status?.toUpperCase() === 'LOCKED' ? 'LOCKED' : 'ACTIVE',
      mustChangePassword: false,
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: parseLegacyDate(student.lastLoginAt, null),
      lockedAt: student.lockedAt || null,
      lockReason: student.lockReason || null,
      note: '',
      learningProgress: student.role === 'USER'
        ? {
            kanji: student.stats?.kanji || 0,
            vocabulary: student.stats?.vocab || 0,
            quizzes: student.stats?.quiz || 0,
            averageScore: student.stats?.avgScore || 0,
            completionRate: Number.parseInt(student.progress, 10) || 0,
          }
        : null,
      recentActivities: MOCK_STUDENT_HISTORY[student.id] || [],
      adminLogs: (MOCK_ADMIN_LOGS[student.id] || []).map((log) => ({
        id: log.id,
        adminName: log.admin,
        actionType: log.action,
        oldValue: log.oldValue,
        newValue: log.newValue,
        reason: log.reason,
        createdAt: log.date,
      })),
    };
  }),
  ...additionalAccounts.map((account) => ({
    ...account,
    mustChangePassword: false,
    lockedAt: account.lockedAt || null,
    lockReason: account.lockReason || null,
    note: '',
    learningProgress: account.role === 'USER'
      ? {
          kanji: 0,
          vocabulary: 0,
          quizzes: 0,
          averageScore: 0,
          completionRate: 0,
        }
      : null,
    recentActivities: [],
    adminLogs: [],
  })),
];

export const mockKanjiList = [
  ...MOCK_KANJIS.map((kanji, index) => ({
    id: kanji.id,
    character: kanji.kanji,
    meaning: kanji.meaning,
    onyomi: kanji.onyomi,
    kunyomi: kanji.kunyomi,
    jlptLevel: kanji.level,
    strokeCount: kanji.strokes,
    radical: kanji.radical,
    exampleJapanese: kanji.suggestedVocab || '',
    exampleVietnamese: '',
    mnemonic: '',
    status: kanji.status?.toUpperCase() === 'HIDDEN' ? 'HIDDEN' : 'ACTIVE',
    createdAt: `2026-06-${String(20 + index).padStart(2, '0')}T00:00:00.000Z`,
    updatedAt: `2026-07-0${index + 1}T00:00:00.000Z`,
    createdBy: 'Admin',
    updatedBy: 'Admin',
  })),
  ...additionalKanji.map((kanji) => ({
    ...kanji,
    exampleJapanese: '',
    exampleVietnamese: '',
    mnemonic: '',
    createdAt: kanji.updatedAt,
    createdBy: 'Admin',
    updatedBy: 'Admin',
  })),
];

export const mockAdminLogs = MOCK_ADMIN_LOGS;

export const mockDashboardStats = {
  todayVisits: 342,
  pendingReports: 0,
};

// Mock chuẩn hóa dành cho các service phát triển sau. Mock cũ phía trên vẫn
// được giữ nguyên để các page hiện tại không bị ảnh hưởng trong lúc chuyển đổi.
export const mockLearningPaths = [
  {
    level: 'N5',
    title: 'Lộ trình N5',
    description: 'Lộ trình cơ bản cho người mới bắt đầu',
    totalLessons: 2,
    lessons: [
      {
        id: 101,
        level: 'N5',
        title: 'Bài 1: Kanji cơ bản',
        description: 'Học các Kanji thường gặp ở N5',
        order: 1,
        kanjiCount: 20,
        vocabularyCount: 50,
        status: 'ACTIVE',
        isUnlocked: true,
        createdAt: '2026-07-01T08:00:00',
        updatedAt: '2026-07-01T08:00:00',
      },
      {
        id: 102,
        level: 'N5',
        title: 'Bài 2: Gia đình và con người',
        description: 'Kanji và từ vựng về gia đình',
        order: 2,
        kanjiCount: 25,
        vocabularyCount: 60,
        status: 'ACTIVE',
        isUnlocked: true,
        createdAt: '2026-07-02T08:00:00',
        updatedAt: '2026-07-02T08:00:00',
      },
    ],
  },
  {
    level: 'N4',
    title: 'Lộ trình N4',
    description: 'Lộ trình nâng cao sau N5',
    totalLessons: 1,
    lessons: [
      {
        id: 201,
        level: 'N4',
        title: 'Bài 1: Kanji N4 cơ bản',
        description: 'Làm quen với Kanji cấp độ N4',
        order: 1,
        kanjiCount: 30,
        vocabularyCount: 70,
        status: 'ACTIVE',
        isUnlocked: true,
        createdAt: '2026-07-03T08:00:00',
        updatedAt: '2026-07-03T08:00:00',
      },
    ],
  },
];

export const mockReports = [
  {
    id: 1,
    reporterName: 'Nguyễn Văn A',
    reporterEmail: 'nva@example.com',
    type: 'KANJI_MEANING_ERROR',
    relatedContent: '日',
    description: 'Nghĩa tiếng Việt của Kanji này chưa đầy đủ.',
    status: 'PENDING',
    adminNote: null,
    createdAt: '2026-07-06T09:00:00',
    updatedAt: '2026-07-06T09:00:00',
  },
  {
    id: 2,
    reporterName: 'Trần Thị B',
    reporterEmail: 'ttb@example.com',
    type: 'READING_ERROR',
    relatedContent: '月',
    description: 'Âm đọc Kunyomi có vẻ bị thiếu.',
    status: 'PROCESSING',
    adminNote: 'Đang kiểm tra lại dữ liệu.',
    createdAt: '2026-07-05T14:00:00',
    updatedAt: '2026-07-06T08:00:00',
  },
];

export const mockSystemSettings = {
  appName: 'JELA',
  allowRegistration: true,
  allowGoogleLogin: true,
  defaultUserLevel: 'N5',
  defaultQuizQuestionCount: 10,
  quizPassScore: 70,
  maintenanceMode: false,
  maintenanceMessage: '',
  updatedAt: '2026-07-06T10:00:00',
  updatedBy: 'Admin',
};

export const mockVocabularyList = [
  {
    id: 1,
    word: '学校',
    kana: 'がっこう',
    romaji: 'gakkou',
    meaning: 'Trường học',
    partOfSpeech: 'Danh từ',
    jlptLevel: 'N5',
    topic: 'Giáo dục',
    exampleJapanese: '学校へ行きます。',
    exampleVietnamese: 'Tôi đi đến trường.',
    status: 'ACTIVE',
    updatedAt: '2026-07-06T10:00:00',
  },
  {
    id: 2,
    word: '食べる',
    kana: 'たべる',
    romaji: 'taberu',
    meaning: 'Ăn',
    partOfSpeech: 'Động từ',
    jlptLevel: 'N5',
    topic: 'Ẩm thực',
    exampleJapanese: 'りんごを食べる。',
    exampleVietnamese: 'Tôi ăn táo.',
    status: 'ACTIVE',
    updatedAt: '2026-07-06T10:05:00',
  },
  {
    id: 3,
    word: '美しい',
    kana: 'うつくしい',
    romaji: 'utsukushii',
    meaning: 'Đẹp',
    partOfSpeech: 'Tính từ đuôi i',
    jlptLevel: 'N4',
    topic: 'Tính từ',
    exampleJapanese: '美しい花ですね。',
    exampleVietnamese: 'Bông hoa đẹp nhỉ.',
    status: 'ACTIVE',
    updatedAt: '2026-07-06T10:10:00',
  },
  {
    id: 4,
    word: '経済',
    kana: 'けいざい',
    romaji: 'keizai',
    meaning: 'Kinh tế',
    partOfSpeech: 'Danh từ',
    jlptLevel: 'N3',
    topic: 'Kinh doanh',
    exampleJapanese: '日本の経済。',
    exampleVietnamese: 'Kinh tế Nhật Bản.',
    status: 'LOCKED',
    updatedAt: '2026-07-06T10:15:00',
  }
];
