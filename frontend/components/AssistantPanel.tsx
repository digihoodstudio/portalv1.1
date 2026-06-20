"use client";
/* eslint-disable no-undef, no-unused-vars */

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
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */
interface Message {
  role: "assistant" | "user";
  text: string;
  id: string;
}

type CallStatus = "idle" | "connecting" | "active";

/* ── Animated waveform bar ─────────────────────────────── */
function WaveBar({ active, delay }: { active: boolean; delay: number }) {
  return (
    <motion.div
      className="w-0.5 rounded-full bg-gold"
      animate={
        active
          ? { height: ["4px", "20px", "8px", "16px", "4px"] }
          : { height: "4px" }
      }
      transition={
        active
          ? { duration: 1.0, delay, repeat: Infinity, ease: "easeInOut" }
          : {}
      }
    />
  );
}

const SESSION_ID = `session-${Date.now()}`;
const INITIAL: Message = {
  role: "assistant",
  text: "Hello! I'm your AI assistant from Digihood Studio. I can help you with pricing, services, booking a consultation, or answering any questions about our AI receptionist and automation platform. How can I help you today?",
  id: "init",
};

export default function AssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Vapi voice state
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [vapiError, setVapiError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const vapiRef = useRef<Vapi | null>(null);

  /* ── Initialize Vapi once ────────────────────────────── */
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      console.warn("Vapi public key not set");
      return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setCallStatus("active");
      setVapiError("");
    });

    vapi.on("call-end", () => {
      setCallStatus("idle");
      setVolumeLevel(0);
      setIsMuted(false);
    });

    vapi.on("volume-level", (level: number) => {
      setVolumeLevel(level);
    });

    // Show live transcript in the chat as messages come in
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        const role = msg.role === "user" ? "user" : "assistant";
        setMessages((prev) => [
          ...prev,
          {
            role,
            text: msg.transcript,
            id: `${role[0]}-${Date.now()}-${Math.random()}`,
          },
        ]);
      }
    });

    vapi.on("error", (err: any) => {
      console.error("Vapi error:", err);
      setVapiError("Voice call error. Please try again.");
      setCallStatus("idle");
    });

    return () => {
      vapi.stop();
    };
  }, []);

  /* ── Auto-scroll ──────────────────────────────────────── */
  useEffect(() => {
    if (messages.length > 1 || loading) {
      const el = bottomRef.current;
      if (el) {
        const parent = el.parentElement;
        if (parent) {
          parent.scrollTop = parent.scrollHeight;
        }
      }
    }
  }, [messages, loading]);

  /* ── Vapi: start / stop call ─────────────────────────── */
  const toggleVoiceCall = useCallback(async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) {
      setVapiError("Voice assistant not configured.");
      return;
    }
    if (!vapiRef.current) return;

    if (callStatus === "idle") {
      setCallStatus("connecting");
      setVapiError("");
      try {
        await vapiRef.current.start(assistantId);
      } catch (err) {
        console.error(err);
        setVapiError("Couldn't start voice call.");
        setCallStatus("idle");
      }
    } else {
      vapiRef.current.stop();
    }
  }, [callStatus]);

  /* ── Vapi: mute toggle ───────────────────────────────── */
  const toggleMute = useCallback(() => {
    if (!vapiRef.current || callStatus !== "active") return;
    const newMuted = !isMuted;
    vapiRef.current.setMuted(newMuted);
    setIsMuted(newMuted);
  }, [isMuted, callStatus]);

  /* ── Text chat ───────────────────────────────────────── */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const userMsg: Message = {
        role: "user",
        text: text.trim(),
        id: `u-${Date.now()}`,
      };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chatbot/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: SESSION_ID,
            messages: next.map((m) => ({ role: m.role, text: m.text })),
          }),
        });
        const data = await res.json();
        const reply =
          data.answer ?? "I'm here to help — could you rephrase that?";
        const assistantMsg: Message = {
          role: "assistant",
          text: reply,
          id: `a-${Date.now()}`,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: Message = {
          role: "assistant",
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          id: `err-${Date.now()}`,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading],
  );

  /* ── Reset ───────────────────────────────────────────── */
  const resetChat = () => {
    vapiRef.current?.stop();
    setMessages([INITIAL]);
    setInput("");
    setCallStatus("idle");
    setVapiError("");
  };

  const quickPrompts = [
    "What are your pricing plans?",
    "How does missed call recovery work?",
    "Book a demo for me",
    "What's your ROI guarantee?",
  ];

  const isOnCall = callStatus === "active";
  const isConnecting = callStatus === "connecting";

  return (
    <section
      id="assistant"
      className="scroll-mt-28 mt-24 rounded-[32px] border border-white/10 bg-glass shadow-glow overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold">
            AI Assistant
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
            Talk to our AI growth specialist.
          </h2>
          <p className="mt-1.5 text-sm text-foreground/70">
            Ask about pricing, services, guarantees, or book a demo strategy
            call.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleVoiceCall}
            disabled={isConnecting}
            title={isOnCall ? "End voice call" : "Start AI voice call"}
            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-300 disabled:opacity-60 ${
              isOnCall
                ? "border-red-500/30 bg-red-950/20 text-red-300 hover:bg-red-950/30"
                : isConnecting
                  ? "border-yellow-500/30 bg-yellow-950/20 text-yellow-300"
                  : "border-gold/20 bg-gold/5 text-gold hover:bg-gold/10 hover:shadow-[0_0_16px_rgba(207,199,186,0.15)]"
            }`}
          >
            {isOnCall ? <PhoneOff size={14} /> : <Mic size={14} />}
            <span>
              {isConnecting ? "Connecting…" : isOnCall ? "End Call" : "Voice"}
            </span>
          </button>

          {/* Mute (only while on call) */}
          {isOnCall && (
            <button
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
              className={`rounded-full border px-3 py-2.5 text-sm transition-all duration-300 ${
                isMuted
                  ? "border-white/5 bg-white/3 text-white/30"
                  : "border-white/10 bg-white/5 text-foreground hover:bg-white/10"
              }`}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}

          <button
            onClick={resetChat}
            title="Reset conversation"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground transition hover:bg-white/10"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full bg-[#06101f]/30">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[360px] max-h-[460px]">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    msg.role === "assistant"
                      ? "bg-gold/10 text-gold"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={15} />
                  ) : (
                    <User size={15} />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-[#08122e] border border-white/8 text-foreground/90 rounded-tl-sm"
                      : "bg-gold/10 border border-gold/20 text-white rounded-tr-sm"
                  }`}
                >
                  {msg.text.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                  <Bot size={15} />
                </div>
                <div className="bg-[#08122e] border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-gold/60"
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.1, 0.8],
                      }}
                      transition={{ duration: 0.9, delay: d, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Vapi call status bar + waveform */}
        <AnimatePresence>
          {(isOnCall || isConnecting || vapiError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 bg-[#030816]/60 px-6 py-3.5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                      isOnCall ? "bg-emerald-400" : "bg-gold/60"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      isOnCall ? "bg-emerald-400" : "bg-gold"
                    }`}
                  />
                </span>
                <p className="text-xs text-white/70 font-mono">
                  {vapiError
                    ? vapiError
                    : isConnecting
                      ? "Connecting to AI specialist…"
                      : isMuted
                        ? "You are muted"
                        : "Live voice call active — speak naturally"}
                </p>
              </div>
              <div className="flex h-5 items-end justify-end gap-0.5 flex-shrink-0">
                {Array.from({ length: 18 }).map((_, i) => (
                  <WaveBar
                    key={i}
                    active={isOnCall && volumeLevel > 0.01}
                    delay={i * 0.04}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick prompts */}
        <div className="border-t border-white/5 px-6 pt-4 flex flex-wrap gap-2">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={loading || isOnCall}
              className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-foreground/80 transition-all duration-200 hover:border-gold/30 hover:bg-gold/5 hover:text-gold disabled:opacity-40"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-6">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage(input);
              }}
              placeholder={
                isOnCall
                  ? "Voice call active — just speak"
                  : "Ask our AI specialist a question…"
              }
              disabled={loading || isOnCall}
              className="flex-1 rounded-2xl border border-white/10 bg-[#0c1433]/80 px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim() || isOnCall}
              className="inline-flex items-center justify-center rounded-2xl bg-gold px-5 py-3.5 text-background font-bold transition hover:brightness-105 hover:shadow-[0_0_20px_rgba(207,199,186,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="mt-3 text-center text-3xs uppercase tracking-widest text-white/30">
            Trained AI Specialist. Prepared on services, pricing structure, and
            platform guarantees.
          </p>
        </div>
      </div>
    </section>
  );
}
