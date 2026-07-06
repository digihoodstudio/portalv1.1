'use client';
import { useState, useEffect } from 'react';
import { Phone, PhoneOutgoing, PhoneIncoming, Voicemail, Clock } from 'lucide-react';

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/calls', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setCalls(data.calls || []);
      } catch (err) {
        console.error('Failed to fetch calls', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, []);

  const outcomeIcon = (o: string) => {
    const map: Record<string, any> = {
      BOOKED: { icon: PhoneIncoming, color: 'text-emerald-400' },
      VOICEMAIL: { icon: Voicemail, color: 'text-amber-400' },
      ANSWERED: { icon: Phone, color: 'text-emerald-400' },
      NO_ANSWER: { icon: PhoneOutgoing, color: 'text-red-400' },
    };
    return map[o] || { icon: Phone, color: 'text-heading/50' };
  };

  const coachingBar = (val: number) => (
    <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full bg-gold" style={{ width: `${val}%` }} />
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-semibold text-heading mb-2 flex items-center gap-3">
        <Phone className="text-gold" /> Call Logs
      </h1>
      <p className="text-foreground/60 mb-6">Review call history and AI coaching scores.</p>

      {loading ? (
        <p className="text-heading/40 animate-pulse">Loading calls...</p>
      ) : (
        <div className="grid gap-4">
          {calls.map((call: any) => {
            const { icon: Icon, color } = outcomeIcon(call.outcome);
            return (
              <div key={call.id} className="rounded-2xl border border-white/10 bg-glass p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`mt-1 rounded-full p-2.5 ${color} bg-white/5`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-heading">{call.leadName}</p>
                      <p className="text-xs text-heading/50 mt-0.5">{call.phone}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-heading/50">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {call.durationSec}s
                        </span>
                        <span className="capitalize">{call.outcome}</span>
                      </div>
                    </div>
                  </div>
                  {call.coaching && (
                    <div className="hidden md:flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-heading/50 mb-1">Greeting</p>
                        {coachingBar(call.coaching.greeting)}
                      </div>
                      <div className="text-center">
                        <p className="text-heading/50 mb-1">Compliance</p>
                        {coachingBar(call.coaching.compliance)}
                      </div>
                      <div className="max-w-[200px]">
                        <p className="text-heading/50 mb-1">Notes</p>
                        <p className="text-heading/60 truncate">{call.coaching.coachingNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {calls.length === 0 && (
            <p className="text-heading/30 text-center py-8">No call records yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
