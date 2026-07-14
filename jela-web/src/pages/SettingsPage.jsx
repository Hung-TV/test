import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AccountStatusSection from '../components/settings/AccountStatusSection';
import NotificationsSection from '../components/settings/NotificationsSection';
import PreferencesSection from '../components/settings/PreferencesSection';
import SecuritySection from '../components/settings/SecuritySection';
import ChangePasswordModal from '../components/settings/ChangePasswordModal';
import EmailActionModal from '../components/settings/EmailActionModal';
import authApi from '../api/authApi';
import userApi from '../api/userApi';
import {
  SETTINGS_NOTIFICATION_KEYS,
  SETTINGS_TRANSLATIONS,
} from '../constants/settingsConstants';
import { useAppPreferences } from '../hooks/useAppPreferences';
import { useAuth } from '../hooks/useAuth';
import '../styles/settings.css';

const readStoredBoolean = (key, fallback) => {
  const value = localStorage.getItem(key);
  return value === null ? fallback : value === 'true';
};

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const { language, theme, setLanguage, setTheme } = useAppPreferences();
  const messages = SETTINGS_TRANSLATIONS[language] || SETTINGS_TRANSLATIONS.vi;
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState(null);
  const [isProcessingEmail, setIsProcessingEmail] = useState(false);
  const [isResolvingAuthType, setIsResolvingAuthType] = useState(
    () => !user?.authType,
  );
  const [isLoadingAccountStatus, setIsLoadingAccountStatus] = useState(true);
  const [notifications, setNotifications] = useState(() => ({
    email: readStoredBoolean(SETTINGS_NOTIFICATION_KEYS.email, true),
    streak: readStoredBoolean(SETTINGS_NOTIFICATION_KEYS.streak, true),
  }));

  useEffect(() => {
    let isActive = true;

    // AuthResponse đăng nhập hiện chưa trả đầy đủ authType và emailVerified.
    // Luôn đồng bộ /users/me khi mở Settings để trạng thái loại tài khoản và
    // xác minh email được hiển thị theo dữ liệu mới nhất trong database.
    userApi.getCurrentUser()
      .then((currentUser) => {
        if (isActive && currentUser) updateUser(currentUser);
      })
      .catch(() => {
        // Axios đã xử lý phiên hết hạn. Lỗi mạng tạm thời không được làm Settings
        // crash; các dấu hiệu provider cũ vẫn được dùng làm fallback bên dưới.
      })
      .finally(() => {
        if (isActive) {
          setIsResolvingAuthType(false);
          setIsLoadingAccountStatus(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [updateUser]);

  const provider = String(
    user?.authType ||
    user?.provider ||
    user?.authProvider ||
    user?.loginProvider ||
    '',
  ).toLowerCase();
  const isGoogleAccount =
    Boolean(user?.googleId) ||
    provider.includes('google') ||
    String(user?.avatarUrl || user?.avatar || user?.picture || '').includes(
      'googleusercontent.com',
    );
  const isExternalAccount =
    isGoogleAccount ||
    ['google', 'facebook', 'apple', 'github', 'microsoft'].some((name) =>
      provider.includes(name),
    );
  const isPasswordUnavailable = isResolvingAuthType || isExternalAccount;

  const isVerified = useMemo(() => {
    // TODO(API): backend hiện chưa có endpoint riêng cho Account Status.
    // Khi có API /users/me hoặc /account/status, hãy đồng bộ kết quả vào user
    // với một trong các field emailVerified/isEmailVerified/verified.
    return Boolean(
      user?.emailVerified ??
      user?.isEmailVerified ??
      user?.verified ??
      user?.email_verified,
    );
  }, [user]);

  const handleOpenPasswordModal = () => {
    // Nút của tài khoản Google/third-party đã disabled thật ở SecuritySection.
    // Guard này giữ an toàn nếu hàm bị gọi từ một nguồn khác trong tương lai.
    if (isPasswordUnavailable) return;
    setIsPasswordModalOpen(true);
  };

  const handleChangePassword = async (passwords) => {
    setIsChangingPassword(true);
    toast.dismiss();

    try {
      await authApi.changePassword(passwords);
      setIsPasswordModalOpen(false);
      toast.success(messages.passwordChanged);
    } catch (error) {
      const status = error.response?.status;
      const backendMessage = error.response?.data?.message;
      let message = backendMessage || messages.passwordChangeFailed;

      if (error.code === 'CHANGE_PASSWORD_API_NOT_CONFIGURED') {
        message = messages.changePasswordApiMissing;
      } else if (status === 400 || status === 401) {
        message = backendMessage || messages.currentPasswordIncorrect;
      } else if (status === 429) {
        message = messages.passwordRateLimited;
      }

      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEmailAction = async (newEmail) => {
    setIsProcessingEmail(true);
    toast.dismiss();

    try {
      if (emailModalMode === 'verify') {
        await userApi.sendVerificationEmail();
        toast.success(messages.verificationEmailSent);
      } else {
        const response = await userApi.updateEmail(newEmail);
        const updatedEmail = response?.email || response?.user?.email || newEmail;

        // Email mới luôn quay về trạng thái chưa xác minh cho tới khi user mở
        // liên kết do backend gửi và /users/me trả emailVerified=true.
        updateUser({ email: updatedEmail, emailVerified: false });
        toast.success(messages.emailUpdated);
      }

      setEmailModalMode(null);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      let message =
        emailModalMode === 'verify'
          ? messages.verificationEmailFailed
          : messages.emailUpdateFailed;

      if (error.code === 'EMAIL_VERIFICATION_API_NOT_CONFIGURED') {
        message = messages.emailVerificationApiMissing;
      } else if (error.code === 'EMAIL_UPDATE_API_NOT_CONFIGURED') {
        message = messages.emailUpdateApiMissing;
      } else if (backendMessage) {
        message = backendMessage;
      }

      toast.error(message);
    } finally {
      setIsProcessingEmail(false);
    }
  };

  const handleNotificationChange = (name, checked) => {
    // TODO(API): các tùy chọn hiện được lưu local để UI hoạt động ngay.
    // Khi backend hỗ trợ notification preferences, thay phần này bằng API
    // PATCH và chỉ cập nhật state sau khi server trả thành công.
    const key = SETTINGS_NOTIFICATION_KEYS[name];
    localStorage.setItem(key, String(checked));
    setNotifications((current) => ({ ...current, [name]: checked }));
    toast.success(messages.notificationSaved);
  };

  const handleLogout = () => {
    logout();
    toast.success(
      language === 'en' ? 'Signed out successfully.' : 'Đăng xuất thành công.',
    );
  };

  return (
    <main className="settings-page">
      <header className="settings-page__header">
        <p>JELA</p>
        <h1>{messages.pageTitle}</h1>
      </header>

      <div className="settings-card">
        <AccountStatusSection
          email={user?.email}
          isLoading={isLoadingAccountStatus}
          isVerified={isVerified}
          isExternalAccount={isExternalAccount}
          messages={messages}
          onEditEmail={() => setEmailModalMode('edit')}
          onSendVerification={() => setEmailModalMode('verify')}
        />
        <SecuritySection
          isExternalAccount={isPasswordUnavailable}
          messages={messages}
          passwordUnavailableMessage={
            isResolvingAuthType
              ? messages.checkingAccountType
              : isGoogleAccount
              ? messages.googlePasswordBlocked
              : messages.externalPasswordNote
          }
          onChangePassword={handleOpenPasswordModal}
        />
        <PreferencesSection
          language={language}
          theme={theme}
          messages={messages}
          onLanguageChange={setLanguage}
          onThemeChange={setTheme}
        />
        <NotificationsSection
          values={notifications}
          messages={messages}
          onChange={handleNotificationChange}
        />

        <footer className="settings-card__footer">
          <button type="button" className="settings-signout" onClick={handleLogout}>
            <span aria-hidden="true">⇥</span>
            {messages.signOut}
          </button>
        </footer>
      </div>

      <ChangePasswordModal
        key={isPasswordModalOpen ? 'password-modal-open' : 'password-modal-closed'}
        isOpen={isPasswordModalOpen}
        isSubmitting={isChangingPassword}
        messages={messages}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />

      <EmailActionModal
        key={emailModalMode || 'email-modal-closed'}
        currentEmail={user?.email || ''}
        isOpen={Boolean(emailModalMode)}
        isSubmitting={isProcessingEmail}
        messages={messages}
        mode={emailModalMode}
        onClose={() => setEmailModalMode(null)}
        onSubmit={handleEmailAction}
      />

    </main>
  );
}
