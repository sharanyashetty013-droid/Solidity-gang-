import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { readContract } from './contract';

export default function RoleLabel() {
  const { address } = useWallet();
  const [role, setRole] = useState('Not connected');

  useEffect(() => {
    if (!address) { setRole('Not connected'); return; }
    let live = true;
    setRole('Checking...');
    (async () => {
      try {
        const c = readContract();
        const me = address.toLowerCase();
        const arb: string = await c.arbiter();
        const next = Number(await c.nextId());
        let tenant = 0;
        let landlord = 0;
        for (let i = 1; i < next; i++) {
          const a = await c.getAgreement(BigInt(i));
          if (String(a[1]).toLowerCase() === me) tenant++;
          else if (String(a[0]).toLowerCase() === me) landlord++;
        }
        const parts: string[] = [];
        if (arb.toLowerCase() === me) parts.push('Arbiter');
        if (tenant) parts.push('Tenant in ' + tenant);
        if (landlord) parts.push('Landlord in ' + landlord);
        if (live) setRole(parts.length ? parts.join(' · ') : 'No agreements yet');
      } catch {
        if (live) setRole('Unknown');
      }
    })();
    return () => { live = false; };
  }, [address]);

  return <>{role}</>;
}
