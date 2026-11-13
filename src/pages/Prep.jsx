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
              <Reveal as="h2" className="section-title spaced">Coding practice</Reveal>
              <Link to="/placements/coding" className="mock-card coding-hub">
                <span className="mock-num" aria-hidden="true">{'</>'}</span>
                <div>
                  <b>Previously asked coding questions</b>
                  <small className="muted">{data.coding.length} coding questions reported from TCS, Infosys, Wipro, Accenture and more, with the companies that asked them</small>
                </div>
                <span className="row-go" aria-hidden="true">→</span>
              </Link>
              <Reveal as="h2" className="section-title spaced">Interview preparation</Reveal>
              <Link to="/placements/interviews" className="mock-card coding-hub">
                <span className="mock-num" aria-hidden="true">?</span>
                <div>
                  <b>Interview experiences and questions</b>
                  <small className="muted">What {data.interviews.companies.length} companies asked in recent interviews, and {data.interviews.subjects.reduce((a, s) => a + s.count, 0)} answered questions on HR, OOP, Java, Python, DBMS, SQL, OS, networks and Gen AI</small>
                </div>
                <span className="row-go" aria-hidden="true">→</span>
              </Link>
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

/**
 * Explanation in three parts when the text has them ("How to solve:", "Step:" lines, "Shortcut:"),
 * otherwise the plain text. The correct answer is always stated first.
 */
function Explanation({ ex, lead, answer }) {
  const lines = String(ex).split('\n').filter(Boolean);
  const method = lines.find((l) => l.startsWith('How to solve:'))?.slice(13).trim();
  const key = lines.find((l) => l.startsWith('Key idea:'))?.slice(9).trim();
  const steps = lines.filter((l) => l.startsWith('Step:')).map((l) => l.slice(5).trim());
  const others = lines.filter((l) => l.startsWith('Not:')).map((l) => l.slice(4).trim());
  const shortcut = lines.find((l) => l.startsWith('Shortcut:'))?.slice(9).trim();
  const remember = lines.find((l) => l.startsWith('Remember:'))?.slice(9).trim();
  const plain = lines.filter((l) => !/^(How to solve|Key idea|Step|Not|Shortcut|Remember):/.test(l));
  return (
    <div className="explain">
      <p className="explain-head">{lead && lead !== 'Answer' ? <b>{lead} </b> : null}<span>Answer: <b>{answer}</b></span></p>
      {method ? <p className="explain-method"><b>How to solve:</b> {method}</p> : null}
      {key ? <p className="explain-method"><b>Key idea:</b> {key}</p> : null}
      {steps.length ? <ol className="explain-steps">{steps.map((st, i) => <li key={i}>{st}</li>)}</ol> : null}
      {plain.length ? plain.map((l, i) => <p key={i}>{l}</p>) : null}
      {others.length ? (
        <div className="explain-others"><b>Why not the others:</b><ul>{others.map((o, i) => <li key={i}>{o}</li>)}</ul></div>
      ) : null}
      {shortcut ? <p className="explain-shortcut"><b>⚡ Shortcut:</b> {shortcut}</p> : null}
      {remember ? <p className="explain-shortcut"><b>💡 Remember:</b> {remember}</p> : null}
    </div>
  );
}

function CodeBlock({ code, lang }) {
  return (
    <pre className="code" data-lang={lang === 'pseudo' ? 'Pseudocode' : lang?.toUpperCase()}>
      <code>{code}</code>
    </pre>
  );
}

const COMPANY_NAME = { 'tcs-nqt': 'TCS NQT', infosys: 'Infosys', infytq: 'InfyTQ', 'wipro-elite-nth': 'Wipro', 'cognizant-genc': 'Cognizant', accenture: 'Accenture', capgemini: 'Capgemini', hcltech: 'HCLTech', deloitte: 'Deloitte', 'tech-mahindra': 'Tech Mahindra', ltimindtree: 'LTIMindtree' };

function QuestionBody({ q, n }) {
  return (
    <>
      {q.asked?.length ? (
        <span className="asked-flag" title="Reported by candidates from recent tests (memory-based), rewritten with our own worked solution">★ Asked in {q.asked.map((c) => COMPANY_NAME[c] ?? c).join(', ')} · memory-based</span>
      ) : null}
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
      {show && q.ex ? <Explanation ex={q.ex} lead={picked === null ? 'Answer' : picked === q.a ? 'Correct.' : 'Not quite.'} answer={q.options[q.a]} /> : null}
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

// ---------- coding practice ----------
const LEVELS = ['Easy', 'Medium', 'Hard'];
const LEVEL_PILL = { Easy: 'pill pill-accent', Medium: 'pill pill-warn', Hard: 'pill pill-hard' };
const companyName = (companies, id) => companies.find((x) => x.id === id)?.name ?? id;

/** Shown wherever coding problems are listed, until the in-browser editor and judge are built. */
function CodingSoon() {
  return (
    <p className="soon-note">
      <b>Live code editor with test cases: coming soon.</b> Until then, solve it in your own editor (or on paper) and check your answer against the sample.
    </p>
  );
}

/** "TCS NQT · Sep 2023" style badges for the companies that reportedly asked a problem. */
function AskedBadges({ asked, companies, only, link }) {
  const list = only ? asked.filter((a) => a.company === only) : asked;
  if (!list.length) return <span className="pill">Practice</span>;
  return (
    <span className="asked-badges">
      {list.map((a) => {
        const label = `${companyName(companies, a.company)}${a.when ? ` · ${a.when}` : ''}`;
        return link ? (
          <Link key={a.company} to={`/placements/companies/${a.company}`} className="asked-badge">{label}</Link>
        ) : (
          <span key={a.company} className="asked-badge">{label}</span>
        );
      })}
    </span>
  );
}

function CodingRow({ prob, companies, only }) {
  return (
    <Link to={`/placements/coding/${prob.id}`} className="mock-card coding-row">
      <div>
        <b>{prob.title}</b>
        <span className="coding-meta">
          <span className={LEVEL_PILL[prob.level]}>{prob.level}</span>
          <span className="muted small">{prob.topic}</span>
        </span>
        <AskedBadges asked={prob.asked} companies={companies} only={only} />
      </div>
      <span className="row-go" aria-hidden="true">→</span>
    </Link>
  );
}

/** /placements/coding  (all problems, filter by company, topic and difficulty) */
export function PrepCoding() {
  useTitle('Coding practice: previously asked company coding questions');
  const { data, error } = useJson('index.json');
  const start = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('company') : null;
  const [company, setCompany] = useState(start || 'all');
  const [topic, setTopic] = useState('all');
  const [level, setLevel] = useState('all');
  const list = useMemo(() => {
    if (!data) return [];
    return data.coding.filter(
      (p) => (company === 'all' || p.asked.some((a) => a.company === company)) && (topic === 'all' || p.topic === topic) && (level === 'all' || p.level === level),
    );
  }, [data, company, topic, level]);
  const companies = data ? data.companies.filter((c) => data.coding.some((p) => p.asked.some((a) => a.company === c.id))) : [];
  const topics = data ? [...new Set(data.coding.map((p) => p.topic))] : [];
  const chips = (value, set, items) => (
    <div className="chips">
      {[['all', 'All'], ...items].map(([v, label]) => (
        <button key={v} type="button" className={`chip ${value === v ? 'on' : ''}`} aria-pressed={value === v} onClick={() => set(v)}>{label}</button>
      ))}
    </div>
  );
  return (
    <>
      <PageHero eyebrow={<Link to="/placements">← Placements</Link>} title="Coding practice" sub="Coding problems candidates reported from TCS, Infosys, Wipro, Accenture, Cognizant and more, written up with our own examples and hints. Free." />
      <section className="section tight">
        <div className="wrap">
          {error ? <Failed /> : !data ? <Loading /> : (
            <>
              <CodingSoon />
              <div className="coding-filters">
                <span className="muted small">Company</span>
                {chips(company, setCompany, companies.map((c) => [c.id, c.name]))}
                <span className="muted small">Topic</span>
                {chips(topic, setTopic, topics.map((t) => [t, t]))}
                <span className="muted small">Difficulty</span>
                {chips(level, setLevel, LEVELS.map((l) => [l, l]))}
              </div>
              <p className="muted small" aria-live="polite">{list.length} of {data.coding.length} problems</p>
              <div className="rows coding-list">
                {list.map((p) => <CodingRow key={p.id} prob={p} companies={data.companies} />)}
              </div>
              {!list.length ? <p className="muted">No problems match these filters.</p> : null}
              <p className="muted small spaced-top">Company tags are memory-based reports from candidates and public prep sites; companies do not publish their questions, and the exact problems change between drives.</p>
            </>
          )}
        </div>
      </section>
    </>
  );
}

/** /placements/coding/:id */
export function PrepCodingProblem() {
  const { id } = useParams();
  const idx = useJson('index.json');
  const { data, error } = useJson(`coding/${id}.json`);
  const [hint, setHint] = useState(false);
  useTitle(data ? `${data.title}: coding question` : 'Coding question');
  if (error) return <Empty title="Problem not found" action={<Link className="btn btn-small" to="/placements/coding">All coding practice</Link>} />;
  if (!data || !idx.data) return <Loading />;
  const companies = idx.data.companies;
  return (
    <>
      <PageHero eyebrow={<Link to="/placements/coding">← Coding practice</Link>} title={data.title}>
        <span className="coding-meta hero-meta">
          <span className={LEVEL_PILL[data.level]}>{data.level}</span>
          <span>{data.topic}</span>
        </span>
      </PageHero>
      <section className="section tight">
        <div className="wrap coding-page">
          <div className="coding-asked">
            <span className="muted small">{data.asked.length ? 'Reported in' : 'Practice problem'}</span>
            {data.asked.length ? <AskedBadges asked={data.asked} companies={companies} link /> : null}
          </div>
          <p className="coding-statement">{data.statement}</p>
          <h3>Input</h3>
          <p>{data.input}</p>
          <h3>Output</h3>
          <p>{data.output}</p>
          <h3>Constraints</h3>
          <p className="muted">{data.constraints}</p>
          {data.samples.map((s, i) => (
            <div key={i} className="sample">
              <h3>Example {i + 1}</h3>
              <div className="sample-io">
                <div><span className="muted small">Input</span><pre className="code"><code>{s.in}</code></pre></div>
                <div><span className="muted small">Output</span><pre className="code"><code>{s.out}</code></pre></div>
              </div>
            </div>
          ))}
          <CodingSoon />
          {hint ? <p className="note"><b>Hint:</b> {data.hint}</p> : <button type="button" className="btn btn-ghost btn-small" onClick={() => setHint(true)}>Show hint</button>}
          <p className="muted small spaced-top">Written for OU All In One. Company tags are memory-based candidate reports, not official questions.</p>
        </div>
      </section>
    </>
  );
}

// ---------- interviews ----------
const SUBJECT_ICON = { hr: '🤝', oop: '🧱', c: '🅲', cpp: '➕', java: '☕', python: '🐍', dsa: '🌳', dbms: '🗄️', sql: '🔎', os: '⚙️', cn: '🌐', se: '🔁', ai: '✨' };
const qSlug = (qid) => qid.split('/')[1];
const interviewFor = (cid) => (cid === 'infytq' ? 'infosys' : cid);

/** A reported question with a link to our answer (or coding problem) when we have one. */
function ReportedQ({ item }) {
  const to = item.code ? `/placements/coding/${item.code}` : item.qid ? `/placements/interview-questions/${item.subject}#${qSlug(item.qid)}` : null;
  return (
    <li className="reported-q">
      <span>{item.text}</span>
      {to ? <Link to={to} className="answer-link">{item.code ? 'Coding problem' : 'Answer'} →</Link> : null}
    </li>
  );
}

/** /placements/interviews */
export function PrepInterviews() {
  useTitle('Interview experiences and interview questions');
  const { data, error } = useJson('index.json');
  return (
    <>
      <PageHero eyebrow={<Link to="/placements">← Placements</Link>} title="Interview preparation" sub="What TCS, Infosys, Wipro, Accenture and others asked candidates in recent interviews, and answers to the questions they ask most, by subject. Free." />
      <section className="section tight">
        <div className="wrap">
          {error ? <Failed /> : !data ? <Loading /> : (
            <>
              <Reveal as="h2" className="section-title">Company interview experiences</Reveal>
              <p className="muted narrow-left">Rounds, the technical and HR questions candidates reported, and tips, summarised from recent interview write-ups.</p>
              <div className="course-grid company-grid">
                {data.interviews.companies.map((iv) => {
                  const c = data.companies.find((x) => x.id === iv.company);
                  return (
                    <Link key={iv.company} to={`/placements/interviews/${iv.company}`} className="course-tile">
                      <CompanyLogo c={c} />
                      <span className="grow">
                        <b>{c.name}</b>
                        <small className="muted">{iv.technical + iv.hr} reported questions</small>
                      </span>
                      <span className="row-go" aria-hidden="true">→</span>
                    </Link>
                  );
                })}
              </div>
              <Reveal as="h2" className="section-title spaced">Interview questions by subject</Reveal>
              <p className="muted narrow-left">Short, clear answers to the questions interviewers ask most. Questions companies reportedly asked are tagged with those companies.</p>
              <div className="prep-grid">
                {data.interviews.subjects.map((s, i) => (
                  <Reveal key={s.id} delay={i * 40}>
                    <Link to={`/placements/interview-questions/${s.id}`} className="card pad prep-card">
                      <span className="feature-ico" aria-hidden="true">{SUBJECT_ICON[s.id] ?? '💬'}</span>
                      <h3>{s.title}</h3>
                      <p className="muted">{s.blurb}</p>
                      <span className="card-cta">{s.count} questions{s.asked ? ` · ${s.asked} asked by companies` : ''} <span aria-hidden="true">→</span></span>
                    </Link>
                  </Reveal>
                ))}
              </div>
              <p className="muted small spaced-top">Interview questions vary by campus, role and interviewer. Company questions are summarised from candidates' public write-ups; the source links are on each company page.</p>
            </>
          )}
        </div>
      </section>
    </>
  );
}

/** /placements/interviews/:company */
export function PrepInterviewCompany() {
  const { company } = useParams();
  const idx = useJson('index.json');
  const { data, error } = useJson(`interviews/company/${company}.json`);
  const c = idx.data?.companies.find((x) => x.id === company);
  useTitle(c ? `${c.name} interview experience and questions` : 'Interview experience');
  if (error) return <Empty title="Interview experience not found" action={<Link className="btn btn-small" to="/placements/interviews">All interviews</Link>} />;
  if (!data || !idx.data) return <Loading />;
  return (
    <>
      <PageHero eyebrow={<Link to="/placements/interviews">← Interview preparation</Link>} title={`${c.name} interview experience`} sub={data.summary}>
        <div className="hero-logo"><CompanyLogo c={c} size={64} /></div>
      </PageHero>
      <section className="section tight">
        <div className="wrap prep-two">
          <div>
            <h2 className="section-title">Selection process</h2>
            <ol className="rounds">
              {data.rounds.map((r) => (
                <li key={r.title}><b>{r.title}</b><span className="muted">{r.what}</span></li>
              ))}
            </ol>

            <h2 className="section-title spaced">What they focus on</h2>
            <div className="chips wrap-chips">{data.focus.map((f) => <span key={f} className="chip static">{f}</span>)}</div>

            <h2 className="section-title spaced">Technical questions candidates reported</h2>
            <ul className="reported">{data.technical.map((t) => <ReportedQ key={t.text} item={t} />)}</ul>

            <h2 className="section-title spaced">HR and managerial questions</h2>
            <ul className="reported">{data.hr.map((t) => <ReportedQ key={t.text} item={t} />)}</ul>

            <h2 className="section-title spaced">Tips</h2>
            <ul className="tips">{data.tips.map((t) => <li key={t}>{t}</li>)}</ul>

            <h2 className="section-title spaced">Reported experiences</h2>
            <div className="rows">
              {data.reports.map((r) => (
                <div key={r.label} className="card pad report">
                  <b>{r.label}</b>
                  <p className="muted">{r.text}</p>
                </div>
              ))}
            </div>
            <p className="muted small spaced-top">Summarised in our own words from these public candidate write-ups. Questions change between drives and interviewers.</p>
            <ul className="sources">
              {data.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer nofollow">{s.title} ↗</a></li>)}
            </ul>
          </div>
          <aside>
            <h2 className="section-title">Prepare for {c.name}</h2>
            <div className="rows">
              <Link to={`/placements/companies/${company}`} className="mock-card">
                <span className="mock-num">✓</span>
                <div><b>Test pattern and mock tests</b><small className="muted">{c.mocks.length} free timed mocks</small></div>
                <span className="row-go" aria-hidden="true">→</span>
              </Link>
              <Link to={`/placements/coding?company=${company}`} className="mock-card">
                <span className="mock-num">{'</>'}</span>
                <div><b>Coding questions</b><small className="muted">Previously asked {c.name} coding problems</small></div>
                <span className="row-go" aria-hidden="true">→</span>
              </Link>
              <Link to="/placements/interview-questions/hr" className="mock-card">
                <span className="mock-num">🤝</span>
                <div><b>HR answers</b><small className="muted">How to answer the common HR questions</small></div>
                <span className="row-go" aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

/** /placements/interview-questions/:subject  (answers open on tap; #slug opens and scrolls to one) */
export function PrepInterviewSubject() {
  const { subject } = useParams();
  const idx = useJson('index.json');
  const { data, error } = useJson(`interviews/subject/${subject}.json`);
  const [onlyAsked, setOnlyAsked] = useState(false);
  const [open, setOpen] = useState(() => new Set(typeof window !== 'undefined' && window.location.hash ? [window.location.hash.slice(1)] : []));
  useTitle(data ? `${data.title} interview questions and answers` : 'Interview questions');
  useEffect(() => {
    if (!data || typeof window === 'undefined' || !window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 50);
  }, [data]);
  if (error) return <Empty title="Subject not found" action={<Link className="btn btn-small" to="/placements/interviews">All interview questions</Link>} />;
  if (!data || !idx.data) return <Loading />;
  const companies = idx.data.companies;
  const askedCount = data.qs.filter((q) => q.asked.length).length;
  const list = onlyAsked ? data.qs.filter((q) => q.asked.length) : data.qs;
  const toggle = (slug) => setOpen((s) => { const n = new Set(s); n.has(slug) ? n.delete(slug) : n.add(slug); return n; });
  const others = idx.data.interviews.subjects.filter((s) => s.id !== subject);
  return (
    <>
      <PageHero eyebrow={<Link to="/placements/interviews">← Interview preparation</Link>} title={`${data.title} interview questions`} sub={data.blurb} />
      <section className="section tight">
        <div className="wrap">
          {askedCount ? (
            <div className="chips">
              <button type="button" className={`chip ${!onlyAsked ? 'on' : ''}`} aria-pressed={!onlyAsked} onClick={() => setOnlyAsked(false)}>All {data.qs.length}</button>
              <button type="button" className={`chip ${onlyAsked ? 'on' : ''}`} aria-pressed={onlyAsked} onClick={() => setOnlyAsked(true)}>Asked by companies {askedCount}</button>
            </div>
          ) : null}
          <div className="rows qa-list">
            {list.map((q, i) => {
              const slug = qSlug(q.id);
              const isOpen = open.has(slug);
              return (
                <div key={q.id} id={slug} className={`qa ${isOpen ? 'open' : ''}`}>
                  <button type="button" className="qa-q" aria-expanded={isOpen} onClick={() => toggle(slug)}>
                    <span className="qa-n">{i + 1}</span>
                    <span className="grow">{q.q}</span>
                    <span className="qa-plus" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                  </button>
                  {q.asked.length ? <div className="qa-asked"><AskedBadges asked={q.asked.map((company) => ({ company }))} companies={companies} /></div> : null}
                  {isOpen ? <p className="qa-a">{q.a}</p> : null}
                </div>
              );
            })}
          </div>
          <h2 className="section-title spaced">More subjects</h2>
          <div className="chips wrap-chips">
            {others.map((s) => <Link key={s.id} to={`/placements/interview-questions/${s.id}`} className="chip">{s.title}</Link>)}
          </div>
          <p className="muted small spaced-top">Answers written for OU All In One. Company tags show where candidates reported being asked this question in interviews.</p>
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
  const who = interviewFor(c.id) === c.id ? c.name : 'Infosys';
  const iv = data.interviews?.companies.find((x) => x.company === interviewFor(c.id));
  return (
    <>
      <PageHero eyebrow={<Link to="/placements/companies">← Companies</Link>} title={`${c.name} preparation`} sub={c.about}>
        <div className="hero-logo"><CompanyLogo c={c} size={64} /></div>
      </PageHero>
      <section className="section tight company-mocks">
        <div className="wrap">
          <h2 className="section-title">{c.name} mock tests</h2>
          <p className="muted small">Free, timed, and built on the reported {c.name} pattern: {totalQ} questions in {totalM} minutes.</p>
          <div className="mock-grid">{c.mocks.map((m) => <MockCard key={m.id} m={m} />)}</div>
        </div>
      </section>
      <section className="section tight asked-strip">
        <div className="wrap">
          <h2 className="section-title">Previously asked in {who}</h2>
          <p className="muted small">What candidates reported from recent {who} tests and interviews (memory-based), with our own worked answers.</p>
          <div className="asked-tiles">
            {c.asked ? (
              <Link to={`/placements/asked/${c.id}`} className="asked-tile">
                <span className="asked-ico" aria-hidden="true">★</span>
                <b>{c.asked} test questions</b>
                <small className="muted">Aptitude and technical problems with worked solutions</small>
                <span className="asked-go">Practise →</span>
              </Link>
            ) : null}
            <a href="#coding" className="asked-tile">
              <span className="asked-ico" aria-hidden="true">{'</>'}</span>
              <b>{c.coding.length} coding problems</b>
              <small className="muted">Reported from {who} coding rounds</small>
              <span className="asked-go">See below ↓</span>
            </a>
            {iv ? (
              <Link to={`/placements/interviews/${interviewFor(c.id)}`} className="asked-tile">
                <span className="asked-ico" aria-hidden="true">?</span>
                <b>{iv.technical + iv.hr} interview questions</b>
                <small className="muted">Rounds, technical and HR questions, tips</small>
                <span className="asked-go">Read →</span>
              </Link>
            ) : null}
            {!c.asked ? (
              <div className="asked-tile is-empty">
                <span className="asked-ico" aria-hidden="true">★</span>
                <b>Test questions</b>
                <small className="muted">Not enough reliable reports from {who} tests yet, so we have not listed any. The mock tests above follow the real pattern.</small>
              </div>
            ) : null}
          </div>
          <nav className="jump" aria-label="On this page">
            <span className="muted small">On this page:</span>
            <a href="#pattern" className="chip">Test pattern</a>
            <a href="#coding" className="chip">Coding questions</a>
            <a href="#tips" className="chip">Tips</a>
            {c.essay ? <a href="#essay" className="chip">Essay topics</a> : null}
            <a href="#sections" className="chip">Practise sections</a>
          </nav>
        </div>
      </section>
      <section className="section tight progress-strip">
        <div className="wrap"><CompanyProgress c={c} p={p} /></div>
      </section>
      <section className="section tight">
        <div className="wrap prep-two">
          <div>
            <h2 className="section-title" id="pattern">Test pattern</h2>
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


            <h2 className="section-title spaced" id="tips">Tips</h2>
            <ul className="tips">{c.tips.map((t) => <li key={t}>{t}</li>)}</ul>

            {c.essay ? (
              <>
                <h2 className="section-title spaced" id="essay">Essay practice topics</h2>
                <ul className="tips">{c.essay.map((t) => <li key={t}>{t}</li>)}</ul>
              </>
            ) : null}

            <h2 className="section-title spaced" id="coding">Previously asked coding questions</h2>
            <p className="muted small">Problems candidates reported from {c.id === 'infytq' ? 'Infosys' : c.name} coding rounds (memory-based), rewritten with our own examples.</p>
            <CodingSoon />
            <div className="rows">
              {c.coding.map((k) => {
                const prob = data.coding.find((x) => x.id === k);
                return prob ? <CodingRow key={k} prob={prob} companies={data.companies} /> : null;
              })}
            </div>
            <Link to={`/placements/coding?company=${c.id === 'infytq' ? 'infosys' : c.id}`} className="btn btn-ghost btn-small spaced-top">All coding practice →</Link>

            <h2 className="section-title spaced" id="sections">Practise the sections</h2>
            <div className="chips wrap-chips">
              {[['aptitude', 'Aptitude'], ['reasoning', 'Reasoning'], ['verbal', 'Verbal'], ['technical', 'Technical (mixed)'], ['c', 'C'], ['java', 'Java'], ['python', 'Python']].map(([gid, label]) => (
                <Link key={gid} to={`/placements/${gid}`} className="chip">{label}</Link>
              ))}
            </div>
          </div>
          <aside>
            <h2 className="section-title">More for {c.name}</h2>
            <div className="rows">
              <Link to={`/placements/coding?company=${interviewFor(c.id)}`} className="mock-card">
                <span className="mock-num" aria-hidden="true">{'</>'}</span>
                <div><b>Coding questions</b><small className="muted">{c.coding.length} previously asked problems</small></div>
                <span className="row-go" aria-hidden="true">→</span>
              </Link>
            </div>
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
                    {q.ex ? <Explanation ex={q.ex} answer={q.options[q.a]} /> : null}
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
