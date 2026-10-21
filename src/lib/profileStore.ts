import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';

export type Profile = { name: string; photo: string };
const key = (a: string) => 'wdl_profile_' + a.toLowerCase();

export function loadProfile(a: string | null): Profile {
  if (!a) return { name: '', photo: '' };
  try {
    const raw = localStorage.getItem(key(a));
    if (raw) {
      const p = JSON.parse(raw);
      return { name: p.name || '', photo: p.photo || '' };
    }
  } catch {}
  return { name: '', photo: '' };
}

export function saveProfile(a: string, p: Profile) {
  try { localStorage.setItem(key(a), JSON.stringify(p)); } catch {}
  window.dispatchEvent(new Event('wdl-profile'));
}

export function useProfile() {
  const { address } = useWallet();
  const [profile, setProfile] = useState<Profile>(() => loadProfile(address));
  useEffect(() => {
    const sync = () => setProfile(loadProfile(address));
    sync();
    window.addEventListener('wdl-profile', sync);
    return () => window.removeEventListener('wdl-profile', sync);
  }, [address]);
  return { address, profile };
}

export function initials(name: string, address: string | null) {
  const n = name.trim();
  if (n) return n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return address ? address.slice(2, 4).toUpperCase() : '?';
}
