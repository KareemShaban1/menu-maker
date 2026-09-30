# Carta — Project Description

**Carta** (also referred to as Menu Maker) is a bilingual digital-menu builder for restaurants, cafés, bakeries, bars, supermarkets, and fast-food venues. Owners pick a template, customize content and styling, save a menu, and share a guest-facing link that works on phones with English/Arabic and PDF download.

Brand definition lives in `src/lib/brand.ts`:

- **Name:** Carta  
- **Tagline:** Digital menus for any table  
- **Audience:** Restaurants, cafés, bakeries, shops — Arabic and English, ready to share  

---

## 1. Current architecture (as implemented)

```text
menu maker/
├── src/                     # Vite + React SPA (primary product UI)
├── backend/                 # Express + Prisma + MySQL API (implemented)
├── BACKEND_EXPRESS.md       # API contract / implementation guide
├── DEPLOY_CONTABO.md        # Contabo VPS deploy notes
├── PROJECT.md               # this file
└── package.json             # frontend package
```

| Layer | Status | Notes |
|-------|--------|--------|
| Frontend SPA | **Live / primary** | Full builder, templates, guest view |
| Menu persistence (UI) | **`localStorage`** | `src/lib/menuStorage.ts` — browser-only |
| Backend API | **Implemented** | Auth, menus, public share, uploads, plans |
| Frontend ↔ API wiring | **Not connected yet** | No `fetch` / `VITE_` API client in `src/` |
| Auth UI (“Sign In”) | **Stub** | Header button has no login flow yet |
| Payments | **Out of scope** | Pricing page is marketing; plan change API is for dev |

**Implication:** Guests only see a published menu if that menu exists in the viewing browser’s `localStorage` (or the built-in demo fallback on `/menu/:menuId`). Server-backed public sharing is ready on the API (`GET /api/public/menus/:idOrSlug`) but not used by the SPA yet.

---

## 2. Product goals

1. Let a non-designer publish a phone-friendly digital menu in minutes.  
2. Support **Arabic + English** (including RTL).  
3. Offer **real-looking layouts** (dining card, chalkboard, wine list, shelf tags, etc.).  
4. Allow rich editing: categories, items, sizes/prices, typography, logo, multi-page, design ornaments.  
5. Let guests **share a link** and **download PDF**.  
6. (Backend) Persist menus per user, enforce plan limits, serve public share URLs, accept image uploads.

---

## 3. Tech stack

### Frontend

| Piece | Choice |
|-------|--------|
| Build | Vite 5 |
| UI | React 18 + TypeScript |
| Routing | React Router 6 (`BrowserRouter`) |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix) |
| Motion | Framer Motion |
| Drag & drop | `@dnd-kit` (categories, items, design elements) |
| Forms / validation helpers | react-hook-form, Zod (UI libs present) |
| Data fetching lib | TanStack Query (wired in `App.tsx`; not yet used for API) |
| PDF | `html2pdf.js` (guest page) |
| Icons | Lucide React |

**Dev server:** `npm run dev` → Vite on port **8080** (`vite.config.ts`).

### Backend (`backend/`)

| Piece | Choice |
|-------|--------|
| Runtime | Node.js 20+ |
| Framework | Express 4 + TypeScript |
| ORM | Prisma → **MySQL 8** |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Validation | Zod |
| Uploads | Multer → local disk under `uploads/` |
| Security | Helmet, CORS, rate limits (auth + public) |
| Local DB | `docker compose` MySQL 8.4 (`backend/docker-compose.yml`) |

**API default:** `http://localhost:4000`  
**Health:** `GET /api/health`

---

## 4. User-facing pages (frontend routes)

Defined in `src/App.tsx`:

| Route | Page | Purpose |
|-------|------|---------|
| `/` | `Index` | Marketing home: Header, Hero, Categories, Features, Footer |
| `/templates` | `Templates` | Browse all categories / templates |
| `/templates/:category` | `Templates` | Filter by category (`restaurant`, `cafe`, …) |
| `/builder/:category/:templateId` | `Builder` | Full visual menu editor |
| `/menu/:menuId` | `MenuView` | Guest-facing menu (share + PDF + language toggle) |
| `/pricing` | `Pricing` | Free / Restaurant / Business plans (EGP) |
| `/about` | `About` | Product story and who it’s for |
| `*` | `NotFound` | 404 |

Global UI chrome: bilingual header/footer, language switcher (`LanguageContext`), toast notifications.

---

## 5. Template catalog

Six business categories. Template **cards** are defined in `src/pages/Templates.tsx`. Each template maps to a **layout key** in `RealMenuDesign` via `templateLayout()`:

| Category | Template IDs (names) | Layout keys |
|----------|----------------------|-------------|
| **restaurant** (6) | Elegant Dining, Modern Bistro, Oriental Feast, Seafood Harbor, Rustic Kitchen, Fine Dining | `fine-print`, `bistro`, `levantine`, `harbor`, `tavern`, `tasting` |
| **cafe** (4) | Coffee House, Urban Brew, Garden Café, Parisian Bistrot | `chalkboard`, `brew-board`, `garden`, `bistrot` |
| **supermarket** (3) | Shelf Tags, Fresh Market, Price Sheet | `shelf-tags`, `market`, `price-sheet` |
| **bakery** (3) | Pâtisserie, Kraft Bakery, Cake Card | `patisserie`, `kraft-bakery`, `cake-card` |
| **bar** (3) | Speakeasy, Wine List, Sports Board | `speakeasy`, `wine-list`, `sports-board` |
| **fastfood** (3) | Combo Board, Street Stall, Pizzeria | `combo-board`, `street-stall`, `pizzeria` |

**Total distinct layouts rendered:** **22** (`MenuLayout` union in `src/components/RealMenuDesign.tsx`).

Flow: Home categories → Templates → Preview / Edit → `/builder/:category/:templateId`.

---

## 6. Menu data model

Canonical TypeScript shapes live in `src/lib/menuStorage.ts` and are mirrored in `backend/src/types/menu.ts`.

### `MenuData` (document)

| Field | Description |
|-------|-------------|
| `id` | Client-generated (`menu_<timestamp>_<random>`) or server `cuid` |
| `name` / `nameAr` | Menu title (EN/AR) |
| `titleStyle` / `vendorStyle` | Per-field typography |
| `vendorName` / `vendorLogo` | Brand on the menu (logo as base64 or URL) |
| `categories[]` | Sections with items |
| `designElements[]` | Optional ornaments between sections |
| `theme` | Colors, fonts, spacing, layout string |
| `pages` | Multi-page support |
| `currency` | e.g. EGP, USD, SAR, … |
| `language` | `"en"` \| `"ar"` default for the menu |
| `createdAt` / `updatedAt` | Timestamps |

### Nested structures

- **`MenuCategory`:** id, name/nameAr, optional image, nameStyle, items, optional `page`  
- **`MenuItem`:** name/nameAr, description/descriptionAr, price, optional text styles, `hasSizes` + `sizes[]`  
- **`ItemSize`:** name + price (variants like S/M/L)  
- **`TextStyle`:** fontFamily, fontSize, weight, color, lineHeight, letterSpacing, italic, underline, align, transform  
- **`DesignElement`:** image | line | divider | shape | spacer | text, with position order  
- **`MenuTheme`:** primary/background/text/card/border colors, font, size, spacing, layout  

Frontend storage key: `localStorage["savedMenus"]` → `Record<id, MenuData>`.

Helpers: `saveMenu`, `getMenu`, `getAllMenus`, `deleteMenu`, `generateMenuId`.

---

## 7. Builder (`src/pages/Builder.tsx`)

The builder is the largest feature surface. It loads template-specific sample content (`getTemplateData` / `getTemplateTheme`) and lets the owner edit live against `RealMenuDesign`.

### Capabilities

- **Live preview** of the chosen layout (EN/AR preview mode with RTL).  
- **Inline text editing** on the design (title, vendor, category, item name/description/price) via edit context in `RealMenuDesign`.  
- **Typography panel** (`TextStyleFields`) for selected text targets.  
- **Categories & items:** add/edit/remove; Arabic fields; drag-and-drop reorder (`SortableCategory`, `SortableItem`).  
- **Item sizes / variants** (`hasSizes` + size name/price).  
- **Vendor logo** upload (stored as data URL in current SPA).  
- **Currency** picker: EGP, USD, EUR, GBP, SAR, AED, KWD, QAR.  
- **Multi-page** menus (`pageCount`, assign categories to pages).  
- **Design elements** between categories: image, line, divider, shape, spacer, text — with reorder.  
- **Theme / customize** controls (colors and related theme fields).  
- **Save menu** → writes to `localStorage` via `saveMenu`.  
- **View menu** → navigates to `/menu/:menuId`.  

### UX structure

Tabs/panels typically include Design Elements, Customize, Preview, plus Save / View actions. Drag interactions use `@dnd-kit` sensors and sortable contexts.

---

## 8. Guest menu view (`src/pages/MenuView.tsx`)

Public page for diners:

1. Loads menu by `:menuId` from `localStorage` (`getMenu`).  
2. If missing, shows a **demo sample menu** (Hummus/Falafel-style fallback) so the route always renders something.  
3. **Language toggle** EN ↔ AR (updates `document.documentElement` `lang`/`dir`, remembers preference).  
4. Shows Arabic fields when available (`nameAr`, `descriptionAr`, …).  
5. **Share:** copies current URL to clipboard.  
6. **PDF:** renders visible menu with `html2pdf.js` and downloads.  
7. Supports **multi-page** display when `pages` / category `page` are set.  
8. Renders through `RealMenuDesign` when a matching layout/theme is present; also has a simpler fallback presentation path for some content.

---

## 9. i18n & RTL

`src/contexts/LanguageContext.tsx`:

- Languages: `"en"` | `"ar"`.  
- `isRTL` when Arabic.  
- `t(key)` dictionary for nav, hero, categories, features, footer, builder labels, etc.  
- Persists UI language preference.  

Marketing pages (Pricing, About, Templates copy) branch on `language === "ar"` for full Arabic copy where needed. Guest menus use bilingual fields on the data model rather than only UI strings.

---

## 10. Marketing / content pages

### Home

- **Hero:** CTA into templates / creating.  
- **Categories:** six venue types with template counts (marketing numbers).  
- **Features:** templates, item variants, QR-ready messaging, bilingual, mobile, instant updates.  

### Pricing (`/pricing`)

| Plan | Price (shown) | Claimed limits |
|------|---------------|----------------|
| Free | 0 EGP forever | 1 published menu, all templates, AR/EN + RTL, share + PDF |
| Restaurant | 199 EGP / month | Up to 5 menus, currencies & pages, type controls, logo |
| Business | 499 EGP / month | Unlimited menus, branches, priority WhatsApp, live updates |

Backend enforces the same numeric limits for create: Free **1**, Restaurant **5**, Business **unlimited** (`PLAN_LIMITS` in `backend/src/types/menu.ts`). No payment gateway is implemented.

### About

Explains pick → write → publish; audiences include restaurants, cafés/bakeries/markets, bilingual use, single share link.

---

## 11. Backend API (implemented)

Base path: `/api`. JSON envelope style `{ success, data }` (and errors via centralized handler).

### Modules

| Module | Prefix | Auth |
|--------|--------|------|
| Health | `GET /api/health` | Public |
| Auth | `/api/auth` | Register/login public; `/me` JWT |
| Menus | `/api/menus` | JWT required |
| Public | `/api/public` | Public + rate limit |
| Uploads | `/api/uploads` | JWT |
| Users | `/api/users` | JWT |

### Auth

- `POST /api/auth/register` — email, password, optional name; returns user + JWT.  
- `POST /api/auth/login` — email/password → user + JWT.  
- `GET /api/auth/me` — current user.  
- Passwords hashed with bcrypt (12 rounds).  
- Auth endpoints rate-limited.

### Menus (owner)

- `GET /api/menus` — list summaries for owner.  
- `POST /api/menus` — create (checks plan limit).  
- `GET /api/menus/:id` — full menu.  
- `PUT /api/menus/:id` — full replace.  
- `PATCH /api/menus/:id` — partial update.  
- `DELETE /api/menus/:id` — delete.  

Payload mirrors frontend `MenuData` / `MenuPayload`. Supports optional **`slug`** for pretty public URLs, `isPublished`, `templateCategory`, `templateId`. Nested document stored in MySQL **JSON** column `Menu.data`.

### Public share

- `GET /api/public/menus/:idOrSlug` — published menu by id **or** slug.  
- Rate limited (~120/min).  

### Uploads

- `POST /api/uploads` — multipart field `file` (JPEG/PNG/WebP/GIF).  
- Stored under `uploads/<userId>/`, recorded in `Upload` table, returns absolute URL.  
- Max size from `UPLOAD_MAX_MB` (default 5).  

### Users

- `PATCH /api/users/me` — update profile fields.  
- `PATCH /api/users/me/plan` — change plan (`free` \| `restaurant` \| `business`); gated by `ALLOW_PLAN_CHANGE` for non-billing environments.

### Database schema (`backend/prisma/schema.prisma`)

- **User:** id, email, passwordHash, name, plan (`free`/`restaurant`/`business`), timestamps.  
- **Menu:** id, slug?, ownerId, name, nameAr?, data (JSON), isPublished, currency, language, pages, templateCategory?, templateId?, timestamps.  
- **Upload:** id, ownerId, filename, mimeType, sizeBytes, url, createdAt.  

### Seed

`npm run seed` creates:

- User: `demo@carta.local` / `Password123!` (plan: restaurant)  
- Public menu slug: **`elegant-dining`** → `GET /api/public/menus/elegant-dining`

### Env (`backend/.env.example`)

`PORT`, `APP_URL`, `FRONTEND_URL`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, upload dirs/limits, `CORS_ORIGINS`, `DEFAULT_PLAN`, `ALLOW_PLAN_CHANGE`.

---

## 12. Integration gap (important)

| Concern | Frontend today | Backend ready |
|---------|----------------|---------------|
| Save menu | `localStorage` | `POST/PUT/PATCH /api/menus` |
| Open guest link on another device | Only if same browser storage | Public menus API |
| Sign in | Button stub | Register/login/JWT |
| Logo/images | Base64 in JSON | `/api/uploads` → URL |
| Plan limits | Marketing copy only | Enforced on create |

Recommended next step (documented in `BACKEND_EXPRESS.md`): introduce an API client, auth context, replace `menuStorage` calls with authenticated API, and load `MenuView` from `/api/public/menus/:idOrSlug`.

---

## 13. Key frontend components

| Path | Role |
|------|------|
| `src/components/RealMenuDesign.tsx` | All 22 printable layouts + inline edit hooks |
| `src/components/TextStyleFields.tsx` | Typography controls |
| `src/components/SortableCategory.tsx` / `SortableItem.tsx` | DnD lists in builder |
| `src/components/Header.tsx` / `Footer.tsx` | Site chrome + Sign In stub |
| `src/components/Hero.tsx`, `Categories.tsx`, `Features.tsx` | Landing sections |
| `src/components/LanguageSwitcher.tsx` | EN/AR toggle |
| `src/components/BrandLogo.tsx` | Brand mark |
| `src/components/ui/*` | shadcn primitives |
| `src/lib/textStyle.ts` | `TextStyle` → CSS |
| `src/lib/menuStorage.ts` | Types + local persistence |
| `src/lib/brand.ts` | Product naming |

---

## 14. Local development

### Frontend

```bash
npm install
npm run dev          # http://localhost:8080
npm run build        # output: dist/
npm run preview
```

### Backend

```bash
cd backend
cp .env.example .env
docker compose up -d          # MySQL
npm install
npx prisma generate
npx prisma migrate deploy     # or prisma migrate dev
npm run seed
npm run dev                   # http://localhost:4000
```

See `backend/README.md` for scripts and demo credentials.

---

## 15. Deployment notes

- Frontend is a static SPA after `npm run build` (`dist/`).  
- Backend is a long-running Node process (PM2 recommended on Contabo).  
- Typical Contabo setup: Nginx serves SPA + proxies `/api` (and `/uploads`) to Node — see `DEPLOY_CONTABO.md` and `BACKEND_EXPRESS.md`.  
- SPA routing requires Nginx `try_files … /index.html`.  

---

## 16. Explicitly out of scope (current codebase)

- Payment / Stripe / Fawry checkout  
- Real-time websockets  
- Server-side PDF or QR image generation (QR is marketing messaging; share is URL clipboard)  
- Multi-branch org accounts beyond plan marketing copy  
- Admin dashboard  
- Frontend wired to the Express API (planned, not done)

---

## 17. Summary

**Carta** is a Vite/React digital menu designer with **22 real layouts**, a deep **builder** (bilingual content, typography, DnD, multi-page, design elements, currencies), and a **guest view** with share + PDF. Persistence in the SPA is still **browser `localStorage`**. A complete **Express + Prisma + MySQL** backend already provides auth, CRUD menus, public slug/id access, uploads, and plan limits — awaiting frontend integration to unlock true cross-device publishing.
