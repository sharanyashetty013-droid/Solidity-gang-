import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { readContract } from './contract';

export const ShortAddress = () => {
  const { address } = useWallet();
  return <>{address ? address.slice(0, 6) + '…' + address.slice(-4) : 'Not connected'}</>;
};

export const RoleText = () => {
  const { address } = useWallet();
  const [role, setRole] = useState('Not connected');

  useEffect(() => {
    if (!address) { setRole('Not connected'); return; }
    let live = true;
    readContract().arbiter()
      .then((arb: string) => {
        if (!live) return;
        setRole(arb.toLowerCase() === address.toLowerCase() ? 'Arbiter' : 'Per agreement');
      })
      .catch(() => { if (live) setRole('Unknown'); });
    return () => { live = false; };
  }, [address]);

  return <>{role}</>;
};
