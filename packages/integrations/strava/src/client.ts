import type {
  StravaActivityDetailed,
  StravaActivitySummary,
  StravaLap,
  StravaStreams,
  StravaTokenResponse,
  StravaTokens,
} from './types.js';

const STRAVA_BASE = 'https://www.strava.com';
const API_BASE = `${STRAVA_BASE}/api/v3`;

export class StravaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAfter?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'StravaApiError';
  }
}

async function stravaFetch(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const retryAfterRaw = res.headers.get('retry-after');
    const retryAfter = retryAfterRaw ? Number(retryAfterRaw) : undefined;
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => undefined);
    }
    throw new StravaApiError(
      `Strava ${res.status} ${res.statusText}`,
      res.status,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
      body,
    );
  }
  return res;
}

export async function exchangeCode(params: {
  clientId: string;
  clientSecret: string;
  code: string;
}): Promise<StravaTokens> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    code: params.code,
    grant_type: 'authorization_code',
  });
  const res = await stravaFetch(`${STRAVA_BASE}/oauth/token`, {
    method: 'POST',
    body,
  });
  const json = (await res.json()) as StravaTokenResponse;
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: new Date(json.expires_at * 1000),
    athleteId: json.athlete?.id != null ? String(json.athlete.id) : undefined,
  };
}

export async function refreshAccessToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<StravaTokens> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    refresh_token: params.refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await stravaFetch(`${STRAVA_BASE}/oauth/token`, {
    method: 'POST',
    body,
  });
  const json = (await res.json()) as StravaTokenResponse;
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: new Date(json.expires_at * 1000),
  };
}

function authHeaders(token: string): HeadersInit {
  return { authorization: `Bearer ${token}` };
}

export async function listActivities(
  token: string,
  opts: { perPage?: number; page?: number } = {},
): Promise<StravaActivitySummary[]> {
  const params = new URLSearchParams({
    per_page: String(opts.perPage ?? 30),
    page: String(opts.page ?? 1),
  });
  const res = await stravaFetch(`${API_BASE}/athlete/activities?${params}`, {
    headers: authHeaders(token),
  });
  return (await res.json()) as StravaActivitySummary[];
}

export async function getActivity(
  token: string,
  id: string | number,
): Promise<StravaActivityDetailed> {
  const res = await stravaFetch(`${API_BASE}/activities/${id}?include_all_efforts=false`, {
    headers: authHeaders(token),
  });
  return (await res.json()) as StravaActivityDetailed;
}

export async function getStreams(token: string, id: string | number): Promise<StravaStreams> {
  const keys = 'time,distance,latlng,altitude,heartrate,watts,cadence,temp';
  const params = new URLSearchParams({ keys, key_by_type: 'true' });
  const res = await stravaFetch(`${API_BASE}/activities/${id}/streams?${params}`, {
    headers: authHeaders(token),
  });
  return (await res.json()) as StravaStreams;
}

export async function getLaps(token: string, id: string | number): Promise<StravaLap[]> {
  const res = await stravaFetch(`${API_BASE}/activities/${id}/laps`, {
    headers: authHeaders(token),
  });
  return (await res.json()) as StravaLap[];
}
