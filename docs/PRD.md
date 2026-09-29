# Product Requirements Document (PRD)

## Property Declaration Management System

**Version:** 1.2  
**Last Updated:** 2026-09-29  
**Status:** In Development

---

## 1. Overview

The **Property Declaration Management System** is a full-stack web application for managing Cambodian land/property ownership declarations (លិខិតប្រកាសផ្ទេរសិទ្ធិកាន់កាប់អចលនទ្រព្យ) and Cadastral Extract Certificates (តារាងសម្រង់វិញ្ញាបនប័ត្រសម្គាល់ម្ចាស់អចលនវត្ថុ - LMAP & HOUSE variants). It consists of:

- **Backend API** (`property-declaration-api`) — NestJS + Prisma + PostgreSQL (Neon)
- **Admin Frontend** (`property-declaration-admin`) — Next.js 16 + React 19 + Redux Toolkit + TailwindCSS 4 + shadcn/ui

The system enables government/organizational staff to create, view, edit, print, and manage official land declaration documents and cadastral certificates, with role-based access control (RBAC) and secure cookie-based authentication.

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
| **DeclarationsModule** | ✅ Built | CRUD for land declarations & cadastral certificates |
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
- `declarations` — land declaration data with JSON columns (seller, buyer, husband, wife, joint including cadastral and witness details)

### 3.2 Frontend (Next.js Admin — Port 3000)

| Page/Feature | Status | Description |
|--------------|--------|-------------|
| **Login** | ✅ Built | Glassmorphic login with ShineBorder animation |
| **Dashboard** | ✅ Built | Summary cards, interactive area chart, data table |
| **Declarations** | ✅ Built | Full CRUD table with search, print preview, dual-mode tabs |
| **Official Declaration Print** | ✅ Built | Authentic scanned document layout matching Cambodian land title transfer standard |
| **Cadastral Certificate (LMAP / HOUSE)** | ✅ Built | Official 2-page cadastral extract certificate with 6-tab modal editor |
| **Legal Entity & Company Rep** | ✅ Built | Company details + dedicated 1-person representative form and document table |
| **2-Witness System** | ✅ Built | 2 clean witness forms with real-time automatic DOB age calculation in Khmer numerals |
| **Lifecycle** | 🟡 Placeholder | "Coming soon" page |
| **Analytics** | 🟡 Placeholder | "Coming soon" page |
| **Projects** | 🟡 Placeholder | "Coming soon" page |
| **Team** | 🟡 Placeholder | "Coming soon" page |

---

## 4. Data Model — Land Declaration & Cadastral Certificate

Each declaration represents a Cambodian land ownership transfer and contains:

| Section | Fields | Storage |
|---------|--------|---------|
| **Header** | `certNumber`, `location` | SQL columns |
| **Seller** | husband + wife `PersonFields` | JSON column |
| **Buyer** | husband + wife `PersonFields` | JSON column |
| **Husband** | stand-alone person (primary party) | JSON column |
| **Wife** | stand-alone person (primary party) | JSON column |
| **Joint Property** | propertyType, area, landUse, usageNature, possessionSource, date, charter, entity, officeAddress, repName, repRole, repPerson, witness1, witness2, witnesses | JSON column |
| **Cadastral Details** | sheetNumber, parcelNumber, khan, sangkat, village, city, landUseNature, landType, transferType, transferDeedNo, transferDeedDate, encumbrance, otherRemarks, variant (LMAP/HOUSE), boundaries (north, east, south, west) | Nested in joint or SQL cadastral |

**PersonFields:** idNumber, name, dob, birthPlace, nationality, status, fatherName, motherName, address  
**WitnessPerson:** name, dob (with dynamic age calculation), idNumber, address  

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

### 5.2 Declaration Management & Authentic Print
- [x] Create/Edit declaration with dual-party seller & buyer (Husband & Wife)
- [x] Legal Entity (នីតិបុគ្គល) support with dedicated 1-person Company Representative (អ្នកតំណាង ឬអ្នកគ្រប់គ្រង)
- [x] 2-Witness System (សាក្សី) with live automatic DOB age calculation relative to today (e.g. `23.10.2004` -> `២១ ឆ្នាំ`)
- [x] Official Declaration Document print preview matching authentic scanned land office paper
- [x] Cadastral Extract Certificate (តារាងសម្រង់វិញ្ញាបនប័ត្រ - LMAP & HOUSE variants) with 6-tab modal editor
- [x] Search/filter declarations in frontend

### 5.3 Admin Dashboard
- [x] Summary statistics cards
- [x] Interactive area chart
- [x] Responsive sidebar navigation

---

## 6. Identified Gaps & Missing Features

### 6.1 Backend Gaps
- [ ] **Protect declaration endpoints with auth guards** — apply `@UseGuards(JwtAuthGuard, RbacGuard)`
- [ ] **User management API** — endpoints to list/update/delete users and manage role assignments
- [ ] **Pagination & Filtering** on `GET /declarations` (page, limit, search)
- [ ] **API documentation** — Swagger/OpenAPI integration (`@nestjs/swagger`)
- [ ] **Rate limiting** — `@nestjs/throttler` on login/register
- [ ] **Health check endpoint** — `GET /health`

### 6.2 Frontend Gaps
- [ ] **Connect Dashboard to live API stats** — replace hardcoded numbers
- [ ] **Sidebar user info** — display authenticated user email and role badge
- [ ] **User management page (`/team`)** — admin UI to manage staff accounts and roles
- [ ] **Migrate declarations API client to RTK Query** — leverage `baseQueryWithReauth`
- [ ] **Loading skeletons and error boundaries**

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Language** | Bilingual Khmer/English UI (Primary Khmer Unicode) |
| **Response Time** | < 500ms for API calls |
| **Database** | Neon PostgreSQL (serverless) |
| **Browser Support** | Chrome, Edge, Firefox (latest 2 versions) |
| **Mobile** | Responsive via TailwindCSS |
| **Print** | A4 format Khmer official documents with signature lines & seals |
| **Security** | HttpOnly cookies, CSRF-safe, bcrypt password hashing |
