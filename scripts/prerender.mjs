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

import { collectionDocs, contentVersion, decodeDoc, readStats } from './lib/firestore.mjs';
import { neutralLabels, unitSortKey } from '../src/lib/fileLabel.ts';
import { parseName, sessionSortKey } from '../src/lib/subjects.ts';

const SITE = 'https://www.ouallinone.com';
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
  for (const d of await collectionDocs(name)) {
    const f = d.fields ?? {};
    const name = f.name?.stringValue?.trim() ?? '';
    const url = f.url?.stringValue?.trim() ?? '';
    if (name && url && !JUNK.test(url)) out.push({ id: d.name.split('/').pop(), name, url });
  }
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
// Homepage numbers and newest papers, as a static file: the homepage reads this instead of
// downloading every papers/notes collection from Firestore on each visit.
{
  const all = COURSES.flatMap((c) => data[`papers:${c.id}`].flatMap((g) => g.items.map((it) => ({ ...it, course: c.title }))));
  const latest = all
    .filter((i) => parseName(i.name).session)
    .sort((a, b) => sessionSortKey(b.name) - sessionSortKey(a.name) || parseName(a.name).title.localeCompare(parseName(b.name).title))
    .slice(0, 12);
  const notes = COURSES.reduce((a, c) => a + data[`notes:${c.id}`].reduce((x, g) => x + g.items.length, 0), 0);
  const home = JSON.stringify({ updated: today, papers: totalPapers, notes, latest });
  // Search index: every subject's title, codes and link, so site search needs no Firestore reads.
  const search = JSON.stringify(['papers', 'notes'].flatMap((section) => COURSES.flatMap((c) => data[`${section}:${c.id}`].map((g) => ({ h: `/${section}/${c.id}/${g.slug}`, t: g.title, c: c.title, s: section, n: g.items.length, k: [...g.codes] })))));
  for (const dir of [join(DIST, 'data'), join('public', 'data')]) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'home.json'), home);
    writeFileSync(join(dir, 'search.json'), search);
  }
}
// Full papers / notes / lab lists as static files, so opening a course on the website costs no
// Firestore reads. Each file records contentVersion; when it is raised after new uploads, the browser
// sees a newer live version and reads Firestore directly until the next deploy rebuilds these files.
{
  const v = await contentVersion();
  const names = [...COURSES.flatMap((c) => [`${c.id}_qp`, `${c.id}_notes`]), 'lab_manuals'];
  for (const name of names) {
    const docs = await collectionDocs(name);
    const body = JSON.stringify({ v, items: docs.map(decodeDoc) });
    for (const dir of [join(DIST, 'data', 'col'), join('public', 'data', 'col')]) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `${name}.json`), body);
    }
  }
}

// ---------- pages ----------
write('/', {
  title: 'OU Previous Question Papers and Notes (Osmania University) | OU All In One',
  description: `Free Osmania University (OU) previous question papers and notes: ${totalPapers}+ papers for B.E. Engineering, B.Pharmacy, BBA, Law and more. Search by subject or code. No sign-up.`,
  h1: 'OU previous question papers and notes, free',
  intro: 'Osmania University papers and notes for Engineering, Pharmacy, BBA, Law and more, plus free placement prep: company-wise questions and timed mock tests for TCS, Infosys, Wipro, Accenture and others.',
  priority: 1,
  body: `<h2>Question papers by course</h2>${list(COURSES.map((c) => [`/papers/${c.id}`, `OU ${c.title} previous question papers`, `${data[`papers:${c.id}`].reduce((x, g) => x + g.items.length, 0)} papers`]))}
<h2>Notes by course</h2>${list(COURSES.map((c) => [`/notes/${c.id}`, `OU ${c.title} notes`, `${data[`notes:${c.id}`].length} subjects`]))}
<h2>Placement prep</h2>${list([['/placements', 'Placement preparation: aptitude, reasoning, verbal and technical MCQs with mock tests'], ['/placements/companies', 'Company-wise preparation (TCS NQT, Infosys, Wipro, Accenture and more)']])}
<h2>More</h2>${list([['/labs', 'Lab manuals and viva questions'], ['/placements', 'Placements, interview questions and jobs'], ['/tools', 'SGPA and attendance calculators']])}`,
  jsonld: [
    { '@type': 'WebSite', name: 'OU All In One', url: SITE, potentialAction: { '@type': 'SearchAction', target: `${SITE}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    { '@type': 'Organization', name: 'OU All In One', url: SITE, logo: `${SITE}/logo512.png`, sameAs: ['https://t.me/ouallinone', 'https://play.google.com/store/apps/details?id=com.azeem.ou_app2', 'https://apps.apple.com/in/app/ou-notes-papers-lab-placements/id6833496974'] },
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
  ['/tools', 'SGPA, CGPA and Attendance Calculator (OU) | OU All In One', 'Calculate your SGPA with OU CBCS grades, and how many classes you can skip at 75% attendance.', 'SGPA and attendance calculators'],
  ['/contact', 'Contact | OU All In One', 'Questions, ideas, a paper to share, or a removal request: email ouallinone@gmail.com.', 'Contact OU All In One'],
]) write(path, { title, description, h1, body: '', priority: 0.5 });

// ---------- placement prep ----------
{
  const P = (rel) => JSON.parse(readFileSync(join(DIST, 'data', 'placements', rel), 'utf8'));
  const idx = P('index.json');
  const groups = [...idx.sections, ...idx.languages];
  const qHtml = (q, n) => {
    const passage = q.passage ? `<p class="muted"><b>Passage (${esc(q.passage.title)}):</b> ${esc(q.passage.text)}</p>` : '';
    const code = q.code ? `<pre class="code"><code>${esc(q.code)}</code></pre>` : '';
    const opts = `<ol type="A">${q.options.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>`;
    return `<div class="q-card">${passage}<p class="q-text"><b>${n}.</b> ${esc(q.q)}</p>${code}${opts}<details><summary>Answer</summary><p><b>${'ABCD'[q.a]}. ${esc(q.options[q.a])}</b>${q.ex ? ` ${esc(q.ex)}` : ''}</p></details></div>`;
  };
  const mockList = (ms) => list(ms.map((m) => [`/placements/mock/${m.id}`, m.title, `${m.questions} questions · ${m.minutes} min`]));
  write('/placements', {
    title: 'Placement Preparation: Aptitude, Reasoning, TCS, Infosys Mock Tests | OU All In One',
    description: 'Free placement preparation for freshers: quantitative aptitude, logical reasoning, verbal ability, technical MCQs (C, C++, Java, Python, AI, Gen AI) and company-wise mock tests for TCS NQT, Infosys, Wipro, Accenture, Cognizant and more.',
    h1: 'Placement preparation',
    intro: 'Practice questions with answers, timed mock tests and company-wise preparation.',
    priority: 0.9,
    body: `<h2>Company-wise preparation</h2>${list(idx.companies.map((c) => [`/placements/companies/${c.id}`, `${c.name} preparation and mock tests`, c.full]))}<h2>Practise by section</h2>${list(idx.sections.map((s) => [`/placements/${s.id}`, s.title, s.blurb]))}${idx.languages.length ? `<h2>Programming and AI</h2>${list(idx.languages.map((l) => [`/placements/${l.id}`, `${l.title} MCQs`, l.blurb]))}` : ''}`,
    jsonld: [crumbs([['Home', '/'], ['Placements', '/placements']])],
  });
  for (const g of groups) {
    write(`/placements/${g.id}`, {
      title: `${g.title} Questions and Mock Tests for Placements | OU All In One`,
      description: `${g.title} practice for campus placements: ${g.topics.length} topics with answers and explanations, and 3 timed mock tests. ${g.blurb}`,
      h1: `${g.title} for placements`,
      intro: g.blurb,
      priority: 0.8,
      body: `<h2>Topics</h2>${list(g.topics.map((t) => [`/placements/${g.id}/${t.id}`, `${t.title} questions`, `${t.count} questions`]))}<h2>Mock tests</h2>${mockList(g.mocks.filter((m) => !m.topic))}`,
      jsonld: [crumbs([['Home', '/'], ['Placements', '/placements'], [g.title, `/placements/${g.id}`]])],
    });
    for (const t of g.topics) {
      const data = P(`t/${g.id}/${t.id}.json`);
      write(`/placements/${g.id}/${t.id}`, {
        title: `${data.title} Questions with Answers (Placement Aptitude) | OU All In One`,
        description: `${data.questions.length} ${data.title} questions with answers and explanations for TCS, Infosys, Wipro and other placement tests. ${data.desc}`,
        h1: `${data.title} questions`,
        intro: data.desc,
        priority: 0.7,
        body: data.questions.map((q, i) => qHtml(q, i + 1)).join('') + (g.mocks.some((m) => m.topic === t.id) ? `<h2>Mock test</h2>${mockList(g.mocks.filter((m) => m.topic === t.id))}` : '') + `<h2>More ${esc(g.title)} topics</h2>${list(g.topics.filter((x) => x.id !== t.id).map((x) => [`/placements/${g.id}/${x.id}`, x.title]))}`,
        jsonld: [crumbs([['Home', '/'], ['Placements', '/placements'], [g.title, `/placements/${g.id}`], [data.title, `/placements/${g.id}/${t.id}`]])],
      });
    }
  }
  write('/placements/companies', {
    title: 'Company-wise Placement Preparation: TCS, Infosys, Wipro, Accenture | OU All In One',
    description: 'Test patterns, tips, coding practice and mock tests for TCS NQT, Infosys, InfyTQ, Wipro Elite NTH, Cognizant GenC, Accenture, Capgemini, HCLTech, Deloitte, Tech Mahindra and LTIMindtree.',
    h1: 'Company-wise placement preparation',
    priority: 0.8,
    body: list(idx.companies.map((c) => [`/placements/companies/${c.id}`, `${c.name} preparation`, c.full])),
    jsonld: [crumbs([['Home', '/'], ['Placements', '/placements'], ['Companies', '/placements/companies']])],
  });
  for (const c of idx.companies) {
    const rows = c.pattern.map((p) => `<tr><td>${esc(p.title)}</td><td>${p.questions}</td><td>${p.minutes} min</td></tr>`).join('');
    const coding = c.coding.map((k) => { const p = idx.coding[k]; return `<h3>${esc(p.title)}</h3><p>${esc(p.statement)}</p><pre class="code"><code>${esc(p.sample)}</code></pre>`; }).join('');
    write(`/placements/companies/${c.id}`, {
      title: `${c.name} Test Pattern, Preparation and Mock Tests | OU All In One`,
      description: `${c.full}: test pattern (${c.pattern.map((p) => p.title).join(', ')}), tips, coding practice and 3 free mock tests.`,
      h1: `${c.name} preparation`,
      intro: c.about,
      priority: 0.8,
      body: `${c.asked ? `<p><a href="/placements/asked/${c.id}">Previously asked ${esc(c.name)} questions (${c.asked})</a></p>` : ''}<h2>Test pattern</h2><table class="pattern"><thead><tr><th>Section</th><th>Questions</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table>${c.extra ? `<p>${esc(c.extra)}</p>` : ''}<h2>Tips</h2><ul>${c.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul><h2>Mock tests</h2>${mockList(c.mocks)}<h2>Coding practice</h2>${coding}`,
      jsonld: [crumbs([['Home', '/'], ['Placements', '/placements'], ['Companies', '/placements/companies'], [c.name, `/placements/companies/${c.id}`]])],
    });
  }
  for (const c of idx.companies.filter((x) => x.asked)) {
    const data = P(`t/asked/${c.id}.json`);
    write(`/placements/asked/${c.id}`, {
      title: `${c.name} Previously Asked Questions with Solutions (Memory-Based) | OU All In One`,
      description: `${data.questions.length} ${c.name} questions reported by candidates from recent tests, with answers and step-by-step solutions.`,
      h1: `Previously asked ${c.name} questions`,
      intro: data.desc,
      priority: 0.8,
      body: data.questions.map((q, i) => qHtml(q, i + 1)).join('') + `<p><a href="/placements/companies/${c.id}">${esc(c.name)} test pattern and mock tests</a></p>`,
      jsonld: [crumbs([['Home', '/'], ['Placements', '/placements'], ['Companies', '/placements/companies'], [c.name, `/placements/companies/${c.id}`], ['Previously asked', `/placements/asked/${c.id}`]])],
    });
  }
  for (const c of idx.companies.filter((x) => x.practice)) {
    const data = P(`t/practice/${c.id}.json`);
    write(`/placements/practice/${c.id}`, {
      title: `${c.name} Practice Questions with Answers | OU All In One`,
      description: `${data.questions.length} practice questions with answers for ${c.name} placement preparation: aptitude, reasoning, verbal and technical.`,
      h1: `${c.name} practice set`,
      intro: data.desc,
      priority: 0.6,
      body: data.questions.slice(0, 100).map((q, i) => qHtml(q, i + 1)).join('') + `<p><a href="/placements/companies/${c.id}">${esc(c.name)} test pattern and mock tests</a></p>`,
    });
  }
  const allMocks = [...groups, ...idx.companies].flatMap((x) => x.mocks);
  for (const m of allMocks) {
    write(`/placements/mock/${m.id}`, {
      title: `${m.title}: Free Online Test (${m.questions} Questions) | OU All In One`,
      description: `Free timed online mock test: ${m.questions} questions in ${m.minutes} minutes (${m.sections.map((s) => s.title).join(', ')}). Instant score with answers and explanations.`,
      h1: m.title,
      intro: `${m.questions} questions · ${m.minutes} minutes`,
      priority: 0.6,
      body: `<table class="pattern"><thead><tr><th>Section</th><th>Questions</th><th>Time</th></tr></thead><tbody>${m.sections.map((s) => `<tr><td>${esc(s.title)}</td><td>${s.questions}</td><td>${s.minutes} min</td></tr>`).join('')}</tbody></table>`,
    });
  }
}

// ---------- sitemap and robots ----------
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${today}</lastmod><priority>${u.priority.toFixed(1)}</priority></url>`).join('\n')}\n</urlset>\n`,
);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /view/\nDisallow: /folder/\nDisallow: /search\n\nSitemap: ${SITE}/sitemap.xml\n`);
const rs = readStats();
console.log(`prerendered ${urls.length} pages, sitemap.xml and robots.txt (Firestore: ${rs.fresh} collections read, ~${rs.reads} reads; ${rs.cached} from the local cache)`);
