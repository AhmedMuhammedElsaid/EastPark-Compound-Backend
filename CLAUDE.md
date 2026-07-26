# EastPark Backend — Session Context

> Claude Code loads this file automatically when invoked in `eastpark-backend/`.
> Root project context: see `/mnt/c/Unite/EastPark-App/CLAUDE.md`.

---

## Documentation Folder

All reference files live in `Documentation/` — read these before exploring the codebase:

| File | Purpose |
|---|---|
| `Documentation/GUIDE.md` | Architecture, tech map, DB relationships, auth flow, file uploads, real-time, how to make changes |
| `Documentation/APPCONTEXT.md` | Full tech stack, all API routes, domain rules, all locked decisions |
| `Documentation/HOWTORUN.md` | Local dev setup, all pnpm commands, Docker services, troubleshooting |
| `Documentation/WSL_NETWORKING.md` | WSL2 NAT explained, portproxy setup, why WSL IP changes, full phone→backend request flow |

---

## Status

✅ **All 2026-07-19 audit blockers fixed (2026-07-26). Backend typecheck passes (exit 0) and full test suite is green (62/62, coverage 81.11% stmts / 77.5% funcs). Deployable pending prod secrets + `fly deploy`. See `backend_review.md` for the audit history.**

✅ All 8 phases + all 6 gaps + wiring fixes + 2 full audit passes complete. Running locally since 2026-04-02. Branch: main.

### Audit 2026-07-19 → all fixed 2026-07-26 (verified with Node v24 via nvm)
- **BE-1 ✅ FIXED:** added `descriptionAr String?` to `Election` model (schema.prisma) — was a runtime Prisma crash + tsc error. Commit `42d6eaa`.
- **BE-2 ✅ FIXED:** replaced the lone incremental migration with a single full baseline migration `00000000000000_init` (`prisma migrate diff --from-empty`) + set `migration_lock.toml` provider. `prisma migrate deploy` now builds a complete fresh DB. Commit `42d6eaa`.
- **BE-3 ✅ FIXED:** `UserResponseDto` passwordHash/pushToken made optional (3 auth.service sites); invitation DTO uses `typeof Role.MERCHANT | typeof Role.ADMIN`. `pnpm typecheck` exits 0. Commit `5853834`.
- **BE-4/5/6 ✅ FIXED:** added `CacheService` mock to `payments.service.spec.ts` — 62/62 tests pass, coverage 81.11%/77.5% (payments 29.87% → 64.5%). Commit `6b2c9c8`.
- **BE-7 ✅ FIXED:** `test.yml` rewritten for pnpm + Prisma generate + typecheck/lint/test. Commit `4b0764f`.
- **B-7 (from FE audit) ✅ FIXED:** new merchant self-service module (`src/modules/merchant/`) exposes `/merchant/shop|products|orders*`, resolving the caller's shop from the JWT — the mobile app's Merchant Tools now works (was all 404s). Commit `988e7c6`.
- **✅ Corrected:** `DELETE /user` self-delete **is implemented** (`src/modules/user/controllers/user.public.controller.ts:62-69`) — old "pending" note was wrong.

### Remaining before ship
- `fly secrets set PAYMOB_INTEGRATION_ID=<val> PAYMOB_IFRAME_ID=<val>` then `fly deploy` (Docker CMD runs `prisma migrate deploy` — now safe with the baseline).

---

## Local Dev State (as of 2026-04-08)

- **Docker services:** postgres + redis + mailpit + minio — all running (`pnpm docker:up`)
- **Database:** now has a full baseline migration `00000000000000_init` (2026-07-26). Fresh DBs build via `prisma migrate deploy`. (Historically the base schema was `db push`'d with only one incomplete incremental migration — fixed in BE-2.)
- **Admin seeded:** `admin@eastpark.app` (password set via `SEED_ADMIN_PASSWORD` env var)
- **`@fastify/static` installed** — required by SwaggerModule with Fastify adapter
- **Swagger fix applied** — `@ApiParam` added to `PUT /notifications/preferences/:type` to fix circular dep on `NotificationType` enum

> **Before every dev session:** Run `pnpm docker:up` first, then `pnpm dev`. Server crashes immediately without Docker.

---

## Admin Credentials

| Field | Value |
|---|---|
| Email | `admin@eastpark.app` |
| Password | Set via `SEED_ADMIN_PASSWORD` env var |

Defined in `prisma/seed-data.ts` (overridable via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars). Re-run `pnpm seed` is idempotent — skips if merchants already exist.

---

## User Roles

| Role | Registration Flow |
|---|---|
| Guest | No auth. Read-only API access to public endpoints. |
| Resident | POST /auth/register → POST /auth/verify-otp → verified |
| Merchant | Admin sends email invite → one-time token → POST /auth/accept-invitation |
| Admin | Admin sends email invite → one-time token → POST /auth/accept-invitation |

---

## Seed Data

Single seed file: `prisma/seed-data.ts`. `sample.json` and `seed.ts` have been deleted.

```bash
pnpm prisma:reset   # wipe DB (destructive)
pnpm seed           # seeds everything; skips if merchants already exist (idempotent)
```

**What gets seeded:**

| Entity | Count | Detail |
|---|---|---|
| Users | 14 | 1 admin · 5 merchants · 8 residents |
| Shops | 5 | café · grocery · butcher · services · health |
| Products | 42 | 8–10 per shop |
| Orders | 14 | all statuses: PLACED → DELIVERED, one CANCELLED |
| Reviews | 16 | every shop has 2–4 reviews |
| Announcements | 8 | mix of GENERAL / EVENT / MAINTENANCE / NEWS / PROMOTION |
| Reports | 5 | quarterly financial + maintenance + security |
| Polls | 3 | 18 votes across 8 residents |
| Election | 1 | 3 candidates, 6 votes |
| Feedback | 8 | 5 admin replies |
| Notifications | 15 | across all types |

**Test credentials:**

All seed passwords are set via environment variables: `SEED_ADMIN_PASSWORD`, `SEED_MERCHANT_PASSWORD`, `SEED_RESIDENT_PASSWORD`. See `.env.example`.

| Role | Email |
|---|---|
| Admin | `admin@eastpark.app` |
| Merchants | `merchant1–5@eastpark.app` |
| Residents | `resident1–8@eastpark.app` |

---

## Stack (locked)

| Layer | Choice |
|---|---|
| Framework | NestJS + Fastify adapter (NOT Express) |
| Package manager | pnpm |
| ORM | Prisma + PostgreSQL (Neon free tier in prod) |
| Cache | ioredis → Upstash Redis in prod (OTP, rate limiting, token blacklist) |
| File storage | Supabase Storage (prod) / MinIO docker (dev) |
| Email | Brevo SMTP (prod) / Mailpit docker (dev) |
| Push | Expo Push Service inline — no BullMQ, no queues |
| Real-time | Socket.io WebSocket gateway — namespace `/orders` |
| Cron | @nestjs/schedule — election auto-open every 5min |
| Rate limiting | @nestjs/throttler — max 5 req/min on `/auth/*` |
| Hosting | Fly.io `cdg` (Paris), `auto_stop_machines = false` |

---

## Project Structure

```
src/
├── main.ts                  # Fastify bootstrap, Swagger, global prefix /v1, versioning
├── app.module.ts
├── common/
│   ├── config/              # ConfigService wrappers (never raw process.env in services)
│   ├── database/            # DatabaseService (PrismaClient wrapper)
│   ├── doc/                 # DocResponse, DocGenericResponse decorators
│   ├── request/             # @AuthUser(), @AllowedRoles(), IAuthUser interface
│   └── response/            # ApiGenericResponseDto
└── modules/
    ├── auth/                # register, OTP, login, refresh, logout, forgot/reset, accept-invitation, push-token
    ├── shops/               # shops CRUD + photos + reviews + saved-shops
    ├── orders/              # orders REST + Socket.io /orders gateway
    ├── payments/            # Paymob 3-step initiation + HMAC-SHA512 webhook
    ├── announcements/       # CRUD + cursor pagination + AnnouncementCategory filter
    ├── comments/            # Announcement comments
    ├── reports/             # PDF report listings (separate from Announcements)
    ├── feedback/            # Feedback CRUD + replies + anonymous masking
    ├── polls/               # Polls + one-vote guarantee (@@id([userId, pollId]))
    ├── elections/           # Elections + candidates + @Cron auto-open + ElectionVisibilityMode
    ├── notifications/       # Expo Push inline + in-app feed + preferences (GET/PUT /preferences/:type)
    ├── invitations/         # Admin send (POST) + list (GET) invitations
    └── user/                # Public (profile GET, update PUT, self-delete DELETE) + Admin (delete by id)
```

---

## Key Patterns

**ConfigService everywhere.** Never `process.env.KEY` in services — always `this.configService.get<string>('KEY')`.

**Auth decorators:**
- `@AllowedRoles([Role.RESIDENT])` — restrict endpoint by role
- `@AuthUser() actor: IAuthUser` — extracts `{ userId, role }` from JWT payload

**Cursor pagination (all list endpoints):**
```typescript
take: limit + 1,
...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
orderBy: { createdAt: 'desc' },
// After query: if items.length > limit → items.pop(); nextCursor = last.id
```

**Response format.** DocResponse interceptor wraps all responses: `{ success: true, message: 'i18n.key', data: ... }`.

**OTP / reset tokens.** Stored in Redis with TTL. OTP: 10min (`OTP_TTL = 600`). Reset token: 30min.

**Paymob flow:**
1. `POST /v1/orders/:id/pay/paymob` [RESIDENT] → auth token → register order → payment key (all via Paymob API)
2. Returns `{ paymentKey, iframeUrl }` — FE opens iframe
3. Webhook: `POST /webhooks/paymob` — HMAC-SHA512 verified, idempotent via Redis, flips `order.isPaid = true`

**Socket.io.** Namespace `/orders`. Emit `order:status` on status change.

**Product soft-delete.** `isDeleted: Boolean @default(false)`. Always `where: { isDeleted: false }` on queries.

**Shop photos.** `ShopPhoto.order: Int` — always `orderBy: { order: 'asc' }`. Service derives `isPrimary: index === 0` from sorted array. FE uses `photo.isPrimary` to find the cover.

**Auth responses.** `passwordHash` and `pushToken` are always stripped from user objects in `verifyOtp`, `login`, and `acceptInvitation` before returning `{ ...tokens, user }`.

**Photo ownership.** `addPhoto` / `removePhoto` enforce `shop.merchantId === actor.userId` for MERCHANT role. ADMINs bypass this check.

**Feedback access.** `GET /feedback/:id` — only ADMIN can read any feedback; all other roles are restricted to their own submissions.

**Anonymous feedback.** Strip `userId`/`author` from response when `isAnonymous: true`.

> All domain rules and locked decisions → see `Documentation/APPCONTEXT.md`

---

## Env Vars (see `.env.example` for full list)

```
AUTH_ACCESS_TOKEN_SECRET=""    # generate: openssl rand -base64 48
AUTH_REFRESH_TOKEN_SECRET=""   # must differ from above
DATABASE_URL=""
REDIS_URL=""
PAYMOB_API_KEY=""              # prod only
PAYMOB_HMAC_SECRET=""          # prod only
PAYMOB_INTEGRATION_ID=""       # prod only — fly secrets set
PAYMOB_IFRAME_ID=""            # prod only — fly secrets set
```

---

## Commit Convention

Format: `[AhmedMuhammedElsaid][feat|fix|chore|docs]: description`
Always use `--no-verify` (WSL cannot run node/pnpm hooks). Branch: main.

---

## Prisma

Schema: `prisma/schema.prisma`. After schema changes:

```bash
pnpm prisma:migrate      # create + apply migration (dev)
pnpm prisma:generate     # regenerate client after schema change
pnpm seed                # seeds admin@eastpark.app (idempotent)
```

---

## Local Dev

```bash
pnpm docker:up    # ALWAYS first — postgres + redis + mailpit + minio
pnpm dev          # NestJS hot-reload on http://localhost:3000/v1
```

| URL | Purpose |
|---|---|
| http://localhost:3000/docs | Swagger UI |
| http://localhost:8025 | Mailpit (emails) |
| http://localhost:9001 | MinIO console (credentials in `.env`) |
| http://localhost:5555 | Prisma Studio (`pnpm prisma:studio`) |

---

## Deploy

```bash
fly secrets set PAYMOB_INTEGRATION_ID=<val> PAYMOB_IFRAME_ID=<val>
fly deploy
```

Region: `cdg` (Paris). Dockerfile CMD: `npx prisma migrate deploy && node dist/main`.
