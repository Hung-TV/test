/** FeaturesSection — 3 tính năng nổi bật */
export default function FeaturesSection({ copy }) {
  const features = [
    {
      icon: '📖',
      bg: '#eff6ff',
      title: copy.f1Title,
      desc: copy.f1Desc,
    },
    {
      icon: '🎮',
      bg: '#fdf4ff',
      title: copy.f2Title,
      desc: copy.f2Desc,
    },
    {
      icon: '🎯',
      bg: '#fff7ed',
      title: copy.f3Title,
      desc: copy.f3Desc,
    },
    {
      icon: '✍️',
      bg: '#f0fdf4',
      title: copy.f4Title,
      desc: copy.f4Desc,
    },
    {
      icon: '📊',
      bg: '#fef9c3',
      title: copy.f5Title,
      desc: copy.f5Desc,
    },
    {
      icon: '🃏',
      bg: '#fce7f3',
      title: copy.f6Title,
      desc: copy.f6Desc,
    },
  ];

  return (
    <section className="lp-section" id="features">
      <div className="lp-section__inner">
        <div className="lp-section__header">
          <span className="lp-section__tag">{copy.tag}</span>
          <h2 className="lp-section__title">{copy.title}</h2>
          <p className="lp-section__sub">{copy.sub}</p>
        </div>

        <div className="lp-features-grid">
          {features.map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div className="lp-feature-card__icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3 className="lp-feature-card__title">{f.title}</h3>
              <p className="lp-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
