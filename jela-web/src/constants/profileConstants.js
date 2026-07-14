export const PROFILE_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const PROFILE_IMAGE_RULES = {
  maxFileSize: 2 * 1024 * 1024,
  maxDimension: 512,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

// Tách toàn bộ câu chữ khỏi component để Setting sau này có thể đổi ngôn ngữ
// bằng cách cập nhật appLanguage và phát sự kiện app:preferences-changed.
export const PROFILE_TRANSLATIONS = {
  vi: {
    accountLabel: 'TÀI KHOẢN JELA',
    profileLabel: 'HỒ SƠ JELA',
    required: '* Bắt buộc',
    unsaved: 'Có thay đổi chưa lưu',
    lastUpdated: 'Cập nhật gần nhất',
    neverUpdated: 'Chưa có thông tin',
    pageTitle: 'Thông tin cá nhân',
    editPhoto: 'Thay ảnh đại diện',
    removePhoto: 'Xóa ảnh đã chọn',
    googlePhoto: 'Ảnh hiện tại được đồng bộ từ tài khoản Google.',
    localPhoto: 'Bạn có thể dùng ảnh JPG, PNG hoặc WebP, tối đa 2 MB.',
    personalInfo: 'Thông tin cá nhân',
    fullName: 'Họ và tên',
    email: 'Địa chỉ email',
    phone: 'Số điện thoại',
    level: 'Trình độ học hiện tại',
    emailNote: 'Email được quản lý trong mục Cài đặt và hiện chưa thể chỉnh sửa tại đây.',
    levelNote: 'Trình độ này được dùng để cá nhân hóa lộ trình và nội dung học.',
    cancel: 'Hủy thay đổi',
    save: 'Lưu thay đổi',
    saving: 'Đang lưu...',
    saved: 'Thông tin cá nhân đã được cập nhật.',
    saveError: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
    noChanges: 'Bạn chưa thay đổi thông tin nào.',
    levelDialogTitle: 'Xác nhận đổi trình độ',
    levelDialogMessage:
      'Thay đổi cấp độ học có thể ảnh hưởng đến lộ trình học của bạn. Bạn có muốn tiếp tục?',
    keepLevel: 'Giữ trình độ hiện tại',
    confirmLevel: 'Tiếp tục thay đổi',
    learningStatus: 'Tiến độ học tập',
    learningStatusText: 'Bạn đang theo lộ trình được cá nhân hóa theo trình độ hiện tại.',
    avatarAlt: 'Ảnh đại diện của người dùng',
  },
  en: {
    accountLabel: 'JELA ACCOUNT',
    profileLabel: 'JELA PROFILE',
    required: '* Required',
    unsaved: 'You have unsaved changes',
    lastUpdated: 'Last updated',
    neverUpdated: 'No update information',
    pageTitle: 'Personal profile',
    editPhoto: 'Change profile photo',
    removePhoto: 'Remove selected photo',
    googlePhoto: 'Your current photo is synchronized from your Google account.',
    localPhoto: 'You can use JPG, PNG or WebP images up to 2 MB.',
    personalInfo: 'Personal information',
    fullName: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    level: 'Current learning level',
    emailNote: 'Email is managed in Settings and cannot be edited here yet.',
    levelNote: 'This level is used to personalize your learning roadmap and content.',
    cancel: 'Cancel changes',
    save: 'Save changes',
    saving: 'Saving...',
    saved: 'Your profile has been updated.',
    saveError: 'Unable to update your profile. Please try again.',
    noChanges: 'You have not changed any information.',
    levelDialogTitle: 'Confirm level change',
    levelDialogMessage:
      'Changing your learning level may affect your roadmap. Do you want to continue?',
    keepLevel: 'Keep current level',
    confirmLevel: 'Continue',
    learningStatus: 'Learning progress',
    learningStatusText: 'You are following a roadmap personalized to your current level.',
    avatarAlt: 'User profile photo',
  },
};

export const PROFILE_VALIDATION_MESSAGES = {
  vi: {
    fullNameRequired: 'Vui lòng nhập họ và tên',
    fullNameLength: 'Họ và tên phải từ 2 đến 50 ký tự',
    fullNameInvalid: 'Họ và tên không được chỉ chứa số và ký tự đặc biệt',
    phoneRequired: 'Vui lòng nhập số điện thoại',
    phoneInvalid: 'Số điện thoại không đúng định dạng Việt Nam',
  },
  en: {
    fullNameRequired: 'Please enter your full name',
    fullNameLength: 'Full name must contain between 2 and 50 characters',
    fullNameInvalid: 'Full name cannot contain only numbers or special characters',
    phoneRequired: 'Please enter your phone number',
    phoneInvalid: 'Please enter a valid Vietnamese phone number',
  },
};

export const PROFILE_PREFERENCES_EVENT = 'app:preferences-changed';
