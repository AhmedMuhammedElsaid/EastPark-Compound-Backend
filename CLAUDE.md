# EastPark Backend — Session Context

> Claude Code loads this file automatically when invoked in `eastpark-backend/`.
> Root project context: see `/mnt/c/Unite/EastPark-App/CLAUDE.md`.

## Status

✅ All 8 phases + all 6 gaps + wiring fixes resolved. Last commit: `eae0da7`. Branch: main.

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

## Project Structure

```
src/
├── main.ts                  # Fastify bootstrap, Swagger, global prefix v, versioning
├── app.module.ts
├── common/
│   ├── config/              # ConfigService wrappers (never raw process.env in services)
│   ├── database/            # DatabaseService (PrismaClient wrapper)
│   ├── doc/                 # DocResponse, DocGenericResponse decorators
│   ├── request/             # @AuthUser(), @AllowedRoles(), IAuthUser interface
│   └── response/            # ApiGenericResponseDto
└── modules/
    ├── auth/                # register, OTP, login, refresh, logout, forgot/reset, accept-invitation, push-token
    ├── shops/               # shops CRUD + photos, products (soft-delete isDeleted), reviews, saved-shops
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

**OTP / reset tokens.** Stored in Redis with TTL. OTP: 5min. Reset token: 30min (`AUTH_RESET_TOKEN_TTL_SEC=1800`).

**Paymob flow:**
1. `POST /v1/orders/:id/pay/paymob` [RESIDENT] → `PaymentsInitiateController`
2. Service: auth token → Paymob, register order → Paymob, payment key → Paymob
3. Returns `{ paymentKey, iframeUrl }` — FE opens iframe
4. Webhook: `POST /webhooks/paymob` — HMAC-SHA512 verified, idempotent via Redis, flips `order.isPaid = true`

**Socket.io.** Namespace `/orders`. Merchants and residents join room `order:{orderId}`. Emit `order:status` on status change.

**Expo Push.** Inline in notification service (no BullMQ). Only sends if `NotificationPreference.enabled = true` for that `NotificationType`.

**Election auto-open.** `@Cron('*/5 * * * *')` in `ElectionsService.openExpiredResults()`. Skips elections where `visibilityMode = ADMIN_CONTROLLED`. Flips `resultsOpen = true` when `expiresAt` has passed.

**ElectionVisibilityMode.** `SEALED_UNTIL_DEADLINE` (default) | `LIVE_COUNT` (show counts before deadline) | `ADMIN_CONTROLLED` (never auto-opened).

**Product soft-delete.** `isDeleted: Boolean @default(false)`. Always `where: { isDeleted: false }` on product queries. OrderItem FK preserved.

**Shop response.** Always include `reviewCount` (from `_count: { select: { reviews: true } }`) and `averageRating` (from `review.aggregate._avg.rating` in findOne — null in list endpoints).

**Anonymous feedback.** Strip `userId`/`author` from response when `isAnonymous: true` in admin-facing queries.

**Shop photos.** `ShopPhoto` model has `order: Int` (not `isPrimary`). Always `orderBy: { order: 'asc' }` in include. FE uses `photos[0]` as cover.

## Env Vars (see `.env.example` for full list)

```
# Required before card payments work:
PAYMOB_INTEGRATION_ID=""   # Fly.io secret
PAYMOB_IFRAME_ID=""        # Fly.io secret

# Also required:
PAYMOB_API_KEY=""
PAYMOB_HMAC_SECRET=""
DATABASE_URL=""
REDIS_URL=""
AUTH_ACCESS_TOKEN_SECRET=""
AUTH_REFRESH_TOKEN_SECRET=""
```

## Commit Convention

Format: `[AhmedMuhammedElsaid][feat|fix|chore|docs]: description`
Always `--no-verify` (WSL cannot run node/pnpm hooks). Branch: main.

## Deploy

```bash
# Add secrets first (required for Paymob):
fly secrets set PAYMOB_INTEGRATION_ID=<val> PAYMOB_IFRAME_ID=<val>

# Deploy:
fly deploy
```

Region: `cdg` (Paris). Dockerfile CMD: `npx prisma migrate deploy && node dist/main`.

## Prisma

Schema: `prisma/schema.prisma`. After schema changes:

```bash
pnpm prisma migrate dev --name <name>   # dev
npx prisma migrate deploy               # prod (auto in Dockerfile CMD)
pnpm prisma generate                    # regenerate client after schema change
pnpm seed                               # seeds admin@eastpark.local (first admin)
```

## Local Dev

```bash
docker-compose up -d    # postgres + redis + mailpit + minio + minio-init
pnpm dev                # start NestJS in watch mode
```

Swagger UI: `http://localhost:3000/docs`
Mailpit UI: `http://localhost:8025`
MinIO UI: `http://localhost:9001`
