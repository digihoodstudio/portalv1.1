'use client';
import { useState } from 'react';
import { Settings, User, Bell, Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').name || ''; } catch { return ''; }
  });
  const [email, setEmail] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').email || ''; } catch { return ''; }
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = name;
      user.email = email;
      localStorage.setItem('user', JSON.stringify(user));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-heading mb-2 flex items-center gap-3">
        <Settings className="text-gold" /> Settings
      </h1>
      <p className="text-foreground/60 mb-8">Manage your account preferences.</p>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-glass p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-heading mb-4">
            <User size={16} className="text-gold" /> Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-heading/50 block mb-1.5">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-heading outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-heading/50 block mb-1.5">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-heading outline-none focus:border-gold/50"
              />
            </div>
            <button onClick={handleSave} className="rounded-xl bg-gold px-6 py-2.5 text-background font-bold text-sm hover:brightness-110">
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-glass p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-heading mb-4">
            <Shield size={16} className="text-gold" /> Session
          </h2>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-red-500/10 text-red-300 px-4 py-2.5 text-sm font-semibold hover:bg-red-500/20 transition">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
