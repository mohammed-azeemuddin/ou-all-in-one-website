/**
 * Placement prep: sections (aptitude, reasoning, verbal, technical), programming and AI topics,
 * company-wise preparation, practice pages and timed mock tests. Data comes from
 * /data/placements (built by scripts/build-placements.mjs).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';

import ItemList from '../components/ItemList';
import { Empty, PageHero, Reveal, useTitle } from '../components/ui';
import { TELEGRAM_URL } from '../lib/courses';
import { answer, companyStats, groupStats, mockStats, recordMock, resetAll, resetTopic, TARGET, topicDone, useProgress } from '../lib/progress';

const BASE = '/data/placements';
const cache = new Map();
function getJson(path) {
  if (!cache.has(path)) cache.set(path, fetch(`${BASE}/${path}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))));
  return cache.get(path);
}
function useJson(path) {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => {
    let live = true;
    setState({ data: null, error: null });
    getJson(path).then((data) => live && setState({ data, error: null }), (error) => live && setState({ data: null, error }));
    return () => {
      live = false;
    };
  }, [path]);
  return state;
}
function Bar({ pct, label, done }) {
  return (
    <div className={`bar ${done ? 'done' : ''}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <i style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

/** Company logo (official mark in /img/companies), falling back to initials. */
export function CompanyLogo({ c, size = 48 }) {
  const [failed, setFailed] = useState(false);
  if (!c.logo || failed) return <span className="company-ico" style={{ width: size, height: size }} aria-hidden="true">{c.name.slice(0, 2).toUpperCase()}</span>;
  return (
    <span className="company-logo" style={{ width: Math.round(size * 1.9), height: size }}>
      <img src={c.logo} alt={`${c.name} logo`} loading="lazy" onError={() => setFailed(true)} />
    </span>
  );
}

const TOPIC_BADGE = { c: 'C', cpp: 'C++', java: 'J', python: 'Py', genai: 'GA', dbms: 'DB', os: 'OS', ai: 'AI', 'networking-security-cloud': 'NW', 'ms-office': 'MO', pseudocode: 'PC' };
const ICON = { aptitude: '🧮', reasoning: '🧩', verbal: '📝', technical: '💻', c: '🅲', cpp: '➕', java: '☕', python: '🐍', ai: '🤖', genai: '✨' };
const findGroup = (index, id) => index.sections.find((s) => s.id === id) ?? index.languages?.find((l) => l.id === id);

function Loading() {
  return (
    <div className="viewer-loading static">
      <span className="spinner" /> Loading…
    </div>
  );
}
function Failed() {
  return <Empty title="Couldn't load this page" body="Check your connection and try again." action={<button className="btn btn-small" onClick={() => location.reload()}>Try again</button>} />;
}

function MockCard({ m }) {
  const p = useProgress();
  const st = mockStats(p, m.id);
  return (
    <Link to={`/placements/mock/${m.id}`} className={`mock-card ${st.taken ? 'is-taken' : ''}`}>
      <span className="mock-num">{m.title.match(/(\d+)$/)?.[1]}</span>
      <div>
        <b>{m.title}</b>
        <small className="muted">
          {m.questions} questions · {m.minutes} min{m.sections.length > 1 ? ` · ${m.sections.length} sections` : ''}
        </small>
        {st.taken ? <small className="pill pill-accent">Taken {st.taken}× · best {st.best.s}/{st.best.n}</small> : <small className="pill">Not taken yet</small>}
      </div>
      <span className="row-go" aria-hidden="true">→</span>
    </Link>
  );
}

function GroupMini({ g, p }) {
  const gs = groupStats(p, g);
  return (
    <span className="mini">
      <Bar pct={gs.pct} label={`${g.title} progress`} done={gs.pct >= 100} />
      <small className="muted">{gs.topicsDone}/{gs.topics} topics done · {gs.mocksTaken}/{gs.mocks} mocks taken</small>
    </span>
  );
}

function CompanyMini({ c, p }) {
  const cs = companyStats(p, c);
  return <small className="muted company-mini">{cs.mocksTaken}/{cs.mocks} mocks taken · {cs.solved} questions solved</small>;
}

function CompanyProgress({ c, p }) {
  const cs = companyStats(p, c);
  const items = [
    cs.asked ? ['Previously asked', cs.asked, `/placements/asked/${c.id}`] : null,
    cs.practice ? ['Practice set', cs.practice, `/placements/practice/${c.id}`] : null,
  ].filter(Boolean);
  return (
    <div className="panel stat-panel company-progress">
      <div><b>{cs.mocksTaken}/{cs.mocks}</b><small className="muted">mock tests taken{cs.attempts > cs.mocksTaken ? ` (${cs.attempts} attempts)` : ''}</small></div>
      <div><b>{cs.solved}</b><small className="muted">questions solved{cs.inMocks ? ` (${cs.inMocks} in mocks)` : ''}</small></div>
      {items.map(([label, t, href]) => (
        <Link key={label} to={href} className="stat-link">
          <b>{Math.min(t.answered, t.target)}/{t.target}</b>
          <small className="muted">{label}{t.done ? ' ✓' : ''}</small>
          <Bar pct={t.pct} label={`${label} progress`} done={t.done} />
        </Link>
      ))}
    </div>
  );
}

/** Slim "your progress" strip: nothing until the student starts, then one scrollable row of chips. */
function ProgressSummary({ data, p }) {
  let groups = [...data.sections, ...(data.languages ?? [])].map((g) => [g, groupStats(p, g)]).filter(([, s]) => s.answered || s.mocksTaken);
  const companies = data.companies.map((c) => [c, companyStats(p, c)]).filter(([, s]) => s.solved || s.mocksTaken);
  const empty = !groups.length && !companies.length;
  // Nothing started yet: show the four main sections at 0% as a placeholder.
  if (empty) groups = data.sections.map((g) => [g, groupStats(p, g)]);
  return (
    <div className={`mini-progress ${empty ? 'is-empty' : ''}`} title={empty ? 'Start practising and your progress shows here. Saved in this browser.' : undefined}>
      <span className="mini-progress-label">Your progress</span>
      <div className="mini-progress-chips">
        {companies.map(([c, s]) => (
          <Link key={c.id} to={`/placements/companies/${c.id}`} className="mp-chip">
            <b>{c.name}</b> {s.mocksTaken}/{s.mocks} mocks
            <Bar pct={Math.round((s.mocksTaken / s.mocks) * 100)} label={`${c.name} mocks`} done={s.mocksTaken === s.mocks} />
          </Link>
        ))}
        {groups.map(([g, s]) => (
          <Link key={g.id} to={`/placements/${g.id}`} className="mp-chip">
            <b>{g.short ?? g.title}</b> {s.pct}%
            <Bar pct={s.pct} label={`${g.title} progress`} done={s.pct >= 100} />
          </Link>
        ))}
      </div>
      {empty ? null : <button className="link-btn muted small" onClick={() => { if (confirm('Clear all your saved progress on this device?')) resetAll(); }}>Reset</button>}
    </div>
  );
}

/** /placements */
export function PrepHub() {
  useTitle('Placement preparation');
  const { data, error } = useJson('index.json');
  const p = useProgress();
  return (
    <>
      <PageHero eyebrow="Placements and Interviews" title="Placement preparation, free" sub="Aptitude, reasoning, verbal and technical practice with worked answers, timed mock tests, and company-wise prep for TCS, Infosys, Wipro, Accenture and more." art="/img/interview2.png" />
      <section className="section">
        <div className="wrap">
          {error ? <Failed /> : !data ? <Loading /> : (
            <>
              <ProgressSummary data={data} p={p} />
              <Reveal as="h2" className="section-title">Company-wise preparation</Reveal>
              <p className="muted narrow-left">Mock tests built on each company's reported test pattern, with tips and coding practice. Patterns change between drives, so always check your invitation.</p>
              <div className="course-grid company-grid">
                {data.companies.map((c) => (
                  <Link key={c.id} to={`/placements/companies/${c.id}`} className="course-tile">
                    <CompanyLogo c={c} />
                    <span className="grow">
                      <b>{c.name}</b>
                      <CompanyMini c={c} p={p} />
                    </span>
                    <span className="row-go" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
              <Reveal as="h2" className="section-title spaced">Practise by section</Reveal>
              <div className="prep-grid">
                {data.sections.map((s, i) => (
                  <Reveal key={s.id} delay={i * 60}>
                    <Link to={`/placements/${s.id}`} className="card pad prep-card">
                      <span className="feature-ico" aria-hidden="true">{ICON[s.id]}</span>
                      <h3>{s.title}</h3>
                      <p className="muted">{s.blurb}</p>
                      <GroupMini g={s} p={p} />
                      <span className="card-cta">{s.topics.reduce((a, t) => a + t.count, 0)} questions · {s.mocks.length} mock tests <span aria-hidden="true">→</span></span>
                    </Link>
                  </Reveal>
                ))}
              </div>

              {data.languages?.length > 0 && <>
              <Reveal as="h2" className="section-title spaced">Programming and AI</Reveal>
              <div className="course-grid big">
                {data.languages.map((l) => (
                  <Link key={l.id} to={`/placements/${l.id}`} className="course-tile">
                    <span className="course-ico" aria-hidden="true">{ICON[l.id]}</span>
                    <span>
                      <b>{l.title}</b>
                      <small className="muted">{l.topics.reduce((a, t) => a + t.count, 0)} questions · {groupStats(p, l).mocksTaken}/{l.mocks.length} mocks taken</small>
                      <Bar pct={groupStats(p, l).pct} label={`${l.title} progress`} done={groupStats(p, l).pct >= 100} />
                    </span>
                    <span className="row-go" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
              </>}

              <p className="muted small spaced-top">All questions on this site are written for OU All In One. Code-output answers are checked by running the code.</p>
            </>
          )}

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

/** /placements/:group  (aptitude, reasoning, verbal, technical, c, cpp, java, python, ai, genai) */
export function PrepGroup() {
  const { group } = useParams();
  const { data, error } = useJson('index.json');
  const p = useProgress();
  const g = data ? findGroup(data, group) : null;
  useTitle(g?.title ?? 'Placement preparation');
  if (error) return <Failed />;
  if (!data) return <Loading />;
  if (!g) return <Empty title="Section not found" action={<Link className="btn btn-small" to="/placements">All sections</Link>} />;
  const total = g.topics.reduce((a, t) => a + t.count, 0);
  const gs = groupStats(p, g);
  return (
    <>
      <PageHero eyebrow={<Link to="/placements">← Placements</Link>} title={g.title} sub={`${g.blurb} ${total} practice questions and ${g.mocks.length} timed mock tests.`} />
      <section className="section tight progress-strip">
        <div className="wrap">
          <div className="panel stat-panel">
            <div><b>{gs.topicsDone}/{gs.topics}</b><small className="muted">topics done</small></div>
            <div><b>{gs.pct}%</b><small className="muted">of questions answered</small></div>
            <div><b>{gs.mocksTaken}/{gs.mocks}</b><small className="muted">mock tests taken</small></div>
            <Bar pct={gs.pct} label={`${g.title} progress`} done={gs.pct >= 100} />
            <p className="muted small">{gs.answered} of {gs.target} questions answered. A topic gets a ✓ once you answer {Math.round(TARGET * 100)}% of it. Progress is saved in this browser.</p>
          </div>
        </div>
      </section>
      <section className="section tight">
        <div className="wrap prep-two">
          <div>
            <h2 className="section-title">Practice by topic</h2>
            <div className="rows">
              {g.topics.map((t, i) => {
                const td = topicDone(p, `${g.id}/${t.id}`, t.count);
                return (
                <Link key={t.id} to={`/placements/${g.id}/${t.id}`} className={`row ${td.done ? 'is-done' : ''}`} style={{ '--i': i }}>
                  <span className="tile tile-init" aria-hidden="true">{TOPIC_BADGE[t.id] ?? (t.title.replace(/[^A-Za-z ]/g, '').split(' ').filter((w) => !/^(and|of|the)$/i.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'Q')}</span>
                  <span className="row-body">
                    <span className="row-title">{t.title}{td.done ? <span className="done-tick" aria-label="done"> ✓</span> : null}</span>
                    <span className="muted small">{td.answered}/{t.count} answered{g.mocks.some((m) => m.topic === t.id) ? ' · has a mock test' : ''}</span>
                    <Bar pct={td.pct} label={`${t.title} progress`} done={td.done} />
                  </span>
                  <span className="row-go" aria-hidden="true">→</span>
                </Link>
                );
              })}
            </div>
          </div>
          <aside>
            <h2 className="section-title">{g.title} mock tests</h2>
            <p className="muted small">Each covers all topics in this section.{g.mocks.some((m) => m.topic) ? ' Topic mock tests are inside each topic.' : ''}</p>
            <div className="rows">{g.mocks.filter((m) => !m.topic).map((m) => <MockCard key={m.id} m={m} />)}</div>
          </aside>
        </div>
      </section>
    </>
  );
}

function CodeBlock({ code, lang }) {
  return (
    <pre className="code" data-lang={lang === 'pseudo' ? 'Pseudocode' : lang?.toUpperCase()}>
      <code>{code}</code>
    </pre>
  );
}

function QuestionBody({ q, n }) {
  return (
    <>
      {q.passage ? (
        <details className="passage">
          <summary>Passage: {q.passage.title}</summary>
          <p>{q.passage.text}</p>
        </details>
      ) : null}
      <p className="q-text">
        {n ? <span className="q-num">{n}.</span> : null}
        {q.q}
      </p>
      {q.code ? <CodeBlock code={q.code} lang={q.lang} /> : null}
    </>
  );
}

/** One practice question: pick an option, see the answer and explanation. `saved` is the earlier pick. */
function PracticeQuestion({ q, n, saved, onPick, reveal }) {
  const picked = saved ?? null;
  const show = picked !== null || reveal;
  return (
    <div className={`q-card ${q.code ? 'has-code' : ''} ${picked !== null ? (picked === q.a ? 'is-right' : 'is-wrong') : ''}`}>
      <QuestionBody q={q} n={n} />
      <div className="opts">
        {q.options.map((o, i) => {
          const state = show ? (i === q.a ? 'correct' : i === picked ? 'wrong' : 'dim') : '';
          return (
            <button key={i} className={`opt ${state}`} disabled={show} onClick={() => onPick(i)}>
              <span className="opt-key">{'ABCD'[i]}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {show && q.ex ? <p className="explain"><b>{picked === null ? 'Answer' : picked === q.a ? 'Correct.' : 'Not quite.'}</b> {q.ex}</p> : null}
    </div>
  );
}

/** /placements/:group/:topic */
export function PrepTopic() {
  const { group, topic } = useParams();
  const idx = useJson('index.json');
  const { data, error } = useJson(`t/${group}/${topic}.json`);
  const p = useProgress();
  const topicKey = `${group}/${topic}`;
  const picks = p.t[topicKey] ?? {};
  const [reveal, setReveal] = useState(false);
  const [shown, setShown] = useState(40);
  useTitle(data ? `${data.title} questions` : 'Practice');
  const g = idx.data ? findGroup(idx.data, group) : null;
  const company = group === 'asked' || group === 'practice' ? idx.data?.companies.find((c) => c.id === topic) : null;
  if (error) return <Failed />;
  if (!data) return <Loading />;
  const back = company ? [`/placements/companies/${company.id}`, company.name] : [`/placements/${group}`, g?.title ?? 'Back'];
  const answeredQs = data.questions.filter((q) => picks[q.id] !== undefined);
  const right = answeredQs.filter((q) => picks[q.id] === q.a).length;
  const td = topicDone(p, topicKey, data.questions.length);
  const firstOpen = data.questions.findIndex((q) => picks[q.id] === undefined);
  return (
    <>
      <PageHero eyebrow={<Link to={back[0]}>← {back[1]}</Link>} title={`${data.title} questions`} sub={`${data.desc} ${data.questions.length} questions with answers and explanations.`} />
      <section className="section tight">
        <div className="wrap narrow">
          <div className="practice-head">
            <div className="practice-stats">
              <span><b>{answeredQs.length}</b>/{td.target} answered{td.done ? ' · done ✓' : ''}</span>
              <span className="muted">{right} correct{answeredQs.length ? ` (${Math.round((right / answeredQs.length) * 100)}%)` : ''}</span>
            </div>
            <Bar pct={td.pct} label="Topic progress" done={td.done} />
            <p className="muted small">{td.done ? `Done: you have answered over ${Math.round(TARGET * 100)}% of this topic.` : `Answer ${td.goal} (${Math.round(TARGET * 100)}%) to get the ✓ for this topic.`} Saved in this browser.</p>
            <div className="toolbar-actions wrap-row">
              {firstOpen > 0 ? <button className="btn btn-small" onClick={() => { setShown(Math.max(shown, firstOpen + 10)); setTimeout(() => document.getElementById(`q-${firstOpen + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }}>Continue from Q{firstOpen + 1}</button> : null}
              <button className="btn btn-ghost btn-small" onClick={() => setReveal((v) => !v)}>{reveal ? 'Hide answers' : 'Show all answers'}</button>
              {answeredQs.length ? <button className="btn btn-ghost btn-small" onClick={() => { if (confirm('Clear your answers for this topic?')) { resetTopic(topicKey); setReveal(false); setShown(40); } }}>Reset</button> : null}
            </div>
          </div>
          <div className="q-list">
            {data.questions.slice(0, shown).map((q, i) => (
              <div key={q.id} id={`q-${i + 1}`}>
                <PracticeQuestion q={q} n={i + 1} reveal={reveal} saved={picks[q.id]} onPick={(pick) => answer(topicKey, q.id, pick)} />
              </div>
            ))}
          </div>
          {shown < data.questions.length ? (
            <div className="center spaced-top-block">
              <button className="btn btn-ghost" onClick={() => setShown((n) => n + 40)}>Show more ({data.questions.length - shown} left)</button>
            </div>
          ) : null}
          {company ? (
            <div className="cta-inline">
              <b>Now try a full {company.name} mock test</b>
              <div className="rows">{company.mocks.map((m) => <MockCard key={m.id} m={m} />)}</div>
            </div>
          ) : null}
          {g && g.mocks.some((m) => m.topic === topic) ? (
            <div className="cta-inline">
              <b>Ready for a timed {data.title} test?</b>
              <div className="rows">{g.mocks.filter((m) => m.topic === topic).map((m) => <MockCard key={m.id} m={m} />)}</div>
            </div>
          ) : g ? (
            <div className="cta-inline">
              <b>Ready for a timed test?</b>
              <p className="muted small">Mock tests for {g.title} cover all its topics.</p>
              <Link to={`/placements/${g.id}`} className="btn btn-small">See {g.title} mock tests →</Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

/** /placements/companies */
export function PrepCompanies() {
  useTitle('Company-wise placement preparation');
  const { data, error } = useJson('index.json');
  const p = useProgress();
  return (
    <>
      <PageHero eyebrow={<Link to="/placements">← Placements</Link>} title="Company-wise preparation" sub="Test patterns, tips, coding practice and three mock tests for each company that hires OU students in large numbers." />
      <section className="section tight">
        <div className="wrap">
          {error ? <Failed /> : !data ? <Loading /> : (
            <div className="course-grid company-grid">
              {data.companies.map((c) => (
                <Link key={c.id} to={`/placements/companies/${c.id}`} className="course-tile">
                  <CompanyLogo c={c} />
                  <span className="grow">
                    <b>{c.name}</b>
                    <small className="muted">{c.full}</small>
                    <CompanyMini c={c} p={p} />
                  </span>
                  <span className="row-go" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/** /placements/companies/:id */
export function PrepCompany() {
  const { id } = useParams();
  const { data, error } = useJson('index.json');
  const p = useProgress();
  const c = data?.companies.find((x) => x.id === id);
  useTitle(c ? `${c.name} preparation and mock tests` : 'Company preparation');
  if (error) return <Failed />;
  if (!data) return <Loading />;
  if (!c) return <Empty title="Company not found" action={<Link className="btn btn-small" to="/placements/companies">All companies</Link>} />;
  const totalQ = c.pattern.reduce((a, p) => a + p.questions, 0);
  const totalM = c.pattern.reduce((a, p) => a + p.minutes, 0);
  return (
    <>
      <PageHero eyebrow={<Link to="/placements/companies">← Companies</Link>} title={`${c.name} preparation`} sub={c.about}>
        <div className="hero-logo"><CompanyLogo c={c} size={64} /></div>
      </PageHero>
      <section className="section tight progress-strip">
        <div className="wrap"><CompanyProgress c={c} p={p} /></div>
      </section>
      <section className="section tight">
        <div className="wrap prep-two">
          <div>
            <h2 className="section-title">Test pattern</h2>
            <div className="table-wrap">
              <table className="pattern">
                <thead>
                  <tr><th>Section</th><th>Questions</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {c.pattern.map((p) => (
                    <tr key={p.title}><td>{p.title}</td><td>{p.questions}</td><td>{p.minutes} min</td></tr>
                  ))}
                  <tr className="total"><td>Total</td><td>{totalQ}</td><td>{totalM} min</td></tr>
                </tbody>
              </table>
            </div>
            <p className="muted small">Reported pattern from recent drives. Companies change it between drives, so always follow your official invitation.</p>
            {c.extra ? <p className="note">{c.extra}</p> : null}

            {c.asked ? (
              <Link to={`/placements/asked/${c.id}`} className="mock-card asked-card">
                <span className="mock-num">★</span>
                <div>
                  <b>Previously asked {c.name} questions</b>
                  <small className="muted">{c.asked} memory-based problems reported by candidates, with worked solutions</small>
                </div>
                <span className="row-go" aria-hidden="true">→</span>
              </Link>
            ) : null}
            {c.practice ? (
              <Link to={`/placements/practice/${c.id}`} className="mock-card">
                <span className="mock-num">✎</span>
                <div>
                  <b>{c.name} practice set</b>
                  <small className="muted">{c.practice} practice questions tagged for {c.name} preparation</small>
                </div>
                <span className="row-go" aria-hidden="true">→</span>
              </Link>
            ) : null}

            <h2 className="section-title spaced">Tips</h2>
            <ul className="tips">{c.tips.map((t) => <li key={t}>{t}</li>)}</ul>

            {c.essay ? (
              <>
                <h2 className="section-title spaced">Essay practice topics</h2>
                <ul className="tips">{c.essay.map((t) => <li key={t}>{t}</li>)}</ul>
              </>
            ) : null}

            <h2 className="section-title spaced">Coding practice</h2>
            <div className="rows">
              {c.coding.map((k) => {
                const p = data.coding[k];
                return (
                  <details key={k} className="coding">
                    <summary><b>{p.title}</b></summary>
                    <p>{p.statement}</p>
                    <pre className="code"><code>{p.sample}</code></pre>
                    <p className="muted small"><b>Hint:</b> {p.hint}</p>
                  </details>
                );
              })}
            </div>

            <h2 className="section-title spaced">Practise the sections</h2>
            <div className="chips wrap-chips">
              {[['aptitude', 'Aptitude'], ['reasoning', 'Reasoning'], ['verbal', 'Verbal'], ['technical', 'Technical (mixed)'], ['c', 'C'], ['java', 'Java'], ['python', 'Python']].map(([gid, label]) => (
                <Link key={gid} to={`/placements/${gid}`} className="chip">{label}</Link>
              ))}
            </div>
          </div>
          <aside>
            <h2 className="section-title">{c.name} mock tests</h2>
            <div className="rows">{c.mocks.map((m) => <MockCard key={m.id} m={m} />)}</div>
            <a className="btn btn-ghost btn-small spaced-top" href={c.careers} target="_blank" rel="noreferrer">Official careers page ↗</a>
            <p className="muted small spaced-top">{c.name} name and logo are trademarks of their owner, shown only to identify the company. OU All In One is not affiliated with {c.name}.</p>
          </aside>
        </div>
      </section>
    </>
  );
}

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** /placements/mock/:id  intro → test → result */
export function PrepMock() {
  const { id } = useParams();
  const { data, error } = useJson(`m/${id}.json`);
  const [phase, setPhase] = useState('intro');
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [cur, setCur] = useState(0);
  const [left, setLeft] = useState(0);
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [asking, setAsking] = useState(false); // in-page submit confirmation (window.confirm is blocked in many in-app browsers)
  const startedAt = useRef(0);
  const progress = useProgress();
  useTitle(data ? data.title : 'Mock test');

  const flat = useMemo(() => (data ? data.sections.flatMap((s, si) => s.questions.map((q) => ({ ...q, section: si }))) : []), [data]);

  useEffect(() => {
    if (phase !== 'test') return undefined;
    const t = setInterval(() => setLeft((x) => (x <= 1 ? 0 : x - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (phase === 'test' && left === 0) finish();
  }, [left, phase]);
  useEffect(() => {
    if (phase !== 'test') return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [phase]);

  useEffect(() => {
    if (!asking) return undefined;
    const esc = (e) => { if (e.key === 'Escape') setAsking(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [asking]);

  function start() {
    setAnswers({});
    setMarked({});
    setCur(0);
    setAsking(false);
    setLeft(data.minutes * 60);
    startedAt.current = Date.now();
    setPhase('test');
    window.scrollTo({ top: 0 });
  }
  function finish() {
    const score = flat.filter((q) => answers[q.id] === q.a).length;
    recordMock(id, score, flat.length, Object.keys(answers));
    setAsking(false);
    setPhase('result');
    window.scrollTo({ top: 0 });
  }

  if (error) return <Failed />;
  if (!data) return <Loading />;

  if (phase === 'intro') {
    const st = mockStats(progress, id);
    return (
      <>
        <PageHero eyebrow={<Link to="/placements">← Placements</Link>} title={data.title} sub={`${flat.length} questions · ${data.minutes} minutes · ${data.sections.length} section${data.sections.length > 1 ? 's' : ''}`} />
        <section className="section tight">
          <div className="wrap narrow">
            <div className="panel">
              <h2>Before you start</h2>
              <div className="table-wrap">
                <table className="pattern">
                  <thead><tr><th>Section</th><th>Questions</th><th>Suggested time</th></tr></thead>
                  <tbody>{data.sections.map((s) => <tr key={s.title}><td>{s.title}</td><td>{s.questions.length}</td><td>{s.minutes} min</td></tr>)}</tbody>
                </table>
              </div>
              <ul className="tips">
                <li>The timer runs for the whole test ({data.minutes} minutes) and submits automatically at zero.</li>
                <li>You can move between questions and sections, and mark questions to come back to.</li>
                <li>There is no negative marking. You'll see every answer with an explanation at the end.</li>
              </ul>
              {st.taken ? <p className="muted">Taken {st.taken} time{st.taken > 1 ? 's' : ''} · best {st.best.s}/{st.best.n} · last {st.last.s}/{st.last.n}</p> : null}
              <button className="btn btn-glow" onClick={start}>Start test</button>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (phase === 'result') {
    const score = flat.filter((q) => answers[q.id] === q.a).length;
    const attempted = flat.filter((q) => answers[q.id] !== undefined).length;
    const secs = Math.round((Date.now() - startedAt.current) / 1000);
    const pct = Math.round((score / flat.length) * 100);
    return (
      <>
        <PageHero eyebrow={<Link to="/placements">← Placements</Link>} title="Your result" sub={data.title} />
        <section className="section tight">
          <div className="wrap narrow">
            <div className="panel result">
              <div className={`big-number ${pct >= 60 ? 'good' : pct < 35 ? 'bad' : ''}`}>{score} / {flat.length}</div>
              <p className="muted center">{pct}% · attempted {attempted} · time {fmtTime(Math.min(secs, data.minutes * 60))}</p>
              <div className="table-wrap">
                <table className="pattern">
                  <thead><tr><th>Section</th><th>Correct</th><th>Accuracy</th></tr></thead>
                  <tbody>
                    {data.sections.map((s, si) => {
                      const qs = flat.filter((q) => q.section === si);
                      const ok = qs.filter((q) => answers[q.id] === q.a).length;
                      const tried = qs.filter((q) => answers[q.id] !== undefined).length;
                      return <tr key={s.title}><td>{s.title}</td><td>{ok} / {qs.length}</td><td>{tried ? Math.round((ok / tried) * 100) : 0}%</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div className="toolbar-actions center">
                <button className="btn" onClick={start}>Retake</button>
                <Link className="btn btn-ghost" to="/placements">More tests</Link>
              </div>
            </div>
            <div className="practice-bar">
              <b>Review answers</b>
              <label className="check"><input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} /> Only wrong or skipped</label>
            </div>
            <div className="q-list">
              {flat.map((q, i) => {
                if (onlyWrong && answers[q.id] === q.a) return null;
                const mine = answers[q.id];
                return (
                  <div key={q.id} className={`q-card ${q.code ? 'has-code' : ''}`}>
                    <QuestionBody q={q} n={i + 1} />
                    <div className="opts">
                      {q.options.map((o, oi) => (
                        <div key={oi} className={`opt ${oi === q.a ? 'correct' : oi === mine ? 'wrong' : 'dim'}`}>
                          <span className="opt-key">{'ABCD'[oi]}</span>
                          <span>{o}{oi === mine ? ' (your answer)' : ''}</span>
                        </div>
                      ))}
                    </div>
                    {mine === undefined ? <p className="muted small">Skipped</p> : null}
                    {q.ex ? <p className="explain">{q.ex}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </>
    );
  }

  const q = flat[cur];
  const sec = data.sections[q.section];
  const firstOf = (si) => flat.findIndex((x) => x.section === si);
  const answered = Object.keys(answers).length;
  return (
    <section className="mock">
        {asking ? createPortal(
          <div className="confirm-overlay" role="presentation" onClick={() => setAsking(false)}>
            <div className="confirm-box" role="dialog" aria-modal="true" aria-labelledby="submit-title" onClick={(e) => e.stopPropagation()}>
              <h2 id="submit-title">Submit the test?</h2>
              <p className="muted">You have answered {answered} of {flat.length}{flat.length - answered ? `; ${flat.length - answered} left unanswered` : ''}{Object.values(marked).filter(Boolean).length ? `, ${Object.values(marked).filter(Boolean).length} marked for review` : ''}.</p>
              <div className="toolbar-actions">
                <button className="btn btn-glow" onClick={finish} autoFocus>Submit test</button>
                <button className="btn btn-ghost" onClick={() => setAsking(false)}>Keep going</button>
              </div>
            </div>
          </div>,
          document.body,
        ) : null}
      <div className="mock-bar">
        <div className="wrap mock-bar-row">
          <b className="mock-title">{data.title}</b>
          <span className={`timer ${left < 60 ? 'urgent' : ''}`} aria-live="off">⏱ {fmtTime(left)}</span>
          <button className="btn btn-small" onClick={() => setAsking(true)}>Submit</button>
        </div>
        {data.sections.length > 1 ? (
          <div className="wrap chips">
            {data.sections.map((s, si) => (
              <button key={s.title} className={`chip ${si === q.section ? 'on' : ''}`} onClick={() => setCur(firstOf(si))}>{s.title}</button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="wrap mock-body">
        <div className="mock-main">
          <p className="muted small">{sec.title} · Question {cur + 1} of {flat.length}</p>
          <div className={`q-card ${q.code ? 'has-code' : ''}`}>
            <QuestionBody q={q} />
            <div className="opts">
              {q.options.map((o, i) => (
                <button key={i} className={`opt ${answers[q.id] === i ? 'picked' : ''}`} onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}>
                  <span className="opt-key">{'ABCD'[i]}</span>
                  <span>{o}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mock-actions">
            <button className="btn btn-ghost btn-small" disabled={cur === 0} onClick={() => setCur((c) => c - 1)}>← Previous</button>
            <button className={`btn btn-ghost btn-small ${marked[q.id] ? 'is-marked' : ''}`} onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))}>{marked[q.id] ? '★ Marked' : '☆ Mark for review'}</button>
            {answers[q.id] !== undefined ? <button className="btn btn-ghost btn-small" onClick={() => setAnswers((a) => { const n = { ...a }; delete n[q.id]; return n; })}>Clear</button> : null}
            {cur < flat.length - 1 ? <button className="btn btn-small" onClick={() => setCur((c) => c + 1)}>Next →</button> : <button className="btn btn-small" onClick={() => { if (confirm(`Submit now? You have answered ${answered} of ${flat.length}.`)) finish(); }}>Submit</button>}
          </div>
        </div>
        <aside className="mock-nav">
          <p className="muted small">{answered} answered · {Object.values(marked).filter(Boolean).length} marked</p>
          <div className="nav-grid">
            {flat.map((x, i) => (
              <button key={x.id} className={`nav-cell ${i === cur ? 'cur' : ''} ${answers[x.id] !== undefined ? 'done' : ''} ${marked[x.id] ? 'mark' : ''}`} onClick={() => setCur(i)} aria-label={`Question ${i + 1}`}>{i + 1}</button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
