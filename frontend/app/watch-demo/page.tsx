'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Smartphone, MessageSquare, Send, Users, PhoneCall, Sparkles, RefreshCw, TrendingUp, Volume2, CheckCircle, ChevronRight } from 'lucide-react';



export default function WatchDemoPage() {
  const [activeTab, setActiveTab] = useState<'voice' | 'sms' | 'reactivation' | 'analytics'>('voice');

  // Voice AI Simulation States
  const [voiceCallStatus, setVoiceCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'completed'>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState<{ speaker: string; text: string }[]>([]);
  const [voiceStep, setVoiceStep] = useState(0);
  const voiceTimeoutRef = useRef<any>(null);

  const voiceScript = [
    { speaker: 'System', text: 'Incoming missed call callback triggered (Autodialer active)...' },
    { speaker: 'System', text: 'Call routing established. Phone ringing...' },
    { speaker: 'AI', text: 'Hey there! Thanks for calling Septic Specialists callback line. Saw we just missed a call from this number a few seconds ago and wanted to get right back to you. Did we catch you at a good time?' },
    { speaker: 'Caller', text: 'Oh, wow, that was fast. Yeah! Actually, my master bathroom toilet is backing up and bubbling. I need a technician out today.' },
    { speaker: 'AI', text: 'Oh no, bubble backup is definitely an emergency. Let me check our emergency dispatch calendar. I have a tech available to head over around 2:00 PM this afternoon. Would that slot work for you?' },
    { speaker: 'Caller', text: 'Yes! 2 PM is perfect. Please send them.' },
    { speaker: 'AI', text: 'Fantastic. I have scheduled that emergency dispatch slot for you. A booking confirmation and tracking link will be sent to your mobile number shortly. Is there anything else I can help with?' },
    { speaker: 'Caller', text: 'No, that is all. Thank you so much!' },
    { speaker: 'AI', text: 'You are very welcome. Hope you have a great rest of your day! Goodbye.' },
    { speaker: 'System', text: 'Call completed. ServiceTitan CRM booking generated successfully.' }
  ];

  const startVoiceSimulation = () => {
    if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    setVoiceCallStatus('ringing');
    setVoiceTranscript([]);
    setVoiceStep(0);
  };

  const acceptVoiceCall = () => {
    setVoiceCallStatus('connected');
    setVoiceStep(0);
    setVoiceTranscript([{ speaker: 'System', text: voiceScript[0].text }]);
  };

  useEffect(() => {
    if (voiceCallStatus === 'connected') {
      if (voiceStep < voiceScript.length - 1) {
        voiceTimeoutRef.current = setTimeout(() => {
          const nextStep = voiceStep + 1;
          setVoiceStep(nextStep);
          setVoiceTranscript(prev => [...prev, voiceScript[nextStep] as any]);
        }, 2200);
      } else {
        setVoiceCallStatus('completed');
      }
    }
    return () => {
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    };
  }, [voiceCallStatus, voiceStep]);

  // SMS Sandbox States
  const [smsStatus, setSmsStatus] = useState<'idle' | 'active'>('idle');
  const [smsMessages, setSmsMessages] = useState<{ sender: 'AI' | 'User'; text: string; time: string }[]>([]);
  const [smsInput, setSmsInput] = useState('');
  const [smsTyping, setSmsTyping] = useState(false);

  const startSmsSimulation = () => {
    setSmsStatus('active');
    setSmsMessages([
      { sender: 'AI', text: "Hey! This is the automated assistant for Septic & Drain Specialists. We noticed we just missed a call from you. Are you looking to schedule emergency service or routine tank pumping?", time: 'Just now' }
    ]);
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsInput.trim()) return;

    const userText = smsInput;
    setSmsMessages(prev => [...prev, { sender: 'User', text: userText, time: 'Just now' }]);
    setSmsInput('');
    setSmsTyping(true);

    setTimeout(() => {
      setSmsTyping(false);
      let reply = "Got it! I can book you in with our service dispatch desk. Would you like me to send you our direct scheduling booking link?";
      
      const lower = userText.toLowerCase();
      if (lower.includes('emergency') || lower.includes('clog') || lower.includes('back') || lower.includes('broken')) {
        reply = "Oh no, custer backing-up drainage is a priority emergency. I can reserve our 1:30 PM dispatch slot tomorrow. Should I lock that in for you?";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
        reply = "Our standard septic pumping starts at $1,497 under our yearly contracts, and inspections start at $195. Should we schedule an inspector to provide an estimate?";
      } else if (lower.includes('laundry') || lower.includes('linen') || lower.includes('commercial')) {
        reply = "For commercial routes and commercial laundry accounts, let's get you set up with a route audit check. Would you like a booking call?";
      }

      setSmsMessages(prev => [...prev, { sender: 'AI', text: reply, time: 'Just now' }]);
    }, 1800);
  };

  // Reactivation Blaster states
  const [campaignSelected, setCampaignSelected] = useState('septic-stale');
  const [reactivationStatus, setReactivationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [reactivationProgress, setReactivationProgress] = useState(0);
  const [reactivationStats, setReactivationStats] = useState({ contacted: 0, replies: 0, bookings: 0 });
  const [leadsList, setLeadsList] = useState([
    { name: 'John Connor', phone: '(555) 0113', status: 'Dormant (12mo+)' },
    { name: 'Marcus Wright', phone: '(555) 0187', status: 'Dormant (18mo+)' },
    { name: 'Sarah Connor', phone: '(555) 0199', status: 'Dormant (9mo+)' },
    { name: 'Kyle Reese', phone: '(555) 0104', status: 'Dormant (24mo+)' }
  ]);

  const runReactivation = () => {
    setReactivationStatus('running');
    setReactivationProgress(0);
    setReactivationStats({ contacted: 0, replies: 0, bookings: 0 });
    setLeadsList([
      { name: 'John Connor', phone: '(555) 0113', status: 'Reactivating...' },
      { name: 'Marcus Wright', phone: '(555) 0187', status: 'Reactivating...' },
      { name: 'Sarah Connor', phone: '(555) 0199', status: 'Reactivating...' },
      { name: 'Kyle Reese', phone: '(555) 0104', status: 'Reactivating...' }
    ]);

    let interval = setInterval(() => {
      setReactivationProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setReactivationStatus('completed');
          setLeadsList([
            { name: 'John Connor', phone: '(555) 0113', status: 'Replied (Booked!)' },
            { name: 'Marcus Wright', phone: '(555) 0187', status: 'Left Voicemail' },
            { name: 'Sarah Connor', phone: '(555) 0199', status: 'Replied (Booked!)' },
            { name: 'Kyle Reese', phone: '(555) 0104', status: 'DNC / Opt-out' }
          ]);
          setReactivationStats({ contacted: 4, replies: 2, bookings: 2 });
          return 100;
        }
        const nextProg = p + 10;
        const currentContacted = Math.min(4, Math.floor(nextProg / 25));
        const currentReplies = Math.min(2, Math.floor(nextProg / 50));
        const currentBookings = Math.min(2, Math.floor(nextProg / 75));
        setReactivationStats({ contacted: currentContacted, replies: currentReplies, bookings: currentBookings });
        
        setLeadsList(prev => prev.map((l, idx) => {
          if (idx < currentBookings) return { ...l, status: 'Replied (Booked!)' };
          if (idx < currentReplies) return { ...l, status: 'Text Sent (Replied)' };
          if (idx < currentContacted) return { ...l, status: 'SMS Outbound Sent' };
          return l;
        }));

        return nextProg;
      });
    }, 400);
  };

  // Real Phone Call Trial states
  const [realPhoneInput, setRealPhoneInput] = useState('');
  const [realPhoneIndustry, setRealPhoneIndustry] = useState('septic');
  const [realPhoneLoading, setRealPhoneLoading] = useState(false);
  const [realPhoneStatus, setRealPhoneStatus] = useState('');

  const handleRealPhoneTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realPhoneInput.trim()) return;

    setRealPhoneLoading(true);
    setRealPhoneStatus('Initiating systems callback handshake...');
    
    try {
      const res = await fetch('/api/voice/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: realPhoneInput, industry: realPhoneIndustry })
      });
      const data = await res.json();
      if (res.ok && data.isRealCall) {
        setRealPhoneStatus('📞 Outbound call triggered via Twilio carrier! Check your phone in 5 seconds.');
      } else {
        setRealPhoneStatus('💻 Sandbox callback simulation triggered successfully! (Twilio settings were in offline fallback mode).');
      }
    } catch (err) {
      setRealPhoneStatus('💻 Sandbox callback simulation triggered successfully! (offline demo backup active).');
    } finally {
      setTimeout(() => {
        setRealPhoneLoading(false);
        setRealPhoneInput('');
      }, 5000);
    }
  };

  return (
    <main className="mx-auto mt-28 max-w-5xl px-6 pb-24 md:px-12">
      <section className="rounded-[32px] border border-white/10 bg-glass p-6 md:p-12 shadow-glow space-y-10">
        
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold">Interactive Sandbox</p>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl bg-gradient-to-r from-white via-white to-gold bg-clip-text text-transparent">
            See the AI Growth System in action
          </h1>
          <p className="mt-3 max-w-2xl text-xs text-white/55 leading-relaxed">
            Click through our interactive simulator sandboxes to preview the AI receptionist, automated SMS missed call flows, and lead reactivation sequences live.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
          {[
            { id: 'voice', label: '🤖 AI Voice CSR', icon: <PhoneCall size={13} /> },
            { id: 'sms', label: '💬 SMS Recovery', icon: <MessageSquare size={13} /> },
            { id: 'reactivation', label: '🚀 Lead Reactivation', icon: <Users size={13} /> },
            { id: 'analytics', label: '📊 Command Center', icon: <TrendingUp size={13} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold border transition ${
                activeTab === tab.id
                  ? 'bg-gold border-gold text-background'
                  : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* SIMULATOR SCREEN CONTAINER */}
        <div className="rounded-[24px] border border-white/10 bg-[#060c22]/60 p-4 md:p-6 min-h-[420px] flex flex-col justify-between">
          
          {/* TAB 1: AI VOICE CSR SIMULATION */}
          {activeTab === 'voice' && (
            <div className="grid gap-6 md:grid-cols-[280px_1fr] h-full items-center">
              {/* Left Side: Mock Phone Device */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-[220px] h-[380px] rounded-[36px] border-[6px] border-white/10 bg-[#04081a] relative flex flex-col justify-between p-4 overflow-hidden shadow-2xl">
                  {/* Top Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-white/10 rounded-full" />
                  
                  {/* Screen Content */}
                  <div className="flex-1 flex flex-col justify-between py-6 text-center text-white">
                    {voiceCallStatus === 'idle' && (
                      <div className="my-auto space-y-4">
                        <Smartphone size={36} className="mx-auto text-gold animate-bounce" />
                        <p className="text-xs font-bold">AI Autodialer CSR</p>
                        <p className="text-[10px] text-white/40">Ready to simulate an incoming missed call response flow.</p>
                      </div>
                    )}

                    {voiceCallStatus === 'ringing' && (
                      <div className="my-auto space-y-6">
                        <div className="relative flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/30 animate-pulse">
                          <PhoneCall className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gold">Ringing...</p>
                          <p className="text-[10px] text-white/50 mt-1">Septic Specialists AI</p>
                        </div>
                      </div>
                    )}

                    {voiceCallStatus === 'connected' && (
                      <div className="my-auto space-y-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-pulse">
                          <Volume2 size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-400">Live Call Connected</p>
                          <p className="text-[9px] text-white/30 font-mono mt-1">0:{(voiceStep * 2).toString().padStart(2, '0')}</p>
                        </div>
                      </div>
                    )}

                    {voiceCallStatus === 'completed' && (
                      <div className="my-auto space-y-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
                          <CheckCircle size={16} />
                        </div>
                        <p className="text-xs font-bold text-blue-400">Booking Saved</p>
                        <p className="text-[9px] text-white/40">Dispatch slot reserved in ServiceTitan CRM database.</p>
                      </div>
                    )}

                    {/* Action buttons at phone bottom */}
                    <div className="pt-2">
                      {voiceCallStatus === 'idle' && (
                        <button
                          onClick={startVoiceSimulation}
                          className="w-full py-2 bg-gold hover:brightness-105 text-background rounded-full font-bold text-xs shadow-md"
                        >
                          Simulate Missed Call
                        </button>
                      )}
                      {voiceCallStatus === 'ringing' && (
                        <button
                          onClick={acceptVoiceCall}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-xs shadow-md animate-bounce"
                        >
                          Accept Call
                        </button>
                      )}
                      {(voiceCallStatus === 'connected' || voiceCallStatus === 'completed') && (
                        <button
                          onClick={() => setVoiceCallStatus('idle')}
                          className="w-full py-2 bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/20 rounded-full font-bold text-xs"
                        >
                          Reset Simulation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive Live Transcript */}
              <div className="flex-1 flex flex-col justify-between h-full bg-[#04081c]/50 border border-white/5 rounded-2xl p-4 min-h-[300px]">
                <div className="border-b border-white/5 pb-2 mb-3">
                  <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Live Transcription Feed</p>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 max-h-[260px] pr-2">
                  {voiceTranscript.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-white/30 text-xs italic">
                      Click &quot;Simulate Missed Call&quot; and accept the ring on the phone widget to start conversation logs.
                    </div>
                  ) : (
                    voiceTranscript.map((log, index) => {
                      if (log.speaker === 'System') {
                        return (
                          <div key={index} className="text-center py-1">
                            <span className="inline-block text-[9px] font-mono text-gold bg-gold/5 border border-gold/15 rounded px-2 py-0.5 font-mono">
                              {log.text}
                            </span>
                          </div>
                        );
                      }
                      
                      const isAI = log.speaker === 'AI';
                      return (
                        <div key={index} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[85%] rounded-xl p-3 text-xs ${
                            isAI 
                              ? 'bg-gold/10 border border-gold/15 text-white rounded-tl-none' 
                              : 'bg-white/5 border border-white/5 text-white/95 rounded-tr-none'
                          }`}>
                            <span className={`text-[8px] font-bold uppercase tracking-wider block mb-1 ${
                              isAI ? 'text-gold' : 'text-purple-400'
                            }`}>
                              {isAI ? '🤖 Voice AI Assistant' : '👤 Customer'}
                            </span>
                            <p className="leading-relaxed">{log.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMS RECOVERY SIMULATION */}
          {activeTab === 'sms' && (
            <div className="grid gap-6 md:grid-cols-[280px_1fr] h-full items-center">
              {/* Left Side: Mock SMS Screen */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-[220px] h-[380px] rounded-[36px] border-[6px] border-white/10 bg-[#04081a] relative flex flex-col justify-between p-3 overflow-hidden shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-white/10 rounded-full" />
                  
                  {/* SMS UI */}
                  <div className="flex-1 flex flex-col justify-between py-6 text-white text-xs">
                    {smsStatus === 'idle' ? (
                      <div className="my-auto space-y-4 text-center px-4">
                        <MessageSquare size={36} className="mx-auto text-gold animate-pulse" />
                        <p className="text-xs font-bold">SMS Recovery Sandbox</p>
                        <p className="text-[10px] text-white/40">Test how the system automatically re-engages missed callers.</p>
                        <button
                          onClick={startSmsSimulation}
                          className="w-full py-2 bg-gold hover:brightness-105 text-background rounded-full font-bold text-[10px] shadow-md mt-2"
                        >
                          Trigger SMS Sequence
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between">
                        {/* Conversation log */}
                        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[230px] pr-1 flex flex-col justify-end">
                          {smsMessages.map((msg, idx) => {
                            const isAI = msg.sender === 'AI';
                            return (
                              <div
                                key={idx}
                                className={`flex flex-col rounded-xl px-2.5 py-2 border max-w-[85%] text-[10px] ${
                                  isAI 
                                    ? 'bg-gold/5 border-gold/10 text-white self-start' 
                                    : 'bg-white/5 border-white/5 text-white/95 self-end ml-auto'
                                }`}
                              >
                                <span className="text-[8px] font-bold tracking-wide uppercase text-gold mb-0.5">
                                  {isAI ? '🤖 SMS AI' : '👤 You'}
                                </span>
                                <p>{msg.text}</p>
                              </div>
                            );
                          })}
                          {smsTyping && (
                            <div className="bg-gold/5 border border-gold/10 rounded-xl px-2.5 py-2 text-[10px] text-gold/60 self-start animate-pulse">
                              AI is typing...
                            </div>
                          )}
                        </div>

                        {/* Input field */}
                        <form onSubmit={handleSendSms} className="mt-2 flex gap-1 border-t border-white/5 pt-2 flex-shrink-0">
                          <input
                            type="text"
                            value={smsInput}
                            onChange={(e) => setSmsInput(e.target.value)}
                            placeholder="Type a response..."
                            className="flex-1 bg-[#050b1d] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:border-gold outline-none"
                          />
                          <button
                            type="submit"
                            className="bg-gold text-background p-1.5 rounded-lg flex items-center justify-center shadow-sm"
                          >
                            <Send size={10} />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Informative instructions */}
              <div className="flex-1 bg-[#08102f]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-gold h-4 w-4" /> Live SMS Sandbox Testing
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  When a call goes unanswered, our autodialer drops offline and instantly transfers the communication channel to an SMS outreach thread. 
                </p>
                <div className="bg-[#04081c]/50 rounded-xl p-3 border border-white/5 text-xs text-white/60 space-y-1.5">
                  <p className="font-bold text-gold text-[10px] uppercase">Suggested Sandbox Responses to Type:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[10px]">
                    <li>Type: <strong className="text-white">&quot;I need a tech for an emergency backing-up toilet&quot;</strong> to watch the AI prioritize booking slots.</li>
                    <li>Type: <strong className="text-white">&quot;How much does it cost?&quot;</strong> to test pricing lookup scripts.</li>
                    <li>Type: <strong className="text-white">&quot;Send me the booking link&quot;</strong> to watch links auto-populate.</li>
                  </ul>
                </div>
                {smsStatus === 'active' && (
                  <button
                    onClick={() => {
                      setSmsStatus('idle');
                      setSmsMessages([]);
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline"
                  >
                    Clear Chat Logs
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEAD LEAD REACTIVATION SIMULATOR */}
          {activeTab === 'reactivation' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Database Outreach Blaster Simulator</h3>
                  <p className="text-[10px] text-white/50">Upload a spreadsheet directory, select a template, and watch outreach activate.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={campaignSelected}
                    onChange={(e) => setCampaignSelected(e.target.value)}
                    className="bg-[#050b1d] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                  >
                    <option value="septic-stale">Septic Annual Service Renewals</option>
                    <option value="commercial-revival">Commercial Laundry Revival campaign</option>
                  </select>

                  <button
                    onClick={runReactivation}
                    disabled={reactivationStatus === 'running'}
                    className="rounded-lg bg-gold text-background px-4 py-1.5 text-xs font-bold hover:brightness-105 disabled:opacity-50"
                  >
                    {reactivationStatus === 'running' ? 'Sequence Firing...' : 'Launch Outreach'}
                  </button>
                </div>
              </div>

              {/* Progress and status */}
              {reactivationStatus !== 'idle' && (
                <div className="space-y-2 bg-[#04081c]/60 border border-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-center text-[10px] text-white/60">
                    <span>Campaign launch sequence: {reactivationProgress}% Complete</span>
                    <span className="font-semibold text-gold font-mono">{reactivationStatus.toUpperCase()}</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div style={{ width: `${reactivationProgress}%` }} className="h-full bg-gold transition-all duration-300" />
                  </div>
                  
                  {/* Metrics counter row */}
                  <div className="grid grid-cols-3 gap-3 text-center pt-1.5">
                    <div className="bg-[#050c22] rounded-lg py-1 border border-white/5">
                      <span className="text-[9px] text-white/40 block">Total Contacted</span>
                      <strong className="text-xs text-white mt-0.5">{reactivationStats.contacted} / 4</strong>
                    </div>
                    <div className="bg-[#050c22] rounded-lg py-1 border border-white/5">
                      <span className="text-[9px] text-white/40 block">Response replies</span>
                      <strong className="text-xs text-white mt-0.5">{reactivationStats.replies}</strong>
                    </div>
                    <div className="bg-[#050c22] rounded-lg py-1 border border-white/5">
                      <span className="text-[9px] text-white/40 block">Booked in CRM</span>
                      <strong className="text-xs text-gold mt-0.5">{reactivationStats.bookings}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Table layout */}
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#04081c]/50">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/40 font-semibold uppercase tracking-wider">
                      <th className="p-2">Name</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Outreach Template</th>
                      <th className="p-2 text-right">Outreach Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsList.map((lead, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="p-2 font-bold text-white">{lead.name}</td>
                        <td className="p-2 text-white/55 font-mono">{lead.phone}</td>
                        <td className="p-2 text-gold">{campaignSelected === 'septic-stale' ? 'Annual Pumping Renewal Text' : 'Commercial Linen Audit Outreach'}</td>
                        <td className="p-2 text-right">
                          <span className={`inline-block rounded px-2 py-0.5 font-bold ${
                            lead.status.includes('Booked')
                              ? 'bg-green-950 text-green-400 border border-green-500/10'
                              : lead.status === 'Reactivating...' || lead.status.includes('Outbound')
                              ? 'bg-gold/10 text-gold animate-pulse'
                              : 'bg-white/5 text-white/40'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM COMMAND CENTER PREVIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Simulated Live Dashboard Console</h3>
                <p className="text-[10px] text-white/50">Hover widgets to audit active indicators or run simulated outcomes logs.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="bg-[#04081c]/50 border border-white/5 rounded-xl p-4 text-center space-y-1 shadow-glow hover:border-gold/30 transition duration-300">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">Outbound Dials Fired</span>
                  <span className="text-2xl font-extrabold block text-white">412 Calls</span>
                  <span className="text-[9px] text-emerald-400 block">+14 during live hours</span>
                </div>

                <div className="bg-[#04081c]/50 border border-white/5 rounded-xl p-4 text-center space-y-1 hover:border-gold/30 transition duration-300">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">Overall Booking Conversion</span>
                  <span className="text-2xl font-extrabold block text-white">88.4%</span>
                  <span className="text-[9px] text-white/40 block">91.4% Missed Call Answer Rate</span>
                </div>

                <div className="bg-[#04081c]/50 border border-white/5 rounded-xl p-4 text-center space-y-1 hover:border-gold/30 transition duration-300">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">Revenue Recovered</span>
                  <span className="text-2xl font-extrabold block text-gold">$34,810</span>
                  <span className="text-[9px] text-emerald-400 block">+$950 recovered from dead leads</span>
                </div>
              </div>

              <div className="bg-[#04081c]/40 border border-white/5 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="text-gold h-4 w-4" />
                    <span className="text-[10px] font-bold text-white">Call Quality Analytics Recorder Preview</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10">Passed AI Check</span>
                </div>
                
                <p className="text-[10px] text-white/70 italic leading-normal">
                  &quot;Great call control. AI receptionist successfully resolved backup emergencies and guided customer to direct CRM booking confirmation details in under 80 seconds.&quot;
                </p>
              </div>
            </div>
          )}

        </div>

        {/* REAL PHONE OUTBOUND TEST CALL MODULE */}
        <div className="border-t border-white/5 pt-8">
          <div className="rounded-[24px] border border-white/10 bg-[#07112e] p-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-3">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <PhoneCall className="text-gold h-5 w-5 animate-pulse" /> Try it on your real phone!
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Experience the actual voice AI receptionist call. Enter your number below, select a service niche, and click trigger. The system will initiate an outbound Twilio connection directly to your handset.
              </p>
            </div>

            <form onSubmit={handleRealPhoneTest} className="space-y-3 bg-[#04081a]/60 border border-white/5 p-4 rounded-xl">
              <div>
                <label className="block text-[9px] text-white/40 uppercase mb-1 font-semibold">1. Select Service Niche Tone</label>
                <select
                  value={realPhoneIndustry}
                  onChange={(e) => setRealPhoneIndustry(e.target.value)}
                  className="w-full bg-[#050b1d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  <option value="septic">Septic & Drain Callback Assistant</option>
                  <option value="commercial">Commercial Laundry Answering</option>
                  <option value="industrial">Industrial Jetting Outbound</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-white/40 uppercase mb-1 font-semibold">2. Enter Mobile Number</label>
                <input
                  required
                  type="tel"
                  value={realPhoneInput}
                  onChange={(e) => setRealPhoneInput(e.target.value)}
                  placeholder="e.g. +15550188"
                  className="w-full bg-[#050b1d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-gold outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={realPhoneLoading}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-gold py-2.5 text-xs font-bold text-background transition hover:brightness-105 disabled:opacity-50"
              >
                {realPhoneLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <PhoneCall className="h-3.5 w-3.5" />}
                {realPhoneLoading ? 'Triggering Dialer...' : 'Send Live Test Call'}
              </button>

              {realPhoneStatus && (
                <div className="rounded-lg bg-white/5 border border-white/5 p-2 text-[10px] text-gold font-semibold text-center animate-pulse mt-2 leading-relaxed">
                  {realPhoneStatus}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Secondary Navigation buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row border-t border-white/5 pt-6">
          <Link
            href="/book-demo"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-xs font-bold text-background transition hover:brightness-95"
          >
            Book Live Strategy Demo <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-white/10 px-8 py-3.5 text-xs text-foreground transition hover:border-gold/70 hover:text-gold"
          >
            Talk to Sales Specialist
          </Link>
        </div>
      </section>
    </main>
  );
}
