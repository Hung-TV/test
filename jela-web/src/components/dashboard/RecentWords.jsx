import { recentWords } from '../../data/dashboardData';
import { Link } from 'react-router-dom';

export default function RecentWords() {
  return (
    <aside className="recent-words">
      <h2>Từ vựng vừa học</h2>

      <div className="recent-words__panel">
        {recentWords.map((word) => (
          <article className="word-card" key={word.japanese}>
            <div>
              <strong lang="ja">{word.japanese}</strong>
              <span>{word.reading}</span>
            </div>
            <p>{word.meaning}</p>
          </article>
        ))}

        <Link to="/dictionary" className="review-button">
          Học tập từ vựng
        </Link>
      </div>
    </aside>
  );
}
