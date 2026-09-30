# Independent India Civic Opinion Poll Platform
**Bilingual, Privacy-Preserving Civic Technology for Public Opinion Polling**

> **IMPORTANT LEGAL NOTICE & NON-AFFILIATION DISCLAIMER**  
> This platform is an independent civic opinion-poll tool. It is **not operated by, authorized by, affiliated with, or endorsed by the Election Commission of India (ECI) or the Government of India**. Participation on this platform does **NOT** constitute an official election vote, nor does it affect official electoral rolls.

---

## 1. What the Platform Does & Does Not Do

### What It Does
* Enables verified Indian citizens to participate in independent public opinion surveys.
* Guarantees **absolute cryptographic separation** between voter eligibility and vote storage.
* Uses keyed **HMAC-SHA256 participation fingerprints** to strictly enforce one response per verified participant per poll.
* Generates ephemeral, cryptographically secure 256-bit random anonymous voting credentials.
* Records responses using atomic database transactions (`vote_count = vote_count + 1`).
* Displays real-time aggregate public opinion results with 2D visualizations and sampling methodology disclaimers.
* Provides full bilingual support (**English** and **हिन्दी**) across all views.
* Presents an Apple-grade **Liquid Glass design system** with light, dark, and system themes.

### What It NEVER Does
* Never claims to be an official election or government voting portal.
* Never displays a voter's name, address, father's name, date of birth, or polling station after verification.
* Never records, logs, or associates a voter's EPIC number or identity with their chosen political party.
* Never allows administrators or analysts to view individual ballots or an "EPIC → Party" mapping.
* Never uses biased ordering, political endorsements, or persuasive styling.

---

## 2. Architecture & Identity-Separation Model

The core architectural guarantee is that **Identity Verification** and **Vote Storage** are completely decoupled:

```
[ Participant enters EPIC: ABC1234567 ]
                   │
                   ▼
     ┌───────────────────────────┐
     │ In-Memory Verification    │
     │ Format & provider check   │
     └───────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐ ┌──────────────────────────┐
│  Duplicate-     │ │  Anonymous Voting        │
│  Prevention     │ │  Credential              │
│  HMAC-SHA256(   │ │  CSPRNG 256-bit Token    │
│   secret,       │ │  Token Hash = SHA-256    │
│   EPIC:PollId   │ │  Expires in 15 minutes   │
│  )              │ └────────────┬─────────────┘
└────────┬────────┘              │ (Given to client browser)
         │                       ▼
         │          ┌──────────────────────────┐
         │          │ Client Casts Response    │
         │          │ Option + Anonymous Token │
         │          └────────────┬─────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐ ┌──────────────────────────┐
│ `participation` │ │ Atomic Transaction:      │
│ UNIQUE(poll_id, │ │ 1. Verify token hash     │
│   fingerprint)  │ │ 2. Mark token USED       │
│                 │ │ 3. `vote_count += 1`     │
│ Rejects double  │ │                          │
│ submissions     │ │ NO link to voter identity│
└─────────────────┘ └──────────────────────────┘
```

### Why Hash ≠ Unconditionally Anonymous
EPIC numbers conform to a structured alphanumeric pattern (`[A-Z]{3}[0-9]{7}`). A plain SHA-256 hash would be vulnerable to offline dictionary rainbow-table attacks. To neutralize this risk, we compute:
$$\text{HMAC-SHA256}(K_{\text{server\_secret}}, \text{EPIC} \parallel \text{":"} \parallel \text{poll\_id})$$
The high-entropy server secret is stored strictly in server-side environment variables and never committed to the database. Participation fingerprints are purged following poll closure.

---

## 3. Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode)
* **Styling**: Tailwind CSS v4, Custom 3D Liquid Glass Design System
* **Animation & Micro-interactions**: Apple-inspired fluid motion, CSS 3D transforms, Framer Motion
* **Database**: PostgreSQL (Supabase / Neon / Self-Hosted) with portable in-memory fallback
* **Security**: CSPRNG token generation, HMAC-SHA256, rate limiting, RLS policies, production safety guards
* **Testing**: Vitest suite (Cryptographic, Verification, Concurrency, and Atomic Transaction tests)

---

## 4. Database Schema (PostgreSQL / Supabase)

The full DDL is located at [`src/lib/db/schema.sql`](file:///C:/Users/anura/Downloads/civic-opinion-poll/src/lib/db/schema.sql).

### Key Tables
* `polls`: Poll metadata, lifecycle status (`DRAFT`, `SCHEDULED`, `LIVE`, `PAUSED`, `CLOSED`, `ARCHIVED`), start/end timestamps.
* `parties`: Official recognized parties, verified SVGs, bilingual titles, neutral display orders.
* `poll_options`: Options associated with each active poll.
* `participation`: Stores only `poll_id` + `participation_fingerprint` with a `UNIQUE(poll_id, participation_fingerprint)` constraint.
* `anonymous_tokens`: Ephemeral token hashes (`SHA-256(token)`) with expiration and consumption timestamps.
* `vote_counts`: Atomic aggregate counters (`poll_id`, `option_id`, `vote_count`).
* `audit_events`: Sanitized security logs without PII or vote choice.

---

## 5. Local Development Setup

### Prerequisites
* Node.js v20+ (tested on Node v24.15.0)
* npm v10+

### Steps
1. Navigate to the project root:
   ```bash
   cd C:\Users\anura\Downloads\civic-opinion-poll
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development EPIC Testing
When `PRODUCTION=false` and `VERIFICATION_PROVIDER=MOCK`, any standard format EPIC (e.g., `TEST1234567` or `ABC1234567`) can be used to simulate verification and test the complete voting pipeline.

---

## 6. Testing & Quality Assurance

Run the test suite:
```bash
# Run all unit, integration, and concurrency tests
npm test

# Run strict TypeScript typecheck
npm run typecheck

# Run linter
npm run lint

# Run production build
npm run build
```

### Concurrency Safeguards
The test suite includes a dedicated race-condition test in [`concurrency.test.ts`](file:///C:/Users/anura/Downloads/civic-opinion-poll/src/lib/verification/concurrency.test.ts) that fires **100 simultaneous submissions against the same credential**, verifying that exactly one succeeds and 99 are rejected with zero double-counting.

---

## 7. Production Deployment & Safety Checks

### Production Guard (`PRODUCTION=true`)
Before deploying to production, set `PRODUCTION=true` in your hosting environment:
* Disables `MockVerificationProvider` (fails application startup if mock is active).
* Enforces strong `VOTING_HMAC_SECRET` (rejects default dev secrets).
* Disables test EPICs and development debug modes.

### Supabase Deployment
1. Create a free PostgreSQL project at [Supabase](https://supabase.com).
2. Open the SQL Editor and execute [`src/lib/db/schema.sql`](file:///C:/Users/anura/Downloads/civic-opinion-poll/src/lib/db/schema.sql).
3. Copy your project connection strings into your hosting environment:
   * `DATABASE_URL`
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`

---

## 8. Polling Methodology & Reporting Standard

All published results include the following mandatory notice:
> *"These results represent responses from participants of this independent poll. They are not official election results and should not be interpreted as an election forecast or representative sample of all Indian voters unless a scientifically valid sampling methodology has been used."*

**Proper reporting:**  
*"Among 128,420 verified participants in this independent opinion poll..."*

**Prohibited reporting:**  
*"India has decided..."* or *"The national election outcome will be..."*
