import { BrowserProvider, Contract, parseEther } from 'ethers';
import raw from './abi.json';
import { CONTRACT_ADDRESS } from './config';

const abi = (raw as any).abi ?? raw;

export const STATES = [
  'Created', 'Funded', 'Active', 'CheckoutRequested',
  'Claimed', 'Disputed', 'Settled',
];

const eth = () => (window as any).ethereum;

export function readContract() {
  return new Contract(CONTRACT_ADDRESS, abi, new BrowserProvider(eth()));
}

export async function writeContract() {
  const signer = await new BrowserProvider(eth()).getSigner();
  return new Contract(CONTRACT_ADDRESS, abi, signer);
}

export async function getRole(id: bigint | number, address: string) {
  const c = readContract();
  const a = await c.getAgreement(id);
  const arbiter: string = await c.arbiter();
  const me = address.toLowerCase();
  if (a.landlord.toLowerCase() === me) return 'Landlord';
  if (a.tenant.toLowerCase() === me) return 'Tenant';
  if (arbiter.toLowerCase() === me) return 'Arbiter';
  return 'Viewer';
}

export async function createAgreementTx(tenant: string, depositEth: string, windowDays: number) {
  const c = await writeContract();
  const seconds = BigInt(Math.round(windowDays * 86400));
  const tx = await c.createAgreement(tenant, parseEther(depositEth), seconds);
  const receipt = await tx.wait();
  let id: bigint | null = null;
  for (const log of receipt.logs) {
    try {
      const p = c.interface.parseLog(log);
      if (p && p.name === 'AgreementCreated') id = p.args[0];
    } catch {}
  }
  return { hash: tx.hash as string, id };
}
