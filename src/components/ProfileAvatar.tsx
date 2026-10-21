import { useProfile, initials } from '../lib/profileStore';

export default function ProfileAvatar({ size = 56 }: { size?: number }) {
  const { address, profile } = useProfile();
  const box = { width: size, height: size };
  if (profile.photo) {
    return <img src={profile.photo} alt="Profile" style={box} className="mx-auto rounded-full object-cover" />;
  }
  return (
    <div style={{ ...box, fontSize: size / 3 }} className="mx-auto rounded-full bg-[#E0218A]/10 text-[#E0218A] font-bold flex items-center justify-center">
      {initials(profile.name, address)}
    </div>
  );
}

export function ProfileName() {
  const { profile } = useProfile();
  if (!profile.name) return null;
  return <p className="mt-2 text-sm font-bold text-[#111111]">{profile.name}</p>;
}
