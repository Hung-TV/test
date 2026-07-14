import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useKanjiI18n } from '../hooks/useKanjiI18n';

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function StartLevelConfirmModal({ level, totalKanji, onConfirm, onCancel, isLoading, messages }) {
  return (
    <div className="kanji-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="kanji-confirm-title">
      <div className="kanji-confirm-modal">
        <h3 id="kanji-confirm-title" className="kanji-confirm-modal__title">
          {messages.confirmStartTitle(level)}
        </h3>
        <p className="kanji-confirm-modal__message">
          {messages.confirmStartMessage(level, totalKanji)}
        </p>
        <div className="kanji-confirm-modal__actions">
          <button
            type="button"
            className="kanji-confirm-modal__cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {messages.confirmCancelBtn}
          </button>
          <button
            type="button"
            className="kanji-confirm-modal__confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? messages.startingLevel : messages.confirmStartBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Level Card ───────────────────────────────────────────────────────────────
function KanjiLevelCard({ levelData, isActive, onSelect, onStartLevel, onStudyLevel }) {
  const { messages } = useKanjiI18n();
  const { level, totalKanji, learnedKanji, isUnlocked, listId } = levelData;
  const percent = totalKanji > 0 ? Math.round((learnedKanji / totalKanji) * 100) : 0;

  const hasStarted = listId != null;

  const handleSelect = () => {
    if (!isUnlocked) return;
    onSelect(level);
  };

  const handleBtnClick = (event) => {
    event.stopPropagation();
    if (!isUnlocked) return;
    if (hasStarted) {
      // Đã tạo danh sách — navigate sang Danh sách học
      onStudyLevel(level, listId);
    } else {
      // Chưa có danh sách — mở confirm modal
      onStartLevel(level, totalKanji);
    }
  };

  const actionLabel = hasStarted ? messages.studyNow : messages.startLevel;

  return (
    <div
      className={[
        'kanji-level-card',
        isActive ? 'kanji-level-card--active' : '',
        !isUnlocked ? 'kanji-level-card--locked' : '',
      ].filter(Boolean).join(' ')}
      onClick={handleSelect}
      role="button"
      tabIndex={isUnlocked ? 0 : -1}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
      aria-disabled={!isUnlocked}
      aria-pressed={isActive}
    >
      <div className="kanji-level-card__header">
        <span className={`kanji-level-badge${!isUnlocked ? ' kanji-level-badge--locked' : ''}`}>
          {level}
        </span>
        {!isUnlocked && <Lock size={13} />}
      </div>

      <h3>{messages.levelNames[level] ?? level}</h3>

      <div className="kanji-level-progress-bg">
        <div
          className="kanji-level-progress-fill"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="kanji-level-percent">{percent}%</div>
      <span className="kanji-level-card__count">
        {messages.kanjiCount(learnedKanji, totalKanji)}
      </span>

      <button
        type="button"
        className={`kanji-level-card__btn${hasStarted ? ' kanji-level-card__btn--primary' : ' kanji-level-card__btn--start'}`}
        disabled={!isUnlocked}
        onClick={handleBtnClick}
      >
        {actionLabel}
      </button>
    </div>
  );
}

// ─── Level Section ────────────────────────────────────────────────────────────
export default function KanjiLevelSection({
  levels,
  isLoading,
  isStartingLevel = false,
  selectedLevel,
  onSelectLevel,
  onStartLevel,
  onStudyLevel,
}) {
  const { messages } = useKanjiI18n();

  // Confirm modal state
  const [confirmLevel, setConfirmLevel] = useState(null);
  const [confirmTotalKanji, setConfirmTotalKanji] = useState(0);

  const handleRequestStart = (level, totalKanji) => {
    setConfirmLevel(level);
    setConfirmTotalKanji(totalKanji);
  };

  const handleCancelConfirm = () => {
    setConfirmLevel(null);
  };

  const handleConfirmStart = () => {
    if (confirmLevel) {
      onStartLevel(confirmLevel);
      setConfirmLevel(null);
    }
  };

  if (isLoading) {
    return (
      <section className="kanji-level-section">
        <h2 className="kanji-section-heading">{messages.roadmap}</h2>
        <div className="kanji-level-grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="kanji-level-card">
              <span className="kanji-skeleton" style={{ height: 18, width: '40%' }} />
              <span className="kanji-skeleton" style={{ height: 14, width: '70%' }} />
              <span className="kanji-skeleton" style={{ height: 5, borderRadius: 99 }} />
              <span className="kanji-skeleton" style={{ height: 32 }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!levels || levels.length === 0) {
    return (
      <section className="kanji-level-section">
        <h2 className="kanji-section-heading">{messages.roadmap}</h2>
        <div className="kanji-state-box">{messages.noLevelData}</div>
      </section>
    );
  }

  return (
    <section className="kanji-level-section">
      <h2 className="kanji-section-heading">{messages.roadmap}</h2>
      <div className="kanji-level-grid">
        {levels.map((levelData) => (
          <KanjiLevelCard
            key={levelData.level}
            levelData={levelData}
            isActive={selectedLevel === levelData.level}
            onSelect={onSelectLevel}
            onStartLevel={handleRequestStart}
            onStudyLevel={onStudyLevel}
          />
        ))}
      </div>

      {confirmLevel && (
        <StartLevelConfirmModal
          level={confirmLevel}
          totalKanji={confirmTotalKanji}
          onConfirm={handleConfirmStart}
          onCancel={handleCancelConfirm}
          isLoading={isStartingLevel}
          messages={messages}
        />
      )}
    </section>
  );
}
