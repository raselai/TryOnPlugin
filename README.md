# TryOnPlugin

Virtual try-on SaaS platform with an embeddable JavaScript widget, AI-powered image generation backend, and admin dashboard.

## Local Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** (or use [Supabase](https://supabase.com) free tier)
- **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and configure:

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

Your existing `.env` already has these set. Ensure `DATABASE_URL` and `DIRECT_URL` point to your Supabase PostgreSQL instance.

### 2. Database Setup

```bash
cd backend
npx prisma db push
npm run db:seed
```

This creates the schema and seeds plans + a **demo store** with API key `tryon_live_7422493525810c56e233b6c96f490d51` (localhost allowed).

### 3. Widget Setup

```bash
cd widget
npm install
```

### 4. Run Everything

Open **3 terminals**:

**Terminal 1 – Backend** (port 8787):
```bash
cd backend
npm run dev
```

**Terminal 2 – Widget** (port 5173):
```bash
cd widget
npm run dev
```

**Terminal 3 – Demo page** (serve the demo HTML):
```bash
npx serve demo -p 8080
```

### 5. Try It Out

1. Open **http://localhost:8080** in your browser
2. Click **"Try this"** on any product
3. Upload a photo and see the AI-generated try-on result

The demo uses the pre-seeded API key and is configured to talk to `http://localhost:8787` (backend) and load the widget from `http://localhost:5173`.

---

## Project Structure

| Folder     | Purpose                                      |
|-----------|-----------------------------------------------|
| `backend/`| Fastify API, Prisma, Gemini AI, Stripe        |
| `widget/` | Embeddable try-on widget (Vite, Shadow DOM)   |
| `dashboard/` | Next.js admin dashboard                   |
| `demo/`   | Demo storefront with product cards            |

## Optional: Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Runs at http://localhost:3000 (or next port if 3000 is in use). Create a store via the API first to get an API key for the dashboard.
