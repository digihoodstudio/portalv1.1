"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  const voiceTranscriptsRef = useRef<{ role: string; text: string }[]>([]);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.warn("Vapi public key not set");
      return;
    }
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => { setCallStatus("active"); setVapiError(""); voiceTranscriptsRef.current = []; });
    vapi.on("call-end", async () => {
      setCallStatus("idle"); setVolumeLevel(0); setIsMuted(false);
      const transcripts = voiceTranscriptsRef.current;
      if (transcripts.length > 0) {
        try {
          await fetch("/api/chatbot/voice-log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: SESSION_ID, messages: transcripts }),
          });
        } catch { /* silently log best-effort */ }
      }
    });
    vapi.on("volume-level", (level: number) => setVolumeLevel(level));
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        const role = msg.role === "user" ? "user" : "assistant";
        setMessages((prev) => [...prev, { role, text: msg.transcript, id: `${role[0]}-${Date.now()}-${Math.random()}` }]);
        voiceTranscriptsRef.current.push({ role, text: msg.transcript });
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
    <section id="assistant" className="scroll-mt-28 rounded-[24px] border border-white/[0.06] bg-surface overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-white/10 p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">AI Assistant</p>
        <h2 className="text-2xl font-semibold text-heading md:text-3xl">Talk to our AI growth specialist.</h2>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {/* ── Left: Chatbot ── */}
        <div className="flex flex-col dark:bg-[#06101f]/30 bg-background min-h-[400px] md:min-h-[520px]">
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <MessageCircle size={15} className="text-gold" />
              <span className="text-xs uppercase tracking-[0.2em] text-heading/50 font-semibold">Live Chat</span>
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
                  <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${msg.role === "assistant" ? "bg-gold/10 text-gold" : "bg-white/10 text-heading"}`}>
                    {msg.role === "assistant" ? <Bot size={13} /> : <User size={13} />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.role === "assistant" ? "bg-surface border border-white/8 text-foreground/90 rounded-tl-sm" : "bg-gold/10 border border-gold/20 text-heading rounded-tr-sm"}`}>
                    {msg.text.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1.5" : ""}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0"><Bot size={13} /></div>
                  <div className="bg-surface border border-white/8 rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1">
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
                className="flex-1 rounded-xl border border-white/10 bg-surface px-3.5 py-2.5 text-xs text-heading placeholder-white/25 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition disabled:opacity-50"
              />
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim() || isOnCall}
                className="inline-flex items-center justify-center rounded-xl bg-gold px-4 py-2.5 text-background font-bold transition hover:brightness-105 hover:shadow-[0_0_16px_rgba(207,199,186,0.2)] disabled:opacity-40"
              ><Send size={13} /></button>
            </div>
          </div>
        </div>

        {/* ── Right: Voice AI — Phone UI ── */}
        <div className="flex flex-col items-center justify-center p-4 md:p-6 dark:bg-[#1E1E1E]/40 bg-surface-elevated min-h-[320px] md:min-h-[520px]">
          {/* Phone frame */}
          <div className="relative w-full max-w-[240px] aspect-[9/19] rounded-[32px] border-2 border-white/15 bg-black shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[26px] bg-black rounded-b-[14px] z-10 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700" />
              <div className="w-5 h-1.5 rounded-full bg-zinc-900" />
            </div>

            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-1 text-[8px] text-heading/40 font-mono">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-1.5 rounded-sm border border-white/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/30 rounded-sm" style={{ width: '60%' }} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
              <AnimatePresence mode="wait">
                {/* IDLE STATE */}
                {!isConnecting && !isOnCall && (
                  <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-4 w-full">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center overflow-hidden">
                      <Image src="/digilogo.png" alt="Maya" width={64} height={64} className="object-cover w-full h-full" />
                    </motion.div>
                    <p className="text-xs text-heading/40 font-mono text-center leading-relaxed">
                      Tap to call<br />Maya
                    </p>
                    <motion.button onClick={toggleVoiceCall} whileTap={{ scale: 0.95 }}
                      className="w-full rounded-full bg-gold hover:brightness-110 py-3 text-xs font-bold text-background transition"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Phone size={13} />
                        <span>Call Maya</span>
                      </div>
                    </motion.button>
                  </motion.div>
                )}

                {/* CONNECTING STATE */}
                {isConnecting && (
                  <motion.div key="connecting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-4 w-full">
                    <div className="relative">
                      <motion.div
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/30 flex items-center justify-center overflow-hidden"
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Image src="/digilogo.png" alt="Maya" width={80} height={80} className="object-cover w-full h-full" />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-gold/40"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border border-gold/20"
                        animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 1.2, delay: 0.2, repeat: Infinity, ease: "easeOut" }}
                      />
                    </div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xs text-heading/60 font-mono">Connecting…</motion.p>
                  </motion.div>
                )}

                {/* ACTIVE CALL STATE */}
                {isOnCall && (
                  <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="flex flex-col items-center gap-3 w-full">
                    {/* Caller avatar */}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 12 }}>
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center overflow-hidden">
                          <Image src="/digilogo.png" alt="Maya" width={64} height={64} className="object-cover w-full h-full" />
                        </div>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        </motion.div>
                      </div>
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm font-bold text-heading">Maya AI</motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-[10px] text-heading/40 font-mono">
                      {isMuted ? "Muted" : "Connected"}
                    </motion.p>

                    {/* Sound wave visualization */}
                    <div className="flex items-end justify-center gap-[3px] h-6 my-1">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div key={i} className="w-[2px] rounded-full bg-gold/60"
                          animate={{ height: volumeLevel > 0.01 ? [`${3 + Math.random() * 8}px`, `${8 + volumeLevel * 30}px`, `${3 + Math.random() * 8}px`] : ["4px", "4px", "4px"] }}
                          transition={{ duration: 0.5, delay: i * 0.04, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ))}
                    </div>

                    {/* In-call controls grid */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="grid grid-cols-3 gap-3 w-full mt-1">
                      <motion.button onClick={toggleMute} whileTap={{ scale: 0.9 }}
                        className={`flex flex-col items-center gap-1 rounded-2xl py-2.5 transition ${isMuted ? "bg-gold/20 border border-gold/30" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
                      >
                        {isMuted ? <MicOff size={14} className="text-gold" /> : <Mic size={14} className="text-heading/60" />}
                        <span className="text-[7px] font-bold text-heading/40 uppercase tracking-wider">{isMuted ? "Muted" : "Mute"}</span>
                      </motion.button>
                      <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 border border-white/10 py-2.5">
                        <Volume2 size={14} className="text-heading/60" />
                        <span className="text-[7px] font-bold text-heading/40 uppercase tracking-wider">Speaker</span>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 border border-white/10 py-2.5">
                        <Headphones size={14} className="text-heading/60" />
                        <span className="text-[7px] font-bold text-heading/40 uppercase tracking-wider">Audio</span>
                      </motion.div>
                    </motion.div>

                    {/* End call button */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      <motion.button onClick={toggleVoiceCall} whileTap={{ scale: 0.9 }}
                        className="mt-1 w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition shadow-lg"
                      >
                        <PhoneOff size={18} className="text-heading" />
                      </motion.button>
                      <p className="text-[8px] text-heading/30 font-mono text-center mt-1">Tap to end</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[120px] h-[4px] rounded-full bg-white/20" />
          </div>

          {/* Label below phone */}
          <div className="flex items-center gap-2 mt-3">
            <Headphones size={12} className="text-gold" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-heading/40 font-semibold">Voice AI</span>
          </div>
          {vapiError && <p className="mt-2 text-xs text-red-400/80">{vapiError}</p>}
        </div>
      </div>
    </section>
  );
}
