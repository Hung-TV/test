import { Link } from 'react-router-dom';

/** CtaSection — call-to-action cuối trang, nền navy đậm */
export default function CtaSection({ copy }) {
  return (
    <section className="lp-cta" id="community">
      <div className="lp-cta__inner">
        <h2 className="lp-cta__title">{copy.title}</h2>
        <p className="lp-cta__sub">{copy.sub}</p>
        <div className="lp-cta__actions">
          <Link to="/signup" className="lp-btn-cta-primary">
            🚀 {copy.ctaPrimary}
          </Link>
          <a href="#paths" className="lp-btn-cta-outline">
            {copy.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  );
}
