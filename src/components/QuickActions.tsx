"use client";

import React from "react";
import Image from "next/image";
import { ChevronRight, ArrowRight, Zap } from "lucide-react";

interface QuickActionsProps {
  onSelectMethod: (method: "website" | "zip" | "pwa") => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectMethod }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quick Actions
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Choose your conversion method to get started.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
          <span>3 Methods • 1 App</span>
        </div>
      </div>

      {/* 3 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Website -> APK */}
        <div
          onClick={() => onSelectMethod("website")}
          className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-b from-sky-50 via-blue-50/40 to-white dark:from-slate-800/90 dark:via-slate-850 dark:to-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
        >
          {/* Top subtle chevron */}
          <div className="flex items-start justify-between">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/images/icon-website-3d.png"
                alt="Website to APK"
                fill
                className="object-contain"
              />
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-100/70 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3 space-y-1">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
              Website → APK
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Convert any HTTPS website to an Android app.
            </p>
          </div>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/30 active:scale-98 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Start Now</span>
          </button>
        </div>

        {/* 2. ZIP -> APK */}
        <div
          onClick={() => onSelectMethod("zip")}
          className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-b from-purple-50 via-fuchsia-50/40 to-white dark:from-slate-800/90 dark:via-slate-850 dark:to-slate-900 border border-purple-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/images/icon-zip-3d.png"
                alt="ZIP to APK"
                fill
                className="object-contain"
              />
            </div>
            <div className="w-7 h-7 rounded-full bg-purple-100/70 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3 space-y-1">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
              ZIP → APK
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload your project ZIP and build an APK.
            </p>
          </div>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-purple-500/30 active:scale-98 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Start Now</span>
          </button>
        </div>

        {/* 3. PWA -> APK */}
        <div
          onClick={() => onSelectMethod("pwa")}
          className="group relative flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-b from-emerald-50 via-teal-50/40 to-white dark:from-slate-800/90 dark:via-slate-850 dark:to-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/images/icon-pwa-3d.png"
                alt="PWA to APK"
                fill
                className="object-contain"
              />
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-100/70 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3 space-y-1">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
              PWA → APK
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Convert your PWA to a Trusted Web Activity (TWA).
            </p>
          </div>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/30 active:scale-98 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Start Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
