"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Headphones, X } from "lucide-react";
import Image from "next/image";
import Vapi from "@vapi-ai/web";

type CallStatus = "idle" | "connecting" | "active";

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [vapiError, setVapiError] = useState("");
  const [showNotification, setShowNotification] = useState(true);

  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) return;
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => { setCallStatus("active"); setVapiError(""); });
    vapi.on("call-end", () => { setCallStatus("idle"); setVolumeLevel(0); setIsMuted(false); });
    vapi.on("volume-level", (level: number) => setVolumeLevel(level));
    vapi.on("error", () => { setVapiError("Voice call error. Please try again."); setCallStatus("idle"); });

    return () => { vapi.stop(); };
  }, []);

  useEffect(() => {
    if (isOpen) setShowNotification(false);
  }, [isOpen]);

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

  const handleClose = () => {
    if (callStatus === "active" || callStatus === "connecting") {
      vapiRef.current?.stop();
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-3 w-[280px] overflow-hidden rounded-[24px] border border-white/10 bg-background/95 shadow-glow backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-gold/5 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 overflow-hidden">
                  <Image src="/digilogo.png" alt="Maya" width={32} height={32} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-wide text-white">
                    Maya AI
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`h-1 w-1 rounded-full ${callStatus === "active" ? "bg-emerald-500 animate-pulse" : "bg-white/30"} ${callStatus === "connecting" ? "bg-amber-500 animate-pulse" : ""}`} />
                    <span className="text-[9px] text-white/50 font-medium font-mono uppercase">
                      {callStatus === "active" ? "Connected" : callStatus === "connecting" ? "Connecting..." : "Voice AI"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-1 text-white/50 hover:bg-white/5 hover:text-white transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col items-center justify-center p-6 min-h-[280px]">
              <AnimatePresence mode="wait">
                {/* IDLE STATE */}
                {callStatus === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-4 w-full">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center overflow-hidden">
                      <Image src="/digilogo.png" alt="Maya" width={64} height={64} className="object-cover w-full h-full" />
                    </motion.div>
                    <p className="text-xs text-white/40 font-mono text-center leading-relaxed">
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
                    {vapiError && <p className="text-xs text-red-400/80 text-center">{vapiError}</p>}
                  </motion.div>
                )}

                {/* CONNECTING STATE */}
                {callStatus === "connecting" && (
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
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xs text-white/60 font-mono">Connecting…</motion.p>
                  </motion.div>
                )}

                {/* ACTIVE CALL STATE */}
                {callStatus === "active" && (
                  <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="flex flex-col items-center gap-3 w-full">
                    {/* Caller avatar */}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 12 }}>
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center overflow-hidden">
                          <Image src="/digilogo.png" alt="Maya" width={64} height={64} className="object-cover w-full h-full" />
                        </div>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        </motion.div>
                      </div>
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm font-bold text-white">Maya AI</motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-[10px] text-white/40 font-mono">
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

                    {/* In-call controls */}
                    <div className="flex items-center justify-center gap-3 w-full mt-1">
                      <motion.button onClick={toggleMute} whileTap={{ scale: 0.9 }}
                        className={`flex flex-col items-center gap-1 rounded-2xl py-2.5 px-4 transition ${isMuted ? "bg-gold/20 border border-gold/30" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
                      >
                        {isMuted ? <MicOff size={14} className="text-gold" /> : <Mic size={14} className="text-white/60" />}
                        <span className="text-[7px] font-bold text-white/40 uppercase tracking-wider">{isMuted ? "Muted" : "Mute"}</span>
                      </motion.button>
                      <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 border border-white/10 py-2.5 px-4">
                        <Volume2 size={14} className="text-white/60" />
                        <span className="text-[7px] font-bold text-white/40 uppercase tracking-wider">Speaker</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 border border-white/10 py-2.5 px-4">
                        <Headphones size={14} className="text-white/60" />
                        <span className="text-[7px] font-bold text-white/40 uppercase tracking-wider">Audio</span>
                      </div>
                    </div>

                    {/* End call button */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      <motion.button onClick={toggleVoiceCall} whileTap={{ scale: 0.9 }}
                        className="mt-1 w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition shadow-lg"
                      >
                        <PhoneOff size={18} className="text-white" />
                      </motion.button>
                      <p className="text-[8px] text-white/30 font-mono text-center mt-1">Tap to end</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gold text-background shadow-glow hover:scale-[1.05] transition-transform duration-300 group"
        aria-label="Call Maya"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="call"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Phone size={20} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing Notification Ring */}
        {showNotification && !isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
          </span>
        )}
      </button>
    </div>
  );
}
