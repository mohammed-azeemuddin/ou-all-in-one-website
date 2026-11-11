# OU All In One website (ouallinone.com)

Rebuilt in November 2026 with Vite + React. It reads the same Firestore data as the
OU All In One app (question papers, notes, lab manuals, jobs), so anything added for the app
shows up here too.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # lists every notes folder into public/data/folders.json, then builds to dist/
```

- `src/lib/firestore.js` reads Firestore over REST (cached per browser session, refreshed when
  `app_config/meta.contentVersion` changes).
- `src/lib/subjects.ts` and `src/lib/fileLabel.ts` are copied from the app; keep them in step.
- PDFs open in the site's own viewer (Google Drive preview); notes folders are listed from
  `public/data/folders.json`, written by `scripts/build-folders.mjs` at build time.
- `public/privacy.html` is the app's privacy policy, linked from both store listings. Keep its address.
- `public/_redirects` sends the 2022 addresses (`/QuestionPapers`, `/Notes`, …) to the new pages.
- Netlify settings are in `netlify.toml` (build `npm run build`, publish `dist`, Node 22: the pre-render step needs it).
