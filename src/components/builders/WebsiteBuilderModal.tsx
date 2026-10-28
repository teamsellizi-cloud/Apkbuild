"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AppCustomization } from "@/types";
import { AppCustomizationForm } from "./AppCustomizationForm";
import { LivePhonePreview } from "./LivePhonePreview";
import { Globe, ArrowRight, Loader2, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";

interface WebsiteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBuild: (payload: {
    appName: string;
    packageId: string;
    versionName: string;
    versionCode: number;
    buildType: "website";
    sourceUrl: string;
    config: AppCustomization;
  }) => Promise<void>;
}

export const WebsiteBuilderModal: React.FC<WebsiteBuilderModalProps> = ({
  isOpen,
  onClose,
  onStartBuild,
}) => {
  const [url, setUrl] = useState("https://");
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectMessage, setInspectMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const [config, setConfig] = useState<AppCustomization>({
    appName: "My Website App",
    packageId: "com.app.webapp",
    versionName: "1.0.0",
    versionCode: 1,
    splashBgColor: "#0f172a",
    splashShowSpinner: true,
    splashDurationMs: 2000,
    statusBarColor: "#1e293b",
    navBarColor: "#0f172a",
    themeColor: "#2563eb",
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
  });

  if (!isOpen) return null;

  const handleInspectUrl = async () => {
    if (!url || url === "https://" || url === "http://") {
      setInspectMessage({ type: "error", text: "Please enter a valid website URL." });
      return;
    }

    setIsInspecting(true);
    setInspectMessage(null);

    try {
      const res = await fetch("/api/analyze/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.success) {
        setConfig((prev) => ({
          ...prev,
          appName: data.title || prev.appName,
          packageId: data.suggestedPackageId || prev.packageId,
          themeColor: data.themeColor || prev.themeColor,
          statusBarColor: data.themeColor || prev.statusBarColor,
          iconDataUrl: data.faviconUrl || prev.iconDataUrl,
        }));
        setInspectMessage({
          type: "success",
          text: `Auto-filled details from "${data.title || url}"!`,
        });
      } else {
        setInspectMessage({
          type: "error",
          text: data.error || "Could not auto-detect site info. You can enter details manually.",
        });
      }
    } catch {
      setInspectMessage({
        type: "error",
        text: "Network error inspecting site. You can continue manually.",
      });
    } finally {
      setIsInspecting(false);
    }
  };

  const handleBuild = async () => {
    if (!url || !url.startsWith("http")) {
      setInspectMessage({ type: "error", text: "A valid HTTP/HTTPS URL is required." });
      return;
    }

    setIsBuilding(true);
    try {
      await onStartBuild({
        appName: config.appName,
        packageId: config.packageId,
        versionName: config.versionName,
        versionCode: config.versionCode,
        buildType: "website",
        sourceUrl: url,
        config,
      });
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-50/50 to-blue-50/20 dark:from-slate-800 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shrink-0">
              <Image
                src="/images/icon-website-3d.png"
                alt="Website to APK"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Website → Android APK
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Capacitor Native WebView Engine
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
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700/60 space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Target Website URL (HTTPS)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <button
                type="button"
                onClick={handleInspectUrl}
                disabled={isInspecting}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 shadow-sm"
              >
                {isInspecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Inspecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Inspect & Fill</span>
                  </>
                )}
              </button>
            </div>

            {inspectMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  inspectMessage.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {inspectMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{inspectMessage.text}</span>
              </div>
            )}
          </div>

          {/* Form & Mockup Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <AppCustomizationForm
                config={config}
                onChange={setConfig}
                buildType="website"
              />
            </div>

            <div className="lg:col-span-5 flex justify-center sticky top-2">
              <LivePhonePreview
                config={config}
                buildType="website"
                sourceUrl={url}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Output: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{config.packageId}</span>
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
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50"
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
