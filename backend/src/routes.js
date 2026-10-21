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

  // ───────── POST /api/compare (AI before/after check, Gemini) ─────────
  // Headers: X-Signature + X-Expires, signed like a photo view with cid = "ai-compare".
  r.post('/compare', asyncH(async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new AppError(503, 'ai_not_configured', 'GEMINI_API_KEY is missing in backend/.env');
    const id = parseId(String((req.body || {}).agreementId ?? ''));
    const signature = req.get('x-signature');
    const expires = req.get('x-expires');
    if (!signature || !expires) throw unauthorized('signature_required', 'X-Signature and X-Expires headers are required');
    assertExpiry(expires, config.viewMaxLifetimeSec);
    const signer = recover(viewMessage({ agreementId: id, cid: 'ai-compare', expires: String(expires) }), String(signature));

    const agreement = await chain.getAgreement(id);
    let allowed = sameAddr(signer, agreement.tenant) || sameAddr(signer, agreement.landlord);
    if (!allowed && agreement.state === 'Disputed') allowed = sameAddr(signer, await chain.getArbiter());
    if (!allowed) throw forbidden('not_allowed', 'Only the tenant, landlord or arbiter can run the AI check');

    const events = await chain.getEvidence(id);
    const withType = events.map((e) => ({ ...e, type: (store.getEvidence(id, e.cid) || {}).type }));
    const moveIn = withType.find((e) => e.type === 'move-in');
    const moveOut = [...withType].reverse().find((e) => e.type === 'move-out');
    if (!moveIn || !moveOut) throw conflict('need_both_photos', 'Need one move-in and one move-out photo to compare');

    const load = async (ev) => {
      const photo = decrypt(await ipfs.get(ev.cid), config.encryptionKey, id);
      if (sha256Hex(photo) !== ev.hash.toLowerCase()) throw new AppError(502, 'hash_mismatch', 'Photo does not match the on-chain hash');
      return photo.toString('base64');
    };
    const [inB64, outB64] = [await load(moveIn), await load(moveOut)];
    console.log('GEMINI_DEBUG photo sizes KB (base64):', Math.round(inB64.length / 1024), Math.round(outB64.length / 1024));

    const prompt = [
      'You compare two photos of the same rental room. Image 1 is MOVE-IN. Image 2 is MOVE-OUT.',
      'List only physical differences in the room: damage, stains, marks, scratches, cracks, missing or broken items.',
      'Ignore lighting, camera angle and color differences.',
      'Reply ONLY as JSON: {"sameRoom": boolean, "summary": string, "differences": [{"area": string, "description": string, "severity": "minor"|"moderate"|"major"}]}.',
      'If nothing changed, return an empty differences list. You only flag differences; a human makes the final decision.',
    ].join(' ');

    const body = JSON.stringify({
      contents: [{ parts: [
        { text: prompt },
        { inline_data: { mime_type: 'image/jpeg', data: inB64 } },
        { inline_data: { mime_type: 'image/jpeg', data: outB64 } },
      ] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    });
    let resp;
    for (const model of ['gemini-flash-latest', 'gemini-3.5-flash']) {
      for (let attempt = 0; attempt < 1; attempt++) {
        resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          signal: AbortSignal.timeout(90000),
          body,
        });
        if (resp.ok || ![404, 429, 500, 503].includes(resp.status)) break;
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (resp.ok || ![404, 429, 500, 503].includes(resp.status)) break;
    }
    if (!resp.ok) { const t = await resp.text().catch(() => ''); console.error('GEMINI_DEBUG error', resp.status, t.slice(0, 600)); throw new AppError(502, 'ai_failed', 'Gemini error ' + resp.status + ': ' + t.slice(0, 200)); }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    let result;
    try { result = JSON.parse(text.replace(/```json|```/g, '').trim()); }
    catch { throw new AppError(502, 'ai_bad_output', 'AI returned an unreadable answer, try again'); }

    res.json({ agreementId: id, moveInCid: moveIn.cid, moveOutCid: moveOut.cid, result });
  }));

  return r;
}
