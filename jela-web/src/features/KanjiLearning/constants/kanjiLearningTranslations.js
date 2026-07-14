export const KANJI_LEARNING_TRANSLATIONS = {
  vi: {
    eyebrow: 'JELA KANJI',
    pageTitle: 'Thư viện Kanji',
    pageDescription: 'Tra cứu, học và lưu Kanji theo cấp độ JLPT trong một không gian.',
    searchPlaceholder: 'Tra Kanji, âm đọc, nghĩa, romaji...',
    searchLabel: 'Tìm kiếm Kanji',
    handwriting: 'Nét vẽ',
    handwritingTitle: 'Nhập bằng nét vẽ',
    handwritingModal: {
      eyebrow: 'JELA KANJI',
      title: 'Vẽ chữ để tra Kanji',
      description: 'Vẽ Kanji cần tra, sau đó chọn ký tự phù hợp trong danh sách gợi ý.',
      close: 'Đóng',
      drawFirst: 'Hãy vẽ chữ trước khi tra cứu',
      clearAll: 'Xóa tất cả',
      undo: 'Hoàn tác',
      recognizing: 'Đang nhận dạng...',
      recognize: 'Tra cứu',
      candidates: 'Kết quả gợi ý',
      characterCount: (count) => `${count} ký tự`,
      emptyTitle: 'Chưa tìm thấy ký tự phù hợp',
      emptyDescription: 'Hãy thử viết rõ từng nét hoặc vẽ lớn hơn ở giữa ô.',
      suggestedCharacters: 'Ký tự gợi ý',
    },
    suggestionsLabel: 'Kết quả gợi ý',
    searching: 'Đang tìm kiếm...',
    noSearchResults: 'Không tìm thấy Kanji phù hợp.',
    roadmap: 'Cấp độ JLPT',
    noLevelData: 'Chưa có dữ liệu cấp độ.',
    levelNames: {
      N5: 'Sơ cấp',
      N4: 'Tiền trung cấp',
      N3: 'Trung cấp',
      N2: 'Thượng trung cấp',
      N1: 'Cao cấp',
    },
    startLevel: 'Bắt đầu',
    studyNow: 'Học ngay',
    confirmStartTitle: (level) => `Bắt đầu học Kanji cấp độ JLPT ${level}`,
    confirmStartMessage: (level, count) => `Toàn bộ ${count} chữ Hán cấp độ ${level} sẽ được thêm vào danh sách học của bạn.`,
    confirmStartBtn: 'Bắt đầu học',
    confirmCancelBtn: 'Huỷ',
    startingLevel: 'Đang khởi tạo danh sách...',
    startLevelSuccess: (level) => `Đã tạo danh sách JLPT ${level}. Chuyển đến danh sách học...`,
    startLevelError: 'Không thể tạo danh sách. Vui lòng thử lại.',
    kanjiCount: (learned, total) => `${learned}/${total} Kanji`,
    chooseLevel: 'Chọn một cấp độ để xem danh sách Kanji.',
    listTitle: (level) => `Danh sách Kanji ${level}`,
    meaning: 'Nghĩa',
    romaji: 'Hán-Việt',
    radical: 'Bộ thủ',
    viewDetails: 'Xem chi tiết',
    loadError: 'Có lỗi xảy ra, vui lòng thử lại.',
    noKanjiData: 'Chưa có dữ liệu Kanji cho cấp độ này.',
    totalKanji: (total) => `${total} Kanji`,
    pagination: 'Phân trang',
    previousPage: 'Trang trước',
    previous: 'Trước',
    nextPage: 'Trang sau',
    next: 'Sau',
    pageCount: (current, total) => `Trang ${current} / ${total}`,
    goToPage: 'Đến trang',
    history: 'Lịch sử tra cứu',
    signInForHistory: 'Đăng nhập để lưu lịch sử tra cứu.',
    noHistory: 'Bạn chưa tra cứu Kanji nào.',
    time: 'Thời gian',
    detailTitle: 'Chi tiết Kanji',
    selectForDetail: 'Chọn một Kanji để xem chi tiết.',
    errorTitle: 'Có lỗi xảy ra',
    detailLoadError: 'Không thể tải chi tiết Kanji. Vui lòng thử lại.',
    close: 'Đóng',
    onyomi: 'Âm On',
    kunyomi: 'Âm Kun',
    strokeCount: 'Số nét',
    addToLearningList: 'Thêm vào danh sách học',
    suggestedVocabulary: 'Từ vựng gợi ý',
    noVocabulary: 'Chưa có từ vựng gợi ý.',
    addModalTitle: 'Thêm Kanji vào danh sách học',
    addModalDescription: 'Chọn danh sách để thêm Kanji này.',
    signInRequired: 'Bạn cần đăng nhập để sử dụng tính năng này.',
    loading: 'Đang tải...',
    noLists: 'Bạn chưa có danh sách nào.',
    listItemCount: (count) => `${count} Kanji`,
    newListName: 'Tên danh sách mới',
    newListPlaceholder: 'Ví dụ: Kanji N5 hay quên',
    listNameRequired: 'Tên danh sách không được để trống.',
    listNameTooLong: 'Tên danh sách tối đa 50 ký tự.',
    cancel: 'Hủy',
    creating: 'Đang tạo...',
    createList: 'Tạo danh sách',
    createNewList: 'Tạo danh sách mới',
    selectKanjiFirst: 'Vui lòng chọn một Kanji trước.',
    addSuccess: 'Đã thêm Kanji vào danh sách học.',
    alreadyInList: 'Kanji này đã có trong danh sách.',
    addFailed: 'Không thể thêm Kanji. Vui lòng thử lại.',
    createSuccess: 'Đã tạo danh sách và thêm Kanji.',
    createFailed: 'Không thể tạo danh sách. Vui lòng thử lại.',
  },
  en: {
    eyebrow: 'JELA KANJI',
    pageTitle: 'Kanji Library',
    pageDescription: 'Search, study, and save Kanji by JLPT level in one place.',
    searchPlaceholder: 'Search by Kanji, reading, meaning, or romaji...',
    searchLabel: 'Search Kanji',
    handwriting: 'Handwriting',
    handwritingTitle: 'Enter with handwriting',
    handwritingModal: {
      eyebrow: 'JELA KANJI',
      title: 'Draw a Kanji to search',
      description: 'Draw the Kanji, then choose the matching character from the suggestions.',
      close: 'Close',
      drawFirst: 'Draw a character before searching',
      clearAll: 'Clear all',
      undo: 'Undo',
      recognizing: 'Recognizing...',
      recognize: 'Search',
      candidates: 'Suggestions',
      characterCount: (count) => `${count} characters`,
      emptyTitle: 'No matching characters yet',
      emptyDescription: 'Try drawing each stroke clearly or draw larger near the center.',
      suggestedCharacters: 'Suggested characters',
    },
    suggestionsLabel: 'Search suggestions',
    searching: 'Searching...',
    noSearchResults: 'No matching Kanji found.',
    roadmap: 'JLPT Levels',
    noLevelData: 'No level data is available.',
    levelNames: {
      N5: 'Beginner',
      N4: 'Elementary',
      N3: 'Intermediate',
      N2: 'Upper-intermediate',
      N1: 'Advanced',
    },
    startLevel: 'Start',
    studyNow: 'Study now',
    confirmStartTitle: (level) => `Start learning JLPT ${level} Kanji`,
    confirmStartMessage: (level, count) => `All ${count} kanji at ${level} level will be added to your learning list.`,
    confirmStartBtn: 'Start learning',
    confirmCancelBtn: 'Cancel',
    startingLevel: 'Creating list...',
    startLevelSuccess: (level) => `JLPT ${level} list created. Redirecting to learning lists...`,
    startLevelError: 'Unable to create the list. Please try again.',
    kanjiCount: (learned, total) => `${learned}/${total} Kanji`,
    chooseLevel: 'Choose a level to view its Kanji list.',
    listTitle: (level) => `${level} Kanji List`,
    meaning: 'Meaning',
    romaji: 'Sino-Vietnamese',
    radical: 'Radical',
    viewDetails: 'View details',
    loadError: 'Something went wrong. Please try again.',
    noKanjiData: 'No Kanji data is available for this level.',
    totalKanji: (total) => `${total} Kanji`,
    pagination: 'Pagination',
    previousPage: 'Previous page',
    previous: 'Previous',
    nextPage: 'Next page',
    next: 'Next',
    pageCount: (current, total) => `Page ${current} of ${total}`,
    history: 'Search History',
    signInForHistory: 'Sign in to save your search history.',
    noHistory: 'You have not viewed any Kanji yet.',
    time: 'Time',
    detailTitle: 'Kanji Details',
    selectForDetail: 'Choose a Kanji to view its details.',
    errorTitle: 'Something went wrong',
    detailLoadError: 'Unable to load the Kanji details. Please try again.',
    close: 'Close',
    onyomi: 'On reading',
    kunyomi: 'Kun reading',
    strokeCount: 'Stroke count',
    addToLearningList: 'Add to learning list',
    suggestedVocabulary: 'Suggested Vocabulary',
    noVocabulary: 'No suggested vocabulary is available.',
    addModalTitle: 'Add Kanji to a Learning List',
    addModalDescription: 'Choose a list for this Kanji.',
    signInRequired: 'Please sign in to use this feature.',
    loading: 'Loading...',
    noLists: 'You do not have any learning lists yet.',
    listItemCount: (count) => `${count} Kanji`,
    newListName: 'New list name',
    newListPlaceholder: 'Example: Tricky N5 Kanji',
    listNameRequired: 'The list name is required.',
    listNameTooLong: 'The list name must not exceed 50 characters.',
    cancel: 'Cancel',
    creating: 'Creating...',
    createList: 'Create list',
    createNewList: 'Create a new list',
    selectKanjiFirst: 'Choose a Kanji first.',
    addSuccess: 'Kanji added to your learning list.',
    alreadyInList: 'This Kanji is already in the list.',
    addFailed: 'Unable to add the Kanji. Please try again.',
    createSuccess: 'Learning list created and Kanji added.',
    createFailed: 'Unable to create the list. Please try again.',
  },
};

export const getLocalizedKanjiMeaning = (item, language = 'vi') => {
  if (!item) return '';

  const suffix = language === 'en' ? 'En' : 'Vi';
  const directMeaning = item[`meaning${suffix}`]
    || item[`meaning_${language}`]
    || item.meanings?.[language]
    || (typeof item.meaning === 'object' ? item.meaning?.[language] : null);

  const raw = directMeaning || (typeof item.meaning === 'string' ? item.meaning : '');

  // Thay ", [" bằng "; [" để phân cách rõ ràng giữa các nhóm Hán-Việt
  return raw.replace(/,\s*(?=\[)/g, '; ');
};

export const formatKanjiRelativeTime = (value, language = 'vi') => {
  if (!value) return '—';

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return '—';

  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(
    language === 'en' ? 'en-US' : 'vi-VN',
    { numeric: 'auto' },
  );

  if (Math.abs(diffSeconds) < 60) return formatter.format(0, 'second');

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour');

  return formatter.format(Math.round(diffHours / 24), 'day');
};

/** Ngày giờ cụ thể — dùng cho lịch sử Kanji (giống Dictionary panel) */
export const formatKanjiDate = (value, language = 'vi') => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'vi-VN', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace(',', '');
};
