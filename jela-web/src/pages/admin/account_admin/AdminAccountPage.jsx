import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ProfileAvatar from '../../../components/profile/ProfileAvatar';
import AccountStatusSection from '../../../components/settings/AccountStatusSection';
import SecuritySection from '../../../components/settings/SecuritySection';
import ChangePasswordModal from '../../../components/settings/ChangePasswordModal';
import EmailActionModal from '../../../components/settings/EmailActionModal';
import {
  PROFILE_TRANSLATIONS,
} from '../../../constants/profileConstants';
import {
  SETTINGS_TRANSLATIONS,
} from '../../../constants/settingsConstants';
import { useAppPreferences } from '../../../hooks/useAppPreferences';
import { useAuth } from '../../../hooks/useAuth';
import {
  normalizePhoneNumber,
  validateProfileForm,
} from '../../../utils/profileValidators';
import {
  changeCurrentPassword,
  getCurrentAccount,
  normalizeCurrentAccount,
  sendCurrentEmailVerification,
  updateCurrentAccount,
  updateCurrentEmail,
} from '../../../services/admin/adminCurrentAccountService';
import '../../../styles/profile.css';
import '../../../styles/settings.css';

const toProfileForm = (account) => ({
  fullName: account.fullName || '',
  phone: account.phoneNumber || '',
  avatar: account.avatarUrl || '',
});

const formatDateTime = (value, language) => {
  if (!value) return '—';
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
};

export default function AdminAccountPage() {
  const { user, updateUser } = useAuth();
  const { language } = useAppPreferences();
  const profileMessages =
    PROFILE_TRANSLATIONS[language] || PROFILE_TRANSLATIONS.vi;
  const settingsMessages =
    SETTINGS_TRANSLATIONS[language] || SETTINGS_TRANSLATIONS.vi;
  const initialAccount = useMemo(
    () => normalizeCurrentAccount(user),
    [user],
  );
  const initialForm = useMemo(
    () => toProfileForm(initialAccount),
    [initialAccount],
  );

  const [account, setAccount] = useState(initialAccount);
  const [form, setForm] = useState(initialForm);
  const [savedForm, setSavedForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState(null);
  const [isProcessingEmail, setIsProcessingEmail] = useState(false);
  useEffect(() => {
    let isActive = true;

    const loadAccount = async () => {
      try {
        const currentAccount = await getCurrentAccount();
        if (!isActive) return;

        const nextForm = toProfileForm(currentAccount);
        setAccount(currentAccount);
        setForm(nextForm);
        setSavedForm(nextForm);
        updateUser(currentAccount);
      } catch (loadError) {
        if (!isActive) return;
        toast.error(
          loadError.response?.data?.message ||
            loadError.message ||
            'Không thể tải thông tin tài khoản quản trị.',
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadAccount();
    return () => {
      isActive = false;
    };
  }, [updateUser]);

  const provider = String(
    account.authType ||
      account.provider ||
      account.authProvider ||
      account.loginProvider ||
      '',
  ).toLowerCase();
  const isGoogleAccount =
    Boolean(account.googleId) ||
    provider.includes('google') ||
    account.avatarUrl.includes('googleusercontent.com');
  const isExternalAccount =
    isGoogleAccount ||
    ['facebook', 'apple', 'github', 'microsoft'].some((name) =>
      provider.includes(name),
    );
  const isVerified = Boolean(
    account.emailVerified ??
      account.isEmailVerified ??
      account.verified ??
      account.email_verified,
  );
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: null }));
    }
  };

  const handleCancelProfile = () => {
    setForm(savedForm);
    setErrors({});
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    const validationErrors = validateProfileForm(
      {
        fullName: form.fullName,
        phone: form.phone,
      },
      language,
    );
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;
    if (!isDirty) {
      toast(profileMessages.noChanges);
      return;
    }

    setIsSaving(true);

    const normalizedPhone = normalizePhoneNumber(form.phone);
    const payload = {
      fullName: form.fullName.trim(),
      phone: normalizedPhone,
      phoneNumber: normalizedPhone,
      avatarUrl: form.avatar,
    };

    try {
      const response = await updateCurrentAccount(payload);
      const updatedAccount = normalizeCurrentAccount({
        ...account,
        ...payload,
        ...response,
      });
      const updatedForm = toProfileForm(updatedAccount);

      setAccount(updatedAccount);
      setForm(updatedForm);
      setSavedForm(updatedForm);
      updateUser(updatedAccount);
      toast.success(profileMessages.saved);
    } catch (saveError) {
      toast.error(
        saveError.response?.data?.message ||
          saveError.message ||
          profileMessages.saveError,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (passwords) => {
    setIsChangingPassword(true);

    try {
      await changeCurrentPassword(passwords);
      setIsPasswordModalOpen(false);
      toast.success(settingsMessages.passwordChanged);
    } catch (passwordError) {
      const status = passwordError.response?.status;
      const backendMessage = passwordError.response?.data?.message;
      let message =
        backendMessage || settingsMessages.passwordChangeFailed;

      if (passwordError.code === 'CHANGE_PASSWORD_API_NOT_CONFIGURED') {
        message = settingsMessages.changePasswordApiMissing;
      } else if (status === 400 || status === 401) {
        message =
          backendMessage || settingsMessages.currentPasswordIncorrect;
      } else if (status === 429) {
        message = settingsMessages.passwordRateLimited;
      }

      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEmailAction = async (newEmail) => {
    setIsProcessingEmail(true);

    try {
      if (emailModalMode === 'verify') {
        await sendCurrentEmailVerification();
        toast.success(settingsMessages.verificationEmailSent);
      } else {
        const response = await updateCurrentEmail(newEmail);
        const updatedEmail =
          response?.email || response?.user?.email || newEmail;
        const updatedAccount = {
          ...account,
          email: updatedEmail,
          emailVerified: false,
        };

        setAccount(updatedAccount);
        updateUser({
          email: updatedEmail,
          emailVerified: false,
        });
        toast.success(settingsMessages.emailUpdated);
      }

      setEmailModalMode(null);
    } catch (emailError) {
      const backendMessage = emailError.response?.data?.message;
      let message =
        emailModalMode === 'verify'
          ? settingsMessages.verificationEmailFailed
          : settingsMessages.emailUpdateFailed;

      if (emailError.code === 'EMAIL_VERIFICATION_API_NOT_CONFIGURED') {
        message = settingsMessages.emailVerificationApiMissing;
      } else if (emailError.code === 'EMAIL_UPDATE_API_NOT_CONFIGURED') {
        message = settingsMessages.emailUpdateApiMissing;
      } else if (backendMessage) {
        message = backendMessage;
      }

      toast.error(message);
    } finally {
      setIsProcessingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div
        role="status"
        style={{
          textAlign: 'center',
          padding: 48,
          color: 'var(--admin-color-on-surface-variant)',
        }}
      >
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <h1>Tài khoản Quản trị</h1>
          <p>Xem và cập nhật thông tin cá nhân của bạn</p>
        </div>
        {isDirty && (
          <span className="admin-badge admin-badge--info">
            Có thay đổi chưa lưu
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <div className="admin-form-container" style={{ padding: 24 }}>
          <ProfileAvatar
            avatar={form.avatar}
            originalAvatar={savedForm.avatar}
            displayName={form.fullName || account.email || 'JELA Admin'}
            isGoogleAccount={isGoogleAccount}
            messages={profileMessages}
            onAvatarChange={(avatar) => {
              setForm((current) => ({ ...current, avatar }));
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginTop: 24,
            }}
          >
            <div className="admin-info-row">
              <span className="admin-info-row__label">Vai trò</span>
              <strong className="admin-info-row__value">
                Quản trị viên
              </strong>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-row__label">Ngày tạo</span>
              <strong className="admin-info-row__value">
                {formatDateTime(account.createdAt, language)}
              </strong>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-row__label">
                Đăng nhập gần nhất
              </span>
              <strong className="admin-info-row__value">
                {formatDateTime(account.lastLoginAt, language)}
              </strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <form
            className="admin-form-container"
            style={{ padding: 24 }}
            onSubmit={handleSaveProfile}
            noValidate
          >
            <h3
              style={{
                margin: '0 0 20px',
                fontSize: 18,
                color: 'var(--admin-color-navy)',
              }}
            >
              Cập nhật thông tin
            </h3>

            <div className="admin-form-group" style={{ marginBottom: 16 }}>
              <label className="admin-form-label" htmlFor="admin-full-name">
                Họ và tên
              </label>
              <input
                id="admin-full-name"
                type="text"
                name="fullName"
                className="admin-form-input"
                value={form.fullName}
                onChange={handleProfileChange}
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && (
                <span className="admin-form-error">{errors.fullName}</span>
              )}
            </div>

            <div className="admin-form-group" style={{ marginBottom: 24 }}>
              <label className="admin-form-label" htmlFor="admin-phone">
                Số điện thoại
              </label>
              <input
                id="admin-phone"
                type="tel"
                name="phone"
                className="admin-form-input"
                value={form.phone}
                onChange={handleProfileChange}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <span className="admin-form-error">{errors.phone}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="admin-btn admin-btn--outline"
                disabled={isSaving || !isDirty}
                onClick={handleCancelProfile}
              >
                Hủy thay đổi
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={isSaving}
              >
                {isSaving ? 'Đang cập nhật...' : 'Lưu thông tin'}
              </button>
            </div>
          </form>

          <div className="settings-card">
            <AccountStatusSection
              email={account.email}
              isLoading={false}
              isVerified={isVerified}
              isExternalAccount={isExternalAccount}
              messages={settingsMessages}
              onEditEmail={() => setEmailModalMode('edit')}
              onSendVerification={() => setEmailModalMode('verify')}
            />
            <SecuritySection
              isExternalAccount={isExternalAccount}
              messages={settingsMessages}
              passwordUnavailableMessage={
                isGoogleAccount
                  ? settingsMessages.googlePasswordBlocked
                  : settingsMessages.externalPasswordNote
              }
              onChangePassword={() => setIsPasswordModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <ChangePasswordModal
        key={
          isPasswordModalOpen
            ? 'admin-password-modal-open'
            : 'admin-password-modal-closed'
        }
        isOpen={isPasswordModalOpen}
        isSubmitting={isChangingPassword}
        messages={settingsMessages}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />

      <EmailActionModal
        key={emailModalMode || 'admin-email-modal-closed'}
        currentEmail={account.email || ''}
        isOpen={Boolean(emailModalMode)}
        isSubmitting={isProcessingEmail}
        messages={settingsMessages}
        mode={emailModalMode}
        onClose={() => setEmailModalMode(null)}
        onSubmit={handleEmailAction}
      />

    </div>
  );
}
