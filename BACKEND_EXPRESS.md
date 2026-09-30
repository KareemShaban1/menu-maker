# Carta — Express.js Backend Implementation Guide

Use this document as the **single source of truth** to implement the backend for **Carta (Menu Maker)**.  
Today the frontend is a Vite + React SPA that stores menus in `localStorage` (`src/lib/menuStorage.ts`). This guide replaces that with a real Express API, MySQL schema/migrations, modules, auth, uploads, and public share links.

---

## 1. Goals

| Goal | Detail |
|------|--------|
| Persist menus on the server | Replace `localStorage` save/get/list/delete |
| Public share URLs | Guests open `/menu/:menuId` (or slug) from any device |
| Auth | Register / login so menus belong to a user (“Sign In” is currently a stub) |
| Image uploads | Store logo / category / design images as URLs (not huge base64 in JSON) |
| Plan limits | Match Pricing page: Free 1 menu, Restaurant 5, Business unlimited |
| Same host deploy | Nginx serves SPA + proxies `/api` to Node (see `DEPLOY_CONTABO.md`) |

**Out of scope for v1 (optional later):** payment gateway, multi-branch orgs, websockets, server-side PDF/QR.

---

## 2. Recommended stack

| Layer | Choice | Why |
|-------|--------|-----|
| Runtime | Node.js 20+ | Matches Contabo deploy docs |
| Framework | Express 4 | Simple, modular |
| Language | TypeScript | Aligns with frontend types |
| DB | MySQL 8+ | JSON column for nested menu payload + relational ownership |
| ORM / migrations | Prisma | Schema + migrations + typed client |
| Auth | JWT (access) + bcrypt | Stateless API for SPA |
| Validation | Zod | Same lib as frontend |
| Uploads | Multer + local disk **or** S3-compatible | Start local; swap to object storage later |
| Process manager | PM2 | Contabo VPS |
| Reverse proxy | Nginx | `/api` → `localhost:4000` |

Alternative (if you prefer SQL files): Knex + `mysql2`. Keep the **same tables and API contracts** below.

---

## 3. Monorepo layout

Create a `backend/` folder next to the Vite app (keep frontend untouched until integration):

```text
menu maker/
├── src/                          # existing React frontend
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── index.ts              # app entry, listen
│   │   ├── app.ts                # express() + middleware + routes
│   │   ├── config/
│   │   │   └── env.ts
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── jwt.ts
│   │   │   └── errors.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── validate.ts
│   │   │   └── rateLimit.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.schema.ts
│   │   │   ├── menus/
│   │   │   │   ├── menus.routes.ts
│   │   │   │   ├── menus.controller.ts
│   │   │   │   ├── menus.service.ts
│   │   │   │   └── menus.schema.ts
│   │   │   ├── public/
│   │   │   │   ├── public.routes.ts
│   │   │   │   ├── public.controller.ts
│   │   │   │   └── public.service.ts
│   │   │   ├── uploads/
│   │   │   │   ├── uploads.routes.ts
│   │   │   │   ├── uploads.controller.ts
│   │   │   │   └── uploads.service.ts
│   │   │   └── users/
│   │   │       ├── users.routes.ts
│   │   │       ├── users.controller.ts
│   │   │       └── users.service.ts
│   │   └── types/
│   │       └── menu.ts           # mirror frontend MenuData
│   └── uploads/                  # gitignored local files
├── DEPLOY_CONTABO.md
└── BACKEND_EXPRESS.md            # this file
```

**Module rule:** each feature owns `routes` → `controller` → `service` → `schema`. No business logic in routes.

---

## 4. Environment variables

`backend/.env.example`:

```env
NODE_ENV=development
PORT=4000
APP_URL=http://localhost:4000
FRONTEND_URL=http://localhost:8080

DATABASE_URL=mysql://carta:carta@localhost:3306/carta

JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d

# uploads
UPLOAD_DIR=uploads
UPLOAD_MAX_MB=5
# public URL prefix for uploaded files
UPLOAD_PUBLIC_PATH=/uploads

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:8080

# plan defaults for new users: free | restaurant | business
DEFAULT_PLAN=free
```

Never commit real `.env`. Load via `dotenv` in `config/env.ts` and fail fast if required vars are missing.

---

## 5. Domain model (match frontend)

Canonical frontend shapes live in `src/lib/menuStorage.ts`. The API must accept and return the same nested JSON so the Builder / MenuView need minimal changes.

### 5.1 Core TypeScript types (backend `types/menu.ts`)

Copy these 1:1 from the frontend (optional fields stay optional):

```typescript
export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  transform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface ItemSize {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  nameStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  priceStyle?: TextStyle;
  hasSizes: boolean;
  sizes: ItemSize[];
  category: string; // parent category id
}

export interface MenuCategory {
  id: string;
  name: string;
  nameAr?: string;
  image?: string; // URL preferred (was base64)
  nameStyle?: TextStyle;
  items: MenuItem[];
  page?: number;
}

export interface MenuTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  cardColor?: string;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: string;
  spacing?: string;
  layout?: string; // e.g. "fine-print", "bistro", ...
}

export type DesignElementType =
  | "image"
  | "line"
  | "divider"
  | "shape"
  | "spacer"
  | "text";

export interface DesignElement {
  id: string;
  type: DesignElementType;
  position: number;
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageAlign?: "left" | "center" | "right";
  lineStyle?: "solid" | "dashed" | "dotted" | "double";
  lineWidth?: string;
  lineColor?: string;
  lineThickness?: string;
  shapeType?: "circle" | "square" | "rectangle" | "triangle";
  shapeColor?: string;
  shapeSize?: string;
  spacerHeight?: string;
  text?: string;
  textAlign?: "left" | "center" | "right";
  textSize?: string;
  textColor?: string;
  textBold?: boolean;
  textItalic?: boolean;
}

/** Full menu document stored as JSON (+ relational metadata columns) */
export interface MenuPayload {
  name: string;
  nameAr?: string;
  titleStyle?: TextStyle;
  vendorStyle?: TextStyle;
  categories: MenuCategory[];
  designElements?: DesignElement[];
  vendorName?: string;
  vendorLogo?: string;
  theme?: MenuTheme;
  pages?: number;
  currency?: string; // EGP | USD | EUR | GBP | SAR | AED | KWD | QAR
  language?: "en" | "ar";
}
```

### 5.2 Currencies & layouts (validate on write)

- **Currencies:** `EGP`, `USD`, `EUR`, `GBP`, `SAR`, `AED`, `KWD`, `QAR`
- **Layouts (`theme.layout`):**  
  `fine-print`, `bistro`, `levantine`, `harbor`, `tavern`, `tasting`,  
  `chalkboard`, `brew-board`, `garden`, `bistrot`,  
  `shelf-tags`, `market`, `price-sheet`,  
  `patisserie`, `kraft-bakery`, `cake-card`,  
  `speakeasy`, `wine-list`, `sports-board`,  
  `combo-board`, `street-stall`, `pizzeria`

### 5.3 Pricing / plan limits

| Plan | `plan` enum | Max published menus |
|------|-------------|---------------------|
| Free | `free` | 1 |
| Restaurant | `restaurant` | 5 |
| Business | `business` | unlimited (`null`) |

Enforce on `POST /menus` and when setting `isPublished: true`.

---

## 6. Database schema & migrations (Prisma)

### 6.1 `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum Plan {
  free
  restaurant
  business
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  plan         Plan     @default(free)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  menus        Menu[]
}

model Menu {
  id          String   @id @default(cuid())
  /// Public share segment; unique when set. Prefer human-readable slug.
  slug        String?  @unique
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  /// Display name (denormalized from payload for listing)
  name        String
  nameAr      String?
  /// Full nested MenuPayload (categories, theme, designElements, styles, …)
  data        Json
  isPublished Boolean  @default(true)
  currency    String   @default("EGP")
  language    String   @default("en") // en | ar
  pages       Int      @default(1)
  templateCategory String? // restaurant | cafe | bakery | bar | supermarket | fastfood
  templateId       Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
  @@index([isPublished])
}

model Upload {
  id        String   @id @default(cuid())
  ownerId   String
  filename  String
  mimeType  String
  sizeBytes Int
  url       String
  createdAt DateTime @default(now())

  @@index([ownerId])
}
```

### 6.2 Migration commands

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed   # optional
```

### 6.3 Why JSON for `Menu.data`?

Menus are deeply nested (categories → items → sizes + text styles + design elements).  
v1 stores the full builder document in `data` JSON and keeps searchable/list fields as columns (`name`, `slug`, `ownerId`, `isPublished`, …).  
Later you can normalize categories/items into tables without changing the public API shape.

### 6.4 Optional seed (`prisma/seed.ts`)

- One demo user: `demo@carta.local` / `Password123!`
- One published sample menu matching the MenuView fallback sample (Elegant Dining / restaurant / fine-print)

---

## 7. ID & slug strategy

| Field | Rule |
|-------|------|
| `Menu.id` | Prisma `cuid()` (stable). **Do not** regenerate on every save like the current frontend `generateMenuId()`. |
| `slug` | Optional unique public key, e.g. `kebab-case(name)-shortid`. Guests can use `/menu/:id` **or** `/menu/:slug`. |
| Frontend migration | Builder: create once → keep `id` on updates. |

Public lookup order in `public.service`:

1. Find by `id`
2. Else find by `slug`
3. Require `isPublished === true`
4. 404 otherwise

---

## 8. API contract

Base path: `/api`  
JSON only (except multipart uploads).  
Responses:

```json
{ "success": true, "data": { } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

### 8.1 Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | `{ status: "ok", time: ISO }` |

### 8.2 Auth module

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/auth/register` | No | `{ email, password, name? }` | Create user, return `{ user, token }` |
| POST | `/api/auth/login` | No | `{ email, password }` | Return `{ user, token }` |
| GET | `/api/auth/me` | Bearer | — | Current user + plan |

**Password:** min 8 chars, bcrypt cost 12.  
**Token:** `Authorization: Bearer <jwt>` with payload `{ sub: userId, email }`.

### 8.3 Menus module (owner)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/menus` | Yes | List owner’s menus (summary: id, slug, name, nameAr, currency, pages, isPublished, updatedAt) |
| POST | `/api/menus` | Yes | Create menu; body = `MenuPayload` + optional `slug`, `templateCategory`, `templateId`, `isPublished` |
| GET | `/api/menus/:id` | Yes | Full menu (must own) |
| PUT | `/api/menus/:id` | Yes | Replace payload + metadata (must own) |
| PATCH | `/api/menus/:id` | Yes | Partial update (name, isPublished, slug, data fields) |
| DELETE | `/api/menus/:id` | Yes | Delete (must own) |

**Create body example:**

```json
{
  "name": "Elegant Dining",
  "nameAr": "تناول راقي",
  "slug": "elegant-dining",
  "templateCategory": "restaurant",
  "templateId": 1,
  "isPublished": true,
  "currency": "EGP",
  "language": "en",
  "pages": 1,
  "vendorName": "Casa Bella",
  "vendorLogo": "https://your-cdn/uploads/logo.png",
  "theme": {
    "primaryColor": "#d4af37",
    "backgroundColor": "#1a1a2e",
    "textColor": "#ffffff",
    "cardColor": "#16213e",
    "borderColor": "#d4af37",
    "fontFamily": "Playfair Display",
    "fontSize": "16",
    "spacing": "5",
    "layout": "fine-print"
  },
  "categories": [],
  "designElements": [],
  "titleStyle": {},
  "vendorStyle": {}
}
```

**Create/update response `data` shape** (compatible with frontend `MenuData`):

```json
{
  "id": "clx...",
  "slug": "elegant-dining",
  "name": "Elegant Dining",
  "nameAr": "...",
  "titleStyle": {},
  "vendorStyle": {},
  "categories": [],
  "designElements": [],
  "vendorName": "...",
  "vendorLogo": "...",
  "theme": {},
  "pages": 1,
  "currency": "EGP",
  "language": "en",
  "isPublished": true,
  "templateCategory": "restaurant",
  "templateId": 1,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

Map DB row → API: spread `data` JSON and overlay column metadata (`id`, `slug`, timestamps, …).

### 8.4 Public module (guests — no auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/public/menus/:idOrSlug` | No | Published menu only |

This powers `MenuView` (`/menu/:menuId`).

### 8.5 Uploads module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/uploads` | Yes | `multipart/form-data` field `file` → `{ url, id, mimeType, sizeBytes }` |

Rules:

- Allow `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Max size from `UPLOAD_MAX_MB`
- Store under `UPLOAD_DIR/<userId>/<uuid>.<ext>`
- Serve statically at `UPLOAD_PUBLIC_PATH` in Express (`app.use('/uploads', express.static(...))`)
- Return absolute or path URL the frontend can put in `vendorLogo`, `category.image`, `designElements[].imageUrl`

### 8.6 Users / plan (minimal)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/api/users/me` | Yes | Update `{ name }` |
| PATCH | `/api/users/me/plan` | Yes* | Admin/dev only for now: `{ plan }` — or leave stub until billing |

\*For production, change plan only via payment webhook later.

---

## 9. Zod validation sketches

### Auth

```typescript
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

### Menu payload

Validate at least top-level required fields; deep-validate categories/items for production:

```typescript
export const textStyleSchema = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.number().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  lineHeight: z.number().optional(),
  letterSpacing: z.number().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  transform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
}).strict().optional();

export const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string().optional(),
  description: z.string(),
  descriptionAr: z.string().optional(),
  price: z.number(),
  nameStyle: textStyleSchema,
  descriptionStyle: textStyleSchema,
  priceStyle: textStyleSchema,
  hasSizes: z.boolean(),
  sizes: z.array(z.object({ name: z.string(), price: z.number() })),
  category: z.string(),
});

export const menuCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string().optional(),
  image: z.string().optional(),
  nameStyle: textStyleSchema,
  items: z.array(menuItemSchema),
  page: z.number().int().positive().optional(),
});

export const menuUpsertSchema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().max(200).optional(),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  titleStyle: textStyleSchema,
  vendorStyle: textStyleSchema,
  categories: z.array(menuCategorySchema),
  designElements: z.array(z.record(z.any())).optional(), // tighten later
  vendorName: z.string().optional(),
  vendorLogo: z.string().optional(),
  theme: z.record(z.any()).optional(),
  pages: z.number().int().positive().optional(),
  currency: z.enum(["EGP","USD","EUR","GBP","SAR","AED","KWD","QAR"]).optional(),
  language: z.enum(["en","ar"]).optional(),
  isPublished: z.boolean().optional(),
  templateCategory: z.enum(["restaurant","cafe","supermarket","bakery","bar","fastfood"]).optional(),
  templateId: z.number().int().positive().optional(),
});
```

Wire with middleware:

```typescript
// validate({ body: menuUpsertSchema })
```

---

## 10. Business rules (must implement)

1. **Ownership:** every protected menu route checks `menu.ownerId === req.user.id`.
2. **Plan limits:** count owner’s menus (or published menus — pick one and document it; recommend **all menus** for Free/Restaurant). Reject create with `403 PLAN_LIMIT` when at cap.
3. **Public read:** only `isPublished` menus.
4. **Slug uniqueness:** 409 if taken.
5. **Stable IDs:** updates never change `id`.
6. **Strip secrets:** never return `passwordHash`.
7. **CORS:** only `CORS_ORIGINS`.
8. **Rate limit:** auth routes (e.g. 20/min/IP); public GET softer limit.
9. **Helmet + compression** on Express.
10. **Images:** prefer uploaded URLs; if client still sends base64, either reject (`413` / validation) or accept with size cap for v1 transition.

---

## 11. Express app bootstrap (reference)

```typescript
// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import menusRoutes from "./modules/menus/menus.routes";
import publicRoutes from "./modules/public/public.routes";
import uploadsRoutes from "./modules/uploads/uploads.routes";
import usersRoutes from "./modules/users/users.routes";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  app.use(express.json({ limit: "2mb" })); // lower if base64 banned
  app.use(env.UPLOAD_PUBLIC_PATH, express.static(path.resolve(env.UPLOAD_DIR)));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", time: new Date().toISOString() } });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/menus", menusRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/uploads", uploadsRoutes);
  app.use("/api/users", usersRoutes);

  app.use(errorHandler);
  return app;
}
```

```typescript
// src/index.ts
import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();
app.listen(env.PORT, () => {
  console.log(`Carta API listening on :${env.PORT}`);
});
```

### Auth middleware sketch

```typescript
// middleware/auth.ts
// Verify JWT → attach req.user = { id, email, plan }
// export const requireAuth
// export const optionalAuth
```

### Plan limit helper

```typescript
const LIMITS: Record<string, number | null> = {
  free: 1,
  restaurant: 5,
  business: null,
};

async function assertCanCreateMenu(userId: string, plan: string) {
  const limit = LIMITS[plan];
  if (limit === null) return;
  const count = await prisma.menu.count({ where: { ownerId: userId } });
  if (count >= limit) {
    throw new AppError(403, "PLAN_LIMIT", `Your ${plan} plan allows ${limit} menu(s).`);
  }
}
```

---

## 12. `backend/package.json` scripts

```json
{
  "name": "carta-api",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Dependencies to install:**

```bash
cd backend
npm init -y
npm install express cors helmet morgan bcryptjsonwebtoken zod dotenv multer prisma @prisma/client
npm install -D typescript tsx @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/multer @types/morgan
npx tsc --init
npx prisma init
```

(Fix package names: `bcrypt` and `jsonwebtoken` separately — `npm install bcrypt jsonwebtoken`.)

---

## 13. Implementation order (checklist)

Use this sequence when coding:

- [ ] **1.** Scaffold `backend/` + TypeScript + Express health route
- [ ] **2.** Prisma schema + first migration + `prisma` client singleton
- [ ] **3.** Env config + error types (`AppError`) + global error handler
- [ ] **4.** Auth module: register, login, me + JWT middleware
- [ ] **5.** Menus module: CRUD + plan limits + row → `MenuData` mapper
- [ ] **6.** Public module: get by id/slug if published
- [ ] **7.** Uploads module + static serving
- [ ] **8.** Seed demo user + menu
- [ ] **9.** Frontend integration (next section)
- [ ] **10.** Nginx `/api` proxy + PM2 on Contabo
- [ ] **11.** (Optional) plan upgrade endpoint / billing later

---

## 14. Frontend integration (after API exists)

Keep React Query (already in `App.tsx`). Add:

### 14.1 Env

Frontend `.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

### 14.2 API client

Create `src/lib/api.ts`:

- `getToken` / `setToken` (localStorage key `carta_token`)
- `apiFetch(path, { method, body, auth })` → attaches Bearer, throws on `success: false`

### 14.3 Replace `menuStorage.ts` usage

| Current | New |
|---------|-----|
| `saveMenu` | `POST /menus` (create) or `PUT /menus/:id` (update) |
| `getMenu` | Prefer `GET /public/menus/:id` on MenuView; `GET /menus/:id` in Builder when editing |
| `getAllMenus` | `GET /menus` (dashboard — build when ready) |
| `deleteMenu` | `DELETE /menus/:id` |
| `generateMenuId` | Remove; use server `id` |

**Builder fix:** today every save calls `generateMenuId()` → new id each time. Change to:

1. First save → `POST` → store returned `id` in state / URL
2. Later saves → `PUT /menus/:id`

### 14.4 MenuView

Replace localStorage + demo fallback with:

```typescript
// fetch(`${import.meta.env.VITE_API_URL}/public/menus/${menuId}`)
```

Show loading / 404 UI when missing.

### 14.5 Images in Builder

On file select → `POST /uploads` → set `vendorLogo` / category `image` / design `imageUrl` to returned `url` instead of FileReader base64.

### 14.6 Auth UI

Wire Header “Sign In” to login/register pages or modal; store JWT; redirect unauthenticated create flows to login (or allow anonymous later — not in this guide).

---

## 15. Contabo / Nginx (API + SPA)

Extend the static deploy from `DEPLOY_CONTABO.md`:

```nginx
server {
  server_name your-domain.com;

  root /var/www/carta/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:4000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /uploads/ {
    proxy_pass http://127.0.0.1:4000/uploads/;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

PM2:

```bash
cd /var/www/carta/backend
npm ci
npx prisma migrate deploy
npm run build
pm2 start dist/index.js --name carta-api
pm2 save
```

Production frontend:

```env
VITE_API_URL=https://your-domain.com/api
```

Rebuild SPA after setting `VITE_API_URL`.

---

## 16. Testing checklist

| Case | Expected |
|------|----------|
| Register + login | Token + user |
| Create menu on Free | Success |
| Create 2nd menu on Free | 403 PLAN_LIMIT |
| GET public unpublished | 404 |
| GET public published by id and slug | 200 + full payload |
| Update another user’s menu | 403 |
| Upload png | URL works in `<img>` |
| Upload exe | 400 |
| CORS from unknown origin | Blocked |
| Health | 200 |

Manual: curl examples

```bash
curl -s http://localhost:4000/api/health

curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"Password123!","name":"Ada"}'

curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"Password123!"}'
```

---

## 17. Mapping: frontend files → backend modules

| Frontend | Backend |
|----------|---------|
| `src/lib/menuStorage.ts` | `modules/menus` + `modules/public` |
| `src/pages/Builder.tsx` save | `POST/PUT /api/menus` |
| `src/pages/MenuView.tsx` | `GET /api/public/menus/:idOrSlug` |
| Header Sign In | `modules/auth` |
| `src/pages/Pricing.tsx` limits | `User.plan` + create guard |
| Base64 images in Builder | `modules/uploads` |
| Templates list | Keep static in frontend (no API required for v1) |

---

## 18. Security notes

- Hash passwords; never log tokens or password bodies
- Parameterized queries only (Prisma)
- Validate all inputs with Zod
- Limit JSON body size; prefer URL images over base64
- Run API as non-root; firewall only 22/80/443 public
- Rotate `JWT_SECRET` carefully (invalidates sessions)
- Add HTTPS (Certbot) before production auth traffic

---

## 19. Done definition (v1)

The backend is complete when:

1. Migrations create `User`, `Menu`, `Upload`
2. Auth register/login/me work
3. Menu CRUD respects ownership and plan limits
4. Public published menu fetch works by id and slug
5. Image upload returns a usable URL
6. Frontend can save a menu on one device and open the share link on another
7. Contabo Nginx proxies `/api` and `/uploads` to PM2

Implement modules in the order of section 13. Keep API response shapes aligned with `MenuData` so the SPA stays thin.
