import { apiFetch } from '@/lib/api';

export type AuthUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  profilePicture: string | null;
  isActive: boolean;
  isOnboardingCompleted: boolean;
};

type LoginData = { user: AuthUser; access_token: string };

export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    apiFetch<null>('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    apiFetch<LoginData>('/auth/login', { method: 'POST', body: data }),

  logout: () => apiFetch<null>('/auth/logout', { method: 'POST' }),

  forgotPassword: (data: { email: string }) =>
    apiFetch<null>('/auth/password/forgot', { method: 'POST', body: data }),

  me: () => apiFetch<AuthUser>('/user/me'),
};
