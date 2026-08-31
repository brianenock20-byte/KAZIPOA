# Deploying KAZIPOA

This project is a standard Node.js app (React/Vite frontend + Express/tRPC
backend, bundled together) that needs one thing to run: a MySQL database.
Everything below gets you from this zip to a public URL.

## Fastest path: Railway (recommended)

Railway runs the `Dockerfile` in this repo and gives you a MySQL database in
the same project, so it's the least setup.

1. **Push this code to a GitHub repo** (Railway deploys from GitHub).
   ```bash
   cd kazipoa
   git init && git add . && git commit -m "Initial import"
   gh repo create kazipoa-platform --private --source=. --push
   # or create the repo on github.com and `git remote add origin ...`
   ```
2. Go to **railway.app** → New Project → **Deploy from GitHub repo** → pick
   your repo. Railway will detect the `Dockerfile` and `railway.json`
   automatically.
3. In the same Railway project, click **+ New** → **Database** → **MySQL**.
   Railway provisions it and exposes a `DATABASE_URL`-style connection —
   copy it.
4. On your app service, open **Variables** and paste in everything from
   `.env.example`, filling in:
   - `DATABASE_URL` → the MySQL connection string from step 3
   - `JWT_SECRET` → generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   - `APP_BASE_URL` → Railway gives you a `*.up.railway.app` URL after first
     deploy; you can also attach a custom domain under **Settings → Domains**
   - `NODE_ENV=production`
   - `KAZIPOA_CUSTOM_AUTH_ENABLED=true`
   - Leave the Manus-only vars (`BUILT_IN_FORGE_API_URL`, etc.) blank unless
     you have them — see the note in `.env.example`.
5. Redeploy. Once it's live, run the DB migration once (Railway → your
   service → **Settings → Deploy Triggers**, or from your machine with the
   `DATABASE_URL` set locally):
   ```bash
   npm install --legacy-peer-deps
   npm run db:push
   ```
6. Visit your Railway URL — the site is live.

## Alternative: Render

1. Push to GitHub (same as step 1 above).
2. On **render.com** → New → **Web Service** → connect the repo.
3. Environment: **Docker** (it will pick up the `Dockerfile`).
4. Add a managed MySQL database (Render's own, or an external one like
   PlanetScale) and set the same environment variables as above.
5. Deploy, then run `npm run db:push` once against that `DATABASE_URL`
   (from your machine, or Render's Shell tab).

## Alternative: your own VPS

```bash
git clone <your-repo> && cd kazipoa
npm install --legacy-peer-deps
cp .env.example .env   # fill in the values
npm run build
npm run db:push
npm start               # serves on port 3000 by default
```
Put nginx or Caddy in front for TLS/HTTPS and point your domain at it.

## Setting up file storage (Cloudflare R2)

CV uploads, certificates, profile/company photos, and payment receipts are
stored in Cloudflare R2 (`server/storage.ts`). One-time setup:

1. Sign in at **dash.cloudflare.com** → **R2 Object Storage** → **Create
   bucket**. Name it e.g. `kazipoa`. (R2's free tier covers 10 GB storage
   and unlimited egress, which comfortably covers a launch-stage job board.)
2. **Manage API Tokens** → **Create API Token** → scope it to **Object Read
   & Write** on that bucket. Copy the three values it shows you:
   Account ID, Access Key ID, Secret Access Key.
3. Set these on your host (Railway/Render/VPS):
   ```
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET_NAME=kazipoa
   ```
4. (Optional) In the bucket's **Settings**, enable **Public Development URL**
   (or attach a custom domain) and set `R2_PUBLIC_URL` to it — this serves
   public images directly from R2 instead of proxying through your server.
   Leave it blank to have everything proxied through `/manus-storage/{key}`
   (works fine, just an extra hop).

### Re-upload the branding images

A handful of images (logo, hero photos, payment-method icons) are referenced
by hardcoded filename in the client but the actual image *files* live in the
original Manus project's bucket, not in this source export — Manus only
exported code, not binary assets. Upload replacements to your new R2 bucket
using these exact keys (or update the paths in the listed files to match
whatever you upload):

| File | Used in |
|---|---|
| `kazipoa-brand-mark_72c8b243.png` | `client/src/components/PortfolioBranding.tsx` |
| `kazipoa-k-mark_e85d7abf.png` | `client/src/pages/EmployerMarketplacePage.tsx` |
| `kazipoa-seeker-workplace-hero_bc5c1182.jpg` | `client/src/components/PortfolioBranding.tsx` |
| `kazipoa-employer-workplace-hero_6341c303.jpg` | `client/src/components/PortfolioBranding.tsx` |
| `kazipoa-admin-workplace-hero_b5170b35.jpg` | `client/src/components/PortfolioBranding.tsx` |
| `kazipoa-hero_3140ef94.jpg` | `server/publicVacancy.ts` (social share preview) |
| `mpesa_3ec60d65.png`, `airtel-money_d5ad5319.png`, `tigo-pesa_68d7c7d1.jpg`, `crdb_5f9e10a4.png` | `client/src/components/AcceptedPaymentMethods.tsx` |

Everything else (CVs, certificates, profile photos, receipts) is uploaded by
users at runtime and needs no manual step — it goes straight to R2.

## What works immediately vs. what needs extra setup

| Feature | Works out of the box? |
|---|---|
| Job marketplace, search, filters | ✅ |
| Seeker/employer accounts, auth | ✅ (uses built-in email/password auth) |
| Applications, interviews, notifications | ✅ |
| Admin dashboard & moderation | ✅ |
| CV/photo/certificate/receipt file uploads | ✅ once R2 is configured (above) |
| Payment workflow UI (M-Pesa reference, receipts) | ✅ (needs `MPESA_CALLBACK_SECRET` for live callback verification) |
| Transactional emails | Needs a free Postmark account + `POSTMARK_SERVER_TOKEN` |
| SMS alerts | Needs an SMS provider account |
| AI chat assist, AI image generation, Maps picker, voice transcription | Optional — still call Manus's platform; leave blank to skip |
