import { EyeIcon, EyeOffIcon } from '../auth/AuthIcons';

export default function PasswordField({
  autoComplete,
  error,
  label,
  name,
  onChange,
  onToggleVisibility,
  placeholder,
  inputRef,
  showPassword,
  value,
}) {
  return (
    <div className="password-field">
      <label htmlFor={`change-password-${name}`}>{label}</label>
      <div className={`password-field__control${error ? ' password-field__control--error' : ''}`}>
        <input
          id={`change-password-${name}`}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `change-password-${name}-error` : undefined}
          ref={inputRef}
          onChange={onChange}
        />
        <button
          type="button"
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onClick={onToggleVisibility}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <span id={`change-password-${name}-error`} className="password-field__error">
          {error}
        </span>
      )}
    </div>
  );
}
