/**
 * Admin sign-in and writes for /admin, over Google's REST APIs (no Firebase SDK).
 *
 * Sign-in is a Firebase Authentication email + password account. Writing is allowed only by the
 * Firestore security rules (see firestore.rules in this repo): this page being public does not let
 * anyone else write, because Firestore checks the signed-in account on every request.
 *
 * After every change `app_config/meta.contentVersion` goes up by one. The app and the website
 * compare it with their saved copy and re-read the lists, so new items appear with no app update.
 */
import { FIREBASE_KEY as KEY, FIREBASE_PROJECT as PROJECT } from './firestore';

const DOCS = `projects/${PROJECT}/databases/(default)/documents`;
const BASE = `https://firestore.googleapis.com/v1/${DOCS}`;
const STORE = 'ou-admin';

let session = null;
try {
  session = JSON.parse(sessionStorage.getItem(STORE) ?? 'null');
} catch {}

const keep = (s) => {
  session = s;
  try {
    if (s) sessionStorage.setItem(STORE, JSON.stringify(s));
    else sessionStorage.removeItem(STORE);
  } catch {}
};

export const adminEmail = () => session?.email ?? null;
export const signOut = () => keep(null);

const AUTH_ERRORS = {
  INVALID_LOGIN_CREDENTIALS: 'Wrong email or password.',
  INVALID_PASSWORD: 'Wrong email or password.',
  EMAIL_NOT_FOUND: 'Wrong email or password.',
  USER_DISABLED: 'This account is disabled.',
  OPERATION_NOT_ALLOWED: 'Email and password sign-in is not switched on in Firebase yet.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many attempts. Wait a few minutes and try again.',
};

export async function signIn(email, password) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = String(body.error?.message ?? '').split(' ')[0];
    throw new Error(AUTH_ERRORS[code] ?? `Couldn't sign in (${code || res.status}).`);
  }
  keep({ email: body.email, idToken: body.idToken, refreshToken: body.refreshToken, expiresAt: Date.now() + Number(body.expiresIn) * 1000 });
  return body.email;
}

/** A valid ID token; sign-in lasts an hour, so it is renewed quietly when it is about to run out. */
async function token() {
  if (!session) throw new Error('Sign in first.');
  if (session.expiresAt - Date.now() > 60_000) return session.idToken;
  const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: session.refreshToken }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    keep(null);
    throw new Error('Your sign-in ran out. Sign in again.');
  }
  keep({ ...session, idToken: body.id_token, refreshToken: body.refresh_token, expiresAt: Date.now() + Number(body.expires_in) * 1000 });
  return session.idToken;
}

async function call(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${await token()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 403) throw new Error('Firestore refused the change. This account is not allowed to write (check the security rules).');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `Request failed (${res.status}).`);
  }
  return res.status === 204 ? null : res.json().catch(() => null);
}

/** Plain value to Firestore's REST shape. Empty strings and undefined are left out by the callers. */
function encode(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encode) } };
  return { mapValue: { fields: encodeFields(v) } };
}
const encodeFields = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, encode(v)]));

function decode(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(decode);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields);
  return null;
}
const decodeFields = (f = {}) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, decode(v)]));

/** Tells every app and browser that the lists changed. */
export const bumpVersion = () =>
  call(`${BASE}:commit`, {
    method: 'POST',
    body: { writes: [{ transform: { document: `${DOCS}/app_config/meta`, fieldTransforms: [{ fieldPath: 'contentVersion', increment: { integerValue: '1' } }] } }] },
  });

// ---------- website rebuild ----------
// The website's built copies of the lists only update on a deploy. After a change, a rebuild is asked
// for once the admin has been idle for REBUILD_DELAY (so ten uploads in a row cost one build), or at
// once if the page is hidden or closed before then. The request goes to /api/rebuild
// (netlify/functions/rebuild.mjs), which checks the admin sign-in and keeps the build hook secret.
const REBUILD_DELAY = 30_000;
let rebuildTimer = null;
let rebuildState = { status: 'idle' }; // idle | waiting (at) | sending | started (at) | failed (error)
const listeners = new Set();
const setRebuild = (st) => {
  rebuildState = st;
  listeners.forEach((l) => l(st));
};
export const rebuildStatus = () => rebuildState;
export function onRebuildStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function rebuildNow() {
  clearTimeout(rebuildTimer);
  rebuildTimer = null;
  setRebuild({ status: 'sending' });
  try {
    const res = await fetch('/api/rebuild', { method: 'POST', headers: { Authorization: `Bearer ${await token()}` }, keepalive: true });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? `Rebuild request failed (${res.status}).`);
    setRebuild({ status: 'started', at: Date.now() });
  } catch (err) {
    setRebuild({ status: 'failed', error: err.message });
  }
}

function scheduleRebuild() {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(rebuildNow, REBUILD_DELAY);
  setRebuild({ status: 'waiting', at: Date.now() + REBUILD_DELAY });
}

if (typeof document !== 'undefined') {
  // Leaving the page with a rebuild still waiting: send it now (keepalive lets it finish).
  const flush = () => {
    if (rebuildTimer && document.visibilityState === 'hidden') void rebuildNow();
  };
  document.addEventListener('visibilitychange', flush);
  window.addEventListener('pagehide', () => rebuildTimer && void rebuildNow());
}

/** Adds a document (or replaces the one with the same id) and bumps the content version. */
export async function saveItem(collection, id, data) {
  const fields = encodeFields(data);
  if (id) await call(`${BASE}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, { method: 'PATCH', body: { fields } });
  else await call(`${BASE}/${encodeURIComponent(collection)}`, { method: 'POST', body: { fields } });
  await bumpVersion();
  scheduleRebuild();
}

export async function deleteItem(collection, id) {
  await call(`${BASE}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await bumpVersion();
  scheduleRebuild();
}

/** The live list straight from Firestore (one read per document), newest change first. */
export async function listItems(collection) {
  const out = [];
  let pageToken = '';
  do {
    const page = await call(`${BASE}/${encodeURIComponent(collection)}?pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`);
    for (const d of page?.documents ?? []) out.push({ id: d.name.split('/').pop(), updateTime: d.updateTime, ...decodeFields(d.fields) });
    pageToken = page?.nextPageToken ?? '';
  } while (pageToken);
  return out.sort((a, b) => (a.updateTime < b.updateTime ? 1 : -1));
}

export async function readMeta() {
  const d = await call(`${BASE}/app_config/meta`).catch(() => null);
  return d ? decodeFields(d.fields) : {};
}

/** Changes only the given top-level fields of app_config/meta. An empty string clears a field. */
export function saveMeta(changes) {
  const mask = Object.keys(changes).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  return call(`${BASE}/app_config/meta?${mask}`, { method: 'PATCH', body: { fields: encodeFields(changes) } });
}
