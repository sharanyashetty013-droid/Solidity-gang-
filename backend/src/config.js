import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { getAddress } from 'ethers';

export const abi = JSON.parse(readFileSync(new URL('./abi.json', import.meta.url), 'utf8'));

export const STATES = ['Created', 'Funded', 'Active', 'CheckoutRequested', 'Claimed', 'Disputed', 'Settled'];

function need(env, name) {
  const v = env[name];
  if (!v || !v.trim()) throw new Error(`Missing required env var ${name} (see .env.example)`);
  return v.trim();
}
const num = (v, d) => (v === undefined || v === '' ? d : Number(v));

/** Build config from an env object (tests pass their own). */
export function loadConfig(env = process.env) {
  const keyHex = need(env, 'ENCRYPTION_KEY');
  if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new Error('ENCRYPTION_KEY must be 64 hex chars (32 bytes). Generate: openssl rand -hex 32');
  }
  const pinataJwt = (env.PINATA_JWT || '').trim();
  const production = env.NODE_ENV === 'production';
  if (production && !pinataJwt) throw new Error('PINATA_JWT is required when NODE_ENV=production');

  const cfg = {
    port: num(env.PORT, 3001),
    rpcUrl: need(env, 'RPC_URL'),
    chainId: num(env.CHAIN_ID, 11155111), // Sepolia
    contractAddress: getAddress(need(env, 'CONTRACT_ADDRESS')),
    deployBlock: num(env.DEPLOY_BLOCK, 0),
    eventChunk: num(env.EVENT_CHUNK, 9000), // public RPCs cap getLogs ranges
    encryptionKey: Buffer.from(keyHex, 'hex'),
    pinataJwt,
    pinataGateway: (env.PINATA_GATEWAY || 'https://gateway.pinata.cloud').replace(/\/$/, ''),
    pinataGatewayToken: (env.PINATA_GATEWAY_TOKEN || '').trim(),
    geoRadiusMeters: num(env.GEO_RADIUS_METERS, 150),
    defaultProperty:
      env.DEFAULT_PROPERTY_LAT && env.DEFAULT_PROPERTY_LNG
        ? { lat: Number(env.DEFAULT_PROPERTY_LAT), lng: Number(env.DEFAULT_PROPERTY_LNG) }
        : null,
    corsOrigins: (env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
      .split(',').map((s) => s.trim()).filter(Boolean),
    maxPhotoBytes: 10 * 1024 * 1024,
    requireAuth: (env.REQUIRE_CAPTURE_AUTH ?? 'true') !== 'false',
    signatureMaxAgeSec: 300,
    viewMaxLifetimeSec: 900,
    dataDir: env.DATA_DIR || './data',
  };
  return cfg;
}
