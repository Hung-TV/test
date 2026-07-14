/** PathsSection — 3 cấp độ lộ trình học */
export default function PathsSection({ copy }) {
  const paths = [
    { kanji: 'あ', level: 'N5 – N4', title: copy.p1Title, desc: copy.p1Desc },
    { kanji: '道', level: 'N3 – N2', title: copy.p2Title, desc: copy.p2Desc },
    { kanji: '夢', level: 'N1',      title: copy.p3Title, desc: copy.p3Desc },
  ];

  return (
    <section className="lp-section lp-section--alt" id="paths">
      <div className="lp-section__inner">
        <div className="lp-section__header">
          <span className="lp-section__tag">{copy.tag}</span>
          <h2 className="lp-section__title">{copy.title}</h2>
          <p className="lp-section__sub">{copy.sub}</p>
        </div>

        <div className="lp-paths-grid">
          {paths.map((p) => (
            <div key={p.title} className="lp-path-card">
              <div className="lp-path-card__kanji" aria-hidden="true" lang="ja">
                {p.kanji}
              </div>
              <span className="lp-path-card__level">{p.level}</span>
              <h3 className="lp-path-card__title">{p.title}</h3>
              <p className="lp-path-card__desc">{p.desc}</p>
              <button type="button" className="lp-path-card__btn">
                {copy.viewPath}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
