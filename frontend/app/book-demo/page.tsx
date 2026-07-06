'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CheckCircle2, Send, MessageCircle, Mail } from 'lucide-react';

export default function BookDemoPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [business, setBusiness] = useState('');
  const [slot, setSlot] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    'Monday 10:00 AM EST',
    'Monday 2:00 PM EST',
    'Tuesday 11:00 AM EST',
    'Wednesday 9:00 AM EST',
    'Wednesday 3:00 PM EST',
    'Thursday 1:00 PM EST',
    'Friday 10:00 AM EST',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, business,
          source: `Demo Booking – ${slot}`,
          clientId: 'client-default'
        })
      });
      if (!response.ok) throw new Error('Booking failed');
      setStatus('success');
      setName(''); setEmail(''); setPhone(''); setBusiness(''); setSlot('');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-16 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pb-6 md:px-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-surface p-5 shadow-glow">
        <div className="mb-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Book a Demo</p>
          <h1 className="mt-1 text-lg font-semibold text-heading">Schedule your AI consultation</h1>
          <p className="mt-1 text-xs text-foreground/60">Fill in your details and pick a time slot.</p>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle2 className="h-7 w-7 text-green-400" />
            </div>
            <h2 className="text-base font-semibold text-heading">Demo Booked!</h2>
            <p className="text-xs text-foreground/70 max-w-xs">
              Request received for <strong className="text-heading">{slot || 'your slot'}</strong>. We&apos;ll confirm via email.
            </p>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setStatus('')} className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-foreground hover:bg-white/10">Book Another</button>
              <Link href="/contact" className="rounded-lg bg-gold px-4 py-1.5 text-xs font-semibold text-background hover:brightness-95">Contact Sales</Link>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-2.5" autoComplete="off">
              {status === 'error' && (
                <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-2.5 text-xs text-red-300">Booking failed. Try again.</div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] font-semibold text-heading/50 mb-0.5">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" autoComplete="off" className="w-full rounded-lg border border-white/10 bg-background px-3 py-1.5 text-sm text-heading placeholder-white/20 outline-none focus:border-gold/50 transition" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-heading/50 mb-0.5">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" autoComplete="off" className="w-full rounded-lg border border-white/10 bg-background px-3 py-1.5 text-sm text-heading placeholder-white/20 outline-none focus:border-gold/50 transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] font-semibold text-heading/50 mb-0.5">Phone Number</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone" autoComplete="off" className="w-full rounded-lg border border-white/10 bg-background px-3 py-1.5 text-sm text-heading placeholder-white/20 outline-none focus:border-gold/50 transition" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-heading/50 mb-0.5">Business Name</label>
                  <input type="text" required value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Enter your business" autoComplete="off" className="w-full rounded-lg border border-white/10 bg-background px-3 py-1.5 text-sm text-heading placeholder-white/20 outline-none focus:border-gold/50 transition" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-heading/50 mb-0.5">Time Slot</label>
                <select required value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full rounded-lg border border-white/10 bg-background px-3 py-1.5 text-sm text-heading outline-none focus:border-gold/50 transition">
                  <option value="" disabled>Select a time slot...</option>
                  {timeSlots.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>

              <button type="submit" disabled={loading} className="mt-1 w-full rounded-lg bg-gold py-2 text-sm font-semibold text-background hover:brightness-95 disabled:opacity-60">
                {loading ? 'Booking...' : <><Send className="inline mr-1.5 h-3.5 w-3.5" /> Book My Demo</>}
              </button>
            </form>

            <div className="mt-3 flex items-center justify-center gap-3 border-t border-white/[0.06] pt-3">
              <a href="https://wa.me/9779849878032" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-heading hover:bg-white/10">
                <MessageCircle className="h-3 w-3 text-gold" /> WhatsApp
              </a>
              <a href="mailto:support@digihoodstudio.com" className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-heading hover:bg-white/10">
                <Mail className="h-3 w-3 text-gold" /> Email
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
