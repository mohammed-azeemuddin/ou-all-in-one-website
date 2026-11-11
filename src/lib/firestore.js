/**
 * Reads the same Firestore collections as the app, over the REST API (no SDK, one HTTPS GET per page).
 * Results are kept for the browser session and refreshed when app_config/meta.contentVersion changes.
 */
const PROJECT = 'ou-all-in-one-83b53';
const KEY = 'AIzaSyAGs_fbwAPvlvTstHiFsZVffkA1SNcJpCI'; // public web key, already shipped in the 2022 site
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

function decode(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return Date.parse(v.timestampValue);
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(decode);
  if ('mapValue' in v) return fields(v.mapValue.fields);
  return null;
}
const fields = (f = {}) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, decode(v)]));

async function get(path) {
  const res = await fetch(`${BASE}/${path}${path.includes('?') ? '&' : '?'}key=${KEY}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Couldn't load (${res.status})`);
  return res.json();
}

let metaPromise = null;
export function getMeta() {
  metaPromise ??= get('app_config/meta')
    .then((d) => (d ? fields(d.fields) : {}))
    .catch(() => ({}));
  return metaPromise;
}

const memory = new Map();
const JUNK = /^https?:\/\/(?:www\.)?(?:cknscajk\.com|sdaggasdadyewfb\.com)\b/i;

/** All docs of a collection as plain objects with `id`. Items without a name or link are dropped. */
export async function loadCollection(name, { raw = false } = {}) {
  const meta = await getMeta();
  const version = meta.contentVersion ?? 0;
  const key = `col:${name}:${version}`;
  if (memory.has(key)) return memory.get(key);
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const items = JSON.parse(saved);
      memory.set(key, items);
      return items;
    }
  } catch {}
  const items = [];
  let token = '';
  do {
    const page = await get(`${encodeURIComponent(name)}?pageSize=1000${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`);
    for (const d of page?.documents ?? []) items.push({ id: d.name.split('/').pop(), ...fields(d.fields) });
    token = page?.nextPageToken ?? '';
  } while (token);
  const clean = raw
    ? items
    : items
        .map((x) => ({ ...x, name: typeof x.name === 'string' ? x.name.trim() : '', url: typeof x.url === 'string' ? x.url.trim() : undefined }))
        .filter((x) => x.name && (x.url || x.fileId) && !(x.url && JUNK.test(x.url)));
  memory.set(key, clean);
  try {
    sessionStorage.setItem(key, JSON.stringify(clean));
  } catch {}
  return clean;
}
