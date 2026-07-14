import { useCallback } from 'react';
import { useAppPreferences } from '../../../hooks/useAppPreferences';
import {
  DICTIONARY_TRANSLATIONS,
  formatDictionaryDate,
  getLocalizedDictionaryGloss,
  getLocalizedExampleSentence,
} from '../constants/dictionaryTranslations';

export const useDictionaryI18n = () => {
  const { language } = useAppPreferences();
  const messages = DICTIONARY_TRANSLATIONS[language]
    || DICTIONARY_TRANSLATIONS.vi;
  const getGloss = useCallback(
    (meaning) => getLocalizedDictionaryGloss(meaning, language),
    [language],
  );
  const getExampleSentence = useCallback(
    (example) => getLocalizedExampleSentence(example, language),
    [language],
  );
  const formatDate = useCallback(
    (value) => formatDictionaryDate(value, language),
    [language],
  );

  return {
    language,
    messages,
    getGloss,
    getExampleSentence,
    formatDate,
  };
};
