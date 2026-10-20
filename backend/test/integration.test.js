// End-to-end: real contract on a local anvil chain + the real Express app.
// Run:  npm test   (needs `anvil` from Foundry on PATH and `forge build` done in ../contracts)
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ContractFactory, JsonRpcProvider, NonceManager, Wallet, parseEther } from 'ethers';
import { loadConfig } from '../src/config.js';
import { createApp } from '../src/server.js';
import { captureMessage, propertyMessage, viewMessage } from '../src/auth.js';

const PORT = 8546;
const RPC = `http://127.0.0.1:${PORT}`;
// Well-known public anvil test keys. Never use these anywhere real.
const KEYS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
];

const now = () => Math.floor(Date.now() / 1000);
const sha256 = (b) => '0x' + createHash('sha256').update(b).digest('hex');
const fakeJpeg = (n = 5000) => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), randomBytes(n), Buffer.from([0xff, 0xd9])]);

let anvil, provider, deployer, landlord, tenant, stranger, arbiter, escrow, base, server, dataDir, config;

before(async () => {
  anvil = spawn('anvil', ['--port', String(PORT), '--silent'], { stdio: 'ignore' });
  provider = new JsonRpcProvider(RPC);
  for (let i = 0; i < 50; i++) { try { await provider.getBlockNumber(); break; } catch { await new Promise((r) => setTimeout(r, 200)); } }
  [deployer, landlord, tenant, stranger, arbiter] = KEYS.map((k) => new NonceManager(new Wallet(k, provider)));
  const art = JSON.parse(readFileSync(new URL('../../contracts/out/RentalEscrow.sol/RentalEscrow.json', import.meta.url), 'utf8'));
  const factory = new ContractFactory(art.abi, art.bytecode.object, deployer);
  escrow = await factory.deploy(await arbiter.getAddress());
  await escrow.waitForDeployment();

  dataDir = mkdtempSync(join(tmpdir(), 'wdl-'));
  config = loadConfig({
    RPC_URL: RPC, CHAIN_ID: '31337', CONTRACT_ADDRESS: await escrow.getAddress(),
    ENCRYPTION_KEY: randomBytes(32).toString('hex'), DATA_DIR: dataDir, GEO_RADIUS_METERS: '150', CORS_ORIGINS: 'http://localhost:5173',
  });
  server = createApp(config).listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => { server?.close(); anvil?.kill(); });

// ───────── helpers ─────────
const as = (w, c = escrow) => c.connect(w);
async function tx(p) { const t = await p; return t.wait(); }

async function newAgreement({ fund = true } = {}) {
  const r = await tx(as(landlord).createAgreement(await tenant.getAddress(), parseEther('1'), 14 * 24 * 3600));
  const id = String(r.logs.map((l) => as(landlord).interface.parseLog(l)).find((e) => e?.name === 'AgreementCreated').args.id);
  if (fund) await tx(as(tenant).fundDeposit(id, { value: parseEther('1') }));
  return id;
}

async function capture({ id, type = 'move-in', signer = tenant, photo = fakeJpeg(), lat = '12.9716', lng = '77.5946', sign = true, mime = 'image/jpeg', signedAt = String(now()) }) {
  const f = new FormData();
  f.append('photo', new Blob([photo], { type: mime }), 'p.jpg');
  f.append('agreementId', id); f.append('type', type); f.append('lat', lat); f.append('lng', lng);
  if (sign) {
    f.append('signedAt', signedAt);
    f.append('signature', await signer.signMessage(captureMessage({ agreementId: id, type, signedAt })));
  }
  const res = await fetch(`${base}/capture`, { method: 'POST', body: f });
  return { res, body: await res.json(), photo };
}

async function viewPhoto({ id, cid, signer, expires = String(now() + 120), signFor = cid }) {
  const signature = await signer.signMessage(viewMessage({ agreementId: id, cid: signFor, expires }));
  return fetch(`${base}/evidence/${id}/photo?cid=${cid}`, { headers: { 'X-Signature': signature, 'X-Expires': expires } });
}

async function anchor(id, signer, c, type = 'move-in') {
  return tx(as(signer).submitEvidence(id, c.hash, c.cid, type === 'move-in' ? 0 : 1));
}

// ───────── tests (ordered; they share agreement state) ─────────
describe('walls-dont-lie backend', () => {
  let id, moveIn, moveInPhoto;

  test('health', async () => {
    const r = await (await fetch(`${base}/health`)).json();
    assert.equal(r.ok, true);
    assert.equal(r.ipfs, 'local-mock');
  });

  test('unknown agreement → 404', async () => {
    const res = await fetch(`${base}/evidence/9999`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'agreement_not_found');
  });

  test('bad agreement id → 400', async () => {
    assert.equal((await fetch(`${base}/evidence/abc`)).status, 400);
    assert.equal((await fetch(`${base}/evidence/0`)).status, 400);
  });

  test('capture is rejected before the deposit is funded', async () => {
    id = await newAgreement({ fund: false });
    const { res, body } = await capture({ id });
    assert.equal(res.status, 409);
    assert.equal(body.error.code, 'wrong_state');
  });

  test('property location: only the landlord can set it', async () => {
    const send = async (signer) => {
      const signedAt = String(now());
      const signature = await signer.signMessage(propertyMessage({ agreementId: id, lat: '12.9716', lng: '77.5946', signedAt }));
      return fetch(`${base}/property`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ agreementId: id, lat: '12.9716', lng: '77.5946', signedAt, signature }) });
    };
    assert.equal((await send(tenant)).status, 403);
    assert.equal((await send(landlord)).status, 200);
    assert.equal((await (await fetch(`${base}/property/${id}`)).json()).configured, true);
    await tx(as(tenant).fundDeposit(id, { value: parseEther('1') }));
  });

  test('capture rejects: no signature, stranger, non-JPEG, bad GPS, bad type', async () => {
    assert.equal((await capture({ id, sign: false })).res.status, 401);

    const s = await capture({ id, signer: stranger });
    assert.equal(s.res.status, 403);
    assert.equal(s.body.error.code, 'not_a_party');

    const png = await capture({ id, mime: 'image/png', photo: Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]) });
    assert.equal(png.res.status, 400);

    // mislabelled as JPEG but wrong magic bytes
    const fake = await capture({ id, photo: Buffer.from('not a jpeg at all') });
    assert.equal(fake.res.status, 400);
    assert.equal(fake.body.error.code, 'invalid_file_type');

    assert.equal((await capture({ id, lat: '95' })).res.status, 400);
    assert.equal((await capture({ id, lat: 'abc' })).res.status, 400);
    assert.equal((await capture({ id, type: 'selfie' })).res.status, 400);

    const stale = await capture({ id, signedAt: String(now() - 3600) });
    assert.equal(stale.res.status, 401);
    assert.equal(stale.body.error.code, 'stale_signature');
  });

  test('capture rejects files over 10MB', async () => {
    const big = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(10 * 1024 * 1024 + 10)]);
    const { res } = await capture({ id, photo: big });
    assert.equal(res.status, 413);
  });

  test('capture happy path: hash matches sha256 of the file, GPS ok', async () => {
    const c = await capture({ id });
    assert.equal(c.res.status, 201);
    assert.equal(c.body.hash, sha256(c.photo));
    assert.equal(c.body.geoOk, true);
    assert.ok(Math.abs(c.body.timestamp - now()) < 10);
    assert.match(c.body.cid, /^local-[0-9a-f]{64}$/);
    // the stored blob is encrypted: the raw photo bytes must not appear in it
    const blob = readFileSync(join(dataDir, 'ipfs-mock', c.body.cid));
    assert.equal(blob.includes(c.photo.subarray(100, 200)), false);
    moveIn = c.body; moveInPhoto = c.photo;
  });

  test('GPS far from the property → geoOk=false (still captured)', async () => {
    const c = await capture({ id, lat: '13.5', lng: '77.5946' });
    assert.equal(c.res.status, 201);
    assert.equal(c.body.geoOk, false);
    assert.ok(c.body.distanceMeters > 1000);
  });

  test('anchor on-chain, then GET /evidence lists it with block timestamp and geo result', async () => {
    const receipt = await anchor(id, tenant, moveIn);
    const block = await provider.getBlock(receipt.blockNumber);
    const body = await (await fetch(`${base}/evidence/${id}`)).json();
    assert.equal(body.state, 'Active');
    assert.equal(body.evidence.length, 1);
    const e = body.evidence[0];
    assert.equal(e.hash, moveIn.hash);
    assert.equal(e.cid, moveIn.cid);
    assert.equal(e.type, 'move-in');
    assert.equal(e.timestamp, block.timestamp);
    assert.equal(e.geoOk, true);
    // second call uses the incremental cache and still returns the same thing
    const again = await (await fetch(`${base}/evidence/${id}`)).json();
    assert.equal(again.evidence.length, 1);
  });

  test('property location is locked once evidence starts', async () => {
    const signedAt = String(now());
    const signature = await landlord.signMessage(propertyMessage({ agreementId: id, lat: '1', lng: '1', signedAt }));
    const res = await fetch(`${base}/property`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ agreementId: id, lat: '1', lng: '1', signedAt, signature }) });
    assert.equal(res.status, 409);
  });

  test('photo: tenant and landlord get the exact original bytes', async () => {
    for (const who of [tenant, landlord]) {
      const res = await viewPhoto({ id, cid: moveIn.cid, signer: who });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'image/jpeg');
      assert.equal(res.headers.get('x-evidence-verified'), 'true');
      assert.equal(Buffer.compare(Buffer.from(await res.arrayBuffer()), moveInPhoto), 0);
    }
  });

  test('photo: stranger and (outside a dispute) arbiter are refused', async () => {
    assert.equal((await viewPhoto({ id, cid: moveIn.cid, signer: stranger })).status, 403);
    assert.equal((await viewPhoto({ id, cid: moveIn.cid, signer: arbiter })).status, 403);
  });

  test('photo: missing / expired / far-future / mismatched signatures are refused', async () => {
    assert.equal((await fetch(`${base}/evidence/${id}/photo?cid=${moveIn.cid}`)).status, 401);
    assert.equal((await viewPhoto({ id, cid: moveIn.cid, signer: tenant, expires: String(now() - 10) })).status, 401);
    assert.equal((await viewPhoto({ id, cid: moveIn.cid, signer: tenant, expires: String(now() + 86400) })).status, 401);
    // signed for a different cid → recovers to a random address → not allowed
    const other = 'local-' + 'a'.repeat(64);
    assert.equal((await viewPhoto({ id, cid: moveIn.cid, signer: tenant, signFor: other })).status, 403);
    assert.equal((await viewPhoto({ id, cid: 'not a cid', signer: tenant })).status, 400);
  });

  test("photo: a CID that isn't on-chain evidence for this agreement → 404 (even for a party)", async () => {
    const fake = 'local-' + 'b'.repeat(64);
    const res = await viewPhoto({ id, cid: fake, signer: tenant });
    assert.equal(res.status, 404);
    // and evidence from agreement A can't be read through agreement B
    const id2 = await newAgreement();
    const res2 = await viewPhoto({ id: id2, cid: moveIn.cid, signer: tenant });
    assert.equal(res2.status, 404);
  });

  test('tampering with the stored blob is detected (never serves bad data)', async () => {
    const id3 = await newAgreement();
    const c = await capture({ id: id3 });
    await anchor(id3, tenant, c.body);
    const path = join(dataDir, 'ipfs-mock', c.body.cid);
    const blob = readFileSync(path);
    blob[blob.length - 1] ^= 0xff;
    writeFileSync(path, blob);
    const res = await viewPhoto({ id: id3, cid: c.body.cid, signer: tenant });
    assert.equal(res.status, 502);
    assert.equal((await res.json()).error.code, 'integrity_error');
  });

  test('on-chain hash that does not match the stored photo is detected', async () => {
    const id4 = await newAgreement();
    const c = await capture({ id: id4 });
    // tenant anchors a DIFFERENT hash against the real cid
    await tx(as(tenant).submitEvidence(id4, sha256(Buffer.from('other')), c.body.cid, 0));
    const res = await viewPhoto({ id: id4, cid: c.body.cid, signer: tenant });
    assert.equal(res.status, 502);
    assert.equal((await res.json()).error.code, 'hash_mismatch');
  });

  test('during a dispute the arbiter can view the evidence; capture is closed', async () => {
    await tx(as(tenant).requestCheckout(id));
    const out = await capture({ id, type: 'move-out', signer: tenant });
    assert.equal(out.res.status, 201);
    await anchor(id, tenant, out.body, 'move-out');

    await tx(as(landlord).submitClaim(id, [{ name: 'Wall paint', amount: parseEther('0.2') }]));
    await tx(as(tenant).respondToClaim(id, 0, false));
    const state = (await (await fetch(`${base}/evidence/${id}`)).json()).state;
    assert.equal(state, 'Disputed');

    const res = await viewPhoto({ id, cid: moveIn.cid, signer: arbiter });
    assert.equal(res.status, 200);
    assert.equal(Buffer.compare(Buffer.from(await res.arrayBuffer()), moveInPhoto), 0);
    assert.equal((await viewPhoto({ id, cid: moveIn.cid, signer: stranger })).status, 403);

    const late = await capture({ id, type: 'move-out' });
    assert.equal(late.res.status, 409);
  });

  test('CORS: allowed origin echoed, others not', async () => {
    const ok = await fetch(`${base}/health`, { headers: { Origin: 'http://localhost:5173' } });
    assert.equal(ok.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    const no = await fetch(`${base}/health`, { headers: { Origin: 'http://evil.example' } });
    assert.equal(no.headers.get('access-control-allow-origin'), null);
  });
});
