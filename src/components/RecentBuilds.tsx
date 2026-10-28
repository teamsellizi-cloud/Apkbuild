"use client";

import React from "react";
import {
  Globe,
  Code,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  RotateCw,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { BuildType, BuildStatus } from "@/types";

export interface BuildSummary {
  id: string;
  appName: string;
  packageId: string;
  versionName: string;
  buildType: BuildType;
  status: BuildStatus;
  progressPercent: number;
  currentStep?: string;
  errorMessage?: string;
  createdAt: string | Date;
  completedAt?: string | Date;
  apkFileName?: string;
  apkFileSize?: number;
  hasApk?: boolean;
}

interface RecentBuildsProps {
  builds: BuildSummary[];
  onViewAll: () => void;
  onSelectBuild: (buildId: string) => void;
  onDownloadApk: (buildId: string, e: React.MouseEvent) => void;
  onRetryBuild: (buildId: string, e: React.MouseEvent) => void;
  onCancelBuild: (buildId: string, e: React.MouseEvent) => void;
}

export const RecentBuilds: React.FC<RecentBuildsProps> = ({
  builds,
  onViewAll,
  onSelectBuild,
  onDownloadApk,
  onRetryBuild,
  onCancelBuild,
}) => {
  const formatDate = (dateInput: string | Date) => {
    try {
      const d = new Date(dateInput);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const day = d.getDate();
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return `${month} ${day}, ${year} • ${hours}:${mins}`;
    } catch {
      return "Oct 27, 2026 • 14:32";
    }
  };

  const getBuildIcon = (type: BuildType) => {
    switch (type) {
      case "website":
        return (
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/30">
            <Globe className="w-5 h-5" />
          </div>
        );
      case "zip":
        return (
          <div className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-purple-500/30">
            <Code className="w-5 h-5" />
          </div>
        );
      case "pwa":
        return (
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/30">
            <span className="font-black text-xs tracking-tighter">PWA</span>
          </div>
        );
    }
  };

  const getTypeBadge = (type: BuildType) => {
    switch (type) {
      case "website":
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
            Website
          </span>
        );
      case "zip":
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
            ZIP
          </span>
        );
      case "pwa":
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            PWA
          </span>
        );
    }
  };

  const getStatusBadge = (status: BuildStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
            <span>Completed</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-600 fill-rose-100 dark:fill-rose-950" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const recentList = builds.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Recent Builds
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Build Cards List */}
      {recentList.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-dashed border-slate-200 dark:border-slate-700 text-center">
          <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-70" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No builds yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose any conversion action above to build your first real APK.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentList.map((build) => {
            const isCompleted = build.status === "completed";
            const isFailed = build.status === "failed";
            const isPending = !isCompleted && !isFailed;

            return (
              <div
                key={build.id}
                onClick={() => onSelectBuild(build.id)}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 shadow-sm shadow-slate-200/30 dark:shadow-none hover:border-blue-200 dark:hover:border-slate-600 transition-all cursor-pointer gap-3 sm:gap-4"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {getBuildIcon(build.buildType)}

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {build.appName}
                      </h4>
                      {getTypeBadge(build.buildType)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                      {build.packageId}
                    </p>
                  </div>
                </div>

                {/* Right: Status Pill, Date & Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pl-14 sm:pl-0">
                  <div className="text-left sm:text-right space-y-0.5">
                    <div>{getStatusBadge(build.status)}</div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {formatDate(build.createdAt)}
                    </p>
                  </div>

                  {/* Action Button */}
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={(e) => onDownloadApk(build.id, e)}
                      title="Download APK"
                      className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  {isFailed && (
                    <button
                      type="button"
                      onClick={(e) => onRetryBuild(build.id, e)}
                      title="Retry Build"
                      className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  )}

                  {isPending && (
                    <button
                      type="button"
                      onClick={(e) => onCancelBuild(build.id, e)}
                      title="Cancel Build"
                      className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
