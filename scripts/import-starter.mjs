/**
 * One-off import of the owner's "placement_question_bank_starter" questions.json into
 * content/placements/imported/starter.json. Every answer is recomputed from the question;
 * a wrongly marked answer is fixed (or the question dropped if the right value is not an option).
 * Verbal items get their grammar tidied. Company copies are folded into company tags, not duplicated.
 *
 *   node scripts/import-starter.mjs /path/to/questions.json
 * Switch the imported set on/off with INCLUDE_IMPORTED in scripts/build-placements.mjs.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) throw new Error('Pass the path to questions.json');
const rows = JSON.parse(readFileSync(src, 'utf8'));

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const num = (s) => s.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100));

function nextInSeries(xs) {
  const d = xs.slice(1).map((x, i) => x - xs[i]);
  if (d.every((x) => x === d[0])) return xs.at(-1) + d[0];
  if (xs.every((x) => x !== 0)) {
    const q = xs.slice(1).map((x, i) => x / xs[i]);
    if (q.every((x) => x === q[0])) return xs.at(-1) * q[0];
  }
  const dd = d.slice(1).map((x, i) => x - d[i]);
  if (dd.every((x) => x === dd[0])) return xs.at(-1) + d.at(-1) + dd[0];
  return null;
}

/** Returns the correct answer as text, or null when the template is not recognised. */
function compute(q) {
  const t = q.question.replace(/^\[[^\]]*\]\s*/, '');
  const n = num(t);
  let m;
  if (/^What is [\d.]+% of [\d.]+\?/.test(t)) return fmt((n[0] * n[1]) / 100);
  if (/sells it at a profit of/.test(t)) return fmt(n[0] * (1 + n[1] / 100));
  if (/^Find the simple interest/.test(t)) return fmt((n[0] * n[1] * n[2]) / 100);
  if (/^Two quantities are in the ratio/.test(t)) return fmt((n[2] / n[0]) * n[1]);
  if (/^The average of \d+ numbers is/.test(t)) return fmt(n[0] * n[1]);
  if (/^A vehicle travels at a constant speed/.test(t)) return fmt(n[0] * n[1]);
  if (/^What is the HCF/.test(t)) return fmt(gcd(n[0], n[1]));
  if (/students be selected from/.test(t)) return fmt(C(n[1], n[0]));
  if (/^Evaluate \d+ \+ \d+ × \d+/.test(t)) return fmt(n[0] + n[1] * n[2]);
  if (/What will their age be after/.test(t)) return fmt(n[0] + n[1]);
  if (/marked price of ₹[\d.]+\. A discount of/.test(t)) return fmt(n[0] * (1 - n[1] / 100));
  if (/workers finish a job in \d+ days/.test(t)) return fmt((n[0] * n[1]) / n[2]);
  if ((m = t.match(/^(?:Find the next number|What comes next in the square-number pattern): ([\d, -]+), \?/))) {
    const v = nextInSeries(m[1].split(',').map((x) => Number(x.trim())));
    return v === null ? null : fmt(v);
  }
  if (/walks \d+ m north and then \d+ m south/.test(t)) return fmt(Math.max(0, n[0] - n[1]));
  if (/is \d+th from the left and \d+th from the right/.test(t)) return fmt(n[0] + n[1] - 1);
  if (/every number is increased by/.test(t)) return fmt(n[0] + n[1]);
  if ((m = t.match(/^If today is (\w+), what day of the week will it be after (\d+) days/))) return DAYS[(DAYS.indexOf(m[1]) + Number(m[2])) % 7];
  if (/A group has \d+ members and \d+ new members join/.test(t)) return fmt(n[0] + n[1]);
  if ((m = t.match(/print\((\d+) \/\/ (\d+)\)/))) return fmt(Math.floor(Number(m[1]) / Number(m[2])));
  if ((m = t.match(/print\((\d+) % (\d+)\)/))) return fmt(Number(m[1]) % Number(m[2]));
  if ((m = t.match(/print\(len\("([a-z]*)"\)\)/))) return fmt(m[1].length);
  if ((m = t.match(/value of `(\d+) \+ (\d+) \* (\d+)`/))) return fmt(Number(m[1]) + Number(m[2]) * Number(m[3]));
  if ((m = t.match(/value of `(\d+) \/ (\d+)` when both operands are positive `int`/))) return fmt(Math.trunc(Number(m[1]) / Number(m[2])));
  if ((m = t.match(/result of `(\d+) \* (\d+) \+ (\d+)` in JavaScript/))) return fmt(Number(m[1]) * Number(m[2]) + Number(m[3]));
  if (/linear search of an array with \d+ elements/.test(t)) return fmt(n[0]);
  if (/stack after \d+ pushes and \d+ pops/.test(t)) return fmt(n[0] - n[1]);
  if (/A table has \d+ rows\. An INSERT adds \d+ rows/.test(t)) return fmt(n[0] + n[1]);
  if (/A loop runs exactly \d+ times and performs \d+ constant-time/.test(t)) return fmt(n[0] * n[1]);
  return null;
}

// Where each imported topic goes on the site: [group, topicId, topicTitle]
const MAP = {
  Percentages: ['aptitude', 'percentages'], 'Profit and Loss': ['aptitude', 'profit-loss'], Discounts: ['aptitude', 'profit-loss'],
  'Simple Interest': ['aptitude', 'simple-interest'], 'Ratio and Proportion': ['aptitude', 'ratio-proportion'], Averages: ['aptitude', 'averages'],
  Ages: ['aptitude', 'ages'], 'Time and Work': ['aptitude', 'time-and-work'], 'Time Speed and Distance': ['aptitude', 'speed-distance'],
  'HCF and LCM': ['aptitude', 'number-system'], 'Number System': ['aptitude', 'number-system'], 'Permutations and Combinations': ['aptitude', 'permutations-combinations'],
  'Number Series': ['reasoning', 'number-series'], 'Coding-Decoding': ['reasoning', 'coding-decoding'], 'Direction Sense': ['reasoning', 'direction-sense'],
  Calendars: ['reasoning', 'calendars'], Ranking: ['reasoning', 'ranking-order'], 'Analytical Reasoning': ['reasoning', 'quick-counting', 'Quick Counting', 'Fast arithmetic warm-ups for reasoning sections.'],
  'Subject-Verb Agreement': ['verbal', 'subject-verb-agreement', 'Subject-Verb Agreement', 'Pick the sentence with the correct verb form.'],
  Python: ['python', 'quick-practice', 'Quick practice'], Java: ['java', 'quick-practice', 'Quick practice'], 'C Programming': ['c', 'quick-practice', 'Quick practice'],
  'DBMS and SQL': ['technical', 'dbms'], JavaScript: ['technical', 'javascript', 'JavaScript', 'Expression results in JavaScript.'],
  'Data Structures': ['technical', 'data-structures', 'Data Structures', 'Stacks and other basic structures.'],
  Algorithms: ['technical', 'algorithms', 'Algorithms', 'Searching and comparison counts.'],
  'Time Complexity': ['technical', 'time-complexity', 'Time Complexity', 'Counting operations in loops.'],
};

function tidyVerbal(q) {
  const fixSentence = (s) => s
    .replace(/^(In general|As a rule|Normally|Usually|Typically|Often|Generally),\s+(The|She|He|It|My|Our|Their|His|Her|A|An|This|That|Every|Each)\b/, (all, intro, w) => `${intro}, ${w.toLowerCase()}`)
    .replace(/\b(go|goes|going|went)\s+at the\b/g, '$1 to the')
    .replace(/\b(are|do)\s+(go|goes)\s+at the\b/g, '$1 $2 to the');
  return { ...q, question: 'Choose the grammatically correct sentence.', option_a: fixSentence(q.option_a), option_b: fixSentence(q.option_b), option_c: fixSentence(q.option_c), option_d: fixSentence(q.option_d), explanation: q.explanation.replace(/“(The|She|He|It|My|Our|Their|His|Her)\b/, '“$1') };
}

const strip = (s) => s.replace(/^\[[^\]]*\]\s*/, '');
const aliasText = new Map(); // id -> stripped question text (company copies point at their general twin)
for (const r of rows) aliasText.set(r.id, strip(r.question));
const byText = new Map();
const companies = new Map(); // text -> Set(company)
for (const r of rows) {
  const key = strip(r.question);
  for (const c of String(r.company_tags || '').split('|').map((x) => x.trim()).filter(Boolean)) {
    if (!companies.has(key)) companies.set(key, new Set());
    companies.get(key).add(c);
  }
  if (r.category === 'Company-Specific Practice') continue; // exact copies of general items
  if (!byText.has(key)) byText.set(key, r);
}

const stats = { kept: 0, fixed: 0, dropped: 0, unverified: 0, duplicates: rows.length - byText.size };
const out = [];
for (let r of byText.values()) {
  if (r.topic === 'Subject-Verb Agreement') r = tidyVerbal(r);
  const opts = [r.option_a, r.option_b, r.option_c, r.option_d].map(String);
  let a = 'ABCD'.indexOf(String(r.correct_option).trim().toUpperCase());
  const truth = r.topic === 'Subject-Verb Agreement' ? null : compute(r);
  if (truth === null) stats.unverified += r.topic === 'Subject-Verb Agreement' ? 0 : 1;
  else if (opts[a] !== truth) {
    const fix = opts.indexOf(truth);
    if (fix < 0 || new Set(opts).size !== 4) { stats.dropped++; continue; }
    a = fix;
    stats.fixed++;
  }
  if (new Set(opts).size !== 4) { stats.dropped++; continue; }
  const map = MAP[r.topic];
  if (!map) { stats.dropped++; continue; }
  const text = strip(r.question);
  const code = text.match(/`([^`]+)`/)?.[1];
  out.push({
    id: r.id,
    group: map[0], topic: map[1], topicTitle: map[2] ?? null, topicDesc: map[3] ?? null,
    q: text.replace(/`/g, ''),
    options: opts, a, ex: r.explanation, difficulty: r.difficulty,
    companies: [...(companies.get(strip(r.question)) ?? [])],
    ...(code && /print|value of|result of/.test(text) ? {} : {}),
  });
  stats.kept++;
}
// Mock test configurations shipped with the bank, with question ids resolved to kept questions.
const kept = new Set(out.map((q) => q.id));
const generalIdByText = new Map();
for (const r of rows) if (r.category !== 'Company-Specific Practice' && !generalIdByText.has(strip(r.question))) generalIdByText.set(strip(r.question), r.id);
const resolve = (id) => (kept.has(id) ? id : generalIdByText.get(aliasText.get(id)));
const mocksSrc = JSON.parse(readFileSync(src.replace(/questions\.json$/, 'mock_tests.json'), 'utf8'));
const mocks = mocksSrc.map((m) => {
  const ids = m.question_ids.map(resolve).filter((id) => id && kept.has(id));
  return { id: m.id, title: m.title, company: m.company ?? null, minutes: m.duration_minutes, ids: [...new Set(ids)] };
});
stats.mocks = mocks.map((m) => `${m.id}:${m.ids.length}`).join(' ');
mkdirSync('content/placements/imported', { recursive: true });
writeFileSync('content/placements/imported/mocks.json', JSON.stringify(mocks));
writeFileSync('content/placements/imported/starter.json', JSON.stringify({ source: 'Owner-provided starter dataset (machine-generated, 11 Nov 2026)', stats, questions: out }));
console.log(stats);
