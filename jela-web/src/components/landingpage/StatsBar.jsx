/** StatsBar — dải số liệu ngắn bên dưới hero */
export default function StatsBar({ copy }) {
  const stats = [
    { num: '50,000+', label: copy.students },
    { num: '2,100+',  label: copy.kanji },
    { num: '5',       label: copy.levels },
    { num: '95%',     label: copy.satisfaction },
  ];

  return (
    <div className="lp-stats">
      <div className="lp-stats__inner">
        {stats.map((s) => (
          <div key={s.label} className="lp-stat-item">
            <span className="lp-stat-item__num">{s.num}</span>
            <span className="lp-stat-item__label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
