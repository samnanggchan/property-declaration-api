# Tasks

## Property Declaration Management System — Task Breakdown

**Based on:** [PRD.md](file:///d:/David/New-System/property-declaration-api/docs/PRD.md) | [PLAN.md](file:///d:/David/New-System/property-declaration-api/docs/PLAN.md)  
**Last Updated:** 2026-09-25

> Legend: ⬜ Not started | 🟡 In progress | ✅ Done | ❌ Blocked

---

## Phase 0: Stabilization & Security Hardening 🔴 CRITICAL

### 0.1 — Protect Declaration Endpoints
- [ ] `BE` Add `@UseGuards(JwtAuthGuard, RbacGuard)` to `DeclarationsController`
- [ ] `BE` Add `@RequirePermissions('READ_DECLARATIONS')` to `GET /declarations` and `GET /declarations/:id`
- [ ] `BE` Add `@RequirePermissions('WRITE_DECLARATIONS')` to `POST /declarations` and `PATCH /declarations/:id`
- [ ] `BE` Add `@RequirePermissions('DELETE_DECLARATIONS')` to `DELETE /declarations/:id`
- [ ] `BE` Import `AuthModule` in `DeclarationsModule` (or make guards global)
- [ ] `BE` Test: unauthenticated requests return 401
- [ ] `BE` Test: unauthorized roles return 403

### 0.2 — Fix Frontend API Client
- [ ] `FE` Create RTK Query `declarationsApi` endpoints in `lib/redux/api/declarationsApi.ts`
  - [ ] `useListDeclarationsQuery()`
  - [ ] `useGetDeclarationQuery(id)`
  - [ ] `useCreateDeclarationMutation()`
  - [ ] `useUpdateDeclarationMutation()`
  - [ ] `useDeleteDeclarationMutation()`
- [ ] `FE` Refactor `declarations-view.tsx` to use RTK Query instead of `lib/api.ts`
- [ ] `FE` Remove or deprecate `app/api/declarations/` local Next.js route handlers
- [ ] `FE` Remove or deprecate `app/api/declarations/store.ts` in-memory store
- [ ] `FE` Verify all declaration API calls go through `baseQueryWithReauth`

### 0.3 — Fix Hardcoded Values
- [ ] `FE` Replace hardcoded user ("shadcn" / "m@example.com") in `app-sidebar.tsx` with real user from `useAppSelector(state => state.auth.user)`
- [ ] `FE` Show user's role badge next to email in sidebar
- [ ] `BE` Remove `?? 'change-me-in-production'` JWT secret fallback — throw error if `JWT_SECRET` not set
- [ ] `BE` Make CORS origins configurable via `CORS_ORIGINS` env var (comma-separated)

### 0.4 — Environment & Config
- [ ] `BE` Create `docs/.env.example` with all required environment variables
- [ ] `FE` Create `.env.example` with `NEXT_PUBLIC_API_URL`
- [ ] `BE` Add `GET /health` endpoint returning `{ status: 'ok', timestamp }` 
- [ ] `BE` Validate `DATABASE_URL` and `JWT_SECRET` exist on startup (fail fast)

---

## Phase 1: Core Backend Completion 🟠 HIGH

### 1.1 — User Management Module
- [ ] `BE` Generate `UsersModule` via NestJS CLI
- [ ] `BE` Create `UsersController` with routes:
  - [ ] `GET /api/users` — list users with pagination
  - [ ] `GET /api/users/:id` — get user detail with roles
  - [ ] `PATCH /api/users/:id` — update user email
  - [ ] `DELETE /api/users/:id` — soft-delete or hard-delete user
- [ ] `BE` Create `UsersService` with Prisma queries
- [ ] `BE` Create DTOs: `UpdateUserDto`, `AssignRoleDto`
- [ ] `BE` Role assignment endpoints:
  - [ ] `POST /api/users/:id/roles` — assign role to user
  - [ ] `DELETE /api/users/:id/roles/:roleId` — remove role from user
- [ ] `BE` Apply guards: `@UseGuards(JwtAuthGuard, RbacGuard)`
- [ ] `BE` Apply permissions: `@RequirePermissions('READ_USERS')`, `WRITE_USERS`, `DELETE_USERS`
- [ ] `BE` Prevent self-deletion (user cannot delete themselves)
- [ ] `BE` Prevent removing last SUPER_ADMIN role

### 1.2 — Pagination & Filtering
- [ ] `BE` Create shared `PaginationDto` (page, limit, search, sortBy, order)
- [ ] `BE` Create shared `PaginatedResponse<T>` type ({ data, total, page, limit, totalPages })
- [ ] `BE` Add pagination to `DeclarationsService.findAll()`
- [ ] `BE` Add pagination to `UsersService.findAll()`
- [ ] `BE` Add search filter (certNumber, location, party names) to declarations
- [ ] `BE` Add search filter (email) to users

### 1.3 — API Documentation (Swagger)
- [ ] `BE` Install `@nestjs/swagger`
- [ ] `BE` Configure Swagger in `main.ts` at `/api/docs`
- [ ] `BE` Add `@ApiTags()` to all controllers
- [ ] `BE` Add `@ApiOperation()` and `@ApiResponse()` to all endpoints
- [ ] `BE` Add `@ApiProperty()` to all DTOs
- [ ] `BE` Add JWT cookie authentication scheme to Swagger config

### 1.4 — Rate Limiting
- [ ] `BE` Install `@nestjs/throttler`
- [ ] `BE` Configure global rate limiting (100 requests/minute default)
- [ ] `BE` Apply strict limit to `POST /auth/login` — 5 attempts/minute per IP
- [ ] `BE` Apply strict limit to `POST /auth/register` — 3 attempts/minute per IP

### 1.5 — Roles & Permissions API
- [ ] `BE` `GET /api/roles` — list all roles with their permissions
- [ ] `BE` `GET /api/permissions` — list all permissions
- [ ] `BE` Apply `READ_USERS` permission guard

---

## Phase 2: Frontend Feature Completion 🟠 HIGH

### 2.1 — Live Dashboard
- [ ] `BE` Create `GET /api/stats/overview` — return total declarations, total users, declarations this month
- [ ] `BE` Create `GET /api/stats/declarations-by-month?months=12` — monthly declaration counts
- [ ] `FE` Create RTK Query endpoints for stats
- [ ] `FE` Replace hardcoded `data.json` in dashboard with live API data
- [ ] `FE` Update `SectionCards` to show real counts
- [ ] `FE` Update `ChartAreaInteractive` with real monthly data
- [ ] `FE` Add loading skeletons for dashboard cards and chart

### 2.2 — User Management Page (`/team`)
- [ ] `FE` Create RTK Query `usersApi` endpoints (list, get, update, delete, assignRole, removeRole)
- [ ] `FE` Build user list table component with:
  - [ ] Search by email
  - [ ] Pagination controls
  - [ ] Role badges per user
  - [ ] Actions dropdown (edit roles, delete)
- [ ] `FE` Build "Edit User Roles" modal/dialog
- [ ] `FE` Build "Delete User" confirmation dialog
- [ ] `FE` Build "Invite User" / registration form (admin creates user)
- [ ] `FE` Connect to real API endpoints
- [ ] `FE` Hide `/team` sidebar link for users without `READ_USERS` permission

### 2.3 — Role-Based UI Visibility
- [ ] `FE` Create `useHasPermission(permission: string)` hook
- [ ] `FE` Create `useHasRole(role: string)` hook
- [ ] `FE` Filter sidebar `navMain` items based on user permissions
- [ ] `FE` Conditionally hide edit/delete buttons in declarations table
- [ ] `FE` Conditionally hide "New Declaration" button without `WRITE_DECLARATIONS`
- [ ] `FE` Show appropriate empty state when permission denied

### 2.4 — Declarations UX Improvements
- [ ] `FE` Add loading skeletons to declarations table
- [ ] `FE` Add error boundary around declarations view
- [ ] `FE` Add success/error toasts on all CRUD operations
- [ ] `FE` Add confirmation dialog before delete
- [ ] `FE` Add pagination controls to declarations table
- [ ] `FE` Preserve search/filter state in URL params

### 2.5 — Profile Page
- [ ] `FE` Create `/settings/profile` page
- [ ] `BE` Create `PATCH /api/auth/change-password` endpoint
- [ ] `FE` Show current user info (email, roles, permissions)
- [ ] `FE` "Change Password" form
- [ ] `FE` Add "Profile" link in sidebar user menu

---

## Phase 3: Advanced Features 🟡 MEDIUM

### 3.1 — Audit Trail
- [ ] `BE` Add `AuditLog` model to Prisma schema
- [ ] `BE` Create `AuditService` for logging mutations
- [ ] `BE` Add audit logging interceptor or Prisma middleware
- [ ] `BE` Create `GET /api/audit-logs` with filters (userId, action, entity, dateRange)
- [ ] `FE` Build audit log viewer page
- [ ] `FE` Show audit history per declaration (timeline)

### 3.2 — Declaration Lifecycle / Workflow
- [ ] `BE` Add `status` enum to Declaration model: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
- [ ] `BE` Create Prisma migration for new field
- [ ] `BE` Add `POST /declarations/:id/submit` — change status to SUBMITTED
- [ ] `BE` Add `POST /declarations/:id/review` — change status to UNDER_REVIEW
- [ ] `BE` Add `POST /declarations/:id/approve` — change status to APPROVED
- [ ] `BE` Add `POST /declarations/:id/reject` — change status to REJECTED (with reason)
- [ ] `BE` Add status-based permission checks (only ADMIN+ can approve/reject)
- [ ] `FE` Build Lifecycle page with Kanban or timeline view
- [ ] `FE` Add status badges and transition buttons to declaration detail
- [ ] `FE` Filter declarations by status

### 3.3 — Document Attachments
- [ ] `BE` Add `Attachment` model (id, declarationId, filename, mimeType, url, uploadedBy, createdAt)
- [ ] `BE` Configure file upload (multer) with storage (local or cloud)
- [ ] `BE` Create `POST /declarations/:id/attachments` — upload file
- [ ] `BE` Create `GET /declarations/:id/attachments` — list attachments
- [ ] `BE` Create `DELETE /attachments/:id` — delete attachment
- [ ] `FE` Build file upload component in declaration edit modal
- [ ] `FE` Show attachment list with preview/download links

### 3.4 — Analytics Page
- [ ] `BE` Create `GET /api/stats/declarations-by-location` 
- [ ] `BE` Create `GET /api/stats/declarations-by-property-type`
- [ ] `BE` Create `GET /api/stats/user-activity` (declarations created/edited per user)
- [ ] `FE` Build Analytics page with multiple chart types (bar, pie, line)
- [ ] `FE` Add date range picker for filtering
- [ ] `FE` Add CSV export functionality

### 3.5 — Advanced Search
- [ ] `BE` Add full-text search index on declaration JSON fields
- [ ] `BE` Support advanced query params: dateFrom, dateTo, location, certNumber, partyName
- [ ] `FE` Build advanced search panel with multi-field filters
- [ ] `FE` Save/load filter presets

---

## Phase 4: Production Readiness 🟡 MEDIUM

### 4.1 — Testing
- [ ] `BE` Unit tests for `AuthService` (register, login, refresh, logout)
- [ ] `BE` Unit tests for `DeclarationsService` (CRUD)
- [ ] `BE` Integration tests for auth endpoints (supertest)
- [ ] `BE` Integration tests for declarations endpoints
- [ ] `FE` Component tests for `LoginPage`
- [ ] `FE` Component tests for `DeclarationsView`
- [ ] `FE` Component tests for `AuthGuard`
- [ ] `E2E` Login → Dashboard → Create Declaration → Edit → Delete flow

### 4.2 — DevOps
- [ ] Create `Dockerfile` for backend
- [ ] Create `Dockerfile` for frontend
- [ ] Create `docker-compose.yml` for local development
- [ ] Set up GitHub Actions CI pipeline (lint, test, build)
- [ ] Set up CD pipeline for staging deployment
- [ ] Add database migration step in CI

### 4.3 — Monitoring
- [ ] `BE` Add structured logging with request IDs
- [ ] `BE` Configure NestJS Observe with real credentials (or replace)
- [ ] Set up error tracking (Sentry)
- [ ] Add basic alerting for 5xx errors

### 4.4 — Security Audit
- [ ] Run `npm audit` on both projects and fix vulnerabilities
- [ ] Add security headers (Helmet)
- [ ] Review CORS configuration for production
- [ ] Ensure no secrets in git history
- [ ] Add CSP headers in Next.js

---

## Quick Reference: File Locations

### Backend (`property-declaration-api`)
| File | Purpose |
|------|---------|
| [`src/main.ts`](file:///d:/David/New-System/property-declaration-api/src/main.ts) | App bootstrap, CORS, pipes |
| [`src/app.module.ts`](file:///d:/David/New-System/property-declaration-api/src/app.module.ts) | Root module |
| [`src/auth/auth.controller.ts`](file:///d:/David/New-System/property-declaration-api/src/auth/auth.controller.ts) | Auth endpoints |
| [`src/auth/auth.service.ts`](file:///d:/David/New-System/property-declaration-api/src/auth/auth.service.ts) | Auth business logic |
| [`src/declarations/declarations.controller.ts`](file:///d:/David/New-System/property-declaration-api/src/declarations/declarations.controller.ts) | Declaration CRUD endpoints |
| [`src/declarations/declarations.service.ts`](file:///d:/David/New-System/property-declaration-api/src/declarations/declarations.service.ts) | Declaration business logic |
| [`prisma/schema.prisma`](file:///d:/David/New-System/property-declaration-api/prisma/schema.prisma) | Database schema |
| [`prisma/seed.ts`](file:///d:/David/New-System/property-declaration-api/prisma/seed.ts) | Seed data |

### Frontend (`property-declaration-admin`)
| File | Purpose |
|------|---------|
| [`middleware.ts`](file:///d:/David/New-System/property-declaration-admin/middleware.ts) | Auth redirect middleware |
| [`components/auth-guard.tsx`](file:///d:/David/New-System/property-declaration-admin/components/auth-guard.tsx) | Client-side auth check |
| [`components/app-sidebar.tsx`](file:///d:/David/New-System/property-declaration-admin/components/app-sidebar.tsx) | Navigation sidebar |
| [`components/declarations-view.tsx`](file:///d:/David/New-System/property-declaration-admin/components/declarations-view.tsx) | Declarations CRUD UI |
| [`lib/redux/api/authApi.ts`](file:///d:/David/New-System/property-declaration-admin/lib/redux/api/authApi.ts) | RTK Query auth endpoints |
| [`lib/redux/api/baseQueryWithReauth.ts`](file:///d:/David/New-System/property-declaration-admin/lib/redux/api/baseQueryWithReauth.ts) | Auto token refresh |
| [`lib/api.ts`](file:///d:/David/New-System/property-declaration-admin/lib/api.ts) | Legacy fetch-based API client |
| [`lib/types.ts`](file:///d:/David/New-System/property-declaration-admin/lib/types.ts) | Shared TypeScript types |
