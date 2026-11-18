/**
 * POST /api/rebuild — asks Netlify to rebuild the site, so its built copies of the lists (and the
 * pages Google reads) catch up after a change made on /admin.
 *
 * Only the admin may call it: the request must carry the admin's Firebase ID token
 * (Authorization: Bearer <token>). Google checks the token; we check it belongs to the admin UID.
 * The build hook URL stays secret in the BUILD_HOOK_URL environment variable (Netlify > Site
 * configuration > Environment variables), never in the page.
 */
const FIREBASE_KEY = 'AIzaSyAGs_fbwAPvlvTstHiFsZVffkA1SNcJpCI'; // public web key, same as the site
const ADMIN_UID = 'mGdEmWKJEoWPy3I29OFswZsoGsl1'; // ouallinone@gmail.com, same as firestore.rules

const reply = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export default async (req) => {
  if (req.method !== 'POST') return reply(405, { error: 'POST only' });
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!idToken) return reply(401, { error: 'Sign in first.' });

  const check = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  }).catch(() => null);
  if (!check?.ok) return reply(401, { error: 'Your sign-in ran out. Sign in again.' });
  const uid = (await check.json()).users?.[0]?.localId;
  if (uid !== ADMIN_UID) return reply(403, { error: 'Not allowed.' });

  const hook = (globalThis.Netlify?.env.get('BUILD_HOOK_URL') ?? process.env.BUILD_HOOK_URL ?? '').trim();
  if (!/^https:\/\/api\.netlify\.com\/build_hooks\/\w+$/.test(hook)) return reply(500, { error: 'The website rebuild is not set up yet (BUILD_HOOK_URL is missing in Netlify).' });
  const res = await fetch(`${hook}?trigger_title=${encodeURIComponent('Content changed on /admin')}`, { method: 'POST' }).catch(() => null);
  return res?.ok ? reply(200, { ok: true }) : reply(502, { error: `Netlify did not accept the rebuild (${res?.status ?? 'no answer'}).` });
};

export const config = { path: '/api/rebuild' };
