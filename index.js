import { loadConfig } from './config.js';
import { createApp } from './server.js';

const config = loadConfig();
createApp(config).listen(config.port, () => {
  console.log(`Walls Don't Lie API on :${config.port}  chain=${config.chainId}  contract=${config.contractAddress}`);
  if (!config.pinataJwt) console.warn('PINATA_JWT not set: using LOCAL MOCK storage (dev only, nothing goes to IPFS).');
});
