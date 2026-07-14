import { PROFILE_VALIDATION_MESSAGES } from '../constants/profileConstants.js';

export const normalizePhoneNumber = (phone) => phone.replace(/[\s().-]/g, '');

export const validateProfilePhone = (phone, messages) => {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    return messages.phoneRequired;
  }

  // Chấp nhận số di động Việt Nam bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84.
  // Dấu cách, dấu chấm, gạch ngang và ngoặc được bỏ trước khi kiểm tra.
  if (!/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) {
    return messages.phoneInvalid;
  }

  return null;
};

const validateProfileFullName = (fullName, messages) => {
  const trimmedName = fullName.trim();

  if (!trimmedName) return messages.fullNameRequired;
  if (trimmedName.length < 2 || trimmedName.length > 50) return messages.fullNameLength;
  if (!/[a-zA-Z\u00C0-\u1EF9]/.test(trimmedName)) return messages.fullNameInvalid;

  return null;
};

export const validateProfileForm = ({ fullName, phone }, language = 'vi') => {
  const errors = {};
  const messages =
    PROFILE_VALIDATION_MESSAGES[language] || PROFILE_VALIDATION_MESSAGES.vi;
  const fullNameError = validateProfileFullName(fullName, messages);
  const phoneError = validateProfilePhone(phone, messages);

  if (fullNameError) errors.fullName = fullNameError;
  if (phoneError) errors.phone = phoneError;

  return errors;
};
