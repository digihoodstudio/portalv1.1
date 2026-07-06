'use client';
import { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, RefreshCw } from 'lucide-react';

export default function ProspectsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/leads', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setLeads(data.leads || []);
      } catch (err) {
        console.error('Failed to fetch leads', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const filtered = leads.filter((l: any) =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search)
  );

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      NEW: 'bg-blue-500/20 text-blue-300',
      FOLLOW_UP: 'bg-amber-500/20 text-amber-300',
      INTERESTED: 'bg-emerald-500/20 text-emerald-300',
      NO_ANSWER: 'bg-gray-500/20 text-gray-300',
      CONTACTED: 'bg-purple-500/20 text-purple-300',
      CLOSED: 'bg-green-500/20 text-green-300',
    };
    return map[s] || 'bg-white/10 text-white/60';
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white mb-2 flex items-center gap-3">
        <Users className="text-gold" /> Prospects
      </h1>
      <p className="text-foreground/60 mb-6">All leads across your campaigns.</p>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full rounded-2xl border border-white/10 bg-[#0c1433]/80 pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50"
        />
      </div>

      {loading ? (
        <p className="text-white/40 animate-pulse">Loading prospects...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-glass">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead: any) => (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-medium text-white">{lead.name}</td>
                  <td className="py-3 px-4 text-white/70">{lead.email}</td>
                  <td className="py-3 px-4 text-white/70">{lead.phone || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/50 text-[10px]">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-white/30">No prospects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
