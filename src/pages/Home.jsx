import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Reveal, useTitle } from '../components/ui';
import { APP_STORE_URL, COURSES, PLAY_URL, TELEGRAM_URL } from '../lib/courses';
import { useOpen } from '../components/ItemList';
import { SearchBox } from './Pages';
import { compareItems } from '../lib/sort';
import { parseName } from '../lib/subjects';
import { getMeta, loadCollection } from '../lib/firestore';

const CARDS = [
  { to: '/papers', title: 'Previous Question Papers', body: 'Every branch and semester, from the oldest to the latest exam.', img: '/img/prev_papers.jpg', color: '#707070' },
  { to: '/notes', title: 'Notes and References', body: 'Printed and handwritten notes for each subject, unit by unit.', img: '/img/books.png', color: '#77698A' },
  { to: '/labs', title: 'Labs and Viva', body: 'Lab manuals, records and viva questions for internals and externals.', img: '/img/lab_pic.jpg', color: '#637954' },
  { to: '/placements', title: 'Placements and Interviews', body: 'Company-wise questions, practice tests and job updates.', img: '/img/interview2.png', color: '#007D83' },
];

/** Counts up to `to` once it is on screen. */
function Counter({ to }) {
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

function useStats() {
  const [s, setS] = useState({ papers: 0, notes: 0 });
  useEffect(() => {
    let live = true;
    const count = (suffix) =>
      Promise.all(COURSES.map((c) => loadCollection(`${c.id}_${suffix}`).then((x) => x.length).catch(() => 0))).then((a) => a.reduce((x, y) => x + y, 0));
    Promise.all([count('qp'), count('notes')]).then(([papers, notes]) => live && setS({ papers, notes }));
    return () => {
      live = false;
    };
  }, []);
  return s;
}

/** The newest papers across every course, as a row you scroll sideways. */
function LatestPapers() {
  const [items, setItems] = useState(null);
  const open = useOpen();
  useEffect(() => {
    let live = true;
    Promise.all(COURSES.map((c) => loadCollection(`${c.id}_qp`).then((x) => x.map((i) => ({ ...i, course: c.title }))).catch(() => [])))
      .then((all) => live && setItems(all.flat().filter((i) => parseName(i.name).session).sort(compareItems('newest')).slice(0, 12)));
    return () => {
      live = false;
    };
  }, []);
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

export default function Home() {
  useTitle('');
  const stats = useStats();
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    getMeta().then((m) => setNotice(typeof m.notice === 'string' && m.notice.trim() ? m.notice.trim() : null));
  }, []);

  return (
    <>
      <section className="hero hero-clean">
        <div className="hero-blobs" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="wrap hero-center">
          <h1 className="hero-title fade-up">
            <span className="grad">OU</span> question papers and notes
          </h1>
          <p className="lead fade-up" style={{ '--delay': '80ms' }}>Free for every Osmania University course. Search by subject or code.</p>
          <div className="fade-up" style={{ '--delay': '160ms' }}>
            <SearchBox big />
          </div>
          <p className="hero-meta fade-up" style={{ '--delay': '240ms' }}>
            {stats.papers ? (
              <>
                <b><Counter to={stats.papers} /></b> papers · <b><Counter to={stats.notes} /></b> notes subjects ·{' '}
              </>
            ) : null}
            {COURSES.slice(0, 4).map((c, i) => (
              <span key={c.id}>
                {i ? ' · ' : ''}
                <Link to={`/papers/${c.id}`}>{c.title}</Link>
              </span>
            ))}
          </p>
          {notice ? (
            <div className="notice fade-up" style={{ '--delay': '300ms' }}>
              <span aria-hidden="true">📣</span> {notice}
            </div>
          ) : null}
        </div>
      </section>

      <LatestPapers />

      <section className="section">
        <div className="wrap">
          <Reveal as="h2" className="section-title">Browse</Reveal>
          <div className="cards">
            {CARDS.map((c, i) => (
              <Reveal key={c.to} delay={i * 90}>
                <Link to={c.to} className="card" style={{ '--accent': c.color }}>
                  <div className="card-img">
                    <img src={c.img} alt="" loading="lazy" />
                  </div>
                  <div className="card-body">
                    <h3>{c.title}</h3>
                    <p className="muted">{c.body}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal className="cta-band">
            <div>
              <h2>Also on your phone</h2>
              <p>Bookmarks, offline papers, quizzes and calculators in the app. New papers posted on Telegram first.</p>
            </div>
            <div className="store-row">
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
