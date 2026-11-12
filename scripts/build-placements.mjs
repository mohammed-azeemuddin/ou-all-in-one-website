/**
 * Builds the placement prep data from content/placements into public/data/placements:
 *   index.json            sections and companies with their topics and mock tests
 *   t/<group>/<topic>.json practice questions for one topic
 *   m/<mockId>.json       a timed mock test (sections with questions)
 * Everything is seeded, so the output is the same on every build.
 *
 *   node scripts/build-placements.mjs
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { APTITUDE_TOPICS } from '../content/placements/aptitude.mjs';
import { ASKED } from '../content/placements/asked.mjs';
import { CODING, COMPANIES } from '../content/placements/companies.mjs';
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
    const seen = new Set();
    data.questions = data.questions.filter((q) => (seen.has(q.id) ? false : seen.add(q.id)));
  }
  const f = join(OUT, rel);
  mkdirSync(join(f, '..'), { recursive: true });
  writeFileSync(f, JSON.stringify(data));
};

const PRACTICE = 50; // questions per generated practice topic (every topic should have at least 50)
const PER_TEMPLATE = 8; // most questions of one template per topic (numbers differ), so lists don't feel repetitive
/** n questions from a generator, using the smallest per-template cap that still reaches n. */
const fill = (gen, n, seed, cap = PER_TEMPLATE) => {
  let best = [];
  for (const c of [cap, 12, 16, 25, Infinity]) {
    if (c < cap) continue;
    best = many(gen, n, seed, c);
    if (best.length >= n) break;
  }
  return best;
};
// Topics where every question needs fresh working even if the wording is alike: no template cap.
const NO_CAP = new Set(['number-series', 'letter-series', 'clocks', 'odd-one-out', 'analogies', 'seating-arrangement', 'direction-sense']);
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
const index = { updated: new Date().toISOString().slice(0, 10), sections: [], languages: [], companies: [], coding: CODING };
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

// ---------- owner's v2 bank (5000 rows; ~1,165 left after removing copies) ----------
// Quant/reasoning are one-step patterns with different numbers: at most V2_PER_TEMPLATE of each per
// topic, interleaved and added after our own questions. Set INCLUDE_V2 to false to remove it all.
const INCLUDE_V2 = true;
const V2_PER_TEMPLATE = 12;
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
    for (const cap of one ? [1] : [V2_PER_TEMPLATE, 20, 30, 50]) {
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
    const add = dealt.map((q) => ({ ...tag({ q: q.q, options: q.options, a: q.a, ex: q.ex }, 'v2'), v2: true })).filter((q) => (have.has(q.id) ? false : have.add(q.id)));
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
    coding: c.coding,
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
    for (const cfg of JSON.parse(readFileSync(MOCKS_FILE, 'utf8'))) {
      if (SUBJECT[cfg.id]) {
        const g = index.sections.find((x) => x.id === SUBJECT[cfg.id]);
        if (g && cfg.ids.length) {
          addMock(g, `${g.id}-mock-4`, `${g.title} Mock Test 4`, cfg);
          const m4 = g.mocks.pop(); const at = g.mocks.findIndex((m) => m.id === `${g.id}-mock-3`) + 1; g.mocks.splice(at, 0, m4);
        }
        continue;
      }
      for (const c of index.companies.filter((x) => NAME[x.id] === cfg.company)) if (cfg.ids.length) addMock(c, `${c.id}-mock-4`, `${c.name} Mock Test 4`, cfg);
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

write('index.json', index);
const count = (x) => x.reduce((s, t) => s + t.count, 0);
console.log(`placements: ${index.sections.map((s) => `${s.id} ${count(s.topics)}`).join(', ')}; v2 added ${V2.length}; ${index.companies.length} companies; ${[...index.sections, ...index.languages, ...index.companies].reduce((s, x) => s + x.mocks.length, 0)} mock tests`);
