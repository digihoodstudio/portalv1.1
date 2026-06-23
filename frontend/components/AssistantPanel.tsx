"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Vapi from "@vapi-ai/web";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  User,
  PhoneOff,
  Phone,
  Headphones,
  MessageCircle,
  Sparkles,
  Clock,
  Brain,
  BarChart3,
} from "lucide-react";

interface Message {
  role: "assistant" | "user";
  text: string;
  id: string;
}

type CallStatus = "idle" | "connecting" | "active";

const SESSION_ID = `session-${Date.now()}`;
const INITIAL: Message = {
  role: "assistant",
  text: "Hello! I'm your AI assistant from Digihood Studio. I can help you with pricing, services, booking a consultation, or answering any questions about our AI receptionist and automation platform. How can I help you today?",
  id: "init",
};

const voiceFeatures = [
  { icon: Headphones, text: "24/7 AI call answering" },
  { icon: Brain, text: "Natural conversation AI" },
  { icon: Clock, text: "Answers in under 10 seconds" },
  { icon: BarChart3, text: "Smart lead qualification" },
];

export default function AssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [vapiError, setVapiError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.warn("Vapi public key not set");
      return;
    }
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => { setCallStatus("active"); setVapiError(""); });
    vapi.on("call-end", () => { setCallStatus("idle"); setVolumeLevel(0); setIsMuted(false); });
    vapi.on("volume-level", (level: number) => setVolumeLevel(level));
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        const role = msg.role === "user" ? "user" : "assistant";
        setMessages((prev) => [...prev, { role, text: msg.transcript, id: `${role[0]}-${Date.now()}-${Math.random()}` }]);
      }
    });
    vapi.on("error", (err: any) => { console.error("Vapi error:", err); setVapiError("Voice call error. Please try again."); setCallStatus("idle"); });

    return () => { vapi.stop(); };
  }, []);

  useEffect(() => {
    if (messages.length > 1 || loading) {
      const el = bottomRef.current;
      if (el) {
        const parent = el.parentElement;
        if (parent) parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [messages, loading]);

  const toggleVoiceCall = useCallback(async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) { setVapiError("Voice assistant not configured."); return; }
    if (!vapiRef.current) return;
    if (callStatus === "idle") {
      setCallStatus("connecting"); setVapiError("");
      try { await vapiRef.current.start(assistantId); }
      catch { setVapiError("Couldn't start voice call."); setCallStatus("idle"); }
    } else { vapiRef.current.stop(); }
  }, [callStatus]);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current || callStatus !== "active") return;
    const newMuted = !isMuted;
    vapiRef.current.setMuted(newMuted);
    setIsMuted(newMuted);
  }, [isMuted, callStatus]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text: text.trim(), id: `u-${Date.now()}` };
    const next = [...messages, userMsg];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chatbot/conversation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: SESSION_ID, messages: next.map((m) => ({ role: m.role, text: m.text })) }),
      });
      const data = await res.json();
      const reply = data.answer ?? "I'm here to help — could you rephrase that?";
      setMessages((prev) => [...prev, { role: "assistant", text: reply, id: `a-${Date.now()}` }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.", id: `err-${Date.now()}` }]);
    } finally { setLoading(false); }
  }, [messages, loading]);

  const resetChat = () => { vapiRef.current?.stop(); setMessages([INITIAL]); setInput(""); setCallStatus("idle"); setVapiError(""); };

  const quickPrompts = ["What are your pricing plans?", "How does missed call recovery work?", "Book a demo for me", "What's your ROI guarantee?"];
  const isOnCall = callStatus === "active";
  const isConnecting = callStatus === "connecting";

  return (
    <section id="assistant" className="scroll-mt-28 rounded-[32px] border border-white/10 bg-glass-deep shadow-glow-lg overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-white/10 p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">AI Assistant</p>
        <h2 className="text-2xl font-semibold text-white md:text-3xl">Talk to our AI growth specialist.</h2>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {/* ── Left: Chatbot ── */}
        <div className="flex flex-col bg-[#06101f]/30 min-h-[520px]">
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <MessageCircle size={15} className="text-gold" />
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">Live Chat</span>
            </div>
            <button onClick={resetChat} title="Reset" className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-foreground transition hover:bg-white/10">
              <RotateCcw size={12} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 space-y-3 min-h-[280px] max-h-[360px]">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${msg.role === "assistant" ? "bg-gold/10 text-gold" : "bg-white/10 text-white"}`}>
                    {msg.role === "assistant" ? <Bot size={13} /> : <User size={13} />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.role === "assistant" ? "bg-[#08122e] border border-white/8 text-foreground/90 rounded-tl-sm" : "bg-gold/10 border border-gold/20 text-white rounded-tr-sm"}`}>
                    {msg.text.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1.5" : ""}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0"><Bot size={13} /></div>
                  <div className="bg-[#08122e] border border-white/8 rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-gold/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, delay: d, repeat: Infinity }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div className="px-6 pt-3 flex flex-wrap gap-1.5">
            {quickPrompts.map((p) => (
              <button key={p} onClick={() => sendMessage(p)} disabled={loading || isOnCall}
                className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] text-foreground/70 transition hover:border-gold/30 hover:bg-gold/5 hover:text-gold disabled:opacity-40"
              >{p}</button>
            ))}
          </div>

          <div className="p-4 pt-3">
            <div className="flex gap-2">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
                placeholder={isOnCall ? "Voice active — speak naturally" : "Ask a question…"}
                disabled={loading || isOnCall}
                className="flex-1 rounded-xl border border-white/10 bg-[#0c1433]/80 px-3.5 py-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition disabled:opacity-50"
              />
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim() || isOnCall}
                className="inline-flex items-center justify-center rounded-xl bg-gold px-4 py-2.5 text-background font-bold transition hover:brightness-105 hover:shadow-[0_0_16px_rgba(207,199,186,0.2)] disabled:opacity-40"
              ><Send size={13} /></button>
            </div>
          </div>
        </div>

        {/* ── Right: Voice Assistant ── */}
        <div className="flex flex-col items-center justify-center p-8 md:p-10 bg-[#030816]/40 min-h-[520px]">
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <Headphones size={15} className="text-gold" />
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">Voice AI</span>
            </div>

            {/* Avatar circle */}
            <div className={`relative mt-4 mb-6 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${isOnCall ? "bg-gradient-to-br from-gold/20 to-gold/5 shadow-[0_0_40px_rgba(207,199,186,0.15)]" : "bg-white/5 border border-white/10"}`}>
              {isOnCall ? (
                <>
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-gold/30" />
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex items-end justify-center gap-0.5 h-10">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div key={i} className="w-0.5 rounded-full bg-gold"
                          animate={volumeLevel > 0.01 ? { height: ["4px", `${8 + volumeLevel * 40}px`, "4px"] } : { height: "4px" }}
                          transition={{ duration: 0.6, delay: i * 0.05, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Phone className="h-10 w-10 text-white/30" />
              )}
            </div>

            {/* Status */}
            <div className="mb-6">
              {isConnecting ? (
                <p className="text-sm text-yellow-300/80 font-mono">Connecting to AI specialist…</p>
              ) : isOnCall ? (
                <p className="text-sm text-emerald-400/80 font-mono">{isMuted ? "You are muted" : "Live call active"}</p>
              ) : (
                <p className="text-sm text-foreground/60">Start a conversation naturally</p>
              )}
              {vapiError && <p className="mt-2 text-xs text-red-400/80">{vapiError}</p>}
            </div>

            {/* Voice call button */}
            <button onClick={toggleVoiceCall} disabled={isConnecting}
              className={`relative w-full max-w-[200px] flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60 ${
                isOnCall
                  ? "bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-950/40"
                  : "bg-gold/10 border border-gold/20 text-gold hover:bg-gold/15 hover:shadow-[0_0_24px_rgba(207,199,186,0.12)]"
              }`}
            >
              {isOnCall ? <PhoneOff size={15} /> : <Mic size={15} />}
              <span>{isConnecting ? "Connecting…" : isOnCall ? "End Call" : "Start Voice Call"}</span>
            </button>

            {/* Mute button (on call) */}
            {isOnCall && (
              <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}
                className="mt-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-foreground/70 transition hover:bg-white/10"
              >{isMuted ? <VolumeX size={13} className="inline mr-1.5" /> : <Volume2 size={13} className="inline mr-1.5" />}
                {isMuted ? "Unmute" : "Mute"}
              </button>
            )}

            {/* Features */}
            <div className="mt-8 w-full pt-6 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-3">Voice AI Capabilities</p>
              <div className="space-y-2.5">
                {voiceFeatures.map((feat) => (
                  <div key={feat.text} className="flex items-center gap-2.5">
                    <feat.icon size={12} className="text-gold/70 flex-shrink-0" />
                    <span className="text-[11px] text-foreground/60">{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
