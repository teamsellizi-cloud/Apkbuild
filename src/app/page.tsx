"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroCard } from "@/components/HeroCard";
import { QuickActions } from "@/components/QuickActions";
import { StatsRow } from "@/components/StatsRow";
import { RecentBuilds, BuildSummary } from "@/components/RecentBuilds";
import { FooterNotice } from "@/components/FooterNotice";
import { BottomNav, NavTab } from "@/components/BottomNav";

// Modals & Builders
import { WebsiteBuilderModal } from "@/components/builders/WebsiteBuilderModal";
import { ZipBuilderModal } from "@/components/builders/ZipBuilderModal";
import { PwaBuilderModal } from "@/components/builders/PwaBuilderModal";
import { BuildProgressModal } from "@/components/modals/BuildProgressModal";
import { LoginModal } from "@/components/modals/LoginModal";

// Secondary Tabs
import { HistoryTab } from "@/components/tabs/HistoryTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";

import { AppCustomization } from "@/types";
import { Globe, Code, Sparkles, Plus, ArrowRight } from "lucide-react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [user, setUser] = useState<{ email: string } | null>(null);

  // Builds and Stats State
  const [builds, setBuilds] = useState<BuildSummary[]>([]);
  const [stats, setStats] = useState({
    total: 12,
    successful: 10,
    failed: 1,
    pending: 1,
  });

  // Modals State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeBuilder, setActiveBuilder] = useState<"website" | "zip" | "pwa" | null>(null);
  const [activeProgressBuildId, setActiveProgressBuildId] = useState<string | null>(null);

  // Sync dark mode class on HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Check current session
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // Fetch builds & stats
  const fetchBuildsData = useCallback(async () => {
    try {
      const res = await fetch("/api/builds");
      const data = await res.json();
      if (data.success) {
        if (data.builds) setBuilds(data.builds);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchBuildsData();

    // Auto-refresh builds every 6 seconds
    const interval = setInterval(fetchBuildsData, 6000);
    return () => clearInterval(interval);
  }, [checkAuth, fetchBuildsData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch {
      // Ignore
    }
  };

  // Start Website Build
  const handleStartWebsiteBuild = async (payload: {
    appName: string;
    packageId: string;
    versionName: string;
    versionCode: number;
    buildType: "website";
    sourceUrl: string;
    config: AppCustomization;
  }) => {
    const res = await fetch("/api/builds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success && data.buildId) {
      setActiveBuilder(null);
      setActiveProgressBuildId(data.buildId);
      fetchBuildsData();
    } else {
      alert(data.error || "Failed to start build.");
    }
  };

  // Start ZIP Build
  const handleStartZipBuild = async (formData: FormData) => {
    const res = await fetch("/api/builds", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success && data.buildId) {
      setActiveBuilder(null);
      setActiveProgressBuildId(data.buildId);
      fetchBuildsData();
    } else {
      alert(data.error || "Failed to start build.");
    }
  };

  // Start PWA Build
  const handleStartPwaBuild = async (payload: {
    appName: string;
    packageId: string;
    versionName: string;
    versionCode: number;
    buildType: "pwa" | "website";
    sourceUrl: string;
    config: AppCustomization;
    manifestJson?: string;
  }) => {
    const res = await fetch("/api/builds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success && data.buildId) {
      setActiveBuilder(null);
      setActiveProgressBuildId(data.buildId);
      fetchBuildsData();
    } else {
      alert(data.error || "Failed to start build.");
    }
  };

  // Handle Download APK
  const handleDownloadApk = async (buildId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/builds/${buildId}/token`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.downloadUrl) {
        window.location.href = data.downloadUrl;
      } else {
        // Fallback open progress modal
        setActiveProgressBuildId(buildId);
      }
    } catch {
      setActiveProgressBuildId(buildId);
    }
  };

  // Handle Retry Build
  const handleRetryBuild = async (buildId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/builds/${buildId}/retry`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActiveProgressBuildId(buildId);
        fetchBuildsData();
      } else {
        alert(data.error || "Retry failed");
      }
    } catch {
      alert("Network error retrying build");
    }
  };

  // Handle Cancel Build
  const handleCancelBuild = async (buildId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/builds/${buildId}/cancel`, { method: "POST" });
      fetchBuildsData();
    } catch {
      // Ignore
    }
  };

  // Handle Delete Build
  const handleDeleteBuild = async (buildId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this build record and APK artifact?")) return;
    try {
      await fetch(`/api/builds/${buildId}`, { method: "DELETE" });
      fetchBuildsData();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Application Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onNavigateHome={() => setActiveTab("home")}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 space-y-6">
        {/* TAB 1: HOME (Exact match to provided screenshot) */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Hero Banner */}
            <HeroCard />

            {/* Quick Actions (3 Conversion Cards) */}
            <QuickActions onSelectMethod={(method) => setActiveBuilder(method)} />

            {/* Statistics Row */}
            <StatsRow stats={stats} />

            {/* Recent Builds List */}
            <RecentBuilds
              builds={builds}
              onViewAll={() => setActiveTab("history")}
              onSelectBuild={(buildId) => setActiveProgressBuildId(buildId)}
              onDownloadApk={handleDownloadApk}
              onRetryBuild={handleRetryBuild}
              onCancelBuild={handleCancelBuild}
            />

            {/* Footer Privacy Notice */}
            <FooterNotice />
          </div>
        )}

        {/* TAB 2: BUILDERS */}
        {activeTab === "builders" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                APK Conversion Hub
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your source material to build a signed, installable Android APK.
              </p>
            </div>

            <QuickActions onSelectMethod={(method) => setActiveBuilder(method)} />

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Need help choosing a conversion method?</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3 rounded-2xl bg-sky-50/60 dark:bg-slate-900 border border-sky-100 dark:border-slate-800">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Website URL</span>
                  Best for existing websites or web apps hosted online with HTTPS. Fast 2-minute build.
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-slate-900 border border-purple-100 dark:border-slate-800">
                  <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">Project ZIP</span>
                  Best for local HTML/CSS/JS folders, React, Vite, or Vue static dist files that run completely offline.
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">PWA / TWA</span>
                  Best for verified Progressive Web Apps with Service Workers and 512x512 icons for Google Play store.
                </div>
              </div>
            </div>

            <FooterNotice />
          </div>
        )}

        {/* TAB 3: HISTORY & DOWNLOADS */}
        {activeTab === "history" && (
          <div className="animate-fadeIn">
            <HistoryTab
              builds={builds}
              onSelectBuild={(buildId) => setActiveProgressBuildId(buildId)}
              onDownloadApk={handleDownloadApk}
              onRetryBuild={handleRetryBuild}
              onDeleteBuild={handleDeleteBuild}
              onOpenNewBuild={(type) => setActiveBuilder(type)}
            />
            <div className="mt-8">
              <FooterNotice />
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === "settings" && (
          <div className="animate-fadeIn">
            <SettingsTab
              user={user}
              onLogout={handleLogout}
            />
            <div className="mt-8">
              <FooterNotice />
            </div>
          </div>
        )}
      </main>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Website Builder Modal */}
      <WebsiteBuilderModal
        isOpen={activeBuilder === "website"}
        onClose={() => setActiveBuilder(null)}
        onStartBuild={handleStartWebsiteBuild}
      />

      {/* ZIP Builder Modal */}
      <ZipBuilderModal
        isOpen={activeBuilder === "zip"}
        onClose={() => setActiveBuilder(null)}
        onStartBuild={handleStartZipBuild}
      />

      {/* PWA Builder Modal */}
      <PwaBuilderModal
        isOpen={activeBuilder === "pwa"}
        onClose={() => setActiveBuilder(null)}
        onStartBuild={handleStartPwaBuild}
      />

      {/* Live Build Progress & Log Terminal Modal */}
      <BuildProgressModal
        buildId={activeProgressBuildId}
        isOpen={Boolean(activeProgressBuildId)}
        onClose={() => setActiveProgressBuildId(null)}
        onRefreshList={fetchBuildsData}
      />

      {/* Single-User Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
