import { Contract, JsonRpcProvider, Network } from 'ethers';
import { abi, STATES } from './config.js';
import { notFound, AppError } from './errors.js';

const TYPES = ['move-in', 'move-out'];

export function createChain(config) {
  const net = Network.from(config.chainId);
  const provider = new JsonRpcProvider(config.rpcUrl, net, { staticNetwork: net });
  const contract = new Contract(config.contractAddress, abi, provider);
  const notFoundSelector = contract.interface.getError('AgreementNotFound').selector;
  const cache = new Map(); // agreementId -> { events, scannedTo }

  async function rpc(fn) {
    try {
      return await fn();
    } catch (e) {
      if (e?.revert?.name === 'AgreementNotFound' || (typeof e?.data === 'string' && e.data.startsWith(notFoundSelector))) {
        throw notFound('agreement_not_found', 'Agreement does not exist');
      }
      throw new AppError(502, 'chain_unavailable', 'Could not read from the blockchain RPC');
    }
  }

  return {
    provider,
    contract,

    async getAgreement(id) {
      const a = await rpc(() => contract.getAgreement(id));
      return {
        id: String(id),
        landlord: a.landlord,
        tenant: a.tenant,
        deposit: a.deposit.toString(),
        claimWindow: Number(a.claimWindow),
        checkoutAt: Number(a.checkoutAt),
        claimedAt: Number(a.claimedAt),
        state: STATES[Number(a.state)],
        stateIndex: Number(a.state),
        pendingCount: Number(a.pendingCount),
        disputedCount: Number(a.disputedCount),
      };
    },

    getArbiter: () => rpc(() => contract.arbiter()),

    /** EvidenceSubmitted events for one agreement, scanned in chunks and cached incrementally. */
    async getEvidence(id) {
      const key = String(id);
      const entry = cache.get(key) || { events: [], scannedTo: config.deployBlock - 1 };
      const latest = await rpc(() => provider.getBlockNumber());
      const filter = contract.filters.EvidenceSubmitted(BigInt(id));
      let from = entry.scannedTo + 1;
      const fresh = [];
      while (from <= latest) {
        const to = Math.min(from + config.eventChunk - 1, latest);
        const logs = await rpc(() => contract.queryFilter(filter, from, to));
        for (const l of logs) {
          fresh.push({
            hash: l.args.hash,
            cid: l.args.cid,
            type: TYPES[Number(l.args.evidenceType)],
            timestamp: Number(l.args.timestamp), // block.timestamp, not the server's clock
            submitter: l.args.submitter,
            txHash: l.transactionHash,
            blockNumber: l.blockNumber,
          });
        }
        from = to + 1;
      }
      entry.events = entry.events.concat(fresh);
      entry.scannedTo = latest;
      cache.set(key, entry);
      return entry.events;
    },
  };
}

export const sameAddr = (a, b) => a.toLowerCase() === b.toLowerCase();
