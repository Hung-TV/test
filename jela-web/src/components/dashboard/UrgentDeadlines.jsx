import { Link } from 'react-router-dom';
import { AlertIcon } from '../common/AppIcons';
import { DASHBOARD_TRANSLATIONS } from '../../constants/dashboardTranslations';

export default function UrgentDeadlines({ deadlines, language }) {
  const t = DASHBOARD_TRANSLATIONS[language] || DASHBOARD_TRANSLATIONS.vi;

  if (!deadlines || deadlines.length === 0) {
    return null; // Don't show if there are no deadlines
  }

  return (
    <section className="urgent-deadlines">
      <div className="urgent-deadlines__header">
        <div style={{ color: 'var(--color-tertiary)' }}>
          <AlertIcon size={24} />
        </div>
        <h2 className="urgent-deadlines__title">{t.urgentReview}</h2>
      </div>

      <div className="urgent-deadlines__list">
        {deadlines.map((item) => (
          <article className="deadline-card" key={`${item.type}-${item.listId}`}>
            <div className="deadline-card__info">
              <span className={`deadline-card__tag deadline-card__tag--${item.type.toLowerCase()}`}>
                {item.type === 'KANJI' ? t.kanjiTag : t.vocabTag}
              </span>
              <strong className="deadline-card__name">{item.listName}</strong>
              <span className="deadline-card__count">{t.dueCount.replace('{count}', item.dueCount)}</span>
            </div>
            <Link 
              to={item.type === 'KANJI' ? '/kanji' : '/my-decks'} 
              className="deadline-card__action"
            >
              {t.reviewNow}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
