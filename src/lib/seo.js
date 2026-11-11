/** Shared by the site and the pre-render script: one URL per subject. */
import { parseName } from './subjects';

export const SITE = 'https://www.ouallinone.com';

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'subject';
}

export const subjectSlug = (item) => slugify(parseName(item.name).title);

/** Groups items by subject: [{ slug, title, items, codes, sessions }], A to Z. */
export function subjects(items) {
  const map = new Map();
  for (const it of items) {
    const p = parseName(it.name);
    const slug = slugify(p.title);
    const g = map.get(slug) ?? { slug, title: p.title, items: [], codes: new Set(), sessions: [] };
    g.items.push(it);
    if (p.code) g.codes.add(p.code);
    if (p.session) g.sessions.push(p.session);
    map.set(slug, g);
  }
  return [...map.values()]
    .map((g) => ({ ...g, codes: [...g.codes] }))
    .sort((a, b) => a.title.localeCompare(b.title, 'en', { numeric: true, sensitivity: 'base' }));
}
