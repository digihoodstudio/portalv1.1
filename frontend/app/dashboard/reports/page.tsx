'use client';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Phone, Users, DollarSign, ArrowUpRight } from 'lucide-react';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setMetrics(data.metrics || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { label: 'Leads Generated', value: metrics.leadsGenerated ?? '-', icon: Users, color: 'text-teal-400' },
    { label: 'Appointments Booked', value: metrics.appointmentsBooked ?? '-', icon: Phone, color: 'text-emerald-400' },
    { label: 'Calls Answered', value: metrics.callsAnswered ?? '-', icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Recovered Leads', value: metrics.recoveredLeads ?? '-', icon: DollarSign, color: 'text-amber-400' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-heading mb-2 flex items-center gap-3">
        <BarChart3 className="text-gold" /> Reports
      </h1>
      <p className="text-foreground/60 mb-6">Performance metrics at a glance.</p>

      {loading ? (
        <p className="text-heading/40 animate-pulse">Loading reports...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {cards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-glass p-5">
                <div className="flex items-center justify-between mb-3">
                  <card.icon size={20} className={card.color} />
                  <ArrowUpRight size={14} className="text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-heading">{card.value}</p>
                <p className="text-xs text-heading/50 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {metrics.publisherNote && (
            <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
              <p className="text-xs font-semibold text-gold mb-2">PUBLISHER NOTE</p>
              <p className="text-sm text-heading/70">{metrics.publisherNote}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
