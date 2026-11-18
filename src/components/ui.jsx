import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { APP_STORE_URL, CONTACT_EMAIL, PLAY_URL, TELEGRAM_URL } from '../lib/courses';

/** iPhone and iPad visitors get the App Store; everyone else gets Google Play. */
const isApple = () => typeof navigator !== 'undefined' && !/Android/i.test(navigator.userAgent) && (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
export const appUrl = () => (APP_STORE_URL && isApple() ? APP_STORE_URL : PLAY_URL);

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

const THEMES = ['system', 'light', 'dark'];
const THEME_LABEL = { system: 'Theme: same as device', light: 'Theme: light', dark: 'Theme: dark' };
const THEME_ICON = { system: '◐', light: '☀', dark: '☾' };

/** Cycles System → Light → Dark. Saved in this browser; index.html applies it before first paint. */
export function ThemeButton() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ou-theme') || 'system';
    } catch {
      return 'system';
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('ou-theme', theme);
    } catch {}
  }, [theme]);
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  return (
    <button className="theme-btn" onClick={() => setTheme(next)} aria-label={`${THEME_LABEL[theme]}. Switch to ${next}.`} title={THEME_LABEL[theme]}>
      <span aria-hidden="true">{THEME_ICON[theme]}</span>
    </button>
  );
}

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
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
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
          <a className="btn btn-small nav-cta" href="/app/">
            Get the app
          </a>
        </nav>
        <ThemeButton />
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
          <a href={APP_STORE_URL} target="_blank" rel="noreferrer">iPhone app</a>
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

const SITE = 'https://www.ouallinone.com';
const cleanPath = (p) => p.replace(/\/+$/, '') || '/';
/**
 * What the server sent for the address the visitor landed on. Pages written by scripts/prerender.mjs
 * carry a search-friendly title, description and canonical link; Google reads the page after this
 * script has run, so on that first page they must be left as they are.
 */
const landed = (() => {
  if (typeof document === 'undefined') return null;
  const path = cleanPath(location.pathname);
  const canonical = document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
  return {
    path,
    title: document.title,
    description: document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    prerendered: canonical.startsWith(SITE) && cleanPath(canonical.slice(SITE.length)) === path,
  };
})();

/**
 * Sets the tab title. On the page the visitor landed on, the pre-rendered title and description stay.
 * On every other page the canonical link follows the address, and `noindex` keeps empty or missing
 * pages out of Google.
 */
export function useTitle(title, { noindex = false } = {}) {
  useEffect(() => {
    const path = cleanPath(location.pathname);
    const keep = landed?.prerendered && landed.path === path;
    document.title = keep ? landed.title : title ? `${title} · OU All In One` : 'OU All In One · Osmania University papers, notes and placements';
    const head = document.head;
    let canonical = head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      head.appendChild(canonical);
    }
    canonical.href = SITE + path;
    head.querySelector('meta[name="description"]')?.setAttribute('content', keep ? landed.description : `${title || 'Papers, notes, lab manuals and placement prep'}. Free on OU All In One.`);
    const robots = head.querySelector('meta[data-noindex]');
    if (noindex && !robots) {
      const m = document.createElement('meta');
      m.name = 'robots';
      m.content = 'noindex';
      m.setAttribute('data-noindex', '');
      head.appendChild(m);
    } else if (!noindex && robots) robots.remove();
  }, [title, noindex]);
}

/** Counts Telegram joins in Google Analytics (when it is loaded), by where the button was. */
const trackJoin = (place) => {
  try {
    window.gtag?.('event', 'join_telegram', { place });
  } catch {}
};

export function TelegramIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="m3.6 11.4 15.5-6c.7-.3 1.4.2 1.1 1.3l-2.6 12.4c-.2.9-.7 1.1-1.4.7l-4-3-2 1.9c-.2.2-.4.4-.8.4l.3-4.1 7.5-6.8c.3-.3-.1-.5-.5-.2l-9.3 5.9-4-1.3c-.9-.3-.9-.9.2-1.2Z" />
    </svg>
  );
}

/**
 * The "Join Telegram" card for job updates, in Telegram blue so it stands out from the page.
 * The whole card is one link. `compact` is the slimmer version for sidebars and page ends.
 */
export function TelegramCard({ place = 'placements', compact = false, title = 'Get job updates on Telegram', text = 'Job and internship openings for freshers. Free to join.', className = '' }) {
  return (
    <a className={`tg-card ${compact ? 'is-compact' : ''} ${className}`} href={TELEGRAM_URL} target="_blank" rel="noreferrer" onClick={() => trackJoin(place)}>
      <span className="tg-ico"><TelegramIcon size={compact ? 22 : 28} /></span>
      <span className="tg-text">
        <b>{title}</b>
        <small>{text}</small>
      </span>
      <span className="tg-btn">Join <span aria-hidden="true">→</span></span>
    </a>
  );
}

/** Common questions with answers, always visible so students and search engines both read them. */
export function Faq({ items, heading = 'Frequently asked questions' }) {
  return (
    <section className="faq" aria-label={heading}>
      <h2 className="section-title">{heading}</h2>
      <dl>
        {items.map(([q, a]) => (
          <div key={q} className="faq-item">
            <dt>{q}</dt>
            <dd className="muted">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
