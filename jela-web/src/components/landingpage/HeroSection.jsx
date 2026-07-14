import { Link } from 'react-router-dom';

/** HeroSection — phần banner đầu trang */
export default function HeroSection({ copy }) {
  return (
    <section className="lp-hero" id="hero">
      <div className="lp-hero__inner">
        <div className="lp-hero__eyebrow">
          <span className="lp-hero__eyebrow-dot" />
          {copy.eyebrow}
        </div>

        <h1 className="lp-hero__title">
          {copy.h1Part1} <em>{copy.h1Accent}</em>
          <br />
          {copy.h1Part2}
        </h1>

        <p className="lp-hero__sub">{copy.sub}</p>

        <div className="lp-hero__actions">
          <Link to="/signup" className="lp-btn-hero-primary">
            🚀 {copy.ctaPrimary}
          </Link>
          <a href="#features" className="lp-btn-hero-ghost">
            ▶ {copy.ctaSecondary}
          </a>
        </div>

        {/* Floating Kanji chips */}
        <div className="lp-hero__kanji-row" aria-hidden="true">
          {['水','火','山','日','人','道','夢','学'].map((k) => (
            <div key={k} className="lp-kanji-chip" lang="ja">{k}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
