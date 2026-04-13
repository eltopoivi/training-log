export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}/api${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has('content-type') && init.body && typeof init.body === 'string') {
    headers.set('content-type', 'application/json');
  }
  // Mock auth: the API resolves the seed user when x-user-id is absent,
  // so we don't set a hardcoded id here. When multi-user lands this becomes
  // a real session cookie.
  const res = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
    credentials: 'include',
  });
  const ct = res.headers.get('content-type') ?? '';
  const body = ct.includes('application/json') ? await res.json().catch(() => undefined) : undefined;
  if (!res.ok) {
    throw new ApiError(`API ${res.status} ${res.statusText}`, res.status, body);
  }
  return body as T;
}
