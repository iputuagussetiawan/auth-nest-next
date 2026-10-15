import { apiFetch } from '@/lib/api';
import type { AuthUser } from '@/lib/auth-api';

/** One signed-in device, as GET /user/me and GET /sessions return it */
export type Session = {
  id: string;
  isCurrent: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  browser: string;
  os: string;
  device: string;
  lastActiveAt: string;
  createdAt: string;
};

/** The full profile from GET /user/me */
export type Profile = AuthUser & {
  isEmailVerified: boolean;
  provider: 'email' | 'google' | string;
  lastLogin: string | null;
  createdAt: string;
  role: string | null;
  sessions: Session[];
};

export const accountApi = {
  profile: () => apiFetch<Profile>('/user/me'),
  revokeSession: (id: string) => apiFetch<null>(`/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  revokeOtherSessions: () => apiFetch<null>('/sessions/others', { method: 'DELETE' }),
};
