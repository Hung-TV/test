import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowIcon, MailIcon } from '../components/auth/AuthIcons';
import authApi from '../api/authApi';
import { validateEmail } from '../utils/validators';
import { useAppPreferences } from '../hooks/useAppPreferences';
import { AUTH_TRANSLATIONS } from '../constants/authConstants';

export default function ResetPasswordPage() {
  const location = useLocation();
  const { language } = useAppPreferences();
  const t = AUTH_TRANSLATIONS[language] || AUTH_TRANSLATIONS.vi;
  const forgotTranslations = t.forgot;

  const [email, setEmail] = useState(() => {
    // 1. Tự động lấy email nếu được truyền từ state (khi click từ màn hình login)
    if (location.state?.email) return location.state.email;

    // 2. Fallback: Lấy email từ localStorage (Ghi nhớ đăng nhập) để tăng UX tiện lợi
    try {
      const remembered = JSON.parse(localStorage.getItem('jela.rememberedLogin') || 'null');
      return remembered?.email || '';
    } catch {
      return '';
    }
  });
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const validationError = validateEmail(email);
    setEmailError(validationError || '');
    if (validationError) return;

    setIsLoading(true);
    toast.dismiss();

    try {
      await authApi.forgotPassword({ email });
      toast.success(forgotTranslations.toastSuccess);
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      toast.error(forgotTranslations.toastError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="login-form-header">
        <h1>{forgotTranslations.title}</h1>
        <p>{forgotTranslations.subtitle}</p>
      </header>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-field">
          <label htmlFor="reset-email">{forgotTranslations.emailLabel}</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><MailIcon /></span>
            <input
              id="reset-email"
              type="email"
              className="login-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          {emailError && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              {emailError}
            </span>
          )}
        </div>

        <button type="submit" className="login-btn-primary" disabled={isLoading}>
          {isLoading ? forgotTranslations.sending : forgotTranslations.sendButton}
          {!isLoading && <ArrowIcon />}
        </button>
      </form>

      <p className="login-footer">
        <Link to="/login">{forgotTranslations.backToLogin}</Link>
      </p>

    </>
  );
}
