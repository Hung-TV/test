import { useMyDeckI18n } from '../hooks/useMyDeckI18n';

export default function DeckCard({ deck, onStudy, onViewDetails }) {
  const { messages, getDeckTitle } = useMyDeckI18n();
  const title = getDeckTitle(deck);

  const statusClass = deck.type === 'kanji'
    ? deck.completed
      ? 'deck-card--completed'
      : deck.dueCount > 0
      ? 'deck-card--due'
      : 'deck-card--safe'
    : '';

  return (
    <article className={`deck-card ${statusClass}`} onClick={() => onViewDetails?.(deck)}>
      {deck.completed && (
        <div className="deck-card__completed-stamp" title="Đã hoàn thành">
          {messages.achievement}
        </div>
      )}

      <div className="deck-card__header">
        <h3 className="deck-card__title">
          {title}
        </h3>
        {deck.dueCount > 0 && !deck.completed && (
          <span className="deck-card__due-badge">
            {messages.dueCount(deck.dueCount)}
          </span>
        )}
      </div>

      <div className="deck-card__stats">
        <div className="deck-card__stat-item">
          <span className="deck-card__stat-label">
            {deck.type === 'kanji' ? 'Tổng số chữ:' : 'Tổng số từ:'}
          </span>
          <span className="deck-card__stat-value">{deck.totalWords ?? 0}</span>
        </div>
        <div className="deck-card__stat-item">
          <span className="deck-card__stat-label">{messages.newWords}</span>
          <span className="deck-card__stat-value">{deck.newCount ?? 0}</span>
        </div>
        <div className="deck-card__stat-item">
          <span className="deck-card__stat-label">{messages.learning}</span>
          <span className="deck-card__stat-value">{deck.learningCount ?? 0}</span>
        </div>
        <div className="deck-card__stat-item">
          <span className="deck-card__stat-label">{messages.mastered}</span>
          <span className="deck-card__stat-value">{deck.masteredCount ?? 0}</span>
        </div>

        {!deck.completed && (
          deck.dueCount > 0 ? (
            <div className="deck-card__due-alert">
              <span className="deck-card__due-alert-icon">🔥</span>
              <span className="deck-card__due-alert-message">
                {messages.dueAlert(deck.dueCount, deck.type === 'kanji')}
              </span>
            </div>
          ) : (
            <div className="deck-card__due-clean">
              <span className="deck-card__due-clean-icon">✓</span>
              <span className="deck-card__due-clean-message">
                {messages.dueClean}
              </span>
            </div>
          )
        )}
      </div>

      <div className="deck-card__footer">
        <button
          type="button"
          className="deck-card__study-btn"
          onClick={(e) => {
            e.stopPropagation();
            onStudy?.(deck);
          }}
        >
          {messages.studyNow}
        </button>
      </div>
    </article>
  );
}
