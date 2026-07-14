import { useEffect, useState } from 'react';
import {
  PROFILE_PREFERENCES_EVENT,
  PROFILE_TRANSLATIONS,
} from '../constants/profileConstants';

const readPreferences = () => ({
  language: localStorage.getItem('appLanguage') || 'vi',
  theme: localStorage.getItem('appTheme') || 'light',
});

const savePreference = (key, value) => {
  localStorage.setItem(key, value);
  // storage không phát trên cùng tab, vì vậy dùng event nội bộ để mọi component
  // đang dùng hook cập nhật ngay mà không cần tải lại trang.
  window.dispatchEvent(new Event(PROFILE_PREFERENCES_EVENT));
};

export const useAppPreferences = () => {
  const [preferences, setPreferences] = useState(readPreferences);

  useEffect(() => {
    const syncPreferences = () => setPreferences(readPreferences());

    window.addEventListener(PROFILE_PREFERENCES_EVENT, syncPreferences);
    window.addEventListener('storage', syncPreferences);

    return () => {
      window.removeEventListener(PROFILE_PREFERENCES_EVENT, syncPreferences);
      window.removeEventListener('storage', syncPreferences);
    };
  }, []);

  useEffect(() => {
    // Profile chỉ đọc preference hiện tại. Setting sau này có thể thay appTheme,
    // appLanguage rồi phát PROFILE_PREFERENCES_EVENT để UI cập nhật ngay.
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.lang = preferences.language;
  }, [preferences]);

  return {
    ...preferences,
    setLanguage: (language) => savePreference('appLanguage', language),
    setTheme: (theme) => savePreference('appTheme', theme),
    messages:
      PROFILE_TRANSLATIONS[preferences.language] || PROFILE_TRANSLATIONS.vi,
  };
};
