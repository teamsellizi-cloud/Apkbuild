"use client";

import React from "react";
import { Box, CheckCircle2, XCircle, Clock } from "lucide-react";

interface StatsRowProps {
  stats: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
  };
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Builds */}
      <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 shrink-0">
          <Box className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Builds
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {stats.total}
          </p>
        </div>
      </div>

      {/* 2. Successful */}
      <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30 shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            Successful
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {stats.successful}
          </p>
        </div>
      </div>

      {/* 3. Failed */}
      <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-500/30 shrink-0">
          <XCircle className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            Failed
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {stats.failed}
          </p>
        </div>
      </div>

      {/* 4. Pending */}
      <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 shadow-sm shadow-slate-200/40 dark:shadow-none">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/30 shrink-0">
          <Clock className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            Pending
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
            {stats.pending}
          </p>
        </div>
      </div>
    </div>
  );
};
