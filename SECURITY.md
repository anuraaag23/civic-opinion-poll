# Security Architecture & Cryptographic Threat Model
**Independent India Civic Opinion Poll Platform**

## 1. Core Threat Model & Cryptographic Defenses

### Threat 1: Voter Identity Correlation (De-anonymization)
* **Risk**: Correlating an individual voter (EPIC, IP, Name) with their political party selection.
* **Defense**: 
  * The voting table contains **only** aggregate counters (`poll_id`, `option_id`, `vote_count`).
  * The system never writes individual ballot rows linking voter identity to option choice.
  * In-memory verification verifies eligibility and computes a keyed HMAC fingerprint before handing off a randomly generated, unlinked 256-bit token to the client.

### Threat 2: Rainbow Table & Dictionary Attacks on EPIC Hashes
* **Risk**: Indian EPIC numbers have a constrained structure (`[A-Z]{3}[0-9]{7}`). A plain SHA-256 hash can be precomputed and reversed via brute-force lookup tables.
* **Defense**:
  * We use **Keyed HMAC-SHA256**:
    $$\text{HMAC-SHA256}(K_{\text{server\_secret}}, \text{EPIC} \parallel \text{":"} \parallel \text{poll\_id})$$
  * The secret key is stored in a high-security server environment variable, never exposed to clients, and never stored in the database.
  * Without the server secret, rainbow table lookups are mathematically impossible.

### Threat 3: Double Voting & Ballot Stuffing
* **Risk**: A participant voting multiple times or reusing credentials.
* **Defense**:
  * The `participation` table enforces a database-level `UNIQUE(poll_id, participation_fingerprint)` constraint.
  * The anonymous voting token can only be consumed once. In the database, the atomic transaction verifies `used_at IS NULL`, sets `used_at = NOW()`, and increments `vote_count = vote_count + 1`. Any subsequent attempt is rejected with `CREDENTIAL_ALREADY_USED`.

### Threat 4: Concurrency & Race Conditions
* **Risk**: Submitting parallel requests with the same token in rapid succession to increment counters multiple times.
* **Defense**:
  * PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) or atomic memory state mutations ensure only the first request succeeds.
  * Concurrency test suites confirm 100 simultaneous requests against the same credential yield exactly 1 success and 99 rejections.

---

## 2. Keyed Secret Management
* `VOTING_HMAC_SECRET`: 256-bit high-entropy secret.
* `ANONYMOUS_TOKEN_SECRET`: 256-bit secret for token verification.
* Production Guard: Setting `PRODUCTION=true` verifies secrets do not start with development prefixes (`dev_`) and shuts down if unconfigured.
