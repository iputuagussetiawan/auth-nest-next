# Project Status

Updated: 2026-09-16

## Checklist

### Core setup

- [x] pnpm workspace configured
- [x] Turborepo scripts configured
- [x] API and web applications present
- [x] Environment example available
- [x] GitHub Actions validation workflow added
- [ ] Production deployment configured
- [ ] Production secrets configured

### Authentication

- [x] Sign in
- [x] Sign up
- [x] Forgot password
- [x] Reset password
- [x] Confirm account
- [x] Google sign-in flow
- [x] Custom UI components used in auth forms
- [ ] Refresh-token/session behavior fully verified in production
- [ ] Rate limiting and abuse protection reviewed

### User account

- [x] Profile name update
- [x] Profile avatar update
- [x] Email management
- [x] Password management
- [x] Session/connections view
- [x] Account preferences
- [x] Responsive account tab navigation

### Admin dashboard

- [x] Shared dashboard shell
- [x] Responsive sidebar
- [x] Dashboard header
- [x] Notification button UI
- [x] Light/dark/system theme toggle
- [x] Responsive dashboard navigation
- [x] Dashboard overview route
- [x] Statistics route
- [x] Analytics route

### User management

- [x] User list
- [x] User search
- [x] Role filtering
- [x] Multi-role filtering
- [x] Provider filtering
- [x] Status filtering
- [x] Verification filtering
- [x] Flat and grouped views
- [x] Add/edit user form
- [x] Custom UI controls

### Role and permission management

- [x] Role list
- [x] Role grid/list views
- [x] Create/edit role form
- [x] Permission list
- [x] Permission search
- [x] Role-permission matrix
- [x] Permission create/edit form
- [x] Custom UI controls

### Theme management

- [x] Theme list
- [x] Theme activation
- [x] Theme preference support
- [x] Theme creation/editing
- [x] Theme live preview
- [x] Emerald Forest default schema
- [x] Legacy `default` theme migration logic
- [x] Verify existing database rows after migration (`pnpm --filter api db:verify-themes`)
- [x] Verify no theme flash during initial load (server-injected active theme CSS)
- [x] Review remaining theme editor native controls (color/range inputs intentionally remain native)

### Site settings

- [x] General settings
- [x] Branding settings
- [x] Contact settings
- [x] Social settings
- [x] SEO settings
- [x] Maintenance mode settings
- [x] Responsive tab navigation
- [x] Reusable settings tab components
- [x] Resolve remaining Zod `.email()` deprecation warning

### API modules

- [x] Auth module
- [x] User module
- [x] RBAC module
- [x] Session module
- [x] Theme module
- [x] Site settings module
- [x] Admin statistics module
- [ ] Add comprehensive API integration tests
- [ ] Review API error responses and logging

### UI system

- [x] Custom inputs
- [x] Custom textareas
- [x] Custom password input
- [x] Custom switches
- [x] Custom search select
- [x] Multi-select search select
- [x] Custom checkbox
- [x] Custom image component
- [x] Reusable view toggle
- [x] Dashboard card wrappers
- [x] Responsive tab navigation pattern
- [ ] Audit remaining native controls
- [ ] Add automated visual regression checks

### Quality checks

- [ ] `pnpm check-types`
- [ ] `pnpm lint`
- [ ] `pnpm format:check`
- [ ] `pnpm build`
- [ ] Run API tests
- [ ] Run web tests
- [ ] Validate CI workflow on GitHub
- [ ] Test mobile layout at approximately 400px width
- [ ] Test desktop layout at approximately 1280px width

## Known development credentials

Development seed accounts use:

```text
Password: Password123!
```

Example admin account:

```text
Email: admin@example.com
```

Do not use these credentials in production.

## Main remaining work

1. Run and fix type, lint, formatting, and build checks.
2. Verify Emerald Forest theme migration against an existing database.
3. Configure production deployment and secrets.
4. Add automated integration and UI regression tests.
