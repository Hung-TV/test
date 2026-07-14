/**
 * Footer.jsx — Footer dùng chung cho Landing Page.
 * Props: copy (i18n object)
 */
export default function Footer({ copy }) {
  const company = [
    { label: copy.aboutUs,  href: '#' },
    { label: copy.careers,  href: '#' },
    { label: copy.press,    href: '#' },
    { label: copy.blog,     href: '#' },
  ];

  const support = [
    { label: copy.helpCenter, href: '#' },
    { label: copy.privacy,    href: '#' },
    { label: copy.terms,      href: '#' },
    { label: copy.contact,    href: '#' },
  ];

  const product = [
    { label: copy.dictionary, href: '#features' },
    { label: copy.kanjiLib,   href: '#paths' },
    { label: copy.flashcards, href: '#' },
    { label: copy.roadmap,    href: '#paths' },
  ];

  return (
    <footer className="lp-footer">
      <div className="lp-footer__inner">
        <div className="lp-footer__top">
          {/* Brand column */}
          <div>
            <p className="lp-footer__brand">JEL<span>A</span></p>
            <p className="lp-footer__brand-desc">{copy.brandDesc}</p>
          </div>

          {/* Company */}
          <div>
            <h3 className="lp-footer__col-title">{copy.company}</h3>
            <ul className="lp-footer__links">
              {company.map((l) => (
                <li key={l.label}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="lp-footer__col-title">{copy.support}</h3>
            <ul className="lp-footer__links">
              {support.map((l) => (
                <li key={l.label}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="lp-footer__col-title">{copy.product}</h3>
            <ul className="lp-footer__links">
              {product.map((l) => (
                <li key={l.label}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="lp-footer__bottom">
          <p className="lp-footer__copy">{copy.copyright}</p>
          <div className="lp-footer__socials" aria-label="Social media">
            {/* GitHub */}
            <button type="button" className="lp-social-btn" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </button>
            {/* Globe / Website */}
            <button type="button" className="lp-social-btn" aria-label="Website">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
