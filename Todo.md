# INDEX — Project Status & Roadmap

**Creative Asset Management Platform**
**Stack:** Node.js / Express / MongoDB / Apollo GraphQL / React / Vite / Tailwind CSS

---

## Completed

### Backend — Server & Infrastructure
- [x] Express server with graceful shutdown (SIGTERM, SIGINT, unhandled rejections)
- [x] MongoDB connection with Mongoose ODM
- [x] Helmet security headers (CSP, frameguard, CORP configured for dev/prod)
- [x] CORS configuration (global for REST, explicit for /graphql with Apollo Studio origins)
- [x] Rate limiting on /api and /api/auth routes
- [x] Body parsing, compression, morgan logging
- [x] Trust proxy configuration
- [x] Global error handler with AppError utility class
- [x] 404 catchall route

### Backend — Authentication (REST)
- [x] JWT-based auth with access + refresh tokens
- [x] bcrypt password hashing (12 rounds) with pre-save hook
- [x] verifyToken — pure verification function (used by both REST and GraphQL)
- [x] authenticate — Express middleware wrapper
- [x] authorize — role-based access control
- [x] Password change detection (changedPasswordAfter on User model)
- [x] Joi validation schemas for register, login, changePassword, updateProfile
- [x] Auth rate limiting (20 requests per 15 min)

### Backend — Mongoose Models
- [x] User — email, password, name, avatar, role (user/pro/admin), tier (free/pro/enterprise), Stripe fields, isActive, passwordChangedAt, refreshTokenHash
- [x] Project — owner, name, slug (auto-generated), description, status (draft/active/archived/deleted), settings (Mixed), tags, collaborators with roles, assetCount, lastActivityAt
- [x] Asset — project, uploadedBy, filename, originalName, mimeType, type, size, storageKey, url, thumbnailUrl, meta (Mixed), isDeleted
- [x] Subscription — user, Stripe IDs (subscription/customer/price), status, tier, interval, billing period dates, cancelAtPeriodEnd, trial dates, recentInvoices

### Backend — GraphQL Schema & Resolvers

**Queries:**
- [x] me — authenticated user profile
- [x] users — admin-only list all active users
- [x] user(id) — admin-only single user lookup
- [x] myProjects — user's non-deleted projects
- [x] project(id) — single project with ownership check
- [x] asset(id) — single asset with project ownership verification
- [x] projectAssets(projectId) — all assets for a project
- [x] mySubscription — current user's active subscription
- [x] subscriptions — admin-only list all subscriptions

**Mutations:**
- [x] createProject — creates project with auto-slug
- [x] updateProject — name, description, tags, settings (uses save() for slug hook)
- [x] deleteProject — soft delete (status → deleted)
- [x] registerAsset — creates asset metadata record, increments project assetCount
- [x] updateAsset — filename, originalName, meta with ownership check
- [x] deleteAsset — soft delete (isDeleted → true), decrements assetCount
- [x] updateProfile — name, avatar (any user), tier (admin only with validation)
- [x] changePassword — verifies current password, triggers pre-save hash + passwordChangedAt
- [x] cancelSubscription — sets cancelAtPeriodEnd (Stripe API call stubbed)
- [x] deleteUser — admin-only soft delete (isActive → false), self-deletion prevention

### Backend — Apollo Server Integration
- [x] Apollo Server mounted at /graphql
- [x] GraphQL context extracts Bearer token and runs verifyToken
- [x] Explicit CORS preflight handling for /graphql
- [x] Allowed headers include sentry-trace and baggage for Apollo Studio
- [x] formatError returns message + status code

### Frontend — React Application
- [x] Vite + React scaffold inside /client (monorepo)
- [x] Apollo Client 3.12 with auth link (Bearer token from localStorage)
- [x] Vite proxy — /api and /graphql forwarded to localhost:4500
- [x] Tailwind CSS via @tailwindcss/vite plugin
- [x] React Router with protected routes
- [x] AuthContext — token/user state, login/logout functions
- [x] ProtectedRoute component — redirects to /login if no token
- [x] All GraphQL queries and mutations defined in separate files

### Frontend — Pages
- [x] Landing — hero, feature cards, CTAs to register/login, footer
- [x] Login — REST auth, stores token, redirects to dashboard, error display
- [x] Register — client-side validation (password match, length), REST auth
- [x] Dashboard — real data via MY_PROJECTS + ME queries, capsule grid, create modal, sidebar with user info/tier, mobile hamburger menu
- [x] Project — single capsule view, metadata display (status/assets/tags/description), asset grid with type icons, edit modal, delete with confirmation, asset deletion
- [x] Settings — profile editing (name, avatar), password change with validation, subscription status display, upgrade button (stubbed)

### Frontend — Design System
- [x] Brutalist aesthetic — #FF4500 orange, #111111 near-black, #F9F9F9 off-white
- [x] Monospace system nomenclature (CAPSULES, INIT_SESSION, END_SESSION, INGEST)
- [x] Shadow-offset buttons with active state animation
- [x] Consistent form styling across all pages
- [x] iOS safe area support (env(safe-area-inset-top/bottom))
- [x] App icon set — SVG, ICO, apple-touch-icon, 192px, 512px PNGs

### DevOps & Tooling
- [x] Apollo Sandbox connected via Chrome (studio.apollographql.com)
- [x] Thunder Client configured for GraphQL + REST testing
- [x] Local network testing via Vite host: true
- [x] Nodemon for backend hot reloading
- [x] Test users created via mongosh (admin + 3 standard users)

### Bugs Fixed
- [x] Apollo Sandbox connection — Safari ITP, Chrome 146 local network access, CORS preflight 404, sentry-trace header, protocol mismatch
- [x] config/index.js — mongoose.connect() called as side effect at import time (stores Promise instead of URI string)
- [x] verifyToken — decoded.id vs decoded.sub mismatch in JWT payload
- [x] Resolver nesting — updateProfile/changePassword accidentally nested inside createProject
- [x] Subscription resolvers placed in Mutation instead of Query
- [x] Apollo Client v4 export incompatibility with Vite — downgraded to v3.12
- [x] Login response shape mismatch — data.data.accessToken not data.token
- [x] Dashboard cache not invalidating on project delete — added refetchQueries
- [x] No mobile navigation — added MobileHeader component

---

## Remaining — MVP

### File Upload System (HIGH PRIORITY)
- [ ] Decide storage provider (local disk for dev, S3/GCP for prod)
- [ ] POST /api/uploads — multer middleware for file handling
- [ ] Storage service — save file, return storageKey + url
- [ ] Thumbnail generation for images
- [ ] Wire "Ingest" button on Project page to upload flow
- [ ] Chain: upload file → get storageKey → call registerAsset mutation → refresh asset grid

### Stripe Integration (HIGH PRIORITY)
- [ ] Create Products + Prices in Stripe Dashboard (Pro monthly/yearly, Enterprise monthly/yearly)
- [ ] Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env
- [ ] services/stripe.js — Stripe SDK initialization, helper functions
- [ ] POST /api/stripe/checkout — create Checkout Session, redirect to Stripe
- [ ] POST /api/stripe/webhook — handle events (raw body parsing before express.json)
  - [ ] checkout.session.completed → create Subscription record, update User tier
  - [ ] customer.subscription.updated → update Subscription status/dates
  - [ ] customer.subscription.deleted → update Subscription status, downgrade User tier
  - [ ] invoice.paid → update recentInvoices on Subscription
  - [ ] invoice.payment_failed → update Subscription status to past_due
- [ ] POST /api/stripe/portal — create Billing Portal session
- [ ] Wire "Upgrade_Tier" button on Settings page to checkout flow
- [ ] Update cancelSubscription resolver to call Stripe API
- [ ] Add success/cancel redirect pages for post-checkout

### Tier Enforcement
- [ ] Define tier limits (assets per project, total projects, storage, collaborators)
- [ ] Implement checkProjectLimit middleware in createProject resolver
- [ ] Implement checkAssetLimit in registerAsset resolver
- [ ] Display usage/limits in sidebar (capacity bar from original design)
- [ ] Gate collaborator features behind Pro/Enterprise tiers

### Config Bug Fix
- [ ] Fix config/index.js — change mongo.uri from mongoose.connect() call to plain URI string

---

## Remaining — Post-MVP

### Authentication Enhancements
- [ ] Refresh token rotation endpoint (POST /api/auth/refresh)
- [ ] Email verification on registration
- [ ] Password reset flow (forgot password → email → reset link)
- [ ] Social login (Google, GitHub) via Passport.js
- [ ] Account deactivation (user-initiated deleteMyAccount mutation)
- [ ] isBanned flag separate from isActive for admin enforcement

### Frontend Polish
- [ ] Extract Sidebar and MobileHeader into shared Layout component
- [ ] Add mobile nav to Project and Settings pages
- [ ] Loading skeletons instead of text-only loading states
- [ ] Toast notifications for mutations (created, updated, deleted, errors)
- [ ] Responsive table/list view toggle for assets
- [ ] Search/filter on Dashboard (by name, tags, status)
- [ ] Pagination or infinite scroll for projects and assets
- [ ] 404 page
- [ ] Keyboard shortcuts

### Project Features
- [ ] updateProjectStatus mutation (draft → active → archived)
- [ ] addCollaborator / removeCollaborator mutations
- [ ] searchProjects query (text search on name/description using existing text index)
- [ ] Project duplication
- [ ] Bulk asset operations (select multiple, delete, move)

### Asset Features
- [ ] Asset detail/preview page (full-size image, video player, document viewer)
- [ ] Asset metadata editing UI (category, colors, season, custom fields)
- [ ] Drag-and-drop upload
- [ ] Multi-file upload
- [ ] Asset type filtering (images, videos, documents, audio)
- [ ] Sort by date, name, size, type

### Admin Dashboard
- [ ] Admin route/page with user management table
- [ ] Subscription overview and revenue metrics
- [ ] User activity logs
- [ ] Storage usage monitoring
- [ ] Ability to impersonate users for support

### Security & Performance
- [ ] MongoDB access control (authentication enabled)
- [ ] Input sanitization on all GraphQL inputs (prevent NoSQL injection)
- [ ] Request logging with correlation IDs
- [ ] Apollo Server caching (Redis)
- [ ] Database query optimization (check N+1 on Project.assets resolver)
- [ ] Image optimization pipeline (resize, compress on upload)
- [ ] CDN for static assets and uploaded files
- [ ] HTTPS in production (TLS certs)

### Deployment
- [ ] Dockerize backend and frontend
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment configuration for staging and production
- [ ] MongoDB Atlas or equivalent managed database
- [ ] Cloud storage bucket (S3/GCP) for production file uploads
- [ ] Domain and DNS setup
- [ ] Monitoring and alerting (error tracking, uptime)

### Future — VR/Immersive Experience
- [ ] 3D asset support (glTF, OBJ, FBX file types)
- [ ] 3D model viewer component (Three.js)
- [ ] Spatial layout/canvas for asset arrangement
- [ ] WebXR integration for VR studio mode
- [ ] Real-time collaboration (WebSocket/subscriptions)

---

## Tech Debt & Notes

- **GarmentMeta type** is fashion-specific but Asset.meta is flexible Mixed type — consider generalizing the GraphQL type to match
- **Capsules** is the frontend metaphor for Projects — keep display terminology consistent
- **Apollo Client v4** was incompatible with Vite's ESM resolver — pinned to v3.12.11
- **Vite port** auto-increments if default is taken — doesn't affect proxy but note for team
- **MongoDB has no auth enabled** — fine for local dev, must enable before any deployment
- **config/index.js** calls mongoose.connect() at import time as a side effect — needs fix