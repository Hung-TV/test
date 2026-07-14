import { useCallback, useMemo, useState } from 'react';
import userApi from '../api/userApi';
import Toast from '../components/common/Toast';
import LevelChangeDialog from '../components/profile/LevelChangeDialog';
import ProfileAvatar from '../components/profile/ProfileAvatar';
import ProfileForm from '../components/profile/ProfileForm';
import { PROFILE_LEVELS } from '../constants/profileConstants';
import { useAppPreferences } from '../hooks/useAppPreferences';
import { useAuth } from '../hooks/useAuth';
import { normalizePhoneNumber, validateProfileForm } from '../utils/profileValidators';
import '../styles/profile.css';

const getAvatar = (user) => user?.avatarUrl || user?.avatar || user?.picture || '';

const getProfileForm = (user) => {
  const currentLevel = user?.level || user?.jlptLevel;

  return {
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || user?.phone || '',
    level: PROFILE_LEVELS.includes(currentLevel) ? currentLevel : 'N5',
    avatar: getAvatar(user),
  };
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { language, messages } = useAppPreferences();
  const initialProfile = useMemo(() => getProfileForm(user), [user]);
  const [form, setForm] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [lastUpdatedAt, setLastUpdatedAt] = useState(
    user?.profileUpdatedAt || user?.updatedAt || null,
  );

  const provider = String(user?.provider || user?.authProvider || '').toLowerCase();
  const isGoogleAccount =
    provider.includes('google') ||
    Boolean(user?.googleId) ||
    getAvatar(user).includes('googleusercontent.com');
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedProfile);
  const closeToast = useCallback(() => {
    setToast({ message: '', type: 'info' });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: null }));
    }
  };

  const handleCancel = () => {
    setForm(savedProfile);
    setErrors({});
    setToast({ message: '', type: 'info' });
  };

  const saveProfile = async () => {
    setIsSaving(true);

    const normalizedPhone = normalizePhoneNumber(form.phone);
    const profilePayload = {
      ...form,
      fullName: form.fullName.trim(),
      phone: normalizedPhone,
      phoneNumber: normalizedPhone,
      jlptLevel: form.level,
      avatarUrl: form.avatar,
    };

    try {
      const response = await userApi.updateProfile(profilePayload);
      const serverProfile = response?.user || response || {};
      const updatedAt =
        serverProfile.profileUpdatedAt ||
        serverProfile.updatedAt ||
        new Date().toISOString();
      const updatedProfile = {
        ...profilePayload,
        ...serverProfile,
        // Chuẩn hóa lại các alias để Header và form dùng cùng một giá trị.
        phone: serverProfile.phoneNumber || serverProfile.phone || normalizedPhone,
        level: serverProfile.level || serverProfile.jlptLevel || form.level,
        avatar:
          serverProfile.avatarUrl ||
          serverProfile.avatar ||
          serverProfile.picture ||
          form.avatar,
      };

      updateUser({
        ...updatedProfile,
        phoneNumber: updatedProfile.phone,
        jlptLevel: updatedProfile.level,
        avatarUrl: updatedProfile.avatar,
        profileUpdatedAt: updatedAt,
      });

      setForm(updatedProfile);
      setSavedProfile(updatedProfile);
      setLastUpdatedAt(updatedAt);
      setToast({ message: messages.saved, type: 'success' });
      setIsLevelDialogOpen(false);
    } catch (error) {
      setToast({
        message: error.response?.data?.message || messages.saveError,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateProfileForm(form, language);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    if (!isDirty) {
      setToast({ message: messages.noChanges, type: 'info' });
      return;
    }

    if (form.level !== savedProfile.level) {
      setIsLevelDialogOpen(true);
      return;
    }

    saveProfile();
  };

  const parsedUpdatedAt = lastUpdatedAt ? new Date(lastUpdatedAt) : null;
  const formattedDate =
    parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime())
      ? new Intl.DateTimeFormat(
          language === 'en' ? 'en-US' : 'vi-VN',
          { dateStyle: 'long', timeStyle: 'short' },
        ).format(parsedUpdatedAt)
      : null;

  return (
    <main className="profile-page">
      <header className="profile-page__header">
        <div>
          <p className="dashboard-label">{messages.accountLabel}</p>
          <h1>{messages.pageTitle}</h1>
        </div>
        {isDirty && <span>{messages.unsaved}</span>}
      </header>

      <ProfileAvatar
        avatar={form.avatar}
        originalAvatar={savedProfile.avatar}
        displayName={form.fullName || user?.email || 'JELA'}
        isGoogleAccount={isGoogleAccount}
        messages={messages}
        onAvatarChange={(avatar) => {
          setForm((current) => ({ ...current, avatar }));
        }}
      />

      <ProfileForm
        form={form}
        errors={errors}
        messages={messages}
        isSaving={isSaving}
        onChange={handleChange}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />

      <footer className="profile-page__footer">
        <span aria-hidden="true">●</span>
        {formattedDate
          ? `${messages.lastUpdated}: ${formattedDate}`
          : `${messages.lastUpdated}: ${messages.neverUpdated}`}
      </footer>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      <LevelChangeDialog
        isOpen={isLevelDialogOpen}
        currentLevel={savedProfile.level}
        nextLevel={form.level}
        messages={messages}
        onCancel={() => setIsLevelDialogOpen(false)}
        onConfirm={saveProfile}
      />
    </main>
  );
}
