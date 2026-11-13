// Builds "Key idea / Not / Remember" explanations for technical theory questions (no code).
// EXPLAIN entries are [keyIdea, not, remember] where `not` is an array (one line per wrong option,
// in the order the options appear in the practice file), an object keyed by option text, or null (use OPT).
import * as ai from './ai.mjs';
import * as c from './c.mjs';
import * as cpp from './cpp.mjs';
import * as dbms from './dbms.mjs';
import * as genai from './genai.mjs';
import * as java from './java.mjs';
import * as msoffice from './ms-office.mjs';
import * as net from './networking-security-cloud.mjs';
import * as os from './os.mjs';
import * as python from './python.mjs';

const MODS = [c, cpp, java, python, dbms, os, net, msoffice, ai, genai];
const EXPLAIN = new Map();
const OPT = new Map(); // question text → OPT dictionary of its subject
const GLOSSARY = {};
for (const m of MODS) {
  for (const [q, v] of Object.entries(m.EXPLAIN)) { EXPLAIN.set(q, v); OPT.set(q, m.OPT ?? {}); }
  Object.assign(GLOSSARY, m.GLOSSARY ?? {});
}

const clean = (s) => String(s).replace(/\s+/g, ' ').trim();
const strip = (s) => String(s).toLowerCase().replace(/[^a-z0-9+#]/g, '');
// If the reason already names the option first, don't repeat the option in front of it.
const notLine = (opt, why) => (strip(why).startsWith(strip(opt)) && strip(opt).length > 1 ? `Not: ${clean(why)}` : `Not: ${opt} — ${clean(why)}`);
const F1 = /which description best fits “(.+)”/;
const F2 = /concept matches this description: “(.+)”/;

/**
 * Prepare a lookup from the practice questions (whose option order the EXPLAIN arrays follow).
 * Returns explain(q) → new ex string, or null when nothing is known for q.
 */
export function makeTechExplainer(practiceQuestions) {
  // Map each array-style entry to option text once, using the first practice copy.
  const byText = new Map();
  const descOf = new Map(); // concept → description
  for (const q of practiceQuestions) {
    const m = q.q.match(F1);
    if (m) descOf.set(m[1], q.options[q.a]);
    const m2 = q.q.match(F2);
    if (m2 && !descOf.has(q.options[q.a])) descOf.set(q.options[q.a], m2[1]);
    const e = EXPLAIN.get(q.q);
    if (!e || byText.has(q.q) || !Array.isArray(e[1])) continue;
    const wrong = q.options.filter((_, i) => i !== q.a);
    if (wrong.length === e[1].length) byText.set(q.q, Object.fromEntries(wrong.map((o, i) => [o, e[1][i]])));
  }
  const conceptOf = new Map([...descOf].map(([k, v]) => [v, k]));

  return function explain(q) {
    if (q.code) return null;
    const answer = q.options[q.a];
    const wrong = q.options.filter((_, i) => i !== q.a);
    const e = EXPLAIN.get(q.q);
    if (e) {
      const map = Array.isArray(e[1]) ? byText.get(q.q) ?? {} : e[1] ?? {};
      const opt = OPT.get(q.q);
      const nots = wrong.map((o) => { const why = map[o] ?? opt[o]; return why ? notLine(o, why) : null; }).filter(Boolean);
      return [`Key idea: ${clean(e[0])}`, ...nots, `Remember: ${clean(e[2])}`].join('\n');
    }
    let m = q.q.match(F1);
    if (m && GLOSSARY[m[1]]) {
      const guess = (o) => conceptOf.get(o) ?? Object.keys(GLOSSARY).find((k) => k !== m[1] && new RegExp(`\\b${k}\\b`, 'i').test(o));
      const nots = wrong.map((o) => (guess(o) ? notLine(o, `this describes ${guess(o)}, not ${m[1]}.`) : null)).filter(Boolean);
      return [`Key idea: ${clean(GLOSSARY[m[1]])}`, ...nots, `Remember: ${m[1]} → ${answer}.`].join('\n');
    }
    m = q.q.match(F2);
    if (m && GLOSSARY[answer]) {
      const nots = wrong.map((o) => (GLOSSARY[o] ? notLine(o, clean(GLOSSARY[o])) : descOf.has(o) ? notLine(o, `${o} means: ${descOf.get(o)}.`) : null)).filter(Boolean);
      return [`Key idea: ${clean(GLOSSARY[answer])} That matches “${m[1]}”.`, ...nots, `Remember: ${answer} → ${m[1]}.`].join('\n');
    }
    return null;
  };
}
