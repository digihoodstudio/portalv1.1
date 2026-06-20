"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Loader2,
  Bot,
  Volume2,
} from "lucide-react";
import Vapi from "@vapi-ai/web";

interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export default function VoiceAIDemo() {
  const [vapi, setVapi] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<
    "idle" | "connecting" | "active" | "ending"
  >("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const callStartRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Vapi
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      setErrorMsg("Voice AI not configured. Please contact support.");
      return;
    }

    const vapiInstance = new Vapi(publicKey);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on("call-start", () => {
      setCallStatus("active");
      callStartRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        if (callStartRef.current) {
          setCallDuration(
            Math.floor((Date.now() - callStartRef.current) / 1000),
          );
        }
      }, 1000);
    });

    vapiInstance.on("call-end", async () => {
      setCallStatus("idle");
      setIsSpeaking(false);
      if (durationIntervalRef.current)
        clearInterval(durationIntervalRef.current);

      // Save lead to Supabase
      try {
        await fetch("/api/voice-demo/save-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            duration_seconds: callDuration,
          }),
        });
      } catch (err) {
        console.error("Failed to save lead:", err);
      }
    });

    vapiInstance.on("speech-start", () => setIsSpeaking(true));
    vapiInstance.on("speech-end", () => setIsSpeaking(false));

    vapiInstance.on("volume-level", (level: number) => {
      setVolumeLevel(level);
    });

    vapiInstance.on("message", (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role === "assistant" ? "assistant" : "user",
            text: message.transcript,
            timestamp: Date.now(),
          },
        ]);
      }
    });

    vapiInstance.on("error", (error: any) => {
      console.error("Vapi error:", error);
      setErrorMsg(error?.errorMsg || "Connection error. Please try again.");
      setCallStatus("idle");
    });

    return () => {
      if (durationIntervalRef.current)
        clearInterval(durationIntervalRef.current);
      vapiInstance.stop();
    };
  }, []);

  const startCall = async () => {
    if (!vapi) return;

    setCallStatus("connecting");
    setErrorMsg("");
    setTranscript([]);
    setCallDuration(0);

    try {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      if (!assistantId) {
        throw new Error("Assistant not configured");
      }
      await vapi.start(assistantId);
    } catch (err: any) {
      console.error("Failed to start call:", err);
      setErrorMsg(
        err?.message || "Failed to start call. Check mic permissions.",
      );
      setCallStatus("idle");
    }
  };

  const endCall = () => {
    if (!vapi) return;
    setCallStatus("ending");
    vapi.stop();
  };

  const toggleMute = () => {
    if (!vapi) return;
    const newMutedState = !isMuted;
    vapi.setMuted(newMutedState);
    setIsMuted(newMutedState);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl p-8 shadow-2xl overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl transition-all duration-1000 ${
            callStatus === "active"
              ? isSpeaking
                ? "bg-purple-500/20 scale-110"
                : "bg-gold/15 scale-100"
              : "bg-gold/5"
          }`}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center">
              <Bot size={22} className="text-background" />
            </div>
            {callStatus === "active" && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Maya</h3>
            <p className="text-[11px] text-white/50 font-semibold">
              {callStatus === "idle" && "AI Growth Specialist"}
              {callStatus === "connecting" && "Connecting..."}
              {callStatus === "active" &&
                (isSpeaking ? "Speaking..." : "Listening...")}
              {callStatus === "ending" && "Ending call..."}
            </p>
          </div>
        </div>

        {callStatus === "active" && (
          <div className="text-right">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
              Duration
            </p>
            <p className="text-sm font-mono font-bold text-gold">
              {formatDuration(callDuration)}
            </p>
          </div>
        )}
      </div>

      {/* Main Voice UI */}
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        {/* Voice Visualizer */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Pulsing rings */}
          {callStatus === "active" && (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gold/20"
              />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 rounded-full bg-gold/15"
              />
            </>
          )}

          {/* Volume-reactive ring */}
          <motion.div
            animate={{
              scale: 1 + volumeLevel * 0.5,
            }}
            transition={{ duration: 0.1 }}
            className="absolute inset-4 rounded-full bg-gradient-to-br from-gold/40 to-amber-600/40 blur-md"
          />

          {/* Main button */}
          <button
            onClick={callStatus === "idle" ? startCall : endCall}
            disabled={callStatus === "connecting" || callStatus === "ending"}
            className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              callStatus === "idle"
                ? "bg-gradient-to-br from-gold to-amber-600 hover:scale-105 active:scale-95"
                : callStatus === "active"
                  ? "bg-gradient-to-br from-red-500 to-red-700 hover:scale-105 active:scale-95"
                  : "bg-white/10 cursor-not-allowed"
            }`}
          >
            {callStatus === "idle" && (
              <Phone size={42} className="text-background" />
            )}
            {callStatus === "connecting" && (
              <Loader2 size={42} className="text-white animate-spin" />
            )}
            {callStatus === "active" && (
              <PhoneOff size={42} className="text-white" />
            )}
            {callStatus === "ending" && (
              <Loader2 size={42} className="text-white animate-spin" />
            )}
          </button>
        </div>

        {/* Status text */}
        <div className="text-center space-y-2 max-w-md">
          {callStatus === "idle" && (
            <>
              <p className="text-base font-bold text-white">
                Talk to Maya, our AI specialist
              </p>
              <p className="text-xs text-white/50">
                Ask about our services, pricing, or book a demo.
                <br />
                Speaks English & Nepali fluently.
              </p>
            </>
          )}
          {callStatus === "connecting" && (
            <p className="text-sm text-white/70 animate-pulse">
              Connecting to Maya...
            </p>
          )}
          {callStatus === "active" && (
            <div className="flex items-center justify-center gap-2 text-xs text-white/60">
              <Volume2 size={12} className={isSpeaking ? "text-gold" : ""} />
              <span>
                {isSpeaking ? "Maya is speaking" : "Maya is listening..."}
              </span>
            </div>
          )}
        </div>

        {/* Controls when active */}
        {callStatus === "active" && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full border transition-all ${
                isMuted
                  ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {callStatus === "active" && transcript.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-4 max-h-48 overflow-y-auto space-y-2">
          <p className="text-[9px] uppercase font-bold text-white/40 tracking-widest mb-2">
            Live Transcript
          </p>
          {transcript.slice(-5).map((msg, i) => (
            <div key={i} className="text-xs leading-relaxed">
              <span
                className={`font-bold ${msg.role === "assistant" ? "text-gold" : "text-white/80"}`}
              >
                {msg.role === "assistant" ? "Maya" : "You"}:
              </span>{" "}
              <span className="text-white/70">{msg.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 rounded-xl border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-300 text-center"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
        <span className="font-bold uppercase tracking-wider">
          Powered by Vapi AI
        </span>
        <span className="font-mono">
          {callStatus === "idle"
            ? "⚪ Ready"
            : callStatus === "active"
              ? "🟢 Live"
              : "🟡 Connecting"}
        </span>
      </div>
    </div>
  );
}
