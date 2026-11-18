import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Reveal, useTitle } from '../components/ui';
import { APP_STORE_URL, COURSES, PLAY_URL, TELEGRAM_URL } from '../lib/courses';
import { useOpen } from '../components/ItemList';
import { SearchBox } from './Pages';
import { parseName } from '../lib/subjects';
import { getMeta } from '../lib/firestore';

const CARDS = [
  { to: '/papers', title: 'Previous question papers', body: 'Every branch and semester, from the oldest to the latest exam.', icon: '📄' },
  { to: '/notes', title: 'Notes and references', body: 'Printed and handwritten notes for each subject, unit by unit.', icon: '📚' },
  { to: '/labs', title: 'Labs and viva', body: 'Lab manuals, records and viva questions for internals and externals.', icon: '🧪' },
  { to: '/placements', title: 'Placements', body: 'Company-wise prep, practice by section and timed mock tests.', icon: '🎯' },
];

/** Counts up to `to` once it is on screen. */
export function Counter({ to }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!to) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(to);
      return;
    }
    const start = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / 1100);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n.toLocaleString('en-IN')}</>;
}

/**
 * Paper/notes counts and the newest papers, from /data/home.json (written at build time).
 * Reading this one small file replaces downloading every Firestore collection on each visit.
 */
let homePromise = null;
function useHomeData() {
  const [d, setD] = useState(null);
  useEffect(() => {
    let live = true;
    homePromise ??= fetch('/data/home.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
    homePromise.then((x) => live && setD(x));
    return () => {
      live = false;
    };
  }, []);
  return d;
}

export function useStats() {
  const d = useHomeData();
  return { papers: d?.papers ?? 0, notes: d?.notes ?? 0 };
}

/** The newest papers across every course, as a row you scroll sideways. */
export function LatestPapers() {
  const items = useHomeData()?.latest;
  const open = useOpen();
  if (!items?.length) return null;
  return (
    <section className="section shelf-section">
      <div className="wrap">
        <Reveal className="shelf-head">
          <h2 className="section-title">Latest papers</h2>
          <Link to="/papers" className="card-cta">All papers <span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>
      <div className="shelf" role="list">
        {items.map((it, i) => {
          const p = parseName(it.name);
          return (
            <button key={it.id} role="listitem" className="shelf-card" style={{ '--i': i }} onClick={() => open(it)}>
              <span className="shelf-date">{p.session}</span>
              <b>{p.title}</b>
              <span className="muted small">{it.course}{p.code ? ` · #${p.code}` : ''}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const SECTION_ICON = { aptitude: '🧮', reasoning: '🧩', verbal: '📝', technical: '💻' };
const LOGO_ORDER = ['tcs-nqt', 'infosys', 'wipro-elite-nth', 'accenture', 'cognizant-genc', 'capgemini', 'hcltech', 'deloitte', 'tech-mahindra', 'ltimindtree'];
const TAB_KEY = 'ou-home-tab';

/** Placement index (sections, companies) for the hero's Placements tab. */
function usePlacements() {
  const [idx, setIdx] = useState(null);
  useEffect(() => {
    let live = true;
    fetch('/data/placements/index.json').then((r) => r.json()).then((d) => live && setIdx(d)).catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return idx;
}

function ExamsPanel({ stats }) {
  return (
    <div className="hx-panel" role="tabpanel" id="hx-exams" aria-labelledby="hx-tab-exams">
      <SearchBox big />
      <div className="hx-tiles">
        <Link to="/papers" className="hx-tile">
          <b>{stats.papers ? <Counter to={stats.papers} /> : '—'}</b>
          <small>Previous papers</small>
        </Link>
        <Link to="/notes" className="hx-tile">
          <b>{stats.notes ? <Counter to={stats.notes} /> : '—'}</b>
          <small>Notes subjects</small>
        </Link>
        <Link to="/labs" className="hx-tile">
          <b>Labs</b>
          <small>Manuals and viva</small>
        </Link>
      </div>
      <div className="hx-chips">
        {COURSES.slice(0, 4).map((c) => (
          <Link key={c.id} to={`/papers/${c.id}`} className="hx-chip">{c.title}</Link>
        ))}
      </div>
    </div>
  );
}

function PlacementsPanel({ idx }) {
  const companies = idx ? LOGO_ORDER.map((id) => idx.companies.find((c) => c.id === id)).filter((c) => c?.logo) : [];
  const mocks = idx ? [...idx.sections, ...idx.companies].reduce((a, x) => a + x.mocks.length, 0) : 0;
  return (
    <div className="hx-panel" role="tabpanel" id="hx-placements" aria-labelledby="hx-tab-placements">
      <p className="hx-panel-lead">Company-wise prep and {mocks || 'over 100'} timed mock tests, free.</p>
      <div className="hx-logos">
        <div className="hx-logos-track">
          {[0, 1].map((copy) =>
            companies.map((c) => (
              <Link key={`${copy}-${c.id}`} to={`/placements/companies/${c.id}`} className={`hx-logo ${copy ? 'hx-dup' : ''}`} title={`${c.name} preparation`} aria-hidden={copy ? 'true' : undefined} tabIndex={copy ? -1 : undefined}>
                <img src={c.logo} alt={copy ? '' : c.name} loading="lazy" />
              </Link>
            )),
          )}
        </div>
      </div>
      <div className="hx-chips">
        {(idx?.sections ?? []).map((s) => (
          <Link key={s.id} to={`/placements/${s.id}`} className="hx-chip">
            <span aria-hidden="true">{SECTION_ICON[s.id]}</span> {s.title.replace(' MCQs', '').replace('Quantitative ', '').replace('Logical ', '')} <small>{s.topics.reduce((a, t) => a + t.count, 0).toLocaleString('en-IN')}</small>
          </Link>
        ))}
      </div>
      <div className="hx-ctas">
        <Link to="/placements/mock/tcs-nqt-mock-1" className="btn">Start a free mock <span aria-hidden="true">→</span></Link>
        <Link to="/placements" className="btn btn-ghost">All placement prep</Link>
      </div>
    </div>
  );
}

export default function Home() {
  useTitle('');
  const stats = useStats();
  const idx = usePlacements();
  const [notice, setNotice] = useState(null);
  const [tab, setTab] = useState(() => {
    try {
      return localStorage.getItem(TAB_KEY) === 'exams' ? 'exams' : 'placements';
    } catch {
      return 'placements';
    }
  });
  const choose = (t) => {
    setTab(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {}
  };
  useEffect(() => {
    getMeta().then((m) => setNotice(typeof m.notice === 'string' && m.notice.trim() ? m.notice.trim() : null));
  }, []);

  return (
    <>
      <div className="home">
      <section className="hx-hero">
        <div className="hero-blobs" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="wrap hx-grid">
          <div className="hx-copy">
            <h1 className="hx-title fade-up" style={{ '--delay': '60ms' }}>
              Papers, notes, labs and <span className="grad">placements</span>
            </h1>
            <p className="hx-sub fade-up" style={{ '--delay': '120ms' }}>Osmania University previous question papers, notes and lab manuals, plus placement prep. Free.</p>
            <div className="hx-switch fade-up" role="tablist" aria-label="What are you preparing for?" style={{ '--delay': '160ms' }}>
              <button role="tab" id="hx-tab-exams" aria-selected={tab === 'exams'} aria-controls="hx-exams" className={tab === 'exams' ? 'on' : ''} onClick={() => choose('exams')}>Exams</button>
              <button role="tab" id="hx-tab-placements" aria-selected={tab === 'placements'} aria-controls="hx-placements" className={tab === 'placements' ? 'on' : ''} onClick={() => choose('placements')}>Placements</button>
            </div>
            <div className="fade-up" style={{ '--delay': '200ms' }}>
              {tab === 'exams' ? <ExamsPanel stats={stats} /> : <PlacementsPanel idx={idx} />}
            </div>
            {notice ? (
              <div className="notice">
                <span aria-hidden="true">📣</span> {notice}
              </div>
            ) : null}
            <div className="hx-stores fade-up" style={{ '--delay': '260ms' }}>
              <HeroBadges />
            </div>
          </div>
          <div className="hx-art" aria-hidden="true">
            <figure className="hx-phone hx-phone-back"><img src="/img/hero/eng.webp" alt="" width="480" height="1067" /></figure>
            <figure className="hx-phone hx-phone-front"><img src="/img/hero/quiz.webp" alt="" width="480" height="1067" /></figure>
          </div>
        </div>
      </section>

      <LatestPapers />

      <section className="section">
        <div className="wrap">
          <Reveal as="h2" className="section-title">Browse</Reveal>
          <div className="features">
            {CARDS.map((c, i) => (
              <Reveal key={c.to} delay={i * 70}>
                <Link to={c.to} className="feature home-card">
                  <span className="feature-ico" aria-hidden="true">{c.icon}</span>
                  <h3>{c.title}</h3>
                  <p className="muted">{c.body}</p>
                  <span className="card-cta">Open <span aria-hidden="true">→</span></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal className="app-band only-buttons">
            <StoreButtons />
          </Reveal>
        </div>
      </section>
      </div>
    </>
  );
}

/** Slim Play / App Store / Telegram badges for the hero: same row under both tabs, kept small so the hero stays light. */
function HeroBadges() {
  const items = [
    {
      href: PLAY_URL,
      label: 'Google Play',
      aria: 'Get the Android app on Google Play',
      cls: '',
      icon: (
        <>
          <path fill="#34A853" d="M3.6 2.2 13.4 12l-9.8 9.8c-.4-.2-.6-.6-.6-1.1V3.3c0-.5.2-.9.6-1.1z" />
          <path fill="#FBBC04" d="m16.7 15.3-3.3-3.3 3.3-3.3 3.8 2.2c1 .6 1 1.6 0 2.2l-3.8 2.2z" />
          <path fill="#EA4335" d="M16.7 15.3 13.4 12l-9.8 9.8c.4.2.9.2 1.4-.1l11.7-6.4z" />
          <path fill="#4285F4" d="M16.7 8.7 5 2.3c-.5-.3-1-.3-1.4-.1l9.8 9.8 3.3-3.3z" />
        </>
      ),
    },
    APP_STORE_URL ? { href: APP_STORE_URL, label: 'App Store', aria: 'Download the iPhone app on the App Store', cls: '', icon: <path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-.9-2.4-4zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z" /> } : null,
    { href: TELEGRAM_URL, label: 'Telegram', aria: 'Join the Telegram channel', cls: 'tg', icon: <path fill="currentColor" d="m3.6 11.4 15.5-6c.7-.3 1.4.2 1.1 1.3l-2.6 12.4c-.2.9-.7 1.1-1.4.7l-4-3-2 1.9c-.2.2-.4.4-.8.4l.3-4.1 7.5-6.8c.3-.3-.1-.5-.5-.2l-9.3 5.9-4-1.3c-.9-.3-.9-.9.2-1.2z" /> },
  ].filter(Boolean);
  return (
    <div className="hx-badges" aria-label="Get the app or join Telegram">
      {items.map((b) => (
        <a key={b.label} className={`hx-badge ${b.cls}`} href={b.href} target="_blank" rel="noreferrer" aria-label={b.aria}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{b.icon}</svg>
          {b.label}
        </a>
      ))}
    </div>
  );
}

/** Google Play, App Store and Telegram buttons (App Store falls back to "coming soon" if its URL is ever empty). */
export function StoreButtons({ className = '' }) {
  return (
    <div className={`store-row ${className}`}>
      <a className="store-btn" href={PLAY_URL} target="_blank" rel="noreferrer" aria-label="Get the Android app on Google Play">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#34A853" d="M3.6 2.2 13.4 12l-9.8 9.8c-.4-.2-.6-.6-.6-1.1V3.3c0-.5.2-.9.6-1.1z"/><path fill="#FBBC04" d="m16.7 15.3-3.3-3.3 3.3-3.3 3.8 2.2c1 .6 1 1.6 0 2.2l-3.8 2.2z"/><path fill="#EA4335" d="M16.7 15.3 13.4 12l-9.8 9.8c.4.2.9.2 1.4-.1l11.7-6.4z"/><path fill="#4285F4" d="M16.7 8.7 5 2.3c-.5-.3-1-.3-1.4-.1l9.8 9.8 3.3-3.3z"/></svg>
        <span><small>Get it on</small>Google Play</span>
      </a>
      {APP_STORE_URL ? (
        <a className="store-btn" href={APP_STORE_URL} target="_blank" rel="noreferrer" aria-label="Download the iPhone app on the App Store">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-.9-2.4-4zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z"/></svg>
          <span><small>Download on the</small>App Store</span>
        </a>
      ) : (
        <span className="store-btn is-soon" aria-label="iPhone app coming soon to the App Store">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-.9-2.4-4zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z"/></svg>
          <span><small>App Store</small>Coming soon</span>
        </span>
      )}
      <a className="store-btn tg" href={TELEGRAM_URL} target="_blank" rel="noreferrer" aria-label="Join the Telegram channel">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#229ED9"/><path fill="#fff" d="m5.6 11.6 11.1-4.3c.5-.2 1 .1.8.9l-1.9 8.9c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-3 5.4-4.9c.2-.2 0-.3-.4-.1L8.3 13l-2.9-.9c-.6-.2-.6-.6.2-.9z"/></svg>
        <span><small>Join us on</small>Telegram</span>
      </a>
    </div>
  );
}
