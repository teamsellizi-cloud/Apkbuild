"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  RotateCw,
  Copy,
  Check,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  Smartphone,
  ExternalLink,
  Search,
} from "lucide-react";
import { BuildStatus, BuildType } from "@/types";

interface BuildProgressModalProps {
  buildId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshList: () => void;
}

interface BuildData {
  id: string;
  appName: string;
  packageId: string;
  versionName: string;
  versionCode: number;
  buildType: BuildType;
  status: BuildStatus;
  progressPercent: number;
  currentStep?: string;
  errorMessage?: string;
  logs: string;
  apkFileName?: string;
  apkFileSize?: number;
  hasApk?: boolean;
  downloadUrl?: string;
  downloadExpiresAt?: number;
  retryCount: number;
  githubRunUrl?: string;
  createdAt: string;
}

export const BuildProgressModal: React.FC<BuildProgressModalProps> = ({
  buildId,
  isOpen,
  onClose,
  onRefreshList,
}) => {
  const [buildData, setBuildData] = useState<BuildData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logFilter, setLogFilter] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchBuild = async (id: string) => {
    try {
      const res = await fetch(`/api/builds/${id}`);
      const data = await res.json();
      if (data.success && data.build) {
        setBuildData(data.build);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (!isOpen || !buildId) return;

    setLoading(true);
    fetchBuild(buildId).finally(() => setLoading(false));

    // Poll every 1.5 seconds if build is active
    const interval = setInterval(() => {
      fetchBuild(buildId);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, buildId]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [buildData?.logs, autoScroll]);

  if (!isOpen || !buildId) return null;

  const isCompleted = buildData?.status === "completed";
  const isFailed = buildData?.status === "failed";
  const isCancelled = buildData?.status === "cancelled";
  const isRunning = !isCompleted && !isFailed && !isCancelled;

  const handleCopyLogs = () => {
    if (!buildData?.logs) return;
    navigator.clipboard.writeText(buildData.logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogFile = () => {
    if (!buildData?.logs) return;
    const blob = new Blob([buildData.logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `build-${buildId}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCancel = async () => {
    try {
      await fetch(`/api/builds/${buildId}/cancel`, { method: "POST" });
      await fetchBuild(buildId);
      onRefreshList();
    } catch {
      // Ignore
    }
  };

  const handleRetry = async () => {
    try {
      await fetch(`/api/builds/${buildId}/retry`, { method: "POST" });
      await fetchBuild(buildId);
      onRefreshList();
    } catch {
      // Ignore
    }
  };

  const handleDirectDownload = async () => {
    if (!buildData) return;
    if (buildData.downloadUrl) {
      window.location.href = buildData.downloadUrl;
    } else {
      // Request new token
      try {
        const res = await fetch(`/api/builds/${buildId}/token`, { method: "POST" });
        const data = await res.json();
        if (data.downloadUrl) {
          window.location.href = data.downloadUrl;
        }
      } catch {
        alert("Failed to initiate download link.");
      }
    }
  };

  const renderLogLines = () => {
    if (!buildData?.logs) return <span className="text-slate-500">Waiting for logs...</span>;

    const lines = buildData.logs.split("\n");
    const filtered = logFilter ? lines.filter((l) => l.toLowerCase().includes(logFilter.toLowerCase())) : lines;

    return filtered.map((line, idx) => {
      let colorClass = "text-slate-300";
      if (line.includes("[SUCCESS]")) colorClass = "text-emerald-400 font-bold";
      else if (line.includes("[ERROR]")) colorClass = "text-rose-400 font-bold";
      else if (line.includes("[WARN]")) colorClass = "text-amber-400";
      else if (line.includes("[STEP]")) colorClass = "text-cyan-300 font-semibold";
      else if (line.includes("[RUNNER]")) colorClass = "text-purple-300";

      return (
        <div key={idx} className={`leading-relaxed whitespace-pre-wrap font-mono ${colorClass}`}>
          {line}
        </div>
      );
    });
  };

  const steps = [
    { label: "Validating", progress: 15 },
    { label: "Android SDK", progress: 35 },
    { label: "Manifest & Config", progress: 55 },
    { label: "Gradle Build", progress: 75 },
    { label: "Signing Key", progress: 90 },
    { label: "Ready", progress: 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/20 dark:from-slate-800 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
                  {buildData?.appName || "Build In Progress"}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  {buildData?.buildType?.toUpperCase() || "BUILD"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {buildData?.packageId || buildId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Progress Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isFailed ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {buildData?.currentStep || "Processing..."}
                </span>
              </div>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                {buildData?.progressPercent || 0}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                style={{ width: `${buildData?.progressPercent || 0}%` }}
                className={`h-full transition-all duration-500 rounded-full ${
                  isFailed
                    ? "bg-rose-500"
                    : isCompleted
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                }`}
              />
            </div>

            {/* Step Indicators */}
            <div className="hidden sm:grid grid-cols-6 gap-1 pt-1 text-[10px] text-slate-400 font-semibold text-center">
              {steps.map((s, idx) => (
                <span
                  key={idx}
                  className={`${
                    (buildData?.progressPercent || 0) >= s.progress
                      ? "text-blue-600 dark:text-blue-400 font-bold"
                      : ""
                  }`}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* If Completed: APK Download Hero */}
          {isCompleted && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200 dark:border-emerald-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Signed APK Ready to Install!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {buildData?.apkFileName || `${buildData?.packageId}.apk`} (
                      {((buildData?.apkFileSize || 1200000) / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQr((prev) => !prev)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{showQr ? "Hide QR" : "Phone QR"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectDownload}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-500/30 active:scale-98 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download APK</span>
                  </button>
                </div>
              </div>

              {/* QR Code Display for Android Scanning */}
              {showQr && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Scan with Android Camera / QR Scanner to download:
                  </p>
                  {/* Embedded SVG QR representation */}
                  <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        typeof window !== "undefined"
                          ? `${window.location.origin}${buildData.downloadUrl || ""}`
                          : ""
                      )}`}
                      alt="Download QR"
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Signed link valid for 60 minutes
                  </p>
                </div>
              )}

              {/* Install instructions banner */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Tip: When opening the downloaded APK on Android, tap <strong>Install</strong> and enable "Allow from this source" if prompted.
                </span>
              </div>
            </div>
          )}

          {/* If Failed Banner */}
          {isFailed && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Build Failed</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    {buildData?.errorMessage || "An error occurred during compilation. Inspect logs below."}
                  </p>
                </div>
              </div>

              {(buildData?.retryCount || 0) < 2 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="py-1.5 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry (1 left)</span>
                </button>
              )}
            </div>
          )}

          {/* Live Terminal Logs */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex flex-col">
            {/* Terminal Top Bar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="font-mono text-slate-400 text-[11px] font-medium ml-1">
                  build-stream.log
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative hidden sm:block">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    placeholder="Filter logs..."
                    className="pl-6 pr-2 py-0.5 text-[11px] rounded bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Copy logs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadLogFile}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Download .log file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 font-mono text-xs overflow-y-auto max-h-[260px] min-h-[160px] bg-slate-950/95 space-y-1">
              {renderLogLines()}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {buildData?.githubRunUrl ? (
              <a
                href={buildData.githubRunUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View on GitHub Actions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span>In-App High Performance Runner Engine</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isRunning && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                Cancel Build
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
