import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AUTH_ASSETS } from '../components/auth/authAssets';
import { ArrowIcon, GoogleIcon, LockIcon, MailIcon, EyeIcon, EyeOffIcon } from '../components/auth/AuthIcons';
import authApi from '../api/authApi';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword } from '../utils/validators';
import { useAppPreferences } from '../hooks/useAppPreferences';
import { AUTH_TRANSLATIONS } from '../constants/authConstants';

const REMEMBER_LOGIN_KEY = 'jela.rememberedLogin';

const readRememberedLogin = () => {
  try {
    return JSON.parse(localStorage.getItem(REMEMBER_LOGIN_KEY) || 'null');
  } catch {
    localStorage.removeItem(REMEMBER_LOGIN_KEY);
    return null;
  }
};

const saveRememberedLogin = ({ email, password, shouldRemember }) => {
  if (!shouldRemember) {
    localStorage.removeItem(REMEMBER_LOGIN_KEY);
    return;
  }

  // Chỉ lưu khi người dùng chủ động chọn ghi nhớ trên thiết bị cá nhân.
  localStorage.setItem(REMEMBER_LOGIN_KEY, JSON.stringify({ email, password }));
};

export default function LoginPage() {
  const { login } = useAuth();
  const { language } = useAppPreferences();
  const t = AUTH_TRANSLATIONS[language] || AUTH_TRANSLATIONS.vi;
  const loginTranslations = t.login;

  const rememberedLogin = readRememberedLogin();
  const [email, setEmail] = useState(rememberedLogin?.email || '');
  const [password, setPassword] = useState(rememberedLogin?.password || '');
  const [rememberLogin, setRememberLogin] = useState(Boolean(rememberedLogin));
  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading khi đăng nhập thường
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Trạng thái loading khi đăng nhập bằng Google
  const [allowGoogleLogin, setAllowGoogleLogin] = useState(true);

  useEffect(() => {
    authApi.getSettings()
      .then((settings) => {
        if (settings) {
          setAllowGoogleLogin(settings.allowGoogleLogin !== false);
        }
      })
      .catch((err) => {
        console.error("Failed to load settings in Login view:", err);
      });
  }, []);

  // Hàm xử lý chung sau khi đăng nhập thành công
  const handleLoginSuccess = (data) => {
    saveRememberedLogin({
      email: email.trim(),
      password,
      shouldRemember: rememberLogin,
    });

    // Gọi hàm login từ AuthContext để lưu thông tin user và token
    login(data);
    toast.success(loginTranslations.toastSuccess);
  };

  // Hàm validate form sử dụng utils/validators.js
  const validate = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    const newErrors = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý đăng nhập thông thường
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ngăn chặn gửi nhiều request liên tục
    if (isLoading || isGoogleLoading) return;

    // Validate form trước khi gửi API
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    toast.dismiss();

    try {
      const data = await authApi.login({ email, password });
      console.log('Login response:', data);

      // AuthResponse hiện chưa trả authType, vì vậy frontend đánh dấu rõ
      // tài khoản đăng nhập bằng email/mật khẩu là LOCAL để Settings áp dụng
      // đúng nghiệp vụ đổi mật khẩu, kể cả sau khi tải lại trang.
      handleLoginSuccess({
        ...data,
        user: {
          ...data.user,
          authType: data.user?.authType || 'LOCAL',
        },
      });

    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';

      // Hiển thị toast lỗi dựa trên status code hoặc message từ backend
      if (status === 403 || errorMessage.includes('lock') || errorMessage.includes('khóa')) {
        toast.error(loginTranslations.toastLocked);
      } else if (status === 401 || status === 400 || errorMessage.includes('password') || errorMessage.includes('email')) {
        toast.error(loginTranslations.toastFailed);
      } else {
        toast.error(loginTranslations.toastError);
      }

      setIsLoading(false);
    }
  };

  // Hook của @react-oauth/google
  const googleLoginAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      toast.dismiss();
      try {
        // Dùng flow 'implicit' thì lấy token từ access_token
        // Dùng `googleLogin` api cũ của chúng ta không cần id_token.
        // Chỉ cần bỏ flow: 'auth-code' để chuyển về implicit (mặc định)
        // và lấy access_token từ tokenResponse.access_token hoặc tokenResponse.credential.
        const idToken = tokenResponse.credential || tokenResponse.access_token;

        if (!idToken) {
          throw new Error(loginTranslations.googleTokenError);
        }

        const data = await authApi.googleLogin({ idToken });
        console.log('Google login response:', data);

        // Lưu rõ nguồn đăng nhập Google vì AuthResponse hiện chưa có authType.
        // Giá trị này được AuthContext đồng bộ vào localStorage.
        handleLoginSuccess({
          ...data,
          user: {
            ...data.user,
            authType: data.user?.authType || 'GOOGLE',
          },
        });

      } catch (error) {
        console.error('Google login error:', error.response?.data || error.message);
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message?.toLowerCase() || '';

        if (status === 403 || errorMessage.includes('lock') || errorMessage.includes('khóa')) {
          toast.error(loginTranslations.toastLocked);
        } else if (errorMessage.includes('malformed')) {
          toast.error(loginTranslations.googleTokenError);
        } else {
          toast.error(loginTranslations.toastError);
        }
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      console.error('Google Login Failed');
      toast.error(loginTranslations.googleFailed);
      setIsGoogleLoading(false);
    }
  });

  // Hàm trigger đăng nhập Google (tránh click nhiều lần)
  const handleGoogleSignIn = () => {
    if (isLoading || isGoogleLoading) return;
    googleLoginAction();
  };

  const errorStyle = { color: '#ef4444', fontSize: '0.875rem', marginTop: '0.35rem', display: 'block' };

  return (
    <>
      <header className="login-form-header">
        <h1>{loginTranslations.title}</h1>
        <p>{loginTranslations.subtitle}</p>
      </header>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="login-field">
          <label htmlFor="email">{loginTranslations.emailLabel}</label>
          <div className="login-input-wrapper">
            <span className="login-input-icon"><MailIcon /></span>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="nguyenvana@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              autoComplete="email"
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          {errors.email && <span style={errorStyle}>{errors.email}</span>}
        </div>

        <div className="login-field">
          <div className="login-field-header">
            <label htmlFor="password">{loginTranslations.passwordLabel}</label>
            <Link 
              to="/forgot-password" 
              state={{ email: email.trim() }} 
              className="login-forgot-link"
            >
              {loginTranslations.forgotPasswordLink}
            </Link>
          </div>
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
              autoComplete="current-password"
              disabled={isLoading || isGoogleLoading}
            />
            {/* Nút Ẩn/Hiện mật khẩu */}
            <button
              type="button"
              className="login-input-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? (language === 'vi' ? 'Ẩn mật khẩu' : 'Hide password') : (language === 'vi' ? 'Hiện mật khẩu' : 'Show password')}
              disabled={isLoading || isGoogleLoading}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && <span style={errorStyle}>{errors.password}</span>}
        </div>

        <label className="login-remember">
          <input
            type="checkbox"
            checked={rememberLogin}
            onChange={(event) => setRememberLogin(event.target.checked)}
            disabled={isLoading || isGoogleLoading}
          />
          <span>
            {loginTranslations.rememberLabel}
            <small>{loginTranslations.rememberSmall}</small>
          </span>
        </label>

        <button 
          type="submit" 
          className="login-btn-primary"
          disabled={isLoading || isGoogleLoading}
          style={isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
        >
          {isLoading ? loginTranslations.loggingIn : loginTranslations.loginButton}
          {!isLoading && <ArrowIcon />}
        </button>

        {allowGoogleLogin && (
          <>
            <div className="login-divider">
              <span>{loginTranslations.orDivider}</span>
            </div>

            <button 
              type="button" 
              className="login-btn-google" 
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              style={isGoogleLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
              {AUTH_ASSETS.googleIcon ? (
                <img src={AUTH_ASSETS.googleIcon} alt="" />
              ) : (
                <GoogleIcon />
              )}
              {isGoogleLoading ? loginTranslations.connectingGoogle : loginTranslations.googleButton}
            </button>
          </>
        )}
      </form>

      <p className="login-footer">
        {loginTranslations.noAccount} <Link to="/signup">{loginTranslations.registerLink}</Link>
      </p>
    </>
  );
}
