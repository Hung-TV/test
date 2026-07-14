import { useEffect, useRef, useState } from 'react';
import PasswordField from './PasswordField';
import {
  getPasswordRequirements,
  validateChangePasswordForm,
} from '../../utils/changePasswordValidators';

const EMPTY_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ChangePasswordModal({
  isOpen,
  isSubmitting,
  messages,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [visibleFields, setVisibleFields] = useState({});
  const currentPasswordRef = useRef(null);
  const requirements = getPasswordRequirements(form.newPassword);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    currentPasswordRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: null }));
    }
  };

  const toggleVisibility = (name) => {
    setVisibleFields((current) => ({ ...current, [name]: !current[name] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateChangePasswordForm(form, messages);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;
    await onSubmit({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    });
  };

  const requirementItems = [
    ['length', messages.passwordRuleLength],
    ['uppercase', messages.passwordRuleUppercase],
    ['lowercase', messages.passwordRuleLowercase],
    ['number', messages.passwordRuleNumber],
    ['special', messages.passwordRuleSpecial],
    ['noWhitespace', messages.passwordRuleNoWhitespace],
  ];

  return (
    <div
      className="password-modal-backdrop"
      role="presentation"
      onMouseDown={() => !isSubmitting && onClose()}
    >
      <section
        className="password-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="password-modal__close"
          aria-label={messages.close}
          disabled={isSubmitting}
          onClick={onClose}
        >
          ×
        </button>

        <header className="password-modal__header">
          <div className="password-modal__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <div>
            <h2 id="change-password-title">{messages.changePasswordTitle}</h2>
            <p>{messages.changePasswordDescription}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <PasswordField
            name="currentPassword"
            label={messages.currentPassword}
            placeholder={messages.passwordPlaceholder}
            value={form.currentPassword}
            error={errors.currentPassword}
            showPassword={visibleFields.currentPassword}
            inputRef={currentPasswordRef}
            autoComplete="current-password"
            onChange={handleChange}
            onToggleVisibility={() => toggleVisibility('currentPassword')}
          />

          <PasswordField
            name="newPassword"
            label={messages.newPassword}
            placeholder={messages.passwordPlaceholder}
            value={form.newPassword}
            error={errors.newPassword}
            showPassword={visibleFields.newPassword}
            autoComplete="new-password"
            onChange={handleChange}
            onToggleVisibility={() => toggleVisibility('newPassword')}
          />

          <div className="password-requirements">
            <strong>{messages.passwordRequirements}</strong>
            <ul>
              {requirementItems.map(([key, label]) => (
                <li
                  key={key}
                  className={requirements[key] ? 'password-requirement--met' : ''}
                >
                  <span aria-hidden="true">{requirements[key] ? '✓' : '○'}</span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <PasswordField
            name="confirmPassword"
            label={messages.confirmNewPassword}
            placeholder={messages.passwordPlaceholder}
            value={form.confirmPassword}
            error={errors.confirmPassword}
            showPassword={visibleFields.confirmPassword}
            autoComplete="new-password"
            onChange={handleChange}
            onToggleVisibility={() => toggleVisibility('confirmPassword')}
          />

          <div className="password-modal__actions">
            <button
              type="button"
              className="password-modal__cancel"
              disabled={isSubmitting}
              onClick={onClose}
            >
              {messages.cancel}
            </button>
            <button
              type="submit"
              className="password-modal__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? messages.updatingPassword : messages.updatePassword}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
