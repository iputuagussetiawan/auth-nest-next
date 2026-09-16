# Nest Auth

Full-stack authentication and admin dashboard monorepo.

Built with NestJS, Next.js, PostgreSQL, Drizzle ORM, React Query, React Hook Form, Zod, Tailwind CSS, and pnpm workspaces.

## Features

- Email/password authentication
- Account verification
- Forgot/reset password flow
- Google OAuth support
- JWT authentication with refresh tokens
- User profile and avatar management
- Email and password management
- Session/connections management
- Role-based access control
- User, role, and permission administration
- Role-permission matrix
- Site settings management
- Theme management with light/dark/system modes
- Emerald Forest default theme
- Responsive admin sidebar and dashboard layout
- Responsive account and settings navigation
- Search, filtering, multi-role filtering, and table/grid views
- Reusable custom UI form components
- GitHub Actions validation workflow

## Project structure

```text
.
├── api/                         # NestJS API
│   └── src/
│       ├── database/            # Drizzle schema, migrations, seeds
│       ├── modules/
│       │   ├── auth/
│       │   ├── user/
│       │   ├── rbac/
│       │   ├── session/
│       │   ├── theme/
│       │   ├── site-settings/
│       │   └── admin-stats/
│       └── main.ts
├── web/                         # Next.js frontend
│   └── src/
│       ├── app/                 # App Router routes and layouts
│       ├── components/          # Shared UI and layout components
│       ├── features/            # Feature-specific pages and services
│       └── providers/           # Auth, theme, and query providers
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

Create the API environment file:

```bash
cp api/.env.example api/.env
```

On Windows PowerShell:

```powershell
Copy-Item api/.env.example api/.env
```

Update `api/.env` with a valid PostgreSQL connection and JWT secrets.

## Environment variables

The API example file is:

```text
api/.env.example
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
```

Optional email variables:

```env
RESEND_API_KEY=
MAIL_FROM=noreply@yourdomain.com
```

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

Use either `db:push` or migrations as appropriate for the environment. Do not run development seeds against production unless intentionally reviewed.

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

From the project root, use the workspace commands above. From `api/`:

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

From `web/`:

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

### Server and client layouts

`web/src/app/(protected)/(admin)/layout.tsx` remains a server layout so it can export route metadata.

`web/src/app/(protected)/(admin)/dashboard/layout-client.tsx` contains the client-side dashboard shell. It controls responsive sidebar state and renders the shared sidebar, header, and nested dashboard page.

Interactive pieces are separated into reusable components under:

```text
web/src/components/layouts/backend/
```

### Theme system

The default theme is Emerald Forest. Theme values are defined across:

```text
web/src/app/globals.css
api/src/modules/theme/theme.service.ts
api/src/database/seeds/theme.seed.ts
web/src/features/admin/themes/ThemeEditor.tsx
```

The database-backed theme provider can override CSS defaults after the active theme loads.

### Custom UI components

Reusable controls live under:

```text
web/src/components/ui-custom/
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
- [ ] Configure a production PostgreSQL database.
- [ ] Configure production frontend/API origins.
- [ ] Configure Google OAuth callback URLs.
- [ ] Configure email delivery and sender domain.
- [ ] Configure Cloudinary if image uploads are enabled.
- [ ] Remove development credentials and seed data.
- [ ] Run migrations deliberately.
- [ ] Run type, lint, formatting, test, and build checks.
- [ ] Configure deployment for the selected hosting provider.
- [ ] Enable HTTPS and secure cookie settings.
- [ ] Review CORS, rate limits, logging, and error exposure.

## License

Private project. Add the project license here before public distribution.
