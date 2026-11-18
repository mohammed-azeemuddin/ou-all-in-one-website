import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { loadCollection } from '../lib/firestore';
import { resolve } from '../lib/files';
import { compareItems, SORTS } from '../lib/sort';
import { slugify } from '../lib/seo';
import { CSE_AI_IT, facets, groupBySubject, parseName } from '../lib/subjects';
import { Empty } from './ui';

const BRANCH_ORDER = [CSE_AI_IT, 'ECE', 'EEE', 'Inst', 'Civil', 'Mech', 'Prod', 'Auto'];
const PAGE = 60;

const TINTS = ['#4A47A7', '#0E8C7F', '#2457C5', '#C2571A', '#B4326E', '#3C7D22'];
function tint(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}
function initials(title) {
  const words = title.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w) && !/^(and|of|the|in|for|to)$/i.test(w));
  return (words.slice(0, 3).map((w) => w[0]).join('') || title.slice(0, 2)).toUpperCase();
}

/** Open an item: PDFs in the site's viewer, folders in the folder page, anything else in a new tab. */
export function useOpen() {
  const navigate = useNavigate();
  return (item) => {
    const r = resolve(item);
    const title = parseName(item.name).title;
    if (r.kind === 'drive') navigate(`/view/${r.id}?t=${encodeURIComponent(item.name)}`);
    else if (r.kind === 'folder') navigate(`/folder/${r.id}?t=${encodeURIComponent(title)}`);
    else if (r.kind === 'pdf' || r.kind === 'link') window.open(r.url, '_blank', 'noopener');
    else alert(r.reason);
  };
}

export function Row({ item, compact, index }) {
  const open = useOpen();
  const pn = parseName(item.name);
  const r = resolve(item);
  const unavailable = r.kind === 'unavailable';
  const [mon, yr] = pn.session && /^[A-Z][a-z]{2} \d{4}$/.test(pn.session) ? pn.session.split(' ') : [null, null];
  const yearRange = !mon && pn.session ? pn.session : null;
  const semNo = pn.title.match(/\bSem (\d)\b/)?.[1];
  const color = tint(pn.subject);
  return (
    <button
      type="button"
      className={`row ${unavailable ? 'is-unavailable' : ''}`}
      style={{ '--tint': color, '--i': Math.min(index, 12) }}
      onClick={() => open(item)}
      aria-label={`${pn.title}${pn.session ? `, ${pn.session}` : ''}`}>
      <span className="tile">
        {unavailable ? (
          <span className="tile-ico">⏳</span>
        ) : r.kind === 'folder' ? (
          <span className="tile-ico">📁</span>
        ) : semNo && !mon ? (
          <>
            <small>SEM</small>
            <b>{semNo}</b>
          </>
        ) : mon ? (
          <>
            <small>{mon.toUpperCase()}</small>
            <b>{yr}</b>
          </>
        ) : (
          <b className="tile-init">{initials(pn.title)}</b>
        )}
      </span>
      <span className="row-body">
        <span className="row-title">{compact && pn.session ? `${pn.session} exam` : pn.title}</span>
        <span className="pills">
          {pn.code && !compact ? <span className="pill">#{pn.code}</span> : null}
          {yearRange && !compact ? <span className="pill">{yearRange}</span> : null}
          {pn.tag && !/^sem/i.test(pn.tag) ? <span className="pill pill-accent">{pn.tag}</span> : null}
          {r.kind === 'folder' ? <span className="pill">Folder</span> : null}
          {unavailable ? <span className="pill pill-warn">Coming soon</span> : null}
        </span>
      </span>
      <span className="row-go" aria-hidden="true">→</span>
    </button>
  );
}

function Skeleton() {
  return (
    <div className="rows" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="row skeleton" style={{ '--i': i }}>
          <span className="tile" />
          <span className="row-body">
            <span className="sk-line" style={{ width: `${70 - (i % 3) * 12}%` }} />
            <span className="sk-line short" />
          </span>
        </div>
      ))}
    </div>
  );
}

/** The shared list used by every catalog page: search, branch chips, sort, subject grouping. */
export default function ItemList({ collection, noun = 'items', groupable, emptyText, subjectBase, hideEmpty = false }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [q, setQ] = useState('');
  const [branch, setBranch] = useState(null);
  const [sort, setSort] = useState('newest');
  const [grouped, setGrouped] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const sentinel = useRef(null);

  useEffect(() => {
    let live = true;
    setItems(null);
    setError(null);
    loadCollection(collection)
      .then((x) => live && setItems(x))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [collection, attempt]);

  const all = items ?? [];
  const facetMap = useMemo(() => new Map(all.map((i) => [i.id, facets(i)])), [all]);
  const branches = useMemo(() => {
    const fs = [...facetMap.values()];
    const found = new Set(fs.flatMap((f) => f.branches));
    const tagged = fs.filter((f) => f.branches.length).length;
    if (found.size < 3 || tagged < fs.length * 0.3) return [];
    return BRANCH_ORDER.filter((b) => found.has(b)).concat([...found].filter((b) => !BRANCH_ORDER.includes(b)).sort());
  }, [facetMap]);
  const sorted = useMemo(() => [...all].sort(compareItems(sort)), [all, sort]);
  const hay = useMemo(() => new Map(all.map((i) => { const p = parseName(i.name); return [i.id, `${i.name}\n${p.title}\n${p.code ?? ''}`.toLowerCase()]; })), [all]);
  const dq = useDeferredValue(q);
  const filtered = useMemo(() => {
    const n = dq.trim().toLowerCase();
    return sorted.filter((i) => {
      const f = facetMap.get(i.id);
      if (branch && f?.branches.length && !f.branches.includes(branch)) return false;
      return !n || hay.get(i.id).includes(n);
    });
  }, [sorted, dq, branch, facetMap, hay]);
  const groups = useMemo(() => (grouped ? groupBySubject(filtered) : []), [grouped, filtered]);

  useEffect(() => {
    setLimit(PAGE);
  }, [dq, branch, sort, grouped]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLimit((l) => l + PAGE), { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [items, grouped]);

  if (error)
    return (
      <Empty
        title="Couldn't load this list"
        body="Check your internet connection and try again."
        action={<button className="btn" onClick={() => setAttempt((a) => a + 1)}>Try again</button>}
      />
    );
  if (!items) return <Skeleton />;
  if (!items.length && hideEmpty) return null;
  if (!items.length) return <Empty title="Nothing here yet" body={emptyText ?? 'New material is added regularly.'} />;

  const subjects = new Set(all.map((i) => parseName(i.name).subject)).size;
  const hasCodes = all.some((i) => parseName(i.name).code);

  return (
    <div>
      <div className="toolbar">
        <label className="search">
          <span aria-hidden="true">🔎</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={hasCodes ? 'Search subject or code, e.g. 11589' : 'Search subjects'}
            aria-label="Search"
          />
        </label>
        <div className="toolbar-row">
          <span className="count">
            {filtered.length === all.length ? `${all.length} ${noun}` : `${filtered.length} of ${all.length}`}
            {subjects > 1 && subjects <= all.length * 0.8 ? ` · ${subjects} subjects` : ''}
          </span>
          <div className="toolbar-actions">
            {groupable ? (
              <div className="segmented" role="group" aria-label="Layout">
                <button className={!grouped ? 'on' : ''} onClick={() => setGrouped(false)}>All</button>
                <button className={grouped ? 'on' : ''} onClick={() => setGrouped(true)}>By subject</button>
              </div>
            ) : null}
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        {branches.length > 1 ? (
          <div className="chips" role="group" aria-label="Branch">
            <button className={`chip ${branch == null ? 'on' : ''}`} onClick={() => setBranch(null)}>All branches</button>
            {branches.map((b) => (
              <button key={b} className={`chip ${branch === b ? 'on' : ''}`} onClick={() => setBranch(branch === b ? null : b)}>{b}</button>
            ))}
          </div>
        ) : null}
      </div>

      {!filtered.length ? (
        <Empty title="No matches" body="Try a different subject name or code." />
      ) : grouped ? (
        <div className="groups" key={`g-${dq}-${branch}-${sort}`}>
          {groups.slice(0, Math.ceil(limit / 4)).map((g) => (
            <section key={g.key} className="group">
              <h3 className="group-title">
                {subjectBase ? <Link to={`${subjectBase}/${slugify(g.title)}`}>{g.title}</Link> : <span>{g.title}</span>}
                <span className="group-count">{g.items.length}</span>
              </h3>
              {g.codes.length ? <div className="muted small">#{g.codes.join(' · #')}</div> : null}
              <div className="rows">
                {g.items.map((it, i) => <Row key={it.id} item={it} compact index={i} />)}
              </div>
            </section>
          ))}
          <div ref={sentinel} />
        </div>
      ) : (
        <div className="rows" key={`r-${dq}-${branch}-${sort}`}>
          {filtered.slice(0, limit).map((it, i) => <Row key={it.id} item={it} index={i} />)}
          <div ref={sentinel} />
        </div>
      )}
    </div>
  );
}
