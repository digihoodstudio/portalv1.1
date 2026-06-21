"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  PhoneCall,
  Settings,
  Database,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Save,
  Play,
  ShieldCheck,
  BarChart2,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  LayoutDashboard,
  TrendingUp,
  Activity,
  ChevronDown,
} from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  plan: string;
  status: string;
}

interface Appointment {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  clientName?: string;
  clientPhone?: string;
}

interface Call {
  id: string;
  leadName: string;
  phone: string;
  durationSec: number;
  initiatedBy: string;
  outcome: string;
  createdAt: string;
  coaching: {
    greeting: number;
    compliance: number;
    sentiment: string;
    coachingNotes: string;
    transcript: string;
  };
}

interface Project {
  id: string;
  name: string;
  clientId: string;
  status: string;
  progress: number;
  client?: { companyName: string };
  uploadedFiles?: { fileName: string; recordCount: number }[];
}

interface Agent {
  id: string;
  name: string;
  email: string;
  capacity: number;
  activeTasks: number;
  completionRate: number;
  status: string;
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

interface RequiredImportField {
  key: string;
  label: string;
  pattern: RegExp;
}

const REQUIRED_IMPORT_FIELDS: RequiredImportField[] = [
  { key: "name", label: "Decision Maker Name", pattern: /name/i },
  { key: "email", label: "Email", pattern: /e[-\s]?mail/i },
  { key: "phone", label: "Phone", pattern: /phone|mobile|cell|contact\s*no/i },
  {
    key: "company",
    label: "Company",
    pattern: /company|business|organi[sz]ation/i,
  },
  { key: "remarks", label: "Remarks", pattern: /remark|note|comment/i },
];

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "clients" | "appointments" | "calls" | "configs" | "campaigns"
  >("overview");
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [kbEntries, setKbEntries] = useState("");
  const [voiceScript, setVoiceScript] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [publisherNote, setPublisherNote] = useState("");
  const [configStatus, setConfigStatus] = useState("");

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [useAutoSplit, setUseAutoSplit] = useState(true);
  const [manualSplits, setManualSplits] = useState<Record<string, number>>({});
  const [distributeStatus, setDistributeStatus] = useState("");

  const [clientForm, setClientForm] = useState({
    id: "",
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    plan: "GROWTH",
    status: "ACTIVE",
  });
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clientFormStatus, setClientFormStatus] = useState("");

  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadCampaignName, setUploadCampaignName] = useState("");
  const [uploadClientId, setUploadClientId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [parsedRowCount, setParsedRowCount] = useState<number | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState("");
  const [estimatedLeadCount, setEstimatedLeadCount] = useState("500");

  // ─── Fetch Data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [
        clientsRes,
        apptsRes,
        callsRes,
        configsRes,
        projectsRes,
        workloadRes,
      ] = await Promise.all([
        fetch("/api/admin/clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/calls", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/configs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/crm/projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/crm/workload", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (clientsRes.ok) setClients((await clientsRes.json()).clients || []);
      if (apptsRes.ok)
        setAppointments((await apptsRes.json()).appointments || []);
      if (callsRes.ok) setCalls((await callsRes.json()).calls || []);

      if (configsRes.ok) {
        const d = await configsRes.json();
        setKbEntries(d.kbEntries || "");
        setVoiceScript(d.voiceScript || "");
        setSystemPrompt(d.systemPrompt || "");
        setPublisherNote(d.publisherNote || "");
      }

      if (projectsRes.ok) {
        const d = await projectsRes.json();
        setProjects(d.projects || []);
        const pending = (d.projects || []).find(
          (p: Project) => p.status === "APPROVED",
        );
        if (pending && !selectedProjectId) setSelectedProjectId(pending.id);
      }

      if (workloadRes.ok) {
        const d = await workloadRes.json();
        setAgents(
          d.metrics?.length > 0
            ? d.metrics
            : [
                {
                  id: "agent-1",
                  name: "John Connor",
                  email: "agent@gmail.com",
                  capacity: 1000,
                  activeTasks: 1,
                  completionRate: 92.4,
                  status: "AVAILABLE",
                },
                {
                  id: "agent-2",
                  name: "Sarah Connor",
                  email: "sarah@resistance.net",
                  capacity: 1000,
                  activeTasks: 0,
                  completionRate: 95.0,
                  status: "AVAILABLE",
                },
              ],
        );
      }
    } catch (err) {
      console.error("Fetch admin data error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchData();
    const sse = new EventSource("/api/crm/stream");
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          ["LEAD_STATUS_UPDATE", "CONNECTED", "NOTIFICATION"].includes(
            data.type,
          )
        )
          fetchData();
      } catch {
        /* ignore */
      }
    };
    return () => sse.close();
  }, [fetchData]);

  // ─── Client CRUD ──────────────────────────────────────────────────────────
  const openAddClientModal = () => {
    setClientForm({
      id: "",
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      plan: "GROWTH",
      status: "ACTIVE",
    });
    setIsEditingClient(false);
    setClientFormStatus("");
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client: Client) => {
    setClientForm({
      id: client.id,
      companyName: client.companyName,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      plan: client.plan,
      status: client.status,
    });
    setIsEditingClient(true);
    setClientFormStatus("");
    setIsClientModalOpen(true);
  };

  const saveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    setClientFormStatus("Saving account details...");
    try {
      const res = await fetch(
        isEditingClient
          ? `/api/admin/clients/${clientForm.id}`
          : "/api/admin/clients",
        {
          method: isEditingClient ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(clientForm),
        },
      );
      if (res.ok) {
        setClientFormStatus("Saved successfully!");
        fetchData();
        setTimeout(() => setIsClientModalOpen(false), 800);
      } else {
        const d = await res.json();
        setClientFormStatus(d.error || "Failed to save client details.");
      }
    } catch {
      setClientFormStatus("Network error.");
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this client?"))
      return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchData();
      else alert("Failed to delete client account.");
    } catch {
      alert("Network error.");
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
      else alert("Failed to update status.");
    } catch {
      alert("Network error.");
    }
  };

  const saveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    setConfigStatus("Updating live agent settings...");
    try {
      const res = await fetch("/api/admin/configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kbEntries,
          voiceScript,
          systemPrompt,
          publisherNote,
        }),
      });
      if (res.ok) {
        setConfigStatus("AI Agents updated successfully! Now Live.");
        setTimeout(() => setConfigStatus(""), 4000);
      } else {
        setConfigStatus("Failed to save configurations.");
      }
    } catch {
      setConfigStatus("Network error.");
    }
  };

  const handleCampaignApproval = async (id: string, approve: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/crm/projects/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: approve ? "APPROVED" : "REJECTED" }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeadSplits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert("Please select an approved campaign for workload splits.");
      return;
    }
    const token = localStorage.getItem("token");
    setDistributeStatus("Splitting workload leads...");
    try {
      const payload: Record<string, unknown> = { auto: useAutoSplit };
      if (!useAutoSplit) {
        payload.agentSplits = Object.keys(manualSplits).map((agentId) => ({
          agentId,
          count: Number(manualSplits[agentId]),
        }));
      }
      const res = await fetch(
        `/api/crm/projects/${selectedProjectId}/distribute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (res.ok) {
        setDistributeStatus("Workload split successfully allocated!");
        fetchData();
        setManualSplits({});
        setTimeout(() => setDistributeStatus(""), 4000);
      } else {
        const err = await res.json();
        setDistributeStatus(err.error || "Failed to split workload.");
      }
    } catch {
      setDistributeStatus("Connection error.");
    }
  };

  // ─── CSV Upload Handlers ───────────────────────────────────────────────────
  const resetUpload = () => {
    setUploadState("idle");
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadMessage("");
    setParsedHeaders([]);
    setParsedRows([]);
    setParsedRowCount(null);
    setParseError("");
    setIsParsingFile(false);
    setEstimatedLeadCount("500");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isXlsxFile = (file: File) => file.name.toLowerCase().endsWith(".xlsx");
  const isCsvFile = (file: File) => file.name.toLowerCase().endsWith(".csv");

  const validateImportFile = (file: File): string | null => {
    if (!isCsvFile(file) && !isXlsxFile(file))
      return "Only .csv or .xlsx files are accepted.";
    if (file.size > 20 * 1024 * 1024) return "File exceeds 20MB limit.";
    return null;
  };

  const parseCsvPreview = (file: File) => {
    setIsParsingFile(true);
    setParseError("");
    setParsedHeaders([]);
    setParsedRows([]);
    setParsedRowCount(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result ?? "");
        const lines = text
          .split(/\r\n|\n|\r/)
          .filter((line) => line.trim().length > 0);
        if (lines.length === 0) {
          setParseError("The file appears to be empty.");
          setIsParsingFile(false);
          return;
        }
        const headers = parseCsvLine(lines[0]);
        const dataLines = lines.slice(1);
        const previewRows = dataLines.slice(0, 5).map(parseCsvLine);
        setParsedHeaders(headers);
        setParsedRows(previewRows);
        setParsedRowCount(dataLines.length);
      } catch {
        setParseError(
          "Unable to parse this file. Please check the formatting.",
        );
      } finally {
        setIsParsingFile(false);
      }
    };
    reader.onerror = () => {
      setParseError("Failed to read the file from disk.");
      setIsParsingFile(false);
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (file: File) => {
    const error = validateImportFile(file);
    if (error) {
      setUploadState("error");
      setUploadMessage(error);
      return;
    }
    setUploadedFile(file);
    setUploadState("idle");
    setUploadMessage("");
    setParseError("");
    setParsedHeaders([]);
    setParsedRows([]);
    setParsedRowCount(null);
    if (isCsvFile(file)) parseCsvPreview(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState("idle");
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState("dragging");
  };

  const handleDragLeave = () => setUploadState("idle");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleCsvUpload = async () => {
    if (!uploadedFile) {
      setUploadMessage("Please select a CSV or XLSX file first.");
      return;
    }
    if (!uploadCampaignName.trim()) {
      setUploadMessage("List identifier name is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setUploadState("uploading");
    setUploadProgress(0);
    setUploadMessage("");

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) =>
        prev < 85 ? prev + Math.random() * 15 : prev,
      );
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("campaignName", uploadCampaignName.trim());
      if (uploadClientId) formData.append("clientId", uploadClientId);
      if (isXlsxFile(uploadedFile)) {
        formData.append("estimatedRecordCount", estimatedLeadCount);
      }

      const res = await fetch("/api/crm/projects/upload-csv", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        const data = await res.json();
        const importedCount =
          data.recordCount ?? parsedRowCount ?? estimatedLeadCount;
        setUploadState("success");
        setUploadMessage(
          `Successfully uploaded "${uploadedFile.name}" with ${importedCount} leads. Pending admin approval.`,
        );
        fetchData();
        setUploadCampaignName("");
        setUploadClientId("");
        setUploadedFile(null);
        setParsedHeaders([]);
        setParsedRows([]);
        setParsedRowCount(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const err = await res.json();
        setUploadState("error");
        setUploadMessage(err.error || "Upload failed. Please try again.");
      }
    } catch {
      clearInterval(progressInterval);
      setUploadState("error");
      setUploadMessage("Network error during upload.");
    }
  };

  // Skip loading screen — render dashboard immediately with empty state

  // ─── Computed Stats for Overview ───────────────────────────────────────────
  const totalLeads = projects.reduce(
    (sum, p) => sum + (p.uploadedFiles?.[0]?.recordCount || 0),
    0,
  );
  const bookedCalls = calls.filter((c) => c.outcome === "BOOKED").length;
  const conversionRate =
    calls.length > 0 ? ((bookedCalls / calls.length) * 100).toFixed(0) : 0;
  const avgGreeting =
    calls.length > 0
      ? (
          calls.reduce((s, c) => s + (c.coaching?.greeting || 0), 0) /
          calls.length
        ).toFixed(0)
      : 91;
  const avgCompliance =
    calls.length > 0
      ? (
          calls.reduce((s, c) => s + (c.coaching?.compliance || 0), 0) /
          calls.length
        ).toFixed(0)
      : 87;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "clients", label: "Clients", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "calls", label: "Call Coaching", icon: PhoneCall },
    { id: "configs", label: "AI Configs", icon: Settings },
    { id: "campaigns", label: "Campaigns", icon: Database },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Tab Navigation ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === id
                ? "bg-gold/15 border border-gold/30 text-gold shadow-glow-sm"
                : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* TOP ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Today Card */}
            <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Today
                </span>
                <button className="inline-flex items-center gap-1 text-[10px] font-bold text-white/50 hover:text-white border border-white/10 rounded-full px-2.5 py-1 bg-white/5">
                  <span>Last 5 days</span>
                  <ChevronDown size={10} />
                </button>
              </div>

              <div>
                <h2 className="text-4xl font-black text-white tracking-tight">
                  ${((totalLeads * 250) / 100).toFixed(0).toLocaleString()}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp size={11} className="text-emerald-400" />
                  <span className="text-[11px] font-bold text-emerald-400">
                    +2.14%
                  </span>
                  <span className="text-[11px] text-white/40">
                    vs last week
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 h-20 pt-2">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-gold/80 to-gold/30 hover:from-gold hover:to-gold/50 transition-all cursor-pointer"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[8px] font-mono text-white/30">
                      {i + 1}/5
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Project */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Timeline Project
                </h3>
                <button className="inline-flex items-center gap-1 text-[10px] font-bold text-gold border border-gold/30 rounded-full px-3 py-1 bg-gold/5 hover:bg-gold/10">
                  View Report
                </button>
              </div>

              <div className="flex items-end justify-between gap-3 h-32 pt-2">
                {["Apr 1", "Apr 8", "Apr 15", "Apr 22", "Apr 29"].map(
                  (label, i) => {
                    const heights = [55, 80, 45, 90, 70];
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div className="w-full flex items-end gap-1 h-full">
                          <div
                            className="flex-1 rounded-t-md bg-gradient-to-t from-gold/80 to-gold/40"
                            style={{ height: `${heights[i]}%` }}
                          />
                          <div
                            className="flex-1 rounded-t-md bg-gradient-to-t from-amber-700/60 to-amber-600/30"
                            style={{ height: `${heights[i] * 0.6}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-white/30">
                          {label}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Donut Chart */}
            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md p-6 space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full -rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgb(202, 158, 87)"
                      strokeWidth="12"
                      strokeDasharray={`${40 * 2.51}`}
                      strokeDashoffset={`${40 * 2.51 * (1 - 0.4)}`}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(202, 158, 87, 0.5)"
                      strokeWidth="12"
                      strokeDasharray={`${40 * 2.51}`}
                      strokeDashoffset={`${40 * 2.51 * (1 - 0.33)}`}
                      strokeLinecap="round"
                      transform="rotate(144 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(202, 158, 87, 0.25)"
                      strokeWidth="12"
                      strokeDasharray={`${40 * 2.51}`}
                      strokeDashoffset={`${40 * 2.51 * (1 - 0.27)}`}
                      strokeLinecap="round"
                      transform="rotate(263 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono text-white/60">
                      Live
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full mt-3 text-center">
                  <div>
                    <p className="text-xs font-bold text-gold">40%</p>
                    <p className="text-[8px] text-white/30 uppercase">Hot</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gold/70">33%</p>
                    <p className="text-[8px] text-white/30 uppercase">Warm</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gold/40">28%</p>
                    <p className="text-[8px] text-white/30 uppercase">Cold</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PIPELINE STAGES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-xs font-bold text-white">Contacted</h4>
                <span className="text-[9px] font-bold text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                  {calls.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {clients.slice(0, 2).map((c) => (
                  <div key={c.id} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                      {c.companyName?.charAt(0) || "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-white truncate">
                        {c.contactName || c.companyName}
                      </p>
                      <p className="text-[9px] text-white/40 truncate">
                        {c.contactEmail}
                      </p>
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <p className="text-[10px] text-white/30 text-center py-2">
                    No contacts
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-xs font-bold text-white">Negotiation</h4>
                <span className="text-[9px] font-bold text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                  {projects.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {projects.slice(0, 2).map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                      {p.name?.charAt(0) || "P"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[9px] text-white/40">
                        {p.uploadedFiles?.[0]?.recordCount || 0} leads
                      </p>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-[10px] text-white/30 text-center py-2">
                    No deals
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-xs font-bold text-white">Offer Sent</h4>
                <span className="text-[9px] font-bold text-white/40 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                  {appointments.length}
                </span>
              </div>
              <div className="space-y-2">
                {appointments.slice(0, 2).map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl bg-white/5 border border-white/10 p-2.5"
                  >
                    <p className="text-[11px] font-bold text-white truncate">
                      {a.title}
                    </p>
                    <p className="text-[9px] text-gold mt-0.5">
                      {a.clientName || "Lead"}
                    </p>
                    <p className="text-[8px] text-white/30 mt-1 font-mono">
                      {new Date(a.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-[10px] text-white/30 text-center py-2">
                    No offers
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-xs font-bold text-white">Deal Closed</h4>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                  {bookedCalls}
                </span>
              </div>
              <div className="space-y-2.5">
                {calls
                  .filter((c) => c.outcome === "BOOKED")
                  .slice(0, 3)
                  .map((c) => (
                    <div key={c.id} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                        {c.leadName?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-white truncate">
                          {c.leadName}
                        </p>
                        <p className="text-[9px] text-emerald-400 font-mono">
                          ${(c.durationSec * 5).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                {bookedCalls === 0 && (
                  <p className="text-[10px] text-white/30 text-center py-2">
                    No closed
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md p-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="relative w-20 h-20">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full -rotate-90"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgb(202, 158, 87)"
                        strokeWidth="8"
                        strokeDasharray={`${40 * 2.51}`}
                        strokeDashoffset={`${40 * 2.51 * (1 - Number(avgGreeting) / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {avgGreeting}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                    Greeting Score
                  </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="relative w-20 h-20">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full -rotate-90"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgb(202, 158, 87)"
                        strokeWidth="8"
                        strokeDasharray={`${40 * 2.51}`}
                        strokeDashoffset={`${40 * 2.51 * (1 - Number(avgCompliance) / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {avgCompliance}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                    Compliance
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-amber-700/5 backdrop-blur-md p-6 flex flex-col justify-center">
              <p className="text-[9px] uppercase font-bold text-gold/70 tracking-widest">
                Total Pipeline
              </p>
              <h3 className="text-3xl font-black text-white mt-1">
                ${(totalLeads * 250).toLocaleString()}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <Activity size={11} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-bold">
                  {conversionRate}% conversion
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-background/50 backdrop-blur-md p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">
                  Performance Trend
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                    <span className="text-[9px] text-white/40">
                      Last 4 Days
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                    <span className="text-[9px] text-white/40">Last Week</span>
                  </div>
                </div>
              </div>

              <div className="h-32 relative">
                <svg viewBox="0 0 500 120" className="w-full h-full">
                  <defs>
                    <linearGradient id="gold-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="rgb(202, 158, 87)"
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor="rgb(202, 158, 87)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <line
                    x1="0"
                    y1="30"
                    x2="500"
                    y2="30"
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="0"
                    y1="60"
                    x2="500"
                    y2="60"
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="0"
                    y1="90"
                    x2="500"
                    y2="90"
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="3 3"
                  />

                  <path
                    d="M 0,70 C 80,40 120,80 200,50 S 320,90 400,40 S 480,70 500,55"
                    fill="none"
                    stroke="rgb(202, 158, 87)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0,70 C 80,40 120,80 200,50 S 320,90 400,40 S 480,70 500,55 L 500,120 L 0,120 Z"
                    fill="url(#gold-grad)"
                  />
                  <path
                    d="M 0,85 C 80,75 120,95 200,80 S 320,100 400,75 S 480,90 500,80"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENT ACCOUNTS TAB ── */}
      {activeTab === "clients" && (
        <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-md space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gold" />
              <h2 className="text-lg font-bold text-white">
                Client Accounts Management
              </h2>
            </div>
            <button
              onClick={openAddClientModal}
              className="inline-flex items-center gap-2 rounded-xl bg-gold text-background hover:brightness-105 px-5 py-2.5 text-xs font-bold transition"
            >
              <Plus size={14} />
              <span>Add Client Account</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
            <table className="w-full text-left border-collapse text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Company Name</th>
                  <th className="px-4 py-3">Primary Contact</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {clients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-white/30"
                    >
                      No client records found.
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold text-white">
                        {c.companyName}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="text-white/80">{c.contactName}</p>
                          <p className="text-[10px] text-white/40">
                            {c.contactEmail} • {c.contactPhone || "No phone"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-gold">
                          {c.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${c.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => openEditClientModal(c)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition"
                          title="Edit"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => deleteClient(c.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-red-950/20 border border-red-500/20 text-red-300 hover:bg-red-900/30 transition"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── APPOINTMENTS TAB ── */}
      {activeTab === "appointments" && (
        <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gold" />
              <h2 className="text-lg font-bold text-white">
                Appointments Booked via AI
              </h2>
            </div>
            <button
              onClick={fetchData}
              className="text-white/40 hover:text-white transition"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
            <table className="w-full text-left border-collapse text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Lead / Title</th>
                  <th className="px-4 py-3">Scheduled At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">
                    Confirmation Status Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {appointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-white/30"
                    >
                      No booked appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr
                      key={appt.id}
                      className="hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white">{appt.title}</p>
                          <p className="text-[10px] text-white/40">
                            {appt.clientName ||
                              "Lead Phone: " + appt.clientPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-white/70">
                        {new Date(appt.scheduledAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${appt.status === "CONFIRMED" ? "bg-emerald-500/20 text-emerald-400" : appt.status === "CANCELLED" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        {appt.status !== "CONFIRMED" && (
                          <button
                            onClick={() =>
                              updateAppointmentStatus(appt.id, "CONFIRMED")
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition"
                            title="Confirm"
                          >
                            <Check size={11} />
                          </button>
                        )}
                        {appt.status !== "CANCELLED" && (
                          <button
                            onClick={() =>
                              updateAppointmentStatus(appt.id, "CANCELLED")
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white transition"
                            title="Cancel"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── AI VOICE COACHING TAB ── */}
      {activeTab === "calls" && (
        <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <PhoneCall size={18} className="text-gold" />
              <h2 className="text-lg font-bold text-white">
                Outbound Call Performance & Auditing
              </h2>
            </div>
            <button
              onClick={fetchData}
              className="text-white/40 hover:text-white transition"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
              <span className="text-[9.5px] uppercase font-bold text-white/40 tracking-wider">
                Avg Greeting Check
              </span>
              <p className="text-2xl font-bold font-mono mt-2 text-emerald-400">
                {calls.length > 0
                  ? (
                      calls.reduce(
                        (s, c) => s + (c.coaching?.greeting || 0),
                        0,
                      ) / calls.length
                    ).toFixed(1)
                  : "91.2"}
                %
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
              <span className="text-[9.5px] uppercase font-bold text-white/40 tracking-wider">
                Avg Compliance Check
              </span>
              <p className="text-2xl font-bold font-mono mt-2 text-gold">
                {calls.length > 0
                  ? (
                      calls.reduce(
                        (s, c) => s + (c.coaching?.compliance || 0),
                        0,
                      ) / calls.length
                    ).toFixed(1)
                  : "86.7"}
                %
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
              <span className="text-[9.5px] uppercase font-bold text-white/40 tracking-wider">
                Conversion Ratio
              </span>
              <p className="text-2xl font-bold font-mono mt-2 text-blue-400">
                {calls.length > 0
                  ? (
                      (calls.filter((c) => c.outcome === "BOOKED").length /
                        calls.length) *
                      100
                    ).toFixed(0)
                  : "66"}
                %
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
            <table className="w-full text-left border-collapse text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Lead Caller</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Greeting / Compliance</th>
                  <th className="px-4 py-3">Sentiment</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3 text-right">Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {calls.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-white/30"
                    >
                      No call logs found.
                    </td>
                  </tr>
                ) : (
                  calls.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white">{c.leadName}</p>
                          <p className="text-[10px] text-white/40">{c.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {c.durationSec}s
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <span className="text-emerald-400">
                          {c.coaching?.greeting}%
                        </span>
                        <span className="text-white/30 mx-1">/</span>
                        <span className="text-gold">
                          {c.coaching?.compliance}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${c.coaching?.sentiment === "Positive" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/60"}`}
                        >
                          {c.coaching?.sentiment || "Neutral"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[9px] font-extrabold uppercase rounded px-1.5 py-0.5 ${c.outcome === "BOOKED" ? "bg-emerald-500/20 text-emerald-400" : c.outcome === "VOICEMAIL" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/60"}`}
                        >
                          {c.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedCall(c)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[10px] text-white hover:text-gold transition font-bold"
                        >
                          <Play size={10} />
                          <span>Audit Call</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── AI AGENT CONFIG TAB ── */}
      {activeTab === "configs" && (
        <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Settings size={18} className="text-gold" />
            <h2 className="text-lg font-bold text-white">
              AI Agents Live Config Center
            </h2>
          </div>

          <form onSubmit={saveConfigs} className="space-y-5 text-left">
            <div>
              <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase block mb-1.5">
                Knowledge Base (FAQs & Business Rules)
              </label>
              <textarea
                rows={5}
                value={kbEntries}
                onChange={(e) => setKbEntries(e.target.value)}
                placeholder="Rule 1: Standard Septic pump outs start at $1497..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-gold transition font-mono leading-relaxed"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase block mb-1.5">
                  Voice Agent Greeting Script
                </label>
                <textarea
                  rows={4}
                  value={voiceScript}
                  onChange={(e) => setVoiceScript(e.target.value)}
                  placeholder="Greeting script used when dialing contacts..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-gold transition font-mono leading-relaxed"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase block mb-1.5">
                  AI Specialist System Prompt
                </label>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Overall system prompt governing agent behavior..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-gold transition font-mono leading-relaxed"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase block mb-1.5">
                Client Workspace Announcement Note
              </label>
              <textarea
                rows={2}
                value={publisherNote}
                onChange={(e) => setPublisherNote(e.target.value)}
                placeholder="Important updates published directly on Client dashboards..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-gold transition font-mono leading-relaxed"
              />
            </div>

            {configStatus && (
              <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-xs text-gold">
                <AlertCircle size={14} className="text-gold" />
                <span>{configStatus}</span>
              </div>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gold text-background hover:brightness-105 px-6 py-3.5 text-xs font-bold transition"
            >
              <Save size={14} />
              <span>Deploy Configurations Live</span>
            </button>
          </form>
        </div>
      )}

      {/* ── CAMPAIGNS TAB ── */}
      {activeTab === "campaigns" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {/* BULK IMPORT */}
            <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-md space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-gold" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                    Bulk Import Prospects
                  </h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white/40">
                  Leads Parser Gateway
                </span>
              </div>

              <p className="text-xs text-white/50 leading-relaxed">
                Upload a standard{" "}
                <code className="text-gold font-mono">.csv</code> or{" "}
                <code className="text-gold font-mono">.xlsx</code> prospect
                sheet. Validates name, email, phone, company, and remarks before
                importing.
              </p>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase block mb-1.5">
                      List Identifier Name{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadCampaignName}
                      onChange={(e) => setUploadCampaignName(e.target.value)}
                      placeholder="e.g. Q2 Outreach Campaign"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none focus:border-gold transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase block mb-1.5">
                      Assign to Client (optional)
                    </label>
                    <select
                      value={uploadClientId}
                      onChange={(e) => setUploadClientId(e.target.value)}
                      className="w-full rounded-xl bg-background border border-white/10 px-3 py-2.5 text-xs text-white outline-none focus:border-gold transition"
                    >
                      <option value="">-- No Client Selected --</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() =>
                      !uploadedFile && fileInputRef.current?.click()
                    }
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer py-10 px-6
                      ${uploadState === "dragging" ? "border-gold bg-gold/5 scale-[1.01]" : ""}
                      ${uploadState === "success" ? "border-emerald-500/50 bg-emerald-500/5 cursor-default" : ""}
                      ${uploadState === "error" ? "border-red-500/50 bg-red-500/5 cursor-default" : ""}
                      ${uploadState === "uploading" ? "border-white/20 bg-white/[0.01] cursor-default" : ""}
                      ${!["dragging", "success", "error", "uploading"].includes(uploadState) ? "border-white/10 bg-white/[0.015] hover:border-gold/40 hover:bg-gold/[0.02]" : ""}
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleInputChange}
                      className="hidden"
                    />

                    {uploadState === "uploading" ? (
                      <>
                        <Loader2 size={32} className="text-gold animate-spin" />
                        <p className="text-xs font-bold text-white">
                          Uploading your file...
                        </p>
                        <div className="w-full max-w-xs h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gold rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-white/40 font-mono">
                          {Math.round(uploadProgress)}%
                        </p>
                      </>
                    ) : uploadState === "success" ? (
                      <>
                        <CheckCircle2 size={32} className="text-emerald-400" />
                        <p className="text-xs font-bold text-emerald-400 text-center">
                          {uploadMessage}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetUpload();
                          }}
                          className="mt-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 text-[10px] font-bold text-white transition"
                        >
                          Upload Another File
                        </button>
                      </>
                    ) : uploadState === "error" ? (
                      <>
                        <XCircle size={32} className="text-red-400" />
                        <p className="text-xs font-bold text-red-400 text-center">
                          {uploadMessage}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetUpload();
                          }}
                          className="mt-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 text-[10px] font-bold text-white transition"
                        >
                          Try Again
                        </button>
                      </>
                    ) : uploadedFile ? (
                      <>
                        <FileSpreadsheet size={32} className="text-gold" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-white">
                            {uploadedFile.name}
                          </p>
                          <p className="text-[10px] text-white/40 mt-0.5">
                            {(uploadedFile.size / 1024).toFixed(1)} KB •{" "}
                            {isXlsxFile(uploadedFile) ? "XLSX" : "CSV"}
                            {parsedRowCount !== null &&
                              ` • ${parsedRowCount} rows`}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetUpload();
                          }}
                          className="text-[10px] text-white/30 hover:text-red-400 transition underline"
                        >
                          Remove file
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <FileSpreadsheet
                            size={28}
                            className="text-white/30"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-white">
                            Choose CSV Spreadsheet
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            Drag &amp; drop or select files (max 20MB)
                          </p>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 border border-white/10 rounded-full px-3 py-1">
                          .CSV or .XLSX files only
                        </span>
                      </>
                    )}
                  </div>

                  {uploadedFile &&
                    isXlsxFile(uploadedFile) &&
                    uploadState !== "success" &&
                    uploadState !== "uploading" && (
                      <div>
                        <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase block mb-1.5">
                          Load Estimate{" "}
                          <span className="text-white/25 font-normal">
                            (verified after upload)
                          </span>
                        </label>
                        <select
                          value={estimatedLeadCount}
                          onChange={(e) =>
                            setEstimatedLeadCount(e.target.value)
                          }
                          className="w-full rounded-xl bg-background border border-white/10 px-3 py-2.5 text-xs text-white outline-none focus:border-gold transition"
                        >
                          <option value="100">~100 leads</option>
                          <option value="500">~500 leads</option>
                          <option value="1000">~1,000 leads</option>
                          <option value="2500">~2,500 leads</option>
                          <option value="5000">~5,000+ leads</option>
                        </select>
                      </div>
                    )}

                  {uploadedFile &&
                    uploadState !== "uploading" &&
                    uploadState !== "success" && (
                      <button
                        onClick={handleCsvUpload}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold text-background hover:brightness-105 py-3 text-xs font-bold transition"
                      >
                        <Upload size={14} />
                        <span>Submit Leads</span>
                      </button>
                    )}

                  {uploadState === "error" &&
                    !uploadedFile &&
                    uploadMessage && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                        <AlertCircle size={14} />
                        <span>{uploadMessage}</span>
                      </div>
                    )}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.015] p-4 space-y-3">
                  <span className="block text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    CSV Parsing Preview (Top 5 Rows)
                  </span>

                  {!uploadedFile ? (
                    <div className="flex h-[260px] items-center justify-center text-center text-xs text-white/30 px-6">
                      No files loaded. Select a CSV file to view parsing.
                    </div>
                  ) : isParsingFile ? (
                    <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-white/40">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-xs">Parsing spreadsheet…</span>
                    </div>
                  ) : parseError ? (
                    <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center px-6 text-red-400">
                      <XCircle size={20} />
                      <span className="text-xs">{parseError}</span>
                    </div>
                  ) : isXlsxFile(uploadedFile) ? (
                    <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center px-6 text-white/40">
                      <FileSpreadsheet size={20} className="text-white/30" />
                      <span className="text-xs">
                        XLSX preview isn&apos;t rendered in-browser. Rows will
                        be validated after upload.
                      </span>
                    </div>
                  ) : parsedHeaders.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {REQUIRED_IMPORT_FIELDS.map((field) => {
                          const matched = parsedHeaders.some((h) =>
                            field.pattern.test(h),
                          );
                          return (
                            <span
                              key={field.key}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${matched ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
                            >
                              {matched ? (
                                <CheckCircle2 size={10} />
                              ) : (
                                <XCircle size={10} />
                              )}
                              {field.label}
                            </span>
                          );
                        })}
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-white/5">
                        <table className="w-full text-left border-collapse text-[10px] text-white/70">
                          <thead>
                            <tr className="bg-white/5 text-white/40 uppercase tracking-wider">
                              {parsedHeaders.map((h, idx) => (
                                <th
                                  key={idx}
                                  className="px-2.5 py-2 whitespace-nowrap"
                                >
                                  {h || `Col ${idx + 1}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {parsedRows.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={parsedHeaders.length}
                                  className="px-2.5 py-3 text-center text-white/30"
                                >
                                  No data rows.
                                </td>
                              </tr>
                            ) : (
                              parsedRows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {parsedHeaders.map((_, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className="px-2.5 py-1.5 whitespace-nowrap font-mono"
                                    >
                                      {row[cIdx] ?? ""}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {parsedRowCount !== null && (
                        <p className="text-[10px] text-white/40">
                          <span className="font-bold text-gold">
                            {parsedRowCount}
                          </span>{" "}
                          total leads detected.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-[260px] items-center justify-center text-center text-xs text-white/30 px-6">
                      No files loaded.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CAMPAIGN APPROVAL */}
            <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <ShieldCheck size={18} className="text-gold" />
                <h2 className="text-lg font-bold text-white">
                  Campaign Database Approval
                </h2>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
                <table className="w-full text-left border-collapse text-xs text-white/80">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Client Company</th>
                      <th className="px-4 py-3">Campaign File</th>
                      <th className="px-4 py-3">Leads Count</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {projects.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-white/30"
                        >
                          No databases in queue.
                        </td>
                      </tr>
                    ) : (
                      projects.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3.5 font-bold text-white">
                            {p.client?.companyName || "Septic Specialists"}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[11px] text-white/70">
                            {p.uploadedFiles?.[0]?.fileName || "leads.csv"}
                          </td>
                          <td className="px-4 py-3.5 font-mono">
                            {p.uploadedFiles?.[0]?.recordCount || 500}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${p.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" : p.status === "PENDING_APPROVAL" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}
                            >
                              {p.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            {p.status === "PENDING_APPROVAL" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleCampaignApproval(p.id, true)
                                  }
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition"
                                  title="Approve"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleCampaignApproval(p.id, false)
                                  }
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white transition"
                                  title="Reject"
                                >
                                  <X size={12} />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* WORKLOAD SPLITS */}
            <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-md space-y-5">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <Database size={18} className="text-gold" />
                <h2 className="text-lg font-bold text-white">
                  Leads workload split engine
                </h2>
              </div>

              <form onSubmit={handleLeadSplits} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase block mb-1.5">
                      Select Approved Campaign
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full rounded-xl bg-background border border-white/10 px-3 py-2.5 text-xs text-white outline-none focus:border-gold transition"
                    >
                      <option value="">-- Choose Campaign --</option>
                      {projects
                        .filter((p) => p.status === "APPROVED")
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.uploadedFiles?.[0]?.recordCount || 500}{" "}
                            records)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/40 tracking-wider uppercase block mb-1.5">
                      Distribution Split Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setUseAutoSplit(true)}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${useAutoSplit ? "border-gold bg-gold/10 text-gold shadow-glow-sm" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
                      >
                        Auto Equal Split
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseAutoSplit(false)}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${!useAutoSplit ? "border-gold bg-gold/10 text-gold shadow-glow-sm" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
                      >
                        Manual Split
                      </button>
                    </div>
                  </div>
                </div>

                {!useAutoSplit && selectedProjectId && (
                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 space-y-3.5">
                    <span className="block text-[10px] font-bold text-gold uppercase tracking-wider">
                      Allocate Splits Per Agent
                    </span>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {agents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-xs text-white/80">
                            {agent.name}
                          </span>
                          <input
                            type="number"
                            placeholder="Leads count"
                            value={manualSplits[agent.id] || ""}
                            onChange={(e) =>
                              setManualSplits((prev) => ({
                                ...prev,
                                [agent.id]: Number(e.target.value),
                              }))
                            }
                            className="w-[120px] rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-gold font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedProjectId}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold text-background hover:brightness-105 py-3 text-xs font-bold transition disabled:opacity-50"
                >
                  <span>Trigger Workload Allocation</span>
                </button>
              </form>

              {distributeStatus && (
                <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-xs text-gold">
                  <AlertCircle size={14} className="text-gold" />
                  <span>{distributeStatus}</span>
                </div>
              )}
            </div>
          </div>

          {/* AGENT CAPACITY SIDEBAR */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-background/50 p-6 backdrop-blur-md space-y-5">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <BarChart2 size={16} className="text-gold" />
                <h2 className="text-md font-bold text-white">
                  Agent Capacity Status
                </h2>
              </div>

              <div className="space-y-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="rounded-xl border border-white/5 bg-white/[0.01] p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{agent.name}</span>
                      <span
                        className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${agent.activeTasks > 0 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}
                      >
                        {agent.activeTasks > 0
                          ? `${agent.activeTasks} Tasks`
                          : "Available"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] text-white/40 uppercase">
                        <span>Assigned capacity</span>
                        <span>
                          {agent.activeTasks * 250 || 0} / {agent.capacity}{" "}
                          leads
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gold rounded-full"
                          style={{
                            width: `${Math.min(((agent.activeTasks * 250) / agent.capacity) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9.5px] text-white/40 border-t border-white/5 pt-2 font-semibold">
                      <span>Performance rate:</span>
                      <span className="text-emerald-400 font-mono">
                        {agent.completionRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENT MODAL ── */}
      <AnimatePresence>
        {isClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#060b1b] p-6 space-y-5 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">
                  {isEditingClient
                    ? "Edit Client Details"
                    : "Create Client Account"}
                </h3>
                <button
                  onClick={() => setIsClientModalOpen(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={saveClient} className="space-y-4">
                <div>
                  <label className="text-[9.5px] font-bold text-white/40 tracking-wider uppercase block mb-1">
                    Company Name
                  </label>
                  <input
                    required
                    type="text"
                    value={clientForm.companyName}
                    onChange={(e) =>
                      setClientForm({
                        ...clientForm,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="e.g. Septic Specialists"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-gold transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9.5px] font-bold text-white/40 tracking-wider uppercase block mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={clientForm.contactName}
                      onChange={(e) =>
                        setClientForm({
                          ...clientForm,
                          contactName: e.target.value,
                        })
                      }
                      placeholder="e.g. James Carter"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-gold transition"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-white/40 tracking-wider uppercase block mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={clientForm.contactPhone}
                      onChange={(e) =>
                        setClientForm({
                          ...clientForm,
                          contactPhone: e.target.value,
                        })
                      }
                      placeholder="e.g. +1 555-0100"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-gold transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9.5px] font-bold text-white/40 tracking-wider uppercase block mb-1">
                    Contact Email
                  </label>
                  <input
                    required
                    type="email"
                    value={clientForm.contactEmail}
                    onChange={(e) =>
                      setClientForm({
                        ...clientForm,
                        contactEmail: e.target.value,
                      })
                    }
                    placeholder="e.g. contact@company.com"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-gold transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9.5px] font-bold text-white/40 tracking-wider uppercase block mb-1">
                      Service Plan
                    </label>
                    <select
                      value={clientForm.plan}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, plan: e.target.value })
                      }
                      className="w-full rounded-xl bg-background border border-white/10 px-2 py-2 text-xs text-white outline-none focus:border-gold transition"
                    >
                      <option value="BASIC">Basic Pilot</option>
                      <option value="GROWTH">Growth Scale</option>
                      <option value="ENTERPRISE">Enterprise Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-white/40 tracking-wider uppercase block mb-1">
                      Status
                    </label>
                    <select
                      value={clientForm.status}
                      onChange={(e) =>
                        setClientForm({ ...clientForm, status: e.target.value })
                      }
                      className="w-full rounded-xl bg-background border border-white/10 px-2 py-2 text-xs text-white outline-none focus:border-gold transition"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>
                {clientFormStatus && (
                  <p className="text-xs text-gold animate-pulse text-center">
                    {clientFormStatus}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="w-1/2 rounded-xl bg-white/5 hover:bg-white/10 py-2.5 text-xs font-bold text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 rounded-xl bg-gold text-background hover:brightness-105 py-2.5 text-xs font-bold transition"
                  >
                    Save Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CALL TRANSCRIPT DIALOG ── */}
      <AnimatePresence>
        {selectedCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#060b1b] p-6 space-y-5 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Call Compliance & Coaching Dashboard
                  </h3>
                  <p className="text-[10px] text-white/40">
                    Lead: {selectedCall.leadName} • {selectedCall.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-center">
                  <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                    Greeting score
                  </span>
                  <p className="text-xl font-bold font-mono mt-1 text-emerald-400">
                    {selectedCall.coaching?.greeting}%
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-center">
                  <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                    Script compliance
                  </span>
                  <p className="text-xl font-bold font-mono mt-1 text-gold">
                    {selectedCall.coaching?.compliance}%
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-center">
                  <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                    Tone sentiment
                  </span>
                  <p className="text-xl font-bold font-mono mt-1 text-blue-400">
                    {selectedCall.coaching?.sentiment}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider">
                  AI Coaching Analysis
                </h4>
                <p className="text-xs text-white/70 leading-relaxed bg-white/[0.01] border border-white/5 rounded-xl p-3.5">
                  {selectedCall.coaching?.coachingNotes}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider">
                  Live Call Audio Transcript
                </h4>
                <div className="h-[180px] overflow-y-auto rounded-xl bg-black/50 p-4 border border-white/5 text-xs font-mono space-y-2.5 leading-relaxed">
                  {selectedCall.coaching?.transcript
                    .split("\n")
                    .map((line, idx) => {
                      const parts = line.split(":");
                      const role = parts[0] || "";
                      const text = parts.slice(1).join(":") || "";
                      return (
                        <div key={idx}>
                          <span
                            className={
                              role.includes("[AI]")
                                ? "text-purple-300"
                                : "text-gold font-semibold"
                            }
                          >
                            {role}:
                          </span>
                          <span className="text-white/80"> {text}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedCall(null)}
                  className="rounded-xl bg-white/5 hover:bg-white/10 px-6 py-2.5 text-xs font-bold text-white transition"
                >
                  Close Audit Page
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
