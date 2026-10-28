"use client";

import React from "react";
import { ShieldCheck, Heart, Lock } from "lucide-react";

export const FooterNotice: React.FC = () => {
  return (
    <footer className="pt-4 pb-20 sm:pb-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 py-3 px-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-medium">
            Your data is private. Only you can access your builds and files.
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>Powered by open source</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </div>
      </div>
    </footer>
  );
};
