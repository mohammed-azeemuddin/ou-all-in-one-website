import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { CONTACT_EMAIL, PLAY_URL, TELEGRAM_URL } from '../lib/courses';

/** Adds `is-in` when the element scrolls into view (once). Respects reduced motion via CSS. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'is-in' : ''} ${className}`} style={{ '--delay': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

export function HatLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="15,41 50,22 85,41 50,60" fill="currentColor" />
      <polygon points="28,54 50,66 72,54 72,66 50,78 28,66" fill="currentColor" />
      <polygon points="78,44.5 85,41 85,66 78,66" fill="currentColor" />
    </svg>
  );
}

const NAV = [
  ['/papers', 'Papers'],
  ['/notes', 'Notes'],
  ['/labs', 'Labs'],
  ['/placements', 'Placements'],
  ['/tools', 'Tools'],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${pathname === '/' ? 'on-hero' : ''}`}>
      <div className="wrap header-row">
        <Link to="/" className="brand" aria-label="OU All In One home">
          <span className="brand-mark">
            <HatLogo size={22} />
          </span>
          <span>OU All In One</span>
        </Link>
        <nav className={`nav ${open ? 'is-open' : ''}`} aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} className="nav-link">
              {label}
            </NavLink>
          ))}
          <a className="btn btn-small nav-cta" href={PLAY_URL} target="_blank" rel="noreferrer">
            Get the app
          </a>
        </nav>
        <button className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">
              <HatLogo size={22} />
            </span>
            <span>OU All In One</span>
          </div>
          <p className="muted">Free papers, notes, lab manuals and placement prep for Osmania University students. Since 2020.</p>
        </div>
        <div className="footer-links">
          <Link to="/papers">Question papers</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/labs">Lab manuals</Link>
          <Link to="/placements">Placements</Link>
          <Link to="/tools">SGPA and attendance tools</Link>
        </div>
        <div className="footer-links">
          <Link to="/contact">Contact</Link>
          <a href="/privacy.html">Privacy policy</a>
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">Telegram</a>
          <a href={PLAY_URL} target="_blank" rel="noreferrer">Android app</a>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </div>
      <div className="wrap footer-note">OU All In One is an independent student project and is not affiliated with, endorsed by or connected to Osmania University.</div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, sub, children, art }) {
  return (
    <section className="page-hero">
      <div className="hero-blobs" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="wrap page-hero-row">
        <div className="page-hero-text">
          {eyebrow ? <div className="eyebrow fade-up">{eyebrow}</div> : null}
          <h1 className="fade-up" style={{ '--delay': '60ms' }}>{title}</h1>
          {sub ? <p className="lead fade-up" style={{ '--delay': '120ms' }}>{sub}</p> : null}
          {children ? <div className="fade-up" style={{ '--delay': '180ms' }}>{children}</div> : null}
        </div>
        {art ? (
          <div className="page-hero-art fade-up" style={{ '--delay': '160ms' }}>
            <img src={art} alt="" loading="eager" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function Empty({ title, body, action }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">📭</div>
      <h3>{title}</h3>
      {body ? <p className="muted">{body}</p> : null}
      {action}
    </div>
  );
}

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · OU All In One` : 'OU All In One · Osmania University papers, notes and placements';
  }, [title]);
}
