import { verifyMessage } from 'ethers';
import { unauthorized } from './errors.js';

// Messages the wallet signs. The frontend must build these EXACTLY (see docs/api.md).
export const captureMessage = ({ agreementId, type, signedAt }) =>
  `WallsDontLie capture\nagreement:${agreementId}\ntype:${type}\nsignedAt:${signedAt}`;

export const viewMessage = ({ agreementId, cid, expires }) =>
  `WallsDontLie view\nagreement:${agreementId}\ncid:${cid}\nexpires:${expires}`;

export const propertyMessage = ({ agreementId, lat, lng, signedAt }) =>
  `WallsDontLie property\nagreement:${agreementId}\nlat:${lat}\nlng:${lng}\nsignedAt:${signedAt}`;

export function recover(message, signature) {
  try {
    return verifyMessage(message, signature); // checksummed address
  } catch {
    throw unauthorized('bad_signature', 'Signature is not valid');
  }
}

const nowSec = () => Math.floor(Date.now() / 1000);

/** signedAt must be recent (replay window). */
export function assertFresh(signedAt, maxAge) {
  const t = Number(signedAt);
  if (!Number.isInteger(t) || Math.abs(nowSec() - t) > maxAge) {
    throw unauthorized('stale_signature', `signedAt must be within ${maxAge}s of server time`);
  }
}

/** expires must be in the future but not absurdly far (limits how long a leaked signature lives). */
export function assertExpiry(expires, maxLifetime) {
  const t = Number(expires);
  const n = nowSec();
  if (!Number.isInteger(t) || t <= n) throw unauthorized('expired_signature', 'Signature has expired');
  if (t - n > maxLifetime) throw unauthorized('expiry_too_far', `expires must be within ${maxLifetime}s from now`);
}
