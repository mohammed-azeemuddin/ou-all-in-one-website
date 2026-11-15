import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// EEA, UK and Switzerland: ads and analytics cookies start "denied" until the visitor answers
// Google's consent message (set up in AdSense > Privacy & messaging). Everywhere else starts "granted".
const CONSENT_REGIONS = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'];

/**
 * Adds Google Analytics 4 and AdSense to every page (index.html, and so every pre-rendered page),
 * and writes /ads.txt. Each part is added only when its ID is set:
 *   GA_ID=G-XXXXXXXXXX            Google Analytics 4 measurement ID
 *   ADSENSE_CLIENT=ca-pub-NNNNN   AdSense publisher ID
 * Set them in netlify.toml [build.environment] (they are public IDs) or in a local .env file.
 */
function googleTags(env) {
  const ga = (env.GA_ID || '').trim();
  const ads = (env.ADSENSE_CLIENT || '').trim();
  if (ga && !/^G-[A-Z0-9]+$/.test(ga)) throw new Error(`GA_ID "${ga}" should look like G-XXXXXXXXXX`);
  if (ads && !/^ca-pub-\d+$/.test(ads)) throw new Error(`ADSENSE_CLIENT "${ads}" should look like ca-pub-1234567890123456`);

  const denied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  const granted = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' };
  const tags = [];
  if (ga || ads) {
    tags.push({
      tag: 'script',
      children: [
        'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}',
        `gtag('consent','default',${JSON.stringify({ ...denied, region: CONSENT_REGIONS, wait_for_update: 500 })});`,
        `gtag('consent','default',${JSON.stringify(granted)});`,
        ga ? `gtag('js',new Date());gtag('config','${ga}');` : '',
      ].join(''),
      injectTo: 'head',
    });
  }
  if (ga) tags.push({ tag: 'script', attrs: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${ga}` }, injectTo: 'head' });
  if (ads) {
    tags.push({ tag: 'meta', attrs: { name: 'google-adsense-account', content: ads }, injectTo: 'head' });
    tags.push({ tag: 'script', attrs: { async: true, src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads}`, crossorigin: 'anonymous' }, injectTo: 'head' });
  }

  return {
    name: 'google-tags',
    transformIndexHtml: () => tags,
    generateBundle() {
      if (!ads) return;
      this.emitFile({
        type: 'asset',
        fileName: 'ads.txt',
        source: `google.com, ${ads.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return { plugins: [react(), googleTags(env)] };
});
