# Auth Security Verification Record

Fill in after running each check against staging/production. No tokens, passwords, or secrets — status/timestamps/observations only.

## Environment

- Date:
- Environment (staging/production):
- Commit/build:
- `NODE_ENV`:
- Reverse proxy in front (yes/no, hop count):
- `trust proxy` value in `api/src/main.ts`:

## Refresh / session matrix

| Check                                 | Expected                                                          | Result (pass/fail) | Notes |
| ------------------------------------- | ----------------------------------------------------------------- | ------------------ | ----- |
| Login sets cookies                    | `httpOnly`, `secure`, `sameSite=strict`, `path=/` on both cookies |                    |       |
| Valid refresh                         | New access+refresh cookies, same session id persists              |                    |       |
| Missing refresh cookie                | `401`                                                             |                    |       |
| Expired/invalid/malformed refresh JWT | `401`                                                             |                    |       |
| Deleted/expired DB session            | `401`                                                             |                    |       |
| Logout                                | Session deleted, both cookies cleared                             |                    |       |
| Refresh after logout (old token)      | `401`                                                             |                    |       |
| Password reset                        | All prior sessions revoked, old access/refresh tokens rejected    |                    |       |
| Inactive user with valid access token | `401`                                                             |                    |       |

## Rate limit matrix

| Endpoint                   | Configured limit | Verified `429` after limit | Recovers after TTL | Notes |
| -------------------------- | ---------------- | -------------------------- | ------------------ | ----- |
| POST /auth/register        | 5/min            |                            |                    |       |
| POST /auth/login           | 10/min           |                            |                    |       |
| POST /auth/refresh         | 20/min           |                            |                    |       |
| POST /auth/verify/email    | 5/min            |                            |                    |       |
| POST /auth/password/forgot | 5/min            |                            |                    |       |
| POST /auth/password/reset  | 5/min            |                            |                    |       |
| GET /auth/google           | 10/min           |                            |                    |       |
| GET /auth/google/callback  | 10/min           |                            |                    |       |

## Proxy / deployment

- Client IP used for throttling matches real client (not proxy IP):
- Number of API instances in production:
- Shared throttler store needed (yes/no):
- If yes, configured:

## Sign-off

- Verified by:
- Result: pass / fail / partial
- `status.md` updated: yes/no
