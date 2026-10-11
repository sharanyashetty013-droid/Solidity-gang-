# Walls Don't Lie: interface for the frontend

Sepolia chain id `11155111`. ABI: `docs/RentalEscrow.abi.json`. Contract address: from the deploy output.
API base URL: `http://localhost:3001/api` (put both in ONE config file).

## 1. Contract

**States** (uint8 → name): `0 Created, 1 Funded, 2 Active, 3 CheckoutRequested, 4 Claimed, 5 Disputed, 6 Settled`
**Evidence type** (uint8): `0 move-in, 1 move-out`
**Item status**: `0 Pending, 1 Accepted, 2 Disputed, 3 Resolved`

| Screen action | Call | Who | Notes |
|---|---|---|---|
| Create | `createAgreement(tenant, depositWei, claimWindowSeconds)` | landlord | window 60 s – 90 days. Read the new `id` from the `AgreementCreated` event |
| Fund | `fundDeposit(id)` + `value: deposit` | tenant | must be EXACT |
| Save proof | `submitEvidence(id, hash, cid, type)` | tenant/landlord | `hash` = value returned by `/capture` (bytes32). First move-in moves Funded → Active |
| I'm vacating | `requestCheckout(id)` | tenant | needs state Active (≥1 move-in photo). Starts the timer |
| Claim | `submitClaim(id, [{name, amount}])` | landlord | before `claimDeadline(id)`; max 20 items; sum ≤ deposit |
| Accept / dispute | `respondToClaim(id, itemIndex, accept)` | tenant | once ALL items are answered, any dispute → state Disputed |
| Arbiter | `resolveDispute(id, itemIndex, amountWei)` | arbiter | amount ≤ claimed. When last dispute is resolved, state returns to Claimed (= ready to release) |
| Release | `release(id)` | anyone | see below |
| Pull failed payout | `withdraw()` | anyone | only if a payout reverted (`pendingWithdrawals(addr)`) |

**Reads:** `getAgreement(id)` (tuple: landlord, tenant, deposit, claimWindow, checkoutAt, claimedAt, state, pendingCount, disputedCount, landlordPayout), `getItems(id)`, `claimDeadline(id)`, `arbiter()`.

**`release(id)` buttons by state**
- `CheckoutRequested` and `now > claimDeadline`: pays the full deposit to the tenant.
- `Claimed` and every item answered/resolved: landlord gets accepted + awarded, tenant gets the rest.
- `Claimed` but tenant ignored items past `claimedAt + claimWindow`: items escalate to the arbiter (no payout; state becomes Disputed).
- Otherwise reverts `NotReleasable` / `WindowStillOpen`. Show "Release" only in those cases.

**Events to index:** `AgreementCreated, DepositFunded, EvidenceSubmitted(id, submitter, hash, cid, type, timestamp), CheckoutRequested, ClaimSubmitted, ClaimResponded, DisputesEscalated, DisputeResolved, Released(id, toTenant, toLandlord)`.

**Custom errors** (decode with the ABI for friendly messages): `WrongState(state)`, `NotTenant`, `NotLandlord`, `WrongAmount`, `WindowClosed`, `WindowStillOpen`, `ClaimExceedsDeposit`, `NotReleasable` …

## 2. Wallet signatures (the only extra step vs. the PRD)

The backend checks WHO is calling with `signer.signMessage(...)`. Messages must match exactly (`\n` separators, no trailing newline). `signedAt` = unix seconds, must be within 5 min of server time.

```js
const signedAt = Math.floor(Date.now() / 1000);
// capture
await signer.signMessage(`WallsDontLie capture\nagreement:${id}\ntype:${type}\nsignedAt:${signedAt}`);
// view photo (expires = now + up to 900 s)
await signer.signMessage(`WallsDontLie view\nagreement:${id}\ncid:${cid}\nexpires:${expires}`);
// property location (landlord, before move-in)
await signer.signMessage(`WallsDontLie property\nagreement:${id}\nlat:${lat}\nlng:${lng}\nsignedAt:${signedAt}`);
```
`lat`/`lng` in the property message must be the exact same strings you send in the body.

## 3. Endpoints

Errors always look like `{ "error": { "code": "wrong_state", "message": "…" } }`.

### POST /api/capture   (multipart/form-data)
Fields: `photo` (JPEG ≤ 10 MB), `agreementId`, `type` (`move-in`|`move-out`), `lat`, `lng`, `signedAt`, `signature`.
```json
201 { "cid": "Qm…", "hash": "0x9f2c…(32 bytes)", "timestamp": 1760000123,
      "geoOk": true, "distanceMeters": 12, "geoReason": "within_radius" }
```
Then call `submitEvidence(id, hash, cid, type)`. Show the photo in the gallery only after the tx confirms.
Errors: 400 `invalid_file_type | invalid_gps | invalid_type`, 401 `signature_required | stale_signature | bad_signature`, 403 `not_a_party`, 404 `agreement_not_found`, 409 `wrong_state`, 413 `file_too_large`.

### GET /api/evidence/:agreementId   (public, hashes only)
```json
200 { "agreementId": "1", "state": "Active",
      "evidence": [ { "hash": "0x9f2c…", "cid": "Qm…", "type": "move-in", "timestamp": 1760000140,
                      "submitter": "0xTen…", "txHash": "0x…", "blockNumber": 7123456, "geoOk": true } ] }
```
`timestamp` is the BLOCK time. `geoOk` is `null` if the photo wasn't captured through this backend.

### GET /api/evidence/:agreementId/photo?cid=Qm…
Headers: `X-Signature`, `X-Expires`. Fetch as a blob, then `URL.createObjectURL(blob)` (an `<img src>` can't send headers).
Returns `image/jpeg`. Allowed: tenant, landlord, or the arbiter only while the state is `Disputed`.
Errors: 401 `signature_required | expired_signature | expiry_too_far`, 403 `not_allowed`, 404 `evidence_not_found`, 502 `integrity_error | hash_mismatch`.

### POST /api/property   (JSON, landlord only, only before move-in evidence)
`{ "agreementId": "1", "lat": "12.9716", "lng": "77.5946", "signedAt": "1760000000", "signature": "0x…" }` → `{ "agreementId": "1", "configured": true }`
`GET /api/property/:agreementId` → `{ "agreementId": "1", "configured": true }`

### GET /api/health → `{ ok, chainId, contract, blockNumber, ipfs }`
