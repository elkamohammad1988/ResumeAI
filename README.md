# ResumeAI — AI Resume & Cover Letter Generator

A full-stack web app that generates **ATS-optimized resumes and tailored cover letters** in seconds. Premium SaaS UI, multi-language output (EN / FR / AR with RTL), 4 polished PDF templates, photo embedding, live form preview, and Stripe-style design.

> Two parallel versions in this repo:
> - **`/client` + `/backend`** — production app (React 18 + Vite + Express + MongoDB + Gemini). Fully featured.
> - **`/web`** — modern rebuild in Next.js 15 + TypeScript + Supabase (Phase 1: auth + landing + dashboard skeleton).

---

## 📸 Screenshots

### Landing
![Landing page](client/public/screenshots/01-home-desktop.png)

### Generator with live template preview
![Generator with sample data + live preview](client/public/screenshots/06-generator-desktop.png)

### Pricing
![Pricing — yearly toggle + comparison](client/public/screenshots/02-pricing-desktop.png)

### Dashboard
![Dashboard — saved resumes + usage tracking](client/public/screenshots/06-generator-dashboard-desktop.png)

### Auth (Sign in)
![Sign in form](client/public/screenshots/03-login-desktop.png)

### 404
![Page not found — branded](client/public/screenshots/05-404-desktop.png)

> Mobile + full-page captures live in [`client/public/screenshots/`](client/public/screenshots/).

---

## ✨ Highlights

- **AI generation** — Google Gemini 2.5 Flash, single prompt → resume + cover letter
- **Job-description targeting** — paste the actual job posting and AI mirrors the employer's language
- **Multi-language** — English / French / Arabic (with auto RTL preview detection)
- **4 PDF templates** — Executive (premium navy + timeline + skill bars), Modern (green band), Classic (centered serif navy), Creative (two-column dark sidebar)
- **Photo upload** — auto-resized to 360×360, circular-cropped, embedded in PDF templates
- **Live form preview** — scaled mock of your chosen template updates in real time as you type
- **Form autosave** to localStorage; **regenerate** without retyping; **duplicate** saved resumes
- **Usage limits** — 5 free generations / month enforced server-side; Pro = unlimited
- **Authentication** — JWT + bcrypt, protected routes, password change endpoint
- **Dashboard** — search + filters, language + template badges, copy-to-clipboard
- **Polished UI** — dark mode, mobile responsive, scroll progress bar, page transitions, reveal animations on scroll, toast notifications, profile dropdown, focus-visible accessibility
- **Production ready** — code-split routes (initial bundle ~263 KB), Vercel + Railway configs, ErrorBoundary, SEO meta tags + OG image, sitemap, robots.txt

---

## 🧱 Stack

**v1 (`client/` + `backend/`)**
- React 18 · Vite 5 · TailwindCSS 3 · React Router 7
- Express 4 · MongoDB (Mongoose) · JWT · bcrypt
- Google Gemini 2.5 Flash · jsPDF + jspdf-autotable

**v2 (`web/`)**
- Next.js 15 (App Router · React Server Components · Server Actions)
- TypeScript 5 (strict)
- Supabase (Auth + Postgres + RLS)
- TailwindCSS 3 · `@supabase/ssr` for cookie-based session management

---

## 🚀 Quick start (v1)

```bash
git clone <this-repo>
cd ai-resume-generator
npm install               # root concurrently script
npm run dev               # backend on :5000, client on :5173
```

Open [http://localhost:5173](http://localhost:5173).

### Prerequisites
- Node.js 18+
- MongoDB (local `mongod` or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Google Gemini API key — [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free tier: 1 500 req/day)

### Env vars

```bash
# backend/.env
GEMINI_API_KEY=AIza...
MONGODB_URI=mongodb://127.0.0.1:27017/resumeDB
JWT_SECRET=any_long_random_secret
PORT=5000
GEMINI_MODEL=gemini-2.5-flash
CLIENT_ORIGIN=http://localhost:5173
```

```bash
# client/.env (optional — defaults to localhost:5000/api)
VITE_API_URL=http://localhost:5000/api
```

Copy from `.env.example` files in each folder.

---

## 🏗️ Quick start (v2 — Next.js rebuild)

```bash
cd web
npm install
cp .env.example .env.local
# Fill in Supabase + Gemini keys
npm run dev               # http://localhost:3000
```

### Supabase setup
1. Create a project at [supabase.com](https://supabase.com) (free tier)
2. Settings → API → copy the URL + anon key + service_role
3. SQL Editor → paste `web/supabase/migrations/001_initial.sql` → Run
4. Drop the values into `web/.env.local`

---

## 🌍 Deployment (v1 — production)

End-to-end live setup. Roughly 20 minutes the first time.

### 1 · MongoDB Atlas (database)
1. https://www.mongodb.com/atlas → **M0 Free** cluster
2. **Database Access** → add user (username + strong password) with read/write to `resumeDB`
3. **Network Access** → temporarily allow `0.0.0.0/0` (tighten to your backend host's IP range once deployed)
4. **Connect** → "Connect your application" → copy the `mongodb+srv://…` URI, replace `<password>` with the user password

### 2 · Stripe (payments)
1. https://dashboard.stripe.com → start in **test mode** (toggle top-right)
2. **Products** → "Add product" → name `Pro` → add **two prices**:
   - Monthly: `$9 USD` recurring → copy `price_…` → `STRIPE_PRICE_PRO_MONTHLY`
   - Yearly: `$84 USD` recurring annual → copy `price_…` → `STRIPE_PRICE_PRO_YEARLY`
3. **API keys** → copy the **Secret key** (`sk_test_…`) → `STRIPE_SECRET_KEY`
4. **Webhooks** → Add endpoint at `https://<your-backend>/api/billing/webhook`. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   Then copy the signing secret (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`

### 3 · Backend → Railway (or Render / Fly.io)
1. https://railway.app → "Deploy from GitHub" → select this repo → choose `backend/` as the root
2. Set environment variables (full list below)
3. Deploy → grab the public URL (e.g. `https://resumeai-backend.up.railway.app`)
4. Update Stripe webhook endpoint URL to point at the deployed backend
5. Add the backend URL to **Vercel** as `VITE_API_URL`

`backend/Procfile` and `backend/railway.json` are committed — Railway auto-detects them.

### 4 · Frontend → Vercel
```bash
cd client
vercel --prod
```
In Vercel project settings → Environment Variables:
- `VITE_API_URL = https://<backend-host>/api`

Re-deploy after setting.

### 5 · Stitch CORS together
Back in Railway, set `CLIENT_ORIGIN` to your Vercel URL **plus localhost** for dev:
```
CLIENT_ORIGIN=https://resumeai-seven-pi.vercel.app,http://localhost:5173
```
Redeploy the backend.

### 6 · Custom domain (optional)
- **Frontend**: Vercel project → Domains → add `resumeai.app` → set DNS A record / CNAME as instructed
- **Backend**: Railway → Settings → add custom domain (e.g. `api.resumeai.app`) — then update Vercel `VITE_API_URL` accordingly + Stripe webhook URL
- **CORS**: add the new origin to `CLIENT_ORIGIN`

### Local Stripe webhook testing
```bash
# In a third terminal alongside `npm run dev`
npm run stripe:listen        # Windows PowerShell
npm run stripe:listen:bash   # Git Bash / WSL
```
Copy the printed `whsec_…` into `backend/.env` as `STRIPE_WEBHOOK_SECRET` — that secret is unique per CLI session.

---

## 🔐 Full environment variable matrix

### Backend (Railway / Render)
| Var | Required | Example | Notes |
|---|---|---|---|
| `NODE_ENV` | yes | `production` | |
| `PORT` | yes | `5000` | Set automatically on Railway |
| `MONGODB_URI` | yes | `mongodb+srv://…` | From Atlas Connect dialog |
| `JWT_SECRET` | yes | `<64 random chars>` | Run `openssl rand -base64 48` |
| `GEMINI_API_KEY` | yes | `AIza…` | Free tier 1 500 req/day |
| `GEMINI_MODEL` | no | `gemini-2.5-flash` | Default |
| `CLIENT_ORIGIN` | yes | `https://x.vercel.app,http://localhost:5173` | Comma-separated |
| `STRIPE_SECRET_KEY` | no | `sk_test_…` / `sk_live_…` | Required to enable payments |
| `STRIPE_WEBHOOK_SECRET` | no | `whsec_…` | Required to enable payments |
| `STRIPE_PRICE_PRO_MONTHLY` | no | `price_…` | Required to enable payments |
| `STRIPE_PRICE_PRO_YEARLY` | no | `price_…` | Optional — falls back to monthly |

### Frontend (Vercel — `/client`)
| Var | Required | Example |
|---|---|---|
| `VITE_API_URL` | yes | `https://<backend>/api` |

### Next.js rebuild (Vercel — `/web`)
| Var | Required | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | `eyJ…` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | `eyJ…` (server-only) |
| `GEMINI_API_KEY` | yes | `AIza…` |
| `STRIPE_SECRET_KEY` | no | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | no | `whsec_…` |
| `STRIPE_PRICE_PRO_MONTHLY` | no | `price_…` |
| `STRIPE_PRICE_PRO_YEARLY` | no | `price_…` |
| `NEXT_PUBLIC_APP_URL` | yes | `https://resumeai.app` |

---

## 📡 API reference (v1)

All `/api/resume/*` and `/api/auth/me` routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account; returns JWT + user |
| POST | `/api/auth/login` | Login; returns JWT + user |
| GET | `/api/auth/me` | Current user (with usage) |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/toggle-plan` | Toggle free ↔ premium (testing helper) |
| POST | `/api/resume` | Generate + save resume and cover letter |
| POST | `/api/resume/:id/duplicate` | Clone a saved resume |
| GET | `/api/resume/me` | List saved resumes (compact) |
| GET | `/api/resume/:id` | Get a saved resume (full) |
| DELETE | `/api/resume/:id` | Delete a saved resume |

Returns `402 quota_exceeded` when free-tier user hits the monthly limit.

---

## 🎨 Design system

- **Accent color** — `#00d96f` (electric green) — used for CTAs, focus rings, brand mark
- **Body font** — Inter (Google Fonts), with `cv02 cv03 cv04 cv11` features for sharper numerals
- **Dark mode** — `class` strategy with no-flash bootstrap script in `<head>`
- **Animations** — `prefers-reduced-motion` respected on every keyframe
- **Accessibility** — focus-visible green ring on all interactive elements

---

## 📜 License

MIT
