import { Link } from 'react-router-dom';
import { FlameIcon } from '../common/AppIcons';
import { DASHBOARD_TRANSLATIONS } from '../../constants/dashboardTranslations';

export default function StatsGrid({ streakCount, streakStatus, wordOfDay, kanjiOfDay, language }) {
  const t = DASHBOARD_TRANSLATIONS[language] || DASHBOARD_TRANSLATIONS.vi;
  const displayStreak = streakCount !== undefined ? streakCount : 0;
  
  // Dịch thông điệp streak từ Backend (tiếng Việt) sang tiếng Anh nếu đang bật tiếng Anh
  let displayStreakStatus = streakStatus || t.streakStatus;
  if (language === 'en') {
    if (displayStreakStatus === "Tuyệt vời! Hãy giữ vững phong độ học tập nhé.") {
      displayStreakStatus = "Excellent! Keep up your study streak.";
    } else if (displayStreakStatus === "Học ngay hôm nay để bắt đầu chuỗi ngày học tập mới!") {
      displayStreakStatus = "Study today to start a new learning streak!";
    }
  }

  return (
    <section className="stats-grid" aria-label="Tiến độ học tập">
      {/* 1. Streak Card */}
      <article className="stat-card stat-card--streak">
        <FlameIcon size={52} />
        <strong>{t.streak.replace('{count}', displayStreak)}</strong>
        <span>{displayStreakStatus}</span>
      </article>

      {/* 2. Word of the Day Card */}
      {wordOfDay ? (
        <Link 
          to={`/dictionary?wordId=${wordOfDay.id}`}
          className="stat-card daily-stat-card"
          title={t.tooltipWord}
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '8px' }}
        >
          <p className="dashboard-label" style={{ color: 'var(--color-secondary)', fontSize: '10px', fontWeight: '800', margin: 0 }}>
            {t.wordOfDay}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <strong lang="ja" style={{ fontFamily: 'var(--font-japanese)', fontSize: '28px', color: 'var(--color-primary)', fontWeight: '700' }}>
              {wordOfDay.japanese}
            </strong>
            {wordOfDay.reading && wordOfDay.reading !== wordOfDay.japanese && (
              <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                ({wordOfDay.reading})
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-on-surface)', margin: 0, fontWeight: '500' }}>
            {wordOfDay.meaning || t.noMeaning}
          </p>
        </Link>
      ) : (
        <article className="stat-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>{t.noWordToday}</p>
        </article>
      )}

      {/* 3. Kanji of the Day Card */}
      {kanjiOfDay ? (
        <Link 
          to={`/kanji?kanjiId=${kanjiOfDay.id}`}
          className="stat-card daily-stat-card"
          title={t.tooltipKanji}
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '8px' }}
        >
          <p className="dashboard-label" style={{ color: 'var(--color-secondary)', fontSize: '10px', fontWeight: '800', margin: 0 }}>
            {t.kanjiOfDay}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <strong lang="ja" style={{ fontFamily: 'var(--font-japanese)', fontSize: '32px', color: 'var(--color-primary)', fontWeight: '700' }}>
              {kanjiOfDay.character}
            </strong>
            {kanjiOfDay.readingsOn && kanjiOfDay.readingsOn.length > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                ({kanjiOfDay.readingsOn[0]})
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-on-surface)', margin: 0, fontWeight: '500' }}>
            {kanjiOfDay.meanings && kanjiOfDay.meanings.length > 0 
              ? kanjiOfDay.meanings.join(', ') 
              : t.noMeaning}
          </p>
        </Link>
      ) : (
        <article className="stat-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>{t.noKanjiToday}</p>
        </article>
      )}
    </section>
  );
}
