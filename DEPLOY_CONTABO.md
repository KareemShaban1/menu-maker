# Deploy Carta (Menu Maker) on Contabo VPS

Carta is a **Vite + React SPA** plus an **Express API** (Prisma + MySQL).  
On Contabo you typically run everything on one VPS:

| Piece | How it runs in production |
|-------|---------------------------|
| Frontend | Nginx serves `dist/` (static files) |
| API | Node (PM2) on `127.0.0.1:4000` |
| Database | MySQL 8 on the same server (or Docker) |
| Uploads | Served by the API; Nginx proxies `/uploads/` |
| Public URL | `https://yourdomain.com` → SPA; `/api` + `/uploads` → API |

The SPA calls the API using `VITE_API_URL` (baked in at **build** time). Prefer same-origin:

```env
VITE_API_URL=https://yourdomain.com/api
```

---

## 1. What you need

| Item | Notes |
|------|--------|
| Contabo VPS | Ubuntu 22.04 or 24.04 LTS, **2 GB RAM+** recommended (Node + MySQL) |
| Domain | DNS `A` record → VPS public IP |
| SSH | Root or sudo user from Contabo panel |
| Node.js | **20+** on the server (build SPA + run API) |
| MySQL 8 | Native install or Docker |
| Disk | Space for `uploads/` and MySQL data |

---

## 2. Contabo panel checklist

1. Open the VPS in the [Contabo Customer Control Panel](https://my.contabo.com/).
2. Note **public IP** and SSH credentials (or key).
3. Allow inbound:
   - **22** (SSH)
   - **80** (HTTP)
   - **443** (HTTPS)  
   Do **not** expose MySQL (`3306`) or the API port (`4000`) publicly.
4. Point DNS:
   - Type: `A`
   - Host: `@` (and `www` if needed)
   - Value: VPS IP  
   Wait for propagation before Certbot.

---

## 3. Connect and prepare the server

```bash
ssh root@YOUR_SERVER_IP
apt update && apt upgrade -y
```

Optional deploy user:

```bash
adduser deploy
usermod -aG sudo deploy
```

Suggested layout:

```text
/var/www/carta/
├── frontend/          # git clone of the repo (or SPA build source)
├── dist/              # built SPA files served by Nginx  (or frontend/dist)
└── backend/           # API (can live inside the clone: /var/www/carta/backend)
```

This guide uses one git clone:

```text
/var/www/carta/                 # repository root
├── dist/                       # npm run build output (SPA)
├── backend/                    # Express API
└── ...
```

---

## 4. Install required software

### Nginx

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # v20.x
npm -v
```

### PM2

```bash
npm install -g pm2
```

### Git

```bash
apt install -y git
```

### Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### MySQL 8 (native)

```bash
apt install -y mysql-server
systemctl enable mysql
systemctl start mysql
```

Secure and create DB/user:

```bash
mysql_secure_installation
```

```sql
CREATE DATABASE carta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'carta'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON carta.* TO 'carta'@'localhost';
FLUSH PRIVILEGES;
```

**Alternative — MySQL via Docker** (from `backend/`):

```bash
apt install -y docker.io docker-compose-v2
cd /var/www/carta/backend
docker compose up -d
# Default from docker-compose.yml:
# DATABASE_URL=mysql://carta:carta@127.0.0.1:3306/carta
```

If you use Docker MySQL in production, change the default passwords and do not expose `3306` to the internet.

### Firewall (UFW)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## 5. Clone the project

```bash
mkdir -p /var/www
cd /var/www
git clone YOUR_GIT_REPO_URL carta
cd carta
```

---

## 6. Configure and start the API

```bash
cd /var/www/carta/backend
cp .env.example .env
nano .env
```

Production `.env` example (replace domain, secrets, and DB password):

```env
NODE_ENV=production
PORT=4000
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

DATABASE_URL=mysql://carta:STRONG_PASSWORD_HERE@localhost:3306/carta

JWT_SECRET=use-a-long-random-string-at-least-32-chars
JWT_EXPIRES_IN=7d

UPLOAD_DIR=uploads
UPLOAD_MAX_MB=5
UPLOAD_PUBLIC_PATH=/uploads

# Must include your real site origin(s)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

DEFAULT_PLAN=free

# Set false in production once you manage plans via admin / billing
ALLOW_PLAN_CHANGE=false
```

Notes:

- `APP_URL` is used when building absolute upload URLs. With Nginx proxying `/uploads` on the same domain, set it to `https://yourdomain.com` (not `:4000`).
- `JWT_SECRET` must be unique and private; rotating it logs everyone out.
- Never commit `.env`.

Install, migrate, build, run:

```bash
cd /var/www/carta/backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run seed          # optional: demo user + sample menu
npm run build
mkdir -p uploads
pm2 start dist/index.js --name carta-api
pm2 save
pm2 startup           # follow the printed command so PM2 survives reboot
```

Optional seed credentials (if you ran seed):

- Email: `demo@carta.local`
- Password: `Password123!`
- Public menu: `GET /api/public/menus/elegant-dining`

Smoke test on the server:

```bash
curl -s http://127.0.0.1:4000/api/health
# expect: {"success":true,"data":{"status":"ok",...}}
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs carta-api
pm2 restart carta-api
```

---

## 7. Build the frontend (SPA)

`VITE_API_URL` is compiled into the JS bundle. Set it **before** `npm run build`.

```bash
cd /var/www/carta
nano .env.production
```

```env
VITE_API_URL=https://yourdomain.com/api
```

Or export once:

```bash
export VITE_API_URL=https://yourdomain.com/api
```

Build:

```bash
cd /var/www/carta
npm ci
npm run build
# output: /var/www/carta/dist
```

Permissions for Nginx:

```bash
chown -R www-data:www-data /var/www/carta/dist
```

### Build on your PC instead

```bash
# local project root
echo "VITE_API_URL=https://yourdomain.com/api" > .env.production
npm ci
npm run build
rsync -avz --delete dist/ root@YOUR_SERVER_IP:/var/www/carta/dist/
```

---

## 8. Nginx configuration (SPA + API + uploads)

```bash
nano /etc/nginx/sites-available/carta
```

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name yourdomain.com www.yourdomain.com;

    root /var/www/carta/dist;
    index index.html;

    client_max_body_size 8m;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 256;

    # Express API
    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded images (logo, etc.)
    location /uploads/ {
        proxy_pass http://127.0.0.1:4000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Cache hashed Vite assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback (React Router: /builder, /menu, /login, /admin, …)
    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

Enable and reload:

```bash
ln -sf /etc/nginx/sites-available/carta /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Visit `http://yourdomain.com` (or the server IP while testing).

---

## 9. HTTPS with Let’s Encrypt

After DNS points to the VPS:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Then confirm:

1. Backend `APP_URL`, `FRONTEND_URL`, and `CORS_ORIGINS` use `https://…`
2. Frontend was built with `VITE_API_URL=https://yourdomain.com/api`
3. Restart API if you changed `.env`:

```bash
pm2 restart carta-api
```

Renewal check:

```bash
certbot renew --dry-run
```

---

## 10. Redeploy after code changes

```bash
cd /var/www/carta
git pull

# Backend
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart carta-api

# Frontend (keep production API URL)
cd /var/www/carta
# ensure .env.production still has VITE_API_URL=https://yourdomain.com/api
npm ci
npm run build
chown -R www-data:www-data dist
```

### Deploy script example

Save as `/usr/local/bin/deploy-carta`:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT=/var/www/carta
DOMAIN_API_URL="${VITE_API_URL:-https://yourdomain.com/api}"

cd "$ROOT"
git pull

cd "$ROOT/backend"
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart carta-api

cd "$ROOT"
export VITE_API_URL="$DOMAIN_API_URL"
npm ci
npm run build
chown -R www-data:www-data "$ROOT/dist"

echo "Carta deployed."
curl -s http://127.0.0.1:4000/api/health
echo
```

```bash
chmod +x /usr/local/bin/deploy-carta
deploy-carta
```

---

## 11. Environment reference

### Frontend (build-time)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `https://yourdomain.com/api` | Base URL used by `src/lib/api.ts` |

File: project root `.env.production` (or export before build). See `.env.example`.

### Backend (runtime)

| Variable | Production tip |
|----------|----------------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` (localhost only; Nginx proxies) |
| `APP_URL` | Public site origin, e.g. `https://yourdomain.com` |
| `FRONTEND_URL` | Same as site origin |
| `DATABASE_URL` | `mysql://USER:PASS@localhost:3306/carta` |
| `JWT_SECRET` | Long random secret (≥16 chars; use 32+) |
| `CORS_ORIGINS` | Comma-separated HTTPS origins of the SPA |
| `UPLOAD_DIR` | `uploads` (persist this folder across deploys) |
| `ALLOW_PLAN_CHANGE` | `false` in production unless you intentionally allow it |

Full template: `backend/.env.example`.

---

## 12. What the live stack supports

After a correct deploy you should have:

- Marketing pages: `/`, `/templates`, `/pricing`, `/about`
- Auth: `/login`, `/register`, `/profile`
- Builder + API save: `/builder/:category/:templateId`
- Public guest menus: `/menu/:menuId` (loads via `GET /api/public/menus/:idOrSlug`)
- Admin (super_admin): `/admin`, `/admin/users`, `/admin/plans`, …
- Health: `https://yourdomain.com/api/health`
- Uploads: `https://yourdomain.com/uploads/...`

---

## 13. Optional: subdirectory deploy

If the app is not at the domain root, set Vite `base`, React Router `basename`, and adjust Nginx `location` blocks. Also set `VITE_API_URL` to the public `/api` path you expose. Prefer a dedicated subdomain/root deploy for fewer edge cases.

---

## 14. Troubleshooting

| Problem | Fix |
|---------|-----|
| SPA loads but login/API fails | Rebuild SPA with correct `VITE_API_URL`; check Nginx `/api/` proxy; `pm2 logs carta-api` |
| CORS errors in browser | Add exact origin to backend `CORS_ORIGINS`, restart PM2 |
| 404 on refresh of `/builder/...` or `/admin` | Missing SPA `try_files … /index.html;` |
| `/api/health` 502 | API not running: `pm2 status`, `curl 127.0.0.1:4000/api/health` |
| DB connection errors | Check MySQL service, `DATABASE_URL`, user privileges |
| Migrations fail | Run `npx prisma migrate deploy` from `backend/` with correct `.env` |
| Images 404 | Nginx `/uploads/` proxy; `APP_URL` matches public domain; files exist under `backend/uploads` |
| Upload too large | Raise Nginx `client_max_body_size` and `UPLOAD_MAX_MB` |
| SSL fails | DNS not pointing yet; retry Certbot later |
| Old frontend after deploy | Confirm new `dist/` files; hard refresh; rebuild after env change |

Logs:

```bash
pm2 logs carta-api
tail -f /var/log/nginx/error.log
journalctl -u mysql -n 50   # if using system MySQL
```

---

## 15. Quick checklist

- [ ] Contabo VPS + SSH  
- [ ] Ports 22 / 80 / 443 only (not 3306 / 4000 public)  
- [ ] Domain `A` → VPS IP  
- [ ] Node 20, Nginx, PM2, MySQL installed  
- [ ] Repo cloned under `/var/www/carta`  
- [ ] `backend/.env` production values set  
- [ ] `prisma migrate deploy` + `npm run build` + `pm2 start carta-api`  
- [ ] `curl 127.0.0.1:4000/api/health` OK  
- [ ] Frontend built with `VITE_API_URL=https://yourdomain.com/api`  
- [ ] Nginx proxies `/api/` and `/uploads/`, SPA fallback enabled  
- [ ] Certbot HTTPS  
- [ ] Test: register/login, save menu, open `/menu/:id` in another browser, admin if applicable  

---

## Summary

1. Install **Nginx + Node 20 + MySQL + PM2** on Contabo.  
2. Configure `backend/.env`, migrate, build, run API with **PM2**.  
3. Build the SPA with **`VITE_API_URL=https://yourdomain.com/api`**.  
4. Nginx serves **`dist/`**, proxies **`/api`** and **`/uploads`** to port **4000**.  
5. Enable **HTTPS** with Certbot and keep `CORS_ORIGINS` / `APP_URL` on HTTPS.

For API contracts and module details, see `BACKEND_EXPRESS.md` and `backend/README.md`.
