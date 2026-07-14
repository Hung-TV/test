import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Flame, RefreshCcw, Check, RotateCcw } from 'lucide-react';
import { FOCUS_STUDY_TRANSLATIONS } from '../../../constants/focusStudyConstants';
import { useAppPreferences } from '../../../hooks/useAppPreferences';
import { useAuth } from '../../../hooks/useAuth';
import FlippableCard from './FlippableCard';
import './focus-study.css';

export default function FocusModeSession({
  kanjiList = [],
  onClose,
}) {
  const { language, theme } = useAppPreferences();
  const { user } = useAuth();
  const copy = FOCUS_STUDY_TRANSLATIONS[language] || FOCUS_STUDY_TRANSLATIONS.vi;
  const studyCards = useMemo(
    () => (Array.isArray(kanjiList)
      ? kanjiList.filter((kanji) => kanji?.character)
      : []),
    [kanjiList],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState({ remembered: 0, review: 0 });
  const [isCompleted, setIsCompleted] = useState(false);

  const totalCards = studyCards.length;
  const activeIndex = Math.min(currentIndex, Math.max(totalCards - 1, 0));
  const currentKanji = studyCards[activeIndex];
  const displayedCard = totalCards === 0 ? 0 : activeIndex + 1;
  const progress = totalCards === 0
    ? 0
    : ((isCompleted ? totalCards : displayedCard) / totalCards) * 100;

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setResults({ remembered: 0, review: 0 });
    setIsCompleted(false);
  }, []);

  const rateCard = useCallback((result) => {
    if (!currentKanji || isCompleted) return;

    setResults((current) => ({
      ...current,
      [result]: current[result] + 1,
    }));

    if (activeIndex >= totalCards - 1) {
      setIsCompleted(true);
      return;
    }

    setCurrentIndex(activeIndex + 1);
  }, [activeIndex, currentKanji, isCompleted, totalCards]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="focus-session-overlay"
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-session-title"
    >
      <div className="focus-session-header">
        <button
          type="button"
          className="focus-btn-close"
          onClick={onClose}
          aria-label={copy.close}
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="focus-progress-container">
          <div className="focus-progress-top">
            <span id="focus-session-title" className="focus-progress-title">
              {copy.lessonProgress}
            </span>
            <span className="focus-progress-count">
              {copy.cardCount(displayedCard, totalCards)}
            </span>
          </div>
          <div
            className="focus-progress-bar-bg"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax={totalCards}
            aria-valuenow={isCompleted ? totalCards : displayedCard}
          >
            <div
              className="focus-progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="focus-streak-badge">
          <Flame size={16} className="focus-streak-icon" />
          <span>{copy.streak(user?.streakCount || 0)}</span>
        </div>
      </div>

      <main className="focus-session-main">
        {totalCards === 0 ? (
          <section className="focus-session-message">
            <h2>{copy.emptyTitle}</h2>
            <p>{copy.emptyDescription}</p>
            <button type="button" className="focus-btn-gotit" onClick={onClose}>
              {copy.finish}
            </button>
          </section>
        ) : isCompleted ? (
          <section className="focus-session-message focus-session-complete">
            <span className="focus-complete-icon" aria-hidden="true">
              <Check size={34} strokeWidth={3} />
            </span>
            <h2>{copy.completedTitle}</h2>
            <p>{copy.completedDescription}</p>
            <div className="focus-results">
              <div>
                <strong>{results.remembered}</strong>
                <span>{copy.rememberedResult}</span>
              </div>
              <div>
                <strong>{results.review}</strong>
                <span>{copy.reviewResult}</span>
              </div>
            </div>
            <div className="focus-complete-actions">
              <button type="button" className="focus-btn-review" onClick={resetSession}>
                <RotateCcw size={20} strokeWidth={2.5} />
                <span>{copy.studyAgain}</span>
              </button>
              <button type="button" className="focus-btn-gotit" onClick={onClose}>
                <Check size={21} strokeWidth={3} />
                <span>{copy.finish}</span>
              </button>
            </div>
          </section>
        ) : (
          <FlippableCard
            key={currentKanji?.id ?? `${currentKanji?.character}-${activeIndex}`}
            kanjiData={currentKanji}
            language={language}
            labels={copy}
          />
        )}
      </main>

      {totalCards > 0 && !isCompleted && (
        <footer className="focus-session-footer">
          <button
            type="button"
            className="focus-btn-review"
            onClick={() => rateCard('review')}
          >
            <RefreshCcw size={20} strokeWidth={2.5} />
            <span>{copy.needsReview}</span>
          </button>
          <button
            type="button"
            className="focus-btn-gotit"
            onClick={() => rateCard('remembered')}
          >
            <Check size={24} strokeWidth={3} />
            <span>{copy.remembered}</span>
          </button>
        </footer>
      )}
    </div>
  );
}
