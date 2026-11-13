/**
 * Builds the placement prep data from content/placements into public/data/placements:
 *   index.json            sections and companies with their topics and mock tests
 *   t/<group>/<topic>.json practice questions for one topic
 *   m/<mockId>.json       a timed mock test (sections with questions)
 * Everything is seeded, so the output is the same on every build.
 *
 *   node scripts/build-placements.mjs
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { APTITUDE_TOPICS } from '../content/placements/aptitude.mjs';
import { ASKED } from '../content/placements/asked.mjs';
import { COMPANIES } from '../content/placements/companies.mjs';
import { PROBLEMS } from '../content/placements/coding.mjs';
import { fullExplanation } from '../content/placements/explain.mjs';
import { makeTechExplainer } from '../content/placements/tech-explain/index.mjs';
import { INTERVIEWS } from '../content/placements/interviews.mjs';
import { SUBJECTS } from '../content/placements/interview-subjects.mjs';
import { hash, many, mcq, rng, shuffle, templateOf } from '../content/placements/lib.mjs';
import { REASONING_TOPICS } from '../content/placements/reasoning.mjs';
import { AI, DBMS, GENAI, MSOFFICE, NETSEC, pseudocode } from '../content/placements/tech-ai-misc.mjs';
import { C, CPP } from '../content/placements/tech-c-cpp.mjs';
import { JAVA, PYTHON } from '../content/placements/tech-java-python.mjs';
import { AI2, MSOFFICE2, NETSEC2 } from '../content/placements/tech-more.mjs';
import { OS } from '../content/placements/tech-os.mjs';
import { SQL } from '../content/placements/tech-sql.mjs';
import { VERBAL_TOPICS, verbalQuestions } from '../content/placements/verbal.mjs';

const OUT = 'public/data/placements';
rmSync(OUT, { recursive: true, force: true });
const write = (rel, data) => {
  if (rel.startsWith('t/') && Array.isArray(data.questions)) {
    // Drop repeats: same id, or the same question text (with its code/passage) worded with different options.
    // A wording used 4+ times is a shared instruction ("Choose the correctly spelt word"), not a repeat, so keep those.
    const seen = new Set();
    const text = (q) => `${q.q}\u0000${q.code ?? ''}\u0000${q.passage ?? ''}`.toLowerCase().replace(/\s+/g, ' ');
    const uses = new Map();
    for (const q of data.questions) uses.set(text(q), (uses.get(text(q)) ?? 0) + 1);
    const key = (q) => (uses.get(text(q)) <= 3 ? text(q) : `${text(q)}\u0000${[...q.options].map(String).sort().join('|')}`);
    data.questions = data.questions.filter((q) => (seen.has(q.id) || seen.has(key(q)) ? false : (seen.add(q.id), seen.add(key(q)))));
    if (typeof data.count === 'number') data.count = data.questions.length;
  }
  const f = join(OUT, rel);
  mkdirSync(join(f, '..'), { recursive: true });
  writeFileSync(f, JSON.stringify(data));
};

const PRACTICE = 50; // questions per generated practice topic (every topic should have at least 50)
const PER_TEMPLATE = 4; // most questions of one template per topic (numbers differ), so lists don't feel repetitive
/** n questions from a generator, using the smallest per-template cap that still reaches n. */
const fill = (gen, n, seed, cap = PER_TEMPLATE) => {
  let best = [];
  for (const c of [cap, 5, 6]) {
    if (c < cap) continue;
    best = many(gen, n, seed, c);
    if (best.length >= n) break;
  }
  return best;
};
// Topics where every question needs fresh working even if the wording is alike: no template cap.
const NO_CAP = new Set(['seating-arrangement', 'direction-sense']); // every question is its own puzzle; the others now have many question types
// Stable question ids (from the content), so a student's saved progress survives rebuilds.
const qkey = (q) => `q${hash(`${q.q}|${q.code ?? ''}|${q.options.join('|')}`).toString(36)}`;
const tag = (q, src) => ({ ...q, id: qkey(q), src });

/** Hand-written rows → question objects (options shuffled with a seed). */
function fromRows(rows, lang, seed) {
  const r = rng(seed);
  return rows.map(([q, code, correct, w1, w2, w3, ex, topic]) => ({
    ...mcq(r, { q, code: code ?? undefined, lang: code ? lang : undefined, correct, wrong: [w1, w2, w3], ex }),
    topic,
  }));
}

const slug = (t) => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- banks ----------
const LANGS = [
  { id: 'c', title: 'C Programming', short: 'C', rows: C, lang: 'c', blurb: 'Pointers, arrays, strings, storage classes and output questions.' },
  { id: 'cpp', title: 'C++', short: 'C++', rows: CPP, lang: 'cpp', blurb: 'OOP, virtual functions, STL, templates and output questions.' },
  { id: 'java', title: 'Java', short: 'Java', rows: JAVA, lang: 'java', blurb: 'OOP, strings, collections, exceptions and output questions.' },
  { id: 'python', title: 'Python', short: 'Python', rows: PYTHON, lang: 'python', blurb: 'Data types, comprehensions, functions, OOP and output questions.' },
  { id: 'ai', title: 'Artificial Intelligence and ML', short: 'AI / ML', rows: [...AI, ...AI2], lang: null, blurb: 'Learning types, algorithms, evaluation metrics and deep learning basics.' },
  { id: 'genai', title: 'Generative AI', short: 'Gen AI', rows: GENAI, lang: null, blurb: 'LLMs, transformers, prompting, RAG, fine-tuning and risks.' },
];
const langBank = Object.fromEntries(LANGS.map((l) => [l.id, fromRows(l.rows, l.lang, `lang-${l.id}`)]));
const extraBank = {
  dbms: [...fromRows(DBMS, null, 'dbms'), ...fromRows(SQL, 'sql', 'sql')],
  netsec: fromRows([...NETSEC, ...NETSEC2], null, 'netsec'),
  msoffice: fromRows([...MSOFFICE, ...MSOFFICE2], null, 'msoffice'),
  os: fromRows(OS, null, 'os'),
};
const verbal = verbalQuestions('verbal-bank');
const verbalAll = Object.entries(verbal).flatMap(([t, qs]) => qs.map((q) => ({ ...q, topic: t })));

// Generated pools: a fresh supply per seed so mocks don't repeat practice questions.
const genFrom = (topics, n, seed) => {
  const r = rng(seed);
  const out = [];
  for (let i = 0; out.length < n; i++) {
    const [id, , gen] = topics[i % topics.length];
    out.push(...many(gen, 1, `${seed}-${id}-${i}-${Math.floor(r() * 1e9)}`).map((q) => ({ ...q, topic: id })));
  }
  return shuffle(r, out).slice(0, n);
};
const ADV = [...APTITUDE_TOPICS.filter(([id]) => ['permutations-combinations', 'probability', 'data-interpretation', 'compound-interest', 'mixtures-alligation', 'time-and-work'].includes(id)), ...REASONING_TOPICS.filter(([id]) => ['seating-arrangement', 'inequalities', 'syllogisms', 'direction-sense'].includes(id))];
const PUZZLES = REASONING_TOPICS.filter(([id]) => ['seating-arrangement', 'blood-relations', 'direction-sense', 'ranking-order'].includes(id));
const sampleDisjoint = (bank, n, seed, used) => {
  const pool = shuffle(rng(seed), bank).filter((q) => !used.has(q.q + (q.code ?? '')));
  const pick = pool.slice(0, n);
  pick.forEach((q) => used.add(q.q + (q.code ?? '')));
  if (pick.length < n) pick.push(...shuffle(rng(`${seed}-refill`), bank).slice(0, n - pick.length));
  return pick;
};
const CS = [...langBank.c, ...langBank.cpp, ...langBank.java, ...langBank.python, ...extraBank.dbms, ...extraBank.os, ...extraBank.netsec];

function pool(name, n, seed, used) {
  switch (name) {
    case 'quant': return genFrom(APTITUDE_TOPICS, n, seed);
    case 'reasoning': return genFrom(REASONING_TOPICS, n, seed);
    case 'advanced': return genFrom(ADV, n, seed);
    case 'puzzles': return genFrom(PUZZLES, n, seed);
    case 'pseudocode': return many(pseudocode, n, seed).map((q) => ({ ...q, topic: 'pseudocode' }));
    case 'verbal': return sampleDisjoint(verbalAll, n, seed, used.verbal);
    case 'python': return sampleDisjoint(langBank.python, n, seed, used.python);
    case 'dbms': return sampleDisjoint(extraBank.dbms, n, seed, used.dbms);
    case 'os': return sampleDisjoint(extraBank.os, n, seed, used.os);
    case 'netsec': return sampleDisjoint(extraBank.netsec, n, seed, used.netsec);
    case 'msoffice': return sampleDisjoint(extraBank.msoffice, n, seed, used.msoffice);
    case 'cs': return sampleDisjoint(CS, n, seed, used.cs);
    default:
      if (langBank[name]) return sampleDisjoint(langBank[name], n, seed, used[name]);
      throw new Error(`Unknown pool ${name}`);
  }
}
const freshUsed = () => new Proxy({}, { get: (t, k) => (t[k] ??= new Set()) });

function writeMock(id, title, sections, used = freshUsed()) {
  const secs = sections.map(([stitle, poolName, n, minutes], i) => ({
    title: stitle,
    minutes,
    questions: pool(poolName, n, `${id}-${i}`, used).map((q) => tag(q, poolName)),
  }));
  const seen = new Set();
  for (const sec of secs) for (const q of sec.questions) { while (seen.has(q.id)) q.id += 'x'; seen.add(q.id); }
  const total = secs.reduce((s, x) => s + x.questions.length, 0);
  const minutes = secs.reduce((s, x) => s + x.minutes, 0);
  write(`m/${id}.json`, { id, title, minutes, sections: secs });
  return { id, title, questions: total, minutes, sections: secs.map((s) => ({ title: s.title, questions: s.questions.length, minutes: s.minutes })) };
}

// ---------- sections ----------
// Coding practice: the list (no statements) goes in index.json; each problem has its own file.
// `solution` and `sources` stay out of the published data.
const coding = PROBLEMS.map(({ id, title, topic, level, asked }) => ({ id, title, topic, level, asked: asked.map(({ company, when }) => (when ? { company, when } : { company })) }));
const index = { updated: new Date().toISOString().slice(0, 10), sections: [], languages: [], companies: [], coding };
const CODING_FOR = { infytq: 'infosys' }; // InfyTQ is Infosys's certification: show Infosys's coding questions
const codingFor = (cid) => coding
  .filter((p) => p.asked.some((a) => a.company === (CODING_FOR[cid] ?? cid)))
  .sort((a, b) => {
    const when = (p) => (p.asked.find((x) => x.company === (CODING_FOR[cid] ?? cid))?.when ? 1 : 0);
    return when(b) - when(a) || b.asked.length - a.asked.length || ['Easy', 'Medium', 'Hard'].indexOf(a.level) - ['Easy', 'Medium', 'Hard'].indexOf(b.level);
  })
  .map((p) => p.id);
// Interviews: company experiences link each reported question to a subject answer or a coding problem.
// Links are checked here, and the "asked in" tags on subject answers are derived from them.
const SUBJECT_Q = new Map(SUBJECTS.flatMap((s) => s.qs.map((q) => [q.id, { ...q, subject: s.id }])));
const askedBy = new Map();
const resolve = (company, [text, link]) => {
  if (!link) return { text };
  if (link.startsWith('code:')) {
    const prob = PROBLEMS.find((p) => p.id === link.slice(5));
    if (!prob) throw new Error(`interviews: ${company} links to missing coding problem ${link}`);
    return { text, code: prob.id, title: prob.title };
  }
  const q = SUBJECT_Q.get(link);
  if (!q) throw new Error(`interviews: ${company} links to missing answer ${link}`);
  if (!askedBy.has(link)) askedBy.set(link, new Set());
  askedBy.get(link).add(company);
  return { text, subject: q.subject, qid: q.id, title: q.q };
};
const interviewCompanies = INTERVIEWS.map((iv) => ({ ...iv, technical: iv.technical.map((t) => resolve(iv.company, t)), hr: iv.hr.map((t) => resolve(iv.company, t)) }));
for (const iv of interviewCompanies) write(`interviews/company/${iv.company}.json`, { ...iv, rounds: iv.rounds.map(([title, what]) => ({ title, what })), reports: iv.reports.map(([label, text]) => ({ label, text })), sources: iv.sources.map(([title, url]) => ({ title, url })) });
for (const s of SUBJECTS) write(`interviews/subject/${s.id}.json`, { id: s.id, title: s.title, blurb: s.blurb, qs: s.qs.map((q) => ({ ...q, asked: [...(askedBy.get(q.id) ?? [])] })) });
index.interviews = {
  companies: interviewCompanies.map((iv) => ({ company: iv.company, technical: iv.technical.length, hr: iv.hr.length })),
  subjects: SUBJECTS.map((s) => ({ id: s.id, title: s.title, blurb: s.blurb, count: s.qs.length, asked: s.qs.filter((q) => askedBy.has(q.id)).length })),
};
for (const { solution, asked, ...p } of PROBLEMS) write(`coding/${p.id}.json`, { ...p, asked: asked.map(({ company, when }) => (when ? { company, when } : { company })) });
const V2 = []; // filled below if the owner's v2 bank is switched on

function topicSection(id, title, blurb, topics, makeQs, mockSpec) {
  const sec = { id, title, blurb, topics: [], mocks: [] };
  for (const [tid, ttitle, gen, desc] of topics) {
    const qs = makeQs(tid, gen).map((q) => tag(q, id));
    write(`t/${id}/${tid}.json`, { title: ttitle, desc, questions: qs });
    sec.topics.push({ id: tid, title: ttitle, desc, count: qs.length });
  }
  for (let m = 1; m <= 3; m++) sec.mocks.push(writeMock(`${id}-mock-${m}`, `${title} Mock Test ${m}`, mockSpec(m)));
  return sec;
}

index.sections.push(topicSection('aptitude', 'Quantitative Aptitude', 'Percentages, profit and loss, time and work, speed and distance, probability and more, with worked solutions.', APTITUDE_TOPICS, (tid, gen) => fill(gen, PRACTICE, `practice-apt-${tid}`, NO_CAP.has(tid) ? Infinity : PER_TEMPLATE), () => [['Quantitative Aptitude', 'quant', 25, 30]]));
index.sections.push(topicSection('reasoning', 'Logical Reasoning', 'Series, coding-decoding, blood relations, seating, syllogisms, directions, clocks and calendars.', REASONING_TOPICS, (tid, gen) => fill(gen, PRACTICE, `practice-rea-${tid}`, NO_CAP.has(tid) ? Infinity : PER_TEMPLATE), () => [['Logical Reasoning', 'reasoning', 25, 30]]));
{
  const used = freshUsed();
  const sec = { id: 'verbal', title: 'Verbal Ability', blurb: 'Synonyms, antonyms, grammar, error spotting, idioms, para jumbles and reading comprehension.', topics: [], mocks: [] };
  for (const [tid, ttitle, desc] of VERBAL_TOPICS) {
    const qs = verbal[tid].map((q) => tag(q, 'verbal'));
    write(`t/verbal/${tid}.json`, { title: ttitle, desc, questions: qs });
    sec.topics.push({ id: tid, title: ttitle, desc, count: qs.length });
  }
  for (let m = 1; m <= 3; m++) sec.mocks.push(writeMock(`verbal-mock-${m}`, `Verbal Ability Mock Test ${m}`, [['Verbal Ability', 'verbal', 25, 25]], used));
  index.sections.push(sec);
}
{
  // Technical MCQs: one practice list per subject (C, C++, Java, Python, AI, Gen AI, DBMS, OS, networking,
  // Office, pseudocode), 3 mixed mocks and one mock per main subject.
  const sec = { id: 'technical', title: 'Technical MCQs', blurb: 'C, C++, Java, Python, Generative AI, DBMS and Operating Systems as separate topics, plus AI/ML, networking, MS Office and pseudocode.', topics: [], mocks: [] };
  const order = (qs) => [...qs.filter((q) => q.topic !== 'Output'), ...qs.filter((q) => q.topic === 'Output')];
  const SUBJECTS = [
    ['c', 'C Programming', order(langBank.c), 'Pointers, arrays, strings, storage classes, plus output questions checked by running the code.'],
    ['cpp', 'C++', order(langBank.cpp), 'OOP, virtual functions, STL, templates and output questions.'],
    ['java', 'Java', order(langBank.java), 'OOP, strings, collections, exceptions, threads and output questions.'],
    ['python', 'Python', order(langBank.python), 'Data types, comprehensions, functions, OOP and output questions.'],
    ['genai', 'Generative AI', langBank.genai, 'LLMs, transformers, prompting, RAG, fine-tuning and risks.'],
    ['dbms', 'DBMS and SQL', extraBank.dbms, 'Keys, normalisation and transactions, plus SQL queries on sample tables: joins, subqueries, GROUP BY/HAVING, UNION and window functions.'],
    ['os', 'Operating Systems', extraBank.os, 'Processes, threads, scheduling, deadlocks, synchronisation and memory.'],
    ['ai', 'Artificial Intelligence and ML', langBank.ai, 'Learning types, algorithms, evaluation metrics and deep learning basics.'],
    ['networking-security-cloud', 'Networking, Security and Cloud', extraBank.netsec, 'OSI, TCP/IP, protocols, security threats and cloud models.'],
    ['ms-office', 'MS Office', extraBank.msoffice, 'Excel functions, Word and PowerPoint features (asked by Accenture).'],
    ['pseudocode', 'Pseudocode', fill(pseudocode, 50, 'practice-pseudo', 3), 'Trace loops and conditions (asked by Infosys, Capgemini and Accenture).'],
  ];
  for (const [tid, ttitle, bank, desc] of SUBJECTS) {
    const qs = bank.map((q) => tag(q, 'technical'));
    write(`t/technical/${tid}.json`, { title: ttitle, desc, questions: qs });
    sec.topics.push({ id: tid, title: ttitle, desc, count: qs.length });
  }
  const used = freshUsed();
  for (let m = 1; m <= 3; m++) {
    sec.mocks.push(writeMock(`technical-mock-${m}`, `Technical MCQs Mock Test ${m}`, [['C', 'c', 4, 4], ['C++', 'cpp', 4, 4], ['Java', 'java', 4, 4], ['Python', 'python', 4, 4], ['Generative AI', 'genai', 4, 4], ['DBMS and SQL', 'dbms', 4, 4], ['Operating Systems', 'os', 4, 4]], used));
  }
  for (const [pid, title] of [['c', 'C Programming'], ['cpp', 'C++'], ['java', 'Java'], ['python', 'Python'], ['genai', 'Generative AI'], ['dbms', 'DBMS and SQL'], ['os', 'Operating Systems'], ['ai', 'AI and ML']]) {
    sec.mocks.push({ ...writeMock(`${pid}-mock-1`, `${title} Mock Test`, [[title, pid, 15, 15]]), topic: pid }); // shown on that topic's page
  }
  index.sections.push(sec);
}

// Full working for the imported (v2) question patterns, computed from the numbers in the question.
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function v2Working(q) {
  const t = q.q;
  const n = (x) => Number(String(x).replace(/,/g, ''));
  let m;
  if ((m = t.match(/is (\d+) years old\. Her brother is (\d+) years younger\. What will her brother.s age be after (\d+) years/))) {
    const [a, d, y] = m.slice(1).map(n);
    return `Brother's age now = ${a} − ${d} = ${a - d}. After ${y} years: ${a - d} + ${y} = ${a - d + y}.`;
  }
  if ((m = t.match(/average of (\d+) numbers is (\d+)\. If a new number (\d+) is included/))) {
    const [c, avg, x] = m.slice(1).map(n);
    return `Old total = ${c} × ${avg} = ${c * avg}. New total = ${c * avg} + ${x} = ${c * avg + x}. New count = ${c} + 1 = ${c + 1}. New average = ${c * avg + x} ÷ ${c + 1} = ${(c * avg + x) / (c + 1)}.`;
  }
  if ((m = t.match(/remainder when (\d+) is divided by (\d+)/))) {
    const [x, d] = m.slice(1).map(n);
    return `${x} ÷ ${d}: ${d} × ${Math.floor(x / d)} = ${d * Math.floor(x / d)}, which is the largest multiple of ${d} not above ${x}. Remainder = ${x} − ${d * Math.floor(x / d)} = ${x % d}.`;
  }
  if ((m = t.match(/buys an item for ₹(\d+) and sells it for ₹(\d+)\. What is the profit/))) {
    const [c, sp] = m.slice(1).map(n);
    return `Profit = selling price − cost price = ${sp} − ${c} = ₹${sp - c}.`;
  }
  if ((m = t.match(/sum of ₹(\d+) is divided in the ratio (\d+):(\d+)\. What is the (first|second) share/))) {
    const [T, a, b] = m.slice(1, 4).map(n);
    const part = T / (a + b);
    const mine = m[4] === 'first' ? a : b;
    return `Total ratio parts = ${a} + ${b} = ${a + b}. One part = ${T} ÷ ${a + b} = ${part}. The ${m[4]} share has ${mine} parts: ${mine} × ${part} = ${mine * part}.`;
  }
  if ((m = t.match(/sum of the positions of ([A-Z]) and ([A-Z])/))) {
    const [x, y] = [ALPHA.indexOf(m[1]) + 1, ALPHA.indexOf(m[2]) + 1];
    return `${m[1]} is letter number ${x} and ${m[2]} is letter number ${y}. Sum = ${x} + ${y} = ${x + y}.`;
  }
  if ((m = t.match(/If today is (\w+), which weekday is (\d+) days later/))) {
    const d = WEEK.indexOf(m[1]);
    const k = n(m[2]);
    const seq = Array.from({ length: k % 7 }, (_, i) => WEEK[(d + i + 1) % 7]);
    return `Weekdays repeat every 7 days, so only the remainder matters: ${k} ÷ 7 leaves ${k % 7}. Count ${k % 7} day${k % 7 === 1 ? '' : 's'} on from ${m[1]}: ${seq.join(', ') || m[1]}. So it is ${WEEK[(d + k) % 7]}.`;
  }
  if ((m = t.match(/clock shows (\d+):00\. What will it show (\d+) hours later/))) {
    const [h, k] = m.slice(1).map(n);
    const r = ((h + k - 1) % 12) + 1;
    return `${h} + ${k} = ${h + k}.${h + k > 12 ? ` A 12-hour clock starts again after 12, so ${h + k} − 12 = ${r}.` : ''} It shows ${r}:00.`;
  }
  if ((m = t.match(/shifted forward by (\d+) places with wraparound\. What does ([A-Z]) become/))) {
    const k = n(m[1]);
    const p = ALPHA.indexOf(m[2]);
    return `Number the letters A = 0 … Z = 25: ${m[2]} = ${p}. Add the shift: ${p} + ${k} = ${p + k}.${p + k > 25 ? ` Past Z, so wrap around: ${p + k} − 26 = ${(p + k) % 26}.` : ''} Letter number ${(p + k) % 26} is ${ALPHA[(p + k) % 26]}.`;
  }
  if ((m = t.match(/arithmetic series: ([\d, ]+), \?/))) {
    const v = m[1].split(',').map(n);
    const d = v[1] - v[0];
    return `Differences between neighbouring terms: ${v.slice(1).map((x, i) => `${x} − ${v[i]} = ${x - v[i]}`).join(', ')}. The difference is always ${d}, so the next term is ${v[v.length - 1]} + ${d} = ${v[v.length - 1] + d}.`;
  }
  if ((m = t.match(/missing number: ([\d, ?]+)\./)) && /doubles/.test(q.ex)) {
    const v = m[1].split(',').map((x) => x.trim());
    const i = v.indexOf('?');
    const prev = n(v[i - 1]);
    return `Each term is twice the one before: ${v.slice(0, i).map(n).slice(1).map((x, j) => `${n(v[j])} × 2 = ${x}`).join(', ')}. So ? = ${prev} × 2 = ${prev * 2} (check: ${prev * 2} × 2 = ${prev * 4}).`;
  }
  if ((m = t.match(/If ([A-Z]+) = (\d+) \(adding letter positions[^)]*\), what is ([A-Z]+)/))) {
    const w = m[3].split('');
    const vals = w.map((c) => ALPHA.indexOf(c) + 1);
    return `The code is the sum of letter positions (check: ${m[1]} = ${m[1].split('').map((c) => ALPHA.indexOf(c) + 1).join(' + ')} = ${m[2]}). For ${m[3]}: ${w.map((c, i) => `${c} = ${vals[i]}`).join(', ')}; ${vals.join(' + ')} = ${vals.reduce((a, b) => a + b, 0)}.`;
  }
  if ((m = t.match(/square-number pattern: ([\d, ]+), \?/))) {
    const v = m[1].split(',').map(n);
    const roots = v.map((x) => Math.round(Math.sqrt(x)));
    const nx = roots[roots.length - 1] + 1;
    return `Each term is a perfect square: ${v.map((x, i) => `${x} = ${roots[i]}²`).join(', ')}. The next square is ${nx}² = ${nx * nx}.`;
  }
  if ((m = t.match(/Find the next number: ([\d, ]+), \?/)) && /increases by/.test(q.ex)) {
    const v = m[1].split(',').map(n);
    return `Differences: ${v.slice(1).map((x, i) => `${x} − ${v[i]} = ${x - v[i]}`).join(', ')}. Each term increases by ${v[1] - v[0]}, so the next is ${v[v.length - 1]} + ${v[1] - v[0]} = ${v[v.length - 1] + v[1] - v[0]}.`;
  }
  return null;
}

// ---------- owner's v2 bank (5000 rows; ~1,165 left after removing copies) ----------
// Quant/reasoning are one-step patterns with different numbers: at most V2_PER_TEMPLATE of each per
// topic, interleaved and added after our own questions. Set INCLUDE_V2 to false to remove it all.
const INCLUDE_V2 = true;
const V2_PER_TEMPLATE = 3;
const V2_FILE = 'content/placements/imported/v2.json';
const V2_NEW_TOPICS = {
  'reasoning/alphabet-positions': ['Alphabet Positions', 'Letter positions (A=1 … Z=26) used in coding and series questions.'],
  'reasoning/logical-arithmetic': ['Logical Arithmetic', 'Quick reasoning with numbers.'],
};
if (INCLUDE_V2 && existsSync(V2_FILE)) {
  const byTopic = new Map();
  for (const q of JSON.parse(readFileSync(V2_FILE, 'utf8')).questions) {
    const k = `${q.group}/${q.topic === 'alphabet-positions' ? 'alphabet-test' : q.topic}`;
    if (!byTopic.has(k)) byTopic.set(k, []);
    byTopic.get(k).push(q);
  }
  for (const [k, list] of byTopic) {
    const [gid, tid] = k.split('/');
    const g = index.sections.find((x) => x.id === gid);
    if (!g) continue;
    let t = g.topics.find((x) => x.id === tid);
    const file = join(OUT, 't', gid, `${tid}.json`);
    if (!t) {
      const [title, desc] = V2_NEW_TOPICS[k] ?? [tid, ''];
      t = { id: tid, title, desc, count: 0 };
      g.topics.push(t);
      write(`t/${gid}/${tid}.json`, { title, desc, questions: [] });
    }
    // Cap per template, then deal templates round-robin so the same pattern is never back to back.
    // A topic that would stay under 50 questions gets a higher cap.
    const existing = JSON.parse(readFileSync(file, 'utf8')).questions.length;
    const one = gid === 'technical' || gid === 'verbal';
    let dealt = [];
    for (const cap of one ? [1] : [V2_PER_TEMPLATE]) {
      const groups = new Map();
      for (const q of list) {
        const tk = one ? q.q : templateOf({ q: q.q.replace(/\b[A-Z]\b/g, 'L') });
        if (!groups.has(tk)) groups.set(tk, []);
        if (groups.get(tk).length < cap) groups.get(tk).push(q);
      }
      const lists = [...groups.values()];
      dealt = [];
      for (let i = 0; lists.some((l) => l[i]); i++) for (const l of lists) if (l[i]) dealt.push(l[i]);
      if (existing + dealt.length >= 50) break;
    }
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const have = new Set(data.questions.map((q) => q.id));
    // Some imported explanations stop one step short ("…divide by 18."); finish them with the answer.
    const finish = (q) => {
      const ans = String(q.options[q.a]);
      const n = ans.replace(/,/g, '').match(/\d+(\.\d+)?/g);
      const inEx = (q.ex.replace(/,/g, '').match(/\d+(\.\d+)?/g) ?? []);
      return n && n.length === 1 && !inEx.includes(n[0]) ? `${q.ex.trim().replace(/[.;]$/, '')}, which gives ${ans}.` : q.ex;
    };
    const add = dealt.map((q) => ({ ...tag({ q: q.q, options: q.options, a: q.a, ex: v2Working(q) ?? finish(q) }, 'v2'), v2: true })).filter((q) => (have.has(q.id) ? false : have.add(q.id)));
    data.questions.push(...add);
    V2.push(...add);
    writeFileSync(file, JSON.stringify(data));
    t.count = data.questions.length;
  }
}

// ---------- companies ----------
for (const c of COMPANIES) {
  const used = freshUsed();
  const mocks = [];
  for (let m = 1; m <= 3; m++) mocks.push(writeMock(`${c.id}-mock-${m}`, `${c.name} Mock Test ${m}`, c.sections, used));
  const asked = ASKED[c.id] ? fromRows(ASKED[c.id], null, `asked-${c.id}`).map((q) => tag(q, 'asked')) : [];
  if (asked.length) write(`t/asked/${c.id}.json`, { title: `${c.name} previously asked`, desc: `Problems candidates reported from recent ${c.name} tests, rewritten with worked solutions (memory-based).`, company: c.id, questions: asked });
  const logoId = c.id === 'infytq' ? 'infosys' : c.id;
  const logo = existsSync(`public/img/companies/${logoId}.svg`) ? `/img/companies/${logoId}.svg` : null;
  index.companies.push({
    logo,
    asked: asked.length,
    id: c.id, name: c.name, full: c.full, about: c.about, careers: c.careers, extra: c.extra ?? null, tips: c.tips, essay: c.essay ?? null,
    pattern: c.sections.map(([title, , questions, minutes]) => ({ title, questions, minutes })),
    coding: codingFor(c.id),
    mocks,
  });
}

// ---------- imported set (owner's starter bank) ----------
// The bank repeats ~29 question patterns thousands of times, so only a few examples of each
// pattern are used: 1 per template, only where a topic does not already have that template, and
// at most 1 per pattern in each Mock Test 4 (topped up with our own questions).
// Set INCLUDE_IMPORTED to false (or delete content/placements/imported/) to remove it all.
const INCLUDE_IMPORTED = true;
const IMPORTED_FILE = 'content/placements/imported/starter.json';
if (INCLUDE_IMPORTED && existsSync(IMPORTED_FILE)) {
  const imp = JSON.parse(readFileSync(IMPORTED_FILE, 'utf8')).questions;
  const pattern = (q) => q.q.replace(/"[^"]*"/g, '"S"').replace(/\d+(\.\d+)?/g, '#');
  const groups = [...index.sections];
  const clean = (q) => ({ q: q.q, options: q.options, a: q.a, ex: q.ex });
  const perPattern = new Map();
  for (const q of imp) {
    const t = groups.find((g) => g.id === q.group)?.topics.find((x) => x.id === q.topic);
    if (!t) continue; // sheet-only topics (one repeated pattern) are not used
    const k = `${q.group}/${q.topic}|${templateOf(q)}`;
    if (!perPattern.has(k)) perPattern.set(k, [q]);
  }
  for (const [k, list] of perPattern) {
    const [gid, tid] = k.split('|')[0].split('/');
    const g = groups.find((x) => x.id === gid);
    const t = g.topics.find((x) => x.id === tid);
    const file = join(OUT, 't', gid, `${tid}.json`);
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const have = new Set(data.questions.map((q) => q.id));
    const haveTemplates = new Set(data.questions.map(templateOf));
    data.questions.push(...list.filter((q) => !haveTemplates.has(templateOf(q))).map((q) => ({ ...tag(clean(q), 'imported'), imported: true })).filter((q) => (have.has(q.id) ? false : have.add(q.id))));
    writeFileSync(file, JSON.stringify(data));
    t.count = data.questions.length;
  }
  // Mock Test 4 from the bank's own mock configs: 1 question per pattern, topped up to 30 with our questions.
  const MOCKS_FILE = 'content/placements/imported/mocks.json';
  const NAME = { 'tcs-nqt': 'TCS', infosys: 'Infosys', 'wipro-elite-nth': 'Wipro', 'cognizant-genc': 'Cognizant', accenture: 'Accenture', capgemini: 'Capgemini', hcltech: 'HCLTech', deloitte: 'Deloitte', 'tech-mahindra': 'Tech Mahindra', ltimindtree: 'LTIMindtree' };
  if (existsSync(MOCKS_FILE)) {
    const byId = new Map(imp.map((q) => [q.id, q]));
    const SEC = { aptitude: 'Quantitative Aptitude', reasoning: 'Logical Reasoning', verbal: 'Verbal Ability' };
    const POOL = { 'Quantitative Aptitude': 'quant', 'Logical Reasoning': 'reasoning', 'Verbal Ability': 'verbal', 'Programming and Technical': 'cs' };
    const secOf = (q) => SEC[q.group] ?? 'Programming and Technical';
    const ORDER = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Programming and Technical'];
    const SUBJECT = { 'MOCK-QUANTITATIVE-APTITUDE': 'aptitude', 'MOCK-LOGICAL-REASONING': 'reasoning', 'MOCK-VERBAL-ABILITY': 'verbal', 'MOCK-PROGRAMMING-AND-TECHNICAL-MCQS': 'technical' };
    const addMock = (owner, id, title, cfg) => {
      const seenPat = new Set();
      const picked = cfg.ids.map((x) => byId.get(x)).filter((q) => q && !seenPat.has(pattern(q)) && seenPat.add(pattern(q)));
      const want = 30;
      const counts = Object.fromEntries(ORDER.map((n) => [n, cfg.ids.map((x) => byId.get(x)).filter((q) => q && secOf(q) === n).length]));
      const used = freshUsed();
      const sections = ORDER.filter((n) => counts[n]).map((name, i) => {
        const mine = picked.filter((q) => secOf(q) === name).map((q) => tag(clean(q), 'imported'));
        const target = Math.round((want * counts[name]) / cfg.ids.length);
        const extra = target > mine.length ? pool(POOL[name], target - mine.length, `${id}-top-${i}`, used).map((q) => tag(q, POOL[name])) : [];
        return { title: name, questions: [...mine, ...extra] };
      });
      const seenId = new Set();
      for (const sec of sections) for (const q of sec.questions) { while (seenId.has(q.id)) q.id += 'x'; seenId.add(q.id); }
      const total = sections.reduce((a, s) => a + s.questions.length, 0);
      for (const sec of sections) sec.minutes = Math.max(1, Math.round((cfg.minutes * sec.questions.length) / total));
      const drift = sections.reduce((a, s) => a + s.minutes, 0) - cfg.minutes;
      const big = sections.reduce((b, s) => (s.minutes > b.minutes ? s : b), sections[0]);
      big.minutes = Math.max(1, big.minutes - drift);
      write(`m/${id}.json`, { id, title, minutes: cfg.minutes, sections });
      owner.mocks.push({ id, title, questions: total, minutes: cfg.minutes, sections: sections.map((s) => ({ title: s.title, questions: s.questions.length, minutes: s.minutes })) });
    };
    // Company Mock Test 4 follows that company's own sections, counts and timings (same as mocks 1–3).
    // The bank's questions for the company fill matching sections first; our pools top up the rest.
    // Sections such as pseudocode, Python or MS Office only take questions from their own pool.
    const IMPORT_FOR = { quant: 'aptitude', reasoning: 'reasoning', verbal: 'verbal', cs: 'technical' };
    const addCompanyMock = (c, cfg) => {
      const def = COMPANIES.find((x) => x.id === c.id);
      const id = `${c.id}-mock-4`;
      const title = `${c.name} Mock Test 4`;
      const seenPat = new Set();
      const imported = cfg.ids.map((x) => byId.get(x)).filter((q) => q && !seenPat.has(pattern(q)) && seenPat.add(pattern(q)));
      const taken = new Set();
      const used = freshUsed();
      const sections = def.sections.map(([stitle, poolName, n, minutes], i) => {
        const grp = IMPORT_FOR[poolName];
        const mine = [];
        if (grp) for (const q of imported) {
          if (mine.length >= n) break;
          if (q.group === grp && !taken.has(q)) { taken.add(q); mine.push(tag(clean(q), 'imported')); }
        }
        const extra = mine.length < n ? pool(poolName, n - mine.length, `${id}-${i}`, used).map((q) => tag(q, poolName)) : [];
        return { title: stitle, minutes, questions: [...mine, ...extra] };
      });
      const seenId = new Set();
      for (const sec of sections) for (const q of sec.questions) { while (seenId.has(q.id)) q.id += 'x'; seenId.add(q.id); }
      const total = sections.reduce((a, s) => a + s.questions.length, 0);
      const minutes = sections.reduce((a, s) => a + s.minutes, 0);
      write(`m/${id}.json`, { id, title, minutes, sections });
      c.mocks.push({ id, title, questions: total, minutes, sections: sections.map((s) => ({ title: s.title, questions: s.questions.length, minutes: s.minutes })) });
    };
    for (const cfg of JSON.parse(readFileSync(MOCKS_FILE, 'utf8'))) {
      if (SUBJECT[cfg.id]) {
        const g = index.sections.find((x) => x.id === SUBJECT[cfg.id]);
        if (g && cfg.ids.length) {
          addMock(g, `${g.id}-mock-4`, `${g.title} Mock Test 4`, cfg);
          const m4 = g.mocks.pop(); const at = g.mocks.findIndex((m) => m.id === `${g.id}-mock-3`) + 1; g.mocks.splice(at, 0, m4);
        }
        continue;
      }
      for (const c of index.companies.filter((x) => NAME[x.id] === cfg.company)) if (cfg.ids.length) addCompanyMock(c, cfg);
    }
  }
}

// ---------- one mock test per topic ----------
// Every topic without its own mock gets one. Aptitude and reasoning topics with a generator get freshly
// generated questions (new numbers, so they are not the practice list again); other topics sample
// 15 questions from the topic's final practice list. Shown at the end of that topic's page.
const TOPIC_MOCK = { aptitude: [15, 20], reasoning: [15, 18], verbal: [15, 15], technical: [15, 15] }; // [questions, minutes]
const GENS = Object.fromEntries([...APTITUDE_TOPICS, ...REASONING_TOPICS].map(([id, , gen]) => [id, gen]));
for (const g of index.sections) {
  const [n, minutes] = TOPIC_MOCK[g.id] ?? [15, 15];
  for (const t of g.topics) {
    if (g.mocks.some((m) => m.topic === t.id)) continue;
    const seed = `topic-mock-${g.id}-${t.id}`;
    const fromGen = (g.id === 'aptitude' || g.id === 'reasoning') && GENS[t.id] ? fill(GENS[t.id], n, seed, 3) : [];
    const file = JSON.parse(readFileSync(join(OUT, 't', g.id, `${t.id}.json`), 'utf8')).questions;
    const picked = fromGen.length >= n ? fromGen : shuffle(rng(seed), file).slice(0, n);
    const questions = picked.map(({ id, src, imported, v2, ...q }) => tag(q, g.id));
    const seen = new Set();
    for (const q of questions) { while (seen.has(q.id)) q.id += 'x'; seen.add(q.id); }
    const id = `${g.id}-${t.id}-mock`;
    const title = `${t.title} Mock Test`;
    write(`m/${id}.json`, { id, title, minutes, sections: [{ title: t.title, minutes, questions }] });
    g.mocks.push({ id, title, questions: questions.length, minutes, sections: [{ title: t.title, questions: questions.length, minutes }], topic: t.id });
  }
}

// Previously asked questions (memory-based, content/placements/asked.mjs) also go at the top of the
// matching practice topic, tagged with the company, so students meet them while practising.
{
  const RULES = [
    ['technical', 'pseudocode', /Integer |print|Function |printf|while \(|for \(/],
    ['reasoning', 'seating-arrangement', /teach|sit |seated|classes between/i],
    ['reasoning', 'ranking-order', /tallest|shortest|bought more|ranks?\b/i],
    ['reasoning', 'letter-series', /does not fit the series/i],
    ['aptitude', 'time-and-work', /workers|finish(es)? a job|job alone/i],
    ['aptitude', 'mixtures-alligation', /mixed with|mixture|litres of oil/i],
    ['aptitude', 'pipes-and-cisterns', /tap|cistern|pipe/i],
    ['aptitude', 'compound-interest', /compound/i],
    ['aptitude', 'simple-interest', /simple interest/i],
    ['aptitude', 'speed-distance', /km\b|km\/h|speed/i],
    ['aptitude', 'averages', /average/i],
    ['aptitude', 'profit-loss', /profit|loss|marked|discount|sells?\b|seller/i],
    ['aptitude', 'ratio-proportion', /ratio|proportional/i],
    ['aptitude', 'mensuration', /circle|square|area|volume/i],
    ['aptitude', 'number-system', /divisible|digit|remainder|HCF|LCM/i],
    ['aptitude', 'percentages', /%|percent/i],
  ];
  const byTopic = new Map();
  const askedTopic = new Map();
  for (const [company, rows] of Object.entries(ASKED)) {
    const qs = fromRows(rows, null, `asked-topic-${company}`);
    rows.forEach((row, i) => {
      const hit = RULES.find(([, , re]) => re.test(`${row[0]} ${row[1] ?? ''}`));
      if (!hit) return;
      const k = `${hit[0]}/${hit[1]}`;
      if (!byTopic.has(k)) byTopic.set(k, []);
      byTopic.get(k).push({ ...tag(qs[i], 'asked'), asked: [company] });
      askedTopic.set(`${company}|${qs[i].q}`, hit[1]);
    });
  }
  // The company's own "previously asked" page gets the same full explanations.
  for (const company of Object.keys(ASKED)) {
    const file = join(OUT, 't', 'asked', `${company}.json`);
    if (!existsSync(file)) continue;
    const data = JSON.parse(readFileSync(file, 'utf8'));
    data.questions = data.questions.map((q) => {
      const t = askedTopic.get(`${company}|${q.q}`);
      return t && !q.ex.startsWith('How to solve:') ? { ...q, ex: fullExplanation(t, q) } : q;
    });
    writeFileSync(file, JSON.stringify(data));
  }
  for (const [k, list] of byTopic) {
    const [gid, tid] = k.split('/');
    const file = join(OUT, 't', gid, `${tid}.json`);
    if (!existsSync(file)) continue;
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const ids = new Set(list.map((q) => q.id));
    data.questions = [...list, ...data.questions.filter((q) => !ids.has(q.id))];
    writeFileSync(file, JSON.stringify(data));
  }
  console.log(`previously asked placed in topics: ${[...byTopic].map(([k, v]) => `${k} ${v.length}`).join(', ')}`);
}

// Full explanations (how to solve, numbered steps, shortcut) for every aptitude and reasoning question,
// in practice topics and inside mock tests. Done last so imported and previously asked questions get it too.
{
  // Technical theory questions get hand-written Key idea / Why not the others / Remember explanations.
  const practice = [];
  for (const f of readdirSync(join(OUT, 't', 'technical'))) practice.push(...JSON.parse(readFileSync(join(OUT, 't', 'technical', f), 'utf8')).questions);
  const techExplain = makeTechExplainer(practice);
  let techDone = 0;
  const upgrade = (topic, q) => {
    const tex = !q.code && q.options ? techExplain(q) : null;
    if (tex) { techDone++; return { ...q, ex: tex }; }
    return q.ex?.startsWith('How to solve:') || q.ex?.startsWith('Key idea:') ? q : { ...q, ex: fullExplanation(topic, q) };
  };
  for (const gid of ['aptitude', 'reasoning', 'technical', 'verbal', 'c', 'cpp', 'java', 'python']) {
    const dir = join(OUT, 't', gid);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      const tid = f.replace(/\.json$/, '');
      const file = join(dir, f);
      const data = JSON.parse(readFileSync(file, 'utf8'));
      data.questions = data.questions.map((q) => upgrade(tid, q));
      writeFileSync(file, JSON.stringify(data));
    }
  }
  for (const f of readdirSync(join(OUT, 'm'))) {
    const file = join(OUT, 'm', f);
    const data = JSON.parse(readFileSync(file, 'utf8'));
    for (const sec of data.sections) sec.questions = sec.questions.map((q) => upgrade(q.topic, q));
    writeFileSync(file, JSON.stringify(data));
  }
  console.log(`technical theory explanations applied: ${techDone}`);
}

// Topic counts must match the files after write() removed repeated questions.
for (const g of [...index.sections, ...(index.languages ?? [])]) {
  for (const t of g.topics) {
    const f = join(OUT, 't', g.id, `${t.id}.json`);
    if (existsSync(f)) t.count = JSON.parse(readFileSync(f, 'utf8')).questions.length;
  }
}
write('index.json', index);
const count = (x) => x.reduce((s, t) => s + t.count, 0);
console.log(`placements: ${index.sections.map((s) => `${s.id} ${count(s.topics)}`).join(', ')}; v2 added ${V2.length}; ${index.companies.length} companies; ${[...index.sections, ...index.languages, ...index.companies].reduce((s, x) => s + x.mocks.length, 0)} mock tests`);
