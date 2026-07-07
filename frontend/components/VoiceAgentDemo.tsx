"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Phone, PhoneOff, Volume2, User, Sparkles, Clock, ChevronRight, Mic, Send, Bot, Loader2 } from "lucide-react";

interface Message {
  role: "assistant" | "user";
  text: string;
}

interface CapturedLead {
  id: string;
  name: string;
  company: string;
  phone: string;
  interest: string;
  capturedAt: string;
  status: string;
}

const SESSION_ID = `maya-session-${Date.now()}`;

const INITIAL_MAYA: Message = {
  role: "assistant",
  text: "Hello! I'm Maya, your AI voice agent from Digihood Studio. I can help answer questions about our AI receptionist services, pricing, missed call recovery, and more. I can also collect your details so our team can reach out. How can I help you today?",
};

const quickPrompts = [
  "Tell me about pricing",
  "How does missed call recovery work?",
  "Book a demo for me",
  "I want to speak to someone",
];

export default function VoiceAgentDemo() {
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [demoLeads, setDemoLeads] = useState<CapturedLead[]>([]);
  const timerRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => setCallTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/voice/maya-leads");
      const data = await res.json();
      setDemoLeads(data.leads || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (callState === "connected" || callState === "ended") fetchLeads();
  }, [callState, fetchLeads]);

  const extractLeadInfo = (msgs: Message[]) => {
    const full = msgs.map((m) => `${m.role}: ${m.text}`).join("\n").toLowerCase();
    const info: Record<string, string> = {};
    const nameMatch = full.match(/(?:my name is|i'm |i am |call me |name(?:'s| is) )([a-z]+(?:\s+[a-z]+)?)/i);
    if (nameMatch) info.name = nameMatch[1].replace(/^[a-z]/, (c) => c.toUpperCase());
    const phoneMatch = full.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch) info.phone = phoneMatch[1];
    const emailMatch = full.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/);
    if (emailMatch) info.email = emailMatch[1];
    const interestKeywords = ["pricing", "price", "cost", "demo", "book", "missed call", "receptionist", "reactivation", "support", "partner", "contractor", "plumbing", "hvac"];
    for (const kw of interestKeywords) {
      if (full.includes(kw)) {
        info.interest = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }
    return info;
  };

  const captureLead = async (msgs: Message[]) => {
    const info = extractLeadInfo(msgs);
    if (!info.name && !info.phone) return;
    try {
      await fetch("/api/voice/maya-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          stage: "capture",
          userMessage: JSON.stringify(info),
          collected: info,
        }),
      });
      fetchLeads();
    } catch {}
  };

  const startCall = () => {
    setCallState("ringing");
    setTimeout(() => {
      setCallState("connected");
      setMessages([INITIAL_MAYA]);
      setCallTimer(0);
    }, 2000);
  };

  const endCall = () => {
    setCallState("ended");
    if (messages.length > 1) captureLead(messages);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          messages: [
            { role: "system", text: "You are Maya, a friendly and professional AI voice agent from Digihood Studio. You help potential customers learn about AI receptionist services, missed call recovery, lead reactivation, and pricing. You speak warmly and conversationally, like a real person on a phone call. Keep responses concise (2-4 sentences) and natural. If someone wants to share their details, ask for their name, phone number, company, and what they're interested in." },
            ...updated.map((m) => ({ role: m.role, text: m.text })),
          ],
        }),
      });
      const data = await res.json();
      const reply = data.answer ?? "I'm here to help — could you tell me more about what you're looking for?";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage(input);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Phone / Chat UI */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md overflow-hidden">
          {/* Phone Header */}
          <div className="bg-gradient-to-r from-gold/20 to-amber-700/10 border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold/30 border-2 border-gold/50 flex items-center justify-center">
                  <Sparkles size={20} className="text-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Maya</h3>
                  <p className="text-[10px] text-gold/70">AI Voice Agent • Digihood Studio</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {callState === "connected" && (
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {formatTime(callTimer)}
                  </span>
                )}
                {callState === "ringing" && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 animate-pulse">
                    Ringing...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && callState === "idle" && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Phone size={24} className="text-gold/50" />
                </div>
                <p className="text-xs text-white/40 max-w-xs">
                  Click "Call Maya" to experience a live AI voice agent. Maya answers naturally, answers your questions, and can capture your details.
                </p>
              </div>
            )}
            {messages.length === 0 && callState === "ringing" && (
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
                  <Phone size={24} className="text-amber-400" />
                </div>
                <p className="text-xs text-amber-400/70 animate-pulse">Connecting you to Maya...</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant" ? "bg-gold/20 border border-gold/30" : "bg-teal-500/20 border border-teal-500/30"
                }`}>
                  {msg.role === "assistant" ? (
                    <Sparkles size={12} className="text-gold" />
                  ) : (
                    <User size={12} className="text-teal-400" />
                  )}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-white/5 border border-white/10 text-white/90"
                    : "bg-gold/10 border border-gold/20 text-gold"
                }`}>
                  {msg.text.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-1.5" : ""}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                  <Sparkles size={12} className="text-gold" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-4">
            {callState === "idle" && (
              <button
                onClick={startCall}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-gold to-amber-600 text-background font-bold text-sm py-3.5 hover:brightness-110 transition shadow-lg shadow-gold/20"
              >
                <Phone size={16} />
                Call Maya
              </button>
            )}
            {callState === "ringing" && (
              <button
                onClick={() => { setCallState("idle"); setMessages([]); }}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-sm py-3.5 hover:bg-red-500/30 transition"
              >
                <PhoneOff size={16} />
                Cancel
              </button>
            )}
            {callState === "connected" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message to Maya..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-gold/50 transition"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gold text-background font-bold text-xs hover:brightness-110 transition disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                  <button
                    onClick={endCall}
                    className="px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition"
                  >
                    <PhoneOff size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      disabled={loading}
                      className="text-[10px] px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {callState === "ended" && (
              <div className="text-center space-y-3">
                <p className="text-[10px] text-white/40">
                  Conversation ended. Any details shared are captured below.
                </p>
                <button
                  onClick={() => { setCallState("idle"); setMessages([]); setCallTimer(0); }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gold/30 text-gold font-bold text-xs px-5 py-2.5 hover:bg-gold/10 transition"
                >
                  <Phone size={14} />
                  New Call
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Captured Lead Details */}
        <div className="lg:col-span-5 space-y-5">
          {demoLeads.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-background/50 backdrop-blur-md overflow-hidden">
              <div className="border-b border-emerald-500/20 px-5 py-3.5">
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <User size={14} />
                  Captured Leads
                </h3>
              </div>
              <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
                {demoLeads.map((lead) => (
                  <div key={lead.id} className="bg-white/5 rounded-xl p-3.5 border border-white/5 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {lead.name && (
                        <div>
                          <p className="text-[8px] text-white/30 uppercase tracking-wider">Name</p>
                          <p className="text-xs font-bold text-white">{lead.name}</p>
                        </div>
                      )}
                      {lead.phone && (
                        <div>
                          <p className="text-[8px] text-white/30 uppercase tracking-wider">Phone</p>
                          <p className="text-xs font-bold text-white">{lead.phone}</p>
                        </div>
                      )}
                      {lead.company && (
                        <div>
                          <p className="text-[8px] text-white/30 uppercase tracking-wider">Company</p>
                          <p className="text-xs font-bold text-white">{lead.company}</p>
                        </div>
                      )}
                      {lead.interest && (
                        <div>
                          <p className="text-[8px] text-white/30 uppercase tracking-wider">Interest</p>
                          <p className="text-xs font-bold text-gold">{lead.interest}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-white/20 flex items-center gap-1">
                      <Clock size={9} />
                      {new Date(lead.capturedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maya Info Card */}
          <div className="rounded-2xl border border-gold/10 bg-gradient-to-br from-gold/5 to-background/50 backdrop-blur-md p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                <Bot size={18} className="text-gold" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Maya AI Voice Agent</h4>
                <p className="text-[9px] text-white/40">Powered by Digihood Studio</p>
              </div>
            </div>
            <ul className="space-y-2">
              {[
                "Natural human-like conversation",
                "Answers any question about our services",
                "Intelligent lead qualification",
                "24/7 availability",
                "CRM integration ready",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-[10px] text-white/60">
                  <ChevronRight size={10} className="text-gold flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
