import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { readContract } from './contract';

export type RoleInfo = {
  loading: boolean;
  isArbiter: boolean;
  tenantCount: number;
  landlordCount: number;
  tenantOnly: boolean;
};

const empty: RoleInfo = { loading: true, isArbiter: false, tenantCount: 0, landlordCount: 0, tenantOnly: false };
const cache: Record<string, RoleInfo> = {};

export function useRole(): RoleInfo {
  const { address } = useWallet();
  const key = address ? address.toLowerCase() : '';
  const [info, setInfo] = useState<RoleInfo>(() => (key && cache[key]) || empty);

  useEffect(() => {
    if (!key) { setInfo({ ...empty, loading: false }); return; }
    let live = true;
    setInfo(cache[key] || empty);
    (async () => {
      try {
        const c = readContract();
        const arb: string = await c.arbiter();
        const next = Number(await c.nextId());
        let tenantCount = 0, landlordCount = 0;
        for (let i = 1; i < next; i++) {
          const a = await c.getAgreement(BigInt(i));
          if (String(a[1]).toLowerCase() === key) tenantCount++;
          else if (String(a[0]).toLowerCase() === key) landlordCount++;
        }
        const isArbiter = arb.toLowerCase() === key;
        const res: RoleInfo = {
          loading: false, isArbiter, tenantCount, landlordCount,
          tenantOnly: tenantCount > 0 && landlordCount === 0 && !isArbiter,
        };
        cache[key] = res;
        if (live) setInfo(res);
      } catch {
        if (live) setInfo({ ...empty, loading: false });
      }
    })();
    return () => { live = false; };
  }, [key]);

  return info;
}
