/**
 * One-off import of the owner's "placement_question_bank_5000_v2" questions.json into
 * content/placements/imported/v2.json.
 *
 * What the bank really holds (checked 11 Nov 2026):
 *   - Quant and reasoning: ~22 one-step patterns with different numbers. Every answer is recomputed;
 *     a wrong key is fixed, or the question dropped if the right value is not an option.
 *   - Verbal: 75 different questions, each copied ~7 times with a different "ticket #" number.
 *   - Each technical subject: 10 concept definitions asked in several wordings.
 * Reference numbers ("item 33766", "(Set 132040)") are stripped and copies removed. For technical
 * subjects only two wordings per concept are kept (term → meaning, meaning → term).
 *
 *   node scripts/import-v2.mjs /path/to/questions.json
 * Switch it on/off with INCLUDE_V2 in scripts/build-placements.mjs.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) throw new Error('Pass the path to questions.json');
const rows = JSON.parse(readFileSync(src, 'utf8'));

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const num = (s) => s.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const frac = (p, q) => { const g = gcd(p, q); return `${p / g}/${q / g}`; };
const ord = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] ?? 'th'}`;
const L = (c) => c.charCodeAt(0) - 64;
const shiftC = (c, k) => String.fromCharCode(((L(c) - 1 + k) % 26) + 65);

/** Quant/reasoning: returns { answer, q? (rewritten text), options? } or null if unknown. */
function solve(t) {
  const n = num(t);
  let m;
  if ((m = t.match(/is (\d+) years old\. \w+ \w+ is (\d+) years (younger|older)\. .* after (\d+) years/))) return { answer: fmt(+m[1] + (m[3] === 'younger' ? -m[2] : +m[2]) + +m[4]) };
  if (/^The average of \d+ numbers is \d+\. If a new number \d+ is included/.test(t)) return { answer: fmt((n[0] * n[1] + n[2]) / (n[0] + 1)) };
  if (/sold \d+ \w+ on Monday, \d+ on Tuesday, and \d+ on Wednesday/.test(t)) return { answer: fmt(n[0] + n[1] + n[2]) };
  if ((m = t.match(/contains (\d+) litres of water and \d+ litres of \w+\. How many litres of water must be added to obtain (\d+) litres of water/))) return { answer: fmt(+m[2] - +m[1]) };
  if ((m = t.match(/^What is the remainder when (\d+) is divided by (\d+)/))) return { answer: fmt(+m[1] % +m[2]) };
  if ((m = t.match(/In a batch of (\d+) items, (\d+)% are defective/))) return { answer: fmt((+m[1] * +m[2]) / 100) };
  if ((m = t.match(/A bag contains (\d+) red and (\d+) blue balls/))) {
    const [r, b] = [+m[1], +m[2]];
    const right = frac(r, r + b);
    const wrong = [frac(b, r + b), frac(r, b), frac(1, r + b), frac(r, r + b + 1), frac(Math.max(1, r - 1), r + b)].filter((x, i, a) => x !== right && a.indexOf(x) === i).slice(0, 3);
    if (wrong.length < 3) return null;
    return { answer: right, q: `A bag contains ${r} red and ${b} blue balls. One ball is drawn at random. What is the probability that it is red?`, options: [right, ...wrong], ex: `Favourable outcomes = ${r} red balls; total = ${r} + ${b} = ${r + b}. Probability = ${r}/${r + b} = ${right}.` };
  }
  if ((m = t.match(/buys an item for ₹(\d+) and sells it for ₹(\d+)\. What is the (profit|loss)/))) return { answer: fmt(Math.abs(+m[2] - +m[1])) };
  if ((m = t.match(/A sum of ₹(\d+) is divided in the ratio (\d+):(\d+)\. What is the (first|second) share/))) return { answer: fmt((+m[1] * (m[4] === 'first' ? +m[2] : +m[3])) / (+m[2] + +m[3])) };
  if ((m = t.match(/simple interest on ₹(\d+) at (\d+)% per annum for (\d+) years/))) return { answer: fmt((+m[1] * +m[2] * +m[3]) / 100) };
  if ((m = t.match(/travels at (\d+) km\/h for (\d+) hours/))) return { answer: fmt(+m[1] * +m[2]) };
  if ((m = t.match(/completes (\d+) units of work in (\d+) days .* in (\d+) days/))) return { answer: fmt((+m[1] / +m[2]) * +m[3]) };
  // reasoning
  if ((m = t.match(/If today is (\w+), which weekday is (\d+) days later/))) return { answer: DAYS[(DAYS.indexOf(m[1]) + +m[2]) % 7] };
  if ((m = t.match(/clock shows (\d+):(\d\d)\. What will it show (\d+) hours later/))) return { answer: `${((+m[1] - 1 + +m[3]) % 12) + 1}:${m[2]}` };
  if ((m = t.match(/shifted forward by (\d+) places with wraparound\. What does ([A-Z]) become/))) return { answer: shiftC(m[2], +m[1]) };
  if ((m = t.match(/A number is (\d+)\. How much larger is its triple than its double/))) return { answer: m[1] };
  if ((m = t.match(/walks (\d+) metres north, then (\d+) metres south/))) return { answer: fmt(+m[1] - +m[2]) };
  if ((m = t.match(/sum of the positions of ([A-Z]) and ([A-Z])/))) return { answer: fmt(L(m[1]) + L(m[2])) };
  if ((m = t.match(/Every \w+ has (\d+) \w+\. How many \w+ are in (\d+) \w+/))) return { answer: fmt(+m[1] * +m[2]) };
  if ((m = t.match(/Find the missing number: ([\d, ?]+)\./))) {
    const xs = m[1].split(',').map((x) => x.trim());
    const i = xs.indexOf('?');
    const j = xs.findIndex((x, k) => k > 0 && x !== '?' && xs[k - 1] !== '?');
    const [p, c] = [Number(xs[j - 1]), Number(xs[j])];
    for (const step of [(x) => x * (c / p), (x) => x + (c - p)]) {
      const filled = [...xs.map(Number)];
      filled[i] = i > 0 ? step(filled[i - 1]) : NaN;
      if (i === 0) continue;
      if (filled.every((x, k) => k === 0 || Math.abs(step(filled[k - 1]) - x) < 1e-9)) return { answer: fmt(filled[i]) };
    }
    return null;
  }
  if ((m = t.match(/arithmetic series: ([\d, ]+),\s*\?/))) { const v = m[1].split(',').map(Number); return { answer: fmt(v.at(-1) + v[1] - v[0]) }; }
  if ((m = t.match(/In a row of (\d+) students, (\w+) is (\d+)\w\w from the left\. What is (his|her) position from the right/))) {
    return { answer: fmt(+m[1] - +m[3] + 1), q: `In a row of ${m[1]} students, ${m[2]} is ${ord(+m[3])} from the left. What is ${m[4]} position from the right?` };
  }
  return null;
}

const MAP = {
  'Quantitative Aptitude': {
    Ages: 'ages', Averages: 'averages', 'Data Interpretation': 'data-interpretation', Mixtures: 'mixtures-alligation', 'Number System': 'number-system', Percentages: 'percentages',
    Probability: 'probability', 'Profit and Loss': 'profit-loss', 'Ratio and Proportion': 'ratio-proportion', 'Simple Interest': 'simple-interest', 'Speed and Distance': 'speed-distance', 'Time and Work': 'time-and-work',
  },
  'Logical Reasoning': {
    Calendars: 'calendars', Clocks: 'clocks', 'Coding-Decoding': 'coding-decoding', 'Data Sufficiency': 'logical-arithmetic', Directions: 'direction-sense', 'Letter Series': 'alphabet-positions',
    'Logical Arithmetic': 'logical-arithmetic', 'Number Series': 'number-series', Ranking: 'ranking-order',
  },
  'Verbal Ability': {
    Vocabulary: 'synonyms', Antonyms: 'antonyms', Articles: 'fill-in-the-blanks', Prepositions: 'fill-in-the-blanks', Tenses: 'fill-in-the-blanks', Conjunctions: 'fill-in-the-blanks',
    'Subject-Verb Agreement': 'sentence-correction', Punctuation: 'sentence-correction', 'Conditional Sentences': 'sentence-correction', 'Active and Passive Voice': 'sentence-correction',
  },
};
const TECH = { C: 'c', 'C++': 'cpp', Java: 'java', Python: 'python', 'Generative AI': 'genai', 'DBMS & SQL': 'dbms', 'Operating Systems': 'os' };
const GROUP = { 'Quantitative Aptitude': 'aptitude', 'Logical Reasoning': 'reasoning', 'Verbal Ability': 'verbal' };

/** Removes the bank's filler reference numbers from a question. */
function clean(s) {
  return s
    .replace(/\s*\((?:Set|Reference|Case|Batch|Item|Ref|Record)\s*#?\d+\)/gi, '')
    .replace(/\s+(?:in|for|about|on)\s+(?:an?\s+|the\s+)?[\w-]*\s*(?:item|ticket|memo|scenario|note|application|case|reference|set|batch|record|file|request|form|log|entry|exercise|question|review)\s*(?:#|numbered\s+|no\.\s*)?\d+/gi, '')
    .replace(/\s+(?:item|ticket|memo|scenario|note|application|case|reference|set|batch|record|numbered)\s*#?\d+/gi, '')
    .replace(/\s*#\d+/g, '')
    .replace(/\s*\((?:Exercise|Practice|Drill|Sample)\)/gi, '')
    .replace(/\s+([.,:])(?=\s|$)/g, '$1')
    .replace(/([A-Za-z])\s+\?$/, '$1?')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const stats = { rows: rows.length, kept: 0, fixed: 0, dropped: 0, copies: 0 };
const out = [];
const seen = new Set();
const techSeen = new Set();
const verbalPer = new Map();
for (const r of rows) {
  const opts = ['a', 'b', 'c', 'd'].map((k) => String(r[`option_${k}`]).trim());
  let a = 'ABCD'.indexOf(String(r.correct_answer).trim().toUpperCase());
  let q = clean(r.question);
  let ex = clean(r.explanation ?? '');
  let options = opts;
  if (new Set(opts).size !== 4 || a < 0) { stats.dropped++; continue; }

  if (TECH[r.section]) {
    // Keep two wordings per concept: "purpose of X" and "which concept matches 'Y'".
    const term = q.match(/primary purpose of (.+)\?$/)?.[1];
    const desc = q.match(/best matches this description: “(.+)”\?$/)?.[1];
    if (!term && !desc) { stats.copies++; continue; }
    const key = `${r.section}|${term ? 'T' : 'D'}|${term ?? desc}`;
    if (techSeen.has(key)) { stats.copies++; continue; }
    techSeen.add(key);
    q = term ? `In ${r.section}, which description best fits “${term}”?` : `Which ${r.section} concept matches this description: “${desc}”?`;
    out.push({ group: 'technical', topic: TECH[r.section], q, options, a, ex, difficulty: r.difficulty });
    stats.kept++;
    continue;
  }

  const topic = MAP[r.section]?.[r.topic];
  if (!topic) { stats.dropped++; continue; }
  if (r.section !== 'Verbal Ability') {
    const s = solve(q);
    if (!s) { stats.dropped++; continue; }
    if (s.q) q = s.q;
    if (s.ex) ex = s.ex;
    if (s.options) { options = s.options; a = 0; }
    else if (opts[a] !== s.answer) {
      const fix = opts.indexOf(s.answer);
      if (fix < 0) { stats.dropped++; continue; }
      a = fix;
      stats.fixed++;
    }
  }
  ex = ex.replace(/(\d+)th\b/g, (all, d) => ord(+d));
  const key = `${q}|${[...options].sort().join('|')}`;
  if (seen.has(key)) { stats.copies++; continue; }
  seen.add(key);
  if (r.section === 'Verbal Ability') {
    // The verbal items swap one noun or name across copies; keep a few of each.
    const vk = q.replace(/\b(report|document|project|assignment|schedule)\b/g, 'N');
    verbalPer.set(vk, (verbalPer.get(vk) ?? 0) + 1);
    if (verbalPer.get(vk) > 4) { stats.copies++; continue; }
  }
  out.push({ group: GROUP[r.section], topic, q, options, a, ex, difficulty: r.difficulty });
  stats.kept++;
}
const by = {};
for (const x of out) by[`${x.group}/${x.topic}`] = (by[`${x.group}/${x.topic}`] ?? 0) + 1;
stats.byTopic = by;
mkdirSync('content/placements/imported', { recursive: true });
writeFileSync('content/placements/imported/v2.json', JSON.stringify({ source: 'Owner-provided question bank v2 (machine-generated, 11 Nov 2026)', stats, questions: out }));
console.log(stats);
