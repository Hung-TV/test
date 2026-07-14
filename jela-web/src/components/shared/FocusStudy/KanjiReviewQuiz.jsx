import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Flame, Check, Sparkles, Loader2, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import { useAppPreferences } from '../../../hooks/useAppPreferences';
import { useAuth } from '../../../hooks/useAuth';
import kanjiApi from '../../../features/KanjiLearning/services/kanjiApi';
import dictionaryApi from '../../../api/dictionaryApi';
import './focus-study.css';

// Inline translations
const TRANSLATIONS = {
  vi: {
    title: 'Luyện tập học Kanji',
    questionCount: (current, total) => `Câu hỏi ${current} / ${total}`,
    correct: 'Chính xác!',
    incorrect: 'Chưa chính xác!',
    next: 'Câu tiếp theo',
    finish: 'Hoàn thành bài học',
    loading: 'Đang tải bộ câu hỏi AI...',
    explaining: 'Đang kết nối AI giải thích...',
    explainBtn: 'Xem AI Giải thích 🌟',
    closeExplain: 'Đóng giải thích',
    emptyTitle: 'Không có nội dung học',
    emptyDesc: 'Không tìm thấy chữ Hán nào cần học trong danh sách này.',
    close: 'Đóng',
    again: 'Học lại',
    hard: 'Khó',
    good: 'Thuộc tốt',
    submitting: 'Đang gửi kết quả...',
    submitSuccess: 'Lưu tiến trình học tập thành công!',
    resultsTitle: 'Kết quả buổi học',
    correctRate: 'Tỷ lệ chính xác',
    streak: (days) => `Chuỗi ${days} ngày`,
    lessonProgress: 'TIẾN ĐỘ LUYỆN TẬP',
    retry: 'Thử lại',
    explainError: 'Đã xảy ra lỗi khi lấy giải thích từ AI.'
  },
  en: {
    title: 'Kanji Review Practice',
    questionCount: (current, total) => `Question ${current} / ${total}`,
    correct: 'Correct!',
    incorrect: 'Incorrect!',
    next: 'Next Question',
    finish: 'Finish Review',
    loading: 'Loading AI questions...',
    explaining: 'Connecting to AI for explanation...',
    explainBtn: 'Show AI Explanation 🌟',
    closeExplain: 'Close explanation',
    emptyTitle: 'No review items',
    emptyDesc: 'No Kanji due for review found in this list.',
    close: 'Close',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    submitting: 'Submitting results...',
    submitSuccess: 'Review progress saved!',
    resultsTitle: 'Review Session Results',
    correctRate: 'Accuracy Rate',
    streak: (days) => `${days} days streak`,
    lessonProgress: 'REVIEW PROGRESS',
    retry: 'Retry',
    explainError: 'An error occurred while fetching explanation from AI.'
  }
};

export default function KanjiReviewQuiz({
  listId,
  listName,
  onClose,
  batchSize = 10,
  preloadedQuestions = null,
  deckType = 'kanji'
}) {
  const { language, theme } = useAppPreferences();
  const { user, refreshUser } = useAuth();
  const copy = useMemo(() => {
    const base = TRANSLATIONS[language] || TRANSLATIONS.vi;
    if (deckType === 'dictionary') {
      return {
        ...base,
        title: language === 'en' ? 'Vocabulary Study Session' : 'Luyện tập học từ vựng',
        emptyDesc: language === 'en' 
          ? 'No vocabulary words found to study in this list.' 
          : 'Không tìm thấy từ vựng nào cần học trong danh sách này.'
      };
    }
    return base;
  }, [language, deckType]);

  const hasPreloadedQuestions = Array.isArray(preloadedQuestions);
  const [loading, setLoading] = useState(!hasPreloadedQuestions);
  const [questions, setQuestions] = useState(() => (
    hasPreloadedQuestions ? preloadedQuestions : []
  ));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  
  // Track user answers
  const [answers, setAnswers] = useState([]);
  
  // AI Explanation states
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasExplainError, setHasExplainError] = useState(false);
  
  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load review session questions from API or use preloaded
  useEffect(() => {
    if (hasPreloadedQuestions) return undefined;

    let active = true;
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = deckType === 'dictionary'
          ? await dictionaryApi.getReviewSession(listId, batchSize)
          : await kanjiApi.getReviewSession(listId, batchSize);
        if (active) {
          if (res && Array.isArray(res.questions)) {
            setQuestions(res.questions);
          } else {
            setQuestions([]);
          }
        }
      } catch (err) {
        console.error('Error fetching review questions:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchQuestions();
    return () => { active = false; };
  }, [listId, batchSize, deckType, hasPreloadedQuestions]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (index) => {
    if (selectedOptionIndex !== null || isCompleted) return;
    setSelectedOptionIndex(index);
    
    const isCorrect = index === currentQuestion.correctIndex;
    
    // Add to answers log
    setAnswers((prev) => [
      ...prev,
      {
        kanjiId: currentQuestion.kanjiId || currentQuestion.dictionaryId,
        character: currentQuestion.character,
        questionType: currentQuestion.questionType,
        selectedOption: currentQuestion.options[index],
        correctOption: currentQuestion.options[currentQuestion.correctIndex],
        isCorrect
      }
    ]);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setExplanation('');
      setShowExplanation(false);
      setHasExplainError(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleFetchExplanation = async () => {
    if (!currentQuestion || selectedOptionIndex === null) return;
    try {
      setExplaining(true);
      setShowExplanation(true);
      setExplanation('');
      setHasExplainError(false);

      const correctChar = currentQuestion.character;
      const selectedChar = currentQuestion.options[selectedOptionIndex];

      // onChunk: append từng đoạn text nhận được vào state (hiệu ứng streaming)
      const onChunk = (chunk) => {
        setExplanation((prev) => prev + chunk);
      };

      if (deckType === 'dictionary') {
        await dictionaryApi.explainReviewStream(correctChar, selectedChar, currentQuestion.questionType, onChunk);
      } else {
        await kanjiApi.explainAnswerStream(correctChar, selectedChar, onChunk);
      }
    } catch (err) {
      console.error('Error fetching explanation:', err);
      setExplanation(copy.explainError);
      setHasExplainError(true);
    } finally {
      setExplaining(false);
    }
  };

  // Group answers by Kanji and determine Ebbinghaus Quality (1, 2, 3)
  const finalReviews = useMemo(() => {
    if (!isCompleted) return [];

    // Group answers by kanjiId
    const grouped = {};
    answers.forEach((ans) => {
      if (!grouped[ans.kanjiId]) {
        grouped[ans.kanjiId] = {
          kanjiId: ans.kanjiId,
          character: ans.character,
          correctCount: 0,
          totalCount: 0
        };
      }
      grouped[ans.kanjiId].totalCount += 1;
      if (ans.isCorrect) {
        grouped[ans.kanjiId].correctCount += 1;
      }
    });

    // Map to quality scores
    return Object.values(grouped).map((item) => {
      let quality = 3; // default Good
      const wrongCount = item.totalCount - item.correctCount;

      if (wrongCount === 1) {
        quality = 2; // Hard
      } else if (wrongCount >= 2) {
        quality = 1; // Again
      }

      return {
        kanjiId: item.kanjiId,
        character: item.character,
        quality,
        correctCount: item.correctCount,
        totalCount: item.totalCount
      };
    });
  }, [answers, isCompleted]);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (isCompleted && finalReviews.length > 0 && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      const submitData = async () => {
        try {
          setSubmitting(true);
          if (deckType === 'dictionary') {
            const submitPayload = finalReviews.map((r) => ({
              dictionaryId: r.kanjiId,
              quality: r.quality
            }));
            await dictionaryApi.submitReview(listId, submitPayload);
          } else {
            const submitPayload = finalReviews.map((r) => ({
              kanjiId: r.kanjiId,
              quality: r.quality
            }));
            await kanjiApi.submitReview(listId, submitPayload);
          }
          if (typeof refreshUser === 'function') {
            await refreshUser();
          }
          setHasSubmitted(true);
        } catch (err) {
          console.error('Error auto-submitting reviews:', err);
          hasSubmittedRef.current = false;
          alert('Không thể lưu tiến trình ôn tập. Vui lòng thử lại.');
          setHasSubmitted(false);
        } finally {
          setSubmitting(false);
        }
      };
      submitData();
    }
  }, [isCompleted, finalReviews, listId, deckType, refreshUser]);

  const handleSubmit = async () => {
    if (submitting) return;
    if (hasSubmitted) {
      onClose?.();
      return;
    }

    try {
      setSubmitting(true);
      if (deckType === 'dictionary') {
        const submitPayload = finalReviews.map((r) => ({
          dictionaryId: r.kanjiId,
          quality: r.quality
        }));
        await dictionaryApi.submitReview(listId, submitPayload);
      } else {
        const submitPayload = finalReviews.map((r) => ({
          kanjiId: r.kanjiId,
          quality: r.quality
        }));
        await kanjiApi.submitReview(listId, submitPayload);
      }
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
      setHasSubmitted(true);
      onClose?.();
    } catch (err) {
      console.error('Error submitting reviews:', err);
      alert('Không thể lưu tiến trình ôn tập. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const correctAnswersCount = answers.filter((a) => a.isCorrect).length;
  const accuracyRate = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;

  // Render content
  if (loading) {
    return (
      <div className="focus-session-overlay" data-theme={theme}>
        <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>{copy.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="focus-session-overlay" data-theme={theme}>
        <div className="focus-session-header">
          <button type="button" className="focus-btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <main className="focus-session-main">
          <section className="focus-session-message">
            <h2>{copy.emptyTitle}</h2>
            <p>{copy.emptyDesc}</p>
            <button type="button" className="focus-btn-gotit" onClick={onClose}>
              {copy.close}
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="focus-session-overlay" data-theme={theme} role="dialog" aria-modal="true">
      {/* Styles local cho Quiz */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .focus-session-overlay {
          display: flex !important;
          flex-direction: column !important;
          overflow-y: auto !important;
        }
        .focus-session-main {
          display: block !important;
          overflow: visible !important;
          height: auto !important;
          min-height: 0 !important;
          padding: 24px 20px !important;
        }
        .quiz-card {
          width: min(100%, 600px);
          margin: 0 auto;
          background: var(--focus-card);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid var(--color-surface-container-highest);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .quiz-question-type {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--color-primary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .quiz-question-text {
          font-size: clamp(1.2rem, 3.5vw, 1.5rem);
          font-weight: 700;
          color: var(--color-on-surface);
          line-height: 1.4;
        }
        .quiz-options {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .quiz-option-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--color-surface-container-low);
          border: 2px solid transparent;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-on-surface);
          cursor: pointer;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }
        .quiz-option-btn:hover:not(:disabled) {
          background: var(--color-surface-container-high);
          border-color: var(--color-outline-variant);
          transform: translateY(-1px);
        }
        .quiz-option-btn--correct {
          background: rgba(46, 204, 113, 0.15) !important;
          border-color: rgb(46, 204, 113) !important;
          color: rgb(39, 174, 96) !important;
        }
        .quiz-option-btn--incorrect {
          background: rgba(231, 76, 60, 0.15) !important;
          border-color: rgb(231, 76, 60) !important;
          color: rgb(192, 57, 43) !important;
        }
        .quiz-action-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }
        .explain-box {
          margin-top: 16px;
          padding: 16px;
          border-radius: 12px;
          background: rgba(var(--color-primary-rgb), 0.05);
          border: 1px dashed var(--color-primary);
          color: var(--color-on-surface);
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .explain-box h3, .explain-box h4 {
          margin-top: 0;
          color: var(--color-primary);
        }
        .explain-box ul {
          margin: 8px 0;
          padding-left: 20px;
        }
        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 99px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 16px;
          margin: 20px 0;
        }
        .results-stat {
          padding: 16px;
          background: var(--color-surface-container-high);
          border-radius: 12px;
          text-align: center;
        }
        .results-stat strong {
          display: block;
          font-size: 1.8rem;
          color: var(--color-primary);
        }
        .results-stat span {
          font-size: 0.8rem;
          color: var(--color-on-surface-variant);
          font-weight: 600;
        }
        .kanji-quality-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 8px;
          margin: 16px 0;
        }
        .kanji-quality-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--color-surface-container-low);
          border-radius: 8px;
        }
        .kanji-quality-char {
          font-size: 1.4rem;
          font-weight: 700;
        }
        .badge-quality {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .badge-quality--1 {
          background: rgba(231, 76, 60, 0.15);
          color: rgb(231, 76, 60);
        }
        .badge-quality--2 {
          background: rgba(241, 196, 15, 0.15);
          color: rgb(212, 172, 13);
        }
        .badge-quality--3 {
          background: rgba(46, 204, 113, 0.15);
          color: rgb(46, 204, 113);
        }
      `}</style>

      {/* Header */}
      <div className="focus-session-header">
        <button type="button" className="focus-btn-close" onClick={onClose} aria-label={copy.close}>
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="focus-progress-container">
          <div className="focus-progress-top">
            <span className="focus-progress-title">{copy.lessonProgress}</span>
            <span className="focus-progress-count">
              {isCompleted ? copy.questionCount(totalQuestions, totalQuestions) : copy.questionCount(currentIndex + 1, totalQuestions)}
            </span>
          </div>
          <div className="focus-progress-bar-bg" role="progressbar">
            <div
              className="focus-progress-bar-fill"
              style={{ width: `${((isCompleted ? totalQuestions : currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className="focus-streak-badge">
          <Flame size={16} className="focus-streak-icon" />
          <span>{copy.streak(user?.streakCount || 0)}</span>
        </div>
      </div>

      {/* Main content */}
      <main className="focus-session-main">
        {!isCompleted ? (
          <div className="quiz-card">
            <div className="quiz-question-type">{currentQuestion.questionType.replace(/_/g, ' ')}</div>
            <div className="quiz-question-text">{currentQuestion.questionText}</div>
            
            <div className="quiz-options">
              {currentQuestion.options.map((option, idx) => {
                let btnClass = 'quiz-option-btn';
                if (selectedOptionIndex !== null) {
                  if (idx === currentQuestion.correctIndex) {
                    btnClass += ' quiz-option-btn--correct';
                  } else if (idx === selectedOptionIndex) {
                    btnClass += ' quiz-option-btn--incorrect';
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    className={btnClass}
                    onClick={() => handleSelectOption(idx)}
                    disabled={selectedOptionIndex !== null}
                  >
                    <span>{option}</span>
                    {selectedOptionIndex !== null && idx === currentQuestion.correctIndex && (
                      <Check size={20} />
                    )}
                    {selectedOptionIndex !== null && idx === selectedOptionIndex && idx !== currentQuestion.correctIndex && (
                      <X size={20} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {showExplanation && (
              <div className="explain-box">
                <div className="ai-badge">
                  <Sparkles size={12} />
                  <span>JELA AI</span>
                </div>
                {explaining ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Loader2 className="animate-spin" size={18} />
                    <span>{copy.explaining}</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ whiteSpace: 'pre-line', marginBottom: hasExplainError ? '12px' : '0' }}>{explanation}</div>
                    {hasExplainError && (
                      <button
                        type="button"
                        onClick={handleFetchExplanation}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          backgroundColor: 'var(--color-error-container, #ffebee)',
                          color: 'var(--color-error, #d32f2f)',
                          border: '1px solid var(--color-error, #d32f2f)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                      >
                        <RefreshCw size={14} />
                        <span>{copy.retry}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="quiz-action-footer">
              {selectedOptionIndex !== null && selectedOptionIndex !== currentQuestion.correctIndex && !showExplanation && (
                <button
                  type="button"
                  className="focus-btn-review"
                  onClick={handleFetchExplanation}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px' }}
                >
                  <BookOpen size={16} />
                  <span>{copy.explainBtn}</span>
                </button>
              )}

              {selectedOptionIndex !== null && (
                <button
                  type="button"
                  className="focus-btn-gotit"
                  onClick={handleNext}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
                >
                  <span>{currentIndex === totalQuestions - 1 ? copy.finish : copy.next}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <section className="focus-session-message focus-session-complete">
            <span className="focus-complete-icon">
              <Check size={34} strokeWidth={3} />
            </span>
            <h2>{copy.resultsTitle}</h2>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1rem', marginTop: 4 }}>
              Danh sách: <strong>{listName}</strong>
            </p>

            <div className="results-grid">
              <div className="results-stat">
                <strong>{accuracyRate}%</strong>
                <span>{copy.correctRate}</span>
              </div>
              <div className="results-stat">
                <strong>{answers.filter((a) => a.isCorrect).length} / {totalQuestions}</strong>
                <span>Số câu đúng</span>
              </div>
            </div>

            <h3 style={{ textAlign: 'left', margin: '20px 0 8px', fontSize: '1.1rem', color: 'var(--color-on-surface)' }}>
              Đánh giá Ebbinghaus theo chữ Hán:
            </h3>
            
            <div className="kanji-quality-list">
              {finalReviews.map((rev) => (
                <div key={rev.kanjiId} className="kanji-quality-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="kanji-quality-char">{rev.character}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-on-surface-variant)' }}>
                      (Đúng {rev.correctCount}/{rev.totalCount})
                    </span>
                  </div>
                  <span className={`badge-quality badge-quality--${rev.quality}`}>
                    {rev.quality === 3 ? copy.good : rev.quality === 2 ? copy.hard : copy.again}
                  </span>
                </div>
              ))}
            </div>

            <div className="focus-complete-actions" style={{ width: '100%', marginTop: 24 }}>
              <button
                type="button"
                className="focus-btn-gotit"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{copy.submitting}</span>
                  </>
                ) : (
                  <>
                    <Check size={20} strokeWidth={3} />
                    <span>{copy.finish}</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
