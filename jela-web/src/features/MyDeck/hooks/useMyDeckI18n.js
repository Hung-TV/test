import { useCallback } from 'react';
import { useAppPreferences } from '../../../hooks/useAppPreferences';
import {
  getLocalizedDeckTitle,
  MY_DECK_TRANSLATIONS,
} from '../constants/myDeckTranslations';

export const useMyDeckI18n = () => {
  const { language, theme } = useAppPreferences();
  const messages = MY_DECK_TRANSLATIONS[language] || MY_DECK_TRANSLATIONS.vi;
  const getDeckTitle = useCallback(
    (deck) => getLocalizedDeckTitle(deck, language),
    [language],
  );

  return {
    language,
    theme,
    messages,
    getDeckTitle,
  };
};
