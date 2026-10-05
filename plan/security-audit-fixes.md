# Security Audit Fixes

Goal: fix the issues found in the 2026-10-05 audit of `apps/api`, `apps/web` and `apps/my-auth-mobile`, in priority order. Each phase is shippable on its own; finish and verify a phase before starting the next.

## Progress

- [x] Phase 1 — Vulnerable dependencies (critical)
- [x] Phase 2 — Session revocation and per-device sessions (high)
- [x] Phase 3 — Theme CSS injection and admin user list (medium)
- [ ] Phase 4 — Hardening (low)

## Phase 1 — Upgrade vulnerable dependencies 🔴

`pnpm audit --prod` reports:

| Package       | Current | Fixed in | Latest | Issues                                                          |
| ------------- | ------- | -------- | ------ | --------------------------------------------------------------- |
| `next`        | 16.1.6  | ≥ 16.3.3 | 16.3.8 | Unauthenticated RCE (critical), proxy bypass, SSRF, several DoS |
| `drizzle-orm` | 0.43.1  | ≥ 0.45.2 | 0.45.3 | SQL injection via improperly escaped identifiers (high)         |

- [x] `apps/web/package.json`: `next` and `eslint-config-next` → `16.3.8`.
- [x] `apps/api/package.json`: `drizzle-orm` → `^0.45.3`; check `drizzle-kit` (`0.31.11`) is compatible.
- [x] `pnpm install`, then `pnpm audit --prod` shows no high/critical for `next` / `drizzle-orm`.
- [x] Also fixed transitive highs: `multer` direct dep `1.4.5-lts.2` → `^2.4.0`, `@tiptap/*` → `^3.31.4`, and `pnpm.overrides` in root `package.json` for `multer`, `js-yaml@4`, `fast-uri@3`, `qs`, `browserslist`, `dompurify` (pnpm 10.0 ignores overrides in `pnpm-workspace.yaml`). Audit now: 2 low, 1 moderate.
- [ ] Read the drizzle 0.44/0.45 release notes for breaking changes (type check and all tests pass, but release notes not reviewed yet).
- [x] `pnpm --filter api db:generate` reports "No schema changes".
- [x] `pnpm check-types && pnpm lint && pnpm test && pnpm build` pass.
- [ ] Manual smoke test: sign in, dashboard, user list, theme editor, site settings.

## Phase 2 — Sessions 🟠

### 2a. Access tokens must die with their session

Problem: `JwtStrategy.validate` only checks `users.isActive`. After logout, session revoke or password reset, the access token keeps working for up to 24h.

- [x] `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
    - Join `sessions` on `payload.sessionId`; reject if the session is missing, expired, or belongs to another user.
    - Single query: `select users.isActive from sessions inner join users ... where sessions.id = ? and sessions.userId = ? and sessions.expiredAt > now()`.
- [x] `apps/api/src/modules/auth/guards/optional-jwt-auth.guard.ts` — confirm it still treats a revoked session as anonymous (not 401).
- [x] Unit tests in `auth.service.spec.ts` / new `jwt.strategy.spec.ts`: revoked session → 401; expired session → 401; inactive user → 401.

### 2b. One session per login, not per user-agent

Problem: `AuthService.upsertSession` (`auth.service.ts:59`) reuses the session matching `userId + userAgent`, so two devices with the same browser share one session and log each other out.

- [x] Replace `upsertSession` with `createSession` that always inserts a new row (login + Google callback in `auth.controller.ts`).
- [x] Add cleanup of expired sessions (delete `expiredAt < now()` on login for that user, or a scheduled job).
- [x] Update affected specs.

### 2c. Changing password revokes other sessions

- [x] `apps/api/src/modules/user/user.service.ts` `updatePassword`: after updating the hash, delete sessions for the user except the current `sessionId` (pass it from the controller).
- [x] Spec: other sessions removed, current one kept.

## Phase 3 — Medium 🟡

### 3a. Theme CSS injection (stored XSS)

Problem: `radius` (`@IsString()`, no limit) and `fontFamily` (any 100 chars) are written unescaped into `<style>` on every page (`apps/web/src/app/layout.tsx:62`, `apps/web/src/app/page.tsx`, `apps/web/src/app/maintenance-page.tsx`). An admin account can inject `</style><script>…`.

- [x] `apps/api/src/modules/theme/dto/create-theme.dto.ts`
    - `radius`: `@Matches(/^\d{1,2}(\.\d{1,4})?$/)` (editor sends strings like `'0.625'`).
    - `fontFamily`: `@Matches(/^[A-Za-z0-9 -]+$/)`.
- [x] Check `update-theme.dto.ts` inherits the same rules.
- [x] Defense in depth on the web side: in `apps/web/src/lib/active-theme-server.ts` and `apps/web/src/lib/theme-utils.ts`, drop any value that is not a hex color / number / safe font name before building CSS.
- [ ] Check existing DB rows: extend `db:verify-themes` to flag invalid `radius` / `fontFamily` (seeds are valid; web now skips an invalid theme and falls back to default CSS).
- [x] Spec: DTO rejects `radius: "0.5;}</style><script>"`.

### 3b. Admin user list

Problem in `user.service.ts` `getAllUsers`:

- [x] `total` ignores the search filter → apply the same `where` to the count query.
- [x] `LEFT JOIN user_roles/roles` duplicates users with multiple roles → `groupBy(users.id)` with `role: min(roles.name)`. Kept the single `role` field since `assignRoleToUser` enforces one role per user; no web change needed.
- [x] Cap `limit` (e.g. `Math.min(limit, 100)`, `page >= 1`).
- [x] Escape `%` and `_` in `search` before `ilike`.
- [x] Spec: search total, multi-role user appears once, limit capped.

## Phase 4 — Hardening 🟢

- [ ] Refresh token rotation with reuse detection: store a `refreshTokenHash` / version on the session; a reused old refresh token revokes the session.
- [ ] Maintenance mode applied to all public routes (e.g. in `apps/web/src/proxy.ts` or a shared public layout), not only `page.tsx`. Admins still allowed through.
- [ ] Google login: only link to an existing account when `profile.emails[0].verified === true`; otherwise reject.
- [ ] `adminDeleteUser` / `adminUpdateUser`: block deleting or deactivating yourself and the last remaining admin.
- [ ] Swagger title still says "AI Finance API v2" in `apps/api/src/main.ts`, so rename it.

## Verification

1. `pnpm check-types && pnpm lint && pnpm format:check && pnpm test && pnpm build`.
2. `pnpm audit --prod`: no critical/high.
3. Session matrix in `plan/auth-security-verification.md`, with these rows now expected to pass:
    - [ ] Logout → old access token gets `401` immediately.
    - [ ] Revoke session from another device → that device gets `401` on next request.
    - [ ] Password reset → old access and refresh tokens rejected.
    - [ ] Two devices, same browser → two separate sessions; logging out one keeps the other.
4. Theme editor: saving a malicious `radius` / `fontFamily` returns `400`; normal themes still save and render.
5. Admin users: search pagination total correct; multi-role user shown once.
6. Update `status.md` checklist (Authentication: "Rate limiting and abuse protection reviewed", "Refresh-token/session behavior fully verified").
