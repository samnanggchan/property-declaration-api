# Product Requirements Document (PRD)

## Property Declaration Management System

**Version:** 1.0  
**Last Updated:** 2026-09-25  
**Status:** In Development

---

## 1. Overview

The **Property Declaration Management System** is a full-stack web application for managing Cambodian land/property ownership declarations (ប្រកាសអចលនទ្រព្យ). It consists of:

- **Backend API** (`property-declaration-api`) — NestJS + Prisma + PostgreSQL (Neon)
- **Admin Frontend** (`property-declaration-admin`) — Next.js 16 + React 19 + Redux Toolkit + TailwindCSS 4 + shadcn/ui

The system enables government/organizational staff to create, view, edit, print, and manage official land declaration documents, with role-based access control (RBAC) and secure cookie-based authentication.

---

## 2. Target Users

| Role | Description |
|------|-------------|
| **SUPER_ADMIN** | Full system access — manage users, roles, permissions, and all declarations |
| **ADMIN** | Manage users and declarations (no user deletion) |
| **MODERATOR** | Read users, read/write declarations |
| **VIEWER** | Read-only access to declarations |

---

## 3. Current System Architecture

### 3.1 Backend (NestJS API — Port 3003)

| Module | Status | Description |
|--------|--------|-------------|
| **AuthModule** | ✅ Built | Register, login, logout, refresh, /me endpoint |
| **DeclarationsModule** | ✅ Built | CRUD for land declarations |
| **PrismaModule** | ✅ Built | Database service (Prisma + PrismaPg adapter) |

**Authentication Flow:**
- JWT-based with HttpOnly cookies (`access_token`, `refresh_token`)
- Refresh token rotation with SHA-256 hashing and family-based replay attack detection
- Access token TTL: 7 days | Refresh token TTL: 14 days
- RBAC guard with `@RequireRoles()` and `@RequirePermissions()` decorators

**Database Schema (PostgreSQL):**
- `users` — email/password authentication
- `roles` — SUPER_ADMIN, ADMIN, MODERATOR, VIEWER
- `permissions` — READ_USERS, WRITE_USERS, DELETE_USERS, READ_DECLARATIONS, WRITE_DECLARATIONS, DELETE_DECLARATIONS
- `users_roles` — many-to-many user↔role
- `roles_permissions` — many-to-many role↔permission
- `refresh_tokens` — token rotation with family tracking
- `declarations` — land declaration data with JSON columns (seller, buyer, husband, wife, joint)

### 3.2 Frontend (Next.js Admin — Port 3000)

| Page/Feature | Status | Description |
|--------------|--------|-------------|
| **Login** | ✅ Built | Glassmorphic login with ShineBorder animation |
| **Dashboard** | ✅ Built | Summary cards, interactive area chart, data table (hardcoded data) |
| **Declarations** | ✅ Built | Full CRUD table with search, print preview, edit modal |
| **Lifecycle** | 🟡 Placeholder | "Coming soon" page |
| **Analytics** | 🟡 Placeholder | "Coming soon" page |
| **Projects** | 🟡 Placeholder | "Coming soon" page |
| **Team** | 🟡 Placeholder | "Coming soon" page |

**Frontend Auth Flow:**
- Next.js middleware checks cookies → redirect unauthenticated to `/login`
- `AuthGuard` component calls `GET /api/auth/me` via RTK Query
- `baseQueryWithReauth` automatically refreshes tokens on 401 using Mutex lock
- Redux `authSlice` stores user state (id, email, roles, permissions)

---

## 4. Data Model — Land Declaration

Each declaration represents a Cambodian land ownership transfer and contains:

| Section | Fields | Storage |
|---------|--------|---------|
| **Header** | `certNumber`, `location` | SQL columns |
| **Seller** | husband + wife `PersonFields` | JSON column |
| **Buyer** | husband + wife `PersonFields` | JSON column |
| **Husband** | stand-alone person (primary party) | JSON column |
| **Wife** | stand-alone person (primary party) | JSON column |
| **Joint Property** | propertyType, area, landUse, usageNature, possessionSource, date, charter, entity, officeAddress, repName, repRole | JSON column |

**PersonFields:** idNumber, name, dob, birthPlace, nationality, status, fatherName, motherName, address

All text fields support **Khmer Unicode** (ភាសាខ្មែរ) as the primary language.

---

## 5. Key Features — Current

### 5.1 Authentication & Authorization
- [x] Email/password registration and login
- [x] HttpOnly cookie-based JWT tokens
- [x] Refresh token rotation with replay detection
- [x] RBAC with 4 roles and 6 permissions
- [x] `@RequireRoles()` and `@RequirePermissions()` decorators
- [x] JwtAuthGuard and RbacGuard

### 5.2 Declaration Management
- [x] Create declaration (with smart Khmer defaults)
- [x] List all declarations (ordered by creation date)
- [x] View single declaration detail
- [x] Edit declaration (deep merge of nested JSON)
- [x] Delete declaration
- [x] Official print-ready document preview
- [x] Search/filter declarations in frontend

### 5.3 Admin Dashboard
- [x] Summary statistics cards
- [x] Interactive area chart (hardcoded data)
- [x] Data table with sorting
- [x] Responsive sidebar navigation

---

## 6. Identified Gaps & Missing Features

### 6.1 Backend Gaps
- [ ] **No auth guards on declarations endpoints** — currently public, no `@UseGuards(JwtAuthGuard, RbacGuard)` applied
- [ ] **No user management API** — no endpoints to list/update/delete users or manage role assignments
- [ ] **No pagination** — `findAll()` returns everything with no limit/offset
- [ ] **No API documentation** — no Swagger/OpenAPI integration
- [ ] **No input sanitization** on declaration JSON fields
- [ ] **No audit trail / activity log** — no tracking of who changed what
- [ ] **No file upload** — no document attachment support
- [ ] **Hardcoded JWT secret** — `'change-me-in-production'` fallback in production
- [ ] **No rate limiting** — vulnerable to brute-force login
- [ ] **No health check endpoint**
- [ ] **CORS origins hardcoded** to localhost

### 6.2 Frontend Gaps
- [ ] **Dashboard uses hardcoded data** — not connected to real API
- [ ] **Sidebar user info hardcoded** — shows "shadcn" / "m@example.com" instead of real user
- [ ] **No user management UI**
- [ ] **Lifecycle, Analytics, Projects, Team pages** are empty placeholders
- [ ] **Declarations API client** (`lib/api.ts`) doesn't send credentials — separate from RTK Query auth flow
- [ ] **No loading skeletons** for most pages
- [ ] **No error boundaries**
- [ ] **No role-based UI visibility** — all sidebar items shown regardless of permissions
- [ ] **No toast notifications** on declaration CRUD success/failure in some flows
- [ ] **Frontend has a local in-memory store** (`app/api/declarations/store.ts`) that duplicates backend logic

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Language** | Bilingual Khmer/English UI |
| **Response Time** | < 500ms for API calls |
| **Database** | Neon PostgreSQL (serverless) |
| **Browser Support** | Chrome, Edge, Firefox (latest 2 versions) |
| **Mobile** | Responsive via TailwindCSS |
| **Print** | A4 format Khmer official documents |
| **Security** | HttpOnly cookies, CSRF-safe, bcrypt password hashing |
