const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 32,
};

export const getPasswordRequirements = (password) => ({
  length:
    password.length >= PASSWORD_RULES.minLength &&
    password.length <= PASSWORD_RULES.maxLength,
  lowercase: /[a-z]/.test(password),
  uppercase: /[A-Z]/.test(password),
  number: /\d/.test(password),
  special: /[^A-Za-z0-9\s]/.test(password),
  noWhitespace: !/\s/.test(password),
});

export const validateChangePasswordForm = (form, messages) => {
  const errors = {};
  const requirements = getPasswordRequirements(form.newPassword);

  if (!form.currentPassword) {
    errors.currentPassword = messages.currentPasswordRequired;
  }

  if (!form.newPassword) {
    errors.newPassword = messages.newPasswordRequired;
  } else if (!Object.values(requirements).every(Boolean)) {
    errors.newPassword = messages.newPasswordInvalid;
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = messages.passwordMustBeDifferent;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = messages.confirmPasswordRequired;
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = messages.passwordMismatch;
  }

  return errors;
};
