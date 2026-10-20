import { Router } from 'express';
import multer from 'multer';
import { bad, conflict, forbidden, notFound, unauthorized, AppError } from './errors.js';
import { sha256Hex, encrypt, decrypt } from './crypto.js';
import { checkGeo } from './geo.js';
import { isValidCid } from './ipfs.js';
import { sameAddr } from './chain.js';
import { assertExpiry, assertFresh, captureMessage, propertyMessage, recover, viewMessage } from './auth.js';

const ID_RE = /^[1-9]\d{0,17}$/;
const TYPES = ['move-in', 'move-out'];
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);

const parseId = (v) => {
  if (typeof v !== 'string' || !ID_RE.test(v)) throw bad('invalid_agreement_id', 'agreementId must be a positive integer');
  return v;
};
const parseCoord = (v, name, lim) => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  if (!Number.isFinite(n) || Math.abs(n) > lim) throw bad('invalid_gps', `${name} must be a number between -${lim} and ${lim}`);
  return n;
};
const asyncH = (fn) => (req, res, next) => fn(req, res).catch(next);

export function buildRouter({ config, chain, ipfs, store }) {
  const r = Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxPhotoBytes, files: 1, fields: 12 },
    fileFilter: (req, file, cb) =>
      file.mimetype === 'image/jpeg' ? cb(null, true) : cb(bad('invalid_file_type', 'Only JPEG photos are accepted')),
  });

  // ───────── health ─────────
  r.get('/health', asyncH(async (req, res) => {
    const blockNumber = await chain.provider.getBlockNumber().catch(() => null);
    res.json({ ok: blockNumber !== null, chainId: config.chainId, contract: config.contractAddress, blockNumber, ipfs: ipfs.mode });
  }));

  // ───────── POST /api/property (landlord registers where the property is) ─────────
  r.post('/property', asyncH(async (req, res) => {
    const { agreementId, lat, lng, signedAt, signature } = req.body || {};
    const id = parseId(String(agreementId ?? ''));
    const la = parseCoord(String(lat ?? ''), 'lat', 90);
    const ln = parseCoord(String(lng ?? ''), 'lng', 180);
    if (!signature) throw unauthorized('signature_required', 'signature is required');
    assertFresh(signedAt, config.signatureMaxAgeSec);
    const signer = recover(propertyMessage({ agreementId: id, lat: String(lat), lng: String(lng), signedAt: String(signedAt) }), signature);

    const a = await chain.getAgreement(id);
    if (!sameAddr(signer, a.landlord)) throw forbidden('not_landlord', 'Only the landlord can set the property location');
    if (a.state !== 'Created' && a.state !== 'Funded') throw conflict('location_locked', 'Property location is locked once move-in evidence starts');

    store.setProperty(id, { lat: la, lng: ln, setBy: signer, setAt: Math.floor(Date.now() / 1000) });
    res.json({ agreementId: id, configured: true });
  }));

  r.get('/property/:agreementId', asyncH(async (req, res) => {
    const id = parseId(req.params.agreementId);
    await chain.getAgreement(id); // 404 if unknown
    res.json({ agreementId: id, configured: !!store.getProperty(id) || !!config.defaultProperty });
  }));

  // ───────── POST /api/capture ─────────
  r.post('/capture', upload.single('photo'), asyncH(async (req, res) => {
    if (!req.file) throw bad('photo_required', 'Attach the photo as multipart field "photo"');
    const photo = req.file.buffer;
    if (photo.length < 3 || !photo.subarray(0, 3).equals(JPEG_MAGIC)) throw bad('invalid_file_type', 'File is not a valid JPEG');

    const { type, signature, signedAt } = req.body;
    const id = parseId(req.body.agreementId);
    if (!TYPES.includes(type)) throw bad('invalid_type', 'type must be "move-in" or "move-out"');
    const lat = parseCoord(req.body.lat, 'lat', 90);
    const lng = parseCoord(req.body.lng, 'lng', 180);

    const agreement = await chain.getAgreement(id);

    if (config.requireAuth) {
      if (!signature) throw unauthorized('signature_required', 'signature and signedAt are required');
      assertFresh(signedAt, config.signatureMaxAgeSec);
      const signer = recover(captureMessage({ agreementId: id, type, signedAt: String(signedAt) }), signature);
      if (!sameAddr(signer, agreement.tenant) && !sameAddr(signer, agreement.landlord)) {
        throw forbidden('not_a_party', 'Only the tenant or landlord of this agreement can upload evidence');
      }
    }

    // Mirror the contract's state rules so we don't pin photos the chain will reject.
    const okStates = type === 'move-in' ? ['Funded', 'Active'] : ['Active', 'CheckoutRequested'];
    if (!okStates.includes(agreement.state)) {
      throw conflict('wrong_state', `Cannot add ${type} evidence while the agreement is ${agreement.state}`);
    }

    const timestamp = Math.floor(Date.now() / 1000); // server clock; block time becomes the final timestamp
    const hash = sha256Hex(photo);
    const property = store.getProperty(id) || config.defaultProperty;
    const geo = checkGeo({ lat, lng }, property, config.geoRadiusMeters);

    const cid = await ipfs.pin(encrypt(photo, config.encryptionKey, id), `wdl-${id}-${type}-${timestamp}.enc`);
    store.putEvidence(id, cid, { hash, geoOk: geo.geoOk, distanceMeters: geo.distanceMeters, capturedAt: timestamp, type });

    res.status(201).json({
      cid, hash, timestamp, geoOk: geo.geoOk,
      distanceMeters: geo.distanceMeters, geoReason: geo.reason,
    });
  }));

  // ───────── GET /api/evidence/:agreementId ─────────
  r.get('/evidence/:agreementId', asyncH(async (req, res) => {
    const id = parseId(req.params.agreementId);
    const agreement = await chain.getAgreement(id);
    const events = await chain.getEvidence(id);
    const evidence = events.map((e) => {
      const meta = store.getEvidence(id, e.cid);
      return { ...e, geoOk: meta ? meta.geoOk : null };
    });
    res.json({ agreementId: id, state: agreement.state, evidence });
  }));

  // ───────── GET /api/evidence/:agreementId/photo?cid=... ─────────
  // Auth: headers X-Signature + X-Expires (query ?signature=&expires= also accepted).
  r.get('/evidence/:agreementId/photo', asyncH(async (req, res) => {
    const id = parseId(req.params.agreementId);
    const cid = String(req.query.cid || '');
    if (!isValidCid(cid)) throw bad('invalid_cid', 'cid query parameter is missing or malformed');
    const signature = req.get('x-signature') || req.query.signature;
    const expires = req.get('x-expires') || req.query.expires;
    if (!signature || !expires) throw unauthorized('signature_required', 'X-Signature and X-Expires headers are required');
    assertExpiry(expires, config.viewMaxLifetimeSec);
    const signer = recover(viewMessage({ agreementId: id, cid, expires: String(expires) }), String(signature));

    const agreement = await chain.getAgreement(id);
    const isParty = sameAddr(signer, agreement.tenant) || sameAddr(signer, agreement.landlord);
    let allowed = isParty;
    if (!allowed && agreement.state === 'Disputed') allowed = sameAddr(signer, await chain.getArbiter());
    if (!allowed) throw forbidden('not_allowed', 'Only the tenant, the landlord, or (during a dispute) the arbiter can view evidence');

    // The CID must really be evidence of THIS agreement, as recorded on-chain.
    const ev = (await chain.getEvidence(id)).find((e) => e.cid === cid);
    if (!ev) throw notFound('evidence_not_found', 'No on-chain evidence with that CID for this agreement');

    const blob = await ipfs.get(cid);
    let photo;
    try {
      photo = decrypt(blob, config.encryptionKey, id);
    } catch {
      throw new AppError(502, 'integrity_error', 'Stored evidence failed its integrity check');
    }
    if (sha256Hex(photo) !== ev.hash.toLowerCase()) {
      throw new AppError(502, 'hash_mismatch', 'Decrypted photo does not match the on-chain hash');
    }

    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Evidence-Hash': ev.hash,
      'X-Evidence-Verified': 'true',
    });
    res.send(photo);
  }));

  return r;
}
