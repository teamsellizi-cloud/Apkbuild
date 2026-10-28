"use client";

import React from "react";
import Image from "next/image";
import { User, Sun, Moon, ShieldCheck, LogIn, LogOut } from "lucide-react";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  user: { email: string } | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  user,
  onOpenLogin,
  onLogout,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left group transition-transform active:scale-98"
        >
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-sm shadow-blue-500/20 group-hover:shadow-md group-hover:shadow-blue-500/30 transition-shadow">
            <Image
              src="/images/app-logo-3d.png"
              alt="APK Builder"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400 font-sans">
                APK Builder
              </h1>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide flex items-center gap-1">
              <span>Web → APK</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>ZIP → APK</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>PWA → APK</span>
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* User Profile / Login */}
          {user ? (
            <div className="relative group">
              <button
                onClick={onLogout}
                title={`Logged in as ${user.email} (Tap to logout)`}
                className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors relative"
              >
                <User className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              title="Single-User Login"
            >
              <User className="w-5 h-5" />
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
