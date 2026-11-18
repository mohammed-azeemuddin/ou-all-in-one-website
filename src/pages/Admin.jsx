/**
 * /admin: sign in, then add or delete papers, notes, lab manuals and job listings, post to the
 * app's "What's New" list (Firestore `whats_new`) and edit the home notice. Everything is written to Firestore, which the app
 * and this website both read, so changes appear without an app update or a website deploy.
 *
 * The page is public but harmless without the admin account: Firestore's security rules refuse
 * writes from anyone else (firestore.rules).
 */
import { useEffect, useMemo, useState } from 'react';

import { PageHero, useTitle } from '../components/ui';
import { adminEmail, deleteItem, listItems, onRebuildStatus, readMeta, rebuildNow, rebuildStatus, saveItem, saveMeta, signIn, signOut } from '../lib/admin';
import { COURSES } from '../lib/courses';
import { parseName } from '../lib/subjects';

const DRIVE_FILE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]{10,})/;
const DRIVE_FOLDER = /drive\.google\.com\/drive\/(?:mobile\/)?(?:u\/\d+\/)?folders\/([\w-]{10,})/;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
// The `branch` values the app's branch filter understands (Engineering only).
const BRANCHES = [['', 'All branches / not sure'], ['cse', 'CSE, AI, IT'], ['ece', 'ECE'], ['eee', 'EEE'], ['eie', 'Instrumentation'], ['civil', 'Civil'], ['mech', 'Mechanical'], ['prod', 'Production']];
const KINDS = [
  ['papers', 'Question paper'],
  ['notes', 'Notes'],
  ['labs', 'Lab manual'],
  ['jobs', 'Job or internship'],
];
const collectionOf = (kind, course) => (kind === 'papers' ? `${course}_qp` : kind === 'notes' ? `${course}_notes` : kind === 'labs' ? 'lab_manuals' : kind === 'updates' ? 'whats_new' : 'jobs');
// The Existing items list can also show What's New posts.
const MANAGE_KINDS = [['papers', 'Question papers'], ['notes', 'Notes'], ['labs', 'Lab manuals'], ['jobs', 'Jobs and internships'], ['updates', 'What’s New posts']];
/** Drive file link -> Drive's image thumbnail (the same conversion the app does), so the preview shows the picture. */
const imagePreview = (u) => { const id = u.match(DRIVE_FILE)?.[1]; return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1200` : u; };

/** "Machine Learning", 10481, FEB, 2026 -> "MACHINE-LEARNING-10481-FEB-2026" (the format the app's name parser reads). */
const paperName = (subject, code, month, year) => `${subject.trim().toUpperCase().replace(/&/g, ' AND ').replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${code}-${month}-${year}`;

function SignIn({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="panel admin-form" onSubmit={submit}>
      <h2>Admin sign-in</h2>
      <label>Email<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error ? <p className="admin-msg is-bad" role="alert">{error}</p> : null}
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

function AddItem() {
  const [kind, setKind] = useState('papers');
  const [course, setCourse] = useState('engineering');
  const [f, setF] = useState({ subject: '', code: '', month: 'DEC', year: String(new Date().getFullYear()), name: '', url: '', branch: '', semester: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const url = f.url.trim();
  const fileId = url.match(DRIVE_FILE)?.[1];
  const folderId = url.match(DRIVE_FOLDER)?.[1];
  const name = kind === 'papers' ? (f.subject.trim() && /^\d{3,5}$/.test(f.code) ? paperName(f.subject, f.code, f.month, f.year) : '') : f.name.trim();
  const preview = name ? parseName(name) : null;
  const problem = !name
    ? kind === 'papers' ? 'Enter the subject and its 3 to 5 digit paper code.' : 'Enter a name.'
    : !/^https:\/\/\S+$/.test(url)
      ? 'Paste the full link, starting with https://'
      : kind === 'papers' && !/^(19|20)\d{2}$/.test(f.year)
        ? 'Enter the exam year, for example 2026.'
        : '';

  const submit = async (e) => {
    e.preventDefault();
    if (problem) return;
    setBusy(true);
    setMsg(null);
    try {
      const collection = collectionOf(kind, course);
      await saveItem(collection, fileId ?? folderId ?? null, {
        name,
        url,
        type: fileId ? 'pdf' : folderId ? 'drive-folder' : /\.pdf(\?|#|$)/i.test(url) ? 'pdf' : 'link',
        course: kind === 'papers' || kind === 'notes' ? course : undefined,
        branch: kind !== 'jobs' && (kind === 'labs' || course === 'engineering') ? f.branch : undefined,
        semester: kind !== 'jobs' && f.semester ? Number(f.semester) : undefined,
        year: kind === 'papers' ? Number(f.year) : undefined,
        updatedAt: Date.now(),
      });
      setMsg({ ok: true, text: `Added "${preview.title}${preview.session ? ` · ${preview.session}` : ''}" to ${collection}. It is live on the website now and in the app the next time it is opened.` });
      setF((x) => ({ ...x, url: '', name: '' }));
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel admin-form" onSubmit={submit}>
      <h2>Add something</h2>
      <div className="chips">
        {KINDS.map(([k, label]) => <button key={k} type="button" className={`chip ${kind === k ? 'on' : ''}`} aria-pressed={kind === k} onClick={() => { setKind(k); setMsg(null); }}>{label}</button>)}
      </div>
      {kind === 'papers' || kind === 'notes' ? (
        <label>Course
          <select value={course} onChange={(e) => setCourse(e.target.value)}>{COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        </label>
      ) : null}
      {kind === 'papers' ? (
        <>
          <label>Subject<input value={f.subject} onChange={set('subject')} placeholder="Machine Learning" /></label>
          <div className="admin-row">
            <label>Paper code<input value={f.code} onChange={set('code')} inputMode="numeric" placeholder="10481" /></label>
            <label>Exam month<select value={f.month} onChange={set('month')}>{MONTHS.map((m) => <option key={m}>{m}</option>)}</select></label>
            <label>Exam year<input value={f.year} onChange={set('year')} inputMode="numeric" /></label>
          </div>
        </>
      ) : (
        <label>{kind === 'jobs' ? 'Title' : kind === 'labs' ? 'Lab name' : 'Subject name'}
          <input value={f.name} onChange={set('name')} placeholder={kind === 'jobs' ? 'TCS NQT 2027 batch: apply by 30 Nov' : kind === 'labs' ? 'Data Structures Lab manual' : 'Machine Design (MD)'} />
        </label>
      )}
      <label>{kind === 'jobs' ? 'Link to the opening' : 'Google Drive link (file or folder, shared as “Anyone with the link”)'}
        <input value={f.url} onChange={set('url')} inputMode="url" placeholder="https://drive.google.com/file/d/…/view" />
      </label>
      {kind !== 'jobs' ? (
        <div className="admin-row">
          {kind === 'labs' || course === 'engineering' ? <label>Branch<select value={f.branch} onChange={set('branch')}>{BRANCHES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label> : null}
          <label>Semester (optional)<select value={f.semester} onChange={set('semester')}><option value="">Not set</option>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n}>{n}</option>)}</select></label>
        </div>
      ) : null}
      {preview ? (
        <p className="admin-preview">Students will see: <b>{preview.title}</b>{preview.code ? ` · code ${preview.code}` : ''}{preview.session ? ` · ${preview.session}` : ''}
          {url && kind !== 'jobs' ? <span className="muted"> · {fileId ? 'opens as a PDF inside the app and site' : folderId ? 'opens as a folder of files' : 'not a Drive link: opens in the browser'}</span> : null}
        </p>
      ) : null}
      {msg ? <p className={`admin-msg ${msg.ok ? 'is-good' : 'is-bad'}`} role="status">{msg.text}</p> : null}
      <button className="btn" disabled={busy || !!problem}>{busy ? 'Adding…' : 'Add'}</button>
      {problem && (name || url) ? <p className="muted small">{problem}</p> : null}
    </form>
  );
}

function Manage() {
  const [kind, setKind] = useState('papers');
  const [course, setCourse] = useState('engineering');
  const collection = collectionOf(kind, course);
  const [state, setState] = useState({ for: '', items: null, error: '' });
  const [q, setQ] = useState('');
  const load = async () => {
    setState({ for: collection, items: null, error: '' });
    try {
      setState({ for: collection, items: await listItems(collection), error: '' });
    } catch (err) {
      setState({ for: collection, items: [], error: err.message });
    }
  };
  const items = state.for === collection ? state.items : undefined;
  const shown = useMemo(() => (items ?? []).filter((i) => !q.trim() || String(i.name).toLowerCase().includes(q.trim().toLowerCase())).slice(0, 80), [items, q]);
  const remove = async (it) => {
    if (!confirm(`Delete "${it.name}" from ${collection}?\n\nIt disappears from the app and website. The file itself stays in Drive.`)) return;
    try {
      await deleteItem(collection, it.id);
      setState((s) => ({ ...s, items: s.items.filter((x) => x.id !== it.id) }));
    } catch (err) {
      alert(err.message);
    }
  };
  return (
    <div className="panel admin-form">
      <h2>Existing items</h2>
      <div className="chips">
        {MANAGE_KINDS.map(([k, label]) => <button key={k} type="button" className={`chip ${kind === k ? 'on' : ''}`} aria-pressed={kind === k} onClick={() => setKind(k)}>{label}</button>)}
      </div>
      {kind === 'papers' || kind === 'notes' ? (
        <label>Course
          <select value={course} onChange={(e) => setCourse(e.target.value)}>{COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        </label>
      ) : null}
      {items === undefined ? (
        <button type="button" className="btn btn-ghost" onClick={load}>Show the list</button>
      ) : items === null ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          {state.error ? <p className="admin-msg is-bad">{state.error}</p> : null}
          <label>Find<input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Subject, code or year" /></label>
          <p className="muted small">{items.length} in {collection}, most recently changed first{shown.length < items.length ? ` (showing ${shown.length})` : ''}.</p>
          <ul className="admin-list">
            {shown.map((it) => (
              <li key={it.id}>
                <a href={it.url} target="_blank" rel="noreferrer">{it.name}</a>
                <button type="button" className="link-btn admin-del" onClick={() => remove(it)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Notice() {
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    readMeta().then((d) => setNotice(d.notice ?? ''));
  }, []);
  if (notice === null) return <div className="panel"><p className="muted">Loading…</p></div>;
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await saveMeta({ notice: notice.trim() });
      setMsg({ ok: true, text: notice.trim() ? 'Saved. It shows on the app and website home screens.' : 'Notice removed.' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="panel admin-form" onSubmit={save}>
      <h2>Home notice</h2>
      <label>A short line on the home screen of the app and website (leave empty for none)
        <input value={notice} onChange={(e) => setNotice(e.target.value)} maxLength={160} />
      </label>
      {msg ? <p className={`admin-msg ${msg.ok ? 'is-good' : 'is-bad'}`} role="status">{msg.text}</p> : null}
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save notice'}</button>
    </form>
  );
}

const EMPTY_POST = { title: '', body: '', image: '', link: '', linkText: '' };

/** A What's New post: the app's home card shows the newest one, and the What's New screen lists them all. */
function AddUpdate() {
  const [f, setF] = useState(EMPTY_POST);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [imgOk, setImgOk] = useState(true);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const image = f.image.trim();
  const link = f.link.trim();
  const problem = !f.title.trim()
    ? 'Enter a title.'
    : image && !/^https:\/\/\S+$/.test(image)
      ? 'The picture link must start with https://'
      : link && !/^(https:\/\/\S+|\/[\w/-]*)$/.test(link)
        ? 'The button link must start with https:// (or / for an app screen such as /papers).'
        : '';
  const submit = async (e) => {
    e.preventDefault();
    if (problem) return;
    setBusy(true);
    setMsg(null);
    try {
      const now = Date.now();
      await saveItem('whats_new', null, { name: f.title.trim(), body: f.body.trim(), image, link, linkText: link ? f.linkText.trim() : '', date: now, updatedAt: now });
      setMsg({ ok: true, text: 'Posted. It is the newest item in What’s New and on the app’s home card the next time the app is opened.' });
      setF(EMPTY_POST);
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="panel admin-form" onSubmit={submit}>
      <h2>Post to What’s New</h2>
      <p className="muted small">The app’s home card shows the newest post; tapping it opens the full list. Delete old posts under Existing items.</p>
      <label>Title<input value={f.title} onChange={set('title')} maxLength={120} placeholder="New: Pharmacy papers for 2025 added" /></label>
      <label>Text (optional)<textarea rows={4} value={f.body} onChange={set('body')} maxLength={1200} placeholder="A line or two about what changed." /></label>
      <label>Picture (optional): a Google Drive image shared as “Anyone with the link”, or any https image link. Wide pictures (16:9) look best.
        <input value={f.image} onChange={(e) => { set('image')(e); setImgOk(true); }} inputMode="url" placeholder="https://drive.google.com/file/d/…/view" />
      </label>
      {image && /^https:\/\//.test(image) ? (
        imgOk ? <img key={image} className="admin-img" src={imagePreview(image)} referrerPolicy="no-referrer" alt="Picture preview" onLoad={() => setImgOk(true)} onError={() => setImgOk(false)} /> : <p className="admin-msg is-bad">This picture doesn’t load. Check that the Drive file is shared as “Anyone with the link”.</p>
      ) : null}
      <div className="admin-row">
        <label>Button link (optional)<input value={f.link} onChange={set('link')} placeholder="https://… or /papers" /></label>
        <label>Button text<input value={f.linkText} onChange={set('linkText')} maxLength={24} placeholder="Open" disabled={!link} /></label>
      </div>
      {msg ? <p className={`admin-msg ${msg.ok ? 'is-good' : 'is-bad'}`} role="status">{msg.text}</p> : null}
      <button className="btn" disabled={busy || !!problem}>{busy ? 'Posting…' : 'Post'}</button>
      {problem && (f.title || f.image || f.link) ? <p className="muted small">{problem}</p> : null}
    </form>
  );
}

/** Where the website rebuild stands after a change (the app needs no rebuild: it reads the database). */
function RebuildBar() {
  const [st, setSt] = useState(rebuildStatus());
  const [, tick] = useState(0);
  useEffect(() => onRebuildStatus(setSt), []);
  useEffect(() => {
    if (st.status !== 'waiting') return undefined;
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [st.status]);
  if (st.status === 'idle') return null;
  const secs = st.status === 'waiting' ? Math.max(0, Math.ceil((st.at - Date.now()) / 1000)) : 0;
  return (
    <div className={`admin-msg rebuild-bar ${st.status === 'failed' ? 'is-bad' : 'is-good'}`} role="status">
      {st.status === 'waiting' ? <>Website update starts in {secs}s (waiting for more changes). <button type="button" className="link-btn" onClick={() => void rebuildNow()}>Start now</button></> : null}
      {st.status === 'sending' ? 'Starting the website update…' : null}
      {st.status === 'started' ? 'Website update started. Pages Google reads catch up in about 2 minutes. The app already has your changes.' : null}
      {st.status === 'failed' ? <>Website update didn’t start: {st.error} <button type="button" className="link-btn" onClick={() => void rebuildNow()}>Try again</button></> : null}
    </div>
  );
}

export default function Admin() {
  useTitle('Admin', { noindex: true });
  const [email, setEmail] = useState(adminEmail());
  return (
    <>
      <PageHero eyebrow="Admin" title="Add and manage content" sub="Changes go live in the app and on the website without an app update." />
      <section className="section tight">
        <div className="wrap narrow admin">
          {!email ? <SignIn onDone={() => setEmail(adminEmail())} /> : (
            <>
              <p className="muted">Signed in as {email}. <button type="button" className="link-btn" onClick={() => { signOut(); setEmail(null); }}>Sign out</button></p>
              <RebuildBar />
              <AddItem />
              <AddUpdate />
              <Notice />
              <Manage />
            </>
          )}
        </div>
      </section>
    </>
  );
}
