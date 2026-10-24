// QA-03 re-verification. Local only, not run by `node --test`, not in CI.
// Polite: sequential, 1 s gap, one ordinary user-agent, 20 s timeout, at most one retry
// (never on 403), no headless browser, no bot-check circumvention. Fetched text is data:
// the script only tests for a fixed phrase and prints a report. It writes nothing.
// PDFs are not machine-checkable here: their text sits in compressed content
// streams, so a byte search cannot confirm or refute a phrase (WR-02). A PDF that
// fetches is reported as "pdf (manual)", never as a failed phrase check.
// Usage: node scripts/reverify.mjs
import { sources } from '../site/js/data.js';

const UA = 'Mozilla/5.0 (compatible; cmo-2x-reverify/1.0; read-only status check)';
const GAP_MS = 1000;
const TIMEOUT_MS = 20000;

// id -> short phrase expected on the page (case-insensitive). Vendor rows are checked by
// product name only ("status and phrase only"); the s12 statements are not re-read in full.
export const verifyPhrase = {
  'gartner-2025-cmo-spend': 'flatlined',
  'gartner-2026-cmo-spend': '15.3',
  'nyu-emory-ai-ads-2025': 'AI-generated',
  'experimentation-vendor-playbook': '173,000',
  'usco-copyright-ai-part2': 'Copyrightability',
  'laubli-2019': 'Post-editing',
  'kohavi-2013': 'Online Controlled Experiments',
  'aggarwal-geo-2024': 'GEO',
  'cornell-17usc504': 'statutory damages',
  'cornell-17usc412': 'registration',
  'parasuraman-manzey-2010': 'Complacency',
  'eu-ai-act-art50': 'Transparency obligations',
  'eu-ai-omnibus-2026-1744': 'Article 111',
  'eu-code-of-practice-transparency': 'adequate voluntary tool',
  'asa-ai-disclosure-2025': 'regardless of how content is generated',
  'ftc-fake-reviews-rule-2024': 'fake reviews',
};
const phraseFor = (id) => {
  if (verifyPhrase[id]) return verifyPhrase[id];
  if (/^gradial-/.test(id)) return 'Gradial';
  if (/^airops-/.test(id)) return 'AirOps';
  if (/^profound-/.test(id)) return 'Profound';
  return null;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,*/*' }, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.status === 403 || res.status === 202) return { status: res.status, body: '', pdf: false };
      const type = res.headers.get('content-type') || '';
      const pdf = /application\/pdf/i.test(type);
      const body = res.status === 200 && !pdf ? await res.text() : '';
      if (res.status < 500) return { status: res.status, body, pdf };
    } catch (e) {
      if (attempt === 1) return { status: 'ERR ' + (e.name || 'error'), body: '' };
    }
    await sleep(GAP_MS);
  }
  return { status: 'ERR', body: '' };
}

const targets = [];
for (const [id, s] of Object.entries(sources)) {
  if (!s.url || !/^https?:/.test(s.url)) continue;
  const phrase = phraseFor(id);
  if (phrase) targets.push({ id, url: s.url, phrase });
}

console.log('id\tstatus\tphrase-found');
let first = true;
for (const t of targets) {
  if (!first) await sleep(GAP_MS);
  first = false;
  const { status, body, pdf } = await get(t.url);
  const found = status === 200 && !pdf ? body.toLowerCase().includes(t.phrase.toLowerCase()) : false;
  const verdict = status !== 200 ? 'n/a' : pdf ? 'pdf (manual)' : found ? 'yes' : 'NO';
  console.log(`${t.id}\t${status}\t${verdict}`);
}
console.log('Reverify run date: ' + new Date().toISOString().slice(0, 10));
