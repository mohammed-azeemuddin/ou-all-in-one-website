// Copied from the app (ou-all-in-one/src/lib/subjects.ts). Keep the two in step.
/**
 * Parses old-style paper names such as
 *   "DESIGN-AND-ANALYSIS-OF-ALGORITHMS-11589-MAY-2019 (CSE)"
 *   "VLSI-DESIGN-11198-O-JUN-2019"
 * into a readable title, subject code, exam session and branch tag.
 */
export type ParsedName = {
  title: string;
  subject: string; // normalised subject name used for grouping
  code?: string;
  session?: string; // e.g. "May 2019"
  tag?: string; // e.g. "CSE"
};

const MONTHS: Record<string, string> = {
  JAN: 'Jan', FEB: 'Feb', MAR: 'Mar', APR: 'Apr', MAY: 'May', JUN: 'Jun',
  JUL: 'Jul', AUG: 'Aug', SEP: 'Sep', OCT: 'Oct', NOV: 'Nov', DEC: 'Dec',
};

const SMALL = new Set(['and', 'of', 'in', 'the', 'for', 'to', 'a', 'an', 'on', 'with']);
const KEEP_UPPER = /^(I{1,3}|IV|VI{0,3}|IX|X|[A-Z]{2,4}\d?|\d+[A-Z]?)$/;

function titleCase(words: string[]): string {
  return words
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (i > 0 && SMALL.has(lower)) return lower;
      if (w.length <= 4 && KEEP_UPPER.test(w) && !/^[A-Z][a-z]/.test(w) && ['VLSI', 'DBMS', 'OOPS', 'DSP', 'II', 'III', 'IV', 'CN', 'OS'].includes(w)) return w;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

/** Names are parsed many times per render (rows, sorting, grouping, search), so results are kept. */
const parsedCache = new Map<string, ParsedName>();

export function parseName(raw: string): ParsedName {
  let hit = parsedCache.get(raw);
  if (!hit) {
    hit = parseNameUncached(raw);
    parsedCache.set(raw, hit);
  }
  return hit;
}

/**
 * Sort key for natural, case-insensitive ordering ("Unit 2" before "Unit 10") with plain
 * string comparison. localeCompare with options is extremely slow on Android (Hermes builds
 * a collator on every call), which made sorting a few hundred papers take seconds.
 */
export function naturalKey(text: string): string {
  return text.toLowerCase().replace(/\d+/g, (d) => d.padStart(8, '0'));
}
export const compareKeys = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const titleKeyCache = new Map<string, string>();
/** Cached naturalKey of an item's parsed title. */
export function titleSortKey(raw: string): string {
  let k = titleKeyCache.get(raw);
  if (k === undefined) {
    k = naturalKey(parseName(raw).title);
    titleKeyCache.set(raw, k);
  }
  return k;
}

function parseNameUncached(raw: string): ParsedName {
  const name = raw.trim();
  const tagMatch = name.match(/\(([^)]+)\)\s*$/);
  const tag = tagMatch?.[1]?.trim();
  const core = tagMatch ? name.slice(0, tagMatch.index).trim() : name;

  // SUBJECT-WORDS-CODE[-X[-Y]]-MON-YYYY
  const m = core.match(/^(.+?)-(\d{3,5})((?:-[A-Z]{1,2})*)-([A-Z]{3})-(\d{4})$/);
  if (m && MONTHS[m[4]]) {
    const subject = titleCase(m[1].split('-').filter(Boolean));
    const session = `${MONTHS[m[4]]} ${m[5]}`;
    return { title: subject, subject: subject.toLowerCase(), code: m[2], session, tag };
  }
  // SUBJECT-WORDS-YYYY[-YYYY] (e.g. "ARTIFICIAL-INTELLIGENCE-2021-2018")
  const r = core.match(/^(.+?)[-\s]+((?:19|20)\d{2}(?:\s*-\s*(?:19|20)\d{2})?)$/);
  let base = (r ? r[1] : core) || name;
  // Compilations like "B.Pharmacy SEM-1 All Subjects Previous Question Papers" -> "B.Pharmacy Sem 1 · All subjects"
  base = base
    .replace(/\s*previous\s+(year\s+)?question\s+papers?\s*/i, ' ')
    .replace(/\bsem[-\s]?(\d)\b/i, 'Sem $1')
    .replace(/\s+all\s+subjects\b/i, ' · All subjects')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const session = r ? r[2].replace(/\s+/g, '') : undefined;
  // ALL-CAPS hyphenated names get tidied; normal names ("Machine Design (MD)") are kept as written.
  const title = /[a-z]/.test(base) ? base.trim() : titleCase(base.split(/[-\s]+/).filter(Boolean));
  return { title, subject: title.toLowerCase(), session, tag };
}

export type SubjectGroup<T> = { key: string; title: string; codes: string[]; items: T[] };

export function groupBySubject<T extends { name: string }>(items: T[]): SubjectGroup<T>[] {
  const map = new Map<string, SubjectGroup<T>>();
  for (const it of items) {
    const p = parseName(it.name);
    let g = map.get(p.subject);
    if (!g) {
      g = { key: p.subject, title: p.title, codes: [], items: [] };
      map.set(p.subject, g);
    }
    if (p.code && !g.codes.includes(p.code)) g.codes.push(p.code);
    g.items.push(it);
  }
  const groups = Array.from(map.values());
  for (const g of groups) g.items.sort((a, b) => sessionSortKey(b.name) - sessionSortKey(a.name));
  return groups.sort((a, b) => compareKeys(naturalKey(a.title), naturalKey(b.title)));
}

const MONTH_INDEX = Object.keys(MONTHS);
const sessionKeyCache = new Map<string, number>();
export function sessionSortKey(raw: string): number {
  let k = sessionKeyCache.get(raw);
  if (k === undefined) {
    k = sessionSortKeyUncached(raw);
    sessionKeyCache.set(raw, k);
  }
  return k;
}

function sessionSortKeyUncached(raw: string): number {
  const p = parseName(raw);
  const text = p.session ?? (p.tag && /(?:19|20)\d{2}/.test(p.tag) ? p.tag : '');
  const years = (text.match(/(?:19|20)\d{2}/g) ?? []).map(Number);
  if (!years.length) return 0;
  const mon = MONTH_INDEX.indexOf(text.slice(0, 3).toUpperCase());
  // Month-less ranges like "2021-2018" sort by their latest year.
  return Math.max(...years) * 12 + (mon >= 0 ? mon : 11);
}

/** Semester and branch facets, read from optional doc fields, the file URL (be-cse-6-sem-…) or the name ("SEM-2"). */
export type Facets = { semester?: number; branches: string[] };

/** CSE, IT and the AI / data-science variants share one branch, matching the Drive folder "CSE-AI-IT". */
export const CSE_AI_IT = 'CSE / AI / IT';

const BRANCH_LABEL: Record<string, string> = {
  cse: CSE_AI_IT,
  cs: CSE_AI_IT,
  it: CSE_AI_IT,
  ai: CSE_AI_IT,
  aiml: CSE_AI_IT,
  ds: CSE_AI_IT,
  aids: CSE_AI_IT,
  cme: CSE_AI_IT,
  iot: CSE_AI_IT,
  ece: 'ECE',
  ete: 'ECE',
  eee: 'EEE',
  civil: 'Civil',
  mech: 'Mech',
  me: 'Mech',
  prod: 'Prod',
  inst: 'Inst',
  eie: 'Inst',
  ae: 'Auto',
  pe: 'Prod',
  ee: 'EEE',
};

export function facets(item: { name: string; url?: string; semester?: number | string; branch?: string }): Facets {
  let semester = item.semester != null && !Number.isNaN(Number(item.semester)) ? Number(item.semester) : undefined;
  const branches = new Set<string>();
  if (item.branch) branches.add(BRANCH_LABEL[item.branch.toLowerCase().replace(/[^a-z]/g, '')] ?? item.branch);

  const m = item.url?.match(/be-((?:[a-z]+-)*?)(\d)-sem/i);
  if (m) {
    semester ??= Number(m[2]);
    for (const t of m[1].split('-').filter(Boolean)) {
      const label = BRANCH_LABEL[t.toLowerCase()];
      if (label) branches.add(label);
    }
  }
  if (semester == null) {
    const n = item.name.match(/\bsem[-\s]?(\d)\b/i);
    if (n) semester = Number(n[1]);
  }
  // Bracketed name tags are not used: in notes they are subject abbreviations ("(AE)", "(IT)"), not branches.
  return { semester: semester && semester >= 1 && semester <= 8 ? semester : undefined, branches: Array.from(branches) };
}
