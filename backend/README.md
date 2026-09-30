# Carta API (Express)

Backend for the Menu Maker SPA. See root `BACKEND_EXPRESS.md` for the full contract.

## Quick start

1. Copy env and start MySQL:

```bash
cd backend
cp .env.example .env
docker compose up -d
```

Or point `DATABASE_URL` at your own MySQL 8+ instance, e.g.:

```env
DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/carta
```

Create the database first if needed: `CREATE DATABASE carta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

2. Install and migrate:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

API: `http://localhost:4000/api/health`

## Demo credentials (after seed)

- Email: `demo@carta.local`
- Password: `Password123!`
- Public menu: `GET /api/public/menus/elegant-dining`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Watch mode (tsx) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm run prisma:migrate` | Dev migrations |
| `npm run prisma:deploy` | Production migrations |
| `npm run seed` | Demo user + menu |
