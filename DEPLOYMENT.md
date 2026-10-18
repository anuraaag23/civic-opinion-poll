# 🚀 Mera Vote — Complete Vercel & Supabase Production Deployment Guide

This document provides a step-by-step walkthrough to deploy the **Mera Vote (Independent India Civic Opinion Poll Platform)** to **Vercel** with a **Supabase PostgreSQL** cloud database.

---

## 📁 1. Key Deployment Files Overview

All necessary configuration files are already set up in the project:

| File | Purpose | Location |
| :--- | :--- | :--- |
| `vercel.json` | Vercel build settings, Mumbai (`bom1`) serverless region, and strict security headers (`X-Frame-Options`, `CSP`, `XSS-Protection`). | [`vercel.json`](file:///C:/Users/anura/Downloads/civic-opinion-poll/vercel.json) |
| `.env.example` | Template of all required production environment variables and cryptographic secrets. | [`.env.example`](file:///C:/Users/anura/Downloads/civic-opinion-poll/.env.example) |
| `schema.sql` | Production PostgreSQL schema with Row-Level Security (RLS) policies and the atomic `submit_anonymous_vote` stored procedure. | [`src/lib/db/schema.sql`](file:///C:/Users/anura/Downloads/civic-opinion-poll/src/lib/db/schema.sql) |
| `package.json` | Next.js 16 + React 19 production build scripts (`npm run build`, `npm run start`). | [`package.json`](file:///C:/Users/anura/Downloads/civic-opinion-poll/package.json) |

---

## 🗄️ 2. Supabase Cloud Database Setup (Step-by-Step)

Supabase provides the managed PostgreSQL database, Row Level Security, and real-time persistence.

### Step 2.1 — Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in or sign up.
2. Click **"New Project"**.
3. Choose an organization and set:
   * **Name**: `meravote-db` (or any name you prefer)
   * **Database Password**: Choose a strong password and save it securely.
   * **Region**: Select **`South Asia (Mumbai) - ap-south-1`** (Crucial for fastest speed to Indian voters).
   * **Pricing Plan**: Free (or Pro if expecting >500k votes).
4. Click **"Create new project"** and wait ~1 minute for provisioning.

---

### Step 2.2 — Run the Database Migration Script
1. In the Supabase left navigation bar, click the **SQL Editor** icon (`>_`).
2. Click **"New Query"**.
3. Open [`src/lib/db/schema.sql`](file:///C:/Users/anura/Downloads/civic-opinion-poll/src/lib/db/schema.sql) from your project, copy the entire SQL script, and paste it into the editor.
4. Click the green **"Run"** button (or press `Ctrl+Enter`).
5. You will see `Success. No rows returned`.

**What this creates:**
* `polls` — Poll configurations, schedules, and statuses.
* `parties` — Directory of political parties with bilingual metadata.
* `poll_options` — Poll candidate/party choices.
* `participation` — Keyed HMAC fingerprints preventing duplicate voting.
* `anonymous_tokens` — Single-use CSPRNG tokens with 15-minute expiration.
* `vote_counts` — Aggregate atomic counters.
* `audit_events` — Sanitized compliance and security event logs.
* `supporters` — Chai support ledger and verification records.
* `site_settings` — Platform banner alerts and maintenance switches.
* `submit_anonymous_vote()` — Stored procedure that prevents race conditions and enforces one vote per token.
* Row-Level Security (RLS) policies protecting voter privacy.

---

### Step 2.3 — Copy Your Supabase API Keys
1. In Supabase, go to **Project Settings** (gear icon at the bottom left) -> **API**.
2. Copy down the following three values:
   * **Project URL**: e.g., `https://xyzcompany.supabase.co`
   * **`anon` `public` key**: (Public JWT token for client-side queries)
   * **`service_role` `secret` key**: (Private secret key for server-side verification and admin actions)

---

## ☁️ 3. Deploying to Vercel (Step-by-Step)

You can deploy either using **GitHub (Recommended)** or via the **Vercel CLI**.

### Option A: Via GitHub (Recommended)

1. **Push your code to GitHub:**
   Open PowerShell in the project directory (`C:\Users\anura\Downloads\civic-opinion-poll`):
   ```powershell
   git init
   git add .
   git commit -m "feat: production ready civic opinion poll"
   git branch -M main
   git remote add origin https://github.com/<your-username>/civic-opinion-poll.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   * Go to [https://vercel.com](https://vercel.com) and log in.
   * Click **"Add New..."** -> **"Project"**.
   * Select your GitHub repository (`civic-opinion-poll`) and click **"Import"**.

3. **Configure Project Settings:**
   * **Framework Preset**: Next.js (automatically detected)
   * **Root Directory**: `./` (leave default)
   * **Build Command**: `next build` (or leave default)
   * **Output Directory**: `.next` (leave default)

4. **Add Environment Variables (See Section 4 below before clicking Deploy!)**

---

### Option B: Via Vercel CLI (Direct Deployment)

If you do not want to use GitHub, you can deploy directly from your terminal:

1. Install the Vercel CLI globally:
   ```powershell
   npm install -g vercel
   ```
2. Login to Vercel:
   ```powershell
   vercel login
   ```
3. Deploy to production:
   ```powershell
   vercel --prod
   ```
4. Follow the interactive prompts to link your project.

---

## 🔐 4. Environment Variables Configuration

In your Vercel Project Dashboard, navigate to **Settings** -> **Environment Variables**. Add the following variables (select **Production**, **Preview**, and **Development** for each):

| Variable Name | Example / Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode |
| `PRODUCTION` | `true` | Enforces production security guards |
| `NEXT_PUBLIC_APP_URL` | `https://meravote.in` | Your primary canonical domain |
| `VOTING_HMAC_SECRET` | *(Generate 64-char hex string)* | Key used to hash EPICs and prevent duplicate votes |
| `ANONYMOUS_TOKEN_SECRET` | *(Generate 64-char hex string)* | Key used to sign ephemeral anonymous voting tokens |
| `CLIENT_SALT` | *(Random 32-char string)* | Anti-tamper salt for client requests |
| `ADMIN_PASSCODE` | `YourSecureAdminPasscode2026!` | Password to access the `/admin` portal |
| `ADMIN_SESSION_SECRET` | *(Generate 64-char hex string)* | Key used to encrypt admin session cookies |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Anon Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role Secret Key |
| `KOFI_VERIFICATION_TOKEN` | *(Optional UUID)* | For Ko-fi support webhook |
| `BUYMEACHAI_WEBHOOK_SECRET` | *(Optional secret)* | For BuyMeAChai / UPI webhook |

### 💡 How to Generate Secure Cryptographic Secrets
Run this command in your PowerShell or terminal to generate random 64-character hex strings:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run it 3 times to get distinct random strings for:
1. `VOTING_HMAC_SECRET`
2. `ANONYMOUS_TOKEN_SECRET`
3. `ADMIN_SESSION_SECRET`

---

## 🌐 5. Custom Domain Configuration (`meravote.in`)

To connect your custom domain (e.g. `meravote.in`):

1. Go to your **Vercel Dashboard** -> Project -> **Settings** -> **Domains**.
2. Enter your domain: `meravote.in` and click **"Add"**.
3. Choose **"Add meravote.in and redirect www.meravote.in to it"** (Recommended).
4. Vercel will display the required DNS records for your domain registrar (GoDaddy, Namecheap, Hostinger, Cloudflare, etc.):
   * **Type**: `A` | **Name**: `@` | **Value**: `76.76.21.21`
   * **Type**: `CNAME` | **Name**: `www` | **Value**: `cname.vercel-dns.com`
5. Once DNS propagates (usually 5 to 15 minutes), Vercel automatically generates a free SSL/TLS certificate with automatic renewal.

---

## 🔍 6. Post-Deployment Verification Checklist

Once deployed, perform this quick 5-point verification:

1. **Visit Homepage**:
   - Check that the site loads with full Hindi/English translation toggle working.
   - Verify that Theme switching (Light, Dark, System) works smoothly with proper contrast.
2. **Test Voter ID Verification**:
   - Open a poll (e.g., `/pm` or `/cm`).
   - Enter a test Voter ID (e.g. `XYZ9876543`), solve the anti-bot math challenge, and click **"Verify & Vote"**.
   - Verify that the single-use anonymous ballot opens.
3. **Test Duplicate Vote Prevention**:
   - Try to enter the same Voter ID again in an Incognito window or different browser.
   - Confirm it returns: **"This Voter ID has already cast a vote in this poll."**
4. **Test Admin Dashboard**:
   - Navigate to `/admin`.
   - Enter your `ADMIN_PASSCODE`.
   - Verify poll controls, bilingual auto-translation, supporters management, and export features.
5. **Test Chai Support Modal**:
   - Click the animated Chai Cup button.
   - Ensure the QR code, UPI ID, and supporter message form open properly.
