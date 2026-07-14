import { TrophyIcon } from '../common/AppIcons';
import { Link } from 'react-router-dom';

export default function WeeklyChallenge() {
  return (
    <section className="weekly-challenge">
      <div className="weekly-challenge__icon">
        <TrophyIcon size={30} />
      </div>

      <div className="weekly-challenge__copy">
        <h2>Thử thách tuần</h2>
        <p>
          Học 50 từ mới trong tuần này để nhận huy hiệu “Học giả Sakura” và
          500 XP thưởng!
        </p>
      </div>

      <Link to="/roadmap">XEM THỬ THÁCH</Link>
    </section>
  );
}
