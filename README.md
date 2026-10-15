# Nest Auth

Full-stack authentication and admin dashboard monorepo.

Built with NestJS, Next.js, PostgreSQL, Drizzle ORM, React Query, React Hook Form, Zod, Tailwind CSS, and pnpm workspaces.

## Features

- Email/password authentication
- Account verification
- Forgot/reset password flow
- Google OAuth support
- Short-lived JWT access tokens (15 minutes) with rotating 30-day refresh tokens and reuse detection
- httpOnly, SameSite cookies; the browser never handles tokens directly
- Per-visitor rate limiting on auth endpoints
- User profile and avatar management
- Email and password management
- Session/connections management
- Role-based access control
- User, role, and permission administration
- Role-permission matrix
- Site settings management, including maintenance mode
- Admin notifications for new sign-ups
- Theme management with light/dark/system modes
- Monochrome (Vercel-style) default theme
- Responsive admin sidebar and dashboard layout
- Responsive account and settings navigation
- Search, filtering, multi-role filtering, and table/grid views
- Reusable custom UI form components
- GitHub Actions validation workflow

## Project structure

```text
.
├── apps/
│   ├── api/                     # NestJS API
│   │   ├── drizzle/             # SQL migrations
│   │   └── src/
│   │       ├── common/          # Guards, decorators, filters, helpers
│   │       ├── database/        # Drizzle schema, seeds
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   ├── user/
│   │       │   ├── rbac/
│   │       │   ├── session/
│   │       │   ├── theme/
│   │       │   ├── site-settings/
│   │       │   ├── notification/
│   │       │   └── admin-stats/
│   │       ├── shared/          # Mail (Resend) and Cloudinary services
│   │       └── main.ts
│   ├── web/                     # Next.js frontend
│   │   └── src/
│   │       ├── app/             # App Router routes and layouts
│   │       │   └── api/[...path]/  # Proxy from the browser to the API
│   │       ├── components/      # Shared UI and layout components
│   │       ├── features/        # Feature-specific pages and services
│   │       ├── providers/       # Auth, theme, and query providers
│   │       └── proxy.ts         # Route protection and access-token refresh
│   └── mobile/                  # Expo app (own lockfile, not in pnpm workspace)
├── packages/
│   └── shared/                  # Shared constants and types (@nest-auth/shared)
├── .github/workflows/           # CI workflows
├── status.md                    # Project checklist
├── package.json                 # Workspace scripts
├── pnpm-workspace.yaml
└── turbo.json
```

## Requirements

- Node.js 22+
- pnpm 10+
- PostgreSQL 14+

Check the package manager version:

```bash
pnpm --version
```

## Installation

Clone the repository, then install dependencies from the project root:

```bash
pnpm install
```

Create the API and web environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

On Windows PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

Update `apps/api/.env` with a valid PostgreSQL connection and JWT secrets.

## Environment variables

### API

The API example file is:

```text
apps/api/.env.example
```

Important variables:

```env
NODE_ENV=development
PORT=4001
DATABASE_URL=postgresql://user:password@localhost:5432/api_v2_db
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
FRONTEND_ORIGIN=http://localhost:3000
```

Optional Google OAuth variables:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4001/api/auth/google/callback
GOOGLE_MOBILE_CALLBACK_URL=
MOBILE_APP_SCHEMES=myauthmobile
```

Locally the callback can point straight at the API. In production it must go through the web app's proxy (`https://<web-domain>/api/auth/google/callback`), because the auth cookies and the OAuth `state` cookie live on the web domain. Register the same URL in the Google Cloud console.

The mobile app uses the same Google client and callback, so it needs no extra Google setup. It opens the sign-in in the system browser, which ends on the app's deep link (`MOBILE_APP_SCHEMES`, default `myauthmobile`, the `scheme` in `app.json`). Expo Go's `exp://` links are also accepted outside production. The phone's browser has to reach the callback, and Google only accepts `localhost` or public HTTPS addresses, so a `localhost` callback only works on the iOS simulator. To test on a real phone or the Android emulator, give the app its own callback through a tunnel while the web keeps using `localhost`:

1. Start a tunnel to the API: `ngrok http 8000` (free accounts get one fixed domain: `ngrok http 8000 --url=<your-domain>.ngrok-free.app`).
2. In `apps/api/.env`, set `GOOGLE_MOBILE_CALLBACK_URL=https://<tunnel-domain>/api/auth/google/callback` and restart the API.
3. Add that URL under **Authorized redirect URIs** of the OAuth client in the Google Cloud console. Changes can take a few minutes.

`EXPO_PUBLIC_API_URL` stays on your LAN address. Only the browser part of the sign-in goes through the tunnel. ngrok's free plan shows a one-time "You are about to visit" page in the phone's browser; tap **Visit Site**.

Optional email variables:

```env
RESEND_API_KEY=
MAIL_FROM=noreply@yourdomain.com
```

Optional Cloudinary variables, used for avatar, role image, and site asset uploads:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Proxy secret shared with the web app:

```env
PROXY_SECRET=
```

Generate it with `openssl rand -hex 32` and use the same value in both apps. The web proxy sends it with the visitor's IP, and the API only trusts that IP when the secret matches. Without it the API still works, but every web visitor shares one rate limit and session IPs show the web server's address.

### Web

The web example file is:

```text
apps/web/.env.example
```

```env
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4001/api
PROXY_SECRET=
```

`PROXY_SECRET` has no `NEXT_PUBLIC_` prefix, so it stays on the server.

Never commit real secrets, production credentials, or private OAuth keys.

## Database setup

Create the PostgreSQL database first, then configure `DATABASE_URL`.

Push the current schema:

```bash
pnpm db:push
```

Generate migration files:

```bash
pnpm db:generate
```

Run migrations:

```bash
pnpm db:migrate
```

Seed preset themes and development users:

```bash
pnpm db:seed
```

Seed users only:

```bash
pnpm --filter api db:seed:users
```

Open Drizzle Studio:

```bash
pnpm db:studio
```

Use either `db:push` or migrations as appropriate for the environment. Production runs migrations (see `railway.json`). Do not run development seeds against production unless intentionally reviewed.

Migration `0004_normalize_user_emails` lowercases stored emails. It fails if two accounts differ only by letter case, so check first:

```sql
SELECT lower(trim(email)), array_agg(email) FROM users GROUP BY 1 HAVING count(*) > 1;
```

## Development

Start both applications:

```bash
pnpm dev
```

Start the API only:

```bash
pnpm dev:api
```

Start the web app only:

```bash
pnpm dev:web
```

Default development URLs:

```text
Web: http://localhost:3000
API: http://localhost:4001
```

## Development login

Seeded development users share this password:

```text
Password123!
```

Admin account:

```text
Email: admin@example.com
Password: Password123!
```

Other seeded accounts include:

```text
participant@example.com
instructure@example.com
projectowner@example.com
projectmember@example.com
projectmentor@example.com
investor@example.com
```

These credentials are for local development only. Change or remove them before deployment.

## Validation

Run all repository checks:

```bash
pnpm check-types
pnpm lint
pnpm format:check
pnpm build
```

Run tests:

```bash
pnpm test
```

Format files:

```bash
pnpm format:write
```

The CI workflow runs on pushes and pull requests targeting `main`:

```text
.github/workflows/ci.yml
```

## API scripts

From the project root, use the workspace commands above. From `apps/api/`:

```bash
pnpm dev
pnpm build
pnpm check-types
pnpm test
pnpm db:push
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

## Web scripts

From `apps/web/`:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm check-types
pnpm format:check
pnpm format:write
```

## Main routes

Public routes:

```text
/signin
/signup
/forgot-password
/reset-password
/confirm-account
```

Protected dashboard routes:

```text
/dashboard
/dashboard/account
/dashboard/users
/dashboard/roles
/dashboard/permissions
/dashboard/themes
/dashboard/settings
/dashboard/statistics
/dashboard/analytics
```

## Architecture notes

### Authentication flow

- Login sets three httpOnly cookies: `accessToken` (JWT, 15 minutes), `refreshToken` (JWT, 30 days), and `deviceId` (identifies the browser so signing in again replaces its old session).
- Every request with an access token is checked against the `sessions` table, so logout, session revocation, password changes, and account deactivation take effect immediately.
- Refresh tokens rotate on every use. Replaying an already-used refresh token ends the session. Parallel requests get a 30-second grace window.
- The browser calls the API through the Next.js route `apps/web/src/app/api/[...path]/route.ts`, so cookies stay on the web domain. Server components call the API directly and forward the cookies.
- `apps/web/src/proxy.ts` runs before every page, server action, and `/api` call. If the access token is missing or about to expire, it refreshes it and passes the new cookies to both the browser and the current request. A rejected refresh redirects to `/session-expired`, which clears the cookies.
- The mobile app sends `X-Client: mobile` and its own `X-Device-Id`. For those requests the API sets no cookies and returns the refresh token in the response body; the app keeps both tokens in SecureStore (Keychain / Keystore), sends the access token as a bearer header, and refreshes on a 401 by posting `{ refreshToken }` to `/auth/refresh`. A refresh token is only returned in a body when one was sent in the body, so a script in a browser can't swap the httpOnly cookie for a readable token.
- Google sign-in on mobile: `POST /auth/google/mobile/start` returns a browser URL and a secret verifier. The browser runs the normal Google flow and returns to the app's deep link with a 2-minute, single-use code. The app trades the code and verifier for a session at `POST /auth/google/mobile/exchange`. The verifier never passes through the browser, so a code caught by another app is useless.

### Security notes

- Emails are lowercased and trimmed everywhere, so `Ann@x.com` and `ann@x.com` are the same account.
- Verification and reset codes are stored as SHA-256 hashes. A successful reset deletes every outstanding reset code for that user.
- Login compares against a dummy bcrypt hash for unknown emails, so response time doesn't reveal which accounts exist.
- Sign-up answers "Check your email to continue" whether or not the email is taken. If it is, the owner gets an email with a sign-in link and a password reset link instead of a verification link. Forgot-password also gives the same answer for every email.
- Following a password reset link also marks the email as verified, since the link arrived at that address.
- Uploads are checked by their actual bytes, not the browser-supplied type. Avatars and role images accept JPEG, PNG, WebP, and GIF; site assets also accept ICO and SVG, and SVGs containing scripts or event handlers are rejected.
- Google sign-in requires a Google-verified email and checks the OAuth `state` parameter. Signing in with Google to an account whose email was never verified clears that account's password and pending codes.
- The `admin` and `user` roles cannot be renamed or deleted, and admins cannot change their own role, deactivate themselves, or delete themselves.

### Roles and permissions

Admin endpoints are guarded by `@Permissions()` (`apps/api/src/common/guards/permissions.guard.ts`). The `admin` role passes every check. Any other role gets exactly the permissions granted to it on the Roles page:

| Permission        | Allows                                              |
| ----------------- | --------------------------------------------------- |
| `user:read`       | List users and role names                           |
| `user:create`     | Create users                                        |
| `user:update`     | Edit users, activate or deactivate them             |
| `user:delete`     | Delete users                                        |
| `role:manage`     | Manage roles and permissions, assign roles to users |
| `theme:manage`    | Create, edit, activate, and delete themes           |
| `settings:manage` | Edit site settings and upload or delete site assets |
| `stats:read`      | View dashboard statistics                           |

- Only admins can edit, delete, or change the role of an admin account, or assign the admin role.
- Choosing a role while creating a user also needs `role:manage`.
- `role:manage` lets a role grant itself any permission, so treat it as near-admin access.
- Notifications stay admin-only.
- Permission names live in `packages/shared/src/rbac.ts` and are shared by the API and the web sidebar.

### Server and client layouts

`apps/web/src/app/(protected)/(admin)/layout.tsx` remains a server layout so it can export route metadata.

`apps/web/src/app/(protected)/(admin)/dashboard/layout-client.tsx` contains the client-side dashboard shell. It controls responsive sidebar state and renders the shared sidebar, header, and nested dashboard page.

Interactive pieces are separated into reusable components under:

```text
apps/web/src/components/layouts/backend/
```

### Theme system

The default theme is Monochrome. Theme values are defined across:

```text
apps/web/src/app/globals.css
apps/api/src/modules/theme/theme.service.ts
apps/api/src/database/seeds/theme.seed.ts
apps/web/src/features/admin/themes/ThemeEditor.tsx
```

The database-backed theme provider can override CSS defaults after the active theme loads.

### Custom UI components

Reusable controls live under:

```text
apps/web/src/components/ui-custom/
```

Prefer these components for new application forms, including:

- `UiFormInput`
- `UiFormTextarea`
- `UiFormPassword`
- `UiFormSwitch`
- `UiFormSearchSelect`
- `UiCheckbox`
- `UiButton`
- `UiImage`
- `UiViewToggle`

Keep native controls for browser-specific controls such as color inputs and hidden file inputs when required.

## Production checklist

- [ ] Set production `NODE_ENV`.
- [ ] Use strong random JWT secrets.
- [ ] Set the same `PROXY_SECRET` on the API and the web app.
- [ ] Configure a production PostgreSQL database.
- [ ] Configure production frontend/API origins.
- [ ] Point `GOOGLE_CALLBACK_URL` at the web app's `/api/auth/google/callback` and register it with Google.
- [ ] Configure email delivery and sender domain.
- [ ] Configure Cloudinary if image uploads are enabled.
- [ ] Remove development credentials and seed data.
- [ ] Run migrations deliberately; check for case-duplicate emails before `0004`.
- [ ] After `0005`, non-admin roles have no permissions; grant what each role needs on the Roles page.
- [ ] Run type, lint, formatting, test, and build checks.
- [ ] Configure deployment for the selected hosting provider.
- [ ] Enable HTTPS and secure cookie settings.
- [ ] Review CORS, rate limits, logging, and error exposure.

## License

Private project. Add the project license here before public distribution.
