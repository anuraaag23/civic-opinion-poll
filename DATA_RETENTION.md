# Data Retention & Minimization Policy
**Independent India Civic Opinion Poll Platform**

## 1. The Minimum Data Principle
The platform is designed strictly as an opinion research tool, not an electoral-roll database. Under no circumstances does the platform retain:
* Voter names, addresses, father's names, or phone numbers
* Raw un-keyed EPIC numbers
* Linkage between voters and specific political parties
* Persistent IP address logs or browser canvas fingerprints

---

## 2. Retention Schedules by Data Classification

| Data Category | Lifecycle Phase | Retention Duration | Purge Routine |
|---|---|---|---|
| **EPIC Number** | In-Memory Validation | 0 seconds (Immediate discard) | Discarded immediately after HMAC computation |
| **Participation Fingerprint** | Active Poll | Duration of Active Poll | Deleted upon poll closure and audit sign-off |
| **Anonymous Token Hash** | Issuance to Vote | Maximum 15 minutes | Expired/used tokens cleaned automatically |
| **Aggregate Vote Counts** | Indefinite | Permanent civic record | Retained as anonymous public statistical counts |
| **Sanitized Audit Events** | Active Poll + 90 Days | 90 days post closure | Rotated and truncated |

---

## 3. Cryptographic Purge Routine
When an opinion poll transitions to `CLOSED` or `ARCHIVED`, an automated routine or administrator action triggers the deletion of:
```sql
DELETE FROM participation WHERE poll_id = :poll_id;
DELETE FROM anonymous_tokens WHERE poll_id = :poll_id;
```
Once purged, even access to the server secret cannot correlate past participation, permanently protecting participant privacy.
