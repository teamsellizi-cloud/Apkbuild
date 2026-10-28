"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AppCustomization, PWAManifestCheck } from "@/types";
import { AppCustomizationForm } from "./AppCustomizationForm";
import { LivePhonePreview } from "./LivePhonePreview";
import {
  Globe,
  ArrowRight,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Sparkles,
} from "lucide-react";

interface PwaBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBuild: (payload: {
    appName: string;
    packageId: string;
    versionName: string;
    versionCode: number;
    buildType: "pwa" | "website";
    sourceUrl: string;
    config: AppCustomization;
    manifestJson?: string;
  }) => Promise<void>;
}

export const PwaBuilderModal: React.FC<PwaBuilderModalProps> = ({
  isOpen,
  onClose,
  onStartBuild,
}) => {
  const [url, setUrl] = useState("https://");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PWAManifestCheck | null>(null);
  const [useCapacitorFallback, setUseCapacitorFallback] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const [config, setConfig] = useState<AppCustomization>({
    appName: "My PWA App",
    packageId: "com.app.pwa",
    versionName: "1.0.0",
    versionCode: 1,
    splashBgColor: "#0f172a",
    splashShowSpinner: true,
    splashDurationMs: 2000,
    statusBarColor: "#1e293b",
    navBarColor: "#0f172a",
    themeColor: "#10b981",
    orientation: "portrait",
    fullscreen: false,
    cleartextTraffic: false,
    permissions: {
      internet: true,
      camera: false,
      geolocation: true,
      storage: false,
      microphone: false,
      notifications: true,
      biometrics: false,
    },
    enableAssetLinks: true,
  });

  if (!isOpen) return null;

  const handleAnalyzePwa = async () => {
    if (!url || url === "https://" || url === "http://") return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setUseCapacitorFallback(false);

    try {
      const res = await fetch("/api/analyze/pwa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.analysis) {
        setAnalysis(data.analysis);

        // Pre-fill from manifest
        const a = data.analysis;
        const appName = a.name || a.shortName || config.appName;
        const hostClean = new URL(url).hostname.replace(/[^a-z0-9]/g, "");

        setConfig((prev) => ({
          ...prev,
          appName,
          packageId: `com.pwa.${hostClean}`,
          themeColor: a.themeColor && a.themeColor.startsWith("#") ? a.themeColor : prev.themeColor,
          statusBarColor: a.themeColor && a.themeColor.startsWith("#") ? a.themeColor : prev.statusBarColor,
          splashBgColor: a.backgroundColor && a.backgroundColor.startsWith("#") ? a.backgroundColor : prev.splashBgColor,
          iconDataUrl: a.iconLargestUrl || prev.iconDataUrl,
        }));
      }
    } catch {
      // Ignore
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBuild = async () => {
    if (!url || !url.startsWith("http")) return;

    setIsBuilding(true);
    try {
      const targetBuildType = useCapacitorFallback ? "website" : "pwa";
      await onStartBuild({
        appName: config.appName,
        packageId: config.packageId,
        versionName: config.versionName,
        versionCode: config.versionCode,
        buildType: targetBuildType,
        sourceUrl: url,
        config,
        manifestJson: analysis?.manifestData ? JSON.stringify(analysis.manifestData) : undefined,
      });
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-teal-50/20 dark:from-slate-800 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shrink-0">
              <Image
                src="/images/icon-pwa-3d.png"
                alt="PWA to APK"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                PWA → Trusted Web Activity (TWA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google Bubblewrap TWA Compiler & Fallback Engine
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

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* URL Input Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700/60 space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Target PWA URL (HTTPS)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://pwa-app.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <button
                type="button"
                onClick={handleAnalyzePwa}
                disabled={isAnalyzing}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Validating PWA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze Manifest & SW</span>
                  </>
                )}
              </button>
            </div>

            {/* PWA Checklist Diagnostic */}
            {analysis && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    PWA & TWA Compliance Checklist
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      analysis.isTwaReady
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {analysis.isTwaReady ? "TWA Ready (100%)" : "Partial Compliance"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    {analysis.hasManifest ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="text-slate-700 dark:text-slate-300">
                      Web App Manifest: {analysis.hasManifest ? "Found" : "Missing"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    {analysis.has512Icon ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="text-slate-700 dark:text-slate-300">
                      512x512 High-Res Icon: {analysis.has512Icon ? "Present" : "Missing"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    {analysis.hasServiceWorker ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-slate-700 dark:text-slate-300">
                      Service Worker: {analysis.hasServiceWorker ? "Registered" : "Not detected"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    {analysis.display === "standalone" || analysis.display === "fullscreen" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-slate-700 dark:text-slate-300">
                      Display: {analysis.display || "browser"}
                    </span>
                  </div>
                </div>

                {/* Fallback Option */}
                {!analysis.isTwaReady && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                    <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                      This site lacks some strict Bubblewrap TWA requirements. You can still build a flawless Capacitor Android app!
                    </p>
                    <button
                      type="button"
                      onClick={() => setUseCapacitorFallback(true)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        useCapacitorFallback
                          ? "bg-blue-600 text-white"
                          : "bg-amber-200/70 dark:bg-amber-900 text-amber-900 dark:text-amber-100 hover:bg-amber-300"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{useCapacitorFallback ? "✓ Capacitor Fallback Active" : "Use 1-Click Capacitor Fallback"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form & Mockup Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <AppCustomizationForm
                config={config}
                onChange={setConfig}
                buildType="pwa"
              />
            </div>

            <div className="lg:col-span-5 flex justify-center sticky top-2">
              <LivePhonePreview
                config={config}
                buildType={useCapacitorFallback ? "website" : "pwa"}
                sourceUrl={url}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Engine:{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {useCapacitorFallback ? "Capacitor WebView" : "Bubblewrap TWA"}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBuild}
              disabled={isBuilding}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Build APK Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
