import { useCallback } from 'react';
import { useAppPreferences } from '../../../hooks/useAppPreferences';
import {
  formatKanjiRelativeTime,
  getLocalizedKanjiMeaning,
  KANJI_LEARNING_TRANSLATIONS,
} from '../constants/kanjiLearningTranslations';

export const useKanjiI18n = () => {
  const { language } = useAppPreferences();
  const messages = KANJI_LEARNING_TRANSLATIONS[language]
    || KANJI_LEARNING_TRANSLATIONS.vi;
  const getMeaning = useCallback(
    (item) => getLocalizedKanjiMeaning(item, language),
    [language],
  );
  const formatRelativeTime = useCallback(
    (value) => formatKanjiRelativeTime(value, language),
    [language],
  );

  return {
    language,
    messages,
    getMeaning,
    formatRelativeTime,
  };
};
