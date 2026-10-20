import { BrowserProvider, Contract } from 'ethers';
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
