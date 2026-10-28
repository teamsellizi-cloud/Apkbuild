"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AppCustomization, BuildType } from "@/types";
import { Wifi, Battery, Signal, Globe, Sparkles, Smartphone, Eye } from "lucide-react";

interface LivePhonePreviewProps {
  config: AppCustomization;
  buildType: BuildType;
  sourceUrl?: string;
  frameworkDetected?: string;
}

export const LivePhonePreview: React.FC<LivePhonePreviewProps> = ({
  config,
  buildType,
  sourceUrl,
  frameworkDetected,
}) => {
  const [previewTab, setPreviewTab] = useState<"app" | "splash" | "icon">("app");

  return (
    <div className="flex flex-col items-center">
      {/* View Switcher Pill */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={() => setPreviewTab("app")}
          className={`px-3 py-1 rounded-full transition-all ${
            previewTab === "app" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : ""
          }`}
        >
          App View
        </button>
        <button
          type="button"
          onClick={() => setPreviewTab("splash")}
          className={`px-3 py-1 rounded-full transition-all ${
            previewTab === "splash" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : ""
          }`}
        >
          Splash Screen
        </button>
        <button
          type="button"
          onClick={() => setPreviewTab("icon")}
          className={`px-3 py-1 rounded-full transition-all ${
            previewTab === "icon" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : ""
          }`}
        >
          Adaptive Icon
        </button>
      </div>

      {/* Phone Mockup Frame */}
      <div className="relative w-[280px] h-[520px] rounded-[38px] bg-slate-900 border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all">
        {/* Phone Notch / Camera Hole */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-700/50" />
        </div>

        {/* 1. App View */}
        {previewTab === "app" && (
          <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
            {/* Custom Status Bar */}
            <div
              style={{ backgroundColor: config.statusBarColor || "#1e293b" }}
              className="h-7 px-4 pt-1 flex items-center justify-between text-[10px] text-white font-medium shrink-0 z-20"
            >
              <span>12:00</span>
              <div className="flex items-center gap-1.5 opacity-90">
                <Signal className="w-2.5 h-2.5" />
                <Wifi className="w-2.5 h-2.5" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* Custom App Header / Webview Bar */}
            {!config.fullscreen && (
              <div
                style={{ backgroundColor: config.themeColor || "#2563eb" }}
                className="px-3.5 py-2.5 flex items-center gap-2 text-white shadow-sm shrink-0"
              >
                {config.iconDataUrl ? (
                  <div className="relative w-5 h-5 rounded-md overflow-hidden bg-white/20 shrink-0">
                    <img src={config.iconDataUrl} alt="App icon" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-xs">
                    📱
                  </div>
                )}
                <span className="text-xs font-bold truncate">{config.appName || "My Android App"}</span>
              </div>
            )}

            {/* Webview Content Simulation */}
            <div className="flex-1 bg-slate-900/60 p-4 flex flex-col items-center justify-center text-center overflow-y-auto">
              {buildType === "website" ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[200px]">
                      {config.appName || "Web App"}
                    </p>
                    <p className="text-[10px] text-blue-400/90 font-mono break-all mt-1">
                      {sourceUrl || "https://example.com"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-300">
                    Capacitor Native WebView Active
                  </div>
                </div>
              ) : buildType === "zip" ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-lg font-bold">
                    &lt;/&gt;
                  </div>
                  <p className="text-xs font-bold text-white">{config.appName || "Bundled Web App"}</p>
                  <p className="text-[11px] text-purple-400 font-semibold">
                    {frameworkDetected || "Static Bundle (index.html)"}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-300">
                    Offline Asset Engine Ready
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto font-black text-xs">
                    TWA
                  </div>
                  <p className="text-xs font-bold text-white">{config.appName || "PWA App"}</p>
                  <p className="text-[10px] text-emerald-400 break-all">{sourceUrl || "https://pwa.example.com"}</p>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] text-slate-300">
                    Bubblewrap TWA Fullscreen Ready
                  </div>
                </div>
              )}
            </div>

            {/* Custom Navigation Bar */}
            <div
              style={{ backgroundColor: config.navBarColor || "#0f172a" }}
              className="h-8 flex items-center justify-center gap-12 text-slate-400 shrink-0"
            >
              <div className="w-2.5 h-2.5 border-b-2 border-l-2 border-slate-400 rotate-45" />
              <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-400" />
              <div className="w-2.5 h-2.5 border-2 border-slate-400" />
            </div>
          </div>
        )}

        {/* 2. Splash Screen View */}
        {previewTab === "splash" && (
          <div
            style={{ backgroundColor: config.splashBgColor || "#ffffff" }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center transition-colors"
          >
            {config.iconDataUrl ? (
              <div className="relative w-20 h-20 rounded-3xl overflow-hidden shadow-lg mb-4">
                <img src={config.iconDataUrl} alt="Splash icon" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-3xl shadow-lg mb-4">
                🚀
              </div>
            )}
            <h4
              style={{
                color:
                  config.splashBgColor === "#ffffff" || config.splashBgColor === "#f8fafc" ? "#0f172a" : "#ffffff",
              }}
              className="text-base font-extrabold tracking-tight mb-2"
            >
              {config.appName || "My App"}
            </h4>

            {config.splashShowSpinner && (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mt-4" />
            )}
          </div>
        )}

        {/* 3. Adaptive Icon Mask View */}
        {previewTab === "icon" && (
          <div className="flex-1 bg-slate-900 p-6 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-xs font-semibold text-slate-400">Android Adaptive Icon Masks</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full bg-blue-600 overflow-hidden shadow-md flex items-center justify-center">
                  {config.iconDataUrl ? (
                    <img src={config.iconDataUrl} alt="Icon circle" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl text-white">📱</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">Circle</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 overflow-hidden shadow-md flex items-center justify-center">
                  {config.iconDataUrl ? (
                    <img src={config.iconDataUrl} alt="Icon squircle" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl text-white">📱</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">Squircle</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-2">{config.packageId}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
        <Smartphone className="w-3.5 h-3.5" />
        <span>Live Interactive Android Preview</span>
      </div>
    </div>
  );
};
