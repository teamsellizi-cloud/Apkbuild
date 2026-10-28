"use client";

import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";

export const HeroCard: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50/90 via-blue-50/70 to-indigo-50/50 dark:from-slate-800/90 dark:via-slate-850 dark:to-blue-950/40 border border-sky-100/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm shadow-blue-500/5">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-sky-200/40 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-blue-300/30 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left Column Content */}
        <div className="flex-1 text-left space-y-3.5 max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/90 dark:bg-blue-900/60 border border-blue-200/70 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-tight">
            <span>Build Real Android Apps</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Turn Your Web Content into{" "}
            <span className="text-blue-600 dark:text-blue-400">Real Android APKs</span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            Convert websites, ZIP files or PWA URLs into installable Android apps — all from your phone.
          </p>

          {/* 3 Pill Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm shadow-blue-600/20">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Fast & Simple</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm shadow-blue-600/20">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Secure</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm shadow-blue-600/20">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>100% Free</span>
            </div>
          </div>
        </div>

        {/* Right Column 3D Graphic */}
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center shrink-0">
          <div className="relative w-full h-full drop-shadow-xl hover:scale-102 transition-transform duration-300">
            <Image
              src="/images/hero-3d-android.png"
              alt="3D Android Phone with APK download"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};
