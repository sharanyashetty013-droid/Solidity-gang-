import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatEther } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { readContract, STATES } from '../lib/contract';

export default function OnChainAgreements() {
  const { address } = useWallet();
  const [list, setList] = useState<any[]>([]);
  const [msg, setMsg] = useState('Loading from Sepolia...');

  useEffect(() => {
    (async () => {
      try {
        const c = readContract();
        const next = Number(await c.nextId());
        const out: any[] = [];
        for (let i = next - 1; i >= 1; i--) {
          const a = await c.getAgreement(BigInt(i));
          out.push({ id: i, a });
        }
        setList(out);
        setMsg(out.length ? '' : 'No agreements yet.');
      } catch (e: any) {
        setMsg('Could not load: ' + (e?.shortMessage || e?.message));
      }
    })();
  }, []);

  const me = (address || '').toLowerCase();
  const mine = (x: any) => String(x.a[0]).toLowerCase() === me || String(x.a[1]).toLowerCase() === me;
  const short = (s: string) => s.slice(0, 6) + '...' + s.slice(-4);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-[#111111]">On-chain agreements</h1>
      {msg && <p className="mt-4 text-sm text-[#6B6B6B]">{msg}</p>}
      <div className="mt-6 space-y-3">
        {list.map((x) => (
          <Link key={x.id} to={'/agreement/' + x.id} className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md">
            <div className="flex justify-between text-sm">
              <b>Agreement #{x.id}{mine(x) ? ' (yours)' : ''}</b>
              <b>{STATES[Number(x.a[6])]}</b>
            </div>
            <p className="mt-2 text-xs text-[#6B6B6B]">
              {formatEther(x.a[2])} ETH · Landlord {short(String(x.a[0]))} · Tenant {short(String(x.a[1]))}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
