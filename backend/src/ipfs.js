import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { AppError } from './errors.js';

const LOCAL_CID = /^local-[0-9a-f]{64}$/;
const REAL_CID = /^[A-Za-z0-9]{46,100}$/;
export const isValidCid = (c) => typeof c === 'string' && (LOCAL_CID.test(c) || REAL_CID.test(c));

/** Pinata when PINATA_JWT is set; otherwise a local folder (dev/testing only). Only encrypted bytes ever get here. */
export function createIpfs(config) {
  const mockDir = join(config.dataDir, 'ipfs-mock');
  if (!config.pinataJwt) mkdirSync(mockDir, { recursive: true });

  return {
    mode: config.pinataJwt ? 'pinata' : 'local-mock',

    async pin(bytes, name) {
      if (!config.pinataJwt) {
        const cid = 'local-' + createHash('sha256').update(bytes).digest('hex');
        writeFileSync(join(mockDir, cid), bytes);
        return cid;
      }
      const form = new FormData();
      form.append('file', new Blob([bytes], { type: 'application/octet-stream' }), name);
      form.append('pinataMetadata', JSON.stringify({ name }));
      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.pinataJwt}` },
        body: form,
      });
      if (!res.ok) throw new AppError(502, 'ipfs_pin_failed', `Pinata pin failed (${res.status})`);
      const json = await res.json();
      if (!json.IpfsHash) throw new AppError(502, 'ipfs_pin_failed', 'Pinata returned no CID');
      return json.IpfsHash;
    },

    async get(cid) {
      if (!isValidCid(cid)) throw new AppError(400, 'invalid_cid', 'Malformed CID');
      if (LOCAL_CID.test(cid)) {
        const p = join(mockDir, cid);
        if (!existsSync(p)) throw new AppError(404, 'blob_not_found', 'Evidence blob not found');
        return readFileSync(p);
      }
      const url = `${config.pinataGateway}/ipfs/${cid}` + (config.pinataGatewayToken ? `?pinataGatewayToken=${config.pinataGatewayToken}` : '');
      const res = await fetch(url);
      if (!res.ok) throw new AppError(502, 'ipfs_fetch_failed', `IPFS gateway returned ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    },
  };
}
