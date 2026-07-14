import { Link } from 'react-router-dom';

export default function DailyHighlight({ wordOfDay, kanjiOfDay }) {
  return (
    <aside className="recent-words">
      <h2>Học phần hôm nay</h2>

      <div className="recent-words__panel daily-highlight-cards">
        {wordOfDay && (
          <Link 
            to={`/dictionary?search=${encodeURIComponent(wordOfDay.japanese)}`} 
            className="daily-highlight-card"
            title="Nhấp để tra từ điển"
          >
            <span className="daily-highlight-card__subtitle">TỪ VỰNG HÔM NAY</span>
            <div className="daily-highlight-card__main">
              <strong lang="ja" className="daily-highlight-card__character">
                {wordOfDay.japanese}
              </strong>
              {wordOfDay.reading && wordOfDay.reading !== wordOfDay.japanese && (
                <span className="daily-highlight-card__reading">
                  ({wordOfDay.reading})
                </span>
              )}
            </div>
            <p className="daily-highlight-card__meaning">{wordOfDay.meaning || 'Chưa có nghĩa'}</p>
          </Link>
        )}

        {kanjiOfDay && (
          <Link 
            to="/kanji" 
            className="daily-highlight-card"
            title="Nhấp để học Hán tự"
          >
            <span className="daily-highlight-card__subtitle">HÁN TỰ HÔM NAY</span>
            <div className="daily-highlight-card__main">
              <strong lang="ja" className="daily-highlight-card__character">
                {kanjiOfDay.character}
              </strong>
              {kanjiOfDay.readingsOn && kanjiOfDay.readingsOn.length > 0 && (
                <span className="daily-highlight-card__reading">
                  {kanjiOfDay.readingsOn[0]}
                </span>
              )}
            </div>
            <p className="daily-highlight-card__meaning">
              {kanjiOfDay.meanings && kanjiOfDay.meanings.length > 0 
                ? kanjiOfDay.meanings.join(', ') 
                : 'Chưa có nghĩa'}
            </p>
          </Link>
        )}

        {!wordOfDay && !kanjiOfDay && (
          <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', textAlign: 'center' }}>
            Không có thông tin học phần hôm nay.
          </p>
        )}
      </div>
    </aside>
  );
}
