/**
 * Runs before every build: lists the files in every shared Drive folder that a Firestore
 * notes / labs doc points to, and writes public/data/folders.json for the site's folder page.
 * (Browsers can't read Drive folder listings directly, and the public web key is limited to
 * Firebase, so the listing is made here, on the build machine.) A folder that can't be read is
 * left out; the site then falls back to Google's own folder embed.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const PROJECT = 'ou-all-in-one-83b53';
const KEY = 'AIzaSyAGs_fbwAPvlvTstHiFsZVffkA1SNcJpCI';
const COLLECTIONS = ['engineering', 'pharmacy', 'bba', 'law', 'other'].map((c) => `${c}_notes`).concat(['lab_manuals']);
const FOLDER_RE = /drive\.google\.com\/drive\/(?:mobile\/)?(?:u\/\d+\/)?folders\/([\w-]{10,})/;
const ENTRY = /class="flip-entry" id="entry-([\w-]+)"[\s\S]*?href="([^"]+)"[\s\S]*?\/type\/([^"]+)"[\s\S]*?flip-entry-title">([^<]*)</g;
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function docs(name) {
  const out = [];
  let token = '';
  do {
    const r = await (await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${name}?pageSize=1000&key=${KEY}${token ? `&pageToken=${token}` : ''}`)).json();
    for (const d of r.documents ?? []) out.push(d.fields?.url?.stringValue ?? '');
    token = r.nextPageToken ?? '';
  } while (token);
  return out;
}

async function list(id) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const html = await res.text();
      const entries = [];
      for (const [, eid, href, mime, title] of html.matchAll(ENTRY)) {
        const sub = href.match(/folders\/([\w-]+)/);
        const isFolder = !!sub || mime === 'application/vnd.google-apps.folder';
        const kind = isFolder ? 'folder' : mime === 'application/pdf' || mime === 'application/vnd.google-apps.shortcut' ? 'pdf' : 'other';
        const name = decode(title).trim();
        entries.push({ id: sub?.[1] ?? eid, name: kind === 'pdf' ? name.replace(/\.pdf$/i, '') : name, kind });
      }
      return entries;
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

const queue = [];
for (const c of COLLECTIONS) for (const url of await docs(c)) { const m = url.match(FOLDER_RE); if (m) queue.push([m[1], 0]); }
const out = {};
let unreadable = 0;
async function worker() {
  while (queue.length) {
    const [id, depth] = queue.shift();
    if (id in out) continue;
    out[id] = null;
    const entries = await list(id);
    if (!entries) { delete out[id]; unreadable++; continue; }
    out[id] = entries;
    if (depth < 2) for (const e of entries) if (e.kind === 'folder') queue.push([e.id, depth + 1]);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/folders.json', JSON.stringify({ builtAt: new Date().toISOString(), folders: out }));
console.log(`folders.json: ${Object.keys(out).length} folders, ${Object.values(out).reduce((a, e) => a + e.length, 0)} entries, ${unreadable} unreadable.`);
