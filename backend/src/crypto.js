import { createHash, createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

const VERSION = 1;

export const sha256Hex = (buf) => '0x' + createHash('sha256').update(buf).digest('hex'); // fits bytes32

/** One key per agreement, derived from the master key, so a leak of one is contained. */
export function deriveKey(master, agreementId) {
  return Buffer.from(hkdfSync('sha256', master, Buffer.from('wdl-evidence-v1'), Buffer.from(`agreement:${agreementId}`), 32));
}

/** Output layout: [1 version][12 iv][16 auth tag][ciphertext]. AAD binds the blob to its agreement. */
export function encrypt(plain, master, agreementId) {
  const key = deriveKey(master, agreementId);
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  c.setAAD(Buffer.from(`agreement:${agreementId}`));
  const ct = Buffer.concat([c.update(plain), c.final()]);
  return Buffer.concat([Buffer.from([VERSION]), iv, c.getAuthTag(), ct]);
}

export function decrypt(blob, master, agreementId) {
  if (blob.length < 29 || blob[0] !== VERSION) throw new Error('bad ciphertext');
  const key = deriveKey(master, agreementId);
  const d = createDecipheriv('aes-256-gcm', key, blob.subarray(1, 13));
  d.setAAD(Buffer.from(`agreement:${agreementId}`));
  d.setAuthTag(blob.subarray(13, 29));
  return Buffer.concat([d.update(blob.subarray(29)), d.final()]); // throws if tampered
}
