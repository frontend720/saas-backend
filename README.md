# SaaS Backend API

Production-grade Express + MongoDB backend architected for a revenue-generating PWA. Built with tiered subscriptions, role-based access, and Stripe-ready billing infrastructure.

## Architecture

```
src/
├── config/           # Environment config + database connection
├── controllers/      # Thin HTTP layer — parse request, call service, send response
├── middleware/        # Auth (JWT), validation (Joi), error handling, tier enforcement
├── models/           # Mongoose schemas (User, Project, Asset, Subscription)
├── routes/           # Express route definitions
├── services/         # Business logic — all domain operations live here
├── utils/            # AppError, response helpers, query builder, seed script
├── validators/       # Joi schemas for request validation
├── app.js            # Express app setup (middleware chain)
└── server.js         # Entry point (DB connect, listen, graceful shutdown)
```

**Design principles:**
- Controller → Service → Model (clean separation of concerns)
- Every response follows a consistent envelope: `{ success, data, meta? }` or `{ success, error }`
- Soft deletes on all user-facing resources (nothing is permanently lost)
- Tier enforcement at the middleware level (free/pro/enterprise limits)
- Query builder supports filtering, sorting, pagination, field selection, and text search out of the box

## Quick Start

```bash
# 1. Clone and install
cd saas-backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — plug in your MongoDB connection string and set a real JWT_SECRET

# 3. Seed sample data (optional)
npm run seed

# 4. Start dev server (auto-restarts on file changes)
npm run dev
```

The server starts on `http://localhost:5000` by default.

## API Reference

All routes are prefixed with `/api`. Responses follow:

```json
// Success
{ "success": true, "data": { ... }, "meta": { "pagination": { ... } } }

// Error
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "...", "details": [...] } }
```

### Health

| Method | Endpoint       | Auth | Description              |
|--------|----------------|------|--------------------------|
| GET    | `/api/health`  | No   | DB status, uptime, memory |

### Auth

| Method | Endpoint                    | Auth | Description          |
|--------|-----------------------------|------|----------------------|
| POST   | `/api/auth/register`        | No   | Create account       |
| POST   | `/api/auth/login`           | No   | Get tokens           |
| POST   | `/api/auth/refresh`         | No   | Rotate access token  |
| POST   | `/api/auth/logout`          | Yes  | Invalidate refresh   |
| GET    | `/api/auth/me`              | Yes  | Current user profile |
| PATCH  | `/api/auth/me`              | Yes  | Update name/avatar   |
| POST   | `/api/auth/change-password` | Yes  | Change password      |

**Register / Login response:**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "user", "tier": "free" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### Projects

| Method | Endpoint                                    | Auth | Description           |
|--------|---------------------------------------------|------|-----------------------|
| POST   | `/api/projects`                             | Yes  | Create project        |
| GET    | `/api/projects`                             | Yes  | List your projects    |
| GET    | `/api/projects/:id`                         | Yes  | Get by ID             |
| GET    | `/api/projects/slug/:slug`                  | Yes  | Get by slug           |
| PATCH  | `/api/projects/:id`                         | Yes  | Update project        |
| DELETE | `/api/projects/:id`                         | Yes  | Soft delete           |
| POST   | `/api/projects/:id/collaborators`           | Yes  | Add collaborator      |
| DELETE | `/api/projects/:id/collaborators/:userId`   | Yes  | Remove collaborator   |

**Query params:** `?page=1&limit=20&sort=-createdAt&status=active&tags=portfolio&q=search+term&fields=name,status`

### Assets (nested under projects)

| Method | Endpoint                                        | Auth | Description       |
|--------|-------------------------------------------------|------|-------------------|
| POST   | `/api/projects/:projectId/assets`               | Yes  | Register asset    |
| GET    | `/api/projects/:projectId/assets`               | Yes  | List assets       |
| GET    | `/api/projects/:projectId/assets/usage`         | Yes  | Storage stats     |
| GET    | `/api/projects/:projectId/assets/:id`           | Yes  | Get asset         |
| PATCH  | `/api/projects/:projectId/assets/:id`           | Yes  | Update asset      |
| DELETE | `/api/projects/:projectId/assets/:id`           | Yes  | Soft delete       |

### Admin (requires `admin` role)

| Method | Endpoint              | Auth  | Description         |
|--------|-----------------------|-------|---------------------|
| GET    | `/api/admin/users`    | Admin | List all users      |
| GET    | `/api/admin/users/:id`| Admin | Get user detail     |
| PATCH  | `/api/admin/users/:id`| Admin | Update role/tier    |
| GET    | `/api/admin/stats`    | Admin | Platform analytics  |

## Tier Limits

| Feature                     | Free | Pro  | Enterprise |
|-----------------------------|------|------|------------|
| Max projects                | 3    | 50   | Unlimited  |
| Assets per project          | 10   | 500  | Unlimited  |
| Max asset size              | 5MB  | 100MB| 500MB      |
| Collaborators per project   | 0    | 10   | Unlimited  |

Adjust in `src/middleware/tierLimits.js`.

## Security

- **Helmet** — sets security headers
- **CORS** — configurable allowed origins
- **Rate limiting** — global (100/15min) + stricter on auth endpoints (20/15min)
- **Password hashing** — bcrypt with 12 salt rounds
- **JWT** — access + refresh token rotation with reuse detection
- **Input validation** — Joi schemas strip unknown fields
- **Soft deletes** — data recovery possible
- **No password in responses** — `select: false` on password field

## Deployment Checklist

1. Set `NODE_ENV=production`
2. Generate a strong `JWT_SECRET` (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
3. Use a managed MongoDB (Atlas)
4. Set `CORS_ORIGINS` to your frontend domain(s)
5. Add Stripe keys when billing is ready
6. Consider adding: Redis for sessions/caching, S3 for file uploads, a CDN for assets

## Next Steps (Revenue Path)

- [ ] Wire up Stripe webhook handler for subscription lifecycle events
- [ ] Add file upload endpoint (multer + S3)
- [ ] Email service (Resend/SendGrid) for transactional emails
- [ ] Add WebSocket support for real-time collaboration
- [ ] Implement API key auth for third-party integrations
- [ ] Add usage analytics / event tracking
