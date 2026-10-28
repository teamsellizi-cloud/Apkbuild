"use client";

import React, { useState } from "react";
import { BuildSummary } from "../RecentBuilds";
import {
  Search,
  Filter,
  Download,
  RotateCw,
  Trash2,
  Terminal,
  Globe,
  Code,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { BuildType, BuildStatus } from "@/types";

interface HistoryTabProps {
  builds: BuildSummary[];
  onSelectBuild: (buildId: string) => void;
  onDownloadApk: (buildId: string, e: React.MouseEvent) => void;
  onRetryBuild: (buildId: string, e: React.MouseEvent) => void;
  onDeleteBuild: (buildId: string, e: React.MouseEvent) => void;
  onOpenNewBuild: (type: "website" | "zip" | "pwa") => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  builds,
  onSelectBuild,
  onDownloadApk,
  onRetryBuild,
  onDeleteBuild,
  onOpenNewBuild,
}) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filtered = builds.filter((b) => {
    const matchesSearch =
      b.appName.toLowerCase().includes(search.toLowerCase()) ||
      b.packageId.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === "all" || b.buildType === selectedType;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "pending"
        ? b.status !== "completed" && b.status !== "failed"
        : b.status === selectedStatus);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getBuildIcon = (type: BuildType) => {
    switch (type) {
      case "website":
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/20">
            <Globe className="w-5 h-5" />
          </div>
        );
      case "zip":
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-purple-500/20">
            <Code className="w-5 h-5" />
          </div>
        );
      case "pwa":
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/20 font-black text-xs">
            PWA
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Build History & Artifacts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, download signed APKs, and inspect terminal build logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNewBuild("website")}
            className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            + New Build
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by app name or package ID (e.g. com.mysite.app)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] mr-1">Type:</span>
          {["all", "website", "zip", "pwa"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all capitalize ${
                selectedType === type
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {type}
            </button>
          ))}

          <span className="text-slate-400 font-semibold text-[11px] ml-2 mr-1">Status:</span>
          {["all", "completed", "failed", "pending"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all capitalize ${
                selectedStatus === status
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Build Cards List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-2">
          <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No builds matched your filter</h4>
          <p className="text-xs text-slate-400">Try adjusting your search terms or filters above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((build) => {
            const isCompleted = build.status === "completed";
            const isFailed = build.status === "failed";
            const isPending = !isCompleted && !isFailed;

            return (
              <div
                key={build.id}
                onClick={() => onSelectBuild(build.id)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 hover:border-blue-200 dark:hover:border-slate-600 shadow-sm transition-all cursor-pointer gap-4"
              >
                {/* Left Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {getBuildIcon(build.buildType)}

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {build.appName}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        v{build.versionName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                      {build.packageId}
                    </p>
                  </div>
                </div>

                {/* Right Status & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-13 sm:pl-0">
                  <div className="text-left sm:text-right">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    ) : isFailed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Failed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>In Progress</span>
                      </span>
                    )}
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(build.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={(e) => onDownloadApk(build.id, e)}
                        title="Download Signed APK"
                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    {isFailed && (
                      <button
                        type="button"
                        onClick={(e) => onRetryBuild(build.id, e)}
                        title="Retry Compilation"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBuild(build.id);
                      }}
                      title="View Build Logs"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                    >
                      <Terminal className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => onDeleteBuild(build.id, e)}
                      title="Delete Build"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
