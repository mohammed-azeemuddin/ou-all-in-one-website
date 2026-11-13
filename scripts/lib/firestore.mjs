/**
 * Firestore reads for the build scripts, with a local cache so repeated local builds don't spend
 * the project's free daily read quota (50,000 reads a day, shared with the live app).
 *
 *  - Locally, a collection read in the last CACHE_HOURS is taken from .cache/firestore/ (0 reads).
 *    Set FRESH=1 to force a fresh read: FRESH=1 npm run build
 *  - On Netlify (or any CI) it always reads fresh, once per deploy.
 *  - If Firestore refuses (quota, network, bad key), the cached copy is used when there is one;
 *    otherwise the build stops with a clear error instead of quietly publishing empty pages.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT = 'ou-all-in-one-83b53';
const KEY = 'AIzaSyAGs_fbwAPvlvTstHiFsZVffkA1SNcJpCI'; // public web key, same as the site
const CACHE_DIR = '.cache/firestore';
const CACHE_HOURS = 12;
const ON_CI = !!(process.env.NETLIFY || process.env.CI);
const FORCE_FRESH = process.env.FRESH === '1' || ON_CI;

const stats = { fresh: 0, cached: 0, reads: 0 };
export const readStats = () => ({ ...stats });

const cacheFile = (name) => join(CACHE_DIR, `${name.replace(/[^\w-]/g, '_')}.json`);

function fromCache(name, maxAgeHours) {
  const f = cacheFile(name);
  if (!existsSync(f)) return null;
  try {
    const { at, docs } = JSON.parse(readFileSync(f, 'utf8'));
    if (maxAgeHours !== Infinity && Date.now() - at > maxAgeHours * 3600e3) return null;
    return { at, docs };
  } catch {
    return null;
  }
}

async function fetchAll(name) {
  const docs = [];
  let token = '';
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${encodeURIComponent(name)}?pageSize=1000&key=${KEY}${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`;
    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) throw new Error(`Firestore ${name}: ${res.status} ${(body.error?.message ?? res.statusText).replace(/\.$/, "")}`);
    docs.push(...(body.documents ?? []));
    token = body.nextPageToken ?? '';
  } while (token);
  return docs;
}

/** Raw Firestore documents of a collection (REST shape: { name, fields }). */
export async function collectionDocs(name) {
  if (!FORCE_FRESH) {
    const hit = fromCache(name, CACHE_HOURS);
    if (hit) {
      stats.cached++;
      return hit.docs;
    }
  }
  try {
    const docs = await fetchAll(name);
    stats.fresh++;
    stats.reads += Math.max(1, docs.length);
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(cacheFile(name), JSON.stringify({ at: Date.now(), docs }));
    return docs;
  } catch (err) {
    const stale = fromCache(name, Infinity);
    if (stale) {
      console.warn(`! ${err.message}. Using the copy saved ${new Date(stale.at).toLocaleString()}.`);
      stats.cached++;
      return stale.docs;
    }
    throw new Error(`${err.message}. No saved copy to fall back on, so the build stops here rather than publishing empty pages.`);
  }
}

/** Firestore REST value → plain JS (same rules as src/lib/firestore.js in the browser). */
export function decodeValue(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return Date.parse(v.timestampValue);
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields);
  return null;
}
export const decodeFields = (f = {}) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, decodeValue(v)]));
export const decodeDoc = (d) => ({ id: d.name.split('/').pop(), ...decodeFields(d.fields) });

/** app_config/meta.contentVersion (1 read), or null if it can't be read. */
export async function contentVersion() {
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/app_config/meta?key=${KEY}`);
    if (!res.ok) return null;
    const d = await res.json();
    return decodeFields(d.fields).contentVersion ?? null;
  } catch {
    return null;
  }
}
