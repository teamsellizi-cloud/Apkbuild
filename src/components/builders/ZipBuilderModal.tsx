"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { AppCustomization, ZipAnalysisResult } from "@/types";
import { AppCustomizationForm } from "./AppCustomizationForm";
import { LivePhonePreview } from "./LivePhonePreview";
import {
  UploadCloud,
  FileArchive,
  ArrowRight,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Package,
} from "lucide-react";

interface ZipBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBuild: (formData: FormData) => Promise<void>;
}

export const ZipBuilderModal: React.FC<ZipBuilderModalProps> = ({
  isOpen,
  onClose,
  onStartBuild,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ZipAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const [config, setConfig] = useState<AppCustomization>({
    appName: "My Zip App",
    packageId: "com.app.zipapp",
    versionName: "1.0.0",
    versionCode: 1,
    splashBgColor: "#0f172a",
    splashShowSpinner: true,
    splashDurationMs: 2000,
    statusBarColor: "#1e293b",
    navBarColor: "#0f172a",
    themeColor: "#8b5cf6",
    orientation: "portrait",
    fullscreen: false,
    cleartextTraffic: false,
    permissions: {
      internet: true,
      camera: false,
      geolocation: false,
      storage: false,
      microphone: false,
      notifications: true,
      biometrics: false,
    },
  });

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setErrorMessage("Please select a valid .zip archive file.");
      return;
    }

    setSelectedFile(file);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze/zip", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.analysis) {
        setAnalysis(data.analysis);
        if (data.analysis.isSafe && !data.analysis.error) {
          // Pre-populate app name from file name
          const cleanName = file.name.replace(/\.zip$/i, "").replace(/[-_]/g, " ");
          const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
          setConfig((prev) => ({
            ...prev,
            appName: capitalized,
            packageId: `com.app.${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          }));
        } else {
          setErrorMessage(data.analysis.error || "ZIP validation issue detected.");
        }
      } else {
        setErrorMessage(data.error || "Failed to analyze ZIP file.");
      }
    } catch {
      setErrorMessage("Network error while inspecting ZIP file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBuild = async () => {
    if (!selectedFile) {
      setErrorMessage("Please upload a ZIP file first.");
      return;
    }

    setIsBuilding(true);
    try {
      const formData = new FormData();
      formData.append("zipFile", selectedFile);
      formData.append("appName", config.appName);
      formData.append("packageId", config.packageId);
      formData.append("versionName", config.versionName);
      formData.append("versionCode", String(config.versionCode));
      formData.append("buildType", "zip");
      formData.append("config", JSON.stringify(config));

      await onStartBuild(formData);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-indigo-50/20 dark:from-slate-800 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shrink-0">
              <Image
                src="/images/icon-zip-3d.png"
                alt="ZIP to APK"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                ZIP Source → Android APK
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safe Extraction & Native Bundling
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
          {/* ZIP Dropzone */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800/80 bg-purple-50/40 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-slate-800/80 transition-all text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedFile ? selectedFile.name : "Tap or Drag & Drop Project ZIP file here"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports static HTML/CSS/JS, Vite, React, Vue, Next static export (Max 50MB)
              </p>
            </div>

            {isAnalyzing && (
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Scanning ZIP archive (path traversal, zip bomb, framework check)...</span>
              </div>
            )}

            {/* Analysis Results Box */}
            {analysis && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Security & Project Structure Scan
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    Safe to build
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Framework</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {analysis.frameworkDetected || "Static HTML"}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Total Files</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {analysis.fileCount} files
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Size</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {(analysis.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Package Manager</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {analysis.packageManager.toUpperCase()}
                    </span>
                  </div>
                </div>

                {analysis.buildCommand && (
                  <div className="p-2 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Build step: {analysis.buildCommand}</span>
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Form & Mockup Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <AppCustomizationForm
                config={config}
                onChange={setConfig}
                buildType="zip"
              />
            </div>

            <div className="lg:col-span-5 flex justify-center sticky top-2">
              <LivePhonePreview
                config={config}
                buildType="zip"
                frameworkDetected={analysis?.frameworkDetected}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Output: <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{config.packageId}</span>
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
              disabled={isBuilding || !selectedFile}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-purple-500/20 active:scale-98 transition-all disabled:opacity-50"
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
