/**
 * Helpers for the placement question bank. Everything is deterministic (seeded), so a build
 * always produces the same questions and the same mock tests.
 *
 * Question shape: { q, code?, lang?, options: string[4], a: index, ex }
 */

export function rng(seed) {
  let s = typeof seed === 'number' ? seed : hash(seed);
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export function shuffle(r, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a, b) => (a / gcd(a, b)) * b;
export const round2 = (x) => Math.round(x * 100) / 100;
export const fmtNum = (x) => (Number.isInteger(x) ? String(x) : String(round2(x)));
export const inr = (x) => `₹${Number.isInteger(x) ? x.toLocaleString('en-IN') : round2(x).toLocaleString('en-IN')}`;

/** Builds a question from a correct option and distractors; options are shuffled, duplicates rejected. */
export function mcq(r, { q, code, lang, correct, wrong, ex }) {
  const uniq = [];
  for (const w of wrong) if (w !== correct && !uniq.includes(w)) uniq.push(w);
  if (uniq.length < 3) throw new Error(`Not enough distractors for: ${q}`);
  const opts = shuffle(r, [correct, ...uniq.slice(0, 3)]);
  const out = { q, options: opts, a: opts.indexOf(correct), ex };
  if (code) Object.assign(out, { code, lang: lang ?? 'pseudo' });
  return out;
}

/** Numeric distractors around the answer, formatted by `f`. */
export function numMcq(r, { q, ans, f = fmtNum, ex, near, code, lang = 'pseudo' }) {
  const cands = new Set();
  const steps = near ?? [ans * 0.8, ans * 1.2, ans * 0.9, ans * 1.1, ans + 1, ans - 1, ans * 1.25, ans * 0.75, ans + 2, ans - 2];
  for (const s of shuffle(r, steps)) {
    const v = Number.isInteger(ans) ? Math.round(s) : round2(s);
    if (v !== ans && v > 0) cands.add(f(v));
  }
  // Small answers: fall back to nearby whole steps so there are always three distractors.
  for (let k = 1; cands.size < 3 && k < 20; k++) {
    for (const v of [ans + k, ans - k]) if (v > 0 && v !== ans) cands.add(f(Number.isInteger(ans) ? v : round2(v)));
  }
  return mcq(r, { q, code, lang: code ? lang : undefined, correct: f(ans), wrong: shuffle(r, [...cands]), ex });
}

/** The shape of a question with numbers and names removed, used to spot the same template. */
export const templateOf = (item) => {
  const t = (item.q + '|' + (item.code ?? '').split('\n')[0]).replace(/[\d.,₹%]+/g, '#').replace(/\b[A-Z][a-z]+\b/g, 'N');
  return t.length <= 60 ? t : `${t.slice(0, 30)}…${t.slice(-30)}`;
};

/**
 * Produces up to `n` distinct questions from a generator. `perTemplate` caps how many questions
 * share one template, so a page never repeats the same kind of question over and over.
 */
export function many(gen, n, seed, perTemplate = Infinity) {
  const r = rng(seed);
  const out = [];
  const seen = new Set();
  const per = new Map();
  let guard = 0;
  while (out.length < n && guard++ < n * 80) {
    let item;
    try { item = gen(r); } catch { continue; } // a rare draw with too few distinct options is skipped
    const key = item.q + (item.code ?? '');
    if (seen.has(key)) continue;
    const t = templateOf(item);
    if ((per.get(t) ?? 0) >= perTemplate) continue;
    seen.add(key);
    per.set(t, (per.get(t) ?? 0) + 1);
    out.push(item);
  }
  // Interleave templates so similar questions are not next to each other.
  const buckets = new Map();
  for (const q of out) {
    const t = templateOf(q);
    buckets.set(t, [...(buckets.get(t) ?? []), q]);
  }
  const lists = [...buckets.values()];
  const mixed = [];
  for (let i = 0; mixed.length < out.length; i++) for (const l of lists) if (l[i]) mixed.push(l[i]);
  return mixed;
}

/** Shapes a hand-written item: answer given as the correct option text (first option) or an index. */
export function hw(q, options, a, ex, extra = {}) {
  return { q, options, a, ex, ...extra };
}
