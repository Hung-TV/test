
export default function KanjiLevelHub() {
  const levels = [
    { level: 'N5', title: 'Beginner', progress: 64, active: true },
    { level: 'N4', title: 'Elementary', progress: 12, active: false },
    { level: 'N3', title: 'Intermediate', progress: 0, active: false },
  ];

  return (
    <div className="kanji-level-hub">
      <h2 className="kanji-history-title">Level Hub</h2>
      <div className="kanji-level-cards">
        {levels.map((item) => (
          <div key={item.level} className="kanji-level-card">
            <div className="kanji-level-card-header">
              <span className="kanji-badge" style={{ backgroundColor: item.active ? 'var(--color-primary-container)' : 'var(--color-surface-container-high)', color: item.active ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)' }}>
                {item.level}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                {item.progress}%
              </span>
            </div>
            <h3 className="kanji-level-title">{item.title}</h3>
            <div className="kanji-level-progress-bg">
              <div 
                className="kanji-level-progress-fill" 
                style={{ 
                  width: `${item.progress}%`,
                  backgroundColor: item.active ? 'var(--color-secondary)' : 'var(--color-surface-container-highest)' 
                }} 
              />
            </div>
            <button className={`kanji-level-btn ${item.active ? 'primary' : ''}`}>
              {item.active ? 'Start Learning' : 'View Word List'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
