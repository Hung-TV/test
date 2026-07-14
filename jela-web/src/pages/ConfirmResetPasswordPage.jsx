import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LockIcon, EyeIcon, EyeOffIcon, ArrowIcon } from '../components/auth/AuthIcons';
import authApi from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { validatePassword } from '../utils/validators';
import { useAppPreferences } from '../hooks/useAppPreferences';
import { AUTH_TRANSLATIONS } from '../constants/authConstants';

export default function ConfirmResetPasswordPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { language } = useAppPreferences();
  const t = AUTH_TRANSLATIONS[language] || AUTH_TRANSLATIONS.vi;
  const resetTranslations = t.confirmReset;

  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const passwordError = validatePassword(password);
    const confirmPasswordError = validatePassword(confirmPassword);
    
    const newErrors = {};
    if (!token) newErrors.token = language === 'vi' ? "Mã xác nhận không được để trống." : "Verification token cannot be empty.";
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = language === 'vi' ? "Mật khẩu xác nhận không hợp lệ." : "Confirm password is invalid.";
    if (password !== confirmPassword) newErrors.confirmPassword = language === 'vi' ? "Mật khẩu không khớp." : "Passwords do not match.";

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
      await authApi.resetPassword({ token, newPassword: password, confirmPassword });
      toast.success(resetTranslations.toastSuccess);
      
      logout();

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';
      if (errorMessage.includes('token')) {
        toast.error(resetTranslations.toastInvalidToken);
      } else {
        toast.error(resetTranslations.toastError);
      }
      setIsLoading(false);
    }
  };

  const errorStyle = { color: '#ef4444', fontSize: '0.875rem', marginTop: '0.35rem', display: 'block' };

  return (
    <>
      <header className="login-form-header">
        <h1>{resetTranslations.title}</h1>
        <p>{resetTranslations.subtitle}</p>
      </header>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="login-field">
          <label htmlFor="token">{resetTranslations.tokenLabel}</label>
          <div className="login-input-wrapper">
            <input
              id="token"
              type="text"
              className="login-input"
              placeholder={resetTranslations.tokenPlaceholder}
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                if (errors.token) setErrors({ ...errors, token: null });
              }}
              disabled={isLoading}
            />
          </div>
           {errors.token && <span style={errorStyle}>{errors.token}</span>}
        </div>

        <div className="login-field">
          <label htmlFor="password">{resetTranslations.newPasswordLabel}</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><LockIcon /></span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="login-input login-input--toggle"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
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
        </div>

        <div className="login-field">
          <label htmlFor="confirmPassword">{resetTranslations.confirmPasswordLabel}</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><LockIcon /></span>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className="login-input login-input--toggle"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
              }}
              disabled={isLoading}
            />
            <button
              type="button"
              className="login-input-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? (language === 'vi' ? 'Ẩn mật khẩu' : 'Hide password') : (language === 'vi' ? 'Hiện mật khẩu' : 'Show password')}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.confirmPassword && <span style={errorStyle}>{errors.confirmPassword}</span>}
        </div>

        <button 
          type="submit" 
          className="login-btn-primary"
          disabled={isLoading}
          style={isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
        >
          {isLoading ? resetTranslations.submitting : resetTranslations.submitButton}
          {!isLoading && <ArrowIcon />}
        </button>
      </form>

      <p className="login-footer">
        <Link to="/login">{resetTranslations.backToLogin}</Link>
      </p>

    </>
  );
}
