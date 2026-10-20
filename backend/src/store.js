import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Tiny JSON file store for things the chain does not hold (property location, geo result). */
export function createStore(dataDir) {
  mkdirSync(dataDir, { recursive: true });
  const file = join(dataDir, 'store.json');
  let db = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { properties: {}, evidence: {} };
  const save = () => {
    const tmp = file + '.tmp';
    writeFileSync(tmp, JSON.stringify(db, null, 2));
    renameSync(tmp, file); // atomic
  };
  return {
    getProperty: (id) => db.properties[id] || null,
    setProperty(id, v) { db.properties[id] = v; save(); },
    getEvidence: (id, cid) => db.evidence[`${id}:${cid}`] || null,
    putEvidence(id, cid, v) { db.evidence[`${id}:${cid}`] = v; save(); },
  };
}
