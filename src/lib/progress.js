/**
 * Placement prep progress, saved in this browser (localStorage). No account needed; it stays on
 * this device. Shape:
 *   t: { "<group>/<topic>": { "<questionId>": pickedOptionIndex } }   practice answers
 *   m: { "<mockId>": [{ s: score, n: total, at: timestamp }] }         mock attempts
 *   q: { "<mockId>": { "<questionId>": 1 } }                          questions answered in mocks (all attempts)
 * Progress shows answered out of all questions; a topic gets its tick once 60% are answered.
 */
import { useSyncExternalStore } from 'react';

const KEY = 'ou-prep-progress-v1';
export const TARGET = 0.6;

let state = read();
const listeners = new Set();

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (raw && typeof raw === 'object') return { t: raw.t ?? {}, m: raw.m ?? {}, q: raw.q ?? {} };
  } catch {}
  return { t: {}, m: {}, q: {} };
}
function save(next) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l());
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = read();
      listeners.forEach((l) => l());
    }
  });
}

export function useProgress() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export function answer(topicKey, qid, pick) {
  const t = { ...state.t, [topicKey]: { ...(state.t[topicKey] ?? {}), [qid]: pick } };
  save({ ...state, t });
}
export function resetTopic(topicKey) {
  const t = { ...state.t };
  delete t[topicKey];
  save({ ...state, t });
}
export function recordMock(mockId, score, total, answeredIds = []) {
  const m = { ...state.m, [mockId]: [...(state.m[mockId] ?? []), { s: score, n: total, a: answeredIds.length, at: Date.now() }] };
  const seen = { ...(state.q[mockId] ?? {}) };
  for (const id of answeredIds) seen[id] = 1;
  save({ ...state, m, q: { ...state.q, [mockId]: seen } });
}
export function resetAll() {
  save({ t: {}, m: {}, q: {} });
}

/** Answered and correct counts for a topic (correctness needs the questions; pass them when available). */
export function topicDone(p, topicKey, count) {
  const answered = Object.keys(p.t[topicKey] ?? {}).length;
  const goal = Math.max(1, Math.ceil(count * TARGET)); // a topic gets its tick at 60%
  const shown = Math.min(answered, count);
  return { answered: shown, target: count, goal, count, pct: count ? Math.min(100, Math.round((shown / count) * 100)) : 0, done: shown >= goal };
}
export function mockStats(p, mockId) {
  const list = p.m[mockId] ?? [];
  if (!list.length) return { taken: 0, best: null, last: null };
  const best = list.reduce((b, x) => (x.s / x.n > b.s / b.n ? x : b), list[0]);
  return { taken: list.length, best, last: list[list.length - 1] };
}
/** Summary for a section: topics done, answered out of all questions, mocks taken. */
export function groupStats(p, group) {
  const topics = group.topics.map((t) => topicDone(p, `${group.id}/${t.id}`, t.count));
  const answered = topics.reduce((a, t) => a + Math.min(t.answered, t.target), 0);
  const target = topics.reduce((a, t) => a + t.target, 0);
  const mocksTaken = group.mocks.filter((m) => mockStats(p, m.id).taken).length;
  return { topicsDone: topics.filter((t) => t.done).length, topics: topics.length, answered, target, pct: target ? Math.round((answered / target) * 100) : 0, mocksTaken, mocks: group.mocks.length };
}
/** Company summary: previously asked + practice set solved, and mocks taken. */
export function companyStats(p, c) {
  const asked = c.asked ? topicDone(p, `asked/${c.id}`, c.asked) : null;
  const practice = c.practice ? topicDone(p, `practice/${c.id}`, c.practice) : null;
  const inMocks = new Set(c.mocks.flatMap((m) => Object.keys(p.q?.[m.id] ?? {}))).size;
  const solved = (asked?.answered ?? 0) + (practice?.answered ?? 0) + inMocks;
  const mocks = c.mocks.map((m) => mockStats(p, m.id));
  const mocksTaken = mocks.filter((m) => m.taken).length;
  const attempts = mocks.reduce((a, m) => a + m.taken, 0);
  return { asked, practice, solved, inMocks, mocksTaken, mocks: c.mocks.length, attempts };
}
