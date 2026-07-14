export const validateEmail = (email) => {
  if (!email.trim()) return 'Vui lòng nhập email';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email không hợp lệ';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Vui lòng nhập mật khẩu';
  if (password.length < 8) return 'Mật khẩu tối thiểu 8 ký tự';
  return null;
};

export const validateRegisterPassword = (password) => {
  if (!password) return 'Vui lòng nhập mật khẩu';
  if (password.length < 8 || password.length > 32) return 'Mật khẩu phải từ 8 đến 32 ký tự';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
  return null;
};

export const validateFullName = (fullName) => {
  if (!fullName.trim()) return 'Vui lòng nhập họ và tên';
  if (fullName.trim().length < 2 || fullName.trim().length > 50) return 'Họ và tên phải từ 2 đến 50 ký tự';
  if (!/[a-zA-Z\u00C0-\u1EF9]/.test(fullName)) return 'Họ và tên không được chỉ chứa số và ký tự đặc biệt';
  return null;
};

export const validateRequired = (value, message = 'Trường này là bắt buộc') => {
  if (!value || (typeof value === 'string' && !value.trim())) return message;
  return null;
};
