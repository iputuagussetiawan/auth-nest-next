# Improve Auth — Onboarding Redirect (Local + Google)

Goal: after a successful login (local email/password or Google OAuth), first-time users are redirected to a multi-step onboarding wizard at `/onboarding`. Returning users go straight to `/dashboard`.

## 1. API — track onboarding completion

- `api/src/database/schema/auth/users.schema.ts`
    - New column `isOnboardingCompleted: boolean('is_onboarding_completed').default(false).notNull()`.
    - Generate migration: `pnpm --filter api db:generate`, then apply with `db:push` (dev) or `db:migrate`.
- `api/src/modules/auth/auth.controller.ts`
    - `login()` response now includes `isOnboardingCompleted`.
    - `googleCallback()` redirects to `/onboarding` when `!user.isOnboardingCompleted`, else `/dashboard`.
- `api/src/modules/user/user.controller.ts` + `user.service.ts`
    - New `PATCH /user/onboarding` → `completeOnboarding()` sets the flag (`JwtAuthGuard` already on controller).
    - `getMe()` returns `isOnboardingCompleted`.
- `api/src/database/seeds/user.seed.ts` — seeded users get `isOnboardingCompleted: true` so dev accounts skip the wizard.

## 2. Web — redirect after login (both strategies)

- `web/src/features/auth/components/SigninForm.tsx`
    - `onSuccess` reads `response.data.user.isOnboardingCompleted`; `false` → push `/onboarding`, else `/dashboard`.
- Google: `auth.controller.ts` callback decides the redirect server-side; `google-sign-in.tsx` unchanged.
- `web/src/proxy.ts` — unchanged; `/onboarding` already in `protectedRoutes` (auth required).

## 3. Web — onboarding wizard

- New `web/src/app/(protected)/onboarding/page.tsx` → renders `OnboardingWizard`.
- New `web/src/features/onboarding/components/OnboardingWizard.tsx`
    - Steps: 1) Profile (first/last name prefilled from `/user/me`), 2) Appearance (public themes from `/themes/list`, sets preference via `/themes/preference`).
    - Finish → `PATCH /user/onboarding`, invalidate `user` query, push `/dashboard`.
    - Guard: if `me.isOnboardingCompleted` is already true → `router.replace('/dashboard')`.
- `web/src/features/auth/services/AuthService.ts` — `completeOnboarding()` calls `PATCH /api/user/onboarding`.
- `web/src/features/auth/types/AuthType.ts` — `ILoginResponse` includes `user.isOnboardingCompleted`.

## Verification

1. `pnpm --filter api db:generate` then `db:push`.
2. Fresh local user (register + verify) → login lands on `/onboarding`; finish wizard → `/dashboard`; logout/login → straight to `/dashboard`.
3. New Google account → callback lands on `/onboarding`; existing → `/dashboard`.
4. Visiting `/onboarding` already completed → auto-redirect to `/dashboard`; unauthenticated → `/signin`.
5. `pnpm --filter api check-types` and `pnpm --filter web check-types`.
