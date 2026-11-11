import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import ItemList, { Row } from '../components/ItemList';
import { Empty, PageHero, Reveal, useTitle } from '../components/ui';
import { CONTACT_EMAIL, COURSES, collectionFor, courseById, PLAY_URL, SECTIONS, TELEGRAM_URL } from '../lib/courses';
import { driveDownload, drivePreview, folderEmbed } from '../lib/files';
import { loadCollection } from '../lib/firestore';
import { neutralLabels, unitSortKey } from '../lib/fileLabel';
import { slugify, subjects as groupSubjects } from '../lib/seo';
import { compareItems } from '../lib/sort';
import { parseName } from '../lib/subjects';

/** /papers and /notes: pick a course. */
export function Section({ section }) {
  const s = SECTIONS[section];
  useTitle(s.title);
  usePrefetch(section);
  return (
    <>
      <PageHero eyebrow={section === 'papers' ? 'Question papers' : 'Notes'} title={s.title} sub={s.blurb} art={s.gif} />
      <section className="section">
        <div className="wrap course-grid big">
          {COURSES.map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <Link to={`/${section}/${c.id}`} className="course-tile">
                <span className="course-ico" aria-hidden="true">{c.icon}</span>
                <span>
                  <b>{c.title}</b>
                  <small className="muted">{c.sub}</small>
                </span>
                <span className="row-go" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

/** /papers/:course and /notes/:course */
export function CourseList({ section }) {
  const { course } = useParams();
  const c = courseById(course);
  const s = SECTIONS[section];
  useTitle(c ? `${c.title} ${section === 'papers' ? 'papers' : 'notes'}` : 'Not found');
  if (!c) return <Navigate to={`/${section}`} replace />;
  return (
    <>
      <PageHero
        eyebrow={<Link to={`/${section}`} className="crumb">← {s.title}</Link>}
        title={`${c.title} ${section === 'papers' ? 'Papers' : 'Notes'}`}
        sub={c.sub}
      />
      <section className="section tight">
        <div className="wrap narrow">
          <ItemList collection={collectionFor(section, c.id)} noun={s.noun} groupable={section === 'papers'} subjectBase={`/${section}/${c.id}`} />
          <SubjectIndex collection={collectionFor(section, c.id)} base={`/${section}/${c.id}`} heading={`All ${c.title} subjects`} />
        </div>
      </section>
    </>
  );
}

/** A to Z links to every subject page of a course (good for students and for search engines). */
function SubjectIndex({ collection, base, heading }) {
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    let live = true;
    loadCollection(collection).then((x) => live && setGroups(groupSubjects(x))).catch(() => {});
    return () => {
      live = false;
    };
  }, [collection]);
  if (groups.length < 2) return null;
  return (
    <nav className="subject-index" aria-label={heading}>
      <h2>{heading}</h2>
      <ul>
        {groups.map((g) => (
          <li key={g.slug}>
            <Link to={`${base}/${g.slug}`}>{g.title}</Link>
            <span className="muted"> · {g.items.length}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** /papers/:course/:subject and /notes/:course/:subject  Every paper (or notes set) of one subject. */
export function SubjectPage({ section }) {
  const { course, subject } = useParams();
  const c = courseById(course);
  const s = SECTIONS[section];
  const [items, setItems] = useState(null);
  useEffect(() => {
    if (!c) return;
    let live = true;
    loadCollection(collectionFor(section, c.id))
      .then((all) => live && setItems(all.filter((i) => slugify(parseName(i.name).title) === subject).sort(compareItems('newest'))))
      .catch(() => live && setItems([]));
    return () => {
      live = false;
    };
  }, [c, section, subject]);
  const title = items?.length ? parseName(items[0].name).title : subject.replace(/-/g, ' ');
  const what = section === 'papers' ? 'previous question papers' : 'notes';
  useTitle(`${title} ${what} · OU ${c?.title ?? ''}`);
  if (!c) return <Navigate to={`/${section}`} replace />;
  const codes = [...new Set((items ?? []).map((i) => parseName(i.name).code).filter(Boolean))];
  const sessions = (items ?? []).map((i) => parseName(i.name).session).filter(Boolean);
  return (
    <>
      <PageHero
        eyebrow={<Link to={`/${section}/${c.id}`} className="crumb">← {c.title} {section === 'papers' ? 'papers' : 'notes'}</Link>}
        title={`${title} ${what}`}
        sub={`Osmania University ${c.title}${codes.length ? ` · subject code ${codes.join(', ')}` : ''}${sessions.length ? ` · ${sessions.slice(0, 4).join(', ')}${sessions.length > 4 ? ' and more' : ''}` : ''}`}
      />
      <section className="section tight">
        <div className="wrap narrow">
          {items === null ? (
            <div className="viewer-loading static"><span className="spinner" /> Loading…</div>
          ) : !items.length ? (
            <Empty title="Nothing here yet" body="This subject has no files right now." action={<Link className="btn" to={`/${section}/${c.id}`}>See all {c.title} {s.noun}</Link>} />
          ) : (
            <div className="rows">{items.map((it, i) => <Row key={it.id} item={it} index={i} />)}</div>
          )}
          <SubjectIndex collection={collectionFor(section, c.id)} base={`/${section}/${c.id}`} heading={`More ${c.title} subjects`} />
        </div>
      </section>
    </>
  );
}

/** /search?q=  Matching subjects across every course, papers and notes. */
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  useTitle(q ? `${q} papers and notes` : 'Search');
  const [results, setResults] = useState(null);
  useEffect(() => {
    let live = true;
    searchAll(q).then((r) => live && setResults(r));
    return () => {
      live = false;
    };
  }, [q]);
  return (
    <>
      <PageHero eyebrow="Search" title={q ? `Results for “${q}”` : 'Search papers and notes'} sub="Every course, papers and notes.">
        <SearchBox initial={q} onSubmit={(v) => setParams(v ? { q: v } : {})} />
      </PageHero>
      <section className="section tight">
        <div className="wrap narrow">
          {!q ? null : results === null ? (
            <div className="viewer-loading static"><span className="spinner" /> Searching…</div>
          ) : !results.length ? (
            <Empty title="No matches" body="Try a subject name like “machine learning” or a code like 11589." />
          ) : (
            <div className="rows">{results.map((r, i) => <SearchResult key={r.href} r={r} i={i} />)}</div>
          )}
        </div>
      </section>
    </>
  );
}

function SearchResult({ r, i }) {
  return (
    <Link to={r.href} className="row" style={{ '--i': Math.min(i, 12), '--tint': r.section === 'papers' ? '#4A47A7' : '#0E8C7F' }}>
      <span className="tile"><span className="tile-ico">{r.section === 'papers' ? '📄' : '📒'}</span></span>
      <span className="row-body">
        <span className="row-title">{r.title}</span>
        <span className="pills">
          <span className="pill">{r.course} {r.section}</span>
          <span className="pill">{r.count} {r.section === 'papers' ? (r.count === 1 ? 'paper' : 'papers') : r.count === 1 ? 'set' : 'sets'}</span>
          {r.codes.length ? <span className="pill">#{r.codes.slice(0, 2).join(' #')}</span> : null}
        </span>
      </span>
      <span className="row-go" aria-hidden="true">→</span>
    </Link>
  );
}

/** Searches subject names and codes in every papers and notes collection. */
export async function searchAll(query, limit = 60) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  await Promise.all(
    ['papers', 'notes'].flatMap((section) =>
      COURSES.map(async (c) => {
        const items = await loadCollection(collectionFor(section, c.id)).catch(() => []);
        for (const g of groupSubjects(items)) {
          const hay = `${g.title} ${g.codes.join(' ')}`.toLowerCase();
          const i = hay.indexOf(q);
          if (i < 0) continue;
          out.push({ href: `/${section}/${c.id}/${g.slug}`, title: g.title, course: c.title, section, count: g.items.length, codes: g.codes, score: (i === 0 ? 0 : 1) + (section === 'papers' ? 0 : 0.5) });
        }
      }),
    ),
  );
  return out.sort((a, b) => a.score - b.score || b.count - a.count).slice(0, limit);
}

export function SearchBox({ initial = '', onSubmit, autoFocus, big }) {
  const [v, setV] = useState(initial);
  const navigate = useNavigate();
  return (
    <form
      role="search"
      className={`search-form ${big ? 'big' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        const val = v.trim();
        if (onSubmit) onSubmit(val);
        else navigate(val ? `/search?q=${encodeURIComponent(val)}` : '/search');
      }}>
      <span aria-hidden="true">🔎</span>
      <input type="search" value={v} onChange={(e) => setV(e.target.value)} placeholder="Search any subject or code, e.g. machine learning or 11589" aria-label="Search papers and notes" autoFocus={autoFocus} />
      <button className="btn btn-glow" type="submit">Search</button>
    </form>
  );
}

export function Labs() {
  useTitle('Lab manuals');
  return (
    <>
      <PageHero eyebrow="Labs and Viva" title="Lab Manuals and Viva" sub="Lab manuals, records and viva questions for internals and externals." art="/img/fast_company_lab.gif" />
      <section className="section tight">
        <div className="wrap narrow">
          <ItemList collection="lab_manuals" noun="manuals" emptyText="Lab manuals and viva questions are being added. Have one to share? Email us and it will be added for everyone." />
        </div>
      </section>
    </>
  );
}

export function Placements() {
  useTitle('Placements');
  return (
    <>
      <PageHero eyebrow="Placements and Interviews" title="Get placement-ready" sub="Practice tests, interview questions and job updates." art="/img/interview2.png" />
      <section className="section">
        <div className="wrap">
          <div className="cards three">
            {[
              ['🧮', 'Aptitude and reasoning', 'Short tests with instant answers and explanations, in the app.'],
              ['💻', 'Technical MCQs', 'C, C++, Java and Python quizzes that keep your best score.'],
              ['🎤', 'Interview questions', 'TCS, Infosys and core-subject questions that work offline in the app.'],
            ].map(([ico, t, b], i) => (
              <Reveal key={t} delay={i * 80}>
                <a className="card pad" href={PLAY_URL} target="_blank" rel="noreferrer">
                  <span className="feature-ico" aria-hidden="true">{ico}</span>
                  <h3>{t}</h3>
                  <p className="muted">{b}</p>
                  <span className="card-cta">Open in the app <span aria-hidden="true">→</span></span>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal as="h2" className="section-title spaced">Jobs and internships</Reveal>
          <Reveal className="telegram">
            <span className="feature-ico" aria-hidden="true">📨</span>
            <div>
              <b>Get openings first on Telegram</b>
              <p className="muted">Job and internship openings are posted on t.me/ouallinone.</p>
            </div>
            <a className="btn" href={TELEGRAM_URL} target="_blank" rel="noreferrer">Join</a>
          </Reveal>
          <div className="narrow-left">
            <ItemList collection="jobs" noun="listings" emptyText="No listings on the website right now. The Telegram channel has the latest openings." />
          </div>
        </div>
      </section>
    </>
  );
}

/** /view/:id  A Drive PDF inside the site, with a download button. */
export function Viewer() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const name = params.get('t') ?? 'Paper';
  const p = parseName(name);
  const title = p.session ? `${p.title} · ${p.session}` : p.title;
  useTitle(title);
  const [loaded, setLoaded] = useState(false);
  return (
    <section className="viewer">
      <div className="wrap viewer-bar">
        <button className="btn btn-ghost btn-small" onClick={() => history.back()}>← Back</button>
        <h1 className="viewer-title">{title}</h1>
        <a className="btn btn-small" href={driveDownload(id)} target="_blank" rel="noreferrer">Download</a>
      </div>
      <div className="viewer-frame">
        {!loaded ? <div className="viewer-loading"><span className="spinner" /> Opening…</div> : null}
        <iframe title={title} src={drivePreview(id)} allow="autoplay" onLoad={() => setLoaded(true)} />
      </div>
    </section>
  );
}

let foldersPromise = null;
const loadFolders = () => (foldersPromise ??= fetch('/data/folders.json').then((r) => (r.ok ? r.json() : { folders: {} })).catch(() => ({ folders: {} })));
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

/** /folder/:id  A shared Drive folder of notes, listed in the site's own design with neutral file names. */
export function Folder() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const title = params.get('t') ?? 'Notes folder';
  useTitle(title);
  const [entries, setEntries] = useState(undefined);
  useEffect(() => {
    let live = true;
    loadFolders().then((d) => live && setEntries(d.folders?.[id] ?? null));
    return () => {
      live = false;
    };
  }, [id]);

  const { list, labels } = useMemo(() => {
    const rank = { folder: 0, pdf: 1, other: 2 };
    const sorted = [...(entries ?? [])].sort((a, b) => rank[a.kind] - rank[b.kind] || unitSortKey(a.name) - unitSortKey(b.name) || collator.compare(a.name, b.name));
    const files = sorted.filter((e) => e.kind !== 'folder');
    const names = neutralLabels(files.map((f) => f.name));
    const map = new Map(files.map((f, i) => [f.id, names[i]]));
    sorted.filter((e) => e.kind === 'folder').forEach((f) => map.set(f.id, f.name.replace(/\b[a-z]/g, (c) => c.toUpperCase())));
    return { list: sorted, labels: map };
  }, [entries]);

  const files = list.filter((e) => e.kind !== 'folder').length;
  const folders = list.length - files;
  const sub = entries ? [files && `${files} file${files === 1 ? '' : 's'}`, folders && `${folders} folder${folders === 1 ? '' : 's'}`].filter(Boolean).join(' · ') || 'Empty folder' : 'Notes folder';

  return (
    <>
      <PageHero eyebrow={<button className="crumb as-link" onClick={() => history.back()}>← Back</button>} title={title} sub={sub} />
      <section className="section tight">
        <div className="wrap narrow">
          {entries === undefined ? (
            <div className="viewer-loading static"><span className="spinner" /> Opening folder…</div>
          ) : entries === null ? (
            <>
              <div className="folder-frame">
                <iframe title={title} src={folderEmbed(id)} />
              </div>
              <p className="muted small center">Files open in Google Drive&apos;s viewer in a new tab.</p>
            </>
          ) : !list.length ? (
            <Empty title="This folder is empty" />
          ) : (
            <div className="rows">
              {list.map((e, i) =>
                e.kind === 'folder' ? (
                  <button key={e.id} className="row" style={{ '--i': Math.min(i, 12), '--tint': '#16a394' }} onClick={() => navigate(`/folder/${e.id}?t=${encodeURIComponent(`${title} · ${labels.get(e.id)}`)}`)}>
                    <span className="tile"><span className="tile-ico">📁</span></span>
                    <span className="row-body"><span className="row-title">{labels.get(e.id)}</span></span>
                    <span className="row-go" aria-hidden="true">→</span>
                  </button>
                ) : e.kind === 'pdf' ? (
                  <button key={e.id} className="row" style={{ '--i': Math.min(i, 12) }} onClick={() => navigate(`/view/${e.id}?t=${encodeURIComponent(`${title} · ${labels.get(e.id)}`)}`)}>
                    <span className="tile"><span className="tile-ico">📄</span></span>
                    <span className="row-body"><span className="row-title">{labels.get(e.id)}</span></span>
                    <span className="row-go" aria-hidden="true">→</span>
                  </button>
                ) : (
                  <a key={e.id} className="row" style={{ '--i': Math.min(i, 12), '--tint': '#6b6a82' }} href={`https://drive.google.com/file/d/${e.id}/view`} target="_blank" rel="noreferrer">
                    <span className="tile"><span className="tile-ico">📝</span></span>
                    <span className="row-body">
                      <span className="row-title">{labels.get(e.id)}</span>
                      <span className="pills"><span className="pill">Opens in Google Drive</span></span>
                    </span>
                    <span className="row-go" aria-hidden="true">↗</span>
                  </a>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const GRADES = [['O', 10], ['A+', 9], ['A', 8], ['B+', 7], ['B', 6], ['C', 5], ['F', 0]];

export function Tools() {
  useTitle('SGPA and attendance calculators');
  const [subjects, setSubjects] = useState([{ c: 3, g: 10 }, { c: 3, g: 9 }, { c: 3, g: 8 }]);
  const [att, setAtt] = useState({ a: '', t: '', p: '75' });
  const credits = subjects.reduce((s, x) => s + x.c, 0);
  const sgpa = credits ? subjects.reduce((s, x) => s + x.c * x.g, 0) / credits : 0;
  const a = Number(att.a), t = Number(att.t), p = Number(att.p) / 100;
  const ok = [a, t, p].every(Number.isFinite) && t > 0 && a >= 0 && a <= t && p > 0 && p < 1;
  const canSkip = ok && a / t >= p ? Math.floor(a / p - t) : 0;
  const mustAttend = ok && a / t < p ? Math.ceil((p * t - a) / (1 - p)) : 0;
  const num = (v) => v.replace(/[^0-9.]/g, '');
  return (
    <>
      <PageHero eyebrow="Student tools" title="SGPA and attendance calculators" sub="Work out your SGPA, or how many classes you can skip. Nothing you type leaves this page." />
      <section className="section tight">
        <div className="wrap tools">
          <Reveal className="panel">
            <h2>SGPA</h2>
            <div className="big-number">{sgpa.toFixed(2)}</div>
            <p className="muted center">{credits} credits</p>
            {subjects.map((s, i) => (
              <div key={i} className="subject-row">
                <span className="muted">Subject {i + 1}</span>
                <div className="stepper">
                  <button aria-label="Fewer credits" onClick={() => setSubjects((x) => x.map((y, j) => (j === i ? { ...y, c: Math.max(0.5, y.c - 0.5) } : y)))}>−</button>
                  <span>{s.c} cr</span>
                  <button aria-label="More credits" onClick={() => setSubjects((x) => x.map((y, j) => (j === i ? { ...y, c: Math.min(10, y.c + 0.5) } : y)))}>+</button>
                </div>
                <div className="grades">
                  {GRADES.map(([g, pts]) => (
                    <button key={g} className={s.g === pts ? 'on' : ''} onClick={() => setSubjects((x) => x.map((y, j) => (j === i ? { ...y, g: pts } : y)))}>{g}</button>
                  ))}
                </div>
                <button className="icon-btn" aria-label={`Remove subject ${i + 1}`} onClick={() => setSubjects((x) => x.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={() => setSubjects((x) => [...x, { c: 3, g: 8 }])}>+ Add subject</button>
          </Reveal>
          <Reveal className="panel" delay={100}>
            <h2>Attendance</h2>
            <div className="fields">
              <label>Classes attended<input inputMode="decimal" value={att.a} placeholder="42" onChange={(e) => setAtt({ ...att, a: num(e.target.value) })} /></label>
              <label>Classes held<input inputMode="decimal" value={att.t} placeholder="60" onChange={(e) => setAtt({ ...att, t: num(e.target.value) })} /></label>
              <label>Required %<input inputMode="decimal" value={att.p} placeholder="75" onChange={(e) => setAtt({ ...att, p: num(e.target.value) })} /></label>
            </div>
            {ok ? (
              <>
                <div className={`big-number ${mustAttend ? 'bad' : 'good'}`}>{((a / t) * 100).toFixed(1)}%</div>
                <p className="center">
                  {mustAttend
                    ? `Attend the next ${mustAttend} class${mustAttend === 1 ? '' : 'es'} in a row to reach ${att.p}%.`
                    : canSkip > 0
                      ? `You can skip ${canSkip} class${canSkip === 1 ? '' : 'es'} and stay at or above ${att.p}%.`
                      : "You're exactly at the limit. Don't skip the next class."}
                </p>
              </>
            ) : (
              <p className="muted center">Enter your numbers to see how many classes you can skip or need to attend.</p>
            )}
            <p className="muted small">OU requires 75% attendance to sit for semester exams (65% with condonation).</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function Contact() {
  useTitle('Contact');
  return (
    <>
      <PageHero eyebrow="Contact" title="Say hello" sub="Questions, ideas, or a paper to share? Every message is read." art="/img/dev_pic.gif" />
      <section className="section tight">
        <div className="wrap cards three">
          <Reveal>
            <a className="card pad" href={`mailto:${CONTACT_EMAIL}`}>
              <span className="feature-ico" aria-hidden="true">✉️</span>
              <h3>Email</h3>
              <p className="muted">{CONTACT_EMAIL}</p>
            </a>
          </Reveal>
          <Reveal delay={80}>
            <a className="card pad" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
              <span className="feature-ico" aria-hidden="true">📨</span>
              <h3>Telegram</h3>
              <p className="muted">t.me/ouallinone</p>
            </a>
          </Reveal>
          <Reveal delay={160}>
            <a className="card pad" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Report or removal request')}`}>
              <span className="feature-ico" aria-hidden="true">🚩</span>
              <h3>Report a file</h3>
              <p className="muted">Wrong file, broken link or a copyright removal request.</p>
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function NotFound() {
  useTitle('Page not found');
  return (
    <section className="section">
      <div className="wrap">
        <Empty title="Page not found" body="That page doesn't exist any more." action={<Link className="btn" to="/">Go home</Link>} />
      </div>
    </section>
  );
}

/** Warms the session cache for the lists a visitor is likely to open next. */
export function usePrefetch(section) {
  useEffect(() => {
    if (!section) return;
    for (const c of COURSES) loadCollection(collectionFor(section, c.id)).catch(() => {});
  }, [section]);
}
