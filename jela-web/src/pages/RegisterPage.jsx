import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from '../components/auth/AuthIcons';
import authApi from '../api/authApi';
import { JLPT_LEVEL_LABELS, JLPT_LEVELS, AUTH_TRANSLATIONS } from '../constants/authConstants';
import { useAppPreferences } from '../hooks/useAppPreferences';
import { 
  validateFullName, 
  validateEmail, 
  validateRegisterPassword, 
  validateRequired 
} from '../utils/validators';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { language } = useAppPreferences();
  const t = AUTH_TRANSLATIONS[language] || AUTH_TRANSLATIONS.vi;
  const regTranslations = t.register;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [level, setLevel] = useState('N5');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);

  useEffect(() => {
    authApi.getSettings()
      .then((settings) => {
        if (settings) {
          setAllowRegistration(settings.allowRegistration !== false);
        }
      })
      .catch((err) => {
        console.error("Failed to load settings in Register view:", err);
      });
  }, []);

  const validate = () => {
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validateRegisterPassword(password);
    const levelError = validateRequired(level, 'Vui lòng chọn trình độ tiếng Nhật');

    const newErrors = {};
    if (fullNameError) newErrors.fullName = fullNameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (levelError) newErrors.level = levelError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    toast.dismiss();

    try {
      const data = await authApi.register({ email, password, fullName, level });
      console.log('Register response:', data);

      toast.success(regTranslations.toastSuccess);
      navigate('/login');
      return;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';

      if (status === 500) {
        toast.error(regTranslations.toastServerError);
      } else if (status === 409 || status === 400 || errorMessage.includes('email')) {
        setErrors({ email: language === 'vi' ? 'Email này đã được đăng ký' : 'This email is already registered' });
        toast.error(regTranslations.toastEmailConflict);
      } else {
        toast.error(regTranslations.toastError);
      }
      setIsLoading(false);
    }
  };

  const errorStyle = { color: '#ef4444', fontSize: '0.875rem', marginTop: '0.35rem', display: 'block' };

  // Các biến cờ kiểm tra yêu cầu mật khẩu thời gian thực để cải thiện UX
  const isLengthValid = password.length >= 8 && password.length <= 32;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return (
    <>
      <header className="login-form-header">
        <h1>{regTranslations.title}</h1>
        <p>{regTranslations.subtitle}</p>
      </header>

      {allowRegistration ? (
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="fullName">{regTranslations.fullNameLabel}</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon"><UserIcon /></span>
              <input
                id="fullName"
                type="text"
                className="login-input"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: null });
                }}
                autoComplete="name"
                disabled={isLoading}
              />
            </div>
            {errors.fullName ? (
              <span style={errorStyle}>{errors.fullName}</span>
            ) : (
              <span className="field-helper">{regTranslations.fullNameHelper}</span>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="register-email">{regTranslations.emailLabel}</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon"><MailIcon /></span>
              <input
                id="register-email"
                type="email"
                className="login-input"
                placeholder="nguyenvana@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {errors.email ? (
              <span style={errorStyle}>{errors.email}</span>
            ) : (
              <span className="field-helper">{regTranslations.emailHelper}</span>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="register-password">{regTranslations.passwordLabel}</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon"><LockIcon /></span>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input login-input--toggle"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="login-input-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? (language === 'vi' ? 'Ẩn mật khẩu' : 'Hide password') : (language === 'vi' ? 'Hiện mật khẩu' : 'Show password')}
                disabled={isLoading}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <span style={errorStyle}>{errors.password}</span>}

            {/* Checklist kiểm tra yêu cầu mật khẩu thời gian thực */}
            <div className="password-checklist">
              <span className="password-checklist-title">{regTranslations.passwordHelper}</span>
              <ul>
                <li className={password ? (isLengthValid ? 'met' : 'unmet') : ''}>
                  <span className="bullet">✓</span> {regTranslations.passCriteriaLength}
                </li>
                <li className={password ? (hasUpperCase ? 'met' : 'unmet') : ''}>
                  <span className="bullet">✓</span> {regTranslations.passCriteriaUpper}
                </li>
                <li className={password ? (hasLowerCase ? 'met' : 'unmet') : ''}>
                  <span className="bullet">✓</span> {regTranslations.passCriteriaLower}
                </li>
                <li className={password ? (hasNumber ? 'met' : 'unmet') : ''}>
                  <span className="bullet">✓</span> {regTranslations.passCriteriaNumber}
                </li>
              </ul>
            </div>
          </div>

          <div className="login-field">
            <label>{regTranslations.levelLabel}</label>
            <div className="auth-level-group" role="group" aria-label="Trình độ tiếng Nhật">
              {JLPT_LEVELS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`auth-level-btn${level === item ? ' auth-level-btn--active' : ''}`}
                  onClick={() => {
                    setLevel(item);
                    if (errors.level) setErrors({ ...errors, level: null });
                  }}
                  aria-pressed={level === item}
                  disabled={isLoading}
                >
                  {JLPT_LEVEL_LABELS[item]}
                </button>
              ))}
            </div>
            {errors.level && <span style={errorStyle}>{errors.level}</span>}
          </div>

          <button
            type="submit"
            className="login-btn-primary"
            disabled={isLoading}
            style={isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
          >
            {isLoading ? regTranslations.registering : regTranslations.registerButton}
          </button>
        </form>
      ) : (
        <div style={{
          padding: 24,
          textAlign: 'center',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 12,
          marginTop: 24,
          marginBottom: 24
        }}>
          <p style={{ margin: 0, color: '#ef4444', fontWeight: 'bold', fontSize: 16 }}>
            {regTranslations.regClosedTitle}
          </p>
          <p style={{ margin: '8px 0 0 0', color: 'var(--admin-color-on-surface-variant)', fontSize: 14 }}>
            {regTranslations.regClosedSub}
          </p>
        </div>
      )}

      <p className="login-footer">
        {regTranslations.hasAccount} <Link to="/login">{regTranslations.loginLink}</Link>
      </p>

      <p className="auth-legal">
        {language === 'vi' ? (
          <>
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <a href="#">{regTranslations.termsLink}</a> và{' '}
            <a href="#">{regTranslations.privacyLink}</a> của JELA.
          </>
        ) : (
          <>
            By registering, you agree to our{' '}
            <a href="#">{regTranslations.termsLink}</a> and{' '}
            <a href="#">{regTranslations.privacyLink}</a>.
          </>
        )}
      </p>
    </>
  );
}
