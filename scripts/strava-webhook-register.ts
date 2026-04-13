/**
 * Register a Strava webhook push subscription. Run once per environment.
 *
 *   pnpm tsx scripts/strava-webhook-register.ts
 *
 * Required env (loaded from .env):
 *   STRAVA_CLIENT_ID
 *   STRAVA_CLIENT_SECRET
 *   STRAVA_VERIFY_TOKEN
 *   STRAVA_WEBHOOK_CALLBACK_URL — public URL pointing to
 *     http(s)://<tunnel>/api/integrations/strava/webhook
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && m[1] && !(m[1] in process.env)) {
        process.env[m[1]] = (m[2] ?? '').replace(/^"|"$/g, '');
      }
    }
  } catch {
    // .env optional
  }
}
loadEnvFile();

const {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_VERIFY_TOKEN,
  STRAVA_WEBHOOK_CALLBACK_URL,
} = process.env;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_VERIFY_TOKEN || !STRAVA_WEBHOOK_CALLBACK_URL) {
  console.error(
    'Missing env: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_VERIFY_TOKEN, STRAVA_WEBHOOK_CALLBACK_URL',
  );
  process.exit(1);
}

async function main() {
  const body = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID!,
    client_secret: STRAVA_CLIENT_SECRET!,
    callback_url: STRAVA_WEBHOOK_CALLBACK_URL!,
    verify_token: STRAVA_VERIFY_TOKEN!,
  });
  const res = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
    method: 'POST',
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Failed (${res.status}):`, json);
    process.exit(1);
  }
  console.log('Subscription created:', json);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
