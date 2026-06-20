"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import {
  Upload,
  Database,
  Activity,
  CheckCircle2,
  Clock,
  Volume2,
  Download,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  FileText,
  Bell,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  X,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  startDate?: string;
  estCompletion?: string;
  actualCompletion?: string;
  agent?: { name: string };
  leads?: any[];
  uploadedFiles?: any[];
}

export default function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);

  // CSV Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Voice Agent Test Form
  const [testPhone, setTestPhone] = useState("");
  const [testScenario, setTestScenario] = useState("");
  const [testVoice, setTestVoice] = useState("Female Professional");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [chartHover, setChartHover] = useState<string | null>(null);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const voiceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        voiceDropdownRef.current &&
        !voiceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVoiceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch total leads count from Supabase
  const fetchLeadsCount = async () => {
    try {
      const res = await fetch("/api/leads/count");
      if (res.ok) {
        const data = await res.json();
        setTotalLeadsCount(data.count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch leads count:", err);
    }
  };

  useEffect(() => {
    fetchLeadsCount();
    setActivities([
      {
        id: "a-1",
        action: "Account Activated",
        details: "Client portal online.",
        createdAt: new Date(Date.now() - 3600000),
      },
    ]);
  }, []);

  // Handle file selection (from button click or drag drop)
  const handleFileSelect = (file: File) => {
    setUploadError("");
    setUploadSuccess("");
    setUploadStatus("");

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadError("Please select a CSV file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setUploadStatus(`Parsing ${file.name}...`);

    // Parse the CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setUploadError(`CSV parse error: ${results.errors[0].message}`);
          setSelectedFile(null);
          return;
        }

        const validRows = results.data.filter((row: any) => {
          // Must have at least name or phone or email
          return (
            row.name ||
            row.Name ||
            row.phone ||
            row.Phone ||
            row.email ||
            row.Email
          );
        });

        if (validRows.length === 0) {
          setUploadError(
            "No valid rows found. CSV must have name, phone, or email columns.",
          );
          setSelectedFile(null);
          return;
        }

        setParsedLeads(validRows);
        setUploadStatus(
          `Ready to upload ${validRows.length} leads from ${file.name}`,
        );
      },
      error: (err) => {
        setUploadError(`Failed to parse CSV: ${err.message}`);
        setSelectedFile(null);
      },
    });
  };

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setParsedLeads([]);
    setUploadStatus("");
    setUploadError("");
    setUploadSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Upload to Supabase
  const handleUpload = async () => {
    if (!selectedFile || parsedLeads.length === 0) return;

    setIsUploading(true);
    setUploadStatus("Uploading leads to database...");
    setUploadError("");

    try {
      const res = await fetch("/api/leads/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: parsedLeads,
          fileName: selectedFile.name,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUploadSuccess(`✓ Successfully uploaded ${data.count} leads!`);
        setUploadStatus("");
        clearFile();
        fetchLeadsCount(); // Refresh count

        // Add activity
        setActivities((prev) => [
          {
            id: `a-${Date.now()}`,
            action: "CSV Upload",
            details: `Imported ${data.count} leads from ${selectedFile.name}`,
            createdAt: new Date(),
          },
          ...prev,
        ]);

        setTimeout(() => setUploadSuccess(""), 5000);
      } else {
        setUploadError(data.error || "Upload failed");
        setUploadStatus("");
      }
    } catch (err: any) {
      setUploadError(err.message || "Network error");
      setUploadStatus("");
    } finally {
      setIsUploading(false);
    }
  };

  // Voice test (kept as-is for now, fake)
  const handleVoiceTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    setTestResult(null);

    // Mock for now
    setTimeout(() => {
      setTestResult({
        transcript: [
          {
            role: "assistant",
            message: "Hello, this is your AI assistant. How can I help today?",
          },
          { role: "user", message: "Tell me about your services." },
          {
            role: "assistant",
            message: "We offer comprehensive AI growth solutions...",
          },
        ],
        analytics: { sentiment: "Positive", durationSec: 45 },
      });
      setTestLoading(false);
    }, 1500);
  };

  const downloadTranscript = () => {
    if (!testResult) return;
    const txt = testResult.transcript
      .map((t: any) => `[${t.role.toUpperCase()}]: ${t.message}`)
      .join("\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voice-agent-transcript.txt";
    a.click();
  };

  const activeProjects = projects.filter(
    (p) => p.status !== "COMPLETED",
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status === "COMPLETED",
  ).length;
  const avgAnswerRate = 0;
  const pathD = "M 0,100 L 500,100";
  const fillD = `${pathD} L 500,100 L 0,100 Z`;

  return (
    <div className="space-y-8 font-sans antialiased text-white/95">
      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-glow backdrop-blur-xl transition-all duration-300 group"
        >
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-white/40 uppercase tracking-[0.2em]">
              Total Uploads
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Database size={16} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-black font-mono tracking-tight text-white group-hover:text-blue-400 transition">
              {totalLeadsCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/40 font-extrabold uppercase tracking-wider">
              records ingested
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-glow backdrop-blur-xl transition-all duration-300 group"
        >
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-white/40 uppercase tracking-[0.2em]">
              Active Projects
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-gold">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-black font-mono tracking-tight text-white group-hover:text-gold transition">
              {activeProjects}
            </div>
            <div className="text-[10px] text-white/40 font-extrabold uppercase tracking-wider">
              campaigns live
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-glow backdrop-blur-xl transition-all duration-300 group"
        >
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-white/40 uppercase tracking-[0.2em]">
              Completed Runs
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-black font-mono tracking-tight text-white group-hover:text-emerald-400 transition">
              {completedProjects}
            </div>
            <div className="text-[10px] text-white/40 font-extrabold uppercase tracking-wider">
              projects archived
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {/* CSV UPLOAD SECTION - NOW FUNCTIONAL */}
          <div className="relative z-20 rounded-2xl border border-white/10 bg-slate-900/35 p-6 shadow-glow backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/15">
                  <Upload size={16} />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Upload CSV Database
                </h2>
              </div>
              <span className="text-3xs uppercase tracking-wider text-slate-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full font-bold">
                Leads Parser Gateway
              </span>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Drop zone */}
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-10 text-center ${
                  isDragging
                    ? "border-blue-400 bg-blue-500/10"
                    : "border-white/10 bg-slate-950/40 hover:border-blue-500/40 hover:bg-slate-950/60"
                }`}
              >
                <Upload
                  size={32}
                  className={`mx-auto mb-3 transition-colors ${isDragging ? "text-blue-400" : "text-white/30"}`}
                />
                <p className="text-sm font-bold text-white/80 mb-1">
                  {isDragging
                    ? "Drop your CSV here"
                    : "Drag & drop a CSV file or click to browse"}
                </p>
                <p className="text-xs text-white/40">
                  Required columns:{" "}
                  <span className="text-blue-400 font-mono">
                    name, phone, email
                  </span>{" "}
                  (max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected file preview */}
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 border border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <FileText size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-white/40 font-mono">
                        {(selectedFile.size / 1024).toFixed(2)} KB •{" "}
                        {parsedLeads.length} valid rows
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    disabled={isUploading}
                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Preview first 3 rows */}
                {parsedLeads.length > 0 && (
                  <div className="rounded-xl bg-slate-950/40 border border-white/5 p-3">
                    <p className="text-[10px] uppercase font-extrabold text-white/40 mb-2 tracking-wider">
                      Preview (first 3 rows)
                    </p>
                    <div className="space-y-1.5">
                      {parsedLeads.slice(0, 3).map((lead, i) => (
                        <div
                          key={i}
                          className="text-[11px] font-mono text-white/60 truncate"
                        >
                          {lead.name || lead.Name || "—"} •{" "}
                          {lead.phone || lead.Phone || "—"} •{" "}
                          {lead.email || lead.Email || "—"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload button */}
                <button
                  onClick={handleUpload}
                  disabled={isUploading || parsedLeads.length === 0}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-sm font-bold text-white transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-blue-500/10"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Upload {parsedLeads.length} Leads to Database</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Status messages */}
            <AnimatePresence>
              {uploadStatus && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-950/30 px-4 py-3 text-xs text-blue-300"
                >
                  <AlertCircle
                    size={15}
                    className="text-blue-400 animate-pulse"
                  />
                  <span className="font-semibold">{uploadStatus}</span>
                </motion.div>
              )}
              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-300"
                >
                  <CheckCircle size={15} className="text-emerald-400" />
                  <span className="font-semibold">{uploadSuccess}</span>
                </motion.div>
              )}
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-950/30 px-4 py-3 text-xs text-red-300"
                >
                  <AlertCircle size={15} className="text-red-400" />
                  <span className="font-semibold">{uploadError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CAMPAIGN TRACKER (unchanged) */}
          <div className="relative z-10 rounded-2xl border border-white/10 bg-slate-900/35 p-6 shadow-glow backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-gold border border-amber-500/15">
                  <Activity size={16} />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Campaign Tracker
                </h2>
              </div>
              <button
                onClick={fetchLeadsCount}
                className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Call Connection Health
                  </h4>
                  <p className="text-[10px] text-white/40">
                    Real-time dial answer rate across standard timezones.
                  </p>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded">
                  AVG: 0.0%
                </span>
              </div>

              <div className="h-32 relative">
                <svg
                  viewBox="0 0 500 120"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="connected-gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#10B981"
                        stopOpacity="0.25"
                      />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line
                    x1="0"
                    y1="20"
                    x2="500"
                    y2="20"
                    stroke="#1e293b"
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="0"
                    y1="60"
                    x2="500"
                    y2="60"
                    stroke="#1e293b"
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="0"
                    y1="100"
                    x2="500"
                    y2="100"
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path d={fillD} fill="url(#connected-gradient)" />
                </svg>
              </div>
            </div>

            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-slate-900/20">
              <p className="text-xs text-white/40">
                No active campaigns allocated to this portal account.
              </p>
              <p className="text-[10px] text-white/30 mt-1">
                Please submit a leads database above to spawn an outreach
                project.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (unchanged sections) */}
        <div className="space-y-8 lg:col-span-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/35 p-5 shadow-glow backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-blue-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  System Alerts Inbox
                </h2>
              </div>
            </div>
            <p className="text-2xs text-white/30 text-center py-6">
              Inbox is empty.
            </p>
          </div>

          <div className="relative z-20 rounded-2xl border border-white/[0.08] bg-slate-900/40 p-5 shadow-glow backdrop-blur-xl space-y-4">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            <div className="flex items-center gap-2 border-b border-white/5 pb-3.5">
              <PhoneCall size={16} className="text-purple-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Interactive Voice Simulator
              </h2>
            </div>

            <form onSubmit={handleVoiceTest} className="space-y-4">
              <div>
                <label className="text-[9px] font-extrabold text-white/40 tracking-wider uppercase block mb-1.5">
                  Target Phone Number
                </label>
                <input
                  required
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 0199"
                  className="w-full rounded-xl bg-slate-950/90 border border-white/10 px-4 py-3 text-xs text-white placeholder-white/30 outline-hidden focus:border-purple-400 transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-[9px] font-extrabold text-white/40 tracking-wider uppercase block mb-1.5">
                  Interactive Call Scenario
                </label>
                <textarea
                  required
                  rows={2}
                  value={testScenario}
                  onChange={(e) => setTestScenario(e.target.value)}
                  placeholder="Objection handler scenario description..."
                  className="w-full rounded-xl bg-slate-950/90 border border-white/10 px-4 py-3 text-xs text-white placeholder-white/30 outline-hidden focus:border-purple-400 transition-all duration-300 resize-none h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1.5 relative" ref={voiceDropdownRef}>
                  <label className="text-[9px] font-extrabold text-white/40 tracking-wider uppercase block">
                    Voice Profile
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                    className="w-full h-11 flex items-center justify-between rounded-xl bg-slate-950 border border-white/10 px-3.5 text-xs text-white"
                  >
                    <span>
                      {testVoice === "Female Professional"
                        ? "Female Prof"
                        : testVoice === "Male Professional"
                          ? "Male Prof"
                          : testVoice === "Sales Specialist"
                            ? "Sales Agent"
                            : "Support Agent"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transform transition-transform duration-200 text-white/60 ${isVoiceDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isVoiceDropdownOpen && (
                    <div className="absolute top-[4.5rem] left-0 z-50 w-full rounded-xl bg-slate-950 border border-white/10 p-1.5 shadow-2xl space-y-0.5">
                      {[
                        { val: "Female Professional", label: "Female Prof" },
                        { val: "Male Professional", label: "Male Prof" },
                        { val: "Sales Specialist", label: "Sales Agent" },
                        { val: "Customer Support", label: "Support Agent" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            setTestVoice(item.val);
                            setIsVoiceDropdownOpen(false);
                          }}
                          className={`w-full text-left rounded-lg px-3 py-2 text-xs transition duration-150 ${testVoice === item.val ? "bg-purple-600/20 text-purple-400 font-bold border border-purple-500/20" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-transparent select-none block">
                    Action
                  </label>
                  <button
                    type="submit"
                    disabled={testLoading || !testPhone}
                    className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-xs font-bold text-white transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-purple-500/10"
                  >
                    <Volume2 size={13} className="animate-pulse" />
                    <span>Dial Test</span>
                  </button>
                </div>
              </div>
            </form>

            {testLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-white/40 font-semibold animate-pulse">
                <RefreshCw size={14} className="animate-spin text-purple-400" />
                <span>Establishing simulated outbound trunk...</span>
              </div>
            )}

            {testResult && (
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                    Dialer Output Console
                  </span>
                  <button
                    onClick={downloadTranscript}
                    className="text-[9px] text-white/40 hover:text-white flex items-center gap-1 transition-all"
                  >
                    <Download size={10} />
                    <span>Download TXT</span>
                  </button>
                </div>
                <div className="h-32 overflow-y-auto rounded-lg bg-black/60 p-3 text-[10px] font-mono space-y-2 leading-relaxed border border-white/5">
                  {testResult.transcript.map((t: any, i: number) => (
                    <div key={i}>
                      <span
                        className={
                          t.role === "assistant"
                            ? "text-purple-300 font-bold"
                            : "text-gold font-bold"
                        }
                      >
                        [{t.role.toUpperCase()}]:
                      </span>{" "}
                      <span className="text-white/80">{t.message}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2 text-[9px] text-white/40 font-bold">
                  <div>
                    <span>Sentiment Score: </span>
                    <span className="text-emerald-400">
                      {testResult.analytics.sentiment}
                    </span>
                  </div>
                  <div>
                    <span>Call Duration: </span>
                    <span className="text-white/85 font-mono">
                      {testResult.analytics.durationSec}s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/40 p-5 shadow-glow backdrop-blur-xl space-y-5">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <div className="flex items-center gap-2 border-b border-white/5 pb-3.5">
              <Clock size={16} className="text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Operational Logs
              </h2>
            </div>
            <div className="h-[250px] overflow-y-auto pr-2 space-y-0.5">
              {activities.length === 0 ? (
                <p className="text-2xs text-white/30 text-center py-6">
                  Logs are quiet.
                </p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="relative pl-6 pb-5 last:pb-1 border-l border-white/10 ml-1.5"
                  >
                    <span className="absolute -left-1.5 top-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400/50 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border border-slate-950"></span>
                    </span>
                    <h5 className="text-xs font-bold text-white/90">
                      {act.action}
                    </h5>
                    <p className="text-[10px] text-white/50 mt-1 leading-relaxed">
                      {act.details}
                    </p>
                    <div className="mt-2.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-950 border border-white/5 text-[9px] font-extrabold font-mono text-slate-400 uppercase tracking-wider">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
