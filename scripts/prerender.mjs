/**
 * Runs after `vite build`. Writes a real HTML page for every route search engines should find:
 * home, sections, courses, and one page per subject (papers and notes), each with its own title,
 * description, canonical URL, structured data and the full list of links in the HTML. The React
 * app still loads on top, so visitors get the interactive site; crawlers get the content without
 * running JavaScript. Also writes sitemap.xml and robots.txt.
 *
 *   node --experimental-strip-types scripts/prerender.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { neutralLabels, unitSortKey } from '../src/lib/fileLabel.ts';
import { parseName, sessionSortKey } from '../src/lib/subjects.ts';

const SITE = 'https://www.ouallinone.com';
const PROJECT = 'ou-all-in-one-83b53';
const KEY = 'AIzaSyAGs_fbwAPvlvTstHiFsZVffkA1SNcJpCI';
const DIST = 'dist';
const COURSES = [
  { id: 'engineering', title: 'Engineering', long: 'B.E. (Engineering)' },
  { id: 'pharmacy', title: 'Pharmacy', long: 'B.Pharmacy' },
  { id: 'bba', title: 'BBA', long: 'BBA' },
  { id: 'law', title: 'Law', long: 'Law (LL.B / BA LLB)' },
  { id: 'other', title: 'Other streams', long: 'other courses' },
];
const JUNK = /^https?:\/\/(?:www\.)?(?:cknscajk\.com|sdaggasdadyewfb\.com)\b/i;
const DRIVE_FILE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]{10,})/;
const DRIVE_FOLDER = /drive\.google\.com\/drive\/(?:mobile\/)?(?:u\/\d+\/)?folders\/([\w-]{10,})/;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (t) => t.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'subject';
const today = new Date().toISOString().slice(0, 10);

async function collection(name) {
  const out = [];
  let token = '';
  do {
    const r = await (await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${name}?pageSize=1000&key=${KEY}${token ? `&pageToken=${token}` : ''}`)).json();
    for (const d of r.documents ?? []) {
      const f = d.fields ?? {};
      const name = f.name?.stringValue?.trim() ?? '';
      const url = f.url?.stringValue?.trim() ?? '';
      if (name && url && !JUNK.test(url)) out.push({ id: d.name.split('/').pop(), name, url });
    }
    token = r.nextPageToken ?? '';
  } while (token);
  return out;
}

function group(items) {
  const map = new Map();
  for (const it of items) {
    const p = parseName(it.name);
    const slug = slugify(p.title);
    const g = map.get(slug) ?? { slug, title: p.title, items: [], codes: new Set() };
    g.items.push(it);
    if (p.code) g.codes.add(p.code);
    map.set(slug, g);
  }
  for (const g of map.values()) {
    g.items.sort((a, b) => sessionSortKey(b.name) - sessionSortKey(a.name));
    g.codes = new Set(g.items.map((i) => parseName(i.name).code).filter(Boolean)); // latest exam's code first
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, 'en', { numeric: true, sensitivity: 'base' }));
}

function itemHref(it) {
  const file = it.url.match(DRIVE_FILE);
  if (file) return `/view/${file[1]}?t=${encodeURIComponent(it.name)}`;
  const folder = it.url.match(DRIVE_FOLDER);
  if (folder) return `/folder/${folder[1]}?t=${encodeURIComponent(parseName(it.name).title)}`;
  return it.url;
}

// ---------- page shell ----------
const template = readFileSync(join(DIST, 'index.html'), 'utf8');
const urls = [];

const NAV = `<header class="site-header"><div class="wrap header-row"><a href="/" class="brand">OU All In One</a>
<nav class="nav" aria-label="Main"><a class="nav-link" href="/papers">Papers</a><a class="nav-link" href="/notes">Notes</a><a class="nav-link" href="/labs">Labs</a><a class="nav-link" href="/placements">Placements</a><a class="nav-link" href="/tools">Tools</a></nav></div></header>`;
const FOOT = `<footer class="site-footer"><div class="wrap"><p>OU All In One: free papers, notes, lab manuals and placement prep for Osmania University students. <a href="/contact">Contact</a> · <a href="/privacy.html">Privacy policy</a></p>
<p class="footer-note">OU All In One is an independent student project and is not affiliated with, endorsed by or connected to Osmania University.</p></div></footer>`;

function crumbs(list) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: list.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })),
  };
}

function write(path, { title, description, h1, intro, body, jsonld = [], priority = 0.6 }) {
  const url = SITE + (path === '/' ? '/' : path);
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${SITE}/logo512.png" />`,
    `<meta name="twitter:card" content="summary" />`,
    ...jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...j }).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<meta property="og:[^>]*>\s*/g, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${NAV}<main class="page"><section class="page-hero"><div class="wrap"><h1>${esc(h1)}</h1>${intro ? `<p class="lead">${esc(intro)}</p>` : ''}</div></section><section class="section"><div class="wrap narrow">${body}</div></section></main>${FOOT}</div>`);
  const file = path === '/' ? join(DIST, 'index.html') : join(DIST, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  urls.push({ loc: url, priority });
}

const list = (rows) => `<ul class="seo-list">${rows.map(([href, text, note]) => `<li><a href="${esc(href)}">${esc(text)}</a>${note ? ` <span class="muted">${esc(note)}</span>` : ''}</li>`).join('')}</ul>`;

// ---------- data ----------
const data = {};
for (const section of ['papers', 'notes']) {
  for (const c of COURSES) data[`${section}:${c.id}`] = group(await collection(`${c.id}_${section === 'papers' ? 'qp' : 'notes'}`));
}
let folders = {};
try {
  folders = JSON.parse(readFileSync(join(DIST, 'data', 'folders.json'), 'utf8')).folders ?? {};
} catch {}
const totalPapers = COURSES.reduce((a, c) => a + data[`papers:${c.id}`].reduce((x, g) => x + g.items.length, 0), 0);

// ---------- pages ----------
write('/', {
  title: 'OU Previous Question Papers and Notes (Osmania University) | OU All In One',
  description: `Free Osmania University (OU) previous question papers and notes: ${totalPapers}+ papers for B.E. Engineering, B.Pharmacy, BBA, Law and more. Search by subject or code. No sign-up.`,
  h1: 'OU previous question papers and notes, free',
  intro: 'Osmania University papers and notes for Engineering, Pharmacy, BBA, Law and more. Search any subject or code.',
  priority: 1,
  body: `<h2>Question papers by course</h2>${list(COURSES.map((c) => [`/papers/${c.id}`, `OU ${c.title} previous question papers`, `${data[`papers:${c.id}`].reduce((x, g) => x + g.items.length, 0)} papers`]))}
<h2>Notes by course</h2>${list(COURSES.map((c) => [`/notes/${c.id}`, `OU ${c.title} notes`, `${data[`notes:${c.id}`].length} subjects`]))}
<h2>More</h2>${list([['/labs', 'Lab manuals and viva questions'], ['/placements', 'Placements, interview questions and jobs'], ['/tools', 'SGPA and attendance calculators']])}`,
  jsonld: [
    { '@type': 'WebSite', name: 'OU All In One', url: SITE, potentialAction: { '@type': 'SearchAction', target: `${SITE}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    { '@type': 'Organization', name: 'OU All In One', url: SITE, logo: `${SITE}/logo512.png`, sameAs: ['https://t.me/ouallinone', 'https://play.google.com/store/apps/details?id=com.azeem.ou_app2'] },
  ],
});

for (const section of ['papers', 'notes']) {
  const S = section === 'papers' ? { title: 'Previous Question Papers', what: 'previous question papers', noun: 'papers' } : { title: 'Notes', what: 'notes', noun: 'notes' };
  write(`/${section}`, {
    title: `OU ${S.title}: Engineering, Pharmacy, BBA, Law | OU All In One`,
    description: `Osmania University ${S.what} for every course. Pick Engineering, Pharmacy, BBA, Law or other streams and open any subject free.`,
    h1: `Osmania University ${S.what}`,
    body: list(COURSES.map((c) => [`/${section}/${c.id}`, `${c.title} ${S.what}`, c.long])),
    priority: 0.9,
    jsonld: [crumbs([['Home', '/'], [S.title, `/${section}`]])],
  });
  for (const c of COURSES) {
    const groups = data[`${section}:${c.id}`];
    const count = groups.reduce((x, g) => x + g.items.length, 0);
    write(`/${section}/${c.id}`, {
      title: `OU ${c.title} ${S.what.replace(/^\w/, (m) => m.toUpperCase())}${count ? ` (${count} ${S.noun})` : ''} | OU All In One`,
      description: `Osmania University ${c.long} ${S.what}: ${groups.length} subjects${groups.length ? `, including ${groups.slice(0, 4).map((g) => g.title).join(', ')}` : ''}. Free, no sign-up.`,
      h1: `${c.title} ${S.what}`,
      intro: `Osmania University ${c.long}. ${groups.length} subjects, A to Z.`,
      body: groups.length ? list(groups.map((g) => [`/${section}/${c.id}/${g.slug}`, g.title, `${g.items.length} ${g.items.length === 1 ? (section === 'papers' ? 'paper' : 'set') : section === 'papers' ? 'papers' : 'sets'}`])) : '<p>New material is added regularly.</p>',
      priority: 0.8,
      jsonld: [crumbs([['Home', '/'], [S.title, `/${section}`], [c.title, `/${section}/${c.id}`]])],
    });
    for (const g of groups) {
      const codes = [...g.codes];
      const sessions = g.items.map((i) => parseName(i.name).session).filter(Boolean);
      const path = `/${section}/${c.id}/${g.slug}`;
      let rows;
      if (section === 'papers') {
        rows = g.items.map((it) => {
          const p = parseName(it.name);
          return [itemHref(it), `${p.title}${p.session ? ` · ${p.session}` : ''} question paper`, p.code ? `code ${p.code}` : ''];
        });
      } else {
        rows = [];
        for (const it of g.items) {
          const folder = it.url.match(DRIVE_FOLDER)?.[1];
          const entries = folder ? folders[folder] : null;
          if (entries?.length) {
            const files = entries.filter((e) => e.kind === 'pdf').sort((a, b) => unitSortKey(a.name) - unitSortKey(b.name));
            const labels = neutralLabels(files.map((f) => f.name));
            files.forEach((f, i) => rows.push([`/view/${f.id}?t=${encodeURIComponent(`${g.title} · ${labels[i]}`)}`, `${g.title} notes · ${labels[i]}`, '']));
            if (!files.length) rows.push([itemHref(it), `${g.title} notes folder`, '']);
          } else rows.push([itemHref(it), `${g.title} notes`, '']);
        }
      }
      const related = groups.filter((x) => x.slug !== g.slug).slice(0, 400);
      const what = section === 'papers' ? 'previous question papers' : 'notes';
      write(path, {
        title: `${g.title} ${what === 'notes' ? 'Notes' : 'Previous Question Papers'} OU ${c.title}${codes.length ? ` (${codes[0]})` : ''} | OU All In One`,
        description:
          section === 'papers'
            ? `Osmania University ${c.long} ${g.title} previous question papers${sessions.length ? `: ${sessions.slice(0, 5).join(', ')}` : ''}${codes.length ? `. Subject code ${codes.join(', ')}` : ''}. Open or download free.`
            : `Osmania University ${c.long} ${g.title} notes, unit by unit. Open or download free, no sign-up.`,
        h1: `${g.title} ${what}`,
        intro: `Osmania University ${c.long}${codes.length ? ` · subject code ${codes.join(', ')}` : ''}${sessions.length ? ` · ${sessions.length} ${sessions.length === 1 ? 'exam' : 'exams'}` : ''}.`,
        body: `${list(rows)}<h2>More ${c.title} subjects</h2>${list(related.map((x) => [`/${section}/${c.id}/${x.slug}`, x.title]))}`,
        priority: 0.7,
        jsonld: [
          crumbs([['Home', '/'], [S.title, `/${section}`], [c.title, `/${section}/${c.id}`], [g.title, path]]),
          { '@type': 'CollectionPage', name: `${g.title} ${what}`, url: SITE + path, isPartOf: { '@type': 'WebSite', url: SITE }, about: { '@type': 'Thing', name: g.title } },
        ],
      });
    }
  }
}

for (const [path, title, description, h1] of [
  ['/labs', 'Lab Manuals and Viva Questions (OU) | OU All In One', 'Osmania University lab manuals, records and viva questions for internals and externals.', 'Lab manuals and viva questions'],
  ['/placements', 'Placements, Interview Questions and Jobs | OU All In One', 'Aptitude and technical tests, TCS and Infosys interview questions, and job openings for OU students.', 'Placements and interviews'],
  ['/tools', 'SGPA, CGPA and Attendance Calculator (OU) | OU All In One', 'Calculate your SGPA with OU CBCS grades, and how many classes you can skip at 75% attendance.', 'SGPA and attendance calculators'],
  ['/contact', 'Contact | OU All In One', 'Questions, ideas, a paper to share, or a removal request: email ouallinone@gmail.com.', 'Contact OU All In One'],
]) write(path, { title, description, h1, body: '', priority: 0.5 });

// ---------- sitemap and robots ----------
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${today}</lastmod><priority>${u.priority.toFixed(1)}</priority></url>`).join('\n')}\n</urlset>\n`,
);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /view/\nDisallow: /folder/\nDisallow: /search\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`prerendered ${urls.length} pages, sitemap.xml and robots.txt`);
