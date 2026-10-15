import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL is not set. Copy .env.example and restart Expo.');

const API_ROOT = `${API_URL}/api`;

export type ApiEnvelope<T> = {
  status: 'success' | 'error';
  message: string;
  data: T;
};

const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

let refreshInFlight: Promise<string | null> | null = null;

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
      } catch {
        await clearAccessToken();
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
