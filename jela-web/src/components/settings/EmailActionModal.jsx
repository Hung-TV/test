import { useEffect, useRef, useState } from 'react';
export default function EmailActionModal({
  currentEmail,
  isOpen,
  isSubmitting,
  messages,
  mode,
  onClose,
  onSubmit,
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    if (isEditMode) inputRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isEditMode, isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (isEditMode) {
      const normalizedEmail = email.trim().toLowerCase();
      let validationError = '';

      if (!normalizedEmail) {
        validationError = messages.emailRequired;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        validationError = messages.emailInvalid;
      }

      if (validationError) {
        setError(validationError);
        return;
      }

      if (normalizedEmail === currentEmail?.trim().toLowerCase()) {
        setError(messages.emailMustBeDifferent);
        return;
      }

      await onSubmit(normalizedEmail);
      return;
    }

    await onSubmit();
  };

  return (
    <div
      className="email-modal-backdrop"
      role="presentation"
      onMouseDown={() => !isSubmitting && onClose()}
    >
      <section
        className="email-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-action-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="email-modal__close"
          aria-label={messages.close}
          disabled={isSubmitting}
          onClick={onClose}
        >
          ×
        </button>

        <div className="email-modal__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </div>

        <h2 id="email-action-title">
          {isEditMode ? messages.editEmailTitle : messages.verifyEmailTitle}
        </h2>
        <p>
          {isEditMode
            ? messages.editEmailDescription
            : messages.verifyEmailDescription}
        </p>

        {!isEditMode && (
          <strong className="email-modal__address">{currentEmail}</strong>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {isEditMode && (
            <div className="email-modal__field">
              <label htmlFor="settings-new-email">{messages.newEmail}</label>
              <input
                ref={inputRef}
                id="settings-new-email"
                type="email"
                value={email}
                placeholder="name@example.com"
                autoComplete="email"
                aria-invalid={Boolean(error)}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
              />
              {error && <span>{error}</span>}
            </div>
          )}

          <div className="email-modal__actions">
            <button type="button" disabled={isSubmitting} onClick={onClose}>
              {messages.cancel}
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? messages.processing
                : isEditMode
                  ? messages.continueEditEmail
                  : messages.sendVerificationEmail}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
