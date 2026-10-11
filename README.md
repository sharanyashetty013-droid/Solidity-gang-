# Walls Don't Lie: rental deposit escrow

Contract (Foundry) + backend (Node/Express/ethers v6). See `docs/api.md` for the frontend interface.

```
contracts/   Solidity, Foundry tests, Sepolia deploy script
backend/     capture → SHA-256 → GPS check → AES-256-GCM → IPFS (Pinata) → evidence API
docs/        api.md (share with the frontend) + RentalEscrow.abi.json
```

## 1. Contracts
```bash
cd contracts
git init                                             # if not already a repo
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts@v5.0.2
forge build && forge test            # 69 tests, 100% coverage of RentalEscrow.sol
forge test --fuzz-runs 5000          # money-conservation fuzz test

# Deploy to Sepolia (key stays in an encrypted keystore, never in a file)
cast wallet import deployer --interactive
export ARBITER=0xYourArbiterWallet SEPOLIA_RPC_URL=https://...
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --account deployer --broadcast
```
After deploying: copy the address to `backend/.env`, and send `docs/RentalEscrow.abi.json` + the address to the frontend. If you redeploy, regenerate the ABI: `jq .abi out/RentalEscrow.sol/RentalEscrow.json > ../docs/RentalEscrow.abi.json && cp ../docs/RentalEscrow.abi.json ../backend/src/abi.json`.

## 2. Backend
```bash
cd backend
npm install
cp .env.example .env     # fill RPC_URL, CONTRACT_ADDRESS, DEPLOY_BLOCK, ENCRYPTION_KEY (openssl rand -hex 32), PINATA_JWT
npm start                # no PINATA_JWT => local mock storage, dev only
npm test                 # 19 end-to-end tests on a local anvil chain with the real contract
```

### Quick curl checks
```bash
curl localhost:3001/api/health
curl localhost:3001/api/evidence/1
# capture needs a wallet signature (see docs/api.md); easiest to try from the frontend or the test helpers.
# integrity check: the hash returned by /capture must equal
sha256sum photo.jpg
```

## Design decisions (good to explain to judges)
- **Chain holds only hashes.** Photos are encrypted (AES-256-GCM, per-agreement key derived by HKDF) before IPFS.
- **Server holds the key**, so the server decides who can decrypt: it checks a wallet signature plus the on-chain role. Honest MVP trade-off; future work is per-party key wrapping.
- **Every photo read is re-verified**: decrypt (GCM auth) AND sha256 == the on-chain hash, or it is refused.
- **Tamper-evident, not tamper-proof**: JPEG check, server time, block time, GPS radius, signed uploads. The server cannot truly know a photo came from the live camera; it only makes cheating harder and detectable.
- **No stuck funds**: if a receiver reverts on payout, the amount is parked for `withdraw()` so one bad party can't lock the other's money. If the tenant ignores a claim, unanswered items go to the arbiter, never auto-paid to the landlord.

## Known limits (MVP)
- The arbiter is a single trusted wallet; if it vanishes, disputed funds stay locked (add an arbiter timeout later).
- Signatures can be replayed within their 5 min / 15 min window.
- No rate limiting on the API yet; `PINATA_JWT` quota could be burned by a party spamming uploads.
- Contract has not had an external audit. Use Sepolia only.
