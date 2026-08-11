"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import Vapi from "@vapi-ai/web";

const DT_HOUSING_ASSISTANT_ID = "6052bcc5-7de9-4932-8fad-dc0683ebb52d";

type CallStatus = "idle" | "connecting" | "active";

interface TranscriptLine {
  role: "user" | "assistant";
  text: string;
  id: string;
}

export default function DTHousingPage() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [vapiError, setVapiError] = useState("");
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);

  const vapiRef = useRef<Vapi | null>(null);
  const transcriptsRef = useRef<TranscriptLine[]>([]);
  const transcriptBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_DTHOUSING_PUBLIC_KEY;
    console.log("[dthousing] using Vapi public key:", publicKey);
    if (!publicKey) {
      setVapiError("Downtown Housing Co Vapi public key is not configured.");
      return;
    }
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setCallStatus("active");
      setVapiError("");
      transcriptsRef.current = [];
      setTranscripts([]);
    });
    vapi.on("call-end", () => {
      setCallStatus("idle");
      setVolumeLevel(0);
      setIsMuted(false);
    });
    vapi.on("volume-level", (level: number) => setVolumeLevel(level));
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        const line = {
          role: msg.role === "user" ? "user" : "assistant" as "user" | "assistant",
          text: msg.transcript,
          id: `${msg.role[0]}-${Date.now()}-${Math.random()}`,
        };
        transcriptsRef.current.push(line);
        setTranscripts([...transcriptsRef.current]);
      }
    });
    vapi.on("error", (err: any) => {
      console.error("Vapi error:", err);
      const keyUsed = process.env.NEXT_PUBLIC_VAPI_DTHOUSING_PUBLIC_KEY;
      let detail = "Please try again.";
      try {
        detail = typeof err === "string" ? err : JSON.stringify(err);
      } catch {}
      setVapiError(`Voice call error: ${detail}\n\nPublic key in use: ${keyUsed}`);
      setCallStatus("idle");
    });

    return () => { vapi.stop(); };
  }, []);

  useEffect(() => {
    const box = transcriptBoxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [transcripts]);

  const initiateCall = async () => {
    if (!vapiRef.current) return;
    setCallStatus("connecting");
    setVapiError("");

    // Request mic permission up front so the browser prompt appears right away.
    let micStream: MediaStream | null = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.getTracks().forEach((t) => t.stop());
    } catch {
      setVapiError("Microphone access is required to make a call. Please allow microphone access and try again.");
      setCallStatus("idle");
      return;
    }

    try {
      // Create the call server-side (reliable), then join the room in the browser.
      const res = await fetch("/api/vapi/dthousing", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to start call.");
      }

      await vapiRef.current.stop();
      await vapiRef.current.reconnect({ id: data.callId, webCallUrl: data.webCallUrl });
    } catch (err: any) {
      console.error("Vapi start error:", err);
      let detail = "Please try again.";
      try {
        detail = typeof err === "string" ? err : (err?.message || JSON.stringify(err));
      } catch {}
      setVapiError(`Couldn't start voice call: ${detail}`);
      setCallStatus("idle");
    }
  };

  const endCall = () => {
    vapiRef.current?.stop();
    setCallStatus("idle");
    setVolumeLevel(0);
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (!vapiRef.current || callStatus !== "active") return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  };

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-24 sm:px-6 md:px-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gold/25 bg-white/5 p-2 shadow-glow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dtlogo.png" alt="Downtown Housing Co" className="h-full w-full object-contain" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Downtown Housing Co</p>
        <h1 className="mt-3 text-3xl font-bold text-heading md:text-4xl">
          AI Call Assistant
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/50">
          Talk to our AI assistant right from your browser. Hit the button below to start a live voice call.
        </p>
      </div>

      {/* Call Center */}
      <div className="flex w-full max-w-md flex-col items-center rounded-[32px] border border-white/10 bg-glass p-8 shadow-glow backdrop-blur-md md:p-10">
        <AnimatePresence mode="wait">
          {callStatus === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center"
            >
              <motion.button
                onClick={initiateCall}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex h-40 w-40 flex-col items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-600 text-background shadow-glow transition"
              >
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-gold/40"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <Phone size={34} className="mb-2 transition group-hover:rotate-12" />
                <span className="text-sm font-bold">Initiate Call</span>
              </motion.button>
              <p className="mt-6 text-center text-xs text-foreground/40">
                You'll need to allow microphone access to start the call.
              </p>
            </motion.div>
          )}

          {callStatus === "connecting" && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <motion.div
                  className="flex h-40 w-40 items-center justify-center rounded-full border border-gold/30 bg-gold/10"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Loader2 size={34} className="animate-spin text-gold" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-gold/40"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                />
              </div>
              <p className="mt-6 animate-pulse text-sm font-semibold text-gold">
                Connecting you to the assistant...
              </p>
            </motion.div>
          )}

          {callStatus === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col items-center"
            >
              {/* Live call status */}
              <div className="flex flex-col items-center">
                <motion.div
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold/25 to-gold/5 border border-gold/30"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Phone size={30} className="text-gold" />
                </motion.div>
                <p className="mt-4 text-sm font-bold text-heading">Downtown Housing Co Assistant</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Live
                  </span>
                  {isMuted && (
                    <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-semibold text-gold">
                      Muted
                    </span>
                  )}
                </div>
              </div>

              {/* Sound wave visualization */}
              <div className="my-6 flex h-8 items-end justify-center gap-[3px]">
                {Array.from({ length: 28 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-gold/60"
                    animate={{
                      height: volumeLevel > 0.01
                        ? [`${3 + Math.random() * 8}px`, `${8 + volumeLevel * 30}px`, `${3 + Math.random() * 8}px`]
                        : ["4px", "4px", "4px"],
                    }}
                    transition={{ duration: 0.5, delay: i * 0.04, repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
              </div>

              {/* Transcript */}
              <div ref={transcriptBoxRef} className="mb-6 max-h-40 w-full overflow-y-auto rounded-2xl border border-white/10 bg-background/50 p-4">
                {transcripts.length === 0 ? (
                  <p className="text-center text-xs text-foreground/40">
                    The live transcript will appear here...
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transcripts.map((line) => (
                      <div key={line.id} className={`flex ${line.role === "assistant" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                          line.role === "assistant"
                            ? "rounded-tl-none border border-gold/15 bg-gold/10 text-heading"
                            : "rounded-tr-none border border-white/10 bg-white/5 text-heading/90"
                        }`}>
                          <span className={`mb-1 block text-[8px] font-bold uppercase tracking-wider ${line.role === "assistant" ? "text-gold" : "text-purple-400"}`}>
                            {line.role === "assistant" ? "AI Assistant" : "You"}
                          </span>
                          {line.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* In-call controls */}
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={toggleMute}
                  whileTap={{ scale: 0.9 }}
                  className={`flex h-14 w-14 items-center justify-center rounded-full border transition ${
                    isMuted
                      ? "border-gold/40 bg-gold/20 text-gold"
                      : "border-white/10 bg-white/5 text-heading/60 hover:bg-white/10"
                  }`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </motion.button>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-heading/60"
                >
                  <Volume2 size={20} />
                </motion.div>
                <motion.button
                  onClick={endCall}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-500"
                >
                  <PhoneOff size={20} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {vapiError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 max-w-sm whitespace-pre-wrap break-words text-center text-xs text-red-400/80"
          >
            {vapiError}
          </motion.p>
        )}
      </div>

      <p className="mt-8 text-center text-[10px] text-foreground/30">
        Powered by Digihood Studio
      </p>
    </main>
  );
}
