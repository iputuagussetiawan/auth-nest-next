import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL is not set. Copy .env.example and restart Expo.');
// Passwords and tokens go over this connection; plain http is only acceptable while developing
if (!__DEV__ && !API_URL.startsWith('https://')) {
  throw new Error('EXPO_PUBLIC_API_URL must use https:// in release builds.');
}

const API_ROOT = `${API_URL}/api`;

export type ApiEnvelope<T> = {
  status: 'success' | 'error';
  message: string;
  data: T;
};

// Requests that must not trigger a refresh-and-retry. Logout is not one of them: with an expired
// access token it would fail and leave the server session alive.
const AUTH_PATHS = ['/auth/login', '/auth/refresh'];

let refreshInFlight: Promise<string | null> | null = null;

const sessionExpiredListeners = new Set<() => void>();

/** Called when the server refuses to refresh, i.e. the session is over. Returns an unsubscribe. */
export function onSessionExpired(listener: () => void) {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError('Unexpected server response', response.status);
  }
  const envelope = body as Partial<ApiEnvelope<T>>;
  if (!response.ok || envelope.status === 'error') {
    throw new ApiError(envelope.message || 'Request failed', response.status);
  }
  return { status: 'success', message: envelope.message ?? '', data: envelope.data as T };
}

async function requestRefresh(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_ROOT}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        const result = await parseEnvelope<{ access_token: string }>(response);
        await setAccessToken(result.data.access_token);
        return result.data.access_token;
      } catch (error) {
        // Only a refusal ends the session; a network blip keeps the stored token for next time
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          await clearAccessToken();
          sessionExpiredListeners.forEach((listener) => listener());
        }
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; retry?: boolean } = {},
): Promise<ApiEnvelope<T>> {
  const token = await getAccessToken();
  let response: Response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new ApiError(
      `Could not reach the server at ${API_URL}. Check EXPO_PUBLIC_API_URL, that the API is running, and that this device can reach that host.`,
      0,
    );
  }

  if (response.status === 401 && !AUTH_PATHS.includes(path) && options.retry !== false) {
    const newToken = await requestRefresh();
    if (newToken) return apiFetch<T>(path, { ...options, retry: false });
  }

  return parseEnvelope<T>(response);
}
